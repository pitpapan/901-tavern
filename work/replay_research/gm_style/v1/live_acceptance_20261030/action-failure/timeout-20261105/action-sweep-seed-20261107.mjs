// Independent, explicitly non-Canon conditions; real UI requests keep random dice.
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const S=process.argv[2],E=S+'/app/public/901-opening-combat/work/rules_engine';
const {createOpeningEncounter}=await import(pathToFileURL(E+'/combat/opening.mjs'));
const {beginTurn}=await import(pathToFileURL(E+'/core.mjs'));
const {beginCommonTurn}=await import(pathToFileURL(E+'/combat/common-actions.mjs'));
const {normalizeMap}=await import(pathToFileURL(E+'/combat/map.mjs'));
const {inspectCommands}=await import(pathToFileURL(E+'/combat/runtime.mjs'));
const {resolveStep}=await import(pathToFileURL(E+'/combat/transitions.mjs'));
const source='2026-11-07用户授权全部动作集中隔离测试；试验初态不进入正式角色';
const cases=[];
const base=()=>{
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]},teams:{player:'玩家方',huang:'试验方'}});
 b.scenario='非Canon隔离试验。试验陪练不是黄泉本人。仅按已声明动作执行；陪练自己回合只end，不攻击、不移动、不恢复；无战斗胜负或认输目标。';
 b.activeId='player';b.order=['player','huang'];b.round=2;b.playerDefenseDeclarations=true;b.reactionWindows=true;
 const a=b.actors.player,t=b.actors.huang;
 t.name=t.state.name='试验陪练';t.abilities=['end'];t.sheathed=false;t.buffs={};t.state.attributes={力量:1,敏捷:1,智力:1,感知:1,意志:1,风度:1};
 t.state.skills={白刃:{level:1,subs:{}},肉搏:{level:1,subs:{}},运动:{level:1,subs:{}},社交:{level:1,subs:{}}};t.combatProfile={...t.combatProfile,hpFixed:100};t.state.health={...t.state.health,intact:100,B:0,L:0,A:0};t.state.derived.hpMax=100;
 t.tactics={intent:'本次仅配合试验，自己回合立即选end，所有反应不用转换，不新增能力，不认输。',recent:[]};
 t.state.possessions={items:[{id:'practice-sword',name:'试验剑',source,location:'carried',held:true,oneHanded:true,grip:{hands:1,source},weapon:{name:'试验剑',type:'melee',skill:'白刃',damage:1,severity:'L',size:2,ap:0,magic:0,attackBonus:0,blockBonus:0},durability:{current:3,max:3,hardness:1}}]};t.state.equippedWeaponId='practice-sword';
 a.state=beginTurn(a.state).state;a.state.anatomy={source,graspingLimbs:['left','right']};a.parameters={...a.parameters,freeHands:2,freeHandsSource:source};
 a.state.possessions={items:[{id:'opening.qifeng',name:'弃风剑',aliases:['弃风'],source,location:'carried',held:true,access:'worn',oneHanded:true,grip:{hands:1,source},weapon:{name:'弃风剑',type:'melee',skill:'白刃',sub:'长剑',damage:6,severity:'L',size:3,ap:2,magic:2,defenseReduction:3,attackBonus:0,blockBonus:0}}]};a.state.equippedWeaponId='opening.qifeng';a.sheathed=false;
 b.map=normalizeMap({title:'动作集中隔离试验场',bounds:[-30,-30,100,100],features:[]},b);beginCommonTurn(b,a);return b;
};
const emptyHands=b=>{const a=b.actors.player;a.state.possessions.items[0].held=false;delete a.state.equippedWeaponId;a.state.combatManeuvers.weaponUnavailable=true;a.sheathed=true;a.visibleArms='双手空着';};
function add(title,texts,expected,modify=()=>{}){
 const b=base();modify(b);const id=String(cases.length+1).padStart(2,'0'),name=`901 集中 ${id} ${title} 20261107`;
 const root={schemaVersion:1,revision:0,chatId:name,operations:{},actors:Object.fromEntries(Object.entries(b.actors).map(([id,a])=>[id,{name:a.name,state:structuredClone(a.state)}])),battle:b,ruleScene:b.ruleScene??{},testProvenance:{source,title}};
 fs.writeFileSync(S+'/'+id+'-root.json',JSON.stringify(root));
 const options=inspectCommands(b);cases.push({id,title,name,texts,expected,first:`【非Canon隔离动作测试：${title}】当前人物、道具与动作预算以本聊天规则状态为准；御临风和试验陪练在平坦试验场中，试验装备/药品只属于本测试。${b.pending?'现在等待御临风明确反应。':'现在是御临风回合；没有输入的攻击、位移、用药或结束回合均不执行。'}`,legal:options.options.map(o=>o.command),unavailable:options.unavailable});
}
add('姿态全力',['御临风伏地，然后起身，接着对试验陪练使出全力一击；不结束回合。'],['dropProne','stand','allOut']);
add('随身取物',['御临风先取出腰包里的试验布条，再从背包取出试验油布包；不使用它们。'],['takeItem','takeItem'],b=>b.actors.player.state.possessions.items.push({id:'cloth',name:'试验布条',source,location:'carried',held:false,access:'accessible',small:true},{id:'pack',name:'试验油布包',source,location:'carried',held:false,access:'backpack'}));
add('虚招',['御临风对试验陪练使用虚招；不攻击。'],['feint']);
add('绊摔',['御临风尝试绊摔试验陪练；不追加攻击。'],['trip']);
add('击落',['御临风击落试验陪练手中那把试验剑；不攻击其身体。'],['disarm']);
add('击破',['御临风击破试验陪练手中的试验剑；不攻击其身体。'],['sunder']);
add('击退',['御临风冲撞试验陪练，选择将其击退。'],['bullRush']);
add('击倒',['御临风冲撞试验陪练，选择将其击倒。'],['bullRush']);
add('擒抱',['御临风用力量擒抱试验陪练；不追加攻击。'],['grapple'],emptyHands);
add('瞄准装填',['御临风用试验弓瞄准试验陪练，然后给弓上箭；暂不射击。','御临风结束本回合。','御临风用已上箭的试验弓射击试验陪练。'],['aim','reload','end','strike'],b=>{const a=b.actors.player;a.state.skills.射击={level:4,subs:{}};a.state.possessions.items=[{id:'bow',name:'试验弓',source,location:'carried',held:true,oneHanded:false,grip:{hands:2,source},loaded:false,weapon:{name:'试验弓',type:'bow',skill:'射击',damage:2,severity:'L',rangeUnit:20,rangeUnits:8,strengthRequirement:2,attackBonus:0,blockBonus:0,ap:0,magic:0,ammunition:{kind:'arrow',cost:1,loadingAction:'swift'}}}];a.state.equippedWeaponId='bow';a.visibleArms='持握试验弓';a.ammunition=5;b.actors.huang.position=[10,0];});
add('调整架势',['御临风调整架势，消除试验陪练针对自己的虚招优势。'],['adjust'],b=>{b.actors.huang.state.combatManeuvers={turn:1,feints:{player:{expiresAfterTurn:2}}};});
add('冲锋',['御临风沿直线向试验陪练冲锋并攻击；不结束回合。'],['charge'],b=>{b.actors.huang.position=[6,0];beginCommonTurn(b,b.actors.player);});
add('反冲',['御临风选择反冲，将试验陪练击退。'],['counterRush'],b=>{b.pending={kind:'counterRush',awaiting:'player',command:{actorId:'player',abilityId:'counterRush',targetId:'huang'}};});
add('拔剑',['御临风从腰间拔出弃风剑，右手握住剑柄；不攻击。'],['drawWeapon'],emptyHands);
add('拾剑',['御临风拾起脚边自己的弃风剑并持握；不攻击。'],['pickupWeapon'],b=>{emptyHands(b);const w=b.actors.player.state.possessions.items[0];w.location='ground';w.position=[0,0];w.ground={visibleTo:['player'],source};});
add('流风腾转',['御临风消耗1点流风启动流风加速，然后使用腾转挪移，支付1点流风；不攻击。'],['flow','tengzhuan']);
add('龙卷',['御临风消耗2点流风启动流风加速，再以狂岚·聚风龙卷攻击试验陪练，支付1点流风。'],['flow','tornado'],b=>b.actors.huang.position=[10,0]);
add('群袭',['御临风施展狂岚·群袭攻击范围内两名试验敌人，支付1点流风，不攻击友方观察员。'],['gale'],b=>{const t=b.actors.huang;t.position=[4,0];const e=structuredClone(t);e.id='enemy2';e.name=e.state.name='试验敌人乙';e.position=[6,1];b.actors.enemy2=e;const ally=structuredClone(t);ally.id='observer';ally.name=ally.state.name='友方观察员';ally.team=b.actors.player.team;ally.position=[5,-2];b.actors.observer=ally;b.order.push('enemy2','observer');});
add('移动快步',['御临风向远离试验陪练的方向移动3米，然后继续沿同方向五尺快步1.5米；不攻击。'],['move','step'],b=>b.actors.huang.position=[10,0]);
add('全力防御',['御临风采取全力防御；不攻击、不移动。'],['fullDefense']);
add('侦查',['御临风主动侦查周围，寻找隐藏的生物。'],['search']);
add('开门破障',['御临风打开身边的试验木门，再用弃风剑攻击旁边的试验木箱。'],['door','destroy'],b=>{b.actors.huang.position=[10,0];b.map.features=[{id:'test-door',name:'试验木门',kind:'door',rect:[.5,0,.2,1],open:false,locked:false},{id:'test-box',name:'试验木箱',kind:'obstacle',rect:[0,.5,1,.2],durability:{current:4,max:4,hardness:0}}];});
for(const [title,text,medicine,extra] of [
 ['雪莲子','御临风服用一份雪莲子，选择恢复流风。','雪莲子',{}],
 ['培元丹','御临风服用一份培元丹。','培元丹',{}],
 ['药A','御临风服用一份药A。','药A',{}],
 ['药B','御临风服用一份药B。','药B',{}],
 ['药C治疗','御临风服用一份药C，选择治疗伤势。','药C',{}],
 ['药C异常','御临风服用一份药C，选择解除疲乏状态。','药C',{status:true}]
])add(title,[text],['medicine'],b=>{const a=b.actors.player;a.state.inventory=[{name:medicine,quantity:2,source}];a.state.resources.流风.current=15;a.state.health.intact-=3;a.state.health.L=3;if(extra.status)a.state.statuses.push({type:'疲乏',points:1,source});});
add('急救',['御临风为试验伤员进行急救，尝试停止其伤势恶化。'],['firstAid'],b=>{const t=b.actors.huang;t.name=t.state.name='试验伤员';t.state.health={...t.state.health,intact:0,L:99,A:1,B:0};});
add('唤醒',['御临风唤醒身边正在睡眠的试验陪练。'],['wake'],b=>b.actors.huang.state.sleeping={source});
add('跳跃',['御临风按已登记的原地起跳计划向前跳远；不攻击。'],['jump'],b=>{b.actors.huang.position=[50,0];b.ruleScene={objects:{takeoff:{type:'checkContext',source,actorIds:['player'],plans:{jump:{purpose:'jump',kind:'long',source,takeoff:[0,0,0],direction:[1,0],supportedTakeoff:true,runUp:{source:'本次隔离原地起跳，无助跑',meters:0}}}}}};});
add('挣脱',['御临风用敏捷挣脱试验陪练的擒抱。'],['escapeGrip'],b=>{emptyHands(b);b.actors.player.state.grapple={holderId:'huang',sinceRound:1,pressed:false};b.actors.huang.state.grappleHolds=['player'];});
add('擒抱内攻击',['御临风在擒抱中以徒手攻击已经压制住的试验陪练。'],['grappleAttack'],b=>{emptyHands(b);b.actors.huang.state.grapple={holderId:'player',sinceRound:1,pressed:true};b.actors.player.state.grappleHolds=['huang'];});
add('压制',['御临风继续压制上回合已抓住的试验陪练。'],['pressGrip'],b=>{emptyHands(b);b.actors.huang.state.grapple={holderId:'player',sinceRound:1,pressed:false};b.actors.player.state.grappleHolds=['huang'];});
add('格挡',['御临风使用弃风剑准备格挡；不攻击。'],['block']);
for(const [label,text,prep] of [
 ['受击闪避','御临风采用基础防御闪避这次攻击，不使用伤害转换。',false],
 ['受击格挡','御临风使用已经就绪的格挡抵御这次攻击，不使用伤害转换。',true],
 ['受击转换','御临风采用基础防御应对这次攻击，并使用伤害转换。',false]
])add(label,[text],['react'],b=>{const t=b.actors.huang;t.abilities=['strike','end'];t.state=beginTurn(t.state).state;b.activeId='huang';if(prep)b.actors.player.buffs.block={value:5};const p=resolveStep(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{deferPlayerDefense:true,drawDice:()=>{throw Error('pending must not roll');}}).battle;Object.assign(b,p);});
add('借机攻击',['御临风对试验陪练进行借机攻击，不花费意志。'],['opportunityReact'],b=>{b.activeId='huang';b.actors.huang.abilities=['move','end'];b.actors.huang.state=beginTurn(b.actors.huang.state).state;Object.assign(b,resolveStep(b,{actorId:'huang',abilityId:'move',to:[4,0]},{drawDice:()=>{throw Error('pending must not roll');}}).battle);});
add('借机放弃',['御临风放弃这次借机攻击。'],['opportunityReact'],b=>{b.activeId='huang';b.actors.huang.abilities=['move','end'];b.actors.huang.state=beginTurn(b.actors.huang.state).state;Object.assign(b,resolveStep(b,{actorId:'huang',abilityId:'move',to:[4,0]},{drawDice:()=>{throw Error('pending must not roll');}}).battle);});
fs.writeFileSync(S+'/cases.json',JSON.stringify(cases,null,2));console.log('Prepared '+cases.length+' scenarios');
