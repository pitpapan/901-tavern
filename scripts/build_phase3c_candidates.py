#!/usr/bin/env python3
"""Build deterministic Phase 3C review candidates from reviewed Worldbook mappings.

This is offline construction tooling. It writes evidence packets before profiles,
never writes a formal profile database, and never approves or applies a patch.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORLD_BOOK = ROOT / "output" / "worldbook_source.jsonl"
INVENTORY = ROOT / "work" / "phase3c_inventory.md"
CURRENT_STATE = ROOT / "current_state.md"
PHASE3B_IDS = {
    "CHARACTER_EMPEROR", "CHARACTER_YOUYOU", "CHARACTER_WHITE_MAGICIAN",
    "CHARACTER_TOLKIEN", "CHARACTER_YU_LINFENG",
}
BATCHES = {
    1: ["CHARACTER_CASSIUS_BRIGHT", "CHARACTER_HAKU", "CHARACTER_YOMI_ISAYAMA", "CHARACTER_ELDER_XUE", "CHARACTER_JIANG_ZIYOU"],
    2: ["CHARACTER_AINZ_OOAL_GOWN", "CHARACTER_XIERLUN_VON_GILCODE", "CHARACTER_OSHUTORU", "CHARACTER_MU_SHAOAI", "CHARACTER_WOSIS"],
    3: ["CHARACTER_DEATHWING", "CHARACTER_KENDA_KAI_FERGUS", "CHARACTER_CASSANDRA", "CHARACTER_JERGAL", "CHARACTER_ZHENZI"],
    4: ["CHARACTER_ELLIE", "CHARACTER_KUON", "CHARACTER_MU_TOU", "CHARACTER_LEI_GUANG", "CHARACTER_HONDA_KAI_FERGUS", "CHARACTER_OSHIRA", "CHARACTER_WURAI", "CHARACTER_LULUTIYE"],
    5: ["CHARACTER_GREMLIN", "CHARACTER_NOSURI", "CHARACTER_LINGCHI", "CHARACTER_WILLIAM", "CHARACTER_JEWEL_ELDER", "CHARACTER_REN_FANZHEN", "CHARACTER_ZHOU_ZHENG", "CHARACTER_SERTANT_LU_YOURLAN"],
}
PATCH_NUMBERS = {worldbook_id: number for number, worldbook_id in enumerate((item for batch in BATCHES.values() for item in batch), 4001)}

PRESENCE = {
    "CHARACTER_AINZ_OOAL_GOWN": ("alive", "normal"),
    "CHARACTER_XIERLUN_VON_GILCODE": ("alive", "inactive"),
    "CHARACTER_HONDA_KAI_FERGUS": ("alive", "inactive"),
    "CHARACTER_SERTANT_LU_YOURLAN": ("alive", "inactive"),
    "CHARACTER_DEATHWING": ("unknown", "restricted"),
    "CHARACTER_JERGAL": ("unknown", "restricted"),
    "CHARACTER_GREMLIN": ("deceased", "historical_only"),
    "CHARACTER_LINGCHI": ("deceased", "historical_only"),
    "CHARACTER_ZHENZI": ("deceased", "historical_only"),
    "CHARACTER_REN_FANZHEN": ("unknown", "special_interlude_only"),
    "CHARACTER_ZHOU_ZHENG": ("unknown", "special_interlude_only"),
}

TRANSITION_IDS = {
    "CHARACTER_AINZ_OOAL_GOWN", "CHARACTER_XIERLUN_VON_GILCODE",
    "CHARACTER_HONDA_KAI_FERGUS", "CHARACTER_SERTANT_LU_YOURLAN",
    "CHARACTER_DEATHWING",
}

RELATIONSHIPS = {
    "CHARACTER_CASSIUS_BRIGHT": ("CHARACTER_YU_LINFENG", "campaign companion", "车队休整时，布莱特与御临风共同轮流守夜。"),
    "CHARACTER_HAKU": ("CHARACTER_KUON", "ward and travelling companion", "失忆后由久远救起、命名并监护，两人一同行动。"),
    "CHARACTER_YOMI_ISAYAMA": ("CHARACTER_YU_LINFENG", "campaign companion", "与御临风等人同行进入帝都线并共同参与战斗。"),
    "CHARACTER_XIERLUN_VON_GILCODE": ("CHARACTER_EMPEROR", "longstanding friend and coordinator", "与帝是多年好友，并在帝国与龙族联合中承担协调作用。"),
    "CHARACTER_ELDER_XUE": ("CHARACTER_YU_LINFENG", "battle protector and elder", "一次山路阻击中，雪老接受御临风的计划并留下替他阻挡追兵。"),
    "CHARACTER_OSHUTORU": ("CHARACTER_HAKU", "commander and subordinate", "赏识哈克的智谋并邀请他成为部下。"),
    "CHARACTER_JIANG_ZIYOU": ("CHARACTER_YU_LINFENG", "campaign companion", "神秘海域梦境中，姜子尤与御临风、布莱特共同应对武装袭击。"),
    "CHARACTER_MU_SHAOAI": ("CHARACTER_YU_LINFENG", "healer and investigator", "在帝前参与悠悠诅咒调查，并支持保住悠悠的处理方向。"),
    "CHARACTER_WOSIS": ("CHARACTER_YU_LINFENG", "imperial examiner and mission authority", "向御临风说明任务并强硬询问其异界人与组织信息。"),
    "CHARACTER_DEATHWING": ("CHARACTER_YU_LINFENG", "battle adversary", "御临风进入其本轮肉身并破坏心脏，使肉身瓦解。"),
    "CHARACTER_KENDA_KAI_FERGUS": ("CHARACTER_HONDA_KAI_FERGUS", "son", "肯达是赤炎龙王本多之子。"),
    "CHARACTER_ZHENZI": ("CHARACTER_YU_LINFENG", "rescuer and enduring deceased relation", "边关陷落时，贞子救下御临风，并以自身为代价换取其生还。"),
    "CHARACTER_KUON": ("CHARACTER_HAKU", "guardian and travelling companion", "久远在雪地救起哈克、为其命名并以监护人身份同行。"),
    "CHARACTER_HONDA_KAI_FERGUS": ("CHARACTER_KENDA_KAI_FERGUS", "father", "本多是肯达之父。"),
    "CHARACTER_LULUTIYE": ("CHARACTER_ELDER_XUE", "granddaughter", "露露缇耶是雪老的孙女，并长期寄居九雪医馆。"),
}

SPECIAL_CONSTRAINTS = {
    "CHARACTER_DEATHWING": "只确认本轮肉身被击败；不得生成永久死亡、不死原理或古神关系为事实。",
    "CHARACTER_GREMLIN": "古雷姆林已被御临风处决并埋葬；不得作为当前存活或可正常行动的敌人。",
    "CHARACTER_LINGCHI": "凌迟已被处斩；达卡斯仅作为其已确认的历史伪装身份，不得写成当前身份。",
    "CHARACTER_ZHENZI": "贞子已故；档案不得暗示复活、当前行动或以无来源名称替代她。",
    "CHARACTER_KENDA_KAI_FERGUS": "调查笔记中的暗杀关联与生死疑问不得升级为事实，也不得从亲属身份推断政治立场。",
    "CHARACTER_CASSANDRA": "严格区分实际行动、角色陈述、调查笔记、未来视界与未确认推断。",
    "CHARACTER_JERGAL": "严格区分客观事件、代行者知识、角色信仰资料、角色推理与未确认宇宙论。",
    "CHARACTER_AINZ_OOAL_GOWN": "其与帝国、龙族及白色魔法使的长期关系未定，不得生成固定联盟或未来立场。",
    "CHARACTER_MU_TOU": "协助白色魔法使逃离监狱塔不等于两者目标或立场相同。",
    "CHARACTER_WOSIS": "审讯与情报行为不得扩写成已确认的私人信念或长期忠诚判断。",
    "CHARACTER_OSHIRA": "不得从黑龙族长身份或一次援助表态推断完整政治立场。",
    "CHARACTER_HONDA_KAI_FERGUS": "不得从赤炎龙王或宴会主持身份自动推断政治立场。",
    "CHARACTER_SERTANT_LU_YOURLAN": "不得从元素龙王身份自动推断政治立场、性格或声线。",
    "CHARACTER_XIERLUN_VON_GILCODE": "不得从冰霜龙王身份或同帝的友谊推断未记录的政治立场。",
    "CHARACTER_REN_FANZHEN": "仅限特殊梦境番外；不得投射为主世界当前人物或生成主世界关系。",
    "CHARACTER_ZHOU_ZHENG": "仅限特殊梦境番外；不得投射为主世界当前人物或生成主世界关系。",
}

EVIDENCE_GAPS = {
    "CHARACTER_DEATHWING": ["永久生死状态未知。", "不死机制及古神关系未确认。", "没有可安全概括的稳定声线或内在目标。"],
    "CHARACTER_JERGAL": ["神格、教会、宇宙职责及死后世界多数来自角色知识或信仰资料。", "没有可直接支持声线、人格或当前目标的客观场景。"],
    "CHARACTER_CASSANDRA": ["预言能力、暗杀参与和真实目的未获客观确认。", "稳定人格、声线和当前立场证据不足。"],
    "CHARACTER_ZHENZI": ["现有资料不足以概括稳定声线与完整人格。", "死亡后的任何行动可能性均无证据。"],
    "CHARACTER_SERTANT_LU_YOURLAN": ["稳定声线、人格、关系立场与目标均证据不足。", "过渡后的具体位置和状况未知。"],
    "CHARACTER_REN_FANZHEN": ["特殊梦境未完成，人物后续状态未知。", "不得从职业背景推断稳定人格。"],
    "CHARACTER_ZHOU_ZHENG": ["特殊梦境未完成，人物后续状态未知。", "身体异常的后续结果与稳定人格均未知。"],
}

# These are deliberately narrow, source-checkable identity statements.  The
# Worldbook supplies the identifier/name/alias mapping only; profile prose is
# constructed from these curated statements plus excerpts read from the actual
# Campaign sources below.
IDENTITY_CLAIMS = {
    "CHARACTER_CASSIUS_BRIGHT": "卡西乌斯·布莱特是失明的猎户与赏金猎人，也是以风感知环境的远距离射手。",
    "CHARACTER_HAKU": "哈克失去记忆后由久远从雪地救起，并接受久远作为监护人一同行动。",
    "CHARACTER_AINZ_OOAL_GOWN": "安兹·乌尔·恭是以骷髅形态活动的不死生物魔法咏唱者。",
    "CHARACTER_YOMI_ISAYAMA": "谏山黄泉是年轻的除灵师与太刀手。",
    "CHARACTER_XIERLUN_VON_GILCODE": "谢尔伦·冯·吉尔科德是龙族六大龙王之一的冰霜龙王，也是年长的上古龙族。",
    "CHARACTER_ELDER_XUE": "雪老曾是帝直属秘密部队兄弟会的成员，后来在边境关卡任职并于峡谷战后解甲归田。",
    "CHARACTER_OSHUTORU": "奥修特尔在团录中向悠悠自报本名，此前以右近之名活动。",
    "CHARACTER_JIANG_ZIYOU": "姜子尤是体魄强悍、以拳法和正面突破作战的近战武斗家。",
    "CHARACTER_MU_SHAOAI": "慕少艾在团录中以白莲色法阵救治黄泉与布莱特。",
    "CHARACTER_WOSIS": "沃西斯是帝国八柱将之一，并受帝委托向御临风一行说明任务。",
    "CHARACTER_DEATHWING": "死亡之翼是龙族秘境战役中的核心敌对巨龙。",
    "CHARACTER_KENDA_KAI_FERGUS": "御临风的龙族调查笔记把肯达·凯·弗格斯记录为赤炎龙王之子与帝国、龙族之间的牵线人。",
    "CHARACTER_CASSANDRA": "白色魔法使相关设定把卡珊德拉列为已诞生的 Phantom。",
    "CHARACTER_JERGAL": "在御临风的自述中，耶各被称为死神，并被他视为诅咒来源与交易对象。",
    "CHARACTER_ZHENZI": "贞子是曾在魔兽山脉活动并救助御临风与雪老的幽魂。",
    "CHARACTER_ELLIE": "艾利是偏向治疗、炼金与魔法支援的帝国法师。",
    "CHARACTER_KUON": "久远是药师，也是从雪地救起哈克并为其命名的同行者。",
    "CHARACTER_REN_FANZHEN": "任帆真是现代灵异特殊梦境中负责研讨会安保的国家特工。",
    "CHARACTER_ZHOU_ZHENG": "周正是现代灵异特殊梦境中负责大杭市的驭鬼者。",
    "CHARACTER_MU_TOU": "沐透是十九岁的异乡魔法使，借助 Wizard 驱动器与指环变身。",
    "CHARACTER_LEI_GUANG": "雷光是帝国八柱将中被称为圣贤的智将。",
    "CHARACTER_HONDA_KAI_FERGUS": "本多·凯·弗格斯是六大龙王之一的赤炎龙王。",
    "CHARACTER_SERTANT_LU_YOURLAN": "瑟坦特·卢·优尔兰是六大龙王之一的元素龙王。",
    "CHARACTER_GREMLIN": "古雷姆林是与白色魔法使一系有关的 Phantom，也是魔法师A的老师。",
    "CHARACTER_NOSURI": "诺斯莉是欧基称作姐姐的人物，并参与了围捕古雷姆林的计划。",
    "CHARACTER_OSHIRA": "奥希拉是黑龙一族的族长，也是悠悠认识的龙族长辈。",
    "CHARACTER_WURAI": "武赖是帝国八柱将之一，并被称为帝国最强之矛。",
    "CHARACTER_LINGCHI": "凌迟曾统一妄想山脉多支魔兽并发动全面侵攻。",
    "CHARACTER_LULUTIYE": "露露缇耶是雪老的孙女，并长期寄居于帝都九雪医馆。",
    "CHARACTER_WILLIAM": "威廉是在帝都施术帮助御临风恢复感情与边关记忆的治疗者。",
    "CHARACTER_JEWEL_ELDER": "宝石翁与慕少艾一同向帝汇报了对悠悠诅咒的调查。",
}

CHARACTER_REFERENCE = "设定 人物/人物卡资料集_叙事检索版.md"

IDENTITY_SOURCE_OVERRIDES = {
    "CHARACTER_AINZ_OOAL_GOWN": {"document": CHARACTER_REFERENCE, "reference": "安兹·乌尔·恭（lines 138-152）"},
    "CHARACTER_OSHUTORU": {"document": "TRPG outputs/extracted-first/21/posts.md", "reference": "右近自报本名奥修特尔（lines 175-177）"},
    "CHARACTER_MU_SHAOAI": {"document": "TRPG outputs/extracted-first/5/posts.md", "reference": "慕少艾以法阵救治黄泉与布莱特（lines 218-237）"},
    "CHARACTER_KENDA_KAI_FERGUS": {"document": "设定 人物/人物卡资料集_检索版.md", "reference": "御临风龙族调查笔记（lines 584-585）"},
    "CHARACTER_WURAI": {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md", "reference": "武赖的八柱将身份与称号（lines 211-241）"},
    "CHARACTER_WOSIS": {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.md", "reference": "沃西斯自报八柱将身份并受命说明任务（lines 9-30）", "excerpt_ranges": [[9, 30]]},
}

# Source-local, atomic historical claims. Evidence packets retain the actual
# excerpt separately; raw excerpts are never copied wholesale into claims.
HISTORY_CLAIMS = {
    "CHARACTER_AINZ_OOAL_GOWN": [
        ("战役收束时，安兹公开宣称赤炎龙王与元素龙王处于其庇护之下。", {"document": "TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md", "reference": "安兹参与战役收束并与白魔对峙（lines 324-410）", "excerpt_ranges": [[371, 383]]}),
        ("D3 状态基线仍未确定安兹之后与帝国、龙族或白魔形成何种长期关系。", {"document": "TRPG outputs/current_state.md", "reference": "白色魔法使、安兹与当前未决关系（lines 77-89）"}),
    ],
    "CHARACTER_CASSANDRA": [
        ("龙族秘境交涉中，卡珊德拉把破万法之符交给御临风。", {"document": "TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md", "reference": "卡珊德拉参与秘境交涉并交出破万法之符（lines 510-590）", "excerpt_ranges": [[557, 579]]}),
        ("死亡之翼本轮肉身被击败后，卡珊德拉与安兹一同来到谢尔伦和御临风面前。", {"document": "TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md", "reference": "战后与安兹一同抵达谢尔伦、御临风处（lines 324-329）"}),
    ],
    "CHARACTER_CASSIUS_BRIGHT": [
        ("布莱特在帝都小巷撞见携带魔物之盒的人后呼救，并守住现场等待夜巡士兵。", {"document": "TRPG outputs/extracted-first/27/posts.md", "reference": "布莱特撞见携盒者并呼救（lines 523-540）"}),
    ],
    "CHARACTER_DEATHWING": [
        ("原团战役中，谢尔伦压制死亡之翼，御临风突入其体内破坏心脏，随后本轮肉身瓦解。", {"document": "TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md", "reference": "谢尔伦压制、御临风突入并瓦解死亡之翼本轮肉身（lines 261-329）", "excerpt_ranges": [[282, 308]]}),
        ("D3 状态基线仍未确认死亡之翼的永久生死、不死原理与古神关系。", {"document": "TRPG outputs/current_state.md", "reference": "死亡之翼当前状态与未决边界（lines 69-75, 95-112）"}),
    ],
    "CHARACTER_GREMLIN": [
        ("古雷姆林在宅邸结界内与御临风交战，艾利则撞破窗户撤出结界准备施法。", {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.md", "reference": "宅邸结界迫使古雷姆林现身并与御临风交战（lines 407-483）"}),
        ("宅邸战中，古雷姆林与御临风近身交战，并在多人反击下继续设法脱身。", {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.md", "reference": "挟持、协力反击及逃脱（lines 290-480）"}),
        ("御临风后来在草原斩首古雷姆林，并将其尸体置入轰出的地穴中掩埋。", {"document": "TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.md", "reference": "格雷姆林异写、御临风处决及埋葬古雷姆林尸体（lines 42-45, 76）"}),
    ],
    "CHARACTER_HONDA_KAI_FERGUS": [
        ("团录末段记录白色魔法使在龙族秘境内压制了本多与元素龙王。", {"document": "TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md", "reference": "本多未按计划离开及被白魔压制（lines 333-386）", "excerpt_ranges": [[359, 383]]}),
        ("过渡基线规定本多与其他需撤离人员在秘境毁灭前完成撤离。", {"document": "TRPG outputs/current_state.md", "reference": "秘境毁灭前后的人员撤离（lines 10-18, 38-43）"}),
    ],
    "CHARACTER_JERGAL": [
        ("慕少艾向御临风说明：经其查证，咒文名为‘耶各’，并把耶各描述为异世界死神；这是角色查证所得的说明。", {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md", "reference": "慕少艾说明耶各咒文、契约性质与查证所得身份（lines 83-91）"}),
    ],
    "CHARACTER_JEWEL_ELDER": [
        ("诅咒转移仪式中，宝石翁完成法阵并参与主持转移。", {"document": "TRPG outputs/extracted-first/28/posts.md", "reference": "宝石翁完成法阵并主持转移仪式（lines 269-377）"}),
    ],
    "CHARACTER_KENDA_KAI_FERGUS": [
        ("御临风的龙族调查笔记把肯达记为帝国与龙族的牵线人；同页的暗杀与生死内容仍是待查判断。", {"document": "设定 人物/人物卡资料集_检索版.md", "reference": "御临风龙族调查笔记记录肯达的亲属与牵线人位置（lines 584-595）"}),
    ],
    "CHARACTER_LEI_GUANG": [
        ("雷光指挥军队向边境关卡推进，并以八柱将圣贤雷公之名下令反攻。", {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.md", "reference": "雷光指挥边境关卡反攻（lines 649-835）"}),
    ],
    "CHARACTER_LINGCHI": [
        ("峡谷收网时，达卡斯的凌迟身份暴露，凌迟承认局势失利并迎战两名八柱将。", {"document": "TRPG outputs/extracted-first/19/posts.md", "reference": "峡谷收网中达卡斯的凌迟身份败露（lines 627-666）"}),
        ("凌迟随后在宫中被公开处斩。", {"document": "TRPG outputs/extracted-first/28/posts.md", "reference": "凌迟在宫中被处斩（lines 392-404）"}),
    ],
    "CHARACTER_LULUTIYE": [
        ("魔物之盒灾后，露露缇耶因心灵创伤接受艾利的记忆处理。", {"document": "TRPG outputs/extracted-first/28/posts.md", "reference": "魔物之盒灾后露露缇耶的创伤与记忆处理（lines 116-127）"}),
    ],
    "CHARACTER_MU_SHAOAI": [
        ("慕少艾参与调查悠悠的诅咒，并在帝前支持保住悠悠的处理方向。", {"document": "TRPG outputs/extracted-first/27/posts.md", "reference": "慕少艾参与诅咒调查并支持救悠悠（lines 156-268）", "excerpt_ranges": [[201, 248]]}),
        ("慕少艾参与了把悠悠诅咒转移给御临风的法阵仪式。", {"document": "TRPG outputs/extracted-first/28/posts.md", "reference": "慕少艾参与诅咒转移法阵（lines 309-362）"}),
        ("慕少艾向御临风解释了名为‘耶各’的咒文与契约性质。", {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md", "reference": "慕少艾说明耶各咒文（lines 83-91）"}),
    ],
    "CHARACTER_MU_TOU": [
        ("设定资料记录沐透协助白色魔法使逃离监狱塔，并从白魔处获得 Wizard 驱动器。", {"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "白色魔法使（lines 123-128）"}),
    ],
    "CHARACTER_NOSURI": [
        ("宅邸战中，诺斯莉以弓箭参与围攻古雷姆林，并在其逃离时继续追击。", {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.md", "reference": "宅邸战援助、反击与追击（lines 381-487）"}),
    ],
    "CHARACTER_OSHUTORU": [
        ("以右近之名活动时，他是帝国八柱将所属的右近卫大将。", {"document": "TRPG outputs/extracted-first/6/posts.md", "reference": "右近卫大将右近介入达卡斯出征安排（lines 452-466）"}),
        ("右近后来向悠悠自报本名为奥修特尔。", {"document": "TRPG outputs/extracted-first/21/posts.md", "reference": "右近自报本名奥修特尔、朝见时以奥修特尔署名（lines 175-177, 602-606）"}),
    ],
    "CHARACTER_SERTANT_LU_YOURLAN": [
        ("元素龙王因要事缺席龙族宴会，宴会记录称其会尽快返回。", {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.md", "reference": "六大龙王与元素龙王缺席宴会（lines 789-819）"}),
        ("团录末段记录元素龙王在秘境内失去意识并被白色魔法使的结界束缚。", {"document": "TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md", "reference": "元素龙王在秘境内被白魔束缚（lines 333-386）", "excerpt_ranges": [[359, 383]]}),
        ("过渡基线规定元素龙王与其他需撤离人员在秘境毁灭前完成撤离。", {"document": "TRPG outputs/current_state.md", "reference": "秘境毁灭前后的人员撤离（lines 10-18, 38-43）"}),
    ],
    "CHARACTER_WILLIAM": [
        ("威廉参与了把悠悠诅咒转移给御临风的法阵仪式。", {"document": "TRPG outputs/extracted-first/28/posts.md", "reference": "威廉参与诅咒转移法阵（lines 266-377）"}),
        ("御临风在帝都曾前往威廉经营的酒屋停留。", {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md", "reference": "威廉的酒屋及其与御临风的持续接触（lines 93-134, 419-448）"}),
    ],
    "CHARACTER_WURAI": [
        ("法师塔事件后，现场记录把造成火柱的攻击归于武赖，并称其为八柱将。", {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md", "reference": "八柱将身份及火柱造成的伤亡统计困难（lines 211-241）"}),
    ],
    "CHARACTER_XIERLUN_VON_GILCODE": [
        ("原团战役中，谢尔伦压制死亡之翼并掩护御临风突入其体内；战后由谢尔伦宣布两人完成讨伐。", {"document": "TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md", "reference": "谢尔伦压制并与御临风击败死亡之翼（lines 282-311）", "excerpt_ranges": [[282, 311]]}),
    ],
    "CHARACTER_ZHENZI": [
        ("边关陷落时，贞子救下御临风，并在黄祸龙狼追击下身受重伤。", {"document": "TRPG outputs/extracted-first/22/posts.md", "reference": "御临风恢复边关记忆、贞子救援与以自身换取其生还（lines 438-470）"}),
        ("恢复记忆后，御临风明确说贞子已经为救他而死。", {"document": "TRPG outputs/extracted-first/24/posts.md", "reference": "御临风向悠悠确认贞子已为救他而死（lines 219-227）"}),
    ],
}

# Explicit character-reference statements may populate RP fields.  Campaign
# actions remain observed_only and never become universal behavior.
EXTRA_CLAIMS = {
    "CHARACTER_CASSIUS_BRIGHT": [
        ("core_personality", "PATIENCE", "人物资料明确把他描述为耐心、寡言。", {"document": CHARACTER_REFERENCE, "reference": "卡西乌斯·布莱特（lines 112-134）"}, "explicit_source_statement", "stable", "人物资料的直接定位。"),
        ("speech_style", "TERSE", "其表达应保持寡言，不以持续宣告技能替代行动。", {"document": CHARACTER_REFERENCE, "reference": "卡西乌斯·布莱特（lines 112-134）"}, "explicit_source_statement", "conditional", "有明确人物资料，但跨场景逐字语料有限。"),
    ],
    "CHARACTER_HAKU": [
        ("core_personality", "DEMEANOR", "哈克常表现得吊儿郎当并厌恶麻烦，但能够分辨轻重缓急。", {"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "哈克（lines 90-97）"}, "explicit_source_statement", "stable", "设定集对其惯常表现的直接陈述。"),
        ("decision_patterns", "PROBLEM_SOLVING", "即使态度消极，哈克仍会设法解决已经面对的问题。", {"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "哈克（lines 90-97）"}, "explicit_source_statement", "conditional", "不能扩写成所有场景都主动承担责任。"),
    ],
    "CHARACTER_YOMI_ISAYAMA": [
        ("core_personality", "COMPOSURE", "人物资料把谏山黄泉描述为冷静、坚忍。", {"document": CHARACTER_REFERENCE, "reference": "谏山黄泉（lines 64-85）"}, "explicit_source_statement", "stable", "仅采用 Campaign 人物资料，不引入作品外经历。"),
    ],
    "CHARACTER_XIERLUN_VON_GILCODE": [
        ("core_personality", "MANNER", "设定集把谢尔伦描述为温文尔雅，并具有绅士与贵族风范。", {"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "谢尔伦·冯·吉尔科德（lines 148-153）"}, "explicit_source_statement", "stable", "风范不等于具体政治立场。"),
    ],
    "CHARACTER_OSHUTORU": [
        ("core_personality", "DUTY", "人物资料把奥修特尔描述为清廉正直、责任心极强。", {"document": CHARACTER_REFERENCE, "reference": "奥修特尔（lines 154-160）"}, "explicit_source_statement", "stable", "不据此推断未记录的政治判断。"),
    ],
    "CHARACTER_JIANG_ZIYOU": [
        ("core_personality", "TRAITS", "人物资料以贪婪、武痴、赤子概括姜子尤，并记录他对更强武艺与对手的直率兴趣。", {"document": CHARACTER_REFERENCE, "reference": "姜子尤（lines 23-34）"}, "explicit_source_statement", "stable", "不把喜剧叙事评价写入人格。"),
        ("decision_patterns", "DIRECT_FORCE", "面对危险时，姜子尤容易先以拳脚打开局面。", {"document": CHARACTER_REFERENCE, "reference": "姜子尤（lines 23-34）"}, "explicit_source_statement", "conditional", "人物资料中的倾向，不是强制每次采取暴力。"),
    ],
    "CHARACTER_MU_TOU": [
        ("values", "HOPE", "人物资料把成为他人的希望记为沐透的行动方向。", {"document": CHARACTER_REFERENCE, "reference": "沐透（lines 87-110）"}, "explicit_source_statement", "conditional", "行动方向不等同于对所有事件的内在动机解释。"),
        ("speech_style", "MODERN_REGISTER", "沐透使用较现代、常带轻松与吐槽感的口吻。", {"document": CHARACTER_REFERENCE, "reference": "沐透（lines 87-110）"}, "explicit_source_statement", "conditional", "严肃场景不要求持续玩笑。"),
    ],
    "CHARACTER_ELLIE": [
        ("core_personality", "CARE", "人物资料把艾利描述为可靠而细心。", {"document": CHARACTER_REFERENCE, "reference": "艾利（lines 199-214）"}, "explicit_source_statement", "stable", "该评价用于人物档案，不回写为 Worldbook 客观事实。"),
    ],
    "CHARACTER_AINZ_OOAL_GOWN": [
        ("decision_patterns", "SANCTUARY_INTERVENTION", "在御临风提出请求后，安兹实际转移并收治龙族伤员、牵制死亡之翼。", {"document": "TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md", "reference": "lines 59-223", "excerpt_ranges": [[181, 216]]}, "single_observed_behavior", "observed_only", "只限龙族秘境干预，不推出长期联盟。"),
    ],
    "CHARACTER_MU_SHAOAI": [
        ("decision_patterns", "CURSE_INQUIRY", "在悠悠诅咒调查中，慕少艾参与核验并支持保住悠悠的处理方向。", {"document": "TRPG outputs/extracted-first/27/posts.md", "reference": "lines 156-268", "excerpt_ranges": [[201, 248]]}, "single_observed_behavior", "observed_only", "一次复杂事件中的实际行动。"),
    ],
    "CHARACTER_WOSIS": [
        ("decision_patterns", "INTERROGATION", "在龙族秘境任务说明中，沃西斯以强硬询问刺探御临风的异界人身份与组织关系。", {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.md", "reference": "沃西斯逼问异界身份与组织（lines 94-119, 173-199）", "excerpt_ranges": [[94, 119], [173, 199]]}, "single_observed_behavior", "observed_only", "不得泛化为所有交涉都采用审讯。"),
    ],
    "CHARACTER_KENDA_KAI_FERGUS": [
        ("decision_patterns", "BANQUET_CONTACT", "龙族宴会期间，肯达迟到入场后向悠悠和御临风自报姓名并建立直接接触。", {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.md", "reference": "lines 852-975"}, "single_observed_behavior", "observed_only", "宴会中的单次行动不构成稳定社交风格。"),
    ],
    "CHARACTER_CASSANDRA": [
        ("decision_patterns", "RUNE_TRANSFER", "在龙族秘境交涉中，卡珊德拉把破万法之符交给御临风。", {"document": "TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md", "reference": "lines 510-590", "excerpt_ranges": [[557, 579]]}, "single_observed_behavior", "observed_only", "物品交付不证明真实目的或长期立场。"),
    ],
    "CHARACTER_ZHENZI": [
        ("decision_patterns", "SACRIFICE", "边关陷落时，贞子以自己的全部作为代价换取御临风生还。", {"document": "TRPG outputs/extracted-first/22/posts.md", "reference": "lines 438-470"}, "single_observed_behavior", "observed_only", "历史牺牲不授权死亡后的行动或复活。"),
    ],
}

RELATIONSHIP_SOURCES = {
    "CHARACTER_CASSIUS_BRIGHT": {"document": "TRPG outputs/extracted-first/1/posts.md", "reference": "lines 293-297"},
    "CHARACTER_HAKU": {"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "哈克（lines 90-97）"},
    "CHARACTER_YOMI_ISAYAMA": {"document": "TRPG outputs/extracted-first/2/posts.md", "reference": "lines 219-233"},
    "CHARACTER_XIERLUN_VON_GILCODE": {"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "谢尔伦·冯·吉尔科德（lines 148-153）"},
    "CHARACTER_ELDER_XUE": {"document": "TRPG outputs/extracted-first/18/posts.md", "reference": "lines 162-198"},
    "CHARACTER_OSHUTORU": {"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "哈克（lines 90-97）"},
    "CHARACTER_JIANG_ZIYOU": {"document": "TRPG outputs/extracted-first/11/posts.md", "reference": "lines 63-102"},
    "CHARACTER_MU_SHAOAI": {"document": "TRPG outputs/extracted-first/27/posts.md", "reference": "lines 156-268", "excerpt_ranges": [[201, 248]]},
    "CHARACTER_WOSIS": {"document": "TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.md", "reference": "沃西斯逼问异界身份与组织（lines 94-119, 173-199）", "excerpt_ranges": [[94, 119], [173, 199]]},
    "CHARACTER_DEATHWING": {"document": "TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md", "reference": "lines 261-329", "excerpt_ranges": [[287, 318]]},
    "CHARACTER_KENDA_KAI_FERGUS": {"document": "设定 人物/人物卡资料集_检索版.md", "reference": "lines 584-595"},
    "CHARACTER_ZHENZI": {"document": "TRPG outputs/extracted-first/22/posts.md", "reference": "lines 438-470"},
    "CHARACTER_KUON": {"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "久远（lines 101-108）"},
    "CHARACTER_HONDA_KAI_FERGUS": {"document": "设定 人物/人物卡资料集_检索版.md", "reference": "lines 584-595"},
    "CHARACTER_LULUTIYE": {"document": "设定 人物/妄想大陆设定集_检索版.md", "reference": "雪老（lines 81-86）"},
}


def load_worldbook() -> dict[str, dict]:
    entries = {}
    for line in WORLD_BOOK.read_text(encoding="utf-8").splitlines():
        if line.strip():
            entry = json.loads(line)
            if entry.get("type") == "character":
                entries[entry["id"]] = entry
    return entries


def inventory_metadata() -> dict[str, dict[str, str]]:
    result = {}
    for line in INVENTORY.read_text(encoding="utf-8").splitlines():
        if not line.startswith("|") or line.startswith("|---") or "worldbook_id" in line:
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) == 9:
            result[cells[0]] = {
                "life_status": cells[2], "availability": cells[3], "depth": cells[4],
                "activation": cells[5], "disposition": cells[7], "reason": cells[8],
            }
    return result


def source_ref(source: dict) -> str:
    document = source["document"]
    if document.startswith("TRPG outputs/"):
        document = document.removeprefix("TRPG outputs/")
    return f"{document}:{source['reference']}"


def source_path(source: dict) -> Path:
    document = source["document"].replace("/", str(Path('/')))
    if document.startswith("TRPG outputs" + str(Path('/'))):
        return ROOT / document.split(str(Path('/')), 1)[1]
    if document == "TRPG outputs/current_state.md":
        return ROOT / "current_state.md"
    if document.startswith("设定 人物" + str(Path('/'))) or document.startswith("战报" + str(Path('/'))):
        return ROOT.parent / document
    return ROOT / document


def source_origin(entry: dict, source: dict) -> str:
    if entry["canon_layer"] == "special_interlude":
        return "special_interlude"
    if source["document"] == CHARACTER_REFERENCE:
        return "authorial_supplement"
    if source["document"].endswith("current_state.md"):
        return "transition"
    return "original_campaign"


def current_state_matches(entry: dict) -> list[str]:
    """Read the D3 anchor and return exact name/alias matches without inference."""
    lines = CURRENT_STATE.read_text(encoding="utf-8-sig").splitlines()
    names = [entry["name"], *entry.get("aliases", [])]
    matches = []
    for index, line in enumerate(lines, 1):
        if any(name and name in line for name in names):
            matches.append(f"line {index}: {clean_excerpt(line, limit=260)}")
    return matches[:8]


def clean_excerpt(text: str, limit: int = 650) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def extract_source_excerpt(entry: dict, source: dict) -> str:
    """Read the cited Campaign source and return a deterministic local excerpt."""
    path = source_path(source)
    if not path.is_file():
        raise FileNotFoundError(f"{entry['id']} source file missing: {path}")
    text = path.read_text(encoding="utf-8-sig")
    lines = text.splitlines()
    reference = source["reference"]

    if source.get("excerpt_ranges"):
        selected = []
        for start, end in source["excerpt_ranges"]:
            selected.extend(lines[max(0, start - 1) : min(end, len(lines))])
        excerpt = clean_excerpt(" ".join(selected), limit=1200)
        if excerpt:
            return excerpt

    range_match = re.search(r"lines?\s*(\d+)(?:\s*[-–]\s*(\d+))?", reference, re.IGNORECASE)
    if range_match:
        start = max(1, int(range_match.group(1)))
        end = int(range_match.group(2) or start)
        selected = lines[start - 1 : min(end, len(lines))]
        names = [entry["name"], *entry.get("aliases", [])]
        name_lines = [line for line in selected if any(name and name in line for name in names)]
        is_named_character_section = source["document"] == CHARACTER_REFERENCE and any(name and name in reference for name in names)
        excerpt_lines = selected if len(selected) <= 20 else (selected[:12] if is_named_character_section else (name_lines[:8] if name_lines else selected[:8]))
        excerpt = clean_excerpt(" ".join(excerpt_lines), limit=1200)
        if excerpt:
            return excerpt

    token_match = re.search(r"\b((?:C|S|SC|T)\d{3})\b", reference)
    if token_match:
        token = token_match.group(1)
        for line in lines:
            if re.search(rf"\|\s*{re.escape(token)}\s*\|", line):
                return clean_excerpt(line)

    heading = re.sub(r"（.*?）", "", reference).split("：", 1)[-1].strip()
    candidates = [heading, entry["name"], *entry.get("aliases", [])]
    for candidate in candidates:
        if not candidate:
            continue
        marker = f"## {candidate}"
        for index, line in enumerate(lines):
            if line.strip() == marker:
                section = []
                for child in lines[index : min(index + 18, len(lines))]:
                    if child.startswith("## ") and child.strip() != marker:
                        break
                    if child.strip():
                        section.append(child)
                excerpt = clean_excerpt(" ".join(section))
                if excerpt:
                    return excerpt

    for candidate in candidates:
        if candidate:
            for index, line in enumerate(lines):
                if candidate in line:
                    return clean_excerpt(" ".join(lines[max(0, index - 1) : min(len(lines), index + 3)]))
    raise ValueError(f"{entry['id']}: cannot resolve evidence excerpt for {source_ref(source)}")


def claim(
    claim_id: str,
    text: str,
    sources: list[str],
    origin: str,
    *,
    evidence_mode: str = "explicit_source_statement",
    stability: str = "stable",
    context: str = "",
    exceptions: list[str] | None = None,
) -> dict:
    return {
        "claim_id": claim_id,
        "claim": text,
        "evidence_mode": evidence_mode,
        "origin": origin,
        "stability": stability,
        "context": context,
        "exceptions": exceptions or [],
        "sources": sources,
        "notes": "仅保留来源直接支持的范围。",
    }


def evidence_record(
    entry: dict,
    *,
    record_id: str,
    section: str,
    target: str,
    statement: str,
    source: dict,
    evidence_mode: str,
    stability: str,
    limitation: str,
) -> dict:
    if source["document"] == CHARACTER_REFERENCE and evidence_mode == "explicit_source_statement":
        evidence_mode = "authorial_definition"
    return {
        "record_id": record_id,
        "section": section,
        "target": target,
        "statement": statement,
        "source": source,
        "source_ref": source_ref(source),
        "excerpt": extract_source_excerpt(entry, source),
        "evidence_mode": evidence_mode,
        "stability": stability,
        "origin": source_origin(entry, source),
        "limitation": limitation,
    }


def collect_evidence_records(entry: dict) -> list[dict]:
    worldbook_id = entry["id"]
    suffix = worldbook_id.removeprefix("CHARACTER_")
    identity_source = IDENTITY_SOURCE_OVERRIDES.get(worldbook_id, entry["sources"][0])
    records = [evidence_record(
        entry,
        record_id=f"CLAIM_{suffix}_IDENTITY",
        section="Identity Evidence",
        target="identity.public_identity",
        statement=IDENTITY_CLAIMS[worldbook_id],
        source=identity_source,
        evidence_mode="explicit_source_statement",
        stability="stable",
        limitation="Only the Campaign-specific identity is retained; outside-franchise completion is excluded.",
    )]

    for index, (statement, source) in enumerate(HISTORY_CLAIMS.get(worldbook_id, []), 1):
        records.append(evidence_record(
            entry,
            record_id=f"CLAIM_{suffix}_HISTORY_{index}",
            section="Identity Evidence",
            target="identity.established_history",
            statement=statement,
            source=source,
            evidence_mode="explicit_source_statement",
            stability="stable",
            limitation="Atomic historical fact only; it does not establish a future behavior, motive, or allegiance.",
        ))

    for field, label, statement, source, mode, stability, limitation in EXTRA_CLAIMS.get(worldbook_id, []):
        section = {
            "core_personality": "Personality Evidence",
            "values": "Values Evidence",
            "speech_style": "Speech Evidence",
            "decision_patterns": "Decision Evidence",
        }[field]
        records.append(evidence_record(
            entry,
            record_id=f"CLAIM_{suffix}_{label}",
            section=section,
            target=field,
            statement=statement,
            source=source,
            evidence_mode=mode,
            stability=stability,
            limitation=limitation,
        ))

    if worldbook_id in RELATIONSHIPS:
        source = RELATIONSHIP_SOURCES[worldbook_id]
        records.append(evidence_record(
            entry,
            record_id=f"CLAIM_{suffix}_RELATIONSHIP",
            section="Relationship Evidence",
            target="relationships.established_history",
            statement=RELATIONSHIPS[worldbook_id][2],
            source=source,
            evidence_mode="explicit_source_statement",
            stability="stable",
            limitation="Established relationship history only; no current emotion, loyalty, or future obligation is inferred.",
        ))
    return records


def render_record(record: dict) -> list[str]:
    source = record["source"]
    return [
        f"### Candidate statement {record['record_id']}",
        "",
        f"- Source: `{source['document']}`",
        f"- Source location: `{source['reference']}`",
        f"- Evidence excerpt: {record['excerpt']}",
        f"- Candidate statement: {record['statement']}",
        f"- Candidate target field: `{record['target']}`",
        f"- Evidence mode: `{record['evidence_mode']}`",
        f"- Stability: `{record['stability']}`",
        f"- Confidence / limitation: {record['limitation']}",
        f"- Canon layer: `{record['origin']}`",
        "",
    ]


def build_evidence(entry: dict, meta: dict[str, str]) -> str:
    records = collect_evidence_records(entry)
    state_matches = current_state_matches(entry)
    gap_items = EVIDENCE_GAPS.get(entry["id"], [
        "稳定人格、价值排序与跨情境声线证据不足。",
        "current_state.md 未给出其 D3 精确位置、即时议程或当前目标。",
    ])
    contradictions = SPECIAL_CONSTRAINTS.get(entry["id"], "No irreconcilable factual contradiction was found; absent current-state detail remains unknown rather than inferred.")
    lines = [f"# NPC_{entry['id'].removeprefix('CHARACTER_')} Evidence Packet", "", "Status: evidence collection only; this packet is not Canon approval.", ""]
    sections = [
        "Identity Evidence", "Personality Evidence", "Values Evidence", "Speech Evidence",
        "Decision Evidence", "Relationship Evidence", "Knowledge Evidence", "Goal Evidence",
        "Dynamic State Evidence", "Presence Evidence", "Contradictions / Ambiguities", "Evidence Gaps",
    ]
    for section in sections:
        lines.extend([f"## {section}", ""])
        matching = [record for record in records if record["section"] == section]
        for record in matching:
            lines.extend(render_record(record))
        if matching:
            continue
        if section == "Knowledge Evidence" and entry["id"] == "CHARACTER_WOSIS":
            source = RELATIONSHIP_SOURCES[entry["id"]]
            record = evidence_record(
                entry, record_id="KNOWLEDGE_WOSIS_OTHERWORLDER_SUSPICION", section=section,
                target="epistemic_state", statement="沃西斯在审讯时把御临风的异界人身份与组织关系视为需要核查的对象。",
                source=source, evidence_mode="single_observed_behavior", stability="observed_only",
                limitation="This is character-scoped suspicion at the interrogation, not confirmed world truth.",
            )
            lines.extend(render_record(record))
        elif section == "Dynamic State Evidence":
            lines.extend([f"- Reviewed structural state: `life_status={meta['life_status']}`, `narrative_availability={meta['availability']}`.", "- `current_state.md` was opened and checked as the D3 anchor."])
            if state_matches:
                lines.extend(["- Exact candidate-name/alias matches:", *(f"  - {item}" for item in state_matches)])
            else:
                lines.append("- No exact candidate name or confirmed alias occurs in `current_state.md`; exact D3 location and agenda remain unknown.")
            lines.append("")
        elif section == "Presence Evidence":
            lines.extend(["- Presence is a conservative review classification, not a claim inferred from silence.", "- Profile depth does not authorize scene presence.", ""])
        elif section == "Contradictions / Ambiguities":
            lines.extend([f"- {contradictions}", ""])
        elif section == "Evidence Gaps":
            lines.extend([*(f"- {item}" for item in gap_items), ""])
        else:
            lines.extend(["No source-backed candidate statement is entered for this section.", ""])
    lines.extend(["### Source files actually opened by the builder", ""])
    opened = sorted({record["source_ref"] for record in records})
    opened.append("current_state.md:D3 state check")
    if entry["id"] == "CHARACTER_WOSIS":
        opened.append(source_ref(RELATIONSHIP_SOURCES[entry["id"]]))
    lines.extend(f"- `{ref}`" for ref in sorted(set(opened)))
    return "\n".join(lines) + "\n"


def build_profile(entry: dict, meta: dict[str, str]) -> dict:
    suffix = entry["id"].removeprefix("CHARACTER_")
    profile_id = f"NPC_{suffix}"
    records = collect_evidence_records(entry)
    claim_records = [record for record in records if record["record_id"].startswith("CLAIM_")]
    layers = [entry["canon_layer"]]
    provenance_origins = [entry["canon_layer"]]
    for record in claim_records:
        if record["origin"] not in provenance_origins:
            provenance_origins.append(record["origin"])
        if record["origin"] != "authorial_supplement" and record["origin"] not in layers:
            layers.append(record["origin"])
    claim_origin = "special_interlude" if entry["canon_layer"] == "special_interlude" else "original_campaign"
    life_status, availability = PRESENCE.get(entry["id"], (meta["life_status"], meta["availability"]))
    def profile_claim(record: dict) -> dict:
        return claim(
            record["record_id"], record["statement"], [record["source_ref"]], record["origin"],
            evidence_mode=record["evidence_mode"], stability=record["stability"],
            context=record["limitation"],
            exceptions=["不得超出所引来源的时点与语境。"],
        )

    public_identity = [profile_claim(record) for record in records if record["target"] == "identity.public_identity"]
    history = [profile_claim(record) for record in records if record["target"] == "identity.established_history"]
    field_claims = {
        field: [profile_claim(record) for record in records if record["target"] == field]
        for field in ("core_personality", "values", "speech_style", "decision_patterns")
    }
    relationships = []
    if entry["id"] in RELATIONSHIPS:
        subject_ref, relationship_type, relationship_claim = RELATIONSHIPS[entry["id"]]
        record = next(record for record in records if record["target"] == "relationships.established_history")
        relationships.append({
            "relationship_id": f"RELATIONSHIP_{suffix}_{subject_ref.removeprefix('CHARACTER_')}",
            "subject_ref": subject_ref,
            "relationship_type": relationship_type,
            "established_history": [profile_claim(record)],
            "current_stance": [], "obligations": [], "tensions": [],
            "known_shared_experiences": [], "visibility": "public",
            "sources": [record["source_ref"]],
            "notes": "关系历史不自动构成当前情感、忠诚或未来义务。",
        })
    epistemic_state = []
    if entry["id"] == "CHARACTER_WOSIS":
        source = RELATIONSHIP_SOURCES[entry["id"]]
        epistemic_state.append({
            "knowledge_id": "KNOWLEDGE_WOSIS_OTHERWORLDER_SUSPICION",
            "subject_ref": "CHARACTER_YU_LINFENG",
            "statement": "沃西斯在审讯时把御临风的异界人身份与组织关系视为需要核查的对象。",
            "epistemic_type": "suspects",
            "assertion_scope": "character_cognition",
            "acquired_context": "龙族秘境任务说明后的身份逼问。",
            "visibility": "restricted",
            "sources": [source_ref(source)],
            "notes": "只表示审讯时的角色怀疑，不是确认世界事实。",
        })
    current_conditions = ["deceased"] if life_status == "deceased" else []
    gaps = EVIDENCE_GAPS.get(entry["id"], [
        "稳定人格、价值排序与跨情境声线证据不足。",
        "D3 精确位置、即时议程与当前目标未知。",
    ])
    constraint = SPECIAL_CONSTRAINTS.get(entry["id"], "不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。")
    return {
        "id": profile_id,
        "profile_kind": "npc",
        "worldbook_id": entry["id"],
        "name": entry["name"],
        "aliases": entry.get("aliases", []),
        "profile_depth": meta["depth"],
        "activation_policy": meta["activation"],
        "knowledge_partition": True,
        "canon_layers": layers,
        "control_mode": "npc_runtime",
        "ai_permissions": {
            "may_generate_dialogue": True, "may_choose_voluntary_actions": True,
            "may_generate_private_thoughts": True, "may_assign_new_goals": False,
            "may_describe_external_effects": True, "may_describe_involuntary_physical_reactions": True,
            "may_summarize_user_declared_actions": False, "may_reference_established_history": True,
        },
        "identity": {"public_identity": public_identity, "durable_roles": [], "established_history": history},
        "core_personality": field_claims["core_personality"],
        "values": field_claims["values"],
        "speech_style": field_claims["speech_style"],
        "decision_patterns": field_claims["decision_patterns"],
        "relationships": relationships,
        "epistemic_state": epistemic_state,
        "goals": {"public_goals": [], "private_goals": [], "current_goals": [], "long_term_goals": []},
        "dynamic_state": {
            "as_of": "current_state.md D3 baseline",
            "current_conditions": current_conditions,
            "current_obligations": [], "current_location_ref": "", "current_faction_role": "",
            "current_concerns": [],
            "sources": ["current_state.md:D3 state check"],
            "notes": "Only explicitly anchored present-state details may be added after human review.",
        },
        "presence": {
            "life_status": life_status, "narrative_availability": availability,
            "realm_scope": ["special_interlude"] if entry["canon_layer"] == "special_interlude" else layers,
            "sources": [source_ref(next((source for source in entry["sources"] if source["document"].endswith("current_state.md")), entry["sources"][-1] if life_status == "deceased" else entry["sources"][0]))],
            "notes": "Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative.",
        },
        "rp_constraints": [{
            "constraint_id": f"CONSTRAINT_{suffix}_EVIDENCE_BOUNDARY",
            "constraint": constraint,
            "origin": claim_origin,
            "sources": [f"work/phase3c/evidence/{profile_id}_evidence.md"],
            "notes": "Construction safety boundary; not a new world fact.",
        }],
        "provenance": {
            "canon_origin": provenance_origins,
            "source_origin_ids": [f"output/worldbook_source.jsonl#{entry['id']}", f"work/phase3c/evidence/{profile_id}_evidence.md"],
        },
        "evidence_gaps": gaps,
        "notes": "Phase 3C READY_FOR_HUMAN_REVIEW candidate. Sparse fields are intentional and must not be fictionalized.",
    }


def build_patch(profile: dict, patch_number: int) -> dict:
    profile_ref = f"work/phase3c/profiles/{profile['id']}.json"
    evidence_ref = f"work/phase3c/evidence/{profile['id']}_evidence.md"
    return {
        "patch_id": f"PATCH_{patch_number}",
        "created_from": [evidence_ref, profile_ref],
        "target_database": "npc_profiles",
        "operation": "add",
        "target_id": profile["id"],
        "reason": "Propose an evidence-backed Phase 3C NPC profile for later human review without creating a formal profile database.",
        "proposed_changes": {"before": None, "after": {"profile_ref": profile_ref, "profile_id": profile["id"]}},
        "affected_entries": [profile["id"], profile["worldbook_id"]],
        "conflict_check": {"status": "not_checked", "items": []},
        "status": "draft",
        "review_notes": "Candidate only; not approved or applied. Evidence gaps and presence restrictions remain binding.",
    }


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def write_batch(batch_number: int, stage: str) -> None:
    entries = load_worldbook()
    metadata = inventory_metadata()
    batch_ids = BATCHES[batch_number]
    for worldbook_id in batch_ids:
        entry = entries[worldbook_id]
        meta = metadata[worldbook_id]
        profile_id = f"NPC_{worldbook_id.removeprefix('CHARACTER_')}"
        evidence_path = ROOT / "work" / "phase3c" / "evidence" / f"{profile_id}_evidence.md"
        if stage in {"evidence", "all"}:
            evidence_path.parent.mkdir(parents=True, exist_ok=True)
            evidence_path.write_text(build_evidence(entry, meta), encoding="utf-8", newline="\n")
        if stage in {"profiles", "all"}:
            if not evidence_path.is_file():
                raise FileNotFoundError(f"evidence packet must exist before profile: {evidence_path}")
            profile = build_profile(entry, meta)
            write_json(ROOT / "work" / "phase3c" / "profiles" / f"{profile_id}.json", profile)
            patch_number = PATCH_NUMBERS[worldbook_id]
            patch_name = f"PATCH_{patch_number}_{profile_id.lower()}.json"
            write_json(ROOT / "work" / "patches" / "pending" / patch_name, build_patch(profile, patch_number))
    write_json(ROOT / "work" / "phase3c" / "batches" / f"batch_{batch_number:02d}_manifest.json", {
        "batch": batch_number,
        "stage": stage,
        "worldbook_ids": batch_ids,
        "profile_ids": [f"NPC_{item.removeprefix('CHARACTER_')}" for item in batch_ids],
        "status": "READY_FOR_VALIDATION" if stage in {"profiles", "all"} else "EVIDENCE_READY",
    })


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--batch", type=int, choices=sorted(BATCHES), required=True)
    parser.add_argument("--stage", choices=["evidence", "profiles", "all"], required=True)
    args = parser.parse_args()
    write_batch(args.batch, args.stage)
    print(f"Phase 3C batch {args.batch:02d} stage {args.stage}: complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
