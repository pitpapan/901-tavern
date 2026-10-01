import copy
import ast
import importlib
import unittest
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class R1A2BRealizationSerializerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.serializer = importlib.import_module("scripts.r1a2b_realization_serializer")
        cls.authority = cls.serializer.load_realization_authority(ROOT)
        cls.container_authority = cls.serializer.load_relationship_container_authority(ROOT)
        cls.authority_stack = cls.serializer.load_authority_stack(ROOT)
        cls.preparer = importlib.import_module("scripts.prepare_phase3d_r2c_packages")

    def test_authority_preflight_matches_the_frozen_review_surface(self):
        summary = self.authority.summary
        self.assertEqual(145, summary["r1a1_identities"])
        self.assertEqual(145, summary["r1a2a_identities"])
        self.assertEqual(275, summary["destination_instances"])
        self.assertEqual(0, summary["authority_mismatches"])
        self.assertEqual(0, summary["unresolved_event_refs"])
        self.assertEqual(0, summary["unresolved_source_refs"])
        self.assertEqual(
            {
                "REUSE_R2A_EVENT": 105,
                "REUSE_EXISTING_ATOMIC_VALUE": 32,
                "REVIEWED_TYPED_PAYLOAD_REQUIRED": 138,
            },
            summary["realization_modes"],
        )

    def test_authority_rejects_missing_and_duplicate_instances(self):
        records = copy.deepcopy(self.authority.records)
        records[0]["destination_instances"] = []
        with self.assertRaisesRegex(ValueError, "missing required destination instance"):
            self.serializer.validate_realization_records(ROOT, records)

        records = copy.deepcopy(self.authority.records)
        records[0]["destination_instances"].append(copy.deepcopy(records[0]["destination_instances"][0]))
        with self.assertRaisesRegex(ValueError, "duplicate destination-instance key"):
            self.serializer.validate_realization_records(ROOT, records)

    def test_every_audited_claim_is_available_by_exact_identity(self):
        self.assertEqual(145, len(self.authority.by_identity))
        for record in self.authority.records:
            key = (record["profile_id"], record["old_claim_id"])
            self.assertIs(record, self.authority.by_identity[key])

    def test_relationship_population_and_split_population_are_frozen(self):
        relationship_records = [
            record
            for record in self.authority.records
            if record["cohort"] == "RELATIONSHIP_ESTABLISHED_HISTORY"
        ]
        self.assertEqual(29, len(relationship_records))
        self.assertEqual(46, sum(record["split_required"] for record in self.authority.records))

    def test_route_and_mode_counts_come_from_exact_instances(self):
        modes = Counter(
            instance["realization_mode"]
            for record in self.authority.records
            for instance in record["destination_instances"]
        )
        self.assertEqual(self.authority.summary["realization_modes"], dict(modes))

    def test_relationship_container_authority_is_complete_and_exact(self):
        summary = self.container_authority.summary
        self.assertEqual(7, summary["container_decisions"])
        self.assertEqual(20, summary["milestone_assignments"])
        self.assertEqual(5, summary["create_reviewed_container"])
        self.assertEqual(2, summary["use_existing_container"])
        self.assertEqual(0, summary["merge_reviewed_existing_containers"])
        self.assertEqual(0, summary["schema_gaps"])
        self.assertEqual(0, summary["runtime_container_inference"])
        self.assertEqual(7, len(self.container_authority.by_pair))
        self.assertEqual(20, len(self.container_authority.by_milestone_key))

    def test_complete_authority_stack_hashes_are_pinned(self):
        self.assertEqual(
            {
                "r1a1": "4db290bbb287a28576b8e84bf8e399eb6db3a37d1acb6935da56cee1ad76a8b7",
                "r1a2a_decisions": "d5f53cad4ebb2068e460e8b13bc49d712e4d393b6b309eae491ce7109cd2c40d",
                "r1a2a_ledger": "0000abfd6cbb6946ae5bbcb50875c69fc4c17a4f0960ed3bec031bad0613e66b",
                "r1a2a1_ledger": "bc426551e4438b59d96ed43ffb8d3870eca7f70974cfce8ce2e97f57086682e1",
                "r1a_fix1_amendments": "b6e3e29da8aa3f7a9f4c22c931fed2c84c56b414e6fac9d59a691f1786724817",
            },
            self.authority_stack.authority_hashes,
        )
        self.assertEqual(0, self.authority_stack.authority_mismatches)

    def test_container_authority_rejects_duplicate_assignment_and_incomplete_record(self):
        records = copy.deepcopy(self.container_authority.records)
        records[0]["assigned_milestones"].append(
            copy.deepcopy(records[0]["assigned_milestones"][0])
        )
        with self.assertRaisesRegex(ValueError, "duplicate.*milestone assignment"):
            self.serializer.validate_relationship_container_records(ROOT, records)

        records = copy.deepcopy(self.container_authority.records)
        records[0]["complete_relationship_record"]["relationship_baseline"] = ""
        with self.assertRaisesRegex(ValueError, "complete RelationshipRecord invalid"):
            self.serializer.validate_relationship_container_records(ROOT, records)

    def test_container_authority_has_exact_seven_pairs(self):
        expected = {
            ("NPC_HONDA_KAI_FERGUS", "NPC_YOUYOU"),
            ("NPC_JIANG_ZIYOU", "NPC_CASSIUS_BRIGHT"),
            ("NPC_KENDA_KAI_FERGUS", "PC_YU_LINFENG"),
            ("NPC_LULUTIYE", "NPC_YOUYOU"),
            ("NPC_XIERLUN_VON_GILCODE", "PC_YU_LINFENG"),
            ("NPC_YOUYOU", "PC_YU_LINFENG"),
            ("PC_YU_LINFENG", "NPC_YOUYOU"),
        }
        self.assertEqual(expected, set(self.container_authority.by_pair))

    def test_production_preflight_realizes_exact_reviewed_relationship_containers(self):
        packages = {
            package["profile_id"]: package
            for package in self.preparer.prepare_all_packages(write=False)
        }
        for pair, decision in self.container_authority.by_pair.items():
            profile_id, target_profile_id = pair
            relationships = packages[profile_id]["relationship_items"]
            selected = [
                item
                for item in relationships
                if item["relationship_id"] == decision["selected_or_new_container_id"]
            ]
            self.assertEqual(1, len(selected), pair)
            self.assertEqual(target_profile_id, selected[0]["related_character_ref"])
            self.assertIsNone(selected[0]["current_stance"])
            assigned_ids = {
                assignment["milestone"]["milestone_id"]
                for assignment in decision["assigned_milestones"]
            }
            selected_ids = {
                milestone["milestone_id"]
                for milestone in selected[0]["relationship_milestones"]
            }
            self.assertTrue(assigned_ids <= selected_ids, pair)
            for other in relationships:
                if other["relationship_id"] == selected[0]["relationship_id"]:
                    continue
                other_ids = {
                    milestone["milestone_id"]
                    for milestone in other["relationship_milestones"]
                }
                self.assertFalse(assigned_ids & other_ids, (pair, other["relationship_id"]))
            if decision["container_action"] == "CREATE_REVIEWED_CONTAINER":
                self.assertEqual(decision["complete_relationship_record"], selected[0])

        self.assertIn(
            "RELATIONSHIP_PC_YU_LINFENG_CLAIM_YOUYOU_YU_LATE_MILESTONES_PC_YU_LINFENG",
            {
                item["relationship_id"]
                for item in packages["NPC_YOUYOU"]["relationship_items"]
            },
        )
        self.assertTrue(
            {
                "RELATIONSHIP_NPC_YOUYOU_CLAIM_YU_LINFENG_ENGAGEMENT_HISTORY_NPC_YOUYOU",
                "RELATIONSHIP_NPC_YOUYOU_CLAIM_YU_LINFENG_YOUYOU_LATE_HISTORY_NPC_YOUYOU",
            }
            <= {
                item["relationship_id"]
                for item in packages["PC_YU_LINFENG"]["relationship_items"]
            }
        )

    def test_every_generated_relationship_validates_as_complete_parent_record(self):
        schema = self.serializer.load_json(
            ROOT / "work/phase3d_r2c/schemas/character_profile_v2.schema.json"
        )["$defs"]["RelationshipRecord"]
        for package in self.preparer.prepare_all_packages(write=False):
            for relationship in package["relationship_items"]:
                self.assertEqual(
                    [],
                    self.serializer._schema_errors(relationship, schema),
                    (package["profile_id"], relationship["relationship_id"]),
                )

    def test_independent_actual_inventory_is_bidirectionally_equal(self):
        packages = self.preparer.prepare_all_packages(write=False)
        summary = self.serializer.compare_authority_inventories(
            packages, self.authority_stack
        )
        self.assertEqual(275, summary["expected_claim_instances"])
        self.assertEqual(275, summary["actual_claim_instances"])
        self.assertEqual(0, summary["missing_claim_instances"])
        self.assertEqual(0, summary["unauthorized_extra_claim_instances"])
        self.assertEqual(0, summary["unauthorized_extra_objects"])
        self.assertEqual(5, summary["classification_counts"]["R1A2A1_AUTHORIZED_CONTAINER"])
        self.assertEqual(20, summary["classification_counts"]["R1A2A_AUTHORIZED_REALIZATION"])
        self.assertEqual(2, summary["classification_counts"]["PRE_EXISTING_AUTHORIZED_OBJECT"])

    def test_actual_inventory_rejects_unreviewed_destination_and_container_object(self):
        packages = self.preparer.prepare_all_packages(write=False)
        changed = copy.deepcopy(packages)
        audited = next(
            migration
            for package in changed
            if package["profile_id"] == "NPC_AINZ_OOAL_GOWN"
            for migration in package["old_claim_migrations"]
            if migration["old_claim_id"] == "CLAIM_AINZ_OOAL_GOWN_HISTORY_1"
        )
        audited["destination_ids"].append("UNREVIEWED_DESTINATION")
        with self.assertRaisesRegex(ValueError, "BLOCKED_BY_UNAUTHORIZED_EXTRA_OBJECT"):
            self.serializer.compare_authority_inventories(changed, self.authority_stack)

        changed = copy.deepcopy(packages)
        honda = next(
            package for package in changed if package["profile_id"] == "NPC_HONDA_KAI_FERGUS"
        )
        container = next(
            item for item in honda["relationship_items"]
            if item["relationship_id"] == "RELATIONSHIP_HONDA_KAI_FERGUS_YOUYOU"
        )
        extra = copy.deepcopy(container["relationship_milestones"][0])
        extra["milestone_id"] += "_UNREVIEWED"
        container["relationship_milestones"].append(extra)
        with self.assertRaisesRegex(ValueError, "BLOCKED_BY_UNAUTHORIZED_EXTRA_OBJECT"):
            self.serializer.compare_authority_inventories(changed, self.authority_stack)

    def test_sixteen_high_risk_reroutes_are_effective_after_one_reviewed_amendment(self):
        packages = self.preparer.prepare_all_packages(write=False)
        actual = {
            (package["profile_id"], migration["old_claim_id"]): (
                migration["migration_status"], tuple(migration["destination_ids"])
            )
            for package in packages
            for migration in package["old_claim_migrations"]
            if (package["profile_id"], migration["old_claim_id"])
            in self.serializer.EXPECTED_HIGH_RISK_REROUTES
        }
        expected = self.serializer.effective_high_risk_reroutes(
            self.authority_stack.high_risk_reroute_amendments
        )
        self.assertEqual(expected, actual)
        self.assertEqual(16, len(actual))
        self.assertEqual(
            15,
            sum(
                actual[identity] == decision
                for identity, decision in self.serializer.EXPECTED_HIGH_RISK_REROUTES.items()
            ),
        )

    def test_runtime_has_no_semantic_heuristic_or_fallback_hooks(self):
        audit = self.serializer.audit_runtime_semantic_heuristics(ROOT)
        self.assertEqual(10, len(audit))
        self.assertEqual({0}, set(audit.values()))

    def test_production_path_does_not_import_the_one_shot_materializer(self):
        for relative in (
            "scripts/r1a2b_realization_serializer.py",
            "scripts/prepare_phase3d_r2c_packages.py",
            "scripts/build_phase3d_r2c.py",
        ):
            tree = ast.parse((ROOT / relative).read_text(encoding="utf-8"))
            imports = []
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    imports.extend(alias.name for alias in node.names)
                elif isinstance(node, ast.ImportFrom) and node.module:
                    imports.append(node.module)
            self.assertFalse(
                any(
                    name.endswith("materialize_r1a2a_reviewed_decisions")
                    or name.endswith("audit_r1a2a1_relationship_containers")
                    for name in imports
                ),
                relative,
            )


if __name__ == "__main__":
    unittest.main()
