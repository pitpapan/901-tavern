// Remove the specified action itself; never pay its loss with a larger action.
// A pending loss belongs to the next active turn and survives save/reload.
export function loseResourceAction(state,action,source){
 if(!['standard','move','swift'].includes(action))throw Error('未支持的动作损失类型');
 if(!source.sourceId||!source.casterId)throw Error('动作损失须有实际来源');
 if(state.turn?.phase==='active'&&state.turn[action]>0){
  state.turn[action]=0;return {action,timing:'current',...source};
 }
 const loss={action,timing:'next',...structuredClone(source)};
 (state.resourceActionLosses??=[]).push(loss);return loss;
}
export function applyResourceActionLosses(state){
 if(state.turn?.phase!=='active')return [];
 const losses=state.resourceActionLosses??[];
 for(const loss of losses)state.turn[loss.action]=0;
 if(losses.length)delete state.resourceActionLosses;
 return losses;
}
