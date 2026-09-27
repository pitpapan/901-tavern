# Phase 2 Canonical Worldbook Review

## Outcome

Phase 2 已按 Batch 01 → Batch 07 顺序完成。正式 canonical source 为 `output/worldbook_source.jsonl`，共 64 条。每批均先验证 batch 文件，再验证临时合并库，验证通过后才原子替换正式文件。

## Frozen-candidate accounting

- Frozen candidates: 91
- `pending` non-event / `approved` candidates requiring Phase 2 disposition: 70
- Generated formal entries: 64
- HOLD: 6
- Phase 1 review dispositions not generated: 15 rejected, 4 merged, 2 deferred
- Approved events in frozen pool: 17
- Events generated: 17
- Rejected, merged-source or deferred events generated: 0

HOLD 项目：

- 尸体城堡：只有事件容器信息，缺少独立持久地点定义。
- 法师塔：地点知识不足；惨案事实由事件条目承载。
- 皇宫：地点知识不足；朝见事实由事件条目承载。
- 死亡秩序：导航主题短语，不足以确认为独立世界机制。
- 方镜：未完成梦境只提供异常线索，稳定身份与知识来源未确认。
- 右近：来源确认其与奥修特尔为同一人物，因此不独立生成；`右近` 保留为奥修特尔的确认 alias。

## Entry statistics

### Type

| type | count |
|---|---:|
| world | 1 |
| faction | 8 |
| location | 9 |
| character | 21 |
| concept | 8 |
| event | 17 |
| **total** | **64** |

### Canon layer

| canon_layer | count |
|---|---:|
| original_campaign | 58 |
| transition | 1 |
| continuation | 0 |
| special_interlude | 5 |

Special Interlude 条目为：神秘海域、任帆真、周正、神秘海域，德雷克的宝藏、现代灵异梦境开端。Transition 条目仅为龙族秘境毁灭。

### Canon status

| canon_status | count |
|---|---:|
| confirmed | 64 |
| uncertain | 0 |
| rumor | 0 |
| character_belief | 0 |

未生成以非确认内容为核心的条目。来源中的推测、传闻、角色判断和未完成线索被省略、限定在 notes，或保持 HOLD；这不表示所有世界谜团已经解决。

## Conflicts and uncertainty

- 会改变 Canon 的来源语义冲突：0。
- Cross-type 或 duplicate 阻断：0。
- 未解决的事实被保留为未解决问题，没有静默调和。
- 死亡之翼之战只确认本轮肉身被击败，不确认永久死亡。
- 龙族秘境毁灭只使用批准的最小 Transition Canon，不伪造原团未演出的崩坏与撤离细节。
- 现代灵异梦境保持未完成的 `special_interlude`，其专属人物、地点和规则没有泄漏到普通主世界层。

## Discoveries

冻结池外潜在候选共 9 项，全部只记录在 `work/phase2_discoveries.md`，没有加入正式世界书：古雷姆林、死亡之翼、赤炎龙王、元素龙王、诺斯莉、奥希拉、肯达·凯·弗格斯、卡珊德拉、武赖。

## Event coverage boundary

冻结池中的 17 个 approved event 已全部生成，重大结论均尽可能回到 `posts.md` / 原始记录核验。`901第二部分_16-25页` 与 `901第三部分` 仍缺少同级事件台账或剧情分段目录，因此全局 event coverage 继续标记为 unresolved；本阶段不声称已经覆盖所有潜在事件。

## Validation and deterministic output

- Batch 01: 9 records, 0 errors, 0 warnings
- Batch 02: 9 records, 0 errors, 0 warnings
- Batch 03: 8 records, 0 errors, 0 warnings
- Batch 04: 11 records, 0 errors, 0 warnings
- Batch 05: 10 records, 0 errors, 0 warnings
- Batch 06: 9 records, 0 errors, 0 warnings
- Batch 07: 8 records, 0 errors, 0 warnings
- Final formal source: 64 records, 0 errors, 0 warnings
- Full unit test suite: 12 tests passed
- Rebuild from Batch 01–07: byte-identical to formal source
- Formal source SHA-256: `07878B8E7A3998367B3E4A918DDA2D2B00C38D4213F99A374706A9A5905E53C7`

## Frozen-input integrity

Phase 2 开始前与完成后的 SHA-256 完全一致：

| frozen input | SHA-256 |
|---|---|
| `work/candidates.jsonl` | `6B3035D43D217EB1EE45D444AB28422D2B32E9F5CF4D709924E00976EF998878` |
| `work/candidate_report.md` | `F4CC15B27D3862C02EE9A61C2EB9F358D04283F45758D12B0FECC8D1444270DF` |
| `config/review_decisions.json` | `95FB03A7A2AD80D340774CDAAE4B7A0DF63D82FD78822440A93E42979627145B` |
| `config/alias_evidence.json` | `3C60943B26BB3BD7DB5C87323EB0D57629F12A5C27C40238F65D225AD2F46F49` |
| `config/manual_candidates.json` | `E23C141E03BCEAB2CB8679604CB6CC9693FF281EA7DE93E252C95C5963DCB7D0` |
| `schema/worldbook_entry.schema.json` | `C9F68B54081EC29EA03EC7559968C2B9D8428E66C67DAAC09C9F00C5DEA11579` |
| `current_state.md` | `95ADABA5591F088BF24BB465E4FD81C5D77A78A3C5A7447F3C116EB051CD5C59` |

没有生成 SillyTavern export、Character Card、RAG/vector DB、导演提示词或后续剧情。
