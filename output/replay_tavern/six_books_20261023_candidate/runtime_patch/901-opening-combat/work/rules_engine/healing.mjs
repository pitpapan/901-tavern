// A wound keeps its recovery restriction even when its displayed severity is B/L.
// All callers pass the actual actor so locks are consumed alongside healed slots.
export function healWounds(actor,{budget,order=['A','L','B'],ratios={A:1,L:1,B:1},mode='magical'}={}){
 const h=actor.state.health,locks=actor.recoveryLocks??[],changes=[];
 if(h.A>=actor.state.derived.hpMax)return {changes,remaining:budget};
 for(const severity of order){
  const matching=locks.filter(x=>x.severity===severity&&x.count>0);
  const locked=matching.reduce((n,x)=>n+x.count,0);
  const apply=(available,cost,lock)=>{
   if(!Number.isFinite(cost)||cost<=0)return;
   const count=Math.min(available,Math.floor(budget/cost));if(count<=0)return;
   h[severity]-=count;h.intact+=count;budget-=count*cost;if(lock)lock.count-=count;
   changes.push({severity,amount:count,...(lock?{restriction:lock.recovery}:{})});
  };
  if(mode!=='natural-A'||severity==='A')apply(Math.max(0,h[severity]-locked),ratios[severity]);
  for(const lock of matching){
   if(lock.recovery==='naturalOnly'&&(mode==='natural'||mode==='natural-A'&&severity==='A'))apply(lock.count,ratios[severity],lock);
   else if(lock.recovery==='aggravated'&&(mode==='magical'||mode==='natural-A'))apply(lock.count,ratios.A,lock);
  }
 }
 if(actor.recoveryLocks)actor.recoveryLocks=locks.filter(x=>x.count>0);
 if(h.intact>0){h.coma=false;h.deteriorationStopped=false;}
 return {changes,remaining:budget};
}
