"""Install exactly two backed-up recovery modules; leave user data untouched."""
from pathlib import Path
import datetime, hashlib, json, os, urllib.request

HERE = Path(__file__).resolve().parent
backup = json.loads((HERE / 'backup.json').read_text(encoding='utf-8'))
stage = json.loads((HERE / 'stage.json').read_text(encoding='utf-8'))
app = Path(backup['app']).resolve()
runtime = (app / 'public/901-opening-combat').resolve()
assert app == Path('D:/github/sillyTavern').resolve()
assert not (HERE / 'installation.json').exists(), 'Do not install twice'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
for relative, digest in backup['files'].items():
    path = (app / relative).resolve()
    assert path.is_relative_to(app) and sha(path) == digest, ('Formal changed since backup', relative)
for name, passes in [('formal-gate-tests.log', 41), ('formal-controller-tests.log', 22)]:
    log = (HERE / name).read_text(encoding='utf-8-sig')
    assert 'pass ' + str(passes) in log and 'fail 0' in log

prepared = []
for change in stage['changedFiles']:
    path = (runtime / change['path']).resolve()
    source = (HERE / 'staged-runtime' / change['path']).resolve()
    assert path.is_relative_to(runtime)
    assert path.name in ['adjudication-gate.mjs', 'replay-gate-script.example.js']
    assert sha(path) == change['beforeSha256'] and sha(source) == change['afterSha256']
    prepared.append((path, source, change))
assert len(prepared) == 2

installed = []
try:
    for path, source, change in prepared:
        temp = path.with_name(path.name + '.901-reply-recovery.tmp')
        assert not temp.exists()
        temp.write_bytes(source.read_bytes())
        assert sha(temp) == change['afterSha256']
        os.replace(temp, path)
        installed.append(path)
except BaseException:
    for path in installed:
        original = Path(backup['backupDirectory']) / path.relative_to(app)
        path.write_bytes(original.read_bytes())
    raise

http = []
for path, source, change in prepared:
    assert sha(path) == change['afterSha256']
    url = 'http://127.0.0.1:8000/' + path.relative_to(app / 'public').as_posix()
    with urllib.request.urlopen(url, timeout=15) as response:
        body = response.read()
        assert response.status == 200
    digest = hashlib.sha256(body).hexdigest()
    assert digest == change['afterSha256']
    http.append({'url': url, 'sha256': digest, 'status': 200})
changed = {str(path.relative_to(app)) for path, _, _ in prepared}
protected = {relative: sha(app / relative) == digest for relative, digest in backup['files'].items() if relative not in changed}
assert all(protected.values())
result = {'installedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'app': str(app), 'backupDirectory': backup['backupDirectory'],
          'changedFiles': stage['changedFiles'], 'http': http,
          'unchangedProtectedFiles': len(protected), 'allProtectedUnchanged': True,
          'localGateTestsPassed': 41, 'localControllerTestsPassed': 22,
          'modelCalls': 0, 'cardModified': False, 'styleModified': False,
          'chatAndSaveModified': False, 'optionalDialogueExtractionInstalled': False}
(HERE / 'installation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
