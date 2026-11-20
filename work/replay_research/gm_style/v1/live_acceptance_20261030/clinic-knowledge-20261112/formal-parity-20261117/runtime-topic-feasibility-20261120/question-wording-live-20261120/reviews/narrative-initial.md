# 问句对照｜叙事初判封存

本批8个冻结槽均在 TLS 证书校验阶段失败，没有 HTTP 状态或正文。每次按失败计入，未重试。8份请求文件保留在本批，已逐字节核对冻结件，未取得原始响应字节。累计账面尝试608，余额0，已封账。[授权记录](../authorization.json) · [逐槽账本](../run.json) · [冻结排程](../../question-wording-preparation-20261120/plan.json)

发送程序本轮用了 Python HTTPS，未复用上批成功的 Node HTTPS 路径。首槽出现证书校验失败后，程序继续尝试了后续七个冻结槽。记录只保留错误类型，无法确定证书校验的具体原因。此次没有开启新额度、改端点或关闭证书验证。

| 调用账号 | 条件 | 问法 | 技术状态 | 初判 |
| --- | --- | --- | --- | --- |
| [601](../601.request.json) | before | original | TLS 证书校验失败 | 无正文可评分 |
| [602](../602.request.json) | received-huang | neutral | TLS 证书校验失败 | 无正文可评分 |
| [603](../603.request.json) | received-bright | original | TLS 证书校验失败 | 无正文可评分 |
| [604](../604.request.json) | reopened-bright | neutral | TLS 证书校验失败 | 无正文可评分 |
| [605](../605.request.json) | received-huang | original | TLS 证书校验失败 | 无正文可评分 |
| [606](../606.request.json) | before | neutral | TLS 证书校验失败 | 无正文可评分 |
| [607](../607.request.json) | reopened-bright | original | TLS 证书校验失败 | 无正文可评分 |
| [608](../608.request.json) | received-bright | neutral | TLS 证书校验失败 | 无正文可评分 |

F/N/U/X只适用于可评正文。没有正文可引用、判断来源或记录披露先后，八条技术失败均不填语义标签。旧U与原汇总保留。[逐项记录](narrative-initial.json)
