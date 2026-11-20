# 四状态×原问／中性问｜Node 调用与封存

2026-11-20。新授权 8 次，609–616 依冻结顺序各执行一次。全部 HTTP 200、finish_reason=stop，实际返回模型标识 gemini-3.8-flash-n。完整正文 8，技术失败 0，重试 0。账面累计 616、余额 0，已封账。[授权](authorization.json) · [逐槽账本](run.json) · [冻结排程](../question-wording-preparation-20261120/plan.json)

复用 593–600 的 Node `https.request`（`agent:false`），证书验证开启，原始 Buffer 直接作为 POST 请求体。每槽先保存请求并登记再发送。未做额外联网预检。若遇共同连接错误或服务拒绝，发送程序会封账并列出未尝试槽。本批未触发该分支。

| 调用 | 槽 | HTTP | 结束标识 | 返回模型 | 实际请求与响应 |
| --- | --- | --- | --- | --- | --- |
| 609 | 1 | 200 | stop | gemini-3.8-flash-n | [请求](609.request.json) · [原始响应](609.raw-response.bin) · [正文](609.content.txt) |
| 610 | 2 | 200 | stop | gemini-3.8-flash-n | [请求](610.request.json) · [原始响应](610.raw-response.bin) · [正文](610.content.txt) |
| 611 | 3 | 200 | stop | gemini-3.8-flash-n | [请求](611.request.json) · [原始响应](611.raw-response.bin) · [正文](611.content.txt) |
| 612 | 4 | 200 | stop | gemini-3.8-flash-n | [请求](612.request.json) · [原始响应](612.raw-response.bin) · [正文](612.content.txt) |
| 613 | 5 | 200 | stop | gemini-3.8-flash-n | [请求](613.request.json) · [原始响应](613.raw-response.bin) · [正文](613.content.txt) |
| 614 | 6 | 200 | stop | gemini-3.8-flash-n | [请求](614.request.json) · [原始响应](614.raw-response.bin) · [正文](614.content.txt) |
| 615 | 7 | 200 | stop | gemini-3.8-flash-n | [请求](615.request.json) · [原始响应](615.raw-response.bin) · [正文](615.content.txt) |
| 616 | 8 | 200 | stop | gemini-3.8-flash-n | [请求](616.request.json) · [原始响应](616.raw-response.bin) · [正文](616.content.txt) |

实际请求全部与冻结件逐字节一致。完整响应的字节数和 SHA-256 均与账本一致，提取正文与响应内 content 一致。前一失败批次继续封账，冻结材料和旧失败记录共 27 份哈希保持。

分类沿用历史 547 的固定本地 NO_CHECK。本批新分类、抽取和外部审稿均为 0。人工确认的测试接收继续作为输入。未写入产品、正式剧情或存档，未部署或提交。[初判封存](reviews/narrative-initial.md) · [机器可读初判](reviews/narrative-initial.json)
