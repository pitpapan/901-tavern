import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const out=resolve(import.meta.dirname,process.argv[2]??'baseline'),read=async p=>JSON.parse(await readFile(p,'utf8'));
const cfg=await read(resolve(out,'config.json')),runs=await read(resolve(out,'captured-rounds.json'));
const style=await read('D:/github/sillyTavern/public/901-opening-combat/narrative-style.json');
const change=await read(resolve(import.meta.dirname,'candidate-change.json'));
const expectedInstruction=(process.argv[2]??'baseline')==='candidate'?change.after:change.before;
assert.equal(runs.length,6);
const text=q=>q.messages.map(m=>typeof m.content==='string'?m.content:JSON.stringify(m.content)).join('\n');
const observations=[];
for(let i=0;i<runs.length;i++){
 const r=runs[i],classifications=r.requests.filter(q=>text(q).includes('你是901行动分类器')),
   continuations=r.requests.filter(q=>q.messages.some(m=>m.role==='user'&&String(m.content).includes('裁定路径：')));
 assert.equal(r.messages.find(m=>m.user)?.text,cfg.rounds[i].input,r.id+' exact protocol input');
 assert.equal(classifications.length,1,r.id+' classification count');assert.equal(continuations.length,1,r.id+' continuation count');
 const prompt=text(continuations[0]);assert.equal(prompt.split(style).length-1,1,r.id+' full style once');
 assert.ok(continuations[0].messages.some(m=>m.role==='user'&&String(m.content).includes(expectedInstruction)),r.id+' expected final continuation instruction');
 for(let j=0;j<i;j++)assert.ok(prompt.includes(cfg.rounds[j].input),r.id+' keeps player turn '+(j+1));
 const replies=r.messages.filter(m=>!m.user);assert.equal(replies.length,1);assert.equal(replies[0].gate?.status,'NO_CHECK');
 assert.equal(r.afterState.revision,0);assert.deepEqual(r.afterState.operations,{});assert.equal(r.afterState.battleMode,null);
 observations.push({id:r.id,classificationCalls:1,narrationCalls:1,styleOnce:true,allPriorPlayerTurnsPresent:true,
   replyChars:replies[0].text.length,reply:replies[0].text,
   recurringMotifs:replies[0].text.match(/抹布|擦拭|雨声|没有催促|没有追问|等待.*安排|等待.*指示/g)??[]});
}
const result={status:'pass',scope:'request construction and unchanged mechanical state; prose and knowledge require the accompanying human review',rounds:observations};
await writeFile(resolve(out,'request-check.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:'pass',rounds:6,classificationCalls:6,narrationCalls:6,styleAndHistory:'pass',mechanicalState:'revision 0, no battle, no operations',replyChars:observations.map(r=>r.replyChars)}));
