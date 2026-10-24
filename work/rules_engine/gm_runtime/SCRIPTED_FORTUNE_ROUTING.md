# Scripted fortune 门禁路由：限定范围完成记录

沿用五种裁定状态及原有分类阶段。上一轮已接入 `CHECK_REQUIRED`、秘密信息过滤和恢复；本轮只补齐可信授权与当前分支触发校验，不重建骰制或 MVU。

模型请求只能为：

```json
{"status":"CHECK_REQUIRED","reason":"已授权规则机会","request":{"kind":"scripted_fortune","opportunityId":"host-key"}}
```

`registerReplayGate({ scriptedOpportunities })` 将可信宿主配置交给现有 runtime。配置示例仅为测试，不安装默认事件：

```js
{
  'host-key': {
    sourceId: 'test-only/adopted-rule', opportunityId: 'window-1',
    authorized: true, resolved: false,
    trigger: {
      id: 'test-only/arrival', condition: '角色进入已定义的触发窗口',
      satisfied: true,
      anchor: { chatId: 'isolated-chat', messageId: 0, swipeId: 0 }
    },
    visibility: 'secret', rollType: 'phb_fortune',
    successCondition: { minimum: 1 }
  }
}
```

`sourceId` 指向宿主已采用的规则，`authorized` 必须明确为 true；非空触发 ID/条件、宿主确认的 satisfied，以及聊天/楼层/swipe 锚点必须同时成立。代码不从自然语言自动判定条件，也不允许模型提供这些授权字段。成功条件沿用已有 minimum 格式，不制定通用事件概率。只有完整、尚未提交且当前触发有效的机会ID才进入分类提示。

实际可执行范围：可信规则指定的 PHB 机运机会，经现有 gate → replay runtime → MVU 路径结算；保留原机运计算与同 source/opportunity 去重。相同操作的已提交结果优先恢复，触发窗口随后关闭也不重新投骰。此入口拒绝普通 D10 事件；底层适配器原有公开 D10 能力未扩展或重写。

未授权、触发不成立/不属于当前分支、条件不完整时不抽骰、不写状态，使用已有 needs_input/deferred 和门禁 NEEDS_INPUT/UNRESOLVED。秘密机会的待裁定状态不发布普通失败消息。已提交结果在可信 MVU 中保留；玩家投影为空，不进入公开骰池/选择面板。GM续述只得到紧凑的条件成否及可感知后果约束，不收到骰值和数值记录。秘密续述失败不在聊天中公告“发生过检定”。

尚未支持：自动触发检测、隐藏剧情生成、任意事件概率、新奖励/伤害等机械效果、场外NPC模拟、多写入方原子性。模型实际叙述是否遵守保密仍需未来真实响应验收；本轮没有浏览器或模型调用。

## 离线验证

30 项相关测试通过：`replay-check.test.mjs` 与 `adjudication-gate.test.mjs`。脚本通过 `node --check`。新增定点覆盖授权缺失、触发缺失/未满足/空条件、错误 swipe、机会列表过滤、合法结算、触发关闭后的恢复；复用已有门禁穿透、秘密输出过滤、拒绝模型自带规则及重复机会不重投测试。

本轮修改：`replay-check.mjs`、`replay-gate-script.example.js`、`replay-check.test.mjs` 和本说明。现有门禁路由已满足最小请求格式，无需重复改动。未修改正式卡、存档、Story Factory、世界书或评估案例。

## 评估基线与版本差异（只记录，不改数据）

评估最初 v1 的 C10 记录的是“runtime已支持，但门禁尚未接入”，因此使用 UNRESOLVED。**上一轮已将工作区 C10 改为 CHECK_REQUIRED**；这发生在本轮“保留原始基线、不改案例”要求之前。本轮不再改写或静默还原该文件，也不将当前文件冒称为最初 v1 原文。

本轮执行还要求可信配置具备 `authorized` 和当前分支 `trigger`；原案例中仅有事件数学规格的片段不能独立充当完整执行配置。未来比较应标明是原始路由前预期还是路由后预期，并区分语义分类与宿主输入是否齐备。

本轮开始与结束的评估文件 SHA-256 一致：

- `evaluation/adjudication-cases.json`: `EC0F02751011844DFA2925E86E5D5BD6DB98CA8D259834ED30509C87B55B3B38`
- `evaluation/README.md`: `B4DCF61EE1E76B409229A237AE712758023F6E4249A78EAA8EA9C5B57F1B16C4`
