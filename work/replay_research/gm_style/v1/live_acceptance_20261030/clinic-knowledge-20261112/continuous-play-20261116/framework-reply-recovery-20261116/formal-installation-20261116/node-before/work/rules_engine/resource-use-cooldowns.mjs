// One actual resource shares its use window across all declared action variants.
// Combat advances this window only at the global round boundary; field time
// uses the same six-second duration. Scene changes and JSON reload do not reset it.
export function recordResourceUse(state,{sourceId,version,maximum,cooldown}){
 if(!Number.isInteger(maximum)||maximum<1||!Number.isInteger(cooldown)||cooldown<1)throw Error('次数冷却须正整数阈值和轮数');
 const row=(state.resourceUseWindows??={})[sourceId]??={used:0,remainingRounds:1,version};
 row.used++;const cooldownStarted=row.used>=maximum;
 if(cooldownStarted)(state.resourceCooldowns??={})[sourceId]=cooldown+1;
 return {sourceId,used:row.used,maximum,cooldownStarted,remainingRounds:row.remainingRounds};
}
export function advanceResourceUseWindows(state,rounds){
 for(const [id,row]of Object.entries(state.resourceUseWindows??{})){
  row.remainingRounds=Math.max(0,row.remainingRounds-rounds);
  if(row.remainingRounds<1e-9)delete state.resourceUseWindows[id];
 }
}
