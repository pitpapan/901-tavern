import test from 'node:test';
import assert from 'node:assert/strict';
import {transferResourcePool} from './resource-pools.mjs';
const source='隔离规则测试：实际能量池及独立测试日限额规则';
const pool=(current,max=current,more={})=>({current,max,generic:true,source,...more});
const setup=()=>({from:{resources:{内力:pool(6),魔力:pool(3),怒气:pool(9,9,{generic:false,special:true})}},to:{resources:{魔力:pool(0,10)}}});
const base={sourceId:'test:transfer',version:'test/1',casterId:'caster',targetId:'target',declaredPool:'内力',destinationPool:'魔力',amount:3,recover:{op:'floor',args:[{op:'div',args:[{context:'drained'},3]}]}};
const day={key:'test:transfer',basis:'current',maximum:3,source};
test('pool transfers use actual loss, clamp balances and never create or drain special pools',()=>{
 const {from,to}=setup();const out=transferResourcePool(from,to,base);
 assert.equal(out.drained,3);assert.equal(out.recovered,1);assert.equal(from.resources.内力.current,3);assert.equal(to.resources.魔力.current,1);
 const empty=transferResourcePool(from,to,{...base,amount:20});assert.equal(empty.drained,3);assert.equal(empty.recovered,1);
 const zero=transferResourcePool(from,to,{...base,drawDice:()=>{throw Error('empty declared pool must not reroll');}});assert.equal(zero.drained,0);
 const onlySpecial={resources:{怒气:pool(9,9,{special:true})}};
 assert.equal(transferResourcePool(onlySpecial,to,{...base,declaredPool:'怒气'}).ineffective,'no-eligible-pool');assert.equal(onlySpecial.resources.怒气.current,9);
 assert.throws(()=>transferResourcePool(from,to,{...base,destinationPool:'不存在'}),/实际.*能量池/);assert.equal(to.resources.不存在,undefined);
});
test('missing declared pools choose uniformly from classified generic pools using trusted d10 only',()=>{
 const {from,to}=setup(),rolls=[[10],[2]];
 // Three candidates: 10 is rejected instead of biasing candidate zero.
 from.resources.气=pool(9);
 const out=transferResourcePool(from,to,{...base,declaredPool:'不存在',drawDice:()=>rolls.shift()});
 assert.equal(out.sourcePool,'魔力');assert.deepEqual(out.selection.dice,[10,2]);assert.equal(from.resources.怒气.current,9);
 const unknown={resources:{内力:{current:4,max:4},魔力:pool(6)}};
 assert.throws(()=>transferResourcePool(unknown,to,{...base,declaredPool:'不存在',drawDice:()=>[1]}),/分类/);
 assert.equal(unknown.resources.内力.current,4);
});
test('daily restoration counts actual recovery, persists across reload and shares a source across grades',()=>{
 let {from,to}=setup();
 let out=transferResourcePool(from,to,{...base,amount:6,daily:day,dayId:'day-1',grade:'D'});
 assert.equal(out.recovered,2);assert.equal(to.resourceDailyUsage['test:transfer']['day-1'].used,2);
 ({from,to}=JSON.parse(JSON.stringify({from,to})));from.resources.内力.current=6;
 out=transferResourcePool(from,to,{...base,amount:6,daily:day,dayId:'day-1',grade:'C'});
 assert.equal(out.recovered,1);assert.equal(from.resources.内力.current,0);
 from.resources.内力.current=6;
 out=transferResourcePool(from,to,{...base,amount:6,daily:day,dayId:'day-1'});assert.equal(out.recovered,0);assert.equal(out.drained,6);
 from.resources.内力.current=6;
 assert.equal(transferResourcePool(from,to,{...base,amount:6,daily:day,dayId:'day-2'}).recovered,2);
 assert.equal(to.resourceDailyUsage['test:transfer']['day-1'].used,3);
});
test('current-capacity budgets retain prior usage when capacity changes and never count overflow',()=>{
 const {from,to}=setup();to.resources.魔力.current=9;
 const first=transferResourcePool(from,to,{...base,amount:6,daily:day,dayId:'day-1'});assert.equal(first.recovered,1);
 assert.equal(to.resourceDailyUsage['test:transfer']['day-1'].used,1);
 from.resources.内力.current=6;to.resources.魔力.current=0;
 assert.equal(transferResourcePool(from,to,{...base,amount:6,daily:{...day,maximum:0},dayId:'day-1'}).recovered,0);
 from.resources.内力.current=6;
 assert.equal(transferResourcePool(from,to,{...base,amount:6,daily:{...day,maximum:2},dayId:'day-1'}).recovered,1);
});
test('unadopted daily policy or missing actual day never consumes either pool',()=>{
 const {from,to}=setup(),before=structuredClone({from,to});
 assert.throws(()=>transferResourcePool(from,to,{...base,daily:{...day,basis:'pending'},dayId:'day-1'}),e=>e.code==='RULE_UNRESOLVED');
 assert.throws(()=>transferResourcePool(from,to,{...base,daily:day}),/实际.*日期/);
 assert.deepEqual({from,to},before);
});

test('first-use daily policies are explicit and preserve the original maximum',()=>{
 const {from,to}=setup(),daily={...day,basis:'first-use',maximum:1};
 assert.equal(transferResourcePool(from,to,{...base,daily,dayId:'day-1'}).recovered,1);
 assert.equal(transferResourcePool(from,to,{...base,daily:{...daily,maximum:10},dayId:'day-1'}).recovered,0);
 assert.equal(to.resourceDailyUsage['test:transfer']['day-1'].maximum,1);
});
test('self transfers use post-drain space and a supplied context cannot replace the actual destination maximum',()=>{
 const s={resources:{魔力:pool(6,6)}};
 const out=transferResourcePool(s,s,{...base,declaredPool:'魔力',amount:3,daily:{...day,maximum:{context:'destinationMax'}},dayId:'day-1',context:{destinationMax:999}});
 assert.equal(out.drained,3);assert.equal(out.recovered,1);assert.equal(s.resources.魔力.current,4);assert.equal(out.daily.maximum,6);
});
