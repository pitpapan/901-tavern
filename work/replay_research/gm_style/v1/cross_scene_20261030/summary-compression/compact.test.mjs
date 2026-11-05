import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as compact from './compact.mjs';
import {renderStage901 as full, assertStageCoverage901 as oldGuard} from '../summary-coverage/coverage.mjs';
const input=JSON.parse(fs.readFileSync(new URL('../summary-formal/initial.json',import.meta.url),'utf8')).tables;
const C='sheet_ji_yao_biao',S='sheet_da_zong_jie',R='sheet_relationship_facts';
const names={[C]:'纪要表',[S]:'大总结',[R]:'独立关系事项'};
const state={enabled:true,bigSummarySheetKey:S,hiddenRowIds:[]};
const clone=x=>structuredClone(x);
function setup(){const before=Object.fromEntries(Object.entries(input).map(([k,content])=>[k,{name:names[k]||k,content:clone(content)}]));const after=clone(before);after[S].content.push(['2','unverified model prose']);return {before,after}}
test('shorter stage restores every original field including private limits and each independent item',()=>{
 const {before,after}=setup();compact.compileStage901(before,after,state,15);const text=after[S].content.at(-1)[1];
 assert.ok(text.length<full(before,state,15).length,'Stage must actually shrink');
 const decoded=compact.decodeStage901(text);
 assert.deepEqual(decoded.chronicles,before[C].content);assert.deepEqual(decoded.relationships,before[R].content);
 assert.match(text,/黄泉向黎舟借入青竹伞/);assert.match(text,/黄泉尚须向黎舟归还青竹伞/);
 assert.match(text,/始终未说出口/);assert.match(text,/不信/);assert.match(text,/未交代/);
 assert.equal(compact.assertStageCoverage901(before,after,state,15),true);
 assert.deepEqual(after[S].content.slice(0,-1),before[S].content);assert.deepEqual(after[C],before[C]);assert.deepEqual(after[R],before[R]);
});
test('omitted private chronicle, lost knowledge field, reordered sources and reversed loan cannot authorize hiding',()=>{
 for(const corrupt of [
  s=>s.split('\n').filter(line=>!line.includes('\tAM0003\t')).join('\n'),
  s=>s.replace('黄泉；是否告知他人未交代','所有人'),
  s=>s.replace('黄泉向黎舟借入青竹伞','黎舟向黄泉借入青竹伞'),
  s=>s.split('\n').map(line=>line.includes('\tAM0002\t')?line.replace('AM0002','AM0001'):line).join('\n'),
 ]){
  const {before,after}=setup();compact.compileStage901(before,after,state,15);after[S].content.at(-1)[1]=corrupt(after[S].content.at(-1)[1]);
  const untouched=JSON.stringify(before);assert.throws(()=>compact.assertStageCoverage901(before,after,state,15),/覆盖/);
  assert.equal(JSON.stringify(before),untouched);assert.deepEqual(state.hiddenRowIds,[]);
 }
});
test('JSON row encoding preserves quotes, newlines, Unicode, empty strings, nulls and numeric types',()=>{
 const {before,after}=setup();before[C].content[1][4]='~null 问：“a|b\\c”\n下一行：雪🌧️\t[仍私密]';before[C].content[1][5]=null;before[R].content[1][0]=1;
 after[C]=clone(before[C]);after[R]=clone(before[R]);compact.compileStage901(before,after,state,15);
 const decoded=compact.decodeStage901(after[S].content.at(-1)[1]);assert.deepEqual(decoded.chronicles,before[C].content);assert.deepEqual(decoded.relationships,before[R].content);
 assert.equal(compact.assertStageCoverage901(before,after,state,15),true);
});
test('original guard invariants, visibility threshold, legacy summaries and same-batch source boundary remain enforced',()=>{
 const {before,after}=setup();after[C].content.push(['16','AM0016','未交代','later','同批事件','']);
 compact.compileStage901(before,after,state,15);assert.ok(!after[S].content.at(-1)[1].includes('同批事件'));
 assert.equal(compact.assertStageCoverage901(before,after,state,15),true);
 for(const mutate of [a=>a[C].content[1][4]='changed',a=>a[S].content[1][1]='changed',a=>a[R].content[5][5]='已归还']){
  const damaged=clone(after);mutate(damaged);assert.throws(()=>compact.assertStageCoverage901(before,damaged,state,15),/覆盖/);
 }
 assert.throws(()=>compact.compileStage901(before,clone(after),{...state,hiddenRowIds:['1']},15),/覆盖/);
 const legacy=clone(after);legacy[S].content.at(-1)[1]=full(before,state,15);assert.equal(compact.assertStageCoverage901(before,legacy,state,15),oldGuard(before,legacy,state,15));
 assert.equal(compact.assertStageCoverage901(before,clone(before),state,15),false);
 const partial={...state,hiddenRowIds:['1']};const x=clone(after);compact.compileStage901(before,x,partial,14);
 assert.deepEqual(compact.decodeStage901(x[S].content.at(-1)[1]).chronicles,[before[C].content[0],...before[C].content.slice(2)]);
 assert.equal(compact.assertStageCoverage901(before,x,partial,14),true);
});
