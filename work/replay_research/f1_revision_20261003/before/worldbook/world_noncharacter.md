# F1世界书审核稿：非角色部分

本版共99条，供本轮逐条审核。采用正式中间条目schema字段，但未写旧output/worldbook_source.jsonl，不是酒馆载入配置。

以首次入帝都为T0。既有背景、原线后来史实、证言与局部未知分别保存；后期原线事件仅供作者历史参考，不固定新分支未来。current_state.md继续独立管续跑时间锚，不在本批机械拆分。梦域内容排除，原始归档保留；已明确携回主世界的器物与复生后效仅载相应事实。

canon_status表示核心主题；正文character_belief、rumor、uncertain限定局部主张。来源同时附研究JSONL行与其原帖／原参考定位。条目与所有WRC、主要研究组去向见world_topic_coverage.jsonl。

## 索引

- [妄想大陆](#world_wrc_001) · world · confirmed
- [大陆法则限制](#world_wrc_002) · concept · confirmed
- [飘零大陆](#world_wrc_003) · location · confirmed
- [妄想山脉](#world_wrc_004) · location · confirmed
- [帝国](#world_wrc_005) · faction · confirmed
- [八柱将](#world_wrc_006) · faction · confirmed
- [兄弟会](#world_wrc_007) · faction · confirmed
- [游击士协会](#world_wrc_008) · faction · confirmed
- [魔兽部族联合体](#world_wrc_009) · faction · confirmed
- [龙族](#world_wrc_010) · faction · confirmed
- [空间龙部族](#world_wrc_011) · faction · confirmed
- [娜迦](#world_wrc_012) · faction · confirmed
- [古代精灵社会](#world_wrc_013) · concept · confirmed
- [纳萨力克地下大坟墓](#world_wrc_014) · faction · confirmed
- [无法地带](#world_wrc_015) · location · confirmed
- [狂信者](#world_wrc_016) · faction · confirmed
- [无法组织](#world_wrc_017) · faction · confirmed
- [高等评议会](#world_wrc_018) · faction · confirmed
- [帝都](#world_wrc_019) · location · confirmed
- [边境关卡](#world_wrc_020) · location · confirmed
- [帝都近郊峡谷](#world_wrc_021) · location · confirmed
- [九雪医馆](#world_wrc_022) · location · confirmed
- [九重里](#world_wrc_023) · location · confirmed
- [空间龙秘境](#world_wrc_024) · location · confirmed
- [龙族秘境](#world_wrc_025) · location · confirmed
- [监狱塔](#world_wrc_026) · location · confirmed
- [帝都图书馆](#world_wrc_027) · location · confirmed
- [永恒之井](#world_wrc_028) · location · confirmed
- [尼伯龙根](#world_wrc_029) · location · rumor
- [YGGDRASIL](#world_wrc_030) · concept · confirmed
- [帝赐假面](#world_wrc_031) · concept · confirmed
- [古代精灵腰带技术](#world_wrc_032) · concept · confirmed
- [魔宝石与魔法戒指制作](#world_wrc_033) · concept · confirmed
- [贤者之石](#world_wrc_034) · concept · confirmed
- [厌魔石](#world_wrc_035) · concept · confirmed
- [魔兽之潮](#world_wrc_036) · concept · confirmed
- [魔物之潮](#world_wrc_037) · concept · confirmed
- [龙族灭族预言](#world_wrc_038) · concept · confirmed
- [凌迟与悠悠涉及的诅咒](#world_wrc_039) · concept · confirmed
- [Phantom](#world_wrc_040) · concept · confirmed
- [古代精灵灾变](#world_wrc_041) · event · confirmed
- [古代精灵内乱](#world_wrc_042) · event · confirmed
- [空间龙部族覆灭](#world_wrc_044) · event · confirmed
- [第一次魔兽大侵攻](#world_wrc_045) · event · confirmed
- [峡谷战](#world_wrc_046) · event · confirmed
- [帝国与龙族结盟](#world_wrc_047) · event · confirmed
- [帝国远征军与边境战争](#world_wrc_048) · event · confirmed
- [监狱塔脱逃](#world_wrc_049) · event · confirmed
- [纳萨力克异界迁入](#world_wrc_050) · event · confirmed
- [主神式任务机制](#world_wrc_051) · concept · confirmed
- [边关七日任务](#world_wrc_052) · event · confirmed
- [第八号当铺](#world_wrc_053) · faction · confirmed
- [弃风剑](#world_wrc_054) · concept · confirmed
- [贞子首次救命](#world_wrc_055) · event · confirmed
- [第八号当铺交易](#world_wrc_056) · event · confirmed
- [边关破后失散](#world_wrc_057) · event · confirmed
- [御临风追杀与记忆封锁](#world_wrc_058) · event · confirmed
- [雅儿商队与山寨庙事件](#world_wrc_059) · event · confirmed
- [耶各相关死亡秩序](#world_wrc_061) · concept · character_belief
- [飘零祭](#world_wrc_062) · concept · confirmed
- [帝国教育与知识传播](#world_wrc_063) · concept · confirmed
- [帝国医疗与药理](#world_wrc_064) · concept · confirmed
- [帝都市政与公共生活](#world_wrc_065) · concept · confirmed
- [帝国军令与情报渠道](#world_wrc_066) · concept · confirmed
- [帝国工坊与装备交易](#world_wrc_067) · concept · confirmed
- [帝都丧葬与死灵防范](#world_wrc_068) · concept · confirmed
- [魔兽最高评议会](#world_wrc_069) · faction · confirmed
- [受荣之道](#world_wrc_070) · location · confirmed
- [恐惧圆环](#world_wrc_071) · concept · confirmed
- [魔物之盒](#world_wrc_072) · concept · confirmed
- [外神与旧日支配者](#world_wrc_073) · concept · character_belief
- [预言、神谕与可能未来](#world_wrc_074) · concept · confirmed
- [死亡之翼重临与龙族秘境大战](#world_wrc_075) · event · confirmed
- [帝都法师塔区域灾难](#world_wrc_077) · event · confirmed
- [大魔女夜宴](#world_wrc_078) · concept · character_belief
- [帝国朝会与常务办理](#world_empire_court) · concept · confirmed
- [雷光的秘密情报部门](#world_raigu_intelligence) · faction · confirmed
- [雷光直属第一大队第二小队](#world_raigu_unit) · faction · confirmed
- [帝国地方受理与通信](#world_local_administration) · concept · confirmed
- [帝都博士研究所](#world_research_institute) · location · confirmed
- [魔偶制造与灵魂研究](#world_magical_automata) · concept · character_belief
- [Gate](#world_gate) · concept · character_belief
- [Phantom救援与逆转研究](#world_phantom_rescue) · concept · confirmed
- [人工Phantom与供魔路径](#world_artificial_phantom) · concept · character_belief
- [Faer](#world_faer) · concept · confirmed
- [魔力之海](#world_magic_sea) · concept · character_belief
- [魔力体质与持续供能](#world_bloodline_magic) · concept · confirmed
- [空间传送与龙族空间能力](#world_space_magic) · concept · confirmed
- [异乡之龙](#world_foreign_dragon) · concept · confirmed
- [白色魔法师的合作网络](#world_white_mage_network) · faction · confirmed
- [龙族根基洞穴交涉](#world_white_mage_hostages) · event · confirmed
- [帝都报信与达卡斯栽赃追捕](#world_capital_pursuit) · event · confirmed
- [悠悠诅咒转移](#world_curse_transfer) · event · confirmed
- [维尔Faer装具接入](#world_viel_faer_contract) · event · confirmed
- [欧吉尔德交石与庄园变化](#world_mutou_stone_transfer) · event · confirmed
- [娜迦遗迹夺回装具与水手拘押](#world_mutou_naga_recovery) · event · confirmed
- [美杜莎与养父样貌者的镇中胁迫](#world_great_tomb_coercion) · event · confirmed
- [纳萨力克本地代理招募](#world_great_tomb_agent) · event · confirmed
- [帝都战时生产与新政改革](#world_city_reform) · event · confirmed

<a id="world_wrc_001"></a>
## 妄想大陆

`WORLD_WRC_001` · world · confirmed · original_campaign · high

触发：妄想大陆

妄想大陆是整个世界的称呼。世界同时容纳科技、魔法、剑气、斗气、魔兽与异世界生物，总体地域结构为四陆一脉。飘零大陆是其中一陆，帝国则是政权；妄想山脉按不同大陆区域区分。世界名、地域名和政治归属不能互相替代。现有资料尚未提供四陆的完整地图与边界。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_001。适用时期：世界背景。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_001,SWU_ROOT_001

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=1; record_id=WRC_001
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=15; line_end=19
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=1; record_id=SWU_ROOT_001
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=15; line_end=26
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=17; line_end=19
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=37; line_end=64
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; source_id=P3; jsonl_line=21; post_id=1046075; floor=70

<a id="world_wrc_002"></a>
## 大陆法则限制

`WORLD_WRC_002` · concept · confirmed · original_campaign · medium

触发：大陆法则限制

不同大陆间存在可使器具或力量失效的法则。用户明确：科技大陆的手枪在飘零大陆无法生效，采用魔导技术制造的类似手枪因运行原理不同可以使用；技能、技巧不受这类限制。极强者可以突破法则，真正的剑仙能够在飘零施展炎黄大陆剑气，普通剑客则不能。御临风的剑气兼具斗气与剑气性质，处在两者之间，因此可用。这项解释不授予他剑仙身份，也不意味着所有混合力量都能豁免。失效的具体环节、突破门槛和代价尚未给出。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_002。适用时期：T0法则。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_002,PWRM_001,UCL_20261002_001

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=2; record_id=WRC_002
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=17; line_end=18
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=186; line_end=187
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=1; record_id=PWRM_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — document_id=REF_USER_CLARIFICATIONS; line_start=14; line_end=14
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — document_id=REF_USER_CLARIFICATIONS; line_start=15; line_end=15
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — document_id=REF_USER_CLARIFICATIONS; line_start=16; line_end=16
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=1; record_id=UCL_20261002_001

<a id="world_wrc_003"></a>
## 飘零大陆

`WORLD_WRC_003` · location · confirmed · original_campaign · medium

触发：飘零大陆

飘零大陆是四陆之一，也是主线主要发生的地域。帝国长期统治并整合其中非敌对的精灵、矮人等族，因此国家与居民种族不能等同。首次入帝都之前，边关已经失陷；原线后来发生的收关、远征、龙族外交及地形裂变，各有生效时期，不能叠成同一张当前地图。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_003。适用时期：T0地域。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_003,EMP_003

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=3; record_id=WRC_003
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=17; line_end=26
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=186; line_end=187
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=3; record_id=EMP_003
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; source_id=P3; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=25; post_id=823927; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=1; post_id=922950; floor=0
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=3; post_id=922976; floor=2
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=49; line_end=49
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=117; line_end=119
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=150; line_end=151
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=163; line_end=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=22; post_id=960244; floor=721
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=23; post_id=960245; floor=722
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=24; post_id=960247; floor=723
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=27; post_id=960254; floor=726
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=28; post_id=960439; floor=727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=30; post_id=960504; floor=729
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=31; post_id=960512; floor=730
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=33; post_id=960572; floor=732
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=37; post_id=960594; floor=736
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=39; post_id=960885; floor=738
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=6; post_id=964513; floor=755
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=8; post_id=964526; floor=757
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=10; post_id=966347; floor=759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=50; post_id=974730; floor=849
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=46; post_id=962304; floor=745
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=47; post_id=962305; floor=746
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=4; post_id=963675; floor=753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=5; post_id=963731; floor=754
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222

<a id="world_wrc_004"></a>
## 妄想山脉

`WORLD_WRC_004` · location · confirmed · original_campaign · medium

触发：妄想山脉

妄想山脉按四大陆区域划分，各区域的怪物不同。飘零一侧有魔兽部族、龙族及边境关卡，中央另有无法地带。部族居处、地下通道、兵工设施和秘境各有用途。关于环境优势造成魔兽数量过剩的部分解释来自学者观点〔character_belief〕。后期大地裂变毁伤补给站并重组天险，旧路线须按时期使用；完整交通关系尚未给出。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_004。适用时期：地理分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_004,WRS_013,FOP_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=4; record_id=WRC_004
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=18; line_end=19
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=37; line_end=49
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=61; line_end=64
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=13; record_id=WRS_013
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=30; ERC_P1_0085; post_ids=824604,824621
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=36; post_id=824604; floor=335
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=37; post_id=824621; floor=336
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=8; ERC_P2_0208; post_ids=922821
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=34; post_id=922821; floor=433
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=44; ERC_P2_0244; post_ids=958884,958885,958896,958900,959037,959039,959104,959113,959199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=42; post_id=958884; floor=691
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=43; post_id=958885; floor=692
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=44; post_id=958896; floor=693
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=45; post_id=958900; floor=694
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=46; post_id=959037; floor=695
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=47; post_id=959039; floor=696
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=48; post_id=959104; floor=697
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=49; post_id=959113; floor=698
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=50; post_id=959199; floor=699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=61; ERC_P2_0461; post_ids=1031470,1031478,1032053
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=7; record_id=FOP_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=37; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=180; line_end=182
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=37; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=180; line_end=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=43; post_id=923265; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=44; post_id=923272; floor=443
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=45; post_id=923290; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=7; post_id=971896; floor=806
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=8; post_id=971909; floor=807
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=9; post_id=971912; floor=808
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=10; post_id=971915; floor=809
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=1; post_id=959208; floor=700
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=2; post_id=959370; floor=701
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=4; post_id=959641; floor=703
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=5; post_id=959646; floor=704
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=6; post_id=959651; floor=705
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=9; post_id=959976; floor=708
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=11; post_id=959982; floor=710
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=14; post_id=960048; floor=713
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=16; post_id=960068; floor=715
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=17; post_id=960072; floor=716
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=18; post_id=960111; floor=717
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=46; line_end=49
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=114; line_end=119
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=150; line_end=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=34; post_id=960576; floor=733
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=36; post_id=960586; floor=735
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=38; post_id=960881; floor=737
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=4; post_id=963675; floor=753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=50; post_id=974730; floor=849
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=48; post_id=987233; floor=897
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=49; post_id=987234; floor=898
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=50; post_id=987239; floor=899
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=22; post_id=960244; floor=721
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=23; post_id=960245; floor=722
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=24; post_id=960247; floor=723
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=27; post_id=960254; floor=726
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=28; post_id=960439; floor=727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=30; post_id=960504; floor=729
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=31; post_id=960512; floor=730
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=33; post_id=960572; floor=732
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=37; post_id=960594; floor=736
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=39; post_id=960885; floor=738
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=6; post_id=964513; floor=755
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=8; post_id=964526; floor=757
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=10; post_id=966347; floor=759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=46; post_id=962304; floor=745
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=47; post_id=962305; floor=746
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=5; post_id=963731; floor=754
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115

<a id="world_wrc_005"></a>
## 帝国

`WORLD_WRC_005` · faction · confirmed · original_campaign · high

触发：帝国

帝国以帝为最高统治者，以集中权威、常务机构和多族整合维持治理。任官没有世袭制度，每年有多次考试或考核机会，官员受到中央及游击士协会监督。八柱将、直系下属和其他官员参与日常办理，旁听专员向帝报告，重大判断再交朝堂。帝国没有贵族阶级，官僚不因职务被视为比普通人更高贵；帝、八柱将和名人仍享有个人威望，财富、职权与生活处境也有差异。帝与哈克本来就是兄弟，已由用户确认。原线后期出现继位提议，未见完成继位。帝国不提倡宗教。 [本轮用户审阅](<C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md:221>)

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_005。适用时期：T0政制。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_005,EMP_001,EMP_003,SWU_SOC_001

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=5; record_id=WRC_005
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=21; line_end=26
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — source_id=P1_P002; jsonl_line=33; post_id=816651; floor=82
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=1; record_id=EMP_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=37; post_id=820769; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=3; record_id=EMP_003
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=17; line_end=26
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=186; line_end=187
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; source_id=P3; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=25; post_id=823927; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=1; post_id=922950; floor=0
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=3; post_id=922976; floor=2
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=49; line_end=49
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=117; line_end=119
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=150; line_end=151
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=163; line_end=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=22; post_id=960244; floor=721
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=23; post_id=960245; floor=722
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=24; post_id=960247; floor=723
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=27; post_id=960254; floor=726
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=28; post_id=960439; floor=727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=30; post_id=960504; floor=729
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=31; post_id=960512; floor=730
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=33; post_id=960572; floor=732
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=37; post_id=960594; floor=736
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=39; post_id=960885; floor=738
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=6; post_id=964513; floor=755
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=8; post_id=964526; floor=757
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=10; post_id=966347; floor=759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=50; post_id=974730; floor=849
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=46; post_id=962304; floor=745
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=47; post_id=962305; floor=746
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=4; post_id=963675; floor=753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=5; post_id=963731; floor=754
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=4; record_id=SWU_SOC_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=2; record_id=EMP_002
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=24; line_end=26
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=161; line_end=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=29; post_id=843621; floor=778
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=24; line_end=24
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=159; line_end=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=44; line_end=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=11; post_id=846884; floor=1110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=12; post_id=967530; floor=761
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=2; record_id=UCL_20261003_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=43; line_end=43
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=45; line_end=45

<a id="world_wrc_006"></a>
## 八柱将

`WORLD_WRC_006` · faction · confirmed · original_campaign · high

触发：八柱将

八柱将是帝麾下兼具武力与智谋的最高八人，武将可受赐假面。本团记录奥修特尔持水神假面、宗近持土神假面、武赖持火神假面、左近持雷神假面；奥修特尔与右近是同一人物。用户明确本团参考《传颂之物》的大和八柱将及《二人的白皇》，没有德考波姆，其位置由奥修特尔／右近替代。人物职责随实际军令和部署变化，原型作品的任期、战争及未来结局不自动成为本团历史。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_006。适用时期：T0职务；部署分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_006,EMP_002,UCL_20261003_004

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=6; record_id=WRC_006
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=24; line_end=26
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=161; line_end=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=2; record_id=EMP_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=29; post_id=843621; floor=778
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=24; line_end=24
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=159; line_end=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=44; line_end=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=11; post_id=846884; floor=1110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=37; post_id=820769; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=25; post_id=823927; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=12; post_id=967530; floor=761
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=5; record_id=UCL_20261003_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=116; line_end=116
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=117; line_end=117

<a id="world_wrc_007"></a>
## 兄弟会

`WORLD_WRC_007` · faction · confirmed · original_campaign · high

触发：兄弟会

兄弟会是帝掌控的秘密组织，工作涉及情报、谍报与暗杀，采用单线联系并严格挑选成员。失联者难以自证身份，仍可能按组织标准行动。设定称八柱将未被告知其真实面目，这不等于他们从未听说组织。雪老曾为成员，原线峡谷战后归田；后期忠诚测试出现沃西斯、罗伯和艾利的关联，不能倒推全体高官共同知道组织全貌。临风回答的韩诺与当铺是故意误导，不是真实网点；邀请布莱特也不等于他已完成入会。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_007。适用时期：既存组织；接触分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_007,FOP_002

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=7; record_id=WRC_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=28; line_end=31
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=83; line_end=86
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=68; line_end=72
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=2; record_id=FOP_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=5; post_id=921264; floor=404
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=6; post_id=921305; floor=405
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=7; post_id=921321; floor=406
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=8; post_id=921322; floor=407
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=9; post_id=921323; floor=408
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=10; post_id=921324; floor=409
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=11; post_id=921325; floor=410
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=12; post_id=921328; floor=411
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=13; post_id=921329; floor=412
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=25; post_id=915370; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=26; post_id=915381; floor=325
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=27; post_id=915402; floor=326
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=28; post_id=915409; floor=327
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=29; post_id=915414; floor=328
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=30; post_id=915419; floor=329
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=32; post_id=915502; floor=331
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=33; post_id=915504; floor=332
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=35; post_id=915755; floor=334
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=36; post_id=915862; floor=335
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — source_id=MUTOU; jsonl_line=1; post_id=845702; floor=0; source_html_line=342
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — source_id=MUTOU; jsonl_line=2; post_id=845717; floor=1; source_html_line=435
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — source_id=MUTOU; jsonl_line=3; post_id=845721; floor=2; source_html_line=526

<a id="world_wrc_008"></a>
## 游击士协会

`WORLD_WRC_008` · faction · confirmed · original_campaign · high

触发：游击士协会

游击士协会以保护百姓和地区和平为宗旨，接受民间或政府委托，处理魔兽、犯罪以及寻宠、疏渠、采药、兼职等日常事务。协会拒绝违法任务，奉行不干涉国家政权，在帝国制度中另承担第三方监督。会员准入、等级、前台接洽和奖励都有实际程序。接待员关于受政治压力时可能为整体存续退让的解释，保留其语境〔character_belief〕。战争中A级成员支援前线，不等于协会整体已被帝国吞并。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_008。适用时期：既存组织；战争分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_008,EMP_007,FOP_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=8; record_id=WRC_008
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=25; line_end=25
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=33; line_end=35
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=7; record_id=EMP_007
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=31; post_id=863001; floor=30
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=32; post_id=863002; floor=31
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=33; post_id=863005; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=35; post_id=863009; floor=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=4; post_id=863462; floor=53
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=6; post_id=863468; floor=55
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=7; post_id=863469; floor=56
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=8; post_id=863470; floor=57
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=9; post_id=863472; floor=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=22; post_id=874508; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=23; post_id=874647; floor=172
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=25; post_id=878056; floor=174
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=46; post_id=899931; floor=195
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=48; post_id=900199; floor=197
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=50; post_id=851837; floor=1249
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/26/posts.jsonl — jsonl_line=9; post_id=852222; floor=1258
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=30; post_id=816127; floor=29
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=32; post_id=816130; floor=31
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=33; post_id=816133; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=34; post_id=816137; floor=33
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=35; post_id=816141; floor=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=38; post_id=816170; floor=37
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=41; post_id=816201; floor=40
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=43; post_id=816246; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=47; post_id=816280; floor=46
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — jsonl_line=29; post_id=816583; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=1; post_id=816699; floor=100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=3; post_id=816704; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=23; post_id=915324; floor=322
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=31; post_id=915456; floor=330
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=32; post_id=915502; floor=331
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=35; post_id=915755; floor=334
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=38; post_id=915989; floor=337
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=39; post_id=916086; floor=338
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=1; post_id=819306; floor=250
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=2; post_id=819320; floor=251
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=3; post_id=819325; floor=252
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=4; post_id=819333; floor=253
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=29; post_id=846089; floor=1028
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=31; post_id=846093; floor=1030
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=32; post_id=846094; floor=1031
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=33; post_id=846096; floor=1032
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=34; post_id=846097; floor=1033
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=36; post_id=846103; floor=1035
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=37; post_id=846104; floor=1036
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=10; post_id=846370; floor=1059
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=19; post_id=846466; floor=1068
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=36; post_id=845834; floor=985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=37; post_id=845835; floor=986
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=38; post_id=845836; floor=987
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=39; post_id=845880; floor=988
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=40; post_id=845914; floor=989
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=41; post_id=845931; floor=990
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=44; post_id=845976; floor=993
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=45; post_id=845977; floor=994
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=46; post_id=845982; floor=995
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=47; post_id=845983; floor=996
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=48; post_id=845985; floor=997
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=49; post_id=845988; floor=998
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=5; post_id=819466; floor=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=6; post_id=819483; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=7; post_id=819493; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=8; post_id=819499; floor=257
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=30; post_id=820363; floor=279
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=10; post_id=816720; floor=109
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=11; post_id=816721; floor=110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=15; post_id=816726; floor=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=50; post_id=845994; floor=999
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=40; post_id=851625; floor=1239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=44; post_id=851773; floor=1243
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=25; post_id=816745; floor=124
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=27; post_id=816778; floor=126
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=6; post_id=817368; floor=155
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=11; post_id=817447; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=22; post_id=817537; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=24; post_id=817616; floor=173
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=42; post_id=863173; floor=41
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=43; post_id=863343; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=50; post_id=863417; floor=49
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=2; post_id=863435; floor=51
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=3; post_id=863447; floor=52
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=38; post_id=846107; floor=1037
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=39; post_id=846109; floor=1038
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=40; post_id=846113; floor=1039
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=41; post_id=846114; floor=1040
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=42; post_id=846115; floor=1041
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=43; post_id=846116; floor=1042
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=44; post_id=846119; floor=1043
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=45; post_id=846120; floor=1044
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=24; post_id=846530; floor=1073
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=25; post_id=846531; floor=1074
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=25; post_id=1042442; floor=424
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=33; post_id=1043390; floor=432
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=35; post_id=1043686; floor=434
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=37; post_id=1044477; floor=436
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=7; post_id=895386; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=45; post_id=1047210; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=49; post_id=1047852; floor=448
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=5; record_id=FOP_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=15; post_id=921465; floor=414
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=46; post_id=989075; floor=945
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=47; post_id=989077; floor=946
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=48; post_id=989082; floor=947
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=49; post_id=989174; floor=948
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=50; post_id=989838; floor=949
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=9; post_id=1052875; floor=458
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=11; post_id=1055378; floor=460
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=13; post_id=1056638; floor=462
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=12; post_id=1055963; floor=461
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=14; post_id=1068640; floor=463
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=15; post_id=1069865; floor=464
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=19; post_id=1090503; floor=468

<a id="world_wrc_009"></a>
## 魔兽部族联合体

`WORLD_WRC_009` · faction · confirmed · original_campaign · high

触发：魔兽部族联合体

魔兽部族原各自为政，并有长老议会协调。凌迟出现后整合种族，实行军事化管理，以空运、盾阵、萨满强化和反魔箭等协同战术攻破帝国边关。“所有种族”在统合记录中的实际覆盖范围没有完整名单，不能把龙族或每名非人个体自动视为同一忠诚阵营。罗伯的离山经验、谢尔伦的制度转述和杨的逃亡分别反映不同利益。本条标题是研究主题，不补作正式国号。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_009。适用时期：自治→凌迟统合。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_009,FOP_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=9; record_id=WRC_009
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=37; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=180; line_end=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=7; record_id=FOP_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=37; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=180; line_end=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=43; post_id=923265; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=44; post_id=923272; floor=443
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=45; post_id=923290; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=7; post_id=971896; floor=806
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=8; post_id=971909; floor=807
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=9; post_id=971912; floor=808
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=10; post_id=971915; floor=809
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=1; post_id=959208; floor=700
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=2; post_id=959370; floor=701
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=4; post_id=959641; floor=703
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=5; post_id=959646; floor=704
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=6; post_id=959651; floor=705
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=9; post_id=959976; floor=708
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=11; post_id=959982; floor=710
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=14; post_id=960048; floor=713
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=16; post_id=960068; floor=715
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=17; post_id=960072; floor=716
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=18; post_id=960111; floor=717
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=50; post_id=959199; floor=699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=36; post_id=824604; floor=335
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=37; post_id=824621; floor=336
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=46; line_end=49
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=114; line_end=119
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=150; line_end=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=34; post_id=960576; floor=733
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=36; post_id=960586; floor=735
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=38; post_id=960881; floor=737
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=4; post_id=963675; floor=753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=50; post_id=974730; floor=849
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=48; post_id=987233; floor=897
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=49; post_id=987234; floor=898
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=50; post_id=987239; floor=899
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=22; post_id=960244; floor=721
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=23; post_id=960245; floor=722
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=24; post_id=960247; floor=723
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=27; post_id=960254; floor=726
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=28; post_id=960439; floor=727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=30; post_id=960504; floor=729
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=31; post_id=960512; floor=730
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=33; post_id=960572; floor=732
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=37; post_id=960594; floor=736
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=39; post_id=960885; floor=738
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=6; post_id=964513; floor=755
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=8; post_id=964526; floor=757
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=10; post_id=966347; floor=759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=46; post_id=962304; floor=745
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=47; post_id=962305; floor=746
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=5; post_id=963731; floor=754
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115

<a id="world_wrc_010"></a>
## 龙族

`WORLD_WRC_010` · faction · confirmed · original_campaign · high

触发：龙族

山脉强大长寿种族，元素亲和高，低繁衍及战斗猎杀形成延续压力。有六龙王和各族首领，谢尔伦为冰霜龙王、上古龙，曾对抗死亡之翼与黑龙、古战战果未齐。宴会五王在場、瑟坦特后归来不等一王死亡。灭族预言推动帝国谈判。奥希拉黑龙霸权家史属听说〔rumor〕。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_010。适用时期：背景；外交授职分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_010,WRC_043,WRS_029,FOP_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=10; record_id=WRC_010
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=46; line_end=49
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=114; line_end=119
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=150; line_end=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=43; record_id=WRC_043
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=29; record_id=WRS_029
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=27; ERC_P1_0327; post_ids=845598,845599,845600,845604
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=44; post_id=845598; floor=943
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=45; post_id=845599; floor=944
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=46; post_id=845600; floor=945
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=47; post_id=845604; floor=946
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=2; ERC_P1_0402; post_ids=846047,846054,846061,846217
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=8; ERC_P1_0408; post_ids=846107,846109,846113,846114,846115,846116,846119,846120,846530,846531
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=38; post_id=846107; floor=1037
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=39; post_id=846109; floor=1038
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=40; post_id=846113; floor=1039
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=41; post_id=846114; floor=1040
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=42; post_id=846115; floor=1041
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=43; post_id=846116; floor=1042
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=44; post_id=846119; floor=1043
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=45; post_id=846120; floor=1044
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=24; post_id=846530; floor=1073
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=25; post_id=846531; floor=1074
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=34; ERC_P1_0534; post_ids=862100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=30; post_id=862100; floor=1379
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=7; record_id=FOP_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=37; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=180; line_end=182
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=37; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=180; line_end=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=43; post_id=923265; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=44; post_id=923272; floor=443
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=45; post_id=923290; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=7; post_id=971896; floor=806
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=8; post_id=971909; floor=807
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=9; post_id=971912; floor=808
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=10; post_id=971915; floor=809
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=1; post_id=959208; floor=700
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=2; post_id=959370; floor=701
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=4; post_id=959641; floor=703
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=5; post_id=959646; floor=704
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=6; post_id=959651; floor=705
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=9; post_id=959976; floor=708
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=11; post_id=959982; floor=710
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=14; post_id=960048; floor=713
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=16; post_id=960068; floor=715
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=17; post_id=960072; floor=716
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=18; post_id=960111; floor=717
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=50; post_id=959199; floor=699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=36; post_id=824604; floor=335
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=37; post_id=824621; floor=336
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=34; post_id=960576; floor=733
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=36; post_id=960586; floor=735
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=38; post_id=960881; floor=737
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=4; post_id=963675; floor=753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=50; post_id=974730; floor=849
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=48; post_id=987233; floor=897
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=49; post_id=987234; floor=898
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=50; post_id=987239; floor=899
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=22; post_id=960244; floor=721
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=23; post_id=960245; floor=722
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=24; post_id=960247; floor=723
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=27; post_id=960254; floor=726
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=28; post_id=960439; floor=727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=30; post_id=960504; floor=729
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=31; post_id=960512; floor=730
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=33; post_id=960572; floor=732
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=37; post_id=960594; floor=736
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=39; post_id=960885; floor=738
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=6; post_id=964513; floor=755
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=8; post_id=964526; floor=757
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=10; post_id=966347; floor=759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=46; post_id=962304; floor=745
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=47; post_id=962305; floor=746
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=5; post_id=963731; floor=754
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115

<a id="world_wrc_011"></a>
## 空间龙部族

`WORLD_WRC_011` · faction · confirmed · original_campaign · high

触发：空间龙部族

空间龙部族曾居住在魔兽山脉边缘的一处秘境。悠悠的母亲救下凌迟后，追击凌迟的人类部队发现秘境并发动袭击，造成部族覆灭；该秘境的空间龙仅悠悠幸存。凌迟不是灭族的加害者。关于族长与凌迟反击入侵者的具体经过，现存资料有不同记述〔uncertain〕。幸存者的结论仅限这处秘境，不代表全世界其他空间龙的存续情况。悠悠继任空间龙族长发生在原线后期。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_011。适用时期：T0前惨剧；后期继任。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_011,WRS_027,UCL_20261003_004

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=11; record_id=WRC_011
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=114; line_end=119
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=27; record_id=WRS_027
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=31; ERC_P1_0431; post_ids=848689,848738
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/24/posts.jsonl — jsonl_line=37; post_id=848689; floor=1186
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/24/posts.jsonl — jsonl_line=38; post_id=848738; floor=1187
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=1; ERC_P2_0401; post_ids=971889,971895,971896
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=5; post_id=971889; floor=804
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=6; post_id=971895; floor=805
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=7; post_id=971896; floor=806
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=5; record_id=UCL_20261003_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=116; line_end=116
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=117; line_end=117
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119

<a id="world_wrc_012"></a>
## 娜迦

`WORLD_WRC_012` · faction · confirmed · original_campaign · high

触发：娜迦

古代高等精灵权贵因永恒之井灾变沉海、受咒变娜迦，后来苏醒，设定记歧视下等精灵与称霸目标。遗迹有被拖入者、守卫、歌唱及祭坛，沐透夺装具后施法中断；复活古神是猜测〔character_belief〕。主持说明并非整体嗜虐，水手立场不证全族受卡珊德拉指挥。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_012。适用时期：古史；旁线分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_012,SWU_FAC_005,SWU_PWR_001

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=12; record_id=WRC_012
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=51; line_end=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=22; record_id=SWU_FAC_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=21; post_id=899698; floor=270
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=23; post_id=900259; floor=272
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=27; post_id=904858; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=29; post_id=908013; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=39; post_id=914896; floor=288
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=31; post_id=909398; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=45; post_id=915859; floor=294
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=47; post_id=918376; floor=296
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=13; post_id=954394; floor=362
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=21; post_id=1042094; floor=420
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=17; post_id=955329; floor=366
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=21; post_id=955484; floor=370
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=4; post_id=991804; floor=403
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=9; post_id=1039814; floor=408
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=11; record_id=SWU_PWR_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=25; post_id=948659; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=27; post_id=948754; floor=326

<a id="world_wrc_013"></a>
## 古代精灵社会

`WORLD_WRC_013` · concept · confirmed · original_campaign · medium

触发：古代精灵社会

高等精灵是古代贵族权贵，精灵王与腰带技术有关。永恒之井灾变、内乱、王陨、技术失传被分别记述，准确年代因果未齐。泰蕾斯及克拉肯所述堕落、流亡、战争与王用腰带按证言〔character_belief〕保存，不合成全知统一灾史。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_013。适用时期：古史证言。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_013,WRS_026,SWU_PWR_001

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=13; record_id=WRC_013
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=51; line_end=54
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=171; line_end=174
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=26; record_id=WRS_026
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=19; ERC_P2_0419; post_ids=987233,987234,987239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=48; post_id=987233; floor=897
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=49; post_id=987234; floor=898
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=50; post_id=987239; floor=899
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=19; ERC_P3_0019; post_ids=1044045,1044388,1044048,1044560
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=17; post_id=1044045; floor=66
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=19; post_id=1044388; floor=68
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=18; post_id=1044048; floor=67
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=20; post_id=1044560; floor=69
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=61; ERC_P2_0461; post_ids=1031470,1031478,1032053
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=24; ERC_P3_0224; post_ids=1179677,1182889,1206254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=11; record_id=SWU_PWR_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=25; post_id=948659; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=27; post_id=948754; floor=326

<a id="world_wrc_014"></a>
## 纳萨力克地下大坟墓

`WORLD_WRC_014` · faction · confirmed · original_campaign · high

触发：纳萨力克地下大坟墓；纳萨力克；大墓地

异界迁入据点势力，安兹统领至尊造物、守护者及通行权限。据点可生成防御不死生物，安兹大量制造需尸体。用户确认正非敌意渗透查探帝国，不等帝许可或已有盟约。代理须先保密、取得成绩、查态度并优先安全。第八层禁自由参观，原乡约1500人联军战绩不作本土战绩。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_014。适用时期：迁入后；相对T0未定。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_014,FOP_006,SWU_USER_002,UCL_20261003_003

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=14; record_id=WRC_014
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=56; line_end=59
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=136; line_end=142
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=6; record_id=FOP_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=89; line_end=89
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=6; post_id=923247; floor=5
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=7; post_id=923262; floor=6
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=8; post_id=923275; floor=7
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=9; post_id=923284; floor=8
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=13; post_id=923404; floor=12
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=5; post_id=954706; floor=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=9; post_id=955110; floor=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=7; post_id=954760; floor=56
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=12; post_id=1081976; floor=111
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=10; post_id=923287; floor=9
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=11; post_id=955517; floor=60
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=13; post_id=955598; floor=62
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=15; post_id=955870; floor=64
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=38; post_id=990696; floor=87
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=2; post_id=1015970; floor=101
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=3; post_id=1016053; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=15; post_id=923436; floor=14
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=29; post_id=928408; floor=28
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=41; post_id=939231; floor=40
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=12; post_id=959984; floor=711
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=13; post_id=959986; floor=712
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=14; post_id=960048; floor=713
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=18; post_id=960111; floor=717
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=12; post_id=967530; floor=761
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=3; post_id=1072134; floor=152
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=5; post_id=1072771; floor=154
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=8; post_id=1072826; floor=157
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=9; post_id=1073337; floor=158
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=10; post_id=1073342; floor=159
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=11; post_id=1073364; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=13; post_id=1073378; floor=162
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=15; post_id=1073384; floor=164
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=35; post_id=1077728; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=1; post_id=1090502; floor=200
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=16; post_id=1073385; floor=165
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=17; post_id=1073563; floor=166
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=20; post_id=1073566; floor=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=21; post_id=1074136; floor=170
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=26; record_id=SWU_USER_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=4; record_id=UCL_20261003_003
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=88; line_end=88

<a id="world_wrc_015"></a>
## 无法地带

`WORLD_WRC_015` · location · confirmed · original_campaign · medium

触发：无法地带

山脉中央独立隔绝广阔区域，有巨大主城、实力主义和保障基本人权生命的最低限规则。三大势力为狂信者、无法组织、高等评议会，不隶属者人数最多。不是帝国普通行政区，完整地图制度未给。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_015。适用时期：既存区域。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_015

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=15; record_id=WRC_015
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=61; line_end=64

<a id="world_wrc_016"></a>
## 狂信者

`WORLD_WRC_016` · faction · confirmed · original_campaign · high

触发：狂信者

无法地带三大势力之一，统一当地宗教、奉行教条，规模次于无法组织。具体教义、神谱、领袖和全部编制未给，不由名称增写仪式能力。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_016。适用时期：既存势力。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_016

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=16; record_id=WRC_016
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=63; line_end=64

<a id="world_wrc_017"></a>
## 无法组织

`WORLD_WRC_017` · faction · confirmed · original_campaign · high

触发：无法组织

囊括无法地带三教九流黑帮，守自定规则，三势力人数最多。未证掌控整片地域，成员、收入及势力协议未给。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_017。适用时期：既存势力。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_017

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=17; record_id=WRC_017
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=63; line_end=64

<a id="world_wrc_018"></a>
## 高等评议会

`WORLD_WRC_018` · faction · confirmed · original_campaign · high

触发：高等评议会

由龙、仙人等高等种族组成，无法地带三势力人数最少，执行最低限法律、保护底层生存，隐秘目的未明。不与魔兽最高评议会合并。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_018。适用时期：既存势力。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_018

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=18; record_id=WRC_018
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=63; line_end=64

<a id="world_wrc_019"></a>
## 帝都

`WORLD_WRC_019` · location · confirmed · original_campaign · medium

触发：帝都

帝及朝廷所在，含宫路、圣庙、商住、贫民区、澡堂、水渠、河畔洗衣、店铺和节市。右近兼防务朝会民愿，哈克等代办疏渠桥路屋顶争执。报告渠道可受错误情报影响。T0有贫民生活，P3才废最后贫民区、配工作、扩城。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_019。适用时期：T0生活；新政分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_019,EMP_004,WRS_041

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=19; record_id=WRC_019
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=43; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=94; line_end=108
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=117; line_end=118
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=153; line_end=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=4; record_id=EMP_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=2; post_id=817173; floor=151
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=4; post_id=817210; floor=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=7; post_id=817395; floor=156
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=8; post_id=817429; floor=157
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=9; post_id=817432; floor=158
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=11; post_id=817447; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=35; post_id=817699; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=13; post_id=817453; floor=162
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=15; post_id=817473; floor=164
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=17; post_id=817479; floor=166
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=18; post_id=817481; floor=167
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=20; post_id=817492; floor=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=36; post_id=816817; floor=135
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=40; post_id=816879; floor=139
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=33; post_id=845797; floor=982
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=34; post_id=845814; floor=983
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=35; post_id=845826; floor=984
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=36; post_id=845834; floor=985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=42; post_id=845973; floor=991
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=43; post_id=845975; floor=992
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 3/posts.jsonl — jsonl_line=5; post_id=864692; floor=104
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 3/posts.jsonl — jsonl_line=7; post_id=864704; floor=106
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=21; line_end=26
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — source_id=P1_P002; jsonl_line=33; post_id=816651; floor=82
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=42; post_id=817008; floor=141
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=20; post_id=818410; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — document_id=MUTOU_PAGE_01; source_id=MUTOU; jsonl_line=33; post_id=846685; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — document_id=MUTOU_PAGE_01; source_id=MUTOU; jsonl_line=39; post_id=846736; floor=38
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-02/posts.jsonl — document_id=MUTOU_PAGE_02; source_id=MUTOU; jsonl_line=27; post_id=848743; floor=76
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=35; post_id=864341; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=36; post_id=989666; floor=85
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=39; post_id=990702; floor=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=41; post_id=992345; floor=90
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=43; post_id=993920; floor=92
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-02/posts.jsonl — document_id=MUTOU_PAGE_02; source_id=MUTOU; jsonl_line=5; post_id=847638; floor=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=41; record_id=WRS_041
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=42; ERC_P1_0042; post_ids=817173,817210,817395,817429,817432,817447,817699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=43; ERC_P1_0043; post_ids=817453,817473,817479,817481,817492
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=37; ERC_P1_0037; post_ids=816817,816879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=34; ERC_P1_0334; post_ids=845797,845814,845826,845834,845973,845975
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=18; ERC_P2_0018; post_ids=864692,864704
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=1; ERC_P3_0001; post_ids=1033317
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl — document_id=P3_P001; jsonl_line=1; post_id=1033317; floor=

<a id="world_wrc_020"></a>
## 边境关卡

`WORLD_WRC_020` · location · confirmed · original_campaign · medium

触发：边境关卡

关卡过去阻山脉成军魔兽深入帝国。凌迟破关、真达卡斯及三军统领死亡在T0前。原线雷光以卷轴工程、空军、Silence协同收复，休整后攻山脉。后裂变毁补给、改天险不等关城全消失，控制权路线补给分期。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_020。适用时期：失陷→收复→裂变。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_020,WRS_013,EMP_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=20; record_id=WRC_020
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=19; line_end=19
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=40; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=180; line_end=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=13; record_id=WRS_013
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=30; ERC_P1_0085; post_ids=824604,824621
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=36; post_id=824604; floor=335
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=37; post_id=824621; floor=336
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=8; ERC_P2_0208; post_ids=922821
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=34; post_id=922821; floor=433
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=44; ERC_P2_0244; post_ids=958884,958885,958896,958900,959037,959039,959104,959113,959199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=42; post_id=958884; floor=691
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=43; post_id=958885; floor=692
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=44; post_id=958896; floor=693
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=45; post_id=958900; floor=694
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=46; post_id=959037; floor=695
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=47; post_id=959039; floor=696
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=48; post_id=959104; floor=697
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=49; post_id=959113; floor=698
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=50; post_id=959199; floor=699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=61; ERC_P2_0461; post_ids=1031470,1031478,1032053
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=5; record_id=EMP_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=15; post_id=921465; floor=414
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=6; post_id=987507; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=7; post_id=987509; floor=906
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=8; post_id=987519; floor=907
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=9; post_id=987590; floor=908
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=10; post_id=987703; floor=909
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=12; post_id=987706; floor=911
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=13; post_id=987709; floor=912
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=14; post_id=987710; floor=913
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=16; post_id=987712; floor=915
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=18; post_id=987714; floor=917
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=19; post_id=987715; floor=918
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=49; post_id=989174; floor=948
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222

<a id="world_wrc_021"></a>
## 帝都近郊峡谷

`WORLD_WRC_021` · location · confirmed · original_campaign · medium

触发：帝都近郊峡谷

凌迟冒名计划败露后在峡谷惨败，队伍在此侦察毁阵救人，帝军有包围后手。识传奇法阵层次不等懂用途军令；七曜石后手因果是战后军情。处刑和伤亡责任后来发生，地点不预定重玩同样战事。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_021。适用时期：原线战事地点。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_021,DEP_002

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=21; record_id=WRC_021
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=43; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=76; line_end=86
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=2; record_id=DEP_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=24
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=25
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=28
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_014_016.jsonl — jsonl_line=25
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=20
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=21
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=23
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=24
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=2
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=37; post_id=820769; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=25; post_id=823927; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=26; post_id=823928; floor=325
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=27; post_id=824139; floor=326
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=28; post_id=824168; floor=327
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=29; post_id=824326; floor=328
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=30; post_id=824464; floor=329
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=31; post_id=824492; floor=330
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=34; post_id=824573; floor=333
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=35; post_id=824602; floor=334
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=37; post_id=824621; floor=336
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=24; post_id=843567; floor=773
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=26; post_id=843602; floor=775
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=27; post_id=843605; floor=776
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=29; post_id=843621; floor=778
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=41; post_id=843915; floor=790
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=42; post_id=843924; floor=791
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=50; post_id=843978; floor=799
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=1; post_id=845039; floor=900
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=4; post_id=845068; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=5; post_id=845076; floor=904
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=6; post_id=845079; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=7; post_id=845080; floor=906
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=9; post_id=845089; floor=908
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=10; post_id=845112; floor=909
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=11; post_id=845204; floor=910
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=12; post_id=845207; floor=911
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=14; post_id=845212; floor=913
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=23; post_id=845258; floor=922
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=24; post_id=845260; floor=923
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=25; post_id=845263; floor=924
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=26; post_id=845265; floor=925
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=27; post_id=845268; floor=926
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=33; post_id=845370; floor=932
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=34; post_id=845380; floor=933
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=35; post_id=845382; floor=934
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052

<a id="world_wrc_022"></a>
## 九雪医馆

`WORLD_WRC_022` · location · confirmed · original_campaign · medium

触发：九雪医馆

雪老孙女露露缇耶寄居好友医馆，哈克久远后来亦寄居。医馆曾废置，有大浴汤而所述时期暂不可用。住宿、求医、转荐与拜师不同，关闭与后续救治各分期，不以后来状态覆盖初访。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_022。适用时期：开闭寄居分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_022,WRS_014

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=22; record_id=WRC_022
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=83; line_end=85
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=97; line_end=108
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=14; record_id=WRS_014
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=28; ERC_P1_0028; post_ids=816141,816246,816583,816699,816704
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=35; post_id=816141; floor=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=43; post_id=816246; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — jsonl_line=29; post_id=816583; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=1; post_id=816699; floor=100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=3; post_id=816704; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=33; ERC_P1_0333; post_ids=845704,845706,845709,845724,845755,845757,845759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=12; post_id=845704; floor=961
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=14; post_id=845706; floor=963
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=15; post_id=845709; floor=964
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=16; post_id=845724; floor=965
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=26; post_id=845755; floor=975
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=27; post_id=845757; floor=976
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=28; post_id=845759; floor=977
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=59; ERC_P2_0059; post_ids=920841,920856,920892,920911,920912,920924,920927,920932,920935,920939,920942,920961,920971,920973,920981,920983,920988,920989,921016,921071
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=31; post_id=920841; floor=380
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=32; post_id=920856; floor=381
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=33; post_id=920892; floor=382
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=34; post_id=920911; floor=383
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=35; post_id=920912; floor=384
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=36; post_id=920924; floor=385
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=37; post_id=920927; floor=386
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=38; post_id=920932; floor=387
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=39; post_id=920935; floor=388
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=40; post_id=920939; floor=389
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=41; post_id=920942; floor=390
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=42; post_id=920961; floor=391
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=43; post_id=920971; floor=392
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=44; post_id=920973; floor=393
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=45; post_id=920981; floor=394
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=46; post_id=920983; floor=395
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=47; post_id=920988; floor=396
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=48; post_id=920989; floor=397
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=49; post_id=921016; floor=398
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=50; post_id=921071; floor=399

<a id="world_wrc_023"></a>
## 九重里

`WORLD_WRC_023` · location · confirmed · original_campaign · medium

触发：九重里

北方九重里雪地为久远救下哈克并命名之地。本团完整地图和政体未给，不自动导入原型同名地域的全部历史。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_023。适用时期：既往地点。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_023

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=23; record_id=WRC_023
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=101; line_end=107

<a id="world_wrc_024"></a>
## 空间龙秘境

`WORLD_WRC_024` · location · confirmed · original_campaign · medium

触发：空间龙秘境

悠悠故乡在山脉边缘，母亲救凌迟后位置暴露并遭人类奇袭，用户确认仅悠悠幸存。与后来中心龙族秘境不同，不将中心毁境倒填故乡惨剧。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_024。适用时期：T0前惨剧。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_024,WRS_027,UCL_20261003_004

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=24; record_id=WRC_024
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=114; line_end=119
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=27; record_id=WRS_027
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=31; ERC_P1_0431; post_ids=848689,848738
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/24/posts.jsonl — jsonl_line=37; post_id=848689; floor=1186
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/24/posts.jsonl — jsonl_line=38; post_id=848738; floor=1187
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=1; ERC_P2_0401; post_ids=971889,971895,971896
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=5; post_id=971889; floor=804
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=6; post_id=971895; floor=805
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=7; post_id=971896; floor=806
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=5; record_id=UCL_20261003_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=116; line_end=116
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=117; line_end=117
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119

<a id="world_wrc_025"></a>
## 龙族秘境

`WORLD_WRC_025` · location · confirmed · original_campaign · medium

触发：龙族秘境

中心聚居地不同于悠悠故乡，她称最繁荣、人口最多、类首都〔character_belief〕。实见常春、浮空宫殿、崖壁建筑街道塔楼钟声及受荣之道。空间通道可不同外部开启，初路不是永久唯一入口。仪式驻军内乱大战分期，完整毁境撤离另属过渡。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_025。适用时期：护送所见；后期分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_025,WRS_029,WRS_032

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=25; record_id=WRC_025
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=118; line_end=119
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=29; record_id=WRS_029
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=27; ERC_P1_0327; post_ids=845598,845599,845600,845604
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=44; post_id=845598; floor=943
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=45; post_id=845599; floor=944
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=46; post_id=845600; floor=945
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=47; post_id=845604; floor=946
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=2; ERC_P1_0402; post_ids=846047,846054,846061,846217
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=8; ERC_P1_0408; post_ids=846107,846109,846113,846114,846115,846116,846119,846120,846530,846531
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=38; post_id=846107; floor=1037
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=39; post_id=846109; floor=1038
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=40; post_id=846113; floor=1039
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=41; post_id=846114; floor=1040
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=42; post_id=846115; floor=1041
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=43; post_id=846116; floor=1042
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=44; post_id=846119; floor=1043
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=45; post_id=846120; floor=1044
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=24; post_id=846530; floor=1073
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=25; post_id=846531; floor=1074
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=34; ERC_P1_0534; post_ids=862100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=30; post_id=862100; floor=1379
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=32; record_id=WRS_032
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=25; ERC_P1_0425; post_ids=846884
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=11; post_id=846884; floor=1110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=21; ERC_P2_0421; post_ids=987498,987503,987507,987509
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=4; post_id=987498; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=5; post_id=987503; floor=904
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=6; post_id=987507; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=7; post_id=987509; floor=906

<a id="world_wrc_026"></a>
## 监狱塔

`WORLD_WRC_026` · location · confirmed · original_campaign · medium

触发：监狱塔

塔囚白魔等魔物，白魔关塔顶、沐透曾守卫。用户确认受魔物及魔兽双潮冲击，白魔借袭击与沐透协助逃出；各旧材料强调一潮不再二选一。完整结构囚犯及帝留白魔性命理由未明。受袭警报上报获知不同步。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_026。适用时期：囚禁→双潮脱逃。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_026,UCL_20261003_004,WMPR_010

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=26; record_id=WRC_026
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=123; line_end=130
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=5; record_id=UCL_20261003_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=116; line_end=116
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=117; line_end=117
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=10; record_id=WMPR_010
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=43; line_end=50
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=125; line_end=125
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=11; post_id=846884; floor=1110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=4; post_id=987498; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=21; post_id=1186459; floor=220
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=25; post_id=1247358; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=29; post_id=1334073; floor=228
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=30; post_id=1334089; floor=229
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/current_state.md — source_id=STATE_CONTINUATION_D3; line_start=8; line_end=24
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=36; line_end=62

<a id="world_wrc_027"></a>
## 帝都图书馆

`WORLD_WRC_027` · location · confirmed · original_campaign · medium

触发：帝都图书馆

凭卡与魔法查验准入、分层分类，异世界书有世界名编号。馆藏及推荐是查证渠道，神学猜想传闻不等世界真相。谢尔伦年轻读完初期藏书作为佳话传说保存，个人读书不使全体共知。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_027。适用时期：既存机构；查阅分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_027,WRS_015

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=27; record_id=WRC_027
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=150; line_end=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=15; record_id=WRS_015
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=50; ERC_P2_0250; post_ids=960111,960117,960242,960439,960442,960504
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=18; post_id=960111; floor=717
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=19; post_id=960117; floor=718
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=20; post_id=960242; floor=719
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=28; post_id=960439; floor=727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=29; post_id=960442; floor=728
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=30; post_id=960504; floor=729
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=56; ERC_P2_0256; post_ids=960512,964513,964526,966347,967530
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=31; post_id=960512; floor=730
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=6; post_id=964513; floor=755
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=8; post_id=964526; floor=757
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=10; post_id=966347; floor=759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=12; post_id=967530; floor=761
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=15; ERC_P2_0415; post_ids=985223,985898,986052,987018,987026,987029
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=4; ERC_P3_0204; post_ids=1061737,1062189,1062586,1066096,1066993
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=13; post_id=1061737; floor=112
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=15; post_id=1062189; floor=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=17; post_id=1062586; floor=116
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=25; post_id=1066096; floor=124
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=27; post_id=1066993; floor=126
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=24; ERC_P3_0024; post_ids=1046075
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=25; ERC_P3_0225; post_ids=1186459,1206254,1247358
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=21; post_id=1186459; floor=220
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=25; post_id=1247358; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=28; ERC_P3_0228; post_ids=1334089
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=30; post_id=1334089; floor=229

<a id="world_wrc_028"></a>
## 永恒之井

`WORLD_WRC_028` · location · confirmed · original_campaign · medium

触发：永恒之井

高等精灵滥用井能量，崩塌使许多人沉海受咒变娜迦。克拉肯关于古神迷惑、首都沉海、战争是证言〔character_belief〕，不补井结构年代古神身份和全部因果。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_028。适用时期：古代地点。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_028,WRC_041,SWU_PWR_001

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=28; record_id=WRC_028
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=51; line_end=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=41; record_id=WRC_041
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=11; record_id=SWU_PWR_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=25; post_id=948659; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=27; post_id=948754; floor=326

<a id="world_wrc_029"></a>
## 尼伯龙根

`WORLD_WRC_029` · location · rumor · original_campaign · medium

触发：尼伯龙根

帝赴尼伯龙根得永生的传说真假无人知。可说明声望，不能确认永生、通道位置或必胜能力，不导入他作同名世界地理。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_029。适用时期：传说。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_029

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=29; record_id=WRC_029
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=72; line_end=79

<a id="world_wrc_030"></a>
## YGGDRASIL

`WORLD_WRC_030` · concept · confirmed · original_campaign · medium

触发：YGGDRASIL；世界树

世界树是飞鼠、公会据点和NPC起源的游戏世界，停运待注销时迁入异界、NPC得自我意识。不作本地地名或居民通用数值体系，完整迁入机制未给。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_030。适用时期：原乡历史。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_030,WRC_050

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=30; record_id=WRC_030
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=136; line_end=142
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=50; record_id=WRC_050
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=58; line_end=59
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=138; line_end=141

<a id="world_wrc_031"></a>
## 帝赐假面

`WORLD_WRC_031` · concept · confirmed · original_campaign · medium

触发：帝赐假面

假面由帝赐予，会选择使用者，解放力量须获得帝许可。它能够提升身体、自愈和特殊力量，高度解放时可呈巨大非人形态。设定记持续消耗生命，过度使用致死会盐化。四位武将分别对应水、土、火、雷假面；龙族后来获赐，不能视为开局已经交付。克拉肯将假面与腰带同述为取得可控力量的技术〔character_belief〕，不证明两者结构、契约和副作用相同。假面总数、起源及每次确切成本尚未全给。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_031。适用时期：技术与授予分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_031,EMP_002,SWU_PWR_001

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=31; record_id=WRC_031
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=24; line_end=24
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=159; line_end=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=2; record_id=EMP_002
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=24; line_end=26
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=161; line_end=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=29; post_id=843621; floor=778
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=44; line_end=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=11; post_id=846884; floor=1110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=37; post_id=820769; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=25; post_id=823927; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=12; post_id=967530; floor=761
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=11; record_id=SWU_PWR_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=25; post_id=948659; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=27; post_id=948754; floor=326

<a id="world_wrc_032"></a>
## 古代精灵腰带技术

`WORLD_WRC_032` · concept · confirmed · original_campaign · medium

触发：古代精灵腰带技术

设定将腰带列为古代精灵王的传说级产物，可通过魔法戒指无需咏唱地施法，并经内部存在和契约借力。古代内乱后相关技术失传。过度使用腐蚀心智、可能导致内乱，只是传说与推测〔rumor〕，不是所有装具的统一副作用。白魔仍掌握制造并赠沐透Wizard驱动器，失传不能扩大为绝对无人懂。Faer装具的克拉肯、供魔与追杀娜迦本能另按个案保存。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_032。适用时期：古代技术；装具分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_032,SWU_PWR_001,SWU_PWR_002,WMPR_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=32; record_id=WRC_032
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=125; line_end=127
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=171; line_end=174
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=11; record_id=SWU_PWR_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=25; post_id=948659; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=27; post_id=948754; floor=326
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=12; record_id=SWU_PWR_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=11; post_id=931036; floor=310
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=15; post_id=931924; floor=314
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=19; post_id=939232; floor=318
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=45; post_id=893857; floor=244
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=47; post_id=893869; floor=246
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=49; post_id=893930; floor=248
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=27; post_id=1042494; floor=426
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=28; post_id=1042503; floor=427
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=29; post_id=1042800; floor=428
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=7; record_id=WMPR_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1016; line_end=1024
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1054; line_end=1069
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=14; line_end=14

<a id="world_wrc_033"></a>
## 魔宝石与魔法戒指制作

`WORLD_WRC_033` · concept · confirmed · original_campaign · medium

触发：魔宝石与魔法戒指制作

魔宝石等材料用于制作魔法戒指，戒指是腰带施法的媒介；白色魔法师掌握制造方法。博士认为沐透戒指的结构类似导力器，但宝石不同于普通七曜石，魔核或其他材料能否替代仍须实验〔character_belief〕。原线已进行演示、探测、绘图和专家召集，尚未出现新戒指或量产成品。懂原理、得到材料和完成制造不能相互替代。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_033。适用时期：技术研发分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_033,WMPR_007,SWU_PWR_004

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=33; record_id=WRC_033
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=126; line_end=127
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=171; line_end=173
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=7; record_id=WMPR_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1016; line_end=1024
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1054; line_end=1069
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=14; line_end=14
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=14; record_id=SWU_PWR_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=48; post_id=1047768; floor=447
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=49; post_id=1047852; floor=448
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=45; post_id=1047210; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=127; line_end=127
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=37; post_id=1044477; floor=436

<a id="world_wrc_034"></a>
## 贤者之石

`WORLD_WRC_034` · concept · confirmed · original_campaign · medium

触发：贤者之石

贤者之石是特殊魔宝石，设定称它为万能炼金材料，白色魔法师懂得炼成方法。这个称谓没有提供无限实现愿望的能力边界。博士称飘零大陆尚无相关发现，属于其知识范围〔character_belief〕，不否定白魔持有技术。卡珊德拉关于持石者才是本体、其他个体只有第二阶力量的说法，是辨识建议〔character_belief〕，不是通用鉴定公式。贤者之石与秘境根基石不自动视为同一物。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_034。适用时期：技术与知识分层。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_034,WMPR_001,SWU_PWR_004

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=34; record_id=WRC_034
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=125; line_end=127
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=1; record_id=WMPR_001
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=125; line_end=127
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=18; post_id=996028; floor=967
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=20; post_id=997651; floor=969
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=128; line_end=128
- https://www.kamen-rider-official.com/zukan/characters/3163 — 东映官方图鉴 笛木奏; 人物说明，读取行28–59
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=14; record_id=SWU_PWR_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=48; post_id=1047768; floor=447
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=49; post_id=1047852; floor=448
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=45; post_id=1047210; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=127; line_end=127
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=37; post_id=1044477; floor=436

<a id="world_wrc_035"></a>
## 厌魔石

`WORLD_WRC_035` · concept · confirmed · original_campaign · medium

触发：厌魔石

厌魔石是帝国掌握矿脉的稀有受限矿石，极少流入民间。设定条文记它能抵抗绝大多数A级及以下的魔力或能量打击，特制锁链另有使施法和能量使用失败的规则。临风仅手持接触带符文手铐时，感到部分魔力排斥，并未被完全阻止施法。水手的替身是消耗体力的精神力量，厌魔石是否能压制当时未知。裸矿、手铐和特制锁链的条件不同，不能扩大为压制一切异界力量，也不能用矿物评级定义人物统一胜负线。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_035。适用时期：矿物器具分开。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_035,WMPR_009,PWRM_004,SWU_PWR_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=35; record_id=WRC_035
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=176; line_end=178
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=9; record_id=WMPR_009
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=88; line_end=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=124
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=41; post_id=864574; floor=190
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=50; post_id=864917; floor=199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=37; post_id=957923; floor=386
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=36; post_id=1044064; floor=435
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=14; post_id=1068640; floor=463
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=15; post_id=1069865; floor=464
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — source_id=P2; jsonl_line=6; post_id=918970; floor=355
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — source_id=P2; jsonl_line=8; post_id=919057; floor=357
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=25; post_id=911872; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=27; post_id=912206; floor=226
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=4; record_id=PWRM_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=29; post_id=846089; floor=1028
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=31; post_id=846093; floor=1030
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=32; post_id=846094; floor=1031
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=33; post_id=846096; floor=1032
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=34; post_id=846097; floor=1033
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=36; post_id=846103; floor=1035
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=37; post_id=846104; floor=1036
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=10; post_id=846370; floor=1059
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=19; post_id=846466; floor=1068
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=40; post_id=846695; floor=1089
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=41; post_id=846698; floor=1090
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=42; post_id=846701; floor=1091
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=48; post_id=847479; floor=1147
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=7; post_id=895386; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=45; post_id=1047210; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=37; post_id=1044477; floor=436
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=9; post_id=1052875; floor=458
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=11; post_id=1055378; floor=460
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=50; post_id=917628; floor=349
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=2; post_id=917765; floor=351
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=3; post_id=917773; floor=352
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=4; post_id=917950; floor=353
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=5; post_id=917961; floor=354
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=6; post_id=918970; floor=355
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=38; post_id=970655; floor=787
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=42; post_id=970664; floor=791
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=44; post_id=970669; floor=793
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=45; post_id=970670; floor=794
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=46; post_id=970671; floor=795
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=47; post_id=970677; floor=796
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=48; post_id=971183; floor=797
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=49; post_id=971184; floor=798
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=50; post_id=971255; floor=799
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=9; post_id=1039814; floor=408
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=11; post_id=1040025; floor=410
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=15; record_id=SWU_PWR_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=4; post_id=991804; floor=403

<a id="world_wrc_036"></a>
## 魔兽之潮

`WORLD_WRC_036` · concept · confirmed · original_campaign · medium

触发：魔兽之潮

魔兽之潮是本土山脉魔兽势力有组织的攻边行动。过去它们定期攻击帝国关卡，兼有练兵和消耗过剩人口的目的，规模不一，败多胜少。凌迟统合部族后运用制空、空投和特种兵种协同，攻破边关，冲突由周期攻边发展为帝国与山脉势力的全面战争。练兵目的不意味着没有伤亡或地方后果。源文关于未来消失或改变的说法只是展望〔uncertain〕，不是已经完成的战果。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_036。适用时期：周期→全面战争。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_036,SWU_ROOT_002,FOP_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=36; record_id=WRC_036
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=19; line_end=19
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=40; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=180; line_end=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=2; record_id=SWU_ROOT_002
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=37; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=180; line_end=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=125; line_end=125
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — document_id=MUTOU_PAGE_01; source_id=MUTOU; jsonl_line=30; post_id=846491; floor=29
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — document_id=MUTOU_PAGE_01; source_id=MUTOU; jsonl_line=1; post_id=845702; floor=0
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=7; record_id=FOP_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=37; line_end=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=43; post_id=923265; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=44; post_id=923272; floor=443
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=45; post_id=923290; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=7; post_id=971896; floor=806
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=8; post_id=971909; floor=807
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=9; post_id=971912; floor=808
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=10; post_id=971915; floor=809
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=1; post_id=959208; floor=700
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=2; post_id=959370; floor=701
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=4; post_id=959641; floor=703
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=5; post_id=959646; floor=704
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=6; post_id=959651; floor=705
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=9; post_id=959976; floor=708
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=11; post_id=959982; floor=710
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=14; post_id=960048; floor=713
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=16; post_id=960068; floor=715
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=17; post_id=960072; floor=716
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=18; post_id=960111; floor=717
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=50; post_id=959199; floor=699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=36; post_id=824604; floor=335
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=37; post_id=824621; floor=336
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=46; line_end=49
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=114; line_end=119
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=150; line_end=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=34; post_id=960576; floor=733
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=36; post_id=960586; floor=735
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=38; post_id=960881; floor=737
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=4; post_id=963675; floor=753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=50; post_id=974730; floor=849
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=48; post_id=987233; floor=897
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=49; post_id=987234; floor=898
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=50; post_id=987239; floor=899
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=22; post_id=960244; floor=721
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=23; post_id=960245; floor=722
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=24; post_id=960247; floor=723
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=27; post_id=960254; floor=726
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=28; post_id=960439; floor=727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=30; post_id=960504; floor=729
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=31; post_id=960512; floor=730
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=33; post_id=960572; floor=732
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=37; post_id=960594; floor=736
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=39; post_id=960885; floor=738
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=6; post_id=964513; floor=755
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=8; post_id=964526; floor=757
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=10; post_id=966347; floor=759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=46; post_id=962304; floor=745
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=47; post_id=962305; floor=746
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=5; post_id=963731; floor=754
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193

<a id="world_wrc_037"></a>
## 魔物之潮

`WORLD_WRC_037` · concept · confirmed · original_campaign · medium

触发：魔物之潮

魔物之潮曾成批带来带敌意的异界来客或异界影响产物。“魔物”的学术定义后来趋于中性，日常用法仍带贬义，不能据此断定每位穿越者都是恶人。现有设定没有给出与魔兽之潮相同的周期或统一指挥，它也不等同Phantom催生。异界知识推动过魔法武技改革、卷轴工厂化、军事化人才培养和统一管理，应用仍受大陆法则、材料及本地理解能力限制。高塔同时遭受两种潮的冲击，不表示两种潮是同一现象。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_037。适用时期：异界输入知识吸收。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_037,SWU_ROOT_003,UCL_20261003_004

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=37; record_id=WRC_037
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=184; line_end=187
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=3; record_id=SWU_ROOT_003
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=184; line_end=187
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=186; line_end=187
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=5; record_id=UCL_20261003_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=116; line_end=116
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=117; line_end=117
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119

<a id="world_wrc_038"></a>
## 龙族灭族预言

`WORLD_WRC_038` · concept · confirmed · original_campaign · medium

触发：龙族灭族预言

龙族灭族预言的存在促使龙族同帝国协商，帝允诺协助解困。肯达转交的祖传译文、泰蕾斯所见有限一线、悠悠后来看到的多条条件未来，以及各人的解释分别保存。双子、背叛和异数的解读不自动成为事实〔character_belief〕。预见不保证实现，读者知道的内容也不自动进入T0角色记忆。完整实现条件和统一预知能力尚未给出。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_038。适用时期：预言与成事分开。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_038,WRS_022,PWRM_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=38; record_id=WRC_038
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=46; line_end=49
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=22; record_id=WRS_022
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=7; ERC_P2_0407; post_ids=973143,973252,973257,973291,973864,974262,974316,974318
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=29; post_id=973143; floor=828
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=30; post_id=973252; floor=829
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=31; post_id=973257; floor=830
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=32; post_id=973291; floor=831
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=33; post_id=973864; floor=832
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=34; post_id=974262; floor=833
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=35; post_id=974316; floor=834
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=36; post_id=974318; floor=835
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=18; ERC_P3_0018; post_ids=1043595,1043613,1049727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=13; post_id=1043595; floor=62
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=15; post_id=1043613; floor=64
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=31; post_id=1049727; floor=80
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=25; ERC_P3_0025; post_ids=1044388,1046075,1049727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=19; post_id=1044388; floor=68
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=18; ERC_P3_0218; post_ids=1078852,1078855
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=39; post_id=1078852; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=40; post_id=1078855; floor=189
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=47; ERC_P2_0047; post_ids=914145,914149,914153,914157,914171,914172,914181,914301,914582,914606
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=7; record_id=PWRM_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=408; line_end=410
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=20; post_id=863989; floor=69
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=25; post_id=864078; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=28; post_id=864087; floor=77
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=29; post_id=864293; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=30; post_id=864296; floor=79
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=32; post_id=864309; floor=81
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=34; post_id=864361; floor=83
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=36; post_id=864393; floor=85
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=38; post_id=864397; floor=87
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=40; post_id=864401; floor=89
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=42; post_id=864404; floor=91
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=44; post_id=864437; floor=93
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=45; post_id=864462; floor=94
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=47; post_id=864610; floor=96
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=23; post_id=1046125; floor=72
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=24; post_id=1046129; floor=73
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=25; post_id=1046861; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=37; post_id=1051563; floor=86
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=39; post_id=1051711; floor=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=43; post_id=1052966; floor=92
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=35; post_id=988116; floor=84
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=7; post_id=954760; floor=56
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1655; line_end=1693
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1723; line_end=1727

<a id="world_wrc_039"></a>
## 凌迟与悠悠涉及的诅咒

`WORLD_WRC_039` · concept · confirmed · original_campaign · medium

触发：凌迟与悠悠涉及的诅咒

凌迟获救时已患咒、半人半魔兽。悠悠后来患咒，专家判断寿命换魔力，威廉明确不能完全读透〔character_belief〕。原线三人合力转咒给自愿承受的御临风。转移后主持明确既有魔力和自然恢复无害，额外索取加剧，放弃抵抗意愿会暴走。复生后耶各会面者称诅咒为唯一联系、解除会回死亡〔character_belief〕，不覆盖以前所有诅咒。两处咒同源与传染全机制未给。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_039。适用时期：患咒→原线转移→神约后效。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_039,WRS_023,PWRM_006,DEP_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=39; record_id=WRC_039
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=114; line_end=119
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=23; record_id=WRS_023
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=19; ERC_P1_0419; post_ids=846744,846748,846753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=49; post_id=846744; floor=1098
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=1; post_id=846753; floor=1100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=20; ERC_P1_0520; post_ids=858359,858985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=14; post_id=858359; floor=1313
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=17; post_id=858985; floor=1316
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=22; ERC_P1_0522; post_ids=859077
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=20; post_id=859077; floor=1319
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=33; ERC_P1_0533; post_ids=860741,862100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=20; post_id=860741; floor=1369
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=30; post_id=862100; floor=1379
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=38; ERC_P1_0538; post_ids=862302,862306,862337
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=40; post_id=862302; floor=1389
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=41; post_id=862306; floor=1390
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=43; post_id=862337; floor=1392
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=44; ERC_P2_0044; post_ids=913719,913724,913726,913730,913731
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=50; post_id=913719; floor=249
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=1; post_id=913724; floor=250
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=2; post_id=913726; floor=251
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=3; post_id=913730; floor=252
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=4; post_id=913731; floor=253
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=6; record_id=PWRM_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — source_id=P1; jsonl_line=49; post_id=846744; floor=1098
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — source_id=P1; jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — source_id=P1; jsonl_line=1; post_id=846753; floor=1100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=38; post_id=913439; floor=237
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=40; post_id=913449; floor=239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=41; post_id=913450; floor=240
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=42; post_id=913492; floor=241
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=43; post_id=913501; floor=242
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=45; post_id=913595; floor=244
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=46; post_id=913665; floor=245
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=47; post_id=913700; floor=246
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=48; post_id=913709; floor=247
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=49; post_id=913717; floor=248
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=5; post_id=913733; floor=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=7; post_id=913736; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=8; post_id=913739; floor=257
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=22; post_id=1046114; floor=71
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=29; post_id=846552; floor=1078
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=33; post_id=846643; floor=1082
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=35; post_id=846651; floor=1084
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=36; post_id=846653; floor=1085
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=45; post_id=846708; floor=1094
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=5; record_id=DEP_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=20
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=21
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=22
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=23
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=33
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=38
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=21; post_id=859084; floor=1320
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=22; post_id=859087; floor=1321
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=23; post_id=859089; floor=1322
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=24; post_id=861484; floor=1373
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=23; post_id=861478; floor=1372
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=26; post_id=861774; floor=1375
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=27; post_id=861777; floor=1376

<a id="world_wrc_040"></a>
## Phantom

`WORLD_WRC_040` · concept · confirmed · original_campaign · medium

触发：Phantom

白魔大量催生Phantom，更新名单列卡珊德拉、古雷姆林、巴力西卜及欧吉尔德对应未知名者。用户确认美杜莎也是Phantom且忠于白魔。雷光军情称Gate绝望转化〔character_belief〕，阈值未明。欧吉尔德紫裂只证当幕迹象，后期成功名单不补完成时刻。养父样貌者自称人的记忆〔character_belief〕，不证明原人格连续。授权Wizard提供参考，特例不自动给每名本团Phantom。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_040。适用时期：名单与转化时间分开。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_040,WMPR_003,WMPR_004,WMPR_005,UCL_20261003_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=40; record_id=WRC_040
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=123; line_end=130
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=3; record_id=WMPR_003
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=130; line_end=130
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=146; line_end=146
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=49; post_id=1000177; floor=98
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=5; post_id=1022610; floor=104
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=12; post_id=1081976; floor=111
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=9; post_id=865910; floor=208
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=11; post_id=866075; floor=210
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=15; post_id=867048; floor=214
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=29; post_id=1334073; floor=228
- https://www.kamen-rider-official.com/zukan/characters/3160 — 东映官方图鉴 ミサ; 人物说明，读取行28–48
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=4; record_id=WMPR_004
- https://www.kamen-rider-official.com/dictionaries/works_search?initial=%E3%81%AF&search_dictionaries_form%5Bicon%5D=6&search_dictionaries_form%5Bkamen_rider_id%5D=14&utf8=%E2%9C%93 — 东映官方Wizard用语辞典 ファントム; ファントム条目，读取行42–50
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=4; post_id=987498; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=12; post_id=1055963; floor=461
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=13; post_id=1056638; floor=462
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=603; line_end=604
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=5; record_id=WMPR_005
- https://www.kamen-rider-official.com/zukan/phantoms/1414 — 东映官方图鉴 グレムリン; 说明正文，读取行44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=3; post_id=1016053; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=6; record_id=UCL_20261003_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=147; line_end=147

<a id="world_wrc_041"></a>
## 古代精灵灾变

`WORLD_WRC_041` · event · confirmed · original_campaign · high

触发：古代精灵灾变

高等精灵滥用永恒之井魔力、企图迷惑利用北海巨妖，井崩塌，大量精灵沉海受咒变娜迦，持续影响当代族群。泰蕾斯与克拉肯关于外神、古神、首都和战争的叙述各有知识范围〔character_belief〕。准确年代、战场及与内乱关系未齐，不用后人证词补成全知因果。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_041。适用时期：T0前古史。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_041,WRC_028,WRS_026

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=41; record_id=WRC_041
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=51; line_end=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=28; record_id=WRC_028
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=26; record_id=WRS_026
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=19; ERC_P2_0419; post_ids=987233,987234,987239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=48; post_id=987233; floor=897
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=49; post_id=987234; floor=898
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=50; post_id=987239; floor=899
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=19; ERC_P3_0019; post_ids=1044045,1044388,1044048,1044560
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=17; post_id=1044045; floor=66
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=19; post_id=1044388; floor=68
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=18; post_id=1044048; floor=67
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=20; post_id=1044560; floor=69
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=61; ERC_P2_0461; post_ids=1031470,1031478,1032053
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=24; ERC_P3_0224; post_ids=1179677,1182889,1206254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222

<a id="world_wrc_042"></a>
## 古代精灵内乱

`WORLD_WRC_042` · event · confirmed · original_campaign · high

触发：古代精灵内乱

古代精灵内乱、精灵王陨落，腰带技术随后失传。腰带腐蚀心智可能导致内乱只是传说推测〔rumor〕。克拉肯称王造并亲用不可控腰带、与古神同灭〔character_belief〕，分别保留，不断言内乱等同永恒之井崩塌一场事件。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_042。适用时期：T0前古史。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_042,SWU_PWR_001

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=42; record_id=WRC_042
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=171; line_end=174
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=11; record_id=SWU_PWR_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=25; post_id=948659; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=27; post_id=948754; floor=326

<a id="world_wrc_044"></a>
## 空间龙部族覆灭

`WORLD_WRC_044` · event · confirmed · original_campaign · high

触发：空间龙部族覆灭

悠悠的父母救下了身受诅咒、遭到追杀的凌迟。追击凌迟的人类部队因此发现空间龙秘境并发动奇袭，造成部族覆灭；该秘境的空间龙仅悠悠幸存。实施灭族袭击的是人类追兵。关于消灭入侵者的经过，旧设定记载族长牺牲并与敌人同归于尽，谢尔伦则讲述凌迟杀死了入侵者。两份资料对反击过程的记述不同，具体先后与各自参战经过仍未明确〔uncertain〕。 [本轮用户审阅](<C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md:225>)

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_044。适用时期：T0前既定惨剧。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_044,WRS_027,UCL_20261003_004

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=44; record_id=WRC_044
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=114; line_end=119
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=27; record_id=WRS_027
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=31; ERC_P1_0431; post_ids=848689,848738
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/24/posts.jsonl — jsonl_line=37; post_id=848689; floor=1186
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/24/posts.jsonl — jsonl_line=38; post_id=848738; floor=1187
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=1; ERC_P2_0401; post_ids=971889,971895,971896
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=5; post_id=971889; floor=804
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=6; post_id=971895; floor=805
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=7; post_id=971896; floor=806
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=5; record_id=UCL_20261003_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=116; line_end=116
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=117; line_end=117
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119

<a id="world_wrc_045"></a>
## 第一次魔兽大侵攻

`WORLD_WRC_045` · event · confirmed · original_campaign · high

触发：第一次魔兽大侵攻

凌迟统合魔兽，以空运越墙、盾阵、萨满、反魔箭和扰骑协同攻破边关，真达卡斯和三军统领阵亡，打开帝国纵深路线，周期攻边转全面战争。雪老目击回述及主持恢复过去共作证。御临风记忆后来恢复，作者知道旧史不等T0角色记得全部。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_045。适用时期：T0前军事旧史。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_045,WRS_028,EMP_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=45; record_id=WRC_045
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=40; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=180; line_end=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=28; record_id=WRS_028
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=30; ERC_P1_0085; post_ids=824604,824621
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=36; post_id=824604; floor=335
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=37; post_id=824621; floor=336
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=15; ERC_P1_0415; post_ids=846670
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=5; record_id=EMP_005
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=19; line_end=19
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=15; post_id=921465; floor=414
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=34; post_id=922821; floor=433
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=6; post_id=987507; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=7; post_id=987509; floor=906
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=8; post_id=987519; floor=907
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=9; post_id=987590; floor=908
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=10; post_id=987703; floor=909
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=12; post_id=987706; floor=911
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=13; post_id=987709; floor=912
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=14; post_id=987710; floor=913
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=16; post_id=987712; floor=915
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=18; post_id=987714; floor=917
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=19; post_id=987715; floor=918
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=49; post_id=989174; floor=948
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222

<a id="world_wrc_046"></a>
## 峡谷战

`WORLD_WRC_046` · event · confirmed · original_campaign · high

触发：峡谷战

凌迟冒名达卡斯赴都、谋借空间龙召军，败露后在近郊峡谷惨败、翌日在宫中斩首焚烧。队伍侦察毁阵救人、帝军七曜石包围后手各有步骤，幕后军令战后才告诉角色。帝及临风承担纪念和致歉义务，698名册含此前牺牲者，不是本谷当场死亡总数。此为原线战果，不预定重玩必须发生。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_046。适用时期：原线入都后历史参考。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_046,DEP_002,WRS_011

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=46; record_id=WRC_046
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=41; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=76; line_end=86
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=94; line_end=96
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=117; line_end=118
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=2; record_id=DEP_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=24
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=25
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=28
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_014_016.jsonl — jsonl_line=25
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=20
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=21
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=23
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=24
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=2
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=37; post_id=820769; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=25; post_id=823927; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=26; post_id=823928; floor=325
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=27; post_id=824139; floor=326
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=28; post_id=824168; floor=327
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=29; post_id=824326; floor=328
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=30; post_id=824464; floor=329
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=31; post_id=824492; floor=330
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=34; post_id=824573; floor=333
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=35; post_id=824602; floor=334
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=37; post_id=824621; floor=336
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=24; post_id=843567; floor=773
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=26; post_id=843602; floor=775
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=27; post_id=843605; floor=776
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=29; post_id=843621; floor=778
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=41; post_id=843915; floor=790
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=42; post_id=843924; floor=791
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=50; post_id=843978; floor=799
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=1; post_id=845039; floor=900
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=4; post_id=845068; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=5; post_id=845076; floor=904
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=6; post_id=845079; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=7; post_id=845080; floor=906
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=9; post_id=845089; floor=908
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=10; post_id=845112; floor=909
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=11; post_id=845204; floor=910
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=12; post_id=845207; floor=911
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=14; post_id=845212; floor=913
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=23; post_id=845258; floor=922
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=24; post_id=845260; floor=923
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=25; post_id=845263; floor=924
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=26; post_id=845265; floor=925
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=27; post_id=845268; floor=926
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=33; post_id=845370; floor=932
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=34; post_id=845380; floor=933
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/19/posts.jsonl — jsonl_line=35; post_id=845382; floor=934
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=11; record_id=WRS_011
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=49; ERC_P2_0249; post_ids=959984,959986,960048,960111
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=12; post_id=959984; floor=711
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=13; post_id=959986; floor=712
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=14; post_id=960048; floor=713
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=18; post_id=960111; floor=717
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=58; ERC_P2_0258; post_ids=967530
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=12; post_id=967530; floor=761
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=13; ERC_P3_0213; post_ids=1072134,1072771,1072826,1073337,1073342,1073364
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=3; post_id=1072134; floor=152
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=5; post_id=1072771; floor=154
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=8; post_id=1072826; floor=157
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=9; post_id=1073337; floor=158
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=10; post_id=1073342; floor=159
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=11; post_id=1073364; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=14; ERC_P3_0214; post_ids=1073378,1073384,1077728,1090502
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=13; post_id=1073378; floor=162
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=15; post_id=1073384; floor=164
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=35; post_id=1077728; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=1; post_id=1090502; floor=200
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=15; ERC_P3_0215; post_ids=1073385,1073563,1073566,1074136
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=16; post_id=1073385; floor=165
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=17; post_id=1073563; floor=166
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=20; post_id=1073566; floor=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=21; post_id=1074136; floor=170

<a id="world_wrc_047"></a>
## 帝国与龙族结盟

`WORLD_WRC_047` · event · confirmed · original_campaign · high

触发：帝国与龙族结盟

帝借空间龙惨剧和灭族预言谈判、安排悠悠加入阵营，谢尔伦与帝幕后推动、肯达明面牵线。护送、假面交付、仪式、驻军和共同防御逐步生效，不一瞬完成。御临风私约暂作婚约挡箭牌、尊重悠悠未来选择，公开身份不代双方完整表态，已有亲近心动羞涩也不能抹去。条约和长期处置未齐，共同作战不等全族被吞并。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_047。适用时期：原线后期外交过程。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_047,EMP_003,DEP_007,DEP_008

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=47; record_id=WRC_047
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=49; line_end=49
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=117; line_end=119
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=150; line_end=151
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=163; line_end=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=3; record_id=EMP_003
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=17; line_end=26
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=186; line_end=187
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; source_id=P3; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=25; post_id=823927; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=1; post_id=922950; floor=0
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=3; post_id=922976; floor=2
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=22; post_id=960244; floor=721
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=23; post_id=960245; floor=722
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=24; post_id=960247; floor=723
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=27; post_id=960254; floor=726
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=28; post_id=960439; floor=727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=30; post_id=960504; floor=729
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=31; post_id=960512; floor=730
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=33; post_id=960572; floor=732
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=37; post_id=960594; floor=736
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=39; post_id=960885; floor=738
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=6; post_id=964513; floor=755
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=8; post_id=964526; floor=757
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=10; post_id=966347; floor=759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=50; post_id=974730; floor=849
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=46; post_id=962304; floor=745
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=47; post_id=962305; floor=746
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=4; post_id=963675; floor=753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=5; post_id=963731; floor=754
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=7; record_id=DEP_007
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=47
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=1
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=2
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=50
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=51
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=53
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=1; post_id=921122; floor=400
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=3; post_id=921153; floor=402
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=5; post_id=921264; floor=404
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=15; post_id=921465; floor=414
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=6; post_id=921305; floor=405
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=7; post_id=921321; floor=406
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=8; post_id=921322; floor=407
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=9; post_id=921323; floor=408
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=10; post_id=921324; floor=409
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=11; post_id=921325; floor=410
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=12; post_id=921328; floor=411
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=13; post_id=921329; floor=412
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=18; post_id=960111; floor=717
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=19; post_id=960117; floor=718
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=20; post_id=960242; floor=719
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=29; post_id=960442; floor=728
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=34; post_id=960576; floor=733
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=36; post_id=960586; floor=735
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=38; post_id=960881; floor=737
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=8; record_id=DEP_008
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=6
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=10
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=13
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=28
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=29
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=2; post_id=971563; floor=801
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=24; post_id=972967; floor=823
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=25; post_id=972969; floor=824
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=26; post_id=973134; floor=825
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=27; post_id=973135; floor=826
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=28; post_id=973141; floor=827
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=29; post_id=973143; floor=828
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=12; post_id=984619; floor=861
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=13; post_id=984621; floor=862
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=14; post_id=984622; floor=863
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=16; post_id=984624; floor=865
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=17; post_id=984625; floor=866
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=18; post_id=984626; floor=867
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=19; post_id=984627; floor=868
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=20; post_id=984764; floor=869
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=32; post_id=986060; floor=881
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=33; post_id=986066; floor=882
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=9; post_id=1043386; floor=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=29; post_id=1047655; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=31; post_id=1049727; floor=80
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=27; post_id=1047252; floor=76
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=30; post_id=1047661; floor=79
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=32; post_id=1049735; floor=81
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=33; post_id=1049839; floor=82
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=35; post_id=1050484; floor=84
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=37; post_id=1051563; floor=86
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=34; post_id=1049864; floor=83

<a id="world_wrc_048"></a>
## 帝国远征军与边境战争

`WORLD_WRC_048` · event · confirmed · original_campaign · high

触发：帝国远征军与边境战争

帝在破关后调柱将领军，后来下全面扫平山脉令。雷光大量卷轴造土墙斜路支撑护盾，普通兵撕卷轴用既有效果，空军三线、Silence打击司令部，收关休整再进山。人口20亿、可远征常备1000万、预计4000万动员属特定官员报告〔character_belief〕，不与15万兵工厂行动机械相加。地裂后有撤溃，局部胜利不等战争永终。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_048。适用时期：原线后期军史参考。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_048,EMP_005,DEP_009

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=48; record_id=WRC_048
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=43; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=180; line_end=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=5; record_id=EMP_005
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=19; line_end=19
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=40; line_end=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=36; post_id=824604; floor=335
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=37; post_id=824621; floor=336
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=15; post_id=921465; floor=414
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=34; post_id=922821; floor=433
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=6; post_id=987507; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=7; post_id=987509; floor=906
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=8; post_id=987519; floor=907
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=9; post_id=987590; floor=908
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=10; post_id=987703; floor=909
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=12; post_id=987706; floor=911
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=13; post_id=987709; floor=912
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=14; post_id=987710; floor=913
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=16; post_id=987712; floor=915
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=18; post_id=987714; floor=917
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=19; post_id=987715; floor=918
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=49; post_id=989174; floor=948
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=9; record_id=DEP_009
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=4
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=8
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=45
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=25
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=61
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=62
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=63
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=64
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=50; post_id=959199; floor=699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=38; post_id=988114; floor=937
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=39; post_id=988124; floor=938
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=40; post_id=988157; floor=939
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=45; post_id=1032055; floor=1194
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=46; post_id=1032480; floor=1195
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=47; post_id=1032502; floor=1196
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=48; post_id=1032913; floor=1197
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=50; post_id=1033262; floor=1199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 25/posts.jsonl — jsonl_line=1; post_id=1033271; floor=1200
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 25/posts.jsonl — jsonl_line=2; post_id=1033311; floor=1201
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 25/posts.jsonl — jsonl_line=3; post_id=1033315; floor=1202
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 25/posts.jsonl — jsonl_line=4; post_id=1033318; floor=1203

<a id="world_wrc_049"></a>
## 监狱塔脱逃

`WORLD_WRC_049` · event · confirmed · original_campaign · high

触发：监狱塔脱逃

塔遭魔物与魔兽双潮冲击，白魔借袭击及沐透协助逃出。用户明确御临风换路线不自动取消此敌方行动。驱动器交易、Phantom活动和地方警报各有时序，不能相邻履历拼每步日期。后台破塔军报、沐透上报、派援及人物获知分别保存，两潮旧词保留但不再二选一。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_049。适用时期：独立敌方行动；获知分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_049,UCL_20261003_001,UCL_20261003_004,WMPR_010

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=49; record_id=WRC_049
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=123; line_end=130
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=2; record_id=UCL_20261003_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=43; line_end=43
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=44; line_end=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=45; line_end=45
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=5; record_id=UCL_20261003_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=116; line_end=116
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=117; line_end=117
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=10; record_id=WMPR_010
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=43; line_end=50
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=125; line_end=125
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=11; post_id=846884; floor=1110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=4; post_id=987498; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=21; post_id=1186459; floor=220
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=25; post_id=1247358; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=29; post_id=1334073; floor=228
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=30; post_id=1334089; floor=229
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/current_state.md — source_id=STATE_CONTINUATION_D3; line_start=8; line_end=24
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=36; line_end=62

<a id="world_wrc_050"></a>
## 纳萨力克异界迁入

`WORLD_WRC_050` · event · confirmed · original_campaign · high

触发：纳萨力克异界迁入

YGGDRASIL停运待注销时，飞鼠与据点迁入异界，NPC得自我意识；飞鼠后用安兹·乌尔·恭名、保留能力并有不死生物生理情绪变化。皮奇的四十位创造者离去及自责解释保证言范围〔character_belief〕，不代离去真因。迁入机制和相对T0日历未齐，不把代理活动倒填开局。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_050。适用时期：停运后迁入；相对T0未定。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_050,WRC_030,FOP_006

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=50; record_id=WRC_050
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=58; line_end=59
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=138; line_end=141
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=30; record_id=WRC_030
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=136; line_end=142
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=6; record_id=FOP_006
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=56; line_end=59
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=89; line_end=89
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=6; post_id=923247; floor=5
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=7; post_id=923262; floor=6
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=8; post_id=923275; floor=7
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=9; post_id=923284; floor=8
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=13; post_id=923404; floor=12
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=5; post_id=954706; floor=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=9; post_id=955110; floor=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=7; post_id=954760; floor=56
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=12; post_id=1081976; floor=111
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=10; post_id=923287; floor=9
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=11; post_id=955517; floor=60
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=13; post_id=955598; floor=62
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=15; post_id=955870; floor=64
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=38; post_id=990696; floor=87
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=2; post_id=1015970; floor=101
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=3; post_id=1016053; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=15; post_id=923436; floor=14
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=29; post_id=928408; floor=28
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=41; post_id=939231; floor=40
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=12; post_id=959984; floor=711
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=13; post_id=959986; floor=712
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=14; post_id=960048; floor=713
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=18; post_id=960111; floor=717
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=12; post_id=967530; floor=761
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=3; post_id=1072134; floor=152
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=5; post_id=1072771; floor=154
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=8; post_id=1072826; floor=157
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=9; post_id=1073337; floor=158
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=10; post_id=1073342; floor=159
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=11; post_id=1073364; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=13; post_id=1073378; floor=162
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=15; post_id=1073384; floor=164
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=35; post_id=1077728; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=1; post_id=1090502; floor=200
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=16; post_id=1073385; floor=165
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=17; post_id=1073563; floor=166
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=20; post_id=1073566; floor=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=21; post_id=1074136; floor=170

<a id="world_wrc_051"></a>
## 主神式任务机制

`WORLD_WRC_051` · concept · confirmed · original_campaign · medium

触发：主神式任务机制

御临风由主神带到异界，早期实际收到《无限恐怖》式任务；边关到达场景不代穿越原因。用户明确从村子起软重启，主神及幻剑机制直接移除。已发生投放、任务、师承和关系仍留前史，T0不再自动主神任务结算兑换和幻剑引导。移除不增写神明失踪、幻剑死亡或第二穿越，也不合梦为统一机制。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_051。适用时期：投放前史；村庄起机制移除。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_051,UCL_20261003_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=51; record_id=WRC_051
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=3; line_end=17
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=25; line_end=27
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=114; line_end=123
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=149; line_end=168
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=8; record_id=UCL_20261003_007
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=186; line_end=186
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=187; line_end=187

<a id="world_wrc_052"></a>
## 边关七日任务

`WORLD_WRC_052` · event · confirmed · original_campaign · high

触发：边关七日任务

御临风、黄泉、姜子尤及另三现代人被投放边关，由幻剑引导，作为士兵守边七日、失败抹杀，期间结识成长并执行军事任务。庆功宴中断与从村庄软重启是团史制作阶段，不写角色经历世界暂停。村庄后主神幻剑机制移除，不继续发布旧任务。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_052。适用时期：T0前投放守关。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_052,UCL_20261003_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=52; record_id=WRC_052
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=19; line_end=29
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=45; line_end=56
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=104; line_end=123
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=8; record_id=UCL_20261003_007
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=186; line_end=186
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=187; line_end=187

<a id="world_wrc_053"></a>
## 第八号当铺

`WORLD_WRC_053` · faction · confirmed · original_campaign · high

触发：第八号当铺

御临风边关前史与当铺掌柜以正面情感换生存机会，用户已定既往经历，不在重玩中重选。仅知当铺掌柜和交易，完整组织、空间、营业和跨世界范围未给。后期韩诺／当铺是兄弟会问答的假答案，不当真实组织网点。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_053。适用时期：T0前交易机构。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_053,WRC_056,UCL_20261003_001

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=53; record_id=WRC_053
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=94; line_end=102
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=204; line_end=215
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=242; line_end=257
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=56; record_id=WRC_056
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=242; line_end=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=2; record_id=UCL_20261003_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=43; line_end=43
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=44; line_end=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=45; line_end=45

<a id="world_wrc_054"></a>
## 弃风剑

`WORLD_WRC_054` · concept · confirmed · original_campaign · medium

触发：弃风剑

御临风边关前史取得弃风、后用于战斗悟招，取得过程未全给。原线修复需高阶风材料、悠悠给风七曜石，稳定修复才有新版传奇长剑和内置风池。旧剑失控修复后各不同版本，不倒填T0风池和成果，不把两版优势叠加，一次救援不证所有招式全范围必杀。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_054。适用时期：旧剑→原线修复新版。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_054,PWRM_004,DEP_003

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=54; record_id=WRC_054
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=74; line_end=78
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=234; line_end=237
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=249; line_end=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=4; record_id=PWRM_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=29; post_id=846089; floor=1028
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=31; post_id=846093; floor=1030
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=32; post_id=846094; floor=1031
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=33; post_id=846096; floor=1032
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=34; post_id=846097; floor=1033
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=36; post_id=846103; floor=1035
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=37; post_id=846104; floor=1036
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=10; post_id=846370; floor=1059
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=19; post_id=846466; floor=1068
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=40; post_id=846695; floor=1089
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=41; post_id=846698; floor=1090
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=42; post_id=846701; floor=1091
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=48; post_id=847479; floor=1147
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=7; post_id=895386; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=45; post_id=1047210; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=37; post_id=1044477; floor=436
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=9; post_id=1052875; floor=458
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=11; post_id=1055378; floor=460
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=50; post_id=917628; floor=349
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=2; post_id=917765; floor=351
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=3; post_id=917773; floor=352
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=4; post_id=917950; floor=353
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=5; post_id=917961; floor=354
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — jsonl_line=6; post_id=918970; floor=355
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=38; post_id=970655; floor=787
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=42; post_id=970664; floor=791
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=44; post_id=970669; floor=793
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=45; post_id=970670; floor=794
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=46; post_id=970671; floor=795
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=47; post_id=970677; floor=796
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=48; post_id=971183; floor=797
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=49; post_id=971184; floor=798
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=50; post_id=971255; floor=799
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=9; post_id=1039814; floor=408
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=11; post_id=1040025; floor=410
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=3; record_id=DEP_003
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=14
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=15
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=16
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=17
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=18
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=29; post_id=846552; floor=1078
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=33; post_id=846643; floor=1082
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=35; post_id=846651; floor=1084
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=36; post_id=846653; floor=1085
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=45; post_id=846708; floor=1094
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=46; post_id=846710; floor=1095
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=39; post_id=846688; floor=1088
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=43; post_id=846705; floor=1092
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=44; post_id=846706; floor=1093
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=47; post_id=846714; floor=1096
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=49; post_id=846744; floor=1098

<a id="world_wrc_055"></a>
## 贞子首次救命

`WORLD_WRC_055` · event · confirmed · original_campaign · high

触发：贞子首次救命

御临风边关第一次军事任务濒死，被山脉飘荡女鬼贞子救下；与雪老执行任务另有前史。后来原帖恢复救命关系记忆。此与之后索命形式再救和记忆封锁为不同阶段，不把全部动机代价写同一次交易。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_055。适用时期：T0前救命旧史。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_055,WRS_031

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=55; record_id=WRC_055
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=80; line_end=92
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=249; line_end=253
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=31; record_id=WRS_031
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=2; ERC_P1_0402; post_ids=846047,846054,846061,846217
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=4; ERC_P2_0204; post_ids=921465
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=15; post_id=921465; floor=414
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=8; ERC_P2_0208; post_ids=922821
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=34; post_id=922821; floor=433
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=22; ERC_P2_0422; post_ids=987507,987509,987519,987590,987703,987706,987709,987710,987712,987714,987715,989174
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=6; post_id=987507; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=7; post_id=987509; floor=906
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=8; post_id=987519; floor=907
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=9; post_id=987590; floor=908
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=10; post_id=987703; floor=909
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=12; post_id=987706; floor=911
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=13; post_id=987709; floor=912
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=14; post_id=987710; floor=913
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=16; post_id=987712; floor=915
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=18; post_id=987714; floor=917
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=19; post_id=987715; floor=918
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=49; post_id=989174; floor=948
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=61; ERC_P2_0461; post_ids=1031470,1031478,1032053
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=24; ERC_P3_0224; post_ids=1179677,1182889,1206254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222

<a id="world_wrc_056"></a>
## 第八号当铺交易

`WORLD_WRC_056` · event · confirmed · original_campaign · high

触发：第八号当铺交易

第二次军事任务濒死，御临风以正面情感向当铺掌柜换生存。用户确认此为过往，不重新选择，不把救自己救雪老擅合新动机。后期威廉识契约、恢复情感记忆是原线处理，不证一切契约都可无代价解除，亦不把后来全部情绪机械归交易。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_056。适用时期：T0前固定经历；解约后期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_056,UCL_20261003_001,DEP_003

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=56; record_id=WRC_056
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=94; line_end=102
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=242; line_end=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=2; record_id=UCL_20261003_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=43; line_end=43
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=44; line_end=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=45; line_end=45
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=3; record_id=DEP_003
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=14
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=15
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=16
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=17
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=18
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=29; post_id=846552; floor=1078
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=33; post_id=846643; floor=1082
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=35; post_id=846651; floor=1084
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=36; post_id=846653; floor=1085
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=45; post_id=846708; floor=1094
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=40; post_id=846695; floor=1089
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=46; post_id=846710; floor=1095
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=41; post_id=846698; floor=1090
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=42; post_id=846701; floor=1091
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=48; post_id=847479; floor=1147
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=39; post_id=846688; floor=1088
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=43; post_id=846705; floor=1092
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=44; post_id=846706; floor=1093
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=47; post_id=846714; floor=1096
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=49; post_id=846744; floor=1098

<a id="world_wrc_057"></a>
## 边关破后失散

`WORLD_WRC_057` · event · confirmed · original_campaign · high

触发：边关破后失散

破关后投放者陆续清醒、失散及遭追杀，御临风进入逃亡和村庄阶段。失陷是军事旧史，用户明确村庄起软重启、主神幻剑机制直接移除，是运行变更，不补敌人杀主神或角色见神失踪。T0保留投放及关系，不运行旧机制。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_057。适用时期：T0前；机制变更另记。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_057,UCL_20261003_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=57; record_id=WRC_057
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=104; line_end=123
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=224; line_end=240
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=8; record_id=UCL_20261003_007
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=186; line_end=186
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=187; line_end=187

<a id="world_wrc_058"></a>
## 御临风追杀与记忆封锁

`WORLD_WRC_058` · event · confirmed · original_campaign · high

触发：御临风追杀与记忆封锁

前史记御临风遭黄祸龙狼追杀，由贞子以索命形式再救并封锁记忆。后来逐步恢复边关、贞子和追杀经历，作者历史与当时可记内容分开。T0不默认为他知道全部旧交易和动机，不由失忆补未给因果。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_058。适用时期：T0前；记忆后来恢复。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_058,WRS_031,DEP_003

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=58; record_id=WRC_058
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=125; line_end=137
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=255; line_end=257
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=31; record_id=WRS_031
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=2; ERC_P1_0402; post_ids=846047,846054,846061,846217
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=4; ERC_P2_0204; post_ids=921465
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=15; post_id=921465; floor=414
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=8; ERC_P2_0208; post_ids=922821
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=34; post_id=922821; floor=433
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=22; ERC_P2_0422; post_ids=987507,987509,987519,987590,987703,987706,987709,987710,987712,987714,987715,989174
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=6; post_id=987507; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=7; post_id=987509; floor=906
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=8; post_id=987519; floor=907
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=9; post_id=987590; floor=908
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=10; post_id=987703; floor=909
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=12; post_id=987706; floor=911
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=13; post_id=987709; floor=912
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=14; post_id=987710; floor=913
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=16; post_id=987712; floor=915
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=18; post_id=987714; floor=917
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=19; post_id=987715; floor=918
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=49; post_id=989174; floor=948
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=61; ERC_P2_0461; post_ids=1031470,1031478,1032053
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=24; ERC_P3_0224; post_ids=1179677,1182889,1206254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=3; record_id=DEP_003
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=14
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=15
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=16
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=17
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=18
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=29; post_id=846552; floor=1078
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=33; post_id=846643; floor=1082
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=35; post_id=846651; floor=1084
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=36; post_id=846653; floor=1085
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=45; post_id=846708; floor=1094
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=40; post_id=846695; floor=1089
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=46; post_id=846710; floor=1095
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=41; post_id=846698; floor=1090
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=42; post_id=846701; floor=1091
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=48; post_id=847479; floor=1147
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=39; post_id=846688; floor=1088
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=43; post_id=846705; floor=1092
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=44; post_id=846706; floor=1093
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=47; post_id=846714; floor=1096
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=49; post_id=846744; floor=1098

<a id="world_wrc_059"></a>
## 雅儿商队与山寨庙事件

`WORLD_WRC_059` · event · confirmed · original_campaign · high

触发：雅儿商队与山寨庙事件

逃亡中御临风听破关消息，结识遭山贼打劫的雅儿商队，卷入并瓦解山寨庙事件。此衔接边关逃亡与帝都报信，既往关系保留。口述无全战斗敌人表路线，不扩新战果或幕后组织。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_059。适用时期：第一部正式记录前。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_059

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=59; record_id=WRC_059
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=139; line_end=147

<a id="world_wrc_061"></a>
## 耶各相关死亡秩序

`WORLD_WRC_061` · concept · character_belief · original_campaign · medium

触发：耶各相关死亡秩序

耶各会面者称本界无所属神、信仰不能供力、无法直接涉足、只知一个代行者，保存其视野〔character_belief〕。主持确认复生授能和医馆实物套装，明确后效可承接主线，不载梦内场景或神界全地理。复生后诅咒唯一联系、解除再死告诫不盖以前所有诅咒，不导外部费伦神学。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_061。适用时期：复生后主世界后效。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_061,WRS_037,PWRM_006

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=61; record_id=WRC_061
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=186; line_end=215
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=37; record_id=WRS_037
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=40; ERC_P2_0040; post_ids=913439,913449,913450,913492,913501,913595,913665
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=38; post_id=913439; floor=237
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=40; post_id=913449; floor=239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=41; post_id=913450; floor=240
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=42; post_id=913492; floor=241
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=43; post_id=913501; floor=242
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=45; post_id=913595; floor=244
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=46; post_id=913665; floor=245
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=41; ERC_P2_0041; post_ids=913665,913700,913709
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=47; post_id=913700; floor=246
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=48; post_id=913709; floor=247
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=43; ERC_P2_0043; post_ids=913700,913709,913717,913733,913736,913739
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=49; post_id=913717; floor=248
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=5; post_id=913733; floor=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=7; post_id=913736; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=8; post_id=913739; floor=257
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=44; ERC_P2_0044; post_ids=913719,913724,913726,913730,913731
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=50; post_id=913719; floor=249
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=1; post_id=913724; floor=250
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=2; post_id=913726; floor=251
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=3; post_id=913730; floor=252
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=4; post_id=913731; floor=253
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=48; ERC_P2_0048; post_ids=914149,914153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=42; ERC_P2_0042; post_ids=913700
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=6; record_id=PWRM_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — source_id=P1; jsonl_line=49; post_id=846744; floor=1098
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — source_id=P1; jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — source_id=P1; jsonl_line=1; post_id=846753; floor=1100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=49; post_id=846744; floor=1098
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=1; post_id=846753; floor=1100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=14; post_id=858359; floor=1313
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=17; post_id=858985; floor=1316
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=20; post_id=859077; floor=1319
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=20; post_id=860741; floor=1369
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=30; post_id=862100; floor=1379
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=40; post_id=862302; floor=1389
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=41; post_id=862306; floor=1390
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=43; post_id=862337; floor=1392
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=22; post_id=1046114; floor=71
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=29; post_id=846552; floor=1078
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=33; post_id=846643; floor=1082
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=35; post_id=846651; floor=1084
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=36; post_id=846653; floor=1085
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=45; post_id=846708; floor=1094
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446

<a id="world_wrc_062"></a>
## 飘零祭

`WORLD_WRC_062` · concept · confirmed · original_campaign · medium

触发：飘零祭

飘零祭纪念夏去冬来，帝每年冬初在城外点首个祭火、祈来年庇佑。宫前摊位、学校活动、游戏、圣庙祭坛联系居民生活。军官“两天后”只相对日期。军武演习御前擂台早期仅听闻〔rumor〕，不当已举办。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_062。适用时期：年度节庆；本届活动分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRC_062,WRS_038

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_candidates.jsonl — jsonl_line=62; record_id=WRC_062
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — source_id=P1_P002; jsonl_line=47; post_id=816684; floor=96
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=38; record_id=WRS_038
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=34; ERC_P1_0334; post_ids=845797,845814,845826,845834,845973,845975
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=33; post_id=845797; floor=982
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=34; post_id=845814; floor=983
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=35; post_id=845826; floor=984
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=36; post_id=845834; floor=985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=42; post_id=845973; floor=991
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=43; post_id=845975; floor=992
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=24; ERC_P2_0024; post_ids=874508,874647,878056,899931,900199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=22; post_id=874508; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=23; post_id=874647; floor=172
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=25; post_id=878056; floor=174
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=46; post_id=899931; floor=195
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=48; post_id=900199; floor=197
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=1; ERC_P3_0001; post_ids=1033317
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl — document_id=P3_P001; jsonl_line=1; post_id=1033317; floor=

<a id="world_wrc_063"></a>
## 帝国教育与知识传播

`WORLD_WRC_063` · concept · confirmed · original_campaign · medium

触发：帝国教育与知识传播

可购国文数学历史地理武技及基础魔法教材，学城有教师任职出版活动。初级数学含四则九九面积及3.14，教材归诸理论于帝和后世数学家是书中内容，不全知数学史。雪拉已送帝赠书到孤儿院，猫音免费领书为哈克转述个案〔character_belief〕，非全国义教，识字语种专业各有门槛。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_063。适用时期：既有渠道；个案分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_039,EMP_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=39; record_id=WRS_039
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=8; ERC_P2_0008; post_ids=863001,863002,863005,863009
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=31; post_id=863001; floor=30
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=32; post_id=863002; floor=31
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=33; post_id=863005; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=35; post_id=863009; floor=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=13; ERC_P2_0013; post_ids=863462,863468,863469,863470,863472
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=4; post_id=863462; floor=53
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=6; post_id=863468; floor=55
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=7; post_id=863469; floor=56
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=8; post_id=863470; floor=57
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=9; post_id=863472; floor=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=24; ERC_P2_0024; post_ids=874508,874647,878056,899931,900199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=22; post_id=874508; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=23; post_id=874647; floor=172
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=25; post_id=878056; floor=174
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=46; post_id=899931; floor=195
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=48; post_id=900199; floor=197
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=13; ERC_P1_0513; post_ids=851837,852222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=50; post_id=851837; floor=1249
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/26/posts.jsonl — jsonl_line=9; post_id=852222; floor=1258
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=7; record_id=EMP_007
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=30; post_id=816127; floor=29
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=32; post_id=816130; floor=31
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=33; post_id=816133; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=34; post_id=816137; floor=33
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=35; post_id=816141; floor=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=38; post_id=816170; floor=37
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=41; post_id=816201; floor=40
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=43; post_id=816246; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=47; post_id=816280; floor=46
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — jsonl_line=29; post_id=816583; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=1; post_id=816699; floor=100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=3; post_id=816704; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=23; post_id=915324; floor=322
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=31; post_id=915456; floor=330
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=32; post_id=915502; floor=331
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=35; post_id=915755; floor=334
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=38; post_id=915989; floor=337
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=39; post_id=916086; floor=338
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=1; post_id=819306; floor=250
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=2; post_id=819320; floor=251
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=3; post_id=819325; floor=252
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=4; post_id=819333; floor=253
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=29; post_id=846089; floor=1028
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=31; post_id=846093; floor=1030
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=32; post_id=846094; floor=1031
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=33; post_id=846096; floor=1032
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=34; post_id=846097; floor=1033
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=36; post_id=846103; floor=1035
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=37; post_id=846104; floor=1036
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=10; post_id=846370; floor=1059
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=19; post_id=846466; floor=1068
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=36; post_id=845834; floor=985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=37; post_id=845835; floor=986
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=38; post_id=845836; floor=987
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=39; post_id=845880; floor=988
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=40; post_id=845914; floor=989
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=41; post_id=845931; floor=990
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=44; post_id=845976; floor=993
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=45; post_id=845977; floor=994
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=46; post_id=845982; floor=995
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=47; post_id=845983; floor=996
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=48; post_id=845985; floor=997
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=49; post_id=845988; floor=998
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=5; post_id=819466; floor=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=6; post_id=819483; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=7; post_id=819493; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=8; post_id=819499; floor=257
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=30; post_id=820363; floor=279
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=25; line_end=25
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=33; line_end=35
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=10; post_id=816720; floor=109
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=11; post_id=816721; floor=110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=15; post_id=816726; floor=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=50; post_id=845994; floor=999
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=40; post_id=851625; floor=1239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=44; post_id=851773; floor=1243
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=25; post_id=816745; floor=124
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=27; post_id=816778; floor=126
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=6; post_id=817368; floor=155
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=11; post_id=817447; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=22; post_id=817537; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=24; post_id=817616; floor=173
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=42; post_id=863173; floor=41
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=43; post_id=863343; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=50; post_id=863417; floor=49
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=2; post_id=863435; floor=51
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=3; post_id=863447; floor=52
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=38; post_id=846107; floor=1037
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=39; post_id=846109; floor=1038
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=40; post_id=846113; floor=1039
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=41; post_id=846114; floor=1040
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=42; post_id=846115; floor=1041
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=43; post_id=846116; floor=1042
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=44; post_id=846119; floor=1043
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=45; post_id=846120; floor=1044
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=24; post_id=846530; floor=1073
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=25; post_id=846531; floor=1074
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=25; post_id=1042442; floor=424
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=33; post_id=1043390; floor=432
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=35; post_id=1043686; floor=434
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=37; post_id=1044477; floor=436
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=7; post_id=895386; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=45; post_id=1047210; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=49; post_id=1047852; floor=448

<a id="world_wrc_064"></a>
## 帝国医疗与药理

`WORLD_WRC_064` · concept · confirmed · original_campaign · medium

触发：帝国医疗与药理

村医读稿配药、同门转荐，住宿求学拜师不同。曼吉恢复严重伤仍建议配药休养；洛暂抑毒，次日军医镇医联合治疗。艾利范围次数和耗竭须保护，治疗不等普适复活或立即除一切损害。药品抑毒伤害恢复和持续供魔各按条文，尸检身份与殡仪仍存在。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_064。适用时期：专业与救治分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_040,SWU_SOC_003,PWRM_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=40; record_id=WRS_040
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=13; ERC_P1_0013; post_ids=816127,816130,816133,816137,816141,816170
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=30; post_id=816127; floor=29
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=32; post_id=816130; floor=31
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=33; post_id=816133; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=34; post_id=816137; floor=33
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=35; post_id=816141; floor=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=38; post_id=816170; floor=37
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=15; ERC_P1_0015; post_ids=816170,816201,816246,816280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=41; post_id=816201; floor=40
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=43; post_id=816246; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=47; post_id=816280; floor=46
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=28; ERC_P1_0028; post_ids=816141,816246,816583,816699,816704
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — jsonl_line=29; post_id=816583; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=1; post_id=816699; floor=100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=3; post_id=816704; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=16; ERC_P1_0016; post_ids=816201
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=18; ERC_P1_0073; post_ids=820309,820410,820809,820811,820815,821913,822094
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=25; post_id=820309; floor=274
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=31; post_id=820410; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=39; post_id=820809; floor=288
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=40; post_id=820811; floor=289
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=41; post_id=820815; floor=290
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=2; post_id=821913; floor=301
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=4; post_id=822094; floor=303
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=51; ERC_P2_0051; post_ids=915324,915456,915502,915755,915989,916086
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=23; post_id=915324; floor=322
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=31; post_id=915456; floor=330
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=32; post_id=915502; floor=331
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=35; post_id=915755; floor=334
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=38; post_id=915989; floor=337
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=39; post_id=916086; floor=338
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=6; record_id=SWU_SOC_003
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=7; post_id=862103; floor=156
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=37; post_id=864394; floor=186
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=13; post_id=1040709; floor=412
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=17; post_id=1041251; floor=416
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=5; record_id=PWRM_005
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=408; line_end=414

<a id="world_wrc_065"></a>
## 帝都市政与公共生活

`WORLD_WRC_065` · concept · confirmed · original_campaign · medium

触发：帝都市政与公共生活

有热水澡堂水渠洗衣民居店铺节市，右近委哈克等办下水桥路屋顶争执。战后补给运输、兵工厂投入、国库刺激市场、过冬品易买，P3新政才废最后贫民区、配多数无职者工作扩城。不表示帝国从无贫穷、T0已获改革。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_065。适用时期：T0市政；P3改革。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_041,EMP_004,EMP_008

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=41; record_id=WRS_041
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=42; ERC_P1_0042; post_ids=817173,817210,817395,817429,817432,817447,817699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=2; post_id=817173; floor=151
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=4; post_id=817210; floor=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=7; post_id=817395; floor=156
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=8; post_id=817429; floor=157
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=9; post_id=817432; floor=158
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=11; post_id=817447; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=35; post_id=817699; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=43; ERC_P1_0043; post_ids=817453,817473,817479,817481,817492
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=13; post_id=817453; floor=162
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=15; post_id=817473; floor=164
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=17; post_id=817479; floor=166
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=18; post_id=817481; floor=167
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=20; post_id=817492; floor=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=37; ERC_P1_0037; post_ids=816817,816879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=36; post_id=816817; floor=135
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=40; post_id=816879; floor=139
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=34; ERC_P1_0334; post_ids=845797,845814,845826,845834,845973,845975
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=33; post_id=845797; floor=982
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=34; post_id=845814; floor=983
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=35; post_id=845826; floor=984
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=36; post_id=845834; floor=985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=42; post_id=845973; floor=991
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=43; post_id=845975; floor=992
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=18; ERC_P2_0018; post_ids=864692,864704
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 3/posts.jsonl — jsonl_line=5; post_id=864692; floor=104
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 3/posts.jsonl — jsonl_line=7; post_id=864704; floor=106
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=1; ERC_P3_0001; post_ids=1033317
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl — document_id=P3_P001; jsonl_line=1; post_id=1033317; floor=
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=4; record_id=EMP_004
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=21; line_end=26
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — source_id=P1_P002; jsonl_line=33; post_id=816651; floor=82
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=42; post_id=817008; floor=141
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=20; post_id=818410; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — document_id=MUTOU_PAGE_01; source_id=MUTOU; jsonl_line=33; post_id=846685; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — document_id=MUTOU_PAGE_01; source_id=MUTOU; jsonl_line=39; post_id=846736; floor=38
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-02/posts.jsonl — document_id=MUTOU_PAGE_02; source_id=MUTOU; jsonl_line=27; post_id=848743; floor=76
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=35; post_id=864341; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=36; post_id=989666; floor=85
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=39; post_id=990702; floor=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=41; post_id=992345; floor=90
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=43; post_id=993920; floor=92
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-02/posts.jsonl — document_id=MUTOU_PAGE_02; source_id=MUTOU; jsonl_line=5; post_id=847638; floor=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=8; record_id=EMP_008
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=184; line_end=187
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=23; post_id=1042344; floor=422
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=46; post_id=962304; floor=745
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=47; post_id=962305; floor=746
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=4; post_id=963675; floor=753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=5; post_id=963731; floor=754
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=43; line_end=43

<a id="world_wrc_066"></a>
## 帝国军令与情报渠道

`WORLD_WRC_066` · concept · confirmed · original_campaign · medium

触发：帝国军令与情报渠道

直属上报、部门朝会和密谈有权限，雷光处屏蔽侦知、要求本人报、归还笔记并保密，战争有通信卷轴。渠道不保真实，报信队长在达卡斯设局现场同在；右近称帝令助捕、达不控全城卫〔character_belief〕。截信伪造眼线保语境，排查不逐名洗清定罪、不让全军全知。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_066。适用时期：既存渠道；消息分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_042,EMP_006,FOP_004

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=42; record_id=WRS_042
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=38; ERC_P1_0038; post_ids=817008,817022,817026,817134,817157,817167
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=42; post_id=817008; floor=141
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=43; post_id=817022; floor=142
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=44; post_id=817026; floor=143
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=45; post_id=817134; floor=144
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=46; post_id=817157; floor=145
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=50; post_id=817167; floor=149
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=2; ERC_P1_0057; post_ids=818345,818410,822923,822961,823045,823132
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=9; post_id=818345; floor=208
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=20; post_id=818410; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=16; post_id=822923; floor=315
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=17; post_id=822961; floor=316
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=18; post_id=823045; floor=317
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=19; post_id=823132; floor=318
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=3; ERC_P1_0403; post_ids=846061,846068,846070
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=24; post_id=846068; floor=1023
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=25; post_id=846070; floor=1024
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=44; ERC_P1_0044; post_ids=817368,817447,817537,817616
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=6; post_id=817368; floor=155
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=11; post_id=817447; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=22; post_id=817537; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=24; post_id=817616; floor=173
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=52; ERC_P2_0052; post_ids=915370,915381,915402,915409,915414,915419,915502,915504,915755,915862
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=25; post_id=915370; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=26; post_id=915381; floor=325
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=27; post_id=915402; floor=326
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=28; post_id=915409; floor=327
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=29; post_id=915414; floor=328
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=30; post_id=915419; floor=329
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=32; post_id=915502; floor=331
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=33; post_id=915504; floor=332
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=35; post_id=915755; floor=334
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=36; post_id=915862; floor=335
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=44; ERC_P2_0244; post_ids=958884,958885,958896,958900,959037,959039,959104,959113,959199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=42; post_id=958884; floor=691
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=43; post_id=958885; floor=692
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=44; post_id=958896; floor=693
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=45; post_id=958900; floor=694
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=46; post_id=959037; floor=695
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=47; post_id=959039; floor=696
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=48; post_id=959104; floor=697
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=49; post_id=959113; floor=698
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=50; post_id=959199; floor=699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=16; ERC_P2_0416; post_ids=987029,987031,987032,987209
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=41; post_id=987031; floor=890
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=42; post_id=987032; floor=891
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=44; post_id=987209; floor=893
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=6; record_id=EMP_006
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=28; line_end=31
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=83; line_end=86
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=68; line_end=72
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=5; post_id=921264; floor=404
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=6; post_id=921305; floor=405
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=7; post_id=921321; floor=406
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=8; post_id=921322; floor=407
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=9; post_id=921323; floor=408
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=10; post_id=921324; floor=409
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=11; post_id=921325; floor=410
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=12; post_id=921328; floor=411
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=13; post_id=921329; floor=412
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=4; post_id=987498; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=5; post_id=987503; floor=904
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=6; post_id=987507; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=7; post_id=987509; floor=906
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=88; line_end=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=41; post_id=864574; floor=190
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=49; post_id=864800; floor=198
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=50; post_id=864917; floor=199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=37; post_id=957923; floor=386
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=36; post_id=1044064; floor=435
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=4; record_id=FOP_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — source_id=P1_P002; jsonl_line=33; post_id=816651; floor=82
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=35; post_id=817699; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=37; post_id=820769; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=25; post_id=823927; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=28; post_id=817627; floor=177
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=31; post_id=817654; floor=180
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=25; post_id=818431; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=26; post_id=818456; floor=225
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=27; post_id=818459; floor=226
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=5; post_id=822181; floor=304
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=6; post_id=822686; floor=305
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=50; post_id=821604; floor=299
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=1; post_id=821907; floor=300
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=2; post_id=821913; floor=301
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=4; post_id=822094; floor=303

<a id="world_wrc_067"></a>
## 帝国工坊与装备交易

`WORLD_WRC_067` · concept · confirmed · original_campaign · medium

触发：帝国工坊与装备交易

矮人工坊有炉具工具装备维修，灾后抢材料移仓；修弃风需高阶风材料，鉴定报价显示门槛。装备品质税价受帝国限制为路人解释〔rumor〕，克德取世界树枝造苍穹弓亦传闻，不合托尔金克德。单店与求见镇价格不成全国物价，魔法工业不等复制任意异界技术。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_067。适用时期：工艺与场景价格。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_043,EMP_007,SWU_SOC_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=43; record_id=WRS_043
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=12; ERC_P1_0067; post_ids=819306,819320,819325,819333
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=1; post_id=819306; floor=250
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=2; post_id=819320; floor=251
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=3; post_id=819325; floor=252
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=4; post_id=819333; floor=253
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=4; ERC_P1_0404; post_ids=846089,846093,846094,846096,846097,846103,846104,846370,846466
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=29; post_id=846089; floor=1028
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=31; post_id=846093; floor=1030
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=32; post_id=846094; floor=1031
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=33; post_id=846096; floor=1032
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=34; post_id=846097; floor=1033
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=36; post_id=846103; floor=1035
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=37; post_id=846104; floor=1036
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=10; post_id=846370; floor=1059
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=19; post_id=846466; floor=1068
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=36; ERC_P1_0336; post_ids=845834,845835,845836,845880,845914,845931,845976,845977,845982,845983,845985,845988
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=36; post_id=845834; floor=985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=37; post_id=845835; floor=986
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=38; post_id=845836; floor=987
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=39; post_id=845880; floor=988
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=40; post_id=845914; floor=989
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=41; post_id=845931; floor=990
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=44; post_id=845976; floor=993
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=45; post_id=845977; floor=994
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=46; post_id=845982; floor=995
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=47; post_id=845983; floor=996
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=48; post_id=845985; floor=997
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=49; post_id=845988; floor=998
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=13; ERC_P1_0068; post_ids=819466,819483,819493,819499,820363
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=5; post_id=819466; floor=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=6; post_id=819483; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=7; post_id=819493; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=8; post_id=819499; floor=257
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=30; post_id=820363; floor=279
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=7; record_id=EMP_007
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=31; post_id=863001; floor=30
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=32; post_id=863002; floor=31
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=33; post_id=863005; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=35; post_id=863009; floor=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=4; post_id=863462; floor=53
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=6; post_id=863468; floor=55
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=7; post_id=863469; floor=56
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=8; post_id=863470; floor=57
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=9; post_id=863472; floor=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=22; post_id=874508; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=23; post_id=874647; floor=172
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=25; post_id=878056; floor=174
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=46; post_id=899931; floor=195
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=48; post_id=900199; floor=197
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=50; post_id=851837; floor=1249
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/26/posts.jsonl — jsonl_line=9; post_id=852222; floor=1258
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=30; post_id=816127; floor=29
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=32; post_id=816130; floor=31
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=33; post_id=816133; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=34; post_id=816137; floor=33
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=35; post_id=816141; floor=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=38; post_id=816170; floor=37
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=41; post_id=816201; floor=40
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=43; post_id=816246; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=47; post_id=816280; floor=46
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — jsonl_line=29; post_id=816583; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=1; post_id=816699; floor=100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=3; post_id=816704; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=23; post_id=915324; floor=322
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=31; post_id=915456; floor=330
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=32; post_id=915502; floor=331
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=35; post_id=915755; floor=334
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=38; post_id=915989; floor=337
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=39; post_id=916086; floor=338
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=25; line_end=25
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=33; line_end=35
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=10; post_id=816720; floor=109
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=11; post_id=816721; floor=110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=15; post_id=816726; floor=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=50; post_id=845994; floor=999
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=40; post_id=851625; floor=1239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=44; post_id=851773; floor=1243
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=25; post_id=816745; floor=124
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=27; post_id=816778; floor=126
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=6; post_id=817368; floor=155
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=11; post_id=817447; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=22; post_id=817537; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=24; post_id=817616; floor=173
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=42; post_id=863173; floor=41
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=43; post_id=863343; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=50; post_id=863417; floor=49
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=2; post_id=863435; floor=51
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=3; post_id=863447; floor=52
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=38; post_id=846107; floor=1037
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=39; post_id=846109; floor=1038
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=40; post_id=846113; floor=1039
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=41; post_id=846114; floor=1040
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=42; post_id=846115; floor=1041
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=43; post_id=846116; floor=1042
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=44; post_id=846119; floor=1043
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=45; post_id=846120; floor=1044
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=24; post_id=846530; floor=1073
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=25; post_id=846531; floor=1074
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=25; post_id=1042442; floor=424
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=33; post_id=1043390; floor=432
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=35; post_id=1043686; floor=434
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=37; post_id=1044477; floor=436
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=7; post_id=895386; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=45; post_id=1047210; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=49; post_id=1047852; floor=448
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=10; record_id=SWU_SOC_007
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=23; post_id=1042344; floor=422
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=33; post_id=956361; floor=382
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=37; post_id=957923; floor=386
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=17; post_id=867911; floor=216
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=25; post_id=869062; floor=224

<a id="world_wrc_068"></a>
## 帝都丧葬与死灵防范

`WORLD_WRC_068` · concept · confirmed · original_campaign · medium

触发：帝都丧葬与死灵防范

威廉称，帝要求死者火葬后入公墓，以防死灵术利用遗体〔character_belief〕。原线灾后实际出现了经法师与家属确认身份、统一火化并送往殡仪处的流程。帝与御临风另曾承担698人名册的挖墓、刻碑及向家属致歉等义务；记录只见开工，尚未记载全部完成。火葬处置与墓地纪念分别记录。帝国不提倡宗教。 [本轮用户审阅](<C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md:221>)

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_068。适用时期：处置与纪念分开。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_044,EMP_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=44; record_id=WRS_044
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=11; ERC_P2_0011; post_ids=863173,863343,863417,863435,863447
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=42; post_id=863173; floor=41
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=43; post_id=863343; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=50; post_id=863417; floor=49
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=2; post_id=863435; floor=51
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=3; post_id=863447; floor=52
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=51; ERC_P2_0051; post_ids=915324,915456,915502,915755,915989,916086
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=23; post_id=915324; floor=322
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=31; post_id=915456; floor=330
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=32; post_id=915502; floor=331
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=35; post_id=915755; floor=334
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=38; post_id=915989; floor=337
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=39; post_id=916086; floor=338
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=8; ERC_P1_0408; post_ids=846107,846109,846113,846114,846115,846116,846119,846120,846530,846531
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=38; post_id=846107; floor=1037
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=39; post_id=846109; floor=1038
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=40; post_id=846113; floor=1039
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=41; post_id=846114; floor=1040
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=42; post_id=846115; floor=1041
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=43; post_id=846116; floor=1042
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=44; post_id=846119; floor=1043
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=45; post_id=846120; floor=1044
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=24; post_id=846530; floor=1073
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=25; post_id=846531; floor=1074
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=7; record_id=EMP_007
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=31; post_id=863001; floor=30
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=32; post_id=863002; floor=31
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=33; post_id=863005; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl — jsonl_line=35; post_id=863009; floor=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=4; post_id=863462; floor=53
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=6; post_id=863468; floor=55
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=7; post_id=863469; floor=56
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=8; post_id=863470; floor=57
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=9; post_id=863472; floor=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=22; post_id=874508; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=23; post_id=874647; floor=172
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=25; post_id=878056; floor=174
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=46; post_id=899931; floor=195
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl — jsonl_line=48; post_id=900199; floor=197
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=50; post_id=851837; floor=1249
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/26/posts.jsonl — jsonl_line=9; post_id=852222; floor=1258
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=30; post_id=816127; floor=29
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=32; post_id=816130; floor=31
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=33; post_id=816133; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=34; post_id=816137; floor=33
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=35; post_id=816141; floor=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=38; post_id=816170; floor=37
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=41; post_id=816201; floor=40
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=43; post_id=816246; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=47; post_id=816280; floor=46
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — jsonl_line=29; post_id=816583; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=1; post_id=816699; floor=100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=3; post_id=816704; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=1; post_id=819306; floor=250
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=2; post_id=819320; floor=251
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=3; post_id=819325; floor=252
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=4; post_id=819333; floor=253
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=29; post_id=846089; floor=1028
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=31; post_id=846093; floor=1030
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=32; post_id=846094; floor=1031
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=33; post_id=846096; floor=1032
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=34; post_id=846097; floor=1033
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=36; post_id=846103; floor=1035
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=37; post_id=846104; floor=1036
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=10; post_id=846370; floor=1059
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=19; post_id=846466; floor=1068
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=36; post_id=845834; floor=985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=37; post_id=845835; floor=986
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=38; post_id=845836; floor=987
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=39; post_id=845880; floor=988
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=40; post_id=845914; floor=989
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=41; post_id=845931; floor=990
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=44; post_id=845976; floor=993
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=45; post_id=845977; floor=994
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=46; post_id=845982; floor=995
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=47; post_id=845983; floor=996
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=48; post_id=845985; floor=997
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=49; post_id=845988; floor=998
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=5; post_id=819466; floor=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=6; post_id=819483; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=7; post_id=819493; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=8; post_id=819499; floor=257
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=30; post_id=820363; floor=279
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=25; line_end=25
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=33; line_end=35
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=10; post_id=816720; floor=109
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=11; post_id=816721; floor=110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=15; post_id=816726; floor=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=50; post_id=845994; floor=999
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=40; post_id=851625; floor=1239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/25/posts.jsonl — jsonl_line=44; post_id=851773; floor=1243
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=25; post_id=816745; floor=124
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=27; post_id=816778; floor=126
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=6; post_id=817368; floor=155
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=11; post_id=817447; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=22; post_id=817537; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=24; post_id=817616; floor=173
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=25; post_id=1042442; floor=424
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=33; post_id=1043390; floor=432
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=35; post_id=1043686; floor=434
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=37; post_id=1044477; floor=436
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=7; post_id=895386; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=45; post_id=1047210; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=49; post_id=1047852; floor=448

<a id="world_wrc_069"></a>
## 魔兽最高评议会

`WORLD_WRC_069` · faction · confirmed · original_campaign · high

触发：魔兽最高评议会

后台会议普通参加者离场后三首脑密议、召卡邦克鲁、讨论龙族倒帝及计划，预期不等成败。谢尔伦称长老议会最高五人为五大头、龙族通常不参决定〔character_belief〕，三首脑完整对应未齐。不合无法地带高等评议会，后台不自动为主角所知。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_069。适用时期：原线后台组织。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_045,FOP_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=45; record_id=WRS_045
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=45; ERC_P2_0245; post_ids=959199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=50; post_id=959199; floor=699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=2; ERC_P2_0402; post_ids=971896,971909,971912,971915
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=7; post_id=971896; floor=806
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=8; post_id=971909; floor=807
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=9; post_id=971912; floor=808
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=10; post_id=971915; floor=809
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=7; record_id=FOP_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=37; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=180; line_end=182
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=37; line_end=44
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=180; line_end=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=43; post_id=923265; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=44; post_id=923272; floor=443
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=45; post_id=923290; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=1; post_id=959208; floor=700
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=2; post_id=959370; floor=701
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=4; post_id=959641; floor=703
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=5; post_id=959646; floor=704
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=6; post_id=959651; floor=705
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=9; post_id=959976; floor=708
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=11; post_id=959982; floor=710
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=14; post_id=960048; floor=713
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=16; post_id=960068; floor=715
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=17; post_id=960072; floor=716
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=18; post_id=960111; floor=717
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=36; post_id=824604; floor=335
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=37; post_id=824621; floor=336
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=46; line_end=49
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=114; line_end=119
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=150; line_end=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=34; post_id=960576; floor=733
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=36; post_id=960586; floor=735
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=38; post_id=960881; floor=737
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=4; post_id=963675; floor=753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=50; post_id=974730; floor=849
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=48; post_id=987233; floor=897
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=49; post_id=987234; floor=898
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=50; post_id=987239; floor=899
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=22; post_id=960244; floor=721
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=23; post_id=960245; floor=722
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=24; post_id=960247; floor=723
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=27; post_id=960254; floor=726
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=28; post_id=960439; floor=727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=30; post_id=960504; floor=729
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=31; post_id=960512; floor=730
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=33; post_id=960572; floor=732
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=37; post_id=960594; floor=736
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=39; post_id=960885; floor=738
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=6; post_id=964513; floor=755
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=8; post_id=964526; floor=757
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=10; post_id=966347; floor=759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=46; post_id=962304; floor=745
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=47; post_id=962305; floor=746
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=5; post_id=963731; floor=754
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115

<a id="world_wrc_070"></a>
## 受荣之道

`WORLD_WRC_070` · location · confirmed · original_campaign · medium

触发：受荣之道

中心秘境的成人礼等仪式道路，龙族称古传龙晶铺路、死者部分灵魂寄居〔character_belief〕，通常试炼形式不必照本次婚约。后期实有灵魂火焰、泰蕾斯相见传力、悠悠与最后封印关联，不证全部矿石能召灵魂，不预装T0传承。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_070。适用时期：仪式与后期显现。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_046,DEP_010

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=46; record_id=WRS_046
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=59; ERC_P2_0259; post_ids=963048,968330,969258
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=2; post_id=963048; floor=751
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=16; post_id=968330; floor=765
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=18; post_id=969258; floor=767
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=18; ERC_P3_0018; post_ids=1043595,1043613,1049727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=13; post_id=1043595; floor=62
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=15; post_id=1043613; floor=64
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=31; post_id=1049727; floor=80
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=25; ERC_P3_0025; post_ids=1044388,1046075,1049727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=19; post_id=1044388; floor=68
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=27; ERC_P3_0027; post_ids=1046125,1046129,1046861
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=23; post_id=1046125; floor=72
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=24; post_id=1046129; floor=73
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=25; post_id=1046861; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=10; record_id=DEP_010
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=12
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=13
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=16
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=17
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=18
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=25
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=27
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=30
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl — document_id=P3_P001; jsonl_line=41; post_id=1042360; floor=40
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl — document_id=P3_P001; jsonl_line=43; post_id=1042446; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl — document_id=P3_P001; jsonl_line=45; post_id=1042470; floor=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=1; post_id=1042498; floor=50
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=3; post_id=1042798; floor=52
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=2; post_id=1042499; floor=51
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=49; post_id=1057851; floor=98
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=4; post_id=1042846; floor=53
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=8; post_id=1043197; floor=57
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=10; post_id=1043395; floor=59
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=50; post_id=1057980; floor=99
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=7; post_id=1043193; floor=56
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=6; post_id=1043183; floor=55
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=11; post_id=1043413; floor=60
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=39; post_id=1051711; floor=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=43; post_id=1052966; floor=92
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=37; post_id=1051563; floor=86
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=41; post_id=1052872; floor=90

<a id="world_wrc_071"></a>
## 恐惧圆环

`WORLD_WRC_071` · concept · confirmed · original_campaign · medium

触发：恐惧圆环

原线出现过恐惧圆环七片碎片中的一片。匿名少女逼迫杨在接受命运与死亡之间选择；杨宣誓成为魔兽的剑与盾，接受“智者”“前锋”“大地之基”的名与力，并奉献身体与灵魂，随后白光笼罩了他。关于少女身份，可推测她是魔兽山脉五巨头之一，或与五巨头有关的人员〔uncertain〕，目前尚未确认具体身份。仪式的完整效力、控制程度及其余碎片的去向仍未明确。 [本轮用户审阅](<C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md:220>)

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_071。适用时期：杨仪式原线记录。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_047

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=47; record_id=WRS_047
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=57; ERC_P2_0257; post_ids=967530
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=12; post_id=967530; floor=761

<a id="world_wrc_072"></a>
## 魔物之盒

`WORLD_WRC_072` · concept · confirmed · original_campaign · medium

触发：魔物之盒

魔物之盒在主世界洞穴中被取得，随后罗盘失去动力。其沉睡值为3：开启时每轮减少1，关闭时每日恢复1；沉睡值降至零后释放魔眼。魔眼可以实现其能力范围内的愿望，但实现方式可能扭曲愿望本意，或采取暴力、粗暴的手段；愿望实现并不保证过程与结果符合许愿者的预期。原规则另称，遇到“不合理的愿望”，魔眼会被迫杀死解放者并返回盒中；完成愿望后则获得自由。 [本轮用户审阅](<C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md:222>)

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_072。适用时期：主世界取得后；梦不载入。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_048

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=48; record_id=WRS_048
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_014_016.jsonl — jsonl_line=21; ERC_P1_0221; post_ids=843565,843567,843568
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=23; post_id=843565; floor=772
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=24; post_id=843567; floor=773
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=25; post_id=843568; floor=774
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_014_016.jsonl — jsonl_line=23; ERC_P1_0223; post_ids=843565,843623
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/16/posts.jsonl — document_id=P1_P016; jsonl_line=30; post_id=843623; floor=779

<a id="world_wrc_073"></a>
## 外神与旧日支配者

`WORLD_WRC_073` · concept · character_belief · original_campaign · medium

触发：外神与旧日支配者

泰蕾斯称外神又名旧日支配者、不知真面目，关联精灵堕落、死亡之翼感染与法则渗透；认为联系能有限传力而不直接影响。耶各不能直接涉足之说另保視野。节点名外神之剑对古神爪牙及黑雾宣言确有，但不提供神谱、全阵营、外部作品身份，不合主神为宇宙论。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_073。适用时期：古史与后期证言。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_049,PWRM_006

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=49; record_id=WRS_049
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=20; ERC_P3_0020; post_ids=1044388,1044048,1044560
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=19; post_id=1044388; floor=68
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=18; post_id=1044048; floor=67
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=20; post_id=1044560; floor=69
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=21; ERC_P3_0021; post_ids=1046075,1046114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=22; post_id=1046114; floor=71
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=19; ERC_P3_0019; post_ids=1044045,1044388,1044048,1044560
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=17; post_id=1044045; floor=66
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=23; ERC_P3_0223; post_ids=1148584,1165704,1166498
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=15; post_id=1148584; floor=214
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=17; post_id=1165704; floor=216
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=18; post_id=1166498; floor=217
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=24; ERC_P3_0224; post_ids=1179677,1182889,1206254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=6; record_id=PWRM_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — source_id=P1; jsonl_line=49; post_id=846744; floor=1098
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — source_id=P1; jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — source_id=P1; jsonl_line=1; post_id=846753; floor=1100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=49; post_id=846744; floor=1098
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=1; post_id=846753; floor=1100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=14; post_id=858359; floor=1313
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=17; post_id=858985; floor=1316
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=20; post_id=859077; floor=1319
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=20; post_id=860741; floor=1369
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=30; post_id=862100; floor=1379
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=40; post_id=862302; floor=1389
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=41; post_id=862306; floor=1390
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=43; post_id=862337; floor=1392
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=38; post_id=913439; floor=237
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=40; post_id=913449; floor=239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=41; post_id=913450; floor=240
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=42; post_id=913492; floor=241
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=43; post_id=913501; floor=242
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=45; post_id=913595; floor=244
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=46; post_id=913665; floor=245
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=47; post_id=913700; floor=246
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=48; post_id=913709; floor=247
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=49; post_id=913717; floor=248
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=5; post_id=913733; floor=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=7; post_id=913736; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=8; post_id=913739; floor=257
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=50; post_id=913719; floor=249
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=1; post_id=913724; floor=250
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=2; post_id=913726; floor=251
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=3; post_id=913730; floor=252
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=4; post_id=913731; floor=253
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=29; post_id=846552; floor=1078
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=33; post_id=846643; floor=1082
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=35; post_id=846651; floor=1084
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=36; post_id=846653; floor=1085
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=45; post_id=846708; floor=1094
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446

<a id="world_wrc_074"></a>
## 预言、神谕与可能未来

`WORLD_WRC_074` · concept · confirmed · original_campaign · medium

触发：预言、神谕与可能未来

耶各天启、临风视野手套传讯、泰蕾斯一线、悠悠后来多条条件未来是不同来源。体验实际有，不使所见全部已发生。危险第六感不懂全部细节；改变旧未来增强印记规则按当次，白魔命定与变异数论是理论〔character_belief〕。体验解释行动结果分记，不冻结选择。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_074。适用时期：体验与结果分开。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_050,PWRM_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=50; record_id=WRS_050
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=40; ERC_P2_0040; post_ids=913439,913449,913450,913492,913501,913595,913665
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=38; post_id=913439; floor=237
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=40; post_id=913449; floor=239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=41; post_id=913450; floor=240
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=42; post_id=913492; floor=241
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=43; post_id=913501; floor=242
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=45; post_id=913595; floor=244
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=46; post_id=913665; floor=245
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=64; ERC_P2_0464; post_ids=1033262,1033271,1033311,1033315,1033318
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=50; post_id=1033262; floor=1199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 25/posts.jsonl — jsonl_line=1; post_id=1033271; floor=1200
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 25/posts.jsonl — jsonl_line=2; post_id=1033311; floor=1201
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 25/posts.jsonl — jsonl_line=3; post_id=1033315; floor=1202
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 25/posts.jsonl — jsonl_line=4; post_id=1033318; floor=1203
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=18; ERC_P3_0018; post_ids=1043595,1043613,1049727
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=13; post_id=1043595; floor=62
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=15; post_id=1043613; floor=64
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=31; post_id=1049727; floor=80
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=10; ERC_P3_0210; post_ids=1068639
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=43; post_id=1068639; floor=142
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=18; ERC_P3_0218; post_ids=1078852,1078855
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=39; post_id=1078852; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=40; post_id=1078855; floor=189
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=27; ERC_P3_0227; post_ids=1334073
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=29; post_id=1334073; floor=228
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=7; record_id=PWRM_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=408; line_end=410
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=20; post_id=863989; floor=69
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=25; post_id=864078; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=28; post_id=864087; floor=77
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=29; post_id=864293; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=30; post_id=864296; floor=79
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=32; post_id=864309; floor=81
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=34; post_id=864361; floor=83
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=36; post_id=864393; floor=85
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=38; post_id=864397; floor=87
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=40; post_id=864401; floor=89
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=42; post_id=864404; floor=91
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=44; post_id=864437; floor=93
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=45; post_id=864462; floor=94
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=47; post_id=864610; floor=96
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=29; post_id=973143; floor=828
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=30; post_id=973252; floor=829
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=31; post_id=973257; floor=830
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=32; post_id=973291; floor=831
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=33; post_id=973864; floor=832
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=34; post_id=974262; floor=833
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=35; post_id=974316; floor=834
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=36; post_id=974318; floor=835
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=19; post_id=1044388; floor=68
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=23; post_id=1046125; floor=72
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=24; post_id=1046129; floor=73
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=25; post_id=1046861; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=37; post_id=1051563; floor=86
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=39; post_id=1051711; floor=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=43; post_id=1052966; floor=92
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=35; post_id=988116; floor=84
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=7; post_id=954760; floor=56
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1655; line_end=1693
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1723; line_end=1727

<a id="world_wrc_075"></a>
## 死亡之翼重临与龙族秘境大战

`WORLD_WRC_075` · event · confirmed · original_campaign · high

触发：死亡之翼重临与龙族秘境大战

重临伴地裂红月，谢尔伦转述龙王内乱黑龙受控。安兹实援，临风与谢击溃本轮龙躯、帝军龙族阶段胜利，不等永久消灭或战争终结。白魔随后根基洞穴挟两王交涉取石放人，未演完整离去毁境撤离，另属最小过渡，不倒填原帖或预锁T0分支。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_075。适用时期：原线末期；毁境过渡另存。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_051,DEP_013,DEP_014

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=51; record_id=WRS_051
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=61; ERC_P2_0461; post_ids=1031470,1031478,1032053
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=16; ERC_P3_0016; post_ids=1043193,1043183,1043197
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=7; post_id=1043193; floor=56
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=6; post_id=1043183; floor=55
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=8; post_id=1043197; floor=57
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=14; ERC_P3_0214; post_ids=1073378,1073384,1077728,1090502
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=13; post_id=1073378; floor=162
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=15; post_id=1073384; floor=164
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=35; post_id=1077728; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=1; post_id=1090502; floor=200
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=24; ERC_P3_0224; post_ids=1179677,1182889,1206254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=25; ERC_P3_0225; post_ids=1186459,1206254,1247358
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=21; post_id=1186459; floor=220
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=25; post_id=1247358; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=28; ERC_P3_0228; post_ids=1334089
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=30; post_id=1334089; floor=229
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=13; record_id=DEP_013
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=20
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=21
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=22
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=23
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=24
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=2; post_id=1092592; floor=201
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=4; post_id=1094626; floor=203
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=5; post_id=1097734; floor=204
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=3; post_id=1093547; floor=202
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=7; post_id=1097891; floor=206
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=9; post_id=1107820; floor=208
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=11; post_id=1122379; floor=210
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=12; post_id=1122429; floor=211
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=13; post_id=1135701; floor=212
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=15; post_id=1148584; floor=214
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=17; post_id=1165704; floor=216
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=18; post_id=1166498; floor=217
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=14; record_id=DEP_014
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=25
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=26
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=27
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=28
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=31
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=35
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=18
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=26; post_id=1333535; floor=225
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=27; post_id=1333705; floor=226
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=28; post_id=1333706; floor=227
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=29; post_id=1334073; floor=228
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=17; post_id=994593; floor=966
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=18; post_id=996028; floor=967
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=19; post_id=996035; floor=968
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=20; post_id=997651; floor=969
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=21; post_id=997687; floor=970
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=22; post_id=998481; floor=971
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=35; post_id=862279; floor=1384
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=48; post_id=987233; floor=897

<a id="world_wrc_077"></a>
## 帝都法师塔区域灾难

`WORLD_WRC_077` · event · confirmed · original_campaign · high

触发：帝都法师塔区域灾难

宗近处报告尸2900余、加焚毁估约3000、法师110余，治疗系损失超魔法大学年毕业数；尸以A中心扩散，不简单写专攻塔。沃西斯后提姜相关伤亡魔兽联系是责任判断〔uncertain〕，统计不证姜独自造成全死。影响治疗资源和殡仪，估计口径保留。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_077。适用时期：原线中期；统计为报告。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_053,DEP_006

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=53; record_id=WRS_053
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=51; ERC_P2_0051; post_ids=915324,915456,915502,915755,915989,916086
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=23; post_id=915324; floor=322
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=31; post_id=915456; floor=330
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=32; post_id=915502; floor=331
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=35; post_id=915755; floor=334
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=38; post_id=915989; floor=337
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=39; post_id=916086; floor=338
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=3; ERC_P2_0203; post_ids=921264,921305,921329,921330,921465
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=5; post_id=921264; floor=404
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=6; post_id=921305; floor=405
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=13; post_id=921329; floor=412
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=14; post_id=921330; floor=413
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=15; post_id=921465; floor=414
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=6; record_id=DEP_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=35
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=36
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=38
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=39
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=40
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=41
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=43
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=13; post_id=908892; floor=212
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=30; post_id=914156; floor=279
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=18; post_id=909383; floor=217
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=20; post_id=909828; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=21; post_id=909970; floor=220
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=22; post_id=909981; floor=221
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=23; post_id=910285; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=24; post_id=911522; floor=223
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=25; post_id=911872; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=26; post_id=912200; floor=225
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=27; post_id=912206; floor=226
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=28; post_id=912247; floor=227
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=29; post_id=912252; floor=228
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=30; post_id=912436; floor=229
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=32; post_id=912586; floor=231
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=34; post_id=913039; floor=233
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=36; post_id=913283; floor=235
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=38; post_id=913439; floor=237
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=31; post_id=912566; floor=230
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=35; post_id=913052; floor=234
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=36; post_id=914271; floor=285
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=38; post_id=914306; floor=287
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=40; post_id=914330; floor=289
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=42; post_id=914561; floor=291
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=45; post_id=914608; floor=294
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=46; post_id=914611; floor=295
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=48; post_id=914791; floor=297
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=49; post_id=914796; floor=298
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=50; post_id=914868; floor=299
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=40; post_id=913449; floor=239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=41; post_id=913450; floor=240
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=42; post_id=913492; floor=241
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=43; post_id=913501; floor=242
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=45; post_id=913595; floor=244
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=46; post_id=913665; floor=245
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=47; post_id=913700; floor=246
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=48; post_id=913709; floor=247
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=49; post_id=913717; floor=248
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=5; post_id=913733; floor=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=7; post_id=913736; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=8; post_id=913739; floor=257
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=50; post_id=913719; floor=249
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=1; post_id=913724; floor=250
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=2; post_id=913726; floor=251
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=3; post_id=913730; floor=252
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=4; post_id=913731; floor=253

<a id="world_wrc_078"></a>
## 大魔女夜宴

`WORLD_WRC_078` · concept · character_belief · original_campaign · medium

触发：大魔女夜宴

雷光区分小型令区域Gate绝望批量Phantom、大型四同类魔法使作人柱阵眼炼阵内生物为魔力，发动条件未齐。沐透说四个或以上、城市规模且扩围未明。白魔目的、卡珊德拉能源解释是口供，军方记录不等核实。梦人数与主世界石根基不成通用公式，T0不自动有后期军情。

审核说明：F1编写稿v1，本轮逐条待审；对应WRC_078。适用时期：原线后期军情。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WRS_054,WMPR_004,WMPR_009

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=54; record_id=WRS_054
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=21; ERC_P2_0421; post_ids=987498,987503,987507,987509
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=4; post_id=987498; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=5; post_id=987503; floor=904
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=6; post_id=987507; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=7; post_id=987509; floor=906
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=3; ERC_P3_0203; post_ids=1059916,1059924
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=9; post_id=1059916; floor=108
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=12; post_id=1059924; floor=111
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=9; ERC_P3_0209; post_ids=1068182,1068185,1068230
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=39; post_id=1068182; floor=138
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=40; post_id=1068185; floor=139
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=41; post_id=1068230; floor=140
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_009_016.jsonl — jsonl_line=34; ERC_P2_0234; post_ids=955878,955892,956159,956235
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 13/posts.jsonl — jsonl_line=42; post_id=955878; floor=641
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 13/posts.jsonl — jsonl_line=43; post_id=955892; floor=642
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 13/posts.jsonl — jsonl_line=44; post_id=956159; floor=643
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 13/posts.jsonl — jsonl_line=45; post_id=956235; floor=644
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=4; record_id=WMPR_004
- https://www.kamen-rider-official.com/dictionaries/works_search?initial=%E3%81%AF&search_dictionaries_form%5Bicon%5D=6&search_dictionaries_form%5Bkamen_rider_id%5D=14&utf8=%E2%9C%93 — 东映官方Wizard用语辞典 ファントム; ファントム条目，读取行42–50
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=12; post_id=1055963; floor=461
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=13; post_id=1056638; floor=462
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=603; line_end=604
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=9; record_id=WMPR_009
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=88; line_end=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=124
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=41; post_id=864574; floor=190
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=50; post_id=864917; floor=199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=37; post_id=957923; floor=386
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=36; post_id=1044064; floor=435
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=14; post_id=1068640; floor=463
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=15; post_id=1069865; floor=464
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — source_id=P2; jsonl_line=6; post_id=918970; floor=355
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — source_id=P2; jsonl_line=8; post_id=919057; floor=357
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=25; post_id=911872; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=27; post_id=912206; floor=226

<a id="world_empire_court"></a>
## 帝国朝会与常务办理

`WORLD_EMPIRE_COURT` · concept · confirmed · original_campaign · medium

触发：帝国朝会与常务办理

帝国常务机构办理日常，专员旁听并上报帝，重大判断交朝堂。朝会文武分列、按官位站、八柱将居前，每周数次固定朝会；地方报告经部门上达，特殊危机另启紧急朝会。百头龙复活、严冬撤民是既往应急例子，没有全部年代与处置细节。沃西斯雷光是材料更新时主要经办者，不给每历史阶段同一内阁。

审核说明：F1编写稿v1，本轮逐条待审；对应EMPIRE_COURT。适用时期：T0制度；应急史按原记。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：EMP_001,FOP_001

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=1; record_id=EMP_001
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=21; line_end=26
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — source_id=P1_P002; jsonl_line=33; post_id=816651; floor=82
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=37; post_id=820769; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=1; record_id=FOP_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=1; post_id=922950; floor=0
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=3; post_id=922976; floor=2
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=24; line_end=26
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=161; line_end=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=25; post_id=823927; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=15; post_id=921465; floor=414
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=17; post_id=846047; floor=1016
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=19; post_id=846054; floor=1018
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=3; post_id=846217; floor=1052
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=12; post_id=967530; floor=761
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=44; line_end=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=11; post_id=846884; floor=1110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119

<a id="world_raigu_intelligence"></a>
## 雷光的秘密情报部门

`WORLD_RAIGU_INTELLIGENCE` · faction · confirmed · original_campaign · high

触发：雷光的秘密情报部门

用户原话为“雷光是唯一一个拥有自己秘密情报部门的人”，本稿直接采用其唯一性，不声称用户只限定八柱将。帝直属兄弟会及其他已证组织继续另列，不因唯一性抹掉机构。雷光屏蔽侦知、本人上报、阅笔记后归还和保密是可见信息保护方式。部门正式名称、全部人员与权限未给，不能由拥有部门推出全知；本标题是归属描述，不新增组织名。

审核说明：F1编写稿v1，本轮逐条待审；对应RAIGU_INTELLIGENCE。适用时期：既存个人部门；名称编制未给。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：EMP_006,UCL_20261003_004

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=6; record_id=EMP_006
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=28; line_end=31
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=83; line_end=86
- D:/备份文件/901记录/战报/901前史与设定备忘录.md — source_id=PRE; line_start=68; line_end=72
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=5; post_id=921264; floor=404
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=6; post_id=921305; floor=405
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=7; post_id=921321; floor=406
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=8; post_id=921322; floor=407
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=9; post_id=921323; floor=408
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=10; post_id=921324; floor=409
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=11; post_id=921325; floor=410
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=12; post_id=921328; floor=411
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl — jsonl_line=13; post_id=921329; floor=412
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=25; post_id=915370; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=26; post_id=915381; floor=325
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=27; post_id=915402; floor=326
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=28; post_id=915409; floor=327
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=29; post_id=915414; floor=328
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=30; post_id=915419; floor=329
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=32; post_id=915502; floor=331
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=33; post_id=915504; floor=332
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=35; post_id=915755; floor=334
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl — jsonl_line=36; post_id=915862; floor=335
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=6; post_id=817368; floor=155
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=11; post_id=817447; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=22; post_id=817537; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=24; post_id=817616; floor=173
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=42; post_id=958884; floor=691
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=43; post_id=958885; floor=692
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=44; post_id=958896; floor=693
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=45; post_id=958900; floor=694
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=46; post_id=959037; floor=695
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=47; post_id=959039; floor=696
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=48; post_id=959104; floor=697
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=49; post_id=959113; floor=698
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl — jsonl_line=50; post_id=959199; floor=699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=41; post_id=987031; floor=890
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=42; post_id=987032; floor=891
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=44; post_id=987209; floor=893
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=4; post_id=987498; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=5; post_id=987503; floor=904
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=6; post_id=987507; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=7; post_id=987509; floor=906
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=88; line_end=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=41; post_id=864574; floor=190
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=49; post_id=864800; floor=198
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=50; post_id=864917; floor=199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=37; post_id=957923; floor=386
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=36; post_id=1044064; floor=435
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=5; record_id=UCL_20261003_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=116; line_end=116
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=117; line_end=117
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119

<a id="world_raigu_unit"></a>
## 雷光直属第一大队第二小队

`WORLD_RAIGU_UNIT` · faction · confirmed · original_campaign · high

触发：雷光直属第一大队第二小队；雷公直属第一大队第二小队

雷光负责处理白色魔法师，并有专门对付白魔的小分队。原帖称“雷公”直属第一大队第二小队，队长为逆羽·霞，副队长为幻翎·洛；任务指挥归属依据用户确认统一为雷光。洛因沐透与白魔的渊源、更多目标情报及共同阻止白魔的目标邀请协助，核实军籍和影魔证词后，提供十金币活动资金及马匹。初次招募时霞宣布沐透已入队，沐透仍提出异议；原线后来他实际领取身份铁牌，返都时持牌自报现任队员。早期异议不能延续为全线未入队，后期队籍也不能倒填T0。现场邀请由洛执行，不改写为雷光本人到镇招募。

审核说明：F1编写稿v1，本轮逐条待审；对应RAIGU_UNIT。适用时期：职责既存；招募领牌分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：SWU_USER_001,FOP_003,WMPR_009,UCL_20261003_003

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=25; record_id=SWU_USER_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=88; line_end=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=41; post_id=864574; floor=190
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=49; post_id=864800; floor=198
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=50; post_id=864917; floor=199
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=37; post_id=957923; floor=386
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=36; post_id=1044064; floor=435
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=3; record_id=FOP_003
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=47; post_id=864765; floor=196
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=7; post_id=862103; floor=156
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=37; post_id=864394; floor=186
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=45; post_id=864656; floor=194
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=4; post_id=987498; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=5; post_id=987503; floor=904
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=6; post_id=987507; floor=905
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=7; post_id=987509; floor=906
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=43; line_end=43
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — document_id=MUTOU_PAGE_01; source_id=MUTOU; jsonl_line=30; post_id=846491; floor=29
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=125; line_end=125
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=9; record_id=WMPR_009
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=124
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=14; post_id=1068640; floor=463
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=15; post_id=1069865; floor=464
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — source_id=P2; jsonl_line=6; post_id=918970; floor=355
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl — source_id=P2; jsonl_line=8; post_id=919057; floor=357
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=25; post_id=911872; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=27; post_id=912206; floor=226
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=4; record_id=UCL_20261003_003
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=89; line_end=89

<a id="world_local_administration"></a>
## 帝国地方受理与通信

`WORLD_LOCAL_ADMINISTRATION` · concept · confirmed · original_campaign · medium

触发：帝国地方受理与通信

地方可登记警戒、协调法师守备、向帝都驻军求援。沐透报塔逃犯后雅莱佩联系曼吉，魔法信化丝缠鸽腿送出、次日回信、后来援军实际到场。另一镇欧登科斯雷命侦察、联络军队找游击士，后镇长撤离求援，未见援军到场。小镇战讯滞后一两天。一地成功回应不表示全机构即时共享或所有求援已成。

审核说明：F1编写稿v1，本轮逐条待审；对应LOCAL_ADMINISTRATION。适用时期：既存渠道；响应逐案。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：SWU_SOC_002,EMP_004,ESIDE_001,ESIDE_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=5; record_id=SWU_SOC_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — document_id=MUTOU_PAGE_01; source_id=MUTOU; jsonl_line=33; post_id=846685; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — document_id=MUTOU_PAGE_01; source_id=MUTOU; jsonl_line=39; post_id=846736; floor=38
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-02/posts.jsonl — document_id=MUTOU_PAGE_02; source_id=MUTOU; jsonl_line=27; post_id=848743; floor=76
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=35; post_id=864341; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=36; post_id=989666; floor=85
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=39; post_id=990702; floor=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=41; post_id=992345; floor=90
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=43; post_id=993920; floor=92
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-02/posts.jsonl — document_id=MUTOU_PAGE_02; source_id=MUTOU; jsonl_line=5; post_id=847638; floor=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=7; post_id=954760; floor=56
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=4; record_id=EMP_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=2; post_id=817173; floor=151
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=4; post_id=817210; floor=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=7; post_id=817395; floor=156
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=8; post_id=817429; floor=157
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=9; post_id=817432; floor=158
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=11; post_id=817447; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=35; post_id=817699; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=13; post_id=817453; floor=162
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=15; post_id=817473; floor=164
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=17; post_id=817479; floor=166
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=18; post_id=817481; floor=167
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=20; post_id=817492; floor=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=36; post_id=816817; floor=135
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=40; post_id=816879; floor=139
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=33; post_id=845797; floor=982
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=34; post_id=845814; floor=983
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=35; post_id=845826; floor=984
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=36; post_id=845834; floor=985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=42; post_id=845973; floor=991
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=43; post_id=845975; floor=992
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 3/posts.jsonl — jsonl_line=5; post_id=864692; floor=104
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 3/posts.jsonl — jsonl_line=7; post_id=864704; floor=106
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=21; line_end=26
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — source_id=P1_P002; jsonl_line=33; post_id=816651; floor=82
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=42; post_id=817008; floor=141
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=20; post_id=818410; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/event_causality_sides.jsonl — jsonl_line=1; record_id=ESIDE_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — source_id=MUTOU; jsonl_line=30; post_id=846491; floor=29; source_html_line=3011
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — source_id=MUTOU; jsonl_line=33; post_id=846685; floor=32; source_html_line=3286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — source_id=MUTOU; jsonl_line=39; post_id=846736; floor=38; source_html_line=3838
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-02/posts.jsonl — source_id=MUTOU; jsonl_line=27; post_id=848743; floor=76; source_html_line=2746
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — source_id=MUTOU; jsonl_line=37; post_id=864394; floor=186; source_html_line=3666
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188; source_html_line=3850
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — source_id=MUTOU; jsonl_line=45; post_id=864656; floor=194; source_html_line=4402
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — source_id=MUTOU; jsonl_line=47; post_id=864765; floor=196; source_html_line=4586
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — source_id=MUTOU; jsonl_line=49; post_id=864800; floor=198; source_html_line=4770
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — source_id=MUTOU; jsonl_line=50; post_id=864917; floor=199; source_html_line=4863
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=88; line_end=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=41; post_id=864574; floor=190
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=37; post_id=957923; floor=386
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=36; post_id=1044064; floor=435
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/event_causality_sides.jsonl — jsonl_line=7; record_id=ESIDE_007
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=9; post_id=923284; floor=8; source_html_line=1086
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=11; post_id=923288; floor=10; source_html_line=1272
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=13; post_id=923404; floor=12; source_html_line=1458
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=23; post_id=962500; floor=72; source_html_line=2389
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=36; post_id=989666; floor=85; source_html_line=3597
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=37; post_id=989836; floor=86; source_html_line=3691
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=39; post_id=990702; floor=88; source_html_line=3877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=41; post_id=992345; floor=90; source_html_line=4063
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=43; post_id=993920; floor=92; source_html_line=4249
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=5; post_id=954706; floor=54; source_html_line=715
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=9; post_id=955110; floor=58; source_html_line=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=11; post_id=955517; floor=60; source_html_line=1273
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=13; post_id=955598; floor=62; source_html_line=1459
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=15; post_id=955870; floor=64; source_html_line=1645
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=7; post_id=954760; floor=56; source_html_line=901
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=38; post_id=990696; floor=87; source_html_line=3783
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=2; post_id=1015970; floor=101; source_html_line=434
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=3; post_id=1016053; floor=102; source_html_line=528
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=12; post_id=1081976; floor=111; source_html_line=1364

<a id="world_research_institute"></a>
## 帝都博士研究所

`WORLD_RESEARCH_INSTITUTE` · location · confirmed · original_campaign · medium

触发：帝都博士研究所

沐透经协会约见、维尔提供身份地址，来到有保安文献实验工具的研究所。连续场景博士有拉塞尔、塞拉尔等称呼变化，沿原帖保存，不凭近名合并其他博士。博士说多数经费来自军方、须正式委托〔character_belief〕。已探测腰带、完成图纸归还、召集专家；王骑允暂住并承诺发委托、劳霖记录，未演文书送达、新戒指或逆Phantom成功。本标题是地点描述，机构正式名未给。

审核说明：F1编写稿v1，本轮逐条待审；对应RESEARCH_INSTITUTE。适用时期：沐透返都阶段；T0项目未启。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：SWU_SOC_005,SWU_FAC_004,ESIDE_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=8; record_id=SWU_SOC_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=25; post_id=1042442; floor=424
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=33; post_id=1043390; floor=432
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=35; post_id=1043686; floor=434
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=37; post_id=1044477; floor=436
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=27; post_id=1042494; floor=426
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=21; record_id=SWU_FAC_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=23; post_id=1042344; floor=422
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=31; post_id=1043190; floor=430
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=9; post_id=1052875; floor=458
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=11; post_id=1055378; floor=460
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=12; post_id=1055963; floor=461
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=13; post_id=1056638; floor=462
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=14; post_id=1068640; floor=463
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=15; post_id=1069865; floor=464
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=19; post_id=1090503; floor=468
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/event_causality_sides.jsonl — jsonl_line=5; record_id=ESIDE_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=25; post_id=1042442; floor=424; source_html_line=2551
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=33; post_id=1043390; floor=432; source_html_line=3287
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440; source_html_line=4023
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452; source_html_line=526
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454; source_html_line=710
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438; source_html_line=3839
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=49; post_id=1047852; floor=448; source_html_line=4759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=9; post_id=1052875; floor=458; source_html_line=1078
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=11; post_id=1055378; floor=460; source_html_line=1262
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=12; post_id=1055963; floor=461; source_html_line=1355
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=13; post_id=1056638; floor=462; source_html_line=1446
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=14; post_id=1068640; floor=463; source_html_line=1539
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=15; post_id=1069865; floor=464; source_html_line=1630
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442; source_html_line=4207
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=58

<a id="world_magical_automata"></a>
## 魔偶制造与灵魂研究

`WORLD_MAGICAL_AUTOMATA` · concept · character_belief · original_campaign · medium

触发：魔偶制造与灵魂研究

博士称魔偶多战用、精细动作有限且魔核昂贵，宝石翁、维克托、泰德勒是少数可造近真人魔偶的例子，不是全国名录。他称保存操作人类灵魂严禁、慕少艾弟子研究后叛逃被诛；用户另确认陈萍生师承身份，具体罪由仍保证言。逆Phantom需时间材料样本，未通用成功流程；禁令不补成完整法典。

审核说明：F1编写稿v1，本轮逐条待审；对应MAGICAL_AUTOMATA。适用时期：专业见闻与研究目标。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：SWU_SOC_006,SWU_PWR_004,WMPR_008,UCL_20261003_004

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=9; record_id=SWU_SOC_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=7; post_id=895386; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=45; post_id=1047210; floor=444
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=49; post_id=1047852; floor=448
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=14; record_id=SWU_PWR_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=48; post_id=1047768; floor=447
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=127; line_end=127
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=37; post_id=1044477; floor=436
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=8; record_id=WMPR_008
- https://www.kamen-rider-official.com/dictionaries/works_search?search_dictionaries_form%5Bicon%5D=6&search_dictionaries_form%5Bkamen_rider_id%5D=14&utf8=%E2%9C%93 — 东映官方Wizard用语辞典 アンダーワールド; アンダーワールド条目，读取行31–40
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1081; line_end=1091
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=31; post_id=1043190; floor=430
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=5; record_id=UCL_20261003_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=114; line_end=114
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=115; line_end=115
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=116; line_end=116
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=117; line_end=117
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=119; line_end=119

<a id="world_gate"></a>
## Gate

`WORLD_GATE` · concept · character_belief · original_campaign · medium

触发：Gate

雷光军情说白魔能使Gate因绝望转为Phantom，沐透亦报Gate夜宴。资质阈值和启动全条件未给。用户授权Wizard原型，高魔力人类资格、精神世界诞生与现实化区分提供机制参考，未证本团个案步骤不由授权自动为历史。普通悲伤不自动转化、裂痕不直接跳到完成，后期军情不作开局常识。

审核说明：F1编写稿v1，本轮逐条待审；对应GATE。适用时期：后期军情；原型可参考。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WMPR_004,UCL_20261003_008

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=4; record_id=WMPR_004
- https://www.kamen-rider-official.com/dictionaries/works_search?initial=%E3%81%AF&search_dictionaries_form%5Bicon%5D=6&search_dictionaries_form%5Bkamen_rider_id%5D=14&utf8=%E2%9C%93 — 东映官方Wizard用语辞典 ファントム; ファントム条目，读取行42–50
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=4; post_id=987498; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=12; post_id=1055963; floor=461
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=13; post_id=1056638; floor=462
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=603; line_end=604
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=9; record_id=UCL_20261003_008
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=205; line_end=205

<a id="world_phantom_rescue"></a>
## Phantom救援与逆转研究

`WORLD_PHANTOM_RESCUE` · concept · confirmed · original_campaign · medium

触发：Phantom救援与逆转研究

本团Engage戒指条文允许进入指环穿戴者Underworld，不保证救援。原型转化前进入精神世界击败内在Phantom救人是授权参考中的补充候选，不外推已现实化者同法复原。沐透提出贤者石核心魔偶、回收灵魂、注魔再成人方案，博士愿研但需时间材料真实样本〔character_belief〕。权杖博士复原旧闻属转述传闻〔rumor〕，本线未演普适成功。

审核说明：F1编写稿v1，本轮逐条待审；对应PHANTOM_RESCUE。适用时期：本团入口；后期研究未成。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WMPR_008,SWU_PWR_004,ESIDE_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=8; record_id=WMPR_008
- https://www.kamen-rider-official.com/dictionaries/works_search?search_dictionaries_form%5Bicon%5D=6&search_dictionaries_form%5Bkamen_rider_id%5D=14&utf8=%E2%9C%93 — 东映官方Wizard用语辞典 アンダーワールド; アンダーワールド条目，读取行31–40
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1081; line_end=1091
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=48; post_id=1047768; floor=447
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=49; post_id=1047852; floor=448
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=31; post_id=1043190; floor=430
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=14; record_id=SWU_PWR_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=45; post_id=1047210; floor=444
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=127; line_end=127
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=37; post_id=1044477; floor=436
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/event_causality_sides.jsonl — jsonl_line=5; record_id=ESIDE_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=25; post_id=1042442; floor=424; source_html_line=2551
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=33; post_id=1043390; floor=432; source_html_line=3287
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=41; post_id=1046096; floor=440; source_html_line=4023
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=3; post_id=1049842; floor=452; source_html_line=526
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=5; post_id=1051559; floor=454; source_html_line=710
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=39; post_id=1044705; floor=438; source_html_line=3839
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=49; post_id=1047852; floor=448; source_html_line=4759
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=9; post_id=1052875; floor=458; source_html_line=1078
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=11; post_id=1055378; floor=460; source_html_line=1262
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=12; post_id=1055963; floor=461; source_html_line=1355
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=13; post_id=1056638; floor=462; source_html_line=1446
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=14; post_id=1068640; floor=463; source_html_line=1539
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — source_id=MUTOU; jsonl_line=15; post_id=1069865; floor=464; source_html_line=1630
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442; source_html_line=4207
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=58

<a id="world_artificial_phantom"></a>
## 人工Phantom与供魔路径

`WORLD_ARTIFICIAL_PHANTOM` · concept · character_belief · original_campaign · medium

触发：人工Phantom与供魔路径

沐透向军方报告笛木奏非Gate、制造卡邦克鲁和新装置，多体关系部分疑似。授权Wizard人工制造植入供魔可作参考，不写本团全部步骤已实演。沐透背景见内在百首黄金龙并得Wizard驱动器，与Faer的克拉肯契约分开；都能施法不等同一取得路径或一魔力池。

审核说明：F1编写稿v1，本轮逐条待审；对应ARTIFICIAL_PHANTOM。适用时期：报告与原型参考。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WMPR_006,WMPR_001

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=6; record_id=WMPR_006
- https://www.kamen-rider-official.com/dictionaries/works_search?initial=%E3%81%BE&search_dictionaries_form%5Bicon%5D=6&search_dictionaries_form%5Bkamen_rider_id%5D=14&utf8=%E2%9C%93 — 东映官方Wizard用语辞典 魔法使い; 魔法使い条目，读取行57–66
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=916; line_end=925
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=12; post_id=1055963; floor=461
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=48; post_id=1047768; floor=447
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=1; record_id=WMPR_001
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=125; line_end=127
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=18; post_id=996028; floor=967
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=20; post_id=997651; floor=969
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=128; line_end=128
- https://www.kamen-rider-official.com/zukan/characters/3163 — 东映官方图鉴 笛木奏; 人物说明，读取行28–59

<a id="world_faer"></a>
## Faer

`WORLD_FAER` · concept · confirmed · original_campaign · medium

触发：Faer

克拉肯称古代装具对应Faer，否定Beast和Rogue身份类比。精灵王以古神为原型制作、同归之史是其证言〔character_belief〕。维尔取腰带戒指后解除石化变身追杀娜迦，意志争执中解变身昏迷。克拉肯称契约已成但要学供魔、抵抗本能；后宫廷检查学习药水为父子转述，不作全腰带代价。

审核说明：F1编写稿v1，本轮逐条待审；对应FAER。适用时期：古史证言；维尔实际接入。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：SWU_PWR_001,SWU_PWR_002,ESIDE_003

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=11; record_id=SWU_PWR_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=25; post_id=948659; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=27; post_id=948754; floor=326
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=12; record_id=SWU_PWR_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=11; post_id=931036; floor=310
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=15; post_id=931924; floor=314
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=19; post_id=939232; floor=318
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=45; post_id=893857; floor=244
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=47; post_id=893869; floor=246
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=49; post_id=893930; floor=248
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=27; post_id=1042494; floor=426
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=28; post_id=1042503; floor=427
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=29; post_id=1042800; floor=428
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/event_causality_sides.jsonl — jsonl_line=3; record_id=ESIDE_003
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — source_id=MUTOU; jsonl_line=7; post_id=895386; floor=256; source_html_line=895
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — source_id=MUTOU; jsonl_line=47; post_id=918376; floor=296; source_html_line=4575
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=10; post_id=929554; floor=309; source_html_line=1172
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=11; post_id=931036; floor=310; source_html_line=1263
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=19; post_id=939232; floor=318; source_html_line=1999
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=25; post_id=948659; floor=324; source_html_line=2551
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=45; post_id=950844; floor=344; source_html_line=4391
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=27; post_id=1042494; floor=426; source_html_line=2735
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=28; post_id=1042503; floor=427; source_html_line=2828
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=29; post_id=1042800; floor=428; source_html_line=2919
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442; source_html_line=4207
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=70; line_end=80
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=27; post_id=948754; floor=326; source_html_line=2735
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=58

<a id="world_magic_sea"></a>
## 魔力之海

`WORLD_MAGIC_SEA` · concept · character_belief · original_campaign · medium

触发：魔力之海

沐透认为心灵世界下有魔力之海、克拉肯或可借此恢复，并把它纳入救重要之人设想。未演无限供能或逆Phantom救援成功，不与各魔力池、假面生命代价和克拉肯契约自动换算。

审核说明：F1编写稿v1，本轮逐条待审；对应MAGIC_SEA。适用时期：沐透判断与救援设想。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WMPR_006,WMPR_008

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=6; record_id=WMPR_006
- https://www.kamen-rider-official.com/dictionaries/works_search?initial=%E3%81%BE&search_dictionaries_form%5Bicon%5D=6&search_dictionaries_form%5Bkamen_rider_id%5D=14&utf8=%E2%9C%93 — 东映官方Wizard用语辞典 魔法使い; 魔法使い条目，读取行57–66
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=916; line_end=925
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=12; post_id=1055963; floor=461
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=48; post_id=1047768; floor=447
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — source_id=MUTOU; jsonl_line=6; post_id=895365; floor=255
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=8; record_id=WMPR_008
- https://www.kamen-rider-official.com/dictionaries/works_search?search_dictionaries_form%5Bicon%5D=6&search_dictionaries_form%5Bkamen_rider_id%5D=14&utf8=%E2%9C%93 — 东映官方Wizard用语辞典 アンダーワールド; アンダーワールド条目，读取行31–40
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1081; line_end=1091
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=49; post_id=1047852; floor=448
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=31; post_id=1043190; floor=430

<a id="world_bloodline_magic"></a>
## 魔力体质与持续供能

`WORLD_BLOODLINE_MAGIC` · concept · confirmed · original_campaign · medium

触发：魔力体质与持续供能

血统、魔力池、体质和学到技艺不同。埃弗纳斯服安兹药水后实际开启，成长项圈是另物；安兹说本地魔力不同经验、建议他师〔character_belief〕。感知有范围、收纳掩饰条件，察异常不等懂身份用途。Garuda耗尽回补，美杜莎昏迷后飞马失魔力源滑降，展示维持者状态，不合一供能模型。

审核说明：F1编写稿v1，本轮逐条待审；对应BLOODLINE_MAGIC。适用时期：具体开启感知维持。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：SWU_PWR_006,PWRM_002,PWRM_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=16; record_id=SWU_PWR_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=3; post_id=954561; floor=52
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=4; post_id=954685; floor=53
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=5; post_id=954706; floor=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=7; post_id=954760; floor=56
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-02/posts.jsonl — document_id=MUTOU_PAGE_02; source_id=MUTOU; jsonl_line=39; post_id=850005; floor=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-02/posts.jsonl — document_id=MUTOU_PAGE_02; source_id=MUTOU; jsonl_line=40; post_id=850638; floor=89
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=1; post_id=861002; floor=150
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=2; record_id=PWRM_002
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=36; line_end=68
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=104; line_end=114
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=160; line_end=167
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=136; line_end=158
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=186; line_end=195
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=7; record_id=PWRM_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=408; line_end=410
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=20; post_id=863989; floor=69
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=25; post_id=864078; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=28; post_id=864087; floor=77
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=29; post_id=864293; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=30; post_id=864296; floor=79
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=32; post_id=864309; floor=81
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=34; post_id=864361; floor=83
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=36; post_id=864393; floor=85
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=38; post_id=864397; floor=87
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=40; post_id=864401; floor=89
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=42; post_id=864404; floor=91
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=44; post_id=864437; floor=93
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=45; post_id=864462; floor=94
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=47; post_id=864610; floor=96
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=29; post_id=973143; floor=828
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=30; post_id=973252; floor=829
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=31; post_id=973257; floor=830
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=32; post_id=973291; floor=831
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=33; post_id=973864; floor=832
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=34; post_id=974262; floor=833
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=35; post_id=974316; floor=834
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=36; post_id=974318; floor=835
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=13; post_id=1043595; floor=62
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=15; post_id=1043613; floor=64
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=31; post_id=1049727; floor=80
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=19; post_id=1044388; floor=68
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=39; post_id=1078852; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=40; post_id=1078855; floor=189
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=23; post_id=1046125; floor=72
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=24; post_id=1046129; floor=73
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=25; post_id=1046861; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=37; post_id=1051563; floor=86
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=39; post_id=1051711; floor=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=43; post_id=1052966; floor=92
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=35; post_id=988116; floor=84
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1655; line_end=1693
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1723; line_end=1727

<a id="world_space_magic"></a>
## 空间传送与龙族空间能力

`WORLD_SPACE_MAGIC` · concept · confirmed · original_campaign · medium

触发：空间传送与龙族空间能力

空间龙传送有目标、动作、距离、耗魔、曾到及印象条件。悠悠下位为近距传自己、携物送他人另改条件，上位不能跨世界、远距增加长检定与消耗。后来她说足够施术且耗尽魔力也仅自己加一人或独送临风。称号不赋无限撤军，短距、长期群体、死亡触发和全力传送不合随叫随到技能。

审核说明：F1编写稿v1，本轮逐条待审；对应SPACE_MAGIC。适用时期：具体条文；后期表现分期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：PWRM_003,PWRM_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=3; record_id=PWRM_003
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=398; line_end=403
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1655; line_end=1693
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=1723; line_end=1727
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=176; line_end=178
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — jsonl_line=23; post_id=816554; floor=72
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — jsonl_line=25; post_id=816557; floor=74
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=393; line_end=396
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=1; post_id=816001; floor=
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=7; record_id=PWRM_007
- D:/备份文件/901记录/TRPG outputs/设定 人物/人物卡资料集_检索版.md — source_id=REF_CHARACTERS; line_start=408; line_end=410
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=20; post_id=863989; floor=69
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=25; post_id=864078; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=28; post_id=864087; floor=77
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=29; post_id=864293; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=30; post_id=864296; floor=79
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=32; post_id=864309; floor=81
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=34; post_id=864361; floor=83
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=36; post_id=864393; floor=85
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=38; post_id=864397; floor=87
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=40; post_id=864401; floor=89
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=42; post_id=864404; floor=91
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=44; post_id=864437; floor=93
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=45; post_id=864462; floor=94
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl — jsonl_line=47; post_id=864610; floor=96
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=29; post_id=973143; floor=828
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=30; post_id=973252; floor=829
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=31; post_id=973257; floor=830
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=32; post_id=973291; floor=831
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=33; post_id=973864; floor=832
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=34; post_id=974262; floor=833
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=35; post_id=974316; floor=834
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl — jsonl_line=36; post_id=974318; floor=835
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=13; post_id=1043595; floor=62
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=15; post_id=1043613; floor=64
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=31; post_id=1049727; floor=80
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=19; post_id=1044388; floor=68
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=39; post_id=1078852; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=40; post_id=1078855; floor=189
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=27; post_id=914145; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=28; post_id=914149; floor=277
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=29; post_id=914153; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=31; post_id=914157; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=32; post_id=914171; floor=281
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=33; post_id=914172; floor=282
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=34; post_id=914181; floor=283
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=37; post_id=914301; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=43; post_id=914582; floor=292
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=44; post_id=914606; floor=293
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=23; post_id=1046125; floor=72
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=24; post_id=1046129; floor=73
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=25; post_id=1046861; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=37; post_id=1051563; floor=86
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=39; post_id=1051711; floor=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=43; post_id=1052966; floor=92
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=35; post_id=988116; floor=84
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=7; post_id=954760; floor=56

<a id="world_foreign_dragon"></a>
## 异乡之龙

`WORLD_FOREIGN_DRAGON` · concept · confirmed · original_campaign · medium

触发：异乡之龙

用户明确异乡之龙是本团对“华夏人都是龙的传人”的一种解释，御临风既有龙血与此共同来源相连。原帖联想仍保当时视角，世界依据由用户补足，不能只当无根据猜测。不指定所有人血统浓度知情能力相同，不补龙祖皇族转世或后来仪式能力。

审核说明：F1编写稿v1，本轮逐条待审；对应FOREIGN_DRAGON。适用时期：T0前出身解释。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：UCL_20261003_006

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=7; record_id=UCL_20261003_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=172; line_end=172

<a id="world_white_mage_network"></a>
## 白色魔法师的合作网络

`WORLD_WHITE_MAGE_NETWORK` · faction · confirmed · original_campaign · high

触发：白色魔法师的合作网络

更新名单与用户补充支持白魔、卡珊德拉、古雷姆林、巴力西卜和美杜莎等关系，美杜莎忠诚已确认。卡珊德拉协助交易引见与自身议程分记；白魔称肯达多名合作者之一是口供〔character_belief〕，不补忠奸反转史。交红宝石、小粘液人致谢、美杜莎及养父样貌者胁迫是具体连边，不证明共享全情报、统一首领或同体。本标题描述网络，家人故乡能源目标为敌方说法。

审核说明：F1编写稿v1，本轮逐条待审；对应WHITE_MAGE_NETWORK。适用时期：跨时期关系；非正式组织名。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WMPR_002,WMPR_003,FOP_008,UCL_20261003_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=2; record_id=WMPR_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=20; post_id=997651; floor=969
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=22; post_id=998481; floor=971
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=39; post_id=1068182; floor=138
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=41; post_id=1068230; floor=140
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=27; post_id=1333705; floor=226
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=29; post_id=1334073; floor=228
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=21; post_id=1186459; floor=220
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=25; post_id=1247358; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=3; record_id=WMPR_003
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=130; line_end=130
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=146; line_end=146
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=49; post_id=1000177; floor=98
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=5; post_id=1022610; floor=104
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=12; post_id=1081976; floor=111
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=9; post_id=865910; floor=208
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=11; post_id=866075; floor=210
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=15; post_id=867048; floor=214
- https://www.kamen-rider-official.com/zukan/characters/3160 — 东映官方图鉴 ミサ; 人物说明，读取行28–48
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=8; record_id=FOP_008
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=123; line_end=130
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=17; post_id=994593; floor=966
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=18; post_id=996028; floor=967
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=19; post_id=996035; floor=968
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=21; post_id=997687; floor=970
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=9; post_id=1059916; floor=108
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=12; post_id=1059924; floor=111
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=40; post_id=1068185; floor=139
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=13; post_id=866833; floor=212
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=3; post_id=1016053; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=12; post_id=1055963; floor=461
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=13; post_id=1056638; floor=462
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=14; post_id=1068640; floor=463
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=15; post_id=1069865; floor=464
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-10/posts.jsonl — document_id=MUTOU_PAGE_10; source_id=MUTOU; jsonl_line=19; post_id=1090503; floor=468
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=48; post_id=987233; floor=897
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=37; post_id=1068038; floor=136
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=5; post_id=1072771; floor=154
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=6; record_id=UCL_20261003_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=147; line_end=147

<a id="world_white_mage_hostages"></a>
## 龙族根基洞穴交涉

`WORLD_WHITE_MAGE_HOSTAGES` · event · confirmed · original_campaign · high

触发：龙族根基洞穴交涉

临风安兹面对多个白魔个体、本多与元素龙王受控，白魔研究面具、以人质石交涉，安兹威胁后实际放人。原帖一处拿出石又说彻底取出前不崩坏、末处又准备伸手取石，不补完整取走与毁境。为家人合作以后低调属口供承诺〔character_belief〕。原线末史不固定重玩终点。

审核说明：F1编写稿v1，本轮逐条待审；对应WHITE_MAGE_HOSTAGES。适用时期：原线末场；毁境未实演。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：WMPR_002,WMPR_010,DEP_014

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=2; record_id=WMPR_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=20; post_id=997651; floor=969
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=22; post_id=998481; floor=971
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=39; post_id=1068182; floor=138
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl — jsonl_line=41; post_id=1068230; floor=140
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=27; post_id=1333705; floor=226
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=29; post_id=1334073; floor=228
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=21; post_id=1186459; floor=220
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=25; post_id=1247358; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=10; record_id=WMPR_010
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=43; line_end=50
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=125; line_end=125
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=11; post_id=846884; floor=1110
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl — jsonl_line=4; post_id=987498; floor=903
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=30; post_id=1334089; floor=229
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/current_state.md — source_id=STATE_CONTINUATION_D3; line_start=8; line_end=24
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=36; line_end=62
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=14; record_id=DEP_014
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=25
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=26
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=27
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_003_005.jsonl — jsonl_line=28
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=31
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=35
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_017_025.jsonl — jsonl_line=18
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=26; post_id=1333535; floor=225
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=28; post_id=1333706; floor=227
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=17; post_id=994593; floor=966
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=18; post_id=996028; floor=967
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=19; post_id=996035; floor=968
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl — jsonl_line=21; post_id=997687; floor=970
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=35; post_id=862279; floor=1384
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=48; post_id=987233; floor=897

<a id="world_capital_pursuit"></a>
## 帝都报信与达卡斯栽赃追捕

`WORLD_CAPITAL_PURSUIT` · event · confirmed · original_campaign · high

触发：帝都报信与达卡斯栽赃追捕

报边关军情后队伍被依据冒名达卡斯报告追捕，原守城队长在设局现场旁观的同一性联系有证。右近称帝令助捕而达不控全部城卫〔character_belief〕，后来隐蔽保护合作。催眠排查不逐名定无辜或效忠；怪眼队长、黑袍人、十二追兵分别保存，不补全城同阴谋。

审核说明：F1编写稿v1，本轮逐条待审；对应CAPITAL_PURSUIT。适用时期：原线入都后。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：DEP_001,FOP_004,EMP_004

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=1; record_id=DEP_001
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=28
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=44
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=1
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_005_007.jsonl — jsonl_line=6
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=3
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=38
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=35; post_id=816141; floor=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/1/posts.jsonl — jsonl_line=43; post_id=816246; floor=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — jsonl_line=29; post_id=816583; floor=78
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=1; post_id=816699; floor=100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=3; post_id=816704; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=6; post_id=817368; floor=155
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=11; post_id=817447; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=22; post_id=817537; floor=171
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=24; post_id=817616; floor=173
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=1; post_id=818236; floor=200
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=2; post_id=818238; floor=201
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=4; post_id=818243; floor=203
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=5; post_id=818244; floor=204
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=6; post_id=818253; floor=205
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=7; post_id=818254; floor=206
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=27; post_id=818459; floor=226
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=22; post_id=846061; floor=1021
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=24; post_id=846068; floor=1023
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/21/posts.jsonl — jsonl_line=25; post_id=846070; floor=1024
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=42; post_id=817008; floor=141
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=43; post_id=817022; floor=142
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=44; post_id=817026; floor=143
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=45; post_id=817134; floor=144
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=46; post_id=817157; floor=145
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=50; post_id=817167; floor=149
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=4; record_id=FOP_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/2/posts.jsonl — source_id=P1_P002; jsonl_line=33; post_id=816651; floor=82
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=20; post_id=818410; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=35; post_id=817699; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=37; post_id=820769; floor=286
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=25; post_id=823927; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=9; post_id=818345; floor=208
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=16; post_id=822923; floor=315
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=17; post_id=822961; floor=316
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=18; post_id=823045; floor=317
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=19; post_id=823132; floor=318
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=28; post_id=817627; floor=177
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=31; post_id=817654; floor=180
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=25; post_id=818431; floor=224
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/5/posts.jsonl — jsonl_line=26; post_id=818456; floor=225
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=5; post_id=822181; floor=304
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=6; post_id=822686; floor=305
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/6/posts.jsonl — jsonl_line=50; post_id=821604; floor=299
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=1; post_id=821907; floor=300
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=2; post_id=821913; floor=301
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/7/posts.jsonl — jsonl_line=4; post_id=822094; floor=303
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=4; record_id=EMP_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=2; post_id=817173; floor=151
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=4; post_id=817210; floor=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=7; post_id=817395; floor=156
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=8; post_id=817429; floor=157
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=9; post_id=817432; floor=158
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=13; post_id=817453; floor=162
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=15; post_id=817473; floor=164
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=17; post_id=817479; floor=166
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=18; post_id=817481; floor=167
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=20; post_id=817492; floor=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=36; post_id=816817; floor=135
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=40; post_id=816879; floor=139
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=33; post_id=845797; floor=982
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=34; post_id=845814; floor=983
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=35; post_id=845826; floor=984
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=36; post_id=845834; floor=985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=42; post_id=845973; floor=991
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=43; post_id=845975; floor=992
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 3/posts.jsonl — jsonl_line=5; post_id=864692; floor=104
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 3/posts.jsonl — jsonl_line=7; post_id=864704; floor=106
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=21; line_end=26
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — document_id=MUTOU_PAGE_01; source_id=MUTOU; jsonl_line=33; post_id=846685; floor=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-01/posts.jsonl — document_id=MUTOU_PAGE_01; source_id=MUTOU; jsonl_line=39; post_id=846736; floor=38
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-02/posts.jsonl — document_id=MUTOU_PAGE_02; source_id=MUTOU; jsonl_line=27; post_id=848743; floor=76
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=35; post_id=864341; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=39; post_id=864444; floor=188
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=36; post_id=989666; floor=85
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=39; post_id=990702; floor=88
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=41; post_id=992345; floor=90
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=43; post_id=993920; floor=92
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-02/posts.jsonl — document_id=MUTOU_PAGE_02; source_id=MUTOU; jsonl_line=5; post_id=847638; floor=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=25; post_id=968335; floor=74

<a id="world_curse_transfer"></a>
## 悠悠诅咒转移

`WORLD_CURSE_TRANSFER` · event · confirmed · original_campaign · high

触发：悠悠诅咒转移

研究提出另一生命自愿承受，御临风自愿，三人合力转咒成功，悠悠脱离承受、临风负咒。主持随后区分已有魔力自然恢复无害、额外索取加重及失抵抗意愿暴走；神约后联系告诫另分期。不让T0预知全部后效，也不预定主角必须转咒。

审核说明：F1编写稿v1，本轮逐条待审；对应CURSE_TRANSFER。适用时期：原线中期；T0未发生。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：DEP_005,WRS_023,PWRM_006

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/campaign_event_dependencies.jsonl — jsonl_line=5; record_id=DEP_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=20
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=21
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=22
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=23
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=32
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=33
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=34
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=38
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=14; post_id=858359; floor=1313
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=17; post_id=858985; floor=1316
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=20; post_id=859077; floor=1319
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=21; post_id=859084; floor=1320
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=22; post_id=859087; floor=1321
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/27/posts.jsonl — jsonl_line=23; post_id=859089; floor=1322
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=24; post_id=861484; floor=1373
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=23; post_id=861478; floor=1372
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=26; post_id=861774; floor=1375
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=27; post_id=861777; floor=1376
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=20; post_id=860741; floor=1369
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=30; post_id=862100; floor=1379
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=40; post_id=862302; floor=1389
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=41; post_id=862306; floor=1390
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/28/posts.jsonl — jsonl_line=43; post_id=862337; floor=1392
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=23; record_id=WRS_023
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_021_024.jsonl — jsonl_line=19; ERC_P1_0419; post_ids=846744,846748,846753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=49; post_id=846744; floor=1098
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — jsonl_line=1; post_id=846753; floor=1100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=20; ERC_P1_0520; post_ids=858359,858985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=22; ERC_P1_0522; post_ids=859077
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=33; ERC_P1_0533; post_ids=860741,862100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_025_028.jsonl — jsonl_line=38; ERC_P1_0538; post_ids=862302,862306,862337
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=44; ERC_P2_0044; post_ids=913719,913724,913726,913730,913731
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=50; post_id=913719; floor=249
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=1; post_id=913724; floor=250
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=2; post_id=913726; floor=251
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=3; post_id=913730; floor=252
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=4; post_id=913731; floor=253
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/power_rules_dossier.jsonl — jsonl_line=6; record_id=PWRM_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — source_id=P1; jsonl_line=49; post_id=846744; floor=1098
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — source_id=P1; jsonl_line=50; post_id=846748; floor=1099
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/23/posts.jsonl — source_id=P1; jsonl_line=1; post_id=846753; floor=1100
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=38; post_id=913439; floor=237
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=40; post_id=913449; floor=239
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=41; post_id=913450; floor=240
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=42; post_id=913492; floor=241
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=43; post_id=913501; floor=242
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=45; post_id=913595; floor=244
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=46; post_id=913665; floor=245
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=47; post_id=913700; floor=246
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=48; post_id=913709; floor=247
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl — jsonl_line=49; post_id=913717; floor=248
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=5; post_id=913733; floor=254
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=7; post_id=913736; floor=256
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl — jsonl_line=8; post_id=913739; floor=257
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — document_id=P3_P002; jsonl_line=22; post_id=1046114; floor=71
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=29; post_id=846552; floor=1078
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=33; post_id=846643; floor=1082
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=35; post_id=846651; floor=1084
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=36; post_id=846653; floor=1085
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=38; post_id=846670; floor=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/22/posts.jsonl — jsonl_line=45; post_id=846708; floor=1094
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=47; post_id=1047660; floor=446

<a id="world_viel_faer_contract"></a>
## 维尔Faer装具接入

`WORLD_VIEL_FAER_CONTRACT` · event · confirmed · original_campaign · high

触发：维尔Faer装具接入

沐透取回装具给昏睡维尔，实际石化解除、附着变身追杀娜迦，意识冲突后解变身昏迷。克拉肯称契约已成、需供魔控制〔character_belief〕。后父子转述宫廷检查法师塔药水，长期依赖影响生活。取得不等稳定控制，解除帮克拉肯外出义务仅维尔答应转达、未接受结算。

审核说明：F1编写稿v1，本轮逐条待审；对应VIEL_FAER_CONTRACT。适用时期：沐透旁线。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：ESIDE_003,SWU_PWR_002

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/event_causality_sides.jsonl — jsonl_line=3; record_id=ESIDE_003
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — source_id=MUTOU; jsonl_line=7; post_id=895386; floor=256; source_html_line=895
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — source_id=MUTOU; jsonl_line=47; post_id=918376; floor=296; source_html_line=4575
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=10; post_id=929554; floor=309; source_html_line=1172
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=11; post_id=931036; floor=310; source_html_line=1263
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=19; post_id=939232; floor=318; source_html_line=1999
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=25; post_id=948659; floor=324; source_html_line=2551
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=45; post_id=950844; floor=344; source_html_line=4391
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=27; post_id=1042494; floor=426; source_html_line=2735
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=28; post_id=1042503; floor=427; source_html_line=2828
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=29; post_id=1042800; floor=428; source_html_line=2919
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=43; post_id=1046862; floor=442; source_html_line=4207
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=70; line_end=80
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — source_id=MUTOU; jsonl_line=27; post_id=948754; floor=326; source_html_line=2735
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl — source_id=P3; jsonl_line=21; post_id=1046075; floor=70
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=12; record_id=SWU_PWR_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=11; post_id=931036; floor=310
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=15; post_id=931924; floor=314
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=19; post_id=939232; floor=318
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=45; post_id=893857; floor=244
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=47; post_id=893869; floor=246
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=49; post_id=893930; floor=248
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-07/posts.jsonl — document_id=MUTOU_PAGE_07; source_id=MUTOU; jsonl_line=25; post_id=948659; floor=324
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=27; post_id=1042494; floor=426
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=28; post_id=1042503; floor=427
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=29; post_id=1042800; floor=428

<a id="world_mutou_stone_transfer"></a>
## 欧吉尔德交石与庄园变化

`WORLD_MUTOU_STONE_TRANSFER` · event · confirmed · original_campaign · high

触发：欧吉尔德交石与庄园变化

欧把胸内红宝石交沐透，称不知收者〔character_belief〕，沐透后改向北。后台欧失石心源供、归空庄园、见爱人人头和紫裂，小粘液人向卡珊德拉致谢获许诺。后名单确认欧对应Phantom，不补当幕死亡现实化时刻，沐透未见后台不能识破全计划。

审核说明：F1编写稿v1，本轮逐条待审；对应MUTOU_STONE_TRANSFER。适用时期：旁线；后台不传播。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：ESIDE_002,SWU_FAC_006,WMPR_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/event_causality_sides.jsonl — jsonl_line=2; record_id=ESIDE_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — source_id=MUTOU; jsonl_line=1; post_id=865053; floor=200; source_html_line=343
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — source_id=MUTOU; jsonl_line=7; post_id=865860; floor=206; source_html_line=895
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — source_id=MUTOU; jsonl_line=9; post_id=865910; floor=208; source_html_line=1079
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — source_id=MUTOU; jsonl_line=11; post_id=866075; floor=210; source_html_line=1263
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — source_id=MUTOU; jsonl_line=13; post_id=866833; floor=212; source_html_line=1447
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — source_id=MUTOU; jsonl_line=15; post_id=867048; floor=214; source_html_line=1631
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=130; line_end=130
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=23; record_id=SWU_FAC_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=19; post_id=862968; floor=168
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=21; post_id=863008; floor=170
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=23; post_id=863110; floor=172
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=29; post_id=864080; floor=178
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=31; post_id=864186; floor=180
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=33; post_id=864233; floor=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=9; post_id=865910; floor=208
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=11; post_id=866075; floor=210
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=13; post_id=866833; floor=212
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=15; post_id=867048; floor=214
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=3; post_id=1016053; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=49; post_id=1000177; floor=98
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=5; post_id=1022610; floor=104
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=146; line_end=146
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/white_mage_phantom_dossier.jsonl — jsonl_line=5; record_id=WMPR_005
- https://www.kamen-rider-official.com/dictionaries/works_search?initial=%E3%81%AF&search_dictionaries_form%5Bicon%5D=6&search_dictionaries_form%5Bkamen_rider_id%5D=14&utf8=%E2%9C%93 — 东映官方Wizard用语辞典 ファントム; ファントム条目，读取行42–50
- https://www.kamen-rider-official.com/zukan/phantoms/1414 — 东映官方图鉴 グレムリン; 说明正文，读取行44

<a id="world_mutou_naga_recovery"></a>
## 娜迦遗迹夺回装具与水手拘押

`WORLD_MUTOU_NAGA_RECOVERY` · event · confirmed · original_campaign · high

触发：娜迦遗迹夺回装具与水手拘押

沐透救援、夺石化腰带戒指中断施法，复活古神目的未证〔character_belief〕。水手索具攻击，后昏迷替身消散，主持明确耗体力非自走型。守卫链及沉睡术押送、厌魔石适用未知。只救部分镇民，士兵尸数被掳判断保其归属，不写全镇无损。

审核说明：F1编写稿v1，本轮逐条待审；对应MUTOU_NAGA_RECOVERY。适用时期：旁线救援后果。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：SWU_FAC_005,ESIDE_004,SWU_PWR_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=22; record_id=SWU_FAC_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=21; post_id=899698; floor=270
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=23; post_id=900259; floor=272
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=27; post_id=904858; floor=276
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=29; post_id=908013; floor=278
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=39; post_id=914896; floor=288
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=31; post_id=909398; floor=280
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=45; post_id=915859; floor=294
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-06/posts.jsonl — document_id=MUTOU_PAGE_06; source_id=MUTOU; jsonl_line=47; post_id=918376; floor=296
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=13; post_id=954394; floor=362
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=21; post_id=1042094; floor=420
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=17; post_id=955329; floor=366
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=21; post_id=955484; floor=370
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=4; post_id=991804; floor=403
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=9; post_id=1039814; floor=408
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/event_causality_sides.jsonl — jsonl_line=4; record_id=ESIDE_004
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — source_id=MUTOU; jsonl_line=25; post_id=955864; floor=374; source_html_line=2551
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — source_id=MUTOU; jsonl_line=27; post_id=956163; floor=376; source_html_line=2735
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — source_id=MUTOU; jsonl_line=43; post_id=959973; floor=392; source_html_line=4207
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=9; post_id=1039814; floor=408; source_html_line=1080
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=10; post_id=1039862; floor=409; source_html_line=1173
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=11; post_id=1040025; floor=410; source_html_line=1264
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — source_id=MUTOU; jsonl_line=35; post_id=957028; floor=384; source_html_line=3471
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — source_id=MUTOU; jsonl_line=23; post_id=1042344; floor=422; source_html_line=2367
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=15; record_id=SWU_PWR_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=11; post_id=1040025; floor=410

<a id="world_great_tomb_coercion"></a>
## 美杜莎与养父样貌者的镇中胁迫

`WORLD_GREAT_TOMB_COERCION` · event · confirmed · original_campaign · high

触发：美杜莎与养父样貌者的镇中胁迫

养父样貌男子以亲缘和人质胁迫埃弗纳斯，美杜莎带妻尸锁门、首肯引见救助者，男子允放商人仍杀。受胁仅泄迪米乌哥斯名，未披露安兹基地，非自愿合作。释放Phantom保父亲记忆属男子口供〔character_belief〕。贝克护镇长撤离求援，未演援军或抵墓地。

审核说明：F1编写稿v1，本轮逐条待审；对应GREAT_TOMB_COERCION。适用时期：大墓地旁线。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：ESIDE_008,SWU_FAC_006,UCL_20261003_005

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/event_causality_sides.jsonl — jsonl_line=8; record_id=ESIDE_008
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=49; post_id=1000177; floor=98; source_html_line=4807
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=1; post_id=1008821; floor=100; source_html_line=342
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=3; post_id=1016053; floor=102; source_html_line=528
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=5; post_id=1022610; floor=104; source_html_line=714
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=2; post_id=1015970; floor=101; source_html_line=434
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=38; post_id=990696; floor=87; source_html_line=3783
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=12; post_id=1081976; floor=111; source_html_line=1364
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=9; post_id=1055352; floor=108; source_html_line=1086
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=11; post_id=1058086; floor=110; source_html_line=1272
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=5; post_id=954706; floor=54; source_html_line=715
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=9; post_id=955110; floor=58; source_html_line=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=11; post_id=955517; floor=60; source_html_line=1273
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=13; post_id=955598; floor=62; source_html_line=1459
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=15; post_id=955870; floor=64; source_html_line=1645
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=7; post_id=954760; floor=56; source_html_line=901
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=23; record_id=SWU_FAC_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=19; post_id=862968; floor=168
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=21; post_id=863008; floor=170
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=23; post_id=863110; floor=172
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=29; post_id=864080; floor=178
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=31; post_id=864186; floor=180
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-04/posts.jsonl — document_id=MUTOU_PAGE_04; source_id=MUTOU; jsonl_line=33; post_id=864233; floor=182
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=9; post_id=865910; floor=208
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=11; post_id=866075; floor=210
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=13; post_id=866833; floor=212
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=15; post_id=867048; floor=214
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=3; post_id=1016053; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=49; post_id=1000177; floor=98
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=5; post_id=1022610; floor=104
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=REF_SETTING; line_start=130; line_end=130
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=146; line_end=146
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.jsonl — jsonl_line=6; record_id=UCL_20261003_005
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=147; line_end=147

<a id="world_great_tomb_agent"></a>
## 纳萨力克本地代理招募

`WORLD_GREAT_TOMB_AGENT` · event · confirmed · original_campaign · high

触发：纳萨力克本地代理招募

埃弗纳斯同意为安兹效力而拒杀无辜，安兹称试探；清记忆放人是未执行备选。安兹令隐归属、做成绩、查态度，交本地工艺武装马和物资。定期本子焚纸送情报室，紧急卷轴直联。代理向官署隐归属、末线未回报告，不让安兹知道全部遭遇。

审核说明：F1编写稿v1，本轮逐条待审；对应GREAT_TOMB_AGENT。适用时期：迁入后；T0不预置。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：ESIDE_006,SWU_FAC_002,FOP_006

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/event_causality_sides.jsonl — jsonl_line=6; record_id=ESIDE_006
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=6; post_id=923247; floor=5; source_html_line=806
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=7; post_id=923262; floor=6; source_html_line=900
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=8; post_id=923275; floor=7; source_html_line=992
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=9; post_id=923284; floor=8; source_html_line=1086
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=3; post_id=922976; floor=2; source_html_line=528
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=13; post_id=923404; floor=12; source_html_line=1458
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=5; post_id=954706; floor=54; source_html_line=715
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=9; post_id=955110; floor=58; source_html_line=1087
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=11; post_id=955517; floor=60; source_html_line=1273
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=13; post_id=955598; floor=62; source_html_line=1459
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=15; post_id=955870; floor=64; source_html_line=1645
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=7; post_id=954760; floor=56; source_html_line=901
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=38; post_id=990696; floor=87; source_html_line=3783
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=2; post_id=1015970; floor=101; source_html_line=434
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=3; post_id=1016053; floor=102; source_html_line=528
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — source_id=GREAT_TOMB; jsonl_line=12; post_id=1081976; floor=111; source_html_line=1364
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=89; line_end=89
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=19; record_id=SWU_FAC_002
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=6; post_id=923247; floor=5
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=7; post_id=923262; floor=6
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=8; post_id=923275; floor=7
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=9; post_id=923284; floor=8
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=13; post_id=923404; floor=12
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=5; post_id=954706; floor=54
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=9; post_id=955110; floor=58
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=7; post_id=954760; floor=56
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=12; post_id=1081976; floor=111
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=10; post_id=923287; floor=9
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=11; post_id=955517; floor=60
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=13; post_id=955598; floor=62
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=15; post_id=955870; floor=64
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-02/posts.jsonl — document_id=GREAT_TOMB_PAGE_02; source_id=GREAT_TOMB; jsonl_line=38; post_id=990696; floor=87
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=2; post_id=1015970; floor=101
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-03/posts.jsonl — document_id=GREAT_TOMB_PAGE_03; source_id=GREAT_TOMB; jsonl_line=3; post_id=1016053; floor=102
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/faction_operations_dossier.jsonl — jsonl_line=6; record_id=FOP_006
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=56; line_end=59
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=136; line_end=142
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=15; post_id=923436; floor=14
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=29; post_id=928408; floor=28
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-great-tomb/page-01/posts.jsonl — document_id=GREAT_TOMB_PAGE_01; source_id=GREAT_TOMB; jsonl_line=41; post_id=939231; floor=40
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=12; post_id=959984; floor=711
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=13; post_id=959986; floor=712
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=14; post_id=960048; floor=713
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=18; post_id=960111; floor=717
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=12; post_id=967530; floor=761
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=3; post_id=1072134; floor=152
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=5; post_id=1072771; floor=154
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=8; post_id=1072826; floor=157
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=9; post_id=1073337; floor=158
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=10; post_id=1073342; floor=159
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=11; post_id=1073364; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=13; post_id=1073378; floor=162
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=15; post_id=1073384; floor=164
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=35; post_id=1077728; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=1; post_id=1090502; floor=200
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=16; post_id=1073385; floor=165
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=17; post_id=1073563; floor=166
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=20; post_id=1073566; floor=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl — jsonl_line=21; post_id=1074136; floor=170

<a id="world_city_reform"></a>
## 帝都战时生产与新政改革

`WORLD_CITY_REFORM` · event · confirmed · original_campaign · high

触发：帝都战时生产与新政改革

战争期兵工厂国库刺激市场，补给游击士沿途、过冬品更易买，协会前线支援后冷清。P3首帖祭后近月、临新年，新政废最后贫民区、为多数无职者配工作并扩城。记录战时治理变化，不表示以前无贫穷或所有人处境相同，不当T0已完成成果。

审核说明：F1编写稿v1，本轮逐条待审；对应CITY_REFORM。适用时期：原线后期。作者资料不自动给予角色知识，原线后期历史不预设重玩未来。研究依据：EMP_008,WRS_041,SWU_SOC_007

来源：

- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/empire_dossier.jsonl — jsonl_line=8; record_id=EMP_008
- D:/备份文件/901记录/TRPG outputs/设定 人物/妄想大陆设定集_检索版.md — source_id=SET; line_start=184; line_end=187
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl — document_id=P3_P001; jsonl_line=1; post_id=1033317; floor=
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-09/posts.jsonl — document_id=MUTOU_PAGE_09; source_id=MUTOU; jsonl_line=23; post_id=1042344; floor=422
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=46; post_id=962304; floor=745
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl — jsonl_line=47; post_id=962305; floor=746
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=4; post_id=963675; floor=753
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl — jsonl_line=5; post_id=963731; floor=754
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=28; post_id=985223; floor=877
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=29; post_id=985898; floor=878
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=30; post_id=986052; floor=879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=38; post_id=987018; floor=887
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=39; post_id=987026; floor=888
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl — jsonl_line=40; post_id=987029; floor=889
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=19; post_id=1179677; floor=218
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=20; post_id=1182889; floor=219
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl — jsonl_line=23; post_id=1206254; floor=222
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=42; post_id=1031470; floor=1191
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=43; post_id=1031478; floor=1192
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl — jsonl_line=44; post_id=1032053; floor=1193
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=42; line_end=42
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/user_clarifications.md — source_id=REF_USER_CLARIFICATIONS; line_start=43; line_end=43
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_evidence_supplement.jsonl — jsonl_line=41; record_id=WRS_041
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=42; ERC_P1_0042; post_ids=817173,817210,817395,817429,817432,817447,817699
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=2; post_id=817173; floor=151
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=4; post_id=817210; floor=153
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=7; post_id=817395; floor=156
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=8; post_id=817429; floor=157
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=9; post_id=817432; floor=158
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=11; post_id=817447; floor=160
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=35; post_id=817699; floor=184
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=43; ERC_P1_0043; post_ids=817453,817473,817479,817481,817492
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=13; post_id=817453; floor=162
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=15; post_id=817473; floor=164
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=17; post_id=817479; floor=166
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=18; post_id=817481; floor=167
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/4/posts.jsonl — jsonl_line=20; post_id=817492; floor=169
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_001_004.jsonl — jsonl_line=37; ERC_P1_0037; post_ids=816817,816879
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=36; post_id=816817; floor=135
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/3/posts.jsonl — jsonl_line=40; post_id=816879; floor=139
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p1_017_020.jsonl — jsonl_line=34; ERC_P1_0334; post_ids=845797,845814,845826,845834,845973,845975
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=33; post_id=845797; floor=982
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=34; post_id=845814; floor=983
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=35; post_id=845826; floor=984
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=36; post_id=845834; floor=985
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=42; post_id=845973; floor=991
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-first/20/posts.jsonl — jsonl_line=43; post_id=845975; floor=992
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p2_001_008.jsonl — jsonl_line=18; ERC_P2_0018; post_ids=864692,864704
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 3/posts.jsonl — jsonl_line=5; post_id=864692; floor=104
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 3/posts.jsonl — jsonl_line=7; post_id=864704; floor=106
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/reading_p3_001_002.jsonl — jsonl_line=1; ERC_P3_0001; post_ids=1033317
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/work/replay_research/world_side_evidence.jsonl — jsonl_line=10; record_id=SWU_SOC_007
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=33; post_id=956361; floor=382
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-08/posts.jsonl — document_id=MUTOU_PAGE_08; source_id=MUTOU; jsonl_line=37; post_id=957923; floor=386
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=17; post_id=867911; floor=216
- C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG outputs/extracted-mutou/page-05/posts.jsonl — document_id=MUTOU_PAGE_05; source_id=MUTOU; jsonl_line=25; post_id=869062; floor=224
