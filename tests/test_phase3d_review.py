import hashlib
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "work" / "phase3d_review_manifest.json"
PREFLIGHT = ROOT / "work" / "phase3d_preflight.md"
APPROVED_DIR = ROOT / "work" / "phase3d" / "approved_candidates"
REVIEW_DIR = ROOT / "work" / "phase3d" / "reviews"
APPROVAL_MANIFEST = ROOT / "work" / "phase3d_approval_manifest.md"
FINAL_REPORT = ROOT / "work" / "phase3d_review.md"


class Phase3DPreflightTests(unittest.TestCase):
    def test_manifest_has_exact_review_population_and_unique_mappings(self):
        self.assertTrue(MANIFEST.is_file(), "Phase 3D manifest must be generated")
        payload = json.loads(MANIFEST.read_text(encoding="utf-8"))
        profiles = payload["profiles"]
        self.assertEqual(len(profiles), 36)
        self.assertEqual(sum(row["profile_kind"] == "npc" for row in profiles), 35)
        self.assertEqual(sum(row["profile_kind"] == "pc_continuity" for row in profiles), 1)
        self.assertEqual(len({row["profile_id"] for row in profiles}), 36)
        self.assertEqual(len({row["worldbook_id"] for row in profiles}), 36)
        pc = [row for row in profiles if row["profile_kind"] == "pc_continuity"]
        self.assertEqual([row["profile_id"] for row in pc], ["PC_YU_LINFENG"])
        self.assertEqual([row["worldbook_id"] for row in pc], ["CHARACTER_YU_LINFENG"])

    def test_manifest_resolves_candidate_evidence_and_draft_patch_paths(self):
        payload = json.loads(MANIFEST.read_text(encoding="utf-8"))
        patch_ids = set()
        for row in payload["profiles"]:
            for field in ("candidate_path", "evidence_packet_path", "draft_patch_path"):
                path = ROOT / row[field]
                self.assertTrue(path.is_file(), f"{row['profile_id']} missing {field}: {path}")
            patch = json.loads((ROOT / row["draft_patch_path"]).read_text(encoding="utf-8"))
            self.assertEqual(patch["target_id"], row["profile_id"])
            self.assertEqual(patch["operation"], "add")
            self.assertEqual(patch["status"], "draft")
            self.assertNotIn("approval", patch)
            self.assertNotIn("application", patch)
            patch_ids.add(patch["patch_id"])
        self.assertEqual(len(patch_ids), 36)

    def test_protected_hash_manifest_covers_all_frozen_phase3_artifacts(self):
        payload = json.loads(MANIFEST.read_text(encoding="utf-8"))
        protected = payload["protected_files"]
        required_exact = {
            "output/worldbook_source.jsonl",
            "current_state.md",
            "work/phase3a_review.md",
            "work/phase3a_field_mapping.md",
            "work/phase3b_review.md",
            "work/phase3b_profile_quality_review.md",
            "work/phase3b_runtime_projection_dryrun.md",
            "work/phase3c_review.md",
            "work/phase3c_inventory.md",
            "work/phase3c_profile_quality_review.md",
            "work/phase3c_runtime_projection_dryrun.md",
        }
        self.assertTrue(required_exact.issubset(protected))
        self.assertEqual(len([p for p in protected if p.startswith("work/phase3b/prototypes/")]), 5)
        self.assertEqual(len([p for p in protected if p.startswith("work/phase3b/evidence/")]), 5)
        self.assertEqual(len([p for p in protected if p.startswith("work/phase3c/profiles/")]), 31)
        self.assertEqual(len([p for p in protected if p.startswith("work/phase3c/evidence/")]), 31)
        self.assertEqual(len([p for p in protected if p.startswith("work/phase3c/batches/")]), 10)
        for relative, expected in protected.items():
            actual = hashlib.sha256((ROOT / relative).read_bytes()).hexdigest().upper()
            self.assertEqual(actual, expected, relative)

    def test_preflight_report_exists_and_states_pending_integration_boundary(self):
        self.assertTrue(PREFLIGHT.is_file(), "Phase 3D preflight report must be generated")
        text = PREFLIGHT.read_text(encoding="utf-8")
        self.assertIn("36", text)
        self.assertIn("35 NPC", text)
        self.assertIn("1 PC", text)
        self.assertIn("READY_FOR_HUMAN_APPROVAL", text)
        self.assertIn("formal integration", text)


class Phase3DSemanticReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.candidates = {
            path.stem: json.loads(path.read_text(encoding="utf-8"))
            for path in sorted(APPROVED_DIR.glob("*.json"))
        }

    def test_every_frozen_profile_has_one_separate_reviewed_candidate_and_review(self):
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        expected = {row["profile_id"] for row in manifest["profiles"]}
        self.assertEqual(set(self.candidates), expected)
        self.assertEqual({path.stem.removesuffix("_review") for path in REVIEW_DIR.glob("*_review.md")}, expected)
        for row in manifest["profiles"]:
            original = ROOT / row["candidate_path"]
            self.assertEqual(hashlib.sha256(original.read_bytes()).hexdigest().upper(), row["candidate_sha256"])

    def test_known_overstatement_and_provenance_patterns_are_corrected(self):
        ainz = self.candidates["NPC_AINZ_OOAL_GOWN"]
        self.assertNotIn(
            "CLAIM_AINZ_OOAL_GOWN_HISTORY_2",
            {claim["claim_id"] for claim in ainz["identity"]["established_history"]},
        )
        self.assertTrue(any("长期关系" in gap and "未" in gap for gap in ainz["evidence_gaps"]))

        deathwing = self.candidates["NPC_DEATHWING"]
        self.assertNotIn(
            "CLAIM_DEATHWING_HISTORY_2",
            {claim["claim_id"] for claim in deathwing["identity"]["established_history"]},
        )
        self.assertTrue(any("永久死亡" in item["constraint"] for item in deathwing["rp_constraints"]))

        xierlun = self.candidates["NPC_XIERLUN_VON_GILCODE"]
        self.assertEqual(xierlun["presence"]["life_status"], "unknown")
        self.assertEqual(xierlun["canon_layers"], ["original_campaign"])
        self.assertEqual(xierlun["presence"]["realm_scope"], ["original_campaign"])
        self.assertNotIn("transition", xierlun["provenance"]["canon_origin"])
        self.assertTrue(any("D3" in gap and "存活" in gap and "未确认" in gap for gap in xierlun["evidence_gaps"]))

    def test_event_actions_are_not_mislabeled_as_durable_identity_or_relationship_role(self):
        moved = {
            "NPC_MU_SHAOAI": "CLAIM_MU_SHAOAI_IDENTITY",
            "NPC_JEWEL_ELDER": "CLAIM_JEWEL_ELDER_IDENTITY",
            "NPC_NOSURI": "CLAIM_NOSURI_IDENTITY",
        }
        for profile_id, claim_id in moved.items():
            profile = self.candidates[profile_id]
            public = {claim["claim_id"] for claim in profile["identity"]["public_identity"]}
            history = {claim["claim_id"] for claim in profile["identity"]["established_history"]}
            self.assertNotIn(claim_id, public)
            self.assertIn(claim_id, history)
        self.assertEqual(
            self.candidates["NPC_MU_SHAOAI"]["relationships"][0]["relationship_type"],
            "shared curse-investigation history",
        )

        william = self.candidates["NPC_WILLIAM"]
        self.assertEqual(william["identity"]["public_identity"][0]["claim"], "威廉在帝都经营酒屋。")
        self.assertTrue(
            any(claim["claim_id"] == "CLAIM_WILLIAM_IDENTITY" for claim in william["identity"]["established_history"])
        )

    def test_review_records_are_complete_and_stop_short_of_human_approval(self):
        self.assertEqual(len(self.candidates), 36)
        required = (
            "## Identity", "## Personality", "## Values", "## Speech",
            "## Decision Patterns", "## Relationships", "## Knowledge", "## Goals",
            "## Dynamic State", "## Presence", "## Canon Layers / Provenance",
            "## Evidence Gaps", "## Evidence Packet Completeness",
            "## Required Corrections", "## Final Review Status",
        )
        for profile_id in self.candidates:
            text = (REVIEW_DIR / f"{profile_id}_review.md").read_text(encoding="utf-8")
            for heading in required:
                self.assertIn(heading, text, f"{profile_id} missing {heading}")
            self.assertIn("RECOMMENDED_FOR_APPROVAL", text)
            self.assertNotIn("\nAPPROVE\n", text)

    def test_review_records_name_every_populated_claim_and_state(self):
        for profile_id, profile in self.candidates.items():
            text = (REVIEW_DIR / f"{profile_id}_review.md").read_text(encoding="utf-8")
            claim_ids = []
            stack = [profile]
            while stack:
                value = stack.pop()
                if isinstance(value, dict):
                    for field in ("claim_id", "knowledge_id", "goal_id"):
                        if isinstance(value.get(field), str):
                            claim_ids.append(value[field])
                    stack.extend(value.values())
                elif isinstance(value, list):
                    stack.extend(value)
            for item_id in claim_ids:
                self.assertIn(item_id, text, f"{profile_id} review omits {item_id}")
            self.assertIn(f"life_status = `{profile['presence']['life_status']}`", text)
            self.assertIn(
                f"narrative_availability = `{profile['presence']['narrative_availability']}`",
                text,
            )
            self.assertIn("Evidence conclusion:", text)

        for profile_id in ("NPC_AINZ_OOAL_GOWN", "NPC_DEATHWING"):
            text = (REVIEW_DIR / f"{profile_id}_review.md").read_text(encoding="utf-8")
            identity_block = text.split("## Identity", 1)[1].split("## Personality", 1)[0]
            self.assertIn("REVISE", identity_block)

    def test_reviewed_candidates_keep_pc_and_erratum_boundaries(self):
        serialized = json.dumps(self.candidates, ensure_ascii=False)
        self.assertNotIn("普伦达", serialized)
        pc = self.candidates["PC_YU_LINFENG"]
        self.assertEqual(pc["control_mode"], "user_controlled")
        for field in (
            "may_generate_dialogue", "may_choose_voluntary_actions",
            "may_generate_private_thoughts", "may_assign_new_goals",
        ):
            self.assertFalse(pc["ai_permissions"][field])
        self.assertFalse((ROOT / "output" / "npc_profiles.jsonl").exists())
        self.assertFalse((ROOT / "output" / "pc_continuity.jsonl").exists())


class Phase3DApprovalPreparationTests(unittest.TestCase):
    def test_approval_manifest_has_exact_pending_population(self):
        self.assertTrue(APPROVAL_MANIFEST.is_file())
        text = APPROVAL_MANIFEST.read_text(encoding="utf-8")
        rows = [line for line in text.splitlines() if line.startswith("| NPC_") or line.startswith("| PC_")]
        self.assertEqual(len(rows), 36)
        self.assertTrue(all("PENDING_HUMAN_APPROVAL" in row for row in rows))
        self.assertTrue(all("NOT_ELIGIBLE_WITHOUT_HUMAN_APPROVAL" in row for row in rows))
        self.assertNotIn("| APPROVED |", text)
        self.assertIn("READY_FOR_HUMAN_APPROVAL", text)

    def test_review_manifest_records_all_review_and_approval_states(self):
        payload = json.loads(MANIFEST.read_text(encoding="utf-8"))
        self.assertEqual(payload["status"], "READY_FOR_HUMAN_APPROVAL")
        self.assertFalse(payload["human_approval_supplied"])
        self.assertFalse(payload["integration_authorized"])
        self.assertEqual(payload["review_summary"]["profiles_reviewed"], 36)
        self.assertEqual(payload["review_summary"]["profiles_revised"], 7)
        self.assertEqual(payload["review_summary"]["profiles_unchanged"], 29)
        self.assertEqual(payload["review_summary"]["human_decisions_required"], 0)
        self.assertEqual(payload["review_summary"]["human_approvals_recorded"], 0)
        for row in payload["profiles"]:
            self.assertEqual(row["review_status"], "RECOMMENDED_FOR_APPROVAL")
            self.assertEqual(row["human_approval_status"], "PENDING_HUMAN_APPROVAL")
            self.assertEqual(row["integration_eligibility"], "NOT_ELIGIBLE_WITHOUT_HUMAN_APPROVAL")

    def test_final_report_has_required_sections_and_withholds_integration(self):
        self.assertTrue(FINAL_REPORT.is_file())
        text = FINAL_REPORT.read_text(encoding="utf-8")
        required = (
            "## Outcome", "## Input Population", "## Preflight Integrity",
            "## Review Classification", "## Semantic Review Results",
            "## Correction Summary", "## Claim Corrections",
            "## Evidence-Packet Corrections", "## Human Decision Results",
            "## Approval Results", "## Patch Results", "## Formal Database Results",
            "## Profile Validation", "## Patch Validation", "## Regression Tests",
            "## Deterministic Rebuild", "## Protected Artifact Hash Check",
            "## Final Database Hashes", "## New Errata", "## Stop Boundary",
        )
        for heading in required:
            self.assertIn(heading, text)
        self.assertIn("35 NPC", text)
        self.assertIn("1 PC", text)
        self.assertIn("36", text)
        self.assertIn("READY_FOR_HUMAN_APPROVAL", text)
        self.assertIn("0 unexpected hash mismatches", text)
        self.assertIn("Formal integration was not performed", text)
        self.assertFalse((ROOT / "output" / "npc_profiles.jsonl").exists())
        self.assertFalse((ROOT / "output" / "pc_continuity.jsonl").exists())


if __name__ == "__main__":
    unittest.main()
