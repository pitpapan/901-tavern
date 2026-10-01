import copy
import importlib
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def minimal_package(destination_id: str, include_milestone: bool = False) -> dict:
    milestones = []
    if include_milestone:
        milestones.append({"milestone_id": destination_id})
    return {
        "profile_id": "NPC_TEST",
        "old_claim_migrations": [{
            "old_claim_id": "CLAIM_TEST",
            "migration_status": "MOVED_TO_RELATIONSHIP",
            "destination_ids": [destination_id],
        }],
        "background_items": [],
        "profile_metadata": {"identity": {
            "public_identity": [],
            "durable_roles": [],
            "durable_affiliations": [],
        }},
        "persona": {},
        "goals": {},
        "timeline_items": [],
        "relationship_items": [{
            "relationship_id": "RELATIONSHIP_TEST",
            "relationship_milestones": milestones,
        }],
        "ability_status_items": [],
        "knowledge_items": [],
        "nonactual_projections": [],
        "rp_constraints": [],
        "gap_routing": [],
    }


class R1AFix1MigrationDestinationIntegrityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.serializer = importlib.import_module("scripts.r1a2b_realization_serializer")
        cls.preparer = importlib.import_module("scripts.prepare_phase3d_r2c_packages")

    def require_fix1_api(self) -> None:
        self.assertTrue(
            hasattr(self.serializer, "validate_migration_destination_references"),
            "R1A-FIX-1 destination resolver is not implemented",
        )
        self.assertTrue(
            hasattr(self.serializer, "load_high_risk_reroute_amendments"),
            "R1A-FIX-1 amendment authority is not implemented",
        )
        self.assertTrue(
            hasattr(self.serializer, "effective_high_risk_reroutes"),
            "R1A-FIX-1 effective high-risk authority is not implemented",
        )

    def test_nonexistent_relationship_milestone_destination_fails(self):
        self.require_fix1_api()
        package = minimal_package("MILESTONE_DOES_NOT_EXIST")
        with self.assertRaisesRegex(ValueError, "BLOCKED_BY_REFERENCE_DRIFT"):
            self.serializer.validate_migration_destination_references([package], {})

    def test_valid_local_relationship_milestone_destination_passes(self):
        self.require_fix1_api()
        package = minimal_package("MILESTONE_TEST", include_milestone=True)
        result = self.serializer.validate_migration_destination_references([package], {})
        self.assertEqual(1, result["rows_checked"])
        self.assertEqual(1, result["destinations_checked"])
        self.assertEqual(0, result["dangling"])

    def test_valid_external_r2a_event_reference_passes(self):
        self.require_fix1_api()
        package = minimal_package("EVENT_TEST")
        package["old_claim_migrations"][0]["migration_status"] = "MOVED_TO_TIMELINE"
        result = self.serializer.validate_migration_destination_references(
            [package], {"EVENT_TEST": {"event_id": "EVENT_TEST"}}
        )
        self.assertEqual(1, result["destinations_checked"])
        self.assertEqual(0, result["dangling"])

    def test_removing_a_real_destination_object_is_detected(self):
        self.require_fix1_api()
        package = minimal_package("MILESTONE_TEST", include_milestone=True)
        changed = copy.deepcopy(package)
        changed["relationship_items"][0]["relationship_milestones"] = []
        with self.assertRaisesRegex(ValueError, "MILESTONE_TEST"):
            self.serializer.validate_migration_destination_references([changed], {})

    def test_single_reviewed_amendment_replaces_only_the_dangling_destination(self):
        self.require_fix1_api()
        amendments = self.serializer.load_high_risk_reroute_amendments(ROOT)
        self.assertEqual(1, len(amendments.records))
        self.assertEqual("SUPERSEDED_BY_REVIEWED_ATOMIC_REALIZATIONS", amendments.records[0]["outcome"])
        effective = self.serializer.effective_high_risk_reroutes(amendments)
        self.assertEqual(16, len(effective))
        unchanged = [
            identity for identity, decision in self.serializer.EXPECTED_HIGH_RISK_REROUTES.items()
            if effective[identity] == decision
        ]
        self.assertEqual(15, len(unchanged))
        self.assertEqual(
            (
                "SPLIT",
                (
                    "TIMELINE_YOUYOU_P2_021_DRAGON_RITUAL_AND_ASSASSINATION",
                    "MILESTONE_CLAIM_YOUYOU_YU_LATE_MILESTONES_EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY_1",
                    "MILESTONE_CLAIM_YOUYOU_YU_LATE_MILESTONES_EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING_2",
                    "MILESTONE_CLAIM_YOUYOU_YU_LATE_MILESTONES_EVENT_P3_003_TEIRESIAS_REVELATION_3",
                    "MILESTONE_CLAIM_YOUYOU_YU_LATE_MILESTONES_EVENT_P3_009_DEATHWING_FINAL_WAR_4",
                ),
            ),
            effective[("NPC_YOUYOU", "CLAIM_YOUYOU_ENGAGEMENT_HISTORY")],
        )

    def test_all_production_migration_destinations_resolve(self):
        self.require_fix1_api()
        packages = self.preparer.prepare_all_packages(write=False)
        events, _ = self.preparer.event_catalog()
        result = self.serializer.validate_migration_destination_references(packages, events)
        self.assertEqual(304, result["rows_checked"])
        self.assertEqual(450, result["destinations_checked"])
        self.assertEqual(0, result["dangling"])

    def test_independent_r1a_final_logic_accepts_the_effective_amendment(self):
        audit = importlib.import_module("scripts.audit_r1a_final_independent")
        packages = {
            package["profile_id"]: package
            for package in self.preparer.prepare_all_packages(write=False)
        }
        events = {
            row["event_id"]: row for row in audit.read_jsonl(audit.CHRONOLOGY)
        }
        amendments = audit.read_jsonl(audit.R1A_FIX1)
        integrity = audit.independent_migration_destination_audit(packages, events)
        self.assertEqual(0, integrity["dangling"])
        effective = audit.effective_high_risk_authority(amendments)
        actual = {
            identity: (
                migration["migration_status"],
                tuple(migration["destination_ids"]),
            )
            for identity in effective
            for migration in packages[identity[0]]["old_claim_migrations"]
            if migration["old_claim_id"] == identity[1]
        }
        self.assertEqual(effective, actual)


if __name__ == "__main__":
    unittest.main()
