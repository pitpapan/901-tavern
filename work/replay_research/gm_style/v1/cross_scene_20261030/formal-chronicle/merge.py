"""Apply only the adopted author text and the installed 901 database system segment."""
import sys, json, os, hashlib, tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE.parent/'chronicle-precision'))
from prepare import TIME, PRIVATE, DETAILS, RECALL, QUANTIFIERS, lab
ROOT=next(p for p in HERE.parents if (p/'AGENTS.md').exists())
STYLE=ROOT/'work/replay_research/gm_style/v1/authoring.json'
DB=ROOT/'work/replay_research/shujuku_adaptation_v1'
STYLE_ADD='\n'+RECALL+'\n'+QUANTIFIERS
FILL_ADD='\n'+'\n'.join([TIME,PRIVATE,DETAILS,'如聊天保存的旧表说明仍要求每轮推进时钟、禁止空时间或要求填写两个具体时刻，上述剧情证据规则优先。没有依据时，全局表的时间列留空或保持已有值，不据此计算新时刻。'])
S=lab.FORMAL/'settings.json'
live_style=lab.APP/'public/901-opening-combat/narrative-style.json'
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(b): return hashlib.sha256(b).hexdigest()
def profile(s):
    store=s['extension_settings']['__userscripts']['shujuku_v120__userscript_settings_v1']
    key=next(k for k in store if k.endswith('____default____settings'))
    return store,key,json.loads(store[key])
def raw_replace(p,old,new):
    raw=p.read_bytes()
    enc=lambda x:json.dumps(x,ensure_ascii=False)[1:-1].encode()
    assert raw.count(enc(old))==1,p
    p.write_bytes(raw.replace(enc(old),enc(new)))
def author():
    mod=next(m for m in read(STYLE)['modules'] if m['identifier']=='901-gm-style-v1')
    assert mod['content']==read(live_style) and RECALL not in mod['content']
    raw_replace(STYLE,mod['content'],mod['content']+STYLE_ADD)
    for p in (DB/'901_动态填表.sqlite.prompts.json',DB/'settings_whitelist_patch.json'):
        x=read(p); prompts=x if isinstance(x,list) else x['profile_merge']['charCardPrompt']
        old=prompts[0]['content']
        assert old==profile(read(S))[2]['charCardPrompt'][0]['content']
        raw_replace(p,old,old+FILL_ADD)
def install(apply=False):
    raw=S.read_bytes();settings=json.loads(raw)
    store,key,cfg=profile(settings);before=store[key]
    assert cfg['autoUpdateEnabled'] is False and not cfg['strictJsonTableFillEnabled']
    old=cfg['charCardPrompt'][0]['content'];new=read(DB/'901_动态填表.sqlite.prompts.json')[0]['content']
    assert new==old+FILL_ADD
    enc=lambda x:json.dumps(x,ensure_ascii=False)[1:-1]
    assert before.count(enc(old))==1
    after=before.replace(enc(old),enc(new))
    assert raw.count(enc(before).encode())==1
    updated=raw.replace(enc(before).encode(),enc(after).encode())
    # Entire settings byte stream is unchanged outside the prompt's escaped string.
    store[key]=after
    assert json.loads(updated)==settings and profile(settings)[2]['autoUpdateEnabled'] is False
    print('901 prompt chars:',len(old),'->',len(new),'autoUpdateEnabled: false')
    if apply:
        assert S.read_bytes()==raw
        with tempfile.NamedTemporaryFile(dir=S.parent,prefix='.901-prompt-',suffix='.tmp',delete=False) as out:
            out.write(updated);tmp=Path(out.name)
        try:
            assert S.read_bytes()==raw
            os.replace(tmp,S)
        finally: tmp.unlink(missing_ok=True)
        assert S.read_bytes()==updated
if __name__=='__main__':
    action=sys.argv[1]
    if action=='author':
        lab.put(HERE/'protected-before.json',lab.snapshot())
        author()
    elif action in ('review','install'):install(action=='install')
    elif action=='verify':
        b=read(HERE/'protected-before.json');a=lab.snapshot()
        assert set(a)==set(b) and [k for k in a if a[k]!=b[k]]==['settings.json']
        x=read(S);store,key,cfg=profile(x);assert not cfg['autoUpdateEnabled']
        content=cfg['charCardPrompt'][0]['content'];assert content.endswith(FILL_ADD)
        raw=S.read_bytes();esc=lambda v:json.dumps(v,ensure_ascii=False)[1:-1]
        needle=esc(esc(FILL_ADD)).encode()
        assert raw.count(needle)==1 and sha(raw.replace(needle,b''))==b['settings.json']
        assert read(live_style)==next(m['content'] for m in read(STYLE)['modules'] if m['identifier']=='901-gm-style-v1')
        print('Protected:',len(a)-1,'byte-identical; settings delta exactly approved; auto off; formal style matches.')
