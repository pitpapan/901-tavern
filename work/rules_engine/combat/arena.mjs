import {createCharacter,baseHealthCapacity,beginTurn} from '../core.mjs';
import {createOpeningRoster,OPENING_RULESET} from './opening.mjs';
import {normalizeMap} from './map.mjs';

export const ARENA_SOURCES={radwick:'work/character_builder/arena_opponents_20261022_candidate.md#1',mireya:'work/character_builder/arena_archer_grappler_20261023_candidate.md#12'};
const skills=rows=>Object.fromEntries(Object.entries(rows).map(([name,[level,subs={}]])=>[name,{level,subs:Object.fromEntries(Object.entries(subs).map(([k,level])=>[k,{level}]))}]));
function opponent(id,name,attrs,profile,rows,rest={}) {
  const attributes=Object.fromEntries(['力量','敏捷','智力','感知','意志','风度'].map((key,i)=>[key,attrs[i]]));
  return {id,name,kind:id,ruleset:OPENING_RULESET,combatProfile:{natural:0,speed:0,initiative:0,severity:'B',...profile,provenance:{source:ARENA_SOURCES[id]}},
    team:'擂台对手',controller:'model',present:true,reach:1.5,position:[0,0],used:{},cooldowns:{},buffs:{},combos:{},reactions:{damageConversion:false},sheathed:false,
    state:createCharacter({name,attributes,size:5,derived:{hpMax:baseHealthCapacity(attrs[0],5),speed:attrs[0]+attrs[1]+5,initiative:attrs[1]+attrs[5],willMax:attrs[4]+attrs[5]},skills:skills(rows),resources:id==='radwick'?{斗气:{current:3,max:3}}:{}}),...rest};
}
export function createArenaRoster() {
  const roster=createOpeningRoster();
  const player=roster.player;
  player.combatProfile.severity='B';
  player.combatProfile.provenance.arenaWeapon='隔离实测假设：原弃风的等值缓冲练习器械；仅伤型改B，其余数值相同，不改源卡。';
  player.visibleArms='缓冲练习长剑在手';
  player.abilities.push('concede');
  roster.radwick=opponent('radwick','拉德维克',[7,4,3,5,5,3],{main:'白刃',sub:'短兵盾术',equipment:{weapon:{damage:2,attackBonus:0,blockBonus:0,ap:0,magic:0},armor:{defense:2,shield:1}}},
    {白刃:[5,{短兵盾术:2}],肉搏:[4,{盾推:2}],运动:[3,{自我保护:1}],求生:[4,{耐受:1}],感受:[3,{察觉诱招:1}],调查:[2,{观察:1}]},
    {visibleArms:'配发的包毡竞技短棍与盾',abilities:['strike','block','shieldPush','brace','move','step','concede','end']});
  roster.mireya=opponent('mireya','米蕾娅',[5,7,4,7,5,4],{main:'射击',sub:'弓箭',equipment:{weapon:{damage:3,attackBonus:0,blockBonus:0,ap:0,magic:0,strengthRequirement:5,rangeUnit:20},armor:{defense:1}}},
    {射击:[5,{弓箭:4}],白刃:[3,{短棍:1}],运动:[4,{自我保护:2}],求生:[3,{耐受:1}],调查:[4,{进路观察:2}],感受:[3,{识破诱招:1}]},
    {loaded:false,ammunition:18,weaponMode:'bow',visibleArms:'配发的缓冲竞技弓箭，腰侧包毡短棍',abilities:['strike','reload','calibrate','drawClub','readyBow','block','move','step','concede','end']});
  return roster;
}
// Only the selected opponent enters the encounter. Current saves may be passed
// as start (MVU root, or {actors,battle}); runtime.enter also carries MVU state.
export function createArenaEncounter(id,{instanceId=id,scenario,positions={},map,teams={},start}={}) {
  const opponentId={'arena-radwick':'radwick','arena-mireya':'mireya'}[id];
  if(!opponentId)throw Error('该擂台对手尚未接入');
  const roster=createArenaRoster(),actors={player:roster.player,[opponentId]:roster[opponentId]};
  for(const [key,a]of Object.entries(actors)) {
    const stored=start?.actors?.[key],prior={...stored,...start?.battle?.actors?.[key],...(stored?.combatCarry??{})};
    if(stored?.state)a.state=structuredClone(stored.state);
    for(const field of ['ammunition','loaded','weaponMode','equipment','parameters','used','cooldowns','durationCarry','cooldownCarry'])if(prior[field]!==undefined)a[field]=structuredClone(prior[field]);
    const position=positions[key]??prior.position;
    if(!Array.isArray(position)||position.length!==2||!position.every(Number.isFinite))throw Error(`当前现场缺少${a.name}站位，须主持补参`);
    a.position=structuredClone(position);if(teams[key])a.team=teams[key];a.sceneInstanceId=instanceId;
  }
  const order=Object.keys(actors).sort((x,y)=>actors[y].state.derived.initiative-actors[x].state.derived.initiative),activeId=order[0];
  actors[activeId].state=beginTurn(actors[activeId].state).state;
  const battle={version:1,id,sceneInstanceId:instanceId,scenario:scenario??`隔离擂台实测：御临风初始卡对${actors[opponentId].name}，不计实际赛果`,ruleset:OPENING_RULESET,
    actors,order,activeId,round:1,elapsedRounds:0,status:'active',mode:'combat',winner:null,reactionWindows:true,playerDefenseDeclarations:true,knowledge:{},turnTaken:[],
    arena:{stopIntact:3},assumptions:['仅接入本场两名参战者，不代表八人全部接入。','御临风使用原弃风等值缓冲练习器械：伤型B，其余初始卡数值不改。','隔离实测约定：任一方完好槽≤3或失能即按预告条件终止；双方均可认输，保留伤势与资源，不发XP。']};
  const inheritedMap=map??start?.battle?.map??start?.map;
  if(inheritedMap)battle.map=normalizeMap(inheritedMap,battle);
  return battle;
}
