import {distance,clearLine,routeTo,truncateRoute,canObserve,vertices,terrainCover,spatialDistance} from './map.mjs';

const foes=(b,a)=>Object.values(b.actors).filter(t=>t.team!==a.team&&canObserve(b,t,a.id));
const bowUser=a=>a.kind==='bright'&&(!a.weaponMode||a.weaponMode==='bow')||a.kind==='mireya'&&a.weaponMode!=='club';
export const lastSeenFoes=(b,a)=>Object.entries(b.knowledge?.[a.id]??{}).filter(([id,k])=>
  k.lastSeen&&k.lastSeen.team!==a.team&&!k.lastSeen.searched&&!canObserve(b,b.actors[id],a.id))
  .map(([id,k])=>({id,...k.lastSeen}));
export function movementCandidates(b,a,abilityId,speed) {
  const candidates=[],add=path=>{if(!path?.length)return;const to=path.at(-1);if(distance(a.position,to)<.01)return;
    candidates.push({actorId:a.id,abilityId,to,...(path.length>1?{via:path.slice(0,-1)}:{})});};
  const budget=abilityId==='step'?Math.min(1.5,speed):speed;
  const visible=foes(b,a);
  if(!visible.length)for(const t of lastSeenFoes(b,a))add(truncateRoute(b.map,a.position,routeTo(b.map,a.position,t.position),budget-.002));
  for(const t of visible) {
    const d=distance(a.position,t.position);if(!d)continue;
    const u=t.position.map((v,i)=>(v-a.position[i])/d);
    const toward=[1,.5,0].map(scale=>t.position.map((v,i)=>v-u[i]*Math.min(a.reach,d)*scale))
      .find(p=>spatialDistance(b.map,p,t.position)<=a.reach+.001);
    add(truncateRoute(b.map,a.position,routeTo(b.map,a.position,toward),budget-.002));
    add([a.position.map((v,i)=>v-u[i]*budget)]);
    // A lateral route is useful around actual obstacles, not obligatory dance.
    for(const side of [-1,1]) {
      const flank=[t.position[0]-u[1]*a.reach*side,t.position[1]+u[0]*a.reach*side];
      add(truncateRoute(b.map,a.position,routeTo(b.map,a.position,flank),budget-.002));
    }
    if(b.map)for(const f of b.map.features.filter(f=>!f.destroyed&&!f.hiddenFrom?.includes(a.id)&&(f.blocksSight||f.coverDegree)&&!(f.kind==='door'&&f.open))) {
      const vs=vertices(f),x=Math.min(...vs.map(p=>p[0])),y=Math.min(...vs.map(p=>p[1])),w=Math.max(...vs.map(p=>p[0]))-x,h=Math.max(...vs.map(p=>p[1]))-y;
      const center=[x+w/2,y+h/2],len=distance(center,t.position)||1;
      const cover=center.map((v,i)=>v+(v-t.position[i])/len*(Math.hypot(w,h)/2+.3));
      add(truncateRoute(b.map,a.position,routeTo(b.map,a.position,cover),budget-.002));
    }
  }
  return candidates;
}
export function movementPurpose(b,c) {
  const a=b.actors[c.actorId],enemies=foes(b,a);
  const target=enemies.sort((x,y)=>distance(a.position,x.position)-distance(a.position,y.position))[0];
  if(!target) {
    const remembered=lastSeenFoes(b,a).sort((x,y)=>distance(a.position,x.position)-distance(a.position,y.position))[0];
    if(remembered&&distance(c.to,remembered.position)<distance(a.position,remembered.position)-.05)
      return {useful:true,intent:'search',targetId:remembered.id,reason:'前往最后目击位置查看；不知道目标目前位置',lastSeenPosition:remembered.position};
    return {useful:false,intent:'hold',reason:'没有可继续追查的目击位置'};
  }
  const before=spatialDistance(b.map,a.position,target.position),after=spatialDistance(b.map,c.to,target.position);
  const close=after<before-.05,clearBefore=clearLine(b.map,a.position,target.position),clearAfter=clearLine(b.map,c.to,target.position);
  // A bow user's melee reach is not its desired shooting distance. Approach
  // only to open a blocked shot, keeping out of the bow's interference zone.
  const bow=bowUser(a),interference=a.kind==='mireya'?1.5:7.5;
  const needsApproach=!bow||(!clearBefore&&after>interference);
  const injury=a.state.health.intact/a.state.derived.hpMax,history=a.tactics?.recent??[];
  const justRetreated=history.some(x=>x.intent==='recover'&&x.round>=b.round-1);
  const coverBefore=clearLine(b.map,a.position,target.position,{sight:true}),coverAfter=clearLine(b.map,c.to,target.position,{sight:true});
  let intent='hold',reason='位置变化不改善攻击路线或生存，保留阵位',useful=false;
  if(needsApproach&&close&&(before>a.reach+.05||!clearBefore)&&clearAfter){intent='engage';reason='接近已知目标，建立后续攻击距离';useful=true;}
  else if(needsApproach&&close&&!clearAfter&&before>a.reach){intent='engage';reason='沿可通行路线绕过障碍接近';useful=true;}
  else if(!clearBefore&&clearAfter&&(!bow||after>interference)){intent='reposition';reason='侧移打开攻击路线';useful=true;}
  else if(bow&&before<=interference&&after>before){intent='kite';reason='弓手脱离近身干扰，恢复射击条件';useful=true;}
  else if(clearAfter&&(bow||injury<=.35)&&terrainCover(b.map,target.position,c.to)>terrainCover(b.map,target.position,a.position)){
    intent='cover';reason='进入方向有效的部分掩体，保留攻击路线';useful=true;}
  else if(coverBefore&&!coverAfter&&(injury<=.35||bow)){intent='cover';reason='借遮挡保护恢复或远程作战';useful=true;}
  else if(after>before&&injury<=.35&&!justRetreated){intent='recover';reason='重伤时拉开一次恢复空间，下轮重新评估';useful=true;}
  return {useful,intent,targetId:target.id,reason,distanceBefore:Math.round(before*10)/10,distanceAfter:Math.round(after*10)/10,
    inMeleeAfter:after<=a.reach+.001,clearAttackLine:clearAfter};
}
export function rememberTactic(before,after,c,result) {
  const a=after.actors[c.actorId];if(!a||a.controller==='player')return;
  const moving=['move','step'].includes(c.abilityId);
  let intent=moving?movementPurpose(before,c).intent:result.attack?'press':
    ['selfHeal','restoreSwift','squeeze'].includes(c.abilityId)?'recover':
    ['block','fistQi','breakBody','draw'].includes(c.abilityId)?'prepare':a.tactics?.intent??'hold';
  const targetId=c.targetId??(moving?movementPurpose(before,c).targetId:a.tactics?.targetId);
  a.tactics={intent,...(targetId?{targetId}:{}),recent:[...(a.tactics?.recent??[]),
    {round:result.round,action:c.abilityId,intent,...(targetId?{targetId}:{}),
      ...(moving?{from:[...before.actors[a.id].position],to:[...a.position]}:{})}].slice(-6)};
}
export function tacticalInspection(b,inspection) {
  if(b.pending||b.actors[b.activeId].controller==='player')return inspection;
  // This is NPC candidate selection, not a new restriction on player movement.
  let options=inspection.options.filter(o=>!o.preview.movement||o.preview.movement.useful);
  const acting=b.actors[b.activeId];
  // Conceding ends the match, so NPCs need an actual losing condition. An
  // unloaded bow with arrows, or an empty bow with a club available, is not one.
  const canConcede=acting.state.health.intact/acting.state.derived.hpMax<=.35||
    bowUser(acting)&&!acting.loaded&&acting.ammunition===0&&!acting.abilities.includes('drawClub');
  if(!canConcede)options=options.filter(o=>o.command.abilityId!=='concede');
  if(bowUser(acting)&&!acting.loaded&&options.some(o=>o.command.abilityId==='reload')) {
    // Do not spend round after round aiming an unloaded bow. Complete the swift
    // loading preparation before spending or passing the available attack.
    if(acting.state.turn.standard>0&&foes(b,acting).length)
      options=options.filter(o=>!o.preview.actions?.standard&&o.command.abilityId!=='end');
    else options=options.filter(o=>o.command.abilityId!=='aim');
  }
  const search=options.filter(o=>o.preview.movement?.intent==='search'&&!o.preview.actions?.standard);
  if(search.length&&b.actors[b.activeId].state.health.intact/b.actors[b.activeId].state.derived.hpMax>.35) {
    // Investigate the recorded position once; arriving without reacquiring the
    // target clears this option rather than granting knowledge through a wall.
    const remaining=Math.min(...search.map(o=>distance(o.command.to,o.preview.movement.lastSeenPosition)));
    options=options.filter(o=>o.command.abilityId!=='end'&&!(o.command.abilityId==='block'&&o.preview.actions?.move)&&
      (o.preview.movement?.intent!=='search'||distance(o.command.to,o.preview.movement.lastSeenPosition)<=remaining+.01));
  }
  const approach=options.filter(o=>o.preview.movement?.intent==='engage'&&o.preview.movement.inMeleeAfter&&!o.preview.actions?.standard);
  if(approach.length) {
    const cost=Math.min(...approach.map(o=>o.preview.movement.cost));
    const a=b.actors[b.activeId];
    const continueApproach=a.tactics?.intent==='engage'&&a.state.health.intact/a.state.derived.hpMax>.35&&
      !a.tactics.recent.some(x=>x.round===b.round);
    options=options.filter(o=>{
      const move=o.preview.movement;
      if(move?.intent==='engage')return move.inMeleeAfter&&move.cost<=cost+.01&&!o.preview.actions?.standard;
      // Blocking first would consume the approach action and force movement to
      // spend the attack. Keep free guards and preparations that do not do so.
      if(o.command.abilityId==='block'&&o.preview.actions?.move)return false;
      if(continueApproach&&o.command.abilityId==='end')return false;
      return true;
    });
  }
  return {...inspection,options};
}
