# R1C-1 — 依据、契约、抽样与端到端试点报告

状态：**PASS**  
范围：**CONTRACT_AND_END_TO_END_PILOT_ONLY**  
下一步：**READY_FOR_FULL_SOURCE_REVIEW**

> 本状态只说明当前事实契约、来源审阅方法、人物相关性投影和隔离试点足以进入全来源复核。它不表示全语料已正确、人物已经批准、世界书已经完成，也不授权 R1C-2、生产替换或 Phase 4。

## 1. 基线与保护结果

- R2C production：140 files
- aggregate SHA-256：`cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3`
- frozen inputs：488/488
- production、R2A、R2B、Phase 3、历史 authority、生产 schema、Canon、Worldbook、Current State：未修改
- 旧 R1C-0 报告、matrix、golden 和生成器：保留，未改写
- 从旧 R2A/source-ledger 语义路由直接继承为新事实：0

基线由 `work/rebuild/r1c_vnext/baseline_manifest.json` 记录。构建前后均重算 production 指纹；新文件只写入 `docs/remediation/`、`scripts/r1c_vnext/`、`tests/test_r1c_vnext_*` 与 `work/rebuild/r1c_vnext/`。

## 2. 来源总体与抽样

source-chunk ledger 有 2,848 条可解析记录，对应 58 个真实 `posts.jsonl` 文档：

| 部分 | 文档 | 帖子 |
|---|---:|---:|
| P1 | 28 | 1,394 |
| P2 | 25 | 1,204 |
| P3 | 5 | 250 |

抽样总体没有使用 37 份 profile 的引用集合进行过滤。ledger 仅提供稳定 chunk ID、路径和顺序；旧 event routing、reviewed 标志与梦境标签没有被当作真值。

抽样 seed 为 `R1C-1-SOURCE-WINDOWS-2026-10-01-v1`。场景组由同一页内连续三个帖子组成；已知回归案例所在组先排除，开发与留出之间禁止共享帖子或相邻组三帖。按 P1/P2/P3 各取 8 个开发窗口和 8 个留出窗口：

- known：29 个历史案例；
- development：24 个场景窗口；
- holdout：24 个场景窗口；
- split leakage：0；
- review isolation：`sequential_review`。

当前环境没有真正隔离的第二审阅上下文。提取 A、复核 B 和裁决分文件保存；B 的记录明确写为“先看来源、后看提取”，但本报告不把它称为盲审或独立 agent 复核。24+24 只是预算样本，不能保证全量正确。

## 3. 29 个历史案例的评价依据

`evaluation_cases.jsonl` 保存 29 个唯一历史 case，并把历史诊断与本轮来源定位分开：

- source/post/span/hash 可定位：29/29；
- 来源支持且必须保留边界：18；
- R2C 人物相关性投影契约：5；
- 人工解释性假设：1；
- 来源未建立或仍未解决：5；
- 未决来源/解释问题合计：6。

“可定位”只表示文件、帖子、字符 span、短引文和 hash 能从真实抽取中重新解析，不意味着原命题自动为真。每条记录另有 `story_truth_status`、`must_preserve` 和 `must_not_assert`；不再以 `verified_source_fact` 或 `must_not_promote` 一个布尔值承包全部认知边界。

五个旧 `R2C_RELEVANCE_*` 案例已移除泛化占位来源。每条现在记录真实帖子 locator，以及候选中的具体 `timeline_id`、event、角色标签和被错误复制的 `character_specific_summary`：

- Honda：泰蕾斯事件与死亡之翼决战宽摘要；
- Cassius：秘境入口事件被当作终局载体；
- Kenda：泰蕾斯宽摘要被当作死亡报告载体；
- Lulutiye：哈克知识/瑟坦特觉醒等无人物后果事件；
- Oshira：泰蕾斯/白魔离场等宽摘要。

这些案例的检查对象是“人物投影能否证明角色相关性”，不是把“禁止复制 event summary”伪装成剧情事实。

## 4. 契约结果

最小 `AtomicFact` 将下列维度独立保存：

- 被描述主体；
- actor、speaker、addressee、observer；
- 主世界/特殊梦境现实范围；
- 实际发生、计划、偏好、决定、条件、预测、疑问、未陈述等叙述模态；
- 叙述确认、角色直接陈述、听闻、推理、争议、未决等证据性质；
- 故事时间、发言/获知时间；
- 状态有效期、最后确认点和持续性；
- 支持、反驳、修订、替代和身份联系。

Chronology 和人物事实视图直接读取同一事实层。人物投影必须有该 profile 的显式 `projection_role`；event summary 不可作为人物事实来源。

关系父容器在 vNext 中允许：

```text
baseline = null
baseline_status = NOT_ESTABLISHED
```

这表示来源只支持一次互动或里程碑，没有支持持续关系基础。它不是“中立关系”，也不是结构占位句。生产 schema 没有修改；如后续全量审阅证明生产格式无法表达该情况，再单独提出 schema 决策。

## 5. 开发集结果

- scene groups：24
- first-pass findings：4
- 最终未解决的实质遗漏：0
- 最终无来源/强化断言：0

首次发现：

| 类型 | 数量 | 处置 |
|---|---:|---|
| 第二主题漏抽 | 1 | 补入机关第二次反应并保留预感边界 |
| 规则文本与叙事混合 | 1 | 规则数值作为非连续性子单元隔离 |
| 疑问主题漏抽 | 1 | 补入角色疑问，保持未证实 |
| 现实范围缺失 | 1 | 标为 Special Interlude，不进入主世界 |

这些问题由既定分维契约直接表达，没有要求修改契约。

## 6. 留出集结果

- scene groups：24
- first-pass findings：4
- 最终未解决的实质遗漏：0
- 最终无来源/强化断言：0

首次发现：

| 类型 | 数量 | 处置 |
|---|---:|---|
| 规则文本与叙事混合 | 1 | 分离纯数值与物品转交/带路事实 |
| 多人物反应漏抽 | 1 | 补入布莱特、慕少艾等人物出现/反应 |
| 现实范围缺失 | 1 | 梦境场景隔离 |
| 推断状态被强化 | 1 | 悠悠“警戒”恢复为叙述推测语气 |

留出首轮暴露的问题均属于冻结契约已经定义的错误类型，因此没有为了调绿而修改契约或抽样规则。留出数据仍保留 first-pass finding，不把修正后的结果冒称首次全绿。

## 7. 新观察到的错误类型

相对于 R1C-0 的主要 failure class，本试点另外显式记录了：

- `RULES_TEXT_MIXED_WITH_STORY`；
- `QUESTION_TOPIC_OMITTED`；
- `REALITY_SCOPE_MISSING`；
- `MULTI_CHARACTER_REACTION_OMITTED`；
- `INFERRED_STATE_STRENGTHENED`。

它们都能用既有维度与 source disposition 表达。契约修订轮数：**0**。

## 8. 端到端试点

端到端试点包含 17 个审定事实、34 个人物投影、17 个 chronology 条目和 11 份完整人物候选。覆盖：

- 命运支流：乳白力量、信息传输、两条主要支流与黑河、悠悠偏好、御临风未明确选择边界、后续毁灭秘境计划；
- 卡珊德拉：供物归属、道歉、预言与排除风险建议，并保留“不是已证明亲手实施全部暗杀”；
- 奥希拉/死亡之翼：speaker 与 semantic subject 分开，古史保持 hearsay；
- 安兹：庇护声明为 Campaign 中实际言行，持续义务未知；
- 开发普通正例：星辰地砖机关；
- 留出普通正例：棺材躲避协同行动。

完整关系父容器包括：

- 悠悠 → 御临风：场景内互相信任 baseline，当前立场未确认；
- 御临风 → 悠悠：同一历史事实，不扩展为未来选择或永久承诺；
- 卡珊德拉 → 御临风：只有风险建议里程碑，`baseline = null / NOT_ESTABLISHED`，不编造持续关系。

独立验证器重新枚举事实、chronology、人物投影、候选和关系父容器，结果：

- source locator errors：0；
- dangling fact refs：0；
- unsupported outputs：0；
- missing character projections：0；
- character relevance errors：0；
- parent container errors：0。

中文样页正文使用自然中文；句子到 fact 的 sidecar 单独保存。自动可读性检查结果：event-ID 主标题 0、claim-ID 主标题 0、raw JSON 0、`current_stance = null` 裸显示 0、英文主导正文 0。

## 9. 变异与双向验证

14 项检查全部被相应关卡检出或正确归一：

1. destination 指向不存在对象；
2. 把他人行动注入人物经历；
3. 偏好升级为决定；
4. 预测升级为事实；
5. 听闻去归属升级为客观古史；
6. speaker 与 subject 交换；
7. 第二主题遗漏；
8. 治疗能力/计划升级为已经治愈；
9. 历史状态无依据延续到 D3；
10. 梦境污染主世界；
11. 问题/条件升级为肯定事实；
12. 伪造 source path/span；
13. 同一 source 重复收录不增加独立证据数；
14. JSON 键重排保持语义相等。

机械检查不能理解原文含义；第 3–11 类由审定断言、分维契约和 source-first 复核检出。报告没有把这些能力宣称为 schema 自动理解语义。

## 10. 决定性与验证入口

单一入口：

```powershell
python scripts/r1c_vnext/validate_r1c1.py
```

它执行：

```powershell
python scripts/r1c_vnext/pilot.py --check
python scripts/r1c_vnext/independent_validate.py
python -m unittest tests.test_r1c_vnext_pilot
```

独立验证器不导入 `pilot.py` 或生产 serializer 的语义/equivalence 函数。两次从相同审定输入生成的 40 个派生文件 byte-identical；production 指纹在验证前后不变。

实际回归结果：

- `python scripts/r1c_vnext/validate_r1c1.py`：PASS；
- `python -m unittest discover -s tests -p "test*.py"`：334 tests，0 failures，0 errors；
- `python scripts/prepare_phase3d_r2c_packages.py --check`：PASS，37 packages；
- `python scripts/build_phase3d_r2c.py --check`：PASS，37 candidates match；
- 最终独立复核：140 production files、488/488 frozen inputs、0 source locator errors、0 unsupported outputs。

## 11. 未决事项

六个历史问题保持未决或解释性假设，未为获得 PASS 而补造来源：

- 雪老与御临风“亦师亦友”属于有场景依据但需人类确认范围的自然概括；
- 雪老 D3 精确位置没有 Current State 级确认；
- 艾利是否已完成治愈没有明文；
- 布莱特与盲眼幼龙的身份连续性未确认；
- 死亡之翼“统一魔兽山脉”超过来源措辞；
- 古神导致死亡之翼堕落目前只见推理/理论/可能未来。

这些未决点是正确保留的来源边界，不是未解决的试点抽取遗漏。

## 12. Gate 结论

- Gate A（依据与契约）：PASS
- Gate B（开发/留出来源提取）：PASS，审阅隔离等级为 `sequential_review`
- Gate C（父容器、人物相关性、中文投影）：PASS
- Gate D（生产保护、冻结输入、变异、决定性）：PASS

**R1C-1 STATUS：PASS**  
**NEXT：READY_FOR_FULL_SOURCE_REVIEW**

本任务在此停止。没有开始 R1C-2，没有全量来源重建，没有替换 production，也没有进入 Phase 4。

