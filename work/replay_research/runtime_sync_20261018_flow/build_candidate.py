"""Export inspected 008 content using the existing 007 schema and loading fields."""
from pathlib import Path
import copy, hashlib, json, re, shutil
ROOT=Path(__file__).resolve().parents[3]
STAGE=Path(__file__).resolve().parent
BASE=ROOT/'output/replay_tavern/enemy_xp_20261018_candidate'
OUT=ROOT/'output/replay_tavern/flow_guidance_20261018_candidate'
NAME='901_主持体验补充_M1_20261018'
REV='M1_IMPORT_20261018_008'
ZIP='901_主持体验补充_008_手动导入包_20261018.zip'
AUTH='UCL_20261018_007'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def text(p,s):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(s.rstrip()+'\n',encoding='utf-8')
def write(p,v):text(p,json.dumps(v,ensure_ascii=False,indent=2))
def portable(s):return re.sub(r'\[([^\]]+)\]\(([^\n)]+)\)',r'\1',s)
assert not OUT.exists(),'008 exists; inspect rather than overwrite.'
for p in read(STAGE/'protected_before.json'):assert sha(ROOT/p['path'])==p['sha256'],p['path']
inventory=read(STAGE/'source_inventory.json')
for rel,h in inventory['source_sha256'].items():assert sha(ROOT/rel)==h,rel
edits=read(STAGE/'projection_edits.json')
assert len(edits['changes'])==1 and not edits['additions'] and not edits['source_reanchors']
book=read(BASE/'import/901_帝都敌人与XP_M1_20261018.json')
card=read(BASE/'import/901_帝都主持.card.json')
e=edits['changes'][0]; target=book['entries'][str(e['uid'])]
previous=copy.deepcopy(target['extensions']['901_replay'])
meta={'source_id':e['source_id'],'source_file':'work/replay_research/runtime_sync_20261018_flow/projected_entries.jsonl','source_line':1,'revision':REV,'source_refs':e['source_refs'],'authorization':AUTH,'operation':'update','entry_type':'concept','certainty_rule':'继承原确定性；新增为已采用主持方法，不成为原团事实或已发生事件','temporal_rule':'按真实重玩分支状态主持，不初始化到场、伤势、关系或奖励','baseline_source':previous}
target['content']=e['content'];target['extensions']['901_replay']=meta
inner=next(x for x in card['data']['character_book']['entries'] if x['id']==e['uid'])
inner['content']=e['content'];inner['extensions']['901_replay']=copy.deepcopy(meta)
text(STAGE/'projected_entries.jsonl',json.dumps({**e,'baseline_source':previous,'authorization':AUTH,'review_status':'root_inspected_scoped_diff','runtime_state':'candidate_not_applied'},ensure_ascii=False))
host=(ROOT/'output/replay_f_review/v1/gm/host_rules.md').read_text(encoding='utf-8').split('## 可用提示正文\n\n',1)[1].strip()
data=card['data'];data['description']=host;data['character_version']=REV
data['creator_notes']='008主持体验补充：从007增量加入按需规则讲解、按明确反馈调整篇幅与相称失败后果。136个UID与加载配置保留，只更新通用条目；七类敌人与个人XP不变。同步更新主持正文、文风和单一关联世界书。保持剧情向简化与NPC自由裁定，玩家强度估算后置。手动应用，未安装或调用模型。'
data['extensions']['world']=NAME
data['character_book']['name']=NAME
data['character_book']['description']='008：按需讲解、反馈调整与相称后果；继承007敌人与XP、剧情向简化和NPC合理未列能力。采用不等于事件发生。'
data['character_book']['extensions']['901_replay'].update(revision=REV,source_file=f'output/replay_tavern/flow_guidance_20261018_candidate/import/{NAME}.json',authorization=AUTH)
write(OUT/f'import/{NAME}.json',book)
write(OUT/'import/901_帝都主持.card.json',card)
style=read(BASE/'import/文风_prompt.json')
style['data']['prompts'][0]['content']=read(ROOT/'work/replay_research/gm_style/v1/authoring.json')['modules'][0]['content']
write(OUT/'import/文风_prompt.json',style)
for rel in ['import/901_御临风.persona.json','texts/御临风_Persona.txt','manuals/记忆提交步骤.md','characters/runtime_cards.jsonl','manuals/帝都敌人与XP.md']:
    p=OUT/rel;p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(BASE/rel,p)
text(OUT/'texts/901_主持原则.txt',host)
text(OUT/'texts/901_文风提示.txt',style['data']['prompts'][0]['content'])
text(OUT/'manuals/回合流程.md',portable((ROOT/'output/replay_f_review/v1/gm/turn_flow.md').read_text(encoding='utf-8')))
notes=read(STAGE/'scene_notes.json')
handbook=['# 008场景主持补充','本册在007的场景提示前加入本次18份源稿的适配。三项共通原则按UCL_20261018_007采用：必要时解释行动机制；按明确反馈调整篇幅；失败后果与目标和真实危险相称。保持玩家选择、既定状态、剧情向简化与NPC合理能力。这里只改变主持方法，不预定任何事件；完整短卡与XP沿同目录《帝都敌人与XP.md》。','## 008按场景应用']
for name,note in notes.items():
    body=(ROOT/'work/replay_research'/name).read_text(encoding='utf-8')
    assert note in body,name
    handbook.extend(['### '+body.splitlines()[0].removeprefix('# '),'项目源稿：`work/replay_research/'+name+'`',note])
handbook.extend(['## 沿用007与006的场景提示',(BASE/'manuals/场景主持补充.md').read_text(encoding='utf-8').split('\n',1)[1].strip()])
text(OUT/'manuals/场景主持补充.md','\n\n'.join(handbook))
counts={'total':len(book['entries']),'enabled_constant':sum(e['constant'] and not e['disable'] for e in book['entries'].values()),'enabled_keyword':sum(not e['constant'] and not e['disable'] for e in book['entries'].values()),'disabled':sum(e['disable'] for e in book['entries'].values())}
assert counts=={'total':136,'enabled_constant':6,'enabled_keyword':121,'disabled':9}
text(OUT/'README.md',f'''# 008主持体验补充

2026-10-18，版本`{REV}`，按{AUTH}从007生成。

[完整ZIP](../{ZIP}) · [手动导入说明](手动导入说明.md) · [变更清单](变更清单.md) · [场景主持补充](manuals/场景主持补充.md) · [回合流程](manuals/回合流程.md)

| 用途 | 文件 |
|---|---|
| 独立世界书 | [136条世界书](import/{NAME}.json) |
| 主持卡，内嵌同一世界书 | [901_帝都主持.card.json](import/901_帝都主持.card.json) |
| 文风模块 | [文风_prompt.json](import/文风_prompt.json) |
| 更新现有主持卡的正文 | [901_主持原则.txt](texts/901_主持原则.txt) |
| 首次安装备用Persona | [901_御临风.persona.json](import/901_御临风.persona.json) |
| 继承007的完整敌人短卡与XP | [帝都敌人与XP](manuals/帝都敌人与XP.md) |

本次补入三项：玩家自然语言行动由主持对应规则，只在必要时简短讲解；依用户明确反馈压缩重复过程或展开互动；失败后果依目标和真实危险处理，不把普通失手升级为死亡，也不保证安全或救援。

主持原则、回合流程、文风与18份场景稿同步。世界书只更新901·通用事实与边界，135条正文及其他字段保持007；136个UID与全部加载配置保留，仍为6常驻、121关键词、9禁用。扫描深度、5000预算和非递归设置不变。继承七类敌人构筑、古雷姆林高速及个人XP去重；没有重新估算玩家强度。

应用时同步更新世界书、主持正文和文风。已有分支、Persona、开场与模型配置保留；内嵌与独立书择一。008未覆盖004—007、10月14日实验候选或latest_release.json，也不覆盖实验卡执行钩子。

[一致性说明](一致性检查.md) · [静态核验](verification.json) · [来源与采用记录](../../../work/replay_research/runtime_sync_20261018_flow/README.md)。未自动安装或调用模型；实际请求加载与模型表现尚未验证。玩家强度估算实验继续后置。
''')
text(OUT/'手动导入说明.md',f'''# 手动应用008

先备份当前主持卡、关联书、文风模块和有效分支摘要。008需同步世界书、主持正文与文风，单换其中一项不能完整应用本次补充。

1. 导入`import/{NAME}.json`并关联现有901主持，与007及更早同内容世界书择一使用，不叠加内嵌和独立副本。
2. 继续原聊天时，用`texts/901_主持原则.txt`更新主持卡Description／描述，保留当前分支、开场、Persona与模型配置。有本地定制时按变更清单合并，不覆盖10月14日实验卡的执行钩子。
3. 在Prompt Manager提示词列表导入`import/文风_prompt.json`，更新identifier为`901-gm-style-v1`的原模块，保持原顺序并确认启用。本文件不是完整参数预设，空prompt_order不会自动启用模块；也可粘贴对应文本。
4. 首次安装可直接导入`import/901_帝都主持.card.json`，内嵌同一008世界书。已有正确Persona不必替换，备用文件只供首次恢复。
5. 新增内容属于主持方法。玩家用自然语言行动，不必主动启动规则课；需要说明时才简短解释。快进不跨越新的决定，偏好不传给NPC，失败不改写既定危险和已经取得的成果。
6. 七类敌人和XP沿007使用，完整数据在`manuals/帝都敌人与XP.md`，不整本常驻；最新演出补充见`manuals/场景主持补充.md`，回合处理见`manuals/回合流程.md`。手册供查阅，不要求全部注入提示。

保持真实伤势、消耗、消息、关系和已领XP。回退时恢复旧主持正文、文风与单一关联书，保留真实剧情进展。玩家强度估算实验仍后置；本包没有自动安装或模型实测。
''')
text(OUT/'变更清单.md','''# 008变更清单

依据UCL_20261018_007，继承007，仅补三项主持方法。

- 主持原则：新增按需规则讲解、根据反馈调整场景重点、失败与致命风险三节。
- 回合流程：接住自然语言行动、解释影响选择的机制、按明确反馈调整篇幅，并区分局部失败与已经成立的成果。
- 文风：必要规则说明与人物对白分开；篇幅响应明确反馈；以具体后果呈现失败。
- 18份场景稿：入城、救援、释放、委托、异常发现、收网、善后、悠悠、求治、古雷姆林、峡谷简报／调查／交战／回报、庆典、记忆恢复与修剑、高危讨伐、三线接续。各有本场补充，保留原条件式结构。
- 世界书：UID 79768996的901·通用事实与边界追加三段；其他135条正文与元数据逐项保持007，无新增或删除。136个UID及加载配置不变。

七类敌人的T档、属性、技能、动作、能力与XP基准未改，古雷姆林高速保留。概述／简化／详细可按场景选择；NPC同体系合理未列能力继续有效。教学不强制细打，反馈不强制成功，相称后果不等于免死或必然救援；不因局部失败抹去应得成果。

Persona、开场、Scenario、模型提示配置、既有运行人物副本及007完整敌人手册保持。玩家强度估算实验继续后置，无自动安装、运行引擎改动、实际事件或奖励写入。
''')
text(OUT/'一致性检查.md','''# 008一致性说明

| 项目 | 统一口径 |
|---|---|
| 规则教学与剧情向简化 | 自然语言行动对应机制，必要时讲本次条件；不新增教学骰或强制逐轮流程 |
| 教学与NPC自由裁定 | 同体系合理未列能力有效，只说明当下可知的作用与限制，不泄露秘密或抬档 |
| 明确反馈与玩家控制 | 可压缩已授权重复过程；新的披露、承诺、打法、牺牲仍由玩家选择 |
| 节奏调整与世界因果 | 不把短回复当厌烦，不添危机提神，不将省略演出写成自动办成；真实时间与消息照常推进 |
| 相称失败与致命风险 | 局部失败不自动死亡或全线崩溃；实际致命危险不暗改、削弱或靠保证救援取消 |
| 失败与既有成果／XP | 保留真实证据、救援与已领部分，按007贡献和去重口径结算，不预发未完成成果 |
| 原有构筑 | 七类敌人参数和能力保持，古雷姆林高速不因失败处理被取消 |

结构、文本同步、来源、旧包指纹及内嵌／独立书一致性结果见verification.json。这里不宣称模型行为已验收；没有实际安装、模型调用或玩家强度估算实验。
''')
manifest={'revision':REV,'parent_revision':'M1_IMPORT_20261018_007','authorization':AUTH,'status':'independent_runtime_candidate_not_applied','counts':counts,'preserved_existing_uids':136,'changed_existing_content':1,'unchanged_existing_content':135,'source_locator_refresh_only':0,'added':0,'deleted':0,'existing_loading_changes':[],'source_projection':'work/replay_research/runtime_sync_20261018_flow/projected_entries.jsonl','source_refs':e['source_refs'],'host_body_changed':True,'style_changed':True,'turn_flow_changed':True,'updated_scene_sources':len(notes),'updated_source_and_navigation_files':len(inventory['updated_sources']),'enemy_builds_and_xp_unchanged':True,'baseline':BASE.relative_to(ROOT).as_posix(),'output':OUT.relative_to(ROOT).as_posix(),'projection_sha256':sha(STAGE/'projection_edits.json'),'diff_inspection':'root inspected staged source changes and one-entry worldbook diff before applying/building','runtime_verified':False,'automatic_installation':False,'model_calls':0,'player_strength_experiment':'deferred','files':[{'path':p.relative_to(OUT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(OUT.rglob('*')) if p.is_file()]}
write(OUT/'manifest.json',manifest);write(STAGE/'manifest.json',manifest)
text(STAGE/'README.md','''# 008主持体验补充采用及导出

2026-10-18，按UCL_20261018_007采用按需规则讲解、明确反馈调整与相称失败后果，交付[008候选](../../../output/replay_tavern/flow_guidance_20261018_candidate/README.md)。继承007敌人、XP及剧情向简化、NPC自由裁定；玩家强度估算实验继续后置。

先检查source_changes.diff，应用29份源稿及导航修改（含18份场景稿），再检查proposed.diff并从007生成。世界书仅更新通用条目79768996，135条不变；136个UID及加载字段全部保留。未改原团、真实分支状态、旧导出、运行引擎或安装目录。

source_updates.json保存修改前后文本；source_inventory.json保存来源指纹，并核对122条涉及本次修改文件的继承来源行未位移。scene_notes.json对应各场景末节，随包手册保留007／006提示。projected_entries.jsonl及世界书元数据保存来源和007继承链，采用不等于事件发生。

准备／应用脚本为本轮一次性工具，不重新运行旧006／007脚本。build_candidate.py拒绝覆盖008；verify008.mjs沿用本地SillyTavern结构校验与转换函数，另检查本批文本、来源和旧数据不变，不运行模型或战斗模拟。

[静态核验](verification.json) · [打包核验](package_verification.json) · [旧文件指纹](protected_before.json)。没有独立审核者或实际模型行为验收声明。
''')
print(json.dumps({'revision':REV,'counts':counts,'updated':1,'added':0,'scene_sources':len(notes),'output':str(OUT)},ensure_ascii=False))
