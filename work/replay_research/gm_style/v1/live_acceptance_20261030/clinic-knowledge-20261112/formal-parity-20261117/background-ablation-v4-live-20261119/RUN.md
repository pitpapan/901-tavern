# 部分背景消融 v4｜执行与封存

2026-11-19。用户在总控审核后授权按两组各 10 槽、交错顺序使用同一原端点与请求模型。失败计入额度，自动重试关闭。[授权记录](authorization.json) · [冻结排程](../background-ablation-v4-preparation-20261119/schedule.json)

本批尝试 **20/20**，技术完成 **20**，技术失败 **0**，可供评阅 **20**。返回模型标识 `gemini-3.8-flash-n`。达到冻结排程上限，已封账。未用 0 次，封账后可用 0，累计 **592**。[逐次账本](run.json)

| 组别 | 计划槽 | 已尝试 | 技术完成 | 技术失败 | 可评正文 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 对照 | 10 | 10 | 10 | 0 | 10 |
| 部分消融 | 10 | 10 | 10 | 0 | 10 |

| 调用 | 槽／区组 | 组别 | HTTP | 结束标识 | 返回模型 | 结果 | 原始响应 |
| ---: | ---: | --- | ---: | --- | --- | --- | --- |
| [573](573.request.json) | 1／1 | 部分消融 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](573.raw-response.bin) |
| [574](574.request.json) | 2／1 | 对照 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](574.raw-response.bin) |
| [575](575.request.json) | 3／2 | 对照 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](575.raw-response.bin) |
| [576](576.request.json) | 4／2 | 部分消融 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](576.raw-response.bin) |
| [577](577.request.json) | 5／3 | 部分消融 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](577.raw-response.bin) |
| [578](578.request.json) | 6／3 | 对照 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](578.raw-response.bin) |
| [579](579.request.json) | 7／4 | 对照 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](579.raw-response.bin) |
| [580](580.request.json) | 8／4 | 部分消融 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](580.raw-response.bin) |
| [581](581.request.json) | 9／5 | 对照 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](581.raw-response.bin) |
| [582](582.request.json) | 10／5 | 部分消融 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](582.raw-response.bin) |
| [583](583.request.json) | 11／6 | 部分消融 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](583.raw-response.bin) |
| [584](584.request.json) | 12／6 | 对照 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](584.raw-response.bin) |
| [585](585.request.json) | 13／7 | 部分消融 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](585.raw-response.bin) |
| [586](586.request.json) | 14／7 | 对照 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](586.raw-response.bin) |
| [587](587.request.json) | 15／8 | 部分消融 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](587.raw-response.bin) |
| [588](588.request.json) | 16／8 | 对照 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](588.raw-response.bin) |
| [589](589.request.json) | 17／9 | 对照 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](589.raw-response.bin) |
| [590](590.request.json) | 18／9 | 部分消融 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](590.raw-response.bin) |
| [591](591.request.json) | 19／10 | 对照 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](591.raw-response.bin) |
| [592](592.request.json) | 20／10 | 部分消融 | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](592.raw-response.bin) |

每个槽位先保存 111147 字节实际请求并登记，再发送。对照哈希 `e25f6a9b25675f408ede511c0c5c958ef49c8dae13abab0e59b78ad5a3710c29`，部分消融哈希 `d138156cce1705496af7ee2409d63d23b158382cb26ced962d652cf0754644cd`。规则哈希 `ecfc332031f8a0406702a911933b08d3418c8b8c42a76e595aed911213aeff83`，排程哈希 `767a49bd332c3efc73882b62c1138f2a614d54c44b2f95dae3c7b1b2675a7aa2`。分类、抽取、模型审稿和重试均为 0。固定 NO_CHECK 沿用正文条件，本批未实测分类。

封账后编制同一份随机匿名正文序列和中性实际输入摘录。评阅包保留各自判断所需的上下文，正文或摘录可能使组别可推知。原始请求、响应、发送次序和匿名映射留在管理侧。已核对 494 份既有材料哈希。本文件只记录技术事实，尚无本批评分。

[匿名正文](reviewer-packet/responses.json) · [共同输入摘录](reviewer-packet/common-input.md) · [管理映射](management/anonymous-map.json)
