import test from 'node:test';
import assert from 'node:assert/strict';
import {createChronicleSequence901,withChronicleSequenceNote901} from './sequence.mjs';
const fixture=(codes)=>({sheet_log:{name:'纪要表',sourceData:{ddl:'CREATE TABLE chronicle(row_id INTEGER PRIMARY KEY,code_index TEXT);',note:'旧说明'},content:[['row_id','编码索引','纪要'],...codes.map((c,i)=>[String(i+1),c,'历史'+i])]}});
const physical=()=> 'jiyaobiao';
test('reads maximum code across all history, not row count or visible rows; allocates each insertion',()=>{
 const data=fixture(['AM0042','AM0001','AM0015']);const before=JSON.stringify(data);
 const seq=createChronicleSequence901(data,physical);
 assert.deepEqual(seq.values('jiyaobiao',['code_index','chronicle_text'],["'AM0001'","'新剧情'"]),["'AM0043'","'新剧情'"]);
 assert.deepEqual(seq.values('jiyaobiao',['chronicle_text','code_index'],["'另一条'","'AM0001'"]),["'另一条'","'AM0044'"]);
 assert.equal(JSON.stringify(data),before);
});
test('prompt projection reports full maximum without exposing hidden narrative or mutating input',()=>{
 const data=fixture(['AM0001','AM0015']);const before=JSON.stringify(data);const projected=withChronicleSequenceNote901(data);
 assert.match(projected.sheet_log.sourceData.note,/最大编号AM0015.*下一个AM0016/);
 assert.equal(JSON.stringify(data),before);
 assert.deepEqual(projected.sheet_log.content,data.sheet_log.content);
});
test('rejects rewriting old chronicles but leaves other tables alone',()=>{
 const seq=createChronicleSequence901(fixture(['AM0015']),physical);
 for(const action of ['UPDATE','DELETE','REPLACE'])assert.throws(()=>seq.guard('jiyaobiao',action,false),/旧纪要/);
 assert.throws(()=>seq.guard('jiyaobiao','INSERT',true),/旧纪要/);
 assert.doesNotThrow(()=>seq.guard('relationship_facts','UPDATE',false));
 assert.deepEqual(seq.values('relationship_facts',['source'],["'AM0001'"]),["'AM0001'"]);
});
test('empty history starts at one; retry and persisted next batch remain deterministic',()=>{
 const fresh=createChronicleSequence901(fixture([]),physical);
 assert.deepEqual(fresh.values('jiyaobiao',['code_index'],['NULL']),["'AM0001'"]);
 const data=fixture(['AM0015']);
 for(let i=0;i<2;i++)assert.deepEqual(createChronicleSequence901(data,physical).values('jiyaobiao',['code_index'],["'AM0001'"]),["'AM0016'"]);
 data.sheet_log.content.push(['17','AM0016','上次新增']);
 assert.deepEqual(createChronicleSequence901(data,physical).values('jiyaobiao',['code_index'],["'AM0001'"]),["'AM0017'"]);
});
