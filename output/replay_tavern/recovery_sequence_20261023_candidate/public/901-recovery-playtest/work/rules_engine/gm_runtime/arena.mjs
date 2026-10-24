import {createArenaRoster,createArenaEncounter} from '../combat/arena.mjs';
import {createOpeningFixture} from './opening.mjs';

export const ARENA_SCENE='2026-10-23独立擂台接口实测；不是正式报名、晋级或重玩事件。每个新聊天使用独立的御临风T0初始卡，不含正十七、观澜或完美战士。只御临风与本场实际对手在场。使用实际配发的缓冲竞技器械，仍照常保留伤势与资源。本场预告终止条件：任一方完好生命槽降至3个或以下、失能或明确认输即停止攻击；终止只是按预告条件练习结束，不添加在场裁判、玩家认输台词或真实赛果。结束不治疗、不发XP、奖励或晋级资格。没有明确接战前不启动战斗。';
export const ARENA_OPPONENTS={
  radwick:{id:'arena-radwick',name:'拉德维克',distance:1,
    personality:'拉德维克十九岁，随家中小商队往返帝都及周边城镇，跟老护卫学盾。健谈，熟悉后喜欢替人拿主意，危险时反而安静；希望靠护送长约攒钱买第一辆货车。本场只表现盾守、占位与真实资源允许的动作，不凭台词封死通路。'},
  mireya:{id:'arena-mireya',name:'米蕾娅',distance:12,
    personality:'米蕾娅十七岁，出身洛汀内河商运家庭，随护卫学弓，赴都也陪家人拜访商友。交际大方、照顾别人面子，计划乱时容易催促，拉弓时却耐得住安静。想认识弓术伙伴和能指出坏习惯的老师，不隐瞒伤势。本场只表现实际弓箭、短棍与已适配的观察进路战术，不凭射击自动后撤。'},
};

export function arenaScene(opponentId) {
  const opponent=ARENA_OPPONENTS[opponentId];if(!opponent)throw Error('本包只接入拉德维克和米蕾娅');
  return `${ARENA_SCENE}\n当前是御临风对${opponent.name}的独立完整场次，开阔平整练习场，双方相距${opponent.distance}米，御临风在西、对手在东；只有这两名参战者，不添加同伴或观众。当前未接战、未执行动作。御临风持与初始长剑参数等值的缓冲竞技练习剑；对手持本卡已定义竞技器械。${opponent.personality}`;
}

export function createArenaFixture(_sourceBaseline,{opponentId='radwick'}={}) {
  const opponent=ARENA_OPPONENTS[opponentId];if(!opponent)throw Error('未接入的擂台对手');
  const roster=createArenaRoster(),player=roster.player;
  const baseline=createOpeningFixture().baseline;
  baseline.baselineMeaning='用户授权御临风T0初始卡的独立擂台接口实测；每个新聊天独立，不覆盖正式重玩存档，不代表赛事已发生。';
  baseline.definition.period='isolated/arena-playtest/20261023';
  const scenario=arenaScene(opponentId);
  const actors=Object.fromEntries(['player',opponentId].map(id=>[id,{name:roster[id].name,state:structuredClone(roster[id].state)}]));
  const map={title:`独立练习场·御临风对${opponent.name}`,bounds:[-10,-10,40,20],ground:'stone',gridSize:1.5,features:[]};
  const encounters={[opponent.id]:()=>createArenaEncounter(opponent.id,{instanceId:`arena-playtest-${opponentId}`,scenario,
    positions:{player:[0,0],[opponentId]:[opponent.distance,0]},map:structuredClone(map)})};
  return {baseline,actors,playerTemplate:player,encounters,encounterOptions:[{id:opponent.id,
    description:`仅当前独立练习场：御临风与${opponent.name}，实际相距${opponent.distance}米；玩家明确开始本场对练才进入，不能把开场背景当成已攻击。`}]};
}
