import {syncActorWounds,consumeWoundShares} from './resource-wounds.mjs';
// A wound keeps its recovery restriction even when its displayed severity is B/L.
// All callers pass the actual actor so locks are consumed alongside healed slots.
export function healWounds(actor,{budget,order=['A','L','B'],ratios={A:1,L:1,B:1},mode='magical'}={}){
 syncActorWounds(actor);
 const h=actor.state.health,ledger=actor.state.woundLedger,locks=ledger?ledger.batches.filter(b=>b.restrictions.length):(actor.recoveryLocks??[]),changes=[];
 if(h.A>=actor.state.derived.hpMax)return {changes,remaining:budget};
 // User ruling 2026-10-25: when A healing is enabled, process A before L.
 // Reordering never grants a missing severity or a missing treatment price.
 const priorities=order.includes('A')&&Number.isFinite(ratios.A)&&ratios.A>0?['A',...order.filter(x=>x!=='A')]:order;
 for(const severity of priorities){
  const matching=locks.filter(x=>x.severity===severity&&x.count>0);
  const locked=matching.reduce((n,x)=>n+x.count,0);
  const apply=(available,cost,lock)=>{
   if(!Number.isFinite(cost)||cost<=0)return;
   const count=Math.min(available,Math.floor(budget/cost));if(count<=0)return;
   consumeWoundShares(actor.state,severity,count,lock?.id);h[severity]-=count;h.intact+=count;budget-=count*cost;if(lock&&!ledger)lock.count-=count;
   changes.push({severity,amount:count,...(lock?{restriction:lock.recovery??lock.restrictions[0].recovery}:{})});
  };
  if(mode!=='natural-A'||severity==='A')apply(Math.max(0,h[severity]-locked),ratios[severity]);
  for(const lock of matching){
   const restrictions=lock.restrictions??[lock];
   const permitted=restrictions.every(r=>r.recovery==='naturalOnly'?(mode==='natural'||mode==='natural-A'&&(severity==='A'||restrictions.some(r=>r.recovery==='aggravated'))):r.recovery==='aggravated'&&(mode==='magical'||mode==='natural-A'));
   if(permitted)apply(lock.count,restrictions.some(r=>r.recovery==='aggravated')?ratios.A:ratios[severity],lock);
  }
 }
 if(ledger)syncActorWounds(actor);else if(actor.recoveryLocks)actor.recoveryLocks=locks.filter(x=>x.count>0);
 if(h.intact>0){h.coma=false;h.deteriorationStopped=false;}
 return {changes,remaining:budget};
}
