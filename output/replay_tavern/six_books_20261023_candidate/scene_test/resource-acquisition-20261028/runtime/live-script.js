// Isolated UI acceptance harness. This script never runs on a production card.
const testName = '901 资源取得隔离验收 20261028';
const rootUrl = '/901-resource-acceptance-20261028/';
const doc = window.top.document;
const context = () => SillyTavern.getContext?.() ?? SillyTavern;
const guard = () => {
  const c = context();
  if (c.characters?.[c.characterId]?.name !== testName) throw Error('仅允许本批隔离测试卡');
  if (!c.chat?.length) throw Error('测试聊天尚未就绪');
  return c;
};
guard();
await waitGlobalInitialized('Mvu');
const {createOpeningFixture} = await import(rootUrl+'work/rules_engine/gm_runtime/opening.mjs');
const {createIntegratedSession} = await import(rootUrl+'work/rules_engine/gm_runtime/integrated.mjs');
const {createReplayCheckRuntime} = await import(rootUrl+'work/rules_engine/gm_runtime/replay-check.mjs');
const {RESOURCE_DEFINITIONS} = await import(rootUrl+'work/rules_engine/resource-definitions.mjs');
const {carryTestState,tavernAnchor,adoptNativeChatBranch,readDebugState} = await import(rootUrl+'work/rules_engine/mvu_poc/adapter.mjs');
const {installCombatHost}=await import(rootUrl+'work/rules_engine/combat/host-ui.mjs');
const {createCombatRuntime}=await import(rootUrl+'work/rules_engine/combat/runtime.mjs');
const {mountOpeningSceneHost}=await import(rootUrl+'work/rules_engine/gm_runtime/opening-scene-ui.mjs');
const id = 'candidate-901-magic-bundle-ba577210e69dafd5';
const definition = RESOURCE_DEFINITIONS[id];
if (!definition?.acquisition) throw Error('当前候选取得定义未加载');
const source = '2026-10-28 UI隔离夹具；不代表正式角色取得';
const fixture = createOpeningFixture();
fixture.actors.player.state.xp = 100;
const unchangedActors = JSON.stringify(Object.fromEntries(Object.entries(fixture.actors).filter(([k])=>k!=='player')));
let busy = false;
let naturalGateInstalled=false;
let combatSession;
let jointProfile=context().chatMetadata?.resource_joint_profile??null;
let jointRun=null,jointListeners=[];
const branchParent='901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms';
function branchContext(){
  const c=guard();
  if(c.getCurrentChatId()===branchParent||c.chatMetadata?.main_chat!==branchParent)throw Error('仅允许从本批原聊天建立的原生独立分支');
  return c;
}
function inspectBranchIdentity(){
  const c=branchContext();
  const value=readDebugState({mvu:Mvu,getAnchor:()=>tavernAnchor(c.chat.length-1,c)});
  return report('分支身份检查',value);
}
async function acceptBranch(){
  const c=branchContext();
  const value=await adoptNativeChatBranch({mvu:Mvu,tavern:c,expectedParentChatId:branchParent,expectedRevision:root()?.revision});
  combatSession=undefined;
  await c.saveChat();return report('明确接纳原生分支',value);
}
async function saveFailureCast(){
  branchContext();
  return settle('branch-save-cast',{kind:'rule',action:'mechanism',actorId:'player',objectId:'eldritchBlast',operation:'cast',part:'D'},
    '我明确向已同意受术的黄泉施放一次D阶魔能爆；本次仅隔离保存失败与同一操作重试验收。');
}
const combatId='resource-turn-20261028';
const combatScene='资源施法回合隔离演练，不计入正式剧情。御临风与黄泉相距1米，保留当前伤势与能量；姜子尤和布莱特旁观且不参战。黄泉作为已同意的受术目标，每个自己的回合只选择结束回合，保持原地，不攻击、不主动防御、不恢复。御临风动作只由玩家按钮选择。御临风离开原点3米范围即结束演练，伤势和能量保留，不授予奖励。';
const naturalScene='资源引擎自然语言隔离验收，不计入正式剧情。御临风与黄泉均为测试夹具，黄泉站在1米外作为已同意的演练目标，清晰可见且无遮挡，语言、姿势和法器条件满足；姜子尤与布莱特旁观。只在玩家明确声明时行动；本场允许完整长休恢复后再试一次D阶魔能爆，不自行开始战斗或授予奖励。';
const panel = doc.createElement('section');
panel.id = 'resource-acceptance-20261028';
panel.style.cssText='padding:8px;background:#17252d;color:white;border:1px solid #7aa;max-height:45vh;overflow:auto;position:relative;z-index:10';
const title=doc.createElement('strong');title.textContent=testName+' · 不调用模型';panel.append(title);
const controls=doc.createElement('div');controls.style.cssText='display:flex;flex-wrap:wrap;white-space:normal';panel.append(controls);
const summary=doc.createElement('div');summary.style.cssText='white-space:normal;overflow-wrap:anywhere';panel.append(summary);
const details=doc.createElement('details'),caption=doc.createElement('summary');caption.textContent='查看完整回执';details.append(caption);panel.append(details);
const output=doc.createElement('pre');output.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px';details.append(output);
doc.getElementById(panel.id)?.remove();
doc.getElementById('send_form').prepend(panel);
const root = () => {const c=guard();return Mvu.getMvuData({type:'message',message_id:c.chat.length-1})?.stat_data?.['901_rules_poc'];};
const snapshot = () => {
  const c=guard(),r=root(),s=r?.actors.player.state;
  return {chatId:c.getCurrentChatId?.()??c.chatId,messageId:c.chat.length-1,swipeId:c.chat.at(-1).swipe_id??0,
    contractVersion:definition.contractVersion,initialized:!!r,revision:r?.revision,xp:s?.xp,
    completedStages:s?.learnedResources?.[id]?.completedStages,pool:s?.resources?.精神魔力,
    gift:s?.learnedResources?.['imperial-magic:D:魔能爆'],
    otherActorsUnchanged:r?JSON.stringify(Object.fromEntries(Object.entries(r.actors).filter(([k])=>k!=='player')))===unchangedActors:null,
    operations:r?Object.keys(r.operations):[],combat:r?.battle?{id:r.battle.id,mode:r.battle.mode,status:r.battle.status,round:r.battle.round,activeId:r.battle.activeId,pending:r.battle.pending,playerTurn:s.turn,cooldowns:s.resourceCooldowns,huangHealth:r.actors.huang.state.health}:null};
};
const report=(action,result)=>{const data={action,result,state:snapshot()},s=data.state;
  summary.textContent=`${action}：${typeof result==='string'?result:result.status}｜楼层 ${s.messageId}／页 ${s.swipeId}｜修订 ${s.revision??'未初始化'}｜XP ${s.xp??'—'}｜阶段 ${(s.completedStages??[]).join('→')||'无'}｜精神魔力 ${s.pool?`${s.pool.current}/${s.pool.max}`:'无'}｜赠术 ${s.gift?'魔能爆'+s.gift.grade:'无'}｜其他人物 ${s.otherActorsUnchanged===true?'未变':'尚未核对'}`;
  output.textContent=JSON.stringify(data,null,2);console.log('[901-RESOURCE-ACCEPTANCE]',JSON.stringify(data));return data;};
function session(){const c=guard();return createIntegratedSession({baseline:fixture.baseline,mvu:Mvu,tavern:c,
  fixtureFactory:()=>structuredClone({...fixture,registerBinding:undefined,encounters:{}}),
  generateRaw:async()=>{throw Error('本验收不调用模型');},createChatMessages:async()=>{},setChatMessages:async()=>{}});}
function battleSession(){
  if(combatSession)return combatSession;
  const tavern=guard();
  const generateCombat=async request=>{
    const decision=JSON.parse(request.user_input);
    if(decision.activeId!=='huang'||decision.scenario!==combatScene)return generateRaw(request);
    const end=decision.legalOptions.findIndex(option=>option.abilityId==='end');
    if(end<0)throw Error('受术目标当前没有合法结束回合选项');
    const text=await generateRaw({...request,user_input:JSON.stringify({...decision,legalOptions:[decision.legalOptions[end]]})});
    const selected=JSON.parse(text);
    if(selected.option!==0)throw Error('受术目标须选择当前唯一允许的结束回合');
    console.log('[901-RESOURCE-COMBAT-NPC]',JSON.stringify({allowed:['end'],modelOption:0,engineOption:end}));
    return JSON.stringify({...selected,option:end});
  };
  combatSession=createIntegratedSession({baseline:fixture.baseline,mvu:Mvu,tavern,generateRaw:generateCombat,createChatMessages,setChatMessages,
    fixtureFactory:()=>createOpeningFixture(),
    prepareBattle:b=>{b.actors.huang.abilities=['end'];return b;},
    makeHost:options=>installCombatHost({...options,document:doc,tavern,registerTool:false,onError:e=>report('战斗错误',{status:'error',message:e.message})}),
    onProgress:value=>report('战斗保存',value)});
  return combatSession;
}
async function prepareCombat(){
  const c=guard();
  if(c.chat.some(m=>m.extra?.resourceAcceptanceCombat))return report('准备战斗','已登记，保持原值');
  if(c.chat.length!==12||root()?.revision!==10)throw Error('本批从12楼消息、修订10的已验状态继续');
  const previous=tavernAnchor(11,c);
  await createChatMessages([{role:'assistant',name:testName,message:combatScene,extra:{resourceAcceptanceCombat:true}}]);
  await carryTestState({mvu:Mvu,expectedChatId:previous.chatId,getSourceAnchor:()=>previous,getAnchor:()=>tavernAnchor(guard().chat.length-1,guard())});
  await battleSession().registerEncounter({id:combatId,instanceId:combatId,scenario:combatScene,description:'D魔能爆战斗回合隔离演练',
    participants:['player','huang'],positions:{player:[0,0],huang:[1,0]},teams:{player:'施法方',huang:'受术方'},
    objective:{kind:'exitRadius',actorIds:['player'],center:[0,0],radius:3,resolutionKind:'withdrawal',label:'演练退出',description:'离开演练范围，保留伤势与资源，不自动奖励'},
    map:{title:'资源回合隔离演练',bounds:[-6,-6,12,12],ground:'stone',gridSize:1,features:[]}});
  await battleSession().registerRuleScene({source,mechanismPlans:{eldritchBlast:{DCombat:{...root().ruleScene.objects.eldritchBlast.plans.D,source,operations:['cast']}}}});
  await guard().saveChat();return report('准备战斗','ready');
}
async function castCombat(){
  const s=battleSession(),saved=s.controller.read();
  const operationId='combat-acceptance/'+guard().getCurrentChatId()+'/D-cast';
  const command={actorId:'player',abilityId:'mechanism',objectId:'eldritchBlast',operation:'cast',part:'DCombat'};
  const result=await s.controller.submitCommand({operationId,expectedRevision:saved.revision,command});
  return report('战斗D魔能爆',result);
}
async function repeatCombat(){
  const c=guard(),r=root(),chatId=c.getCurrentChatId(),operationId='combat-acceptance/'+chatId+'/D-cast';
  if(!r.operations[operationId])throw Error('先完成本批战斗D施法');
  const runtime=createCombatRuntime({mvu:Mvu,expectedChatId:chatId,getAnchor:()=>tavernAnchor(guard().chat.length-1,guard())});
  const result=await runtime.dispatch({operationId,expectedRevision:r.revision,playerAuthorized:true,
    command:{actorId:'player',abilityId:'mechanism',objectId:'eldritchBlast',operation:'cast',part:'DCombat'}});
  await guard().saveChat();return report('重复战斗D请求',result);
}
async function newCastCombat(){
  const s=battleSession();return report('同回合新施法',await s.controller.submitCommand({operationId:'combat-acceptance/'+guard().getCurrentChatId()+'/D-second',expectedRevision:s.controller.read().revision,
    command:{actorId:'player',abilityId:'mechanism',objectId:'eldritchBlast',operation:'cast',part:'DCombat'}}));
}
function retentionCheckpointPresent(){
  const m=guard().chat[25];
  const first=m?.swipes?.[0]??m?.mes;
  return typeof first==='string'&&first.startsWith('历史保留隔离验收新快照：');
}
async function markRetentionSnapshot(){
  const c=guard(),messageId=c.chat.length-1;
  if(messageId!==25||!retentionCheckpointPresent())throw Error('仅标记本批新建25楼');
  const before=Mvu.getMvuData({type:'message',message_id:messageId});
  if(!before?.stat_data?.['901_rules_poc'])throw Error('快照须已有真实规则状态');
  const next=structuredClone(before);next.snapshot=true;
  await Mvu.replaceMvuData(next,{type:'message',message_id:messageId});
  const saved=Mvu.getMvuData({type:'message',message_id:messageId});
  if(saved.snapshot!==true||JSON.stringify(saved.stat_data)!==JSON.stringify(before.stat_data))throw Error('快照标记读回不符');
  await guard().saveChat();return saved;
}
async function prepareRetention(){
  const c=guard();
  if(retentionCheckpointPresent())return report('建立保留快照','已有本批新楼，保持原页');
  if(c.chat.length!==25||root()?.revision!==23||root()?.battle?.mode!=='story')throw Error('本批仅从楼24／修订23战后状态继续');
  const sourceAnchor=tavernAnchor(24,c),before=JSON.stringify(root());
  await createChatMessages([{role:'assistant',name:testName,message:'历史保留隔离验收新快照：本页保留真实战后精神10/12；不生成剧情，不重置人物。旧已清理楼层保持原状。',extra:{resourceAcceptanceRetention:true}}]);
  await carryTestState({mvu:Mvu,expectedChatId:sourceAnchor.chatId,getSourceAnchor:()=>sourceAnchor,getAnchor:()=>tavernAnchor(25,guard())});
  if(JSON.stringify(root())!==before)throw Error('新快照改变了规则根');
  await markRetentionSnapshot();return report('建立保留快照','ready');
}
async function addRetentionSwipe(){
  const c=guard();if(c.chat.length!==26||!retentionCheckpointPresent())throw Error('备用页仅用于新快照25楼');
  const m=getChatMessages(25,{include_swipes:true})[0];
  if(m.swipes.length!==1)return report('新增保留备用页','已有备用页，保持原值');
  await setChatMessages([{message_id:25,swipe_id:m.swipe_id,swipes:[...m.swipes,'新快照备用页：等待明确执行完整长休，只在本页保存实际恢复结果。'],
    swipes_data:[...m.swipes_data,{}],swipes_info:[...m.swipes_info,{}]}]);
  await guard().saveChat();return report('新增保留备用页','请原生右箭头切到页1，再执行备用页长休');
}
async function restRetentionSwipe(){
  const c=guard();if(c.chat.length!==26||c.chat[25].swipe_id!==1||!retentionCheckpointPresent())throw Error('长休只在新快照25楼页1执行');
  if(!root()){
    const sourceAnchor={chatId:c.getCurrentChatId(),messageId:24,swipeId:c.chat[24].swipe_id??0};
    await carryTestState({mvu:Mvu,expectedChatId:sourceAnchor.chatId,getSourceAnchor:()=>sourceAnchor,getAnchor:()=>tavernAnchor(25,guard())});
  }
  const result=await settle('retention-rest',{kind:'recovery',type:'rest',rest:'long',minutes:480},'御临风已经完整长休8小时，现在不施法。');
  if(!['applied','already_applied'].includes(result.result?.status))throw Error('长休未结算，不标记备用页完成');
  await markRetentionSnapshot();return report('备用页长休快照',result.result);
}
async function appendRetentionWindow(){
  const c=guard(),operationId='gm-runtime/'+c.getCurrentChatId()+'/ui-retention-rest';
  if(!retentionCheckpointPresent()||!root()?.operations[operationId])throw Error('先在25楼备用页完成真实长休快照');
  if(c.chat.length<26||c.chat.length>50)throw Error('本批只推进26–49楼');
  while(guard().chat.length<50){
    const now=guard(),sourceAnchor=tavernAnchor(now.chat.length-1,now),before=JSON.stringify(root()),number=now.chat.length;
    await createChatMessages([{role:'assistant',name:testName,message:`保留窗口中性测试楼${number}：没有新行动、时间经过、掷骰或规则结算。`,extra:{resourceAcceptanceRetentionFiller:number}}]);
    await carryTestState({mvu:Mvu,expectedChatId:sourceAnchor.chatId,getSourceAnchor:()=>sourceAnchor,getAnchor:()=>tavernAnchor(guard().chat.length-1,guard())});
    const saved=Mvu.getMvuData({type:'message',message_id:number});
    if(saved.snapshot===true){delete saved.snapshot;await Mvu.replaceMvuData(saved,{type:'message',message_id:number});}
    if(JSON.stringify(root())!==before)throw Error('中性测试楼改变了规则根');
    await guard().saveChat();console.log('[901-RETENTION-FLOOR]',JSON.stringify({messageId:number,revision:root().revision,ruleRootUnchanged:true}));
    summary.textContent=`保留窗口测试：已保存中性楼${number}，修订${root().revision}，规则根不变。`;
  }
  return inspectRetention();
}
function inspectRetention(){
  const c=guard(),m=c.chat[25];
  const pages=(m?.variables??[]).map((v,swipeId)=>({swipeId,snapshot:v?.snapshot===true,revision:v?.stat_data?.['901_rules_poc']?.revision,
    mental:v?.stat_data?.['901_rules_poc']?.actors.player.state.resources.精神魔力.current}));
  return report('保留快照只读',{status:'read-only',floorCount:c.chat.length,checkpoint:25,selectedSwipe:m?.swipe_id,pages});
}
const offer=grade=>({id:'mage-'+grade,resourceId:id,name:'法师·奥术',kind:'acquisition',grade,
  baseCost:grade==='D'?15:35,adopted:true,source,actorIds:['player'],requirementsMet:true,
  contractVersion:definition.contractVersion,acquisitionChoices:grade==='D'?{specialization:'奥术',pool:'精神魔力',initialCurrent:0}:{}});
async function initialize(){
  if(root()) return report('初始化','已存在存档，保持原值');
  const s=session();await s.prepare();
  await s.registerRuleScene({source,growthWindow:{id:'ui-study',source,open:true,actorIds:['player']},
    learningOffers:{'mage-D':offer('D'),'mage-C':offer('C')},
    objects:{bundle:{type:'kitResource',resourceId:id,source,actorIds:['player'],plans:{gift:{source,grantId:id+'/D/gift',resourceIds:['imperial-magic:D:魔能爆']}}}}});
  await guard().saveChat();return report('初始化','ready');
}
async function settle(key,request,text){
  if(!root())throw Error('先初始化隔离夹具');
  const c=guard(),chatId=c.getCurrentChatId?.()??c.chatId;
  const runtime=createReplayCheckRuntime({baseline:fixture.baseline,mvu:Mvu,expectedChatId:chatId,
    getAnchor:()=>{const now=guard();return {chatId:now.getCurrentChatId?.()??now.chatId,messageId:now.chat.length-1,swipeId:now.chat.at(-1).swipe_id??0};}});
  const result=await runtime.settle({operationId:'gm-runtime/'+chatId+'/ui-'+key,request,context:{latest:{text}}});
  await c.saveChat();return report(key,result);
}
const buy=grade=>settle(grade,{kind:'rule',action:'resource',actorId:'player',offerId:'mage-'+grade},'我学习法师·奥术'+grade+'阶，使用普通XP付清。');
async function nextFloor(){
  const c=guard(),tip=c.chat.length-1;
  if(!root()||tip>=2)throw Error('本批只在已有存档的0／1楼后各添加一个测试楼层');
  const sourceAnchor=tavernAnchor(tip,c),sourceRevision=root().revision;
  await createChatMessages([{role:'assistant',name:testName,message:`隔离楼层${tip+1}：只检查已保存资源状态的继承，不产生剧情或模型回复。`,extra:{resourceAcceptanceFloor:tip+1}}]);
  const beforeSyncRevision=root()?.revision;
  // Same explicit source-to-new-floor sync as the engine's report publication.
  // prepare() intentionally preserves an already populated floor.
  const result=await carryTestState({mvu:Mvu,expectedChatId:sourceAnchor.chatId,
    getSourceAnchor:()=>{const now=guard();return {chatId:now.getCurrentChatId?.()??now.chatId,messageId:tip,swipeId:now.chat[tip].swipe_id??0};},
    getAnchor:()=>tavernAnchor(guard().chat.length-1,guard())});
  await guard().saveChat();return report('新增楼层并继承',{...result,sourceAnchor,sourceRevision,beforeSyncRevision});
}
async function addSwipe(){
  const c=guard();if(c.chat.length!==2)throw Error('备用回复仅用于本批第1楼');
  const m=getChatMessages(1,{include_swipes:true})[0];
  if(m.swipes.length>=3)throw Error('本批已有原页、失败页和复测页，不再添加');
  await setChatMessages([{message_id:1,swipe_id:m.swipe_id,swipes:[...m.swipes,'隔离楼层1的备用回复：只有本页领取C赠术，原页保持D赠术。'],
    swipes_data:[...m.swipes_data,{}],swipes_info:[...m.swipes_info,{}]}]);
  await guard().saveChat();return report('添加备用回复','请用消息右箭头切换到新添加页，再读取或领取C赠术');
}
async function claimCGift(){
  const c=guard();if(c.chat.length!==2||![1,2].includes(c.chat[1].swipe_id))throw Error('C赠术仅在第1楼备用回复页领取');
  const s=session();await s.prepare();
  if(!root().ruleScene?.objects?.bundle?.plans?.giftC){
    await s.registerRuleScene({source,mechanismPlans:{bundle:{giftC:{source,grantId:id+'/C/gift',resourceIds:['imperial-magic:D:魔能爆']}}}});
  }
  return settle('gift-C-swipe'+c.chat[1].swipe_id,{kind:'rule',action:'mechanism',actorId:'player',objectId:'bundle',operation:'claimLearning',part:'giftC'},'我使用C阶赠术名额进化已学会的魔能爆，保留D版。');
}
function inspectInheritance(){
  const c=guard();
  const floors=c.chat.map((m,i)=>({messageId:i,swipeId:m.swipe_id??0,
    rawRevision:m.variables?.[m.swipe_id??0]?.stat_data?.['901_rules_poc']?.revision,
    hasSchema:!!m.variables?.[m.swipe_id??0]?.schema,
    mvuRevision:Mvu.getMvuData({type:'message',message_id:i})?.stat_data?.['901_rules_poc']?.revision}));
  return report('继承诊断',{status:'read-only',floors});
}
async function prepareJoint(){
  const c=branchContext();
  if(root()?.revision!==31||root()?.battle?.mode==='combat')throw Error('联合例从已保存子分支修订31剧情态开始');
  jointProfile=await (await fetch(rootUrl+'joint-config.json',{cache:'no-store'})).json();
  if(!jointProfile.books.every(b=>getWorldbookNames().includes(b)))throw Error('所需W4隔离六书缺失');
  const before=getCharWorldbookNames('current');
  await rebindCharWorldbooks('current',{primary:before.primary,additional:jointProfile.books});
  c.updateChatMetadata({resource_joint_profile:jointProfile});await c.saveChat();
  jointRun={id:jointProfile.id,started:new Date().toISOString(),input:jointProfile.input,baseline:snapshot(),config:jointProfile,scan:[],activated:[],requests:[]};
  const summarize=e=>({world:e.world,uid:e.uid,name:e.comment,constant:e.constant,disabled:e.disable});
  const listen=(event,fn)=>{eventOn(event,fn);jointListeners.push(()=>eventRemoveListener(event,fn));};
  listen(tavern_events.WORLDINFO_SCAN_DONE,x=>jointRun.scan.push({state:x.state,budget:x.budget,matched:Array.from(x.new.all||[]).map(summarize),successful:Array.from(x.new.successful||[]).map(summarize),activated:Array.from(x.activated.entries||[]).map(summarize)}));
  listen(tavern_events.WORLD_INFO_ACTIVATED,x=>jointRun.activated.push(x.map(summarize)));
  listen(tavern_events.CHAT_COMPLETION_SETTINGS_READY,x=>jointRun.requests.push({model:x.model,max_tokens:x.max_tokens,stream:x.stream,messages:structuredClone(x.messages)}));
  return report('六书联合准备',{status:'ready',input:jointProfile.input,books:jointProfile.books});
}
async function saveJointEvidence(){
  const c=branchContext();if(!jointRun)throw Error('当前页面没有联合请求记录');
  for(const stop of jointListeners)stop();jointListeners=[];
  jointRun.finished=new Date().toISOString();jointRun.final=snapshot();
  jointRun.messages=c.chat.slice(31).map((m,i)=>({messageId:i+31,text:m.mes,extra:m.extra}));
  c.updateChatMetadata({resource_joint_acceptance:structuredClone(jointRun)});await c.saveChat();
  return report('保存联合回执',{status:'captured',requestCount:jointRun.requests.length,activated:jointRun.activated});
}
async function installNaturalGate(){
  guard();if(naturalGateInstalled)return;
  const bookName=testName+' - 自然语言隔离';
  const books=getCharWorldbookNames('current');
  if(books.primary&&books.primary!==bookName)throw Error('测试卡绑定了非本批世界书，停止接入');
  if(!getWorldbookNames().includes(bookName))await createWorldbook(bookName,[]);
  if(books.primary!==bookName)await rebindCharWorldbooks('current',{primary:bookName,additional:[]});
  guard();
  const {registerReplayGate}=await import(rootUrl+'work/rules_engine/gm_runtime/replay-gate-script.example.js');
  registerReplayGate({getMvu:async()=>{guard();return Mvu;},combat:{
    get busy(){return combatSession?.busy??false;},
    get encounterOptions(){return guard().chat.some(m=>m.extra?.resourceAcceptanceCombat)?battleSession().encounterOptions.filter(x=>x.id===combatId):[];},
    resumeEntry:player=>battleSession().resumeEntry(player),handleTurn:input=>battleSession().handleTurn(input),
    enterForPlayer:(id,player)=>battleSession().enterForPlayer(id,player)},profile:{
    prepare:()=>{guard();return session().prepare();},loadBaseline:async()=>fixture.baseline,
    directEffects:false,debug:true,get sceneContext(){return jointProfile?.scene??naturalScene;},classificationTimeoutMs:60000,get lorebooks(){return jointProfile?.books??[];},
    modelOptions:()=>jointProfile?{should_stream:false,should_silence:true,max_chat_history:6,overrides:{scenario:jointProfile.scene,chat_history:{author_note:''}},ordered_prompts:['world_info_before','char_description','scenario','world_info_after','chat_history',{role:'system',content:jointProfile.worldContextGuidance+'\n只叙述当前实际现场与已经结算的长休结果，不增加其他行动，不替御临风说话或思想。'},'user_input']}:{should_stream:false,should_silence:true,max_chat_history:0,
      ordered_prompts:[{role:'system',content:'你是资源引擎隔离验收主持。只依据给定现场和规则事实，用简短中文反馈；不调用工具，不生成变量补丁，不增加新的玩家行动。'},'user_input']},
    narrationInstruction:'仅用一小段中文叙述当前测试声明的即时结果；不续写其他行动，不自动恢复或扣除资源。'}});
  naturalGateInstalled=true;title.textContent=testName+' · 自然语言入口已启用（真实模型）';
}
async function enableNatural(){
  const c=guard();
  if(c.chat.some(m=>m.extra?.resourceAcceptanceNatural)){await installNaturalGate();return report('自然语言入口','ready');}
  if(c.chat.length!==3||root()?.revision!==6)throw Error('先完成跨楼层验收；本批从修订6继续');
  const sourceAnchor=tavernAnchor(2,c);
  await createChatMessages([{role:'assistant',name:testName,message:naturalScene,extra:{resourceAcceptanceNatural:true}}]);
  await carryTestState({mvu:Mvu,expectedChatId:sourceAnchor.chatId,getSourceAnchor:()=>sourceAnchor,
    getAnchor:()=>tavernAnchor(guard().chat.length-1,guard())});
  await session().registerRuleScene({source,objects:{eldritchBlast:{type:'kitResource',name:'魔能爆',resourceId:'imperial-magic:D:魔能爆',source,actorIds:['player'],plans:{D:{source,grade:'D',targetIds:['huang'],distance:1,effectLine:true,precise:true,components:{posture:true,language:true,focus:true}}}}}});
  await guard().saveChat();await installNaturalGate();return report('自然语言入口','ready');
}
const checkpointHost=mountOpeningSceneHost({document:doc,getSession:battleSession,isActive:()=>{guard();return true;},tavern:guard()});
window.addEventListener('pagehide',()=>checkpointHost.dispose());
const actions=[['准备六书联合恢复',prepareJoint],['保存联合回执',saveJointEvidence],['打开规则检查点入口',()=>checkpointHost.open()],['建立保留快照',prepareRetention],['新增保留备用页',addRetentionSwipe],['备用页完整长休',restRetentionSwipe],
  ['推进保留窗口至49楼',appendRetentionWindow],['保留快照只读',inspectRetention],
  ['分支身份检查（只读）',inspectBranchIdentity],['明确接纳原生分支',acceptBranch],['分支D施法／同操作重试',saveFailureCast],
  ['准备战斗验收',prepareCombat],['进入战斗验收',async()=>{await battleSession().prepare();return report('进入战斗',await battleSession().enter(combatId));}],
  ['战斗D魔能爆',castCombat],['重复战斗D请求',repeatCombat],['同回合再施法',newCastCombat],
  ['继续战斗／玩家选择',()=>battleSession().handleTurn()],['补发已结算战斗报告',()=>battleSession().controller.resumeReport()],
  ['启用自然语言验收',enableNatural],['继承诊断（只读）',inspectInheritance],['初始化隔离夹具',initialize],['取得D阶',()=>buy('D')],
  ['领取D赠术',()=>settle('gift',{kind:'rule',action:'mechanism',actorId:'player',objectId:'bundle',operation:'claimLearning',part:'gift'},'我选择魔能爆作为赠术。')],
  ['取得C阶',()=>buy('C')],['重复C阶请求',()=>buy('C')],['只读存档',()=>report('读取','read-only')],
  ['新增楼层并继承',nextFloor],['添加备用回复',addSwipe],['备用页领取C赠术',claimCGift]];
for(const [label,fn] of actions){const b=doc.createElement('button');b.type='button';b.textContent=label;b.style.margin='4px';
  b.onclick=async()=>{if(busy)return;busy=true;summary.textContent=label+'：正在处理，请等待保存回执。';try{await fn();}catch(e){summary.textContent=label+'：'+e.message;details.open=true;output.textContent=JSON.stringify({action:label,error:e.message,stack:e.stack},null,2);console.error('[901-RESOURCE-ACCEPTANCE]',e);}finally{busy=false;}};controls.append(b);}
window.addEventListener('pagehide',()=>panel.remove());
if(guard().chat.some(m=>m.extra?.resourceAcceptanceNatural))await installNaturalGate();
report('脚本加载','ready');
