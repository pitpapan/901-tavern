"""Record only selected evidence from the live isolated chat and server requests."""
from fixture import *
import re
# Sandbox read-only probes have their own LOCALAPPDATA.
L=Path('C:/Users/pit/AppData/Local/901-formal-chronicle-load-20261031')
U=L/'data/default-user'
def inspect():
    rows=[json.loads(l) for l in (U/'chats'/lab.NAME/(lab.CHAT+'.jsonl')).read_text(encoding='utf8').splitlines()]
    runs=rows[0]['chat_metadata'].get('db_fact_acceptance_20261031',[])
    ev={'floors':len(rows)-1,'runs':[],'autoUpdateEnabled':profile(read(U/'settings.json'))[2]['autoUpdateEnabled']}
    for rr in runs:
        for q in rr['requests']:
            msgs=q.get('messages',[])
            if not any(m.get('role')=='user' and '裁定路径：' in str(m.get('content')) for m in msgs):continue
            sysmsgs=[m['content'] for m in msgs if m['role']=='system' and isinstance(m['content'],str)]
            ev['runs'].append(dict(model=q['model'],installedStyleInRequest=read(live_style) in sysmsgs or any(read(live_style) in s for s in sysmsgs),
                 recall=any(RECALL in s and QUANTIFIERS in s for s in sysmsgs),databaseFact=any(fact in s for s in sysmsgs),ruleRevision=[r.get('revision') if r else None for r in (rr.get('beforeState'),rr.get('afterState'))]))
    if len(rows)>4:ev['reply']=rows[-1]['mes']
    log=(L/'stdout.log').read_text(encoding='utf8',errors='replace')
    ev['fill']=[]
    for chunk in log.split('Chat Completion request:')[1:]:
        req,_,resp=chunk.partition('Chat Completion response:')
        if TIME not in req or '只输出一对<tableEdit>' not in req:continue
        ev['fill'].append(dict(time=TIME in req,unknownCrowd=DETAILS in req,private=PRIVATE in req,legacyOverride='上述剧情证据规则优先' in req,latestTurnIncluded='灰砚八折' in req,sqlNullRule='未知耗时不等于零' in req,
              legacyInstruction='时间跨度格式为' in req or 'time_span 格式必须为' in req,answered=bool(resp),chronicleSQL='INSERT INTO chronicle' in resp,emptyUpdate="content: '<tableEdit>\\n</tableEdit>'" in resp))
    db=read(U/'worlds'/(lab.BOOK+'.json'))['entries']
    ev['chronicles']=[e['content'] for e in db.values() if 'CustomExport-纪要-' in e.get('comment','') and '包裹' not in e['comment']]
    ev['globalState']=[l for e in db.values() if e.get('comment','').endswith('ReadableDataTable') for l in e['content'].splitlines() if l.startswith('| 全局状态 |') and '当前详细地点' not in l]
    ev['npcRows']=[l for e in db.values() for l in e.get('content','').splitlines() if l.startswith(('| 黄泉 |','| 布莱特 |'))]
    return ev
if __name__=='__main__':
    e=inspect()
    if 'save' in sys.argv:
        assert e['autoUpdateEnabled'] is False and len(e['runs'])==1 and all(e['runs'][0][k] for k in ('recall','databaseFact','installedStyleInRequest'))
        assert '青瓦三叶' in e['reply'] and '灰砚八折' not in e['reply']
        assert any(all(f[k] for k in ('time','private','unknownCrowd','legacyOverride','latestTurnIncluded','sqlNullRule','answered','emptyUpdate')) for f in e['fill'])
        assert all(all(x.strip() in ('','NULL') for x in row.split('|')[-4:-1]) for row in e['globalState'])
        assert all('灰砚八折' not in row for row in e['npcRows'])
        assert len(e['chronicles'])==1 and fact in e['chronicles'][0] and e['chronicles'][0].split('|')[2].strip()=='未交代'
        e['scope']='Actual installed narration and fill prompt loading; manual update returned no changes. No newly generated chronicle or SQL NULL write is claimed.'
        lab.put(HERE/'actual-load.json',e)
    print(json.dumps(e,ensure_ascii=False,indent=2)[:4500])
