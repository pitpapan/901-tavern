import {ok,fail,object,equal,shape,identifier,pointer,validateRuntimeState} from './contracts.js';
const decode=p=>p.split('/').slice(1).map(k=>k.replaceAll('~1','/').replaceAll('~0','~'));
function allowed(parts,state){
  if(state.schemaVersion==='runtime/0.5'&&(parts.length===1&&['inventory','learningLedger'].includes(parts[0])||parts.length===2&&parts[0]==='actors'&&!Object.hasOwn(state.actors,parts[1])&&identifier(parts[1])))return true;
  if(state.schemaVersion==='runtime/0.5'&&parts.length===2&&parts[0]==='clock'&&parts[1]==='turnSerials')return true;
  if(state.lifecycle&&parts.length===1&&parts[0]==='lifecycle')return true;
  if(state.schemaVersion&&parts.length===1&&parts[0]==='pendingChoices')return true;
  if(state.schemaVersion&&parts.length===2&&parts[0]==='clock'&&parts[1]==='actionSerials')return true;
  if(parts.length===1&&['encounter','consumedBoundaryIds'].includes(parts[0]))return true;
  if(parts[0]==='scene'&&parts.length===2&&['id','advancementOpen'].includes(parts[1]))return true;
  if(parts[0]==='clock'&&((parts.length===2&&parts[1]==='worldMinutes')||(parts.length===3&&parts[1]==='turnSerials'&&Object.hasOwn(state.actors,parts[2]))))return true;
  if(parts[0]!=='actors'||!Object.hasOwn(state.actors,parts[1]))return false;
  const [,,field]=parts;
  return parts.length===3&&['xp','powerPoints','health','effects','conditions','defense','protections','referenceAbilities','abilities','equipment','statuses','attributeDamage','geneLock','attributeLoss'].includes(field)||parts.length===4&&['attributes','mainSkills','resources'].includes(field)||parts.length===5&&field==='subskills'&&parts[4]==='rank'||parts.length===5&&field==='resources'&&parts[4]==='current';
}
export function applyChanges(state,changes,{ruleset}={}){
  const validated=validateRuntimeState(state,{ruleset});if(!validated.ok)return validated;
  if(!Array.isArray(changes))return fail('INVALID_CHANGE','','changes需数组');const next=structuredClone(state);
  for(const c of changes){
    if(!shape(c,['path','before','after'])||typeof c.path!=='string'||!c.path.startsWith('/'))return fail('INVALID_CHANGE','','只接受登记路径的before/after');
    const parts=decode(c.path);if(!allowed(parts,next))return fail('UNREGISTERED_STATE_PATH',c.path,'未登记的状态路径');
    let parent=next;for(const k of parts.slice(0,-1)){if(!object(parent)||!Object.hasOwn(parent,k))return fail('INVALID_CHANGE',c.path,'状态路径不存在');parent=parent[k];}
    const key=parts.at(-1);if(state.schemaVersion==='runtime/0.5'&&parts.length===2&&parts[0]==='actors'&&!Object.hasOwn(parent,key)&&c.before===null){Object.defineProperty(parent,key,{value:structuredClone(c.after),writable:true,enumerable:true,configurable:true});continue;}if(!object(parent)||!Object.hasOwn(parent,key)||!equal(parent[key],c.before))return fail('STATE_BEFORE_MISMATCH',c.path,'before不匹配，整笔未提交');
    Object.defineProperty(parent,key,{value:structuredClone(c.after),writable:true,enumerable:true,configurable:true});
  }
  return validateRuntimeState(next,{ruleset});
}
export function diffStates(before,after){
  const changes=[],add=(parts,a,b)=>{if(!equal(a,b))changes.push({path:'/'+parts.map(pointer).join('/'),before:structuredClone(a),after:structuredClone(b)});};
  if(before.schemaVersion==='runtime/0.5'){for(const [id,a] of Object.entries(after.actors))if(!Object.hasOwn(before.actors,id))add(['actors',id],null,a);for(const key of ['inventory','learningLedger'])add([key],before[key],after[key]);}
  for(const [id,a] of Object.entries(before.actors)){
    const b=after.actors[id];for(const k of ['xp','powerPoints','health','effects','conditions','defense','protections','abilities','equipment'])add(['actors',id,k],a[k],b[k]);
    if(Object.hasOwn(a,'referenceAbilities'))add(['actors',id,'referenceAbilities'],a.referenceAbilities,b.referenceAbilities);
    for(const k of ['statuses','attributeDamage','geneLock','attributeLoss'])if(Object.hasOwn(a,k))add(['actors',id,k],a[k],b[k]);
    for(const k of ['attributes','mainSkills'])for(const sub of Object.keys(a[k]))add(['actors',id,k,sub],a[k][sub],b[k][sub]);
    for(const sub of Object.keys(a.subskills))add(['actors',id,'subskills',sub,'rank'],a.subskills[sub].rank,b.subskills[sub].rank);
    for(const r of Object.keys(a.resources)){if(!equal(a.resources[r].max,b.resources[r].max))add(['actors',id,'resources',r],a.resources[r],b.resources[r]);else add(['actors',id,'resources',r,'current'],a.resources[r].current,b.resources[r].current);}
  }
  for(const key of ['id','advancementOpen'])add(['scene',key],before.scene[key],after.scene[key]);
  add(['clock','worldMinutes'],before.clock.worldMinutes,after.clock.worldMinutes);
  if(before.schemaVersion){add(['clock','actionSerials'],before.clock.actionSerials,after.clock.actionSerials);add(['pendingChoices'],before.pendingChoices,after.pendingChoices);}
  if(before.schemaVersion==='runtime/0.5')add(['clock','turnSerials'],before.clock.turnSerials,after.clock.turnSerials);
  else for(const id of Object.keys(before.clock.turnSerials))add(['clock','turnSerials',id],before.clock.turnSerials[id],after.clock.turnSerials[id]);
  if(before.lifecycle)add(['lifecycle'],before.lifecycle,after.lifecycle);
  for(const key of ['encounter','consumedBoundaryIds'])add([key],before[key],after[key]);return changes;
}
export function replayEvents(initialState,events,revision,{ruleset}={}){
  let state=structuredClone(initialState);for(const e of events.filter(e=>e.revision<=revision)){const r=applyChanges(state,e.changes,{ruleset});if(!r.ok)return r;state=r.value;}return ok(state);
}
