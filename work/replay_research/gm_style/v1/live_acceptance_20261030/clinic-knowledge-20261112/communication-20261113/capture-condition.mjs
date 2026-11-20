// Collect the two actual local browser captures after one explicit UI send; no network.
import {readFile,writeFile,readdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const base=new URL('conditions-20261113/',import.meta.url),read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const id=process.argv[2];assert.ok(['pending','confirmed'].includes(id));
const setup=await read(new URL('browser-setup.json',base)),prepared=await read(new URL('prepared.json',base)),row=prepared.cases.find(c=>c.id===id);
assert.equal(row.status,'seed-ready-not-sent');
const used=prepared.cases.flatMap(c=>c.captures?.map(x=>x.file)??[]),dir=resolve(setup.app,'clinic-captures');
const names=(await readdir(dir)).filter(n=>n.endsWith('.json')&&!setup.captureFilesBefore.includes(n)&&!used.includes(n)).sort();
assert.equal(names.length,2);
const captures=[];
for(const name of names){
 const raw=await readFile(resolve(dir,name)),capture=JSON.parse(raw);
 assert.equal(capture.offline,true);assert.equal(capture.upstreamCalls,0);
 const body=capture.requestBody,flat=body.messages.map(m=>m.content).join('\n');
 assert.ok(flat.includes(row.input));assert.ok(flat.includes(row.condition));
 const context=JSON.parse(flat.split('【901逐角色知情投影】\n')[1].split('\n')[0]);assert.deepEqual(context,row.context);
 await copyFile(resolve(dir,name),new URL(name,base));captures.push({file:name,kind:capture.kind,sha256:sha(raw)});
 if(capture.kind==='narration'){
  assert.deepEqual({...body,messages:undefined},{...prepared.parameters,messages:undefined});
  const request=JSON.stringify(body);await writeFile(new URL(id+'.request.json',base),request,{flag:'wx'});
  row.request={file:id+'.request.json',bytes:Buffer.byteLength(request),sha256:sha(request),status:'captured-not-sent'};
 }
}
assert.deepEqual(captures.map(c=>c.kind),['classification','narration']);
await copyFile(resolve(setup.app,'data/default-user/chats/901 帝都初始卡 独立事项版 20261105/901 帝都正式续玩 20261106.jsonl'),new URL(id+'.captured.chat.jsonl',base));
row.captures=captures;row.status='captured-not-sent';
prepared.status=prepared.cases.every(c=>c.status==='captured-not-sent')?'two-final-requests-frozen-not-sent':'one-final-request-captured';
await writeFile(new URL('prepared.json',base),JSON.stringify(prepared,null,2)+'\n');
console.log(JSON.stringify({id,request:row.request,captures,modelCalls:0,credentialsRead:false}));
