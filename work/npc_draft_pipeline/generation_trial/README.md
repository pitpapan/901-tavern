# 901 NPC 首次构筑演练：黎雁岚

**性质：**一名新 NPC 的非 Canon 提案。`PROPOSAL_EMPIRE_BORDER_TRACKER_LI_YANLAN` 在单一时期“901 原线：边关失陷前的关卡守备期”使用；具体年月未定。现有整理明确指出重玩 T0 时关卡已经失陷，因此本卡不写作 T0 现役守关人物。没有修改人物卡、世界书或存档，也没有把 T0—T8 换算成数值。

## 人物与依据

帝国边关设有长期面对魔兽侵袭的关卡，这是[帝国设定整理](../../replay_research/empire_dossier.md)和[帝国军制整理](../../replay_research/empire_military_strength_20261007.md)中的世界背景。军制整理将普通正规军与选拔精锐小队区分，并明确军职不推出个人战力。本角色采用普通边关步兵的巡路岗位；“巡路兵”称呼、她本人及其细节**全部为本次提案**，不是既有组织名册或已确认人物。

黎雁岚曾在关卡周边巡路，习惯将足迹变化和风向记在布条上，交班时先说明危险路段。她说话简短，遇到不明动静先示警、后牵制，不喜欢为了追击离开可回援的路线。这些经历和性格都是 `PROPOSED`。她擅长观察、辨迹、短距离移动和投掷；弱点是持续近战、交涉和临场指挥。候选战斗方式是短距离飞镖牵制，近身时用基础格斗脱身。飞镖只是装备与 PHB 资源候选，尚无获准持有的记录。

## 文件与运行

- [Blueprint](border_tracker.blueprint.json)：符合现有 `blueprint.schema.json` 的 `new_character_proposal` 输入。
- [Builder 数值候选](border_tracker.candidate.json)：六属性、技能、装备和初始状态；Pipeline 为各数值路径标记 `PROPOSED`。
- [可运行脚本](run.mjs)：调用 production Resource Adapter、NPC Draft Pipeline、Character Builder 与 JS 内核，并断言授权边界。

在 `TRPG outputs` 根目录运行：

```sh
node work/npc_draft_pipeline/generation_trial/run.mjs
```

## 预览人物卡

| 项目 | 提案或 Builder 预览 |
| --- | --- |
| 身份／时期 | 黎雁岚；901 原线边关失陷前的关卡守备期；`PROPOSED` |
| 体积 | 5，`PROPOSED` |
| 六属性 | 力量 2、敏捷 3、智力 2、感知 3、意志 2、风度 1；均 `PROPOSED` |
| 主技能 | 运动 2、求生 2、洞察 2、肉搏 1、白刃 1；均 `PROPOSED` |
| 子技能 | 运动·飞镖 1〔`weapon.portable_dart`〕；求生·荒地寻迹 1〔`terrain.border_beast_tracks`〕；均 `PROPOSED` |
| 装备 | 便携飞镖、示警号角、巡路记事布条；均为描述性 `PROPOSED`，不代表已实际取得 |
| 能力概念 | 兽迹预警：保留叙事意图，`UNSUPPORTED`，无额外数值或动作 |
| 初始状态 | 健康、意志当前 3、回合待开始；演示提案，不是存档事实 |
| 派生值 | 生命上限 7、防御 3、速度 10、先攻 4、意志上限 3、视野 30、反射 5、强韧 4；Builder 的 `PROPOSED` 预览 |

没有设置 `powerReference`：此角色无需档位换算，数值根据“观察与移动较强、正面缠斗较弱”的定位逐项提出，不由军阶或岗位计算，也不声称符合某个已批准的点数预算。

## 合法性、资源与结算

Pipeline 返回 `ok: true`、`okScope: BUILDER_PREVIEW_ONLY`、`approved: false`、`formalDefinition: null`；错误与缺项均为空。直接再次调用 Builder 得到相同派生值。数值合法仅表示当前接口能构筑预览，不是强度平衡、来源采用或正式授予。

PHB v0.3“暗器大师／便携暗器”中的**飞镖**有来源，原文给出 1L 穿刺伤害与 20 米射程单位；[资源目录](../../resource_adapter/resources.json)已有稳定 ID `phb03.weapon.portable-dart`，适配及内核算法均存在。然而本次 production 查询返回 `adoption: UNDECIDED`、`acquisitionSource: null`、`prerequisiteStatus: PENDING`、`engineSupported: false`。因此没有给 Builder 或角色任何飞镖资源效果。待明确事项是新人物定义批准、901 采用许可、人物取得与库存／持握确认；飞镖现列于预览的 `unsupported`，含义是**本角色当前不可执行**，不是说内核从未支持该武器。兽迹预警则真正缺少特殊预警机制，保持说明文本。

固定 D10 输入下，普通**感知＋洞察**检定为 5 DP、2 成功，对演示 DC 1 成功。PHB 普通投掷规则允许根据敏捷、运动、武器伤害和目标防御计算；脚本另作**条件式**普通攻击演示：假设飞镖取得并持握、目标距 5 米且无护甲，以资源目录中的 1L 参数对纯测试目标结算，得 6 DP、2 成功、伤害上限 6、实际 2L。该调用只验证 JS 内核在给定合法场景参数下可算普通攻击；它没有通过 Resource Adapter 的正式 `weaponInput()`，不声称黎雁岚已能在 901 运行状态中发动这次攻击。范围、库存与最终使用资格仍须由正式调用方核对。

**链路判断：**Blueprint → 独立数值提案 → Pipeline → Builder → 普通检定已经贯通，足以产生可供作者审阅的简单 NPC 草案。复杂人物仍受三项具体边界限制：PHB／RE 资源的逐项 901 采用与人物取得证据、特殊能力的按需规则适配，以及武器库存／射程等战斗上下文核对。不能把 `ok` 或条件攻击演示当作自动批准。
