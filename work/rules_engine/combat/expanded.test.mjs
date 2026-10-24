import test from 'node:test';
import assert from 'node:assert/strict';
import { createDuel, createEncounter, makeLotus } from './catalog.mjs';
import { attackProfile, panel, act } from './engine.mjs';
import { inspectCommands, decisionContext, createCombatRuntime, chooseAction, legalCommands } from './runtime.mjs';
import { resolveStep } from './transitions.mjs';
import { rollCombatPool, equipment, saveProfile } from './mechanics.mjs';
import {normalizeMap} from './map.mjs';

test('gale attacks each legal enemy once, excludes allies and shares geometry across previews and reaction queue',()=>{
  const b=createEncounter({id:'gale-allies',scenario:'狂岚友伤定向验证',participants:['yulin','huang','jiang','bright'],
    positions:{yulin:[0,0],huang:[1,0],jiang:[2,0],bright:[3,0]},teams:{yulin:'同伴',huang:'同伴',jiang:'敌人',bright:'敌人'}});
  activate(b,'yulin');b.actors.huang.sheathed=false;
  b.actors.blocked={...structuredClone(b.actors.jiang),id:'blocked',position:[0,8]};
  b.map=normalizeMap({bounds:[-4,-4,30,30],features:[{id:'wall',kind:'obstacle',rect:[-1,4,2,1],blocksSight:true}]},b);
  const command={actorId:'yulin',abilityId:'gale'};
  const option=inspectCommands(b).options.find(o=>o.command.abilityId==='gale'&&!o.command.resource);
  assert.deepEqual(option.preview.affected,['jiang','bright']);
  assert.deepEqual(option.preview.friendlyFire,[]);
  const context=decisionContext(b,0);assert.match(context.notes,/友军/);
  let calls=0;const actualDice=()=>{calls++;return Array(1024).fill(8);};
  let out=resolveStep(b,command,{drawDice:actualDice,playerAuthorized:true});
  assert.deepEqual(out.battle.pending.queue,['jiang','bright']);
  assert.equal(calls,0);assert.equal(out.battle.actors.yulin.state.resources.风池.current,10);
  out=resolveStep(out.battle,{actorId:'jiang',abilityId:'react',choice:'decline'},{drawDice:actualDice});
  assert.equal(out.battle.pending.awaiting,'bright');assert.equal(calls,0);
  out=resolveStep(out.battle,{actorId:'bright',abilityId:'react',choice:'decline'},{drawDice:actualDice});
  assert.equal(calls,2);
  assert.equal(out.battle.actors.yulin.state.resources.风池.current,9);
  assert.equal(out.battle.actors.yulin.state.turn.standard,0);
  assert.equal(out.battle.actors.yulin.state.turn.move,1);
  assert.deepEqual(out.result.responses,[{targetId:'jiang',guarded:false},{targetId:'bright',guarded:false}]);
  assert.deepEqual(out.battle.actors.yulin.state.health,b.actors.yulin.state.health);
  assert.deepEqual(out.battle.actors.huang.state.health,b.actors.huang.state.health);
  assert.deepEqual(out.battle.actors.blocked.state.health,b.actors.blocked.state.health);
  for(const id of ['jiang','bright']) {
    const damage=out.result.damage.filter(d=>d.targetId===id);
    assert.ok(damage.length>0);assert.ok(damage.reduce((n,d)=>n+d.actualDamage,0)<=attackProfile(b,'yulin',command).cap);
  }
});

test('resolved response reports the actual effective guard and normal player defense omits it',()=>{
  const b=createEncounter({id:'guard-response',scenario:'实际防御事实',participants:['huang','yulin'],positions:{huang:[0,0],yulin:[1,0]}});
  b.playerDefenseDeclarations=true;activate(b,'huang');b.actors.huang.sheathed=false;
  b.actors.yulin.buffs.block=true;
  const command={actorId:'huang',abilityId:'strike',targetId:'yulin'};
  const pending=act(b,command,{drawDice:dice,deferPlayerDefense:true});
  assert.equal(pending.result.responses,undefined);
  const normal=act(b,command,{drawDice:dice,defenseDeclarations:{yulin:'normal'}});
  assert.deepEqual(normal.result.responses,[{targetId:'yulin',guarded:false}]);
  const guarded=act(b,command,{drawDice:dice,defenseDeclarations:{yulin:'block'}});
  assert.deepEqual(guarded.result.responses,[{targetId:'yulin',guarded:true}]);
});

test('attack, defense and movement derive from current attributes, skills and equipment', () => {
  const b=createDuel();
  b.actors.jiang.state.attributes.力量=12;
  b.actors.jiang.state.skills.肉搏.subs.拳击.level=4;
  assert.equal(attackProfile(b,'jiang').dp,46);
  assert.equal(attackProfile(b,'jiang').cap,28);
  assert.equal(panel(b,'jiang').speed,42);
  b.actors.huang.state.attributes.感知=8;
  assert.equal(panel(b,'huang').defense.parts.base,8);
  b.actors.huang.equipment={weapon:{damage:10,attackBonus:4,blockBonus:4,ap:2,magic:0},armor:{defense:2}};
  assert.equal(attackProfile(b,'huang').dp,40);
  assert.equal(panel(b,'huang').defense.parts.armor,2);
});

const encounter=()=>createEncounter({id:'four-test',scenario:'四人配置测试，补参仅用于测试',
  participants:['huang','jiang','yulin','bright'],
  positions:{huang:[0,0],jiang:[1,0],yulin:[2,0],bright:[30,0]},
  parameters:{bright:{bowStrength:3,ammunition:20},huang:{weaponSize:4}}});
const dice=()=>Array(1024).fill(8);
const use=(b,id,abilityId,extra={})=>act(b,{actorId:id,abilityId,...extra},{drawDice:dice,playerAuthorized:true}).battle;
const activate=(b,id)=>{b.activeId=id;b.actors[id].state.turn={phase:'active',standard:1,move:1,swift:1};return b;};

test('confirmed bow requirement four and sword sizes three remain distinct from lotus size twelve',()=>{
  const b=createEncounter({id:'confirmed-parameters',scenario:'用户确认值',participants:['bright','huang','yulin']});
  assert.equal(attackProfile(b,'bright',{targetId:'huang'}).cap,26);
  const lotus=makeLotus(b.actors.huang);
  assert.equal(lotus.state.size,12);
  assert.equal(lotus.state.derived.hpMax,26);
  assert.equal(lotus.state.health.intact,26);
  b.actors.lotus=lotus;
  assert.equal(attackProfile(b,'lotus').dp,20);
  assert.equal(attackProfile(b,'lotus').cap,20);
  assert.equal(panel(b,'lotus').defense.total,10);
  assert.equal(panel(b,'lotus').speed,23);
  assert.equal(b.actors.huang.weaponSize,3);
  assert.equal(equipment(b.actors.yulin).weapon.size,3);
  assert.equal(equipment(b.actors.huang).weapon.damage,8);
  assert.equal(equipment(b.actors.huang).weapon.attackBonus,3);
  assert.equal(equipment(b.actors.bright).weapon.attackBonus,3);
  assert.equal(saveProfile(b.actors.huang,'will').dp,12);
  assert.equal(attackProfile(b,'huang',{abilityId:'cleaveRock'}).cap,16);
  const flowBattle=activate(structuredClone(b),'yulin'),before=attackProfile(flowBattle,'yulin').dp;
  const flowing=use(flowBattle,'yulin','flow',{tier:2});
  assert.equal(flowing.actors.yulin.state.resources.流风.current,20);
  assert.equal(flowing.actors.yulin.state.turn.standard,1);
  assert.equal(flowing.actors.yulin.state.turn.move,1);
  assert.equal(flowing.actors.yulin.state.turn.swift,1);
  assert.equal(attackProfile(flowing,'yulin').dp,before+1);
  const loaded=use(activate(structuredClone(b),'bright'),'bright','reload');
  const shot=use(loaded,'bright','strike',{targetId:'huang'});
  assert.equal(shot.actors.bright.ammunition,19);
});

test('four-person baselines and distinct weapon costs remain faithful to adopted cards',()=>{
  let b=encounter();
  assert.equal(panel(b,'yulin').attack.dp,61);
  assert.equal(panel(b,'yulin').defense.total,17);
  assert.equal(panel(b,'bright').defense.total,13);
  const playerBattle=activate(structuredClone(b),'yulin'),playerView=decisionContext(playerBattle,0);
  assert.match(playerView.abilities.block.text,/33格挡/);
  assert.doesNotMatch(playerView.abilities.block.text,/黄|姜/);
  const playerOptions=inspectCommands(playerBattle);
  assert.equal(playerOptions.options.find(x=>x.command.abilityId==='zheng').preview.after.defenseDP,54);
  assert.equal(attackProfile(b,'bright',{targetId:'jiang'}).dp,37);
  assert.equal(attackProfile(b,'bright',{targetId:'jiang'}).cap,25); // Test-only R=3.
  b=activate(b,'yulin');b=use(b,'yulin','zheng');
  assert.equal(panel(b,'yulin').defense.total,54);
  b=use(b,'yulin','tornado',{targetId:'huang'});
  assert.equal(b.actors.yulin.state.resources.风池.current,9);
  assert.equal(b.actors.yulin.state.turn.standard,0);
  b=activate(b,'bright');b=use(b,'bright','reload');
  b=use(b,'bright','strike',{targetId:'jiang'});
  assert.equal(b.actors.bright.ammunition,19);
  assert.equal(b.actors.bright.loaded,false);
  assert.equal(b.actors.bright.state.resources.导力.current,5);
  assert.equal(rollCombatPool(1,[9,8],9).rolledSuccesses,2);
});

test('special preview uses post-payment attack and reports missing parameters separately',()=>{
  let b=use(createDuel(),'huang','draw');
  const inspection=inspectCommands(b);
  const option=inspection.options.find(x=>x.command.abilityId==='thunder'&&x.command.payment==='restraint');
  assert.equal(option.preview.attack.dp,54);
  const out=act(b,option.command,{drawDice:dice});
  assert.equal(option.preview.attack.rollDP,out.result.attack.roll.dp);
  assert.deepEqual(option.preview.actions,{standard:1});
  b=encounter();activate(b,'bright');
  delete b.actors.bright.parameters.bowStrength;
  b.actors.bright.equipment={weapon:{damage:8,attackBonus:12,magic:8,strengthRequirement:null},armor:{defense:4}};
  assert.ok(inspectCommands(b).unavailable.some(x=>x.status==='NEEDS_INPUT'&&x.field==='bright.bowStrength'));
  b=activate(b,'huang'); b=use(b,'huang','draw'); b.actors.jiang.buffs.block=true; b.actors.huang.weaponSize=null;
  b.actors.huang.equipment={...equipment(b.actors.huang),weapon:{...equipment(b.actors.huang).weapon,size:null}};
  assert.ok(inspectCommands(b).unavailable.some(x=>x.field==='huang.weaponSize'));
  b.actors.huang.state.skills.白刃.level=99;
  assert.throws(()=>inspectCommands(b),/Main skill exceeds/,'programming/data errors must not be hidden as ordinary unavailable choices');
});

test('private enemy data and unrelated abilities are absent from model input',()=>{
  let b=use(createDuel(),'huang','draw');
  b.actors.jiang.state.resources.秘密资源={current:999,max:999};
  const c=decisionContext(b,2),enemy=c.participants.find(x=>x.id==='jiang');
  assert.equal(enemy.attributes,undefined);
  assert.equal(enemy.energy,undefined);
  assert.equal(enemy.health,undefined);
  assert.equal(c.abilities.fistQi,undefined);
  assert.ok(!JSON.stringify(c).includes('秘密资源'));
  assert.ok(c.previews.filter(x=>x.attack).every(x=>x.attack.rollDP===undefined));
  const acted=resolveStep(activate(b,'jiang'),{actorId:'jiang',abilityId:'fistQi'},{drawDice:dice}).battle;
  activate(acted,'huang');
  assert.ok(decisionContext(acted,3).participants.find(x=>x.id==='jiang').observedAbilities.includes('拳气'));
});

test('reaction survives MVU refresh, rolls only after choice, and replays without spending twice',async()=>{
  let data={stat_data:{world:{place:'测试'}}},rolls=0;
  const deps={mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async v=>{data=structuredClone(v);}},
    getAnchor:()=>({chatId:'reaction',messageId:0,swipeId:0}),expectedChatId:'reaction',
    drawDice:()=>{rolls++;return dice();}};
  let b=use(createDuel(),'huang','draw');b.reactionWindows=true;b.actors.jiang.controller='player';
  let r=createCombatRuntime(deps);await r.initialize(b);
  await r.dispatch({operationId:'declare',expectedRevision:0,command:{actorId:'huang',abilityId:'thunder',targetId:'jiang'}});
  assert.equal(rolls,0);
  assert.equal(r.read().battle.actors.huang.state.resources.灵力.current,6);
  r=createCombatRuntime(deps);
  assert.equal((await chooseAction(r,()=>{throw Error('must not choose player response');})).status,'awaiting_player');
  const command={actorId:'jiang',abilityId:'react',choice:'conversion'};
  const request={operationId:'respond',expectedRevision:1,command,playerAuthorized:true};
  await r.dispatch(request);
  const count=rolls;assert.ok(count>0);
  assert.equal(r.read().battle.pending,undefined);
  assert.equal(r.read().battle.actors.jiang.used.damageConversion,true);
  assert.equal(r.read().battle.actors.huang.state.resources.灵力.current,5);
  assert.equal((await r.dispatch(request)).status,'already_applied');
  assert.equal(rolls,count);
  assert.equal(data.stat_data.world.place,'测试');
});

test('four-person encounter completes with player choices, action costs and reaction windows',()=>{
  let b=encounter(),seed=83,steps=0;
  const drawDice=()=>Array.from({length:1024},()=>{seed=(1664525*seed+1013904223)>>>0;return seed%10+1;});
  while(b.status==='active'&&steps++<180) {
    const id=b.pending?.awaiting??b.activeId,a=b.actors[id], options=legalCommands(b);
    const priority=b.pending?['react']:a.kind==='huang'?['draw','block','thunder','strike','move','end']:
      a.kind==='jiang'?['fistQi','breakBody','block','strike','move','end']:
      a.kind==='yulin'?['zheng','tornado','strike','move','end']:['reload','strike','timeBolt','move','end'];
    const c=priority.map(key=>options.find(c=>c.abilityId===key&&!c.payment&&(!c.choice||c.choice==='conversion'))).find(Boolean);
    assert.ok(c,`${a.name} must have a valid choice`);
    b=resolveStep(b,c,{drawDice,playerAuthorized:a.controller==='player'}).battle;
  }
  assert.equal(b.status,'finished');
  for(const a of Object.values(b.actors)) {
    assert.equal(a.state.health.intact+a.state.health.B+a.state.health.L+a.state.health.A,a.state.derived.hpMax);
    assert.ok(Object.values(a.state.resources).every(p=>p.current>=0&&p.current<=p.max));
  }
});
