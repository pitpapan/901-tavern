import test from 'node:test';
import assert from 'node:assert/strict';
import { createEncounter } from './catalog.mjs';
import { createTavernCombat } from './tavern.mjs';
import { createCombatHost } from './host.mjs';
import { act, attackProfile } from './engine.mjs';
import { installCombatHost } from './host-ui.mjs';

const encounter=()=>createEncounter({id:'host-test',scenario:'测试补参，不代表原卡',
  participants:['huang','jiang','yulin','bright'],
  positions:{huang:[0,0],jiang:[1,0],yulin:[2,0],bright:[30,0]},
  parameters:{huang:{weaponSize:4},bright:{bowStrength:3,ammunition:20}}});

test('host waits for player, settles a whole encounter, returns to story and carries wounds into next encounter',async()=>{
  const floors=[{stat_data:{world:{place:'练武场'}}}];
  const tavern={chatId:'host-test',chat:[{mes:'演练',swipe_id:0}]};
  let seed=83,calls=0,choices=0,returned=0;
  const deps={tavern,expectedChatId:'host-test',battleFactory:encounter,
    mvu:{getMvuData:({message_id})=>structuredClone(floors[message_id]??{stat_data:{}}),
      replaceMvuData:async(value,{message_id})=>{floors[message_id]=structuredClone(value);}},
    drawDice:()=>Array.from({length:1024},()=>{seed=(1664525*seed+1013904223)>>>0;return seed%10+1;}),
    generateRaw:async request=>{
      calls++;const c=JSON.parse(request.user_input);
      const priority=c.phase==='reaction'?['react']:c.activeId==='huang'?['draw','block','thunder','strike','move','end']:
        c.activeId==='jiang'?['fistQi','breakBody','block','strike','move','end']:['reload','strike','timeBolt','move','end'];
      return JSON.stringify({option:priority.map(key=>c.legalOptions.findIndex(o=>o.abilityId===key&&!o.payment&&(!o.choice||o.choice==='conversion'))).find(i=>i>=0)});
    },
    createChatMessages:async messages=>{for(const m of messages){tavern.chat.push({mes:m.message,swipe_id:0});floors.push({stat_data:{world:{place:'练武场'}}});}},
  };
  let controller=createTavernCombat(deps);
  await controller.initialize();
  // Nonparticipants must survive every combat write.
  floors[0].stat_data['901_rules_poc'].actors.offstage=structuredClone(floors[0].stat_data['901_rules_poc'].actors.jiang);
  const makeHost=()=>createCombatHost({controller,encounters:{again:encounter},showChoices:()=>{choices++;},onStory:()=>{returned++;}});
  let host=makeHost(),result=await host.handleTurn();
  assert.equal(result.status,'awaiting_player');
  assert.ok(calls>0);assert.equal(choices,1);
  const before=controller.read().revision;
  controller=createTavernCombat(deps);host=makeHost();
  await host.handleTurn();
  assert.equal(controller.read().revision,before); // Refresh is not consent.
  let steps=0;
  while(result.status==='awaiting_player'&&steps++<90){
    const opts=controller.options();
    const order=opts.context.phase==='reaction'?['react']:['zheng','tornado','strike','move','end'];
    const option=order.map(id=>opts.options.findIndex(o=>o.command.abilityId===id&&(!o.command.choice||o.command.choice==='conversion'))).find(i=>i>=0);
    // Explicitly authorized test-fixture commands, not live player choices.
    result=await host.playerChoice({option,expectedRevision:opts.revision});
  }
  assert.equal(result.status,'story');assert.equal(returned,1);
  const saved=controller.read();
  assert.equal(saved.battle.mode,'story');
  assert.deepEqual(await host.read(),{mode:'story'});
  assert.ok(floors.at(-1).stat_data['901_rules_poc'].actors.offstage);
  const wounds=Object.fromEntries(Object.entries(saved.battle.actors).map(([id,a])=>[id,{health:a.state.health,resources:a.state.resources}]));
  assert.ok(Object.values(wounds).some(x=>x.health.L+x.health.A+x.health.B>0));
  // A new narrative floor carries the latest saved snapshot before entering.
  tavern.chat.push({mes:'下一场测试',swipe_id:0});floors.push({stat_data:{world:{place:'练武场'}}});
  await controller.carryLatest();
  await controller.enter(encounter());
  const next=controller.read();
  for(const [id,a] of Object.entries(next.battle.actors)){
    assert.deepEqual(a.state.health,wounds[id].health);
    assert.deepEqual(a.state.resources,wounds[id].resources);
  }
  assert.equal(next.battle.actors.bright.ammunition,saved.battle.actors.bright.ammunition);
  assert.equal(next.battle.actors.bright.parameters.bowStrength,3);
});

test('haste changes order without extra turns; aiming matures next round and is lost on movement',()=>{
  let b=encounter();b.reactionWindows=false;
  const use=(id,abilityId,extra={})=>{b=act(b,{actorId:id,abilityId,...extra},{drawDice:()=>Array(1024).fill(1),playerAuthorized:true}).battle;};
  use('huang','end');assert.equal(b.activeId,'bright');
  use('bright','timeHaste',{targetId:'bright'});
  assert.equal(b.actors.bright.state.turn.standard,0);assert.equal(b.actors.bright.state.turn.move,0);
  use('bright','end');assert.equal(b.activeId,'yulin');
  use('yulin','end');use('jiang','end');
  assert.equal(b.round,2);assert.equal(b.activeId,'bright');assert.equal(b.order[0],'bright');
  use('bright','aim',{targetId:'jiang'});
  assert.equal(b.actors.bright.aim.rounds,0);
  use('bright','end');use('huang','end');use('yulin','end');use('jiang','end');
  assert.equal(b.round,3);assert.equal(b.actors.bright.aim.rounds,1);
  const aimed=attackProfile(b,'bright',{targetId:'jiang'}).dp;
  use('bright','move',{to:[32,0]});
  assert.equal(b.actors.bright.aim,undefined);
  assert.equal(attackProfile(b,'bright',{targetId:'jiang'}).dp,aimed-1);
});

test('invalid model selection retries without rolling; transport failures remain visible',async()=>{
  let data={stat_data:{}},calls=0,rolls=0;
  const tavern={chatId:'retry-test',chat:[{mes:'演练',swipe_id:0}]};
  const deps={tavern,expectedChatId:'retry-test',battleFactory:encounter,
    mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async value=>{data=structuredClone(value);}},
    drawDice:()=>{rolls++;return Array(1024).fill(1);},
    createChatMessages:async messages=>{for(const m of messages)tavern.chat.push({mes:m.message,swipe_id:0});},
    generateRaw:async request=>{
      if(++calls===1)return '不是合法JSON';
      const c=JSON.parse(request.user_input.split('\n上一选择')[0]);
      return JSON.stringify({option:c.legalOptions.findIndex(o=>o.abilityId==='draw')});
    }};
  let c=createTavernCombat(deps);await c.initialize();await c.run({single:true});
  assert.equal(calls,2);assert.equal(rolls,0);assert.equal(c.read().revision,1);
  c=createTavernCombat({...deps,generateRaw:async()=>{calls++;throw Error('transport failed');}});
  await assert.rejects(()=>c.run({single:true}),/transport failed/);
  assert.equal(calls,3);assert.equal(c.read().revision,1);
});

test('host tool is unavailable inside its own NPC decision request',()=>{
  let registered, busy=false;
  const controller={get busy(){return busy;}};
  const host=installCombatHost({controller,document:{getElementById:()=>null},tavern:{
    canPerformToolCalls:()=>true,registerFunctionTool:tool=>{registered=tool;},unregisterFunctionTool:()=>{},
  }});
  assert.equal(registered.shouldRegister(),true);
  busy=true;assert.equal(registered.shouldRegister(),false);
  busy=false;assert.equal(registered.shouldRegister(),true);
  host.dispose();
});
