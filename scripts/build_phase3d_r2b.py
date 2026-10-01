#!/usr/bin/env python3
"""Build the Phase 3D-R2B temporal layer from reviewed R2A chronology only."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import tempfile
from pathlib import Path
from typing import Any

try:
    from scripts.validate_authoring_framework import schema_errors, validate_schema_contract
except ModuleNotFoundError:  # pragma: no cover - direct script execution
    from validate_authoring_framework import schema_errors, validate_schema_contract


ROOT = Path(__file__).resolve().parents[1]
R2A_CHRONOLOGY = ROOT / "work" / "phase3d_r2" / "chronology" / "campaign_chronology.jsonl"
R2B_ROOT = ROOT / "work" / "phase3d_r2b"
EVENT_SCHEMA_PATH = ROOT / "schema" / "r2b_campaign_event.schema.json"
INDEX_SCHEMA_PATH = ROOT / "schema" / "r2b_character_temporal_index.schema.json"
CROSSWALK_SCHEMA_PATH = ROOT / "schema" / "r2b_canon_layer_crosswalk.schema.json"
INPUT_MANIFEST_PATH = R2B_ROOT / "reviewed_inputs" / "authoritative_input_manifest.json"
CROSSWALK_PATH = R2B_ROOT / "reviewed_inputs" / "canon_layer_crosswalk.json"
APPROVED_CANDIDATES = ROOT / "work" / "phase3d" / "approved_candidates"
REPAIRED_CANDIDATES = ROOT / "work" / "phase3d_recall" / "repaired_candidates"


class SchemaDefectError(RuntimeError):
    """The proposed schema cannot represent the authoritative R2A events."""


class DerivedOutputMismatch(RuntimeError):
    """A derived R2B artifact differs from a fresh deterministic derivation."""


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def load_json(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(payload, dict):
        raise ValueError(f"{path}: expected a JSON object")
    return payload


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), 1):
        if not line.strip():
            continue
        payload = json.loads(line)
        if not isinstance(payload, dict):
            raise ValueError(f"{path}:{line_number}: expected a JSON object")
        records.append(payload)
    return records


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def render_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n"


def render_jsonl(records: list[dict[str, Any]]) -> str:
    return "".join(canonical_json(record) + "\n" for record in records)


def atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            newline="\n",
            delete=False,
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
        ) as handle:
            handle.write(text)
            temporary_path = Path(handle.name)
        os.replace(temporary_path, path)
    finally:
        if temporary_path is not None and temporary_path.exists():
            temporary_path.unlink()


def semantic_equal(left: Any, right: Any) -> bool:
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return left.keys() == right.keys() and all(
            semantic_equal(left[key], right[key]) for key in left
        )
    if isinstance(left, list):
        return len(left) == len(right) and all(
            semantic_equal(left_item, right_item)
            for left_item, right_item in zip(left, right)
        )
    return left == right


def verify_frozen_manifest(
    manifest_path: Path = INPUT_MANIFEST_PATH,
    root: Path = ROOT,
) -> dict[str, Any]:
    manifest = load_json(manifest_path)
    errors: list[str] = []
    for item in manifest.get("files", []):
        path = root / item["path"]
        if not path.is_file():
            errors.append(f"missing authoritative input: {item['path']}")
            continue
        actual = sha256_file(path)
        if actual != item["sha256"]:
            errors.append(
                f"authoritative input hash mismatch: {item['path']} "
                f"expected={item['sha256']} actual={actual}"
            )
    if errors:
        raise ValueError("\n".join(errors))
    return manifest


def load_authoritative_events(
    chronology_path: Path = R2A_CHRONOLOGY,
) -> list[dict[str, Any]]:
    return load_jsonl(chronology_path)


def validate_event_records(
    events: list[dict[str, Any]],
    schema: dict[str, Any],
) -> list[dict[str, Any]]:
    validate_schema_contract("r2b_campaign_event", schema)
    defects: list[dict[str, Any]] = []
    for index, event in enumerate(events):
        for error in schema_errors(event, schema):
            defects.append(
                {
                    "event_id": event.get("event_id", "<missing>"),
                    "input_line": index + 1,
                    "error": error,
                }
            )
    return defects


def semantic_round_trip(
    events: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    normalized: list[dict[str, Any]] = []
    differences: list[dict[str, Any]] = []
    for index, event in enumerate(events):
        reparsed = json.loads(canonical_json(event))
        normalized.append(reparsed)
        if not semantic_equal(event, reparsed):
            differences.append(
                {
                    "event_id": event.get("event_id", "<missing>"),
                    "input_line": index + 1,
                    "error": "semantic round-trip inequality",
                }
            )
    return normalized, differences


def blocker_payload(defects: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "phase": "3D-R2B",
        "status": "R2B_SCHEMA_DEFECT_BEFORE_MIGRATION",
        "defect_count": len(defects),
        "defects": defects,
        "migration_outputs_written": False,
    }


def derivation_payload(
    normalized_text: str,
    event_schema_path: Path,
    chronology_path: Path,
) -> dict[str, Any]:
    return {
        "schema_version": "R2B-1",
        "phase": "3D-R2B",
        "derived_only": True,
        "authority": {
            "path": "work/phase3d_r2/chronology/campaign_chronology.jsonl",
            "sha256": sha256_file(chronology_path),
        },
        "derivation_rule": "Deterministic 1:1 JSON derivation; never an authoring input.",
        "event_schema": {
            "path": "schema/r2b_campaign_event.schema.json",
            "sha256": sha256_file(event_schema_path),
        },
        "normalized_store": {
            "path": "work/phase3d_r2b/normalized/campaign_events.jsonl",
            "sha256": sha256_bytes(normalized_text.encode("utf-8")),
        },
        "record_count": normalized_text.count("\n"),
    }


def schema_compatibility_markdown(record_count: int) -> str:
    return "\n".join(
        [
            "# R2B Schema 兼容性报告",
            "",
            "- 状态：`PASS`",
            f"- R2A 事件记录：{record_count}",
            f"- Schema 验证通过：{record_count}",
            "- Schema defect：0",
            "- 结论：全部 R2A 事件均可在不改名、不删字段的条件下表示。",
            "",
            "该结论仅允许生成确定性派生层，不把 R2B store 提升为第二权威源。",
            "",
        ]
    )


def derive_normalized_payloads(
    event_schema_path: Path = EVENT_SCHEMA_PATH,
    chronology_path: Path = R2A_CHRONOLOGY,
) -> tuple[list[dict[str, Any]], str, dict[str, Any], dict[str, Any]]:
    events = load_authoritative_events(chronology_path)
    schema = load_json(event_schema_path)
    defects = validate_event_records(events, schema)
    if defects:
        raise SchemaDefectError(canonical_json(blocker_payload(defects)))
    normalized, differences = semantic_round_trip(events)
    if differences:
        raise SchemaDefectError(canonical_json(blocker_payload(differences)))
    normalized_text = render_jsonl(normalized)
    derivation = derivation_payload(normalized_text, event_schema_path, chronology_path)
    report = {
        "phase": "3D-R2B",
        "status": "R2B_NORMALIZED_STORE_READY_FOR_INDEXING",
        "input_events": len(events),
        "schema_valid_events": len(events),
        "semantic_round_trip_equal": len(events),
        "semantic_round_trip_differences": 0,
        "event_ids_preserved": [event["event_id"] for event in events]
        == [event["event_id"] for event in normalized],
        "story_axes_preserved": [event["story_axis"] for event in events]
        == [event["story_axis"] for event in normalized],
        "revelation_count": sum(len(event["character_revelations"]) for event in events),
        "derived_only": True,
    }
    return normalized, normalized_text, derivation, report


def write_schema_defect_report(output_root: Path, error: SchemaDefectError) -> None:
    try:
        payload = json.loads(str(error))
    except json.JSONDecodeError:
        payload = blocker_payload([{"error": str(error)}])
    atomic_write_text(output_root / "reports" / "schema_defects.json", render_json(payload))


def build_normalized_store(
    output_root: Path = R2B_ROOT,
    event_schema_path: Path = EVENT_SCHEMA_PATH,
    chronology_path: Path = R2A_CHRONOLOGY,
    manifest_path: Path = INPUT_MANIFEST_PATH,
) -> dict[str, Any]:
    verify_frozen_manifest(manifest_path)
    try:
        _, normalized_text, derivation, report = derive_normalized_payloads(
            event_schema_path=event_schema_path,
            chronology_path=chronology_path,
        )
    except SchemaDefectError as error:
        write_schema_defect_report(output_root, error)
        raise

    atomic_write_text(output_root / "normalized" / "campaign_events.jsonl", normalized_text)
    atomic_write_text(
        output_root / "normalized" / "derivation_manifest.json",
        render_json(derivation),
    )
    atomic_write_text(
        output_root / "reports" / "schema_compatibility_report.md",
        schema_compatibility_markdown(report["input_events"]),
    )
    atomic_write_text(
        output_root / "reports" / "lossless_migration_report.json",
        render_json(report),
    )
    return report


def check_normalized_store(
    output_root: Path = R2B_ROOT,
    event_schema_path: Path = EVENT_SCHEMA_PATH,
    chronology_path: Path = R2A_CHRONOLOGY,
    manifest_path: Path = INPUT_MANIFEST_PATH,
) -> dict[str, Any]:
    verify_frozen_manifest(manifest_path)
    _, normalized_text, derivation, report = derive_normalized_payloads(
        event_schema_path=event_schema_path,
        chronology_path=chronology_path,
    )
    expected = {
        output_root / "normalized" / "campaign_events.jsonl": normalized_text,
        output_root / "normalized" / "derivation_manifest.json": render_json(derivation),
    }
    mismatches: list[str] = []
    for path, expected_text in expected.items():
        if not path.is_file():
            mismatches.append(f"missing derived output: {path}")
        elif path.read_text(encoding="utf-8") != expected_text:
            mismatches.append(f"derived output differs from R2A derivation: {path}")
    if mismatches:
        raise DerivedOutputMismatch("\n".join(mismatches))
    return report


def load_reviewed_profile_population(root: Path = ROOT) -> dict[str, str]:
    population: dict[str, str] = {}
    source_roots = [
        root / "work" / "phase3d" / "approved_candidates",
        root / "work" / "phase3d_recall" / "repaired_candidates",
    ]
    for source_root in source_roots:
        for path in sorted(source_root.glob("*.json")):
            profile = load_json(path)
            profile_id = profile.get("id")
            if not isinstance(profile_id, str):
                raise ValueError(f"{path}: missing profile id")
            population[profile_id] = path.relative_to(root).as_posix()
    if len(population) != 36:
        raise ValueError(f"reviewed profile population must contain 36 IDs, found {len(population)}")
    return dict(sorted(population.items()))


def crosswalk_mapping(
    crosswalk_path: Path = CROSSWALK_PATH,
    schema_path: Path = CROSSWALK_SCHEMA_PATH,
) -> dict[str, dict[str, str]]:
    crosswalk = load_json(crosswalk_path)
    schema = load_json(schema_path)
    validate_schema_contract("r2b_canon_layer_crosswalk", schema)
    errors = schema_errors(crosswalk, schema)
    if errors:
        raise ValueError("invalid Canon-layer crosswalk:\n" + "\n".join(errors))
    mapping = {
        item["source_canon_layer"]: item
        for item in crosswalk["mappings"]
    }
    if len(mapping) != len(crosswalk["mappings"]):
        raise ValueError("duplicate source Canon layer in crosswalk")
    return mapping


def ordered_unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(values))


def build_temporal_indexes(
    events: list[dict[str, Any]],
    profiles: dict[str, str],
    layer_mapping: dict[str, dict[str, str]],
) -> list[dict[str, Any]]:
    indexes: list[dict[str, Any]] = []
    for profile_id, source_path in sorted(profiles.items()):
        links: list[dict[str, Any]] = []
        for event in events:
            participant_roles = ordered_unique(
                [
                    participant["role"]
                    for participant in event["participants"]
                    if participant.get("character_ref") == profile_id
                ]
            )
            revelation_ids = ordered_unique(
                [
                    revelation["revelation_id"]
                    for revelation in event["character_revelations"]
                    if revelation.get("character_ref") == profile_id
                ]
            )
            if not participant_roles and not revelation_ids:
                continue
            source_layer = event["canon_layer"]
            if source_layer not in layer_mapping:
                raise ValueError(f"unmapped event Canon layer: {source_layer}")
            layer_rule = layer_mapping[source_layer]
            source_temporal_scope = event["story_axis"]["temporal_scope"]
            if source_temporal_scope != layer_rule["source_story_temporal_scope"]:
                raise ValueError(
                    f"{event['event_id']}: story temporal scope {source_temporal_scope!r} "
                    f"does not match crosswalk {layer_rule['source_story_temporal_scope']!r}"
                )
            link_basis: list[str] = []
            if participant_roles:
                link_basis.append("participant_ref")
            if revelation_ids:
                link_basis.append("revelation_subject")
            links.append(
                {
                    "event_id": event["event_id"],
                    "story_order_start": event["story_axis"]["story_order_start"],
                    "story_order_end": event["story_axis"]["story_order_end"],
                    "source_canon_layer": source_layer,
                    "source_story_temporal_scope": source_temporal_scope,
                    "profile_canon_layer": layer_rule["profile_canon_layer"],
                    "participant_roles": participant_roles,
                    "revelation_ids": revelation_ids,
                    "link_basis": link_basis,
                }
            )
        indexes.append(
            {
                "schema_version": "R2B-1",
                "phase": "3D-R2B",
                "profile_id": profile_id,
                "profile_candidate_source": source_path,
                "event_links": links,
                "notes": "R2B mechanical exact-reference index only; no R2C semantic migration.",
            }
        )
    return indexes


def validate_temporal_indexes(
    indexes: list[dict[str, Any]],
    schema_path: Path = INDEX_SCHEMA_PATH,
) -> list[str]:
    schema = load_json(schema_path)
    validate_schema_contract("r2b_character_temporal_index", schema)
    return [
        f"{index['profile_id']}: {error}"
        for index in indexes
        for error in schema_errors(index, schema)
    ]


def unresolved_label_markdown(events: list[dict[str, Any]]) -> str:
    occurrences: list[dict[str, str]] = []
    for event in events:
        for participant in event["participants"]:
            if "character_label" in participant:
                occurrences.append(
                    {
                        "label": participant["character_label"],
                        "event_id": event["event_id"],
                        "basis": f"participant role={participant['role']}",
                    }
                )
        for revelation in event["character_revelations"]:
            if "character_label" in revelation:
                occurrences.append(
                    {
                        "label": revelation["character_label"],
                        "event_id": event["event_id"],
                        "basis": f"revelation={revelation['revelation_id']}",
                    }
                )
    lines = [
        "# R2B 未解析 character label",
        "",
        "这些记录只保留 R2A 明示 label；R2B 未把任何 label 推断为正式 profile ID。",
        "",
        "杨的已审核 discovery 位于 `work/phase3d_r2/character_discoveries/CHARACTER_YANG.json`；其 patch 仍未批准，因此本阶段不创建 `NPC_YANG`。",
        "",
        "| Label | Event | Mechanical basis |",
        "| --- | --- | --- |",
    ]
    lines.extend(
        f"| {item['label']} | `{item['event_id']}` | {item['basis']} |"
        for item in occurrences
    )
    lines.extend(["", f"共 {len(occurrences)} 个 label occurrence。", ""])
    return "\n".join(lines)


def recursive_keys(value: Any) -> set[str]:
    if isinstance(value, dict):
        keys = set(value)
        for child in value.values():
            keys.update(recursive_keys(child))
        return keys
    if isinstance(value, list):
        keys: set[str] = set()
        for child in value:
            keys.update(recursive_keys(child))
        return keys
    return set()


def final_gate_result(
    normalized_report: dict[str, Any],
    indexes: list[dict[str, Any]],
) -> dict[str, Any]:
    forbidden_r2c_fields = {
        "background",
        "timeline",
        "relationship_timeline",
        "knowledge_timeline",
        "ability_status_timeline",
        "current_state",
        "character_consequences",
        "relationship_consequences",
        "knowledge_consequences",
        "ability_status_consequences",
        "routing",
    }
    all_index_keys = recursive_keys(indexes)
    gates = {
        "authoritative_inputs_frozen": "PASS",
        "event_schema_compatible": (
            "PASS" if normalized_report["schema_valid_events"] == 66 else "FAIL"
        ),
        "semantic_round_trip": (
            "PASS"
            if normalized_report["semantic_round_trip_equal"] == 66
            and normalized_report["semantic_round_trip_differences"] == 0
            else "FAIL"
        ),
        "derived_only_authority": "PASS" if normalized_report["derived_only"] else "FAIL",
        "canon_layer_crosswalk": "PASS",
        "mechanical_indexes_only": "PASS" if len(indexes) == 36 else "FAIL",
        "r2c_semantic_migration_absent": (
            "PASS" if not (all_index_keys & forbidden_r2c_fields) else "FAIL"
        ),
    }
    result = dict(normalized_report)
    result.update(
        {
            "status": (
                "R2B_NORMALIZED_TEMPORAL_SCHEMA_READY_FOR_REVIEW"
                if all(value == "PASS" for value in gates.values())
                else "R2B_BLOCKED"
            ),
            "gates": gates,
            "temporal_index_count": len(indexes),
            "temporal_event_link_count": sum(len(index["event_links"]) for index in indexes),
            "empty_temporal_indexes": [
                index["profile_id"] for index in indexes if not index["event_links"]
            ],
        }
    )
    return result


def r2b_review_markdown(result: dict[str, Any]) -> str:
    lines = [
        "# Phase 3D-R2B 审核报告",
        "",
        f"最终状态：`{result['status']}`",
        "",
        "## 权威来源与派生边界",
        "",
        "R2B normalized event store 仅由 `work/phase3d_r2/chronology/campaign_chronology.jsonl` 确定性生成。它不是可独立人工维护的第二权威源，也不会被 builder 当作输入。",
        "",
        "## Gate",
        "",
    ]
    lines.extend(f"- `{name}`：`{value}`" for name, value in result["gates"].items())
    lines.extend(
        [
            "",
            "## 无损结果",
            "",
            f"- R2A event：{result['input_events']}",
            f"- Schema valid：{result['schema_valid_events']}",
            f"- Semantic round-trip equal：{result['semantic_round_trip_equal']}",
            f"- Semantic differences：{result['semantic_round_trip_differences']}",
            f"- Character revelation：{result['revelation_count']}",
            "- event ID、输入行序与完整 `story_axis` 均保持。",
            "",
            "## Canon layer crosswalk",
            "",
            "事件层保留原始 `canon_layer` 与 `story_axis.temporal_scope`；机械索引同时携带二者及 profile mapping：`original_campaign`、`special_interlude`、`transition`。",
            "",
            "## 人物时序索引",
            "",
            f"- Index：{result['temporal_index_count']}",
            f"- Mechanical event links：{result['temporal_event_link_count']}",
            f"- Empty indexes：{', '.join(result['empty_temporal_indexes']) or '无'}",
            "- 建链依据仅限 exact participant `character_ref` 与 revelation subject `character_ref`。",
            "- 杨及其他 `character_label` 未被自动提升为 profile ID。",
            "",
            "## R2C 边界",
            "",
            "R2B 未迁移 background、timeline、relationship、knowledge、ability/status、current state、personality 或 motivation。机械关联不构成语义晋升许可。",
            "",
            "## 冻结与权限",
            "",
            "R2A 权威输入、现有人物候选、PC 权限、Worldbook、Current State 与历史 patch 均未修改。杨的 patch 仍为 draft、未批准、未应用。",
            "",
            "## Stop boundary",
            "",
            "未生成正式 `output/npc_profiles.jsonl` 或 `output/pc_continuity.jsonl`；未进入 R2C、runtime projection 或 Phase 4。",
            "",
        ]
    )
    return "\n".join(lines)


def derive_all_output_texts(
    event_schema_path: Path = EVENT_SCHEMA_PATH,
    chronology_path: Path = R2A_CHRONOLOGY,
    manifest_path: Path = INPUT_MANIFEST_PATH,
) -> tuple[dict[Path, str], dict[str, Any]]:
    verify_frozen_manifest(manifest_path)
    events, normalized_text, derivation, normalized_report = derive_normalized_payloads(
        event_schema_path=event_schema_path,
        chronology_path=chronology_path,
    )
    profiles = load_reviewed_profile_population()
    mapping = crosswalk_mapping()
    indexes = build_temporal_indexes(events, profiles, mapping)
    index_errors = validate_temporal_indexes(indexes)
    if index_errors:
        raise ValueError("invalid temporal indexes:\n" + "\n".join(index_errors))
    result = final_gate_result(normalized_report, indexes)
    outputs: dict[Path, str] = {
        Path("normalized/campaign_events.jsonl"): normalized_text,
        Path("normalized/derivation_manifest.json"): render_json(derivation),
        Path("indexes/character_temporal_indexes.jsonl"): render_jsonl(indexes),
        Path("reports/schema_compatibility_report.md"): schema_compatibility_markdown(
            normalized_report["input_events"]
        ),
        Path("reports/lossless_migration_report.json"): render_json(result),
        Path("reports/unresolved_character_labels.md"): unresolved_label_markdown(events),
        Path("reports/r2b_review.md"): r2b_review_markdown(result),
    }
    for index in indexes:
        outputs[Path("indexes/by_profile") / f"{index['profile_id']}.json"] = render_json(index)
    return outputs, result


def build_all_outputs(
    output_root: Path = R2B_ROOT,
    event_schema_path: Path = EVENT_SCHEMA_PATH,
    chronology_path: Path = R2A_CHRONOLOGY,
    manifest_path: Path = INPUT_MANIFEST_PATH,
) -> dict[str, Any]:
    try:
        outputs, result = derive_all_output_texts(
            event_schema_path=event_schema_path,
            chronology_path=chronology_path,
            manifest_path=manifest_path,
        )
    except SchemaDefectError as error:
        write_schema_defect_report(output_root, error)
        raise
    for relative_path, text in sorted(outputs.items(), key=lambda item: item[0].as_posix()):
        atomic_write_text(output_root / relative_path, text)
    stale_blocker = output_root / "reports" / "schema_defects.json"
    if stale_blocker.is_file():
        stale_blocker.unlink()
    return result


def check_all_outputs(output_root: Path = R2B_ROOT) -> dict[str, Any]:
    expected, result = derive_all_output_texts()
    mismatches: list[str] = []
    for relative_path, expected_text in expected.items():
        path = output_root / relative_path
        if not path.is_file():
            mismatches.append(f"missing derived output: {relative_path.as_posix()}")
        elif path.read_text(encoding="utf-8") != expected_text:
            mismatches.append(
                f"derived output differs from authoritative R2A derivation: {relative_path.as_posix()}"
            )
    roots = [output_root / "normalized", output_root / "indexes", output_root / "reports"]
    actual = {
        path.relative_to(output_root)
        for root in roots
        if root.exists()
        for path in root.rglob("*")
        if path.is_file()
    }
    unexpected = sorted(actual - set(expected))
    mismatches.extend(
        f"unexpected independently maintained derived file: {path.as_posix()}"
        for path in unexpected
    )
    if mismatches:
        raise DerivedOutputMismatch("\n".join(mismatches))
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="verify existing derived outputs without rewriting them",
    )
    args = parser.parse_args()
    try:
        report = check_all_outputs() if args.check else build_all_outputs()
    except (SchemaDefectError, DerivedOutputMismatch, ValueError) as error:
        print(str(error))
        return 1
    print(
        "Phase 3D-R2B: "
        f"{report['semantic_round_trip_equal']}/{report['input_events']} "
        "events semantically equal; "
        f"{report.get('temporal_index_count', 'check')} temporal indexes; "
        f"status={report.get('status', 'CHECK_PASS')}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
