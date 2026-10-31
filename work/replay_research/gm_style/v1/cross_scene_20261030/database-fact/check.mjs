import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { book, chatId, cue, fact, input, name } from './scenario.mjs';

const root = 'D:/github/sillyTavern', data = join(root,'data/default-user');
const rows = (await readFile(join(data,'chats',name,chatId+'.jsonl'),'utf8')).trimEnd().split(/\r?\n/).map(JSON.parse);
const runs = rows[0].chat_metadata.db_fact_acceptance_20261031;
assert.equal(runs?.length,1,'expected one saved recorder run');
const [run] = runs;
const question = run.messages.filter(m=>m.user);
const answers = run.messages.filter(m=>!m.user);
assert.equal(question.length,1);
assert.equal(question[0].text,input);
assert.equal(answers.length,1);
assert.equal(answers[0].text,rows.at(-1).mes);
assert.equal(rows.length-1,5);
assert(!rows.slice(1,5).some(m=>m.mes.includes(cue)));
assert(!rows.slice(1).some(m=>m.extra?.memory));
const src = rows[3].TavernDB_ACU_IsolatedData[''].storageFrame.checkpoint.data.sheet_ji_yao_biao;
assert.equal(src.content[1][4],fact);
const sourceBooks=[];
for (const file of await readdir(join(data,'worlds'))) {
    if (file.endsWith('.json') && (await readFile(join(data,'worlds',file),'utf8')).includes(cue)) sourceBooks.push(file);
}
assert.deepEqual(sourceBooks,[book+'.json']);
const entries=JSON.parse(await readFile(join(data,'worlds',sourceBooks[0]),'utf8')).entries;
const matches=Object.values(entries).filter(e=>e.content.includes(fact));
assert.equal(matches.length,1);
const [rowEntry]=matches;
const counts=s=>s.split(cue).length-1;
const requests=run.requests.map(q=>{
    const joined=q.messages.map(m=>typeof m.content==='string'?m.content:JSON.stringify(m.content)).join('\n');
    const kind=q.messages.some(m=>m.role==='user' && String(m.content).includes('裁定路径：'))?'narration':joined.includes('你是901行动分类器')?'classification':'outer';
    return {kind,model:q.model,promptSha256:createHash('sha256').update(joined).digest('hex'),cueCount:counts(joined),completeFact:joined.includes(fact),
        matches:q.messages.filter(m=>typeof m.content==='string'&&m.content.includes(cue)).map(m=>({role:m.role,hasMemoryWrapper:m.content.includes('<记忆回溯>'),line:m.content.split('\n').find(l=>l.includes(cue))}))};
});
assert.equal(requests.filter(q=>q.kind==='classification').length,1);
const narrations=requests.filter(q=>q.kind==='narration');
assert.equal(narrations.length,1);
const report={question:input,databaseSource:{table:src.name,code:src.content[1][1],fact},testWorld:book,entry:{uid:rowEntry.uid,comment:rowEntry.comment,disabled:rowEntry.disable,constant:rowEntry.constant,depth:rowEntry.depth},
    loadedEvents:run.activated.map(a=>a.filter(e=>e.world===book&&e.uid===rowEntry.uid)),
    requests,reply:answers[0].text,gate:answers[0].gate?.status,stateBefore:run.beforeState,stateAfter:run.afterState,
    factInNarration:narrations[0].completeFact,cueInReply:answers[0].text.includes(cue)};
await writeFile(join(import.meta.dirname,'result.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
