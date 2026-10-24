import {canObserve,distance,vertices,contains,elevationAt} from './map.mjs';
import {ABILITIES} from './catalog.mjs';
import {panel} from './engine.mjs';
import {decisionContext} from './runtime.mjs';
import {statusLevel,lifeStatus} from '../core.mjs';

// The player's explicit consequence receipt is assembled after narration. It
// never gives the narrator private opponent figures or asks it to infer damage.
export function ownImpactReport(root,{afterRevision=0,playerId='player'}={}) {
  const actor=root.actors[playerId];if(!actor)return '';
  const damage={B:0,L:0,A:0},changes=[],changedTypes=new Set();
  let before;
  const operations=Object.values(root.operations).filter(o=>o.summary?.result)
    .sort((a,b)=>a.summary.revision-b.summary.revision);
  for(const op of operations) {
    const r=op.summary.result,after=r.after?.participants.find(a=>a.id===playerId);
    if(op.summary.revision>afterRevision) {
      for(const hit of [...r.damage,...(r.opportunities??[]).flatMap(x=>x.damage)])
        if(hit.targetId===playerId&&Object.hasOwn(damage,hit.severity))damage[hit.severity]+=hit.actualDamage;
      if(after) {
        const oldState={...actor.state,statuses:before?.statuses??[]},newState={...actor.state,statuses:after.statuses};
        for(const type of new Set([...oldState.statuses,...newState.statuses].map(s=>s.type))) {
          const old=statusLevel(oldState,type),now=statusLevel(newState,type);
          if(old.points!==now.points) {
            changedTypes.add(type);changes.push(now.points===0?`${type}解除`:
              `${type}${old.points?`由${old.points}变为${now.points}点`:`新增${now.points}点`}${now.severe?'（严重）':''}`);
          }
        }
        const penalty=lifeStatus({...actor.state,health:after.health}).woundPenalty;
        const previous=before?lifeStatus({...actor.state,health:before.health}).woundPenalty:0;
        if(penalty>previous)changes.push(`伤势减值现为${penalty}点`);
      }
    }
    if(after)before=after;
  }
  const injuries=Object.entries(damage).filter(([,n])=>n>0).map(([s,n])=>`${n}点${({B:'冲击',L:'严重',A:'恶性'})[s]}伤害（${n}${s}）`);
  const parts=[...(injuries.length?[`受到${injuries.join('、')}`]:[]),...changes];
  if(parts.length) {
    const current={...actor.state,statuses:before?.statuses??actor.state.statuses};
    const remaining=[...new Set(current.statuses.map(s=>s.type))].filter(type=>!changedTypes.has(type))
      .map(type=>({type,...statusLevel(current,type)})).filter(s=>s.points>0)
      .map(s=>`${s.type}${s.points}点${s.severe?'（严重）':''}`);
    if(remaining.length)parts.push(`当前负面状态：${remaining.join('、')}`);
  }
  return parts.length?`**${actor.name}本次结算：** ${parts.join('；')}。`:'';
}

const visibleArms=a=>a.kind==='jiang'?'徒手，以拳掌应战':a.kind==='huang'?`狮子王太刀${a.sheathed?'在鞘':'出鞘'}`:
  a.kind==='yulin'?`弃风长剑${a.sheathed?'在鞘':'在手'}`:a.kind==='bright'?'苍穹长弓':a.kind==='lotus'?'灵兽，以爪牙应战':'以已出现的装备为准';
function condition(state) {
  return state.health.intact>0?(state.health.B+state.health.L+state.health.A>0?'可见受伤':'未见伤势'):'倒地';
}

// Observable execution, not the private ability text (which includes budgets
// and defense figures). Preparing a guard does not itself resolve an attack.
const preparations={
  zheng:{execution:'收束剑路，以长剑护持身前，转入挡接来袭的守势',outcome:'守势的防护准备已经成立'},
  block:{execution:'以当前格挡手段护住自身，准备挡接来袭',outcome:'格挡的防护准备已经成立'},
  fistQi:{execution:'将气运至拳掌，凝聚后续出拳的劲力',outcome:'拳气准备成立，尚未出拳'},
  breakBody:{execution:'运转破身拳法门，将劲力收于拳掌',outcome:'破身拳运功准备成立，尚未出拳'},
};

// This allowlist is the boundary between the private rules save and prose.
// Do not send stateResult, decisionContext, or operation summaries to the narrator.
export function publicScene(root,{afterRevision=0,playerId='player'}={}) {
  const b=root.battle;
  const actors=Object.entries(b.actors).filter(([,a])=>canObserve(b,a,playerId));
  const operations=Object.values(root.operations).filter(o=>o.summary?.result)
    .sort((a,b)=>a.summary.revision-b.summary.revision);
  const declared=new Map(),events=[];let hasAttack=false;
  for(const [index,op] of operations.entries()) {
    const r=op.summary.result,c=JSON.parse(op.signature);
    if(c.abilityId&&c.abilityId!=='react')declared.set(`${c.actorId}/${c.abilityId}`,c);
    if(op.summary.revision<=afterRevision)continue;
    const beforeSnapshot=operations[index-1]?.summary.result.after,before=beforeSnapshot?.participants;
    const visibleAt=(participants,ids)=>{
      if(ids)return ids.filter(id=>b.actors[id]).map(id=>[id,b.actors[id].name]);
      const snapshot={...b,actors:Object.fromEntries(Object.entries(b.actors).map(([id,a])=>[id,{...a,position:participants?.find(p=>p.id===id)?.position??a.position}]))};
      return Object.entries(snapshot.actors).filter(([,a])=>canObserve(snapshot,a,playerId)).map(([id,a])=>[id,a.name]);
    };
    const afterSeen=new Map(visibleAt(r.after.participants,r.after.visibleTo?.[playerId])),seen=new Map([...visibleAt(before,beforeSnapshot?.visibleTo?.[playerId]),...afterSeen]);
    if(!seen.has(r.actorId)||['enter','leave','end','parameters','react','map','mapUpdate'].includes(r.abilityId))continue;
    if(r.after.awaiting&&op.summary.revision!==root.revision)continue;
    const command=c.abilityId===r.abilityId?c:declared.get(`${r.actorId}/${r.abilityId}`)??{};
    if(r.attack||r.opportunities?.length)hasAttack=true;
    const event={actor:seen.get(r.actorId),action:ABILITIES[r.abilityId]?.name??'行动',
      arms:visibleArms(b.actors[r.actorId]),
      status:r.after.awaiting?'pending':'resolved',
      ...(seen.has(command.targetId)?{target:seen.get(command.targetId)}:{})};
    if(r.after.awaiting)event.outcome=b.pending?.kind==='opportunity'?'准备离开威胁范围，尚未移动；等待玩家决定是否借机攻击':'攻击将至，等待受击反应；尚未命中';
    else if(r.attack)event.outcome=r.damage.some(x=>x.actualDamage>0)?'造成伤势':r.attack.amount>0?'攻击被防护化解':'未能命中';
    else if(preparations[r.abilityId])Object.assign(event,preparations[r.abilityId]);
    else event.outcome='已执行';
    if(r.terrain) {
      event.target=r.terrain.label;event.outcome=r.terrain.outcome;
      event.execution=r.abilityId==='door'?(r.terrain.open?'推开眼前的门':'将眼前的门关上'):'以当前武器攻击所声明的障碍段';
    }
    const damage=[...r.damage,...(r.opportunities??[]).flatMap(x=>x.damage)];
    const affectedIds=[...new Set(damage.filter(x=>x.actualDamage>0&&seen.has(x.targetId)).map(x=>x.targetId))];
    event.affected=affectedIds.map(id=>seen.get(id));
    if(event.affected.length) {
      event.consequence=`${event.affected.join('、')}确实受伤，防御未完全化解伤害；必须写出受创，不得写成完全挡住或无伤。`;
      // Compare this event's snapshots, not the final scene: a later movement
      // remains a separate event and cannot turn an earlier hit into knockback.
      const stationary=affectedIds.filter(id=>{
        const from=before?.find(x=>x.id===id)?.position,to=r.after.participants.find(x=>x.id===id)?.position;
        return from&&to&&from.length===to.length&&from.every((value,i)=>value===to[i]);
      }).map(id=>seen.get(id));
      if(stationary.length)event.consequence+=`${stationary.join('、')}此次受击时原地受创，站位未变。`;
    }
    if(['move','step'].includes(r.abilityId)) {
      const to=r.after.participants.find(x=>x.id===r.actorId)?.position;
      const from=r.movement?.from??before?.find(x=>x.id===r.actorId)?.position;
      const observer=r.after.participants.find(x=>x.id===playerId)?.position;
      if(!afterSeen.has(r.actorId)){event.outcome='移入遮挡之后，离开视线；不公开遮挡后的落点';}
      if(afterSeen.has(r.actorId)&&from&&to)event.travelMeters=Math.round((r.movement?.length??distance(from,to))*10)/10;
      if(r.movement&&b.map) {
        const path=r.movement.path.filter(position=>r.actorId===playerId||canObserve({...b,actors:{...b.actors,[playerId]:{...b.actors[playerId],position:observer}}},{...b.actors[r.actorId],position},playerId));
        const known=b.map.features.filter(f=>!f.hiddenFrom?.includes(playerId));
        event.route={around:known.filter(f=>['obstacle','door'].includes(f.kind)&&path.slice(1,-1).some(p=>vertices(f).some(v=>distance(p,v)<.5))).map(f=>f.label),
          through:known.filter(f=>!['obstacle','door'].includes(f.kind)&&path.some(p=>contains(p,f,{boundary:false}))).map(f=>f.label)};
      }
      if(r.actorId===playerId)event.relativePosition=r.after.participants.filter(p=>p.id!==playerId&&afterSeen.has(p.id)).map(p=>`${seen.get(p.id)}与御临风相距${Math.round(distance(to,p.position)*10)/10}米`);
      if(r.actorId===playerId)event.outOfSight=[...seen.keys()].filter(id=>id!==playerId&&!afterSeen.has(id)).map(id=>seen.get(id));
      if(afterSeen.has(r.actorId)&&observer&&from&&r.actorId!==playerId){event.direction=distance(to,observer)>distance(from,observer)?'远离御临风':'靠近御临风';event.distanceToPlayer=Math.round(distance(to,observer)*10)/10;}
    }
    if(r.opportunities)event.reactions=r.opportunities.filter(x=>seen.has(x.actorId)).map(x=>({actor:seen.get(x.actorId),
      action:'借机攻击',arms:visibleArms(b.actors[x.actorId]),timing:'离开近战范围之前，随后才完成移动',outcome:x.damage.some(d=>d.actualDamage>0)?'造成伤势':'未造成伤势'}));
    if(r.responses?.length)event.responses=r.responses.filter(x=>seen.has(x.targetId)).map(x=>({
      actor:seen.get(x.targetId),method:x.guarded?'已就绪的主动格挡参与本击防御':'本击仅使用基础及被动防护，没有使用主动格挡',
    }));
    events.push(event);
  }
  const origin=b.actors[playerId]?.position;
  const terrain=a=>b.map?{terrain:{elevation:elevationAt(b.map,a.position),areas:b.map.features
    .filter(f=>!f.destroyed&&!f.hiddenFrom?.includes(playerId)&&contains(a.position,f)).map(f=>f.label)}}:{};
  const nearby=b.map?.features.filter(f=>!f.hiddenFrom?.includes(playerId)).map(f=>({f,d:origin?(contains(origin,f)?0:Math.min(...vertices(f).map(p=>distance(p,origin)))):Infinity})).filter(x=>x.d<=10).sort((a,b)=>a.d-b.d).slice(0,3).map(x=>x.f.label);
  return {events,...(!hasAttack?{interaction:'本段仅发生已列出的移动、准备或恢复等行动，双方未发生攻击或挡接。'}:{}),setting:b.map?{name:b.map.title,nearbyLandmarks:nearby}:b.scenario,participants:actors.map(([id,a])=>({id,name:a.name,location:id===playerId?'你所在的位置':b.actors[playerId]?`与你相距${Math.round(distance(a.position,b.actors[playerId].position)*10)/10}米`:'场上可见位置',...terrain(a),condition:condition(root.actors[id].state),arms:visibleArms(a)})),
    phase:b.mode==='story'?'战斗结束':b.pending?.kind==='opportunity'?'等待玩家借机攻击声明':b.pending?.awaiting===playerId?'等待玩家受击反应':b.activeId===playerId?'等待玩家继续行动':'场上行动',
    ...(b.status==='finished'?{winners:actors.filter(([,a])=>a.team===b.winner).map(([,a])=>a.name)}:{})};
}

export function playerDeclarationContext(b,revision,playerId='player') {
  const safe=structuredClone(b);
  // Even explicitly shared ally stats are private under this campaign's rule.
  safe.knowledge={...safe.knowledge,[playerId]:Object.fromEntries(Object.entries(safe.knowledge?.[playerId]??{}).map(([id,k])=>[id,{...k,stats:false}]))};
  const context=decisionContext(safe,revision);
  context.abilities={...context.abilities,...Object.fromEntries([...safe.actors[playerId].abilities,'door','destroy'].map(id=>[id,ABILITIES[id]]))};
  return context;
}

// This object is for local player UI only; it never enters a narration prompt.
export const stripLegacyOwnStatus=text=>text.replace(/<details>\s*<summary>[^<]* · 自身状态<\/summary>[\s\S]*?<\/details>/g,'').trim();

export function ownStatus(root,battle,playerId='player',fallbackActor) {
  const actor=root.actors[playerId];
  if(!actor)return null;
  const source=battle?.actors[playerId]??(fallbackActor?{...fallbackActor,...actor.combatCarry,state:actor.state}:null);
  if(!source)return null;
  const b=battle?.actors[playerId]?battle:{playerDefenseDeclarations:true,actors:{[playerId]:source}};
  const p=panel(b,playerId),intent=source.defenseIntent;
  return {name:actor.name,health:p.health,hpMax:p.hpMax,energy:p.energy,
    attack:{dp:p.attack.dp,fixed:p.attack.fixed,cap:p.attack.cap},
    defense:p.defense.pending?{pending:true}:{total:p.defense.total,parts:p.defense.parts,extraSuccesses:p.defense.extraSuccesses},
    speed:p.speed,actions:p.actions,activeTurn:battle?.mode==='combat'&&battle.activeId===playerId,
    statuses:p.statuses,attributes:p.attributes,life:p.life,
    ...(intent?{declaredDefense:structuredClone(intent)}:{})};
}
