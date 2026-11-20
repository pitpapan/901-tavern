
// Endpoints for the disposable loopback copy only.
const topicLabConfig=()=>JSON.parse(fs901.readFileSync('clinic-topic-config.json','utf8'));
router.post('/clinic-topic-phase',(request,response)=>{
 const c=topicLabConfig();
 if(!['before','received-bright','reopened-bright','received-huang'].includes(request.body.phase))return response.sendStatus(400);
 c.phase=request.body.phase;
 fs901.writeFileSync('clinic-topic-config.json',JSON.stringify(c));
 return response.json({phase:c.phase,upstreamCalls:0});
});
router.post('/clinic-topic-receipt',(request,response)=>{
 const c=topicLabConfig();
 fs901.appendFileSync(c.evidenceDir+'/receipt-results.jsonl',JSON.stringify(request.body)+'\n');
 return response.json({logged:true});
});
router.post('/clinic-topic-evidence',(request,response)=>{
 const c=topicLabConfig(),{label,chatId}=request.body;
 if(!/^[-a-zA-Z0-9]+$/.test(label)||typeof chatId!=='string'||/[\\/]/.test(chatId)||!chatId.includes('Branch #')||chatId===c.parentChatId)
  return response.sendStatus(400);
 const bytes=fs901.readFileSync(c.chatDir+'/'+chatId+'.jsonl');
 fs901.writeFileSync(c.evidenceDir+'/'+label+'.seed.jsonl',bytes,{flag:'wx'});
 fs901.writeFileSync(c.evidenceDir+'/'+label+'.json',JSON.stringify({...request.body,nonCanon:true,modelCalls:0},null,2),{flag:'wx'});
 return response.json({seedSha256:hash901('sha256').update(bytes).digest('hex')});
});
