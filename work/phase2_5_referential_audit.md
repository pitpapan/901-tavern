# Phase 2.5 Referential & Runtime Audit

## 1. Baseline

Worldbook SHA-256: `07878B8E7A3998367B3E4A918DDA2D2B00C38D4213F99A374706A9A5905E53C7`

Entry count: 64. Trigger-key count: 84 (64 primary-name keys and 20 additional keys).

Files read:

- `output/worldbook_source.jsonl`
- `work/phase2_review.md`
- `work/phase2_discoveries.md`
- `current_state.md`
- `work/phase2/batch_01_review.md` through `work/phase2/batch_07_review.md`
- `设定 人物/人物卡资料集_叙事检索版.md`
- `设定 人物/妄想大陆设定集_检索版.md`
- first- and second-part `01_角色与主题线索表.md`
- third-part `00_顺读场景卡.md`
- cited first-, second-, and third-part `posts.md` records used for the individual findings below

This is a read-only audit. The formal worldbook, `current_state.md`, frozen inputs, schema, and original records were not modified. Candidate reasons and previous review decisions were treated as navigation, not as factual prose.

## 2. Referential Integrity

Decision meanings:

- `APPROVE`: recommend a future, separately reviewed canonical entry because the entity has durable independent referential value. This report does not add it.
- `HOLD`: identity, evidence, or scope is not stable enough for a canonical entry.
- `NO_ENTRY_NEEDED`: the name is sufficiently carried by an existing event/entity entry and lacks current independent runtime value.

| proposed_name | proposed_type | aliases | existing canonical references | source evidence actually checked | current relevance | referential role | decision | notes |
|---|---|---|---|---|---|---|---|---|
| 死亡之翼 | character | — | `FACTION_EMPIRE`, `FACTION_DRAGON_RACE`, `LOCATION_DRAGON_SECRET_REALM`, `CHARACTER_YU_LINFENG`, `CHARACTER_AINZ_OOAL_GOWN`, `CHARACTER_XIERLUN_VON_GILCODE`, `EVENT_DEATHWING_BATTLE`, `EVENT_DRAGON_SANCTUARY_DESTRUCTION` | `current_state.md` §§原 Campaign 结束点、死亡之翼; third-part page 5 `posts.md`; `EVENT_DEATHWING_BATTLE` sources | 本轮肉身已败，但不死性、复活和古神关联未决 | active_unresolved_entity | APPROVE | 独立实体反复跨条目被引用；不能把阶段性胜利写成永久死亡。 |
| 本多·凯·弗格斯 | character | 赤炎龙王、本多 | `LOCATION_DRAGON_SECRET_REALM`, `CHARACTER_AINZ_OOAL_GOWN`, `CHARACTER_WHITE_MAGICIAN`, `EVENT_DRAGON_BANQUET`, `EVENT_DRAGON_SANCTUARY_DESTRUCTION` | second-part page 15 `posts.md`; third-part page 5 `posts.md`; `current_state.md` 原团结束点 | 已撤离秘境；龙族战后秩序和与肯达的家庭关系仍有连续性 | active_unresolved_entity | APPROVE | 正式姓名与称号应同时可检索；不要从“龙王”自动推导政治立场。 |
| 瑟坦特·卢·优尔兰 | character | 元素龙王、瑟坦特 | `LOCATION_DRAGON_SECRET_REALM`, `CHARACTER_AINZ_OOAL_GOWN`, `CHARACTER_WHITE_MAGICIAN`, `EVENT_DRAGON_BANQUET`, `EVENT_DRAGON_SANCTUARY_DESTRUCTION` | `人物卡资料集_叙事检索版.md` 龙族调查线索; third-part scene card SC05–SC10; `current_state.md` | 已撤离秘境；其后状态未定 | active_unresolved_entity | APPROVE | 资料支持姓名与称号，但稳定声线证据有限。 |
| 古雷姆林 | character | 格雷姆林、吉雷姆林（团录异写） | `EVENT_ESTATE_BATTLE` | second-part pages 4–5 `posts.md`; third-part page 2 `posts.md`; `work/phase2_discoveries.md` | 已被御临风处决并埋葬；Phantom 身份、与魔法师A的师生关系及其历史影响仍有检索价值 | historical_actor | APPROVE | 不再标为当前存活的未决敌人；异写不应直接转成宽泛 runtime trigger。 |
| 诺斯莉 | character | — | `EVENT_ESTATE_BATTLE` | second-part pages 4–5 `posts.md`; `work/phase2_discoveries.md` | 参与宅邸战设局、协力反击并追击古雷姆林，具有可复用关系节点 | recurring_named_entity | APPROVE | 只保留其实际行动和已建立关系；不是龙族向导。 |
| 奥希拉 | character | 黑龙族长 | `EVENT_DRAGON_BANQUET` | second-part page 15 `posts.md`; `人物卡资料集_叙事检索版.md` 龙族调查线索; `work/phase2_discoveries.md` | 向御临风提供死亡之翼信息，连接黑龙族与战后龙族 | recurring_named_entity | APPROVE | 其信息是角色陈述，不自动等于客观真相。 |
| 肯达·凯·弗格斯 | character | 肯达 | `EVENT_DRAGON_BANQUET` | second-part page 15 `posts.md`; `人物卡资料集_叙事检索版.md` 龙族调查线索; `work/phase2_discoveries.md` | 暗杀线、帝国—龙族牵线和生死状态均未彻底关闭 | active_unresolved_entity | APPROVE | 对其暗杀参与和卡珊德拉合作要保留证据视角与不确定边界。 |
| 卡珊德拉 | character | — | 尚无以其名称命名的正式条目；与白魔、Phantom、大墓地和第三部分交涉线相关 | `妄想大陆设定集_检索版.md` 白色魔法使; `人物卡资料集_叙事检索版.md` 大墓地与暗杀调查; third-part scene card SC06–SC08 | 大墓地使者、暗杀线和预言信息仍可能影响知识边界 | active_unresolved_entity | APPROVE | 不把角色调查笔记中的推断全部提升为事实。 |
| 武赖 | character | — | `EVENT_MAGE_TOWER_MASSACRE` | second-part pages 6–7 `posts.md`; `work/phase2_discoveries.md` | 八柱将之一，其火焰打击直接影响法师塔惨案的破坏和伤亡规模 | recurring_named_entity | APPROVE | 不从八柱将身份或单次行动自动推断长期立场。 |
| 凌迟 | character | 达卡斯 | `FACTION_MAGICAL_BEASTS`, `LOCATION_BORDER_PASS`, `LOCATION_DRIFTING_CONTINENT`, `LOCATION_NINE_SNOW_CLINIC`, `LOCATION_IMPERIAL_CAPITAL`, `CONCEPT_BEAST_TIDE`, `CHARACTER_EMPEROR`, `CHARACTER_OSHUTORU`, `EVENT_FIRST_BEAST_INVASION`, `EVENT_CANYON_BATTLE`, `EVENT_DWARF_SHOP_BREAKOUT`, `EVENT_BORDER_TRUTH`, `EVENT_SPACE_DRAGON_INCIDENT` | `妄想大陆设定集_检索版.md` 魔兽; first-part clue table; canyon/border source posts cited by formal events | 已被处斩，但其伪装、战争与后续计谋是多个历史关系的共同主语 | historical_actor | APPROVE | “达卡斯”是其伪装身份；应作为确认 alias/context，不另造当前角色。 |
| 耶各 | character | 死神耶各、耶格（异写） | `CONCEPT_JERGAL_CURSE`, `CHARACTER_YU_LINFENG`, `CHARACTER_KUON`, `CHARACTER_MU_SHAOAI`, `EVENT_JERGAL_CURSE_TRANSFER` | `extracted-first/27/posts.md`; `extracted-first/28/posts.md`; `人物卡资料集_叙事检索版.md` 耶各代行者资料 | 御临风仍是代行者，契约与知识边界持续有效 | active_unresolved_entity | APPROVE | 信仰资料、角色所知与世界事实必须分层；“耶格”先作为来源异写，不自行扩写。 |
| 露露缇耶 | character | — | `LOCATION_NINE_SNOW_CLINIC`, `CHARACTER_ELDER_XUE`, `CHARACTER_TOLKIEN`, `EVENT_MONSTER_BOX_DISASTER` | `妄想大陆设定集_检索版.md` 露露缇耶; first-part scene card S004、S016; `work/phase2_discoveries.md` | 连接雪老、九雪医馆与达卡斯案 | recurring_named_entity | APPROVE | 独立关系节点超过地点条目的附带提及。 |
| 威廉 | character | 威廉大人 | `CHARACTER_MU_SHAOAI`, `EVENT_PALACE_AUDIENCE`, `EVENT_JERGAL_CURSE_TRANSFER` | `人物卡资料集_叙事检索版.md` 御临风经历; first-part clue table; `work/phase2_discoveries.md` | 参与御临风情感恢复及悠悠/雪老救治 | supporting_entity | APPROVE | 只保留实际参与的医疗与关系事实。 |
| 黄祸龙狼 | character | 黄灾龙狼、黄祸龙郎（来源异写） | `CHARACTER_JIANG_ZIYOU`, `EVENT_CANYON_BATTLE`, `EVENT_SPACE_DRAGON_INCIDENT` | `人物卡资料集_叙事检索版.md` 御临风经历和调查记录; 相关正式角色条目 | 历史战斗与创伤已由现有角色关系承载；当前独立状态不足 | historical_actor | NO_ENTRY_NEEDED | 保留检索备注即可；若未来 Continuation Canon 使其实际重返主线，再重新审计。 |
| 宝石翁 | character | — | `CHARACTER_MU_SHAOAI`, `EVENT_JERGAL_CURSE_TRANSFER` | `extracted-first/27/posts.md`; `extracted-first/28/posts.md`; `work/phase2_discoveries.md` | 诅咒转移条件与仪式的关键知识提供者 | recurring_named_entity | APPROVE | 明确团录支持其介入，但不能因此赋予未展示的全知。 |
| 贞子 | character | — | 御临风人物关系和边关创伤线 | `人物卡资料集_叙事检索版.md` 御临风背景与关系; first-part page 22 `posts.md`（记忆恢复与牺牲经过）; page 24 `posts.md`（御临风确认其死亡） | 已故；其救援、牺牲与御临风恢复记忆后的创伤持续影响人物连续性 | recurring_named_entity | APPROVE | `original_campaign`；当前状态明确为 `deceased`。建立条目或未来 full profile 均不得暗示她仍存活、能够正常行动或必然复活。 |
| 魔法师A | character | A、魔法师Ａ；“巴力西卜”仅为待确认身份映射 | `EVENT_MAGE_TOWER_MASSACRE` | `妄想大陆设定集_检索版.md` 白色魔法使; Phase 1 alias review; `work/phase2_discoveries.md` | 身份映射、稳定称呼与生死/状态仍不足 | recurring_named_entity | HOLD | 裸 ASCII `A` 永远不应成为独立 runtime trigger；待 Campaign 来源进一步确认称呼与身份。 |
| 方镜 | character | — | 无正式条目 | Special Interlude 场景资料; `work/phase2_discoveries.md` | 仅特殊梦境材料，且独立持久信息不足 | supporting_entity | HOLD | 属于 Special Interlude；即使未来收录也不得泄漏到主世界普通触发。 |
| 欧基 | character | — | `EVENT_ESTATE_BATTLE` | `work/phase2_discoveries.md`; second-part pages 4–5 `posts.md` | 缺少独立、耐久的关系或未决状态 | supporting_entity | NO_ENTRY_NEEDED | 继续由已有事件承载即可。 |

Result: 15 `APPROVE`, 2 `HOLD`, 2 `NO_ENTRY_NEEDED`. These are audit decisions, not canonical mutations.

## 3. Proposed Incremental Candidates

The following are proposals only and were not written to the canonical database: 死亡之翼、本多·凯·弗格斯、瑟坦特·卢·优尔兰、古雷姆林、诺斯莉、奥希拉、肯达·凯·弗格斯、卡珊德拉、武赖、凌迟、耶各、露露缇耶、威廉、宝石翁、贞子。

Each requires a later human-reviewed canonical change. In particular, 古雷姆林 is approved as a deceased `historical_actor`, not an active unresolved enemy; 本多 and武赖 use the Campaign spellings; and no proposal should inherit facts merely because another entry mentions it.

## 4. HOLD / NO_ENTRY_NEEDED

HOLD:

- 魔法师A: stable naming, the possible 巴力西卜 identity mapping, and final status remain insufficient. Naked `A` must never be a trigger.
- 方镜: the evidence is Special Interlude-only and does not yet establish enough durable independent value; any later entry must remain layer-isolated.

NO_ENTRY_NEEDED:

- 黄祸龙狼: its current independent state is not established, and the historical action is already carried by `CHARACTER_JIANG_ZIYOU`, `EVENT_CANYON_BATTLE`, and `EVENT_SPACE_DRAGON_INCIDENT`.
- 欧基: its supporting role is sufficiently carried by `EVENT_ESTATE_BATTLE`; the present evidence does not add durable independent runtime value.

## 5. Trigger-Key Audit

Risk meanings: `safe` is distinctive enough for normal matching; `contextual` is legitimate but should be gated by exactness or companion context; `overbroad` is likely to fire on unrelated prose. Recommendations are runtime behavior only and do not change canonical `keys` or `aliases`.

| # | entry | key | risk | recommendation | reason |
|---:|---|---|---|---|---|
| 1 | 妄想大陆 | 妄想大陆 | safe | primary_key | Unique world name. |
| 2 | 兄弟会 | 兄弟会 | contextual | primary_key; exact_or_strict_match | Common organizational noun outside campaign context. |
| 3 | 八柱将 | 八柱将 | safe | primary_key | Distinctive faction title. |
| 4 | 娜迦 | 娜迦 | contextual | primary_key; exact_or_strict_match | Species/faction word can occur generically. |
| 5 | 娜迦 | 娜迦族 | safe | secondary_key | More specific confirmed alias. |
| 6 | 帝国 | 帝国 | contextual | primary_key; exact_or_strict_match; require_companion_key | Very common polity noun; prefer a campaign entity/person/location companion. |
| 7 | 游击士协会 | 游击士协会 | safe | primary_key | Distinct organization name. |
| 8 | 纳萨力克地下大坟墓 | 纳萨力克地下大坟墓 | safe | primary_key | Unique full name. |
| 9 | 纳萨力克地下大坟墓 | 纳萨力克 | safe | secondary_key | Distinct short name. |
| 10 | 魔兽 | 魔兽 | contextual | primary_key; exact_or_strict_match; require_companion_key | High-frequency species/group term. |
| 11 | 龙族 | 龙族 | contextual | primary_key; exact_or_strict_match; require_companion_key | High-frequency species/group term. |
| 12 | 九雪医馆 | 九雪医馆 | safe | primary_key | Unique place name. |
| 13 | 妄想山脉 | 妄想山脉 | safe | primary_key | Unique place name. |
| 14 | 帝都 | 帝都 | contextual | primary_key; exact_or_strict_match | Common capital label. |
| 15 | 无法地带 | 无法地带 | contextual | primary_key; exact_or_strict_match | Generic descriptive phrase. |
| 16 | 监狱塔 | 监狱塔 | contextual | primary_key; exact_or_strict_match | Generic place label. |
| 17 | 神秘海域 | 神秘海域 | contextual | primary_key; exact_or_strict_match | Descriptive phrase; also Special Interlude isolation sensitive. |
| 18 | 边境关卡 | 边境关卡 | contextual | primary_key; exact_or_strict_match | Generic location phrase. |
| 19 | 飘零大陆 | 飘零大陆 | safe | primary_key | Unique continent name. |
| 20 | 龙族秘境 | 龙族秘境 | safe | primary_key | Specific full place name. |
| 21 | 龙族秘境 | 秘境 | overbroad | disable_as_trigger | Generic word; retain as canonical alias only. |
| 22 | 假面 | 假面 | overbroad | contextual_key; require_companion_key | Generic object/type word. |
| 23 | 假面 | アクルカ | safe | secondary_key | Distinct confirmed term. |
| 24 | 厌魔石 | 厌魔石 | safe | primary_key | Specific concept name. |
| 25 | 腰带 | 腰带（ドライバー） | contextual | primary_key; exact_or_strict_match | Parenthetical full form is usable but still object-like. |
| 26 | 腰带 | ドライバー | contextual | secondary_key; exact_or_strict_match | Generic Japanese word outside campaign context. |
| 27 | 魔兽之潮 | 魔兽之潮 | safe | primary_key | Exact campaign concept; must not fuzzy-match 魔物之潮. |
| 28 | 魔物 | 魔物 | overbroad | exact_or_strict_match; require_companion_key | Generic category word and prefix of unrelated names. |
| 29 | 魔物之潮 | 魔物之潮 | safe | primary_key | Exact concept; distinct from 魔兽之潮. |
| 30 | 魔物之盒 | 魔物之盒 | safe | primary_key | Specific concept name; must not substring-merge with 魔物. |
| 31 | 魔物之盒 | 魔盒 | contextual | secondary_key; exact_or_strict_match | Short but confirmed alias. |
| 32 | 耶各诅咒 | 耶各诅咒 | safe | primary_key | Specific named curse. |
| 33 | 耶各诅咒 | 耶各的诅咒 | safe | secondary_key | Specific confirmed variant. |
| 34 | 卡西乌斯·布莱特 | 卡西乌斯·布莱特 | safe | primary_key | Unique full name. |
| 35 | 卡西乌斯·布莱特 | 布莱特 | contextual | secondary_key; exact_or_strict_match | Confirmed surname/short form but potentially shared. |
| 36 | 帝 | 帝 | overbroad | exact_or_strict_match | Single CJK character; never substring-match and never activate inside 帝国/帝都. |
| 37 | 御临风 | 御临风 | safe | primary_key | Unique full name. |
| 38 | 悠悠 | 悠悠 | contextual | primary_key; exact_or_strict_match | Common word/name; phase-specific identity context matters. |
| 39 | 悠悠 | 芬尔德·特兰希尔 | safe | secondary_key | Distinct confirmed stage name. |
| 40 | 悠悠 | 芬尔德·琳·特兰希尔 | safe | secondary_key | Distinct confirmed stage name; do not normalize away the middle component. |
| 41 | 哈克 | 哈克 | contextual | primary_key; exact_or_strict_match | Short transliterated name. |
| 42 | 安兹·乌尔·恭 | 安兹·乌尔·恭 | safe | primary_key | Unique full name. |
| 43 | 安兹·乌尔·恭 | Ainz Ooal Gown | safe | secondary_key | Unique confirmed Latin form. |
| 44 | 安兹·乌尔·恭 | アインズ·ウール·ゴウン | safe | secondary_key | Unique confirmed Japanese form. |
| 45 | 白色魔法使 | 白色魔法使 | safe | primary_key | Specific title. |
| 46 | 白色魔法使 | 白魔 | contextual | secondary_key; exact_or_strict_match | Confirmed short title but can be a genre abbreviation. |
| 47 | 白色魔法使 | 笛木奏 | safe | secondary_key | Campaign-confirmed self-introduction. |
| 48 | 艾利 | 艾利 | contextual | primary_key; exact_or_strict_match | Short transliterated name. |
| 49 | 谏山黄泉 | 谏山黄泉 | safe | primary_key | Unique full name. |
| 50 | 谏山黄泉 | 黄泉 | contextual | secondary_key; exact_or_strict_match | Common cosmological noun as well as confirmed short name. |
| 51 | 谢尔伦·冯·吉尔科德 | 谢尔伦·冯·吉尔科德 | safe | primary_key | Unique full name. |
| 52 | 谢尔伦·冯·吉尔科德 | 谢尔伦 | safe | secondary_key | Distinct confirmed short name in this corpus. |
| 53 | 雪老 | 雪老 | safe | primary_key | Stable honorific/name combination. |
| 54 | 久远 | 久远 | contextual | primary_key; exact_or_strict_match | Ordinary Chinese word as well as a name. |
| 55 | 任帆真 | 任帆真 | safe | primary_key | Unique full name. |
| 56 | 奥修特尔 | 奥修特尔 | safe | primary_key | Unique full name. |
| 57 | 奥修特尔 | 右近 | contextual | secondary_key; exact_or_strict_match | Confirmed identity form but short and potentially ambiguous. |
| 58 | 周正 | 周正 | contextual | primary_key; exact_or_strict_match | Full name can also appear as an adjective phrase. |
| 59 | 姜子尤 | 姜子尤 | safe | primary_key | Unique full name. |
| 60 | 慕少艾 | 慕少艾 | safe | primary_key | Unique full name. |
| 61 | 托尔金 | 托尔金 | contextual | primary_key; exact_or_strict_match | Stable character name but also an external proper name; campaign context required. |
| 62 | 沃西斯 | 沃西斯 | safe | primary_key | Distinct name. |
| 63 | 沐透 | 沐透 | safe | primary_key | Distinct name. |
| 64 | 雷光 | 雷光 | contextual | primary_key; exact_or_strict_match | Ordinary descriptive compound as well as a name. |
| 65 | 第一次魔兽大侵攻 | 第一次魔兽大侵攻 | safe | primary_key | Specific event title. |
| 66 | 峡谷战 | 峡谷战 | contextual | primary_key; exact_or_strict_match | Short generic battle label. |
| 67 | 矮人铺突围 | 矮人铺突围 | safe | primary_key | Specific event phrase. |
| 68 | 边关真相 | 边关真相 | contextual | primary_key; exact_or_strict_match | Chapter-like phrase; require exact title use. |
| 69 | 神秘海域，德雷克的宝藏 | 神秘海域，德雷克的宝藏 | safe | primary_key | Unique full event title. |
| 70 | 神秘海域，德雷克的宝藏 | 德雷克的宝藏 | contextual | secondary_key; exact_or_strict_match | Specific but can occur without dream context; enforce layer isolation. |
| 71 | 空间龙事件 | 空间龙事件 | safe | primary_key | Specific campaign event label. |
| 72 | 皇宫朝见 | 皇宫朝见 | contextual | primary_key; exact_or_strict_match | Generic court-event phrase. |
| 73 | 耶各诅咒转移 | 耶各诅咒转移 | safe | primary_key | Specific event title. |
| 74 | 魔物之盒灾变 | 魔物之盒灾变 | safe | primary_key | Specific event title. |
| 75 | 魔物之盒灾变 | 魔盒灾变 | contextual | secondary_key; exact_or_strict_match | Confirmed shorthand; avoid generic 魔盒 matches. |
| 76 | 宅邸战 | 宅邸战 | contextual | primary_key; exact_or_strict_match; require_companion_key | Generic battle label; pair with involved entity/location. |
| 77 | 法师塔惨案 | 法师塔惨案 | safe | primary_key | Specific event title. |
| 78 | 边关攻防 | 边关攻防 | contextual | primary_key; exact_or_strict_match | Generic campaign-stage phrase. |
| 79 | 龙族宴会 | 龙族宴会 | safe | primary_key | Specific event title. |
| 80 | 龙族撤离 | 龙族撤离 | contextual | primary_key; exact_or_strict_match | Could describe multiple moments; use exact event title. |
| 81 | 死亡之翼之战 | 死亡之翼之战 | safe | primary_key | Specific event title. |
| 82 | 死亡之翼之战 | 死亡之翼讨伐 | safe | secondary_key | Confirmed merged source title. |
| 83 | 现代灵异梦境开端 | 现代灵异梦境开端 | safe | primary_key | Unique event title; runtime must retain special-interlude layer. |
| 84 | 龙族秘境毁灭 | 龙族秘境毁灭 | safe | primary_key | Specific transition event title. |

Key findings:

- `帝` must use whole-key/exact boundary matching. It must not fire inside `帝国`, `帝都`, or unrelated words.
- `秘境` should be disabled as a standalone trigger while remaining a canonical alias. `龙族秘境` stays the primary runtime key.
- Runtime matching must never use substring/fuzzy collapse among `魔物`, `魔物之盒`, `魔物之潮`, and `魔兽之潮`.
- Special Interlude keys require layer-aware retrieval so `神秘海域` and `现代灵异梦境开端` do not inject dream-only locations, characters, or lore into ordinary main-world context.

## 6. NPC RP Fidelity Audit

The machine-readable audit is `work/phase2_5_runtime_roles.jsonl`. It contains all 21 formal `character` entries plus all 15 referential discoveries marked `APPROVE` above, for 36 records total.

Dimensions are independent `low` / `medium` / `high` observations, not an overall score or rank:

- `existing_relationship_depth_with_yulinfeng`: density and continuity sensitivity of the established relationship.
- `world_agency`: demonstrated capacity to initiate durable world actions.
- `knowledge_boundary_complexity`: need to distinguish public facts, private knowledge, beliefs, suspicions, and ignorance.
- `voice_distinctiveness`: amount of source-supported speech/behavior differentiation needed to avoid flattening.
- `unresolved_hook_density`: number of already recorded unresolved states attached to the character.
- `continuity_sensitivity`: risk of contradicting established history, identity, or state when roleplayed.

`profile_depth` is a runtime information requirement, not future importance: `full` for characters whose active portrayal needs detailed continuity/knowledge/voice controls, `compact` for bounded supporting portrayals, and `minimal` where current worldbook facts suffice. `activation_policy` keeps profile loading scene-bound. `knowledge_partition=true` means a future profile should explicitly distinguish at least some of: knows, believes, suspects, does not know, and secrets.

The formal character `御临风` is included because the request covers every formal character entry, but the machine record explicitly marks him as a player/time-line anchor who should not be autonomously performed as an NPC.

| name | existing_relationship_depth_with_yulinfeng | world_agency | knowledge_boundary_complexity | voice_distinctiveness | unresolved_hook_density | continuity_sensitivity | profile_depth | activation_policy | knowledge_partition | reasoning_summary |
|---|---|---|---|---|---|---|---|---|---:|---|
| 卡西乌斯·布莱特 | high | medium | medium | high | medium | high | full | full_when_active | true | Early companion, protector, and departure history require relationship and voice continuity. |
| 帝 | medium | high | high | high | high | high | full | full_when_active | true | Public decisions, rumors, authority, and undisclosed knowledge must remain separated. |
| 御临风 | high | high | high | high | high | high | full | full_when_active | true | Player/time-line anchor; complete continuity is needed for host reference, but autonomous NPC control is inappropriate. |
| 悠悠 | high | medium | medium | high | high | high | full | full_when_active | true | Deep relationship, staged names, curse history, and space-dragon knowledge make flattening risky. |
| 哈克 | medium | medium | high | high | high | high | full | full_when_active | true | Outward manner, judgment, identity, and actual knowledge cannot be collapsed into one generic persona. |
| 安兹·乌尔·恭 | medium | high | high | high | high | high | full | full_when_active | true | High agency and layered knowledge require Campaign-only portrayal and strong leakage controls. |
| 白色魔法使 | high | high | high | high | high | high | full | full_when_active | true | Claims, actions, concealed knowledge, motives, and unresolved relations must stay partitioned. |
| 艾利 | medium | medium | medium | medium | low | medium | compact | compact_when_supporting | false | A bounded support profile can carry her profession, relationships, and demonstrated support behavior. |
| 谏山黄泉 | high | medium | medium | high | medium | high | full | full_when_active | true | Shared history and departure state make relationship and voice errors conspicuous. |
| 谢尔伦·冯·吉尔科德 | high | high | high | high | high | high | full | full_when_active | true | Dragon authority, friendship with帝, diplomacy, and war testimony require full context when active. |
| 雪老 | high | medium | high | high | medium | high | full | full_when_active | true | Brotherhood history, family trauma, medicine, and player relationship require partitioned continuity. |
| 久远 | medium | medium | medium | high | medium | medium | compact | compact_when_supporting | true | Pharmacist identity, Haku relation, and support actions need a compact but distinct portrayal. |
| 任帆真 | low | medium | high | medium | high | medium | compact | compact_when_supporting | true | Mage-tower and magic-eye knowledge is bounded and prone to leakage. |
| 奥修特尔 | high | high | high | high | medium | high | full | full_when_active | true | Right General/右近 identity layers and established loyalty require scene-specific knowledge boundaries. |
| 周正 | medium | medium | high | high | high | medium | compact | compact_when_supporting | true | Technical knowledge and anomalous experience must not become common party knowledge. |
| 姜子尤 | high | medium | low | high | low | high | full | full_when_active | false | Life-and-death history and unusually distinct delivery make RP errors highly visible. |
| 慕少艾 | medium | medium | high | high | high | high | full | full_when_active | true | Medical, curse, and otherworld knowledge must distinguish fact, interpretation, and unknown. |
| 托尔金 | medium | low | medium | medium | low | medium | minimal | worldbook_until_promoted | false | Existing durable facts currently fit worldbook-level use; no deeper profile is justified yet. |
| 沃西斯 | medium | high | high | high | high | high | full | full_when_active | true | Political identity, plans, and unevenly distributed information create strong secrecy requirements. |
| 沐透 | low | medium | medium | high | medium | medium | compact | compact_when_supporting | true | Values and motivation need profile treatment while historical actions remain in the worldbook. |
| 雷光 | low | high | high | high | medium | medium | compact | compact_when_supporting | true | Military decisions need bounded operational knowledge without injecting narrator-level information. |
| 死亡之翼 | high | high | high | medium | high | high | full | full_when_active | true | Hostility, incomplete defeat, immortality questions, and old-god links demand strict status and knowledge control. |
| 本多·凯·弗格斯 | medium | high | high | medium | high | high | compact | compact_when_supporting | true | Dragon-king duty, family relation, and sanctuary evacuation are durable but current voice evidence is limited. |
| 瑟坦特·卢·优尔兰 | low | high | medium | low | medium | medium | minimal | worldbook_until_promoted | true | The title/name and actions are supported, but current sources do not justify a detailed stable voice. |
| 古雷姆林 | high | medium | high | high | low | high | compact | compact_when_supporting | true | Deceased historical antagonist; a compact record preserves the prior conflict, Phantom identity, and A relationship without treating him as active. |
| 诺斯莉 | medium | medium | medium | high | medium | high | compact | compact_when_supporting | false | Her宅邸战 planning, aid, and pursuit establish a distinct supporting relationship. |
| 奥希拉 | medium | high | medium | medium | medium | medium | compact | compact_when_supporting | true | The black-dragon leadership role and information given to御临风 require attributed knowledge. |
| 肯达·凯·弗格斯 | low | medium | high | high | high | high | full | full_when_active | true | Liaison role, assassination allegations, Cassandra link, and uncertain status require careful partitioning. |
| 卡珊德拉 | medium | high | high | high | high | high | full | full_when_active | true | Phantom, tomb envoy, prophecy, and assassination evidence have different authority levels. |
| 武赖 | low | high | medium | high | medium | high | compact | compact_when_supporting | true | A named Eight General whose fire attack materially affected the mage-tower disaster; broader stance is not established. |
| 凌迟 | high | high | high | high | low | high | compact | compact_when_supporting | true | Deceased historical actor; the Dakas disguise and war plans require identity and historical knowledge separation. |
| 耶各 | high | high | high | medium | high | high | full | full_when_active | true | Deity, contract subject, role knowledge, and curse mechanism must not be collapsed into one omniscient record. |
| 露露缇耶 | medium | low | medium | medium | medium | high | compact | compact_when_supporting | true | She is a durable relationship node linking雪老, 九雪医馆, and the Dakas case. |
| 威廉 | medium | medium | high | medium | medium | medium | compact | compact_when_supporting | true | Healing and emotional-recovery participation require source-bounded knowledge. |
| 宝石翁 | medium | high | high | medium | medium | high | compact | compact_when_supporting | true | The curse-transfer expertise is explicit, but it does not justify general omniscience. |
| 贞子 | high | low | medium | medium | high | high | full | full_when_active | true | Deceased after sacrificing herself so御临风 could survive; full detail is for source-faithful historical or recollection context only and does not imply survival, resurrection, dream appearance, or future plot status. |

## 7. Dynamic Promotion Rules

Profile depth changes only after new events have actually occurred and been recorded as Continuation Canon. No character is promoted because of title, power, fame, model interest, perceived dramatic potential, or a forecast about future scenes.

1. Re-audit a `minimal` profile only when new cited Continuation Canon establishes at least one durable item not already represented by the worldbook: a repeated direct relationship, a private goal, a consequential decision role, a stable voice pattern, a new faction-representation duty, or a knowledge boundary that materially affected an event.
2. Move `minimal` to `compact` only when the new record supplies enough concrete evidence to state the new item without inference.
3. Move `compact` to `full` only when multiple fidelity dimensions become source-supported and an abbreviated profile would create a demonstrated continuity or knowledge-leakage risk.
4. Profile depth and activation are independent. A `full` profile loads only when that character is actively present or directly controlling the scene; a supporting character loads `compact`; otherwise the worldbook entry is sufficient.
5. Every promotion must cite the new session/post/state source. Rumor, belief, lies, and unresolved inference remain labeled rather than converted to fact.
6. When knowledge complexity becomes material, add explicit partitions for `knows`, `believes`, `suspects`, `does_not_know`, and `secrets` as supported. Do not give information to the character merely because it exists elsewhere in the worldbook.
7. Special Interlude experience cannot promote or modify a main-world profile unless the campaign record explicitly carries the memory, reward, item, ability, or consequence back.
8. A profile may be reduced only through a separate human review showing that the deeper material is duplicated, unsupported, or no longer needed for correct portrayal; historical facts themselves remain preserved.

## 8. Character / Worldbook Boundary

No canonical edits are made here. These phrases are flagged for later human editing because they function more like portrayal instructions, evaluations, or inner-value summaries than durable world facts.

| character | profile-like phrase or pattern in current entry | boundary recommendation |
|---|---|---|
| 艾利 | “人物资料将她描述为细心、善良且可靠” | Move this evaluative personality summary to a compact profile. Keep profession, durable relationships, and consequential support actions in the worldbook. |
| 哈克 | “外表散漫、厌恶麻烦，却表现出突出的智谋与指挥能力” | Put the outward manner and dislike of trouble in the profile. Keep demonstrated command role and consequential decisions as worldbook history. |
| 姜子尤 | “其言行常带荒诞喜剧色彩” | Treat comedic delivery as voice guidance in a full profile. Keep identity, relationship, actions, and lasting consequences in the worldbook. |
| 久远 | “年轻而可靠的药师” | Keep “药师” and the established relationships/actions in the worldbook; move “可靠” to the compact profile unless tied to a concrete event. |
| 沐透 | “以成为他人的希望为行动方向” | Treat the value/goal formulation as profile material. The worldbook should retain only attributed commitments and consequential actions supported by sources. |
| 白色魔法使 | “公开声称核心目标与家人存活和创造理想乡有关” | Keep the attributed public claim in the worldbook because it drives current world state; mirror it in a partitioned profile and do not rewrite it as verified inner motive. |

## 9. Runtime Risks

### Context overload

Loading 64 entries plus 36 full/compact role records at once would obscure scene-local facts. Use entity-triggered retrieval, load only active full profiles, compact supporting profiles, and leave inactive characters at worldbook depth. Event entries should load only when the current scene refers to that historical event or its consequence.

### Personality bleed

Ensemble scenes can blend high-distinctiveness characters into a shared voice. Keep each active character's voice cues and decision constraints in its own record; never combine several characters into one generic “party personality” prompt.

### Knowledge leakage

The highest-risk partitions include 帝, 白色魔法使, 安兹, 悠悠, 沃西斯, 奥修特尔/右近, 雷光, 卡珊德拉, 肯达, 耶各, and死亡之翼. Retrieval must not expose narrator/worldbook knowledge as what an NPC knows. Special Interlude-only facts require a separate layer gate.

### Overactivation

The principal risks are `帝`, `秘境`, `假面`, `魔物`, `帝国`, `帝都`, `龙族`, `魔兽`, `悠悠`, `久远`, `黄泉`, and other short/common terms. Apply the exact, companion-key, or disabled-trigger recommendations in the 84-key table. Do not use substring or similarity activation.

### Group turn-taking syndrome

Dragon banquets, imperial councils, military briefings, and ensemble battles can cause a runtime to give every loaded name a line. Activate only current speakers and decision owners; other present characters may remain compact/background. Presence does not require a turn, and silence must not be treated as absence or disagreement.

### Trigger breadth and layer collision

Concept/faction keys can pull broad lore into a narrow dialogue, while dream keys can inject Special Interlude material into the main world. Cap co-activated entries, prefer the most specific full key, and apply canon-layer filtering before content reaches roleplay context.

## 10. Human Decisions Required

1. Approve, revise, or reject the 15 proposed referential entries. Approval here should begin a new reviewed canonical-change phase; this audit is not authorization to mutate the database.
2. Decide whether `黄祸龙狼` remains event/relationship-only or is promoted after new primary evidence demonstrates independent current relevance.
3. Resolve `魔法师A` identity and stable naming from Campaign sources. Do not permit naked `A` as a trigger under any outcome.
4. Decide whether `方镜` has enough durable Special Interlude value for a layer-isolated entry.
5. Approve runtime matcher support for whole-key CJK boundaries, companion-key gating, canonical aliases that are disabled as triggers, and canon-layer filtering.
6. Approve or revise the 36 initial profile-depth assignments. Proposed `full`: 卡西乌斯·布莱特、帝、御临风、悠悠、哈克、安兹·乌尔·恭、白色魔法使、谏山黄泉、谢尔伦·冯·吉尔科德、雪老、奥修特尔、姜子尤、慕少艾、沃西斯、死亡之翼、肯达·凯·弗格斯、卡珊德拉、耶各、贞子. Proposed `compact`: 艾利、久远、任帆真、周正、沐透、雷光、本多·凯·弗格斯、古雷姆林、诺斯莉、奥希拉、武赖、凌迟、露露缇耶、威廉、宝石翁. Proposed `minimal`: 托尔金、瑟坦特·卢·优尔兰. These are fidelity requirements, not a cast ranking.
7. Approve or revise every trigger downgrade in the 84-key table. The explicit disable proposal is `秘境`; strict/companion gating is required for the overbroad `帝`, `假面`, and `魔物`, plus the contextual keys identified in the table. No canonical alias is deleted.
8. Decide whether the six flagged character phrases should move to future RP profiles while preserving any world-state-bearing, attributed claims.
9. Confirm whether player character `御临风` should have a host-facing continuity profile only, with autonomous NPC speech/action disabled.

## Appendix A. Machine-readable output contract

`work/phase2_5_runtime_roles.jsonl` has one JSON object per line and these fields only:

`name`, `worldbook_id`, `existing_relationship_depth_with_yulinfeng`, `world_agency`, `knowledge_boundary_complexity`, `voice_distinctiveness`, `unresolved_hook_density`, `continuity_sensitivity`, `profile_depth`, `activation_policy`, `knowledge_partition`, `evidence`, `notes`.

Allowed values used here:

- fidelity dimensions: `low`, `medium`, `high`
- `profile_depth`: `minimal`, `compact`, `full`
- `activation_policy`: `worldbook_until_promoted`, `compact_when_supporting`, `full_when_active`
- `knowledge_partition`: boolean

No future-importance, future-frequency, future-plot-role, priority-score, rank, or tier field is present.

## Appendix B. Audit conclusion

The canonical database is structurally usable but not yet runtime-safe without trigger boundaries, layer gating, knowledge partitioning, and scene-scoped profile activation. Referentially, 15 named entities merit a future human-reviewed entry proposal; two remain on hold; two are adequately carried by existing records. These findings do not modify Canon.
