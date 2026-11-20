# 医馆旧交动态投影候选

2026-11-20。候选仅安装在本目录的 `sandbox`。完成九条旧例复评、判据冻结、候选接线和零模型调用的原生酒馆验收。

## 已核对

- 原548与B1的557–564使用各自完整真实请求和原始正文。复评为1F、6N、2U、0X。保留旧判及A2八条。真人校准尚未进行。[旧例复评](retrospective-review.md) · [逐条记录](retrospective-review.json) · [运行时判据](runtime-rubric.md)
- 医馆可信目录声明受控话题。原 `generateStoryWithKnowledge()` 按现有 `context()` 中每人的有效投影加入说明。未知状态只列问题和谁无来源。已有来源时，继续使用本人既有的来源原文、范围和信念状态。测试中布莱特的 `belief: "rumor"` 保留，其余两人仍无获知。授予、来源校验、消息版本、MVU、保存、读回沿用既有实现。[候选补丁](runtime-candidate.patch) · [隔离入口](entry.isolated.js) · [隔离配置和原件哈希](setup.json)
- 候选新增用例2/2通过。原知情回归重定向到隔离候选的运行时、目录与MVU适配器，45/45通过，包括独立运行时从测试JSONL读回、重复回执和换选版本。[定向测试](topic-green.log) · [原知情回归](candidate-story-knowledge-tests.log)
- 试验沿用已封账的累计600和余额0，本轮外部模型调用0次。原30份受保护旧证据哈希一致。正式酒馆的288份基线文件有287份哈希一致，唯一差异为 `data/default-user/settings.json`。隔离验收未写入正式目录，未确定此设置差异的来源。[检验记录](verification.json)

## 原生酒馆验收

初次连接 `18132` 超时。在 Windows 主机重新启动隔离服务后，首页返回 HTTP 200。主聊天打开内置浏览器，Terra 直接绑定仍返回浏览器不可用，由主代理操作隔离标签。测试面板去掉在角色脚本内导入分支模块的做法，改用酒馆消息菜单原生创建分支，原 MVU 适配器接管子分支。正式酒馆在 `8000`。[隔离服务日志](evidence/host-start.stdout.log)

| 阶段 | 已核对的结果 | 记录 |
| --- | --- | --- |
| 获知前 | 三人均无对应来源。分类和正文请求有受控话题说明，均无来客标记和关系答案。 | [快照](evidence/before.json) · [正文完整请求](evidence/captures/before.narration.request.json) |
| 首次接收 | 子分支消息9、选项0保存真实测试告知。只有布莱特取得一条传闻，来源原文包含“钴蓝纸燕”。御临风和黄泉仍无来源。 | [快照](evidence/received.json) · [询问布莱特](evidence/captures/received-bright.narration.request.json) |
| 重复接收 | 相同回执返回 `already_applied`。两个回执指向同一操作和同一版本。仍只有一次消息到达、一次授予，保存字节保持一致。 | [回执](evidence/receipt-results.jsonl) · [快照](evidence/idempotent.json) |
| 保存并重开 | 从父分支重新载入同一子分支。保存快照、逐人投影、分类及正文完整请求体均逐字节一致。 | [快照](evidence/reopened.json) · [完整正文请求](evidence/captures/reopened-bright.narration.request.json) |
| 询问黄泉 | 从同一获知后快照单独进入普通入口。请求只改变问句。黄泉投影仍空，来源原文只出现于布莱特投影，没有先加入公开答复。 | [完整正文请求](evidence/captures/received-huang.narration.request.json) |

四次普通入口共截获四份分类与四份正文请求。分类由隔离服务返回沿用547的固定本地结果，正文均在发送前截停。布莱特重开前后的两个完整正文请求均为112905字节，SHA-256 为 `351af2e5759f5591867feafd25a878581237d7a0d73aeba6a1ebe49f434a02ec`。原始请求和对应记录均在 `evidence/captures`。测试结束后，子分支恢复到已确认接收、尚无生成问答的快照。

## 复现命令

在本目录执行。现有 `sandbox` 已应用补丁。若重新准备，请使用空白隔离副本并应用同一补丁，同时保留现有证据与初次准备记录。

```powershell
node --test ./topic.test.mjs
python -B ./verify-runtime.py
git -c core.longpaths=true -C ./sandbox apply --no-index --check --reverse (Join-Path $PWD 'runtime-candidate.patch')
& ./start.ps1
```

复跑既有知情测试可以直接改写临时测试副本的三个产品导入。原测试及原fixture在旧路径读取，运行时导入指向 `sandbox`。

```powershell
@'
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess

d = Path.cwd()
prior = d.parent
saved = (prior / "story-knowledge.test.mjs").read_text(encoding="utf-8")
old = (prior / "node-runtime/work/rules_engine").as_uri()
candidate = (d / "sandbox/public/901-opening-combat/work/rules_engine").as_uri()
assert saved.count(old) == 3
with TemporaryDirectory() as tmp:
    rebound = Path(tmp) / "story-knowledge.test.mjs"
    rebound.write_text(saved.replace(old, candidate), encoding="utf-8")
    raise SystemExit(subprocess.call(["node", "--test", str(rebound)]))
'@ | python -B -
```

## 浏览器复现顺序

原始捕获按独占文件写入。复现时使用空白证据目录及独立子分支。

1. 连接隔离实例，打开角色卡及隔离父分支，确认右上角显示“医馆知情 · 隔离捕获”。从末条消息的“消息操作”菜单创建原生分支，点“确认测试分支绑定”，保存 `before` 快照。
2. 关闭遮挡发送区的角色侧栏。设置捕获阶段 `before`，从普通聊天入口发送下方第一句。隔离后台在请求体组装后保留原始字节。分类返回本地固定 `NO_CHECK / ordinary_dialogue`，正文返回本地418。[本地捕获](offline-capture.js)
3. 切回隔离父分支。运行 `python -B ./restore-snapshot.py before pre-receive`，再用面板重开测试分支。点“仅布莱特接收测试告知”，保存 `received` 快照。再点同一按钮，保存 `idempotent`，核对同一回执不会增加授予、事件或改变状态。测试来客的原话含“钴蓝纸燕”，限定布莱特接收，作为传闻保留。来源须绑定实际存下的聊天、消息、选项版本与原文。[测试面板](controls.js) · [本地快照校验](offline-evidence.js)
4. 在 `received-bright` 阶段从普通入口输入同一布莱特问句。捕获后切回父分支，执行 `python -B ./restore-snapshot.py received pre-reopen`，重开同一测试分支，保存 `reopened` 快照。设置 `reopened-bright` 再发送同一句，逐字节比较两份实际发送前的完整 `messages` 和知情投影。当前约定不排除任何知识、历史或来源字段。
5. 切回父分支并执行 `python -B ./restore-snapshot.py received pre-huang`，重开同一测试分支。在 `received-huang` 阶段发送下列黄泉问句。核对两次获知后询问都从同一份 `received` 读回，没有布莱特已经公开回复的先行内容。

```text
御临风问布莱特：“若想向老馆主打听雪老的事，你知道他们有什么来往吗？”黄泉也在旁边。
御临风问黄泉：“若想向老馆主打听雪老的事，你知道他们有什么来往吗？”布莱特也在旁边。
```

话题由目录编写者选定，测试告知、确认接收、选分支和输入问题由操作者处理。逐人的话题说明、有效来源与信念状态由既有投影自动生成。本轮结论限于隔离接线和实存链路。正文表现、真人校准与生产验收仍未进行。
