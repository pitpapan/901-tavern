// Supplemental sourced actors/conditions, never added to the formal player.
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const S=process.argv[2],E=S+'/app/public/901-opening-combat/work/rules_engine';
const imp=p=>import(pathToFileURL(E+'/'+p));
const {createOpeningEncounter}=await imp('combat/opening.mjs');
const {createArenaEncounter}=await imp('combat/arena.mjs');
const {beginTurn}=await imp('core.mjs');
const {act,stateResult}=await imp('combat/engine.mjs');
const {attachClaw}=await imp('combat/grapple.mjs');
const {inspectCommands}=await imp('combat/runtime.mjs');
const cases=JSON.parse(fs.readFileSync(S+'/cases.json'));
const seed=fs.readFileSync(S+'/01-seed.jsonl','utf8').trim().split('\n').map(JSON.parse);
const source='2026-11-07集中隔离测试；初态据现有integration-coverage/integration-audit/jumping/arena测试；无正式剧情效力';
function add(id,title,b,texts,expected,actor='player'){
 if(cases.some(c=>c.id===id))throw Error('duplicate '+id);
 const name=`901 集中 ${id} ${title} 20261107`;
 const baseline=stateResult(b,b.activeId,'enter',['本场非Canon初始快照，不是刚发生的伤势']);
 const root={schemaVersion:1,revision:0,chatId:name,operations:{fixtureBaseline:{signature:JSON.stringify({actorId:b.activeId,abilityId:'enter'}),summary:{revision:0,result:baseline}}},
  actors:Object.fromEntries(Object.entries(b.actors).map(([id,a])=>[id,{name:a.name,state:structuredClone(a.state)}])),battle:b,ruleScene:b.ruleScene??{},testProvenance:{source,title}};
 const a=structuredClone(seed);a[1].mes=`非Canon隔离补测：${title}。${b.scenario} 现有伤势、物品和位置仅属于本测试；等待明确声明。`;
 a[1].variables[0].stat_data['901_rules_poc']=root;
 const bytes=a.map(x=>JSON.stringify(x)).join('\n')+'\n';
 fs.writeFileSync(S+'/app/data/default-user/chats/901 动作集中验收 20261107/'+name+'.jsonl',bytes);
 fs.writeFileSync(S+'/'+id+'-seed.jsonl',bytes);
 const copy=structuredClone(b);copy.activeId=actor;copy.actors[actor].state=beginTurn(copy.actors[actor].state).state;
 cases.push({id,title,name,texts,expected,expectedActor:actor,first:a[1].mes,legal:inspectCommands(copy).options.map(o=>o.command)});
}
function opening(id,enemy=false){
 const b=createOpeningEncounter({id:'sweep-extra',participants:enemy?['player']:['player',id],enemies:enemy?[{id,type:id}]:[],
  positions:{player:[0,0],[id]:[1,0]},teams:{player:'玩家',[id]:'测试方'},map:{bounds:[-10,-10,80,80],features:[]}});
 b.activeId='player';b.order=['player',id];b.actors.player.state=beginTurn(b.actors.player.state).state;
 return b;
}
const end=['御临风结束本回合。'];
function npc(id,title,actor,abilities,modify=()=>{},enemy=false){
 const b=opening(actor,enemy),a=b.actors[actor];
 for(const ability of abilities)if(!a.abilities.includes(ability))throw Error(actor+' lacks '+ability);
 a.abilities=[...abilities,'end'];modify(b,a);
 b.scenario=`非Canon定向动作测试，${a.name}按已有资格仅按顺序执行${abilities.join('、')}各一次，然后end；不选择其他通用动作，不移动，不攻击无关目标。御临风不额外行动。`;
 a.tactics={intent:b.scenario,recent:[]};add(id,title,b,end,abilities,actor);
}
// Repair only the missing baseline in the artificial pre-existing fatigue seed.
{const a=fs.readFileSync(S+'/28-seed.jsonl','utf8').trim().split('\n').map(JSON.parse);const b=a[1].variables[0].stat_data['901_rules_poc'].battle;b.scenario='本来已有疲乏1点，药C解除状态效果须按现有规则等待休整；不新增伤势。';add('42','药C既有状态基线',b,['御临风服用一份药C，选择解除疲乏状态。'],['medicine']);}
// This is a declared synthetic mid-jump save from the existing regression fixture.
{let b=opening('huang');b.actors.huang.position=[50,0];b.actors.huang.abilities=['end'];const a=b.actors.player;
 a.state.attributes.力量=3;a.state.attributes.敏捷=3;a.state.skills.运动={level:1,subs:{跳跃:{level:1}}};a.combatProfile.speed=0;
 b.ruleScene={objects:{ledge:{type:'checkContext',source,actorIds:['player'],plans:{jump:{purpose:'jump',kind:'long',source,takeoff:[0,0,0],direction:[1,0],supportedTakeoff:true,runUp:{source,meters:3}}}}}};
 b=act(b,{actorId:'player',abilityId:'jump',objectId:'ledge',part:'jump'},{playerAuthorized:true,drawDice:()=>Array(256).fill(8)}).battle;
 if(b.actors.player.state.paidMotion.phase!=='airborne')throw Error('not airborne');b.scenario='非Canon中途快照：此前跳跃检定12.8米已记录，移动额度已支付且仍在空中；只测试续跳，不把夹具初次投骰算作真实模型验收。';
 add('43','已支付续跳',b,['御临风继续完成刚才的跳跃，不攻击。'],['continueJump']);}
{const b=createArenaEncounter('arena-radwick',{positions:{player:[0,0],radwick:[1,0]},map:{bounds:[-10,-10,80,80],features:[]}});b.activeId='player';b.actors.player.state=beginTurn(b.actors.player.state).state;b.actors.player.state.resources.流风.current=17;b.actors.player.state.health.intact=10;b.actors.player.state.health.B=2;add('44','擂台认输',b,['御临风主动认输，结束这场擂台试验。'],['concede']);}
npc('45','黄泉拔刀','huang',['draw']);
npc('46','黄泉收刀','huang',['sheathe'],(b,a)=>a.sheathed=false);
npc('47','黄泉雷鸣','huang',['thunder'],(b,a)=>a.sheathed=false);
npc('48','黄泉斩岩','huang',['cleaveRock'],(b,a)=>a.sheathed=false);
npc('49','布莱特换武器','bright',['stowWeapon','readyWeapon']);
npc('50','催眠魔兽催眠','hypnotist',['hypnotize'],b=>{b.sceneFacts={hypnosis:{hypnotist:{player:{understands:true,hears:true,recognizesDakas:true,instruction:'保护达卡斯'}}}};},true);
npc('51','Chuul双螯','chuul',['doubleStrike'],()=>{},true);
npc('52','Chuul触须','chuul',['tentacles'],b=>{attachClaw(b,b.actors.chuul,b.actors.player,{drawDice:()=>Array(256).fill(8),defense:'strength',claw:0});},true);
npc('53','Chuul释放','chuul',['releaseGrip'],b=>{attachClaw(b,b.actors.chuul,b.actors.player,{drawDice:()=>Array(256).fill(8),defense:'strength',claw:0});attachClaw(b,b.actors.chuul,b.actors.player,{drawDice:()=>Array(256).fill(8),defense:'strength',claw:1});},true);
npc('54','古雷姆林双刀','gremlin',['doubleStrike'],()=>{},true);
const soil=(b,a)=>b.map.features.push({id:'soil',kind:'zone',rect:[-5,-5,20,20],surface:'earth',earthPassage:true,earthExit:true});
npc('55','古雷姆林入土','gremlin',['burrow'],soil,true);
npc('56','古雷姆林出土','gremlin',['emerge'],(b,a)=>{soil(b,a);a.underground={expiresRound:b.round+3};},true);
npc('57','古雷姆林变形','gremlin',['morph'],()=>{},true);
for(const [id,title,actor,ability,modify]of [
 ['58','擂台盾推','radwick','shieldPush',()=>{}],['59','擂台稳身','radwick','brace',()=>{}],
 ['60','擂台校准','mireya','calibrate',b=>b.actors.mireya.position=[10,0]],
 ['61','擂台拔短棍','mireya','drawClub',()=>{}],['62','擂台持弓','mireya','readyBow',b=>b.actors.mireya.weaponMode='club']]){
 const b=createArenaEncounter('arena-'+actor,{positions:{player:[0,0],[actor]:[1,0]},map:{bounds:[-10,-10,80,80],features:[]}});
 b.activeId='player';b.order=['player',actor];b.actors.player.state=beginTurn(b.actors.player.state).state;modify(b);
 b.actors[actor].abilities=[ability,'end'];b.scenario=`非Canon既有擂台人物动作测试；${b.actors[actor].name}只用${ability}一次，然后end，不选择其他动作。`;
 add(id,title,b,end,[ability],actor);
}
fs.writeFileSync(S+'/cases.json',JSON.stringify(cases,null,2));console.log('Saved sourced supplemental cases '+cases.length);
