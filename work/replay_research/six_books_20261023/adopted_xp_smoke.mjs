import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
import {createOpeningFixture} from '../../rules_engine/gm_runtime/opening.mjs';
import {createReplayCheckRuntime} from '../../rules_engine/gm_runtime/replay-check.mjs';
const fixture=createOpeningFixture(),anchor={chatId:'isolated-adopted-xp',messageId:0,swipeId:0};let data={stat_data:{}};
const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async next=>{data=structuredClone(next);}};
const options={baseline:fixture.baseline,mvu,getAnchor:()=>anchor,expectedChatId:anchor.chatId,drawDice:()=>{throw Error('强化不需要骰子');}};
let runtime=createReplayCheckRuntime(options);await runtime.initialize({openingAssumption:true});
const saved=data.stat_data['901_rules_poc'];saved.actors.player.state.attributes.力量=4;saved.actors.player.state.xp=30;
saved.ruleScene={events:{break:{source:'隔离测试：主持确认的故事间隙',type:'node',actorIds:['player'],xp:0,growthAllowed:true}}};
const q={kind:'rule',action:'growth',actorId:'player',attribute:'力量'},context={latest:{text:'我把力量提升一级。'}};
const trace=[];
async function step(id,request=q,declaration=context){
 const before=structuredClone(runtime.currentPlayer());
 const result=await runtime.settle({operationId:`gm-runtime/${anchor.chatId}/${id}`,request,context:declaration});
 const after=runtime.currentPlayer();trace.push({id,request,declaration:declaration?.latest?.text??null,status:result.status,cost:result.result?.cost??0,charged:Math.max(0,before.xp-after.xp),xpBefore:before.xp,xpAfter:after.xp,strengthBefore:before.attributes.力量,strengthAfter:after.attributes.力量,autoGained:result.result?.autoGained??0,greatPowerChoiceGained:result.result?.greatPowerChoiceGained??0,reason:result.missing??null});return result;
}
assert.equal((await step('closed')).status,'needs_input');
await step('node',{kind:'rule',action:'node',actorId:'player',eventId:'break'});
assert.equal((await step('upgrade-one')).result.cost,6);assert.equal(runtime.currentPlayer().xp,24);
runtime=createReplayCheckRuntime(options);assert.equal((await step('upgrade-one')).status,'already_applied');assert.equal(runtime.currentPlayer().xp,24);
assert.equal((await step('upgrade-two')).result.cost,12);assert.equal(runtime.currentPlayer().xp,12);
data.stat_data['901_rules_poc'].actors.player.state.xp=5;
assert.equal((await step('insufficient')).status,'needs_input');assert.equal(runtime.currentPlayer().xp,5);
const report={status:'pass',mode:'local JS + in-memory MVU with readback; no live Gemini or real character mutation',initialFixture:{strength:4,xp:30},trace,after:{xp:runtime.currentPlayer().xp,strength:runtime.currentPlayer().attributes.力量,attributeAuto:runtime.currentPlayer().attributeAuto.力量,greatPowersAvailable:runtime.currentPlayer().greatPowersAvailable},note:'余额不足用例单独把测试余额设为5；不是前两次强化额外扣除7XP。'};
await writeFile('output/replay_tavern/six_books_20261023_candidate/scene_test/adopted-xp-smoke.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,steps:trace.map(x=>({id:x.id,status:x.status,cost:x.cost,xp:x.xpAfter,strength:x.strengthAfter}))}));
