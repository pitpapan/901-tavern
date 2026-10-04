> 最新修订为v1.2，见 [v1.2操作说明](v1.2_操作说明.md)。包含v1.1，并补入敏感信息的谈话场合；安装中的预设未自动更新。

# 901 完整预设 v1

导入文件：901_飘零大陆_3.5-flash_v1.json。它是完整 Chat Completion 预设，不是 Prompt Manager 提示词列表。

适配本机 custom 渠道别名 3.5-flash，未确认官方 Gemini 型号。上下文预算 32768、输出上限 4096、温度/top_p 均为1；开启最新版文风和短例，保留 Persona、世界书、角色资料与历史原生标记，F3仍由主持卡承担。

共享文件不含连接字段或用户扩展配置。ST 1.19.0导入完整预设会把缺少的 extensions 清空：本机应用应在私有副本里保留原 oai_settings.extensions，或仅合并安全字段patch。当前实际应用进行中，尚未宣称导入或生成验证完成。

[参数依据、安装源码与安全合并说明](../../../work/replay_research/model_preset_v1/README.md)。本地一次格式检查通过；模型API未由预设作者调用。
