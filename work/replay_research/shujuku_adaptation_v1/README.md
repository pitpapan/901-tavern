# 901 当前分支数据库适配（2026-10-04）

这是项目适配与当前试跑修复候选，不是原团正史。没有更改酒馆安装、配置、聊天或世界书，也没有调用模型；实际应用由主代理负责。

## 可导入文件

- `901_当前分支_清洁五表.checkpoint.json`：官方 Checkpoint v1，SQLite，五表17行。保留已核的玩家选择、随身物品与当前协会问询；记录医馆及协会知识边界的主持校正。完整性按安装源码的 FNV1a/base36 算法生成。
- `901_帝都动态状态.template.json`：同架构空模板，适合未来新分支。不要在本次已有聊天中另行导入空模板。
- `901_动态填表.sqlite.prompts.json`：当前已安装 SQLite 模式的填表提示。普通模式字段为 `charCardPrompt`，不是 strictJsonSqlCharCardPrompt；后者只有严格 JSON 开启才生效。
- `settings_whitelist_patch.json`：供主代理审阅、合并的白名单。不是插件配置导入文件，不能整个覆盖 settings.json。
- `checkpoint_payload_unsigned.json` 与 `sign_checkpoint.mjs`：可读种子和本地签名工具；修订种子后重新签名，不能直接编辑已签包。

## 已安装版本与真实持久化

安装位置：`D:/github/sillyTavern/public/scripts/extensions/third-party/shujuku`。manifest 显示“龙血玄黄·数据库 1.2”、version 1.2；package.json 的1.0.0不能代替运行manifest版本。源码与index哈希见manifest.json。

正常扩展模式把配置保存在服务端 settings 的 `extension_settings.__userscripts.shujuku_v120__userscript_settings_v1` 对象，默认profile为 `shujuku_v120_profile_v1____default____settings`。当前角色键为 `char:901·飘零大陆主持.png`。IndexedDB主要充当缓存/回退，不能只向浏览器localStorage写配置。修改服务端配置后，原浏览器应刷新，防止旧内存再次保存覆盖。

当前聊天模板/指导表在 chat_metadata 的 TavernDB_ACU_ScopedConfig / TavernDB_ACU_InternalSheetGuide；每个AI楼层的 TavernDB_ACU_IsolatedData 保存数据库历史。现有旧快照并非空：原第5/11/17/23等AI记录的logEntries曾写入九张默认表。只检查第一个空checkpoint会误判。

依据：`src/data/storage/tavern-storage.ts`、`src/data/repositories/profile-repo.ts`、`src/shared/data-constants.ts`、`src/service/settings/settings-readers.ts`、`src/data/gateways/host-state-gateway.ts:67`。

## 导入与迁移

标题“奶·数据库 I”连续点击五次打开功能档位，选择“进阶”（medium）；数据管理最低档位在 `src/presentation-v2/page-registry.ts` 中限定为medium。进入“数据管理 → 当前聊天 Checkpoint → 导入 Checkpoint”，选官方包并确认“恢复 Checkpoint”。不要选“合并导入”。

恢复会清理该聊天所有AI消息及隔离槽的旧数据库元数据，在最新AI楼层建立单一完整快照；保留聊天正文，不修改全局模板库。原数据已由主代理完整备份在 `D:/github/sillyTavern/data/default-user/backups/901-adaptation-20261004-072331`。这是本次已接受的迁移方案，不应手工往末楼追加第二个根frame。源码：`src/service/table/table-checkpoint-transfer.ts:320`起。

先把注入目标换成 `901_帝都重玩_记忆_01`，禁用原T0的13个ACU条目，避免旧状态继续注入。源世界书选择改为manual空列表，填表提示只有$0（当前表及规则）、$1（本次聊天证据）、$8（人工补充），不再把120条背景全部带进维护请求。

## 五表与上下文

场景状态仅当前场景；人物动态仅当前状态变化；物资变化仅持物、数量与使用状态；情报与承诺区分事实/传闻/个人猜测以及知情者；分支纪要只保留持续影响的已发生事件。主角【内心】不授予NPC知情。最新种子里的“作者校正”是主持资料，不能自动变成场内人物全部知道。

场景/物资/情报常驻；人物与纪要按姓名或事件触发名加载。不复制完整人物卡、世界百科、原团未来。五表均启用自定义导出，源码 `helpers-data-merge.ts:721` 会把它们排除在聚合 ReadableDataTable 外，因此不应双份注入；实际导入后检查记忆书即可。

维护仍有填表模型调用与已触发条目的上下文成本，不能宣称零token。当前保持autoUpdateEnabled=false，先纠正医馆答复，再由主代理决定启用。建议skipFloors=1留最新AI缓冲；频率1、窗口4、批次3、最多重试1；autoUpdateTokenThreshold实为最短输出字符门槛，设0避免短而合法的更新被无谓重试。

## Swipe、恢复与已知边界

同一AI楼层所有swipe共享同一份数据库历史。切换swipe只触发重载，不自动恢复对应的旧表；已填入后再改选需要重填或恢复Checkpoint。`src/presentation-v2/copy/data-mgmt-copy.ts:11`直接说明此限制，`bootstrap/init.ts:830`只是监听重载。无需创建第二个聊天session。

未完成的运行验证：本报告只做JSON/行ID/列宽及DDL必要静态检查；官方UI导入与一次模型生成由主代理完成，不能由文件存在推定已生效。
