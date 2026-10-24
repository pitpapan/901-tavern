# 初始卡与正式遭遇入口验证

2026-10-22。此包是独立`901 帝都初始卡`与`/901-opening-combat`。源卡、旧完整卡baseline和旧实测聊天未覆写，模型仍为`makersuite / gemini-3.5-flash-lite`。

## 程序定向验证

`combat/opening.test.mjs`、`gm_runtime/opening.test.mjs`、`integrated.test.mjs`、`narrative.test.mjs`最终相关用例35/35通过；父负责的gate25项、script10项及受本次carry字段影响的adapter12项一并检查，最终82/82通过，日志`opening-tests.txt`。覆盖四人实际初始面板、母子技能自动成功、普通格挡、流风/身法、拔刀/电伤、无甲破身、瞄准、固定敌HP与B伤、石像圈限、撤离不算任务完成、同场实例再入场站位、不同实例身份、D级魔法杀手一层终结/清零与到期、场景绑定刷新、分钟持续效果保留；新增pending移动事实及storyContext隐私/真实6米相距。满瞄补齐命中造成伤害时额外1A，同次cap14，miss不另发伤害。

面板：御12HP、will3、速25、先攻7、常21DP+1auto/cap14、防11，格挡19+1技能auto；流风2为25DP，主动身法+流风27DP/速45。黄12HP、will6、灵力5、速16、先攻13、18DP+2auto/cap10、防8，低先攻攻击者时10；格挡14/16+1技能auto，拔刀20DP及条件额外1成功，雷鸣22DP且至多2电。姜20HP、will6、气2/斗气2、速25、先攻6、23DP+2auto/cap18、防6/格挡13+1；无甲生物27DP+3auto/cap22。布8HP、will显式override5、速22、先攻9、普通13DP/0auto/cap14、防6/8、刀格挡7/9，午时14/满瞄18；普通箭20。

首次真实入口失败暴露baseline长剑子技能缺Builder所需scope。修正为`scope:长剑 / scopeId:weapon.long-sword`，补Builder契约用例；首条未裁定通知保留在实测原聊天。没有通过预灌battle绕过失败。

## 真实酒馆接战与退出

聊天：**901 初始卡石像撤离实测 - 2026-10-22**。基于已采用试炼洞穴一具石像的隔离当前态，首帖明确仅御临风在场，不表示帝都T0已经在洞穴。初始MVU为10/12、L2、流风21/22，目的是验证已有伤势/资源承接。未预灌battle，未固定骰或强迫石像选招。

1. 玩家自然声明接战。模型提取当前现场逐字依据，`scene-binding/.../3/0/1`保存revision1，`gm-runtime/.../1/0/combat`在revision2进入。实际参战仅player与`cave-entrance-stone:stone`；站位[4,0]与[2,0]，新敌仍固定14HP。御临风仍10/12、L2、流风21/22，没有回满。见`live-after-entry-attempt.jsonl`。
2. 明确自由流风2并结束回合：revision3只支出2流风至19/22；revision4结束；石像模型自行选普通石拳，revision5等待玩家防御。此时未掷骰、生命仍10/12，没有预扣伤害。见`live-flow-or-pending.jsonl`。
3. 玩家明确基础/被动防护、不格挡、不转换。revision6实际2B、生命10→8，responses guarded:false；revision7石像结束，回到玩家第2轮。正文有程序2B收据，没有把发麻修辞写成麻痹。见`live-after-first-defense.jsonl`。
4. 玩家明确沿东侧撤到[8,0]。revision8因石像借机攻击暂停；程序仍[4,0]与8/12，等待本击独立防御。此条原模型正文错误提前写成已撤离且打空，原样保留于`live-exit-progress.jsonl`。随后修正公开事实：pending移动只提供仍原位/待定防御，不再提供移动后距离、路程及路线；叙述提示区分resolved与pending。
5. 玩家明确本次基础防护。revision9真实借机造成2B后移动[4,0]→[8,0]；revision10返回story。最终6/12、B4/L2/A0、流风19/22、will3/3、XP0、无异常。石像仍14/14及[2,0]。resolution为withdrawal，taskComplete:false，xpAwarded:0。没有杀死石像、自动治疗、领取奖励或查明其他区域。见`live-after-withdrawal.jsonl`。
6. 分钟流风buff2脱战保留，`durationCarry.flow.remainingRounds=9`并标记`needsHostTimeAccounting:true`。没有剧情时间时钟，脱战期间时间仍须主持计时，不能当作已到期或无限持续。

后续程序验收补齐了`combatCarry`原先缺少durationCarry、used及冷却余轮的字段；prior合并旧battle metadata以兼容已有carry缺字段。同实例承接每场一次used，不同实例新建used；一分钟效果与1轮冷却均保留余轮。扩展同一withdrawal/reentry用例验证，没有再开UI战斗冒充真实能力案例。

## 叙述定向复核

`pending-movement-real-probe.json`为修正后同模型对保存revision8事实做的一次真实只读叙述probe，不是新战斗、没有重掷/改骰或改写聊天。输出只写石拳逼近、正要转折与“等待玩家声明如何防御”，没有已到[8,0]、退出圈或攻击落空。仍有“封死退路”“错开半步”的自由修辞，不将其作为新地图阻挡或实际移动。

最初战后普通对话没有新增规则operation，仍revision10，但旧模型提示把缺席黄泉、布莱特从开场背景补到现场，并把实际6米写成2米；原文保留`live-after-story.jsonl`。因此新增同步`storyContext()`，仅提供当前可见participants、相距、场景、phase和resolution，不含NPC数值；卡脚本正接入动态当前态，以实际现场优先于旧聊天修辞与开场。

普通观察中的“不攻击”曾被旧窄风险guard当作正向攻击声明，真实临时DOM错误为`Explicit mechanical risk cannot use NO_CHECK`（`adjudication-gate.mjs:328`），见`story-negation-error.json`。父修复明确否定短语，但仍拦住“否定第一目标、实际攻击另一目标”的NO_CHECK。后来直接注入正确的当前现场时，旧scenario与聊天仍使模型补人；实际输入仅御/石像6米、输出错误的证据见`story-current-scene-input.json`与`live-final-story-failed.jsonl`。这些失败原文均保留。

最终请求在gate调用前本地求值modelOptions函数为普通对象；已有MVU现场时不再注入T0 scenario与T0系统开场，在末尾system提供当前可观察者、位置与未见伤势条件。保留实际聊天承接及后续真实到场/转场的条件，不把上次战场永久锁死。临时DOM诊断和debug console已移除。

**最终真实普通story通过。** 同一聊天再次发送原观察句“我仍留在原地，安静看着圈内的石像，不移动、不治疗、不攻击。”，程序判NO_CHECK，无新增机械operation。正文为：

> 试炼洞穴入口处，微弱的光线落在地面散落的碎石上。石像魔偶静静伫立在六米开外的阵圈中央，深灰色的躯体毫无波澜，既没有再次前趋，也没有多余的动作。
>
> 御临风握着弃风长剑站在原地，目光落在前方的石像上。空气中只有岩壁渗水落下的微小声响。

只有御临风与石像，正确6米；无黄泉/布莱特，无石像裂痕、治疗或新增攻击。见`live-final.jsonl/json`。自身MVU展开为6/12、流风19/22、B4/L2/A0、属性5/5/4/4/1/2，无异常；截图见本次工具记录。

## 最终保存与部署一致性

最终结算快照与MVU生命、能量、状态、位置逐项相同。`live-verification-result.json`记录revision10、10次操作、stone14/14、player[8,0]与stone[2,0]，世界书136条完整entries与旧008来源deepEqual，正式新卡first_mes沿旧已采用入都T0。33份部署运行/JSON文件与候选包逐文件SHA256相等。

最终刷新与重开复核结果由`opening-live-verify.mjs`读取`live-final.jsonl`、`live-refresh.jsonl`及刷新前`live-after-story.jsonl`比较；不依赖屏幕文字恢复状态。详细结果见`live-verification-result.json`。

最终已实际刷新浏览器并重新打开同一聊天：完整规则根对象deepEqual，仍revision10／10次操作，无重复伤害、扣费或入场。自身UI仍6/12、流风19/22、B4/L2，最后一条正确普通正文保留；两项临时DOM诊断属性均为空。父验收第二阶段通过。未适配能力清单与脱战剧情时间须主持计时的限制继续有效，见README。
