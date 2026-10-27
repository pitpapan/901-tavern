import {selectOngoingRows} from './resource-ongoing.mjs';
// Finite schedules retain cast-time values. Covered sources still age, but they
// cannot deal damage, settle residual segments, or gain another use on restoration.
export function selectedTriggerKeys(state){
 const entries=Object.entries(state.resourceTriggers??{}).filter(([,x])=>!x.suspended&&x.remaining!==0&&x.remainingRounds!==0&&x.remainingMinutes!==0);
 const selected=new Set(selectOngoingRows(entries.map(([,x])=>x)));
 return new Set(entries.filter(([,x])=>selected.has(x)).map(([key])=>key));
}
export function queueTriggerEnd(state,trigger,{reason,effective=true}={}){
 if(!trigger||trigger.endPolicy!=='settle-remaining'||!effective||trigger.endRecorded||trigger.elapsed>=trigger.maximumOccurrences)return;
 trigger.endRecorded=true;
 (state.resourcePendingTriggerEnds??=[]).push({reason,trigger:structuredClone(trigger)});
}
