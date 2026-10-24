"""Build authorized 006 from the inspected projection, preserving existing schemas."""
from pathlib import Path
import copy
import hashlib
import json
import shutil
import zipfile

ROOT=Path(__file__).resolve().parents[3]
STAGE=Path(__file__).resolve().parent
BASE=ROOT/'output/replay_tavern/capital_entry_20261012_candidate'
OUT=ROOT/'output/replay_tavern/story_guidance_20261018_candidate'
NAME='901_剧情向主持_M1_20261018'
REV='M1_IMPORT_20261018_006'
ZIP=ROOT/'output/replay_tavern/901_剧情向主持_006_手动导入包_20261018.zip'
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def text(p,s):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(s.rstrip()+'\n',encoding='utf-8')
def write(p,v): text(p,json.dumps(v,ensure_ascii=False,indent=2))

assert not OUT.exists(),'006 already exists; inspect before replacing'
edits=read(STAGE/'projection_edits.json')['changes']
book=read(BASE/'import/901_帝都入口_M1_20261012.json')
oldbook=copy.deepcopy(book)
card=read(BASE/'import/901_帝都主持.card.json')
embedded={e['id']:e for e in card['data']['character_book']['entries']}
projected=[]
for i,e in enumerate(edits,1):
    uid=e['uid']; target=book['entries'][str(uid)]; inner=embedded[uid]
    previous=copy.deepcopy(target['extensions']['901_replay'])
    target['content']=inner['content']=e['content']
    metadata={'source_id':e['source_id'],'source_file':'work/replay_research/runtime_sync_20261018/projected_entries.jsonl','source_line':i,'revision':REV,'source_refs':e['source_refs'],'baseline_source':previous,'certainty_rule':'旧事实保留其确定性；新增为用户授权采用的主持方法，不声称原团事件','temporal_rule':e['period']}
    target['extensions']['901_replay']=copy.deepcopy(metadata)
    inner['extensions']['901_replay']=copy.deepcopy(metadata)
    projected.append({'id':e['source_id'],'uid':uid,'content':e['content'],'source_refs':e['source_refs'],'baseline_source':previous,'period':e['period'],'authorization':'UCL_20261018_002','review_status':'root_inspected_scoped_diff','runtime_state':'candidate_not_applied'})

host_rel='output/replay_f_review/v1/gm/host_rules.md'
host=(ROOT/host_rel).read_text(encoding='utf-8').split('## 可用提示正文\n\n',1)[1].strip()
data=card['data'];data['description']=host;data['character_version']=REV
data['creator_notes']='006剧情向主持候选：在005实际文件基础上同步主持原则、文风及7条世界书内容。130个UID与加载配置保留，旧分支不重置。需同时更新主持正文和文风；独立书与内嵌书择一使用。手动应用，未安装或复跑模型；未合并10月14日实验JS/MVU执行层，也不是全部后续作者资料的重新导出。'
data['extensions']['world']=NAME
data['character_book']['name']=NAME
data['character_book']['description']='006：剧情向可概述／简化战斗、NPC同体系自由裁定、T0—T8怪物参照、节点／挑战／击杀XP与场景表现；条件式场景不初始化为已经发生。'
data['character_book']['extensions']['901_replay'].update(revision=REV,source_file=f'output/replay_tavern/story_guidance_20261018_candidate/import/{NAME}.json')
write(OUT/f'import/{NAME}.json',book)
write(OUT/'import/901_帝都主持.card.json',card)
style=read(BASE/'import/文风_prompt.json')
style_source=read(ROOT/'work/replay_research/gm_style/v1/authoring.json')
style['data']['prompts'][0]['content']=style_source['modules'][0]['content']
write(OUT/'import/文风_prompt.json',style)
for rel in ['import/901_御临风.persona.json','texts/御临风_Persona.txt','manuals/记忆提交步骤.md','characters/runtime_cards.jsonl']:
    dest=OUT/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(BASE/rel,dest)
text(OUT/'texts/901_主持原则.txt',host)
text(OUT/'texts/901_文风提示.txt',style['data']['prompts'][0]['content'])
text(STAGE/'projected_entries.jsonl','\n'.join(json.dumps(e,ensure_ascii=False) for e in projected))

inventory=read(STAGE/'source_inventory.json')
events='output/replay_f_review/v1/gm/events.md'
if events not in inventory['updated_sources']:inventory['updated_sources'].append(events)
inventory['source_sha256']={rel:sha(ROOT/rel) for rel in inventory['updated_sources']}
write(STAGE/'source_inventory.json',inventory)
scenes=[p for p in inventory['updated_sources'] if p.endswith('_playable_draft.md')]
assert len(scenes)==16
handbook=['# 006场景主持补充','本册汇集16份现有场景稿本轮新增的演出与裁定段落，供按当前场景取用。它不是自动加载脚本，也不替代原稿的初始条件、消息边界与后果。完整场景稿仍在项目work/replay_research/；源稿路径列于各节。','世界书已将共通原则及帝都、医馆、协会、峡谷、节庆、诅咒相关提示投影到已有条目；其他场景继续由共通原则及本册补充支持，不将16份全文同时常驻。']
for rel in scenes:
    body=(ROOT/rel).read_text(encoding='utf-8').split('## 2026-10-18：',1)[1]
    title,body=body.split('\n',1)
    body=body.replace('采用[场景共通原则](capital_event_dependencies.md#2026-10-18st指南融入后的场景使用原则)。','采用006主持原则与场景共通原则。')
    handbook.extend(['## '+title,'源稿：`'+rel+'`',body.strip()])
text(OUT/'manuals/场景主持补充.md','\n\n'.join(handbook))

text(OUT/'README.md',f'''# 006剧情向主持候选

2026-10-18，版本`{REV}`。已先更新主持原则、文风与16份场景稿，再从005实际文件生成本包；用户授权见UCL_20261018_001—002。

[手动导入说明](手动导入说明.md) · [变更清单](变更清单.md) · [16场景主持补充](manuals/场景主持补充.md) · [完整ZIP](../{ZIP.name})

| 用途 | 文件 |
|---|---|
| 独立世界书 | [130条世界书](import/{NAME}.json) |
| 主持卡，内嵌同一世界书 | [901_帝都主持.card.json](import/901_帝都主持.card.json) |
| 文风提示模块 | [文风_prompt.json](import/文风_prompt.json) |
| 主持正文，便于更新已有卡 | [901_主持原则.txt](texts/901_主持原则.txt) |
| 御临风Persona，首次安装备用 | [901_御临风.persona.json](import/901_御临风.persona.json) |

这次需要同时更新世界书、主持正文和文风。已有聊天、有效分支、Persona及模型设置继续使用。独立书与内嵌书择一，避免同内容重复注入。

内容支持：剧情向概述／简化／详细裁定；NPC同体系补充能力；T0—T8怪物定位；节点、挑战与有一定难度击杀XP；感官细节、人物关系、舒缓节奏与可选道具。简化不代替玩家决定、不改变已保留结果。

沿用005的130个UID，6常驻、115关键词、9禁用；7条正文更新，其余123条不变。005实际主持卡及文风的累计修订已合并，不退回旧F3正文。人物细节沿005，不整批同步此后全部作者档案。`characters/runtime_cards.jsonl`仍是005七位人物的增量副本，未声称NPC新稿均已导出。

004、005和10月14日隔离候选保留；latest_release.json仍指原保留基线。本包未自动安装、未调用模型，不含新增JS/MVU自动执行功能；数值规则程序的实际就绪情况另见原实验目录。

[来源、授权与构建记录](../../../work/replay_research/runtime_sync_20261018/README.md) · [静态核验](verification.json)。核验不等同实际模型行为验收。
''')
text(OUT/'手动导入说明.md',f'''# 手动应用006

006包含主持行为修订，仅替换世界书会留下旧主持限制。先保留当前主持卡、提示模块、关联书和有效分支摘要的副本。

1. 在世界书管理中导入`import/{NAME}.json`，让现有901主持关联此书。同内容的004／005和006不要同时加载；独立书与内嵌书择一。
2. 继续原聊天时，将`texts/901_主持原则.txt`替换到现有主持卡Description／角色描述。保留已调整的开场、当前分支、Persona、模型参数与记忆。若当前卡另有本地定制，按本包变更清单合并；本包来自005普通主持卡，不用于覆盖10月14日带执行钩子的实验卡。
3. 将`import/文风_prompt.json`导入Prompt Manager的提示词列表入口，更新原identifier为`901-gm-style-v1`的模块；保留既有顺序并确认该模块已插入、启用。它不是完整模型参数预设，空prompt_order不代替启用操作。也可粘贴`texts/901_文风提示.txt`更新已有模块。
4. 首次安装可在角色管理导入`import/901_帝都主持.card.json`，其中已内嵌同一006世界书；不要再重复挂独立副本。Persona备份用Persona恢复入口，已有正确Persona无需恢复。
5. `manuals/场景主持补充.md`按当前场景取用，不整本常驻。世界书关键词触发不证明人物已到场、已经获知秘密或未来场景已经发生。不要批量开启禁用条目。
6. 继续已保留聊天，不将进度重置到T0。临场补出的重要NPC能力及条件、实际结果和XP发放情况记入当前分支摘要；没有实际执行程序时不声称MVU或自动账本已更新。

回退时恢复原主持正文、原文风和单一关联书，保留真实聊天进展。具体文件格式已用本地SillyTavern读取代码静态核对，未自动导入、启动服务或调用模型。
''')
rows='\n'.join(f"| {e['uid']} | {e['comment']} | 主持方法与本场景适配；旧事实和触发配置保留 |" for e in edits)
text(OUT/'变更清单.md',f'''# 006变更清单

先完成27份既有源文件的本轮修订（包括16场景稿与用户采用记录），再生成006。来源详见项目`work/replay_research/runtime_sync_20261018/source_inventory.json`，逐条差异见同目录`proposed.diff`。

- 主持原则：放宽概述／简化战斗、未列NPC能力与局部裁定，保留体系、代价、连续性和玩家控制。
- 怪物与遭遇：采用项目T0—T8工作阶梯，RE只辅助能力组合；人数、地形和准备另计。
- 奖励：节点、挑战与有一定难度击杀均可给XP；简化不减奖，同一贡献不重复发，成长费用沿现行规则。
- 文风：可探索的空间与感官、人物互动和舒缓时刻、道具按需；不强迫NPC数量减少。
- 场景：16份稿分别补充现场表现、节奏简化、能力运用和奖励依据；古雷姆林稿中的追踪能力一律禁补条款改为实际条件约束。

| UID | 条目 | 本轮变化 |
|---|---|---|
{rows}

130条无新增删除，123条与005完全一致。6常驻、115关键词、9禁用；关键词、深度、顺序、概率及禁用状态保持。主持正文和文风发生变化，Persona、开场与Scenario沿005。新增文字是主持方法与条件式提示，不把采用方案写成原团或重玩已发生事件。

RE第一部分的估算公式留待实验；第二部分结合本项目阶梯适配；第三部分改为901XP；第四部分只取遭遇难度；第五、六部分不引入；第七部分吸收运行、剧情向、感官与开团经验。未生成固定怪物数值价表、未采用杀死PC后复活回收奖励等手段。
''')

changed={str(e['uid']) for e in edits}
assert set(book['entries'])==set(oldbook['entries'])
for uid,e in book['entries'].items():
    if uid not in changed:assert e==oldbook['entries'][uid]
    else:
        a,b=copy.deepcopy(e),copy.deepcopy(oldbook['entries'][uid])
        for x in (a,b):x.pop('content');x['extensions'].pop('901_replay')
        assert a==b,('loading drift',uid)
for p in read(STAGE/'protected_before.json'):assert sha(ROOT/p['path'])==p['sha256'],p['path']
counts={'total':len(book['entries']),'enabled_constant':sum(e['constant'] and not e['disable'] for e in book['entries'].values()),'enabled_keyword':sum(not e['constant'] and not e['disable'] for e in book['entries'].values()),'disabled':sum(e['disable'] for e in book['entries'].values())}
manifest={'revision':REV,'parent_revision':'M1_IMPORT_20261012_005','authorization':'UCL_20261018_002','status':'independent_runtime_candidate_not_applied','counts':counts,'changed_content':len(edits),'uids_preserved':130,'added':0,'deleted':0,'loading_changes':[],'host_body_changed':True,'style_changed':True,'persona_unchanged':True,'opening_unchanged':True,'updated_scene_sources':16,'baseline':BASE.relative_to(ROOT).as_posix(),'output':OUT.relative_to(ROOT).as_posix(),'baseline_actual_files':[{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)} for p in (BASE/'import').glob('*.json')],'projection_sha256':sha(STAGE/'projection_edits.json'),'diff_inspection':'root inspected seven-entry proposed.diff before build; no independent reviewer claimed','runtime_verified':False,'automatic_installation':False,'model_calls':0,'files':[{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size} for p in (OUT/'import').glob('*.json')]}
write(STAGE/'manifest.json',manifest)
print(json.dumps({'revision':REV,'counts':counts,'sources_updated':len(inventory['updated_sources']),'output':OUT.relative_to(ROOT).as_posix()}))
