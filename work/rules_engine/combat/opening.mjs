import {createCharacter,baseHealthCapacity,beginTurn} from '../core.mjs';
import {normalizeMap,distance} from './map.mjs';

export const OPENING_RULESET='opening-20261022';
export const OPENING_ABILITIES={
  escapeGrip:{name:'挣脱擒抱',action:'标准',text:'玩家选择力量＋肉搏或敏捷＋运动，按体积差对抗；被压制须两次成功。'},
  pressGrip:{name:'压制',action:'标准',text:'擒抱下一轮重新对抗，成功压制。'},
  grappleAttack:{name:'擒抱内攻击',action:'整轮，压制者标准',text:'按PHB擒抱及武器资格结算。'},
  ringStore:{name:'存入戒指',action:'移动',text:'按实物体积、重量和已持有状态核对。'},
  ringRetrieve:{name:'取出戒指物品',action:'按物品尺寸',text:'单手体积≥1迅捷，<1自由；非单手整轮。'},
  mechanism:{name:'操作场景物件',action:'按已登记规则',text:'实际场景对象、当前状态和来源齐备后操作。'},
  firstAid:{name:'急救',action:'整轮',text:'接触另一名正在A伤恶化的伤者，敏捷＋医疗DC1；成功停止恶化，不恢复伤害。'},
  stowWeapon:{name:'收起当前武器',action:'移动',text:'收起弓、长刀或匕首，腾出双手。'},
  readyWeapon:{name:'取出武器',action:'移动',text:'双手已空时选bow、longknife或dagger。切换须先收起当前武器；不免费攻击。'},
  hypnotize:{name:'催眠引导',action:'标准＋2魔力',text:'10米内双向可见、听懂引导且认识达卡斯的心智目标；13DP＋1A产生魅惑，再按异常抵抗。内容取本场已确认的一条指示。'},
  doubleStrike:{name:'双武器连击',action:'标准＋移动＋迅捷',text:'两件武器均可用；两次各－2DP，可选择同一或两个目标，不附送移动。'},
  tentacles:{name:'触须毒',action:'标准',text:'Chuul对自己夹持且3米内目标施加原始麻痹8；无螯击伤害，每目标回合末抵抗，最多一分钟。'},
  releaseGrip:{name:'松开螯钳',action:'自由',text:'释放指定螯钳所夹持的目标。'},
  burrow:{name:'土遁入地',action:'标准＋2魔力',text:'进入已经确认的土层通路，地下移动8米；不能隔层攻击，最多5轮，标准动作在可用出口出土。'},
  emerge:{name:'出土',action:'标准',text:'仅在当前已确认可用土层出口重新出土。'},
  morph:{name:'形态变化',action:'标准',text:'只能在空的外貌与Phantom间切换；保留HP、魔力、位置及束缚。'},
  medicine:{name:'服用药物',action:'移动；雪莲子为标准',text:'仅按玩家明确声明服用现有药物；库存与即时/延后效果一并记录。药C须选择严重伤害或一项肉体异常；培元丹下一长休按A、L、B顺序恢复力量值伤害。'},
  block:{name:'普通格挡',action:'移动',text:'须先声明，至下次行动开始；增加当前白刃/拳击值，技能自动成功另计。受击时不能免费准备。'},
  draw:{name:'拔刀',action:'移动',text:'拔出旧大师级太刀；同回合首次普通近战可用拔刀招式＋2DP，先攻高时另1成功，攻击后防御－2。不为雷鸣/斩岩自动叠拔刀招式。'},
  sheathe:{name:'收刀',action:'移动',text:'收起旧大师级太刀；失去持刀格挡。'},
  thunder:{name:'雷鸣剑·D',action:'标准＋1灵力',text:'旧太刀攻击＋4DP；至多2点实际伤害转电，实际电伤附等量麻痹，强韧抵抗；冷却1轮。'},
  cleaveRock:{name:'斩岩剑·D',action:'标准＋1灵力',text:'破甲＋4，忽略1点适用DR/硬度，不增加武器伤害，冷却1轮。'},
  tengzhuan:{name:'腾转挪移',action:'标准＋1流风',text:'一分钟内基础身法速度＋10改＋30，敏捷判定与防御＋2改＋4。'},
  flow:{name:'流风加速',action:'自由＋1/2流风',text:'上限22，支出1/2点获2/4速度判定加值，持续一分钟。'},
  tornado:{name:'狂岚·聚风龙卷',action:'标准＋1流风',text:'20米单体白刃攻击，减防8替代弃风减防3。'},
  gale:{name:'狂岚·群袭',action:'标准＋1流风',text:'20米内合法敌人逐一白刃攻击，不伤友军；攻击＋3，每目标减防3，逐目标上限，一次费用。'},
};
export const OPENING_SOURCES={
  yulin:'work/character_builder/real_character/御临风_初始卡_20261021.txt（数值区；排除履历、垃圾桶和成长账）',
  companions:'work/character_builder/real_character/同伴初始卡_初稿_20261021.md（用户已授权接入；原/推/补标签保留）',
  enemies:'work/replay_research/capital_enemy_builds_rewards_draft.md（UCL_20261018_006）',
};
const sk=(level,subs={})=>({level,subs:Object.fromEntries(Object.entries(subs).map(([k,level])=>[k,{level}]))});
const skills=rows=>Object.fromEntries(Object.entries(rows).map(([k,v])=>[k,Array.isArray(v)?sk(...v):sk(v)]));
const pool=max=>({current:max,max});
function actor(id,name,attrs,config,skillRows,resources={},rest={}) {
  const attributes=Object.fromEntries(['力量','敏捷','智力','感知','意志','风度'].map((k,i)=>[k,attrs[i]]));
  const size=config.size??5,hpMax=config.hpFixed??baseHealthCapacity(attrs[0],size,config.hpBonus??0);
  const willMax=config.willOverride??attrs[4]+attrs[5];
  const result={id,name,kind:id,ruleset:OPENING_RULESET,combatProfile:config,team:'同伴',controller:'model',present:true,
    reach:1.5,position:[0,0],used:{},cooldowns:{},buffs:{},combos:{},reactions:{damageConversion:false},sheathed:false,abilityDefinitions:OPENING_ABILITIES,
    state:createCharacter({name,attributes,size,hpBonus:config.hpBonus??0,
      derived:{hpMax,willMax,speed:attrs[0]+attrs[1]+size+(config.speed??0),initiative:attrs[1]+(config.initiativeAttribute==='意志'?attrs[4]:attrs[5])+(config.initiative??0)},
      skills:skills(skillRows),resources:Object.fromEntries(Object.entries(resources).map(([k,n])=>[k,pool(n)]))}),...rest};
  for(const key of ['inventory','unknownSkills','recoveryRules'])if(rest[key])result.state[key]=structuredClone(rest[key]);
  return result;
}
export function createOpeningRoster() {
  return {
    player:actor('yulin','御临风',[5,5,4,4,1,2],{main:'白刃',sub:'长剑',natural:0,speed:10,initiative:0,steelWill:2,
      equipment:{weapon:{damage:6,attackBonus:0,blockBonus:0,ap:2,magic:2,size:3,defenseReduction:3},armor:{defense:3}},
      provenance:{attributes:'原',白刃:'原：风迹赠级已计入母技能5',制造:'原：母技能空缺，未确定；炼药子技能2',流风:'原＋用户确认上限22、自由启动'}},
      {运动:1,肉搏:0,白刃:[5,{长剑:3}],射击:0,隐藏:1,求生:1,驾驶:0,学识:2,科学:0,神秘:2,电脑:2,医疗:2,洞察:1,社交:2},
      {流风:22},{id:'player',kind:'yulin',controller:'player',parameters:{flowMax:22,flowAction:'free'},
        recoveryRules:{flow:{attributes:['敏捷','感知'],physical:true,longRest:true},flowRecoveryCheck:{attributes:['敏捷','感知'],source:'用户2026-10-23确认'}},
        unknownSkills:{制造:{level:null,subs:{炼药:{level:2}}}},
        inventory:[{name:'雪莲子',quantity:1,source:'原'},{name:'培元丹',quantity:3,source:'原'},
          {name:'药A',quantity:2,source:'原'},{name:'药B',quantity:3,source:'原'},{name:'药C',quantity:4,source:'原'},
          {name:'雷霆药剂',quantity:null,source:'原：数量未记'},{name:'恶灵提示符',quantity:null,source:'原：100为价格，非数量'}],
        unsupportedActions:['雷霆药剂与恶灵提示符（数量未记）','戒指存取（现有库存/佩戴待确认）'],
        visibleArms:'弃风长剑在手',abilities:['strike','block','tengzhuan','flow','tornado','gale','move','step','conversion','end']}),
    huang:actor('huang','黄泉',[5,6,2,5,3,3],{main:'白刃',sub:'太刀',natural:0,speed:0,initiative:4,initiativeDefense:2,steelWill:0,
      equipment:{weapon:{damage:4,attackBonus:2,blockBonus:0,ap:0,magic:0,size:3},armor:{defense:3}},
      provenance:{attributes:'原/推/补：逐项见同伴初稿',轻甲:'补',雷鸣剑:'补',拔刀衔接:'原/补'}},
      {运动:2,肉搏:1,白刃:[5,{太刀:1}],射击:0,隐藏:0,求生:1,驾驶:1,学识:2,科学:1,神秘:[1,{除灵:1}],调查:1,洞察:1,社交:[1,{感受:1,表达:1,说服:1}],电脑:1,医疗:0,制造:0},
      {灵力:5},{sheathed:true,weaponSize:3,spiritSight:true,spiritStrike:true,waterRun:true,visibleArms:'旧大师级太刀',unsupportedActions:[],abilities:['strike','block','draw','sheathe','thunder','cleaveRock','move','step','end']}),
    jiang:actor('jiang','姜子尤',[8,2,2,3,3,3],{main:'肉搏',sub:'拳击',natural:4,speed:10,initiative:1,hpBonus:2,steelWill:2,
      equipment:{weapon:{damage:3,attackBonus:5,blockBonus:0,ap:3,magic:0},armor:{defense:0}},
      provenance:{period:'原：黄金乡梦境早期，不自动加入入都T0',属性:'原/补',肉搏:'补：母5子2旧制折算',传奇耐力:'补：生命＋2',再生:'原/补'}},
      {运动:3,肉搏:[5,{拳击:2}],白刃:1,射击:0,隐藏:1,求生:1,驾驶:2,学识:1,科学:0,神秘:0,调查:0,洞察:2,社交:[1,{威逼:2,街头智慧:1,沟通:1}],电脑:1,医疗:0,制造:0},
      {气:2,斗气:2},{visibleArms:'徒手，以拳掌应战',abilities:['strike','block','move','step','conversion','end']}),
    bright:actor('bright','布莱特',[3,4,2,4,2,1],{main:'射击',sub:'长弓',natural:0,speed:10,initiative:3,initiativeAttribute:'意志',initiativeDefense:2,willOverride:5,steelWill:2,
      equipment:{weapon:{type:'bow',damage:3,attackBonus:1,blockBonus:0,ap:0,magic:0,strengthRequirement:3,rangeUnit:40},armor:{defense:2}},
      provenance:{attributes:'原/推/补：逐项见同伴初稿',willOverride:'原：早期分母5异式',弓力量要求:'补：3',箭:'用户补定20',射击:'补：母1子4；无技能自动成功',轻皮甲:'补'}},
      {运动:2,肉搏:1,白刃:1,射击:[1,{长弓:4}],隐藏:2,求生:1,驾驶:0,学识:1,科学:1,神秘:1,调查:[2,{搜索:1}],洞察:[2,{追踪:1}],社交:[1,{动物沟通:1,感受:1,唬骗:1,说服:1}],电脑:0,医疗:1,制造:[0,{淬毒:2}]},
      {},{loaded:false,ammunition:20,weaponMode:'bow',perceptionRange:40,windSense:true,ignoreDifficult:true,wallClimb:true,visibleArms:'旧长弓，另携精致长刀与缴获匕首',
        unsupportedActions:[],abilities:['strike','reload','aim','block','stowWeapon','readyWeapon','move','step','end']}),
  };
}
export function createOpeningEnemy(type,id=type) {
  const adopted={
    installer:{name:'法阵安装者',attrs:[2,3,5,4,3,2],size:5,hp:7,main:'白刃',damage:1,cap:4,reach:1,
      skills:{魔法:[4,{法阵安装:2}],学术:[3,{术式识读:2}],白刃:1,运动:2,求生:1,侦查:2}},
    hypnotist:{name:'催眠魔兽',attrs:[3,4,4,5,5,5],size:4,hp:7,main:'肉搏',damage:0,cap:4,severity:'B',
      skills:{魔法:[5,{催眠:3}],肉搏:1,运动:2,求生:2,侦查:3,掩饰:3},resources:{魔力:6},abilities:['hypnotize']},
    chuul:{name:'Chuul',attrs:[8,3,2,4,4,1],size:7,hp:17,main:'肉搏',sub:'螯钳',damage:4,cap:18,reach:3,armor:2,
      skills:{肉搏:[4,{螯钳:2}],运动:[3,{游泳:2}],求生:3,侦查:[3,{水下感知:1}]},abilities:['doubleStrike','tentacles','releaseGrip'],rest:{claws:[null,null],darkvision:18,magicSense:36,amphibious:true,immunities:['poison']}},
    gremlin:{name:'古雷姆林',attrs:[8,10,5,7,6,5],size:5,hp:15,main:'白刃',sub:'双刀',damage:3,cap:19,
      skills:{白刃:[5,{双刀:3}],运动:[4,{杂技:3}],魔法:[3,{土系:2}],求生:3,侦查:4,掩饰:4,潜行:3},resources:{魔力:8},
      abilities:['doubleStrike','burrow','emerge','morph'],rest:{weaponsAvailable:2,form:'Phantom',landMultiplier:2,dodgeBonus:2}},
  }[type];
  if(adopted) {
    const c=adopted;
    return actor(id,c.name,c.attrs,{main:c.main,sub:c.sub,natural:0,hpFixed:c.hp,size:c.size,speed:0,initiative:0,cap:c.cap,severity:c.severity??'L',
      equipment:{weapon:{damage:c.damage,attackBonus:0,blockBonus:0,ap:0,magic:0},armor:{defense:c.armor??0}},provenance:{source:OPENING_SOURCES.enemies,adoption:'UCL_20261018_006'}},
      c.skills,c.resources??{},{kind:type,team:'场景对手',reach:c.reach??1.5,visibleArms:c.name==='法阵安装者'?'短刃':type==='gremlin'?'双刀':'天生武器',
        recoveryRules:c.resources?{manaLongRestHours:8}:undefined,...c.rest,abilities:['strike','move','step',...(c.abilities??[]),'end']});
  }
  const configs={
    cityGuard:{name:'城卫',attrs:[3,3,2,2,2,2],hp:8,speed:0,initiative:0,damage:2,armor:1,main:2,sub:1,cap:8},
    veteran:{name:'达卡斯部属老兵',attrs:[4,4,2,3,3,3],hp:9,speed:0,initiative:0,damage:3,armor:2,main:3,sub:2,cap:12},
    stone:{name:'石像魔偶',attrs:[6,2,1,3,3,1],hp:14,size:6,speed:0,initiative:0,damage:3,armor:0,main:3,sub:1,cap:13,severity:'B',dr:2,reach:2},
  };
  const c=configs[type];if(!c)throw Error('该敌人尚未接入，须主持补齐适配');
  return actor(id,c.name,c.attrs,{main:type==='stone'?'肉搏':'白刃',sub:'常用攻击',natural:0,hpFixed:c.hp,size:c.size??5,speed:c.speed,initiative:c.initiative,
    cap:c.cap,severity:c.severity??'L',equipment:{weapon:{damage:c.damage,attackBonus:0,blockBonus:0,ap:0,magic:0},armor:{defense:c.armor,dr:c.dr??0}},
    provenance:{source:OPENING_SOURCES.enemies,hp:'已采用固定值，未按新公式重算'}},
    {[type==='stone'?'肉搏':'白刃']:[c.main,{常用攻击:c.sub}],运动:type==='stone'?1:2,求生:type==='stone'?2:1},{},
    {kind:type,team:'阻拦方',reach:c.reach??1.5,visibleArms:type==='stone'?'石质拳臂':'已出现的制式兵刃',
      ...(type==='stone'?{construct:true,territory:{center:[0,0],radius:6},immunities:['poison','disease','nerveParalysis','charm']}:{}),
      abilities:['strike',...(type==='veteran'?['block']:[]),'move','step','end']});
}
export function createOpeningEncounter({id,instanceId=id,scenario,participants,positions={},teams={},enemies=[],objective,map,territories={},sceneFacts={}}) {
  const roster=createOpeningRoster(),actors={};
  for(const key of participants??[]) {if(!roster[key])throw Error(`未知初始角色：${key}`);actors[key]=roster[key];}
  for(const spec of enemies)actors[spec.id]=createOpeningEnemy(spec.type,spec.id);
  for(const [key,a] of Object.entries(actors)) {
    if(!Array.isArray(positions[key])||positions[key].length!==2||!positions[key].every(Number.isFinite))throw Error(`当前现场缺少${a.name}站位，须主持补参`);
    a.position=structuredClone(positions[key]);if(teams[key])a.team=teams[key];if(territories[key]&&a.territory)a.territory=structuredClone(territories[key]);
    a.sceneInstanceId=instanceId;
  }
  const order=Object.keys(actors).sort((x,y)=>actors[y].state.derived.initiative-actors[x].state.derived.initiative);
  const activeId=order[0];actors[activeId].state=beginTurn(actors[activeId].state).state;
  const b={version:1,id,sceneInstanceId:instanceId,scenario,ruleset:OPENING_RULESET,actors,order,activeId,round:1,elapsedRounds:0,status:'active',mode:'combat',winner:null,
    reactionWindows:true,playerDefenseDeclarations:true,knowledge:{},turnTaken:[],objective,sceneFacts:structuredClone(sceneFacts)};
  if(!actors.player&&positions.player){b.observers={player:{...roster.player,position:structuredClone(positions.player)}};}
  if(map)b.map=normalizeMap(map,b);return b;
}
// Goal registration is trusted encounter data, never supplied by a model action.
export function objectiveSatisfied(b) {
  const o=b.objective;if(!o)return false;
  if(o.kind==='exitRadius')return o.actorIds.every(id=>b.actors[id]?.present&&distance(b.actors[id].position,o.center)>o.radius);
  if(o.kind==='reachZone')return o.actorIds.every(id=>{const p=b.actors[id]?.position,r=o.rect;return p&&p[0]>=r[0]&&p[0]<=r[0]+r[2]&&p[1]>=r[1]&&p[1]<=r[1]+r[3];});
  return false;
}
