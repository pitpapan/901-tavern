import test from 'node:test';
import assert from 'node:assert/strict';
import {createDuel} from './catalog.mjs';
import {normalizeMap,clearLine,measurePath,routeTo,mapView} from './map.mjs';
import {act,resolveDefense} from './engine.mjs';
import {createCombatRuntime} from './runtime.mjs';
import {publicScene} from './presentation.mjs';
import {mapSvg} from '../gm_runtime/map-art.mjs';
import {previewFeature} from '../gm_runtime/map-ui.mjs';

function scene(features=[]) {
  const b=createDuel();b.actors.huang.position=[0,0];b.actors.jiang.position=[8,0];b.actors.huang.sheathed=false;
  b.map=normalizeMap({title:'地图互动验收',bounds:[-5,-5,30,20],features},b);return b;
}
const wall={id:'wall',label:'矮墙',kind:'obstacle',rect:[3,-1,1,2],coverDegree:'partial',blocksSight:true, height:1};
test('directional cover changes declared defense without blocking sight or allowing movement through it',()=>{
  const b=scene([wall]);b.playerDefenseDeclarations=true;b.actors.jiang.controller='player';
  assert.equal(resolveDefense(b,'jiang','huang').pending,true);
  b.actors.jiang.defenseIntent={mode:'normal'};
  assert.equal(resolveDefense(b,'jiang','huang').parts.cover,4);
  assert.equal(clearLine(b.map,[0,0],[8,0]),true);
  assert.equal(clearLine(b.map,[0,0],[8,0],{sight:true}),true);
  assert.equal(measurePath(b.map,[0,0],[8,0]).valid,false);
  b.actors.huang.position=[8,3];assert.equal(resolveDefense(b,'jiang','huang').parts.cover,0);
});
test('elevation rejects cliff shortcuts, routes via a ramp and permits firing over a lower obstacle',()=>{
  const b=scene([{id:'ledge',label:'高台',kind:'zone',rect:[10,-4,10,12],elevation:4},
    {id:'ramp',label:'坡道',kind:'zone',rect:[6,3,4,2],ramp:{from:[6,4,0],to:[10,4,4]}},wall]);
  assert.equal(measurePath(b.map,[8,0],[12,0]).valid,false);
  const route=routeTo(b.map,[8,0],[12,0]);assert.ok(route);
  const path=measurePath(b.map,[8,0],[12,0],route.slice(0,-1));assert.equal(path.valid,true);assert.ok(path.cost>4);
  b.map.features.find(f=>f.id==='wall').height=2;b.map.features.find(f=>f.id==='wall').coverDegree=undefined;
  assert.equal(clearLine(b.map,[0,0],[8,0]),false);
  assert.equal(clearLine(b.map,[12,0],[0,0]),true);
  assert.match(mapSvg(mapView(b,'huang')),/高台.*4.*米/);
  b.actors.huang.position=[9,0];b.actors.huang.reach=4;b.actors.jiang.position=[12,0];
  assert.throws(()=>act(b,{actorId:'huang',abilityId:'strike',targetId:'jiang'}),/攻击范围/);
});
test('declared doors and object attacks write actions and geometry together, replay only once, and redact durability',async()=>{
  const b=scene([{id:'door',label:'木门',kind:'door',rect:[1,-1,.3,2],blocksSight:true,open:false,
    durability:{current:1,max:1,hardness:2,source:'验收专用薄木门，非通用材质公式'}}]);
  b.actors.huang.controller='player';
  let data={stat_data:{}};const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async v=>{data=structuredClone(v);}};
  const runtime=createCombatRuntime({mvu,getAnchor:()=>({chatId:'map-actions',messageId:0,swipeId:0}),expectedChatId:'map-actions',drawDice:()=>Array(1024).fill(8)});
  await runtime.initialize(b);
  await runtime.updateMap({operationId:'confirm-material',expectedRevision:runtime.read().revision,
    changes:[{id:'door',durability:{current:1,max:1,hardness:2,source:'验收专用参数'},locked:false}]});
  const preview=previewFeature(mapView(b,'huang'),[1.1,0]);
  assert.match(preview.drafts[0].text,/打开木门/);assert.match(preview.drafts[1].text,/攻击木门/);
  assert.equal(b.map.features[0].open,false);
  assert.throws(()=>act(b,{actorId:'huang',abilityId:'door',featureId:'door',open:true}),/玩家/);
  const dispatch=async(command,id)=>runtime.dispatch({command,operationId:id,expectedRevision:runtime.read().revision,playerAuthorized:true});
  const open={actorId:'huang',abilityId:'door',featureId:'door',open:true};
  await dispatch(open,'open');assert.equal(runtime.read().battle.map.features[0].open,true);
  assert.equal(runtime.read().battle.actors.huang.state.turn.move,0);
  const replay=await runtime.dispatch({command:open,operationId:'open',expectedRevision:1,playerAuthorized:true});assert.equal(replay.status,'already_applied');
  await dispatch({actorId:'huang',abilityId:'destroy',featureId:'door'},'break');
  const out=runtime.read();assert.equal(out.battle.map.features[0].destroyed,true);
  assert.equal(out.battle.actors.huang.state.turn.standard,0);
  assert.equal(measurePath(out.battle.map,[0,0],[2,0]).valid,true);
  const root=data.stat_data['901_rules_poc'];const facts=publicScene(root,{playerId:'huang'});
  assert.match(JSON.stringify(facts.events),/木门.*破坏/);
  assert.doesNotMatch(JSON.stringify(facts)+JSON.stringify(mapView(out.battle,'huang')),/hardness|durability|rolledSuccesses|actualDamage/);
  assert.equal(root.actors.huang.state.turn.standard,0);
});
test('locked doors, occupied closure and unparameterized destruction leave the original state intact',()=>{
  const b=scene([{id:'door',label:'锁门',kind:'door',rect:[1,-1,.3,2],open:false,locked:true}]);
  const before=structuredClone(b);
  assert.throws(()=>act(b,{actorId:'huang',abilityId:'door',featureId:'door',open:true}),/锁/);
  assert.throws(()=>act(b,{actorId:'huang',abilityId:'destroy',featureId:'door'}),/耐久/);
  assert.deepEqual(b,before);
  b.map.features[0].open=true;b.actors.jiang.position=[1.1,0];
  assert.throws(()=>act(b,{actorId:'huang',abilityId:'door',featureId:'door',open:false}),/占据/);
});
