# 资料阅读短入口

> 当前继续工作先读 [E阶段审阅结论](<C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/e_review_results.md>)，再按 [审阅定位表](<C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/reading/e_review_locator.tsv>) 查具体原帖；不重复展开全团。固定未来节点已由用户明确延期。

目标是完整整理世界观、历史背景、势力、力量与人物，最后投影为御临风首次入帝都时的酒馆运行包。按成果推进，没有固定一周工期。资料导航优先于内容提炼。

本入口和相邻索引是机械阅读辅助，不是新正典、不证明全团已经读过，不恢复原工程停止的全量审计流程。原文、人工候选和正式数据均未修改。

**2026-10-03 新增旁线**

[沐透线独立资料包](<../../extracted-mutou/README.md>)：10页/473帖；[大墓地独立资料包](<../../extracted-great-tomb/README.md>)：3页/112帖。均有完整顺读版、按页正文、预览和msg定位。已接入共用来源目录，新增585帖完整提取正文也已分工读完，阅读回执单列；按用户要求，图像仅保留引用，不安排解读或列为待办。[跨线研究入口](../../work/replay_research/side_campaign_intake.md)归并本次贡献与待整合范围。

**当前内容工作入口**

[世界与人物研究包](<C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/README.md>) 汇总本轮实际内容、共享阅读进度、重要缺口和下一读取范围。接续工作先读这个短入口，再按主题打开候选；不必重载完整规划和机器总表。

**每次工作的最短路径**

1. 先读本页和当前任务的少量进度说明。完整总规划仅在需要调整范围时阅读。
2. 世界或人物主题先在 REFERENCE_SECTIONS.md 搜标题，读取对应来源行段。
3. 世界模型新增主张先查 world_side_evidence_locator.tsv；新旁线阅读研究先查 side_topic_locator.tsv 的主题和研究章节行号；主线已读团录先查 evidence_locator.tsv 的标题、主题和msg，只取命中的证据行；未读部分再用 CAMPAIGN_PAGES.md 和 post_locator.tsv 定位原帖。
4. 只打印所需原帖的 id、floor、author、time、source_html、body、images。不要同时打印 body、body_compact、preview 三份重复正文。
5. 需要因果、指代或人物语气时补读相邻帖子；索引命中不等于事实已被确认。
6. 工作结束保存简短的已读范围、候选位置、未决问题和下一读取范围，不重复输出大段原文。

**文件用途**

| 文件 | 读取方式 |
|---|---|
| docs/reading/CAMPAIGN_PAGES.md | 71 页正文的顺序目录（主线58页，新增旁线13页），按部与数值页码排序 |
| docs/reading/REFERENCE_SECTIONS.md | 世界设定、人物原卡、叙事导航、口述前史、续跑状态与用户考据笔记的章节定位 |
| docs/reading/EVIDENCE_PACKAGES.md | 已交付精读包、覆盖范围与主题包数量的短目录 |
| work/reading/world_side_evidence_locator.tsv | 旁线接入世界模型后的主题更新ID、WRC、JSONL行和msg；按需读取 world_side_evidence.jsonl |
| work/reading/side_topic_locator.tsv | 新旁线按主题定位研究文档及Markdown行号、msg；不是正式条目表 |
| work/reading/evidence_locator.tsv | 按ERC、主题或msg定位证据JSONL行，避免全文加载各包 |
| work/reading/post_locator.tsv | 通过帖子 ID 定位文档和 JSONL 行；用检索或 Import-Csv 选行，勿全部灌入上下文 |
| work/reading/source_catalog.json | 机器用路径、来源类别、页与章节信息、文件指纹；按字段读取，勿每次完整打印 |
| docs/superpowers/specs/2026-10-02-yulinfeng-tavern-replay-plan.md | 全部内容范围、扩展约定和正式编写流程 |

**来源边界**

- 设定说明查设定；人物身份与背景查原卡；发生的事件查完整原帖。
- 叙事检索版和战报是导航，心理、主题和因果解释要回原文。
- REF_USER_NOTES 是用户的手工考据、推测与二手转引。先读 user_notes_intake.md 的主题索引，按 msg 查正文；保留引用、删除线及编辑时期。它不自动证明世界事实，也不计入团录完成数。
- 人物卡及设定会持续更新。分别记录事实有效时期、来源更新时期和人物知情时期。
- current_state.md 是秘境毁灭后第三天的续跑状态，不是重玩开局。
- 原线与重玩分支分开；未来原线事件不自动成为重玩结果。
- 候选审阅并明确请求第二阶段前，不生成新的正式 worldbook_source.jsonl。
- 设定参考仍在原目录，团录读取本 worktree 的提取快照；更换来源版本时显式记录，不混用工作区修订。
- 来源指纹只用于发现版本变化，不代表语义正确。语义阅读进度和人工审阅状态应单独记录。

**按帖子 ID 读取的例子**

在 worktree 根目录运行以下 PowerShell 命令。先定位，后取完整原帖：

~~~powershell
$hit = Import-Csv -LiteralPath 'work/reading/post_locator.tsv' -Delimiter ([char]9) |
  Where-Object post_id -eq '816583'
$catalog = Get-Content -LiteralPath 'work/reading/source_catalog.json' -Raw | ConvertFrom-Json
$page = $catalog.pages | Where-Object document_id -eq $hit.document_id
$post = (Get-Content -LiteralPath $page.posts_jsonl |
  Select-Object -Skip ([int]$hit.jsonl_line - 1) -First 1) | ConvertFrom-Json
$post | Select-Object id,floor,author,time,source_html,body,images | ConvertTo-Json -Depth 6
~~~

读取章节时按起止行读取完整对应段落。全文或一个帖子太长时，明确标注截取范围和续读位置，不把被截断的内容当作完整证据。不为节省 context 删掉说话者、传闻归属、否定词、代价、例外或时间信息。

**按主题读取共享证据**

~~~powershell
$evidenceHits = Import-Csv -LiteralPath 'work/reading/evidence_locator.tsv' -Delimiter ([char]9) |
  Where-Object { $_.title -match '诅咒|假面' -or $_.topic_targets -match 'WRC_031|WRC_039' }
$evidenceHits | Select-Object evidence_id,package,jsonl_line,title
~~~

先选与当前时期、问题有关的少量命中，再按package与jsonl_line读取；不要把所有命中全文重新灌入上下文。进度只取计数、下一范围与未决问题，通常无需读取shared_complete_post_ids。

**扩展与更新**

新文件先登记 source ID、路径、类别和版本，再补章节或页定位。来源文本变化时只刷新有关定位，并标记依赖它的内容需要回看；不会自动推翻或覆盖人工审阅结果。现有帖子 ID 保持稳定，别名关系交由内容审核确认。索引可再生成，人工内容不可由索引任务改写。

## 人物与跨线资料的最新入口（2026-10-03）

[125个研究标签覆盖表](<C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/character_coverage.md>)、[人物／跨线／知情定位表](<C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/reading/character_crossline_locator.tsv>)、[角色知情边界](<C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/knowledge_projection.md>)。九个人物参考章节已全节读到；安兹旧卡废弃，其他卡仍按版本和取得时期使用。早期资料的“长表未读”仅为历史快照，不要据此重新读整份人物集。两旁线585帖已在既有总覆盖内，本轮只复用与定点回查。
