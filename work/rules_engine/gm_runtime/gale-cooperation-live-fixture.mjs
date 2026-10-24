// Named, isolated acceptance chats only. Never migrates an existing campaign save.
import {readFile,writeFile} from 'node:fs/promises';
import {createIntegrationFixture} from './integrated.mjs';
import {createEncounter,makeLotus} from '../combat/catalog.mjs';
import {normalizeMap} from '../combat/map.mjs';
import {createCombatRuntime} from '../combat/runtime.mjs';
import {beginTurn,freshTurn} from '../core.mjs';

const mode=process.argv[2];
if(!['gale-current','cooperation','roar'].includes(mode))throw Error('Specify gale-current, cooperation or roar');
const gale=mode==='gale-current',roar=mode==='roar';
const chatId=gale?'901 狂岚敌我选择复测 - 2026-10-22':roar?'901 乱红莲咆哮友伤实测 - 2026-10-22':'901 黄泉乱红莲协同实测 - 2026-10-22';
const baseline=JSON.parse(await readFile(new URL('../../character_builder/real_character/yulinfeng_replay_t0.baseline.json',import.meta.url)));
const fixture=createIntegrationFixture(baseline);
const scenario=gale?'独立狂岚敌我选择验收，非正式剧情。黄泉与御临风同阵营，姜子尤为对练方，三人都在开阔演练场。狂岚只逐一攻击合法敌人，不伤友军。NPC自主反应。':roar?'独立咆哮能力用法验收，非正式剧情。本场明确约定乱红莲演示一次咆哮，朝前方御临风的方向发动；黄泉是乱红莲同阵营主人，位于这条直线中间，因此也在无差别范围内。模型从实际合法动作选咆哮及目标，由程序掷骰结算。此为约定能力演示，不冒充自由战术选择。双方受击反应按正常规则分别选择，不改伤害、豁免或人物数值。':'独立协同战斗验收，非正式剧情。黄泉与乱红莲同阵营，对练御临风；黄泉已拔刀，乱红莲已在她身侧现身。两者自行权衡刀术、爪击、咆哮、友伤及走位，与同伴配合接战，不赠送额外行动。';
const battle=createEncounter({id:`${mode}-live`,scenario,
  participants:gale?['yulin','huang','jiang']:['yulin','huang'],
  positions:gale?{yulin:[0,0],huang:[4,0],jiang:[6,0]}:roar?{yulin:[8,0],huang:[4,0]}:{yulin:[0,0],huang:[1.5,0]},
  teams:gale?{yulin:'玩家方',huang:'玩家方',jiang:'对练方'}:{yulin:'玩家方',huang:'协同方'}});
battle.actors.player=battle.actors.yulin;delete battle.actors.yulin;battle.actors.player.id='player';
battle.actors.player.state=structuredClone(fixture.actors.player.state);
battle.actors.huang.sheathed=false;
if(!gale) {
  battle.actors.lotus=makeLotus(battle.actors.huang);battle.actors.lotus.position=roar?[0,0]:[0,1.5];
  battle.actors.huang.state.resources.灵力.current=3;
  battle.assumptions=['隔离初态：黄泉此前已召出乱红莲并拔刀，灵力3/6；本次不把此前召唤冒充真实选招实测。'];
}
for(const a of Object.values(battle.actors))a.state.turn=freshTurn();
battle.order=gale?['player','huang','jiang']:roar?['lotus','player','huang']:['player','huang','lotus'];battle.activeId=roar?'lotus':'player';battle.playerDefenseDeclarations=true;
battle.actors[battle.activeId].state=beginTurn(battle.actors[battle.activeId].state).state;
battle.map=normalizeMap({title:gale?'狂岚敌我选择练习场':roar?'乱红莲咆哮友伤练习场':'黄泉与乱红莲协同练习场',bounds:[-8,-8,24,20],ground:'floor',gridSize:1.5,features:[]},battle);
let data={initialized_lorebooks:{},stat_data:{},schema:{},display_data:{},delta_data:{}};
const runtime=createCombatRuntime({mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},expectedChatId:chatId,getAnchor:()=>({chatId,messageId:0,swipeId:0})});
await runtime.initialize(battle);
const message=`【独立${gale?'狂岚敌我选择':roar?'咆哮能力用法':'协同战斗'}实测】\n\n${scenario}\n\n${gale?'黄泉在御临风前方四米，姜子尤在前方六米。':roar?'乱红莲在西侧，黄泉在其前方四米，御临风在其前方八米；三者沿东西方向成一直线。':'黄泉持狮子王立在御临风前方一步，乱红莲位于侧方一步。'}\n\n${roar?'轮到乱红莲，等待开始约定的能力演示。':'轮到御临风。'}攻击、移动与防御由玩家明确声明。`;
const row={name:'901 叙事战斗测试',is_user:false,is_system:false,send_date:new Date().toISOString(),mes:message,extra:{},swipe_id:0,swipes:[message],swipe_info:[{extra:{}}],variables:[data]};
const path=new URL(`../../../output/replay_tavern/narrative_combat_20261020_candidate/${chatId}.jsonl`,import.meta.url);
await writeFile(path,[JSON.stringify({user_name:'御临风',character_name:'901 叙事战斗测试',chat_metadata:{note_prompt:'',variables:{}}}),JSON.stringify(row)].join('\n')+'\n');
console.log(JSON.stringify({chatId,mode,active:battle.activeId,actors:Object.keys(battle.actors)}));
