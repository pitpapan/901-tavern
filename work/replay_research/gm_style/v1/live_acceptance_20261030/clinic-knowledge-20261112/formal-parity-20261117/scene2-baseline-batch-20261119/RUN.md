# 第二场景基线｜发送与封存

2026-11-19。总控审核冻结材料后，用户授权采用已审阅的完整请求，最多 8 次正文调用，失败计入，自动重试关闭。[授权记录](authorization.json)

本批尝试 **8/8**，技术完成 **8**，技术失败 **0**，进入评阅包的完整正文 **8**。固定同一个端点和请求模型，实际返回模型标识为 `gemini-3.8-flash-n`。达到事先固定的尝试上限，批次已封账。本批未用 0，封账后可用 0，累计 **572**。[逐次账本](run.json)

| 调用 | 请求 | HTTP | 结束标识 | 返回模型 | 技术结果 | 保存的响应 |
| ---: | --- | ---: | --- | --- | --- | --- |
| 565 | [实际请求](565.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](565.raw-response.bin) |
| 566 | [实际请求](566.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](566.raw-response.bin) |
| 567 | [实际请求](567.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](567.raw-response.bin) |
| 568 | [实际请求](568.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](568.raw-response.bin) |
| 569 | [实际请求](569.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](569.raw-response.bin) |
| 570 | [实际请求](570.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](570.raw-response.bin) |
| 571 | [实际请求](571.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](571.raw-response.bin) |
| 572 | [实际请求](572.request.json) | 200 | stop | gemini-3.8-flash-n | 完整 | [原始响应](572.raw-response.bin) |

每次发送前先存实际请求并记账。请求都是 111147 字节，SHA-256 为 `e25f6a9b25675f408ede511c0c5c958ef49c8dae13abab0e59b78ad5a3710c29`。冻结 v3 规则 SHA-256 为 `b5cbf03edd0a7aab524843010c3e5e9e035b9f0be29dda050216da0e6fa37de8`。分类、抽取、模型审稿及重试均为 0。固定 `NO_CHECK` 取自早先正文条件，新问题未实测分类。[准备审核](../scene2-v3-preparation-20261119/PREPARATION.md)

封账后逐字复制规则、输入摘录和空表，将所有技术上可供评阅的完整正文与随机匿名编号编成同一份随机序列。原始响应、请求、编号对应关系和发送顺序存于管理侧。[匿名正文](reviewer-packet/responses.json) · [仅管理者使用的映射](management/anonymous-map.json)

已核对 448 份既有材料哈希。家属旧案仍只作离线控制，本批没有语义初判、运行时接收、写入存档、代码修改或部署。后续独立评阅由总控安排。
