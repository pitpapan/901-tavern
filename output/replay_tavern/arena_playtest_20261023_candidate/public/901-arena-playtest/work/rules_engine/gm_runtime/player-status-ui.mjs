// A local TavernHelper view of MVU state. No model calls or rules writes.
export function mountPlayerStatus({document,getState,getChatId,getAvatar=()=>null,isActive=()=>true,
  on=()=>null,events=[],setTimer=setTimeout,clearTimer=clearTimeout}) {
  document.getElementById('rules901-player-status')?.remove();
  document.getElementById('rules901-player-status-style')?.remove();
  const style=document.createElement('style');style.id='rules901-player-status-style';
  style.textContent=`
    #rules901-player-status{margin:3px 0;padding:0 9px;border:1px solid var(--SmartThemeBorderColor,#7776);border-radius:9px;background:var(--SmartThemeBlurTintColor,#202329);color:var(--SmartThemeBodyColor,#eee);font-size:12px;text-align:left;}
    #rules901-player-status[hidden]{display:none!important}
    #rules901-player-status summary{cursor:pointer;list-style:none;padding:6px 0;display:flex;align-items:center;gap:8px;min-height:43px;}
    #rules901-player-status summary::-webkit-details-marker{display:none}
    #rules901-player-status .p-avatar{width:34px;height:34px;object-fit:cover;border-radius:7px;flex:none;}
    #rules901-player-status .p-main{flex:1;min-width:0;line-height:1.6;}
    #rules901-player-status .p-title{display:flex;justify-content:space-between;gap:8px;}
    #rules901-player-status .p-quick{font-size:11px;opacity:.85;overflow-wrap:anywhere;}
    #rules901-player-status .p-arrow{opacity:.6;flex:none;}
    #rules901-player-status[open] .p-arrow{transform:rotate(180deg)}
    #rules901-player-status .p-body{border-top:1px solid var(--SmartThemeBorderColor,#7776);max-height:min(32vh,230px);overflow-y:auto;padding:5px 0 8px;line-height:1.8;}
    #rules901-player-status .p-row{overflow-wrap:anywhere;margin:2px 0;}
    #rules901-player-status .p-attributes{opacity:.8;font-size:11px;}
  `;
  document.head.append(style);
  const view=document.createElement('details');view.id='rules901-player-status';view.hidden=true;
  view.setAttribute('aria-label','玩家自身状态');
  const summary=document.createElement('summary'),avatar=document.createElement('img');
  avatar.className='p-avatar';avatar.alt='玩家头像';avatar.hidden=true;
  const main=document.createElement('div');main.className='p-main';
  const title=document.createElement('div');title.className='p-title';
  const name=document.createElement('strong'),health=document.createElement('span');title.append(name,health);
  const quick=document.createElement('div');quick.className='p-quick';main.append(title,quick);
  const arrow=document.createElement('span');arrow.className='p-arrow';arrow.textContent='⌄';arrow.setAttribute('aria-hidden','true');
  summary.append(avatar,main,arrow);
  const body=document.createElement('div');body.className='p-body';view.append(summary,body);
  let disposed=false,timer=null,request=0,currentChat,rendered='',pending=false,reading=false,wantOpen=false;
  const hiddenLegacy=new Set();
  function hideLegacy() {
    for(const item of document.querySelectorAll('#chat .mes_text details')) {
      if(/·\s*自身状态$/.test(item.querySelector('summary')?.textContent?.trim()??'')) {
        if(!item.hidden)hiddenLegacy.add(item);
        item.hidden=true;
      }
    }
  }
  function row(text,className='') {
    const el=document.createElement('div');el.className=`p-row ${className}`;el.textContent=text;body.append(el);
  }
  async function refresh() {
    if(disposed)return;
    // Hide old-chat values synchronously before an asynchronous MVU read.
    const chat=getChatId();
    if(chat!==currentChat||!isActive()){view.hidden=true;rendered='';view.open=false;currentChat=chat;request++;}
    if(!chat||!isActive())return;
    if(reading){pending=true;return;}
    reading=true;const token=++request;
    try {
      const state=await getState();
      if(disposed||token!==request||chat!==getChatId()||!isActive())return;
      const send=document.getElementById('send_form');
      if(!send)return;
      if(view.parentNode!==send.parentNode)send.before(view);
      hideLegacy();
      const p=state?.player;
      if(!p){view.hidden=true;return;}
      const image=getAvatar(),signature=JSON.stringify([state,image]);
      view.hidden=false;
      if(wantOpen){view.open=true;wantOpen=false;}
      if(signature===rendered)return;
      rendered=signature;view.dataset.revision=String(state.revision);view.dataset.chatId=chat;
      name.textContent=p.name;health.textContent=`生命 ${p.health.intact}/${p.hpMax}`;
      avatar.hidden=!image;if(image)avatar.src=image;else avatar.removeAttribute('src');
      const defense=p.defense.pending?'待声明':`${p.defense.total}DP`;
      quick.textContent=`攻击 ${p.attack.dp}DP · 防御 ${defense} · 速度 ${p.speed}米`;
      body.replaceChildren();
      row(Object.entries(p.energy).map(([k,v])=>`${k} ${v.current}/${v.max}`).join(' · ')||'无能量池');
      row(`剩余动作：标准 ${p.actions.standard} · 移动 ${p.actions.move} · 迅捷 ${p.actions.swift}${p.activeTurn?'':'（非主动回合）'}`);
      row(`状态：${p.statuses.length?p.statuses.map(s=>`${s.type} ${s.points}`).join('、'):'无'} · ${p.life}`);
      row(`伤势：B ${p.health.B} / L ${p.health.L} / A ${p.health.A}`);
      row(p.defense.pending?'防御：待声明防御方式后计算':`防御 ${p.defense.total}DP${p.declaredDefense?' · 已声明守势，沿原有效期':''}`);
      row(Object.entries(p.attributes).map(([k,v])=>`${k} ${v}`).join(' · '),'p-attributes');
    } catch(error) {
      if(!disposed&&token===request){view.hidden=true;console.warn('[901玩家状态]',error.message);}
    } finally {
      reading=false;
      if(pending){pending=false;schedule();}
    }
  }
  function schedule() {
    // Chat switches must clear the preceding player's display immediately.
    if(getChatId()!==currentChat||!isActive()){view.hidden=true;request++;}
    if(timer!==null)clearTimer(timer);
    timer=setTimer(()=>{timer=null;void refresh();},0);
  }
  const listeners=[...new Set(events.filter(Boolean))].map(event=>on(event,schedule));
  void refresh();
  return {refresh:schedule,async open(){wantOpen=true;await refresh();},
    dispose(){disposed=true;request++;if(timer!==null)clearTimer(timer);listeners.forEach(l=>l?.stop?.());
      hiddenLegacy.forEach(el=>{el.hidden=false;});view.remove();style.remove();}};
}
