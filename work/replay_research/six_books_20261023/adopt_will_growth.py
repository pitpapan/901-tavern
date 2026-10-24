from adopt_decisions_helpers import ROOT,edit

edit('work/rules_engine/core.mjs','export function check(state, options) {', '''export function willEnhancement(state,{extended=false,multiCheck=false,flatFooted=false,willEligible=true}={}){
 if(extended||multiCheck||!willEligible)return {allowed:false,reason:'意志增强仅限非延长的单次判定行动'};
 if(flatFooted||state.flatFooted||state.sleeping||!actionEligibility(state,'free').allowed)return {allowed:false,reason:'措手不及或不能主动反应时不能花意志'};
 if(state.will.current<1)return {allowed:false,reason:'意志不足'};
 return {allowed:true,cost:1,dp:3};
}
export function check(state, options) {''')
edit('work/rules_engine/core.mjs',"if (options.willpower !== undefined) throw new Error('Generic willpower enhancement is not supported by this check');", """if(options.willpower!==undefined&&typeof options.willpower!=='boolean')throw Error('willpower须为玩家明确选择的布尔值');
  const context={willEligible:!options.context?.extended&&!options.context?.multiCheck,...options.context,...(options.willpower?{willSpent:true}:{})};
  if(options.willpower){const will=willEnhancement(state,context);if(!will.allowed)return {eligible:false,success:false,reason:will.reason};}
  options={...options,context};""")
edit('work/rules_engine/core.mjs','const dp = (options.poolBase', 'const baseDP = (options.poolBase')
edit('work/rules_engine/core.mjs','const roll = rollPool(dp, options.dice);', "if(options.willpower&&baseDP<=0)return {eligible:false,success:false,reason:'机运骰不能用意志增强'};\n  const dp=baseDP+(options.willpower?3:0);\n  const roll = rollPool(dp, options.dice);")
edit('work/rules_engine/core.mjs','return { eligible: true, ...roll, skill, adjustments,', 'return { eligible: true, willCost:options.willpower?1:0, ...roll, skill, adjustments,')
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"'targetId','purpose']", "'targetId','purpose','willpower']")
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"save:['actorId','type','dc','sourceQuote']", "save:['actorId','type','dc','sourceQuote','willpower']")
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"['actorId','attribute','attributes','skill','sub'].includes(k)", "['actorId','attribute','attributes','skill','sub','willpower'].includes(k)")
edit('work/rules_engine/gm_runtime/rule-actions.mjs','text(x.actorId)&&(ATTRIBUTES', "text(x.actorId)&&(x.willpower===undefined||typeof x.willpower==='boolean')&&(ATTRIBUTES")
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"if(r.preActionDC!==undefined", "if(r.willpower!==undefined&&typeof r.willpower!=='boolean')return false;\n  if(r.preActionDC!==undefined")
edit('work/rules_engine/gm_runtime/rule-actions.mjs','modifier:derived.modifier,context:', 'willpower:spec.willpower,modifier:derived.modifier,context:')
edit('work/rules_engine/gm_runtime/rule-actions.mjs','result=oppose(active.state,passive.state,opts(r.active),opts(r.passive));', "result=oppose(active.state,passive.state,opts(r.active),opts(r.passive));\n    if(!result.active.eligible||!result.passive.eligible)throw Error(result.active.reason??result.passive.reason);\n    active.state.will.current-=result.active.willCost??0;passive.state.will.current-=result.passive.willCost??0;")
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"case 'check':result=check(s,{...opts(r),dc:r.dc});break;", "case 'check':result=check(s,{...opts(r),dc:r.dc});if(result.eligible)s.will.current-=result.willCost??0;break;")
edit('work/rules_engine/gm_runtime/rule-actions.mjs','reExtraSuccesses:p.extra,dc:r.dc,dice:dice()', 'reExtraSuccesses:p.extra,dc:r.dc,dice:dice(),willpower:r.willpower')
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"skill:r.type==='fort'?'求生':'运动'}),dc:r.dc,dice:dice()});", "skill:r.type==='fort'?'求生':'运动'}),dc:r.dc,dice:dice(),willpower:r.willpower});\n        if(result.eligible)s.will.current-=result.willCost??0;")
# D9 generic check transaction (callers opt in explicitly, no automatic spending).
edit('work/rules_engine/mvu_poc/adapter.mjs','if(before)nextRoot.actors[actorId].state=before.state;', 'if(before)nextRoot.actors[actorId].state=before.state;\n    if(!prevented)nextRoot.actors[actorId].state.will.current-=outcome.willCost??0;')
edit('work/rules_engine/mvu_poc/adapter.mjs',"actorId, ...(before?", "actorId,willCost:prevented?0:outcome.willCost??0, ...(before?")
edit('work/rules_engine/gm_runtime/replay-check.mjs',"const ids=request.action==='opposed'", """const willSelectors=request.action==='opposed'?[request.active,request.passive]:[request];
        if(willSelectors.some(x=>x.willpower===true)&&(!/(?:花费|消耗|使用|用|花)\\s*(?:1|一|一点|1点)?\\s*(?:点)?意志/.test(declaration)||/不(?:用|花|消耗)|不要|暂不/.test(declaration)))return {status:'needs_input',missing:['意志增强须由玩家明确选择；每次消耗1意志。']};
        const ids=request.action==='opposed'""")
# Growth window is a host-authored current fact, not every reward/node.
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"case 'growth': {\n        if(r.skill)", "case 'growth': {\n        requireGrowthWindow(next,r);\n        if(r.skill)")
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"case 'feat': {\n        const out", "case 'feat': {\n        requireGrowthWindow(next,r);\n        const out")
edit('work/rules_engine/gm_runtime/rule-actions.mjs','// This reducer only receives validated selectors.', '''function requireGrowthWindow(root,r){
 const window=root.ruleScene?.growthWindow;
 if(!window?.source||window.open!==true||!window.actorIds?.includes(r.actorId))throw Error('当前尚未登记可强化节点／故事间隙');
 if(window.allowedChoices&&!window.allowedChoices.some(x=>Object.entries(x).every(([k,v])=>r[k]===v)))throw Error('此强化尚不满足当前节点登记的学习条件');
}

// This reducer only receives validated selectors.''')
edit('work/rules_engine/gm_runtime/rule-actions.mjs','a.state=out.state;result=out.result;break;\n      }\n      case \'first_aid\'', "a.state=out.state;result={...out.result,xpBefore:s.xp,xpAfter:out.state.xp,nodeId:next.ruleScene.growthWindow.id};break;\n      }\n      case 'first_aid'")
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"a.state=out.state;result=out.result;break;\n      }\n      case 'status':", "a.state=out.state;result={...out.result,xpBefore:s.xp,xpAfter:out.state.xp,nodeId:next.ruleScene.growthWindow.id};break;\n      }\n      case 'status':")
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"(out.state.ruleEvents??=[]).push(r.eventId);", """if(r.action==='node'&&e.growthAllowed!==undefined){
          next.ruleScene??={};next.ruleScene.growthWindow={id:r.eventId,source:e.source,open:e.growthAllowed,actorIds:e.actorIds,...(e.allowedChoices?{allowedChoices:structuredClone(e.allowedChoices)}:{})};
        }
        (out.state.ruleEvents??=[]).push(r.eventId);""")
edit('work/rules_engine/gm_runtime/integrated.mjs',"const scene=saved.ruleScene??={};", """const scene=saved.ruleScene??={};
    if(config.growthWindow){
      const w=config.growthWindow;
      if(!w.id||!w.source?.trim()||typeof w.open!=='boolean'||!Array.isArray(w.actorIds)||!w.actorIds.every(id=>saved.actors[id]))throw Error('强化窗口须有实际节点/故事间隙ID、来源、开放状态和人物');
      scene.growthWindow=structuredClone(w);
    }""")
edit('work/rules_engine/gm_runtime/integrated.mjs',"if(category==='events'&&spec.type==='reward'", "if(category==='events'&&spec.growthAllowed!==undefined&&typeof spec.growthAllowed!=='boolean')throw Error('growthAllowed须为现场确认的布尔值');\n      if(category==='events'&&spec.type==='reward'")
