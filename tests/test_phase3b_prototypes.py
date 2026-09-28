import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROTOTYPE_DIR = ROOT / "work" / "phase3b" / "prototypes"
EVIDENCE_DIR = ROOT / "work" / "phase3b" / "evidence"
PATCH_DIR = ROOT / "work" / "patches" / "pending"

EXPECTED = {
    "NPC_YOUYOU": ("CHARACTER_YOUYOU", "npc", "full", "full_when_active"),
    "NPC_WHITE_MAGICIAN": ("CHARACTER_WHITE_MAGICIAN", "npc", "full", "full_when_active"),
    "NPC_EMPEROR": ("CHARACTER_EMPEROR", "npc", "full", "full_when_active"),
    "NPC_TOLKIEN": ("CHARACTER_TOLKIEN", "npc", "minimal", "worldbook_until_promoted"),
    "PC_YU_LINFENG": ("CHARACTER_YU_LINFENG", "pc_continuity", "full", "full_when_active"),
}

EXPECTED_PATCHES = {
    "PATCH_3001_npc_youyou.json": ("PATCH_3001", "NPC_YOUYOU"),
    "PATCH_3002_npc_white_magician.json": ("PATCH_3002", "NPC_WHITE_MAGICIAN"),
    "PATCH_3003_npc_emperor.json": ("PATCH_3003", "NPC_EMPEROR"),
    "PATCH_3004_npc_tolkien.json": ("PATCH_3004", "NPC_TOLKIEN"),
    "PATCH_3005_pc_yulinfeng.json": ("PATCH_3005", "PC_YU_LINFENG"),
}

BANNED_FIELDS = {
    "future_importance",
    "expected_scene_frequency",
    "future_plot_role",
    "priority_score",
    "rank",
    "tier",
    "trust_score",
    "friendship_score",
    "future_event_guaranteed",
    "AI_should_make_PC_aggressive",
}


def walk(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk(child)


class Phase3BPrototypeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.profiles = {}
        for profile_id in EXPECTED:
            path = PROTOTYPE_DIR / f"{profile_id}.json"
            cls.profiles[profile_id] = json.loads(path.read_text(encoding="utf-8"))
        cls.patch_paths = sorted(PATCH_DIR.glob("PATCH_3*.json"))
        cls.patches = [json.loads(path.read_text(encoding="utf-8")) for path in cls.patch_paths]

    def test_all_five_profiles_validate_together(self):
        result = subprocess.run(
            [
                sys.executable,
                str(ROOT / "scripts" / "validate_character_profiles.py"),
                str(PROTOTYPE_DIR),
                "--worldbook",
                str(ROOT / "output" / "worldbook_source.jsonl"),
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Validated 5 profile(s): 0 error(s)", result.stdout)

    def test_profile_mappings_and_runtime_roles_are_exact_and_unique(self):
        worldbook_ids = []
        for profile_id, (worldbook_id, kind, depth, policy) in EXPECTED.items():
            profile = self.profiles[profile_id]
            self.assertEqual(profile["id"], profile_id)
            self.assertEqual(profile["worldbook_id"], worldbook_id)
            self.assertEqual(profile["profile_kind"], kind)
            self.assertEqual(profile["profile_depth"], depth)
            self.assertEqual(profile["activation_policy"], policy)
            worldbook_ids.append(profile["worldbook_id"])
        self.assertEqual(len(worldbook_ids), len(set(worldbook_ids)))

    def test_minimal_tolkien_is_sparse_and_records_gaps(self):
        profile = self.profiles["NPC_TOLKIEN"]
        self.assertEqual(profile["core_personality"], [])
        self.assertEqual(profile["values"], [])
        self.assertEqual(profile["speech_style"], [])
        self.assertEqual(profile["decision_patterns"], [])
        self.assertEqual(profile["epistemic_state"], [])
        self.assertTrue(profile["evidence_gaps"])

    def test_pc_hard_boundary_is_preserved(self):
        profile = self.profiles["PC_YU_LINFENG"]
        self.assertEqual(profile["control_mode"], "user_controlled")
        permissions = profile["ai_permissions"]
        for field in (
            "may_generate_dialogue",
            "may_choose_voluntary_actions",
            "may_generate_private_thoughts",
            "may_assign_new_goals",
        ):
            self.assertIs(permissions[field], False)
        self.assertIs(permissions["may_describe_external_effects"], True)
        self.assertIs(permissions["may_describe_involuntary_physical_reactions"], True)
        self.assertIs(permissions["may_summarize_user_declared_actions"], True)
        constraint_ids = {item["constraint_id"] for item in profile["rp_constraints"]}
        self.assertNotIn("CONSTRAINT_YU_LINFENG_NO_DIALOGUE", constraint_ids)
        self.assertNotIn("CONSTRAINT_YU_LINFENG_NO_VOLUNTARY_CONTROL", constraint_ids)

        original_claim = next(
            claim
            for claim in profile["identity"]["established_history"]
            if claim["claim_id"] == "CLAIM_YU_LINFENG_DRAGON_SANCTUARY_HISTORY"
        )
        transition_claim = next(
            claim
            for claim in profile["identity"]["established_history"]
            if claim["claim_id"] == "CLAIM_YU_LINFENG_TRANSITION_EVACUATION"
        )
        self.assertEqual(original_claim["origin"], "original_campaign")
        self.assertEqual(transition_claim["origin"], "transition")

        arcana = next(
            item
            for item in self.profiles["NPC_WHITE_MAGICIAN"]["epistemic_state"]
            if item["knowledge_id"] == "KNOWLEDGE_WHITE_MAGICIAN_ARCANA"
        )
        self.assertEqual(arcana["assertion_scope"], "character_cognition")

    def test_no_banned_future_importance_fields(self):
        for profile in self.profiles.values():
            for obj in walk(profile):
                self.assertFalse(BANNED_FIELDS.intersection(obj), profile["id"])

    def test_evidence_gaps_are_valid_and_present(self):
        for profile in self.profiles.values():
            self.assertIsInstance(profile["evidence_gaps"], list)
            self.assertTrue(profile["evidence_gaps"], profile["id"])

    def test_evidence_files_have_required_sections(self):
        required = (
            "Identity Evidence",
            "Personality Evidence",
            "Values Evidence",
            "Speech Evidence",
            "Decision Evidence",
            "Relationship Evidence",
            "Knowledge Evidence",
            "Goal Evidence",
            "Dynamic State Evidence",
            "Presence Evidence",
            "Contradictions / Ambiguities",
            "Evidence Gaps",
        )
        for profile_id in EXPECTED:
            text = (EVIDENCE_DIR / f"{profile_id}_evidence.md").read_text(encoding="utf-8")
            for heading in required:
                self.assertIn(f"## {heading}", text, f"{profile_id}: {heading}")

    def test_five_patches_are_draft_additions_without_approval_or_application(self):
        self.assertEqual(len(self.patches), 5)
        self.assertEqual({path.name for path in self.patch_paths}, set(EXPECTED_PATCHES))
        targets = {patch["target_id"] for patch in self.patches}
        self.assertEqual(targets, set(EXPECTED))
        for path, patch in zip(self.patch_paths, self.patches):
            expected_patch_id, expected_target = EXPECTED_PATCHES[path.name]
            self.assertEqual(patch["patch_id"], expected_patch_id)
            self.assertEqual(patch["target_id"], expected_target)
            self.assertEqual(
                patch["proposed_changes"]["after"]["prototype_ref"],
                f"work/phase3b/prototypes/{expected_target}.json",
            )
            self.assertEqual(patch["proposed_changes"]["after"]["profile_id"], expected_target)
            self.assertEqual(patch["operation"], "add")
            self.assertEqual(patch["status"], "draft")
            self.assertNotIn("approval", patch)
            self.assertNotIn("application", patch)
            expected_db = "pc_continuity" if patch["target_id"].startswith("PC_") else "npc_profiles"
            self.assertEqual(patch["target_database"], expected_db)

    def test_phase3b_outputs_do_not_repeat_forbidden_erroneous_name(self):
        paths = list(PROTOTYPE_DIR.glob("*.json")) + list(EVIDENCE_DIR.glob("*.md"))
        for path in paths:
            text = path.read_text(encoding="utf-8")
            self.assertNotIn("普伦达", text, str(path))
            self.assertNotIn("CHARACTER_SADAKO", text, str(path))


if __name__ == "__main__":
    unittest.main()
