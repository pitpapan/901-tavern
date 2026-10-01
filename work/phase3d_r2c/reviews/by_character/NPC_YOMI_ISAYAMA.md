# 谏山黄泉

> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。

## 1. 身份

档案 ID：`NPC_YOMI_ISAYAMA`；状态：`existing`；类型：`npc`。

- 谏山黄泉是年轻的除灵师与太刀手。。  
  追踪：`IDENTITY_YOMI_ISAYAMA_IDENTITY`；来源：`设定 人物/人物卡资料集_叙事检索版.md:谏山黄泉`

## 2. 人物背景

- 人物参考记载谏山黄泉被奈落收养、与神乐一同长大并受除魔训练；她曾与饭纲纪之订婚而后解除婚约，失去奈落与狮子王，并被三途河重创后获得杀生石提议。；证据层：人物背景。  
  追踪：`BACKGROUND_CLAIM_YOMI_REFERENCE_BACKGROUND_1`；来源：`设定 人物/人物卡资料集_检索版.md:636-660`、`设定 人物/人物卡资料集_叙事检索版.md:64-77`

## 3. 人格、价值观、行为模式

### 核心人格

- 人物资料把谏山黄泉描述为冷静、坚忍。；证据层：角色信念。  
  追踪：`PERSONA_YOMI_ISAYAMA_COMPOSURE`；来源：`设定 人物/人物卡资料集_叙事检索版.md:谏山黄泉（lines 64-85）`

## 4. 动机

- 没有足够来源支持独立动机；不从参与事件或结果反推原因。

## 5. 目标

- 没有足够来源支持具体目标；历史行动不自动延续为当前目标。

## 6. 主要经历时间线

### P1-002 — 疯狂魔法师余波

角色以“participant”参与；老村医依据手稿配制解药；御临风与布莱特经历创伤性噩梦，黄泉与雅儿醒来，队伍决定前往帝都报信。

角色作用：participant。
人物后果：御临风对二五仔仍有强烈敌意。；布莱特仍牵挂孤儿院。；雅儿中毒状态得到处理。；老村医提供九雪医馆方向。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P1_002_ANTIDOTE_NIGHTMARES_DEPARTURE`；story_order `P1-002`；Canon 层 `original_campaign`。
证据：`extracted-first/1/posts.jsonl post 816119`、`extracted-first/1/posts.jsonl post 816161`、`extracted-first/1/posts.jsonl post 816286`

### P1-003 — 疯狂魔法师余波

角色以“participant”参与；黄泉得知边关被破并同行；布莱特与御临风继续审问二五仔，二五仔承认利用山贼与毒害雅儿，随后引发爆炸，队伍救出村医并抵达帝都。

角色作用：participant。
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

角色以“actor”参与；布莱特雇人送信；御临风经下水道误入女澡堂后在人群中制造混乱脱身；黄泉潜入协会并斩杀怪眼队长。

角色作用：actor。
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

### P1-017 — 皇宫朝见

间接但人物连续性关键：帝与八柱将接见队伍；威廉以孔雀和法印检查御临风，确认其记忆与魔力异常，悠悠的空间龙身份、诅咒与风险进入帝国高层审议。

角色作用：indirect continuity subject。
人物后果：御临风的异常记忆/魔力被检测。；悠悠处于受限制状态。；帝国高层获得关于御临风异常和悠悠身份的信息。
未决边界：检测结果不证明所有记忆异常的单一原因。

追踪：event_ref `EVENT_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION`；story_order `P1-017`；Canon 层 `original_campaign`。
证据：`extracted-first/21/posts.jsonl post 846113`、`extracted-first/22/posts.jsonl post 846373`、`extracted-first/22/posts.jsonl post 846645`、`extracted-first/22/posts.jsonl post 846744`

### P1-020 — 魔物之盒灾变

角色以“witness”参与；布莱特夜间撞见携带魔物之盒的男子并呼救；男子在卫兵接近时打开盒子，魔物之眼投影笼罩帝都，引发全城恐惧。布莱特夺盒后被重创，事件随后被帝国力量暂时控制。

角色作用：witness。
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

### P2-004 — 宅邸诱饵计划

角色以“participant”参与；艾利等人围绕宅邸、诱饵与战术资源主动设局，准备截击古雷姆林。

角色作用：participant。
人物后果：没有由中央事件单独确认的角色专属后果。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P2_004_BAIT_PLAN_PREPARATION`；story_order `P2-004`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl post 868902`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl post 895388`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl post 900474`

### P2-005 — 宅邸战与追击失败

角色以“combatant”参与；御临风在宅邸战中斩断古雷姆林脚筋并临阵悟出正十七；艾利、黄泉、诺斯莉加入围攻，但古雷姆林挟持艾利、制造魔偶后逃脱。御临风在追击失败后死亡。

角色作用：combatant。
人物后果：没有由中央事件单独确认的角色专属后果。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P2_005_GREMLIN_MANSION_BATTLE`；story_order `P2-005`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl post 902068`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl post 908892`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl post 913039`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl post 913595`

### P2-012 — 离都与梦境入口

角色以“participant”参与；队伍离开帝都，在黑龙、龙族与帝国战局压力下进入远行，并在旅途中接近新的梦境。

角色作用：participant。
人物后果：没有由中央事件单独确认的角色专属后果。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P2_012_DEPARTURE_TO_DREAM`；story_order `P2-012`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 10/posts.jsonl post 923420`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 10/posts.jsonl post 924043`

### INTERLUDE-P2-001 — 现代游戏梦境

角色以“participant”参与；队伍进入具有校园、尼克弗瑞等现代要素的游戏化梦境；黄泉拥有独立分线，胜利条件与 True End 并不等同。

角色作用：participant。
人物后果：没有由中央事件单独确认的角色专属后果。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_INTERLUDE_P2_001_GAME_DREAM_OPENING`；story_order `INTERLUDE-P2-001`；Canon 层 `special_interlude`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 10/posts.jsonl post 924534`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 10/posts.jsonl post 928066`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 11/posts.jsonl post 940879`

### INTERLUDE-P2-003 — 现代游戏梦境

角色以“participant”参与；队伍以飞行航母攻入腾讯大厦核心，操真晴人与容器问题将悠悠置于危险位置；六百万人命代价与银色巨龙意象压向终局。

角色作用：participant。
人物后果：没有由中央事件单独确认的角色专属后果。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_INTERLUDE_P2_003_TOWER_ASSAULT`；story_order `INTERLUDE-P2-003`；Canon 层 `special_interlude`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 13/posts.jsonl post 952603`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 13/posts.jsonl post 955280`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 13/posts.jsonl post 956349`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 13/posts.jsonl post 956353`

### P2-021 — 龙族典礼与暗杀

角色以“challenger”参与；悠悠以空间龙族族长身份居于典礼中心；御临风触碰石台后显出惊人魔力量与稀薄龙族血脉并获先祖祝福。达芬奇密码过程中，御临风触碰肯达碰过的牌后失去听觉与视觉并昏倒，典礼中断。

角色作用：challenger。
人物后果：悠悠以空间龙族族长身份被公开置于典礼中心；御临风作为其未婚夫接受龙王审视。；御临风经石台显示惊人魔力量与稀薄龙族血脉，并获得先祖祝福。；御临风在牌局中失去听觉、视觉并昏迷；后续未发现持续身体损伤。；龙族与帝国确认发生疑似暗杀，但施术者、机制与肯达是否知情均未确定。
未决边界：下毒或施法者身份、机制及肯达是否知情均未在当场确认。

追踪：event_ref `EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION`；story_order `P2-021`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl post 974791`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl post 984627`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl post 987209`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl post 987239`

## 7. 关系时间线

### PC_YU_LINFENG — campaign companion

- 与御临风等人同行进入帝都线并共同参与战斗。（`MILESTONE_CLAIM_YOMI_ISAYAMA_RELATIONSHIP_EVENT_P1_003_TRAITOR_INTERROGATION_CITY_ARRIVAL`；证据层：实际事件）
- 当前立场：未知；不从历史合作推断当前忠诚或义务。

## 8. 能力 / 身份 / 状态变化

- P1-017：封印解除并可与乱红莲沟通（类型 `weapon_unsealing`；持续性 `persistent`；不确定性 `confirmed`；`TRANSITION_CLAIM_YOMI_LION_KING_TRANSITION_EVENT_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION`）
  - 边界：R1A-2A reviewed atomic realization; no present state or future conduct is inferred.

## 9. 知识时间线

- 没有足够证据形成独立知识条目；世界事实与在场不等于角色知情。

## 10. D3 当前状态

没有足够的角色专属 D3 证据；当前状态保持未知/空，不从历史或 Transition Canon 反推。
- D3 来源：无角色专属来源

## 11. 未解决问题 / 禁止推断

- 未解决：稳定人格、价值排序与跨情境声线证据不足。
- 未解决：D3 精确位置、即时议程与当前目标未知。
- 禁止推断：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。（`CONSTRAINT_YOMI_ISAYAMA_EVIDENCE_BOUNDARY`）

## 12. 与旧 Profile 相比的变化

- `CLAIM_YOMI_ISAYAMA_IDENTITY` → `MIGRATED` → `IDENTITY_YOMI_ISAYAMA_IDENTITY`：谏山黄泉是年轻的除灵师与太刀手。
- `CLAIM_YOMI_REFERENCE_BACKGROUND` → `MOVED_TO_BACKGROUND` → `BACKGROUND_CLAIM_YOMI_REFERENCE_BACKGROUND_1`：人物参考记载谏山黄泉被奈落收养、与神乐一同长大并受除魔训练；她曾与饭纲纪之订婚而后解除婚约，失去奈落与狮子王，并被三途河重创后获得杀生石提议。
- `CLAIM_YOMI_LION_KING_TRANSITION` → `SPLIT` → `TRANSITION_CLAIM_YOMI_LION_KING_TRANSITION_EVENT_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION`、`TIMELINE_YOMI_ISAYAMA_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION`：帝都阶段，狮子王被归还时封印已解除，黄泉可以接触并与剑中灵体乱红莲沟通。
- `CLAIM_YOMI_ISAYAMA_COMPOSURE` → `RETAINED_AS_PERSONA` → `PERSONA_YOMI_ISAYAMA_COMPOSURE`：人物资料把谏山黄泉描述为冷静、坚忍。
- `RELATIONSHIP_YOMI_ISAYAMA_YU_LINFENG` → `MOVED_TO_RELATIONSHIP` → `RELATIONSHIP_YOMI_ISAYAMA_YU_LINFENG`：campaign companion
- `CLAIM_YOMI_ISAYAMA_RELATIONSHIP` → `MOVED_TO_RELATIONSHIP` → `MILESTONE_CLAIM_YOMI_ISAYAMA_RELATIONSHIP_EVENT_P1_003_TRAITOR_INTERROGATION_CITY_ARRIVAL`：与御临风等人同行进入帝都线并共同参与战斗。
- `CONSTRAINT_YOMI_ISAYAMA_EVIDENCE_BOUNDARY` → `MIGRATED` → `CONSTRAINT_YOMI_ISAYAMA_EVIDENCE_BOUNDARY`：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。

## 13. 来源与追踪

- migration package：`work/phase3d_r2c/migration_packages/NPC_YOMI_ISAYAMA.json`
- candidate：`work/phase3d_r2c/candidates/by_profile/NPC_YOMI_ISAYAMA.json`
- source profile：`work/phase3d_recall/repaired_candidates/NPC_YOMI_ISAYAMA.json`
- 输入类别：`old_claims`、`direct_temporal_links`、`indirect_continuity_events`、`revelations`、`event_audits`、`retention_records`、`discoveries`、`d3_state`、`worldbook_references`
- schema：`2.0`；生成器：`scripts/build_phase3d_r2c.py`。
