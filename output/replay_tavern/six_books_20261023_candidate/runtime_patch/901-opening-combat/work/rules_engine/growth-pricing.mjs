import {applyKitAcquisition} from './kit-state.mjs';
import {resourceEffects,RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {assertSpellQualifications,learningAcquisitionFacts} from './resource-acquisition.mjs';
// User-supplied Guanlan rule, 2026-10-23. No shared discount budget.
export const GUANLAN_RULE='观澜法：实际持有者花XP提升六项基础属性，或白刃/运动/学识及其子技能，每升一级减1XP（突破同样适用），最低1XP；完整学习本树一门D级技艺每门减1XP。分次付款或分类重合不重复减；免费成长不返XP；无限次数，不叠加自身。不适用于本体取得、技艺进化、专长及其他成长/资源。前提、上限、突破收益不变。危境开悟的悟法XP单独记账，应用减费后须独立一次付足本树D级技艺，不得混付或分期；不能支付属性/技能/专长或其他资源。其他优惠依各自已确认规则处理。';
const attrs=['力量','敏捷','智力','感知','意志','风度'];
const xpAmount=x=>Number.isFinite(x)&&x>=0&&Number.isSafeInteger(x*2);
export const hasGuanlan=s=>s.guanlan?.acquired===true&&typeof s.guanlan.source==='string'&&s.guanlan.source.trim().length>0;
export const isGuanlanTechnique=o=>o.kind==='technique'&&(RESOURCE_DEFINITIONS[o.resourceId]?.identity?RESOURCE_DEFINITIONS[o.resourceId].identity.tree:o.tree)==='guanlan'&&o.grade==='D';
export function growthPrice(state,baseCost,item){
 if(!xpAmount(baseCost))throw Error('学习原价须为非负XP，明文半价允许0.5XP单位');
 const identity=RESOURCE_DEFINITIONS[item.resourceId]?.identity;
 const pricedItem=identity?{...item,tree:identity.tree}:item;
 const discounts=resourceEffects(state,'learningDiscount',pricedItem);
 // No unapproved cross-discount stacking: choose the applicable highest saving.
 const rule=discounts.sort((a,b)=>b.value-a.value)[0];
 const discount=rule&&baseCost>0?Math.max(0,Math.min(rule.value,baseCost-rule.minimumCost)):0;
 return {baseCost,cost:baseCost-discount,discount,discountSource:discount?rule.discountSource:null};
}

export function validateLearningOffer(o,id){
 if(!o?.adopted||!o.source?.trim()||o.id!==id||!o.resourceId||!o.name||!Array.isArray(o.actorIds)||typeof o.requirementsMet!=='boolean'||!['technique','acquisition','evolution','other'].includes(o.kind)||!xpAmount(o.baseCost))throw Error('资源学习须逐项登记已采用的来源、名称、对象、取得类别、学习资格和XP原价');
 for(const p of Object.values(o.payments??{}))if(!xpAmount(p.xp)||!Number.isSafeInteger(p.wufaXP??0)||(p.wufaXP??0)<0||p.xp+(p.wufaXP??0)<=0)throw Error('分次付款须登记明确的普通XP与悟法XP金额');
 const rule=RESOURCE_DEFINITIONS[o.resourceId]?.learning;
 const definition=RESOURCE_DEFINITIONS[o.resourceId],policy=rule?.policy;
 if(policy){
  if(policy.requireContractVersion&&o.contractVersion!==definition.contractVersion)throw Error('学习报价须匹配当前合同版本');
  if(!policy.grades?.includes(o.grade)||o.versionMode!==undefined)throw Error('学习报价等级未由本政策定义');
  if(o.kind!=='technique')throw Error('学习政策须使用技艺取得类别');
 }
 const identity=definition?.identity;
 if(identity&&o.tree!==undefined&&o.tree!==identity.tree)throw Error('学习报价不能改写执行合同的所属树或资源归类');
 if(o.versionMode!==undefined&&!['retain','replace'].includes(o.versionMode))throw Error('升阶须明确保留或替换D版');
 const price=o.versionMode?rule?.upgradeC?.[o.versionMode==='retain'?'retainD':'replaceD']:rule?.byGrade?.[o.grade]??rule?.baseXP;
 if(price!==undefined&&price!==o.baseCost)throw Error('学习报价与资源执行版明文价格不符');
 if(o.grantsGuanlan&&!(o.kind==='acquisition'&&o.resourceId==='guanlan'))throw Error('观澜本体取得须使用本体条目，不能伪装为技艺');
 if(o.otherDiscounts?.length)throw Error('其他学习优惠须先按其规则接入，不能擅自叠加');
 return o;
}

export function purchaseLearning(state,offer,{actorId,paymentId}={}){
 validateLearningOffer(offer,offer?.id);
 if(!offer.actorIds.includes(actorId)||!offer.requirementsMet)throw Error('不满足该资源当前学习条件');
 const known=state.learnedResources?.[offer.resourceId],definition=RESOURCE_DEFINITIONS[offer.resourceId];
 if(definition?.template||definition?.prohibited)throw Error('完整后期人物模板或禁术不能作为可学习资源');
 assertSpellQualifications(state,offer.resourceId,definition,{grade:offer.grade??definition?.grade,versionMode:offer.versionMode});
 const acquisition=learningAcquisitionFacts(state,definition,offer);
 const upgrading=known?.learned&&known.grade==='D'&&offer.grade==='C'&&(definition?.learning?.byGrade?.C!==undefined||offer.versionMode&&definition?.learning?.upgradeC);
 if(known?.learned&&!upgrading)throw Error('该资源已完整学习，不能再次计费');
 if(offer.versionMode&&!upgrading)throw Error('D术升阶须先实际学会D版');
 if(definition?.learning?.CRequiresD&&offer.grade==='C'&&!upgrading)throw Error('此能力组须先逐阶取得D级');
 if((offer.grantsGuanlan||['guanlan','guanlan-fa'].includes(offer.resourceId))&&hasGuanlan(state))throw Error('已经取得观澜法本体');
 const ledgerId=upgrading?offer.resourceId+'@C':offer.resourceId;
 const signature=JSON.stringify(definition?.learning?.policy?{offer,contract:{version:definition.contractVersion,learning:definition.learning,identity:definition.identity,grade:definition.grade,subskills:definition.subskills,requiresAllSchools:definition.requiresAllSchools}}:offer),old=state.learningPurchases?.[ledgerId];
 if(old&&old.signature!==signature)throw Error('分次学习中的条目、价格或付款条件不能更换');
 const category=definition?.identity;
 const classified=category?{...offer,tree:category.tree}:offer;
 const price=old?.price??growthPrice(state,offer.baseCost,classified),paid=old?.paid??0,remaining=price.cost-paid;
 if(paymentId!==undefined&&!Object.hasOwn(offer.payments??{},paymentId))throw Error('未登记本次付款方案');
 if(paymentId!==undefined&&old?.paymentIds.includes(paymentId))throw Error('本次分期已经支付，不能重复扣费');
 const payment=paymentId===undefined?{xp:remaining,wufaXP:0}:offer.payments[paymentId];
 const xp=payment.xp,wufaXP=payment.wufaXP??0,total=xp+wufaXP;
 if(total>remaining)throw Error('付款超过本门完整学习剩余费用');
 if(wufaXP&&(!hasGuanlan(state)||!isGuanlanTechnique(offer)))throw Error('悟法XP只可用于观澜树D级技艺完整学习');
 if(wufaXP&&(xp!==0||paid!==0||wufaXP!==price.cost))throw Error('悟法XP须独立一次支付完整费用，不得分期或与通用XP混付');
 if(state.xp<xp)throw Error('Insufficient XP');
 if((state.guanlan?.wufaXP??0)<wufaXP)throw Error('悟法XP不足');
 const next=structuredClone(state);next.xp-=xp;if(wufaXP)next.guanlan.wufaXP-=wufaXP;
 const ledger={signature,price,paid:paid+total,xpPaid:(old?.xpPaid??0)+xp,wufaPaid:(old?.wufaPaid??0)+wufaXP,paymentIds:[...(old?.paymentIds??[]),...(paymentId===undefined?[]:[paymentId])]};
 (next.learningPurchases??={})[ledgerId]=ledger;
 const complete=ledger.paid===price.cost;
 if(complete){
  (next.learnedResources??={})[offer.resourceId]={...structuredClone(known??{}),learned:true,name:offer.name,source:offer.source,kind:offer.kind,tree:classified.tree,grade:offer.grade,...(definition?.contractVersion?{version:definition.contractVersion}:{}),...(acquisition??{}),...(upgrading&&offer.versionMode?{versions:offer.versionMode==='retain'?['D','C']:['C']}:{})};
  if(offer.grantsGuanlan)next.guanlan={acquired:true,source:offer.source,wufaXP:0};
  if(offer.resourceId==='guanlan'||RESOURCE_DEFINITIONS[offer.resourceId])applyKitAcquisition(next,offer.resourceId,{source:offer.source,...offer.acquisitionChoices});
 }
 return {state:next,result:{allowed:true,...price,charged:xp,wufaCharged:wufaXP,paid:ledger.paid,remaining:price.cost-ledger.paid,complete,resourceId:offer.resourceId,offerId:offer.id}};
}
