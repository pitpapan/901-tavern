# 正式数据库模式恢复（2026-10-30）

用户后续明确选择正式保留数据库记忆，Summary 修复只作可选能力；新采用的剧情摘要只允许写隔离新副本并由另一对话验收。此决定取代此前正式接入 Summary 的选择。

## 正式定点恢复

从当前正式卡入口精确删除 Summary 导入与历史后的注入两段，不修改任何其他入口字节。入口从 `b1b64b4242a0839a62b30a4ea87a5118923ab6e9a029bc7200e80e17a54b41ab` 恢复为 `b7148f4d6d84a3f8212f16b299f0ba5c59168c36bf9a42c2c28fbd56557f253a`；逆补丁与重新应用原 Summary 补丁互为精确逆操作。

正式写入于 `installation.json` 所记时间结束；此后本批不再写正式酒馆，其他对话可据此建立隔离验收基线。274份保护文件中仅正式卡PNG变化，解析后的整卡符合只删除两段的预期。2812字文风资产SHA保持 `1c0d8e03aa91e14a5bd94650199d1493ce344ce6b54e59f7935671cf73b3ffcb`；动作边界、其他入口换行、全部聊天／存档／世界书／运行模块和完整settings均保持。没有删除或重建数据库，也没有向原聊天写摘要。

这是恢复既有正式路径，不新增数据库读取器，不宣称数据库已有剧情内容或获得新的模型行为验证。Summary读取模块保留，隔离副本可显式启用。新摘要的实际加载与叙事验收由原世界书对话负责，本批没有模型或UI调用。

## 构建默认与可选能力

共享 `narrative-script.js` 默认不含 Summary 接线。累计投影 `patchNarrativeEntry(source,{summary=false}={})` 默认移除该接线，显式 `summary:true` 才启用既有读取器；不新增数据库读取逻辑或模式管理系统。`build-integrated.mjs` 沿现有模板路径使用新默认，保留可选读取模块。

六书开发候选仍是可选 Summary 示例，`build_candidate.py` 明确传 `summary:true`，验证器复用同一投影入口；不能将该开发候选当作正式数据库模式全包安装。本批未重建或修改候选卡、六书、规划、清单和运行投影。

Astra定向验证11/11通过，见 `source-green.log`；首次缺口见 `source-red.log`。覆盖正式入口精确逆补丁、默认无Summary、显式启用及幂等、完整文风、全部保留历史和动作边界。仅修改模板、投影helper、对应测试及开发候选的显式参数四份源码。

保护与实际安装证据见 `prepared.json`、`protected-before.json`、`installation.json`、`protection-after.json`。完整卡备份仅本地保存，Git忽略；前后入口保留原始字节。冰霜及其他未提交内容不在本批安装或提交范围。

在尚未新增其他隔离文件的相同基线下，可从战役库根只读复核（只更新本目录证据）：

```sh
node work/replay_research/gm_style/v1/cross_scene_20261030/database-mode-restore/manage.mjs verify
```
