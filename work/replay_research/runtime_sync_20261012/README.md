# 005帝都入口运行投影

授权UCL_20261012_070；从004独立生成，不更新冻结运行基线、F层资料或人物作者档。

- projection_edits.json：14条正文、谢尔伦范围禁用；proposed.diff为应用前对照。
- runtime_cards.jsonl：七行同ID人物增量，未覆盖F原99行运行资料。
- canon_review.json：本会话使用901-canon-review核对22组主张，未委派审核。
- projected_entries.jsonl、manifest.json：沿004来源结构与指纹模式。
- verification.json：本地ST 1.19.0的V2及内嵌转独立字段核对，非模型实跑。

本地tavern-cards技能与forge脚本已安装。实际使用局部编辑、压缩、保留关键背景和具体行为、独立可读性方法；现有兼容评估不支持forge无损往返，故未运行全量重打包或迁移工程。

集成说明读取自D:/备份文件/901记录/TRPG outputs/docs/901_skills_integration.md；项目工作树没有该副本。源人物最新采用与UCL_055、帝都15份已采用方案、UCL_068成长收拢均已区分，按本轮入口范围投影。UCL_069未撤销，但除灵细案、猫音新互动按当前请求排除。

prepare_projection.py只生成本目录增量；build_candidate.py仅在审查文件指纹吻合时导出到独立候选目录；verify005.mjs沿004校验逻辑。重做投影后旧审查指纹自然失效，不能绕过内容核对。它们是本批一次性导出脚本，不是新运行引擎或通用工作流。

交付入口：../../../output/replay_tavern/capital_entry_20261012_candidate/README.md。
