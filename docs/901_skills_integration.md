# 901 Skills v0.3.1：项目接入与审查

2026-10-11。来源为用户提供的 `C:/Users/pit/.codex/skills/901_skills/.agents/skills/`。安装位置为当前目录 `D:/备份文件/901记录/TRPG outputs/.agents/skills/`；不是全局安装，也不是酒馆运行插件。

现有重玩成果已在既有工作树提交为 `585d1bd`。用户随后明确“不需要push”，因此没有配置远程或上传。技能安装发生在这次提交之后，当前目录里的安装改动没有并入该提交。

## 审查结论

| Skill | 适用范围 | 接入限制 |
|---|---|---|
| 901-canon-review | 原团证据、身份、时间线、移植边界及冲突核查 | 不自行审批或写入正典 |
| 901-world-systems | 有据整理、社会因果检查和不扩写的stress_test | 新制度、地理、文化等只在用户授权范围内提案；安装不启动扩写 |
| 901-story-factory | 已有人物／剧情的明确创作请求 | 默认不隐式调用；显式调用也不代替任务授权，不编造原团旧史 |

三个技能的15个源MD/YAML文件原字节复制。只额外加入Story Factory的 `agents/openai.yaml`，设置 `allow_implicit_invocation: false`，不修改原技能正文。逐文件指纹见[安装清单](901_skills_install_manifest.json)。没有安装外层测试、脚本、fixtures、依赖或其他tavern插件。

## 与本项目衔接

1. 技能里的“起始世界资料已完成”是包作者描述，不能替代本项目当前状态。没有单一名为Approved Canon的文件，也不因此新建虚构索引；按原有字段来源权威查实际资料。适用的原团设定直接复用，只有真实冲突或影响设定的资料缺口才提问。
2. `DRAFT/ELIGIBLE/ESTABLISHED/APPROVED_CANON`、`basis_status`是工作流／依据维度，不能替换本库的确定性、来源、时期或人物知情。人物证言、误信、内部思考不能升格为世界事实。
3. 原团续写的D3与帝都重玩T0是不同锚点。`current_state.md`不用于重玩覆盖；已经开始的重玩分支以用户保留的实际记录为准，不因为读T0资料而重开剧情。原团后续是有时期限制的参考，不是固定日程。
4. 只在用户明确授权的创作范围内使用人物背景、动机、幕后真相和地区规则的候选设计；已确认设定不重复审批。安装、静态PASS、空模板或资料缺失均不提供新创作授权。
5. 模板是可选工作格式，不强制迁移已审数据结构或新增条目。新报告应另命名并保留来源；不覆盖已审内容，不自动生成正典总库，不回写004冻结快照。
6. 御临风的新增对白、决定、行动与内心由玩家提供。既有有限代办允许概述已授权事项，不能借“禁止代写”撤销这项授权。
7. 文化、居民细化、地图、难度引擎等按最新待办继续后置；已取消的文风复跑、模型测评、龙血适配和代操作酒馆不因安装恢复。
8. 不能照搬包中对tavern-cards的自动交接。此前评估发现完整forge往返会改变关键词触发、UID及来源扩展；继续现有导出路径与人工应用方式。上游工具和未来Builder均不是本次安装的运行依赖。

## 重玩实际资料入口

重玩继续使用工作树 `C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs`，此路径与本次技能安装所在的主目录不同。任务未要求更改原团资料所在分支。

该工作树下按需读取：

- `work/replay_research/README.md`、`handoff_20261004.md`：当前进度、边界和入口。
- `work/replay_research/user_clarifications.jsonl`：确认原话及范围；来源、时期仍按每条内容判断。
- `work/replay_research/opening_state_consolidated.md`：帝都入城前T0。
- `work/replay_research/world_model_core_brief.md`、各专题与原团记录：按字段追查证据，不把摘要当唯一正典。
- `output/replay_tavern/latest_release.json`：实际运行版、作者截止点及待同步项目。
- `work/replay_research/tavern_cards_skill_assessment_20261009.md`：外部导出工具适用性。

如果这些实际入口以后变动，先查项目当前文档，不猜造Approved Canon/HOLD文件，不以本安装说明冻结项目进度。

## 验证及限制

已静态阅读三个SKILL、全部七份参考、五份模板以及包级脚本与测试。未发现网络请求、凭据索取、动态下载、远程发布或自动修改Canon。Python验证器使用 `yaml.safe_load`；运行时安装集只有指令与模板，不含可执行脚本。

源包静态验证PASS；验证器26项回归测试全部通过。首次测试受沙箱临时目录的`.agents`写权限限制，在测试布置阶段报错；以批准的本地执行重试后26项通过，未改变测试或源技能。只使用现有PyYAML，没有pip安装。模型39项行为案例没有执行，不把静态检查说成实战效果保证，也没有操作酒馆。

[官方技能文档](https://learn.chatgpt.com/docs/build-skills)说明项目技能放在当前目录的`.agents/skills`，以及显式调用策略。下一轮可使用 `$901-canon-review`、`$901-world-systems`；需要创作并授权相应范围时再显式使用 `$901-story-factory`。若客户端未刷新，可重启后查看技能列表。
