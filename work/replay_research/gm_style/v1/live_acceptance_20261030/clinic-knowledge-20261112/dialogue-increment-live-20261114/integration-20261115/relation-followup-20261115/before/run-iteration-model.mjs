// Bounded acceptance helper only; never part of the candidate or formal installation.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const base=new URL('./',import.meta.url),live=new URL('iteration-200-20261115/',base),at=s=>new URL(s,live);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const put=(p,v,exclusive=false)=>writeFile(p,JSON.stringify(v,null,2)+'\n',exclusive?{flag:'wx'}:{});
const plan=await read(new URL('model-batch/plan.json',base));
const [mode,id,path,...notes]=process.argv.slice(2);
if(mode==='--send'||mode==='--retest'||mode==='--reproduce-failure'){
 const ledger=await read(at('run.json'));assert.equal(ledger.complete,false);assert.ok(ledger.remaining>0);
 assert.ok(ledger.attempts.every(x=>x.manualVerdict),'Review previous attempt first');assert.ok(notes.join(' ').trim(),'Provide test purpose/change');assert.ok(!ledger.attempts.some(x=>x.id===id));
 const raw=await readFile(resolve(path),'utf8'),request=JSON.parse(raw);
 assert.deepEqual(Object.fromEntries(Object.entries(request).filter(([k])=>!['messages','response_format'].includes(k))),plan.modelAndParameters);
 const sourceHashes={};for(const p of ['901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js','TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs','TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs'])sourceHashes[p]=sha(await readFile(resolve(p)));
 const repeated=ledger.attempts.findLast(x=>x.requestSha256===sha(raw));
 // Explicitly authorized reproduction after a reviewed local fix. An ordinary
 // send, unchanged-source retry, or repeat of a passing request remains blocked.
 // A user-requested unchanged-input reproduction needs a finite, exact-hash
 // authorization recorded after diagnosis. Ordinary sends/retests keep their
 // existing guards; this does not schedule or automatically repeat anything.
 const reproduction=mode==='--reproduce-failure'?ledger.explicitReproductions?.[id]:null;
 if(mode==='--reproduce-failure'){
  assert.ok(repeated&&repeated.manualVerdict==='fail'&&reproduction?.of===repeated.id&&reproduction.requestSha256===sha(raw)&&reproduction.reason,'Explicit failed-input reproduction required');
  assert.deepEqual(repeated.sourceHashes,sourceHashes,'Use ordinary changed-source retest instead');
 }
 assert.ok(!repeated||mode==='--retest'&&repeated.manualVerdict==='fail'&&JSON.stringify(repeated.sourceHashes)!==JSON.stringify(sourceHashes)||mode==='--reproduce-failure'&&reproduction,'No identical blind retry');
 if(mode==='--retest')assert.ok(repeated,'Retest must identify a previous failed request');
 const settings=(await read('D:/github/sillyTavern/data/default-user/settings.json')).oai_settings;
 assert.equal(settings.chat_completion_source,'custom');assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');assert.equal(settings.custom_model,request.model);
 assert.ok(!settings.custom_include_body&&!settings.custom_exclude_body&&!settings.custom_include_headers,'Custom overrides changed');
 const keys=(await read('D:/github/sillyTavern/data/default-user/secrets.json')).api_key_custom.filter(x=>x.active);assert.equal(keys.length,1);const apiKey=keys[0].value;
 await writeFile(at(id+'.request.json'),raw,{flag:'wx'});
 const attempt={id,customRequest:ledger.cumulative+1,state:'reserved',purpose:notes.join(' '),...(repeated?{retestOf:repeated.id}:{}),...(reproduction?{unchangedSourceReproduction:true,reproductionReason:reproduction.reason}:{}),sourceHashes,requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw),startedAt:new Date().toISOString()};ledger.attempts.push(attempt);ledger.cumulative++;ledger.used++;ledger.remaining--;await put(at('run.json'),ledger);
 console.log(JSON.stringify({sending:id,customRequest:attempt.customRequest,bytes:attempt.requestBytes}));
 const {captureSavedReview}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs')));
 const response=await captureSavedReview({rawBody:raw,apiKey,timeoutMs:180000,onUpdate:r=>put(at(id+'.response.json'),{...r,kind:id})});
 Object.assign(attempt,{state:response.outcome,status:response.status,elapsedMs:response.elapsedMs});
 if(response.responseText!==undefined){await writeFile(at(id+'.raw-response.txt'),response.responseText,{flag:'wx'});attempt.rawResponseSha256=sha(response.responseText);attempt.rawUnmodified=attempt.rawResponseSha256===response.responseBodySha256BeforePrivacyRedaction;}
 if(response.outcome==='completed'){
  let value;try{value=JSON.parse(response.responseText);}catch{}
  const choice=value?.choices?.[0];attempt.finishReason=choice?.finish_reason;attempt.responseModel=value?.model;attempt.usage=value?.usage;
  if(typeof choice?.message?.content!=='string'||!choice.message.content.trim()||choice.finish_reason!=='stop')attempt.state='protocol-error';
  else await writeFile(at(id+'.content.txt'),choice.message.content,{flag:'wx'});
 }
 if(attempt.state!=='completed')ledger.lastFailure=attempt.state;
 await put(at('run.json'),ledger);console.log(JSON.stringify({...attempt,remaining:ledger.remaining,closed:ledger.closed}));
}else if(mode==='--mark'){
 const ledger=await read(at('run.json')),attempt=ledger.attempts.at(-1);assert.equal(attempt.id,id);assert.ok(['pass','fail','uncovered'].includes(path));
 attempt.manualVerdict=path;attempt.assessment=notes.join(' ');if(path!=='pass')ledger.lastFailure={id,assessment:notes.join(' ')};
 await put(at('run.json'),ledger);console.log(JSON.stringify({id,verdict:path,closed:ledger.closed,remaining:ledger.remaining}));
}else throw Error('Unknown mode');
