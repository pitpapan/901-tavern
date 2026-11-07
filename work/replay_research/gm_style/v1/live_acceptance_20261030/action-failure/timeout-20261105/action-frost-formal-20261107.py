"""Install the adopted seven modules and paired mage entry without touching play data."""
import json, shutil, sys, urllib.request, subprocess
from pathlib import Path
import lab

R=lab.H.parents[6]
S=lab.L/'action-sweep-20261107'
P=S/'formal-merge-20261107'
REL=Path('public/901-opening-combat/work/rules_engine')
PAGE='frost-browser-acceptance-20261107.html'
BOOK='901_04_能力与战力_20261023.json'
UID='1273564015'
read=lambda p:json.loads(p.read_text(encoding='utf8'))

def prepare():
    rows=read(P/'modules.json')
    for row in rows:
        rel=row['file']; src=P/'candidate'/rel
        assert lab.sha(src)==row['after']==lab.sha(R/'work/rules_engine'/rel)
        assert lab.sha(lab.APP/REL/rel)==row['before']
        with urllib.request.urlopen('http://127.0.0.1:18116/901-opening-combat/work/rules_engine/'+rel,timeout=15) as response:
            assert response.read()==src.read_bytes(),rel
    raw=(lab.F/'worlds'/BOOK).read_bytes(); old=json.loads(raw)
    candidate=read(R/'output/replay_tavern/six_books_20261023_candidate/import'/BOOK)
    assert {k for k in old['entries'].keys()|candidate['entries'].keys() if old['entries'].get(k)!=candidate['entries'].get(k)}=={UID}
    # Copy the resource line's paired entry; preserve all other formal book fields.
    updated=json.loads(raw);updated['entries'][UID]=candidate['entries'][UID]
    (P/'world.before.json').write_bytes(raw);lab.put(P/'world.candidate.json',updated)
    shutil.copyfile(lab.H/PAGE,P/PAGE)
    assert not (lab.APP/'public/901-opening-combat'/PAGE).exists()
    lab.put(P/'plan.json',{'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip(),'modules':rows,'world':{'file':BOOK,'uid':UID,'before':lab.sha(P/'world.before.json'),'after':lab.sha(P/'world.candidate.json')},'pageSha256':lab.sha(P/PAGE),'isolatedHTTPMatches':True})
    print('Prepared and HTTP-verified 7 modules; paired mage entry only. No formal writes.')

def install():
    assert not (P/'installed.json').exists()
    plan=read(P/'plan.json');protected=read(P/'protected-before.json')
    current=lab.snapshot()
    assert protected==current,'Formal data changed since this batch began; inspect before installing'
    for row in plan['modules']:
        assert lab.sha(lab.APP/REL/row['file'])==row['before']
        assert lab.sha(P/'candidate'/row['file'])==row['after']
    assert lab.sha(lab.F/'worlds'/BOOK)==plan['world']['before']
    assert lab.sha(P/'world.candidate.json')==plan['world']['after']
    assert not (lab.APP/'public/901-opening-combat'/PAGE).exists()
    for row in plan['modules']:shutil.copyfile(P/'candidate'/row['file'],lab.APP/REL/row['file'])
    shutil.copyfile(P/'world.candidate.json',lab.F/'worlds'/BOOK)
    shutil.copyfile(P/PAGE,lab.APP/'public/901-opening-combat'/PAGE)
    lab.put(P/'installed.json',plan)
    print('Installed 7 modules, one paired mage entry and temporary memory-only test page. No settings/chat/card writes.')

def verify():
    plan=read(P/'installed.json');before=read(P/'protected-before.json');after=lab.snapshot()
    allowed={str(lab.APP/REL/x['file']) for x in plan['modules']}|{str(lab.F/'worlds'/BOOK),str(lab.APP/'public/901-opening-combat'/PAGE)}
    changes=[k for k in before.keys()|after.keys() if before.get(k)!=after.get(k)]
    assert set(changes)<=allowed,changes
    for row in plan['modules']:
        assert lab.sha(lab.APP/REL/row['file'])==row['after']
        with urllib.request.urlopen('http://127.0.0.1:8000/901-opening-combat/work/rules_engine/'+row['file'],timeout=15) as response:
            assert response.read()==(P/'candidate'/row['file']).read_bytes()
    old=read(P/'world.before.json');new=read(lab.F/'worlds'/BOOK)
    entry=new['entries'][UID];new['entries'][UID]=old['entries'][UID];assert new==old
    assert entry==read(P/'world.candidate.json')['entries'][UID]
    settings=read(lab.F/'settings.json')
    db=settings['extension_settings']['__userscripts']['shujuku_v120__userscript_settings_v1']['shujuku_v120_profile_v1____default____settings']
    if isinstance(db,str):db=json.loads(db)
    assert db['autoUpdateEnabled'] is False
    report={**plan,'formalHTTPMatches':True,'protectedBefore':len(before),'allowedChanges':changes,'unexpectedChanges':[],'settingsAndExistingSavesUnchanged':True,'autoFillEnabled':False,'browserEvidence':'pending','modelCalls':0}
    lab.put(P/'verified.json',report)
    print('Formal HTTP matches all 7 modules; only authorized module/book/page changes; original settings/chats/cards unchanged; auto fill off.')

def finish():
    plan=read(P/'installed.json');evidence=(P/'browser-8000.txt').read_text(encoding='utf8')
    assert 'PASS — 2 / 2' in evidence and 'http://127.0.0.1:8000' in evidence
    assert all(row['after'] in evidence for row in plan['modules'])
    page=lab.APP/'public/901-opening-combat'/PAGE
    assert lab.sha(page)==plan['pageSha256']
    # Remove only this batch's reversible, backed-up test artifact.
    page.unlink()
    verify()
    report=read(P/'verified.json');report.update(browserEvidence='browser-8000.txt; Terra High checked all seven hashes and both outcomes',temporaryPageRemoved=True,isolatedBrowserPassed=True,formalBrowserPassed=True)
    lab.put(P/'verified.json',report)
    lab.put(lab.H/'action-frost-formal-20261107.json',report)
    shutil.copyfile(P/'browser-8000.txt',lab.H/'action-frost-formal-browser-20261107.txt')
    print('Final protection check passed; temporary formal test page removed; browser evidence archived.')

if __name__=='__main__':globals()[sys.argv[1]]()
