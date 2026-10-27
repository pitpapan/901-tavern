import test from 'node:test';
import assert from 'node:assert/strict';
import {selectConeTargets} from './resource-targeting.mjs';
test('finite cone uses axial length, half-angle boundaries and actual vertical positions',()=>{
 const at=position=>({position,state:{}}),L=10,r=L*Math.tan(Math.PI/8);
 const root={actors:{caster:at([0,0,0]),edge:at([L,r,0]),beyond:at([L+.01,0,0]),wide:at([L,r+.01,0]),above:at([L,0,r]),behind:at([-1,0,0])}};
 const result=selectConeTargets(root,'caster',{shape:'cone',center:'self',length:L,angleDegrees:45},{aim:[2,0,0]},n=>n,{combat:true});
 assert.deepEqual(result.targetIds,['edge','above']);
 root.actors.above.position=[L,0];root.actors.above.state.verticalPosition={heightAboveGround:r+.01,groundElevation:0,source:'flight'};
 assert.deepEqual(selectConeTargets(root,'caster',{shape:'cone',center:'self',length:L,angleDegrees:45},{aim:[1,0]},n=>n,{combat:true}).targetIds,['edge']);
});
