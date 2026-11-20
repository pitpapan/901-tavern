import { ABILITIES } from './catalog.mjs';
import { createCombatHost } from './host.mjs';

export function installCombatHost({controller,encounters={},document,tavern,onError=()=>{},onStory=()=>{},registerTool=true}) {
  let host;
  function clear() {document.getElementById('901-combat-choice')?.remove();}
  function showChoices(choices) {
    clear();
    const dialog=document.createElement('dialog');dialog.id='901-combat-choice';
    dialog.setAttribute('aria-label','901 战斗行动选择');
    dialog.style.cssText='max-width:44rem;max-height:85vh;overflow:auto;padding:1rem;background:#202329;color:white';
    const title=document.createElement('h3');
    title.textContent=choices.context.phase==='reaction'?'受击反应：使用还是保留伤害转换':`请选择${choices.context.participants.find(a=>a.id===choices.actorId)?.name??'角色'}本次行动`;
    dialog.append(title);
    const select=document.createElement('select');select.setAttribute('aria-label','战斗行动');select.style.width='100%';
    choices.options.forEach(({command},index)=>{
      const option=document.createElement('option');option.value=String(index);
      option.textContent=[ABILITIES[command.abilityId]?.name??command.abilityId,
        command.targetId?choices.context.participants.find(a=>a.id===command.targetId)?.name??command.targetId:'',
        command.choice==='conversion'?'使用转换':command.choice==='decline'?'保留转换':'',
        command.tier?`${command.tier}档`:'',command.strength?'力量攻击':'',command.payment==='restraint'?'精神束缚代付':'',
        command.resource??'',command.to?`到 ${command.to.map(n=>Number(n.toFixed(2))).join(',')} 米`:''].filter(Boolean).join(' · ');
      select.append(option);
    });
    const detail=document.createElement('pre');detail.style.whiteSpace='pre-wrap';
    const update=()=>{
      const c=choices.options[Number(select.value)].command;
      const display=choices.context.legalOptions[Number(select.value)];
      const p=choices.context.previews[display.preview],names={standard:'标准',move:'移动',swift:'迅捷'};
      detail.textContent=[
        choices.context.abilities[c.abilityId]?.text,
        p.actions?`动作消耗：${Object.entries(p.actions).map(([k,n])=>`${names[k]??k}×${n}`).join('、')}`:null,
        p.energy?`能量消耗：${Object.entries(p.energy).map(([k,n])=>`${k}${n}`).join('、')}`:null,
        p.payment,p.timing,p.cost,p.attack?`攻击：${p.attack}`:null,
        p.after?`使用后：攻击${p.after.attackDP}DP；防御${p.after.defenseDP}DP，附成${p.after.defenseAuto}；速度${p.after.speedM}米。`:null,
        p.affected?.length?`涉及：${p.affected.map(id=>choices.context.participants.find(a=>a.id===id)?.name??id).join('、')}`:null,
      ].filter(Boolean).join('\n\n');
    };
    select.addEventListener('change',update);dialog.append(select,detail);
    const submit=document.createElement('button');submit.textContent='执行所选行动';
    submit.addEventListener('click',async()=>{
      submit.disabled=true;
      try {const index=Number(select.value);dialog.close();clear();await host.playerChoice({option:index,expectedRevision:choices.revision});}
      catch(error) {onError(error);}
    });
    const later=document.createElement('button');later.textContent='稍后选择';
    later.addEventListener('click',()=>{dialog.close();clear();});
    for(const button of [submit,later]) button.style.cssText='background:#34445a;color:#fff;border:1px solid #8090a4;border-radius:4px;padding:6px 10px;margin-right:8px;cursor:pointer';
    dialog.append(submit,later);document.body.append(dialog);update();dialog.showModal();
  }
  host=createCombatHost({controller,encounters,showChoices,onStory});
  function showParameters() {
    clear();
    const dialog=document.createElement('dialog');dialog.id='901-combat-choice';
    dialog.setAttribute('aria-label','901 主持补参');
    const intro=document.createElement('p');intro.textContent='只填写已经确定的参数；留空表示不改。不会根据留空字段自动补造数值。';
    const actors=document.createElement('select');actors.setAttribute('aria-label','补参角色');
    for(const a of Object.values(controller.read().battle.actors)) {
      const option=document.createElement('option');option.value=a.id;option.textContent=a.name;actors.append(option);
    }
    dialog.append(intro,actors);
    const fields={};
    for(const [key,label] of Object.entries({bowStrength:'苍穹弓力量要求',weaponSize:'狮子王体积',ammunition:'现有普通箭数量',flowMax:'流风上限',flowCurrent:'流风当前值'})) {
      const row=document.createElement('label');row.textContent=label;
      const input=document.createElement('input');input.type='number';input.min='0';input.step='1';input.setAttribute('aria-label',label);
      row.append(input);dialog.append(row,document.createElement('br'));fields[key]=input;
    }
    const action=document.createElement('select');action.setAttribute('aria-label','流风启动动作');
    for(const [key,label] of Object.entries({'':'不改启动动作',standard:'标准',move:'移动',swift:'迅捷',free:'自由'})) {
      const option=document.createElement('option');option.value=key;option.textContent=label;action.append(option);
    }
    const save=document.createElement('button');save.textContent='保存主持参数';
    save.addEventListener('click',async()=>{
      const values=Object.fromEntries(Object.entries(fields).filter(([,input])=>input.value!=='').map(([k,input])=>[k,Number(input.value)]));
      if(action.value) values.flowAction=action.value;
      try {await host.parameters(actors.value,values);dialog.close();clear();}
      catch(error) {onError(error);}
    });
    dialog.append(action,save);document.body.append(dialog);dialog.showModal();
  }
  const toolName='trpg901_combat';
  if(registerTool) tavern.unregisterFunctionTool?.(toolName);
  if(registerTool) tavern.registerFunctionTool?.({
    name:toolName,displayName:'901 战斗接口',
    description:'读取当前战斗、推进NPC或开始已登记遭遇。玩家行动与反应只能由玩家本地选择；返回awaiting_player即等待玩家。返回story即战斗已结束，伤势与能量已经保存，可继续剧情；不要自行改数。缺参由主持界面填写。',
    parameters:{type:'object',additionalProperties:false,required:['mode'],
      properties:{mode:{type:'string',enum:['read','continue',...(Object.keys(encounters).length?['enter']:[])]},
        ...(Object.keys(encounters).length?{encounterId:{type:'string',enum:Object.keys(encounters)}}:{})}},
    shouldRegister:()=>!controller.busy&&tavern.canPerformToolCalls?.('normal')===true,
    action:async args=>JSON.stringify(args.mode==='enter'?await host.enter(args.encounterId):args.mode==='continue'?await host.handleTurn():await host.read()),
  });
  return {...host,showParameters,dispose(){clear();if(registerTool)tavern.unregisterFunctionTool?.(toolName);}};
}
