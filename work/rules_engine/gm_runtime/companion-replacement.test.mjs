import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster} from '../combat/opening.mjs';
import {derived,profile,saveProfile} from '../combat/mechanics.mjs';
import {resourceBonus} from '../resource-definitions.mjs';
import {createOpeningEncounter} from '../combat/opening.mjs';
import {act} from '../combat/engine.mjs';
import {equipment} from '../combat/mechanics.mjs';
import {beginTurn} from '../core.mjs';
const source='隔离测试：实际取得后期单项资源';
const own=(a,id)=>{(a.state.learnedResources??={})[id]={learned:true,source};};
test('actual weapon draws spend their storage action and neither create inventory nor grant character growth',()=>{
 for(const [access,feat,action]of [['worn',0,'move'],['backpack',0,'full'],['worn',1,'swift']]){
  const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}}),a=b.actors.player;
  b.activeId='player';a.state=beginTurn(a.state).state;a.sheathed=true;
  if(access!=='backpack')own(a,'later:弃风');a.state.possessions={items:[{id:'actual-sword',resourceId:'later:弃风',source,location:'carried',access,oneHanded:true,held:false}]};
  if(feat)a.state.feats={'即时备战':{level:feat,source}};
  b.ruleScene={objects:{sword:{type:'kitResource',resourceId:'later:弃风',actorIds:['player'],source,plans:{draw:{source,itemId:'actual-sword',availableHands:1,operations:['equip']}}}}};
  const attributes=structuredClone(a.state.attributes),skills=structuredClone(a.state.skills),resources=structuredClone(a.state.resources),xp=a.state.xp;
  const out=act(b,{actorId:'player',abilityId:'mechanism',objectId:'sword',operation:'equip',part:'draw'},{playerAuthorized:true,drawDice:()=>Array(100).fill(8)});
  const s=out.battle.actors.player.state;
  assert.equal(out.result.mechanism.action,action);
  assert.equal(s.equippedWeaponId,'actual-sword');assert.equal(equipment(out.battle.actors.player).weapon.damage,16);
  assert.equal(s.turn[action==='full'?'standard':action],0);
  assert.deepEqual(s.attributes,attributes);assert.deepEqual(s.skills,skills);assert.deepEqual(s.resources,resources);assert.equal(s.xp,xp);
  if(access==='backpack')assert.equal(s.learnedResources?.['later:弃风'],undefined);
  assert.equal(s.possessions.items.length,1);assert.equal(a.state.possessions.items[0].held,false);
 }
});

test('later initiative replaces embedded T0 feat value only for the acquiring actor',()=>{
 const actors=createOpeningRoster(),before=structuredClone(actors);
 for(const [id,old]of [['huang',4],['jiang',1],['bright',3]]){
  const a=actors[id],base=derived(a).initiative;
  own(a,id+'.improved_initiative');
  assert.equal(derived(a).initiative,base-old+4);
  assert.equal(profile(a).initiativeDefense??0,0);
  assert.equal(resourceBonus(a.state,'initiativeDefense'),id==='jiang'?0:5);
  assert.deepEqual(a.state.attributes,before[id].state.attributes);
  assert.deepEqual(a.state.skills,before[id].state.skills);
  assert.deepEqual(a.state.resources,before[id].state.resources);
  assert.deepEqual(a.state.health,before[id].state.health);
 }
 assert.deepEqual(actors.player,before.player);
 assert.deepEqual(createOpeningRoster(),before);
});
test('later iron will replaces old save bonus and keeps mental upgrade non-stacking',()=>{
 for(const id of ['bright','jiang']){
  const a=createOpeningRoster()[id],old=saveProfile(a,'will').dp,will=structuredClone(a.state.will);
  own(a,id+'.iron_will');
  assert.equal(saveProfile(a,'will').dp,old-2+6);
  assert.equal(saveProfile(a,'will',{mental:true}).dp,old-2+(id==='jiang'?12:6));
  assert.deepEqual(a.state.will,will); // reading a template never refills current will
 }
});
test('later movement replaces old body-method allowance without granting child arts',()=>{
 const a=createOpeningRoster().bright,old=derived(a).speed;
 own(a,'bright.shimada_twins');
 assert.equal(derived(a).speed,old-10+20);
 assert.deepEqual(Object.keys(a.state.learnedResources),['bright.shimada_twins']);
});
