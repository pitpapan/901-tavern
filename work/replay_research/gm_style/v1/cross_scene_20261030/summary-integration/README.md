# 人工采纳 Summary 接线（2026-10-30）

用户选择先使用人工确认的原生 Summary，替代此前暂缓接线的决定。本批只连接既有 `branch-memory.mjs` 读取器；不生成或写入摘要，不打开自动摘要，不迁移 TavernDB 数据，不改变模型、历史或正式剧情。

正式入口仅新增读取器导入与历史后的记忆插入位置。源码统一通过 `patchSummaryMemory` 投影，生成器与验证器移除重复手工插入；构建清单包含既有读取模块。两个现有六书入口已含接线，幂等检查通过，本批未重建输出或部署运行模块。

## 验收

- 定向测试 9/9 通过，见 `source-green.log`；失败到修复的原始日志保留。
- 正式入口 SHA-256：`b1b64b4242a0839a62b30a4ea87a5118923ab6e9a029bc7200e80e17a54b41ab`，整卡符合预期，仅两段插入，其余入口字节保留。
- 274 份保护文件仅预期卡 PNG 变化；完整 settings、原聊天、存档、世界书和运行模块不变。原隔离验收聊天 31 条消息，完整哈希 `c4be8e3f33a80dde5aa4d1830a85124e63a56ef1cc9fb7df95e95320863c06cc`，有效 `extra.memory` 仍为 0。
- TavernDB 仍为初始化 checkpoint、0 日志、9 张仅表头的空表；没有发现需要迁移的独立剧情记忆。
- 故障恢复模块 SHA-256 保持 `f8a5a13bf2085e98a6befbc6a1505c66d7afd24b99f0b006458e41fa6a6e1d1d`；既有记忆模块保持 `32b254e9493d48683f13265af4ffcd50b0f4be24e84fbffe10a59dfebd7f203d`。
- 复用 `../candidate/request-check.json` 的三次真实续写证据：每次 Summary 一份、既有风格一份、历史输入保留。本批没有新增 UI 操作或模型请求；不据此宣称截断历史后的长期记忆能力已验证。

独立验收见 `final-verification.json`，部署及保护证据见 `installation.json`、`protection-after.json`。完整卡备份仅本地保留并由 `.gitignore` 排除。

在战役库根目录只读复核酒馆状态（仅更新本目录验证记录）：

```sh
node work/replay_research/gm_style/v1/cross_scene_20261030/summary-integration/manage.mjs verify
```

定向源码验证：

```sh
node --test work/replay_research/six_books_20261023/branch-memory.test.mjs work/rules_engine/gm_runtime/narrative-style.test.mjs
```

冰霜候选、世界书作者内容及计划进度不在本批提交范围内。
