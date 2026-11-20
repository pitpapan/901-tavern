import {statusConcentrationPenalty} from './resource-penalties.mjs';
// Ongoing declarative spells share concentration and turn maintenance rules.
import {check,lifeStatus,statusLevel} from './core.mjs';
import {saveProfile,RuleInputError} from './combat/mechanics.mjs';
export function settleResourceConcentration(before,root,drawDice,actorTemplates={}){
 const results=[];
 for(const [id,record]of Object.entries(root.actors??{})){
  const s=record.state,channels=Object.keys(s.resourceChannels??{}),damage=s.resourceConcentration??[];
  delete s.resourceConcentration;
  if(!channels.length)continue;
  const dc=statusConcentrationPenalty(s),prior=statusConcentrationPenalty(before.actors?.[id]?.state??{});
  const life=lifeStatus(s).state,diehard=record.diehard??record.combatCarry?.diehard??actorTemplates[id]?.diehard;
  if(s.health.coma&&life!=='awake'||life==='dead'||life==='unconscious'&&(!diehard||lifeStatus(s).reason==='resource-condition')||s.sleeping||statusLevel(s,'欲眠').severe){s.resourceChannels={};results.push({actorId:id,ended:channels,reason:'unconscious'});continue;}
  const actor={...actorTemplates[id],...record,...record.combatCarry,state:s};
  for(const difficulty of [...damage,...(dc>prior?[dc]:[])]){
   if(typeof drawDice!=='function')throw new RuleInputError('持续专注受到伤害或新增状态，须可信骰源','resource.concentration');
   const rolls=['will','fort'].map(type=>check(s,{poolBase:saveProfile(actor,type).dp,attributeAutoOverride:0,dice:drawDice(),context:{willResistance:type==='will',physical:type==='fort'}}));
   const total=rolls.reduce((n,r)=>n+r.rolledSuccesses,0),success=total>=difficulty;
   results.push({actorId:id,dc:difficulty,total,success,rolls});
   if(!success){s.resourceChannels={};break;}
  }
 }
 return results;
}
export function endResourceChannelTurn(state,round){
 for(const [id,channel]of Object.entries(state.resourceChannels??{}))if(channel.lastRound!==round)delete state.resourceChannels[id];
}
