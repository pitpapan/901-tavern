"""Check persisted model output; fails on unresolved relationship regressions."""
from pathlib import Path
import json,schema
H=Path(__file__).resolve().parent
read=lambda n:json.loads((H/(n+'.json')).read_text(encoding='utf8'))
c=read('closeout');t=c['tables'];relations=t[schema.KEY][1:]
identity=lambda row:tuple(row[1:5])
by_key={identity(r):r for r in relations}
before=read('closeout-input')['tablesBefore']
checks={'newTableActuallyLoaded':c['newDdlLoaded'] and c['newRulesLoaded'],
 'sixOldMattersRemain':all(identity(r) in by_key for r in schema.INITIAL),
 'rumourJudgmentPreserved':by_key.get(('黄泉','黎舟','转述传闻','可信度'),[None]*6)[5]=='不信',
 'newRepairTrustIndependent':any(r[1:3]==['黄泉','黎舟'] and r[3] in ('修伞','处理修伞') and r[4:6]==['信任','信任'] for r in relations),
 'loanDirectionPreserved':by_key.get(('黄泉','黎舟','青竹伞','借入'),[None]*6)[5]=='未归还',
 'legacyRelationColumnInactive':all(r[9] in (None,'') for r in t['sheet_zhong_yao_jue_se_biao'][1:]),
 'taskCloseoutPreserved':len(t['sheet_ren_wu_yu_shi_jian_biao'])==2 and t['sheet_ren_wu_yu_shi_jian_biao'][1][1]=='替苏岚送信',
 'noPrematureSummary':t['sheet_da_zong_jie']==before['sheet_da_zong_jie']}
if (H/'summary.json').exists():
 s=read('summary');checks.update({'summaryKeepsFacts':s['tables'][schema.KEY]==t[schema.KEY],
 'summaryOldRowImmutable':s['tables']['sheet_da_zong_jie'][1]==before['sheet_da_zong_jie'][1],
 'summaryHides15Only':set(s['hidden'])=={str(i) for i in range(1,16)}})
for label in ('recall','return-recall'):
 if (H/(label+'.json')).exists():
  r=read(label);checks.update({label+'DirectReader':r['independentReaderLoaded'],label+'NoOldChat':r['originalChatAbsent'],label+'PrivateNotSpoken':r['privateCodeNotSpoken']})
if (H/'return.json').exists():
 checks['knowledgeUpdateRuleActuallyLoaded']=read('return')['knowledgeUpdateRuleLoaded']
 r=read('return')['tables'][schema.KEY][1:];d={identity(x):x for x in r}
 checks['loanActuallyReturned']=d.get(('黄泉','黎舟','青竹伞','借入'),[None]*6)[5]=='已归还'
 checks['rumourSurvivesReturn']=d.get(('黄泉','黎舟','转述传闻','可信度'),[None]*6)[5]=='不信'
 checks['knowledgeOnlyChangeRecorded']=all(name in d.get(('黄泉','黎舟','转述传闻','可信度'),[None]*7+[''])[7] for name in ('御临风','黄泉','黎舟'))
 checks['returnNoDuplicateOrLostMatters']=set(d)==set(by_key) and len(r)==len(relations)
if (H/'semantic-review.json').exists():checks.update(read('semantic-review'))
(H/'verification.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(checks,ensure_ascii=False,indent=2));assert all(checks.values()),[k for k,v in checks.items() if not v]
