"""Focused checks of six-book projection; no live model or game state access."""
from pathlib import Path
import json, hashlib, re, runpy, os
from collections import Counter

ROOT=Path(__file__).resolve().parents[3]
OUT=Path(os.environ.get('SIX_BOOKS_VERIFY_OUT',str(ROOT/'output/replay_tavern/six_books_20261023_candidate'))).resolve()
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
ctx=runpy.run_path(str(Path(__file__).with_name('build_candidate.py')))
plan=read(OUT/'创作规划.yaml')
assert plan==ctx['plan']==read(Path(__file__).with_name('创作规划.yaml'))
checks=[]
for rel,h in plan['protected_sha256'].items():assert sha(ROOT/rel)==h,rel
checks.append('全部已记录输入／保护文件哈希保持不变')
parsed=[read(p) for p in OUT.rglob('*.json')]
entries=[];book_objects={}
for b in plan['books']:
    obj=read(OUT/b['file']);assert set(obj)=={'entries'}
    book_objects[b['name']]=obj
    for key,e in obj['entries'].items():assert key==str(e['uid'])
    entries.extend(obj['entries'].values())
resource_entries=[e for e in entries if '901_resource' in e['extensions']]
baseline=read(Path(__file__).with_name('world-integration-baseline-20261028.json'))
baseline_lore=set(baseline['uids'])-{int(uid) for uid in baseline['resource_entries']}
new_author_uids={1_000_000_000+int(hashlib.sha256(d['key'].encode()).hexdigest()[:8],16)%1_000_000_000 for d in ctx['author_deltas'] if not d.get('target_uid')}
assert {e['uid'] for e in entries if '901_resource' not in e['extensions']}==baseline_lore|new_author_uids
assert len(entries)==len({e['uid'] for e in entries})
assert len(resource_entries)==len(ctx['contracts'])
assert {e['extensions']['901_resource']['id'] for e in resource_entries}==set(ctx['contracts'])
for e in resource_entries:
    execution=e['extensions']['901_resource'];contract=ctx['contracts'][execution['id']];path=ctx['contract_paths'][execution['id']]
    assert execution['contract_sha256']==sha(path)
    assert execution['version']==contract['version'] and execution['reading']==contract['reading']
    for field in ['verification','clauses','actions','consumerCoverage','implementationGaps','unresolvedRules']:
        assert execution[field]==contract.get(field,{'effects':[]}) if field=='consumerCoverage' else execution[field]==contract[field],(execution['id'],field)
    assert execution['programSources']=={op:p['compilation'] for op,p in contract['definition'].get('programs',{}).items() if p.get('compilation')}
    assert execution['deployment']=='candidate_not_installed'
    if contract['definition'].get('template'):assert e['disable'] and e['constant'] and not e['key']
by_uid={e['uid']:e for e in entries}
base=ctx['original'];base_uids={e['uid'] for e in base}
assert base_uids-{79768996}<=set(by_uid)
assert 79768996 not in by_uid
mapping=read(OUT/'migration_map.json')
assert len(mapping['source_coverage'])==136
assert all(row['destinations'] for row in mapping['source_coverage'])
checks.append(f'六书{len(entries)}个UID唯一，保留173个既有非资源条目并合入采用作者增量及全部{len(resource_entries)}份资源契约；135个原UID保留，136个来源均有去向；模板手动禁用')
seen=Counter()
for r in ctx['records'].values():
    actual=(OUT/r['path']).read_text(encoding='utf-8').rstrip('\n')
    assert actual==r['content']
    assert hashlib.sha256(actual.encode()).hexdigest()==next(p['content_sha256'] for p in plan['entries'] if p['uid']==r['uid'])
    for u in r['source_units']:seen[(u['index'],u['unit'])]+=1
    if r['book']=='主持卡':continue
    e=by_uid[r['uid']];assert e==r['native']
    old=ctx['sources'][r['parent']]
    allowed={'uid','key','comment','content','constant','disable','order','extensions'}
    for field in set(old)|set(e):
        if field not in allowed:assert old.get(field)==e.get(field),(e['comment'],field)
    for key,val in old['extensions'].items():assert e['extensions'][key]==val,(e['comment'],key)
    assert e['position']==1 and e['scanDepth']==4
    assert e['excludeRecursion'] and e['preventRecursion'] and e['probability']==100
    assert all(len(k)>1 for k in e['key'])
    if not e['disable'] and not e['constant']:assert e['key']
assert len(seen)==606 and set(seen.values())=={1}
checks.append(f'606个来源段落／行都有一次明确分配；{len(ctx["records"])}份正文与规划哈希一致；未授权字段与原来源扩展保持')
disabled=[e['uid'] for e in base if e['disable']]
assert len(disabled)==9 and all(by_uid[u]['disable'] for u in disabled)
loads=Counter('disabled' if e['disable'] else 'constant' if e['constant'] else 'keyword' for e in entries)
for r in (r for r in ctx['records'].values() if 'resourceContract' in r):
    meta=r['resourceContract'];contract=ctx['contracts'][meta['id']]
    assert by_uid[r['uid']]['extensions']['901_resource_contract']==meta
    assert meta['version']==contract['version'] and meta['reading']==contract['reading']
    assert meta['verification']==contract['verification'] and meta['sha256']==sha(ROOT/meta['path'])
    if meta['id'] in ctx['candidate_contracts']:
        assert meta['adoptionStatus']=='candidate' and r['native']['disable']
        assert meta['verifiedOperations']==ctx['candidate_runtime'][meta['id']]['operations']
        assert meta['learning']==ctx['candidate_actions'].get(meta['id'],{}).get('learning')
        assert '默认手动禁用' in r['content'] and '实际取得记录' in r['content']
resource_loads=Counter('disabled' if e['disable'] else 'constant' if e['constant'] else 'keyword' for e in resource_entries)
additional=[r for r in ctx['records'].values() if r['book']!='主持卡' and r['uid'] not in baseline['uids'] and '901_resource' not in r['native']['extensions']]
additional_loads=Counter('disabled' if r['native']['disable'] else 'constant' if r['native']['constant'] else 'keyword' for r in additional)
assert loads==Counter({'disabled':19,'constant':3,'keyword':151})+resource_loads+additional_loads
assert not additional_loads['constant']
assert resource_loads['constant']==0
checks.append(f'原9条禁用保持；当前加载分布{dict(loads)}；资源不新增常驻，后期模板不默认启用；无单字触发或无键绿灯')

# Every numeral in the seven original enemy short cards survives exactly once in their projected pieces.
old_enemy='\n'.join(ctx['sources'][n]['content'] for n in range(131,137))
enemy_records=[r for r in ctx['records'].values() if r['parent'] in range(131,137)]
new_enemy='\n'.join('\n'.join(r['pieces']) for r in enemy_records)
numbers=lambda s:Counter(re.findall(r'\d+(?:\.\d+)?',s))
assert numbers(old_enemy)==numbers(new_enemy),(numbers(old_enemy)-numbers(new_enemy),numbers(new_enemy)-numbers(old_enemy))
for n in range(131,137):
    for i,u in enumerate(ctx['units'][n]):
        if (n,i) in [(133,4),(135,0)]:continue
        assert any(u in '\n'.join(r['pieces']) for r in enemy_records),(n,i)
checks.append('敌人短卡全部数值逐次保留；仅分割的两行之外，原句完整存在于目标正文')

card=read(OUT/'import/901_帝都初始卡_六书候选.card.json')['data'];oldcard=read(ctx['CARD'])['data']
for k,v in oldcard['extensions'].items():
    if k not in ['world','tavern_helper']:assert card['extensions'][k]==v,k
expected_helper=json.loads(json.dumps(oldcard['extensions']['tavern_helper']))
narrative=ctx['project_narrative_entry'](expected_helper['scripts'][1]['content'])
expected_helper['scripts'][1]['content']=narrative['script']
expected_helper['scripts'][1]['content']=expected_helper['scripts'][1]['content'].replace('profile:{debug:false,','profile:{lorebooks:'+json.dumps(list(ctx['FILENAMES'].values()),ensure_ascii=False)+',debug:false,')
expected_helper['scripts'][1]['content']=expected_helper['scripts'][1]['content'].replace(
    "{role:'system',content:currentSceneText(scene)+",
    "{role:'system',content:"+json.dumps(plan['world_context_guidance']['content'],ensure_ascii=False)+"+'\\n'+currentSceneText(scene)+")
assert card['extensions']['tavern_helper']==expected_helper
assert read(OUT/'runtime_patch/901-opening-combat/narrative-style.json')==narrative['style']
assets=read(OUT/'runtime_patch_manifest.json')['assets']
assert len(assets)==1 and assets[0]['destination'].replace('\\','/')=='runtime_patch/901-opening-combat/narrative-style.json'
for asset in assets:
    assert sha(ROOT/asset['source'])==asset['source_sha256']
    assert sha(OUT/asset['destination'])==asset['sha256']
for module in read(OUT/'runtime_patch_manifest.json')['modules']:
    assert sha(ROOT/module['source'])==module['source_sha256']
    assert sha(OUT/module['destination'])==module['sha256']
    staged=OUT/module['destination']
    for rel in re.findall(r'''(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]''',staged.read_text(encoding='utf-8')):
        if not rel.endswith(('.mjs','.js')):continue
        target=staged.parent/rel if rel.startswith('.') else OUT/'runtime_patch/901-opening-combat'/rel[len('/901-opening-combat/'):] if rel.startswith('/901-opening-combat/') else None
        if target is not None:
            assert target.resolve() in {(OUT/m['destination']).resolve() for m in read(OUT/'runtime_patch_manifest.json')['modules']},f'Unpackaged runtime import: {rel}'
for k in ['personality','first_mes','mes_example','system_prompt','post_history_instructions','alternate_greetings']:
    assert card[k]==oldcard[k],k
assert card['scenario'].startswith(oldcard['scenario'])
embedded=card['character_book']['entries'];primary=book_objects['世界基础设定']['entries']
assert len(embedded)==len(primary)
assert {e['id'] for e in embedded}=={r['uid'] for r in ctx['records'].values() if r['book']=='世界基础设定'}
for e in embedded:
    n=primary[str(e['id'])]
    for a,b in [('keys','key'),('content','content'),('constant','constant'),('insertion_order','order'),('extensions','extensions')]:assert e[a]==n[b]
    assert e['enabled']==(not n['disable'])
assert ctx['records'][123]['content'] in card['description']
checks.append(f'主持卡内嵌{len(primary)}条基础书一致；入口脚本增加显式六书名单、同源背景／现场说明及当前人工分支记忆，正则、开场及机械执行提示保持；完整运行时依赖哈希一致')

assert '开局剑的具体数值尚需' not in by_uid[57247236]['content']
assert '6L、破魔2、破甲2' in by_uid[57247236]['content']
assert '世界树' not in by_uid[22042631]['key']
for uid in [46857000,175579823,25657482,59071557,42513235]:
    assert '本城采用区域重点城市的人口量级' not in by_uid[uid]['content']
checks.append('已确认人口、弃风和YGGDRASIL触发修正存在，旧待定剑数值语句已移除')

# A literal-match probe for these unchanged native boolean settings. Not an ST budget/activation simulation.
def matches(text):
    return {e['comment'] for e in entries if not e['disable'] and (e['constant'] or any(k.casefold() in text.casefold() for k in e['key']))}
cases=[
 ('我到九雪医馆寻找久远。',{'九雪医馆','人物·久远','九雪医馆查封与接触基线','久远与哈克的医馆寄居条件'}, {'帝提前干预：提前拘捕'}),
 ('古雷姆林出现在眼前。',{'人物·古雷姆林','古雷姆林常态战斗能力','901短卡计算约定'}, {'古雷姆林试炼接续与成果'}),
 ('远处这株世界树有什么来历？',set(),{'YGGDRASIL'}),
 ('讨论帝都近郊峡谷的施工。',{'帝都近郊峡谷','法阵安装者','峡谷结界与空间封印运行','901短卡计算约定'}, {'峡谷调查、交战与战后接续','帝提前干预：峡谷停军'}),
 ('使用弃风剑。',{'弃风剑'},set()),
 ('我在帝都买早餐。',{'帝都'},{'帝国公共消息与民间见识','帝都腹地供给与公费农作施术','帝国军力与粮储基线'}),
 ('前往银月城。',{'银月城'},{'高等精灵家传古史与知情边界'}),
 ('猫音谈起帝国学士。',{'人物·猫音','帝国学士与长期研习'},set()),
 ('肯达·凯·弗格斯与白色魔法使相谈。',{'人物·肯达·凯·弗格斯','人物·白色魔法使'},{'肯达后期暗桩身份','白魔私人目标','白魔后来协作关系证据'}),
 ('查看弃风剑，问起悠悠。',{'弃风剑'},{'弃风隐藏灵性与重铸条件','悠悠诅咒辨认与转送条件'}),
 ('副队洛报告给队长霞。',{'人物·洛','人物·霞'},set()),
 ('谈谈远西的世界树。',{'远西世界树及共同照护'},{'YGGDRASIL'}),
]
probes=[]
for prompt,required,forbidden in cases:
    actual=matches(prompt);assert required<=actual and not actual&forbidden,(prompt,actual)
    probes.append({'text':prompt,'matched':sorted(actual),'status':'pass'})
checks.append(f'{len(cases)}组字面触发探针符合目标；禁用剧情与新作者秘密没有因关键词自动启用')
for p in OUT.rglob('*.md'):
    for target in re.findall(r'\]\(<?([^\n)>]+)>?\)',p.read_text(encoding='utf-8')):
        if '://' in target or target.startswith('#'):continue
        resolved=p.parent/target.split('#')[0]
        if resolved==OUT/'verification.json':continue
        assert resolved.exists(),(str(p),target)
checks.append('包内Markdown文件链接均指向存在的文件')
result={'status':'pass','checks':checks,'counts':{'books':6,'entries':len(entries),'resource_contracts':len(resource_entries),'runtime_fully_verified':sum(e['extensions']['901_resource']['verification']['runtimeFullyVerified'] for e in resource_entries),'deployment':'candidate_not_installed','host_anchor':1,'loading':dict(loads),'source_entries':136,'source_units':606},'literal_trigger_probes':probes,'constant_body_chars_before':sum(len(e['content']) for e in base if e['constant'] and not e['disable']),'constant_body_chars_after':sum(len(e['content']) for e in entries if e['constant'] and not e['disable']),'limits':['本验证器只运行静态检查；真实模型测试另见minimal_test记录','字面匹配不模拟预算、其他世界书、全局设置与实际Prompt组装','当前书分期优先关系是提示词约束，未新增程序化门控','不宣称全量作者资料已同步']}
(OUT/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert (OUT/'verification.json').exists()
print(json.dumps(result,ensure_ascii=False,indent=2))
