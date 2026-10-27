import {BASIC_ACTIONS} from '../resource-action-bindings.mjs';
import { beginTurn, createCharacter } from '../core.mjs';

// Adopted comparison configuration, NOT an overwrite of a campaign/T0 save.
// Sources: outputs/同伴RE资源调整/{四人战斗面板对比,姜子尤,黄泉,龙象般若功,狮子王}.md
// under the sibling 901-resource-authoring-kit. Existing 901 great powers retained.
export const ABILITIES = {
  search:{name:'主动侦查',action:'标准',text:'全部实际感官重新侦查感知范围内生物；胜出将定位提高一级，仍受反侦测与心灵免疫边界限制。'},
  jump:{name:'跳跃',action:'移动',text:'选择实际起跳计划；力量＋运动·跳跃判定后占真实移动额度，未完成须付后续移动动作。'},
  continueJump:{name:'续接跳跃',action:'移动',text:'续算保存的同一次跳跃，不重新投骰；跳高下降不另扣额度。'},
  ...Object.fromEntries(Object.entries(BASIC_ACTIONS).map(([id,{name,action,text}])=>[id,{name,action,text}])),
  mechanism:{name:'操作规则物件',action:'按实际物件',text:'选择已登记的objectId、operation与part；动作、费用与效果由对应规则执行器计算。'},
  statusEvent:{name:'处理已确认状态事件',action:'按事件规则',text:'只选择已登记eventId；处理额外抵抗、灭火、实际感知条件等，不输入任意状态补丁。'},
  wake:{name:'唤醒睡眠者',action:'标准',text:'接触1.5米内实际睡眠者，以标准动作唤醒。'},
  garudaScout:{name:'迦楼罗侦查',action:'按当前任务登记',text:'7DP＋1自动成功；没有心智属性，不能据此生成通用心智骰池。'},
  garudaHide:{name:'迦楼罗隐藏',action:'按当前任务登记',text:'6DP＋1自动成功；骰数结果不自动替代实际掩蔽、目标与对抗条件。'},
  garudaInterfere:{name:'迦楼罗干扰',action:'攻击动作',text:'对相邻可见敌人干扰，视为一次攻击并造成1点多次攻击减防，不造成直接伤害。'},
  concede:{name:'主动认输',action:'无',text:'本场擂台停止交锋，保留伤势、资源和已用次数，不奖励XP；玩家认输须玩家声明。'},
  shieldPush:{name:'抢身盾推',action:'标准',text:'持盾，1.5米；力量＋肉搏盾推对抗目标强韧，主动胜出沿远离方向推2米，无伤，不赠自己位移。empowered:true于本次检定前耗斗气1，＋3DP；受地图合法性约束。'},
  brace:{name:'稳身运气·防御',action:'无额外动作＋1斗气',text:'为下一次适用身体防御结算准备＋3增强；只用一次，与同类增强取高，不永久增加防御。'},
  calibrate:{name:'定点校准',action:'整轮',text:'60米内持续可定位目标；下次自己行动立即弓射＋3瞄准DP，上限仍20B。可射前迅捷上箭，实际射击仍须已装填并消耗一箭。无普通满瞄特效。先另作标准/移动动作、失去目标定位或被近战命中即失效；不叠加。'},
  drawClub:{name:'取短棍',action:'移动',text:'停止双手持弓并取出腰侧短棍；格挡另花移动动作，可按核心替换标准。持棍不能射箭。'},
  readyBow:{name:'重新持弓',action:'移动',text:'收起短棍、恢复双手持弓，不附送装填或格挡。'},
  door:{name:'开关门',action:'移动',text:'featureId指定已知门，open:true打开、false关闭；须相邻1.5米、门未上锁且无人挡住关门。结算后更新地图，不移动人物。'},
  destroy:{name:'攻击障碍',action:'标准',text:'featureId指定障碍的独立可破坏段；普通武器攻击，物体无主动防御，伤害先受攻击上限约束再减硬度。仍消耗箭矢等通常攻击资源；耐久归零才打开该段。不自动攻击后方人物。'},
  opportunityReact:{name:'借机攻击声明',action:'按借机攻击规则',text:'对手离开威胁范围时，玩家声明strike进行借机攻击，或decline放弃；不得替玩家选择。'},
  strike: { name: '普通攻击', action: '标准', text: '一次武器攻击；可用变式与消耗见本次选项。弓箭攻击须已装填并消耗一支箭。' },
  block: { name: '格挡', action: '见当前选项', text: '使用当前格挡能力，持续至下次本人行动开始；须能行动并具备相应武器。' },
  draw: { name: '拔刀', action: '移动', text: '拔出狮子王；本回合首次近战＋3招式，先攻高时至多2L恶化，攻击后防御－2至下回合。' },
  sheathe: { name: '收刀', action: '移动', text: '收起狮子王，失去持刀格挡和剑客防御。' },
  thunder: { name: '雷鸣剑', action: '标准＋1灵力', text: '＋15增强，至多半伤转电；实际电伤造成等量麻痹，强韧逐成功抵消。冷却1轮。不能与御雷合用。' },
  cleaveRock: { name: '斩岩剑', action: '标准＋1灵力', text: '本击武器伤害＋2L，破甲16，忽略4DR/硬度，威猛。冷却1轮。对格挡者需已知武器体积。' },
  lightning: { name: '御雷·雷刃', action: '标准＋1/3/5灵力', text: 'tier1半电/恶化2；tier2全电/高速8/恶化4；tier3另＋6招式，命中后邻格其他生物8L电、反射减伤、伤及友军。共享1轮冷却。' },
  conduct: { name: '御雷·导电', action: '标准＋1/3/5灵力', text: 'tier1/2/3接触攻击，命中仅施加4/8/12麻痹，强韧减免；不造成武器伤害。共享御雷冷却。' },
  summon: { name: '召唤乱红莲', action: '标准＋3灵力', text: '相邻处召出，自有三动作并在本人后行动；回剑重召不重置伤势或次数。累计每分钟维持1、2、3…灵力。' },
  recall: { name: '收回乱红莲', action: '黄标准', text: '召回灵兽，保留其伤势、动作和已用次数。灵兽清醒时也可自己自由回剑。' },
  fistQi: { name: '拳气', action: '迅捷＋1气', text: '场景内天武＋2L；强化一击额外2气使该击再＋1L/破甲1/忽略1DR或硬度，击后拳气消失。' },
  breakBody: { name: '破身拳运功', action: '自由＋1斗气', text: '场景内破甲由3改4，基础天武仍3L。破尽目标盔甲才恶化至多天武一半、上限5。' },
  restoreSwift: { name: '高速恢复', action: '无动作', text: '每场景一次，自己回合承受2不可避免疲乏，恢复本回合已花费迅捷；不能解除反射锁。' },
  selfHeal: { name: '自我医疗', action: '标准', text: '每场景一次，治疗1点任意伤势，重伤优先；不用于消除异常状态。' },
  squeeze: { name: '生命压榨', action: '自由', text: '恢复1气或斗气并承受不可避免伤。两次长休间累计：≤力量/2为1L；≤(力量+意志)/2为1L但按A恢复；≤力量+意志为只能自然恢复的1L；更高为只能自然恢复的1A。' },
  roar: { name: '乱红莲·咆哮波', action: '标准＋移动＋迅捷', text: '每场景一次，100米×2米直线，8＋持有者意志自动成功点力场L伤，反射逐成功减伤，不分敌我。' },
  move: { name: '移动', action: '移动', text: 'to为[x,y]米坐标；距离不得超过当前速度，离开敌人威胁范围会触发其可用借机攻击。' },
  step: { name: '五尺快步', action: '移动', text: 'to为[x,y]，至多1.5米，不引发离开威胁范围的借机攻击。' },
  conversion: { name: '伤害转换策略', action: '无动作', text: 'enabled设置是否对下一次有伤害的攻击使用一次场景伤害转换，整次受击降一级。可先设定，再由程序在受击时消耗。' },
  end: { name: '结束回合', action: '无', text: '放弃剩余动作，推进至下一位可行动参战者。' },
  zheng:{name:'正十七·守势',action:'移动',text:'学识代白刃格挡；另得有效白刃＋智力自动的不可减免偏斜，覆盖戒指；全伤吸收1。仅可挡接攻击，至下次行动。'},
  tengzhuan:{name:'腾转挪移',action:'标准＋1合用能量',text:'一分钟内移动加值10改30、敏捷判定与防御加值2改4；风池或魔力支付。'},
  flow:{name:'流风加速',action:'自由＋1/2流风',text:'流风池上限22；1/2流风提供2/4速度判定加值，持续一分钟；与弃风攻击速度加值3取高。须由玩家声明启动。'},
  tornado:{name:'狂岚·聚风龙卷',action:'标准＋1合用能量',text:'20米单体白刃攻击，整体减防8替代弃风减防3。可随动作拔剑。'},
  gale:{name:'狂岚·群袭',action:'标准＋1合用能量',text:'20米内每个合法敌人逐一攻击；招式＋3与辟邪取高，每目标减防3，分别受伤害上限。'},
  reload:{name:'上箭',action:'迅捷',text:'装填一支现有普通箭；射击时消耗。'},
  aim:{name:'实际瞄准',action:'标准',text:'本轮瞄准指定目标；下次行动开始增加一轮实际瞄准，与自动瞄准合计最多三轮。其他标准或移动动作、近战命中中断。'},
  timeBolt:{name:'时属性攻击',action:'标准＋1导力',text:'50米有效果线目标受1B精神能量伤害，无攻击及豁免。造成实伤后1DP成功则施加等量精神束缚。'},
  timeHaste:{name:'时间加速',action:'标准＋移动＋1导力',text:'50米，场景内目标每次自己回合结束后先攻顺位前移一位；不重复行动、不增加动作或移动速度；不越过原先更早的同术目标。'},
  react:{name:'受击反应',action:'无',text:'攻击宣言后、掷骰前选择本次伤害转换；命中造成伤害才消耗每场景次数。'},
  perfectWarrior:{name:'完美战士',action:'迅捷＋3魔力',text:'后期法术，开局不具备；每次施法时由玩家选择至多D级战士向能力、称号或技能，排除血统专有技能。须适配施法及本次借用资源；不默认赠攻击加值。'},
  guardAlly:{name:'守护战士',action:'迅捷',text:'触及内合计体积不超过自身的盟友取得白刃/肉搏值掩护；原资料未确定持续，等待裁定。'},
  necromancy:{name:'死灵驱散／操控',action:'标准＋1魔力',text:'50米；原卡施法职能与次数适配尚有缺项，须主持补齐。'},
};

const skill = (level, subs = {}) => ({ level, subs: Object.fromEntries(Object.entries(subs).map(([k, v]) => [k, { level: v }])) });
const pool = max => ({ current: max, max });
const make = (id, name, values, hp, speed, initiative, skills, resources, rest) => ({
  id, name, kind: id, team: id === 'jiang' ? '同伴' : '敌人', controller: 'model', present: true,
  position: id === 'jiang' ? [1, 0] : [0, 0], reach: 1.5,
  state: createCharacter({ name, attributes: Object.fromEntries(['力量','敏捷','智力','感知','意志','风度'].map((k,i) => [k,values[i]])),
    size: 5, derived: { hpMax: hp, speed, initiative, willMax: id === 'jiang' ? 16 : 8 },
    skills, resources }),
  used: {}, cooldowns: {}, buffs: {}, combos: {}, reactions: { damageConversion: false },
  ...rest,
});

export function makeLotus(owner) {
  const a = make('lotus', '乱红莲', [6,5,2,4,3,2], 26, 23, owner.state.derived.initiative,
    { 肉搏: skill(5, { 爪: 3, 牙: 3, 擒抱: 4 }), 运动: skill(4), 求生: skill(4) }, {}, {
      team: owner.team, ownerId: owner.id, position: [owner.position[0], owner.position[1] + 1.5],
      abilities: ['strike','roar','move','step','recall','end'], diehard: true,
    });
  a.state.size = 12;
  return a;
}

export function createDuel() {
  const huang = make('huang','黄泉',[7,11,2,6,5,3],23,23,26,
    { 白刃: skill(5,{太刀:1}), 肉搏: skill(1), 运动: skill(2), 求生: skill(1) }, { 灵力: pool(6) },
    { sheathed: true, weaponSize: 3, abilities: ['strike','block','draw','sheathe','thunder','cleaveRock','lightning','conduct','summon','recall','move','step','conversion','end'] });
  const jiang = make('jiang','姜子尤',[11,3,2,3,3,3],35,41,10,
    { 肉搏: skill(5,{拳击:3}), 运动: skill(4,{自我保护:1}), 求生: skill(1) },
    { 气: pool(2), 斗气: pool(3), 内力: pool(28) },
    { spartanBonus: 0, squeezed: 0, abilities: ['strike','block','fistQi','breakBody','restoreSwift','selfHeal','squeeze','move','step','conversion','end'] });
  huang.state = beginTurn(huang.state).state;
  return { version: 1, scenario: '完整人物卡RE比较配置：姜子尤对黄泉；隔离演练，非实际剧情',
    assumptions: ['双方满生命、满能量，黄泉入场佩刀在鞘；距离1米，无掩蔽。',
      '斯巴达未证实额外2DP分支不计；狮子王武器体积按用户2026-10-20确认值3。',
      '训练场以一方失去行动能力为胜负，不继续补刀。'],
    round: 1, activeId: 'huang', order: ['huang','jiang'], actors: { huang, jiang },
    elapsedRounds: 0, summonRounds: 0, summonMinutes: 0, status: 'active', winner: null };
}

export function createRoster() {
  const {actors}=createDuel();
  const yulin=make('yulin','御临风',[6,7,6,5,5,4],21,28,11,
    {白刃:skill(5,{长剑:4}),学识:skill(4),运动:skill(1),求生:skill(1),神秘:skill(4)},
    {风池:pool(10),魔力:pool(106),流风:pool(22)},{
      controller:'player',team:'同伴',position:[0,0],sheathed:false,
      abilities:['strike','block','zheng','tengzhuan','flow','tornado','gale','perfectWarrior','guardAlly','necromancy','move','step','conversion','end'],
      parameters:{flowMax:22,flowAction:'free'},knownWeaknesses:[],
    });
  const bright=make('bright','布莱特',[6,7,2,9,2,1],20,42,18,
    {射击:skill(2,{长弓:4}),运动:skill(2),求生:skill(1),肉搏:skill(1),白刃:skill(1),学识:skill(1)},
    {导力:pool(5)},{team:'敌人',position:[30,0],loaded:false,ammunition:20,knownWeaknesses:[],
      abilities:['strike','reload','aim','timeBolt','timeHaste','block','move','step','conversion','end']});
  return {...actors,yulin,bright};
}

export function createEncounter({id,scenario,participants,positions={},teams={},controllers={},parameters={}}) {
  if(!id||!Array.isArray(participants)||participants.length<2) throw new Error('遭遇需要ID与至少两名参战者');
  const roster=createRoster(), actors={};
  for(const key of participants) {
    if(!roster[key]) throw new Error(`未知人物配置：${key}`);
    const a=roster[key]; a.state.turn={...a.state.turn,phase:'ready',standard:0,move:0,swift:0};
    if(positions[key]) a.position=structuredClone(positions[key]);
    if(teams[key]) a.team=teams[key];
    if(controllers[key]) a.controller=controllers[key];
    a.parameters={...a.parameters,...structuredClone(parameters[key]??{})};
    if(a.kind==='huang'&&Number.isInteger(a.parameters.weaponSize)) a.weaponSize=a.parameters.weaponSize;
    if(a.kind==='bright'&&Number.isInteger(a.parameters.ammunition)) a.ammunition=a.parameters.ammunition;
    actors[key]=a;
  }
  const order=participants.slice().sort((x,y)=>actors[y].state.derived.initiative-actors[x].state.derived.initiative);
  const activeId=order[0]; actors[activeId].state=beginTurn(actors[activeId].state).state;
  return {...createDuel(),id,scenario,actors,order,activeId,mode:'combat',reactionWindows:true,knowledge:{},turnTaken:[]};
}
