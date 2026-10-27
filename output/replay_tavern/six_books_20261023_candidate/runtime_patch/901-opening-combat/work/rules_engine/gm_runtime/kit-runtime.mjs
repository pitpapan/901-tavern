import {detectionProtectionSources} from '../resource-detection.mjs';
import {recordPerception} from '../resource-perception.mjs';
import {selectedOngoingEffects} from '../resource-ongoing.mjs';
import {RESOURCE_CATALOG} from '../resource-catalog.mjs';
import {ownsResource,genericPools,guanlanOwned,chooseGuanlanAttributes,chooseGuanlanAccumulation,guanlanInsight,validateGuanlanInsight} from '../kit-state.mjs';
import {check,effectiveAttribute,spendAction,lifeStatus} from '../core.mjs';
import {RuleInputError,IllegalAction} from '../combat/mechanics.mjs';
import {runResourceProgram} from './resource-program.mjs';
import {RESOURCE_DEFINITIONS} from '../resource-definitions.mjs';
import {claimLearningGrant} from '../resource-acquisition.mjs';
import {equipWeaponInstance} from '../resource-weapons.mjs';

export function kitReferences(topics='',actors=[]){
 const owned=new Set(actors.flatMap(a=>Object.keys(a.learnedResources??{})));
 return Object.values(RESOURCE_CATALOG).filter(x=>topics.includes(x.name)||owned.has(x.id)).map(x=>({id:x.id,name:x.name,kind:x.kind,period:x.period,prohibited:x.prohibited,source:x.source+':'+x.line,rules:x.body}));
}
export function runKitMechanism(root,r,{combat=false,preActionCleared=false,drawDice,actorTemplates}={}){
 const o=root.ruleScene?.objects?.[r.objectId];if(o?.type!=='kitResource')return null;
 const a=root.actors[r.actorId],s=a.state,p=o.plans?.[r.part];
 if(!p?.source)throw new RuleInputError('须选择已登记、有来源的资源操作计划','kit.plan');
 const id=o.resourceId;
 const actualWeapon=r.operation==='equip'&&RESOURCE_DEFINITIONS[id]?.equipment?.slot==='weapon'&&s.possessions?.items?.some(item=>item.id===p.itemId&&item.resourceId===id&&item.source&&item.location==='carried');
 if(!RESOURCE_CATALOG[id]&&!['guanlan','huaJin'].includes(id))throw new RuleInputError('资源目录没有该项目','kit.resourceId');
 if(id==='guanlan-fa'||id==='guanlan'){
  if(!guanlanOwned(s))throw new IllegalAction('尚未取得观澜法');
 }else if(id!=='huaJin'&&!actualWeapon&&!ownsResource(s,id))throw new IllegalAction('该人物尚未实际学会资源');
 const definition=RESOURCE_DEFINITIONS[id==='guanlan'?'guanlan-fa':id];
 if(definition&&!definition.operations?.includes(r.operation))throw new IllegalAction('此资源没有登记该操作');
 const programmed=runResourceProgram(root,r,{combat,preActionCleared,drawDice,actorTemplates});if(programmed)return programmed;
 const pay=action=>{if(combat){const out=spendAction(s,action,{preActionCleared});if(!out.result.allowed)throw new IllegalAction(out.result.reason);s.turn=out.state.turn;}};
 const ownTurn=()=>{if(combat&&root.activeId!==r.actorId)throw new IllegalAction('须在自己的行动中使用');};
 let result;
 if(r.operation==='equip'){
  ownTurn();
  if(!definition.equipment)throw new IllegalAction('资源不是装备');
  if(definition.equipment.slot==='weapon'&&(combat||p.itemId))result=equipWeaponInstance(a,id,p,{combat,preActionCleared});
  else {
   if(combat)throw new IllegalAction('普通护甲穿戴动作尚未接入（实现缺口），不能无动作完成');
   if(p.completed!==true)throw new RuleInputError('须确认实际装备已完成','resource.equip');
   (s.equippedResources??={})[definition.equipment.slot]=id;result={equipped:id,slot:definition.equipment.slot};
  }
 }else if(r.operation==='claimLearning'){
  ownTurn();if(s.learningGrants?.[p.grantId]?.resourceId!==id)throw new IllegalAction('授术名额不属于此资源');
  result=claimLearningGrant(s,p.grantId,p.resourceIds,RESOURCE_DEFINITIONS,p.source);
 }else if(r.operation==='initialAttributes') {ownTurn();chooseGuanlanAttributes(s,p.attributes);result={attributes:s.guanlan.initialAttributes};}
 else if(r.operation==='accumulate'){ownTurn();chooseGuanlanAccumulation(s,p.resourceId,p.direction,p.pool);result={accumulation:s.guanlan.accumulation};}
 else if(r.operation==='insight'){validateGuanlanInsight(s,p,{preActionCleared});result=guanlanInsight(s,p,drawDice()[0],{preActionCleared});}
 else if(r.operation==='sense'){
  const range=effectiveAttribute(s,'感知')*30;
  if(!guanlanOwned(s)||['dead','unconscious'].includes(lifeStatus(s).state))throw new IllegalAction('须清醒并持有观澜感知');
  if(!Number.isFinite(p.distance)||typeof p.effectLine!=='boolean'||typeof p.operating!=='boolean')throw new RuleInputError('须实际距离、效果线与能量运作状态','kit.sense');
  let detected=p.distance<=range&&p.effectLine&&p.operating;
  if(detected&&p.concealed){if(!Number.isInteger(p.dc))throw new RuleInputError('隐藏能量须提供适用侦测难度','kit.sense.dc');result={check:check(s,{attribute:'感知',skill:'调查',sub:p.sub,dc:p.dc,dice:drawDice()})};detected=result.check.success;}
  result={...result,range,detected,precision:detected?'vague':null};
  const relevantDelay=Object.values(root.actors).some(a=>selectedOngoingEffects(a.state).some(x=>x.detectionDelay)||detectionProtectionSources(a.state).some(x=>!x.suppressedBy.length));
  if(relevantDelay&&!p.targetId)throw new RuleInputError('场景存在侦测延迟或反侦测，须实际被探测来源人物','kit.sense.targetId');
  if(p.targetId&&detected){const receipt=recordPerception(root,{observerId:r.actorId,targetId:p.targetId,sense:{...p.detection,source:'resources/guanlan-fa.md#知微察理',grade:'D',visual:false},information:result},{combat});result=receipt.pending?receipt:{...receipt.information,perception:receipt};}
 }else if(r.operation==='observe'){
  ownTurn();if(id!=='chengxin-xuanjian')throw new IllegalAction('未持有观隙取势');
  if(!p.targetId||!p.sceneId||!p.evidenceId||p.observable!==true||p.effectLine!==true)throw new RuleInputError('须实际可观察目标、效果线、场景与已显露迹象','kit.observe');
  s.chengxin??={observations:{},attempts:[]};const key=p.sceneId+'/'+p.targetId+'/'+p.evidenceId;
  if(s.chengxin.attempts.includes(key))throw new IllegalAction('同场景同组迹象不能重复检定');
  pay('free');const roll=check(s,{attribute:'智力',skill:'学识',sub:p.sub,dc:3,dice:drawDice()});
  s.chengxin.attempts.push(key);if(roll.success){s.chengxin.observations[p.targetId]={sceneId:p.sceneId,evidenceId:p.evidenceId,valid:true};s.chengxin.targetId=p.targetId;}
  result={roll,targetId:s.chengxin.targetId};
 }else if(r.operation==='selectObservation'){
  ownTurn();if(id!=='chengxin-xuanjian')throw new IllegalAction('未持有观隙取势');
  const old=s.chengxin?.observations[p.targetId];
  if(p.targetId!==null&&(!old?.valid||old.sceneId!==p.sceneId||p.observable!==true))throw new IllegalAction('目标未取势成功、已失效或不能观察');
  pay('free');s.chengxin.targetId=p.targetId;result={targetId:p.targetId};
 }else if(r.operation==='invalidateObservation'){
  if(s.chengxin?.observations[p.targetId])s.chengxin.observations[p.targetId].valid=false;
  if(s.chengxin?.targetId===p.targetId)s.chengxin.targetId=null;result={invalidated:p.targetId};
 }else if(r.operation==='clearJin'||r.operation==='spendJin'){
  ownTurn();if(!s.huaJin)throw new IllegalAction('没有化劲槽');
  if(r.operation==='clearJin'){pay('free');result={cleared:s.huaJin.current};s.huaJin.current=0;}
  else {
   if(!ownsResource(s,'chengxin-xuanjian'))throw new IllegalAction('借劲出锋须澄心玄鉴');
   const n=p.amount,round=combat?root.round:p.actionId;
   if(round===undefined)throw new RuleInputError('须实际行动标识','kit.actionId');
   if(!Number.isInteger(n)||n<1||n>s.huaJin.current)throw new IllegalAction('化劲不足');
   const used=s.huaJin.round===round?s.huaJin.spent??0:0;
   if(used+n>2||s.huaJin.nextAttack)throw new IllegalAction('每轮最多消耗2劲，不得重复储存下一击加值');
   pay('swift');s.huaJin.current-=n;s.huaJin.round=round;s.huaJin.spent=used+n;s.huaJin.nextAttack=n;result={spent:n};
  }
 }else if(r.operation==='setConversion'){
  if(id!=='chengxin-xuanjian'||!Number.isInteger(p.amount)||p.amount<0||p.amount>s.huaJin.max)throw new IllegalAction('须选择合法的本次无动作纳劲量');
  s.huaJin.acceptNext=p.amount;result={amount:p.amount};
 }else if(r.operation==='payEnergy'){
  if(!guanlanOwned(s)||!ownsResource(s,p.resourceId)||s.learnedResources[p.resourceId].tree!=='guanlan')throw new IllegalAction('演化无碍只供已学会的本树技艺');
  if(!genericPools(s).some(([name])=>name===p.pool)||!Number.isInteger(p.amount)||p.amount<1)throw new RuleInputError('须选择单个合格通用池与技艺明文费用','kit.energy');
  if(s.resources[p.pool].current<p.amount)throw new IllegalAction('通用能量不足');
  s.resources[p.pool].current-=p.amount;result={pool:p.pool,cost:p.amount};
 }else throw new Error('此资源操作尚未实现（实现缺口，非待裁定）：'+r.operation);
 return {objectId:r.objectId,resourceId:id,operation:r.operation,...result};
}
