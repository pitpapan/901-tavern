"""Promote the isolated SQL NULL clarification after evidence passes."""
from retry import EXPLICIT
from merge import *
if __name__=='__main__':
    assert read(HERE/'actual-load.json')['fill'][-1]['sqlNullRule']
    addition='\n'+EXPLICIT
    if sys.argv[1]=='source':
        for p in (DB/'901_动态填表.sqlite.prompts.json',DB/'settings_whitelist_patch.json'):
            x=read(p);prompts=x if isinstance(x,list) else x['profile_merge']['charCardPrompt']
            old=prompts[0]['content'];assert old.endswith(FILL_ADD)
            raw_replace(p,old,old+addition)
    elif sys.argv[1]=='install':
        raw=S.read_bytes();store,key,cfg=profile(json.loads(raw));old=cfg['charCardPrompt'][0]['content']
        assert not cfg['autoUpdateEnabled'] and old.endswith(FILL_ADD)
        baseline=read(lab.FORMAL/'backups/settings_default-user_20261031-090326.json')
        assert sha((lab.FORMAL/'backups/settings_default-user_20261031-090326.json').read_bytes())==read(HERE/'protected-before.json')['settings.json']
        current=json.loads(raw);cs,ck,cc=profile(current);bs,bk,bc=profile(baseline)
        cc['charCardPrompt'][0]['content']=old.removesuffix(FILL_ADD)
        cs[ck]=cc;bs[bk]=bc
        differences=[]
        def diff(a,b,p=''):
            if isinstance(a,dict) and isinstance(b,dict):
                for k in a.keys()|b.keys():diff(a.get(k),b.get(k),p+'/'+k)
            elif a!=b:differences.append(p)
        diff(baseline,current)
        allowed=('plotSettings/agentWorldbookControl/worldbookScope','plotSettings/agentWorldbookControl/agentSkillifyPromptSegments','plotSettings/agentWorldbookControl/agentDecisionPromptSegments','plotSettings/agentWorldbookControl/contextSettingsConfigured','plotSettings/agentPromptTemplates')
        assert all(any(p.endswith('/'+q) for q in allowed) for p in differences),differences
        lab.put(HERE/'before-final-settings.json',{'sha256':sha(raw),'interveningSettingsPathsPreserved':sorted(differences)})
        new=read(DB/'901_动态填表.sqlite.prompts.json')[0]['content']
        assert new==old+addition
        esc=lambda v:json.dumps(v,ensure_ascii=False)[1:-1]
        needle=esc(esc(old)).encode();replacement=esc(esc(new)).encode()
        assert raw.count(needle)==1
        updated=raw.replace(needle,replacement)
        with tempfile.NamedTemporaryFile(dir=S.parent,prefix='.901-prompt-',suffix='.tmp',delete=False) as out:
            out.write(updated);tmp=Path(out.name)
        try:
            assert S.read_bytes()==raw
            os.replace(tmp,S)
        finally:tmp.unlink(missing_ok=True)
    elif sys.argv[1]=='verify':
        b=read(HERE/'protected-before.json');a=lab.snapshot()
        assert set(a)==set(b) and [k for k in a if a[k]!=b[k]]==['settings.json']
        cfg=profile(read(S))[2]
        assert not cfg['autoUpdateEnabled']
        assert cfg['charCardPrompt']==read(DB/'901_动态填表.sqlite.prompts.json')
        esc=lambda v:json.dumps(v,ensure_ascii=False)[1:-1]
        raw=S.read_bytes();needle=esc(esc(FILL_ADD+addition)).encode()
        assert raw.count(needle)==1
        latest=read(HERE/'before-final-settings.json')
        extra=esc(esc(addition)).encode()
        assert raw.count(extra)==1 and sha(raw.replace(extra,b''))==latest['sha256']
        style=next(m['content'] for m in read(STYLE)['modules'] if m['identifier']=='901-gm-style-v1')
        assert read(live_style)==style
        result={'protectedFilesByteIdentical':len(a)-1,'onlySettingsDelta':'901 charCardPrompt[0].content','formalAutoUpdateEnabled':False,
            'modelAndConnectionUnchanged':True,'formalChatsCardsWorldsUnchanged':True,
            'interveningSettingsPathsPreserved':latest['interveningSettingsPathsPreserved'],
            'styleSha256':sha(live_style.read_bytes()),'fillSystemSha256':sha(cfg['charCardPrompt'][0]['content'].encode()),
            'completed':'2026-11-04'}
        lab.put(HERE/'verification.json',result)
        print(json.dumps(result,ensure_ascii=False))
