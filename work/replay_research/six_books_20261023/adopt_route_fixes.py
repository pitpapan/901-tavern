from adopt_decisions_helpers import ROOT,edit
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"if(o.type==='geneticLock'){\n   const p=plan(o,r);", "if(o.type==='geneticLock'){\n   const p=r.operation==='end'&&!r.part?{source:o.source}:plan(o,r);")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"const p=plan(o,r),target=root.actors[p.wearerId];if(!target||p.ringWorn!==true)need('须有实际佩戴该戒指的目标','wearerId');", "const p=r.operation==='exit'?{source:o.source,wearerId:a.state.underworld?.wearerId}:plan(o,r),target=root.actors[p.wearerId];if(!target||r.operation!=='exit'&&p.ringWorn!==true)need('须有实际佩戴该戒指的目标','wearerId');")
edit('work/rules_engine/core.mjs','if(flatFooted||state.flatFooted||state.sleeping||', 'if(flatFooted||state.flatFooted||state.sleeping||state.underworld||')
edit('work/rules_engine/combat/engine.mjs',"const single=!c.rapidFire&&!c.adjacentTargetIds", "const single=!c.rapidFire&&!c.rapidSecondary&&!c.adjacentTargetIds")
edit('work/rules_engine/combat/engine.mjs',"const defenseMode=attack.defenseMode??source.defenseIntent?.mode;", "const defenseMode=source.state.underworld?'normal':attack.defenseMode??source.defenseIntent?.mode;")
edit('work/rules_engine/combat/engine.mjs',"if(a.state.sleeping){p.dodge=0;p.block=0;}", "if(a.state.sleeping||a.state.underworld){p.dodge=0;p.block=0;}")
edit('work/rules_engine/combat/engine.mjs',"life:unconscious(a)?'失去行动能力':s.sleeping?'睡眠':'可行动'", "life:unconscious(a)?'失去行动能力':s.sleeping?'睡眠':s.underworld?'意识离体':'可行动'")
edit('work/rules_engine/combat/engine.mjs',"requireThat(t?.present&&(feature||!unconscious(t))", "requireThat(!a.state.underworld,'意识离体期间不能用肉身攻击');\n  requireThat(t?.present&&(feature||c.rapidFire||c.rapidSecondary||!unconscious(t))")
edit('work/rules_engine/combat/engine.mjs',"&&!foe.state.sleeping&&!frozen(foe)", "&&!foe.state.sleeping&&!foe.state.underworld&&!frozen(foe)")
edit('work/rules_engine/combat/runtime.mjs',"if(o.type==='demonBox')for", "if(o.type==='geneticLock'&&a.state.geneticLock?.active?.[1])add('mechanism',{objectId,operation:'end'});\n    if(o.type==='phantomRings'&&a.state.underworld?.objectId===objectId)add('mechanism',{objectId,operation:'exit'});\n    if(o.type==='demonBox')for")
# Mineral immunity applies to energy segments too when the actual target is the material.
edit('work/rules_engine/combat/engine.mjs',"if (!segment.amount) continue;", """if (!segment.amount) continue;
    if(a.material==='antiMagicRock'&&(segment.kind==='energy'||segment.magical)){
      if(!['D','C','B','A','S'].includes(segment.grade))throw new RuleInputError('厌魔石打击须有实际等级','damage.grade');
      if(segment.grade!=='S'&&!segment.exceptionSource)continue;
    }""")
# Single-check core support keeps its public contract immutable.
edit('work/rules_engine/core.mjs',"// PHB 基因锁23–36. Eligibility for spending will is source-specific until its\n// general rule is adopted; the genetic increment itself is fully specified.", "// PHB 基因锁23–36 plus adopted D9 single-check will enhancement.")
