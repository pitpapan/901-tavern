#!/usr/bin/env python3
"""Build the Chinese-first HAP-0-R human profile approval package."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[1]
R2C = ROOT / "work" / "phase3d_r2c"
CANDIDATES = R2C / "candidates" / "by_profile"
PACKAGES = R2C / "migration_packages"
LINEAGE = R2C / "migration" / "r1a2b_realization_lineage.jsonl"
AMENDMENT = ROOT / "work" / "remediation" / "r1a_fix1" / "high_risk_reroute_amendments.jsonl"

EXPECTED_PRODUCTION_FILES = 140
EXPECTED_PRODUCTION_HASH = "cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3"
EXPECTED_AMENDMENT_HASH = "b6e3e29da8aa3f7a9f4c22c931fed2c84c56b414e6fac9d59a691f1786724817"
APPENDIX_HEADING = "# 附录：证据与技术索引"

EXTERNAL_NAME_ZH = {
    "CHARACTER_OUGI": "欧基",
    "NPC_OUGI": "欧基",
    "NPC_LI_PINGSHENG": "李萍生",
    "NPC_YI_LENG": "易冷",
}


RELATIONSHIP_BASELINE_ZH = {
    "adversarial negotiation": "曾处于对立立场并进行交涉。",
    "battle adversary": "曾在战斗中互为对手。",
    "battle protector and elder": "曾在战斗中提供保护的龙族长辈。",
    "campaign companion": "主线旅程中的同行者。",
    "commander and subordinate": "曾有明确的指挥者与部属关系。",
    "craft and equipment support history": "有过工艺与装备支援方面的往来。",
    "engagement planner and elder": "曾参与订婚安排的长辈。",
    "father": "父亲。",
    "granddaughter": "孙女。",
    "guardian and travelling companion": "监护者与同行者。",
    "historical and final-war adversary": "历史上及最终战争中的对手。",
    "imperial examiner and mission authority": "帝国考核者及任务授权者。",
    "life-saving bond and bereavement continuity": "有救命之恩及与丧失相关的历史联系。",
    "longstanding friend and alliance co-planner": "多年好友，并共同参与联盟规划。",
    "longstanding friend and coordinator": "多年好友，并承担协调关系。",
    "mutual life-saving history": "双方之间有明确的相互救助经历。",
    "recognized dragon elder": "被承认为龙族长辈。",
    "rescuer and enduring deceased relation": "历史上的救命者；对方后来死亡，这段关系只按已发生事实保留。",
    "shared curse-investigation history": "共同经历过与诅咒调查有关的事件。",
    "siblings": "兄弟姐妹关系。",
    "son": "儿子。",
    "sovereign and imperial subordinate": "君主与帝国部属关系。",
    "traveling companion and magic adviser": "旅行同伴与魔法顾问。",
    "ward and travelling companion": "受监护者与同行者。",
}

KNOWLEDGE_ZH = {
    "KNOWS": "明确知道",
    "BELIEVES": "相信",
    "SUSPECTS": "怀疑",
    "TESTIMONY_HEARD": "听取证言",
    "THEORY": "理论推断",
    "RUMOR": "传闻",
    "MISCONCEPTION": "曾持有的错误认知",
}

PERSISTENCE_ZH = {
    "persistent": "后续仍被资料确认",
    "ended": "该状态已经结束",
    "temporary": "仅在当时短暂成立",
    "unknown": "是否持续到故事结束没有被确认",
    "historical_only": "只作为历史状态保留",
}

LIFE_ZH = {
    "alive": "资料确认其仍然存活。",
    "deceased": "资料确认其已经死亡。",
}

STAGE_HEADINGS = {
    "P1": "故事早期：相遇、调查与帝都经历",
    "P2": "故事中期：帝国局势与龙族相关事件",
    "P3": "故事后期：命运揭示与最终冲突",
    "TRANSITION": "龙族秘境毁灭后的过渡期",
    "INTERLUDE": "特殊幕间：与主世界当前连续性隔离",
    "OTHER": "其他已确认经历",
}

BATCHES = [
    (
        "第一批：核心关系与 PC",
        "本批重点检查 PC 控制边界、悠悠与御临风的订婚/关系边界、后期关系变化，以及安兹和白色魔法使相关事件是否被错误延伸为长期义务。",
        ["PC_YU_LINFENG", "NPC_YOUYOU", "NPC_XIERLUN_VON_GILCODE", "NPC_OSHIRA", "NPC_WHITE_MAGICIAN", "NPC_AINZ_OOAL_GOWN"],
    ),
    (
        "第二批：早期旅程与帝国人物",
        "本批重点检查早期同行、帝国身份、调查与战斗经历，以及人物前史与 Campaign 实际事件是否保持清楚分隔。",
        ["NPC_CASSIUS_BRIGHT", "NPC_YOMI_ISAYAMA", "NPC_ELDER_XUE", "NPC_ELLIE", "NPC_JIANG_ZIYOU", "NPC_CASSANDRA", "NPC_GREMLIN", "NPC_JERGAL", "NPC_EMPEROR"],
    ),
    (
        "第三批：龙族与后期冲突",
        "本批重点检查龙族身份、战争立场、控制与保护状态，以及传言、警告和当前状态的边界。",
        ["NPC_DEATHWING", "NPC_HONDA_KAI_FERGUS", "NPC_KENDA_KAI_FERGUS", "NPC_JEWEL_ELDER", "NPC_LEI_GUANG", "NPC_YANG", "NPC_SERTANT_LU_YOURLAN", "NPC_TOLKIEN"],
    ),
    (
        "第四批：哈克一行与同行关系",
        "本批重点检查同行、监护、主从和家人称谓的实际范围，不把历史同行自动写成当前忠诚或永久义务。",
        ["NPC_HAKU", "NPC_KUON", "NPC_LULUTIYE", "NPC_OSHUTORU", "NPC_NOSURI", "NPC_WOSIS"],
    ),
    (
        "第五批：支援人物与较小档案",
        "本批重点检查内容较少人物是否被过度概括，以及死亡、失踪、能力持续性和关系空白是否诚实保留。",
        ["NPC_MU_SHAOAI", "NPC_MU_TOU", "NPC_LINGCHI", "NPC_REN_FANZHEN", "NPC_WILLIAM", "NPC_WURAI", "NPC_ZHENZI", "NPC_ZHOU_ZHENG"],
    ),
]


@dataclass(frozen=True)
class Context:
    names: dict[str, str]
    profile_ids: frozenset[str]
    affected_profiles: frozenset[str]
    amendment: dict[str, Any]


def read_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(value, dict):
        raise ValueError(f"expected JSON object: {path}")
    return value


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def production_fingerprint(root: Path = ROOT) -> dict[str, Any]:
    production = root / "work" / "phase3d_r2c"
    rows = [
        {
            "path": path.relative_to(production).as_posix(),
            "size": path.stat().st_size,
            "sha256": sha256_file(path),
        }
        for path in sorted(production.rglob("*"))
        if path.is_file()
    ]
    payload = b"".join(
        (json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")
        for row in rows
    )
    return {"files": len(rows), "aggregate_sha256": hashlib.sha256(payload).hexdigest()}


def validate_frozen_inputs(root: Path = ROOT) -> dict[str, Any]:
    fingerprint = production_fingerprint(root)
    if fingerprint != {"files": EXPECTED_PRODUCTION_FILES, "aggregate_sha256": EXPECTED_PRODUCTION_HASH}:
        raise ValueError(f"BLOCKED_BY_PRODUCTION_DRIFT: {fingerprint}")
    amendment_path = root / AMENDMENT.relative_to(ROOT)
    actual_amendment = sha256_file(amendment_path)
    if actual_amendment != EXPECTED_AMENDMENT_HASH:
        raise ValueError(f"BLOCKED_BY_AUTHORITY_DRIFT: amendment={actual_amendment}")
    return {**fingerprint, "amendment_sha256": actual_amendment}


def load_context(root: Path = ROOT) -> Context:
    candidate_root = root / CANDIDATES.relative_to(ROOT)
    names = {}
    profile_ids = set()
    for path in sorted(candidate_root.glob("*.json")):
        candidate = read_json(path)
        names[candidate["id"]] = candidate["name"]
        profile_ids.add(candidate["id"])
    names.update(EXTERNAL_NAME_ZH)
    lineage_path = root / LINEAGE.relative_to(ROOT)
    affected = frozenset(row["profile_id"] for row in read_jsonl(lineage_path))
    amendment_rows = read_jsonl(root / AMENDMENT.relative_to(ROOT))
    if len(amendment_rows) != 1:
        raise ValueError("R1A-FIX-1 amendment authority must contain exactly one row")
    return Context(names=names, profile_ids=frozenset(profile_ids), affected_profiles=affected, amendment=amendment_rows[0])


def zh_sentence(text: str) -> str:
    text = " ".join(str(text).strip().split())
    if not text:
        return ""
    if text[-1] not in "。！？；”：’）】」』":
        text += "。"
    return text


def clean_timeline_summary(text: str) -> str:
    cleaned = re.sub(r"^角色以“[^”]+”参与；", "", text.strip())
    return zh_sentence(cleaned)


def stage_key(item: dict[str, Any]) -> str:
    order = item.get("story_order_start") or ""
    for prefix in ("P1", "P2", "P3", "TRANSITION", "INTERLUDE"):
        if order.startswith(prefix):
            return prefix
    return "OTHER"


def chunked(values: list[str], size: int) -> Iterable[list[str]]:
    for start in range(0, len(values), size):
        yield values[start : start + size]


def join_chronological(sentences: list[str]) -> str:
    if not sentences:
        return ""
    output = sentences[0]
    for sentence in sentences[1:]:
        output += "随后，" + sentence
    return output


def relationship_baseline_zh(value: str) -> str:
    if re.search(r"[\u3400-\u9fff]", value):
        return zh_sentence(value)
    if value not in RELATIONSHIP_BASELINE_ZH:
        raise ValueError(f"untranslated relationship baseline: {value}")
    return RELATIONSHIP_BASELINE_ZH[value]


def statements(candidate: dict[str, Any], *paths: str) -> list[str]:
    values: list[str] = []
    for path in paths:
        current: Any = candidate
        for part in path.split("."):
            current = current.get(part, {}) if isinstance(current, dict) else {}
        if isinstance(current, list):
            values.extend(zh_sentence(item.get("statement", "")) for item in current if isinstance(item, dict))
    return [value for value in values if value]


def render_overview(candidate: dict[str, Any]) -> str:
    facts = statements(
        candidate,
        "identity.public_identity",
        "identity.species_or_entity",
        "identity.durable_roles",
        "identity.durable_affiliations",
    )
    if candidate.get("biographical_background"):
        facts.append(zh_sentence(candidate["biographical_background"][0].get("statement", "")))
    active_events = [
        item for item in candidate.get("campaign_timeline", [])
        if item.get("role_in_event") != "indirect continuity subject"
    ]
    if not active_events:
        active_events = candidate.get("campaign_timeline", [])
    if active_events:
        chosen = [active_events[0]]
        if len(active_events) >= 4 and candidate.get("profile_depth") == "full":
            chosen.append(active_events[len(active_events) // 2])
        if len(active_events) > 1:
            chosen.append(active_events[-1])
        seen = set()
        for item in chosen:
            summary = clean_timeline_summary(item.get("character_specific_summary", ""))
            if summary and summary not in seen:
                facts.append(summary)
                seen.add(summary)
    gap = next(iter(candidate.get("evidence_gaps", [])), None)
    if gap:
        facts.append("仍需保留的边界是：" + zh_sentence(gap))
    if not facts:
        return f"现有档案只确认{name_of(candidate)}被纳入人物连续性记录，尚无足够资料形成更完整概览。"
    target = 560 if candidate.get("profile_depth") == "full" else 300
    selected: list[str] = []
    length = 0
    for fact in facts:
        if selected and length + len(fact) > target:
            break
        selected.append(fact)
        length += len(fact)
    return "".join(selected)


def name_of(candidate: dict[str, Any]) -> str:
    return candidate.get("name") or candidate["id"]


def render_background(candidate: dict[str, Any]) -> str:
    items = candidate.get("biographical_background", [])
    if not items:
        return "现有档案没有把任何主线开始前的事实单独确认为人物前史；这不等于人物没有过去，只表示没有足够资料可在此确认。"
    paragraphs = []
    for item in items:
        prefix = ""
        uncertainty = item.get("uncertainty")
        if uncertainty == "uncertain":
            prefix = "现有资料把以下内容保留为尚未完全确认的前史："
        elif uncertainty in {"rumor", "character_belief"}:
            prefix = "以下内容仅按传闻或角色说法保留："
        paragraphs.append(prefix + zh_sentence(item.get("statement", "")))
    return "\n\n".join(paragraphs)


def render_timeline(candidate: dict[str, Any]) -> str:
    grouped: dict[str, list[dict[str, Any]]] = {key: [] for key in STAGE_HEADINGS}
    for item in candidate.get("campaign_timeline", []):
        grouped[stage_key(item)].append(item)
    sections: list[str] = []
    for key in ("P1", "P2", "P3", "TRANSITION", "INTERLUDE", "OTHER"):
        all_items = grouped[key]
        if not all_items:
            continue
        direct = [item for item in all_items if item.get("role_in_event") != "indirect continuity subject"]
        omitted = len(all_items) - len(direct)
        if not direct:
            direct = all_items
            omitted = 0
        sentences = [clean_timeline_summary(item.get("character_specific_summary", "")) for item in direct]
        sentences = [sentence for sentence in sentences if sentence]
        paragraphs = []
        size = 5 if candidate["id"] == "PC_YU_LINFENG" else 3
        for group in chunked(sentences, size):
            paragraphs.append(join_chronological(group))
        if key == "INTERLUDE":
            paragraphs.insert(0, "以下经历属于特殊幕间材料，不自动进入普通主世界的当前事实。")
        if omitted:
            paragraphs.append(f"另有 {omitted} 项仅作为间接连续性关联保留，正文不展开场景细节；其事件索引仍完整列于附录。")
        sections.append(f"### {STAGE_HEADINGS[key]}\n\n" + "\n\n".join(paragraphs))
    if not sections:
        return "现有档案没有确认该人物直接参与的主线事件。"
    text = "\n\n".join(sections)
    if candidate["id"] == "NPC_AINZ_OOAL_GOWN":
        text += (
            "\n\n### 龙族秘境中的谈判与介入\n\n"
            "安兹在龙族秘境相关剧情中实际参与了谈判与介入，并在之后的冲突中公开宣称两位龙王受到其名义保护。"
            "这些都是 Campaign 期间实际发生的事情，并非人物前史。现有资料没有确认这一保护宣言在故事结束后仍然构成长期、无限期的义务。"
        )
    return text


def render_persona(candidate: dict[str, Any]) -> str:
    persona = candidate.get("persona", {})
    groups = [
        ("核心性格", persona.get("core_personality", [])),
        ("价值取向", persona.get("values", [])),
        ("行事特点", persona.get("decision_patterns", [])),
        ("动机记录", persona.get("motivations", [])),
        ("说话方式", persona.get("speech_style", [])),
    ]
    rendered = []
    for title, items in groups:
        if not items:
            continue
        body = "".join(zh_sentence(item.get("statement", "")) for item in items)
        uncertain = any(item.get("uncertainty") != "confirmed" for item in items)
        if uncertain:
            body += "其中带有不确定标记的描述只在现有证据范围内成立，不应扩展为一贯人格。"
        rendered.append(f"### {title}\n\n{body}")
    if not rendered:
        return "现有档案没有足够、稳定的证据来概括其人格或价值体系；不能从单次行为自动推出普遍性格。"
    return "\n\n".join(rendered)


def relationship_target_name(relation: dict[str, Any], context: Context) -> str:
    target_ref = relation.get("related_character_ref")
    target_label = relation.get("related_character_label")
    if target_ref in context.names:
        return context.names[target_ref]
    if target_label in context.names:
        return context.names[target_label]
    return target_label or target_ref or "未标明对象"


def render_relationships(candidate: dict[str, Any], context: Context) -> str:
    relationships = candidate.get("relationships", [])
    if not relationships:
        return "现有档案没有建立需要单独审批的核心人物关系。"
    output = []
    grouped: dict[str, list[dict[str, Any]]] = {}
    for relation in relationships:
        grouped.setdefault(relationship_target_name(relation, context), []).append(relation)
    for target, target_relations in grouped.items():
        paragraphs = []
        if len(target_relations) > 1:
            paragraphs.append(f"档案分别保留了 {len(target_relations)} 个关系侧面；下列基础各自保留，不合并成新的关系结论。")
        for index, relation in enumerate(target_relations, start=1):
            suffix = f"（记录{index}）" if len(target_relations) > 1 else ""
            baseline = relationship_baseline_zh(relation.get("relationship_baseline", ""))
            paragraphs.append(f"关系基础{suffix}：{baseline}")
            milestones = [zh_sentence(item.get("change", "")) for item in relation.get("relationship_milestones", [])]
            milestones = [item for item in milestones if item]
            if milestones:
                history = []
                for group in chunked(milestones, 3):
                    history.append(join_chronological(group))
                paragraphs.append(f"故事中的变化{suffix}：" + "\n\n".join(history))
            elif len(target_relations) == 1:
                paragraphs.append("故事中的变化：现有档案没有在这个关系条目下确认额外变化。")
        paragraphs.append("已确认到什么程度：上述关系只在所列历史事实和明确变化范围内成立。")
        stances = [relation.get("current_stance") for relation in target_relations]
        if all(stance is None for stance in stances):
            paragraphs.append("当前关系立场：未确认。这不等于中立、疏远、没有感情或仍然亲密。")
        else:
            established = [zh_sentence(str(stance)) for stance in stances if stance is not None]
            paragraphs.append("当前关系立场：" + "".join(established))
        target_refs = {relation.get("related_character_ref") for relation in target_relations}
        if candidate["id"] in {"NPC_YOUYOU", "PC_YU_LINFENG"} and ({"NPC_YOUYOU", "PC_YU_LINFENG"} - {candidate["id"]}) & target_refs:
            paragraphs.append(
                "订婚安排的边界：这一安排具有当时的保护和政治背景，现有资料保留悠悠之后自行选择的空间，"
                "不能自动解释为永久婚约或确定的最终感情关系。"
            )
        output.append(f"### 与{target}\n\n" + "\n\n".join(paragraphs))
    return "\n\n".join(output)


def render_knowledge(candidate: dict[str, Any]) -> str:
    items = candidate.get("knowledge_timeline", [])
    if not items:
        return "现有档案没有需要单独审批的知识、认知或传闻条目。"
    paragraphs = []
    for item in items:
        status = item.get("epistemic_status")
        if status not in KNOWLEDGE_ZH:
            raise ValueError(f"untranslated epistemic status: {status}")
        paragraph = f"{KNOWLEDGE_ZH[status]}：{zh_sentence(item.get('proposition', ''))}"
        if item.get("valid_until"):
            paragraph += "该信息只在档案标明的历史阶段内构成有效知识；之后不能自动视为其当前仍然知道。"
        if item.get("uncertainty") in {"uncertain", "rumor", "character_belief"}:
            paragraph += "这里保留的是人物的认知位置，不把命题内容升级为世界客观事实。"
        paragraphs.append(paragraph)
    return "\n\n".join(paragraphs)


def render_abilities(candidate: dict[str, Any]) -> str:
    items = candidate.get("ability_status_transitions", [])
    if not items:
        return "现有档案没有记录需要单独审批的能力、装备或状态变化。"
    paragraphs = []
    for item in items:
        persistence = item.get("persistence")
        if persistence not in PERSISTENCE_ZH:
            raise ValueError(f"untranslated persistence: {persistence}")
        before = item.get("before_state")
        after = item.get("after_state")
        if before:
            body = f"状态由“{before}”变为“{after}”。"
        else:
            body = f"此前状态没有被确认；档案记录其后变为“{after}”。"
        paragraphs.append(body + f"持续性：{PERSISTENCE_ZH[persistence]}。")
    return "\n\n".join(paragraphs)


def render_current_state(candidate: dict[str, Any]) -> str:
    confirmed: list[str] = []
    presence = candidate.get("presence", {})
    life = presence.get("life_status")
    if life in LIFE_ZH and presence.get("uncertainty") == "confirmed":
        confirmed.append(LIFE_ZH[life])
    for item in candidate.get("ability_status_transitions", []):
        if item.get("persistence") == "persistent":
            confirmed.append("持续状态：" + zh_sentence(item.get("after_state", "")))
    goals = candidate.get("goals", {}).get("current_goals", [])
    for goal in goals:
        confirmed.append("当前目标：" + zh_sentence(goal.get("statement", "")))
    dynamic = candidate.get("dynamic_state", {})
    if dynamic.get("current_location_ref"):
        confirmed.append("当前位置：" + zh_sentence(dynamic["current_location_ref"]))
    if dynamic.get("current_faction_role"):
        confirmed.append("当前阵营职责：" + zh_sentence(dynamic["current_faction_role"]))
    for field, label in (("current_conditions", "当前状态"), ("current_obligations", "当前义务"), ("current_concerns", "当前关注")):
        for value in dynamic.get(field, []):
            text = value.get("statement", "") if isinstance(value, dict) else str(value)
            confirmed.append(f"{label}：{zh_sentence(text)}")
    if not confirmed:
        return "除本档案其他章节已经明确列出的历史事实外，现有资料没有提供可安全扩展的当前人物状态。"
    return "\n\n".join(confirmed)


def unknown_items(candidate: dict[str, Any], context: Context) -> list[str]:
    items = [zh_sentence(value) for value in candidate.get("evidence_gaps", [])]
    presence = candidate.get("presence", {})
    if presence.get("life_status") == "unknown":
        items.append("当前生死状态未确认。")
    for relation in candidate.get("relationships", []):
        if relation.get("current_stance") is None:
            target = relationship_target_name(relation, context)
            items.append(f"与{target}的当前关系立场未确认；不能从历史经历推出当前情感、忠诚或义务。")
    for transition in candidate.get("ability_status_transitions", []):
        if transition.get("persistence") == "unknown":
            items.append(f"“{transition.get('after_state')}”是否持续到故事结束没有被确认。")
    if candidate.get("dynamic_state", {}).get("current_location_ref") is None:
        items.append("若没有其他明确定位资料，不能自动补写当前所在位置。")
    deduped = []
    seen = set()
    for item in items:
        if item and item not in seen:
            deduped.append(item)
            seen.add(item)
    return deduped


def render_unknowns(candidate: dict[str, Any], context: Context) -> str:
    items = unknown_items(candidate, context)
    if not items:
        return "- 现有档案没有列出额外未知项；这不授权从沉默处补写人物事实。"
    return "\n".join(f"- {item}" for item in items)


def remediation_categories(package: dict[str, Any]) -> set[str]:
    categories = set()
    for migration in package.get("old_claim_migrations", []):
        if not any("work/remediation/" in ref for ref in migration.get("supporting_refs", [])):
            continue
        for destination in migration.get("destination_ids", []):
            if destination.startswith("TIMELINE_"):
                categories.add("timeline")
            elif destination.startswith(("RELATIONSHIP_", "MILESTONE_")):
                categories.add("relationship")
            elif destination.startswith("KNOWLEDGE_"):
                categories.add("knowledge")
            elif destination.startswith("TRANSITION_"):
                categories.add("ability")
            elif destination.startswith(("IDENTITY_", "PERSONA_", "BACKGROUND_")):
                categories.add("profile")
    return categories


def render_remediation(candidate: dict[str, Any], package: dict[str, Any], context: Context) -> str | None:
    profile_id = candidate["id"]
    if profile_id not in context.affected_profiles:
        return None
    paragraphs = []
    categories = remediation_categories(package)
    if "timeline" in categories:
        paragraphs.append("此前容易混入人物背景的主线经历，现已放回故事实际发生的阶段，不再把 Campaign 事件当作前史。")
    if "relationship" in categories:
        paragraphs.append("关系内容已按明确的关系基础与具体变化分开呈现，不从历史节点推导当前情感、忠诚、义务或未来选择。")
    if "knowledge" in categories:
        paragraphs.append("人物听闻、相信、怀疑或推断的内容已与世界客观事实分开，认知状态没有被强化。")
    if "ability" in categories:
        paragraphs.append("能力和状态变化现已注明发生前后及持续性；没有证据时不再默认永久保有。")
    if "profile" in categories:
        paragraphs.append("身份、人格或背景陈述已按原有证据类型归位，单次行为不会被自动扩展为一贯人格。")
    if profile_id == "NPC_AINZ_OOAL_GOWN":
        paragraphs.append("安兹在龙族秘境中的谈判、介入和保护宣言现被还原为剧情中实际发生的事件；没有据此生成故事结束后的无限期保护义务。")
    if profile_id == "NPC_YOUYOU":
        paragraphs.append("此前一个关系条目把四个不同时期的关系变化合并成一个背景项目。修复后，它被四个具体剧情节点取代，不再被误读为人物前史或永久关系状态。")
    return "\n\n".join(paragraphs or ["本轮修复只调整了既有语义的呈现位置，没有为人物增加新事实。"])


def review_focus(candidate: dict[str, Any], context: Context) -> list[str]:
    points: list[str] = []
    profile_id = candidate["id"]
    if profile_id in {"NPC_YOUYOU", "PC_YU_LINFENG"}:
        points.append("你是否认可订婚安排只作为当时的保护/政治安排，并继续保留悠悠日后选择的空间？")
    if profile_id == "NPC_AINZ_OOAL_GOWN":
        points.append("安兹的保护宣言是否应继续限定为剧情中发生的公开表态，而不推导长期无限义务？")
    if profile_id == "PC_YU_LINFENG":
        points.append("这些历史事实是否准确，同时没有替你决定御临风的当前感情、私密思想或未来行动？")
    for relation in candidate.get("relationships", []):
        if relation.get("current_stance") is None:
            target = relationship_target_name(relation, context)
            points.append(f"你是否认可与{target}的历史关系，同时把当前关系立场保留为未确认？")
    for gap in candidate.get("evidence_gaps", []):
        points.append("这项未知边界是否符合你的记忆：" + gap)
    for knowledge in candidate.get("knowledge_timeline", []):
        if knowledge.get("epistemic_status") != "KNOWS" or knowledge.get("uncertainty") != "confirmed":
            points.append("这里对传闻、证言、相信或怀疑的区分是否准确，没有把人物认知写成客观事实？")
            break
    for transition in candidate.get("ability_status_transitions", []):
        if transition.get("persistence") == "unknown":
            points.append("标为“持续性未知”的能力或状态，是否确实没有后续资料可以确认？")
            break
    if not points:
        points.append("这份档案是否准确抓住了人物的主要身份和经历，没有遗漏关键转折？")
    deduped = []
    for point in points:
        if point not in deduped:
            deduped.append(point)
    return deduped[:8]


def recursive_strings_for_keys(value: Any, keys: set[str]) -> set[str]:
    found: set[str] = set()
    if isinstance(value, dict):
        for key, child in value.items():
            if key in keys:
                if isinstance(child, str) and child:
                    found.add(child)
                elif isinstance(child, list):
                    found.update(item for item in child if isinstance(item, str) and item)
            found.update(recursive_strings_for_keys(child, keys))
    elif isinstance(value, list):
        for child in value:
            found.update(recursive_strings_for_keys(child, keys))
    return found


def render_appendix(candidate: dict[str, Any], package: dict[str, Any], context: Context) -> str:
    event_ids = sorted(recursive_strings_for_keys(candidate, {
        "event_ref", "event_refs", "related_event_refs", "supporting_event_refs",
        "acquired_at_event_ref", "valid_from_event_ref", "valid_until_event_ref",
    }))
    claim_ids = sorted(migration["old_claim_id"] for migration in package.get("old_claim_migrations", []))
    destination_ids = sorted({
        destination
        for migration in package.get("old_claim_migrations", [])
        for destination in migration.get("destination_ids", [])
    })
    source_refs = recursive_strings_for_keys(candidate, {"source_refs", "evidence_refs", "provenance"})
    source_refs.update(recursive_strings_for_keys(package, {"source_refs", "evidence_refs", "supporting_refs", "provenance"}))
    relationship_ids = sorted(recursive_strings_for_keys(candidate, {"relationship_id", "milestone_id"}))
    technical_ids = sorted(recursive_strings_for_keys(candidate, {
        "background_id", "identity_id", "persona_id", "transition_id", "knowledge_id", "goal_id", "timeline_id",
    }))

    def list_block(title: str, values: Iterable[str]) -> str:
        values = list(values)
        body = "\n".join(f"- `{value}`" for value in values) if values else "- 无"
        return f"## {title}\n\n{body}"

    sections = [
        f"人物：{candidate['name']}\n\nProfile：`{candidate['id']}`\n\n类型：{'PC continuity' if candidate['profile_kind'] == 'pc_continuity' else 'NPC'}",
        list_block("相关剧情事件", event_ids),
        list_block("相关旧 Claim", claim_ids),
        list_block("有效迁移目标", destination_ids),
        list_block("关系与其他对象索引", relationship_ids + technical_ids),
        list_block("来源", sorted(source_refs)),
    ]
    if candidate["id"] in context.affected_profiles:
        sections.append("## R1A 修复 lineage\n\n- 本人物包含经 R1A 审定的重路由或类型化 realization；正文按最终 repaired production 投影。")
    if candidate["id"] == "NPC_YOUYOU":
        sections.append(
            "## R1A-FIX-1 说明\n\n"
            "- 旧聚合条目已退役，由四个具体剧情节点取代。\n"
            "- 已退役 ID：`MILESTONE_YOUYOU_YU_LATE_MILESTONES`。\n"
            f"- Amendment：`{EXPECTED_AMENDMENT_HASH}`。"
        )
    return "\n\n".join(sections)


def render_profile(candidate: dict[str, Any], package: dict[str, Any], context: Context) -> str:
    if candidate["id"] != package["profile_id"]:
        raise ValueError("candidate/package profile mismatch")
    sections = [
        f"# {candidate['name']}",
        "## 一、人物概览\n\n" + render_overview(candidate),
        "## 二、已确认的背景与过去\n\n" + render_background(candidate),
        "## 三、故事中的主要经历\n\n" + render_timeline(candidate),
        "## 四、人格与价值观\n\n" + render_persona(candidate),
        "## 五、核心人物关系\n\n" + render_relationships(candidate, context),
        "## 六、知识、认知与传闻\n\n" + render_knowledge(candidate),
        "## 七、能力、装备与状态\n\n" + render_abilities(candidate),
        "## 八、当前可确认状态\n\n" + render_current_state(candidate),
        "## 九、仍然未知或不能直接推断的事项\n\n" + render_unknowns(candidate, context),
    ]
    if candidate["id"] == "PC_YU_LINFENG":
        sections.append(
            "## PC 控制边界\n\n"
            "本档案只保存已经发生并有来源支持的历史行动、外部后果、关系节点和知识边界。"
            "它不会替玩家决定私密思想、感情、未来选择、永久承诺或尚未作出的行动；也不会授权系统自行替御临风说话或选择自愿行动。"
        )
    remediation = render_remediation(candidate, package, context)
    if remediation:
        sections.append("## 本轮修复后发生的主要变化\n\n" + remediation)
    focus = "\n".join(f"- {point}" for point in review_focus(candidate, context))
    sections.extend([
        "## 人工审核建议重点\n\n" + focus,
        "## 人工决定\n\n□ 通过\n\n□ 基本通过，仅需文字调整  \n说明：\n\n□ 有语义错误，需要修改  \n说明：\n\n□ 我需要查看原始资料后再决定  \n说明：",
        "---\n\n" + APPENDIX_HEADING + "\n\n" + render_appendix(candidate, package, context),
    ])
    text = "\n\n".join(sections).rstrip() + "\n"
    audit = audit_profile_markdown(text)
    if audit["issues"]:
        raise ValueError(f"readability audit failed for {candidate['id']}: {audit['issues']}")
    return text


def split_main_and_appendix(text: str) -> tuple[str, str]:
    marker = "\n---\n\n" + APPENDIX_HEADING
    if marker not in text:
        raise ValueError("missing technical appendix boundary")
    main, appendix = text.split(marker, 1)
    return main, APPENDIX_HEADING + appendix


def audit_profile_markdown(text: str) -> dict[str, Any]:
    main, _ = split_main_and_appendix(text)
    issues: list[str] = []
    event_headings = len(re.findall(r"(?m)^#{1,6}\s+.*EVENT_", main))
    claim_headings = len(re.findall(r"(?m)^#{1,6}\s+.*CLAIM_", main))
    if event_headings:
        issues.append("event_id_heading")
    if claim_headings:
        issues.append("claim_id_heading")
    if re.search(r"(?m)^\s*\{\s*$|```json|\"schema_version\"\s*:", main):
        issues.append("raw_schema_dump")
    forbidden_enums = [
        "BIOGRAPHICAL_BACKGROUND", "ACTUAL_EVENT", "PERSISTENT_STATE",
        "REVIEWED_TYPED_PAYLOAD_REQUIRED", "REUSE_R2A_EVENT", "MOVED_TO_BACKGROUND",
    ]
    if any(value in main for value in forbidden_enums):
        issues.append("untranslated_internal_enum")
    if "current_stance = null" in main or re.search(r"current_stance\s*:\s*null", main):
        issues.append("raw_null_stance")
    if re.search(r"(?m)^#{1,6}\s+(EVENT_|CLAIM_)", main):
        issues.append("technical_heading")
    return {
        "issues": issues,
        "event_id_headings": event_headings,
        "claim_id_headings": claim_headings,
        "raw_schema_dumps": int("raw_schema_dump" in issues),
        "untranslated_internal_enum_issues": int("untranslated_internal_enum" in issues),
    }


def semantic_consistency(candidate: dict[str, Any], package: dict[str, Any], text: str, context: Context) -> dict[str, int]:
    main, appendix = split_main_and_appendix(text)
    expected_events = recursive_strings_for_keys(candidate, {
        "event_ref", "event_refs", "related_event_refs", "supporting_event_refs",
        "acquired_at_event_ref", "valid_from_event_ref", "valid_until_event_ref",
    })
    expected_claims = {row["old_claim_id"] for row in package.get("old_claim_migrations", [])}
    expected_destinations = {dest for row in package.get("old_claim_migrations", []) for dest in row.get("destination_ids", [])}
    missing_ids = [value for value in expected_events | expected_claims | expected_destinations if value not in appendix]
    relationship_mismatches = 0
    for relation in candidate.get("relationships", []):
        target = relationship_target_name(relation, context)
        if f"### 与{target}" not in main or relationship_baseline_zh(relation["relationship_baseline"]) not in main:
            relationship_mismatches += 1
        for milestone in relation.get("relationship_milestones", []):
            if milestone.get("change") not in main:
                relationship_mismatches += 1
    knowledge_mismatches = 0
    for item in candidate.get("knowledge_timeline", []):
        status = KNOWLEDGE_ZH.get(item.get("epistemic_status"))
        if not status or item.get("proposition") not in main or f"{status}：" not in main:
            knowledge_mismatches += 1
    pc_mismatches = 0
    if candidate["id"] == "PC_YU_LINFENG":
        permissions = candidate.get("ai_permissions", {})
        required_false = ("may_assign_new_goals", "may_choose_voluntary_actions", "may_generate_dialogue", "may_generate_private_thoughts")
        if any(permissions.get(key) is not False for key in required_false) or "## PC 控制边界" not in main:
            pc_mismatches += 1
    return {
        "semantic_mismatches": len(missing_ids),
        "relationship_mismatches": relationship_mismatches,
        "knowledge_status_mismatches": knowledge_mismatches,
        "pc_control_mismatches": pc_mismatches,
    }


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def render_index(rows: list[dict[str, Any]]) -> str:
    lines = [
        "# R1A 关闭后人物连续性审批索引",
        "",
        "本索引以人物中文名为主要入口。所有档案均对应已关闭的 R1A production；审批 Markdown 只是可读投影，不是新的语义 authority。审批状态由人工填写。",
        "",
        "| 人物 | 类型 | R1A 是否涉及 | 主要审核重点 | 审批状态 |",
        "| --- | --- | --- | --- | --- |",
    ]
    for row in rows:
        focus = "；".join(row["focus"][:2]).replace("|", "｜")
        lines.append(f"| {row['name']} | {row['type']} | {'是' if row['affected'] else '否'} | {focus} | 待审批 |")
        lines.append(f"<!-- {row['profile_id']} -->")
    lines.extend([
        "",
        "## 使用方式",
        "",
        "先阅读人物概览、主要经历、关系与未知边界，再在每份档案末尾填写人工决定。只有需要回查时才使用技术附录中的 event、claim 与来源路径。",
    ])
    return "\n".join(lines) + "\n"


def render_batches(context: Context) -> str:
    lines = [
        "# R1A 关闭后人物审批批次",
        "",
        "批次按人物关系与审核主题组织，用于降低一次阅读负担；它们不改变任何人物语义或审批优先级。",
    ]
    seen = []
    for title, description, profile_ids in BATCHES:
        lines.extend(["", f"## {title}", "", description, ""])
        for profile_id in profile_ids:
            lines.append(f"- {context.names[profile_id]}（档案：`{profile_id}`）")
            seen.append(profile_id)
    if set(seen) != set(context.profile_ids) or len(seen) != len(set(seen)):
        raise ValueError("approval batches must cover every profile exactly once")
    return "\n".join(lines) + "\n"


def render_closure_manifest(metrics: dict[str, Any]) -> str:
    return f"""# R1A 关闭清单与人工审批基线

状态：`R1A_CLOSED`

下一步：`READY_FOR_HUMAN_PROFILE_REVIEW`

## 冻结 production

- Production 文件数：{metrics['production_files']}
- Production aggregate SHA-256：`{EXPECTED_PRODUCTION_HASH}`
- R1A-FIX-1 amendment SHA-256：`{EXPECTED_AMENDMENT_HASH}`
- HAP-0-R 是否修改 production：否

## 审批人物范围

- 人物档案：{metrics['profiles']}
- NPC：{metrics['npc']}
- PC continuity：{metrics['pc']}
- 受 R1A 修复影响的人物：{metrics['affected']}

## 投影边界

这些 Markdown 是最终修复后 R2C production 的确定性中文可读投影。它们不是 Canon、不是已经批准的人物 authority、不是 schema 替代品，也不构成进入 Phase 4 的许可。技术 ID 与来源路径只保留在各人物档案附录中。

## 验证结果

- 可读性问题：{metrics['readability_issues']}
- 语义不一致：{metrics['semantic_mismatches']}
- 关系不一致：{metrics['relationship_mismatches']}
- 知识状态不一致：{metrics['knowledge_status_mismatches']}
- PC 控制边界不一致：{metrics['pc_control_mismatches']}
"""


def build_staged_package(root: Path, stage: Path) -> dict[str, Any]:
    frozen = validate_frozen_inputs(root)
    context = load_context(root)
    candidate_root = root / CANDIDATES.relative_to(ROOT)
    package_root = root / PACKAGES.relative_to(ROOT)
    candidate_paths = sorted(candidate_root.glob("*.json"))
    package_ids = {path.stem for path in package_root.glob("*.json")}
    candidate_ids = {path.stem for path in candidate_paths}
    if candidate_ids != package_ids or len(candidate_ids) != 37:
        raise ValueError(f"approval population mismatch candidates={len(candidate_ids)} packages={len(package_ids)}")
    if set(context.profile_ids) != candidate_ids:
        raise ValueError("context name population mismatch")

    rows = []
    aggregate = {
        "semantic_mismatches": 0,
        "relationship_mismatches": 0,
        "knowledge_status_mismatches": 0,
        "pc_control_mismatches": 0,
    }
    readability = {
        "event_id_headings": 0,
        "claim_id_headings": 0,
        "raw_schema_dumps": 0,
        "untranslated_internal_enum_issues": 0,
    }
    for path in candidate_paths:
        candidate = read_json(path)
        package = read_json(package_root / path.name)
        text = render_profile(candidate, package, context)
        write_text(stage / "work" / "human_approval" / "r1a_closed" / "by_profile" / f"{candidate['id']}.md", text)
        audit = audit_profile_markdown(text)
        for key in readability:
            readability[key] += audit[key]
        consistency = semantic_consistency(candidate, package, text, context)
        for key in aggregate:
            aggregate[key] += consistency[key]
        rows.append({
            "profile_id": candidate["id"],
            "name": candidate["name"],
            "type": "PC" if candidate["profile_kind"] == "pc_continuity" else "NPC",
            "affected": candidate["id"] in context.affected_profiles,
            "focus": review_focus(candidate, context),
        })
    if any(readability.values()) or any(aggregate.values()):
        raise ValueError(f"approval audit failed readability={readability} consistency={aggregate}")

    rows.sort(key=lambda row: (row["type"] != "PC", row["name"], row["profile_id"]))
    write_text(stage / "docs" / "human_approval" / "R1A_CLOSED_PROFILE_APPROVAL_INDEX.md", render_index(rows))
    write_text(stage / "docs" / "human_approval" / "R1A_CLOSED_APPROVAL_BATCHES.md", render_batches(context))
    result = {
        "status": "PASS",
        "profiles": len(rows),
        "npc": sum(row["type"] == "NPC" for row in rows),
        "pc": sum(row["type"] == "PC" for row in rows),
        "affected": sum(row["affected"] for row in rows),
        "production_files": frozen["files"],
        "readability": readability,
        "readability_issues": sum(readability.values()),
        **aggregate,
    }
    write_text(stage / "docs" / "remediation" / "R1A_CLOSURE_MANIFEST.md", render_closure_manifest(result))
    return result


def package_file_map(root: Path) -> dict[str, bytes]:
    return {
        path.relative_to(root).as_posix(): path.read_bytes()
        for path in sorted(root.rglob("*")) if path.is_file()
    }


def compare_staged_packages(first: Path, second: Path) -> dict[str, Any]:
    left = package_file_map(first)
    right = package_file_map(second)
    paths = sorted(set(left) | set(right))
    differences = [path for path in paths if left.get(path) != right.get(path)]
    return {"files": len(paths), "byte_differences": len(differences), "different_paths": differences}


def live_file_map(root: Path) -> dict[str, bytes]:
    result = {}
    targets = [
        root / "docs" / "remediation" / "R1A_CLOSURE_MANIFEST.md",
        root / "docs" / "human_approval",
        root / "work" / "human_approval" / "r1a_closed",
    ]
    for target in targets:
        if target.is_file():
            result[target.relative_to(root).as_posix()] = target.read_bytes()
        elif target.is_dir():
            for path in target.rglob("*"):
                if path.is_file():
                    result[path.relative_to(root).as_posix()] = path.read_bytes()
    return result


def expected_live_map(stage: Path) -> dict[str, bytes]:
    return package_file_map(stage)


def publish_staged_package(root: Path, stage: Path) -> None:
    targets = [
        (stage / "docs" / "human_approval", root / "docs" / "human_approval"),
        (stage / "work" / "human_approval" / "r1a_closed", root / "work" / "human_approval" / "r1a_closed"),
        (stage / "docs" / "remediation" / "R1A_CLOSURE_MANIFEST.md", root / "docs" / "remediation" / "R1A_CLOSURE_MANIFEST.md"),
    ]
    transaction = Path(tempfile.mkdtemp(prefix="hap0r-publish-", dir=root))
    installed: list[tuple[Path, Path | None]] = []
    try:
        for index, (source, target) in enumerate(targets):
            target.parent.mkdir(parents=True, exist_ok=True)
            incoming = target.parent / f".{target.name}.hap0r-incoming"
            if incoming.exists():
                shutil.rmtree(incoming) if incoming.is_dir() else incoming.unlink()
            if source.is_dir():
                shutil.copytree(source, incoming)
            else:
                shutil.copy2(source, incoming)
            backup = None
            if target.exists():
                backup = transaction / f"backup-{index}-{target.name}"
                os.replace(target, backup)
            os.replace(incoming, target)
            installed.append((target, backup))
    except Exception:
        for target, backup in reversed(installed):
            if target.exists():
                shutil.rmtree(target) if target.is_dir() else target.unlink()
            if backup and backup.exists():
                os.replace(backup, target)
        raise
    finally:
        shutil.rmtree(transaction, ignore_errors=True)


def run(root: Path = ROOT, check: bool = False) -> dict[str, Any]:
    before = production_fingerprint(root)
    with tempfile.TemporaryDirectory(prefix="hap0r-a-") as first_temp, tempfile.TemporaryDirectory(prefix="hap0r-b-") as second_temp:
        first = Path(first_temp)
        second = Path(second_temp)
        result = build_staged_package(root, first)
        second_result = build_staged_package(root, second)
        if result != second_result:
            raise ValueError("BLOCKED_BY_NONDETERMINISM: aggregate results differ")
        determinism = compare_staged_packages(first, second)
        if determinism["byte_differences"]:
            raise ValueError(f"BLOCKED_BY_NONDETERMINISM: {determinism['different_paths']}")
        if check:
            if live_file_map(root) != expected_live_map(first):
                raise ValueError("HAP-0-R approval outputs differ from deterministic projection")
        else:
            publish_staged_package(root, first)
    after = production_fingerprint(root)
    if before != after or after["aggregate_sha256"] != EXPECTED_PRODUCTION_HASH:
        raise ValueError(f"BLOCKED_BY_PRODUCTION_DRIFT: before={before} after={after}")
    return {**result, "determinism": determinism, "production": "UNCHANGED", "fingerprint": after}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="verify published approval outputs without writing")
    args = parser.parse_args()
    print(json.dumps(run(ROOT, args.check), ensure_ascii=False, sort_keys=True, indent=2))


if __name__ == "__main__":
    main()
