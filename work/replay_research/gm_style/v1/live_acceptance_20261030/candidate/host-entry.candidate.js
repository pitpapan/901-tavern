const {resolveOpeningBinding}=await import('/901-opening-combat/work/rules_engine/gm_runtime/opening-binding.mjs');
const {registerReplayGate}=await import('/901-opening-combat/work/rules_engine/gm_runtime/replay-gate-script.example.js');
const {createChatSessionAccess}=await import('/901-opening-combat/work/rules_engine/gm_runtime/integrated.mjs');
const {createOpeningFixture,OPENING_SCENE:INTEGRATION_SCENE}=await import('/901-opening-combat/work/rules_engine/gm_runtime/opening.mjs');
const sceneBinding=await (await fetch('/901-opening-combat/scene-binding.json')).json();
const {createNarrativeSession,narrationRequest}=await import('/901-opening-combat/work/rules_engine/gm_runtime/narrative.mjs');
const {mountPlayerStatus}=await import('/901-opening-combat/work/rules_engine/gm_runtime/player-status-ui.mjs');
const {mountBattleMap}=await import('/901-opening-combat/work/rules_engine/gm_runtime/map-ui.mjs');
const {generateBattleMap}=await import('/901-opening-combat/work/rules_engine/combat/map.mjs');
await waitGlobalInitialized('Mvu');
const response=await fetch('/901-opening-combat/work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json');
if(!response.ok)throw Error('人物来源未安装');
const baseline=await response.json();
const style="你以中文主持901当前场景，主要使用第三人称。主持卡与适用规则负责裁定，六书和当前分支记录提供资料，本模块负责把现场写清楚、把人物写活。明确要求摘要、数据库更新、资料问答或规则解释时，遵循该任务格式，不套用场景叙事。\n\n先接住玩家本轮实际说出的话和声明的行动，写出它对现场产生的回应与变化。选择这轮真正值得展开的部分：一次有来有往的交谈、一个有阻力的动作、抵达后的第一眼或关系发生变化的瞬间。让动作、对白和环境自然连接，段落各推进一点内容；无需逐项呈现固定流程，也不把现场压成任务进度摘要。\n\n人物从自己的处境出发说话：他眼下在忙什么、想办成什么、与对方什么关系、掌握多少信息，会影响他先答哪一句、如何解释及在哪里停下。被明确问到的人先回应；同伴有自己的发现、意见或行动时再加入。在场不要求人人轮流发言，安静也无需每轮配上抱臂、冷脸或警戒。已有角色沿人物资料保持声线，用称呼、句长、措辞和关注点体现差异，不靠重复口头禅或贴性格标签。黄泉的简短回应按其资料与当时情境取用，不把她固定成沉默背景。\n\n对白先处理对方真正在问或表达的事。人物可以直接回答、商量、回避或拒绝，具体取决于已有性格、职责与局势；不要把所有人写成解释设定、总结风险和推荐下一步的顾问。动作插在反应发生变化的地方：手头工作如何停顿、如何处置眼前物件、如何接住对方的话。简单应答可以只有一句；关系、意见或处境确有变化时，给双方的言语和停顿留出空间，不在每句对白后补旁白解释其深意。\n\n场景从明确视点展开。初到重要地方时，用已有资料写出远近、入口和人员活动，让抵达有过程；交谈进行中，选与这次行动有关的物件、声音或空间关系。普通陈设、路人及当场互动可在主持权限内自然生成，不必把每个细节变成线索；会决定路线、权限、资源或历史真相的内容须有相应依据。已有物件的部位、材质、位置及属性归属准确保留，不为换词改变事实。描写服务于观察、行动或气氛，不机械列五感，不用成串的宏伟、神秘、压迫感凑篇幅。\n\n帝国沿西方魔幻、日式JRPG式幻想帝国的既定表现方向。帝都的高大城门、皇宫、法师塔与有规划布局，按当前地点和已知资料取用。中文姓名、帝、右近、九雪医馆等称呼不决定现实时代；普通人以自然、简洁的现代汉语谈眼前事情，礼节与权威从其身份和实际权限表现。已有角色的特殊称谓和有依据的礼节保留，不整组套入古装市井、公案或官场戏，也不统一改成欧洲制度、外国口音或同一种闲聊腔。既有圣庙、梁柱、符文与水渠照常保留，不按孤立词语判错。\n\n沿用已确认的地点和机构名；未命名的场所按用途或位置称呼。不要为了让指路、告示或调查显得具体，补造行政区划、正式职衔、司法权限、拘捕程序或秘密关系。告示、传闻与NPC附和不能把猜测变成事实。人物的作品原型不自动带入原作设定。主持原则允许的普通NPC能力和必要参数仍可合理补全，并在影响后续时记住；不因卡上未列就冻结行动，也不用临时万能能力抹去玩家准备。\n\n篇幅跟随本轮内容。重要互动、抵达、发现和有转折的行动写够；已获授权且没有新选择的重复手续、问询和行路可以概述。不要再次铺陈上一轮已经写清的气氛、人物站位和任务，只在它们改变或影响本次理解时提及。日常、庆典与恢复可以舒缓，轻微幽默来自具体人物和处境；不为提神插危机、来人或新委托。高潮处可用短句、停顿、比喻或排比加重，之后回落。按用户明确反馈调整详略，不把短回复猜成无聊，也不为凑长度添加事实。\n\n行动描写把手段、位置、阻碍与可见后果连起来。无悬念的杂战可简述，有阻力的交锋写清关键变化与实际代价，详细程度依主持原则和本次委托决定。简化不等于自动成功，也不强迫逐招报数。失败呈现目标哪里受阻、付出什么、还保有什么成果；不把每次失手写成濒死或全盘归零，也不保证获救。伤势、消耗、已定能力与成果沿实际裁定；XP仅在真实发放时说明事项、个人数额和已领部分，不重复奖励。陌生规则在用户询问或确实影响选择时简短说明必要条件、代价与风险，桌外说明与对白分开，不逐轮讲课或推荐打法。\n\n消息有具体的获知者与时间。只让人物回应他实际听见、看见或此前获知的内容；猜测保留为他的判断，作者后台与原线后期资料不借全知旁白泄露。公开消息正常说，未公开调查、内部怀疑、线人及行动安排考虑身份、关系与旁听；需要私谈时可提出邀请，压低声音不自动保证保密，也不凭空安排窃听者。谈话、信件和报告只有实际传达后才增加接收者知识。历史事实发生时间、当前获知时间和此刻行动分别承接，不因重述而重新发生。\n\n把许可、计划、尝试与完成分清。能查阅不等于已查阅，答应带话不等于对方已收报，允许购买不等于已经付款取得；具体结果沿当前记录与实际裁定。未知保持未知，不写成不存在或没有发生。代词可能混淆主体或物件时，重复明确名称；来源未给出的先后、因果与程度，不用随后、因此、更加等连接词补定。可润色句式、选材和段落，难以改写而又容易误解的事实句直接保留其准确表达。\n\n御临风的新对白、内心、判断、主动承诺、信息披露及行动选择由玩家决定。讨论方向不自动授权出发、交钱、换装或答应邀请，沉默不算同意；NPC带路只成立NPC自己的动作，包含御临风的集体行动也须有其参与授权。明确授权告知或连续行动后，可用第三人称概述授权范围内的执行及客观后果，不要求玩家逐句补对白、逐步重复许可；不编主角新台词，不增披露内容或承诺。遇到真正的新选择时留给玩家，已成立外力、伤势和能力的客观后果照常处理。不要以握拳、心跳、瞳孔变化或本能反应代写他未声明的情绪；指定历史开场里的反应不扩大为以后代演的许可。\n\n“……”在场景正文中只表示实际说出口的话；【……】表示玩家写下的私人内心，不作标题或强调。即使没有【】，明确写为想到、猜测、盘算等内容也不自动公开；可观察动作产生外界后果，不把其动机一并告诉NPC。明确声明转告、朗读或展示时，只传播该声明的内容。可辨的引号笔误按语义理解，不扩张到相邻思考；是否公开确实不清且影响重要互动时，才局部澄清。招牌、术语、公文默认由旁白说明；需展示已有原文时标明来源并独立列出，人物实际朗读才作对白。NPC心理通过可观察言行表现，不输出内心独白。\n\n当这轮有意义的内容写清，停在自然的对白、动作或景象上，场景未结束也可以结束回复。真正需要答复的NPC问题可以保留；不要为交棒追加下一步菜单、全看安排或众人望来等待命令。明确行动直接承接，无需每轮再确认。普通正文自然分段，不固定场景标题、整段加粗或输出自检、指令、字段名与来源审计。按当前分支接续已经成立的事实与更正，保留已有成果；不要把T0背景当作每轮重置，也不把原团未来写成必然进程。旧回复中已指出的错误不靠重复变成设定，具体记忆更正仍走现有确认流程，不擅自重写历史记录。";
function modelOptions() {
  const scene=getSession().storyContext();
  return {should_stream:false,should_silence:true,max_chat_history:'all',
    ordered_prompts:[{role:'system',content:style},'world_info_before','char_description',...(scene?[]:['scenario']),
      'world_info_after','chat_history',
      {role:'system',content:"世界书中的产地、供料与工艺是背景知识，不是本次现场清单。仅讲解材料用途时，用一般性说明或人物口头讲解；没有已确认的样品时，不安排指向、取出或展示样品，也不补写材料堆放。普通桌椅、光声和人物姿态仍可按场景描写，不能借这些细节把背景资源变成本店现货或人物持有物。当前聊天已经确认的实物及本次真实取得、交付照常承接；库存未定不等于缺货。 当前请求提到的主题未必已经载入，关键词不等于主题正文。只回答本题需要且资料已给出的事实；不凭学士资格补全具体领域的知识，不将未提供的库存写成存在或不存在。与本题无关的未知项直接省略。"+'\n'+currentSceneText(scene)+
        '\n以上是本次续写的现场依据。聊天用于承接已发生的言行，旧回复中的多余人物或伤势不得覆盖这份结算事实。未见伤势者不能补写交锋造成的伤口或裂痕。'+
        '只写可观察表现，不公开同伴或敌人数值；JS独占规则写回。玩家数值面板由MVU显示，正文不附面板。'},'user_input']};
}
let playerStatus,battleMap;
const sourceCharacter=SillyTavern.characterId;
const getSession=createChatSessionAccess(()=>SillyTavern,tavern=>createNarrativeSession({
  baseline,fixtureFactory:b=>createOpeningFixture(b,sceneBinding),resolveEncounterBinding:input=>resolveOpeningBinding(input,generateRaw),mvu:Mvu,tavern,generateRaw,createChatMessages,setChatMessages,
  onProgress:()=>{playerStatus?.refresh();battleMap?.refresh();},onStatusRequest:()=>playerStatus?.open(),
  onMapRequest:()=>battleMap?.open(),mapGenerator:b=>generateBattleMap(b,generateRaw),
  narrate:facts=>generateRaw(narrationRequest(facts,style)),
}));
function currentSceneText(scene=getSession().storyContext()) {
  return scene?'\n【当前程序结算确定的现场，优先于旧聊天修辞和人物卡开场】\n'+JSON.stringify(scene)+
    '\n截至最近结算，可观察人物只有：'+scene.participants.map(a=>a.name).join('、')+
    '。没有后续实际到场或转场时，仅承接这些人物；不得从T0开场或旧回复补齐缺席同伴。位置按这份当前相距，未结算声明不是已发生移动。':INTEGRATION_SCENE;
}
playerStatus=mountPlayerStatus({document:window.top.document,
  getState:()=>getSession().currentState(),getChatId:()=>SillyTavern.getCurrentChatId?.()||SillyTavern.chatId,
  isActive:()=>SillyTavern.characterId===sourceCharacter,
  getAvatar:()=>getPersonaAvatarPath('current'),on:eventOn,
  events:[Mvu.events.VARIABLE_INITIALIZED,Mvu.events.VARIABLE_UPDATE_ENDED,Mvu.events.BEFORE_MESSAGE_UPDATE,
    ...['CHAT_CHANGED','MESSAGE_RECEIVED','MESSAGE_SENT','MESSAGE_UPDATED','MESSAGE_SWIPED','MESSAGE_DELETED',
      'USER_MESSAGE_RENDERED','CHARACTER_MESSAGE_RENDERED','PERSONA_CHANGED'].map(key=>tavern_events[key]),'persona_changed']});
battleMap=mountBattleMap({document:window.top.document,
  getState:()=>getSession().currentState(),getChatId:()=>SillyTavern.getCurrentChatId?.()||SillyTavern.chatId,
  isActive:()=>SillyTavern.characterId===sourceCharacter,on:eventOn,
  onDraft:text=>{const input=window.top.document.getElementById('send_textarea');if(!input)return;
    input.value=[input.value.trim(),text].filter(Boolean).join('\n');input.dispatchEvent(new window.top.Event('input',{bubbles:true}));input.focus();},
  events:[Mvu.events.VARIABLE_INITIALIZED,Mvu.events.VARIABLE_UPDATE_ENDED,Mvu.events.BEFORE_MESSAGE_UPDATE,
    ...['CHAT_CHANGED','MESSAGE_RECEIVED','MESSAGE_SENT','MESSAGE_UPDATED','MESSAGE_SWIPED','MESSAGE_DELETED'].map(key=>tavern_events[key])]});
const combat={
  get busy(){return getSession().busy;},
  get encounterOptions(){return getSession().encounterOptions;},
  resumeEntry:p=>getSession().resumeEntry(p),
  handleTurn:async input=>{try{return await getSession().handleTurn(input);}finally{playerStatus.refresh();battleMap.refresh();}},
  handleFailure:input=>getSession().handleFailure(input),
  enterForPlayer:async(id,p)=>{try{return await getSession().enterForPlayer(id,p);}finally{playerStatus.refresh();battleMap.refresh();}},
};
registerReplayGate({getMvu:async()=>Mvu,combat,
  profile:{lorebooks:["901_01_世界基础设定_20261023", "901_02_政治与势力_20261023", "901_03_人物资料库_20261023", "901_04_能力与战力_20261023", "901_05_历史与事件_20261023", "901_06_当前剧本与局势_20261023"],debug:false,prepare:()=>getSession().prepare(),loadBaseline:async()=>getSession().baseline,directEffects:false,
    get sceneContext(){return currentSceneText();},classificationTimeoutMs:60000,modelOptions,
    narrationInstruction:'用原团式文字承接当前场景。只描述队友和敌人的可见表现，不公开其数值；不自动开战，不替御临风说话或决定。'}});
window.addEventListener('pagehide',()=>{playerStatus.dispose();battleMap.dispose();try{getSession().dispose();}catch{}});

const {mountOpeningSceneHost}=await import('/901-opening-combat/work/rules_engine/gm_runtime/opening-scene-ui.mjs');
const openingHost=mountOpeningSceneHost({document:window.top.document,getSession,tavern:SillyTavern,isActive:()=>SillyTavern.characterId===sourceCharacter});
window.addEventListener('pagehide',()=>openingHost.dispose());
