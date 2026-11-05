"""Recheck persisted acceptance evidence without starting a model or server."""
from pathlib import Path
import json
H=Path(__file__).resolve().parent
read=lambda name:json.loads((H/(name+'.json')).read_text(encoding='utf-8-sig'))
key='sheet_ji_yao_biao';baseline=read('baseline');first=read('first');second=read('second');reload=read('reload')
checks={}
for label,before,after,wanted in [('first',baseline,first,'AM0016'),('second',first,second,'AM0017')]:
 old=before['tables'][key][1:];new=after['tables'][key][1:]
 checks[label+'OldRowsUnchanged']=new[:len(old)]==old
 checks[label+'OnlyOneNewCode']=len(new)==len(old)+1 and new[-1][1]==wanted
 checks[label+'CodesUnique']=len(set(r[1] for r in new))==len(new)
 checks[label+'FullMaximumHintLoaded']=after['computedSequenceHintLoaded']
 checks[label+'HiddenAndSummaryUnchanged']=after['hiddenIdsUnchanged'] and after['oldSummariesUnchanged']
 checks[label+'SameModelSingleRequest']=after['model']=='[抗截断]gemini-3.8-flash' and after['actualFillRequests']==1
checks['reloadAll16RowsIdentical']=reload['all16RowsEqualPersistedFirst'] and reload['actualBrowserRuntimeRows']==16 and reload['lastCode']=='AM0016'
for label,code in [('first','AM0016'),('second','AM0017')]:
 ops=read(label+'-materialized-sql')
 checks[label+'ReplaySqlContainsFinalCode']=any(code in sql and 'row_id' in sql for op in ops for sql in op['statements'])
(H/'verification.json').write_text(json.dumps(checks,indent=2),encoding='utf8')
print(json.dumps(checks,indent=2));assert all(checks.values())
