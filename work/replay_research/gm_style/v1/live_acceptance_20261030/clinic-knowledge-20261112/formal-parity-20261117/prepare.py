"""Prepare an offline, minimal knowledge integration over today's formal runtime."""
from pathlib import Path
import base64, difflib, hashlib, importlib.util, json, re, shutil, struct, subprocess, sys

E = Path(__file__).resolve().parent
R = next(p for p in E.parents if p.name == 'TRPG outputs')
FORMAL = Path('D:/github/sillyTavern')
A = Path('C:/Users/pit/.codex/visualizations/2026/11/16/01a1e413-ef36-7873-b5a1-9d0ebb63235f/clinic-formal-parity-20261117/app')
PORT = 18129
NAME = '901 帝都初始卡 独立事项版 20261105'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def put(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
assert ('--resume' in sys.argv or not A.exists()) and not (E/'setup.json').exists()
protected = {}
for relative in ['public/901-opening-combat','data/default-user/settings.json','data/default-user/characters','data/default-user/chats','data/default-user/worlds']:
    p = FORMAL/relative
    for f in ([p] if p.is_file() else p.rglob('*')):
        if f.is_file(): protected[f.relative_to(FORMAL).as_posix()] = sha(f)
put(E/'formal-before.json', protected)
card = FORMAL/'data/default-user/characters'/(NAME+'.png')
raw = card.read_bytes(); offset = 8; chunks = {}
while offset < len(raw):
    size = struct.unpack('>I',raw[offset:offset+4])[0]
    kind = raw[offset+4:offset+8]; body = raw[offset+8:offset+8+size]; offset += size+12
    if kind == b'tEXt' and body.split(b'\0',1)[0] in [b'chara',b'ccv3']:
        chunks[body.split(b'\0',1)[0].decode()] = json.loads(base64.b64decode(body.split(b'\0',1)[1]))
c = chunks['chara']; chat = c.get('chat') or c.get('data',{}).get('chat')
assert chat
source_chat = FORMAL/'data/default-user/chats'/NAME/(chat+'.jsonl')
rows = [json.loads(line) for line in source_chat.read_text(encoding='utf-8').splitlines()]
scripts = c['data']['extensions']['tavern_helper']['scripts']
entry = scripts[1]['content']
assert scripts[1]['enabled'] and 'story-knowledge' not in entry
(E/'entry.formal.js').write_text(entry,encoding='utf-8')
assert len(rows)>11 and '老馆主与雪老有旧' in rows[11]['mes']
assert rows[9]['is_user'] is False
cut = 8
assert '老馆主与雪老有旧' not in '\n'.join(row['mes'] for row in rows[1:cut+2])
put(E/'history-cut.json', {'formalChat':chat,'sourceChatSha256':sha(source_chat),
    'formalMessages':len(rows)-1,'nativeBranchTipMessageId':cut,
    'retainedMessageCount':cut+1,'excludedLeakMessageId':10,
    'excludedLeakSha256':hashlib.sha256(rows[11]['mes'].encode()).hexdigest(),
    'formalHistoryModified':False,'reason':'Native test branch ends before the unreceived old-friend statement; original history remains preserved.'})

ignore = shutil.ignore_patterns('node_modules','.git','*.map','backups','cache')
for folder in ['src','default','public']:
    if not (A/folder).exists(): shutil.copytree(FORMAL/folder,A/folder,ignore=ignore)
for name in ['server.js','package.json','config.yaml','webpack.config.js']:
    if not (A/name).exists(): shutil.copy2(FORMAL/name,A/name)
(A/'plugins').mkdir(exist_ok=True)
U = A/'data/default-user'; U.mkdir(parents=True,exist_ok=True)
for folder in ['worlds','OpenAI Settings','context','instruct','sysprompt','TextGen Settings','themes','extensions','User Avatars']:
    if (FORMAL/'data/default-user'/folder).exists() and not (U/folder).exists(): shutil.copytree(FORMAL/'data/default-user'/folder,U/folder,ignore=ignore)
shutil.copy2(FORMAL/'data/default-user/settings.json',U/'settings.json')
(U/'characters').mkdir(exist_ok=True); shutil.copy2(card,U/'characters'/card.name)
dest_chat = U/'chats'/NAME/source_chat.name; dest_chat.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(source_chat,dest_chat)
put(U/'secrets.json',{})
config = (A/'config.yaml').read_text(encoding='utf-8')
config = re.sub(r'(?m)^port: 8000$',f'port: {PORT}',config)
config = config.replace('browserLaunch:\n  enabled: true','browserLaunch:\n  enabled: false')
(A/'config.yaml').write_text(config,encoding='utf-8')
if not (A/'node_modules').exists(): shutil.copytree(FORMAL/'node_modules',A/'node_modules',ignore=shutil.ignore_patterns('.cache'))
offline = Path('C:/Users/pit/.codex/visualizations/2026/11/16/01a1e413-ef36-7873-b5a1-9d0ebb63235f/clinic-reply-recovery-20261116/app/offline-guard.mjs')
shutil.copy2(offline,A/'offline-guard.mjs')

spec = importlib.util.spec_from_file_location('runtime_package',R/'work/replay_research/six_books_20261023/runtime_package.py')
pkg = importlib.util.module_from_spec(spec); spec.loader.exec_module(pkg)
module_dir = Path('work/rules_engine/gm_runtime')
packed = E/'new-dependency-closure'
manifest = pkg.package_runtime(R,packed,[R/module_dir/'story-knowledge.mjs',R/module_dir/'clinic-knowledge-catalog.mjs'])
new_files = []
runtime = A/'public/901-opening-combat'
for item in manifest:
    file = Path(item['destination']); relative = file.relative_to(packed); target = runtime/relative
    if target.exists(): continue
    target.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(file,target); new_files.append(relative.as_posix())
put(E/'new-dependencies.json', {'addedFiles':new_files,'sourceClosure':manifest,
    'genericDialogueExtractionEnabled':False,'existingFormalDependenciesOverwritten':False})

def extract(text, start, end):
    return text[text.index(start):text.index(end,text.index(start))]
def update(relative, after):
    target = runtime/relative; before = target.read_text(encoding='utf-8')
    (E/(target.name+'.before')).write_text(before,encoding='utf-8')
    (E/(target.name+'.patch')).write_text(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='formal/'+relative,tofile='isolated/'+relative)),encoding='utf-8')
    target.write_text(after,encoding='utf-8',newline='\n')

relative = 'work/rules_engine/mvu_poc/adapter.mjs'
base = (runtime/relative).read_text(encoding='utf-8')
current = (R/relative).read_text(encoding='utf-8')
assert 'export async function settleStoryKnowledge' not in base
base += '\n'+extract(current,'export async function settleStoryKnowledge','export async function settleRuleAction')
base += '\n'+extract(current,'export async function readPersistedTavernChat','export async function persistTavernRuleState')
update(relative,base)
relative = str(module_dir/'adjudication-gate.mjs').replace('\\','/')
base = (runtime/relative).read_text(encoding='utf-8'); current = (R/relative).read_text(encoding='utf-8')
old = extract(base,'export async function withReplayLorebook','export function replayPendingFromChat')
new = extract(current,'export async function withReplayLorebook','export function replayPendingFromChat')
update(relative,base.replace(old,new))
relative = str(module_dir/'replay-gate-script.example.js').replace('\\','/')
base = (runtime/relative).read_text(encoding='utf-8')
before = 'combat = null, profile = {} } = {}) {'
assert base.count(before)==1
base = base.replace(before,'combat = null, profile = {}, knowledge=null } = {}) {')
base = base.replace('const debug=profile.debug??REPLAY_GATE_DEBUG;',"const debug=profile.debug??REPLAY_GATE_DEBUG;\nconst generateKnown=request=>knowledge?knowledge.generate({request,generateRaw,eventOn,eventRemoveListener,event:tavern_events.CHAT_COMPLETION_SETTINGS_READY}):generateRaw(request);")
before = "relevantLorebookFacts((await Promise.all(replayLorebookNames({book,books:profile.lorebooks})\n            .map(name=>getLorebookEntries(name)))).flat(), { action: context.original.text, scene })"
after = "relevantLorebookFacts(((entries)=>knowledge?knowledge.projectEntries(entries):entries)((await Promise.all(replayLorebookNames({book,books:profile.lorebooks})\n            .map(name=>getLorebookEntries(name)))).flat()), { action: context.original.text, scene })"
assert base.count(before)==1; base=base.replace(before,after)
base=base.replace('classifyWithDeadline({ generateRaw,','classifyWithDeadline({ generateRaw:generateKnown,')
base=base.replace('generate: () => generateRaw({ ...model, ...modelOptions, user_input:', 'eventRemoveListener,projectEntries:knowledge?entries=>knowledge.projectEntries(entries):undefined,\n          generate: () => generateKnown({ ...model, ...modelOptions, user_input:')
tail="return {receiveKnowledge:async receipt=>{if(!knowledge)throw Error('Story knowledge is not configured');if(running||combat?.busy)throw Error('Wait for the current story operation');return knowledge.receive(receipt);}};\n"
assert base.endswith('}\n'); base=base[:-2]+tail+'}\n'
update(relative,base)

projection = R/module_dir/'narrative-style-projection.mjs'
code = "import {patchStoryKnowledgeEntry} from "+json.dumps(projection.as_uri())+";let input='';for await(const chunk of process.stdin)input+=chunk;process.stdout.write(patchStoryKnowledgeEntry(input));"
entry = subprocess.check_output(['node','--input-type=module','-e',code],input=entry.encode()).decode()
entry = entry.split('Object.assign(window.top.__901StoryKnowledge,')[0]
entry = entry.replace('catalog:CLINIC_KNOWLEDGE_CATALOG,','catalog:{...CLINIC_KNOWLEDGE_CATALOG,rejectedNarration:[]},')
entry += "\nstoryKnowledge.configureDialogue(null);\nwindow.addEventListener('pagehide',()=>{if(SillyTavern.characterId===sourceCharacter)delete window.top.__901StoryKnowledge;});\n"
entry += (E/'controls.js').read_text(encoding='utf-8').replace('__PARENT__',json.dumps(chat,ensure_ascii=False)).replace('__PARENT_REVISION__','0')
(E/'entry.isolated.js').write_text(entry,encoding='utf-8')
helper = R/'work/replay_research/gm_style/v1/live_acceptance_20261030/action-failure/timeout-20261105/lab.py'
spec=importlib.util.spec_from_file_location('lab',helper); lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
def transform(value): value['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
lab.card_transform(U/'characters'/card.name,transform)

backend = A/'src/endpoints/backends/chat-completions.js'; body = backend.read_text(encoding='utf-8')
body = "import fs901 from 'node:fs';import {createHash as hash901} from 'node:crypto';\n" + body
body = body.replace("router.post('/status', async function (request, statusResponse) {", "router.post('/status', async function (request, statusResponse) {return statusResponse.json({data:[{id:'[抗截断]gemini-3.8-flash'}],isolatedOffline:true});")
anchor = "        console.debug('Chat Completion request:', requestBody);\n\n        const fetchResponse = await fetch(endpointUrl, config);"
assert body.count(anchor)==1
capture = (E/'capture-backend.js').read_text(encoding='utf-8')
body = body.replace(anchor,capture+'\n        const fetchResponse = await fetch(endpointUrl, config);')
body += '\n'+(E/'evidence-backend.js').read_text(encoding='utf-8')
backend.write_text(body,encoding='utf-8')
(E/'browser/captures').mkdir(parents=True)
put(A/'clinic-parity-config.json',{'evidenceDir':str(E/'browser'),'captureDir':str(E/'browser/captures'),'phase':'before','sequence':0})
put(E/'call-budget.json',{'additionalCallsAuthorized':0,'usedThisTask':0,'priorCumulative':546,'priorCeiling':546,'remaining':0,'closed':True,
    'plannedMaximumIfSeparatelyAuthorized':6,'failuresAndRetriesCount':True,
    'endpoint':'https://cdn.sta1n.cn/v1/chat/completions','model':'[抗截断]gemini-3.8-flash'})
put(E/'setup.json',{'app':str(A),'port':PORT,'formalApp':str(FORMAL),'character':NAME,'parentChatId':chat,
    'parentRevision':0,'nativeCutMessageId':cut,'originalMessages':len(rows)-1,'modelCalls':0,'formalWritten':False,
    'formalRuntimeFiles':len([p for p in protected if p.startswith('public/')]),'existingRuntimeFilesPatched':3,
    'activeGenericDialogueExtraction':False,'copiedCredentials':False,'priorFormalRecoveryRetained':True})
assert all(sha(FORMAL/path)==digest for path,digest in protected.items())
print(json.dumps({'prepared':True,'app':str(A),'port':PORT,'formalProtectedFiles':len(protected),'addedDependencyFiles':len(new_files),'patchedRuntimeFiles':3,'modelCalls':0},ensure_ascii=False))
