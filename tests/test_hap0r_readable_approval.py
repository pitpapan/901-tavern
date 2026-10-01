import copy
import importlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CANDIDATES = ROOT / "work" / "phase3d_r2c" / "candidates" / "by_profile"
PACKAGES = ROOT / "work" / "phase3d_r2c" / "migration_packages"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


class HAP0RReadableApprovalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.find_spec("scripts.build_hap0r_approval_package")
        if spec is None:
            cls.generator = None
        else:
            cls.generator = importlib.import_module("scripts.build_hap0r_approval_package")

    def require_generator(self):
        self.assertIsNotNone(
            self.generator,
            "HAP-0-R readable approval generator is not implemented",
        )
        return self.generator

    def render(self, profile_id: str) -> str:
        module = self.require_generator()
        return module.render_profile(
            load_json(CANDIDATES / f"{profile_id}.json"),
            load_json(PACKAGES / f"{profile_id}.json"),
            module.load_context(ROOT),
        )

    def test_profile_uses_required_human_readable_structure(self):
        text = self.render("NPC_YOUYOU")
        required = [
            "# 悠悠",
            "## 一、人物概览",
            "## 二、已确认的背景与过去",
            "## 三、故事中的主要经历",
            "## 四、人格与价值观",
            "## 五、核心人物关系",
            "## 六、知识、认知与传闻",
            "## 七、能力、装备与状态",
            "## 八、当前可确认状态",
            "## 九、仍然未知或不能直接推断的事项",
            "## 人工审核建议重点",
            "## 人工决定",
            "# 附录：证据与技术索引",
        ]
        for heading in required:
            self.assertIn(heading, text)

    def test_main_body_is_chinese_first_and_keeps_technical_ids_in_appendix(self):
        module = self.require_generator()
        text = self.render("NPC_YOUYOU")
        main, appendix = module.split_main_and_appendix(text)
        self.assertNotIn("EVENT_", main)
        self.assertNotIn("CLAIM_", main)
        self.assertNotIn("current_stance = null", main)
        self.assertNotIn("BIOGRAPHICAL_BACKGROUND", main)
        self.assertNotIn("ACTUAL_EVENT", main)
        self.assertIn("EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY", appendix)
        self.assertIn("CLAIM_YOUYOU_ENGAGEMENT_HISTORY", appendix)
        self.assertEqual([], module.audit_profile_markdown(text)["issues"])

    def test_youyou_relationship_is_readable_and_preserves_choice_boundary(self):
        text = self.render("NPC_YOUYOU")
        main, appendix = self.require_generator().split_main_and_appendix(text)
        self.assertIn("这一安排具有当时的保护和政治背景", main)
        self.assertIn("保留悠悠之后自行选择的空间", main)
        self.assertIn("不能自动解释为永久婚约或确定的最终感情关系", main)
        self.assertIn("当前关系立场：未确认", main)
        self.assertNotIn("MILESTONE_YOUYOU_YU_LATE_MILESTONES", main)
        self.assertIn("旧聚合条目已退役，由四个具体剧情节点取代", appendix)
        self.assertEqual(1, main.count("### 与御临风"))

    def test_relationship_targets_outside_profile_population_keep_their_reviewed_names(self):
        text = self.render("NPC_NOSURI")
        main, _ = self.require_generator().split_main_and_appendix(text)
        self.assertIn("### 与欧基", main)
        self.assertNotIn("与该对象", main)
        self.assertEqual(1, main.count("### 与欧基"))

    def test_ainz_events_remain_campaign_history_without_permanent_obligation(self):
        text = self.render("NPC_AINZ_OOAL_GOWN")
        main, _ = self.require_generator().split_main_and_appendix(text)
        self.assertIn("实际参与了谈判与介入", main)
        self.assertIn("公开宣称两位龙王受到其名义保护", main)
        self.assertIn("并非人物前史", main)
        self.assertIn("没有确认这一保护宣言在故事结束后仍然构成长期、无限期的义务", main)

    def test_pc_profile_has_explicit_control_boundary(self):
        text = self.render("PC_YU_LINFENG")
        main, _ = self.require_generator().split_main_and_appendix(text)
        self.assertIn("## PC 控制边界", main)
        self.assertIn("不会替玩家决定私密思想、感情、未来选择、永久承诺或尚未作出的行动", main)
        self.assertNotIn("may_generate_private_thoughts", main)
        self.assertNotIn("may_choose_voluntary_actions", main)

    def test_unknown_english_relationship_baseline_fails_closed(self):
        module = self.require_generator()
        candidate = load_json(CANDIDATES / "NPC_CASSIUS_BRIGHT.json")
        package = load_json(PACKAGES / "NPC_CASSIUS_BRIGHT.json")
        mutated = copy.deepcopy(candidate)
        mutated["relationships"][0]["relationship_baseline"] = "unknown invented baseline"
        with self.assertRaisesRegex(ValueError, "untranslated relationship baseline"):
            module.render_profile(mutated, package, module.load_context(ROOT))

    def test_appendix_preserves_all_event_claim_destination_and_source_lineage(self):
        module = self.require_generator()
        candidate = load_json(CANDIDATES / "NPC_CASSIUS_BRIGHT.json")
        package = load_json(PACKAGES / "NPC_CASSIUS_BRIGHT.json")
        _, appendix = module.split_main_and_appendix(
            module.render_profile(candidate, package, module.load_context(ROOT))
        )
        for item in candidate["campaign_timeline"]:
            self.assertIn(item["event_ref"], appendix)
        for migration in package["old_claim_migrations"]:
            self.assertIn(migration["old_claim_id"], appendix)
            for destination_id in migration["destination_ids"]:
                self.assertIn(destination_id, appendix)
        self.assertIn("设定 人物/人物卡资料集_叙事检索版.md", appendix)

    def test_stage_build_covers_37_profiles_and_chinese_index(self):
        module = self.require_generator()
        with tempfile.TemporaryDirectory() as temp:
            result = module.build_staged_package(ROOT, Path(temp))
            self.assertEqual(37, result["profiles"])
            self.assertEqual(36, result["npc"])
            self.assertEqual(1, result["pc"])
            files = sorted((Path(temp) / "work" / "human_approval" / "r1a_closed" / "by_profile").glob("*.md"))
            self.assertEqual(37, len(files))
            index = (Path(temp) / "docs" / "human_approval" / "R1A_CLOSED_PROFILE_APPROVAL_INDEX.md").read_text(encoding="utf-8")
            self.assertIn("| 人物 | 类型 | R1A 是否涉及 | 主要审核重点 | 审批状态 |", index)
            self.assertIn("| 悠悠 | NPC | 是 |", index)
            self.assertIn("| 御临风 | PC | 是 |", index)
            closure = (Path(temp) / "docs" / "remediation" / "R1A_CLOSURE_MANIFEST.md").read_text(encoding="utf-8")
            self.assertIn("# R1A 关闭清单与人工审批基线", closure)
            self.assertIn("这些 Markdown 是最终修复后 R2C production 的确定性中文可读投影", closure)
            self.assertNotIn("These Markdown files", closure)

    def test_two_staged_builds_are_byte_identical_and_leave_production_unchanged(self):
        module = self.require_generator()
        before = module.production_fingerprint(ROOT)
        with tempfile.TemporaryDirectory() as first, tempfile.TemporaryDirectory() as second:
            module.build_staged_package(ROOT, Path(first))
            module.build_staged_package(ROOT, Path(second))
            comparison = module.compare_staged_packages(Path(first), Path(second))
        after = module.production_fingerprint(ROOT)
        self.assertEqual("cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3", before["aggregate_sha256"])
        self.assertEqual(before, after)
        self.assertEqual(0, comparison["byte_differences"])


if __name__ == "__main__":
    unittest.main()
