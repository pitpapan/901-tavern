# 受保护话题 A2｜调用与封存

2026-11-20。用户在固定 A2 最多 8 次方案之后回复「发送」。最初的自动审批在进程启动前拒绝，未占用次数。核对相邻原始消息后提交同一操作复核，通过后才启动。[授权与复核依据](authorization.json) · [冻结方案](../clinic-boundary-preparation-20261120/plan.json)

本批尝试 **8/8**，技术完成 **8**，技术失败 **0**，可评完整正文 **8**。实际返回模型标识 `gemini-3.8-flash-n`。达到固定的尝试上限，已封账。未用 0，关闭后可用 0，累计 **600**。[逐次账本](run.json)

| 调用与实际请求 | HTTP | 结束标识 | 返回模型 | 技术结果 | 响应 |
| ---: | ---: | --- | --- | --- | --- |
| [593](593.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](593.raw-response.bin) |
| [594](594.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](594.raw-response.bin) |
| [595](595.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](595.raw-response.bin) |
| [596](596.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](596.raw-response.bin) |
| [597](597.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](597.raw-response.bin) |
| [598](598.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](598.raw-response.bin) |
| [599](599.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](599.raw-response.bin) |
| [600](600.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](600.raw-response.bin) |

逐次先保存并登记实际请求，再发送。请求均为 111734 字节，SHA-256 为 `f2e85a5f08201998fd8fb947bf1cf83999f808435ae7ff41a0bb420df3c9b007`。冻结判据哈希为 `c5123f9793630af65f1a9a360f794678e6f961d76d016d4bb150f1d42f263392`。沿用 547 的 NO_CHECK。分类、抽取、外部模型审稿和重试均为 0。本批不验收新分类、保存重开或生产链。

已核对 577 份既有材料。匿名包中的完整 14 条实际消息按零基索引保留原角色、顺序和全文。正文按独立随机编号与顺序保留原文，技术记录和匿名映射另存。技术摘要无语义评分。[冻结判据副本](reviewer-packet/protected-topic-rubric.md) · [完整输入](reviewer-packet/messages.json) · [匿名正文](reviewer-packet/responses.json) · [管理映射](management/anonymous-map.json)
