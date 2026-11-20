import {RESOURCE_DEFINITIONS} from '../resource-definitions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {createOpeningEncounter} from './opening.mjs';
import {createDuel} from './catalog.mjs';
import {attackProfile,act} from './engine.mjs';
import {inspectCommands,createCombatRuntime} from './runtime.mjs';
import {adoptThunderTechnique,THUNDER_ADAPTED,thunderTerms} from './thunder-technique.mjs';
import {resolveContributions} from '../resource-effects.mjs';
const dice=()=>Array(1024).fill(8);
const command={actorId:'huang',abilityId:'thunder',targetId:'player'};
function fixture(){
 const b=createOpeningEncounter({id:'synthetic.thunder',participants:['huang','player'],positions:{huang:[0,0],player:[1,0]},teams:{huang:'opponent',player:'party'}});
 b.activeId='huang';b.reactionWindows=false;b.playerDefenseDeclarations=false;
 const a=b.actors.huang;a.sheathed=false;a.controller='player';a.state.turn={phase:'active',standard:1,move:1,swift:1};
 a.state.resources.灵力.current=3;a.state.xp=7;
 return b;
}
test('trusted adoption retains the actor and requires existing ownership and exact source version',async()=>{
 const b=fixture(),before=structuredClone(b.actors.huang),a=adoptThunderTechnique(before);
 assert.deepEqual(before,b.actors.huang);const {techniqueBindings,...rest}=a;assert.deepEqual(rest,before);
 assert.deepEqual(techniqueBindings.thunder,THUNDER_ADAPTED);
 assert.throws(()=>adoptThunderTechnique({...before,abilities:before.abilities.filter(x=>x!=='thunder')}));
 assert.throws(()=>thunderTerms({...a,techniqueBindings:{thunder:{...THUNDER_ADAPTED,version:'unknown'}}}));
 const source=await readFile(new URL('../../../../901-resource-authoring-kit/outputs/同伴RE资源调整/黄泉.md',import.meta.url));
 assert.equal(createHash('sha256').update(source).digest('hex'),THUNDER_ADAPTED.readingHash);
});
test('opening and later actor profiles replace one thunder contribution without importing other benefits',()=>{
 for(const b of [fixture(),createDuel()]){
  const a=b.actors.huang;a.sheathed=false;delete a.buffs.drawnRound;
  const targetId=Object.keys(b.actors).find(id=>id!=='huang'),c={...command,targetId};
  const base=attackProfile(b,'huang',{targetId}),old=attackProfile(b,'huang',c),saved=structuredClone(a);
  b.actors.huang=adoptThunderTechnique(a);const next=attackProfile(b,'huang',c);
  assert.equal(next.dp,base.dp+15);assert.equal(old.dp,base.dp+(a.ruleset==='opening-20261022'?4:15));
  assert.equal(next.electric,0.5);assert.equal(next.electricMode,'fraction');
  for(const k of ['cap','weapon','ap','magic','fixed','ignore','aggravate'])assert.equal(next[k],old[k],k);
  assert.deepEqual(attackProfile(b,'huang',{targetId}),base);assert.deepEqual(b.actors.huang.state,saved.state);
  const rows=thunderTerms(b.actors.huang).contributions,r=resolveContributions(rows);
  assert.equal(r.rows.length,1);assert.equal(r.replacedSources.length,1);assert.equal(r.rows[0].value,15);
 }
});
test('adapted enhancement competes with the same bonus group and does not affect normal attacks',()=>{
 const b=fixture(),base=attackProfile(b,'huang',{targetId:'player'}).dp;b.actors.huang=adoptThunderTechnique(b.actors.huang);
 b.actors.huang.state.activeResourceEffects=[{id:'synthetic.enhancement',sourceId:'synthetic.other',remainingRounds:2,effects:[{stat:'attack',group:'enhancement',value:20}]}];
 assert.equal(attackProfile(b,'huang',command).dp,base+20);
 assert.equal(attackProfile(b,'huang',{targetId:'player'}).dp,base+20);
});
test('old attack chain pays once, splits at most half, and bases paralysis only on actual electrical damage',()=>{
 const b=fixture();b.actors.huang=adoptThunderTechnique(b.actors.huang);const before=structuredClone(b);
 const {battle,result}=act(b,command,{drawDice:dice,playerAuthorized:true});
 assert.deepEqual(b,before);assert.equal(battle.actors.huang.state.resources.灵力.current,2);assert.equal(battle.actors.huang.state.xp,7);
 assert.equal(result.receipt.resources[0].quantity,1);assert.equal(battle.actors.huang.cooldowns.thunder,b.round+1);
 const segments=result.damageEvents[0].originalSegments;
 assert.equal(segments.reduce((n,s)=>n+s.amount,0),result.attack.amount);
 assert.equal(segments.filter(s=>s.energyType==='electric').reduce((n,s)=>n+s.amount,0),Math.floor(result.attack.amount/2));
 const electrical=result.damage.filter(s=>s.energyType==='electric').reduce((n,s)=>n+s.actualDamage,0);
 assert.equal(result.statuses.find(s=>s.type==='麻痹')?.points??0,electrical);
 const none=act(b,{...command,electricFraction:0},{drawDice:dice,playerAuthorized:true});assert.equal(none.result.statuses.length,0);
 assert.equal(none.result.damage.some(s=>s.energyType==='electric'&&s.actualDamage>0),false);
 const guarded=structuredClone(b);guarded.actors.player.combatProfile.equipment.armor.defenseExtra=100;
  const protectedTarget=structuredClone(b);protectedTarget.actors.player.combatProfile.equipment.armor.energyResistance=100;
  const resisted=act(protectedTarget,command,{drawDice:dice,playerAuthorized:true});assert.equal(resisted.result.statuses.length,0);
  const miss=act(guarded,command,{drawDice:()=>Array(1024).fill(1),playerAuthorized:true});assert.equal(miss.result.damage.length,0);assert.equal(miss.result.statuses.length,0);
 assert.throws(()=>act(battle,command,{drawDice:dice,playerAuthorized:true}),/冷却/);
});
test('missing skill, unauthorized actor, wrong weapon and invented evolution or conversion fail without changing state',()=>{
 const b=fixture();b.actors.huang=adoptThunderTechnique(b.actors.huang);const before=structuredClone(b);
 assert.throws(()=>act(b,command,{drawDice:dice}));
 for(const extra of [{tier:2},{electricFraction:1},{electricFraction:-0.1},{techniqueBindings:{thunder:THUNDER_ADAPTED}}])assert.throws(()=>act(b,{...command,...extra},{drawDice:dice,playerAuthorized:true}));
 assert.deepEqual(b,before);
 const unowned=structuredClone(b);unowned.actors.huang.abilities=unowned.actors.huang.abilities.filter(x=>x!=='thunder');assert.throws(()=>act(unowned,command,{drawDice:dice,playerAuthorized:true}));
 const wrong=structuredClone(b);wrong.actors.huang.equipment={weapon:{instanceId:'synthetic.club',type:'melee',skill:'白刃',sub:'短棍',damage:4},armor:{defense:3}};assert.throws(()=>act(wrong,command,{drawDice:dice,playerAuthorized:true}));
 const broke=structuredClone(b);broke.actors.huang.state.resources.灵力.current=0;assert.throws(()=>act(broke,command,{drawDice:dice,playerAuthorized:true}));assert.equal(broke.actors.huang.state.resources.灵力.current,0);
});
test('old legal option discovery offers the adopted technique and an explicit no-conversion choice',()=>{
 const b=fixture();b.actors.huang=adoptThunderTechnique(b.actors.huang);
 const choices=inspectCommands(b).options.filter(o=>o.command.abilityId==='thunder'&&!o.command.payment);
 assert.ok(choices.some(o=>o.command.electricFraction===0));assert.ok(choices.some(o=>o.command.electricFraction===undefined));
 assert.ok(choices.every(o=>o.preview.energy.灵力===1));
});
test('old leave/enter carry retains adopted clauses and current pools without granting template skills',async()=>{
 const b=fixture();b.actors.huang=adoptThunderTechnique(b.actors.huang);b.status='finished';
 let data={stat_data:{story:{location:'合成剧情位置'}}};
 const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async x=>{data=structuredClone(x);}};
 const runtime=createCombatRuntime({mvu,getAnchor:()=>({chatId:'synthetic',messageId:0,swipeId:0}),expectedChatId:'synthetic',drawDice:dice});
 await runtime.initialize(b);await runtime.leave({operationId:'leave',expectedRevision:0});
 assert.deepEqual(data.stat_data['901_rules_poc'].actors.huang.combatCarry.techniqueBindings,b.actors.huang.techniqueBindings);
 await runtime.enter({operationId:'enter',expectedRevision:1,battle:fixture()});
 const a=runtime.read().battle.actors.huang;assert.deepEqual(a.techniqueBindings,b.actors.huang.techniqueBindings);
 assert.equal(a.state.resources.灵力.current,3);assert.equal(a.state.xp,7);assert.deepEqual(a.abilities,b.actors.huang.abilities);
 assert.deepEqual(data.stat_data.story,{location:'合成剧情位置'});
});

test('runtime uses the same compiled clauses and never silently fills missing adapted values',()=>{
 const d=RESOURCE_DEFINITIONS['huang.thunder_sword'],original=structuredClone(d),b=fixture();
 assert.equal(THUNDER_ADAPTED.version,d.contractVersion);assert.equal(THUNDER_ADAPTED.readingHash,d.reading.sha256);
 try {
  d.technique.effects[0].params.attackDP=17;d.technique.effects[0].params.maxElectricFraction=0.25;d.technique.cost.amount=2;d.technique.cooldownRounds=3;
  const a=adoptThunderTechnique(b.actors.huang),terms=thunderTerms(a);
  assert.equal(terms.contributions.at(-1).value,17);assert.equal(terms.electric,0.25);assert.equal(terms.cost.amount,2);assert.equal(terms.cooldownRounds,3);
  delete d.technique;assert.throws(()=>thunderTerms(a));
 } finally {Object.assign(d,original);}
});
