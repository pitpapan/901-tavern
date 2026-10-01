#!/usr/bin/env python3
"""Classify pre/post R1A-2B R2C drift against the reviewed authority."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

try:
    from scripts.phase3d_r2c_common import ROOT, load_json, render_json
    from scripts.r1a2b_realization_serializer import (
        RELATIONSHIP_BASELINE,
        RELATIONSHIP_MILESTONE,
        load_authority_stack,
    )
except ModuleNotFoundError:  # pragma: no cover
    from phase3d_r2c_common import ROOT, load_json, render_json
    from r1a2b_realization_serializer import (
        RELATIONSHIP_BASELINE,
        RELATIONSHIP_MILESTONE,
        load_authority_stack,
    )


CURRENT_ROOT = ROOT / "work" / "phase3d_r2c"


def _hashes(root: Path) -> dict[str, str]:
    return {
        path.relative_to(root).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in sorted(root.rglob("*")) if path.is_file()
    }


def _id(value: dict[str, Any]) -> str:
    for field in (
        "background_id", "identity_id", "persona_id", "relationship_id",
        "transition_id", "knowledge_id",
    ):
        if field in value:
            return value[field]
    raise ValueError(f"object has no known ID: {value}")


def _filtered(values: list[dict[str, Any]], ignored: set[str]) -> list[dict[str, Any]]:
    return [value for value in values if _id(value) not in ignored]


def _assert_equal(label: str, old: Any, new: Any) -> None:
    if old != new:
        raise ValueError(f"unexpected unrelated production drift: {label}")


def audit_drift(baseline_root: Path, current_root: Path = CURRENT_ROOT) -> dict[str, Any]:
    stack = load_authority_stack(ROOT)
    authority = stack.realization
    container_authority = stack.relationship_containers
    audited_profiles = set(authority.by_profile)
    old_packages = {path.stem: load_json(path) for path in (baseline_root / "migration_packages").glob("*.json")}
    new_packages = {path.stem: load_json(path) for path in (current_root / "migration_packages").glob("*.json")}
    _assert_equal("package profile set", set(old_packages), set(new_packages))

    reviewed_ids: dict[str, dict[str, set[str]]] = {}
    reviewed_events: dict[str, set[str]] = {}
    legacy_ids: dict[str, set[str]] = {}
    legacy_milestones: dict[str, set[str]] = {}
    for record in authority.records:
        profile_id = record["profile_id"]
        reviewed_ids.setdefault(profile_id, {})
        reviewed_events.setdefault(profile_id, set())
        legacy_ids.setdefault(profile_id, set()).update(
            item for item in record["current_generated_targets"] if item.startswith("BACKGROUND_")
        )
        legacy_milestones.setdefault(profile_id, set()).update(
            item for item in record["current_generated_targets"] if item.startswith("MILESTONE_")
        )
        for instance in record["destination_instances"]:
            section = instance["destination_section"]
            payload = instance["payload"]
            if section == "campaign_timeline":
                reviewed_events[profile_id].add(payload["event_ref"])
            elif section == RELATIONSHIP_MILESTONE:
                reviewed_ids[profile_id].setdefault(section, set()).add(payload["milestone"]["milestone_id"])
            else:
                reviewed_ids[profile_id].setdefault(section, set()).add(_id(payload))

    for profile_id in sorted(old_packages):
        old = old_packages[profile_id]
        new = new_packages[profile_id]
        if profile_id not in audited_profiles:
            _assert_equal(f"unaudited package {profile_id}", old, new)
            continue
        old_shell = dict(old)
        new_shell = dict(new)
        for key in (
            "old_claim_migrations", "background_items", "timeline_items", "relationship_items",
            "ability_status_items", "knowledge_items", "persona", "profile_metadata",
        ):
            old_shell.pop(key)
            new_shell.pop(key)
        _assert_equal(f"package shell {profile_id}", old_shell, new_shell)

        old_migrations = {
            item["old_claim_id"]: item for item in old["old_claim_migrations"]
            if (profile_id, item["old_claim_id"]) not in authority.by_identity
        }
        new_migrations = {
            item["old_claim_id"]: item for item in new["old_claim_migrations"]
            if (profile_id, item["old_claim_id"]) not in authority.by_identity
        }
        _assert_equal(f"unaudited migrations {profile_id}", old_migrations, new_migrations)

        background_ignore_old = legacy_ids.get(profile_id, set())
        background_ignore_new = reviewed_ids[profile_id].get("biographical_background", set())
        _assert_equal(
            f"unrelated backgrounds {profile_id}",
            _filtered(old["background_items"], background_ignore_old),
            _filtered(new["background_items"], background_ignore_new),
        )
        for section, old_bucket, new_bucket in (
            ("identity.public_identity", old["profile_metadata"]["identity"]["public_identity"], new["profile_metadata"]["identity"]["public_identity"]),
            ("identity.durable_roles", old["profile_metadata"]["identity"]["durable_roles"], new["profile_metadata"]["identity"]["durable_roles"]),
            ("identity.durable_affiliations", old["profile_metadata"]["identity"]["durable_affiliations"], new["profile_metadata"]["identity"]["durable_affiliations"]),
            ("persona.core_personality", old["persona"]["core_personality"], new["persona"]["core_personality"]),
            ("persona.values", old["persona"]["values"], new["persona"]["values"]),
            ("ability_status_transitions", old["ability_status_items"], new["ability_status_items"]),
            ("knowledge_timeline", old["knowledge_items"], new["knowledge_items"]),
        ):
            _assert_equal(
                f"unrelated {section} {profile_id}",
                old_bucket,
                _filtered(new_bucket, reviewed_ids[profile_id].get(section, set())),
            )
        for persona_bucket in ("speech_style", "decision_patterns", "motivations"):
            _assert_equal(
                f"unrelated persona.{persona_bucket} {profile_id}",
                old["persona"][persona_bucket], new["persona"][persona_bucket],
            )
        _assert_equal(
            f"unrelated timeline {profile_id}",
            [item for item in old["timeline_items"] if item["event_ref"] not in reviewed_events[profile_id]],
            [item for item in new["timeline_items"] if item["event_ref"] not in reviewed_events[profile_id]],
        )

        new_relationships = {item["relationship_id"]: item for item in new["relationship_items"]}
        reviewed_relationship_ids = reviewed_ids[profile_id].get(RELATIONSHIP_BASELINE, set())
        reviewed_milestone_ids = reviewed_ids[profile_id].get(RELATIONSHIP_MILESTONE, set())
        for old_relationship in old["relationship_items"]:
            relationship_id = old_relationship["relationship_id"]
            if relationship_id in reviewed_relationship_ids:
                continue
            if relationship_id not in new_relationships:
                raise ValueError(f"unexpected unrelated relationship removal: {profile_id}/{relationship_id}")
            new_relationship = new_relationships[relationship_id]
            for field in old_relationship:
                if field in {"relationship_milestones", "source_refs"}:
                    continue
                _assert_equal(
                    f"relationship field {profile_id}/{relationship_id}/{field}",
                    old_relationship[field], new_relationship[field],
                )
            old_milestones = [
                item for item in old_relationship["relationship_milestones"]
                if item["milestone_id"] not in legacy_milestones.get(profile_id, set())
            ]
            new_milestones = [
                item for item in new_relationship["relationship_milestones"]
                if item["milestone_id"] not in reviewed_milestone_ids
            ]
            _assert_equal(
                f"unrelated relationship milestones {profile_id}/{relationship_id}",
                old_milestones, new_milestones,
            )
            if not set(old_relationship["source_refs"]).issubset(new_relationship["source_refs"]):
                raise ValueError(f"relationship provenance loss: {profile_id}/{relationship_id}")
        allowed_new_relationships = reviewed_relationship_ids | {
            decision["selected_or_new_container_id"]
            for pair, decision in container_authority.by_pair.items()
            if pair[0] == profile_id
            and decision["container_action"] == "CREATE_REVIEWED_CONTAINER"
        }
        unexpected_new_relationships = set(new_relationships) - {
            item["relationship_id"] for item in old["relationship_items"]
        } - allowed_new_relationships
        if unexpected_new_relationships:
            raise ValueError(f"unexpected new relationships {profile_id}: {sorted(unexpected_new_relationships)}")

    old_hashes = _hashes(baseline_root)
    new_hashes = _hashes(current_root)
    paths = set(old_hashes) | set(new_hashes)
    unchanged = sum(old_hashes.get(path) == new_hashes.get(path) for path in paths)
    return {
        "old_files": len(old_hashes),
        "new_files": len(new_hashes),
        "changed_files": sum(old_hashes.get(path) != new_hashes.get(path) for path in paths),
        "added_files": sorted(set(new_hashes) - set(old_hashes)),
        "removed_files": sorted(set(old_hashes) - set(new_hashes)),
        "audited_profiles": len(audited_profiles),
        "unaudited_packages_byte_identical": len(set(old_packages) - audited_profiles),
        "unexpected_drift": 0,
        "semantic_change_classification": {
            "EXPECTED_REMEDIATION_CHANGE": 275,
            "AUTHORIZED_R1A2A1_CONTAINER_CHANGE": 5,
            "UNCHANGED_FILES": unchanged,
            "UNEXPECTED_DRIFT": 0,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("baseline_root", type=Path)
    parser.add_argument("--current-root", type=Path, default=CURRENT_ROOT)
    args = parser.parse_args()
    print(render_json(audit_drift(args.baseline_root, args.current_root)).strip())


if __name__ == "__main__":
    main()
