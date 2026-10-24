// Current opening resources. These are conditional adjustments, not new skills.
export function actorCheckRules(actor,request) {
  const s=actor.state,mods=[],context={};
  const buffs={...actor.buffs};
  for(const [key,e]of Object.entries(actor.durationCarry??{}))if(e.remainingRounds>0)buffs[key]=e.value;
  const add=(source,value)=>{if(value)mods.push({source,value});};
  if(actor.ruleset==='opening-20261022'&&actor.kind==='yulin') {
    if(request.attribute==='敏捷')add('腾转挪移身法',buffs.tengzhuan?4:2);
    if(['白刃','运动','隐藏','潜行','射击'].includes(request.skill))add('流风加速',2*(buffs.flow??0));
    if(request.purpose==='orientation') {
      if(request.skill!=='求生')throw Error('方向感仅用于判断方向的求生检定');
      add('方向感：已采用重玩分支覆写（yulinfeng_replay_t0.records.json）',6);
    }
  } else if(request.purpose==='orientation')throw Error('当前人物没有已登记的方向感加值');
  if(actor.kind==='bright'&&actor.ruleset==='opening-20261022') {
    if(['侦查','调查','洞察','聆听'].includes(request.skill))add('警觉1（初始卡）',1);
    if(request.purpose==='wind_sense') {
      if(!['侦查','洞察'].includes(request.skill))throw Error('风感对抗潜行须用适用感知技能');
      add('以风为眼：对抗潜行',1);
    }
  }
  if(request.purpose==='listen')context.listening=true;
  if(request.purpose==='visual')context.visual=true;
  return {modifiers:mods,modifier:mods.reduce((n,m)=>n+m.value,0),context};
}
export const OPENING_QUALIFICATIONS='御临风广博知识2提供已有知识的回忆资格，仍按智力＋相应技能，不另加2DP；超级头脑仅在已有知识或资料充足时加速分析，不读心、不补情报、不固定加骰。继承语言仅涵盖御临风、黄泉、姜子尤已继承语言的口语理解，不自动识字，御临风通用语2另据原卡。黄泉灵体感知可看自然黑暗中的灵光，烟雾、实体及超自然黑暗仍遮挡；灵体攻击资格不等同破魔数值。布莱特风感仅在40米内空气连续流通时定位，不能读字、辨色或透墙。';
