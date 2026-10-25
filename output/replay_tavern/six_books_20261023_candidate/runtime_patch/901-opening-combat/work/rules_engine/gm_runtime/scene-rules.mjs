import {runKitMechanism} from './kit-runtime.mjs';
import {RuleInputError,IllegalAction} from '../combat/mechanics.mjs';
import {spendAction} from '../core.mjs';
import {runConditionalResource} from './conditional-resources.mjs';

export const CONDITIONAL_RULES={
  geneticLock:{source:'PHB基因锁17–36；901核心7/101',rules:'一阶自然1D10＋既往成功次数≥10；主动移动7XP，成功不耗XP，失败力量伤2和不可豁免剧痛10。二阶须一阶已开启，2D10＋既往次数（可随意一阶另＋2）≥20；主动整轮14XP，失败力量伤3和剧痛10。二阶玩家选力量/敏捷＋5内在及另2附加成功，迅捷切换；临时传奇资格随属性撤除。持续基数min(力量,意志)，二阶成功使一阶时限翻倍；两阶独立超限每轮记剧痛2、每三轮力量伤2，结束叠加兑现，并各按开启轮数抵抗结束剧痛。首次成功超常表现留主持叙述。原文明确的普通程序已接入，不采用RE替代版。主动解除为自由动作并结束全部阶；同轮双开整轮预备21XP，先一后二，仅失败阶扣7/14XP，一阶失败停止。临时力量撤除按新容量重入原B、L、A伤槽并升级溢出。意志增强采用D9。',missing:["实际解锁履历、合格机会/主动意图及二阶所选属性", "毁灭性属性伤由承受者分配；临时传奇能力由玩家选择"]},
  demonBox:{source:'世界书132414086／魔物之盒',rules:'原帖843565：睡眠值3；打开每轮－1，关闭每完整24小时＋1；到0释放魔物。投影暴露经demonGaze事件登记：直视/天空下睁眼恐惧5，无豁免，每继续一轮＋1，闭眼/不直视即移除；关闭盒子撤除。魔物感知下持有者呈高级魔物气息，S级持有者不被掩盖，A级以上感知能察觉盒子，sense只查询实际等级。当前睡眠值及开关状态须有现场记录；愿望性质由主持判定，不执行任意死亡。开关移动动作，沉睡上限3；实际归盒或死亡回归以reseal计划记录并重置3。',missing:["实际持有者、当前睡眠值、开关状态和实际归盒事件"]},
  arrays:{source:'capital_arrays_hypnosis_rules_draft.md／UCL_20261015_031、UCL_20261018_006',rules:'结界阻实体跨界，封印阻跨界空间移动；两阵独立。完整回路、节点、供能和在节点操作的知情者齐备，标准动作启动一阵并自持；杀安装者不自动停阵。关键节点破坏只停本阵。',missing:['当前两阵安装及节点状态','固定边界','实际破坏载体耐久（仅需要伤害结算时）']},
  teleport:{source:'世界书174980132／空间传送',rules:'下位自身可见无阻50米，1魔力整轮、言语手势；携物体积2需DC2，此后每体积＋1DC/+1魔力；他者自愿或无意识、距施术者1米、传送25米。上位9魔力起、同位面已去过且记得之处；每1000米累计100成功，每周期1分钟；受伤本身不打断，失去继续行动/动作成分的能力则失败；失败返还已耗魔力的下取整一半。上位段数max(1,ceil(距离米/1000))，目标100×段数，费用8＋段数；下位他者max(体积−5,0)并入实际携物体积。',missing:["施法关键属性与技能、实际目标、距离、落点、携物、言语手势"]},
  magicConstitution:{source:'世界书179104843；人物卡资料集410–414、1096–1098',rules:'容量智力＋感知；沐瞳变体另按实际已学法术增加上限，最多智力，排除另购体系所得法术。未掩饰非异次元储存器物波动为启动等级－2、施法者最高魔法等级－3；范围（感知＋波动等级）×11米。4小时睡眠回满，逐分钟比例累计后下取整、每日额度不超过池上限；每小时冥想感知＋智力成功数恢复，不占睡眠额度。器物供能按实际费用，不因此会法术。',missing:['实际适用池、当前量、所学法术及当天睡眠记录','实际器物费用/动作','有掩饰波动时该隐藏能力的侦破规则']},
  ancientBelt:{source:'世界书208839788；人物卡资料集1016–1079；PHB基本规则29–30',rules:'Wizard实际佩戴戒指触驱动器：标准3魔力变身，即时不可打断；迅捷换属性，不另增原文未写的魔力费、可打断。各形态甲8/8替换旧甲，保留防弹/防能量武器关键词。火力敏＋2，白刃/肉搏/枪弓＋4，施法＋2，免火；命中一半转火、其中一半提高伤级至多A，各自下取整。水力敏＋2、白刃/枪械＋4、施法＋4；迅捷格挡或移动兼格挡、格挡＋2；攻击后目标基础/闪避/洞察合计－2，叠加并刷新至施术者第二轮；危险范围＋1格、枪械免费响应进出。风敏＋3、四类攻击＋4、所有判定和防御＋2，速度＋20、免坠落/困难地形/多次攻击减防，可无减值攻击主目标相邻且自己射程内敌人。土力＋3、白刃/肉搏＋4、全吸3/力场4、力量对抗＋2自动；剑枪忽略3DR/全吸或6硬度。剑枪迅捷召出/切换，枪4L破甲3破魔5射程100无限弹银圣魔，剑6L破甲5破魔3圣魔大师。Garuda标准1魔力持续一场景，结构15硬度4防御9/12飞30，侦查7＋1自动/隐藏6＋1/反射6，可干扰造成多次攻击减防1。Defend标准1魔力持续施法成功轮：火防御2/2、焚毁靠近硬度≤2物品、近战者无豁免燃烧2；水魔法伤害≤4免疫，否则减3；风远程物理<12DP反弹、≥12减6，近战减4；土方向全掩蔽结构20硬度10。D3仅Wizard采用防弹（实弹物理伤降一级）和防能量武器（阻止能量武器恶性转换）；该护甲完全被破甲忽略时关键词失效。D4主动解除迅捷0魔力。D5剑枪连射标准攻击主目标＋3DP，每多目标全组−1DP，按真实邻接包括友方，至多10目标；邻接不递归、每行动轮每目标仅一次邻接追加，无限弹药满足10发。',missing:["实际持有、施法/剑枪技能、土墙位置、使魔本场先攻", "水压过高的场景界线"]},
  phantomRings:{source:'世界书225474856；人物卡资料集1081–1091；PHB生存状态326–330',rules:'Sleep标准1魔力，实际佩戒目标按DC4意志豁免，失败进入普通睡眠；即时表示施加，不表示立刻醒来。睡眠失去闪避、不能主动反应，范围反射0成功；伤害唤醒、他人标准动作接触唤醒；敏感范围感知－1，目标视为隐藏、感知对抗减1成功。Engage整轮0魔力进入佩戒者Underworld，不等于救治。D7意识进入，肉身原地承受环境；主动exit整轮回原肉身，目标醒来自动退出，明确困锁例外，内外时间1:1。',missing:["实际佩戒目标、精神世界场景及明确困锁"]},
  antiMagicRock:{source:'世界书258418733／封魔石',rules:'矿物自身通常免疫A及以下魔幻能量；锁链约束相应施法/能量，不封所有物理和精神行动。传送限制仅保留原资料证言，不变成通用绝对禁传送。D8矿物自身明确魔力/能量且等级≤A的打击默认免疫，例外须具体来源；不把矿物自身免疫转授佩戴者。符文锁链封锁实际施法/能量调用，异界来源不豁免；纯思考、人格与未定义为能量的精神能力不封锁。',missing:["实际打击等级、能量类别、具体锁链目标与范围、例外来源"]},
};

export function runSceneMechanism(root,r,{combat=false,preActionCleared=false,drawDice,actorTemplates={}}={}) {
  const o=root.ruleScene?.objects?.[r.objectId],a=root.actors?.[r.actorId];
  if(!o?.source||!a)throw new RuleInputError('当前场景未登记这个实际对象及来源','ruleScene.objects');
  if(!o.actorIds?.includes(r.actorId))throw new IllegalAction('当前角色无法接触该对象或没有操作资格');
  if(!['demonBox','arrays'].includes(o.type)){
    const kit=runKitMechanism(root,r,{combat,preActionCleared,drawDice,actorTemplates});if(kit)return kit;
    const resolved=runConditionalResource(root,r,{combat,preActionCleared,drawDice,actorTemplates});if(resolved)return resolved;
  }
  let action, result;
  if(o.type==='demonBox') {
    if(r.operation==='sense'){
      const p=o.plans?.[r.part],grades=['D','C','B','A','S'];
      if(!p?.source||p.monsterSense!==true||!grades.includes(p.senseGrade)||!grades.includes(p.holderAuraGrade))throw new RuleInputError('须有实际魔物感知及持有者气息等级','demonBox.sense');
      return {objectId:r.objectId,type:o.type,operation:r.operation,action:null,holderMasked:grades.indexOf(p.holderAuraGrade)<4,boxDetected:grades.indexOf(p.senseGrade)>=3,source:'原团P1/16 msg843565'};
    }
    if(r.operation==='reseal'){
      const p=o.plans?.[r.part];if(!o.released||!p?.source||!['returned','dead'].includes(p.outcome))throw new RuleInputError('须实际归盒或死亡回归的来源事件','demonBox.reseal');
      o.sleep=3;o.open=false;o.released=false;o.openRounds=0;o.closedMinutes=0;
      for(const record of Object.values(root.actors))record.state.statuses=record.state.statuses.filter(s=>s.demonBoxId!==r.objectId);
      return {objectId:r.objectId,type:o.type,operation:r.operation,action:null,sleep:3,resealed:true};
    }
    if(!['open','close'].includes(r.operation))throw new IllegalAction('盒子支持开关、感知或实际归盒');
    if(!Number.isSafeInteger(o.sleep)||o.sleep<0||typeof o.open!=='boolean'||o.released)throw new RuleInputError('缺少魔物之盒当前状态或释放后的采用规则','demonBox.state');
    
    if(o.open===(r.operation==='open'))throw new IllegalAction('盒子已是该状态');
    action='move';o.open=r.operation==='open';o.closedMinutes=0;result={open:o.open,sleep:o.sleep};
    if(!o.open)for(const record of Object.values(root.actors))record.state.statuses=record.state.statuses.filter(s=>s.demonBoxId!==r.objectId);
  } else if(o.type==='arrays') {
    const array=o.arrays?.[r.part];if(!['physical','spatial'].includes(r.part)||!array)throw new RuleInputError('须选当前实际存在的一座阵','arrays.part');
    if(r.operation==='activate') {
      if(!Array.isArray(o.boundary)||o.boundary.length!==4||!o.boundary.every(Number.isFinite)||o.boundary[2]<=0||o.boundary[3]<=0)
        throw new RuleInputError('启动前须按实际施工位置固定结界边界','arrays.boundary');
      if(array.active||!array.installed||!array.circuitIntact||!array.nodeIntact||!array.powerReady||!array.operators?.includes(r.actorId))
        throw new IllegalAction('该阵尚不满足启动条件，或操作者未掌握且不在节点');
      array.active=true;action='standard';result={part:r.part,active:true,independent:true};
    } else if(r.operation==='cut') {
      if(!array.cuttableBy?.includes(r.actorId))throw new RuleInputError('须先确认暴露关键连接、合适工具及无干扰条件；否则走实际判定/破坏','arrays.cuttableBy');
      array.circuitIntact=false;array.active=false;action='standard';result={part:r.part,active:false,independent:true};
    } else throw new RuleInputError('修复需要实际材料、工时及判定，不能一动作重置阵法','arrays.repair');
  } else {
    const rule=CONDITIONAL_RULES[o.type];throw new RuleInputError(rule?`${rule.source}尚缺：${rule.missing.join('、')}`:'该来源尚无已采用机械条文',`mechanism.${o.type}`);
  }
  if(combat) {
    const spent=spendAction(a.state,action,{preActionCleared});if(!spent.result.allowed)throw new IllegalAction(spent.result.reason);a.state=spent.state;
  }
  return {objectId:r.objectId,type:o.type,operation:r.operation,action,...result};
}
export function sceneBarriers(scene) {
  return Object.entries(scene?.objects??{}).filter(([,o])=>o.type==='arrays').flatMap(([id,o])=>
    Object.entries(o.arrays??{}).filter(([,a])=>a.active).map(([type])=>({id:`${id}/${type}`,type,rect:o.boundary,source:o.source})));
}
export function advanceSceneTime(scene,minutes) {
  const changes=[];
  for(const [id,o]of Object.entries(scene?.objects??{}))if(o.type==='demonBox'&&!o.released) {
    if(!Number.isInteger(o.sleep)||typeof o.open!=='boolean')throw new RuleInputError('盒子的当前睡眠值与开关状态未记录',id);
    if(o.open) {
      o.openRounds=(o.openRounds??0)+minutes*10;const ticks=Math.floor(o.openRounds+1e-8);o.openRounds-=ticks;
      o.sleep=Math.max(0,o.sleep-ticks);if(o.sleep===0)o.released=true;
    } else {
      o.closedMinutes=(o.closedMinutes??0)+minutes;
      const days=Math.floor(o.closedMinutes/1440);
      if(days) {
        o.sleep=Math.min(3,o.sleep+days);o.closedMinutes-=days*1440;
      }
    }
    changes.push({objectId:id,sleep:o.sleep,released:o.released===true});
  }
  return changes;
}
