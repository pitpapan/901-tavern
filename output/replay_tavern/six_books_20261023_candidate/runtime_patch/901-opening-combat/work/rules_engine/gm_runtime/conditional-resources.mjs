import {check,effectiveAttribute,spendAction,statusLevel,resolveGeneticUnlock,endGeneticLock,shiftGeneticLock,actionEligibility} from '../core.mjs';
import {RuleInputError,IllegalAction,saveProfile} from '../combat/mechanics.mjs';
import {runWizard} from './wizard-host.mjs';
const need=(m,k)=>{throw new RuleInputError(m,k);},fail=m=>{throw new IllegalAction(m);};
export function assertEnergyAllowed(state,{magical=false,resource}={}){
 if(state.antiMagicRestraints?.some(x=>x.locked&&(magical||x.energyResources?.includes(resource))))fail('已锁闭的厌魔石符文锁链使这项施法/能量使用失败');
}
const mana=(a,o,cost)=>{const key=o.manaResource;if(!key||!a.state.resources[key])need('须指定本人实际具有的适用魔力池','manaResource');assertEnergyAllowed(a.state,{magical:true,resource:key});const pool=a.state.resources[key];if(pool.current<cost)fail('魔力不足');pool.current-=cost;return pool;};
const cast=(a,o,dice,dc,extra={})=>{const p=o.casting;if(!p?.source||!p.attribute||!p.skill)need('须按此人物实际施法体系登记属性/技能/子技能','casting');return check(a.state,{attribute:p.attribute,skill:p.skill,...(p.sub?{sub:p.sub}:{}),...extra,context:{casting:true,specialAbility:true,...extra.context},dice:dice(),...(dc===undefined?{}:{dc})});};
const plan=(o,r)=>{const p=o.plans?.[r.part];if(!p?.source)need('请选择已登记的实际目标/时间/操作条件','plans');return p;};
function paid(a,action,combat,preActionCleared){if(combat){const out=spendAction(a.state,action,{preActionCleared,context:a.statusPermission});if(!out.result.allowed)fail(out.result.reason);a.state=out.state;}}
const inside=(p,b)=>p&&p[0]>=b[0]&&p[0]<=b[0]+b[2]&&p[1]>=b[1]&&p[1]<=b[1]+b[3];
// PHB 非战斗行动与战斗行动42: an interruption fails only if continuation
// is impossible. Damage alone does not cancel a channel.
export function settleInterruptedTeleports(root){
 const results=[];for(const [id,o]of Object.entries(root.ruleScene?.objects??{}))if(o.type==='teleport')for(const [actorId,ch]of Object.entries(o.channels??{})){
   const a=root.actors[actorId],s=a.state;
   const unable=!actionEligibility(s,'free').allowed||['冻结','麻痹','纠缠','精神束缚'].some(t=>statusLevel(s,t).severe);
   if(!unable)continue;
   const refund=Math.floor(ch.cost/2),pool=s.resources[o.manaResource];pool.current=Math.min(pool.max,pool.current+refund);
   delete o.channels[actorId];if(o.failures)delete o.failures[actorId];delete s.channeling;
   results.push({objectId:id,actorId,failed:true,refund,source:'PHB非战斗行动与战斗行动42／人物卡1693'});
 }return results;
}
export function settleEngageReturns(root){
 const changes=[];
 for(const [id,a]of Object.entries(root.actors??{})){
   const u=a.state.underworld;if(!u)continue;
   const wearer=root.actors[u.wearerId];
   if(wearer?.state.sleeping)u.wearerWasSleeping=true;
   if(u.wearerWasSleeping&&!wearer?.state.sleeping&&!u.trap?.blocksExit){delete a.state.underworld;changes.push({actorId:id,returned:true,reason:'wearerAwoke'});}
 }return changes;
}
export function assertEmbodied(state,request,objects={}){
 if(!state.underworld)return;
 if(request.operation==='exit'&&objects[request.objectId]?.type==='phantomRings')return;
 if(['time','status','status_event','save'].includes(request.action)||['end','statusEvent'].includes(request.abilityId))return;
 fail('意识正处于Underworld；须先退出才能操作现实肉身');
}
function relocate(root,a,p){
 if(!Array.isArray(p.position)||p.position.length!==2||!p.position.every(Number.isFinite))need('须登记实际落点','position');
 for(const o of Object.values(root.ruleScene?.objects??{}))if(o.type==='arrays'&&o.arrays?.spatial?.active&&inside(a.position??a.state.position,o.boundary)!==inside(p.position,o.boundary))fail('封印阵阻止跨界空间移动');
 if(root.mode==='combat')a.position=[...p.position];a.state.position=[...p.position];
 if(p.location)a.state.location=p.location;
}
export function runConditionalResource(root,r,{combat=false,preActionCleared=false,drawDice,actorTemplates={}}={}){
 const o=root.ruleScene.objects[r.objectId],a=root.actors[r.actorId];let result,action;
 const selectedWill=r.willpower===true;
 if(selectedWill&&!(o.type==='teleport'&&r.operation==='lower'||o.type==='ancientBelt'&&r.operation==='defend'))fail('本机制的意志选项只适用于单次施法检定');
 const castAction=(actor,item,dice,dc)=>{
   const roll=cast(actor,item,dice,dc,{willpower:selectedWill});
   if(roll.eligible)actor.state.will.current-=roll.willCost??0;return roll;
 };
 if(o.type==='geneticLock'){
   const p=r.operation==='end'&&!r.part?{source:o.source}:plan(o,r);
   if(r.operation==='unlock'){
     if(p.authorized!==true||!['natural','voluntary'].includes(p.mode))need('须有合格危机或本人明确主动开启的登记计划','geneticLock.plan');
     const input={stage:p.stage,mode:p.mode,attribute:p.attribute,opportunity:{id:`${r.objectId}/${r.part}`,source:p.source,kind:p.mode==='natural'?'qualifying_crisis':'explicit_rule'}};
     const ready=resolveGeneticUnlock(a.state,input);if(ready.status!=='ready')need(ready.reason,'geneticLock');
     action=p.mode==='voluntary'?(p.stage===1?'move':'full'):null;if(action)paid(a,action,combat,preActionCleared);
     if(o.resolvedPlans?.includes(r.part))fail('这次开启尝试已经结算');
     const out=resolveGeneticUnlock(a.state,{...input,dice:drawDice()});a.state=out.state;(o.resolvedPlans??=[]).push(r.part);result=out.result;
   }else if(r.operation==='unlockBoth'){
     if(p.authorized!==true||p.mode!=='voluntary'||!['力量','敏捷'].includes(p.attribute))need('双开须本人主动选择和二阶属性','geneticLock.plan');
     if(a.state.xp<21)fail('同轮双开须预备21XP');
     if(o.resolvedPlans?.includes(r.part))fail('这次开启尝试已经结算');
     if(!Number.isInteger(a.state.geneticLock?.successfulUnlocks?.[2]))need('须有二阶解锁履历','geneticLock.history');
     action='full';paid(a,action,combat,preActionCleared);const stages=[];
     for(const stage of [1,2]){
       const input={stage,mode:'voluntary',attribute:p.attribute,opportunity:{id:`${r.objectId}/${r.part}/${stage}`,source:p.source,kind:'explicit_rule'}};
       const ready=resolveGeneticUnlock(a.state,input);if(ready.status!=='ready')need(ready.reason,'geneticLock');
       const out=resolveGeneticUnlock(a.state,{...input,dice:drawDice()});a.state=out.state;stages.push(out.result);if(!out.result.success)break;
     }
     (o.resolvedPlans??=[]).push(r.part);result={stages,cost:stages.reduce((n,x)=>n+x.cost,0),success:stages.length===2&&stages.every(x=>x.success)};
   }else if(r.operation==='shift'){
     action='swift';paid(a,action,combat,preActionCleared);a.state=shiftGeneticLock(a.state,p.attribute);result={attribute:p.attribute};
   }else if(r.operation==='end'){
     action='free';paid(a,action,combat,preActionCleared);const out=endGeneticLock(a.state,{dice:drawDice()});a.state=out.state;result=out.result;
   }else if(r.operation==='allocateBacklash'){
     const pending=a.state.geneticLock?.pendingPainDamage,allocation=p.allocation;
     if(!pending||!allocation||Object.keys(allocation).some(k=>!['力量','意志'].includes(k))||Object.values(allocation).some(n=>!Number.isInteger(n)||n<0)||Object.values(allocation).reduce((a,b)=>a+b,0)!==pending)need('须由承受者分配实际待结算属性伤害到力量/意志','geneticLock.allocation');
     for(const [key,n]of Object.entries(allocation))a.state.attributeDamage[key]=(a.state.attributeDamage[key]??0)+n;
     delete a.state.geneticLock.pendingPainDamage;result={allocation};
   }else fail('基因锁请选择unlock/shift/end/allocateBacklash');
   return {objectId:r.objectId,type:o.type,operation:r.operation,action,...result};
 }
 if(o.type==='ancientBelt')return runWizard(root,r,o,a,{combat,preActionCleared,drawDice,mana,cast:castAction,paid});
 if(o.type==='teleport'){
   const p=plan(o,r);if(p.languageAvailable!==true||p.gesturesAvailable!==true)need('传送需要实际可用的言语与动作成份','components');
   if(['冻结','麻痹','纠缠','精神束缚'].some(t=>statusLevel(a.state,t).severe))fail('当前定身妨碍实际施法动作成份');
   if(r.operation==='lower'){
     const target=root.actors[p.targetId??r.actorId];if(!target)need('缺少实际传送目标','targetId');
     const other=target!==a,limit=other?25:50;
     if(other&&!(p.willing===true||p.unconscious===true))fail('目标须自愿或无意识');
     if(other&&!(Number.isFinite(p.casterDistance)&&p.casterDistance<=1))fail('目标须在施法者1米内');
     if(!Number.isFinite(p.distance)||p.distance<0||p.distance>limit||p.visible!==true||p.unobstructed!==true)fail('下位传送落点须在有效距离和无遮挡视野内');
     if(!Number.isInteger(p.carriedVolume)||p.carriedVolume<0)need('须登记实际携物体积','carriedVolume');
     let volume=p.carriedVolume;
     if(other)volume+=Math.max(0,target.state.size-5);
     const cost=1+Math.max(0,volume-2),dc=volume>=2?volume:undefined;
     action='full';paid(a,action,combat,preActionCleared);mana(a,o,cost);
     if(selectedWill&&dc===undefined)fail('本次下位传送无需判定，不消耗意志');
     const roll=dc===undefined?null:castAction(a,o,drawDice,dc);if(roll&&!roll.eligible)fail(roll.reason);
     if(!roll||roll.success)relocate(root,target,p);
     result={cost,roll,success:!roll||roll.success,position:target.state.position,instant:true};
   }else if(['upper','upperFail'].includes(r.operation)){
     if(p.samePlane!==true||p.visited!==true||p.remembered!==true)fail('上位传送仅能到同位面/世界曾到过且记得之处');
     if(!Number.isFinite(p.distance)||p.distance<0)need('须有实际距离','distance');
     const steps=Math.max(1,Math.ceil(p.distance/1000));
     const {failureConfirmed,...fixedPlan}=p;const signature=JSON.stringify(fixedPlan);o.channels??={};let channel=o.channels[r.actorId];
     if(channel&&channel.signature!==signature)fail('累计施法途中不能更换目标与条件');
     if(r.operation==='upperFail'){
       if(!channel||p.failureConfirmed!==true&&o.failures?.[r.actorId]?.source===undefined)need('须确认这次累计施法实际失败；中断不自动等于失败','failureConfirmed');
       const refund=Math.floor(channel.cost/2),pool=a.state.resources[o.manaResource];pool.current=Math.min(pool.max,pool.current+refund);delete o.channels[r.actorId];if(o.failures)delete o.failures[r.actorId];delete a.state.channeling;return {action:'free',refund,failed:true};
     }
     if(!channel){const cost=8+steps;mana(a,o,cost);channel=o.channels[r.actorId]={signature,cost,target:100*steps,successes:0,periods:0,...(combat?{readyRound:root.round+10}:{})};}
     if(combat&&root.round<channel.readyRound){a.state.channeling={objectId:r.objectId,part:r.part,readyRound:channel.readyRound};return {action:'free',channeling:true,...channel};}
     const roll=cast(a,o,drawDice,undefined,{context:{extended:true}});if(!roll.eligible)fail(roll.reason);channel.successes+=roll.total;channel.periods++;
     const complete=channel.successes>=channel.target;result={...channel,roll,complete,...(!combat?{elapsedMinutes:1}:{})};
     if(complete){relocate(root,a,p);delete o.channels[r.actorId];delete a.state.channeling;}else if(combat){channel.readyRound=root.round+10;a.state.channeling={objectId:r.objectId,part:r.part,readyRound:channel.readyRound};}
     action='full';paid(a,action,combat,preActionCleared);
   }else fail('请选择lower、upper或已确认的upperFail');
 }else if(o.type==='magicConstitution'){
   if(r.operation==='capacity'){
     if(!['ordinary','mutou'].includes(o.variant))need('须按实际人物选择普通或沐瞳魔力体质','variant');
     let spells=0;if(o.variant==='mutou'){if(!Array.isArray(o.learnedSpells))need('须登记实际已学法术及是否为独立购买体系','learnedSpells');spells=o.learnedSpells.filter(s=>s.source&&s.separateSystem===false).length;}
     result={maximum:effectiveAttribute(a.state,'智力')+effectiveAttribute(a.state,'感知')+Math.min(effectiveAttribute(a.state,'智力'),spells)};
     const pool=a.state.resources[o.manaResource];if(!pool)need('须先登记实际魔力当前值，不能由容量公式赠送能量','manaResource');pool.max=result.maximum;pool.current=Math.min(pool.current,pool.max);action='free';
   }else if(r.operation==='sense'){
     const p=plan(o,r);if(!Number.isFinite(p.activationLevel)||!Number.isFinite(p.distance))need('须有实际波动等级和距离','sense');
     const level=p.kind==='item'?p.activationLevel-2:p.kind==='caster'?p.activationLevel-3:p.activationLevel;
     const range=Math.max(0,(effectiveAttribute(a.state,'感知')+level)*11);
     if(p.concealed===true)need('原条目仅给未掩饰波动；此隐藏手段须有实际侦破规则','sense.concealment');
     result={range,level,detected:p.concealed!==true&&p.dimensionalStorage!==true&&p.distance<=range};action='free';
   }else if(['sleep','meditate','power'].includes(r.operation)){
     const p=plan(o,r),pool=a.state.resources[o.manaResource];if(!pool)need('实际适用魔力池未登记','manaResource');
     if(r.operation==='sleep'){
       if(!Number.isFinite(p.minutes)||p.minutes<=0||!p.dayId||!p.intervalId)need('睡眠须有实际分钟数、当天记录与本次时间段ID','sleep');
       const clock=(a.state.magicSleep??={})[p.dayId]??={minutes:0,credited:0,intervals:[]};
       if(clock.intervals.includes(p.intervalId))fail('这一睡眠时间段已结算');
       const before=clock.credited;clock.minutes+=p.minutes;clock.credited=Math.min(pool.max,Math.floor(pool.max*clock.minutes/240));clock.intervals.push(p.intervalId);const recovered=Math.min(pool.max-pool.current,clock.credited-before);pool.current+=recovered;result={recovered,dailyCredit:clock.credited,elapsedMinutes:p.minutes};
     }else if(r.operation==='meditate'){
       if(p.minutes!==60)need('此魔力体质冥想每次须完整一小时','minutes');
       if(statusSevere(a.state,'亢奋'))fail('重度亢奋不能冥想恢复');
       const roll=check(a.state,{attributes:['感知','智力'],context:{extended:true,periodMinutes:60},dice:drawDice()});if(!roll.eligible)fail(roll.reason);const recovered=Math.min(pool.max-pool.current,roll.total);pool.current+=recovered;result={roll,recovered,elapsedMinutes:60};
     }else{if(!Number.isInteger(p.cost)||p.cost<0||p.compatible!==true)need('须登记实际适用器物的明确费用','cost');mana(a,o,p.cost);result={cost:p.cost,itemId:p.itemId};}
     action=r.operation==='power'?p.action:undefined;if(combat&&r.operation!=='power')fail('完整睡眠/冥想须经过相应实际时间，不能在一个战斗动作内完成');if(action)paid(a,action,combat,preActionCleared);
   }else fail('未定义的魔力体质操作');
 }else if(o.type==='phantomRings'){
   const p=r.operation==='exit'?{source:o.source,wearerId:a.state.underworld?.wearerId}:plan(o,r),target=root.actors[p.wearerId];if(!target||r.operation!=='exit'&&p.ringWorn!==true)need('须有实际佩戴该戒指的目标','wearerId');
   if(r.operation==='sleep'){
     action='standard';paid(a,action,combat,preActionCleared);mana(a,o,1);
     const full={...structuredClone(actorTemplates[p.wearerId]??{}),...target.combatCarry,...target};const profile=full.combatProfile||full.kind?saveProfile(full,'will'):null;
     const roll=check(target.state,{...(profile?{poolBase:profile.dp,attributeAutoOverride:profile.fixed}:{attributes:['意志','风度']}),context:{willResistance:true},dc:4,dice:drawDice()});
     if(!roll.success)target.state.sleeping={source:o.source,kind:'normal',appliedBy:r.actorId};result={cost:1,dc:4,roll,sleeping:!roll.success};
   }else if(r.operation==='engage'){
     if(a.state.underworld)fail('已进入精神世界');
     action='full';paid(a,action,combat,preActionCleared);mana(a,o,0);
     a.state.underworld={wearerId:p.wearerId,objectId:r.objectId,source:o.source,bodyDisposition:'remains',returnRule:'ownBody',timeRatio:1,bodyPosition:structuredClone(a.position??a.state.position),wearerWasSleeping:!!target.state.sleeping,...(p.trap?.source?{trap:structuredClone(p.trap)}:{})};result={cost:0,underworld:a.state.underworld};
   }else if(r.operation==='exit'){
     if(!a.state.underworld||a.state.underworld.objectId!==r.objectId)fail('未通过此戒指进入精神世界');
     if(a.state.underworld.trap?.blocksExit)fail('场景明确困锁阻止退出');
     action='full';paid(a,action,combat,preActionCleared);delete a.state.underworld;result={returned:true,cost:0};
   }else fail('请选择sleep、engage或exit');
 }else if(o.type==='antiMagicRock'){
   const p=plan(o,r);
   if(r.operation==='lock'||r.operation==='unlock'){
     const target=root.actors[p.targetId];if(!target||p.runeProcessed!==true||!Array.isArray(p.energyResources))need('须登记实际符文锁链、目标及被约束能量类别','restraint');
     target.state.antiMagicRestraints??=[];let lock=target.state.antiMagicRestraints.find(x=>x.objectId===r.objectId);if(!lock){lock={objectId:r.objectId,source:o.source,energyResources:[...p.energyResources]};target.state.antiMagicRestraints.push(lock);}
     if(!p.action)need('锁闭/解除动作须按实际器物确认','action');action=p.action;paid(a,action,combat,preActionCleared);lock.locked=r.operation==='lock';result={targetId:p.targetId,locked:lock.locked};
   }else if(r.operation==='resistance'){
     if(!['D','C','B','A','S'].includes(p.grade)||typeof p.magicalEnergy!=='boolean'||p.exception===true&&!p.exceptionSource)need('须确认攻击等级和魔幻能量类别；例外须具体来源','grade/exception');
     result={immune:p.magicalEnergy&&p.grade!=='S'&&!p.exception};action='free';
   }else fail('请选择lock、unlock或resistance');
 }else return null;
 return {objectId:r.objectId,type:o.type,operation:r.operation,action,...result};
}
function statusSevere(s,t){return s.statuses.some(x=>x.type===t&&x.points>effectiveAttribute(s,'意志'));}
