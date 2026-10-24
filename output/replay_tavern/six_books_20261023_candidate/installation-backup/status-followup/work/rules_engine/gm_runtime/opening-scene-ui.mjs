import {stoneWithdrawalBinding} from './opening.mjs';
// Local host control only; no model tool exposes this mutation.
export function mountOpeningSceneHost({document,getSession,isActive,tavern}) {
  const open=()=>{
    if(!isActive())return;
    const dialog=document.createElement('dialog');dialog.setAttribute('aria-label','901 当前遭遇登记');
    dialog.style.cssText='width:min(800px,90vw);max-height:85vh;background:#202329;color:white;overflow:auto';
    const intro=document.createElement('p');intro.textContent='主持核对实际场景后登记。战斗可用城卫、老兵、石像、安装者、催眠魔兽、Chuul、常态古雷姆林；参战者与地图仅取当前事实。规则场景使用kind:"ruleScene"，填写source以及objects/events/feats/possessions中的所需项：仅补已确认条目与未知库存，不重置旧存档。';
    const input=document.createElement('textarea');input.setAttribute('aria-label','当前遭遇配置');input.style.cssText='width:100%;height:45vh;font-family:monospace';input.value=JSON.stringify(stoneWithdrawalBinding(),null,2);
    const status=document.createElement('p'),save=document.createElement('button');save.textContent='确认实际现场并保存';
    save.onclick=async()=>{try {const config=JSON.parse(input.value),result=await (config.kind==='ruleScene'?getSession().registerRuleScene(config):getSession().registerEncounter(config));status.textContent=`已保存：revision ${result.revision}。后续明确行动将使用这份场景资料。`;}catch(e){status.textContent=e.message;}};
    const close=document.createElement('button');close.textContent='关闭';close.onclick=()=>{dialog.close();dialog.remove();};
    dialog.append(intro,input,save,close,status);document.body.append(dialog);dialog.showModal();
  };
  const win=document.defaultView;win.addEventListener('901-opening-host-register',open);
  if(tavern?.SlashCommandParser&&tavern?.SlashCommand)tavern.SlashCommandParser.addCommandObject(tavern.SlashCommand.fromProps({name:'901-scene',callback:async()=>{open();return '';},helpString:'主持登记当前已确认遭遇（后台设置）。'}));
  return {open,dispose(){win.removeEventListener('901-opening-host-register',open);}};
}
