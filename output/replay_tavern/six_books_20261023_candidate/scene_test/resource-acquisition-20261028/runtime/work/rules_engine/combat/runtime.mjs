import {projectionView,projectionAppearance} from '../resource-projections.mjs';
import {schedulePassivePerception} from '../resource-perception-scheduler.mjs';
import {randomDice} from '../rule-random.mjs';
import {additionalDamageCandidates} from '../resource-additional-damage.mjs';
import {flightCandidates,syncVerticalPosition} from './movement-modes.mjs';
import {physicalPriceRequest} from './action-prices.mjs';
import {actionPriceOffers,combatRoundKey} from '../resource-action-pricing.mjs';
import {weaponAmmoSpec,ordinaryWeaponType} from '../resource-weapons.mjs';
import {BASIC_ACTIONS} from '../resource-action-bindings.mjs';
import {isReflexResource} from '../gm_runtime/resource-program.mjs';
import {normalizeMap,mapView,canObserve,measurePath,clearLine,spatialDistance} from './map.mjs';
import {movementCandidates,movementPurpose,tacticalInspection,lastSeenFoes} from './tactics.mjs';
import { initializeTestState, settleCombat, readCombat } from '../mvu_poc/adapter.mjs';
import { act, currentContext, panel, attackProfile, TACTICS, stateResult, opportunityActors, roarTargets, galeTargets,rapidFireTargets } from './engine.mjs';
import { ABILITIES } from './catalog.mjs';
import { beginTurn, freshTurn,lifeStatus,willEnhancement } from '../core.mjs';
import { RuleInputError, IllegalAction, refreshDerived,equipment, blockValue } from './mechanics.mjs';
import {grappleMembers} from './grapple.mjs';
import { resolveStep } from './transitions.mjs';
import {resourceCapability} from '../resource-lifecycle.mjs';

export function visibleTo(b,a,observer) {
  return canObserve(b,a,observer.id);
}

function candidatesFor(battle) {
  const a=battle.actors[battle.activeId], candidates=[];
  const add=(abilityId,extra={})=>candidates.push({actorId:a.id,abilityId,...extra});
  for(const id of Object.keys(BASIC_ACTIONS))add(id);
  add('search');
  if(a.state.paidMotion?.phase==='airborne')add('continueJump');
  if(!a.abilities.includes('reload')&&weaponAmmoSpec(a,equipment(a).weapon))add('reload');
  const enemies=Object.values(battle.actors).filter(t=>visibleTo(battle,t,a)&&t.team!==a.team);
  for(const t of Object.values(battle.actors))if(t.present&&t.id!==a.id&&lifeStatus(t.state).deteriorating)add('firstAid',{targetId:t.id});
  for(const t of Object.values(battle.actors))if(t.present&&t.state.sleeping)add('wake',{targetId:t.id});
  for(const [eventId,e]of Object.entries(battle.ruleScene?.events??{}))if(e.actorIds?.includes(a.id)&&['extinguish','statusResistance','statusContext','channelFailure','demonGaze','geneticBacklash','passivePerception','projectionEvent'].includes(e.type)&&!a.state.ruleEvents?.includes(eventId))add('statusEvent',{eventId});
  if(a.state.grapple)for(const method of ['strength','agility'])add('escapeGrip',{method});
  for(const targetId of [...new Set(a.claws?.filter(Boolean)??[])]){add('pressGrip',{targetId});add('grappleAttack',{targetId});}
  for(const item of a.state.possessions?.items??[])add(item.location==='phaseRing'?'ringRetrieve':'ringStore',{itemId:item.id});
  for(const [objectId,o]of Object.entries(battle.ruleScene?.objects??{}))if(o.actorIds?.includes(a.id)) {
    if(o.type==='checkContext')for(const [part,p]of Object.entries(o.plans??{}))if(p.purpose==='jump'&&p.takeoff)add('jump',{objectId,part});
    if(o.type==='geneticLock'&&a.state.geneticLock?.active?.[1])add('mechanism',{objectId,operation:'end'});
    if(o.type==='phantomRings'&&a.state.underworld?.objectId===objectId)add('mechanism',{objectId,operation:'exit'});
    if(o.type==='demonBox')for(const operation of ['open','close'])add('mechanism',{objectId,operation});
    if(o.type==='arrays')for(const part of ['physical','spatial'])for(const operation of ['activate','cut'])add('mechanism',{objectId,part,operation});
    if(o.type==='ancientBelt'){for(const part of o.forms??[])for(const operation of ['transform','shift'])add('mechanism',{objectId,operation,part});for(const part of ['sword','gun'])for(const operation of ['drawWeapon','weaponMode'])add('mechanism',{objectId,operation,part});for(const operation of ['defend','garuda','end'])add('mechanism',{objectId,operation});}
    for(const [part,p]of Object.entries(o.plans??{}))for(const operation of p.operations??[])add('mechanism',{objectId,part,operation});
  }
  if(a.abilities.includes('strike'))for(const p of projectionView(battle,a.id))add('destroy',{featureId:p.id});
  for(const f of battle.map?.features??[])if(!f.destroyed&&!f.hiddenFrom?.includes(a.id)) {
    if(f.kind==='door'&&(!f.open||a.controller==='player'))add('door',{featureId:f.id,open:!f.open});
    if(f.durability&&['obstacle','door'].includes(f.kind))add('destroy',{featureId:f.id});
  }
  for(const id of a.abilities) {
    if(['strike','thunder','cleaveRock','lightning','conduct','roar','tornado','aim','timeBolt','timeHaste','shieldPush','calibrate','hypnotize','tentacles','doubleStrike'].includes(id)) {
      for(const t of id==='timeHaste'?Object.values(battle.actors).filter(x=>visibleTo(battle,x,a)&&x.team===a.team):enemies) {
        const variants=['lightning','conduct'].includes(id)?[1,2,3]:[undefined];
        for(const tier of variants) {
          const command={targetId:t.id,...(tier?{tier}:{})};
          add(id,command);
          if(id==='strike'&&a.state.wizard?.weaponDrawn&&a.state.wizard.weaponMode==='gun')add(id,{...command,rapidFire:true});
          if(id==='strike'&&a.state.wizard?.form==='wind'){const adjacentTargetIds=enemies.filter(x=>x.id!==t.id&&spatialDistance(battle.map,x.position,t.position)<=1.5).map(x=>x.id);if(adjacentTargetIds.length)add(id,{...command,adjacentTargetIds});}
          if(id==='doubleStrike')for(const second of enemies)if(second.id!==t.id)add(id,{...command,secondTargetId:second.id});
          if(id==='shieldPush')add(id,{...command,empowered:true});
          if(['thunder','cleaveRock','lightning','conduct'].includes(id)) add(id,{...command,payment:'restraint'});
          if(id==='strike'&&a.kind==='jiang') {
            add(id,{...command,finisher:true});
            add(id,{...command,empowered:true});
            add(id,{...command,empowered:true,finisher:true});
          }
          if(['strike','thunder','cleaveRock'].includes(id)&&['huang','yulin'].includes(a.kind)) add(id,{...command,strength:true});
          if(id==='tornado') add(id,{...command,resource:'魔力'});
        }
      }
    } else if(id==='garudaInterfere'){for(const t of enemies)add(id,{targetId:t.id});
    } else if(['move','step'].includes(id)) {
      const moves=a.state.verticalPosition?.heightAboveGround>0?[]:movementCandidates(battle,a,id,panel(battle,a.id).speed);
      candidates.push(...flightCandidates(battle,a,id));
      candidates.push(...(a.state.wizard?.form==='water'&&id==='move'?moves.map(c=>({...c,block:true})):[]),...moves,...(a.waterRun&&id==='move'?moves.map(c=>({...c,run:true})):[]),...(a.wallClimb?moves.map(c=>({...c,climb:true})):[]));
    } else if(id==='conversion') {if(!battle.reactionWindows) add(id,{enabled:true});}
    else if(id==='flow') {add(id,{tier:1});add(id,{tier:2});}
    else if(id==='readyWeapon')for(const weapon of ['bow','longknife','dagger'])add(id,{weapon});
    else if(id==='releaseGrip')for(const claw of [0,1])add(id,{claw});
    else if(id==='morph')for(const form of ['空','Phantom'])add(id,{form});
    else if(id==='end') {
      let variants=[{}];
      for(const t of Object.values(battle.actors))if(t.present&&lifeStatus(t.state).deteriorating&&t.state.health.B&&t.state.health.L)
        variants=variants.flatMap(v=>['B','L'].map(from=>({...v,[t.id]:from})));
      for(const v of variants)add(id,Object.keys(v).length?{deteriorationChoices:v}:{});
    }
    else if(id==='tengzhuan'||id==='gale') {add(id);add(id,{resource:'魔力'});}
    else if(id==='squeeze') { add(id,{resource:'气'}); add(id,{resource:'斗气'}); }
    else add(id);
  }
  for(const item of a.state.inventory??[]) {
    const extra={medicine:item.name};
    if(item.name==='雪莲子')for(const resource of Object.keys(a.state.resources))add('medicine',{...extra,resource});
    else if(item.name==='药C') {
      add('medicine',{...extra,choice:'heal'});
      for(const [statusIndex]of a.state.statuses.entries())add('medicine',{...extra,choice:'status',statusIndex});
    } else add('medicine',extra);
  }
  if(a.controller==='player'&&willEnhancement(a.state).allowed)for(const c of [...candidates])if((['jump','strike','thunder','cleaveRock','conduct','escapeGrip','pressGrip','hypnotize','shieldPush'].includes(c.abilityId)||c.abilityId==='mechanism'&&c.operation==='defend')&&!c.rapidFire&&!c.adjacentTargetIds?.length)candidates.push({...c,willpower:true});
  if(resourceCapability(a.state,'antiDetection')||(battle.map?.features??[]).some(f=>f.blocksSight&&f.size>=a.state.size*5))for(const c of [...candidates])if(c.abilityId==='move')candidates.push({...c,hide:true});
  for(const c of [...candidates]){const priceRequest=physicalPriceRequest(battle,a,c);if(priceRequest&&!c.rapidFire&&!c.adjacentTargetIds?.length)for(const offer of actionPriceOffers(a.state,priceRequest))candidates.push({...c,actionDiscount:offer.sourceId});}
  return [...new Map(candidates.map(c=>[JSON.stringify(c),c])).values()];
}

export function inspectCommands(battle) {
  const queued=Object.entries(battle.actors).find(([,a])=>a.state.resourceAutomaticEvents?.length);
  if(queued)return {options:[{command:{actorId:queued[0],abilityId:'resumeEffects'},preview:{timing:'续算已锁定自动效果，不扣动作、不重施、不重投已记录骰'}}],unavailable:[]};
  if(['opportunity','paid-movement'].includes(battle.pending?.kind))return {options:['strike','decline'].map(choice=>({
    command:{actorId:battle.pending.awaiting,abilityId:'opportunityReact',choice},
    preview:{timing:battle.pending.kind==='paid-movement'?'跳跃检定与移动支付已保存；选择后续算，不重投或重付':'对方准备离开威胁范围；等待玩家决定是否借机攻击'}})),unavailable:[]};
  if(battle.pending) {
    const a=battle.actors[battle.pending.awaiting];
    const defenses=battle.playerDefenseDeclarations&&a.controller==='player'?['normal',...(a.buffs.block?['block']:[])]:[undefined];
    const grapple=battle.actors[battle.pending.command.actorId]?.kind==='chuul'&&a.controller==='player'?['strength','agility']:[undefined];
    const options=defenses.flatMap(defense=>grapple.flatMap(grappleDefense=>['decline',...(a.abilities.includes('conversion')&&!a.used.damageConversion?['conversion']:[])].map(choice=>({
    command:{actorId:battle.pending.awaiting,abilityId:'react',choice,...(defense?{defense}:{})},
    preview:{timing:'攻击宣言后、掷骰前；未掷骰，未扣攻击资源',cost:choice==='conversion'?'实际受伤才消耗一次场景次数':'不使用'},
  })).map(o=>({...o,command:{...o.command,...(grappleDefense?{grappleDefense}:{})},preview:{...o.preview,...(grappleDefense?{grappleDefense:grappleDefense==='strength'?'力量＋肉搏挣脱':'敏捷＋运动逃脱'}:{})}}))));
    if(willEnhancement(a.state).allowed)for(const option of [...options])options.push({...option,command:{...option.command,willpower:true},preview:{...option.preview,cost:'消耗1意志：本次防御＋3；若效果要求豁免/对抗则该次＋3DP，另加适用基因锁增益'}});
    const unavailable=[];
    for(const [objectId,o]of Object.entries(battle.ruleScene?.objects??{}))if(o.actorIds?.includes(a.id))for(const [part,p]of Object.entries(o.plans??{}))for(const operation of p.operations??[]){
      const command={actorId:a.id,abilityId:'mechanism',objectId,operation,part};
      if(!isReflexResource(battle,command))continue;
      try{const out=resolveStep(battle,command,{playerAuthorized:true,drawDice:()=>Array(1024).fill(1)});options.push({command,preview:previewOutcome(battle,command,out)});}
      catch(error){unavailable.push({abilityId:'mechanism',objectId,operation,status:error.code??'UNAVAILABLE',reason:error.message});}
    }
    return {options,unavailable,additionalDamageSources:Object.fromEntries(Object.entries(battle.actors).map(([id,a])=>[id,additionalDamageCandidates(a.state,battle.activeId)]))};
  }
  const options=[],unavailable=[];
  for(const command of candidatesFor(battle)) {
    try {
      const trial=act(battle,command,{drawDice:()=>Array(1024).fill(1),playerAuthorized:true,deferPlayerDefense:true});
      options.push({command,preview:previewOutcome(battle,command,trial)});
    } catch(error) {
      if(!(error instanceof RuleInputError)&&!(error instanceof IllegalAction)&&!['NEEDS_INPUT','UNAVAILABLE','RULE_UNRESOLVED','RULE_VERSION_MISMATCH'].includes(error.code)) throw error;
      const entry={abilityId:command.abilityId,status:error.code,reason:error.message,...(error.field?{field:error.field}:{}),...(error.choices?{choices:error.choices}:{})};
      if(!unavailable.some(x=>JSON.stringify(x)===JSON.stringify(entry))) unavailable.push(entry);
    }
  }
  return {options,unavailable,additionalDamageSources:Object.fromEntries(Object.entries(battle.actors).map(([id,a])=>[id,additionalDamageCandidates(a.state,battle.activeId)]))};
}
export function legalCommands(battle) {return inspectCommands(battle).options.map(x=>x.command);}

function previewOutcome(b,c,out) {
  const a=b.actors[c.actorId], after=out.battle.actors[a.id], attack=out.result.attack;
  const preview={};
  if(out.result.terrain)preview.terrain={featureId:out.result.terrain.featureId,label:out.result.terrain.label};
  if(c.abilityId!=='end') {
    preview.actions=Object.fromEntries(['standard','move','swift'].map(k=>[k,a.state.turn[k]-after.state.turn[k]]).filter(([,n])=>n>0));
    preview.energy=Object.fromEntries(Object.entries(a.state.resources).map(([k,v])=>[k,v.current-after.state.resources[k].current]).filter(([,n])=>n!==0));
    if(c.payment==='restraint') preview.payment=`精神束缚＋${Math.max(0,...after.state.statuses.filter(s=>s.type==='精神束缚').map(s=>s.points))-Math.max(0,...a.state.statuses.filter(s=>s.type==='精神束缚').map(s=>s.points))}`;
  }
  if(['move','step'].includes(c.abilityId))preview.movement={...movementPurpose(b,c),...(c.flightEnd?{flightEnd:c.flightEnd,velocity:after.state.flightKinematics?.velocity}:{}),cost:out.result.movement?.cost??measurePath(b.map,a.position,c.to,c.via,{ignoreDifficult:a.ignoreDifficult,climb:c.climb}).cost};
  if(attack?.pendingDefense)preview.attack={dp:attack.rawDP,auto:attack.fixed,cap:attack.cap,pendingDefense:true};
  else if(attack) preview.attack={dp:attack.rawDP,auto:attack.fixed,cap:attack.cap,ap:attack.ap,magic:attack.magic,speed:attack.speed,
    ...(attack.defense?{defense:attack.defense.total,rollDP:attack.rawDP-attack.defense.total,defenseAuto:attack.defense.extraSuccesses}:{})};
  if(attack?.decoy)preview.attack.decoy={remainingImages:attack.decoy.remainingBefore,bodyWeight:1,totalWeight:attack.decoy.remainingBefore+1,pending:true};
  if(['block','zheng','tengzhuan','flow','fistQi','breakBody','brace'].includes(c.abilityId)) {
    const p=panel(out.battle,a.id);
    preview.after={attackDP:p.attack.dp,defenseDP:p.defense.total,defenseAuto:p.defense.extraSuccesses,speedM:p.speed};
  }
  if(['gale','roar'].includes(c.abilityId)||c.abilityId==='lightning'&&c.tier===3) {
    preview.affected=potentialTargets(b,c);
    preview.friendlyFire=preview.affected.filter(id=>id!==a.id&&b.actors[id].team===a.team);
  }
  if(['jump','continueJump'].includes(c.abilityId))preview.jump={checkRequired:c.abilityId==='jump',movementBudget:panel(b,a.id).speed,remainingActions:{move:a.state.turn.move,standard:a.state.turn.standard},...(c.abilityId==='continueJump'?{remainingDistance:a.state.paidMotion.remainingDistance}:{}),forecastAfterRoll:true};
  if(out.result.recovery)preview.recovery=out.result.recovery;
  return preview;
}
export function potentialTargets(b,c,{opportunityDeclarations={}}={}) {
  const a=b.actors[c.actorId],target=b.actors[c.targetId], actors=Object.values(b.actors).filter(x=>x.present);
  const d=(x,y)=>spatialDistance(b.map,x.position,y.position);
  if(c.abilityId==='gale') return galeTargets(b,c).map(x=>x.id);
  if(c.abilityId==='strike'&&(c.rapidFire||c.adjacentTargetIds?.length)){const ids=c.rapidFire?rapidFireTargets(b,c).map(x=>x.id):c.adjacentTargetIds;return [...new Set([c.targetId,...ids].flatMap(id=>grappleMembers(b,id,a.id).map(x=>x.id)))];}
  if(target?.state.timedEffects?.wizardDefend?.form==='wind'&&['strike','thunder'].includes(c.abilityId)){const p=attackProfile(b,a.id,c);if(p.ranged&&!p.energyWeapon&&p.rawDP<12)return [a.id];}
  if(c.abilityId==='doubleStrike')return [...new Set([c.targetId,c.secondTargetId??c.targetId])];
  if(c.abilityId==='roar')return roarTargets(b,c).map(x=>x.id);
  if(c.abilityId==='lightning'&&c.tier===3&&target) return actors.filter(x=>d(x,target)<=1.5&&clearLine(b.map,target.position,x.position)).map(x=>x.id);
  if(c.abilityId==='move')return opportunityActors(b,c).some(x=>!b.playerDefenseDeclarations||x.controller!=='player'||opportunityDeclarations[x.id]===true)?[a.id]:[];
  const linked=target?grappleMembers(b,target.id,a.id).map(x=>x.id):[];
  return ['strike','thunder','cleaveRock','lightning','tornado','timeBolt','shieldPush','pressGrip','grappleAttack'].includes(c.abilityId)&&target?[...new Set([target.id,...linked])]:[];
}

export function decisionContext(b,revision,inspection=inspectCommands(b)) {
  const observer=b.actors[b.pending?.awaiting??b.activeId], full=currentContext(b);
  const known=b.knowledge?.[observer.id]??{};
  const visible=Object.values(b.actors).filter(a=>visibleTo(b,a,observer));
  const canSeeStats=id=>id===observer.id||known[id]?.stats===true;
  const participants=visible.map(a=>{
    if(canSeeStats(a.id)) return {...full.participants.find(p=>p.id===a.id),...(projectionAppearance(b,a.id,observer.id)??{})};
    return {id:a.id,name:projectionAppearance(b,a.id,observer.id)?.name??a.name,team:a.team,position:a.position,
      condition:a.state.health.intact===a.state.derived.hpMax?'未见伤势':a.state.health.intact>0?'可见受伤':'倒地',
      observedAbilities:(known[a.id]?.abilities??[]).map(id=>ABILITIES[id]?.name??id)};
  });
  const ids=new Set(inspection.options.map(x=>x.command.abilityId));
  // Keep the actor's preparation abilities available for short-horizon planning.
  for(const id of observer.abilities) if(['fistQi','breakBody','tengzhuan','reload','draw'].includes(id)) ids.add(id);
  const previews=[];
  const legalOptions=inspection.options.map(({command,preview})=>{
    const {actorId,...choice}=command, p=structuredClone(preview);
    if(p.attack&&!canSeeStats(command.targetId)) {delete p.attack.defense;delete p.attack.rollDP;delete p.attack.defenseAuto;p.attack.targetDefense='未知';}
    if(p.affected) p.affected=p.affected.filter(id=>visible.some(a=>a.id===id));
    if(p.friendlyFire) p.friendlyFire=p.friendlyFire.filter(id=>visible.some(a=>a.id===id));
    for(const key of ['actions','energy']) if(p[key]&&!Object.keys(p[key]).length) delete p[key];
    if(p.attack) {
      const x=p.attack;
      p.attack=[`${x.dp}DP`,`自动${x.auto}`,`上限${x.cap}`,
        ...(x.rollDP!==undefined?[`对位投骰${x.rollDP}DP`,`防御附成${x.defenseAuto}`]:[]),
        ...(x.ap?[`破甲${x.ap}`]:[]),...(x.magic?[`破魔${x.magic}`]:[]),...(x.speed?[`高速${x.speed}`]:[])].join('，');
    }
    const key=JSON.stringify(p);
    let index=previews.findIndex(x=>JSON.stringify(x)===key);
    if(index<0) {index=previews.length;previews.push(p);}
    return {...choice,preview:index};
  });
  return {scenario:b.scenario,round:b.round,activeId:observer.id,revision,status:b.status,
    ...(observer.unsupportedActions?{unsupportedActions:observer.unsupportedActions}:{}),
    phase:b.pending?'reaction':'action',participants,projections:projectionView(b,observer.id),legalOptions,previews,
    tactics:observer.tactics??{intent:'engage',recent:[]},terrain:mapView(b,observer.id)?.features??[],
    lastSeen:lastSeenFoes(b,observer),vagueObservations:mapView(b,observer.id)?.vagueObservations??[],pendingPerceptions:Object.values(observer.state.resourcePendingPerceptions??{}),
    abilities:Object.fromEntries([...ids].map(id=>[id,observer.abilityDefinitions?.[id]??(id==='block'?{...ABILITIES.block,
      action:observer.kind==='huang'?'自由':'移动',
      text:`获得${blockValue(observer)}格挡加值，持续至下次本人行动开始；须能行动并具备相应武器。`}:ABILITIES[id])])),
    unavailable:inspection.unavailable.filter(x=>x.status==='NEEDS_INPUT'),
    notes:'仅明确共享或已知数值可见；未知防御不能当作0。选项preview是previews下标，为支出预览而非伤害结果。affected是逐一受影响者，friendlyFire是其中会一并受到攻击的友军；狂岚仅选合法敌人，咆哮不自动避开友军，选招须按实际列表权衡友伤。',
    ...(b.pending?{incoming:{actorId:b.pending.command.actorId,abilityId:b.pending.command.abilityId}}:{})};
}

export function createCombatRuntime({mvu,getAnchor,expectedChatId,drawDice}) {
  const environment={mvu,getAnchor,expectedChatId};
  return {
    initialize(battle) {
      battle=structuredClone(battle);schedulePassivePerception(battle,{drawDice:drawDice??randomDice,reason:'combat-initialize'});
      return initializeTestState({...environment,battle,
        actors:Object.fromEntries(Object.entries(battle.actors).map(([id,a])=>[id,{name:a.name,state:a.state}]))});
    },
    read() { return readCombat(environment); },
    context() { const {battle,revision}=readCombat(environment); return {...currentContext(battle),revision}; },
    dispatch({operationId,expectedRevision,command,playerAuthorized=false}) {
      return settleCombat({...environment,operationId,expectedRevision,command,
        reduce:(b,c)=>resolveStep(b,c,{drawDice,playerAuthorized})});
    },
    enter({operationId,expectedRevision,battle}) {
      return settleCombat({...environment,operationId,expectedRevision,command:{kind:'enter',encounterId:battle.id},
        createBattle:root=>{
          if(root.battle?.status==='active'||root.battle?.pending) throw new Error('仍有进行中的战斗');
          const next=structuredClone(battle);
          for(const [id,a] of Object.entries(next.actors)) if(root.actors[id]) {
            a.state=structuredClone(root.actors[id].state);a.state.turn=freshTurn();delete a.state.resourceTurnOrder;
            const prior={...root.battle?.actors[id],...root.actors[id].combatCarry};
            for(const key of ['equipment','parameters','ammunition','loaded','weaponMode','squeezed','recoveryLocks','knownWeaknesses','weaponSize','claws','form','underground','weaponsAvailable']) if(prior?.[key]!==undefined) a[key]=structuredClone(prior[key]);
            if(a.ruleset==='opening-20261022'&&prior?.durationCarry) {
              a.durationCarry=structuredClone(prior.durationCarry);
              for(const [key,effect]of Object.entries(a.durationCarry))if(effect.remainingRounds>0){a.buffs[key]=effect.value;(a.expires??={})[key]=next.round+effect.remainingRounds;}
            }
            if(a.ruleset==='opening-20261022') {
              const oldScene=prior.sceneInstanceId??root.battle?.sceneInstanceId??root.encounterBindings?.find(x=>x.id===root.battle?.id)?.instanceId??root.battle?.id;
              if(oldScene===next.sceneInstanceId&&prior.used)a.used=structuredClone(prior.used);
              a.sceneInstanceId=next.sceneInstanceId;
              if(prior.cooldownCarry){a.cooldownCarry=structuredClone(prior.cooldownCarry);for(const [key,effect]of Object.entries(a.cooldownCarry))if(effect.remainingRounds>0)a.cooldowns[key]=next.round+effect.remainingRounds;}
            }
          }
          for(const [id,a]of Object.entries(next.observers??{}))if(root.actors[id]?.state)a.state=structuredClone(root.actors[id].state);
          for(const a of Object.values(next.actors)){refreshDerived(a);syncVerticalPosition(a);}
          next.order.sort((x,y)=>panel(next,y).initiative-panel(next,x).initiative||Number(!!resourceCapability(next.actors[y].state,'initiativeTiePriority'))-Number(!!resourceCapability(next.actors[x].state,'initiativeTiePriority')));
          next.activeId=next.order.find(id=>panel(next,id).life==='可行动');
          if(!next.activeId) throw new Error('没有可行动的参战者');
          next.actors[next.activeId].state=beginTurn(next.actors[next.activeId].state).state;
          schedulePassivePerception(next,{drawDice:drawDice??randomDice,reason:'combat-enter'});
          next.mode='combat';return next;
        },reduce:b=>({battle:b,result:stateResult(b,b.activeId,'enter',['进入战斗；沿用现有伤势与能量'])})});
    },
    leave({operationId,expectedRevision}) {
      return settleCombat({...environment,operationId,expectedRevision,command:{kind:'leave'},reduce:b=>{
        if(b.status!=='finished'||b.pending) throw new Error('须先结束战斗与待定反应');
        b.mode='story';
        for(const a of Object.values(b.actors)) {
          if(a.sceneBound)a.present=false;
          const retained={};
          if(a.ruleset==='opening-20261022') {
            a.durationCarry={};
            for(const key of ['flow','tengzhuan'])if(a.buffs[key]&&a.expires?.[key]>b.round){retained[key]=a.buffs[key];a.durationCarry[key]={value:a.buffs[key],remainingRounds:a.expires[key]-b.round,needsHostTimeAccounting:true};}
            a.cooldownCarry=Object.fromEntries(Object.entries(a.cooldowns).filter(([,expiry])=>expiry>b.round)
              .map(([key,expiry])=>[key,{remainingRounds:expiry-b.round,needsHostTimeAccounting:true}]));
            a.sceneInstanceId=b.sceneInstanceId??b.id;
          }
          a.buffs=retained;a.combos={};if(a.ruleset!=='opening-20261022')a.cooldowns={};a.state.turn=freshTurn();a.reactions.damageConversion=false;
          delete a.aim;delete a.calibration;delete a.buffs.brace;delete a.expires;delete a.initiativeOverride;
          delete a.defenseIntent;delete a.state.resourceTurnOrder;
        }
        return {battle:b,result:stateResult(b,b.activeId,'leave',['返回剧情；保留伤势、能量和恢复限制'])};
      }});
    },
    installMap({operationId,expectedRevision,map}) {
      return settleCombat({...environment,operationId,expectedRevision,command:{kind:'map',map},reduce:b=>{
        if(b.map)throw new Error('场景地图已建立，不自动重画');
        b.map=normalizeMap(map,b);
        return {battle:b,result:stateResult(b,b.activeId,'map',['建立固定场景地图，人物与动作不变'])};
      }});
    },
    updateMap({operationId,expectedRevision,changes}) {
      return settleCombat({...environment,operationId,expectedRevision,command:{kind:'mapUpdate',changes},reduce:b=>{
        if(!b.map||b.pending)throw new Error('地图未建立或仍有待定行动');
        const next=structuredClone(b.map);
        for(const change of changes) {
          const feature=next.features.find(f=>f.id===change.id);
          if(!feature||Object.keys(change).some(k=>!['id','open','hiddenFrom','remove','durability','locked'].includes(k)))throw new Error('仅更新已确认地形的门、可见状态与破坏参数');
          if(change.remove===true){next.features=next.features.filter(f=>f.id!==change.id);continue;}
          if(change.open!==undefined){if(feature.kind!=='door'||typeof change.open!=='boolean')throw new Error('门状态无效');feature.open=change.open;}
          if(change.hiddenFrom!==undefined)feature.hiddenFrom=change.hiddenFrom;
          if(change.locked!==undefined){if(feature.kind!=='door'||typeof change.locked!=='boolean')throw new Error('门锁状态无效');feature.locked=change.locked;}
          if(change.durability!==undefined){if(feature.destroyed)throw new Error('已破坏地形不能通过补参复原');feature.durability=change.durability;}
        }
        b.map=normalizeMap(next,b);
        return {battle:b,result:stateResult(b,b.activeId,'mapUpdate',['已确认的场景变化写入地图'])};
      }});
    },
    supplyParameters({operationId,expectedRevision,actorId,values}) {
      const integerKeys=['bowStrength','weaponSize','flowMax','flowCurrent','ammunition','preActionDC'];
      for(const [k,v] of Object.entries(values)) {
        if(integerKeys.includes(k)?!Number.isInteger(v)||v<0:k==='flowAction'?!['standard','move','swift','free'].includes(v):true)
          throw new Error('主持参数只接受已列出的缺项与合法值');
      }
      return settleCombat({...environment,operationId,expectedRevision,command:{kind:'parameters',actorId,values},reduce:b=>{
        if(b.pending) throw new Error('待定攻击期间不能修改参数');
        const a=b.actors[actorId];if(!a) throw new Error('未知参战者');
        a.parameters={...a.parameters,...values};
        if(values.weaponSize!==undefined) a.weaponSize=values.weaponSize;
        if(values.ammunition!==undefined) a.ammunition=values.ammunition;
        if(values.flowMax!==undefined||values.flowCurrent!==undefined) {
          const current=values.flowCurrent??a.state.resources.流风?.current;
          if(!Number.isInteger(current)||!Number.isInteger(a.parameters.flowMax)||current>a.parameters.flowMax) throw new Error('流风必须同时有有效的当前值和上限');
          a.state.resources.流风={current,max:a.parameters.flowMax};
        }
        return {battle:b,result:stateResult(b,actorId,'parameters',['主持已补齐指定参数'])};
      }});
    },
  };
}

export async function chooseAction(runtime,generateRaw,{rejection=null}={}) {
  const {battle,revision}=runtime.read();
  const inspection=tacticalInspection(battle,inspectCommands(battle));
  const context=decisionContext(battle,revision,inspection);
  if(context.status!=='active') throw new Error('Combat is not active');
  const actor=context.participants.find(a=>a.id===context.activeId);
  if(actor.controller==='player') return {status:'awaiting_player',actorId:actor.id};
  const options=inspection.options.map(o=>o.command);
  if(!options.length) throw new Error('没有合法行动，需主持处理当前状态');
  const prompt=JSON.stringify(context);
  const text=await generateRaw({
    should_stream:false,should_silence:true,max_chat_history:0,
    ordered_prompts:[{role:'system',content:TACTICS+'\n从legalOptions选择一项。只返回{"option":从0开始的下标}。若本轮准备攻击，先考虑能影响该攻击的自由/迅捷增益；格挡不得抢占本轮接近后攻击所需的动作；标准动作增益会占用本轮攻击。装填、射距、友伤与退路优先核实。反应阶段按威胁和剩余生命决定是否使用转换。未知对手数值不是0。tactics保留实际近期动作与意图；延续尚未完成的接近、准备或恢复计划。移动预览列出明确用途与移动后距离。近战已贴身时优先压制、格挡、增益或结束，不在出拳后习惯性撤步；弓手脱离干扰、重伤恢复和借掩体撤离仍可用。无需花完所有动作，完成有用动作后选end。end只结束本人当前回合，之后继续交锋；concede是明确认输并结束整场，放弃本场胜负。只有自身重伤、已无作战手段等可说明的实际败势才考虑认输；未上箭但有箭可装填不是败势。'},'user_input'],
    user_input:prompt+(rejection?`\n上一选择未执行：${rejection}。重新选合法动作。`:''),
  });
  const trimmed=text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
  let selection;
  try {selection=JSON.parse(trimmed);}
  catch {throw new IllegalAction('模型须返回含option编号的JSON');}
  if(!Number.isInteger(selection?.option)||!options[selection.option]) throw new IllegalAction('模型须选择当前合法选项编号');
  const command=options[selection.option];
  return {command,expectedRevision:context.revision,promptChars:prompt.length};
}
