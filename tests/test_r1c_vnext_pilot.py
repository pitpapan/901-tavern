from __future__ import annotations

import copy
import importlib.util
import json
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts/r1c_vnext/pilot.py"


def load_module():
    spec = importlib.util.spec_from_file_location("r1c_vnext_pilot", MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class R1CVNextPilotTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mod = load_module()
        cls.index = cls.mod.build_source_index(ROOT)

    def test_source_index_uses_full_ledger_and_resolves_posts(self):
        self.assertEqual(2848, len(self.index["chunks"]))
        self.assertEqual({"P1", "P2", "P3"}, set(self.index["parts"]))
        self.assertEqual([], self.index["unresolved_documents"])

    def test_real_locator_round_trips_and_tamper_fails(self):
        locator = self.mod.locator_for_chunk(
            self.index, "SRC_P3_P004_POST_0039_1078852", "乳白色光芒"
        )
        self.mod.validate_locator(ROOT, locator)
        tampered = copy.deepcopy(locator)
        tampered["quote"] = "御临风明确选择第一条"
        with self.assertRaises(self.mod.ValidationError):
            self.mod.validate_locator(ROOT, tampered)

    def test_sampling_has_24_development_and_24_holdout_without_leakage(self):
        manifest = self.mod.build_sampling_manifest(self.index)
        self.assertEqual(24, len(manifest["development_windows"]))
        self.assertEqual(24, len(manifest["holdout_windows"]))
        self.assertEqual([], manifest["split_leakage"])
        dev_groups = {row["scene_group_id"] for row in manifest["development_windows"]}
        holdout_groups = {row["scene_group_id"] for row in manifest["holdout_windows"]}
        self.assertTrue(dev_groups.isdisjoint(holdout_groups))
        self.assertEqual("sequential_review", manifest["review_isolation"])

    def test_atomic_fact_dimensions_are_independent(self):
        fact = self.mod.example_fact(self.index)
        fact["reality_scope"] = "SPECIAL_INTERLUDE"
        fact["narrative_modality"] = "PLAN"
        fact["evidence_nature"] = "HEARSAY"
        self.mod.validate_atomic_fact(ROOT, fact)
        self.assertNotEqual(fact["reality_scope"], fact["narrative_modality"])
        self.assertNotEqual(fact["narrative_modality"], fact["evidence_nature"])

    def test_character_projection_requires_explicit_character_role(self):
        fact = self.mod.example_fact(self.index)
        with self.assertRaises(self.mod.ValidationError):
            self.mod.project_character_fact(fact, "NPC_UNRELATED")
        projected = self.mod.project_character_fact(fact, fact["subject_refs"][0])
        self.assertEqual(fact["fact_id"], projected["fact_ref"])
        self.assertNotIn("event_summary", projected)

    def test_relationship_parent_allows_reviewed_absent_baseline(self):
        relationship = {
            "relationship_id": "REL_PILOT_EVENT_ONLY",
            "target_ref": "NPC_TARGET",
            "baseline": None,
            "baseline_status": "NOT_ESTABLISHED",
            "current_stance": None,
            "milestones": [{"milestone_id": "M1", "fact_refs": ["F1"]}],
        }
        self.mod.validate_relationship(relationship, {"F1"})

    def test_relationship_parent_rejects_fabricated_empty_baseline(self):
        relationship = {
            "relationship_id": "REL_PILOT_BAD",
            "target_ref": "NPC_TARGET",
            "baseline": "双方存在某种关系。",
            "baseline_status": "ESTABLISHED",
            "current_stance": None,
            "milestones": [{"milestone_id": "M1", "fact_refs": ["F1"]}],
            "baseline_fact_refs": [],
        }
        with self.assertRaises(self.mod.ValidationError):
            self.mod.validate_relationship(relationship, {"F1"})

    def test_all_required_mutations_are_detected(self):
        results = self.mod.run_mutation_tests(self.index)
        expected = {
            "missing_destination",
            "wrong_subject",
            "preference_to_decision",
            "prediction_to_fact",
            "testimony_to_objective_history",
            "speaker_subject_swap",
            "second_topic_omitted",
            "healing_plan_to_completed",
            "historical_state_extended_to_d3",
            "dream_leakage",
            "question_or_condition_to_fact",
            "forged_source_locator",
            "duplicate_source_not_independent_evidence",
            "json_key_reorder_semantically_equal",
        }
        self.assertEqual(expected, set(results))
        self.assertTrue(all(results.values()))

    def test_evaluation_records_replace_placeholder_relevance_sources(self):
        cases = self.mod.build_evaluation_cases(ROOT, self.index)
        historical = {row["historical_case_id"] for row in cases}
        self.assertEqual(29, len(historical))
        relevance = [row for row in cases if row["historical_case_id"].startswith("R2C_RELEVANCE_")]
        self.assertEqual(5, len(relevance))
        for row in relevance:
            serialized = json.dumps(row, ensure_ascii=False)
            self.assertNotIn("registered source chunks", serialized)
            self.assertNotIn("raw source scenes cited", serialized)
            self.assertTrue(row["specific_incorrect_outputs"])
            self.assertTrue(row["source_assertions"])

    def test_pilot_outputs_validate_bidirectionally(self):
        authored = self.mod.load_authored_pilot(ROOT)
        derived = self.mod.derive_pilot(authored)
        result = self.mod.validate_pilot(ROOT, authored, derived)
        self.assertEqual(0, result["unsupported_outputs"])
        self.assertEqual(0, result["missing_required_projections"])
        self.assertEqual(0, result["character_relevance_errors"])
        self.assertEqual(0, result["parent_container_errors"])
        self.assertGreaterEqual(result["complete_parent_candidates"], 3)

    def test_chinese_readable_projection_is_not_a_technical_dump(self):
        files = self.mod.build_all(ROOT, write=False)
        result = self.mod.validate_readability_outputs(files)
        self.assertEqual(0, result["event_id_headings"])
        self.assertEqual(0, result["claim_id_headings"])
        self.assertEqual(0, result["raw_json_blocks"])
        self.assertEqual(0, result["raw_null_stance"])
        self.assertEqual(0, result["english_dominant_bodies"])

    def test_build_is_deterministic_and_does_not_touch_production(self):
        before = self.mod.production_fingerprint(ROOT)
        first = self.mod.build_all(ROOT, write=False)
        second = self.mod.build_all(ROOT, write=False)
        after = self.mod.production_fingerprint(ROOT)
        self.assertEqual(first, second)
        self.assertEqual(before, after)
        self.assertEqual(140, before["file_count"])
        self.assertEqual(
            "cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3",
            before["aggregate_sha256"],
        )
        extraction = [json.loads(line) for line in first["pilot/extraction_a.jsonl"].decode("utf-8").splitlines()]
        reviewer = [json.loads(line) for line in first["pilot/reviewer_b.jsonl"].decode("utf-8").splitlines()]
        dispositions = [json.loads(line) for line in first["pilot/source_dispositions.jsonl"].decode("utf-8").splitlines()]
        self.assertEqual(48, len(extraction))
        self.assertEqual(48, len(reviewer))
        self.assertEqual(48, len(dispositions))
        self.assertTrue(all(row["review_order"] == "SOURCE_FIRST_THEN_EXTRACTION" for row in reviewer))


if __name__ == "__main__":
    unittest.main()
