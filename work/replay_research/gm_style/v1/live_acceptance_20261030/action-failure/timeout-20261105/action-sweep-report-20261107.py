"""Summarize actual isolated runs; retain failures and distinguish coverage from correctness."""
import json
import subprocess
import sys
import lab

S = lab.L / 'action-sweep-20261107'
cases = json.loads((S / 'cases.json').read_text(encoding='utf8'))
subprocess.run([sys.executable, str(lab.H / 'action-sweep-capture-20261107.py')], check=True, capture_output=True)
rows = []
for case in cases:
    capture = S / (case['id'] + '-capture.json')
    assert capture.exists(), f"Not completed: {case['id']}"
    result = json.loads(capture.read_text(encoding='utf8'))
    assert result['pending'] is None or case['id'] == '13', case['id']
    rows.append({
        'id': case['id'], 'title': case['title'], 'expected': case['expected'],
        'actual': result['actual'], 'revision': result['revision'],
        'commandCoverage': set(case['expected']).issubset(result['actual']),
        'capture': str(capture), 'savedChat': str(S / (case['id'] + '-result.jsonl')),
    })

for id in ['63', '65']:
    result = json.loads((S / (id + '-capture.json')).read_text(encoding='utf8'))
    paid = [op['result']['receipt']['actions'] for op in result['operations']]
    assert paid == [{'move': 1}, {'standard': 1}], (id, paid)
    assert result['revision'] == 2
assert '障碍所标记的这一段已被破坏' in json.loads((S / '64-capture.json').read_text(encoding='utf8'))['text']
assert json.loads((S / '66-capture.json').read_text(encoding='utf8'))['text'].count('御临风｜借机攻击') == 1

before = json.loads((S / 'formal-before.json').read_text(encoding='utf8'))
after = lab.snapshot()
changed = [p for p in before.keys() | after.keys() if before.get(p) != after.get(p)]
settings = json.loads((S / 'app/data/default-user/settings.json').read_text(encoding='utf8'))
baseline = json.loads((S / 'settings.before.json').read_text(encoding='utf8'))
profile = settings['extension_settings']['__userscripts']['shujuku_v120__userscript_settings_v1']['shujuku_v120_profile_v1____default____settings']
profile = json.loads(profile) if isinstance(profile, str) else profile
protection = {
    'formalProtectedFiles': len(before), 'formalChanged': changed,
    'autoUpdateEnabled': profile['autoUpdateEnabled'],
    'modelUnchanged': settings['oai_settings'].get('custom_model') == baseline['oai_settings'].get('custom_model'),
    'sourceUnchanged': settings['oai_settings'].get('chat_completion_source') == baseline['oai_settings'].get('chat_completion_source'),
}
assert not changed, changed
assert not protection['autoUpdateEnabled'] and protection['modelUnchanged'] and protection['sourceUnchanged']
lab.put(S / 'preservation-check.json', protection)

commands = sorted({c for row in rows for c in row['actual'] if c not in ['enter', 'leave']})
report = {
    'date': '2026-11-07', 'port': 18116, 'formalInstalled': False,
    'scope': 'Installed opening/T0 player actions, adopted opening NPC and arena actions; not every resource prototype or every outcome combination.',
    'casesExecuted': len(rows), 'distinctCommands': commands, 'protection': protection,
    'regression': {'baseline': {'tests': 977, 'passed': 973, 'failed': 4}, 'targetedGroups': [34, 44]},
    'knownRemaining': [
        '65 first response invented an unadopted movement restriction and omitted steps. Zero operations committed; unchanged regeneration succeeded. Model misclassification is not eliminated.',
        '58 footer incorrectly says no defense settlement despite the recorded fortitude contest; mechanics and displacement are correct.',
        '55 footer omits the visible burrowing action because the actor is absent from final visibility; prose and underground state are correct.',
        '71 still describes torn skin despite actual converted 7B damage; 70 describes total action restriction despite grapple.pressed=false and remaining legal grapple actions. Minor invented approach/sheath details also remain.',
        'Four baseline failures reflect installed versus newer author-line feature differences (two perception/map and two frost-resource assertions). No unrelated feature installation was performed.',
    ],
    'cases': rows,
}
lab.put(lab.H / 'action-sweep-20261107.json', report)

notes = {
    '13': '无效测试初态：缺反冲 command；保留失败，41修正复测。',
    '19': '复现费用估算误拒绝；63、65修复复测。',
    '22': '机械破坏正确，旧报告错误；64复测。',
    '28': '人工初态缺状态基线；42补齐后复测。',
    '29': '急救后自动离开已结束战斗；不是额外玩家行动。',
    '38': '未命中，转换资格未消耗；47实际命中覆盖转换。',
    '39': '真实借机攻击成立，旧报告漏项；66复测。',
    '43': '已投骰的人工中途快照；只把续跳算作实时覆盖。',
    '47': '实际转换6B；旧正文有重复拔刀/伤势措辞偏差。',
    '49': '真实收弓再持弓，未换长刀；旧持握投影缺失，67复测。',
    '50': '实际魅惑生效，旧正文偏准备；68复测。',
    '51': '实际双螯夹持，旧正文漏夹持；70复测。',
    '52': '实际麻痹生效，旧正文偏准备；69复测。',
    '53': '模型选择分别松开两螯；两个合法自由动作，不是重放。',
    '54': '两次独立攻击，仅第一击消费一次场景转换。',
    '55': '入土机械与正文正确；末尾报告过滤掉消失的单位，留待处理。',
    '57': '实际 Phantom→空；正文仅概述变形。',
    '58': '实际强韧抵抗及2米推离正确；防御报告标签仍不准确。',
    '60': 'NPC另选择合法迅捷上箭，随后整轮校准；没有射箭。',
    '62': 'NPC重新持弓后另支付迅捷上箭；不是免费装填。',
    '65': '第一次模型套错规则，0操作；保留失败原件，原样重试后两步成功。',
    '70': '成功夹持已进入正文；实际未压制，正文“行动死死封锁”有过度描写，合法擒抱动作仍在。',
    '71': '已持刀状态承接；实际7B，正文仍写切开皮肉，伤势严重度叙事偏差未修复。',
}
text = f'''# 2026-11-07 动作集中实测与修复记录

本批已执行 {len(rows)} 个隔离用例（含原始失败、夹具修正及修复复测），实际命令覆盖 {len(commands)} 类。不能据此宣称零 bug 或穷尽全部随机结果。端口 **18116**，Terra High 判断和复核、主会话内置浏览器执行；仍用复制自正式设置的同一叙事模型。正式 8000 未安装本批修复。

## 范围与证据

- 使用开始时 8000 已安装运行时代码、正式六书及主持入口的隔离副本；试验角色、装备、位置和已有伤势均明确为非 Canon。
- 当前正式设置中的旧全局书启用状态予以保留；只在隔离配置清除旧全局/Persona关联并绑定正式六书。因此这是正式代码在隔离六书环境的动作测试，不是重写正式配置。
- 来源：现有 RE/PHB 已采用动作、已采用的初始角色/NPC/擂台工厂与现有回归初态。未新增规则裁定，未赋予御临风其他角色的能力。
- 自动回归：88 个测试文件，977 项中973通过、4失败；两项地图/感知和两项霜系资源差异由正式旧版本对照另一线新测试产生，保留结果，未混装其他线功能。另两项依赖完整作者构建目录的生成测试不计入977项。
- 本批修复在精确安装版依赖副本上的定向回归：34/34、44/44通过（两组有重叠，不相加当作独立测试数）。日志位于本机证据目录。
- 测试/落盘记录：`{S}`。每例有 seed、result JSONL 与 capture；65首次失败另存 `65-first-failed.jsonl`。未把真实模型输出或随机骰替换成预设成功。

## 本批修改

1. `gm_runtime/narrative.mjs`：区分模型估算费用和玩家明确费用，逐步核对逐字费用来源；不能归属的明确费用在执行前澄清。引擎继续负责实际支付，保留标准替代移动的规则；63、65核实移动3米后快步1.5米分别付移动和标准，总修订仅2次。
2. `combat/presentation.mjs`：破障报告使用结构破坏结果；借机攻击从已保存的嵌套结果列出，先攻击后移动，不重放或再收费；64、66复测。
3. 同一结果投影层：布莱特按实际武器模式及每步命令区分收起/重新持用；黄泉区分已持刀和在鞘；实际已生效的自身状态与成功夹持传入叙事，仍不暴露NPC内部数值、玩家私念或未公开指令。67—71为同题复测。

本批只修改上述两个作者模块及测试/记录，隔离实例安装相同模块。共享六书生成器、规划、清单和生成输出均未由本批改写。

## 仍需保留的限制

- 65第一次模型引用了未采用的“普通移动后不能五尺快步”规则，并只返回 clarification；没有任何动作落盘。原样重新生成成功，但不能称已消除模型偶发误判。
- 58盾推的末尾防御标签错误、55入土动作的末尾可见性过滤遗漏尚在；不影响已核对的动作、资源、位置和地下状态。
- 71实测实际是转换后的7B冲击伤害，正文仍写撕开皮肉、留下创口；70实际未进入压制，仍有合法擒抱动作，正文“行动死死封锁”有过度描写。这些叙事偏差尚未修复，另有细微接近、鞘口声等补写。本批修复明确的数据缺口，没有继续堆叠文风约束，不宣称自由叙事全部正确。
- 一次随机失败也算执行入口覆盖，不能代替成功分支；09未抓住，21没有隐藏目标，药物待休息效果未在本批继续休息。不同档位、成功/失败组合、全部武器变体不属于穷举证明。
- 需新增资格/场景的机制、规则物件、迦楼罗、未确认库存的戒指存取，以及后期/旧比较卡专属能力不擅自加到正式玩家；已有自动回归与本批真人模型覆盖分别记录。未适配或待裁定能力不记为通过。

## 保护核验

正式设置、角色、世界书、原聊天及存档、运行时共 {len(before)} 个文件：前后哈希无变化。隔离自动填表为关闭；叙事模型与接口来源未变。本批修复尚未提交或汇合到8000，等待用户采用，不动正式续玩档。

## 用例索引

“已覆盖”仅表示预期命令实际执行，不等同机械/叙事全部无误；原始缺陷和替代复测见备注。

|编号|用例|实际命令|结果/备注|
|---|---|---|---|
'''
for row in rows:
    note = notes.get(row['id'], '已覆盖' if row['commandCoverage'] else '未覆盖')
    text += f"|{row['id']}|{row['title']}|{', '.join(row['actual']) or '无'}|{note}|\n"
(lab.H / 'action-sweep-20261107.md').write_text(text, encoding='utf8')
print(json.dumps({'cases': len(rows), 'commands': len(commands), 'formalChanged': changed, 'report': str(lab.H / 'action-sweep-20261107.md')}, ensure_ascii=False))
