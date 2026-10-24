from pathlib import Path
import json
base=Path('output/replay_tavern/six_books_20261023_candidate')
j=json.loads((base/'installation.json').read_text(encoding='utf-8'))['sourceRecheck']
assert j['tests']==330 and j['totalModules']==34 and len(j['modules'])==14
p=Path('work/rules_engine/gm_runtime/README.md');s=p.read_text(encoding='utf-8')
s=s.replace('## 2026-10-23 剩余规则接入结果','## 2026-10-23 原文复核后的当前结果',1)
start=s.index('正式「901 帝都初始卡」');end=s.index('\n\n',start)
s=s[:start]+'正式「901 帝都初始卡」继续关联六本世界书、173条。**本次更新14个运行文件，完整依赖清单现为34模块，均已安装并哈希读回。** 修复打包脚本漏收绝对路径动态导入，实际分类器 replay-check.mjs 已同步。新备份位于 `installation-backup/source-recheck/`，原有备份保留；卡片与聊天存档未改。刷新SillyTavern继续原聊天，不要初始化。'+s[end:]
s=s.replace('上位每分钟累计、整千米目标与费用、已确认失败退还下取整一半','上位每分钟累计、整千米目标与费用、失去施法行动能力自动失败并退还下取整一半')
s=s.replace('一阶机会、节点/章节/奖励和成长，均保留','节点/章节/奖励和成长保留；基因锁新增一/二阶活动状态、主动费用、二阶属性/自动成功、时限/反噬和MVU；魔物之盒补原帖魔眼恐惧/气息感知')
s=s.replace('按采用边界结算','默认自身行动末结算一次')
start=s.index('## 集中待确认表：规则口径');end=s.index('## 集中待补表：实际实例信息',start)
s=s[:start]+'''## 集中待确认表：规则口径

旧R1–R10已逐项回查原卡、PHB原始HTML与已采用901规则。燃烧行动末、风防护恰好12DP、传送中断通则、PHB基因锁普通一/二阶程序均不再待裁定；原帖另补魔物之盒两项遗漏。

**请以[原文复核与D1–D14集中裁定表](source-recheck-20261023.md)为准。** 表内有原文依据、推荐口径及影响；推荐没有自动启用。主要剩余：冷热比例、多足通式、Wizard两关键词/解除/连射、传送分段/大体型、Engage、厌魔石例外、意志基本用法、基因锁主动解除/双开及伤槽过多时缩HP、RE难度表、异体型多人擒抱、盒子开关/重置。

'''+s[end:]
s=s.replace('## 验证证据\n','## 验证证据\n\n- [原文复核后330/330通过](../../../output/replay_tavern/six_books_20261023_candidate/scene_test/source-recheck.tap)，新增12项相关回归；sourceRecheck安装批次14文件、34模块全部哈希读回。依赖核验现在同时检查相对路径和本地绝对路径动态导入。\n',1)
s=s.replace('[本轮测试318/318通过]','[上一批测试318/318通过]')
p.write_text(s,encoding='utf-8')
p=base/'README.md';s=p.read_text(encoding='utf-8')
s=s.replace('33模块已经安装并哈希读回，本次更新17文件、新增4模块','34模块已经安装并哈希读回，本次原文复核更新14文件')
s=s.replace('[本轮本地测试318/318通过](scene_test/remaining-audit.tap)','[本轮本地测试330/330通过](scene_test/source-recheck.tap)')
anchor='## 早期测试记录'
pos=s.index(anchor)
s=s[:pos]+'''原文复核已补燃烧时点、12DP风防护、不能继续施法的自动失败退款、PHB一/二阶基因锁和魔眼暴露/气息识别，并补上先前发布清单遗漏的动态导入分类器模块。真正待裁定的推荐与来源集中于[D1–D14表](../../../work/rules_engine/gm_runtime/source-recheck-20261023.md)，尚未自动采用。

'''+s[pos:];p.write_text(s,encoding='utf-8')
for name in ['手动应用说明.md','状态与触发分工.md']:
 p=base/name;s=p.read_text(encoding='utf-8').replace('33模块','34模块')
 s+='\n原文复核补丁：基因锁活动阶、每阶轮数/反噬、临时属性资格和魔眼直视状态由JS/MVU保存；原文及待裁定建议见[集中裁定表](../../../work/rules_engine/gm_runtime/source-recheck-20261023.md)。打包清单已包含本地绝对路径动态导入的分类器模块。\n';p.write_text(s,encoding='utf-8')
