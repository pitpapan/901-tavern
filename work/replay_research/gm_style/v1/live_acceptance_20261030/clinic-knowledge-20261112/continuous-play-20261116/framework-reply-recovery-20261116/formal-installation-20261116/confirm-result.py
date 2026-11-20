"""Confirm archived live results and their current formal installation; no model calls."""
from pathlib import Path
import datetime, hashlib, json

HERE = Path(__file__).resolve().parent
F = HERE.parent
load = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
historical = [F / branch / name for branch in ['model-verification-20261116', 'real-classification-20261116'] for name in ['run.json', 'verification.json', 'verify.py']]
before = {str(path): sha(path) for path in historical}
checks = {}
for branch, boundary in [
    ('model-verification-20261116', 'protected=load('),
    ('real-classification-20261116', 'rows=[json.loads('),
]:
    verifier = F / branch / 'verify.py'
    # Reuse every original archival-response/snapshot assertion. Stop before
    # the original verifier's live-install checks and evidence/ledger writes.
    prefix = verifier.read_text(encoding='utf-8').split(boundary, 1)[0]
    assert 'write_text(' not in prefix and 'copy2(' not in prefix
    namespace = {'__file__': str(verifier), '__name__': '__archival_confirmation__'}
    exec(compile(prefix, str(verifier), 'exec'), namespace)
    checks[branch] = namespace

live = checks['real-classification-20261116']
mechanical = live['final']
ordinary = live['roots'][0]
continuation = checks['model-verification-20261116']
assert ordinary['revision'] == 6 and mechanical['revision'] == 7
assert len(live['new']) == 1 and mechanical['actors']['player']['state']['recoveryClock']['minutes'] == 15
assert live['roots'][1] == live['roots'][2] == live['roots'][3]
assert continuation['roots'][0] == continuation['roots'][1]

backup = load(HERE / 'backup.json')
installation = load(HERE / 'installation.json')
app = Path(backup['app'])
expected = {str(Path('public/901-opening-combat') / c['path']): c['afterSha256'] for c in installation['changedFiles']}
unexpected = []
for relative, digest in backup['files'].items():
    wanted = expected.get(relative, digest)
    assert sha(app / relative) == wanted, ('Current formal file differs', relative)
    if relative.startswith('public\\901-opening-combat\\'):
        staged = HERE / 'staged-runtime' / Path(relative).relative_to('public/901-opening-combat')
        assert sha(staged) == wanted
assert all(sha(Path(path)) == digest for path, digest in before.items())

result = {
    'verifiedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'passed': True, 'additionalModelCalls': 0, 'currentCumulativeCalls': 546,
    'ordinaryDialogue': {'realClassification': 543, 'realProse': 544,
        'status': 'NO_CHECK', 'ruleRootUnchanged': True, 'savedProseUnmodified': True},
    'mechanicalAction': {'realClassification': 545, 'realProse': 546,
        'request': live['mechanical']['request'], 'status': 'APPLIED',
        'originalMvuExecutorCommittedBeforeProse': True,
        'revisionBefore': 6, 'revisionAfter': 7, 'clockMinutes': 15,
        'newOperations': 1, 'operationId': live['operation_id'],
        'rootBeforeProseAfterProseAndReopenEqual': True},
    'continueAfterReopen': {'realNextProse': 542,
        'previousProseInActualRequest': True,
        'beforeReopenAfterReopenAndNextTurnRootsEqual': True,
        'failedSourceAndPendingPreserved': True},
    'formalInstallation': {'twoRecoveryModulesMatchAcceptedStage': True,
        'remainingProtectedFilesUnchanged': 374,
        'formalStoryOrSavesModifiedThisConfirmation': False},
    'priorEvidenceAndLedgersUnchanged': True,
    'newProductOrPromptChanges': False,
    'scope': 'Fresh archival assertion replay and installed-file comparison; no new formal model dialogue. The short-rest example checks time/save/idempotency, with health and resources already full.'
}
(HERE / 'complete-result-confirmation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
