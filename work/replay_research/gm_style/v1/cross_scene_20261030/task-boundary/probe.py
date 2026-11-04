"""Isolated task-table regression using one real failed sample and two labelled fixtures."""
from pathlib import Path
import sys,json,copy,base64,struct,zlib,shutil,re
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE.parent/'formal-chronicle'))
import fixture as f
from retry import EXPLICIT
from merge import lab,read,profile,S,live_style
L=Path('C:/Users/pit/AppData/Local/901-task-boundary-20261104')
U=L/'data/default-user'
CHAT=Path('chats')/lab.NAME/(lab.CHAT+'.jsonl')
RULE='任务表只记录已明确承接、仍待履行的具体目标或委托。仅出现用途、接头记号、讨论、建议、可能的打算或私人猜想，不成立已承接任务；普通物品交付、保管或一次已完成的日常互动，按证据记入纪要、物品或人物近况，不自动扩成新的待办目标。空任务表可以保持空，不因初始化、剧情推进或表名包含“事件”而补主线。已有明确承接的持续任务照常记录与更新，不要求原文必须使用“任务”二字。主线／支线分类、发布者、期限、奖励、惩罚只取明示证据；未交代的分类及其他字段可为SQL NULL，不从重要性或例子推断。旧表说明中强制初始化主线或强制二选一分类的要求与本条冲突时，以本条为准。'
KEY='sheet_ren_wu_yu_shi_jian_biao'
def patch(tables):
    source=tables[KEY]['sourceData'];before=copy.deepcopy(source)
    source['note']=source['note'].replace('记录所有当前正在进行的任务。','记录已明确承接且仍待履行的任务。').replace('“主线任务”或“支线任务”。','仅在证据明示时填写“主线任务”或“支线任务”；未明示为 SQL NULL。')+'\n'+RULE
    source['initNode']='初始化时仅录入已有明确承接且仍待履行的具体目标；没有符合条件的记录就保持空表。'
    source['insertNode']='已有明确承接的持续目标或委托且尚未完成时才插入；提议、私人打算、一次普通交付或已经结束的日常互动不插入。不得据道具用途反推另有目标。'
    source['updateNode']='只按新证据更新已成立任务的进展，不把提议当作承接、物品交付当作另接新任务。未知的类别、期限及奖罚保持空。'
    assert source['ddl']==before['ddl'] and source['deleteNode']==before['deleteNode']
def config():return read(HERE/'cases.json')
def seed(case):
    name='901 任务边界隔离验收 '+case
    original=lab.FORMAL/CHAT
    rows=[json.loads(l) for l in original.read_text(encoding='utf8').splitlines()[:4]]
    meta=rows[0]['chat_metadata'];meta.pop('db_fact_acceptance_20261031',None)
    scope=meta['TavernDB_ACU_ScopedConfig']['template']['']
    template=json.loads(scope['templateStr']);patch(template);scope['templateStr']=json.dumps(template,ensure_ascii=False)
    if isinstance(scope.get('guideData'),dict) and KEY in scope['guideData']:patch(scope['guideData'])
    patch(meta['TavernDB_ACU_InternalSheetGuide']['tags']['']['data'])
    tables=rows[3]['TavernDB_ACU_IsolatedData']['']['storageFrame']['checkpoint']['data']
    patch(tables);del tables['sheet_ji_yao_biao']['content'][1:]
    assert len(tables[KEY]['content'])==1
    inp,reply=config()[case]['input'],config()[case]['reply']
    user={'name':'御临风','is_user':True,'is_system':False,'mes':inp,'extra':{}}
    gm={'name':lab.NAME,'is_user':False,'is_system':False,'mes':reply,'extra':{}}
    gm['variables']=copy.deepcopy(rows[3]['variables'])
    rows.extend([user,gm]);meta['task_boundary_case']=case
    (U/CHAT).write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows),encoding='utf8')
    shutil.copyfile(lab.FORMAL/'worlds/901_01_世界基础设定_20261023.json',U/'worlds'/(lab.BOOK+'.json'))
    lab.put(L/'active-case.json',{'case':case})
    print('Ready:',case,'five message fixture; no narration generation.')
def prepare():
    assert not L.exists()
    lab.put(HERE/'protected-before.json',lab.snapshot())
    f.L=L;f.U=U;f.FILL_ADD+='\n'+EXPLICIT;f.prepare()
    s=read(U/'settings.json');store,key,cfg=profile(s)
    cfg['charCardPrompt'][0]['content']+='\n'+RULE
    cfg['skipUpdateFloors']=0;cfg['manualUpdateContextDepth']=1
    assert not cfg['autoUpdateEnabled']
    store[key]=json.dumps(cfg,ensure_ascii=False);lab.put(U/'settings.json',s)
    # Change only the recorder UI. The host and current model remain exactly copied.
    p=U/'characters'/(lab.NAME+'.png');out=bytearray(p.read_bytes()[:8])
    panel="""const doc=window.top.document,ctx=()=>window.top.SillyTavern.getContext();
const valid=()=>window.top.location.host==='localhost:18095'&&ctx().characters[ctx().characterId]?.name===NAME&&ctx().chatId===CHAT;
if(!valid())throw Error('Wrong test scope');
await waitGlobalInitialized('Mvu');
const panel=doc.createElement('section');panel.style.cssText='padding:8px;background:#183132;color:white;border:1px solid #9bd;flex-shrink:0;';
const label=doc.createElement('div');label.textContent='任务边界隔离验收：'+ctx().chatMetadata.task_boundary_case;panel.append(label);
const btn=doc.createElement('button');btn.textContent='仅本用例：手动填表一次';btn.style.cssText='width:auto;display:block;';panel.append(btn);
const status=doc.createElement('div');status.textContent='待执行；不要发送剧情消息';panel.append(status);
(doc.querySelector('#sheld')||doc.body).prepend(panel);
btn.onclick=async()=>{if(!valid())return;btn.disabled=true;status.textContent='手动填表执行中';try{const result=await window.top.AutoCardUpdaterAPI.manualUpdate();status.textContent='手动填表返回：'+String(result);}catch(e){status.textContent=String(e);}};
window.addEventListener('pagehide',()=>panel.remove());
"""
    panel='const NAME='+json.dumps(lab.NAME,ensure_ascii=False)+',CHAT='+json.dumps(lab.CHAT,ensure_ascii=False)+';\n'+panel
    for typ,v in f.card(p):
        if typ==b'tEXt' and v.split(b'\0',1)[0] in (b'chara',b'ccv3'):
            j=f.obj(v);scripts=j['data']['extensions']['tavern_helper']['scripts']
            next(x for x in scripts if x['name']=='数据库事实验收采集')['content']=panel
            v=v.split(b'\0',1)[0]+b'\0'+base64.b64encode(json.dumps(j,ensure_ascii=False).encode())
        out.extend(struct.pack('>I',len(v))+typ+v+struct.pack('>I',zlib.crc32(typ+v)))
    p.write_bytes(out)
    baseline=read(HERE.parent/'chronicle-write-read/first.json')['messages']
    cases={'delivery':{'source':'chronicle-write-read/first.json: exact original input and model reply',
        'input':baseline[3]['text'],'reply':baseline[4]['text'],'expected':'no quest row'},
        'proposal':{'source':'controlled isolated fixture, not played Canon',
        'input':'我对黄泉说：“或许可以去找掌柜问问，但这只是个提议，我还没决定，也没接下什么委托。”[我想以后也许能去找那把遗失的钥匙，目前只是私下想法。]',
        'reply':'黄泉说：“那就先不定。”','expected':'no quest row'},
        'accepted':{'source':'controlled isolated fixture, not played Canon',
        'input':'我对黄泉说：“我接下掌柜托我寻找失落铜钥匙的委托，现在还没找到。先把这项待办记住，期限、报酬和失败后果都没有约定。”[我怀疑钥匙在旧井边，但没有告诉她。]',
        'reply':'黄泉点头：“记住了，找掌柜的铜钥匙。还没找到。”','expected':'pending search task; unknown type/time/reward/penalty, no private location as shared knowledge'}}
    lab.put(HERE/'cases.json',cases);lab.put(HERE/'candidate.json',{'systemRule':RULE,'scope':'isolated system segment + task sourceData note/init/insert/update; DDL and other tables unchanged'})
    seed('delivery')
def inspect(case):
    assert read(L/'active-case.json')['case']==case
    entries=read(U/'worlds'/(lab.BOOK+'.json'))['entries']
    chunks=(L/'stdout.log').read_text(encoding='utf8',errors='replace').split('Chat Completion request:')[1:]
    evidence={'case':case,'fixtures':config()[case],'requests':[],
        'exports':{e['comment']:e['content'] for e in entries.values() if 'TavernDB-' in e.get('comment','') and ('ReadableDataTable' in e['comment'] or 'CustomExport-纪要-' in e['comment'])}}
    for part in chunks:
        req,_,resp=part.partition('Chat Completion response:')
        if RULE not in req or config()[case]['input'] not in req:continue
        evidence['requests'].append({'candidateRule':True,'obsoleteForcedMain':'游戏初始化时，根据剧情与设定添加一条主线剧情' in req,
            'autoUpdateEnabled':profile(read(U/'settings.json'))[2]['autoUpdateEnabled'],
            'model':re.search(r"\bmodel: '([^']+)'",req).group(1),
            'responded':bool(resp),'sqlLines':[line.strip() for line in resp.splitlines() if any(x in line for x in ('INSERT INTO','UPDATE ','DELETE FROM'))]})
    rows=[json.loads(l) for l in (U/CHAT).read_text(encoding='utf8').splitlines()]
    evidence['messageCount']=len(rows)-1
    evidence['taskRows']=[]
    for v in evidence['exports'].values():
        section=v.partition('# 任务与事件表')[2].split('\n# ',1)[0]
        if section:evidence['taskRows']+=section.splitlines()
    lab.put(HERE/(case+'.json'),evidence)
    archive=L/'results'/case;archive.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(U/CHAT,archive/'chat.jsonl')
    shutil.copyfile(U/'worlds'/(lab.BOOK+'.json'),archive/'book.json')
    print(json.dumps(evidence,ensure_ascii=False,indent=2)[:7000])
if __name__=='__main__':
    if sys.argv[1]=='prepare':prepare()
    elif sys.argv[1]=='seed':seed(sys.argv[2])
    elif sys.argv[1]=='inspect':inspect(sys.argv[2])
    elif sys.argv[1]=='protect':
        assert lab.snapshot()==read(HERE/'protected-before.json')
        print('All',len(lab.snapshot()),'formal files unchanged.')
