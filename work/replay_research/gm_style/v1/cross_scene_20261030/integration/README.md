# 动作句与作者来源定点汇合（2026-10-30）

本批完成不依赖记忆选择的动作边界句修复、WM08／WM09来源核对和定点同步。正式Summary接线仍等待用户选择，未安装，也未切换原数据库记忆或启用自动摘要。

## 实际变更

- `narrative-script.js`只把“不补御临风新台词、心理、选择或承诺。”替换为“不补御临风未声明的动作、台词、心理、选择或承诺。”；既有投影增加同一句的幂等升级，保留历史文风与all历史修复。
- 两份开发入口JSON各只改同一句，原有可选Summary接线保持原样。1413份候选文件中，该步骤其余1411份字节不变。
- WM08／WM09新正文均为原来源后的追加内容，原来源字节完整保留。19条力量互动及7条离场消息目标的完整条目仍与正式书一致；两份`创作规划.yaml`各只更新这两个来源SHA，没有新增主题、条目、UID、正文或触发词。冰霜引起的既有未提交差异保留。

正式安装直接读取当前卡，只替换入口这一句；没有把开发候选整卡或可选Summary接线装入。原入口SHA为`784bcef4accc84d9e880bdcfe11a0d3d94884f78c415337c7dfdfbf867d5493d`，新入口为`b7148f4d6d84a3f8212f16b299f0ba5c59168c36bf9a42c2c28fbd56557f253a`。完整卡和原入口已备份，完整卡备份仅本地保留。安装前的独立预期文件曾额外转换换行，准备断言因此阻止了写入；主会话已纠正其验收夹具，本批正式入口原60个CRLF及7个LF均保留。

## 记忆边界与验证

既有正式安装记录明确要求“原数据库记忆不切换，不启用候选可选Summary读取段”。正式31楼聊天没有非空`extra.memory`，TavernDB元数据仍在；Summary配置为`source=extras`、`memoryFrozen=true`。这些事实不能替代记忆来源选择，因此本批没有启用正式Summary读取。跨场景隔离候选的Summary实测不宣称为正式部署结果。

8项定向测试通过：既有branch-memory 3项及当前入口／投影5项。复用已提交跨场景实测，不新增模型请求、浏览器操作或剧情。274份保护文件中仅正式卡PNG预期变化，解析后整卡只允许上述句子对应的脚本文本变化；其余273份、完整settings、模型和memory均不变。行动失败恢复模块仍为`f8a5a13bf2085e98a6befbc6a1505c66d7afd24b99f0b006458e41fa6a6e1d1d`。原31楼聊天SHA仍为`c4be8e3f33a80dde5aa4d1830a85124e63a56ef1cc9fb7df95e95320863c06cc`。

没有运行整包生成、改写世界书、部署运行模块、清理测试卡或聊天，也未改作者正文、WM进度、统一计划和主会话独立验收文件。本批只对实际同步范围作验证，不宣称全量世界资料重新生成或所有未提交候选已经交付。

证据：[安装](installation.json)、[保护](protection-after.json)、[来源与条目](author-source-verification.json)、[候选差分](candidate-projection.json)、[记忆边界](memory-boundary-check.json)、[8项测试](action-green.log)、[预期文件换行核对](preparation-line-ending-check.json)。

在战役库根可重跑本批只读验收（仅更新本目录证据，不写酒馆）：

```powershell
node work/replay_research/gm_style/v1/cross_scene_20261030/integration/manage-action.mjs verify
node --test work/replay_research/six_books_20261023/branch-memory.test.mjs work/rules_engine/gm_runtime/narrative-style.test.mjs
```

不要重跑一次性prepare或install；后续Summary是否接入由用户的明确选择决定。
