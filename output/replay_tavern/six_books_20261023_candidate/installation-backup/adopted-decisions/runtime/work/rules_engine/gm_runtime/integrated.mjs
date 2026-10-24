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
    if(!b.actors.player)b.observers={player:{...structuredClone(roster.player),position:[0,0]}};
    b.sceneActorNames=Object.values(roster).map(a=>a.name);
    return b;
  }
  return {baseline,actors,playerTemplate:roster.player,encounters:Object.fromEntries(ENCOUNTERS.map(e=>[e.id,()=>encounter(e.id)]))};
}

// One shared MVU namespace and player ID for exploration and combat.
export function createIntegratedSession({baseline,mvu,tavern,generateRaw,createChatMessages,setChatMessages,
  showChoices=()=>{},makeHost=createCombatHost,narrateReturn,drawDice,onProgress=()=>{},renderCombat,playerDefenseDeclarations=false,prepareBattle,fixtureFactory=createIntegrationFixture,resolveEncounterBinding}) {
  const expectedChatId=tavern.getCurrentChatId?.()||tavern.chatId;
  const data=fixtureFactory(baseline);
  if(playerDefenseDeclarations)for(const [id,factory] of Object.entries(data.encounters))
    data.encounters[id]=()=>({...factory(),playerDefenseDeclarations:true});
  if(prepareBattle)for(const [id,factory] of Object.entries(data.encounters))data.encounters[id]=async()=>prepareBattle(factory());
  let narrating=false;
  const anchor=()=>tavernAnchor(tavern.chat.length-1,tavern);
  const root=()=>mvu.getMvuData({type:'message',message_id:anchor().messageId})?.stat_data?.['901_rules_poc'];
  const controller=createTavernCombat({mvu,tavern,generateRaw,createChatMessages,expectedChatId,drawDice,onProgress,render:renderCombat});
  async function prepare() {
    await controller.carryLatest();
    if(root()) {for(const binding of root().encounterBindings??[])data.registerBinding?.(binding);return;}
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
    const priorBinding=root()?.encounterBindings?.find(b=>b.id===encounterId);
    if(data.naturalEncounterIds?.includes(encounterId)&&!root()?.operations?.[operationId]&&priorBinding?.entryOperationId!==operationId) {
      if(!resolveEncounterBinding)throw Error('当前主持没有提供现场绑定适配');
      const binding=await resolveEncounterBinding({id:encounterId,chat:tavern.chat,priorBinding,currentBattle:root()?.battle});
      await registerEncounter({...binding,entryOperationId:operationId});
    }
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
  async function registerEncounter(binding) {
    if(!data.registerBinding)throw Error('此入口不支持正式场景登记');
    await prepare();
    if(root().battle?.mode==='combat'&&root().battle.status==='active')throw Error('进行中的战斗不能重绑场景');
    data.registerBinding(binding);await data.encounters[binding.id]();
    const a=anchor(),initial=mvu.getMvuData({type:'message',message_id:a.messageId}),next=structuredClone(initial);
    const saved=next.stat_data['901_rules_poc'];
    saved.encounterBindings=[...(saved.encounterBindings??[]).filter(b=>b.id!==binding.id),structuredClone(binding)];
    saved.revision++;const operationId=`scene-binding/${expectedChatId}/${a.messageId}/${a.swipeId}/${saved.revision}`;
    saved.operations[operationId]={signature:JSON.stringify({kind:'sceneBinding',binding}),summary:{operationId,revision:saved.revision}};
    await mvu.replaceMvuData(next,{type:'message',message_id:a.messageId});await tavern.saveChat();
    return {operationId,revision:saved.revision};
  }
  async function registerRuleScene(config) {
    await prepare();
    if(!config?.source?.trim())throw Error('规则场景须注明实际状态或已采用规则来源');
    if(root().battle?.mode==='combat'&&root().battle.status==='active'&&Object.keys(config).some(k=>!['kind','source','events','mechanismPlans'].includes(k)))throw Error('战斗中可登记新发生的有来源事件和操作目标计划；对象及人物配置须战前登记');
    const at=anchor(),initial=mvu.getMvuData({type:'message',message_id:at.messageId}),next=structuredClone(initial),saved=next.stat_data['901_rules_poc'];
    const scene=saved.ruleScene??={};
    for(const [id,plans]of Object.entries(config.mechanismPlans??{})){
      const object=scene.objects?.[id];if(!object)throw Error('须先登记实际物件');
      for(const [key,plan]of Object.entries(plans)){if(!plan.source?.trim()||object.plans?.[key])throw Error('操作计划须有独立来源和新ID；不能重写进行中的条件');(object.plans??={})[key]=structuredClone(plan);}
    }
    for(const [id,anatomy]of Object.entries(config.anatomies??{})){
      if(!saved.actors[id]||!anatomy.source?.trim()||!anatomy.movementModes)throw Error('肢体资料须有当前人物、来源与移动方式');
      saved.actors[id].state.anatomy=structuredClone(anatomy);
    }
    for(const [id,environment]of Object.entries(config.environments??{})){
      if(!saved.actors[id]||!environment.source?.trim()||typeof environment.freezeRecovery!=='boolean')throw Error('温度环境须有当前人物、现场来源及freezeRecovery布尔值');
      saved.actors[id].state.statusEnvironment={source:environment.source,freezeRecovery:environment.freezeRecovery};
    }
    for(const category of ['objects','events','feats','geneticOpportunities','scriptedOpportunities'])for(const [id,spec]of Object.entries(config[category]??{})) {
      if(!spec?.source?.trim())throw Error(`${category}.${id}须有独立来源`);
      if(scene[category]?.[id]&&JSON.stringify(scene[category][id])!==JSON.stringify(spec))throw Error(`${id}已有存档，不能登记时重置；使用实际操作推进`);
      if(category==='events'&&(!['node','chapter','reward','hypnosisOrder','statusApply','statusOrder','statusResistance','statusCounteract','statusContext','sceneEnd','channelFailure','geneticBacklash','demonGaze','sleepPerception','wake','extinguish'].includes(spec.type)||!Array.isArray(spec.actorIds)||!spec.actorIds.every(id=>saved.actors[id])||spec.xp!==undefined&&(!Number.isSafeInteger(spec.xp)||spec.xp<0)))throw Error('事件须有当前人物、支持的类型与合法已确认XP');
      if(category==='events'&&spec.type==='reward'&&!Number.isSafeInteger(spec.xp))throw Error('奖励须有已确认XP');
      if(category==='geneticOpportunities'&&(spec.authorized!==true||![1,2].includes(spec.stage)))throw Error('只登记明确授权的一阶或二阶机会');
      if(category==='scriptedOpportunities'&&spec.authorized!==true)throw Error('剧本机运须明确授权');
      if(category==='feats'&&(!spec.adopted||spec.id!==id||!Number.isSafeInteger(spec.maxLevel)))throw Error('学习专长须已采用且等级范围明确');
      if(category==='objects'&&(!spec.type||!Array.isArray(spec.actorIds)||!spec.actorIds.every(id=>saved.actors[id])))throw Error('对象须有类型及当前可操作人物');
      (scene[category]??={})[id]=structuredClone(spec);
    }
    if(config.geneticHistory){
      const h=config.geneticHistory;if(saved.actors.player.state.geneticLock)throw Error('已有基因锁履历，不可覆盖');
      if(!h.source?.trim()||![h.highestStage,h.activeStage,h.successfulUnlocks?.[1]].every(n=>Number.isSafeInteger(n)&&n>=0))throw Error('须有完整有来源的一阶解锁历史');
      saved.actors.player.state.geneticLock=structuredClone(h);
    }
    for(const [id,info]of Object.entries(config.possessions??{})) {
      const actor=saved.actors[id];if(!actor||!info.source?.trim())throw Error('持有记录须有当前人物与来源');
      for(const [name,quantity]of Object.entries(info.quantities??{})) {
        const item=actor.state.inventory?.find(i=>i.name===name);
        if(!item||item.quantity!==null||!Number.isSafeInteger(quantity)||quantity<0)throw Error('此入口只补尚未确定的现有库存数量，不能重置已知消耗');
        item.quantity=quantity;item.source=info.source;
      }
      if(info.phaseRing||info.items) {
        if(actor.state.possessions)throw Error('已有实物存档，不能通过登记重置');
        actor.state.possessions={source:info.source,...(info.phaseRing?{phaseRing:structuredClone(info.phaseRing)}:{}),items:structuredClone(info.items??[])};
      }
    }
    saved.revision++;const operationId=`rule-scene/${expectedChatId}/${at.messageId}/${at.swipeId}/${saved.revision}`;
    saved.operations[operationId]={signature:JSON.stringify({kind:'ruleScene',config}),summary:{operationId,revision:saved.revision}};
    if(JSON.stringify(anchor())!==JSON.stringify(at)||JSON.stringify(mvu.getMvuData({type:'message',message_id:at.messageId}))!==JSON.stringify(initial))throw Error('登记期间聊天状态已改变');
    await mvu.replaceMvuData(next,{type:'message',message_id:at.messageId});
    if(JSON.stringify(mvu.getMvuData({type:'message',message_id:at.messageId}))!==JSON.stringify(next))throw Error('规则场景存档未通过读回确认');
    await tavern.saveChat();return {operationId,revision:saved.revision};
  }
  return {
    ...host,controller,prepare,baseline:data.baseline,playerTemplate:data.playerTemplate,encounterOptions:data.encounterOptions??ENCOUNTERS,
    get busy(){return controller.busy||narrating;},
    enterForPlayer,
    registerEncounter,
    registerRuleScene,
    async resumeEntry(player) {
      const entry=tavern.chat[player.messageId]?.extra?.['901_combat_entry'];
      if(!entry||entry.playerText!==player.text||entry.swipeId!==player.swipeId)return null;
      return enterForPlayer(entry.encounterId,player);
    },
    async handleTurn(input) {
      await controller.carryLatest();
      const resumed=await finishNarration();
      return resumed??host.handleTurn(input);
    },
    async currentState() {
      await prepare();
      return {revision:root().revision,mode:root().battle?.mode??'story',
        actors:structuredClone(root().actors)};
    },
  };
}
