import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const base=import.meta.dirname,read=async p=>JSON.parse(await readFile(p,'utf8'));
const cfg=await read(resolve(base,'config.json')),runs=await read(resolve(base,'captured-rounds.json'));
const seed=await read(resolve(base,'seed-chat.json'));
const summary=(await readFile(resolve(base,'adopted-summary.txt'),'utf8')).trim();
const style=await read('D:/github/sillyTavern/public/901-opening-combat/narrative-style.json');
assert.equal(style.length,2812);assert.ok(runs.length>0&&runs.length<=cfg.rounds.length);
const text=q=>q.messages.map(m=>typeof m.content==='string'?m.content:JSON.stringify(m.content)).join('\n');
const observations=[];
for(let i=0;i<runs.length;i++){
 const r=runs[i],test=cfg.rounds[i];assert.equal(r.id,test.id);assert.equal(r.messages.find(m=>m.user)?.text,test.input);
 const classifiers=r.requests.filter(q=>text(q).includes('你是901行动分类器'));
 const narrations=r.requests.filter(q=>q.messages.some(m=>m.role==='user'&&String(m.content).includes('裁定路径：')));
 assert.equal(classifiers.length,1);assert.equal(narrations.length,1);
 const prompt=text(narrations[0]);assert.equal(prompt.split(style).length-1,1);assert.equal(prompt.split(summary).length-1,1);
 for(const m of seed.slice(1).filter(m=>m.is_user))assert.ok(prompt.includes(m.mes),'seed input retained');
 for(let j=0;j<i;j++)assert.ok(prompt.includes(cfg.rounds[j].input),'new prior input retained');
 const replies=r.messages.filter(m=>!m.user);assert.equal(replies.length,1);assert.equal(replies[0].gate?.status,'NO_CHECK');
 assert.equal(r.afterState.revision,0);assert.deepEqual(r.afterState.operations,{});assert.equal(r.afterState.battleMode,null);
 observations.push({id:r.id,classificationCalls:1,narrationCalls:1,summaryCopies:1,styleChars:style.length,fullStyleCopies:1,allPriorPlayerInputsRetained:true,ruleRevision:0,reply:replies[0].text});
}
const result={status:runs.length===cfg.rounds.length?'pass':'partial',scope:'Actual request loading and rules; narrative semantics reviewed by main session separately',liveRounds:runs.length,plannedRounds:cfg.rounds.length,rounds:observations};
await writeFile(resolve(base,'request-check.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,liveRounds:runs.length,summaryCopies:runs.map(()=>1),classificationCalls:runs.length,narrationCalls:runs.length,ruleRevision:0}));
