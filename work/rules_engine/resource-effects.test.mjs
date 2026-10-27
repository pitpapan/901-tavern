import test from 'node:test';
import assert from 'node:assert/strict';
import {effectValue,effectMatches,collectEffects,stackEffects,applyAcquisitionEffects,convertIncomingDamage} from './resource-effects.mjs';
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
test('unrelated effect queries do not require the grade of a latent legacy immunity source',()=>{
 const state={resourceCapabilities:{old:{id:'mindImmunity',source:'legacy-record'}},activeResourceEffects:[
  {sourceId:'spell',applicability:{families:['mind'],grade:'D'},effects:[{stat:'spellPower',value:-2}]}
 ]};
 assert.deepEqual(collectEffects(state,{},'attack'),[]);
 assert.throws(()=>collectEffects(state,{},'spellPower'),{code:'NEEDS_INPUT'});
});

test('shared arithmetic rejects ignored operands and empty extrema instead of producing a silent result',()=>{
 assert.throws(()=>effectValue({op:'sub',args:[10,2,3]},{}),{code:'INVALID_RULE_EXPRESSION'});
 assert.throws(()=>effectValue({op:'floor',args:[1,2]},{}),{code:'INVALID_RULE_EXPRESSION'});
 assert.throws(()=>effectValue({op:'min',args:[]},{}),{code:'INVALID_RULE_EXPRESSION'});
 assert.equal(effectValue({op:'add',args:[]},{}),0);
 assert.equal(effectValue({op:'mul',args:[{context:'paid'},2]}, {},{paid:3}),6);
});

test('explicit false conditions stay false in nested rule expressions',()=>{
 assert.equal(effectMatches(false,{}),false);
 assert.equal(effectMatches({not:false},{}),true);
 assert.equal(effectMatches({all:[true,false]},{}),false);
 assert.equal(effectMatches(undefined,{}),true);
});

test('source and clause identity retires only the matching legacy contribution, before game stacking',()=>{
 const identity={sourceInstanceId:'actual-acquisition',clauseId:'defense',consumer:'initiativeDefense'};
 const rows=[{source:'old-card',origin:'legacy',stat:'initiativeDefense',value:9,stacking:'add',contribution:identity},
  {source:'new-resource',origin:'definition',stat:'initiativeDefense',value:5,stacking:'add',contribution:identity},
  {source:'other-source',origin:'active',stat:'initiativeDefense',value:2,stacking:'add',contribution:{...identity,sourceInstanceId:'other-acquisition'}},
  {source:'other-clause',origin:'legacy',stat:'initiativeDefense',value:1,stacking:'add',contribution:{...identity,clauseId:'other'}}];
 const out=stackEffects(rows);assert.equal(out.value,8);assert.equal(out.replacedSources.length,1);
 assert.equal(out.replacedSources[0].source,'old-card');
 assert.equal(stackEffects(rows.filter(x=>x.source!=='new-resource')).value,12);
});
test('different actual items keep separate contributions even when their definition and clause match',()=>{
 const shared={source:'same-definition',stat:'attack',value:2,stacking:'add',origin:'item',contribution:{sourceInstanceId:'same-definition',clauseId:'speed',consumer:'attack'}};
 assert.equal(stackEffects([{...shared,contribution:{...shared.contribution,itemId:'blade-a'}},{...shared,contribution:{...shared.contribution,itemId:'blade-b'}}]).value,4);
});
