import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster,createOpeningEncounter} from './combat/opening.mjs';
import {reduceRuleAction} from './gm_runtime/rule-actions.mjs';
import {RESOURCE_CATALOG} from './resource-catalog.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {clearLine,canObserve} from './combat/map.mjs';
import {schedulePassivePerception} from './resource-perception-scheduler.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';
const dice=()=>Array(512).fill(8),source='actual fog trial';
function cast(mode='masked',grade='D'){
 const id=Object.values(RESOURCE_CATALOG).find(x=>x.name==='幻雾术').id;assert.ok(RESOURCE_DEFINITIONS[id].programs?.cast);
 const actors=createOpeningRoster(),s=actors.player.state;s.casting={imperial:{grade,pool:'test'}};s.resources.test={current:20,max:20};s.learnedResources={[id]:{learned:true,grade,source}};s.skills.神秘={level:3,subs:{幻术:{level:1},咒法:{level:1}}};
 const plan={source,targetIds:['player'],inputs:{fogMode:mode},components:{posture:true,language:true,focus:true}};
 const root={actors,ruleScene:{objects:{fog:{source,type:'kitResource',resourceId:id,actorIds:['player'],plans:{use:plan}}}}};
 return reduceRuleAction(root,{kind:'rule',action:'mechanism',actorId:'player',objectId:'fog',operation:'cast',part:'use'},{drawDice:dice});
}
function battle(mode='masked'){
 const b=createOpeningEncounter({id:'fog',participants:['player','huang','jiang'],positions:{player:[0,0],huang:[1,0],jiang:[2,0]}});
 b.map={features:[]};b.actors.player.state=cast(mode).actors.player.state;b.actors.player.windSense=false;return b;
}
const field=b=>b.actors.player.state.activeResourceEffects.find(x=>x.obscuration);
test('fog D/C installs a sourced moving visual field with declared mode and actual radius, without actors or T0 grants',()=>{
 for(const grade of ['D','C']){const root=cast('masked',grade),s=root.actors.player.state,e=s.activeResourceEffects.find(x=>x.obscuration);
  assert.equal(e.obscuration.radius,5*s.attributes.智力*(grade==='D'?3:6));assert.equal(e.obscuration.mask,'visualIllusion');assert.equal(s.resources.test.current,grade==='D'?19:17);
  assert.equal(Object.keys(root.actors).length,Object.keys(createOpeningRoster()).length);assert.equal(s.health.temp,0);
 }
 assert.equal(createOpeningRoster().player.state.activeResourceEffects,undefined);
});
test('masked fog is transparent to ordinary sight but blocks the actual visual detector, never effect or movement lines',()=>{
 const b=battle();assert.equal(canObserve(b,b.actors.jiang,'huang'),true);
 b.actors.huang.senseSources={vision:{source:'actual D sight',grade:'D',visual:true,sensitiveRange:30,vagueRange:50}};
 assert.equal(canObserve(b,b.actors.jiang,'huang'),false);assert.equal(canObserve(b,b.actors.jiang,'player'),true);
 assert.equal(clearLine(b.map,[1,0],[2,0],{root:b,observerId:'huang'}),true);
 assert.equal(clearLine(b.map,[1,0],[2,0],{movement:true,root:b,observerId:'huang'}),true);
});
test('unmasked fog blocks ordinary sight, follows the current bearer in 3D, and expiry restores line of sight',()=>{
 const b=battle('ordinary');assert.equal(canObserve(b,b.actors.jiang,'huang'),false);
 b.actors.player.position=[0,0,200];assert.equal(canObserve(b,b.actors.jiang,'huang'),true);
 b.actors.player.position=[0,0];assert.equal(canObserve(b,b.actors.jiang,'huang'),false);
 expireResourceEffects(b.actors.player.state,{scene:true});assert.equal(canObserve(b,b.actors.jiang,'huang'),true);
});
test('detecting the fog mask is saved per actual instance; losing detection never hides that old physical fog again',()=>{
 let b=battle();b.actors.huang.senseSources={vision:{source:'temporary D sight',grade:'D',visual:true,sensitiveRange:30,vagueRange:50}};
 schedulePassivePerception(b,{drawDice:dice});b=JSON.parse(JSON.stringify(b));delete b.actors.huang.senseSources;
 assert.equal(canObserve(b,b.actors.jiang,'huang'),false);assert.ok(field(b).obscuration.disbelievedBy.huang);
});
test('visual fog does not block an actual nonvisual locating sense or create physical cover',()=>{
 const b=battle('ordinary');b.actors.huang.windSense=true;b.actors.huang.visionAvailable=false;
 assert.equal(canObserve(b,b.actors.jiang,'huang'),true);
 assert.equal(clearLine(b.map,[1,0],[2,0]),true);
});
test('the moving field respects its physical effect line and does not fill a sealed adjacent room through a wall',()=>{
 const b=battle('ordinary');b.map.features=[{id:'wall',kind:'obstacle',rect:[.4,-10,.2,20],blocksSight:true}];
 assert.equal(canObserve(b,b.actors.jiang,'huang'),true);
});
test('actual weapon targeting uses the same observer-dependent fog qualification',async()=>{
 const {act}=await import('./combat/engine.mjs');const b=battle();b.activeId='huang';b.actors.huang.sheathed=false;b.playerDefenseDeclarations=false;b.reactionWindows=false;
 b.actors.huang.state.turn={phase:'active',standard:1,move:1,swift:1};
 assert.ok(act(b,{actorId:'huang',abilityId:'strike',targetId:'jiang'},{drawDice:dice}).result.attack);
 b.actors.huang.senseSources={vision:{source:'actual D sight',grade:'D',visual:true,sensitiveRange:30,vagueRange:50}};
 const before=structuredClone(b);let draws=0;assert.throws(()=>act(b,{actorId:'huang',abilityId:'strike',targetId:'jiang'},{drawDice:()=>{draws++;return dice();}}),/视线/);
 assert.equal(draws,0);assert.deepEqual(b,before);
});
test('field sensory resolution uses the actual spatial registry and cannot keep an old precise receipt through new fog',async()=>{
 const {resolvePerceptionEvent}=await import('./resource-observation.mjs');const b=battle('ordinary');
 const root={actors:b.actors,ruleScene:{spatial:{source:'actual field position',map:b.map,actors:Object.fromEntries(Object.entries(b.actors).map(([id,a])=>[id,{position:a.position}]))}}};
 const e={type:'passivePerception',source:'actual look',targetId:'jiang',senseSource:'vision',concealmentWaived:true};let draws=0;
 const result=resolvePerceptionEvent(root,'huang',e,{drawDice:()=>{draws++;return dice();}});
 assert.equal(result.blocked,'line-of-sight');assert.equal(result.information.detected,false);assert.equal(draws,0);
});
