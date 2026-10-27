import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectStatusBudget,reduceStatusBudget} from './resource-status-budget.mjs';
const types=['恐惧','沮丧','亢奋','魅惑'];
const status=(type,source,points)=>({type,source,sourceActorId:'caster',points});
test('one budget per type is shared across actual sources, with recipient choice and no index identity',()=>{
 const state={statuses:[status('恐惧','a',8),status('恐惧','b',5),status('沮丧','c',8),status('魅惑','d',3)]};
 const spec={types,amount:6,targetId:'target'};const before=structuredClone(state);
 assert.throws(()=>inspectStatusBudget(state,spec),e=>e.code==='NEEDS_INPUT');assert.deepEqual(state,before);
 const choice={source:'受术者声明',chosenBy:'target',allocations:[{type:'恐惧',source:'a',sourceActorId:'caster',points:2},{type:'恐惧',source:'b',sourceActorId:'caster',points:4}]};
 state.statuses.reverse();const out=reduceStatusBudget(state,{...spec,choice});
 assert.equal(out.removed,15);assert.deepEqual(Object.fromEntries(state.statuses.map(s=>[s.source,s.points])),{c:2,b:1,a:6});
});
test('full coverage needs no arbitrary choice, protected rows remain, and invalid choices never partially mutate',()=>{
 const state={statuses:[status('恐惧','a',2),status('恐惧','b',3),{...status('恐惧','locked',10),removable:false},status('冻结','ice',8)]};
 const result=reduceStatusBudget(state,{types,amount:6,targetId:'target'});
 assert.equal(result.removed,5);assert.deepEqual(state.statuses.map(s=>s.source),['locked','ice']);
 const s={statuses:[status('恐惧','a',8),status('恐惧','b',5)]},before=structuredClone(s);
 assert.throws(()=>reduceStatusBudget(s,{types,amount:6,targetId:'target',choice:{source:'声明',chosenBy:'caster',allocations:[]}}));
 assert.deepEqual(s,before);
});

test('hatred and excitement share one adopted mechanical removal budget but keep actual source labels',()=>{
 const state={statuses:[{type:'亢奋',source:'excite',points:5},{type:'仇恨',source:'hate',points:5}]};
 const choice={source:'recipient choice',chosenBy:'p',allocations:[{type:'仇恨',source:'hate',points:4}]};
 const out=reduceStatusBudget(state,{types:['亢奋'],amount:4,targetId:'p',choice});
 assert.equal(out.removed,4);assert.deepEqual(state.statuses,[{type:'亢奋',source:'excite',points:5},{type:'仇恨',source:'hate',points:1}]);
});
