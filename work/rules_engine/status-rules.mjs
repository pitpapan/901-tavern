// PHB 生存状态 143, 246–302; adopted six-attribute mapping in 901 core §6.
import {applyStatus,check,effectiveAttribute,statusLevel,resolveDamage,spendAction,actionEligibility,counteractTemperature} from './core.mjs';
import {RuleInputError,IllegalAction} from './combat/mechanics.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';
const need=(s,k)=>{throw new RuleInputError(s,k);};
const fail=s=>{throw new IllegalAction(s);};
const copy=x=>structuredClone(x);
const matches=(a,b)=>Object.entries(a).every(([k,v])=>JSON.stringify(b[k])===JSON.stringify(v));
export function limbEffects(state,limbIds) {
 const injured=state.statuses.filter(s=>s.type==='肢体妨害');
 const lost=(state.permanentConditions??[]).filter(s=>s.kind==='limbLoss');
 if(!injured.length&&!lost.length)return {penalty:0,disabled:false};
 if(!Array.isArray(limbIds)||!limbIds.length)need('本次动作须明确主要使用的肢体','limbIds');
 const relevant=injured.filter(s=>limbIds.includes(s.limbId)),points=Math.max(0,...relevant.map(s=>s.points));
 return {penalty:points,disabled:points>Math.max(effectiveAttribute(state,'力量'),effectiveAttribute(state,'敏捷'))||lost.some(s=>limbIds.includes(s.limbId))};
}
export function limbMovement(state,baseSpeed,mode='land') {
 const injured=state.statuses.filter(s=>s.type==='肢体妨害'),lost=(state.permanentConditions??[]).filter(s=>s.kind==='limbLoss');
 if(!injured.length&&!lost.length)return baseSpeed;
 const spec=state.anatomy?.movementModes?.[mode];
 if(!Array.isArray(spec?.limbs)||!spec.source)need('须登记此移动方式实际依赖的肢体及来源','anatomy.movementModes');
 const affected=new Set([...injured,...lost].filter(s=>spec.limbs.includes(s.limbId)&&!spec.exemptLimbs?.includes(s.limbId)).map(s=>s.limbId));
 if(!affected.size)return baseSpeed;
 // PHB examples are explicit for human/wolf legs; the general threshold is not.
 const threshold=spec.fullPenaltyAt??(['human','wolf'].includes(state.anatomy?.kind)?2:state.anatomy?.kind==='centipede'?21:Math.max(2,Math.ceil(spec.limbs.filter(id=>!spec.exemptLimbs?.includes(id)).length/2)));
 const relevant=injured.filter(s=>affected.has(s.limbId)),points=Math.max(0,...relevant.map(s=>s.points));
 const disabled=limbEffects(state,[...affected]).disabled;
 return Math.max(0,(disabled?Math.floor(baseSpeed/2):baseSpeed)-(affected.size>=threshold?points:Math.floor(points/2)));
}
// Constraints never choose dialogue or an action for a player. Escape/order
// choices are actual scene declarations, supplied through the host registry.
export function statusActionPermission(state,selector,{perceived,escape=false}={}) {
 const orders=state.statusOrders??[];
 const matched=orders.find(o=>o.pending&&o.actions?.some(a=>matches(a,selector)));
 const fear=state.statuses.filter(s=>s.type==='恐惧'&&s.points>effectiveAttribute(state,'意志'));
 for(const s of fear){
   const present=perceived?.(s)??s.perceived;
   if(present===undefined)need('惊惧须明确当前是否仍能感知恐惧来源','fear.perceived');
   if(present&&!(s.escapeActions?.length?s.escapeActions.some(a=>matches(a,selector)):escape))fail('惊惧期间须选择最有效的已知逃离手段，不能执行无关动作');
 }
 const charm=state.statuses.filter(s=>s.type==='魅惑'&&statusLevel(state,'魅惑').severe);
 for(const s of charm){const order=orders.find(o=>o.statusSource===s.source&&o.pending);
   if(order&&order.exceptional&&!order.resisted)need('明显送死或违背道德的指令须先额外抵抗','statusOrder.resistance');
   if(order&&!order.actions?.some(a=>matches(a,selector)))fail('当前迷情指令尚待履行，不能将无关动作算作执行指令');}
 return {compelled:matched?.irresistible===true,orderId:matched?.id};
}
export function completeStatusOrder(state,permission){const o=state.statusOrders?.find(x=>x.id===permission?.orderId);if(o)o.pending=false;}
export function statusEvent(root,r,{drawDice,combat=false,preActionCleared=false}={}) {
 const a=root.actors[r.actorId],s=a?.state,e=root.ruleScene?.events?.[r.eventId];
 if(!a||!e?.source||!e.actorIds?.includes(r.actorId))need('缺少当前人物适用的已确认状态事件','statusEvent');
 if(s.ruleEvents?.includes(r.eventId))fail('该状态事件已结算');
 if(['extinguish','wake'].includes(e.type)){const p=statusActionPermission(s,r),allowed=actionEligibility(s,'standard',p);if(!allowed.allowed)fail(allowed.reason);}
 let result;
 if(e.type==='statusApply'){
   const spec=e.status;
   if(!spec?.type||!Number.isInteger(spec.points)||spec.points<0)need('状态事件须有明确名称与点数','status');
   if(spec.type==='肢体妨害'&&!spec.limbId)need('肢体妨害须指定实际受伤肢体','limbId');
   if(spec.type==='燃烧'){
     if(!['natural','adhesive','magic'].includes(spec.fireKind))need('须确认自然/黏附/魔法燃烧类别','fireKind');
     if(spec.fireKind==='magic'&&!Number.isFinite(spec.remainingMinutes))need('魔法火焰须有实际持续时间','remainingMinutes');
     s.statuses.push({type:'燃烧',source:e.source,points:spec.points,fireKind:spec.fireKind,...(spec.remainingMinutes!==undefined?{remainingMinutes:spec.remainingMinutes}:{}),...(spec.fireKind==='natural'?{decayPerRound:1}:{}),...(spec.tickBoundary?{tickBoundary:spec.tickBoundary}:{})});
     const counteract=counteractTemperature(s);result={applied:spec.points>0,points:statusLevel(s,'燃烧').points,counteract};
   }else{
     const out=applyStatus(s,{type:spec.type,source:e.source,points:spec.points,dice:drawDice(),catastrophicAllowed:e.catastrophicAllowed===true,attributeDamageAllocation:e.attributeDamageAllocation});a.state=out.state;result=out.result;
     const added=a.state.statuses.findLast(x=>x.source===e.source&&x.type===spec.type);
     if(added)for(const k of ['limbId','sourceActorId','perceived','escapeActions','restBlocked','remainingMinutes'])if(spec[k]!==undefined)added[k]=copy(spec[k]);
     if(e.catastrophicAllowed===true&&result.level?.catastrophicThreshold&&!['剧痛','疲乏'].includes(spec.type)){
       const kinds={目眩:'blind',耳鸣:'deaf',肢体妨害:'limbLoss',恶心:'nauseaCollapse',魅惑:'devotion',恐惧:'mentalDisorder',沮丧:'mentalDisorder',亢奋:'mentalDisorder'};
       const kind=kinds[spec.type];if(!kind)need('此来源没有指定毁灭性后果','catastrophe');
       if(kind==='mentalDisorder'&&!e.consequence)need('情绪毁灭性后果由主持解释，须给已裁定描述','consequence');
       const condition={kind,source:e.source,...(spec.limbId?{limbId:spec.limbId}:{}),...(spec.sourceActorId?{sourceActorId:spec.sourceActorId}:{}),...(e.consequence?{description:e.consequence}:{})};
       (a.state.permanentConditions??=[]).push(condition);result.permanentCondition=condition;
     }
   }
 }else if(e.type==='demonGaze'){
   const box=root.ruleScene.objects?.[e.objectId];if(box?.type!=='demonBox'||typeof e.looking!=='boolean')need('须登记实际盒子及当前直视/睁眼事实','demonGaze');
   const key=`魔物之眼:${e.objectId}`,existing=s.statuses.find(x=>x.source===key);
   if(!e.looking)s.statuses=s.statuses.filter(x=>x.source!==key);
   if(e.looking){if(!box.open)fail('盒子尚未打开，没有这次投影暴露');if(!existing)s.statuses.push({type:'恐惧',source:key,points:5,perceived:true,demonBoxId:e.objectId,gazeRounds:0,...(e.escapeActions?{escapeActions:copy(e.escapeActions)}:{})});}
   result={looking:e.looking,points:e.looking?(existing?.points??5):0,unresisted:true};
 }else if(e.type==='sceneEnd'){
   for(const record of Object.values(root.actors)){expireResourceEffects(record.state,{scene:true});record.state.statuses=record.state.statuses.filter(x=>!x.scene);}
   if(s.huaJin){s.huaJin.current=0;delete s.huaJin.nextAttack;delete s.huaJin.acceptNext;}
   if(s.chengxin)s.chengxin={observations:{},attempts:[]};
   result={removed:[]};for(const [id,record]of Object.entries(root.actors))if(record.sceneBound&&record.present){record.present=false;result.removed.push(id);}
 }else if(e.type==='channelFailure'){
   const object=root.ruleScene.objects?.[e.objectId];if(!object?.channels?.[r.actorId])fail('没有这项正在进行的累计施法');
   (object.failures??={})[r.actorId]={source:e.source};result={failureConfirmed:true,objectId:e.objectId};
 }else if(e.type==='geneticBacklash'){
   const pending=s.geneticLock?.pendingPainDamage,allocation=e.allocation;
   if(!pending||!allocation||Object.keys(allocation).some(k=>!['力量','意志'].includes(k))||Object.values(allocation).some(n=>!Number.isInteger(n)||n<0)||Object.values(allocation).reduce((a,b)=>a+b,0)!==pending)need('须记录承受者对实际反噬属性伤害的分配','geneticBacklash.allocation');
   for(const [key,n]of Object.entries(allocation))s.attributeDamage[key]=(s.attributeDamage[key]??0)+n;
   delete s.geneticLock.pendingPainDamage;result={allocation:copy(allocation)};
 }else if(e.type==='sleepPerception'){
   if(!s.sleeping)fail('此事件只处理睡眠期间的被动感知');
   if(!['洞察','侦查','聆听'].includes(e.skill)||!e.targetId||!Number.isFinite(e.distance))need('须登记真实刺激、目标及距离','sleepPerception');
   const target=root.actors[e.targetId];if(!target?.state)need('缺少实际目标','sleepPerception.target');
   // PHB general sensitive range (非战斗行动与战斗行动:64); normal visual
   // range has a separate adopted 901 formula and is not granted to closed eyes.
   const range=Math.max(0,effectiveAttribute(s,'感知')-1+(target.state.size??5)-5)*20;
   if(e.distance>range)result={detected:false,range,targetHidden:true};
   else{if(!e.passive?.attribute)need('须有目标实际隐藏检定','sleepPerception.passive');
     const passive=check(target.state,{...e.passive,dice:drawDice()}),active=check(s,{attribute:'感知',skill:e.skill,context:{perception:true,opposed:true,listening:e.skill==='聆听'},dice:drawDice()});
     result={range,targetHidden:true,active,passive,detected:active.eligible&&active.total>=passive.total};if(result.detected)delete s.sleeping;}
 }else if(e.type==='statusContext'){
   const status=s.statuses.find(x=>x.source===e.statusSource);if(!status)need('须指向当前实际状态来源','statusSource');
   for(const key of ['perceived','escapeActions','tickBoundary'])if(e[key]!==undefined)status[key]=copy(e[key]);
   result={statusSource:e.statusSource,updated:true};
 }else if(e.type==='wake'){
   const target=root.actors[e.targetId];if(!target?.state.sleeping||e.canTouch!==true||e.targetId===r.actorId)fail('须由可接触睡眠者的另一人唤醒');
   if(combat){const paid=spendAction(s,'standard',{preActionCleared});if(!paid.result.allowed)fail(paid.result.reason);a.state=paid.state;}
   delete target.state.sleeping;result={woken:e.targetId};
 }else if(e.type==='statusOrder'){
   if(!e.statusSource||!s.statuses.some(x=>x.source===e.statusSource))need('命令须对应当前状态来源','statusSource');
   if(!e.text||!Array.isArray(e.actions))need('须登记实际指令与满足指令的动作选择','statusOrder.actions');
   (s.statusOrders??=[]).push({id:r.eventId,statusSource:e.statusSource,text:e.text,actions:copy(e.actions),irresistible:e.irresistible===true,exceptional:['suicidal','moralViolation'].includes(e.reason),pending:true});result={order:s.statusOrders.at(-1)};
 }else if(e.type==='statusResistance'){
   const order=s.statusOrders?.find(o=>o.id===e.orderId),status=s.statuses.find(x=>x.source===order?.statusSource&&x.type==='魅惑');
   if(!order?.exceptional||order.resisted||!status)need('缺少尚未抵抗的特殊迷情指令','orderId');
   const roll=check(s,{attribute:effectiveAttribute(s,'意志')<=effectiveAttribute(s,'风度')?'意志':'风度',skill:'求生',dice:drawDice()});
   status.points=Math.max(0,status.points-roll.total);order.resisted=true;if(!statusLevel(s,'魅惑').severe)order.pending=false;result={resistance:roll,remaining:status.points};
 }else if(e.type==='statusCounteract'){
   result=counteractTemperature(s);
 }else if(e.type==='extinguish'){
   const fires=s.statuses.filter(x=>x.type==='燃烧'&&x.points>0);if(!fires.length)fail('当前没有燃烧');
   if(fires.some(x=>x.fireKind==='magic'))fail('魔法火焰持续期间不能以物理方式扑灭');
   if(!['pat','roll','water','extinguisher'].includes(e.method))need('须明确实际灭火手段','method');
   if(combat){const paid=spendAction(s,'standard',{preActionCleared});if(!paid.result.allowed)fail(paid.result.reason);a.state=paid.state;}
   const roll=['pat','roll'].includes(e.method)?check(a.state,{attribute:'敏捷',skill:'运动',modifier:e.method==='roll'?2:0,context:{reflex:true,motion:true},dice:drawDice()}):null;
   for(const f of a.state.statuses.filter(x=>x.type==='燃烧'))f.points=roll?Math.max(0,f.points-roll.total):0;
   result={method:e.method,resistance:roll,remaining:statusLevel(a.state,'燃烧').points};
 }else need('不是已接入的状态事件','event.type');
 a.state.statuses=a.state.statuses.filter(x=>x.points>0);(a.state.ruleEvents??=[]).push(r.eventId);return result;
}
export function burningDamage(actor,boundary,resolve) {
 const fires=actor.state.statuses.filter(s=>s.type==='燃烧'&&s.points>0);if(!fires.length)return null;
 // PHB 非战斗行动与战斗行动 25–39: one actor action contains its sub-actions.
 // An explicit source-specific boundary can override the inherited turn boundary.
 if(fires.some(s=>s.tickBoundary!==undefined&&!['action','turn'].includes(s.tickBoundary)))need('燃烧触发边界无效','fire.tickBoundary');
 const points=Math.max(0,...fires.filter(s=>(s.tickBoundary??'turn')===boundary).map(s=>s.points));if(!points)return null;
 if(actor.state.wizard?.form==='fire')return {actualDamage:0,immune:true};
 if(resolve)return resolve(points);
 const out=resolveDamage(actor.state,{amount:points,severity:'L',kind:'energy',energyType:'fire'},actor.fireDefenses??[]);actor.state=out.state;return out.result;
}
