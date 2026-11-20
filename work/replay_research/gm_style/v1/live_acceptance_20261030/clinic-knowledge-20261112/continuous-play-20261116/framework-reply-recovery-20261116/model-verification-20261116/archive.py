"""Archive one actual normal-entry result after checking authoritative saved state."""
from pathlib import Path
import json,sys,shutil,hashlib
E=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
round_id,label=sys.argv[1:];assert round_id in ['round-01','round-02']
d=load(E/'browser'/(label+'.json'));setup=load(E/'setup.json');base=load(E/'00-baseline.json')
assert d['chatId']==setup['branchChatId'] and len(d['saved'])==len(d['chat'])+1
last=d['chat'][-1];content=(E/(round_id+'.content.txt')).read_text(encoding='utf-8')
assert last['extra']['901_replay_gate']['status']=='NO_CHECK'
assert last['mes']==content+'\n\n<StatusPlaceHolderImpl/>'
root=d['pages'][-1]['stat_data']['901_rules_poc'];original=base['pages'][-1]['stat_data']['901_rules_poc']
saved=d['saved'][-1]['variables'][last.get('swipe_id',0)]['stat_data']['901_rules_poc'];assert root==saved
assert root['actors']==original['actors'] and all(root['operations'][k]==v for k,v in original['operations'].items())
assert root['storyKnowledge']['knowledge']==original['storyKnowledge']['knowledge'] and root['storyKnowledge']['events']==original['storyKnowledge']['events']
batch=list(root['storyKnowledge']['dialogueBatches'].values());assert len(batch)==1 and batch[0]['status']=='failed'
assert len(batch[0]['rows'])==1 and batch[0]['rows'][0]['status']=='pending' and batch[0]['rows'][0]['kind']=='unprocessed'
anchor=batch[0]['sourceAnchor'];source=d['chat'][anchor['messageId']]
assert anchor['chatId']==d['chatId'] and source['mes']==anchor['text'] and source.get('swipe_id',0)==anchor['swipeId']
rows=[json.loads(x) for x in Path(setup['branchChat']).read_text(encoding='utf-8').splitlines()]
assert rows[-1]['mes']==last['mes'] and rows[-1]['variables'][last.get('swipe_id',0)]['stat_data']['901_rules_poc']==root
assert not (E/(round_id+'.chat.jsonl')).exists()
shutil.copy2(setup['branchChat'],E/(round_id+'.chat.jsonl'));shutil.copy2(E/'browser'/(label+'.json'),E/(round_id+'.snapshot.json'))
proof={'round':round_id,'modelRequest':541 if round_id=='round-01' else 542,'savedActualProseUnchanged':True,'activeEqualsSaved':True,'sourceStillActive':True,'failedPendingPreserved':1,
 'messages':len(d['chat']),'revision':root['revision'],'actorsAndPriorOperationsAndKnowledgeReceiptsUnchanged':True,'sourceMessageId':anchor['messageId'],'chatSha256':sha(E/(round_id+'.chat.jsonl'))}
(E/(round_id+'.save-proof.json')).write_text(json.dumps(proof,indent=2)+'\n',encoding='utf-8')
print(json.dumps(proof))
