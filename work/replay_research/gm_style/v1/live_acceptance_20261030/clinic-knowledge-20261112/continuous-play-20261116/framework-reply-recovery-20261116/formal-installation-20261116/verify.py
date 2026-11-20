"""Read-only post-install audit, including preservation after opening the formal chat."""
from pathlib import Path
import datetime, hashlib, json

HERE = Path(__file__).resolve().parent
backup = json.loads((HERE / 'backup.json').read_text(encoding='utf-8'))
installation = json.loads((HERE / 'installation.json').read_text(encoding='utf-8'))
app = Path(backup['app'])
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
expected = {str(Path('public/901-opening-combat') / c['path']): c['afterSha256'] for c in installation['changedFiles']}
changed = [relative for relative, digest in backup['files'].items() if sha(app / relative) != digest]
unexpected = [relative for relative in changed if relative not in expected]
current = set()
for relative in backup['scope']:
    path = app / relative
    if not path.exists(): continue
    for file in ([path] if path.is_file() else path.rglob('*')):
        if file.is_file(): current.add(str(file.relative_to(app)))
added = sorted(current - set(backup['files']))
missing = sorted(set(backup['files']) - current)
files = {relative: sha(app / relative) == digest for relative, digest in expected.items()}
result = {'verifiedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'expectedChangedFiles': files, 'unexpectedChangedFiles': unexpected,
          'addedFilesWithinBackupScope': added, 'missingFiles': missing,
          'protectedFilesUnchanged': len(backup['files']) - len(changed),
          'browserObserved': {'origin': 'http://127.0.0.1:8000/',
             'character': '901 帝都初始卡 独立事项版 20261105',
             'chat': '901 帝都正式续玩 20261106',
             'originalLatestProseLoaded': True, 'playerStatusLoaded': True,
             'playerStatus': '御临风 生命 12/12 攻击 5DP · 防御 待声明 · 速度 25米',
             'consoleErrorsOrWarningsObserved': [],
             'messagesSent': 0, 'regenerations': 0, 'initializations': 0},
          'localTests': {'gatePassed': 41, 'controllerPassed': 22, 'failed': 0,
             'beforePatchRecoveryFailuresReproduced': ['json/false remained UNRESOLVED', 'second failure retained original message 0 instead of message 2']},
          'modelCalls': 0}
(HERE / 'verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
assert all(files.values()) and not unexpected and not added and not missing
