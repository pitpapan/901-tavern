import {measurePath,routeTo,distance,contains,elevationAt} from '../combat/map.mjs';
import {mapSvg,mapFrame,terrainStyle,surfaceOf,unitSymbol} from './map-art.mjs';
export {mapSvg} from './map-art.mjs';

export function previewSelection(map,to,speed) {
  if(!map.origin)return {to,valid:false,label:'旁观地图；没有玩家移动起点'};
  const route=routeTo(map,map.origin,to),measured=route?measurePath(map,map.origin,to,route.slice(0,-1)):null;
  const valid=Boolean(measured?.valid&&measured.cost<=speed+.00001);
  return {to,valid,...(measured?{path:measured.path,cost:measured.cost}:{}),
    label:!route?'没有已知可通行路线':`路线 ${measured.length.toFixed(1)}米 · 移动力 ${measured.cost.toFixed(1)}米${valid?'':' · 超出一次移动范围'}`,
    draft:valid?`我用一个移动动作${route.length>1?`经由${JSON.stringify(route.slice(0,-1))}绕行`:''}，移动到（${to.join('，')}），不结束本回合。`:null};
}
export function previewFeature(map,to) {
  const f=[...map.features].reverse().find(f=>!f.destroyed&&['door','obstacle'].includes(f.kind)&&contains(to,f));
  if(!f)return null;
  const drafts=[];
  if(f.kind==='door')drafts.push({label:`写入${f.open?'关':'开'}门声明`,text:`我用一个移动动作${f.open?'关闭':'打开'}${f.label}（地形 ${f.id}），不结束本回合。`});
  if(f.destructible)drafts.push({label:'写入破坏声明',text:`我用当前武器攻击${f.label}（地形 ${f.id}），使用一个标准动作，不结束本回合。`});
  return {to,featureId:f.id,drafts,label:`${f.label} · ${drafts.length?'选择只写入声明，发送后才结算':'尚未提供可破坏参数'}`};
}
export function mountBattleMap({document,getState,getChatId,isActive=()=>true,on=()=>null,events=[],onDraft=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}) {
  document.getElementById('rules901-map')?.remove();document.getElementById('rules901-map-style')?.remove();
  const style=document.createElement('style');style.id='rules901-map-style';style.textContent=`
  #rules901-map{border:1px solid #77848b66;border-radius:8px;margin:3px 0;background:var(--SmartThemeBlurTintColor,#202329);color:var(--SmartThemeBodyColor,#eee);font:12px/1.5 system-ui,sans-serif;text-align:left;overflow:hidden}
  #rules901-map[hidden]{display:none!important} #rules901-map summary{cursor:pointer;padding:8px 10px}
  #rules901-map .map-toolbar,#rules901-map .map-controls{display:flex;flex-wrap:wrap;align-items:center;gap:5px;padding:5px 9px}
  #rules901-map button{font:inherit;color:inherit;border:1px solid #89958c77;border-radius:5px;background:#89958c18;padding:4px 9px;cursor:pointer}
  #rules901-map button:hover{background:#89958c44} #rules901-map button[hidden]{display:none}
  #rules901-map .map-viewport{height:clamp(220px,36vh,400px);overflow:auto;background:#c9cfc8;overscroll-behavior:contain;touch-action:pan-x pan-y;position:relative}
  #rules901-map .map-canvas{min-height:100%;width:100%;line-height:0;margin:auto}
  #rules901-map svg{display:block;width:100%;height:auto;max-width:none;cursor:crosshair;user-select:none}
  #rules901-map .map-legend{display:flex;gap:5px 12px;flex-wrap:wrap;padding:6px 10px;background:#89958c12;font-size:11px}
  #rules901-map .map-legend span{display:inline-flex;align-items:center;gap:4px} #rules901-map .map-legend i{width:12px;height:12px;border:1px solid #89958c77;display:inline-block}
  #rules901-map .map-note{padding:4px 10px;font-size:11px} #rules901-map .map-toolbar label{display:flex;align-items:center;gap:3px;margin:0 0 0 auto;white-space:nowrap}
  #rules901-map.map-expanded{position:fixed;inset:12px;z-index:10000;margin:0;background:#202827;box-shadow:0 15px 80px #000b;border-color:#9ba893}
  #rules901-map.map-expanded .map-content{max-height:calc(100dvh - 65px);overflow:auto}
  #rules901-map.map-expanded .map-viewport{height:calc(100dvh - 250px);min-height:100px} #rules901-map .map-scale{min-width:38px;text-align:center}
  `;document.head.append(style);
  const view=document.createElement('details');view.id='rules901-map';view.hidden=true;view.setAttribute('aria-label','已知战场地图');
  const title=document.createElement('summary'),content=document.createElement('div');content.className='map-content';
  const toolbar=document.createElement('div'),viewport=document.createElement('div'),canvas=document.createElement('div'),legend=document.createElement('div'),note=document.createElement('div'),controls=document.createElement('div');
  toolbar.className='map-toolbar';viewport.className='map-viewport';canvas.className='map-canvas';legend.className='map-legend';note.className='map-note';controls.className='map-controls';
  const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',fn);return b;};
  const scaleLabel=document.createElement('span');scaleLabel.className='map-scale';
  let zoom=1,grid=true,expanded=false;
  const resize=()=>{canvas.style.width=`${zoom*100}%`;scaleLabel.textContent=`${Math.round(zoom*100)}%`;};
  const setZoom=value=>{const previous=zoom;zoom=Math.max(.25,Math.min(4,value));const x=(viewport.scrollLeft+viewport.clientWidth/2)/previous,y=(viewport.scrollTop+viewport.clientHeight/2)/previous;resize();viewport.scrollLeft=x*zoom-viewport.clientWidth/2;viewport.scrollTop=y*zoom-viewport.clientHeight/2;};
  const expand=button('放大地图',()=>{expanded=!expanded;view.classList.toggle('map-expanded',expanded);expand.textContent=expanded?'收起大图':'放大地图';});
  const gridLabel=document.createElement('label'),gridCheck=document.createElement('input');gridCheck.type='checkbox';gridCheck.checked=true;gridCheck.setAttribute('aria-label','显示格网');gridLabel.append(gridCheck,document.createTextNode('格网'));
  gridCheck.addEventListener('change',()=>{grid=gridCheck.checked;draw();});
  toolbar.append(button('−',()=>setZoom(zoom/1.3)),scaleLabel,button('＋',()=>setZoom(zoom*1.3)),button('全图',()=>{
    if(!state?.map)return;const {viewBox}=mapFrame(state.map);setZoom(Math.min(1,viewport.clientHeight/(viewport.clientWidth*viewBox[3]/viewBox[2])));viewport.scrollLeft=0;viewport.scrollTop=0;
  }),button('定位自己',()=>{
    if(!state?.map?.origin)return;const {viewBox}=mapFrame(state.map),scale=viewport.clientWidth*zoom/viewBox[2];
    viewport.scrollLeft=(state.map.origin[0]-viewBox[0])*scale-viewport.clientWidth/2;viewport.scrollTop=(state.map.origin[1]-viewBox[1])*scale-viewport.clientHeight/2;
  }),expand,gridLabel);
  const draft=button('写入移动声明',()=>{if(selection?.valid&&state?.player?.activeTurn)onDraft(selection.draft);else info.textContent='当前不是你的行动回合；选点没有执行动作。';});draft.hidden=true;
  const info=document.createElement('span');controls.append(draft,info);viewport.append(canvas);content.append(toolbar,viewport,legend,note,controls);view.append(title,content);
  const interactionControls=document.createElement('span');controls.prepend(interactionControls);
  let state=null,selection=null,disposed=false,request=0,currentChat,signature='',timer=null,wantOpen=false;
  function draw(){if(!state?.map)return;const map=state.map;canvas.innerHTML=mapSvg(map,selection,{grid});resize();draft.hidden=!selection?.valid;info.textContent=selection?.label??'点击选点预览；拖动平移';
    interactionControls.replaceChildren();
    for(const item of selection?.drafts??[])interactionControls.append(button(item.label,()=>{
      if(state?.player?.activeTurn)onDraft(item.text);else info.textContent='当前不是你的行动回合；选点没有执行动作。';
    }));
    legend.replaceChildren();
    for(const id of new Set([map.ground??'plain',...map.features.map(surfaceOf)])){const item=document.createElement('span'),swatch=document.createElement('i');swatch.style.background=terrainStyle[id].color;item.append(swatch,document.createTextNode(terrainStyle[id].name));legend.append(item);}
    const units=map.actors.map(a=>`${unitSymbol(a.name)}=${a.name}${a.relation!=='self'&&map.origin?`（${distance(a.position,map.origin).toFixed(1)}米）`:''}`);
    note.textContent=`每格 ${map.gridSize??1.5}米${map.origin?` · 自身所在高度 ${elevationAt(map,map.origin)}米`:''} · ${units.join(' · ')}`;
  }
  // Native drag-to-pan; a drag never also selects a destination.
  let drag=null,moved=false;
  viewport.addEventListener('pointerdown',e=>{if(e.button!==0||e.pointerType==='touch')return;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};moved=false;viewport.setPointerCapture(e.pointerId);});
  viewport.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>4)moved=true;if(moved){viewport.scrollLeft=drag.left-dx;viewport.scrollTop=drag.top-dy;}});
  viewport.addEventListener('pointerup',()=>{drag=null;});viewport.addEventListener('pointercancel',()=>{drag=null;moved=false;});
  viewport.addEventListener('click',e=>{if(moved){moved=false;return;}const svg=canvas.querySelector('svg'),matrix=svg?.getScreenCTM();if(!matrix)return;const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const local=p.matrixTransform(matrix.inverse());
    const [x,y,w,h]=state.map.bounds;if(local.x<x||local.y<y||local.x>x+w||local.y>y+h)return;
    const to=[Math.round(local.x*10)/10,Math.round(local.y*10)/10];
    selection=previewFeature(state.map,to)??previewSelection(state.map,to,state.player?.speed??0);draw();
  });
  const escape=e=>{if(e.key==='Escape'&&expanded){expanded=false;view.classList.remove('map-expanded');expand.textContent='放大地图';}};document.addEventListener('keydown',escape);
  async function refresh(){const chat=getChatId(),token=++request;
    if(chat!==currentChat||!isActive()){view.hidden=true;view.open=false;view.classList.remove('map-expanded');expanded=false;expand.textContent='放大地图';signature='';selection=null;currentChat=chat;zoom=1;}
    if(!chat||!isActive()||disposed)return;
    try {const next=await getState();if(disposed||token!==request||chat!==getChatId()||!isActive())return;
      const send=document.getElementById('send_form');if(!send)return;if(view.parentNode!==send.parentNode)send.before(view);
      if(!next?.map){view.hidden=true;return;}view.hidden=false;if(wantOpen){view.open=true;wantOpen=false;}
      const value=JSON.stringify([next.revision,next.map,next.player?.speed,next.player?.activeTurn]);if(signature===value)return;
      signature=value;state=next;selection=null;view.dataset.revision=String(next.revision);view.dataset.chatId=chat;title.textContent=`战场 · ${next.map.title}`;draw();
    }catch(error){if(token===request)view.hidden=true;console.warn('[901地图]',error.message);}}
  function schedule(){if(getChatId()!==currentChat||!isActive()){view.hidden=true;request++;}if(timer!==null)clearTimer(timer);timer=setTimer(()=>{timer=null;void refresh();},0);}
  const listeners=[...new Set(events.filter(Boolean))].map(e=>on(e,schedule));void refresh();
  return {refresh:schedule,async open(){wantOpen=true;await refresh();},dispose(){disposed=true;request++;if(timer!==null)clearTimer(timer);listeners.forEach(l=>l?.stop?.());document.removeEventListener('keydown',escape);view.remove();style.remove();}};
}
