import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster} from './combat/opening.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';
import * as perception from './resource-perception.mjs';
const sense={source:'isolated-test/radar',grade:'D',visual:false};
function fixture(){const root={instanceId:'battle',round:1,actors:createOpeningRoster()};root.actors.huang.state.activeResourceEffects=[{id:'slow/1',sourceId:'test/slow',casterId:'huang',grade:'C',scene:true,effects:[],detectionDelay:{rounds:2,belowLevel:2,sourceImmunityFamily:'time'}}];return root;}
test('lower-grade nonvisual detection returns historical receipt after two rounds, even when detector has stopped',()=>{
 const root=fixture(),information={position:[2,3],precision:'exact',detected:true};
 const result=perception.recordPerception(root,{observerId:'player',targetId:'huang',sense,information},{combat:true});
 assert.equal(result.pending,true);assert.equal(result.information,undefined);
 root.actors.huang.position=[8,9];root.round=2;perception.advancePerception(root.actors.huang.state,{root,combat:true});
 assert.deepEqual(perception.deliveredPerceptions(root,'player'),[]);
 root.round=3;perception.advancePerception(root.actors.huang.state,{root,combat:true});
 const rows=perception.deliveredPerceptions(JSON.parse(JSON.stringify(root)),'player');assert.equal(rows.length,1);assert.deepEqual(rows[0].information.position,[2,3]);assert.equal(rows[0].historical,true);
});
test('visual, same-grade and actual source time immunity bypass delay; ending slow releases queued snapshot',()=>{
 const root=fixture(),request={observerId:'player',targetId:'huang',sense,information:{detected:true,precision:'vague'}};
 assert.equal(perception.recordPerception(root,{...request,sense:{...sense,visual:true}},{combat:true}).pending,false);
 assert.equal(perception.recordPerception(root,{...request,sense:{...sense,grade:'C'}},{combat:true}).pending,false);
 root.actors.player.state.resourceCapabilities={test:{id:'timeImmunity',level:2}};
 assert.equal(perception.recordPerception(root,request,{combat:true}).pending,false);
 delete root.actors.player.state.resourceCapabilities;
 perception.recordPerception(root,request,{combat:true});expireResourceEffects(root.actors.huang.state,{scene:true});
 assert.equal(perception.deliveredPerceptions(root,'player').length,1);
});
import {canObserve,mapView} from './combat/map.mjs';
import * as maps from './combat/map.mjs';
test('delayed passive wind sense cannot leak live targeting or map position, but visual channels remain immediate',()=>{
 const root=fixture();root.actors={player:root.actors.player,huang:root.actors.huang};root.map={bounds:[0,0,20,20],features:[],darkness:true};
 root.actors.player.position=[0,0];root.actors.huang.position=[2,3];root.actors.player.windSense=true;root.actors.player.visionAvailable=true;
 root.actors.player.senseSources={windSense:{...sense}};
 assert.equal(canObserve(root,root.actors.huang,'player'),false);
 maps.samplePassivePerception(root);assert.equal(root.actors.huang.state.resourcePerceptionQueue.length,1);
 const view=mapView(root,'player');assert.equal(view.actors.some(x=>x.id==='huang'),false);
 root.round=3;perception.advancePerception(root.actors.huang.state,{root,combat:true});root.actors.huang.position=[8,9];
 assert.deepEqual(mapView(root,'player').historicalObservations[0].information.position,[2,3]);
 assert.equal(canObserve(root,root.actors.huang,'player'),false);
 root.map.darkness=false;assert.equal(canObserve(root,root.actors.huang,'player'),true);
});
test('sensory protection uses actual source grade and stage-three outcome, while suppression preserves the source',()=>{
 const root=fixture();delete root.actors.huang.state.activeResourceEffects;
 root.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'actual/veil',grade:'D',level:2,mode:'sensory',scene:true}};
 const query={observerId:'player',targetId:'huang',sense:{source:'actual/vision',grade:'D',visual:true,rangeBand:'sensitive',contest:{source:'actual opposed check receipt',observer:{total:3},target:{total:2}}},information:{detected:true,position:[1,2],precision:'exact',identity:'secret'}};
 const blocked=perception.recordPerception(root,query);
 assert.equal(blocked.information.precision,'vague');assert.equal(blocked.information.identity,undefined);
 query.sense.rangeBand='vague';assert.equal(perception.recordPerception(root,query).information.detected,false);
 root.actors.huang.state.activeResourceEffects=[{id:'mark',sourceId:'actual/mark',remainingRounds:1,effects:[],suppression:{family:'antiDetection',maximumLevel:2}}];
 assert.equal(perception.recordPerception(root,query).information.precision,'exact');assert.ok(root.actors.huang.state.resourceCapabilities.veil);
 expireResourceEffects(root.actors.huang.state,{rounds:1});assert.equal(perception.recordPerception(root,query).information.detected,false);
});
test('suppression does not clear independent stronger protection, mundane hiding or physical line of sight',()=>{
 const root=fixture();root.actors={player:root.actors.player,huang:root.actors.huang};root.map={bounds:[0,0,20,20],features:[]};root.actors.player.position=[0,0];root.actors.huang.position=[2,3];
 root.actors.player.windSense=false;
 root.actors.player.senseSources={vision:{grade:'D',rangeBand:'sensitive',contest:{source:'actual check',observer:{total:3},target:{total:2}}}};
 root.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'veil',level:3,mode:'sensory',scene:true}};
 root.actors.huang.state.activeResourceEffects=[{id:'mark',sourceId:'mark',remainingRounds:1,effects:[],suppression:{family:'antiDetection',maximumLevel:2}}];
 assert.equal(canObserve(root,root.actors.huang,'player'),false);
 root.actors.huang.state.activeResourceEffects[0].suppression.maximumLevel=3;assert.equal(canObserve(root,root.actors.huang,'player'),true);
 root.actors.huang.hiddenFrom=['player'];assert.equal(canObserve(root,root.actors.huang,'player'),false);
});
test('actual guanlan sense publishes filtered detection information without retaining the pre-filter detection flag',async()=>{
 const {runKitMechanism}=await import('./gm_runtime/kit-runtime.mjs');const root=fixture();root.actors.player.state.guanlan={acquired:true,source:'actual acquisition'};
 root.actors.huang.state.activeResourceEffects=[];root.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'actual/veil',grade:'C',level:3,mode:'sensory',scene:true}};
 root.ruleScene={objects:{sense:{type:'kitResource',resourceId:'guanlan',source:'actual scene',plans:{use:{source:'actual target and check',distance:1,effectLine:true,operating:true,targetId:'huang',detection:{rangeBand:'vague',contest:{source:'actual waived concealment',concealmentWaived:true}}}}}}};
 const result=runKitMechanism(root,{actorId:'player',objectId:'sense',operation:'sense',part:'use'},{drawDice:()=>{throw Error('no extra roll');}});
 assert.equal(result.detected,false);assert.equal(result.precision,null);assert.equal(result.perception.information.detected,false);
});
test('adopted Q39 rejects low-grade penetration even when observing the protection energy itself',()=>{
 const root=fixture();root.actors.huang.state.activeResourceEffects=[];
 root.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'veil',grade:'D',level:2,mode:'sensory',scene:true}};
 const request={observerId:'player',targetId:'huang',sense:{source:'actual energy penetration',grade:'D',visual:true,mode:'penetration',subjectIsProtection:true,rangeBand:'sensitive',contest:{source:'actual contest',observer:{total:4},target:{total:2}}},information:{detected:true,precision:'exact',position:[1,2],energy:'spell-maintenance'}};
 assert.equal(perception.recordPerception(root,request).information.detected,false);
 request.sense.grade='C';assert.equal(perception.recordPerception(root,request).information.detected,true);
});
test('adopted Q40 allows low-tier mental concealment to be vaguely located through a won contest but never by detector grade alone',()=>{
 const root=fixture();root.actors.huang.state.activeResourceEffects=[];
 root.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'mental veil',grade:'D',level:2,mode:'mental',scene:true}};
 const request={observerId:'player',targetId:'huang',sense:{source:'actual vision',grade:'A',visual:true,rangeBand:'sensitive',contest:{source:'actual contest',observer:{total:4},target:{total:2}}},information:{detected:true,precision:'exact',position:[1,2],identity:'not revealed'}};
 const out=perception.recordPerception(root,request);assert.equal(out.information.precision,'vague');assert.equal(out.information.identity,undefined);
 request.sense.contest.observer.total=1;assert.equal(perception.recordPerception(root,request).information.detected,false);
 request.sense.contest.observer.total=4;request.sense.rangeBand='vague';assert.equal(perception.recordPerception(root,request).information.detected,false);
});
test('mental B automatic concealment, sufficient mind immunity and independent sensory layers use actual source levels',()=>{
 const root=fixture();root.actors.huang.state.activeResourceEffects=[];
 root.actors.huang.state.resourceCapabilities={mind:{id:'antiDetection',source:'mental veil',grade:'B',level:3,mode:'mental',scene:true}};
 const request={observerId:'player',targetId:'huang',sense:{source:'vision',grade:'C',visual:true,rangeBand:'sensitive',contest:{source:'actual contest',observer:{total:20},target:{total:1}}},information:{detected:true,precision:'exact'}};
 assert.equal(perception.recordPerception(root,request).information.detected,false);
 request.sense.grade='B';assert.equal(perception.recordPerception(root,request).information.precision,'vague');
 root.actors.player.state.resourceCapabilities={immune:{id:'mindImmunity',level:2}};assert.equal(perception.recordPerception(root,request).information.precision,'vague');
 root.actors.player.state.resourceCapabilities.immune.level=3;assert.equal(perception.recordPerception(root,request).information.precision,'exact');
 root.actors.huang.state.resourceCapabilities.sensory={id:'antiDetection',source:'physical veil',level:4,mode:'sensory',scene:true};assert.equal(perception.recordPerception(root,request).information.precision,'vague');
});
test('registered passive perception rolls actual skills once per round, survives reload and feeds the map consumer',async()=>{
 const {reduceRuleAction}=await import('./gm_runtime/rule-actions.mjs');const root=fixture();root.actors.huang.state.activeResourceEffects=[];
 root.ruleScene={spatial:{source:'actual encounter',map:{bounds:[0,0,20,20],features:[]},actors:{player:{position:[0,0]},huang:{position:[1,0]}}},events:{look:{type:'passivePerception',source:'actual perception interval',actorIds:['player'],targetId:'huang',senseSource:'vision'},again:{type:'passivePerception',source:'same interval',actorIds:['player'],targetId:'huang',senseSource:'vision'}}};
 root.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'veil',level:2,mode:'sensory',scene:true}};
 let draws=0;const dice=()=>{draws++;return Array(200).fill(draws===1?8:1);};
 let out=reduceRuleAction(root,{kind:'rule',action:'status_event',actorId:'player',eventId:'look'},{drawDice:dice});
 assert.equal(draws,2);assert.equal(out.result.information.precision,'vague');assert.equal(out.result.contest.observer.eligible,true);
 out=reduceRuleAction(JSON.parse(JSON.stringify(out)),{kind:'rule',action:'status_event',actorId:'player',eventId:'again'},{drawDice:()=>{throw Error('same interval must not reroll');}});
 assert.equal(out.result.reused,true);assert.equal(out.result.information.precision,'vague');
 const b={...out,round:1,map:out.ruleScene.spatial.map};b.actors.player.position=[0,0];b.actors.huang.position=[1,0];b.actors.player.windSense=false;
 resolvePerceptionEvent(b,'player',observationEvent,{combat:true,drawDice:()=>Array(200).fill(8)});
 assert.equal(canObserve(b,b.actors.huang,'player'),false);
});
import {resolvePerceptionEvent} from './resource-observation.mjs';
function observationBattle(){const b=fixture();b.actors.huang.state.activeResourceEffects=[];b.map={features:[]};b.actors.player.position=[0,0];b.actors.huang.position=[1,0];b.actors.player.windSense=false;return b;}
const observationEvent={source:'actual observation',targetId:'huang',senseSource:'vision'};
test('map respects registered sensory source and maximum range; expired nonmaximum contest needs a new event',()=>{
 const b=observationBattle();b.actors.player.senseSources={vision:{source:'actual detector',grade:'D',sensitiveRange:3,vagueRange:6}};
 b.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'veil',level:2,mode:'sensory',scene:true}};
 resolvePerceptionEvent(b,'player',{...observationEvent,concealmentWaived:true},{combat:true,drawDice:()=>Array(200).fill(8)});
 assert.equal(canObserve(b,b.actors.huang,'player'),false);
 b.actors.huang.position=[8,0];assert.equal(canObserve(b,b.actors.huang,'player'),false);
 b.actors.huang.position=[1,0];b.round++;
 assert.equal(canObserve(b,b.actors.huang,'player'),false); // highest possible vague persists, never grants exact
 const c=observationBattle();let calls=0;
 resolvePerceptionEvent(c,'player',observationEvent,{combat:true,drawDice:()=>Array(200).fill(++calls===1?1:8)});
 c.round++;
 assert.throws(()=>canObserve(c,c.actors.huang,'player'),e=>e.code==='NEEDS_INPUT'&&e.field==='perception.contest');
});
test('passive perception retains maximum location across rounds and retries after a drop, with each higher grade triggering once per scene',()=>{
 const b=observationBattle();b.actors.player.senseSources={vision:{source:'detector',grade:'D',sensitiveRange:10,vagueRange:20}};
 resolvePerceptionEvent(b,'player',{...observationEvent,concealmentWaived:true},{combat:true,drawDice:()=>Array(200).fill(8)});
 b.round++;
 assert.equal(resolvePerceptionEvent(b,'player',observationEvent,{combat:true,drawDice:()=>{throw Error('maximum location must persist');}}).reused,true);
 b.actors.player.senseSources.vision.grade='C';let calls=0;
 assert.equal(resolvePerceptionEvent(b,'player',observationEvent,{combat:true,drawDice:()=>{calls++;return Array(200).fill(8);}}).reused,false);assert.equal(calls,2);
 b.actors.player.senseSources.vision.grade='D';resolvePerceptionEvent(b,'player',observationEvent,{combat:true,drawDice:()=>{throw Error('same round');}});
 b.actors.player.senseSources.vision.grade='C';assert.equal(resolvePerceptionEvent(b,'player',observationEvent,{combat:true,drawDice:()=>{throw Error('grade already seen');}}).reused,true);
 b.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'new protection',level:3,mode:'sensory',scene:true}};b.round++;
 calls=0;assert.equal(resolvePerceptionEvent(b,'player',observationEvent,{combat:true,drawDice:()=>{calls++;return Array(200).fill(8);}}).reused,false);assert.equal(calls,2);
 expireResourceEffects(b.actors.player.state,{scene:true});assert.equal(b.actors.player.state.resourceDetectionContests,undefined);
});
test('combat passive perception uses the registered event without spending actions; blocked sight breaks maximum retention',async()=>{
 const {createOpeningEncounter}=await import('./combat/opening.mjs');const {act}=await import('./combat/engine.mjs');
 let b=createOpeningEncounter({id:'actual-sensing',participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.map={features:[]};b.activeId='huang';
 b.ruleScene={events:{look:{...observationEvent,type:'passivePerception',actorIds:['player'],concealmentWaived:true}}};
 const before=structuredClone(b.actors.player.state.turn);
 const out=act(b,{actorId:'player',abilityId:'statusEvent',eventId:'look'},{playerAuthorized:true,drawDice:()=>Array(200).fill(8)});b=out.battle;
 assert.equal(out.result.statusEvent.information.precision,'exact');assert.deepEqual(b.actors.player.state.turn,before);
 b.map.darkness=true;resolvePerceptionEvent(b,'player',observationEvent,{combat:true,drawDice:()=>{throw Error('dark');}});
 b.round++;b.map.darkness=false;let calls=0;
 assert.equal(resolvePerceptionEvent(b,'player',observationEvent,{combat:true,drawDice:()=>{calls++;return Array(200).fill(8);}}).reused,false);assert.equal(calls,2);
});
test('combat history cannot turn a protected movement path into observed identity or exact position',async()=>{
 const {createDuel}=await import('./combat/catalog.mjs');const {resolveStep}=await import('./combat/transitions.mjs');
 let b=createDuel();b.reactionWindows=false;b.map={features:[]};b.actors.huang.position=[0,0];b.actors.jiang.position=[0,5];
 b.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'actual veil',level:2,mode:'sensory',scene:true}};
 b.actors.jiang.senseSources={vision:{source:'vision',grade:'none',rangeBand:'sensitive',contest:{source:'actual contest',observer:{total:0},target:{total:10}}}};
 b=resolveStep(b,{actorId:'huang',abilityId:'move',to:[2,0]},{drawDice:()=>Array(200).fill(1)}).battle;
 assert.equal(b.knowledge?.jiang?.huang,undefined);
});
test('registered combat perception can be resolved through the runtime transition even without a previous receipt',async()=>{
 const {createOpeningEncounter}=await import('./combat/opening.mjs');const {resolveStep}=await import('./combat/transitions.mjs');
 const b=createOpeningEncounter({id:'real-transition',participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.map={features:[]};b.activeId='huang';b.reactionWindows=false;
 b.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'veil',level:2,mode:'sensory',scene:true}};
 b.ruleScene={events:{look:{...observationEvent,type:'passivePerception',actorIds:['player'],concealmentWaived:true}}};
 const out=resolveStep(b,{actorId:'player',abilityId:'statusEvent',eventId:'look'},{playerAuthorized:true,drawDice:()=>Array(200).fill(8)});
 assert.equal(out.result.statusEvent.information.precision,'vague');assert.equal(out.battle.knowledge?.player?.huang,undefined);
});
test('declarative attack defense conditions distinguish vague from absent location and take the highest flat-footed level',async()=>{
 const {resolveDefense}=await import('./combat/engine.mjs');const b=observationBattle();b.playerDefenseDeclarations=false;
 const attacker=b.actors.huang,defender=b.actors.player;defender.senseSources={vision:{source:'actual visual',grade:'none',rangeBand:'sensitive',contest:{source:'actual opposed check',observer:{total:3},target:{total:2}}}};
 attacker.state.resourceCapabilities={veil:{id:'antiDetection',source:'veil',level:2,mode:'sensory',scene:true}};
 attacker.state.activeResourceEffects=[{id:'unseen',sourceId:'actual effect',grade:'C',scene:true,effects:[{stat:'flatFootedLevel',value:2,when:{test:'eq',left:{context:'defenderLocation'},right:'none'}}]}];
 const vague=resolveDefense(b,'player','huang');assert.equal(vague.parts.base,0);assert.equal(vague.flatFooted.level,0);assert.deepEqual(vague.flatFooted.sources,[]); // ordinary invisibility, not the conditional graded effect
 defender.senseSources.vision.contest.observer.total=0;
 const unseen=resolveDefense(b,'player','huang');assert.equal(unseen.parts.base,0);assert.equal(unseen.flatFooted.level,2);assert.equal(unseen.flatFooted.sources[0].source,'actual effect');
 defender.state.resourceCapabilities={immune:{id:'flatFootedImmunity',level:1}};assert.equal(resolveDefense(b,'player','huang').parts.base,0);
 defender.state.resourceCapabilities.immune.level=2;assert.ok(resolveDefense(b,'player','huang').parts.base>0);
 attacker.state.activeResourceEffects.push({...structuredClone(attacker.state.activeResourceEffects[0]),id:'second',sourceId:'second effect'});
 assert.equal(resolveDefense(b,'player','huang').flatFooted.level,2);
 assert.equal(resolveDefense(b,'player','huang',{flatFootedLevel:3}).flatFooted.level,3);
});
test('anti-detection bonus does not raise the originating mental effect grade for immunity or the B-tier exception',()=>{
 const root=fixture();root.actors.huang.state.activeResourceEffects=[];
 root.actors.huang.state.resourceCapabilities={veil:{id:'antiDetection',source:'actual C spell',grade:'C',gradeBonus:1,level:3,mode:'mental',scene:true}};
 const request={observerId:'player',targetId:'huang',sense:{source:'actual detector',grade:'D',visual:true,rangeBand:'sensitive',contest:{source:'actual contest',observer:{total:4},target:{total:2}}},information:{detected:true,precision:'exact'}};
 assert.equal(perception.recordPerception(root,request).information.precision,'vague');
 root.actors.player.state.resourceCapabilities={immune:{id:'mindImmunity',level:2}};
 assert.equal(perception.recordPerception(root,request).information.precision,'exact');
 root.actors.huang.state.resourceCapabilities.veil.mentalGradeBonus=1;
 assert.equal(perception.recordPerception(root,request).information.detected,false);
 root.actors.player.state.resourceCapabilities.immune.level=3;assert.equal(perception.recordPerception(root,request).information.precision,'exact');
});
