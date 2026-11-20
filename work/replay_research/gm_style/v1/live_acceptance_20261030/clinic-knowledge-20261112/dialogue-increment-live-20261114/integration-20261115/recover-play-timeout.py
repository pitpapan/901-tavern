"""Acceptance-only recovery: preserve failure, allow time for gated raw replay."""
from pathlib import Path
import json, shutil, importlib.util, hashlib
E=Path(__file__).resolve().parent; N=E/'normal-play-20261115'
cfg=json.loads((E/'browser-setup.json').read_text(encoding='utf8')); A=Path(cfg['app'])
assert A.resolve().is_relative_to(Path('C:/Users/pit/.codex/visualizations').resolve())
shutil.copy2(cfg['chat'],N/'round4-timeout.chat.jsonl')
entry=(N/'entry.js').read_text(encoding='utf8')
assert entry.count('classificationTimeoutMs:60000')==1
changed=entry.replace('classificationTimeoutMs:60000','classificationTimeoutMs:600000')
assert changed.replace('classificationTimeoutMs:600000','classificationTimeoutMs:60000')==entry
spec=importlib.util.spec_from_file_location('lab',E.parent.parent.parent/'action-failure/timeout-20261105/lab.py')
lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
card=A/'data/default-user/characters/901 帝都初始卡 独立事项版 20261105.png'
shutil.copy2(card,N/'before-timeout-recovery.card.png')
def transform(value):value['data']['extensions']['tavern_helper']['scripts'][1]['content']=changed
lab.card_transform(card,transform)
(N/'entry-with-review-time.js').write_text(changed,encoding='utf8')
c=N/'captures'; first=(c/'play.010.classification.request.json').read_bytes(); second=(c/'play.011.classification.request.json').read_bytes()
assert first==second
report=dict(cause='Gated capture/manual review exceeded existing 60000ms classification deadline; original controller attempted one retry.',duplicateRequestExact=True,sha256=hashlib.sha256(first).hexdigest(),upstreamCalls=1,duplicateSent=False,productSourceChanged=False,acceptanceTimeoutBefore=60000,acceptanceTimeoutAfter=600000,rawResponseSource='play.010.classification',recovery='Regenerate via existing UI; reuse original raw response only if complete request matches byte-for-byte. No new identical upstream call.')
(N/'round4-timeout-diagnosis.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report))
