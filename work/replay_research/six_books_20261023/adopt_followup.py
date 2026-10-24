from adopt_decisions_helpers import ROOT,edit
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"return {...next,result:{...result,...(preActionCheck?{preActionCheck}:{}),action:r.action}};", "return {...next,result:{...result,...(result?.action?{actionCost:result.action}:{}),...(preActionCheck?{preActionCheck}:{}),action:r.action}};")
edit('work/rules_engine/gm_runtime/adopted-decisions.test.mjs',"out.result.action,'full'", "out.result.actionCost,'full'")
edit('work/rules_engine/gm_runtime/adopted-decisions.test.mjs',"out.result.action,'free'", "out.result.actionCost,'free'")
edit('work/rules_engine/gm_runtime/adopted-decisions.test.mjs',"const fixture=createOpeningFixture();fixture.player.state.attributes.力量=4;fixture.player.state.xp=30;", "const fixture=createOpeningFixture();")
edit('work/rules_engine/gm_runtime/adopted-decisions.test.mjs',"expectedChatId:'xp-adopted',fixture,drawDice:ones", "expectedChatId:'xp-adopted',baseline:fixture.baseline,drawDice:ones")
edit('work/rules_engine/gm_runtime/adopted-decisions.test.mjs',"await rt.initialize();", "await rt.initialize({openingAssumption:true});")
# Update old assertions only for deliberately adopted behavior.
edit('work/rules_engine/gm_runtime/rule-actions.test.mjs',"const input={actors:actors()};input.actors.player.state.health.intact--;", "const input={actors:actors(),ruleScene:{growthWindow:{id:'test-gap',source:'已确认故事间隙',open:true,actorIds:['player']}}};input.actors.player.state.health.intact--;")
edit('work/rules_engine/gm_runtime/remaining-rules.test.mjs',"object('teleport',{plans:{there:plan({languageAvailable:true,gesturesAvailable:true,distance:1500", "object('teleport',{casting:{source,attribute:'智力',skill:'神秘学'},plans:{there:plan({languageAvailable:true,gesturesAvailable:true,distance:1500")
edit('work/rules_engine/gm_runtime/remaining-rules.test.mjs',"assert.throws(()=>run(fractional,'tele','upper','there'),/非整千米/);", "assert.equal(run(fractional,'tele','upper','there').result.cost,10);")
edit('work/rules_engine/status-rules.test.mjs',"fire counteraction consumes only recorded quantities", "adopted fire counteraction uses effective cold points")
edit('work/rules_engine/status-rules.test.mjs',"statusEvent(r,{actorId:'player',eventId:'counter'},{drawDice:dice});", "r.actors.player.state.statuses.push({type:'冻结',source:'实际寒冷',points:1});statusEvent(r,{actorId:'player',eventId:'counter'},{drawDice:dice});")
edit('work/rules_engine/gm_runtime/narrative.test.mjs',"options.map(o=>o.command.choice),['decline']", "options.filter(o=>!o.command.willpower).map(o=>o.command.choice),['decline']")
edit('work/rules_engine/gm_runtime/narrative.test.mjs',"an explicitly declared guard supplies defense for its existing duration without asking again on every attack", "an existing guard persists while a new attack offers the adopted optional will defense")
edit('work/rules_engine/gm_runtime/narrative.test.mjs',"const hit=resolveStep(guarded", "let hit=resolveStep(guarded")
edit('work/rules_engine/gm_runtime/narrative.test.mjs',"assert.equal(hit.battle.pending,undefined);", "assert.equal(hit.battle.pending.awaiting,'player');hit=resolveStep(hit.battle,{actorId:'player',abilityId:'react',choice:'decline',defense:'block'},{playerAuthorized:true,drawDice:()=>Array(1024).fill(7)});assert.equal(hit.battle.pending,undefined);")
# Ordinary core attack uses the same selected will prices and genetic increments.
edit('work/rules_engine/core.mjs',"export function resolveAttack(attacker, target, input) {", """export function resolveAttack(attacker, target, input) {
  for(const [state,chosen]of [[attacker,input.willpower],[target,input.defenseWillpower]])if(chosen){const w=willEnhancement(state);if(!w.allowed)return {attacker,target,result:{allowed:false,reason:w.reason}};}
  const defenseWill=input.defenseWillpower?3+geneticCheckBonus(target,{willEligible:true,willSpent:true})-geneticCheckBonus(target,{willEligible:true}):0;""")
edit('work/rules_engine/core.mjs',"const defense = input.targetDefense ?? Math.max(0, baseDefense+geneticCheckBonus(target,{willEligible:true}) - lifeStatus(target).woundPenalty);", "const defense = (input.targetDefense ?? Math.max(0, baseDefense+geneticCheckBonus(target,{willEligible:true}) - lifeStatus(target).woundPenalty))+defenseWill;")
edit('work/rules_engine/core.mjs',"const dp = attrValue(attacker, attribute) + skill.level + weapon.damage - defense", "const dp = attrValue(attacker, attribute) + skill.level + weapon.damage +geneticCheckBonus(attacker,{willEligible:true,willSpent:input.willpower===true})+(input.willpower?3:0)- defense")
edit('work/rules_engine/core.mjs','const roll = rollPool(dp, input.dice);', "if(input.willpower)action.state.will.current--;\n  if(input.defenseWillpower){target=clone(target);target.will.current--;}\n  const roll = rollPool(dp, input.dice);")
edit('work/rules_engine/core.mjs','const autoSuccesses = attrAuto(attacker, attribute) + skill.auto + (input.autoBonus ?? 0);', 'const autoSuccesses = attrAuto(attacker, attribute) + skill.auto + (input.autoBonus ?? 0)+geneticWillAuto(attacker,{willEligible:true,willSpent:input.willpower===true});')
edit('work/rules_engine/core.mjs','(input.defenderExtraSuccesses ?? 0));', '(input.defenderExtraSuccesses ?? 0)-(input.defenseWillpower?geneticWillAuto(target,{willEligible:true,willSpent:true}):0));')
# Current scene facts propagate into the active battle, including wake/occlusion.
# (The MVU adapter already projects the full ruleScene into each combat transition.)
edit('work/rules_engine/core.mjs',"if(options.willpower&&baseDP<=0)", "if(options.willpower&&baseDP-(geneticCheckBonus(state,context)-geneticCheckBonus(state,{...context,willSpent:false}))<=0)")
