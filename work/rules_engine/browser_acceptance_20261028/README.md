# 资源取得：真实酒馆隔离验收（2026-10-28）

本批在 SillyTavern 1.19.0 的内置浏览器完成，使用新卡 `901 资源取得隔离验收 20261028` 与独立路径 `/901-resource-acceptance-20261028/`。首轮111个候选运行模块只部署到该测试路径；后续战斗验收增补既有host-ui模块，共112个。正式运行目录未更新。法师契约版本为 `2026-10-28.magic.2`。

按用户分工，完整战斗及后续互操作验收由GPT-6.1 Terra High负责界面操作决策，Astra负责独立磁盘验收与bug修复，主代理负责CUA工具转接；前述取得／自然语言阶段的主代理验收记录保留为历史。子代理无法访问主会话的内置浏览器，因此由主代理工具执行其步骤并回传页面快照；不是Terra直接连接了标签页。主会话可以访问内置浏览器，不再使用Chrome。前两轮按钮与swipe验收没有调用模型；本轮自然语言验收使用酒馆原有配置的 `gemini-3.5-flash-lite`，没有切换用户模型或API配置。Terra High仍负责界面步骤。

| 验收 | 实际结果 |
| --- | --- |
| 新卡加载与初始化 | 用户授权范围内仅启用新卡角色脚本；修订1、测试XP100，其他人物未变 |
| D阶取得 | 实际MVU修订2，扣15XP，余额85，精神魔力0/2 |
| D阶赠术 | 修订3，领取魔能爆，XP仍85；施法来源绑定法师 |
| C阶取得 | 修订4，再扣35XP，余额50，精神魔力0/12；D赠术保留 |
| 重复同一C请求 | `already_applied`，修订仍4、XP仍50，操作账本没有增加 |
| 两次刷新并重开同一聊天 | 页面返回欢迎页后重新选择该测试聊天，脚本自动加载；无需重新初始化或切换脚本开关。状态与磁盘一致 |
| 重开后按钮 | 两次只读按钮均返回`read-only`及同一存档状态 |
| 正式数据边界 | 对测试前存在的160个卡片、聊天、世界书及正式模块文件比较SHA-256，全部未变 |

遇到的界面问题：角色侧栏和无关提示框曾遮挡按钮，关闭遮挡后操作成功；初始化一次异步保存的结果没有在首次快照中出现，随后日志和读回确认完成，不能据此断定按钮失效。测试面板在窄窗口横向溢出已修复：按钮换行、结果摘要、处理中提示、完整回执折叠；第二次重开完成视觉与按钮复核。未发现本批资源结算错误，没有因此改动引擎规则。

证据目录：[本批文件](../../../output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028/)。包含 `browser-final.json`、`disk-verification.json`、`final-screenshot.jpg`、运行模块清单和保护基线。`verify_disk.py`只读测试聊天并核对上述哈希，不读取正式聊天正文。

这是实际浏览器→测试按钮→当前执行器→真实MVU→磁盘→刷新读回的限定验收。首轮未覆盖跨楼层／swipe；后续结果见下文。自然语言分类器／模型续写与单次场外施法的后续结果见下文；完整战斗回合的后续限定结果见文末；六书全量安装和真实请求加载、独立聊天分支、保存失败及多写入方并发仍待验，也不代表历史酒馆助手按钮问题已全面修复。

当前T7状态：跨楼层／swipe、限定自然语言闭环及文末完整战斗回合的资源施法均已作限定实测；优先待办为MVU历史保留窗口与旧swipe回滚，随后处理原生再生成的临时显示缺失。六书整体请求加载与世界书线协调，不影响继续T3/K3开发。当前卡与测试聊天保留供查看；仅本轮末尾测试楼按已备份的复测流程删除并重建，正式资料未改。

## 后续：空白备用页、跨楼层与删除恢复

实测发现并修复了适配层缺陷：`carryTestState`向空白swipe只写入规则命名空间，缺少MVU的`schema`。本地MVU构建`7574d47`的新楼查找与删除恢复把这种楼层视为缺失状态，导致C赠术修订6被跳过或回退为D赠术修订4。修复只从来源补齐目标缺失的`schema`和`initialized_lorebooks`；不覆盖已有元数据及其他状态。单元回归先复现失败再通过。测试按钮同时改用引擎报告发布已有的显式来源同步入口。

失败页及删除后的旧页保留在`swipe-failure.jsonl`、`after-delete-failure.jsonl`和截图中。修复后新建第三个空白swipe重新执行，不直接补写C状态，也没有把已经回退的旧失败页标为通过。

| 复测 | 实际结果 |
| --- | --- |
| 空白第三页领取C赠术 | 修订6，XP50，魔能爆版本D/C均保留；MVU元数据已继承 |
| 重复领取 | `already_applied`；修订、XP、授予记录不增加 |
| 原生左右切页 | 旧D页修订4；新C页修订6，各自独立 |
| 从选中C页新增楼层 | `beforeSyncRevision=6`，显式同步返回`already_synced`：MVU自身已正确继承 |
| 删除测试末楼并等待恢复 | 上一楼第三页仍修订6/C，不再被回放覆盖 |
| 重建末楼、刷新重开 | 楼2页0仍修订6、XP50、精神魔力0/12、C赠术；其他人物未变 |
| 独立磁盘验证 | 原始楼0、原始D页未改；C来源与新楼状态完全一致；160个受保护既有文件哈希未变 |

规则引擎四个测试目录共921项通过（不是全仓库测试总数），日志`swipe-regression-tests.log`。两个候选包重新执行取得证明（技艺41项、施法9项）并通过各自验证；六书候选运行闭包随修复同步，静态验证通过（455条目＋1主持锚点、282契约、111模块）。重建前规划差异仅为四份已由世界书线修改的参考文件保护哈希，生成器更新保护基线，未改这些参考文件正文；不表示本轮审阅或采用了新增世界书内容。证明更新只确认声明的执行范围，不提高完整认证等级，不代表正式安装。

最终证据：`swipe-fixed-before-reload.json`、`swipe-final-browser.json`、`swipe-final.jpg`、`before-delete-fixed.jsonl`、`swipe-disk-verification.json`；独立检查入口为`verify_swipes.py`。原`verify_disk.py`和首轮证据保留为单楼阶段记录，当前三楼状态使用新的检查入口。

## 后续：真实模型自然语言声明、施法与续写

本轮仍只操作同一隔离卡。新增场景及施法计划通过现有登记接口保存，明确黄泉为一米外可见的演练目标；没有把模型返回值或掷骰结果写入夹具。实际输入使用原生发送按钮，经过真实分类器、执行器、MVU、磁盘和真实模型续写。

| 案例 | 核验结果 |
| --- | --- |
| 明确“不施放”，仅说明已学会 | NO_CHECK，修订7及完整规则根与场景初态相同 |
| 完整长休8小时，现在不施法 | 真实recovery/rest/long，精神0/12→12/12，修订8，仅一次恢复；其他人物不变 |
| 首次D魔能爆 | **失败证据保留**：误走普通神秘检定，修订9但人物不变，续写却称命中；不能算施法成功 |
| 明确资源路由后的同句复测 | mechanism/eldritchBlast/cast/D，精神12→11，保存实际攻击骰和伤害；首次续写将L误称轻度，继续修复 |
| 伤型提示修复后重新测试 | 新掷骰 `[8,6,4,8,3,4,8,7,8]`；黄泉L4、完整8，叙述明确严重伤害；修订10、XP50、精神11/12 |
| 原生重新生成与刷新重开 | 同一结果、骰值、费用和叙述复用；无额外结算；旁观者姜子尤和布莱特未变 |
| 正式数据边界 | 160个既有卡片、聊天、世界书和正式运行模块文件SHA-256未变 |

修复范围：分类提示明确资源执行优先于普通技能任务，施法不能以普通神秘检定替代；续写事实明确B钝击／L严重／A恶性伤型。两个回归均先失败后通过。路由修复后规则引擎四目录922项通过；最后伤型提示修改后门控与控制器59项通过（后者是针对性复验，不是另一个全仓总数）。日志分别为`natural-regression-tests.log`、`natural-gate-tests.log`。

另一个阻断来自隔离卡没有主世界书：NO_CHECK已保存但续写待恢复。已创建并仅绑定本卡专用空白世界书，再用原生重新生成恢复叙述，未重复分类或变更规则状态。没有改全局世界书绑定或正式卡。最后两条测试消息曾在完整备份后通过原生单条删除重建，以真实新请求核验伤型修复；不是直接改写结算结果。旧路由失败楼8/9继续保留，查看聊天时须以本表区分。

取得证明重新执行：技艺41项、施法9项，两个包编译与验证通过。六书候选运行闭包更新并通过静态验证；当前共享候选为580条目＋1主持锚点、282契约、111模块，条目增量来自并行世界书线，本轮只更新运行闭包，不代表重新采用世界书内容或正式安装。

证据：`natural-first-blocked.jsonl`、`natural-no-cast.jsonl`、`natural-rest.jsonl`、`natural-cast.jsonl`（路由失败）、`natural-cast-fixed.jsonl`及`natural-regenerated.jsonl`（首次机制成功／伤型措辞错误）、`natural-final-before-regenerate.jsonl`（最终重测）、`natural-disk-verification.json`、`natural-final.jpg`。独立复验：`python -X utf8 work/rules_engine/browser_acceptance_20261028/verify_natural.py`。

范围仍为限定案例，不能推出分类器对全部自然语言都可靠，该自然语言阶段没有覆盖完整战斗回合；后续战斗结果见下。该自然语言批次当时未覆盖六书联合请求、独立聊天分支或并发；后续已验项目见文末，不以历史待办覆盖新结果。修复为提示边界改进，未加入以关键词猜测玩家意图的强制路由。


## 后续：完整战斗回合内资源施法（Terra UI／Astra验收修复）

沿用同一隔离聊天，从楼11修订10继续，新楼通过现有`registerEncounter`及`registerRuleScene`登记实际演练场景；`controller.submitCommand`进入combat执行器，未使用场外settle替代。没有重置人物、预写骰值或损伤。黄泉保留上批L4、完整8，玩家精神11/12、XP50，姜子尤和布莱特旁观。

| 检查 | 实际结果 |
| --- | --- |
| 进入及继承冷却 | 修订14进入第1轮玩家回合，原冷却2保留；两个正常回合后修订18、第3轮冷却归零 |
| D魔能爆 | 修订19，标准1→0，移动／迅捷仍1；精神11→10；实际骰`[6,8,7,1,2,8,10,4,4,7]`为3成功，新增3L，黄泉L7／完整5 |
| 原样重复请求 | UI回执`already_applied`；完整根、操作账本、骰和费用不变 |
| 同回合另一请求 | 被现有冷却拒绝，完整根不变；冷却先行检查，因此没有独立覆盖“动作不足”拒绝分支 |
| 已结算报告补发 | 新楼20仍修订19；复用同一完整根、骰与费用，无二次伤害 |
| 原生再生成及刷新 | 再生成只重开行动菜单，关闭后出现临时DOM报告缺失；磁盘报告仍在，刷新重开恢复报告；结算根始终不变。显示问题列为TODO |
| 下一回合 | 修订21、第4轮玩家标准／移动／迅捷恢复1/1/1，精神仍10，黄泉伤势不变 |
| 安全退出 | 通过既有合法移动到`[-25,0]`达成exitRadius，随后自动返回剧情；最终25条消息、楼24、修订23／23操作，story／finished，无待定反应，伤势与能量保留、XP50 |
| 正式边界 | 160个既有文件SHA未变；隔离部署112模块及脚本与package全部匹配；未改正式卡、聊天、世界书、正式运行目录或模型/API配置 |

发现并修复了报告显示缺陷：`renderResult`只读取顶层`damage`，忽略了资源机制的`mechanism.damage`，因此结算正确却误报“无新增伤害”。新增回归先失败，再以一行汇总修复通过；报告回归、combat核心及integrated共21项通过。旧楼19错误摘要保留，修复后补发报告明确黄泉承受3L；没有重投或重做本次施法。

首轮演练还保留了一次失败证据：仅靠场景文字要求黄泉结束回合，真实模型仍选择拔刀及攻击宣言；尚未造成伤害即停。备份`combat-entered.jsonl`后，经原生UI只删除本批12–15楼，确认旧12楼规则根与起点逐个相等，再重测。修正后的隔离适配仅向真实模型提供已承诺的`end`子集，并将返回索引严格映射回现有combat合法选项；因此本批不证明NPC自由战术或一般场景服从能力。另补齐原111闭包未含的既有host-ui模块，并修正隔离打包脚本在Windows换行转换前计算脚本SHA的问题。

**历史保留边界：** 最终增长到25楼时，既有MVU自动清理清空楼1–4（包括旧C页）的变量。只读提取的本地配置为启用清理、保留最近20楼、快照间隔50、恢复窗口10；[官方触发代码](https://raw.githubusercontent.com/MagicalAstrogy/MagVarUpdate/master/src/function/cleanup/index.ts)按每5条消息执行清理，[清理代码](https://raw.githubusercontent.com/MagicalAstrogy/MagVarUpdate/master/src/function/cleanup/cleanup_variables.ts)会移除非快照楼的状态与schema。配置与本次清空范围一致；未取得已加载bundle的逐字节版本证明。楼0及仍保留的5–11旧根与起点相等，当前及最近战斗状态通过；不能宣称全部历史楼未变或旧swipe仍可直接回滚。旧状态保留在本批备份，未自动回填，也未修改任何全局清理设置。配置证据只含清理字段：`combat-mvu-cleanup.json`。

生产修复影响证明所绑定的engine文件：技艺40项程序、41项取得及施法9项取得证明重新执行，两包compile/verify通过。六书只同步engine文件及manifest对应条目，静态验证通过（580条目＋1锚点、282契约、111运行模块）；没有重新导出世界书正文。隔离包固定沿用上一轮已部署的replay gate，不混入并行线的listener清理改动。

该战斗批次的独立复验入口（工作目录为工作树根）为`python -X utf8 "TRPG outputs/work/rules_engine/browser_acceptance_20261028/verify_combat.py" final`，针对当时楼24／修订23；后续继续测试后以文末interop入口为准。原始输出：[最终磁盘验收](combat-final-verification.log)、[21项回归](combat-render-tests.log)、[技艺包验证](combat-技艺-validation.log)、[施法包验证](combat-施法-validation.log)、[六书静态验证](combat-six-books-validation.log)。本地预演使用合成骰，单列为[preflight日志](combat-preflight.log)，不充当live证据。

最终证据在前述scene_test目录：`combat-disk-verification.json`、`combat-final.jsonl`、`combat-final.jpg`，以及`combat-before-cast`、`combat-cast`、`combat-report-fixed`、`combat-duplicate-rejected`、`combat-regenerated-settled`、`combat-reloaded`、`combat-round4`各阶段快照。

上批列出的三个后续项，已按下节的限定范围完成：

1. 显式保留的两页快照跨过20楼窗口、删除中性测试尾楼、原生切页及刷新均通过；未标记普通楼和旧1–4不在恢复结论内。
2. 原生再生成取消后报告保持可见，刷新后正文与完整规则根仍一致；只修本次combat事件边界。
3. 全力防御耗尽标准动作但不产生魔能爆冷却后，真实施法请求被`Standard action spent`拒绝，完整根不变。

以上为当时阶段终点；分支、保存失败与六书联合交集后续按文末记录更新，不扩大本批契约认证，也不表示正式安装。

## 后续互操作验收：显式快照、原生再生成与独立动作不足

仍由Terra High设计UI步骤、主代理CUA转接、Astra独立磁盘验收和修复，沿用同一卡及112模块隔离路径。没有改MVU全局配置、正式文件或模型设置，也没有向已清理的旧楼1–4回填状态。

**显式快照保留已通过。** 从原楼24修订23新建楼25，页0保留精神10／修订23；通过原生swipe建立页1，在该页真实执行一次480分钟长休，精神12／修订24。两页分别使用MVU已有的顶层`snapshot:true`，没有另建历史数据库。随后一个明确测试按钮逐楼创建并保存26–49共24个中性楼，每楼规则根不变、不会继承快照标记。50条消息时原生MVU实际清理26–29的普通变量，但楼25两页的完整根与长休后备份完全一致。保存完整`retention-window.jsonl`及逐页根SHA后，原生UI仅删除26–49；左切页0、右切页1、刷新重开均恢复相应根。阶段终点为26条消息、25楼页1、修订24、XP50、精神12。

本项修正一个隔离面板守卫错误：原生切到备用页后`extra`为该页独立的空对象，旧守卫误判不在测试楼，导致长休按钮拒绝。先以真实切页后的`extra={}`离线复现，再改为检查该保留测试楼首张swipe的固定标识；失败时未结算，修复后只有一次长休操作。**保留结论仅适用于明确标记的快照页；旧1–4仍为空，普通历史楼依然受既有20楼清理窗口约束。** 楼25作为后续当前分支继续行动时仍会正常写入新状态，本阶段备份保留当时的两个根，不将它们当作只读永久历史库。

本项证据：scene_test目录的`retention-pages.jsonl`、`retention-window.jsonl/.json`、`retention-rollback-page0.jsonl/.json`、`retention-final.jsonl/.json`及`retention-final.jpg`。磁盘命令为`python -X utf8 "TRPG outputs/work/rules_engine/browser_acceptance_20261028/verify_retention.py" final`，该命令的阶段终点输出已保存于[retention-final-verification.log](retention-final-verification.log)；后续继续战斗后不再以这个历史终点断言当前聊天。离线预演[retention-preflight.log](retention-preflight.log)只验证面板调用、真实恢复执行器与中性楼断言，不模拟MVU清理，跨窗口结果以live备份为准。

**独立动作不足已通过。** 从保留验收末页经原有`prepare()`恢复已登记遭遇配置，再进入同一授权演练。真实NPC结束回合后修订26，御临风第1轮预算1/1/1、精神12、冷却为空。原生combat菜单执行一次全力防御后修订27、标准0／移动1／迅捷1，精神与冷却不变；关闭后续行动菜单，再从测试面板发起新的D魔能爆combat请求，明确报`Standard action spent`。失败后的完整规则根、所有页变量、27项账本、29条消息及报告正文均与防御后相同，没有D-second操作记录。第一次面板点击被尚未关闭的模态菜单挡住，未作为拒绝证据；`interop-ap-rejected.jpg`记录随后真正执行的错误。磁盘输出见[interop-ap-verification.log](interop-ap-verification.log)，离线预演见[ap-preflight.log](ap-preflight.log)。预演最初漏掉按钮已有的`prepare()`而报未登记；补齐真实调用顺序即通过，没有为此修改live入口或放松遭遇规则。

**原生再生成取消后的报告缺失已修复并实测。** 只读宿主代码确认，原生`Generate('regenerate')`在`GENERATION_STARTED`之后、`GENERATE_AFTER_DATA`之前删除末条助手消息及其DOM，旧gate才进入combat菜单。修复在本次生成开始时暂存实际末条战斗消息的全部swipe及完整变量；仅在同一聊天确实少了这条尾消息时，通过已有消息API在原索引恢复原页、正文和变量，保存后才执行原combat流程。没有从更早的规则根推造结算，也没有修改ST core、MVU全局或正式运行文件。针对回归先复现“唯一最新修订19被删、控制器误读旧修订18”，修复后连同全部页变量恢复断言和既有gate测试共21项通过。

真实验证使用防御后楼28／修订27：原生regen打开行动菜单时报告已恢复；选择“稍后选择”取消后报告仍可见，随后刷新重开也保持。三个阶段的29条消息、修订27／27操作、完整规则根、全部页变量和原报告正文都与`interop-defended.jsonl`相等，未重投、扣费或制造伤害。证据为`interop-regen-open.jsonl/.json`、`interop-regen-cancel.jsonl/.json`、`interop-regen-reloaded.jsonl/.json`和`interop-regen-cancel.jpg`；原始磁盘输出见[取消后验收](interop-regen-verification.log)、[刷新后验收](interop-regen-reloaded-verification.log)。唯一最新根与多swipe恢复由离线回归直接覆盖，live本次不伪造单独状态差来冒充该分支。

本次生产源码只修改`gm_runtime/replay-gate-script.example.js`的生成事件边界，新增针对用例在同目录`replay-gate-script.test.mjs`；[最小隔离补丁](regen-gate.patch)记录精确变更。运行`node --test "TRPG outputs/work/rules_engine/gm_runtime/replay-gate-script.test.mjs"`得到[21项原始输出](regen-gate-tests.log)。资源程序／取得证明未绑定该gate，不重复重建两包。六书候选仅同步该入口补丁和manifest对应SHA；`python -X utf8 "TRPG outputs/work/replay_research/six_books_20261023/verify_candidate.py"`得到[静态通过输出](regen-six-books-validation.log)，保留并行线已有内容。隔离包继续保留先前固定版本，仅增加该最小补丁；[精确部署清单](regen-deployment.json)对应单个gate文件，未整体重建112模块。

**互操作阶段终点：** 刷新复验后，通过现有合法移动到`[-25,0]`结束演练并自动返回剧情。最终31条消息、楼30页0、修订29／29操作、story／finished，无待定反应；XP50、精神12/12、黄泉L7／完整5，所有人物伤势与本批进入前一致。160个既有文件SHA不变，隔离112模块与live脚本全部符合package，MVU清理配置不变。`interop-final.jpg`保留最终“返回剧情”与saved摘要，`interop-final.jsonl/.json`为对应磁盘证据。

该历史终点的只读复验命令（工作树根执行）：`python -X utf8 "TRPG outputs/work/rules_engine/browser_acceptance_20261028/verify_interop.py" final`，原始输出为[interop-final-verification.log](interop-final-verification.log)。新隔离夹具／检查入口为`live-script.js`的保留测试函数、`retention-preflight.mjs`、`verify_retention.py`、`ap-preflight.mjs`、`verify_interop.py`；`stage_regen.py`仅用于已完成的一次精准stage，不是全量构建命令。没有修改本批之外的世界书正文或正式运行内容。

这三个后续项在上述范围内收尾。分支、保存失败与六书联合交集的后续进展见下；普通未标记历史页与已清理旧页仍不保证恢复，NPC自由战术也未纳入本批。后续按现有T3/K3资源闭环与T7随批验收推进，不把本批局部通过提升为全部显示路径、全部历史恢复或全部契约认证。


## 后续：原生独立分支、真实保存失败与实际检查点入口

本批继续按Terra High设计UI、主代理CUA与精确部署转接、Astra代码修复与独立磁盘验收执行。父聊天保留在楼30／修订29／精神12／黄泉L7；通过原生“建立分支”创建`Branch #1`。未经接纳的继承根仍绑定父chatId，只读实际拒绝`Test state schema or chat identity mismatch`。新增适配层`adoptNativeChatBranch`核对原生`main_chat`、`integrity`与来源修订后，仅接纳子聊天当前末页；修订30的接纳记录保留旧账本、人物和全部复制历史，未批量改写继承楼。刷新或重复接纳复用已完成记录，既有跨聊天拒绝仍有效。

**保存失败使用真实文件写入边界。** 对新子聊天精确JSONL备份后，临时设置只读属性，使宿主`write-file-atomic`真正报错；没有停止服务或模拟成功写入后的错误。一次D魔能爆在内存结算至修订31，精神12→11、黄泉L7→9，实际骰`[10,4,3,4,4,5,9,2,1,6]`；显式与debounce保存均HTTP500，磁盘仍与接纳后修订30备份完全一致。立即在finally恢复原Archive(32)/非只读属性，再以同一`ui-branch-save-cast`操作重试，返回already_applied，原骰、费用和伤害不变，磁盘首次保存修订31。刷新子分支读回成功，切回父聊天确认父根仍完全相同。这里验证单个实际写入者的失败重试，不声称多端并发事务支持。

宿主`saveChat()`会吞掉HTTP错误并正常resolve，旧combat saved回执与gate续写因此可能误认为持久化完成。最小修复`persistTavernRuleState`仍经宿主原保存入口写入，再从只读`/api/chats/get`核对同聊天、楼、页、正文、本次规则根及snapshot标记。只有读回一致才回报saved或继续已结算结果的模型续写；失败明确提示规则仍在内存、保存未确认并保留同操作重试。未对无关世界书字段做全量hash，没有新增历史数据库。combat publish和replay gate均使用这个实际边界，不能以测试面板文字替代产品修复。

**现有正式入口现在提供规则检查点。** `mountOpeningSceneHost`的既有`/901-scene`弹窗新增“保留当前页规则检查点”，经session.retainSnapshot→adapter.retainRuleSnapshot使用MVU已有顶层snapshot:true，不新增规则修订或账本。使用节点为场景已确认后、关键分支前、战斗结算后；要保留的每个swipe分别操作，等待“检查点已保存”的真实读回回执。它只保留当前已存在页，普通未标记楼仍受清理窗口限制，已经清空的旧1–4不被恢复。

本次live从子末页snapshot=false执行上述实际弹窗按钮，再以同一精确文件只读造成真实HTTP500：UI明确“聊天持久保存未确认”，磁盘snapshot仍false，根和操作不变。恢复属性后同按钮重试成功，snapshot=true；刷新重开仍为修订31／精神11／黄泉L9，完整根SHA始终`7fa1292d9fb91aaefc81fb337b48fa5231a159ec72b5b2feb2f4ca2225b11fcd`。未点场景JSON保存，不改变遭遇规则。本项复用上一批跨20楼窗口的实测，未重复造楼或回填历史。

证据在scene_test目录的`branch-{rejected,adopted,failed-disk,retried,reloaded,parent-return}.jsonl/.json`、`branch-checkpoint-{before,failed,saved,reloaded}.jsonl/.json`及相应截图；原始日志：[分支重试](branch-retry-verification.log)、[分支最终](branch-final-verification.log)、[检查点最终](checkpoint-final-verification.log)、[67项针对回归](persistence-tests-final.log)。只读检查入口`verify_branch.py`的phase与childId参数按保存日志复用；历史阶段断言不用于已经继续推进的当前聊天。精确部署清单[persistence-deployment.json](persistence-deployment.json)与最小源码补丁[persistence-runtime.patch](persistence-runtime.patch)保留；临时atomic-writer预演残留已清理。

适配器变化影响资源执行证明，因此技艺40程序／41取得与施法9取得证明重新执行、两包compile/verify通过。原始输出为[persistence-技艺适配-20261025-validation.log](persistence-技艺适配-20261025-validation.log)与[persistence-施法体系适配-20261024-validation.log](persistence-施法体系适配-20261024-validation.log)。随后共享候选按plan→runtime→verify完成最新主持边界和运行闭包汇合，580六书条目＋1主持锚点／282契约／112模块静态通过，见[joint-six-books-validation.log](joint-six-books-validation.log)。这不等于正式安装或世界书语义全部通过；世界线W4/W5的有限预算知识／库存语义仍partial。


## 联合交集：六书加载→真实分类→恢复结算→保存→续写

只做一个实际交集案例，复用世界线已有10题有效加载证据，不重跑那10题。为本资源隔离卡追加绑定六本既有W4只读副本；另一个世界书测试卡和六书正文均未改。冻结书文件SHA、当前共享主持段SHA及场景输入于[joint-config.json](joint-config.json)，精确部署仅隔离live脚本、config和既有callback停止修正，清单[joint-deployment.json](joint-deployment.json)。没有启用Summary、没有加载第二记忆来源。`eventRemoveListener(event, originalCallback)`沿用世界线已验证的监听停止修复，现机助手扫描顺序修复沿用其既有状态，未重新修改插件。

子聊天从已确认检查点楼30／修订31／精神11／黄泉L9继续。玩家原生发送一次：“御临风的法师·奥术与魔能爆练习已经结束。我现在完整长休八小时，让精神魔力按现有规则恢复；期间不施法、不学习、不领取奖励。黄泉等人不接受治疗，伤势保持。”没有在harness预置分类结果或直接调用恢复结算。

实际Gemini分类请求1次、续写请求1次；分类输入含同一明确演练场，续写路径为RECOVERY_REQUIRED，唯一新增账本是player/rest/long/480。修订31→32，精神11→12，长休次数2→3、恢复时钟增加480分钟、魔能爆冷却2清空；除此之外玩家对象完全相同，流风原本22/22，恢复量为0。黄泉仍L9／完整3，姜子尤、布莱特、XP50均未变。父聊天与分支创建前状态完全相同；子历史楼与原检查点根均未改。

实际续写prompt含冻结的W4主持边界及当前实际现场；六本在允许集合，按本句与最近历史实际入选11条，三条核心常驻及资源·魔能爆等正文各出现一次、禁用条目为0。第5历史书本例未触发相关正文，不把“绑定六书”写成所有书或580条目全部注入。请求明细与每条UID见`joint-final.json`。捕获了3个CHAT_COMPLETION_SETTINGS_READY事件：1个分类、1个实际续写、1个被gate停止的原生外层准备；**3个settings事件不是3次模型调用**。独立检查按prompt形状与gate诊断分别核对前两者，未以面板叙述作为通过证据。

模型回复为：“八小时的长休按规则结束。御临风完成休整，精神魔力与流风已恢复；黄泉等人保持既有伤势，未接受治疗。独立演练场内未发生其他行动。”这段限定语义与本次执行一致，没有额外行动或NPC治疗；流风已满而恢复0，不把措辞当作额外数值收益。宿主末尾`StatusPlaceHolderImpl`由现有显示处理附加，程序诊断的模型文本无变量补丁。本例不重新验证世界线预算裁剪或记忆切页；其猫音知识／库存语义失败仍保持partial，不能据本例升为全世界书语义通过。既有NO_CHECK“不施法”证据复用，未为凑数新增负例。

**当前终点：** 子Branch #1共33条消息、末32页0、修订32／32操作、story／finished，精神12、XP50、黄泉L9／完整3；父聊天仍31条／末30／修订29、精神12、黄泉L7／完整5。最后一轮没有再生成。六本只读副本SHA、160个既有保护文件SHA和112个隔离模块及脚本/config均匹配。`joint-final.jpg`保留真实回复与captured摘要，`joint-final.jsonl`同时保留完整请求、gate与磁盘根。

当前只读命令（工作树根）：`python -X utf8 "TRPG outputs/work/rules_engine/browser_acceptance_20261028/verify_joint.py" final`。原始输出：[准备](joint-prepared-verification.log)、[最终联合核验](joint-final-verification.log)。适配器共享行为修改后，四个既有规则测试目录完整运行；首轮暴露两个旧headless文件共18例未提供新增持久化读回契约，补齐测试夹具（不放宽生产检查）后最终**931/931通过**，原始输出[persistence-full-regression-final.log](persistence-full-regression-final.log)，首轮失败[persistence-full-regression.log](persistence-full-regression.log)保留。命令为对`work/rules_engine`、`combat`、`gm_runtime`、`mvu_poc`四目录各自的`*.test.mjs`运行`node --test`；不是全仓库测试总数。新增夹具适配差异见[persistence-test-fixture.patch](persistence-test-fixture.patch)。

本次1→2→3在上述范围收尾。下一资源工作按T3/K3既有顺序核对法师火焰／冰霜D/C与奥术差异并选择一组闭环；T7随该批验收。世界线知识／库存语义partial、其他NPC自由战术、普通未标记历史与已清空页恢复仍为明确边界；没有实际多写入方入口，因此没有制造多端并发测试。未提交、推送、发布或修改正式卡／存档／世界书及全局模型、MVU配置。
# 资源线交付索引（2026-10-28）

本批资源源码及本记录已纳入本地固化交付，见[配对版本与冻结证据包](../../../output/replay_tavern/resource_delivery_20261028/README.md)。下文“未提交”均保留为各验收阶段当时的状态；当前没有远端推送或正式安装。完整原始证据由交付ZIP保存，原scene_test目录继续保留在本工作区。交付前复验：931项规则回归、26项资源编译器测试、270正式／12候选契约加载、两包执行证明及当前联合存档只读核对通过。

