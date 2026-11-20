import {limbEffects} from '../status-rules.mjs';
import {weaponInstance,availableWeaponHands} from '../resource-weapons.mjs';
import {RuleInputError,IllegalAction,equipment} from './mechanics.mjs';
import {canObserve,clearLine,spatialDistance} from './map.mjs';

const requireThat=(ok,message)=>{if(!ok)throw new IllegalAction(message);};
// RE 战斗开始: 拾取物品4AP（原版移动动作）; 物品和装备位: 手持物。
// Storage holder identifies the existing instance, not a transfer of legal ownership.
export function groundWeaponChoices(b,a){
 const choices=[];
 for(const holder of Object.values(b.actors))for(const item of holder.state.possessions?.items??[]){
  if(!item.source||item.location!=='ground'||item.held||item.destroyed||!Array.isArray(item.position))continue;
  try{weaponInstance(holder.state,item.id);}catch{continue;}
  if(spatialDistance(b.map,a.position,item.position)>a.reach+1e-8||!clearLine(b.map,a.position,item.position))continue;
  const object={id:`ground:${holder.id}:${item.id}`,present:true,position:item.position,hiddenFrom:item.hiddenFrom,state:{},spirit:item.spirit,underground:item.underground};
  if(!canObserve({...b,actors:{...b.actors,[object.id]:object}},object,a.id))continue;
  choices.push({fromActorId:holder.id,itemId:item.id});
 }
 return choices;
}

export function pickupGroundWeapon(b,a,c,spend){
 requireThat(groundWeaponChoices(b,a).some(x=>x.fromActorId===c.fromActorId&&x.itemId===c.itemId),'须可见、可及且完好的实际落地武器');
 const holder=b.actors[c.fromActorId],item=weaponInstance(holder.state,c.itemId);
 if(typeof item.oneHanded!=='boolean')throw new RuleInputError('须实际武器的单手／双手要求','item.oneHanded');
 const hands=item.oneHanded?1:2;
 requireThat(availableWeaponHands(a,limbEffects)>=hands,'没有足够的可用空闲手');
 // Picking up must not silently replace another active weapon (RE switching rule).
 requireThat(!a.state.equippedWeaponId&&(a.state.combatManeuvers?.weaponUnavailable||equipment(a).weapon?.skill==='肉搏'),'已有生效武器；须先明确处理原武器，不能用拾取免费切换');
 requireThat(holder===a||!(a.state.possessions?.items??[]).some(x=>x.id===item.id),'目标角色已有同编号实例，不能复制或覆盖');
 spend('move');
 if(holder!==a){holder.state.possessions.items=holder.state.possessions.items.filter(x=>x!==item);(a.state.possessions??={}).items??=[];a.state.possessions.items.push(item);}
 item.location='carried';item.held=true;delete item.position;delete item.hiddenFrom;
 item.grip={hands,source:'RE手持物；按实例原本持握要求拾取'};
 a.state.equippedWeaponId=item.id;
 if(item.resourceId)(a.state.equippedResources??={}).weapon=item.resourceId;else if(a.state.equippedResources)delete a.state.equippedResources.weapon;
 if(a.state.combatManeuvers)delete a.state.combatManeuvers.weaponUnavailable;
 a.sheathed=false;
 return {operation:'pickup',fromActorId:holder.id,itemId:item.id,name:item.name,action:'move',hands,equipped:true};
}
