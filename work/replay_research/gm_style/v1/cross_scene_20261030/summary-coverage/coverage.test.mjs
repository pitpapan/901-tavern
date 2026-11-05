import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compileStage901, assertStageCoverage901, renderStage901 } from './coverage.mjs';
const load=n=>JSON.parse(fs.readFileSync(new URL('../stage-recall/'+n,import.meta.url),'utf8'));
const clone=x=>structuredClone(x);
const names={sheet_ji_yao_biao:'纪要表',sheet_da_zong_jie:'大总结',sheet_relationship_facts:'独立关系事项'};
function fixture(){return Object.fromEntries(Object.entries(load('initial.json').tables).map(([key,content])=>[key,{name:names[key]||key,content}]))}
const state={enabled:true,bigSummarySheetKey:'sheet_da_zong_jie',hiddenRowIds:[]};
function candidate(text){const b=fixture(),a=clone(b);a.sheet_da_zong_jie.content.push(['2',text]);return {b,a}}
test('both observed omissions and keyword-complete reversed or synonymous free summaries cannot authorize hiding',()=>{
 for(const text of [load('summary-original-failure.json').newSummary,load('summary.json').newSummary,'AM0001—AM0015 苇灯六结 瓷雀二鸣 修伞匠 不信传闻 黎舟向黄泉借伞，黄泉不欠伞','所有事件均已概述，黄泉已把伞借来且仍未还']){
  const {b,a}=candidate(text);const before=JSON.stringify(b);assert.throws(()=>assertStageCoverage901(b,a,state,15),/覆盖/);assert.equal(JSON.stringify(b),before);
 }
});
test('lossless stage includes all source fields, private limits, and explicit structured loan roles',()=>{
 const {b,a}=candidate('unverified prose');assert.deepEqual(compileStage901(b,a,state,15),['sheet_da_zong_jie']);
 const text=a.sheet_da_zong_jie.content.at(-1)[1];
 for(const row of b.sheet_ji_yao_biao.content.slice(1))for(const cell of row.slice(1))if(cell)assert.ok(text.includes(cell));
 assert.match(text,/黄泉向黎舟借入青竹伞/);assert.match(text,/黄泉尚须向黎舟归还青竹伞/);
 assert.match(text,/转述传闻.*不信/);assert.match(text,/处理修伞.*信任/);assert.match(text,/始终未说出口/);
 assert.ok(!text.includes('unverified prose'));assertStageCoverage901(b,a,state,15);
 assert.deepEqual(a.sheet_da_zong_jie.content.slice(0,-1),b.sheet_da_zong_jie.content);
});
test('guard rejects omitted field, reversed explicit direction, changed source, changed historical summary, and changed relation snapshot',()=>{
 for(const mutate of [a=>a.sheet_da_zong_jie.content.at(-1)[1]=a.sheet_da_zong_jie.content.at(-1)[1].replace('不信他转述的传闻','相信他转述的传闻'),a=>a.sheet_da_zong_jie.content.at(-1)[1]=a.sheet_da_zong_jie.content.at(-1)[1].replace('黄泉向黎舟借入','黎舟向黄泉借入'),a=>a.sheet_ji_yao_biao.content[2][4]='changed',a=>a.sheet_da_zong_jie.content[1][1]='changed',a=>a.sheet_relationship_facts.content[5][5]='已归还']){
  const {b,a}=candidate('draft');compileStage901(b,a,state,15);mutate(a);assert.throws(()=>assertStageCoverage901(b,a,state,15),/覆盖/);
 }
});
test('source threshold counts visible preexisting rows only; same-batch new chronicle excluded',()=>{
 const {b,a}=candidate('draft');a.sheet_ji_yao_biao.content.push(['16','AM0016','未交代','new','同批新事件','']);
 compileStage901(b,a,state,15);assertStageCoverage901(b,a,state,15);assert.ok(!a.sheet_da_zong_jie.content.at(-1)[1].includes('同批新事件'));
 assert.throws(()=>compileStage901(b,a,{...state,hiddenRowIds:['1']},15),/覆盖/);
 const partial={...state,hiddenRowIds:['1']};const text=renderStage901(b,partial,14);assert.ok(!text.includes(b.sheet_ji_yao_biao.content[1][4]));assert.ok(text.includes('AM0015'));
});
test('no new summary and disabled flight mode leave all data unchanged',()=>{
 const b=fixture(),a=clone(b);assert.deepEqual(compileStage901(b,a,state,15),[]);assert.equal(assertStageCoverage901(b,a,state,15),false);
 const c=candidate('draft');assert.deepEqual(compileStage901(c.b,c.a,{...state,enabled:false},15),[]);assert.equal(c.a.sheet_da_zong_jie.content.at(-1)[1],'draft');
});
