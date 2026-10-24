import {createRoster,createEncounter} from '../combat/catalog.mjs';
import {createTavernCombat} from '../combat/tavern.mjs';
import {createCombatHost} from '../combat/host.mjs';
import {initializeTestState,carryTestState,tavernAnchor} from '../mvu_poc/adapter.mjs';
import {lifeStatus} from '../core.mjs';

export const INTEGRATION_SCENE='完整人物卡隔离演练，不计入帝都T0或实际重玩事件。开场时四人在空旷场地，黄泉与姜子尤相距1米，御临风、布莱特在场边；后续以当前场景和存档为准。仅在明确开始时进行已登记演练，目标是对练至一方失去行动能力；不撤离场地，不对失去行动能力者补刀。旁边有供练习平衡的矮横木；敏捷＋运动DC1，一次失手只须落地重新站稳，不造成伤害。这个难度仅为本测试场景设定。';
export const ENCOUNTERS=[
  {id:'jiang-huang',description:'姜黄演练：姜子尤与黄泉对战，御临风旁观；两名NPC自主行动。'},
  {id:'yulin-jiang',description:'御姜演练：御临风参加与姜子尤的对战；御临风的动作和受击反应由玩家选择。'},
];

// Tavern's context is a snapshot: rebind before using it after a chat switch.
export function createChatSessionAccess(getTavern,createSession) {
  let currentId,session;
  return ()=>{
    const tavern=getTavern(),id=tavern.getCurrentChatId?.()||tavern.chatId;
    if(!id)throw Error('请先打开测试聊天');
    if(id!==currentId){session?.dispose();session=createSession(tavern);currentId=id;}
    return session;
  };
}

// This projection is a full-card test fixture, never a replacement T0 baseline.
export function createIntegrationFixture(sourceBaseline) {
  const roster=createRoster();
  roster.yulin.state.skills=structuredClone(sourceBaseline.definition.skills);
  roster.yulin.state.derived.willMax=9;
  roster.yulin.state.will.current=9;
  roster.yulin.id='player';
  roster.player=roster.yulin;delete roster.yulin;
  const actors=Object.fromEntries(Object.entries(roster).map(([id,a])=>[id,{name:a.name,state:a.state}]));
  const baseline=structuredClone(sourceBaseline);
  baseline.baselineMeaning='已确认完整卡数值的隔离整合验收；不作为帝都T0装备与能量投影。';
  baseline.definition.period='isolated/full-card-integration';
  baseline.definition.equipment=[];baseline.definition.abilities=[];
  baseline.definition.overrides={derived:Object.fromEntries(
    Object.entries(roster.player.state.derived).filter(([,v])=>Number.isInteger(v))
      .map(([key,value])=>[key,{mode:'final',value,source:'已确认完整卡战斗比较配置；隔离验收'}]))};
  function encounter(id) {
    if(!ENCOUNTERS.some(e=>e.id===id))throw Error('未登记的整合测试遭遇');
    const b=createEncounter({id,scenario:INTEGRATION_SCENE,
      participants:id==='jiang-huang'?['jiang','huang']:['yulin','jiang'],
      positions:{huang:[0,0],jiang:[1,0],yulin:[0,0]},
      teams:id==='yulin-jiang'?{yulin:'玩家方',jiang:'对练方'}:{}});
    if(b.actors.yulin) {
      b.actors.player=b.actors.yulin;b.actors.player.id='player';delete b.actors.yulin;
      b.order=b.order.map(x=>x==='yulin'?'player':x);
      if(b.activeId==='yulin')b.activeId='player';
    }
    return b;
  }
  return {baseline,actors,encounters:Object.fromEntries(ENCOUNTERS.map(e=>[e.id,()=>encounter(e.id)]))};
}

// One shared MVU namespace and player ID for exploration and combat.
export function createIntegratedSession({baseline,mvu,tavern,generateRaw,createChatMessages,setChatMessages,
  showChoices=()=>{},makeHost=createCombatHost,narrateReturn,drawDice,onProgress=()=>{}}) {
  const expectedChatId=tavern.getCurrentChatId?.()||tavern.chatId;
  const data=createIntegrationFixture(baseline);
  let narrating=false;
  const anchor=()=>tavernAnchor(tavern.chat.length-1,tavern);
  const root=()=>mvu.getMvuData({type:'message',message_id:anchor().messageId})?.stat_data?.['901_rules_poc'];
  const controller=createTavernCombat({mvu,tavern,generateRaw,createChatMessages,expectedChatId,drawDice,onProgress});
  async function prepare() {
    await controller.carryLatest();
    if(root())return;
    if(tavern.chat.filter(m=>m.is_user&&!m.is_system).length>1)
      throw Error('已有聊天缺少规则存档；不会用满状态演练覆盖');
    await initializeTestState({mvu,expectedChatId,getAnchor:anchor,actors:data.actors});
    await tavern.saveChat();
  }
  async function finishNarration() {
    const saved=root();
    if(saved?.battle?.mode!=='story')return null;
    const leave=Object.values(saved.operations).findLast(op=>{
      try{return JSON.parse(op.signature).kind==='leave';}catch{return false;}
    });
    const operationId=leave?.summary?.operationId;
    if(!operationId||tavern.chat.some(m=>m.extra?.['901_combat_return']?.operationId===operationId))return null;
    if(typeof narrateReturn!=='function')return null;
    const facts={scenario:saved.battle.scenario,winner:saved.battle.winner,
      participants:Object.entries(saved.battle.actors).filter(([,a])=>a.present).map(([id,a])=>({
        name:a.name,condition:lifeStatus(saved.actors[id].state).state,
        injured:['B','L','A'].some(key=>saved.actors[id].state.health[key]>0),
      })),instruction:'演练已结束；只述可见状态并交还玩家，不恢复生命能量、不授予XP、不替御临风选择或说话。'};
    narrating=true;
    try {
      const text=await narrateReturn(facts);
      if(typeof text!=='string'||!text.trim()||/<\/?(?:jsonpatch|mvu|update)\b|901_rules_poc/i.test(text))
        throw Error('战后叙述为空或包含变量修改；结算已保存，可继续恢复叙述');
      const source=anchor();
      await createChatMessages([{role:'assistant',message:text,extra:{'901_combat_return':{operationId}}}]);
      await carryTestState({mvu,expectedChatId,getAnchor:anchor,getSourceAnchor:()=>source});
      await tavern.saveChat();
      return {handled:true,status:'story',revision:saved.revision};
    } finally {narrating=false;}
  }
  const host=makeHost({controller,encounters:data.encounters,showChoices,onStory:finishNarration});
  async function enterForPlayer(encounterId,player) {
    if(!Object.hasOwn(data.encounters,encounterId))throw Error('未登记的整合测试遭遇');
    const message=tavern.chat[player.messageId];
    if(player.chatId!==expectedChatId||message?.mes!==player.text||(message.swipe_id??0)!==player.swipeId)
      throw Error('玩家行动楼层已改变');
    const operationId=`gm-runtime/${expectedChatId}/${player.messageId}/${player.swipeId}/combat`;
    const entry={encounterId,operationId,playerText:player.text,swipeId:player.swipeId};
    const old=message.extra?.['901_combat_entry'];
    if(old&&JSON.stringify(old)!==JSON.stringify(entry))throw Error('该行动已登记不同遭遇');
    if(!old) {
      await setChatMessages([{message_id:player.messageId,message:player.text,
        extra:{...message.extra,'901_combat_entry':entry}}],{refresh:'none'});
      await tavern.saveChat();
    }
    if(root()?.operations?.[operationId]) {
      if(root().battle?.mode==='story') {
        await finishNarration();return {handled:true,status:'story',revision:root().revision};
      }
      return host.handleTurn();
    }
    return host.enter(encounterId,{operationId});
  }
  return {
    ...host,controller,prepare,baseline:data.baseline,encounterOptions:ENCOUNTERS,
    get busy(){return controller.busy||narrating;},
    enterForPlayer,
    async resumeEntry(player) {
      const entry=tavern.chat[player.messageId]?.extra?.['901_combat_entry'];
      if(!entry||entry.playerText!==player.text||entry.swipeId!==player.swipeId)return null;
      return enterForPlayer(entry.encounterId,player);
    },
    async handleTurn() {
      await controller.carryLatest();
      const resumed=await finishNarration();
      return resumed??host.handleTurn();
    },
    async currentState() {
      await prepare();
      return {revision:root().revision,mode:root().battle?.mode??'story',
        actors:structuredClone(root().actors)};
    },
  };
}
