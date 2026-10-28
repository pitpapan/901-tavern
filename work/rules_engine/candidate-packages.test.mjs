import test from 'node:test';
import assert from 'node:assert/strict';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {RESOURCE_ACTION_INDEX} from './resource-action-index.mjs';
import {createOpeningRoster} from './combat/opening.mjs';
import {saveProfile} from './combat/mechanics.mjs';
import {purchaseLearning} from './growth-pricing.mjs';

test('two candidate packages retain spell learning without granting or selling a passive-only bundle',()=>{
  const id='candidate-901-magic-bundle-de9b5c40b4fa2353',definition=RESOURCE_DEFINITIONS[id];
  assert.ok(definition,'verified shadow passive must survive alongside the technique package');
  const spellRows=RESOURCE_ACTION_INDEX.filter(row=>row.resourceId.startsWith('candidate-901-spell-'));
  assert.equal(spellRows.length,9);
  assert.ok(spellRows.every(row=>row.learning));
  assert.equal(RESOURCE_ACTION_INDEX.some(row=>row.resourceId===id),false);
  const actor=createOpeningRoster().player,baseline=saveProfile(actor,'fort').dp;
  assert.equal(actor.state.learnedResources?.[id],undefined);
  actor.state.xp=100;
  const before=structuredClone(actor);
  assert.throws(()=>purchaseLearning(actor.state,{
    id:'test-bundle',resourceId:id,name:'阴影超魔使',kind:'acquisition',grade:'D',
    baseCost:15,adopted:true,source:'隔离测试报价，不代表真实采用',actorIds:['player'],requirementsMet:true,
  },{actorId:'player'}),/候选取得事务尚未接入/);
  assert.deepEqual(actor,before);
  actor.state.learnedResources??={};
  actor.state.learnedResources[id]={learned:true,version:definition.contractVersion,
    qualificationVersion:definition.contractVersion,grade:'D',completedStages:['D'],
    adoptionStatus:'adopted',source:'隔离测试：已核验的D阶资格，不是真实人物取得'};
  const saved=JSON.parse(JSON.stringify(actor));
  assert.equal(saveProfile(saved,'fort').dp,baseline+3);
  assert.deepEqual(saved.state.health,before.state.health);
  assert.equal(saved.state.xp,100);
});
