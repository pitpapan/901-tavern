import test from 'node:test';
import assert from 'node:assert/strict';
import {RESOURCE_DEFINITIONS} from '../resource-definitions.mjs';
import {RESOURCE_CATALOG} from '../resource-catalog.mjs';
import {RESOURCE_ACTION_INDEX} from '../resource-action-index.mjs';
import {createOpeningRoster} from '../combat/opening.mjs';
import {reduceRuleAction} from './rule-actions.mjs';
import {ruleActionInstructions} from './rule-reference.mjs';

// These tests use generated development exports as-is. No temporary registration.
const healingId='candidate-901-spell-a3d953c556f47f6b';
const source='隔离开发包测试：已确认导师与采用报价，无实际人物写入';
test('development exports connect verified candidate definitions, catalog and classifier without changing maintained IDs',()=>{
  const candidates=Object.entries(RESOURCE_DEFINITIONS).filter(([,d])=>d.identity.adoptionStatus==='candidate');
  assert.ok(candidates.some(([id])=>id===healingId));
  const catalog=Object.values(RESOURCE_CATALOG);
  assert.equal(catalog.filter(x=>x.kind==='spell'&&!x.prohibited&&x.adoptionStatus!=='candidate').length,208);
  assert.equal(catalog.filter(x=>x.prohibited).length,7);
  for(const [id,definition]of candidates){
    assert.equal(RESOURCE_CATALOG[id].adoptionStatus,'candidate');
    assert.equal(RESOURCE_CATALOG[id].sourceHash,definition.reading.sha256);
    const row=RESOURCE_ACTION_INDEX.find(x=>x.resourceId===id);
    if(definition.operations.length){
      assert.equal(row.version,definition.contractVersion);
      assert.deepEqual(row.actions.map(x=>x.operation),definition.operations);
      assert.ok(row.actions.every(x=>x.availability==='execution-verified'));
    }
  }
  const instructions=ruleActionInstructions({topics:'治疗微伤'});
  assert.ok(instructions.includes(healingId));assert.ok(instructions.includes('"operation":"cast"'));
});

test('generated candidate can be learned and used through normal rule dispatch without registry injection',()=>{
  const definition=RESOURCE_DEFINITIONS[healingId];assert.ok(definition);
  const root={actors:createOpeningRoster()},original=structuredClone(root);
  const s=root.actors.player.state;s.xp=6;s.lifeType='living';
  s.skills.神秘={level:1,subs:{咒法:{level:1}}};s.resources.测试魔力={kind:'magic',current:0,max:5};
  s.health.B=1;s.health.intact--;
  root.ruleScene={growthWindow:{id:'test',source,open:true,actorIds:['player']},learningOffers:{healing:{
    id:'healing',resourceId:healingId,name:'治疗微伤',source,adopted:true,actorIds:['player'],requirementsMet:true,
    kind:'technique',tree:definition.identity.tree,grade:'ungraded',baseCost:3,contractVersion:definition.contractVersion,
    acquisitionChoices:{magicPool:'测试魔力'}}},objects:{healing:{type:'kitResource',resourceId:healingId,source,actorIds:['player'],plans:{self:{
      source,targetIds:['player'],effectLine:true,precise:true,components:{posture:true,language:true,focus:true},inputs:{augmentationEnergy:0}}}}}};
  const use={kind:'rule',action:'mechanism',actorId:'player',objectId:'healing',part:'self',operation:'cast'};
  assert.throws(()=>reduceRuleAction(root,use),/尚未实际学会/);
  const learned=reduceRuleAction(root,{kind:'rule',action:'resource',actorId:'player',offerId:'healing'});
  assert.equal(learned.actors.player.state.xp,3);assert.equal(learned.actors.player.state.health.B,1);
  const used=reduceRuleAction(JSON.parse(JSON.stringify(learned)),use);
  assert.equal(used.actors.player.state.health.B,0);assert.equal(used.actors.player.state.xp,3);
  assert.deepEqual(createOpeningRoster(),original.actors);
  assert.equal(original.actors.player.state.learnedResources?.[healingId],undefined);
});

test('candidate passive fragments cannot be purchased as a completed parent resource',()=>{
  const passive=Object.entries(RESOURCE_DEFINITIONS).find(([,d])=>d.identity.adoptionStatus==='candidate'&&d.effects.length&&!d.learning?.policy);
  assert.ok(passive);const [id,d]=passive,root={actors:createOpeningRoster()};root.actors.player.state.xp=100;
  root.ruleScene={growthWindow:{id:'test',source,open:true,actorIds:['player']},learningOffers:{art:{id:'art',resourceId:id,name:d.identity.name,
    source,adopted:true,actorIds:['player'],requirementsMet:true,kind:'technique',tree:d.identity.tree,grade:'D',baseCost:3}}};
  const before=structuredClone(root);
  assert.throws(()=>reduceRuleAction(root,{kind:'rule',action:'resource',actorId:'player',offerId:'art'}),/候选.*取得|取得.*尚未|学习.*未/);
  assert.deepEqual(root,before);
});
