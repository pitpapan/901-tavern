import {stoneWithdrawalBinding} from './opening.mjs';
// Local host control only; no model tool exposes this mutation.
export function mountOpeningSceneHost({document,getSession,isActive,tavern}) {
  const open=()=>{
    if(!isActive())return;
    const dialog=document.createElement('dialog');dialog.setAttribute('aria-label','901 当前遭遇登记');
    dialog.style.cssText='width:min(800px,90vw);max-height:85vh;background:#202329;color:white;overflow:auto';
    const intro=document.createElement('p');intro.textContent='主持核对当前实际场景后登记：参与者只填实际在场者；位置、地图、目标取当前现场。这里是石像撤离样板，登记不开始战斗、不移动角色、不治疗、不授奖。入都T0勿登记未到达的洞穴。已支持城卫、老兵普通战斗与石像阵地，其他敌人特能仍须适配。';
    const input=document.createElement('textarea');input.setAttribute('aria-label','当前遭遇配置');input.style.cssText='width:100%;height:45vh;font-family:monospace';input.value=JSON.stringify(stoneWithdrawalBinding(),null,2);
    const status=document.createElement('p'),save=document.createElement('button');save.textContent='确认实际现场并保存';
    save.onclick=async()=>{try {const result=await getSession().registerEncounter(JSON.parse(input.value));status.textContent=`已保存：revision ${result.revision}；${result.operationId}。下一条明确接战声明可使用此遭遇。`;}catch(e){status.textContent=e.message;}};
    const close=document.createElement('button');close.textContent='关闭';close.onclick=()=>{dialog.close();dialog.remove();};
    dialog.append(intro,input,save,close,status);document.body.append(dialog);dialog.showModal();
  };
  const win=document.defaultView;win.addEventListener('901-opening-host-register',open);
  if(tavern?.SlashCommandParser&&tavern?.SlashCommand)tavern.SlashCommandParser.addCommandObject(tavern.SlashCommand.fromProps({name:'901-scene',callback:async()=>{open();return '';},helpString:'主持登记当前已确认遭遇（后台设置）。'}));
  return {open,dispose(){win.removeEventListener('901-opening-host-register',open);}};
}
