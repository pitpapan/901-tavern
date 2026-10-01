# 白色魔法使

> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。

## 1. 身份

档案 ID：`NPC_WHITE_MAGICIAN`；状态：`existing`；类型：`npc`。

- 白色魔法使是来自异世界的魔法使，并在 Campaign 内自称笛木奏。。  
  追踪：`IDENTITY_WHITE_MAGICIAN_IDENTITY`；来源：`设定 人物/妄想大陆设定集_检索版.md:123-130`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.md:414-440`

## 2. 人物背景

- 他曾被帝国囚禁于监狱塔，并在魔兽之潮期间借沐透协助脱离。；证据层：人物背景。  
  追踪：`BACKGROUND_WHITE_MAGICIAN_ESCAPE_HISTORY`；来源：`设定 人物/妄想大陆设定集_检索版.md:123-130`、`output/worldbook_source.jsonl#CHARACTER_WHITE_MAGICIAN`
- 设定资料把监狱塔囚禁与后来的活动分开记录：沐透协助白色魔法使逃离后，白魔给予沐透 Wizard Driver，并在该设定参考时点诱导大量幻魔出现。；证据层：人物背景。  
  追踪：`BACKGROUND_WHITE_MAGICIAN_WIZARD_PHANTOM_HISTORY`；来源：`设定 人物/妄想大陆设定集_检索版.md:123-130`
- 双方有过攻击、追问、情报交换与未解决的交涉。；证据层：人物背景。  
  追踪：`BACKGROUND_REL_WHITE_MAGICIAN_YU_HISTORY`；来源：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.md:414-479`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:#224-#229`

## 3. 人格、价值观、行为模式

### 核心人格

- 在与御临风的地下兵工厂追击战中，他主动自我介绍并提出信息交换。；证据层：观察到的行为。  
  追踪：`PERSONA_WHITE_MAGICIAN_NEGOTIATION_OBSERVED`；来源：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.md:414-479`
### 价值观

- 他公开把家人存活与理想乡描述为自己的核心追求。；证据层：角色信念。  
  追踪：`PERSONA_WHITE_MAGICIAN_ATTRIBUTED_VALUE`；来源：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:#226`、`current_state.md:D3`
### 说话方式

- 在已见谈判场景中，他常把交换条件、已知部分与理论解释分段陈述。；证据层：角色信念。  
  追踪：`PERSONA_WHITE_MAGICIAN_TERMS_AND_THEORY`；来源：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.md:414-479`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:#226-#228`
### 决策模式

- 在安兹与御临风抵达时，他释放被控制的龙王、取得魔宝石并转入交涉。；证据层：观察到的行为。  
  追踪：`PERSONA_WHITE_MAGICIAN_GEM_NEGOTIATION`；来源：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:#224-#228`

## 4. 动机

- 没有足够来源支持独立动机；不从参与事件或结果反推原因。

## 5. 目标

- 历史目标 / `historical`：公开声称要让家人存活并创造理想乡。（`GOAL_WHITE_MAGICIAN_PUBLIC_IDEAL_WORLD`）
- 当前目标 / `historical`：公开声称将暂时保持安静并进行研究。（`GOAL_WHITE_MAGICIAN_STATED_RESEARCH`）

## 6. 主要经历时间线

### P1-022 — 第一部尾声

角色以“absent_but_affected”参与；法场与护送任务线启动：沃西斯将公开凌迟/达卡斯阴谋，黄祸龙狼处刑牵出龙族交涉；哈克协调布莱特等人的秘密任务。并行线中出现白色魔法使设置试炼的传闻，直接连接第二部。

角色作用：absent_but_affected。
人物后果：哈克开始承担明确行动协调职责。；部分角色获知白色魔法使试炼传闻；传闻本身不等于其全部目的已确认。
未决边界：白魔试炼传闻需要第二部原帖继续核验。

追踪：event_ref `EVENT_P1_022_EXECUTION_TAIL_HOOK`；story_order `P1-022`；Canon 层 `original_campaign`。
证据：`extracted-first/28/posts.jsonl post 862279`、`extracted-first/28/posts.jsonl post 862289`、`extracted-first/28/posts.jsonl post 862302`、`extracted-first/28/posts.jsonl post 862306`、`extracted-first/28/posts.jsonl post 862337`、`extracted-first/28/posts.jsonl post 862379`

### P2-023 — 白色魔法使与地下兵工厂

角色以“opponent”参与；御临风协助奥斯卡贝以耶各相关魔力锁定北方 26 号山洞；队伍进入地下兵工厂并与白色魔法使正面交锋。战后龙族秘境外帝国军遭袭，队伍开始强行军。

角色作用：opponent。
人物后果：御临风一方与白魔在地下兵工厂/追击洞窟发生直接敌对交锋。；地下兵工厂被队伍端掉。；队伍确认白魔行动与受荣之道、悠悠、贤者之石和死亡之翼封印相连。
未决边界：白色魔法使最终计划仍未完全揭示。

追踪：event_ref `EVENT_P2_023_WHITE_MAGICIAN_ARMORY_CONFRONTATION`；story_order `P2-023`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl post 989912`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl post 991036`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl post 994593`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl post 1000216`

### P3-002 — 秘境入口与内战惨状

角色以“opposing_force”参与；骑兵以尖刀阵型穿过战场，御临风服用抗毒剂后进入龙族秘境，看见白魔、死亡之翼与龙族内战造成的惨状。

角色作用：opposing_force。
人物后果：没有由中央事件单独确认的角色专属后果。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P3_002_SANCTUARY_ENTRY`；story_order `P3-002`；Canon 层 `original_campaign`。
证据：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl post 1041256`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl post 1042360`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl post 1042846`

### P3-005 — 谢尔伦战线与白魔谈判

角色以“negotiator”参与；谢尔伦以巨龙形态独战发狂黑龙，御临风协助重创一头；白魔分身现身，自称与死亡之翼只是生意伙伴，并给出卡珊德拉之名，称她会成为御临风最大敌人。御临风提出撤离龙族、诱导死亡之翼进入秘境并毁掉根基的计划。

角色作用：negotiator。
人物后果：御临风与白魔建立仅限当下利益的谈判关系，双方目标仍不一致。；谢尔伦与御临风协同重创一头发狂黑龙。；白魔给出卡珊德拉之名并宣称她将成为御临风最大敌人；该说法保持归属。
未决边界：白魔关于卡珊德拉的判断、Phantom 与合作关系均需保留发言者归属。

追踪：event_ref `EVENT_P3_005_XIERLUN_FRONT_AND_WHITE_MAGE_PROPOSAL`；story_order `P3-005`；Canon 层 `original_campaign`。
证据：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1059903`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1059916`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1061947`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1066097`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1067051`

### P3-006 — 根基密室与卡珊德拉交易

角色以“absent_but_affected”参与；御临风在根基密室见到重伤本多、持破万法之刃的卡珊德拉及与其周旋的悠悠。卡珊德拉提出协助对付白魔换取炼金素材；耶各装备展示多个可被改写的未来，其中包括白魔先取魔宝石、悠悠再染诅咒，以及白魔发动魔女之宴后遭卡珊德拉复仇。御临风利用未来不确定性与卡珊德拉重新谈判。

角色作用：absent_but_affected。
人物后果：卡珊德拉与御临风达成无充分保证的临时交易；悠悠持续提醒御临风防范影响。；本多重伤倒地，随后由卡珊德拉按交易要求唤醒。；御临风看见多条可变未来，并确认白魔正从远处窃取秘境能量。；卡珊德拉当前复仇执念与未来暴力画面被分开。
未决边界：卡珊德拉完整目的、交易可信度及未来是否发生均不确定。

追踪：event_ref `EVENT_P3_006_CASSANDRA_FUTURES_AND_TRADE`；story_order `P3-006`；Canon 层 `original_campaign`。
证据：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1067053`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1068038`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1068639`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1070986`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl post 1071787`

### P3-010 — 白魔退场与命运理论

角色以“actor_and_theorist”参与；御临风返回根基后看见三个同时出现的白魔形体压制本多与瑟坦特，白魔取出魔宝石并承认肯达是合作者之一。白魔提出命运定数/变数、死亡之翼不死性源于大地及其可能是大陆不死问题之解药等理论，并称猜想依据来自囚禁高塔附近。

角色作用：actor_and_theorist。
人物后果：白魔与御临风、安兹完成一轮互不信任的情报交换后准备离开。；本多被白魔形体从身后压制并以笛剑钉住；瑟坦特失去意识且被结界束缚。；白魔取出魔宝石；实际取走后的状态由 Transition Canon 接续。；白魔提出命运/异数/不死性理论并给出囚禁高塔、瞎眼黑龙与古神的有限线索；全部保持理论或 testimony 属性。
未决边界：白魔理论未被独立证实；帝对白魔关而不杀、盲眼黑龙与古神关系、魔宝石离开后的完整过程均未在原团展开。

追踪：event_ref `EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY`；story_order `P3-010`；Canon 层 `original_campaign`。
证据：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl post 1247358`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl post 1333535`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl post 1334073`

### TRANSITION-D0 — 原团终局与幕间起点

角色以“actor”参与；D0 作为时间锚点重述原团已写出的阶段性胜利、御临风与安兹进入秘境、白魔交涉及特殊梦境开始；不替代对应 Original Campaign 事件。

角色作用：actor。
人物后果：没有由中央事件单独确认的角色专属后果。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_TRANSITION_D0_BOUNDARY`；story_order `TRANSITION-D0`；Canon 层 `transition`。
证据：`current_state.md §2 D0`

### TRANSITION-D1 — 秘境毁灭与撤离

角色以“takes_gem”参与；按最小 Transition Canon，白魔取走魔宝石，龙族秘境失去维持条件并毁灭，相关人员完成撤离，重伤者接受紧急治疗。

角色作用：takes_gem。
人物后果：撤离者只记录已由 current_state 点名的最低限度状态，不补写具体动作或对白。；龙族秘境失去维持条件并毁灭；重伤者进入紧急治疗。；撤离仅保存 current_state.md 的最低限度结果，不补写过程。
未决边界：撤离逐场过程未演出，不得补写。

追踪：event_ref `EVENT_TRANSITION_D1_COLLAPSE_EVACUATION`；story_order `TRANSITION-D1`；Canon 层 `transition`。
证据：`current_state.md §2 D1`

## 7. 关系时间线

### PC_YU_LINFENG — adversarial negotiation

- 双方有过攻击、追问、情报交换与未解决的交涉。（`MILESTONE_WHITE_MAGICIAN_YU_HISTORY`；证据层：人物背景）
- 当前立场：未知；不从历史合作推断当前忠诚或义务。

## 8. 能力 / 身份 / 状态变化

- TRANSITION-D1：白魔最终取走魔宝石，秘境失去维持条件（类型 `artifact_removal`；持续性 `persistent`；不确定性 `confirmed`；`TRANSITION_WHITE_MAGICIAN_GEM_REMOVED_D1`）
  - 边界：P3-010 原团只到准备离开；实际取走严格归入 D1 Transition Canon。
- 前史/精确时间未知：龙族秘境战中操控黑龙族长奥希拉进行破坏和作战（类型 `control_of_other`；持续性 `unknown`；不确定性 `uncertain`；`TRANSITION_WHITE_MAGICIAN_CONTROLS_OSHIRA`）
  - 边界：此为 Campaign 内行动但 R2A 尚无独立中央事件；已路由 EVENT_LAYER_REQUIRED，不作为前史背景。

## 9. 知识时间线

- 取得时间未知 / `KNOWS` / 角色信念：他掌握魔宝石、魔法戒指与贤者之石相关知识。（`KNOWLEDGE_WHITE_MAGICIAN_ARCANA`）
  - 归因：旧 Profile epistemic item；取得时间未自动补写；来源角色：`None`。
- 取得时间未知 / `BELIEVES` / 角色信念：他相信并陈述了一套关于命运、世界平衡与黑龙关联的理论。（`KNOWLEDGE_WHITE_MAGICIAN_COSMOLOGY_THEORY`）
  - 归因：旧 Profile epistemic item；取得时间未自动补写；来源角色：`None`。
- P3-010 / `THEORY` / 角色理论（未证实）：白色魔法使提出命为定数、运为变数、异乡来客为异数，并把死亡之翼不死性与大地及大陆不死问题联系起来。（`KNOWLEDGE_WHITE_MAGICIAN_FATE_AND_GROUND_THEORY`）
  - 归因：白色魔法使本人理论陈述；来源角色：`NPC_WHITE_MAGICIAN`。

## 10. D3 当前状态

没有足够的角色专属 D3 证据；当前状态保持未知/空，不从历史或 Transition Canon 反推。
- D3 来源：无角色专属来源

## 11. 未解决问题 / 禁止推断

- 未解决：没有确认的私人目标。
- 未解决：宇宙论陈述缺乏独立事实核验。
- 未解决：当前联盟状态未确认。
- 未解决：没有证据保证其会遵守公开的安静研究说法。
- 禁止推断：把家人、理想乡与安静研究写成其公开声称的目标，不得改写成确认的内在真实动机。（`CONSTRAINT_WHITE_MAGICIAN_ATTRIBUTION`）
- 禁止推断：其命运与宇宙论内容只能作为角色知识、信念或理论，除非另有独立 Canon 来源确认。（`CONSTRAINT_WHITE_MAGICIAN_THEORY`）
- 禁止推断：不得把理论升级为世界事实（`CONSTRAINT_R2C_NPC_WHITE_MAGICIAN_1`）
- 禁止推断：不得推断 D1 后位置或永久联盟（`CONSTRAINT_R2C_NPC_WHITE_MAGICIAN_2`）

## 12. 与旧 Profile 相比的变化

- `CLAIM_WHITE_MAGICIAN_IDENTITY` → `MIGRATED` → `IDENTITY_WHITE_MAGICIAN_IDENTITY`：白色魔法使是来自异世界的魔法使，并在 Campaign 内自称笛木奏。
- `CLAIM_WHITE_MAGICIAN_ESCAPE_HISTORY` → `MOVED_TO_BACKGROUND` → `BACKGROUND_WHITE_MAGICIAN_ESCAPE_HISTORY`：他曾被帝国囚禁于监狱塔，并在魔兽之潮期间借沐透协助脱离。
- `CLAIM_WHITE_MAGICIAN_GEM_HISTORY` → `SPLIT` → `TIMELINE_WHITE_MAGICIAN_P3_010_WHITE_MAGE_EXIT_AND_THEORY`、`TRANSITION_WHITE_MAGICIAN_GEM_REMOVED_D1`：原团末段他控制两位龙王并取走维持龙族秘境的魔宝石。
- `CLAIM_WHITE_MAGICIAN_WIZARD_PHANTOM_HISTORY` → `MOVED_TO_BACKGROUND` → `BACKGROUND_WHITE_MAGICIAN_WIZARD_PHANTOM_HISTORY`：设定资料把监狱塔囚禁与后来的活动分开记录：沐透协助白色魔法使逃离后，白魔给予沐透 Wizard Driver，并在该设定参考时点诱导大量幻魔出现。
- `CLAIM_WHITE_MAGICIAN_FACTORY_CONFRONTATION` → `MOVED_TO_TIMELINE` → `TIMELINE_WHITE_MAGICIAN_P2_023_WHITE_MAGICIAN_ARMORY_CONFRONTATION`：地下兵工厂遭帝国部队攻入后，白色魔法使在追击洞窟与御临风及帝国小队交锋，自称笛木奏，提出以崔斯坦为筹码交换预言情报，最后带走崔斯坦并传送离开。
- `CLAIM_WHITE_MAGICIAN_OSHIRA_CONTROL` → `MOVED_TO_ABILITY_STATUS` → `TRANSITION_WHITE_MAGICIAN_CONTROLS_OSHIRA`：龙族秘境战中，团录记载白色魔法使操控黑龙族长奥希拉进行破坏，并在远处以笛剑吹奏、持续操控。
- `CLAIM_WHITE_MAGICIAN_NEGOTIATION_OBSERVED` → `DEMOTED_TO_OBSERVED_BEHAVIOR` → `PERSONA_WHITE_MAGICIAN_NEGOTIATION_OBSERVED`：在与御临风的地下兵工厂追击战中，他主动自我介绍并提出信息交换。
- `CLAIM_WHITE_MAGICIAN_ATTRIBUTED_VALUE` → `RETAINED_AS_PERSONA` → `PERSONA_WHITE_MAGICIAN_ATTRIBUTED_VALUE`：他公开把家人存活与理想乡描述为自己的核心追求。
- `CLAIM_WHITE_MAGICIAN_TERMS_AND_THEORY` → `RETAINED_AS_PERSONA` → `PERSONA_WHITE_MAGICIAN_TERMS_AND_THEORY`：在已见谈判场景中，他常把交换条件、已知部分与理论解释分段陈述。
- `CLAIM_WHITE_MAGICIAN_GEM_NEGOTIATION` → `DEMOTED_TO_OBSERVED_BEHAVIOR` → `PERSONA_WHITE_MAGICIAN_GEM_NEGOTIATION`：在安兹与御临风抵达时，他释放被控制的龙王、取得魔宝石并转入交涉。
- `RELATIONSHIP_WHITE_MAGICIAN_YU_LINFENG` → `MOVED_TO_RELATIONSHIP` → `RELATIONSHIP_WHITE_MAGICIAN_YU_LINFENG`：adversarial negotiation
- `CLAIM_WHITE_MAGICIAN_YU_HISTORY` → `MOVED_TO_RELATIONSHIP` → `MILESTONE_WHITE_MAGICIAN_YU_HISTORY`：双方有过攻击、追问、情报交换与未解决的交涉。
- `KNOWLEDGE_WHITE_MAGICIAN_ARCANA` → `MOVED_TO_KNOWLEDGE` → `KNOWLEDGE_WHITE_MAGICIAN_ARCANA`：他掌握魔宝石、魔法戒指与贤者之石相关知识。
- `KNOWLEDGE_WHITE_MAGICIAN_COSMOLOGY_THEORY` → `MOVED_TO_KNOWLEDGE` → `KNOWLEDGE_WHITE_MAGICIAN_COSMOLOGY_THEORY`：他相信并陈述了一套关于命运、世界平衡与黑龙关联的理论。
- `GOAL_WHITE_MAGICIAN_PUBLIC_IDEAL_WORLD` → `MOVED_TO_GOAL` → `GOAL_WHITE_MAGICIAN_PUBLIC_IDEAL_WORLD`：公开声称要让家人存活并创造理想乡。
- `GOAL_WHITE_MAGICIAN_STATED_RESEARCH` → `MOVED_TO_GOAL` → `GOAL_WHITE_MAGICIAN_STATED_RESEARCH`：公开声称将暂时保持安静并进行研究。
- `CONSTRAINT_WHITE_MAGICIAN_ATTRIBUTION` → `MIGRATED` → `CONSTRAINT_WHITE_MAGICIAN_ATTRIBUTION`：把家人、理想乡与安静研究写成其公开声称的目标，不得改写成确认的内在真实动机。
- `CONSTRAINT_WHITE_MAGICIAN_THEORY` → `MIGRATED` → `CONSTRAINT_WHITE_MAGICIAN_THEORY`：其命运与宇宙论内容只能作为角色知识、信念或理论，除非另有独立 Canon 来源确认。

## 13. 来源与追踪

- migration package：`work/phase3d_r2c/migration_packages/NPC_WHITE_MAGICIAN.json`
- candidate：`work/phase3d_r2c/candidates/by_profile/NPC_WHITE_MAGICIAN.json`
- source profile：`work/phase3d_recall/repaired_candidates/NPC_WHITE_MAGICIAN.json`
- 输入类别：`old_claims`、`direct_temporal_links`、`indirect_continuity_events`、`revelations`、`event_audits`、`retention_records`、`discoveries`、`d3_state`、`worldbook_references`
- schema：`2.0`；生成器：`scripts/build_phase3d_r2c.py`。
