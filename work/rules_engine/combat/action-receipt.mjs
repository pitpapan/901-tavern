import {equipment} from './mechanics.mjs';

// Captured by the transaction, never parsed from the narrator's prose.
export function actionReceipt(before,after,c,result){
 const a=before.actors[c.actorId],z=after.actors[c.actorId];
 const spent=c.abilityId==='end'?{}:Object.fromEntries(['standard','move','swift'].map(k=>[k,Math.max(0,(a.state.turn[k]??0)-(z.state.turn[k]??0))]).filter(([,n])=>n));
 if(!a.state.turn.reactionLock&&z.state.turn.reactionLock)spent.reflex=1;
 const resources=Object.entries(a.state.resources).flatMap(([name,v])=>{const n=v.current-(z.state.resources[name]?.current??v.current);return n>0?[{name,quantity:n}]:[];});
 const items=(a.state.inventory??[]).flatMap(item=>{const next=(z.state.inventory??[]).find(x=>x.name===item.name),n=item.quantity-(next?.quantity??0);return n>0?[{name:item.name,quantity:n}]:[];});
 const ammoBefore=a.ammunition??a.state.ammunition,ammoAfter=z.ammunition??z.state.ammunition;
 // Other ammo layouts remain represented by the attack receipt, not guessed.
 if(typeof ammoBefore==='number'&&typeof ammoAfter==='number'&&ammoBefore>ammoAfter)items.push({name:'弹药',quantity:ammoBefore-ammoAfter});
 return {actions:spent,resources,items,...(c.targetId?{targetId:c.targetId}:{}),willSpent:Math.max(0,a.state.will.current-z.state.will.current),
  ...(result.attack?{weapon:equipment(a).weapon.name??a.visibleArms??'当前实际武器'}:{}),
  ...(result.itemUse?{itemUse:result.itemUse}:{}),
  movement:result.movement?.length??0,forcedMovement:result.forcedMovement,
  remaining:Object.fromEntries(['standard','move','swift'].map(k=>[k,z.state.turn[k]??0]))};
}
