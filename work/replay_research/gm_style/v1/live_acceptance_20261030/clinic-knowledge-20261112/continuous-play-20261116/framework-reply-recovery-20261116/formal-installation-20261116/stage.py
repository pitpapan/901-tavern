"""Backport only the verified recovery hunks to the installed runtime copy."""
from pathlib import Path
import difflib, hashlib, importlib.util, json, re, shutil

HERE = Path(__file__).resolve().parent
CAMPAIGN = next(p for p in HERE.parents if p.name == 'TRPG outputs')
BACKUP = json.loads((HERE / 'backup.json').read_text(encoding='utf-8'))
ORIGINAL = Path(BACKUP['backupDirectory']) / 'public/901-opening-combat'
STAGED = HERE / 'staged-runtime'
TARGETS = ['adjudication-gate.mjs', 'replay-gate-script.example.js']
MODULE_DIR = Path('work/rules_engine/gm_runtime')
assert not STAGED.exists()
shutil.copytree(ORIGINAL, STAGED)

patch = (HERE.parent / 'task-changes.patch').read_text(encoding='utf-8')
sections = re.split(r'(?m)^--- ', patch)[1:]
changes = []
for name in TARGETS:
    section = next(s for s in sections if s.startswith(name + '.before\n'))
    path = STAGED / MODULE_DIR / name
    before_bytes = path.read_bytes()
    newline = '\r\n' if b'\r\n' in before_bytes else '\n'
    before = before_bytes.decode('utf-8').replace('\r\n', '\n')
    after = before
    count = 0
    for hunk in re.split(r'(?m)^@@[^\n]*\n', section)[1:]:
        rows = hunk.splitlines(keepends=True)
        old = ''.join(row[1:] for row in rows if row.startswith((' ', '-')))
        new = ''.join(row[1:] for row in rows if row.startswith((' ', '+')))
        assert after.count(old) == 1, (name, count, 'patch context mismatch')
        after = after.replace(old, new, 1)
        count += 1
    assert count > 0
    path.write_bytes(after.replace('\n', newline).encode('utf-8'))
    diff = ''.join(difflib.unified_diff(before.splitlines(True), after.splitlines(True), fromfile='installed-before/' + name, tofile='installed-after/' + name))
    (HERE / (name + '.installation.patch')).write_text(diff, encoding='utf-8', newline='\n')
    changes.append({'path': str(MODULE_DIR / name).replace('\\', '/'), 'hunks': count,
                    'beforeSha256': hashlib.sha256(before_bytes).hexdigest(),
                    'afterSha256': hashlib.sha256(path.read_bytes()).hexdigest()})

spec = importlib.util.spec_from_file_location('runtime_package', CAMPAIGN / 'work/replay_research/six_books_20261023/runtime_package.py')
packager = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packager)
for label, root in [('before', ORIGINAL), ('after', STAGED)]:
    destination = HERE / ('node-' + label)
    manifest = packager.package_runtime(root, destination, [root / MODULE_DIR / name for name in TARGETS])
    # The existing host fixture evaluates the controller in an AsyncFunction.
    # Absolute file imports keep that exact controller bound to its formal closure.
    controller = destination / MODULE_DIR / TARGETS[1]
    body = controller.read_text(encoding='utf-8')
    def absolute(match):
        value = match[2]
        return match[1] + (controller.parent / value).resolve().as_uri() + match[3] if value.startswith('.') else match[0]
    controller.write_text(packager.IMPORT.sub(absolute, body), encoding='utf-8', newline='\n')
    for testname in ['adjudication-gate.test.mjs', 'replay-gate-script.test.mjs']:
        source = CAMPAIGN / MODULE_DIR / testname
        text = source.read_text(encoding='utf-8')
        text = text.replace("new URL('./replay-gate-script.example.js', import.meta.url)", 'new URL(' + json.dumps(controller.as_uri()) + ')')
        text = text.replace('import.meta.url', json.dumps(source.as_uri()))
        def test_import(match):
            value = match[2]
            if not value.startswith('.'): return match[0]
            target = destination / MODULE_DIR / 'adjudication-gate.mjs' if value == './adjudication-gate.mjs' else (source.parent / value).resolve()
            return match[1] + target.as_uri() + match[3]
        (HERE / (label + '-' + testname)).write_text(packager.IMPORT.sub(test_import, text), encoding='utf-8', newline='\n')
    (HERE / ('node-' + label + '-manifest.json')).write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')

(HERE / 'stage.json').write_text(json.dumps({'modelCalls': 0, 'changedFiles': changes, 'scope': 'Only the verified recovery hunks; existing formal imports and optional-feature configuration retained.'}, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(changes, indent=2))
