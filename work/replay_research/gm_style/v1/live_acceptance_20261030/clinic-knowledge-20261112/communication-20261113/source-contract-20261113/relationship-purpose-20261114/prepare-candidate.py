"""Refresh the existing local candidate and capture-only app, never the formal install."""
from pathlib import Path
import hashlib, importlib.util, json, shutil, subprocess, difflib

D = Path(__file__).resolve().parent
S, O, H = D.parent, D.parent.parent, D.parent.parent.parent
R = next(p for p in D.parents if p.name == 'TRPG outputs')
read = lambda p: json.loads(p.read_text(encoding='utf-8'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def put(p, value):
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

previous = read(O/'conditions-20261113/package-manifest.json')
spec = importlib.util.spec_from_file_location('runtime_package', R/'work/replay_research/six_books_20261023/runtime_package.py')
runtime = importlib.util.module_from_spec(spec); spec.loader.exec_module(runtime)
destination = D/'package/901-opening-combat'
manifest = runtime.package_runtime(R, destination, [(R/x['source']).resolve() for x in previous])
assert len(manifest) == len(previous) == 133
changes = []
for before, after in zip(previous, manifest):
    assert before['source'] == after['source']
    assert sha(Path(before['destination'])) == before['sha256']
    if before['sha256'] != after['sha256']:
        changes.append({'source':Path(after['source']).as_posix(), 'previousSha256':before['sha256'], 'candidateSha256':after['sha256']})
assert {x['source'] for x in changes} == {'work/rules_engine/gm_runtime/story-knowledge.mjs','work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs'}, changes
for asset in ['scene-binding.json','narrative-style.json','work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json']:
    target = destination/asset; target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(O/'conditions-20261113/package/901-opening-combat'/asset, target)
module = (R/'work/rules_engine/gm_runtime/narrative-style-projection.mjs').as_uri()
code = f"import {{readFile,writeFile}} from 'node:fs/promises';import {{patchStoryKnowledgeEntry}} from {json.dumps(module)};await writeFile(process.argv[2],patchStoryKnowledgeEntry(await readFile(process.argv[1],'utf8')));"
subprocess.run(['node','--input-type=module','-e',code,str(H/'installed-entry.js'),str(D/'candidate-entry.js')], check=True)
assert (D/'candidate-entry.js').read_bytes() == (O/'conditions-20261113/candidate-entry.js').read_bytes()
put(D/'package-manifest.json', manifest)
baseline = read(D/'baseline.json')
delta = {'deployed':False,'parentDeploymentDiff':'../../deployment-diff.json','recoveryManifest':'../../recovery/manifest.json',
         'changesFromLastPackagedCandidate':changes,'unchangedModules':131,'entryUnchanged':True,'assetsUnchanged':True,
         'thisTurnRuntimeChange':['work/rules_engine/gm_runtime/story-knowledge.mjs'],
         'inheritedUnpackagedChanges':'story-knowledge source/attribution work and the two previously reviewed catalog annotations; no new 265/266 annotation',
         'originalDeploymentChangedModules':len(read(O/'deployment-diff.json')['changedModules'])}
put(D/'candidate-delta.json', delta)
diff = []
for source in baseline['sourceFiles']:
    before = (D/(Path(source).name+'.before.txt')).read_text(encoding='utf-8').splitlines(True)
    after = (R/source).read_text(encoding='utf-8').splitlines(True)
    diff.extend(difflib.unified_diff(before, after, fromfile='before/'+source, tofile='after/'+source))
(D/'local-change.diff').write_text(''.join(diff), encoding='utf-8')

environment = read(H/'browser-environment.json'); A = Path(environment['app'])
allowed = Path('C:/Users/pit/.codex/visualizations/2026/11/11/01a1cca4-1b4e-7ba3-99d2-1ab863fea37a').resolve()
assert A.resolve().is_relative_to(allowed) and A.name == 'app'
backend = (A/'src/endpoints/backends/chat-completions.js').read_text(encoding='utf-8')
guard = (A/'offline-guard.mjs').read_text(encoding='utf-8')
assert 'globalThis.fetch=denied' in guard and 'https.request=denied' in guard
assert 'upstreamCalls:0' in backend and backend.index('return response.status(418)') < backend.index("console.debug('Chat Completion request:'")
assert "connect-src 'self' data: blob:" in (A/'public/index.html').read_text(encoding='utf-8')
for item in manifest:
    relative = Path(item['destination']).relative_to(destination)
    target = A/'public/901-opening-combat'/relative
    assert target.exists()
    if sha(target) != item['sha256']: shutil.copy2(item['destination'], target)
    assert sha(target) == item['sha256']
# Use the retained real continuation to exercise the existing annotations once.
cp = A/'data/default-user/chats/901 帝都初始卡 独立事项版 20261105/901 帝都正式续玩 20261106.jsonl'
before = D/'browser-before.chat.jsonl'
assert not before.exists(), 'Do not reset a running capture'
shutil.copy2(cp, before)
rows = (S/'attribution-choice-20261114/03.ready.seed.jsonl').read_text(encoding='utf-8').strip().splitlines()
rows.pop()  # UI will supply the current question, never forge an assistant response.
cp.write_text('\n'.join(rows)+'\n', encoding='utf-8')
put(D/'browser-setup.json', {'app':str(A),'port':18123,'modulesVerified':133,'candidateEntrySha256':sha(D/'candidate-entry.js'),
    'guardSha256':sha(A/'offline-guard.mjs'),'backendSha256':sha(A/'src/endpoints/backends/chat-completions.js'),
    'credentialsRead':False,'modelCalls':0,'upstreamBlocked':True,'captureFilesBefore':[p.name for p in (A/'clinic-captures').glob('*.json')]})
print(json.dumps({'modules':133,'changesFromPreviousPackage':changes,'modelCalls':0,'browserApp':str(A)},ensure_ascii=False))
