import test from 'node:test';
import assert from 'node:assert/strict';
import {healWounds} from './healing.mjs';
const patient=()=>({state:{derived:{hpMax:5},health:{intact:2,A:1,L:2,B:0,temp:0}}});
test('enabled aggravated healing takes priority over serious wounds even with a lower-severity-first plan',()=>{
 const a=patient(),order=['L','A','B'];
 const out=healWounds(a,{budget:4,order,ratios:{A:4,L:2,B:1}});
 assert.deepEqual(out.changes,[{severity:'A',amount:1}]);
 assert.equal(a.state.health.A,0);assert.equal(a.state.health.L,2);assert.equal(out.remaining,0);
 assert.deepEqual(order,['L','A','B']);
});
test('aggravated priority does not enable excluded healing or change wound prices',()=>{
 for(const config of [{order:['L','B'],ratios:{A:4,L:2,B:1}},{order:['L','A','B'],ratios:{L:2,B:1}}]){
  const a=patient();const out=healWounds(a,{budget:2,...config});
  assert.deepEqual(out.changes,[{severity:'L',amount:1}]);assert.equal(a.state.health.A,1);
 }
});
