import { createDuel } from './catalog.mjs';
import { createCombatRuntime, chooseAction, inspectCommands, decisionContext } from './runtime.mjs';
import { renderResult } from './engine.mjs';
import { carryTestState, tavernAnchor } from '../mvu_poc/adapter.mjs';
import { IllegalAction } from './mechanics.mjs';

// Bound once to this isolated card/chat by its role script. No global settings,
// character definitions or campaign saves are modified.
export function createTavernCombat({mvu,tavern,generateRaw,createChatMessages,expectedChatId,onProgress=()=>{},battleFactory=createDuel,drawDice,render=renderResult}) {
  let busy=false, stop=false;
  function env() {
    const messageId=tavern.chat.length-1;
    const getAnchor=()=>tavernAnchor(messageId,tavern);
    const initial=getAnchor();
    if(initial.chatId!==expectedChatId) throw new Error('已离开指定演练聊天');
    return {getAnchor,runtime:createCombatRuntime({mvu,getAnchor,expectedChatId,drawDice})};
  }
  async function publish(value, sourceAnchor, replay=false) {
    if(render) {
      await createChatMessages([{role:'assistant',message:
      (replay?'已保存报告重发：本次没有重新掷骰、扣费或造成伤害。\n\n':'')+render(value)}]);
    const targetId=tavern.chat.length-1;
    await carryTestState({mvu,expectedChatId,operationId:value.operationId,
      getSourceAnchor:()=>sourceAnchor,getAnchor:()=>tavernAnchor(targetId,tavern)});
    }
    // Persist before requesting narration, including when no mechanical floor is posted.
    await tavern.saveChat?.();
    onProgress({status:'saved',revision:value.revision,result:value.result});
  }
  async function step() {
    const {runtime,getAnchor}=env();
    const current=runtime.read();
    if(current.battle.status!=='active') return {status:current.battle.status};
    let rejection=null;
    for(let attempt=0;attempt<3;attempt++) {
      let decision;
      try {
        decision=await chooseAction(runtime,generateRaw,{rejection});
        if(decision.status==='awaiting_player') return decision;
        const sourceAnchor=getAnchor();
        const value=await runtime.dispatch({command:decision.command,expectedRevision:decision.expectedRevision,
          operationId:`combat/${sourceAnchor.messageId}/${sourceAnchor.swipeId}/${decision.expectedRevision}`});
        await publish(value,sourceAnchor);
        return {status:'stepped',promptChars:decision.promptChars,...value};
      } catch(error) {
        // A write/publish failure is not an invalid move. Never roll again after
        // a committed operation, even if posting the visible report failed.
        if(!(error instanceof IllegalAction)||runtime.read().revision!==current.revision) throw error;
        rejection=error.message;
        onProgress({status:'rejected',command:decision?.command,reason:rejection});
      }
    }
    throw new Error(`模型连续选择非法动作：${rejection}`);
  }
  return {
    get busy() {return busy;},
    async initialize() {
      const b=battleFactory();b.reactionWindows=true;
      return env().runtime.initialize(b);
    },
    read() { return env().runtime.read(); },
    context() { return env().runtime.context(); },
    options() {
      const {battle,revision}=env().runtime.read();
      const actor=battle.actors[battle.pending?.awaiting??battle.activeId];
      return {actorId:actor.id,controller:actor.controller,revision,
        ...inspectCommands(battle),context:decisionContext(battle,revision)};
    },
    async carryLatest() {
      const {getAnchor}=env(),tip=tavern.chat.length-1;
      if(mvu.getMvuData({type:'message',message_id:tip})?.stat_data?.['901_rules_poc']) return;
      for(let i=tip-1;i>=0;i--) if(mvu.getMvuData({type:'message',message_id:i})?.stat_data?.['901_rules_poc']) {
        const source={chatId:expectedChatId,messageId:i,swipeId:tavern.chat[i].swipe_id??0};
        return carryTestState({mvu,expectedChatId,getAnchor,getSourceAnchor:()=>source});
      }
    },
    async submitPlayer({option,expectedRevision}) {
      if(busy) throw new Error('仍在处理上一操作');
      const {runtime,getAnchor}=env(),{battle,revision}=runtime.read();
      const actor=battle.actors[battle.pending?.awaiting??battle.activeId];
      if(actor.controller!=='player'||revision!==expectedRevision) throw new Error('当前玩家或状态版本已改变');
      const command=inspectCommands(battle).options[option]?.command;
      if(!command) throw new Error('请选择当前合法选项');
      busy=true;
      try {
        const anchor=getAnchor();
        const value=await runtime.dispatch({operationId:`player/${anchor.messageId}/${anchor.swipeId}/${revision}`,
          expectedRevision:revision,command,playerAuthorized:true});
        await publish(value,anchor);return value;
      } finally {busy=false;}
    },
    async submitCommand({command,expectedRevision,operationId}) {
      if(busy) throw new Error('仍在处理上一操作');
      const {runtime,getAnchor}=env(),{battle,revision}=runtime.read();
      const actor=battle.actors[battle.pending?.awaiting??battle.activeId];
      if(actor.controller!=='player'||actor.id!==command.actorId||revision!==expectedRevision)
        throw new Error('当前玩家或状态版本已改变');
      busy=true;
      try {
        const anchor=getAnchor();
        const value=await runtime.dispatch({operationId,expectedRevision,command,playerAuthorized:true});
        await publish(value,anchor);return value;
      } finally {busy=false;}
    },
    async enter(battle, {operationId} = {}) {
      if(busy) throw new Error('仍在处理上一操作');
      const {runtime,getAnchor}=env(),anchor=getAnchor();
      const root=mvu.getMvuData({type:'message',message_id:anchor.messageId})?.stat_data?.['901_rules_poc'];
      if(!root) throw new Error('进入正式战斗前须加载对应时期的当前人物存档');
      busy=true;
      try {
        const value=await runtime.enter({operationId:operationId??`enter/${battle.id}/${root.revision}`,expectedRevision:root.revision,battle});
        await publish(value,anchor);return value;
      } finally {busy=false;}
    },
    async returnToStory() {
      const {runtime,getAnchor}=env(),current=runtime.read();
      if(current.battle.mode==='story') return {status:'story',revision:current.revision};
      if(busy) throw new Error('仍在处理上一操作');
      busy=true;
      try {
        const anchor=getAnchor(),value=await runtime.leave({operationId:`leave/${current.revision}`,expectedRevision:current.revision});
        await publish(value,anchor);return value;
      } finally {busy=false;}
    },
    async installMap(map) {
      if(busy)throw new Error('仍在处理上一操作');
      busy=true;
      try {const {runtime,getAnchor}=env(),{revision}=runtime.read(),anchor=getAnchor();
        const value=await runtime.installMap({operationId:`map/${revision}`,expectedRevision:revision,map});
        await publish(value,anchor);return value;
      } finally {busy=false;}
    },
    async supplyParameters(actorId,values) {
      if(busy) throw new Error('仍在处理上一操作');
      busy=true;
      try {
        const {runtime,getAnchor}=env(),{revision}=runtime.read(),anchor=getAnchor();
        const value=await runtime.supplyParameters({operationId:`parameters/${revision}`,expectedRevision:revision,actorId,values});
        await publish(value,anchor);return value;
      } finally {busy=false;}
    },
    async resumeReport() {
      const {runtime,getAnchor}=env(), saved=runtime.read().lastResult;
      if(!saved?.result) throw new Error('当前楼层没有待展示结算');
      await publish(saved,getAnchor(),true); return {...saved,status:'report_replayed'};
    },
    stop() { stop=true; },
    async run({single=false}={}) {
      if(busy) throw new Error('演练仍在进行');
      busy=true; stop=false;
      try {
        do {
          const value=await step();
          if(value.status!=='applied'||single) return value;
          if(env().runtime.read().battle.status!=='active') return env().runtime.read();
        } while(!stop);
        return {status:'stopped'};
      } finally { busy=false; }
    },
  };
}
