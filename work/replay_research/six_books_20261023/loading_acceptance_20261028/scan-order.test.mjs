// Exercise the installed helper's actual compiled WI adapter, stubbing only host I/O.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const bundle=await readFile('D:/github/sillyTavern/public/scripts/extensions/third-party/JS-Slash-Runner/dist/index.js','utf8');
const start=bundle.indexOf('async function SW(e,t,n){');
assert.ok(start>0,'This focused check targets the inspected helper 4.11.3 bundle');
const end=bundle.indexOf('function CW(',start);
const adapter=bundle.slice(start,end);
test('installed generateRaw WI adapter supplies latest messages first to the four-message host scanner',async()=>{
  let received;
  const load=new Function('ve','ye','ot','le','eee','uW','oW','CW',adapter+';return SW;');
  const process=load('user','host',false,()=>10000,async messages=>{
    received=messages;return {worldInfoString:'',worldInfoBefore:'',worldInfoAfter:'',worldInfoExamples:[],worldInfoDepth:[]};
  },async()=>{},()=>true,()=>{});
  const messages=['最新喝茶','雨声','木凳','铜壶','街口','旧洛汀矿料'].map(content=>({role:'user',content}));
  await process(messages,{},{});
  assert.deepEqual(received,messages.map(m=>m.content));
  assert.equal(received.slice(0,4).some(m=>m.includes('洛汀')),false);
});
