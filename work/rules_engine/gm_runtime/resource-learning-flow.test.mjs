import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createOpeningFixture} from './opening.mjs';
import {createIntegratedSession} from './integrated.mjs';
import {createReplayCheckRuntime} from './replay-check.mjs';
import {ruleActionInstructions} from './rule-reference.mjs';
import {RESOURCE_DEFINITIONS} from '../resource-definitions.mjs';
import {RESOURCE_CATALOG} from '../resource-catalog.mjs';
import {RESOURCE_ACTION_INDEX} from '../resource-action-index.mjs';

const contract=JSON.parse(readFileSync(new URL('../../../../901-resource-authoring-kit/outputs/技艺适配-20261025/execution/contracts/candidate-901-spell-a3d953c556f47f6b.rule.json',import.meta.url),'utf8'));
const id=contract.id,source='隔离学习流程：已确认导师传授；不属于实际剧情或取得记录';
const learningRequest={kind:'rule',action:'resource',actorId:'player',offerId:'minor-healing'};
async function registered(run){
  const oldDefinition=RESOURCE_DEFINITIONS[id],oldCatalog=RESOURCE_CATALOG[id],indexLength=RESOURCE_ACTION_INDEX.length;
  RESOURCE_DEFINITIONS[id]={...structuredClone(contract.definition),contractVersion:contract.version,identity:contract.identity,operations:['cast']};
  RESOURCE_CATALOG[id]={id,name:contract.identity.name,kind:'spell',source:contract.reading.path};
  RESOURCE_ACTION_INDEX.push({resourceId:id,name:contract.identity.name,version:contract.version,actions:contract.actions});
  try{return await run();}finally{
    if(oldDefinition===undefined)delete RESOURCE_DEFINITIONS[id];else RESOURCE_DEFINITIONS[id]=oldDefinition;
    if(oldCatalog===undefined)delete RESOURCE_CATALOG[id];else RESOURCE_CATALOG[id]=oldCatalog;
    RESOURCE_ACTION_INDEX.splice(indexLength);
  }
}
async function fixture(){
  const opening=createOpeningFixture(),original=structuredClone({actors:opening.actors,baseline:opening.baseline});
  // Only this in-memory fixture receives eligibility and XP. The source T0 stays unchanged.
  const actors=structuredClone(opening.actors),s=actors.player.state;
  s.xp=8;s.skills.神秘={level:1,subs:{咒法:{level:1}}};
  s.resources.实际魔力={kind:'magic',current:0,max:5,generic:true};
  s.lifeType='living';s.health.B=2;s.health.intact-=2;
  s.guanlan={acquired:true,source,wufaXP:7};
  const chat=[{is_user:false,mes:'隔离测试学习场景',swipe_id:0}],floors={};
  const tavern={chatId:'candidate-learning-flow',chat,saveChat:async()=>{}};
  const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]??{stat_data:{}}),replaceMvuData:async(value,{message_id})=>{floors[message_id]=JSON.parse(JSON.stringify(value));}};
  const getAnchor=()=>({chatId:tavern.chatId,messageId:chat.length-1,swipeId:0});
  const opts={baseline:opening.baseline,mvu,getAnchor,expectedChatId:tavern.chatId};
  const session=createIntegratedSession({baseline:opening.baseline,mvu,tavern,
    fixtureFactory:()=>({...opening,actors}),generateRaw:async()=>{throw Error('No external model is permitted in this test');},
    createChatMessages:async()=>{},setChatMessages:async()=>{}});
  await session.prepare();
  const offer={id:'minor-healing',resourceId:id,name:'治疗微伤',source,adopted:true,actorIds:['player'],requirementsMet:true,
    kind:'technique',tree:'candidate-901-techniques',grade:'ungraded',baseCost:3,contractVersion:contract.version,
    acquisitionChoices:{magicPool:'实际魔力'}};
  const current=()=>floors[chat.length-1].stat_data['901_rules_poc'];
  const register=(selected=offer)=>session.registerRuleScene({source,
    growthWindow:{id:'study',source,open:true,actorIds:['player']},learningOffers:{'minor-healing':selected},
    objects:{healing:{type:'kitResource',resourceId:id,source,actorIds:['player'],plans:{self:{source,targetIds:['player'],effectLine:true,precise:true,components:{posture:true,language:true,focus:true},inputs:{augmentationEnergy:0}}}}}});
  const settle=(runtime,operation,text,request=learningRequest)=>runtime.settle({operationId:'gm-runtime/'+tavern.chatId+'/'+operation,request,context:{latest:{text}}});
  return {opening,original,actors,chat,floors,current,opts,session,offer,register,settle};
}

test('candidate offer registration and classifier selectors never grant ownership or accept a model-supplied price',async()=>registered(async()=>{
  const f=await fixture(),before=structuredClone(f.current().actors);
  await f.register();assert.deepEqual(f.current().actors,before);
  const runtime=createReplayCheckRuntime(f.opts),context=runtime.ruleContext(),instructions=ruleActionInstructions({...context,topics:'治疗微伤'});
  assert.equal(context.learningOffers[0].contractVersion,contract.version);
  assert.ok(instructions.includes('minor-healing'));assert.ok(instructions.includes('"operation":"cast"'));
  assert.ok(instructions.includes('不填价格、折扣或XP'));
  const saved=structuredClone(f.floors);
  for(const addition of [{xp:0},{discount:3},{adopted:true},{acquisitionChoices:{magicPool:'流风'}}]){
    const out=await f.settle(runtime,'numeric-'+Object.keys(addition)[0],'我学习治疗微伤。',{...learningRequest,...addition});
    assert.equal(out.status,'needs_input');assert.deepEqual(f.floors,saved);
  }
  assert.deepEqual(f.opening.actors,f.original.actors);assert.deepEqual(f.opening.baseline,f.original.baseline);
}));

test('only explicit learning spends ordinary XP; reload, next message, repeat request and self cast preserve the same acquisition',async()=>registered(async()=>{
  const f=await fixture();await f.register();let runtime=createReplayCheckRuntime(f.opts);
  const before=structuredClone(f.current().actors),text='我学习治疗微伤，使用普通XP付清。';
  let out=await f.settle(runtime,'learn',text);
  assert.equal(out.status,'applied');assert.equal(out.result.charged,3);assert.equal(out.result.discount,0);assert.equal(out.result.complete,true);
  const learned=f.current().actors.player.state.learnedResources[id];
  assert.equal(learned.version,contract.version);assert.equal(learned.adoptionStatus,'adopted');assert.equal(learned.source,source);
  assert.equal(learned.choices.magicPool,'实际魔力');assert.equal(f.current().actors.player.state.xp,5);
  assert.deepEqual(f.current().actors.player.state.health,before.player.state.health);
  assert.deepEqual(f.current().actors.player.state.resources,before.player.state.resources);
  assert.deepEqual(f.current().actors.player.state.guanlan,before.player.state.guanlan);
  for(const actorId of Object.keys(before).filter(key=>key!=='player'))assert.deepEqual(f.current().actors[actorId],before[actorId]);
  const saved=structuredClone(f.current());
  f.chat.push({is_user:true,mes:'我继续处理伤口。',swipe_id:0});await f.session.prepare();
  assert.deepEqual(f.current(),saved);runtime=createReplayCheckRuntime(f.opts);
  out=await f.settle(runtime,'learn',text);assert.equal(out.status,'already_applied');assert.deepEqual(f.current(),saved);
  out=await f.settle(runtime,'second-purchase',text);assert.equal(out.status,'needs_input');assert.deepEqual(f.current(),saved);
  const request={kind:'rule',action:'mechanism',actorId:'player',objectId:'healing',operation:'cast',part:'self'};
  out=await f.settle(runtime,'cast','我使用治疗微伤治疗自己。',request);
  assert.equal(out.status,'applied');assert.equal(out.result.cost,0);assert.equal(f.current().actors.player.state.health.B,1);
  assert.equal(f.current().actors.player.state.xp,5);assert.equal(f.current().actors.player.state.resources.实际魔力.current,0);
  assert.deepEqual(f.current().actors.player.state.learnedResources[id],learned);
  assert.deepEqual(f.opening.actors,f.original.actors);assert.deepEqual(f.opening.baseline,f.original.baseline);
}));

test('questions, cancellation, Wufa-only declaration and unadopted offers do not silently buy the candidate',async()=>registered(async()=>{
  const f=await fixture(),unregistered=structuredClone(f.floors);
  await assert.rejects(()=>f.register({...f.offer,adopted:false}),/已采用/);assert.deepEqual(f.floors,unregistered);
  await f.register();const runtime=createReplayCheckRuntime(f.opts),before=structuredClone(f.floors);
  for(const [index,text]of ['我能否学习治疗微伤？','我暂不学习治疗微伤。','我用悟法XP学习治疗微伤。'].entries()){
    const out=await f.settle(runtime,'declined-'+index,text);assert.equal(out.status,'needs_input');assert.deepEqual(f.floors,before);
  }
  assert.equal(f.current().actors.player.state.xp,8);assert.equal(f.current().actors.player.state.guanlan.wufaXP,7);
  assert.equal(f.current().actors.player.state.learnedResources?.[id],undefined);
}));
