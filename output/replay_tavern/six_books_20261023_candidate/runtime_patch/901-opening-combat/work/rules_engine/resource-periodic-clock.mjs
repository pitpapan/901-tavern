import {selectedOngoingEffects} from './resource-ongoing.mjs';
import {evaluateApplicability,collectImmunities} from './resource-applicability.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
const need=message=>{const e=new Error(message);e.code='NEEDS_INPUT';e.field='periodicDamage.source';throw e;};
const battleId=root=>root?.instanceId??root?.id??'current';
export function installPeriodicRate(state,capability,{root,combat=false}={}){
 const rule=capability.periodicDamage;
 if(!rule||!Number.isFinite(rule.multiplier)||rule.multiplier<1)throw Error('持续伤害周期倍率须至少为1');
 state.resourceTimeEpoch=(state.resourceTimeEpoch??0)+1;
 capability.periodicEpoch=state.resourceTimeEpoch;
 if(combat){if(!Number.isInteger(root?.round))need('战斗周期须有实际轮号');capability.periodicOrigin={battleId:battleId(root),round:root.round};}
}
export function snapshotPeriodicSources(root){return Object.fromEntries(Object.entries(root.actors??{}).filter(([,a])=>a.state&&!a.resourceSourceUnavailable).map(([id,a])=>[id,collectImmunities(a.state,RESOURCE_DEFINITIONS)]));}
function rateFor(state,source,root){
 const caps=[...Object.values(state.resourceCapabilities??{}).filter(c=>c.id==='periodicDamageRate'),...selectedOngoingEffects(state).filter(c=>c.periodicDamage)].filter(c=>c.periodicDamage&&!c.suspended&&c.remainingRounds!==0&&c.remainingMinutes!==0&&(!c.applicability||evaluateApplicability(c.applicability,collectImmunities(state,RESOURCE_DEFINITIONS)).status!=='blocked')).sort((a,b)=>(b.power??0)-(a.power??0)||(b.periodicEpoch??0)-(a.periodicEpoch??0));
 const cap=caps[0];if(!cap)return null;
 const id=source.casterId??source.sourceActorId;
 if(id){
  const origin=root?.actors?.[id];
  if(!origin?.state||origin.resourceSourceUnavailable)need('持续伤害减速须实际来源人物的时间法则免疫记录');
  if(evaluateApplicability({families:[cap.periodicDamage.sourceImmunityFamily],grade:cap.grade},(root.periodicSourceImmunities?.[id]??collectImmunities(origin.state,RESOURCE_DEFINITIONS))).status==='blocked')return null;
 }else if(source.timeSource?.kind!=='environment'||!source.timeSource.source)need('持续伤害缺少实际来源人物或有来源的环境事实');
 return cap;
}
// A clock lives on its actual source. Deleting that source cancels the unfinished
// cycle; there is no detached damage debt. Explicit on-end settlement is separate.
export function periodicDamageTick(state,source,{root,combat=false,key='damage',elapsedPeriods=1,boundary='turn'}={}){
 const cap=rateFor(state,source,root),existing=source.periodicClocks?.[key];
 if(!cap&&!existing)return {due:true,progress:0,multiplier:1};
 const multiplier=cap?.periodicDamage.multiplier??1;
 let clock=existing;
 if(!clock){clock={progress:0};(source.periodicClocks??={})[key]=clock;}
 if(cap&&clock.epoch!==cap.periodicEpoch){
  const newlyActivated=cap.periodicEpoch>(clock.latestEpoch??clock.epoch??0);
  clock.epoch=cap.periodicEpoch;clock.latestEpoch=Math.max(clock.latestEpoch??0,cap.periodicEpoch);
  if(combat&&newlyActivated&&cap.periodicOrigin?.battleId===battleId(root)){
   clock.progress=0;
   clock.battleId=battleId(root);clock.lastRound=Math.max(cap.periodicOrigin.round,source.startedRound??source.variables?.round??cap.periodicOrigin.round);
  }
 }
 let elapsed=elapsedPeriods;
 if(combat&&['turn','turnStart','turnEnd'].includes(boundary)){
  if(!Number.isInteger(root?.round))need('持续伤害周期须实际战斗轮号');
  if(clock.battleId!==battleId(root)){clock.battleId=battleId(root);clock.lastRound=root.round-1;}
  const eventRound=root.round+(boundary==='turnEnd'?1:0);
  elapsed=Math.max(0,eventRound-clock.lastRound);clock.lastRound=eventRound;
 }
 if(!Number.isFinite(elapsed)||elapsed<0)throw Error('周期进度须为非负实际时间');
 const progress=clock.progress+elapsed/multiplier,due=progress>=1-1e-9;
 clock.progress=Math.max(0,progress-Math.floor(progress+1e-9));
 return {due,progress:clock.progress,multiplier,...(cap?{source:cap.source??cap.sourceId,epoch:cap.periodicEpoch}:{} )};
}
