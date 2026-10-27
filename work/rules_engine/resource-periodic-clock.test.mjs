import test from 'node:test';
import assert from 'node:assert/strict';
import {installPeriodicRate,periodicDamageTick} from './resource-periodic-clock.mjs';
function fixture(){const state={resourceCapabilities:{}},source={casterId:'caster',periodicClocks:{}};const root={id:'battle',round:4,actors:{caster:{state:{}},target:{state}}};return {state,source,root};}
function activate(x){const cap={id:'periodicDamageRate',source:'time',grade:'C',power:6,periodicDamage:{multiplier:2,sourceImmunityFamily:'time'},scene:true};installPeriodicRate(x.state,cap,{root:x.root,combat:true});x.state.resourceCapabilities.time=cap;return cap;}
test('Q24 starts the whole activation round at zero, without fractional progress or an immediate tick',()=>{
 const x=fixture();x.source.periodicClocks.damage={progress:.9,lastRound:3,battleId:'battle'};activate(x);
 assert.equal(periodicDamageTick(x.state,x.source,{root:x.root,combat:true,key:'damage'}).due,false);
 x.root.round=5;assert.equal(periodicDamageTick(x.state,x.source,{root:x.root,combat:true,key:'damage'}).due,false);
 const saved=JSON.parse(JSON.stringify(x));saved.root.actors.target.state=saved.state;saved.root.round=6;
 assert.equal(periodicDamageTick(saved.state,saved.source,{root:saved.root,combat:true,key:'damage'}).due,true);
 assert.equal(periodicDamageTick(saved.state,saved.source,{root:saved.root,combat:true,key:'damage'}).due,false);
});
test('Q25 removing slowdown preserves the fraction without an immediate settlement or persistent damage debt',()=>{
 const x=fixture();activate(x);x.root.round=5;
 assert.equal(periodicDamageTick(x.state,x.source,{root:x.root,combat:true,key:'damage'}).progress,.5);
 delete x.state.resourceCapabilities.time;
 assert.equal(periodicDamageTick(x.state,x.source,{root:x.root,combat:true,key:'damage'}).due,false);
 x.root.round=6;const tick=periodicDamageTick(x.state,x.source,{root:x.root,combat:true,key:'damage'});assert.equal(tick.due,true);assert.equal(tick.progress,.5);
 assert.equal(x.state.pendingDamage,undefined);
});
test('actual damage-source time immunity bypasses slowdown; target immunity is not substituted for it',()=>{
 const x=fixture();activate(x);x.root.actors.caster.state.resourceCapabilities={immune:{id:'timeImmunity',comparison:{mode:'up-to',maximumGrade:'C',inclusive:true},source:'actual-source'}};
 assert.equal(periodicDamageTick(x.state,x.source,{root:x.root,combat:true,key:'damage'}).due,true);
 delete x.root.actors.caster;assert.throws(()=>periodicDamageTick(x.state,x.source,{root:x.root,combat:true,key:'other'}),/来源/);
});

test('burning keeps source identity and natural decay while damage follows the slowed round clock',async()=>{
 const {createOpeningRoster}=await import('./combat/opening.mjs');const {burningDamage}=await import('./status-rules.mjs');const {advanceTime}=await import('./recovery.mjs');
 const actors=createOpeningRoster(),root={id:'round-combat',round:4,actors},a=actors.player;
 a.state.statuses=[{type:'燃烧',source:'actual fire',sourceActorId:'huang',fireKind:'natural',points:5,decayPerRound:1}];
 const cap={id:'periodicDamageRate',source:'clock',grade:'C',power:6,periodicDamage:{multiplier:2,sourceImmunityFamily:'time'},scene:true};installPeriodicRate(a.state,cap,{root,combat:true});(a.state.resourceCapabilities??={}).slow=cap;
 const hits=[],resolve=(points,source)=>hits.push({points,source:source.sourceActorId});
 burningDamage(a,'turn',resolve,{root,combat:true});assert.deepEqual(hits,[]);
 advanceTime(a,.1,[],{root,combatTick:true});root.round=5;assert.equal(a.state.statuses[0].points,4);
 burningDamage(a,'turn',resolve,{root,combat:true});assert.deepEqual(hits,[{points:4,source:'huang'}]);
 advanceTime(a,.1,[],{root,combatTick:true});root.round=6;burningDamage(a,'turn',resolve,{root,combat:true});assert.deepEqual(hits,[{points:4,source:'huang'}]);
});

test('turn-end damage counts the activation round once while turn-start damage uses its opening boundary',()=>{
 const x=fixture();activate(x);
 const first=periodicDamageTick(x.state,x.source,{root:x.root,combat:true,key:'end',boundary:'turnEnd'});assert.equal(first.progress,.5);assert.equal(first.due,false);
 assert.equal(periodicDamageTick(x.state,x.source,{root:x.root,combat:true,key:'end',boundary:'turnEnd'}).due,false);
 x.root.round=5;assert.equal(periodicDamageTick(x.state,x.source,{root:x.root,combat:true,key:'end',boundary:'turnEnd'}).due,true);
});

test('resuming an older covered rate preserves progress instead of treating it as a new activation',()=>{
 const x=fixture(),older=activate(x);x.root.round=5;
 assert.equal(periodicDamageTick(x.state,x.source,{root:x.root,combat:true}).progress,.5);
 const stronger={...structuredClone(older),power:6};installPeriodicRate(x.state,stronger,{root:x.root,combat:true});x.state.resourceCapabilities.stronger=stronger;
 periodicDamageTick(x.state,x.source,{root:x.root,combat:true});x.root.round=6;
 assert.equal(periodicDamageTick(x.state,x.source,{root:x.root,combat:true}).progress,.5);
 delete x.state.resourceCapabilities.stronger;
 assert.equal(periodicDamageTick(x.state,x.source,{root:x.root,combat:true}).progress,.5);
});
test('the adopted round-opening reset is limited to combat and preserves existing field progress',()=>{
 const x=fixture();delete x.root.round;x.source.periodicClocks.damage={progress:.75};
 const cap={id:'periodicDamageRate',source:'time',grade:'C',power:6,periodicDamage:{multiplier:2,sourceImmunityFamily:'time'}};installPeriodicRate(x.state,cap,{root:x.root});x.state.resourceCapabilities.time=cap;
 assert.equal(periodicDamageTick(x.state,x.source,{root:x.root,key:'damage',elapsedPeriods:0}).progress,.75);
});
