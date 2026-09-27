#!/usr/bin/env python3
"""Extract deterministic, human-reviewable worldbook candidates from campaign references."""

from __future__ import annotations

import argparse
import difflib
import json
import os
import re
import sys
import tempfile
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


SETTING_NAME = "妄想大陆设定集_检索版.md"
CHARACTER_NAMES = ("人物卡资料集_检索版.md", "人物卡资料集_叙事检索版.md")
SCENE_NAME = "00_顺读场景卡.md"
INDEX_NAME = "01_角色与主题线索表.md"
LEDGER_NAME = "02_源记录事件台账.md"
PLOT_NAME = "03_剧情分段目录.md"
KNOWN_NAMES = (SETTING_NAME, *CHARACTER_NAMES, SCENE_NAME, INDEX_NAME, LEDGER_NAME, PLOT_NAME)
TYPE_ORDER = {name: index for index, name in enumerate(("world", "faction", "location", "character", "concept", "event"))}
LOCATION_HINTS = ("大陆", "山脉", "地带", "地区", "城市", "城", "村", "医馆", "高塔", "监狱塔", "秘境", "峡谷", "海域", "宫殿")
FACTION_HINTS = ("帝国", "协会", "兄弟会", "组织", "军", "教会", "公会", "大坟墓", "族")
EVENT_TOKENS = ("大战", "战役", "峡谷战", "宅邸战", "攻防", "讨伐", "灾变", "惨案", "毁灭", "突围", "侵攻", "陷落", "叛乱", "撤离")
EVENT_EXCLUSIONS = ("梦境", "余波", "日常", "前夜", "疑云", "真相", "情报", "宴会", "谈判", "理论", "开端", "终局", "退场", "线索")
SPECIAL_INTERLUDE_TERMS = ("现代灵异", "未完成特殊梦境", "特殊梦境")
ALIAS_LABELS = {"废弃", "未完成", "暂定", "资料不足", "待定"}
CHARACTER_METADATA_HEADINGS = {"题记", "使用原则", "角色来源备注", "快速索引"}
STRUCTURED_CONCEPTS = {
    "魔物之盒": ("魔盒",),
    "耶各诅咒": (),
    "死亡秩序": (),
}


@dataclass
class Candidate:
    type_hint: str
    name_hint: str
    aliases_hint: set[str] = field(default_factory=set)
    alias_requires_review: set[str] = field(default_factory=set)
    canon_layer_hint: str = "original_campaign"
    source_refs: list[dict[str, str]] = field(default_factory=list)
    reasons: list[str] = field(default_factory=list)
    ledger_match_found: bool = False
    ledger_ids_hint: set[str] = field(default_factory=set)
    manually_added: bool = False
    review_status: str = "pending"
    review_target: str = ""

    def names_normalized(self) -> set[str]:
        return {normalize_name(self.name_hint), *(normalize_name(alias) for alias in self.aliases_hint)}


@dataclass
class ExtractionNotes:
    missing: list[str] = field(default_factory=list)
    unresolved_event_coverage: list[str] = field(default_factory=list)
    special_interlude_sources: list[str] = field(default_factory=list)
    unclassified: list[str] = field(default_factory=list)
    manually_added: list[str] = field(default_factory=list)


class ReviewedCandidatesError(RuntimeError):
    pass


def normalize_name(value: str) -> str:
    return re.sub(r"[\W_]+", "", value.casefold(), flags=re.UNICODE)


def clean_heading(value: str) -> str:
    value = re.sub(r"\s+", " ", value).strip()
    return value.strip("：:；;，,。.!！?？—- ")


def split_name_aliases(raw: str, *, slash_alias_evidence: bool = False) -> tuple[str, list[str]]:
    raw = clean_heading(raw)
    parenthetical: list[str] = []

    def capture(match: re.Match[str]) -> str:
        for value in re.split(r"[/／]", match.group(1)):
            value = clean_heading(value)
            if (
                value
                and len(value) <= 20
                and not re.search(r"(?:的|说明|资料|关系|阶段|待定|未完成|废弃)", value)
                and not re.search(r"[。；;，,：:]", value)
            ):
                parenthetical.append(value)
        return ""

    outside = re.sub(r"[（(]([^）)]+)[）)]", capture, raw).strip()
    if slash_alias_evidence:
        parts = [clean_heading(part) for part in re.split(r"[/／]", outside) if clean_heading(part)]
        if not parts:
            parts = [raw]
        primary = min(parts, key=lambda item: (len(item), parts.index(item)))
        aliases = [part for part in parts if part != primary]
    else:
        primary = clean_heading(outside) or raw
        aliases = []
    aliases.extend(clean_heading(item) for item in parenthetical if clean_heading(item))
    aliases = [item for item in aliases if item not in ALIAS_LABELS and normalize_name(item) != normalize_name(primary)]
    return primary, sorted(set(aliases), key=lambda item: (normalize_name(item), item))


def slash_parts(raw: str) -> list[str]:
    return [clean_heading(part) for part in re.split(r"[/／]", raw) if clean_heading(part)]


def markdown_h2_blocks(text: str) -> list[tuple[str, str, int, str]]:
    lines = text.splitlines()
    current_h1 = ""
    result: list[tuple[str, str, int, str]] = []
    index = 0
    while index < len(lines):
        h1 = re.match(r"^#\s+(.+?)\s*$", lines[index])
        if h1:
            current_h1 = clean_heading(h1.group(1))
            index += 1
            continue
        h2 = re.match(r"^##\s+(.+?)\s*$", lines[index])
        if not h2:
            index += 1
            continue
        start = index
        title = clean_heading(h2.group(1))
        index += 1
        body: list[str] = []
        while index < len(lines) and not re.match(r"^#{1,2}\s+", lines[index]):
            body.append(lines[index])
            index += 1
        result.append((current_h1, title, start + 1, "\n".join(body).strip()))
    return result


def markdown_table_rows(text: str) -> list[dict[str, str]]:
    lines = text.splitlines()
    rows: list[dict[str, str]] = []
    index = 0
    while index + 1 < len(lines):
        if not lines[index].startswith("|") or not re.match(r"^\|(?:\s*:?-+:?\s*\|)+\s*$", lines[index + 1]):
            index += 1
            continue
        headers = [cell.strip() for cell in lines[index].strip().strip("|").split("|")]
        index += 2
        while index < len(lines) and lines[index].startswith("|"):
            cells = [cell.strip() for cell in lines[index].strip().strip("|").split("|")]
            if len(cells) == len(headers):
                rows.append(dict(zip(headers, cells)))
            index += 1
    return rows


def relative_document(path: Path, campaign_root: Path) -> str:
    try:
        return path.resolve().relative_to(campaign_root.resolve()).as_posix()
    except ValueError:
        return Path(os.path.relpath(path.resolve(), campaign_root.resolve())).as_posix()


def source_ref(path: Path, campaign_root: Path, reference: str) -> dict[str, str]:
    return {"document": relative_document(path, campaign_root), "reference": reference}


def aliases_from_body(body: str) -> list[str]:
    found: list[str] = []
    for match in re.finditer(r"(?:常用称呼|别名|又名|真名)\s*[：:]\s*([^\n。；;]+)", body):
        value = re.sub(r"[*`\"“”]", "", match.group(1)).strip()
        for part in re.split(r"[、,，/／]", value):
            part = clean_heading(part)
            if part and len(part) <= 40:
                found.append(part)
    return found


def classify_setting(name: str, body: str) -> str | None:
    if name == "妄想大陆":
        return "world"
    if any(hint in name for hint in LOCATION_HINTS) and not any(
        hint in name for hint in ("帝国", "协会", "兄弟会", "组织", "军团")
    ):
        if name not in {"魔兽"}:
            return "location"
    if any(hint in name for hint in FACTION_HINTS) or any(word in body[:180] for word in ("势力", "组织", "统治", "阵营", "一族")):
        return "faction"
    return None


def add_candidate(
    candidates: list[Candidate],
    type_hint: str,
    raw_name: str,
    aliases: Iterable[str],
    ref: dict[str, str],
    reason: str,
    *,
    slash_alias_evidence: bool = False,
    alias_requires_review: Iterable[str] = (),
    canon_layer_hint: str = "original_campaign",
    ledger_ids_hint: Iterable[str] = (),
    manually_added: bool = False,
) -> Candidate | None:
    name, heading_aliases = split_name_aliases(raw_name, slash_alias_evidence=slash_alias_evidence)
    all_aliases = {clean_heading(alias) for alias in [*heading_aliases, *aliases] if clean_heading(alias)}
    all_aliases.discard(name)
    normalized_names = {normalize_name(name), *(normalize_name(alias) for alias in all_aliases)}
    if not name or not normalize_name(name):
        return None

    def layers_mergeable(left: str, right: str) -> bool:
        return left == right or "special_interlude" not in {left, right}

    matches = [
        item
        for item in candidates
        if item.type_hint == type_hint
        and layers_mergeable(item.canon_layer_hint, canon_layer_hint)
        and item.names_normalized().intersection(normalized_names)
    ]
    existing = matches[0] if matches else None
    if existing is None:
        existing = Candidate(
            type_hint=type_hint,
            name_hint=name,
            canon_layer_hint=canon_layer_hint,
            manually_added=manually_added,
        )
        candidates.append(existing)
        for other in candidates:
            if other is existing or other.type_hint != type_hint:
                continue
            if other.names_normalized().intersection(normalized_names) and not layers_mergeable(
                other.canon_layer_hint, canon_layer_hint
            ):
                note = (
                    f"同名或明确 alias 跨越 {other.canon_layer_hint} / {canon_layer_hint}；"
                    "未发现回带证据，不自动合并"
                )
                other.alias_requires_review.add(note)
                existing.alias_requires_review.add(note)
    else:
        for duplicate in matches[1:]:
            existing.aliases_hint.add(duplicate.name_hint)
            existing.aliases_hint.update(duplicate.aliases_hint)
            for duplicate_ref in duplicate.source_refs:
                if duplicate_ref not in existing.source_refs:
                    existing.source_refs.append(duplicate_ref)
            for duplicate_reason in duplicate.reasons:
                if duplicate_reason not in existing.reasons:
                    existing.reasons.append(duplicate_reason)
            existing.alias_requires_review.update(duplicate.alias_requires_review)
            existing.ledger_match_found = existing.ledger_match_found or duplicate.ledger_match_found
            existing.ledger_ids_hint.update(duplicate.ledger_ids_hint)
            existing.manually_added = existing.manually_added or duplicate.manually_added
            candidates.remove(duplicate)

    existing.aliases_hint.update(all_aliases)
    if normalize_name(name) != normalize_name(existing.name_hint):
        existing.aliases_hint.add(name)
    existing.aliases_hint = {
        alias for alias in existing.aliases_hint if normalize_name(alias) != normalize_name(existing.name_hint)
    }
    if ref not in existing.source_refs:
        existing.source_refs.append(ref)
    if reason not in existing.reasons:
        existing.reasons.append(reason)
    existing.alias_requires_review.update(clean_heading(item) for item in alias_requires_review if clean_heading(item))
    existing.ledger_ids_hint.update(ledger_ids_hint)
    existing.manually_added = existing.manually_added or manually_added
    if existing.canon_layer_hint != canon_layer_hint:
        layers = {existing.canon_layer_hint, canon_layer_hint}
        if "original_campaign" in layers:
            existing.canon_layer_hint = "original_campaign"
        elif "transition" in layers:
            existing.canon_layer_hint = "transition"
        existing.alias_requires_review.add(
            "来源跨越多个 canon layer；当前 hint 取主世界层，必须人工确认"
        )
    return existing


def strip_event_prefix(title: str) -> str:
    title = re.sub(r"^分卷\s*\d+\s*[：:]\s*", "", title)
    title = re.sub(r"^S(?:C)?\s*\d+[A-Za-z]?\s*", "", title, flags=re.IGNORECASE)
    title = re.sub(r"^\d+(?:\s*[-—]\s*\d+)?\s*页\s*", "", title)
    return clean_heading(title)


def event_phrases(title: str) -> list[str]:
    title = strip_event_prefix(title)
    parts = [clean_heading(part) for part in re.split(r"[、，,]|(?:与|及|和)", title)]
    result: list[str] = []
    for part in parts:
        part = re.sub(r"^(?:前半|后半|终局)\s*", "", part)
        if not part or part.endswith("线") or any(term in part for term in EVENT_EXCLUSIONS):
            continue
        if any(token in part for token in EVENT_TOKENS) or re.search(r"(?:战|之战)$", part):
            result.append(part)
    return result


def event_core(name: str) -> str:
    return re.sub(
        r"(?:大战|战役|之战|峡谷战|宅邸战|攻防|讨伐|灾变|惨案|毁灭|突围|侵攻|陷落|叛乱|撤离)$",
        "",
        name,
    )


def is_special_interlude(value: str) -> bool:
    return any(term in value for term in SPECIAL_INTERLUDE_TERMS) or "梦境" in value or (
        "番外" in value and bool(re.search(r"(?:醒来|返回主线|回到.*主线|番外结束)", value))
    )


def is_special_interlude_opening(value: str) -> bool:
    """Return whether a scene is an explicit special-interlude opening anchor.

    Broad dream wording controls canon-layer isolation, but must not itself expand
    the event candidate pool.  Only the pre-existing explicit opening markers are
    allowed to create the synthetic interlude-opening event candidate.
    """
    return any(term in value for term in SPECIAL_INTERLUDE_TERMS)


def is_main_world_return_heading(title: str) -> bool:
    title_without_scene_id = re.sub(r"^S(?:C)?\d+[A-Za-z]?\s*", "", title, flags=re.IGNORECASE)
    return bool(
        re.search(r"(?:现实归来|回到现实|返回现实|梦醒后)", title_without_scene_id)
        or title_without_scene_id.startswith("现实")
    )


def has_special_interlude_exit(value: str) -> bool:
    return bool(re.search(r"(?:醒来|返回主线|回到.*主线|回到现实|返回现实|梦境结束|番外结束|梦醒后)", value))


def extract_event_ids(value: str) -> set[str]:
    ids: set[str] = set()
    for match in re.finditer(r"E(\d+)([A-Za-z]?)\s*[-–—]\s*E?(\d+)([A-Za-z]?)", value):
        start, end = int(match.group(1)), int(match.group(3))
        if not match.group(2) and not match.group(4) and 0 <= end - start <= 200:
            ids.update(f"E{number:03d}" for number in range(start, end + 1))
        else:
            ids.update({f"E{match.group(1)}{match.group(2)}", f"E{match.group(3)}{match.group(4)}"})
    ids.update(re.findall(r"E\d+[A-Za-z]?", value))
    return ids


def extract_scene_ids(value: str) -> set[str]:
    ids: set[str] = set()
    for match in re.finditer(r"(S(?:C)?)(\d+)([A-Za-z]?)\s*[-–—]\s*(?:S(?:C)?)?(\d+)([A-Za-z]?)", value, flags=re.IGNORECASE):
        prefix, start_text, start_suffix, end_text, end_suffix = match.groups()
        start, end = int(start_text), int(end_text)
        if not start_suffix and not end_suffix and 0 <= end - start <= 200:
            width = max(len(start_text), len(end_text))
            ids.update(f"{prefix.upper()}{number:0{width}d}" for number in range(start, end + 1))
        else:
            ids.update(
                {
                    f"{prefix.upper()}{start_text}{start_suffix.upper()}",
                    f"{prefix.upper()}{end_text}{end_suffix.upper()}",
                }
            )
    ids.update(match.upper() for match in re.findall(r"S(?:C)?\d+[A-Za-z]?", value, flags=re.IGNORECASE))
    return ids


def plot_event_names(title: str, body: str) -> list[str]:
    cleaned = strip_event_prefix(title)
    names = {cleaned} if cleaned else set()
    names.update(event_phrases(cleaned))
    combined = f"{cleaned}\n{body}"
    if "诅咒转移" in combined and "耶各" in combined:
        names.add("耶各诅咒转移")
    if "空间龙" in combined:
        names.add("空间龙事件")
    for part in re.split(r"[、，,]|(?:与|及|和)", cleaned):
        part = clean_heading(part)
        if len(part) >= 4 and re.search(r"(?:转移|探索|朝见|审判|处决|复活|救援|逃脱|仪式|夺回|真相)$", part):
            names.add(part)
    return sorted(names, key=lambda item: (normalize_name(item), item))


def plot_sources(text: str) -> list[tuple[str, str, str, set[str]]]:
    result: list[tuple[str, str, str, set[str]]] = []
    for _, title, line, body in markdown_h2_blocks(text):
        if re.match(r"^分卷\s*\d+", title):
            metadata = "；".join(
                clean_heading(item.lstrip("- "))
                for item in body.splitlines()
                if re.match(r"\s*-?\s*(?:核心功能|结尾边界|必写事件 ID|必写场景卡|必写动作锚点|不得误判)", item)
            )
            result.append((title, f"{title} (line {line})", metadata or body, extract_event_ids(body)))
    for row in markdown_table_rows(text):
        filename = row.get("正文文件", "")
        if not filename:
            continue
        title = re.sub(r"^\d+_", "", Path(filename).stem).replace("_", "、")
        body = "；".join(
            value for key, value in row.items() if key in {"覆盖场景", "覆盖事件", "叙事功能"} and value
        )
        result.append((title, f"正文文件 {filename}", body, extract_event_ids(row.get("覆盖事件", ""))))
    return result


def location_mentions(title: str) -> list[str]:
    mentions: set[str] = set()
    suffixes = "大陆|山脉|地带|地区|城市|医馆|高塔|监狱塔|秘境|峡谷|海域|宫殿|皇宫|法师塔|关卡|城堡|帝都"
    for part in re.split(r"[、，,]|(?:与|及|和)", strip_event_prefix(title)):
        part = clean_heading(part)
        for match in re.finditer(rf"[\u3400-\u9fff·]{{0,12}}?(?:{suffixes})", part):
            value = match.group(0)
            value = re.sub(r"^.*(?:前往|抵达|返回|进入|离开|逃离|夺回)", "", value)
            if value:
                mentions.add(value)
    return sorted(mentions, key=lambda item: (normalize_name(item), item))


def special_scene_ids(files: dict[str, list[Path]]) -> dict[Path, set[str]]:
    by_folder: dict[Path, set[str]] = defaultdict(set)
    for path in files.get(PLOT_NAME, []):
        for title, _, body, _ in plot_sources(path.read_text(encoding="utf-8-sig")):
            if is_special_interlude(f"{title}\n{body}"):
                by_folder[path.parent.resolve()].update(extract_scene_ids(body))
    for path in files.get(SCENE_NAME, []):
        active = False
        for _, title, _, body in markdown_h2_blocks(path.read_text(encoding="utf-8-sig")):
            match = re.match(r"^(S(?:C)?\d+[A-Za-z]?)\b", title, flags=re.IGNORECASE)
            if is_main_world_return_heading(title):
                active = False
                if match:
                    by_folder[path.parent.resolve()].discard(match.group(1).upper())
                continue
            block = f"{title}\n{body}"
            scene_is_special = active or is_special_interlude(block)
            if not scene_is_special:
                continue
            if match:
                by_folder[path.parent.resolve()].add(match.group(1).upper())
            active = scene_is_special and not has_special_interlude_exit(block)
    return by_folder


def has_main_world_carryback(name: str, body: str) -> bool:
    if re.search(r"(?:没有|未|并未|不曾)带回", body):
        return False
    acquired = bool(re.search(rf"(?:取得|获得|带回|保留)[^。；\n]{{0,20}}{re.escape(name)}|{re.escape(name)}[^。；\n]{{0,20}}(?:带回|保留)", body))
    consequence = bool(re.search(r"(?:醒来|返回主线|回到.*主线|后续|灾变|现实|奖励)", body))
    return acquired and consequence


def load_manual_candidates(project_root: Path, campaign_root: Path) -> list[dict[str, object]]:
    path = project_root / "config" / "manual_candidates.json"
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, list):
        raise ValueError("config/manual_candidates.json must contain a JSON array")
    required = {"name_hint", "type_hint", "canon_layer_hint", "source_refs", "reason"}
    for index, item in enumerate(data, start=1):
        if not isinstance(item, dict) or not required.issubset(item):
            raise ValueError(f"manual candidate {index} is missing required fields")
        if item["type_hint"] not in TYPE_ORDER:
            raise ValueError(f"manual candidate {index} has an invalid type_hint")
        if item["canon_layer_hint"] not in {"original_campaign", "transition", "continuation", "special_interlude"}:
            raise ValueError(f"manual candidate {index} has an invalid canon_layer_hint")
        if not str(item["reason"]).strip():
            raise ValueError(f"manual candidate {index} has no reason")
        refs = item["source_refs"]
        if not isinstance(refs, list) or not refs:
            raise ValueError(f"manual candidate {index} has no source_refs")
        for ref in refs:
            if not isinstance(ref, dict) or set(ref) != {"document", "reference"}:
                raise ValueError(f"manual candidate {index} has an invalid source reference")
            if not str(ref["reference"]).strip():
                raise ValueError(f"manual candidate {index} has an empty source reference")
            source_path = campaign_root / str(ref["document"])
            if not source_path.is_file():
                raise ValueError(f"manual candidate {index} source does not exist: {ref['document']}")
            source_text = source_path.read_text(encoding="utf-8-sig")
            if str(item["name_hint"]) not in source_text:
                raise ValueError(f"manual candidate {index} name is not present in source: {item['name_hint']}")
    return data


def load_alias_evidence(project_root: Path, campaign_root: Path) -> list[dict[str, object]]:
    path = project_root / "config" / "alias_evidence.json"
    if not path.is_file():
        return []
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, list):
        raise ValueError("config/alias_evidence.json must contain a JSON array")
    required = {"name_hint", "type_hint", "relationship_name", "status", "source_refs", "reason"}
    for index, item in enumerate(data, start=1):
        if not isinstance(item, dict) or not required.issubset(item):
            raise ValueError(f"alias evidence {index} is missing required fields")
        if item["status"] not in {"alias_hint", "requires_review", "review_note"}:
            raise ValueError(f"alias evidence {index} has an invalid status")
        refs = item["source_refs"]
        if not isinstance(refs, list) or not refs:
            raise ValueError(f"alias evidence {index} has no source_refs")
        for ref in refs:
            if not isinstance(ref, dict) or set(ref) != {"document", "reference"}:
                raise ValueError(f"alias evidence {index} has an invalid source reference")
            source_path = campaign_root / str(ref["document"])
            if not source_path.is_file():
                raise ValueError(f"alias evidence {index} source does not exist: {ref['document']}")
            source_text = source_path.read_text(encoding="utf-8-sig")
            if str(item["relationship_name"]) not in source_text:
                raise ValueError(
                    f"alias evidence {index} relationship name is not present in source: {item['relationship_name']}"
                )
    return data


def apply_alias_evidence(candidates: list[Candidate], evidence: list[dict[str, object]]) -> None:
    for item in evidence:
        candidate = next(
            (
                current
                for current in candidates
                if current.type_hint == item["type_hint"] and current.name_hint == item["name_hint"]
            ),
            None,
        )
        if candidate is None:
            raise ValueError(f"alias evidence target was not extracted: {item['type_hint']}:{item['name_hint']}")
        relationship_name = str(item["relationship_name"])
        if item["status"] == "alias_hint":
            candidate.aliases_hint.add(relationship_name)
        else:
            candidate.alias_requires_review.add(f"{relationship_name} — {item['reason']}")
        refs = item["source_refs"]
        assert isinstance(refs, list)
        for ref in refs:
            assert isinstance(ref, dict)
            normalized_ref = {"document": str(ref["document"]), "reference": str(ref["reference"])}
            if normalized_ref not in candidate.source_refs:
                candidate.source_refs.append(normalized_ref)


def load_review_decisions(project_root: Path) -> dict[str, object]:
    path = project_root / "config" / "review_decisions.json"
    if not path.is_file():
        return {"stage": "candidate", "decisions": []}
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, dict) or data.get("stage") != "frozen" or not isinstance(data.get("decisions"), list):
        raise ValueError("config/review_decisions.json must declare frozen stage and a decisions array")
    allowed_decisions = {"approved", "merged", "rejected", "deferred"}
    for index, item in enumerate(data["decisions"], start=1):
        if not isinstance(item, dict):
            raise ValueError(f"review decision {index} must be an object")
        required = {"kind", "type_hint", "name_hint", "decision", "reason"}
        if not required.issubset(item):
            raise ValueError(f"review decision {index} is missing required fields")
        if item["kind"] not in {"merge", "alias", "candidate"}:
            raise ValueError(f"review decision {index} has an invalid kind")
        if item["decision"] not in allowed_decisions:
            raise ValueError(f"review decision {index} has an invalid decision")
        if item["kind"] == "merge" and (item["decision"] != "merged" or not item.get("target_name")):
            raise ValueError(f"review decision {index} has an invalid merge target")
        if item["kind"] == "alias" and (item["decision"] != "approved" or not item.get("alias")):
            raise ValueError(f"review decision {index} has an invalid alias approval")
        if not str(item["reason"]).strip():
            raise ValueError(f"review decision {index} has no reason")
    return data


def apply_review_decisions(candidates: list[Candidate], review: dict[str, object]) -> list[str]:
    rendered: list[str] = []

    def select(item: dict[str, object], *, name_field: str = "name_hint") -> Candidate:
        matches = [
            candidate
            for candidate in candidates
            if candidate.type_hint == item["type_hint"]
            and candidate.name_hint == item[name_field]
            and (not item.get("canon_layer_hint") or candidate.canon_layer_hint == item["canon_layer_hint"])
        ]
        if len(matches) != 1:
            raise ValueError(
                f"review decision target must resolve once: {item['type_hint']}:{item[name_field]} ({len(matches)} matches)"
            )
        return matches[0]

    decisions = review.get("decisions", [])
    assert isinstance(decisions, list)
    for raw_item in decisions:
        assert isinstance(raw_item, dict)
        item: dict[str, object] = raw_item
        candidate = select(item)
        kind = str(item["kind"])
        decision = str(item["decision"])
        if kind == "candidate":
            candidate.review_status = decision
            rendered.append(f"{decision}: {candidate.type_hint}:{candidate.name_hint} — {item['reason']}")
            continue
        if kind == "alias":
            alias = str(item["alias"])
            candidate.aliases_hint.add(alias)
            candidate.alias_requires_review = {
                note for note in candidate.alias_requires_review if alias not in note
            }
            candidate.review_status = "approved"
            rendered.append(f"approved alias: {candidate.name_hint} ← {alias} — {item['reason']}")
            continue

        target_item = dict(item)
        target_item["name_hint"] = item["target_name"]
        target = select(target_item)
        candidate.review_status = "merged"
        candidate.review_target = f"{target.type_hint}:{target.name_hint}"
        if target.review_status == "pending":
            target.review_status = "approved"
        target.aliases_hint.add(candidate.name_hint)
        for ref in candidate.source_refs:
            if ref not in target.source_refs:
                target.source_refs.append(ref)
        for reason in candidate.reasons:
            if reason not in target.reasons:
                target.reasons.append(reason)
        target.ledger_match_found = target.ledger_match_found or candidate.ledger_match_found
        pair_names = (candidate.name_hint, target.name_hint)
        candidate.alias_requires_review = {
            note for note in candidate.alias_requires_review if not all(name in note for name in pair_names)
        }
        target.alias_requires_review = {
            note for note in target.alias_requires_review if not all(name in note for name in pair_names)
        }
        rendered.append(f"merged: {candidate.type_hint}:{candidate.name_hint} → {target.name_hint} — {item['reason']}")
    return rendered


def discover_files(campaign_root: Path, project_root: Path) -> tuple[dict[str, list[Path]], ExtractionNotes]:
    notes = ExtractionNotes()
    found: dict[str, list[Path]] = {}
    for name in KNOWN_NAMES:
        paths = sorted(
            (
                path
                for path in campaign_root.rglob(name)
                if "work" not in path.parts and "output" not in path.parts and "docs" not in path.parts
            ),
            key=lambda path: relative_document(path, campaign_root),
        )
        found[name] = paths
        if not paths:
            notes.missing.append(name)

    current = project_root / "current_state.md"
    if current.is_file():
        found["current_state.md"] = [current]
    else:
        alternatives = sorted(campaign_root.rglob("current_state.md"))
        found["current_state.md"] = alternatives[:1]
        if not alternatives:
            notes.missing.append("current_state.md")

    for scene_path in found.get(SCENE_NAME, []):
        missing_siblings = [name for name in (LEDGER_NAME, PLOT_NAME) if not (scene_path.parent / name).is_file()]
        if missing_siblings:
            folder = relative_document(scene_path.parent, campaign_root)
            notes.unresolved_event_coverage.append(f"{folder}: 缺少 {', '.join(missing_siblings)}")
    for phase in ("901第二部分_16-25页", "901第三部分"):
        supporting = [
            path
            for name in (LEDGER_NAME, PLOT_NAME)
            for path in found.get(name, [])
            if phase in str(path)
        ]
        if not supporting:
            notes.unresolved_event_coverage.append(
                f"{phase}: 缺少事件台账或剧情分段目录，event coverage 未解决"
            )
    return found, notes


def detect_campaign_root(project_root: Path) -> Path:
    for root in (project_root, *project_root.parents[:3]):
        if any(root.rglob(SETTING_NAME)):
            return root
    return project_root


def extract_candidates(
    files: dict[str, list[Path]],
    campaign_root: Path,
    notes: ExtractionNotes,
    manual_candidates: list[dict[str, object]],
) -> list[Candidate]:
    candidates: list[Candidate] = []
    dream_ids_by_folder = special_scene_ids(files)

    for path in files.get(SETTING_NAME, []):
        text = path.read_text(encoding="utf-8-sig")
        for h1, title, line, body in markdown_h2_blocks(text):
            if title == "快速索引":
                continue
            ref = source_ref(path, campaign_root, f"{title} (line {line})")
            if "登场人物" in h1:
                review = []
                if len(slash_parts(title)) > 1:
                    review.append("人物斜线名称可能代表阶段性命名，第二阶段不得静默视为拼写变体")
                add_candidate(
                    candidates,
                    "character",
                    title,
                    aliases_from_body(body),
                    ref,
                    "设定集中存在独立人物定义",
                    slash_alias_evidence=True,
                    alias_requires_review=review,
                )
            elif "特有名词" in h1:
                parts = slash_parts(title)
                if len(parts) > 1:
                    review = f"复合标题共现：{' / '.join(parts)}；不可自动视为 alias"
                    body_aliases = aliases_from_body(body)
                    review_items = [review]
                    if body_aliases:
                        review_items.append(
                            f"复合标题正文另列名称：{' / '.join(body_aliases)}；归属待人工确认"
                        )
                    for part in parts:
                        add_candidate(
                            candidates,
                            "concept",
                            part,
                            [],
                            ref,
                            "设定集中存在独立术语或概念定义",
                            alias_requires_review=review_items,
                        )
                else:
                    add_candidate(candidates, "concept", title, aliases_from_body(body), ref, "设定集中存在独立术语或概念定义")
            elif "世界观" in h1 or "势力" in h1:
                parts = slash_parts(title)
                review = []
                if len(parts) > 1:
                    review.append(f"复合标题共现：{' / '.join(parts)}；不可自动视为 alias")
                for part in parts or [title]:
                    type_hint = classify_setting(part, body)
                    if type_hint:
                        add_candidate(
                            candidates,
                            type_hint,
                            part,
                            [] if len(parts) > 1 else aliases_from_body(body),
                            ref,
                            "设定集中存在独立世界、势力或地点定义",
                            alias_requires_review=review,
                        )
                    else:
                        notes.unclassified.append(f"{relative_document(path, campaign_root)}#{part}")
        for event_name in ("峡谷战", "第一次魔兽大侵攻"):
            position = text.find(event_name)
            if position >= 0:
                line = text.count("\n", 0, position) + 1
                ref = source_ref(path, campaign_root, f"{event_name} (line {line})")
                add_candidate(
                    candidates,
                    "event",
                    event_name,
                    [],
                    ref,
                    "设定集正文明确命名且说明了持续影响的历史事件",
                )

    for name in CHARACTER_NAMES:
        for path in files.get(name, []):
            text = path.read_text(encoding="utf-8-sig")
            for h1, title, line, body in markdown_h2_blocks(text):
                if h1 not in {"参演人员", "参演人员：英雄志", "NPC 与支援角色", "NPC与支援角色"}:
                    continue
                if title in CHARACTER_METADATA_HEADINGS:
                    continue
                ref = source_ref(path, campaign_root, f"{title} (line {line})")
                review = []
                if len(slash_parts(title)) > 1:
                    review.append("人物斜线名称可能代表阶段性命名，第二阶段不得静默视为拼写变体")
                add_candidate(
                    candidates,
                    "character",
                    title,
                    aliases_from_body(body),
                    ref,
                    "人物卡中存在顶层重要人物资料",
                    slash_alias_evidence=True,
                    alias_requires_review=review,
                )

    for path in files.get(INDEX_NAME, []):
        for row in markdown_table_rows(path.read_text(encoding="utf-8-sig")):
            row_id = row.get("Line ID") or row.get("编号") or "table row"
            if not str(row_id).startswith("C"):
                continue
            if row.get("类型") and row.get("类型") != "角色":
                continue
            raw_entity = row.get("角色/主题") or row.get("角色/关系") or ""
            parts = [clean_heading(part) for part in re.split(r"[/／]", raw_entity) if clean_heading(part)]
            if not parts or parts[0] in {"龙族高层", "队伍", "全队"}:
                notes.unclassified.append(f"{relative_document(path, campaign_root)}#{row_id}: {raw_entity}")
                continue
            aliases = parts[1:] if "角色/主题" in row else []
            ref = source_ref(path, campaign_root, str(row_id))
            scene_refs = {match.upper() for match in re.findall(r"S(?:C)?\d+[A-Za-z]?", row.get("来源场景", ""), flags=re.IGNORECASE)}
            dream_ids = dream_ids_by_folder.get(path.parent.resolve(), set())
            layer = "special_interlude" if scene_refs and scene_refs.issubset(dream_ids) else "original_campaign"
            review: list[str] = []
            if len(parts) > 1:
                review.append("角色线索表斜线名称为 alias candidate，仍需人工确认")
            joined = " ".join(row.values())
            if parts[0] == "A":
                stable = "本行出现魔法师A" if "魔法师A" in joined else "需要继续核对魔法师A等较稳定称呼"
                review.append(f"裸 ASCII 单字符 A 不得直接成为最终 trigger key；{stable}，待来源核验")
            if parts[0] == "杨":
                review.append("单字符人物名杨保留 pending，要求进一步来源核验")
            add_candidate(
                candidates,
                "character",
                parts[0],
                aliases,
                ref,
                "角色与主题线索表明确标注为重要角色",
                slash_alias_evidence=True,
                alias_requires_review=review,
                canon_layer_hint=layer,
            )

    for path in files.get(INDEX_NAME, []):
        for row in markdown_table_rows(path.read_text(encoding="utf-8-sig")):
            joined = " ".join(row.values())
            if "魔盒灾变" in joined:
                row_id = row.get("Line ID") or row.get("编号") or "table row"
                ref = source_ref(path, campaign_root, str(row_id))
                add_candidate(
                    candidates,
                    "event",
                    "魔物之盒灾变",
                    ["魔盒灾变"],
                    ref,
                    "主题线索表明确指出魔物之盒引发具有持续影响的灾变",
                )

    for path in files.get(PLOT_NAME, []):
        text = path.read_text(encoding="utf-8-sig")
        for title, reference, body, event_ids in plot_sources(text):
            ref = source_ref(path, campaign_root, reference)
            layer = "special_interlude" if is_special_interlude(f"{title}\n{body}") else "original_campaign"
            if layer == "special_interlude":
                notes.special_interlude_sources.append(f"{relative_document(path, campaign_root)}#{title}")
            for location_name in location_mentions(title):
                add_candidate(
                    candidates,
                    "location",
                    location_name,
                    [],
                    ref,
                    "剧情分段标题将其作为可重复出现的重要地点",
                    canon_layer_hint=layer,
                )
            for concept_name, concept_aliases in STRUCTURED_CONCEPTS.items():
                if concept_name in title or concept_name in body:
                    concept_layer = (
                        "original_campaign"
                        if layer == "special_interlude" and has_main_world_carryback(concept_name, body)
                        else layer
                    )
                    add_candidate(
                        candidates,
                        "concept",
                        concept_name,
                        concept_aliases,
                        ref,
                        "剧情分段资料将其作为持续性物品或世界机制",
                        canon_layer_hint=concept_layer,
                    )
            for event_name in plot_event_names(title, body):
                add_candidate(
                    candidates,
                    "event",
                    event_name,
                    [],
                    ref,
                    f"剧情分卷提供 event candidate source；{body}" if body else "剧情分卷提供 event candidate source",
                    canon_layer_hint=layer,
                    ledger_ids_hint=event_ids,
                )

    for path in files.get(SCENE_NAME, []):
        text = path.read_text(encoding="utf-8-sig")
        dream_ids = dream_ids_by_folder.get(path.parent.resolve(), set())
        for _, title, line, _ in markdown_h2_blocks(text):
            ref = source_ref(path, campaign_root, f"{title} (line {line})")
            scene_match = re.match(r"^(S(?:C)?\d+[A-Za-z]?)\b", title, flags=re.IGNORECASE)
            scene_id = scene_match.group(1).upper() if scene_match else ""
            if is_main_world_return_heading(title):
                layer = "original_campaign"
            else:
                layer = "special_interlude" if is_special_interlude(title) or scene_id in dream_ids else "original_campaign"
            if is_special_interlude_opening(title):
                notes.special_interlude_sources.append(f"{relative_document(path, campaign_root)}#{title}")
                add_candidate(
                    candidates,
                    "event",
                    strip_event_prefix(title),
                    [],
                    ref,
                    "顺读场景卡明确标记未完成现代灵异特殊梦境的起点",
                    canon_layer_hint="special_interlude",
                )
                continue
            for location_name in location_mentions(title):
                add_candidate(
                    candidates,
                    "location",
                    location_name,
                    [],
                    ref,
                    "剧情结构标题将其作为可重复出现的重要地点",
                    canon_layer_hint=layer,
                )
            for event_name in event_phrases(title):
                add_candidate(
                    candidates,
                    "event",
                    event_name,
                    [],
                    ref,
                    "剧情结构标题指向具有独立名称的重大事件",
                    canon_layer_hint=layer,
                )

    for path in files.get("current_state.md", []):
        text = path.read_text(encoding="utf-8-sig")
        anchors = (
            ("死亡之翼之战", "original_campaign", r"死亡之翼.{0,24}(?:击败|大战.{0,8}(?:结束|胜利))"),
            ("龙族秘境毁灭", "transition", r"龙族秘境.{0,24}(?:毁灭|崩坏)"),
        )
        for event_name, layer, pattern in anchors:
            match = re.search(pattern, text, flags=re.DOTALL)
            if not match:
                continue
            line = text.count("\n", 0, match.start()) + 1
            ref = source_ref(path, campaign_root, f"continuation anchor (line {line})")
            add_candidate(
                candidates,
                "event",
                event_name,
                [],
                ref,
                "current_state 明确规定的原团结局或最小过渡事件",
                canon_layer_hint=layer,
            )
            if event_name == "龙族秘境毁灭":
                add_candidate(
                    candidates,
                    "location",
                    "龙族秘境",
                    [],
                    ref,
                    "current_state 明确记录其为已经毁灭但仍具持续影响的核心地点",
                    canon_layer_hint="transition",
                )

    for item in manual_candidates:
        refs = item["source_refs"]
        assert isinstance(refs, list)
        for ref in refs:
            assert isinstance(ref, dict)
            candidate = add_candidate(
                candidates,
                str(item["type_hint"]),
                str(item["name_hint"]),
                item.get("aliases_hint", []),
                {"document": str(ref["document"]), "reference": str(ref["reference"])},
                str(item["reason"]),
                canon_layer_hint=str(item["canon_layer_hint"]),
                manually_added=True,
            )
            if candidate is not None:
                notes.manually_added.append(f"{candidate.type_hint}: {candidate.name_hint}")

    ledger_rows: list[tuple[Path, str, str]] = []
    for path in files.get(LEDGER_NAME, []):
        for raw in path.read_text(encoding="utf-8-sig").splitlines():
            if not raw.startswith("|") or re.match(r"^\|\s*-", raw):
                continue
            cells = [cell.strip() for cell in raw.strip().strip("|").split("|")]
            if cells and re.fullmatch(r"E\d+[A-Za-z]?", cells[0]):
                ledger_rows.append((path, cells[0], " ".join(cells[1:])))

    for candidate in (item for item in candidates if item.type_hint == "event"):
        core = event_core(candidate.name_hint)
        terms = {candidate.name_hint}
        if len(core) >= 4:
            terms.add(core)
        candidate_dirs = {
            ref["document"].rsplit("/", 1)[0]
            for ref in candidate.source_refs
            if "/" in ref["document"]
            and ref["document"].rsplit("/", 1)[-1] in {PLOT_NAME, SCENE_NAME}
        }
        for path, event_id, row in ledger_rows:
            ledger_dir = relative_document(path, campaign_root).rsplit("/", 1)[0]
            explicit_id_match = event_id in candidate.ledger_ids_hint and ledger_dir in candidate_dirs
            text_match = ledger_dir in candidate_dirs and any(term in row for term in terms)
            if explicit_id_match or text_match:
                ref = source_ref(path, campaign_root, event_id)
                if ref not in candidate.source_refs:
                    candidate.source_refs.append(ref)
                candidate.ledger_match_found = True
                if "找到可能相关的事件台账记录" not in candidate.reasons:
                    candidate.reasons.append("找到可能相关的事件台账记录")

    return candidates


def candidate_sort_key(candidate: Candidate) -> tuple[object, ...]:
    first_source = min((ref["document"] + ref["reference"] for ref in candidate.source_refs), default="")
    return (TYPE_ORDER[candidate.type_hint], normalize_name(candidate.name_hint), first_source)


def annotate_alias_review(candidates: list[Candidate]) -> None:
    by_name = {candidate.name_hint: candidate for candidate in candidates}
    for name in ("悠悠", "芬尔德·特兰希尔", "芬尔德·琳·特兰希尔"):
        candidate = by_name.get(name)
        if candidate:
            candidate.alias_requires_review.add("悠悠与两个芬尔德全名可能具有阶段性命名含义，第二阶段不得静默视为拼写变体")
    for candidate in candidates:
        if candidate.type_hint == "character" and candidate.name_hint == "A":
            candidate.alias_requires_review.add("裸 ASCII 单字符 A 不得直接成为最终 SillyTavern trigger key")
        if candidate.type_hint == "character" and candidate.name_hint == "杨":
            candidate.alias_requires_review.add("杨保留 pending，要求进一步来源核验")

    ordered = sorted(candidates, key=candidate_sort_key)
    for index, left in enumerate(ordered):
        for right in ordered[index + 1 :]:
            if left.type_hint != right.type_hint:
                continue
            a, b = normalize_name(left.name_hint), normalize_name(right.name_hint)
            if not a or not b or a == b:
                continue
            containment = min(len(a), len(b)) >= 2 and (a in b or b in a)
            character_similarity = left.type_hint == "character" and difflib.SequenceMatcher(None, a, b).ratio() >= 0.72
            if containment or character_similarity:
                note = f"可能 alias：{left.name_hint} ↔ {right.name_hint}（弱字符串关系，仅待审，不自动合并）"
                left.alias_requires_review.add(note)
                right.alias_requires_review.add(note)


def serialize_candidates(candidates: list[Candidate]) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for index, candidate in enumerate(sorted(candidates, key=candidate_sort_key), start=1):
        refs = sorted(candidate.source_refs, key=lambda item: (item["document"], item["reference"]))
        rows.append(
            {
                "candidate_id": f"CAND_{index:04d}",
                "type_hint": candidate.type_hint,
                "name_hint": candidate.name_hint,
                "aliases_hint": sorted(candidate.aliases_hint, key=lambda item: (normalize_name(item), item)),
                "alias_requires_review": sorted(candidate.alias_requires_review),
                "canon_layer_hint": candidate.canon_layer_hint,
                "ledger_match_found": candidate.ledger_match_found,
                "source_refs": refs,
                "reason": "；".join(candidate.reasons),
                "review_status": candidate.review_status,
                "review_target": candidate.review_target or None,
            }
        )
    return rows


def analyze(candidates: list[Candidate]) -> dict[str, list[str]]:
    duplicate_suspects: list[str] = []
    name_conflicts: list[str] = []
    cross_type_name_conflicts: list[str] = []
    too_fine: list[str] = []
    too_coarse: list[str] = []
    manual_review: list[str] = []

    alias_owners: dict[str, list[Candidate]] = defaultdict(list)
    for candidate in candidates:
        for name in {candidate.name_hint, *candidate.aliases_hint}:
            alias_owners[normalize_name(name)].append(candidate)
    for normalized, owners in alias_owners.items():
        distinct = {(item.type_hint, item.name_hint) for item in owners}
        if normalized and len(distinct) > 1:
            values = " / ".join(f"{kind}:{name}" for kind, name in sorted(distinct))
            name_conflicts.append(f"同一名称或别名被多个候选占用：{values}")
            if len({kind for kind, _ in distinct}) > 1:
                cross_type_name_conflicts.append(f"相同名称对应不同 type_hint：{values}")

    ordered = sorted(candidates, key=candidate_sort_key)
    for index, left in enumerate(ordered):
        for right in ordered[index + 1 :]:
            if left.type_hint != right.type_hint:
                continue
            a, b = normalize_name(left.name_hint), normalize_name(right.name_hint)
            if not a or not b or a == b:
                continue
            ratio = difflib.SequenceMatcher(None, a, b).ratio()
            same_event_core = (
                left.type_hint == "event"
                and len(event_core(left.name_hint)) >= 4
                and normalize_name(event_core(left.name_hint)) == normalize_name(event_core(right.name_hint))
            )
            if (min(len(a), len(b)) >= 5 and ratio >= 0.90) or same_event_core:
                duplicate_suspects.append(f"{left.type_hint}: {left.name_hint} ↔ {right.name_hint}")

    for candidate in candidates:
        if (len(normalize_name(candidate.name_hint)) <= 1 and candidate.name_hint != "帝") or (
            len(normalize_name(candidate.name_hint)) <= 2 and candidate.type_hint == "event"
        ):
            too_fine.append(f"{candidate.type_hint}: {candidate.name_hint}")
        if len(candidate.name_hint) > 24 or re.search(r"[、，,]|(?:与|及|和)", candidate.name_hint):
            too_coarse.append(f"{candidate.type_hint}: {candidate.name_hint}")
        if candidate.type_hint == "event" and not candidate.ledger_match_found:
            manual_review.append(f"事件未找到可能相关的台账记录：{candidate.name_hint}")

    return {
        "duplicate_suspects": sorted(set(duplicate_suspects)),
        "name_conflicts": sorted(set(name_conflicts)),
        "cross_type_name_conflicts": sorted(set(cross_type_name_conflicts)),
        "too_fine": sorted(set(too_fine)),
        "too_coarse": sorted(set(too_coarse)),
        "manual_review": sorted(set(manual_review)),
    }


def bullet_section(title: str, items: Iterable[str]) -> list[str]:
    values = list(items)
    lines = [f"## {title}", ""]
    if values:
        lines.extend(f"- {item}" for item in values)
    else:
        lines.append("- 未检测到。")
    lines.append("")
    return lines


def render_report(
    rows: list[dict[str, object]],
    candidates: list[Candidate],
    files: dict[str, list[Path]],
    notes: ExtractionNotes,
    campaign_root: Path,
    review_stage: str,
    review_decisions: list[str],
) -> str:
    analysis = analyze(candidates)
    counts = Counter(str(row["type_hint"]) for row in rows)
    lines = [
        "# Worldbook 候选报告",
        "",
        "> 本报告由结构化提取脚本生成。候选不是 canonical 正文，所有条目均需人工审核。",
        "",
        f"> candidate_stage: {review_stage}",
        "",
        "## 候选总数",
        "",
        f"**{len(rows)}**",
        "",
        "## 按 type_hint 统计",
        "",
        "| type_hint | 数量 |",
        "| --- | ---: |",
    ]
    for type_name in TYPE_ORDER:
        lines.append(f"| {type_name} | {counts[type_name]} |")
    lines.extend(["", "## coverage_confidence", "", f"- Campaign root: `{campaign_root}`"])
    for name in (*KNOWN_NAMES, "current_state.md"):
        paths = files.get(name, [])
        if paths:
            lines.append(f"- `{name}`: {len(paths)} 个文件")
        else:
            lines.append(f"- `{name}`: 缺失")
    lines.append("- setting / character references: high（结构化参考资料可用）")
    lines.append("- event coverage: partial（仅覆盖已有事件台账与剧情分段目录的阶段）")
    lines.extend(["", "## 候选清单", "", "| candidate_id | name_hint | type_hint | source |", "| --- | --- | --- | --- |"]) 
    for row in rows:
        refs = row["source_refs"]
        assert isinstance(refs, list)
        source_text = "<br>".join(
            f"`{ref['document']}` — {ref['reference']}" for ref in refs if isinstance(ref, dict)
        )
        lines.append(f"| {row['candidate_id']} | {row['name_hint']} | {row['type_hint']} | {source_text} |")
    lines.append("")
    lines.extend(bullet_section("duplicate_suspects", analysis["duplicate_suspects"]))
    lines.extend(bullet_section("name_conflicts", analysis["name_conflicts"]))
    lines.extend(bullet_section("cross_type_name_conflicts", analysis["cross_type_name_conflicts"]))
    lines.extend(bullet_section("manually_added_candidates", notes.manually_added))
    alias_review = [
        f"{candidate.type_hint}: {candidate.name_hint} — {note}"
        for candidate in sorted(candidates, key=candidate_sort_key)
        for note in sorted(candidate.alias_requires_review)
    ]
    lines.extend(bullet_section("alias_requires_review", alias_review))
    lines.extend(bullet_section("unresolved_event_coverage", notes.unresolved_event_coverage))
    special_candidates = [
        f"{candidate.type_hint}: {candidate.name_hint}"
        for candidate in sorted(candidates, key=candidate_sort_key)
        if candidate.canon_layer_hint == "special_interlude"
    ]
    lines.extend(bullet_section("special_interlude_candidates", special_candidates))
    lines.extend(bullet_section("review_decisions", review_decisions))
    lines.extend(bullet_section("无法确定分类的项目", notes.unclassified))
    lines.extend(bullet_section("可能过细的候选", analysis["too_fine"]))
    lines.extend(bullet_section("可能过粗的候选", analysis["too_coarse"]))
    review_items = [
        *analysis["manual_review"],
        *(f"Special Interlude 来源：{item}" for item in notes.special_interlude_sources),
        *(f"缺失预期资料：{item}" for item in notes.missing),
        *(f"unresolved event coverage：{item}" for item in notes.unresolved_event_coverage),
    ]
    lines.extend(bullet_section("建议人工重点审核的条目", review_items))
    lines.extend(
        [
            "## 提取边界",
            "",
            "- 未对 `posts.jsonl` 或 `posts.md` 进行全文实体抽取。",
            "- 未生成候选 `content`，也未生成 `output/worldbook_source.jsonl`。",
            "- `current_state.md` 只用于两项明确的续跑锚点，不做机械拆分。",
            "- 近似名称与字符串包含只进入 alias review，不自动合并；跨类型同名只报告，不自动裁决。",
            "- ledger_match_found 只表示找到可能相关的台账记录，不等价于事件已验证。",
            "",
        ]
    )
    return "\n".join(lines)


def ensure_safe_candidate_write(
    path: Path, expected_content: str, *, allow_config_refresh: bool = False
) -> bool:
    """Return True for an exact no-op and protect every human-reviewed field.

    A config refresh may replace only pending generated rows (and derived IDs).
    Every reviewed row must still be present and byte-equivalent as structured
    data after excluding its generated candidate_id.
    """
    if not path.exists():
        return False
    try:
        existing_content = path.read_text(encoding="utf-8-sig")
        rows = [json.loads(line) for line in existing_content.splitlines() if line.strip()]
    except (OSError, json.JSONDecodeError) as exc:
        raise ReviewedCandidatesError(f"existing candidate file is unreadable; refusing overwrite: {exc}") from exc
    reviewed = [row.get("candidate_id", "<unknown>") for row in rows if row.get("review_status") != "pending"]
    if reviewed:
        if existing_content == expected_content:
            return True
        if allow_config_refresh:
            expected_rows = [json.loads(line) for line in expected_content.splitlines() if line.strip()]
            expected_by_identity = {
                (row.get("type_hint"), row.get("name_hint"), row.get("canon_layer_hint")): row
                for row in expected_rows
            }
            for row in rows:
                if row.get("review_status") == "pending":
                    continue
                identity = (row.get("type_hint"), row.get("name_hint"), row.get("canon_layer_hint"))
                expected = expected_by_identity.get(identity)
                existing_fields = {key: value for key, value in row.items() if key != "candidate_id"}
                expected_fields = (
                    {key: value for key, value in expected.items() if key != "candidate_id"}
                    if expected is not None
                    else None
                )
                if expected_fields != existing_fields:
                    raise ReviewedCandidatesError(
                        "reviewed row differs from review config; refusing refresh: "
                        + str(row.get("candidate_id", "<unknown>"))
                    )
            return False
        raise ReviewedCandidatesError(
            "existing candidate file contains reviewed rows; refusing overwrite: " + ", ".join(reviewed)
        )
    return False


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    handle = tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", newline="\n", delete=False, dir=path.parent, prefix=path.name + ".", suffix=".tmp"
    )
    try:
        with handle:
            handle.write(content)
        os.replace(handle.name, path)
    except Exception:
        try:
            os.unlink(handle.name)
        except OSError:
            pass
        raise


def build_parser() -> argparse.ArgumentParser:
    default_project = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", type=Path, default=default_project)
    parser.add_argument("--campaign-root", type=Path)
    parser.add_argument(
        "--refresh-reviewed-from-config",
        action="store_true",
        help="refresh generated pending rows only when all reviewed row fields still match config-derived output",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    project_root = args.project_root.resolve()
    campaign_root = (args.campaign_root.resolve() if args.campaign_root else detect_campaign_root(project_root))
    candidate_path = project_root / "work" / "candidates.jsonl"
    report_path = project_root / "work" / "candidate_report.md"

    try:
        files, notes = discover_files(campaign_root, project_root)
        manual_candidates = load_manual_candidates(project_root, campaign_root)
        alias_evidence = load_alias_evidence(project_root, campaign_root)
        review = load_review_decisions(project_root)
        candidates = extract_candidates(files, campaign_root, notes, manual_candidates)
        apply_alias_evidence(candidates, alias_evidence)
        annotate_alias_review(candidates)
        review_lines = apply_review_decisions(candidates, review)
        rows = serialize_candidates(candidates)
        candidate_text = "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows)
        report_text = render_report(
            rows,
            candidates,
            files,
            notes,
            campaign_root,
            str(review.get("stage", "candidate")),
            review_lines,
        )
        exact_reviewed_noop = ensure_safe_candidate_write(
            candidate_path,
            candidate_text,
            allow_config_refresh=args.refresh_reviewed_from_config,
        )
        if not exact_reviewed_noop:
            atomic_write(candidate_path, candidate_text)
        atomic_write(report_path, report_text)
    except ReviewedCandidatesError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    except (OSError, UnicodeError, ValueError) as exc:
        print(f"ERROR: extraction failed: {exc}", file=sys.stderr)
        return 1

    print(f"Generated {len(rows)} candidate(s): {candidate_path}")
    print(f"Report: {report_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
