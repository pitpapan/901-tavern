// Shared saved-contest policy; querying a map never draws dice.
import {detectionLimit} from './resource-detection.mjs';
import {effectGrade} from './resource-applicability.mjs';
export const observationKey=(targetId,source)=>JSON.stringify([targetId,source]);
export function perceptionEpoch(root,combat=Number.isInteger(root.round)){
 return combat?'combat/'+(root.instanceId??root.id??'current')+'/'+root.round:'field/'+Math.floor((root.ruleScene?.resourceClockMinutes??0)*10+1e-9);
}
export function reusableObservation(root,observerId,targetId,sense,old,{combat}={}){
 if(!old)return false;
 const epoch=perceptionEpoch(root,combat),level=effectGrade(sense).level;
 // First acquisition of a higher grade grants a fresh passive check, even in
 // the same round. Dropping and reobtaining it cannot reroll again.
 if(level>effectGrade(old.sense).level&&!(old.seenLevels??[]).includes(level))return false;
 if(old.epoch===epoch)return true;
 if(old.epoch.slice(0,old.epoch.lastIndexOf('/'))!==epoch.slice(0,epoch.lastIndexOf('/')))return false;
 const query={observerId,targetId,sense:{...sense,evaluateContest:true,contest:old.contest}};
 const current=detectionLimit(root,query).precision;
 const maximum=detectionLimit(root,{...query,sense:{...query.sense,...(old.contest.mode==='search'?{rangeBand:'sensitive'}:{}),contest:{source:'js/maximum-location-bound',concealmentWaived:true}}}).precision;
 return current!=='none'&&old.precision===current&&current===maximum;
}
