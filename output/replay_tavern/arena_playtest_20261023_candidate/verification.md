# 擂台隔离实测证据

2026-10-23。本包只接入御临风初始卡对拉德维克及米蕾娅。两种风格均已在真实酒馆完成交锋至结束、战后承接和刷新核对；失败原文保留。最终只复核受影响的取消、昏迷回应、箭击手段及终止声光，没有重掷或重打来消除失败。

程序fixture检查：`node --test work/rules_engine/gm_runtime/arena.test.mjs`，2/2通过。确认两份初始卡保持T0、Builder可消费、只当前两名参战者；新聊天准备时revision0且无battle，不触发模型。

真实酒馆模型：`makersuite / gemini-3.5-flash-lite`，沿当前配置，未修改模型。正式本地API导入两张新卡与仅含首帖的新聊天；首次打开后启用内置脚本、正则及原136条世界书。未固定骰、未预灌battle。

## 拉德维克完整场

聊天：`901 擂台 拉德维克 完整场实测 - 2026-10-23`。实际经历自然入场、玩家未用完动作等待、流风扣费、普通攻击、对方自主行动、明确防御、终止、战后对话、用药拒绝及刷新恢复；**程序与保存检查通过，原始正文存在失败，不将本场称作叙事通过。**

1. `radwick-before-entry.jsonl`首帖无规则根或battle。玩家明确开始后，真实主持分类器选择`arena-radwick`，revision1普通enter，只御临风及拉德维克，相距1米。御12/12、流风22、will3。
2. 首次“自由启动流风2、消耗2”被真实翻译器漏掉`tier`。程序返回“流风选择1或2点”，无扣费、无格挡；原失败保存在`radwick-flow-block-waiting.jsonl`。再次明确2点档位后实际revision2流风22→20、revision3普通格挡；标准1、迅捷1保留，移动0，仍由玩家行动，未自动结束。见`radwick-flow-block-retry.jsonl`。
3. 玩家以保留标准普通攻击，真实掷骰9B，拉德维克16→7；玩家随后明确结束回合。对方模型自主选择普通短棍攻击，revision6只登记pending；御仍12，伤害骰未掷。见`radwick-first-exchange.jsonl`。
4. 玩家明确使用已准备普通格挡且不转换。revision7真实结算1B，`responses.guarded:true`，御12→11；对方自行结束，revision8进入第2轮，御动作正常刷新。见`radwick-first-defense.jsonl`。
5. 第2轮玩家普通格挡后普通攻击。真实爆骰到14B上限，拉德维克完好7→0，累计B9/L7；不是口头钝化免伤，B溢出照常。程序按首帖预告阈值结束，revision11已返回story；不需要也没有补写玩家认输。御11/12、B1、流风20/22、will3/3、XP0；地图仍御[0,0]、拉[1,0]。见`radwick-second-exchange.jsonl`。
6. 战后普通对话NO_CHECK，无新增规则operation，无治疗或资源恢复。随后明确声明用一份药B治疗；真实分类为UNRESOLVED，missing说明药品消耗/治疗定义尚未接入。正文没有虚构喝药/治疗；库存药B仍3，御仍11/12。这个结果只验证诚实拒绝，**用药未适配，不能称作成功消费。**见`radwick-medication-attempt.jsonl`。
7. 实际刷新并重开同一聊天后，完整规则根对象deepEqual，仍revision11/11operations，末次快照生命/能量/位置与MVU逐项一致。30个运行/JSON文件与独立部署目录逐文件SHA256相等，当前模型未变。见`radwick-before-refresh.jsonl`、`radwick-refresh.jsonl`、`radwick-verification-result.json`及`radwick-refresh.png`。UI自身状态11/12、B1、流风20/22，地图仅两人，相距1.0米。

### 保存的正文失败

- 第一轮同一1米站位被写成“数步之外”；防御后无移动事件却写“退回一米之外”。规则地图未发生移动。
- 首次终止正文从`resolution.text`“裁判终止”补出“场边响起裁判的宣判声”，违反本场只有两人在场。原文保留，未改聊天。
- 普通战后对话补写“场地边缘”“包毡短棍落在一旁”；地图/装备并无相应事件。此类文字不作为机械事实采用。
- 父验收确认拉德维克0完好/B9/L7已失去意识；旧投影只写倒地，旧战后对话让他开口，属于错误。新版投影已明确失去意识不能对话，不通过治疗改变原存档。

父代理负责结果投影及叙述提示修正。修正后在原17楼明确“用药暂不执行”并询问当前状态的同一声明上使用酒馆原生重新生成，曾仍被旧药B pending拦住。受限实际诊断见`cancellation-live-diagnostic.json`：模型已经返回NO_CHECK及逐字`cancelPending`，但引用包含多句和问候问号，校验却要求整引用位于同一子句而误拒；这是引用片段校验过窄，不能说模型遗漏取消字段。

**最终取消复核通过。** 定向修正后，仍在原17楼使用酒馆原生重新生成，没有新增玩家楼绕过pending。真实结果为NO_CHECK，operationId属于原17楼，用户楼保存completed。正文明确拉德维克失去意识、没有回应，不新增裁判，不治疗。规则仍revision11/11operations，药B3、御11/12/流风20；最终再次实际刷新并重开，完整规则根deepEqual，NO_CHECK完成标记和正文保留。见`radwick-cancellation-final.jsonl`、`radwick-cancellation-before-refresh.jsonl`、`radwick-cancellation-refresh.jsonl`及`radwick-cancellation-final.png`。原17楼失败证据另存。

最终战后正文仍沿旧修辞提“场地边缘”“器械留身侧”；不把它们作为新增移动或装备掉落，也不因取消通过宣称所有文风瑕疵消失。

拉德维克原始失败证据保留，不重掷、不重打来消除失败。临时诊断只在独立已部署gate的catch中以可见pre显示阶段、错误文案、status及玩家公开取消片段，已保存并用候选gate覆盖移除；没有dump请求、配置或隐藏状态。

## 米蕾娅完整场

原聊天`901 擂台 米蕾娅 完整场实测 - 2026-10-23`自然入场后，真实模型在满状态、尚有18箭时直接选择concede，revision2认输、revision3离场，无交锋或弹药消耗。原证据`mireya-opening-concession.jsonl/json`保留；**不能将这个结果算作已完成的远程完整场验收。**

父定向修正NPC合法认输条件：有实际败势才提供concede，end明确只结束本回合，玩家认输仍由玩家明确声明且不受NPC门槛影响。没有固定NPC选招或骰。独立复测聊天`901 擂台 米蕾娅 完整场复测 - 2026-10-23`已通过正式API创建仅首帖，无battle，原认输聊天不覆盖。

已按父验收修正定点校准：允许未装填时整轮校准，下一回合迅捷上箭保留瞄准，实际弓射仍需装填并扣箭。持械投影按weaponMode及loaded显示未上箭弓、已上箭弓或取出的短棍。`封看进路`普通响应尚未接入，不宣称已验证；其他六张详卡同样不在本包自动执行承诺内。

### 实际复测交锋

1. 同一自然接战声明进入`arena-mireya`。米蕾娅按真实先攻先行动，模型自行选reload（rev2）和strike（rev3）。pending阶段仍18箭、loaded:true，御12/12，尚未掷伤害或扣箭。见`mireya-retest-first-pending.jsonl`。
2. 御尚未准备格挡，玩家明确本次基础/被动防御且不用转换；rev4实际3B，御12→9，18箭→17、loaded:false；模型自己end，rev5轮到御。见`mireya-retest-first-defense.jsonl`。原正文误将射后空弓写成空弦劲风远攻，原文保留，后述只读复核专门检查该缺陷。
3. 玩家声明自由流风2、消耗2，移动向东11米，在对手西侧1米站定；将标准动作转换为移动动作准备普通格挡。rev6—8正确扣流风22→20、位置[11,0]、标准0/移动0/迅捷1，保留迅捷等待，未擅自结束。见`mireya-retest-approach-block.jsonl`。
4. 玩家明确end，模型自行选择撤至[29,0]。rev10因借机窗口暂停；米蕾娅仍在[12,0]，尚未完成移动。见`mireya-retest-close-response.jsonl`。
5. 玩家明确选择本窗口普通借机攻击。真实掷骰9B，米蕾娅12→3，随后本次实际移动完成至[29,0]；按预告完好槽阈值终止，rev12返回story，不追加攻击，不治疗或授奖。御[11,0]、米[29,0]相距18米，御9/12/B3、流风20、will3、XP0；对手17箭、未装填、bow模式。见`mireya-retest-opportunity-result.jsonl`。
6. 原终止正文虚构蜂鸣和红蓝光标，把实体练习场写成虚拟场。父只修实体场地说明及终止投影，没有改效果或存档。真实普通战后对话NO_CHECK，仍rev12，只两名角色在18米原位对话，不治疗/回满/发奖，不继续声光描写。见`mireya-retest-after-story.jsonl`。
7. 最终实际刷新并重开同一复测聊天：完整规则根deepEqual、rev12/12operations、快照与MVU一致；ammunition17、loaded:false及weaponMode bow均由combatCarry保留。见`mireya-before-refresh.jsonl`、`mireya-refresh.jsonl`、`mireya-refresh.png`。UI自身9/12、B3、流风20/22，地图只两人，相距18.0米。

## 同一已结算事实的真实旁白复核

没有为让模型选中某招而另刷整场。`arena-shot-probe.mjs`默认只生成确切payload预览，`--send`才发送。两个复核沿正常`narrationRequest`及原真实GM模型，只读取保存的publicScene事实，不写聊天、MVU或骰，也不覆盖原失败正文。

最初包含既有代理配置字段的probe被自动审批拒绝，尚未发出。父只读核实当前reverse_proxy为空、目的地为既有Google官方`generativelanguage.googleapis.com`；脚本随后移除代理口令字段读取与传输，遇非空代理即停止。确切预览`arena-narration-probe-payloads.json`由父逐项审核，只含虚构测试的可见事实与既有叙述提示，无原聊天、MVU根、NPC数值面板或认证。沿同一exec/审批路径重提一次获准后才实际发送。

- `mireya-first-arrow-probe.json`：同一rev5、afterRevision3事实。真实模型写松弦放箭、箭矢命中受创，接着才写放箭后弓上无箭；没有空弦远程伤害，没有新增攻击或位移。
- `mireya-ending-probe.json`：同一rev12、afterRevision10事实。真实模型承接剑击受创、实际退至18米和按约终止，没有蜂鸣、光标或虚拟投影。仍有“封住退路”与旧存档“等值”措辞，不把它们当实际封路或新装备；不称作全部文风完美。

## 最终验收范围

`arena-live-verify.mjs`已实际通过：两场根对象刷新deepEqual、末次快照/MVU生命资源位置一致、真实箭耗与loaded/weaponMode持久化、原17楼取消后NO_CHECK刷新保留、药B库存不变、136条世界书entries及UID原样保留、30个部署运行/JSON文件逐文件SHA256一致、模型配置未变。结果见`live-verification-result.json`；fixture最终2/2日志为`arena-fixture-tests.txt`。临时pre/console不在最终部署文件，最终DOM诊断数量为0。

真实自然用过的是拉德维克普通短棍、米蕾娅装填/弓射/撤离，以及御临风流风、移动、普通攻击、普通格挡与借机窗口。盾推、稳身、定点校准、换棍等只按父/引擎代理的定向程序检查报告，不声称本次两场全部自然用过，也没有为凑招式再打。药品使用、休息及`封看进路`响应仍未接入。两场均不写真实晋级、XP或奖品。
