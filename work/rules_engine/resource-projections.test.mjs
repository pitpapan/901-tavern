import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster} from './combat/opening.mjs';
import {reduceRuleAction} from './gm_runtime/rule-actions.mjs';
import {RESOURCE_CATALOG} from './resource-catalog.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';
const dice=n=>()=>Array(512).fill(n),source='actual projection scene';
function fixture(name='虚假幻象',grade='D'){
 const id=Object.values(RESOURCE_CATALOG).find(x=>x.name===name).id;assert.ok(RESOURCE_DEFINITIONS[id].programs?.cast,name+' actual program');
 const actors=createOpeningRoster(),s=actors.player.state;s.casting={imperial:{grade,pool:'test'}};s.resources.test={current:30,max:30};s.learnedResources={[id]:{learned:true,grade,source}};s.skills.神秘={level:3,subs:{幻术:{level:1}}};
 const projection={source,position:[2,0],size:1,dimensions:[1,1,2],appearance:{label:'石像',description:'一尊普通石像'},...(name==='预置幻影'?{playbackMinutes:2,trigger:{test:'eq',left:{context:'words'},right:'开启'}}:{})};
 const plan={source,components:{posture:true,language:true,focus:true},projection};
 const root={actors,ruleScene:{spatial:{source,map:{features:[]},actors:Object.fromEntries(Object.keys(actors).map((id,i)=>[id,{position:[i,0]}]))},objects:{spell:{source,type:'kitResource',resourceId:id,actorIds:['player'],plans:{use:plan}}},events:{}}};
 const q={kind:'rule',action:'mechanism',actorId:'player',objectId:'spell',operation:'cast',part:'use'};return {id,root,q,plan};
}
const projection=root=>root.actors.player.state.activeResourceEffects.find(e=>e.projection);
function cast(name,grade){const x=fixture(name,grade);x.root=reduceRuleAction(x.root,x.q,{drawDice:dice(8)});return x;}
function event(x,id,actorId,data,drawDice=dice(8)){
 x.root.ruleScene.events[id]={source,actorIds:[actorId],type:'projectionEvent',ownerId:'player',instanceId:projection(x.root).id,...data};
 return reduceRuleAction(x.root,{kind:'rule',action:'status_event',actorId,eventId:id},{drawDice});
}
test('D/C projection creation stores cast cap and source without creating a real actor, injury pool or future ability',()=>{
 for(const grade of ['D','C']){const x=fixture('虚假幻象',grade),before=structuredClone(x.root),out=reduceRuleAction(x.root,x.q,{drawDice:dice(8)}),e=projection(out);
  assert.equal(e.projection.phase,'visible');assert.equal(e.targetScope,'scene');assert.ok(e.projection.maximumSize<=2*(grade==='D'?3:6)*(grade==='D'?1:2));
  assert.equal(e.projection.damageThreshold,grade==='D'?null:6);assert.deepEqual(Object.keys(out.actors),Object.keys(before.actors));assert.deepEqual(out.actors.player.state.health,before.actors.player.state.health);assert.equal(out.actors.player.state.resources.test.current,grade==='D'?29:27);
 }
 assert.equal(createOpeningRoster().player.state.activeResourceEffects,undefined);
});
test('cast-result size is an actual limit; an oversized design waits for a legal choice without scaling or recasting',()=>{
 const x=fixture();x.plan.projection.size=6;let draws=0;x.root=reduceRuleAction(x.root,x.q,{drawDice:()=>{draws++;return Array(512).fill(8);}});const e=projection(x.root);
 assert.equal(e.projection.phase,'awaiting-design');assert.ok(e.projection.maximumSize<6);assert.equal(draws,1);
 x.plan=x.root.ruleScene.objects.spell.plans.use;x.plan.instanceId=e.id;x.plan.projection.size=1;
 const out=reduceRuleAction(x.root,{...x.q,operation:'complete'},{drawDice:()=>{throw Error('completion must not reroll');}});
 assert.equal(projection(out).projection.phase,'visible');assert.equal(out.actors.player.state.resources.test.current,29);
});
test('Q48 D interaction reveals to the interacting actor and actually witnessed penetration, never hearsay recipients',()=>{
 const x=cast();x.root.ruleScene.spatial.actors.huang.position=[2,0];x.root.ruleScene.spatial.actors.jiang.position=[3,0];
 const out=event(x,'touch','huang',{operation:'touch',witnesses:[{actorId:'jiang',source,channel:'visual',evidence:'penetration'}]});const known=projection(out).projection.disbelievedBy;
 assert.ok(known.huang);assert.ok(known.jiang);assert.equal(known.player,undefined);assert.equal(projection(out).projection.phase,'visible');
});
test('C touch alone does not grant disbelief; tactile injury evidence does not automatically reach spectators',async()=>{
 const {interactProjection}=await import('./resource-projections.mjs');const x=cast('虚假幻象','C');x.root.ruleScene.spatial.actors.huang.position=[2,0];
 x.root=event(x,'touch','huang',{operation:'touch'});assert.deepEqual(projection(x.root).projection.disbelievedBy,{});
 const e=projection(x.root);interactProjection(x.root,'huang',e,{kind:'attack',damage:1,melee:true,source:'actual engine attack',witnesses:[{actorId:'jiang',source,channel:'visual',evidence:'penetration'}]});
 assert.ok(e.projection.disbelievedBy.huang);assert.equal(e.projection.disbelievedBy.jiang,undefined);
});
test('programmed projection begins hidden, consumes a real cue once and shares the visual/auditory free-check budget',()=>{
 const x=cast('预置幻影','C');assert.equal(projection(x.root).projection.phase,'armed');
 x.root=event(x,'cue','huang',{operation:'cue',cue:{kind:'speech',words:'开启',position:[2,0],channel:'auditory'}});assert.equal(projection(x.root).projection.phase,'playing');
 let draws=0;x.root=event(x,'look1','huang',{operation:'observe',channel:'visual',mode:'passive'},()=>{draws++;return Array(512).fill(1);});
 projection(x.root).projection.appearance.sound='石像说话';x.root.actors.huang.senseSources={hearing:{source:'actual hearing',channel:'auditory',visual:false,grade:'none',sensitiveRange:10}};
 x.root=event(x,'look2','huang',{operation:'observe',channel:'auditory',mode:'passive'},()=>{draws++;return Array(512).fill(1);});assert.equal(draws,1);
 assert.equal(projection(x.root).projection.activationId,1);assert.equal(projection(x.root).projection.observations.huang.activationId,1);
});
test('Q49 elapsed playback and dormancy arm the same object; a new cue resets free attempts, never successful disbelief',()=>{
 const x=cast('预置幻影','C');x.root=event(x,'cue1','huang',{operation:'cue',cue:{kind:'speech',words:'开启',position:[2,0],channel:'auditory'}});
 x.root=event(x,'look1','huang',{operation:'observe',channel:'visual',mode:'passive'},dice(1));
 expireResourceEffects(x.root.actors.player.state,{minutes:12});assert.equal(projection(x.root).projection.phase,'armed');assert.equal(projection(x.root).projection.activationId,1);
 x.root=event(x,'cue2','huang',{operation:'cue',cue:{kind:'speech',words:'开启',position:[2,0],channel:'auditory'}});assert.equal(projection(x.root).projection.activationId,2);
 x.root.actors.huang.state.skills.调查={level:5,subs:{侦查:{level:6}}};x.root=event(x,'look2','huang',{operation:'observe',channel:'visual',mode:'passive'},dice(8));assert.ok(projection(x.root).projection.disbelievedBy.huang);
 expireResourceEffects(x.root.actors.player.state,{minutes:12});x.root=event(x,'cue3','huang',{operation:'cue',cue:{kind:'speech',words:'开启',position:[2,0],channel:'auditory'}});
 x.root=event(x,'look3','huang',{operation:'observe',channel:'visual',mode:'passive'},()=>{throw Error('known illusion must not reroll');});assert.ok(projection(x.root).projection.disbelievedBy.huang);
});
test('scene projections survive caster death and scene exit; a dead attachment ends only the attached effect',async()=>{
 const {settleResourceDeaths}=await import('./resource-death.mjs');const {timedResourceInstances,endTimedResource}=await import('./resource-instances.mjs');
 const x=cast('预置幻影','C'),id=projection(x.root).id;x.root.actors.player.state.health.dead=true;settleResourceDeaths(x.root);expireResourceEffects(x.root.actors.player.state,{scene:true});assert.equal(projection(x.root).id,id);
 const instances=timedResourceInstances(x.root,'player');assert.ok(instances.some(x=>x.components.length));endTimedResource(x.root,'player',instances.find(row=>row.components.some(c=>x.root.actors.player.state[c.field]?.[c.key]?.id===id)));assert.equal(projection(x.root),undefined);
 const y=fixture('虚假幻象','C');y.plan.projection.attachmentId='huang';y.plan.projection.position=y.root.ruleScene.spatial.actors.huang.position;
 y.root=reduceRuleAction(y.root,y.q,{drawDice:dice(8)});assert.ok(projection(y.root));y.root.actors.huang.state.health.dead=true;settleResourceDeaths(y.root);assert.equal(projection(y.root),undefined);
});
test('C appearance follows the real attachment without changing size, identity, collision or actor state',async()=>{
 const {projectionPosition,projectionAppearance}=await import('./resource-projections.mjs');const x=fixture('虚假幻象','C');x.plan.projection.attachmentId='huang';x.plan.projection.position=x.root.ruleScene.spatial.actors.huang.position;
 const before=structuredClone(x.root.actors.huang);x.root=reduceRuleAction(x.root,x.q,{drawDice:dice(8)});assert.deepEqual(x.root.actors.huang,before);
 x.root.ruleScene.spatial.actors.huang.position=[200,3];assert.deepEqual(projectionPosition(x.root,projection(x.root)),[200,3]);assert.equal(projectionAppearance(x.root,'huang','jiang').name,'石像');assert.equal(projectionAppearance(x.root,'huang','player'),null);
});
test('an actual failed weapon hit against a projection cannot reveal tactile evidence; a hit consumes the normal attack without true wounds',async()=>{
 const {createOpeningEncounter}=await import('./combat/opening.mjs');const {act}=await import('./combat/engine.mjs');const x=cast('虚假幻象','D');
 const b=createOpeningEncounter({id:'projection-attack',participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.actors.player.state=x.root.actors.player.state;b.actors.player.team='party';b.actors.huang.team='enemy';b.activeId='huang';b.actors.huang.sheathed=false;b.playerDefenseDeclarations=false;b.reactionWindows=false;b.actors.huang.state.turn={phase:'active',standard:1,move:1,swift:1};
 const id=projection({actors:b.actors}).id,command={actorId:'huang',abilityId:'destroy',featureId:'projection/'+id};
 const before=structuredClone(b.actors.player.state.health),out=act(b,command,{drawDice:dice(8)});
 const miss=structuredClone(b);miss.actors.huang.state.skills.白刃={level:0,subs:{}};miss.actors.huang.state.attributeAuto=Object.fromEntries(Object.keys(miss.actors.huang.state.attributes).map(k=>[k,0]));const missed=act(miss,command,{drawDice:dice(1)});assert.equal(missed.result.terrain.apparentImpact,0);assert.equal(projection({actors:missed.battle.actors}).projection.disbelievedBy.huang,undefined);
 assert.ok(out.result.terrain.apparentImpact>0);assert.equal(out.result.terrain.physicalDamage,0);assert.deepEqual(out.battle.actors.player.state.health,before);assert.ok(projection({actors:out.battle.actors}).projection.disbelievedBy.huang);assert.equal(out.battle.actors.huang.state.turn.standard,0);
});
test('unrecognized projection blocks sight only, while walking through uses the real path and reveals it without collisions',async()=>{
 const {createOpeningEncounter}=await import('./combat/opening.mjs');const {act}=await import('./combat/engine.mjs');const {canObserve,clearLine}=await import('./combat/map.mjs');const x=cast();
 const b=createOpeningEncounter({id:'projection-move',participants:['player','huang','jiang'],positions:{player:[0,2],huang:[1,0],jiang:[3,0]}});b.actors.player.state=x.root.actors.player.state;b.actors.player.windSense=false;b.activeId='huang';b.actors.player.team='party';b.actors.huang.team='enemy';b.actors.jiang.team='party';b.playerDefenseDeclarations=false;b.reactionWindows=false;b.actors.huang.state.turn={phase:'active',standard:1,move:1,swift:1};
 assert.equal(canObserve(b,b.actors.jiang,'huang'),false);assert.equal(clearLine(b.map,[1,0],[3,0],{movement:true}),true);
 const out=act(b,{actorId:'huang',abilityId:'move',to:[2.8,0]},{drawDice:dice(8)});assert.deepEqual(out.battle.actors.huang.position,[2.8,0]);assert.ok(projection({actors:out.battle.actors}).projection.disbelievedBy.huang);
});
test('Q49 active retries cost a move action each, while repeated passive events share the same saved playback quota',async()=>{
 const {createOpeningEncounter}=await import('./combat/opening.mjs');const {act}=await import('./combat/engine.mjs');const x=cast('预置幻影','C');x.root=event(x,'cue','huang',{operation:'cue',cue:{kind:'speech',words:'开启',position:[2,0],channel:'auditory'}});
 const b=createOpeningEncounter({id:'projection-observe',participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.actors.player.state=x.root.actors.player.state;b.actors.player.team='party';b.actors.huang.team='enemy';b.activeId='huang';b.playerDefenseDeclarations=false;b.reactionWindows=false;b.actors.huang.state.turn={phase:'active',standard:1,move:1,swift:1};b.ruleScene={events:{}};
 const id=projection({actors:b.actors}).id;
 for(const key of ['first','second'])b.ruleScene.events[key]={type:'projectionEvent',source,actorIds:['huang'],ownerId:'player',instanceId:id,operation:'observe',mode:'active',channel:'visual'};
 let draws=0,root=act(b,{actorId:'huang',abilityId:'statusEvent',eventId:'first'},{drawDice:()=>{draws++;return Array(512).fill(1);}}).battle;
 assert.equal(root.actors.huang.state.turn.move,0);assert.equal(root.actors.huang.state.turn.standard,1);
 root=act(root,{actorId:'huang',abilityId:'statusEvent',eventId:'second'},{drawDice:()=>{draws++;return Array(512).fill(1);}}).battle;
 assert.equal(draws,2);assert.equal(root.actors.huang.state.turn.standard,0);
});
test('D/C control uses its saved instance action and caps actual social checks; C mental control is possible while immobilized',async()=>{
 const {createOpeningEncounter}=await import('./combat/opening.mjs');const {act}=await import('./combat/engine.mjs');
 for(const grade of ['D','C']){
  const x=cast('虚假幻象',grade),b=createOpeningEncounter({id:'projection-control',participants:['player','huang'],positions:{player:[0,0],huang:[4,0]}});b.actors.player.state=x.root.actors.player.state;b.actors.player.team='party';b.actors.huang.team='enemy';b.activeId='player';b.playerDefenseDeclarations=false;b.reactionWindows=false;b.ruleScene=x.root.ruleScene;
  b.actors.player.state.turn={phase:'active',standard:1,move:1,swift:1};if(grade==='C')b.actors.player.state.statuses.push({type:'纠缠',points:100,source:'actual binding'});
  const e=projection({actors:b.actors}),plan=b.ruleScene.objects.spell.plans.use;plan.instanceId=e.id;plan.projection.position=[3,0];plan.controlCheck={source,attribute:'风度',skill:'社交'};b.actors.player.state.skills.社交={level:5,subs:{}};
  const out=act(b,{actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'control',part:'use'},{playerAuthorized:true,drawDice:dice(8)});
  assert.deepEqual(projection({actors:out.battle.actors}).projection.position,[3,0]);assert.equal(out.battle.actors.player.state.turn[grade==='D'?'standard':'move'],0);assert.equal(out.battle.actors.player.state.resources.test.current,grade==='D'?29:27);
  const result=out.result.mechanism??out.result.resource;const capped=result.targets.flatMap(t=>t.steps).find(t=>t.op==='projectionControl');assert.equal(capped.castSuccessCap,e.projection.castTotal);assert.equal(capped.total,Math.min(capped.roll.total,e.projection.castTotal));
 }
});
test('projection views expose the chosen appearance but no casting power or hidden dormant object',async()=>{
 const {projectionView}=await import('./resource-projections.mjs');const x=cast(),view=projectionView(x.root,'huang');assert.equal(view[0].label,'石像');assert.equal(view[0].recognizedIllusion,undefined);assert.equal(view[0].maximumSize,undefined);assert.equal(view[0].castTotal,undefined);
 assert.deepEqual(projectionView(cast('预置幻影','C').root,'huang'),[]);
});
test('preset conditions cannot inspect hidden actor state instead of visible or audible events',()=>{
 const x=fixture('预置幻影','C');x.plan.projection.trigger={test:'lte',left:{state:'health.intact'},right:3};let draws=0;const before=structuredClone(x.root);
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:()=>{draws++;return Array(512).fill(8);}}),/可视|可听|事件/);assert.equal(draws,0);assert.deepEqual(x.root,before);
});
async function combatProjection(x,participants=['player','huang']){
 const {createOpeningEncounter}=await import('./combat/opening.mjs');
 const b=createOpeningEncounter({id:'projection-persistence',participants,positions:{player:[0,0],huang:[1,0],jiang:[3,0]}});
 b.map={features:[],bounds:[-100,-100,200,200]};b.actors.player.state=x.root.actors.player.state;b.actors.player.windSense=false;b.actors.player.team='party';b.actors.huang.team='enemy';b.activeId='huang';b.playerDefenseDeclarations=false;b.reactionWindows=false;b.ruleScene=x.root.ruleScene;b.actors.huang.state.turn={phase:'active',standard:1,move:1,swift:1};return b;
}
test('actual passive scheduler shares a playback quota; map and decision queries do not draw or mutate it',async()=>{
 const {schedulePassivePerception}=await import('./resource-perception-scheduler.mjs');const {mapView}=await import('./combat/map.mjs');
 const x=cast('预置幻影','C');x.root=event(x,'cue','huang',{operation:'cue',cue:{kind:'speech',words:'开启',position:[2,0],channel:'auditory'}});const b=await combatProjection(x);let draws=0;
 const roll=()=>{draws++;return Array(512).fill(1);};schedulePassivePerception(b,{drawDice:roll});assert.equal(draws,1);schedulePassivePerception(b,{drawDice:roll});assert.equal(draws,1);
 const saved=JSON.stringify(b);mapView(b,'huang');mapView(b,'huang');assert.equal(JSON.stringify(b),saved);assert.equal(draws,1);
});
test('MVU saves playback observation and paid retry atomically; duplicate operation never rerolls or pays again',async()=>{
 const {createCombatRuntime}=await import('./combat/runtime.mjs');const x=cast('预置幻影','C');x.root=event(x,'cue','huang',{operation:'cue',cue:{kind:'speech',words:'开启',position:[2,0],channel:'auditory'}});const b=await combatProjection(x);
 b.ruleScene.events.retry={type:'projectionEvent',source,actorIds:['huang'],ownerId:'player',instanceId:projection(b).id,operation:'observe',mode:'active',channel:'visual'};
 let floor={},draws=0;const anchor={chatId:'projection-save',messageId:0,swipeId:0};const rt=createCombatRuntime({mvu:{getMvuData:()=>structuredClone(floor),replaceMvuData:async v=>{floor=structuredClone(v);}},getAnchor:()=>anchor,expectedChatId:anchor.chatId,drawDice:()=>{draws++;return Array(512).fill(1);}});
 await rt.initialize(b);assert.equal(draws,1);const q={operationId:'projection-observation/1',expectedRevision:rt.read().revision,command:{actorId:'huang',abilityId:'statusEvent',eventId:'retry'}};
 await rt.dispatch(q);assert.equal(draws,2);assert.equal(rt.read().battle.actors.huang.state.turn.move,0);assert.equal(projection(rt.read().battle).projection.observations.huang.passiveUsed,true);
 const saved=JSON.stringify(floor);assert.equal((await rt.dispatch(q)).status,'already_applied');assert.equal(draws,2);assert.equal(JSON.stringify(floor),saved);
});
test('field active observation obeys actual inability to act while passive recognition remains available',()=>{
 const x=cast('预置幻影','C');x.root=event(x,'cue','huang',{operation:'cue',cue:{kind:'speech',words:'开启',position:[2,0],channel:'auditory'}});x.root.actors.huang.state.statuses.push({type:'沮丧',points:100,source});let draws=0;
 assert.throws(()=>event(x,'active','huang',{operation:'observe',channel:'visual',mode:'active'},()=>{draws++;return Array(512).fill(1);}),/沮丧/);assert.equal(draws,0);
 const out=event(x,'passive','huang',{operation:'observe',channel:'visual',mode:'passive'},dice(1));assert.ok(projection(out).projection.observations.huang);
});
test('actual true sight defeats false illusions only in sensitive range, persists discovery, and is not generic high detection',async()=>{
 const {projectionView,observeProjections}=await import('./resource-projections.mjs');const x=cast('虚假幻象','C');
 x.root.actors.huang.senseSources={vision:{source:'actual visual detection',grade:'S',visual:true,sensitiveRange:10}};assert.equal(projectionView(x.root,'huang')[0].recognizedIllusion,undefined);
 x.root.actors.huang.senseSources.vision.trueSight=true;x.root.actors.huang.senseSources.vision.sensitiveRange=.5;assert.equal(projectionView(x.root,'huang')[0],undefined);
 x.root.actors.huang.senseSources.vision.sensitiveRange=10;assert.equal(projectionView(x.root,'huang')[0].recognizedIllusion,true);observeProjections(x.root,{drawDice:()=>{throw Error('true sight must not roll');}});assert.ok(projection(x.root).projection.disbelievedBy.huang);
 delete x.root.actors.huang.senseSources.vision.trueSight;assert.equal(projectionView(x.root,'huang')[0].recognizedIllusion,true);
});
test('unsettled sensor and C damage policies stay explicit without invented defenses, payment or dice',async()=>{
 const x=cast('预置幻影','C');x.root.ruleScene.spatial.map.darkness=true;const pending=event(x,'dark','huang',{operation:'cue',cue:{kind:'speech',words:'开启',position:[2,0],channel:'visual'}});assert.equal(projection(pending).projection.phase,'armed');assert.equal(projection(pending).projection.programmed.pendingCues.dark.question,'Q50');
 const {act}=await import('./combat/engine.mjs');const b=await combatProjection(cast('虚假幻象','C'));b.actors.huang.sheathed=false;const saved=JSON.stringify(b);let draws=0;
 assert.throws(()=>act(b,{actorId:'huang',abilityId:'destroy',featureId:'projection/'+projection(b).id},{drawDice:()=>{draws++;return Array(512).fill(8);}}),e=>e.code==='RULE_UNRESOLVED'&&e.field==='projection.damageBasis');assert.equal(draws,0);assert.equal(JSON.stringify(b),saved);
});
test('opening a real door dispatches the actual event and automatically offers the new playback passive check',async()=>{
 const {act}=await import('./combat/engine.mjs');const x=fixture('预置幻影','C');x.plan.projection.position=[0,1];x.plan.projection.trigger={all:[{test:'eq',left:{context:'kind'},right:'door'},{test:'eq',left:{context:'objectId'},right:'gate'},{test:'eq',left:{context:'operation'},right:'open'}]};x.root=reduceRuleAction(x.root,x.q,{drawDice:dice(8)});
 const b=await combatProjection(x);b.map.features=[{id:'gate',label:'木门',kind:'door',rect:[1.5,-1,.3,2],open:false}];let draws=0;
 const out=act(b,{actorId:'huang',abilityId:'door',featureId:'gate',open:true},{drawDice:()=>{draws++;return Array(512).fill(1);}});
 assert.equal(projection(out.battle).projection.phase,'playing');assert.ok(out.result.projectionCues.some(x=>x.triggered));assert.equal(draws,1);assert.ok(projection(out.battle).projection.observations.huang.passiveUsed);
});
test('true sight recognizes the fog mask and cannot see a projection through the resulting real fog',async()=>{
 const {projectionView}=await import('./resource-projections.mjs');const x=cast('虚假幻象','C');x.root.ruleScene.spatial.actors.huang.position=[0,0];x.root.ruleScene.spatial.actors.jiang.position=[1,0];
 x.root.actors.huang.senseSources={vision:{source:'actual true sight',grade:'none',visual:true,trueSight:true,sensitiveRange:10}};
 assert.equal(projectionView(x.root,'huang')[0].recognizedIllusion,true);
 x.root.actors.jiang.state.activeResourceEffects=[{id:'actual-fog',sourceId:'actual fog source',grade:'D',remainingMinutes:1,obscuration:{radius:.4,mask:'visualIllusion'}}];
 assert.deepEqual(projectionView(x.root,'huang'),[]);assert.equal(projection(x.root).projection.disbelievedBy.huang,undefined);
});
test('player map draws the observed scene object without revealing its nature or creating terrain collision',async()=>{
 const {mapView}=await import('./combat/map.mjs');const {mapSvg}=await import('./gm_runtime/map-art.mjs');const {publicScene}=await import('./combat/presentation.mjs');
 const b=await combatProjection(cast());const view=mapView(b,'huang'),svg=mapSvg(view);assert.match(svg,/石像/);assert.doesNotMatch(svg,/已识破/);assert.equal(view.features.length,0);
 const facts=publicScene({battle:b,actors:b.actors,operations:{}},{playerId:'huang'});assert.equal(facts.projections[0].label,'石像');assert.equal(facts.projections[0].castTotal,undefined);
});
