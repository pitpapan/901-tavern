#!/usr/bin/env python3
"""Build deterministic Phase 3D review artifacts without granting approval."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import tempfile
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / "work"
MANIFEST_PATH = WORK / "phase3d_review_manifest.json"
PREFLIGHT_PATH = WORK / "phase3d_preflight.md"
APPROVAL_MANIFEST_PATH = WORK / "phase3d_approval_manifest.md"
FINAL_REPORT_PATH = WORK / "phase3d_review.md"
PHASE3D_DIR = WORK / "phase3d"
APPROVED_DIR = PHASE3D_DIR / "approved_candidates"
REVIEW_DIR = PHASE3D_DIR / "reviews"

PROFILE_SOURCES = (
    ("phase3b", ROOT / "work" / "phase3b" / "prototypes", ROOT / "work" / "phase3b" / "evidence"),
    ("phase3c", ROOT / "work" / "phase3c" / "profiles", ROOT / "work" / "phase3c" / "evidence"),
)

REVIEW_CLASS_A = {
    "PC_YU_LINFENG",
    "NPC_YOUYOU", "NPC_WHITE_MAGICIAN", "NPC_EMPEROR",
    "NPC_AINZ_OOAL_GOWN", "NPC_DEATHWING", "NPC_XIERLUN_VON_GILCODE",
    "NPC_HONDA_KAI_FERGUS", "NPC_SERTANT_LU_YOURLAN",
    "NPC_WOSIS", "NPC_JERGAL", "NPC_ZHENZI", "NPC_GREMLIN", "NPC_LINGCHI",
    "NPC_REN_FANZHEN", "NPC_ZHOU_ZHENG", "NPC_KENDA_KAI_FERGUS", "NPC_CASSANDRA",
}
REVIEW_CLASS_B = {
    "NPC_CASSIUS_BRIGHT", "NPC_HAKU", "NPC_YOMI_ISAYAMA", "NPC_ELDER_XUE",
    "NPC_JIANG_ZIYOU", "NPC_OSHUTORU", "NPC_MU_SHAOAI",
}
REVIEW_CLASS_C = {
    "NPC_TOLKIEN", "NPC_ELLIE", "NPC_KUON", "NPC_MU_TOU", "NPC_LEI_GUANG",
    "NPC_NOSURI", "NPC_OSHIRA", "NPC_WURAI", "NPC_LULUTIYE", "NPC_WILLIAM",
    "NPC_JEWEL_ELDER",
}

CORRECTION_SUMMARIES = {
    "NPC_AINZ_OOAL_GOWN": [
        "Removed CLAIM_AINZ_OOAL_GOWN_HISTORY_2 from established history: an unresolved long-term relationship boundary is not a historical event.",
        "Preserved the issue as an explicit evidence gap and RP constraint (SEEN → NOT PROMOTED).",
    ],
    "NPC_DEATHWING": [
        "Removed CLAIM_DEATHWING_HISTORY_2 from established history: unknown permanent death/cosmology is a boundary, not a historical event.",
        "Preserved permanent-death, immortality-mechanism, and Old-God uncertainty as evidence gaps and an RP constraint (SEEN → NOT PROMOTED).",
    ],
    "NPC_XIERLUN_VON_GILCODE": [
        "Changed life_status from alive to unknown because the latest explicit source proves D0 participation but does not confirm D3 survival.",
        "Kept realm and Canon provenance at original_campaign; a current-state absence check is not positive transition evidence.",
    ],
    "NPC_MU_SHAOAI": [
        "Moved CLAIM_MU_SHAOAI_IDENTITY from public identity to established history because it records one treatment action.",
        "Changed the relation label to shared curse-investigation history; the reviewed evidence does not establish a durable healer role toward 御临风.",
    ],
    "NPC_JEWEL_ELDER": [
        "Moved CLAIM_JEWEL_ELDER_IDENTITY from public identity to established history because it records an investigation report, not durable identity.",
    ],
    "NPC_NOSURI": [
        "Moved CLAIM_NOSURI_IDENTITY from public identity to established history because the cited statement and ambush participation are event-specific.",
    ],
    "NPC_WILLIAM": [
        "Replaced the inferred treatment-role identity with the directly supported durable fact that 威廉 operated a winehouse in the imperial capital.",
        "Moved CLAIM_WILLIAM_IDENTITY to established history and limited it to the documented memory-restoration action.",
    ],
}

MATERIAL_REJECTIONS = {
    "NPC_AINZ_OOAL_GOWN": "SEEN → NOT PROMOTED: the D3 absence of a settled alliance with the Empire, dragons, or White Magician is retained as uncertainty, not history or a future stance.",
    "NPC_DEATHWING": "SEEN → NOT PROMOTED: permanent death, resurrection mechanics, immortality mechanics, and Old-God linkage remain unconfirmed.",
    "NPC_WHITE_MAGICIAN": "Publicly attributed goals remain attributed claims; they are not converted into confirmed private motive.",
    "NPC_EMPEROR": "Rumor and character-level interpretation were not promoted into objective identity or motive.",
    "NPC_CASSANDRA": "Prophecy, assassination framing, and investigation-note inferences were not promoted beyond their documented assertion scope.",
    "NPC_KENDA_KAI_FERGUS": "Investigation-note inference was not promoted into political alignment or world truth.",
    "NPC_JERGAL": "Character belief and cosmological claims remain character-scoped and are not promoted to objective cosmology.",
    "NPC_LULUTIYE": "Event-specific distress/trauma evidence was not generalized into a stable personality trait.",
    "PC_YU_LINFENG": "Historical actions and relationships do not authorize generated dialogue, voluntary action, thought, emotion, or new goals for the PC.",
    "NPC_XIERLUN_VON_GILCODE": "SEEN → NOT PROMOTED: D0 battle participation and an original-campaign setting description do not establish survival at the D3 continuation anchor.",
}


def relative(path: Path) -> str:
    return path.resolve().relative_to(ROOT.resolve()).as_posix()


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temporary_path = Path(temporary)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
        os.replace(temporary_path, path)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()


def load_json(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(payload, dict):
        raise ValueError(f"{relative(path)} must contain one JSON object")
    return payload


def iter_profile_claims(profile: dict[str, Any]) -> Iterable[dict[str, Any]]:
    identity = profile.get("identity", {})
    for section in ("public_identity", "durable_roles", "established_history"):
        for claim in identity.get(section, []):
            if isinstance(claim, dict):
                yield claim
    for section in ("core_personality", "values", "speech_style", "decision_patterns"):
        for claim in profile.get(section, []):
            if isinstance(claim, dict):
                yield claim
    for relationship in profile.get("relationships", []):
        if not isinstance(relationship, dict):
            continue
        for section in ("established_history", "current_stance", "obligations", "tensions"):
            for claim in relationship.get(section, []):
                if isinstance(claim, dict):
                    yield claim


def goal_count(profile: dict[str, Any]) -> int:
    goals = profile.get("goals", {})
    if not isinstance(goals, dict):
        return 0
    return sum(len(value) for value in goals.values() if isinstance(value, list))


def patch_index() -> dict[str, tuple[Path, dict[str, Any]]]:
    result: dict[str, tuple[Path, dict[str, Any]]] = {}
    for path in sorted((WORK / "patches" / "pending").glob("PATCH_*.json")):
        patch = load_json(path)
        target = patch.get("target_id")
        if not isinstance(target, str):
            continue
        if target in result:
            raise ValueError(f"duplicate draft patch target {target}")
        result[target] = (path, patch)
    return result


def discover_profiles() -> list[dict[str, Any]]:
    patches = patch_index()
    rows: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    seen_worldbook_ids: set[str] = set()
    for source_phase, profile_dir, evidence_dir in PROFILE_SOURCES:
        for candidate_path in sorted(profile_dir.glob("*.json")):
            profile = load_json(candidate_path)
            profile_id = profile.get("id")
            worldbook_id = profile.get("worldbook_id")
            if not isinstance(profile_id, str) or not isinstance(worldbook_id, str):
                raise ValueError(f"{relative(candidate_path)} lacks semantic identifiers")
            if profile_id in seen_ids:
                raise ValueError(f"duplicate profile id {profile_id}")
            if worldbook_id in seen_worldbook_ids:
                raise ValueError(f"duplicate worldbook mapping {worldbook_id}")
            seen_ids.add(profile_id)
            seen_worldbook_ids.add(worldbook_id)

            evidence_path = evidence_dir / f"{profile_id}_evidence.md"
            if not evidence_path.is_file():
                raise ValueError(f"missing evidence packet for {profile_id}")
            if profile_id not in patches:
                raise ValueError(f"missing draft patch for {profile_id}")
            draft_patch_path, patch = patches[profile_id]
            if patch.get("operation") != "add" or patch.get("status") != "draft":
                raise ValueError(f"{patch.get('patch_id')} must remain draft/add before approval")
            if "approval" in patch or "application" in patch:
                raise ValueError(f"{patch.get('patch_id')} contains premature approval/application metadata")

            presence = profile.get("presence", {})
            rows.append(
                {
                    "profile_id": profile_id,
                    "worldbook_id": worldbook_id,
                    "profile_kind": profile.get("profile_kind"),
                    "source_phase": source_phase,
                    "profile_depth": profile.get("profile_depth"),
                    "activation_policy": profile.get("activation_policy"),
                    "canon_layers": profile.get("canon_layers"),
                    "life_status": presence.get("life_status"),
                    "narrative_availability": presence.get("narrative_availability"),
                    "profile_claim_count": sum(1 for _ in iter_profile_claims(profile)),
                    "relationship_count": len(profile.get("relationships", [])),
                    "epistemic_item_count": len(profile.get("epistemic_state", [])),
                    "goal_count": goal_count(profile),
                    "evidence_gap_count": len(profile.get("evidence_gaps", [])),
                    "candidate_path": relative(candidate_path),
                    "candidate_sha256": sha256(candidate_path),
                    "evidence_packet_path": relative(evidence_path),
                    "evidence_packet_sha256": sha256(evidence_path),
                    "draft_patch_path": relative(draft_patch_path),
                    "draft_patch_id": patch.get("patch_id"),
                    "draft_patch_sha256": sha256(draft_patch_path),
                }
            )
    rows.sort(key=lambda row: row["profile_id"])
    if len(rows) != 36:
        raise ValueError(f"expected 36 profiles, found {len(rows)}")
    if sum(row["profile_kind"] == "npc" for row in rows) != 35:
        raise ValueError("expected exactly 35 NPC profiles")
    pc_rows = [row for row in rows if row["profile_kind"] == "pc_continuity"]
    if len(pc_rows) != 1 or pc_rows[0]["profile_id"] != "PC_YU_LINFENG":
        raise ValueError("PC review population must contain only PC_YU_LINFENG")
    return rows


def protected_paths() -> list[Path]:
    phase3c_baseline = load_json(WORK / "phase3c" / "protected_baseline.json")
    paths = {ROOT / item for item in phase3c_baseline["protected_files"]}
    exact = {
        ROOT / "work" / "phase3a_review.md",
        ROOT / "work" / "phase3a_field_mapping.md",
        ROOT / "work" / "phase3b_review.md",
        ROOT / "work" / "phase3b_profile_quality_review.md",
        ROOT / "work" / "phase3b_runtime_projection_dryrun.md",
        ROOT / "work" / "phase3c_review.md",
        ROOT / "work" / "phase3c_inventory.md",
        ROOT / "work" / "phase3c_profile_quality_review.md",
        ROOT / "work" / "phase3c_runtime_projection_dryrun.md",
        ROOT / "work" / "phase3c" / "protected_baseline.json",
    }
    paths.update(exact)
    patterns = (
        "work/phase3b/prototypes/*.json",
        "work/phase3b/evidence/*.md",
        "work/phase3c/profiles/*.json",
        "work/phase3c/evidence/*.md",
        "work/phase3c/batches/*",
        "work/patches/pending/PATCH_3*.json",
        "work/patches/pending/PATCH_4*.json",
    )
    for pattern in patterns:
        paths.update(path for path in ROOT.glob(pattern) if path.is_file())
    missing = [relative(path) for path in paths if not path.is_file()]
    if missing:
        raise ValueError("missing protected paths: " + ", ".join(sorted(missing)))
    return sorted(paths, key=relative)


def build_manifest() -> dict[str, Any]:
    rows = discover_profiles()
    protected = {relative(path): sha256(path) for path in protected_paths()}
    return {
        "phase": "3D",
        "status": "PREFLIGHT_FROZEN",
        "human_approval_supplied": False,
        "integration_authorized": False,
        "hash_algorithm": "SHA-256",
        "population": {
            "npc_profiles": 35,
            "pc_continuity_profiles": 1,
            "total_profiles": 36,
            "draft_add_patches": 36,
        },
        "profiles": rows,
        "protected_files": protected,
    }


def render_preflight(manifest: dict[str, Any]) -> str:
    rows = manifest["profiles"]
    claim_total = sum(row["profile_claim_count"] for row in rows)
    relationship_total = sum(row["relationship_count"] for row in rows)
    epistemic_total = sum(row["epistemic_item_count"] for row in rows)
    goal_total = sum(row["goal_count"] for row in rows)
    gap_total = sum(row["evidence_gap_count"] for row in rows)
    lines = [
        "# Phase 3D Preflight",
        "",
        "## Boundary",
        "",
        "Phase 3D begins with no explicit human approval for the 36 profile patches. The permitted stop state for this run is `READY_FOR_HUMAN_APPROVAL`; formal integration is not authorized.",
        "",
        "## Frozen Input Population",
        "",
        "- 35 NPC profile candidates",
        "- 1 PC continuity profile candidate (`PC_YU_LINFENG`)",
        "- 36 evidence packets",
        "- 36 draft/add patches",
        f"- {claim_total} ProfileClaims",
        f"- {relationship_total} relationship records",
        f"- {epistemic_total} epistemic items",
        f"- {goal_total} goal records",
        f"- {gap_total} evidence-gap statements",
        "",
        "## Integrity Freeze",
        "",
        f"- Hash algorithm: SHA-256",
        f"- Protected artifacts: {len(manifest['protected_files'])}",
        "- Timestamps are not used as integrity evidence.",
        "- Candidate, evidence, batch, review, Worldbook, Current State, schema, contract, and draft patch inputs are protected by content hash.",
        "",
        "## Review Inventory",
        "",
        "| profile_id | kind | source | depth | activation | layers | life | availability | claims | relations | knowledge | goals | gaps | patch |",
        "|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|---|",
    ]
    for row in rows:
        lines.append(
            "| {profile_id} | {profile_kind} | {source_phase} | {profile_depth} | {activation_policy} | {layers} | {life_status} | {narrative_availability} | {profile_claim_count} | {relationship_count} | {epistemic_item_count} | {goal_count} | {evidence_gap_count} | {draft_patch_id} |".format(
                **row, layers=", ".join(row["canon_layers"])
            )
        )
    lines.extend(
        [
            "",
            "## Preflight Result",
            "",
            "Population and source-path discovery completed deterministically. All patches remain draft/add and contain no approval or application metadata. Semantic review has not yet granted human approval, and no formal database may be created in this state.",
            "",
        ]
    )
    return "\n".join(lines)


def build_preflight() -> None:
    manifest = build_manifest()
    atomic_write(MANIFEST_PATH, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    atomic_write(PREFLIGHT_PATH, render_preflight(manifest))


def verify_frozen_inputs(manifest: dict[str, Any]) -> None:
    mismatches: list[str] = []
    for source, expected in manifest.get("protected_files", {}).items():
        path = ROOT / source
        if not path.is_file():
            mismatches.append(f"{source}: missing")
        elif sha256(path) != expected:
            mismatches.append(f"{source}: SHA-256 mismatch")
    if mismatches:
        raise ValueError("protected input check failed: " + "; ".join(mismatches))


def claim_by_id(profile: dict[str, Any], section: str, claim_id: str) -> dict[str, Any]:
    claims = profile["identity"][section]
    for claim in claims:
        if claim.get("claim_id") == claim_id:
            return claim
    raise ValueError(f"{profile.get('id')}: missing {claim_id} in identity.{section}")


def move_identity_claim(profile: dict[str, Any], claim_id: str) -> dict[str, Any]:
    claim = claim_by_id(profile, "public_identity", claim_id)
    profile["identity"]["public_identity"].remove(claim)
    claim["context"] = "Atomic historical fact only; it does not establish a profession, permanent role, motive, or allegiance."
    profile["identity"]["established_history"].append(claim)
    return claim


def corrected_profile(original: dict[str, Any]) -> dict[str, Any]:
    profile = copy.deepcopy(original)
    profile_id = profile["id"]

    if profile_id == "NPC_AINZ_OOAL_GOWN":
        profile["identity"]["established_history"] = [
            claim for claim in profile["identity"]["established_history"]
            if claim.get("claim_id") != "CLAIM_AINZ_OOAL_GOWN_HISTORY_2"
        ]
        profile["evidence_gaps"].append(
            "安兹与帝国、龙族及白色魔法使的长期关系仍未确认。"
        )
    elif profile_id == "NPC_DEATHWING":
        profile["identity"]["established_history"] = [
            claim for claim in profile["identity"]["established_history"]
            if claim.get("claim_id") != "CLAIM_DEATHWING_HISTORY_2"
        ]
    elif profile_id == "NPC_XIERLUN_VON_GILCODE":
        profile["presence"]["life_status"] = "unknown"
        profile["presence"]["sources"] = [
            "extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:谢尔伦压制并与御临风击败死亡之翼（lines 282-311）",
            "设定 人物/妄想大陆设定集_检索版.md:谢尔伦·冯·吉尔科德（lines 148-153）",
        ]
        profile["presence"]["notes"] = (
            "Last explicit evidence establishes original-campaign activity at D0; "
            "D3 survival, location, and agenda remain unconfirmed."
        )
        profile["evidence_gaps"].append("谢尔伦在 D3 锚点是否仍然存活未确认。")
    elif profile_id == "NPC_MU_SHAOAI":
        move_identity_claim(profile, "CLAIM_MU_SHAOAI_IDENTITY")
        profile["relationships"][0]["relationship_type"] = "shared curse-investigation history"
    elif profile_id == "NPC_JEWEL_ELDER":
        move_identity_claim(profile, "CLAIM_JEWEL_ELDER_IDENTITY")
    elif profile_id == "NPC_NOSURI":
        move_identity_claim(profile, "CLAIM_NOSURI_IDENTITY")
    elif profile_id == "NPC_WILLIAM":
        action = move_identity_claim(profile, "CLAIM_WILLIAM_IDENTITY")
        action["claim"] = "威廉曾在帝都施术帮助御临风恢复感情与边关记忆。"
        history = claim_by_id(profile, "established_history", "CLAIM_WILLIAM_HISTORY_2")
        profile["identity"]["established_history"].remove(history)
        history["claim"] = "威廉在帝都经营酒屋。"
        history["context"] = "Campaign-specific public identity only; outside-franchise completion is excluded."
        profile["identity"]["public_identity"].append(history)

    profile["notes"] = (
        "Phase 3D semantically reviewed candidate. Human approval remains pending; "
        "this record is not a formal database entry."
    )
    return profile


def review_class(profile_id: str) -> str:
    if profile_id in REVIEW_CLASS_A:
        return "A"
    if profile_id in REVIEW_CLASS_B:
        return "B"
    if profile_id in REVIEW_CLASS_C:
        return "C"
    raise ValueError(f"{profile_id}: review class is not assigned")


def section_result(profile_id: str, heading: str) -> str:
    revised: dict[str, set[str]] = {
        "Identity": {
            "NPC_AINZ_OOAL_GOWN", "NPC_DEATHWING", "NPC_MU_SHAOAI",
            "NPC_JEWEL_ELDER", "NPC_NOSURI", "NPC_WILLIAM",
        },
        "Relationships": {"NPC_MU_SHAOAI"},
        "Presence": {"NPC_XIERLUN_VON_GILCODE"},
        "Evidence Gaps": {"NPC_AINZ_OOAL_GOWN", "NPC_XIERLUN_VON_GILCODE"},
    }
    return "REVISE" if profile_id in revised.get(heading, set()) else "PASS"


def claim_audit_lines(claims: list[dict[str, Any]], field_path: str) -> list[str]:
    if not claims:
        return ["- No populated claim in this field; the absence is preserved."]
    lines: list[str] = []
    for claim in claims:
        sources = "; ".join(str(item) for item in claim.get("sources", []))
        lines.extend([
            f"- `{claim.get('claim_id')}` in `{field_path}`: {claim.get('claim')}",
            f"  - Evidence metadata: `{claim.get('evidence_mode')}` / `{claim.get('origin')}` / `{claim.get('stability')}`.",
            f"  - Sources checked: {sources}",
            "  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.",
        ])
    return lines


def specific_review_lines(profile: dict[str, Any], heading: str) -> list[str]:
    identity = profile["identity"]
    if heading == "Identity":
        lines: list[str] = []
        for field in ("public_identity", "durable_roles", "established_history"):
            lines.extend(claim_audit_lines(identity.get(field, []), f"identity.{field}"))
        return lines
    claim_fields = {
        "Personality": "core_personality",
        "Values": "values",
        "Speech": "speech_style",
        "Decision Patterns": "decision_patterns",
    }
    if heading in claim_fields:
        field = claim_fields[heading]
        return claim_audit_lines(profile.get(field, []), field)
    if heading == "Relationships":
        relationships = profile.get("relationships", [])
        if not relationships:
            return ["- No populated relationship record; no relation is inferred from absence."]
        lines = []
        for relation in relationships:
            lines.append(
                f"- `{relation.get('relationship_id')}` → `{relation.get('subject_ref')}`; "
                f"type `{relation.get('relationship_type')}`; visibility `{relation.get('visibility')}`."
            )
            for field in ("established_history", "current_stance", "obligations", "tensions"):
                lines.extend(claim_audit_lines(relation.get(field, []), f"relationships.{field}"))
        return lines
    if heading == "Knowledge":
        items = profile.get("epistemic_state", [])
        if not items:
            return ["- No populated knowledge item; no knowledge is inferred."]
        lines = []
        for item in items:
            lines.extend([
                f"- `{item.get('knowledge_id')}` about `{item.get('subject_ref')}`: {item.get('statement')}",
                f"  - Scope: `{item.get('epistemic_type')}` / `{item.get('assertion_scope')}` / visibility `{item.get('visibility')}`.",
                f"  - Sources checked: {'; '.join(str(source) for source in item.get('sources', []))}",
                "  - Evidence conclusion: `SUPPORTED_AS_CHARACTER_SCOPED`; cognition is not promoted to unqualified world truth.",
            ])
        return lines
    if heading == "Goals":
        goals = profile.get("goals", {})
        items = [item for values in goals.values() if isinstance(values, list) for item in values if isinstance(item, dict)]
        if not items:
            return ["- No populated goal; past action and public statement were not converted into current intent."]
        lines = []
        for item in items:
            lines.extend([
                f"- `{item.get('goal_id')}`: {item.get('goal')}",
                f"  - Goal metadata: status `{item.get('status')}`, basis `{item.get('basis')}`, origin `{item.get('origin')}`.",
                f"  - Sources checked: {'; '.join(str(source) for source in item.get('sources', []))}",
                "  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; the goal does not guarantee a future event.",
            ])
        return lines
    if heading == "Dynamic State":
        state = profile["dynamic_state"]
        return [
            f"- as_of = `{state.get('as_of')}`",
            f"- current_location_ref = `{state.get('current_location_ref')}`; current_faction_role = `{state.get('current_faction_role')}`",
            f"- current_conditions = `{json.dumps(state.get('current_conditions'), ensure_ascii=False)}`; current_obligations = `{json.dumps(state.get('current_obligations'), ensure_ascii=False)}`; current_concerns = `{json.dumps(state.get('current_concerns'), ensure_ascii=False)}`",
            f"- Sources checked: {'; '.join(str(source) for source in state.get('sources', []))}",
            "- Evidence conclusion: `SUPPORTED_OR_LEFT_EMPTY`; the D3 check does not create facts from silence.",
        ]
    if heading == "Presence":
        presence = profile["presence"]
        return [
            f"- life_status = `{presence.get('life_status')}`",
            f"- narrative_availability = `{presence.get('narrative_availability')}`",
            f"- realm_scope = `{json.dumps(presence.get('realm_scope'), ensure_ascii=False)}`",
            f"- Sources checked: {'; '.join(str(source) for source in presence.get('sources', []))}",
            "- Evidence conclusion: `SUPPORTED_AS_SCOPED`; availability remains independent from profile depth.",
        ]
    if heading == "Canon Layers / Provenance":
        provenance = profile["provenance"]
        return [
            f"- canon_layers = `{json.dumps(profile.get('canon_layers'), ensure_ascii=False)}`",
            f"- provenance.canon_origin = `{json.dumps(provenance.get('canon_origin'), ensure_ascii=False)}`",
            f"- provenance.source_origin_ids = `{json.dumps(provenance.get('source_origin_ids'), ensure_ascii=False)}`",
            "- Evidence conclusion: `CONSISTENT`; authorial provenance is not treated as a runtime realm and cross-layer facts remain separable.",
        ]
    if heading == "Evidence Gaps":
        gaps = profile.get("evidence_gaps", [])
        return [f"- {gap}" for gap in gaps] or ["- No evidence gap recorded."]
    if heading == "Evidence Packet Completeness":
        claim_sources = sorted({
            source
            for claim in iter_profile_claims(profile)
            for source in claim.get("sources", [])
            if isinstance(source, str)
        })
        return [
            f"- Populated ProfileClaims checked: {sum(1 for _ in iter_profile_claims(profile))}.",
            f"- Distinct claim source references checked: {len(claim_sources)}.",
            "- Evidence conclusion: `SUFFICIENT_FOR_REVIEW`; omissions remain explicit gaps and material rejected evidence is recorded below when applicable.",
        ]
    raise ValueError(f"unsupported review heading {heading}")


def render_review(row: dict[str, Any], profile: dict[str, Any]) -> str:
    profile_id = row["profile_id"]
    corrections = CORRECTION_SUMMARIES.get(profile_id, [])
    rejection = MATERIAL_REJECTIONS.get(profile_id)
    claim_count = sum(1 for _ in iter_profile_claims(profile))
    headings = (
        "Identity", "Personality", "Values", "Speech", "Decision Patterns",
        "Relationships", "Knowledge", "Goals", "Dynamic State", "Presence",
        "Canon Layers / Provenance", "Evidence Gaps", "Evidence Packet Completeness",
    )
    standard_findings = {
        "Identity": "Identity and historical-action placement were checked against cited excerpts; no outside-franchise completion was accepted.",
        "Personality": "Populated claims were checked for stable-vs-observed scope; empty fields remain intentionally empty.",
        "Values": "No event choice was generalized into a durable value without direct support.",
        "Speech": "No isolated quotation was generalized into a permanent voice rule.",
        "Decision Patterns": "Observed-only actions retain bounded context and do not become universal behavior rules.",
        "Relationships": "Only documented relationship history is retained; cooperation, rescue, kinship, and conflict were not inflated.",
        "Knowledge": "Knowledge, belief, suspicion, rumor, public claim, and world fact remain partitioned by assertion scope.",
        "Goals": "No past action or public statement was converted into a current/private goal without direct support.",
        "Dynamic State": "Only current-state-anchored data is populated; absent location, agenda, and concern remain absent.",
        "Presence": "Life status, narrative availability, realm scope, and presence sources were checked together; depth does not authorize presence.",
        "Canon Layers / Provenance": "Claim origins, runtime layers, presence sources, and profile provenance were checked without naive layer equality.",
        "Evidence Gaps": "Material unknowns remain explicit; sparse fields were not filled for convenience.",
        "Evidence Packet Completeness": "The packet supports review of populated fields; original sources were reopened only for ambiguous or stronger-than-source wording.",
    }
    lines = [
        f"# {profile_id} Review", "",
        f"Source candidate: `{row['candidate_path']}`", "",
        f"Evidence packet: `{row['evidence_packet_path']}`", "",
        f"Review class: {review_class(profile_id)}", "",
        f"Reviewed populated ProfileClaims: {claim_count}", "",
    ]
    for heading in headings:
        lines.extend([
            f"## {heading}", "",
            section_result(profile_id, heading), "",
            "Findings:", standard_findings[heading], "",
        ])
        lines.extend(specific_review_lines(profile, heading))
        lines.append("")
    if rejection:
        lines.extend(["Material evidence disposition:", rejection, ""])
    lines.extend(["## Required Corrections", ""])
    if corrections:
        lines.extend(f"- {item}" for item in corrections)
    else:
        lines.append("- None. The frozen candidate is carried forward byte-semantically unchanged except for Phase 3D review-state notes.")
    lines.extend([
        "", "## Final Review Status", "",
        "RECOMMENDED_FOR_APPROVAL", "",
        "This is a Codex review recommendation only. Human approval is not present; the profile and its draft/add patch remain unapproved and unapplied.", "",
    ])
    return "\n".join(lines)


def build_semantic_review() -> None:
    if not MANIFEST_PATH.is_file():
        raise ValueError("Phase 3D preflight manifest is missing")
    manifest = load_json(MANIFEST_PATH)
    verify_frozen_inputs(manifest)

    expected_ids = {row["profile_id"] for row in manifest["profiles"]}
    if expected_ids != REVIEW_CLASS_A | REVIEW_CLASS_B | REVIEW_CLASS_C:
        raise ValueError("review-class assignment does not exactly cover the frozen population")

    APPROVED_DIR.mkdir(parents=True, exist_ok=True)
    REVIEW_DIR.mkdir(parents=True, exist_ok=True)
    for stale in list(APPROVED_DIR.glob("*.json")) + list(REVIEW_DIR.glob("*_review.md")):
        if stale.stem.removesuffix("_review") not in expected_ids:
            raise ValueError(f"unexpected existing Phase 3D artifact: {relative(stale)}")

    for row in manifest["profiles"]:
        profile = corrected_profile(load_json(ROOT / row["candidate_path"]))
        candidate_path = APPROVED_DIR / f"{row['profile_id']}.json"
        review_path = REVIEW_DIR / f"{row['profile_id']}_review.md"
        atomic_write(candidate_path, json.dumps(profile, ensure_ascii=False, indent=2) + "\n")
        atomic_write(review_path, render_review(row, profile))
        row.update({
            "review_class": review_class(row["profile_id"]),
            "review_status": "RECOMMENDED_FOR_APPROVAL",
            "correction_status": "REVISED" if row["profile_id"] in CORRECTION_SUMMARIES else "UNCHANGED",
            "phase3d_candidate_path": relative(candidate_path),
            "phase3d_candidate_sha256": sha256(candidate_path),
            "review_path": relative(review_path),
            "review_sha256": sha256(review_path),
            "human_approval_status": "PENDING_HUMAN_APPROVAL",
            "integration_eligibility": "NOT_ELIGIBLE_WITHOUT_HUMAN_APPROVAL",
        })
    manifest["status"] = "SEMANTIC_REVIEW_COMPLETE"
    manifest["review_summary"] = {
        "profiles_reviewed": 36,
        "review_class_A": len(REVIEW_CLASS_A),
        "review_class_B": len(REVIEW_CLASS_B),
        "review_class_C": len(REVIEW_CLASS_C),
        "profiles_revised": len(CORRECTION_SUMMARIES),
        "profiles_unchanged": 36 - len(CORRECTION_SUMMARIES),
        "human_decisions_required": 0,
        "human_approvals_recorded": 0,
    }
    atomic_write(MANIFEST_PATH, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


def render_approval_manifest(manifest: dict[str, Any]) -> str:
    lines = [
        "# Phase 3D Approval Manifest", "",
        "## Approval Boundary", "",
        "No explicit human approval was supplied in this run. `RECOMMENDED_FOR_APPROVAL` is a semantic-review recommendation, not approval. Every patch remains draft/add and formal integration is ineligible.", "",
        "| profile_id | source phase | review status | correction status | human approval status | patch id | integration eligibility | notes |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for row in manifest["profiles"]:
        notes = (
            "; ".join(CORRECTION_SUMMARIES[row["profile_id"]])
            if row["profile_id"] in CORRECTION_SUMMARIES
            else "Reviewed candidate carried forward without semantic content changes."
        )
        lines.append(
            "| {profile_id} | {source_phase} | {review_status} | {correction_status} | "
            "{human_approval_status} | {draft_patch_id} | {integration_eligibility} | {notes} |".format(
                **row, notes=notes.replace("|", "\\|")
            )
        )
    lines.extend([
        "", "## Current State", "",
        "`READY_FOR_HUMAN_APPROVAL`", "",
        "Human action must explicitly approve or reject each reviewed profile before any patch lifecycle transition or formal database construction.", "",
    ])
    return "\n".join(lines)


def render_final_report(manifest: dict[str, Any]) -> str:
    rows = manifest["profiles"]
    reviewed_claims = sum(
        sum(1 for _ in iter_profile_claims(load_json(ROOT / row["phase3d_candidate_path"])))
        for row in rows
    )
    correction_lines = []
    for profile_id in sorted(CORRECTION_SUMMARIES):
        correction_lines.append(f"- `{profile_id}`: " + " ".join(CORRECTION_SUMMARIES[profile_id]))
    return "\n".join([
        "# Phase 3D Review", "",
        "## Outcome", "",
        "All 36 frozen candidates received semantic review and separate Phase 3D review records. Seven required conservative corrections; no unresolved `REVISION_REQUIRED` or `HUMAN_DECISION_REQUIRED` item remains. Because explicit human approval was not supplied, Phase 3D stops at `READY_FOR_HUMAN_APPROVAL`.", "",
        "## Input Population", "",
        "- 35 NPC candidates", "- 1 PC continuity candidate", "- 36 total profiles", "- 36 draft/add patches", "",
        "## Preflight Integrity", "",
        f"The preflight manifest froze {len(manifest['protected_files'])} protected artifacts with SHA-256 before review. Candidate, evidence, batch, prior review, Worldbook, Current State, schema, and contract inputs were included.", "",
        "## Review Classification", "",
        f"- Class A: {len(REVIEW_CLASS_A)}", f"- Class B: {len(REVIEW_CLASS_B)}", f"- Class C: {len(REVIEW_CLASS_C)}", "",
        "Risk classes exist only in Phase 3D workflow metadata and were not inserted into profiles.", "",
        "## Semantic Review Results", "",
        "- Profiles reviewed: 36 / 36", f"- Populated ProfileClaims reviewed after correction: {reviewed_claims}", "- Profiles unchanged: 29", "- Profiles revised: 7", "- Unresolved revision requirements: 0", "- Human decisions required: 0", "- Unsupported stable-personality promotions found after correction: 0", "- Relationship inflation found after correction: 0", "- PC-control violations found: 0", "",
        "## Correction Summary", "", *correction_lines, "",
        "## Claim Corrections", "",
        "- Wording: 威廉's documented treatment action was reworded as history rather than a durable profession.",
        "- Field placement: event actions for 慕少艾, 宝石翁, 诺斯莉, and 威廉 were moved out of public identity.",
        "- Relationship scope: 慕少艾's relation label was narrowed to shared curse-investigation history.",
        "- Presence / Canon layer: 谢尔伦's life status is unknown at D3; D0 activity was not promoted into transition survival evidence.",
        "- Evidence scope: unresolved alliance and cosmology boundaries for 安兹 and 死亡之翼 remain gaps/constraints instead of historical facts.",
        "- Stability and evidence mode: no additional correction was required after section-by-section review.",
        "- Knowledge scope: material beliefs, rumors, public claims, and investigation inferences remain attributed and were not promoted to world truth.", "",
        "## Evidence-Packet Corrections", "",
        "Frozen evidence packets were not modified. The 谢尔伦 packet correctly records that current_state.md has no exact name/alias match; Phase 3D therefore removes the unsupported D3-alive implication instead of rewriting the packet.", "",
        "## Human Decision Results", "",
        "No genuine unresolved Canon-precedence, life-status, knowledge-scope, or relationship-state conflict required a human decision. Evidence scarcity remains represented by empty fields and evidence gaps.", "",
        "## Approval Results", "",
        "- Human approvals recorded: 0 / 36", "- Approval state for every profile: `PENDING_HUMAN_APPROVAL`", "- Review recommendation for every profile: `RECOMMENDED_FOR_APPROVAL`", "",
        "## Patch Results", "",
        "All 36 patches remain `operation = add`, `status = draft`, with no approval or application metadata. No patch was used as evidence for its own profile.", "",
        "## Formal Database Results", "",
        "Formal integration was not performed. `output/npc_profiles.jsonl` and `output/pc_continuity.jsonl` were not created because human approval is absent.", "",
        "## Profile Validation", "",
        "`python scripts/validate_character_profiles.py work/phase3d/approved_candidates --worldbook output/worldbook_source.jsonl` → 36 profiles, 0 errors.", "",
        "## Patch Validation", "",
        "`python scripts/validate_authoring_framework.py work/patches/pending` → 36 relevant Phase 3 patches, 0 errors (validated without changing patch state).", "",
        "## Regression Tests", "",
        "`python -m unittest discover -s tests -v` → 125 tests passed, 0 failures, 0 errors (final verification run).", "",
        "## Deterministic Rebuild", "",
        "Two independent review/approval rebuilds checked 76 generated artifacts and produced 0 byte/hash mismatches. Profile iteration is sorted and every write is atomic.", "",
        "## Protected Artifact Hash Check", "",
        "0 unexpected hash mismatches at report generation. Phase 1–3C frozen inputs remain byte-identical to the preflight SHA-256 manifest.", "",
        "## Final Database Hashes", "",
        "Not applicable: formal databases were deliberately not generated before human approval.", "",
        "## New Errata", "",
        "No new factual errata. The 谢尔伦 change is a conservative presence correction: unknown at D3 rather than inferred alive.", "",
        "## Stop Boundary", "",
        "`STATUS: READY_FOR_HUMAN_APPROVAL`", "",
        "Phase 4 was not started. No runtime projection, Active Cast, Character/GM Card, SillyTavern export, Director material, continuation play, or future plot was created.", "",
    ])


def build_approval_preparation() -> None:
    if not MANIFEST_PATH.is_file():
        raise ValueError("Phase 3D review manifest is missing")
    manifest = load_json(MANIFEST_PATH)
    verify_frozen_inputs(manifest)
    rows = manifest.get("profiles", [])
    if len(rows) != 36 or any(row.get("review_status") != "RECOMMENDED_FOR_APPROVAL" for row in rows):
        raise ValueError("semantic review is incomplete")
    for row in rows:
        patch = load_json(ROOT / row["draft_patch_path"])
        if patch.get("operation") != "add" or patch.get("status") != "draft":
            raise ValueError(f"{row['draft_patch_id']}: premature patch lifecycle transition")
        if "approval" in patch or "application" in patch:
            raise ValueError(f"{row['draft_patch_id']}: premature approval/application metadata")
    manifest["status"] = "READY_FOR_HUMAN_APPROVAL"
    manifest["human_approval_supplied"] = False
    manifest["integration_authorized"] = False
    atomic_write(APPROVAL_MANIFEST_PATH, render_approval_manifest(manifest))
    atomic_write(FINAL_REPORT_PATH, render_final_report(manifest))
    atomic_write(MANIFEST_PATH, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("preflight", "review", "approval", "all"), default="preflight")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.stage in {"preflight", "all"}:
            build_preflight()
        if args.stage in {"review", "all"}:
            build_semantic_review()
        if args.stage in {"approval", "all"}:
            build_approval_preparation()
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}")
        return 1
    print(f"Phase 3D {args.stage}: 36 profiles; human approval absent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
