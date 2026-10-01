#!/usr/bin/env python3
"""One-shot materializer for the source-reviewed R1A-2A decision artifact.

The command refuses to overwrite an existing decision file.  All semantic
decomposition below is explicit review data; the R1A-2B builder must consume
the materialized artifact and must not import this module or repeat its work.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

try:
    from scripts.audit_r1a1_semantic_routes import build_ledger as build_r1a1_ledger
    from scripts.phase3d_r2c_common import atomic_write_text, load_json, render_jsonl
except ModuleNotFoundError:  # pragma: no cover
    from audit_r1a1_semantic_routes import build_ledger as build_r1a1_ledger
    from phase3d_r2c_common import atomic_write_text, load_json, render_jsonl


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "work" / "remediation" / "r1a2" / "semantic_realization_decisions.jsonl"
EXTRA_SINGLE = {
    "CLAIM_WHITE_MAGICIAN_YU_HISTORY",
    "CLAIM_YOUYOU_YU_SHARED_HISTORY",
}


def t(text: str, **extra: Any) -> dict[str, Any]:
    return {"text": text, **extra}


# Explicit destination-specific atomic statements for every multi-route record,
# plus the two newly discovered single-route/multi-event milestone gaps.
SPECS: dict[str, dict[str, list[dict[str, Any]]]] = {
    "CLAIM_AINZ_NAZARICK_ROLE": {
        "identity.durable_roles": [t("安兹是纳萨力克的幸存统治者。")],
        "persona.values": [t("安兹明示优先维护纳萨力克的利益。", stability="stable")],
    },
    "CLAIM_BRIGHT_LATE_FATE": {"knowledge_timeline": [t("古雷姆林转告布莱特为正义而死；遗骸中盲眼幼龙与布莱特是否具有身份连续性未获确认。", status="TESTIMONY_HEARD", attribution="古雷姆林的转告与现场未决观察", uncertainty="uncertain")]},
    "CLAIM_DEATHWING_XIERLUN_HISTORY": {
        "biographical_background": [t("谢尔伦曾作为实际战力对抗死亡之翼与黑龙一族。")],
        "relationships[].relationship_milestones": [t("谢尔伦在终局战中压制死亡之翼本轮肉身，为御临风突入创造条件。", event="EVENT_P3_009_DEATHWING_FINAL_WAR", target="NPC_XIERLUN_VON_GILCODE")],
    },
    "CLAIM_ELDER_XUE_ABILITY_TRANSITION": {
        "biographical_background": [t("一次任务使雪老失去原有武艺；帝的治疗使其恢复普通健康。")],
        "ability_status_transitions": [t("雪老在边关重建斗气。", transition="ability_reconstruction", before="原有武艺已经失去；仅恢复普通健康", after="在边关重新建立斗气", persistence="persistent")],
    },
    "CLAIM_ELDER_XUE_RETIREMENT_AND_MEMORY_REQUEST": {"identity.durable_roles": [t("峡谷事件后，雪老决定从原职务退休并获得帝批准。")]},
    "CLAIM_ELLIE_REFERENCE_TRAITS": {
        "identity.durable_roles": [t("艾利是帝国法师。")],
        "persona.core_personality": [t("人物参考把艾利描述为善良、细心可靠，并指出她在魔法以外事务上较笨拙。", stability="stable")],
    },
    "CLAIM_ELLIE_GREMLIN_HOSTAGE": {"ability_status_transitions": [t("艾利获救时以冰寒之触限制古雷姆林并因此手部受伤。", event="EVENT_P2_005_GREMLIN_MANSION_BATTLE", transition="combat_injury", before="被挟持并被迫维持结界", after="获救后完成冰寒反制，但手部受伤", persistence="unknown")]},
    "CLAIM_EMPEROR_HAKU_SUCCESSION": {"knowledge_timeline": [t("帝声称哈克是其兄弟并向其提出继承选择；哈克未接受。", event="EVENT_P1_018_GRAVES_COMPANIONSHIP_PRISON_VISIT", status="BELIEVES", attribution="帝向哈克的自述与提议", uncertainty="character_belief", source_character="NPC_EMPEROR")]},
    "CLAIM_GREMLIN_A_HISTORY": {
        "biographical_background": [t("古雷姆林安排魔法师A的家人与未婚妻遭害，并诱导A走向绝望。")],
        "knowledge_timeline": [t("古雷姆林声称其老师的原宿主已经死亡，自己取代了该宿主并保有老师A的记忆。", status="BELIEVES", attribution="古雷姆林对魔法师A的自述", uncertainty="character_belief", source_character="NPC_GREMLIN")],
    },
    "CLAIM_GREMLIN_TERMINAL_TRANSFORMATION": {"knowledge_timeline": [t("古雷姆林遗骸中的盲眼幼龙是否与布莱特具有身份连续性，来源未确认。", event="EVENT_P3_002_SANCTUARY_ENTRY", status="THEORY", attribution="终局现场的未决判断", uncertainty="uncertain")]},
    "CLAIM_HAKU_OSHUTORU_SERVICE": {
        "biographical_background": [t("久远与失忆的哈克帮助奥修特尔部队击败魔物，随后进入其麾下。")],
        "identity.durable_roles": [t("哈克在奥修特尔麾下服役，并实际承担过指挥职责。")],
    },
    "CLAIM_HAKU_SUCCESSION_DISCLOSURE": {"knowledge_timeline": [t("哈克听到帝声称两人是兄弟并提出继承选择；哈克质疑该说法且未接受。", event="EVENT_P1_018_GRAVES_COMPANIONSHIP_PRISON_VISIT", status="TESTIMONY_HEARD", attribution="帝对哈克的自述", uncertainty="uncertain", source_character="NPC_EMPEROR")]},
    "CLAIM_HAKU_RELATIONSHIP": {
        "biographical_background": [t("久远在雪地救起失忆的哈克，为其命名并监护同行。")],
        "relationships[].relationship_baseline": [t("久远是救起、命名并监护失忆哈克的同行者。", target="NPC_KUON")],
    },
    "CLAIM_HONDA_KAI_FERGUS_HISTORY_1": {"ability_status_transitions": [t("白色魔法使在秘境终局压制并伤害了本多。", event="EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY", transition="combat_suppression", before=None, after="遭白色魔法使压制并受伤", persistence="unknown")]},
    "CLAIM_HONDA_YOUYOU_CEREMONY": {"relationships[].relationship_milestones": [t("本多在龙族仪式中公开确认悠悠成为空间龙族族长并继承“琳”之名。", event="EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING", target="NPC_YOUYOU")]},
    "CLAIM_JERGAL_HISTORY_1": {"knowledge_timeline": [t("慕少艾查证后向御临风说明咒文名为“耶各”，并把耶各描述为异世界死神。", event="EVENT_P2_001_CURSE_AND_CLINIC_OPENING", status="TESTIMONY_HEARD", attribution="慕少艾的查证说明", source_character="NPC_MU_SHAOAI")]},
    "CLAIM_JERGAL_GLOVE_GUIDANCE": {"knowledge_timeline": [t("御临风把手套接触后经历的异象理解为耶各关于受荣之道与死亡之翼封印的指引。", event="EVENT_P2_029_DEATHWING_BATTLEFIELD_AND_SEAL_WARNING", status="BELIEVES", attribution="御临风对异象的理解", uncertainty="character_belief", source_character="PC_YU_LINFENG")]},
    "CLAIM_JEWEL_ELDER_IDENTITY": {"knowledge_timeline": [t("宝石翁掌握并向帝汇报了对悠悠诅咒的调查结论。", event="EVENT_P1_019_XUE_REBUKE_AND_TRANSFER_DECISION", status="KNOWS", attribution="宝石翁与慕少艾的调查汇报", source_character="NPC_JEWEL_ELDER")]},
    "CLAIM_JEWEL_ELDER_TRANSFER_LIMIT": {"knowledge_timeline": [
        t("宝石翁说明诅咒不能真正移除，但可以转移给自愿承接者。", event="EVENT_P1_019_XUE_REBUKE_AND_TRANSFER_DECISION", status="KNOWS", attribution="宝石翁的调查结论", source_character="NPC_JEWEL_ELDER"),
        t("宝石翁确认御临风自愿承接后参与完成诅咒转移。", event="EVENT_P1_021_JERGAL_TRANSFER", status="KNOWS", attribution="转移仪式中的直接确认", source_character="NPC_JEWEL_ELDER"),
    ]},
    "CLAIM_JIANG_DRAGON_ELEPHANT_ART": {"ability_status_transitions": [t("姜子尤取得般若龙象功，并在主世界实际使用龙象之力。", event="EVENT_INTERLUDE_003_EIGHT_DRAGONS_VAULT_REWARDS", transition="ability_acquisition_with_carryback", before="未记录持有般若龙象功", after="取得般若龙象功且其龙象之力已在主世界使用", persistence="persistent")]},
    "CLAIM_JIANG_LOOKALIKE_ATTACK": {"knowledge_timeline": [
        t("峡谷阶段出现了与姜子尤面容相同的黄祸龙狼。", event="EVENT_P1_013_SPLIT_RECONNAISSANCE_SPACE_DRAGON", status="KNOWS", attribution="峡谷现场观察"),
        t("同貌者与姜子尤的亲缘、同一身份或形成机制均未确认。", event="EVENT_P1_014_DAKAS_PLOT_EXPOSED", status="THEORY", attribution="调查后的未决判断", uncertainty="uncertain"),
    ]},
    "CLAIM_JIANG_DEPARTURE": {"knowledge_timeline": [t("御临风无法确认姜子尤离开后的去向，也无法确认他与黄祸龙狼的关系。", event="EVENT_P2_009_AFTERMATH_HAKU_KNOWLEDGE", status="KNOWS", attribution="御临风对调查边界的陈述", source_character="PC_YU_LINFENG")]},
    "CLAIM_JIANG_ZIYOU_RELATIONSHIP": {"relationships[].relationship_milestones": [
        t("姜子尤与御临风共同应对神秘海域梦境中的武装袭击。", event="EVENT_INTERLUDE_002_MONSTER_BOX_ACQUIRED", target="PC_YU_LINFENG"),
        t("姜子尤与布莱特共同应对神秘海域梦境中的武装袭击。", event="EVENT_INTERLUDE_002_MONSTER_BOX_ACQUIRED", target="NPC_CASSIUS_BRIGHT"),
    ]},
    "CLAIM_KENDA_KAI_FERGUS_HISTORY_1": {
        "identity.durable_roles": [t("御临风的调查笔记把肯达记为帝国与龙族的公开牵线人。", uncertainty="character_belief", evidence="character_belief", attribution="御临风的调查笔记")],
        "knowledge_timeline": [t("御临风把肯达是否参与刺杀及其生死状态保留为待查事项。", status="SUSPECTS", attribution="御临风的调查笔记", uncertainty="character_belief", source_character="PC_YU_LINFENG")],
    },
    "CLAIM_KENDA_ASSASSINATION_ALLEGATION": {"knowledge_timeline": [t("白色魔法使把针对御临风的刺杀计划归给肯达与卡珊德拉。", event="EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION", status="TESTIMONY_HEARD", attribution="白色魔法使的指称", uncertainty="uncertain", source_character="NPC_WHITE_MAGICIAN")]},
    "CLAIM_KENDA_DEATH_REPORT": {"knowledge_timeline": [t("谢尔伦报告肯达在传递诺顿与南茜背叛消息时死亡。", event="EVENT_P3_003_TEIRESIAS_REVELATION", status="TESTIMONY_HEARD", attribution="谢尔伦向御临风的报告", uncertainty="uncertain", source_character="NPC_XIERLUN_VON_GILCODE")]},
    "CLAIM_KENDA_ENGAGEMENT_INTERVENTION": {"relationships[].relationship_milestones": [t("肯达要求御临风在比赛中输给自己并放弃与悠悠的婚约，称这是其应对预言计划的一部分。", event="EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING", target="PC_YU_LINFENG", uncertainty="confirmed")]},
    "CLAIM_KUON_APOTHECARY_STAGE": {"identity.durable_roles": [t("参考资料把久远记为年轻药师，并在该参考时点居于九雪医馆。") ]},
    "CLAIM_KUON_MASK_REACTION": {"knowledge_timeline": [t("久远把面具附近的疼痛与声音自行联系到继承的解放者之血。", event="EVENT_P2_005_GREMLIN_MANSION_BATTLE", status="BELIEVES", attribution="久远对自身反应的解释", uncertainty="character_belief", source_character="NPC_KUON")]},
    "CLAIM_KUON_REMOVAL": {"ability_status_transitions": [t("久远在面具反应中昏倒并被两个小型身影带走；后续来源只确认她仍失踪。", event="EVENT_P2_005_GREMLIN_MANSION_BATTLE", transition="consciousness_and_presence_loss", before="在宅邸战现场并有意识", after="昏倒后被带走，后续仍被注意为失踪", persistence="unknown")]},
    "CLAIM_KUON_RELATIONSHIP": {
        "biographical_background": [t("久远在雪地救起哈克、为其命名并以监护人身份同行。")],
        "relationships[].relationship_baseline": [t("久远是救起、命名并监护失忆哈克的同行者。", target="NPC_HAKU")],
    },
    "CLAIM_LEI_GUANG_COMMAND_HISTORY": {"knowledge_timeline": [
        t("雷光主张统帅应控制而非抛弃对牺牲士兵的恐惧。", event="EVENT_P2_011_REVIVAL_DILEMMA_WOSIS_BORDER", status="BELIEVES", attribution="雷光对副手的统帅原则陈述", source_character="NPC_LEI_GUANG"),
        t("雷光在龙族战役军议中接收了御临风提供的情报。", event="EVENT_P2_022_DEATHWING_HISTORY_TESTIMONY", status="TESTIMONY_HEARD", attribution="御临风在军议中的情报", source_character="PC_YU_LINFENG"),
    ]},
    "CLAIM_LEI_GUANG_FINAL_WAR_ORDERS": {"knowledge_timeline": [t("雷光已收到御临风关于最终封印与白色魔法使的警告。", event="EVENT_P2_029_DEATHWING_BATTLEFIELD_AND_SEAL_WARNING", status="TESTIMONY_HEARD", attribution="御临风的战场警告", source_character="PC_YU_LINFENG")]},
    "CLAIM_LINGCHI_HISTORY_2": {"ability_status_transitions": [t("凌迟在宫中被公开处斩。", event="EVENT_P1_022_EXECUTION_TAIL_HOOK", transition="death", before="被俘且存活", after="被公开斩首", persistence="persistent")]},
    "CLAIM_LINGCHI_MONSTER_TRANSFORMATION": {
        "biographical_background": [t("凌迟被魔兽抓拿后自愿化魔，并随后整合魔兽兵力、攻破边关。")],
        "ability_status_transitions": [t("凌迟自愿化魔并继承魔兽传说中的力量。", transition="monster_transformation", before="人类状态", after="化魔并取得魔兽传说力量", persistence="persistent")],
    },
    "CLAIM_LINGCHI_DAKAS_OBJECTIVE": {
        "biographical_background": [t("设定把凌迟的追击线连接到旧空间龙族惨案，但调查资料对该旧案仍保留疑问。", uncertainty="uncertain")],
        "knowledge_timeline": [
            t("调查者对凌迟与旧空间龙族惨案的具体关联仍保留疑问。", event="EVENT_P1_009_BORDER_TRUTH_AND_PURSUIT_MISSION", status="SUSPECTS", attribution="人物调查笔记", uncertainty="uncertain"),
            t("达卡斯利用空间龙把兵力带入帝都的计划已经暴露。", event="EVENT_P1_014_DAKAS_PLOT_EXPOSED", status="KNOWS", attribution="峡谷收网后的已揭露计划"),
        ],
    },
    "CLAIM_LINGCHI_PRE_EXECUTION_STATE": {"ability_status_transitions": [t("凌迟在认知受损且审讯无新情报的状态下被公开斩首。", event="EVENT_P1_022_EXECUTION_TAIL_HOOK", transition="death_after_cognitive_impairment", before="被俘且表现出认知受损", after="被公开斩首", persistence="persistent")]},
    "CLAIM_LULUTIYE_HISTORY_1": {"ability_status_transitions": [t("露露缇耶因魔物之盒事件受创后接受艾利的记忆处理。", event="EVENT_P1_022_EXECUTION_TAIL_HOOK", transition="memory_removal", before="保有魔物之盒事件相关记忆并受其创伤", after="相关记忆经魔法处理后不可用", persistence="unknown")]},
    "CLAIM_LULUTIYE_MEMORY_BOUNDARY": {"knowledge_timeline": [t("露露缇耶对魔物之盒事件的相关记忆在艾利处理时失去可用性。", event="EVENT_P1_022_EXECUTION_TAIL_HOOK", status="KNOWS", attribution="处理前持有、在处理事件终止的知识", valid_until="P1-022")]},
    "CLAIM_LULUTIYE_YOUYOU_HISTORY": {"relationships[].relationship_milestones": [
        t("露露缇耶与悠悠及御临风重逢。", event="EVENT_P2_009_AFTERMATH_HAKU_KNOWLEDGE", target="NPC_YOUYOU"),
        t("悠悠明确把露露缇耶列为让某地具有家之感的人之一。", event="EVENT_P3_004_SERTANT_AWAKENING_AND_HOME", target="NPC_YOUYOU"),
    ]},
    "CLAIM_LULUTIYE_RELATIONSHIP": {
        "relationships[].relationship_baseline": [t("露露缇耶是雪老的孙女。", target="NPC_ELDER_XUE")],
        "biographical_background": [t("露露缇耶长期寄居在九雪医馆。")],
    },
    "CLAIM_MU_SHAOAI_HISTORY_3": {"knowledge_timeline": [t("慕少艾向御临风解释咒文名为“耶各”并具有契约性质。", event="EVENT_P2_001_CURSE_AND_CLINIC_OPENING", status="TESTIMONY_HEARD", attribution="慕少艾的解释", source_character="NPC_MU_SHAOAI")]},
    "CLAIM_MU_SHAOAI_RELATIONSHIPS": {
        "relationships[].relationship_baseline": [
            t("李萍生是慕少艾所称误入歧途的徒弟。", target="NPC_LI_PINGSHENG"),
            t("奥修特尔与慕少艾是朋友。", target="NPC_OSHUTORU"),
        ],
        "relationships[].relationship_milestones": [
            t("奥修特尔以朋友身份为慕少艾作保。", event="EVENT_P1_008_DWARF_SHOP_RESCUE", target="NPC_OSHUTORU"),
            t("御临风向慕少艾告知李萍生的死讯。", event="EVENT_P1_020_MONSTER_BOX_DISASTER", target="NPC_LI_PINGSHENG"),
        ],
    },
    "CLAIM_MU_SHAOAI_MEMORY_INQUIRY": {"ability_status_transitions": [t("慕少艾探查御临风被封锁的记忆并为此承受身体代价。", event="EVENT_P1_008_DWARF_SHOP_RESCUE", transition="ability_use_cost", before="能够进行记忆探查", after="完成探查但身体受损耗", persistence="unknown")]},
    "CLAIM_MU_SHAOAI_CURSE_LIMIT": {
        "knowledge_timeline": [t("慕少艾明确表示悠悠所涉诅咒超出他能独自解决的范围。", event="EVENT_P2_001_CURSE_AND_CLINIC_OPENING", status="BELIEVES", attribution="慕少艾对自身处理范围的明确陈述", source_character="NPC_MU_SHAOAI")],
        "ability_status_transitions": [t("慕少艾确认自己不能独自解决该诅咒。", event="EVENT_P2_001_CURSE_AND_CLINIC_OPENING", transition="ability_limit_established", before=None, after="对该诅咒不具备独立解决能力", persistence="unknown")],
    },
    "CLAIM_MU_TOU_WIZARD_TRANSITION": {
        "biographical_background": [t("监狱塔危机中，沐透在自己的 Underworld 见到幻魔百首黄金龙并与白色魔法使交易。")],
        "ability_status_transitions": [t("沐透在释放白色魔法使后获得 Wizard Driver 与戒指魔法。", transition="equipment_and_magic_acquisition", before="未持有 Wizard Driver 与戒指魔法", after="持有 Wizard Driver 并可使用戒指魔法", persistence="persistent")],
    },
    "CLAIM_NOSURI_IDENTITY": {"relationships[].relationship_baseline": [t("欧基称诺斯莉为姐姐。", target="NPC_OUGI")]},
    "CLAIM_NOSURI_TRAP_INJURY": {"ability_status_transitions": [t("诺斯莉被下水道陷阱所伤，无法继续行动并接受治疗。", event="EVENT_P2_010_SEWER_SEARCH_AND_PREPARATION", transition="injury", before="能够继续追击", after="受伤后无法继续行动并接受治疗", persistence="unknown")]},
    "CLAIM_OSHIRA_CLAN_DEPENDENCY": {
        "identity.durable_affiliations": [t("御临风的调查笔记把黑龙族描述为受赤龙族保护与监督。", uncertainty="character_belief", evidence="character_belief", attribution="御临风的调查笔记")],
        "knowledge_timeline": [t("御临风的调查笔记认为黑龙族受赤龙族保护与监督。", status="BELIEVES", attribution="御临风的调查笔记", uncertainty="character_belief", source_character="PC_YU_LINFENG")],
    },
    "CLAIM_OSHIRA_LINEAGE_KNOWLEDGE": {
        "biographical_background": [t("奥希拉说前任黑龙族长是其父，父亲在他年幼时已死；御临风理解其所指为死亡之翼。", uncertainty="character_belief")],
        "knowledge_timeline": [t("奥希拉说明自己所知的许多黑龙历史来自传闻。", status="RUMOR", attribution="奥希拉对自身信息来源的说明", uncertainty="rumor", source_character="NPC_OSHIRA")],
    },
    "CLAIM_OSHIRA_YOUYOU_HISTORY": {
        "relationships[].relationship_baseline": [t("悠悠称奥希拉为叔叔；奥希拉以龙族长辈身份与她互动。", target="NPC_YOUYOU")],
        "relationships[].relationship_milestones": [
            t("奥希拉以龙族长辈身份迎接并与悠悠互动。", event="EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY", target="NPC_YOUYOU"),
            t("奥希拉受谢尔伦委托短暂陪护悠悠。", event="EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION", target="NPC_YOUYOU"),
        ],
    },
    "CLAIM_OSHUTORU_HISTORY_2": {"identity.public_identity": [t("右近自报本名为奥修特尔。", attribution="奥修特尔的自我介绍")]},
    "CLAIM_OSHUTORU_MASK_BATTLE": {"ability_status_transitions": [t("奥修特尔在峡谷战中解放水属性假面力量并以伏龙梅迎战。", event="EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE", transition="mask_power_activation", before="该场景中尚未解放水属性假面力量", after="解放水属性假面力量并投入战斗", persistence="temporary")]},
    "CLAIM_OSHUTORU_RELATIONSHIPS": {"relationships[].relationship_baseline": [
        t("奥修特尔收留哈克进入麾下。", target="NPC_HAKU"),
        t("奥修特尔收留久远进入麾下。", target="NPC_KUON"),
        t("奥修特尔称慕少艾为朋友。", target="NPC_MU_SHAOAI"),
    ]},
    "CLAIM_OSHUTORU_LATE_COMMAND": {"knowledge_timeline": [
        t("奥修特尔知道御临风所在单位受其直属指挥。", event="EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING", status="KNOWS", attribution="龙族任务指挥记录"),
        t("战场报告称奥修特尔与武赖所在战线遭袭并失去通讯。", event="EVENT_P2_029_DEATHWING_BATTLEFIELD_AND_SEAL_WARNING", status="TESTIMONY_HEARD", attribution="红月战事后的战场报告", uncertainty="uncertain"),
    ]},
    "CLAIM_OSHUTORU_RELATIONSHIP": {
        "biographical_background": [t("奥修特尔赏识哈克的智谋并邀请他成为部下。")],
        "relationships[].relationship_baseline": [t("奥修特尔曾赏识并招揽哈克成为部下。", target="NPC_HAKU")],
    },
    "CLAIM_REN_UNDERCOVER_CLEARANCE": {"knowledge_timeline": [t("任帆真掌握校园会议与会者档案，但不掌握周正的受限细节。", event="EVENT_INTERLUDE_P3_001_MODERN_GHOST_OPENING", status="KNOWS", attribution="任帆真的任务权限边界", source_character="NPC_REN_FANZHEN")]},
    "CLAIM_SERTANT_LU_YOURLAN_HISTORY_2": {"ability_status_transitions": [t("元素龙王在秘境内失去意识并被白色魔法使的结界束缚。", event="EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY", transition="incapacitation_and_restraint", before="在秘境内活动", after="失去意识并受结界束缚", persistence="unknown")]},
    "CLAIM_SERTANT_MASK_AWAKENING": {"ability_status_transitions": [t("瑟坦特从昏睡中苏醒并启动帝国假面，随后投入对白色魔法使的战斗。", event="EVENT_P3_004_SERTANT_AWAKENING_AND_HOME", transition="mask_awakening", before="佩戴假面后处于昏睡", after="苏醒并启动帝国假面", persistence="unknown")]},
    "CLAIM_WILLIAM_IDENTITY": {"ability_status_transitions": [t("威廉施术帮助御临风恢复被抹去的感情与边关记忆。", event="EVENT_P1_018_GRAVES_COMPANIONSHIP_PRISON_VISIT", transition="demonstrated_memory_restoration", before=None, after="已实际展示恢复被抹去感情与记忆的施术能力", persistence="unknown")]},
    "CLAIM_WILLIAM_FULL_NAME": {"identity.public_identity": [t("他自我介绍为“威廉信长”。", attribution="威廉的自我介绍")]},
    "CLAIM_WOSIS_RELATIONSHIP": {
        "relationships[].relationship_milestones": [t("沃西斯向御临风说明任务，并强硬询问其异界人与组织信息。", event="EVENT_P2_011_REVIVAL_DILEMMA_WOSIS_BORDER", target="PC_YU_LINFENG")],
        "knowledge_timeline": [t("沃西斯把御临风的异界人身份及其组织信息作为待询问事项。", event="EVENT_P2_011_REVIVAL_DILEMMA_WOSIS_BORDER", status="SUSPECTS", attribution="沃西斯对御临风的询问", uncertainty="uncertain", source_character="NPC_WOSIS")],
    },
    "CLAIM_WURAI_HISTORY_1": {"identity.durable_roles": [t("武赖是帝国八柱将之一。") ]},
    "CLAIM_WURAI_FIRE_MASK": {
        "identity.public_identity": [t("武赖是火神假面的持有者。")],
        "ability_status_transitions": [t("设定资料确认武赖持有火神假面。", transition="equipment_status_established", before=None, after="持有火神假面", persistence="persistent")],
    },
    "CLAIM_XIERLUN_ALLIANCE_AND_ENGAGEMENT_PLANNING": {
        "biographical_background": [t("谢尔伦与帝多年为友，并共同策划帝国—龙族联合及御临风与悠悠的婚约安排。")],
        "relationships[].relationship_baseline": [t("谢尔伦与帝是多年好友，并在帝国—龙族联合中共同协调。", target="NPC_EMPEROR")],
    },
    "CLAIM_XIERLUN_COMBAT_BACKGROUND": {
        "biographical_background": [t("谢尔伦是仍存活的上古龙族之一，曾作为实际战力对抗死亡之翼与黑龙一族。")],
        "ability_status_transitions": [t("晚年谢尔伦的身体与魔法在龙王或族长中约为中游，但凭经验与奇物仍属一线战力。", transition="age_related_combat_state", before="上古时期曾直接对抗死亡之翼与黑龙一族", after="晚年身体与魔法约为中游，综合经验与奇物仍属一线", persistence="persistent")],
    },
    "CLAIM_XIERLUN_ENGAGEMENT_RELATIONSHIP": {
        "biographical_background": [t("谢尔伦参与策划御临风与悠悠的婚约安排。")],
        "relationships[].relationship_milestones": [t("谢尔伦在御临风抵达龙族秘境后向其提出并解释婚约安排。", event="EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY", target="PC_YU_LINFENG")],
    },
    "CLAIM_YOMI_LION_KING_TRANSITION": {"ability_status_transitions": [t("狮子王归还时封印已经解除，黄泉能够接触并与剑中灵体乱红莲沟通。", event="EVENT_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION", transition="weapon_unsealing", before="狮子王受封印且无法正常接触其灵体", after="封印解除并可与乱红莲沟通", persistence="persistent")]},
    "CLAIM_YOUYOU_YU_SHARED_HISTORY": {"relationships[].relationship_milestones": [
        t("悠悠救治御临风。", event="EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE", target="PC_YU_LINFENG"),
        t("御临风自愿承接悠悠的诅咒。", event="EVENT_P1_021_JERGAL_TRANSFER", target="PC_YU_LINFENG"),
    ]},
    "CLAIM_YOUYOU_YU_LATE_MILESTONES": {
        "relationships[].relationship_baseline": [t("御临风为保护悠悠而暂时接受婚约安排，并明确保留悠悠日后自行选择的权利。", target="PC_YU_LINFENG")],
        "relationships[].relationship_milestones": [
            t("御临风把婚约作为保护悠悠的权宜安排暂时接受，并保留她日后选择权。", event="EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY", target="PC_YU_LINFENG"),
            t("本多在仪式中公开称御临风为悠悠的婚约者，并声称两人相爱；这是本多的公开说法。", event="EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING", target="PC_YU_LINFENG", uncertainty="character_belief"),
            t("悠悠与御临风共同进入受荣之道。", event="EVENT_P3_003_TEIRESIAS_REVELATION", target="PC_YU_LINFENG"),
            t("悠悠的力量在死亡之翼战中保护御临风。", event="EVENT_P3_009_DEATHWING_FINAL_WAR", target="PC_YU_LINFENG"),
        ],
    },
    "CLAIM_ZHENZI_HISTORY_2": {
        "biographical_background": [t("御临风恢复记忆后明确陈述贞子已经为救他而死。", uncertainty="character_belief")],
        "knowledge_timeline": [t("御临风相信贞子已经为救他而死。", status="BELIEVES", attribution="御临风恢复记忆后的陈述", uncertainty="character_belief", source_character="PC_YU_LINFENG")],
    },
    "CLAIM_ZHENZI_RELATIONSHIP": {
        "biographical_background": [t("边关陷落时，贞子救下御临风，并以自身为代价换取其生还。")],
        "relationships[].relationship_baseline": [t("贞子是边关陷落时救下御临风的历史救命者。", target="PC_YU_LINFENG")],
    },
    "CLAIM_YU_LINFENG_CURSE_HISTORY": {"ability_status_transitions": [t("御临风自愿承接悠悠身上的耶各诅咒。", event="EVENT_P1_021_JERGAL_TRANSFER", transition="curse_transfer", before="未承载悠悠身上的耶各诅咒", after="承载由悠悠转移的耶各诅咒", persistence="unknown")]},
    "CLAIM_YU_LINFENG_EARLY_BONDS": {
        "biographical_background": [
            t("易冷曾是御临风的剑术老师。"),
            t("雪老曾是御临风的师长与朋友。"),
        ],
        "relationships[].relationship_baseline": [
            t("易冷是御临风的剑术老师。", target="NPC_YI_LENG"),
            t("雪老是御临风的师长与朋友。", target="NPC_ELDER_XUE"),
        ],
        "knowledge_timeline": [t("御临风自述有六百九十八名部下死亡，并认为自己对此负有责任。", status="BELIEVES", attribution="御临风的自述", uncertainty="character_belief", source_character="PC_YU_LINFENG")],
    },
    "CLAIM_YU_LINFENG_MEMORY_RESTORATION": {"knowledge_timeline": [t("威廉施术后，御临风重新取得与贞子及边关事件相关的感情和记忆。", event="EVENT_P1_018_GRAVES_COMPANIONSHIP_PRISON_VISIT", status="KNOWS", attribution="御临风经施术恢复的个人记忆", source_character="PC_YU_LINFENG", valid_from="P1-018") ]},
    "CLAIM_YU_LINFENG_ENGAGEMENT_HISTORY": {"relationships[].relationship_baseline": [t("御临风把婚约作为保护悠悠的权宜办法暂时接受，并明确保留悠悠日后选择权；这不构成永久情感承诺。", target="NPC_YOUYOU", current=None)]},
    "CLAIM_YU_LINFENG_YOUYOU_INHERITANCE_WITNESS": {"relationships[].relationship_milestones": [
        t("御临风在场见证悠悠成为空间龙族族长并继承“琳”之名。", event="EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING", target="NPC_YOUYOU"),
        t("御临风与悠悠共同进入受荣之道。", event="EVENT_P3_003_TEIRESIAS_REVELATION", target="NPC_YOUYOU"),
    ]},
    "CLAIM_YU_LINFENG_RECEIVED_YOUYOU_PROTECTION": {"ability_status_transitions": [t("死亡之翼战中，御临风受到悠悠乳白色力量的保护，至少一次脱离抓制并在龙吼中继续受护。", event="EVENT_P3_009_DEATHWING_FINAL_WAR", transition="temporary_external_protection", before="该场景中尚未受到此保护", after="在战斗中受到悠悠力量保护", persistence="temporary")]},
    "CLAIM_YU_LINFENG_YOUYOU_HISTORY": {"relationships[].relationship_milestones": [
        t("悠悠救治御临风与雪老。", event="EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE", target="NPC_YOUYOU"),
        t("御临风自愿承接悠悠的诅咒。", event="EVENT_P1_021_JERGAL_TRANSFER", target="NPC_YOUYOU"),
    ]},
    "CLAIM_YU_LINFENG_YOUYOU_LATE_HISTORY": {
        "relationships[].relationship_baseline": [t("御临风为保护悠悠而暂时接受婚约安排，并明确保留她日后自行选择的权利；不据此生成永久情感承诺。", target="NPC_YOUYOU", current=None)],
        "relationships[].relationship_milestones": [
            t("御临风以保护悠悠为目的暂时接受婚约安排，并保留她日后选择权。", event="EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY", target="NPC_YOUYOU"),
            t("本多在公开仪式中称御临风为悠悠的婚约者；这是本多的公开说法。", event="EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING", target="NPC_YOUYOU", uncertainty="character_belief"),
            t("御临风见证悠悠的族长与姓名传承，并与她共同进入受荣之道。", event="EVENT_P3_003_TEIRESIAS_REVELATION", target="NPC_YOUYOU"),
            t("死亡之翼战中，御临风受到悠悠力量保护。", event="EVENT_P3_009_DEATHWING_FINAL_WAR", target="NPC_YOUYOU"),
        ],
    },
    "CLAIM_YU_LINFENG_ZHENZI_HISTORY": {
        "biographical_background": [t("贞子多次帮助御临风与雪老，并以自身为代价换取御临风生还。")],
        "relationships[].relationship_milestones": [t("御临风经威廉施术恢复与贞子相关的感情和记忆。", event="EVENT_P1_018_GRAVES_COMPANIONSHIP_PRISON_VISIT", target="NPC_ZHENZI")],
        "knowledge_timeline": [t("御临风恢复了贞子救助与牺牲相关的个人记忆。", event="EVENT_P1_018_GRAVES_COMPANIONSHIP_PRISON_VISIT", status="KNOWS", attribution="御临风经施术恢复的个人记忆", source_character="PC_YU_LINFENG", valid_from="P1-018")],
    },
    "CLAIM_WHITE_MAGICIAN_YU_HISTORY": {"relationships[].relationship_milestones": [
        t("御临风与白色魔法使在地下兵工厂交锋、追问并交换情报。", event="EVENT_P2_023_WHITE_MAGICIAN_ARMORY_CONFRONTATION", target="PC_YU_LINFENG"),
        t("御临风与白色魔法使在秘境终局继续对峙，交涉仍未解决。", event="EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY", target="PC_YU_LINFENG"),
    ]},
}


BASELINES = {
    "CLAIM_ELLIE_YU_COMPANION_ADVISER": [("PC_YU_LINFENG", "艾利是御临风的旅行同伴与魔法顾问。")],
    "CLAIM_EMPEROR_XIERLUN_ALLIANCE_HISTORY": [("NPC_XIERLUN_VON_GILCODE", "帝与谢尔伦是多年好友，并共同操盘帝国—龙族联合。")],
    "CLAIM_HONDA_KAI_FERGUS_RELATIONSHIP": [("NPC_KENDA_KAI_FERGUS", "本多是肯达之父。")],
    "CLAIM_KENDA_KAI_FERGUS_RELATIONSHIP": [("NPC_HONDA_KAI_FERGUS", "肯达是本多之子。")],
    "CLAIM_NOSURI_OUGI_SIBLING": [("NPC_OUGI", "诺斯莉是欧基所称的姐姐。")],
    "CLAIM_XIERLUN_VON_GILCODE_RELATIONSHIP": [("NPC_EMPEROR", "谢尔伦与帝是多年好友，并在帝国—龙族联合中承担协调作用。")],
}

MILESTONE_TARGETS = {
    "CLAIM_CASSIUS_BRIGHT_RELATIONSHIP": "PC_YU_LINFENG",
    "CLAIM_DEATHWING_RELATIONSHIP": "PC_YU_LINFENG",
    "CLAIM_ELDER_XUE_RELATIONSHIP": "PC_YU_LINFENG",
    "CLAIM_EMPEROR_YU_AUDIENCE": "PC_YU_LINFENG",
    "CLAIM_MU_SHAOAI_RELATIONSHIP": "PC_YU_LINFENG",
    "CLAIM_TOLKIEN_YU_SUPPORT": "PC_YU_LINFENG",
    "CLAIM_YOMI_ISAYAMA_RELATIONSHIP": "PC_YU_LINFENG",
}


def token(value: str) -> str:
    return re.sub(r"[^A-Z0-9]+", "_", value.upper()).strip("_")


def evidence_fields(spec: dict[str, Any], refs: list[str]) -> dict[str, Any]:
    return {
        "evidence_mode": spec.get("evidence", "explicit_source_statement"),
        "attribution": spec.get("attribution", "R1A-2A source review of the cited legacy evidence"),
        "source_refs": refs,
        "uncertainty": spec.get("uncertainty", "confirmed"),
        "notes": "R1A-2A reviewed atomic realization; no present state or future conduct is inferred.",
    }


def typed_payload(section: str, claim_id: str, key: str, spec: dict[str, Any], refs: list[str], story: dict[str, str]) -> dict[str, Any]:
    suffix = token(f"{claim_id}_{key}")
    text = spec["text"]
    ev = spec.get("event")
    common = evidence_fields(spec, refs)
    if section == "biographical_background":
        return {"background_id": f"BACKGROUND_{suffix}", "statement": text, "temporal_scope": "R1A-1 审定的 Campaign 前史或回述历史范围。", "relative_time": "Campaign 前史或在 Campaign 中回述的既往历史", "reality_status": "BIOGRAPHICAL_BACKGROUND", "related_event_refs": [ev] if ev else [], **common}
    if section.startswith("identity."):
        return {"identity_id": f"IDENTITY_{suffix}", "statement": text, **common}
    if section.startswith("persona."):
        return {"persona_id": f"PERSONA_{suffix}", "statement": text, "stability": spec.get("stability", "observed_only"), "reality_status": "BELIEF", "supporting_event_refs": [ev] if ev else [], "supporting_revelation_refs": [], **common}
    if section == "relationships[].relationship_baseline":
        target = spec["target"]
        return {"relationship_id": f"RELATIONSHIP_{token(target)}_{suffix}", "related_character_ref": target, "related_character_label": None, "relationship_baseline": text, "relationship_milestones": [], "current_stance": spec.get("current"), "source_refs": refs, "uncertainty": spec.get("uncertainty", "confirmed"), "notes": "Historical/durable baseline only; no current emotion, loyalty, obligation, or future choice is inferred."}
    if section == "relationships[].relationship_milestones":
        target = spec["target"]
        milestone = {"milestone_id": f"MILESTONE_{suffix}", "event_ref": ev, "background_ref": None, "story_order": story.get(ev) if ev else None, "change": text, "reality_status": "ACTUAL_EVENT" if ev else "BIOGRAPHICAL_BACKGROUND", **common}
        return {"relationship_target": {"related_character_ref": target, "related_character_label": None}, "milestone": milestone}
    if section == "ability_status_transitions":
        return {"transition_id": f"TRANSITION_{suffix}", "event_ref": ev, "background_ref": None, "story_order": story.get(ev) if ev else None, "transition_type": spec["transition"], "before_state": spec.get("before"), "after_state": spec.get("after", text), "persistence": spec.get("persistence", "unknown"), "reality_status": "ACTUAL_EVENT" if ev else "BIOGRAPHICAL_BACKGROUND", **common}
    if section == "knowledge_timeline":
        return {"knowledge_id": f"KNOWLEDGE_{suffix}", "proposition": text, "epistemic_status": spec.get("status", "KNOWS"), "acquired_at_event_ref": ev, "acquired_at_story_order": story.get(ev) if ev else None, "source_character_ref": spec.get("source_character"), "attribution": common["attribution"], "supersedes": [], "valid_from": spec.get("valid_from", story.get(ev) if ev else None), "valid_until": spec.get("valid_until"), "reality_status": {"BELIEVES": "BELIEF", "SUSPECTS": "INFERENCE", "THEORY": "THEORY", "RUMOR": "RUMOR", "TESTIMONY_HEARD": "TESTIMONY"}.get(spec.get("status", "KNOWS"), "BELIEF"), "source_refs": refs, "uncertainty": common["uncertainty"], "notes": common["notes"]}
    raise ValueError(section)


def original_statements() -> dict[tuple[str, str], str]:
    result: dict[tuple[str, str], str] = {}
    for path in sorted((ROOT / "work" / "phase3d_r2c" / "migration_packages").glob("*.json")):
        package = load_json(path)
        for row in package["old_claim_migrations"]:
            result[(package["profile_id"], row["old_claim_id"])] = row["original_statement"]
    return result


def build_decisions() -> list[dict[str, Any]]:
    ledger = build_r1a1_ledger()
    originals = original_statements()
    import json
    events = [json.loads(line) for line in (ROOT / "work" / "phase3d_r2" / "chronology" / "campaign_chronology.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    story = {row["event_id"]: row["story_axis"]["story_order_start"] for row in events}
    output: list[dict[str, Any]] = []
    for semantic in ledger:
        claim_id = semantic["old_claim_id"]
        refs = semantic["source_refs"]
        routes = semantic["intended_semantic_route"]
        if semantic["split_required"] and routes == ["campaign_timeline"]:
            review_class = "MECHANICALLY_SUFFICIENT"
        elif semantic["split_required"]:
            review_class = "KNOWN_INITIAL_GAP"
        elif len(routes) > 1:
            review_class = "ADDITIONAL_MULTI_ROUTE_GAP"
        elif claim_id in EXTRA_SINGLE:
            review_class = "ADDITIONAL_SINGLE_ROUTE_GAP"
        elif routes == ["campaign_timeline"]:
            review_class = "MECHANICALLY_SUFFICIENT"
        else:
            review_class = "EXISTING_ATOMIC_VALUE_SUFFICIENT"
        instances: list[dict[str, Any]] = []
        for route in routes:
            if route == "campaign_timeline":
                for event_ref in semantic["relevant_r2a_event_refs"]:
                    instances.append({"destination_section": route, "destination_instance_key": event_ref, "realization_mode": "REUSE_R2A_EVENT", "source_refs": refs, "payload": {"event_ref": event_ref, "local_object_count": 0}})
                continue
            route_specs = SPECS.get(claim_id, {}).get(route)
            if route_specs is None and route == "relationships[].relationship_baseline" and claim_id in BASELINES:
                route_specs = [t(text, target=target) for target, text in BASELINES[claim_id]]
            if route_specs is None and route == "relationships[].relationship_milestones" and claim_id in MILESTONE_TARGETS:
                events_for_claim = semantic["relevant_r2a_event_refs"]
                if len(events_for_claim) != 1:
                    raise ValueError(f"{claim_id}: explicit per-event milestone specs required")
                route_specs = [t(originals[(semantic["profile_id"], claim_id)], event=events_for_claim[0], target=MILESTONE_TARGETS[claim_id])]
            if route_specs is None:
                if len(routes) > 1 or claim_id in EXTRA_SINGLE:
                    raise ValueError(f"{claim_id}: missing reviewed typed specs for {route}")
                statement = originals[(semantic["profile_id"], claim_id)]
                if route == "biographical_background" or route.startswith("identity."):
                    route_specs = [t(statement)]
                else:
                    raise ValueError(f"{claim_id}: no direct atomic reuse spec for {route}")
            mode = "REUSE_EXISTING_ATOMIC_VALUE" if review_class == "EXISTING_ATOMIC_VALUE_SUFFICIENT" else "REVIEWED_TYPED_PAYLOAD_REQUIRED"
            for index, spec in enumerate(route_specs, 1):
                instance_key = spec.get("event") or spec.get("target") or str(index)
                if len(route_specs) > 1:
                    instance_key = f"{instance_key}_{index}"
                payload = typed_payload(route, claim_id, str(instance_key), spec, refs, story)
                instances.append({"destination_section": route, "destination_instance_key": str(instance_key), "realization_mode": mode, "source_refs": refs, "payload": payload})
        output.append({"profile_id": semantic["profile_id"], "old_claim_id": claim_id, "review_class": review_class, "reviewed_basis": "R1A-1 route authority retained; destination cardinality and exact existing-schema payload reviewed against cited claim/event evidence.", "destination_instances": instances})
    return output


def main() -> int:
    if OUTPUT.exists():
        raise SystemExit(f"refusing to overwrite reviewed decision source: {OUTPUT}")
    atomic_write_text(OUTPUT, render_jsonl(build_decisions()))
    print(f"created {OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
