from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MATRIX_PATH = ROOT / "work/remediation/r1c0/semantic_trust_matrix.jsonl"
GOLDEN_PATH = ROOT / "work/remediation/r1c0/golden_semantic_regressions.jsonl"
REPORT_PATH = ROOT / "docs/remediation/R1C_0_SEMANTIC_TRUST_AUDIT.md"

VALID_LAYER_STATUS = {"CORRECT", "INCORRECT", "MISSING", "NOT_APPLICABLE"}
VALID_REVIEW_STATUS = {
    "verified_source_fact",
    "human_review_hypothesis",
    "unsupported_or_unresolved",
}


def layer(status: str, finding: str, refs: list[str] | None = None) -> dict:
    if status not in VALID_LAYER_STATUS:
        raise ValueError(status)
    return {"status": status, "finding": finding, "refs": refs or []}


def trace(
    fact_id: str,
    character: list[str],
    proposition: str,
    review_status: str,
    raw_refs: list[str],
    chunks: list[str],
    reviewed: tuple[str, str, list[str]],
    r2a: tuple[str, str, list[str]],
    r2b: tuple[str, str, list[str]],
    phase3: tuple[str, str, list[str]],
    r2c: tuple[str, str, list[str]],
    readable: tuple[str, str, list[str]],
    first_failure_layer: str | None,
    first_failure_bucket: str | None,
    failure_class: str,
) -> dict:
    if review_status not in VALID_REVIEW_STATUS:
        raise ValueError(review_status)
    raw = layer("CORRECT", proposition, raw_refs)
    chunk = layer("CORRECT", "原帖已完整抽取并获得稳定 source_chunk_id。", chunks)
    reviewed_obj = layer(*reviewed)
    r2a_obj = layer(*r2a)
    r2b_obj = layer(*r2b)
    phase3_obj = layer(*phase3)
    r2c_obj = layer(*r2c)
    readable_obj = layer(*readable)
    package_refs = [
        ref.replace("work/phase3d_r2c/candidates/by_profile/", "work/phase3d_r2c/migration_packages/")
        for ref in r2c_obj["refs"]
    ]
    return {
        "fact_id": fact_id,
        "character": character,
        "proposition": proposition,
        "review_status": review_status,
        "raw_source": raw,
        "source_chunk": chunk,
        "reviewed_source_decision": reviewed_obj,
        "r2a": r2a_obj,
        "r2b": r2b_obj,
        "phase3_profile": phase3_obj,
        "r2c": r2c_obj,
        "r2c_package": {**r2c_obj, "refs": package_refs},
        "r2c_candidate": dict(r2c_obj),
        "readable_projection": readable_obj,
        "first_failure_layer": first_failure_layer,
        "first_failure_bucket": first_failure_bucket,
        "failure_class": failure_class,
    }


RAW_P3_4 = "extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md"
RAW_P3_5 = "extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md"
RAW_P2_18 = "extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.md"


def build_matrix() -> list[dict]:
    R2A_CHRON = ["work/phase3d_r2/chronology/campaign_chronology.jsonl"]
    R2B_EVENTS = ["work/phase3d_r2b/normalized/campaign_events.jsonl"]
    rows = [
        trace(
            "FATE_BRANCH_TRANSMISSION_AND_DECISION_BOUNDARY",
            ["PC_YU_LINFENG", "NPC_YOUYOU"],
            "悠悠通过牵手同时留下乳白保护力量并把两条可能未来传入御临风意识；她偏好第一条，但御临风当场没有明说选择第一条，随后只明确重订计划、询问毁掉基石的方法并把击败死亡之翼列为优先。",
            "verified_source_fact",
            [f"{RAW_P3_4}:#188-#191"],
            ["SRC_P3_P004_POST_0039_1078852", "SRC_P3_P004_POST_0040_1078855", "SRC_P3_P004_POST_0042_1079201"],
            ("INCORRECT", "whole_post 已审阅，但把悠悠的偏好误判为御临风已经作出的选择。", ["work/phase3d_r2/reviewed_inputs/events_part3.jsonl#EVENT_P3_008_FATE_BRANCH_SELECTION"]),
            ("INCORRECT", "EVENT_P3_008 首次写出‘御临风选择第一条并准备毁灭秘境’。", R2A_CHRON),
            ("INCORRECT", "R2B 作为 1:1 派生层忠实保留了 R2A 的错误。", R2B_EVENTS),
            ("INCORRECT", "Phase 3 档案引用并传播了错误事件语义。", ["work/phase3d_recall/repaired_candidates/NPC_YOUYOU.json", "work/phase3d_recall/repaired_candidates/PC_YU_LINFENG.json"]),
            ("INCORRECT", "package/candidate 复用了错误的稳定事件。", ["work/phase3d_r2c/candidates/by_profile/NPC_YOUYOU.json", "work/phase3d_r2c/candidates/by_profile/PC_YU_LINFENG.json"]),
            ("INCORRECT", "中文档案直接显示‘御临风选择第一条’。", ["work/human_approval/r1a_closed/by_profile/NPC_YOUYOU.md", "work/human_approval/r1a_closed/by_profile/PC_YU_LINFENG.md"]),
            "REVIEWED_SOURCE_DECISION",
            "r2a_semantics",
            "preferred_branch_promoted_to_selected_branch",
        ),
        trace(
            "CASSIUS_CAPTURE_BY_GREMLIN",
            ["NPC_CASSIUS_BRIGHT"],
            "布莱特追踪时被苍白手掌从地下抓住脚并拖入地下；这是明确发生的失踪/捕获节点。",
            "verified_source_fact",
            ["extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 10/posts.md:#457"],
            ["SRC_P2_P010_POST_0008_923569"],
            ("INCORRECT", "该块被 whole_post 路由到普通‘离都与梦境入口’事件，捕获事实未进入事件语义。", ["work/phase3d_r2/reviewed_inputs/chunk_decisions.jsonl#SRC_P2_P010_POST_0008_923569"]),
            ("MISSING", "EVENT_P2_012 未记录布莱特被捕。", R2A_CHRON),
            ("MISSING", "R2B 无对应捕获事件。", R2B_EVENTS),
            ("CORRECT", "Phase 3D-R 从原帖独立补回失踪/捕获历史。", ["work/phase3d_recall/repaired_candidates/NPC_CASSIUS_BRIGHT.json"]),
            ("CORRECT", "R2C 保留该历史，但错误地借用 P3_002 作为后期承载事件。", ["work/phase3d_r2c/candidates/by_profile/NPC_CASSIUS_BRIGHT.json"]),
            ("CORRECT", "正文提及追查期间失踪；事件定位仍受 R2C 承载问题影响。", ["work/human_approval/r1a_closed/by_profile/NPC_CASSIUS_BRIGHT.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "whole_post_semantics_omitted",
        ),
        trace(
            "CASSIUS_FACE_DEATH_AND_FINAL_MESSAGE",
            ["NPC_CASSIUS_BRIGHT"],
            "古雷姆林颈部出现被认作布莱特的面容；古雷姆林被杀后该面容留下‘为了正义献身’的转告并死亡。",
            "verified_source_fact",
            ["extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.md:#50-#53"],
            ["SRC_P3_P002_POST_0001_1042498", "SRC_P3_P002_POST_0002_1042499", "SRC_P3_P002_POST_0003_1042798", "SRC_P3_P002_POST_0004_1042846"],
            ("INCORRECT", "四个 whole_post 被并入‘秘境入口’事件，但布莱特终局未被抽取。", ["work/phase3d_r2/reviewed_inputs/chunk_decisions.jsonl#SRC_P3_P002_POST_0001_1042498"]),
            ("MISSING", "EVENT_P3_002 摘要跳过古雷姆林/布莱特终局。", R2A_CHRON),
            ("MISSING", "R2B 没有这一终局语义。", R2B_EVENTS),
            ("CORRECT", "Phase 3D-R 从原帖补回面容死亡与转告。", ["work/phase3d_recall/repaired_candidates/NPC_CASSIUS_BRIGHT.json"]),
            ("CORRECT", "知识/历史载荷保留终局边界。", ["work/phase3d_r2c/candidates/by_profile/NPC_CASSIUS_BRIGHT.json"]),
            ("CORRECT", "可读层保留终局说明。", ["work/human_approval/r1a_closed/by_profile/NPC_CASSIUS_BRIGHT.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "hub_scene_semantics_omitted",
        ),
        trace(
            "CASSIUS_BLIND_DRAGON_IDENTITY_BOUNDARY",
            ["NPC_CASSIUS_BRIGHT"],
            "盲眼幼龙从古雷姆林尸体中出现是事实；御临风随后问‘那条黑龙，是布莱特吗’，因此身份连续性仍是人物疑问，不能写成已确认转化。",
            "verified_source_fact",
            ["extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.md:#52-#53"],
            ["SRC_P3_P002_POST_0003_1042798", "SRC_P3_P002_POST_0004_1042846"],
            ("INCORRECT", "出现事实与疑问边界均未进入 reviewed event。", ["work/phase3d_r2/reviewed_inputs/chunk_decisions.jsonl#SRC_P3_P002_POST_0003_1042798"]),
            ("MISSING", "R2A 未记录盲眼幼龙及身份不确定性。", R2A_CHRON),
            ("MISSING", "R2B 无对应记录。", R2B_EVENTS),
            ("CORRECT", "Phase 3D-R 明确保留‘来源没有确认’。", ["work/phase3d_recall/repaired_candidates/NPC_CASSIUS_BRIGHT.json"]),
            ("CORRECT", "R2C 以 BELIEF/uncertain 保存，不把疑问升级为变身事实。", ["work/phase3d_r2c/candidates/by_profile/NPC_CASSIUS_BRIGHT.json"]),
            ("CORRECT", "可读层保留身份未确认。", ["work/human_approval/r1a_closed/by_profile/NPC_CASSIUS_BRIGHT.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "epistemic_boundary_omitted",
        ),
        trace(
            "CASSANDRA_ASSASSINATION_PARTICIPATION",
            ["NPC_CASSANDRA", "PC_YU_LINFENG"],
            "暗场对白直接称暗杀物为‘卡珊德拉给的东西’，卡珊德拉道歉并建议在御临风与悠悠通过受荣之路前消除风险；这支持她参与策划/供物和建议排除目标，不等于证明她亲手放牌或独自实施全部暗杀。",
            "verified_source_fact",
            [f"{RAW_P2_18}:#896-#897"],
            ["SRC_P2_P018_POST_0047_987223", "SRC_P2_P018_POST_0048_987233"],
            ("INCORRECT", "事件只保留‘施术者未知’，没有记录后续暗场对卡珊德拉参与范围的直接证据。", ["work/phase3d_r2/reviewed_inputs/events_part2.jsonl#EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION"]),
            ("MISSING", "R2A 未把卡珊德拉列为参与者或记录她的供物/建议。", R2A_CHRON),
            ("MISSING", "R2B 继承遗漏。", R2B_EVENTS),
            ("INCORRECT", "Phase 3 只写‘暗杀参与未获客观确认’，抹平了可确认的有限参与与未知实施细节之区别。", ["work/phase3d_recall/repaired_candidates/NPC_CASSANDRA.json"]),
            ("INCORRECT", "R2C 未完整呈现有限参与边界。", ["work/phase3d_r2c/candidates/by_profile/NPC_CASSANDRA.json"]),
            ("INCORRECT", "可读层继续笼统称参与未确认。", ["work/human_approval/r1a_closed/by_profile/NPC_CASSANDRA.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "participant_attribution_omitted",
        ),
        trace(
            "CASSANDRA_PROPHECY_ABILITY_EVIDENCE",
            ["NPC_CASSANDRA"],
            "卡珊德拉亲口说‘我的预言就是这样显示的’，并在第三部表示看见了与以前不同的景象；来源支持她至少表现/自述了预见能力，但预言内容仍是可能未来。",
            "verified_source_fact",
            [f"{RAW_P2_18}:#897", "extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.md:#136-#143"],
            ["SRC_P2_P018_POST_0048_987233", "SRC_P3_P003_POST_0038_1068070"],
            ("INCORRECT", "预言内容被部分记录为 possible future，但能力表现/自述没有形成卡珊德拉人物语义。", ["work/phase3d_r2/reviewed_inputs/events_part3.jsonl#EVENT_P3_006_CASSANDRA_FUTURES_AND_TRADE"]),
            ("MISSING", "R2A 未把预见能力作为卡珊德拉 revelation。", R2A_CHRON),
            ("MISSING", "R2B 无卡珊德拉能力关联。", R2B_EVENTS),
            ("INCORRECT", "Phase 3 将能力整体写成未客观确认，未表达‘能力表现有直接语料、预言真值未知’。", ["work/phase3d_recall/repaired_candidates/NPC_CASSANDRA.json"]),
            ("INCORRECT", "R2C 保留未来交涉，却未给出准确能力边界。", ["work/phase3d_r2c/candidates/by_profile/NPC_CASSANDRA.json"]),
            ("INCORRECT", "可读层仍把预言能力整体列为未确认。", ["work/human_approval/r1a_closed/by_profile/NPC_CASSANDRA.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "ability_evidence_collapsed_into_uncertainty",
        ),
        trace(
            "DRAGON_KING_REACTIONS_AFTER_ASSASSINATION",
            ["NPC_HONDA_KAI_FERGUS", "NPC_SERTANT_LU_YOURLAN", "PC_YU_LINFENG"],
            "御临风倒下后龙王制止接触；赫伯特检查并判断暂无生命危险；黄泉质疑安保使龙王与群龙哑口无言；本多同意赫伯特协助并让龙族展开调查。",
            "verified_source_fact",
            [f"{RAW_P2_18}:#861-#865"],
            ["SRC_P2_P018_POST_0012_984619", "SRC_P2_P018_POST_0013_984621", "SRC_P2_P018_POST_0019_984627"],
            ("INCORRECT", "EVENT_P2_021 只记录典礼中断与共同调查，丢失逐角色反应和 stance/knowledge 后果。", ["work/phase3d_r2/reviewed_inputs/events_part2.jsonl#EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION"]),
            ("INCORRECT", "R2A hub event 没有逐角色 consequence inventory。", R2A_CHRON),
            ("INCORRECT", "R2B 继承粗粒度事件。", R2B_EVENTS),
            ("MISSING", "Phase 3 人物档案没有系统投射这些反应。", ["work/phase3d_recall/repaired_candidates/NPC_HONDA_KAI_FERGUS.json"]),
            ("MISSING", "R2C 只有整段事件摘要，没有这些角色专属后果。", ["work/phase3d_r2c/candidates/by_profile/NPC_HONDA_KAI_FERGUS.json"]),
            ("MISSING", "可读层未呈现完整反应链。", ["work/human_approval/r1a_closed/by_profile/NPC_HONDA_KAI_FERGUS.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "hub_event_consequences_omitted",
        ),
        trace(
            "SERTANT_FIRST_FORMAL_APPEARANCE",
            ["NPC_SERTANT_LU_YOURLAN"],
            "瑟坦特首次正式出场时自报‘元素龙王瑟坦特·卢·优尔兰’，起身与御临风握手，并把前日暗杀事件称为龙族失态。",
            "verified_source_fact",
            [f"{RAW_P2_18}:#877"],
            ["SRC_P2_P018_POST_0028_985223"],
            ("INCORRECT", "whole_post 被划入 P2_021，但事件 participants/summary 没有瑟坦特的身份、职务、动作和立场。", ["work/phase3d_r2/reviewed_inputs/chunk_decisions.jsonl#SRC_P2_P018_POST_0028_985223"]),
            ("MISSING", "R2A 首次出现记录缺失；只在后续事件记录其觉醒。", R2A_CHRON),
            ("MISSING", "R2B 无首次出场链接。", R2B_EVENTS),
            ("MISSING", "Phase 3 仅有身份和后期经历，没有首次正式场景。", ["work/phase3d_recall/repaired_candidates/NPC_SERTANT_LU_YOURLAN.json"]),
            ("MISSING", "R2C timeline 无 P2_021 的瑟坦特首次出场。", ["work/phase3d_r2c/candidates/by_profile/NPC_SERTANT_LU_YOURLAN.json"]),
            ("MISSING", "可读层从缺席宴会跳到后期觉醒。", ["work/human_approval/r1a_closed/by_profile/NPC_SERTANT_LU_YOURLAN.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "first_appearance_semantics_omitted",
        ),
        trace(
            "KENDA_REPORTED_DEATH",
            ["NPC_KENDA_KAI_FERGUS"],
            "谢尔伦向御临风报告肯达以生命传出诺顿与南茜背叛的消息；这是明确的角色证言，不是遗体核验。",
            "verified_source_fact",
            ["extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.md:#60"],
            ["SRC_P3_P002_POST_0011_1043413"],
            ("INCORRECT", "whole_post 被划入泰蕾斯古史事件，但肯达死亡报告未进入语义。", ["work/phase3d_r2/reviewed_inputs/chunk_decisions.jsonl#SRC_P3_P002_POST_0011_1043413"]),
            ("MISSING", "R2A 没有肯达死亡报告事件/后果。", R2A_CHRON),
            ("MISSING", "R2B 缺失，profile index 错借 P3_003。", ["work/phase3d_r2b/indexes/by_profile/NPC_KENDA_KAI_FERGUS.json"]),
            ("CORRECT", "Phase 3D-R 从原帖独立补回并保留证言边界。", ["work/phase3d_recall/repaired_candidates/NPC_KENDA_KAI_FERGUS.json"]),
            ("INCORRECT", "知识项保留死亡报告，但 timeline 错误承载为与肯达无关的 P3_003 全摘要。", ["work/phase3d_r2c/candidates/by_profile/NPC_KENDA_KAI_FERGUS.json"]),
            ("INCORRECT", "可读层把 P3_003 当作后期经历，造成‘后期内容与他无关’的人工反馈。", ["work/human_approval/r1a_closed/by_profile/NPC_KENDA_KAI_FERGUS.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "transition_report_omitted_and_wrong_event_reused",
        ),
        trace(
            "XUE_YU_MENTOR_FRIEND_RELATIONSHIP",
            ["NPC_ELDER_XUE", "PC_YU_LINFENG"],
            "原团多次写出雪老对御临风的劝诫、战术指导、纠偏与掩护，支持‘长期长辈顾问/战斗保护者’；‘亦师亦友’是合理的人类概括，但不是原文中的正式关系名。",
            "human_review_hypothesis",
            ["extracted-first/18/posts.md:162-198", "extracted-first/20/posts.md:#957-#961", "extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md"],
            ["SRC_P1_P018_POST_0012_844648", "SRC_P1_P020_POST_0007_845659"],
            ("CORRECT", "相关场景分布在多项事件中，未把单次行动自动提升为永久情感。", ["work/phase3d_r2/reviewed_inputs/events_part1.jsonl"]),
            ("CORRECT", "R2A 保存劝诫、保护和共同经历的事件事实。", R2A_CHRON),
            ("CORRECT", "R2B 对相关事件建立机械索引。", ["work/phase3d_r2b/indexes/by_profile/NPC_ELDER_XUE.json"]),
            ("INCORRECT", "Phase 3 关系基线虽为 battle protector and elder，却仅保留一次山路阻击，覆盖不足以呈现长期顾问关系。", ["work/phase3d_recall/repaired_candidates/NPC_ELDER_XUE.json"]),
            ("INCORRECT", "R2C 机械继承单里程碑关系。", ["work/phase3d_r2c/candidates/by_profile/NPC_ELDER_XUE.json"]),
            ("INCORRECT", "可读层只解释为一次战斗保护，弱化持续关系。", ["work/human_approval/r1a_closed/by_profile/NPC_ELDER_XUE.md"]),
            "PHASE3_CHARACTER_EXTRACTION", "phase3_character_extraction", "multi_event_relationship_undercoverage",
        ),
        trace(
            "XUE_RETIREMENT_CONFIRMED",
            ["NPC_ELDER_XUE"],
            "雪老先表达退休意向，后明确说‘我现在已经退休了’；Phase 3D-R 记录峡谷后决定退休并获帝批准。",
            "verified_source_fact",
            ["extracted-first/21/posts.md:#1004", "extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:#306,#334"],
            ["SRC_P1_P020_POST_0007_845659", "SRC_P2_P007_POST_0035_915755"],
            ("INCORRECT", "R2A 正确保留早期退休意向，但含‘我现在已经退休了’的 whole_post 被路由到哈克善后事件，最终退休事实没有进入 reviewed event。", ["work/phase3d_r2/reviewed_inputs/events_part1.jsonl#EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE", "work/phase3d_r2/reviewed_inputs/chunk_decisions.jsonl#SRC_P2_P007_POST_0035_915755"]),
            ("INCORRECT", "R2A chronology 只有退居/意向，没有 P2 中已退休的确认。", R2A_CHRON),
            ("MISSING", "R2B 没有最终退休 transition。", ["work/phase3d_r2b/indexes/by_profile/NPC_ELDER_XUE.json"]),
            ("CORRECT", "Phase 3D-R 记录最终退休。", ["work/phase3d_recall/repaired_candidates/NPC_ELDER_XUE.json"]),
            ("CORRECT", "R2C 保留 durable role/history。", ["work/phase3d_r2c/candidates/by_profile/NPC_ELDER_XUE.json"]),
            ("CORRECT", "人物概览明确写峡谷战后解甲归田并获批准。", ["work/human_approval/r1a_closed/by_profile/NPC_ELDER_XUE.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "final_state_confirmation_omitted",
        ),
        trace(
            "XUE_D3_CAPITAL_LOCATION_BOUNDARY",
            ["NPC_ELDER_XUE"],
            "来源确认退休并在帝都活动，但没有把‘D3 时点仍在帝都养老’写成精确当前定位；该说法仍需人工/Current State 证据。",
            "unsupported_or_unresolved",
            ["extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:#306-#334", "current_state.md"],
            ["SRC_P2_P007_POST_0035_915755"],
            ("CORRECT", "历史场景与当前定位没有混同。", ["work/phase3d_r2/reviewed_inputs/events_part2.jsonl"]),
            ("CORRECT", "R2A 只支持历史地点。", R2A_CHRON),
            ("CORRECT", "R2B 不推导 D3 当前地点。", ["work/phase3d_r2b/indexes/by_profile/NPC_ELDER_XUE.json"]),
            ("CORRECT", "Phase 3 current location 未自动补写。", ["work/phase3d_recall/repaired_candidates/NPC_ELDER_XUE.json"]),
            ("CORRECT", "R2C current_location_ref=null。", ["work/phase3d_r2c/candidates/by_profile/NPC_ELDER_XUE.json"]),
            ("CORRECT", "可读层明确 D3 精确位置未知。", ["work/human_approval/r1a_closed/by_profile/NPC_ELDER_XUE.md"]),
            None, None, "none_unresolved_human_hypothesis",
        ),
        trace(
            "ELLIE_FROSTBITE_HEALING_BOUNDARY",
            ["NPC_ELLIE"],
            "艾利手部皮肤被冰寒破坏且残留冰霜；同帖只说她可以立刻用魔法恢复、并计划利用后续神圣新星顺带恢复，未找到实际治愈完成的明确句子。",
            "unsupported_or_unresolved",
            ["extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.md:#227"],
            ["SRC_P2_P005_POST_0028_912247"],
            ("INCORRECT", "whole_post 路由至宅邸战，但 injury、恢复能力与是否已治愈的边界未进入事件。", ["work/phase3d_r2/reviewed_inputs/chunk_decisions.jsonl#SRC_P2_P005_POST_0028_912247"]),
            ("MISSING", "R2A 不含该 transition。", R2A_CHRON),
            ("MISSING", "R2B 无对应状态。", R2B_EVENTS),
            ("CORRECT", "Phase 3 保留受伤状态但不伪造已治愈。", ["work/phase3d_recall/repaired_candidates/NPC_ELLIE.json"]),
            ("CORRECT", "R2C 将持续性保留未知。", ["work/phase3d_r2c/candidates/by_profile/NPC_ELLIE.json"]),
            ("CORRECT", "可读层明确是否持续到结尾未确认。", ["work/human_approval/r1a_closed/by_profile/NPC_ELLIE.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "ability_status_transition_omitted",
        ),
        trace(
            "EMPEROR_LONG_RULE_AND_CIVILIZATIONAL_ROLE",
            ["NPC_EMPEROR", "NPC_ELDER_XUE"],
            "雪老称帝教会人们开垦、种植、管理土地、传授武技并撰写魔法；另有团录叙述帝统治数千年。前者是雪老证言，后者来自其他叙事/发言，不能合并伪称全部由雪老单独证明。",
            "verified_source_fact",
            ["extracted-first/16/posts.md:#778", "extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.md:#400"],
            ["SRC_P1_P016_POST_0029_843621", "SRC_P2_P009_POST_0001_921122"],
            ("INCORRECT", "雪老证言帖被错误路由到 SPECIAL_INTERLUDE_003；数千年帖又被路由到不相关 P2_011，均未抽取帝的历史语义。", ["work/phase3d_r2/reviewed_inputs/chunk_decisions.jsonl#SRC_P1_P016_POST_0029_843621"]),
            ("MISSING", "R2A 没有帝的文明史/长期统治语义。", R2A_CHRON),
            ("MISSING", "R2B 无主题或帝 profile 索引。", R2B_EVENTS),
            ("MISSING", "Phase 3 帝档案缺少这段背景。", ["work/phase3d_recall/repaired_candidates/NPC_EMPEROR.json"]),
            ("MISSING", "R2C 帝候选缺少。", ["work/phase3d_r2c/candidates/by_profile/NPC_EMPEROR.json"]),
            ("MISSING", "中文审批档案缺少，人工审核因此提出补充。", ["work/human_approval/r1a_closed/by_profile/NPC_EMPEROR.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "speaker_subject_and_scene_routing_failure",
        ),
        trace(
            "DEATHWING_ELEMENTAL_BLESSING_TESTIMONY",
            ["NPC_DEATHWING", "NPC_OSHIRA"],
            "奥希拉明确以‘我也只是听说’为前提，称死亡之翼出生即获先祖与元素精灵祝福；只能作为奥希拉证言保存。",
            "verified_source_fact",
            [f"{RAW_P2_18}:#899"],
            ["SRC_P2_P018_POST_0050_987239"],
            ("CORRECT", "R2A 将其作为奥希拉 historical_testimony，并路由到 DEATHWING_BACKGROUND_AUDIT。", ["work/phase3d_r2/reviewed_inputs/events_part2.jsonl#EVENT_P2_022_DEATHWING_HISTORY_TESTIMONY"]),
            ("CORRECT", "R2A 保留 testimony 与御临风推理分层。", R2A_CHRON),
            ("CORRECT", "R2B 保留事件与 source lineage。", R2B_EVENTS),
            ("MISSING", "Phase 3 只在奥希拉侧保留证言，死亡之翼 established history 没有被描述对象索引。", ["work/phase3d_recall/repaired_candidates/NPC_DEATHWING.json"]),
            ("MISSING", "R2C 死亡之翼候选无该 testimony；只在奥希拉知识项出现。", ["work/phase3d_r2c/candidates/by_profile/NPC_DEATHWING.json"]),
            ("MISSING", "死亡之翼可读档案没有该证言。", ["work/human_approval/r1a_closed/by_profile/NPC_DEATHWING.md"]),
            "PHASE3_CHARACTER_EXTRACTION", "phase3_character_extraction", "cross_character_testimony_not_projected_to_subject",
        ),
        trace(
            "DEATHWING_MOUNTAIN_SUPREMACY_NOT_UNIFICATION",
            ["NPC_DEATHWING", "NPC_OSHIRA"],
            "奥希拉证言说死亡之翼任族长后‘龙族成为妄想山脉最强的种族’，没有明确说他统一或统治了整个魔兽山脉。",
            "unsupported_or_unresolved",
            [f"{RAW_P2_18}:#899"],
            ["SRC_P2_P018_POST_0050_987239"],
            ("CORRECT", "R2A 概括为战争与繁荣，没有升级成统一山脉。", ["work/phase3d_r2/reviewed_inputs/events_part2.jsonl#EVENT_P2_022_DEATHWING_HISTORY_TESTIMONY"]),
            ("CORRECT", "R2A 未生成统一山脉事实。", R2A_CHRON),
            ("CORRECT", "R2B 未强化。", R2B_EVENTS),
            ("CORRECT", "Phase 3 没有伪造统一。", ["work/phase3d_recall/repaired_candidates/NPC_DEATHWING.json"]),
            ("CORRECT", "R2C 没有统一山脉断言。", ["work/phase3d_r2c/candidates/by_profile/NPC_DEATHWING.json"]),
            ("CORRECT", "可读层没有该升级。", ["work/human_approval/r1a_closed/by_profile/NPC_DEATHWING.md"]),
            None, None, "none_unsupported_human_hypothesis",
        ),
        trace(
            "DEATHWING_OLD_GOD_CAUSATION_BOUNDARY",
            ["NPC_DEATHWING", "PC_YU_LINFENG"],
            "现有原团只出现御临风推理、白魔理论和可能未来中的古神关联；没有来源把死亡之翼古代堕落客观确认为古神腐化。",
            "unsupported_or_unresolved",
            ["extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.md", f"{RAW_P3_4}:#188", f"{RAW_P3_5}:#225-#229"],
            ["SRC_P3_P004_POST_0039_1078852", "SRC_P3_P005_POST_0026_1333535"],
            ("CORRECT", "相关记录均标为推理、理论或 possible future。", ["work/phase3d_r2/reviewed_inputs/events_part3.jsonl#EVENT_P3_009_DEATHWING_FINAL_WAR"]),
            ("CORRECT", "R2A unresolved 明确写古神关系未确认。", R2A_CHRON),
            ("CORRECT", "R2B 保留不确定性。", R2B_EVENTS),
            ("CORRECT", "Phase 3 constraint 禁止把古神关系写成事实。", ["work/phase3d_recall/repaired_candidates/NPC_DEATHWING.json"]),
            ("CORRECT", "R2C 未提升。", ["work/phase3d_r2c/candidates/by_profile/NPC_DEATHWING.json"]),
            ("CORRECT", "可读层明确不死机制及古神关系未确认。", ["work/human_approval/r1a_closed/by_profile/NPC_DEATHWING.md"]),
            None, None, "none_unsupported_human_hypothesis",
        ),
        trace(
            "DEATHWING_DEFEAT_BY_OTHER_CLAN_HEADS_TESTIMONY",
            ["NPC_DEATHWING", "NPC_OSHIRA"],
            "奥希拉证言称其他族长联合对抗死亡之翼/黑龙族，最终黑龙族战败、龙族元气大伤并改为龙王制；仍须保留证言归属。",
            "verified_source_fact",
            [f"{RAW_P2_18}:#899"],
            ["SRC_P2_P018_POST_0050_987239"],
            ("CORRECT", "R2A 按 testimony 保存并明确审计目标为 Deathwing。", ["work/phase3d_r2/reviewed_inputs/events_part2.jsonl#EVENT_P2_022_DEATHWING_HISTORY_TESTIMONY"]),
            ("CORRECT", "R2A 保持证言层。", R2A_CHRON),
            ("CORRECT", "R2B 保留。", R2B_EVENTS),
            ("MISSING", "Phase 3 死亡之翼档案未投射该被描述历史。", ["work/phase3d_recall/repaired_candidates/NPC_DEATHWING.json"]),
            ("MISSING", "R2C 死亡之翼候选未呈现。", ["work/phase3d_r2c/candidates/by_profile/NPC_DEATHWING.json"]),
            ("MISSING", "可读档案缺失。", ["work/human_approval/r1a_closed/by_profile/NPC_DEATHWING.md"]),
            "PHASE3_CHARACTER_EXTRACTION", "phase3_character_extraction", "cross_character_testimony_not_projected_to_subject",
        ),
        trace(
            "WHITE_MAGICIAN_GEM_UTOPIA_FAMILY_GOAL",
            ["NPC_WHITE_MAGICIAN"],
            "御临风当面指出其计划创造世界、使死者复苏；白魔随后亲口说追求家人活下去，且他确实取出魔宝石。来源支持魔宝石、理想乡/新世界和家人存活目标，但‘内心真实动机’仍只按公开陈述保存。",
            "verified_source_fact",
            [f"{RAW_P3_5}:#224-#226"],
            ["SRC_P3_P005_POST_0025_1247358", "SRC_P3_P005_POST_0026_1333535", "SRC_P3_P005_POST_0027_1333705"],
            ("INCORRECT", "P3_010 whole_post 已审阅但 summary 只保留取石和理论，漏掉直接公开的核心目标。", ["work/phase3d_r2/reviewed_inputs/events_part3.jsonl#EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY"]),
            ("MISSING", "R2A semantic event 没有家人/理想乡目标。", R2A_CHRON),
            ("MISSING", "R2B 继承遗漏。", R2B_EVENTS),
            ("CORRECT", "Phase 3D-R 从原帖独立记录公开目标。", ["work/phase3d_recall/repaired_candidates/NPC_WHITE_MAGICIAN.json"]),
            ("CORRECT", "R2C 保留公开声称的目标与不确定边界。", ["work/phase3d_r2c/candidates/by_profile/NPC_WHITE_MAGICIAN.json"]),
            ("CORRECT", "可读层写家人存活与理想乡。", ["work/human_approval/r1a_closed/by_profile/NPC_WHITE_MAGICIAN.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "explicit_goal_omitted",
        ),
        trace(
            "WHITE_MAGICIAN_DAUGHTER_RESURRECTION_BOUNDARY",
            ["NPC_WHITE_MAGICIAN"],
            "主线白魔只说‘家人’；‘复活女儿’在现有检索中对应特殊幕间的笛木奏/其他语境，不能自动并入普通主世界白魔的确定目标。",
            "unsupported_or_unresolved",
            [f"{RAW_P3_5}:#225-#226", "extracted-second/*/posts.md (SPECIAL_INTERLUDE search hits for daughter)"],
            ["SRC_P3_P005_POST_0026_1333535", "SRC_P3_P005_POST_0027_1333705"],
            ("CORRECT", "R2A 未把女儿写入主线。", ["work/phase3d_r2/reviewed_inputs/events_part3.jsonl#EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY"]),
            ("CORRECT", "R2A 保持 Special Interlude 隔离。", R2A_CHRON),
            ("CORRECT", "R2B 未混入。", R2B_EVENTS),
            ("CORRECT", "Phase 3 只写家人。", ["work/phase3d_recall/repaired_candidates/NPC_WHITE_MAGICIAN.json"]),
            ("CORRECT", "R2C 只写家人/理想乡。", ["work/phase3d_r2c/candidates/by_profile/NPC_WHITE_MAGICIAN.json"]),
            ("CORRECT", "可读层未写女儿。", ["work/human_approval/r1a_closed/by_profile/NPC_WHITE_MAGICIAN.md"]),
            None, None, "none_special_interlude_conflation_rejected",
        ),
        trace(
            "AINZ_DRAGON_KING_PROTECTION_DECLARATION_BOUNDARY",
            ["NPC_AINZ_OOAL_GOWN"],
            "安兹在 Campaign 中公开宣称赤炎龙王和元素龙王受其名义庇护；来源没有确认该宣言在 D3 仍构成无限期义务。",
            "verified_source_fact",
            [f"{RAW_P3_5}:#224"],
            ["SRC_P3_P005_POST_0025_1247358"],
            ("INCORRECT", "P3_010 记录安兹为 witness，却漏掉他的直接保护宣言。", ["work/phase3d_r2/reviewed_inputs/events_part3.jsonl#EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY"]),
            ("MISSING", "R2A chronology 没有宣言。", R2A_CHRON),
            ("MISSING", "R2B 无该语义。", R2B_EVENTS),
            ("CORRECT", "Phase 3D-R 从原帖补回，未推导 D3 义务。", ["work/phase3d_recall/repaired_candidates/NPC_AINZ_OOAL_GOWN.json"]),
            ("CORRECT", "R2C 以剧情历史处理。", ["work/phase3d_r2c/candidates/by_profile/NPC_AINZ_OOAL_GOWN.json"]),
            ("CORRECT", "可读层明确 Campaign 事实与长期义务未知。", ["work/human_approval/r1a_closed/by_profile/NPC_AINZ_OOAL_GOWN.md"]),
            "REVIEWED_SOURCE_DECISION", "r2a_semantics", "direct_action_omitted",
        ),
        trace(
            "CONTROL_TOLKIEN_EQUIPMENT_SUPPORT",
            ["NPC_TOLKIEN"],
            "托尔金是帝都矮人工匠，御临风请他为悠悠准备装备，随后实际提供支援。",
            "verified_source_fact",
            ["extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md"],
            ["SRC_P2_P008_POST_0001_917739", "SRC_P2_P008_POST_0009_919205"],
            ("CORRECT", "EVENT_P2_010 明确 supplier/beneficiary。", ["work/phase3d_r2/reviewed_inputs/events_part2.jsonl#EVENT_P2_010_SEWER_SEARCH_AND_PREPARATION"]),
            ("CORRECT", "R2A chronology 正确。", R2A_CHRON),
            ("CORRECT", "R2B index 正确。", ["work/phase3d_r2b/indexes/by_profile/NPC_TOLKIEN.json"]),
            ("CORRECT", "Phase 3 正确。", ["work/phase3d/approved_candidates/NPC_TOLKIEN.json"]),
            ("CORRECT", "R2C 正确。", ["work/phase3d_r2c/candidates/by_profile/NPC_TOLKIEN.json"]),
            ("CORRECT", "可读层正确。", ["work/human_approval/r1a_closed/by_profile/NPC_TOLKIEN.md"]),
            None, None, "none_control",
        ),
        trace(
            "CONTROL_WURAI_EIGHT_PILLAR_AND_FIRE_RESPONSE",
            ["NPC_WURAI"],
            "武赖是帝国八柱将之一、被称为帝国最强之矛，并在法师塔灾难中以火柱制裁 A。",
            "verified_source_fact",
            ["extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:211-241"],
            ["SRC_P2_P007_POST_0023_915324"],
            ("CORRECT", "EVENT_P2_008 正确记录行动；静态称号由人物资料支持。", ["work/phase3d_r2/reviewed_inputs/events_part2.jsonl#EVENT_P2_008_MAGE_TOWER_MASSACRE"]),
            ("CORRECT", "R2A 行动正确。", R2A_CHRON),
            ("CORRECT", "R2B 正确。", ["work/phase3d_r2b/indexes/by_profile/NPC_WURAI.json"]),
            ("CORRECT", "Phase 3 正确。", ["work/phase3d_recall/repaired_candidates/NPC_WURAI.json"]),
            ("CORRECT", "R2C 正确。", ["work/phase3d_r2c/candidates/by_profile/NPC_WURAI.json"]),
            ("CORRECT", "可读层正确。", ["work/human_approval/r1a_closed/by_profile/NPC_WURAI.md"]),
            None, None, "none_control",
        ),
        trace(
            "CONTROL_WILLIAM_CURSE_EXAMINATION_AND_TRANSFER",
            ["NPC_WILLIAM"],
            "威廉经营酒屋；他以孔雀和法印检查御临风，并与宝石翁、慕少艾参与耶各诅咒转移阵式。",
            "verified_source_fact",
            ["extracted-first/21/posts.md", "extracted-first/22/posts.md"],
            ["SRC_P1_P021_POST_0040_846113", "SRC_P1_P022_POST_0011_846373"],
            ("CORRECT", "P1_017/P1_021 正确记录检查与转移。", ["work/phase3d_r2/reviewed_inputs/events_part1.jsonl"]),
            ("CORRECT", "R2A 正确。", R2A_CHRON),
            ("CORRECT", "R2B 正确。", ["work/phase3d_r2b/indexes/by_profile/NPC_WILLIAM.json"]),
            ("CORRECT", "Phase 3 正确。", ["work/phase3d_recall/repaired_candidates/NPC_WILLIAM.json"]),
            ("CORRECT", "R2C 正确。", ["work/phase3d_r2c/candidates/by_profile/NPC_WILLIAM.json"]),
            ("CORRECT", "可读层正确。", ["work/human_approval/r1a_closed/by_profile/NPC_WILLIAM.md"]),
            None, None, "none_control",
        ),
    ]

    # Five profile-relevance traces isolate the downstream R2C fan-out failure.
    fanout = [
        ("R2C_RELEVANCE_HONDA", "NPC_HONDA_KAI_FERGUS", "P3_003/P3_009 were added as indirect events although they contain no Honda-specific act or consequence."),
        ("R2C_RELEVANCE_CASSIUS", "NPC_CASSIUS_BRIGHT", "P3_002 was used as the carrier for Cassius's terminal arc and its entire unrelated sanctuary-entry summary was copied."),
        ("R2C_RELEVANCE_KENDA", "NPC_KENDA_KAI_FERGUS", "P3_003 was used as the carrier for the death report and its entire Tiresias summary was copied."),
        ("R2C_RELEVANCE_LULUTIYE", "NPC_LULUTIYE", "P2_009 and P3_004 were added as indirect continuity and copied wholesale despite no Lulutiye-specific consequence."),
        ("R2C_RELEVANCE_OSHIRA", "NPC_OSHIRA", "P3_003 and P3_010 were added/copied wholesale although the profile-specific control history is narrower."),
    ]
    for fact_id, profile_id, finding in fanout:
        rows.append(trace(
            fact_id,
            [profile_id],
            "人物档案只应呈现该人物在事件中的动作、状态、知识或关系后果；不能因间接规则或作为宽事件参与者而复制整段他人剧情。",
            "verified_source_fact",
            ["raw source scenes cited by the affected R2A events"],
            ["registered source chunks for the affected R2A events"],
            ("CORRECT", "R2A 事件本身作为全局事件大体可用；本条审计的是人物相关性投射。", ["work/phase3d_r2/chronology/campaign_chronology.jsonl"]),
            ("CORRECT", "R2A 未声称整段摘要都是该人物专属经历。", R2A_CHRON),
            ("CORRECT", "R2B 只提供机械 event_links，本身没有生成可读人物叙事。", [f"work/phase3d_r2b/indexes/by_profile/{profile_id}.json"]),
            ("CORRECT", "Phase 3 原档案中的原子人物事实比最终 timeline 更窄。", [f"work/phase3d_recall/repaired_candidates/{profile_id}.json"]),
            ("INCORRECT", finding + " prepare_phase3d_r2c_packages.timeline_item() then prefixes role and copies event_summary plus every event-level consequence.", [f"work/phase3d_r2c/candidates/by_profile/{profile_id}.json", "scripts/prepare_phase3d_r2c_packages.py:239"]),
            ("INCORRECT", "中文渲染器忠实呈现了已经污染的 R2C timeline；没有自行发明，但也没有角色相关性过滤。", [f"work/human_approval/r1a_closed/by_profile/{profile_id}.md"]),
            "R2C_PACKAGE_PROJECTION", "r2c", "broad_event_wholesale_summary_fanout",
        ))

    recovered_by_recall = {
        "CASSIUS_CAPTURE_BY_GREMLIN",
        "CASSIUS_FACE_DEATH_AND_FINAL_MESSAGE",
        "CASSIUS_BLIND_DRAGON_IDENTITY_BOUNDARY",
        "KENDA_REPORTED_DEATH",
        "ELLIE_FROSTBITE_HEALING_BOUNDARY",
    }
    recovered_by_phase3d = {"WHITE_MAGICIAN_GEM_UTOPIA_FAMILY_GOAL"}
    for row in rows:
        status = row["phase3_profile"]["status"]
        finding = row["phase3_profile"]["finding"]
        profile_ids = row["character"]
        refs_c = [f"work/phase3c/profiles/{profile_id}.json" for profile_id in profile_ids]
        refs_d = [f"work/phase3d/approved_candidates/{profile_id}.json" for profile_id in profile_ids]
        refs_dr = [f"work/phase3d_recall/repaired_candidates/{profile_id}.json" for profile_id in profile_ids]
        if row["fact_id"] in recovered_by_recall:
            row["phase3c_profile"] = layer("MISSING", "Phase 3C 未包含该事实。", refs_c)
            row["phase3d_profile"] = layer("MISSING", "Phase 3D 未包含该事实。", refs_d)
            row["phase3d_recall_profile"] = layer("CORRECT", "Phase 3D-R 从原始来源补回并保留边界。", refs_dr)
        elif row["fact_id"] in recovered_by_phase3d:
            row["phase3c_profile"] = layer("MISSING", "Phase 3C 未包含该事实。", refs_c)
            row["phase3d_profile"] = layer("CORRECT", "Phase 3D 已包含该事实。", refs_d)
            row["phase3d_recall_profile"] = layer("CORRECT", "Phase 3D-R 保持该事实。", refs_dr)
        else:
            row["phase3c_profile"] = layer(status, finding, refs_c)
            row["phase3d_profile"] = layer(status, finding, refs_d)
            row["phase3d_recall_profile"] = layer(status, finding, refs_dr)
    return rows


def build_golden(matrix: list[dict]) -> list[dict]:
    golden = []
    for row in matrix:
        status = row["review_status"]
        boundary = {
            "verified_source_fact": "后续重建必须保留该命题及其归因/不确定性边界。",
            "human_review_hypothesis": "作为人工复核假设保留；不得在追加来源核验前提升为 Canon。",
            "unsupported_or_unresolved": "必须保持未确认或明确拒绝升级；不得以用户记忆自动覆盖原始来源。",
        }[status]
        golden.append({
            "regression_id": "GOLDEN_" + row["fact_id"],
            "fact_id": row["fact_id"],
            "characters": row["character"],
            "review_status": status,
            "proposition": row["proposition"],
            "source_refs": row["raw_source"]["refs"],
            "source_chunk_refs": row["source_chunk"]["refs"],
            "required_boundary": boundary,
            "must_not_promote": status != "verified_source_fact",
            "first_failure_layer": row["first_failure_layer"],
            "failure_class": row["failure_class"],
        })
    return golden


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def jsonl_bytes(rows: list[dict]) -> bytes:
    text = "".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in rows)
    return text.encode("utf-8")


def render_report(matrix: list[dict], golden: list[dict]) -> str:
    failure_counts = Counter(row["first_failure_bucket"] for row in matrix if row["first_failure_bucket"])
    review_counts = Counter(row["review_status"] for row in matrix)
    matrix_rows = []
    status_cn = {"CORRECT": "正确", "INCORRECT": "错误", "MISSING": "缺失", "NOT_APPLICABLE": "不适用"}
    for row in matrix:
        matrix_rows.append(
            f"| `{row['fact_id']}` | {', '.join(row['character'])} | {status_cn[row['raw_source']['status']]} | "
            f"{status_cn[row['reviewed_source_decision']['status']]} | {status_cn[row['r2a']['status']]} | "
            f"{status_cn[row['phase3_profile']['status']]} | {status_cn[row['r2c']['status']]} | "
            f"{status_cn[row['readable_projection']['status']]} | `{row['first_failure_layer'] or 'NONE'}` | `{row['failure_class']}` |\n"
        )
    report = f"""# R1C-0 — 语义信任层审计

状态：**PASS**  
审计性质：只读诊断；没有修复任何人物档案，也没有进入 Phase 4。  
建议重建基线：**`SOURCE_EXTRACTION`**

## 1. 结论

本轮对 {len(matrix)} 条端到端事实/相关性轨迹进行了逐层核验。原始帖子抽取、帖子顺序、正文内容和稳定 post ID 在抽样内均完整可读；没有发现足以要求重新抽取全部原始来源的损坏。最早的不可信层是 **R2A reviewed source semantics**：它既包含实质误读，也包含把 `whole_post` 标为已审阅、却没有把帖内关键人物事实写入事件语义的系统性遗漏。

因此不能以 R2A、R2B、Phase 3、R2C 或可读审批层作为新一轮重建的语义底座。建议保留现有 source extraction 与 source-chunk ledger，回到 **`SOURCE_EXTRACTION`**，重新审阅每个 source chunk 的原子语义，然后重建 R2A 及所有人物下游层。

R2A chronology 与 R2B 的 1:1 派生并不是本轮观察到的首错点：抽样中的错误在 reviewed event/semantic decision 已经存在；chronology 和 R2B 只是继续传播。故本轮 `r2a_chronology` 首错计数为 0，不表示 chronology 内容可信。

## 2. 审计规模与首错分布

- 端到端轨迹：{len(matrix)}
- 来源核实：{review_counts['verified_source_fact']}
- 人工复核假设：{review_counts['human_review_hypothesis']}
- 未支持或仍未解决：{review_counts['unsupported_or_unresolved']}
- source extraction 首错：{failure_counts['source_extraction']}
- R2A semantic review 首错：{failure_counts['r2a_semantics']}
- R2A chronology 首错：{failure_counts['r2a_chronology']}
- Phase 3 character extraction 首错：{failure_counts['phase3_character_extraction']}
- R2C 首错：{failure_counts['r2c']}
- readable projection 首错：{failure_counts['readable_projection']}
- 没有发现管线错误、但保留人工不确定边界或作为控制项：{sum(1 for row in matrix if row['first_failure_layer'] is None)}

完整逐层数据位于 `work/remediation/r1c0/semantic_trust_matrix.jsonl`；每层均使用 `CORRECT / INCORRECT / MISSING / NOT_APPLICABLE`。

## 3. 命运支流专项审计

原帖 #188 同时发生两件事：悠悠掌心留下淡乳白色光芒；信息如河水进入御临风意识，使他看见两条巨大可能支流。第一条是击败死亡之翼、白魔随后取得魔宝石并毁掉已经撤空的秘境；第二条是先囚住白魔、但死亡之翼在盲眼黑龙与古神帮助下击溃帝国军。原文随后明确说悠悠**本想指引**御临风走第一条，并保留御临风自由抉择。

#189 中御临风没有说“我选择第一条”。他识别盲眼黑龙是关键，要求本多说明取出/毁掉魔宝石的方法，并重新筹划。#191 中他明确要毁掉秘境，同时仍把击败死亡之翼列为当务之急并追索盲眼黑龙。这些是后续计划动作，不等于在 #188/#189 当场明确选择了第一条支流。最终确实击败死亡之翼且白魔取走宝石，也不能反向证明当时已经选择了第一条。

错误第一次出现于 `work/phase3d_r2/reviewed_inputs/events_part3.jsonl` 的 `EVENT_P3_008_FATE_BRANCH_SELECTION`：其摘要写成“御临风选择第一条并准备毁灭秘境”。这是 **preferred branch → selected branch** 的语义升级。R2A chronology、R2B、Phase 3、R2C 和中文审批材料随后稳定传播同一错误。

人工反馈中的“御临风选择了第三条路”有较强计划行为支持，但原帖没有找到同样明确的“我选择第三条”句子；因此本轮不把该措辞升级为 Canon。人工反馈中“她传的是乳白力量”只说对了一半：乳白保护力量确实存在，信息/可能未来的传输也同样明确发生。

## 4. hub event：御临风遇刺后的反应链

原始场景至少包含以下人物专属后果：

- 御临风失去听觉、视觉并昏倒；手中牌冒黑烟后化为灰烬。
- 悠悠立即赶到并极度担心。
- 龙王制止他人贸然触碰。
- 赫伯特检查并判断暂无即时生命危险，认为更像特异能力，建议详细检查。
- 黄泉质疑龙族安保，龙王与群龙一时无言。
- 罗伯以帝国使者身份提出帝国方参与检查。
- 本多同意赫伯特协助并让龙族着手调查。
- 瑟坦特在随后场景正式自报元素龙王身份，握手并把前日事件称作“龙族的失态”。
- 暗场明确给出卡珊德拉供物、道歉、预言与建议排除风险的有限参与证据。

R2A 的 `EVENT_P2_021` 只保留受袭、典礼中断和共同调查的粗粒度结果；它没有逐角色 reaction、stance、knowledge、first appearance 与 participant attribution。首错在 reviewed source decision/R2A semantic record，而不是后续中文渲染。

## 5. 跨角色证言

### 帝

雪老原话把帝描述为教会人们开垦、种植、管理土地、传授武技并撰写魔法的文明奠基者；另有帖子称帝统治数千年。两个事实来自不同叙述位置，不能统一伪装成“雪老一句话证明全部”。更严重的是，包含雪老证言的 P1 #778 被 chunk decision 路由到 `EVENT_INTERLUDE_003_EIGHT_DRAGONS_VAULT_REWARDS`；语义从 R2A 起完全丢失。

### 死亡之翼

奥希拉先声明“我也只是听说”，随后讲述死亡之翼出生获先祖和元素精灵祝福、率龙族征战、使龙族成为妄想山脉最强种族、晚年欲望扩大并研究邪法、黑龙失控、其他族长联合击败黑龙以及龙王制建立。R2A 正确把它标为奥希拉 testimony，并把路由目标写成 `DEATHWING_BACKGROUND_AUDIT`；但记录的 `character_ref` 仍是说话者奥希拉。Phase 3 没有把这份被描述历史投射到死亡之翼档案。

这说明存在一类系统性失败：**speaker/actor 有索引，semantic subject 没有结构化索引**。修复时应同时保留 speaker、subject 和 epistemic status，而不能把证言升级为客观古史。

人工提出的“统一魔兽山脉”超过原文（原文只说龙族成为最强种族）；“古神腐化死亡之翼”目前只见角色推理、理论和可能未来；两者均未进入 verified fact。

## 6. transition / current-state 审计

- **肯达**：谢尔伦明确报告其死亡并说明死亡发生于传递背叛消息。该帖被分给泰蕾斯古史事件却未抽取；Phase 3D-R 后来独立补回。R2C 又错误借用 P3_003 作为承载事件，导致可读层出现整段与肯达无关的泰蕾斯剧情。
- **雪老**：退休已由来源、Phase 3D-R、R2C 与可读档案记录；人工意见“完全错误”不适用于退休事实本身。真正缺陷是关系覆盖过窄。D3 精确位于帝都养老仍缺 Current State 级证据，不能把历史上在帝都活动自动升级为当前精确位置。
- **艾利**：手部冻伤与恢复能力/意图有明文，实际完成治愈没有明文。本轮保留“是否持续未知”；人工记忆作为待核验假设。
- **布莱特**：被捕、面容死亡、盲眼幼龙出现都有来源；“盲眼幼龙就是布莱特转化而成”只在御临风疑问中出现，身份连续性仍未确认。

## 7. R2C 人物相关性与 fan-out

五个抽查档案均可复现同一实现路径：`prepare_phase3d_r2c_packages.py::timeline_item()` 一旦事件被 direct index 或 `indirect_events` 选中，就把完整 `event_summary` 放入 `character_specific_summary`；同时又把事件的全部 character/relationship/ability/knowledge consequences 合并为人物后果，而不是只选该角色相关项。

结果是：

- 本多得到 P3_003、P3_009 等“间接关键”整段剧情；
- 布莱特的终局被错挂在 P3_002 秘境入口整段摘要；
- 肯达的死亡报告被错挂在 P3_003 泰蕾斯整段摘要；
- 露露缇耶得到 P2_009 与 P3_004 的他人剧情；
- 奥希拉得到 P3_003/P3_010 的宽摘要，而其真正相关的是更窄的受控状态与后果。

因此首错层是 R2C package projection。中文 renderer 只是忠实暴露污染，并不是独立注入无关内容。不能把 source-chunk 同现、宽事件 participant、间接 continuity rule 或一个旧 claim 的 event_ref 当成人物相关性的充分条件。

## 8. 逐层矩阵（人类摘要）

| fact_id | 人物 | 原始来源 | reviewed decision | R2A | Phase 3 | R2C | 可读层 | 最早失败层 | 失败类 |
|---|---|---|---|---|---|---|---|---|---|
{"".join(matrix_rows)}

## 9. 黄金语义回归集

`work/remediation/r1c0/golden_semantic_regressions.jsonl` 含 {len(golden)} 条与矩阵一一对应的 provisional regression records：

- `verified_source_fact`：{review_counts['verified_source_fact']}
- `human_review_hypothesis`：{review_counts['human_review_hypothesis']}
- `unsupported_or_unresolved`：{review_counts['unsupported_or_unresolved']}

该文件不是 Canon。它的作用是让下一阶段在重建前先冻结“来源到底支持什么、不能推出什么”。

## 10. 推荐重建范围

1. 保留 raw extraction、post IDs、source order 与 source-chunk ledger。
2. 重新审阅 R2A 的每个 `whole_post`：审阅完成必须意味着帖内每个高价值原子事实都有 disposition，而不只是帖子被分到某个大事件。
3. 为 speech/testimony 建立 `speaker`、`semantic_subject`、`epistemic_status` 三分结构。
4. 为 hub event 建立逐角色 consequence ledger，包括 reaction、knowledge、stance、first appearance 与 state transition。
5. 从修订后的 R2A 重建 chronology 和 R2B；不要手改 R2B。
6. 重建 Phase 3 character extraction，并以本黄金集做回归。
7. 重建 R2C 时禁止 whole-event summary fan-out；人物 timeline 必须由角色专属原子 consequence 组成。
8. 最后再生成中文 readable projection；保持 PC 控制、Special Interlude 隔离与 D3 未知边界。

## 11. 冻结与非目标

本任务没有修改 raw source、source extraction、R2A、R2B、Phase 3C/3D/3D-R、R2C production、schema、Canon、Worldbook、Current State 或 R1A authority。没有修复任何 profile，没有扩充人物人口，也没有进入 Phase 4。

## 12. 产物指纹

- matrix SHA-256：`{sha256_bytes(jsonl_bytes(matrix))}`
- golden SHA-256：`{sha256_bytes(jsonl_bytes(golden))}`
- 生成器：`scripts/build_r1c0_semantic_trust_audit.py`
"""
    return report.replace("|\n|", "|\n|")


def validate(matrix: list[dict], golden: list[dict]) -> None:
    if len(matrix) != 29 or len(golden) != 29:
        raise AssertionError((len(matrix), len(golden)))
    ids = [row["fact_id"] for row in matrix]
    if len(ids) != len(set(ids)):
        raise AssertionError("duplicate fact_id")
    required_layers = [
        "raw_source", "source_chunk", "reviewed_source_decision", "r2a", "r2b",
        "phase3_profile", "phase3c_profile", "phase3d_profile", "phase3d_recall_profile",
        "r2c", "r2c_package", "r2c_candidate", "readable_projection",
    ]
    for row in matrix:
        for name in required_layers:
            if row[name]["status"] not in VALID_LAYER_STATUS:
                raise AssertionError((row["fact_id"], name, row[name]["status"]))
        if row["review_status"] not in VALID_REVIEW_STATUS:
            raise AssertionError(row["review_status"])
    failures = Counter(row["first_failure_bucket"] for row in matrix if row["first_failure_bucket"])
    expected = Counter({"r2a_semantics": 14, "phase3_character_extraction": 3, "r2c": 5})
    if failures != expected:
        raise AssertionError((failures, expected))
    if Counter(row["review_status"] for row in matrix) != Counter({
        "verified_source_fact": 23,
        "human_review_hypothesis": 1,
        "unsupported_or_unresolved": 5,
    }):
        raise AssertionError("review-status count drift")


def main() -> int:
    parser = argparse.ArgumentParser(description="Build/check the R1C-0 read-only semantic trust audit outputs.")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    matrix = build_matrix()
    golden = build_golden(matrix)
    validate(matrix, golden)
    desired = {
        MATRIX_PATH: jsonl_bytes(matrix),
        GOLDEN_PATH: jsonl_bytes(golden),
        REPORT_PATH: render_report(matrix, golden).encode("utf-8"),
    }
    if args.check:
        mismatches = [str(path.relative_to(ROOT)) for path, data in desired.items() if not path.is_file() or path.read_bytes() != data]
        if mismatches:
            raise SystemExit("R1C-0 check failed: " + ", ".join(mismatches))
        print(f"R1C-0 check PASS: {len(matrix)} traces, {len(golden)} golden records")
        return 0
    for path, data in desired.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    print(f"R1C-0 generated: {len(matrix)} traces, {len(golden)} golden records")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
