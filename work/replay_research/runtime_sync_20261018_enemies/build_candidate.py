"""Build 007 from inspected content, using the existing 006 ST schema unchanged."""
from pathlib import Path
import copy
import hashlib
import json
import re
import shutil

ROOT=Path(__file__).resolve().parents[3]
STAGE=Path(__file__).resolve().parent
BASE=ROOT/'output/replay_tavern/story_guidance_20261018_candidate'
OUT=ROOT/'output/replay_tavern/enemy_xp_20261018_candidate'
NAME='901_帝都敌人与XP_M1_20261018'
REV='M1_IMPORT_20261018_007'
ZIP_NAME='901_帝都敌人与XP_007_手动导入包_20261018.zip'
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def text(p,s):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(s.rstrip()+'\n',encoding='utf-8')
def write(p,v): text(p,json.dumps(v,ensure_ascii=False,indent=2))
def portable(s): return re.sub(r'\[([^\]]+)\]\(([^\n)]+)\)',r'\1',s)

assert not OUT.exists(),'007 output already exists; inspect instead of overwriting.'
edits=read(STAGE/'projection_edits.json')
book=read(BASE/'import/901_剧情向主持_M1_20261018.json')
oldbook=copy.deepcopy(book)
card=read(BASE/'import/901_帝都主持.card.json')
oldcard=copy.deepcopy(card)
inner={e['id']:e for e in card['data']['character_book']['entries']}
projected=[]
for i,e in enumerate(edits['changes']+edits['additions']+edits['source_reanchors'],1):
    uid=e['uid']
    if e['operation']=='add':
        target=copy.deepcopy(oldbook['entries']['182558169'])
        embedded=copy.deepcopy(inner[182558169])
        target.update(uid=uid,key=e['keys'],comment=e['comment'])
        embedded.update(id=uid,keys=e['keys'],comment=e['comment'])
        previous=None
        book['entries'][str(uid)]=target
        card['data']['character_book']['entries'].append(embedded)
        inner[uid]=embedded
    else:
        target=book['entries'][str(uid)];embedded=inner[uid]
        previous=copy.deepcopy(target['extensions']['901_replay'])
    target['content']=embedded['content']=e['content']
    metadata={'source_id':e['source_id'],'source_file':'work/replay_research/runtime_sync_20261018_enemies/projected_entries.jsonl','source_line':i,'revision':REV,'source_refs':e['source_refs'],'authorization':'UCL_20261018_006','operation':e['operation'],'certainty_rule':'继承内容保留原确定性；新增为已采用作者构筑和场景XP基准，不冒充原团记录或已发生事件','temporal_rule':'重玩帝都适用阶段，按真实分支状态取用，不重置到场、伤势、控制、消耗与奖励'}
    if previous is not None:metadata['baseline_source']=previous
    if 'entry_type' in e:metadata['entry_type']=e['entry_type']
    target['extensions']['901_replay']=copy.deepcopy(metadata)
    embedded['extensions']['901_replay']=copy.deepcopy(metadata)
    projected.append({**e,'baseline_source':previous,'authorization':'UCL_20261018_006','review_status':'root_inspected_scoped_diff','runtime_state':'candidate_not_applied'})

host=(ROOT/'output/replay_f_review/v1/gm/host_rules.md').read_text(encoding='utf-8').split('## 可用提示正文\n\n',1)[1].strip()
data=card['data']
data['description']=host
data['character_version']=REV
data['creator_notes']='007帝都敌人与XP：在006一致性修订版上采用七类短卡与个人XP方案。原130个UID和加载配置保留，新增6个具体名称触发条目；2条旧正文更新。短卡不迫使细打、不穷尽NPC能力，保持剧情向简化与实际代价、结果。同步更新主持正文与文风；独立和内嵌世界书择一。手动应用，未安装或调用模型；玩家强度估算后置。'
data['extensions']['world']=NAME
data['character_book']['name']=NAME
data['character_book']['description']='007：七类帝都敌人、古雷姆林常态高速、个人XP基准及去重；剧情向概述／简化与NPC合理能力补充继续有效。条件式场景不初始化为已发生。'
data['character_book']['extensions']['901_replay'].update(revision=REV,source_file=f'output/replay_tavern/enemy_xp_20261018_candidate/import/{NAME}.json',authorization='UCL_20261018_006')
write(OUT/f'import/{NAME}.json',book)
write(OUT/'import/901_帝都主持.card.json',card)
style=read(BASE/'import/文风_prompt.json')
style['data']['prompts'][0]['content']=read(ROOT/'work/replay_research/gm_style/v1/authoring.json')['modules'][0]['content']
write(OUT/'import/文风_prompt.json',style)
for rel in ['import/901_御临风.persona.json','texts/御临风_Persona.txt','manuals/记忆提交步骤.md','characters/runtime_cards.jsonl']:
    p=OUT/rel;p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(BASE/rel,p)
text(OUT/'texts/901_主持原则.txt',host)
text(OUT/'texts/901_文风提示.txt',style['data']['prompts'][0]['content'])
text(STAGE/'projected_entries.jsonl','\n'.join(json.dumps(e,ensure_ascii=False) for e in projected))

full=(ROOT/'work/replay_research/capital_enemy_builds_rewards_draft.md').read_text(encoding='utf-8')
text(OUT/'manuals/帝都敌人与XP.md',portable(full)+'\n\n完整来源定位与授权保存在同包manifest.json及项目work/replay_research/runtime_sync_20261018_enemies/；本册按场景查阅，不应整本常驻。')
scenes=['capital_high_risk_hunt_draft.md','capital_rescue_playable_draft.md','capital_intervention_playable_draft.md','capital_arrays_hypnosis_rules_draft.md','capital_gremlin_playable_draft.md','capital_canyon_investigation_playable_draft.md','capital_canyon_battle_playable_draft.md']
handbook=['# 007场景主持补充','本册延续006的16场景演出提示，增加本次七份场景／机制稿的构筑接入。完整数值见同目录《帝都敌人与XP.md》。短卡按当前实际场景取用，支持概述／简化，不增设必战、必杀或预发奖励。','## 本批场景接入']
for name in scenes:
    body=(ROOT/'work/replay_research'/name).read_text(encoding='utf-8')
    paragraph=next(x for x in body.split('\n\n') if 'capital_enemy_builds_rewards_draft.md' in x)
    handbook.extend(['### '+body.splitlines()[0].removeprefix('# '),'项目源稿：`work/replay_research/'+name+'`',portable(paragraph)])
prior=(BASE/'manuals/场景主持补充.md').read_text(encoding='utf-8')
handbook.extend(['## 沿用的场景演出与裁定',prior.split('\n',1)[1].strip()])
text(OUT/'manuals/场景主持补充.md','\n\n'.join(handbook))

changed={str(e['uid']) for e in edits['changes']}
reanchored={str(e['uid']) for e in edits['source_reanchors']}
added={str(e['uid']) for e in edits['additions']}
def clean(x):
    y=copy.deepcopy(x);y.pop('content');y['extensions'].pop('901_replay');return y
for uid,e in oldbook['entries'].items():
    assert clean(book['entries'][uid])==clean(e),('loading drift',uid)
    if uid not in changed:assert book['entries'][uid]['content']==e['content']
    if uid not in changed|reanchored:assert book['entries'][uid]==e
for p in read(STAGE/'protected_before.json'):assert sha(ROOT/p['path'])==p['sha256'],p['path']
counts={'total':len(book['entries']),'enabled_constant':sum(e['constant'] and not e['disable'] for e in book['entries'].values()),'enabled_keyword':sum(not e['constant'] and not e['disable'] for e in book['entries'].values()),'disabled':sum(e['disable'] for e in book['entries'].values())}
assert counts=={'total':136,'enabled_constant':6,'enabled_keyword':121,'disabled':9}
rows='\n'.join(f"| {e['uid']} | {e['comment']} | {'／'.join(e['keys'])} |" for e in edits['additions'])

text(OUT/'README.md',f'''# 007帝都敌人与XP

2026-10-18，版本`{REV}`。按UCL_20261018_006采用七类敌人构筑与XP方案，并从006一致性修订版增量生成。

[完整ZIP](../{ZIP_NAME}) · [手动导入说明](手动导入说明.md) · [变更清单](变更清单.md) · [敌人短卡与XP全文](manuals/帝都敌人与XP.md) · [场景主持补充](manuals/场景主持补充.md)

| 用途 | 文件 |
|---|---|
| 独立世界书 | [136条世界书](import/{NAME}.json) |
| 主持卡 内嵌同一世界书 | [901_帝都主持.card.json](import/901_帝都主持.card.json) |
| 文风模块 | [文风_prompt.json](import/文风_prompt.json) |
| 更新已有卡的主持正文 | [901_主持原则.txt](texts/901_主持原则.txt) |
| 首次安装备用Persona | [901_御临风.persona.json](import/901_御临风.persona.json) |

原130个UID及加载配置保留，2条正文更新，9条仅刷新来源定位；新增6个关键词条目覆盖七类敌人。现为6常驻、121关键词、9禁用，原扫描深度、5000预算及非递归设置保持。完整数值不全放常驻；单条新增内容约450—900个Unicode字符，此数不是token测量，也不保证某次真实请求全部加载。

城卫T1、老兵T2、安装者T1战斗定位、石像T3、催眠魔兽T3、Chuul T4、古雷姆林常态T5。个人XP按实际贡献与成果采用1—5场景基准，独立阵路挑战1—3；同一成果不重发，简化／准备充分不自动减奖。古雷姆林保留高速，用人物目的与实际局势决定撤离。

须同步更新世界书、主持正文和文风。已有分支、Persona、开场与模型配置保留；独立与内嵌书择一。006与更早版本及10月14日实验候选未覆盖，latest_release.json仍指原保留基线。本包不覆盖带JS/MVU执行钩子的实验卡。

短卡已采用不等于事件已经发生、NPC到场或满血、奖励已发。保持概述／简化／详细三种主持方式及同体系NPC自由裁定。玩家强度估算实验继续后置。

[静态核验](verification.json) · [来源与采用记录](../../../work/replay_research/runtime_sync_20261018_enemies/README.md)。未自动安装、调用模型或重演战斗，静态检查不是实际运行验收。
''')
text(OUT/'手动导入说明.md',f'''# 手动应用007

先备份当前主持卡、关联书、文风模块和有效分支摘要。007包含新的主持与奖励口径，只换世界书会留下旧限制。

1. 世界书管理导入`import/{NAME}.json`并关联现有901主持。与同内容006及更早书择一使用；内嵌与独立副本也择一，避免重复加载。
2. 继续原聊天时用`texts/901_主持原则.txt`更新主持卡Description／描述，保留开场、当前分支、Persona及模型配置。若有本地定制按变更清单合并，不覆盖10月14日实验卡的执行钩子。
3. 在Prompt Manager的提示词列表入口导入`import/文风_prompt.json`，更新原identifier为`901-gm-style-v1`的模块，保持既有顺序并确认启用。此文件不是完整参数预设；空prompt_order不会自动启用模块。也可粘贴对应文本。
4. 首次安装可导入`import/901_帝都主持.card.json`，其中已内嵌同一007世界书。Persona备份只用于首次恢复，已有正确Persona不用替换。
5. 六条新内容按具体名称触发：钟塔维修间／雪老救援／达卡斯部属，法阵安装者／帝都近郊峡谷，Chuul／旧涵洞，催眠魔兽，石像魔偶／试炼洞穴，古雷姆林。加载是主持参考，不代表已到场或玩家已经知情。不要批量开启禁用条目；需要完整数值时按场景查阅`manuals/帝都敌人与XP.md`，不整本常驻。
6. 延续真实聊天状态。概述与细打切换不重置伤势、魔力、控制或阵路。XP只在确有贡献与结果后记入，记录已领取的分项，节点清算不重复发同一成果；没有程序保存读回时不声称自动账本已更新。

回退时恢复旧主持正文、文风与单一关联书，保留真实剧情进展。玩家强度估算实验仍后置；本包未自动安装或调用模型。
''')
text(OUT/'变更清单.md',f'''# 007变更清单

基于006一致性修订版，采用UCL_20261018_006；七类短卡的属性、技能、动作、范围、消耗、状态例外及XP方案保持已审版本。

- 主持正文、回合流程、记忆与场景共通原则：短卡不迫使细打、不变成NPC能力白名单；按个人贡献与成果发XP，保留同一成果已领部分。
- 七份相关场景／机制稿、古雷姆林人物档与Chuul旧准备入口：采用状态更新；已经补齐的催眠数值不再视为未知；高速不轻易用于退场，实际限制保持。
- 文风：用可感知效果呈现能力差异，数值不变成每轮报表；只在发奖时简述事项、数额与已领部分。
- 旧世界书正文更新：901·通用事实与边界、人物·凌迟。9条其他正文完全保留，仅将来源定位对齐当前源文件；原来源链仍保存。原130个UID及加载字段全部保留，128条旧正文未变。

| 新UID | 条目 | 触发词 |
|---|---|---|
{rows}

新增条目继承现有关键词条目的扫描、顺序、概率、非递归及预算设置，未增加常驻数。共136条：6常驻、121关键词、9禁用。完整技能短卡在场景手册，古雷姆林世界条目保留身份、世界位置及必要能力参照。

Persona、开场、Scenario、模型提示配置及006七人运行副本保持；旧副本不因此代表全部人物新档。004／005／006、10月14日候选和机器基线入口未覆盖。未合并无关地区设定、开发引擎、实际发XP或进行模型测试。
''')
text(OUT/'一致性检查.md','''# 007一致性说明

本轮检查采用稿、主持正文、文风、相关场景与世界书投影之间的实际冲突：

| 项目 | 统一口径 |
|---|---|
| 有完整数值是否必须逐轮战斗 | 否。支持概述、简化、详细；范围、行动机会、实际代价和结果保持 |
| 短卡未写的能力是否一律禁止 | 否。可沿已定体系、专长和实力补足；不抬高已定参数或抹去成功准备 |
| 简化能否裁定伤害 | 可处理已声明行动的客观损害，不能替玩家选择主动承伤或新打法 |
| 高速与剧情编排 | 高速在交锋中实际生效，人物目的影响撤离时机；不轻易退场，不临时关闭或保证逃脱 |
| XP是否按T档或人头发放 | 否。采用场景基准与个人实质贡献，同一成果只领一次 |
| 简化、克制、准备与支援 | 不自动减奖，纯旁观与补刀不追加 |
| 催眠数值是否仍未知 | 魔兽及指定守卫必要字段已采用；其余人逐个按实际，旧影响不随施术者死亡解除 |
| 采用是否产生事件与余额 | 否。当前分支的实际到场、伤势、消耗、控制与已领取奖励优先 |

静态结构、内嵌一致性、来源定位、文本同步及旧包指纹的实测结果见verification.json。没有实际安装或模型行为验证；玩家强度估算实验继续后置。
''')
manifest={'revision':REV,'parent_revision':'M1_IMPORT_20261018_006','authorization':'UCL_20261018_006','status':'independent_runtime_candidate_not_applied','counts':counts,'preserved_existing_uids':130,'changed_existing_content':len(changed),'unchanged_existing_content':130-len(changed),'source_locator_refresh_only':len(reanchored),'added':len(added),'deleted':0,'existing_loading_changes':[],'new_uid_policy':'SHA256 of stable source ID, first 7 hex digits; collision checked against parent','new_entry_loading_template_uid':182558169,'source_file':'work/replay_research/capital_enemy_builds_rewards_draft.md','source_projection':'work/replay_research/runtime_sync_20261018_enemies/projected_entries.jsonl','new_entries':[{'uid':e['uid'],'source_id':e['source_id'],'type':e['entry_type'],'comment':e['comment'],'keys':e['keys'],'source_refs':e['source_refs']} for e in edits['additions']],'host_body_changed':True,'style_changed':True,'persona_unchanged':True,'opening_unchanged':True,'updated_scene_or_mechanism_sources':7,'updated_author_sources':20,'baseline':BASE.relative_to(ROOT).as_posix(),'output':OUT.relative_to(ROOT).as_posix(),'projection_sha256':sha(STAGE/'projection_edits.json'),'diff_inspection':'root inspected source_changes.diff and eight-entry proposed.diff before applying/building','runtime_verified':False,'automatic_installation':False,'model_calls':0,'player_strength_experiment':'deferred','files':[{'path':p.relative_to(OUT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(OUT.rglob('*')) if p.is_file()]}
write(STAGE/'manifest.json',manifest)
write(OUT/'manifest.json',manifest)
text(STAGE/'README.md',f'''# 007帝都敌人与XP采用及导出

2026-10-18，按UCL_20261018_006整版采用[七类敌人与XP](../capital_enemy_builds_rewards_draft.md)，交付[007候选](../../../output/replay_tavern/enemy_xp_20261018_candidate/README.md)。作者设计与实际事件、实际奖励分开，玩家强度估算后置。

本轮先检查source_changes.diff，应用20份已有源稿修订，再检查proposed.diff并从006一致性修订版生成。2条旧正文更新、6条新增、9条仅刷新来源行号；原130个UID与加载字段保留，现136条、6常驻、121关键词、9禁用。

source_updates.json保存本次源稿前后内容；source_inventory.json保存当前来源指纹；projected_entries.jsonl与每条901_replay元数据保存来源、采用与006继承链。新增UID来自稳定来源ID散列并检查无冲突，未通过第三方forge往返重排旧UID。完整短卡和场景补充随包，新增角色条目不携完整技能列表。

integrate_sources.py是一轮性的准备／应用脚本，不重复执行；prepare_projection.py只准备差异；build_candidate.py拒绝覆盖已存在的007。verify007.mjs使用本地SillyTavern校验器和转换函数做静态核对。没有独立审核者或模型行为验收声明，不自动安装、修改引擎或发放XP。

[核验](verification.json) · [打包核验](package_verification.json) · [受保护文件指纹](protected_before.json)。旧004／005／006与实验候选保留；latest_release.json不变。
''')
print(json.dumps({'revision':REV,'counts':counts,'updated':len(changed),'added':len(added),'metadata_only':len(reanchored),'output':str(OUT)},ensure_ascii=False))
