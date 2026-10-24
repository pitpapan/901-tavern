import {check,effectiveAttribute,spendAction,statusLevel} from '../core.mjs';
import {RuleInputError,IllegalAction,saveProfile} from '../combat/mechanics.mjs';
import {runWizard} from './wizard-host.mjs';
const need=(m,k)=>{throw new RuleInputError(m,k);},fail=m=>{throw new IllegalAction(m);};
export function assertEnergyAllowed(state,{magical=false,resource}={}){
 if(state.antiMagicRestraints?.some(x=>x.locked&&(magical||x.energyResources?.includes(resource))))fail('已锁闭的厌魔石符文锁链使这项施法/能量使用失败');
}
const mana=(a,o,cost)=>{const key=o.manaResource;if(!key||!a.state.resources[key])need('须指定本人实际具有的适用魔力池','manaResource');assertEnergyAllowed(a.state,{magical:true,resource:key});const pool=a.state.resources[key];if(pool.current<cost)fail('魔力不足');pool.current-=cost;return pool;};
const cast=(a,o,dice,dc)=>{const p=o.casting;if(!p?.source||!p.attribute||!p.skill)need('须按此人物实际施法体系登记属性/技能/子技能','casting');return check(a.state,{attribute:p.attribute,skill:p.skill,...(p.sub?{sub:p.sub}:{}),context:{casting:true,specialAbility:true},dice:dice(),...(dc===undefined?{}:{dc})});};
const plan=(o,r)=>{const p=o.plans?.[r.part];if(!p?.source)need('请选择已登记的实际目标/时间/操作条件','plans');return p;};
function paid(a,action,combat,preActionCleared){if(combat){const out=spendAction(a.state,action,{preActionCleared,context:a.statusPermission});if(!out.result.allowed)fail(out.result.reason);a.state=out.state;}}
const inside=(p,b)=>p&&p[0]>=b[0]&&p[0]<=b[0]+b[2]&&p[1]>=b[1]&&p[1]<=b[1]+b[3];
function relocate(root,a,p){
 if(!Array.isArray(p.position)||p.position.length!==2||!p.position.every(Number.isFinite))need('须登记实际落点','position');
 for(const o of Object.values(root.ruleScene?.objects??{}))if(o.type==='arrays'&&o.arrays?.spatial?.active&&inside(a.position??a.state.position,o.boundary)!==inside(p.position,o.boundary))fail('封印阵阻止跨界空间移动');
 if(root.mode==='combat')a.position=[...p.position];a.state.position=[...p.position];
 if(p.location)a.state.location=p.location;
}
export function runConditionalResource(root,r,{combat=false,preActionCleared=false,drawDice,actorTemplates={}}={}){
 const o=root.ruleScene.objects[r.objectId],a=root.actors[r.actorId];let result,action;
 if(o.type==='ancientBelt')return runWizard(root,r,o,a,{combat,preActionCleared,drawDice,mana,cast,paid});
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
     if(other&&target.state.size>5){if(!Number.isInteger(p.oversizeEquivalentVolume))need('大于体积5目标的首个超额与携物DC2如何组合须裁定','oversizeEquivalentVolume');volume+=p.oversizeEquivalentVolume;}
     const cost=1+Math.max(0,volume-2),dc=volume>=2?volume:undefined;
     action='full';paid(a,action,combat,preActionCleared);mana(a,o,cost);
     const roll=dc===undefined?null:cast(a,o,drawDice,dc);if(roll&&!roll.eligible)fail(roll.reason);
     if(!roll||roll.success)relocate(root,target,p);
     result={cost,roll,success:!roll||roll.success,position:target.state.position,instant:true};
   }else if(['upper','upperFail'].includes(r.operation)){
     if(p.samePlane!==true||p.visited!==true||p.remembered!==true)fail('上位传送仅能到同位面/世界曾到过且记得之处');
     if(!Number.isFinite(p.distance)||p.distance<0)need('须有实际距离','distance');
     let steps=p.distance<=1000?1:p.distance%1000===0?p.distance/1000:p.distanceSteps;
     if(!Number.isInteger(steps)||steps<1)need('非整千米距离的增量取整须裁定','distanceSteps');
     const {failureConfirmed,...fixedPlan}=p;const signature=JSON.stringify(fixedPlan);o.channels??={};let channel=o.channels[r.actorId];
     if(channel&&channel.signature!==signature)fail('累计施法途中不能更换目标与条件');
     if(r.operation==='upperFail'){
       if(!channel||p.failureConfirmed!==true&&o.failures?.[r.actorId]?.source===undefined)need('须确认这次累计施法实际失败；中断不自动等于失败','failureConfirmed');
       const refund=Math.floor(channel.cost/2),pool=a.state.resources[o.manaResource];pool.current=Math.min(pool.max,pool.current+refund);delete o.channels[r.actorId];delete a.state.channeling;return {action:'free',refund,failed:true};
     }
     if(!channel){const cost=8+steps;mana(a,o,cost);channel=o.channels[r.actorId]={signature,cost,target:100*steps,successes:0,periods:0,...(combat?{readyRound:root.round+10}:{})};}
     if(combat&&root.round<channel.readyRound){a.state.channeling={objectId:r.objectId,part:r.part,readyRound:channel.readyRound};return {action:'free',channeling:true,...channel};}
     const roll=cast(a,o,drawDice);if(!roll.eligible)fail(roll.reason);channel.successes+=roll.total;channel.periods++;
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
   const p=plan(o,r),target=root.actors[p.wearerId];if(!target||p.ringWorn!==true)need('须有实际佩戴该戒指的目标','wearerId');
   if(r.operation==='sleep'){
     action='standard';paid(a,action,combat,preActionCleared);mana(a,o,1);
     const full={...structuredClone(actorTemplates[p.wearerId]??{}),...target.combatCarry,...target};const profile=full.combatProfile||full.kind?saveProfile(full,'will'):null;
     const roll=check(target.state,{...(profile?{poolBase:profile.dp,attributeAutoOverride:profile.fixed}:{attributes:['意志','风度']}),context:{willResistance:true},dc:4,dice:drawDice()});
     if(!roll.success)target.state.sleeping={source:o.source,kind:'normal',appliedBy:r.actorId};result={cost:1,dc:4,roll,sleeping:!roll.success};
   }else if(r.operation==='engage'){
     if(!p.transition?.source||!p.transition.bodyDisposition||!p.transition.returnRule)need('Engage的现实身体、返回方式须有具体场景裁定','transition');
     action='full';paid(a,action,combat,preActionCleared);mana(a,o,0);a.state.underworld={wearerId:p.wearerId,source:o.source,...structuredClone(p.transition)};result={cost:0,underworld:a.state.underworld};
   }else fail('请选择sleep或engage');
 }else if(o.type==='antiMagicRock'){
   const p=plan(o,r);
   if(r.operation==='lock'||r.operation==='unlock'){
     const target=root.actors[p.targetId];if(!target||p.runeProcessed!==true||!Array.isArray(p.energyResources))need('须登记实际符文锁链、目标及被约束能量类别','restraint');
     target.state.antiMagicRestraints??=[];let lock=target.state.antiMagicRestraints.find(x=>x.objectId===r.objectId);if(!lock){lock={objectId:r.objectId,source:o.source,energyResources:[...p.energyResources]};target.state.antiMagicRestraints.push(lock);}
     if(!p.action)need('锁闭/解除动作须按实际器物确认','action');action=p.action;paid(a,action,combat,preActionCleared);lock.locked=r.operation==='lock';result={targetId:p.targetId,locked:lock.locked};
   }else if(r.operation==='resistance'){
     if(!['D','C','B','A','S'].includes(p.grade)||typeof p.magicalEnergy!=='boolean'||typeof p.exception!=='boolean')need('须确认攻击等级、魔幻能量类别及是否属于原文例外','grade/exception');
     result={immune:p.magicalEnergy&&p.grade!=='S'&&!p.exception};action='free';
   }else fail('请选择lock、unlock或resistance');
 }else return null;
 return {objectId:r.objectId,type:o.type,operation:r.operation,action,...result};
}
function statusSevere(s,t){return s.statuses.some(x=>x.type===t&&x.points>effectiveAttribute(s,'意志'));}
