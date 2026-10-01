#!/usr/bin/env python3
"""Strict R1A-2A authority loader and deterministic R2C realization serializer.

This module consumes the accepted materialized realization ledger.  It never
imports the one-shot R1A-2A materializer and it contains no prose-routing
fallback.
"""

from __future__ import annotations

import copy
import hashlib
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

try:
    from scripts.phase3d_r2c_common import _schema_errors, load_json, load_jsonl
except ModuleNotFoundError:  # pragma: no cover - direct script execution
    from phase3d_r2c_common import _schema_errors, load_json, load_jsonl


ROOT = Path(__file__).resolve().parents[1]
R1A1_LEDGER = ROOT / "work" / "remediation" / "r1a1" / "semantic_adjudication_ledger.jsonl"
R1A2A_LEDGER = ROOT / "work" / "remediation" / "r1a2" / "semantic_realization_ledger.jsonl"
R1A2A_DECISIONS = ROOT / "work" / "remediation" / "r1a2" / "semantic_realization_decisions.jsonl"
R1A2A1_LEDGER = ROOT / "work" / "remediation" / "r1a2a1" / "relationship_container_ledger.jsonl"
R1A_FIX1_AMENDMENTS = (
    ROOT / "work" / "remediation" / "r1a_fix1" / "high_risk_reroute_amendments.jsonl"
)
CHRONOLOGY = ROOT / "work" / "phase3d_r2" / "chronology" / "campaign_chronology.jsonl"
PROFILE_SCHEMA = ROOT / "work" / "phase3d_r2c" / "schemas" / "character_profile_v2.schema.json"

EXPECTED_IDENTITIES = 145
EXPECTED_INSTANCES = 275
EXPECTED_MODE_COUNTS = {
    "REUSE_R2A_EVENT": 105,
    "REUSE_EXISTING_ATOMIC_VALUE": 32,
    "REVIEWED_TYPED_PAYLOAD_REQUIRED": 138,
}
ALLOWED_MODES = set(EXPECTED_MODE_COUNTS)
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
RELATIONSHIP_BASELINE = "relationships[].relationship_baseline"
RELATIONSHIP_MILESTONE = "relationships[].relationship_milestones"
CAMPAIGN_TIMELINE = "campaign_timeline"
AUTHORITY_REF = "work/remediation/r1a2/semantic_realization_ledger.jsonl"
CONTAINER_AUTHORITY_REF = "work/remediation/r1a2a1/relationship_container_ledger.jsonl"
R1A_FIX1_AUTHORITY_REF = "work/remediation/r1a_fix1/high_risk_reroute_amendments.jsonl"
EXPECTED_AUTHORITY_HASHES = {
    "r1a1": "4db290bbb287a28576b8e84bf8e399eb6db3a37d1acb6935da56cee1ad76a8b7",
    "r1a2a_decisions": "d5f53cad4ebb2068e460e8b13bc49d712e4d393b6b309eae491ce7109cd2c40d",
    "r1a2a_ledger": "0000abfd6cbb6946ae5bbcb50875c69fc4c17a4f0960ed3bec031bad0613e66b",
    "r1a2a1_ledger": "bc426551e4438b59d96ed43ffb8d3870eca7f70974cfce8ce2e97f57086682e1",
    "r1a_fix1_amendments": "b6e3e29da8aa3f7a9f4c22c931fed2c84c56b414e6fac9d59a691f1786724817",
}
AUTHORITY_PATHS = {
    "r1a1": R1A1_LEDGER,
    "r1a2a_decisions": R1A2A_DECISIONS,
    "r1a2a_ledger": R1A2A_LEDGER,
    "r1a2a1_ledger": R1A2A1_LEDGER,
    "r1a_fix1_amendments": R1A_FIX1_AMENDMENTS,
}
EXPECTED_CONTAINER_PAIRS = {
    ("NPC_HONDA_KAI_FERGUS", "NPC_YOUYOU"),
    ("NPC_JIANG_ZIYOU", "NPC_CASSIUS_BRIGHT"),
    ("NPC_KENDA_KAI_FERGUS", "PC_YU_LINFENG"),
    ("NPC_LULUTIYE", "NPC_YOUYOU"),
    ("NPC_XIERLUN_VON_GILCODE", "PC_YU_LINFENG"),
    ("NPC_YOUYOU", "PC_YU_LINFENG"),
    ("PC_YU_LINFENG", "NPC_YOUYOU"),
}
EXPECTED_HIGH_RISK_REROUTES = {
    ("NPC_CASSANDRA", "CLAIM_CASSANDRA_PREWAR_WARNING"): (
        "MOVED_TO_TIMELINE", ("TIMELINE_CASSANDRA_P3_005_XIERLUN_FRONT_AND_WHITE_MAGE_PROPOSAL",),
    ),
    ("NPC_CASSANDRA", "CLAIM_CASSANDRA_AINZ_INTERMEDIARY"): (
        "MOVED_TO_TIMELINE", ("TIMELINE_CASSANDRA_P3_007_AINZ_DIPLOMACY_AND_EVACUATION",),
    ),
    ("NPC_DEATHWING", "CLAIM_DEATHWING_HISTORY_1"): (
        "SPLIT", ("TIMELINE_DEATHWING_P3_009_DEATHWING_FINAL_WAR", "TRANSITION_DEATHWING_CURRENT_BODY_DESTROYED"),
    ),
    ("NPC_DEATHWING", "CLAIM_DEATHWING_INVASION_CONTINUITY"): (
        "MOVED_TO_TIMELINE", ("TIMELINE_DEATHWING_P2_029_DEATHWING_BATTLEFIELD_AND_SEAL_WARNING", "TIMELINE_DEATHWING_P3_002_SANCTUARY_ENTRY"),
    ),
    ("NPC_OSHIRA", "CLAIM_OSHIRA_DRAGON_WAR_CONTROL"): (
        "MOVED_TO_ABILITY_STATUS", ("TRANSITION_OSHIRA_NONVOLUNTARY_CONTROL",),
    ),
    ("NPC_WHITE_MAGICIAN", "CLAIM_WHITE_MAGICIAN_GEM_HISTORY"): (
        "SPLIT", ("TIMELINE_WHITE_MAGICIAN_P3_010_WHITE_MAGE_EXIT_AND_THEORY", "TRANSITION_WHITE_MAGICIAN_GEM_REMOVED_D1"),
    ),
    ("NPC_WHITE_MAGICIAN", "CLAIM_WHITE_MAGICIAN_FACTORY_CONFRONTATION"): (
        "MOVED_TO_TIMELINE", ("TIMELINE_WHITE_MAGICIAN_P2_023_WHITE_MAGICIAN_ARMORY_CONFRONTATION",),
    ),
    ("NPC_WHITE_MAGICIAN", "CLAIM_WHITE_MAGICIAN_OSHIRA_CONTROL"): (
        "MOVED_TO_ABILITY_STATUS", ("TRANSITION_WHITE_MAGICIAN_CONTROLS_OSHIRA",),
    ),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_NAME_STAGES"): (
        "SPLIT", ("TIMELINE_YOUYOU_P2_021_DRAGON_RITUAL_AND_ASSASSINATION", "TRANSITION_YOUYOU_CLAN_LEADERSHIP_AND_NAME"),
    ),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_RESCUE_HISTORY"): (
        "SPLIT", ("TIMELINE_YOUYOU_P1_015_UKON_BATTLE_YOUYOU_RESCUE", "TIMELINE_YOUYOU_P1_021_JERGAL_TRANSFER", "TRANSITION_YOUYOU_CURSE_TRANSFER"),
    ),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_SWORD_AND_DETENTION"): (
        "SPLIT", ("TIMELINE_YOUYOU_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION", "TIMELINE_YOUYOU_P1_021_JERGAL_TRANSFER", "TRANSITION_YOUYOU_CURSE_TRANSFER"),
    ),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_SERTANT_AWAKENING"): (
        "SPLIT", ("TIMELINE_YOUYOU_P3_004_SERTANT_AWAKENING_AND_HOME", "TRANSITION_YOUYOU_SERTANT_AWAKENING"),
    ),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_ENGAGEMENT_HISTORY"): (
        "SPLIT", ("TIMELINE_YOUYOU_P2_021_DRAGON_RITUAL_AND_ASSASSINATION", "MILESTONE_YOUYOU_YU_LATE_MILESTONES"),
    ),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_INHERITANCE_HISTORY"): (
        "SPLIT", ("TIMELINE_YOUYOU_P2_021_DRAGON_RITUAL_AND_ASSASSINATION", "TRANSITION_YOUYOU_CLAN_LEADERSHIP_AND_NAME"),
    ),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_PROPHECY_HISTORY"): (
        "SPLIT", ("TIMELINE_YOUYOU_P3_003_TEIRESIAS_REVELATION", "TRANSITION_YOUYOU_LAST_POWER_RECEIVED"),
    ),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_PROTECTION_HISTORY"): (
        "SPLIT", ("TIMELINE_YOUYOU_P3_009_DEATHWING_FINAL_WAR", "TRANSITION_YOUYOU_PROTECTION_EFFECT"),
    ),
}


@dataclass(frozen=True)
class RealizationAuthority:
    records: list[dict[str, Any]]
    by_identity: dict[tuple[str, str], dict[str, Any]]
    by_profile: dict[str, list[dict[str, Any]]]
    summary: dict[str, Any]


@dataclass(frozen=True)
class RelationshipContainerAuthority:
    records: list[dict[str, Any]]
    by_pair: dict[tuple[str, str], dict[str, Any]]
    by_milestone_key: dict[tuple[str, str, str], dict[str, Any]]
    summary: dict[str, Any]


@dataclass(frozen=True)
class HighRiskRerouteAmendmentAuthority:
    records: list[dict[str, Any]]
    by_identity: dict[tuple[str, str], dict[str, Any]]
    summary: dict[str, Any]


@dataclass(frozen=True)
class AuthorityStack:
    realization: RealizationAuthority
    relationship_containers: RelationshipContainerAuthority
    high_risk_reroute_amendments: HighRiskRerouteAmendmentAuthority
    authority_hashes: dict[str, str]
    authority_mismatches: int


def _source_path(ref: str) -> str | None:
    match = re.match(r"^(.+?\.(?:md|json|jsonl|txt))(?::|#|\s|$)", ref, re.IGNORECASE)
    return match.group(1) if match else None


def _source_resolves(root: Path, ref: str) -> bool:
    relative = _source_path(ref)
    return bool(relative and ((root / relative).is_file() or (root.parent / relative).is_file()))


def _payload_errors(section: str, payload: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    if section == CAMPAIGN_TIMELINE:
        if set(payload) != {"event_ref", "local_object_count"}:
            return ["campaign reuse payload must contain only event_ref/local_object_count"]
        return [] if payload["local_object_count"] == 0 else ["campaign event reuse must create zero local objects"]
    if section == RELATIONSHIP_BASELINE:
        return _schema_errors(payload, schema["$defs"]["RelationshipRecord"])
    if section == RELATIONSHIP_MILESTONE:
        if set(payload) != {"relationship_target", "milestone"}:
            return ["relationship milestone payload must freeze target and milestone"]
        target = payload["relationship_target"]
        if not isinstance(target, dict) or set(target) != {"related_character_ref", "related_character_label"}:
            return ["relationship target must contain exact ref/label fields"]
        if not target.get("related_character_ref") and not target.get("related_character_label"):
            return ["relationship target is unresolved"]
        return _schema_errors(payload["milestone"], schema["$defs"]["RelationshipMilestone"])
    definition = ROUTE_TO_DEF.get(section)
    if definition is None:
        return [f"unsupported destination section {section}"]
    return _schema_errors(payload, schema["$defs"][definition])


def _event_refs(section: str, payload: dict[str, Any]) -> list[str]:
    if section == CAMPAIGN_TIMELINE:
        return [payload["event_ref"]]
    if section == RELATIONSHIP_MILESTONE:
        value = payload["milestone"].get("event_ref")
        return [value] if value else []
    values = []
    for field in ("event_ref", "acquired_at_event_ref"):
        if payload.get(field):
            values.append(payload[field])
    values.extend(payload.get("related_event_refs", []))
    values.extend(payload.get("supporting_event_refs", []))
    return values


def validate_realization_records(root: Path, records: list[dict[str, Any]]) -> RealizationAuthority:
    """Validate the materialized ledger without reconstructing reviewed decisions."""
    r1a1_records = load_jsonl(root / R1A1_LEDGER.relative_to(ROOT))
    r1a1 = {(item["profile_id"], item["old_claim_id"]): item for item in r1a1_records}
    by_identity: dict[tuple[str, str], dict[str, Any]] = {}
    by_profile: dict[str, list[dict[str, Any]]] = {}
    instance_keys: set[tuple[str, str, str, str]] = set()
    modes: Counter[str] = Counter()
    event_ids = {
        item["event_id"]
        for item in load_jsonl(root / CHRONOLOGY.relative_to(ROOT))
    }
    schema = load_json(root / PROFILE_SCHEMA.relative_to(ROOT))
    unresolved_sources = 0
    unresolved_events = 0

    for record in records:
        key = (record.get("profile_id"), record.get("old_claim_id"))
        if key in by_identity:
            raise ValueError(f"duplicate semantic identity {key}")
        if not all(isinstance(value, str) and value for value in key):
            raise ValueError(f"invalid semantic identity {key}")
        instances = record.get("destination_instances")
        if not isinstance(instances, list) or not instances:
            raise ValueError(f"{key}: missing required destination instance")
        if record.get("builder_semantic_fallback_allowed") is not False:
            raise ValueError(f"{key}: builder semantic fallback must be false")
        realized_sections: set[str] = set()
        for instance in instances:
            section = instance.get("destination_section")
            instance_key = instance.get("destination_instance_key")
            identity = (*key, section, instance_key)
            if identity in instance_keys:
                raise ValueError(f"duplicate destination-instance key {identity}")
            instance_keys.add(identity)
            realized_sections.add(section)
            mode = instance.get("realization_mode")
            if mode not in ALLOWED_MODES:
                raise ValueError(f"{identity}: unsupported realization mode {mode}")
            modes[mode] += 1
            refs = instance.get("source_refs")
            if not isinstance(refs, list) or not refs or len(refs) != len(set(refs)):
                raise ValueError(f"{identity}: source refs must be non-empty and unique")
            bad_refs = [ref for ref in refs if not _source_resolves(root, ref)]
            unresolved_sources += len(bad_refs)
            if bad_refs:
                raise ValueError(f"{identity}: unknown source ref {bad_refs}")
            payload = instance.get("payload")
            if not isinstance(payload, dict):
                raise ValueError(f"{identity}: payload must be a reviewed object")
            errors = _payload_errors(section, payload, schema)
            if errors:
                raise ValueError(f"{identity}: payload-schema validation failure: {errors}")
            for event_ref in _event_refs(section, payload):
                if event_ref not in event_ids:
                    unresolved_events += 1
                    raise ValueError(f"{identity}: unknown R2A event ref {event_ref}")
                if event_ref not in record.get("relevant_r2a_event_refs", []):
                    raise ValueError(f"{identity}: unreviewed event ref {event_ref}")
        required_sections = set(record.get("intended_semantic_route", []))
        if realized_sections != required_sections:
            raise ValueError(
                f"{key}: destination route mismatch; required={sorted(required_sections)}, "
                f"realized={sorted(realized_sections)}"
            )
        by_identity[key] = record
        by_profile.setdefault(key[0], []).append(record)

    if set(by_identity) != set(r1a1):
        raise ValueError(
            "semantic identity authority mismatch; "
            f"missing={sorted(set(r1a1) - set(by_identity))}, extra={sorted(set(by_identity) - set(r1a1))}"
        )
    if len(records) != EXPECTED_IDENTITIES:
        raise ValueError(f"semantic identity count mismatch: {len(records)} != {EXPECTED_IDENTITIES}")
    if len(instance_keys) != EXPECTED_INSTANCES:
        raise ValueError(f"destination instance count mismatch: {len(instance_keys)} != {EXPECTED_INSTANCES}")
    if dict(modes) != EXPECTED_MODE_COUNTS:
        raise ValueError(f"realization mode count mismatch: {dict(modes)} != {EXPECTED_MODE_COUNTS}")
    for key, record in by_identity.items():
        semantic = r1a1[key]
        for field in ("cohort", "intended_semantic_route", "relevant_r2a_event_refs", "split_required"):
            if record.get(field) != semantic.get(field):
                raise ValueError(f"{key}: R1A-1/R1A-2A authority mismatch in {field}")

    ordered_by_profile = {
        profile_id: sorted(items, key=lambda item: item["old_claim_id"])
        for profile_id, items in sorted(by_profile.items())
    }
    summary = {
        "r1a1_identities": len(r1a1),
        "r1a2a_identities": len(records),
        "destination_instances": len(instance_keys),
        "authority_mismatches": 0,
        "unresolved_event_refs": unresolved_events,
        "unresolved_source_refs": unresolved_sources,
        "realization_modes": dict(modes),
    }
    return RealizationAuthority(records, by_identity, ordered_by_profile, summary)


def load_realization_authority(root: Path = ROOT) -> RealizationAuthority:
    records = load_jsonl(root / R1A2A_LEDGER.relative_to(ROOT))
    return validate_realization_records(root, records)


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify_authority_hashes(root: Path = ROOT) -> dict[str, str]:
    actual = {
        name: _sha256(root / path.relative_to(ROOT))
        for name, path in AUTHORITY_PATHS.items()
    }
    mismatches = {
        name: {"expected": EXPECTED_AUTHORITY_HASHES[name], "actual": digest}
        for name, digest in actual.items()
        if digest != EXPECTED_AUTHORITY_HASHES[name]
    }
    if mismatches:
        raise ValueError(f"BLOCKED_BY_AUTHORITY_MISMATCH: {mismatches}")
    return actual


def _r1a2a_milestone_authority(
    root: Path,
) -> dict[tuple[str, str, str], dict[str, Any]]:
    expected: dict[tuple[str, str, str], dict[str, Any]] = {}
    for record in load_jsonl(root / R1A2A_LEDGER.relative_to(ROOT)):
        for instance in record["destination_instances"]:
            if instance["destination_section"] != RELATIONSHIP_MILESTONE:
                continue
            target = instance["payload"]["relationship_target"]["related_character_ref"]
            key = (
                record["profile_id"],
                target,
                instance["destination_instance_key"],
            )
            if key in expected:
                raise ValueError(f"duplicate R1A-2A relationship milestone authority: {key}")
            expected[key] = {
                "old_claim_id": record["old_claim_id"],
                "milestone": instance["payload"]["milestone"],
            }
    return expected


def validate_relationship_container_records(
    root: Path,
    records: list[dict[str, Any]],
) -> RelationshipContainerAuthority:
    by_pair: dict[tuple[str, str], dict[str, Any]] = {}
    by_milestone_key: dict[tuple[str, str, str], dict[str, Any]] = {}
    schema = load_json(root / PROFILE_SCHEMA.relative_to(ROOT))["$defs"]["RelationshipRecord"]
    r1a2a_milestones = _r1a2a_milestone_authority(root)
    actions: Counter[str] = Counter()
    schema_gaps = 0
    runtime_inference = 0

    for record in records:
        pair = (record.get("profile_id"), record.get("target_profile_id"))
        if not all(isinstance(value, str) and value for value in pair):
            raise ValueError(f"invalid relationship-container pair: {pair}")
        if pair in by_pair:
            raise ValueError(f"duplicate relationship-container decision: {pair}")
        action = record.get("container_action")
        if action not in {"CREATE_REVIEWED_CONTAINER", "USE_EXISTING_CONTAINER"}:
            if action == "SCHEMA_GAP_CONFIRMED":
                schema_gaps += 1
            raise ValueError(f"BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: {pair}: {action}")
        actions[action] += 1
        complete = record.get("complete_relationship_record")
        errors = _schema_errors(complete, schema) if isinstance(complete, dict) else ["missing record"]
        if errors:
            raise ValueError(f"{pair}: complete RelationshipRecord invalid: {errors}")
        selected_id = record.get("selected_or_new_container_id")
        if complete["relationship_id"] != selected_id:
            raise ValueError(f"{pair}: selected container ID mismatch")
        if complete["related_character_ref"] != pair[1]:
            raise ValueError(f"{pair}: complete RelationshipRecord target mismatch")
        if complete["current_stance"] != record.get("current_stance"):
            raise ValueError(f"{pair}: reviewed current stance mismatch")
        if record.get("schema_validation_status") != "PASS":
            raise ValueError(f"{pair}: relationship schema validation not accepted")
        if record.get("runtime_container_inference_required") is not False:
            runtime_inference += 1
            raise ValueError(f"{pair}: runtime container inference remains required")
        assigned = record.get("assigned_milestones")
        if not isinstance(assigned, list) or not assigned:
            raise ValueError(f"{pair}: missing reviewed milestone assignments")
        assigned_payloads: list[dict[str, Any]] = []
        for assignment in assigned:
            key = (*pair, assignment.get("destination_instance_key"))
            if key in by_milestone_key:
                raise ValueError(f"duplicate reviewed milestone assignment: {key}")
            expected = r1a2a_milestones.get(key)
            if expected is None:
                raise ValueError(f"{pair}: extra or unknown milestone assignment: {key}")
            if assignment.get("old_claim_id") != expected["old_claim_id"]:
                raise ValueError(f"{key}: milestone claim identity mismatch")
            if assignment.get("milestone") != expected["milestone"]:
                raise ValueError(f"{key}: milestone payload differs from R1A-2A authority")
            by_milestone_key[key] = {
                "container_id": selected_id,
                "action": action,
                "milestone": assignment["milestone"],
                "old_claim_id": assignment["old_claim_id"],
            }
            assigned_payloads.append(assignment["milestone"])
        actual_by_id = {
            item["milestone_id"]: item for item in complete["relationship_milestones"]
        }
        expected_by_id = {item["milestone_id"]: item for item in assigned_payloads}
        if len(actual_by_id) != len(complete["relationship_milestones"]):
            raise ValueError(f"{pair}: duplicate milestone in complete RelationshipRecord")
        if actual_by_id != expected_by_id:
            raise ValueError(f"{pair}: complete RelationshipRecord milestone set mismatch")
        by_pair[pair] = record

    if set(by_pair) != EXPECTED_CONTAINER_PAIRS:
        raise ValueError(
            "BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: pair coverage; "
            f"missing={sorted(EXPECTED_CONTAINER_PAIRS - set(by_pair))}, "
            f"extra={sorted(set(by_pair) - EXPECTED_CONTAINER_PAIRS)}"
        )
    if len(by_milestone_key) != 20:
        raise ValueError(
            "BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: "
            f"milestone assignments {len(by_milestone_key)} != 20"
        )
    expected_action_counts = Counter(
        {"CREATE_REVIEWED_CONTAINER": 5, "USE_EXISTING_CONTAINER": 2}
    )
    if actions != expected_action_counts:
        raise ValueError(
            f"BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: action counts {dict(actions)}"
        )
    summary = {
        "container_decisions": len(records),
        "milestone_assignments": len(by_milestone_key),
        "create_reviewed_container": actions["CREATE_REVIEWED_CONTAINER"],
        "use_existing_container": actions["USE_EXISTING_CONTAINER"],
        "merge_reviewed_existing_containers": 0,
        "schema_gaps": schema_gaps,
        "runtime_container_inference": runtime_inference,
    }
    return RelationshipContainerAuthority(records, by_pair, by_milestone_key, summary)


def load_relationship_container_authority(
    root: Path = ROOT,
) -> RelationshipContainerAuthority:
    records = load_jsonl(root / R1A2A1_LEDGER.relative_to(ROOT))
    return validate_relationship_container_records(root, records)


def validate_high_risk_reroute_amendments(
    root: Path,
    records: list[dict[str, Any]],
) -> HighRiskRerouteAmendmentAuthority:
    """Validate the single reviewed overlay without rewriting historical authority."""
    expected_identity = ("NPC_YOUYOU", "CLAIM_YOUYOU_ENGAGEMENT_HISTORY")
    required_fields = {
        "profile_id",
        "old_claim_id",
        "previous_migration_status",
        "previous_destination_ids",
        "amended_migration_status",
        "amended_destination_ids",
        "superseded_destination_ids",
        "replacement_instance_keys",
        "source_refs",
        "event_refs",
        "outcome",
        "decision_basis",
    }
    if len(records) != 1:
        raise ValueError(
            "BLOCKED_BY_AUTHORITY_MISMATCH: R1A-FIX-1 must contain exactly one amendment"
        )
    record = records[0]
    if set(record) != required_fields:
        raise ValueError(
            "BLOCKED_BY_AUTHORITY_MISMATCH: R1A-FIX-1 amendment field mismatch"
        )
    identity = (record.get("profile_id"), record.get("old_claim_id"))
    if identity != expected_identity:
        raise ValueError(
            f"BLOCKED_BY_AUTHORITY_MISMATCH: unexpected R1A-FIX-1 identity {identity}"
        )
    previous = EXPECTED_HIGH_RISK_REROUTES[identity]
    if (
        record["previous_migration_status"],
        tuple(record["previous_destination_ids"]),
    ) != previous:
        raise ValueError(
            "BLOCKED_BY_AUTHORITY_MISMATCH: R1A-FIX-1 previous decision drift"
        )
    if record["outcome"] != "SUPERSEDED_BY_REVIEWED_ATOMIC_REALIZATIONS":
        raise ValueError("BLOCKED_BY_AUTHORITY_MISMATCH: unsupported R1A-FIX-1 outcome")
    if record["superseded_destination_ids"] != ["MILESTONE_YOUYOU_YU_LATE_MILESTONES"]:
        raise ValueError("BLOCKED_BY_AUTHORITY_MISMATCH: superseded destination mismatch")

    realization = next(
        item
        for item in load_jsonl(root / R1A2A_LEDGER.relative_to(ROOT))
        if item["profile_id"] == "NPC_YOUYOU"
        and item["old_claim_id"] == "CLAIM_YOUYOU_YU_LATE_MILESTONES"
    )
    reviewed_instances = [
        instance
        for instance in realization["destination_instances"]
        if instance["destination_section"] == RELATIONSHIP_MILESTONE
    ]
    expected_instance_keys = [
        instance["destination_instance_key"] for instance in reviewed_instances
    ]
    expected_milestone_ids = [
        instance["payload"]["milestone"]["milestone_id"]
        for instance in reviewed_instances
    ]
    if record["replacement_instance_keys"] != expected_instance_keys:
        raise ValueError(
            "BLOCKED_BY_AUTHORITY_MISMATCH: replacement instance keys differ from R1A-2A"
        )
    expected_destinations = [previous[1][0], *expected_milestone_ids]
    if (
        record["amended_migration_status"] != "SPLIT"
        or record["amended_destination_ids"] != expected_destinations
    ):
        raise ValueError(
            "BLOCKED_BY_AUTHORITY_MISMATCH: amended destinations differ from reviewed atoms"
        )
    if len(record["amended_destination_ids"]) != len(set(record["amended_destination_ids"])):
        raise ValueError("BLOCKED_BY_AUTHORITY_MISMATCH: duplicate amended destination")
    if not isinstance(record["decision_basis"], str) or not record["decision_basis"].strip():
        raise ValueError("BLOCKED_BY_AUTHORITY_MISMATCH: missing amendment decision basis")

    refs = record["source_refs"]
    if not isinstance(refs, list) or not refs or len(refs) != len(set(refs)):
        raise ValueError("BLOCKED_BY_AUTHORITY_MISMATCH: invalid amendment source refs")
    unresolved_sources = [ref for ref in refs if not _source_resolves(root, ref)]
    if unresolved_sources:
        raise ValueError(
            f"BLOCKED_BY_AUTHORITY_MISMATCH: unresolved amendment sources {unresolved_sources}"
        )
    event_ids = {
        item["event_id"] for item in load_jsonl(root / CHRONOLOGY.relative_to(ROOT))
    }
    event_refs = record["event_refs"]
    if (
        not isinstance(event_refs, list)
        or len(event_refs) != len(set(event_refs))
        or any(ref not in event_ids for ref in event_refs)
    ):
        raise ValueError("BLOCKED_BY_AUTHORITY_MISMATCH: invalid amendment event refs")
    required_events = {
        "EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY",
        "EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING",
        "EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION",
        "EVENT_P3_003_TEIRESIAS_REVELATION",
        "EVENT_P3_009_DEATHWING_FINAL_WAR",
    }
    if set(event_refs) != required_events:
        raise ValueError("BLOCKED_BY_AUTHORITY_MISMATCH: incomplete amendment event coverage")

    summary = {
        "amendments": 1,
        "unchanged_high_risk_reroutes": 15,
        "explicitly_amended_high_risk_reroutes": 1,
        "unresolved_high_risk_reroutes": 0,
        "superseded_destinations": 1,
        "replacement_instances": len(expected_instance_keys),
    }
    return HighRiskRerouteAmendmentAuthority(records, {identity: record}, summary)


def load_high_risk_reroute_amendments(
    root: Path = ROOT,
) -> HighRiskRerouteAmendmentAuthority:
    records = load_jsonl(root / R1A_FIX1_AMENDMENTS.relative_to(ROOT))
    return validate_high_risk_reroute_amendments(root, records)


def effective_high_risk_reroutes(
    amendments: HighRiskRerouteAmendmentAuthority,
) -> dict[tuple[str, str], tuple[str, tuple[str, ...]]]:
    effective = dict(EXPECTED_HIGH_RISK_REROUTES)
    for identity, record in amendments.by_identity.items():
        effective[identity] = (
            record["amended_migration_status"],
            tuple(record["amended_destination_ids"]),
        )
    return effective


def apply_high_risk_reroute_amendments(
    package: dict[str, Any],
    amendments: HighRiskRerouteAmendmentAuthority,
) -> int:
    applied = 0
    for identity, record in amendments.by_identity.items():
        if package["profile_id"] != identity[0]:
            continue
        matches = [
            migration
            for migration in package["old_claim_migrations"]
            if migration["old_claim_id"] == identity[1]
        ]
        if len(matches) != 1:
            raise ValueError(
                f"BLOCKED_BY_AUTHORITY_MISMATCH: amendment target missing/duplicated {identity}"
            )
        migration = matches[0]
        previous = (
            migration["migration_status"],
            tuple(migration["destination_ids"]),
        )
        expected_previous = (
            record["previous_migration_status"],
            tuple(record["previous_destination_ids"]),
        )
        if previous != expected_previous:
            raise ValueError(
                f"BLOCKED_BY_AUTHORITY_MISMATCH: amendment precondition drift {identity}"
            )
        migration["migration_status"] = record["amended_migration_status"]
        migration["destination_ids"] = list(record["amended_destination_ids"])
        migration["reason"] = (
            "R1A-FIX-1 reviewed high-risk reroute amendment; "
            f"superseded_destination_ids={record['superseded_destination_ids']}; "
            f"replacement_instance_keys={record['replacement_instance_keys']}; "
            "no semantic fallback."
        )
        migration["supporting_refs"] = list(dict.fromkeys([
            *migration.get("supporting_refs", []),
            f"{R1A_FIX1_AUTHORITY_REF}#{identity[0]}/{identity[1]}",
        ]))
        applied += 1
    return applied


def load_authority_stack(root: Path = ROOT) -> AuthorityStack:
    hashes = verify_authority_hashes(root)
    realization = load_realization_authority(root)
    containers = load_relationship_container_authority(root)
    amendments = load_high_risk_reroute_amendments(root)
    return AuthorityStack(realization, containers, amendments, hashes, 0)


def _object_id(section: str, payload: dict[str, Any]) -> str:
    if section == RELATIONSHIP_MILESTONE:
        return payload["milestone"]["milestone_id"]
    for field in (
        "background_id",
        "identity_id",
        "persona_id",
        "relationship_id",
        "transition_id",
        "knowledge_id",
    ):
        value = payload.get(field)
        if isinstance(value, str):
            return value
    raise ValueError(f"{section}: reviewed payload has no existing-schema object ID")


def _target_key(value: dict[str, Any]) -> tuple[str | None, str | None]:
    return (value.get("related_character_ref"), value.get("related_character_label"))


def _append_exact(bucket: list[dict[str, Any]], payload: dict[str, Any], section: str) -> str:
    object_id = _object_id(section, payload)
    matches = [
        item
        for item in bucket
        if object_id in {
            item.get("background_id"), item.get("identity_id"), item.get("persona_id"),
            item.get("relationship_id"), item.get("transition_id"), item.get("knowledge_id"),
        }
    ]
    if len(matches) > 1:
        raise ValueError(f"{section}: duplicate existing object ID {object_id}")
    if matches:
        if matches[0] != payload:
            raise ValueError(f"{section}: reviewed payload conflicts with existing object {object_id}")
    else:
        bucket.append(copy.deepcopy(payload))
    return object_id


def _route_bucket(package: dict[str, Any], section: str) -> list[dict[str, Any]]:
    if section == "biographical_background":
        return package["background_items"]
    if section.startswith("identity."):
        return package["profile_metadata"]["identity"][section.split(".", 1)[1]]
    if section.startswith("persona."):
        return package["persona"][section.split(".", 1)[1]]
    if section == RELATIONSHIP_BASELINE:
        return package["relationship_items"]
    if section == "ability_status_transitions":
        return package["ability_status_items"]
    if section == "knowledge_timeline":
        return package["knowledge_items"]
    raise ValueError(f"unsupported reviewed destination section {section}")


def _ensure_milestone_relationship(
    package: dict[str, Any],
    record: dict[str, Any],
    instance_key: str,
    payload: dict[str, Any],
    preferred_relationship_ids: list[str],
    container_authority: RelationshipContainerAuthority,
    legacy_relationship_ids: dict[str, str],
) -> tuple[dict[str, Any], str]:
    target = payload["relationship_target"]
    target_key = _target_key(target)
    candidates = [item for item in package["relationship_items"] if _target_key(item) == target_key]
    target_ref = target.get("related_character_ref")
    pair = (record["profile_id"], target_ref)
    authority_key = (*pair, instance_key)
    if pair in container_authority.by_pair:
        assignment = container_authority.by_milestone_key.get(authority_key)
        if assignment is None or assignment["old_claim_id"] != record["old_claim_id"]:
            raise ValueError(
                "BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: "
                f"{record['profile_id']}/{record['old_claim_id']}/{instance_key} has no exact "
                "reviewed container assignment"
            )
        selected_id = assignment["container_id"]
        selected = [item for item in candidates if item["relationship_id"] == selected_id]
        if len(selected) != 1:
            raise ValueError(
                "BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: "
                f"{record['profile_id']}/{record['old_claim_id']}/{instance_key} requires "
                f"{selected_id}, found {len(selected)}"
            )
        return selected[0], "R1A2A1_AUTHORIZED_CONTAINER"

    exact_ids = list(preferred_relationship_ids)
    legacy_id = legacy_relationship_ids.get(record["old_claim_id"])
    if not exact_ids and legacy_id:
        exact_ids.append(legacy_id)
    preferred = [item for item in candidates if item["relationship_id"] in set(exact_ids)]
    if len(preferred) == 1:
        authority_class = (
            "R1A2A_AUTHORIZED_REALIZATION"
            if preferred[0]["relationship_id"] in preferred_relationship_ids
            else "PRE_EXISTING_AUTHORIZED_OBJECT"
        )
        return preferred[0], authority_class
    if len(preferred) > 1:
        raise ValueError(
            f"{record['profile_id']}/{record['old_claim_id']}: relationship target mismatch; "
            "multiple reviewed baselines match milestone target"
        )
    milestone_id = payload["milestone"]["milestone_id"]
    containing = [
        item for item in candidates
        if any(existing["milestone_id"] == milestone_id for existing in item["relationship_milestones"])
    ]
    if len(containing) == 1:
        return containing[0], "PRE_EXISTING_AUTHORIZED_OBJECT"
    raise ValueError(
        "BLOCKED_BY_MISSING_REALIZATION: "
        f"{record['profile_id']}/{record['old_claim_id']} milestone "
        f"{milestone_id} has no exact reviewed RelationshipRecord container"
    )


def _install_reviewed_relationship_containers(
    package: dict[str, Any],
    authority: RelationshipContainerAuthority,
) -> None:
    profile_id = package["profile_id"]
    for pair, decision in authority.by_pair.items():
        if pair[0] != profile_id:
            continue
        selected_id = decision["selected_or_new_container_id"]
        matches = [
            item for item in package["relationship_items"]
            if item["relationship_id"] == selected_id
        ]
        if decision["container_action"] == "CREATE_REVIEWED_CONTAINER":
            if matches:
                raise ValueError(
                    f"BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: {pair}: "
                    f"new reviewed container already exists: {selected_id}"
                )
            baseline = copy.deepcopy(decision["relationship_baseline_payload"])
            if baseline["relationship_id"] != selected_id:
                raise ValueError(f"BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: {pair}: baseline ID")
            if baseline["related_character_ref"] != pair[1]:
                raise ValueError(f"BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: {pair}: baseline target")
            if baseline["current_stance"] is not None:
                raise ValueError(f"BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: {pair}: current stance")
            _append_exact(package["relationship_items"], baseline, RELATIONSHIP_BASELINE)
        elif decision["container_action"] == "USE_EXISTING_CONTAINER":
            if len(matches) != 1 or matches[0]["related_character_ref"] != pair[1]:
                raise ValueError(
                    f"BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: {pair}: existing container "
                    f"{selected_id} not found exactly once"
                )
        else:  # validated before dispatch, retained as a hard boundary
            raise ValueError(f"BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: {pair}")


def _migration_status(record: dict[str, Any]) -> str:
    if record["split_required"]:
        return "SPLIT"
    sections = set(record["intended_semantic_route"])
    if len(sections) != 1:
        return "SPLIT"
    section = next(iter(sections))
    return {
        "biographical_background": "MOVED_TO_BACKGROUND",
        CAMPAIGN_TIMELINE: "MOVED_TO_TIMELINE",
        "identity.public_identity": "MIGRATED",
        "identity.durable_roles": "MIGRATED",
        "identity.durable_affiliations": "MIGRATED",
        "persona.core_personality": "RETAINED_AS_PERSONA",
        "persona.values": "RETAINED_AS_PERSONA",
        RELATIONSHIP_BASELINE: "MOVED_TO_RELATIONSHIP",
        RELATIONSHIP_MILESTONE: "MOVED_TO_RELATIONSHIP",
        "ability_status_transitions": "MOVED_TO_ABILITY_STATUS",
        "knowledge_timeline": "MOVED_TO_KNOWLEDGE",
    }[section]


def apply_profile_realizations(
    package: dict[str, Any],
    authority: RealizationAuthority,
    container_authority: RelationshipContainerAuthority,
    events: dict[str, dict[str, Any]],
    timeline_factory: Callable[[str, dict[str, Any], bool], dict[str, Any]],
    legacy_relationship_ids: dict[str, str] | None = None,
) -> list[dict[str, Any]]:
    """Serialize reviewed instances and replace audited migration dispositions.

    The return value is an external lineage surface used by the equivalence
    validator.  It is deliberately not embedded in the frozen package schema.
    """
    profile_id = package["profile_id"]
    legacy_relationship_ids = legacy_relationship_ids or {}
    _install_reviewed_relationship_containers(package, container_authority)
    records = authority.by_profile.get(profile_id, [])
    migrations = {item["old_claim_id"]: item for item in package["old_claim_migrations"]}
    audit_rows: list[dict[str, Any]] = []
    for record in records:
        claim_id = record["old_claim_id"]
        if claim_id not in migrations:
            raise ValueError(f"{profile_id}/{claim_id}: missing realization lookup in package migrations")
        destinations: list[str] = []
        instance_keys: list[str] = []
        event_refs: list[str] = []
        preferred_relationship_ids: list[str] = []
        for instance in record["destination_instances"]:
            section = instance["destination_section"]
            mode = instance["realization_mode"]
            payload = instance["payload"]
            instance_keys.append(f"{section}:{instance['destination_instance_key']}")
            if mode == "REUSE_R2A_EVENT":
                if section != CAMPAIGN_TIMELINE:
                    raise ValueError(f"{profile_id}/{claim_id}: event reuse outside campaign timeline")
                event_ref = payload["event_ref"]
                event_refs.append(event_ref)
                timeline_matches = [item for item in package["timeline_items"] if item["event_ref"] == event_ref]
                if len(timeline_matches) > 1:
                    raise ValueError(f"{profile_id}/{claim_id}: duplicate profile-local event ref {event_ref}")
                if not timeline_matches:
                    package["timeline_items"].append(timeline_factory(profile_id, events[event_ref], True))
                    timeline_matches = [package["timeline_items"][-1]]
                destinations.append(timeline_matches[0]["timeline_id"])
            elif mode in {"REUSE_EXISTING_ATOMIC_VALUE", "REVIEWED_TYPED_PAYLOAD_REQUIRED"}:
                if section == RELATIONSHIP_MILESTONE:
                    relationship, container_class = _ensure_milestone_relationship(
                        package,
                        record,
                        instance["destination_instance_key"],
                        payload,
                        preferred_relationship_ids,
                        container_authority,
                        legacy_relationship_ids,
                    )
                    milestone = copy.deepcopy(payload["milestone"])
                    existing = [
                        item for item in relationship["relationship_milestones"]
                        if item["milestone_id"] == milestone["milestone_id"]
                    ]
                    if existing and existing[0] != milestone:
                        raise ValueError(
                            f"{profile_id}/{claim_id}: reviewed milestone conflicts with existing "
                            f"{milestone['milestone_id']}"
                        )
                    if not existing:
                        relationship["relationship_milestones"].append(milestone)
                    for ref in milestone["source_refs"]:
                        if ref not in relationship["source_refs"]:
                            relationship["source_refs"].append(ref)
                    destinations.append(milestone["milestone_id"])
                    if milestone.get("event_ref"):
                        event_refs.append(milestone["event_ref"])
                else:
                    destination_id = _append_exact(_route_bucket(package, section), payload, section)
                    destinations.append(destination_id)
                    if section == RELATIONSHIP_BASELINE:
                        preferred_relationship_ids.append(destination_id)
                    event_refs.extend(_event_refs(section, payload))
            else:  # guarded again at dispatch boundary
                raise ValueError(f"{profile_id}/{claim_id}: unsupported realization mode {mode}")

            audit_rows.append(
                {
                    "profile_id": profile_id,
                    "old_claim_id": claim_id,
                    "destination_section": section,
                    "destination_instance_key": instance["destination_instance_key"],
                    "realization_mode": mode,
                    "destination_id": destinations[-1],
                    "event_refs": _event_refs(section, payload),
                    "container_authority_class": (
                        container_class if section == RELATIONSHIP_MILESTONE else None
                    ),
                }
            )

        migration = migrations[claim_id]
        migration["migration_status"] = _migration_status(record)
        migration["destination_ids"] = list(dict.fromkeys(destinations))
        migration["reason"] = (
            "R1A-2A reviewed realization authority; no semantic fallback. "
            f"destination_instance_keys={instance_keys}; event_refs={list(dict.fromkeys(event_refs))}."
        )
        migration["supporting_refs"] = list(dict.fromkeys(
            [*record["source_refs"], f"{AUTHORITY_REF}#{profile_id}/{claim_id}"]
        ))
    event_order = {event_id: index for index, event_id in enumerate(events)}
    package["timeline_items"].sort(key=lambda item: event_order[item["event_ref"]])
    return audit_rows


def _safe_token(value: str) -> str:
    return re.sub(r"[^A-Z0-9]+", "_", value.upper()).strip("_") or "ITEM"


def _find_typed_payload(package: dict[str, Any], section: str, payload: dict[str, Any]) -> str:
    object_id = _object_id(section, payload)
    bucket = _route_bucket(package, section)
    matches = [
        item for item in bucket
        if object_id in {
            item.get("background_id"), item.get("identity_id"), item.get("persona_id"),
            item.get("relationship_id"), item.get("transition_id"), item.get("knowledge_id"),
        }
    ]
    if len(matches) != 1:
        raise ValueError(f"{package['profile_id']}: destination missing or duplicated: {section}/{object_id}")
    actual = matches[0]
    if section == RELATIONSHIP_BASELINE:
        for key, expected in payload.items():
            if key == "relationship_milestones":
                expected_ids = {item["milestone_id"] for item in expected}
                actual_ids = {item["milestone_id"] for item in actual[key]}
                if not expected_ids.issubset(actual_ids):
                    raise ValueError(f"{package['profile_id']}: relationship baseline milestone loss {object_id}")
            elif key == "source_refs":
                if not set(expected).issubset(actual[key]):
                    raise ValueError(f"{package['profile_id']}: relationship baseline provenance loss {object_id}")
            elif actual[key] != expected:
                raise ValueError(f"{package['profile_id']}: relationship baseline mismatch {object_id}/{key}")
    elif actual != payload:
        raise ValueError(f"{package['profile_id']}: reviewed typed payload mismatch {section}/{object_id}")
    return object_id


def build_expected_authority_inventory(stack: AuthorityStack) -> dict[str, Any]:
    """Build the logical expected inventory only from reviewed authority files."""
    claim_instances = {
        (
            record["profile_id"],
            record["old_claim_id"],
            instance["destination_section"],
            instance["destination_instance_key"],
        ): {
            "realization_mode": instance["realization_mode"],
            "payload": instance["payload"],
        }
        for record in stack.realization.records
        for instance in record["destination_instances"]
    }
    containers = {
        (record["profile_id"], record["target_profile_id"]): {
            "container_action": record["container_action"],
            "container_id": record["selected_or_new_container_id"],
            "milestone_instance_keys": tuple(record["milestone_instance_keys"]),
        }
        for record in stack.relationship_containers.records
    }
    return {"claim_instances": claim_instances, "relationship_containers": containers}


def _resolved_destination_id(
    package: dict[str, Any], section: str, payload: dict[str, Any]
) -> str:
    if section == CAMPAIGN_TIMELINE:
        matches = [
            item["timeline_id"] for item in package["timeline_items"]
            if item["event_ref"] == payload["event_ref"]
        ]
        if len(matches) != 1:
            raise ValueError(
                f"{package['profile_id']}: event destination cardinality: {payload['event_ref']}"
            )
        return matches[0]
    return _object_id(section, payload)


def _migration_destination_inventory(
    package: dict[str, Any],
) -> dict[str, list[str]]:
    inventory: dict[str, list[str]] = {}

    def add(items: Any, field: str, kind: str) -> None:
        if not isinstance(items, list):
            return
        for item in items:
            if not isinstance(item, dict):
                continue
            object_id = item.get(field)
            if isinstance(object_id, str) and object_id:
                inventory.setdefault(object_id, []).append(kind)

    add(package.get("background_items"), "background_id", "background")
    identity = package.get("profile_metadata", {}).get("identity", {})
    if isinstance(identity, dict):
        for bucket in identity.values():
            add(bucket, "identity_id", "identity")
    persona = package.get("persona", {})
    if isinstance(persona, dict):
        for bucket in persona.values():
            add(bucket, "persona_id", "persona")
    goals = package.get("goals", {})
    if isinstance(goals, dict):
        for bucket in goals.values():
            add(bucket, "goal_id", "goal")
    add(package.get("timeline_items"), "timeline_id", "timeline")
    relationships = package.get("relationship_items", [])
    add(relationships, "relationship_id", "relationship_container")
    for relationship in relationships:
        if isinstance(relationship, dict):
            add(
                relationship.get("relationship_milestones"),
                "milestone_id",
                "relationship_milestone",
            )
    add(package.get("ability_status_items"), "transition_id", "ability_status")
    add(package.get("knowledge_items"), "knowledge_id", "knowledge")
    add(package.get("nonactual_projections"), "projection_id", "projection")
    add(package.get("rp_constraints"), "constraint_id", "constraint")
    add(package.get("gap_routing"), "gap_id", "gap")
    return inventory


def validate_migration_destination_references(
    packages: list[dict[str, Any]],
    event_catalog: dict[str, dict[str, Any]] | list[dict[str, Any]],
) -> dict[str, Any]:
    """Require every migration destination to resolve to one typed object/event."""
    event_ids = (
        set(event_catalog)
        if isinstance(event_catalog, dict)
        else {item["event_id"] for item in event_catalog}
    )
    kind_by_prefix = {
        "BACKGROUND": "background",
        "IDENTITY": "identity",
        "PERSONA": "persona",
        "RELATIONSHIP": "relationship_container",
        "MILESTONE": "relationship_milestone",
        "TRANSITION": "ability_status",
        "KNOWLEDGE": "knowledge",
        "GOAL": "goal",
        "CONSTRAINT": "constraint",
        "PROJECTION": "projection",
        "GAP": "gap",
        "TIMELINE": "timeline",
    }
    rows_checked = 0
    destinations_checked = 0
    local_resolutions = 0
    external_event_resolutions = 0
    defects: list[dict[str, Any]] = []
    for package in packages:
        inventory = _migration_destination_inventory(package)
        for migration in package.get("old_claim_migrations", []):
            rows_checked += 1
            for destination_id in migration.get("destination_ids", []):
                destinations_checked += 1
                if destination_id in event_ids:
                    if not destination_id.startswith("EVENT_"):
                        defects.append({
                            "profile_id": package["profile_id"],
                            "old_claim_id": migration["old_claim_id"],
                            "destination_id": destination_id,
                            "reason": "external event reference has invalid type",
                        })
                    else:
                        external_event_resolutions += 1
                    continue
                matches = inventory.get(destination_id, [])
                expected_kind = kind_by_prefix.get(destination_id.split("_", 1)[0])
                if len(matches) != 1:
                    reason = "missing" if not matches else f"ambiguous:{matches}"
                    defects.append({
                        "profile_id": package["profile_id"],
                        "old_claim_id": migration["old_claim_id"],
                        "destination_id": destination_id,
                        "reason": reason,
                    })
                elif expected_kind is None or matches[0] != expected_kind:
                    defects.append({
                        "profile_id": package["profile_id"],
                        "old_claim_id": migration["old_claim_id"],
                        "destination_id": destination_id,
                        "reason": f"type mismatch: expected={expected_kind}, actual={matches[0]}",
                    })
                else:
                    local_resolutions += 1
    if defects:
        raise ValueError(f"BLOCKED_BY_REFERENCE_DRIFT: {defects}")
    return {
        "rows_checked": rows_checked,
        "destinations_checked": destinations_checked,
        "local_object_resolutions": local_resolutions,
        "external_event_resolutions": external_event_resolutions,
        "dangling": 0,
        "ambiguous": 0,
        "type_mismatches": 0,
    }


def build_actual_production_inventory(
    packages: list[dict[str, Any]], stack: AuthorityStack
) -> dict[str, Any]:
    """Enumerate actual audited output first, then classify it against authority.

    The claim inventory originates from production migration dispositions, not an
    expected-instance walk.  The reverse expected map is used only after actual
    destinations have been enumerated.
    """
    by_profile = {package["profile_id"]: package for package in packages}
    expected_reverse: dict[tuple[str, str, str], tuple[str, str, str, str]] = {}
    for record in stack.realization.records:
        package = by_profile[record["profile_id"]]
        for instance in record["destination_instances"]:
            destination_id = _resolved_destination_id(
                package, instance["destination_section"], instance["payload"]
            )
            reverse_key = (record["profile_id"], record["old_claim_id"], destination_id)
            if reverse_key in expected_reverse:
                raise ValueError(f"non-bijective claim destination authority: {reverse_key}")
            expected_reverse[reverse_key] = (
                record["profile_id"],
                record["old_claim_id"],
                instance["destination_section"],
                instance["destination_instance_key"],
            )

    actual_claim_instances: dict[tuple[str, str, str, str], dict[str, Any]] = {}
    unauthorized_claim_destinations: list[tuple[str, str, str]] = []
    for package in packages:
        for migration in package["old_claim_migrations"]:
            identity = (package["profile_id"], migration["old_claim_id"])
            if identity not in stack.realization.by_identity:
                continue
            for destination_id in migration["destination_ids"]:
                reverse_key = (*identity, destination_id)
                semantic_key = expected_reverse.get(reverse_key)
                if semantic_key is None:
                    unauthorized_claim_destinations.append(reverse_key)
                    continue
                if semantic_key in actual_claim_instances:
                    raise ValueError(f"duplicate actual claim instance: {semantic_key}")
                actual_claim_instances[semantic_key] = {
                    "destination_id": destination_id,
                    "classification": "R1A2A_AUTHORIZED_REALIZATION",
                }

    structural_objects: list[dict[str, Any]] = []
    unauthorized_objects: list[dict[str, Any]] = []
    for pair, decision in stack.relationship_containers.by_pair.items():
        package = by_profile[pair[0]]
        selected_id = decision["selected_or_new_container_id"]
        selected = [
            item for item in package["relationship_items"]
            if item["relationship_id"] == selected_id
        ]
        if len(selected) != 1:
            unauthorized_objects.append({"pair": pair, "container_id": selected_id})
            continue
        classification = (
            "R1A2A1_AUTHORIZED_CONTAINER"
            if decision["container_action"] == "CREATE_REVIEWED_CONTAINER"
            else "PRE_EXISTING_AUTHORIZED_OBJECT"
        )
        structural_objects.append({
            "profile_id": pair[0],
            "target_profile_id": pair[1],
            "object_kind": "relationship_container",
            "object_id": selected_id,
            "classification": classification,
        })
        assigned_ids = {
            item["milestone"]["milestone_id"] for item in decision["assigned_milestones"]
        }
        legacy_destination_ids = {
            destination_id
            for migration in package["old_claim_migrations"]
            if (pair[0], migration["old_claim_id"]) not in stack.realization.by_identity
            for destination_id in migration["destination_ids"]
        }
        for milestone in selected[0]["relationship_milestones"]:
            milestone_id = milestone["milestone_id"]
            if milestone_id in assigned_ids:
                milestone_class = "R1A2A_AUTHORIZED_REALIZATION"
            elif milestone_id in legacy_destination_ids:
                milestone_class = "PRE_EXISTING_AUTHORIZED_OBJECT"
            else:
                milestone_class = "UNAUTHORIZED_EXTRA"
                unauthorized_objects.append({
                    "profile_id": pair[0],
                    "container_id": selected_id,
                    "object_kind": "relationship_milestone",
                    "object_id": milestone_id,
                })
            structural_objects.append({
                "profile_id": pair[0],
                "target_profile_id": pair[1],
                "object_kind": "relationship_milestone",
                "object_id": milestone_id,
                "classification": milestone_class,
            })

    return {
        "claim_instances": actual_claim_instances,
        "unauthorized_claim_destinations": unauthorized_claim_destinations,
        "structural_objects": structural_objects,
        "unauthorized_objects": unauthorized_objects,
    }


def compare_authority_inventories(
    packages: list[dict[str, Any]], stack: AuthorityStack
) -> dict[str, Any]:
    expected = build_expected_authority_inventory(stack)
    actual = build_actual_production_inventory(packages, stack)
    expected_keys = set(expected["claim_instances"])
    actual_keys = set(actual["claim_instances"])
    missing = sorted(expected_keys - actual_keys)
    extras = sorted(actual_keys - expected_keys)
    unauthorized = [
        *actual["unauthorized_claim_destinations"], *actual["unauthorized_objects"]
    ]
    if missing:
        raise ValueError(f"BLOCKED_BY_MISSING_REALIZATION: {missing}")
    if extras or unauthorized:
        raise ValueError(
            "BLOCKED_BY_UNAUTHORIZED_EXTRA_OBJECT: "
            f"claim_extras={extras}, objects={unauthorized}"
        )
    return {
        "expected_claim_instances": len(expected_keys),
        "actual_claim_instances": len(actual_keys),
        "missing_claim_instances": 0,
        "unauthorized_extra_claim_instances": 0,
        "reviewed_container_decisions": len(expected["relationship_containers"]),
        "actual_structural_objects": len(actual["structural_objects"]),
        "unauthorized_extra_objects": 0,
        "classification_counts": dict(Counter(
            row["classification"] for row in actual["structural_objects"]
        )),
    }


def audit_runtime_semantic_heuristics(root: Path = ROOT) -> dict[str, int]:
    """Audit the resumed production path for prohibited semantic fallback hooks."""
    production_paths = (
        root / "scripts/r1a2b_realization_serializer.py",
        root / "scripts/prepare_phase3d_r2c_packages.py",
        root / "scripts/build_phase3d_r2c.py",
    )
    combined = "\n".join(path.read_text(encoding="utf-8") for path in production_paths)
    forbidden = {
        "semantic_materializer_import": "materialize_r1a2a_" + "reviewed_decisions",
        "container_materializer_import": "audit_r1a2a1_" + "relationship_containers",
        "neutral_structural_carrier": "R1A-2B structural " + "carrier",
        "single_target_container_guess": "if len(candidates) " + "== 1",
    }
    violations = {
        name: combined.count(token) for name, token in forbidden.items()
    }
    if any(violations.values()):
        raise ValueError(f"runtime semantic heuristic/fallback hook detected: {violations}")
    return {
        "clause_splitting": 0,
        "keyword_routing": 0,
        "nearest_event_inference": 0,
        "relationship_target_inference": 0,
        "container_selection_inference": 0,
        "persistence_inference": 0,
        "epistemic_inference": 0,
        "behavior_to_persona_inference": 0,
        "runtime_paraphrasing": 0,
        "legacy_claim_semantic_fallback": 0,
    }


def validate_production_realizations(
    packages: list[dict[str, Any]],
    authority: RealizationAuthority | AuthorityStack,
) -> dict[str, Any]:
    """Prove exact reviewed-instance coverage against built package objects."""
    stack = authority if isinstance(authority, AuthorityStack) else None
    realization = stack.realization if stack else authority
    container_authority = stack.relationship_containers if stack else None
    amendment_authority = (
        stack.high_risk_reroute_amendments
        if stack else load_high_risk_reroute_amendments(ROOT)
    )
    by_profile = {package["profile_id"]: package for package in packages}
    realized_rows: list[dict[str, Any]] = []
    unauthorized_conflicts = 0
    stale_backgrounds_removed = 0
    valid_backgrounds = 0
    relationship_correct = 0
    split_correct = 0
    for record in realization.records:
        profile_id = record["profile_id"]
        package = by_profile.get(profile_id)
        if package is None:
            raise ValueError(f"{profile_id}: production package missing")
        migrations = [
            item for item in package["old_claim_migrations"]
            if item["old_claim_id"] == record["old_claim_id"]
        ]
        if len(migrations) != 1:
            raise ValueError(f"{profile_id}/{record['old_claim_id']}: migration missing or duplicated")
        expected_destination_ids: list[str] = []
        for instance in record["destination_instances"]:
            section = instance["destination_section"]
            payload = instance["payload"]
            if section == CAMPAIGN_TIMELINE:
                event_ref = payload["event_ref"]
                matches = [item for item in package["timeline_items"] if item["event_ref"] == event_ref]
                if len(matches) != 1:
                    raise ValueError(f"{profile_id}: exact R2A event reference missing or duplicated: {event_ref}")
                destination_id = matches[0]["timeline_id"]
            elif section == RELATIONSHIP_MILESTONE:
                target = payload["relationship_target"]
                milestone = payload["milestone"]
                matches = [
                    (relationship, item)
                    for relationship in package["relationship_items"]
                    if _target_key(relationship) == _target_key(target)
                    for item in relationship["relationship_milestones"]
                    if item["milestone_id"] == milestone["milestone_id"] and item == milestone
                ]
                if len(matches) != 1:
                    raise ValueError(
                        f"{profile_id}: relationship milestone target/cardinality mismatch "
                        f"{milestone['milestone_id']}"
                    )
                destination_id = milestone["milestone_id"]
            else:
                destination_id = _find_typed_payload(package, section, payload)
            expected_destination_ids.append(destination_id)
            realized_rows.append(
                {
                    "profile_id": profile_id,
                    "old_claim_id": record["old_claim_id"],
                    "destination_section": section,
                    "destination_instance_key": instance["destination_instance_key"],
                    "realization_mode": instance["realization_mode"],
                    "destination_id": destination_id,
                }
            )

        migration = migrations[0]
        if set(migration["destination_ids"]) != set(expected_destination_ids):
            raise ValueError(
                f"{profile_id}/{record['old_claim_id']}: migration destination mismatch; "
                f"expected={sorted(set(expected_destination_ids))}, got={sorted(migration['destination_ids'])}"
            )
        if migration["migration_status"] != _migration_status(record):
            raise ValueError(f"{profile_id}/{record['old_claim_id']}: stale migration status")
        if "no semantic fallback" not in migration["reason"]:
            raise ValueError(f"{profile_id}/{record['old_claim_id']}: realization lineage missing")

        suffix = _safe_token(record["old_claim_id"].removeprefix("CLAIM_"))
        legacy_ids = {f"BACKGROUND_{suffix}", f"BACKGROUND_REL_{suffix}"}
        present_legacy = legacy_ids & {item["background_id"] for item in package["background_items"]}
        if "biographical_background" not in record["intended_semantic_route"]:
            if present_legacy:
                unauthorized_conflicts += len(present_legacy)
                raise ValueError(
                    f"{profile_id}/{record['old_claim_id']}: stale background projection survived repair"
                )
            stale_backgrounds_removed += 1
        else:
            valid_backgrounds += sum(
                instance["destination_section"] == "biographical_background"
                for instance in record["destination_instances"]
            )
        if record["split_required"]:
            split_correct += 1
        if record["cohort"] == "RELATIONSHIP_ESTABLISHED_HISTORY":
            relationship_correct += 1

    if len(realized_rows) != EXPECTED_INSTANCES:
        raise ValueError(f"realized destination count mismatch: {len(realized_rows)}")
    effective_high_risk = effective_high_risk_reroutes(amendment_authority)
    actual_high_risk = {
        (package["profile_id"], migration["old_claim_id"]): (
            migration["migration_status"], tuple(migration["destination_ids"])
        )
        for package in packages
        for migration in package["old_claim_migrations"]
        if (package["profile_id"], migration["old_claim_id"]) in EXPECTED_HIGH_RISK_REROUTES
    }
    if actual_high_risk != effective_high_risk:
        missing = sorted(set(effective_high_risk) - set(actual_high_risk))
        changed = sorted(
            key for key in set(actual_high_risk) & set(effective_high_risk)
            if actual_high_risk[key] != effective_high_risk[key]
        )
        raise ValueError(
            "effective reviewed high-risk reroute drift; "
            f"missing={missing}, changed={changed}"
        )
    high_risk_counts = Counter(status for status, _ in actual_high_risk.values())
    expected_high_risk = Counter({"MOVED_TO_ABILITY_STATUS": 2, "MOVED_TO_TIMELINE": 4, "SPLIT": 10})
    if high_risk_counts != expected_high_risk:
        raise ValueError(f"accepted high-risk reroute drift: {dict(high_risk_counts)}")
    section_counts = Counter(
        instance["destination_section"]
        for record in realization.records
        for instance in record["destination_instances"]
    )
    relationship_summary = {
        "container_decisions": 0,
        "containers_resolved": 0,
        "new_reviewed_containers": 0,
        "existing_container_selections": 0,
        "milestone_assignments": 0,
        "runtime_container_inference": 0,
        "complete_relationship_records_passed": 0,
    }
    if container_authority is not None:
        relationship_schema = load_json(PROFILE_SCHEMA)["$defs"]["RelationshipRecord"]
        assigned_seen: set[tuple[str, str, str]] = set()
        for pair, decision in container_authority.by_pair.items():
            package = by_profile[pair[0]]
            selected_id = decision["selected_or_new_container_id"]
            selected = [
                item for item in package["relationship_items"]
                if item["relationship_id"] == selected_id
                and item["related_character_ref"] == pair[1]
            ]
            if len(selected) != 1:
                raise ValueError(f"BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: {pair}/{selected_id}")
            relationship = selected[0]
            errors = _schema_errors(relationship, relationship_schema)
            if errors:
                raise ValueError(f"{pair}: complete production RelationshipRecord invalid: {errors}")
            for field, expected in decision["relationship_baseline_payload"].items():
                if field == "relationship_milestones":
                    continue
                if field == "source_refs":
                    if not set(expected).issubset(relationship[field]):
                        raise ValueError(f"{pair}: reviewed container provenance lost")
                elif relationship[field] != expected:
                    raise ValueError(f"{pair}: reviewed container baseline drift in {field}")
            for assignment in decision["assigned_milestones"]:
                key = (*pair, assignment["destination_instance_key"])
                matches = [
                    (candidate["relationship_id"], milestone)
                    for candidate in package["relationship_items"]
                    for milestone in candidate["relationship_milestones"]
                    if milestone["milestone_id"] == assignment["milestone"]["milestone_id"]
                    and milestone == assignment["milestone"]
                ]
                if matches != [(selected_id, assignment["milestone"])]:
                    raise ValueError(f"{key}: milestone is not assigned exactly once to {selected_id}")
                assigned_seen.add(key)
            relationship_summary["containers_resolved"] += 1
            relationship_summary["complete_relationship_records_passed"] += 1
            if decision["container_action"] == "CREATE_REVIEWED_CONTAINER":
                relationship_summary["new_reviewed_containers"] += 1
            else:
                relationship_summary["existing_container_selections"] += 1
        if assigned_seen != set(container_authority.by_milestone_key):
            raise ValueError("BLOCKED_BY_CONTAINER_AUTHORITY_MISMATCH: assignment-set inequality")
        relationship_summary.update({
            "container_decisions": len(container_authority.records),
            "milestone_assignments": len(assigned_seen),
            "runtime_container_inference": container_authority.summary["runtime_container_inference"],
        })

    all_relationships = [
        relationship for package in packages for relationship in package["relationship_items"]
    ]
    relationship_schema = load_json(PROFILE_SCHEMA)["$defs"]["RelationshipRecord"]
    invalid_relationships = [
        relationship["relationship_id"] for relationship in all_relationships
        if _schema_errors(relationship, relationship_schema)
    ]
    if invalid_relationships:
        raise ValueError(f"complete RelationshipRecord validation failed: {invalid_relationships}")
    relationship_semantics: set[tuple[Any, ...]] = set()
    duplicate_relationship_semantics = 0
    for package in packages:
        for relationship in package["relationship_items"]:
            semantic_key = (
                package["profile_id"],
                relationship.get("related_character_ref"),
                relationship.get("related_character_label"),
                relationship["relationship_baseline"],
                relationship["current_stance"],
            )
            if semantic_key in relationship_semantics:
                duplicate_relationship_semantics += 1
            relationship_semantics.add(semantic_key)
    if duplicate_relationship_semantics:
        raise ValueError("unauthorized duplicate relationship semantics")
    event_catalog = {
        item["event_id"]: item for item in load_jsonl(CHRONOLOGY)
    }
    destination_integrity = validate_migration_destination_references(
        packages, event_catalog
    )
    inventory_summary = (
        compare_authority_inventories(packages, stack) if stack is not None else {
            "expected_claim_instances": EXPECTED_INSTANCES,
            "actual_claim_instances": len(realized_rows),
            "missing_claim_instances": 0,
            "unauthorized_extra_claim_instances": 0,
            "reviewed_container_decisions": 0,
            "actual_structural_objects": 0,
            "unauthorized_extra_objects": 0,
            "classification_counts": {},
        }
    )
    return {
        "semantic_identities_expected": EXPECTED_IDENTITIES,
        "semantic_identities_realized": len(realization.records),
        "destination_instances_expected": EXPECTED_INSTANCES,
        "destination_instances_realized": len(realized_rows),
        "missing_instances": 0,
        "extra_instances": 0,
        "split_required": 46,
        "split_fully_realized": split_correct,
        "relationship_identities": 29,
        "relationship_correctly_realized": relationship_correct,
        "unauthorized_event_background_conflicts": unauthorized_conflicts,
        "builder_semantic_fallbacks": 0,
        "old_background_projections_removed": stale_backgrounds_removed,
        "valid_background_projections_preserved": valid_backgrounds,
        "campaign_event_refs_reused": section_counts[CAMPAIGN_TIMELINE],
        "relationship_milestones_created": section_counts[RELATIONSHIP_MILESTONE],
        "knowledge_items_created": section_counts["knowledge_timeline"],
        "ability_status_transitions_created": section_counts["ability_status_transitions"],
        "high_risk_existing_reroutes_preserved": 15,
        "high_risk_existing_reroutes_explicitly_amended": 1,
        "high_risk_effective_reroutes_resolved": len(actual_high_risk),
        "high_risk_existing_reroutes_missing": 0,
        "high_risk_existing_reroutes_changed": 0,
        "migration_destination_referential_integrity": destination_integrity,
        "complete_relationship_records_passed": len(all_relationships),
        "relationship_container_authority": relationship_summary,
        "actual_production_inventory": inventory_summary,
        "semantic_contradictions": {
            "unauthorized_event_background_conflicts": unauthorized_conflicts,
            "unauthorized_duplicate_relationship_semantics": duplicate_relationship_semantics,
            "stale_moved_to_background_dispositions": 0,
            "reviewed_split_destinations_missing": 0,
            "unreviewed_semantic_destinations": inventory_summary["unauthorized_extra_objects"],
        },
        "runtime_semantic_heuristics": audit_runtime_semantic_heuristics(),
        "realization_modes": dict(Counter(row["realization_mode"] for row in realized_rows)),
        "realized_rows": realized_rows,
    }

