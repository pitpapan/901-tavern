import test from 'node:test';
import assert from 'node:assert/strict';
import {createDuel,createEncounter} from './catalog.mjs';
import {publicScene} from './presentation.mjs';
import {act,panel,stateResult} from './engine.mjs';
import {createCombatRuntime,inspectCommands,chooseAction,decisionContext} from './runtime.mjs';
import {resolveStep} from './transitions.mjs';
import {beginTurn} from '../core.mjs';
import {normalizeMap,measurePath,routeTo,mapView,generateBattleMap} from './map.mjs';
import {movementPurpose,tacticalInspection} from './tactics.mjs';
import {mapSvg,previewSelection} from '../gm_runtime/map-ui.mjs';

const layout={title:'石柱练习场',bounds:[-10,-15,80,40],features:[{id:'pillar',label:'石柱',kind:'obstacle',rect:[4,-1,2,2],blocksSight:false},
  {id:'mud',label:'泥地',kind:'difficult',rect:[0,4,8,2]}]};
function battle(){const b=createDuel();b.map=normalizeMap(layout,b);return b;}
test('same geometry rejects wall crossing and attacks, accepts explicit detour, and charges difficult ground',()=>{
  const b=battle();b.actors.huang.position=[0,0];b.actors.jiang.position=[8,0];
  const before=structuredClone(b);
  assert.throws(()=>act(b,{actorId:'huang',abilityId:'move',to:[8,0]}),/障碍/);assert.deepEqual(b,before);
  const route=routeTo(b.map,[0,0],[8,0]);assert.ok(route.length>1);
  const out=act(b,{actorId:'huang',abilityId:'move',to:route.at(-1),via:route.slice(0,-1)});
  assert.deepEqual(out.battle.actors.huang.position,[8,0]);assert.equal(out.battle.actors.huang.state.turn.move,0);
  assert.ok(out.result.movement.length>8);
  assert.equal(measurePath(b.map,[0,5],[10,5]).cost,18);
  b.actors.huang.reach=20;b.actors.huang.sheathed=false;
  assert.throws(()=>act(b,{actorId:'huang',abilityId:'strike',targetId:'jiang'}),/实体障碍/);
});
test('map projection and SVG have no hidden actors, hidden landmarks or character statistics; clicks only produce drafts',()=>{
  const b=battle();b.actors.huang.state.health.intact=12;b.actors.jiang.hiddenFrom=['huang'];
  b.map.features.push({id:'secret',label:'秘密通道',kind:'landmark',rect:[20,20,1,1],hiddenFrom:['huang']});
  const view=mapView(b,'huang'),text=JSON.stringify(view)+mapSvg(view);
  assert.doesNotMatch(text,/姜子尤|秘密通道|health|energy|defense|attributes|\bDP\b/);
  const before=structuredClone(b);const preview=previewSelection(view,[2,0],23);
  assert.equal(preview.valid,true);assert.match(preview.draft,/不结束本回合/);assert.deepEqual(b,before);
});
test('map generation uses scene and positions once, not private panels',async()=>{
  const b=battle();let request;
  const out=await generateBattleMap(b,async r=>{request=r;return JSON.stringify({...layout,features:[...layout.features,{id:'actor-duplicate',label:b.actors.jiang.name,kind:'landmark',rect:[1,0,1,1]}]});});
  assert.equal(out.title,layout.title);assert.equal(out.features.length,layout.features.length);assert.doesNotMatch(request.user_input,/health|energy|attributes|skills/);
  assert.throws(()=>normalizeMap({...layout,features:[{id:'bad',kind:'obstacle',rect:[-1,-1,3,3]}]},b),/嵌入/);
});
test('close melee has no purposeless retreat, remembers preparation and pressure, while injured withdrawal remains possible',async()=>{
  let b=battle();b.activeId='jiang';b.actors.jiang.state.turn={...b.actors.huang.state.turn};
  b=act(b,{actorId:'jiang',abilityId:'fistQi'}).battle;
  assert.equal(b.actors.jiang.tactics.intent,'prepare');
  const choices=tacticalInspection(b,inspectCommands(b));
  assert.ok(!choices.options.some(o=>['move','step'].includes(o.command.abilityId)));
  let sent;const result=await chooseAction({read:()=>({battle:b,revision:2})},async r=>{sent=JSON.parse(r.user_input);return JSON.stringify({option:sent.legalOptions.findIndex(o=>o.abilityId==='strike')});});
  assert.equal(result.command.abilityId,'strike');assert.equal(sent.tactics.recent.at(-1).action,'fistQi');
  b.actors.jiang.state.health.intact=10;b.actors.jiang.state.health.L=25;
  const retreat={actorId:'jiang',abilityId:'step',to:[2.5,0]};assert.equal(movementPurpose(b,retreat).intent,'recover');
  b=act(b,retreat).battle;assert.equal(b.actors.jiang.tactics.intent,'recover');
  assert.equal(movementPurpose(b,{...retreat,to:[4,0]}).useful,false);
});
test('bow user with an open shot does not approach melee, but can leave close interference',()=>{
  const b=createEncounter({id:'archer-position',scenario:'test',participants:['bright','jiang'],positions:{bright:[12,0],jiang:[0,0]},parameters:{bright:{ammunition:20}}});
  b.activeId='bright';b.actors.bright.state=beginTurn(b.actors.bright.state).state;b.actors.bright.loaded=true;
  assert.equal(movementPurpose(b,{actorId:'bright',abilityId:'move',to:[1.5,0]}).useful,false);
  const options=tacticalInspection(b,inspectCommands(b)).options;
  assert.ok(options.some(o=>o.command.abilityId==='strike'));
  assert.ok(!options.some(o=>o.preview.movement?.intent==='engage'));
  b.actors.bright.position=[1.5,0];
  assert.equal(movementPurpose(b,{actorId:'bright',abilityId:'move',to:[10,0]}).intent,'kite');
  b.actors.bright.position=[12,0];b.actors.bright.loaded=false;
  const unloaded=tacticalInspection(b,inspectCommands(b)).options;
  assert.ok(unloaded.some(o=>o.command.abilityId==='reload'));
  assert.ok(!unloaded.some(o=>o.preview.actions?.standard||o.command.abilityId==='end'));
});

test('narration locates each visible actor on its actual terrain and elevation',()=>{
  const b=createEncounter({id:'height-prose',scenario:'test',participants:['yulin','bright'],positions:{yulin:[10,2],bright:[0,0]},playerId:'yulin'});
  b.map=normalizeMap({title:'高台',bounds:[-2,-2,18,10],features:[{id:'platform',label:'东侧高台',kind:'zone',rect:[8,0,6,4],elevation:3}]},b);
  const root={battle:b,actors:Object.fromEntries(Object.entries(b.actors).map(([id,a])=>[id,{state:a.state}])),operations:{}};
  const scene=publicScene(root,{playerId:'yulin'});
  assert.deepEqual(scene.participants.find(x=>x.id==='yulin').terrain,{elevation:3,areas:['东侧高台']});
  assert.deepEqual(scene.participants.find(x=>x.id==='bright').terrain,{elevation:0,areas:[]});
});

test('MVU map initialization and a confirmed door change persist once without changing actor state',async()=>{
  let data={stat_data:{}};const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}};
  const runtime=createCombatRuntime({mvu,getAnchor:()=>({chatId:'map-test',messageId:0,swipeId:0}),expectedChatId:'map-test'});
  const b=createDuel();await runtime.initialize(b);const initial=runtime.read();
  const map=normalizeMap({...layout,features:[...layout.features,{id:'door',kind:'door',label:'门',rect:[12,3,1,2],open:false}]},b);
  const command={operationId:'map',expectedRevision:initial.revision,map};await runtime.installMap(command);
  const after=runtime.read();assert.deepEqual(after.battle.actors,initial.battle.actors);
  const replay=await runtime.installMap(command);assert.equal(replay.status,'already_applied');
  await runtime.updateMap({operationId:'door-open',expectedRevision:after.revision,changes:[{id:'door',open:true}]});
  assert.equal(runtime.read().battle.map.features.at(-1).open,true);assert.deepEqual(runtime.read().battle.actors,initial.battle.actors);
});


test('moving behind an opaque obstacle preserves the observed departure but conceals the final position',()=>{
  const b=battle();b.map.features[0].blocksSight=true;b.activeId='jiang';b.actors.jiang.state.turn={...b.actors.huang.state.turn};
  const start=stateResult(b,'huang','enter');
  const command={actorId:'jiang',abilityId:'move',via:[[3,-2],[7,-2]],to:[8,0]};
  const out=act(b,command,{drawDice:()=>Array(100).fill(1)});
  const root={battle:out.battle,actors:Object.fromEntries(Object.entries(out.battle.actors).map(([id,a])=>[id,{state:a.state}])),operations:{
    before:{signature:JSON.stringify({actorId:'huang',abilityId:'enter'}),summary:{revision:1,result:start}},
    movement:{signature:JSON.stringify(command),summary:{revision:2,result:out.result}}},revision:2};
  const facts=publicScene(root,{afterRevision:1,playerId:'huang'});
  assert.equal(facts.events.length,1);assert.match(facts.events[0].outcome,/离开视线/);assert.equal(facts.events[0].distanceToPlayer,undefined);
  assert.ok(!facts.participants.some(a=>a.id==='jiang'));assert.ok(!mapView(out.battle,'huang').actors.some(a=>a.id==='jiang'));
});


test('approach retains the attack action and excludes a worse partial sidestep or premature block',()=>{
  const b=battle();b.activeId='jiang';b.actors.huang.position=[0,0];b.actors.jiang.position=[2.5,-1];b.actors.jiang.state.turn={...b.actors.huang.state.turn};
  b.actors.jiang.tactics={intent:'engage',recent:[{round:b.round-1,action:'step',intent:'engage'}]};
  const choices=tacticalInspection(b,inspectCommands(b)).options;
  assert.ok(!choices.some(o=>o.command.abilityId==='block'));
  assert.ok(!choices.some(o=>o.command.abilityId==='end'));
  const moves=choices.filter(o=>o.preview.movement?.intent==='engage');assert.ok(moves.length);
  assert.ok(moves.every(o=>o.preview.movement.inMeleeAfter&&!o.preview.actions?.standard));
  const out=act(b,moves[0].command);assert.equal(out.battle.actors.jiang.state.turn.standard,1);
  assert.ok(inspectCommands(out.battle).options.some(o=>o.command.abilityId==='strike'));
});

test('preparation-only prose explicitly carries no attack or contact',()=>{
  let b=battle();b.activeId='jiang';b.actors.jiang.state.turn={...b.actors.huang.state.turn};
  const out=act(b,{actorId:'jiang',abilityId:'breakBody'});
  const root={battle:out.battle,actors:Object.fromEntries(Object.entries(out.battle.actors).map(([id,a])=>[id,{state:a.state}])),
    operations:{prep:{signature:JSON.stringify({actorId:'jiang',abilityId:'breakBody'}),summary:{revision:1,result:out.result}}},revision:1};
  const facts=publicScene(root,{playerId:'huang'});
  assert.match(facts.interaction,/未发生攻击或挡接/);
  assert.match(facts.events[0].outcome,/准备/);
});

test('irregular terrain shares collision, path cost and visibility with the grid renderer',()=>{
  const b=battle();b.actors.huang.position=[0,0];b.actors.jiang.position=[8,0];
  b.map=normalizeMap({title:'不规则地形',bounds:[-2,-3,20,15],ground:'grass',gridSize:1.5,features:[
    {id:'cliff',label:'山壁',kind:'obstacle',surface:'rock',points:[[4,-1],[7,0],[4,1]],blocksSight:true},
    {id:'mud',label:'泥坡',kind:'difficult',surface:'rubble',points:[[0,4],[8,4],[0,8]]},
  ]},b);
  assert.equal(measurePath(b.map,[0,0],[8,0]).valid,false);
  const path=routeTo(b.map,[0,0],[8,0]);assert.ok(path?.length>1);assert.equal(measurePath(b.map,[0,0],[8,0],path.slice(0,-1)).valid,true);
  assert.equal(measurePath(b.map,[0,5],[10,5]).cost,16);
  assert.equal(mapView(b,'huang').actors.length,1);
  const svg=mapSvg(mapView(b,'huang'));assert.match(svg,/<polygon/);assert.match(svg,/map-grid/);assert.match(svg,/map-rock/);assert.doesNotMatch(svg,/姜子尤/);
  b.map.features[0].kind='zone';assert.equal(measurePath(b.map,[0,0],[8,0]).valid,true);assert.equal(mapView(b,'huang').actors.length,1);
});

test('a lost target leaves only a last visible position to investigate, not hidden actions or its new location',()=>{
  let b=battle();b.reactionWindows=false;b.actors.huang.position=[0,0];b.actors.jiang.position=[0,5];
  b.map=normalizeMap({bounds:[-5,-5,30,20],features:[{id:'wall',label:'山壁',kind:'obstacle',rect:[4,-1,2,4],blocksSight:true}]},b);
  b=resolveStep(b,{actorId:'huang',abilityId:'move',via:[[3,4],[7,4]],to:[8,0]}).battle;
  const seen=b.knowledge.jiang.huang.lastSeen;
  assert.ok(seen);assert.notDeepEqual(seen.position,[8,0]);
  b.activeId='jiang';b.actors.jiang.state=beginTurn(b.actors.jiang.state).state;
  let choices=tacticalInspection(b,inspectCommands(b));
  assert.ok(choices.options.some(o=>o.preview.movement?.intent==='search'));
  assert.ok(!choices.options.some(o=>o.command.targetId==='huang'));
  const ctx=decisionContext(b,1,choices);assert.ok(!ctx.participants.some(a=>a.id==='huang'));
  assert.deepEqual(ctx.lastSeen[0].position,seen.position);
  const before=structuredClone(seen);
  b.activeId='huang';b.actors.huang.state=beginTurn(b.actors.huang.state).state;
  b=resolveStep(b,{actorId:'huang',abilityId:'draw'}).battle;
  assert.ok(!b.knowledge.jiang.huang.abilities.includes('draw'));
  assert.deepEqual(b.knowledge.jiang.huang.lastSeen,before);
});

test('opaque forest prevents targeting and direct magic cannot pass through a visible low wall',()=>{
  const b=createEncounter({id:'terrain-targeting',scenario:'test',participants:['bright','jiang'],positions:{bright:[0,0],jiang:[8,0]},parameters:{bright:{ammunition:20}}});
  b.map=normalizeMap({bounds:[-2,-4,20,12],features:[{id:'forest',kind:'zone',surface:'forest',rect:[3,-2,2,4],blocksSight:true}]},b);
  b.actors.bright.loaded=true;
  assert.throws(()=>act(b,{actorId:'bright',abilityId:'strike',targetId:'jiang'}),/视线/);
  b.map.features[0].kind='obstacle';b.map.features[0].blocksSight=false;
  assert.throws(()=>act(b,{actorId:'bright',abilityId:'timeBolt',targetId:'jiang'}),/障碍/);
});
