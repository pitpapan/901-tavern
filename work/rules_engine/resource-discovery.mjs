// Discovery is a historical fact. It never grants current sight or erases memory
// when the target moves. The policy for enhanced surprise after re-hiding is separate.
import {lifeStatus} from './core.mjs';
const battleId=root=>root.instanceId??root.id??'current';
export function rememberDiscovery(root,{observerId,targetId,source,information,historical=false}){
 if(!information?.detected||!['exact','vague'].includes(information.precision))return;
 const state=root.actors[observerId]?.state;if(!state)return;
 const record=(state.resourceDiscoveries??={})[targetId]??={everLocated:true,firstSource:source};
 record.lastObservation={source,precision:information.precision,historical,...(information.position?{position:structuredClone(information.position)}:{}),...(Number.isInteger(root.round)?{battleId:battleId(root),round:root.round}:{})};
}
export function discloseAttackOrigin(root,observerId,targetId,{source,position}={}){
 const observer=root.actors[observerId],target=root.actors[targetId];
 if(!observer?.state||!target?.state||observer.state.sleeping||['dead','unconscious'].includes(lifeStatus(observer.state).state))return null;
 const information={detected:true,precision:'vague',position:structuredClone(position??target.position)};
 rememberDiscovery(root,{observerId,targetId,source,information});
 const clue={source,targetId,position:information.position,precision:'vague',battleId:battleId(root),round:root.round,movementSerial:target.state.resourceMovementSerial??0};
 (observer.state.resourceLocationClues??={})[targetId]=clue;return structuredClone(clue);
}
export function validLocationClue(root,observerId,targetId){
 const clue=root.actors[observerId]?.state?.resourceLocationClues?.[targetId],target=root.actors[targetId];
 return clue&&target?.present!==false&&clue.battleId===battleId(root)&&clue.movementSerial===(target.state.resourceMovementSerial??0)&&JSON.stringify(clue.position)===JSON.stringify(target.position)?clue:null;
}
export function recordActualMovements(before,after,command,result){
 for(const [id,a]of Object.entries(after.actors)){
  const old=before.actors[id];if(!old?.position||!a.position)continue;
  if(JSON.stringify(old.position)===JSON.stringify(a.position)&&!(id===command.actorId&&result.movement?.length>0))continue;
  a.state.resourceMovementSerial=(a.state.resourceMovementSerial??0)+1;
  // Q43: actual own-turn motion has a durable turn serial; forced motion
  // remains evidence but does not count as voluntary passive hiding motion.
  (a.state.resourceMovementHistory??=[]).push({source:'js/'+command.abilityId,battleId:battleId(after),round:after.round,turnSerial:a.state.resourceTurnSerial??0,voluntary:id===command.actorId&&before.activeId===id,from:[...old.position],to:[...a.position],...(id===command.actorId&&result.movement?{length:result.movement.length,...(result.movement.speed!==undefined?{speed:result.movement.speed}:{})}:{}),serial:a.state.resourceMovementSerial});
 }
}
export function hidingMovementPenalty(root,targetId,{active=false}={}){
 const state=root.actors[targetId]?.state;
 const records=(state?.resourceMovementHistory??[]).filter(x=>x.battleId===battleId(root)&&x.length>0&&(active?x.round>=root.round-1&&x.round<=root.round:x.voluntary&&x.turnSerial===(state.resourceTurnSerial??0)));
 if(!records.length)return {penalty:0,distance:0,source:'RE/侦测与定位+901/Q43'};
 if(records.some(x=>!Number.isFinite(x.speed))){const e=new Error('该移动路径尚未接入实际速度记录，属于执行器缺口');e.code='IMPLEMENTATION_GAP';e.field='perception.movementSpeedCapture';throw e;}
 const distance=records.reduce((n,x)=>n+x.length,0),speed=records.at(-1).speed;
 return {penalty:Math.floor(Math.max(0,distance-speed/2)+1e-9),distance,speed,source:'RE/侦测与定位+901/Q43',serials:records.map(x=>x.serial)};
}

export function recordSensoryCue(root,actorId,cue){
 if(!Number.isInteger(root.round))return; // Field sound clock is a separate consumer.
 if(!cue?.source||cue.kind!=='sound'||!['unavoidable','possible'].includes(cue.suppression))throw Error('声音须实际来源和是否可抑制');
 const state=root.actors[actorId].state;
 state.resourceSensoryCues=(state.resourceSensoryCues??[]).filter(x=>x.battleId===battleId(root)&&x.round>=root.round-1);
 state.resourceSensoryCues.push({...structuredClone(cue),battleId:battleId(root),round:root.round});
}
export function recentSound(root,targetId){
 const rows=(root.actors[targetId]?.state.resourceSensoryCues??[]).filter(x=>x.source&&x.kind==='sound'&&x.battleId===battleId(root)&&x.round>=root.round-1&&x.round<=root.round);
 return rows.find(x=>x.suppression==='unavoidable')??rows.find(x=>x.suppression==='possible');
}
