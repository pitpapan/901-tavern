// Actual action slots and known raw-price identities. These are consumer metadata,
// not model-supplied numbers. Unmodified actions keep their own timing and effects.
import {combatRoundKey} from '../resource-action-pricing.mjs';
import {equipment} from './mechanics.mjs';
import {ordinaryWeaponType,weaponAmmoSpec} from '../resource-weapons.mjs';
import {MEDICINES} from '../recovery.mjs';
export const PHYSICAL_ACTIONS={
 strike:'attack',thunder:'attack',cleaveRock:'attack',lightning:'attack',conduct:'attack',destroy:'attack',
 move:'move',step:'fiveFootStep',jump:'move',continueJump:'move',draw:'move',sheathe:'move',
 roar:['full','swift'],doubleStrike:['full','swift'],tornado:'attack',gale:'attack',zheng:'move',
 aim:'standard',door:'move',shieldPush:'standard',calibrate:'full',drawClub:'move',readyBow:'move',
 stowWeapon:'move',readyWeapon:'move',wake:'standard',firstAid:'full',escapeGrip:'attack',pressGrip:'attack',
 tentacles:'standard',releaseGrip:'free',garudaInterfere:'attack',
 block:'dynamic',reload:'dynamic',medicine:'dynamic',grappleAttack:'dynamic',garudaHide:'dynamic'
};
const attackIds=new Set(['strike','thunder','cleaveRock','lightning','conduct','destroy','tornado','gale']);
export function physicalPriceRequest(root,actor,command,actualKind){
 const id=command.abilityId;if(!Object.hasOwn(PHYSICAL_ACTIONS,id))return null;
 let kind=actualKind??PHYSICAL_ACTIONS[id];
 if(kind==='dynamic'){
  if(id==='block')kind=actor.state.wizard?.form==='water'?'swift':actor.kind==='huang'&&actor.ruleset!=='opening-20261022'?'free':'move';
  if(id==='reload')kind=weaponAmmoSpec(actor,equipment(actor).weapon)?.loadingAction??'swift';
  if(id==='medicine')kind=MEDICINES[command.medicine]?.action;
  if(id==='grappleAttack')kind=root.actors[command.targetId]?.state.grapple?.pressed?'standard':'full';
  if(id==='garudaHide')kind=actor.parameters?.garudaActions?.garudaHide?.action;
 }
 let action=id;
 if(attackIds.has(id))action=ordinaryWeaponType(equipment(actor).weapon)==='natural'?'naturalAttack':'weaponAttack';
 else if(['draw','readyWeapon','drawClub'].includes(id))action='drawWeapon';
 else if(['jump','continueJump'].includes(id))action='move';
 else if(id==='reload')action='loadBow';
 else if(id==='zheng')action='block';
 return {action,kind,family:'physical',roundKey:combatRoundKey(root),...(command.actionDiscount?{sourceId:command.actionDiscount}:{})};
}
