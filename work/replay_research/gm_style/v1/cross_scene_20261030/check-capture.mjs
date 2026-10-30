import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const stage=process.argv[2]??'baseline',base=import.meta.dirname,out=resolve(base,stage);
assert.ok(['baseline','candidate'].includes(stage));
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const cfg=await read(resolve(out,'config.json')),runs=await read(resolve(out,'captured-rounds.json'));
const style=await read('D:/github/sillyTavern/public/901-opening-combat/narrative-style.json');
const summary=(await readFile(resolve(base,'manual-summary.txt'),'utf8')).trim();
const change=await read(resolve(base,'candidate-change.json'));
const expected=stage==='baseline'?cfg.rounds:cfg.rounds.slice(8);
assert.equal(runs.length,expected.length);
const text=q=>q.messages.map(m=>typeof m.content==='string'?m.content:JSON.stringify(m.content)).join('\n');
const observations=[];
for(let i=0;i<runs.length;i++){
 const r=runs[i],test=expected[i],index=cfg.rounds.findIndex(x=>x.id===r.id);
 assert.equal(r.id,test.id);
 assert.equal(r.messages.find(m=>m.user)?.text,test.input);
 const classifications=r.requests.filter(q=>text(q).includes('你是901行动分类器'));
 const narrations=r.requests.filter(q=>q.messages.some(m=>m.role==='user'&&String(m.content).includes('裁定路径：')));
 assert.equal(classifications.length,1,r.id+' one classification');assert.equal(narrations.length,1,r.id+' one narration');
 const prompt=text(narrations[0]);
 assert.equal(prompt.split(style).length-1,1,r.id+' full style once');
 assert.ok(prompt.includes(stage==='baseline'?change.before:change.after));
 for(let j=0;j<index;j++)assert.ok(prompt.includes(cfg.rounds[j].input),r.id+' retained prior turn '+(j+1));
 const summaryCopies=prompt.split(summary).length-1;
 // Baseline reproduces the omitted Summary; candidate must include it exactly once.
 assert.equal(summaryCopies,stage==='baseline'?0:1,r.id+' Summary count');
 const replies=r.messages.filter(m=>!m.user);assert.equal(replies.length,1);
 assert.equal(replies[0].gate?.status,'NO_CHECK');
 assert.equal(r.afterState.revision,0);assert.deepEqual(r.afterState.operations,{});assert.equal(r.afterState.battleMode,null);
 observations.push({id:r.id,classificationCalls:1,narrationCalls:1,summaryCopies,styleOnce:true,allPriorInputsPresent:true,reply:replies[0].text});
}
const result={status:stage==='baseline'?'reproduced-summary-omission':'pass',scope:'actual request construction and mechanical state; semantic review recorded separately',rounds:observations};
await writeFile(resolve(out,'request-check.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,liveRounds:runs.length,summaryCounts:observations.map(x=>x.summaryCopies),classificationCalls:runs.length,narrationCalls:runs.length,ruleRevision:0}));
