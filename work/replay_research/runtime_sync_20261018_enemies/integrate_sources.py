"""One-shot 007 author adoption: prepare a diff, then apply the inspected changes."""
from pathlib import Path
import difflib
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[3]
STAGE = Path(__file__).resolve().parent
W = 'work/replay_research/'
GM = 'output/replay_f_review/v1/gm/'
def read(rel): return (ROOT / rel).read_text(encoding='utf-8-sig')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p, value): p.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

if '--apply' in sys.argv:
    updates = json.loads((STAGE/'source_updates.json').read_text(encoding='utf-8'))
    for item in updates:
        assert sha(ROOT/item['path']) == item['before_sha256'], item['path']
    for item in updates:
        (ROOT/item['path']).write_text(item['after'], encoding='utf-8')
    save(STAGE/'source_inventory.json', {'authorization':'UCL_20261018_006', 'updated_sources':[x['path'] for x in updates], 'source_sha256':{x['path']:sha(ROOT/x['path']) for x in updates}})
    print(json.dumps({'applied_sources':len(updates)}))
    raise SystemExit

assert not (STAGE/'source_updates.json').exists(), 'Already prepared; inspect stored diff, do not reset.'
updates = {}
def set_text(rel, value):
    if rel not in updates:
        updates[rel] = {'path':rel, 'before_sha256':sha(ROOT/rel), 'before':read(rel)}
    updates[rel]['after'] = value
def replace(rel, old, new):
    s = updates.get(rel, {}).get('after', read(rel))
    assert s.count(old) == 1, (rel, old[:90], s.count(old))
    set_text(rel, s.replace(old, new))
def append(rel, value):
    set_text(rel, updates.get(rel, {}).get('after', read(rel)).rstrip()+'\n\n'+value.strip()+'\n')

protected_paths = {x['path'] for x in json.loads((ROOT/(W+'runtime_sync_20261018/protected_before.json')).read_text(encoding='utf-8'))}
base = ROOT/'output/replay_tavern/story_guidance_20261018_candidate'
protected_paths.update(p.relative_to(ROOT).as_posix() for p in base.rglob('*') if p.is_file())
protected_paths.add('output/replay_tavern/901_剧情向主持_006_手动导入包_20261018.zip')
save(STAGE/'protected_before.json', [{'path':r,'sha256':sha(ROOT/r)} for r in sorted(protected_paths)])

rel=W+'capital_enemy_builds_rewards_draft.md'
replace(rel, '**状态为本轮授权创作的DRAFT：数值、能力的定量适配和奖励额度是新方案，尚未作为已采用参数装入006。**', '**状态为ADOPTED_AUTHOR_DESIGN：2026-10-18按UCL_20261018_006整版采用，含七类短卡、定量能力、场景参数和XP方案。**')
replace(rel, '玩家强度估算实验后置，本稿不计算整队战斗力、胜率或T档兑换公式。', 'UCL_20261018_006进一步授权融入现有主持资料、场景稿与007世界书。玩家强度估算实验后置，本稿不计算整队战斗力、胜率或T档兑换公式。')
replace(rel, '本稿给敌人的T档是**新建议**。', '本稿敌人T档现为**已采用的场景构筑定位**。')
replace(rel, '不得在玩家尚未选择时替其杀敌、接受伤害或放弃救人。', '不得替玩家新增杀敌、主动承受伤害的取舍或放弃救人的选择；已声明行动实际导致的受伤、失败与消耗仍可裁定。')
replace(rel, '此档为帝都案件的**建议战斗定位**', '此档为帝都案件的**已采用战斗定位**')
replace(rel, '下面速度倍率、动作和消耗仍为本稿新参数。', '下面速度倍率、动作和消耗由UCL_20261018_006采用，来源仍是本轮作者设计。')
replace(rel, '后续采用后再将相应短卡与XP口径投影到下一版主持资料。现有006主持卡、世界书、文风以及真实游玩记录未被本稿自动改写；玩家强度估算实验仍后置。', '采用内容随[007敌人与XP包](../../output/replay_tavern/enemy_xp_20261018_candidate/README.md)投影到主持卡、世界书、文风及场景手册。006作为旧候选保留；采用参数不等于当前NPC已满血到场、某人已被击杀或XP已经发放，真实分支状态不重置。玩家强度估算实验仍后置。')

scene_names = ['capital_rescue_playable_draft.md','capital_intervention_playable_draft.md','capital_arrays_hypnosis_rules_draft.md','capital_canyon_investigation_playable_draft.md','capital_canyon_battle_playable_draft.md']
for name in scene_names:
    r=W+name
    s=read(r)
    s=s.replace('2026-10-18构筑补充〔DRAFT〕','2026-10-18构筑补充〔UCL_20261018_006已采用〕').replace('2026-10-18数值方案〔DRAFT〕','2026-10-18数值方案〔UCL_20261018_006已采用〕')
    s=s.replace('数值为待采用方案；','数值与XP口径已采用；').replace('仅数值方案待采用，','本批数值方案已采用，').replace('参数方案待采用，','参数方案已采用，')
    s=s.replace('魔兽施术DP、射程、成本与该守卫残留点数已有具体建议，尚非已采用数字；下文相应“未定”仅指采用状态，不能理解为没有准备方案。','魔兽施术DP、射程、成本与该守卫残留点数现已采用；下文旧留白仅保留该方案尚未补足的字段，不重新将这些参数视为未知。')
    if name=='capital_arrays_hypnosis_rules_draft.md':
        s=s.replace('需要真正掷骰时仍缺的字段是催眠魔兽已采用施术骰池／成本与具体射程、当场受控者必要的属性和残留点数、阵式对抗强度及坚固载体若进入伤害结算时的实际物体数据；', '催眠魔兽的骰池／成本／射程及驻处既定受控守卫的属性和残留点数已有007采用短卡；其他受控者若实际进入详细结算，再补其必要字段。仍按需补足的是阵式对抗强度及坚固载体进入伤害结算时的实际物体数据；')
    set_text(r,s)
replace(W+'capital_high_risk_hunt_draft.md', '新增参数仍为DRAFT，不重开帝都主案。', '参数与XP方案现按UCL_20261018_006采用，不重开帝都主案。')
replace(W+'capital_gremlin_playable_draft.md', '这些新参数仍为DRAFT。', '这些参数与XP方案现按UCL_20261018_006采用；完整短卡不迫使场景逐轮战斗，也不穷尽NPC合理能力。')
replace(W+'chuul_first_resolution_draft.md', '其新增参数仍为DRAFT。', '其新参数现按UCL_20261018_006采用。')
profile='output/replay_f_review/v1/characters/profiles/CRC_026.md'
replace(profile, '其中新增数值仍为DRAFT。', '其中新增数值与XP方案现按UCL_20261018_006采用，007按当前场景取用。')
replace(profile, '具体量化参数另见本轮DRAFT。', '具体量化参数按UCL_20261018_006采用，另见本轮短卡。')
replace(W+'README.md', '结合T阶梯和已有场景的具体DRAFT；古雷姆林高速特点按最新确认，数值与XP额度待采用，玩家强度估算实验后置', '按UCL_20261018_006采用的七类构筑与XP口径；已接入007，古雷姆林常态高速明确，玩家强度估算实验后置')

host=GM+'host_rules.md'
replace(host, '2026-10-18依据UCL_20261018_001—002修订。', '2026-10-18依据UCL_20261018_001—002及006采用修订。')
replace(host, '## 节点、挑战与击杀XP', '已采用帝都短卡：城卫T1、部属老兵T2、法阵安装者T1战斗定位、石像魔偶T3、催眠魔兽T3控制定位、Chuul T4、古雷姆林常态T5。它们约束当前实力与已明确能力，数值表供细打使用，不强迫逐轮战斗，也不构成能力白名单；概述／简化仍守范围、动作机会、代价与已有结果。无来源防护记0不等于禁止另有依据的新能力；补充仍不得无因改变已定防护或抵消玩家准备。古雷姆林常态高速应在突进与换位中体现，以人物目的决定继续交战和撤离时机，不轻易靠高速退场，不临时关闭或扩成必然逃脱。详细例外按本场能力条文，不自动推成所有NPC的通则。\n\n## 节点、挑战与击杀XP')
replace(host, '本次不建立固定怪物XP价目或RE奖励点换算。', '采用下列帝都场景基准，不建立T档统一价目或RE奖励点换算。')
replace(host, '## 运作剧情与场景体验', '帝都奖励以御临风个人XP计，同行NPC不从中机械分走份额：稍有难度的独立敌人1XP，四人搜捕阻拦整体2XP，石像2XP，催眠魔兽3XP，Chuul 4XP，古雷姆林常态5XP；阻止法阵启动等独立挑战1—3XP，施工人员不按人头发奖。具体是否适用按事前真实威胁、实质贡献与结果判断，普通击杀可当场独立发奖。成功准备、合理克制、争取支援和简化处理不自动减奖；无贡献的旁观、已制伏后的补刀不另产XP。有效捕获或可靠排除同一威胁可获得同档成果奖。\n\n击杀、挑战与节点针对同一份解决成果只结一次。石像与古雷姆林都实际解决可为2+5=7XP；若先排除石像、打断加害并救下A而古雷姆林逃走，可先给2+3=5XP，其中3XP是本案5XP成果的先行部分，后来完成同一追捕补2XP。新发生且独立的危机另计；不把逃走视为贡献归零，也不重发同一成果。发奖写明事项、个人数额、已领部分与余下条件；只有真实发放才更新余额。\n\n## 运作剧情与场景体验')
append(GM+'turn_flow.md', '## 已采用敌人短卡怎样进入一轮\n\n按UCL_20261018_006，先确定当前实际出场对象与状态，再取用对应短卡；载入完整参数不等于必须细打。概述与简化照用其实力、范围、消耗和限制，新增合理能力沿主持原则。结算时区分已解决威胁、仍在逃的敌人及独立救援成果，参照本场XP并扣除同一成果已领取部分；不按敌人数或掷骰次数直接累计。古雷姆林高速要体现于交锋，是否撤离依其目的与现场，不预写必逃或必捕。')
append(GM+'state_and_memory.md', '## 帝都短卡与XP的连续性\n\nUCL_20261018_006采用短卡与XP基准，不初始化NPC到场、满血、恢复魔力或已发奖励。沿现有摘要记录重要伤势、魔力消耗、拘束、控制残留、已破坏阵路及重要临场能力；从简化切到细打也不重置。奖励以御临风个人份额记事项、实际数额、已领部分、剩余条件；同行NPC不机械分走该份额。古雷姆林案件先发3XP后完成同一追捕补2XP，不再重发5XP；独立的新危机另列。单次击杀不额外触发传奇智力节点清算红利。')
replace(W+'capital_event_dependencies.md', '这里不预发奖励、不建立固定XP表。', '具体敌人短卡与场景XP基准按UCL_20261018_006采用的[帝都方案](capital_enemy_builds_rewards_draft.md)取用：个人1—5XP按真实挑战与贡献、分项成果和已领部分结算，不预发，不按T档或人头统一定价。七类短卡不迫使逐轮战斗，也不穷尽NPC能力；已有范围、代价、状态与结果保持。')
append('work/rules_fusion/901-core-rules-v0.1.md', '**帝都场景构筑与XP／ADOPTED_AUTHOR_DESIGN〔UCL_20261018_006〕：**[七类敌人短卡及奖励方案](../replay_research/capital_enemy_builds_rewards_draft.md)已采用，供实际帝都场景使用；其局部多次攻击、触须毒、构体、高速与土遁例外不改写全体角色通则。XP以御临风个人份额计：稍难独立敌人1，四人阻拦／石像2，催眠魔兽3，Chuul 4，古雷姆林5；独立阵路挑战1—3。不按T档或NPC人数换算，是否发放按真实威胁、贡献、成果与已领部分；有效非击杀解法、合理准备与剧情向简化按同一口径。短卡不是能力白名单，NPC补充沿已定体系和实力，不能临时抬高已定参数；玩家强度估算实验继续后置。')

style_rel=W+'gm_style/v1/authoring.json'
style=json.loads(read(style_rel))
style['modules'][0]['content']=style['modules'][0]['content'].rstrip()+'\n\n已采用的敌人短卡只按当前场景取用；完整数值不会让正文变成逐轮报表，也不把未列能力当作禁止行动。通过可感知的效果表现差异，尤其古雷姆林的高速突进与换位；不反复用高速逃走中断交锋。剧情向简化保留实际代价、状态与玩家选择，合理补充能力沿主持原则。XP在真实发奖时简短说明个人数额、完成事项与已领部分，不按人头或骰数打分，节点不重奖同一成果。\n'
set_text(style_rel,json.dumps(style,ensure_ascii=False,indent=2)+'\n')
replace(W+'gm_style/v1/README.md', '2026-10-18当前适配：[006剧情向主持包](../../../../output/replay_tavern/story_guidance_20261018_candidate/README.md)。', '2026-10-18当前适配：[007敌人与XP包](../../../../output/replay_tavern/enemy_xp_20261018_candidate/README.md)。006作为先前候选保留；007明确短卡不强迫逐轮战斗、NPC能力不穷尽以及个人XP去重。')

quote='这版可以采用，把怪物构筑和XP方案融入现有主持资料、场景稿和下一版世界书，注意与剧情向简化、NPC自由裁定保持一致。玩家强度估算实验继续后置。'
append(W+'user_clarifications.md', '## UCL_20261018_006\n\n> '+quote+'\n\n整版采用[帝都敌人与XP方案](capital_enemy_builds_rewards_draft.md)，包括七类敌人T档、属性技能、动作、能力参数与例外、少量场地参数及个人XP基准和结算方式。授权融入现有主持资料、场景稿及007世界书、配套主持卡与文风；保持剧情向概述／简化与同体系NPC自由裁定，玩家强度估算实验继续后置。采用属于作者设计，不新增原团证据、不登记未来事件或实际领奖，不授权自动安装。前两条记载的待采用状态现由本条更新，不改其原话与形成时期。')
record={'id':'UCL_20261018_006','source_id':'REF_USER_CLARIFICATIONS','source_kind':'user_enemy_xp_adoption_and_export_authorization','recorded_on':'2026-10-18','recorded_date_timezone':'Europe/Paris','verbatim':quote,'certainty':'confirmed','original_campaign_post_count_contribution':0,'authorization_status':'ADOPTED_AND_NEXT_EXPORT_AUTHORIZED','scope':'整版采用七类敌人构筑与个人XP方案；融入主持、场景与007世界书，保持简化和NPC自由裁定，玩家强度估算实验继续后置。','reference_documents':[W+'capital_enemy_builds_rewards_draft.md'],'runtime_installed':False}
set_text(W+'user_clarifications.jsonl',read(W+'user_clarifications.jsonl').rstrip()+'\n'+json.dumps(record,ensure_ascii=False)+'\n')

save(STAGE/'source_updates.json', list(updates.values()))
diff=''.join(''.join(difflib.unified_diff(x['before'].splitlines(True),x['after'].splitlines(True),fromfile=x['path']+' (before)',tofile=x['path']+' (007)')) for x in updates.values())
(STAGE/'source_changes.diff').write_text(diff,encoding='utf-8')
print(json.dumps({'prepared_sources':len(updates),'diff':str(STAGE/'source_changes.diff')},ensure_ascii=False))
