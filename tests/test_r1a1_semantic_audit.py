import importlib
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DECISIONS = ROOT / "work" / "remediation" / "r1a1" / "semantic_adjudication_decisions.jsonl"


class R1A1SemanticAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.audit = importlib.import_module("scripts.audit_r1a1_semantic_routes")
        cls.records = cls.audit.build_ledger(ROOT, DECISIONS)
        cls.by_id = {record["old_claim_id"]: record for record in cls.records}

    def test_exposure_matches_accepted_r1a0_population(self):
        summary = self.audit.summarize(self.records)
        self.assertEqual(145, summary["records_total"])
        self.assertEqual(116, summary["identity_records"])
        self.assertEqual(29, summary["relationship_records"])
        self.assertEqual(35, summary["profiles_total"])

    def test_ledger_is_complete_sorted_and_deterministic(self):
        keys = [
            (
                record["profile_id"],
                record["cohort"],
                record["legacy_source_section"],
                record["old_claim_id"],
            )
            for record in self.records
        ]
        self.assertEqual(sorted(keys), keys)
        rendered = self.audit.render_ledger(self.records)
        self.assertEqual(rendered, self.audit.render_ledger(self.audit.build_ledger(ROOT, DECISIONS)))
        for line in rendered.splitlines():
            self.assertIsInstance(json.loads(line), dict)

    def test_representative_identity_adjudications_are_source_derived(self):
        expected = {
            "CLAIM_AINZ_CASSANDRA_NEGOTIATION": (
                "CAMPAIGN_EVENT",
                "EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION",
            ),
            "CLAIM_AINZ_OOAL_GOWN_HISTORY_1": (
                "CAMPAIGN_EVENT",
                "EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY",
            ),
            "CLAIM_BRIGHT_BACKGROUND": ("BACKGROUND_VALID", None),
            "CLAIM_BRIGHT_EARLY_CAMPAIGN": (
                "CAMPAIGN_EVENT",
                "EVENT_P1_013_SPLIT_RECONNAISSANCE_SPACE_DRAGON",
            ),
            "CLAIM_CASSANDRA_HISTORY_1": (
                "CAMPAIGN_EVENT",
                "EVENT_P3_008_FATE_BRANCH_SELECTION",
            ),
            "CLAIM_EMPEROR_CURSE_RULING": (
                "CAMPAIGN_EVENT",
                "EVENT_P1_019_XUE_REBUKE_AND_TRANSFER_DECISION",
            ),
            "CLAIM_GREMLIN_HISTORY_3": (
                "CAMPAIGN_EVENT",
                "EVENT_P3_002_SANCTUARY_ENTRY",
            ),
        }
        for claim_id, (category, event_ref) in expected.items():
            with self.subTest(claim_id=claim_id):
                record = self.by_id[claim_id]
                self.assertEqual(category, record["adjudication_category"])
                if event_ref:
                    self.assertIn(event_ref, record["relevant_r2a_event_refs"])
                else:
                    self.assertEqual([], record["relevant_r2a_event_refs"])

    def test_relationship_path_records_both_generated_targets(self):
        record = self.by_id["CLAIM_CASSIUS_BRIGHT_RELATIONSHIP"]
        self.assertEqual("RELATIONSHIP_ESTABLISHED_HISTORY", record["cohort"])
        self.assertEqual("MOVED_TO_RELATIONSHIP", record["current_r2c_migration"])
        self.assertIn("MILESTONE_CASSIUS_BRIGHT_RELATIONSHIP", record["current_generated_targets"])
        self.assertIn("BACKGROUND_REL_CASSIUS_BRIGHT_RELATIONSHIP", record["current_generated_targets"])
        self.assertEqual("RELATIONSHIP_EVENT", record["adjudication_category"])

    def test_decisions_are_resolved_but_remain_provisional_for_human_review(self):
        self.assertFalse(any(record["adjudication_category"] == "UNRESOLVED" for record in self.records))
        self.assertTrue(all(record["human_semantic_review_required"] for record in self.records))

    def test_intended_routes_name_existing_r2c_semantic_sections(self):
        allowed = {
            "biographical_background",
            "campaign_timeline",
            "identity.public_identity",
            "identity.durable_roles",
            "identity.durable_affiliations",
            "persona.core_personality",
            "persona.values",
            "relationships[].relationship_baseline",
            "relationships[].relationship_milestones",
            "ability_status_transitions",
            "knowledge_timeline",
        }
        for record in self.records:
            with self.subTest(old_claim_id=record["old_claim_id"]):
                self.assertTrue(set(record["intended_semantic_route"]) <= allowed)

    def test_campaign_event_decisions_preserve_an_event_route(self):
        for record in self.records:
            if record["adjudication_category"] != "CAMPAIGN_EVENT":
                continue
            with self.subTest(old_claim_id=record["old_claim_id"]):
                self.assertIn("campaign_timeline", record["intended_semantic_route"])
                self.assertTrue(record["relevant_r2a_event_refs"])

    def test_other_primary_categories_have_compatible_routes(self):
        required_route = {
            "BACKGROUND_VALID": "biographical_background",
            "RELATIONSHIP_EVENT": "relationships[].relationship_milestones",
        }
        for record in self.records:
            category = record["adjudication_category"]
            with self.subTest(old_claim_id=record["old_claim_id"]):
                if category in required_route:
                    self.assertIn(required_route[category], record["intended_semantic_route"])
                if category == "RELATIONSHIP_EVENT":
                    self.assertTrue(record["relevant_r2a_event_refs"])
                if category == "SPLIT_EVENT_AND_STATE":
                    self.assertTrue(record["split_required"])
                    self.assertGreaterEqual(len(record["intended_semantic_route"]), 2)

    def test_cli_check_detects_byte_drift_without_mutating_output(self):
        rendered = self.audit.render_ledger(self.records)
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "ledger.jsonl"
            output.write_text(rendered, encoding="utf-8", newline="\n")
            before = output.read_bytes()
            self.audit.write_or_check(output, rendered, check=True)
            self.assertEqual(before, output.read_bytes())
            output.write_text(rendered + "\n", encoding="utf-8", newline="\n")
            with self.assertRaisesRegex(ValueError, "does not match"):
                self.audit.write_or_check(output, rendered, check=True)


if __name__ == "__main__":
    unittest.main()
