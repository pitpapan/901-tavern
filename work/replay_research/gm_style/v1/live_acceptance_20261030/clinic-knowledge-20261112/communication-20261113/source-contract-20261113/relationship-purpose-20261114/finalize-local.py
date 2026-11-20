"""Check and package the reviewed local candidate; never install or send it."""
from pathlib import Path
import base64, hashlib, json, struct, zipfile

D = Path(__file__).resolve().parent
R = next(p for p in D.parents if p.name == 'TRPG outputs')
O, H = D.parent.parent, D.parent.parent.parent
read = lambda p: json.loads(p.read_text(encoding='utf-8'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def put(p, v): p.write_text(json.dumps(v, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
manifest = read(D/'package-manifest.json'); setup = read(D/'browser-setup.json')
A = Path(setup['app']); package = D/'package/901-opening-combat'
for m in manifest:
    assert sha((R/m['source']).resolve()) == m['source_sha256']
    assert sha(Path(m['destination'])) == m['sha256']
    relative = Path(m['destination']).relative_to(package)
    assert sha(A/'public/901-opening-combat'/relative) == m['sha256']
card = A/'data/default-user/characters/901 帝都初始卡 独立事项版 20261105.png'
data = card.read_bytes(); i = 8; entries = []
while i < len(data):
    n = struct.unpack('>I',data[i:i+4])[0]; typ = data[i+4:i+8]; v = data[i+8:i+8+n]; i += n+12
    if typ == b'tEXt' and v.split(b'\0',1)[0] in (b'chara',b'ccv3'):
        j = json.loads(base64.b64decode(v.split(b'\0',1)[1]))
        entries.append(j['data']['extensions']['tavern_helper']['scripts'][1]['content'])
entry = (D/'candidate-entry.js').read_text(encoding='utf-8')
fixtureEntry = entry+'\n'+(H/'browser-controls.js').read_text(encoding='utf-8')+'\n'+(O/'browser-controls.js').read_text(encoding='utf-8')
assert entries and all(e == fixtureEntry for e in entries)
batch = read(D/'batch/prepared.json')
assert batch['newAllowance'] == batch['modelCalls'] == 0
assert len(batch['cases']) == 4 and len(batch['followups']) == 2
for case in batch['cases']:
    p = D/'batch'/case['request']['file']
    assert sha(p) == case['request']['sha256'] and p.stat().st_size == case['request']['bytes']
    assert case['status'] == 'frozen-not-sent'
for step in batch['followups']:
    assert step['status'] == 'rule-only-awaiting-real-reply'
    assert not (D/'batch'/(step['id']+'.request.json')).exists()
ledger = read(D.parent/'attribution-choice-20261114/live/run.json')
assert ledger['cumulative'] == 266 and ledger['remaining'] == 0 and ledger['closed']
examples = read(R/'work/rules_engine/gm_runtime/story-source-reference.examples.json')
assert len(examples) == 18
pairs = {}
for e in examples:
    assert e['sources'] and e['accepted'] and e['rejected'] and e['reason']
    if 'pair' in e: pairs.setdefault(e['pair'], []).append(e['id'])
assert len(pairs) == 6 and all(len(v) == 2 for v in pairs.values())
log = (D/'offline-regression.log').read_text(encoding='utf-8')
assert 'tests 79' in log and 'pass 79' in log and 'fail 0' in log
portable = {'version':'relationship-purpose-20261114','deployed':False,'modules':[
    {'source':m['source'],'path':Path(m['destination']).relative_to(package).as_posix(),'sha256':m['sha256']} for m in manifest],
    'entry':{'path':'candidate-entry.js','sha256':sha(D/'candidate-entry.js')},
    'assets':[{'path':s,'sha256':sha(package/s)} for s in ['scene-binding.json','narrative-style.json','work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json']]}
put(D/'candidate-manifest.json', portable)
(D/'CANDIDATE.txt').write_text('''901 关系与目的归属本地候选 / 2026-11-14
仅供审查，未部署。不要自动覆盖正式安装或角色卡。
133模块与3项原资产；candidate-entry.js沿原入口生成。测试按钮、合成来源/记忆、capture后端不在包内。
本轮运行时仅修改story-knowledge.mjs的通用生成合同；没有新执行器、正文抽取或自动事实采用。
包相对实际安装仍有30个积累差异，涉及此前战斗/资源/MVU/地图/知情等工作，不都是本轮修改。
相对上次conditions候选只有story-knowledge与clinic-knowledge-catalog两模块变化；后者为此前260/261核定说明。
部署、回滚需另按原deployment-diff和recovery记录核对；本包不执行部署或删除。详细证据及待授权模型批次在相邻DELIVERY.txt。
''', encoding='utf-8')
archive = D/'relationship-purpose-candidate.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(package.rglob('*')):
        if p.is_file(): z.write(p,'901-opening-combat/'+p.relative_to(package).as_posix())
    for name in ['candidate-entry.js','candidate-manifest.json','CANDIDATE.txt']: z.write(D/name,name)
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert len(z.namelist()) == 139
    for m in portable['modules']:
        assert hashlib.sha256(z.read('901-opening-combat/'+m['path'])).hexdigest() == m['sha256']
report={'status':'local-candidate-and-batch-ready-no-model-output','modelCalls':0,'credentialsRead':False,
    'cumulativeRequestAttempts':266,'newAllowance':0,'regression':{'command':'node --test work/rules_engine/gm_runtime/story-knowledge.test.mjs work/rules_engine/gm_runtime/story-knowledge-entry.test.mjs work/rules_engine/gm_runtime/replay-gate-script.test.mjs','tests':79,'passed':79,'failed':0,'log':'offline-regression.log','scope':'Projection/state/entry regressions, not semantic model evaluation'},
    'examples':{'total':18,'newPairs':pairs,'labels':'human semantic rubric; acceptable examples are not unique answers'},
    'sourceFiles':{s:sha(R/s) for s in read(D/'baseline.json')['sourceFiles']},
    'candidateModules':133,'isolatedCardEntryMatchesCandidatePlusExcludedFixtureControls':True,
    'actualBrowserEvidence':'browser-verification.json','firstRequests':4,'followupRules':2,
    'archive':{'file':archive.name,'bytes':archive.stat().st_size,'sha256':sha(archive),'entries':139},
    'deploymentDifferences':'deployment-diff.json','deployed':False,'formalStoryWritten':False,'automaticRoutesResumed':False}
put(D/'local-verification.json',report)
print(json.dumps({'tests':79,'newPairs':6,'modules':133,'isolatedEntryMatches':True,'zipBytes':archive.stat().st_size,'modelCalls':0},ensure_ascii=False))
