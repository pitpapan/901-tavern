"""Local-only continuation from actual output 534. No model transport or secrets."""
from pathlib import Path
import json,shutil,hashlib,importlib.util,sys
sys.stdout.reconfigure(encoding='utf-8')
E=Path(__file__).resolve().parent
PREV=E.parent/'natural-key-knowledge-20261116'
setup=json.loads((PREV/'setup.json').read_text(encoding='utf-8'))
OLD=Path(setup['app'])
A=Path('C:/Users/pit/.codex/visualizations/2026/11/16/01a1e413-ef36-7873-b5a1-9d0ebb63235f/clinic-continuation-20261116/app')
PARENT=setup['chatId'];NAME=setup['character'];PORT=18127
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,value):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert not A.exists(),'Never overwrite an existing continuation'
source=PREV/'live-results/03-reopened/result.chat.jsonl'
assert sha(source)==load(PREV/'live-results/03-reopened/result-verification.json')['savedChatSha256']
rows=[json.loads(s) for s in source.read_text(encoding='utf-8').splitlines()]
assert len(rows)==15
root=rows[14]['variables'][0]['stat_data']['901_rules_poc']
assert root['chatId']==PARENT and root['revision']==1
assert len(root['storyKnowledge']['knowledge'])==1
assert next(iter(root['storyKnowledge']['knowledge'].values()))['knowerId']=='bright'
assert not root['storyKnowledge'].get('dialogueBatches')
assert rows[14]['mes']==(PREV/'captures/03-reopened.06.narration.content.txt').read_bytes().decode('utf-8')+'\n\n<StatusPlaceHolderImpl/>'
protected={str(p):sha(p) for p in [source,Path(setup['chat']),OLD/f'data/default-user/characters/{NAME}.png',PREV/'ledger-final.json']}
protected.update(load(PREV/'protected-before.json'))
put(E/'protected-before.json',protected)
A.mkdir(parents=True)
ignore=shutil.ignore_patterns('node_modules','.git','*.map','backups','cache')
for folder in ['src','default','public']:shutil.copytree(OLD/folder,A/folder,ignore=ignore)
for name in ['server.js','package.json','config.yaml','webpack.config.js','offline-guard.mjs']:shutil.copy2(OLD/name,A/name)
(A/'plugins').mkdir()
U=A/'data/default-user';U.mkdir(parents=True)
for folder in ['OpenAI Settings','context','instruct','sysprompt','TextGen Settings','themes','extensions','User Avatars','worlds']:
    if (OLD/'data/default-user'/folder).exists():shutil.copytree(OLD/'data/default-user'/folder,U/folder,ignore=ignore)
settings=load(OLD/'data/default-user/settings.json')
for key in ['proxy_password','api_key','api_key_custom']:
    if key in settings.get('oai_settings',{}):settings['oai_settings'][key]=''
settings['active_character']=NAME+'.png'
put(U/'settings.json',settings);put(U/'secrets.json',{})
current=load(Path('D:/github/sillyTavern/data/default-user/settings.json'))['oai_settings']
keys=['chat_completion_source','custom_url','custom_model','custom_prompt_post_processing','temp_openai','openai_max_tokens','top_p_openai','freq_pen_openai','pres_pen_openai']
assert current['chat_completion_source']=='custom' and current['custom_url']=='https://cdn.sta1n.cn/v1'
assert current['custom_model']==settings['oai_settings']['custom_model']
assert not current.get('custom_include_body') and not current.get('custom_exclude_body') and not current.get('custom_include_headers')
put(E/'configured-model.json',{'nonSensitiveFormalSettings':{k:current.get(k) for k in keys},'source':'D:/github/sillyTavern/data/default-user/settings.json; no secrets file read','developmentModelNotStoryModel':True})
(U/'characters').mkdir();shutil.copy2(OLD/f'data/default-user/characters/{NAME}.png',U/f'characters/{NAME}.png')
parentChat=U/f'chats/{NAME}/{PARENT}.jsonl';parentChat.parent.mkdir(parents=True);shutil.copy2(source,parentChat)
shutil.copy2(source,E/'parent-534.seed.jsonl')

entry=(PREV/'entry.fixture.js').read_text(encoding='utf-8')
entry=entry[:entry.index('// Disposable local controls;')]
bootstrap=(E/'branch-bootstrap.js').read_text(encoding='utf-8').replace('__PARENT_CHAT_JSON__',json.dumps(PARENT,ensure_ascii=False))
anchor="await waitGlobalInitialized('Mvu');"
assert entry.count(anchor)==1
entry=entry.replace(anchor,anchor+'\n'+bootstrap)
catalogLine="const {CLINIC_KNOWLEDGE_CATALOG}=await import('/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs');"
assert entry.count(catalogLine)==1
entry=entry.replace(catalogLine,catalogLine.replace('CLINIC_KNOWLEDGE_CATALOG}','CLINIC_KNOWLEDGE_CATALOG:CONTINUATION_SOURCE_CATALOG}')+"\nconst CLINIC_KNOWLEDGE_CATALOG=continuationCatalog(CONTINUATION_SOURCE_CATALOG);")
entry+='\n'+(E/'controls.js').read_text(encoding='utf-8')
(E/'entry.fixture.js').write_text(entry,encoding='utf-8')
spec=importlib.util.spec_from_file_location('lab',E.parent.parent/'action-failure/timeout-20261105/lab.py')
lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
def transform(card):
    card['chat']=PARENT
    card['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
lab.card_transform(U/f'characters/{NAME}.png',transform)
backend=A/'src/endpoints/backends/chat-completions.js'
body=backend.read_text(encoding='utf-8')
start=body.index('// Disposable local experiment evidence only; no product endpoint.')
body=body[:start]+(E/'evidence-route.fragment.js').read_text(encoding='utf-8')
backend.write_text(body,encoding='utf-8')
put(A/'clinic-natural-config.json',{'evidenceDir':str(E),'captureDir':str(E/'captures'),'phase':'continuation-parent','sequence':0})
put(E/'setup.json',{'app':str(A),'port':PORT,'character':NAME,'parentChatId':PARENT,'copiedParentChat':str(parentChat),
    'sourceActualResponse':534,'sourceMessageId':13,'sourceSavedChat':str(source),'sourceSavedChatSha256':sha(source),
    'sourceRevision':1,'branchMethod':'SillyTavern native branch, then existing adoptNativeChatBranch and persistTavernRuleState',
    'entrySha256':sha(E/'entry.fixture.js'),'dialogueExtraction':False,'classification':'existing local NO_CHECK fixture, not classifier acceptance',
    'credentialsRead':False,'credentialsCopied':False,'externalModelCalls':0,'cumulative':534,'currentAllowance':0,
    'newDependenciesInstalled':False,'runtimeModules':'unchanged copy of verified 534 isolation; only entry/bootstrap and local evidence route differ'})
print(json.dumps({'app':str(A),'port':PORT,'copiedActual534':True,'newAllowance':0,'externalCalls':0},ensure_ascii=False))
