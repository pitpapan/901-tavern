import {RESOURCE_ACTION_INDEX} from '../resource-action-index.mjs';
import {GUANLAN_RULE} from '../growth-pricing.mjs';
import {OPENING_QUALIFICATIONS} from './actor-rules.mjs';
import {CONDITIONAL_RULES} from './scene-rules.mjs';
// Shared classifier/worldbook capsule, sourced from the adopted 901 core.
export const CORE_RULE_REFERENCE={id:'901.rules.core',title:'901已采用核心裁定规则',
  source:'work/rules_fusion/901-core-rules-v0.1.md；work/rules_engine/gm_runtime/source-recheck-20261023.md D1–D14（用户采用）；RE求生28–34/70–78、学识34–40/76–80、手上功夫42–48/64–67',
  content:GUANLAN_RULE+' 来源：work/rules_engine/gm_runtime/source-recheck-20261023.md 观澜法成长减费（用户提供条文）。'+'已采用补充D1–D14（2026-10-23）：冷热各按原规则抵抗后，以当前有效点数1:1抵消，不回退伤害。多足全罚阈值保留人/狼2与蜈蚣21例，其余max(2,ceil(移动肢体数/2))，可排除明确豁免肢体。非延长且单次判定的行动可由玩家明确花1意志加3DP，受击也可花1意志对此次攻击加3防御；每行动一次、措手不及与机运骰不可用，叠加PHB基因锁已定增益。主动基因锁全部解除为自由动作；同轮双开整轮预备21XP，先1后2，只失败阶扣7/14，一阶失败停止；临时力量撤除时原B/L/A依序重入新HP容量，溢出升级。第三方击打缠斗采用实际候选者最低防御、max(1,体积)比例抽签，可按明确遮挡排除。RE难度参考（D12，仅相应任务基准）：野外辨方向DC1，避沼泽/流沙2，预报24小时天气3，带路3；寻食水每成功1份、防恶劣天气每成功保护1人，非固定DC。追踪雪地1、软泥2、草地3、岩石4，体积/时间/天气修正须说明。知识简单2、一般3、困难4、冷门6；文件解读简单4、困难6、复杂怪异8，语言/损毁修正须说明。装置简单1、较难2、困难3、几乎不可能10，锁自身明确DC优先，不用于电子/生物识别锁；无人看管偷取2、身上偷取4再按实际体积修正。明确901/来源DC优先，对抗保持对抗，隐藏物品不改固定DC；只借难度不导入整套RE技能前提/动作/失败重试制度。强化只在实际登记开放的节点或故事间隙，玩家明确选项：属性一般6XP，升6/11/16…12XP并加自动成功及大能选择资格；主技能一般3XP、到5级9XP且上限5；子技能每5级9XP、其余3XP；普通专长下一等级×3XP。费用由JS读取当前等级计算，扣XP与提升原子保存，重复操作复用结果；余额不足或学习条件不符不扣费。901已采用核心：六属性为力量、敏捷、智力、感知、意志、风度。普通骰池＝关键属性＋主技能＋一个匹配子技能＋适用修正。每颗D10的8–10为1成功，10加骰；901自动成功不要求掷骰先成功。DC是所需成功数。先判断资格与结果是否已经确定；确定可行或不可能时不用硬造检定。固定难度先沿具体已采用规则，没有具体基准才由主持按场景裁定。主动对抗使用双方当前人物数据和适用判定，主动方同值成功；不得随意改成固定DC。普通反射＝敏捷＋运动，强韧＝力量＋求生，意志＝意志＋风度；当期角色已确认异式与来源修正优先。普通异常抵抗按该状态关键属性低者＋求生，不能一律当强韧或意志。延长判定按周期累计成功并检查期限；累计目标不同于一次成功DC。成长按既有XP与已确认学习条件支付，不因训练时长发XP。PHB燃烧默认在人物自身行动结束结算一次，不逐标准/移动/迅捷小动作触发。状态、伤势、库存、费用由JS结算，叙述不得改数。资料存在不表示持有、在场或自动触发。'};
export function ruleActionInstructions({actors=[],events=[],genetic=[],feats=[],learningOffers=[],objects={},growthWindow=null,topics=''}={}) {
  const keys={geneticLock:/基因锁/,demonBox:/魔物之盒/,arrays:/结界|封印阵|法阵/,teleport:/传送|空间移位/,magicConstitution:/魔力体质|器物供能/,ancientBelt:/腰带|驱动器/,phantomRings:/Engage|Sleep|Underworld|Phantom戒指/i,antiMagicRock:/封魔石/};
  const references=Object.fromEntries(Object.entries(CONDITIONAL_RULES).filter(([id])=>keys[id].test(topics)||Object.values(objects).some(o=>o.type===id)));
  return `[${CORE_RULE_REFERENCE.title}] ${CORE_RULE_REFERENCE.content}\n来源：${CORE_RULE_REFERENCE.source}\n`+
    `当前已保存人物目录（仍须核实现场）：${JSON.stringify(actors)}\n`+OPENING_QUALIFICATIONS+'\n'+
    `资源动作目录（仅实际持有且已登记计划可用）：${JSON.stringify(RESOURCE_ACTION_INDEX.filter(x=>topics.includes(x.name)||actors.some(a=>a.learnedResources?.[x.resourceId]?.learned)))}\n`+
    '目录中的implementationGaps是实现缺口，不是缺规则或待玩家裁定；不得把这些效果叙述为已结算，不得通过普通状态或自填数值绕过。unresolvedRules才是来源缺参数；仅请求该动作实际依赖的参数。只调用actions中已登记操作，partial不表示整项资源全部可用。'+
    'kitResource对象使用mechanism路由，operation与part只选已登记计划。观澜initialAttributes/accumulate/insight/sense，澄心observe/selectObservation/invalidateObservation/setConversion，化劲clearJin/spendJin。初始属性和积累方向必须由玩家选定；悟法XP须独立一次付足，不得混付或分期。未学资源不能调用。'+
    '以下均用外层CHECK_REQUIRED与reason包装request。'+
    `当前可强化窗口：${JSON.stringify(growthWindow)}；未开放不得结算成长。`+
    '玩家明确花1意志增强时，普通检定也改用kind:rule的check/save或opposed，在对应人物选择器加willpower:true；下位传送确需携物检定或Wizard Defend单次施法时mechanism也可带willpower:true；未明确选择不得添加。延长、基因锁开启骰和机运骰不得使用。受击意志选择走战斗反应选项。'+
    'reason只解释采用哪条规则与现场依据，不能预报尚未投出的成功数：对抗的被动骰池不是固定DC；风度是属性；累计周期序号只以保存的periods为准。'+
    '普通检定的sub必须匹配实际子技能；御临风判断方向的求生检定加purpose:"orientation"，由JS按已采用分支覆写＋6，不用于泛用观察。'+
    '仅B填满生命槽时，主动行动先给preActionDC（主持按场景裁定的正整数），JS先做力量检定；失败昏迷、原行动不执行。'+
    '其他在场已存档人物的固定检定request={"kind":"rule","action":"check","actorId":"目录ID","attribute":"实际属性","skill":"实际技能","dc":整数}，可带sub。'+
    '豁免request={"kind":"rule","action":"save","actorId":"player","type":"will|reflex|fort","dc":整数}，type选其一；'+
    '对抗request={"kind":"rule","action":"opposed","active":{"actorId":"player","attribute":"实际属性","skill":"实际技能"},"passive":{"actorId":"已列对手ID","attribute":"实际属性","skill":"实际技能"}}，可带sub，缺对手资料须指出；无技能的多属性对抗可省略skill、以attributes:["意志","风度"]替代attribute，不能凭空添加技能；'+
    '延长request={"kind":"rule","action":"extended","actorId":"player","taskId":"稳定任务ID","attribute":"实际属性","skill":"实际技能","target":累计目标,"periodMinutes":周期分钟,"maxPeriods":最多周期}，只结算玩家声明完成的一周期并沿用保存参数；'+
    '成长request={"kind":"rule","action":"growth","actorId":"player","attribute":"玩家指定属性"}或将attribute换成skill及可选sub，须玩家明确提升一级且满足学习条件；'+
    '急救request={"kind":"rule","action":"first_aid","actorId":"player","targetId":"可接触伤者ID"}；'+
    '场外启动已持有的流风/腾转或拔收刀、上箭、切换布莱特武器：request={"kind":"rule","action":"ability","actorId":"player","abilityId":"flow|tengzhuan|draw|sheathe|reload|stowWeapon|readyWeapon选一"}；flow须tier:1或2。例如玩家明确消耗两点流风启动时完整request为{"kind":"rule","action":"ability","actorId":"player","abilityId":"flow","tier":2}；tier不可遗漏或改填resource。readyWeapon须weapon:bow/longknife/dagger。只按实际能力且玩家明确声明调用，JS照源扣费、保存持续时间，不能免费生效。'+
    '催眠的额外抵抗仅在登记的hypnosisOrder事件下返回action:"hypnosis_resist"、actorId、statusSource和eventId，不因为一般军务风险重复检定。'+
    '戒指存取request={"kind":"rule","action":"inventory","actorId":"player","operation":"store或retrieve","itemId":"当前实物目录ID"}，只能操作已有且参数齐全物品；'+
    '实际经过时间request={"kind":"rule","action":"time","actorId":"player","minutes":实际分钟,"sourceQuote":"已确定经过时间的原文"}，只推进已声明时间，不假定发生休息或恢复。'+
    '异常request={"kind":"rule","action":"status","actorId":"player","type":"状态名称","points":来源点数,"sourceQuote":"已确认效果逐字原文"}；'+
    '带具体肢体、燃烧类别、永久后果、强制命令或逃离条件的状态，使用已登记事件request={"kind":"rule","action":"status_event","actorId":"实际人物ID","eventId":"已列ID"}。statusContext更新实际感知/逃离选项；statusResistance处理特殊指令额外抵抗；extinguish/wake/sleepPerception处理灭火、唤醒、睡眠被动感知。不能编造事件或用普通status绕过来源参数。涉及受损肢体的check须limbIds；玩家的逃离与执行指令动作仍由玩家选择。'+
    '冻结按PHB特殊规则以力量＋求生抵抗，重度门槛仍取力量/敏捷较高者；已冰封者再受冻结由JS转成等量寒冷L，不再抵抗。温度未登记时不能宣称冻结已自然消退。'+
    `已确认事件：${JSON.stringify(events)}；request={"kind":"rule","action":"node或chapter或reward按事件type选择","actorId":"player","eventId":"已列ID"}，不输入XP。`+
    `已登记资源学习项目：${JSON.stringify(learningOffers)}；只有玩家明确学习/购买项目时返回request={"kind":"rule","action":"resource","actorId":"player","offerId":"已列ID"}。不填价格、折扣或XP；JS核价。默认普通XP付清余款；分期或悟法支付只选择已登记payments中的paymentId，须玩家明确选中该方案的label名称（旧方案无label时使用ID），悟法另须明确声明。向玩家展示方案名称与实际金额，结构化请求才填写ID。无已登记的学习资格/具体价格不能兑换，不凭D级标签统一报价。完成记录不凭空赋予未实现的招式执行器。`+
    `可学习专长：${JSON.stringify(feats)}；只对玩家明确学习的已列featId返回action:"feat"。`+
    `当前登记场景物件：${JSON.stringify(objects)}。request={"kind":"rule","action":"mechanism","actorId":"player","objectId":"登记ID","operation":"实际操作","part":"已登记计划ID或形态"}；须玩家明确操作。盒子open/close/sense/reseal，实际魔眼暴露用status_event的demonGaze、阵法activate/cut（part为physical/spatial）；传送lower/upper/upperFail；魔力体质capacity/sense/sleep/meditate/power；Wizard transform/shift（part为fire/water/wind/earth）、drawWeapon/weaponMode（sword/gun）、defend/garuda/garudaCheck/interceptItem/environment/end；戒指sleep/engage/exit；封魔石lock/unlock/resistance；基因锁对象geneticLock用unlock/unlockBoth/shift/end/allocateBacklash，选择登记的plans，不能由模型补写玩家意图、履历、属性选择。目标、费用、距离与器物条件只取实际objects.plans，不由request改数。缺项只阻止依赖该项的操作。战斗中使用legalOptions里的mechanism/statusEvent及其他合法动作，不能调用场外路由绕过动作预算。`+
    (Object.keys(references).length?`本次条件资源的已采用规则与确实缺参（不表示当前持有）：${JSON.stringify(references)}。`:'')+
    (genetic.length?`已授权基因锁机会（一/二阶按登记stage，主动模式和所选属性来自已确认计划）：${JSON.stringify(genetic)}；request={"kind":"genetic_unlock","stage":1,"opportunityId":"已列ID"}。`:'')+
    '攻击交给已登记战斗，不返回kind:attack。不得创造状态点数、对手卡面或奖励。';
}

// Scene registries are authored through /901-scene, never by classifier output.
