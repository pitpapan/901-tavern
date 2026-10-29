"""Read actual native-send evidence; never edit host files or infer semantic correctness."""
from pathlib import Path
import json,hashlib,struct,base64,sys,subprocess
ROOT=Path(__file__).resolve().parents[4]
OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate/scene_test/formal-live-20261028'
HOME=Path('D:/github/sillyTavern')
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
cfg=read(OUT/'config.json');baseline=read(OUT/'protected-before.json');installation=read(OUT/'installation.json')
errors=[]
def check(ok,message):
    if not ok:errors.append(message)
def text_content(c):
    if isinstance(c,str):return c
    if isinstance(c,list):return '\n'.join(x.get('text','') for x in c if isinstance(x,dict))
    return ''
def prompt(q):return '\n'.join(text_content(m.get('content')) for m in q['messages'])
def card(p):
    data=p.read_bytes();at=8
    while at<len(data):
        n=struct.unpack('>I',data[at:at+4])[0];kind=data[at+4:at+8];body=data[at+8:at+8+n];at+=12+n
        if kind==b'tEXt' and body.startswith(b'chara\0'):return json.loads(base64.b64decode(body[6:]))
    raise ValueError('Missing character metadata')
definitions={}
for name,h in cfg['bookHashes'].items():
    p=HOME/'data/default-user/worlds'/(name+'.json');check(sha(p)==h,'Installed book changed: '+name)
    definitions.update({e['uid']:e for e in read(p)['entries'].values()})
avatar=installation['avatar']
isolated=card(HOME/'data/default-user/characters'/(avatar if avatar.endswith('.png') else avatar+'.png'))
script=next(s for s in isolated['data']['extensions']['tavern_helper']['scripts'] if s['name']=='901 帝都初始卡入口')
check(hashlib.sha256(script['content'].encode()).hexdigest()==cfg['hostEntrySha256'],'Host entry differs from installed formal entry')
required={'qualification':{'人物·猫音','洛汀岩地矿料与工艺'},'secrets':{'银月城','人物·白色魔法使','人物·肯达·凯·弗格斯'},'materials':{'洛汀岩地矿料与工艺'}}
reports=[];missing=[]
for case in cfg['cases']:
    path=HOME/'data/default-user/chats'/cfg['name']/(case['chatId']+'.jsonl')
    raw=path.read_bytes();rows=[json.loads(x) for x in raw.decode('utf8').splitlines()]
    run=rows[0]['chat_metadata'].get('formal_world_acceptance')
    if not run:missing.append(case['id']);continue
    (OUT/(case['id']+'-live.jsonl')).write_bytes(raw)
    check(run['input']==case['input'] and run['entrySha256']==cfg['hostEntrySha256'],'Case input or entry reference changed')
    messages=rows[1:];users=[m for m in messages if m.get('is_user')]
    check(len(users)==1 and users[0]['mes']==case['input'],case['id']+': native input differs or repeated')
    check(len(messages)==3,case['id']+': unexpected number of messages')
    gate=messages[-1].get('extra',{}).get('901_replay_gate',{})
    check(gate.get('status')=='NO_CHECK',case['id']+': not an actual NO_CHECK host response')
    classifiers=[q for q in run['requests'] if '玩家原始行动：'+case['input'] in prompt(q)]
    narrations=[q for q in run['requests'] if '玩家行动：'+case['input'] in prompt(q) and '裁定路径：NO_CHECK' in prompt(q)]
    recovery=run.get('recovery')
    check(len(classifiers)==1,case['id']+': classification request count mismatch')
    check(len(narrations)==(2 if recovery else 1),case['id']+': actual narration request count mismatch')
    if recovery:
        recovery_requests=run['requests'][recovery['requestOffset']:]
        check(not any(q in classifiers for q in recovery_requests),case['id']+': recovery reclassified action')
        check(sum(q in narrations for q in recovery_requests)==1,case['id']+': recovery continuation count mismatch')
        check(recovery['priorGate']['status']=='NARRATION_PENDING',case['id']+': recovery was not a pending continuation')
        check(recovery['priorGate']['operationId']==gate.get('operationId'),case['id']+': recovery changed operation identity')
    for q in classifiers+narrations:check(q['model']==cfg['model']['model'],case['id']+': model changed')
    if not narrations:continue
    joined=prompt(narrations[-1]);included=[]
    check(joined.count(cfg['worldContextGuidance'])==1,case['id']+': formal guidance absent or duplicated')
    for e in definitions.values():
        n=joined.count(e['content'])
        if not n:continue
        check(not e['disable'],case['id']+': disabled entry injected: '+e['comment'])
        check(n==1,case['id']+': duplicate entry: '+e['comment'])
        included.append({'uid':e['uid'],'name':e['comment'],'copies':n})
    check(required[case['id']] <= {e['name'] for e in included},case['id']+': required entry missing')
    # Only the final continuation scan is within the production six-book filter;
    # the stopped native outer preparation may observe unrelated global books.
    check(bool(run['activated']),case['id']+': no host activation event')
    final_activation=run['activated'][-1] if run['activated'] else []
    check(all(e['world'] in cfg['books'] for e in final_activation),case['id']+': final activation outside six books')
    check({e['uid'] for e in final_activation}=={e['uid'] for e in included},case['id']+': activation differs from actual narration bodies')
    root=run.get('afterRoot');check(bool(root) and root.get('chatId')==case['chatId'],case['id']+': wrong isolated rules identity')
    if root:
        check(root.get('revision')==0 and root.get('operations')=={},case['id']+': unexpected rule operation')
        saved=messages[-1].get('variables',[{}])[messages[-1].get('swipe_id',0)].get('stat_data',{}).get('901_rules_poc')
        check(saved==root,case['id']+': recorded root differs from persisted final page')
        if run.get('beforeRoot'):check(run['beforeRoot']==root,case['id']+': rule state changed')
        if recovery:check(recovery['beforeRoot']==root,case['id']+': recovery changed rule state')
        for m in messages:
            state=m.get('variables',[{}])[m.get('swipe_id',0)].get('stat_data',{}).get('901_rules_poc')
            if state:check(state==root,case['id']+': initialized state changed across floors')
    reports.append({'id':case['id'],'input':case['input'],'messageCount':len(messages),'settingsEvents':len(run['requests']),
      'classificationRequests':len(classifiers),'narrationRequests':len(narrations),'otherPreparedEvents':len(run['requests'])-len(classifiers)-len(narrations),
      'pendingContinuationRecovery':bool(recovery),'failedNarrationRequests':1 if recovery else 0,
      'model':narrations[0]['model'],'gateStatus':gate.get('status'),'included':included,'response':messages[-1]['mes'],
      'rootRevision':root.get('revision') if root else None,'rootOperations':len(root.get('operations',{})) if root else None,
      'budgets':[s['budget'] for s in run['scan']],'started':run['started'],'finished':run['finished']})
changed=[p for p,h in baseline['files'].items() if not (HOME/p).exists() or sha(HOME/p)!=h]
formal_chat='data/default-user/chats/901 帝都初始卡/901 初始卡石像撤离实测 - 2026-10-22.jsonl'
resume=read(OUT/'retry-resume-before.json') if (OUT/'retry-resume-before.json').exists() else None
if resume:check(sha(HOME/formal_chat)==resume['formalChatSha256'],'Formal chat changed during isolated retry')
user_append=None
if formal_chat in changed:
    # User explicitly confirmed sending "测试" during this acceptance run.
    # Compare the exact original bytes, not a normalization that could hide edits.
    raw=(HOME/formal_chat).read_bytes();lines=raw.splitlines(keepends=True)
    original=b''.join(lines[:28]).rstrip(b'\r\n')
    rows=[json.loads(s) for s in raw.decode('utf8').splitlines()]
    original_ok=hashlib.sha256(original).hexdigest()==baseline['files'][formal_chat]
    check(original_ok,'Formal original 27 messages or header changed')
    append_ok=len(rows)==30 and rows[28].get('is_user') and rows[28]['mes']=='测试' and not rows[29].get('is_user')
    check(append_ok,'Unexpected formal chat append beyond confirmed user test')
    original_root=rows[27]['variables'][0]['stat_data']['901_rules_poc']
    roots_ok=all(m.get('variables',[{}])[0].get('stat_data',{}).get('901_rules_poc')==original_root for m in rows[28:])
    check(roots_ok,'Rule state changed in user-confirmed formal test')
    user_append={'file':formal_chat,'userConfirmed':True,'input':'测试','originalMessages':27,'currentMessages':len(rows)-1,
      'originalBytePrefixUnchanged':original_ok,'appendedMessages':len(rows)-28,'rulesRootUnchanged':roots_ok,'action':'preserved; no rollback'}
check(not [p for p in changed if p!=formal_chat],'Pre-existing files changed: '+', '.join(p for p in changed if p!=formal_chat))
settings=read(HOME/'data/default-user/settings.json')
setting_hashes=json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import{readFileSync}from'node:fs';import{createHash}from'node:crypto';const s=JSON.parse(readFileSync('D:/github/sillyTavern/data/default-user/settings.json','utf8'));const h=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');console.log(JSON.stringify({modelSettingsHash:h(s.oai_settings),memorySettingsHash:h(s.extension_settings.memory)}));"],text=True))
for key,value in setting_hashes.items():check(value==baseline[key],key+' changed')
for key,field in [('source','chat_completion_source'),('model','google_model'),('maxContext','openai_max_context'),('maxTokens','openai_max_tokens')]:
    check(settings['oai_settings'][field]==cfg['model'][key],'Model setting changed: '+key)
expected_world=baseline['worldSettings']
expected_world['world_info'].setdefault('charLore',[]).append({'name':cfg['name'],'extraBooks':cfg['books'][1:]})
check(settings['world_info_settings']==expected_world,'World scan, global selection or original bindings changed')
if '--complete' in sys.argv:check(not missing,'Missing cases: '+', '.join(missing))
result={'status':'fail' if errors else 'pending' if missing else 'pass','scope':'native formal host path on isolated chats; request/state checks, semantic review separate',
 'errors':errors,'missing':missing,'cases':reports,'protectedFiles':len(baseline['files']),'changedProtectedFiles':changed,
 'protectedFilesByteUnchanged':len(baseline['files'])-len(changed),'userConfirmedAppend':user_append,
 'formalChatUnchangedDuringRetry':sha(HOME/formal_chat)==resume['formalChatSha256'] if resume else None,
 'model':cfg['model'],'settingsHashes':setting_hashes,'formalEntryIdentical':True,'limits':['三题不是580条逐条测试','不把settings事件总数当作实际调用数','没有在正式聊天发送或更改存档','语义由主会话逐句核对']}
(OUT/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(result,ensure_ascii=False,indent=2));raise SystemExit(bool(errors))
