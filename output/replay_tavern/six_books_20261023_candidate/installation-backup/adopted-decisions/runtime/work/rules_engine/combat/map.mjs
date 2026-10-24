import {statusLevel} from '../core.mjs';
// Metres in the rules save; the view only receives the observer's projection.
export const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite);
const rect=r=>Array.isArray(r)&&r.length===4&&r.every(Number.isFinite)&&r[2]>0&&r[3]>0;
const inside=(p,r)=>p[0]>=r[0]&&p[0]<=r[0]+r[2]&&p[1]>=r[1]&&p[1]<=r[1]+r[3];
const known=(f,id)=>!f.hiddenFrom?.includes(id);
export const COVER={slight:2,partial:4,substantial:8};
const active=f=>!f.destroyed;
export const SURFACES=['plain','grass','forest','road','rock','water','rubble','floor','wall','earth'];
export const vertices=f=>f.points??[[f.rect[0],f.rect[1]],[f.rect[0]+f.rect[2],f.rect[1]],[f.rect[0]+f.rect[2],f.rect[1]+f.rect[3]],[f.rect[0],f.rect[1]+f.rect[3]]];
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
export function contains(p,f,{boundary=true}={}) {
  const vs=vertices(f);let within=false;
  for(let i=0,j=vs.length-1;i<vs.length;j=i++) {
    const a=vs[j],b=vs[i];
    if(Math.abs(cross(sub(p,a),sub(b,a)))<1e-8&&p[0]>=Math.min(a[0],b[0])-1e-8&&p[0]<=Math.max(a[0],b[0])+1e-8&&p[1]>=Math.min(a[1],b[1])-1e-8&&p[1]<=Math.max(a[1],b[1])+1e-8)return boundary;
    if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])within=!within;
  }
  return within;
}
function cutsFor(a,b,f) {
  const vs=vertices(f),r=sub(b,a),cuts=[0,1];
  for(let i=0;i<vs.length;i++) {
    const c=vs[i],s=sub(vs[(i+1)%vs.length],c),den=cross(r,s);if(Math.abs(den)<1e-10)continue;
    const t=cross(sub(c,a),s)/den,u=cross(sub(c,a),r)/den;
    if(t>0&&t<1&&u>=0&&u<=1)cuts.push(t);
  }
  return cuts.sort((x,y)=>x-y);
}
function insideFraction(a,b,f) {
  if(distance(a,b)<1e-10)return contains(a,f,{boundary:false})?1:0;
  const cuts=cutsFor(a,b,f);let fraction=0;
  for(let i=1;i<cuts.length;i++) {const t=(cuts[i]+cuts[i-1])/2,p=a.map((v,k)=>v+(b[k]-v)*t);
    if(contains(p,f,{boundary:false}))fraction+=cuts[i]-cuts[i-1];}
  return fraction;
}
export function normalizeMap(input,battle) {
  if(!rect(input?.bounds)||!Array.isArray(input.features)||input.features.length>80)throw Error('地图需要有效边界和地形列表');
  const ids=new Set();
  const features=input.features.map(f=>{
    const polygon=Array.isArray(f.points)&&f.points.length>=3&&f.points.length<=32&&f.points.every(point);
    if(typeof f.id!=='string'||ids.has(f.id)||!(polygon||rect(f.rect))||!['obstacle','difficult','landmark','door','zone'].includes(f.kind))throw Error('地图地形格式无效');
    ids.add(f.id);
    if(vertices(polygon?{points:f.points}:{rect:f.rect}).some(p=>!inside(p,input.bounds)))throw Error('地形超出地图边界');
    if(f.coverDegree!==undefined&&!Object.hasOwn(COVER,f.coverDegree))throw Error('掩体须指定slight/partial/substantial');
    for(const key of ['height','elevation'])if(f[key]!==undefined&&(!Number.isFinite(f[key])||key==='height'&&f[key]<0))throw Error('地形高度无效');
    if(f.ramp&&(![f.ramp.from,f.ramp.to].every(p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)&&contains(p,f))||distance(f.ramp.from,f.ramp.to)<.01))throw Error('坡道需两端的平面坐标与高度');
    const d=f.durability;
    if(d&&(![d.current,d.max,d.hardness].every(Number.isFinite)||d.max<=0||d.current<0||d.current>d.max||d.hardness<0||!d.source?.trim()))throw Error('破坏物需要有效耐久、硬度及参数来源');
    return {id:f.id,label:String(f.label??f.id).slice(0,60),kind:f.kind,...(polygon?{points:f.points.map(p=>[...p])}:{rect:[...f.rect]}),
      ...(SURFACES.includes(f.surface)?{surface:f.surface}:{}),
      ...Object.fromEntries(['airSealed','smoke','supernaturalDarkness','climbable','earthPassage','earthExit'].filter(k=>typeof f[k]==='boolean').map(k=>[k,f[k]])),
      ...Object.fromEntries(['speedPenalty','defensePenalty'].filter(k=>Number.isFinite(f[k])&&f[k]>=0).map(k=>[k,f[k]])),
      ...(f.kind==='door'?{open:f.open===true,locked:f.locked===true}:{}),blocksSight:f.blocksSight===true,
      ...(f.coverDegree?{coverDegree:f.coverDegree}:{}),
      ...(f.height!==undefined?{height:f.height}:{}),...(f.elevation!==undefined?{elevation:f.elevation}:{}),
      ...(f.ramp?{ramp:structuredClone(f.ramp)}:{}),
      ...(d?{durability:{current:d.current,max:d.max,hardness:d.hardness,source:d.source}}:{}),
      ...(f.destroyed||d?.current===0?{destroyed:true}:{}),
      ...(Array.isArray(f.hiddenFrom)?{hiddenFrom:f.hiddenFrom.filter(x=>typeof x==='string')}: {})};
  });
  const map={version:3,bounded:input.bounded===true,title:String(input.title??'当前场地').slice(0,80),bounds:[...input.bounds],features,
    gridSize:Number.isFinite(input.gridSize)&&input.gridSize>=.5&&input.gridSize<=10?input.gridSize:1.5,
    ground:SURFACES.includes(input.ground)?input.ground:'plain',airflow:input.airflow!==false,darkness:input.darkness===true,
    ruleBarriers:structuredClone(input.ruleBarriers??[])};
  for(const a of Object.values(battle.actors).filter(a=>a.present)) {
    if(!inside(a.position,map.bounds)||blocking(map).some(f=>insideFraction(a.position,a.position,f)>0))throw Error('地图不能移动人物或把人物嵌入障碍');
  }
  return map;
}
export const blocking=map=>(map?.features??[]).filter(f=>active(f)&&(f.kind==='obstacle'||f.kind==='door'&&!f.open));
export function elevationAt(map,p) {
  let z=0;
  for(const f of map?.features??[])if(active(f)&&contains(p,f)) {
    if(f.elevation!==undefined)z=f.elevation;
    if(f.ramp){const {from:a,to:b}=f.ramp,v=sub(b,a),t=Math.max(0,Math.min(1,(sub(p,a)[0]*v[0]+sub(p,a)[1]*v[1])/(v[0]**2+v[1]**2)));z=a[2]+(b[2]-a[2])*t;}
  }
  return z;
}
export const spatialDistance=(map,a,b)=>Math.hypot(distance(a,b),elevationAt(map,a)-elevationAt(map,b));
// Heights are scene geometry. The standing sight line is 1.5 m above the ground;
// partial cover uses the lower silhouette instead, without inventing a high-ground bonus.
function intersectsHeight(map,a,b,f,offset) {
  if(!insideFraction(a,b,f))return false;
  if(f.height===undefined)return true;
  const za=elevationAt(map,a)+offset,zb=elevationAt(map,b)+offset,cuts=cutsFor(a,b,f);
  for(let i=1;i<cuts.length;i++) {
    const lo=cuts[i-1],hi=cuts[i],mid=a.map((v,k)=>v+(b[k]-v)*(lo+hi)/2);
    if(contains(mid,f,{boundary:false})&&Math.min(za+(zb-za)*lo,za+(zb-za)*hi)<elevationAt(map,mid)+f.height-1e-8)return true;
  }
  return false;
}
export function terrainCover(map,from,to) {
  return Math.max(0,...blocking(map).filter(f=>f.coverDegree&&intersectsHeight(map,from,to,f,0)).map(f=>COVER[f.coverDegree]));
}
export function clearLine(map,a,b,{sight=false,movement=false}={}) {
  if(!sight&&(map?.ruleBarriers??[]).some(f=>f.type==='physical'&&rect(f.rect)&&
    (inside(a,f.rect)!==inside(b,f.rect)||!inside(a,f.rect)&&insideFraction(a,b,f)>0)))return false;
  const barriers=sight?(map?.features??[]).filter(f=>active(f)&&f.blocksSight&&!(f.kind==='door'&&f.open)):blocking(map);
  if(movement)return !barriers.some(f=>insideFraction(a,b,f)>0);
  if(barriers.some(f=>!f.coverDegree&&intersectsHeight(map,a,b,f,1.5)))return false;
  // A raised platform is solid ground, not a transparent painted region.
  const cuts=[0,1,...(map?.features??[]).filter(f=>f.elevation!==undefined||f.ramp).flatMap(f=>cutsFor(a,b,f))].sort((x,y)=>x-y);
  const za=elevationAt(map,a)+1.5,zb=elevationAt(map,b)+1.5;
  return cuts.slice(1).every((hi,i)=>[cuts[i]+1e-7,(hi+cuts[i])/2,hi-1e-7].every(t=>elevationAt(map,a.map((v,k)=>v+(b[k]-v)*t))<=za+(zb-za)*t+1e-6));
}
export function nearestPoint(p,f) {
  if(contains(p,f))return [...p];
  const vs=vertices(f);let best=null;
  for(let i=0;i<vs.length;i++){const a=vs[i],b=vs[(i+1)%vs.length],v=sub(b,a),w=sub(p,a),t=Math.max(0,Math.min(1,(w[0]*v[0]+w[1]*v[1])/(v[0]**2+v[1]**2||1))),q=a.map((n,k)=>n+v[k]*t);
    if(!best||distance(p,q)<distance(p,best))best=q;}
  return best;
}
export function canObserve(b,a,observerId) {
  const observer=b.actors[observerId]??b.observers?.[observerId];
  if(!a||!observer)return false;
  if(observer&&a.id!==observerId) {
    if(observer.state?.sleeping)return false;
    if(observer.state&&statusLevel(observer.state,'目眩').severe&&!observer.windSense)return false;
    if(a.spirit&&!observer.spiritSight||a.underground&&!observer.underground||observer.underground&&!a.underground)return false;
    const crossed=(b.map?.features??[]).filter(f=>active(f)&&insideFraction(observer.position,a.position,f)>0);
    if(observer.windSense&&(b.map?.airflow===false||!clearLine(b.map,observer.position,a.position)||crossed.some(f=>f.airSealed)))return false;
    if(a.spirit&&observer.spiritSight&&crossed.some(f=>f.smoke||f.supernaturalDarkness))return false;
    if(b.map?.darkness&&!observer.windSense&&!(observer.darkvision&&spatialDistance(b.map,observer.position,a.position)<=observer.darkvision)&&!(a.spirit&&observer.spiritSight))return false;
  }
  return a.present&&!a.hiddenFrom?.includes(observerId)&&(!observer||a.id===observerId||
    (observer.perceptionRange===undefined||spatialDistance(b.map,observer.position,a.position)<=observer.perceptionRange)&&clearLine(b.map,observer.position,a.position,{sight:true}));
}
// Visibility changes along a movement at terrain edges or rays through their
// vertices. Remember the last visible part, never the hidden destination.
export function lastVisiblePoint(map,observer,path) {
  const barriers=(map?.features??[]).filter(f=>active(f)&&(f.blocksSight||f.elevation!==undefined||f.ramp)&&!(f.kind==='door'&&f.open));
  let last=null;
  for(let i=1;i<path.length;i++) {
    const a=path[i-1],b=path[i],r=sub(b,a),cuts=[0,1];
    for(const f of barriers) {
      cuts.push(...cutsFor(a,b,f));
      for(const v of vertices(f)) {
        const ray=sub(v,observer),den=cross(r,ray);if(Math.abs(den)<1e-10)continue;
        const t=cross(sub(observer,a),ray)/den,u=cross(sub(observer,a),r)/den;
        if(t>0&&t<1&&u>=0)cuts.push(t);
      }
    }
    cuts.sort((x,y)=>x-y);
    for(let j=1;j<cuts.length;j++) {
      const t=(cuts[j]+cuts[j-1])/2,p=a.map((v,k)=>v+r[k]*t);
      if(clearLine(map,observer,p,{sight:true})) {
        let end=Math.max(t,cuts[j]-1e-6);
        if(!clearLine(map,observer,a.map((v,k)=>v+r[k]*end),{sight:true})) {
          let low=t,high=end;
          for(let n=0;n<24;n++){const mid=(low+high)/2;if(clearLine(map,observer,a.map((v,k)=>v+r[k]*mid),{sight:true}))low=mid;else high=mid;}
          end=low;
        }
        last=a.map((v,k)=>v+r[k]*end);
      }
    }
    if(clearLine(map,observer,b,{sight:true}))last=[...b];
  }
  return last;
}
export function measurePath(map,from,to,via=[],options={}) {
  if(!point(to)||!Array.isArray(via)||via.length>20||!via.every(point))return {valid:false,reason:'移动需要有效坐标或途经点'};
  const path=[from,...via,to];let length=0,cost=0;
  for(let i=1;i<path.length;i++) {
    const a=path[i-1],b=path[i];
    if(map?.bounded&&!inside(b,map.bounds))return {valid:false,reason:'目标超出已建立的场地边界'};
    if(!clearLine(map,a,b,{movement:true}))return {valid:false,reason:'路线穿过障碍，需要声明绕行路线'};
    const d=distance(a,b);
    // PHB 困难地形：每段在困难区域内的移动力翻倍，重叠不重复倍增。
    const cuts=[0,1];
    for(const f of map?.features??[])if(active(f)&&(f.kind==='difficult'||f.elevation!==undefined||f.ramp))cuts.push(...cutsFor(a,b,f));
    cuts.sort((x,y)=>x-y);
    const at=t=>a.map((v,k)=>v+(b[k]-v)*t);
    for(const t of cuts) {
      const rise=Math.abs(elevationAt(map,at(Math.max(0,t-1e-7)))-elevationAt(map,at(Math.min(1,t+1e-7))));
      if(rise>1e-4) {
        if(!options.fly&&(!options.climb||!(map?.features??[]).some(f=>f.climbable&&contains(at(t),f))))return {valid:false,reason:'路线跨越高低落差；需经过已绘制的坡道或明确可承重攀爬面'};
        length+=rise;cost+=rise;
      }
    }
    for(let j=1;j<cuts.length;j++) {const lo=cuts[j-1],hi=cuts[j],p=at((hi+lo)/2),segment=Math.hypot(d*(hi-lo),elevationAt(map,at(hi))-elevationAt(map,at(lo)));
      length+=segment;cost+=segment*(!options.ignoreDifficult&&(map?.features??[]).some(f=>active(f)&&f.kind==='difficult'&&contains(p,f))?2:1);}
  }
  return {valid:true,path,length,cost};
}
export function earthPath(map,from,to,via=[]) {
  if(!point(to)||!via.every(point))return {valid:false,reason:'土遁需要有效站位'};
  const path=[from,...via,to];let length=0;
  for(let i=1;i<path.length;i++) {
    const a=path[i-1],b=path[i],passages=(map?.features??[]).filter(f=>active(f)&&f.earthPassage);
    const cuts=[...new Set([0,1,...passages.flatMap(f=>cutsFor(a,b,f))])].sort((a,b)=>a-b);
    if(!passages.some(f=>contains(a,f))||cuts.slice(1).some((hi,j)=>!passages.some(f=>contains(a.map((n,k)=>n+(b[k]-n)*(hi+cuts[j])/2),f))))
      return {valid:false,reason:'缺少连续、可用且已确认的土层通路'};
    length+=distance(a,b);
  }
  return {valid:true,path,length,cost:length};
}
// Small visibility graph for scene obstacles; no model-generated path is
// allowed to bypass the same segment checks used by the resolver.
export function routeTo(map,from,to) {
  if(measurePath(map,from,to).valid)return [to];
  const nodes=[from,to];
  for(const f of map?.features??[])if(active(f)&&f.ramp)nodes.push(f.ramp.from.slice(0,2),f.ramp.to.slice(0,2));
  for(const f of (map?.features??[]).filter(f=>active(f)&&(blocking(map).includes(f)||f.elevation!==undefined))) {
    if(f.rect){const [x,y,w,h]=f.rect,e=.15;nodes.push([x-e,y-e],[x+w+e,y-e],[x-e,y+h+e],[x+w+e,y+h+e]);}
    else for(const p of f.points)for(const dx of [-.15,.15])for(const dy of [-.15,.15]) {
      const v=[p[0]+dx,p[1]+dy];if(!blocking(map).some(f=>contains(v,f)))nodes.push(v);
    }
  }
  const costs=nodes.map(()=>Infinity),prev=[],done=new Set();costs[0]=0;
  for(let n=0;n<nodes.length;n++) {
    let i=-1;for(let j=0;j<nodes.length;j++)if(!done.has(j)&&(i<0||costs[j]<costs[i]))i=j;
    if(i<0||costs[i]===Infinity)break;if(i===1){const path=[];for(let k=1;k!==0;k=prev[k])path.unshift(nodes[k]);return path;}
    done.add(i);
    for(let j=1;j<nodes.length;j++)if(!done.has(j)){const segment=measurePath(map,nodes[i],nodes[j]);if(segment.valid&&costs[i]+segment.cost<costs[j]){costs[j]=costs[i]+segment.cost;prev[j]=i;}}
  }
  return null;
}
export function truncateRoute(map,from,path,budget) {
  const out=[];let a=from;
  for(const end of path??[]) {const cost=measurePath(map,a,end).cost;if(cost<=budget){out.push(end);budget-=cost;a=end;continue;}
    let low=0,high=1;for(let n=0;n<24;n++){const mid=(low+high)/2,p=a.map((v,k)=>v+(end[k]-v)*mid);if(measurePath(map,a,p).cost<=budget)low=mid;else high=mid;}
    if(low>1e-5)out.push(a.map((v,k)=>Math.round((v+(end[k]-v)*low)*1000)/1000));break;
  }
  return out;
}
export function mapView(b,observerId='player') {
  if(!b?.map)return null;
  const observer=b.actors[observerId],features=b.map.features.filter(f=>known(f,observerId));
  const seenActors=Object.values(b.actors).filter(a=>canObserve(b,a,observerId));
  const [x,y,w,h]=b.map.bounds,margin=2;
  const left=Math.min(x,...seenActors.map(a=>a.position[0]-margin)),top=Math.min(y,...seenActors.map(a=>a.position[1]-margin));
  const right=Math.max(x+w,...seenActors.map(a=>a.position[0]+margin)),bottom=Math.max(y+h,...seenActors.map(a=>a.position[1]+margin));
  return {title:b.map.title,bounded:b.map.bounded,bounds:[left,top,right-left,bottom-top],ground:b.map.ground??'plain',gridSize:b.map.gridSize??1.5,gridOrigin:[x,y],features:structuredClone(features).map(({hiddenFrom,durability,locked,...f})=>({...f,...(durability?{destructible:true}: {})})),
    actors:seenActors.map(a=>({id:a.id,name:a.name,position:[...a.position],
      relation:a.id===observerId?'self':observer&&a.team===observer.team?'ally':'other'})),
    ...(observer?{origin:[...observer.position]}:{})};
}
export async function generateBattleMap(b,generateRaw) {
  const mechanics='场景明确矮墙等部分掩体时可用coverDegree:slight/partial/substantial（方向由程序判定）；可通行高台用zone及elevation米数；坡道/阶梯用zone及ramp:{from:[x,y,z],to:[x,y,z]}，区域覆盖两端，列表置于相邻高台之后。实体障碍高度已知时可用height米数。未明确的高度不要编造，不能把高低差当作免费的攻击加值。门锁仅在场景明确时填locked:true，不能把锁门当作普通可开门。不要输出durability、destroyed；障碍耐久、硬度由主持场景参数提供，模型不能决定破坏难度。';
  const drawing='补充地图表现字段：ground为场地默认地面，gridSize默认1.5米（仅辅助绘图，不改变连续距离规则）。每个feature可用rect矩形或points:[[x,y],...]不自交多边形，两者只取其一；多边形3至32个顶点，用于弯曲道路、山壁、树林等真实边界。surface可选plain平地、grass草地、forest树林、road道路、rock山岩、water水域、rubble碎石、floor室内地面、wall墙体。kind决定原有机械性质，surface只决定样式；不得因颜色增加移动惩罚。树林或水域只有场景确认相应条件时才用difficult或blocksSight。先铺大片地形，再铺道路，最后障碍与地标，列表后项绘制在前项之上；不要让可通行道路覆盖机械阻挡区，用分别的边界留出通道。每片地形只用一个或少数多边形；不要逐格输出或逐棵创建树，细节和格网由JavaScript自动绘制。';
  const text=await generateRaw({should_stream:false,should_silence:true,max_chat_history:0,
    ordered_prompts:[{role:'system',content:'你负责一次性建立场景几何地图。只输出JSON {"title":"场地名","bounds":[x,y,宽,高],"features":[{"id":"唯一ID","label":"地标名","kind":"landmark","rect":[x,y,宽,高],"blocksSight":false}]}。单位米。bounds仅为绘图范围，不是实体围墙；只有场景明确封闭边界时才能增加bounded:true。人物、角色、召唤物绝不能写入features，包括旁观者。人物标记由程序单独绘制；不要创造人物地标，不要推测场边人物站位。可用kind为obstacle实体障碍、difficult困难地形、landmark地标、door门、zone区域。门须open布尔值。只依据给定场景，不为战术丰富性凭空添加墙壁、危险或掩体；未定位置可为明确已有的地标安排不与人物重叠的位置。空旷场地保持空旷，边界留出合理活动空间。必须容纳所有当前站位且不改动人物位置，不输出人物数值。地图建立后固定，不每轮重画。'},'user_input'],
    user_input:JSON.stringify({scene:b.scenario,drawing:drawing+mechanics,positions:Object.values(b.actors).filter(a=>a.present).map(a=>({name:a.name,position:a.position}))})});
  const input=JSON.parse(text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));
  const actorNames=new Set([...(b.sceneActorNames??[]),...Object.values(b.actors).map(a=>a.name)]);
  input.features=input.features?.filter(f=>!actorNames.has(f.label)).map(({durability,destroyed,...f})=>f);
  return normalizeMap(input,b);
}

export function pathFeatures(map,path){return (map?.features??[]).filter(f=>active(f)&&path.some((p,i)=>i>0&&insideFraction(path[i-1],p,f)>0));}
