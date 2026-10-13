"""Apply reviewed 005 projection to a separate copy using the existing 004 schema."""
from pathlib import Path
import copy
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parents[3]
STAGE = Path(__file__).resolve().parent
BASE = ROOT / 'output/replay_tavern/world_sync_20261008_candidate'
OUT = ROOT / 'output/replay_tavern/capital_entry_20261012_candidate'
REV = 'M1_IMPORT_20261012_005'
NAME = '901_帝都入口_M1_20261012'

def read(p): return json.loads(p.read_text(encoding='utf-8'))
def write(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

edits = read(STAGE/'projection_edits.json')
review = read(STAGE/'canon_review.json')
assert review['result']=='PASS' and review['projection_sha256']==sha(STAGE/'projection_edits.json')
assert all(c['review_decision']=='PASS' for c in review['claims'])
book=read(BASE/'import/901_帝都重玩_M1_20261008.json')
card=read(BASE/'import/901_帝都主持.card.json')
oldbook=copy.deepcopy(book)
embedded={e['id']:e for e in card['data']['character_book']['entries']}
projected=[]
for i,e in enumerate(edits['changes'],1):
    uid=e['uid']; target=book['entries'][str(uid)]; inner=embedded[uid]
    prev=copy.deepcopy(target['extensions']['901_replay'])
    if 'content' in e:
        target['content']=inner['content']=e['content']
    if 'disable' in e:
        target['disable']=e['disable']; inner['enabled']=not e['disable']
    metadata={'source_id':e['source_id'], 'source_file':'work/replay_research/runtime_sync_20261012/projected_entries.jsonl',
              'source_line':i,'revision':REV,'source_refs':e['source_refs'],'baseline_source':prev,
              'certainty_rule':'原有事实、采用设计与人物证言按正文分别有效；不初始化未来事件',
              'temporal_rule':'T0基线与条件式行动分开；当前分支按实际事件更新'}
    target['extensions']['901_replay']=copy.deepcopy(metadata)
    inner['extensions']['901_replay']=copy.deepcopy(metadata)
    projected.append({'id':e['source_id'],'uid':uid,'content':target['content'],'enabled':not target['disable'],
                      'source_refs':e['source_refs'],'baseline_source':prev,'period':e['period'],
                      'review_status':'PASS_in_scope','runtime_state':'candidate_not_applied'})
data=card['data']; data['character_version']=REV
data['creator_notes']='005帝都入口增量候选；004基线130个UID保留，14条正文更新，谢尔伦仅关闭。主持正文、开场、Persona及文风沿用。只关联一份世界书；按手动说明应用，不重置聊天。'
data['extensions']['world']=NAME
data['character_book']['name']=NAME
data['character_book']['description']='005帝都入口候选：城门、医馆、协会、右近介入与七位NPC采用内容；原UID与加载结构保留，谢尔伦按本轮范围关闭。未初始化未来行动或奖励。'
data['character_book']['extensions']['901_replay'].update(revision=REV,source_file=f'output/replay_tavern/capital_entry_20261012_candidate/import/{NAME}.json')
write(OUT/f'import/{NAME}.json',book)
write(OUT/'import/901_帝都主持.card.json',card)
for rel in ['import/901_御临风.persona.json','import/文风_prompt.json','texts/御临风_Persona.txt','texts/901_文风提示.txt','manuals/记忆提交步骤.md']:
    dest=OUT/rel; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(BASE/rel,dest)
(OUT/'characters').mkdir(parents=True,exist_ok=True)
shutil.copyfile(STAGE/'runtime_cards.jsonl',OUT/'characters/runtime_cards.jsonl')
(STAGE/'projected_entries.jsonl').write_text(''.join(json.dumps(e,ensure_ascii=False)+'\n' for e in projected),encoding='utf-8')

changed={str(e['uid']) for e in edits['changes']}
assert set(book['entries'])==set(oldbook['entries'])
for uid, e in book['entries'].items():
    if uid not in changed: assert e==oldbook['entries'][uid]
    else:
        a,b=copy.deepcopy(e),copy.deepcopy(oldbook['entries'][uid])
        for t in (a,b):
            t.pop('content'); t['extensions'].pop('901_replay')
            if uid=='259268599': t.pop('disable')
        assert a==b, ('loading drift',uid)
for f in read(STAGE/'protected_before.json'): assert sha(ROOT/f['path'])==f['sha256'],f['path']
counts={'total':len(book['entries']), 'enabled_constant':sum(e['constant'] and not e['disable'] for e in book['entries'].values()),
        'enabled_keyword':sum(not e['constant'] and not e['disable'] for e in book['entries'].values()),
        'disabled':sum(e['disable'] for e in book['entries'].values())}
write(STAGE/'manifest.json',{'revision':REV,'parent_revision':'M1_IMPORT_20261008_004','authorization':'UCL_20261012_070',
      'status':'independent_runtime_candidate_not_applied','counts':counts,'changed_content':14,'scope_disabled_uid':259268599,
      'added':0,'uids_preserved':130,'loading_changes':[{'uid':259268599,'disable':True,'reason':'explicit_user_scope_exclusion'}],
      'host_body_unchanged':True,'persona_unchanged':True,'style_unchanged':True,
      'baseline':BASE.relative_to(ROOT).as_posix(),'output':OUT.relative_to(ROOT).as_posix(),
      'projection_file':(STAGE/'projection_edits.json').relative_to(ROOT).as_posix(),
      'character_projection':'characters/runtime_cards.jsonl (seven-row delta, not independent chat cards)',
      'runtime_verified':False,'automatic_installation':False,'model_calls':0,
      'skills_used':['local tavern-cards: partial editing/compression/revision','901-canon-review: only projected claims'],
      'forge_executed':False,'forge_reason':'existing compatibility assessment: full roundtrip changes UID/loading/provenance; preserve 004 path',
      'files':[{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size} for p in (OUT/'import').glob('*.json')]})
print(json.dumps({'revision':REV,'counts':counts,'baseline_unchanged':True},ensure_ascii=False))
