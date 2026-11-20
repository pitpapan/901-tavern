"""Freeze the accepted two-module patch and rollback files. Never deploy."""
from pathlib import Path
import datetime, hashlib, json, shutil, zipfile

HERE = Path(__file__).resolve().parent
CAMPAIGN = next(p for p in HERE.parents if p.name == 'TRPG outputs')
VERSION = '901-reply-recovery-20261116-rc1'
OUT = CAMPAIGN / 'output/replay_tavern/reply_recovery_20261116_rc1'
ZIP = OUT.with_suffix('.zip')
load = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
dump = lambda path, value: path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
assert OUT.resolve().is_relative_to((CAMPAIGN / 'output/replay_tavern').resolve())
assert (OUT / 'README.md').is_file() and not (OUT / 'manifest.json').exists() and not ZIP.exists()
backup = load(HERE / 'backup.json')
stage = load(HERE / 'stage.json')
confirmation = load(HERE / 'complete-result-confirmation.json')
assert confirmation['passed'] and confirmation['additionalModelCalls'] == 0
app = Path(backup['app'])
backup_dir = Path(backup['backupDirectory'])
formal_before = {relative: sha(app / relative) for relative in backup['files']}
for relative, digest in backup['files'].items():
    assert sha(backup_dir / relative) == digest, ('Backup differs', relative)

def copy(source, relative):
    dest = OUT / relative
    dest.parent.mkdir(parents=True, exist_ok=True)
    assert not dest.exists()
    shutil.copy2(source, dest)
    assert sha(source) == sha(dest)

changes = []
for change in stage['changedFiles']:
    runtime_relative = Path('public/901-opening-combat') / change['path']
    accepted = HERE / 'staged-runtime' / change['path']
    original = backup_dir / runtime_relative
    assert sha(accepted) == sha(app / runtime_relative) == change['afterSha256']
    assert sha(original) == change['beforeSha256']
    copy(accepted, Path('runtime_patch') / runtime_relative)
    copy(original, Path('rollback') / runtime_relative)
    copy(HERE / (accepted.name + '.installation.patch'), Path('patches') / (accepted.name + '.patch'))
    changes.append({**change, 'target': runtime_relative.as_posix(),
        'payload': (Path('runtime_patch') / runtime_relative).as_posix(),
        'rollback': (Path('rollback') / runtime_relative).as_posix()})

runtime = {Path(relative).as_posix(): digest for relative, digest in formal_before.items()
           if Path(relative).is_relative_to('public/901-opening-combat')}
assert all(sha(HERE / 'staged-runtime' / Path(path).relative_to('public/901-opening-combat')) == digest for path, digest in runtime.items())
dump(OUT / 'compatibility.json', {'version': VERSION,
    'runtimeRoot': 'public/901-opening-combat', 'runtimeFiles': runtime,
    'allowedTargetStates': {c['target']: [c['beforeSha256'], c['afterSha256']] for c in changes},
    'entryCharacter': '901 帝都初始卡 独立事项版 20261105',
    'entryScriptChanged': False, 'saveSchemaChanged': False,
    'baselineMeaning': 'Exact accepted formal runtime after the prior authorized installation; the two targets may also match their bundled rollback hashes.'})
dump(OUT / 'backup-reference.json', {'directory': str(backup_dir),
    'manifest': str(backup_dir / 'backup-manifest.json'),
    'manifestSha256': sha(backup_dir / 'backup-manifest.json'),
    'fileCount': backup['fileCount'], 'bytes': backup['bytes'], 'scope': backup['scope'],
    'allBackupFilesRechecked': True, 'backupIncludedInZip': False,
    'rollbackScope': 'Restore only the two code modules. Keep current chats and MVU saves.'})

for name in ['complete-result-confirmation.json', 'formal-gate-tests.log',
             'formal-controller-tests.log', 'complete-result-controller-tests.log']:
    copy(HERE / name, Path('evidence') / name)
for branch, name in [('real-classification-20261116', 'historical-real-classification.json'),
                     ('model-verification-20261116', 'historical-reopen-continuation.json')]:
    copy(HERE.parent / branch / 'verification.json', Path('evidence') / name)

files = {p.relative_to(OUT).as_posix(): sha(p) for p in sorted(OUT.rglob('*')) if p.is_file()}
manifest = {'version': VERSION, 'status': 'frozen-candidate',
    'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'deployedThisTask': False, 'additionalModelCalls': 0,
    'priorFormalInstallationRetained': True,
    'priorInstallationReceipt': str((HERE / 'installation.json').relative_to(CAMPAIGN)),
    'source': 'Accepted minimal formal backport; not the entire experimental candidate runtime.',
    'changes': changes, 'payloadFileCount': len(files), 'files': files,
    'followupPolicy': 'Freeze this version. Make a new candidate only for a concrete issue observed in actual play; no unsolicited prompt or feature changes.'}
dump(OUT / 'manifest.json', manifest)
assert all(sha(OUT / path) == digest for path, digest in manifest['files'].items())
with zipfile.ZipFile(ZIP, 'x', compression=zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(OUT.rglob('*')):
        if file.is_file(): archive.write(file, Path(OUT.name) / file.relative_to(OUT))
with zipfile.ZipFile(ZIP) as archive:
    assert archive.testzip() is None
    expected_names = {f'{OUT.name}/{path}' for path in files} | {f'{OUT.name}/manifest.json'}
    assert set(archive.namelist()) == expected_names
    assert all(hashlib.sha256(archive.read(f'{OUT.name}/{path}')).hexdigest() == digest for path, digest in files.items())
    assert archive.read(f'{OUT.name}/manifest.json') == (OUT / 'manifest.json').read_bytes()
assert all(sha(app / relative) == digest for relative, digest in formal_before.items())
ZIP.with_suffix('.zip.sha256').write_text(sha(ZIP) + '  ' + ZIP.name + '\n', encoding='ascii')
result = {'passed': True, 'version': VERSION, 'directory': str(OUT), 'zip': str(ZIP),
    'zipSha256': sha(ZIP), 'zipBytes': ZIP.stat().st_size,
    'packageFilesIncludingManifest': len(files) + 1, 'runtimeCompatibilityFiles': len(runtime),
    'patchModules': 2, 'rollbackModules': 2,
    'fullBackupFilesRechecked': backup['fileCount'],
    'formalFilesCheckedUnchangedThisTask': len(formal_before),
    'deployedThisTask': False, 'additionalModelCalls': 0,
    'verificationScope': 'Package hashes, rollback bytes, baseline compatibility and ZIP contents; existing execution/model evidence reused.'}
dump(HERE / 'frozen-candidate-verification.json', result)
print(json.dumps(result, ensure_ascii=False, indent=2))
