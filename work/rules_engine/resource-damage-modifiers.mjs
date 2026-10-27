import {resourceEffects} from './resource-definitions.mjs';
import {stackEffects} from './resource-effects.mjs';
// An incoming increase adjusts already capped source damage, before defenses.
// Severity splits are one damage amount, not independent extra triggers.
export function adjustIncomingDamage(actor,segments,event={}){
 const next=segments.map(s=>({...s})),groups=new Map(),receipts=[];
 for(const [index,s]of next.entries()){
  if(!(s.amount>0)||s.unavoidable)continue;
  const key=JSON.stringify([s.kind,s.energyType??null,s.damageType??null]);
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(index);
 }
 for(const indexes of groups.values()){
  const first=next[indexes[0]],context={kind:first.kind,energyType:first.energyType,damageType:first.damageType,sourceActorId:event.sourceActorId,damageNature:event.damageNature??'unclassified'};
  const rows=resourceEffects(actor.state,'incomingDamage',context),bonus=stackEffects(rows);if(!bonus.value)continue;
  const mixed=new Set(indexes.map(i=>next[i].severity)).size>1;
  if(mixed&&rows.some(row=>row.value&&row.damageAllocation!=='lightest-existing')){const e=new Error('混合伤型的防护前增量须声明已采用的分配策略');e.code='UNAVAILABLE';e.field='damage.incomingSeverity';throw e;}
  const index=indexes.reduce((best,i)=>['B','L','A'].indexOf(next[i].severity)<['B','L','A'].indexOf(next[best].severity)?i:best,indexes[0]);
  next[index].amount+=bonus.value;
  receipts.push({stage:'before-protection',kind:first.kind,energyType:first.energyType,severity:next[index].severity,added:bonus.value,sources:bonus.sources});
 }
 return {segments:next,receipts};
}
