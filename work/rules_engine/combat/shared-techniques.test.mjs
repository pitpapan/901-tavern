import test from 'node:test';
import assert from 'node:assert/strict';
import * as clauses from './thunder-technique.mjs';
import {RESOURCE_DEFINITIONS} from '../resource-definitions.mjs';
import {createOpeningEncounter} from './opening.mjs';
import {createDuel} from './catalog.mjs';
import {act,attackProfile,galeTargets,resolveDefense,currentContext} from './engine.mjs';
import {derived} from './mechanics.mjs';
import {resolveContributions} from '../resource-effects.mjs';
import {inspectCommands,createCombatRuntime,decisionContext} from './runtime.mjs';
const dice=()=>Array(1024).fill(8);
function fixture(active='huang'){
 const b=createOpeningEncounter({id:'synthetic.shared-techniques',participants:['huang','player','jiang'],positions:{huang:[0,0],player:[1,0],jiang:[2,0]},teams:{huang:'foe',player:'party',jiang:'foe'}});
 b.activeId=active;b.reactionWindows=false;b.playerDefenseDeclarations=false;
 for(const a of Object.values(b.actors)){a.controller='player';a.state.turn={phase:'active',standard:1,move:1,swift:1};a.sheathed=false;}
 return b;
}
const evidence=(a,key)=>({sourceRef:'synthetic.explicit-owned-and-qualified',weaponRef:'legacy-weapon/'+a.id,
 ...(key==='cleaveRock'?{hands:2}:key==='iai'?{quickDraw:true,bladeQualification:true,twoHandKatanaTraining:true,wearing:true,legacyInitiativeContribution:a.ruleset==='opening-20261022'?0:4}:{resourcePools:a.ruleset==='opening-20261022'?['流风']:['风池','魔力']})});
function adopt(b,id,key){const a=b.actors[id];b.actors[id]=clauses.adoptWeaponTechnique(a,key,evidence(a,key));return b;}
test('adoption is a pure binding, not an acquisition, reset or later-template switch',()=>{
 for(const [id,key]of [['huang','cleaveRock'],['huang','iai'],['player','kuanglan']]){
  const b=fixture(),before=structuredClone(b.actors[id]);adopt(b,id,key);
  const {techniqueBindings,...rest}=b.actors[id];assert.deepEqual(rest,before);assert.ok(techniqueBindings[key]);
  assert.throws(()=>clauses.adoptWeaponTechnique({...before,abilities:[]},key,evidence(before,key)));
  assert.throws(()=>clauses.adoptWeaponTechnique(before,key,{}));
 }
});
test('rock replaces its opening and later clauses and leaves unrelated attack values alone',()=>{
 for(const b of [fixture(),createDuel()]){
  const a=b.actors.huang;a.sheathed=false;delete a.buffs.drawnRound;
  const targetId=Object.keys(b.actors).find(x=>x!=='huang'),c={abilityId:'cleaveRock',targetId};
  const base=attackProfile(b,'huang',{targetId});adopt(b,'huang','cleaveRock');const p=attackProfile(b,'huang',c);
  assert.equal(p.weapon,base.weapon+2);assert.equal(p.cap,base.cap+2);assert.equal(p.dp,base.dp+2);
  assert.equal(p.ap,Math.max(base.ap,16));assert.equal(p.ignore,4);assert.equal(p.magic,base.magic);
  assert.deepEqual(attackProfile(b,'huang',{targetId}),base);
  const r=resolveContributions(clauses.rockTerms(b.actors.huang).contributions);
  assert.ok(r.replacedSources.length);assert.ok(r.rows.every(x=>x.origin==='definition'));
 }
});
test('rock keeps old payment/cooldown, rejects unsupported evolution and actual one-hand grip',()=>{
 const b=adopt(fixture(),'huang','cleaveRock'),c={actorId:'huang',abilityId:'cleaveRock',targetId:'player'},before=structuredClone(b);
 const out=act(b,c,{drawDice:dice,playerAuthorized:true});assert.equal(out.battle.actors.huang.state.resources.灵力.current,4);assert.equal(out.battle.actors.huang.cooldowns.cleaveRock,2);
 assert.equal(out.result.receipt.resources[0].quantity,1);assert.deepEqual(b,before);
 assert.throws(()=>act(b,c,{drawDice:dice}));assert.throws(()=>act(b,{...c,tier:2},{drawDice:dice,playerAuthorized:true}));
 b.actors.huang.equipment={weapon:{instanceId:'actual.sword',type:'melee',skill:'白刃',sub:'太刀',hands:2,grip:{hands:1,source:'test'},damage:4},armor:{defense:3}};
 assert.throws(()=>act(b,c,{drawDice:dice,playerAuthorized:true}));
});
test('iai replaces first-strike bonus, applies to thunder once, and never adds a second move bonus',()=>{
 const b=adopt(fixture(),'huang','iai'),a=b.actors.huang;a.sheathed=true;
 b.actors.huang=clauses.adoptThunderTechnique(a);
 const initial=derived(a).initiative;assert.equal(initial,a.state.attributes.敏捷+a.state.attributes.风度+a.combatProfile.initiative+4);
 const drawn=act(b,{actorId:'huang',abilityId:'draw'},{drawDice:dice,playerAuthorized:true}).battle;
 const normal=attackProfile(b,'huang',{targetId:'player'}),p=attackProfile(drawn,'huang',{abilityId:'thunder',targetId:'player'});
 assert.equal(p.dp,normal.dp+3+15);assert.equal(p.extra,0);assert.equal(p.aggravate,2);
 drawn.actors.huang.state.activeResourceEffects=[{id:'synthetic.move',sourceId:'other',remainingRounds:2,effects:[{stat:'attack',group:'technique',value:5}]}];
 assert.equal(attackProfile(drawn,'huang',{targetId:'player'}).dp,normal.dp+5);
 const out=act(drawn,{actorId:'huang',abilityId:'thunder',targetId:'player'},{drawDice:dice,playerAuthorized:true});
 assert.equal(out.battle.actors.huang.buffs.drawUsed,true);assert.equal(out.battle.actors.huang.buffs.iaiPenalty,2);
 assert.equal(attackProfile(out.battle,'huang',{targetId:'player'}).dp,normal.dp+5);
});
test('iai requires recorded qualifications, does not buff an unrelated weapon and expires on next own turn',()=>{
 const b=fixture(),a=b.actors.huang;
 const bad=evidence(a,'iai');delete bad.quickDraw;assert.throws(()=>clauses.adoptWeaponTechnique(a,'iai',bad));
 adopt(b,'huang','iai');b.actors.huang.buffs.iaiPenalty=2;b.actors.huang.buffs.drawnRound=b.round;
 let x=b;for(let i=0;i<4;i++){x=act(x,{actorId:x.activeId,abilityId:'end'},{drawDice:dice,playerAuthorized:true}).battle;if(x.activeId==='huang')break;}
 assert.equal(x.activeId,'huang');assert.equal(x.actors.huang.buffs.iaiPenalty,undefined);assert.equal(x.actors.huang.buffs.drawnRound,undefined);
 const baseline=derived(a).initiative;
 b.actors.huang.equipment={weapon:{instanceId:'other.club',type:'melee',skill:'白刃',sub:'短棍',damage:2},armor:{defense:3}};
 assert.equal(derived(b.actors.huang).initiative,baseline);
});
test('gale and tornado use their own shared clauses, one payment and original eligibility filtering',()=>{
 const b=adopt(fixture('player'),'player','kuanglan');b.actors.huang.state.health={...b.actors.huang.state.health,intact:100};
 const base=attackProfile(b,'player',{targetId:'huang'}),g=attackProfile(b,'player',{abilityId:'gale',targetId:'huang'}),t=attackProfile(b,'player',{abilityId:'tornado',targetId:'huang'});
 assert.equal(g.dp,base.dp+3);assert.equal(g.reduction,3);assert.equal(t.dp,base.dp);assert.equal(t.reduction,8);assert.equal(g.range,20);
 assert.deepEqual(galeTargets(b,{actorId:'player'}).map(a=>a.id).sort(),['huang','jiang']);
 const out=act(b,{actorId:'player',abilityId:'gale'},{drawDice:dice,playerAuthorized:true});assert.equal(out.battle.actors.player.state.resources.流风.current,21);
 assert.equal(out.result.receipt.resources.filter(r=>r.name==='流风').reduce((n,r)=>n+r.quantity,0),1);
 assert.throws(()=>act(b,{actorId:'player',abilityId:'gale',resource:'灵力'},{drawDice:dice,playerAuthorized:true}));
});
test('shared definition mutations drive consumers; missing or stale source never falls back',()=>{
 for(const [key,id,actorId,field,next]of [['cleaveRock','huang.rock_cleaver','huang','armorPenetration',19],['iai','huang.iai','huang','attackDP',5],['kuanglan','kuanglan','player','defenseReduction',4]]){
  const d=RESOURCE_DEFINITIONS[id],before=structuredClone(d),b=fixture(actorId);
  try{d.technique.effects[0].params[field]=next;adopt(b,actorId,key);
   const a=b.actors[actorId];a.buffs.drawnRound=b.round;
   const p=attackProfile(b,actorId,{abilityId:key==='iai'?'strike':key==='kuanglan'?'gale':key,targetId:actorId==='huang'?'player':'huang'});
   assert.equal(key==='cleaveRock'?p.ap:key==='kuanglan'?p.reduction:p.techniqueContributions.find(r=>r.origin==='definition'&&r.stat==='attack').value,next);
   delete d.technique;assert.throws(()=>attackProfile(b,actorId,{abilityId:key==='iai'?'strike':key==='kuanglan'?'gale':key,targetId:actorId==='huang'?'player':'huang'}));
  }finally{Object.assign(d,before);}
 }
});
test('bindings survive the existing leave/enter save path without granting skills or refreshing pools',async()=>{
 const b=adopt(adopt(adopt(fixture(),'huang','cleaveRock'),'huang','iai'),'player','kuanglan');b.status='finished';b.actors.player.state.resources.流风.current=7;
 let data={stat_data:{story:{place:'unchanged'}}};const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async x=>{data=structuredClone(x);}};
 const runtime=createCombatRuntime({mvu,getAnchor:()=>({chatId:'synthetic',messageId:0,swipeId:0}),expectedChatId:'synthetic',drawDice:dice});
 await runtime.initialize(b);await runtime.leave({operationId:'leave',expectedRevision:0});await runtime.enter({operationId:'enter',expectedRevision:1,battle:fixture()});
 for(const id of ['huang','player'])assert.deepEqual(runtime.read().battle.actors[id].techniqueBindings,b.actors[id].techniqueBindings);
 assert.equal(runtime.read().battle.actors.player.state.resources.流风.current,7);assert.deepEqual(data.stat_data.story,{place:'unchanged'});
});

test('gale reduction category is determined by its mode rather than the numeric amount',()=>{
 const d=RESOURCE_DEFINITIONS.kuanglan,before=structuredClone(d);
 try{
  for(const e of d.technique.effects)e.params.defenseReduction=100;
  const b=adopt(fixture('player'),'player','kuanglan');
  const defense=mode=>resolveDefense(b,'huang','player',{...attackProfile(b,'player',{abilityId:mode,targetId:'huang'}),ap:0,magic:0});
  assert.ok(defense('gale').parts.armor>0);assert.equal(defense('tornado').parts.armor,0);
 }finally{Object.assign(d,before);}
});
test('existing option and context projections use shared values and offer every bound energy choice',()=>{
 const b=adopt(fixture(),'huang','cleaveRock');
 assert.match(currentContext(b).abilities.cleaveRock.text,/16/);assert.doesNotMatch(currentContext(b).abilities.cleaveRock.text,/破甲＋4/);
 const view=decisionContext(b,0,inspectCommands(b));assert.match(view.abilities.cleaveRock.text,/16/);
 const g=fixture('player');g.actors.player.state.resources.合用测试池={current:3,max:3};
 const e=evidence(g.actors.player,'kuanglan');e.resourcePools.push('合用测试池');
 g.actors.player=clauses.adoptWeaponTechnique(g.actors.player,'kuanglan',e);
 const choices=inspectCommands(g).options.filter(o=>o.command.abilityId==='gale');
 assert.ok(choices.some(o=>o.command.resource==='合用测试池'));
});
test('later iai replaces its attributed initiative and competes with the existing training group',()=>{
 const b=createDuel(),a=b.actors.huang,before=derived(a).initiative;
 adopt(b,'huang','iai');assert.equal(derived(b.actors.huang).initiative,before);
 b.actors.huang.state.activeResourceEffects=[{id:'synthetic.ini',sourceId:'other',remainingRounds:2,effects:[{stat:'initiative',group:'training',value:6}]}];
 assert.equal(derived(b.actors.huang).initiative,before+2);
});

test('iai aggravates only L damage and preserves existing legal wielding penalties',()=>{
 const b=fixture(),a=b.actors.huang;
 a.equipment={weapon:{instanceId:'synthetic.katana',type:'melee',skill:'白刃',sub:'太刀',hands:2,grip:{hands:2,source:'synthetic.held'},strengthRequirement:5,damage:4,severity:'B',attackBonus:2,ap:0,magic:0},armor:{defense:3}};
 const e={...evidence(a,'iai'),weaponRef:'synthetic.katana'};
 b.actors.huang=clauses.adoptWeaponTechnique(a,'iai',e);b.actors.huang.buffs.drawnRound=b.round;
 const c={actorId:'huang',abilityId:'strike',targetId:'player'},p=attackProfile(b,'huang',c),out=act(b,c,{drawDice:dice,playerAuthorized:true});
 assert.equal(p.aggravate,0);assert.equal(out.result.damage.filter(d=>d.severity==='A').length,0);assert.equal(out.battle.actors.huang.buffs.drawUsed,true);
 // PHB's existing handling consumer allows a deficit with -2DP per point;
 // sharing technique clauses must not invent a new weapon prohibition.
 const normal=p.dp;b.actors.huang.equipment.weapon.strengthRequirement=7;
 assert.equal(attackProfile(b,'huang',c).dp,normal-4);
 b.actors.huang.equipment.weapon.grip.source='';assert.throws(()=>derived(b.actors.huang));
});
test('each adapted action replays its old MVU operation without another roll or payment',async()=>{
 for(const [actorId,key,command]of [['huang','cleaveRock',{abilityId:'cleaveRock',targetId:'player'}],['huang','iai',{abilityId:'draw'}],['player','kuanglan',{abilityId:'gale'}]]){
  const b=adopt(fixture(actorId),actorId,key);if(key==='iai')b.actors.huang.sheathed=true;
  let data={stat_data:{story:'unchanged'}},rolls=0;const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async x=>{data=structuredClone(x);}};
  const config={mvu,getAnchor:()=>({chatId:'synthetic',messageId:0,swipeId:0}),expectedChatId:'synthetic',drawDice:()=>{rolls++;return dice();}},r=createCombatRuntime(config);
  await r.initialize(b);const request={operationId:'once',expectedRevision:0,command:{actorId,...command},playerAuthorized:true};await r.dispatch(request);
  const saved=structuredClone(data),n=rolls;await createCombatRuntime(config).dispatch(request);assert.deepEqual(data,saved);assert.equal(rolls,n);
  const bad=structuredClone(b);bad.actors[actorId].techniqueBindings[key].version='stale';
  assert.throws(()=>act(bad,{actorId,...command},{drawDice:dice,playerAuthorized:true}));
  assert.throws(()=>act(b,{actorId,...command,techniqueBindings:{}},{drawDice:dice,playerAuthorized:true}));
 }
});
