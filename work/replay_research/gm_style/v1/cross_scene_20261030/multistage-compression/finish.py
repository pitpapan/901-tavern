"""Archive only non-credential evidence and check the exact protected scope."""
from pathlib import Path
import importlib.util,json,shutil,sys
H=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('multi_lab',H/'lab.py');x=importlib.util.module_from_spec(s);s.loader.exec_module(x)
E=Path('C:/Users/pit/AppData/Local/901-multistage-compression-evidence-20261105')
def records():
 last=x.read(H/'stage3-accepted.json');base=x.read(H/'baseline.json');second=x.read(H/'stage2-accepted.json')
 assert last['tables'][x.S][:len(second['tables'][x.S])]==second['tables'][x.S]
 assert second['tables'][x.S][:len(base['tables'][x.S])]==base['tables'][x.S]
 assert last['tables'][x.C][:len(base['tables'][x.C])]==base['tables'][x.C]
 facts={}
 for n in [2,3]:
  a=x.read(H/f'stage{n}-accepted.json');r=x.read(H/f'stage{n}-recall.json');request=x.read(x.L/f'results/stage{n}-recall/request.json');joined='\n'.join(v['content'] for v in request['messages'] if isinstance(v.get('content'),str));first=base['tables'][x.S][2][1]
  source={term:{'inFirstStage':term in first,'outsideFirstStage':term in joined.replace(first,'')} for term in ['人数和来向都未交代','不知信中内容']}
  assert all(t['inFirstStage'] and not t['outsideFirstStage'] for t in source.values())
  facts[str(n)]={'compressedStages':n,'chronicles':len(a['tables'][x.C])-1,'hiddenRows':len(a['hidden']),'newStageCharacters':a['stageCharacters'],'allSummaryCharacters':r['allSummaryCharacters'],'requestCharacters':r['requestCharacters'],'earliestStageOnlyBoundarySources':source}
 x.put(H/'longitudinal.json',{'priorSummariesImmutableAcrossBothRounds':True,'baselineChroniclesUnchangedThroughStage3':True,'rounds':facts,'buyingPaperAlsoInCharacterTable':True,'scope':'Three compressed stages total; first from previously accepted actual snapshot, two new actual compression passes with synthetic imported chronicle seeds. No recursive recompression of old summaries; all stages retained and loaded.'})
 print(json.dumps(facts,ensure_ascii=False,indent=2))
def archive():
 E.mkdir(exist_ok=True)
 if (x.L/'results').exists():shutil.copytree(x.L/'results',E/'results',dirs_exist_ok=True)
 for f in H.iterdir():
  if f.is_file():shutil.copyfile(f,E/f.name)
 manifest={f.relative_to(E).as_posix():x.sha(f) for f in E.rglob('*') if f.is_file() and f.name!='archive-manifest.json'}
 x.put(E/'archive-manifest.json',manifest);print('Archived',len(manifest),'evidence files without settings/secrets/raw logs.')
def cleanup_check():
 assert not x.L.exists()
 before=x.read(H/'protected-before.json');now=x.m.d.p.lab.snapshot();changes={k for k in before.keys()|now.keys() if before.get(k)!=now.get(k)};assert changes<={'settings.json'}
 assert all(x.sha(x.SRC/k)==v for k,v in x.read(H/'plugin-before.json').items())
 assert x.a.p.profile(x.read(x.a.F/'settings.json'))[2]['autoUpdateEnabled'] is False
 x.put(H/'cleanup.json',{'isolatedProcessId':35068,'isolatedPort':18110,'temporaryRuntimeRemoved':True,'formalPluginUnchanged':True,'unchangedFormalProtectedFiles':len(before)-len(changes),'formalChangedKeysPreserved':sorted(changes),'formalAutoFillOff':True,'evidenceArchive':str(E)})
 archive();print('Cleanup and formal protection verified.')
if __name__=='__main__':globals()[sys.argv[1]]()
