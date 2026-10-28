# 六书迁移工作记录

当前世界书汇合（2026-10-28）：作者交接先提交为`38aa395`，按用户“先提交修改，然后汇合生成”整合24份源文件的已采用内容。六书580条＋1主持锚点；保留原455个UID及282份资源投影，新增125条（含50个人物主体）；3常驻／501关键词／76禁用。01内嵌64条与独立书一致。来源、行段、采用范围与默认私密条件保存在delta及创作规划；正式卡未部署；后续[实际加载验收](loading_acceptance_20261028/README.md)10组加载检查通过，洛汀库存／样品与产地错配已在原题复测通过；低预算、自动保持及长期分支仍待验。详见[候选核验](../../../output/replay_tavern/six_books_20261023_candidate/verification.json)和[W进度](../../../docs/unified-development-plan.md)。

本批复现（现有候选目录）：

```powershell
$env:PYTHONUTF8='1'
python work/replay_research/six_books_20261023/sync_author_handoff.py
python work/replay_research/six_books_20261023/build_candidate.py --plan
python work/replay_research/six_books_20261023/build_candidate.py --runtime
python work/replay_research/six_books_20261023/verify_candidate.py
python work/replay_research/six_books_20261023/test_world_author_projection.py
python work/replay_research/six_books_20261023/test_contract_projection.py
python work/replay_research/six_books_20261023/test_execution_coverage.py
```

`sync_author_handoff.py`只读取明确列出的已采用交接段，保留原13项作者键，重复同步结果一致。世界内容回归另用汇合前基线检查原282份资源及真实状态／源卡／发布指针未变。未来资源线有意更新资源时，应保留这个历史检查点并以新批证据解释变化。`PYTHONUTF8`使Python子进程也以UTF-8解码Node输出；单在顶层使用`-X utf8`不传递到子进程。

## 此前资源取得批次（2026-10-28，历史统计）

当前批次（2026-10-28）：法师奥术D/C取得、精神池、逐阶赠术、实际施法与MVU保存已接入，独立9项取得测试及完整JS956/956通过。编译器27项、证明边界4项；覆盖审计3项、投影2项和六书静态验证通过。候选12定义／10操作，六书455条目＋1锚点／282契约、3常驻／418关键词／34禁用；仍未安装。火焰／冰霜、高阶和研读继续列入未完成项。

## 上一批T1/T2开发记录（2026-10-28）

当前开发候选454条目＋1主持锚点，281资源契约（270正式＋11候选），3常驻／418关键词／33禁用。完整JS947/947、两包证明、覆盖审计及六书静态核验通过；完整认证仍0，未安装。执行顺序和包含两个候选包的重建命令以[战役库唯一计划](../../../docs/unified-development-plan.md)为准。下方按日期保留历史进度，不能作为当前计数或安装证明。

## 2026-10-24 开发记录（历史，未安装）

当前开发候选442条，原173条加资源库269项；不代表已安装。合同ID、版本、来源哈希、动作与真实覆盖状态已同步到规划、世界书及分类器。三张后期模板保持独立禁用。运行 `kit_catalog.py` 盘点后依次运行 `build_candidate.py --plan`、`--runtime`、`verify_candidate.py`；不要重新 `--export` 覆盖既有包。`--runtime` 现在同步正文、六书、合同元数据及完整浏览器模块闭包。

本地462项JS回归通过，fullyVerified仍为0；开发、验证和实际安装版本的区别及未完成工作见[当前检查点](checkpoint-20261024.md)。下文保留此前迁移与安装的历史记录，不能用历史实测证明新开发候选已经部署。

## 此前工作记录

用户已授权“基于 tavern-cards 编排六本书的条目、触发和状态分工，再据此迁移内容”。先写[创作规划](创作规划.yaml)，检查拆分正文和触发配置，再使用既有原生JSON投影方式生成[候选包](../../../output/replay_tavern/six_books_20261023_candidate/README.md)。未运行forge往返转换。随后按用户要求用Sol High进行最小测试，剧情主持保持Gemini；真实测试另建隔离卡、六书副本及合成存档，正式剧情未切换。

范围：008运行书136条、人口／神明供奉及葬制／弃风／学士图书馆福利／久远哈克寄居条件的明确修订，以及10月23日已采用的三条提前干预分支。136条来源按606个段落或行映射到164条世界书条目与一个主持锚点。对同段细分的文字与数值另作保留检查；来源覆盖不冒充语义完全等价证明，人工重写均记录理由。

采用skill中的规划先行、单一主题、专名触发、独立可读、事实与状态分工；遵守仓库原有六种类型、UID、来源扩展和运行导出边界。完整人物档、未映射作者条目及未采用资料不做全量搬运。原场景的已采用条件式分支不变成已发生事实。

复现入口（仓库根目录）：

```powershell
python -X utf8 work/replay_research/six_books_20261023/build_candidate.py --plan
python -X utf8 work/replay_research/six_books_20261023/build_candidate.py --export
python -X utf8 work/replay_research/six_books_20261023/verify_candidate.py
```

`--export`要求候选目录尚不存在，并要求规划与当前来源精确一致，避免无意覆盖现有候选。未来调整应先修改规划生成逻辑、检查规划与正文，再明确处理要更新的候选文件。交付包中的说明文档为人工编写，不由导出脚本生成。

静态核验包含格式、唯一UID、完整来源去向、继承字段、原禁用项、敌人短卡数值与正文、内嵌基础书对照、入口脚本受控增加六书名单及两模块补丁哈希、五组字面触发。最小真实实测与限制见候选包 `minimal_test/`；一次重试后通过不等于首轮稳定或全玩法验证。常驻世界书正文字符由6964降至528，但主持方法移入描述，不能据此宣称总提示词减少相同幅度。

运行时独立更新入口为 `build_candidate.py --runtime`，它只更新现有候选的入口六书名单、补丁和清单，不重新导出正文。本轮修复旧过滤器只保留主书及分类器只读取主书的问题。物理、资源和MVU结算规则未修改。


## 2026-10-28加载续验交接

[W4/W5实际验收](loading_acceptance_20261028/README.md#w4w5续验有限预算与所选人工记忆2026-10-28)现区分请求通过与语义失败：有限预算下人工保留五条的实际加载通过；当前叙事模型仍无据补写猫音活动及无货，单次复测失败原文保留，不自动采纳。

候选主持入口新增只读`branch-memory.mjs`，从当前保留消息的原生`extra.memory`读取人工摘要，放在聊天之后、程序现场之前。**合入前提是当前聊天明确使用原生Summary作为唯一人工记忆来源。若已用其他工具，保留原工具，不合入该import及retainedBranchMemory注入段，不切换来源，也不并用两套记忆。** 本批只在原生Summary冻结的隔离聊天中验证超六楼、原生swipe切页及刷新；没有更改正式聊天的记忆来源。3项只读回归和当前候选`modelOptions`的有／无现场、记忆组合检查通过，见`loading_acceptance_20261028/branch-memory-projection.log`。

最新知情作者段已在隔离夹具测试，共享规划／候选尚待资源线更新适配器执行证明后汇合：`build_candidate.py --plan` → `--runtime` → `verify_candidate.py`。当前失败日志为`loading_acceptance_20261028/final-build.log`，不绕过合同检查，不用旧静态通过冒称最新整包通过。完整模块闭包以生成后的manifest为准；本批已生成版本为112模块。具体来源、采用范围、目标条目与机械对接见验收记录。未提交或推送本轮修改，保留其他线工作。


2026-10-28再次汇合：资源证明阻断已解除，本轮重新plan、runtime及verify通过，六本原生JSON、源卡、D3和发布指针前后SHA相同；见[汇合报告](../../../output/replay_tavern/six_books_20261023_candidate/scene_test/world-loading-20261028/manual-merge-verification.json)。前节“待证明”是历史阻断。本次补齐人工采纳步骤，并实际验证原生编辑保留回复与Summary、刷新、下一请求；原预算题语义失败保留。当前请求模型为gemini-3.8-flash，与此前3.5-flash-lite不同；本轮未操作模型设置，不作同模型改善结论。原生Summary读取段仍仅对明确选用它为唯一人工来源的聊天适用，详见交付手动说明。
