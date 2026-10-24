// Observational audit: deliberately does not invent an undocumented discount.
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createOpeningFixture} from '../../rules_engine/gm_runtime/opening.mjs';
import {createReplayCheckRuntime} from '../../rules_engine/gm_runtime/replay-check.mjs';
import {ruleRequestValid} from '../../rules_engine/gm_runtime/rule-actions.mjs';

const source='隔离测试假设：用户要求检查已拥有观澜法的御临风；不改变正式存档，不假定未知减免公式';
const cases=[
  {name:'属性普通级',select:{action:'growth',attribute:'力量'},level:4,cost:6,text:'我把力量提升一级。'},
  {name:'属性里程碑',select:{action:'growth',attribute:'力量'},level:5,cost:12,text:'我把力量提升一级。'},
  {name:'主技能普通级',select:{action:'growth',skill:'运动'},level:2,cost:3,text:'我把运动提升一级。'},
  {name:'主技能里程碑',select:{action:'growth',skill:'运动'},level:4,cost:9,text:'我把运动提升一级。'},
  {name:'子技能普通级',select:{action:'growth',skill:'白刃',sub:'长剑'},level:2,cost:3,text:'我把长剑提升一级。'},
  {name:'子技能里程碑',select:{action:'growth',skill:'白刃',sub:'长剑'},level:4,cost:9,text:'我把长剑提升一级。'},
  {name:'专长第一级',select:{action:'feat',featId:'auditFeat'},level:0,cost:3,text:'我学习测试专长。'},
  {name:'专长第二级',select:{action:'feat',featId:'auditFeat'},level:1,cost:6,text:'我把测试专长提升一级。'},
];
async function fixture(withGuanlan=false){
  const opening=createOpeningFixture(),anchor={chatId:'isolated-guanlan-xp',messageId:0,swipeId:0};let data={stat_data:{}};
  const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async next=>{data=structuredClone(next);}};
  const opts={baseline:opening.baseline,mvu,getAnchor:()=>anchor,expectedChatId:anchor.chatId,drawDice:()=>{throw Error('强化不得掷骰');}};
  let rt=createReplayCheckRuntime(opts);await rt.initialize({openingAssumption:true});
  const saved=()=>data.stat_data['901_rules_poc'];saved().actors.player.state.xp=100;
  saved().actors.other=structuredClone(saved().actors.player);saved().actors.other.name='未持有观澜法的对照人物';
  saved().ruleScene={growthWindow:{id:'audit-gap',source,open:true,actorIds:['player','other']},
    feats:{auditFeat:{id:'auditFeat',name:'测试专长',source,adopted:true,maxLevel:5}},
    objects:withGuanlan?{guanlan:{type:'guanlan',name:'观澜法',source,actorIds:['player']}}:{}};
  return {saved,get rt(){return rt;},reload(){rt=createReplayCheckRuntime(opts);},data:()=>structuredClone(data)};
}
const rows=[];
for(const c of cases){
  const variants=[];
  for(const owned of [false,true]){
    const f=await fixture(owned),s=f.saved().actors.player.state,q={kind:'rule',actorId:'player',...c.select};
    if(q.attribute)s.attributes[q.attribute]=c.level;
    else if(q.skill){if(q.sub)s.skills[q.skill].subs[q.sub].level=c.level;else s.skills[q.skill].level=c.level;}
    else s.feats={auditFeat:{level:c.level}};
    const untouchedOther=structuredClone(f.saved().actors.other),objects=structuredClone(f.saved().ruleScene.objects);
    const input={operationId:'gm-runtime/isolated-guanlan-xp/upgrade',request:q,context:{latest:{text:c.text}}};
    const out=await f.rt.settle(input);assert.equal(out.status,'applied');assert.equal(out.result.cost,c.cost);
    assert.equal(f.rt.currentPlayer().xp,100-c.cost);assert.deepEqual(f.saved().actors.other,untouchedOther);
    assert.deepEqual(f.saved().ruleScene.objects,objects);
    const after=f.data();f.reload();assert.equal((await f.rt.settle(input)).status,'already_applied');assert.deepEqual(f.data(),after);
    variants.push({declaredOwnership:owned,charged:out.result.cost,xpBefore:100,xpAfter:f.rt.currentPlayer().xp,duplicateCharged:0,otherActorUnchanged:true});
  }
  rows.push({case:c.name,variants,finding:'现有执行器按全价收费；没有观澜减免实现。拥有记录仅为隔离假设，当前系统没有其专用状态结构。'});
}
const f=await fixture(true);
const before=f.data(),resourceRequest={kind:'rule',action:'resource',actorId:'player',resourceId:'auditResource'};
assert.equal(ruleRequestValid(resourceRequest),false);
const resource=await f.rt.settle({operationId:'gm-runtime/isolated-guanlan-xp/resource',request:resourceRequest,context:{latest:{text:'我学习测试资源。'}}});
assert.equal(resource.status,'needs_input');assert.deepEqual(f.data(),before);
rows.push({case:'资源学习/强化',status:resource.status,charged:0,finding:'无资源学习XP交易路由；拒绝请求不是正确减免通过。',missing:resource.missing});
const companion=await f.rt.settle({operationId:'gm-runtime/isolated-guanlan-xp/other',request:{kind:'rule',action:'growth',actorId:'other',attribute:'力量'},context:{latest:{text:'我把力量提升一级。'}},ruleContext:{actorIds:['other']}});
assert.equal(companion.status,'applied');assert.equal(companion.result.cost,12);assert.deepEqual(f.saved().actors.player,before.stat_data['901_rules_poc'].actors.player);
const report={status:'gaps_found',mode:'Local real replay runtime + isolated in-memory MVU; no Gemini or formal character mutation',
  sourceStatus:'观澜法原文尚未检出，不能确定正确减免数额和分区规则。已询问用户补充原文。',
  ownershipFixture:'在ruleScene.objects登记仅作用于player的观澜法测试对象；当前执行器不识别该能力，没有假造一个已支持的观澜状态字段。',
  rows,crossActor:{otherCharged:companion.result.cost,playerUnchanged:true},
  boundaryConclusion:'当前无减免可泄漏，不能据此声称减免分区正确。须取得原文、实现减免后再验证属性/技能/专长/资源间及人物间的额度隔离。',
  priorClaimCorrection:'上一轮351项测试覆盖通用强化和D1–D14，不覆盖观澜法或资源学习扣XP。'};
await writeFile('output/replay_tavern/six_books_20261023_candidate/scene_test/guanlan-xp-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,rows:rows.map(r=>({case:r.case,charged:r.variants?.map(v=>v.charged)??r.charged,status:r.status})),crossActor:report.crossActor,boundaryConclusion:report.boundaryConclusion}));
