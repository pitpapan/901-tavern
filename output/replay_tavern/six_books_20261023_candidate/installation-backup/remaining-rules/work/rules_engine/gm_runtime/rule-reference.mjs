import {OPENING_QUALIFICATIONS} from './actor-rules.mjs';
import {CONDITIONAL_RULES} from './scene-rules.mjs';
// Shared classifier/worldbook capsule, sourced from the adopted 901 core.
export const CORE_RULE_REFERENCE={id:'901.rules.core',title:'901已采用核心裁定规则',
  source:'work/rules_fusion/901-core-rules-v0.1.md §§1–3、6–8；PHB/非战斗行动与战斗行动 §竞争与对抗',
  content:'901已采用核心：六属性为力量、敏捷、智力、感知、意志、风度。普通骰池＝关键属性＋主技能＋一个匹配子技能＋适用修正。每颗D10的8–10为1成功，10加骰；901自动成功不要求掷骰先成功。DC是所需成功数。先判断资格与结果是否已经确定；确定可行或不可能时不用硬造检定。固定难度先沿具体已采用规则，没有具体基准才由主持按场景裁定。主动对抗使用双方当前人物数据和适用判定，主动方同值成功；不得随意改成固定DC。普通反射＝敏捷＋运动，强韧＝力量＋求生，意志＝意志＋风度；当期角色已确认异式与来源修正优先。普通异常抵抗按该状态关键属性低者＋求生，不能一律当强韧或意志。延长判定按周期累计成功并检查期限；累计目标不同于一次成功DC。成长按既有XP与已确认学习条件支付，不因训练时长发XP。状态、伤势、库存、费用由JS结算，叙述不得改数。资料存在不表示持有、在场或自动触发。'};
export function ruleActionInstructions({actors=[],events=[],genetic=[],feats=[],objects={},topics=''}={}) {
  const keys={demonBox:/魔物之盒/,arrays:/结界|封印阵|法阵/,teleport:/传送|空间移位/,magicConstitution:/魔力体质|器物供能/,ancientBelt:/腰带|驱动器/,phantomRings:/Engage|Sleep|Underworld|Phantom戒指/i,antiMagicRock:/封魔石/};
  const references=Object.fromEntries(Object.entries(CONDITIONAL_RULES).filter(([id])=>keys[id].test(topics)||Object.values(objects).some(o=>o.type===id)));
  return `[${CORE_RULE_REFERENCE.title}] ${CORE_RULE_REFERENCE.content}\n来源：${CORE_RULE_REFERENCE.source}\n`+
    `当前已保存人物目录（仍须核实现场）：${JSON.stringify(actors)}\n`+OPENING_QUALIFICATIONS+'\n'+
    '以下均用外层CHECK_REQUIRED与reason包装request。'+
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
    '冻结按PHB特殊规则以力量＋求生抵抗，重度门槛仍取力量/敏捷较高者；已冰封者再受冻结由JS转成等量寒冷L，不再抵抗。温度未登记时不能宣称冻结已自然消退。'+
    `已确认事件：${JSON.stringify(events)}；request={"kind":"rule","action":"node或chapter或reward按事件type选择","actorId":"player","eventId":"已列ID"}，不输入XP。`+
    `可学习专长：${JSON.stringify(feats)}；只对玩家明确学习的已列featId返回action:"feat"。`+
    `当前登记场景物件：${JSON.stringify(objects)}。request={"kind":"rule","action":"mechanism","actorId":"player","objectId":"登记ID","operation":"open/close或activate/cut","part":"阵法选physical或spatial"}；须玩家明确操作。物件没有登记或缺参数时NEEDS_INPUT。`+
    (Object.keys(references).length?`本次条件资源的已采用规则与确实缺参（不表示当前持有）：${JSON.stringify(references)}。`:'')+
    (genetic.length?`已授权基因锁机会：${JSON.stringify(genetic)}；request={"kind":"genetic_unlock","stage":1,"opportunityId":"已列ID"}。`:'')+
    '攻击交给已登记战斗，不返回kind:attack。不得创造状态点数、对手卡面或奖励。';
}

// Scene registries are authored through /901-scene, never by classifier output.
