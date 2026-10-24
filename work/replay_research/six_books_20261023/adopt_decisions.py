from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def edit(path,old,new):
 p=ROOT/path;s=p.read_text(encoding='utf-8')
 if old not in s: raise ValueError(f'not found: {path}: {old[:100]}')
 p.write_text(s.replace(old,new),encoding='utf-8')

# Adopted D1: effective non-stacking values, after resistance, never undo damage.
edit('work/rules_engine/core.mjs','export function applyStatus(state,', '''export function counteractTemperature(state) {
 const cold=statusLevel(state,'冻结').points,fire=statusLevel(state,'燃烧').points;
 const cancelled=Math.min(cold,fire);
 if(cancelled)for(const s of state.statuses)if(['冻结','燃烧'].includes(s.type))s.points=Math.max(0,s.points-cancelled);
 state.statuses=state.statuses.filter(s=>s.points>0);
 return {cancelled,cold:Math.max(0,cold-fire),fire:Math.max(0,fire-cold)};
}

export function applyStatus(state,''')
edit('work/rules_engine/core.mjs','if (remaining) next.statuses.push({ type, source, points: remaining });','if (remaining) next.statuses.push({ type, source, points: remaining });\n  if(type===\'冻结\')counteractTemperature(next);')
edit('work/rules_engine/status-rules.mjs','actionEligibility}', 'actionEligibility,counteractTemperature}')
edit('work/rules_engine/status-rules.mjs',"if(!Number.isInteger(spec.fullPenaltyAt)||spec.fullPenaltyAt<1)need('须裁定全额肢体减速所需的受损肢体数量','anatomy.fullPenaltyAt');", "const threshold=spec.fullPenaltyAt??(['human','wolf'].includes(state.anatomy?.kind)?2:state.anatomy?.kind==='centipede'?21:Math.max(2,Math.ceil(spec.limbs.filter(id=>!spec.exemptLimbs?.includes(id)).length/2)));")
edit('work/rules_engine/status-rules.mjs','affected.size>=spec.fullPenaltyAt','affected.size>=threshold')
edit('work/rules_engine/status-rules.mjs','result={applied:spec.points>0,points:statusLevel(s,\'燃烧\').points};','const counteract=counteractTemperature(s);result={applied:spec.points>0,points:statusLevel(s,\'燃烧\').points,counteract};')
p=ROOT/'work/rules_engine/status-rules.mjs';s=p.read_text(encoding='utf-8');start=s.index("   if(!Array.isArray(e.removals)");end=s.index(" }else if(e.type==='extinguish')",start);s=s[:start]+"   result=counteractTemperature(s);\n"+s[end:];p.write_text(s,encoding='utf-8')
# D11 capacity shrink is a wound remapping, not healing.
edit('work/rules_engine/core.mjs',"if(delta<0&&s.health.intact<-delta){s.geneticLock.pendingHpShrink={amount:-delta,reason:'临时力量结束时完好槽不足；须裁定伤槽处理'};return;}\n  s.health.intact+=delta;s.derived.hpMax+=delta;s.geneticLock.hpBonus=wanted;delete s.geneticLock.pendingHpShrink;", """if(delta<0){
    const wounds={B:s.health.B,L:s.health.L,A:s.health.A};
    s.derived.hpMax=Math.max(1,s.derived.hpMax+delta);
    s.health={...s.health,intact:s.derived.hpMax,B:0,L:0,A:0};
    s.health=applyWounds(s,wounds).state.health;
    if(['unconscious','dead'].includes(lifeStatus(s).state))s.health.coma=true;
  }else{s.health.intact+=delta;s.derived.hpMax+=delta;}
  s.geneticLock.hpBonus=wanted;delete s.geneticLock.pendingHpShrink;""")
# D4/D6/D7/D8/D10 defaults and actual operations.
edit('work/rules_engine/gm_runtime/wizard-host.mjs',"if(!o.ending?.source||!o.ending.action)need('解除变身的动作须有实际采用规则','wizard.ending');action=o.ending.action;", "if(!a.state.wizard?.form)fail('尚未变身');action='swift';")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"if(other&&target.state.size>5){if(!Number.isInteger(p.oversizeEquivalentVolume))need('大于体积5目标的首个超额与携物DC2如何组合须裁定','oversizeEquivalentVolume');volume+=p.oversizeEquivalentVolume;}","if(other)volume+=Math.max(0,target.state.size-5);")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"let steps=p.distance<=1000?1:p.distance%1000===0?p.distance/1000:p.distanceSteps;\n     if(!Number.isInteger(steps)||steps<1)need('非整千米距离的增量取整须裁定','distanceSteps');", "const steps=Math.max(1,Math.ceil(p.distance/1000));")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"if(!p.action)need('PHB未给主动解除动作，须登记已裁定动作','geneticLock.endAction');\n     if(a.state.geneticLock?.active?.[2]&&p.endAll!==true)need('二阶主动结束须明确是否同时结束一阶；当前仅支持已确认全部结束','geneticLock.endAll');\n     action=p.action;", "action='free';")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"}else if(r.operation==='shift'){", """}else if(r.operation==='unlockBoth'){
     if(p.authorized!==true||p.mode!=='voluntary'||!['力量','敏捷'].includes(p.attribute))need('双开须本人主动选择和二阶属性','geneticLock.plan');
     if(a.state.xp<21)fail('同轮双开须预备21XP');
     if(o.resolvedPlans?.includes(r.part))fail('这次开启尝试已经结算');
     if(!Number.isInteger(a.state.geneticLock?.successfulUnlocks?.[2]))need('须有二阶解锁履历','geneticLock.history');
     action='full';paid(a,action,combat,preActionCleared);const stages=[];
     for(const stage of [1,2]){
       const input={stage,mode:'voluntary',attribute:p.attribute,opportunity:{id:`${r.objectId}/${r.part}/${stage}`,source:p.source,kind:'explicit_rule'}};
       const ready=resolveGeneticUnlock(a.state,input);if(ready.status!=='ready')need(ready.reason,'geneticLock');
       const out=resolveGeneticUnlock(a.state,{...input,dice:drawDice()});a.state=out.state;stages.push(out.result);if(!out.result.success)break;
     }
     (o.resolvedPlans??=[]).push(r.part);result={stages,cost:stages.reduce((n,x)=>n+x.cost,0),success:stages.length===2&&stages.every(x=>x.success)};
   }else if(r.operation==='shift'){""")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"if(!p.transition?.source||!p.transition.bodyDisposition||!p.transition.returnRule)need('Engage的现实身体、返回方式须有具体场景裁定','transition');\n     action='full';paid(a,action,combat,preActionCleared);mana(a,o,0);a.state.underworld={wearerId:p.wearerId,source:o.source,...structuredClone(p.transition)};result={cost:0,underworld:a.state.underworld};\n   }else fail('请选择sleep或engage');", """if(a.state.underworld)fail('已进入精神世界');
     action='full';paid(a,action,combat,preActionCleared);mana(a,o,0);
     a.state.underworld={wearerId:p.wearerId,objectId:r.objectId,source:o.source,bodyDisposition:'remains',returnRule:'ownBody',timeRatio:1,bodyPosition:structuredClone(a.position??a.state.position),wearerWasSleeping:!!target.state.sleeping,...(p.trap?.source?{trap:structuredClone(p.trap)}:{})};result={cost:0,underworld:a.state.underworld};
   }else if(r.operation==='exit'){
     if(!a.state.underworld||a.state.underworld.objectId!==r.objectId)fail('未通过此戒指进入精神世界');
     if(a.state.underworld.trap?.blocksExit)fail('场景明确困锁阻止退出');
     action='full';paid(a,action,combat,preActionCleared);delete a.state.underworld;result={returned:true,cost:0};
   }else fail('请选择sleep、engage或exit');""")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"||typeof p.exception!=='boolean'", "||p.exception===true&&!p.exceptionSource")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs',"须确认攻击等级、魔幻能量类别及是否属于原文例外", "须确认攻击等级和魔幻能量类别；例外须具体来源")
edit('work/rules_engine/gm_runtime/conditional-resources.mjs','function relocate(root,a,p){', '''export function settleEngageReturns(root){
 const changes=[];
 for(const [id,a]of Object.entries(root.actors??{})){
   const u=a.state.underworld;if(!u)continue;
   const wearer=root.actors[u.wearerId];
   if(wearer?.state.sleeping)u.wearerWasSleeping=true;
   if(u.wearerWasSleeping&&!wearer?.state.sleeping&&!u.trap?.blocksExit){delete a.state.underworld;changes.push({actorId:id,returned:true,reason:'wearerAwoke'});}
 }return changes;
}
export function assertEmbodied(state,request,objects={}){
 if(!state.underworld)return;
 if(request.operation==='exit'&&objects[request.objectId]?.type==='phantomRings')return;
 if(['time','status','status_event','save'].includes(request.action)||['end','statusEvent'].includes(request.abilityId))return;
 fail('意识正处于Underworld；须先退出才能操作现实肉身');
}
function relocate(root,a,p){''')
edit('work/rules_engine/gm_runtime/scene-rules.mjs',"if(!['open','close'].includes(r.operation))throw new IllegalAction('盒子仅支持开关');", """if(r.operation==='reseal'){
      const p=o.plans?.[r.part];if(!o.released||!p?.source||!['returned','dead'].includes(p.outcome))throw new RuleInputError('须实际归盒或死亡回归的来源事件','demonBox.reseal');
      o.sleep=3;o.open=false;o.released=false;o.openRounds=0;o.closedMinutes=0;
      for(const record of Object.values(root.actors))record.state.statuses=record.state.statuses.filter(s=>s.demonBoxId!==r.objectId);
      return {objectId:r.objectId,type:o.type,operation:r.operation,action:null,sleep:3,resealed:true};
    }
    if(!['open','close'].includes(r.operation))throw new IllegalAction('盒子支持开关、感知或实际归盒');""")
edit('work/rules_engine/gm_runtime/scene-rules.mjs',"if(!['free','swift','move','standard','full'].includes(o.activationAction))throw new RuleInputError('原文未给魔物之盒开关动作，须主持明确','demonBox.activationAction');",'')
edit('work/rules_engine/gm_runtime/scene-rules.mjs','action=o.activationAction;o.open=',"action='move';o.open=")
edit('work/rules_engine/gm_runtime/scene-rules.mjs',"if(!Number.isInteger(o.recoveryCap))throw new RuleInputError('盒子关闭一天后的恢复上限未给出，须主持裁定',`${id}.recoveryCap`);\n        o.sleep=Math.min(o.recoveryCap,o.sleep+days);",'o.sleep=Math.min(3,o.sleep+days);')

for f in ['work/rules_engine/gm_runtime/rule-actions.mjs','work/rules_engine/combat/engine.mjs']:
 edit(f,'settleInterruptedTeleports}', 'settleInterruptedTeleports,settleEngageReturns,assertEmbodied}')
 edit(f,'const interrupted=settleInterruptedTeleports(', 'const engageReturns=settleEngageReturns('+('next);if(engageReturns.length)result={...result,engageReturns};\n  const interrupted=settleInterruptedTeleports(' if 'rule-actions' in f else 'b);if(engageReturns.length)result.engageReturns=engageReturns;\n  const interrupted=settleInterruptedTeleports('))
edit('work/rules_engine/gm_runtime/rule-actions.mjs',"let preActionCheck,permission;", "let preActionCheck,permission;assertEmbodied(actor(activeId).state,r,next.ruleScene?.objects);")
edit('work/rules_engine/combat/engine.mjs',"requireThat(id==='conversion'||a.id===b.activeId", "assertEmbodied(a.state,c,b.ruleScene?.objects);\n  requireThat(id==='conversion'||a.id===b.activeId")
