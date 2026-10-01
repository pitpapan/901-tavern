#!/usr/bin/env python3
"""Validate and project the reviewed R1A-2A.1 relationship-container authority."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from copy import deepcopy
from pathlib import Path
from typing import Any

try:
    from scripts.phase3d_r2c_common import (
        _schema_errors,
        atomic_write_text,
        load_json,
        load_jsonl,
        render_json,
        render_jsonl,
    )
except ModuleNotFoundError:  # pragma: no cover - direct script execution
    from phase3d_r2c_common import (
        _schema_errors,
        atomic_write_text,
        load_json,
        load_jsonl,
        render_json,
        render_jsonl,
    )


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DECISIONS = (
    ROOT / "work" / "remediation" / "r1a2a1" / "relationship_container_decisions.jsonl"
)
DEFAULT_OUTPUT = (
    ROOT / "work" / "remediation" / "r1a2a1" / "relationship_container_ledger.jsonl"
)
R1A2A_LEDGER = ROOT / "work" / "remediation" / "r1a2" / "semantic_realization_ledger.jsonl"
CHRONOLOGY = ROOT / "work" / "phase3d_r2" / "chronology" / "campaign_chronology.jsonl"
SCHEMA = ROOT / "work" / "phase3d_r2c" / "schemas" / "character_profile_v2.schema.json"
RECALL_REPAIRED = ROOT / "work" / "phase3d_recall" / "repaired_candidates"
PHASE3D_CANDIDATES = ROOT / "work" / "phase3d" / "candidates"

BLOCKED_PAIRS = {
    ("NPC_HONDA_KAI_FERGUS", "NPC_YOUYOU"),
    ("NPC_JIANG_ZIYOU", "NPC_CASSIUS_BRIGHT"),
    ("NPC_KENDA_KAI_FERGUS", "PC_YU_LINFENG"),
    ("NPC_LULUTIYE", "NPC_YOUYOU"),
    ("NPC_XIERLUN_VON_GILCODE", "PC_YU_LINFENG"),
    ("NPC_YOUYOU", "PC_YU_LINFENG"),
    ("PC_YU_LINFENG", "NPC_YOUYOU"),
}
ALLOWED_ACTIONS = {
    "USE_EXISTING_CONTAINER",
    "CREATE_REVIEWED_CONTAINER",
    "MERGE_REVIEWED_EXISTING_CONTAINERS",
    "SCHEMA_GAP_CONFIRMED",
}
REQUIRED_FIELDS = {
    "profile_id",
    "target_profile_id",
    "container_action",
    "existing_container_ids",
    "existing_container_candidates",
    "selected_or_new_container_id",
    "relationship_baseline_payload",
    "relationship_baseline_provenance",
    "current_stance",
    "milestone_instance_keys",
    "event_refs",
    "source_refs",
    "temporal_boundary",
    "uncertainty",
    "decision_basis",
    "pc_control_boundary_status",
    "schema_validation_status",
}


def _source_path(ref: str) -> str | None:
    match = re.match(r"^(.+?\.(?:md|json|jsonl|txt))(?::|#|\s|$)", ref, re.IGNORECASE)
    return match.group(1) if match else None


def _source_resolves(root: Path, ref: str) -> bool:
    relative = _source_path(ref)
    return bool(
        relative
        and ((root / relative).is_file() or (root.parent / relative).is_file())
    )


def _effective_profile_path(root: Path, profile_id: str) -> Path:
    repaired = root / RECALL_REPAIRED.relative_to(ROOT) / f"{profile_id}.json"
    if repaired.is_file():
        return repaired
    candidate = root / PHASE3D_CANDIDATES.relative_to(ROOT) / f"{profile_id}.json"
    if candidate.is_file():
        return candidate
    raise ValueError(f"missing effective Phase 3D-R profile: {profile_id}")


def _existing_phase3d_relationship(
    root: Path, profile_id: str, relationship_id: str
) -> dict[str, Any] | None:
    profile = load_json(_effective_profile_path(root, profile_id))
    matches = [
        relationship
        for relationship in profile.get("relationships", [])
        if relationship.get("relationship_id") == relationship_id
    ]
    if len(matches) > 1:
        raise ValueError(f"duplicate Phase 3D-R relationship ID: {profile_id}/{relationship_id}")
    return matches[0] if matches else None


def _phase3d_exact_target_candidates(
    root: Path, profile_id: str, target_profile_id: str
) -> dict[str, dict[str, Any]]:
    profile = load_json(_effective_profile_path(root, profile_id))
    target_worldbook_id = _target_worldbook_id(root, target_profile_id)
    return {
        relationship["relationship_id"]: {
            "baseline": relationship["relationship_type"],
            "provenance": relationship["sources"],
            "current_stance": (
                None
                if not relationship.get("current_stance")
                else relationship["current_stance"]
            ),
            "source_layer": "PHASE3D_R",
        }
        for relationship in profile.get("relationships", [])
        if relationship.get("subject_ref") == target_worldbook_id
    }


def _target_worldbook_id(root: Path, target_profile_id: str) -> str:
    return load_json(_effective_profile_path(root, target_profile_id))["worldbook_id"]


def _reviewed_milestones(root: Path) -> dict[tuple[str, str], list[dict[str, Any]]]:
    grouped: dict[tuple[str, str], list[dict[str, Any]]] = {
        pair: [] for pair in BLOCKED_PAIRS
    }
    identities: set[tuple[str, str, str]] = set()
    ledger_path = root / R1A2A_LEDGER.relative_to(ROOT)
    for record in load_jsonl(ledger_path):
        for instance in record["destination_instances"]:
            if instance["destination_section"] != "relationships[].relationship_milestones":
                continue
            target = instance["payload"]["relationship_target"]["related_character_ref"]
            pair = (record["profile_id"], target)
            if pair not in grouped:
                continue
            identity = (*pair, instance["destination_instance_key"])
            if identity in identities:
                raise ValueError(f"duplicate reviewed milestone instance: {identity}")
            identities.add(identity)
            grouped[pair].append(
                {
                    "old_claim_id": record["old_claim_id"],
                    "destination_instance_key": instance["destination_instance_key"],
                    "milestone": deepcopy(instance["payload"]["milestone"]),
                }
            )
    for pair, milestones in grouped.items():
        if not milestones:
            raise ValueError(f"blocked pair has no reviewed milestones: {pair}")
        milestones.sort(
            key=lambda item: (
                item["milestone"]["story_order"] or "",
                item["destination_instance_key"],
                item["milestone"]["milestone_id"],
            )
        )
    return grouped


def _r1a2a_baseline_candidates(
    root: Path,
) -> dict[tuple[str, str], dict[str, dict[str, Any]]]:
    grouped: dict[tuple[str, str], dict[str, dict[str, Any]]] = {
        pair: {} for pair in BLOCKED_PAIRS
    }
    for record in load_jsonl(root / R1A2A_LEDGER.relative_to(ROOT)):
        baselines = [
            instance
            for instance in record["destination_instances"]
            if instance["destination_section"]
            == "relationships[].relationship_baseline"
        ]
        milestones = [
            instance
            for instance in record["destination_instances"]
            if instance["destination_section"]
            == "relationships[].relationship_milestones"
        ]
        for instance in baselines:
            payload = instance["payload"]
            target = payload["related_character_ref"]
            pair = (record["profile_id"], target)
            if pair not in grouped:
                continue
            relationship_id = payload["relationship_id"]
            if relationship_id in grouped[pair]:
                raise ValueError(
                    f"duplicate R1A-2A exact-target baseline: {pair}/{relationship_id}"
                )
            same_claim_milestones = sorted(
                milestone["destination_instance_key"]
                for milestone in milestones
                if milestone["payload"]["relationship_target"][
                    "related_character_ref"
                ]
                == target
            )
            grouped[pair][relationship_id] = {
                "baseline": payload["relationship_baseline"],
                "provenance": payload["source_refs"],
                "current_stance": payload["current_stance"],
                "milestone_set": same_claim_milestones,
                "source_layer": "R1A2A",
                "old_claim_id": record["old_claim_id"],
            }
    return grouped


def _load_decisions(path: Path) -> tuple[list[dict[str, Any]], int]:
    records = load_jsonl(path)
    pairs = [(record.get("profile_id"), record.get("target_profile_id")) for record in records]
    duplicate_count = len(pairs) - len(set(pairs))
    if duplicate_count:
        raise ValueError(f"duplicate relationship-container decision pairs: {duplicate_count}")
    for line_number, record in enumerate(records, 1):
        missing = REQUIRED_FIELDS - set(record)
        extra = set(record) - REQUIRED_FIELDS
        if missing or extra:
            raise ValueError(
                f"{path}:{line_number}: decision fields mismatch; "
                f"missing={sorted(missing)}, extra={sorted(extra)}"
            )
        if record["container_action"] not in ALLOWED_ACTIONS:
            raise ValueError(f"{path}:{line_number}: invalid container_action")
    return records, duplicate_count


def _unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(values))


def build_ledger(
    root: Path = ROOT, decisions_path: Path = DEFAULT_DECISIONS
) -> list[dict[str, Any]]:
    decisions, _ = _load_decisions(decisions_path)
    by_pair = {
        (record["profile_id"], record["target_profile_id"]): record
        for record in decisions
    }
    if set(by_pair) != BLOCKED_PAIRS:
        raise ValueError(
            "relationship-container decision coverage mismatch; "
            f"missing={sorted(BLOCKED_PAIRS - set(by_pair))}, "
            f"extra={sorted(set(by_pair) - BLOCKED_PAIRS)}"
        )
    reviewed = _reviewed_milestones(root)
    r1a2a_candidates = _r1a2a_baseline_candidates(root)
    events = {
        event["event_id"]
        for event in load_jsonl(root / CHRONOLOGY.relative_to(ROOT))
    }
    relationship_schema = load_json(root / SCHEMA.relative_to(ROOT))["$defs"][
        "RelationshipRecord"
    ]
    result: list[dict[str, Any]] = []

    for pair in sorted(BLOCKED_PAIRS):
        decision = deepcopy(by_pair[pair])
        profile_id, target_profile_id = pair
        action = decision["container_action"]
        expected = reviewed[pair]
        expected_keys = {item["destination_instance_key"] for item in expected}
        assigned_keys = decision["milestone_instance_keys"]
        if len(assigned_keys) != len(set(assigned_keys)):
            raise ValueError(f"{pair}: duplicate milestone assignment")
        if set(assigned_keys) != expected_keys:
            raise ValueError(
                f"{pair}: milestone-set mismatch; "
                f"missing={sorted(expected_keys - set(assigned_keys))}, "
                f"extra={sorted(set(assigned_keys) - expected_keys)}"
            )
        expected_event_refs = {item["milestone"]["event_ref"] for item in expected}
        if set(decision["event_refs"]) != expected_event_refs:
            raise ValueError(f"{pair}: event_refs do not equal assigned milestone event refs")
        unresolved_events = sorted(expected_event_refs - events)
        if unresolved_events:
            raise ValueError(f"{pair}: unresolved event refs {unresolved_events}")
        for field in (
            "source_refs",
            "relationship_baseline_provenance",
        ):
            values = decision[field]
            if not values or len(values) != len(set(values)):
                raise ValueError(f"{pair}: {field} must be non-empty and unique")
            unresolved = [ref for ref in values if not _source_resolves(root, ref)]
            if unresolved:
                raise ValueError(f"{pair}: unresolved {field}: {unresolved}")
        if not decision["decision_basis"].strip():
            raise ValueError(f"{pair}: empty decision_basis")
        if not isinstance(decision["temporal_boundary"], dict):
            raise ValueError(f"{pair}: temporal_boundary must be explicit")
        expected_pc_status = (
            "PRESERVED" if "PC_YU_LINFENG" in pair else "NOT_APPLICABLE"
        )
        if decision["pc_control_boundary_status"] != expected_pc_status:
            raise ValueError(f"{pair}: PC control boundary status mismatch")

        phase3d_candidates = _phase3d_exact_target_candidates(
            root, profile_id, target_profile_id
        )
        derived_candidates = {
            **phase3d_candidates,
            **r1a2a_candidates[pair],
        }
        if len(derived_candidates) != len(phase3d_candidates) + len(
            r1a2a_candidates[pair]
        ):
            raise ValueError(f"{pair}: candidate ID collision across authority layers")
        candidate_ids = [candidate["container_id"] for candidate in decision["existing_container_candidates"]]
        if sorted(candidate_ids) != sorted(decision["existing_container_ids"]):
            raise ValueError(f"{pair}: decision candidate ID fields disagree")
        if set(candidate_ids) != set(derived_candidates):
            raise ValueError(
                f"{pair}: existing candidate inventory mismatch; "
                f"missing={sorted(set(derived_candidates) - set(candidate_ids))}, "
                f"extra={sorted(set(candidate_ids) - set(derived_candidates))}"
            )
        if len(candidate_ids) != len(set(candidate_ids)):
            raise ValueError(f"{pair}: duplicate existing candidate container")
        reviewed_candidate_by_id = {
            candidate["container_id"]: candidate
            for candidate in decision["existing_container_candidates"]
        }
        for container_id, derived in derived_candidates.items():
            reviewed_candidate = reviewed_candidate_by_id[container_id]
            for field in ("baseline", "provenance", "current_stance"):
                if reviewed_candidate[field] != derived[field]:
                    raise ValueError(
                        f"{pair}/{container_id}: candidate {field} does not match "
                        f"{derived['source_layer']} authority"
                    )
            if not reviewed_candidate["temporal_scope"].strip():
                raise ValueError(f"{pair}/{container_id}: empty candidate temporal scope")
            if not reviewed_candidate["semantic_role"].strip():
                raise ValueError(f"{pair}/{container_id}: empty candidate semantic role")
            expected_candidate_milestones = (
                sorted(decision["milestone_instance_keys"])
                if derived["source_layer"] == "PHASE3D_R"
                and container_id == decision["selected_or_new_container_id"]
                else derived.get("milestone_set", [])
            )
            if sorted(reviewed_candidate["milestone_set"]) != expected_candidate_milestones:
                raise ValueError(
                    f"{pair}/{container_id}: candidate milestone set does not match "
                    f"{derived['source_layer']} authority / reviewed assignment"
                )

        if action == "SCHEMA_GAP_CONFIRMED":
            if decision["relationship_baseline_payload"] is not None:
                raise ValueError(f"{pair}: schema gap must not synthesize a baseline")
            if decision["selected_or_new_container_id"] is not None:
                raise ValueError(f"{pair}: schema gap must not select a container")
            enriched = {
                **decision,
                "assigned_milestones": expected,
                "complete_relationship_record": None,
                "schema_validation_errors": [
                    "Frozen RelationshipRecord requires a nonempty relationship_baseline."
                ],
                "schema_validation_status": "SCHEMA_GAP_CONFIRMED",
                "milestone_assignment_equality": "PASS",
                "runtime_container_inference_required": False,
            }
            result.append(enriched)
            continue

        payload = decision["relationship_baseline_payload"]
        if not isinstance(payload, dict):
            raise ValueError(f"{pair}: resolved action requires baseline payload")
        if decision["schema_validation_status"] != "PASS":
            raise ValueError(f"{pair}: reviewed schema status is not PASS")
        if payload["relationship_id"] != decision["selected_or_new_container_id"]:
            raise ValueError(f"{pair}: selected container ID does not match payload")
        if payload["related_character_ref"] != target_profile_id:
            raise ValueError(f"{pair}: baseline payload target mismatch")
        if payload["current_stance"] != decision["current_stance"]:
            raise ValueError(f"{pair}: current stance boundary mismatch")
        if payload["relationship_milestones"]:
            raise ValueError(f"{pair}: decision baseline payload must not pre-embed milestones")
        if not set(decision["relationship_baseline_provenance"]).issubset(
            payload["source_refs"]
        ):
            raise ValueError(f"{pair}: baseline provenance missing from payload")
        unresolved_payload_sources = [
            ref for ref in payload["source_refs"] if not _source_resolves(root, ref)
        ]
        if unresolved_payload_sources:
            raise ValueError(
                f"{pair}: unresolved baseline payload sources {unresolved_payload_sources}"
            )

        if action == "USE_EXISTING_CONTAINER":
            selected_id = decision["selected_or_new_container_id"]
            if selected_id not in decision["existing_container_ids"]:
                raise ValueError(f"{pair}: selected existing container not in inventory")
            existing = _existing_phase3d_relationship(root, profile_id, selected_id)
            if existing is None:
                raise ValueError(f"{pair}: selected Phase 3D-R container does not exist")
            if existing["subject_ref"] != _target_worldbook_id(root, target_profile_id):
                raise ValueError(f"{pair}: selected Phase 3D-R container target mismatch")
            if existing["relationship_type"] != payload["relationship_baseline"]:
                raise ValueError(f"{pair}: selected existing baseline was changed")
            if existing["sources"] != payload["source_refs"]:
                raise ValueError(f"{pair}: selected existing provenance was changed")
        elif action == "CREATE_REVIEWED_CONTAINER":
            if decision["existing_container_ids"]:
                raise ValueError(f"{pair}: create action claims existing exact-target containers")
            if _existing_phase3d_relationship(
                root, profile_id, decision["selected_or_new_container_id"]
            ):
                raise ValueError(f"{pair}: new container ID already exists")
        elif action == "MERGE_REVIEWED_EXISTING_CONTAINERS":
            if len(decision["existing_container_ids"]) < 2:
                raise ValueError(f"{pair}: merge requires at least two source containers")

        milestones = [item["milestone"] for item in expected]
        complete = deepcopy(payload)
        complete["relationship_milestones"] = milestones
        complete["source_refs"] = _unique(
            complete["source_refs"]
            + [ref for milestone in milestones for ref in milestone["source_refs"]]
        )
        errors = _schema_errors(complete, relationship_schema)
        if errors:
            raise ValueError(f"{pair}: complete RelationshipRecord invalid: {errors}")
        result.append(
            {
                **decision,
                "assigned_milestones": expected,
                "complete_relationship_record": complete,
                "schema_validation_errors": [],
                "schema_validation_status": "PASS",
                "milestone_assignment_equality": "PASS",
                "runtime_container_inference_required": False,
            }
        )

    return result


def summarize(records: list[dict[str, Any]]) -> dict[str, Any]:
    pairs = [(record["profile_id"], record["target_profile_id"]) for record in records]
    expected_milestones = sum(len(record["assigned_milestones"]) for record in records)
    assigned_identities = [
        (
            record["profile_id"],
            record["target_profile_id"],
            milestone["destination_instance_key"],
        )
        for record in records
        for milestone in record["assigned_milestones"]
    ]
    actions = Counter(record["container_action"] for record in records)
    gaps = actions["SCHEMA_GAP_CONFIRMED"]
    schema_passed = sum(
        record["schema_validation_status"] == "PASS" for record in records
    )
    return {
        "blocked_pairs": len(BLOCKED_PAIRS),
        "reviewed_decisions": len(records),
        "missing_pairs": len(BLOCKED_PAIRS - set(pairs)),
        "extra_pairs": len(set(pairs) - BLOCKED_PAIRS),
        "duplicate_pairs": len(pairs) - len(set(pairs)),
        "resolved_under_frozen_schema": len(records) - gaps,
        "schema_gaps_confirmed": gaps,
        "expected_milestones": expected_milestones,
        "assigned_exactly_once": len(set(assigned_identities)),
        "missing_milestones": 0,
        "extra_milestones": 0,
        "duplicate_milestone_assignments": len(assigned_identities)
        - len(set(assigned_identities)),
        "complete_relationship_records_passed": schema_passed,
        "complete_relationship_records_failed": len(records) - gaps - schema_passed,
        "runtime_container_inference_required": sum(
            record["runtime_container_inference_required"] for record in records
        ),
        "container_actions": dict(sorted(actions.items())),
    }


def render_ledger(records: list[dict[str, Any]]) -> str:
    return render_jsonl(records)


def write_or_check(path: Path, rendered: str, check: bool) -> None:
    if check:
        if not path.is_file() or path.read_text(encoding="utf-8-sig") != rendered:
            raise ValueError(f"{path} does not match deterministic R1A-2A.1 ledger")
        return
    atomic_write_text(path, rendered)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--decisions", type=Path, default=DEFAULT_DECISIONS)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    records = build_ledger(ROOT, args.decisions)
    write_or_check(args.output, render_ledger(records), args.check)
    print(render_json(summarize(records)).strip())


if __name__ == "__main__":
    main()
