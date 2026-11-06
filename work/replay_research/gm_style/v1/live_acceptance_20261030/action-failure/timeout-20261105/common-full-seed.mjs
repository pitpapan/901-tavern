import fs from 'node:fs';
import {createOpeningEncounter} from '../../../../../../rules_engine/combat/opening.mjs';
import {beginCommonTurn} from '../../../../../../rules_engine/combat/common-actions.mjs';
import {beginTurn} from '../../../../../../rules_engine/core.mjs';
import {normalizeMap} from '../../../../../../rules_engine/combat/map.mjs';
import {profile,refreshDerived} from '../../../../../../rules_engine/combat/mechanics.mjs';
import {panel} from '../../../../../../rules_engine/combat/engine.mjs';
import {inspectCommands} from '../../../../../../rules_engine/combat/runtime.mjs';
const L=process.argv[2],source='2026-11-06用户要求全项真实模型验收；仅隔离试验参数，非Canon，不赋给正式角色';
const specs=[['01','姿态全力'],['02','取物'],['03','虚招'],['04','绊摔'],['05','击落'],['06','击破'],['07','冲撞'],['08','反冲'],['09','擒抱'],['10','瞄准'],['11','调整'],['12','冲锋到期'],['13','受击伏地']];
const skill=(level,auto=0)=>({level,auto,subs:{}});
const sword={id:'practice-sword',name:'试验剑',source,location:'carried',held:true,oneHanded:true,grip:{hands:1,source},weapon:{name:'试验剑',type:'melee',skill:'白刃',damage:1,severity:'L',size:2,ap:0,magic:0,attackBonus:0,blockBonus:0},durability:{current:1,max:1,hardness:1}};
const cases=[];
for(const [n,title]of specs){
 const name=`901 全项战斗 ${n} ${title} 20261106`;
 const b=createOpeningEncounter({id:'all-live-'+n,scenario:'非剧情隔离战斗试验。御临风面对独立的试验陪练，不是黄泉本人。场地平坦无障碍。试验陪练配合测试，除本场指定动作外，本人回合只结束回合，不施展其他能力，不认输；受击按实际防护处理，不主动消耗意志。',participants:['player','huang'],positions:{player:[0,0],huang:[n==='12'?6:n==='10'?10:1,0]},teams:{player:'玩家方',huang:'试验方'}});
 const a=b.actors.player,t=b.actors.huang;t.name='试验陪练';t.state.name=t.name;t.combatProfile={...profile(t),hpFixed:100};t.combatProfile.armor={defense:0};
 t.state.attributes={力量:1,敏捷:1,智力:1,感知:1,意志:1,风度:1};t.state.skills={白刃:skill(1),肉搏:skill(1),运动:skill(1),社交:skill(1)};t.state.learnedResources={};t.abilities=['end'];t.buffs={};t.sheathed=false;t.tactics={intent:'这是授权配合试验：普通本人回合立即选end，保持当前位置。不主动准备、攻击、移动、认输或恢复。受击不用转换。',recent:[]};t.state.possessions={items:[structuredClone(sword)]};t.state.equippedWeaponId='practice-sword';
 a.combatProfile={...profile(a),hpFixed:100};
 if(['03','04','05','06','07','09'].includes(n)){a.state.attributes.力量=10;a.state.skills.肉搏=skill(5,2);a.state.skills.白刃=skill(5,2);}
 if(n==='03'){a.state.attributes.智力=10;a.state.skills.社交=skill(5,2);a.state.skills.社交.subs.唬骗={level:1};}
 if(n==='02')a.state.possessions={items:[{id:'test-cloth',name:'试验布条',source,location:'carried',access:'accessible',small:true,held:false},{id:'test-pack',name:'试验油布包',source,location:'carried',access:'backpack',held:false}]};
 if(n==='08'){a.state.attributes.力量=1;a.state.skills.肉搏=skill(0);a.state.skills.运动=skill(1);t.state.attributes.力量=12;t.state.skills.运动=skill(5,2);t.state.skills.肉搏=skill(5,2);t.tactics.intent='反冲专项：若counterRush窗口出现，必须选push击退，不选decline；其余自己的回合只选end，不发动其他动作。';}
 if(n==='09'){a.state.combatManeuvers={turn:0,weaponUnavailable:true};a.parameters={freeHands:2,freeHandsSource:source};a.visibleArms='空手';t.tactics.intent='擒抱配合试验：被抓住后不主动挣脱或攻击，自己的回合只选end。';}
 if(n==='10'){a.state.skills.射击=skill(4);a.state.possessions={items:[{id:'test-bow',name:'试验弓',source,location:'carried',held:true,oneHanded:false,grip:{hands:2,source},loaded:false,weapon:{name:'试验弓',type:'bow',skill:'射击',damage:2,severity:'L',attackBonus:0,blockBonus:0,strengthRequirement:2,rangeUnit:20,rangeUnits:8,ap:0,magic:0,ammunition:{kind:'arrow',cost:1,loadingAction:'swift'}}}]};a.state.equippedWeaponId='test-bow';a.ammunition=5;a.visibleArms='试验弓在手';}
 if(n==='11'){t.state.attributes.智力=12;t.state.skills.社交=skill(5,3);t.tactics.intent='调整架势专项：第一回合先对player执行feint虚招一次，然后选end；此后所有自己的回合只选end，不攻击或移动。';b.scenario+='本场试验陪练第一回合先对御临风进行一次虚招后结束回合，让御临风随后测试调整架势。';}
 if(n==='13'){t.abilities=['strike','end'];t.tactics.intent='受击伏地专项：第一回合先对player普通strike攻击一次，然后选end；此后只选end，不做其他动作。';b.scenario+='本场试验陪练先用试验剑普通近战攻击一次，等待御临风明确受击反应。';}
 b.activeId=['11','13'].includes(n)?'huang':'player';b.order=b.activeId==='player'?['player','huang']:['huang','player'];
 b.playerDefenseDeclarations=true;b.reactionWindows=true;b.map=normalizeMap({title:'全项隔离试验场',bounds:[-20,-20,60,60],features:[]},b);
 for(const x of Object.values(b.actors)){refreshDerived(x);x.state.health={...x.state.health,intact:x.state.derived.hpMax,B:0,L:0,A:0};}
 b.actors[b.activeId].state=beginTurn(b.actors[b.activeId].state).state;beginCommonTurn(b,b.actors[b.activeId]);
 const root={schemaVersion:1,revision:0,chatId:name,operations:{},actors:Object.fromEntries(Object.entries(b.actors).map(([id,x])=>[id,{name:x.name,state:structuredClone(x.state)}])),battle:b,ruleScene:{},testProvenance:{source,scenario:title,controlledParameters:'试验陪练弱属性/100生命，部分玩家试验力量或社交增强；见本种子，不带入正式角色。所有骰由原运行时随机生成。'}};
 fs.writeFileSync(L+'/'+n+'-root.json',JSON.stringify(root));
 cases.push({id:n,title,name,activeId:b.activeId,first:`仅隔离试验：${title}。当前${b.activeId==='player'?'御临风':'试验陪练'}回合；两人相距${b.actors.huang.position[0]}米。试验陪练不是黄泉本人，非Canon试验参数已登记。${n==='09'?'御临风空手，有两只空闲手。':n==='10'?'御临风双手持试验弓，尚未上箭，共5支箭。':n==='02'?'试验布条在方便取用的腰包，试验油布包在背包，均未取出。':'御临风持剑；陪练持试验剑。'}没有旧战斗伤势，自动填表关闭。`,legal:inspectCommands(b).options.map(o=>o.command),panels:{player:panel(b,'player'),huang:panel(b,'huang')}});
}
fs.writeFileSync(L+'/cases.json',JSON.stringify(cases,null,2));console.log('Prepared '+cases.length+' independent live seeds; no actual dice drawn.');
