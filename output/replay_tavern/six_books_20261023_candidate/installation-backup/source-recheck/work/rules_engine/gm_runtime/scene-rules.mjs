import {RuleInputError,IllegalAction} from '../combat/mechanics.mjs';
import {spendAction} from '../core.mjs';
import {runConditionalResource} from './conditional-resources.mjs';

export const CONDITIONAL_RULES={
  demonBox:{source:'世界书132414086／魔物之盒',rules:'睡眠值3；打开每轮－1，关闭每完整24小时＋1；到0释放魔物。当前睡眠值、开关状态及操作动作须有现场记录；愿望性质由主持判定，不执行任意死亡。',missing:['实际持有者与当前睡眠值','开关动作','恢复上限及释放后重置规则']},
  arrays:{source:'capital_arrays_hypnosis_rules_draft.md／UCL_20261015_031、UCL_20261018_006',rules:'结界阻实体跨界，封印阻跨界空间移动；两阵独立。完整回路、节点、供能和在节点操作的知情者齐备，标准动作启动一阵并自持；杀安装者不自动停阵。关键节点破坏只停本阵。',missing:['当前两阵安装及节点状态','固定边界','实际破坏载体耐久（仅需要伤害结算时）']},
  teleport:{source:'世界书174980132／空间传送',rules:'下位自身可见无阻50米，1魔力整轮、言语手势；携物体积2需DC2，此后每体积＋1DC/+1魔力；他者自愿或无意识、距施术者1米、传送25米。上位9魔力起、同位面已去过且记得之处；每1000米累计100成功，每周期1分钟；失败返还已耗魔力的下取整一半。',missing:['施法关键属性与技能','非整千米计价','失败/中断条件','体积大于5的他者携带换算']},
  magicConstitution:{source:'世界书179104843；人物卡资料集410–414、1096–1098',rules:'容量智力＋感知；沐瞳变体另按实际已学法术增加上限，最多智力，排除另购体系所得法术。未掩饰非异次元储存器物波动为启动等级－2、施法者最高魔法等级－3；范围（感知＋波动等级）×11米。4小时睡眠回满，逐分钟比例累计后下取整、每日额度不超过池上限；每小时冥想感知＋智力成功数恢复，不占睡眠额度。器物供能按实际费用，不因此会法术。',missing:['实际适用池、当前量、所学法术及当天睡眠记录','实际器物费用/动作','有掩饰波动时该隐藏能力的侦破规则']},
  ancientBelt:{source:'世界书208839788；人物卡资料集1016–1079；PHB基本规则29–30',rules:'Wizard实际佩戴戒指触驱动器：标准3魔力变身，即时不可打断；迅捷换属性，不另增原文未写的魔力费、可打断。各形态甲8/8替换旧甲，保留防弹/防能量武器关键词。火力敏＋2，白刃/肉搏/枪弓＋4，施法＋2，免火；命中一半转火、其中一半提高伤级至多A，各自下取整。水力敏＋2、白刃/枪械＋4、施法＋4；迅捷格挡或移动兼格挡、格挡＋2；攻击后目标基础/闪避/洞察合计－2，叠加并刷新至施术者第二轮；危险范围＋1格、枪械免费响应进出。风敏＋3、四类攻击＋4、所有判定和防御＋2，速度＋20、免坠落/困难地形/多次攻击减防，可无减值攻击主目标相邻且自己射程内敌人。土力＋3、白刃/肉搏＋4、全吸3/力场4、力量对抗＋2自动；剑枪忽略3DR/全吸或6硬度。剑枪迅捷召出/切换，枪4L破甲3破魔5射程100无限弹银圣魔，剑6L破甲5破魔3圣魔大师。Garuda标准1魔力持续一场景，结构15硬度4防御9/12飞30，侦查7＋1自动/隐藏6＋1/反射6，可干扰造成多次攻击减防1。Defend标准1魔力持续施法成功轮：火防御2/2、焚毁靠近硬度≤2物品、近战者无豁免燃烧2；水魔法伤害≤4免疫，否则减3；风远程物理<12DP反弹、>12减6，近战减4；土方向全掩蔽结构20硬度10。',missing:['实际持有、施法/剑枪技能、土墙位置、使魔本场先攻','解除变身的动作与条件','防弹/防能量武器确切采用定义；不可静默引入RE','风Defend恰好12DP','枪械连射的完整采用程序（本卡只有资格）','水压过高的场景界线']},
  phantomRings:{source:'世界书225474856；人物卡资料集1081–1091；PHB生存状态326–330',rules:'Sleep标准1魔力，实际佩戒目标按DC4意志豁免，失败进入普通睡眠；即时表示施加，不表示立刻醒来。睡眠失去闪避、不能主动反应，范围反射0成功；伤害唤醒、他人标准动作接触唤醒；敏感范围感知－1，目标视为隐藏、感知对抗减1成功。Engage整轮0魔力进入佩戒者Underworld，不等于救治。',missing:['实际佩戒目标','Engage现实身体、返回/退出方式及精神世界具体场景']},
  antiMagicRock:{source:'世界书258418733／封魔石',rules:'矿物自身通常免疫A及以下魔幻能量；锁链约束相应施法/能量，不封所有物理和精神行动。传送限制仅保留原资料证言，不变成通用绝对禁传送。',missing:['实际适用等级与例外','具体锁链作用对象及范围']},
};

export function runSceneMechanism(root,r,{combat=false,preActionCleared=false,drawDice,actorTemplates={}}={}) {
  const o=root.ruleScene?.objects?.[r.objectId],a=root.actors?.[r.actorId];
  if(!o?.source||!a)throw new RuleInputError('当前场景未登记这个实际对象及来源','ruleScene.objects');
  if(!o.actorIds?.includes(r.actorId))throw new IllegalAction('当前角色无法接触该对象或没有操作资格');
  if(!['demonBox','arrays'].includes(o.type)){
    const resolved=runConditionalResource(root,r,{combat,preActionCleared,drawDice,actorTemplates});if(resolved)return resolved;
  }
  let action, result;
  if(o.type==='demonBox') {
    if(!['open','close'].includes(r.operation))throw new IllegalAction('盒子仅支持开关');
    if(!Number.isSafeInteger(o.sleep)||o.sleep<0||typeof o.open!=='boolean'||o.released)throw new RuleInputError('缺少魔物之盒当前状态或释放后的采用规则','demonBox.state');
    if(!['free','swift','move','standard','full'].includes(o.activationAction))throw new RuleInputError('原文未给魔物之盒开关动作，须主持明确','demonBox.activationAction');
    if(o.open===(r.operation==='open'))throw new IllegalAction('盒子已是该状态');
    action=o.activationAction;o.open=r.operation==='open';o.closedMinutes=0;result={open:o.open,sleep:o.sleep};
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
        if(!Number.isInteger(o.recoveryCap))throw new RuleInputError('盒子关闭一天后的恢复上限未给出，须主持裁定',`${id}.recoveryCap`);
        o.sleep=Math.min(o.recoveryCap,o.sleep+days);o.closedMinutes-=days*1440;
      }
    }
    changes.push({objectId:id,sleep:o.sleep,released:o.released===true});
  }
  return changes;
}
