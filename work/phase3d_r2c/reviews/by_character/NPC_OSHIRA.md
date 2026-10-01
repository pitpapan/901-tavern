# 奥希拉

> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。

## 1. 身份

档案 ID：`NPC_OSHIRA`；状态：`existing`；类型：`npc`。

- 奥希拉是黑龙一族的族长，也是悠悠认识的龙族长辈。。  
  追踪：`IDENTITY_OSHIRA_IDENTITY`；来源：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.md:奥希拉自报黑龙族长身份并与御临风交谈（lines 1032-1070）`
- 御临风的调查笔记把黑龙族描述为受赤龙族保护与监督。。  
  追踪：`IDENTITY_CLAIM_OSHIRA_CLAN_DEPENDENCY_1`；来源：`设定 人物/人物卡资料集_检索版.md:583,596`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.md:1032-1070`

## 2. 人物背景

- 奥希拉说前任黑龙族长是其父，父亲在他年幼时已死；御临风理解其所指为死亡之翼。；证据层：人物背景。  
  追踪：`BACKGROUND_CLAIM_OSHIRA_LINEAGE_KNOWLEDGE_1`；来源：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.md:753-761`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.md:7-8,45-46`

## 3. 人格、价值观、行为模式

人格证据稀疏：现有来源不足以安全形成稳定人格、价值观、说话方式或决策模式。

## 4. 动机

- 没有足够来源支持独立动机；不从参与事件或结果反推原因。

## 5. 目标

- 没有足够来源支持具体目标；历史行动不自动延续为当前目标。

## 6. 主要经历时间线

### P2-019 — 龙族典礼前夜

角色以“information_source”参与；御临风与悠悠在塔顶看夕阳；谢尔伦讲解达芬奇密码、受荣之道与龙族祝福并陪同练习，奥希拉说明考验习俗。

角色作用：information_source。
人物后果：御临风与悠悠讨论异乡、托付与共同出行；谢尔伦承担典礼指导。；御临风获知达芬奇密码、受荣之道和龙族祝福的典礼流程。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P2_019_TOWER_SUNSET_AND_RITUAL_PREP`；story_order `P2-019`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl post 962428`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl post 968330`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl post 970655`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl post 971255`

### P2-022 — 黑龙古史与死亡之翼预言

角色以“information_source”参与；奥希拉补充黑龙族与先祖死亡之翼的历史；御临风把降生祝福、战争繁荣、死亡换来和平的叙述与预言对应，并怀疑后段指向黑龙族或龙族毁灭。

角色作用：information_source。
人物后果：奥希拉的黑龙古史 testimony、御临风对预言的对应和其诅咒猜测被分层记录。
未决边界：预言所指对象、诅咒/血脉机制与死亡之翼当前状态仍未由本段确定。

追踪：event_ref `EVENT_P2_022_DEATHWING_HISTORY_TESTIMONY`；story_order `P2-022`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl post 987243`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl post 987507`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl post 987885`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl post 989838`

### P3-003 — 受荣之道与最后封印

间接但人物连续性关键：御临风与悠悠见到远古预言者泰蕾斯；她讲述死亡之翼、外神、精灵、娜迦、北海巨妖、帝、面具、异乡龙血与秘境根基等古史，并把最后力量交给悠悠后消散。悠悠预见谢尔伦将死、秘境将毁及黑龙族长受白魔控制取走魔宝石。

角色作用：indirect continuity subject。
人物后果：御临风把泰蕾斯与贞子重叠并追问贞子；泰蕾斯不知道贞子。；泰蕾斯把最后力量交给悠悠后消散。；悠悠成为最后封印的事实在本段被御临风理解。；御临风与悠悠获得泰蕾斯的古史 testimony 及关于另一异乡男孩/塞拉尔博士的线索。
未决边界：泰蕾斯叙述中各时代细节与因果仍需逐条来源化，不可由概要补全。

追踪：event_ref `EVENT_P3_003_TEIRESIAS_REVELATION`；story_order `P3-003`；Canon 层 `original_campaign`。
证据：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl post 1043170`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl post 1044045`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl post 1046129`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl post 1049727`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl post 1050505`

### P3-004 — 元素龙王苏醒与家之约定

角色以“controlled”参与；悠悠以泰蕾斯力量唤醒戴着吞噬生命与魂魄面具的瑟坦特；瑟坦特拒绝让御临风或悠悠代戴面具，决定亲自参战。御临风与悠悠确认彼此及同伴所在之处构成异乡中的家。

角色作用：controlled。
人物后果：御临风与悠悠互相确认大家所在之处就是异乡中的家。；悠悠以泰蕾斯力量唤醒瑟坦特；瑟坦特继续佩戴吞噬生命与魂魄的面具并亲自参战。；御临风获得对龙语的理解。
未决边界：面具长期代价仍按既有不确定性保存。

追踪：event_ref `EVENT_P3_004_SERTANT_AWAKENING_AND_HOME`；story_order `P3-004`；Canon 层 `original_campaign`。
证据：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl post 1051563`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl post 1057021`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl post 1057980`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1058682`

### P3-005 — 谢尔伦战线与白魔谈判

角色以“controlled_combatant”参与；谢尔伦以巨龙形态独战发狂黑龙，御临风协助重创一头；白魔分身现身，自称与死亡之翼只是生意伙伴，并给出卡珊德拉之名，称她会成为御临风最大敌人。御临风提出撤离龙族、诱导死亡之翼进入秘境并毁掉根基的计划。

角色作用：controlled_combatant。
人物后果：御临风与白魔建立仅限当下利益的谈判关系，双方目标仍不一致。；谢尔伦与御临风协同重创一头发狂黑龙。；白魔给出卡珊德拉之名并宣称她将成为御临风最大敌人；该说法保持归属。
未决边界：白魔关于卡珊德拉的判断、Phantom 与合作关系均需保留发言者归属。

追踪：event_ref `EVENT_P3_005_XIERLUN_FRONT_AND_WHITE_MAGE_PROPOSAL`；story_order `P3-005`；Canon 层 `original_campaign`。
证据：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1059903`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1059916`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1061947`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1066097`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl post 1067051`

### P3-007 — 安兹外交与龙族撤离

角色以“controlled_combatant”参与；卡珊德拉带御临风见安兹；御临风以帝国承认纳萨力克立足及促成安兹与帝会面为条件请求介入。安兹传送至秘境上空，以黑龙尸体召唤骷髅龙，宣布受帝国所托救助龙族，并把伤者送往纳萨力克。

角色作用：controlled_combatant。
人物后果：御临风以帝国使者身份与安兹达成介入战争和撤离伤员的临时外交安排。；安兹将黑龙尸体转化为骷髅龙，并把龙族伤者送往纳萨力克照料。；安兹与御临风确认来自类似地球，但同一世界/时间线未确定。
未决边界：双方世界/时间线是否同一仍未确认。

追踪：event_ref `EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION`；story_order `P3-007`；Canon 层 `original_campaign`。
证据：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl post 1072134`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl post 1073364`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl post 1074554`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl post 1078346`

### P3-010 — 白魔退场与命运理论

间接但人物连续性关键：御临风返回根基后看见三个同时出现的白魔形体压制本多与瑟坦特，白魔取出魔宝石并承认肯达是合作者之一。白魔提出命运定数/变数、死亡之翼不死性源于大地及其可能是大陆不死问题之解药等理论，并称猜想依据来自囚禁高塔附近。

角色作用：indirect continuity subject。
人物后果：白魔与御临风、安兹完成一轮互不信任的情报交换后准备离开。；本多被白魔形体从身后压制并以笛剑钉住；瑟坦特失去意识且被结界束缚。；白魔取出魔宝石；实际取走后的状态由 Transition Canon 接续。；白魔提出命运/异数/不死性理论并给出囚禁高塔、瞎眼黑龙与古神的有限线索；全部保持理论或 testimony 属性。
未决边界：白魔理论未被独立证实；帝对白魔关而不杀、盲眼黑龙与古神关系、魔宝石离开后的完整过程均未在原团展开。

追踪：event_ref `EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY`；story_order `P3-010`；Canon 层 `original_campaign`。
证据：`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl post 1247358`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl post 1333535`、`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl post 1334073`

## 7. 关系时间线

### NPC_YOUYOU — recognized dragon elder

- 没有可安全锚定的关系里程碑。
- 当前立场：未知；不从历史合作推断当前忠诚或义务。
### NPC_YOUYOU — 悠悠称奥希拉为叔叔；奥希拉以龙族长辈身份与她互动。

- 奥希拉以龙族长辈身份迎接并与悠悠互动。（`MILESTONE_CLAIM_OSHIRA_YOUYOU_HISTORY_EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY_1`；证据层：实际事件）
- 奥希拉受谢尔伦委托短暂陪护悠悠。（`MILESTONE_CLAIM_OSHIRA_YOUYOU_HISTORY_EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION_2`；证据层：实际事件）
- 当前立场：未知；不从历史合作推断当前忠诚或义务。

## 8. 能力 / 身份 / 状态变化

- 前史/精确时间未知：龙族秘境战中遭到非自愿控制，并被操控进行破坏和作战（类型 `control`；持续性 `unknown`；不确定性 `uncertain`；`TRANSITION_OSHIRA_NONVOLUNTARY_CONTROL`）
  - 边界：控制机制、当时意识状态、抵抗、事后记忆与长期持续性均未知；不得把控制归因为血脉魔法。

## 9. 知识时间线

- P2-022 / `TESTIMONY_HEARD` / 归因证词：奥希拉向在场者陈述黑龙先祖死亡之翼相关的族群历史。（`KNOWLEDGE_OSHIRA_DEATHWING_HISTORY_TESTIMONY`）
  - 归因：奥希拉本人作为 testimony 来源；来源角色：`NPC_OSHIRA`。
- 取得时间未知 / `BELIEVES` / 角色信念：御临风的调查笔记认为黑龙族受赤龙族保护与监督。（`KNOWLEDGE_CLAIM_OSHIRA_CLAN_DEPENDENCY_1`）
  - 归因：御临风的调查笔记；来源角色：`PC_YU_LINFENG`。
- 取得时间未知 / `RUMOR` / 传闻：奥希拉说明自己所知的许多黑龙历史来自传闻。（`KNOWLEDGE_CLAIM_OSHIRA_LINEAGE_KNOWLEDGE_1`）
  - 归因：奥希拉对自身信息来源的说明；来源角色：`NPC_OSHIRA`。

## 10. D3 当前状态

没有足够的角色专属 D3 证据；当前状态保持未知/空，不从历史或 Transition Canon 反推。
- D3 来源：无角色专属来源

## 11. 未解决问题 / 禁止推断

- 未解决：稳定人格、价值排序与跨情境声线证据不足。
- 未解决：D3 精确位置、即时议程与当前目标未知。
- 未解决：白魔控制奥希拉的具体机制未确认；血脉魔法仅是待证线索。
- 未解决：控制期间的意识、抵抗、事后记忆与长期后果未知。
- 禁止推断：不得从黑龙族长身份或一次援助表态推断完整政治立场。（`CONSTRAINT_OSHIRA_EVIDENCE_BOUNDARY`）
- 禁止推断：控制机制、意识、记忆与持续性未知（`CONSTRAINT_R2C_NPC_OSHIRA_1`）

## 12. 与旧 Profile 相比的变化

- `CLAIM_OSHIRA_IDENTITY` → `MIGRATED` → `IDENTITY_OSHIRA_IDENTITY`：奥希拉是黑龙一族的族长，也是悠悠认识的龙族长辈。
- `CLAIM_OSHIRA_CLAN_DEPENDENCY` → `SPLIT` → `IDENTITY_CLAIM_OSHIRA_CLAN_DEPENDENCY_1`、`KNOWLEDGE_CLAIM_OSHIRA_CLAN_DEPENDENCY_1`：御临风的调查笔记把黑龙族描述为受赤龙族保护与监督；该说法作为其调查所得保留。
- `CLAIM_OSHIRA_LINEAGE_KNOWLEDGE` → `SPLIT` → `BACKGROUND_CLAIM_OSHIRA_LINEAGE_KNOWLEDGE_1`、`KNOWLEDGE_CLAIM_OSHIRA_LINEAGE_KNOWLEDGE_1`：奥希拉向悠悠讲述黑龙历史时说前任黑龙族长是其父，父亲在他年幼时已死；御临风理解其所指为死亡之翼。奥希拉说明自己所知许多内容来自传闻。
- `CLAIM_OSHIRA_DRAGON_WAR_CONTROL` → `MOVED_TO_ABILITY_STATUS` → `TRANSITION_OSHIRA_NONVOLUNTARY_CONTROL`：龙族秘境战中，谢尔伦报告奥希拉与黑龙族遭到控制；之后团录明确描述白色魔法使操控黑龙族长奥希拉进行破坏和作战。
- `RELATIONSHIP_OSHIRA_YOUYOU` → `MOVED_TO_RELATIONSHIP` → `RELATIONSHIP_OSHIRA_YOUYOU`：recognized dragon elder
- `CLAIM_OSHIRA_YOUYOU_HISTORY` → `SPLIT` → `RELATIONSHIP_NPC_YOUYOU_CLAIM_OSHIRA_YOUYOU_HISTORY_NPC_YOUYOU`、`MILESTONE_CLAIM_OSHIRA_YOUYOU_HISTORY_EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY_1`、`MILESTONE_CLAIM_OSHIRA_YOUYOU_HISTORY_EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION_2`：悠悠称奥希拉为叔叔；奥希拉以龙族长辈身份同她互动，并受谢尔伦委托短暂陪护她。
- `CONSTRAINT_OSHIRA_EVIDENCE_BOUNDARY` → `MIGRATED` → `CONSTRAINT_OSHIRA_EVIDENCE_BOUNDARY`：不得从黑龙族长身份或一次援助表态推断完整政治立场。

## 13. 来源与追踪

- migration package：`work/phase3d_r2c/migration_packages/NPC_OSHIRA.json`
- candidate：`work/phase3d_r2c/candidates/by_profile/NPC_OSHIRA.json`
- source profile：`work/phase3d_recall/repaired_candidates/NPC_OSHIRA.json`
- 输入类别：`old_claims`、`direct_temporal_links`、`indirect_continuity_events`、`revelations`、`event_audits`、`retention_records`、`discoveries`、`d3_state`、`worldbook_references`
- schema：`2.0`；生成器：`scripts/build_phase3d_r2c.py`。
