# 901帝都重玩：当前版本入口

更新：2026-10-07。当前完整运行候选为 **M1_IMPORT_20261005_002**。日期目录保留原名，不再通过目录日期判断哪份最新。

## 现在更新酒馆只看这里

[完整手动应用说明](hallucination_prevention_20261005_candidate/README.md)。由用户操作，现有聊天继续，角色替换不会自动改写已有聊天。

| 用途 | 当前文件 |
|---|---|
| 主持角色卡，含开场、场景说明和内嵌世界书 | [901_帝都主持.card.json](hallucination_prevention_20261005_candidate/import/901_帝都主持.card.json) |
| 独立世界书，125条 | [901_帝都重玩_M1_20261005.json](hallucination_prevention_20261005_candidate/import/901_帝都重玩_M1_20261005.json) |
| 文风提示模块 | [文风_prompt.json](hallucination_prevention_20261005_candidate/import/文风_prompt.json) |

内嵌与独立世界书内容相同，只选一种导入并保持一份关联。文风模块ID为901-gm-style-v1；它不是模型参数预设。

已累计合入雪老与馆主身份区分、黄泉旧识与少言表现、雪老温和声线、贞子幽魂身份、布莱特前史、私人思考边界、有限代办、自然交接，以及帝都皇宫和法师塔的视觉更正。来源截至UCL_20261005_011。通用包不绑定当前场景，原团未来不固定为重玩日程。

## 其他路径怎样看

| 路径 | 现在的用途 |
|---|---|
| playtest_fix_20261005/import/文风_prompt.json | 用户原指定路径，仍是当前文风的同步副本；任选一份导入 |
| M1/import/901_GM文风_20261005_r2.prompts.json | 同一M1目录内的兼容文件名，与当前文风逐字节一致；不重复启用 |
| playtest_fix_20261005、playtest_fix_20261005_r2 | 历史补丁和证据；修订已累计进入M1，不再逐批叠加 |
| enh_20261004_r2_candidate、enh_20261004_candidate | 历史世界书与提示基线，用于比较和回查 |
| v1、gm_style_v1、playtest_fix_20261004 | 初始交付和历史操作记录；旧主持/世界书/文风不作为当前更新文件 |
| v1/import/901_御临风.persona.json | 原Persona保留，本轮没有修改；已有Persona无需重新导入 |
| model_preset_v1、r2目录中的v1.3完整预设 | 独立的参数候选历史；不会因本次文风更新而要求重新导入完整预设 |

上表中的M1指hallucination_prevention_20261005_candidate。所有历史文件保留，不删除聊天或备份。

## 状态与后续

当前候选已通过定点文件核验，已纳入用户授权的Git检查点bbfcf5f。实际酒馆应用、请求加载和当前记忆开关没有新的验证记录；不能把文件已提交视为运行已验收。

难度机制留待后续游戏引擎；不恢复文风复跑、代操作酒馆、数据库适配或地图更新。世界与人物补充先进入有来源的作者档案，只有受影响且确认可用的内容才更新运行候选。

机器可读入口见[latest_release.json](latest_release.json)；内容指纹沿用[整合清单](../../work/replay_research/hallucination_prevention_20261005/import_build_manifest.json)，不建立另一套内容副本。作者接续见[研究入口](../../work/replay_research/README.md)。


2026-10-07提交后新增[作者补充](../../work/replay_research/world_character_followup_20261007.md)，尚未同步到上述002文件；待修正的医馆案情归属等已列入运行队列。
