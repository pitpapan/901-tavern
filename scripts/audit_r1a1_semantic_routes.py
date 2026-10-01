#!/usr/bin/env python3
"""Build the R1A-1 semantic adjudication ledger without mutating R2C artifacts."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any, Iterable

try:
    from scripts.phase3d_r2c_common import atomic_write_text, load_json, load_jsonl, render_jsonl
except ModuleNotFoundError:  # pragma: no cover - direct script execution
    from phase3d_r2c_common import atomic_write_text, load_json, load_jsonl, render_jsonl


ROOT = Path(__file__).resolve().parents[1]
R2C_PACKAGE_ROOT = ROOT / "work" / "phase3d_r2c" / "migration_packages"
R2A_CHRONOLOGY = ROOT / "work" / "phase3d_r2" / "chronology" / "campaign_chronology.jsonl"
DEFAULT_DECISIONS = ROOT / "work" / "remediation" / "r1a1" / "semantic_adjudication_decisions.jsonl"
DEFAULT_OUTPUT = ROOT / "work" / "remediation" / "r1a1" / "semantic_adjudication_ledger.jsonl"

IDENTITY_COHORT = "IDENTITY_ESTABLISHED_HISTORY"
RELATIONSHIP_COHORT = "RELATIONSHIP_ESTABLISHED_HISTORY"
ALLOWED_CATEGORIES = {
    "BACKGROUND_VALID",
    "CAMPAIGN_EVENT",
    "RELATIONSHIP_EVENT",
    "PERSISTENT_STATE",
    "SPLIT_EVENT_AND_STATE",
    "UNRESOLVED",
}
DECISION_FIELDS = {
    "profile_id",
    "old_claim_id",
    "adjudication_category",
    "intended_semantic_route",
    "relevant_r2a_event_refs",
    "concise_evidence_basis",
    "split_required",
}

# The hand-reviewed decision surface uses compact semantic labels so the audit
# remains readable.  R1A-2, however, must consume routes that name existing R2C
# sections rather than introducing a parallel vocabulary.  Keep this projection
# explicit and deterministic; claim-specific refinements below are semantic
# decisions, not guesses made by the future package builder.
ROUTE_ALIASES = {
    "ABILITY_STATUS_STATE": ("ability_status_transitions",),
    "ATTRIBUTED_PROFILE_STATE": ("identity.public_identity",),
    "CAMPAIGN_TIMELINE": ("campaign_timeline",),
    "DURABLE_IDENTITY_STATE": ("identity.durable_roles",),
    "DURABLE_RELATIONSHIP_STATE": ("relationships[].relationship_baseline",),
    "KNOWLEDGE_STATE": ("knowledge_timeline",),
    "KNOWLEDGE_TIMELINE": ("knowledge_timeline",),
    "PROFILE_BACKGROUND": ("biographical_background",),
    "RELATIONSHIP_TIMELINE": ("relationships[].relationship_milestones",),
    "SPECIAL_INTERLUDE_BACKGROUND": ("biographical_background",),
    "SPECIAL_INTERLUDE_TIMELINE": ("campaign_timeline",),
    "TRANSITION_TIMELINE": ("campaign_timeline",),
}

CLAIM_ROUTE_REFINEMENTS = {
    ("NPC_AINZ_OOAL_GOWN", "CLAIM_AINZ_NAZARICK_ROLE"): ("identity.durable_roles", "persona.values"),
    ("NPC_ELLIE", "CLAIM_ELLIE_REFERENCE_TRAITS"): ("identity.durable_roles", "persona.core_personality"),
    ("NPC_HAKU", "CLAIM_HAKU_OSHUTORU_SERVICE"): (
        "biographical_background",
        "identity.durable_roles",
        "campaign_timeline",
    ),
    ("NPC_KENDA_KAI_FERGUS", "CLAIM_KENDA_KAI_FERGUS_HISTORY_1"): ("identity.durable_roles", "knowledge_timeline"),
    ("NPC_KENDA_KAI_FERGUS", "CLAIM_KENDA_PUBLIC_ALLIANCE_ROLE"): ("identity.durable_roles",),
    ("NPC_KUON", "CLAIM_KUON_APOTHECARY_STAGE"): ("identity.durable_roles", "campaign_timeline"),
    ("NPC_LEI_GUANG", "CLAIM_LEI_GUANG_ADMINISTRATION"): ("identity.durable_roles",),
    ("NPC_MU_SHAOAI", "CLAIM_MU_SHAOAI_ATTRIBUTED_REPUTATION"): ("identity.public_identity",),
    ("NPC_OSHIRA", "CLAIM_OSHIRA_CLAN_DEPENDENCY"): ("identity.durable_affiliations", "knowledge_timeline"),
    ("NPC_OSHUTORU", "CLAIM_OSHUTORU_HISTORY_1"): ("identity.durable_roles",),
    ("NPC_OSHUTORU", "CLAIM_OSHUTORU_HISTORY_2"): ("campaign_timeline", "identity.public_identity"),
    ("NPC_WILLIAM", "CLAIM_WILLIAM_FULL_NAME"): ("campaign_timeline", "identity.public_identity"),
    ("NPC_WURAI", "CLAIM_WURAI_HISTORY_1"): ("campaign_timeline", "identity.durable_roles"),
    ("NPC_WURAI", "CLAIM_WURAI_FIRE_MASK"): ("identity.public_identity", "ability_status_transitions"),
    ("NPC_XIERLUN_VON_GILCODE", "CLAIM_XIERLUN_DRAGON_BALANCE_ROLE"): ("identity.durable_roles",),
}


def _safe_token(value: str) -> str:
    token = re.sub(r"[^A-Z0-9]+", "_", value.upper()).strip("_")
    return token or "ITEM"


def _walk_items(value: Any) -> Iterable[dict[str, Any]]:
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from _walk_items(child)
    elif isinstance(value, list):
        for child in value:
            yield from _walk_items(child)


def _claim_index(profile: dict[str, Any]) -> dict[str, dict[str, Any]]:
    claims: dict[str, dict[str, Any]] = {}
    for item in _walk_items(profile):
        claim_id = item.get("claim_id")
        if isinstance(claim_id, str):
            if claim_id in claims:
                raise ValueError(f"{profile['id']}: duplicate claim_id {claim_id}")
            claims[claim_id] = item
    return claims


def _relationship_background_id(old_claim_id: str) -> str:
    suffix = _safe_token(old_claim_id.removeprefix("CLAIM_"))
    return f"BACKGROUND_REL_{suffix}"


def _cohort_for(migration: dict[str, Any]) -> str | None:
    source_section = migration["source_section"]
    if (
        source_section.startswith("identity.established_history")
        and migration["migration_status"] == "MOVED_TO_BACKGROUND"
    ):
        return IDENTITY_COHORT
    if source_section.startswith("relationships") and ".established_history" in source_section:
        return RELATIONSHIP_COHORT
    return None


def collect_exposure(root: Path = ROOT) -> list[dict[str, Any]]:
    """Return the accepted R1A-0 defect population: 116 identity + 29 relationship records."""
    package_root = root / R2C_PACKAGE_ROOT.relative_to(ROOT)
    package_paths = sorted(package_root.glob("*.json"))
    repaired = any(
        "R1A-2A reviewed realization authority" in migration.get("reason", "")
        for package_path in package_paths
        for migration in load_json(package_path).get("old_claim_migrations", [])
    )
    if repaired:
        accepted_path = root / DEFAULT_OUTPUT.relative_to(ROOT)
        if not accepted_path.is_file():
            raise ValueError("repaired R2C requires the accepted R1A-1 historical exposure ledger")
        fields = (
            "profile_id",
            "old_claim_id",
            "legacy_source_section",
            "cohort",
            "current_r2c_migration",
            "current_generated_targets",
            "source_refs",
        )
        records = [
            {field: item[field] for field in fields}
            for item in load_jsonl(accepted_path)
        ]
        records.sort(
            key=lambda item: (
                item["profile_id"], item["cohort"],
                item["legacy_source_section"], item["old_claim_id"],
            )
        )
        return records
    records: list[dict[str, Any]] = []
    for package_path in package_paths:
        package = load_json(package_path)
        source_profile = package.get("source_profile_candidate")
        if not source_profile:
            continue
        profile = load_json(root / source_profile)
        claims = _claim_index(profile)
        background_ids = {item["background_id"] for item in package["background_items"]}
        for migration in package["old_claim_migrations"]:
            cohort = _cohort_for(migration)
            if cohort is None:
                continue
            claim_id = migration["old_claim_id"]
            claim = claims.get(claim_id)
            if claim is None:
                raise ValueError(f"{package['profile_id']}: missing source claim {claim_id}")
            targets = list(migration.get("destination_ids", []))
            if cohort == RELATIONSHIP_COHORT:
                background_id = _relationship_background_id(claim_id)
                if background_id not in background_ids:
                    raise ValueError(f"{package['profile_id']}: missing generated {background_id}")
                targets.append(background_id)
            records.append(
                {
                    "profile_id": package["profile_id"],
                    "old_claim_id": claim_id,
                    "legacy_source_section": migration["source_section"],
                    "cohort": cohort,
                    "current_r2c_migration": migration["migration_status"],
                    "current_generated_targets": sorted(set(targets)),
                    "source_refs": list(claim.get("sources") or claim.get("source_refs") or []),
                }
            )
    records.sort(
        key=lambda item: (
            item["profile_id"],
            item["cohort"],
            item["legacy_source_section"],
            item["old_claim_id"],
        )
    )
    return records


def load_decisions(path: Path = DEFAULT_DECISIONS) -> dict[tuple[str, str], dict[str, Any]]:
    decisions: dict[tuple[str, str], dict[str, Any]] = {}
    for line_number, record in enumerate(load_jsonl(path), 1):
        unknown = set(record) - DECISION_FIELDS
        missing = DECISION_FIELDS - set(record)
        if unknown or missing:
            raise ValueError(
                f"{path}:{line_number}: decision fields mismatch; missing={sorted(missing)}, "
                f"unknown={sorted(unknown)}"
            )
        key = (record["profile_id"], record["old_claim_id"])
        if key in decisions:
            raise ValueError(f"{path}:{line_number}: duplicate decision {key}")
        if record["adjudication_category"] not in ALLOWED_CATEGORIES:
            raise ValueError(f"{path}:{line_number}: unknown adjudication category")
        if not isinstance(record["intended_semantic_route"], list) or not record["intended_semantic_route"]:
            raise ValueError(f"{path}:{line_number}: intended_semantic_route must be non-empty")
        if not isinstance(record["relevant_r2a_event_refs"], list):
            raise ValueError(f"{path}:{line_number}: relevant_r2a_event_refs must be a list")
        if not isinstance(record["concise_evidence_basis"], str) or not record["concise_evidence_basis"].strip():
            raise ValueError(f"{path}:{line_number}: concise_evidence_basis must be non-empty")
        if not isinstance(record["split_required"], bool):
            raise ValueError(f"{path}:{line_number}: split_required must be boolean")
        decisions[key] = record
    return decisions


def _schema_routes(decision: dict[str, Any]) -> list[str]:
    refined = CLAIM_ROUTE_REFINEMENTS.get((decision["profile_id"], decision["old_claim_id"]))
    if refined is not None:
        return list(refined)
    routes: list[str] = []
    for route in decision["intended_semantic_route"]:
        if route not in ROUTE_ALIASES:
            raise ValueError(f"{decision['old_claim_id']}: unknown semantic route {route}")
        for schema_route in ROUTE_ALIASES[route]:
            if schema_route not in routes:
                routes.append(schema_route)
    return routes


def build_ledger(root: Path = ROOT, decisions_path: Path = DEFAULT_DECISIONS) -> list[dict[str, Any]]:
    exposure = collect_exposure(root)
    decisions = load_decisions(decisions_path)
    exposure_keys = {(item["profile_id"], item["old_claim_id"]) for item in exposure}
    decision_keys = set(decisions)
    if exposure_keys != decision_keys:
        missing = sorted(exposure_keys - decision_keys)
        extra = sorted(decision_keys - exposure_keys)
        raise ValueError(f"decision coverage mismatch; missing={missing}, extra={extra}")

    events = {
        event["event_id"]: event
        for event in load_jsonl(root / R2A_CHRONOLOGY.relative_to(ROOT))
    }
    event_order = {event_id: index for index, event_id in enumerate(events)}
    ledger: list[dict[str, Any]] = []
    for exposed in exposure:
        key = (exposed["profile_id"], exposed["old_claim_id"])
        decision = decisions[key]
        event_refs = decision["relevant_r2a_event_refs"]
        unknown_events = [event_ref for event_ref in event_refs if event_ref not in events]
        if unknown_events:
            raise ValueError(f"{key}: unknown R2A event refs {unknown_events}")
        if len(event_refs) != len(set(event_refs)):
            raise ValueError(f"{key}: duplicate R2A event refs")
        ordered_event_refs = sorted(event_refs, key=event_order.__getitem__)
        anchors = []
        for event_ref in ordered_event_refs:
            event = events[event_ref]
            anchors.append(
                {
                    "event_ref": event_ref,
                    "story_order_start": event["story_axis"]["story_order_start"],
                    "story_order_end": event["story_axis"].get("story_order_end"),
                    "canon_layer": event["canon_layer"],
                }
            )
        ledger.append(
            {
                **exposed,
                "relevant_r2a_event_refs": ordered_event_refs,
                "story_order_anchors": anchors,
                "adjudication_category": decision["adjudication_category"],
                "intended_semantic_route": _schema_routes(decision),
                "concise_evidence_basis": decision["concise_evidence_basis"].strip(),
                "split_required": decision["split_required"],
                # AGENTS.md requires every automatic result to remain provisional.
                "human_semantic_review_required": True,
            }
        )
    return ledger


def render_ledger(records: list[dict[str, Any]]) -> str:
    return render_jsonl(records)


def summarize(records: list[dict[str, Any]]) -> dict[str, Any]:
    categories = Counter(record["adjudication_category"] for record in records)
    return {
        "records_total": len(records),
        "identity_records": sum(record["cohort"] == IDENTITY_COHORT for record in records),
        "relationship_records": sum(record["cohort"] == RELATIONSHIP_COHORT for record in records),
        "profiles_total": len({record["profile_id"] for record in records}),
        "adjudication": {
            category.lower(): categories[category]
            for category in sorted(ALLOWED_CATEGORIES)
        },
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
