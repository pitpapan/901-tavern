import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningEncounter} from './combat/opening.mjs';
import {act} from './combat/engine.mjs';
import {beginTurn} from './core.mjs';
import {locationPrecision} from './combat/map.mjs';
function fixture(){const b=createOpeningEncounter({id:'sensing-loop',participants:['player','huang'],positions:{player:[0,0],huang:[8,0]}});b.map={features:[]};b.activeId='huang';b.reactionWindows=false;b.playerDefenseDeclarations=false;b.actors.huang.state=beginTurn(b.actors.huang.state).state;b.actors.huang.sheathed=false;b.actors.player.windSense=false;b.actors.player.team='party';b.actors.huang.team='enemy';
 b.actors.player.senseSources={vision:{source:'actual visual',grade:'none',sensitiveRange:5,vagueRange:10}};
 b.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'actual veil',grade:'D',level:2,mode:'sensory',scene:true}};
 b.ruleScene={perception:{source:'actual encounter concealment choice',concealmentWaived:['huang']}};return b;}
test('actual combat movement automatically checks protected targets and applies the endpoint range without extra rolls',()=>{
 const b=fixture();let rolls=0;
 const out=act(b,{actorId:'huang',abilityId:'move',to:[4,0]},{drawDice:()=>{rolls++;return Array(200).fill(8);}});
 assert.equal(rolls,1);assert.equal(locationPrecision(out.battle,out.battle.actors.huang,'player'),'vague');
 assert.equal(out.battle.actors.player.state.resourceDiscoveries.huang.everLocated,true);
 assert.equal(out.battle.actors.huang.state.turn.move,0);
 const loaded=JSON.parse(JSON.stringify(out.battle));loaded.actors.huang.state=beginTurn(loaded.actors.huang.state).state;
 const again=act(loaded,{actorId:'huang',abilityId:'move',to:[3,0]},{drawDice:()=>{throw Error('same round must reuse');}});
 assert.equal(locationPrecision(again.battle,again.battle.actors.huang,'player'),'vague');
});
test('automatic sensing persists missing actual range separately without inventing the 901 vague range',()=>{
 const b=fixture();b.actors.huang.sheathed=true;delete b.actors.player.senseSources.vision.vagueRange;
 const out=act(b,{actorId:'huang',abilityId:'draw'},{drawDice:()=>{throw Error('missing range must be caught before rolling');}});
 const rows=Object.values(out.battle.actors.player.state.resourcePendingPerceptions);assert.equal(rows.length,1);assert.equal(rows[0].field,'perception.vagueRange');
 assert.equal(rows[0].status,'needs_input');assert.equal(out.battle.actors.huang.state.turn.move,0);
});
test('runtime initialization, MVU save and operation retry preserve automatic perception and anonymous map information',async()=>{
 const {createCombatRuntime}=await import('./combat/runtime.mjs');const {mapView}=await import('./combat/map.mjs');const {mapSvg}=await import('./gm_runtime/map-art.mjs');
 let floor={},rolls=0;const anchor={chatId:'automatic-perception',messageId:0,swipeId:0};
 const rt=createCombatRuntime({mvu:{getMvuData:()=>structuredClone(floor),replaceMvuData:async v=>{floor=structuredClone(v);}},getAnchor:()=>anchor,expectedChatId:anchor.chatId,drawDice:()=>{rolls++;return Array(200).fill(8);}});
 const b=fixture();b.map.bounds=[-10,-10,30,30];b.actors.huang.position=[3,0];b.actors.huang.sheathed=true;
 await rt.initialize(b);assert.equal(rolls,1);assert.equal(b.actors.player.state.resourceDiscoveries,undefined);
 const loaded=rt.read();assert.equal(loaded.battle.actors.player.state.resourceDiscoveries.huang.everLocated,true);
 const view=mapView(loaded.battle,'player');assert.deepEqual(view.vagueObservations,[{position:[3,0],precision:'vague'}]);assert.equal(view.actors.some(x=>x.id==='huang'),false);
 const svg=mapSvg(view);assert.match(svg,/模糊定位/);assert.doesNotMatch(svg,/黄道星/);
 const q={operationId:'draw/1',expectedRevision:loaded.revision,command:{actorId:'huang',abilityId:'draw'}};
 await rt.dispatch(q);assert.equal(rolls,1);const saved=JSON.stringify(floor);
 assert.equal((await rt.dispatch(q)).status,'already_applied');assert.equal(JSON.stringify(floor),saved);assert.equal(rolls,1);
});
test('automatic sensing applies adopted Q43 to actual movement before a fresh hiding roll',()=>{
 const b=fixture();let out=act(b,{actorId:'huang',abilityId:'move',to:[18,0]},{drawDice:()=>Array(200).fill(8)}).battle;
 assert.equal(out.actors.huang.state.resourceMovementHistory[0].length,10);assert.equal(out.actors.huang.state.resourceMovementHistory[0].speed,16);
 out.round++;out.activeId='huang';out.actors.huang.state=beginTurn(out.actors.huang.state).state;out.actors.huang.sheathed=true;
 out.actors.player.senseSources.vision.sensitiveRange=30;out.actors.player.senseSources.vision.vagueRange=30;delete out.ruleScene.perception.concealmentWaived;
 out=act(out,{actorId:'huang',abilityId:'draw'},{drawDice:()=>Array(200).fill(8)}).battle;
 assert.equal(Object.values(out.actors.player.state.resourcePendingPerceptions??{}).length,0);
 const receipt=Object.values(out.actors.player.state.resourceDetectionContests)[0];assert.equal(receipt.contest.hidingMovement.penalty,2);assert.equal(receipt.contest.hidingMovement.distance,10);
});
test('real round advancement retries a below-maximum passive result once in the new round',()=>{
 const b=fixture();b.turnTaken=['player'];b.order=['huang','player'];let draws=0;
 const out=act(b,{actorId:'huang',abilityId:'end'},{drawDice:()=>{draws++;return Array(200).fill(8);}});
 assert.equal(out.battle.round,2);assert.equal(draws,2);
 const receipt=Object.values(out.battle.actors.player.state.resourceDetectionContests)[0];assert.match(receipt.epoch,/\/2$/);assert.equal(receipt.precision,'none');
});
test('automatic ordinary vision cannot discover an unseen spirit or subterranean target',()=>{
 for(const kind of ['spirit','underground']){
  const b=fixture();b.actors.huang[kind]=true;b.actors.huang.sheathed=true;
  const out=act(b,{actorId:'huang',abilityId:kind==='underground'?'end':'draw'},{drawDice:()=>{throw Error('no actual sensory eligibility');}});
  assert.equal(out.battle.actors.player.state.resourceDiscoveries?.huang,undefined);
 }
});

test('active search pays one standard action and improves saved location without granting hidden identity',async()=>{
 const {schedulePassivePerception}=await import('./resource-perception-scheduler.mjs');
 const {endTurn}=await import('./core.mjs');
 const b=fixture();b.activeId='player';b.actors.player.state=beginTurn(endTurn(b.actors.player.state).state).state;
 b.actors.player.senseSources.vision={source:'actual visual',grade:'C',sensitiveRange:3,vagueRange:30};
 delete b.ruleScene.perception.concealmentWaived;
 let n=0;schedulePassivePerception(b,{drawDice:()=>Array(200).fill(++n%2?1:8)});
 assert.equal(locationPrecision(b,b.actors.huang,'player'),'none');n=0;
 const out=act(b,{actorId:'player',abilityId:'search'},{playerAuthorized:true,drawDice:()=>Array(200).fill(++n%2?8:1)});
 assert.equal(out.battle.actors.player.state.turn.standard,0);assert.equal(out.battle.actors.player.state.turn.move,1);
 assert.equal(locationPrecision(out.battle,out.battle.actors.huang,'player'),'vague');
 assert.equal(out.result.perceptions.find(x=>x.contest?.mode==='search').contest.mode,'search');
 const loaded=JSON.parse(JSON.stringify(out.battle));loaded.actors.player.state=beginTurn(endTurn(loaded.actors.player.state).state).state;n=0;
 const next=act(loaded,{actorId:'player',abilityId:'search'},{playerAuthorized:true,drawDice:()=>Array(200).fill(++n%2?8:1)});
 assert.equal(locationPrecision(next.battle,next.battle.actors.huang,'player'),'exact');
});
test('a registered nonvisual sensory channel feeds the map, without inventing vision or another roll',async()=>{
 const {schedulePassivePerception}=await import('./resource-perception-scheduler.mjs');
 const b=fixture();b.actors.player.windSense=true;delete b.actors.player.senseSources.vision;
 b.actors.player.senseSources={auditory:{source:'actual enhanced hearing',grade:'none',visual:false,channel:'auditory',sensitiveRange:20,vagueRange:20,maximumPrecision:'vague'}};
 schedulePassivePerception(b,{drawDice:()=>Array(200).fill(8)});
 assert.equal(locationPrecision(b,b.actors.huang,'player'),'vague');
});
test('explicit hiding during movement rechecks an eligible stronger protection once without extra action cost',()=>{
 const b=fixture();b.actors.huang.position=[3,0];delete b.ruleScene.perception.concealmentWaived;
 const out=act(b,{actorId:'huang',abilityId:'move',to:[4,0],hide:true},{drawDice:()=>Array(200).fill(8)});
 assert.equal(out.battle.actors.huang.state.turn.move,0);assert.equal(out.battle.actors.huang.state.turn.standard,1);
 const receipt=Object.values(out.battle.actors.player.state.resourceDetectionContests)[0];assert.equal(receipt.contest.mode,'hide');
});
test('movement crossing a sensory range rolls once even when both endpoints are outside, and reveals no endpoint',()=>{
 const b=fixture();b.actors.player.position=[4,0];b.actors.huang.position=[0,0];
 b.actors.player.senseSources.vision={source:'actual short sight',grade:'none',sensitiveRange:1,vagueRange:2};
 let rolls=0;const out=act(b,{actorId:'huang',abilityId:'move',to:[8,0]},{drawDice:()=>{rolls++;return Array(200).fill(8);}});
 assert.equal(rolls,1);assert.equal(locationPrecision(out.battle,out.battle.actors.huang,'player'),'none');
 const receipt=Object.values(out.battle.actors.player.state.resourceDetectionContests)[0];assert.equal(receipt.precision,'none');
 assert.equal(out.battle.actors.player.state.resourceDiscoveries?.huang,undefined);
});
test('search-derived exact location in a vague band remains at the sensory maximum after reload and round advance',async()=>{
 const {resolvePerceptionEvent}=await import('./resource-observation.mjs');const {schedulePassivePerception}=await import('./resource-perception-scheduler.mjs');
 let b=fixture();b.actors.player.senseSources.vision={source:'actual sight',grade:'C',sensitiveRange:1,vagueRange:30};
 resolvePerceptionEvent(b,'player',{source:'actual search',targetId:'huang',mode:'search',previousPrecision:'vague',concealmentWaived:true},{combat:true,drawDice:()=>Array(200).fill(8)});
 b=JSON.parse(JSON.stringify(b));b.round++;
 schedulePassivePerception(b,{drawDice:()=>{throw Error('already at sensory maximum');}});
 assert.equal(locationPrecision(b,b.actors.huang,'player'),'exact');
});
test('active search consumes actual current/previous-round sound cues, and mental B priority still blocks automatic senses',async()=>{
 const {resolvePerceptionEvent}=await import('./resource-observation.mjs');
 const b=fixture();b.actors.huang.position=[3,0];b.actors.player.senseSources.vision.grade='C';
 b.actors.huang.state.resourceSensoryCues=[{source:'actual spoken spell',kind:'sound',suppression:'unavoidable',round:b.round,battleId:b.instanceId??b.id??'current'}];
 const event={source:'actual search',targetId:'huang',mode:'search',previousPrecision:'none'};
 const result=resolvePerceptionEvent(b,'player',event,{combat:true,drawDice:()=>{throw Error('unavoidable sound automatically loses concealment');}});
 assert.equal(result.information.precision,'vague');assert.equal(result.contest.sound.source,'actual spoken spell');
 b.actors.player.senseSources.vision.automaticDetection=true;b.actors.huang.state.resourceCapabilities.veil={id:'antiDetection',source:'actual B mental source',mode:'mental',grade:'B',level:4,scene:true};
 const blocked=resolvePerceptionEvent(b,'player',event,{combat:true,drawDice:()=>{throw Error('mental priority');}});
 assert.equal(blocked.information.detected,false);assert.equal(blocked.detection.automaticConcealment,true);
});
test('one search with multiple senses upgrades each from the same prior location rather than chaining grades',async()=>{
 const {schedulePassivePerception}=await import('./resource-perception-scheduler.mjs');
 const b=fixture();b.actors.player.senseSources.vision.grade='C';b.actors.player.senseSources.extra={source:'actual second sense',grade:'C',visual:false,channel:'nonvisual',sensitiveRange:3,vagueRange:30};
 delete b.ruleScene.perception.concealmentWaived;let n=0;
 schedulePassivePerception(b,{drawDice:()=>Array(200).fill(++n%2?1:8)});assert.equal(locationPrecision(b,b.actors.huang,'player'),'none');
 b.ruleScene.perception.concealmentWaived=['huang'];
 schedulePassivePerception(b,{mode:'search',observerId:'player',drawDice:()=>Array(200).fill(8)});
 assert.equal(locationPrecision(b,b.actors.huang,'player'),'vague');
});
test('classifier combat options expose active search and explicit hiding without caller-authored rolls',async()=>{
 const {inspectCommands}=await import('./combat/runtime.mjs');const {schedulePassivePerception}=await import('./resource-perception-scheduler.mjs');
 const b=fixture();b.actors.huang.position=[3,0];schedulePassivePerception(b,{drawDice:()=>Array(200).fill(8)});
 const options=inspectCommands(b).options.map(x=>x.command);assert.ok(options.some(x=>x.abilityId==='search'));assert.ok(options.some(x=>x.abilityId==='move'&&x.hide===true));
});
test('active search uses sourced audible history and its global-round window without guessing a silent target',async()=>{
 const {resolvePerceptionEvent}=await import('./resource-observation.mjs');
 const b=fixture();b.actors.huang.position=[3,0];b.actors.player.senseSources.vision.grade='C';
 b.actors.huang.state.resourceSensoryCues=[{source:'actual spoken casting',kind:'sound',suppression:'unavoidable',battleId:b.instanceId??b.id??'current',round:1}];
 let draws=0;const event={source:'actual search',targetId:'huang',mode:'search',previousPrecision:'none'};
 const found=resolvePerceptionEvent(b,'player',event,{combat:true,drawDice:()=>{draws++;return Array(200).fill(1);}});
 assert.equal(found.information.precision,'vague');assert.equal(draws,0);assert.equal(found.contest.sound.source,'actual spoken casting');
 b.round=3;const expired=resolvePerceptionEvent(b,'player',event,{combat:true,drawDice:()=>{draws++;return Array(200).fill(1);}});
 assert.equal(draws,2);assert.equal(expired.contest.sound,undefined);
 b.actors.huang.state.resourceSensoryCues=[{source:'actual quiet speech',kind:'sound',suppression:'possible',battleId:b.instanceId??b.id??'current',round:3}];draws=0;
 const quiet=resolvePerceptionEvent(b,'player',event,{combat:true,drawDice:()=>Array(200).fill(++draws===2?8:1)});
 assert.equal(draws,3);assert.equal(quiet.contest.observerAttempts.length,2);assert.equal(quiet.contest.observer.total,Math.max(...quiet.contest.observerAttempts.map(x=>x.total)));
});
test('B-tier mental automatic concealment still defeats automatic blind detection and sound search per adopted Q40',async()=>{
 const {resolvePerceptionEvent}=await import('./resource-observation.mjs');
 const b=fixture();b.actors.huang.position=[3,0];b.actors.huang.state.resourceCapabilities.veil={id:'antiDetection',source:'actual B mind',grade:'B',level:4,mode:'mental',scene:true};
 b.actors.huang.state.resourceSensoryCues=[{source:'actual speech',kind:'sound',suppression:'unavoidable',battleId:b.instanceId??b.id??'current',round:1}];
 b.actors.player.senseSources.blind={source:'actual blind sense',grade:'D',visual:false,sensitiveRange:10,vagueRange:10,automaticDetection:true,maximumPrecision:'vague'};
 for(const mode of [undefined,'search']){const result=resolvePerceptionEvent(b,'player',{source:'actual check',targetId:'huang',senseSource:'blind',mode},{combat:true,drawDice:()=>{throw Error('automatic grade gate needs no dice');}});assert.equal(result.information.detected,false);}
});
