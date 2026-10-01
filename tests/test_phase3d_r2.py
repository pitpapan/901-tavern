import importlib
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_builder():
    try:
        return importlib.import_module("scripts.build_phase3d_r2")
    except ModuleNotFoundError:
        return None


class Phase3DR2PreflightTests(unittest.TestCase):
    """Break caught: the R2A builder loses a source page/post or permits a one-axis event."""

    def test_source_inventory_has_exact_campaign_population(self):
        builder = load_builder()
        self.assertIsNotNone(builder, "scripts.build_phase3d_r2 must exist")

        chunks = builder.discover_source_posts()
        counts = {}
        pages = {}
        for chunk in chunks:
            part = chunk["campaign_part"]
            counts[part] = counts.get(part, 0) + 1
            pages.setdefault(part, set()).add(chunk["page"])

        self.assertEqual(counts, {"P1": 1394, "P2": 1204, "P3": 250})
        self.assertEqual({part: len(values) for part, values in pages.items()}, {"P1": 28, "P2": 25, "P3": 5})
        self.assertEqual(len(chunks), 2848)
        self.assertEqual(len({row["source_chunk_id"] for row in chunks}), 2848)
        self.assertEqual(len({row["source_order"] for row in chunks}), 2848)

    def test_event_contract_requires_independent_story_and_source_axes(self):
        builder = load_builder()
        self.assertIsNotNone(builder, "scripts.build_phase3d_r2 must exist")
        event = {
            "event_id": "EVENT_P1_001",
            "campaign_part": "P1",
            "arc": "测试弧",
            "story_axis": {
                "story_order_start": "P1-001",
                "story_order_end": None,
                "temporal_scope": "original_campaign",
                "order_certainty": "confirmed",
            },
            "source_axis": [{
                "source_order": "P1-P001-POST-0001",
                "source_chunk_id": "SRC_P1_P001_POST_0001_816001",
                "document": "extracted-first/1/posts.jsonl",
                "post_id": "816001",
                "reference": "post 816001",
            }],
            "location": {"label": "未知", "certainty": "unknown"},
            "participants": [{"character_ref": "PC_YU_LINFENG", "role": "participant"}],
            "event_summary": "用于验证事件数据契约。",
            "objective_results": ["测试结果。"],
            "character_consequences": [],
            "relationship_consequences": [],
            "ability_status_consequences": [],
            "knowledge_consequences": [],
            "character_revelations": [],
            "unresolved_questions": [],
            "canon_layer": "original_campaign",
            "routing": [{"target": "CHARACTER_TIMELINE", "reason": "测试路由。"}],
        }
        self.assertEqual(builder.validate_event_record(event), [])

        missing_story = dict(event)
        missing_story.pop("story_axis")
        self.assertIn("missing story_axis", builder.validate_event_record(missing_story))

        missing_source = dict(event)
        missing_source["source_axis"] = []
        self.assertIn("source_axis must be a non-empty list", builder.validate_event_record(missing_source))

        missing_revelations = dict(event)
        missing_revelations.pop("character_revelations")
        self.assertIn("missing character_revelations", builder.validate_event_record(missing_revelations))

    def test_preflight_freezes_phase3d_r_and_initializes_review_inputs(self):
        builder = load_builder()
        self.assertIsNotNone(builder, "scripts.build_phase3d_r2 must exist")
        builder.build_preflight()

        manifest_path = ROOT / "work" / "phase3d_r2" / "preflight_manifest.json"
        payload = json.loads(manifest_path.read_text(encoding="utf-8"))
        self.assertEqual(payload["phase"], "3D-R2A")
        self.assertEqual(payload["status"], "CAMPAIGN_CHRONOLOGY_RECONSTRUCTION_REQUIRED")
        self.assertEqual(payload["source_population"]["total_posts"], 2848)
        protected = payload["protected_files"]
        self.assertIn("work/phase3d_recall_review.md", protected)
        self.assertIn("work/phase3d_recall/reports/gap_metrics.json", protected)
        self.assertIn("output/worldbook_source.jsonl", protected)
        self.assertIn("current_state.md", protected)
        self.assertGreater(len(protected), 430)

        reviewed = ROOT / "work" / "phase3d_r2" / "reviewed_inputs"
        for name in ("events.jsonl", "revelations.jsonl", "chunk_decisions.jsonl"):
            self.assertTrue((reviewed / name).is_file(), name)


class Phase3DR2SourceLedgerTests(unittest.TestCase):
    """Break caught: a source post silently disappears or a split post leaves unreviewed remainder."""

    def test_strict_ledger_requires_one_final_decision_per_parent_post(self):
        builder = load_builder()
        self.assertIsNotNone(builder)
        self.assertTrue(hasattr(builder, "build_chunk_ledger"), "build_chunk_ledger must exist")
        chunks = [
            {"source_chunk_id": "SRC_A", "campaign_part": "P1", "page": 1, "post_id": "1", "source_order": "P1-P001-POST-0001"},
            {"source_chunk_id": "SRC_B", "campaign_part": "P1", "page": 1, "post_id": "2", "source_order": "P1-P001-POST-0002"},
        ]
        decisions = [{
            "source_chunk_id": "SRC_A",
            "review_status": "reviewed",
            "coverage_scope": "whole_post",
            "dispositions": [{"type": "EVENT", "target_id": "EVENT_P1_001", "reason": "重大事件。"}],
        }]
        with self.assertRaisesRegex(ValueError, "missing final decision for SRC_B"):
            builder.build_chunk_ledger(chunks, decisions)

        decisions.append({
            "source_chunk_id": "SRC_B",
            "review_status": "reviewed",
            "coverage_scope": "whole_post",
            "dispositions": [{"type": "SEEN_NOT_PROMOTED", "reason": "纯规则掷骰，无持续连续性。"}],
        })
        ledger = builder.build_chunk_ledger(chunks, decisions)
        self.assertEqual([row["source_chunk_id"] for row in ledger], ["SRC_A", "SRC_B"])
        self.assertTrue(all(row["review_status"] == "reviewed" for row in ledger))

    def test_segmented_post_requires_explicit_remainder_disposition(self):
        builder = load_builder()
        self.assertIsNotNone(builder)
        self.assertTrue(hasattr(builder, "build_chunk_ledger"), "build_chunk_ledger must exist")
        chunk = {"source_chunk_id": "SRC_LONG", "campaign_part": "P1", "page": 1, "post_id": "9", "source_order": "P1-P001-POST-0009"}
        incomplete = [{
            "source_chunk_id": "SRC_LONG",
            "review_status": "reviewed",
            "coverage_scope": "segments",
            "segments": [{
                "segment_index": 1,
                "reference": "lines 1-8",
                "dispositions": [{"type": "BIOGRAPHICAL_BACKGROUND", "target_id": "BG_TEST", "reason": "背景揭示。"}],
            }],
        }]
        with self.assertRaisesRegex(ValueError, "segmented decision requires remainder_disposition"):
            builder.build_chunk_ledger([chunk], incomplete)

        incomplete[0]["remainder_disposition"] = {
            "type": "SEEN_NOT_PROMOTED",
            "reason": "其余为规则说明。",
        }
        ledger = builder.build_chunk_ledger([chunk], incomplete)
        self.assertEqual(ledger[0]["coverage_scope"], "segments")
        self.assertEqual(len(ledger[0]["segments"]), 1)

    def test_preflight_writes_source_inventory_and_provisional_ledger(self):
        builder = load_builder()
        self.assertIsNotNone(builder)
        self.assertTrue(hasattr(builder, "build_source_coverage_scaffold"), "build_source_coverage_scaffold must exist")
        builder.build_source_coverage_scaffold()
        coverage = ROOT / "work" / "phase3d_r2" / "source_coverage"
        inventory = json.loads((coverage / "source_inventory.json").read_text(encoding="utf-8"))
        self.assertEqual(inventory["total_posts"], 2848)
        ledger_rows = [json.loads(line) for line in (coverage / "source_chunk_ledger.jsonl").read_text(encoding="utf-8").splitlines()]
        self.assertEqual(len(ledger_rows), 2848)
        self.assertTrue(all(row["review_status"] == "pending" for row in ledger_rows))
        for name in ("part1_coverage.md", "part2_coverage.md", "part3_coverage.md", "special_interlude_coverage.md", "transition_coverage.md"):
            self.assertTrue((coverage / name).is_file(), name)


class Phase3DR2Part1Tests(unittest.TestCase):
    """Break caught: Part 1 is declared covered while an event participant or durable early character vanishes."""

    def test_part1_reviewed_inputs_cover_every_source_chunk(self):
        builder = load_builder()
        self.assertIsNotNone(builder)
        self.assertTrue(hasattr(builder, "build_part1_outputs"), "build_part1_outputs must exist")
        result = builder.build_part1_outputs()
        self.assertEqual(result["source_chunks"], 1394)
        self.assertEqual(result["reviewed_chunks"], 1394)
        self.assertEqual(result["pending_chunks"], 0)
        self.assertGreaterEqual(result["events"], 22)

    def test_part1_event_granularity_separates_disaster_transfer_and_tail_hook(self):
        builder = load_builder()
        self.assertIsNotNone(builder)
        self.assertTrue(hasattr(builder, "load_expanded_events"), "load_expanded_events must exist")
        events = {row["event_id"]: row for row in builder.load_expanded_events() if row["campaign_part"] == "P1"}
        self.assertIn("EVENT_P1_020_MONSTER_BOX_DISASTER", events)
        self.assertIn("EVENT_P1_021_JERGAL_TRANSFER", events)
        self.assertIn("EVENT_P1_022_EXECUTION_TAIL_HOOK", events)
        self.assertLess(
            events["EVENT_P1_020_MONSTER_BOX_DISASTER"]["story_axis"]["story_order_start"],
            events["EVENT_P1_021_JERGAL_TRANSFER"]["story_axis"]["story_order_start"],
        )
        self.assertLess(
            events["EVENT_P1_021_JERGAL_TRANSFER"]["story_axis"]["story_order_start"],
            events["EVENT_P1_022_EXECUTION_TAIL_HOOK"]["story_axis"]["story_order_start"],
        )
        for event in events.values():
            self.assertEqual(builder.validate_event_record(event), [], event["event_id"])

    def test_part1_retention_gate_covers_participants_and_revelation_characters(self):
        builder = load_builder()
        self.assertIsNotNone(builder)
        self.assertTrue(hasattr(builder, "validate_part1_retention"), "validate_part1_retention must exist")
        errors = builder.validate_part1_retention()
        self.assertEqual(errors, [])
        report = (ROOT / "work" / "phase3d_r2" / "reports" / "early_arc_character_retention.md").read_text(encoding="utf-8")
        for label in (
            "FADES_FROM_MAIN_PLOT",
            "DECEASED_OR_EXITED",
            "ONE_OR_FEW_SCENES_BUT_DURABLE_IMPACT",
            "大妈",
            "阿德莱德",
            "佐间",
            "雅儿",
            "黄祸龙狼",
        ):
            self.assertIn(label, report)
        self.assertNotIn("因触发词", report)
        self.assertNotIn("trigger unsuitable → reject", report)


class Phase3DR2Part2Tests(unittest.TestCase):
    """Break caught: Part 2 pages are marked done while dream material leaks or chronology is unsortable."""

    def test_part2_reviewed_inputs_cover_all_pages_and_chunks(self):
        builder = load_builder()
        self.assertTrue(hasattr(builder, "build_part_outputs"))
        result = builder.build_part_outputs("P2")
        self.assertEqual(result["pages"], 25)
        self.assertEqual(result["source_chunks"], 1204)
        self.assertEqual(result["reviewed_chunks"], 1204)
        self.assertEqual(result["pending_chunks"], 0)
        self.assertGreaterEqual(result["events"], 29)

    def test_part2_story_orders_are_unique_and_material_items_are_routed(self):
        builder = load_builder()
        events = [row for row in builder.load_expanded_events() if row["source_campaign_part"] == "P2"]
        orders = [row["story_axis"]["story_order_start"] for row in events]
        self.assertEqual(len(orders), len(set(orders)))
        for event in events:
            self.assertEqual(builder.validate_event_record(event), [], event["event_id"])
            self.assertTrue(event["routing"], event["event_id"])
            self.assertTrue(event["event_summary"], event["event_id"])

    def test_part2_dream_is_isolated_and_armory_is_not_prison_tower(self):
        builder = load_builder()
        events = [row for row in builder.load_expanded_events() if row["source_campaign_part"] == "P2"]
        dreams = [row for row in events if row["campaign_part"] == "SPECIAL_INTERLUDE"]
        self.assertGreaterEqual(len(dreams), 9)
        self.assertTrue(all(row["canon_layer"] == "original_campaign_special_interlude" for row in dreams))
        armory = next(row for row in events if row["event_id"] == "EVENT_P2_023_WHITE_MAGICIAN_ARMORY_CONFRONTATION")
        self.assertIn("地下兵工厂", armory["event_summary"])
        self.assertNotIn("监狱塔", armory["event_summary"])


class Phase3DR2Part3Tests(unittest.TestCase):
    """Break caught: the finale loses an actor/sequence or possible futures become current motives."""

    def test_part3_reviewed_inputs_cover_all_pages_and_chunks(self):
        builder = load_builder()
        result = builder.build_part_outputs("P3")
        self.assertEqual(result["pages"], 5)
        self.assertEqual(result["source_chunks"], 250)
        self.assertEqual(result["reviewed_chunks"], 250)
        self.assertGreaterEqual(result["events"], 11)

    def test_deathwing_finale_has_participants_sequence_and_nonpermanent_result(self):
        builder = load_builder()
        event = next(row for row in builder.load_expanded_events() if row["event_id"] == "EVENT_P3_009_DEATHWING_FINAL_WAR")
        refs = {row.get("character_ref") for row in event["participants"]}
        for ref in ("PC_YU_LINFENG", "NPC_XIERLUN_VON_GILCODE", "NPC_YOUYOU", "NPC_DEATHWING"):
            self.assertIn(ref, refs)
        self.assertGreaterEqual(len(event["sequence"]), 5)
        joined = " ".join(event["objective_results"] + event["unresolved_questions"])
        self.assertIn("本轮肉身", joined)
        self.assertNotIn("永久死亡已确认", joined)

    def test_cassandra_current_motivation_is_separate_from_possible_future(self):
        builder = load_builder()
        revelations = {row["revelation_id"]: row for row in builder.load_revelations()}
        current = revelations["REVEAL_P3_CASSANDRA_CURRENT_REVENGE_001"]
        future = revelations["REVEAL_P3_CASSANDRA_POSSIBLE_FUTURE_001"]
        self.assertNotEqual(current["statement"], future["statement"])
        self.assertIn(current["evidence_status"], {"confirmed_observation", "character_testimony"})
        self.assertEqual(future["evidence_status"], "possible_future")
        self.assertIn("当前", current["temporal_scope"])
        self.assertIn("可能未来", future["temporal_scope"])


class Phase3DR2TransitionAndFocusTests(unittest.TestCase):
    """Break caught: Transition invents scenes, or Canon identity is rejected for runtime-key reasons."""

    def test_transition_has_exact_d0_d3_anchors_and_current_state_sources(self):
        builder = load_builder()
        events = [row for row in builder.load_expanded_events() if row["campaign_part"] == "TRANSITION"]
        self.assertEqual([row["story_axis"]["story_order_start"] for row in events], [
            "TRANSITION-D0", "TRANSITION-D1", "TRANSITION-D2", "TRANSITION-D3",
        ])
        for event in events:
            self.assertEqual(event["canon_layer"], "transition_canon")
            self.assertTrue(all(source["document"] == "current_state.md" for source in event["source_axis"]))
        d1 = events[1]
        joined = " ".join(d1["objective_results"] + d1["character_consequences"])
        for expected in ("白魔取走魔宝石", "龙族秘境", "撤离", "紧急治疗"):
            self.assertIn(expected, joined)
        self.assertNotIn("御临风背着", joined)

    def test_yang_discovery_separates_canon_identity_from_runtime_trigger(self):
        path = ROOT / "work" / "phase3d_r2" / "character_discoveries" / "CHARACTER_YANG.json"
        payload = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual(payload["canonical_name"], "杨")
        self.assertEqual(payload["entity_class"], "character")
        self.assertEqual(payload["runtime_trigger_policy"]["status"], "deferred")
        self.assertTrue(payload["canon_identity_independent_of_trigger"])
        self.assertNotIn("aliases", payload)

    def test_required_focus_reports_preserve_attribution_and_unknowns(self):
        reports = ROOT / "work" / "phase3d_r2" / "reports"
        deathwing = (reports / "deathwing_background_audit.md").read_text(encoding="utf-8")
        cassandra = (reports / "cassandra_motivation_audit.md").read_text(encoding="utf-8")
        yang = (reports / "yang_character_audit.md").read_text(encoding="utf-8")
        aliases = (reports / "unresolved_identity_aliases.md").read_text(encoding="utf-8")
        for marker in ("黑龙 testimony", "角色推理", "白魔理论", "UNKNOWN"):
            self.assertIn(marker, deathwing)
        self.assertIn("当前动机", cassandra)
        self.assertIn("可能未来", cassandra)
        self.assertIn("Canon identity", yang)
        self.assertIn("runtime trigger", yang)
        self.assertIn("瑟西斯", aliases)
        self.assertIn("凯多", aliases)
        self.assertIn("UNRESOLVED", aliases)
        self.assertIn("祝福之子", deathwing)
        finale = (reports / "dragon_sanctuary_finale_audit.md").read_text(encoding="utf-8")
        for marker in ("赤炎龙王本多", "元素龙王瑟坦特", "笛剑", "魔法结界", "失去意识"):
            self.assertIn(marker, finale)


class Phase3DR2FinalBuildTests(unittest.TestCase):
    """Break caught: R2A claims ready with pending chunks, irreproducible metrics, or missing stop boundary."""

    @classmethod
    def setUpClass(cls):
        builder = load_builder()
        cls.result = builder.build_all_outputs()

    def test_final_ledger_has_2848_reviewed_parent_posts(self):
        ledger_path = ROOT / "work" / "phase3d_r2" / "source_coverage" / "source_chunk_ledger.jsonl"
        rows = [json.loads(line) for line in ledger_path.read_text(encoding="utf-8").splitlines() if line.strip()]
        self.assertEqual(len(rows), 2848)
        self.assertTrue(all(row["review_status"] == "reviewed" for row in rows))
        self.assertEqual(len({row["source_chunk_id"] for row in rows}), 2848)

    def test_chronology_and_metrics_are_reproducible(self):
        base = ROOT / "work" / "phase3d_r2"
        events = [json.loads(line) for line in (base / "chronology" / "campaign_chronology.jsonl").read_text(encoding="utf-8").splitlines()]
        revelations = [json.loads(line) for line in (base / "chronology" / "character_revelations.jsonl").read_text(encoding="utf-8").splitlines()]
        metrics = json.loads((base / "reports" / "chronology_coverage_metrics.json").read_text(encoding="utf-8"))
        self.assertEqual(metrics["totals"]["events"], len(events))
        self.assertEqual(metrics["totals"]["character_revelations"], len(revelations))
        self.assertEqual(metrics["totals"]["source_chunks"], 2848)
        self.assertEqual(metrics["totals"]["pending_source_chunks"], 0)
        self.assertEqual(metrics["parts"]["P1"]["source_chunks"], 1394)
        self.assertEqual(metrics["parts"]["P2"]["source_chunks"], 1204)
        self.assertEqual(metrics["parts"]["P3"]["source_chunks"], 250)
        self.assertIn("SPECIAL_INTERLUDE", metrics["parts"])
        self.assertIn("TRANSITION", metrics["parts"])
        for part in ("P1", "P2", "P3", "SPECIAL_INTERLUDE", "TRANSITION"):
            for field in (
                "source_files_checked", "scenes_identified", "significant_events_identified",
                "character_revelations_identified", "relationship_milestones",
                "ability_status_transitions", "knowledge_transitions", "unresolved_sections",
                "new_character_candidates", "new_event_candidates",
            ):
                self.assertIn(field, metrics["parts"][part], f"{part}.{field}")
        for event in events:
            self.assertTrue(event["story_axis"])
            self.assertTrue(event["source_axis"])
            self.assertTrue(event["continuity_classifications"])
            self.assertTrue(all(route["target"] in {
                "WORLDBOOK", "CHARACTER_BACKGROUND", "CHARACTER_TIMELINE",
                "RELATIONSHIP_TIMELINE", "KNOWLEDGE_TIMELINE", "ABILITY_STATUS_TIMELINE",
                "CURRENT_STATE", "SPECIAL_INTERLUDE", "SEEN_NOT_PROMOTED",
            } for route in event["routing"]))

    def test_part1_retention_uses_required_five_risk_categories(self):
        report = (ROOT / "work" / "phase3d_r2" / "reports" / "early_arc_character_retention.md").read_text(encoding="utf-8")
        for category in (
            "CONTINUES_ACTIVE_LATER", "OCCASIONAL_LATER", "FADES_FROM_MAIN_PLOT",
            "DECEASED_OR_EXITED", "ONE_OR_FEW_SCENES_BUT_DURABLE_IMPACT",
        ):
            self.assertIn(category, report)
        self.assertIn("Worldbook", report)
        self.assertIn("Character Profile", report)

    def test_final_report_declares_ready_and_stops_before_r2b(self):
        report = (ROOT / "work" / "phase3d_r2" / "reports" / "r2a_review.md").read_text(encoding="utf-8")
        self.assertIn("R2A_CHRONOLOGY_READY_FOR_SCHEMA_REVISION", report)
        for heading in (
            "双时间轴", "source-chunk coverage ledger", "事件粒度", "character revelation",
            "Canon/runtime trigger 解耦", "Part 1 retention gate", "停止边界",
        ):
            self.assertIn(heading, report)
        self.assertIn("未进入 R2B", report)
        self.assertFalse((ROOT / "output" / "npc_profiles.jsonl").exists())
        self.assertFalse((ROOT / "output" / "pc_continuity.jsonl").exists())

    def test_all_required_r2a_artifacts_exist(self):
        base = ROOT / "work" / "phase3d_r2"
        for relative in (
            "chronology/campaign_chronology.jsonl",
            "chronology/campaign_chronology.md",
            "chronology/character_revelations.jsonl",
            "reports/chronology_coverage_metrics.json",
            "reports/chronology_coverage_report.md",
            "reports/r2a_review.md",
            "reports/deathwing_background_audit.md",
            "reports/cassandra_motivation_audit.md",
            "reports/yang_character_audit.md",
            "reports/dragon_sanctuary_finale_audit.md",
            "reports/unresolved_identity_aliases.md",
        ):
            self.assertTrue((base / relative).is_file(), relative)


if __name__ == "__main__":
    unittest.main()
