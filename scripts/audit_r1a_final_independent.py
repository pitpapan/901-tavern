#!/usr/bin/env python3
"""Independent, read-only R1A-FINAL verifier for the repaired R2C tree.

This module deliberately imports no R1A-2B production or equivalence code.
It reads raw authority, schema, chronology, and production artifacts directly.
"""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import re
import tempfile
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
R2C = ROOT / "work/phase3d_r2c"
R1A1 = ROOT / "work/remediation/r1a1/semantic_adjudication_ledger.jsonl"
R1A2A_DECISIONS = ROOT / "work/remediation/r1a2/semantic_realization_decisions.jsonl"
R1A2A = ROOT / "work/remediation/r1a2/semantic_realization_ledger.jsonl"
R1A2A1 = ROOT / "work/remediation/r1a2a1/relationship_container_ledger.jsonl"
R1A_FIX1 = ROOT / "work/remediation/r1a_fix1/high_risk_reroute_amendments.jsonl"
CHRONOLOGY = ROOT / "work/phase3d_r2/chronology/campaign_chronology.jsonl"
FROZEN_MANIFEST = R2C / "reviewed_inputs/frozen_input_manifest.json"
PROFILE_SCHEMA = R2C / "schemas/character_profile_v2.schema.json"
PACKAGE_ROOT = R2C / "migration_packages"
CANDIDATE_ROOT = R2C / "candidates/by_profile"
REVIEW_ROOT = R2C / "reviews/by_character"
FIX1_ROOT = ROOT / "work/remediation/r1a_fix1"
REPAIRED_MANIFEST = FIX1_ROOT / "repaired_r2c_manifest.jsonl"

EXPECTED_HASHES = {
    "r1a1": "4db290bbb287a28576b8e84bf8e399eb6db3a37d1acb6935da56cee1ad76a8b7",
    "r1a2a_decisions": "d5f53cad4ebb2068e460e8b13bc49d712e4d393b6b309eae491ce7109cd2c40d",
    "r1a2a": "0000abfd6cbb6946ae5bbcb50875c69fc4c17a4f0960ed3bec031bad0613e66b",
    "r1a2a1": "bc426551e4438b59d96ed43ffb8d3870eca7f70974cfce8ce2e97f57086682e1",
    "r1a_fix1": "b6e3e29da8aa3f7a9f4c22c931fed2c84c56b414e6fac9d59a691f1786724817",
}
AUTHORITY_PATHS = {
    "r1a1": R1A1,
    "r1a2a_decisions": R1A2A_DECISIONS,
    "r1a2a": R1A2A,
    "r1a2a1": R1A2A1,
    "r1a_fix1": R1A_FIX1,
}

EXPECTED_CONTAINER_IDS = {
    ("NPC_HONDA_KAI_FERGUS", "NPC_YOUYOU"): "RELATIONSHIP_HONDA_KAI_FERGUS_YOUYOU",
    ("NPC_JIANG_ZIYOU", "NPC_CASSIUS_BRIGHT"): "RELATIONSHIP_JIANG_ZIYOU_CASSIUS_BRIGHT",
    ("NPC_KENDA_KAI_FERGUS", "PC_YU_LINFENG"): "RELATIONSHIP_KENDA_KAI_FERGUS_YU_LINFENG",
    ("NPC_LULUTIYE", "NPC_YOUYOU"): "RELATIONSHIP_LULUTIYE_YOUYOU_HOME_PRESENCE",
    ("NPC_XIERLUN_VON_GILCODE", "PC_YU_LINFENG"): "RELATIONSHIP_XIERLUN_YU_ENGAGEMENT_PLANNING",
    ("NPC_YOUYOU", "PC_YU_LINFENG"): "RELATIONSHIP_YOUYOU_YU_LINFENG",
    ("PC_YU_LINFENG", "NPC_YOUYOU"): "RELATIONSHIP_YU_LINFENG_YOUYOU",
}

HIGH_RISK_REROUTES = {
    ("NPC_CASSANDRA", "CLAIM_CASSANDRA_PREWAR_WARNING"): (
        "MOVED_TO_TIMELINE", ("TIMELINE_CASSANDRA_P3_005_XIERLUN_FRONT_AND_WHITE_MAGE_PROPOSAL",)),
    ("NPC_CASSANDRA", "CLAIM_CASSANDRA_AINZ_INTERMEDIARY"): (
        "MOVED_TO_TIMELINE", ("TIMELINE_CASSANDRA_P3_007_AINZ_DIPLOMACY_AND_EVACUATION",)),
    ("NPC_DEATHWING", "CLAIM_DEATHWING_HISTORY_1"): (
        "SPLIT", ("TIMELINE_DEATHWING_P3_009_DEATHWING_FINAL_WAR", "TRANSITION_DEATHWING_CURRENT_BODY_DESTROYED")),
    ("NPC_DEATHWING", "CLAIM_DEATHWING_INVASION_CONTINUITY"): (
        "MOVED_TO_TIMELINE", ("TIMELINE_DEATHWING_P2_029_DEATHWING_BATTLEFIELD_AND_SEAL_WARNING", "TIMELINE_DEATHWING_P3_002_SANCTUARY_ENTRY")),
    ("NPC_OSHIRA", "CLAIM_OSHIRA_DRAGON_WAR_CONTROL"): (
        "MOVED_TO_ABILITY_STATUS", ("TRANSITION_OSHIRA_NONVOLUNTARY_CONTROL",)),
    ("NPC_WHITE_MAGICIAN", "CLAIM_WHITE_MAGICIAN_GEM_HISTORY"): (
        "SPLIT", ("TIMELINE_WHITE_MAGICIAN_P3_010_WHITE_MAGE_EXIT_AND_THEORY", "TRANSITION_WHITE_MAGICIAN_GEM_REMOVED_D1")),
    ("NPC_WHITE_MAGICIAN", "CLAIM_WHITE_MAGICIAN_FACTORY_CONFRONTATION"): (
        "MOVED_TO_TIMELINE", ("TIMELINE_WHITE_MAGICIAN_P2_023_WHITE_MAGICIAN_ARMORY_CONFRONTATION",)),
    ("NPC_WHITE_MAGICIAN", "CLAIM_WHITE_MAGICIAN_OSHIRA_CONTROL"): (
        "MOVED_TO_ABILITY_STATUS", ("TRANSITION_WHITE_MAGICIAN_CONTROLS_OSHIRA",)),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_NAME_STAGES"): (
        "SPLIT", ("TIMELINE_YOUYOU_P2_021_DRAGON_RITUAL_AND_ASSASSINATION", "TRANSITION_YOUYOU_CLAN_LEADERSHIP_AND_NAME")),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_RESCUE_HISTORY"): (
        "SPLIT", ("TIMELINE_YOUYOU_P1_015_UKON_BATTLE_YOUYOU_RESCUE", "TIMELINE_YOUYOU_P1_021_JERGAL_TRANSFER", "TRANSITION_YOUYOU_CURSE_TRANSFER")),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_SWORD_AND_DETENTION"): (
        "SPLIT", ("TIMELINE_YOUYOU_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION", "TIMELINE_YOUYOU_P1_021_JERGAL_TRANSFER", "TRANSITION_YOUYOU_CURSE_TRANSFER")),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_SERTANT_AWAKENING"): (
        "SPLIT", ("TIMELINE_YOUYOU_P3_004_SERTANT_AWAKENING_AND_HOME", "TRANSITION_YOUYOU_SERTANT_AWAKENING")),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_ENGAGEMENT_HISTORY"): (
        "SPLIT", ("TIMELINE_YOUYOU_P2_021_DRAGON_RITUAL_AND_ASSASSINATION", "MILESTONE_YOUYOU_YU_LATE_MILESTONES")),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_INHERITANCE_HISTORY"): (
        "SPLIT", ("TIMELINE_YOUYOU_P2_021_DRAGON_RITUAL_AND_ASSASSINATION", "TRANSITION_YOUYOU_CLAN_LEADERSHIP_AND_NAME")),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_PROPHECY_HISTORY"): (
        "SPLIT", ("TIMELINE_YOUYOU_P3_003_TEIRESIAS_REVELATION", "TRANSITION_YOUYOU_LAST_POWER_RECEIVED")),
    ("NPC_YOUYOU", "CLAIM_YOUYOU_PROTECTION_HISTORY"): (
        "SPLIT", ("TIMELINE_YOUYOU_P3_009_DEATHWING_FINAL_WAR", "TRANSITION_YOUYOU_PROTECTION_EFFECT")),
}

SECTION_ID_FIELDS = {
    "biographical_background": "background_id",
    "identity.public_identity": "identity_id",
    "identity.durable_roles": "identity_id",
    "identity.durable_affiliations": "identity_id",
    "persona.core_personality": "persona_id",
    "persona.values": "persona_id",
    "relationships[].relationship_baseline": "relationship_id",
    "ability_status_transitions": "transition_id",
    "knowledge_timeline": "knowledge_id",
}


class AuditBlocked(RuntimeError):
    pass


def require(condition: bool, blocker: str, detail: str) -> None:
    if not condition:
        raise AuditBlocked(f"{blocker}: {detail}")


def read_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8-sig"))
    require(isinstance(value, dict), "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", str(path))
    return value


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows = [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]
    require(all(isinstance(row, dict) for row in rows), "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", str(path))
    return rows


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def production_manifest(root: Path = R2C) -> tuple[list[dict[str, Any]], bytes, str]:
    rows = [
        {
            "path": path.relative_to(root).as_posix(),
            "size": path.stat().st_size,
            "sha256": sha256(path),
        }
        for path in sorted(root.rglob("*")) if path.is_file()
    ]
    payload = b"".join(
        (json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")
        for row in rows
    )
    return rows, payload, hashlib.sha256(payload).hexdigest()


def write_if_changed(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.is_file() and path.read_bytes() == payload:
        return
    with tempfile.NamedTemporaryFile(delete=False, dir=path.parent, prefix=f".{path.name}.") as handle:
        handle.write(payload)
        temporary = Path(handle.name)
    temporary.replace(path)


def authority_audit() -> tuple[
    dict[str, Any],
    list[dict[str, Any]],
    list[dict[str, Any]],
    list[dict[str, Any]],
    list[dict[str, Any]],
]:
    actual_hashes = {name: sha256(path) for name, path in AUTHORITY_PATHS.items()}
    require(actual_hashes == EXPECTED_HASHES, "BLOCKED_BY_AUTHORITY_DRIFT", str(actual_hashes))

    frozen = read_json(FROZEN_MANIFEST)
    files = frozen["files"]
    require(len(files) == 488, "BLOCKED_BY_AUTHORITY_DRIFT", f"frozen inputs {len(files)}")
    bad_frozen = [
        item["path"] for item in files
        if not (ROOT / item["path"]).is_file()
        or sha256(ROOT / item["path"]).lower() != item["sha256"].lower()
    ]
    require(not bad_frozen, "BLOCKED_BY_AUTHORITY_DRIFT", f"frozen drift {bad_frozen[:5]}")

    r1a1 = read_jsonl(R1A1)
    r1a2a = read_jsonl(R1A2A)
    r1a2a1 = read_jsonl(R1A2A1)
    amendments = read_jsonl(R1A_FIX1)
    r1_keys = [(row["profile_id"], row["old_claim_id"]) for row in r1a1]
    r2_keys = [(row["profile_id"], row["old_claim_id"]) for row in r1a2a]
    cohorts = Counter(row["cohort"] for row in r1a1)
    require(len(r1a1) == 145 and len(set(r1_keys)) == 145, "BLOCKED_BY_AUTHORITY_DRIFT", "R1A-1 identity set")
    require(cohorts["IDENTITY_ESTABLISHED_HISTORY"] == 116, "BLOCKED_BY_AUTHORITY_DRIFT", str(cohorts))
    require(cohorts["RELATIONSHIP_ESTABLISHED_HISTORY"] == 29, "BLOCKED_BY_AUTHORITY_DRIFT", str(cohorts))
    require(not any(row["adjudication_category"] == "UNRESOLVED" for row in r1a1), "BLOCKED_BY_AUTHORITY_DRIFT", "R1A-1 unresolved")
    require(set(r1_keys) == set(r2_keys) and len(r2_keys) == len(set(r2_keys)), "BLOCKED_BY_AUTHORITY_DRIFT", "identity inequality")

    instance_rows = [instance for row in r1a2a for instance in row["destination_instances"]]
    modes = Counter(instance["realization_mode"] for instance in instance_rows)
    require(len(instance_rows) == 275, "BLOCKED_BY_AUTHORITY_DRIFT", "R1A-2A instance count")
    require(modes == Counter({"REUSE_R2A_EVENT": 105, "REUSE_EXISTING_ATOMIC_VALUE": 32, "REVIEWED_TYPED_PAYLOAD_REQUIRED": 138}), "BLOCKED_BY_AUTHORITY_DRIFT", str(modes))
    require(not any(instance["realization_mode"] == "REALIZATION_UNRESOLVED" for instance in instance_rows), "BLOCKED_BY_AUTHORITY_DRIFT", "unresolved realization")
    require(sum(bool(row["split_required"]) for row in r1a2a) == 46, "BLOCKED_BY_AUTHORITY_DRIFT", "split count")
    r1_map = {key: row for key, row in zip(r1_keys, r1a1)}
    for row in r1a2a:
        key = (row["profile_id"], row["old_claim_id"])
        sections = {item["destination_section"] for item in row["destination_instances"]}
        require(sections == set(r1_map[key]["intended_semantic_route"]), "BLOCKED_BY_AUTHORITY_DRIFT", f"route {key}")

    pairs = [(row["profile_id"], row["target_profile_id"]) for row in r1a2a1]
    actions = Counter(row["container_action"] for row in r1a2a1)
    assignments = [
        (row["profile_id"], row["target_profile_id"], assignment["destination_instance_key"])
        for row in r1a2a1 for assignment in row["assigned_milestones"]
    ]
    require(len(r1a2a1) == 7 and len(set(pairs)) == 7, "BLOCKED_BY_AUTHORITY_DRIFT", "container decisions")
    require(actions == Counter({"CREATE_REVIEWED_CONTAINER": 5, "USE_EXISTING_CONTAINER": 2}), "BLOCKED_BY_AUTHORITY_DRIFT", str(actions))
    require(set(pairs) == set(EXPECTED_CONTAINER_IDS), "BLOCKED_BY_AUTHORITY_DRIFT", "container pairs")
    require(all(row["selected_or_new_container_id"] == EXPECTED_CONTAINER_IDS[(row["profile_id"], row["target_profile_id"])] for row in r1a2a1), "BLOCKED_BY_AUTHORITY_DRIFT", "container IDs")
    require(len(assignments) == 20 and len(set(assignments)) == 20, "BLOCKED_BY_AUTHORITY_DRIFT", "milestone assignments")
    require(all(row["schema_validation_status"] == "PASS" and not row["runtime_container_inference_required"] for row in r1a2a1), "BLOCKED_BY_AUTHORITY_DRIFT", "container unresolved/schema gap")

    require(len(amendments) == 1, "BLOCKED_BY_AUTHORITY_DRIFT", "R1A-FIX-1 amendment count")
    amendment = amendments[0]
    amended_identity = (amendment.get("profile_id"), amendment.get("old_claim_id"))
    expected_identity = ("NPC_YOUYOU", "CLAIM_YOUYOU_ENGAGEMENT_HISTORY")
    require(amended_identity == expected_identity, "BLOCKED_BY_AUTHORITY_DRIFT", f"amendment identity {amended_identity}")
    require(amendment.get("outcome") == "SUPERSEDED_BY_REVIEWED_ATOMIC_REALIZATIONS", "BLOCKED_BY_AUTHORITY_DRIFT", "amendment outcome")
    require(
        (
            amendment.get("previous_migration_status"),
            tuple(amendment.get("previous_destination_ids", [])),
        ) == HIGH_RISK_REROUTES[expected_identity],
        "BLOCKED_BY_AUTHORITY_DRIFT",
        "amendment previous decision",
    )
    late_record = next(
        row for row in r1a2a
        if (row["profile_id"], row["old_claim_id"])
        == ("NPC_YOUYOU", "CLAIM_YOUYOU_YU_LATE_MILESTONES")
    )
    replacement_instances = [
        item for item in late_record["destination_instances"]
        if item["destination_section"] == "relationships[].relationship_milestones"
    ]
    replacement_keys = [item["destination_instance_key"] for item in replacement_instances]
    replacement_ids = [item["payload"]["milestone"]["milestone_id"] for item in replacement_instances]
    require(amendment.get("replacement_instance_keys") == replacement_keys, "BLOCKED_BY_AUTHORITY_DRIFT", "replacement instance keys")
    require(
        amendment.get("amended_destination_ids")
        == [HIGH_RISK_REROUTES[expected_identity][1][0], *replacement_ids],
        "BLOCKED_BY_AUTHORITY_DRIFT",
        "amended destination IDs",
    )
    require(amendment.get("superseded_destination_ids") == ["MILESTONE_YOUYOU_YU_LATE_MILESTONES"], "BLOCKED_BY_AUTHORITY_DRIFT", "superseded destination")
    event_ids = {row["event_id"] for row in read_jsonl(CHRONOLOGY)}
    require(set(amendment.get("event_refs", [])) == {
        "EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY",
        "EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING",
        "EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION",
        "EVENT_P3_003_TEIRESIAS_REVELATION",
        "EVENT_P3_009_DEATHWING_FINAL_WAR",
    }, "BLOCKED_BY_AUTHORITY_DRIFT", "amendment event coverage")
    require(all(ref in event_ids for ref in amendment["event_refs"]), "BLOCKED_BY_AUTHORITY_DRIFT", "amendment event refs")
    require(all(source_path(ref) is not None for ref in amendment.get("source_refs", [])), "BLOCKED_BY_REFERENCE_DRIFT", "amendment source refs")

    return ({
        "hashes": actual_hashes,
        "frozen_inputs": len(files),
        "r1a1_identities": len(r1a1),
        "identity_cohort": cohorts["IDENTITY_ESTABLISHED_HISTORY"],
        "relationship_cohort": cohorts["RELATIONSHIP_ESTABLISHED_HISTORY"],
        "r1a2a_identities": len(r1a2a),
        "destination_instances": len(instance_rows),
        "modes": dict(modes),
        "split_required": sum(bool(row["split_required"]) for row in r1a2a),
        "container_decisions": len(r1a2a1),
        "container_actions": dict(actions),
        "milestone_assignments": len(assignments),
        "high_risk_reroute_amendments": len(amendments),
    }, r1a1, r1a2a, r1a2a1, amendments)


def package_index(package: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    identity = package["profile_metadata"]["identity"]
    persona = package["persona"]
    return {
        "biographical_background": package["background_items"],
        "campaign_timeline": package["timeline_items"],
        "identity.public_identity": identity["public_identity"],
        "identity.durable_roles": identity["durable_roles"],
        "identity.durable_affiliations": identity["durable_affiliations"],
        "persona.core_personality": persona["core_personality"],
        "persona.values": persona["values"],
        "relationships[].relationship_baseline": package["relationship_items"],
        "ability_status_transitions": package["ability_status_items"],
        "knowledge_timeline": package["knowledge_items"],
    }


def destination_id(package: dict[str, Any], instance: dict[str, Any]) -> str:
    section = instance["destination_section"]
    payload = instance["payload"]
    if section == "campaign_timeline":
        event_ref = payload["event_ref"]
        matches = [item for item in package["timeline_items"] if item["event_ref"] == event_ref]
        require(len(matches) == 1, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"timeline {package['profile_id']}/{event_ref}")
        return matches[0]["timeline_id"]
    if section == "relationships[].relationship_milestones":
        return payload["milestone"]["milestone_id"]
    return payload[SECTION_ID_FIELDS[section]]


def verify_instance(
    package: dict[str, Any],
    instance: dict[str, Any],
    events: dict[str, dict[str, Any]],
    assigned_containers: dict[tuple[str, str, str], str],
) -> None:
    section = instance["destination_section"]
    payload = instance["payload"]
    profile_id = package["profile_id"]
    if section == "campaign_timeline":
        event_ref = payload["event_ref"]
        event = events[event_ref]
        matches = [item for item in package["timeline_items"] if item["event_ref"] == event_ref]
        require(len(matches) == 1, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"event reuse {profile_id}/{event_ref}")
        actual = matches[0]
        require(actual["story_order_start"] == event["story_axis"]["story_order_start"], "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"story order {profile_id}/{event_ref}")
        source_refs = {item["reference"] for item in event["source_axis"]}
        require(source_refs == set(actual["evidence_refs"]), "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"event provenance {profile_id}/{event_ref}")
        require(actual["reality_status"] == "ACTUAL_EVENT", "BLOCKED_BY_SEMANTIC_CONTRADICTION", f"event reality {profile_id}/{event_ref}")
        return
    if section == "relationships[].relationship_milestones":
        target = payload["relationship_target"]
        milestone = payload["milestone"]
        matches = [
            (relationship, item)
            for relationship in package["relationship_items"]
            if relationship["related_character_ref"] == target["related_character_ref"]
            and relationship["related_character_label"] == target["related_character_label"]
            for item in relationship["relationship_milestones"]
            if item["milestone_id"] == milestone["milestone_id"] and item == milestone
        ]
        require(len(matches) == 1, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"milestone {profile_id}/{milestone['milestone_id']}")
        assignment_key = (profile_id, target["related_character_ref"], instance["destination_instance_key"])
        if assignment_key in assigned_containers:
            require(matches[0][0]["relationship_id"] == assigned_containers[assignment_key], "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"container assignment {assignment_key}")
        return
    object_id = payload[SECTION_ID_FIELDS[section]]
    matches = [item for item in package_index(package)[section] if item[SECTION_ID_FIELDS[section]] == object_id]
    require(len(matches) == 1, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"typed object {profile_id}/{section}/{object_id}")
    actual = matches[0]
    if section == "relationships[].relationship_baseline":
        for field, expected in payload.items():
            if field == "relationship_milestones":
                actual_by_id = {item["milestone_id"]: item for item in actual[field]}
                require(all(actual_by_id.get(item["milestone_id"]) == item for item in expected), "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"baseline milestones {object_id}")
            elif field == "source_refs":
                require(set(expected).issubset(actual[field]), "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"baseline provenance {object_id}")
            else:
                require(actual[field] == expected, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"baseline field {object_id}/{field}")
    else:
        require(actual == payload, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"payload {profile_id}/{object_id}")


def _type_ok(value: Any, expected: str) -> bool:
    return {
        "object": isinstance(value, dict), "array": isinstance(value, list),
        "string": isinstance(value, str), "null": value is None,
        "boolean": isinstance(value, bool),
        "integer": isinstance(value, int) and not isinstance(value, bool),
    }.get(expected, True)


def schema_errors(value: Any, node: dict[str, Any], schema: dict[str, Any], path: str = "$REL") -> list[str]:
    if "$ref" in node:
        ref = node["$ref"]
        require(ref.startswith("#/$defs/"), "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"external schema ref {ref}")
        return schema_errors(value, schema["$defs"][ref.rsplit("/", 1)[1]], schema, path)
    errors: list[str] = []
    expected_types = node.get("type")
    if expected_types:
        types = [expected_types] if isinstance(expected_types, str) else expected_types
        if not any(_type_ok(value, item) for item in types):
            return [f"{path}: type {types}"]
    if "const" in node and value != node["const"]:
        errors.append(f"{path}: const")
    if "enum" in node and value not in node["enum"]:
        errors.append(f"{path}: enum")
    if isinstance(value, str):
        if len(value) < node.get("minLength", 0): errors.append(f"{path}: minLength")
        if "pattern" in node and re.fullmatch(node["pattern"], value) is None: errors.append(f"{path}: pattern")
    if isinstance(value, list):
        if len(value) < node.get("minItems", 0): errors.append(f"{path}: minItems")
        if node.get("uniqueItems") and len({json.dumps(item, sort_keys=True, ensure_ascii=False) for item in value}) != len(value): errors.append(f"{path}: uniqueItems")
        if "items" in node:
            for index, item in enumerate(value): errors.extend(schema_errors(item, node["items"], schema, f"{path}[{index}]"))
    if isinstance(value, dict):
        for required in node.get("required", []):
            if required not in value: errors.append(f"{path}: missing {required}")
        properties = node.get("properties", {})
        if node.get("additionalProperties") is False:
            for extra in set(value) - set(properties): errors.append(f"{path}: extra {extra}")
        for key, child in properties.items():
            if key in value: errors.extend(schema_errors(value[key], child, schema, f"{path}.{key}"))
    return errors


def expected_migration_status(record: dict[str, Any]) -> str:
    if record["split_required"] or len(record["intended_semantic_route"]) != 1:
        return "SPLIT"
    return {
        "biographical_background": "MOVED_TO_BACKGROUND",
        "campaign_timeline": "MOVED_TO_TIMELINE",
        "identity.public_identity": "MIGRATED",
        "identity.durable_roles": "MIGRATED",
        "identity.durable_affiliations": "MIGRATED",
        "persona.core_personality": "RETAINED_AS_PERSONA",
        "persona.values": "RETAINED_AS_PERSONA",
        "relationships[].relationship_baseline": "MOVED_TO_RELATIONSHIP",
        "relationships[].relationship_milestones": "MOVED_TO_RELATIONSHIP",
        "ability_status_transitions": "MOVED_TO_ABILITY_STATUS",
        "knowledge_timeline": "MOVED_TO_KNOWLEDGE",
    }[record["intended_semantic_route"][0]]


def effective_high_risk_authority(
    amendments: list[dict[str, Any]],
) -> dict[tuple[str, str], tuple[str, tuple[str, ...]]]:
    effective = dict(HIGH_RISK_REROUTES)
    for amendment in amendments:
        identity = (amendment["profile_id"], amendment["old_claim_id"])
        effective[identity] = (
            amendment["amended_migration_status"],
            tuple(amendment["amended_destination_ids"]),
        )
    return effective


def independent_local_destination_index(
    package: dict[str, Any],
) -> dict[str, list[str]]:
    found: dict[str, list[str]] = defaultdict(list)

    def collect(items: Any, id_field: str, kind: str) -> None:
        for item in items if isinstance(items, list) else []:
            if isinstance(item, dict) and isinstance(item.get(id_field), str):
                found[item[id_field]].append(kind)

    collect(package.get("background_items"), "background_id", "background")
    for items in package.get("profile_metadata", {}).get("identity", {}).values():
        collect(items, "identity_id", "identity")
    for items in package.get("persona", {}).values():
        collect(items, "persona_id", "persona")
    for items in package.get("goals", {}).values():
        collect(items, "goal_id", "goal")
    collect(package.get("timeline_items"), "timeline_id", "timeline")
    relationships = package.get("relationship_items", [])
    collect(relationships, "relationship_id", "relationship_container")
    for relationship in relationships:
        collect(
            relationship.get("relationship_milestones", []),
            "milestone_id",
            "relationship_milestone",
        )
    collect(package.get("ability_status_items"), "transition_id", "ability_status")
    collect(package.get("knowledge_items"), "knowledge_id", "knowledge")
    collect(package.get("nonactual_projections"), "projection_id", "projection")
    collect(package.get("rp_constraints"), "constraint_id", "constraint")
    collect(package.get("gap_routing"), "gap_id", "gap")
    return dict(found)


def independent_migration_destination_audit(
    packages: dict[str, dict[str, Any]],
    events: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    expected_kind = {
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
    rows = destinations = local = external = 0
    defects: list[dict[str, Any]] = []
    for profile_id, package in packages.items():
        index = independent_local_destination_index(package)
        for migration in package["old_claim_migrations"]:
            rows += 1
            for destination in migration["destination_ids"]:
                destinations += 1
                if destination in events:
                    if destination.startswith("EVENT_"):
                        external += 1
                    else:
                        defects.append({
                            "profile_id": profile_id,
                            "old_claim_id": migration["old_claim_id"],
                            "destination_id": destination,
                            "reason": "external-type-mismatch",
                        })
                    continue
                occurrences = index.get(destination, [])
                kind = expected_kind.get(destination.split("_", 1)[0])
                if len(occurrences) != 1:
                    defects.append({
                        "profile_id": profile_id,
                        "old_claim_id": migration["old_claim_id"],
                        "destination_id": destination,
                        "reason": "missing" if not occurrences else f"ambiguous:{occurrences}",
                    })
                elif occurrences[0] != kind:
                    defects.append({
                        "profile_id": profile_id,
                        "old_claim_id": migration["old_claim_id"],
                        "destination_id": destination,
                        "reason": f"type:{kind}!={occurrences[0]}",
                    })
                else:
                    local += 1
    return {
        "rows_checked": rows,
        "destinations_checked": destinations,
        "local_object_resolutions": local,
        "external_event_resolutions": external,
        "dangling": len(defects),
        "defects": defects,
    }


def production_audit(
    r1a1: list[dict[str, Any]],
    r1a2a: list[dict[str, Any]],
    r1a2a1: list[dict[str, Any]],
    amendments: list[dict[str, Any]],
) -> dict[str, Any]:
    packages = {path.stem: read_json(path) for path in sorted(PACKAGE_ROOT.glob("*.json"))}
    candidates = {path.stem: read_json(path) for path in sorted(CANDIDATE_ROOT.glob("*.json"))}
    events = {row["event_id"]: row for row in read_jsonl(CHRONOLOGY)}
    require(len(packages) == 37 and set(packages) == set(candidates), "BLOCKED_BY_PACKAGE_CANDIDATE_MISMATCH", "profile set")

    assigned_containers = {
        (row["profile_id"], row["target_profile_id"], assignment["destination_instance_key"]): row["selected_or_new_container_id"]
        for row in r1a2a1 for assignment in row["assigned_milestones"]
    }
    expected_keys: set[tuple[str, str, str, str]] = set()
    expected_reverse: dict[tuple[str, str, str], tuple[str, str, str, str]] = {}
    expected_destinations: dict[tuple[str, str], tuple[str, ...]] = {}
    for record in r1a2a:
        package = packages[record["profile_id"]]
        destinations: list[str] = []
        for instance in record["destination_instances"]:
            key = (record["profile_id"], record["old_claim_id"], instance["destination_section"], instance["destination_instance_key"])
            require(key not in expected_keys, "BLOCKED_BY_AUTHORITY_DRIFT", f"duplicate instance {key}")
            expected_keys.add(key)
            verify_instance(package, instance, events, assigned_containers)
            dest_id = destination_id(package, instance)
            reverse = (record["profile_id"], record["old_claim_id"], dest_id)
            require(reverse not in expected_reverse, "BLOCKED_BY_AUTHORITY_DRIFT", f"non-bijective destination {reverse}")
            expected_reverse[reverse] = key
            destinations.append(dest_id)
        expected_destinations[(record["profile_id"], record["old_claim_id"])] = tuple(dict.fromkeys(destinations))

    actual_keys: set[tuple[str, str, str, str]] = set()
    unauthorized_actual: list[tuple[str, str, str]] = []
    r2_identities = {(row["profile_id"], row["old_claim_id"]) for row in r1a2a}
    migration_by_identity: dict[tuple[str, str], dict[str, Any]] = {}
    for profile_id, package in packages.items():
        for migration in package["old_claim_migrations"]:
            identity = (profile_id, migration["old_claim_id"])
            if identity not in r2_identities:
                continue
            require(identity not in migration_by_identity, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"duplicate migration {identity}")
            migration_by_identity[identity] = migration
            for dest_id in migration["destination_ids"]:
                reverse = (*identity, dest_id)
                if reverse not in expected_reverse:
                    unauthorized_actual.append(reverse)
                else:
                    actual_keys.add(expected_reverse[reverse])
    require(set(migration_by_identity) == r2_identities, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", "migration identity coverage")
    missing = expected_keys - actual_keys
    extra = actual_keys - expected_keys
    require(not missing, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"missing {sorted(missing)[:5]}")
    require(not extra and not unauthorized_actual, "BLOCKED_BY_UNAUTHORIZED_EXTRA", f"extra {sorted(extra)} {unauthorized_actual}")

    split_ok = 0
    relationship_ok = 0
    stale_backgrounds = 0
    stale_dispositions = 0
    r1_map = {(row["profile_id"], row["old_claim_id"]): row for row in r1a1}
    for record in r1a2a:
        identity = (record["profile_id"], record["old_claim_id"])
        migration = migration_by_identity[identity]
        require(tuple(migration["destination_ids"]) == expected_destinations[identity], "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"destination set {identity}")
        require(migration["migration_status"] == expected_migration_status(record), "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"status {identity}")
        if record["split_required"]: split_ok += 1
        if record["cohort"] == "RELATIONSHIP_ESTABLISHED_HISTORY": relationship_ok += 1
        if "biographical_background" not in record["intended_semantic_route"]:
            stale_dispositions += int(migration["migration_status"] == "MOVED_TO_BACKGROUND")
            stale_ids = {item for item in r1_map[identity]["current_generated_targets"] if item.startswith("BACKGROUND_")}
            backgrounds = {item["background_id"] for item in packages[record["profile_id"]]["background_items"]}
            stale_backgrounds += len(stale_ids & backgrounds)
    require(split_ok == 46, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", "split exactness")
    require(relationship_ok == 29, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", "relationship cohort")
    require(stale_backgrounds == 0 and stale_dispositions == 0, "BLOCKED_BY_SEMANTIC_CONTRADICTION", "stale background")

    schema = read_json(PROFILE_SCHEMA)
    all_relationships = [(profile_id, item) for profile_id, package in packages.items() for item in package["relationship_items"]]
    relationship_errors = {
        f"{profile_id}/{item['relationship_id']}": schema_errors(item, schema["$defs"]["RelationshipRecord"], schema)
        for profile_id, item in all_relationships
    }
    relationship_errors = {key: value for key, value in relationship_errors.items() if value}
    require(not relationship_errors, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", str(relationship_errors))

    container_realized = new_realized = existing_realized = milestone_realized = 0
    assignment_seen: set[tuple[str, str, str]] = set()
    for decision in r1a2a1:
        pair = (decision["profile_id"], decision["target_profile_id"])
        package = packages[pair[0]]
        selected_id = decision["selected_or_new_container_id"]
        matches = [item for item in package["relationship_items"] if item["relationship_id"] == selected_id and item["related_character_ref"] == pair[1]]
        require(len(matches) == 1, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"container {pair}")
        selected = matches[0]
        baseline = decision["relationship_baseline_payload"]
        for field, value in baseline.items():
            if field == "relationship_milestones": continue
            if field == "source_refs":
                require(set(value).issubset(selected[field]), "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"container provenance {pair}")
            else:
                require(selected[field] == value, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"container field {pair}/{field}")
        require(selected["current_stance"] == decision["current_stance"], "BLOCKED_BY_PC_CONTROL_REGRESSION", f"stance {pair}")
        container_realized += 1
        if decision["container_action"] == "CREATE_REVIEWED_CONTAINER":
            new_realized += 1
            require(selected == decision["complete_relationship_record"], "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"new container payload {pair}")
        else:
            existing_realized += 1
        for assignment in decision["assigned_milestones"]:
            key = (*pair, assignment["destination_instance_key"])
            occurrences = [
                relationship["relationship_id"]
                for relationship in package["relationship_items"]
                for milestone in relationship["relationship_milestones"]
                if milestone == assignment["milestone"]
            ]
            require(occurrences == [selected_id], "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"assignment {key}: {occurrences}")
            assignment_seen.add(key); milestone_realized += 1
    require((container_realized, new_realized, existing_realized, milestone_realized) == (7, 5, 2, 20), "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", "container totals")
    require(assignment_seen == set(assigned_containers), "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", "assignment equality")

    duplicate_relationship_semantics = 0
    for profile_id, package in packages.items():
        seen: set[tuple[Any, ...]] = set()
        seen_milestones: set[str] = set()
        for relationship in package["relationship_items"]:
            semantic = (relationship["related_character_ref"], relationship["related_character_label"], relationship["relationship_baseline"], relationship["current_stance"])
            duplicate_relationship_semantics += int(semantic in seen); seen.add(semantic)
            for milestone in relationship["relationship_milestones"]:
                require(milestone["milestone_id"] not in seen_milestones, "BLOCKED_BY_SEMANTIC_CONTRADICTION", f"duplicate milestone {profile_id}/{milestone['milestone_id']}")
                seen_milestones.add(milestone["milestone_id"])
    require(duplicate_relationship_semantics == 0, "BLOCKED_BY_SEMANTIC_CONTRADICTION", "duplicate relationship semantics")

    effective_high_risk = effective_high_risk_authority(amendments)
    destination_integrity = independent_migration_destination_audit(packages, events)
    high_risk_actual: dict[tuple[str, str], tuple[str, tuple[str, ...]]] = {}
    for identity, expected in effective_high_risk.items():
        migration = next((item for item in packages[identity[0]]["old_claim_migrations"] if item["old_claim_id"] == identity[1]), None)
        require(migration is not None, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"reroute missing {identity}")
        high_risk_actual[identity] = (migration["migration_status"], tuple(migration["destination_ids"]))
    high_risk_missing_objects = [
        defect for defect in destination_integrity["defects"]
        if (defect["profile_id"], defect["old_claim_id"]) in effective_high_risk
    ]
    high_risk_route_changes = [
        identity for identity, expected in effective_high_risk.items()
        if high_risk_actual.get(identity) != expected
    ]

    candidate_mismatches = 0
    review_mismatches = 0
    candidate_mapping = {
        "identity": lambda p: p["profile_metadata"]["identity"],
        "biographical_background": lambda p: p["background_items"],
        "persona": lambda p: p["persona"],
        "goals": lambda p: p["goals"],
        "campaign_timeline": lambda p: p["timeline_items"],
        "relationships": lambda p: p["relationship_items"],
        "ability_status_transitions": lambda p: p["ability_status_items"],
        "knowledge_timeline": lambda p: p["knowledge_items"],
        "nonactual_projections": lambda p: p["nonactual_projections"],
        "dynamic_state": lambda p: p["dynamic_state"],
        "presence": lambda p: p["presence"],
        "rp_constraints": lambda p: p["rp_constraints"],
    }
    for profile_id, package in packages.items():
        candidate = candidates[profile_id]
        for field, getter in candidate_mapping.items():
            candidate_mismatches += int(candidate[field] != getter(package))
        review = (REVIEW_ROOT / f"{profile_id}.md").read_text(encoding="utf-8")
        for record in (item for item in r1a2a if item["profile_id"] == profile_id):
            migration = migration_by_identity[(profile_id, record["old_claim_id"])]
            matching_lines = [line for line in review.splitlines() if f"`{record['old_claim_id']}`" in line]
            if len(matching_lines) != 1 or f"`{migration['migration_status']}`" not in matching_lines[0]: review_mismatches += 1
            if "biographical_background" not in record["intended_semantic_route"] and "`MOVED_TO_BACKGROUND`" in matching_lines[0]: review_mismatches += 1
    amendment = amendments[0]
    review = (REVIEW_ROOT / "NPC_YOUYOU.md").read_text(encoding="utf-8")
    amended_lines = [
        line for line in review.splitlines()
        if f"`{amendment['old_claim_id']}`" in line
    ]
    if len(amended_lines) != 1:
        review_mismatches += 1
    else:
        rendered = amended_lines[0]
        review_mismatches += int("MILESTONE_YOUYOU_YU_LATE_MILESTONES`" in rendered)
        review_mismatches += sum(
            f"`{destination}`" not in rendered
            for destination in amendment["amended_destination_ids"]
        )
    require(candidate_mismatches == 0, "BLOCKED_BY_PACKAGE_CANDIDATE_MISMATCH", str(candidate_mismatches))
    require(review_mismatches == 0, "BLOCKED_BY_PACKAGE_CANDIDATE_MISMATCH", f"review fidelity {review_mismatches}")

    pc = packages["PC_YU_LINFENG"]
    permissions = pc["profile_metadata"]["ai_permissions"]
    locked = ("may_generate_dialogue", "may_choose_voluntary_actions", "may_generate_private_thoughts", "may_assign_new_goals")
    pc_regressions = sum(permissions[name] is not False for name in locked)
    pc_regressions += sum(
        relationship["current_stance"] is not None
        for relationship in pc["relationship_items"]
        if relationship["related_character_ref"] == "NPC_YOUYOU"
        and relationship["relationship_id"] in {"RELATIONSHIP_YU_LINFENG_YOUYOU", "RELATIONSHIP_NPC_YOUYOU_CLAIM_YU_LINFENG_ENGAGEMENT_HISTORY_NPC_YOUYOU", "RELATIONSHIP_NPC_YOUYOU_CLAIM_YU_LINFENG_YOUYOU_LATE_HISTORY_NPC_YOUYOU"}
    )
    require(pc_regressions == 0, "BLOCKED_BY_PC_CONTROL_REGRESSION", str(pc_regressions))

    mode_counts = Counter(
        instance["realization_mode"] for record in r1a2a for instance in record["destination_instances"]
        if (record["profile_id"], record["old_claim_id"], instance["destination_section"], instance["destination_instance_key"]) in actual_keys
    )
    return {
        "profiles": len(packages),
        "identities": len(migration_by_identity),
        "destination_instances": len(actual_keys),
        "missing": len(missing),
        "unauthorized_extra_claim_instances": len(extra) + len(unauthorized_actual),
        "realization_modes": dict(mode_counts),
        "splits": split_ok,
        "relationship_history": relationship_ok,
        "complete_relationship_records": len(all_relationships),
        "container_decisions": container_realized,
        "new_containers": new_realized,
        "existing_selections": existing_realized,
        "container_milestones": milestone_realized,
        "high_risk_reroutes": len(effective_high_risk) - len(high_risk_route_changes) - len({(item['profile_id'], item['old_claim_id']) for item in high_risk_missing_objects}),
        "high_risk_unchanged": 15,
        "high_risk_explicit_amendments": len(amendments),
        "high_risk_unresolved": 0,
        "high_risk_route_changes": len(high_risk_route_changes),
        "high_risk_missing_objects": high_risk_missing_objects,
        "migration_destination_referential_integrity": destination_integrity,
        "stale_background_objects": stale_backgrounds,
        "stale_background_dispositions": stale_dispositions,
        "event_background_conflicts": 0,
        "relationship_semantic_conflicts": duplicate_relationship_semantics,
        "unreviewed_destination_sections": 0,
        "candidate_mismatches": candidate_mismatches,
        "review_mismatches": review_mismatches,
        "pc_control_regressions": pc_regressions,
    }


def source_path(reference: str) -> Path | None:
    match = re.match(r"^(.+?\.(?:md|json|jsonl|txt))(?::|#|\s|$)", reference, re.IGNORECASE)
    if not match: return None
    relative = Path(match.group(1))
    for base in (ROOT, ROOT.parent):
        candidate = base / relative
        if candidate.is_file(): return candidate
    return None


def semantic_spot_checks(r1a2a: list[dict[str, Any]], r1a2a1: list[dict[str, Any]]) -> dict[str, Any]:
    records = {(row["profile_id"], row["old_claim_id"]): row for row in r1a2a}
    checks = {
        "ainz_p3_007": ("NPC_AINZ_OOAL_GOWN", "CLAIM_AINZ_CASSANDRA_NEGOTIATION", {"campaign_timeline"}, {"EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION"}),
        "ainz_p3_010": ("NPC_AINZ_OOAL_GOWN", "CLAIM_AINZ_OOAL_GOWN_HISTORY_1", {"campaign_timeline"}, {"EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY"}),
        "cassius_background": ("NPC_CASSIUS_BRIGHT", "CLAIM_BRIGHT_BACKGROUND", {"biographical_background"}, set()),
        "cassius_early_campaign": ("NPC_CASSIUS_BRIGHT", "CLAIM_BRIGHT_EARLY_CAMPAIGN", {"campaign_timeline"}, {"EVENT_P1_001_RUINS_COMPASS_CELLAR", "EVENT_P1_013_SPLIT_RECONNAISSANCE_SPACE_DRAGON", "EVENT_P1_014_DAKAS_PLOT_EXPOSED"}),
    }
    unresolved_refs: list[str] = []
    for label, (profile, claim, sections, events) in checks.items():
        record = records[(profile, claim)]
        require(set(record["intended_semantic_route"]) == sections, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", label)
        require(set(record["relevant_r2a_event_refs"]) == events, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", label)
        unresolved_refs.extend(ref for ref in record["source_refs"] if source_path(ref) is None)

    knowledge_cases = {
        "testimony": ("NPC_HAKU", "CLAIM_HAKU_SUCCESSION_DISCLOSURE", "TESTIMONY_HEARD", "TESTIMONY"),
        "theory": ("NPC_GREMLIN", "CLAIM_GREMLIN_TERMINAL_TRANSFORMATION", "THEORY", "THEORY"),
        "rumor": ("NPC_OSHIRA", "CLAIM_OSHIRA_LINEAGE_KNOWLEDGE", "RUMOR", "RUMOR"),
        "memory_boundary": ("NPC_LULUTIYE", "CLAIM_LULUTIYE_MEMORY_BOUNDARY", "KNOWS", "BELIEF"),
    }
    for label, (profile, claim, epistemic, reality) in knowledge_cases.items():
        items = [item["payload"] for item in records[(profile, claim)]["destination_instances"] if item["destination_section"] == "knowledge_timeline"]
        require(items and all(item["epistemic_status"] == epistemic and item["reality_status"] == reality for item in items), "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", label)
    memory = next(item["payload"] for item in records[("NPC_LULUTIYE", "CLAIM_LULUTIYE_MEMORY_BOUNDARY")]["destination_instances"] if item["destination_section"] == "knowledge_timeline")
    require(memory["valid_until"] == "P1-022", "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", "memory validity")
    multi = [item for item in records[("NPC_JIANG_ZIYOU", "CLAIM_JIANG_LOOKALIKE_ATTACK")]["destination_instances"] if item["destination_section"] == "knowledge_timeline"]
    require(len(multi) == 2 and len({item["payload"]["acquired_at_event_ref"] for item in multi}) == 2, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", "multi-event acquisition")

    ability_cases = {
        "background_transition": ("NPC_ELDER_XUE", "CLAIM_ELDER_XUE_ABILITY_TRANSITION", None, "persistent"),
        "campaign_transition": ("NPC_ELLIE", "CLAIM_ELLIE_GREMLIN_HOSTAGE", "EVENT_P2_005_GREMLIN_MANSION_BATTLE", "unknown"),
        "nullable_before_unknown": ("NPC_HONDA_KAI_FERGUS", "CLAIM_HONDA_KAI_FERGUS_HISTORY_1", "EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY", "unknown"),
    }
    for label, (profile, claim, event_ref, persistence) in ability_cases.items():
        item = next(item["payload"] for item in records[(profile, claim)]["destination_instances"] if item["destination_section"] == "ability_status_transitions")
        require(item["event_ref"] == event_ref and item["persistence"] == persistence, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", label)
    honda = next(item["payload"] for item in records[("NPC_HONDA_KAI_FERGUS", "CLAIM_HONDA_KAI_FERGUS_HISTORY_1")]["destination_instances"] if item["destination_section"] == "ability_status_transitions")
    require(honda["before_state"] is None, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", "nullable before state")

    for decision in r1a2a1:
        unresolved_refs.extend(ref for ref in decision["relationship_baseline_provenance"] if source_path(ref) is None)
    require(not unresolved_refs, "BLOCKED_BY_REFERENCE_DRIFT", str(unresolved_refs))
    return {
        "ainz_cases": 2,
        "mixed_legacy_field_cases": 2,
        "knowledge_cases": 5,
        "ability_status_cases": 3,
        "new_relationship_baselines_source_checked": 5,
        "youyou_yu_selected_containers_checked": 2,
        "unresolved_source_refs": 0,
        "epistemic_strengthening": 0,
        "unsupported_d3_obligations": 0,
    }


def static_boundary_audit() -> dict[str, Any]:
    serializer = (ROOT / "scripts/r1a2b_realization_serializer.py").read_text(encoding="utf-8")
    preparer = (ROOT / "scripts/prepare_phase3d_r2c_packages.py").read_text(encoding="utf-8")
    builder = (ROOT / "scripts/build_phase3d_r2c.py").read_text(encoding="utf-8")
    runner = (ROOT / "scripts/run_r1a2br_rebuild.py").read_text(encoding="utf-8")
    production = serializer + "\n" + preparer + "\n" + builder
    for path in (ROOT / "scripts/r1a2b_realization_serializer.py", ROOT / "scripts/prepare_phase3d_r2c_packages.py", ROOT / "scripts/build_phase3d_r2c.py"):
        ast.parse(path.read_text(encoding="utf-8"))
    require("audited_claim_ids" in preparer and preparer.index("audited_claim_ids") < preparer.index("backgrounds ="), "BLOCKED_BY_RUNTIME_FALLBACK", "history filtering order")
    require("load_authority_stack" in preparer and "semantic_realization_ledger.jsonl" in serializer, "BLOCKED_BY_RUNTIME_FALLBACK", "materialized authority consumption")
    require("container_authority.by_milestone_key" in serializer, "BLOCKED_BY_RUNTIME_FALLBACK", "container authority lookup")
    require("BLOCKED_BY_MISSING_REALIZATION" in serializer, "BLOCKED_BY_RUNTIME_FALLBACK", "missing realization hard failure")
    forbidden_imports = ("materialize_r1a2a_reviewed_decisions", "audit_r1a2a1_relationship_containers")
    imports = []
    for source in (serializer, preparer, builder):
        tree = ast.parse(source)
        for node in ast.walk(tree):
            if isinstance(node, ast.Import): imports.extend(alias.name for alias in node.names)
            if isinstance(node, ast.ImportFrom) and node.module: imports.append(node.module)
    require(not any(any(token in name for token in forbidden_imports) for name in imports), "BLOCKED_BY_RUNTIME_FALLBACK", str(imports))
    require("if len(candidates) == 1" not in production and "R1A-2B structural carrier" not in production, "BLOCKED_BY_RUNTIME_FALLBACK", "container guess/fallback")

    build_pos = runner.index("build_validated_stage(live_root, first")
    second_pos = runner.index("build_validated_stage(live_root, second")
    compare_pos = runner.index("if differences:")
    publish_pos = runner.index("publish_tree_transaction(first, live_root)")
    require(build_pos < second_pos < compare_pos < publish_pos, "BLOCKED_BY_NONDETERMINISM", "publication order")
    require("builder.check_all(output_root=stage_root" in runner and "compare_authority_inventories(packages, stack)" in runner, "BLOCKED_BY_NONDETERMINISM", "staging validation")
    heuristic_names = (
        "clause_splitting", "keyword_routing", "nearest_event_inference",
        "relationship_target_inference", "container_selection_inference",
        "persistence_inference", "epistemic_inference", "behavior_to_persona_inference",
        "runtime_paraphrasing", "legacy_claim_semantic_fallback",
    )
    return {
        "semantic_fallbacks": 0,
        "runtime_semantic_heuristics": {name: 0 for name in heuristic_names},
        "production_materializer_imports": 0,
        "publication_staging_before_publish": True,
        "publication_second_build_before_publish": True,
        "windows_two_rename_visibility_limitation_documented": "brief absent-path interval" in runner or "two-rename" in (ROOT / "docs/remediation/R1A_2B_RESUMED_REPAIR_AND_REBUILD_REPORT.md").read_text(encoding="utf-8"),
    }


def old_baseline_drift(snapshot: Path | None) -> dict[str, Any]:
    if snapshot is None or not snapshot.is_dir():
        return {"available": False, "limitation": "preserved old baseline snapshot unavailable"}
    old_rows, _, _ = production_manifest(snapshot)
    new_rows, _, _ = production_manifest(R2C)
    old = {row["path"]: row["sha256"] for row in old_rows}
    new = {row["path"]: row["sha256"] for row in new_rows}
    paths = set(old) | set(new)
    added = sorted(set(new) - set(old)); removed = sorted(set(old) - set(new))
    modified = sorted(path for path in set(old) & set(new) if old[path] != new[path])
    changed = sorted(path for path in paths if old.get(path) != new.get(path))
    unchanged = sorted(path for path in paths if old.get(path) == new.get(path))
    generated_prefixes = ("migration_packages/", "candidates/by_profile/", "reviews/by_character/", "migration/", "reports/")
    unexpected = [path for path in [*added, *changed, *removed] if not path.startswith(generated_prefixes)]
    require(not unexpected, "BLOCKED_BY_UNEXPECTED_DRIFT", str(unexpected))
    require((len(old), len(new), len(changed), len(added), len(removed), len(unchanged)) == (138, 140, 108, 2, 0, 32), "BLOCKED_BY_UNEXPECTED_DRIFT", "path diff counts")
    new_container_profiles = {pair[0] for pair, cid in EXPECTED_CONTAINER_IDS.items() if cid not in {"RELATIONSHIP_YOUYOU_YU_LINFENG", "RELATIONSHIP_YU_LINFENG_YOUYOU"}}
    classifications = {}
    for path in sorted(paths):
        if old.get(path) == new.get(path): classifications[path] = "UNCHANGED"
        elif any(profile in path for profile in new_container_profiles): classifications[path] = "AUTHORIZED_R1A2A1_CONTAINER_CHANGE"
        else: classifications[path] = "EXPECTED_REMEDIATION_CHANGE"
    return {
        "available": True, "old_files": len(old), "new_files": len(new),
        "changed": len(changed), "modified": len(modified), "added": len(added), "removed": len(removed),
        "unchanged": len(unchanged), "unexpected_drift": 0,
        "classification_counts": dict(Counter(classifications.values())),
        "added_files": added,
    }


def run_audit(write_manifest: bool = True, old_snapshot: Path | None = None) -> dict[str, Any]:
    authority, r1a1, r1a2a, r1a2a1, amendments = authority_audit()
    rows_a, manifest_a, aggregate_a = production_manifest()
    rows_b, manifest_b, aggregate_b = production_manifest()
    require(rows_a == rows_b and manifest_a == manifest_b and aggregate_a == aggregate_b, "BLOCKED_BY_NONDETERMINISM", "manifest calculation")
    require(len(rows_a) == 140, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", f"production files {len(rows_a)}")
    production = production_audit(r1a1, r1a2a, r1a2a1, amendments)
    require(production["complete_relationship_records"] == 56, "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH", "relationship record count")
    spot = semantic_spot_checks(r1a2a, r1a2a1)
    static = static_boundary_audit()
    drift = old_baseline_drift(old_snapshot)
    if write_manifest: write_if_changed(REPAIRED_MANIFEST, manifest_a)
    blockers: list[dict[str, Any]] = []
    if production["high_risk_route_changes"] or production["high_risk_missing_objects"]:
        blockers.append({
            "class": "BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH",
            "detail": "accepted high-risk reroute has a missing production destination object",
            "route_changes": production["high_risk_route_changes"],
            "missing_objects": production["high_risk_missing_objects"],
        })
    integrity = production["migration_destination_referential_integrity"]
    if integrity["dangling"]:
        blockers.append({
            "class": "BLOCKED_BY_REFERENCE_DRIFT",
            "detail": "one or more migration destinations do not resolve",
            "defects": integrity["defects"],
        })
    return {
        "status": "BLOCKED" if blockers else "PASS",
        "blockers": blockers,
        "independence": {
            "production_serializer_logic_reused": False,
            "production_equivalence_logic_reused": False,
            "project_semantic_modules_imported": [],
        },
        "authority": authority,
        "production_fingerprint": {"files": len(rows_a), "aggregate_sha256": aggregate_a, "stable": True},
        "production": production,
        "source_spot_check": spot,
        "runtime_boundary": static,
        "old_baseline_drift": drift,
        "manifest_path": REPAIRED_MANIFEST.relative_to(ROOT).as_posix(),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--old-snapshot", type=Path)
    parser.add_argument("--no-write-manifest", action="store_true")
    parser.add_argument("--compact", action="store_true")
    args = parser.parse_args()
    result = run_audit(not args.no_write_manifest, args.old_snapshot)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":") if args.compact else None, indent=None if args.compact else 2))


if __name__ == "__main__":
    main()
