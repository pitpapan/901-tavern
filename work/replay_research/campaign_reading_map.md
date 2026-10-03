# 团录共享阅读地图

> 此地图自身的已读统计是创建时快照。当前三部58页、2848帖正文均已完整阅读；最新全局计数、包列表与未读范围见 README.md / progress.json。

本文件及同名 JSON 是导航和待读队列，不是正典、人物卡、审核结论或全量已读声明。团录采用本 worktree 的 2a81f9e 快照；外部战报仅作来源索引。

覆盖：58页 / 2,848帖；30个大段；67个场景路由；本轮完整定点读 33 帖，完整页精读为0。每页只有一个主读队列项，世界、人物、规则共享证据。

## 开局与分层

开局为 P1第2页 #78/msg816583结束后，#79/msg816591御临风清算纳入，#80/msg816647同行NPC清算另核；#81/msg816648自主报信行动尚未发生。这些引用在 JSON opening 中含文件及JSONL行号。current_state.md的秘境毁灭后D3状态保持独立，不作开局初始化。

前史补充入口：D:\备份文件\901记录\战报\901前史与设定备忘录.md。它自述是遗失前史的用户口述补充；不是重建遗失对话的许可。设定及原卡先用 docs/reading/REFERENCE_SECTIONS.md 定位，持续更新的晚期资料要核有效时点。

| 分界 | 完整定点引用 | 阅读发现 |
|---|---|---|
| ENTRY | extracted-first/2/posts.jsonl:29 / #78 / msg 816583 | 首次帝都近门开局：#78结束后；#79御临风强化纳入；#80布莱特强化另核；#81行动尚未执行 |
| DREAM_P1_BEGIN | extracted-first/7/posts.jsonl:43 / #342 / msg 825205 | 同帖前半主线、后半番外；正文索引不能把整帖归梦 |
| DREAM_P1_RETURN | extracted-first/16/posts.jsonl:23 / #772 / msg 843565 | 主世界醒来与洞穴取得魔物之盒；索引#342-799梦境包过宽，#772-799已主线；精确结算区间待读#763-771 |
| DREAM_P2_GAME_BEGIN | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 10/posts.jsonl:20 / #469 / msg 924534 | 集团传送后同帖切入校园；梦境与主线角色身份分开 |
| DREAM_P2_GAME_END | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl:14 / #663 / msg 957033 | 梦境结束；#664强化；#665已主线风雪并回顾传送 |
| DREAM_P2_LONDON_BEGIN | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl:28 / #977 / msg 1000325 | 同帖前半主线入睡，后半伦敦侧写师背景/临时能力 |
| DREAM_P2_LONDON_RETURN | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl:22 / #1171 / msg 1031142 | 同帖案件/侦探结算后回主世界；奖励与实际携回仍逐字段核；#1172主世界 |
| SPECIAL_P3_BEGIN | extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl:30 / #229 / msg 1334089 | 同帖前半与白魔/安兹对话，后半大杭市博士梦境背景 |
| SPECIAL_P3_UNFINISHED | extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl:50 / #249 / msg 1334397 | 最后已保存帖仍梦中行动，未见离梦/携回结算；现代鬼规则不能升级主世界 |

P1/P2梦境属于原团材料，但现代/异世界舞台与临时人格、规则独立；原文明确带回的奖励才纳入主世界候选。P3未完特殊梦境是Original Campaign / Special Interlude；现代鬼规则不投射到主世界。D0-D3最低桥接仅由current_state.md管理，D3后新游玩属于Continuation；本次重玩分支另记，不能让原线未来必然发生。

## 大段路由

以下是阅读包，不是正式事件条目；页级/重叠端点仍provisional。JSON保留每段的世界主题、人物名单、待核规则、实际页路径、首末msg ID和JSONL行区间；每个场景在scene_routes回接其包。

| 包 | 范围 | 标题 | 主读目标 |
|---|---|---|---|
| P1-A | P1 #1-#99 | 疯狂魔法师余波、首次入帝都及报信 | 村落与帝都入口；边关军情；医药与推荐信；圆盘；人物：御临风、布莱特、黄泉、老村医、陈丘、雅儿、小清、二五仔 |
| P1-B | P1 #100-#149 | 九雪医馆与达卡斯疑云 | 帝都机构；九雪医馆；兄弟会；追捕；人物：御临风、布莱特、黄泉、大妈、露露缇耶、达卡斯 |
| P1-C | P1 #150-#249 | 帝都分线与右近会合 | 帝都地理；协会；兄弟会与军方；人物：御临风、布莱特、黄泉、右近、怪眼队长 |
| P1-D | P1 #250-#342 | 矮人铺突围与边关真相 | 装备；边关陷落证词；魔兽战术；八柱将；人物：雪老、大妈、艾利、佐间、阿德莱德、右近、御临风、布莱特、黄泉 |
| P1-E | P1 #342-#799 | 神秘海域番外与主线回归（修正索引范围） | 番外黄金乡；罗盘；魔物之盒；主世界带回边界；人物：御临风、布莱特、黄泉、姜子尤、Boss、刚特姆、哈克、黄翔、雪老 |
| P1-F | P1 #800-#947 | 血与火侦察与帝国收网 | 空间龙；凌迟计划；军队与八柱将；魔兽势力；人物：御临风、姜子尤、布莱特、黄泉、雪老、达卡斯、凌迟、卡泽、黄祸龙狼、左近、宗近、右近 |
| P1-G | P1 #947-#1039 | 悠悠救人、英雄归城与九雪日常 | 空间龙身份；医馆；雪老退幕；民众认知；人物：悠悠、御临风、雪老、姜子尤、布莱特、黄泉 |
| P1-H | P1 #1040-#1207 | 朝见、咒文检查、挖墓与探监 | 帝国决策；空间龙风险；记忆与魔力；审判；人物：帝、威廉、悠悠、御临风、宝石翁、慕少艾、雪老 |
| P1-I | P1 #1208-#1393 | 魔物之盒灾变、耶各转移与尾声 | 耶各诅咒；魔眼灾变；龙族谈判；白魔线；人物：御临风、悠悠、布莱特、艾利、阿德莱德、慕少艾、宝石翁、威廉、帝、沃西斯、哈克、黄祸龙狼 |
| P2-A | P2 #1-#149 | 耶各诅咒与尸体城堡 | 费伦与死亡神系；尸体城堡；魔物实验；人物：御临风、哈克、久远、A、巴力西卜 |
| P2-B | P2 #150-#349 | 诱饵宅邸与代行者、法师塔 | 宅邸；古雷姆林；法师塔；国家灾厄；人物：御临风、艾利、黄泉、诺斯莉、古雷姆林、耶各、A、武赖、宗近、布莱特 |
| P2-C | P2 #300-#449 | 帝都善后、装备整备与边关攻防 | 下水道；铁匠铺；帝国军；卷轴道路；异界来客；人物：御临风、悠悠、托尔金、雪老、贞子、哈克、艾利、沃西斯、雷光 |
| P2-D | P2 #400-#599 | 离都、校园梦境及揭示 | 旅途；校园游戏梦；贤者之石；梦境真相；人物：御临风、黄泉、悠悠、布莱特、艾利、罗伯、尼克弗瑞、陈萧生、笛木奏、操真晴人 |
| P2-E | P2 #550-#699 | 梦境攻坚、终局、强化与主线回归 | 腾讯大厦梦境；容器；银色巨龙；黑龙预言；人物：御临风、悠悠、黄泉、尼克弗瑞、操真晴人 |
| P2-F | P2 #650-#749 | 洞窟、杨的情报与龙族秘境 | 洞窟；暗幕魔兽；疑似兵工厂；边关诱饵；不死者情报；人物：罗伯、御临风、杨、哥布林、贞子、艾利、谢尔伦 |
| P2-G | P2 #700-#749 | 龙族宴会入场与五王 | 龙族政治；白色假面；宴会与外交；人物：御临风、悠悠、本多、诺顿、南希、赫伯特、肯达、奥希拉、罗伯 |
| P2-H | P2 #750-#849 | 考验前夜与空间龙旧案 | 空间龙灭族证词；考验流程；边关旧账；人物：御临风、悠悠、谢尔伦、奥希拉、逸冷、白衣女鬼、凌迟、黄祸龙狼 |
| P2-I | P2 #800-#899 | 肯达试探与龙族典礼 | 黑龙预言者；空间龙族长；血脉石台；人物：御临风、悠悠、谢尔伦、肯达 |
| P2-J | P2 #850-#949 | 牌局暗杀与黑龙预言 | 龙族内鬼疑点；黑龙历史与预言；帝国龙族关系；人物：御临风、悠悠、肯达、本多、谢尔伦、奥希拉、死亡之翼 |
| P2-K | P2 #950-#977 | 白魔追踪、兵工厂与强行军 | 北方26号洞；地下军工；受荣之道；白魔计划；人物：御临风、奥斯卡贝、罗伯、悠悠、白色魔法师 |
| P2-L | P2 #977-#1049 | 伦敦梦境与人体乐器案 | 伦敦梦境；警局；雪白之龙琴行；人体乐器案；人物：御临风、尼克弗瑞、道格拉斯·威尔逊、谢尔伦、悠悠 |
| P2-M | P2 #1000-#1171 | 食人魔阴影与Neltharion | 梦境机构；药物；食人魔；悠悠家庭；人物：御临风、诺顿、戴安娜、杰西卡父母、赫伯特、英国国王、谢尔伦、悠悠 |
| P2-N | P2 #1171-#1203 | 现实雪原、死亡之翼与受荣之道急令 | 红月；远征军；死亡之翼；最后封印；人物：御临风、侦察兵队长、侦察兵、雷光、奥斯卡贝、耶各、特兰希尔、死亡之翼 |
| P3-A | P3 #0-#26 | 雪原突围与秘境入口 | 帝都后方；恶魔制空；地道兵种；秘境入口；人物：御临风、雪老、露露缇耶、奥斯卡贝、哥布林、蛇妖 |
| P3-B | P3 #27-#101 | 受荣之道、历史证词与最后封印 | 泰蕾斯历史证词；外神；精灵娜迦；北海巨妖；面具；秘境根基；人物：御临风、悠悠、泰蕾斯、瑟坦特、贞子、塞拉尔博士、帝 |
| P3-C | P3 #102-#152 | 谢尔伦战线与卡珊德拉交易 | 白魔合作与Phantom；根基；未来支流；人物：御临风、悠悠、谢尔伦、卡珊德拉、本多、白色魔法师 |
| P3-D | P3 #153-#195 | 安兹外交与命运分流 | 纳萨力克；帝国外交；异界时间线；龙族撤离；人物：御临风、安兹、卡珊德拉、悠悠、帝、陈萍生 |
| P3-E | P3 #196-#220 | 死亡之翼讨伐 | 黑龙军团；战争结果；潜能解锁；人物：御临风、悠悠、谢尔伦、死亡之翼、贞子、神秘人形生物 |
| P3-F | P3 #221-#229 | 白魔退场与命运理论 | 魔宝石；秘境根基；白魔命运理论；囚禁高塔；人物：御临风、安兹、白色魔法师、本多、瑟坦特、肯达 |
| P3-G | P3 #229-#249 | 未完成现代灵异特殊梦境 | 大杭市；至衡；驭鬼者；黄金；鬼域；人物：御临风、周正、方镜、神父、任帆真、雷电法王、敲门老人 |

## 先读包

### OPENING_PRIOR

先完整主读P1第1-2页，开局仅采用#78已发生及#79已生效；#80同行NPC强化单独核。#81以后不属于开局已发生。

- extracted-first/1/posts.jsonl；JSONL 2-50；#1-#49；msg 816014-816289。
- extracted-first/2/posts.jsonl；JSONL 1-31；#50-#80；msg 816290-816647。

### OPENING_FORK

精读开局锚点/强化/原线第一行动；#81-82仅导演比较参考，不预先执行。

- extracted-first/2/posts.jsonl；JSONL 28-33；#77-#82；msg 816564-816651。

### CAPITAL_HIDDEN

帝都原线政治与军情揭示，区分已存在的后台事实与后来才知晓的信息；不能保证重玩同样触发。

- extracted-first/2/posts.jsonl；JSONL 32-50；#81-#99；msg 816648-816694。
- extracted-first/3/posts.jsonl；JSONL 1-50；#100-#149；msg 816699-817167。
- extracted-first/4/posts.jsonl；JSONL 1-50；#150-#199；msg 817171-818231。
- extracted-first/5/posts.jsonl；JSONL 1-50；#200-#249；msg 818236-819205。
- extracted-first/6/posts.jsonl；JSONL 1-50；#250-#299；msg 819306-821604。
- extracted-first/7/posts.jsonl；JSONL 1-43；#300-#342；msg 821907-825205。

### DREAM_RETURN_RULES

神秘海域结束、结算、主世界魔盒与哈克背景；优先补#763-770未精读范围。

- extracted-first/16/posts.jsonl；JSONL 3-29；#752-#778；msg 843049-843621。

### DRAGON_HISTORY

泰蕾斯历史与封印/面具证词；未来揭示不直接给开局御临风知情。

- extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl；JSONL 28-50；#27-#49；msg 1041256-1042493。
- extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl；JSONL 1-50；#50-#99；msg 1042498-1057980。
- extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl；JSONL 1-2；#100-#101；msg 1058085-1058088。

### SPECIAL_FENCE

对白魔理论和现代灵异特殊梦境作分段隔离；理论为发言、梦境为特殊层。

- extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl；JSONL 29-50；#228-#249；msg 1334073-1334397。

## 58页共享主读队列

分配主读者时修改未来独立进度账，不自动改写本导航快照。主读产物应记录subject/actor/speaker、认知状态、有效/知情时间、世界与人物候选、规则限制、缺图与冲突，供三类成果复用；不能按每个人物重新通读同页。定点读过不等于整页完成。

| 队列 | 文件 | 帖数 | 首末msg | 状态 |
|---|---|---|---|---|
| P1_P001 | extracted-first/1/posts.jsonl | 50 | 816001-816289 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P002 | extracted-first/2/posts.jsonl | 50 | 816290-816694 | NOT_STARTED_FULL_PAGE；定点5帖 |
| P1_P003 | extracted-first/3/posts.jsonl | 50 | 816699-817167 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P004 | extracted-first/4/posts.jsonl | 50 | 817171-818231 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P005 | extracted-first/5/posts.jsonl | 50 | 818236-819205 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P006 | extracted-first/6/posts.jsonl | 50 | 819306-821604 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P007 | extracted-first/7/posts.jsonl | 50 | 821907-825506 | NOT_STARTED_FULL_PAGE；定点2帖 |
| P1_P008 | extracted-first/8/posts.jsonl | 50 | 825507-826258 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P009 | extracted-first/9/posts.jsonl | 50 | 826264-830124 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P010 | extracted-first/10/posts.jsonl | 50 | 830913-839296 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P011 | extracted-first/11/posts.jsonl | 50 | 839298-839988 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P012 | extracted-first/12/posts.jsonl | 50 | 839989-840806 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P013 | extracted-first/13/posts.jsonl | 50 | 840807-841025 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P014 | extracted-first/14/posts.jsonl | 50 | 841028-842149 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P015 | extracted-first/15/posts.jsonl | 50 | 842154-843021 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P016 | extracted-first/16/posts.jsonl | 50 | 843040-843978 | NOT_STARTED_FULL_PAGE；定点15帖 |
| P1_P017 | extracted-first/17/posts.jsonl | 50 | 843980-844429 | NOT_STARTED_FULL_PAGE；定点1帖 |
| P1_P018 | extracted-first/18/posts.jsonl | 50 | 844435-845038 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P019 | extracted-first/19/posts.jsonl | 50 | 845039-845621 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P020 | extracted-first/20/posts.jsonl | 50 | 845627-845994 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P021 | extracted-first/21/posts.jsonl | 50 | 845995-846202 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P022 | extracted-first/22/posts.jsonl | 50 | 846204-846748 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P023 | extracted-first/23/posts.jsonl | 50 | 846753-847484 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P024 | extracted-first/24/posts.jsonl | 50 | 847486-849058 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P025 | extracted-first/25/posts.jsonl | 50 | 849061-851837 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P026 | extracted-first/26/posts.jsonl | 50 | 851839-856006 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P027 | extracted-first/27/posts.jsonl | 50 | 856879-859427 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P1_P028 | extracted-first/28/posts.jsonl | 44 | 859470-862379 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P001 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.jsonl | 50 | 862378-863417 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P002 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.jsonl | 50 | 863420-864618 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P003 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 3/posts.jsonl | 50 | 864659-868766 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P004 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.jsonl | 50 | 868902-900474 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P005 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.jsonl | 50 | 902068-913719 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P006 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl | 50 | 913724-914868 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P007 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl | 50 | 914889-917628 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P008 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl | 50 | 917739-921071 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P009 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.jsonl | 50 | 921122-923303 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P010 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 10/posts.jsonl | 50 | 923420-928066 | NOT_STARTED_FULL_PAGE；定点1帖 |
| P2_P011 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 11/posts.jsonl | 50 | 928184-940879 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P012 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 12/posts.jsonl | 50 | 940882-952600 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P013 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 13/posts.jsonl | 50 | 952603-956353 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P014 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl | 50 | 956354-959199 | NOT_STARTED_FULL_PAGE；定点3帖 |
| P2_P015 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.jsonl | 50 | 959208-962331 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P016 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.jsonl | 50 | 962428-971255 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P017 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl | 50 | 971561-974730 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P018 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.jsonl | 50 | 974791-987239 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P019 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 19/posts.jsonl | 50 | 987243-989838 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P020 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl | 50 | 989912-1002331 | NOT_STARTED_FULL_PAGE；定点1帖 |
| P2_P021 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 21/posts.jsonl | 50 | 1002351-1009859 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P022 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 22/posts.jsonl | 50 | 1009877-1025251 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P023 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 23/posts.jsonl | 50 | 1025802-1030766 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P2_P024 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl | 50 | 1030775-1033262 | NOT_STARTED_FULL_PAGE；定点2帖 |
| P2_P025 | extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 25/posts.jsonl | 4 | 1033271-1033318 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P3_P001 | extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.jsonl | 50 | 1033317-1042493 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P3_P002 | extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.jsonl | 50 | 1042498-1057980 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P3_P003 | extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.jsonl | 50 | 1058085-1070992 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P3_P004 | extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl | 50 | 1071757-1089569 | NOT_STARTED_FULL_PAGE；定点0帖 |
| P3_P005 | extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl | 50 | 1090502-1334397 | NOT_STARTED_FULL_PAGE；定点3帖 |

## 索引误差与未验证范围

- P1分段目录将#342-799合并作神秘海域，正文#772已明确回主线；保留粗导航包并注明段内纠偏。
- P3分段目录写p1#27-p2#101，真实#100-101在第3页；写p3#102-152时#150-152在第4页。所有路由以本快照真实楼层/JSONL为准。
- 后两组分段目录为02_剧情分段目录.md，没有03；不视作缺资料。
- 场景索引存在相邻段重叠和未列出的楼层（如P1#79-80、#1187-1199）；58页主读队列覆盖所有帖子，索引遗漏不作删除。
- P2早期场景卡只给页级范围；其scene_routes是整页包，精确场景端点均provisional。

完整读取范围：JSON actual_reading.complete_body_post_refs列出的33帖；不含早先原工作区抽样。本轮八份场景/分段索引读全，前两组02事件台账作导航补读。关键词扫描只看局部，未登记整帖完成。尚未全量精读任何页、全量核设定/原卡、逐图查看、核HTML抽取保真或判定全部源冲突。旧审计历史检查点不作为本次实时进度。

实际完整定点帖子：

- extracted-first/2/posts.jsonl:28 / #77 / msg 816564
- extracted-first/2/posts.jsonl:29 / #78 / msg 816583
- extracted-first/2/posts.jsonl:30 / #79 / msg 816591
- extracted-first/2/posts.jsonl:31 / #80 / msg 816647
- extracted-first/2/posts.jsonl:32 / #81 / msg 816648
- extracted-first/7/posts.jsonl:43 / #342 / msg 825205
- extracted-first/7/posts.jsonl:44 / #343 / msg 825257
- extracted-first/16/posts.jsonl:4 / #753 / msg 843050
- extracted-first/16/posts.jsonl:5 / #754 / msg 843052
- extracted-first/16/posts.jsonl:6 / #755 / msg 843067
- extracted-first/16/posts.jsonl:9 / #758 / msg 843128
- extracted-first/16/posts.jsonl:10 / #759 / msg 843232
- extracted-first/16/posts.jsonl:11 / #760 / msg 843244
- extracted-first/16/posts.jsonl:12 / #761 / msg 843260
- extracted-first/16/posts.jsonl:13 / #762 / msg 843266
- extracted-first/16/posts.jsonl:22 / #771 / msg 843516
- extracted-first/16/posts.jsonl:23 / #772 / msg 843565
- extracted-first/16/posts.jsonl:46 / #795 / msg 843969
- extracted-first/16/posts.jsonl:47 / #796 / msg 843970
- extracted-first/16/posts.jsonl:48 / #797 / msg 843975
- extracted-first/16/posts.jsonl:49 / #798 / msg 843976
- extracted-first/16/posts.jsonl:50 / #799 / msg 843978
- extracted-first/17/posts.jsonl:1 / #800 / msg 843980
- extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 10/posts.jsonl:20 / #469 / msg 924534
- extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl:14 / #663 / msg 957033
- extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl:15 / #664 / msg 957034
- extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 14/posts.jsonl:16 / #665 / msg 957558
- extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.jsonl:28 / #977 / msg 1000325
- extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl:22 / #1171 / msg 1031142
- extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl:23 / #1172 / msg 1031143
- extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl:29 / #228 / msg 1334073
- extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl:30 / #229 / msg 1334089
- extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl:50 / #249 / msg 1334397

来源索引文件与SHA-256见JSON navigation_indexes；source_routes的首末msg和JSONL行均由本worktree实际posts.jsonl定位。本文不复制原文、不生成逐帖event、不裁决别名，不生成新worldbook_source.jsonl。
