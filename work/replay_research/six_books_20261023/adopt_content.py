from adopt_decisions_helpers import ROOT,edit
import json,re
decision='work/rules_engine/gm_runtime/source-recheck-20261023.md'
authority='2026-10-23用户明确采用：D1–D14都按推荐口径采用，直接实现并接入系统，更新分类器和世界书。'
p=ROOT/decision;s=p.read_text(encoding='utf-8').replace('# 待定规则原文复核与集中裁定','# 已采用规则原文复核与集中裁定')
s=s.replace('**“推荐”尚未采用，不会作为世界事实、玩家选择或正式数值执行。**',f'**D1–D14已全部采用。{authority}**')
s=s.replace('**全局哪些行动可花意志、基础费用与DP尚须D9裁定**','**全局意志用法已按D9采用并接入**')
s=s.replace('## 一次集中裁定的建议','## 已采用的D1–D14')
s=s.replace('以下编号可直接用于答复。每项建议都是补充口径或选择性采用，依据不能证明它已经是原规则。','以下口径由用户整体采用；标明原文缺口的说明保留为采用依据，不再表示执行仍待裁定。')
s=s.replace('推荐口径 |','采用口径 |').replace('可以一次答复“D1–D14按推荐”，或只列修改项；在收到裁定前，以上推荐不会自动启用。D7和D11对剧情或生存的影响较大，应特别留意。','采用授权：'+authority)
s=s.replace('当前遇到该分支保留待裁定记录，不能靠撤除来删除伤害。','已按本项迁移伤槽，不能靠撤除来删除伤害。')
p.write_text(s,encoding='utf-8')
for f in ['work/rules_fusion/901-core-rules-v0.1.md','work/rules_fusion/901-open-decisions.md']:
 p=ROOT/f;s=p.read_text(encoding='utf-8');s+='\n\n## 2026-10-23 D1–D14采用\n\n'+authority+'完整口径与原文依据见 [D1–D14裁定表](../rules_engine/gm_runtime/source-recheck-20261023.md)。本记录将该表全部推荐提升为已采用兼容规则；原文未明确之处依据本次用户决定执行，不伪称源书原文。实际装备持有、可强化节点、能量与XP余额和玩家选择仍须现场记录。\n';p.write_text(s,encoding='utf-8')
# Remove settled items from conditional missing lists; preserve actual facts.
p=ROOT/'work/rules_engine/gm_runtime/scene-rules.mjs';s=p.read_text(encoding='utf-8')
changes={
'geneticLock':('主动解除为自由动作并结束全部阶；同轮双开整轮预备21XP，先一后二，仅失败阶扣7/14XP，一阶失败停止。临时力量撤除按新容量重入原B、L、A伤槽并升级溢出。意志增强采用D9。',['实际解锁履历、合格机会/主动意图及二阶所选属性','毁灭性属性伤由承受者分配；临时传奇能力由玩家选择']),
'demonBox':('开关移动动作，沉睡上限3；实际归盒或死亡回归以reseal计划记录并重置3。',['实际持有者、当前睡眠值、开关状态和实际归盒事件']),
'teleport':('上位段数max(1,ceil(距离米/1000))，目标100×段数，费用8＋段数；下位他者max(体积−5,0)并入实际携物体积。',['施法关键属性与技能、实际目标、距离、落点、携物、言语手势']),
'ancientBelt':('D3仅Wizard采用防弹（实弹物理伤降一级）和防能量武器（阻止能量武器恶性转换）；该护甲完全被破甲忽略时关键词失效。D4主动解除迅捷0魔力。D5剑枪连射标准攻击主目标＋3DP，每多目标全组−1DP，按真实邻接包括友方，至多10目标；邻接不递归、每行动轮每目标仅一次邻接追加，无限弹药满足10发。',['实际持有、施法/剑枪技能、土墙位置、使魔本场先攻','水压过高的场景界线']),
'phantomRings':('D7意识进入，肉身原地承受环境；主动exit整轮回原肉身，目标醒来自动退出，明确困锁例外，内外时间1:1。',['实际佩戒目标、精神世界场景及明确困锁']),
'antiMagicRock':('D8矿物自身明确魔力/能量且等级≤A的打击默认免疫，例外须具体来源；不把矿物自身免疫转授佩戴者。符文锁链封锁实际施法/能量调用，异界来源不豁免；纯思考、人格与未定义为能量的精神能力不封锁。',['实际打击等级、能量类别、具体锁链目标与范围、例外来源'])}
for key,(addition,missing) in changes.items():
 pat=r'('+key+r":\{source:'[^']*',rules:')([^']*)(',missing:)\[[^\n]*?\](\},)"
 def replace(m):return m[1]+m[2]+addition+m[3]+json.dumps(missing,ensure_ascii=False)+m[4]
 s,n=re.subn(pat,replace,s);assert n==1,key
s=s.replace('当前睡眠值、开关状态及操作动作须有现场记录','当前睡眠值及开关状态须有现场记录')
p.write_text(s,encoding='utf-8')
shared='已采用补充D1–D14（2026-10-23）：冷热各按原规则抵抗后，以当前有效点数1:1抵消，不回退伤害。多足全罚阈值保留人/狼2与蜈蚣21例，其余max(2,ceil(移动肢体数/2))，可排除明确豁免肢体。非延长且单次判定的行动可由玩家明确花1意志加3DP，受击也可花1意志对此次攻击加3防御；每行动一次、措手不及与机运骰不可用，叠加PHB基因锁已定增益。主动基因锁全部解除为自由动作；同轮双开整轮预备21XP，先1后2，只失败阶扣7/14，一阶失败停止；临时力量撤除时原B/L/A依序重入新HP容量，溢出升级。第三方击打缠斗采用实际候选者最低防御、max(1,体积)比例抽签，可按明确遮挡排除。'
dc='RE难度参考（D12，仅相应任务基准）：野外辨方向DC1，避沼泽/流沙2，预报24小时天气3，带路3；寻食水每成功1份、防恶劣天气每成功保护1人，非固定DC。追踪雪地1、软泥2、草地3、岩石4，体积/时间/天气修正须说明。知识简单2、一般3、困难4、冷门6；文件解读简单4、困难6、复杂怪异8，语言/损毁修正须说明。装置简单1、较难2、困难3、几乎不可能10，锁自身明确DC优先，不用于电子/生物识别锁；无人看管偷取2、身上偷取4再按实际体积修正。明确901/来源DC优先，对抗保持对抗，隐藏物品不改固定DC；只借难度不导入整套RE技能前提/动作/失败重试制度。'
growth='强化只在实际登记开放的节点或故事间隙，玩家明确选项：属性一般6XP，升6/11/16…12XP并加自动成功及大能选择资格；主技能一般3XP、到5级9XP且上限5；子技能每5级9XP、其余3XP；普通专长下一等级×3XP。费用由JS读取当前等级计算，扣XP与提升原子保存，重复操作复用结果；余额不足或学习条件不符不扣费。'
p=ROOT/'work/rules_engine/gm_runtime/rule-reference.mjs';s=p.read_text(encoding='utf-8');s=s.replace("content:'", "content:'"+shared+dc+growth,1).replace("source:'work/rules_fusion/901-core-rules-v0.1.md §§1–3、6–8；PHB/非战斗行动与战斗行动 §竞争与对抗'", "source:'work/rules_fusion/901-core-rules-v0.1.md；work/rules_engine/gm_runtime/source-recheck-20261023.md D1–D14（用户采用）；RE求生28–34/70–78、学识34–40/76–80、手上功夫42–48/64–67'")
s=s.replace("objects={},topics=''", "objects={},growthWindow=null,topics=''")
s=s.replace("'以下均用外层CHECK_REQUIRED与reason包装request。'+", "'以下均用外层CHECK_REQUIRED与reason包装request。'+\n    `当前可强化窗口：${JSON.stringify(growthWindow)}；未开放不得结算成长。`+\n    '玩家明确花1意志增强时，普通检定也改用kind:rule的check/save或opposed，在对应人物选择器加willpower:true；未明确选择不得添加。延长、基因锁开启骰和机运骰不得使用。受击意志选择走战斗反应选项。'+")
s=s.replace('盒子open/close/sense','盒子open/close/sense/reseal').replace('戒指sleep/engage','戒指sleep/engage/exit').replace('用unlock/shift/end/allocateBacklash','用unlock/unlockBoth/shift/end/allocateBacklash').replace('或解除动作','')
p.write_text(s,encoding='utf-8')
edit('work/rules_engine/gm_runtime/replay-check.mjs','return {objects:scene.objects??{},actors:', 'return {growthWindow:scene.growthWindow??null,objects:scene.objects??{},actors:')
edit('work/rules_engine/gm_runtime/replay-check.mjs','return {id,name:a.name,attributes:', 'return {id,name:a.name,xp:s.xp,will:s.will,underworld:s.underworld,attributes:')
# Existing six-book records, no new duplicate rule book or permanent entries.
edit('work/replay_research/six_books_20261023/build_candidate.py',"# Final source/manifest projection.", """# Adopted D1–D14: reuse the corresponding concept records and native UIDs.
conditional = json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {CONDITIONAL_RULES as r} from './work/rules_engine/gm_runtime/scene-rules.mjs';process.stdout.write(JSON.stringify(r))"],cwd=ROOT,encoding='utf-8'))
decision_ref=ref('work/rules_engine/gm_runtime/source-recheck-20261023.md')
for uid,kind in [(208839788,'ancientBelt'),(174980132,'teleport'),(225474856,'phantomRings'),(258418733,'antiMagicRock'),(132414086,'demonBox')]:
    matches=[k for k,r in records.items() if r['uid']==uid]
    assert len(matches)==1,(uid,matches)
    extra(matches[0],'2026-10-23已采用执行口径：'+conditional[kind]['rules'],[decision_ref,ref('work/rules_engine/gm_runtime/scene-rules.mjs')])
    records[matches[0]]['revisions'].append({'source':'D1–D14','reason':'用户已整体采用；实际状态仍由JS/MVU维护。'})
extra('xp','强化节点须现场登记开放，玩家明确选择属性、技能或专长；按下一等级自动计价并原子扣除XP，重复操作不重复扣费。节点奖励与可强化资格分别登记，不把所有奖励当成强化许可。',[decision_ref,ref('work/rules_fusion/901-core-rules-v0.1.md')])

# Final source/manifest projection.""")
# D13 optional actual occlusion registration.
edit('work/rules_engine/gm_runtime/integrated.mjs',"if(config.growthWindow){", """if(config.grappleOcclusion){
      for(const [actorId,v]of Object.entries(config.grappleOcclusion))if(!saved.actors[actorId]||!v.source?.trim()||!Array.isArray(v.excludedIds)||!v.excludedIds.every(id=>saved.actors[id]))throw Error('误击遮挡须实际人物和来源');
      scene.grappleOcclusion=structuredClone(config.grappleOcclusion);
    }
    if(config.growthWindow){""")
edit('work/rules_engine/gm_runtime/integrated.mjs',"['kind','source','events','mechanismPlans'].includes(k)","['kind','source','events','mechanismPlans','grappleOcclusion'].includes(k)")
