"""Regression checks on captured model outputs and actual persisted table values."""
from pathlib import Path
import json,sys
H=Path(__file__).resolve().parent
read=lambda n:json.loads((H/(n+'.json')).read_text(encoding='utf8'))
N='sheet_zhong_yao_jue_se_biao';S='sheet_da_zong_jie';C='sheet_ji_yao_biao';Q='sheet_ren_wu_yu_shi_jian_biao'
before=read('repair-closeout-input')['tablesBefore'];after=read('repair-closeout')['tables']
person=lambda t,n:next(r for r in t[N][1:] if r[1]==n)
hq=person(after,'黄泉')[9]
checks={'sameInputAsLegacy':before==read('legacy-closeout-input')['tablesBefore'],
 'rumourJudgmentPreserved':'尚不信其传闻' in hq,
 'cooperationAndLoanPreserved':all(t in hq for t in ('合作修伞','借青竹伞未还')),
 'newTrustWritten':'信任' in hq and '修伞' in hq,
 'otherRelationshipSegmentsPreserved':hq.split(';')[:2]==person(before,'黄泉')[9].split(';')[:2],
 'offstageNpcPreserved':person(after,'苏岚')==person(before,'苏岚'),
 'onlyUnfinishedTask':len(after[Q])==2 and after[Q][1][1]=='替苏岚送信',
 'noPrematureSummary':after[S]==before[S] and len(after[C])==16,
 'crossMidnightCorrect':after['sheet_quan_ju_shu_ju_biao'][1][-1]=='2026-02-05 00:15'}
if (H/'repair-summary.json').exists():
 s=read('repair-summary');text=s['tables'][S][-1][1]
 checks.update({'summaryOldRowUnchanged':s['tables'][S][1]==before[S][1],
 'summaryOneAppended':len(s['tables'][S])==3,'summaryAll15Hidden':set(s['hidden'])=={str(i) for i in range(1,16)},
 'summaryRumourJudgment':('不信' in text or '保留' in text) and '传闻'in text,
 'summaryLoanFactsPresent':'黄泉'in text and '黎舟'in text and '伞'in text,
 'summaryPrivateAttribution':'瓷雀二鸣'in text and ('未告知'in text or '未透露'in text or '未对外'in text)})
if (H/'repair-recall.json').exists():
 r=read('repair-recall');checks.update({'recallOriginalChatAbsent':r['oldChatAbsent'],'recallPrivateNotSpoken':r['privateCodeNotSpoken']})
if (H/'semantic-review.json').exists():checks.update(read('semantic-review'))
print(json.dumps(checks,ensure_ascii=False,indent=2))
(H/'verification.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf8')
assert all(checks.values()),[k for k,v in checks.items() if not v]
print('All currently recorded regression checks passed.')
