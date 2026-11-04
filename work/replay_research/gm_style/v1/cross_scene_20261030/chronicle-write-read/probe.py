"""Two-turn write/recall probe of the final installed prompts; formal auto-fill stays off."""
import sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE.parent/'formal-chronicle'))
import fixture as f
from retry import EXPLICIT
from merge import lab, read, profile, S, live_style, TIME, DETAILS, PRIVATE, RECALL, QUANTIFIERS
import json, base64, struct, zlib
L=Path('C:/Users/pit/AppData/Local/901-chronicle-write-read-20261104')
U=L/'data/default-user'
PUBLIC='松桥九拍'
SECRET='灰砚八折'
INPUT1='我等一拨镇民经过，将写着接头记号松桥九拍的便条递给黄泉，说：“请替我收好这张便条。”[我另想了备用记号灰砚八折，但没有告诉任何人。]我等她答复。'
INPUT2='我问黄泉：“刚才我交给你的是什么，上面写的记号是什么？经过的镇民到底有几人、从哪个方向来？我还告诉过你别的记号吗？”我听她回答。'
CHAT=Path('chats')/lab.NAME/(lab.CHAT+'.jsonl')
def prepare():
    assert not L.exists()
    lab.put(HERE/'protected-before.json',lab.snapshot())
    f.L=L;f.U=U;f.FILL_ADD+='\n'+EXPLICIT;f.question=INPUT1
    f.prepare()
    settings=read(U/'settings.json');store,key,cfg=profile(settings)
    assert cfg['charCardPrompt']==profile(read(S))[2]['charCardPrompt']
    cfg['skipUpdateFloors']=0;cfg['manualUpdateContextDepth']=1
    assert cfg['autoUpdateEnabled'] is False
    store[key]=json.dumps(cfg,ensure_ascii=False);lab.put(U/'settings.json',settings)
    rows=[json.loads(l) for l in (U/CHAT).read_text(encoding='utf8').splitlines()]
    tables=rows[3]['TavernDB_ACU_IsolatedData']['']['storageFrame']['checkpoint']['data']
    del tables['sheet_ji_yao_biao']['content'][1:]
    assert not any(PUBLIC in str(v) or SECRET in str(v) for v in rows)
    (U/CHAT).write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows),encoding='utf8')
    p=U/'characters'/(lab.NAME+'.png');out=bytearray(p.read_bytes()[:8])
    for typ,v in f.card(p):
        if typ==b'tEXt' and v.split(b'\0',1)[0] in (b'chara',b'ccv3'):
            j=f.obj(v);scripts=j['data']['extensions']['tavern_helper']['scripts']
            host=next(s for s in scripts if s['name']=='901 帝都初始卡入口')
            before=host['content'];assert before.count("max_chat_history:'all'")==1
            host['content']=before.replace("max_chat_history:'all'","max_chat_history:SillyTavern.chat.some(m=>m.is_user&&m.mes==="+json.dumps(INPUT2,ensure_ascii=False)+")?0:'all'")
            recorder=next(s for s in scripts if s['name']=='数据库事实验收采集')
            opts={'name':lab.NAME,'chatId':lab.CHAT,'rounds':[None,{'id':'new-event','input':INPUT1},{'id':'blind-recall','input':INPUT2}]}
            recorder['content']='const cfg='+json.dumps(opts,ensure_ascii=False)+';\n'+recorder['content'].split('\n',1)[1].replace('localhost:18093','localhost:18094')
            v=v.split(b'\0',1)[0]+b'\0'+base64.b64encode(json.dumps(j,ensure_ascii=False).encode())
        out.extend(struct.pack('>I',len(v))+typ+v+struct.pack('>I',zlib.crc32(typ+v)))
    p.write_bytes(out)
    lab.put(HERE/'scenario.json',{'first':INPUT1,'next':INPUT2,'scope':'Isolated manual fill, exact installed prompts; only recall history is zeroed to distinguish database from original prose.'})
    print('Prepared 18094, auto off, empty chronicle; no formal writes.')
def inspect():
    rows=[json.loads(l) for l in (U/CHAT).read_text(encoding='utf8').splitlines()]
    db=read(U/'worlds'/(lab.BOOK+'.json'))['entries']
    evidence={'messages':[{'user':r['is_user'],'text':r['mes']} for r in rows[1:]],'runs':[],
        'autoUpdateEnabled':profile(read(U/'settings.json'))[2]['autoUpdateEnabled'],
        'chronicles':[e['content'] for e in db.values() if 'CustomExport-纪要-' in e.get('comment','') and '包裹' not in e['comment']],
        'globalState':[line for e in db.values() if e.get('comment','').endswith('ReadableDataTable') for line in e['content'].splitlines() if line.startswith('| 全局状态 |') and '当前详细地点' not in line],
        'npcRows':[line for e in db.values() for line in e['content'].splitlines() if line.startswith(('| 黄泉 |','| 布莱特 |'))]}
    for r in rows[0]['chat_metadata'].get('db_fact_acceptance_20261031',[]):
        for q in r['requests']:
            msgs=q.get('messages',[]);lines=[m for m in msgs if isinstance(m.get('content'),str)]
            if not any(m['role']=='user' and '裁定路径：' in m['content'] for m in lines):continue
            joined='\n'.join(m['content'] for m in lines)
            evidence['runs'].append({'id':r['id'],'model':q['model'],'installedStyle':read(live_style) in joined,
                'firstInputPresent':INPUT1 in joined,'firstReplyPresent':len(rows)>5 and rows[5]['mes'][:35] in joined,
                'secretPresent':SECRET in joined,'memoryMatches':[l for m in lines if m['role']=='system' for l in m['content'].splitlines() if PUBLIC in l],
                'revisions':[x.get('revision') if x else None for x in [r.get('beforeState'),r.get('afterState')]]})
    log=(L/'stdout.log').read_text(encoding='utf8',errors='replace');evidence['fill']=[]
    for block in log.split('Chat Completion request:')[1:]:
        req,_,resp=block.partition('Chat Completion response:')
        if '只输出一对<tableEdit>' not in req:continue
        evidence['fill'].append({'timeRule':TIME in req,'nullRule':EXPLICIT in req,'privateRule':PRIVATE in req,
            'crowdRule':DETAILS in req,'newEventInInput':PUBLIC in req and SECRET in req,
            'returnedInsert':'INSERT INTO chronicle' in resp,'answered':bool(resp),
            'timeSQL':[line.strip() for line in resp.splitlines() if 'INSERT INTO global_state' in line]})
    return evidence
if __name__=='__main__':
    if sys.argv[1]=='prepare':prepare()
    elif sys.argv[1] in ('inspect','first','final'):
        evidence=inspect()
        if sys.argv[1]!='inspect':lab.put(HERE/(sys.argv[1]+'.json'),evidence)
        print(json.dumps(evidence,ensure_ascii=False,indent=2)[:6500])
    elif sys.argv[1]=='protect':
        b=read(HERE/'protected-before.json');a=lab.snapshot()
        assert a==b
        print('All',len(a),'formal files byte-identical, including settings.')
