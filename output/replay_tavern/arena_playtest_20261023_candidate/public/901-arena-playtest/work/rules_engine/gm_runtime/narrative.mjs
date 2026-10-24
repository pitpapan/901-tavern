import {mapView} from '../combat/map.mjs';
import {createIntegratedSession,createIntegrationFixture} from './integrated.mjs';
import {act} from '../combat/engine.mjs';
import {publicScene,playerDeclarationContext,ownStatus,stripLegacyOwnStatus,ownImpactReport} from '../combat/presentation.mjs';
import {carryTestState,tavernAnchor} from '../mvu_poc/adapter.mjs';
import {IllegalAction,RuleInputError} from '../combat/mechanics.mjs';

const META='901_narrative';
const actionNames={standard:'标准',move:'移动',swift:'迅捷'};
const cleanJson=text=>JSON.parse(text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));

export const narrationRules='你是901的主持，用原团承接行动、展开交锋、落到结果的写法续写战斗。程序事实区分已经执行与等待声明的行动，按各事件status叙述，不再次裁定。'+
  '正文必须按events顺序承接每项事件，写清执行者做了什么、如何展开、眼前成立了什么结果；先写本轮行动，再写有事实支持的必要反应。不能只写旁人来代替事件执行者。'+
  'status为resolved表示已经执行；execution提供可展开的动作手段，outcome和consequence是必须成立的结果。御临风已声明且已执行的动作，可以展开招式的执行过程，这就是本轮正文的内容；这不授权新的攻击、位移、消耗、台词、心理或后续战术决定。declaration中没有对应已执行事件的部分仍未结算。'+
  '准备格挡或守势时写收束剑路、护持自身等相应过程，落在防护准备成立；准备不等于实际挡接，不为它补造敌方出手或尚未发生的命中。'+
  'responses说明各受击者在这一击实际采用的防御。没有使用主动格挡者，可以写本能避让、护体抵御和受创，不能写成用武器或拳掌格挡、招架并挡掉来势；已就绪的格挡才写具体挡接过程，结果仍以伤害事实为准。缺少该项时不自行补出主动格挡。'+
  '用具体的剑路、拳势、相对位置与已发生的环境反馈承载因果。实际交锋写出手段、应对与后果，不只用命中或受伤带过；单次准备可以短段写完，篇幅随事件量而变，不让每击都像决战。'+
  'participants限定当前可见人物、装备、位置与伤势；每人的terrain给出其实际脚下地形与高度，不得把附近高台或玩家所在高台当作敌人的站位。setting仅为场地背景，其中的开场安排不覆盖当前participants和events，也不产生本轮行动。不补未参与事件的场边人物台词或反应。'+
  'events及reactions中的arms限定实际手段，徒手的拳掌不能改写成长棍或其他武器。route.around是实际绕过的地形，route.through是实际经过的区域；不得从setting地名表任选地点搬到人物脚下。outOfSight列出移动后已看不见的人，不描写他们在遮挡后的动作或落点。借机攻击按timing先写挡接和受伤，再写移动；不得添上对手追击、撤步、扫空或踉跄。没有事件支持时不追加远处地形被拳风扰动等环境效果。'+
  '收势只结束当前招式，不自带退回原位、武器脱手或装备掉落；装备持用以participants.arms为准。相距决定近身或远处，不能为了行文把贴近交锋写成隔着数步。resolution.text说明终止原因，内部kind名称不代表现场另有裁判或其他人。'+
  'participants是本段结算后的现场；每项events.arms与execution才是该动作发生时的手段。射击后未上箭表示箭已射出，不得改写成空弦或凭空以劲风命中。'+
  'location是相对位置；travelMeters是本次实际移动距离，distanceToPlayer是移动后相距。relativePosition是移动后的相距，不要再减一次travelMeters。正文通常用相对位置、招式范围或地标承接，绝不把内部坐标写成退到某个米数处。按events顺序写伤害和移动；没有移动事件时受伤只表现为躯干晃动、伤口等，不追加退步、突进或击飞。consequence逐项落实，确实受伤时要写出受创，格挡不能改写成尽数挡下。'+
  'status为pending时只写已经显现的来势或意图。移动引起借机攻击时，移动者仍在原站位：无论等待玩家选择借机攻击，还是等待玩家声明如何防御，均尚未完成移动，不能写抵达目的地、退出阵地或攻击打空。声明中的目的地是计划，不是结果；受击反应完成前不能写已经命中、挡住或避开。'+
  'phase的等待接在当前事件之后：等待玩家继续行动时先写完本轮已执行动作，再停在当下，把剩余动作留给玩家。没有新增events时只承接已经声明的对话与扮演，不新增机械行为。战斗结束才写即时战后反应，不擅自恢复、授奖或推进下一幕。'+
  '采用御临风的观察视角。只写可见表现；队友和敌人的生命、能量、属性、攻防、技能预算、骰数及隐藏增益不可公开或猜测。只输出叙事正文，不输出选项菜单、规则表、变量或任何数值面板。程序会另附御临风实际受到的伤害和负面状态变动，不能从发麻等修辞推定麻痹；完整面板由独立界面显示。';

// The browser entry and focused prose probes use the same request contract.
export function narrationRequest(facts,style='') {
  return {should_stream:false,should_silence:true,max_chat_history:0,
    ordered_prompts:[{role:'system',content:style+'\n\n'+narrationRules},'user_input'],
    user_input:JSON.stringify(facts)};
}

export async function interpretDeclaration({text,context},generateRaw) {
  return cleanJson(await generateRaw({should_stream:false,should_silence:true,max_chat_history:0,
    ordered_prompts:[{role:'system',content:
      '你只翻译玩家已经明确声明的行动，不替玩家选招。返回JSON：{"steps":[{"quote":"玩家原文中的动作片段","command":{"abilityId":"...","targetId":"..."},"cost":{"actions":{"standard":1},"energy":{"风池":1}}}],"clarification":"需要澄清时的简短问题"}。'+
      'command字段仅按当前能力和legalOptions格式；actorId由程序设置。移动指令格式必须为{"abilityId":"move","to":[x,y]}，to是两个数值组成的数组；targetId仅表示角色ID，绝不能用它承载坐标字符串。允许玩家明确指定的距离和方向，不要求选预设终点。场地地形在terrain中；绕行必须填via:[[x,y],...]途经点，并与玩家声明一致。选点草稿不是已执行行动。'+
      'targetId使用participants或lastSeen中的id，不填人物中文姓名。lastSeen是此前目击位置，不代表现在仍可见；不能据此擅自提供盲攻效果。'+
      '开关门用{"abilityId":"door","featureId":"terrain中的id","open":true或false}；普通武器破坏障碍用{"abilityId":"destroy","featureId":"terrain中的id"}。不得将地形当作targetId人物，不得输入硬度、耐久、掩体或地图修改值。高低差必须走已绘制坡道/阶梯；没有适配的攀爬、跳跃、开锁先澄清，不替换成免费移动或开门。'+
      '仅转写玩家明确写出的动作与能量消耗到cost；没有写则省略cost或相应部分。标准/移动/迅捷用standard/move/swift；自由动作actions为{}。'+
      '带档位的能力必须在command中填写所选档位，cost不能替代它。例如明确消耗2点流风加速，command为{"abilityId":"flow","tier":2}；消耗1点则tier:1。'+
      '攻击、移动、主动防御、技能使用及判定，都只能从玩家明确的执行声明触发；不能为扮演文字自行安排动作或检定。没有数值变化的台词和观察不产生command。不得把描写的对方反应当作对方命令。不得把“还没结束”“先不结束”识别成结束。'+
      '只有明确结束本回合/放弃剩余动作才能填end；剩余动作永远不得自行用完。受击时必须先声明防御方式才计算数值：react必须同时给defense与choice。'+
      '明确以基础/通常防御闪避用defense:"normal"（基础与被动效果，不加主动格挡）；明确使用已经就绪的格挡或守势用defense:"block"。未声明方式则澄清，不能自动选择normal。'+
      '若当前自身面板有declaredDefense，表示玩家此前已声明且仍有效，可沿用，无须重复索取同一防御声明。'+
      '借机攻击窗口只能按明确声明填opportunityReact，choice为strike或decline；不是防御窗口，不得自动攻击。'+
      'choice:"decline"表示不用伤害转换，"conversion"表示本次用转换，均不是防御方式；不能用它代替defense。未准备的格挡不可以在受击时免费开启，其他主动防御需已有规则支持。'+
      '一次声明可按顺序包含多个动作。没有支持的判定、缺少目标/方向/能量来源或者条件分支无法确定时，steps为空并澄清，不默默丢弃要求。'+
      '玩家报出的判定、加值和消耗不能覆盖程序规则，不能填骰值或成败。只输出JSON。'},'user_input'],
    user_input:JSON.stringify({text,context})}));
}

function validateStep(step,text,battle) {
  if(!step||typeof step.quote!=='string'||!step.quote||!text.includes(step.quote)||!step.command)
    throw new IllegalAction('没有找到对应的明确行动声明，请写明这次要执行的动作。');
  const c={...step.command,actorId:'player'};
  if(c.abilityId==='end'&&(!/结束(?:我的|本|这一|这)?回合|回合结束|放弃剩余动作/.test(step.quote)||/不|未|还没|别|暂缓/.test(step.quote)))
    throw new IllegalAction('你尚未声明结束回合；剩余动作仍然保留。');
  if(battle.pending) {
    if(battle.pending.kind==='opportunity') {
      if(c.abilityId!=='opportunityReact'||!['strike','decline'].includes(c.choice))throw new IllegalAction('请声明是否进行这次借机攻击。');
      return c;
    }
    if(c.abilityId!=='react'||!['conversion','decline'].includes(c.choice))
      throw new IllegalAction('这次攻击尚未落定，请先声明如何防御；不能自行增加防御效果。');
    return c;
  }
  const trial=act(battle,c,{drawDice:()=>Array(1024).fill(1),playerAuthorized:true,deferPlayerDefense:true});
  const before=battle.actors.player.state,after=trial.battle.actors.player.state;
  const spent={actions:Object.fromEntries(Object.keys(actionNames).map(k=>[k,Math.max(0,before.turn[k]-after.turn[k])]).filter(([,n])=>n)),
    energy:Object.fromEntries(Object.entries(before.resources).map(([k,v])=>[k,Math.max(0,v.current-after.resources[k].current)]).filter(([,n])=>n))};
  if(c.abilityId!=='end')for(const key of ['actions','energy'])if(step.cost?.[key]) {
    const declared=step.cost[key],actual=spent[key];
    if([...new Set([...Object.keys(declared),...Object.keys(actual)])].some(k=>(declared[k]??0)!==(actual[k]??0))) {
      const names=key==='actions'?actionNames:{};
      const label=Object.entries(actual).map(([k,n])=>`${names[k]??k} ${n}`).join('、')||'无';
      throw new IllegalAction(`这次声明的${key==='actions'?'动作':'能量'}消耗与规则不符，实际需要${label}。请确认新的声明；这一步尚未执行。`);
    }
  }
  return c;
}

// One wrapper changes the player-facing contract; the existing engine remains
// the only source of rolls, turn advancement, costs and persistent state.
export function createNarrativeSession(options) {
  const {mvu,tavern,createChatMessages,setChatMessages,generateRaw,narrate,
    onStatusRequest=()=>{},onMapRequest=()=>{},mapGenerator,interpret=input=>interpretDeclaration(input,generateRaw)}=options;
  const base=createIntegratedSession({...options,showChoices:()=>{},narrateReturn:undefined,renderCombat:null,playerDefenseDeclarations:true,
    ...(mapGenerator?{prepareBattle:async b=>b.map?b:({...b,map:await mapGenerator(b)})}:{})});
  const playerTemplate=base.playerTemplate;
  const expectedChatId=tavern.getCurrentChatId?.()||tavern.chatId;
  const anchor=()=>tavernAnchor(tavern.chat.length-1,tavern);
  const root=()=>mvu.getMvuData({type:'message',message_id:anchor().messageId})?.stat_data?.['901_rules_poc'];
  let mapping=null;
  async function ensureMap() {
    if(!mapGenerator||!root()?.battle||root().battle.map)return;
    if(!mapping)mapping=(async()=>{const {battle}=base.controller.read();const map=await mapGenerator({...battle,sceneActorNames:Object.values(root().actors).map(a=>a.name)});
      await base.controller.installMap(map);})().finally(()=>{mapping=null;});
    await mapping;
  }
  let working=false;
  const key=p=>`${p.chatId}/${p.messageId}/${p.swipeId}`;
  const latestRevision=()=>Math.max(0,...tavern.chat.filter(m=>!m.is_user).map(m=>m.extra?.[META]?.revision??0));
  function record(p) {
    const m=tavern.chat[p.messageId];
    if(p.chatId!==expectedChatId||m?.mes!==p.text||(m.swipe_id??0)!==p.swipeId)throw Error('行动楼层已改变');
    const value=m.extra?.[META];
    if(value&&(value.text!==p.text||value.swipeId!==p.swipeId))throw Error('已处理的声明被编辑，请从对应存档分支继续。');
    return value??{text:p.text,swipeId:p.swipeId};
  }
  async function saveRecord(p,value) {
    record(p);
    await setChatMessages([{message_id:p.messageId,message:p.text,
      extra:{...tavern.chat[p.messageId].extra,[META]:value}}],{refresh:'none'});
    await tavern.saveChat();
  }
  async function post(message,p,revision) {
    message=stripLegacyOwnStatus(message);
    if(!message){await onStatusRequest();return;}
    const source=anchor();
    await createChatMessages([{role:'assistant',message,extra:{[META]:{key:key(p),revision}}}]);
    await carryTestState({mvu,expectedChatId,getSourceAnchor:()=>source,getAnchor:anchor});
    await tavern.saveChat();
  }
  async function cached(p) {
    const saved=record(p);
    if(!saved.completed)return false;
    if(!tavern.chat.some(m=>!m.is_user&&m.extra?.[META]?.key===key(p)))
      await post(saved.completed.message,p,saved.completed.revision);
    return true;
  }
  async function flush(p,{notice='',narrateIdle=false}={}) {
    const saved=root(),previous=latestRevision();
    let message='';
    if(saved.battle&&(saved.revision>previous||narrateIdle)) {
      const facts=publicScene(saved,{afterRevision:previous});
      message=await narrate({...facts,declaration:p.text});
      if(typeof message!=='string'||!message.trim()||/<\/?(?:jsonpatch|mvu|update)\b|901_rules_poc|rules901_detail|\d+\s*(?:DP|HP|[BLA]\b)|(?:生命值?|灵力|内力|魔力|斗气|防御值?|攻击值?)\s*[:：]?\s*\d/i.test(message))
        throw Error('叙述未完成；结算已保存');
    }
    message=[message,ownImpactReport(saved,{afterRevision:previous}),notice].filter(Boolean).join('\n\n');
    await saveRecord(p,{...record(p),completed:{message,revision:saved.revision}});
    await post(message,p,saved.revision);
    return {handled:true,status:saved.battle?.mode==='story'?'story':'awaiting_player',revision:saved.revision};
  }
  async function handleTurn({player:p}={}) {
    if(!p)return {handled:false};
    await base.prepare();
    if(/^(?:查看|看看|查询|显示)(?:我|自己|自身|我的)(?:的)?(?:当前)?状态[。！!？?\s]*$/.test(p.text.trim()))
      {await onStatusRequest();return {handled:true,status:'status_ui',revision:root().revision};}
    if(/^(?:查看|看看|显示)(?:当前|战场|场景)?地图[。！!？?\s]*$/.test(p.text.trim())){await ensureMap();await onMapRequest();return {handled:true,status:'map_ui',revision:root().revision};}
    if(await cached(p))return {handled:true,status:'reused'};
    const saved=root();
    const old=record(p);
    // A fresh message after a failed prose request first recovers committed events.
    if(!old.plan&&saved.battle&&Object.values(saved.operations).some(o=>o.summary?.revision>latestRevision()&&!['map','mapUpdate'].includes(o.summary.result?.abilityId)))return flush(p);
    if(!saved.battle||saved.battle.mode==='story')return {handled:false};
    working=true;
    try {
      await ensureMap();
      const current=base.controller.read();
      const id=current.battle.pending?.awaiting??current.battle.activeId;
      if(id!=='player') {await base.handleTurn();return flush(p);}
      const plan=old.plan??await interpret({text:p.text,context:playerDeclarationContext(current.battle,current.revision)});
      if(!Array.isArray(plan?.steps))throw Error('行动声明未能识别，请重试');
      if(!old.plan)await saveRecord(p,{...old,plan});
      if(plan.clarification)return flush(p,{notice:plan.clarification});
      if(plan.steps.slice(0,-1).some(s=>s.command?.abilityId==='end'))
        return flush(p,{notice:'结束回合之后的行动留到下一次声明；请确认这次结束前要做的动作。'});
      let notice='';
      for(let i=0;i<plan.steps.length;i++) {
        const operationId=`declaration/${key(p)}/${i}`;
        if(root().operations[operationId])continue;
        const {battle,revision}=base.controller.read();
        if(battle.mode==='story')break;
        if((battle.pending?.awaiting??battle.activeId)!=='player')break;
        try {
          const command=validateStep(plan.steps[i],p.text,battle);
          await base.controller.submitCommand({command,expectedRevision:revision,operationId});
          await base.handleTurn();
          // A newly offered reaction is a new player decision, not an implicit decline.
          if(base.controller.read().battle.pending?.awaiting==='player')break;
        } catch(error) {
          if(!(error instanceof IllegalAction)&&!(error instanceof RuleInputError))throw error;
          notice=error instanceof RuleInputError?'这项能力还缺少已确认的规则参数，本次没有执行。请先使用已确定的行动。':error.message;
          break;
        }
      }
      return flush(p,{notice,narrateIdle:!plan.steps.length&&!notice});
    } finally {working=false;}
  }
  return {
    ...base,
    get busy(){return working||Boolean(mapping)||base.busy;},
    handleTurn,
    async enterForPlayer(id,p) {
      await base.prepare();if(await cached(p))return {handled:true,status:'reused'};
      working=true;
      try {await base.enterForPlayer(id,p);return await flush(p);} finally {working=false;}
    },
    async resumeEntry(p) {
      if(!tavern.chat[p.messageId]?.extra?.['901_combat_entry'])return null;
      return this.enterForPlayer(tavern.chat[p.messageId].extra['901_combat_entry'].encounterId,p);
    },
    storyContext() {
      for(let i=tavern.chat.length-1;i>=0;i--) {
        const saved=mvu.getMvuData({type:'message',message_id:i})?.stat_data?.['901_rules_poc'];
        if(!saved)continue;
        if(saved.chatId!==expectedChatId)throw Error('规则存档不属于当前聊天');
        if(!saved.battle)return null;
        const scene=publicScene(saved,{afterRevision:saved.revision});
        return {setting:scene.setting,participants:scene.participants,phase:scene.phase,
          ...(scene.resolution?{resolution:scene.resolution}:{}),
          continuity:'这是最近一次程序结算确认的现场。未发生新的到场或场景变化时，按此处在场者、位置、手持装备与伤势承接；人物卡开场背景不使缺席者自动出现。闲谈及收势不产生移动、武器脱手、治疗或恢复；旧回复附带的退步、丢弃装备等修辞不覆盖本记录。终止原因按resolution.text，不从内部kind名称补出裁判。'};
      }
      return null;
    },
    async currentState() {
      // Reading the UI must not initialize, carry, or mutate a rules snapshot.
      // Find the nearest selected MVU floor, never recover from message text.
      for(let i=tavern.chat.length-1;i>=0;i--) {
        const saved=mvu.getMvuData({type:'message',message_id:i})?.stat_data?.['901_rules_poc'];
        if(!saved)continue;
        if(saved.chatId!==expectedChatId)throw Error('规则存档不属于当前聊天');
        const battle=saved.battle?(i===tavern.chat.length-1?base.controller.read().battle:structuredClone(saved.battle)):null;
        if(battle&&i!==tavern.chat.length-1)for(const [id,a] of Object.entries(battle.actors))a.state=structuredClone(saved.actors[id].state);
        return {revision:saved.revision,mode:battle?.mode??'story',map:mapView(battle),player:ownStatus(saved,battle,'player',playerTemplate)};
      }
      return null;
    },
    async handleFailure({player:p}) {
      await base.controller.carryLatest();
      if(!root()?.battle)return false;
      const committed=root().revision>latestRevision();
      await post(committed?'本次结算已保存，战斗描写尚未完成。重新生成这条回复，或发送“继续”，会承接已保存的结果。':
        '这次行动尚未执行。请重新生成这条回复，或补充行动声明。',p,latestRevision());
      return true;
    },
    dispose(){base.controller.stop();},
  };
}
