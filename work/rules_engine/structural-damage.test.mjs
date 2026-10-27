import test from 'node:test';
import assert from 'node:assert/strict';
import {applyStructuralDamage} from './structural-damage.mjs';
test('anti-magic stone requires adjudication for ungraded energy damage without an exception',()=>{
 const stone={material:'antiMagicRock',durability:{current:10,max:10,hardness:0}};
 assert.throws(()=>applyStructuralDamage(stone,3,{magical:true,grade:'ungraded'}),/无等级.*裁定/);
 assert.equal(stone.durability.current,10);
 assert.equal(applyStructuralDamage(stone,3,{magical:true,grade:'A'}).structuralDamage,0);
 assert.equal(applyStructuralDamage(stone,3,{magical:true,grade:'S'}).structuralDamage,3);
});
