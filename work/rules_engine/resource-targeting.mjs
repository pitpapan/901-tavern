import {clearLine,elevationAt} from './combat/map.mjs';
import {RuleInputError} from './combat/mechanics.mjs';
const point=p=>Array.isArray(p)&&[2,3].includes(p.length)&&p.every(Number.isFinite);
const need=(message,field)=>{throw new RuleInputError(message,field);};
export function inspectRecipientSave(spec,choice,targetId){
 if(!choice?.source||choice.chosenBy!==targetId||!spec.options.includes(choice.type))need('须受术者选择本次允许的豁免，并保留实际选择来源','resource.saveChoices.'+targetId+'.'+spec.recipientChoice);
 return choice.type;
}
// RE glossary: full apex angle 45 degrees, burst effects do not go around
// obstacles. "Length in front" is the axial length of the finite cone.
export function selectConeTargets(root,casterId,area,plan,value,{combat=false}={}){
 const spatial=combat?root:root.ruleScene?.spatial;
 if(!combat&&!spatial?.source)need('锥体须实际场地人物位置及来源','resource.spatial');
 const map=spatial?.map;
 const location=id=>{
  const row=spatial?.actors?.[id],actor=root.actors[id];
  if(!point(row?.position))need('锥体选人缺少当前实际位置：'+id,'resource.spatial.'+id);
  const v=actor.state.verticalPosition;
  return [...row.position.slice(0,2),row.position[2]??(v? v.groundElevation+v.heightAboveGround:elevationAt(map,row.position))];
 };
 const origin=location(casterId),aim=plan.aim;
 if(!point(aim)||Math.hypot(...aim)===0)need('锥体须实际朝向向量','resource.aim');
 const magnitude=Math.hypot(...aim),direction=[aim[0]/magnitude,aim[1]/magnitude,(aim[2]??0)/magnitude];
 const length=value(area.length),angle=area.angleDegrees;
 if(!(length>0&&angle>0&&angle<180))throw Error('锥体长度及开角无效');
 const slope=Math.tan(angle*Math.PI/360),targetIds=[];
 for(const [id,a]of Object.entries(root.actors)){
  if(id===casterId||a.present===false)continue;
  const p=location(id),delta=p.map((n,i)=>n-origin[i]),axial=delta.reduce((sum,n,i)=>sum+n*direction[i],0);
  const radius=Math.sqrt(Math.max(0,delta.reduce((sum,n)=>sum+n*n,0)-axial*axial));
  if(axial>=-1e-8&&axial<=length+1e-8&&radius<=Math.max(0,axial)*slope+1e-8&&clearLine(map,origin,p))targetIds.push(id);
 }
 return {shape:'cone',origin,direction,length,angleDegrees:angle,targetIds};
}

export function selectSphereTargets(root,ownerId,radius,{combat=false}={}){
 const spatial=combat?root:root.ruleScene?.spatial;
 if(!combat&&!spatial?.source)need('自动范围效果须实际场地人物位置及来源','resource.spatial');
 const map=spatial?.map;
 const location=id=>{
  const row=spatial?.actors?.[id],actor=root.actors[id];
  if(!point(row?.position))need('自动范围效果缺少实际位置：'+id,'resource.spatial.'+id);
  const v=actor.state.verticalPosition;
  return [...row.position.slice(0,2),row.position[2]??(v?v.groundElevation+v.heightAboveGround:elevationAt(map,row.position))];
 };
 const origin=location(ownerId),targetIds=[];
 for(const [id,a]of Object.entries(root.actors))if(a.present!==false){const p=location(id);if(Math.hypot(...p.map((x,i)=>x-origin[i]))<=radius+1e-8&&clearLine(map,origin,p))targetIds.push(id);}
 return {shape:'sphere',origin,radius,targetIds};
}
