"""Evidence checks report partial outcomes; known semantic failures are not hidden."""
from pathlib import Path
import json
P=Path(__file__).resolve().parent
read=lambda n:json.loads((P/(n+'.json')).read_text(encoding='utf8'))
b,c,s,r=[read(n) for n in ('below','closeout','summary','repeat')]
C='sheet_ji_yao_biao';S='sheet_da_zong_jie';N='sheet_zhong_yao_jue_se_biao';Q='sheet_ren_wu_yu_shi_jian_biao'
out={}
out['loadedCandidate']=all(e['loadedSystem'] and all(e['loadedNotes'].values()) for e in (b,c,s,r))
out['sameModelAutoOff']=all(e['model']=='[抗截断]gemini-3.8-flash' and e['auto'] is False for e in (b,c,s,r))
out['belowThresholdNoWrite']=not b['sqlLines'] and len(b['tables'][C])==15 and len(b['tables'][S])==2
out['crossMidnight']=c['tables']['sheet_quan_ju_shu_ju_biao'][1][-3:]==['2026-02-04 23:55','20分钟','2026-02-05 00:15']
out['onlyUnfinishedTaskRemains']=[x[1] for x in c['tables'][Q][1:]]==['替苏岚送信']
last=c['tables'][C][-1][4]
out['closedTasksHistoryPreserved']=all(x in last for x in ('铜钥匙','完成','药包','失败','凭证','逾期'))
out['closeoutNoPrematureSummary']=len(c['tables'][C])==16 and c['tables'][S]==b['tables'][S] and c['flight']['hiddenRowIds']==[]
hq=next(x for x in c['tables'][N][1:] if x[1]=='黄泉')
out['relationshipOtherPeopleAndLoanPreserved']=all(x in hq[9] for x in ('掌柜','不愿透露下一站','修伞','青竹伞未还'))
out['relationshipRumourJudgmentPreserved']='不信' in hq[9] and '传闻'in hq[9]
out['temporarilyAbsentPersonRetained']=any(x[1]=='苏岚' and x[8]=='暂时离场' for x in c['tables'][N][1:])
out['oldSummaryImmutableAndOneAppended']=s['tables'][S][1]==b['tables'][S][1] and len(s['tables'][S])==3
out['all15ChroniclesStoredButHidden']=len(s['tables'][C])==16 and set(s['flight']['hiddenRowIds'])=={str(i) for i in range(1,16)}
new=s['tables'][S][-1][1]
out['summaryOldPublicCodeAndPrivateAttribution']=all(x in new for x in ('苇灯六结','瓷雀二鸣','未告知任何人'))
out['summaryCorrectionOutstandingLetterAndClosedTasks']=all(x in new for x in ('修伞匠','非信使','未拆信','待交黎舟','铜钥匙','失败','逾期'))
out['summaryRumourJudgmentPreserved']='不信' in new and '传闻'in new
out['summaryUnknownCrowdCountOriginPreserved']=all(x in new for x in ('人数','来向'))
out['noDuplicateAfterSummary']=not r['sqlLines'] and r['tables']==s['tables'] and r['flight']==s['flight']
out['reviewNotes']=['summary中“黎舟借黄泉青竹伞未还”方向表达含糊，人工判为语义不足。','关系分项丢失已复测仍失败；没有旧提示词同题对照，不将其断言为精简独有退化。']
rec=P/'recall.json'
if rec.exists():out['recall']=json.loads(rec.read_text(encoding='utf8'))['checks']
(P/'verification.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(out,ensure_ascii=False,indent=2))
for k in ('loadedCandidate','sameModelAutoOff','belowThresholdNoWrite','crossMidnight','onlyUnfinishedTaskRemains','closedTasksHistoryPreserved','closeoutNoPrematureSummary','oldSummaryImmutableAndOneAppended','all15ChroniclesStoredButHidden','noDuplicateAfterSummary'):assert out[k],k
print('Mechanical checks passed; semantic failures remain explicitly false.')
