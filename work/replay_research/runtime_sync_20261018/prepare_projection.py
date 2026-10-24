"""Prepare the scoped 006 worldbook diff; does not write runtime artifacts."""
from pathlib import Path
import difflib
import json

ROOT = Path(__file__).resolve().parents[3]
STAGE = Path(__file__).resolve().parent
assert not (STAGE/'006_before_consistency_r1.zip').exists(), '006 R1 has been applied; do not overwrite its reviewed projection with the initial seven-entry preparation.'
BASE = ROOT/'output/replay_tavern/capital_entry_20261012_candidate'
WORK = 'work/replay_research/'
GM = 'output/replay_f_review/v1/gm/host_rules.md'

def read(rel): return (ROOT/rel).read_text(encoding='utf-8-sig')
def ref(rel, marker):
    lines=read(rel).splitlines()
    matches=[i+1 for i,s in enumerate(lines) if marker in s]
    assert len(matches)==1,(rel,marker,matches)
    return {'path':rel,'line':matches[0],'locator':marker}

book=json.loads((BASE/'import/901_帝都入口_M1_20261012.json').read_text(encoding='utf-8'))
changes=[]
common=[ref(WORK+'user_clarifications.md','## UCL_20261018_002'),ref(GM,'## 强度定位与遭遇'),ref(GM,'## 未列明能力'),ref(GM,'## 节点、挑战与击杀XP')]

def add(uid, extra, refs, replace_first=False):
    old=book['entries'][str(uid)]; content=old['content']
    if replace_first:
        needle='未给出的资料不补定，也不重置为首次入都。'
        assert content.count(needle)==1
        content=content.replace(needle,'不凭空填补历史真相和既定状态，也不重置为首次入都；普通现场细节与NPC未列能力可按下述原则生成。')
    content+='\n\n'+extra
    changes.append({'uid':uid,'comment':old['comment'],'source_id':old['extensions']['901_replay']['source_id'],'content':content,'source_refs':common+refs,'period':'重玩T0及后续实际分支；主持方法有效，场景按真实条件启用，不初始化未来事件'})

add(79768996,'''剧情向主持：概述、简化裁定与详细规则按场景选用。结果明确且没有重要选择的交锋可概述；有阻力时可按已知实力、手段、准备与处境作合理叙事裁定或少量真实关键检定；战术与资源选择值得展开或玩家要求细打时再详算。重要剧情也可简化战斗，不要求先填完整卡表。重大风险与代价在影响玩家选择前说明；不跳过主角新选择，不伪造骰点或倒改已保留结果，不把叙事结果冒称为程序已保存。

NPC的能力清单不穷尽其能力。可在已定力量来源、种族、训练、专长和实力内补充有实际作用的新招式、法术或辅助技巧，效果与范围、条件、持续和代价相称，无须逐项停团审批。不得编造秘密经历和神器、推翻已有硬限制、临时获得恰好抵消玩家准备的万能反制。重要补充记入本分支，之后一致使用。合理的同条件行动资格也适用于PC，但御临风的主动选择与成长由玩家决定。

怪物强度先参考项目T0—T8阶梯，再用RE怪物特性构筑：T0普通人、T1正规士兵、T2老兵、T3精锐成员、T4精锐副队长、T5精锐队长、T6军中顶尖、T7大陆常规顶尖、T8超规格。它是工作参照而非固定属性或RE评级换算。御临风开场T3，武斗型八柱将常态T7，达卡斯略高但不自动T8；非战斗头衔不保证战力。遭遇另看人数、地形、克制、目标、准备与消耗；不自动跟随玩家升级，弱点和成功准备应实际降低难度。

XP来自实际节点、挑战和有一定难度的怪物击杀；普通有威胁怪物也可给，不要求Boss或完成剧情终点。可当场发或并入节点，简化战斗不减奖；调查、交涉、救援及争取帮助同样有价值。同一贡献不重复计奖，数额由主持明确，节点可0；不新增固定怪物价表，沿现有成长费用与特殊资格。传奇智力红利只在明确节点清算加一次，训练天数不自动产XP。装备、报酬与关系依实际取得。

场景用空间层次、少量感官细节和人物动作建立体验，细节与可探索处相连，不替主角决定感受。关键线索按合理接触交付，不锁死在唯一检定；重复路程与无选择杂战可压缩，日常和关系发展有独立篇幅。重要NPC可长期积累关系，控制同场发言负担。图片、地形卡和道具按需；风格图不当作隐藏证据，缺图正常描述。''',[
    ref(WORK+'empire_military_strength_20261007.md','### T0—T8统一个人战力工作版'),
    ref('work/rules_fusion/901-core-rules-v0.1.md','## 3. 主技能、子技能与成长费用'),
    ref(GM,'## 运作剧情与场景体验')],True)
add(99699950,'''场景主持：初到时按实际位置呈现车马、人流、道路与皇宫／高塔的层次，不预定天气、全城布局或主角感受。普通入城、已授权的重复陈述与路程可概述；证言矛盾应清楚交付，报信、跟随与新增披露由玩家决定。重要NPC可以持续出场，避免同场轮流复述任务；日常、节庆和关系发展不必每轮被新危机打断。''',[
    ref(WORK+'capital_opening_playable_draft.md','## 2026-10-18：'),
    ref(WORK+'capital_event_dependencies.md','## 2026-10-18：')])
add(90242150,'''条件式场景主持：以馆门及眼前实际接触的人呈现查问，不提前宣布救援或释放成功。普通联络、已获准的交接和重复说明可概述；涉及信任、照护、责任与团聚的互动值得保留。邻里普通照护与医者专业手段可合理补充，但不变成全知案情或万能治愈。有效救援、探视、解控协助与安置可构成挑战／节点贡献，无须添加守卫战才给XP；原有查封与人员状态只随真实事件变化。''',[
    ref(WORK+'capital_rescue_playable_draft.md','## 2026-10-18：'),
    ref(WORK+'capital_clinic_release_playable_draft.md','## 2026-10-18：'),
    ref(WORK+'capital_recovery_playable_draft.md','## 2026-10-18：')])
add(264608666,'''场景主持：接待和委托以当前求助、实际可用线索与同行者顾虑展开，不让所有NPC轮流念任务说明。日常调查、跑腿及已授权的重复说明可概述；关键矛盾、信任和风险决定留给互动。会员可沿自身职业、体系与实力补充有效侦察、护卫或其他技巧，不能因此瞬时全知。有效调查、救助与有一定难度的怪物击杀均可给XP，简化战斗同样考虑；接任务不等于完成，任务报酬与XP分别成立。''',[
    ref(WORK+'capital_commission_playable_draft.md','## 2026-10-18：'),
    ref(WORK+'capital_discovery_playable_draft.md','## 2026-10-18：')])
add(182558169,'''条件式场景主持：仅在本分支真的会合、受领信息或进入峡谷后启用相应场景；以下不是现已部署的事实。地图与地形卡按已观察到的峡壁、栈道、遮挡、退路、工事和站位制作，未探处保留未知。侦察可聚焦暴露风险与关键证据，重复巡视和等待可压缩。

实际交战后，大量无重要选择的军队交锋可概述，聚焦玩家真正介入的护送、毁阵、掩护或撤离；关键交锋也可简化，玩家要求细打时再展开。合理新能力不能补回已被破坏的阵势、封死的退路或绕过既定后手条件；跳切不保证救援成功、全员无伤。按实际贡献奖励侦察、减损、有效联络、救援及有难度的怪物击杀，不把NPC独自战果全算给主角，也不忽略玩家争取强援的贡献。战后给会合、失去、认可与关系变化留篇幅，报酬和任命不自动随XP发生。''',[
    ref(WORK+'capital_canyon_briefing_playable_draft.md','## 2026-10-18：'),
    ref(WORK+'capital_canyon_investigation_playable_draft.md','## 2026-10-18：'),
    ref(WORK+'capital_canyon_battle_playable_draft.md','## 2026-10-18：'),
    ref(WORK+'capital_canyon_return_audience_playable_draft.md','## 2026-10-18：')])
add(134756110,'''场景主持：选择当天实际开展的活动，以人群、摊位动作、食物或音乐的少量细节承接人物兴趣；不为热闹替御临风决定参加。普通游逛和简单流程可概述，共同活动与关系变化可以慢下来，娱乐项目不必逐项掷骰，也不须不断插入危机。有意义的挑战或人物节点可给XP，普通闲逛可为0；不把每次消费或聊天变成刷奖。普通表演能力可合理补充，节庆效果不自动赠送永久战斗资源。''',[
    ref(WORK+'capital_festival_playable_draft.md','## 2026-10-18：')])
add(30512113,'''条件式场景主持：在实际接触、诊视与获告后，分别呈现症状、当事人信念和专家已有判断；不因加载资料就让所有人知道机制。专家可在已定体系、实力和实际研究条件内补充诊视、缓解及新解法，不能临时万能治愈。重复照护与无分歧联络可概述，研究可以推进；是否承咒、重大风险、知情与意愿变化保留互动，不跳切为已经自愿或解除成功。有效合作、保护及求治进展可以获得XP，不把自我牺牲、原线神约或某一固定结局设成唯一奖励条件。''',[
    ref(WORK+'capital_yoyo_playable_draft.md','## 2026-10-18：'),
    ref(WORK+'capital_curse_playable_draft.md','## 2026-10-18：')])

(STAGE/'projection_edits.json').write_text(json.dumps({'authorization':'UCL_20261018_002','parent_revision':'M1_IMPORT_20261012_005','changes':changes},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
diff=''.join(''.join(difflib.unified_diff((book['entries'][str(e['uid'])]['content']+'\n').splitlines(True),(e['content']+'\n').splitlines(True),fromfile=f"005/{e['uid']} {e['comment']}",tofile=f"006/{e['uid']} {e['comment']}")) for e in changes)
(STAGE/'proposed.diff').write_text(diff,encoding='utf-8')
print(json.dumps({'changed_entries':len(changes),'new_entries':0,'runtime_written':False}))
