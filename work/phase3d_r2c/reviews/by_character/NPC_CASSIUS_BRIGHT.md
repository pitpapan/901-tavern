# 卡西乌斯·布莱特

> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。

## 1. 身份

档案 ID：`NPC_CASSIUS_BRIGHT`；状态：`existing`；类型：`npc`。

- 卡西乌斯·布莱特是失明的猎户与赏金猎人，也是以风感知环境的远距离射手。。  
  追踪：`IDENTITY_CASSIUS_BRIGHT_IDENTITY`；来源：`设定 人物/人物卡资料集_叙事检索版.md:卡西乌斯·布莱特`

## 2. 人物背景

- 人物参考记载布莱特的村庄与妻儿被害；他曾误认并追捕一名精灵，后来得知另有凶手，遭闪光魔法反击失明后学会以风感知，并以独行游击士及“雪漫之袭”之名活动。；证据层：人物背景。  
  追踪：`BACKGROUND_CLAIM_BRIGHT_BACKGROUND_1`；来源：`设定 人物/人物卡资料集_叙事检索版.md:112-134`、`设定 人物/人物卡资料集_检索版.md:1104-1135`

## 3. 人格、价值观、行为模式

### 核心人格

- 人物资料明确把他描述为耐心、寡言。；证据层：角色信念。  
  追踪：`PERSONA_CASSIUS_BRIGHT_PATIENCE`；来源：`设定 人物/人物卡资料集_叙事检索版.md:卡西乌斯·布莱特（lines 112-134）`
- 人物参考把布莱特明确写为嫉恶如仇，并会把握机会。；证据层：角色信念。  
  追踪：`PERSONA_BRIGHT_REFERENCE_TRAITS`；来源：`设定 人物/人物卡资料集_叙事检索版.md:112-134`、`设定 人物/人物卡资料集_检索版.md:1104-1135`
### 说话方式

- 其表达应保持寡言，不以持续宣告技能替代行动。；证据层：角色信念。  
  追踪：`PERSONA_CASSIUS_BRIGHT_TERSE`；来源：`设定 人物/人物卡资料集_叙事检索版.md:卡西乌斯·布莱特（lines 112-134）`

## 4. 动机

- 没有足够来源支持独立动机；不从参与事件或结果反推原因。

## 5. 目标

- 没有足够来源支持具体目标；历史行动不自动延续为当前目标。

## 6. 主要经历时间线

### P1-001 — 疯狂魔法师余波

角色以“actor”参与；布莱特继续搜查二五仔，御临风在废墟找到黄金圆盘；戒指嵌入圆盘后指向帝都，两人误触机关进入血腥地下室并取得手稿。

角色作用：actor。
人物后果：御临风与布莱特继续承担报信与搜证。；二人得知地下室存在研究痕迹并取得可供村医辨读的手稿。
未决边界：地下研究的全部主持者与目的在此时尚未完全确认。

追踪：event_ref `EVENT_P1_001_RUINS_COMPASS_CELLAR`；story_order `P1-001`；Canon 层 `original_campaign`。
证据：`extracted-first/1/posts.jsonl post 816001`、`extracted-first/1/posts.jsonl post 816014`、`extracted-first/1/posts.jsonl post 816045`、`extracted-first/1/posts.jsonl post 816112`

### P1-002 — 疯狂魔法师余波

角色以“participant”参与；老村医依据手稿配制解药；御临风与布莱特经历创伤性噩梦，黄泉与雅儿醒来，队伍决定前往帝都报信。

角色作用：participant。
人物后果：御临风对二五仔仍有强烈敌意。；布莱特仍牵挂孤儿院。；雅儿中毒状态得到处理。；老村医提供九雪医馆方向。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P1_002_ANTIDOTE_NIGHTMARES_DEPARTURE`；story_order `P1-002`；Canon 层 `original_campaign`。
证据：`extracted-first/1/posts.jsonl post 816119`、`extracted-first/1/posts.jsonl post 816161`、`extracted-first/1/posts.jsonl post 816286`

### P1-003 — 疯狂魔法师余波

角色以“actor”参与；黄泉得知边关被破并同行；布莱特与御临风继续审问二五仔，二五仔承认利用山贼与毒害雅儿，随后引发爆炸，队伍救出村医并抵达帝都。

角色作用：actor。
人物后果：黄泉选择加入报信行动。；御临风与布莱特在爆炸中受伤。；队伍获得二五仔对山贼与毒害的供述。
未决边界：二五仔与慕少艾本人不是同一身份，不得合并。

追踪：event_ref `EVENT_P1_003_TRAITOR_INTERROGATION_CITY_ARRIVAL`；story_order `P1-003`；Canon 层 `original_campaign`。
证据：`extracted-first/1/posts.jsonl post 816289`、`extracted-first/2/posts.jsonl post 816545`、`extracted-first/2/posts.jsonl post 816557`、`extracted-first/2/posts.jsonl post 816583`

### P1-004 — 九雪医馆与达卡斯疑云

角色以“participant”参与；御临风向军方报告边关陷落，但军方以达卡斯声称守住关卡为由拒绝；队伍转往九雪医馆，发现医馆被封、露露缇耶被捕。

角色作用：participant。
人物后果：御临风在警讯被拒后感到愤怒和无力。；露露缇耶处于被捕状态。；队伍得知医馆被控与刺杀达卡斯有关。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P1_004_WARNING_REJECTED_CLINIC_SEALED`；story_order `P1-004`；Canon 层 `original_campaign`。
证据：`extracted-first/2/posts.jsonl post 816648`、`extracted-first/2/posts.jsonl post 816665`、`extracted-first/3/posts.jsonl post 816708`、`extracted-first/3/posts.jsonl post 816730`

### P1-005 — 九雪医馆与达卡斯疑云

角色以“participant”参与；队伍向大妈询问医馆与露露缇耶；达卡斯带兵包围，大妈用烟雾脱离，御临风以兄弟会线索求取信任，三人分散逃亡。

角色作用：participant。
人物后果：大妈与雪老/兄弟会的联系成为队伍求援线索。；队伍确认达卡斯对医馆线进行具体追捕。
未决边界：大妈的正式姓名在此阶段未确认。

追踪：event_ref `EVENT_P1_005_DAKAS_SURROUNDS_AUNT`；story_order `P1-005`；Canon 层 `original_campaign`。
证据：`extracted-first/3/posts.jsonl post 816731`、`extracted-first/3/posts.jsonl post 816803`、`extracted-first/3/posts.jsonl post 817134`、`extracted-first/3/posts.jsonl post 817164`

### P1-006 — 帝都分线

角色以“participant”参与；布莱特雇人送信；御临风经下水道误入女澡堂后在人群中制造混乱脱身；黄泉潜入协会并斩杀怪眼队长。

角色作用：participant。
人物后果：御临风反省自己的鲁莽。；怪眼队长被黄泉斩首。；队伍取得进一步协会线索。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P1_006_SEWER_BATH_ASSOCIATION_FIGHT`；story_order `P1-006`；Canon 层 `original_campaign`。
证据：`extracted-first/3/posts.jsonl post 817167`、`extracted-first/4/posts.jsonl post 817447`、`extracted-first/4/posts.jsonl post 817612`、`extracted-first/4/posts.jsonl post 817665`

### P1-008 — 矮人铺突围

角色以“participant”参与；队伍在矮人铺补给时遭袭，大妈破顶带回昏迷雪老；艾利、佐间、阿德莱德及队伍共同迎战并救治雪老。

角色作用：participant。
人物后果：御临风用剑围保护同伴。；黄泉明确认可御临风的成长。；参与者形成共同救援与战斗经历。；雪老的重伤得到紧急治疗。
未决边界：佐间与阿德莱德尚无正式 Canon character entry。

追踪：event_ref `EVENT_P1_008_DWARF_SHOP_RESCUE`；story_order `P1-008`；Canon 层 `original_campaign`。
证据：`extracted-first/5/posts.jsonl post 818431`、`extracted-first/6/posts.jsonl post 819306`、`extracted-first/6/posts.jsonl post 820316`、`extracted-first/6/posts.jsonl post 821602`

### P1-009 — 边关真相

角色以“recipient”参与；右近说明黄祸龙狼率魔兽逼近帝都并请求队伍追踪达卡斯；雪老复盘边关陷落的战术变化，包括龙背投兵、反魔箭、盾阵、萨满强化、科多扰乱与强敌收尾。

角色作用：recipient。
人物后果：御临风意识到自己的边关记忆可能被改动。；布莱特安排孤儿院后事，黄泉适应新刀。；主要参与者得知魔兽战术已发生组织化变化。
未决边界：哈克的才能评价来自右近归因，不在此升级为全知事实。

追踪：event_ref `EVENT_P1_009_BORDER_TRUTH_AND_PURSUIT_MISSION`；story_order `P1-009`；Canon 层 `original_campaign`。
证据：`extracted-first/6/posts.jsonl post 821604`、`extracted-first/7/posts.jsonl post 822916`、`extracted-first/7/posts.jsonl post 824464`、`extracted-first/7/posts.jsonl post 824748`

### INTERLUDE-001 — 神秘海域：德雷克的宝藏

角色以“participant”参与；四人进入神秘海域幕间，登岛后从树屋地图、金鹿号标志与机械零件追索运输路线，并在洞穴方向发现英军遗骸和机关线索。

角色作用：participant。
人物后果：御临风以知识参与解谜；布莱特承担侦察；黄泉发现隐藏线索；姜子尤承担蛮力突破。；四人形成独立幕间共同探索经历。；队伍获得地图、金鹿号与运输路线信息。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_INTERLUDE_001_DRAKE_ISLAND_EXPLORATION`；story_order `INTERLUDE-001`；Canon 层 `special_interlude`。
证据：`extracted-first/7/posts.jsonl post 824837`、`extracted-first/8/posts.jsonl post 825632`、`extracted-first/9/posts.jsonl post 826738`、`extracted-first/10/posts.jsonl post 839294`

### INTERLUDE-002 — 神秘海域：德雷克的宝藏

角色以“participant”参与；队伍通过洞穴机关与怪物阻碍，罗盘在繁星下显出线索，并取得魔物之盒；盒子被说明可在多次开启后实现愿望但会释放其中魔物。

角色作用：participant。
人物后果：队伍取得可被带回主世界的封印物候选。；参与者获知魔盒的开启、沉睡与释放风险说明。
未决边界：幕间内说明只有在后续团录明确带回时才成为主世界连续性。

追踪：event_ref `EVENT_INTERLUDE_002_MONSTER_BOX_ACQUIRED`；story_order `INTERLUDE-002`；Canon 层 `special_interlude`。
证据：`extracted-first/10/posts.jsonl post 839296`、`extracted-first/12/posts.jsonl post 839991`、`extracted-first/13/posts.jsonl post 840842`、`extracted-first/13/posts.jsonl post 841022`

### INTERLUDE-003 — 神秘海域：德雷克的宝藏

角色以“participant”参与；追来的佣兵、龙吼与八头龙把队伍推入宝库终局；众人完成雕像光影谜题，刚特姆开放宝库，四人取得各自奖励后离开幕间。

角色作用：participant。
人物后果：御临风牺牲弃风剑状态推进谜题。；参与者获得各自奖励；具体带回范围逐项依赖后续证据。
未决边界：八头龙的身份不因外观或数量被自动等同于主世界龙王。

追踪：event_ref `EVENT_INTERLUDE_003_EIGHT_DRAGONS_VAULT_REWARDS`；story_order `INTERLUDE-003`；Canon 层 `special_interlude`。
证据：`extracted-first/13/posts.jsonl post 841025`、`extracted-first/15/posts.jsonl post 842163`、`extracted-first/16/posts.jsonl post 843232`、`extracted-first/16/posts.jsonl post 843976`

### P1-013 — 血与火后篇

角色以“participant”参与；队伍分路侦察：御临风、姜子尤与雪老查看风魔犬旧巢；布莱特与黄泉发现峡谷工兵布阵、魔兽军、黄祸龙狼及空间龙。

角色作用：participant。
人物后果：布莱特判断现场不适合直接狙杀。；队伍开始把空间龙纳入达卡斯/魔兽行动分析。
未决边界：此时队伍尚不知道空间龙就是悠悠。

追踪：event_ref `EVENT_P1_013_SPLIT_RECONNAISSANCE_SPACE_DRAGON`；story_order `P1-013`；Canon 层 `original_campaign`。
证据：`extracted-first/16/posts.jsonl post 843978`、`extracted-first/17/posts.jsonl post 843999`、`extracted-first/17/posts.jsonl post 844018`、`extracted-first/17/posts.jsonl post 844039`

### P1-014 — 血与火后篇

角色以“target”参与；达卡斯调动军队，布莱特与黄泉被卡泽追击；御临风等人与接应者会合，帝与八柱将的援军落场，凌迟伪装的达卡斯身份及计划败露。

角色作用：target。
人物后果：御临风濒死时仍传出空间龙位置信息。；布莱特交出麻痹匕首，黄泉以纵火牵制。；队伍的侦察成为帝国收网的一部分，但不是收网唯一主体。；参与者确认达卡斯身份与凌迟计划存在欺骗。
未决边界：卡泽等早期敌方角色需要独立 retention，而不能因后期消失而省略。

追踪：event_ref `EVENT_P1_014_DAKAS_PLOT_EXPOSED`；story_order `P1-014`；Canon 层 `original_campaign`。
证据：`extracted-first/17/posts.jsonl post 844064`、`extracted-first/18/posts.jsonl post 844648`、`extracted-first/19/posts.jsonl post 845112`、`extracted-first/19/posts.jsonl post 845600`

### P1-020 — 魔物之盒灾变

角色以“actor”参与；布莱特夜间撞见携带魔物之盒的男子并呼救；男子在卫兵接近时打开盒子，魔物之眼投影笼罩帝都，引发全城恐惧。布莱特夺盒后被重创，事件随后被帝国力量暂时控制。

角色作用：actor。
人物后果：布莱特在重伤和恐惧中产生明确后悔。；布莱特重伤昏迷。；露露缇耶留下心灵创伤并接受记忆处理。；御临风等人认出魔眼危险并采取闭眼/警告行动。
未决边界：此次开启没有证明魔物之眼获得最终自由。

追踪：event_ref `EVENT_P1_020_MONSTER_BOX_DISASTER`；story_order `P1-020`；Canon 层 `original_campaign`。
证据：`extracted-first/27/posts.jsonl post 859420`、`extracted-first/27/posts.jsonl post 859427`、`extracted-first/28/posts.jsonl post 859470`、`extracted-first/28/posts.jsonl post 859963`、`extracted-first/28/posts.jsonl post 859995`、`extracted-first/28/posts.jsonl post 860124`、`extracted-first/28/posts.jsonl post 860377`

### P1-022 — 第一部尾声

角色以“participant”参与；法场与护送任务线启动：沃西斯将公开凌迟/达卡斯阴谋，黄祸龙狼处刑牵出龙族交涉；哈克协调布莱特等人的秘密任务。并行线中出现白色魔法使设置试炼的传闻，直接连接第二部。

角色作用：participant。
人物后果：哈克开始承担明确行动协调职责。；部分角色获知白色魔法使试炼传闻；传闻本身不等于其全部目的已确认。
未决边界：白魔试炼传闻需要第二部原帖继续核验。

追踪：event_ref `EVENT_P1_022_EXECUTION_TAIL_HOOK`；story_order `P1-022`；Canon 层 `original_campaign`。
证据：`extracted-first/28/posts.jsonl post 862279`、`extracted-first/28/posts.jsonl post 862289`、`extracted-first/28/posts.jsonl post 862302`、`extracted-first/28/posts.jsonl post 862306`、`extracted-first/28/posts.jsonl post 862337`、`extracted-first/28/posts.jsonl post 862379`

### P2-008 — 法师塔惨案

角色以“rescuer”参与；A 的异常控制引发法师塔灾难，武赖以火柱制裁 A，宗近接管现场；布莱特和艾利参与救援。记录称平民死亡规模接近三千，法师死亡过百。

角色作用：rescuer。
人物后果：A 线从个人悲剧扩大为帝都级灾难；武赖、宗近、布莱特与艾利分别承担制裁或救援。；帝都法师力量因百余名法师死亡而受到重大损失。；帝都确认 A 的失控已造成大规模平民与法师死亡。
未决边界：A 异常控制的完整来源与责任边界仍需保留原文层次。

追踪：event_ref `EVENT_P2_008_MAGE_TOWER_MASSACRE`；story_order `P2-008`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl post 914301`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl post 914868`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl post 915324`

### P3-002 — 秘境入口与内战惨状

间接但人物连续性关键：骑兵以尖刀阵型穿过战场，御临风服用抗毒剂后进入龙族秘境，看见白魔、死亡之翼与龙族内战造成的惨状。

角色作用：indirect continuity subject。
人物后果：没有由中央事件单独确认的角色专属后果。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P3_002_SANCTUARY_ENTRY`；story_order `P3-002`；Canon 层 `original_campaign`。
证据：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl post 1041256`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl post 1042360`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl post 1042846`

## 7. 关系时间线

### PC_YU_LINFENG — campaign companion

- 车队休整时，布莱特与御临风共同轮流守夜。（`MILESTONE_CLAIM_CASSIUS_BRIGHT_RELATIONSHIP_EVENT_P1_002_ANTIDOTE_NIGHTMARES_DEPARTURE`；证据层：实际事件）
- 当前立场：未知；不从历史合作推断当前忠诚或义务。

## 8. 能力 / 身份 / 状态变化

- 没有独立迁移的重大能力、身份或状态变化。

## 9. 知识时间线

- 取得时间未知 / `TESTIMONY_HEARD` / 归因证词：古雷姆林转告布莱特为正义而死；遗骸中盲眼幼龙与布莱特是否具有身份连续性未获确认。（`KNOWLEDGE_CLAIM_BRIGHT_LATE_FATE_1`）
  - 归因：古雷姆林的转告与现场未决观察；来源角色：`None`。

## 10. D3 当前状态

没有足够的角色专属 D3 证据；当前状态保持未知/空，不从历史或 Transition Canon 反推。
- D3 来源：无角色专属来源

## 11. 未解决问题 / 禁止推断

- 未解决：除本候选已记录的人物参考明示特征外，完整价值排序、跨情境声线与 D3 人格变化仍无充分证据。
- 未解决：D3 精确位置、即时议程与当前目标未知。
- 禁止推断：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。（`CONSTRAINT_CASSIUS_BRIGHT_EVIDENCE_BOUNDARY`）

## 12. 与旧 Profile 相比的变化

- `CLAIM_CASSIUS_BRIGHT_IDENTITY` → `MIGRATED` → `IDENTITY_CASSIUS_BRIGHT_IDENTITY`：卡西乌斯·布莱特是失明的猎户与赏金猎人，也是以风感知环境的远距离射手。
- `CLAIM_CASSIUS_BRIGHT_HISTORY_1` → `MOVED_TO_TIMELINE` → `TIMELINE_CASSIUS_BRIGHT_P1_020_MONSTER_BOX_DISASTER`：布莱特在帝都小巷撞见携带魔物之盒的人后呼救，并守住现场等待夜巡士兵。
- `CLAIM_BRIGHT_BACKGROUND` → `MOVED_TO_BACKGROUND` → `BACKGROUND_CLAIM_BRIGHT_BACKGROUND_1`：人物参考记载布莱特的村庄与妻儿被害；他曾误认并追捕一名精灵，后来得知另有凶手，遭闪光魔法反击失明后学会以风感知，并以独行游击士及“雪漫之袭”之名活动。
- `CLAIM_BRIGHT_EARLY_CAMPAIGN` → `MOVED_TO_TIMELINE` → `TIMELINE_CASSIUS_BRIGHT_P1_001_RUINS_COMPASS_CELLAR`、`TIMELINE_CASSIUS_BRIGHT_P1_013_SPLIT_RECONNAISSANCE_SPACE_DRAGON`、`TIMELINE_CASSIUS_BRIGHT_P1_014_DAKAS_PLOT_EXPOSED`：布莱特以游击士身份与御临风一行同行，并参与峡谷调查与战斗。
- `CLAIM_BRIGHT_LATE_FATE` → `SPLIT` → `TIMELINE_CASSIUS_BRIGHT_P3_002_SANCTUARY_ENTRY`、`KNOWLEDGE_CLAIM_BRIGHT_LATE_FATE_1`：布莱特在追查古雷姆林期间失踪；终局时古雷姆林颈部出现被认作布莱特的面容并留下关于其为正义而死的转告，随后该面容死亡。古雷姆林遗骸出现的盲眼幼龙是否与布莱特具有身份连续性，来源没有确认。
- `CLAIM_CASSIUS_BRIGHT_PATIENCE` → `RETAINED_AS_PERSONA` → `PERSONA_CASSIUS_BRIGHT_PATIENCE`：人物资料明确把他描述为耐心、寡言。
- `CLAIM_BRIGHT_REFERENCE_TRAITS` → `RETAINED_AS_PERSONA` → `PERSONA_BRIGHT_REFERENCE_TRAITS`：人物参考把布莱特明确写为嫉恶如仇，并会把握机会。
- `CLAIM_CASSIUS_BRIGHT_TERSE` → `RETAINED_AS_PERSONA` → `PERSONA_CASSIUS_BRIGHT_TERSE`：其表达应保持寡言，不以持续宣告技能替代行动。
- `RELATIONSHIP_CASSIUS_BRIGHT_YU_LINFENG` → `MOVED_TO_RELATIONSHIP` → `RELATIONSHIP_CASSIUS_BRIGHT_YU_LINFENG`：campaign companion
- `CLAIM_CASSIUS_BRIGHT_RELATIONSHIP` → `MOVED_TO_RELATIONSHIP` → `MILESTONE_CLAIM_CASSIUS_BRIGHT_RELATIONSHIP_EVENT_P1_002_ANTIDOTE_NIGHTMARES_DEPARTURE`：车队休整时，布莱特与御临风共同轮流守夜。
- `CONSTRAINT_CASSIUS_BRIGHT_EVIDENCE_BOUNDARY` → `MIGRATED` → `CONSTRAINT_CASSIUS_BRIGHT_EVIDENCE_BOUNDARY`：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。

## 13. 来源与追踪

- migration package：`work/phase3d_r2c/migration_packages/NPC_CASSIUS_BRIGHT.json`
- candidate：`work/phase3d_r2c/candidates/by_profile/NPC_CASSIUS_BRIGHT.json`
- source profile：`work/phase3d_recall/repaired_candidates/NPC_CASSIUS_BRIGHT.json`
- 输入类别：`old_claims`、`direct_temporal_links`、`indirect_continuity_events`、`revelations`、`event_audits`、`retention_records`、`discoveries`、`d3_state`、`worldbook_references`
- schema：`2.0`；生成器：`scripts/build_phase3d_r2c.py`。
