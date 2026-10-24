"""One-off 006 consistency repair. Default previews; --apply writes the inspected diff."""
from pathlib import Path
import copy, difflib, hashlib, json, shutil, sys

ROOT=Path(__file__).resolve().parents[3]
STAGE=Path(__file__).resolve().parent
OUT=ROOT/'output/replay_tavern/story_guidance_20261018_candidate'
BASE=ROOT/'output/replay_tavern/capital_entry_20261012_candidate'
WORK='work/replay_research/'
GM='output/replay_f_review/v1/gm/'
PROFILES='output/replay_f_review/v1/characters/profiles/'
BOOK='import/901_剧情向主持_M1_20261018.json'
PATCH='006_consistency_r1'
pending={}
def raw(p):return p.read_text(encoding='utf-8-sig')
def read(p):return json.loads(raw(p))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def current(rel):return pending.get(rel,raw(ROOT/rel))
def put(rel,s):pending[rel]=s.rstrip()+'\n'
def obj(rel,v):put(rel,json.dumps(v,ensure_ascii=False,indent=2))
def replace(rel,old,new,count=1):
    s=current(rel);assert s.count(old)==count,(rel,old[:60],s.count(old));put(rel,s.replace(old,new))
def append(rel,s):put(rel,current(rel).rstrip()+'\n\n'+s)
def relout(p):return (OUT/p).relative_to(ROOT).as_posix()
def ref(rel,marker):
    matches=[i+1 for i,s in enumerate(current(rel).splitlines()) if marker in s]
    assert len(matches)==1,(rel,marker,matches)
    return {'path':rel,'line':matches[0],'locator':marker}

hostrel=GM+'host_rules.md'
replace(hostrel,'已有不会、硬性资格及明确限制继续有效，不能靠背景推断或提高DC绕过；隐含掌握不增加永久属性、技能等级、自动成功或专有资源加成，也不转借尚未授权资源的专有效果。叙事简化不增加未获授予的永久数值资源；实际需要精确数值时只定义本次必要参数，并在后续保持一致。',
'''已有不会、硬性资格及明确限制继续有效，不能靠背景推断或提高DC绕过。NPC的合理补充不以玩家兑换清单、资源库收录或程序登记为前提；需要细打时，可依其当期体系和强度补足本次必要的技能、效果数值、加值与消耗，不能因刚需要该能力就临场提升原有实力或改写已确立数值。御临风不能借隐含掌握免付成长费用，增加永久属性、技能等级、自动成功或未取得资源的专有效果；合理的已有技艺运用仍可裁定。补出的重要参数及限制随后保持一致，新学习、修复或成长则按实际经历另记。''')
replace(hostrel,'会做不保证做成，必要检定沿用既有规则；成功使用不自动升级或复制全部相关效果。',
'会做不保证做成；选用检定时沿用适用规则，也可按场景作简化叙事裁定，不把对抗本身当作必须投骰的条件。成功使用不自动升级或复制全部相关效果。')
replace(hostrel,'概述和简化须交代实际结果、重要代价及仍未解决的问题，',
'''世界书中具体法术的动作、逐轮检定与DC表，是选用详细结算时的参照，不强制每次施法或冲突进入完整流程。概述或简化可以省略重复掷骰、过程和无关数值展示；已明确的掌握资格、作用范围、资源代价及失败条件仍约束结果，已有账目中的实际消耗照记，不因此变成免费、无限或自动成功。未知数值只有在确实影响结果且不能可靠叙事裁定时才补足。

概述和简化须交代实际结果、重要代价及仍未解决的问题，''')
replace(hostrel,'之后不得按敌我反复改判、扩大效果或写回原团。',
'之后不得按敌我反复改判、无因扩大效果或写回原团。')
style_rel=WORK+'gm_style/v1/authoring.json'
style=read(ROOT/style_rel);content=style['modules'][0]['content']
style_replacements=[
('普通陈设、路人和当场互动仍可自然生成，影响重要选择的持久设定缺口保持未定。',
 '普通陈设、路人和当场互动仍可自然生成；无依据的历史真相、制度权限与秘密关系保持未定。主持原则已允许的NPC能力与必要参数可以合理补全，并在影响后续时记住，不因尚未列明就按重要设定缺口冻结。'),
('简化不替御临风选打法、付出未声明的重大牺牲或接受结果外的新承诺。',
 '简化承接玩家已声明或明确委托的目标、手段与连续行动，可以概述其执行及客观后果，无须让玩家逐招补动作。新的打法取舍、主动牺牲、信息披露与承诺仍由玩家决定；已有行动导致的失败、受伤或消耗可照常裁定，不把未经声明的主动牺牲和客观损害混为一谈。'),
('行动场面交代手段、位置、阻碍和可见结果之间的联系。攻击怎样出手、对方怎样应对、局面哪里改变，比反复说强大或震撼更重要。',
 '展开描写的行动场面交代手段、位置、阻碍和可见结果之间的联系；概述的战斗交代关键结果及代价即可，不要求逐招表现。攻击怎样出手、对方怎样应对、局面哪里改变，比反复说强大或震撼更重要。')]
for old,new in style_replacements:assert content.count(old)==1;content=content.replace(old,new)
style['modules'][0]['content']=content;style['consistency_revision']=PATCH
obj(style_rel,style)

# These are hosting permissions, not new factual abilities or changed character histories.
profile_notes={
'002':'格斗、气与内力范围内的招式和必要参数，可依据当期实力、训练与代价合理补充，不要求先前逐招写明。原线后期奖励、GF整套、龙象各阶和斯巴达旧训练不因此提前取得。',
'010':'龙形与空间能力的合理用法可依据当期实力、掌握方向和实际条件补充，不要求每一术式已经在本分支演示。魔力精确余量未知不一律阻止施法，也不视作满额；需要影响重大结果时再补必要信息。后期物品、王族仪式与原线后手仍不提前取得。',
'014':'治疗、魔法防护与炼金方向中的具体术式，可依当期实力、专业、材料和代价合理补充，不要求逐项预列。库存仍按实际持有处理；新术式不自动产生材料、稀有药物或万能解咒。',
'034':'可依元素龙王已定体系、当期实力与战斗／救援专长，补充合理术式及必要参数；不要求完整术式表先写好。称号不授予所有元素法术，也不改变假面许可、生命代价和已成立状态。',
'031':'可合理补充与其背景相符的普通生活技艺和基础自保行为，不把未列清单当作一律不会。没有医师资格或战斗专长的依据，仍不能直接赋予专业治疗、成套战斗能力或原型完整茶点技能；普通行动资格与专业能力分开。'}
for id,note in profile_notes.items():
    path=PROFILES+'CRC_'+id+'.md'
    append(path,'## 2026-10-18：006主持裁定适配\n\n依据UCL_20261018_001—003。本段是已授权主持方法，非原团已有能力清单，也不更改人物当前状态。\n\n'+note)
replace(PROFILES+'CRC_010.md','实际施法、变身和传送须有当期表现支持。','实际施法、变身和传送依当期掌握方向、实力和条件裁定；允许按006主持原则合理补充未列用法。',2)
replace(PROFILES+'CRC_010.md','传送门、集团传送与三项超魔只列标题，不能补未给效果；','传送门、集团传送与三项超魔只列标题，原文未给效果不能冒称原书已确认；本分支是否合理补充另依006主持原则，不由标题自动授予；')
runtime_rel='output/replay_f_review/v1/characters/runtime_cards.jsonl'
runtime=[json.loads(s) for s in current(runtime_rel).splitlines() if s.strip()]
for row in runtime:
    id=row['entity_id'].removeprefix('CRC_')
    if id in profile_notes:
        if id=='010':row['content']['abilities']=[s.replace('实际施法、变身和传送须有当期表现支持。','实际施法、变身和传送依当期掌握方向、实力和条件裁定；允许按006主持原则合理补充未列用法。') for s in row['content']['abilities']]
        row['content']['abilities'].append('006主持适配：'+profile_notes[id])
put(runtime_rel,'\n'.join(json.dumps(r,ensure_ascii=False) for r in runtime))

old_scene='新能力不能抵消已成功毁阵或凭空补回封死退路，后手沿已采用机制。'
new_scene='不能靠补出能力倒改已成功毁阵或已经封路的事实，后手沿已采用机制；若有人按已定体系实际修复阵势或另开通路，须有新的行动、时间与代价，并保留此前毁阵、封路造成的影响。'
replace(WORK+'capital_canyon_battle_playable_draft.md',old_scene,new_scene)
old_gremlin='不临场加无限分身、任意传送或已被切断的逃路。'
new_gremlin='不临场加无限分身或任意传送，也不倒改逃路已被切断的事实；另开通路须以实际行动、条件和代价成立，不能把先前封路写成无效。'
replace(WORK+'capital_gremlin_playable_draft.md',old_gremlin,new_gremlin)
replace(relout('manuals/场景主持补充.md'),old_scene,new_scene)
replace(relout('manuals/场景主持补充.md'),old_gremlin,new_gremlin)
request='再检查一下006里是否还残留与剧情向简化、NPC自由裁定冲突的旧限制，尤其是主持卡、世界书和文风模块之间有没有互相矛盾的地方。'
append(WORK+'user_clarifications.md','## UCL_20261018_003\n\n> '+request+'\n\n按先前UCL_20261018_001—002的实施授权检查006三层一致性，并修正残留冲突。本次仅澄清已授权主持权限、具体条目的白名单措辞及简化方式；不新增具体NPC能力事实、不更改力量体系和角色状态。核查及修复见[runtime_sync_20261018/consistency_review.md](runtime_sync_20261018/consistency_review.md)。')
record={'id':'UCL_20261018_003','source_id':'REF_USER_CLARIFICATIONS','source_kind':'user_scoped_consistency_review_request','recorded_on':'2026-10-18','verbatim':request,'certainty':'confirmed','original_campaign_post_count_contribution':0,'scope':'检查006主持卡、世界书、文风的冲突；修复沿用001—002实施授权，不新增人物能力或历史事实。','runtime_installed':False}
put(WORK+'user_clarifications.jsonl',current(WORK+'user_clarifications.jsonl').rstrip()+'\n'+json.dumps(record,ensure_ascii=False))

book=read(OUT/BOOK);oldbook=copy.deepcopy(book);card=read(OUT/'import/901_帝都主持.card.json')
entry_pairs={
71756156:[('具体招式、层级和消耗只按当下已确认的能力处理，不凭模板概括增添整套技能。','具体招式及必要参数可在当期格斗、气与内力体系及实力范围内合理补充，效果与条件、消耗相称；不要求逐招预列，也不凭模板概括提前授予整套技能或原线后期成长。')],
216568469:[('实际施法、变身和传送须有当期能力资料支持。具体装备、可用魔力与术式范围没有给定时保持未定。','实际施法、变身和传送依当期掌握方向、实力与条件裁定，可补充符合体系的未列用法及必要参数，不要求每一术式事先登记。装备按实际持有；未知魔力不默认满额或零，术式范围与消耗按合理效果限定，真正影响重大结果且不能可靠叙事裁定的缺口再局部补足。')],
164655858:[('具体法术与库存依当期已确定的内容调用。','具体法术可沿当期专长、体系与实力合理补充，效果与条件、代价相称；库存仍按实际持有，不因补术式就凭空取得材料或稀有物品。')],
196551092:[('不能仅凭称号掌握所有元素法术，完整术式和代价须以已确定的资料为准。','不能仅凭称号掌握所有元素法术；可依已定体系、当期实力和战斗／救援专长补充合理术式，明确必要的作用范围、条件与代价，不要求完整法术表先写好。')],
50804080:[('沿已证生活能力，不新增医师资格、战斗技能或全套原型茶点技艺。','可依已有生活背景补充相关普通技艺与基础自保行为；不由空白直接赋予医师资格、专业战斗能力或全套原型茶点技艺。')],
182558169:[('合理新能力不能补回已被破坏的阵势、封死的退路或绕过既定后手条件；','不能靠补出能力倒改已毁阵、已封路的事实或绕过既定后手条件；后续修复阵势或另开道路须有符合体系的新行动、时间与代价，既有成果仍产生实际影响；')],
174980132:[('下位传送消耗1点魔力，','以下动作、DC与逐轮过程为详细结算参照；剧情向可按主持原则概述或简化，不要求逐次完整掷骰。掌握资格、距离、目的地、携带与资源代价仍约束结果，实际消耗照记，不能据简化自动开通无限传送。\n\n下位传送消耗1点魔力，')],
79768996:[('重要补充记入本分支，之后一致使用。','NPC补充不以玩家兑换清单、资源库或程序登记为前提；细打时可按当期体系与强度补必要参数，不临场提升原有实力或改写既定数值。重要补充记入本分支，之后一致使用。'),
('不把叙事结果冒称为程序已保存。','不把叙事结果冒称为程序已保存。具体法术的动作、逐轮检定和DC表供详细结算参考；简化可省略重复过程，已明确的资格、范围、代价与失败条件仍约束结果，实际消耗照记。'),
('普通现场细节与NPC未列能力可按下述原则生成。','普通现场细节与NPC未列能力可按下述原则生成。条目中的“清单不全”“数值未给”只标识资料空白，不一律禁止行动；禁止原型整套移植的约束，以及明确不会、限定来源和已知硬限制仍有效。')]}
profile_ids={71756156:'002',216568469:'010',164655858:'014',196551092:'034',50804080:'031'}
edits=read(STAGE/'projection_edits.json');edit_by_uid={e['uid']:e for e in edits['changes']}
new_refs=[ref(WORK+'user_clarifications.md','## UCL_20261018_003'),ref(hostrel,'## 未列明能力')]
for uid,pairs in entry_pairs.items():
    target=book['entries'][str(uid)]
    for old,new in pairs:assert target['content'].count(old)==1,(uid,old);target['content']=target['content'].replace(old,new)
    if uid in edit_by_uid:e=edit_by_uid[uid];e['content']=target['content'];e['source_refs']+=new_refs
    else:
        e={'uid':uid,'comment':target['comment'],'source_id':target['extensions']['901_replay']['source_id'],'content':target['content'],'source_refs':new_refs.copy(),'period':'重玩T0及当前实际分支的主持裁定方式；不新增既有能力事实或未来事件'}
        edits['changes'].append(e);edit_by_uid[uid]=e
    if uid in profile_ids:e['source_refs'].append(ref(PROFILES+'CRC_'+profile_ids[uid]+'.md','## 2026-10-18：006主持裁定适配'))
    if uid==182558169:e['source_refs'].append(ref(WORK+'capital_canyon_battle_playable_draft.md','## 2026-10-18：'))
edits['consistency_revision']=PATCH
obj('work/replay_research/runtime_sync_20261018/projection_edits.json',edits)

baseline_book=read(BASE/'import/901_帝都入口_M1_20261012.json')
embedded={e['id']:e for e in card['data']['character_book']['entries']};projected=[]
for i,e in enumerate(edits['changes'],1):
    e['source_refs']=[ref(r['path'],r['locator']) if 'locator' in r else r for r in e['source_refs']]
    target=book['entries'][str(e['uid'])]
    metadata={'source_id':e['source_id'],'source_file':'work/replay_research/runtime_sync_20261018/projected_entries.jsonl','source_line':i,'revision':'M1_IMPORT_20261018_006','patch_id':PATCH,'source_refs':e['source_refs'],'baseline_source':baseline_book['entries'][str(e['uid'])]['extensions']['901_replay'],'certainty_rule':'继承事实保留原确定性；新增为用户授权主持方法，不声称原团已记载或人物已获得新能力','temporal_rule':e['period']}
    target['extensions']['901_replay']=metadata;embedded[e['uid']]['content']=target['content'];embedded[e['uid']]['extensions']['901_replay']=copy.deepcopy(metadata)
    projected.append({'id':e['source_id'],'uid':e['uid'],'content':target['content'],'source_refs':e['source_refs'],'baseline_source':metadata['baseline_source'],'period':e['period'],'authorization':'UCL_20261018_002','review_request':'UCL_20261018_003','review_status':'root_scoped_consistency_review','runtime_state':'candidate_not_applied'})
obj('work/replay_research/runtime_sync_20261018/projection_edits.json',edits)
obj(relout(BOOK),book)
host=current(hostrel).split('## 可用提示正文\n\n',1)[1].strip();card['data']['description']=host
card['data']['creator_notes']=card['data']['creator_notes'].replace('及7条世界书内容','及13条世界书内容')+' 006一致性修订1：修复人物能力白名单、NPC参数权限、文风及后续修复行为的冲突。'
card['data']['character_book']['extensions']['901_replay']['patch_id']=PATCH
obj(relout('import/901_帝都主持.card.json'),card)
put(relout('texts/901_主持原则.txt'),host)
sp=read(OUT/'import/文风_prompt.json');sp['data']['prompts'][0]['content']=content
obj(relout('import/文风_prompt.json'),sp);put(relout('texts/901_文风提示.txt'),content)
put('work/replay_research/runtime_sync_20261018/projected_entries.jsonl','\n'.join(json.dumps(e,ensure_ascii=False) for e in projected))
runtime_delta=[json.loads(s) for s in raw(OUT/'characters/runtime_cards.jsonl').splitlines() if s.strip()]
for row in runtime_delta:
    if row['entity_id']=='CRC_031':row['content']['abilities']=[entry_pairs[50804080][0][1]]
put(relout('characters/runtime_cards.jsonl'),'\n'.join(json.dumps(r,ensure_ascii=False) for r in runtime_delta))

# Review only the affected text; output diff before applying any changed runtime file.
diffs=[]
for rel in [hostrel,WORK+'capital_canyon_battle_playable_draft.md',WORK+'capital_gremlin_playable_draft.md']:
    diffs.append(''.join(difflib.unified_diff(raw(ROOT/rel).splitlines(True),pending[rel].splitlines(True),fromfile='before/'+rel,tofile='after/'+rel)))
oldstyle=read(ROOT/style_rel)['modules'][0]['content']
diffs.append(''.join(difflib.unified_diff((oldstyle+'\n').splitlines(True),(content+'\n').splitlines(True),fromfile='006/style',tofile='006-r1/style')))
for uid in entry_pairs:
    diffs.append(''.join(difflib.unified_diff((oldbook['entries'][str(uid)]['content']+'\n').splitlines(True),(book['entries'][str(uid)]['content']+'\n').splitlines(True),fromfile=f'006/{uid}',tofile=f'006-r1/{uid}')))
(STAGE/'consistency_proposed.diff').write_text(''.join(diffs),encoding='utf-8')
if '--apply' not in sys.argv:
    print(json.dumps({'mode':'preview','files_pending':len(pending),'worldbook_entries_adjusted':len(entry_pairs),'total_changed_vs_005':len(edits['changes'])}));sys.exit()
archive=ROOT/'output/replay_tavern/901_剧情向主持_006_手动导入包_20261018.zip'
backup=STAGE/'006_before_consistency_r1.zip'
assert not backup.exists(),'repair already applied or backup exists'
shutil.copyfile(archive,backup)
(STAGE/'consistency_before.json').write_text(json.dumps({'patch_id':PATCH,'package_sha256':sha(backup),'files':[{'path':rel,'sha256':sha(ROOT/rel)} for rel in pending if (ROOT/rel).exists()]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for rel,s in pending.items():(ROOT/rel).write_text(s,encoding='utf-8')
inventory=read(STAGE/'source_inventory.json')
for rel in [PROFILES+'CRC_'+id+'.md' for id in profile_notes]+[runtime_rel]:
    if rel not in inventory['updated_sources']:inventory['updated_sources'].append(rel)
inventory['source_sha256']={rel:sha(ROOT/rel) for rel in inventory['updated_sources']}
inventory['consistency_revision']=PATCH
(STAGE/'source_inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'mode':'applied','files_updated':len(pending),'worldbook_entries_adjusted':len(entry_pairs),'total_changed_vs_005':len(edits['changes'])}))
