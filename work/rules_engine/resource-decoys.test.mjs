import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster,createOpeningEncounter} from './combat/opening.mjs';
import {beginTurn,endTurn} from './core.mjs';
import {refreshDerived} from './combat/mechanics.mjs';
import {act,damageEvent} from './combat/engine.mjs';
import {reduceRuleAction} from './gm_runtime/rule-actions.mjs';
import {RESOURCE_CATALOG} from './resource-catalog.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';
const dice=n=>()=>Array(512).fill(n),source='isolated/actual acquired resources';
function spell(name,grade='D'){
 const id=Object.values(RESOURCE_CATALOG).find(x=>x.name===name).id;assert.ok(RESOURCE_DEFINITIONS[id].programs?.cast,name+' program');
 const actors=createOpeningRoster(),state=actors.player.state;
 state.casting={imperial:{grade,pool:'test'}};state.resources.test={current:40,max:40};state.learnedResources={[id]:{learned:true,grade,source}};
 state.skills.神秘={level:3,subs:Object.fromEntries(RESOURCE_DEFINITIONS[id].subskills.map(k=>[k,{level:1}]))};
 const plan={source,targetIds:['player'],distance:1,effectLine:true,precise:true,components:{posture:true,language:true,focus:true}};
 return {id,plan,root:{actors,ruleScene:{objects:{spell:{source,type:'kitResource',resourceId:id,actorIds:['player'],plans:{use:plan}}}}},q:{kind:'rule',action:'mechanism',actorId:'player',objectId:'spell',operation:'cast',part:'use'}};
}
function cast(grade='D'){const x=spell('镜像',grade);return reduceRuleAction(x.root,x.q,{drawDice:dice(8)});}
const decoys=s=>s.activeResourceEffects.find(x=>x.decoys)?.decoys.members??[];
function battle(){const root=cast(),b=createOpeningEncounter({id:'decoys',participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.map={features:[]};b.actors.player.state=root.actors.player.state;b.actors.player.windSense=false;b.actors.huang.sheathed=false;b.activeId='huang';b.actors.huang.state=beginTurn(b.actors.huang.state).state;b.playerDefenseDeclarations=false;b.reactionWindows=false;b.actors.player.team='party';b.actors.huang.team='enemy';return b;}
test('mirror D/C cast installs independent sourced decoys without granting life, stats or T0 capabilities',()=>{
 for(const grade of ['D','C']){const x=spell('镜像',grade),before=structuredClone(x.root.actors.player.state),out=reduceRuleAction(x.root,x.q,{drawDice:dice(8)}),s=out.actors.player.state;
  assert.equal(decoys(s).length,grade==='D'?3:6);assert.ok(decoys(s).every(x=>x.remaining===(grade==='D'?6:12)));
  assert.deepEqual(s.health,before.health);assert.equal(s.resources.test.current,grade==='D'?39:37);assert.deepEqual(Object.keys(out.actors),Object.keys(x.root.actors));
  const loaded=JSON.parse(JSON.stringify(s));assert.deepEqual(decoys(loaded),decoys(s));expireResourceEffects(loaded,{scene:true});assert.equal(decoys(loaded).length,0);
 }
 assert.equal(createOpeningRoster().player.state.activeResourceEffects,undefined);
});
test('actual single weapon attack consumes one image and attack opportunity without wounds or retaliation',()=>{
 const b=battle(),before=structuredClone(b.actors.player.state.health);
 b.actors.huang.state.resourceTriggers={one:{sourceId:'actual next attack',casterId:'huang',event:'attackResolved',remaining:1,scene:true,steps:[],variables:{},grade:'D',rank:'D'}};
 let draws=0;const out=act(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:()=>{draws++;return Array(512).fill(2);}});
 assert.equal(decoys(out.battle.actors.player.state).length,2);assert.deepEqual(out.battle.actors.player.state.health,before);assert.equal(out.battle.actors.huang.state.turn.standard,0);
 assert.equal(out.battle.actors.huang.state.resourceTriggers.one,undefined);assert.equal(out.result.attack.decoy.redirected,true);assert.equal(out.result.damage.length,0);assert.equal(draws,1);
 assert.equal(out.battle.actors.player.state.resourceDiscoveries.huang.everLocated,true);
});
test('a real-body selection uses the normal attack and cannot refresh or share decoy HP',()=>{
 const b=battle();let draws=0;const out=act(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:()=>Array(512).fill(++draws===1?1:8)});
 assert.equal(out.result.attack.decoy.redirected,false);assert.equal(decoys(out.battle.actors.player.state).length,3);assert.ok(out.result.attack.roll);
});
test('area damage copies the post-defense result before real temporary life, while each decoy tracks its own remaining pool',()=>{
 const b=battle(),a=b.actors.player;a.state.health.temp=100;const before=structuredClone(a.state.health),r={damage:[]};
 damageEvent(a,[{amount:3,severity:'L',kind:'energy',energyType:'pure'}],false,r,{conversion:0},{root:b,targetId:'player',sourceActorId:'huang',damageNature:'fixed',targetMode:'area',drawDice:dice(8)});
 assert.ok(decoys(a.state).every(x=>x.remaining===3));assert.equal(a.state.health.intact,before.intact);assert.equal(a.state.health.temp,97);
 assert.equal(r.damageEvents.length,1);assert.equal(r.decoyDamage[0].amount,3);
 damageEvent(a,[{amount:3,severity:'L',kind:'energy',energyType:'pure'}],false,r,{conversion:0},{root:b,targetId:'player',sourceActorId:'huang',damageNature:'fixed',targetMode:'area',drawDice:dice(8)});
 assert.equal(decoys(a.state).length,0);assert.equal(r.damageEvents.length,2);
});
test('single spell attack shares the same redirection and never applies its burning effect to the real body',()=>{
 const x=spell('火球术（射弹）');x.root.actors.huang.state=cast().actors.player.state;x.plan.targetIds=['huang'];
 const before=structuredClone(x.root.actors.huang.state.health),out=reduceRuleAction(x.root,x.q,{drawDice:dice(2)});
 assert.equal(decoys(out.actors.huang.state).length,2);assert.deepEqual(out.actors.huang.state.health,before);assert.equal(out.actors.huang.state.statuses.length,0);
 assert.equal(out.actors.player.state.resources.test.current,39);assert.equal(out.result.targets[0].decoy.redirected,true);
});
test('corresponding visual detection grade and actual blind senses bypass visual decoys without a selection die',()=>{
 for(const mode of ['visual','blind']){
  const b=battle(),a=b.actors.huang;
  if(mode==='visual')a.senseSources={vision:{source:'actual visual detection',grade:'D',visual:true,sensitiveRange:20,vagueRange:30}};
  else a.state.resourceCapabilities={senses:{id:'actual-sensory',source:'actual acquisition',grade:'D',level:1,scene:true,sensory:{enhanceExisting:false,grants:[{id:'blind',minimumGrade:1,rangeBasis:'sensitive',maximumPrecision:'vague',automaticDetection:true,lineOfEffect:true,visualIllusionImmunity:true}]}}};
  let draws=0;const out=act(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:()=>{draws++;return Array(512).fill(2);}});
  assert.equal(decoys(out.battle.actors.player.state).length,3);assert.equal(out.result.attack.decoy,undefined);assert.equal(draws,1);
 }
});
test('post-defense area copying reuses one real additional-damage trigger without making image damage events',()=>{
 const b=battle(),a=b.actors.player;
 a.state.resourceTriggers={mark:{sourceId:'actual mark',casterId:'huang',event:'attackDamageCaused',scene:true,rank:'D',variables:{P:1},steps:[{op:'additionalDamage',amount:1,mode:'same-type'}]}};
 const r={damage:[]};damageEvent(a,[{amount:2,severity:'L',kind:'energy',energyType:'pure'}],false,r,{conversion:0},{root:b,targetId:a.id,sourceActorId:'huang',damageNature:'attack',targetMode:'multiple',drawDice:dice(8)});
 assert.equal(r.damageEvents.length,1);assert.equal(r.resourceTriggers.length,1);assert.ok(decoys(a.state).every(x=>x.remaining===3));assert.equal(r.decoyDamage[0].amount,3);
});
test('actual area spell uses the target spell-resistance result once for independent decoy pools',()=>{
 const x=spell('寒冷新星');x.root.actors.player.state.activeResourceEffects=cast().actors.player.state.activeResourceEffects;
 x.root.actors.player.state.activeResourceEffects.push({id:'resistance',sourceId:'actual defense',grade:'D',scene:true,effects:[{stat:'spellResistance',value:1,group:'spellResistance'}]});
 x.plan.targetIds=['player'];x.plan.areaComplete=true;
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice(1)}),receipt=out.result.targets[0];
 assert.equal(receipt.effectivePower,2);const amount=out.result.decoyDamage.reduce((n,x)=>n+x.amount,0);
 assert.ok(amount>0&&amount<=4);assert.ok(decoys(out.actors.player.state).every(x=>x.remaining===6-amount));
});
test('disbelief ends this illusion for that observer and survives losing the temporary detection source and reload',()=>{
 let b=battle();b.actors.huang.senseSources={vision:{source:'temporary actual sight',grade:'D',visual:true,sensitiveRange:20,vagueRange:30}};
 b=act(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:dice(2)}).battle;
 b=JSON.parse(JSON.stringify(b));delete b.actors.huang.senseSources;b.actors.huang.state=beginTurn(endTurn(b.actors.huang.state).state).state;
 let draws=0;const out=act(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:()=>{draws++;return Array(512).fill(2);}});
 assert.equal(decoys(out.battle.actors.player.state).length,3);assert.equal(draws,1);
});
test('MVU operation retry preserves the selected image and spent attack action without rerolling',async()=>{
 const {createCombatRuntime}=await import('./combat/runtime.mjs');let floor={},draws=0;
 const anchor={chatId:'decoy-save',messageId:0,swipeId:0};const rt=createCombatRuntime({mvu:{getMvuData:()=>structuredClone(floor),replaceMvuData:async v=>{floor=structuredClone(v);}},getAnchor:()=>anchor,expectedChatId:anchor.chatId,drawDice:()=>{draws++;return Array(512).fill(2);}});
 await rt.initialize(battle());const q={operationId:'mirror-hit/1',expectedRevision:rt.read().revision,command:{actorId:'huang',abilityId:'strike',targetId:'player'}};
 await rt.dispatch(q);const saved=JSON.stringify(floor),used=draws;assert.equal(decoys(rt.read().battle.actors.player.state).length,2);
 assert.equal((await rt.dispatch(q)).status,'already_applied');assert.equal(draws,used);assert.equal(JSON.stringify(floor),saved);
});
test('a reflected weapon attack resolves the new recipient decoy once and still consumes the original opportunity',()=>{
 const b=battle(),a=b.actors.huang,t=b.actors.player;
 a.state.activeResourceEffects=cast().actors.player.state.activeResourceEffects;t.state.activeResourceEffects=[];
 a.state.attributes={...a.state.attributes,敏捷:1,智力:1,感知:1,意志:1,风度:1};a.state.skills={射击:{level:0,subs:{}}};
 a.state.wizard={form:'fire',weaponDrawn:true,weaponMode:'gun',weaponSkills:{gun:{main:'射击'}}};
 t.state.wizard={form:'wind'};t.state.timedEffects={wizardDefend:{form:'wind',remainingMinutes:1}};
 a.state.resourceTriggers={one:{sourceId:'actual attack use',casterId:'huang',event:'attackResolved',remaining:1,scene:true,steps:[],variables:{},rank:'D'}};
 refreshDerived(a);const before=structuredClone(a.state.health),out=act(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:dice(2)});
 assert.equal(out.result.reflected.decoy.redirected,true);assert.deepEqual(out.battle.actors.huang.state.health,before);
 assert.equal(decoys(out.battle.actors.huang.state).length,2);assert.equal(out.battle.actors.huang.state.resourceTriggers.one,undefined);
});
test('actual molten armor retaliation stays untriggered when the original attack only removes an image',()=>{
 const x=spell('熔岩护甲','C'),guarded=reduceRuleAction(x.root,x.q,{drawDice:dice(8)}),b=battle();
 b.actors.player.state.resourceTriggers=guarded.actors.player.state.resourceTriggers;
 const before=structuredClone(b.actors.huang.state.health),out=act(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:dice(2)});
 assert.equal(out.result.attack.decoy.redirected,true);assert.deepEqual(out.battle.actors.huang.state.health,before);
 assert.ok(!out.result.resourceTriggers.some(row=>row.sourceId===x.id));
 assert.deepEqual(out.battle.actors.player.state.resourceTriggers,b.actors.player.state.resourceTriggers);
});
test('Q46 a no-attack-roll targeted spell damages the real body without a mirror draw or pool loss',()=>{
 const x=spell('魔法飞弹');x.plan.targetIds=['huang'];x.root.actors.huang.state.activeResourceEffects=cast().actors.player.state.activeResourceEffects;
 const before=structuredClone(x.root),images=structuredClone(decoys(x.root.actors.huang.state));let draws=0;
 const out=reduceRuleAction(x.root,x.q,{drawDice:()=>{draws++;return Array(512).fill(8);}});
 assert.equal(draws,0);assert.deepEqual(decoys(out.actors.huang.state),images);assert.ok(out.result.damage.some(x=>x.actualDamage>0));
 assert.equal(out.actors.player.state.resources.test.current,39);assert.deepEqual(x.root,before);
});
test('actual rapid fire uses multiple-target copying, never the single-target selection die',()=>{
 const b=battle(),a=b.actors.huang;
 a.state.wizard={form:'fire',weaponDrawn:true,weaponMode:'gun',weaponSkills:{gun:{main:'射击'}}};a.state.skills.射击={level:5,subs:{}};
 let draws=0;const out=act(b,{actorId:'huang',abilityId:'strike',targetId:'player',rapidFire:true},{drawDice:()=>{draws++;return Array(512).fill(8);}});
 assert.equal(out.result.attack.decoy,undefined);assert.equal(draws,1);
 const copied=out.result.decoyDamage.reduce((n,x)=>n+x.amount,0);assert.ok(copied>0);
 assert.ok(decoys(out.battle.actors.player.state).every(x=>x.remaining===6-copied));
 assert.equal(decoys(out.battle.actors.player.state).length,copied>=6?0:3);
 assert.equal(out.battle.actors.huang.state.turn.standard,0);
});
test('pending player defense saves no mirror die or action cost and reload resumes exactly one selection',async()=>{
 const {resolveStep}=await import('./combat/transitions.mjs');const b=battle();b.playerDefenseDeclarations=true;b.reactionWindows=true;
 let draws=0;const drawDice=()=>{draws++;return Array(512).fill(2);};
 let out=resolveStep(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice});
 assert.equal(out.battle.pending.awaiting,'player');assert.equal(draws,0);assert.equal(out.battle.actors.huang.state.turn.standard,1);
 out=resolveStep(JSON.parse(JSON.stringify(out.battle)),{actorId:'player',abilityId:'react',choice:'decline',defense:'normal'},{playerAuthorized:true,drawDice});
 assert.equal(draws,1);assert.equal(out.battle.actors.huang.state.turn.standard,0);assert.equal(decoys(out.battle.actors.player.state).length,2);
});
test('decoys share actual dispel and death cleanup without removing acquired resources',async()=>{
 const {timedResourceInstances,endTimedResource}=await import('./resource-instances.mjs');
 const {settleResourceDeaths}=await import('./resource-death.mjs');
 for(const mode of ['dispel','death']){
  const root=cast(),state=root.actors.player.state,owned=structuredClone(state.learnedResources);
  if(mode==='dispel'){const row=timedResourceInstances(root,'player').find(x=>x.sourceId==='imperial-magic:D:镜像');assert.equal(row.level,1);endTimedResource(root,'player',row,{drawDice:dice(8)});}
  else {state.health.dead=true;settleResourceDeaths(root);}
  assert.equal(decoys(state).length,0);assert.deepEqual(state.learnedResources,owned);
 }
});
test('legal attack preview presents a pending decoy chance without changing the saved mirrors or forecasting a winner',async()=>{
 const {inspectCommands}=await import('./combat/runtime.mjs');const b=battle(),before=structuredClone(b);
 const inspection=inspectCommands(b),option=inspection.options.find(x=>x.command.abilityId==='strike'&&x.command.targetId==='player');
 assert.ok(option);assert.deepEqual(option.preview.attack.decoy,{remainingImages:3,bodyWeight:1,totalWeight:4,pending:true});
 assert.deepEqual(b,before);assert.equal(option.preview.attack.decoy.redirected,undefined);
});
test('Q47 paid recast retains the old damaged/disbelieved group and dispelling latest restores it unchanged',async()=>{
 const {activeDecoys}=await import('./resource-decoys.mjs');const {timedResourceInstances,endTimedResource}=await import('./resource-instances.mjs');
 const x=spell('镜像');x.root=reduceRuleAction(x.root,x.q,{drawDice:dice(8)});
 const old=x.root.actors.player.state.activeResourceEffects.find(x=>x.decoys);old.decoys.members.pop();old.decoys.members[0].remaining=2;old.decoys.disbelievedBy={huang:{source:'actual old observation',round:1}};
 const saved=structuredClone(old),out=reduceRuleAction(x.root,x.q,{drawDice:dice(8)}),s=out.actors.player.state;
 assert.equal(s.activeResourceEffects.filter(x=>x.decoys).length,2);assert.deepEqual(s.activeResourceEffects.find(x=>x.id===old.id),saved);
 const latest=activeDecoys(s);assert.equal(latest.length,1);assert.notEqual(latest[0].id,old.id);assert.equal(latest[0].decoys.members.length,3);assert.equal(latest[0].decoys.disbelievedBy,undefined);assert.equal(s.resources.test.current,38);
 const loaded=JSON.parse(JSON.stringify(out)),row=timedResourceInstances(loaded,'player').find(row=>row.components.some(c=>loaded.actors.player.state[c.field]?.[c.key]?.id===latest[0].id));
 assert.ok(row);assert.equal(timedResourceInstances(loaded,'player').length,2);endTimedResource(loaded,'player',row,{drawDice:dice(8)});
 assert.deepEqual(activeDecoys(loaded.actors.player.state),[saved]);
});
test('Q47 exhausting the current group ends it and restores old pools only after the current event',async()=>{
 const {activeDecoys,copyDecoyDamage,redirectDecoyAttack}=await import('./resource-decoys.mjs');
 for(const mode of ['area','single']){
  const x=spell('镜像');x.root=reduceRuleAction(x.root,x.q,{drawDice:dice(8)});
  const old=x.root.actors.player.state.activeResourceEffects.find(x=>x.decoys);old.decoys.members[0].remaining=1;const saved=structuredClone(old);
  const root=reduceRuleAction(x.root,x.q,{drawDice:dice(8)}),s=root.actors.player.state;
  if(mode==='area')copyDecoyDamage(s,[{amount:6,severity:'L'}],{targetId:'player',targetMode:'area'});
  else {activeDecoys(s)[0].decoys.members.splice(1);redirectDecoyAttack(root,{attackerId:'huang',targetId:'player',drawDice:dice(2)});}
  assert.deepEqual(activeDecoys(s),[saved]);assert.equal(s.activeResourceEffects.filter(x=>x.decoys).length,1);
 }
});
test('Q47 different grades retain independent active groups and image damage cannot refill either group',async()=>{
 const {activeDecoys,copyDecoyDamage}=await import('./resource-decoys.mjs');const x=spell('镜像','C');x.root.actors.player.state.activeResourceEffects=cast('D').actors.player.state.activeResourceEffects;
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice(8)}),s=out.actors.player.state;
 assert.deepEqual(activeDecoys(s).map(x=>x.grade).sort(),['C','D']);assert.equal(s.resources.test.current,37);
 copyDecoyDamage(s,[{amount:3,severity:'L'}],{targetId:'player',targetMode:'area'});
 assert.deepEqual(activeDecoys(s).map(x=>[x.grade,x.decoys.members.map(m=>m.remaining)]),[['D',[3,3,3]],['C',[9,9,9,9,9,9]]]);
});
test('Q47 old development instances gain scoped retention without losing pools, knowledge or their stable ID',async()=>{
 const {activeDecoys}=await import('./resource-decoys.mjs');const x=spell('镜像');x.root=reduceRuleAction(x.root,x.q,{drawDice:dice(8)});
 const old=x.root.actors.player.state.activeResourceEffects.find(x=>x.decoys);delete old.selection;delete x.root.actors.player.state.resourceEffectSerial;
 old.decoys.members[0].remaining=2;old.decoys.disbelievedBy={huang:{source:'actual remembered observation'}};const original=structuredClone(old);
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice(8)}),rows=out.actors.player.state.activeResourceEffects;
 assert.equal(rows.length,2);assert.equal(new Set(rows.map(x=>x.id)).size,2);const restored=rows.find(x=>x.id===old.id);
 assert.deepEqual(restored.decoys,original.decoys);assert.ok(restored.selection);assert.notEqual(activeDecoys(out.actors.player.state)[0].id,old.id);
});
test('Q47 a new group rechecks a continuing actual detector and records its own knowledge',async()=>{
 const x=spell('镜像');x.root=reduceRuleAction(x.root,x.q,{drawDice:dice(8)});x.root=reduceRuleAction(x.root,x.q,{drawDice:dice(8)});
 const b=battle();b.actors.player.state=x.root.actors.player.state;b.actors.huang.senseSources={vision:{source:'continuing D vision',grade:'D',visual:true,sensitiveRange:20,vagueRange:30}};
 const out=act(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:dice(2)});
 assert.equal(out.result.attack.decoy,undefined);
 const rows=out.battle.actors.player.state.activeResourceEffects.filter(x=>x.decoys);assert.equal(rows.length,2);assert.ok(rows.at(-1).decoys.disbelievedBy.huang);
 assert.equal(rows[0].decoys.disbelievedBy,undefined);
});
