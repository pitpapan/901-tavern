import {createOpeningRoster,createOpeningEncounter,OPENING_SOURCES} from '../combat/opening.mjs';
import {OPENING_ENCOUNTERS} from './opening-binding.mjs';

export const OPENING_SCENE='重玩帝都T0：御临风、黄泉、布莱特首次抵都。当前地点、在场人物、伤势、资源与地图以本聊天当前存档及实际叙事为准。姜子尤只保留梦境早期定义，不自动加入。世界书后期资源是背景知识，不代表现在持有；未登记的战斗须主持确认当前参战、位置及缺项，不用演练或历史情节替代。';

// Trusted host binding, prepared from the actual scene. No model-supplied stats,
// implicit four-person party, or historical encounter order is accepted here.
export function createOpeningFixture(_sourceBaseline,{bindings=[]}={}) {
  const roster=createOpeningRoster(),player=roster.player;
  const baseline={baselineStatus:'APPROVED_REPLAY_BASELINE',baselineMeaning:'2026-10-22用户授权的新初始卡；与旧完整卡隔离，不迁移既有存档。',
    cardSource:OPENING_SOURCES.yulin,
    definition:{id:'PC_YULINFENG_OPENING_20261022',name:player.name,period:'replay/T0/帝都初至',sources:Object.values(OPENING_SOURCES),
      size:5,attributes:structuredClone(player.state.attributes),skills:structuredClone(player.state.skills),equipment:[],abilities:[],
      overrides:{derived:Object.fromEntries(Object.entries(player.state.derived).filter(([,v])=>Number.isInteger(v)).map(([k,value])=>[k,{mode:'final',value,source:OPENING_SOURCES.yulin}]))}},
    openingState:{isolatedTestInitial:{health:'healthy',willCurrent:3,turn:'ready',xp:0},
      resourceBoundary:{present:['流风22','风迹（白刃赠级已计）'],absent:['剑风池','魔力','正十七','辟邪','完美战士','死灵','观澜']},
      note:'仅无存档新聊天采用建卡初值；已有存档伤势、资源与次数沿用，不回满。'},
    unmappedCardFields:{制造主技能:'原卡母技能空白；炼药2。当前未知，不按0。'}};
  baseline.definition.overrides.derived.defense={mode:'final',value:11,source:OPENING_SOURCES.yulin};
  baseline.definition.skills.白刃.subs.长剑.scope='长剑';baseline.definition.skills.白刃.subs.长剑.scopeId='weapon.long-sword';
  const actors=Object.fromEntries(Object.entries(roster).map(([id,a])=>[id,{name:a.name,state:a.state}]));
  const encounters=Object.fromEntries(OPENING_ENCOUNTERS.map(e=>[e.id,()=>{throw Error('须先从当前现场绑定遭遇');}])),encounterOptions=structuredClone(OPENING_ENCOUNTERS);
  function registerBinding(binding) {
    if(!binding.id||typeof binding.scenario!=='string'||!Array.isArray(binding.participants)||!binding.positions||!binding.map)
      throw Error('正式遭遇须主持绑定当前场景、实际参战者、站位与地图');
    if(binding.participants.some(id=>!Object.hasOwn(roster,id)))throw Error('当前在场者缺少已接入人物定义，须主持补参');
    const old=encounterOptions.findIndex(e=>e.id===binding.id);if(old>=0)encounterOptions.splice(old,1);
    encounters[binding.id]=()=>createOpeningEncounter(structuredClone(binding));
    encounterOptions.push({id:binding.id,description:binding.description??binding.scenario});
  }
  for(const binding of bindings)registerBinding(binding);
  return {baseline,actors,encounters,encounterOptions,playerTemplate:player,registerBinding,naturalEncounterIds:OPENING_ENCOUNTERS.map(e=>e.id)};
}

export function stoneWithdrawalBinding({isolated=false}={}) {
  return {id:'stone-withdrawal',description:'当前确在试炼洞穴入口、已观察到石像圈时，按当前站位接战；离开有效圈即脱离本次战斗。',
    scenario:(isolated?'基于已采用场景的独立当前态实测，不计帝都T0已发生事件。':'')+
      '试炼洞穴入口的一具石像魔偶在已观察到的阵纹圈内守卫，圈心为地图原点，有效半径6米。当前只有御临风进入接战，其他同伴不在本次战斗现场。石像不追出有效圈。离开圈只脱离接战，未完成洞穴任务、未排除石像或查明其他区域，不自动奖励。',
    participants:['player'],enemies:[{type:'stone',id:'stone'}],positions:{player:[4,0],stone:[2,0]},
    objective:{kind:'exitRadius',actorIds:['player'],center:[0,0],radius:6,resolutionKind:'withdrawal',label:'成功脱离接战',description:'已离开石像有效阵地；石像仍在，洞穴任务及其他区域未完成，不自动授予XP。'},
    map:{title:'试炼洞穴入口·已观察阵纹',bounds:[-10,-9,23,18],ground:'rock',gridSize:1.5,
      features:[{id:'circle-center',label:'阵纹圈心（有效半径6米）',kind:'landmark',rect:[-.3,-.3,.6,.6]},
        {id:'outside',label:'洞外退路',kind:'zone',rect:[7,-2,5,4]}]}};
}
