// Plans select actual inventory instances; they cannot create a component by
// asserting a boolean. Holding a required component does not consume it.
export function inspectRequiredItems(state,requirements=[],choices={}){
 return requirements.map(rule=>{
  const id=choices[rule.key],item=state.possessions?.items?.find(i=>i.id===id);
  if(!item||item.location!=='carried'||rule.held&&!item.held||!item.tags?.includes(rule.tag)){
   const e=new Error('须选择实际携带且符合成分要求的物品：'+rule.key);e.code='NEEDS_INPUT';e.field='resource.itemChoices.'+rule.key;throw e;
  }
  return {key:rule.key,itemId:item.id,tag:rule.tag,consumed:false,source:item.source??'saved-inventory/'+item.id};
 });
}
