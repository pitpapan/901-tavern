# GM 原文与文风研究入口

本轮已完整提取现有五份记录中 GM“剑”的 1,508 条帖子，共 490,542 字符；风格归纳来自覆盖全部 71 页的 376 条分层精读。**全量提取和样本精读分开记录，不声称逐句分析了所有帖子。** 图片与遗失边关原帖不在范围内。

先读[风格结论与采用方式](style_profile.md)。要审阅实际文风及开场，打开[运行包说明](../../../../output/replay_tavern/gm_style_v1/README.md)。继续工作时从这两处进入，只有需要验证具体说法时再取相关原帖，不必加载完整语料。

## 完整语料

可复现的主语料入口是 [GM 全文 JSONL](../../../gm_style/v1/corpus/all_gm.jsonl)、[定位索引](../../../gm_style/v1/corpus/index.tsv)和[统计清单](../../../gm_style/v1/corpus/manifest.json)。按来源阅读的文件为 [P1](../../../gm_style/v1/corpus/P1.md)、[P2](../../../gm_style/v1/corpus/P2.md)、[P3](../../../gm_style/v1/corpus/P3.md)、[沐透](../../../gm_style/v1/corpus/MUTOU.md)、[大墓地](../../../gm_style/v1/corpus/GREAT_TOMB.md)。

本目录的 gm_posts.jsonl、by_source 和 manifest.json 是本轮另一份同源研究快照，正文与原帖定位已经对照一致。两份不能相加计数，也不用重复阅读；后续默认使用上述可复现主入口。提取脚本为 [extract_gm_style_corpus.py](../../../../scripts/extract_gm_style_corpus.py)，只生成派生语料，不修改原帖。

GM 作者帖不等于纯旁白。源文里的 NPC 台词、玩家动作重述、规则、场外交流、梦境和后期信息均保留；自动标签只是检索线索。**本研究目录与完整语料都是作者层资料，不导入酒馆或龙血玄黄。**

## 精读与表达稿

| 内容 | 文件 |
|---|---|
| 第一部分析及 160 帖阅读说明 | [P1 报告](../../../gm_style/v1/analysis_p1.md) |
| 第二部分析及 119 帖阅读说明 | [P2 报告](../../../gm_style/v1/analysis_p2.md) |
| 第三部与两旁线分析及 97 帖说明 | [后期与旁线报告](analysis/later_sides.md) |
| 合并逐帖精读范围 | [reading_receipt.json](reading_receipt.json) |
| 本地提示词格式及后台请求边界 | [兼容性研究](analysis/preset_compatibility.md) |
| 两条模块、开场及出处和编辑说明 | [authoring.json](authoring.json) |
| 本轮有限检查结果 | [verification.json](verification.json) |

运行包只携带 1,187 字符的文风提示及可选 446 字符示例，另有修订开场供手动替换。原始文风提炼不含人物全面复审。2026年10月4日收到首轮实际试跑后，另行定点修订了两名同伴声线、Persona狂岚称呼、黄泉状态时序、骑术摘要与帝国环境表现，并同步相关导出；未操作酒馆或调用模型复跑。见[试跑诊断](../../playtest_20261004/diagnosis.md)。原线后期结果不作为未来台本。
