import importlib
import json
import copy
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
R2C_ROOT = ROOT / "work" / "phase3d_r2c"
SCHEMA_ROOT = R2C_ROOT / "schemas"
FIXTURE_ROOT = R2C_ROOT / "reviewed_inputs" / "schema_fixtures"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def load_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


class Phase3DR2CSchemaContractTests(unittest.TestCase):
    def test_frozen_manifest_covers_declared_r2a_r2b_and_profile_inputs(self):
        path = R2C_ROOT / "reviewed_inputs" / "frozen_input_manifest.json"
        self.assertTrue(path.is_file(), "R2C frozen manifest must exist")
        manifest = load_json(path)
        paths = {item["path"] for item in manifest["files"]}
        required = {
            "work/phase3d_r2/chronology/campaign_chronology.jsonl",
            "work/phase3d_r2/chronology/character_revelations.jsonl",
            "work/phase3d_r2b/normalized/campaign_events.jsonl",
            "work/phase3d_r2b/indexes/character_temporal_indexes.jsonl",
            "current_state.md",
        }
        self.assertTrue(required <= paths)
        self.assertEqual(manifest["phase"], "3D-R2C")
        self.assertEqual(manifest["status"], "FROZEN_BEFORE_R2C_BUILD")

    def test_shared_v2_schema_has_closed_distinct_semantic_sections(self):
        schema = load_json(SCHEMA_ROOT / "character_profile_v2.schema.json")
        defs = schema["$defs"]
        for name in (
            "IdentitySection",
            "BackgroundItem",
            "PersonaSection",
            "MotivationItem",
            "GoalItem",
            "TimelineItem",
            "RelationshipRecord",
            "AbilityStatusTransition",
            "KnowledgeItem",
            "NonactualProjection",
            "DynamicState",
        ):
            self.assertIn(name, defs)
            self.assertFalse(defs[name].get("additionalProperties", True))
        self.assertNotEqual(defs["BackgroundItem"], defs["TimelineItem"])
        self.assertNotEqual(defs["MotivationItem"], defs["GoalItem"])

    def test_npc_and_pc_root_schemas_validate_their_kinds(self):
        common = load_json(SCHEMA_ROOT / "character_profile_v2.schema.json")
        npc = load_json(SCHEMA_ROOT / "npc_profile_v2.schema.json")
        pc = load_json(SCHEMA_ROOT / "pc_continuity_v2.schema.json")
        self.assertEqual(common["$id"], "https://local.invalid/schema/r2c/character_profile_v2.schema.json")
        self.assertEqual(npc["properties"]["profile_kind"]["const"], "npc")
        self.assertEqual(pc["properties"]["profile_kind"]["const"], "pc_continuity")
        self.assertEqual(npc["properties"]["schema_version"]["const"], "2.0")
        self.assertEqual(pc["properties"]["schema_version"]["const"], "2.0")

    def test_pc_schema_locks_four_autonomous_permissions_false(self):
        common = load_json(SCHEMA_ROOT / "character_profile_v2.schema.json")
        props = common["$defs"]["PcPermissions"]["properties"]
        for key in (
            "may_generate_dialogue",
            "may_choose_voluntary_actions",
            "may_generate_private_thoughts",
            "may_assign_new_goals",
        ):
            self.assertIs(props[key]["const"], False)

    def test_migration_package_schema_requires_every_decision_section(self):
        schema = load_json(SCHEMA_ROOT / "migration_package.schema.json")
        required = set(schema["required"])
        expected = {
            "profile_id",
            "source_profile_candidate",
            "inputs_considered",
            "old_claim_migrations",
            "background_items",
            "persona",
            "goals",
            "timeline_items",
            "relationship_items",
            "ability_status_items",
            "knowledge_items",
            "nonactual_projections",
            "dynamic_state",
            "presence",
            "rp_constraints",
            "evidence_gaps",
            "gap_routing",
            "human_review_notes",
        }
        self.assertTrue(expected <= required)

    def test_schema_reports_freeze_hashes_after_all_fixtures_pass(self):
        common = importlib.import_module("scripts.phase3d_r2c_common")
        schema_report = (R2C_ROOT / "reports" / "schema_validation_report.md").read_text(encoding="utf-8")
        fixture_report = (R2C_ROOT / "reports" / "fixture_validation_report.md").read_text(encoding="utf-8")
        for filename in ("character_profile_v2.schema.json", "npc_profile_v2.schema.json", "pc_continuity_v2.schema.json"):
            digest = common.sha256_file(SCHEMA_ROOT / filename)
            self.assertIn(digest, schema_report)
        self.assertIn("6/6", fixture_report)
        self.assertIn("SCHEMA_FROZEN_FOR_MIGRATION", fixture_report)


class Phase3DR2CFixtureGateTests(unittest.TestCase):
    def _fixtures(self):
        return {path.stem: load_json(path) for path in sorted(FIXTURE_ROOT.glob("*.json"))}

    def test_all_six_fixture_groups_validate_without_flattening(self):
        fixtures = self._fixtures()
        self.assertEqual(
            set(fixtures),
            {"WHITE_MAGICIAN", "CASSANDRA", "DEATHWING", "OSHIRA", "YOUYOU", "PC_YU_LINFENG"},
        )
        common = importlib.import_module("scripts.phase3d_r2c_common")
        errors = [error for fixture in fixtures.values() for error in common.validate_profile(fixture)]
        self.assertEqual(errors, [])

    def test_white_magician_fixture_separates_three_locations_or_events(self):
        fixture = self._fixtures()["WHITE_MAGICIAN"]
        background = {item["background_id"] for item in fixture["biographical_background"]}
        events = {item["event_ref"] for item in fixture["campaign_timeline"]}
        self.assertIn("BACKGROUND_WHITE_MAGICIAN_PRISON_TOWER", background)
        self.assertIn("EVENT_P2_023_WHITE_MAGICIAN_ARMORY_CONFRONTATION", events)
        self.assertIn("EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY", events)

    def test_cassandra_fixture_separates_motivation_from_possible_future(self):
        fixture = self._fixtures()["CASSANDRA"]
        motivations = fixture["persona"]["motivations"]
        futures = [item for item in fixture["nonactual_projections"] if item["reality_status"] == "POSSIBLE_FUTURE_VISION"]
        self.assertTrue(motivations)
        self.assertTrue(futures)
        self.assertTrue(all(item["subject_awareness"] == "not_indicated" for item in futures))
        self.assertTrue(all(item["reality_status"] != "POSSIBLE_FUTURE_VISION" for item in motivations))

    def test_deathwing_fixture_separates_testimony_battle_and_theory(self):
        fixture = self._fixtures()["DEATHWING"]
        statuses = {item["reality_status"] for item in fixture["knowledge_timeline"]}
        timeline_statuses = {item["reality_status"] for item in fixture["campaign_timeline"]}
        self.assertIn("TESTIMONY", statuses)
        self.assertIn("THEORY", statuses)
        self.assertIn("ACTUAL_EVENT", timeline_statuses)

    def test_oshira_fixture_preserves_unknown_control_cognition_and_persistence(self):
        fixture = self._fixtures()["OSHIRA"]
        control = next(item for item in fixture["ability_status_transitions"] if item["transition_type"] == "control")
        self.assertEqual(control["persistence"], "unknown")
        self.assertEqual(control["uncertainty"], "uncertain")
        self.assertIn("意识状态未知", control["notes"])

    def test_youyou_fixture_has_explicit_ordered_chain(self):
        fixture = self._fixtures()["YOUYOU"]
        orders = [item["story_order_start"] for item in fixture["campaign_timeline"]]
        self.assertEqual(orders, sorted(orders))
        self.assertGreaterEqual(len(orders), 8)

    def test_pc_fixture_scopes_knowledge_and_preserves_autonomy(self):
        fixture = self._fixtures()["PC_YU_LINFENG"]
        self.assertTrue(all(item["acquired_at_story_order"] for item in fixture["knowledge_timeline"]))
        permissions = fixture["ai_permissions"]
        for key in (
            "may_generate_dialogue",
            "may_choose_voluntary_actions",
            "may_generate_private_thoughts",
            "may_assign_new_goals",
        ):
            self.assertIs(permissions[key], False)


class Phase3DR2CMigrationPackageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.module = importlib.import_module("scripts.prepare_phase3d_r2c_packages")

    def test_effective_population_starts_with_35_npc_and_1_pc(self):
        profiles = self.module.load_effective_profiles()
        self.assertEqual(len(profiles), 36)
        self.assertEqual(sum(key.startswith("NPC_") for key in profiles), 35)
        self.assertEqual(sum(key.startswith("PC_") for key in profiles), 1)

    def test_each_old_claim_has_exactly_one_explicit_disposition(self):
        profiles = self.module.load_effective_profiles()
        packages = {item["profile_id"]: item for item in self.module.prepare_all_packages(write=False)}
        for profile_id, source in profiles.items():
            inventory = self.module.old_claim_inventory(load_json(source))
            migrations = packages[profile_id]["old_claim_migrations"]
            self.assertEqual(
                sorted(item["old_claim_id"] for item in inventory),
                sorted(item["old_claim_id"] for item in migrations),
                profile_id,
            )
            self.assertEqual(len(migrations), len({item["old_claim_id"] for item in migrations}), profile_id)

    def test_package_considers_direct_and_indirect_evidence_classes(self):
        packages = self.module.prepare_all_packages(write=False)
        required = {
            "old_claims", "direct_temporal_links", "indirect_continuity_events", "revelations",
            "event_audits", "retention_records", "discoveries", "d3_state", "worldbook_references",
        }
        for package in packages:
            considered = {item["input_class"] for item in package["inputs_considered"]}
            self.assertEqual(considered, required, package["profile_id"])

    def test_package_items_use_only_existing_event_revelation_and_source_refs(self):
        events = {item["event_id"]: item for item in self.module.load_events()}
        revelation_ids = {
            revelation["revelation_id"]
            for event in events.values()
            for revelation in event["character_revelations"]
        }
        for package in self.module.prepare_all_packages(write=False):
            for item in package["timeline_items"]:
                self.assertIn(item["event_ref"], events, package["profile_id"])
                self.assertTrue(set(item["revelation_refs"]) <= revelation_ids)
            for item in package["knowledge_items"]:
                if item["acquired_at_event_ref"] is not None:
                    self.assertIn(item["acquired_at_event_ref"], events, package["profile_id"])

    def test_mu_tou_and_zhenzi_packages_survive_empty_r2b_indexes(self):
        packages = {item["profile_id"]: item for item in self.module.prepare_all_packages(write=False)}
        for profile_id in ("NPC_MU_TOU", "NPC_ZHENZI"):
            self.assertIn(profile_id, packages)
            self.assertTrue(packages[profile_id]["old_claim_migrations"])
            self.assertNotEqual(packages[profile_id]["profile_metadata"]["profile_status"], "blocked")

    def test_yang_is_only_a_provisional_unmapped_discovery(self):
        packages = {item["profile_id"]: item for item in self.module.prepare_all_packages(write=False)}
        yang = packages["NPC_YANG"]
        metadata = yang["profile_metadata"]
        self.assertEqual(metadata["profile_status"], "provisional_discovery")
        self.assertIsNone(metadata["worldbook_id"])
        self.assertEqual(metadata["worldbook_mapping_status"], "provisional_unmapped")
        self.assertEqual(metadata["aliases"], [])
        def keys(value):
            if isinstance(value, dict):
                return set(value) | {child for item in value.values() for child in keys(item)}
            if isinstance(value, list):
                return {child for item in value for child in keys(item)}
            return set()
        self.assertFalse({key for key in keys(yang) if "trigger" in key.lower()})

    def test_all_prepared_packages_validate(self):
        common = importlib.import_module("scripts.phase3d_r2c_common")
        errors = {
            package["profile_id"]: common.validate_package(package)
            for package in self.module.prepare_all_packages(write=False)
            if common.validate_package(package)
        }
        self.assertEqual(errors, {})


class Phase3DR2CCompilerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.module = importlib.import_module("scripts.build_phase3d_r2c")
        cls.packages = cls.module.load_packages()

    def test_candidate_is_generated_only_from_its_package(self):
        package = copy.deepcopy(self.packages[0])
        package["profile_metadata"]["name"] = "编译器单源测试"
        candidate = self.module.compile_candidate(package)
        self.assertEqual(candidate["name"], "编译器单源测试")
        self.assertEqual(candidate["campaign_timeline"], package["timeline_items"])
        self.assertEqual(candidate["provenance"]["migration_package"], f"work/phase3d_r2c/migration_packages/{package['profile_id']}.json")

    def test_all_candidates_validate_against_frozen_schema(self):
        for package in self.packages:
            candidate = self.module.compile_candidate(package)
            self.assertEqual(self.module.validate_candidate(candidate), [], package["profile_id"])

    def test_changed_schema_hash_stops_before_profile_migration(self):
        with tempfile.TemporaryDirectory() as temporary:
            temp = Path(temporary)
            schema_root = temp / "schemas"
            schema_root.mkdir()
            for path in SCHEMA_ROOT.glob("*.json"):
                (schema_root / path.name).write_bytes(path.read_bytes())
            target = schema_root / "npc_profile_v2.schema.json"
            target.write_text(target.read_text(encoding="utf-8") + "\n", encoding="utf-8")
            with self.assertRaises(self.module.SchemaFreezeError):
                self.module.build_all(output_root=temp / "output", schema_root=schema_root)
            self.assertFalse((temp / "output" / "candidates").exists())

    def test_invalid_late_package_stops_without_partial_candidate_tree(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "r2c"
            marker = output / "candidates" / "by_profile" / "previous.json"
            marker.parent.mkdir(parents=True)
            marker.write_text("preserve", encoding="utf-8")
            packages = copy.deepcopy(self.packages)
            packages[-1]["profile_metadata"]["name"] = ""
            with self.assertRaises(self.module.ProfileRebuildError):
                self.module.build_all(output_root=output, packages=packages)
            self.assertEqual(marker.read_text(encoding="utf-8"), "preserve")
            self.assertEqual(list(marker.parent.glob("*.json")), [marker])

    def test_atomic_build_replaces_candidate_tree_only_after_validation(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "r2c"
            result = self.module.build_all(output_root=output)
            candidates = sorted((output / "candidates" / "by_profile").glob("*.json"))
            self.assertEqual(len(candidates), len(self.packages))
            self.assertEqual(result["candidate_count"], len(self.packages))
            self.assertFalse((output / ".staging").exists())

    def test_check_mode_detects_manual_candidate_drift(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "r2c"
            self.module.build_all(output_root=output)
            candidate = next((output / "candidates" / "by_profile").glob("*.json"))
            candidate.write_text(candidate.read_text(encoding="utf-8") + "\n", encoding="utf-8")
            with self.assertRaises(self.module.GeneratedOutputMismatch):
                self.module.check_all(output_root=output)


class Phase3DR2CHighRiskSemanticTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.preparer = importlib.import_module("scripts.prepare_phase3d_r2c_packages")
        cls.builder = importlib.import_module("scripts.build_phase3d_r2c")
        cls.packages = {item["profile_id"]: item for item in cls.preparer.prepare_all_packages(write=False)}

    def test_deathwing_keeps_indirect_p2_022_testimony_battle_theory_and_body_uncertainty(self):
        package = self.packages["NPC_DEATHWING"]
        self.assertIn("EVENT_P2_022_DEATHWING_HISTORY_TESTIMONY", {item["event_ref"] for item in package["timeline_items"]})
        statuses = {(item["reality_status"], item["epistemic_status"]) for item in package["knowledge_items"]}
        self.assertIn(("TESTIMONY", "TESTIMONY_HEARD"), statuses)
        self.assertIn(("THEORY", "THEORY"), statuses)
        body = next(item for item in package["ability_status_items"] if item["transition_type"] == "body_destruction")
        self.assertEqual(body["persistence"], "unknown")
        self.assertEqual(body["uncertainty"], "uncertain")

    def test_cassandra_current_revenge_motivation_is_not_possible_future(self):
        package = self.packages["NPC_CASSANDRA"]
        motivations = package["persona"]["motivations"]
        futures = [item for item in package["nonactual_projections"] if item["reality_status"] == "POSSIBLE_FUTURE_VISION"]
        self.assertTrue(motivations)
        self.assertTrue(futures)
        self.assertTrue(all(item["subject_awareness"] == "not_indicated" for item in futures))
        self.assertTrue(all(item["reality_status"] != "POSSIBLE_FUTURE_VISION" for item in motivations))

    def test_white_magician_prison_armory_finale_and_theory_are_separate(self):
        package = self.packages["NPC_WHITE_MAGICIAN"]
        backgrounds = {item["background_id"] for item in package["background_items"]}
        events = {item["event_ref"] for item in package["timeline_items"]}
        self.assertTrue(any("ESCAPE_HISTORY" in item for item in backgrounds))
        self.assertIn("EVENT_P2_023_WHITE_MAGICIAN_ARMORY_CONFRONTATION", events)
        self.assertIn("EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY", events)
        theories = [item for item in package["knowledge_items"] if item["epistemic_status"] == "THEORY"]
        self.assertTrue(theories)
        self.assertTrue(all(item["reality_status"] == "THEORY" for item in theories))

    def test_oshira_control_is_nonvoluntary_and_mechanism_cognition_persistence_stay_unknown(self):
        package = self.packages["NPC_OSHIRA"]
        control = next(item for item in package["ability_status_items"] if item["transition_type"] == "control")
        self.assertEqual(control["persistence"], "unknown")
        self.assertEqual(control["uncertainty"], "uncertain")
        combined = control["attribution"] + control["notes"]
        self.assertIn("非自愿", combined)
        self.assertIn("机制", combined)
        self.assertIn("意识", combined)
        self.assertNotIn("血脉魔法是", combined)

    def test_honda_and_sertant_propagation_preserves_finale_sequence(self):
        rows = self.builder.build_cross_profile_propagation(list(self.packages.values()))
        expected = [
            "deathwing_current_body_destroyed",
            "yu_and_ainz_return_to_foundation",
            "honda_and_sertant_found_suppressed",
            "ainz_intervenes",
            "white_magician_disengages",
            "magic_gem_removed",
        ]
        for profile_id in ("NPC_HONDA_KAI_FERGUS", "NPC_SERTANT_LU_YOURLAN"):
            row = next(item for item in rows if item["event_key"] == "DRAGON_SANCTUARY_FINALE" and item["profile_id"] == profile_id)
            self.assertEqual(row["sequence"], expected)

    def test_youyou_required_chain_has_explicit_story_order(self):
        orders = [item["story_order_start"] for item in self.packages["NPC_YOUYOU"]["timeline_items"]]
        required = ["P1-017", "P1-021", "P2-001", "P2-021", "P3-003", "P3-008", "P3-009", "TRANSITION-D3"]
        positions = [orders.index(value) for value in required]
        self.assertEqual(positions, sorted(positions))

    def test_xierlun_engagement_planning_does_not_become_current_obligation(self):
        package = self.packages["NPC_XIERLUN_VON_GILCODE"]
        current = json.dumps(package["dynamic_state"]["current_obligations"], ensure_ascii=False)
        self.assertNotIn("婚", current)
        self.assertNotIn("engagement", current.lower())

    def test_pc_special_interlude_and_yang_boundaries_remain_intact(self):
        pc = self.packages["PC_YU_LINFENG"]
        for key in ("may_generate_dialogue", "may_choose_voluntary_actions", "may_generate_private_thoughts", "may_assign_new_goals"):
            self.assertIs(pc["profile_metadata"]["ai_permissions"][key], False)
        self.assertTrue(all(ref.startswith("current_state.md:D3") for ref in pc["dynamic_state"]["source_refs"]))
        for package in self.packages.values():
            for item in package["timeline_items"]:
                if item["profile_canon_layer"] == "special_interlude":
                    self.assertNotIn(item["character_specific_summary"], package["dynamic_state"]["current_conditions"])
        self.assertEqual(self.packages["NPC_YANG"]["profile_metadata"]["profile_status"], "provisional_discovery")

    def test_required_cross_profile_event_groups_are_audited(self):
        rows = self.builder.build_cross_profile_propagation(list(self.packages.values()))
        keys = {item["event_key"] for item in rows}
        required = {
            "CURSE_TRANSFER", "YOUYOU_CEREMONY", "DRAGON_SANCTUARY_FINALE", "OSHIRA_CONTROL",
            "DEATHWING_FINAL_BATTLE", "WHITE_MAGICIAN_GEM_EXTRACTION", "CASSANDRA_AINZ_NEGOTIATION",
            "EMPEROR_HAKU_SUCCESSION", "XIERLUN_ENGAGEMENT_PLANNING",
        }
        self.assertTrue(required <= keys)
        self.assertTrue(all(item["role"] and item["consequence"] for item in rows))

    def test_mapped_campaign_events_are_not_duplicated_as_biographical_background(self):
        forbidden = {
            "NPC_WHITE_MAGICIAN": {
                "BACKGROUND_WHITE_MAGICIAN_GEM_HISTORY",
                "BACKGROUND_WHITE_MAGICIAN_FACTORY_CONFRONTATION",
                "BACKGROUND_WHITE_MAGICIAN_OSHIRA_CONTROL",
            },
            "NPC_DEATHWING": {
                "BACKGROUND_DEATHWING_HISTORY_1",
                "BACKGROUND_DEATHWING_INVASION_CONTINUITY",
            },
            "NPC_CASSANDRA": {
                "BACKGROUND_CASSANDRA_PREWAR_WARNING",
                "BACKGROUND_CASSANDRA_AINZ_INTERMEDIARY",
            },
            "NPC_YOUYOU": {
                "BACKGROUND_YOUYOU_NAME_STAGES",
                "BACKGROUND_YOUYOU_RESCUE_HISTORY",
                "BACKGROUND_YOUYOU_SWORD_AND_DETENTION",
                "BACKGROUND_YOUYOU_SERTANT_AWAKENING",
                "BACKGROUND_YOUYOU_ENGAGEMENT_HISTORY",
                "BACKGROUND_YOUYOU_INHERITANCE_HISTORY",
                "BACKGROUND_YOUYOU_PROPHECY_HISTORY",
                "BACKGROUND_YOUYOU_PROTECTION_HISTORY",
            },
        }
        for profile_id, forbidden_ids in forbidden.items():
            package = self.packages[profile_id]
            actual = {item["background_id"] for item in package["background_items"]}
            self.assertFalse(actual & forbidden_ids, profile_id)
            migrations = {item["old_claim_id"]: item for item in package["old_claim_migrations"]}
            for background_id in forbidden_ids:
                old_id = "CLAIM_" + background_id.removeprefix("BACKGROUND_")
                self.assertNotEqual(migrations[old_id]["migration_status"], "MOVED_TO_BACKGROUND", old_id)


class Phase3DR2CPopulationBoundaryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.preparer = importlib.import_module("scripts.prepare_phase3d_r2c_packages")
        cls.builder = importlib.import_module("scripts.build_phase3d_r2c")
        cls.packages = cls.preparer.prepare_all_packages(write=False)

    def test_every_old_claim_appears_once_in_claim_ledger(self):
        rows = self.builder.build_claim_ledger(self.packages)
        expected = sum(len(item["old_claim_migrations"]) for item in self.packages)
        keys = [(item["profile_id"], item["old_claim_id"]) for item in rows]
        self.assertEqual(len(rows), expected)
        self.assertEqual(len(keys), len(set(keys)))

    def test_every_unresolved_issue_uses_allowed_gap_route(self):
        rows = self.builder.build_gap_routes(self.packages)
        allowed = {
            "PROFILE_ONLY", "WORLDBOOK_REQUIRED", "EVENT_LAYER_REQUIRED", "CURRENT_STATE_REQUIRED",
            "CHARACTER_DISCOVERY_REQUIRED", "HUMAN_DECISION_REQUIRED", "SEEN_NOT_PROMOTED",
        }
        self.assertTrue(rows)
        for row in rows:
            self.assertTrue(row["routes"])
            self.assertTrue(set(row["routes"]) <= allowed, row)
            self.assertTrue(row["source_refs"])

    def test_part1_durable_impact_is_profiled_or_explicitly_routed(self):
        candidates = load_json(ROOT / "work/phase3d_r2/character_discoveries/part1_retention_candidates.json")["candidates"]
        rows = self.builder.build_part1_retention_routes(self.packages)
        by_label = {item["label"]: item for item in rows}
        for candidate in candidates:
            self.assertIn(candidate["label"], by_label)
            row = by_label[candidate["label"]]
            self.assertEqual(row["lasting_effect"], candidate["lasting_effect"])
            self.assertIn(row["disposition"], {"PROFILED", "EXPLICITLY_ROUTED"})

    def test_generic_part1_labels_are_not_promoted_without_identity_support(self):
        part1_labels = {
            item["label"]
            for item in load_json(ROOT / "work/phase3d_r2/character_discoveries/part1_retention_candidates.json")["candidates"]
        }
        names = {item["profile_metadata"]["name"] for item in self.packages}
        self.assertFalse(part1_labels & names)

    def test_dynamic_state_sources_are_current_state_d3_only(self):
        for package in self.packages:
            self.assertTrue(all(ref.startswith("current_state.md:D3") for ref in package["dynamic_state"]["source_refs"]), package["profile_id"])

    def test_historical_and_transition_material_does_not_become_d3_state(self):
        forbidden = ("P1-", "P2-", "P3-", "TRANSITION-D0", "TRANSITION-D1", "TRANSITION-D2")
        for package in self.packages:
            serialized = json.dumps(package["dynamic_state"], ensure_ascii=False)
            self.assertFalse(any(token in serialized for token in forbidden), package["profile_id"])

    def test_pc_control_report_confirms_all_four_false_permissions(self):
        report = self.builder.render_pc_control_boundary_report(self.packages)
        for key in (
            "may_generate_dialogue", "may_choose_voluntary_actions",
            "may_generate_private_thoughts", "may_assign_new_goals",
        ):
            self.assertIn(f"`{key}` = `false`", report)
        self.assertIn("PASS", report)

    def test_source_fallback_rows_have_all_required_audit_fields(self):
        rows = self.builder.build_source_fallback_rows()
        required = {"profile_id", "question", "source_consulted", "reason", "result", "canon_interpretation_changed"}
        for row in rows:
            self.assertEqual(set(row), required)


class Phase3DR2CHumanReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.builder = importlib.import_module("scripts.build_phase3d_r2c")
        cls.packages = cls.builder.load_packages()
        cls.package_map = {item["profile_id"]: item for item in cls.packages}
        cls.candidates = {item["id"]: item for item in (cls.builder.compile_candidate(package) for package in cls.packages)}
        cls.events = {item["event_id"]: item for item in load_jsonl(ROOT / "work/phase3d_r2/chronology/campaign_chronology.jsonl")}

    def test_every_candidate_has_one_thirteen_section_chinese_review(self):
        for profile_id, package in self.package_map.items():
            review = self.builder.render_character_review(package, self.candidates[profile_id], self.events)
            self.assertTrue(review.startswith(f"# {package['profile_metadata']['name']}"))
            for number in range(1, 14):
                self.assertIn(f"## {number}.", review, profile_id)
            self.assertEqual(self.builder.review_quality_errors(review, package, self.events), [], profile_id)

    def test_review_explains_events_without_requiring_id_decoding(self):
        for profile_id, package in self.package_map.items():
            review = self.builder.render_character_review(package, self.candidates[profile_id], self.events)
            for item in package["timeline_items"]:
                event = self.events[item["event_ref"]]
                self.assertIn(event["arc"], review, profile_id)
                self.assertIn(item["character_specific_summary"], review, profile_id)

    def test_review_item_ids_and_claim_dispositions_match_candidate_and_ledgers(self):
        for profile_id, package in self.package_map.items():
            review = self.builder.render_character_review(package, self.candidates[profile_id], self.events)
            for migration in package["old_claim_migrations"]:
                self.assertIn(migration["old_claim_id"], review, profile_id)
                self.assertIn(migration["migration_status"], review, profile_id)

    def test_timeline_headings_include_story_order_and_chinese_title(self):
        for profile_id, package in self.package_map.items():
            review = self.builder.render_character_review(package, self.candidates[profile_id], self.events)
            for item in package["timeline_items"]:
                event = self.events[item["event_ref"]]
                self.assertIn(f"### {item['story_order_start']} — {event['arc']}", review, profile_id)

    def test_sparse_persona_and_unknown_current_state_are_stated_explicitly(self):
        for profile_id, package in self.package_map.items():
            review = self.builder.render_character_review(package, self.candidates[profile_id], self.events)
            if not any(package["persona"][key] for key in ("core_personality", "values", "speech_style", "decision_patterns")):
                self.assertIn("人格证据稀疏", review, profile_id)
            if not any(package["dynamic_state"][key] for key in ("current_conditions", "current_obligations", "current_concerns")):
                self.assertIn("没有足够的角色专属 D3 证据", review, profile_id)

    def test_review_calls_out_theory_testimony_future_and_prohibited_inference(self):
        for profile_id in ("NPC_WHITE_MAGICIAN", "NPC_DEATHWING", "NPC_CASSANDRA", "NPC_OSHIRA"):
            review = self.builder.render_character_review(
                self.package_map[profile_id], self.candidates[profile_id], self.events
            )
            self.assertIn("禁止推断", review)
        self.assertIn("理论", self.builder.render_character_review(self.package_map["NPC_WHITE_MAGICIAN"], self.candidates["NPC_WHITE_MAGICIAN"], self.events))
        self.assertIn("证词", self.builder.render_character_review(self.package_map["NPC_DEATHWING"], self.candidates["NPC_DEATHWING"], self.events))
        self.assertIn("可能未来", self.builder.render_character_review(self.package_map["NPC_CASSANDRA"], self.candidates["NPC_CASSANDRA"], self.events))


class Phase3DR2CCompletionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.builder = importlib.import_module("scripts.build_phase3d_r2c")
        cls.common = importlib.import_module("scripts.phase3d_r2c_common")
        cls.packages = cls.builder.load_packages()

    def test_ready_status_requires_all_schema_semantic_review_and_boundary_gates(self):
        report = self.builder.render_r2c_review(self.packages)
        self.assertIn("STATUS:\nREADY_FOR_HUMAN_APPROVAL_AFTER_R2", report)
        for gate in (
            "schema fixture gate", "37/37 candidates", "37/37 中文审核",
            "304/304 old claims", "Part 1 retention", "PC control", "D3 boundary",
        ):
            self.assertIn(gate, report)

    def test_frozen_earlier_artifacts_remain_byte_identical(self):
        manifest = self.common.verify_frozen_manifest()
        self.assertEqual(manifest["status"], "FROZEN_BEFORE_R2C_BUILD")

    def test_no_worldbook_or_current_state_mutation(self):
        manifest = load_json(R2C_ROOT / "reviewed_inputs/frozen_input_manifest.json")
        tracked = {item["path"]: item["sha256"] for item in manifest["files"]}
        self.assertEqual(self.common.sha256_file(ROOT / "current_state.md"), tracked["current_state.md"])
        self.assertEqual(self.common.sha256_file(ROOT / "output/worldbook_source.jsonl"), tracked["output/worldbook_source.jsonl"])

    def test_no_approved_or_applied_patch(self):
        patch_root = R2C_ROOT / "patches"
        if patch_root.exists():
            self.assertFalse([path for path in patch_root.rglob("*") if path.is_file() and "draft" not in path.name.lower()])

    def test_no_formal_profile_database_runtime_card_director_or_phase4_output(self):
        self.assertFalse((ROOT / "output/npc_profiles.jsonl").exists())
        self.assertFalse((ROOT / "output/pc_continuity.jsonl").exists())
        forbidden_tokens = ("runtime_projection", "character_card", "gm_card", "director", "phase4")
        offenders = [
            path for path in R2C_ROOT.rglob("*")
            if any(token in path.name.lower() for token in forbidden_tokens)
        ]
        self.assertEqual(offenders, [])

    def test_two_complete_builds_are_byte_identical(self):
        with tempfile.TemporaryDirectory() as first, tempfile.TemporaryDirectory() as second:
            first_root, second_root = Path(first) / "r2c", Path(second) / "r2c"
            self.builder.build_all(output_root=first_root, packages=self.packages)
            self.builder.build_all(output_root=second_root, packages=self.packages)
            first_files = {path.relative_to(first_root).as_posix(): path.read_bytes() for path in first_root.rglob("*") if path.is_file()}
            second_files = {path.relative_to(second_root).as_posix(): path.read_bytes() for path in second_root.rglob("*") if path.is_file()}
            self.assertEqual(first_files, second_files)
            self.assertGreater(len(first_files), 80)

    def test_check_mode_detects_generated_drift_without_rewriting(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "r2c"
            self.builder.build_all(output_root=output, packages=self.packages)
            target = output / "reports/r2c_review.md"
            before = target.read_bytes()
            target.write_text(target.read_text(encoding="utf-8") + "drift", encoding="utf-8")
            drifted = target.read_bytes()
            with self.assertRaises(self.builder.GeneratedOutputMismatch):
                self.builder.check_all(output_root=output, packages=self.packages)
            self.assertNotEqual(before, drifted)
            self.assertEqual(target.read_bytes(), drifted)


if __name__ == "__main__":
    unittest.main()
