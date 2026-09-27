import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "extract_candidates.py"


class ExtractCandidatesTests(unittest.TestCase):
    def make_fixture(self, base: Path) -> tuple[Path, Path]:
        campaign = base / "campaign"
        project = campaign / "TRPG outputs"
        setting = campaign / "设定 人物"
        report = campaign / "战报" / "第一部分"
        setting.mkdir(parents=True)
        report.mkdir(parents=True)
        project.mkdir(parents=True)
        (project / "config").mkdir(parents=True)

        (setting / "妄想大陆设定集_检索版.md").write_text(
            """# 妄想大陆设定集
# 世界观与各大势力
## 妄想大陆
四陆一脉构成这个世界，飘零大陆位于远方。
## 兄弟会
帝掌控的秘密组织，八柱将受其影响。
峡谷战一役改变了帝都局势。第一次魔兽大侵攻攻破了边境关卡。
## 无法地带
位于妄想山脉中心的独立区域。
## 龙族秘境
龙族长期生活的秘境。
## 娜迦
从沉睡中苏醒的一族。
# 登场人物
## 芬尔德·琳·特兰希尔/悠悠
年幼的空间龙。
## 白色魔法使
来自异世界的魔法使，曾涉及监狱塔。
## 双界人
主世界已有记录的人物。
## 帝
帝国核心人物。
# 特有名词解释
## 厌魔石
免疫魔法的矿石。
## 魔物/魔物之潮
两个相关但不等同的概念。
别名：魔物统称。
## 魔兽之潮
另一种独立称谓。
## 魔物之盒
引发危机的盒子。
## 亲族概念（乙的兄长）
括号内容是说明而不是别名。
""",
            encoding="utf-8",
        )
        (setting / "人物卡资料集_叙事检索版.md").write_text(
            """# 人物卡资料集
# 参演人员
## 御临风
异乡少年。
### 技能
不应成为候选。
# NPC 与支援角色
## 白色魔法使
**常用称呼：**白魔。
## 芬尔德·特兰希尔
**常用称呼：**悠悠。
## 杨
来源尚待进一步核验。
""",
            encoding="utf-8",
        )
        (setting / "人物卡资料集_检索版.md").write_text(
            """# 人物卡资料集：检索版
# 参演人员：英雄志
## 题记
这不是人物。
## 芬尔德·特兰希尔
完整人物卡。
## 卡西乌斯·布莱特
完整人物卡。
## 谏山黄泉
完整人物卡。
""",
            encoding="utf-8",
        )
        (report / "03_剧情分段目录.md").write_text(
            """# 剧情分段目录
## 分卷 01：帝国收网与战后余波
核心功能：完成帝国收网。
结尾边界：众人离开峡谷。
必写事件 ID：E001。
## 分卷 02：现代灵异梦境开端
核心功能：特殊幕间出现魔物之盒，但没有带回现实。
结尾边界：梦境尚未结束。
必写场景卡：S020-S027。
## 分卷 03：九雪医馆与龙族秘境
核心功能：推进空间龙线。
## 分卷 04：魔物之盒、耶各诅咒转移与尾声
核心功能：处理诅咒后果。
## 分卷 05：远海探索
核心功能：海域阶段。
## 分卷 06：皇宫朝见与审判阶段
核心功能：政治审判。
## 分卷 07：悠悠与空间龙真相
核心功能：角色身份阶段。
## 分卷 08：神秘海域，德雷克的宝藏
核心功能：梦境番外完成探索，取得魔物之盒和能力奖励。
结尾边界：梦境奖励结束，众人醒来返回主线。
必写事件 ID：E014-E018。
""",
            encoding="utf-8",
        )
        (report / "02_源记录事件台账.md").write_text(
            """# 源记录事件台账
| ID | 事件/动作节拍 | 后果 |
| --- | --- | --- |
| E001 | 峡谷战中凌迟败露 | 帝国收网完成 |
| E018 | 神秘海域梦境终局 | 众人醒来返回主线 |
""",
            encoding="utf-8",
        )
        (report / "01_角色与主题线索表.md").write_text(
            """# 角色与主题线索表
| Line ID | 类型 | 角色/主题 | 来源场景 | 线索内容 | 与后文关系 | 保留决定 |
| --- | --- | --- | --- | --- | --- | --- |
| C001 | 角色 | 布莱特 | S001 | 搜证 | 长期队员 | 必须写入 |
| C002 | 角色 | 右近 | S002 | 帝国执行者 | 后续持续出现 | 必须写入 |
| C003 | 角色 | A | S003 | 魔法师A的代号 | 后续需核验 | 必须写入 |
| C004 | 角色 | 梦境访客 | S021 | 仅在特殊梦境出现 | 未回到主世界 | 必须写入 |
| C005 | 角色 | 杨 | S005 | 名称待核验 | 后续需核验 | 必须写入 |
| C006 | 角色 | 双界人 | S021 | 特殊梦境中的同名投影 | 未证实与主世界同一 | 必须写入 |
| C007 | 角色 | 黄泉 | S006 | 独立行动 | 长期队员 | 必须写入 |
| C008 | 角色 | 番外访客 | S010 | 仅存在于醒来后返回主线的番外 | 未回到主世界 | 必须写入 |
| C009 | 角色 | 现实后角色 | S028 | 梦醒后的主世界角色 | 后续持续出现 | 必须写入 |
| C010 | 角色 | 现实归来角色 | S027 | 现实黑龙预言阶段的主世界角色 | 后续持续出现 | 必须写入 |
| T001 | 主题 | 魔盒/魔眼 | S003 | 魔物之盒被打开 | 魔盒灾变是后续危机来源 | 必须写入 |
""",
            encoding="utf-8",
        )
        (report / "00_顺读场景卡.md").write_text(
            """# 顺读场景卡
## SC01 死亡之翼讨伐
帝国军与龙族军并肩作战。
## S010 旧日番外
章节结束后众人醒来返回主线。
## S020 现代灵异梦境开端
梦境支线。
## S021 梦境访客出现
现代灵异梦境专属人物。
## S022 黄金高塔攻防
特殊梦境中的地点与战斗。
## S023 黄泉梦境线
特殊梦境中的人物分线，不应仅因含梦境而新增 event。
## S027 现实黑龙预言与死亡之翼类比
梦醒后，主世界继续。
## S028 宅邸战与古雷姆林逃脱
宅邸冲突。
## S029 秘境入口
这里的秘境指龙族秘境。
## S030 宫廷汇报、黑龙与毁灭之龙线
这是一条线索标题，不是事件名。
## SC12 龙族撤离
龙族伤员撤离。
""",
            encoding="utf-8",
        )
        other = campaign / "战报" / "另一部分"
        other.mkdir(parents=True)
        (other / "02_源记录事件台账.md").write_text(
            """# 源记录事件台账
| ID | 场景 | 事件/动作节拍 |
| --- | --- | --- |
| E998 | S012 | 龙族宴会开始 |
| E999 | S028 | 无关的宫廷汇报 |
""",
            encoding="utf-8",
        )
        second = campaign / "战报" / "第二部分"
        second.mkdir(parents=True)
        (second / "03_剧情分段目录.md").write_text(
            """# 第二部分剧情分段目录
| 正文文件 | 覆盖场景 | 覆盖事件 | 叙事功能 |
| --- | --- | --- | --- |
| 08_梦境游戏前半.md | S020-S023 | E029-E034 | 写旅途入梦与梦境规则。 |
| 09_梦境终局.md | S024-S027 | E035-E039 | 写梦境核心攻坚，结尾醒来回到现实。 |
""",
            encoding="utf-8",
        )
        (second / "02_源记录事件台账.md").write_text(
            """# 第二部分事件台账
| ID | 事件/动作节拍 | 后果 |
| --- | --- | --- |
| E035 | 梦境终局开始 | 进入核心区域 |
| E039 | 梦境终局结束 | 众人醒来 |
""",
            encoding="utf-8",
        )
        (project / "current_state.md").write_text(
            """# Campaign Current State
死亡之翼已经被御临风与谢尔伦击败。
龙族秘境随后崩坏并毁灭。
特殊梦境发生于幕间阶段，不属于主世界当前现实。
""",
            encoding="utf-8",
        )
        manual = [
            {"name_hint": "飘零大陆", "type_hint": "location", "canon_layer_hint": "original_campaign", "source_refs": [{"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "妄想大陆正文"}], "reason": "正文明确命名但无独立 H2。"},
            {"name_hint": "妄想山脉", "type_hint": "location", "canon_layer_hint": "original_campaign", "source_refs": [{"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "无法地带正文"}], "reason": "正文明确命名但无独立 H2。"},
            {"name_hint": "八柱将", "type_hint": "faction", "canon_layer_hint": "original_campaign", "source_refs": [{"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "兄弟会正文"}], "reason": "正文明确重要组织但无独立 H2。"},
            {"name_hint": "监狱塔", "type_hint": "location", "canon_layer_hint": "original_campaign", "source_refs": [{"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "白色魔法使相关正文"}], "reason": "正文明确重要地点但无独立 H2。"},
        ]
        (project / "config" / "manual_candidates.json").write_text(
            json.dumps(manual, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        decisions = {
            "stage": "frozen",
            "decisions": [
                {"kind": "merge", "type_hint": "character", "name_hint": "布莱特", "target_name": "卡西乌斯·布莱特", "decision": "merged", "reason": "人工确认简称与全名属于同一角色。"},
                {"kind": "merge", "type_hint": "character", "name_hint": "黄泉", "target_name": "谏山黄泉", "decision": "merged", "reason": "人工确认简称与全名属于同一角色。"},
                {"kind": "merge", "type_hint": "location", "name_hint": "秘境", "target_name": "龙族秘境", "decision": "merged", "reason": "人工确认场景中的秘境指龙族秘境。"},
                {"kind": "merge", "type_hint": "event", "name_hint": "死亡之翼讨伐", "target_name": "死亡之翼之战", "decision": "merged", "reason": "人工确认两个名称指同一场战役。"},
                {"kind": "alias", "type_hint": "character", "name_hint": "白色魔法使", "alias": "白魔", "decision": "approved", "reason": "Campaign 内常用简称。"},
                {"kind": "alias", "type_hint": "character", "name_hint": "白色魔法使", "alias": "笛木奏", "decision": "approved", "reason": "Campaign 原文自报名支持。"},
                {"kind": "candidate", "type_hint": "character", "name_hint": "A", "decision": "deferred", "reason": "继续 pending，魔法师A关系待核验。"},
                {"kind": "candidate", "type_hint": "character", "name_hint": "杨", "decision": "deferred", "reason": "继续 pending，缺少稳定全名。"},
                {"kind": "candidate", "type_hint": "event", "name_hint": "梦境终局", "decision": "rejected", "reason": "章节 umbrella 保留在剧情导航，不作为独立 worldbook event。"},
                {"kind": "candidate", "type_hint": "event", "name_hint": "神秘海域，德雷克的宝藏", "decision": "approved", "reason": "作为 Special Interlude 重大事件保留。"}
            ]
        }
        (project / "config" / "review_decisions.json").write_text(
            json.dumps(decisions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        return campaign, project

    def run_script(
        self, campaign: Path, project: Path, *extra_args: str
    ) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--project-root",
                str(project),
                "--campaign-root",
                str(campaign),
                *extra_args,
            ],
            text=True,
            encoding="utf-8",
            errors="replace",
            capture_output=True,
            check=False,
        )

    def test_semantic_boundaries_and_report_are_deterministic(self):
        """Catches syntax-only aliasing, weak merging, layer leakage, and incomplete review reporting."""
        with tempfile.TemporaryDirectory() as tmp:
            campaign, project = self.make_fixture(Path(tmp))
            first = self.run_script(campaign, project)
            self.assertEqual(first.returncode, 0, first.stderr)

            candidate_path = project / "work" / "candidates.jsonl"
            first_bytes = candidate_path.read_bytes()
            rows = [json.loads(line) for line in candidate_path.read_text(encoding="utf-8").splitlines()]
            names = {row["name_hint"] for row in rows}

            self.assertTrue({"飘零大陆", "妄想山脉", "八柱将", "监狱塔"}.issubset(names))
            self.assertTrue({"魔物", "魔物之潮", "魔兽之潮", "魔物之盒"}.issubset(names))
            for event_name in ("远海探索", "皇宫朝见与审判阶段", "悠悠与空间龙真相", "耶各诅咒转移"):
                self.assertIn(event_name, names, event_name)
            self.assertTrue({"峡谷战", "死亡之翼之战", "龙族秘境毁灭", "帝"}.issubset(names))
            self.assertNotIn("技能", names)
            self.assertNotIn("题记", names)
            self.assertNotIn("毁灭之龙线", names)
            self.assertNotIn("黄泉梦境线", names)
            self.assertEqual([row["candidate_id"] for row in rows], [f"CAND_{i:04d}" for i in range(1, len(rows) + 1)])
            self.assertTrue(all(row["review_status"] in {"pending", "approved", "merged", "rejected", "deferred"} for row in rows))
            self.assertTrue(all(row["canon_layer_hint"] in {"original_campaign", "transition", "continuation", "special_interlude"} for row in rows))
            self.assertTrue(all("ledger_match_found" in row for row in rows))
            self.assertFalse(any("event_verified" in row for row in rows))

            monster = next(row for row in rows if row["name_hint"] == "魔物")
            self.assertNotIn("魔物之潮", monster["aliases_hint"])
            self.assertNotIn("魔物之盒", monster["aliases_hint"])
            self.assertNotIn("魔物统称", monster["aliases_hint"])
            self.assertEqual(len([row for row in rows if row["name_hint"] in {"魔物", "魔物之潮", "魔兽之潮"}]), 3)
            kinship = next(row for row in rows if row["name_hint"] == "亲族概念")
            self.assertNotIn("乙的兄长", kinship["aliases_hint"])

            youyou = next(row for row in rows if row["name_hint"] == "悠悠")
            self.assertIn("芬尔德·琳·特兰希尔", youyou["aliases_hint"])
            self.assertIn("芬尔德·特兰希尔", youyou["aliases_hint"])
            self.assertEqual(sum(row["name_hint"] in {"悠悠", "芬尔德·特兰希尔"} for row in rows), 1)
            self.assertTrue(youyou["alias_requires_review"])
            white_mage = next(row for row in rows if row["name_hint"] == "白色魔法使")
            self.assertIn("白魔", white_mage["aliases_hint"])
            self.assertIn("笛木奏", white_mage["aliases_hint"])
            self.assertEqual(white_mage["review_status"], "approved")
            self.assertGreaterEqual(len(white_mage["source_refs"]), 2)
            self.assertTrue(all("/" in ref["document"] for ref in white_mage["source_refs"]))
            blayt = [row for row in rows if row["name_hint"] in {"布莱特", "卡西乌斯·布莱特"}]
            self.assertEqual(len(blayt), 2)
            self.assertEqual(next(row for row in blayt if row["name_hint"] == "布莱特")["review_status"], "merged")
            self.assertIn("布莱特", next(row for row in blayt if row["name_hint"] == "卡西乌斯·布莱特")["aliases_hint"])
            self.assertEqual(next(row for row in rows if row["name_hint"] == "黄泉")["review_status"], "merged")
            self.assertIn("黄泉", next(row for row in rows if row["name_hint"] == "谏山黄泉")["aliases_hint"])
            sanctuary = next(row for row in rows if row["name_hint"] == "龙族秘境")
            self.assertEqual(sanctuary["type_hint"], "location")
            self.assertIn("秘境", sanctuary["aliases_hint"])
            self.assertEqual(next(row for row in rows if row["name_hint"] == "秘境")["review_status"], "merged")
            self.assertEqual(next(row for row in rows if row["name_hint"] == "龙族秘境毁灭")["canon_layer_hint"], "transition")
            deathwing = next(row for row in rows if row["name_hint"] == "死亡之翼之战")
            self.assertEqual(deathwing["canon_layer_hint"], "original_campaign")
            self.assertIn("死亡之翼讨伐", deathwing["aliases_hint"])
            self.assertFalse(any(ref["reference"] == "E039" for ref in deathwing["source_refs"]))
            self.assertEqual(next(row for row in rows if row["name_hint"] == "死亡之翼讨伐")["review_status"], "merged")
            dream_character = next(row for row in rows if row["name_hint"] == "梦境访客")
            self.assertEqual(dream_character["canon_layer_hint"], "special_interlude")
            self.assertEqual(sum(row["name_hint"] == "梦境访客" for row in rows), 1)
            self.assertEqual(next(row for row in rows if row["name_hint"] == "番外访客")["canon_layer_hint"], "special_interlude")
            self.assertEqual(next(row for row in rows if row["name_hint"] == "现实归来角色")["canon_layer_hint"], "original_campaign")
            self.assertEqual(next(row for row in rows if row["name_hint"] == "现实后角色")["canon_layer_hint"], "original_campaign")
            self.assertEqual(next(row for row in rows if row["name_hint"] == "现代灵异梦境开端")["canon_layer_hint"], "special_interlude")
            same_name_layers = {row["canon_layer_hint"] for row in rows if row["name_hint"] == "双界人"}
            self.assertEqual(same_name_layers, {"original_campaign", "special_interlude"})
            dream_tower = [row for row in rows if row["name_hint"] in {"黄金高塔", "黄金高塔攻防"}]
            self.assertEqual({row["type_hint"] for row in dream_tower}, {"location", "event"})
            self.assertTrue(all(row["canon_layer_hint"] == "special_interlude" for row in dream_tower))
            self.assertEqual(next(row for row in rows if row["name_hint"] == "宅邸战")["canon_layer_hint"], "original_campaign")
            magic_box_layers = {row["canon_layer_hint"] for row in rows if row["name_hint"] == "魔物之盒"}
            self.assertEqual(magic_box_layers, {"original_campaign", "special_interlude"})
            sea_location = next(row for row in rows if row["name_hint"] == "神秘海域" and row["type_hint"] == "location")
            self.assertEqual(sea_location["canon_layer_hint"], "special_interlude")
            self.assertEqual(next(row for row in rows if row["name_hint"] == "神秘海域，德雷克的宝藏")["canon_layer_hint"], "special_interlude")
            self.assertEqual(next(row for row in rows if row["name_hint"] == "梦境游戏前半")["canon_layer_hint"], "special_interlude")
            dream_finale = next(row for row in rows if row["name_hint"] == "梦境终局")
            self.assertEqual(dream_finale["canon_layer_hint"], "special_interlude")
            self.assertFalse(any(ref["reference"] == "E018" for ref in dream_finale["source_refs"]))
            self.assertTrue(any(ref["reference"] == "E035" for ref in dream_finale["source_refs"]))
            self.assertEqual(dream_finale["review_status"], "rejected")
            self.assertEqual(next(row for row in rows if row["name_hint"] == "A")["review_status"], "deferred")
            self.assertEqual(next(row for row in rows if row["name_hint"] == "杨")["review_status"], "deferred")
            gorge = next(row for row in rows if row["name_hint"] == "峡谷战")
            self.assertFalse(gorge["ledger_match_found"])
            self.assertFalse(any("02_源记录事件台账.md" in ref["document"] for ref in gorge["source_refs"]))
            self.assertFalse(any("已验证" in reason for reason in gorge["reason"]))

            second = self.run_script(campaign, project)
            self.assertEqual(second.returncode, 0, second.stderr)
            self.assertEqual(first_bytes, candidate_path.read_bytes())

            report = (project / "work" / "candidate_report.md").read_text(encoding="utf-8")
            for section in ("coverage_confidence", "manually_added_candidates", "alias_requires_review", "cross_type_name_conflicts", "unresolved_event_coverage", "special_interlude_candidates", "review_decisions"):
                self.assertIn(section, report)
            self.assertIn("candidate_stage: frozen", report)
            self.assertNotIn("来源冲突：未检测到", report)
            self.assertIn("901第二部分_16-25页", report)
            self.assertIn("901第三部分", report)
            duplicate_section = report.split("## duplicate_suspects", 1)[1].split("\n## ", 1)[0]
            self.assertNotIn("魔物 ↔ 魔物之盒", duplicate_section)
            self.assertNotIn("魔物 ↔ 魔物之潮", duplicate_section)

    def test_refuses_to_overwrite_reviewed_candidates(self):
        """Catches a rerun erasing a human review decision."""
        with tempfile.TemporaryDirectory() as tmp:
            campaign, project = self.make_fixture(Path(tmp))
            first = self.run_script(campaign, project)
            self.assertEqual(first.returncode, 0, first.stderr)
            path = project / "work" / "candidates.jsonl"
            rows = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]
            rows[0]["review_status"] = "approved"
            protected = "\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n"
            path.write_text(protected, encoding="utf-8")

            rerun = self.run_script(campaign, project)
            self.assertEqual(rerun.returncode, 2)
            self.assertIn("reviewed", rerun.stderr.lower())
            self.assertEqual(path.read_text(encoding="utf-8"), protected)

    def test_review_config_refresh_preserves_reviewed_rows(self):
        """Allows a generated-pool refresh only when every reviewed row remains unchanged."""
        with tempfile.TemporaryDirectory() as tmp:
            campaign, project = self.make_fixture(Path(tmp))
            first = self.run_script(campaign, project)
            self.assertEqual(first.returncode, 0, first.stderr)
            path = project / "work" / "candidates.jsonl"
            rows = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]
            reviewed_before = {
                (row["type_hint"], row["name_hint"], row["canon_layer_hint"]): {
                    key: value for key, value in row.items() if key != "candidate_id"
                }
                for row in rows
                if row["review_status"] != "pending"
            }
            rows.append(
                {
                    **rows[-1],
                    "candidate_id": "CAND_9999",
                    "name_hint": "过期机器候选",
                    "aliases_hint": [],
                    "alias_requires_review": [],
                    "review_status": "pending",
                    "review_target": None,
                }
            )
            path.write_text(
                "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows),
                encoding="utf-8",
            )

            default_run = self.run_script(campaign, project)
            self.assertEqual(default_run.returncode, 2)
            refresh = self.run_script(campaign, project, "--refresh-reviewed-from-config")
            self.assertEqual(refresh.returncode, 0, refresh.stderr)
            refreshed = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]
            self.assertNotIn("过期机器候选", {row["name_hint"] for row in refreshed})
            reviewed_after = {
                (row["type_hint"], row["name_hint"], row["canon_layer_hint"]): {
                    key: value for key, value in row.items() if key != "candidate_id"
                }
                for row in refreshed
                if row["review_status"] != "pending"
            }
            self.assertEqual(reviewed_before, reviewed_after)

            protected_row = next(row for row in refreshed if row["review_status"] != "pending")
            protected_row["alias_requires_review"].append(
                f"可能 alias：人工保留关系对象 ↔ {protected_row['name_hint']}（弱字符串关系，仅待审，不自动合并）"
            )
            refreshed.append(
                {
                    **refreshed[-1],
                    "candidate_id": "CAND_9998",
                    "name_hint": "人工保留关系对象",
                    "aliases_hint": [],
                    "alias_requires_review": [],
                    "review_status": "pending",
                    "review_target": None,
                }
            )
            manually_edited = "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in refreshed)
            path.write_text(manually_edited, encoding="utf-8")
            rejected_refresh = self.run_script(campaign, project, "--refresh-reviewed-from-config")
            self.assertEqual(rejected_refresh.returncode, 2)
            self.assertEqual(path.read_text(encoding="utf-8"), manually_edited)

    def test_ledger_text_match_stays_in_source_directory(self):
        """Catches an event absorbing same-worded ledger rows from another campaign phase."""
        with tempfile.TemporaryDirectory() as tmp:
            campaign, project = self.make_fixture(Path(tmp))
            result = self.run_script(campaign, project)
            self.assertEqual(result.returncode, 0, result.stderr)
            rows = [json.loads(line) for line in (project / "work" / "candidates.jsonl").read_text(encoding="utf-8").splitlines()]

            finale = next(row for row in rows if row["name_hint"] == "梦境终局")
            self.assertFalse(any(ref["reference"] == "E018" for ref in finale["source_refs"]))
            self.assertTrue(any(ref["reference"] == "E035" for ref in finale["source_refs"]))
            for source_only_name in ("峡谷战", "死亡之翼之战"):
                candidate = next(row for row in rows if row["name_hint"] == source_only_name)
                self.assertFalse(any("02_源记录事件台账.md" in ref["document"] for ref in candidate["source_refs"]))

    def test_dream_layers_and_review_decisions_freeze_without_deleting_pool_rows(self):
        """Catches dream lore leaking main-world and review decisions deleting raw candidates."""
        with tempfile.TemporaryDirectory() as tmp:
            campaign, project = self.make_fixture(Path(tmp))
            result = self.run_script(campaign, project)
            self.assertEqual(result.returncode, 0, result.stderr)
            rows = [json.loads(line) for line in (project / "work" / "candidates.jsonl").read_text(encoding="utf-8").splitlines()]

            for name in ("神秘海域", "神秘海域，德雷克的宝藏", "梦境游戏前半", "梦境终局"):
                candidate = next(row for row in rows if row["name_hint"] == name)
                self.assertEqual(candidate["canon_layer_hint"], "special_interlude", name)
            self.assertEqual(next(row for row in rows if row["name_hint"] == "布莱特")["review_status"], "merged")
            self.assertEqual(next(row for row in rows if row["name_hint"] == "梦境终局")["review_status"], "rejected")
            self.assertIn("笛木奏", next(row for row in rows if row["name_hint"] == "白色魔法使")["aliases_hint"])
            self.assertIn("死亡之翼讨伐", {row["name_hint"] for row in rows})
            self.assertIn("梦境终局", {row["name_hint"] for row in rows})


if __name__ == "__main__":
    unittest.main()
