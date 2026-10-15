# 现用通用维护工具

保留三个独立校验器：

- `validate_worldbook.py`：世界书结构数据的格式检查，默认对应`schema/worldbook_entry.schema.json`。
- `validate_authoring_framework.py`：补充、事件及patch等结构数据的格式检查。
- `validate_character_profiles.py`：人物格式检查，复用同目录的`validate_authoring_framework.py`。

配套schema、示例和测试仍保留原位置，不在普通设定写作时自动执行。当前运行文件见[运行入口](../output/replay_tavern/README.md)，作者世界见[世界目录](../world/README.md)。

旧R2C／R1A／R1C重建、审计、审批包生成及公共模块已[成套归档](../archive/legacy_engineering_20261015/README.md)。旧报告中的命令属于历史记录，不是当前可执行任务；不要求恢复它们后才能创作或阅读。规则程序另见[JS规则引擎](../work/rules_engine/README.md)。本次没有执行任何校验或测试。
