// Isolated configuration only. Reuse existing native branch adoption; MVU owns writes.
if(window.top.location.port!=='18127')throw Error('Wrong continuation isolation origin');
const continuationParentId=__PARENT_CHAT_JSON__;
const continuationTavern=SillyTavern.getContext?.()??SillyTavern;
const continuationChatId=SillyTavern.getCurrentChatId?.()??SillyTavern.chatId;
const continuationMetadata=continuationTavern.chatMetadata??continuationTavern.chat_metadata;
const continuationIsBranch=continuationChatId!==continuationParentId;
let continuationAdoption=null;
if(continuationIsBranch){
 if(continuationMetadata?.main_chat!==continuationParentId)throw Error('Continuation must be a native child of actual saved 534');
 const {adoptNativeChatBranch,persistTavernRuleState}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
 continuationAdoption=await adoptNativeChatBranch({mvu:Mvu,tavern:continuationTavern,expectedParentChatId:continuationParentId,expectedRevision:1});
 await persistTavernRuleState({mvu:Mvu,tavern:continuationTavern,getAnchor:()=>({chatId:SillyTavern.getCurrentChatId?.()??SillyTavern.chatId,messageId:SillyTavern.chat.length-1,swipeId:SillyTavern.chat.at(-1)?.swipe_id??0})});
}
function continuationCatalog(source){
 const copy=structuredClone(source);
 if(!continuationIsBranch)return copy;
 // Exact source text, fact catalog and lore stay unchanged; bind retained quotes to this native copy.
 const visit=value=>{if(Array.isArray(value)){value.forEach(visit);return;}if(value&&typeof value==='object')for(const key of Object.keys(value)){
  if(key==='chatId'&&value[key]===continuationParentId)value[key]=continuationChatId;else visit(value[key]);
 }};
 visit(copy);return copy;
}
