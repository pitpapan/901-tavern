// Historical perception receipts; a delayed observation never reveals live position.
import {rememberDiscovery} from './resource-discovery.mjs';
import {detectionLimit,filterDetectedInformation} from './resource-detection.mjs';
import {selectedOngoingEffects} from './resource-ongoing.mjs';
import {collectImmunities,effectGrade,evaluateApplicability} from './resource-applicability.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
const need=(message,field)=>{const e=new Error(message);e.code='NEEDS_INPUT';e.field=field;throw e;};
export function perceptionDelay(root,{observerId,targetId,sense}){
 const observer=root.actors[observerId],target=root.actors[targetId];
 if(!observer?.state||!target?.state)need('侦测须实际观察者与目标','perception.actors');
 const candidates=selectedOngoingEffects(target.state).filter(x=>x.detectionDelay);
 if(!candidates.length||sense?.visual===true)return null;
 if(!sense?.source||typeof sense.visual!=='boolean')need('须实际感官来源及是否视觉','perception.sense');
 const applicable=candidates.filter(x=>evaluateApplicability({families:[x.detectionDelay.sourceImmunityFamily],grade:x.grade},collectImmunities(observer.state,RESOURCE_DEFINITIONS)).status!=='blocked');
 if(!applicable.length)return null;
 const level=effectGrade(sense).level;if(level===null)need('须侦测能力的实际等级，不能从角色等级推定','perception.sense.grade');
 return applicable.filter(x=>level<x.detectionDelay.belowLevel).sort((a,b)=>b.detectionDelay.rounds-a.detectionDelay.rounds)[0]??null;
}
export function recordPerception(root,request,{combat=false}={}){
 const detection=detectionLimit(root,request);request={...request,information:filterDetectedInformation(request.information,detection)};
 if(detection.precision==='none')return {pending:false,information:request.information,historical:false,detection};
 const effect=perceptionDelay(root,request);
 if(!effect){rememberDiscovery(root,{...request,source:request.sense.source});return {pending:false,information:structuredClone(request.information),historical:false,detection};}
 const s=root.actors[request.targetId].state;
 if(combat&&!Number.isInteger(root.round))need('须实际战斗轮号','perception.round');
 s.resourcePerceptionSerial=(s.resourcePerceptionSerial??0)+1;
 const receipt={id:s.resourcePerceptionSerial,sourceInstanceId:effect.id,observerId:request.observerId,targetId:request.targetId,sense:structuredClone(request.sense),information:structuredClone(request.information),historical:true,
  sampledRound:combat?root.round:null,sampledClock:s.resourcePerceptionClock??0,dueClock:(s.resourcePerceptionClock??0)+effect.detectionDelay.rounds/10,
  ...(combat?{battleId:root.instanceId??root.id??'current',dueRound:root.round+effect.detectionDelay.rounds}:{})};
 (s.resourcePerceptionQueue??=[]).push(receipt);
 return {pending:true,receiptId:receipt.id,dueRound:receipt.dueRound,delayRounds:effect.detectionDelay.rounds};
}
export function releasePerceptions(state,instanceId,reason='source-ended'){
 for(const row of state.resourcePerceptionQueue??[])if(row.sourceInstanceId===instanceId&&!row.delivered){row.delivered=true;row.deliveryReason=reason;}
}
export function advancePerception(state,{root,combat=false,minutes=0}={}){
 if(!state.resourcePerceptionQueue?.length)return;
 state.resourcePerceptionClock=(state.resourcePerceptionClock??0)+minutes;
 for(const row of state.resourcePerceptionQueue)if(!row.delivered){
  const sameCombat=combat&&row.battleId===(root?.instanceId??root?.id??'current');
  if(sameCombat?root.round>=row.dueRound:state.resourcePerceptionClock>=row.dueClock-1e-9){row.delivered=true;row.deliveryReason='due';}
 }
 if(root)for(const row of state.resourcePerceptionQueue)if(row.delivered&&!row.discoveryRecorded){rememberDiscovery(root,{...row,source:row.sense.source,historical:true});row.discoveryRecorded=true;}
}
export function deliveredPerceptions(root,observerId){return Object.values(root.actors).flatMap(a=>(a.state.resourcePerceptionQueue??[]).filter(x=>x.delivered&&x.observerId===observerId).map(x=>structuredClone(x)));}
