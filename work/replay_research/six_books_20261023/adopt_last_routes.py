from adopt_decisions_helpers import ROOT,edit
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"mechanism:['actorId','objectId','operation','part']", "mechanism:['actorId','objectId','operation','part','willpower']")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"const cast=(a,o,dice,dc)=>", "const cast=(a,o,dice,dc,extra={})=>")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"context:{casting:true,specialAbility:true},dice:dice()", "...extra,context:{casting:true,specialAbility:true,...extra.context},dice:dice()")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"const o=root.ruleScene.objects[r.objectId],a=root.actors[r.actorId];let result,action;", """const o=root.ruleScene.objects[r.objectId],a=root.actors[r.actorId];let result,action;
 const selectedWill=r.willpower===true;
 if(selectedWill&&!(o.type==='teleport'&&r.operation==='lower'||o.type==='ancientBelt'&&r.operation==='defend'))fail('本机制的意志选项只适用于单次施法检定');
 const castAction=(actor,item,dice,dc)=>{
   const roll=cast(actor,item,dice,dc,{willpower:selectedWill});
   if(roll.eligible)actor.state.will.current-=roll.willCost??0;return roll;
 };""")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"drawDice,mana,cast,paid});", "drawDice,mana,cast:castAction,paid});")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"const roll=dc===undefined?null:cast(a,o,drawDice,dc);", "if(selectedWill&&dc===undefined)fail('本次下位传送无需判定，不消耗意志');\n     const roll=dc===undefined?null:castAction(a,o,drawDice,dc);")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"const roll=cast(a,o,drawDice);", "const roll=cast(a,o,drawDice,undefined,{context:{extended:true}});")
# Save reactions use +3DP when the incoming effect uses a save rather than defense.
edit('work/rules_engine/combat/engine.mjs',"const dp=base+(type==='reflex'?cover:0)+wizardCheck", "const elected=a.willDefenseReady===true;\n  const dp=base+(elected?3:0)+geneticCheckBonus(a.state,{willEligible:true,willSpent:elected})+(type==='reflex'?cover:0)+wizardCheck")
edit('work/rules_engine/combat/engine.mjs',"const r=rollPool(dp,drawDice());\n  return { ...r, fixed, extra:r.rolledSuccesses>0?extra:0,total:r.rolledSuccesses+fixed+(r.rolledSuccesses>0?extra:0), type };", """const bonus=geneticWillAuto(a.state,{willEligible:true,willSpent:elected});
  const r=rollPool(dp,drawDice());if(elected){a.state.will.current--;delete a.willDefenseReady;}
  return { ...r, fixed:fixed+bonus,willCost:elected?1:0,extra:r.rolledSuccesses>0?extra:0,total:r.rolledSuccesses+fixed+bonus+(r.rolledSuccesses>0?extra:0), type };""")
edit('work/rules_engine/combat/engine.mjs',"if(c.willpower){\n    requireThat(['strike','thunder','cleaveRock','conduct'].includes(id)", "if(c.willpower&&id!=='mechanism'){\n    requireThat(['strike','thunder','cleaveRock','conduct','escapeGrip','pressGrip','hypnotize','shieldPush'].includes(id)")
edit('work/rules_engine/combat/engine.mjs',"a.state.will.current--;result.willCosts=", "a.state.will.current--;a.willCheckReady=true;result.willCosts=")
edit('work/rules_engine/combat/engine.mjs',"context:{mentalPower:true}}", "modifier:c.willpower?3:0,context:{mentalPower:true,willSpent:c.willpower===true}}")
edit('work/rules_engine/combat/engine.mjs',"dp=value(a,'力量')+sk.level+(c.empowered?3:0)-penalty(a),fixed=auto(a,'力量')+sk.auto;", "dp=value(a,'力量')+sk.level+(c.empowered?3:0)+(c.willpower?3:0)+geneticCheckBonus(a.state,{willEligible:true,willSpent:c.willpower===true})-penalty(a),fixed=auto(a,'力量')+sk.auto+geneticWillAuto(a.state,{willEligible:true,willSpent:c.willpower===true});")
edit('work/rules_engine/combat/grapple.mjs',"modifier:actorCheckRules(a,{attribute,skill,sub}).modifier-sizePenalty,dice:drawDice(),context:{physical:true,motion:true}", "modifier:actorCheckRules(a,{attribute,skill,sub}).modifier-sizePenalty+(a.willCheckReady||a.willDefenseReady?3:0),dice:drawDice(),context:{physical:true,motion:true,willSpent:a.willCheckReady===true||a.willDefenseReady===true}")
edit('work/rules_engine/combat/grapple.mjs',"return {active:a,passive:p,success:", "if(passive.willDefenseReady){passive.state.will.current--;delete passive.willDefenseReady;}\n  return {active:a,passive:p,success:")
edit('work/rules_engine/combat/engine.mjs','for(const actor of Object.values(b.actors))delete actor.willDefenseReady;', 'for(const actor of Object.values(b.actors)){delete actor.willDefenseReady;delete actor.willCheckReady;}')
edit('work/rules_engine/combat/runtime.mjs',"['strike','thunder','cleaveRock','conduct'].includes(c.abilityId)", "(['strike','thunder','cleaveRock','conduct','escapeGrip','pressGrip','hypnotize','shieldPush'].includes(c.abilityId)||c.abilityId==='mechanism'&&c.operation==='defend')")
edit('work/rules_engine/combat/runtime.mjs',"消耗1意志：本次攻击防御＋3及适用基因锁增益", "消耗1意志：本次防御＋3；若效果要求豁免/对抗则该次＋3DP，另加适用基因锁增益")
edit('work/rules_engine/combat/map.mjs',"...(d?{durability:", "...(f.material==='antiMagicRock'&&d?.source?{material:f.material,...(f.energyException?.source?{energyException:structuredClone(f.energyException)}:{})}:{}),\n      ...(d?{durability:")
edit('work/rules_engine/combat/map.mjs',"map(({durability,destroyed,...f})=>f)", "map(({durability,destroyed,material,energyException,...f})=>f)")
edit('work/rules_engine/gm_runtime/rule-reference.mjs',"在对应人物选择器加willpower:true；", "在对应人物选择器加willpower:true；下位传送确需携物检定或Wizard Defend单次施法时mechanism也可带willpower:true；")
# A saved action's gain remains readable in its result rather than becoming an invented narrative award.
