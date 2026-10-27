// Observer-dependent visual fields do not become collision walls or actors.
import {selectedOngoingEffects} from './resource-ongoing.mjs';
import {visualIllusionImmune,visualIllusionSenses} from './resource-visual-illusions.mjs';
import {lifeStatus,statusLevel} from './core.mjs';
import {clearLine,elevationAt} from './combat/map.mjs';
const xyz=(map,p)=>[p[0],p[1],elevationAt(map,p)+1.5];
const distance=(a,b)=>Math.hypot(...a.map((n,i)=>n-b[i]));
function fields(root,spatial){
 const rows=[];
 for(const [holderId,holder]of Object.entries(root.actors??{})){
  if(holder.present===false)continue;
  for(const effect of selectedOngoingEffects(holder.state))if(effect.obscuration){
   const p=spatial?.actors?.[holderId]?.position;
   if(!Array.isArray(p)){const e=new Error('视线遮挡来源须有实际当前位置');e.code='NEEDS_INPUT';e.field='obscuration.spatial';throw e;}
   rows.push({holder,effect,center:xyz(spatial.map,p)});
  }
 }
 return rows;
}
function aware(observer,holder,effect,range,{map}={}){
 if(effect.obscuration.mask==='none'||effect.obscuration.disbelievedBy?.[observer.id])return true;
 if(!observer.state||observer.state.sleeping||['dead','unconscious'].includes(lifeStatus(observer.state).state))return false;
 if(visualIllusionImmune(observer,effect))return true;
 return visualIllusionSenses(observer,holder,effect).some(s=>(!s.visual||!statusLevel(observer.state,'目眩').severe&&(!map?.darkness||s.trueSight||observer.darkvision>=range))&&range<=Math.max(s.sensitiveRange??0,s.vagueRange??0));
}
function intersects(a,b,center,radius){
 const v=b.map((n,i)=>n-a[i]),w=center.map((n,i)=>n-a[i]),vv=v.reduce((n,x)=>n+x*x,0);
 const t=vv?Math.max(0,Math.min(1,w.reduce((n,x,i)=>n+x*v[i],0)/vv)):0;
 const closest=a.map((n,i)=>n+t*v[i]);return distance(center,closest)<radius-1e-8?closest:null;
}
export function obscuresSight(root,observerId,from,to,{spatial=root,ignoreId}={}){
 const observer=root.actors?.[observerId]??root.observers?.[observerId];if(!observer||observerId===undefined)return false;
 const a=xyz(spatial.map,from),b=xyz(spatial.map,to);if(distance(a,b)<1e-8)return false;
 return fields(root,spatial).some(({holder,effect,center})=>{
  if(effect.id===ignoreId)return false;
  const hit=intersects(a,b,center,effect.obscuration.radius);if(!hit)return false;
  if(!clearLine(spatial.map,[center[0],center[1],center[2]-1.5],[hit[0],hit[1],hit[2]-1.5]))return false;
  return aware(observer,holder,effect,Math.max(0,distance(a,center)-effect.obscuration.radius),{map:spatial.map});
 });
}
export function observeResourceObscuration(root,{spatial=root.map?root:root.ruleScene?.spatial}={}){
 if(!spatial?.actors)return;
 const rows=fields(root,spatial);
 for(const observer of Object.values(root.actors??{})){
  const p=spatial.actors[observer.id]?.position;if(observer.present===false||!p||!observer.state||observer.state.sleeping||['dead','unconscious'].includes(lifeStatus(observer.state).state))continue;
  const a=xyz(spatial.map,p);
  for(const {holder,effect,center}of rows){
   if(effect.obscuration.mask!=='visualIllusion'||effect.obscuration.disbelievedBy?.[observer.id])continue;
   const d=distance(a,center),range=Math.max(0,d-effect.obscuration.radius);
   const near=d?a.map((n,i)=>n+(center[i]-n)*range/d):a;
   // Test only real terrain to the near face; the field cannot hide its own mask.
   if(!clearLine(spatial.map,p,[near[0],near[1],near[2]-1.5],{sight:true,root,observerId:observer.id,spatial,ignoreObscurationId:effect.id})||!clearLine(spatial.map,[center[0],center[1],center[2]-1.5],[near[0],near[1],near[2]-1.5])||!aware(observer,holder,effect,range,{map:spatial.map}))continue;
   (effect.obscuration.disbelievedBy??={})[observer.id]={source:'RE幻术15,21;幻雾术',round:root.round??null};
  }
 }
}
