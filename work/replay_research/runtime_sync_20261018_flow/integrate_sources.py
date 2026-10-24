"""One-shot preparation/application of the approved 008 prose changes."""
from pathlib import Path
import difflib, hashlib, json, sys

ROOT = Path(__file__).resolve().parents[3]
STAGE = Path(__file__).resolve().parent
AUTH = 'UCL_20261018_007'
HEADER = '## 2026-10-18：按需讲解、反馈与相称后果〔008已采用〕'
def read(p): return json.loads(p.read_text(encoding='utf-8'))
def write(p, x): p.write_text(json.dumps(x, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if '--apply' in sys.argv:
    updates = read(STAGE/'source_updates.json')
    for u in updates:
        assert sha(ROOT/u['path']) == u['before_sha256'], u['path']
    for u in updates:
        (ROOT/u['path']).write_text(u['after'], encoding='utf-8', newline='\n')
    write(STAGE/'source_inventory.json', {'authorization':AUTH, 'updated_sources':[u['path'] for u in updates], 'source_sha256':{u['path']:sha(ROOT/u['path']) for u in updates}})
    print(f'Applied {len(updates)} inspected source changes.')
    sys.exit()

assert not (STAGE/'source_updates.json').exists(), 'Prepared changes already exist; inspect instead of overwriting.'
protected = read(ROOT/'work/replay_research/runtime_sync_20261018_enemies/protected_before.json')
for entry in protected:
    assert sha(ROOT/entry['path']) == entry['sha256'], entry['path']
base=ROOT/'output/replay_tavern/enemy_xp_20261018_candidate'
extra=list(base.rglob('*'))+[ROOT/'output/replay_tavern/901_帝都敌人与XP_007_手动导入包_20261018.zip']
protected += [{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)} for p in extra if p.is_file()]
write(STAGE/'protected_before.json', protected)
updates=[]
def change(rel, transform):
    p=ROOT/rel; before=p.read_text(encoding='utf-8'); after=transform(before)
    assert after != before, rel
    assert rel not in {x['path'] for x in protected}, rel
    updates.append({'path':rel,'before_sha256':sha(p),'before':before,'after':after.rstrip()+'\n'})
def append(rel, body): change(rel, lambda s:s.rstrip()+'\n\n'+body.strip()+'\n')

host_add='''## 按需讲解规则

玩家可以用自然语言说明目标与行动，不必先报准确技能名或掌握整本规则；主持负责将已经声明的行动对应到适用机制。首次涉及陌生机制、玩家询问，或规则会影响其决定时，简短说明与本次行动有关的条件、代价和主要风险；重大风险仍在选择前交代。只补确实影响裁定的歧义，不把规则讲解变成打法建议、行动菜单或替御临风选择。无实质障碍的普通行动不额外设教学检定。

讲解多少与结算详细度分开：概述或简化可以只解释决定性条件，玩家要求时再展开计算；熟悉后不反复讲课。新NPC能力沿已定体系、实力与条件合理补充，需要说明时解释可感知效果和有关边界，不以教学为由泄露隐藏机制，也不把未列能力一概判为无效。必要桌外规则说明与场景对白分开，不要求NPC讲解DP、XP等桌面术语。

## 根据反馈调整场景重点

用户明确表示查问重复、流程拖沓、希望快进或想展开某段互动时，将反馈用于后续篇幅与取景。已授权、没有新信息和重要决定的办理、联络与重复过程可压缩或收束；尚未发生、且不承载必要因果的冗余插曲可省去。关键线索、真实风险、已作承诺和已发生后果仍承接，不能把删去演出写成事情自动办成。对人物或关系的明确兴趣可以获得更多互动空间，不因此保证NPC同意、关系升级、追加奖励或取消其自身事务。

玩家简短回复、暂时沉默或选择离开不自动说明厌烦；不为猜测的无聊突然切镜、跳过尚未结束的对话或制造危机。已有明确反馈直接落实，不逐轮询问满意度；确实不清楚快进范围且会跨越重要选择时才局部澄清。反馈是桌外主持偏好，不成为NPC听见的话、御临风的意愿或世界内时间流逝。

## 失败、压力与致命风险

失败后果依据实际冲突目标、已成立危险和行动结果决定。查问受拒、错失机会、暴露、局部受阻、受伤或撤离等，在各自条件成立时都可以构成失败，不把普通失手统一升级为濒死或死亡；已经取得的证据、救援和局部成果继续有效。能否继续、换法或撤离依现实通路，不承诺每次失败都有安全出口，也不替御临风作出撤退、投降或主动承伤的决定。

真正成立的致命攻击与伤势按采用规则或有依据的简化处理，不因剧情需要暗改骰子、削弱既定能力、抹去伤势或安排必然救援；也不为营造压力追加原本没有的致命后果。简化应交代失去了什么、还保有什么以及眼前可感知的局面，不用一次失败宣布全线崩溃。采用的奖励仍按真实贡献和成果结算，不因过程简化、局部失败或退出就自动清零；未取得的成果也不提前给奖。玩家强度估算实验继续后置。'''
change('output/replay_f_review/v1/gm/host_rules.md', lambda s:s.replace('UCL_20261018_001—002及006采用修订','UCL_20261018_001—002及006—007采用修订',1).rstrip()+'\n\n'+host_add+'\n')

append('output/replay_f_review/v1/gm/turn_flow.md','''## 按需讲解、反馈与失败处理〔008〕

按UCL_20261018_007，接住玩家用自然语言声明的行动，再对应机制；不要求先报技能名。陌生机制、主动询问或影响决定的条件，用少量桌外说明讲清本次代价与主要风险，必要时在行动选择前说明；不顺带推荐打法，不为教学额外投骰。是否展开规则仍按概述／简化／详细三种方式决定，NPC合理未列能力继续可用。

用户明确要求加快重复流程或展开某段互动时，直接调整下一段的篇幅和取景。先保留已有成果、关键线索及真正未定的问题，再压缩已授权且无新决定的过程；遇到新的承诺、披露、打法或风险选择停在其发生前。简短回复与桌外等待不自动等于无聊或世界时间流逝，偏好也不传入NPC知识。无需每轮满意度确认。

裁定失败时先看本次目标与实际危险：确定本次未达成什么、发生何种相称后果、已有哪部分成果仍成立，再呈现可观察局面。失去接触、未获许可或撤退不自动变成死亡、全队失败或成果归零；确有致命危险则照常处理，不改骰、临时调弱或强制救援。保留伤势、消耗、消息与已领XP；玩家的新选择留给玩家。上述处理顺序用于主持，不输出固定检查表。''')

style_add='''规则教学按需简短出现：玩家以自然语言声明行动即可，由主持对应适用机制。首次涉及陌生机制、用户询问或影响选择时，只讲本次必要条件、代价和主要风险；桌外说明与人物对白分开，不让NPC朗读DP或XP。讲清后回到现场，不每轮重讲、不推荐打法，也不因解释规则强迫细打或否定合理的未列能力。

根据用户明确反馈调整篇幅：已授权且没有新信息或重要决定的重复查问、手续与行路可收束；对人物互动的明确兴趣可以充分展开，人物仍按自己的处境回应。不能只凭短回复猜测无聊，不能为提神添危机，也不能跳过关键选择、必要线索或把省略过程写成自动成功。桌外反馈不变成角色知识、意愿或剧情时间。

失败写出具体变化：本次目标哪里受阻、实际付出什么、仍保有什么成果。依现场呈现拒绝、错失、受伤或撤离等后果，不把每次失手渲染成濒死、全盘崩溃或必然获救；真正致命的危险仍按实际处理。概述也保留状态与玩家选择，不改骰、不临时削弱已定能力，不把局部成果和应得XP一并抹去。'''
def style_edit(s):
    obj=json.loads(s); obj['modules'][0]['content']=obj['modules'][0]['content'].rstrip()+'\n\n'+style_add+'\n'
    return json.dumps(obj,ensure_ascii=False,indent=2)+'\n'
change('work/replay_research/gm_style/v1/authoring.json',style_edit)
append('work/replay_research/gm_style/v1/style_profile.md','''## 2026-10-18：008补充采用

依据UCL_20261018_007，主模块加入按需规则讲解、按用户明确反馈调整篇幅、以具体且相称的后果呈现失败。规则解释与场景对白分开，不变成打法教学；压缩不跨越新选择，不猜测短回复等于厌烦；真实致命危险、NPC同体系自由裁定及已经取得的成果保持。上述为已采用主持表达约定，不是新增原团风格统计。''')
append('work/replay_research/capital_event_dependencies.md',f'''{HEADER}

依据UCL_20261018_007，本节适用于本页已采用条件式场景及相邻场景稿。玩家用自然语言声明行动，主持对应机制，只在陌生机制、询问或影响选择时简短解释必要条件、代价与风险；不替选打法、不新增教学关卡。仍可概述或简化，NPC可按已定体系与实力补充合理能力。

按用户明确反馈压缩已授权且无新信息／决定的重复过程，或展开确有兴趣的互动；不把短回复视为无聊，不用插入危机提神，不省略关键线索、真实因果或玩家的新决定。偏好不成为NPC知识或御临风已经作出的选择。

失败按本次目标与真实危险产生相称后果，局部受阻不自动变成死亡或全线失败；证据、救援、实际资源与已领XP分别保留。真正致命危险不暗改为安全，也不追加必然死亡、强制救援或事后削弱能力。相关场景末节给出本场应用，不预定结果或新增生存保证；玩家强度估算实验后置。''')

scene_notes={
'capital_opening_playable_draft.md':'问路、出示已有凭据与普通观察用自然语言即可，只在实际受阻或玩家询问时解释有关机制。用户嫌查问重复时，压缩已授权的重复打听，保留相反军情与新披露决定；一次接报受拒不自动升级为拘捕或追杀，后续措施仍须真实原因。',
'capital_rescue_playable_draft.md':'需要时只说明搬运、控制或急救的本次条件与代价，不给玩家指定撤离打法。按反馈压缩已确认安全且获授权的搬运，保留新路口选择与安置互动；追逐或交涉受阻可改变位置和接触机会，不能直接宣告雪老死亡或获救。致命攻击与伤势仍按实际处理，不以保剧情临时削弱守卫或追加救兵。',
'capital_clinic_release_playable_draft.md':'把希望探视、送药或核问的行动对应实际权限与机制，不要求玩家报交涉技能名。用户嫌手续拖沓时收束已授权的重复交接，保留尚待同意的证言与披露；未获许可只成立该次请求受阻，不自动触发处刑、撤销已获照护或重启已经解除的限制。',
'capital_commission_playable_draft.md':'玩家描述想核对什么即可；涉及实际阻力才说明本次规则，不把讲解变成推荐调查路线。按明确反馈压缩重复介绍或展开当事人的顾虑，委托范围和承担风险仍须本人选择。无新发现、延期或拒绝按既有回报条件收束，不自动把其他帮助取消或让案件全线失败。',
'capital_discovery_playable_draft.md':'调查动作以玩家意思对应机制，必要说明限于观察／核问能取得的内容和暴露风险，不讲未揭示真相。重复核查可依反馈概述，重要矛盾与信任互动保留。一次失去线人接触不抹去已有证据，也不凭空补成线人死亡；真正的新危险按现场处理。',
'capital_intervention_playable_draft.md':'解释催眠、制伏或控制时，只交代本次可判断的条件和代价，保持NPC同体系自由裁定。按反馈简化已无重要选择的交接与压制；目标逃离不等于已救人员、证据和有效成果归零，强者到场也不保证人人无伤。真实致命攻击不能为了高潮或保命暗改，剩余威胁分别记录。',
'capital_recovery_playable_draft.md':'涉及治疗机制时解释本次实际作用与仍未解决之处，普通照护和交流不设教学骰。依明确反馈压缩重复排查，给团聚、道歉与日常安排适当篇幅；不愿和解、暂不能回岗或一项核问无结果不自动等于治疗失败，更不额外制造复发或危机。',
'capital_yoyo_playable_draft.md':'规则说明只覆盖当前可知的身体状态与本次行动条件，不提前泄露死亡后手。按用户明确兴趣展开相处或压缩重复诊视，披露与治疗选择仍留给当事人。未取得信任、一次谈话受挫或玩家离场不自动触发恶化、死亡或强制转咒；实际成立的危险仍须处理。',
'capital_curse_playable_draft.md':'在选择会影响代价和风险时简短说明已查明的治疗条件与未知项，不将说明变成推荐承咒路线。按反馈压缩已授权的重复联络和资料核对，不跳过治疗同意。一次研究无结论、未收到回信或拒绝转咒不自动宣告治疗全部失败；既有稳定与研究成果保留，真实恶化也不靠必然神约救援抹去。',
'capital_gremlin_playable_draft.md':'涉及高速、地形、控制或脱离时，只解释当前可判断且影响选择的条件，不泄露全部底牌或推荐打法。可按反馈简化无选择的往返与交锋，保留A的互动和真正风险选择。石像被破、加害受阻与古雷姆林是否被捕分别成立；失败不保证死亡或救援，高速也不为保命／保剧情临时关闭，已获成果与XP沿007结算。',
'capital_canyon_briefing_playable_draft.md':'玩家用自己的话说明准备了解或承担什么，必要时解释侦察与联络的条件，不要求先完成规则课。按反馈压缩重复介绍和已授权行程；未会合、拒接或暂不能承担某项工作不等于整个战事失败。实际已发生的危险应告知，不能用简报替御临风决定参战或分组。',
'capital_canyon_investigation_playable_draft.md':'针对已声明的接近、观察或术式操作说明必要条件与风险，未知秘密不借规则讲解公开。按反馈压缩重复巡视，保留新证据和暴露后的决定；失去尾随、一次操作未成或仅查一地，按实际影响处理，不能自动引爆全阵、抹去已有毁阵成果或宣布全军覆没。',
'capital_canyon_battle_playable_draft.md':'需要讲解时围绕本次位置、作用范围、行动代价和可见危险，不替玩家规划战术；概述、简化及合理NPC能力照常可用。按反馈调整军队交锋篇幅，保留真正的介入决定。局部失守、护送受阻或撤出按实际通路与伤势处理，救下的人和已毁阵路仍成立；失散不等于死亡，真实致命攻击也不靠保证援军到达来取消。',
'capital_canyon_return_audience_playable_draft.md':'奖励或伤势规则仅在相关询问、发奖与处理时简短解释；不让NPC以桌面术语评价玩家。按反馈压缩重复报告，保留争议、认可和人物态度。未获全盘认同或一项事实仍不清楚，不自动取消已确认战果、救治和已领XP；实际损失也不因会见成功被抹去。',
'capital_festival_playable_draft.md':'玩家描述参与活动或交流即可，必要规则随当下行动解释，不把庆典变成教学任务。用户明确喜欢某段相处时可展开，重复闲逛可在授权范围内收束；一次失利、拒邀或谈话不合不自动变成敌意、危机或永久关系破裂，也不保证对方接受。',
'capital_memory_sword_playable_draft.md':'恢复、修复与重铸的条件和代价在相关选择前说清，玩家无需报出准确术式或技能名。按明确反馈压缩已授权的预约、等待与工坊往返，恢复时交付的往事仍依既有事实，御临风的情绪和理解由玩家决定。咨询未成、暂不施术或材料未齐不自动触发反噬、再次失忆或毁剑；已有恢复能力可以实际奏效，不另添试炼，真正发生的伤势与材料消耗照常保留。',
'capital_high_risk_hunt_draft.md':'按玩家已声明的行动解释本次水域、攻击或异常状态的必要条件与代价，未知能力不全盘公开。可依反馈简化重复探路与无新选择的交锋；实际进水、追击或承受新风险仍由玩家选择。未能击杀、失去接触或撤回不自动死亡，已完成的可靠排险仍按实际成果计；Chuul的既定伤害和麻痹不为保命临时削弱，也不增援保证解围。',
'capital_crossline_handoff_draft.md':'用户明确要求加快某线或多写人物互动时，调整已授权过程的演出篇幅；不据短回复推断厌烦，不把偏好当成新的任务承诺或世界时间。其他线路仍按实际消息、时间与行动变化，不因切线同时升级危机。某线受阻或只完成局部目标不令另外两线自动失败，已有接手、照护、保护与成果各自保持。',
}
for name, note in scene_notes.items():
    append('work/replay_research/'+name,HEADER+'\n\n依据UCL_20261018_007，沿[场景共通补充](capital_event_dependencies.md#2026-10-18按需讲解反馈与相称后果008已采用)。\n\n'+note)
write(STAGE/'scene_notes.json',scene_notes)

quote='可以，把这三项补进现有主持原则、回合流程和文风模块，同步相关场景稿，再生成下一版世界书。注意与剧情向简化、NPC自由裁定保持一致，玩家强度估算实验继续后置。'
append('work/replay_research/user_clarifications.md',f'''## {AUTH}

> {quote}

采用前轮核查提出的三项主持补充：按需解释规则并将自然语言行动对应机制；按用户明确反馈调整场景篇幅与重点；按实际冲突目标与危险裁定相称失败后果，避免把所有失败升级为死亡。授权更新主持原则、回合流程、文风及相关场景稿，再从007生成008。保留关键选择、既定结果、同体系NPC自由裁定、既有敌人数值和个人XP方案；不承诺安全出口、自动成功或必然救援。玩家强度估算实验后置，不新增原团事件、实际奖励或安装授权。

本批来源、差异及导出见[runtime_sync_20261018_flow](runtime_sync_20261018_flow/README.md)。''')
record={'id':AUTH,'source_id':'REF_USER_CLARIFICATIONS','source_kind':'user_hosting_flow_adoption_and_export_authorization','recorded_on':'2026-10-18','recorded_date_timezone':'Europe/Paris','verbatim':quote,'certainty':'confirmed','original_campaign_post_count_contribution':0,'authorization_status':'ADOPTED_AND_NEXT_EXPORT_AUTHORIZED','scope':'按需规则讲解、按明确反馈调整篇幅、相称失败后果，融入主持／场景并生成008；保持剧情向简化、NPC自由裁定和007敌人XP，玩家强度实验后置。','reference_documents':['output/replay_f_review/v1/gm/host_rules.md','output/replay_f_review/v1/gm/turn_flow.md','work/replay_research/gm_style/v1/authoring.json'],'runtime_installed':False}
change('work/replay_research/user_clarifications.jsonl',lambda s:s.rstrip()+'\n'+json.dumps(record,ensure_ascii=False)+'\n')

# Navigation changes are prepared and inspected with the source changes.
nav='2026-10-18新增独立候选 **008主持体验补充**：[内容与手动应用](flow_guidance_20261018_candidate/README.md) · [完整导入ZIP](901_主持体验补充_008_手动导入包_20261018.zip)。补入按需规则讲解、按明确反馈调整篇幅、相称失败后果；保持007敌人构筑与XP、剧情向简化及NPC自由裁定。136个UID与加载配置保留，需同步更新世界书、主持正文和文风。旧候选及latest_release.json保留；玩家强度估算后置，未自动安装或调用模型。'
change('output/replay_tavern/README.md',lambda s:s.replace('# 901帝都重玩：当前版本入口\n\n','# 901帝都重玩：当前版本入口\n\n'+nav+'\n\n',1))
change('output/replay_f_review/v1/gm/README.md',lambda s:s.replace('[007导入包](../../../replay_tavern/enemy_xp_20261018_candidate/README.md)是本轮交付','按UCL_20261018_007再补入按需规则讲解、反馈调节与相称失败后果；[008导入包](../../../replay_tavern/flow_guidance_20261018_candidate/README.md)是本轮交付，[007](../../../replay_tavern/enemy_xp_20261018_candidate/README.md)保留',1))
change('work/replay_research/gm_style/v1/README.md',lambda s:s.replace('2026-10-18当前适配：','2026-10-18当前适配：[008主持体验补充](../../../../output/replay_tavern/flow_guidance_20261018_candidate/README.md)，按UCL_20261018_007加入按需规则讲解、反馈调节和相称失败后果。以下007及更早研究保留。\n\n2026-10-18上一批适配：',1))
change('work/replay_research/README.md',lambda s:s.replace('| 帝都敌人构筑与击杀XP |','| 主持体验与规则讲解 | [008采用与导出](runtime_sync_20261018_flow/README.md)：按需规则讲解、明确反馈调节与相称失败后果，保留剧情向简化和NPC自由裁定；玩家强度估算后置 |\n| 帝都敌人构筑与击杀XP |',1))

write(STAGE/'source_updates.json',updates)
diff=''.join(''.join(difflib.unified_diff(u['before'].splitlines(True),u['after'].splitlines(True),fromfile=u['path'],tofile=u['path'])) for u in updates)
(STAGE/'source_changes.diff').write_text(diff,encoding='utf-8')
print(json.dumps({'prepared_sources':len(updates),'scene_sources':len(scene_notes),'protected_files':len(protected),'diff':'source_changes.diff'},ensure_ascii=False))
