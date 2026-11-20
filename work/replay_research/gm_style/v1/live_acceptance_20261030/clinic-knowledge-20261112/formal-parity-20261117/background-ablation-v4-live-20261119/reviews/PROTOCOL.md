# 独立评阅交接

只以相邻 reviewer-packet 目录中的 rubric-v4.0.md、rating-template.md、common-input.md、两份 input-*.md 和 responses.json 作为判定材料。每条回复用其 contextRef 指定的实际输入，加共同消息与历史；不要把另一份输入中独有的文字当作本条可用依据。按 responses.json 的数组顺序读完所有回复。

不读取管理映射、发送记录、旧实验、旧评分、其他评审文件或讨论。平台自动提供的执行指令仍须遵守，但不作为故事证据；如自动接触了额外材料，请披露。无需外部 API、网页或其他模型调用，不创建子代理，不改代码或输入。不要追求某种预期结果，也不要从输入差异猜出作者希望得到的评分。

严格采用冻结 v4。逐条给 P2、P1、整条标签和原文依据，记录交流形式、六项背景出现方式、明确 clean 及其他具体问题。U 写原因码、两种有文本根据的读法和所需信息。整条 X 时两主项留空；其余均用 F/N/U。引文必须逐字存在于对应回复，依据引用实际消息索引。作者知道、角色可用、问题或否定、推断与事实分开，不把背景命中直接当成 P2 失败或改善。

若实际输入摘录缺少会影响判定的材料，先向父任务说明需要的消息／内容范围，等待同等中性补充后再封存；不得自行读完整管理请求或查找旧结果。文本本身仍有歧义时，按规则留 U，不假设额外交谈来消歧。

每位评审只写父任务指定的 initial.md 和 initial.json，不能读另一位文件。Markdown用中文：按匿名编号列逐条标签、决定性原句与实际输入依据、U理由和六项背景表；可用紧凑表格，无需重复整篇原始正文。末尾分别按 contextRef 报计数，材料是否充分、接触范围及独立性限制。独立保存后立即报告父任务，初判不覆盖。

JSON 使用下述记录结构，方便原样比较；这是记录格式，不添加评分标准：

```text
{
  reviewer,
  rows: [{
    id, contextRef,
    p2, p1, overall,
    evidence: [{quote, speaker, inputBasis, explanation}],
    unresolved: [{code, reading1, reading2, needed}],
    communication: {
      contentBearing: [{quote, explainsKnowledge, backgroundMatch, inputBasis, explanation}],
      pureNegative: [{quote}],
      frequencyOnly: [{quote}]
    },
    backgroundItems: {
      familyLoss: {modes: [], quotes: [], inputBasis: [], explanation},
      granddaughter: {modes: [], quotes: [], inputBasis: [], explanation},
      damagedAbilities: {modes: [], quotes: [], inputBasis: [], explanation},
      rulersTreatment: {modes: [], quotes: [], inputBasis: [], explanation},
      retraining: {modes: [], quotes: [], inputBasis: [], explanation},
      orderService: {modes: [], quotes: [], inputBasis: [], explanation}
    },
    clean, cleanReason,
    otherIssues: [{quote, reason}]
  }],
  countsByContext: {},
  limitations: []
}
```

modes 只用规则已有的「无」「问／否定／假设或明确推断」「旁白」「作为黄泉已知」，可以多选，但「无」与其他方式互斥。六项都填；未出现用 modes:["无"]，引文及依据数组为空，可省略其 explanation。clean 和 explainsKnowledge 用布尔值。backgroundMatch 描述该交流内容在本条实际背景或历史中有对应、无对应、部分对应、待核，或尚未说出具体内容，写明依据；这与是否有角色获告分别判断。

按每份中性输入 contextRef 分别计数：可评数 T、整条 X、触及数 A=T−X、P2与P1的F/N/U、整条F/N/U/X、P2的F/A与(F+U)/A、X/T及P2 F/T。分母为0时留空并解释。另报三种交流形式各出现多少条、背景无对应的内容型交流情况、六项各方式命中多少条、明确clean多少条；背景每项每回复计一次，不累加同一项的重复措辞。JSON与Markdown的计数必须一致。只有可评原文在本包，技术尝试数由管理者另行报告，不自行推算。
