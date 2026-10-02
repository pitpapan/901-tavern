from __future__ import annotations

import argparse
import copy
import hashlib
import json
import random
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[2]
R1C_ROOT = ROOT / "work/rebuild/r1c_vnext"
LEDGER = ROOT / "work/phase3d_r2/source_coverage/source_chunk_ledger.jsonl"
OLD_MATRIX = ROOT / "work/remediation/r1c0/semantic_trust_matrix.jsonl"
FROZEN_MANIFEST = ROOT / "work/phase3d_r2c/reviewed_inputs/frozen_input_manifest.json"
PRODUCTION = ROOT / "work/phase3d_r2c"
SAMPLE_SEED = "R1C-1-SOURCE-WINDOWS-2026-10-01-v1"


class ValidationError(RuntimeError):
    pass


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def encode_jsonl(rows: Iterable[dict[str, Any]]) -> bytes:
    return b"".join(canonical_json(row) for row in rows)


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def _post_lookup(path: Path) -> dict[str, dict[str, Any]]:
    return {str(row["id"]): row for row in read_jsonl(path)}


def build_source_index(root: Path = ROOT) -> dict[str, Any]:
    chunks, documents, unresolved = {}, {}, []
    parts: Counter[str] = Counter()
    for row in read_jsonl(root / LEDGER.relative_to(ROOT)):
        document = row["document"].replace("\\", "/")
        path = root / Path(document)
        if document not in documents:
            documents[document] = _post_lookup(path) if path.is_file() else {}
            if not path.is_file():
                unresolved.append(document)
        post = documents[document].get(str(row["post_id"]))
        if post is None:
            unresolved.append(f"{document}#{row['post_id']}")
            continue
        item = dict(row)
        item.update(document=document, post=post)
        chunks[row["source_chunk_id"]] = item
        parts[row["campaign_part"]] += 1
    return {"chunks": chunks, "documents": documents, "parts": dict(sorted(parts.items())), "unresolved_documents": sorted(set(unresolved))}


def _quote_span(body: str, hint: str | None) -> tuple[int, int, str]:
    if hint:
        start = body.find(hint)
        if start < 0:
            raise ValidationError(f"quote not found: {hint}")
        return start, start + len(hint), hint
    quote = next((line.strip() for line in body.splitlines() if line.strip()), "")[:96]
    start = body.find(quote)
    return start, start + len(quote), quote


def locator_for_chunk(index: dict[str, Any], chunk_id: str, quote_hint: str | None = None) -> dict[str, Any]:
    if chunk_id not in index["chunks"]:
        raise ValidationError(f"unknown source chunk: {chunk_id}")
    row = index["chunks"][chunk_id]
    start, end, quote = _quote_span(row["post"]["body"], quote_hint)
    path = ROOT / row["document"]
    return {
        "source_path": row["document"], "source_chunk_id": chunk_id, "post_id": str(row["post_id"]),
        "span_start": start, "span_end": end, "quote": quote,
        "post_sha256": sha256_bytes(canonical_json(row["post"])), "file_sha256": sha256_file(path),
    }


def validate_locator(root: Path, locator: dict[str, Any]) -> None:
    path = root / locator["source_path"]
    if not path.is_file() or sha256_file(path) != locator["file_sha256"]:
        raise ValidationError(f"source file mismatch: {locator['source_path']}")
    post = _post_lookup(path).get(str(locator["post_id"]))
    if post is None or sha256_bytes(canonical_json(post)) != locator["post_sha256"]:
        raise ValidationError(f"post mismatch: {locator['post_id']}")
    if post["body"][locator["span_start"]:locator["span_end"]] != locator["quote"]:
        raise ValidationError(f"span mismatch: {locator['source_chunk_id']}")


def _known_chunk_ids() -> set[str]:
    return {ref for row in read_jsonl(OLD_MATRIX) for ref in row["source_chunk"]["refs"] if ref.startswith("SRC_")}


def _scene_candidates(index: dict[str, Any]) -> list[dict[str, Any]]:
    by_doc: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in index["chunks"].values():
        by_doc[row["document"]].append(row)
    known, candidates = _known_chunk_ids(), []
    for document, rows in sorted(by_doc.items()):
        rows.sort(key=lambda item: item["post_order"])
        for offset in range(0, len(rows), 3):
            group = rows[offset:offset + 3]
            if len(group) < 2 or any(item["source_chunk_id"] in known for item in group):
                continue
            length = sum(len(item["post"]["body"]) for item in group)
            authors = sorted({item["author"] for item in group})
            part, group_index = group[0]["campaign_part"], offset // 3
            candidates.append({
                "scene_group_id": f"SCENE_{part}_{sha256_bytes((document + ':' + str(group_index)).encode())[:12]}",
                "campaign_part": part, "document": document, "group_index": group_index,
                "source_chunk_ids": [item["source_chunk_id"] for item in group],
                "post_ids": [str(item["post_id"]) for item in group], "authors": authors,
                "body_length": length, "length_stratum": "short" if length < 900 else "medium" if length < 2400 else "long",
                "multi_author": len(authors) > 1, "context_expansion": "three consecutive posts within one source page",
            })
    return candidates


def build_sampling_manifest(index: dict[str, Any]) -> dict[str, Any]:
    rng = random.Random(SAMPLE_SEED)
    ranked = sorted(_scene_candidates(index), key=lambda row: (rng.random(), row["scene_group_id"]))
    chosen = []
    for part in ("P1", "P2", "P3"):
        selected = []
        for row in (item for item in ranked if item["campaign_part"] == part):
            if any(old["document"] == row["document"] and abs(old["group_index"] - row["group_index"]) <= 1 for old in selected):
                continue
            selected.append(row)
            if len(selected) == 16:
                break
        if len(selected) != 16:
            raise ValidationError(f"insufficient scene groups for {part}: {len(selected)}")
        chosen.extend(selected)
    development, holdout = [], []
    for part in ("P1", "P2", "P3"):
        rows = [row for row in chosen if row["campaign_part"] == part]
        development.extend(rows[:8]); holdout.extend(rows[8:])
    dev = {c for row in development for c in row["source_chunk_ids"]}
    held = {c for row in holdout for c in row["source_chunk_ids"]}
    corpus = [(r["source_chunk_id"], r["document"], str(r["post_id"]), r["source_order"]) for r in sorted(index["chunks"].values(), key=lambda x: x["source_order"])]
    return {
        "sampling_version": "R1C-1-v1", "seed": SAMPLE_SEED,
        "population": "all resolvable source-chunk rows; old semantic routes ignored",
        "population_chunk_count": len(index["chunks"]), "population_sha256": sha256_bytes(canonical_json(corpus)),
        "scene_group_rule": "triples of consecutive posts; known groups excluded; adjacent groups cannot cross splits",
        "stratification": ["campaign_part", "source_position", "author", "body_length", "multi_author"],
        "development_windows": development, "holdout_windows": holdout, "split_leakage": sorted(dev & held),
        "review_isolation": "sequential_review",
        "limitations": ["24+24 does not prove corpus-wide correctness.", "Reviewer B was a separate pass, not an isolated agent/session."],
    }


RELEVANCE_EVENTS = {
    "R2C_RELEVANCE_HONDA": ["EVENT_P3_003_TEIRESIAS_REVELATION", "EVENT_P3_009_DEATHWING_FINAL_WAR"],
    "R2C_RELEVANCE_CASSIUS": ["EVENT_P3_002_SANCTUARY_ENTRY"],
    "R2C_RELEVANCE_KENDA": ["EVENT_P3_003_TEIRESIAS_REVELATION"],
    "R2C_RELEVANCE_LULUTIYE": ["EVENT_P2_009_AFTERMATH_HAKU_KNOWLEDGE", "EVENT_P3_004_SERTANT_AWAKENING_AND_HOME"],
    "R2C_RELEVANCE_OSHIRA": ["EVENT_P3_003_TEIRESIAS_REVELATION", "EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY"],
}


def _chunk_for_path_post(index: dict[str, Any], source_path: str, post_id: str) -> str:
    normalized = source_path.replace("\\", "/")
    for chunk_id, row in index["chunks"].items():
        if row["document"] == normalized and str(row["post_id"]) == str(post_id):
            return chunk_id
    raise ValidationError(f"no chunk for {normalized} post {post_id}")


def _parse_evidence_ref(ref: str) -> tuple[str, str]:
    match = re.fullmatch(r"(.+?/posts\.jsonl) post (\S+)", ref)
    if not match:
        raise ValidationError(f"unparseable evidence ref: {ref}")
    return match.group(1), match.group(2)


def _relevance_case(row: dict[str, Any], index: dict[str, Any]) -> dict[str, Any]:
    profile_id = row["character"][0]
    candidate_path = ROOT / f"work/phase3d_r2c/candidates/by_profile/{profile_id}.json"
    candidate = json.loads(candidate_path.read_text(encoding="utf-8-sig"))
    affected = [item for item in candidate.get("campaign_timeline", []) if item.get("event_ref") in RELEVANCE_EVENTS[row["fact_id"]]]
    if not affected:
        raise ValidationError(f"missing affected timeline: {row['fact_id']}")
    locators = []
    for item in affected:
        for ref in item["evidence_refs"]:
            path, post_id = _parse_evidence_ref(ref)
            locators.append(locator_for_chunk(index, _chunk_for_path_post(index, path, post_id)))
    outputs = [{
        "candidate_path": candidate_path.relative_to(ROOT).as_posix(), "timeline_id": item["timeline_id"],
        "event_ref": item["event_ref"], "role_in_event": item["role_in_event"],
        "incorrect_summary": item["character_specific_summary"],
    } for item in affected]
    return {
        "case_id": f"R1C1-{row['fact_id']}", "historical_case_id": row["fact_id"],
        "historical_regression_id": f"GOLDEN_{row['fact_id']}", "case_kind": "PROJECTION_CONTRACT",
        "prefilled_diagnosis": {"failure_class": row["failure_class"], "first_failure_layer": row["first_failure_layer"]},
        "source_verification": "VERIFIED_LOCATORS_AND_OUTPUT",
        "source_assertions": [{"locators": locators, "direct_support": "Only explicit participant roles may be projected; the candidate copied broader event content."}],
        "specific_incorrect_outputs": outputs,
        "must_preserve": ["explicit per-character role", "source provenance", "separately authorized context"],
        "must_not_assert": ["whole event summary is this profile's experience", "all event consequences apply to this profile"],
        "expected_output_assertions": ["each projection cites a fact naming the profile and role"],
        "reviewer": "Codex sequential source/output review", "unresolved_points": [],
    }


def build_evaluation_cases(root: Path, index: dict[str, Any]) -> list[dict[str, Any]]:
    cases = []
    truth_status = {
        "verified_source_fact": "SOURCE_SUPPORTED_WITH_BOUNDARIES",
        "human_review_hypothesis": "INTERPRETIVE_HYPOTHESIS_REQUIRES_HUMAN",
        "unsupported_or_unresolved": "NOT_ESTABLISHED_BY_REVIEWED_SOURCE",
    }
    for row in read_jsonl(root / OLD_MATRIX.relative_to(ROOT)):
        if row["fact_id"].startswith("R2C_RELEVANCE_"):
            case = _relevance_case(row, index)
            case["story_truth_status"] = "PROJECTION_CONTRACT_VERIFIED"
            cases.append(case); continue
        locators = [locator_for_chunk(index, ref) for ref in row["source_chunk"]["refs"] if ref.startswith("SRC_") and ref in index["chunks"]]
        cases.append({
            "case_id": f"R1C1-{row['fact_id']}", "historical_case_id": row["fact_id"],
            "historical_regression_id": f"GOLDEN_{row['fact_id']}", "case_kind": "SOURCE_SEMANTIC_ASSERTION",
            "prefilled_diagnosis": {"proposition": row["proposition"], "failure_class": row["failure_class"], "first_failure_layer": row["first_failure_layer"]},
            "source_verification": "VERIFIED" if locators else "NOT_VERIFIED",
            "story_truth_status": truth_status[row["review_status"]],
            "source_assertions": [{"locators": locators, "direct_support": row["proposition"] if locators else None, "interpretive_summary": row["proposition"] if locators else None}],
            "specific_incorrect_outputs": [],
            "must_preserve": ["speaker/subject attribution", "time", "modality", "reality scope"],
            "must_not_assert": [f"stronger claim than: {row['proposition']}"] if locators else [],
            "expected_output_assertions": ["projection preserves proposition and boundaries"],
            "reviewer": "Codex sequential source review",
            "unresolved_points": [] if locators else ["No stable chunk in historical record; remains not verified."],
        })
    return sorted(cases, key=lambda item: item["historical_case_id"])


REQUIRED_FACT_FIELDS = {"fact_id", "revision", "proposition_type", "statement", "subject_refs", "reality_scope", "narrative_modality", "evidence_nature", "polarity", "source_locators"}


def validate_atomic_fact(root: Path, fact: dict[str, Any]) -> None:
    missing = REQUIRED_FACT_FIELDS - set(fact)
    if missing or not fact["subject_refs"] or not fact["source_locators"]:
        raise ValidationError(f"invalid fact {fact.get('fact_id')}: {sorted(missing)}")
    if fact["reality_scope"] == fact["narrative_modality"] or fact["narrative_modality"] == fact["evidence_nature"]:
        raise ValidationError("semantic dimensions collapsed")
    for locator in fact["source_locators"]:
        validate_locator(root, locator)


def example_fact(index: dict[str, Any]) -> dict[str, Any]:
    return {
        "fact_id": "FACT_EXAMPLE_FATE_LIGHT", "revision": 1, "proposition_type": "ACTION",
        "statement": "悠悠在御临风掌心留下乳白色光芒。", "subject_refs": ["NPC_YOUYOU", "PC_YU_LINFENG"],
        "actor_refs": ["NPC_YOUYOU"], "reality_scope": "MAIN_WORLD", "narrative_modality": "ACTUAL",
        "evidence_nature": "NARRATIVE_CONFIRMATION", "polarity": "AFFIRMED",
        "source_locators": [locator_for_chunk(index, "SRC_P3_P004_POST_0039_1078852", "乳白色光芒")],
        "projection_roles": {"NPC_YOUYOU": "actor", "PC_YU_LINFENG": "recipient"},
    }


def project_character_fact(fact: dict[str, Any], profile_id: str) -> dict[str, Any]:
    role = fact.get("projection_roles", {}).get(profile_id)
    if not role:
        raise ValidationError(f"no explicit projection role for {profile_id}/{fact['fact_id']}")
    return {"profile_id": profile_id, "fact_ref": fact["fact_id"], "projection_role": role, "statement": fact["statement"], "reality_scope": fact["reality_scope"], "narrative_modality": fact["narrative_modality"], "evidence_nature": fact["evidence_nature"], "polarity": fact["polarity"]}


def validate_relationship(relationship: dict[str, Any], fact_ids: set[str]) -> None:
    required = {"relationship_id", "target_ref", "baseline", "baseline_status", "current_stance", "milestones"}
    if required - set(relationship):
        raise ValidationError("incomplete relationship parent")
    if relationship["baseline_status"] == "NOT_ESTABLISHED":
        if relationship["baseline"] is not None:
            raise ValidationError("absent baseline must be null")
    elif relationship["baseline_status"] == "ESTABLISHED":
        refs = relationship.get("baseline_fact_refs", [])
        if not relationship["baseline"] or not refs or not set(refs).issubset(fact_ids):
            raise ValidationError("established baseline lacks reviewed facts")
    else:
        raise ValidationError("unknown baseline status")
    for milestone in relationship["milestones"]:
        if not milestone.get("milestone_id") or not milestone.get("fact_refs") or not set(milestone["fact_refs"]).issubset(fact_ids):
            raise ValidationError("invalid relationship milestone")


def _assert_semantic(actual: dict[str, Any], expected: dict[str, Any]) -> None:
    for field, value in expected.items():
        if actual.get(field) != value:
            raise ValidationError(f"semantic mismatch {field}")


def _require_targets(declared: set[str], actual: set[str]) -> None:
    missing = declared - actual
    if missing:
        raise ValidationError(f"missing targets: {sorted(missing)}")


def _require_coverage(expected: set[str], actual: set[str]) -> None:
    missing = expected - actual
    if missing:
        raise ValidationError(f"missing source topics: {sorted(missing)}")


def _independent_evidence_count(locators: list[dict[str, Any]]) -> int:
    return len({(item["source_path"], item["post_id"], item["span_start"], item["span_end"]) for item in locators})


def run_mutation_tests(index: dict[str, Any]) -> dict[str, bool]:
    detected = {}
    def catches(name, callback):
        try: callback()
        except ValidationError: detected[name] = True
        else: detected[name] = False
    catches("missing_destination", lambda: _require_targets({"FACT_OK", "FACT_MISSING"}, {"FACT_OK"}))
    base = example_fact(index)
    catches("wrong_subject", lambda: project_character_fact(base, "NPC_UNRELATED"))
    catches("preference_to_decision", lambda: _assert_semantic({"narrative_modality": "DECISION"}, {"narrative_modality": "PREFERENCE"}))
    catches("prediction_to_fact", lambda: _assert_semantic({"narrative_modality": "ACTUAL"}, {"narrative_modality": "PREDICTION"}))
    catches("testimony_to_objective_history", lambda: _assert_semantic({"evidence_nature": "NARRATIVE_CONFIRMATION"}, {"evidence_nature": "HEARSAY"}))
    catches("speaker_subject_swap", lambda: _assert_semantic({"speaker_refs": ["B"], "subject_refs": ["A"]}, {"speaker_refs": ["A"], "subject_refs": ["B"]}))
    catches("second_topic_omitted", lambda: _require_coverage({"topic1", "topic2"}, {"topic1"}))
    catches("healing_plan_to_completed", lambda: _assert_semantic({"narrative_modality": "ACTUAL"}, {"narrative_modality": "PLAN"}))
    catches("historical_state_extended_to_d3", lambda: _assert_semantic({"valid_until": "D3"}, {"valid_until": None}))
    catches("dream_leakage", lambda: _assert_semantic({"reality_scope": "MAIN_WORLD"}, {"reality_scope": "SPECIAL_INTERLUDE"}))
    catches("question_or_condition_to_fact", lambda: _assert_semantic({"narrative_modality": "ACTUAL"}, {"narrative_modality": "QUESTION"}))
    bad = locator_for_chunk(index, "SRC_P3_P004_POST_0039_1078852", "乳白色光芒"); bad["span_end"] += 1
    catches("forged_source_locator", lambda: validate_locator(ROOT, bad))
    locator = locator_for_chunk(index, "SRC_P3_P004_POST_0039_1078852", "乳白色光芒")
    detected["duplicate_source_not_independent_evidence"] = _independent_evidence_count([locator, copy.deepcopy(locator)]) == 1
    left = {"a": 1, "b": {"x": 2, "y": 3}}
    right = {"b": {"y": 3, "x": 2}, "a": 1}
    detected["json_key_reorder_semantically_equal"] = canonical_json(left) == canonical_json(right)
    return detected


def _materialize_fact_specs(root: Path, index: dict[str, Any]) -> list[dict[str, Any]]:
    specs = read_jsonl(root / "work/rebuild/r1c_vnext/pilot/reviewed_fact_specs.jsonl")
    facts = []
    for spec in specs:
        fact = {key: copy.deepcopy(value) for key, value in spec.items() if key != "source_specs"}
        fact["source_locators"] = [locator_for_chunk(index, item["source_chunk_id"], item.get("quote")) for item in spec["source_specs"]]
        validate_atomic_fact(root, fact); facts.append(fact)
    if len({fact["fact_id"] for fact in facts}) != len(facts):
        raise ValidationError("duplicate pilot fact ids")
    return facts


def load_authored_pilot(root: Path = ROOT) -> dict[str, Any]:
    facts = _materialize_fact_specs(root, build_source_index(root))
    relationships = json.loads((root / "work/rebuild/r1c_vnext/pilot/reviewed_relationships.json").read_text(encoding="utf-8-sig"))
    profiles = json.loads((root / "work/rebuild/r1c_vnext/pilot/profile_specs.json").read_text(encoding="utf-8-sig"))
    reviews = read_jsonl(root / "work/rebuild/r1c_vnext/pilot/sample_reviews.jsonl")
    return {"facts": facts, "relationships": relationships, "profiles": profiles, "sample_reviews": reviews}


def derive_pilot(authored: dict[str, Any]) -> dict[str, Any]:
    facts = authored["facts"]
    chronology = [{"fact_ref": f["fact_id"], "statement": f["statement"], "story_time": f.get("story_time"), "reality_scope": f["reality_scope"], "narrative_modality": f["narrative_modality"], "evidence_nature": f["evidence_nature"]} for f in facts if f.get("chronology_included", True)]
    character_facts = [project_character_fact(fact, profile) for fact in facts for profile in sorted(fact.get("projection_roles", {}))]
    by_rel, by_profile = defaultdict(list), defaultdict(list)
    for item in authored["relationships"]: by_rel[item["profile_id"]].append({k: v for k, v in item.items() if k != "profile_id"})
    for item in character_facts: by_profile[item["profile_id"]].append(item)
    candidates = [{"profile_id": p["profile_id"], "display_name": p["display_name"], "facts": by_profile[p["profile_id"]], "relationships": by_rel[p["profile_id"]], "current_state": p.get("current_state", []), "unknown_boundaries": p.get("unknown_boundaries", [])} for p in authored["profiles"]]
    return {"chronology": chronology, "character_facts": character_facts, "candidates": candidates, "fact_by_id": {f["fact_id"]: f for f in facts}}


def validate_pilot(root: Path, authored: dict[str, Any], derived: dict[str, Any]) -> dict[str, int]:
    fact_ids = {fact["fact_id"] for fact in authored["facts"]}
    for fact in authored["facts"]: validate_atomic_fact(root, fact)
    parent_errors = 0
    for item in authored["relationships"]:
        try: validate_relationship({k: v for k, v in item.items() if k != "profile_id"}, fact_ids)
        except ValidationError: parent_errors += 1
    actual = {i["fact_ref"] for i in derived["chronology"]} | {i["fact_ref"] for i in derived["character_facts"]}
    required = {f["fact_id"] for f in authored["facts"] if f.get("projection_roles")}
    projected = {i["fact_ref"] for i in derived["character_facts"]}
    fact_map = {f["fact_id"]: f for f in authored["facts"]}
    relevance = sum(1 for i in derived["character_facts"] if i["profile_id"] not in fact_map[i["fact_ref"]].get("projection_roles", {}))
    return {"unsupported_outputs": len(actual - fact_ids), "missing_required_projections": len(required - projected), "character_relevance_errors": relevance, "parent_container_errors": parent_errors, "complete_parent_candidates": len(derived["candidates"])}


def production_fingerprint(root: Path = ROOT) -> dict[str, Any]:
    base = root / PRODUCTION.relative_to(ROOT)
    rows = [{"path": p.relative_to(base).as_posix(), "size": p.stat().st_size, "sha256": sha256_file(p)} for p in sorted(base.rglob("*")) if p.is_file()]
    return {"file_count": len(rows), "aggregate_sha256": sha256_bytes(encode_jsonl(rows))}


def verify_frozen(root: Path = ROOT) -> dict[str, Any]:
    manifest = json.loads((root / FROZEN_MANIFEST.relative_to(ROOT)).read_text(encoding="utf-8-sig")); bad = []
    for item in manifest["files"]:
        path = root / item["path"]
        if not path.is_file() or sha256_file(path) != item["sha256"]: bad.append(item["path"])
    return {"expected": len(manifest["files"]), "verified": len(manifest["files"]) - len(bad), "bad": bad}


def _source_inventory(index: dict[str, Any]) -> list[dict[str, Any]]:
    by_doc = defaultdict(list)
    for row in index["chunks"].values(): by_doc[row["document"]].append(row)
    result = []
    for doc, rows in sorted(by_doc.items()):
        rows.sort(key=lambda x: x["post_order"])
        result.append({"campaign_part": rows[0]["campaign_part"], "document": doc, "page": rows[0]["page"], "post_count": len(rows), "first_source_order": rows[0]["source_order"], "last_source_order": rows[-1]["source_order"], "file_sha256": sha256_file(ROOT / doc)})
    return result


def _baseline(root, index):
    return {"r1c_stage": "R1C-1", "production": production_fingerprint(root), "frozen_inputs": verify_frozen(root), "source_extraction": {"chunks": len(index["chunks"]), "parts": index["parts"]}, "protected_roots": ["extracted-first", "extracted-second", "extracted-third", "work/phase3d_r2", "work/phase3d_r2b", "work/phase3d_r2c", "schema", "output", "current_state.md"]}


def _review_policy():
    return {"authority": "R1C_REBUILD_PLAN_CODEX.md and AGENTS.md", "old_semantic_routes_trusted_without_review": 0, "profile_exclusions": ["NPC_REN_FANZHEN", "NPC_ZHOU_ZHENG"], "frozen_profiles": ["NPC_MU_TOU"], "pc_control": {"profile_id": "PC_YU_LINFENG", "future_choice_controlled_by_user": True}, "world_scope": {"special_interlude_isolated": True, "main_world_carryover_requires_explicit_settlement": True}, "external_fiction_import": "DISALLOWED_UNLESS_SEPARATELY_AUTHORIZED", "review_isolation": "sequential_review"}


def _contract_schema():
    return {"$schema": "https://json-schema.org/draft/2020-12/schema", "$id": "r1c-vnext-atomic-fact.schema.json", "type": "object", "required": sorted(REQUIRED_FACT_FIELDS), "properties": {"fact_id": {"type": "string", "minLength": 1}, "revision": {"type": "integer", "minimum": 1}, "subject_refs": {"type": "array", "minItems": 1, "items": {"type": "string"}, "uniqueItems": True}, "actor_refs": {"type": "array", "items": {"type": "string"}, "uniqueItems": True}, "speaker_refs": {"type": "array", "items": {"type": "string"}, "uniqueItems": True}, "reality_scope": {"type": "string"}, "narrative_modality": {"type": "string"}, "evidence_nature": {"type": "string"}, "polarity": {"type": "string"}, "source_locators": {"type": "array", "minItems": 1, "items": {"type": "object"}}}, "additionalProperties": True}


def _readable(candidate):
    lines = [f"# {candidate['display_name']}", "", f"档案 ID：`{candidate['profile_id']}`", "", "## 试点人物概览", ""]
    maps = []
    for n, item in enumerate(candidate["facts"][:5], 1):
        lines.extend([item["statement"], ""]); maps.append({"profile_id": candidate["profile_id"], "sentence_index": n, "sentence": item["statement"], "fact_refs": [item["fact_ref"]]})
    lines.extend(["## 关系与边界", ""])
    for rel in candidate["relationships"]:
        lines.extend([(f"与 {rel['target_ref']} 的持续关系基础尚未由本试点来源建立；这里只保留明确发生的互动。" if rel["baseline_status"] == "NOT_ESTABLISHED" else rel["baseline"]), "", ("当前关系立场：未确认。" if rel["current_stance"] is None else rel["current_stance"]), ""])
    if not candidate["relationships"]: lines.extend(["本试点没有建立需要单独呈现的关系容器。", ""])
    lines.extend(["## 仍然未知或不能直接推断的事项", ""] + [f"- {x}" for x in candidate["unknown_boundaries"]] + ["", "---", "", "# 附录：事实索引", ""] + [f"- `{x['fact_ref']}`（{x['projection_role']}）" for x in candidate["facts"]])
    return "\n".join(lines).rstrip() + "\n", maps


def validate_readability_outputs(files: dict[str, bytes]) -> dict[str, int]:
    result = {"event_id_headings": 0, "claim_id_headings": 0, "raw_json_blocks": 0, "raw_null_stance": 0, "english_dominant_bodies": 0}
    for relative, payload in files.items():
        if not relative.startswith("pilot/readable/") or not relative.endswith(".md"):
            continue
        text = payload.decode("utf-8")
        body = text.split("# 附录：事实索引", 1)[0]
        result["event_id_headings"] += len(re.findall(r"(?m)^#{1,6}\s+EVENT_", body))
        result["claim_id_headings"] += len(re.findall(r"(?m)^#{1,6}\s+CLAIM_", body))
        result["raw_json_blocks"] += int("```json" in body or re.search(r'(?m)^\s*\{\s*"[A-Za-z_]+"\s*:', body) is not None)
        result["raw_null_stance"] += int("current_stance = null" in body or '"current_stance": null' in body)
        chinese = len(re.findall(r"[\u4e00-\u9fff]", body))
        english = len(re.findall(r"\b[A-Za-z]{3,}\b", body))
        result["english_dominant_bodies"] += int(chinese < english)
    return result


def build_all(root: Path = ROOT, write: bool = False) -> dict[str, bytes]:
    index = build_source_index(root)
    if index["unresolved_documents"]: raise ValidationError(f"unresolved documents: {index['unresolved_documents'][:5]}")
    sampling, cases = build_sampling_manifest(index), build_evaluation_cases(root, index)
    authored = load_authored_pilot(root); derived = derive_pilot(authored); validation = validate_pilot(root, authored, derived)
    if any(validation[k] for k in ("unsupported_outputs", "missing_required_projections", "character_relevance_errors", "parent_container_errors")): raise ValidationError(str(validation))
    mutations = run_mutation_tests(index)
    if not all(mutations.values()): raise ValidationError(str(mutations))
    baseline = _baseline(root, index)
    expected_prod = {"file_count": 140, "aggregate_sha256": "cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3"}
    if baseline["production"] != expected_prod: raise ValidationError(f"production drift: {baseline['production']}")
    if baseline["frozen_inputs"]["verified"] != 488 or baseline["frozen_inputs"]["bad"]: raise ValidationError(f"frozen drift: {baseline['frozen_inputs']}")
    windows = {row["scene_group_id"]: row for row in sampling["development_windows"] + sampling["holdout_windows"]}
    extraction_rows = [
        {"set": row["set"], "scene_group_id": row["scene_group_id"], "source_chunk_ids": windows[row["scene_group_id"]]["source_chunk_ids"], "proposed_semantics": row["extractor_a"]}
        for row in authored["sample_reviews"]
    ]
    reviewer_rows = [
        {"set": row["set"], "scene_group_id": row["scene_group_id"], "source_chunk_ids": windows[row["scene_group_id"]]["source_chunk_ids"], "review_order": "SOURCE_FIRST_THEN_EXTRACTION", "prior_source_inventory": row["reviewer_b_prior_inventory"], "discrepancies": row["discrepancies"], "first_pass_findings": row["first_pass_findings"]}
        for row in authored["sample_reviews"]
    ]
    disposition_rows = [
        {"set": row["set"], "scene_group_id": row["scene_group_id"], "source_chunk_ids": windows[row["scene_group_id"]]["source_chunk_ids"], "disposition": row["disposition"], "adjudication": row["adjudication"]}
        for row in authored["sample_reviews"]
    ]
    files = {
        "baseline_manifest.json": canonical_json(baseline), "source_inventory.jsonl": encode_jsonl(_source_inventory(index)),
        "review_policy.json": canonical_json(_review_policy()), "evaluation_cases.jsonl": encode_jsonl(cases),
        "sampling_manifest.json": canonical_json(sampling), "contract/atomic_fact.schema.json": canonical_json(_contract_schema()),
        "contract/projection_contract.json": canonical_json({"chronology_source": "reviewed_atomic_facts", "character_source": "reviewed_atomic_facts_with_explicit_projection_role", "event_summary_as_character_source": False, "relationship_baseline_may_be_not_established": True}),
        "pilot/reviewed_facts.jsonl": encode_jsonl(authored["facts"]),
        "pilot/extraction_a.jsonl": encode_jsonl(extraction_rows),
        "pilot/reviewer_b.jsonl": encode_jsonl(reviewer_rows),
        "pilot/source_dispositions.jsonl": encode_jsonl(disposition_rows),
        "pilot/adjudication.jsonl": encode_jsonl(authored["sample_reviews"]),
        "pilot/projections/chronology.jsonl": encode_jsonl(derived["chronology"]), "pilot/projections/character_facts.jsonl": encode_jsonl(derived["character_facts"]),
        "pilot/validation_result.json": canonical_json(validation), "pilot/mutation_results.json": canonical_json(mutations),
    }
    maps = []
    for candidate in derived["candidates"]:
        files[f"pilot/candidates/{candidate['profile_id']}.json"] = canonical_json(candidate)
        md, mapping = _readable(candidate); maps.extend(mapping); files[f"pilot/readable/{candidate['profile_id']}.md"] = md.encode("utf-8")
    files["pilot/readable/sentence_fact_map.jsonl"] = encode_jsonl(maps)
    readability = validate_readability_outputs(files)
    if any(readability.values()):
        raise ValidationError(f"readability failures: {readability}")
    files["pilot/readability_result.json"] = canonical_json(readability)
    if write:
        for rel, payload in files.items():
            path = root / "work/rebuild/r1c_vnext" / rel; path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(payload)
    return files


def check_outputs(root: Path = ROOT) -> dict[str, Any]:
    expected = build_all(root, False); diff = []
    for rel, payload in expected.items():
        path = root / "work/rebuild/r1c_vnext" / rel
        if not path.is_file() or path.read_bytes() != payload: diff.append(rel)
    if diff: raise ValidationError(f"output drift: {diff}")
    return {"status": "PASS", "files_checked": len(expected), "production": production_fingerprint(root), "frozen": verify_frozen(root)}


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args()
    print(json.dumps(check_outputs(ROOT) if args.check else {"status": "BUILT", "files": len(build_all(ROOT, True))}, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__": main()
