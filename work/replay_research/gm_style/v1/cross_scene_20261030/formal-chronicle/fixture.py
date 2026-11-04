"""Build a throwaway client from the installed prompt, style loader and legacy chat guide."""
import base64, shutil, zlib, struct
from merge import *
L=Path(os.environ['LOCALAPPDATA'])/'901-formal-chronicle-load-20261031'
U=L/'data/default-user'
question='我问黄泉：“你还记得刚才经过的是什么人、来了多少、从哪边来，还有他们当面约定的接头记号吗？我们把这个记号也写到留给掌柜的便条上吧。”[我心里另想了一个备用记号：灰砚八折，没有告诉她。]我等她答复。'
fact='黄泉亲眼见一拨镇民经过；人数未详，来向未详。领头的当着御临风和黄泉的面约定接头记号“青瓦三叶”。'
def card(src):
    raw=src.read_bytes();i=8
    while i<len(raw):
        n=int.from_bytes(raw[i:i+4],'big');typ=raw[i+4:i+8];v=raw[i+8:i+8+n]
        yield typ,v
        i+=12+n
def obj(v):return json.loads(base64.b64decode(v.split(b'\0',1)[1]))
def scripts(v):return obj(v)['data']['extensions']['tavern_helper']['scripts']
def prepare():
    s=read(S);store,key,cfg=profile(s)
    assert not cfg['autoUpdateEnabled'] and cfg['charCardPrompt'][0]['content'].endswith(FILL_ADD)
    assert not L.exists();U.mkdir(parents=True)
    shutil.copyfile(lab.APP/'config.yaml',L/'config.yaml')
    # Test-only fill uses the current main connection; copy no separate fill credentials.
    for api in [cfg]+cfg['apiPresets']:
        api['apiMode']='custom'
        api['apiConfig'].update(useMainApi=True,apiKey='',url='',requestHeaders='')
    store[key]=json.dumps(cfg,ensure_ascii=False)
    lab.put(U/'settings.json',s)
    active=[r for r in read(lab.FORMAL/'secrets.json')['api_key_custom'] if r.get('active')]
    assert len(active)==1
    lab.put(U/'secrets.json',{'api_key_custom':active})
    for key in ('OpenAI Settings','context','instruct','sysprompt','TextGen Settings','themes','extensions'):
        shutil.copytree(lab.FORMAL/key,U/key,ignore=shutil.ignore_patterns('.git','node_modules'))
    extras=next(b['extraBooks'] for b in s['world_info_settings']['world_info']['charLore'] if b['name']==lab.NAME)
    (U/'worlds').mkdir()
    for b in ['901_01_世界基础设定_20261023',*extras]:
        shutil.copyfile(lab.FORMAL/'worlds'/(b+'.json'),U/'worlds'/(b+'.json'))
    shutil.copyfile(lab.FORMAL/'worlds/901_01_世界基础设定_20261023.json',U/'worlds'/(lab.BOOK+'.json'))
    path=Path('chats')/lab.NAME/(lab.CHAT+'.jsonl')
    rows=[json.loads(line) for line in (lab.FORMAL/path).read_text(encoding='utf8').splitlines()[:4]]
    rows[0]['chat_metadata'].pop('db_fact_acceptance_20261031',None)
    sheet=rows[3]['TavernDB_ACU_IsolatedData']['']['storageFrame']['checkpoint']['data']['sheet_ji_yao_biao']
    assert len(sheet['content'])==2 and '2.时间跨度格式为' in sheet['sourceData']['note']
    sheet['content'][1]=[1,'AM0001','未交代','镇民留下接头记号。',fact,'青瓦三叶']
    (U/path).parent.mkdir(parents=True);(U/path).write_text(''.join(json.dumps(v,ensure_ascii=False)+'\n' for v in rows),encoding='utf8')
    formalcard=lab.FORMAL/'characters/901 帝都初始卡.png'
    host=next(s['content'] for typ,v in card(formalcard) if typ==b'tEXt' and v.startswith(b'chara\0') for s in scripts(v) if s['name']=='901 帝都初始卡入口')
    src=lab.FORMAL/'characters'/(lab.NAME+'.png');dst=U/'characters'/src.name
    rec=(lab.APP/'public/901-db-fact-20261031/recorder.js').read_text(encoding='utf8').split('\n',2)[2]
    opts={'name':lab.NAME,'chatId':lab.CHAT,'rounds':[None,{'id':'formal-load','input':question}]}
    rec='const cfg='+json.dumps(opts,ensure_ascii=False)+';\n'+rec
    rec+='\nconst one=doc.createElement("button");one.className="menu_button";one.textContent="仅隔离聊天：手动填表一次";panel.append(one);one.onclick=async()=>{if(!valid()||location.host!=="localhost:18093" && window.top.location.host!=="localhost:18093")return;one.disabled=true;try{status.textContent="手动填表执行中";status.textContent="手动填表返回："+String(await window.top.AutoCardUpdaterAPI.manualUpdate());}catch(e){status.textContent=String(e);}};'
    out=bytearray(src.read_bytes()[:8]);count=0
    for typ,v in card(src):
        if typ==b'tEXt' and v.split(b'\0',1)[0] in (b'chara',b'ccv3'):
            j=obj(v);ss=j['data']['extensions']['tavern_helper']['scripts']
            assert next(s['content'] for s in ss if s['name']=='901 帝都初始卡入口')==host
            next(s for s in ss if s['name']=='数据库事实验收采集')['content']=rec
            v=v.split(b'\0')[0]+b'\0'+base64.b64encode(json.dumps(j,ensure_ascii=False).encode());count+=1
        out.extend(struct.pack('>I',len(v))+typ+v+struct.pack('>I',zlib.crc32(typ+v)))
    assert count>=1 and "fetch('/901-opening-combat/narrative-style.json')" in host
    dst.parent.mkdir();dst.write_bytes(out)
    print('Isolated data ready; installed host identical; auto fill OFF; legacy guide retained.')
if __name__=='__main__':prepare()
