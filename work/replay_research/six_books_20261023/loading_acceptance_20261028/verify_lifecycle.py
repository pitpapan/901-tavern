"""Inspect named disposable-chat evidence; narrative truth is reviewed separately."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate/scene_test/world-loading-20261028'
HOME=Path('D:/github/sillyTavern/data/default-user')
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
cfg=read(OUT/'lifecycle-config.json')
raw=(HOME/'chats'/cfg['name']/(cfg['chatId']+'.jsonl')).read_text(encoding='utf-8')
rows=[json.loads(line) for line in raw.splitlines()]
runs=rows[0]['chat_metadata']['world_loading_lifecycle']['runs']
errors=[]
def check(condition,message):
    if not condition:errors.append(message)
def last(name):
    values=[r for r in runs if r['id']==name]
    check(bool(values),'missing '+name)
    return values[-1] if values else {}
def prompt(r):
    return '\n'.join(m['content'] for req in r.get('requests',[]) for m in req['messages'] if isinstance(m.get('content'),str))
def key(e):return (e['world'],e['uid'])

limited=last('budget-limited');shortage=last('budget-shortage')
check(limited.get('status')=='completed','limited scan failed')
check(any(s['phase']=='bounded-scan' and s['budget']['overflowed'] for s in limited.get('scan',[])),'crowded scan did not overflow')
check(bool(limited.get('dropped')),'no dropped themes recorded')
check(limited.get('missing')==[],'focused scene still missing essentials')
check(limited.get('focusedTokens',10**9)<limited.get('contextLimit',0),'focused body exceeds bounded host budget')
check(len(limited.get('requests',[]))==1,'focused request missing/duplicated')
check(prompt(limited).count(cfg['worldContextGuidance'])==1,'latest author guidance absent/duplicated in focused request')
selected={key(e) for e in limited.get('retained',[])}
activated=[a['entries'] for a in limited.get('activated',[]) if a['phase']=='request']
check(len(activated)==1 and {key(e) for e in activated[0]}==selected,'actual request differs from focused native selection')
check(shortage.get('contextLimit')==128 and bool(shortage.get('missing')),'shortage not demonstrated')
check(not shortage.get('requests'),'shortage sent incomplete model request')

definitions={e['uid']:e for f in (OUT.parents[1]/'import').glob('901_0*.json') for e in read(f)['entries'].values()}
prose=[]
reads=[r for r in runs if r['id']=='memory-read' and r.get('memoryAdapter')]
for branch,body,other,minimum in [('A',cfg['memoryA'],cfg['memoryB'],1),('B',cfg['memoryB'],cfg['memoryA'],2)]:
    matching=[r for r in reads if any(s['memory']==body for s in r.get('memorySource',[]))]
    check(len(matching)>=minimum,'missing retained/refresh reads for '+branch)
    for r in matching[-minimum:]:
        text=prompt(r)
        check(r.get('status')=='completed' and len(r.get('requests',[]))==1,branch+' request failed/duplicated')
        check(text.count(body)==1 and other not in text,branch+' memory absent/duplicate or discarded candidate leaked')
        source=next(s for s in r['memorySource'] if s['memory']==body)
        check(source['messageId']<len(r.get('chatSnapshot',[]))-6,branch+' summary was not beyond history window')
        prose.append({'branch':branch,'started':r['started'],'response':r.get('response'),
                      'selectedSwipe':source['swipeId'],'memoryCopies':text.count(body),
                      'nativeSummaryWasStale':body not in r.get('nativeMemory','')})
adoption=last('adoption-read')
adopted_prompt=prompt(adoption)
check(adoption.get('status')=='completed' and len(adoption.get('requests',[]))==1,'manual adoption request missing/duplicated')
check(adopted_prompt.count(cfg['reviewedMemory'])==1,'manually accepted memory absent/duplicated')
check(adopted_prompt.count(cfg['reviewedReply'])==1,'corrected retained reply absent/duplicated')
check(cfg['rejectedReply'] not in adopted_prompt,'rejected reply leaked through recent history')
for claim in ['在此处理日常文书与研习杂务','并未持有白暮寒地或远西魔法林材等远方物资','无多余库存或隐秘资源']:
    check(claim not in adopted_prompt,'unsupported assertion retained: '+claim)
check(cfg['reviewedMemory'] in adoption.get('nativeMemory',''),'native Summary did not retain manual edit')
snapshot=adoption.get('chatSnapshot',[])
check(len(snapshot)==3 and snapshot[1]['text']==cfg['reviewedReply'] and snapshot[1]['memory']==cfg['reviewedMemory'],'retained native message and summary differ from human review')
for r in [limited,*reads,adoption]:
    text=prompt(r)
    for group in [a for a in r.get('activated',[]) if a['phase']=='request']:
        for e in group['entries']:
            native=definitions[e['uid']]
            check(not native['disable'] and text.count(native['content'])==1,'entry body disabled/missing/duplicated '+e['name'])
    for e in definitions.values():
        if e['disable']:check(e['content'] not in text,'disabled secret body in request '+e['comment'])
cleanup=last('memory-cleanup')
check(cleanup.get('remainingMessages')==1 and len(rows)==2,'fixture messages not cleaned up')
settings=read(HOME/'settings.json')
current={'frozen':settings['extension_settings']['memory']['memoryFrozen'],'source':settings['extension_settings']['memory']['source']}
check(current==cfg['memorySettings'],'native memory settings changed')
result={'status':'fail' if errors else 'pass','scope':'仅请求、预算与所选记忆读取；语义结果单列lifecycle-semantic-review.json，不由此pass推断','errors':errors,
  'budget':{'scope':'native getWorldInfoPrompt with explicit available-context argument; account/model budget unchanged',
    'contextLimit':limited.get('contextLimit'),'focusedTokens':limited.get('focusedTokens'),
    'crowdedMissing':limited.get('crowdedMissing'),'retained':[e['name'] for e in limited.get('retained',[])],
    'dropped':[e['name'] for e in limited.get('dropped',[])],'response':limited.get('response'),
    'shortageLimit':shortage.get('contextLimit'),'shortageMissing':shortage.get('missing'),'shortageRequests':len(shortage.get('requests',[]))},
  'memory':{'source':'native selected message extra.memory; manual adoption, automatic summary remains frozen',
    'reads':prose,'settings':current,'cleanupMessages':len(rows)-1},
  'manualAdoption':{'started':adoption.get('started'),'reviewedReply':cfg['reviewedReply'],'reviewedMemory':cfg['reviewedMemory'],
    'requestCount':len(adoption.get('requests',[])),'response':adoption.get('response'),
    'scope':'原生界面订正保留回复并手动编辑Summary，刷新后读取；非自动审核或自动采纳'},
  'limits':['人工采纳流程，未实现自动审阅／自动提交／自动在场追踪','短的跨窗口与候选切换实验，不冒充整场长期实团验收','本检查核对请求与状态；语义由主会话逐句判读']}
(OUT/'lifecycle-final.jsonl').write_text(raw,encoding='utf-8')
(OUT/'lifecycle-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(bool(errors))
