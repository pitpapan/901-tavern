import test from 'node:test';
import assert from 'node:assert/strict';
import {sameTypeAdditionalSegments} from './resource-additional-damage.mjs';
const declaration={amount:4,magical:true,sourceId:'mark',casterId:'caster',grade:'D'};
test('Q30 splits one added total by surviving type weights, with each type taking its own lightest severity',()=>{
 const receipt={causedDamage:true,originalSegments:[{amount:1,severity:'A',kind:'physical'},{amount:1,severity:'L',kind:'physical'},{amount:4,severity:'B',kind:'energy',energyType:'electric'}]};
 const rows=sameTypeAdditionalSegments(receipt,declaration);
 assert.deepEqual(rows.map(x=>[x.amount,x.severity,x.kind]),[[1,'L','physical'],[3,'B','energy']]);
 assert.equal(rows.reduce((n,x)=>n+x.amount,0),4);
});
test('Q30 largest remainder ties use the declared type order, never hidden iteration order',()=>{
 const receipt={causedDamage:true,originalSegments:[{amount:1,severity:'L',kind:'physical'},{amount:1,severity:'L',kind:'energy',energyType:'electric'}]};
 assert.throws(()=>sameTypeAdditionalSegments(receipt,{...declaration,amount:1}),e=>e.code==='NEEDS_INPUT');
 assert.deepEqual(sameTypeAdditionalSegments(receipt,{...declaration,amount:1},['energy:electric','physical']).map(x=>[x.amount,x.kind]),[[1,'energy']]);
});
