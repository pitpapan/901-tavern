# R2C 跨角色事件传播审计

状态：`PROVISIONAL_FOR_HUMAN_REVIEW`

## CASSANDRA_AINZ_NEGOTIATION

事件引用：`EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION`

- `NPC_AINZ_OOAL_GOWN` — negotiation counterpart：同意介入撤离安排。
- `NPC_CASSANDRA` — intermediary：带御临风接触安兹；其完整目的与交易可信度未确定。
- `PC_YU_LINFENG` — negotiator：以帝国使者身份进行协商；不得替其补写私密动机。

## CURSE_TRANSFER

事件引用：`EVENT_P1_021_JERGAL_TRANSFER`

- `NPC_YOUYOU` — curse source：御临风自愿承接后，致命诅咒从悠悠处转出。
- `PC_YU_LINFENG` — voluntary recipient：承接悠悠的致命诅咒；不得据此生成其自主决定。

## DEATHWING_FINAL_BATTLE

事件引用：`EVENT_P3_009_DEATHWING_FINAL_WAR`

- `NPC_DEATHWING` — opponent：本轮肉身瓦解；永久死亡与复活机制未知。
- `NPC_XIERLUN_VON_GILCODE` — combatant：压制并限制死亡之翼，为御临风突入创造条件。
- `NPC_YOUYOU` — absent protector：此前留下的乳白力量在战斗中保护御临风。
- `PC_YU_LINFENG` — combatant：进入死亡之翼体内并破坏，使本轮肉身瓦解。

## DRAGON_SANCTUARY_FINALE

事件引用：`EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY`

- `NPC_AINZ_OOAL_GOWN` — returning witness and intervener：与御临风返回根基，并在后续最小过渡中介入。
- `NPC_DEATHWING` — defeated body：本轮肉身在前一事件瓦解；永久死亡未知。
- `NPC_HONDA_KAI_FERGUS` — suppressed：被白魔形体压制并以笛剑钉住。
- `NPC_SERTANT_LU_YOURLAN` — suppressed：失去意识且受结界束缚，面具被白魔形体研究。
- `NPC_WHITE_MAGICIAN` — actor and theorist：压制两位龙王、取出魔宝石并提出未证实理论。
- `PC_YU_LINFENG` — returning witness：与安兹返回根基并见到本多、瑟坦特受压制；PC 自主控制边界不变。

固定相对顺序：`deathwing_current_body_destroyed → yu_and_ainz_return_to_foundation → honda_and_sertant_found_suppressed → ainz_intervenes → white_magician_disengages → magic_gem_removed`

## EMPEROR_HAKU_SUCCESSION

事件引用：`无 R2A 中央事件；仅保留审计路由`

- `NPC_EMPEROR` — claimant and proposer：声称与哈克为兄弟并提出继承选择；血缘未独立确认。
- `NPC_HAKU` — recipient：听到身世陈述与继承提议，但未在该场景接受。

## OSHIRA_CONTROL

事件引用：`无 R2A 中央事件；仅保留审计路由`

- `NPC_DEATHWING` — unresolved possible influence：御临风曾推测其可影响非自然黑龙，但未确认共同直接施术。
- `NPC_OSHIRA` — nonvoluntary controlled subject：在龙族秘境战中被控制；机制、意识、记忆与持续性未知。
- `NPC_WHITE_MAGICIAN` — controller named by record：团录明确写其操控黑龙族长；不据此推定血脉魔法机制。
- `NPC_XIERLUN_VON_GILCODE` — reporting witness：报告奥希拉与黑龙族遭到控制。

## WHITE_MAGICIAN_GEM_EXTRACTION

事件引用：`EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY`

- `NPC_AINZ_OOAL_GOWN` — witness：与御临风返回根基并见证交涉。
- `NPC_HONDA_KAI_FERGUS` — suppressed witness：被压制并钉住。
- `NPC_SERTANT_LU_YOURLAN` — unconscious restrained subject：失去意识并被结界束缚。
- `NPC_WHITE_MAGICIAN` — extractor：在根基密室取出魔宝石并准备离开。
- `PC_YU_LINFENG` — witness and questioner：返回后目击现场并参与情报交涉。

## XIERLUN_ENGAGEMENT_PLANNING

事件引用：`无 R2A 中央事件；仅保留审计路由`

- `NPC_XIERLUN_VON_GILCODE` — planner：参与保护性婚约安排；不产生 D3 当前义务。
- `NPC_YOUYOU` — proposed party：相关安排不证明当前婚姻、爱情或永久义务。
- `PC_YU_LINFENG` — conditionally accepting party：曾作为保护权宜方案暂时接受，并保留悠悠日后选择权。

## YOUYOU_CEREMONY

事件引用：`EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION`

- `NPC_HONDA_KAI_FERGUS` — public declarant：公开称御临风为悠悠婚约者；此为场景陈述而非 D3 婚姻事实。
- `NPC_YOUYOU` — ceremony focus：被公开置于空间龙族族长位置；姓名与继承变化另按来源记录。
- `PC_YU_LINFENG` — participant：参与典礼并遭肯达相关牌面效果；婚约说法不自动成为当前义务。

## 边界

本账本是候选档案之间的机械传播审计，不创建第二事件权威源，也不自动批准任何人物事实。
