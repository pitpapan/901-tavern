import importlib
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DECISIONS = ROOT / "work" / "remediation" / "r1a2" / "semantic_realization_decisions.jsonl"


class R1A2ARealizationSurfaceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.audit = importlib.import_module("scripts.audit_r1a2a_realizations")
        cls.records = cls.audit.build_ledger(ROOT, DECISIONS)
        cls.summary = cls.audit.summarize(cls.records)

    def test_exact_r1a1_identity_and_route_coverage(self):
        self.assertEqual(145, self.summary["semantic_identities"])
        self.assertEqual(145, self.summary["realization_covered"])
        self.assertEqual(0, self.summary["missing_identities"])
        self.assertEqual(0, self.summary["extra_identities"])
        self.assertEqual(0, self.summary["route_changes"])

    def test_every_destination_instance_is_explicit_and_unique(self):
        allowed_modes = {
            "REUSE_R2A_EVENT",
            "REUSE_EXISTING_ATOMIC_VALUE",
            "REVIEWED_TYPED_PAYLOAD_REQUIRED",
            "REALIZATION_UNRESOLVED",
        }
        seen = set()
        for record in self.records:
            self.assertTrue(record["destination_instances"])
            for instance in record["destination_instances"]:
                key = (
                    record["profile_id"],
                    record["old_claim_id"],
                    instance["destination_section"],
                    instance["destination_instance_key"],
                )
                self.assertNotIn(key, seen)
                seen.add(key)
                self.assertIn(instance["realization_mode"], allowed_modes)
                self.assertTrue(instance["source_refs"])
                self.assertIn("payload", instance)
        self.assertEqual(self.summary["destination_instances_required"], len(seen))
        self.assertEqual(len(seen), self.summary["destination_instances_realized"])

    def test_all_references_and_typed_payloads_validate(self):
        self.assertEqual(0, self.summary["unresolved_event_refs"])
        self.assertEqual(0, self.summary["unresolved_source_refs"])
        self.assertEqual(0, self.summary["typed_completeness_errors"])
        self.assertEqual(0, self.summary["atomicity_guard_errors"])
        self.assertEqual(0, self.summary["builder_inference_requirements"])
        self.assertEqual(0, self.summary["schema_realization_gaps"])

    def test_all_splits_and_known_blockers_are_sufficient(self):
        self.assertEqual(46, self.summary["split_required"])
        self.assertEqual(46, self.summary["split_realization_sufficient"])
        self.assertEqual(44, self.summary["known_initial_gap_records"])
        self.assertEqual(44, self.summary["known_initial_gaps_resolved"])

    def test_full_scope_was_reviewed(self):
        self.assertEqual(36, self.summary["multi_route_non_split_checked"])
        self.assertGreater(self.summary["single_route_checked"], 0)
        self.assertEqual(145, self.summary["full_sufficiency_checked"])
        self.assertEqual(0, self.summary["unresolved"])

    def test_two_event_only_splits_reuse_r2a_events(self):
        by_key = {
            (record["profile_id"], record["old_claim_id"]): record
            for record in self.records
        }
        expected = {
            ("NPC_HONDA_KAI_FERGUS", "CLAIM_HONDA_SANCTUARY_WAR"),
            ("PC_YU_LINFENG", "CLAIM_YU_LINFENG_DRAGON_SANCTUARY_HISTORY"),
        }
        for key in expected:
            instances = by_key[key]["destination_instances"]
            self.assertTrue(instances)
            self.assertEqual(
                {"REUSE_R2A_EVENT"},
                {instance["realization_mode"] for instance in instances},
            )

    def test_render_is_byte_deterministic_and_check_detects_drift(self):
        rendered = self.audit.render_ledger(self.records)
        self.assertEqual(
            rendered,
            self.audit.render_ledger(self.audit.build_ledger(ROOT, DECISIONS)),
        )
        for line in rendered.splitlines():
            self.assertIsInstance(json.loads(line), dict)
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "ledger.jsonl"
            output.write_text(rendered, encoding="utf-8", newline="\n")
            self.audit.write_or_check(output, rendered, check=True)
            output.write_text(rendered + "\n", encoding="utf-8", newline="\n")
            with self.assertRaisesRegex(ValueError, "does not match"):
                self.audit.write_or_check(output, rendered, check=True)


if __name__ == "__main__":
    unittest.main()
