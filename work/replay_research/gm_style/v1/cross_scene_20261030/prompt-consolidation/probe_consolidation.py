"""Isolated rules-only changes with real manual fill calls through the existing UI."""
from pathlib import Path
import sys,json,copy,base64,struct,zlib,shutil
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE.parent/'task-boundary'))
import probe as p
from merge import profile,read
from candidate import SYSTEM,RULES,patch
L=Path('C:/Users/pit/AppData/Local/901-prompt-consolidation-20261104')
U=L/'data/default-user'

def bind():
    p.L=L;p.U=U;p.HERE=HERE;p.patch=patch;p.RULE=SYSTEM.splitlines()[0]

def inspect(case):
    p.inspect(case)
    e=read(HERE/(case+'.json'))
    chunks=(L/'stdout.log').read_text(encoding='utf8',errors='replace').split('Chat Completion request:')[1:]
    requests=[x.partition('Chat Completion response:')[0] for x in chunks if read(HERE/'cases.json')[case]['input'] in x.partition('Chat Completion response:')[0]]
    assert requests
    e['requestAttemptsSeen']=len(requests)
    e['requests']=e['requests'][-1:]
    req=requests[-1]
    e['loadedSystemLines']=all(line in req for line in SYSTEM.splitlines())
    e['loadedTableNotes']={name:all(piece in req for piece in rule['note'].split('$RECENT_CHRONICLE_ROWS')) for name,rule in RULES.items()}
    e['obsoleteTriggersPresent']=[s for s in ('每轮交互后必须更新此表','游戏初始化时，根据剧情与设定添加一条主线剧情','每轮交互结束后立刻插入一条新记录','其余字段均不可写 NULL 或空串') if s in req]
    p.lab.put(HERE/(case+'.json'),e)
    print('Loaded consolidated SYSTEM:',e['loadedSystemLines'],'table notes:',e['loadedTableNotes'],'obsolete triggers:',e['obsoleteTriggersPresent'])

def sources():
    path=p.lab.FORMAL/p.CHAT
    rows=[json.loads(l) for l in path.read_text(encoding='utf8').splitlines()]
    tables=rows[0]['chat_metadata']['TavernDB_ACU_InternalSheetGuide']['tags']['']['data']
    before=copy.deepcopy({t['name']:t['sourceData'] for t in tables.values() if isinstance(t,dict) and 'sourceData'in t})
    patch(tables)
    after={t['name']:t['sourceData'] for t in tables.values() if isinstance(t,dict) and 'sourceData'in t}
    prompts=copy.deepcopy(profile(read(p.lab.FORMAL/'settings.json'))[2]['charCardPrompt'])
    original=prompts[0]['content'];prompts[0]['content']=SYSTEM
    p.lab.put(HERE/'prompts.candidate.json',prompts)
    p.lab.put(HERE/'table-rules.before.json',before);p.lab.put(HERE/'table-rules.candidate.json',after)
    p.lab.put(HERE/'size-comparison.json',{'systemBefore':len(original),'systemAfter':len(SYSTEM),
        'tableRulesBefore':sum(len(v) for t in before.values() for k,v in t.items() if k!='ddl'),
        'tableRulesAfter':sum(len(v) for t in after.values() for k,v in t.items() if k!='ddl'),
        'tableCount':len(before),'ddlUnchanged':all(before[k]['ddl']==after[k]['ddl'] for k in before)})
    print(json.dumps(read(HERE/'size-comparison.json'),ensure_ascii=False))

def prepare():
    assert not L.exists();p.lab.put(HERE/'protected-before.json',p.lab.snapshot())
    p.f.L=L;p.f.U=U;p.f.FILL_ADD+='\n'+p.EXPLICIT+'\n'+p.RULE;p.f.prepare()
    s=read(U/'settings.json');store,key,cfg=profile(s)
    cfg['charCardPrompt']=read(HERE/'prompts.candidate.json')
    cfg['skipUpdateFloors']=0;cfg['manualUpdateContextDepth']=1
    assert not cfg['autoUpdateEnabled'];store[key]=json.dumps(cfg,ensure_ascii=False)
    tk=next(k for k in store if k.endswith('____default____template'))
    tpl=json.loads(store[tk]);patch(tpl);store[tk]=json.dumps(tpl,ensure_ascii=False)
    p.lab.put(U/'settings.json',s)
    src=Path('C:/Users/pit/AppData/Local/901-formal-task-evidence-20261104/characters')/(p.lab.NAME+'.png')
    out=bytearray(src.read_bytes()[:8])
    for typ,v in p.f.card(src):
        if typ==b'tEXt' and v.split(b'\0',1)[0] in (b'chara',b'ccv3'):
            j=p.f.obj(v);r=next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集')
            assert 'localhost:18096' in r['content'];r['content']=r['content'].replace('localhost:18096','localhost:18097')
            v=v.split(b'\0',1)[0]+b'\0'+base64.b64encode(json.dumps(j,ensure_ascii=False).encode())
        out.extend(struct.pack('>I',len(v))+typ+v+struct.pack('>I',zlib.crc32(typ+v)))
    (U/'characters'/src.name).write_bytes(out)
    cases={'delivery':read(HERE.parent/'task-boundary/cases.json')['delivery'],
      'facts':{'source':'controlled isolated fixture; not Canon',
       'input':'已确认当前剧情时间是2026年2月4日09:00。我对黄泉说：“我已接下掌柜托我寻找失落铜钥匙的委托，现在还没找到，期限、报酬和失败后果都没有约定。”[我怀疑钥匙在旧井边，但没有告诉她。]我原有2瓶治疗药水，刚实际用掉1瓶，现在剩1瓶。两名镇民从西侧经过。我只读过火球术介绍，没有学会。',
       'reply':'黄泉点头：“记住了，找掌柜的铜钥匙。”御临风用掉一瓶治疗药水后还剩一瓶。两名镇民从西侧走过。',
       'expected':'one accepted task; NULL metadata; cur_time09:00; one potion; no learned skill; no options; exact crowd count/origin; private ownership'},
      'repeat':{'source':'out-of-story no-change check after facts; not Canon',
       'input':'（桌外：这是记忆核对，本轮没有新增剧情或状态变化，不重复记录上轮事件。）',
       'reply':'（桌外：本轮无新增剧情。）','expected':'empty SQL; all stored tables and chronicle unchanged'}}
    p.lab.put(HERE/'cases.json',cases)
    bind();p.seed('delivery')

def repeat():
    rows=[json.loads(l) for l in (U/p.CHAT).read_text(encoding='utf8').splitlines()]
    assert rows[0]['chat_metadata']['task_boundary_case']=='facts'
    rows[0]['chat_metadata']['task_boundary_case']='repeat'
    case=read(HERE/'cases.json')['repeat']
    rows.extend([{'name':'御临风','is_user':True,'is_system':False,'mes':case['input'],'extra':{}},
      {'name':p.lab.NAME,'is_user':False,'is_system':False,'mes':case['reply'],'extra':{},'variables':copy.deepcopy(rows[-1]['variables'])}])
    (U/p.CHAT).write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in rows),encoding='utf8')
    p.lab.put(L/'active-case.json',{'case':'repeat'});print('Ready: repeat; preserve facts state and append only two out-of-story messages.')

if __name__=='__main__':
    a=sys.argv[1]
    if a=='sources':sources()
    elif a=='prepare':prepare()
    elif a=='repeat':repeat()
    elif a in ('seed','inspect'):
        bind()
        if a=='inspect':inspect(sys.argv[2])
        else:p.seed(sys.argv[2])
    elif a=='protect':
        assert p.lab.snapshot()==read(HERE/'protected-before.json')
        print('All',len(p.lab.snapshot()),'formal files unchanged.')
