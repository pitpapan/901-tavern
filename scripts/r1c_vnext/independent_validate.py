from __future__ import annotations

import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / "work/rebuild/r1c_vnext"
EXPECTED_PRODUCTION = "cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3"


class AuditError(RuntimeError):
    pass


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def _post(path: Path, post_id: str) -> dict[str, Any] | None:
    for row in read_jsonl(path):
        if str(row.get("id")) == str(post_id):
            return row
    return None


def _locator_ok(root: Path, locator: dict[str, Any]) -> bool:
    path = root / locator["source_path"]
    if not path.is_file() or sha256_file(path) != locator["file_sha256"]:
        return False
    post = _post(path, locator["post_id"])
    if post is None or sha256_bytes(canonical_json(post)) != locator["post_sha256"]:
        return False
    return post["body"][locator["span_start"] : locator["span_end"]] == locator["quote"]


def _production_fingerprint(root: Path) -> tuple[int, str]:
    base = root / "work/phase3d_r2c"
    rows = [
        {"path": path.relative_to(base).as_posix(), "size": path.stat().st_size, "sha256": sha256_file(path)}
        for path in sorted(base.rglob("*")) if path.is_file()
    ]
    payload = b"".join(canonical_json(row) for row in rows)
    return len(rows), sha256_bytes(payload)


def _relationship_errors(candidate: dict[str, Any], fact_ids: set[str]) -> int:
    errors = 0
    required = {"relationship_id", "target_ref", "baseline", "baseline_status", "current_stance", "milestones"}
    for relationship in candidate.get("relationships", []):
        if required - set(relationship):
            errors += 1
            continue
        if relationship["baseline_status"] == "NOT_ESTABLISHED":
            errors += int(relationship["baseline"] is not None)
        elif relationship["baseline_status"] == "ESTABLISHED":
            refs = relationship.get("baseline_fact_refs", [])
            errors += int(not relationship["baseline"] or not refs or not set(refs).issubset(fact_ids))
        else:
            errors += 1
        for milestone in relationship["milestones"]:
            errors += int(not milestone.get("fact_refs") or not set(milestone["fact_refs"]).issubset(fact_ids))
    return errors


def audit(root: Path = ROOT) -> dict[str, Any]:
    facts = read_jsonl(root / "work/rebuild/r1c_vnext/pilot/reviewed_facts.jsonl")
    chronology = read_jsonl(root / "work/rebuild/r1c_vnext/pilot/projections/chronology.jsonl")
    character = read_jsonl(root / "work/rebuild/r1c_vnext/pilot/projections/character_facts.jsonl")
    sampling = read_json(root / "work/rebuild/r1c_vnext/sampling_manifest.json")
    reviews = read_jsonl(root / "work/rebuild/r1c_vnext/pilot/sample_reviews.jsonl")
    extraction = read_jsonl(root / "work/rebuild/r1c_vnext/pilot/extraction_a.jsonl")
    reviewer_b = read_jsonl(root / "work/rebuild/r1c_vnext/pilot/reviewer_b.jsonl")
    dispositions = read_jsonl(root / "work/rebuild/r1c_vnext/pilot/source_dispositions.jsonl")
    cases = read_jsonl(root / "work/rebuild/r1c_vnext/evaluation_cases.jsonl")
    baseline = read_json(root / "work/rebuild/r1c_vnext/baseline_manifest.json")

    fact_ids = {row["fact_id"] for row in facts}
    if len(fact_ids) != len(facts):
        raise AuditError("duplicate fact ids")
    locator_errors = sum(not _locator_ok(root, locator) for fact in facts for locator in fact["source_locators"])

    actual_refs = {row["fact_ref"] for row in chronology} | {row["fact_ref"] for row in character}
    dangling = actual_refs - fact_ids
    unsupported = len(dangling)
    expected_pairs = {(fact["fact_id"], profile) for fact in facts for profile in fact.get("projection_roles", {})}
    actual_pairs = {(row["fact_ref"], row["profile_id"]) for row in character}
    missing_pairs = expected_pairs - actual_pairs
    extra_pairs = actual_pairs - expected_pairs

    candidate_paths = sorted((root / "work/rebuild/r1c_vnext/pilot/candidates").glob("*.json"))
    candidates = [read_json(path) for path in candidate_paths]
    parent_errors = sum(_relationship_errors(candidate, fact_ids) for candidate in candidates)
    candidate_pairs = {
        (item["fact_ref"], candidate["profile_id"])
        for candidate in candidates for item in candidate.get("facts", [])
    }
    parent_errors += len(candidate_pairs ^ actual_pairs)

    dev_ids = {row["scene_group_id"] for row in sampling["development_windows"]}
    holdout_ids = {row["scene_group_id"] for row in sampling["holdout_windows"]}
    review_counter = Counter(row["set"] for row in reviews)
    reviewed_dev = {row["scene_group_id"] for row in reviews if row["set"] == "development"}
    reviewed_holdout = {row["scene_group_id"] for row in reviews if row["set"] == "holdout"}
    if reviewed_dev != dev_ids or reviewed_holdout != holdout_ids:
        raise AuditError("sample review/window mismatch")
    expected_scene_ids = dev_ids | holdout_ids
    if any({row["scene_group_id"] for row in collection} != expected_scene_ids for collection in (extraction, reviewer_b, dispositions)):
        raise AuditError("separated review surface mismatch")
    if any(row.get("review_order") != "SOURCE_FIRST_THEN_EXTRACTION" for row in reviewer_b):
        raise AuditError("reviewer B source-first order missing")

    prod_count, prod_hash = _production_fingerprint(root)
    if (prod_count, prod_hash) != (140, EXPECTED_PRODUCTION):
        raise AuditError(f"production drift: {prod_count}/{prod_hash}")
    if baseline["production"] != {"file_count": prod_count, "aggregate_sha256": prod_hash}:
        raise AuditError("baseline production fingerprint mismatch")
    frozen = baseline["frozen_inputs"]
    if frozen["expected"] != 488 or frozen["verified"] != 488 or frozen["bad"]:
        raise AuditError("frozen input mismatch")
    if len({row["historical_case_id"] for row in cases}) != 29:
        raise AuditError("historical evaluation case mismatch")

    result = {
        "status": "PASS",
        "facts": len(facts),
        "chronology_items": len(chronology),
        "character_projections": len(character),
        "unsupported_outputs": unsupported + len(extra_pairs),
        "missing_character_projections": len(missing_pairs),
        "dangling_fact_refs": len(dangling),
        "source_locator_errors": locator_errors,
        "parent_container_errors": parent_errors,
        "complete_parent_candidates": len(candidates),
        "historical_cases": 29,
        "evidence_anchored": sum(row["source_verification"].startswith("VERIFIED") for row in cases),
        "not_verified": sum(row["source_verification"] == "NOT_VERIFIED" for row in cases),
        "unresolved_source_questions": sum(row.get("story_truth_status") in {"INTERPRETIVE_HYPOTHESIS_REQUIRES_HUMAN", "NOT_ESTABLISHED_BY_REVIEWED_SOURCE"} for row in cases),
        "development_windows": len(dev_ids),
        "holdout_windows": len(holdout_ids),
        "development_reviews": review_counter["development"],
        "holdout_reviews": review_counter["holdout"],
        "review_isolation": sampling["review_isolation"],
        "split_leakage": len(sampling["split_leakage"]),
        "production": {"files": prod_count, "aggregate_sha256": prod_hash},
        "frozen_inputs": frozen["verified"],
    }
    if any(result[key] for key in ("unsupported_outputs", "missing_character_projections", "dangling_fact_refs", "source_locator_errors", "parent_container_errors", "split_leakage")):
        result["status"] = "FAIL"
    return result


def main() -> None:
    result = audit(ROOT)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    if result["status"] != "PASS":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
