#!/usr/bin/env python3
"""Prepare explicit provisional semantic migration packages for Phase 3D-R2C."""

from __future__ import annotations

import argparse
import re
import shutil
import tempfile
from pathlib import Path
from typing import Any, Iterable

try:
    from scripts.phase3d_r2c_common import (
        ROOT,
        R2C_ROOT,
        atomic_write_text,
        load_json,
        load_jsonl,
        render_json,
        validate_package,
        verify_frozen_manifest,
    )
except ModuleNotFoundError:  # pragma: no cover - direct script execution
    from phase3d_r2c_common import (
        ROOT,
        R2C_ROOT,
        atomic_write_text,
        load_json,
        load_jsonl,
        render_json,
        validate_package,
        verify_frozen_manifest,
    )


R2A_EVENTS = ROOT / "work" / "phase3d_r2" / "chronology" / "campaign_chronology.jsonl"
R2A_REVELATIONS = ROOT / "work" / "phase3d_r2" / "chronology" / "character_revelations.jsonl"
R2B_INDEX_ROOT = ROOT / "work" / "phase3d_r2b" / "indexes" / "by_profile"
APPROVED_ROOT = ROOT / "work" / "phase3d" / "approved_candidates"
REPAIRED_ROOT = ROOT / "work" / "phase3d_recall" / "repaired_candidates"
RULES_PATH = R2C_ROOT / "reviewed_inputs" / "migration_rules.json"
PACKAGE_ROOT = R2C_ROOT / "migration_packages"

OLD_ID_FIELDS = ("claim_id", "relationship_id", "knowledge_id", "goal_id", "constraint_id")


def safe_token(value: str) -> str:
    token = re.sub(r"[^A-Z0-9]+", "_", value.upper()).strip("_")
    return token or "ITEM"


def ordered_unique(values: Iterable[str]) -> list[str]:
    return list(dict.fromkeys(value for value in values if value))


def load_events() -> list[dict[str, Any]]:
    return load_jsonl(R2A_EVENTS)


def load_effective_profiles() -> dict[str, Path]:
    profiles: dict[str, Path] = {}
    for root in (APPROVED_ROOT, REPAIRED_ROOT):
        for path in sorted(root.glob("*.json")):
            profile = load_json(path)
            profiles[profile["id"]] = path
    if len(profiles) != 36:
        raise ValueError(f"effective profile population must contain 36 IDs, found {len(profiles)}")
    return dict(sorted(profiles.items()))


def old_claim_inventory(profile: dict[str, Any]) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    seen: set[str] = set()

    def visit(value: Any, path: str) -> None:
        if isinstance(value, dict):
            for id_field in OLD_ID_FIELDS:
                identifier = value.get(id_field)
                if isinstance(identifier, str):
                    if identifier in seen:
                        raise ValueError(f"{profile['id']}: duplicate old item id {identifier}")
                    seen.add(identifier)
                    statement = next(
                        (
                            value.get(field)
                            for field in ("claim", "statement", "goal", "constraint", "relationship_type")
                            if isinstance(value.get(field), str) and value.get(field)
                        ),
                        identifier,
                    )
                    records.append(
                        {
                            "old_claim_id": identifier,
                            "source_section": path,
                            "original_statement": statement,
                        }
                    )
                    break
            for key, child in value.items():
                visit(child, f"{path}.{key}" if path else key)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                visit(child, f"{path}[{index}]")

    visit(profile, "")
    return records


def evidence_mode(claim: dict[str, Any]) -> str:
    value = claim.get("evidence_mode")
    allowed = {
        "explicit_source_statement", "repeated_observed_behavior", "single_observed_behavior",
        "authorial_definition", "continuation_confirmed", "character_testimony",
        "character_belief", "character_theory", "possible_future", "inference",
    }
    return value if value in allowed else "explicit_source_statement"


def uncertainty_for(claim: dict[str, Any]) -> str:
    if claim.get("stability") == "conditional":
        return "uncertain"
    if claim.get("evidence_mode") in {"character_belief", "inference", "possible_future"}:
        return "character_belief"
    return "confirmed"


def source_refs(value: dict[str, Any], fallback: str) -> list[str]:
    sources = value.get("sources") or value.get("source_refs") or []
    return ordered_unique([item for item in sources if isinstance(item, str)]) or [fallback]


def convert_identity_claim(claim: dict[str, Any], fallback: str) -> dict[str, Any]:
    suffix = safe_token(claim["claim_id"].removeprefix("CLAIM_"))
    return {
        "identity_id": f"IDENTITY_{suffix}",
        "statement": claim["claim"],
        "evidence_mode": evidence_mode(claim),
        "attribution": "旧 Profile 中已有来源支持的身份 claim",
        "uncertainty": uncertainty_for(claim),
        "source_refs": source_refs(claim, fallback),
        "notes": claim.get("notes", ""),
    }


def convert_background_claim(claim: dict[str, Any], fallback: str, prefix: str = "") -> dict[str, Any]:
    suffix = safe_token(claim["claim_id"].removeprefix("CLAIM_"))
    return {
        "background_id": f"BACKGROUND_{prefix}{suffix}",
        "statement": claim["claim"],
        "temporal_scope": claim.get("context") or "既有历史；精确年代未由迁移补写",
        "relative_time": "Campaign 前史或在 Campaign 中回述的既往历史",
        "reality_status": "BIOGRAPHICAL_BACKGROUND",
        "evidence_mode": evidence_mode(claim),
        "attribution": "旧 Profile source-bound claim",
        "source_refs": source_refs(claim, fallback),
        "related_event_refs": [],
        "uncertainty": uncertainty_for(claim),
        "notes": claim.get("notes", ""),
    }


def convert_persona_claim(claim: dict[str, Any], fallback: str) -> dict[str, Any]:
    suffix = safe_token(claim["claim_id"].removeprefix("CLAIM_"))
    observed = claim.get("evidence_mode") == "single_observed_behavior"
    return {
        "persona_id": f"PERSONA_{suffix}",
        "statement": claim["claim"],
        "stability": "observed_only" if observed else claim.get("stability", "unresolved"),
        "reality_status": "OBSERVED_BEHAVIOR" if observed else "BELIEF",
        "evidence_mode": evidence_mode(claim),
        "attribution": "旧 Profile persona claim",
        "supporting_event_refs": [],
        "supporting_revelation_refs": [],
        "source_refs": source_refs(claim, fallback),
        "uncertainty": uncertainty_for(claim),
        "notes": claim.get("notes", ""),
    }


def convert_goal(item: dict[str, Any], fallback: str) -> dict[str, Any]:
    status = item.get("status", "unknown")
    goal_status = status if status in {"current", "completed", "failed", "abandoned", "unknown"} else "historical"
    if goal_status == "current":
        goal_status = "unknown"
    return {
        "goal_id": item["goal_id"],
        "statement": item["goal"],
        "goal_status": goal_status,
        "valid_from_event_ref": None,
        "valid_until_event_ref": None,
        "supporting_event_refs": [],
        "reality_status": "BELIEF",
        "evidence_mode": "explicit_source_statement",
        "attribution": "旧 Profile goal；未自动延续为 D3 当前目标",
        "source_refs": source_refs(item, fallback),
        "uncertainty": "uncertain" if status == "unknown" else "confirmed",
        "notes": item.get("notes", ""),
    }


def worldbook_to_profile_map(profiles: dict[str, Path]) -> dict[str, str]:
    return {
        load_json(path)["worldbook_id"]: profile_id
        for profile_id, path in profiles.items()
        if isinstance(load_json(path).get("worldbook_id"), str)
    }


def event_catalog() -> tuple[dict[str, dict[str, Any]], dict[str, int]]:
    events = load_events()
    return ({event["event_id"]: event for event in events}, {event["event_id"]: index for index, event in enumerate(events)})


def profile_layer(event: dict[str, Any]) -> str:
    return {
        "original_campaign": "original_campaign",
        "original_campaign_special_interlude": "special_interlude",
        "transition_canon": "transition",
    }[event["canon_layer"]]


def timeline_item(profile_id: str, event: dict[str, Any], indirect: bool = False) -> dict[str, Any]:
    roles = [
        participant["role"]
        for participant in event["participants"]
        if participant.get("character_ref") == profile_id
    ]
    revelations = [
        revelation
        for revelation in event["character_revelations"]
        if revelation.get("character_ref") == profile_id
    ]
    if roles:
        summary = f"角色以“{'、'.join(ordered_unique(roles))}”参与；{event['event_summary']}"
        role = "、".join(ordered_unique(roles))
    elif revelations:
        summary = "本事件记录了该角色相关 revelation：" + "；".join(item["statement"] for item in revelations)
        role = "revelation subject"
    else:
        summary = f"间接但人物连续性关键：{event['event_summary']}"
        role = "indirect continuity subject"
    consequence_lines = event["character_consequences"] + event["relationship_consequences"] + event["ability_status_consequences"] + event["knowledge_consequences"]
    consequence = "；".join(consequence_lines)
    return {
        "timeline_id": f"TIMELINE_{profile_id.removeprefix('NPC_').removeprefix('PC_')}_{event['event_id'].removeprefix('EVENT_')}",
        "event_ref": event["event_id"],
        "story_order_start": event["story_axis"]["story_order_start"],
        "story_order_end": event["story_axis"]["story_order_end"],
        "profile_canon_layer": profile_layer(event),
        "role_in_event": role,
        "character_specific_summary": summary,
        "character_consequence": consequence,
        "revelation_refs": [item["revelation_id"] for item in revelations],
        "evidence_refs": [item["reference"] for item in event["source_axis"]],
        "reality_status": "ACTUAL_EVENT",
        "uncertainty": "uncertain" if event["story_axis"]["order_certainty"] == "uncertain" else "confirmed",
        "notes": "Indirect continuity inclusion." if indirect else "Exact-reference R2B link reviewed in R2C.",
    }


def input_considered(profile_id: str, source_path: str | None) -> list[dict[str, str]]:
    return [
        {"input_class": "old_claims", "path": source_path or "none:new provisional discovery", "result": "逐项建立 disposition；没有旧档案时为空。"},
        {"input_class": "direct_temporal_links", "path": f"work/phase3d_r2b/indexes/by_profile/{profile_id}.json", "result": "仅作为 exact-reference lookup，不视为完整历史。"},
        {"input_class": "indirect_continuity_events", "path": "work/phase3d_r2/chronology/campaign_chronology.jsonl", "result": "按显式 migration rules 审查间接关键事件。"},
        {"input_class": "revelations", "path": "work/phase3d_r2/chronology/character_revelations.jsonl", "result": "保持 attribution 与 evidence status。"},
        {"input_class": "event_audits", "path": "work/phase3d_r2/event_audits/", "result": "用于高风险事件语义边界。"},
        {"input_class": "retention_records", "path": "work/phase3d_r2/reports/early_arc_character_retention.md", "result": "检查 Part 1 持续影响。"},
        {"input_class": "discoveries", "path": "work/phase3d_r2/character_discoveries/", "result": "只创建证据足够的 provisional discovery。"},
        {"input_class": "d3_state", "path": "current_state.md:D3", "result": "仅此来源可填 dynamic_state。"},
        {"input_class": "worldbook_references", "path": "output/worldbook_source.jsonl", "result": "只辅助稳定身份与架构映射。"},
    ]


def empty_dynamic_state() -> dict[str, Any]:
    return {
        "as_of": "D3", "current_conditions": [], "current_obligations": [],
        "current_location_ref": None, "current_faction_role": None, "current_concerns": [],
        "source_refs": [], "notes": "没有以历史资料推断 D3 角色专属状态。",
    }


def event_source_refs(events: dict[str, dict[str, Any]], event_id: str) -> list[str]:
    return ordered_unique(item["reference"] for item in events[event_id]["source_axis"])


def knowledge_item(
    *,
    knowledge_id: str,
    proposition: str,
    epistemic_status: str,
    event: dict[str, Any],
    source_character_ref: str | None,
    attribution: str,
    reality_status: str,
    uncertainty: str,
    notes: str,
) -> dict[str, Any]:
    order = event["story_axis"]["story_order_start"]
    return {
        "knowledge_id": knowledge_id,
        "proposition": proposition,
        "epistemic_status": epistemic_status,
        "acquired_at_event_ref": event["event_id"],
        "acquired_at_story_order": order,
        "source_character_ref": source_character_ref,
        "attribution": attribution,
        "supersedes": [],
        "valid_from": order,
        "valid_until": None,
        "reality_status": reality_status,
        "source_refs": event_source_refs({event["event_id"]: event}, event["event_id"]),
        "uncertainty": uncertainty,
        "notes": notes,
    }


def ability_transition(
    *,
    transition_id: str,
    event: dict[str, Any] | None,
    background_ref: str | None,
    transition_type: str,
    before_state: str | None,
    after_state: str,
    persistence: str,
    attribution: str,
    source_refs_value: list[str],
    uncertainty: str,
    notes: str,
) -> dict[str, Any]:
    return {
        "transition_id": transition_id,
        "event_ref": event["event_id"] if event else None,
        "background_ref": background_ref,
        "story_order": event["story_axis"]["story_order_start"] if event else None,
        "transition_type": transition_type,
        "before_state": before_state,
        "after_state": after_state,
        "persistence": persistence,
        "reality_status": "ACTUAL_EVENT" if event else "BIOGRAPHICAL_BACKGROUND",
        "evidence_mode": "explicit_source_statement",
        "attribution": attribution,
        "source_refs": source_refs_value,
        "uncertainty": uncertainty,
        "notes": notes,
    }


def timeline_id(package: dict[str, Any], event_id: str) -> str:
    return next(item["timeline_id"] for item in package["timeline_items"] if item["event_ref"] == event_id)


def reroute_background_claim(
    package: dict[str, Any],
    claim_id: str,
    migration_status: str,
    destination_ids: list[str],
) -> dict[str, Any]:
    background_id = "BACKGROUND_" + claim_id.removeprefix("CLAIM_")
    background = next(item for item in package["background_items"] if item["background_id"] == background_id)
    package["background_items"] = [
        item for item in package["background_items"] if item["background_id"] != background_id
    ]
    migration = next(item for item in package["old_claim_migrations"] if item["old_claim_id"] == claim_id)
    migration["migration_status"] = migration_status
    migration["destination_ids"] = destination_ids
    migration["reason"] = "该旧 claim 描述 Campaign 中实际发生的事件/状态变化，已显式迁往中央事件引用或状态转移，不再重复作为 biographical background。"
    return background


def apply_high_risk_overrides(
    package: dict[str, Any],
    events: dict[str, dict[str, Any]],
) -> None:
    """Apply explicit, source-bound semantic rulings for audited high-risk profiles."""
    profile_id = package["profile_id"]

    if profile_id == "NPC_CASSANDRA":
        event = events["EVENT_P3_006_CASSANDRA_FUTURES_AND_TRADE"]
        refs = event_source_refs(events, event["event_id"])
        package["persona"]["motivations"].append({
            "motivation_id": "MOTIVATION_CASSANDRA_CURRENT_REVENGE",
            "statement": "卡珊德拉在当前谈判中明确执着于对付白色魔法使、取得其炼金素材并维持复仇轨道。",
            "stability": "situational",
            "valid_from_event_ref": event["event_id"],
            "valid_until_event_ref": None,
            "supporting_event_refs": [event["event_id"]],
            "supporting_revelation_refs": ["REVEAL_P3_CASSANDRA_CURRENT_REVENGE_001"],
            "reality_status": "OBSERVED_BEHAVIOR",
            "evidence_mode": "repeated_observed_behavior",
            "attribution": "卡珊德拉当前言行与叙事观察；不等同于未来视觉。",
            "source_refs": refs,
            "uncertainty": "confirmed",
            "notes": "只确认 P3-006 当时的复仇动机，不推定永久目标或最终结果。",
        })
        package["nonactual_projections"].append({
            "projection_id": "PROJECTION_CASSANDRA_POSSIBLE_FUTURE_REVENGE",
            "subject_character_ref": "NPC_CASSANDRA",
            "statement": "耶各装备展示的一条可变未来中，白魔发动魔女之宴后，卡珊德拉以暴力完成复仇。",
            "reality_status": "POSSIBLE_FUTURE_VISION",
            "source_event_ref": event["event_id"],
            "source_story_order": event["story_axis"]["story_order_start"],
            "observer_character_ref": "PC_YU_LINFENG",
            "attribution": "御临风通过耶各装备所见的可变未来；不是卡珊德拉已采取的行动。",
            "subject_awareness": "not_indicated",
            "source_refs": refs,
            "uncertainty": "uncertain",
            "notes": "未来已明确可被改写；卡珊德拉是否知道该画面，来源未指出。",
        })
        reroute_background_claim(
            package, "CLAIM_CASSANDRA_PREWAR_WARNING", "MOVED_TO_TIMELINE",
            [timeline_id(package, "EVENT_P3_005_XIERLUN_FRONT_AND_WHITE_MAGE_PROPOSAL")],
        )
        reroute_background_claim(
            package, "CLAIM_CASSANDRA_AINZ_INTERMEDIARY", "MOVED_TO_TIMELINE",
            [timeline_id(package, "EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION")],
        )

    if profile_id == "NPC_DEATHWING":
        testimony = events["EVENT_P2_022_DEATHWING_HISTORY_TESTIMONY"]
        theory = events["EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY"]
        battle = events["EVENT_P3_009_DEATHWING_FINAL_WAR"]
        package["knowledge_items"].extend([
            knowledge_item(
                knowledge_id="KNOWLEDGE_DEATHWING_OSHIRA_HISTORY_TESTIMONY",
                proposition="奥希拉关于死亡之翼降生、祝福、战争、繁荣、死亡与和平联系的黑龙古史陈述。",
                epistemic_status="TESTIMONY_HEARD", event=testimony,
                source_character_ref="NPC_OSHIRA", attribution="奥希拉 testimony",
                reality_status="TESTIMONY", uncertainty="character_belief",
                notes="该陈述是黑龙族长 testimony，不自动升级为客观古史。",
            ),
            knowledge_item(
                knowledge_id="KNOWLEDGE_DEATHWING_WHITE_MAGE_GROUND_THEORY",
                proposition="白色魔法使理论化死亡之翼的不死性源于大地，并可能与大陆不死问题的解药有关。",
                epistemic_status="THEORY", event=theory,
                source_character_ref="NPC_WHITE_MAGICIAN", attribution="白色魔法使理论陈述",
                reality_status="THEORY", uncertainty="character_belief",
                notes="理论未被独立证实，不作为死亡之翼机制事实。",
            ),
        ])
        package["ability_status_items"].append(ability_transition(
            transition_id="TRANSITION_DEATHWING_CURRENT_BODY_DESTROYED",
            event=battle, background_ref=None, transition_type="body_destruction",
            before_state="本轮肉身仍在战场活动",
            after_state="本轮肉身瓦解，黑龙军团随之崩解",
            persistence="unknown", attribution="P3-009 campaign record",
            source_refs_value=event_source_refs(events, battle["event_id"]),
            uncertainty="uncertain",
            notes="只确认当前肉身被毁；永久死亡、复活机制与后续存在状态均未知。",
        ))
        reroute_background_claim(
            package, "CLAIM_DEATHWING_HISTORY_1", "SPLIT",
            [timeline_id(package, battle["event_id"]), "TRANSITION_DEATHWING_CURRENT_BODY_DESTROYED"],
        )
        reroute_background_claim(
            package, "CLAIM_DEATHWING_INVASION_CONTINUITY", "MOVED_TO_TIMELINE",
            [
                timeline_id(package, "EVENT_P2_029_DEATHWING_BATTLEFIELD_AND_SEAL_WARNING"),
                timeline_id(package, "EVENT_P3_002_SANCTUARY_ENTRY"),
            ],
        )

    if profile_id == "NPC_WHITE_MAGICIAN":
        theory = events["EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY"]
        package["knowledge_items"].append(knowledge_item(
            knowledge_id="KNOWLEDGE_WHITE_MAGICIAN_FATE_AND_GROUND_THEORY",
            proposition="白色魔法使提出命为定数、运为变数、异乡来客为异数，并把死亡之翼不死性与大地及大陆不死问题联系起来。",
            epistemic_status="THEORY", event=theory,
            source_character_ref="NPC_WHITE_MAGICIAN", attribution="白色魔法使本人理论陈述",
            reality_status="THEORY", uncertainty="character_belief",
            notes="与监狱塔前史、地下兵工厂/追击洞窟交锋和根基密室实际行动分别记录。",
        ))
        gem_background = reroute_background_claim(
            package, "CLAIM_WHITE_MAGICIAN_GEM_HISTORY", "SPLIT",
            [
                timeline_id(package, "EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY"),
                "TRANSITION_WHITE_MAGICIAN_GEM_REMOVED_D1",
            ],
        )
        reroute_background_claim(
            package, "CLAIM_WHITE_MAGICIAN_FACTORY_CONFRONTATION", "MOVED_TO_TIMELINE",
            [timeline_id(package, "EVENT_P2_023_WHITE_MAGICIAN_ARMORY_CONFRONTATION")],
        )
        control_background = reroute_background_claim(
            package, "CLAIM_WHITE_MAGICIAN_OSHIRA_CONTROL", "MOVED_TO_ABILITY_STATUS",
            ["TRANSITION_WHITE_MAGICIAN_CONTROLS_OSHIRA"],
        )
        transition_event = events["EVENT_TRANSITION_D1_COLLAPSE_EVACUATION"]
        package["ability_status_items"].extend([
            ability_transition(
                transition_id="TRANSITION_WHITE_MAGICIAN_GEM_REMOVED_D1",
                event=transition_event, background_ref=None, transition_type="artifact_removal",
                before_state="魔宝石仍维持龙族秘境；P3-010 中白魔已取出并准备带走",
                after_state="白魔最终取走魔宝石，秘境失去维持条件",
                persistence="persistent", attribution="current_state.md 最小 Transition Canon",
                source_refs_value=event_source_refs(events, transition_event["event_id"]),
                uncertainty="confirmed",
                notes="P3-010 原团只到准备离开；实际取走严格归入 D1 Transition Canon。",
            ),
            ability_transition(
                transition_id="TRANSITION_WHITE_MAGICIAN_CONTROLS_OSHIRA",
                event=None, background_ref=None, transition_type="control_of_other",
                before_state=None, after_state="龙族秘境战中操控黑龙族长奥希拉进行破坏和作战",
                persistence="unknown", attribution="团录确认白魔为操控方；具体机制未确认",
                source_refs_value=control_background["source_refs"], uncertainty="uncertain",
                notes="此为 Campaign 内行动但 R2A 尚无独立中央事件；已路由 EVENT_LAYER_REQUIRED，不作为前史背景。",
            ),
        ])
        del gem_background

    if profile_id == "NPC_OSHIRA":
        testimony = events["EVENT_P2_022_DEATHWING_HISTORY_TESTIMONY"]
        control_background = next(item for item in package["background_items"] if item["background_id"] == "BACKGROUND_OSHIRA_DRAGON_WAR_CONTROL")
        package["ability_status_items"].append(ability_transition(
            transition_id="TRANSITION_OSHIRA_NONVOLUNTARY_CONTROL",
            event=None, background_ref=None, transition_type="control",
            before_state=None,
            after_state="龙族秘境战中遭到非自愿控制，并被操控进行破坏和作战",
            persistence="unknown", attribution="团录确认这是非自愿控制，且白魔为操控方；不确认施术机制",
            source_refs_value=control_background["source_refs"], uncertainty="uncertain",
            notes="控制机制、当时意识状态、抵抗、事后记忆与长期持续性均未知；不得把控制归因为血脉魔法。",
        ))
        package["knowledge_items"].append(knowledge_item(
            knowledge_id="KNOWLEDGE_OSHIRA_DEATHWING_HISTORY_TESTIMONY",
            proposition="奥希拉向在场者陈述黑龙先祖死亡之翼相关的族群历史。",
            epistemic_status="TESTIMONY_HEARD", event=testimony,
            source_character_ref="NPC_OSHIRA", attribution="奥希拉本人作为 testimony 来源",
            reality_status="TESTIMONY", uncertainty="character_belief",
            notes="她说明所知多来自传闻；不把 testimony 升级为客观历史。",
        ))
        reroute_background_claim(
            package, "CLAIM_OSHIRA_DRAGON_WAR_CONTROL", "MOVED_TO_ABILITY_STATUS",
            ["TRANSITION_OSHIRA_NONVOLUNTARY_CONTROL"],
        )

    if profile_id == "NPC_YOUYOU":
        transition_specs = [
            ("TRANSITION_YOUYOU_CURSE_TRANSFER", "EVENT_P1_021_JERGAL_TRANSFER", "curse_transfer", "悠悠身上的致命诅咒", "御临风自愿承接诅咒后，诅咒从悠悠处转出", "ended"),
            ("TRANSITION_YOUYOU_CLAN_LEADERSHIP_AND_NAME", "EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION", "identity_and_role", "芬尔德·特兰希尔", "被宣布为空间龙族族长并继承‘琳’之字", "persistent"),
            ("TRANSITION_YOUYOU_LAST_POWER_RECEIVED", "EVENT_P3_003_TEIRESIAS_REVELATION", "power_received", None, "泰蕾斯消散前把最后力量交给悠悠", "unknown"),
            ("TRANSITION_YOUYOU_SERTANT_AWAKENING", "EVENT_P3_004_SERTANT_AWAKENING_AND_HOME", "externally_imposed_awakening", "瑟坦特因假面而昏睡", "来自悠悠的光使瑟坦特苏醒并启动假面参战", "ended"),
            ("TRANSITION_YOUYOU_PROTECTION_EFFECT", "EVENT_P3_009_DEATHWING_FINAL_WAR", "protection_effect", None, "悠悠留下的乳白力量在终局战中实际保护御临风", "ended"),
        ]
        for transition_id, event_id, transition_type, before, after, persistence in transition_specs:
            event = events[event_id]
            package["ability_status_items"].append(ability_transition(
                transition_id=transition_id, event=event, background_ref=None,
                transition_type=transition_type, before_state=before, after_state=after,
                persistence=persistence, attribution="R2A chronology 与原团事件记录",
                source_refs_value=event_source_refs(events, event_id),
                uncertainty="uncertain" if persistence == "unknown" else "confirmed",
                notes="只记录该事件明确发生的变化，不外推 D3 当前能力、婚姻状态或永久保护。",
            ))
        youyou_routes = [
            ("CLAIM_YOUYOU_NAME_STAGES", "SPLIT", [timeline_id(package, "EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION"), "TRANSITION_YOUYOU_CLAN_LEADERSHIP_AND_NAME"]),
            ("CLAIM_YOUYOU_RESCUE_HISTORY", "SPLIT", [timeline_id(package, "EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE"), timeline_id(package, "EVENT_P1_021_JERGAL_TRANSFER"), "TRANSITION_YOUYOU_CURSE_TRANSFER"]),
            ("CLAIM_YOUYOU_SWORD_AND_DETENTION", "SPLIT", [timeline_id(package, "EVENT_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION"), timeline_id(package, "EVENT_P1_021_JERGAL_TRANSFER"), "TRANSITION_YOUYOU_CURSE_TRANSFER"]),
            ("CLAIM_YOUYOU_SERTANT_AWAKENING", "SPLIT", [timeline_id(package, "EVENT_P3_004_SERTANT_AWAKENING_AND_HOME"), "TRANSITION_YOUYOU_SERTANT_AWAKENING"]),
            ("CLAIM_YOUYOU_ENGAGEMENT_HISTORY", "SPLIT", [timeline_id(package, "EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION"), "MILESTONE_YOUYOU_YU_LATE_MILESTONES"]),
            ("CLAIM_YOUYOU_INHERITANCE_HISTORY", "SPLIT", [timeline_id(package, "EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION"), "TRANSITION_YOUYOU_CLAN_LEADERSHIP_AND_NAME"]),
            ("CLAIM_YOUYOU_PROPHECY_HISTORY", "SPLIT", [timeline_id(package, "EVENT_P3_003_TEIRESIAS_REVELATION"), "TRANSITION_YOUYOU_LAST_POWER_RECEIVED"]),
            ("CLAIM_YOUYOU_PROTECTION_HISTORY", "SPLIT", [timeline_id(package, "EVENT_P3_009_DEATHWING_FINAL_WAR"), "TRANSITION_YOUYOU_PROTECTION_EFFECT"]),
        ]
        for claim_id, status, destinations in youyou_routes:
            reroute_background_claim(package, claim_id, status, destinations)


def build_existing_package(
    profile_id: str,
    path: Path,
    profiles: dict[str, Path],
    events: dict[str, dict[str, Any]],
    event_order: dict[str, int],
    rules: dict[str, Any],
) -> dict[str, Any]:
    profile = load_json(path)
    fallback = path.relative_to(ROOT).as_posix()
    wb_map = worldbook_to_profile_map(profiles)

    identity = {
        "public_identity": [convert_identity_claim(item, fallback) for item in profile["identity"]["public_identity"]],
        "species_or_entity": [],
        "durable_roles": [convert_identity_claim(item, fallback) for item in profile["identity"]["durable_roles"]],
        "durable_affiliations": [],
    }
    backgrounds = [convert_background_claim(item, fallback) for item in profile["identity"]["established_history"]]
    persona = {
        "core_personality": [convert_persona_claim(item, fallback) for item in profile["core_personality"]],
        "values": [convert_persona_claim(item, fallback) for item in profile["values"]],
        "speech_style": [convert_persona_claim(item, fallback) for item in profile["speech_style"]],
        "decision_patterns": [convert_persona_claim(item, fallback) for item in profile["decision_patterns"]],
        "motivations": [],
    }
    goals = {"historical_goals": [], "current_goals": [], "long_term_goals": [], "private_goals": []}
    for source_bucket, items in profile["goals"].items():
        target = {
            "public_goals": "historical_goals", "declared_goals": "historical_goals",
            "private_goals": "private_goals", "current_goals": "current_goals",
            "long_term_goals": "long_term_goals", "confirmed_continuation_goals": "current_goals",
        }.get(source_bucket, "historical_goals")
        goals[target].extend(convert_goal(item, fallback) for item in items)

    relationships: list[dict[str, Any]] = []
    for relationship in profile["relationships"]:
        milestones = []
        for claim in relationship["established_history"]:
            background = convert_background_claim(claim, fallback, prefix="REL_")
            backgrounds.append(background)
            suffix = safe_token(claim["claim_id"].removeprefix("CLAIM_"))
            milestones.append(
                {
                    "milestone_id": f"MILESTONE_{suffix}", "event_ref": None,
                    "background_ref": background["background_id"], "story_order": None,
                    "change": claim["claim"], "reality_status": "BIOGRAPHICAL_BACKGROUND",
                    "evidence_mode": evidence_mode(claim), "attribution": "旧 Profile relationship history",
                    "source_refs": source_refs(claim, fallback), "uncertainty": uncertainty_for(claim),
                    "notes": claim.get("notes", ""),
                }
            )
        current_stance = "；".join(item["claim"] for item in relationship["current_stance"]) or None
        subject = relationship["subject_ref"]
        relationships.append(
            {
                "relationship_id": relationship["relationship_id"],
                "related_character_ref": wb_map.get(subject),
                "related_character_label": None if subject in wb_map else subject,
                "relationship_baseline": relationship["relationship_type"],
                "relationship_milestones": milestones,
                "current_stance": current_stance,
                "source_refs": source_refs(relationship, fallback),
                "uncertainty": "confirmed" if current_stance else "uncertain",
                "notes": relationship.get("notes", ""),
            }
        )

    knowledge = []
    for item in profile["epistemic_state"]:
        epistemic = {
            "knows": "KNOWS", "believes": "BELIEVES", "suspects": "SUSPECTS",
            "does_not_know": "MISCONCEPTION", "secrets": "KNOWS",
        }.get(item["epistemic_type"], "BELIEVES")
        knowledge.append(
            {
                "knowledge_id": item["knowledge_id"], "proposition": item["statement"],
                "epistemic_status": epistemic, "acquired_at_event_ref": None,
                "acquired_at_story_order": None, "source_character_ref": None,
                "attribution": "旧 Profile epistemic item；取得时间未自动补写",
                "supersedes": [], "valid_from": None, "valid_until": None,
                "reality_status": "BELIEF", "source_refs": source_refs(item, fallback),
                "uncertainty": "uncertain", "notes": item.get("notes", ""),
            }
        )

    event_ids: list[tuple[str, bool]] = []
    index_path = R2B_INDEX_ROOT / f"{profile_id}.json"
    if index_path.is_file():
        event_ids.extend((item["event_id"], False) for item in load_json(index_path)["event_links"])
    direct_ids = {event_id for event_id, _ in event_ids}
    for event_id in rules.get("indirect_events", {}).get(profile_id, []):
        if event_id not in direct_ids:
            event_ids.append((event_id, True))
    event_ids.sort(key=lambda pair: event_order[pair[0]])
    timeline = [timeline_item(profile_id, events[event_id], indirect) for event_id, indirect in event_ids]

    rp_constraints = [
        {
            "constraint_id": item["constraint_id"], "statement": item["constraint"],
            "source_refs": source_refs(item, fallback), "notes": item.get("notes", ""),
        }
        for item in profile["rp_constraints"]
    ]
    for index, statement in enumerate(rules.get("prohibited_inferences", {}).get(profile_id, []), 1):
        rp_constraints.append(
            {
                "constraint_id": f"CONSTRAINT_R2C_{profile_id}_{index}", "statement": statement,
                "source_refs": ["docs/superpowers/specs/2026-09-30-phase3d-r2c-character-profile-v2-design.md"],
                "notes": "R2C anti-inference boundary.",
            }
        )

    inventory = old_claim_inventory(profile)
    destination_by_old_id: dict[str, tuple[str, list[str]]] = {}
    for source_section, destination, status in (
        ("identity.public_identity", identity["public_identity"], "MIGRATED"),
        ("identity.durable_roles", identity["durable_roles"], "MIGRATED"),
        ("identity.established_history", backgrounds, "MOVED_TO_BACKGROUND"),
        ("core_personality", persona["core_personality"], "RETAINED_AS_PERSONA"),
        ("values", persona["values"], "RETAINED_AS_PERSONA"),
        ("speech_style", persona["speech_style"], "RETAINED_AS_PERSONA"),
        ("decision_patterns", persona["decision_patterns"], "RETAINED_AS_PERSONA"),
    ):
        del source_section
        for item in destination:
            candidate_id = next(value for key, value in item.items() if key.endswith("_id"))
            suffix = safe_token(candidate_id)
            destination_by_old_id.setdefault(suffix, (status, [candidate_id]))

    migrations = []
    for old in inventory:
        old_id = old["old_claim_id"]
        if old_id.startswith("RELATIONSHIP_"):
            status, destinations = "MOVED_TO_RELATIONSHIP", [old_id]
        elif old_id.startswith("KNOWLEDGE_"):
            status, destinations = "MOVED_TO_KNOWLEDGE", [old_id]
        elif old_id.startswith("GOAL_"):
            status, destinations = "MOVED_TO_GOAL", [old_id]
        elif old_id.startswith("CONSTRAINT_"):
            status, destinations = "MIGRATED", [old_id]
        elif ".relationships" in old["source_section"] or old["source_section"].startswith("relationships"):
            matching = [item["milestone_id"] for relationship in relationships for item in relationship["relationship_milestones"] if safe_token(old_id.removeprefix("CLAIM_")) in item["milestone_id"]]
            status, destinations = "MOVED_TO_RELATIONSHIP", matching
        elif old["source_section"].startswith("identity.established_history"):
            matching = [item["background_id"] for item in backgrounds if safe_token(old_id.removeprefix("CLAIM_")) in item["background_id"]]
            status, destinations = "MOVED_TO_BACKGROUND", matching
        elif old["source_section"].startswith(("core_personality", "values", "speech_style", "decision_patterns")):
            matching = [item["persona_id"] for bucket in persona.values() if isinstance(bucket, list) for item in bucket if isinstance(item, dict) and safe_token(old_id.removeprefix("CLAIM_")) in item.get("persona_id", "")]
            status = "DEMOTED_TO_OBSERVED_BEHAVIOR" if any(item.get("persona_id") in matching and item.get("stability") == "observed_only" for bucket in persona.values() if isinstance(bucket, list) for item in bucket if isinstance(item, dict)) else "RETAINED_AS_PERSONA"
            destinations = matching
        elif old["source_section"].startswith("identity"):
            matching = [item["identity_id"] for bucket in identity.values() for item in bucket if safe_token(old_id.removeprefix("CLAIM_")) in item["identity_id"]]
            status, destinations = "MIGRATED", matching
        else:
            status, destinations = "UNRESOLVED", []
        migrations.append(
            {
                **old, "migration_status": status, "destination_ids": destinations,
                "reason": "R2C explicit section routing; ambiguous chronology remains unresolved rather than inferred.",
                "supporting_refs": [fallback],
            }
        )

    presence = {
        "life_status": profile["presence"]["life_status"],
        "narrative_availability": profile["presence"]["narrative_availability"],
        "canon_layers": profile["presence"]["realm_scope"],
        "source_refs": source_refs(profile["presence"], fallback),
        "uncertainty": "uncertain" if profile["presence"]["life_status"] == "unknown" else "confirmed",
        "notes": profile["presence"].get("notes", ""),
    }
    gaps = ordered_unique(profile.get("evidence_gaps", []))
    gap_routes = [
        {
            "gap_id": f"GAP_{profile_id}_{index}", "issue": issue,
            "routes": ["PROFILE_ONLY"], "source_refs": [fallback],
            "notes": "保持未解决，不由迁移自动填补。",
        }
        for index, issue in enumerate(gaps, 1)
    ]
    package = {
        "schema_version": "R2C-MIGRATION-1", "phase": "3D-R2C",
        "package_status": "PROVISIONAL_REVIEWABLE_DECISION_LAYER",
        "profile_id": profile_id, "source_profile_candidate": fallback,
        "inputs_considered": input_considered(profile_id, fallback),
        "profile_metadata": {
            "profile_kind": profile["profile_kind"], "profile_status": "existing",
            "worldbook_id": profile["worldbook_id"], "worldbook_mapping_status": "existing",
            "name": profile["name"], "aliases": profile["aliases"], "profile_depth": profile["profile_depth"],
            "canon_layers": profile["canon_layers"], "control_mode": profile["control_mode"],
            "ai_permissions": profile["ai_permissions"], "identity": identity,
            "notes": "Existing effective profile migrated provisionally; not approved or applied.",
        },
        "old_claim_migrations": migrations,
        "background_items": backgrounds,
        "persona": persona,
        "goals": goals,
        "timeline_items": timeline,
        "relationship_items": relationships,
        "ability_status_items": [],
        "knowledge_items": knowledge,
        "nonactual_projections": [],
        "dynamic_state": empty_dynamic_state(),
        "presence": presence,
        "rp_constraints": rp_constraints,
        "evidence_gaps": gaps,
        "gap_routing": gap_routes,
        "human_review_notes": ["所有自动迁移结果均为 provisional，需逐项人工批准。"],
    }
    apply_high_risk_overrides(package, events)
    return package


def build_yang_package(events: dict[str, dict[str, Any]]) -> dict[str, Any]:
    discovery = load_json(ROOT / "work" / "phase3d_r2" / "character_discoveries" / "CHARACTER_YANG.json")
    event = events["EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY"]
    fallback = "work/phase3d_r2/character_discoveries/CHARACTER_YANG.json"
    identity_source = discovery["source_evidence"][0]["reference"]
    npc_permissions = {
        "may_generate_dialogue": True, "may_choose_voluntary_actions": True,
        "may_generate_private_thoughts": True, "may_assign_new_goals": False,
        "may_describe_external_effects": True, "may_describe_involuntary_physical_reactions": True,
        "may_summarize_user_declared_actions": False, "may_reference_established_history": True,
    }
    package = {
        "schema_version": "R2C-MIGRATION-1", "phase": "3D-R2C",
        "package_status": "PROVISIONAL_REVIEWABLE_DECISION_LAYER",
        "profile_id": "NPC_YANG", "source_profile_candidate": None,
        "inputs_considered": input_considered("NPC_YANG", None),
        "profile_metadata": {
            "profile_kind": "npc", "profile_status": "provisional_discovery",
            "worldbook_id": None, "worldbook_mapping_status": "provisional_unmapped",
            "name": "杨", "aliases": [], "profile_depth": "minimal",
            "canon_layers": ["original_campaign"], "control_mode": "npc_runtime",
            "ai_permissions": npc_permissions,
            "identity": {
                "public_identity": [{"identity_id": "IDENTITY_YANG_NAME", "statement": "该角色自报名为杨。", "evidence_mode": "explicit_source_statement", "attribution": "杨自我介绍", "uncertainty": "confirmed", "source_refs": [identity_source], "notes": "不扩写全名或别名。"}],
                "species_or_entity": [{"identity_id": "IDENTITY_YANG_SLIME_FORM", "statement": discovery["observed_form"], "evidence_mode": "explicit_source_statement", "attribution": "原团观察", "uncertainty": "confirmed", "source_refs": [identity_source], "notes": "只保留观察到的形态。"}],
                "durable_roles": [], "durable_affiliations": [],
            },
            "notes": "R2A-confirmed Canon discovery; still unapproved and unapplied.",
        },
        "old_claim_migrations": [], "background_items": [],
        "persona": {"core_personality": [], "values": [], "speech_style": [], "decision_patterns": [], "motivations": []},
        "goals": {"historical_goals": [], "current_goals": [], "long_term_goals": [], "private_goals": []},
        "timeline_items": [timeline_item("NPC_YANG", event, indirect=True)],
        "relationship_items": [], "ability_status_items": [],
        "knowledge_items": [{
            "knowledge_id": "KNOWLEDGE_YANG_SELF_REPORTED_ROLE", "proposition": discovery["self_reported_role"],
            "epistemic_status": "TESTIMONY_HEARD", "acquired_at_event_ref": event["event_id"],
            "acquired_at_story_order": event["story_axis"]["story_order_start"], "source_character_ref": "NPC_YANG",
            "attribution": "杨自述", "supersedes": [], "valid_from": event["story_axis"]["story_order_start"],
            "valid_until": None, "reality_status": "TESTIMONY", "source_refs": [discovery["source_evidence"][1]["reference"]],
            "uncertainty": "character_belief", "notes": "职位与经历未被独立确认。",
        }],
        "nonactual_projections": [],
        "dynamic_state": empty_dynamic_state(),
        "presence": {"life_status": "alive", "narrative_availability": "inactive", "canon_layers": ["original_campaign"], "source_refs": [identity_source], "uncertainty": "confirmed", "notes": "分别后的当前状态未知。"},
        "rp_constraints": [{"constraint_id": "CONSTRAINT_YANG_IDENTITY_TRIGGER_SEPARATION", "statement": "单字名的触发歧义不得否决 Canon 身份，也不得在 R2C 创建运行时触发词。", "source_refs": [fallback], "notes": "Canon/runtime 解耦。"}],
        "evidence_gaps": discovery["uncertainties"],
        "gap_routing": [{"gap_id": f"GAP_NPC_YANG_{index}", "issue": issue, "routes": ["PROFILE_ONLY"], "source_refs": [fallback], "notes": "保持 provisional。"} for index, issue in enumerate(discovery["uncertainties"], 1)],
        "human_review_notes": ["杨只作为 provisional_discovery 候选；无 Worldbook mapping、alias 或运行时触发。"],
    }
    return package


def prepare_all_packages(write: bool = True, output_root: Path = PACKAGE_ROOT) -> list[dict[str, Any]]:
    verify_frozen_manifest()
    profiles = load_effective_profiles()
    events, order = event_catalog()
    rules = load_json(RULES_PATH)
    packages = [
        build_existing_package(profile_id, path, profiles, events, order, rules)
        for profile_id, path in profiles.items()
    ]
    packages.append(build_yang_package(events))
    packages.sort(key=lambda item: item["profile_id"])
    errors = {
        package["profile_id"]: validate_package(package)
        for package in packages
        if validate_package(package)
    }
    if errors:
        raise ValueError("invalid migration packages:\n" + render_json(errors))
    if write:
        output_root.parent.mkdir(parents=True, exist_ok=True)
        staging = Path(tempfile.mkdtemp(prefix="phase3d_r2c_packages_", dir=output_root.parent))
        try:
            for package in packages:
                atomic_write_text(staging / f"{package['profile_id']}.json", render_json(package))
            if output_root.exists():
                shutil.rmtree(output_root)
            staging.replace(output_root)
        finally:
            if staging.exists():
                shutil.rmtree(staging)
    return packages


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    packages = prepare_all_packages(write=not args.check)
    print(f"prepared {len(packages)} provisional migration packages")


if __name__ == "__main__":
    main()
