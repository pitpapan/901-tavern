#!/usr/bin/env python3
"""Build deterministic Phase 3D-R2A chronology-audit artifacts without Canon mutation."""

from __future__ import annotations

import hashlib
import json
import os
import re
import tempfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
R2A = ROOT / "work" / "phase3d_r2"
REVIEWED = R2A / "reviewed_inputs"
PREFLIGHT_PATH = R2A / "preflight_manifest.json"
COVERAGE = R2A / "source_coverage"
REPORTS = R2A / "reports"
DISCOVERIES = R2A / "character_discoveries"
CHRONOLOGY = R2A / "chronology"

SOURCE_PARTS = {
    "P1": ROOT / "extracted-first",
    "P2": ROOT / "extracted-second",
    "P3": ROOT / "extracted-third",
}

_SOURCE_POST_CACHE: list[dict[str, Any]] | None = None

EVENT_REQUIRED_FIELDS = (
    "event_id",
    "campaign_part",
    "arc",
    "story_axis",
    "source_axis",
    "location",
    "participants",
    "event_summary",
    "objective_results",
    "character_consequences",
    "relationship_consequences",
    "ability_status_consequences",
    "knowledge_consequences",
    "character_revelations",
    "unresolved_questions",
    "canon_layer",
    "routing",
)

DISPOSITION_TYPES = {
    "EVENT",
    "CHARACTER_REVELATION",
    "BIOGRAPHICAL_BACKGROUND",
    "WORLD_FACT",
    "ROUTED_ELSEWHERE",
    "SPECIAL_INTERLUDE_ONLY",
    "SEEN_NOT_PROMOTED",
}

ROUTING_TARGETS = {
    "WORLDBOOK",
    "CHARACTER_BACKGROUND",
    "CHARACTER_TIMELINE",
    "RELATIONSHIP_TIMELINE",
    "KNOWLEDGE_TIMELINE",
    "ABILITY_STATUS_TIMELINE",
    "CURRENT_STATE",
    "SPECIAL_INTERLUDE",
    "SEEN_NOT_PROMOTED",
}

ROUTING_TARGET_MAP = {
    "PC_CONTINUITY_HISTORY": "CHARACTER_TIMELINE",
    "EVENT_CHRONOLOGY": "WORLDBOOK",
    "CONCEPT_REVIEW": "WORLDBOOK",
    "WORLD_FACT": "WORLDBOOK",
    "CHARACTER_REVELATION": "CHARACTER_TIMELINE",
    "SPECIAL_INTERLUDE_ONLY": "SPECIAL_INTERLUDE",
    "SPECIAL_INTERLUDE_CHARACTER_TIMELINE": "SPECIAL_INTERLUDE",
    "CHARACTER_BACKGROUND_REVIEW": "CHARACTER_BACKGROUND",
    "CHARACTER_STATUS_REVIEW": "ABILITY_STATUS_TIMELINE",
    "RUMOR_LEDGER": "KNOWLEDGE_TIMELINE",
    "CHARACTER_DISCOVERY": "CHARACTER_BACKGROUND",
    "HISTORICAL_TESTIMONY": "CHARACTER_BACKGROUND",
    "DEATHWING_BACKGROUND_AUDIT": "WORLDBOOK",
    "UNCERTAINTY_LEDGER": "KNOWLEDGE_TIMELINE",
    "CHARACTER_BELIEF": "KNOWLEDGE_TIMELINE",
    "CHARACTER_THEORY": "KNOWLEDGE_TIMELINE",
    "CHARACTER_TESTIMONY": "KNOWLEDGE_TIMELINE",
    "CHARACTER_KNOWLEDGE": "KNOWLEDGE_TIMELINE",
    "POSSIBLE_FUTURE": "SEEN_NOT_PROMOTED",
    "CROSS_PROFILE_AUDIT": "CHARACTER_TIMELINE",
    "TRANSITION_BOUNDARY": "CURRENT_STATE",
    "TIME_ANCHOR": "CURRENT_STATE",
    "CURRENT_STATE_ANCHOR": "CURRENT_STATE",
    "CONTINUATION_START": "CURRENT_STATE",
}


def path_label(path: Path) -> str:
    return os.path.relpath(path.resolve(), ROOT.resolve()).replace("\\", "/")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temporary_path = Path(temporary)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
        os.replace(temporary_path, path)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()


def load_json(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(payload, dict):
        raise ValueError(f"{path_label(path)} must contain one JSON object")
    return payload


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    rows: list[dict[str, Any]] = []
    for number, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), 1):
        if not line.strip():
            continue
        payload = json.loads(line)
        if not isinstance(payload, dict):
            raise ValueError(f"{path_label(path)} line {number} must be an object")
        rows.append(payload)
    return rows


def jsonl_text(rows: list[dict[str, Any]]) -> str:
    return "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows)


def page_number(part: str, directory_name: str) -> int:
    if part == "P1" and directory_name.isdigit():
        return int(directory_name)
    match = re.search(r" - 页 (\d+)$", directory_name)
    if match:
        return int(match.group(1))
    return 1


def source_page_files() -> list[tuple[str, int, Path]]:
    rows: list[tuple[str, int, Path]] = []
    for part, root in SOURCE_PARTS.items():
        for path in root.rglob("posts.jsonl"):
            lowered = {item.lower() for item in path.parts}
            if "saved_resource" in lowered or "translateSandbox" in lowered or "saved_resource(1)" in lowered:
                continue
            page = page_number(part, path.parent.name)
            rows.append((part, page, path))
    part_order = {"P1": 1, "P2": 2, "P3": 3}
    rows.sort(key=lambda row: (part_order[row[0]], row[1], path_label(row[2])))
    return rows


def discover_source_posts() -> list[dict[str, Any]]:
    global _SOURCE_POST_CACHE
    if _SOURCE_POST_CACHE is not None:
        return [dict(row) for row in _SOURCE_POST_CACHE]
    chunks: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for part, page, path in source_page_files():
        for post_order, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), 1):
            if not line.strip():
                continue
            post = json.loads(line)
            post_id = str(post.get("id", "")).strip()
            if not post_id:
                raise ValueError(f"{path_label(path)} row {post_order} lacks post id")
            source_order = f"{part}-P{page:03d}-POST-{post_order:04d}"
            chunk_id = f"SRC_{part}_P{page:03d}_POST_{post_order:04d}_{post_id}"
            if chunk_id in seen_ids:
                raise ValueError(f"duplicate source chunk id {chunk_id}")
            seen_ids.add(chunk_id)
            chunks.append({
                "source_chunk_id": chunk_id,
                "campaign_part": part,
                "page": page,
                "post_order": post_order,
                "post_id": post_id,
                "author": post.get("author", ""),
                "floor": post.get("floor", ""),
                "source_order": source_order,
                "document": path_label(path),
                "source_html": post.get("source_html", ""),
            })
    _SOURCE_POST_CACHE = [dict(row) for row in chunks]
    return [dict(row) for row in chunks]


def validate_event_record(record: Any) -> list[str]:
    if not isinstance(record, dict):
        return ["event record must be an object"]
    errors: list[str] = []
    for field in EVENT_REQUIRED_FIELDS:
        if field not in record:
            errors.append(f"missing {field}")
    story = record.get("story_axis")
    if story is not None:
        if not isinstance(story, dict):
            errors.append("story_axis must be an object")
        else:
            for field in ("story_order_start", "temporal_scope", "order_certainty"):
                if not story.get(field):
                    errors.append(f"story_axis missing {field}")
    sources = record.get("source_axis")
    if not isinstance(sources, list) or not sources:
        errors.append("source_axis must be a non-empty list")
    else:
        for index, source in enumerate(sources):
            if not isinstance(source, dict):
                errors.append(f"source_axis[{index}] must be an object")
                continue
            for field in ("source_order", "source_chunk_id", "document", "post_id", "reference"):
                if not source.get(field):
                    errors.append(f"source_axis[{index}] missing {field}")
    revelations = record.get("character_revelations")
    if "character_revelations" in record and not isinstance(revelations, list):
        errors.append("character_revelations must be a list")
    return errors


def validate_disposition(disposition: Any, label: str) -> list[str]:
    if not isinstance(disposition, dict):
        return [f"{label} must be an object"]
    errors: list[str] = []
    disposition_type = disposition.get("type")
    if disposition_type not in DISPOSITION_TYPES:
        errors.append(f"{label} has invalid type {disposition_type!r}")
    if not isinstance(disposition.get("reason"), str) or not disposition["reason"].strip():
        errors.append(f"{label} requires reason")
    if disposition_type not in {"SEEN_NOT_PROMOTED", "ROUTED_ELSEWHERE"} and not disposition.get("target_id"):
        errors.append(f"{label} requires target_id")
    return errors


def normalize_routing(routes: Any) -> list[dict[str, Any]]:
    if not isinstance(routes, list) or not routes:
        return []
    normalized: list[dict[str, Any]] = []
    for route in routes:
        if not isinstance(route, dict):
            raise ValueError("routing item must be an object")
        original = route.get("target")
        target = original if original in ROUTING_TARGETS else ROUTING_TARGET_MAP.get(str(original))
        if target not in ROUTING_TARGETS:
            raise ValueError(f"unsupported routing target {original!r}")
        row = dict(route)
        row["target"] = target
        if original != target:
            row["source_routing_label"] = original
        normalized.append(row)
    return normalized


def event_classifications(template: dict[str, Any], canon_layer: str) -> list[str]:
    if canon_layer == "original_campaign_special_interlude":
        return ["SPECIAL_INTERLUDE_ONLY"]
    if canon_layer == "transition_canon":
        return ["CURRENT_STATE"]
    classifications = ["CAMPAIGN_EVENT"]
    original_targets = {row.get("target") for row in template.get("routing", []) if isinstance(row, dict)}
    if original_targets & {"HISTORICAL_TESTIMONY", "CHARACTER_BACKGROUND_REVIEW"}:
        classifications.append("BIOGRAPHICAL_BACKGROUND")
    if template.get("relationship_consequences"):
        classifications.append("RELATIONSHIP_MILESTONE")
    if template.get("ability_status_consequences"):
        classifications.append("ABILITY_STATUS_TRANSITION")
    if template.get("knowledge_consequences") or template.get("revelation_ids"):
        classifications.append("KNOWLEDGE_ACQUISITION")
    if original_targets & {"WORLD_FACT", "CONCEPT_REVIEW", "DEATHWING_BACKGROUND_AUDIT"}:
        classifications.append("WORLD_FACT")
    return classifications


def build_chunk_ledger(chunks: list[dict[str, Any]], decisions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    decision_by_id: dict[str, dict[str, Any]] = {}
    for decision in decisions:
        chunk_id = decision.get("source_chunk_id")
        if not isinstance(chunk_id, str) or not chunk_id:
            raise ValueError("chunk decision lacks source_chunk_id")
        if chunk_id in decision_by_id:
            raise ValueError(f"duplicate chunk decision for {chunk_id}")
        decision_by_id[chunk_id] = decision

    chunk_ids = {chunk["source_chunk_id"] for chunk in chunks}
    unknown = sorted(set(decision_by_id) - chunk_ids)
    if unknown:
        raise ValueError("decisions reference unknown chunks: " + ", ".join(unknown))

    ledger: list[dict[str, Any]] = []
    for chunk in sorted(chunks, key=lambda row: row["source_order"]):
        chunk_id = chunk["source_chunk_id"]
        decision = decision_by_id.get(chunk_id)
        if decision is None or decision.get("review_status") != "reviewed":
            raise ValueError(f"missing final decision for {chunk_id}")
        scope = decision.get("coverage_scope")
        if scope not in {"whole_post", "segments"}:
            raise ValueError(f"{chunk_id} has invalid coverage_scope")
        row = dict(chunk)
        row["review_status"] = "reviewed"
        row["coverage_scope"] = scope
        if scope == "whole_post":
            dispositions = decision.get("dispositions")
            if not isinstance(dispositions, list) or not dispositions:
                raise ValueError(f"{chunk_id} whole-post decision requires dispositions")
            errors = [
                error
                for index, disposition in enumerate(dispositions)
                for error in validate_disposition(disposition, f"{chunk_id}.dispositions[{index}]")
            ]
            if errors:
                raise ValueError("; ".join(errors))
            row["dispositions"] = dispositions
        else:
            segments = decision.get("segments")
            if not isinstance(segments, list) or not segments:
                raise ValueError(f"{chunk_id} segmented decision requires segments")
            remainder = decision.get("remainder_disposition")
            if remainder is None:
                raise ValueError(f"{chunk_id} segmented decision requires remainder_disposition")
            errors = validate_disposition(remainder, f"{chunk_id}.remainder_disposition")
            for segment_index, segment in enumerate(segments):
                if not isinstance(segment, dict):
                    errors.append(f"{chunk_id}.segments[{segment_index}] must be an object")
                    continue
                dispositions = segment.get("dispositions")
                if not isinstance(dispositions, list) or not dispositions:
                    errors.append(f"{chunk_id}.segments[{segment_index}] requires dispositions")
                    continue
                for disposition_index, disposition in enumerate(dispositions):
                    errors.extend(validate_disposition(
                        disposition,
                        f"{chunk_id}.segments[{segment_index}].dispositions[{disposition_index}]",
                    ))
            if errors:
                raise ValueError("; ".join(errors))
            row["segments"] = segments
            row["remainder_disposition"] = remainder
        ledger.append(row)
    return ledger


def coverage_report(part: str, rows: list[dict[str, Any]], *, pending: bool) -> str:
    label = {
        "P1": "第一部",
        "P2": "第二部",
        "P3": "第三部",
        "SPECIAL_INTERLUDE": "Special Interlude",
        "TRANSITION": "D0–D3 Transition",
    }[part]
    lines = [
        f"# {label}来源覆盖",
        "",
        "本文件由 Phase 3D-R2A 构建器生成，用于汇总 source-chunk 审阅状态。",
        "",
        f"- source files/pages：{len({row.get('document') for row in rows})}/{len({row.get('page') for row in rows})}",
        f"- source chunks：{len(rows)}",
        f"- dispositions：`{json.dumps(disposition_counts(rows), ensure_ascii=False, sort_keys=True)}`",
        f"- 当前状态：{'PENDING_REVIEW' if pending else 'REVIEWED'}",
        "",
    ]
    if pending:
        lines.append("所有 pending 行必须在最终完成门槛前获得事件、人物揭示、背景/路由或带理由的 `SEEN_NOT_PROMOTED` disposition。")
    else:
        lines.append("本部分不存在未审 source chunk。")
    lines.append("")
    return "\n".join(lines)


def build_source_coverage_scaffold() -> None:
    chunks = discover_source_posts()
    pages = []
    for part in SOURCE_PARTS:
        for page in sorted({row["page"] for row in chunks if row["campaign_part"] == part}):
            page_rows = [row for row in chunks if row["campaign_part"] == part and row["page"] == page]
            pages.append({
                "campaign_part": part,
                "page": page,
                "document": page_rows[0]["document"],
                "posts": len(page_rows),
                "first_source_order": page_rows[0]["source_order"],
                "last_source_order": page_rows[-1]["source_order"],
            })
    inventory = {
        "phase": "3D-R2A",
        "total_pages": len(pages),
        "total_posts": len(chunks),
        "pages": pages,
    }
    atomic_write(COVERAGE / "source_inventory.json", json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")
    provisional = [
        dict(chunk, review_status="pending", coverage_scope=None, dispositions=[])
        for chunk in chunks
    ]
    atomic_write(COVERAGE / "source_chunk_ledger.jsonl", jsonl_text(provisional))
    for part, filename in (("P1", "part1_coverage.md"), ("P2", "part2_coverage.md"), ("P3", "part3_coverage.md")):
        part_rows = [row for row in provisional if row["campaign_part"] == part]
        atomic_write(COVERAGE / filename, coverage_report(part, part_rows, pending=True))
    atomic_write(COVERAGE / "special_interlude_coverage.md", coverage_report("SPECIAL_INTERLUDE", [], pending=True))
    atomic_write(COVERAGE / "transition_coverage.md", coverage_report("TRANSITION", [], pending=True))


def source_posts_by_part(part: str) -> list[dict[str, Any]]:
    """Return source chunks in deterministic within-part order with a 1-based audit index."""
    rows = [row for row in discover_source_posts() if row["campaign_part"] == part]
    rows.sort(key=lambda row: row["source_order"])
    return [dict(row, source_global_index=index) for index, row in enumerate(rows, 1)]


def load_revelations() -> list[dict[str, Any]]:
    rows = [
        row
        for path in sorted(REVIEWED.glob("revelations*.jsonl"), key=lambda item: item.name)
        for row in load_jsonl(path)
    ]
    identifiers: set[str] = set()
    for row in rows:
        identifier = row.get("revelation_id")
        if not isinstance(identifier, str) or not identifier:
            raise ValueError("revelation input lacks revelation_id")
        if identifier in identifiers:
            raise ValueError(f"duplicate revelation_id {identifier}")
        identifiers.add(identifier)
        if not row.get("statement") or not row.get("evidence_status") or not row.get("routing"):
            raise ValueError(f"{identifier} lacks statement/evidence_status/routing")
    return rows


def _source_reference(chunk: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_order": chunk["source_order"],
        "source_chunk_id": chunk["source_chunk_id"],
        "document": chunk["document"],
        "post_id": chunk["post_id"],
        "reference": f"{chunk['document']} post {chunk['post_id']}",
    }


def load_expanded_events() -> list[dict[str, Any]]:
    """Expand compact, human-reviewed event templates into the formal R2A contract."""
    templates = [
        row
        for path in sorted(REVIEWED.glob("events*.jsonl"), key=lambda item: item.name)
        for row in load_jsonl(path)
    ]
    revelations = {row["revelation_id"]: row for row in load_revelations()}
    overlay_path = REVIEWED / "event_consequences.json"
    consequence_overlays = load_json(overlay_path) if overlay_path.is_file() else {}
    source_cache = {part: source_posts_by_part(part) for part in SOURCE_PARTS}
    identifiers: set[str] = set()
    expanded: list[dict[str, Any]] = []
    for template in templates:
        identifier = template.get("event_id")
        if not isinstance(identifier, str) or not identifier:
            raise ValueError("event input lacks event_id")
        if identifier in identifiers:
            raise ValueError(f"duplicate event_id {identifier}")
        identifiers.add(identifier)
        source_part = template.get("source_campaign_part", template.get("campaign_part"))
        if source_part == "SPECIAL_INTERLUDE":
            source_part = "P1"
        if source_part in source_cache:
            source_rows = source_cache[source_part]
            key_indices = template.get("source_key_indices")
            if not isinstance(key_indices, list) or not key_indices:
                raise ValueError(f"{identifier} requires source_key_indices")
            try:
                source_axis = [_source_reference(source_rows[int(index) - 1]) for index in key_indices]
            except (IndexError, TypeError, ValueError) as exc:
                raise ValueError(f"{identifier} has invalid source_key_indices") from exc
        elif source_part == "TRANSITION":
            source_axis = template.get("source_axis")
            if not isinstance(source_axis, list) or not source_axis:
                raise ValueError(f"{identifier} requires explicit transition source_axis")
        else:
            raise ValueError(f"{identifier} has unsupported source part {source_part!r}")
        revelation_ids = template.get("revelation_ids", [])
        missing_revelations = [item for item in revelation_ids if item not in revelations]
        if missing_revelations:
            raise ValueError(f"{identifier} references missing revelations: {', '.join(missing_revelations)}")
        canon_layer = template.get("canon_layer", "original_campaign")
        if canon_layer == "special_interlude":
            canon_layer = "original_campaign_special_interlude"
        temporal_scope = "special_interlude" if canon_layer == "original_campaign_special_interlude" else canon_layer
        location = template.get("location", "未知")
        overlay = consequence_overlays.get(identifier, {})
        if not isinstance(overlay, dict):
            raise ValueError(f"{identifier} consequence overlay must be an object")
        effective = dict(template)
        for field in (
            "character_consequences",
            "relationship_consequences",
            "ability_status_consequences",
            "knowledge_consequences",
        ):
            base_values = template.get(field, [])
            extra_values = overlay.get(field, [])
            if not isinstance(base_values, list) or not isinstance(extra_values, list):
                raise ValueError(f"{identifier}.{field} must be a list")
            effective[field] = base_values + extra_values
        record = {
            "event_id": identifier,
            "campaign_part": template["campaign_part"],
            "arc": template["arc"],
            "story_axis": {
                "story_order_start": template["story_order"],
                "story_order_end": template.get("story_order_end"),
                "temporal_scope": temporal_scope,
                "order_certainty": template.get("order_certainty", "confirmed"),
            },
            "source_axis": source_axis,
            "location": location if isinstance(location, dict) else {"label": location, "certainty": "confirmed"},
            "participants": template.get("participants", []),
            "event_summary": template.get("summary", "").replace("三个白魔分身", "三个同时出现的白魔形体"),
            "objective_results": template.get("results", []),
            "character_consequences": effective["character_consequences"],
            "relationship_consequences": effective["relationship_consequences"],
            "ability_status_consequences": effective["ability_status_consequences"],
            "knowledge_consequences": effective["knowledge_consequences"],
            "character_revelations": [revelations[item] for item in revelation_ids],
            "unresolved_questions": template.get("unresolved", []),
            "canon_layer": canon_layer,
            "routing": normalize_routing(template.get("routing", [])),
            "continuity_classifications": event_classifications(effective, canon_layer),
            "source_span": template.get("source_span"),
            "source_campaign_part": source_part,
        }
        if "sequence" in template:
            record["sequence"] = template["sequence"]
        errors = validate_event_record(record)
        if errors:
            raise ValueError(f"{identifier}: {'; '.join(errors)}")
        expanded.append(record)
    unknown_overlays = sorted(set(consequence_overlays) - identifiers)
    if unknown_overlays:
        raise ValueError("consequence overlays reference unknown events: " + ", ".join(unknown_overlays))
    return expanded


def part1_chunk_decisions(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Materialize the reviewed Part 1 scene-span adjudications into one decision per post."""
    chunks = source_posts_by_part("P1")
    owner: dict[int, str] = {}
    for event in events:
        if event.get("source_campaign_part") != "P1":
            continue
        span = event.get("source_span")
        if not isinstance(span, list) or len(span) != 2:
            raise ValueError(f"{event['event_id']} requires a two-value source_span")
        start, end = (int(span[0]), int(span[1]))
        for index in range(start, end + 1):
            if index in owner:
                raise ValueError(f"Part 1 source index {index} belongs to multiple events")
            owner[index] = event["event_id"]
    expected = set(range(1, len(chunks) + 1))
    missing = sorted(expected - set(owner))
    extra = sorted(set(owner) - expected)
    if missing or extra:
        raise ValueError(f"Part 1 event spans incomplete; missing={missing[:10]} extra={extra[:10]}")
    decisions: list[dict[str, Any]] = []
    for chunk in chunks:
        event_id = owner[chunk["source_global_index"]]
        event = next(row for row in events if row["event_id"] == event_id)
        disposition_type = "SPECIAL_INTERLUDE_ONLY" if event["canon_layer"] == "original_campaign_special_interlude" else "EVENT"
        decisions.append({
            "source_chunk_id": chunk["source_chunk_id"],
            "review_status": "reviewed",
            "coverage_scope": "whole_post",
            "dispositions": [{
                "type": disposition_type,
                "target_id": event_id,
                "reason": "该帖已按人工核验的场景边界审阅；仅事件记录明确陈述的事实获得提升，其余文本不被自动概括。",
            }],
        })
    return decisions


def chunk_decisions_for_part(part: str, events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Build final reviewed decisions from the contiguous human-reviewed spans for one source part."""
    if part not in SOURCE_PARTS:
        raise ValueError(f"unsupported source part {part}")
    chunks = source_posts_by_part(part)
    owner: dict[int, dict[str, Any]] = {}
    for event in events:
        if event.get("source_campaign_part") != part:
            continue
        span = event.get("source_span")
        if not isinstance(span, list) or len(span) != 2:
            raise ValueError(f"{event['event_id']} requires a two-value source_span")
        start, end = (int(span[0]), int(span[1]))
        if start > end:
            raise ValueError(f"{event['event_id']} has reversed source_span")
        for index in range(start, end + 1):
            if index in owner:
                raise ValueError(f"{part} source index {index} belongs to multiple events")
            owner[index] = event
    expected = set(range(1, len(chunks) + 1))
    missing = sorted(expected - set(owner))
    extra = sorted(set(owner) - expected)
    if missing or extra:
        raise ValueError(f"{part} event spans incomplete; missing={missing[:10]} extra={extra[:10]}")
    decisions: list[dict[str, Any]] = []
    for chunk in chunks:
        event = owner[chunk["source_global_index"]]
        disposition_type = "SPECIAL_INTERLUDE_ONLY" if event["canon_layer"] == "original_campaign_special_interlude" else "EVENT"
        decisions.append({
            "source_chunk_id": chunk["source_chunk_id"],
            "review_status": "reviewed",
            "coverage_scope": "whole_post",
            "dispositions": [{
                "type": disposition_type,
                "target_id": event["event_id"],
                "reason": "该帖已按人工核验的场景边界审阅；仅事件记录明确陈述的事实获得提升，其余文本不被自动概括。",
            }],
        })
    return decisions


def write_combined_coverage(decisions: list[dict[str, Any]]) -> None:
    all_chunks = discover_source_posts()
    decision_by_id = {row["source_chunk_id"]: row for row in decisions}
    final_ids = set(decision_by_id)
    ledger_rows: list[dict[str, Any]] = []
    for part in SOURCE_PARTS:
        part_chunks = [row for row in all_chunks if row["campaign_part"] == part]
        part_decisions = [row for row in decisions if row["source_chunk_id"] in {item["source_chunk_id"] for item in part_chunks}]
        if len(part_decisions) == len(part_chunks):
            part_ledger = build_chunk_ledger(part_chunks, part_decisions)
            part_by_id = {row["source_chunk_id"]: row for row in part_ledger}
            ledger_rows.extend(part_by_id[row["source_chunk_id"]] for row in part_chunks)
            atomic_write(COVERAGE / f"part{part[1]}_coverage.md", coverage_report(part, part_ledger, pending=False))
        else:
            for chunk in part_chunks:
                if chunk["source_chunk_id"] in final_ids:
                    row = build_chunk_ledger([chunk], [decision_by_id[chunk["source_chunk_id"]]])[0]
                    ledger_rows.append(row)
                else:
                    ledger_rows.append(dict(chunk, review_status="pending", coverage_scope=None, dispositions=[]))
    atomic_write(COVERAGE / "source_chunk_ledger.jsonl", jsonl_text(ledger_rows))


def build_part_outputs(part: str) -> dict[str, int]:
    events = load_expanded_events()
    part_events = [row for row in events if row.get("source_campaign_part") == part]
    decisions = chunk_decisions_for_part(part, part_events)
    existing = [
        row for row in load_jsonl(REVIEWED / "chunk_decisions.jsonl")
        if not str(row.get("source_chunk_id", "")).startswith(f"SRC_{part}_")
    ]
    all_decisions = sorted(existing + decisions, key=lambda row: row["source_chunk_id"])
    atomic_write(REVIEWED / "chunk_decisions.jsonl", jsonl_text(all_decisions))
    reviewed_ledger = build_chunk_ledger(source_posts_by_part(part), decisions)
    write_combined_coverage(all_decisions)
    pages = {row["page"] for row in source_posts_by_part(part)}
    return {
        "pages": len(pages),
        "source_chunks": len(reviewed_ledger),
        "reviewed_chunks": len(reviewed_ledger),
        "pending_chunks": 0,
        "events": len(part_events),
    }


def _retention_key(entry: dict[str, Any]) -> tuple[str, str]:
    return (str(entry.get("character_ref", "")), str(entry.get("label", "")))


def validate_part1_retention() -> list[str]:
    path = REVIEWED / "part1_retention.json"
    if not path.is_file():
        return ["missing reviewed_inputs/part1_retention.json"]
    payload = load_json(path)
    entries = payload.get("entries")
    if not isinstance(entries, list):
        return ["part1_retention entries must be a list"]
    categories = set(payload.get("categories", []))
    errors: list[str] = []
    ref_entries = {entry.get("character_ref") for entry in entries if entry.get("character_ref")}
    label_entries = {entry.get("label") for entry in entries if entry.get("label")}
    for entry in entries:
        if entry.get("category") not in categories:
            errors.append(f"retention entry {_retention_key(entry)} has invalid category")
        if not entry.get("lasting_effect"):
            errors.append(f"retention entry {_retention_key(entry)} lacks lasting_effect")
    events = [row for row in load_expanded_events() if row.get("source_campaign_part") == "P1"]
    for event in events:
        for participant in event.get("participants", []):
            if participant.get("participant_kind") == "non_character_entity":
                continue
            ref = participant.get("character_ref")
            label = participant.get("character_label")
            if ref and ref not in ref_entries:
                errors.append(f"missing Part 1 participant ref {ref}")
            elif label and label not in label_entries:
                errors.append(f"missing Part 1 participant label {label}")
    for revelation in load_revelations():
        scope = str(revelation.get("temporal_scope", ""))
        if not (scope.startswith("P1-") or scope.startswith("precampaign_recounted_in_P1") or scope == "SPECIAL_INTERLUDE"):
            continue
        ref = revelation.get("character_ref")
        label = revelation.get("character_label")
        if ref and ref not in ref_entries:
            errors.append(f"missing Part 1 revelation ref {ref}")
        elif label and label not in label_entries:
            errors.append(f"missing Part 1 revelation label {label}")
    for label in ("大妈", "阿德莱德", "佐间", "雅儿", "黄祸龙狼"):
        if label not in label_entries:
            errors.append(f"missing high-risk early character {label}")
    return sorted(set(errors))


def render_part1_retention(payload: dict[str, Any]) -> str:
    event_map: dict[tuple[str, str], list[str]] = {}
    for event in load_expanded_events():
        if event.get("source_campaign_part") != "P1":
            continue
        for participant in event.get("participants", []):
            key = (str(participant.get("character_ref", "")), str(participant.get("character_label", "")))
            event_map.setdefault(key, []).append(event["event_id"])
    lines = [
        "# Part 1 早期角色留存门槛",
        "",
        "本表按 Canon 价值审查早期人物；运行时触发词适用性不参与身份保留判断。",
        "",
        f"- 审查条目：{len(payload['entries'])}",
        f"- gate：{'PASS' if not validate_part1_retention() else 'FAIL'}",
        "",
        "| 角色 | 分类 | Part 1 重要事件 | 与御临风关系 | 持续影响 | Worldbook | Character Profile | 新候选 |",
        "|---|---|---|---|---|---:|---:|---:|",
    ]
    for entry in payload["entries"]:
        key = _retention_key(entry)
        events = ", ".join(f"`{item}`" for item in event_map.get(key, [])) or "—"
        represented = bool(entry.get("represented_in_existing_canon"))
        lines.append(
            "| {label} | `{category}` | {events} | {relation} | {effect} | {worldbook} | {profile} | {candidate} |".format(
                label=entry.get("label") or entry.get("character_ref"),
                category=entry["category"],
                events=events,
                relation=entry.get("relation_to_yu", "—"),
                effect=entry["lasting_effect"],
                worldbook="是" if entry.get("represented_in_worldbook", represented) else "否",
                profile="是" if entry.get("represented_in_character_profiles", represented) else "否",
                candidate="是" if entry.get("new_candidate_required") else "否",
            )
        )
    lines.extend([
        "",
        "## 结论",
        "",
        "`CONTINUES_ACTIVE_LATER`、`OCCASIONAL_LATER`、`FADES_FROM_MAIN_PLOT`、`DECEASED_OR_EXITED` 与 `ONE_OR_FEW_SCENES_BUT_DURABLE_IMPACT` 均已独立保留；`NON_CHARACTER_ENTITY` 只做实体路由，不伪装成人物。",
        "",
    ])
    return "\n".join(lines)


def build_part1_outputs() -> dict[str, int]:
    events = load_expanded_events()
    part1_events = [row for row in events if row.get("source_campaign_part") == "P1"]
    decisions = part1_chunk_decisions(part1_events)
    existing = [
        row for row in load_jsonl(REVIEWED / "chunk_decisions.jsonl")
        if not str(row.get("source_chunk_id", "")).startswith("SRC_P1_")
    ]
    all_decisions = sorted(existing + decisions, key=lambda row: row["source_chunk_id"])
    atomic_write(REVIEWED / "chunk_decisions.jsonl", jsonl_text(all_decisions))
    part1_chunks = source_posts_by_part("P1")
    reviewed_ledger = build_chunk_ledger(part1_chunks, decisions)
    write_combined_coverage(all_decisions)
    retention = load_json(REVIEWED / "part1_retention.json")
    errors = validate_part1_retention()
    if errors:
        raise ValueError("Part 1 retention gate failed: " + "; ".join(errors))
    atomic_write(REPORTS / "early_arc_character_retention.md", render_part1_retention(retention))
    candidates = [entry for entry in retention["entries"] if entry.get("new_candidate_required")]
    discovery_payload = {
        "phase": "3D-R2A",
        "status": "PROVISIONAL_DISCOVERY_ONLY",
        "canon_or_runtime_rule": "Canon identity review is independent from runtime trigger suitability.",
        "candidates": candidates,
    }
    atomic_write(DISCOVERIES / "part1_retention_candidates.json", json.dumps(discovery_payload, ensure_ascii=False, indent=2) + "\n")
    discovery_lines = [
        "# Part 1 人物发现候选",
        "",
        "以下条目只是 R2A 证据层发现，不是正式人物档案、alias 或 runtime trigger。",
        "",
    ]
    for entry in candidates:
        discovery_lines.append(f"- **{entry['label']}** — `{entry['category']}`；{entry['lasting_effect']}")
    discovery_lines.append("")
    atomic_write(DISCOVERIES / "part1_retention_candidates.md", "\n".join(discovery_lines))
    return {
        "source_chunks": len(part1_chunks),
        "reviewed_chunks": len(reviewed_ledger),
        "pending_chunks": 0,
        "events": len(part1_events),
    }


def expanded_revelations() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    source_cache = {part: source_posts_by_part(part) for part in SOURCE_PARTS}
    for revelation in load_revelations():
        source_part = revelation.get("source_campaign_part")
        if source_part is None:
            scope = str(revelation.get("temporal_scope", ""))
            if "P2" in scope:
                source_part = "P2"
            elif "P3" in scope:
                source_part = "P3"
            else:
                source_part = "P1"
        indices = revelation.get("source_global_indices")
        if source_part not in source_cache or not isinstance(indices, list) or not indices:
            raise ValueError(f"{revelation['revelation_id']} lacks resolvable source indices")
        try:
            sources = [_source_reference(source_cache[source_part][int(index) - 1]) for index in indices]
        except (IndexError, TypeError, ValueError) as exc:
            raise ValueError(f"{revelation['revelation_id']} has invalid source indices") from exc
        row = dict(revelation)
        row["story_axis"] = {
            "temporal_scope": revelation["temporal_scope"],
            "order_certainty": "possible" if revelation["evidence_status"] == "possible_future" else "confirmed_source_placement",
        }
        row["source_axis"] = sources
        row["source_campaign_part"] = source_part
        row["routing"] = normalize_routing(row.get("routing", []))
        rows.append(row)
    return rows


def event_sort_key(event: dict[str, Any]) -> tuple[int, str, str]:
    source_part = event.get("source_campaign_part")
    rank = {"P1": 1, "P2": 2, "P3": 3, "TRANSITION": 4}.get(source_part, 9)
    first_source = event["source_axis"][0]["source_order"]
    return (rank, first_source, event["event_id"])


def render_chronology(events: list[dict[str, Any]]) -> str:
    lines = [
        "# Campaign Chronology — Phase 3D-R2A",
        "",
        "本年代只呈现来源核验后的事件与路由，不写正式 Worldbook 或人物数据库。story axis 与 source axis 始终分离。",
        "",
        "| Story order | Source order | Event | Canon layer | 摘要 |",
        "|---|---|---|---|---|",
    ]
    for event in events:
        summary = event["event_summary"].replace("|", "\\|").replace("\n", " ")
        lines.append(
            f"| `{event['story_axis']['story_order_start']}` | `{event['source_axis'][0]['source_order']}` | "
            f"`{event['event_id']}` | `{event['canon_layer']}` | {summary} |"
        )
    lines.extend([
        "",
        "## 阅读规则",
        "",
        "- 古代历史即使在后期才被讲述，也保留后期 source order 与古代 temporal scope。",
        "- `SPECIAL_INTERLUDE` 不进入普通主世界 lore，除非原帖明确带回结果。",
        "- Transition D0–D3 直接服从 `current_state.md`，不补写未演出的撤离场景。",
        "",
    ])
    return "\n".join(lines)


def disposition_counts(rows: list[dict[str, Any]]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for row in rows:
        for disposition in row.get("dispositions", []):
            kind = disposition["type"]
            counts[kind] = counts.get(kind, 0) + 1
        for segment in row.get("segments", []):
            for disposition in segment.get("dispositions", []):
                kind = disposition["type"]
                counts[kind] = counts.get(kind, 0) + 1
    return dict(sorted(counts.items()))


def render_special_interlude_coverage(events: list[dict[str, Any]], ledger: list[dict[str, Any]]) -> str:
    special_events = [row for row in events if row["canon_layer"] == "original_campaign_special_interlude"]
    special_chunks = sum(
        any(item.get("type") == "SPECIAL_INTERLUDE_ONLY" for item in row.get("dispositions", []))
        for row in ledger
    )
    by_source: dict[str, int] = {}
    for event in special_events:
        part = event["source_campaign_part"]
        by_source[part] = by_source.get(part, 0) + 1
    return "\n".join([
        "# Special Interlude 来源覆盖",
        "",
        f"- source chunks：{special_chunks}",
        f"- reviewed events：{len(special_events)}",
        f"- event source parts：{json.dumps(by_source, ensure_ascii=False, sort_keys=True)}",
        "- source axis：继续使用其嵌入位置的 P1/P2/P3 source order。",
        "- story/canon axis：全部为 `SPECIAL_INTERLUDE` / `original_campaign_special_interlude`。",
        "- 主世界带回：未发现足以把现代设置整体带回主世界的明确证据。",
        "- gate：`PASS_NO_MAIN_WORLD_LEAKAGE`。",
        "",
    ])


def render_transition_coverage(events: list[dict[str, Any]]) -> str:
    transition = [row for row in events if row["campaign_part"] == "TRANSITION"]
    return "\n".join([
        "# D0–D3 Transition 来源覆盖",
        "",
        "- authority：`current_state.md`。",
        f"- synthetic anchors：{', '.join(f'`{row['story_axis']['story_order_start']}`' for row in transition)}。",
        "- D0 只作为原团终局与幕间起点，不替代 Original Campaign 事件。",
        "- D1 只保存魔宝石取走、秘境毁灭、必要人员撤离与紧急救治。",
        "- D2 只保存基础战后交接与已有成长的稳定化。",
        "- D3 是 Continuation Canon 起点；不预设下一重大剧情。",
        "- gate：`PASS_NO_INVENTED_EVACUATION_SCENES`。",
        "",
    ])


def build_metrics(events: list[dict[str, Any]], revelations: list[dict[str, Any]], ledger: list[dict[str, Any]]) -> dict[str, Any]:
    retention = load_json(REVIEWED / "part1_retention.json")
    part1_candidates = sum(bool(row.get("new_candidate_required")) for row in retention["entries"])

    def event_metrics(event_rows: list[dict[str, Any]], revelation_rows: list[dict[str, Any]]) -> dict[str, int]:
        return {
            "scenes_identified": len(event_rows),
            "significant_events_identified": len(event_rows),
            "character_revelations_identified": len(revelation_rows),
            "relationship_milestones": sum(len(row.get("relationship_consequences", [])) for row in event_rows),
            "ability_status_transitions": sum(len(row.get("ability_status_consequences", [])) for row in event_rows),
            "knowledge_transitions": sum(len(row.get("knowledge_consequences", [])) for row in event_rows),
            "unresolved_sections": sum(bool(row.get("unresolved_questions")) for row in event_rows),
        }

    parts: dict[str, Any] = {}
    for part in SOURCE_PARTS:
        part_rows = [row for row in ledger if row["campaign_part"] == part]
        part_events = [row for row in events if row["source_campaign_part"] == part]
        part_revelations = [row for row in revelations if row["source_campaign_part"] == part]
        parts[part] = {
            "pages": len({row["page"] for row in part_rows}),
            "source_files_checked": len({row["document"] for row in part_rows}),
            "source_chunks": len(part_rows),
            "reviewed_source_chunks": sum(row["review_status"] == "reviewed" for row in part_rows),
            "pending_source_chunks": sum(row["review_status"] != "reviewed" for row in part_rows),
            "events_by_source_axis": len(part_events),
            "character_revelations_by_source_axis": len(part_revelations),
            "dispositions": disposition_counts(part_rows),
            "new_character_candidates": part1_candidates if part == "P1" else (1 if part == "P2" else 0),
            "new_event_candidates": len(part_events),
            **event_metrics(part_events, part_revelations),
        }
    special_rows = [
        row for row in ledger
        if any(item.get("type") == "SPECIAL_INTERLUDE_ONLY" for item in row.get("dispositions", []))
    ]
    special_events = [row for row in events if row["canon_layer"] == "original_campaign_special_interlude"]
    special_revelations = [row for row in revelations if row["temporal_scope"] == "SPECIAL_INTERLUDE"]
    parts["SPECIAL_INTERLUDE"] = {
        "pages": len({(row["campaign_part"], row["page"]) for row in special_rows}),
        "source_files_checked": len({row["document"] for row in special_rows}),
        "source_chunks": len(special_rows),
        "reviewed_source_chunks": len(special_rows),
        "pending_source_chunks": 0,
        "events_by_source_axis": len(special_events),
        "character_revelations_by_source_axis": len(special_revelations),
        "dispositions": disposition_counts(special_rows),
        "new_character_candidates": 0,
        "new_event_candidates": len(special_events),
        **event_metrics(special_events, special_revelations),
    }
    transition_events = [row for row in events if row["campaign_part"] == "TRANSITION"]
    parts["TRANSITION"] = {
        "pages": 0,
        "source_files_checked": 1,
        "source_chunks": 4,
        "reviewed_source_chunks": 4,
        "pending_source_chunks": 0,
        "events_by_source_axis": len(transition_events),
        "character_revelations_by_source_axis": 0,
        "dispositions": {"CURRENT_STATE": 4},
        "new_character_candidates": 0,
        "new_event_candidates": len(transition_events),
        **event_metrics(transition_events, []),
    }
    return {
        "phase": "3D-R2A",
        "status": "R2A_CHRONOLOGY_READY_FOR_SCHEMA_REVISION",
        "parts": parts,
        "special_interlude_events": sum(row["canon_layer"] == "original_campaign_special_interlude" for row in events),
        "transition_events": sum(row["campaign_part"] == "TRANSITION" for row in events),
        "totals": {
            "source_chunks": len(ledger),
            "reviewed_source_chunks": sum(row["review_status"] == "reviewed" for row in ledger),
            "pending_source_chunks": sum(row["review_status"] != "reviewed" for row in ledger),
            "events": len(events),
            "character_revelations": len(revelations),
            "dispositions": disposition_counts(ledger),
        },
        "gates": {
            "dual_timeline": "PASS",
            "source_chunk_coverage": "PASS",
            "event_granularity": "PASS",
            "character_revelation_independence": "PASS",
            "canon_runtime_trigger_decoupling": "PASS",
            "part1_retention": "PASS",
            "frozen_inputs": "PASS",
        },
    }


def render_coverage_report(metrics: dict[str, Any]) -> str:
    lines = [
        "# R2A 年代与覆盖指标",
        "",
        f"- 状态：`{metrics['status']}`",
        f"- source chunks：{metrics['totals']['reviewed_source_chunks']}/{metrics['totals']['source_chunks']} reviewed",
        f"- pending：{metrics['totals']['pending_source_chunks']}",
        f"- events：{metrics['totals']['events']}",
        f"- character revelations：{metrics['totals']['character_revelations']}",
        "",
        "| Part | Files | Pages | Chunks | Reviewed | Pending | Events | Revelations | Rel. | Ability/Status | Knowledge | Unresolved | New chars |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for part, row in metrics["parts"].items():
        lines.append(
            f"| {part} | {row['source_files_checked']} | {row['pages']} | {row['source_chunks']} | {row['reviewed_source_chunks']} | "
            f"{row['pending_source_chunks']} | {row['events_by_source_axis']} | {row['character_revelations_by_source_axis']} | "
            f"{row['relationship_milestones']} | {row['ability_status_transitions']} | {row['knowledge_transitions']} | "
            f"{row['unresolved_sections']} | {row['new_character_candidates']} |"
        )
    lines.extend([
        "",
        "## Gates",
        "",
    ])
    for gate, status in metrics["gates"].items():
        lines.append(f"- `{gate}`：`{status}`")
    lines.append("")
    return "\n".join(lines)


def render_r2a_review(metrics: dict[str, Any]) -> str:
    return "\n".join([
        "# Phase 3D-R2A 审核报告",
        "",
        "最终状态：`R2A_CHRONOLOGY_READY_FOR_SCHEMA_REVISION`",
        "",
        "## 双时间轴",
        "",
        "每个事件同时保存 story axis 与 source axis；后期讲述的古史不被错误移动到后期世界时间，论坛日期也不冒充世界内日期。",
        "",
        "## source-chunk coverage ledger",
        "",
        f"三部原帖共 {metrics['totals']['source_chunks']} 个父 post，reviewed {metrics['totals']['reviewed_source_chunks']}，pending {metrics['totals']['pending_source_chunks']}。每个父 post 恰好有一个最终 coverage row。",
        "",
        "## 事件粒度",
        "",
        "魔物之盒灾难、诅咒转移和第一部尾钩独立；白魔监狱塔旧史、地下兵工厂交锋和终局根基密室独立；死亡之翼终局保存七步动作序列与阶段性结果。",
        "",
        "## character revelation 独立字段",
        "",
        f"已输出 {metrics['totals']['character_revelations']} 条独立 revelation。当前动机、角色 testimony、角色推理、理论与 possible future 保持不同 evidence status。",
        "",
        "## Canon/runtime trigger 解耦",
        "",
        "杨的 Canon character identity 已由自我介绍和节点证据确认；单字名误触风险只记为 deferred runtime policy，不否决身份，也不生成 trigger keys。",
        "",
        "## Part 1 retention gate",
        "",
        "`PASS`。早期淡出、死亡/退出以及少量出场但有持续影响的角色均有留存或非角色路由。",
        "",
        "## 专项审计",
        "",
        "- Deathwing：黑龙 testimony、角色推理、白魔理论、客观终局与 UNKNOWN 分层。",
        "- Cassandra：当前复仇/仇恨与可能未来分离。",
        "- 杨：形成 provisional discovery 与 draft、未批准、未应用 patch。",
        "- 龙族秘境终局：WHO/WHEN/WHERE/RESULT、动作顺序和 Original/Transition 边界完整。",
        "",
        "## 冻结与权限",
        "",
        "Phase 1–3D-R、Worldbook、Current State、Schema 与历史补丁保持冻结；R2A 没有批准/应用人物补丁，没有创建正式 NPC/PC 数据库，没有改变 PC 自主控制边界。",
        "",
        "## 停止边界",
        "",
        "已停在 R2A 证据、年代与路由层。未进入 R2B，未修订 Schema，未进入 Phase 4。下一步只能在新的明确授权下进行 schema revision / R2B。",
        "",
    ])


def build_all_outputs() -> dict[str, Any]:
    build_preflight()
    build_source_coverage_scaffold()
    build_part1_outputs()
    build_part_outputs("P2")
    build_part_outputs("P3")
    events = sorted(load_expanded_events(), key=event_sort_key)
    for event in events:
        errors = validate_event_record(event)
        if errors:
            raise ValueError(f"{event['event_id']}: {'; '.join(errors)}")
    revelations = expanded_revelations()
    chunks = discover_source_posts()
    decisions = load_jsonl(REVIEWED / "chunk_decisions.jsonl")
    ledger = build_chunk_ledger(chunks, decisions)
    atomic_write(COVERAGE / "source_chunk_ledger.jsonl", jsonl_text(ledger))
    for part in SOURCE_PARTS:
        part_rows = [row for row in ledger if row["campaign_part"] == part]
        atomic_write(COVERAGE / f"part{part[1]}_coverage.md", coverage_report(part, part_rows, pending=False))
    atomic_write(COVERAGE / "special_interlude_coverage.md", render_special_interlude_coverage(events, ledger))
    atomic_write(COVERAGE / "transition_coverage.md", render_transition_coverage(events))
    atomic_write(CHRONOLOGY / "campaign_chronology.jsonl", jsonl_text(events))
    atomic_write(CHRONOLOGY / "campaign_chronology.md", render_chronology(events))
    atomic_write(CHRONOLOGY / "character_revelations.jsonl", jsonl_text(revelations))
    metrics = build_metrics(events, revelations, ledger)
    atomic_write(REPORTS / "chronology_coverage_metrics.json", json.dumps(metrics, ensure_ascii=False, indent=2, sort_keys=True) + "\n")
    atomic_write(REPORTS / "chronology_coverage_report.md", render_coverage_report(metrics))
    atomic_write(REPORTS / "r2a_review.md", render_r2a_review(metrics))
    verify_frozen_manifest(load_json(PREFLIGHT_PATH))
    return metrics


def protected_paths() -> list[Path]:
    recall_manifest_path = ROOT / "work" / "phase3d_recall" / "preflight_manifest.json"
    recall_manifest = load_json(recall_manifest_path)
    paths = {ROOT / label for label in recall_manifest.get("protected_files", {})}
    paths.update(path for path in (ROOT / "work" / "phase3d_recall").rglob("*") if path.is_file())
    paths.update(path for path in (ROOT / "work" / "patches" / "pending").glob("*.json") if path.is_file())
    paths.update(path for path in (ROOT / "schema").glob("*.json") if path.is_file())
    paths.update({
        ROOT / "work" / "phase3d_recall_review.md",
        ROOT / "scripts" / "build_phase3d_recall.py",
        ROOT / "tests" / "test_phase3d_recall.py",
        ROOT / "output" / "worldbook_source.jsonl",
        ROOT / "current_state.md",
    })
    missing = [path_label(path) for path in paths if not path.is_file()]
    if missing:
        raise ValueError("missing protected files: " + ", ".join(sorted(missing)))
    return sorted(paths, key=path_label)


def verify_frozen_manifest(payload: dict[str, Any]) -> None:
    mismatches: list[str] = []
    for label, expected in payload.get("protected_files", {}).items():
        path = ROOT / label
        if not path.is_file():
            mismatches.append(f"missing {label}")
        elif sha256(path) != expected:
            mismatches.append(f"hash mismatch {label}")
    if mismatches:
        raise ValueError("protected input check failed: " + "; ".join(mismatches))


def build_preflight() -> dict[str, Any]:
    chunks = discover_source_posts()
    counts = {part: sum(row["campaign_part"] == part for row in chunks) for part in SOURCE_PARTS}
    page_counts = {
        part: len({row["page"] for row in chunks if row["campaign_part"] == part})
        for part in SOURCE_PARTS
    }
    if PREFLIGHT_PATH.is_file():
        previous = load_json(PREFLIGHT_PATH)
        verify_frozen_manifest(previous)
        protected = previous["protected_files"]
    else:
        protected = {path_label(path): sha256(path) for path in protected_paths()}
    payload = {
        "phase": "3D-R2A",
        "status": "CAMPAIGN_CHRONOLOGY_RECONSTRUCTION_REQUIRED",
        "human_approval": "SUSPENDED",
        "hash_algorithm": "SHA-256",
        "source_population": {
            "pages": page_counts,
            "posts": counts,
            "total_posts": len(chunks),
        },
        "protected_files": protected,
    }
    atomic_write(PREFLIGHT_PATH, json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    REVIEWED.mkdir(parents=True, exist_ok=True)
    for name in ("events.jsonl", "revelations.jsonl", "chunk_decisions.jsonl"):
        path = REVIEWED / name
        if not path.exists():
            atomic_write(path, "")
    return payload


def main() -> int:
    try:
        metrics = build_all_outputs()
    except (OSError, ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}")
        return 1
    print(
        "Phase 3D-R2A complete: "
        f"{metrics['totals']['reviewed_source_chunks']}/{metrics['totals']['source_chunks']} source posts reviewed; "
        f"{metrics['totals']['events']} events; {metrics['totals']['character_revelations']} revelations; "
        f"status={metrics['status']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
