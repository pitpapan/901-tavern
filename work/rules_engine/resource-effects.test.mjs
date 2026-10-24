import test from 'node:test';
import assert from 'node:assert/strict';
import {effectValue,collectEffects,stackEffects,applyAcquisitionEffects,convertIncomingDamage} from './resource-effects.mjs';
test('Shared numeric expressions read data and apply explicit rounding',()=>{
 const formula={op:'floor',args:[{op:'div',args:[{op:'add',args:[{state:'attributes.智力'},{state:'attributes.感知'}]},4]}]};
 assert.equal(effectValue(formula,{attributes:{智力:7,感知:6}}),3);
});
test('New resource definitions use common conditions and stacking without resource-specific code',()=>{
 const definitions={one:{effects:[{stat:'attack',value:3,group:'training'}]},two:{effects:[{stat:'attack',value:5,group:'training'},{stat:'attack',value:2,stacking:'add',when:{test:'eq',left:{context:'targetType'},right:'object'}}]}};
 const s={learnedResources:{one:{learned:true},two:{learned:true}}};
 assert.equal(stackEffects(collectEffects(s,definitions,'attack',{targetType:'object'})).value,7);
 assert.equal(stackEffects(collectEffects(s,definitions,'attack',{targetType:'creature'})).value,5);
 assert.equal(stackEffects(collectEffects(s,definitions,'attack',{}),{training:6}).value,0);
 delete s.learnedResources.two;assert.equal(stackEffects(collectEffects(s,definitions,'attack',{})).value,3);
});
test('Acquisition effect raises pool capacity without restoring current energy',()=>{
 const s={resources:{mana:{current:2,max:5}}};applyAcquisitionEffects(s,[{type:'poolCapacity',value:5}],{pool:'mana'});
 assert.deepEqual(s.resources.mana,{current:2,max:10});
});
test('Incoming conversion shares a finite counter and excludes specified types',()=>{
 const s={counter:{current:0,max:2}},p={counter:'counter',severities:['B','L'],excludedEnergy:['mental','poison']};
 assert.equal(convertIncomingDamage(s,{amount:3,severity:'L',energyType:'mental'},p,2).converted,0);
 assert.equal(convertIncomingDamage(s,{amount:3,severity:'L'},p,2).damage.amount,1);
 assert.equal(convertIncomingDamage(s,{amount:3,severity:'B'},p,2).converted,0);
});
