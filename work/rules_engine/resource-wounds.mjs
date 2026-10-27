import {weightedDraw} from './rule-random.mjs';
// Source-aware wound shares. health and this ledger are updated in the same
// transaction; legacy actor locks are input once, then a compatibility view.
const severities=['B','L','A'];
export function assertWoundLedger(state){
 const ledger=state.woundLedger;if(!ledger)return;
 for(const severity of severities){
  const total=ledger.batches.filter(b=>b.severity===severity).reduce((n,b)=>n+b.count,0);
  if(total!==state.health[severity])throw Error('伤势来源账本与实际伤型数量不一致：'+severity);
 }
}
export function ensureWoundLedger(state,locks=[]){
 if(state.woundLedger){assertWoundLedger(state);return state.woundLedger;}
 const ledger={version:1,nextId:0,batches:[]};
 for(const severity of severities){
  const rows=locks.filter(x=>x.severity===severity&&x.count>0),locked=rows.reduce((n,x)=>n+x.count,0);
  if(locked>state.health[severity]){const e=new Error('旧恢复锁数量超过实际伤型，须核对存档事实');e.code='NEEDS_INPUT';e.field='wounds.migration';throw e;}
  if(state.health[severity]>locked)ledger.batches.push({id:'legacy/'+ledger.nextId++,severity,count:state.health[severity]-locked,origin:{kind:'legacy-unattributed'},restrictions:[]});
  for(const {severity,count,...restriction}of rows)ledger.batches.push({id:'legacy/'+ledger.nextId++,severity,count,origin:restriction.source?{source:restriction.source}:{kind:'legacy-unattributed'},restrictions:restriction.restrictions??[restriction]});
 }
 state.woundLedger=ledger;return ledger;
}
export function projectRecoveryLocks(state){
 return state.woundLedger?.batches.filter(b=>b.restrictions.length).map(b=>({severity:b.severity,count:b.count,...(b.restrictions.length===1?b.restrictions[0]:{restrictions:structuredClone(b.restrictions)})}));
}
export function syncActorWounds(actor){
 if(!actor.recoveryLocks&&actor.combatCarry?.recoveryLocks)actor.recoveryLocks=structuredClone(actor.combatCarry.recoveryLocks);
 if(!actor.state.woundLedger&&actor.recoveryLocks?.some(x=>x.count>0))ensureWoundLedger(actor.state,actor.recoveryLocks);
 if(actor.state.woundLedger){assertWoundLedger(actor.state);actor.recoveryLocks=projectRecoveryLocks(actor.state);if(actor.combatCarry)actor.combatCarry.recoveryLocks=structuredClone(actor.recoveryLocks);}
}
export function transitionWoundShare(state,from,to,{restriction,origin,drawDice}={}){
 if(!state.woundLedger&&!restriction)return;
 const ledger=ensureWoundLedger(state),rows=ledger.batches.filter(b=>b.severity===from&&b.count>0);
 let selected,selection,restrictions=[],previousOrigin;
 if(from!=='intact'){
  const ordinary=rows.filter(b=>!b.restrictions.length),candidates=ordinary.length?ordinary:rows;
  if(!candidates.length)throw Error('伤势来源份额缺失');
  if(!ordinary.length&&candidates.length>1){
   const {index,...receipt}=weightedDraw(candidates.map(b=>b.count),drawDice,{field:'wounds.dice'});
   selected=candidates[index];
   selection={...receipt,candidates:candidates.map(b=>b.id),selectedId:selected.id};
   ledger.lastSelection={sequence:(ledger.lastSelection?.sequence??0)+1,...structuredClone(selection)};
  }else selected=candidates[0];
  restrictions=structuredClone(selected.restrictions);previousOrigin=selected.origin;selected.count--;
 }
 if(restriction&&!restrictions.some(x=>JSON.stringify(x)===JSON.stringify(restriction)))restrictions.push(structuredClone(restriction));
 if(to!=='intact'){
  const source=origin??previousOrigin??{kind:'unattributed-event'};
  const same=ledger.batches.find(b=>b.severity===to&&JSON.stringify(b.restrictions)===JSON.stringify(restrictions)&&JSON.stringify(b.origin)===JSON.stringify(source));
  if(same)same.count++;
  else ledger.batches.push({id:'wound/'+ledger.nextId++,severity:to,count:1,origin:structuredClone(source),restrictions,...(selected?{parentId:selected.id}:{} )});
 }
 ledger.batches=ledger.batches.filter(b=>b.count>0);
 return selected?{batchId:selected.id,...(selection?{selection}: {})}:undefined;
}
export function consumeWoundShares(state,severity,count,batchId){
 if(!state.woundLedger)return;
 const rows=state.woundLedger.batches.filter(b=>b.severity===severity&&(batchId?b.id===batchId:!b.restrictions.length));
 for(const b of rows){const n=Math.min(count,b.count);b.count-=n;count-=n;}
 if(count)throw Error('治疗份额不足');
 state.woundLedger.batches=state.woundLedger.batches.filter(b=>b.count>0);
}
