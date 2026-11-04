"""Install the adopted rule without migrating any existing chat or table history."""
from pathlib import Path
import sys,json,tempfile,os,hashlib,shutil,base64,struct,zlib
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE.parent/'task-boundary'))
import probe as p
from merge import DB,S,profile,read,raw_replace
L=Path('C:/Users/pit/AppData/Local/901-formal-task-20261104')
U=L/'data/default-user'
ADD='\n'+p.RULE
esc=lambda s:json.dumps(s,ensure_ascii=False)[1:-1]
sha=lambda b:hashlib.sha256(b).hexdigest()

def author():
    p.lab.put(HERE/'protected-before.json',p.lab.snapshot())
    current=profile(read(S))[2]['charCardPrompt'][0]['content']
    assert p.RULE not in current
    for path in (DB/'901_动态填表.sqlite.prompts.json',DB/'settings_whitelist_patch.json'):
        obj=read(path);prompts=obj if isinstance(obj,list) else obj['profile_merge']['charCardPrompt']
        assert prompts[0]['content']==current
        raw_replace(path,current,current+ADD)
    print('Author prompt and whitelist updated with the adopted rule only.')

def install(apply=False):
    raw=S.read_bytes();settings=json.loads(raw);store,key,cfg=profile(settings)
    before=store[key];old=cfg['charCardPrompt'][0]['content']
    new=read(DB/'901_动态填表.sqlite.prompts.json')[0]['content']
    assert new==old+ADD and not cfg['autoUpdateEnabled'] and not cfg['strictJsonTableFillEnabled']
    assert before.count(esc(old))==1
    after=before.replace(esc(old),esc(new))
    assert raw.count(esc(before).encode())==1
    updated=raw.replace(esc(before).encode(),esc(after).encode())
    store[key]=after;assert json.loads(updated)==settings
    print('Only fill SYSTEM changes:',len(old),'->',len(new),'characters; auto off; template library and all chats unchanged.')
    if apply:
        assert S.read_bytes()==raw
        with tempfile.NamedTemporaryFile(dir=S.parent,prefix='.901-task-',suffix='.tmp',delete=False) as out:
            out.write(updated);tmp=Path(out.name)
        try:
            assert S.read_bytes()==raw
            os.replace(tmp,S)
        finally:tmp.unlink(missing_ok=True)
        verify()

def verify():
    before=read(HERE/'protected-before.json');after=p.lab.snapshot()
    assert set(before)==set(after)
    changed=[k for k in after if after[k]!=before[k]];assert changed==['settings.json'],changed
    raw=S.read_bytes();needle=esc(esc(ADD)).encode()
    assert raw.count(needle)==1 and sha(raw.replace(needle,b''))==before['settings.json']
    cfg=profile(read(S))[2];assert not cfg['autoUpdateEnabled']
    assert cfg['charCardPrompt']==read(DB/'901_动态填表.sqlite.prompts.json')
    assert cfg['charCardPrompt']==read(DB/'settings_whitelist_patch.json')['profile_merge']['charCardPrompt']
    p.lab.put(HERE/'protection-after.json',{'protectedFilesUnchanged':len(after)-1,'changedFiles':changed,'settingsDeltaExactlyAdoptedSystemRule':True,'autoUpdateEnabled':False})
    print('PASS:',len(after)-1,'formal files unchanged; complete settings delta equals the adopted SYSTEM rule.')

def bind():
    p.L=L;p.U=U;p.HERE=HERE
    # Keep every legacy task sourceData instruction intact for compatibility testing.
    p.patch=lambda tables:None

def prepare():
    assert not L.exists()
    p.f.L=L;p.f.U=U;p.f.FILL_ADD+='\n'+p.EXPLICIT+ADD;p.f.prepare()
    s=read(U/'settings.json');store,key,cfg=profile(s)
    assert cfg['charCardPrompt']==profile(read(S))[2]['charCardPrompt']
    cfg['skipUpdateFloors']=0;cfg['manualUpdateContextDepth']=1
    store[key]=json.dumps(cfg,ensure_ascii=False);p.lab.put(U/'settings.json',s)
    # Reuse the tested button; only its allowed isolated port changes.
    src=Path('C:/Users/pit/AppData/Local/901-task-boundary-evidence-20261104/characters')/(p.lab.NAME+'.png')
    out=bytearray(src.read_bytes()[:8])
    for typ,v in p.f.card(src):
        if typ==b'tEXt' and v.split(b'\0',1)[0] in (b'chara',b'ccv3'):
            j=p.f.obj(v);scripts=j['data']['extensions']['tavern_helper']['scripts']
            recorder=next(x for x in scripts if x['name']=='数据库事实验收采集')
            assert 'localhost:18095' in recorder['content']
            recorder['content']=recorder['content'].replace('localhost:18095','localhost:18096')
            v=v.split(b'\0',1)[0]+b'\0'+base64.b64encode(json.dumps(j,ensure_ascii=False).encode())
        out.extend(struct.pack('>I',len(v))+typ+v+struct.pack('>I',zlib.crc32(typ+v)))
    (U/'characters'/src.name).write_bytes(out)
    shutil.copyfile(HERE.parent/'task-boundary/cases.json',HERE/'cases.json')
    bind();p.seed('delivery')

if __name__=='__main__':
    action=sys.argv[1]
    if action=='author':author()
    elif action in ('review','install'):install(action=='install')
    elif action=='verify':verify()
    elif action=='prepare':prepare()
    elif action in ('seed','inspect'):
        bind();getattr(p,action)(sys.argv[2])
