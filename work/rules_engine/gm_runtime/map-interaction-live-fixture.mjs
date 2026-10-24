// Standalone acceptance scene. This does not migrate a campaign save or change a resource.
import {readFile,writeFile} from 'node:fs/promises';
import {createIntegrationFixture} from './integrated.mjs';
import {createEncounter} from '../combat/catalog.mjs';
import {normalizeMap} from '../combat/map.mjs';
import {createCombatRuntime} from '../combat/runtime.mjs';
import {beginTurn,freshTurn} from '../core.mjs';

const chatId='901 掩体高台门实测 - 2026-10-22';
const baseline=JSON.parse(await readFile(new URL('../../character_builder/real_character/yulinfeng_replay_t0.baseline.json',import.meta.url)));
const fixture=createIntegrationFixture(baseline);
const battle=createEncounter({id:'map-interaction-live',scenario:'独立地图互动验收，御临风与布莱特对练，不计入正式剧情。御临风在西侧入口，前方依次是练习门、可破坏木栏、只能提供部分掩体的矮墙。东侧三米高台上是布莱特，南侧坡道通往高台。布莱特按自己的弓手战术行动；不为演示赠送动作，不无目的拆墙或后退。战斗从御临风的回合开始。',participants:['yulin','bright'],positions:{yulin:[0,0],bright:[12,0]},teams:{yulin:'玩家方',bright:'对练方'}});
battle.actors.player=battle.actors.yulin;delete battle.actors.yulin;battle.actors.player.id='player';
battle.actors.player.state=structuredClone(fixture.actors.player.state);
for(const a of Object.values(battle.actors))a.state.turn=freshTurn();
battle.actors.player.state=beginTurn(battle.actors.player.state).state;
battle.order=['player','bright'];battle.activeId='player';battle.playerDefenseDeclarations=true;
battle.assumptions=['隔离测试从玩家回合开始，不重算或改写角色先攻属性。','练习木栏耐久4、硬度1仅为验收夹具；不作为通用材质定价或正式资源。'];
battle.map=normalizeMap({title:'掩体·高台·门互动实测',bounded:true,bounds:[-4,-5,22,14],ground:'floor',gridSize:1.5,features:[
  {id:'road',label:'院中通道',kind:'zone',surface:'road',rect:[-1,-.7,15,1.4]},
  {id:'gate',label:'练习门',kind:'door',surface:'wall',rect:[1,-.75,.2,1.5],open:false,locked:false,blocksSight:true},
  {id:'barrier',label:'练习木栏',kind:'obstacle',surface:'wall',rect:[1.4,-.75,.15,1.5],blocksSight:false,durability:{current:4,max:4,hardness:1,source:'本场隔离验收的薄木栏，独立可破坏段'}},
  {id:'cover',label:'矮石墙',kind:'obstacle',surface:'rock',rect:[3,-1,.4,2],blocksSight:true,coverDegree:'partial',height:1},
  {id:'platform',label:'东侧高台',kind:'zone',surface:'rock',rect:[8,-2,6,6],elevation:3},
  {id:'ramp',label:'南侧坡道',kind:'zone',surface:'road',rect:[4,2,4,2],ramp:{from:[4,3,0],to:[8,3,3]}},
]},battle);
let data={initialized_lorebooks:{},stat_data:{},schema:{},display_data:{},delta_data:{}};
const runtime=createCombatRuntime({mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},expectedChatId:chatId,getAnchor:()=>({chatId,messageId:0,swipeId:0})});
await runtime.initialize(battle);
const message='【独立地图互动实测】\n\n御临风站在院落西侧入口，眼前是一扇关着的练习门。门后接着一段薄木栏，再往东有道齐腰矮石墙。东侧高台高出地面三米，南侧有坡道可以登上去；布莱特已在台上就位，目前被门遮住。\n\n轮到御临风。行动与防御仍由玩家声明，地图点击只填写草稿。测试不计入正式剧情。';
const row={name:'901 叙事战斗测试',is_user:false,is_system:false,send_date:new Date().toISOString(),mes:message,extra:{},swipe_id:0,swipes:[message],swipe_info:[{extra:{}}],variables:[data]};
const path=new URL(`../../../output/replay_tavern/narrative_combat_20261020_candidate/${chatId}.jsonl`,import.meta.url);
await writeFile(path,[JSON.stringify({user_name:'御临风',character_name:'901 叙事战斗测试',chat_metadata:{note_prompt:'',variables:{}}}),JSON.stringify(row)].join('\n')+'\n');
console.log(JSON.stringify({chatId,file:path.pathname,active:battle.activeId,features:battle.map.features.length}));
