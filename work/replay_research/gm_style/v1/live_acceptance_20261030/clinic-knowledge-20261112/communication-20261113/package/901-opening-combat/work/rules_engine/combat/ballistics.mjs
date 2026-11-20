import {contains,vertices,groundElevationAt,blocking} from './map.mjs';
// Q11/Q12: seconds, metres, m/s. Analytic plane intersections, not sampled
// endpoints: a fast body cannot pass through a thin wall between two ticks.
export const STANDARD_GRAVITY=9.8;
const EPS=1e-8,dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0);
const unit=n=>{const length=Math.hypot(...n);return n.map(v=>v/length);};
const at=(p,v,g,t)=>[p[0]+v[0]*t,p[1]+v[1]*t,p[2]+v[2]*t-g*t*t/2];
const velocityAt=(v,g,t)=>[v[0],v[1],v[2]-g*t];
const fail=message=>{const e=new Error(message);e.code='NEEDS_INPUT';e.field='motion.geometry';throw e;};
function roots(a,b,c){
 if(Math.abs(a)<EPS)return Math.abs(b)<EPS?Math.abs(c)<EPS?[0]:[]:[-c/b];
 const d=b*b-4*a*c;if(d<0)return [];
 const q=Math.sqrt(d);return [(-b-q)/(2*a),(-b+q)/(2*a)];
}
function terrainPlanes(map){
 const planes=[{x:0,y:0,z:0}];
 for(const f of map?.features??[]){
  if(f.destroyed)continue;
  if(Number.isFinite(f.elevation))planes.push({x:0,y:0,z:f.elevation});
  if(f.ramp){
   const [a,b]=[f.ramp.from,f.ramp.to],dx=b[0]-a[0],dy=b[1]-a[1],k=(b[2]-a[2])/(dx*dx+dy*dy),x=dx*k,y=dy*k;
   planes.push({x,y,z:a[2]-x*a[0]-y*a[1]},{x:0,y:0,z:a[2]},{x:0,y:0,z:b[2]});
  }
 }
 return planes;
}
function edgeCrossings(position,velocity,seconds,feature){
 const vs=vertices(feature),rows=[];
 for(let i=0;i<vs.length;i++){
  const a=vs[i],b=vs[(i+1)%vs.length],edge=[b[0]-a[0],b[1]-a[1]],normal=unit([edge[1],-edge[0],0]);
  const rate=dot(velocity,normal);if(Math.abs(rate)<EPS)continue;
  const t=((a[0]-position[0])*normal[0]+(a[1]-position[1])*normal[1])/rate;
  if(t<-EPS||t>seconds+EPS)continue;
  const q=[position[0]+velocity[0]*t,position[1]+velocity[1]*t],u=((q[0]-a[0])*edge[0]+(q[1]-a[1])*edge[1])/(edge[0]**2+edge[1]**2);
  if(u<-EPS||u>1+EPS)continue;
  rows.push({time:Math.max(0,t),normal:rate<0?normal:normal.map(x=>-x)});
 }
 return rows;
}
export function firstBallisticContact(position,velocity,seconds,map,gravity=STANDARD_GRAVITY){
 const contacts=[],unknown=[],planes=terrainPlanes(map),solids=blocking(map);
 const consider=(t,normal,featureId,point,grounded=false)=>{
  if(t<-EPS||t>seconds+EPS)return;
  t=Math.max(0,t);const v=velocityAt(velocity,gravity,t),vn=dot(v,normal);
  if(vn>=-EPS&&!(t===0&&grounded&&Math.abs(vn)<EPS))return;
  contacts.push({time:t,point,normal,featureId,grounded});
 };
 // Ground and obstacle tops may have sloped bases; the height query identifies
 // which of the overlapping scene planes is actually authoritative here.
 for(const plane of planes){
  const normal=unit([-plane.x,-plane.y,1]);
  for(const solid of [null,...solids.filter(f=>Number.isFinite(f.height))]){
   const height=solid?.height??0;
   for(const t of roots(-gravity/2,velocity[2]-plane.x*velocity[0]-plane.y*velocity[1],position[2]-plane.x*position[0]-plane.y*position[1]-plane.z-height)){
    if(t<-EPS||t>seconds+EPS)continue;
    const q=at(position,velocity,gravity,Math.max(0,t));
    if(solid&&!contains(q,solid))continue;
    if(Math.abs(q[2]-groundElevationAt(map,q)-height)>1e-6)continue;
    consider(t,normal,solid?.id??'ground',q,true);
   }
  }
 }
 const speed=Math.hypot(velocity[0],velocity[1]),probe=speed?[velocity[0]/speed*1e-6,velocity[1]/speed*1e-6]:[0,0];
 const physical=(map?.ruleBarriers??[]).filter(f=>f.type==='physical').map(f=>({...f,kind:'obstacle',height:Infinity}));
 for(const f of [...solids,...physical,...(map?.features??[]).filter(f=>!f.destroyed&&(f.elevation!==undefined||f.ramp))]){
  for(const edge of edgeCrossings(position,velocity,seconds,f)){
   const q=at(position,velocity,gravity,edge.time),before=[q[0]-probe[0],q[1]-probe[1]],after=[q[0]+probe[0],q[1]+probe[1]];
   const isSolid=solids.includes(f)||physical.includes(f);
   if(isSolid){
    if(!contains(after,f,{boundary:false})||contains(before,f,{boundary:false}))continue;
    const floor=groundElevationAt(map,after);if(q[2]<floor-EPS)continue;
    if(f.height===undefined){unknown.push({time:edge.time,id:f.id});continue;}
    if(q[2]>=floor+f.height-EPS)continue;
   }else{
    const low=groundElevationAt(map,before),high=groundElevationAt(map,after);
    if(high<=low+EPS||q[2]>=high-EPS||q[2]<low-EPS)continue;
   }
   consider(edge.time,edge.normal,f.id,q);
  }
 }
 if(map?.bounded&&map.bounds){
  const boundary={rect:map.bounds};
  for(const edge of edgeCrossings(position,velocity,seconds,boundary)){
   const q=at(position,velocity,gravity,edge.time);
   if(!contains([q[0]+probe[0],q[1]+probe[1]],boundary))unknown.push({time:edge.time,id:'scene-boundary'});
  }
 }
 contacts.sort((a,b)=>a.time-b.time);
 const earliest=contacts[0]?.time??Infinity;
 if(unknown.some(x=>x.time<=earliest+EPS))fail('实际轨迹涉及未知障碍高度或场地外几何：'+unknown.filter(x=>x.time<=earliest+EPS).map(x=>x.id).join(','));
 if(!contacts.length)return null;
 const simultaneous=contacts.filter(x=>Math.abs(x.time-earliest)<EPS);
 return {...contacts[0],surfaces:simultaneous};
}
export function integrateBallistic(body,seconds,map){
 const gravity=body.gravity??STANDARD_GRAVITY;
 if(![body.position,body.velocity].every(a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite))||!Number.isFinite(seconds)||seconds<0||!Number.isFinite(gravity)||gravity<=0)fail('物理运动须实际三维位置、速度、非负秒数和正重力');
 let position=[...body.position],velocity=[...body.velocity],remaining=seconds,elapsed=0,grounded=false;
 const contacts=[];
 let initial=true;
 while(initial||remaining>EPS){
  initial=false;
  const hit=firstBallisticContact(position,velocity,remaining,map,gravity);
  if(!hit){position=at(position,velocity,gravity,remaining);velocity=velocityAt(velocity,gravity,remaining);elapsed+=remaining;remaining=0;break;}
  position=hit.point;velocity=velocityAt(velocity,gravity,hit.time);elapsed+=hit.time;remaining-=hit.time;
  let equivalentHeight=0,groundEquivalentHeight=0;const normals=[];
  for(const surface of hit.surfaces){
   const vn=Math.min(0,dot(velocity,surface.normal));
   equivalentHeight+=vn*vn/(2*gravity);if(surface.grounded)groundEquivalentHeight+=vn*vn/(2*gravity);velocity=velocity.map((v,i)=>v-vn*surface.normal[i]);normals.push(surface.normal);
   grounded||=surface.grounded;
  }
  contacts.push({seconds:elapsed,point:[...position],normal:hit.normal,normals,featureId:hit.featureId,equivalentHeight,groundEquivalentHeight,grounded});
  if(grounded)break;
  if(contacts.length>64)fail('单次轨迹接触过多，须分段推进实际时间');
 }
 return {position,velocity,gravity,grounded,elapsedSeconds:(body.elapsedSeconds??0)+elapsed,contacts};
}

// A parabola intersects a sphere through a degree-four polynomial. Isolate
// roots between derivative roots, then bisect; never approximate by chords.
function intervalRoots(coefficients,start,end){
 const c=[...coefficients];while(c.length>1&&Math.abs(c.at(-1))<1e-12)c.pop();
 if(c.length===1)return [];
 if(c.length===2){const t=-c[0]/c[1];return t>=start-EPS&&t<=end+EPS?[Math.max(start,Math.min(end,t))]:[];}
 const value=t=>c.reduceRight((n,a)=>n*t+a,0),turns=intervalRoots(c.slice(1).map((v,i)=>v*(i+1)),start,end);
 const bounds=[start,...turns,end],found=bounds.filter(t=>Math.abs(value(t))<1e-9);
 for(let i=1;i<bounds.length;i++){
  let a=bounds[i-1],b=bounds[i],fa=value(a),fb=value(b);if(fa*fb>=0)continue;
  for(let k=0;k<60;k++){const m=(a+b)/2,fm=value(m);if(fa*fm<=0){b=m;fb=fm;}else{a=m;fa=fm;}}
  found.push((a+b)/2);
 }
 return found.sort((a,b)=>a-b).filter((v,i,a)=>!i||v-a[i-1]>EPS);
}
export function ballisticSphereCrossings(body,seconds,center,radius){
 const p=body.position.map((v,i)=>v-center[i]),v=body.velocity,a=[0,0,-(body.gravity??STANDARD_GRAVITY)/2];
 const c=[dot(p,p)-radius*radius,2*dot(p,v),dot(v,v)+2*dot(p,a),2*dot(v,a),dot(a,a)];
 return intervalRoots(c,0,seconds).map(t=>({seconds:t,point:at(body.position,v,body.gravity??STANDARD_GRAVITY,t),velocity:velocityAt(v,body.gravity??STANDARD_GRAVITY,t)}));
}
