// Reuse the original pure Host knowledge rules, not a second knowledge executor.
import {grantKnowledge,reduceKnowledge,projectKnowledge} from '../../../shared/901-trpg-engine/tools/trpg-engine/gm/knowledge.js';
import {validFact,sameClock} from '../../../shared/901-trpg-engine/tools/trpg-engine/gm/world.js';
import {settleStoryKnowledge,persistTavernRuleState,readPersistedTavernChat} from '../mvu_poc/adapter.mjs';

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const id=value=>typeof value==='string'&&/^[A-Za-z0-9._-]+$/.test(value);
// This is retained dialogue order only, never native worldMinutes or elapsed time.
const at=messageId=>({id:'legacy.story.order',clock:'turn',at:messageId,actorId:'legacy.story'});
const checked=result=>{if(!result.ok)throw Error(result.issues.map(i=>i.message??i.code).join('；'));return result.value;};
const effective=(fact,now)=>sameClock(fact.effectiveAt,now)&&fact.effectiveAt.at<=now.at;
const knownGrants=(state,actorId,ref,now)=>Object.values(state.knowledge)
 .filter(g=>g.knowerId===actorId&&g.propositionRef===ref&&sameClock(g.at,now)&&g.at.at<=now.at)
 .sort((a,b)=>a.at.at-b.at.at);
const latestGrant=(state,actorId,ref,now)=>knownGrants(state,actorId,ref,now).at(-1);
const validDisclosure=(note,source)=>note==null||(typeof note==='object'&&!Array.isArray(note)&&
 Object.keys(note).length===1&&typeof note.sourceQuote==='string'&&note.sourceQuote.trim().length>0&&
 typeof source?.text==='string'&&source.text.includes(note.sourceQuote));

export const STORY_COMMUNICATION_INSTRUCTION='知情不等于必须说出。人物结合当前目的、被问到的内容、已载入的人物性格与关系、听者和旁听环境、披露的影响及已有约定，选择是否说、说多少、对谁说和怎样说；同一处境可以有不同的合理回应。'+
 '私下获告不自动构成保密义务，private表示取得范围，不表示禁言。sources是该人物实际取得消息的来源；disclosure只引用来源中明确交代的披露约定，按其对象、条件、时点及之后实际发生的变更理解。没有登记约定就不额外虚构保密承诺，后一次普通确认也不自行取消先前约定。'+
 '信息无关时可以不提，不能为展示知情而倾倒背景；被直接问到且没有实际回避理由时自然回应，不为了保密而保密。有符合人物目的和处境的理由时可以保留、婉拒、试探或转为私下交谈，不替御临风答应或跟随。角色的隐瞒、谎言和推测仍是其说法，不改成世界事实；不能编造听说过、共同经历或新的消息来源来解释受控命题的取得。'+
 '无需在正文逐项说明这些判断，也不要求未知者每轮声明不知道；保留原文风、人物差异与正常临场发挥，知识目录不穷尽人物描写。仅承接本轮有意义的回应，是否简短或与先前相似按语境判断，不强行换词或添加动作。'+
 '知道、打算告知、实际说出、对方实际收到分别处理；正文提及不自动同步全队知识，继续由显式宿主接收回执保存。';

export async function generateStoryWithKnowledge({knowledge,request,generateRaw,eventOn,eventRemoveListener,event}){
 if(!knowledge)return generateRaw(request);
 if(!event||typeof eventOn!=='function'||typeof eventRemoveListener!=='function')throw Error('Knowledge prompt projection hook unavailable');
 const marker='【901逐角色知情投影】';
 const projected={...request,user_input:request.user_input+'\n'+marker+'\n'+JSON.stringify(knowledge.context())+
  '\n受控命题用于对白、判断和行动理由时，只用对应人物facts及其belief；公共常识与实际可观察现场仍按已有依据使用。可询问不等于已获知，同队或旧模型对白不补取得事件；未列知识也不表示世界事实不存在。effectiveAt是事实时点，learnedAt是人物获知时点；旧时点的事实不自动变成实时确认。聊天楼层不是世界时间，资料中的计划与条件不证明事件已发生或消息已送达。'+
  '\n'+STORY_COMMUNICATION_INSTRUCTION};
 const listener=data=>{
  if(!Array.isArray(data.messages)||!data.messages.some(m=>typeof m.content==='string'&&m.content.includes(marker)))return;
  data.messages.splice(0,data.messages.length,...knowledge.projectMessages(data.messages));
 };
 eventOn(event,listener);
 try{return await generateRaw(projected);}finally{eventRemoveListener(event,listener);}
}

export function createStoryKnowledgeRuntime({mvu,tavern,getAnchor,catalog,readSavedChat}){
 if(!id(catalog?.id)||!Array.isArray(catalog.facts)||!catalog.actors)throw Error('Trusted story knowledge catalog required');
 const root=()=>{
  const anchor=getAnchor(),r=mvu.getMvuData({type:'message',message_id:anchor.messageId})?.stat_data?.['901_rules_poc'];
  if(!r||r.chatId!==anchor.chatId||anchor.chatId!==(tavern.getCurrentChatId?.()??tavern.chatId))throw Error('Knowledge chat / 分支 identity mismatch');
  return r;
 };
 const initial=()=>({schemaVersion:1,catalogId:catalog.id,chatId:getAnchor().chatId,timeBasis:'retained-chat-message-order',
  facts:Object.fromEntries(catalog.facts.map(f=>{
   const fact={effectiveAt:at(0),discoveryConditions:f.visibility==='public'?[]:['actual-receipt'],dependencyRefs:[],...structuredClone(f)};
   if(!validFact(fact))throw Error('Invalid trusted fact boundary');
   return [fact.id,fact];
  })),events:{},knowledge:{}});
 function read(){
  const state=root().storyKnowledge??initial();
  if(state.chatId!==getAnchor().chatId||state.catalogId!==catalog.id)throw Error('Knowledge chat / catalog mismatch');
  for(const event of Object.values(state.events))if(event.data?.sourceAnchor){
   const source=event.data.sourceAnchor,message=tavern.chat[source.messageId];
   if(source.chatId!==state.chatId||!message||(message.swipe_id??0)!==source.swipeId||message.mes!==source.text)
    throw Error('Knowledge source no longer matches the retained branch');
   if(!validDisclosure(event.data.disclosure,source))throw Error('Retained disclosure / 披露约定 lacks its source quote');
  }
  return structuredClone(state);
 }
 function context(){
  const state=read(),now=at(getAnchor().messageId);
  return {timeBasis:'当前保留聊天楼层顺序；不是世界时间或机械回合',actorKnowledge:Object.entries(catalog.actors).map(([actorId,name])=>{
   const view=checked(projectKnowledge(state,{knowerId:actorId,at:now}));
   const publicFacts=Object.values(state.facts).filter(f=>f.visibility==='public'&&!f.discoveryConditions.length&&effective(f,now));
   const facts=[...new Map([...publicFacts,...view.facts.filter(f=>effective(f,now))].map(f=>[f.id,f])).values()].map(f=>{
    const grants=knownGrants(state,actorId,f.id,now),grant=grants.at(-1);
    const sources=grants.map(g=>{
     const event=state.events[g.eventRef],source=event?.data?.sourceAnchor;
     return {eventRef:g.eventRef,channel:g.channel,belief:g.belief,senderId:event?.data?.senderId??null,learnedAt:structuredClone(g.at),
      sourceAnchor:source?{chatId:source.chatId,messageId:source.messageId,swipeId:source.swipeId}:null,
      disclosure:structuredClone(event?.data?.disclosure??null)};
    });
    return {id:f.id,content:structuredClone(f.value),belief:grant?.belief??f.certainty,access:grant?'learned':'public',
     effectiveAt:structuredClone(f.effectiveAt),learnedAt:grant?structuredClone(grant.at):null,
     sources,
     ...(grant?{eventRef:grant.eventRef,channel:grant.channel,learnedAtMessage:grant.at.at}:{})};
   });
   return {actorId,name,facts};
  }),availableInformation:structuredClone(catalog.availableInformation??[])};
 }
 async function receive(receipt){
  if(receipt?.status!=='received'||receipt.authority!=='host-confirmed'||!id(receipt.id)||
   !Array.isArray(receipt.recipientIds)||!receipt.recipientIds.length||new Set(receipt.recipientIds).size!==receipt.recipientIds.length||
   receipt.recipientIds.some(k=>!Object.hasOwn(catalog.actors,k))||!Array.isArray(receipt.propositionRefs)||!receipt.propositionRefs.length||
   !['message','observation','ability'].includes(receipt.channel)||!['confirmed','uncertain','rumor','character_belief'].includes(receipt.belief))throw Error('Actual host-confirmed knowledge receipt required');
  const anchor=getAnchor(),source=receipt.sourceAnchor,message=tavern.chat[source?.messageId];
  if(source?.chatId!==anchor.chatId||!Number.isInteger(source.messageId)||source.messageId>anchor.messageId||!message||
   (message.swipe_id??0)!==source.swipeId||message.mes!==source.text)throw Error('Knowledge source is not the retained chat message');
  if(!validDisclosure(receipt.disclosure,source))throw Error('Explicit disclosure / 披露约定 requires an exact retained source quote');
  // The received event itself must already exist in the saved branch.
  const reader=chatId=>readPersistedTavernChat({tavern,chatId,readSavedChat});
  await tavern.saveChat();const saved=await reader(anchor.chatId),savedMessage=saved?.[source.messageId+1];
  if(savedMessage?.mes!==source.text||(savedMessage?.swipe_id??0)!==source.swipeId)throw Error('Knowledge source is not durably saved');
  if(!same(getAnchor(),anchor)||tavern.chat[source.messageId]?.mes!==source.text||
   (tavern.chat[source.messageId]?.swipe_id??0)!==source.swipeId)throw Error('Knowledge source changed while saving');
  const state=read(),boundary=at(source.messageId);
  for(const ref of receipt.propositionRefs){
   if(!state.facts[ref])throw Error('Unknown sourced proposition');
   if(receipt.senderId){
    checked(projectKnowledge(state,{knowerId:receipt.senderId,at:boundary}));
    const belief=latestGrant(state,receipt.senderId,ref,boundary)?.belief;
    const fact=state.facts[ref],publiclyKnown=fact.visibility==='public'&&!fact.discoveryConditions.length&&effective(fact,boundary);
    if(!belief&&!publiclyKnown)throw Error('Sender has not acquired this proposition');
    if(belief&&belief!=='confirmed'&&receipt.belief==='confirmed')throw Error('Relay cannot upgrade belief / 传闻为确认');
   }
  }
  const result=await settleStoryKnowledge({mvu,getAnchor,expectedChatId:anchor.chatId,operationId:'story-knowledge/'+receipt.id,
   expectedRevision:root().revision,request:receipt,reduce:existing=>{
    let next=existing??initial();const eventRef='received.'+receipt.id;
    const event={id:eventRef,kind:{message:'message.arrived',observation:'observation.confirmed',ability:'ability.disclosed'}[receipt.channel],
     data:{knowerIds:receipt.recipientIds,propositionRefs:receipt.propositionRefs,at:boundary,sourceAnchor:source,...(receipt.senderId?{senderId:receipt.senderId}:{}),
      ...(receipt.disclosure?{disclosure:structuredClone(receipt.disclosure)}:{})},
     sourceRefs:[{file:'retained-chat/'+anchor.chatId,line:source.messageId+1}],causeRefs:[]};
    if(next.events[eventRef]&&!same(next.events[eventRef],event))throw Error('Knowledge event identity conflict');
    next.events[eventRef]=event;
    for(const knowerId of receipt.recipientIds)for(const propositionRef of receipt.propositionRefs){
     const grant={id:receipt.id+'.'+knowerId+'.'+propositionRef,knowerId,propositionRef,eventRef,at:boundary,channel:receipt.channel,belief:receipt.belief};
     for(const e of checked(grantKnowledge(next,grant)).events)next=checked(reduceKnowledge(next,e));
    }
    return next;
   }});
  await persistTavernRuleState({mvu,tavern,getAnchor,readSavedChat:reader});return result;
 }
 function projectEntries(entries){
  return entries.map(entry=>{
   const source=(catalog.lore??[]).find(s=>s.book===(entry.world??entry.book)&&s.uid===(entry.uid??entry.id));
   if(!source)return structuredClone(entry);
   if(entry.content!==source.content)throw Error('知情投影来源已变更，请核对来源版本');
   return {...structuredClone(entry),content:source.publicContent};
  });
 }
 function projectMessages(messages){
  const sources=(catalog.rejectedNarration??[]).filter(s=>s.chatId===getAnchor().chatId&&s.messageId<=getAnchor().messageId&&
   tavern.chat[s.messageId]?.mes===s.message&&(tavern.chat[s.messageId].swipe_id??0)===s.swipeId);
  return messages.map(message=>({...message,...(typeof message.content==='string'?{content:sources.reduce((text,s)=>text.split(s.fragment).join(s.projectedFragment??''),message.content)}:{})}));
 }
 const api={read,context,receive,projectEntries,projectMessages};
 api.generate=options=>generateStoryWithKnowledge({...options,knowledge:api});
 return api;
}
