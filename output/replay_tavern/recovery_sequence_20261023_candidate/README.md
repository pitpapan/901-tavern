# 药品与休息复合声明隔离验收

仅验证一次玩家声明“服下培元丹，然后长休八小时”。复用现有药品验收角色卡与运行时，新建独立合成聊天；正式剧情、原测试聊天和旧验收证据均不改写。初始完好2/B1/L6/A3、流风10/22、意志1/3，培元丹3颗。

预期：程序将服药和长休按顺序作为同一操作提交；服药扣一颗，长休后培元丹按A→L→B合计恢复力量5点，另自然恢复1B。最终完好8/L4、流风22/22、意志2/3、培元丹2、延迟药效为空、经过480分钟。正文须先服药再休息，并保留仍有严重伤害的事实。同楼重新生成及浏览器刷新均不得重复扣药、恢复、推进时间或增加操作。

准备脚本为`recovery-sequence-live-setup.mjs`、`recovery-sequence-live-inspect.mjs`、`recovery-sequence-live-verify.mjs`。`build-recovery.mjs --sequence`和`recovery-live-browser.mjs --sequence --interactive`均将新证据写入本目录，保留此前药品链的diagnostics与保存记录。仅完成准备不代表实际酒馆验收通过；结果以实际JSONL、界面截图和`sequence-verification-result.json`为准。

实际酒馆验收通过：只输入一次原句，首次模型返回两个有序步骤，作为1次操作、1次revision提交。培元丹3→2，完好8/B0/L4/A0、流风22/22、意志2/3、pending为空、clock480，其他库存不变。正文先写服药再写八小时睡眠，并明确“深处的创痛仍未彻底平复”。原生重新生成与浏览器刷新后的完整MVU均与首次结果相同；未再发送玩家声明，未重复扣药、恢复或推进时间。32个隔离部署文件哈希一致，模型保持原Gemini3.5FlashLite，世界书136条及UID不变。

首次结果保存在`sequence-first-response.jsonl`；刷新与重生成分别见`sequence-refresh.jsonl`和`sequence-regenerate.jsonl`，实际画面见`ui-sequence-first-result.png`、`ui-sequence-refresh.png`、`ui-sequence-regenerated.png`。首次请求完成后删除了旧提示中残留的单动作限制；最终文件部署哈希见`prompt-deploy-verification.json`，保留首次结果后在修正文件下验证刷新和原楼重新生成，没有为获取另一份结果再次调用模型。

已仅向正式`901-opening-combat`部署`recovery.mjs`、`adjudication-gate.mjs`、`replay-check.mjs`三个JS文件。`formal-opening-deploy.json`记录前后代码哈希及scene-binding、baseline保持不变的证据；未修改正式卡、聊天、当前态或模型设置。

实现侧最终116项定向测试通过，主任务另行复核相关检查。药C跨楼补充用途的窄修后，仅刷新最终gate/replay-check并核对哈希，见`formal-opening-final-refresh.json`；保留上述唯一原句的实际酒馆结果，未追加游戏声明或模型调用。
