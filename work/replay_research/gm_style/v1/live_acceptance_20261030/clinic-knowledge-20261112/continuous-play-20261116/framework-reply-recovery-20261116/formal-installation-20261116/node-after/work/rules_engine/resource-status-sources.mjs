// Source selections identify an actual status source and caster, not an index
// that can silently move when another status expires before resolution.
export function selectStatusSource(state,type,choice){
 if(choice==null)return {points:0,indices:[]};
 const fail=message=>{const e=new Error(message);e.code='NEEDS_INPUT';e.field='resource.statusSource';throw e;};
 if(!choice.source)fail('须选择实际状态来源');
 const matching=state.statuses.map((s,index)=>({s,index})).filter(({s})=>s.type===type&&s.source===choice.source&&(s.sourceActorId??null)===(choice.sourceActorId??null));
 if(!matching.length)fail('所选来源没有该状态点数');
 const rows=matching.filter(({s})=>s.removable!==false&&s.points>0);
 if(!rows.length)fail('所选来源的状态点数不能移除，也不能用于增伤');
 return {points:rows.reduce((n,{s})=>n+s.points,0),indices:rows.map(({index})=>index)};
}
export function consumeStatusSource(state,type,choice){
 const selected=selectStatusSource(state,type,choice),indices=new Set(selected.indices);
 state.statuses=state.statuses.filter((_,index)=>!indices.has(index));
 return selected.points;
}
