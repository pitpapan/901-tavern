"""Disposable clinic experiment. No formal installation or upstream access."""
from pathlib import Path
import json, shutil, importlib.util, subprocess, hashlib, sys

sys.stdout.reconfigure(encoding='utf-8')
E = Path(__file__).resolve().parent
H = E.parent
R = H.parents[5]
OLD = Path('C:/Users/pit/.codex/visualizations/2026/11/11/01a1cca4-1b4e-7ba3-99d2-1ab863fea37a/clinic-browser-20261113/app')
A = Path('C:/Users/pit/.codex/visualizations/2026/11/16/01a1e413-ef36-7873-b5a1-9d0ebb63235f/clinic-natural-20261116/app')
FORMAL = Path('D:/github/sillyTavern')
NAME = '901 帝都初始卡 独立事项版 20261105'
CHAT = '901 医馆自然叙事隔离 20261116'
PORT = 18126
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def put(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

assert R.name == 'TRPG outputs'
assert not A.exists(), 'Never overwrite an existing experiment'
protected = [FORMAL/'data/default-user/settings.json', FORMAL/f'data/default-user/characters/{NAME}.png',
             FORMAL/f'data/default-user/chats/{NAME}/901 帝都正式续玩 20261106.jsonl',
             OLD/f'data/default-user/chats/{NAME}/901 帝都正式续玩 20261106.jsonl']
put(E/'protected-before.json', {str(p): sha(p) for p in protected})
A.mkdir(parents=True)
ignore = shutil.ignore_patterns('node_modules', '.git', '*.map', 'backups', 'cache')
for folder in ['src', 'default', 'public']:
    shutil.copytree(OLD/folder, A/folder, ignore=ignore)
for f in ['server.js', 'package.json', 'config.yaml', 'webpack.config.js']:
    shutil.copy2(OLD/f, A/f)
(A/'plugins').mkdir()
U = A/'data/default-user'
U.mkdir(parents=True)
for folder in ['OpenAI Settings', 'context', 'instruct', 'sysprompt', 'TextGen Settings', 'themes', 'extensions', 'User Avatars', 'worlds']:
    if (OLD/'data/default-user'/folder).exists():
        shutil.copytree(OLD/'data/default-user'/folder, U/folder, ignore=ignore)
settings = json.loads((OLD/'data/default-user/settings.json').read_text(encoding='utf-8'))
for key in ['proxy_password', 'api_key', 'api_key_custom']:
    if key in settings.get('oai_settings', {}): settings['oai_settings'][key] = ''
settings['active_character'] = NAME+'.png'
put(U/'settings.json', settings)
put(U/'secrets.json', {})
(U/'characters').mkdir()
shutil.copy2(OLD/f'data/default-user/characters/{NAME}.png', U/f'characters/{NAME}.png')

# Use the clean original clinic floors, before the old capture-only user/error pair.
rows = [json.loads(x) for x in (H/'browser-evidence/01-before.chat.jsonl').read_text(encoding='utf-8').splitlines()]
assert len(rows) == 14 and rows[12]['is_user'] and '叙述尚未完成' in rows[13]['mes']
rows = rows[:12]
oldchat = rows[-1]['variables'][0]['stat_data']['901_rules_poc']['chatId']
def branch(v):
    if isinstance(v, dict): return {k:branch(x) for k,x in v.items()}
    if isinstance(v, list): return [branch(x) for x in v]
    return CHAT if v == oldchat else v
rows = branch(rows)
for row in rows[1:]:
    for data in row.get('variables', []):
        root = data.get('stat_data', {}).get('901_rules_poc')
        if root:
            assert root['revision'] == 0 and not root.get('storyKnowledge') and not root['operations']
seed = '\n'.join(json.dumps(r, ensure_ascii=False) for r in rows)+'\n'
(E/'before.seed.jsonl').write_text(seed, encoding='utf-8')
chat = U/f'chats/{NAME}/{CHAT}.jsonl'
chat.parent.mkdir(parents=True)
chat.write_text(seed, encoding='utf-8')

# Reuse the adopted entry with current knowledge hooks, without the old synthetic memory replacement.
entry = (H/'dialogue-increment-live-20261114/integration-20261115/browser-entry.fixture.js').read_text(encoding='utf-8')
entry = entry[entry.index('function renderRelationshipFacts'):entry.index('const labNotice=')]
entry = 'window.top.__901DialogueHost={enabled:false};\n'+entry
entry += '\nwindow.top.__901StoryKnowledge.configureDialogueHost({enabled:false});\n'
entry += (E/'controls.js').read_text(encoding='utf-8')
(E/'entry.fixture.js').write_text(entry, encoding='utf-8')
spec = importlib.util.spec_from_file_location('lab', H.parent/'action-failure/timeout-20261105/lab.py')
lab = importlib.util.module_from_spec(spec); spec.loader.exec_module(lab)
def transform(card):
    card['chat'] = CHAT
    card['data']['extensions']['tavern_helper']['scripts'][1]['content'] = entry
lab.card_transform(U/f'characters/{NAME}.png', transform)

# Existing dependency closure packager, assets unchanged.
spec = importlib.util.spec_from_file_location('runtime_package', R/'work/replay_research/six_books_20261023/runtime_package.py')
pkg = importlib.util.module_from_spec(spec); spec.loader.exec_module(pkg)
names = ['story-knowledge.mjs', 'clinic-knowledge-catalog.mjs', 'replay-gate-script.example.js', 'narrative.mjs', 'integrated.mjs', 'opening.mjs', 'opening-binding.mjs', 'opening-scene-ui.mjs', 'player-status-ui.mjs', 'map-ui.mjs']
manifest = pkg.package_runtime(R, A/'public/901-opening-combat', [R/'work/rules_engine/gm_runtime'/n for n in names])
put(E/'package-manifest.json', manifest)
# The copied source quotes remain exact; only isolated branch identities change.
catalog = A/'public/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs'
catalog_body = catalog.read_text(encoding='utf-8')
binding = '"chatId": "'+oldchat+'"'
assert catalog_body.count(binding) == 6
catalog.write_text(catalog_body.replace(binding, '"chatId": "'+CHAT+'"'), encoding='utf-8')
put(E/'catalog-branch-binding.json', {'isolatedOnly':True, 'source':str(catalog), 'reboundExactChatIds':6,
    'unchangedRetainedSourceText':True, 'sha256':sha(catalog)})

# Clean existing backend plus local capture/response release. Browser never sends upstream.
backend = (FORMAL/'src/endpoints/backends/chat-completions.js').read_text(encoding='utf-8')
backend = "import fsClinic from 'node:fs';\n"+backend
status = "router.post('/status', async function (request, statusResponse) {"
assert backend.count(status) == 1
backend = backend.replace(status, status+' return statusResponse.json({data:[{id:'+json.dumps(settings['oai_settings']['custom_model'])+'}],isolatedOffline:true});')
anchor = "        console.debug('Chat Completion request:', requestBody);"
assert backend.count(anchor) == 1
backend = backend.replace(anchor, (E/'backend.fragment.js').read_text(encoding='utf-8')+'\n'+anchor)
backend += '\n'+(E/'evidence-route.fragment.js').read_text(encoding='utf-8')
(A/'src/endpoints/backends/chat-completions.js').write_text(backend, encoding='utf-8')
shutil.copy2(OLD/'offline-guard.mjs', A/'offline-guard.mjs')
put(A/'clinic-natural-config.json', {'evidenceDir':str(E), 'phase':'01-before', 'sequence':0, 'captureDir':str(E/'captures')})
put(E/'setup.json', {'app':str(A), 'port':PORT, 'chat':str(chat), 'chatId':CHAT, 'character':NAME,
    'oldChatUntouched':str(protected[-1]), 'entrySha256':sha(E/'entry.fixture.js'),
    'source':'01-before.chat.jsonl floors 0..11; exact trailing capture user/error excluded; exact chat identity rebound',
    'historyMessages':11, 'dialogueExtraction':False, 'classification':'local NO_CHECK fixture, not model acceptance',
    'memory':'existing database extension and original chat metadata; no synthetic replacement',
    'credentialsCopied':False, 'browserUpstreamCalls':0, 'packageModules':len(manifest)})
print(json.dumps({'app':str(A), 'port':PORT, 'modules':len(manifest), 'chatId':CHAT}, ensure_ascii=False))
