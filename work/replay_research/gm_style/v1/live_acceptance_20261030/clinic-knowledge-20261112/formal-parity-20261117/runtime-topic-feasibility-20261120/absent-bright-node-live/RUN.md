# 布莱特缺席单组 · 实测执行记录

2026-11-20。按用户本批具体授权执行 621–630。尝试 10，收到 HTTP 10，完整正文 10。全部为 HTTP 200、finish_reason=stop，返回模型 gemini-3.8-flash-n。技术失败、重试及未尝试均 0。账本已封存，累计 630，余额 0。 [用户授权](authorization.json) · [逐槽账本](run.json)

十槽均向原端点发送同一份 109191 字节完整冻结请求，SHA-256 ed088edaa46a54aa6df67cd0eadb3a4db83bd60c41647632c42ce0f93fb465f9。Windows 主机沿前次成功的 Node HTTPS 路径，使用 agent:false、开启 TLS 证书验证，逐槽先复制冻结 Buffer 并保存登记。没有插入前槽正文。 [冻结排程](../absent-bright-preparation-20261120/plan.json) · [实测命令使用的发送脚本](send-frozen.cjs)

| 次数 | HTTP / 结束 | 耗时（毫秒） | 实际输入与响应 |
| --- | --- | --- | --- |
| 621 | 200 / stop | 5246 | [请求](621.request.json) · [原始响应](621.raw-response.bin) · [正文](621.content.txt) |
| 622 | 200 / stop | 6323 | [请求](622.request.json) · [原始响应](622.raw-response.bin) · [正文](622.content.txt) |
| 623 | 200 / stop | 4694 | [请求](623.request.json) · [原始响应](623.raw-response.bin) · [正文](623.content.txt) |
| 624 | 200 / stop | 4901 | [请求](624.request.json) · [原始响应](624.raw-response.bin) · [正文](624.content.txt) |
| 625 | 200 / stop | 5699 | [请求](625.request.json) · [原始响应](625.raw-response.bin) · [正文](625.content.txt) |
| 626 | 200 / stop | 5331 | [请求](626.request.json) · [原始响应](626.raw-response.bin) · [正文](626.content.txt) |
| 627 | 200 / stop | 4357 | [请求](627.request.json) · [原始响应](627.raw-response.bin) · [正文](627.content.txt) |
| 628 | 200 / stop | 4889 | [请求](628.request.json) · [原始响应](628.raw-response.bin) · [正文](628.content.txt) |
| 629 | 200 / stop | 4231 | [请求](629.request.json) · [原始响应](629.raw-response.bin) · [正文](629.content.txt) |
| 630 | 200 / stop | 3988 | [请求](630.request.json) · [原始响应](630.raw-response.bin) · [正文](630.content.txt) |

每份实际输入与冻结件逐字节相同，保存正文与原始响应中的字段完全相同。核验覆盖 47 份准备和上一批材料、171 份旧材料、4 份相关产品文件、288 份正式文件、4 个旧隔离存档、5 份隔离运行文件、2 个既有日志原前缀，以及新隔离分支和已恢复的临时卡、捕获配置，均无不符。 [技术核验](verification.json)

分类沿用历史 547 的固定本地结果。没有新增分类、抽取或外部审稿调用，也没有把试验正文写入剧情、保存为获知或部署。单组最多提供该固定场景中的独立样本观察。无空投影对照。

执行方已封存 [初判原文](reviews/narrative-initial.md) 和 [JSON](reviews/narrative-initial.json)，待总控先读正文再比较。

初判 MD SHA-256 `dc37fb77f544c06cd72b615d58cf4305fe689a79503d613b6fd92d5334cd5f9e`。JSON SHA-256 `9cf74180da9a4b5f07761e0d8478f5c2278955a5db722a0b948658b694d9f815`。
