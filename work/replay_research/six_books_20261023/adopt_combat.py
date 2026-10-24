from adopt_decisions_helpers import ROOT,edit
edit('work/rules_engine/combat/grapple.mjs','export function grappleChoice', '''// D13: actual connected grapple group, with explicit line-of-fire exclusions.
export function grappleMembers(b,targetId,attackerId){
 const ids=new Set([targetId]);let changed=true;
 while(changed){changed=false;for(const a of Object.values(b.actors)){
   const links=[a.state.grapple?.holderId,...(a.claws??[])].filter(Boolean);
   if(ids.has(a.id)||links.some(id=>ids.has(id)))for(const id of [a.id,...links])if(id!==attackerId&&!ids.has(id)){ids.add(id);changed=true;}
 }}
 const excluded=b.ruleScene?.grappleOcclusion?.[attackerId];
 return [...ids].map(id=>b.actors[id]).filter(a=>a?.present&&a.id!==attackerId&&!(excluded?.source&&excluded.excludedIds?.includes(a.id)));
}
export function weightedGrappleTarget(members,drawDice){
 const weights=members.map(a=>Math.max(1,a.state.size??5)),total=weights.reduce((a,b)=>a+b,0);
 const digits=Math.max(1,Math.ceil(Math.log10(total))),range=10**digits,limit=range-range%total;
 const dice=drawDice();let cursor=0,value;
 do{value=0;for(let i=0;i<digits;i++){if(cursor>=dice.length)throw new RuleInputError('命中权重抽签骰不足','grapple.dice');value=value*10+dice[cursor++]-1;}}while(value>=limit);
 let slot=value%total;const ticket=slot;let index=0;while(slot>=weights[index])slot-=weights[index++];
 return {target:members[index],weights,ticket,dice:dice.slice(0,cursor)};
}

export function grappleChoice''')
edit('work/rules_engine/combat/engine.mjs','advanceGeneticLock,geneticCheckBonus }','advanceGeneticLock,geneticCheckBonus,geneticWillAuto,willEnhancement,counteractTemperature }')
edit('work/rules_engine/combat/engine.mjs','releaseGrapple}', 'releaseGrapple,grappleMembers,weightedGrappleTarget}')
edit('work/rules_engine/combat/engine.mjs',"rawDP+=geneticCheckBonus(a.state,{willEligible:a.parameters?.willEligibleActions?.includes(type)===true});", """const single=!c.rapidFire&&!c.adjacentTargetIds?.length&&!['doubleStrike','gale'].includes(type);
  rawDP+=geneticCheckBonus(a.state,{willEligible:single,willSpent:c.willpower===true});
  if(c.willpower){rawDP+=3;fixed+=geneticWillAuto(a.state,{willEligible:true,willSpent:true});}
  if(c.rapidFire)rawDP+=3-(c.adjacentTargetIds?.length??0);
  if(c.rapidSecondary)rawDP-=c.rapidPenalty;""")
edit('work/rules_engine/combat/engine.mjs','energyWeapon:w.energyWeapon===true,hardnessIgnore:', 'energyWeapon:w.energyWeapon===true,grade:w.grade,hardnessIgnore:')
edit('work/rules_engine/combat/engine.mjs','const remainingAP=eat(', "if(a.willDefenseReady)p.will=3+geneticCheckBonus(a.state,{willEligible:true,willSpent:true})-geneticCheckBonus(a.state,{willEligible:true});\n  const remainingAP=eat(")
edit('work/rules_engine/combat/engine.mjs','extraSuccesses:frozen(a)||unconscious(a)?0:', 'extraSuccesses:frozen(a)||unconscious(a)?0:(a.willDefenseReady?geneticWillAuto(a.state,{willEligible:true,willSpent:true}):0)+')
old="const linkedIds=feature?[]:[...new Set([t.state.grapple?.holderId,...(t.claws??[])].filter(id=>id&&id!==a.id))];"
edit('work/rules_engine/combat/engine.mjs',old,"const members=feature?[]:grappleMembers(b,t.id,a.id);\n  const linkedIds=members.filter(m=>m.id!==t.id).map(m=>m.id);")
edit('work/rules_engine/combat/engine.mjs','const members=[t,...linkedIds.map(id=>b.actors[id])];','')
start="    const sizes=new Set(members.map(m=>m.state.size));"
p=ROOT/'work/rules_engine/combat/engine.mjs';s=p.read_text(encoding='utf-8');a=s.index(start);z=s.index('\n  }',a);s=s[:a]+"    const selected=weightedGrappleTarget(members,drawDice);t=selected.target;result.grappleTarget={declared:c.targetId,actual:t.id,defense:grappleDefense.total,candidates:members.map(m=>m.id),weights:selected.weights,ticket:selected.ticket,dice:selected.dice};"+s[z:];p.write_text(s,encoding='utf-8')
edit('work/rules_engine/combat/engine.mjs',"if(!feature&&t.state.wizard?.form&&p.ballistic)throw new RuleInputError('Wizard防弹关键词的旧版定义/破防失效口径尚待采用，普通铠甲8已生效','wizard.ballisticProof');\n  if(!feature&&t.state.wizard?.form&&p.energyWeapon)throw new RuleInputError('防能量武器的确切采用定义须确认','wizard.energyWeaponProof');", """const actualDefense=grappleDefense?resolveDefense(b,t.id,a.id,{...p,defenseMode:defenseDeclarations[t.id]}):d;
  const wizardArmor=!!t.state.wizard?.form&&(actualDefense.parts.armor??0)>0;
  if(!deferPlayerDefense){
    // Every member used in the lowest-defense calculation participates in this attack.
    for(const defender of grappleDefense?members:[t])if(defender.willDefenseReady){defender.state.will.current--;delete defender.willDefenseReady;(result.willCosts??=[]).push({actorId:defender.id,cost:1,kind:'defense'});}
  }""")
edit('work/rules_engine/combat/engine.mjs',"if(t.state.wizard?.form){result.notes.push('防能量武器装甲阻止御雷导电');return;}", "if(wizardArmor){result.notes.push('防能量武器装甲阻止御雷导电');return;}")
edit('work/rules_engine/combat/engine.mjs',"let aggravated=Math.min(amount,p.aggravate);", "let aggravated=Math.min(amount,p.aggravate);\n  if(p.energyWeapon&&!wizardArmor)aggravated=amount;")
edit('work/rules_engine/combat/engine.mjs','defenses:p.ignore};','defenses:p.ignore,wizardBulletproof:wizardArmor&&p.ballistic};')
edit('work/rules_engine/combat/engine.mjs',"piece.convert?[{kind:'downgrade',steps:1}]:[]", "[...(piece.convert?[{kind:'downgrade',steps:1}]:[]),...(bypass.wizardBulletproof&&segment.kind==='physical'?[{kind:'downgrade',steps:1}]:[])]")
edit('work/rules_engine/combat/engine.mjs',"const structuralDamage=Math.min(before,Math.max(0,amount-hardness));", """if(feature.material==='antiMagicRock'&&(p.magical||p.energyWeapon)&&!p.grade)throw new RuleInputError('厌魔石须确认打击等级','attack.grade');
    const mineralImmune=feature.material==='antiMagicRock'&&(p.magical||p.energyWeapon)&&['D','C','B','A'].includes(p.grade)&&!feature.energyException?.source;
    const structuralDamage=mineralImmune?0:Math.min(before,Math.max(0,amount-hardness));""")
# D5 one standard action; adjacent targets derived from the scene, including allies.
edit('work/rules_engine/combat/engine.mjs',"export function act(input,command,{drawDice=randomDice,playerAuthorized=false,deferPlayerDefense=false,defenseDeclarations={},grappleDeclarations={},opportunityDeclarations={}}={})", "export function act(input,command,{drawDice=randomDice,playerAuthorized=false,deferPlayerDefense=false,defenseDeclarations={},grappleDeclarations={},opportunityDeclarations={},willDefenses={}}={})")
edit('work/rules_engine/combat/engine.mjs',"commandKeys.push('limbIds',...(id==='strike'?['adjacentTargetIds']:[])", "commandKeys.push('limbIds','willpower',...(id==='strike'?['adjacentTargetIds','rapidFire']:[])")
edit('work/rules_engine/combat/engine.mjs',"const t=b.actors[c.targetId];", """if(c.rapidFire){
    requireThat(id==='strike'&&wizardWeapon(a.state)&&a.state.wizard.weaponMode==='gun','只有Wizard剑枪采用连射');
    const adjacent=rapidFireTargets(b,c);
    if(adjacent.length<=9)c.adjacentTargetIds=adjacent.map(x=>x.id);
    else requireThat(c.adjacentTargetIds?.length===9&&c.adjacentTargetIds.every(id=>adjacent.some(x=>x.id===id)),'超过10个目标须明确选取9个相邻目标');
  }
  if(c.willpower!==undefined)requireThat(typeof c.willpower==='boolean','willpower须为布尔选择');
  if(c.willpower){
    requireThat(['strike','thunder','cleaveRock','conduct'].includes(id)&&!c.rapidFire&&!c.adjacentTargetIds?.length,'此意志选项仅用于单次攻击判定');
    const w=willEnhancement(a.state);requireThat(w.allowed,w.reason);a.state.will.current--;result.willCosts=[{actorId:a.id,cost:1,kind:'attack'}];
  }
  for(const [actorId,chosen]of Object.entries(willDefenses))if(chosen){const defender=b.actors[actorId];const w=willEnhancement(defender.state);requireThat(w.allowed,w.reason);defender.willDefenseReady=true;}
  const t=b.actors[c.targetId];""")
edit('work/rules_engine/combat/engine.mjs',"requireThat(id==='strike'&&a.state.wizard?.form==='wind','只有风形态普通攻击能附带相邻目标');", "requireThat(id==='strike'&&(a.state.wizard?.form==='wind'||c.rapidFire),'只有风形态或剑枪连射能附带相邻目标');")
edit('work/rules_engine/combat/engine.mjs',"const sub={damage:[],statuses:[],saves:[],notes:[]};strike(b,a,other,{...c,targetId,adjacentTargetIds:undefined},sub", "if(c.rapidFire){a.rapidAdjacentHits??=[];requireThat(!a.rapidAdjacentHits.includes(targetId),'本行动轮该目标已承受一次连射邻接追加');a.rapidAdjacentHits.push(targetId);}const sub={damage:[],statuses:[],saves:[],notes:[]};strike(b,a,other,{...c,targetId,adjacentTargetIds:undefined,rapidFire:false,rapidSecondary:c.rapidFire,rapidPenalty:c.adjacentTargetIds.length},sub")
edit('work/rules_engine/combat/engine.mjs','delete a.defenseIntent;', 'delete a.defenseIntent;delete a.rapidAdjacentHits;')
edit('work/rules_engine/combat/engine.mjs','export function galeTargets(b,c) {', '''export function rapidFireTargets(b,c){
 const a=b.actors[c.actorId],t=b.actors[c.targetId];if(!t)return [];
 return Object.values(b.actors).filter(x=>x.present&&x.id!==t.id&&x.id!==a.id&&!a.rapidAdjacentHits?.includes(x.id)&&spatialDistance(b.map,t.position,x.position)<=1.5&&spatialDistance(b.map,a.position,x.position)<=100&&clearLine(b.map,a.position,x.position)&&canObserve(b,x,a.id));
}
export function galeTargets(b,c) {''')
# Every fire application, including Defend, reaches the same counteraction.
edit('work/rules_engine/combat/engine.mjs',"if(!amount) return;", "counteractTemperature(a.state);\n  if(!amount) return;")
# Reflection has its own recipient and consumes its elected defense too.
edit('work/rules_engine/combat/engine.mjs','const roll=rollCombatPool(p.rawDP-defense.total', "if(a.willDefenseReady&&!deferPlayerDefense){a.state.will.current--;delete a.willDefenseReady;}\n        const roll=rollCombatPool(p.rawDP-defense.total")
# Do not persist one-attack defense choices beyond this command.
edit('work/rules_engine/combat/engine.mjs','const interrupted=settleInterruptedTeleports(b);', 'for(const actor of Object.values(b.actors))delete actor.willDefenseReady;\n  const interrupted=settleInterruptedTeleports(b);')
# Player reaction/UI wiring.
edit('work/rules_engine/combat/transitions.mjs',"'defense','grappleDefense'].includes(k)", "'defense','grappleDefense','willpower'].includes(k)")
edit('work/rules_engine/combat/transitions.mjs','pending.choices[a.id]=c.choice;', "if(c.willpower!==undefined&&typeof c.willpower!=='boolean')throw new IllegalAction('意志增强须明确选择');\n    (pending.willDefenses??={})[a.id]=c.willpower===true;\n    pending.choices[a.id]=c.choice;")
edit('work/rules_engine/combat/transitions.mjs','grappleDeclarations:pending.grappleDefenses,', 'grappleDeclarations:pending.grappleDefenses,willDefenses:pending.willDefenses,')
edit('work/rules_engine/combat/transitions.mjs',"a.abilities.includes('conversion')&&!a.used.damageConversion&&!a.reactions.damageConversion)", "a.controller==='player'&&a.state.will.current>0||a.abilities.includes('conversion')&&!a.used.damageConversion&&!a.reactions.damageConversion)")
edit('work/rules_engine/combat/runtime.mjs','galeTargets }', 'galeTargets,rapidFireTargets }')
edit('work/rules_engine/combat/runtime.mjs','freshTurn,lifeStatus }','freshTurn,lifeStatus,willEnhancement }')
edit('work/rules_engine/combat/runtime.mjs',"import { resolveStep }", "import {grappleMembers} from './grapple.mjs';\nimport { resolveStep }")
edit('work/rules_engine/combat/runtime.mjs','add(id,command);', "add(id,command);\n          if(id==='strike'&&a.state.wizard?.weaponDrawn&&a.state.wizard.weaponMode==='gun')add(id,{...command,rapidFire:true});")
edit('work/rules_engine/combat/runtime.mjs','return [...new Map(candidates.map', "if(willEnhancement(a.state).allowed)for(const c of [...candidates])if(['strike','thunder','cleaveRock','conduct'].includes(c.abilityId)&&!c.rapidFire&&!c.adjacentTargetIds?.length)candidates.push({...c,willpower:true});\n  return [...new Map(candidates.map")
edit('work/rules_engine/combat/runtime.mjs','return {options:defenses.flatMap(', 'const options=defenses.flatMap(')
edit('work/rules_engine/combat/runtime.mjs',"}})))),unavailable:[]};", "}}))));\n    if(willEnhancement(a.state).allowed)for(const option of [...options])options.push({...option,command:{...option.command,willpower:true},preview:{...option.preview,cost:'消耗1意志：本次攻击防御＋3及适用基因锁增益'}});\n    return {options,unavailable:[]};")
edit('work/rules_engine/combat/runtime.mjs',"if(c.abilityId==='strike'&&c.adjacentTargetIds?.length)return [...new Set([c.targetId,...c.adjacentTargetIds])];", "if(c.abilityId==='strike'&&(c.rapidFire||c.adjacentTargetIds?.length)){const ids=c.rapidFire?rapidFireTargets(b,c).map(x=>x.id):c.adjacentTargetIds;return [...new Set([c.targetId,...ids].flatMap(id=>grappleMembers(b,id,a.id).map(x=>x.id)))];}")
edit('work/rules_engine/combat/runtime.mjs',"const linked=target?[target.state.grapple?.holderId,...(target.claws??[])].filter(id=>id&&id!==a.id):[];", "const linked=target?grappleMembers(b,target.id,a.id).map(x=>x.id):[];")
edit('work/rules_engine/combat/host-ui.mjs',"command.grappleDefense==='strength'", "command.willpower?'消耗1意志增强':'',\n        command.rapidFire?'剑枪连射':'',\n        command.grappleDefense==='strength'")
