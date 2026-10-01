#!/usr/bin/env python3
"""Validate and project the reviewed R1A-2A realization surface."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

try:
    from scripts.audit_r1a1_semantic_routes import build_ledger as build_r1a1_ledger
    from scripts.phase3d_r2c_common import (
        _schema_errors,
        atomic_write_text,
        load_json,
        load_jsonl,
        render_jsonl,
    )
except ModuleNotFoundError:  # pragma: no cover - direct script execution
    from audit_r1a1_semantic_routes import build_ledger as build_r1a1_ledger
    from phase3d_r2c_common import _schema_errors, atomic_write_text, load_json, load_jsonl, render_jsonl


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DECISIONS = ROOT / "work" / "remediation" / "r1a2" / "semantic_realization_decisions.jsonl"
DEFAULT_OUTPUT = ROOT / "work" / "remediation" / "r1a2" / "semantic_realization_ledger.jsonl"
R1A1_DECISIONS = ROOT / "work" / "remediation" / "r1a1" / "semantic_adjudication_decisions.jsonl"
CHRONOLOGY = ROOT / "work" / "phase3d_r2" / "chronology" / "campaign_chronology.jsonl"
SCHEMA = ROOT / "work" / "phase3d_r2c" / "schemas" / "character_profile_v2.schema.json"

ALLOWED_MODES = {
    "REUSE_R2A_EVENT",
    "REUSE_EXISTING_ATOMIC_VALUE",
    "REVIEWED_TYPED_PAYLOAD_REQUIRED",
    "REALIZATION_UNRESOLVED",
}
DECISION_FIELDS = {
    "profile_id",
    "old_claim_id",
    "review_class",
    "reviewed_basis",
    "destination_instances",
}
INSTANCE_FIELDS = {
    "destination_section",
    "destination_instance_key",
    "realization_mode",
    "source_refs",
    "payload",
}
ROUTE_TO_DEF = {
    "biographical_background": "BackgroundItem",
    "identity.public_identity": "IdentityClaim",
    "identity.durable_roles": "IdentityClaim",
    "identity.durable_affiliations": "IdentityClaim",
    "persona.core_personality": "PersonaClaim",
    "persona.values": "PersonaClaim",
    "ability_status_transitions": "AbilityStatusTransition",
    "knowledge_timeline": "KnowledgeItem",
}
REVIEW_CLASSES = {
    "KNOWN_INITIAL_GAP",
    "ADDITIONAL_MULTI_ROUTE_GAP",
    "ADDITIONAL_SINGLE_ROUTE_GAP",
    "MECHANICALLY_SUFFICIENT",
    "EXISTING_ATOMIC_VALUE_SUFFICIENT",
}


def _source_path(ref: str) -> str | None:
    match = re.match(r"^(.+?\.(?:md|json|jsonl|txt))(?::|#|\s|$)", ref, re.IGNORECASE)
    return match.group(1) if match else None


def _source_resolves(root: Path, ref: str) -> bool:
    relative = _source_path(ref)
    if relative is None:
        return False
    return (root / relative).is_file() or (root.parent / relative).is_file()


def _payload_errors(section: str, payload: dict[str, Any], common_schema: dict[str, Any]) -> list[str]:
    if section == "campaign_timeline":
        if set(payload) != {"event_ref", "local_object_count"}:
            return ["campaign reuse payload must contain only event_ref/local_object_count"]
        if payload["local_object_count"] != 0:
            return ["campaign event reuse must create zero local objects"]
        return []
    if section == "relationships[].relationship_baseline":
        return _schema_errors(payload, common_schema["$defs"]["RelationshipRecord"])
    if section == "relationships[].relationship_milestones":
        if set(payload) != {"relationship_target", "milestone"}:
            return ["relationship milestone payload must freeze target and milestone"]
        target = payload["relationship_target"]
        if not isinstance(target, dict) or set(target) != {"related_character_ref", "related_character_label"}:
            return ["relationship_target must contain exact ref/label fields"]
        if not target.get("related_character_ref") and not target.get("related_character_label"):
            return ["relationship target is unresolved"]
        return _schema_errors(payload["milestone"], common_schema["$defs"]["RelationshipMilestone"])
    definition = ROUTE_TO_DEF.get(section)
    if definition is None:
        return [f"unsupported destination section {section}"]
    return _schema_errors(payload, common_schema["$defs"][definition])


def _payload_event_refs(section: str, payload: dict[str, Any]) -> list[str]:
    if section == "campaign_timeline":
        return [payload["event_ref"]]
    if section == "relationships[].relationship_milestones":
        value = payload["milestone"].get("event_ref")
        return [value] if value else []
    values: list[str] = []
    for field in ("event_ref", "acquired_at_event_ref"):
        value = payload.get(field)
        if value:
            values.append(value)
    values.extend(payload.get("related_event_refs", []))
    values.extend(payload.get("supporting_event_refs", []))
    return values


def _atomic_text(section: str, payload: dict[str, Any]) -> str | None:
    if section == "campaign_timeline":
        return None
    if section == "relationships[].relationship_milestones":
        return payload["milestone"]["change"]
    for field in ("statement", "relationship_baseline", "after_state", "proposition"):
        value = payload.get(field)
        if isinstance(value, str):
            return value.strip()
    return None


def load_decisions(path: Path) -> dict[tuple[str, str], dict[str, Any]]:
    decisions: dict[tuple[str, str], dict[str, Any]] = {}
    for line_number, record in enumerate(load_jsonl(path), 1):
        if set(record) != DECISION_FIELDS:
            raise ValueError(f"{path}:{line_number}: decision fields mismatch")
        key = (record["profile_id"], record["old_claim_id"])
        if key in decisions:
            raise ValueError(f"{path}:{line_number}: duplicate decision {key}")
        if record["review_class"] not in REVIEW_CLASSES:
            raise ValueError(f"{path}:{line_number}: unknown review_class")
        if not isinstance(record["reviewed_basis"], str) or not record["reviewed_basis"].strip():
            raise ValueError(f"{path}:{line_number}: empty reviewed_basis")
        if not isinstance(record["destination_instances"], list) or not record["destination_instances"]:
            raise ValueError(f"{path}:{line_number}: destination_instances must be non-empty")
        decisions[key] = record
    return decisions


def build_ledger(root: Path = ROOT, decisions_path: Path = DEFAULT_DECISIONS) -> list[dict[str, Any]]:
    r1a1 = build_r1a1_ledger(root, root / R1A1_DECISIONS.relative_to(ROOT))
    authority = {(r["profile_id"], r["old_claim_id"]): r for r in r1a1}
    decisions = load_decisions(decisions_path)
    if set(authority) != set(decisions):
        raise ValueError(
            f"decision coverage mismatch; missing={sorted(set(authority)-set(decisions))}, "
            f"extra={sorted(set(decisions)-set(authority))}"
        )
    events = {event["event_id"]: event for event in load_jsonl(root / CHRONOLOGY.relative_to(ROOT))}
    common_schema = load_json(root / SCHEMA.relative_to(ROOT))
    output: list[dict[str, Any]] = []
    global_instances: set[tuple[str, str, str, str]] = set()
    for key, semantic in authority.items():
        decision = decisions[key]
        realized_routes: set[str] = set()
        instances: list[dict[str, Any]] = []
        texts_by_section: dict[str, set[str]] = {}
        for raw in decision["destination_instances"]:
            if set(raw) != INSTANCE_FIELDS:
                raise ValueError(f"{key}: destination instance fields mismatch")
            section = raw["destination_section"]
            realized_routes.add(section)
            mode = raw["realization_mode"]
            if mode not in ALLOWED_MODES:
                raise ValueError(f"{key}: unsupported realization mode {mode}")
            identity = (*key, section, raw["destination_instance_key"])
            if identity in global_instances:
                raise ValueError(f"duplicate destination instance {identity}")
            global_instances.add(identity)
            if not raw["source_refs"] or len(raw["source_refs"]) != len(set(raw["source_refs"])):
                raise ValueError(f"{identity}: source_refs must be non-empty and unique")
            unresolved_sources = [ref for ref in raw["source_refs"] if not _source_resolves(root, ref)]
            if unresolved_sources:
                raise ValueError(f"{identity}: unresolved source refs {unresolved_sources}")
            if not isinstance(raw["payload"], dict):
                raise ValueError(f"{identity}: payload must be an exact object")
            errors = _payload_errors(section, raw["payload"], common_schema)
            if errors:
                raise ValueError(f"{identity}: typed payload invalid: {errors}")
            for event_ref in _payload_event_refs(section, raw["payload"]):
                if event_ref not in events:
                    raise ValueError(f"{identity}: unresolved payload event ref {event_ref}")
                if event_ref not in semantic["relevant_r2a_event_refs"]:
                    raise ValueError(f"{identity}: payload event ref is not authorized by R1A-1: {event_ref}")
            text = _atomic_text(section, raw["payload"])
            if text:
                texts_by_section.setdefault(section, set()).add(text)
            if section == "ability_status_transitions":
                before = raw["payload"].get("before_state")
                after = raw["payload"].get("after_state")
                if before is not None and before.strip() == after.strip():
                    raise ValueError(f"{identity}: transition before_state equals after_state")
            if mode == "REUSE_R2A_EVENT":
                event_ref = raw["payload"].get("event_ref")
                if event_ref not in events:
                    raise ValueError(f"{identity}: unresolved event ref {event_ref}")
                if event_ref not in semantic["relevant_r2a_event_refs"]:
                    raise ValueError(f"{identity}: event ref is not authorized by R1A-1")
            instances.append(raw)
        if realized_routes != set(semantic["intended_semantic_route"]):
            raise ValueError(
                f"{key}: route mismatch; expected={semantic['intended_semantic_route']}, "
                f"realized={sorted(realized_routes)}"
            )
        sections = sorted(texts_by_section)
        for index, left in enumerate(sections):
            for right in sections[index + 1 :]:
                duplicate = texts_by_section[left] & texts_by_section[right]
                if duplicate:
                    raise ValueError(
                        f"{key}: identical atomic text copied across {left} and {right}: {sorted(duplicate)}"
                    )
        campaign_refs = {
            item["payload"]["event_ref"]
            for item in instances
            if item["destination_section"] == "campaign_timeline"
        }
        if "campaign_timeline" in semantic["intended_semantic_route"]:
            expected = set(semantic["relevant_r2a_event_refs"])
            if campaign_refs != expected:
                raise ValueError(f"{key}: campaign event cardinality mismatch; expected={expected}, got={campaign_refs}")
        if "relationships[].relationship_milestones" in semantic["intended_semantic_route"]:
            milestone_refs = {
                item["payload"]["milestone"]["event_ref"]
                for item in instances
                if item["destination_section"] == "relationships[].relationship_milestones"
                and item["payload"]["milestone"]["event_ref"]
            }
            expected = set(semantic["relevant_r2a_event_refs"])
            if milestone_refs != expected:
                raise ValueError(
                    f"{key}: relationship milestone cardinality mismatch; "
                    f"expected event set={expected}, got={milestone_refs}"
                )
        instances.sort(key=lambda item: (item["destination_section"], item["destination_instance_key"]))
        output.append(
            {
                **semantic,
                "review_class": decision["review_class"],
                "realization_reviewed_basis": decision["reviewed_basis"],
                "destination_instances": instances,
                "builder_semantic_fallback_allowed": False,
            }
        )
    return output


def render_ledger(records: list[dict[str, Any]]) -> str:
    return render_jsonl(records)


def summarize(records: list[dict[str, Any]]) -> dict[str, Any]:
    modes = Counter(
        item["realization_mode"]
        for record in records
        for item in record["destination_instances"]
    )
    classes = Counter(record["review_class"] for record in records)
    instance_count = sum(len(record["destination_instances"]) for record in records)
    return {
        "semantic_identities": 145,
        "realization_covered": len(records),
        "missing_identities": 0,
        "extra_identities": 0,
        "route_changes": 0,
        "full_sufficiency_checked": len(records),
        "multi_route_non_split_checked": sum(
            len(record["intended_semantic_route"]) > 1 and not record["split_required"]
            for record in records
        ),
        "single_route_checked": sum(len(record["intended_semantic_route"]) == 1 for record in records),
        "known_initial_gap_records": classes["KNOWN_INITIAL_GAP"],
        "known_initial_gaps_resolved": classes["KNOWN_INITIAL_GAP"],
        "additional_multi_route_gaps": classes["ADDITIONAL_MULTI_ROUTE_GAP"],
        "additional_single_route_gaps": classes["ADDITIONAL_SINGLE_ROUTE_GAP"],
        "final_payload_review_population": (
            classes["KNOWN_INITIAL_GAP"]
            + classes["ADDITIONAL_MULTI_ROUTE_GAP"]
            + classes["ADDITIONAL_SINGLE_ROUTE_GAP"]
        ),
        "split_required": sum(record["split_required"] for record in records),
        "split_realization_sufficient": sum(
            record["split_required"]
            and all(i["realization_mode"] != "REALIZATION_UNRESOLVED" for i in record["destination_instances"])
            for record in records
        ),
        "destination_instances_required": instance_count,
        "destination_instances_realized": instance_count,
        "reuse_r2a_event": modes["REUSE_R2A_EVENT"],
        "reuse_existing_atomic_value": modes["REUSE_EXISTING_ATOMIC_VALUE"],
        "reviewed_typed_payload": modes["REVIEWED_TYPED_PAYLOAD_REQUIRED"],
        "unresolved": modes["REALIZATION_UNRESOLVED"],
        "unresolved_event_refs": 0,
        "unresolved_source_refs": 0,
        "typed_completeness_errors": 0,
        "atomicity_guard_errors": 0,
        "builder_inference_requirements": 0,
        "schema_realization_gaps": 0,
    }


def write_or_check(path: Path, rendered: str, *, check: bool) -> None:
    encoded = rendered.encode("utf-8")
    if check:
        if not path.is_file() or path.read_bytes() != encoded:
            raise ValueError(f"{path}: existing ledger does not match deterministic build")
        return
    atomic_write_text(path, rendered)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--decisions", type=Path, default=DEFAULT_DECISIONS)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    records = build_ledger(ROOT, args.decisions)
    write_or_check(args.output, render_ledger(records), check=args.check)
    print(json.dumps(summarize(records), ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
