# 901 环境迁移清单（2026-10-24 存档）

本清单区分两套版本：**实际安装版**可从本次快照恢复；**开发中双版本资源改造**保存在代码中，尚未完整验收、没有覆盖本机安装版。不要把两者混合部署。旧 `output/replay_tavern/latest_release.json` 是历史索引，不是当前实际安装版指针。

## 必备环境

| 层 | 已核对的版本／要求 | 用途 |
|---|---|---|
| Git | 支持 HTTPS 克隆和推送；仓库访问凭据由云端单独配置 | 克隆两个仓库 |
| Node.js | 本机 26.10.0；SillyTavern package.json 最低要求 >=20。本项目测试证据来自 26.10.0 | SillyTavern 服务及本地 JS 测试 |
| npm | 本机 11.19.1；使用 SillyTavern 的 package-lock.json 执行 npm ci | 安装完整服务端依赖 |
| Python | 本机 3.12.4；迁移建议复用 3.12 | 资源编译、清单、导出；日常酒馆游玩不需要 Python 常驻 |
| Python 扩展 | `jsonschema==4.26.0`、`PyYAML==6.0.3` 用于相应验证工具；`Pillow==12.2.0`、`requests==2.32.3` 供历史图像/API工具 | 核心 compile_resources.py 本身仅标准库；见旁边 requirements-authoring.txt |
| SillyTavern | package version 1.19.0；本机 Git HEAD `06bde939fb1e9c4c8d8641d810f0a916b5bce127` | 聊天服务及浏览器宿主 |
| 酒馆助手 JS-Slash-Runner | 4.11.3；public 副本 HEAD `a0f3a180344cff38a4b3e75041d5a94380b877d6` | 执行角色脚本，提供 generateRaw、事件和 MVU 访问环境 |
| MVU | 角色卡启用的 MagVarUpdate 脚本；见下文 URL | `Mvu` 全局、`901_rules_poc` 聊天状态 |
| 浏览器 | 支持 ES modules、dynamic import、structuredClone、Web Crypto、DOM、localStorage 的现代浏览器 | **规则执行和交互在浏览器中**；只启动服务器不会自动主持或继续战斗 |
| 模型连接 | 当前 `main_api=openai` 接口、`chat_completion_source=makersuite`、`google_model=gemini-3.5-flash-lite`，stream=false | 此处 openai 是酒馆接口类别，实际剧情模型仍是 Gemini；不需要为了此配置另买 OpenAI API |

901 JS 引擎使用原生 ESM 和 Node 内置测试工具，没有独立 npm 依赖安装步骤。无需 GPU、数据库、Redis 或向量服务来运行当前链路。若使用其他酒馆扩展，其额外服务另计。轻量单用户部署可先按 2 vCPU／4 GB RAM 规划，这是起步估算，不是压测结果；磁盘按迁移后的用户数据实测大小预留。

## 仓库与目录布局

```bash
mkdir -p /srv/901
cd /srv/901
git clone --branch codex/yulinfeng-tavern-plan https://github.com/pitpapan/901-tavern.git 'TRPG outputs'
git clone --branch main https://github.com/pitpapan/901-resource-authoring-kit.git
git clone https://github.com/SillyTavern/SillyTavern.git SillyTavern
cd SillyTavern
git checkout 06bde939fb1e9c4c8d8641d810f0a916b5bce127
npm ci
```

两个 901 仓库必须同级，资源库目录名保留 `901-resource-authoring-kit`；当前编译／盘点脚本按这个相对路径定位，不依赖原来的 C 盘。`TRPG outputs` 带空格，命令中必须加引号。历史安装脚本中的 `D:/github/sillyTavern` 不可在 Linux 原样运行。

作者环境（可选，不是酒馆启动前置）：

```bash
cd '/srv/901/TRPG outputs'
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r docs/requirements-authoring.txt
# 只在继续开发资源时运行；生成目标是开发目录，不是实际安装快照。
python ../901-resource-authoring-kit/tools/compile_resources.py --runtime-output work/rules_engine
```

资源阅读原文位于资源库 `resources/` 与 `outputs/同伴RE资源调整/`，执行版为 `resources/execution/*.rule.json`。本次把此前被 outputs 忽略规则漏掉的人物卡原文纳入 Git。不要只迁移生成的 resource-data.mjs 而丢失阅读原文。

## 恢复实际安装版

本次只读提取的 [安装版快照](../output/cloud_migration_20261024/manifest.json) 包含 54 文件：实际 `public/901-opening-combat/` 的 45 个文件、正式角色 PNG、六本世界书、SillyTavern package.json／lock。含原始 SHA-256。没有从开发代码重建，也没有修改本机酒馆。

```bash
cd /srv/901/SillyTavern
cp -a '/srv/901/TRPG outputs/output/cloud_migration_20261024/installed/public/901-opening-combat' public/
mkdir -p data/default-user/characters data/default-user/worlds
cp -a '/srv/901/TRPG outputs/output/cloud_migration_20261024/installed/data/default-user/characters/.' data/default-user/characters/
cp -a '/srv/901/TRPG outputs/output/cloud_migration_20261024/installed/data/default-user/worlds/.' data/default-user/worlds/
```

此路径 `/901-opening-combat/` 被角色脚本绝对引用，应从同一酒馆 origin 的站点根路径提供，不能仅把文件放进另一个网站目录。`installed/package*.json` 是版本证据，不要仅覆盖任意其他版本的 package.json 来假装完成升级。先核对选定 SillyTavern checkout 与快照依赖一致。

从 `https://github.com/N0VI028/JS-Slash-Runner` 安装酒馆助手，使用上述 revision 或直接私下迁移本机插件目录。实际 dist/index.js 的 SHA-256 为 `e735f6ee5a0c2198dc980847f9b6284e3d36d6b394bbe38b0c4d801482fba7f7`。本机 public 和 data 用户目录各有一份 4.11.3、dist 相同；云端只启用一份，避免双加载。若从源码安装，要按插件自己的 package.json／pnpm lock 构建并保证 dist 存在；仅有 src 不够。

角色卡 MVU 当前从 `https://gcore.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate@master/artifact/bundle.js` 加载。浏览器必须能访问此 CDN；这是浮动 master URL，不是已固定的复现版本。本次没有下载或替换这个外部依赖；严格复现需另外保存当前实际使用的 bundle 和指纹。角色内两个脚本（MVU、901入口）都要启用，并在 MVU 初始化后加载入口。

## 必须私下迁移的数据（不在 Git 快照中）

**运行时 MVU 在实际聊天记录里，角色卡不等于存档。** 停止生成并确认保存后，从 `D:/github/sillyTavern/data/default-user/` 私下备份并传输：

- `chats/`，以及若使用群聊的 `group chats/`、`groups/`：包含剧情、消息 swipe、元数据和 MVU。保留完整 JSONL，不抽取成纯文本。
- `settings.json`：扩展启用、Persona、世界书绑定、模型连接设置；它可能包含敏感值，只经私有渠道迁移，不能进 Git。
- `OpenAI Settings/`、`context/`、`instruct/`、`sysprompt/`、`reasoning/`、`QuickReplies/`：实际使用的预设与快捷命令。
- `characters/`、`worlds/`、`User Avatars/`、`user/`、`extensions/`：若完整迁移用户目录，这些一起保留。已快照的正式卡与六书可单独恢复，其他角色／书不包含在本次快照内。
- 浏览器 localStorage／IndexedDB 中需要的个人设置另行导出或重设；只复制服务端 data 不会带走它们。

`secrets.json`、API key、连接 token、账号凭据、服务端 `config.yaml` 里的认证信息不要推 Git；在云端使用私有 secret 配置或重新在酒馆连接界面输入。保持目录仅由服务账户读写。先私下备份整份 data，再对敏感配置作迁移处理，避免用空配置覆盖旧数据。

本机还安装了 shujuku、ST-BaiBai-Tools 和 st-901-play。它们不属于上述 `/901-opening-combat/`＋MVU 链路的必需依赖。st-901-play 是另一套连接客户端，默认指向 `http://127.0.0.1:8790`，连接 token 存于浏览器 localStorage；其服务端不在本次两个仓库中。**云端浏览器里的 127.0.0.1 指浏览器所在机器**，若要运行这套独立服务，还需单独迁移对应后端、改 URL 和 token，不能把“插件已复制”当成后端已就绪。

## 网络与启动

SillyTavern 默认服务端口为 8000，可按云环境 config.yaml 调整。建议绑定本机并通过 SSH 隧道访问：

```bash
# 云服务器
cd /srv/901/SillyTavern
npm start
# 本地电脑另一个终端
ssh -L 8000:127.0.0.1:8000 USER@CLOUD_HOST
```

浏览器访问 `http://localhost:8000`。若使用公网域名，则通过 HTTPS 反向代理与实际认证保护访问，保持 `/api/`、静态 `/901-opening-combat/` 和流式响应正常转发。不要直接暴露无认证的聊天／文件服务。出站需要 GitHub（克隆）、npm/Python 源（安装）、Gemini 实际端点（服务端）和 MVU CDN（浏览器）；若使用自建代理，迁移其真实连接配置，不照抄 localhost 地址。

迁移后先打开已复制的**原聊天**，核对保存修订、人物伤势／能量／XP、世界书绑定与角色脚本。不要点击初始化，不要用隔离测试的满状态覆盖原聊天。新的模型 API 连接需在云端确认可用配额；本次存档没有发送任何新模型请求。

## 开发状态与接续

见 [本次开发存档](../work/replay_research/six_books_20261023/checkpoint-20261024.md)。269 份双版本合同已创建，但只有 41 份法术基础程序，且仍有未实现条款；当前 fullyVerified=0。开发版不是全资源可执行发布版。

用户要求停止后，没有再执行测试。停止之前最近一次完整结果为 425 项中 424 通过、1 项历史卡片 description 快照漂移失败，日志随存档保存。云端部署和浏览器端到端尚未验证。

项目技能在 `.agents/skills/`，包括 tavern-cards 和 901 项目技能。它们供作者工作使用，不是运行酒馆的服务依赖；Codex／Sol 账号与云端工作工具另行配置。续做时阅读 AGENTS.md 与上述开发存档，保持 T0／D3、阅读定义／实际持有的边界。
