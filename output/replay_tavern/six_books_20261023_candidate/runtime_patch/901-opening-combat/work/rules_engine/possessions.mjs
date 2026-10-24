import {spendAction,advanceMultiRoundAction} from './core.mjs';
import {RuleInputError,IllegalAction} from './combat/mechanics.mjs';

export function ringTransfer(input,{operation,itemId},{combat=false,preActionCleared=false}={}) {
  const a=structuredClone(input),s=a.state,ring=s.possessions?.phaseRing;
  if(!ring?.owned||!ring.worn)throw new RuleInputError('须先确认相偏折戒指实际持有且佩戴','possessions.phaseRing');
  const item=s.possessions?.items?.find(i=>i.id===itemId);
  if(!item||![item.volume,item.weightKg].every(n=>Number.isFinite(n)&&n>=0)||typeof item.oneHanded!=='boolean')
    throw new RuleInputError('须有该实际物品的体积、重量和单手持握资格；不从价格推导','possessions.items');
  if(!['store','retrieve'].includes(operation))throw new IllegalAction('只支持放入或取出整体物品');
  if(operation==='store') {
    if(item.location!=='carried')throw new IllegalAction('须是实际随身物品');
    const stored=s.possessions.items.filter(i=>i.location==='phaseRing');
    if(item.volume>10||stored.reduce((n,i)=>n+i.weightKg,0)+item.weightKg>10||stored.reduce((n,i)=>n+i.volume,0)+item.volume>100)
      throw new IllegalAction('超过戒指单件体积10、总重10千克或总体积100的限制');
  } else if(item.location!=='phaseRing')throw new IllegalAction('物品不在戒指中');
  const action=operation==='store'?'move':item.oneHanded?(item.volume>=1?'swift':'free'):'full';
  if(combat) {
    const spent=action==='full'?advanceMultiRoundAction(s,{id:`ring/${itemId}`,totalRounds:1,preActionCleared}):spendAction(s,action,{preActionCleared});
    if(!spent.result.allowed)throw new IllegalAction(spent.result.reason);a.state=spent.state;
    if(action==='full')delete a.state.extendedActions?.[`ring/${itemId}`];
  }
  a.state.possessions.items.find(i=>i.id===itemId).location=operation==='store'?'phaseRing':'carried';
  return {actor:a,result:{kind:'inventory',operation,itemId,action,elapsedMinutes:action==='full'?.1:0,vacuum:operation==='store',realTime:true}};
}

export function triggerSpiritWard(state) {
  const s=structuredClone(state);
  if(s.timedEffects?.spiritWard?.remainingMinutes>0)return {state:s,result:{protected:true,consumed:0}};
  const item=s.inventory?.find(i=>i.name==='恶灵提示符');
  if(!item||item.quantity===0)return {state:s,result:{protected:false,consumed:0}};
  if(!Number.isInteger(item.quantity))throw new RuleInputError('恶灵提示符现有数量未确认，不能假定已消耗或不存在','inventory.恶灵提示符');
  item.quantity--; (s.timedEffects??={}).spiritWard={remainingMinutes:10,source:'初始卡恶灵提示符'};
  return {state:s,result:{protected:true,consumed:1,remainingMinutes:10}};
}
