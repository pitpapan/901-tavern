# Phase 2.6 Trigger Delta Audit

This audit covers only the 15 newly approved canonical entries and the five existing entries whose prose received boundary cleanup. It is a runtime recommendation record, not a SillyTavern configuration, and it does not remove canonical aliases or keys.

Risk meanings:

- `safe`: distinctive enough for ordinary exact entity matching.
- `contextual`: valid but liable to collide with a title, common name, or spelling variant; use the stated boundary or companion rule.
- `overbroad`: unsuitable for ordinary activation without disabling or strong gating.

## New-entry keys

| entry | key | risk | recommendation | reason |
|---|---|---|---|---|
| 死亡之翼 | 死亡之翼 | safe | primary_key | Distinct Campaign entity name. |
| 本多·凯·弗格斯 | 本多·凯·弗格斯 | safe | primary_key | Unique full name. |
| 本多·凯·弗格斯 | 赤炎龙王 | safe | secondary_key | Confirmed, specific dragon-king title. |
| 本多·凯·弗格斯 | 本多 | contextual | secondary_key; exact_or_strict_match | Confirmed short form, but a surname/short name can collide outside the entity context. |
| 瑟坦特·卢·优尔兰 | 瑟坦特·卢·优尔兰 | safe | primary_key | Unique full name. |
| 瑟坦特·卢·优尔兰 | 元素龙王 | contextual | secondary_key; exact_or_strict_match | Confirmed title, but title-like rather than a unique personal form. |
| 瑟坦特·卢·优尔兰 | 瑟坦特 | safe | secondary_key | Distinct confirmed short name. |
| 古雷姆林 | 古雷姆林 | safe | primary_key | Stable canonical name. |
| 古雷姆林 | 格雷姆林 | contextual | secondary_key; exact_or_strict_match | Confirmed source spelling variant; strict matching avoids generic transliteration drift. |
| 古雷姆林 | 吉雷姆林 | contextual | secondary_key; exact_or_strict_match | Confirmed source spelling variant; strict matching avoids generic transliteration drift. |
| 诺斯莉 | 诺斯莉 | safe | primary_key | Distinct personal name. |
| 奥希拉 | 奥希拉 | safe | primary_key | Distinct personal name. |
| 奥希拉 | 黑龙族长 | contextual | contextual_key; exact_or_strict_match; require_companion_key | Office/title may refer to succession or another historical holder; prefer 奥希拉 or dragon-banquet context. |
| 肯达·凯·弗格斯 | 肯达·凯·弗格斯 | safe | primary_key | Unique full name. |
| 肯达·凯·弗格斯 | 肯达 | safe | secondary_key | Distinct confirmed short name in this corpus. |
| 卡珊德拉 | 卡珊德拉 | safe | primary_key | Distinct personal name in the Campaign corpus. |
| 武赖 | 武赖 | safe | primary_key | Distinct personal name. |
| 凌迟 | 凌迟 | contextual | primary_key; exact_or_strict_match | Confirmed name but also an ordinary punishment term in Chinese. |
| 凌迟 | 达卡斯 | safe | secondary_key | Confirmed disguise identity; exact alias relation is reviewed. |
| 耶各 | 耶各 | safe | primary_key | Stable Campaign spelling tied to the curse and entity. |
| 耶各 | 死神耶各 | safe | secondary_key | Specific confirmed attributed form. |
| 耶各 | 耶格 | contextual | secondary_key; exact_or_strict_match | Confirmed orthographic variant; strict matching prevents speculative normalization. |
| 露露缇耶 | 露露缇耶 | safe | primary_key | Distinct personal name. |
| 威廉 | 威廉 | contextual | primary_key; exact_or_strict_match; require_companion_key | Common personal name; prefer companion context such as御临风、诅咒转移或酒屋. |
| 威廉 | 威廉大人 | contextual | secondary_key; exact_or_strict_match | Honorific form remains common enough to require exact matching. |
| 宝石翁 | 宝石翁 | safe | primary_key | Distinctive Campaign title. |
| 贞子 | 贞子 | contextual | primary_key; exact_or_strict_match | Stable Campaign name but shared with external/general references; require an exact name boundary. |

No new key is classified `overbroad`. No bare ASCII `A` key was introduced.

## Cleanup-entry keys

The cleanup changed only `content`; names, aliases, and keys are byte-for-byte unchanged from the previous canonical entries.

| entry | key | risk | recommendation | delta |
|---|---|---|---|---|
| 艾利 | 艾利 | contextual | primary_key; exact_or_strict_match | No key change; personality evaluation removed from content. |
| 哈克 | 哈克 | contextual | primary_key; exact_or_strict_match | No key change; profile-like manner description removed. |
| 姜子尤 | 姜子尤 | safe | primary_key | No key change; comedic-style evaluation removed. |
| 久远 | 久远 | contextual | primary_key; exact_or_strict_match | No key change; “可靠” evaluation removed. |
| 沐透 | 沐透 | safe | primary_key | No key change; abstract value-direction summary removed. |

`CHARACTER_WHITE_MAGICIAN` was checked but not modified. Its statement about family survival and an ideal world remains explicitly attributed as a public claim; it is not rewritten as a confirmed inner motive. Its Phase 2.5 trigger recommendations remain unchanged.

## Delta checks

- New keys: 27.
- Total canonical keys after patch: 111.
- Exact cross-entry key conflicts: 0.
- HOLD entity `魔法师A` was not added, and bare `A` is absent.
- No alias was deleted from an existing canonical entry.
