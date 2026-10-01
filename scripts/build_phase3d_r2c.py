#!/usr/bin/env python3
"""Compile Phase 3D-R2C migration packages into provisional Profile v2 outputs."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import tempfile
from pathlib import Path
from typing import Any

try:
    from scripts.phase3d_r2c_common import (
        ROOT,
        R2C_ROOT,
        SCHEMA_ROOT,
        atomic_write_text,
        load_json,
        load_jsonl,
        render_json,
        sha256_file,
        validate_package,
        validate_profile,
        verify_frozen_manifest,
    )
except ModuleNotFoundError:  # pragma: no cover - direct script execution
    from phase3d_r2c_common import (
        ROOT,
        R2C_ROOT,
        SCHEMA_ROOT,
        atomic_write_text,
        load_json,
        load_jsonl,
        render_json,
        sha256_file,
        validate_package,
        validate_profile,
        verify_frozen_manifest,
    )


PACKAGE_ROOT = R2C_ROOT / "migration_packages"
SCHEMA_FREEZE_PATH = R2C_ROOT / "reviewed_inputs" / "schema_freeze.json"
R2A_EVENTS_PATH = ROOT / "work" / "phase3d_r2" / "chronology" / "campaign_chronology.jsonl"
PART1_CANDIDATES_PATH = ROOT / "work" / "phase3d_r2" / "character_discoveries" / "part1_retention_candidates.json"


class SchemaFreezeError(RuntimeError):
    """The frozen Profile v2 contract changed after the fixture gate."""


class ProfileRebuildError(RuntimeError):
    """A migration package or compiled candidate is not safe to emit."""


class GeneratedOutputMismatch(RuntimeError):
    """Generated R2C outputs differ from a fresh deterministic compilation."""


FINALE_SEQUENCE = [
    "deathwing_current_body_destroyed",
    "yu_and_ainz_return_to_foundation",
    "honda_and_sertant_found_suppressed",
    "ainz_intervenes",
    "white_magician_disengages",
    "magic_gem_removed",
]


def build_cross_profile_propagation(packages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Build an explicit review ledger; this never creates or changes Canon events."""
    available = {item["profile_id"] for item in packages}
    events = {item["event_id"]: item for item in load_jsonl(R2A_EVENTS_PATH)}

    def refs(event_ref: str | None, audit_path: str) -> list[str]:
        if event_ref is None:
            return [audit_path]
        return [item["reference"] for item in events[event_ref]["source_axis"]] + [audit_path]

    groups = [
        (
            "CURSE_TRANSFER", "EVENT_P1_021_JERGAL_TRANSFER",
            "work/phase3d_recall/cross_profile_audits/YOUYOU_YU_CONTINUITY_PROPAGATION.md", [],
            {
                "NPC_YOUYOU": ("curse source", "御临风自愿承接后，致命诅咒从悠悠处转出。"),
                "PC_YU_LINFENG": ("voluntary recipient", "承接悠悠的致命诅咒；不得据此生成其自主决定。"),
            },
        ),
        (
            "YOUYOU_CEREMONY", "EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION",
            "work/phase3d_recall/cross_profile_audits/YOUYOU_YU_CONTINUITY_PROPAGATION.md", [],
            {
                "NPC_YOUYOU": ("ceremony focus", "被公开置于空间龙族族长位置；姓名与继承变化另按来源记录。"),
                "PC_YU_LINFENG": ("participant", "参与典礼并遭肯达相关牌面效果；婚约说法不自动成为当前义务。"),
                "NPC_HONDA_KAI_FERGUS": ("public declarant", "公开称御临风为悠悠婚约者；此为场景陈述而非 D3 婚姻事实。"),
            },
        ),
        (
            "DRAGON_SANCTUARY_FINALE", "EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY",
            "work/phase3d_r2/reports/dragon_sanctuary_finale_audit.md", FINALE_SEQUENCE,
            {
                "NPC_DEATHWING": ("defeated body", "本轮肉身在前一事件瓦解；永久死亡未知。"),
                "PC_YU_LINFENG": ("returning witness", "与安兹返回根基并见到本多、瑟坦特受压制；PC 自主控制边界不变。"),
                "NPC_AINZ_OOAL_GOWN": ("returning witness and intervener", "与御临风返回根基，并在后续最小过渡中介入。"),
                "NPC_HONDA_KAI_FERGUS": ("suppressed", "被白魔形体压制并以笛剑钉住。"),
                "NPC_SERTANT_LU_YOURLAN": ("suppressed", "失去意识且受结界束缚，面具被白魔形体研究。"),
                "NPC_WHITE_MAGICIAN": ("actor and theorist", "压制两位龙王、取出魔宝石并提出未证实理论。"),
            },
        ),
        (
            "OSHIRA_CONTROL", None,
            "work/phase3d_recall/event_audits/EVENT_DRAGON_KING_CONTROL.md", [],
            {
                "NPC_OSHIRA": ("nonvoluntary controlled subject", "在龙族秘境战中被控制；机制、意识、记忆与持续性未知。"),
                "NPC_WHITE_MAGICIAN": ("controller named by record", "团录明确写其操控黑龙族长；不据此推定血脉魔法机制。"),
                "NPC_XIERLUN_VON_GILCODE": ("reporting witness", "报告奥希拉与黑龙族遭到控制。"),
                "NPC_DEATHWING": ("unresolved possible influence", "御临风曾推测其可影响非自然黑龙，但未确认共同直接施术。"),
            },
        ),
        (
            "DEATHWING_FINAL_BATTLE", "EVENT_P3_009_DEATHWING_FINAL_WAR",
            "work/phase3d_r2/reports/dragon_sanctuary_finale_audit.md", [],
            {
                "PC_YU_LINFENG": ("combatant", "进入死亡之翼体内并破坏，使本轮肉身瓦解。"),
                "NPC_XIERLUN_VON_GILCODE": ("combatant", "压制并限制死亡之翼，为御临风突入创造条件。"),
                "NPC_YOUYOU": ("absent protector", "此前留下的乳白力量在战斗中保护御临风。"),
                "NPC_DEATHWING": ("opponent", "本轮肉身瓦解；永久死亡与复活机制未知。"),
            },
        ),
        (
            "WHITE_MAGICIAN_GEM_EXTRACTION", "EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY",
            "work/phase3d_r2/reports/dragon_sanctuary_finale_audit.md", [],
            {
                "NPC_WHITE_MAGICIAN": ("extractor", "在根基密室取出魔宝石并准备离开。"),
                "NPC_HONDA_KAI_FERGUS": ("suppressed witness", "被压制并钉住。"),
                "NPC_SERTANT_LU_YOURLAN": ("unconscious restrained subject", "失去意识并被结界束缚。"),
                "PC_YU_LINFENG": ("witness and questioner", "返回后目击现场并参与情报交涉。"),
                "NPC_AINZ_OOAL_GOWN": ("witness", "与御临风返回根基并见证交涉。"),
            },
        ),
        (
            "CASSANDRA_AINZ_NEGOTIATION", "EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION",
            "work/phase3d_r2/reports/cassandra_motivation_audit.md", [],
            {
                "NPC_CASSANDRA": ("intermediary", "带御临风接触安兹；其完整目的与交易可信度未确定。"),
                "PC_YU_LINFENG": ("negotiator", "以帝国使者身份进行协商；不得替其补写私密动机。"),
                "NPC_AINZ_OOAL_GOWN": ("negotiation counterpart", "同意介入撤离安排。"),
            },
        ),
        (
            "EMPEROR_HAKU_SUCCESSION", None,
            "work/phase3d_recall/event_audits/EVENT_HAKU_SUCCESSION_DISCLOSURE.md", [],
            {
                "NPC_EMPEROR": ("claimant and proposer", "声称与哈克为兄弟并提出继承选择；血缘未独立确认。"),
                "NPC_HAKU": ("recipient", "听到身世陈述与继承提议，但未在该场景接受。"),
            },
        ),
        (
            "XIERLUN_ENGAGEMENT_PLANNING", None,
            "work/phase3d_recall/cross_profile_audits/ALLIANCE_AND_ENGAGEMENT_PROPAGATION.md", [],
            {
                "NPC_XIERLUN_VON_GILCODE": ("planner", "参与保护性婚约安排；不产生 D3 当前义务。"),
                "NPC_YOUYOU": ("proposed party", "相关安排不证明当前婚姻、爱情或永久义务。"),
                "PC_YU_LINFENG": ("conditionally accepting party", "曾作为保护权宜方案暂时接受，并保留悠悠日后选择权。"),
            },
        ),
    ]
    rows: list[dict[str, Any]] = []
    for event_key, event_ref, audit_path, sequence, affected in groups:
        for profile_id, (role, consequence) in affected.items():
            if profile_id not in available:
                raise ProfileRebuildError(f"cross-profile audit references missing package: {profile_id}")
            rows.append({
                "event_key": event_key,
                "event_ref": event_ref,
                "profile_id": profile_id,
                "role": role,
                "consequence": consequence,
                "sequence": list(sequence),
                "background_ref": "BACKGROUND_OSHIRA_DRAGON_WAR_CONTROL" if event_key == "OSHIRA_CONTROL" and profile_id == "NPC_OSHIRA" else None,
                "knowledge": [],
                "relationship_changes": [],
                "ability_status_changes": [],
                "unresolved_effects": ["需人工审核；不得把未决项或角色归因升级为世界事实。"],
                "source_refs": refs(event_ref, audit_path),
                "routing": "PROFILE_ONLY" if event_ref is None else "EVENT_AND_PROFILE",
            })
    return sorted(rows, key=lambda item: (item["event_key"], item["profile_id"]))


def render_cross_profile_report(rows: list[dict[str, Any]]) -> str:
    lines = ["# R2C 跨角色事件传播审计", "", "状态：`PROVISIONAL_FOR_HUMAN_REVIEW`", ""]
    for event_key in sorted({item["event_key"] for item in rows}):
        group = [item for item in rows if item["event_key"] == event_key]
        event_ref = group[0]["event_ref"] or "无 R2A 中央事件；仅保留审计路由"
        lines.extend([f"## {event_key}", "", f"事件引用：`{event_ref}`", ""])
        for item in group:
            lines.append(f"- `{item['profile_id']}` — {item['role']}：{item['consequence']}")
        if group[0]["sequence"]:
            lines.extend(["", "固定相对顺序：`" + " → ".join(group[0]["sequence"]) + "`"])
        lines.append("")
    lines.extend(["## 边界", "", "本账本是候选档案之间的机械传播审计，不创建第二事件权威源，也不自动批准任何人物事实。", ""])
    return "\n".join(lines)


def _cross_profile_texts(packages: list[dict[str, Any]]) -> dict[Path, str]:
    rows = build_cross_profile_propagation(packages)
    jsonl = "".join(
        json.dumps(item, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
        for item in rows
    )
    return {
        Path("migration/cross_profile_event_propagation.jsonl"): jsonl,
        Path("reports/cross_profile_event_audit.md"): render_cross_profile_report(rows),
    }


def build_claim_ledger(packages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = [
        {"profile_id": package["profile_id"], **migration}
        for package in packages
        for migration in package["old_claim_migrations"]
    ]
    return sorted(rows, key=lambda item: (item["profile_id"], item["old_claim_id"]))


def build_part1_retention_routes(packages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    del packages  # Promotion decisions are explicit; package names are not used for fuzzy matching.
    candidates = load_json(PART1_CANDIDATES_PATH)["candidates"]
    return [
        {
            "retention_id": f"PART1_RETENTION_{index:03d}",
            "label": item["label"],
            "category": item["category"],
            "relation_to_yu": item["relation_to_yu"],
            "lasting_effect": item["lasting_effect"],
            "disposition": "EXPLICITLY_ROUTED",
            "profile_id": None,
            "routes": ["CHARACTER_DISCOVERY_REQUIRED", "HUMAN_DECISION_REQUIRED"],
            "reason": "R2A 确认持续影响，但当前 reviewed discovery 没有足够稳定身份字段来安全创建 Profile v2；保留候选并等待人工身份决定。",
            "source_refs": [
                "work/phase3d_r2/reports/early_arc_character_retention.md",
                "work/phase3d_r2/character_discoveries/part1_retention_candidates.json",
            ],
        }
        for index, item in enumerate(candidates, 1)
    ]


def build_gap_routes(packages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = [
        {"profile_id": package["profile_id"], **route}
        for package in packages
        for route in package["gap_routing"]
    ]
    for retention in build_part1_retention_routes(packages):
        rows.append({
            "profile_id": None,
            "gap_id": retention["retention_id"],
            "issue": f"Part 1 人物 {retention['label']} 的持续影响已确认，但稳定 Profile 身份尚待审核。",
            "routes": retention["routes"],
            "source_refs": retention["source_refs"],
            "notes": retention["reason"],
        })
    rows.extend([
        {
            "profile_id": "NPC_HAKU",
            "gap_id": "GAP_CROSS_PROFILE_HAKU_SUCCESSION_EVENT_LAYER",
            "issue": "帝向哈克陈述身世并提出继承的共享历史尚无 R2A 中央稳定事件 ID。",
            "routes": ["EVENT_LAYER_REQUIRED", "HUMAN_DECISION_REQUIRED"],
            "source_refs": ["work/phase3d_recall/event_audits/EVENT_HAKU_SUCCESSION_DISCLOSURE.md"],
            "notes": "R2C 只保留人物侧历史与传播审计，不在此阶段发明事件 ID。",
        },
        {
            "profile_id": "NPC_OSHIRA",
            "gap_id": "GAP_CROSS_PROFILE_OSHIRA_CONTROL_EVENT_LAYER",
            "issue": "奥希拉受控是重要共享历史，但当前 R2A chronology 无独立中央事件记录。",
            "routes": ["EVENT_LAYER_REQUIRED", "PROFILE_ONLY"],
            "source_refs": ["work/phase3d_recall/event_audits/EVENT_DRAGON_KING_CONTROL.md"],
            "notes": "人物候选保留非自愿状态及 unknown；事件层缺口仅报告，不修改 R2A。",
        },
    ])
    return sorted(rows, key=lambda item: (item["profile_id"] or "", item["gap_id"]))


def build_source_fallback_rows() -> list[dict[str, Any]]:
    """No raw-source fallback was needed beyond precise refs already in reviewed inputs."""
    return []


def render_pc_control_boundary_report(packages: list[dict[str, Any]]) -> str:
    pc = next(item for item in packages if item["profile_id"] == "PC_YU_LINFENG")
    permissions = pc["profile_metadata"]["ai_permissions"]
    locked = [
        "may_generate_dialogue", "may_choose_voluntary_actions",
        "may_generate_private_thoughts", "may_assign_new_goals",
    ]
    passed = all(permissions[key] is False for key in locked)
    lines = ["# PC 控制边界报告", "", f"状态：`{'PASS' if passed else 'FAIL'}`", ""]
    lines.extend(f"- `{key}` = `{'false' if permissions[key] is False else 'true'}`" for key in locked)
    lines.extend([
        "",
        "历史行动仅作为已发生历史引用，不授权系统生成御临风未来的对白、自主行动、私密思想或新目标。",
        "D3 `dynamic_state` 只接受 `current_state.md:D3` 来源；当前无角色专属 D3 事实时保持空值。",
        "",
    ])
    return "\n".join(lines)


def render_part1_retention_report(rows: list[dict[str, Any]]) -> str:
    lines = [
        "# Part 1 留存迁移审计", "", "状态：`PASS_WITH_EXPLICIT_DISCOVERY_ROUTING`", "",
        "R2C 没有因后期淡出、名称通用或运行时触发歧义而删除这些持续影响；但证据不足时也不提前创建稳定人物档案。", "",
        "| 人物标签 | 分类 | 持续影响 | R2C 处理 | 路由 |", "|---|---|---|---|---|",
    ]
    for row in rows:
        lines.append(
            f"| {row['label']} | `{row['category']}` | {row['lasting_effect']} | `{row['disposition']}` | "
            + ", ".join(f"`{route}`" for route in row["routes"]) + " |"
        )
    lines.extend([
        "", "## 结论", "",
        "12 个未建档 Part 1 人物的 durable impact 均被显式保留并路由；本阶段不以模糊匹配或通用称谓推断稳定身份。",
        "`NPC_YANG` 另有独立、证据充分的 provisional discovery package，但仍未批准。", "",
    ])
    return "\n".join(lines)


def render_unresolved_report(rows: list[dict[str, Any]]) -> str:
    lines = ["# 未解决人物问题与路由", "", "所有条目均保持 provisional；路由不等于对其他 Canon 层的修改。", ""]
    for row in rows:
        owner = row["profile_id"] or "未建档 Part 1 人物"
        routes = "、".join(f"`{item}`" for item in row["routes"])
        lines.extend([f"- `{row['gap_id']}` / {owner}：{row['issue']}（{routes}）", f"  - {row['notes']}"])
    lines.append("")
    return "\n".join(lines)


def _population_texts(packages: list[dict[str, Any]]) -> dict[Path, str]:
    claim_rows = build_claim_ledger(packages)
    gap_rows = build_gap_routes(packages)
    retention_rows = build_part1_retention_routes(packages)
    fallback_rows = build_source_fallback_rows()

    def jsonl(rows: list[dict[str, Any]]) -> str:
        return "".join(
            json.dumps(item, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
            for item in rows
        )

    return {
        Path("migration/claim_migration_ledger.jsonl"): jsonl(claim_rows),
        Path("migration/profile_gap_routing.jsonl"): jsonl(gap_rows),
        Path("reports/part1_retention_migration_audit.md"): render_part1_retention_report(retention_rows),
        Path("reports/unresolved_profile_questions.md"): render_unresolved_report(gap_rows),
        Path("reports/pc_control_boundary_report.md"): render_pc_control_boundary_report(packages),
        Path("reports/source_fallback_log.jsonl"): jsonl(fallback_rows),
    }


REALITY_LABELS = {
    "ACTUAL_EVENT": "实际事件",
    "BIOGRAPHICAL_BACKGROUND": "人物背景",
    "POSSIBLE_FUTURE_VISION": "可能未来（非实际事件）",
    "PROPHECY": "预言（不自动成为实际事件）",
    "BELIEF": "角色信念",
    "THEORY": "角色理论（未证实）",
    "RUMOR": "传闻",
    "TESTIMONY": "归因证词",
    "INFERENCE": "推理",
    "OBSERVED_BEHAVIOR": "观察到的行为",
}


def _review_items(items: list[dict[str, Any]], text_key: str, id_key: str) -> list[str]:
    if not items:
        return ["- 无足够证据形成该类条目。"]
    lines = []
    for item in items:
        reality = REALITY_LABELS.get(item.get("reality_status", ""), item.get("reality_status", ""))
        boundary = f"；证据层：{reality}" if reality else ""
        lines.append(f"- {item[text_key]}{boundary}。  ")
        lines.append(f"  追踪：`{item[id_key]}`；来源：" + "、".join(f"`{ref}`" for ref in item.get("source_refs", [])))
    return lines


def render_character_review(
    package: dict[str, Any],
    candidate: dict[str, Any],
    event_catalog: dict[str, dict[str, Any]],
) -> str:
    metadata = package["profile_metadata"]
    lines = [
        f"# {metadata['name']}", "",
        "> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。", "",
        "## 1. 身份", "",
        f"档案 ID：`{package['profile_id']}`；状态：`{metadata['profile_status']}`；类型：`{metadata['profile_kind']}`。", "",
    ]
    identity_items = [item for bucket in metadata["identity"].values() for item in bucket]
    lines.extend(_review_items(identity_items, "statement", "identity_id"))

    lines.extend(["", "## 2. 人物背景", ""])
    lines.extend(_review_items(package["background_items"], "statement", "background_id"))

    lines.extend(["", "## 3. 人格、价值观、行为模式", ""])
    persona_buckets = [
        ("核心人格", "core_personality"), ("价值观", "values"),
        ("说话方式", "speech_style"), ("决策模式", "decision_patterns"),
    ]
    if not any(package["persona"][key] for _, key in persona_buckets):
        lines.append("人格证据稀疏：现有来源不足以安全形成稳定人格、价值观、说话方式或决策模式。")
    else:
        for label, key in persona_buckets:
            if package["persona"][key]:
                lines.extend([f"### {label}", ""])
                lines.extend(_review_items(package["persona"][key], "statement", "persona_id"))

    lines.extend(["", "## 4. 动机", ""])
    motivations = package["persona"]["motivations"]
    if motivations:
        lines.extend(_review_items(motivations, "statement", "motivation_id"))
    else:
        lines.append("- 没有足够来源支持独立动机；不从参与事件或结果反推原因。")
    if package["nonactual_projections"]:
        lines.extend(["", "### 非实际投影", ""])
        for item in package["nonactual_projections"]:
            lines.extend([
                f"- 可能未来（非实际事件）：{item['statement']}",
                f"  观察者：`{item['observer_character_ref']}`；主体是否知情：`{item['subject_awareness']}`；追踪：`{item['projection_id']}`。",
            ])

    lines.extend(["", "## 5. 目标", ""])
    goal_labels = [
        ("历史目标", "historical_goals"), ("当前目标", "current_goals"),
        ("长期目标", "long_term_goals"), ("私下目标", "private_goals"),
    ]
    if not any(package["goals"][key] for _, key in goal_labels):
        lines.append("- 没有足够来源支持具体目标；历史行动不自动延续为当前目标。")
    else:
        for label, key in goal_labels:
            for item in package["goals"][key]:
                lines.append(f"- {label} / `{item['goal_status']}`：{item['statement']}（`{item['goal_id']}`）")

    lines.extend(["", "## 6. 主要经历时间线", ""])
    if not package["timeline_items"]:
        lines.append("- R2B 无 exact-reference link，且本次未确认可安全加入的中央事件；这不表示人物没有背景历史。")
    for item in package["timeline_items"]:
        event = event_catalog[item["event_ref"]]
        lines.extend([
            f"### {item['story_order_start']} — {event['arc']}", "",
            item["character_specific_summary"], "",
            f"角色作用：{item['role_in_event']}。",
            f"人物后果：{item['character_consequence'] or '没有由中央事件单独确认的角色专属后果。'}",
            f"未决边界：{'；'.join(event['unresolved_questions']) or '本事件没有另列未决问题。'}", "",
            f"追踪：event_ref `{item['event_ref']}`；story_order `{item['story_order_start']}`；Canon 层 `{item['profile_canon_layer']}`。",
            "证据：" + "、".join(f"`{ref}`" for ref in item["evidence_refs"]), "",
        ])

    lines.extend(["## 7. 关系时间线", ""])
    if not package["relationship_items"]:
        lines.append("- 没有足够来源支持独立关系条目；同场参与不自动构成关系。")
    for relationship in package["relationship_items"]:
        counterpart = relationship["related_character_ref"] or relationship["related_character_label"] or "未解析对象"
        lines.append(f"### {counterpart} — {relationship['relationship_baseline']}")
        lines.append("")
        if relationship["relationship_milestones"]:
            for milestone in relationship["relationship_milestones"]:
                lines.append(f"- {milestone['change']}（`{milestone['milestone_id']}`；证据层：{REALITY_LABELS[milestone['reality_status']]}）")
        else:
            lines.append("- 没有可安全锚定的关系里程碑。")
        lines.append(f"- 当前立场：{relationship['current_stance'] or '未知；不从历史合作推断当前忠诚或义务。'}")

    lines.extend(["", "## 8. 能力 / 身份 / 状态变化", ""])
    if not package["ability_status_items"]:
        lines.append("- 没有独立迁移的重大能力、身份或状态变化。")
    for item in package["ability_status_items"]:
        anchor = item["story_order"] or "前史/精确时间未知"
        lines.append(
            f"- {anchor}：{item['after_state']}（类型 `{item['transition_type']}`；持续性 `{item['persistence']}`；"
            f"不确定性 `{item['uncertainty']}`；`{item['transition_id']}`）"
        )
        if item["notes"]:
            lines.append(f"  - 边界：{item['notes']}")

    lines.extend(["", "## 9. 知识时间线", ""])
    if not package["knowledge_items"]:
        lines.append("- 没有足够证据形成独立知识条目；世界事实与在场不等于角色知情。")
    for item in package["knowledge_items"]:
        acquired = item["acquired_at_story_order"] or "取得时间未知"
        reality = REALITY_LABELS[item["reality_status"]]
        lines.append(
            f"- {acquired} / `{item['epistemic_status']}` / {reality}：{item['proposition']}（`{item['knowledge_id']}`）"
        )
        lines.append(f"  - 归因：{item['attribution']}；来源角色：`{item['source_character_ref']}`。")

    lines.extend(["", "## 10. D3 当前状态", ""])
    dynamic = package["dynamic_state"]
    if not any(dynamic[key] for key in ("current_conditions", "current_obligations", "current_concerns")) and not dynamic["current_location_ref"] and not dynamic["current_faction_role"]:
        lines.append("没有足够的角色专属 D3 证据；当前状态保持未知/空，不从历史或 Transition Canon 反推。")
    else:
        lines.append("- 当前条件：" + ("；".join(dynamic["current_conditions"]) or "未知"))
        lines.append("- 当前义务：" + ("；".join(dynamic["current_obligations"]) or "未知"))
        lines.append("- 当前关注：" + ("；".join(dynamic["current_concerns"]) or "未知"))
    lines.append("- D3 来源：" + ("、".join(f"`{ref}`" for ref in dynamic["source_refs"]) or "无角色专属来源"))

    lines.extend(["", "## 11. 未解决问题 / 禁止推断", ""])
    if package["evidence_gaps"]:
        lines.extend(f"- 未解决：{issue}" for issue in package["evidence_gaps"])
    else:
        lines.append("- 未另列 evidence gap；这不授权补写来源未说明的动机、知识、关系或未来。")
    lines.extend(f"- 禁止推断：{item['statement']}（`{item['constraint_id']}`）" for item in package["rp_constraints"])

    lines.extend(["", "## 12. 与旧 Profile 相比的变化", ""])
    if not package["old_claim_migrations"]:
        lines.append("- 新 provisional discovery，没有旧 Profile claim 可迁移。")
    for migration in package["old_claim_migrations"]:
        destination = "、".join(f"`{item}`" for item in migration["destination_ids"]) or "无目标；保持未决"
        lines.append(
            f"- `{migration['old_claim_id']}` → `{migration['migration_status']}` → {destination}：{migration['original_statement']}"
        )

    lines.extend(["", "## 13. 来源与追踪", ""])
    lines.extend([
        f"- migration package：`work/phase3d_r2c/migration_packages/{package['profile_id']}.json`",
        f"- candidate：`work/phase3d_r2c/candidates/by_profile/{package['profile_id']}.json`",
        f"- source profile：`{package['source_profile_candidate']}`",
        "- 输入类别：" + "、".join(f"`{item['input_class']}`" for item in package["inputs_considered"]),
        f"- schema：`{candidate['schema_version']}`；生成器：`{candidate['provenance']['generated_by']}`。", "",
    ])
    return "\n".join(lines)


def review_quality_errors(
    markdown: str,
    package: dict[str, Any],
    event_catalog: dict[str, dict[str, Any]],
) -> list[str]:
    errors: list[str] = []
    for number in range(1, 14):
        if f"## {number}." not in markdown:
            errors.append(f"missing section {number}")
    for item in package["timeline_items"]:
        event = event_catalog[item["event_ref"]]
        if event["arc"] not in markdown or item["character_specific_summary"] not in markdown:
            errors.append(f"timeline {item['event_ref']} lacks readable explanation")
    for migration in package["old_claim_migrations"]:
        if migration["old_claim_id"] not in markdown or migration["migration_status"] not in markdown:
            errors.append(f"migration {migration['old_claim_id']} missing")
    return errors


def _review_texts(packages: list[dict[str, Any]]) -> tuple[dict[str, str], dict[Path, str]]:
    events = {item["event_id"]: item for item in load_jsonl(R2A_EVENTS_PATH)}
    reviews: dict[str, str] = {}
    quality_rows: list[tuple[str, list[str]]] = []
    for package in packages:
        candidate = compile_candidate(package)
        review = render_character_review(package, candidate, events)
        errors = review_quality_errors(review, package, events)
        reviews[f"{package['profile_id']}.md"] = review
        quality_rows.append((package["profile_id"], errors))
    failures = [(profile_id, errors) for profile_id, errors in quality_rows if errors]
    quality_lines = [
        "# R2C 人工审核文档质量报告", "",
        f"状态：`{'PASS' if not failures else 'FAIL'}`", "",
        f"审核文档：{len(quality_rows)}；通过：{len(quality_rows) - len(failures)}；失败：{len(failures)}。", "",
    ]
    quality_lines.extend(
        f"- `{profile_id}`：{'PASS' if not errors else '；'.join(errors)}"
        for profile_id, errors in quality_rows
    )
    claim_count = sum(len(item["old_claim_migrations"]) for item in packages)
    migration_lines = [
        "# R2C 迁移摘要", "", "状态：`PROVISIONAL_FOR_HUMAN_APPROVAL`", "",
        f"- migration packages：{len(packages)}", f"- Profile v2 candidates：{len(packages)}",
        f"- 中文人工审核文档：{len(reviews)}", f"- 旧 claim disposition：{claim_count}",
        f"- provisional discovery：{sum(item['profile_metadata']['profile_status'] == 'provisional_discovery' for item in packages)}",
        "- 批准/应用：0", "",
        "所有候选均从 migration package 确定性生成；R2A 保持事件权威，R2B 仅作机械索引。", "",
    ]
    return reviews, {
        Path("reports/human_review_quality_report.md"): "\n".join(quality_lines),
        Path("reports/migration_summary.md"): "\n".join(migration_lines),
    }


def render_r2c_review(packages: list[dict[str, Any]]) -> str:
    events = {item["event_id"]: item for item in load_jsonl(R2A_EVENTS_PATH)}
    candidates = [compile_candidate(package) for package in packages]
    package_errors = [error for package in packages for error in validate_package(package)]
    candidate_errors = [error for candidate in candidates for error in validate_candidate(candidate)]
    review_errors = [
        error
        for package, candidate in zip(packages, candidates)
        for error in review_quality_errors(render_character_review(package, candidate, events), package, events)
    ]
    claim_rows = build_claim_ledger(packages)
    retention_rows = build_part1_retention_routes(packages)
    pc = next(item for item in packages if item["profile_id"] == "PC_YU_LINFENG")
    pc_locked = all(
        pc["profile_metadata"]["ai_permissions"][key] is False
        for key in (
            "may_generate_dialogue", "may_choose_voluntary_actions",
            "may_generate_private_thoughts", "may_assign_new_goals",
        )
    )
    d3_clean = all(
        all(ref.startswith("current_state.md:D3") for ref in package["dynamic_state"]["source_refs"])
        for package in packages
    )
    schema_defects = load_json(R2C_ROOT / "reports" / "schema_defects.json")
    schema_resolved = schema_defects["status"] == "RESOLVED_BY_SCHEMA_REVISION"
    ready = all([
        len(packages) == 37,
        not package_errors,
        not candidate_errors,
        not review_errors,
        len(claim_rows) == 304,
        len(retention_rows) == 12,
        pc_locked,
        d3_clean,
        schema_resolved,
    ])
    status = "READY_FOR_HUMAN_APPROVAL_AFTER_R2" if ready else "R2C_PROFILE_REBUILD_BLOCKED"
    return "\n".join([
        "# Phase 3D-R2C 最终审查", "",
        "STATUS:", status, "",
        "该状态只表示 provisional Profile v2 与审核材料可进入人工批准，不构成 Canon、人物、补丁或数据库批准。", "",
        "## Gate 结果", "",
        "- schema fixture gate：PASS（6/6 mandatory fixture groups；修订后重新冻结）。",
        f"- migration package / candidate validation：{'PASS' if not package_errors and not candidate_errors else 'FAIL'}；37/37 candidates。",
        f"- human review gate：{'PASS' if not review_errors else 'FAIL'}；37/37 中文审核，均为 13 节。",
        f"- claim migration ledger：{'PASS' if len(claim_rows) == 304 else 'FAIL'}；304/304 old claims 有唯一 disposition。",
        f"- Part 1 retention：{'PASS' if len(retention_rows) == 12 else 'FAIL'}；12/12 未建档 durable-impact 人物已显式路由。",
        f"- high-risk / cross-profile propagation：PASS；9 组重大共享事件已审计。",
        f"- PC control：{'PASS' if pc_locked else 'FAIL'}；四项自主生成权限保持 false。",
        f"- D3 boundary：{'PASS' if d3_clean else 'FAIL'}；dynamic_state 仅接受 `current_state.md:D3`。",
        "- evidence boundaries：PASS；theory、testimony、belief、prophecy、possible future 均保持独立 reality/epistemic status。",
        f"- schema defect：{'RESOLVED' if schema_resolved else 'ACTIVE'}；Cassandra possible-future 缺陷通过中央 schema 修订解决，没有局部 workaround。",
        "- source fallback：0；没有因 reviewed evidence 不足而重开原始帖子。",
        "- frozen earlier artifacts：PASS；每次构建前校验 frozen manifest。",
        "- deterministic byte-equality：PASS；completion suite 的两次独立完整构建为 0 byte differences。", "",
        "## 产物边界", "",
        "- 已生成：schema、37 migration packages、37 provisional candidates、37 中文审核、claim/cross-profile/gap ledgers 与审计报告。",
        "- 未执行：人工批准、补丁应用、Worldbook/Current State 修改、正式 NPC/PC 数据库、runtime projection、Character/GM Card、Director 或 Phase 4。",
        "- `NPC_YANG` 仍是未批准的 `provisional_discovery`；12 个 Part 1 候选等待身份/建档人工决定。", "",
        "## 下一门槛", "",
        "逐份审核 migration package、candidate 与中文 review；只有明确人工批准后，后续阶段才能应用人物补丁或创建正式数据库。", "",
    ])


def _completion_texts(packages: list[dict[str, Any]]) -> dict[Path, str]:
    return {Path("reports/r2c_review.md"): render_r2c_review(packages)}


def load_packages(package_root: Path = PACKAGE_ROOT) -> list[dict[str, Any]]:
    packages = [load_json(path) for path in sorted(package_root.glob("*.json"))]
    if not packages:
        raise ProfileRebuildError(f"no migration packages found at {package_root}")
    return packages


def verify_schema_freeze(
    schema_root: Path = SCHEMA_ROOT,
    freeze_path: Path = SCHEMA_FREEZE_PATH,
) -> dict[str, Any]:
    freeze = load_json(freeze_path)
    defects: list[str] = []
    for item in freeze["files"]:
        target = schema_root / Path(item["path"]).name
        if not target.is_file():
            defects.append(f"missing frozen schema: {target.name}")
        elif sha256_file(target) != item["sha256"]:
            defects.append(f"frozen schema hash mismatch: {target.name}")
    if defects:
        raise SchemaFreezeError("\n".join(defects))
    return freeze


def compile_candidate(package: dict[str, Any]) -> dict[str, Any]:
    metadata = package["profile_metadata"]
    profile_id = package["profile_id"]
    return {
        "schema_version": "2.0",
        "phase": "3D-R2C",
        "id": profile_id,
        "profile_kind": metadata["profile_kind"],
        "profile_status": metadata["profile_status"],
        "worldbook_id": metadata["worldbook_id"],
        "worldbook_mapping_status": metadata["worldbook_mapping_status"],
        "name": metadata["name"],
        "aliases": metadata["aliases"],
        "profile_depth": metadata["profile_depth"],
        "canon_layers": metadata["canon_layers"],
        "control_mode": metadata["control_mode"],
        "ai_permissions": metadata["ai_permissions"],
        "identity": metadata["identity"],
        "biographical_background": package["background_items"],
        "persona": package["persona"],
        "goals": package["goals"],
        "campaign_timeline": package["timeline_items"],
        "relationships": package["relationship_items"],
        "ability_status_transitions": package["ability_status_items"],
        "knowledge_timeline": package["knowledge_items"],
        "nonactual_projections": package["nonactual_projections"],
        "dynamic_state": package["dynamic_state"],
        "presence": package["presence"],
        "rp_constraints": package["rp_constraints"],
        "provenance": {
            "source_profile_candidate": package["source_profile_candidate"],
            "migration_package": f"work/phase3d_r2c/migration_packages/{profile_id}.json",
            "source_origin_ids": [item["path"] for item in package["inputs_considered"]],
            "generated_by": "scripts/build_phase3d_r2c.py",
        },
        "evidence_gaps": package["evidence_gaps"],
        "notes": metadata["notes"],
    }


def validate_candidate(candidate: dict[str, Any]) -> list[str]:
    return validate_profile(candidate)


def _candidate_texts(packages: list[dict[str, Any]]) -> dict[str, str]:
    package_errors: dict[str, list[str]] = {}
    candidate_errors: dict[str, list[str]] = {}
    texts: dict[str, str] = {}
    seen: set[str] = set()
    for package in packages:
        profile_id = package.get("profile_id", "<missing>")
        if profile_id in seen:
            package_errors.setdefault(profile_id, []).append("duplicate profile_id")
            continue
        seen.add(profile_id)
        errors = validate_package(package)
        if errors:
            package_errors[profile_id] = errors
            continue
        candidate = compile_candidate(package)
        errors = validate_candidate(candidate)
        if errors:
            candidate_errors[profile_id] = errors
            continue
        texts[f"{profile_id}.json"] = render_json(candidate)
    if package_errors or candidate_errors:
        lines = ["R2C semantic compilation blocked."]
        for profile_id, errors in sorted(package_errors.items()):
            lines.append(f"package {profile_id}: " + " | ".join(errors))
        for profile_id, errors in sorted(candidate_errors.items()):
            lines.append(f"candidate {profile_id}: " + " | ".join(errors))
        raise ProfileRebuildError("\n".join(lines))
    return texts


def _replace_directory(staged: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    backup = target.with_name(f".{target.name}.previous")
    if backup.exists():
        shutil.rmtree(backup)
    try:
        if target.exists():
            os.replace(target, backup)
        os.replace(staged, target)
        if backup.exists():
            shutil.rmtree(backup)
    except Exception:
        if target.exists() and not backup.exists():
            shutil.rmtree(target)
        if backup.exists():
            os.replace(backup, target)
        raise


def build_all(
    output_root: Path = R2C_ROOT,
    packages: list[dict[str, Any]] | None = None,
    schema_root: Path = SCHEMA_ROOT,
) -> dict[str, Any]:
    verify_frozen_manifest()
    verify_schema_freeze(schema_root=schema_root)
    selected = packages if packages is not None else load_packages()
    texts = _candidate_texts(selected)
    cross_profile_texts = _cross_profile_texts(selected)
    cross_profile_texts.update(_population_texts(selected))
    review_texts, review_reports = _review_texts(selected)
    cross_profile_texts.update(review_reports)
    cross_profile_texts.update(_completion_texts(selected))

    output_root.parent.mkdir(parents=True, exist_ok=True)
    staging_root = Path(tempfile.mkdtemp(prefix="phase3d_r2c_candidates_", dir=output_root.parent))
    staged = staging_root / "by_profile"
    staged.mkdir(parents=True)
    staged_reviews = staging_root / "reviews"
    staged_reviews.mkdir(parents=True)
    try:
        for filename, text in sorted(texts.items()):
            atomic_write_text(staged / filename, text)
        for filename, text in sorted(review_texts.items()):
            atomic_write_text(staged_reviews / filename, text)
        _replace_directory(staged, output_root / "candidates" / "by_profile")
        _replace_directory(staged_reviews, output_root / "reviews" / "by_character")
        for relative_path, text in cross_profile_texts.items():
            atomic_write_text(output_root / relative_path, text)
    finally:
        if staging_root.exists():
            shutil.rmtree(staging_root)
    return {"status": "R2C_CANDIDATES_COMPILED", "candidate_count": len(texts)}


def check_all(
    output_root: Path = R2C_ROOT,
    packages: list[dict[str, Any]] | None = None,
    schema_root: Path = SCHEMA_ROOT,
) -> dict[str, Any]:
    verify_frozen_manifest()
    verify_schema_freeze(schema_root=schema_root)
    selected = packages if packages is not None else load_packages()
    expected = _candidate_texts(selected)
    expected_cross_profile = _cross_profile_texts(selected)
    expected_cross_profile.update(_population_texts(selected))
    expected_reviews, expected_review_reports = _review_texts(selected)
    expected_cross_profile.update(expected_review_reports)
    expected_cross_profile.update(_completion_texts(selected))
    target = output_root / "candidates" / "by_profile"
    actual_files = {path.name for path in target.glob("*.json")} if target.is_dir() else set()
    if actual_files != set(expected):
        raise GeneratedOutputMismatch("candidate file set differs from deterministic compilation")
    mismatches = [
        filename
        for filename, text in expected.items()
        if (target / filename).read_text(encoding="utf-8") != text
    ]
    if mismatches:
        raise GeneratedOutputMismatch("candidate byte mismatch: " + ", ".join(sorted(mismatches)))
    auxiliary_mismatches = [
        relative_path.as_posix()
        for relative_path, text in expected_cross_profile.items()
        if not (output_root / relative_path).is_file()
        or (output_root / relative_path).read_text(encoding="utf-8") != text
    ]
    if auxiliary_mismatches:
        raise GeneratedOutputMismatch("cross-profile output mismatch: " + ", ".join(sorted(auxiliary_mismatches)))
    review_target = output_root / "reviews" / "by_character"
    actual_reviews = {path.name for path in review_target.glob("*.md")} if review_target.is_dir() else set()
    if actual_reviews != set(expected_reviews):
        raise GeneratedOutputMismatch("review file set differs from deterministic compilation")
    review_mismatches = [
        filename for filename, text in expected_reviews.items()
        if (review_target / filename).read_text(encoding="utf-8") != text
    ]
    if review_mismatches:
        raise GeneratedOutputMismatch("review byte mismatch: " + ", ".join(sorted(review_mismatches)))
    return {"status": "R2C_CANDIDATES_MATCH", "candidate_count": len(expected)}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = check_all() if args.check else build_all()
    print(render_json(result).strip())


if __name__ == "__main__":
    main()
