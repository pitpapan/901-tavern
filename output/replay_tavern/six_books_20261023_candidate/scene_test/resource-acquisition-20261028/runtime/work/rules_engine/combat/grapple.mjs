import {weightedDraw} from '../rule-random.mjs';
import {changeWill} from '../resource-counters.mjs';
import {actorCheckRules} from '../gm_runtime/actor-rules.mjs';
import {check,effectiveAttribute,effectiveSkill} from '../core.mjs';
import {RuleInputError,IllegalAction} from './mechanics.mjs';

// D13: actual connected grapple group, with explicit line-of-fire exclusions.
export function grappleMembers(b,targetId,attackerId){
 const ids=new Set([targetId]);let changed=true;
 while(changed){changed=false;for(const a of Object.values(b.actors)){
   const links=[a.state.grapple?.holderId,...(a.claws??[])].filter(Boolean);
   if(ids.has(a.id)||links.some(id=>ids.has(id)))for(const id of [a.id,...links])if(id!==attackerId&&!ids.has(id)){ids.add(id);changed=true;}
 }}
 const excluded=b.ruleScene?.grappleOcclusion?.[attackerId];
 return [...ids].map(id=>b.actors[id]).filter(a=>a?.present&&a.id!==attackerId&&!(excluded?.source&&excluded.excludedIds?.includes(a.id)));
}
export function weightedGrappleTarget(members,drawDice){
 const weights=members.map(a=>Math.max(1,a.state.size??5));
 const {index,...receipt}=weightedDraw(weights,drawDice,{field:'grapple.dice'});
 return {target:members[index],...receipt};
}

export function grappleChoice(a,declared) {
  if(['strength','agility'].includes(declared))return declared;
  if(a.controller==='player')throw new RuleInputError('玩家须选择力量＋肉搏挣脱或敏捷＋运动逃脱',`${a.id}.grappleDefense`);
  return effectiveAttribute(a.state,'力量')+effectiveSkill(a.state,'肉搏').level>=effectiveAttribute(a.state,'敏捷')+effectiveSkill(a.state,'运动').level?'strength':'agility';
}
export function grappleContest(active,passive,{drawDice,defense,activeAgility=false,drag=false}={}) {
  const method=drag?'strength':grappleChoice(passive,defense),sizeA=active.state.size??5,sizeB=passive.state.size??5;
  const roll=(a,attribute,skill,sub,sizePenalty)=>check(a.state,{attribute,...(skill?{skill}:{}),...(sub?{sub}:{}),modifier:actorCheckRules(a,{attribute,skill,sub}).modifier-sizePenalty+(a.willCheckReady||a.willDefenseReady?3:0),dice:drawDice(),context:{physical:true,motion:true,willSpent:a.willCheckReady===true||a.willDefenseReady===true}});
  const a=roll(active,activeAgility?'敏捷':'力量',drag?undefined:activeAgility?'运动':'肉搏',!drag&&active.kind==='chuul'?'螯钳':undefined,Math.max(0,sizeB-sizeA));
  const p=roll(passive,method==='agility'?'敏捷':'力量',drag?undefined:method==='agility'?'运动':'肉搏',!drag&&passive.kind==='chuul'&&method==='strength'?'螯钳':undefined,Math.max(0,sizeA-sizeB));
  if(passive.willDefenseReady){changeWill(passive.state,-1);delete passive.willDefenseReady;}
  return {active:a,passive:p,success:a.total>=p.total,margin:Math.max(0,a.total-p.total)};
}
export function attachClaw(b,holder,target,{drawDice,defense,claw}={}) {
  if(target.state.size>7)return {success:false,reason:'目标体积超过7'};
  const index=claw??holder.claws.findIndex(x=>!x);
  if(index<0||holder.claws[index])throw new IllegalAction('没有可用的空螯');
  const contest=grappleContest(holder,target,{drawDice,defense});
  if(contest.success){
    if(target.state.grapple&&target.state.grapple.holderId!==holder.id)throw new RuleInputError('多人擒抱需确认各方控制关系','grapple.holders');
    holder.claws[index]=target.id;const old=target.state.grapple;target.state.grapple={holderId:holder.id,claw:index,claws:[...new Set([...(old?.claws??(old?[old.claw]:[])),index])],margin:Math.max(old?.margin??0,contest.margin),pressed:old?.pressed??false,sinceRound:old?.sinceRound??b.round};
  }
  return {targetId:target.id,claw:index,...contest};
}
export function releaseGrapple(b,target) {
  const g=target.state.grapple;if(!g)return;
  const holder=b.actors[g.holderId];if(holder?.claws)holder.claws=holder.claws.map(id=>id===target.id?null:id);
  delete target.state.grapple;
}
