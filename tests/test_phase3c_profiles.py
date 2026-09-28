import hashlib
import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / "work" / "phase3c_inventory.md"
BASELINE = ROOT / "work" / "phase3c" / "protected_baseline.json"
PROFILE_DIR = ROOT / "work" / "phase3c" / "profiles"
EVIDENCE_DIR = ROOT / "work" / "phase3c" / "evidence"
PATCH_DIR = ROOT / "work" / "patches" / "pending"

PHASE3B_WORLD_BOOK_IDS = {
    "CHARACTER_EMPEROR",
    "CHARACTER_YOUYOU",
    "CHARACTER_WHITE_MAGICIAN",
    "CHARACTER_TOLKIEN",
}
PC_WORLD_BOOK_ID = "CHARACTER_YU_LINFENG"

BUILD_FULL = {
    "CHARACTER_CASSIUS_BRIGHT",
    "CHARACTER_HAKU",
    "CHARACTER_AINZ_OOAL_GOWN",
    "CHARACTER_YOMI_ISAYAMA",
    "CHARACTER_XIERLUN_VON_GILCODE",
    "CHARACTER_ELDER_XUE",
    "CHARACTER_OSHUTORU",
    "CHARACTER_JIANG_ZIYOU",
    "CHARACTER_MU_SHAOAI",
    "CHARACTER_WOSIS",
    "CHARACTER_DEATHWING",
    "CHARACTER_KENDA_KAI_FERGUS",
    "CHARACTER_CASSANDRA",
    "CHARACTER_JERGAL",
    "CHARACTER_ZHENZI",
}

BUILD_COMPACT = {
    "CHARACTER_ELLIE",
    "CHARACTER_KUON",
    "CHARACTER_REN_FANZHEN",
    "CHARACTER_ZHOU_ZHENG",
    "CHARACTER_MU_TOU",
    "CHARACTER_LEI_GUANG",
    "CHARACTER_HONDA_KAI_FERGUS",
    "CHARACTER_GREMLIN",
    "CHARACTER_NOSURI",
    "CHARACTER_OSHIRA",
    "CHARACTER_WURAI",
    "CHARACTER_LINGCHI",
    "CHARACTER_LULUTIYE",
    "CHARACTER_WILLIAM",
    "CHARACTER_JEWEL_ELDER",
}

BUILD_MINIMAL = {"CHARACTER_SERTANT_LU_YOURLAN"}
BUILD_IDS = BUILD_FULL | BUILD_COMPACT | BUILD_MINIMAL
REQUIRED_EVIDENCE_SECTIONS = {
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


def inventory_rows():
    rows = []
    for line in INVENTORY.read_text(encoding="utf-8").splitlines():
        if not line.startswith("|") or line.startswith("|---") or "worldbook_id" in line:
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) == 9:
            rows.append(cells)
    return rows


class Phase3CInventoryTests(unittest.TestCase):
    def test_inventory_is_complete_and_dispositions_are_exact(self):
        rows = inventory_rows()
        self.assertEqual(len(rows), 36)
        by_id = {row[0]: row for row in rows}
        self.assertEqual(len(by_id), 36)
        self.assertEqual({key for key, row in by_id.items() if row[7] == "BUILD_FULL"}, BUILD_FULL)
        self.assertEqual({key for key, row in by_id.items() if row[7] == "BUILD_COMPACT"}, BUILD_COMPACT)
        self.assertEqual({key for key, row in by_id.items() if row[7] == "BUILD_MINIMAL"}, BUILD_MINIMAL)
        self.assertEqual(
            {key for key, row in by_id.items() if row[7] == "ALREADY_PROTOTYPED"},
            PHASE3B_WORLD_BOOK_IDS,
        )
        self.assertEqual(
            {key for key, row in by_id.items() if row[7] == "EXCLUDE_NON_NPC"},
            {PC_WORLD_BOOK_ID},
        )

    def test_inventory_has_no_future_priority_fields(self):
        text = INVENTORY.read_text(encoding="utf-8")
        for field in (
            "future_importance",
            "expected_scene_frequency",
            "future_plot_role",
            "priority_score",
        ):
            self.assertNotIn(field, text)

    def test_protected_baseline_matches_files(self):
        payload = json.loads(BASELINE.read_text(encoding="utf-8"))
        self.assertGreaterEqual(len(payload["protected_files"]), 67)
        required = {
            "config/content_routing_rules.json",
            "docs/canon_update_protocol.md",
            "docs/content_routing_guide.md",
            "docs/patch_impact_checklist.md",
            "schema/authorial_supplement.schema.json",
            "schema/canon_patch.schema.json",
            "schema/continuation_event.schema.json",
            "schema/director_item.schema.json",
            "work/phase2_5_errata.md",
        }
        required.update(
            f"work/phase2/batch_{number:02d}{suffix}"
            for number in range(1, 8)
            for suffix in (".jsonl", "_review.md")
        )
        self.assertTrue(required.issubset(payload["protected_files"]))
        for relative, expected in payload["protected_files"].items():
            actual = hashlib.sha256((ROOT / relative).read_bytes()).hexdigest().upper()
            self.assertEqual(actual, expected, relative)


class Phase3CArtifactTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.profiles = [json.loads(path.read_text(encoding="utf-8")) for path in sorted(PROFILE_DIR.glob("NPC_*.json"))]
        cls.completed_worldbook_ids = set()
        for path in sorted((ROOT / "work" / "phase3c" / "batches").glob("batch_*_manifest.json")):
            manifest = json.loads(path.read_text(encoding="utf-8"))
            if manifest.get("status") == "READY_FOR_VALIDATION":
                cls.completed_worldbook_ids.update(manifest["worldbook_ids"])

    def test_every_build_disposition_has_one_unique_profile(self):
        self.assertEqual(len(self.profiles), len(self.completed_worldbook_ids))
        self.assertEqual(len({profile["id"] for profile in self.profiles}), len(self.profiles))
        self.assertEqual({profile["worldbook_id"] for profile in self.profiles}, self.completed_worldbook_ids)
        self.assertTrue(self.completed_worldbook_ids.issubset(BUILD_IDS))
        if len(self.completed_worldbook_ids) == len(BUILD_IDS):
            self.assertEqual({profile["worldbook_id"] for profile in self.profiles}, BUILD_IDS)
        self.assertNotIn(PC_WORLD_BOOK_ID, {profile["worldbook_id"] for profile in self.profiles})

    def test_phase3b_prototypes_are_not_regenerated(self):
        self.assertTrue({profile["worldbook_id"] for profile in self.profiles}.isdisjoint(PHASE3B_WORLD_BOOK_IDS))

    def test_every_profile_has_required_evidence_packet_sections(self):
        for profile in self.profiles:
            path = EVIDENCE_DIR / f"{profile['id']}_evidence.md"
            self.assertTrue(path.is_file(), profile["id"])
            headings = {
                line.removeprefix("## ").strip()
                for line in path.read_text(encoding="utf-8").splitlines()
                if line.startswith("## ")
            }
            self.assertTrue(REQUIRED_EVIDENCE_SECTIONS.issubset(headings), profile["id"])
            text = path.read_text(encoding="utf-8")
            for label in ("Source:", "Source location:", "Candidate target field:", "Evidence mode:", "Confidence / limitation:", "Canon layer:"):
                self.assertIn(label, text, f"{profile['id']} missing {label}")
            self.assertIn("`current_state.md` was opened and checked as the D3 anchor.", text, profile["id"])
            self.assertIn("`current_state.md:D3 state check`", text, profile["id"])
            self.assertEqual(profile["dynamic_state"]["sources"], ["current_state.md:D3 state check"])

    def test_profile_provenance_and_claim_sources_are_non_empty(self):
        for profile in self.profiles:
            self.assertTrue(profile["provenance"]["source_origin_ids"], profile["id"])
            self.assertTrue(profile["evidence_gaps"], profile["id"])
            for section in ("public_identity", "durable_roles", "established_history"):
                for claim in profile["identity"][section]:
                    self.assertTrue(claim["sources"], claim["claim_id"])

    def test_claims_have_statement_level_single_source_provenance(self):
        for profile in self.profiles:
            claims = []
            for section in ("public_identity", "durable_roles", "established_history"):
                claims.extend(profile["identity"][section])
            for section in ("core_personality", "values", "speech_style", "decision_patterns"):
                claims.extend(profile[section])
            for relationship in profile["relationships"]:
                for section in ("established_history", "current_stance", "obligations", "tensions"):
                    claims.extend(relationship[section])
            for claim in claims:
                self.assertEqual(len(claim["sources"]), 1, claim["claim_id"])

    def test_profile_claims_do_not_use_navigation_tables_as_factual_sources(self):
        for profile in self.profiles:
            claims = []
            for section in ("public_identity", "durable_roles", "established_history"):
                claims.extend(profile["identity"][section])
            for section in ("core_personality", "values", "speech_style", "decision_patterns"):
                claims.extend(profile[section])
            for relationship in profile["relationships"]:
                for section in ("established_history", "current_stance", "obligations", "tensions"):
                    claims.extend(relationship[section])
            for claim in claims:
                self.assertFalse(
                    any(source.startswith("战报/") for source in claim["sources"]),
                    claim["claim_id"],
                )

    def test_established_history_claims_are_atomic_not_raw_source_dumps(self):
        for profile in self.profiles:
            for claim in profile["identity"]["established_history"]:
                self.assertLessEqual(len(claim["claim"]), 220, claim["claim_id"])
                self.assertNotIn("##", claim["claim"], claim["claim_id"])
                self.assertNotIn("【", claim["claim"], claim["claim_id"])

    def test_evidence_candidate_statements_have_complete_metadata(self):
        labels = (
            "Source:", "Source location:", "Evidence excerpt:", "Candidate statement:",
            "Candidate target field:", "Evidence mode:", "Stability:",
            "Confidence / limitation:", "Canon layer:",
        )
        for profile in self.profiles:
            text = (EVIDENCE_DIR / f"{profile['id']}_evidence.md").read_text(encoding="utf-8")
            blocks = text.split("### Candidate statement ")[1:]
            self.assertTrue(blocks, profile["id"])
            for block in blocks:
                for label in labels:
                    self.assertIn(label, block, f"{profile['id']} block missing {label}")

    def test_transition_sources_are_not_labeled_original_campaign(self):
        for profile in self.profiles:
            claims = []
            for section in ("public_identity", "durable_roles", "established_history"):
                claims.extend(profile["identity"][section])
            for section in ("core_personality", "values", "speech_style", "decision_patterns"):
                claims.extend(profile[section])
            for claim in claims:
                if any("current_state.md" in source for source in claim["sources"]):
                    self.assertEqual(claim["origin"], "transition", claim["claim_id"])

    def test_authorial_character_reference_claims_keep_authorial_origin(self):
        for profile in self.profiles:
            claims = []
            for section in ("public_identity", "durable_roles", "established_history"):
                claims.extend(profile["identity"][section])
            for section in ("core_personality", "values", "speech_style", "decision_patterns"):
                claims.extend(profile[section])
            for claim in claims:
                if any("人物卡资料集_叙事检索版.md" in source for source in claim["sources"]):
                    self.assertEqual(claim["evidence_mode"], "authorial_definition", claim["claim_id"])
                    self.assertEqual(claim["origin"], "authorial_supplement", claim["claim_id"])
                    self.assertIn("authorial_supplement", profile["provenance"]["canon_origin"], profile["id"])
            self.assertNotIn("authorial_supplement", profile["canon_layers"], profile["id"])
            self.assertNotIn("authorial_supplement", profile["presence"]["realm_scope"], profile["id"])

    def test_long_range_evidence_excerpts_contain_the_supporting_passage(self):
        expected = {
            "NPC_WOSIS": ("把你们的身份和目的", "背后的组织"),
            "NPC_MU_TOU": ("成为他人的希望", "吐槽感"),
            "NPC_CASSIUS_BRIGHT": ("耐心、寡言",),
            "NPC_YOMI_ISAYAMA": ("冷静、坚忍",),
            "NPC_HONDA_KAI_FERGUS": ("擒住", "赤炎龙王"),
            "NPC_CASSANDRA": ("破万法之符扔给了御临风",),
        }
        for profile_id, needles in expected.items():
            text = (EVIDENCE_DIR / f"{profile_id}_evidence.md").read_text(encoding="utf-8")
            for needle in needles:
                self.assertIn(needle, text, f"{profile_id} missing excerpt text {needle}")

    def test_wosis_knowledge_evidence_uses_the_interrogation_passage(self):
        text = (EVIDENCE_DIR / "NPC_WOSIS_evidence.md").read_text(encoding="utf-8")
        knowledge = text.split("## Knowledge Evidence", 1)[1].split("## Goal Evidence", 1)[0]
        self.assertIn("lines 94-119, 173-199", knowledge)
        self.assertIn("把你们的身份和目的", knowledge)
        self.assertIn("背后的组织", knowledge)

    def test_original_battle_and_transition_uncertainty_are_separate(self):
        by_id = {profile["id"]: profile for profile in self.profiles}
        deathwing = by_id["NPC_DEATHWING"]["identity"]["established_history"]
        self.assertTrue(any(claim["origin"] == "original_campaign" and "本轮肉身瓦解" in claim["claim"] for claim in deathwing))
        self.assertTrue(any(claim["origin"] == "transition" and "仍未确认" in claim["claim"] for claim in deathwing))
        xierlun = by_id["NPC_XIERLUN_VON_GILCODE"]["identity"]["established_history"]
        self.assertTrue(xierlun)
        self.assertTrue(all(claim["origin"] == "original_campaign" for claim in xierlun))
        self.assertTrue(all("current_state.md" not in claim["sources"][0] for claim in xierlun))

    def test_actual_phase3c_set_validates(self):
        result = subprocess.run(
            [
                sys.executable,
                str(ROOT / "scripts" / "validate_character_profiles.py"),
                str(PROFILE_DIR),
                "--worldbook",
                str(ROOT / "output" / "worldbook_source.jsonl"),
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn(f"Validated {len(self.profiles)} profile(s): 0 error(s)", result.stdout)

    def test_full_profiles_include_available_rp_evidence_without_fabrication(self):
        by_id = {profile["id"]: profile for profile in self.profiles}
        if "NPC_HAKU" in by_id:
            self.assertTrue(by_id["NPC_HAKU"]["core_personality"])
            self.assertTrue(by_id["NPC_HAKU"]["decision_patterns"])
        if "NPC_WOSIS" in by_id:
            item = by_id["NPC_WOSIS"]["epistemic_state"][0]
            self.assertEqual(item["epistemic_type"], "suspects")
            self.assertEqual(item["assertion_scope"], "character_cognition")

    def test_special_interlude_profiles_cannot_leak_to_main_world(self):
        by_worldbook = {profile["worldbook_id"]: profile for profile in self.profiles}
        for worldbook_id in ("CHARACTER_REN_FANZHEN", "CHARACTER_ZHOU_ZHENG"):
            if worldbook_id not in by_worldbook:
                continue
            profile = by_worldbook[worldbook_id]
            self.assertEqual(profile["canon_layers"], ["special_interlude"])
            self.assertEqual(profile["presence"]["realm_scope"], ["special_interlude"])
            self.assertEqual(profile["presence"]["narrative_availability"], "special_interlude_only")

    def test_deceased_characters_are_historical_only(self):
        by_worldbook = {profile["worldbook_id"]: profile for profile in self.profiles}
        for worldbook_id in ("CHARACTER_GREMLIN", "CHARACTER_LINGCHI", "CHARACTER_ZHENZI"):
            if worldbook_id not in by_worldbook:
                continue
            profile = by_worldbook[worldbook_id]
            self.assertEqual(profile["presence"]["life_status"], "deceased")
            self.assertEqual(profile["presence"]["narrative_availability"], "historical_only")

    def test_runtime_safety_and_erratum_protection(self):
        for profile in self.profiles:
            serialized = json.dumps(profile, ensure_ascii=False)
            self.assertNotIn("普伦达", serialized)
            self.assertNotIn("SADAKO", serialized)
            for field in BANNED_FIELDS:
                self.assertNotIn(f'"{field}"', serialized)
            self.assertFalse(profile["ai_permissions"]["may_assign_new_goals"])
            self.assertFalse(profile["ai_permissions"]["may_summarize_user_declared_actions"])
        phase3c_paths = list((ROOT / "work" / "phase3c").rglob("*"))
        phase3c_paths += [ROOT / "work" / "phase3c_inventory.md", ROOT / "work" / "phase3c_profile_quality_review.md", ROOT / "work" / "phase3c_runtime_projection_dryrun.md", ROOT / "work" / "phase3c_review.md"]
        for path in phase3c_paths:
            if path.is_file():
                text = path.read_text(encoding="utf-8")
                self.assertNotIn("普伦达", text, str(path))
                self.assertNotIn("CHARACTER_SADAKO", text, str(path))

    def test_draft_patches_are_add_only_and_unapproved(self):
        phase3c_patches = []
        completed_count = len(self.completed_worldbook_ids)
        for number in range(4001, 4001 + completed_count):
            matches = list(PATCH_DIR.glob(f"PATCH_{number}_*.json"))
            self.assertEqual(len(matches), 1, number)
            phase3c_patches.append(json.loads(matches[0].read_text(encoding="utf-8")))
        self.assertEqual(len(phase3c_patches), completed_count)
        for patch in phase3c_patches:
            self.assertEqual(patch["operation"], "add")
            self.assertEqual(patch["status"], "draft")
            self.assertEqual(patch["target_database"], "npc_profiles")
            self.assertNotIn("approval", patch)
            self.assertNotIn("application", patch)


if __name__ == "__main__":
    unittest.main()
