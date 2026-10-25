import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createOpeningRoster,createOpeningEncounter} from '../combat/opening.mjs';
import {RESOURCE_DEFINITIONS} from '../resource-definitions.mjs';
import {RESOURCE_CATALOG} from '../resource-catalog.mjs';
import {reduceRuleAction} from './rule-actions.mjs';
import {act} from '../combat/engine.mjs';
import {beginTurn} from '../core.mjs';
const contract=JSON.parse(fs.readFileSync(new URL('../../../../901-resource-authoring-kit/outputs/技艺适配-20261025/execution/contracts/candidate-901-spell-a3d953c556f47f6b.rule.json',import.meta.url),'utf8'));
const id=contract.id,source='隔离规则测试／用户授权的虚构取得与场景',dice=()=>Array(200).fill(8);
function registered(fn){
 const old=RESOURCE_DEFINITIONS[id],cat=RESOURCE_CATALOG[id];
 RESOURCE_DEFINITIONS[id]={...structuredClone(contract.definition),contractVersion:contract.version,identity:contract.identity,operations:['cast']};
 RESOURCE_CATALOG[id]={id,name:'治疗微伤',kind:'spell',source:contract.reading.path};
 try{return fn();}finally{if(old===undefined)delete RESOURCE_DEFINITIONS[id];else RESOURCE_DEFINITIONS[id]=old;if(cat===undefined)delete RESOURCE_CATALOG[id];else RESOURCE_CATALOG[id]=cat;}
}
function scene({augmentation=0,level,mana=10,combat=false}={}){
 const root=combat?createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}}):{actors:createOpeningRoster()};
 if(combat){root.activeId='player';root.actors.player.state=beginTurn(root.actors.player.state).state;}
 const a=root.actors.player,t=root.actors.huang,s=a.state;if(combat)t.team='隔离测试对手';
 s.skills.神秘={level:3,subs:{咒法:{level:1}}};s.resources.实际魔力={current:mana,max:10,generic:true};
 s.learnedResources={[id]:{learned:true,version:contract.version,grade:'ungraded',source,adoptionStatus:'adopted',choices:{magicPool:'实际魔力'},qualifications:{energyPools:{实际魔力:{kind:'magic',source}}}}};
 if(level!==undefined)s.learnedResources[id].qualifications.highestCasterLevel=level;
 t.state.lifeType='living';t.state.health={intact:t.state.derived.hpMax-8,B:4,L:3,A:1,temp:7,coma:false};
 const plan={source,targetIds:['huang'],distance:1,effectLine:true,precise:true,components:{posture:true,language:true,focus:true},inputs:{augmentationEnergy:augmentation}};
 root.ruleScene={objects:{candidate:{type:'kitResource',resourceId:id,source,actorIds:['player'],plans:{use:plan}}}};
 return {root,plan,request:{kind:'rule',action:'mechanism',actorId:'player',objectId:'candidate',operation:'cast',part:'use'}};
}
const run=x=>reduceRuleAction(x.root,x.request,{drawDice:dice});
const reject=(x,pattern)=>{const before=structuredClone(x.root);assert.throws(()=>run(x),pattern);assert.deepEqual(x.root,before);};
test('ungraded free base heals one B with zero mana and no caster record; no XP or stored healing',()=>registered(()=>{
 const x=scene({mana:0}),before=structuredClone(x.root),out=run(x),t=out.actors.huang.state;
 assert.equal(out.result.cost,0);assert.equal(out.result.targets[0].effectivePower,1);assert.equal(t.health.B,3);assert.equal(t.health.L,3);assert.equal(t.health.A,1);assert.equal(t.health.temp,7);
 assert.deepEqual(x.root,before);assert.equal(out.actors.player.state.resources.实际魔力.current,0);assert.equal(out.actors.player.state.xp,before.actors.player.state.xp);assert.equal(out.actors.player.state.casting,undefined);
}));
test('bounded augmentation pays actual mana once and heals L/A at 4/10 points',()=>registered(()=>{
 for(const [augmentation,level,severity]of [[2,1,'L'],[6,3,'A']]){
  const x=scene({augmentation,level}),out=run(x);assert.equal(out.result.cost,augmentation);assert.equal(out.actors.player.state.resources.实际魔力.current,10-augmentation);assert.equal(out.actors.huang.state.health[severity],x.root.actors.huang.state.health[severity]-1);
 }
}));
test('odd augmentation floors healing points and unused points never accumulate across save round trips',()=>registered(()=>{
 const x=scene({augmentation:1,level:1});x.plan.healOrder=['B'];const first=JSON.parse(JSON.stringify(run(x)));
 assert.equal(first.actors.huang.state.health.B,2);assert.equal(first.result.targets[0].steps[0].remaining,0);
 const second=reduceRuleAction(first,x.request,{drawDice:dice});assert.equal(second.actors.huang.state.health.B,0);assert.equal(second.actors.player.state.resources.实际魔力.current,8);assert.equal(second.actors.huang.state.health.L,3);assert.equal(second.actors.huang.state.health.A,1);
}));
test('augmentation above actual cap, fractional choices, or absent caster input reject before payment',()=>registered(()=>{
 for(const augmentation of [3,-1,.5])reject(scene({augmentation,level:1}),/增幅/);
 reject(scene({augmentation:1}),/最高施法者等级/);
 const x=scene({augmentation:2,level:1,mana:1});reject(x,/能量不足/);
}));
test('actual owned version, conjuration qualification and bound magic pool are required',()=>registered(()=>{
 let x=scene();delete x.root.actors.player.state.learnedResources[id];reject(x,/尚未实际学会/);
 x=scene();x.root.actors.player.state.learnedResources[id].version='old';reject(x,/本契约版本/);
 x=scene();delete x.root.actors.player.state.skills.神秘.subs.咒法;reject(x,/专业资格/);
 x=scene();x.plan.pool='流风';reject(x,/未登记/);
 x=scene();delete x.root.actors.player.state.learnedResources[id].qualifications.energyPools;reject(x,/魔力资格/);
}));
test('touch, living type, actual death, components and allocation are checked before payment',()=>registered(()=>{
 let x=scene();x.plan.distance=5;reject(x,/触及/);
 x=scene();x.root.actors.huang.state.lifeType='undead';x.plan.targetKinds={huang:'living'};reject(x,/活物/);
 x=scene();const t=x.root.actors.huang.state;t.health.A=t.derived.hpMax;t.health.intact=0;t.health.L=0;t.health.B=0;reject(x,/已死亡/);
 for(const order of [['B','B'],['unknown']]){x=scene({augmentation:2,level:1});x.plan.healOrder=order;reject(x,/不重复的A\/L\/B/);}
 x=scene();delete x.plan.components.language;reject(x,/施法成分/);
 x=scene();x.plan.inputs.P=999;reject(x,/不能提供效果数值/);
}));
test('actual wound restrictions survive healing and JSON save roundtrip',()=>registered(()=>{
 const x=scene({augmentation:2,level:1});x.plan.healOrder=['L'];x.root.actors.huang.recoveryLocks=[{severity:'L',count:1,recovery:'naturalOnly'},{severity:'L',count:1,recovery:'aggravated'}];
 const out=JSON.parse(JSON.stringify(run(x)));assert.equal(out.actors.huang.state.health.L,2);assert.deepEqual(out.actors.huang.recoveryLocks,x.root.actors.huang.recoveryLocks);assert.equal(out.actors.huang.state.health.A,1);
}));
test('combat kit dispatch pays one standard and rejects a second cast without changing original state',()=>registered(()=>{
 const x=scene({combat:true,mana:0});const command={actorId:'player',abilityId:'mechanism',objectId:'candidate',operation:'cast',part:'use'};
 const out=act(x.root,command,{drawDice:dice,playerAuthorized:true});assert.equal(out.battle.actors.huang.state.health.B,3);
 assert.equal(out.battle.actors.player.state.turn.standard,0);const saved=structuredClone(out.battle);assert.throws(()=>act(out.battle,command,{drawDice:dice,playerAuthorized:true}),/Standard action spent/);assert.deepEqual(out.battle,saved);
}));

test('self treatment needs living wounds and qualifications but no external touch distance',()=>registered(()=>{
 const x=scene({mana:0});x.plan.targetIds=['player'];x.root.actors.player.state.lifeType='living';delete x.root.actors.player.reach;delete x.plan.distance;
 const s=x.root.actors.player.state;s.health.B=1;s.health.intact-=1;const out=run(x);assert.equal(out.actors.player.state.health.B,0);
}));
