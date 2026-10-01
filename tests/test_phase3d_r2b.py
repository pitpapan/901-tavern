import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

from scripts.validate_authoring_framework import schema_errors, validate_schema_contract


ROOT = Path(__file__).resolve().parents[1]
R2A = ROOT / "work" / "phase3d_r2"
R2B = ROOT / "work" / "phase3d_r2b"
EVENT_SCHEMA_PATH = ROOT / "schema" / "r2b_campaign_event.schema.json"
INDEX_SCHEMA_PATH = ROOT / "schema" / "r2b_character_temporal_index.schema.json"
CROSSWALK_SCHEMA_PATH = ROOT / "schema" / "r2b_canon_layer_crosswalk.schema.json"
MANIFEST_PATH = R2B / "reviewed_inputs" / "authoritative_input_manifest.json"
CROSSWALK_PATH = R2B / "reviewed_inputs" / "canon_layer_crosswalk.json"
BUILDER_PATH = ROOT / "scripts" / "build_phase3d_r2b.py"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def load_jsonl(path: Path):
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8-sig").splitlines()
        if line.strip()
    ]


def authoritative_paths():
    paths = [
        R2A / "chronology" / "campaign_chronology.jsonl",
        R2A / "chronology" / "campaign_chronology.md",
        R2A / "reports" / "chronology_coverage_metrics.json",
        R2A / "reports" / "early_arc_character_retention.md",
        R2A / "reports" / "r2a_review.md",
    ]
    paths.extend(sorted((R2A / "character_discoveries").glob("*")))
    paths.extend(sorted((R2A / "event_audits").glob("*")))
    return [path for path in paths if path.is_file()]


def load_builder():
    if not BUILDER_PATH.is_file():
        raise AssertionError(f"R2B builder is missing: {BUILDER_PATH}")
    spec = importlib.util.spec_from_file_location("build_phase3d_r2b", BUILDER_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class Phase3DR2BSchemaContractTests(unittest.TestCase):
    def require_file(self, path: Path):
        self.assertTrue(path.is_file(), f"required R2B contract is missing: {path}")

    def test_authoritative_manifest_covers_every_declared_r2a_input(self):
        self.require_file(MANIFEST_PATH)
        manifest = load_json(MANIFEST_PATH)
        expected = {path.relative_to(ROOT).as_posix() for path in authoritative_paths()}
        actual = {item["path"] for item in manifest["files"]}
        self.assertEqual(expected, actual)
        self.assertEqual(11, len(actual))
        for item in manifest["files"]:
            path = ROOT / item["path"]
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), item["sha256"])

    def test_all_66_r2a_events_validate_without_shape_loss(self):
        self.require_file(EVENT_SCHEMA_PATH)
        schema = load_json(EVENT_SCHEMA_PATH)
        validate_schema_contract("r2b_campaign_event", schema)
        events = load_jsonl(R2A / "chronology" / "campaign_chronology.jsonl")
        self.assertEqual(66, len(events))
        errors = [
            (event["event_id"], error)
            for event in events
            for error in schema_errors(event, schema)
        ]
        self.assertEqual([], errors)

    def test_event_schema_accepts_actual_optional_sequence_and_null_span_shapes(self):
        self.require_file(EVENT_SCHEMA_PATH)
        schema = load_json(EVENT_SCHEMA_PATH)
        events = load_jsonl(R2A / "chronology" / "campaign_chronology.jsonl")
        self.assertEqual(1, sum("sequence" in event for event in events))
        self.assertEqual(4, sum(event["source_span"] is None for event in events))
        self.assertEqual(
            1,
            sum(
                "participant_kind" in participant
                for event in events
                for participant in event["participants"]
            ),
        )
        for event in events:
            self.assertEqual([], schema_errors(event, schema), event["event_id"])

    def test_crosswalk_preserves_source_and_profile_layer_namespaces(self):
        self.require_file(CROSSWALK_SCHEMA_PATH)
        self.require_file(CROSSWALK_PATH)
        schema = load_json(CROSSWALK_SCHEMA_PATH)
        crosswalk = load_json(CROSSWALK_PATH)
        validate_schema_contract("r2b_canon_layer_crosswalk", schema)
        self.assertEqual([], schema_errors(crosswalk, schema))
        self.assertEqual(
            [
                ("original_campaign", "original_campaign", "original_campaign"),
                (
                    "original_campaign_special_interlude",
                    "special_interlude",
                    "special_interlude",
                ),
                ("transition_canon", "transition_canon", "transition"),
            ],
            [
                (
                    item["source_canon_layer"],
                    item.get("source_story_temporal_scope"),
                    item["profile_canon_layer"],
                )
                for item in crosswalk["mappings"]
            ],
        )


class Phase3DR2BLosslessStoreTests(unittest.TestCase):
    def build_in_temp(self):
        builder = load_builder()
        temporary = tempfile.TemporaryDirectory()
        output_root = Path(temporary.name) / "phase3d_r2b"
        result = builder.build_normalized_store(output_root=output_root)
        return builder, temporary, output_root, result

    def test_normalized_store_is_semantically_equal_one_to_one(self):
        _, temporary, output_root, result = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        source = load_jsonl(R2A / "chronology" / "campaign_chronology.jsonl")
        normalized = load_jsonl(output_root / "normalized" / "campaign_events.jsonl")
        self.assertEqual(source, normalized)
        self.assertEqual(66, result["semantic_round_trip_equal"])
        self.assertEqual(0, result["semantic_round_trip_differences"])

    def test_normalized_store_preserves_ids_line_order_story_order_and_revelations(self):
        _, temporary, output_root, _ = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        source = load_jsonl(R2A / "chronology" / "campaign_chronology.jsonl")
        normalized = load_jsonl(output_root / "normalized" / "campaign_events.jsonl")
        self.assertEqual(
            [event["event_id"] for event in source],
            [event["event_id"] for event in normalized],
        )
        self.assertEqual(
            [event["story_axis"] for event in source],
            [event["story_axis"] for event in normalized],
        )
        self.assertEqual(
            [
                revelation["revelation_id"]
                for event in source
                for revelation in event["character_revelations"]
            ],
            [
                revelation["revelation_id"]
                for event in normalized
                for revelation in event["character_revelations"]
            ],
        )

    def test_derivation_manifest_names_only_r2a_as_authority(self):
        _, temporary, output_root, _ = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        manifest = load_json(output_root / "normalized" / "derivation_manifest.json")
        self.assertTrue(manifest["derived_only"])
        self.assertEqual(
            "work/phase3d_r2/chronology/campaign_chronology.jsonl",
            manifest["authority"]["path"],
        )
        self.assertEqual(66, manifest["record_count"])
        self.assertNotIn("authoring_inputs", manifest)

    def test_schema_defect_stops_before_any_migration_output(self):
        builder = load_builder()
        with tempfile.TemporaryDirectory() as temporary:
            temporary_root = Path(temporary)
            output_root = temporary_root / "phase3d_r2b"
            broken_schema = load_json(EVENT_SCHEMA_PATH)
            broken_schema["properties"]["canon_layer"]["enum"] = ["impossible_layer"]
            broken_schema_path = temporary_root / "broken_event.schema.json"
            broken_schema_path.write_text(
                json.dumps(broken_schema, ensure_ascii=False), encoding="utf-8"
            )
            with self.assertRaises(builder.SchemaDefectError):
                builder.build_normalized_store(
                    output_root=output_root,
                    event_schema_path=broken_schema_path,
                )
            self.assertFalse((output_root / "normalized" / "campaign_events.jsonl").exists())
            blocker = load_json(output_root / "reports" / "schema_defects.json")
            self.assertEqual("R2B_SCHEMA_DEFECT_BEFORE_MIGRATION", blocker["status"])
            self.assertGreater(blocker["defect_count"], 0)

    def test_check_mode_detects_manually_changed_derived_store(self):
        builder, temporary, output_root, _ = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        path = output_root / "normalized" / "campaign_events.jsonl"
        rows = load_jsonl(path)
        rows[0]["arc"] = "MANUAL_SECOND_AUTHORITY"
        path.write_text(
            "".join(
                json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
                + "\n"
                for row in rows
            ),
            encoding="utf-8",
            newline="\n",
        )
        with self.assertRaises(builder.DerivedOutputMismatch):
            builder.check_normalized_store(output_root=output_root)


class Phase3DR2BTemporalIndexTests(unittest.TestCase):
    def build_in_temp(self):
        builder = load_builder()
        if not hasattr(builder, "build_all_outputs"):
            raise AssertionError("R2B mechanical index builder is not implemented")
        temporary = tempfile.TemporaryDirectory()
        output_root = Path(temporary.name) / "phase3d_r2b"
        result = builder.build_all_outputs(output_root=output_root)
        indexes = load_jsonl(output_root / "indexes" / "character_temporal_indexes.jsonl")
        return builder, temporary, output_root, result, indexes

    def test_exactly_36_indexes_are_generated_and_validate(self):
        _, temporary, output_root, result, indexes = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        self.assertEqual(36, len(indexes))
        self.assertEqual(36, result["temporal_index_count"])
        self.assertEqual(36, len(list((output_root / "indexes" / "by_profile").glob("*.json"))))
        schema = load_json(INDEX_SCHEMA_PATH)
        validate_schema_contract("r2b_character_temporal_index", schema)
        for index in indexes:
            self.assertEqual([], schema_errors(index, schema), index["profile_id"])

    def test_links_come_only_from_exact_participant_or_revelation_refs(self):
        _, temporary, _, _, indexes = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        events = load_jsonl(R2A / "chronology" / "campaign_chronology.jsonl")
        by_profile = {index["profile_id"]: index for index in indexes}
        for profile_id, index in by_profile.items():
            expected = [
                event["event_id"]
                for event in events
                if any(
                    participant.get("character_ref") == profile_id
                    for participant in event["participants"]
                )
                or any(
                    revelation.get("character_ref") == profile_id
                    for revelation in event["character_revelations"]
                )
            ]
            self.assertEqual(expected, [link["event_id"] for link in index["event_links"]])

    def test_index_keeps_source_layer_and_profile_mapping_together(self):
        _, temporary, _, _, indexes = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        allowed = {
            ("original_campaign", "original_campaign", "original_campaign"),
            (
                "original_campaign_special_interlude",
                "special_interlude",
                "special_interlude",
            ),
            ("transition_canon", "transition_canon", "transition"),
        }
        pairs = {
            (
                link["source_canon_layer"],
                link.get("source_story_temporal_scope"),
                link["profile_canon_layer"],
            )
            for index in indexes
            for link in index["event_links"]
        }
        self.assertEqual(allowed, pairs)

    def test_empty_profile_index_is_preserved_without_inference(self):
        _, temporary, _, _, indexes = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        by_profile = {index["profile_id"]: index for index in indexes}
        self.assertEqual([], by_profile["NPC_ZHENZI"]["event_links"])

    def test_yang_and_other_labels_are_not_promoted_to_profile_ids(self):
        _, temporary, output_root, _, indexes = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        self.assertNotIn("NPC_YANG", {index["profile_id"] for index in indexes})
        for index in indexes:
            self.assertNotIn("杨", json.dumps(index, ensure_ascii=False))
        report = (output_root / "reports" / "unresolved_character_labels.md").read_text(
            encoding="utf-8"
        )
        self.assertIn("杨", report)
        self.assertIn("CHARACTER_YANG.json", report)

    def test_indexes_contain_no_r2c_semantic_migration_fields(self):
        _, temporary, _, _, indexes = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        forbidden = {
            "background",
            "timeline",
            "relationship_timeline",
            "knowledge_timeline",
            "ability_status_timeline",
            "current_state",
            "character_consequences",
            "relationship_consequences",
            "knowledge_consequences",
            "ability_status_consequences",
            "routing",
        }

        def keys(value):
            if isinstance(value, dict):
                result = set(value)
                for item in value.values():
                    result.update(keys(item))
                return result
            if isinstance(value, list):
                result = set()
                for item in value:
                    result.update(keys(item))
                return result
            return set()

        for index in indexes:
            self.assertEqual(set(), keys(index) & forbidden, index["profile_id"])


class Phase3DR2BBoundaryTests(unittest.TestCase):
    def build_in_temp(self):
        builder = load_builder()
        temporary = tempfile.TemporaryDirectory()
        output_root = Path(temporary.name) / "phase3d_r2b"
        result = builder.build_all_outputs(output_root=output_root)
        return temporary, output_root, result

    def test_final_report_declares_ready_only_after_all_gates_pass(self):
        temporary, output_root, result = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        report_path = output_root / "reports" / "r2b_review.md"
        self.assertTrue(report_path.is_file(), "final R2B review report is missing")
        report = report_path.read_text(encoding="utf-8")
        self.assertEqual("R2B_NORMALIZED_TEMPORAL_SCHEMA_READY_FOR_REVIEW", result["status"])
        self.assertIn("R2B_NORMALIZED_TEMPORAL_SCHEMA_READY_FOR_REVIEW", report)
        for gate in (
            "authoritative_inputs_frozen",
            "event_schema_compatible",
            "semantic_round_trip",
            "derived_only_authority",
            "canon_layer_crosswalk",
            "mechanical_indexes_only",
            "r2c_semantic_migration_absent",
        ):
            self.assertEqual("PASS", result["gates"][gate])
            self.assertIn(f"`{gate}`：`PASS`", report)

    def test_r2a_authoritative_inputs_remain_byte_identical(self):
        before = {path: hashlib.sha256(path.read_bytes()).hexdigest() for path in authoritative_paths()}
        temporary, _, _ = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        after = {path: hashlib.sha256(path.read_bytes()).hexdigest() for path in authoritative_paths()}
        self.assertEqual(before, after)

    def test_no_formal_profile_database_patch_approval_or_r2c_output_is_created(self):
        temporary, output_root, _ = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        self.assertFalse((ROOT / "output" / "npc_profiles.jsonl").exists())
        self.assertFalse((ROOT / "output" / "pc_continuity.jsonl").exists())
        self.assertFalse((output_root / "r2c").exists())
        patch = load_json(R2A / "patches" / "PATCH_R2A_001_character_yang.json")
        self.assertEqual("draft", patch["status"])
        self.assertFalse(patch["approved"])
        self.assertFalse(patch["applied"])

    def test_pc_permissions_and_existing_profile_candidates_remain_unchanged(self):
        profile_paths = sorted((ROOT / "work" / "phase3d" / "approved_candidates").glob("*.json"))
        profile_paths += sorted(
            (ROOT / "work" / "phase3d_recall" / "repaired_candidates").glob("*.json")
        )
        before = {path: hashlib.sha256(path.read_bytes()).hexdigest() for path in profile_paths}
        temporary, _, _ = self.build_in_temp()
        self.addCleanup(temporary.cleanup)
        after = {path: hashlib.sha256(path.read_bytes()).hexdigest() for path in profile_paths}
        self.assertEqual(before, after)
        pc = load_json(ROOT / "work" / "phase3d_recall" / "repaired_candidates" / "PC_YU_LINFENG.json")
        self.assertFalse(pc["ai_permissions"]["may_generate_dialogue"])
        self.assertFalse(pc["ai_permissions"]["may_choose_voluntary_actions"])
        self.assertFalse(pc["ai_permissions"]["may_generate_private_thoughts"])
        self.assertFalse(pc["ai_permissions"]["may_assign_new_goals"])


class Phase3DR2BDeterminismTests(unittest.TestCase):
    def test_failed_full_build_preserves_existing_derived_outputs(self):
        builder = load_builder()
        with tempfile.TemporaryDirectory() as temporary:
            temporary_root = Path(temporary)
            output_root = temporary_root / "phase3d_r2b"
            builder.build_all_outputs(output_root=output_root)

            def snapshot():
                return {
                    path.relative_to(output_root).as_posix(): hashlib.sha256(
                        path.read_bytes()
                    ).hexdigest()
                    for root_name in ("normalized", "indexes", "reports")
                    for path in (output_root / root_name).rglob("*")
                    if path.is_file() and path.name != "schema_defects.json"
                }

            before = snapshot()
            broken_schema = load_json(EVENT_SCHEMA_PATH)
            broken_schema["properties"]["canon_layer"]["enum"] = ["impossible_layer"]
            broken_schema_path = temporary_root / "broken_event.schema.json"
            broken_schema_path.write_text(
                json.dumps(broken_schema, ensure_ascii=False), encoding="utf-8"
            )
            with self.assertRaises(builder.SchemaDefectError):
                builder.build_all_outputs(
                    output_root=output_root,
                    event_schema_path=broken_schema_path,
                )
            self.assertEqual(before, snapshot())
            self.assertTrue((output_root / "reports" / "schema_defects.json").is_file())

    def test_successful_build_removes_stale_schema_defect_report(self):
        builder = load_builder()
        with tempfile.TemporaryDirectory() as temporary:
            output_root = Path(temporary) / "phase3d_r2b"
            builder.build_all_outputs(output_root=output_root)
            blocker = output_root / "reports" / "schema_defects.json"
            blocker.write_text('{"status":"STALE"}\n', encoding="utf-8")
            builder.build_all_outputs(output_root=output_root)
            self.assertFalse(blocker.exists())

    def test_check_all_outputs_detects_temporal_index_tamper(self):
        builder = load_builder()
        self.assertTrue(
            hasattr(builder, "check_all_outputs"),
            "read-only full derived-layer checker is not implemented",
        )
        with tempfile.TemporaryDirectory() as temporary:
            output_root = Path(temporary) / "phase3d_r2b"
            builder.build_all_outputs(output_root=output_root)
            path = output_root / "indexes" / "by_profile" / "NPC_ZHENZI.json"
            index = load_json(path)
            index["notes"] = "MANUAL_SECOND_AUTHORITY"
            path.write_text(json.dumps(index, ensure_ascii=False), encoding="utf-8")
            with self.assertRaises(builder.DerivedOutputMismatch):
                builder.check_all_outputs(output_root=output_root)

    def test_two_complete_builds_are_byte_identical(self):
        builder = load_builder()
        with tempfile.TemporaryDirectory() as temporary:
            output_root = Path(temporary) / "phase3d_r2b"
            builder.build_all_outputs(output_root=output_root)

            def snapshot():
                roots = [
                    output_root / "normalized",
                    output_root / "indexes",
                    output_root / "reports",
                ]
                paths = sorted(
                    path
                    for root in roots
                    for path in root.rglob("*")
                    if path.is_file()
                )
                return {
                    path.relative_to(output_root).as_posix(): hashlib.sha256(
                        path.read_bytes()
                    ).hexdigest()
                    for path in paths
                }

            first = snapshot()
            builder.build_all_outputs(output_root=output_root)
            second = snapshot()
            self.assertGreaterEqual(len(first), 43)
            self.assertEqual(first, second)


if __name__ == "__main__":
    unittest.main()
