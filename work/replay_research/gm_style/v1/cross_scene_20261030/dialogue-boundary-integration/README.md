# 对白与私人内心边界定点安装（2026-10-30）

按世界书线交接的用户决定，同步作者 `authoring.json` 中 `901-gm-style-v1` 的两处修改：玩家的 `[……]` 与 `【……】` 均为未说出口的私人内心；NPC 不输出括号内心独白，也不通过全知旁白泄露未公开的真实想法、动机或判断。实际说出口的话仍用“……”。其余文风逐字保留，正文从2757字变为2812字。

## 实际消费与安装范围

现有正式卡通过 `/901-opening-combat/narrative-style.json` 读取文风，普通续写及战斗叙事共用同一正文。本次仅替换这份外置资产；卡 PNG 与入口均未写入，入口 SHA-256 保持 `b1b64b4242a0839a62b30a4ea87a5118923ab6e9a029bc7200e80e17a54b41ab`。Summary、动作边界及入口混合换行保持。

开发侧只更新文风资产、清单中该资产的来源／产物哈希，以及相关定向测试。生成链已有按稳定 identifier 读取全文的逻辑，无需修改运行代码或全量生成。候选1413份文件中仅资产与清单变化，其余1411份字节保持；冰霜等未提交改动未随本批安装或提交。

## 验收证据

- `source-green.log`：10项通过；`source-red.log`保留资产尚未更新时的失败。
- `development-verification.json`：新全文精确等于旧全文做两次采用替换，开发资产与主会话独立预期字节一致，清单只修改对应两个哈希。
- `prepared.json`、`protected-before.json`：安装前备份及274文件保护基线；完整卡备份与开发文件备份只留本地，Git忽略。
- `installation.json`、`protection-after.json`：仅正式文风JSON变化，磁盘与HTTP读回一致；正式卡、原聊天、存档、世界书、其他运行模块及完整settings保持。
- 原31楼聊天完整SHA保持 `c4be8e3f33a80dde5aa4d1830a85124e63a56ef1cc9fb7df95e95320863c06cc`。
- 新文风正文SHA：`0e36e8fc6987a82e50d0cf651bdf7c54b2c4406e6b5a9a7a6176a8c85823e7a9`；JSON文件SHA：`1c0d8e03aa91e14a5bd94650199d1493ce344ce6b54e59f7935671cf73b3ffcb`。

本批没有UI操作、模型调用或聊天写入。以上证明提示词交付与静态安装正确，不代表新的模型语义实测。作者源、世界书进度及主会话独立审计记录由原对话另行提交。

在战役库根目录只读复核酒馆（仅更新本目录证据）：

```sh
node work/replay_research/gm_style/v1/cross_scene_20261030/dialogue-boundary-integration/manage.mjs verify
```

定向测试：

```sh
node --test work/replay_research/six_books_20261023/branch-memory.test.mjs work/rules_engine/gm_runtime/narrative-style.test.mjs
```
