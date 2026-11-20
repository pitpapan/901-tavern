// Bounded acceptance helper only; never part of the candidate or formal installation.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const base=new URL('./',import.meta.url),live=new URL('live-model-20261115/',base),at=s=>new URL(s,live);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const put=(p,v,exclusive=false)=>writeFile(p,JSON.stringify(v,null,2)+'\n',exclusive?{flag:'wx'}:{});
const plan=await read(new URL('model-batch/plan.json',base));
const [mode,id,path,...notes]=process.argv.slice(2);
if(mode==='--init'){
 await mkdir(live,{recursive:true});
 await put(at('run.json'),{authorization:'2026-11-15用户对完整12次集成批次明确回复“授权”；5叙事+5接收+2依赖，分类本地控制。首次失败/必要分支缺失即停，不重试、不修补、不部署、不写正式剧情、不恢复自动批准修订。',baseline:334,limit:12,cumulative:334,remaining:12,attempts:[],closed:false,retries:0},true);
 const baseline=await read(new URL('final-verification.json',base));await put(at('source-baseline.json'),baseline.sourceHashes,true);
 console.log(JSON.stringify({limit:12,baseline:334,sent:0}));
}else if(mode==='--send'){
 const ledger=await read(at('run.json'));assert.equal(ledger.closed,false);assert.ok(ledger.remaining>0);
 assert.equal(plan.dynamicCalls[ledger.attempts.length].id,id);assert.ok(ledger.attempts.every(x=>x.manualVerdict==='pass'));
 const raw=await readFile(resolve(path),'utf8'),request=JSON.parse(raw);
 const frozen=plan.firstRequests.find(x=>x.branch+'1.narration'===id);if(frozen)assert.equal(sha(raw),frozen.sha256);
 assert.deepEqual(Object.fromEntries(Object.entries(request).filter(([k])=>!['messages','response_format'].includes(k))),plan.modelAndParameters);
 for(const [p,h] of Object.entries(await read(at('source-baseline.json'))))assert.equal(sha(await readFile(resolve('TRPG outputs',p))),h,p);
 const settings=(await read('D:/github/sillyTavern/data/default-user/settings.json')).oai_settings;
 assert.equal(settings.chat_completion_source,'custom');assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');assert.equal(settings.custom_model,request.model);
 assert.ok(!settings.custom_include_body&&!settings.custom_exclude_body&&!settings.custom_include_headers,'Custom overrides changed');
 const keys=(await read('D:/github/sillyTavern/data/default-user/secrets.json')).api_key_custom.filter(x=>x.active);assert.equal(keys.length,1);const apiKey=keys[0].value;
 await writeFile(at(id+'.request.json'),raw,{flag:'wx'});
 const attempt={id,customRequest:ledger.cumulative+1,state:'reserved',requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw),startedAt:new Date().toISOString()};ledger.attempts.push(attempt);ledger.cumulative++;ledger.remaining--;await put(at('run.json'),ledger);
 console.log(JSON.stringify({sending:id,customRequest:attempt.customRequest,bytes:attempt.requestBytes}));
 const {captureSavedReview}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs')));
 const response=await captureSavedReview({rawBody:raw,apiKey,timeoutMs:180000,onUpdate:r=>put(at(id+'.response.json'),{...r,kind:plan.dynamicCalls[ledger.attempts.length-1].kind})});
 Object.assign(attempt,{state:response.outcome,status:response.status,elapsedMs:response.elapsedMs});
 if(response.responseText!==undefined){await writeFile(at(id+'.raw-response.txt'),response.responseText,{flag:'wx'});attempt.rawResponseSha256=sha(response.responseText);attempt.rawUnmodified=attempt.rawResponseSha256===response.responseBodySha256BeforePrivacyRedaction;}
 if(response.outcome==='completed'){
  let value;try{value=JSON.parse(response.responseText);}catch{}
  const choice=value?.choices?.[0];attempt.finishReason=choice?.finish_reason;attempt.responseModel=value?.model;attempt.usage=value?.usage;
  if(typeof choice?.message?.content!=='string'||!choice.message.content.trim()||choice.finish_reason!=='stop')attempt.state='protocol-error';
  else await writeFile(at(id+'.content.txt'),choice.message.content,{flag:'wx'});
 }
 if(attempt.state!=='completed'){ledger.closed=true;ledger.stopReason=attempt.state;}
 await put(at('run.json'),ledger);console.log(JSON.stringify({...attempt,remaining:ledger.remaining,closed:ledger.closed}));
}else if(mode==='--mark'){
 const ledger=await read(at('run.json')),attempt=ledger.attempts.at(-1);assert.equal(attempt.id,id);assert.ok(['pass','fail','uncovered'].includes(path));
 attempt.manualVerdict=path;attempt.assessment=notes.join(' ');if(path!=='pass'||ledger.remaining===0){ledger.closed=true;ledger.stopReason=path==='pass'?'budget-exhausted':path;}
 await put(at('run.json'),ledger);console.log(JSON.stringify({id,verdict:path,closed:ledger.closed,remaining:ledger.remaining}));
}else throw Error('Unknown mode');
