import {observeProjections} from './resource-projections.mjs';
import {observeResourceObscuration} from './resource-obscuration.mjs';
// Schedule actual protected/tracked targets; legacy encounters without these
// sources retain their established visibility. Explicit scene opt-in handles
// ordinary concealment using the same engine, never invented sensory ranges.
import {observeDecoyIllusions} from './resource-decoys.mjs';
import {actualSenses} from './resource-senses.mjs';
import {detectionProtectionSources} from './resource-detection.mjs';
import {resolvePerceptionEvent} from './resource-observation.mjs';
import {observationKey,perceptionEpoch} from './resource-observation-state.mjs';
import {canObserve,locationPrecision} from './combat/map.mjs';
import {rememberDiscovery} from './resource-discovery.mjs';
export function schedulePassivePerception(root,{drawDice,before,reason='state-change',mode,observerId,targetId,movement}={}){
 if(!root.map||!Number.isInteger(root.round))return [];
 observeResourceObscuration(root);
 observeDecoyIllusions(root);
 const rows=observeProjections(root,{drawDice}),settings=root.ruleScene?.perception,actors=Object.values(root.actors).filter(a=>a.present&&a.state);
 for(const target of actors){
  if(targetId&&target.id!==targetId)continue;
  const protectedTarget=detectionProtectionSources(target.state).some(x=>!x.suppressedBy.length);
  for(const observer of actors){
   if(observer.id===target.id||observerId&&observer.id!==observerId)continue;
   const tracked=Object.values(observer.state.resourceDetectionContests??{}).some(x=>x.targetId===target.id);
   if(!mode&&!protectedTarget&&!tracked&&!(settings?.source&&settings.enabled))continue;
   // Visible before a new protection took effect is historical evidence only.
   if(before?.actors[observer.id]?.present&&before.actors[target.id]?.present){
    try{if(canObserve(before,before.actors[target.id],observer.id))rememberDiscovery(root,{observerId:observer.id,targetId:target.id,source:'js/before-perception-transition',information:{detected:true,precision:'exact',position:before.actors[target.id].position},historical:true});}
    catch(e){if(e.code!=='NEEDS_INPUT')throw e;}
   }
    let previousPrecision='none';if(mode==='search'){try{previousPrecision=locationPrecision(root,target,observer.id);}catch(e){if(e.code!=='NEEDS_INPUT')throw e;}}

   const senses=actualSenses(observer,target),selectors=Object.keys(senses);
   for(const selector of selectors){
    if(selector==='vision'&&observer.windSense&&observer.visionAvailable!==true)continue;
    const source=senses[selector].source,key=observationKey(target.id,source);
    const pendingEvent=observer.state.resourcePendingPerceptions?.[key]?.event;
    const event=pendingEvent?.mode&&!mode?structuredClone(pendingEvent):{...(movement?{movement}:{}),...(mode?{mode,previousPrecision}:{}),type:'passivePerception',source:'js/'+reason,targetId:target.id,senseSource:selector,...(settings?.source&&settings.concealmentWaived?.includes(target.id)?{concealmentWaived:true}:{})};
    let draws=0;
    try{
     const result=resolvePerceptionEvent(root,observer.id,event,{combat:true,drawDice:()=>{draws++;return drawDice();}});
     if(observer.state.resourcePendingPerceptions)delete observer.state.resourcePendingPerceptions[key];
     rows.push({observerId:observer.id,targetId:target.id,senseSource:source,...result});
    }catch(e){
     // All fact/ruling checks precede the first die; unexpected computation
     // failures cannot be disguised as missing parameters after spending dice.
     if(draws||!['NEEDS_INPUT','RULE_UNRESOLVED','IMPLEMENTATION_GAP'].includes(e.code))throw e;
     const pending={event,epoch:perceptionEpoch(root,true),status:e.code==='RULE_UNRESOLVED'?'rule_unresolved':e.code==='IMPLEMENTATION_GAP'?'implementation_gap':'needs_input',field:e.field,reason:e.message};
     (observer.state.resourcePendingPerceptions??={})[key]=pending;
     rows.push({observerId:observer.id,targetId:target.id,senseSource:source,pending});
    }
   }
  }
 }
 return rows;
}
