import importlib
import json
import tempfile
import unittest
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DECISIONS = (
    ROOT
    / "work"
    / "remediation"
    / "r1a2a1"
    / "relationship_container_decisions.jsonl"
)


class R1A2A1RelationshipContainerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.audit = importlib.import_module(
            "scripts.audit_r1a2a1_relationship_containers"
        )
        cls.records = cls.audit.build_ledger(ROOT, DECISIONS)
        cls.summary = cls.audit.summarize(cls.records)

    def test_exact_seven_pair_authority(self):
        self.assertEqual(7, self.summary["blocked_pairs"])
        self.assertEqual(7, self.summary["reviewed_decisions"])
        self.assertEqual(0, self.summary["missing_pairs"])
        self.assertEqual(0, self.summary["extra_pairs"])
        self.assertEqual(0, self.summary["duplicate_pairs"])

    def test_all_twenty_reviewed_milestones_are_assigned_once(self):
        self.assertEqual(20, self.summary["expected_milestones"])
        self.assertEqual(20, self.summary["assigned_exactly_once"])
        self.assertEqual(0, self.summary["missing_milestones"])
        self.assertEqual(0, self.summary["extra_milestones"])
        self.assertEqual(0, self.summary["duplicate_milestone_assignments"])

    def test_frozen_schema_resolves_every_container(self):
        self.assertEqual(7, self.summary["resolved_under_frozen_schema"])
        self.assertEqual(0, self.summary["schema_gaps_confirmed"])
        self.assertEqual(7, self.summary["complete_relationship_records_passed"])
        self.assertEqual(0, self.summary["complete_relationship_records_failed"])
        self.assertEqual(0, self.summary["runtime_container_inference_required"])

    def test_reviewed_action_counts(self):
        self.assertEqual(
            {
                "USE_EXISTING_CONTAINER": 2,
                "CREATE_REVIEWED_CONTAINER": 5,
            },
            dict(Counter(record["container_action"] for record in self.records)),
        )

    def test_every_resolved_record_has_complete_lineage_and_exact_target(self):
        for record in self.records:
            self.assertEqual(
                record["target_profile_id"],
                record["complete_relationship_record"]["related_character_ref"],
            )
            self.assertEqual(
                record["selected_or_new_container_id"],
                record["complete_relationship_record"]["relationship_id"],
            )
            self.assertTrue(record["relationship_baseline_provenance"])
            self.assertTrue(record["source_refs"])
            self.assertEqual("PASS", record["schema_validation_status"])
            self.assertIsNone(record["current_stance"])

    def test_pc_control_boundary_is_explicit(self):
        pc_records = [
            record
            for record in self.records
            if record["profile_id"] == "PC_YU_LINFENG"
            or record["target_profile_id"] == "PC_YU_LINFENG"
        ]
        self.assertEqual(4, len(pc_records))
        for record in pc_records:
            self.assertEqual("PRESERVED", record["pc_control_boundary_status"])
            self.assertIsNone(record["current_stance"])

    def test_render_is_byte_deterministic_and_check_detects_drift(self):
        rendered = self.audit.render_ledger(self.records)
        self.assertEqual(
            rendered,
            self.audit.render_ledger(self.audit.build_ledger(ROOT, DECISIONS)),
        )
        for line in rendered.splitlines():
            self.assertIsInstance(json.loads(line), dict)
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "relationship_container_ledger.jsonl"
            output.write_text(rendered, encoding="utf-8", newline="\n")
            self.audit.write_or_check(output, rendered, check=True)
            output.write_text(rendered + "\n", encoding="utf-8", newline="\n")
            with self.assertRaisesRegex(ValueError, "does not match"):
                self.audit.write_or_check(output, rendered, check=True)

    def test_validator_rejects_coverage_assignment_and_schema_drift(self):
        decisions = [
            json.loads(line)
            for line in DECISIONS.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]

        def write(records, directory, name):
            path = Path(directory) / name
            path.write_text(
                "".join(
                    json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n"
                    for record in records
                ),
                encoding="utf-8",
                newline="\n",
            )
            return path

        with tempfile.TemporaryDirectory() as temporary:
            missing = write(decisions[:-1], temporary, "missing.jsonl")
            with self.assertRaisesRegex(ValueError, "coverage mismatch"):
                self.audit.build_ledger(ROOT, missing)

            duplicate = write(decisions + [decisions[0]], temporary, "duplicate.jsonl")
            with self.assertRaisesRegex(ValueError, "duplicate.*decision"):
                self.audit.build_ledger(ROOT, duplicate)

            assignment_drift = json.loads(json.dumps(decisions, ensure_ascii=False))
            assignment_drift[0]["milestone_instance_keys"] = ["EVENT_NOT_REVIEWED"]
            assignment = write(assignment_drift, temporary, "assignment.jsonl")
            with self.assertRaisesRegex(ValueError, "milestone-set mismatch"):
                self.audit.build_ledger(ROOT, assignment)

            invalid_baseline = json.loads(json.dumps(decisions, ensure_ascii=False))
            invalid_baseline[0]["relationship_baseline_payload"][
                "relationship_baseline"
            ] = ""
            invalid = write(invalid_baseline, temporary, "invalid-baseline.jsonl")
            with self.assertRaisesRegex(ValueError, "complete RelationshipRecord invalid"):
                self.audit.build_ledger(ROOT, invalid)

            ambiguous_inventory = json.loads(json.dumps(decisions, ensure_ascii=False))
            ambiguous_inventory[5]["existing_container_candidates"][1][
                "baseline"
            ] = "unsupported replacement"
            ambiguous = write(
                ambiguous_inventory, temporary, "ambiguous-inventory.jsonl"
            )
            with self.assertRaisesRegex(ValueError, "does not match R1A2A authority"):
                self.audit.build_ledger(ROOT, ambiguous)


if __name__ == "__main__":
    unittest.main()
