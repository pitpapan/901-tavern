import {vertices} from '../combat/map.mjs';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const terrainStyle={
  plain:{name:'平地',color:'#e9e6d9'},grass:{name:'草地',color:'#bbcf98'},forest:{name:'树林',color:'#85ac7d'},
  road:{name:'道路',color:'#e8d2a9'},rock:{name:'山岩',color:'#9caaa9'},water:{name:'水域',color:'#8ec4d3'},
  rubble:{name:'碎石',color:'#c3b9a8'},floor:{name:'地面',color:'#deddd7'},wall:{name:'墙体',color:'#7e898b'},
};
export const surfaceOf=f=>f.surface??({obstacle:'rock',difficult:'rubble',door:'wall',landmark:'road',zone:'grass'}[f.kind]);
export const unitSymbol=name=>Array.from(name)[0]??'·';
const columnName=n=>{let s='';for(n++;n>0;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s||'·';};
export function mapFrame(map) {
  const cell=map.gridSize??1.5,pad=cell*1.05,[x,y,w,h]=map.bounds;
  return {cell,viewBox:[x-pad,y-pad,w+2*pad,h+2*pad]};
}
export function mapSvg(map,selection,{grid=true}={}) {
  const {cell:g,viewBox}=mapFrame(map),[x,y,w,h]=map.bounds,[gx,gy]=map.gridOrigin??[x,y];
  const shape=(f,attributes)=>f.points?`<polygon points="${f.points.map(p=>p.join(',')).join(' ')}" ${attributes}/>`:
    `<rect x="${f.rect[0]}" y="${f.rect[1]}" width="${f.rect[2]}" height="${f.rect[3]}" ${attributes}/>`;
  const patterns=Object.entries(terrainStyle).map(([id,t])=>{
    const art=id==='forest'?`<path d="M .5 .17 L .22 .56 H .35 L .15 .78 H .85 L .65 .56 H .78 Z" fill="#376b4c"/><path d="M .5 .78 V .9" stroke="#5b5136" stroke-width=".09"/>`:
      id==='water'?'<path d="M .12 .36 Q .3 .17 .5 .36 T .88 .36 M .12 .73 Q .3 .54 .5 .73 T .88 .73" fill="none" stroke="#5e9db2" stroke-width=".045"/>':
      ['rock','wall'].includes(id)?'<path d="M .12 .7 L .36 .25 L .68 .73 M .48 .47 L .71 .19 L .91 .55" fill="none" stroke="#6e7e7f" stroke-width=".035"/>':
      id==='grass'?'<path d="M .24 .65 L .2 .48 M .24 .65 L .33 .5 M .73 .29 L .8 .15" stroke="#7f9f66" stroke-width=".035"/>':
      id==='rubble'?'<path d="M .2 .3 l .14 -.06 .08 .11 -.13 .08 Z M .6 .69 l .15 -.1 .09 .18 -.16 .06 Z" fill="#968c7b"/>':'';
    return `<pattern id="map-${id}" width="${g}" height="${g}" x="${gx}" y="${gy}" patternUnits="userSpaceOnUse"><rect width="${g}" height="${g}" fill="${t.color}"/><g transform="scale(${g})">${art}</g></pattern>`;
  }).join('');
  const terrain=map.features.map(f=>shape(f,`fill="url(#map-${f.destroyed?'rubble':surfaceOf(f)})" ${f.destroyed||f.kind==='door'&&f.open?'fill-opacity=".25"':''} stroke="${f.kind==='obstacle'?'#596767':'#76816c'}" ${f.coverDegree?'stroke-dasharray=".25 .15"':''} stroke-width="${g*(f.kind==='obstacle'?.1:.025)}" stroke-linejoin="round"`)).join('');
  const labels=map.features.map(f=>{
    const vs=vertices(f),a=vs.reduce((a,p)=>[a[0]+p[0]/vs.length,a[1]+p[1]/vs.length],[0,0]);
    const label=f.label+(f.destroyed?' · 已破坏':f.kind==='door'?(f.open?' · 开':' · 关'):'')+
      (!f.destroyed&&f.coverDegree?' · '+({slight:'少许',partial:'部分',substantial:'大量'}[f.coverDegree])+'掩体':'')+
      (f.elevation!==undefined?` · 高${f.elevation}米`:'')+(f.ramp?` · ${f.ramp.from[2]}→${f.ramp.to[2]}米`:'');
    return `<text class="map-place-label" x="${a[0]}" y="${a[1]}" text-anchor="middle" font-size="${g*.5}" fill="#273d36" stroke="#eef0dd" stroke-width="${g*.16}" paint-order="stroke" stroke-linejoin="round">${esc(label)}</text>`;
  }).join('');
  const gridLines=grid?`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#map-grid)" pointer-events="none"/>`:'';
  let axes='';
  if(grid) {
    const firstCol=Math.ceil((x-gx)/g),firstRow=Math.ceil((y-gy)/g);
    for(let n=firstCol;n<(x+w-gx)/g;n++)axes+=`<text x="${gx+(n+.5)*g}" y="${y-g*.3}" text-anchor="middle">${columnName(n)}</text>`;
    for(let n=firstRow;n<(y+h-gy)/g;n++)axes+=`<text x="${x-g*.35}" y="${gy+(n+.64)*g}" text-anchor="end">${n+1}</text>`;
  }
  const path=selection?.path?`<polyline points="${selection.path.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#fff7da" stroke-width="${g*.2}"/><polyline points="${selection.path.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#b33f35" stroke-width="${g*.09}" stroke-dasharray="${g*.3} ${g*.18}" marker-end="url(#map-arrow)"/>`:'';
  const actors=map.actors.map(a=>{
    const c=a.relation==='self'?'#176e73':a.relation==='ally'?'#326a9c':'#b8493e';
    return `<g data-actor="${esc(a.id)}"><title>${esc(a.name)}</title><circle cx="${a.position[0]}" cy="${a.position[1]}" r="${g*.39}" fill="${c}" stroke="#fff7e5" stroke-width="${g*.07}"/><text x="${a.position[0]}" y="${a.position[1]+g*.18}" text-anchor="middle" font-size="${g*.52}" font-weight="700" fill="#fff">${esc(unitSymbol(a.name))}</text></g>`;
  }).join('');
  const projections=(map.projections??[]).filter(p=>!p.attachmentId).map(p=>`<g><title>${esc(p.description)}${p.recognizedIllusion?'（已识破幻象）':''}</title><rect x="${p.position[0]-p.dimensions[0]/2}" y="${p.position[1]-p.dimensions[1]/2}" width="${p.dimensions[0]}" height="${p.dimensions[1]}" fill="#deddd7" stroke="#76816c" stroke-width="${g*.025}"/><text x="${p.position[0]}" y="${p.position[1]}" text-anchor="middle" font-size="${g*.5}" fill="#273d36">${esc(p.label)}${p.recognizedIllusion?'（已识破）':''}</text></g>`).join('');
  const marker=selection?`<circle cx="${selection.to[0]}" cy="${selection.to[1]}" r="${g*.44}" fill="none" stroke="#b33f35" stroke-width="${g*.07}"/><path d="M ${selection.to[0]-g*.15} ${selection.to[1]} h ${g*.3} M ${selection.to[0]} ${selection.to[1]-g*.15} v ${g*.3}" stroke="#b33f35" stroke-width="${g*.05}"/>`:'';
  const vague=(map.vagueObservations??[]).map(o=>`<g><title>模糊定位，尚不能精确取目标</title><circle cx="${o.position[0]}" cy="${o.position[1]}" r="${g*.42}" fill="#7776" stroke="#555" stroke-dasharray="${g*.1}" stroke-width="${g*.04}"/><text x="${o.position[0]}" y="${o.position[1]+g*.17}" text-anchor="middle" font-size="${g*.5}">?</text></g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.join(' ')}" width="${viewBox[2]}" height="${viewBox[3]}" role="img" aria-label="${esc(map.title)}战场地图" style="font-family:system-ui,sans-serif"><defs>${patterns}<pattern id="map-grid" x="${gx}" y="${gy}" width="${g}" height="${g}" patternUnits="userSpaceOnUse"><path d="M ${g} 0 H 0 V ${g}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="${g*.045}"/></pattern><marker id="map-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#b33f35"/></marker></defs><rect x="${viewBox[0]}" y="${viewBox[1]}" width="${viewBox[2]}" height="${viewBox[3]}" fill="#f4f0e6"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#map-${map.ground??'plain'})"/>${terrain}${gridLines}<g fill="#72786e" font-size="${g*.34}">${axes}</g>${labels}${projections}${path}${vague}${actors}${marker}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#a1a69a" stroke-width="${g*.04}"/></svg>`;
}
