// Isolated live-test setup, never a migration of the ongoing duel.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createIntegrationFixture} from './integrated.mjs';
import {referenceMapState} from './map-reference-demo.mjs';
import {normalizeMap} from '../combat/map.mjs';
import {createCombatRuntime} from '../combat/runtime.mjs';
import {beginTurn} from '../core.mjs';

const chatId='901 山道地形实测 - 2026-10-21';
const baseline=JSON.parse(await readFile(new URL('../../character_builder/real_character/yulinfeng_replay_t0.baseline.json',import.meta.url)));
const fixture=createIntegrationFixture(baseline),battle=fixture.encounters['yulin-jiang']();
battle.actors.player.state=beginTurn(structuredClone(fixture.actors.player.state)).state;
battle.playerDefenseDeclarations=true;
battle.actors.player.position=[27,48];battle.actors.jiang.position=[27,36];
battle.scenario='隔离山道地形实测，不计正式剧情。御临风与姜子尤对练，双方初始可见，御临风先行动。两侧山壁不可穿行并遮挡视线，中间是弯曲道路；路中有一块低矮的拦路山石，能看见石后的人，但直接穿行或攻击会被山石阻挡。南侧密林可穿行但属于困难地形，密集枝叶遮挡视线。双方可借地形绕行、遮蔽或接战；目标失去视线不等于知道他藏在哪里。只描述实际可见行动。';
battle.assumptions=['本文件是独立测试初态；不覆盖已有存档或正式地图。','林地困难与遮挡仅为本次测试场景明确设定。'];
const map=referenceMapState().map;
map.title='山道地形实测';map.features.push({id:'road-rock',label:'拦路山石',kind:'obstacle',surface:'rock',rect:[25.5,41,3,2],blocksSight:false});
for(const f of map.features)if(['southwood','eastwood'].includes(f.id)){f.kind='difficult';f.blocksSight=true;}
battle.map=normalizeMap(map,battle);
let data={initialized_lorebooks:{},stat_data:{},schema:{},display_data:{},delta_data:{}};
const runtime=createCombatRuntime({mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},expectedChatId:chatId,getAnchor:()=>({chatId,messageId:0,swipeId:0})});
await runtime.initialize(battle);
const message='【独立山道地形实测】\n\n山壁夹着一条曲折的道路，南面的密林枝叶交叠。路中横着一块低矮山石，姜子尤站在石后的路面上，与你相距十二米，彼此仍能看见。\n\n本次只测试寻路、遮挡和战术，不计入正式剧情。现在轮到御临风，行动及防御仍须明确声明。';
const row={name:'901 叙事战斗测试',is_user:false,is_system:false,send_date:new Date().toISOString(),mes:message,extra:{},swipe_id:0,swipes:[message],swipe_info:[{extra:{}}],variables:[data]};
const out=new URL('../../../output/replay_tavern/narrative_combat_20261020_candidate/',import.meta.url);
await mkdir(out,{recursive:true});
await writeFile(new URL(`${chatId}.jsonl`,out),[JSON.stringify({user_name:'御临风',character_name:'901 叙事战斗测试',chat_metadata:{note_prompt:'',variables:{}}}),JSON.stringify(row)].join('\n')+'\n');
console.log(JSON.stringify({chatId,active:battle.activeId,positions:Object.fromEntries(Object.entries(battle.actors).map(([id,a])=>[id,a.position])),features:battle.map.features.length}));
