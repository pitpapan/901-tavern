// User-supplied Guanlan rule, 2026-10-23. No shared discount budget.
export const GUANLAN_RULE='观澜法：实际持有者花XP提升六项基础属性，或白刃/运动/学识及其子技能，每升一级减1XP（突破同样适用），最低1XP；完整学习本树一门D级技艺每门减1XP。分次付款或分类重合不重复减；免费成长不返XP；无限次数，不叠加自身。不适用于本体取得、技艺进化、专长及其他成长/资源。前提、上限、突破收益不变。危境开悟的悟法XP单独记账，只能支付本树D级技艺，不能支付属性/技能/专长或其他资源。其他优惠依各自已确认规则处理。';
const attrs=['力量','敏捷','智力','感知','意志','风度'];
export const hasGuanlan=s=>s.guanlan?.acquired===true&&typeof s.guanlan.source==='string'&&s.guanlan.source.trim().length>0;
export const isGuanlanTechnique=o=>o.kind==='technique'&&o.tree==='guanlan'&&o.grade==='D';
export function growthPrice(state,baseCost,item){
 if(!Number.isSafeInteger(baseCost)||baseCost<0)throw Error('学习原价须为非负整数XP');
 const eligible=hasGuanlan(state)&&(item.kind==='attribute'&&attrs.includes(item.attribute)||item.kind==='skill'&&['白刃','运动','学识'].includes(item.skill)||isGuanlanTechnique(item));
 const discount=eligible&&baseCost>0?Math.min(1,baseCost-1):0;
 return {baseCost,cost:baseCost-discount,discount,discountSource:discount?'guanlan':null};
}

export function validateLearningOffer(o,id){
 if(!o?.adopted||!o.source?.trim()||o.id!==id||!o.resourceId||!o.name||!Array.isArray(o.actorIds)||typeof o.requirementsMet!=='boolean'||!['technique','acquisition','evolution','other'].includes(o.kind)||!Number.isSafeInteger(o.baseCost)||o.baseCost<0)throw Error('资源学习须逐项登记已采用的来源、名称、对象、取得类别、学习资格和XP原价');
 for(const p of Object.values(o.payments??{}))if(!Number.isSafeInteger(p.xp)||p.xp<0||!Number.isSafeInteger(p.wufaXP??0)||(p.wufaXP??0)<0||p.xp+(p.wufaXP??0)<=0)throw Error('分次付款须登记明确的普通XP与悟法XP金额');
 if(o.grantsGuanlan&&!(o.kind==='acquisition'&&o.resourceId==='guanlan'))throw Error('观澜本体取得须使用本体条目，不能伪装为技艺');
 if(o.otherDiscounts?.length)throw Error('其他学习优惠须先按其规则接入，不能擅自叠加');
 return o;
}

export function purchaseLearning(state,offer,{actorId,paymentId}={}){
 validateLearningOffer(offer,offer?.id);
 if(!offer.actorIds.includes(actorId)||!offer.requirementsMet)throw Error('不满足该资源当前学习条件');
 if(state.learnedResources?.[offer.resourceId]?.learned)throw Error('该资源已完整学习，不能再次计费');
 if(offer.grantsGuanlan&&hasGuanlan(state))throw Error('已经取得观澜法本体');
 const signature=JSON.stringify(offer),old=state.learningPurchases?.[offer.resourceId];
 if(old&&old.signature!==signature)throw Error('分次学习中的条目、价格或付款条件不能更换');
 const price=old?.price??growthPrice(state,offer.baseCost,offer),paid=old?.paid??0,remaining=price.cost-paid;
 if(paymentId!==undefined&&!Object.hasOwn(offer.payments??{},paymentId))throw Error('未登记本次付款方案');
 if(paymentId!==undefined&&old?.paymentIds.includes(paymentId))throw Error('本次分期已经支付，不能重复扣费');
 const payment=paymentId===undefined?{xp:remaining,wufaXP:0}:offer.payments[paymentId];
 const xp=payment.xp,wufaXP=payment.wufaXP??0,total=xp+wufaXP;
 if(total>remaining)throw Error('付款超过本门完整学习剩余费用');
 if(wufaXP&&(!hasGuanlan(state)||!isGuanlanTechnique(offer)))throw Error('悟法XP只可用于观澜树D级技艺完整学习');
 if(state.xp<xp)throw Error('Insufficient XP');
 if((state.guanlan?.wufaXP??0)<wufaXP)throw Error('悟法XP不足');
 const next=structuredClone(state);next.xp-=xp;if(wufaXP)next.guanlan.wufaXP-=wufaXP;
 const ledger={signature,price,paid:paid+total,xpPaid:(old?.xpPaid??0)+xp,wufaPaid:(old?.wufaPaid??0)+wufaXP,paymentIds:[...(old?.paymentIds??[]),...(paymentId===undefined?[]:[paymentId])]};
 (next.learningPurchases??={})[offer.resourceId]=ledger;
 const complete=ledger.paid===price.cost;
 if(complete){
  (next.learnedResources??={})[offer.resourceId]={learned:true,name:offer.name,source:offer.source,kind:offer.kind,tree:offer.tree,grade:offer.grade};
  if(offer.grantsGuanlan)next.guanlan={acquired:true,source:offer.source,wufaXP:0};
 }
 return {state:next,result:{allowed:true,...price,charged:xp,wufaCharged:wufaXP,paid:ledger.paid,remaining:price.cost-ledger.paid,complete,resourceId:offer.resourceId,offerId:offer.id}};
}
