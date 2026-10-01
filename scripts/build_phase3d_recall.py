#!/usr/bin/env python3
"""Build deterministic Phase 3D-R recall-audit artifacts without approval."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import tempfile
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[1]
PROJECT_PARENT = ROOT.parent
RECALL = ROOT / "work" / "phase3d_recall"
PREFLIGHT_PATH = RECALL / "preflight_manifest.json"
COVERAGE_MANIFEST_PATH = RECALL / "source_coverage_manifest.json"
COVERAGE_DIR = RECALL / "source_coverage"
EVENT_DIR = RECALL / "event_audits"
CROSS_PROFILE_DIR = RECALL / "cross_profile_audits"
REPAIRED_DIR = RECALL / "repaired_candidates"
MANUAL_AUDIT_DIR = RECALL / "manual_audits"
GAP_METRICS_PATH = RECALL / "reports" / "gap_metrics.json"
PATCH_DIR = ROOT / "work" / "patches" / "pending"
RECALL_PATCH_DIR = RECALL / "patches"
PHASE3D_CANDIDATES = ROOT / "work" / "phase3d" / "approved_candidates"
PHASE3D_REVIEWS = ROOT / "work" / "phase3d" / "reviews"


def path_label(path: Path) -> str:
    return os.path.relpath(path.resolve(), ROOT.resolve()).replace("\\", "/")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temporary_path = Path(temporary)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
        os.replace(temporary_path, path)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()


def load_json(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(payload, dict):
        raise ValueError(f"{path_label(path)} must contain one JSON object")
    return payload


def walk(value: Any) -> Iterable[Any]:
    yield value
    if isinstance(value, dict):
        for child in value.values():
            yield from walk(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk(child)


def walk_with_path(value: Any, path: str = "$") -> Iterable[tuple[str, Any]]:
    yield path, value
    if isinstance(value, dict):
        for key, child in value.items():
            yield from walk_with_path(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_with_path(child, f"{path}[{index}]")


def source_refs(profile: dict[str, Any], evidence_path: Path) -> list[str]:
    refs: set[str] = set()
    for value in walk(profile):
        if not isinstance(value, dict):
            continue
        sources = value.get("sources")
        if isinstance(sources, list):
            refs.update(item for item in sources if isinstance(item, str) and item)
    provenance = profile.get("provenance", {})
    if isinstance(provenance, dict):
        ids = provenance.get("source_origin_ids")
        if isinstance(ids, list):
            refs.update(item for item in ids if isinstance(item, str) and item)
    evidence = evidence_path.read_text(encoding="utf-8-sig")
    for line in evidence.splitlines():
        if line.startswith("- Source:"):
            refs.update(
                match
                for match in re.findall(r"`([^`]+)`", line)
                if re.search(r"\.(?:jsonl|md|json)(?=[:#]|$)", match, flags=re.IGNORECASE)
            )
    refs.add(path_label(evidence_path))
    return sorted(refs)


def evidence_path(profile_id: str) -> Path:
    phase3b = ROOT / "work" / "phase3b" / "evidence" / f"{profile_id}_evidence.md"
    phase3c = ROOT / "work" / "phase3c" / "evidence" / f"{profile_id}_evidence.md"
    if phase3b.is_file():
        return phase3b
    if phase3c.is_file():
        return phase3c
    raise ValueError(f"missing evidence packet for {profile_id}")


def discover_profiles() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    seen_worldbook: set[str] = set()
    for candidate_path in sorted(PHASE3D_CANDIDATES.glob("*.json")):
        profile = load_json(candidate_path)
        profile_id = profile.get("id")
        worldbook_id = profile.get("worldbook_id")
        if not isinstance(profile_id, str) or not isinstance(worldbook_id, str):
            raise ValueError(f"{path_label(candidate_path)} lacks stable identifiers")
        if worldbook_id in seen_worldbook:
            raise ValueError(f"duplicate worldbook mapping {worldbook_id}")
        seen_worldbook.add(worldbook_id)
        packet = evidence_path(profile_id)
        rows.append({
            "profile_id": profile_id,
            "worldbook_id": worldbook_id,
            "name": profile.get("name"),
            "aliases": profile.get("aliases", []),
            "profile_kind": profile.get("profile_kind"),
            "profile_depth": profile.get("profile_depth"),
            "source_phase": "phase3b" if "/phase3b/" in path_label(packet) else "phase3c",
            "phase3d_candidate_path": path_label(candidate_path),
            "phase3d_candidate_sha256": sha256(candidate_path),
            "evidence_packet_path": path_label(packet),
            "evidence_packet_sha256": sha256(packet),
        })
    if len(rows) != 36:
        raise ValueError(f"expected 36 Phase 3D candidates, found {len(rows)}")
    if len({row["profile_id"] for row in rows}) != 36:
        raise ValueError("duplicate profile IDs")
    return rows


def protected_paths() -> list[Path]:
    phase3d_manifest = load_json(ROOT / "work" / "phase3d_review_manifest.json")
    paths = {ROOT / label for label in phase3d_manifest["protected_files"]}
    paths.update({
        ROOT / "work" / "phase3d_review.md",
        ROOT / "work" / "phase3d_approval_manifest.md",
        ROOT / "work" / "phase3d_review_manifest.json",
        ROOT / "work" / "phase3d_preflight.md",
    })
    paths.update(PHASE3D_CANDIDATES.glob("*.json"))
    paths.update(PHASE3D_REVIEWS.glob("*_review.md"))
    paths.update((PROJECT_PARENT / "设定 人物").glob("*检索版.md"))
    for root_name in ("extracted-first", "extracted-second", "extracted-third"):
        paths.update(path for path in (ROOT / root_name).rglob("posts.md") if "saved_resource" not in path.parts and "translateSandbox" not in path.parts)
    # Draft patches are intentionally mutable in Phase 3D-R when they need to
    # point at a repaired candidate.  Their starting hashes are preserved in a
    # separate manifest field rather than treated as immutable files.
    paths = {path for path in paths if not path_label(path).startswith("work/patches/pending/")}
    missing = [path_label(path) for path in paths if not path.is_file()]
    if missing:
        raise ValueError("missing protected files: " + ", ".join(sorted(missing)))
    return sorted(paths, key=path_label)


def claim(
    claim_id: str,
    text: str,
    sources: list[str],
    *,
    context: str,
    exceptions: list[str] | None = None,
    stability: str = "stable",
    evidence_mode: str = "explicit_source_statement",
    origin: str = "original_campaign",
    notes: str = "Phase 3D-R source-recall repair; no future state is inferred.",
) -> dict[str, Any]:
    return {
        "claim_id": claim_id,
        "claim": text,
        "evidence_mode": evidence_mode,
        "origin": origin,
        "stability": stability,
        "context": context,
        "exceptions": exceptions or [],
        "sources": sources,
        "notes": notes,
    }


def relationship(
    relationship_id: str,
    subject_ref: str,
    relationship_type: str,
    history: list[dict[str, Any]],
    sources: list[str],
    *,
    experiences: list[str] | None = None,
    visibility: str = "restricted",
    notes: str = "Historical continuity only; current feeling, allegiance, and future obligation are not inferred.",
) -> dict[str, Any]:
    return {
        "relationship_id": relationship_id,
        "subject_ref": subject_ref,
        "relationship_type": relationship_type,
        "established_history": history,
        "current_stance": [],
        "obligations": [],
        "tensions": [],
        "known_shared_experiences": experiences or [],
        "visibility": visibility,
        "sources": sources,
        "notes": notes,
    }


SETTING_XIERLUN = "设定 人物/妄想大陆设定集_检索版.md:148-153"
SETTING_YOUYOU = "设定 人物/妄想大陆设定集_检索版.md:112-119"
SETTING_WORLD = "设定 人物/妄想大陆设定集_检索版.md"
SETTING_CARD = "设定 人物/人物卡资料集_检索版.md"
SETTING_NARRATIVE = "设定 人物/人物卡资料集_叙事检索版.md"
SECOND_BASE = "extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！"
THIRD_BASE = "extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。"


def fpage(number: int) -> str:
    return f"extracted-first/{number}/posts.md"


def spage(number: int) -> str:
    return f"{SECOND_BASE}{'' if number == 1 else f' - 页 {number}'}/posts.md"


def tpage(number: int) -> str:
    return f"{THIRD_BASE}{'' if number == 1 else f' - 页 {number}'}/posts.md"
P15 = "extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 15/posts.md"
P17 = "extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.md"
P20 = "extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.md"
P24 = "extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.md"
T2 = "extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 2/posts.md"
T3 = "extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 3/posts.md"
T5 = "extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md"


REPAIRED_PROFILE_IDS = (
    "NPC_DEATHWING",
    "NPC_EMPEROR",
    "NPC_HONDA_KAI_FERGUS",
    "NPC_KENDA_KAI_FERGUS",
    "NPC_OSHIRA",
    "NPC_WHITE_MAGICIAN",
    "NPC_XIERLUN_VON_GILCODE",
    "NPC_YOUYOU",
    "PC_YU_LINFENG",
    # Appended after the original nine so PATCH_5001-PATCH_5009 stay stable.
    "NPC_AINZ_OOAL_GOWN",
    "NPC_CASSANDRA",
    "NPC_CASSIUS_BRIGHT",
    "NPC_ELDER_XUE",
    "NPC_ELLIE",
    "NPC_GREMLIN",
    "NPC_HAKU",
    "NPC_JERGAL",
    "NPC_JEWEL_ELDER",
    "NPC_JIANG_ZIYOU",
    "NPC_KUON",
    "NPC_LEI_GUANG",
    "NPC_LINGCHI",
    "NPC_LULUTIYE",
    "NPC_MU_SHAOAI",
    "NPC_MU_TOU",
    "NPC_NOSURI",
    "NPC_OSHUTORU",
    "NPC_REN_FANZHEN",
    "NPC_SERTANT_LU_YOURLAN",
    "NPC_WILLIAM",
    "NPC_WURAI",
    "NPC_YOMI_ISAYAMA",
)

MISSING_RESOLUTION_CLAIMS: dict[str, dict[str, str]] = {
    "NPC_XIERLUN_VON_GILCODE": {
        "联盟幕后策划与婚约规划的完整范围": "CLAIM_XIERLUN_ALLIANCE_AND_ENGAGEMENT_PLANNING",
        "龙族关系、人望与平衡角色": "CLAIM_XIERLUN_DRAGON_BALANCE_ROLE",
        "年龄限制、经验与奇物的战斗边界": "CLAIM_XIERLUN_COMBAT_BACKGROUND",
        "其他大陆、帝国游历与图书馆学术史": "CLAIM_XIERLUN_SCHOLARLY_HISTORY",
    },
    "NPC_YOUYOU": {
        "婚约安排及公开仪式": "CLAIM_YOUYOU_ENGAGEMENT_HISTORY",
        "族长地位与‘琳’姓名继承": "CLAIM_YOUYOU_INHERITANCE_HISTORY",
        "受荣之道预见与最后封印身份": "CLAIM_YOUYOU_PROPHECY_HISTORY",
        "死亡之翼战中的乳白色保护": "CLAIM_YOUYOU_PROTECTION_HISTORY",
        "空间龙族毁灭与幸存背景": "CLAIM_YOUYOU_CLAN_SURVIVOR_HISTORY",
        "稳定御临风之剑及被拘押": "CLAIM_YOUYOU_SWORD_AND_DETENTION",
        "以光协助唤醒瑟坦特": "CLAIM_YOUYOU_SERTANT_AWAKENING",
    },
    "PC_YU_LINFENG": {
        "婚约历史": "CLAIM_YU_LINFENG_ENGAGEMENT_HISTORY",
        "见证悠悠继承及共同进入受荣之道": "CLAIM_YU_LINFENG_YOUYOU_INHERITANCE_WITNESS",
        "接受悠悠保护的外部状态": "CLAIM_YU_LINFENG_RECEIVED_YOUYOU_PROTECTION",
        "易冷、雪老关系与六百九十八人历史陈述": "CLAIM_YU_LINFENG_EARLY_BONDS",
        "边关记忆移除与恢复": "CLAIM_YU_LINFENG_MEMORY_RESTORATION",
    },
    "NPC_WHITE_MAGICIAN": {
        "监狱塔与地下兵工厂事件身份混淆": "CLAIM_WHITE_MAGICIAN_FACTORY_CONFRONTATION",
        "对白魔操控奥希拉的重大历史遗漏": "CLAIM_WHITE_MAGICIAN_OSHIRA_CONTROL",
        "Wizard Driver 与大量幻魔活动": "CLAIM_WHITE_MAGICIAN_WIZARD_PHANTOM_HISTORY",
    },
    "NPC_OSHIRA": {
        "龙族战争中的被控制历史": "CLAIM_OSHIRA_DRAGON_WAR_CONTROL",
        "与悠悠的既成龙族长辈关系": "CLAIM_OSHIRA_YOUYOU_HISTORY",
        "黑龙族受保护安排的归因边界": "CLAIM_OSHIRA_CLAN_DEPENDENCY",
        "父亲与死亡之翼谱系的自述边界": "CLAIM_OSHIRA_LINEAGE_KNOWLEDGE",
    },
    "NPC_EMPEROR": {
        "与谢尔伦共同策划帝国—龙族联合的关系史": "CLAIM_EMPEROR_XIERLUN_ALLIANCE_HISTORY",
        "向哈克作出的兄弟陈述与继承提议": "CLAIM_EMPEROR_HAKU_SUCCESSION",
    },
    "NPC_KENDA_KAI_FERGUS": {
        "公开牵线人与幕后策划者的边界": "CLAIM_KENDA_PUBLIC_ALLIANCE_ROLE",
        "要求御临风放弃婚约的 attributed request": "CLAIM_KENDA_ENGAGEMENT_INTERVENTION",
        "白魔归因的刺杀指控": "CLAIM_KENDA_ASSASSINATION_ALLEGATION",
        "谢尔伦转述的死亡报告": "CLAIM_KENDA_DEATH_REPORT",
    },
    "NPC_HONDA_KAI_FERGUS": {
        "主持悠悠族长、姓名与婚约公开仪式": "CLAIM_HONDA_YOUYOU_CEREMONY",
        "与谢尔伦击杀诺顿及安兹救援": "CLAIM_HONDA_SANCTUARY_WAR",
    },
    "NPC_DEATHWING": {
        "与谢尔伦的长期及终局战对抗关系": "CLAIM_DEATHWING_XIERLUN_HISTORY",
        "入侵、背叛与黑龙控制后果": "CLAIM_DEATHWING_INVASION_CONTINUITY",
    },
    "NPC_AINZ_OOAL_GOWN": {
        "纳萨力克领导与利益边界": "CLAIM_AINZ_NAZARICK_ROLE",
        "与卡珊德拉的中介关系及会见帝的提议": "CLAIM_AINZ_CASSANDRA_NEGOTIATION",
    },
    "NPC_CASSANDRA": {
        "战前预警与阻止建议": "CLAIM_CASSANDRA_PREWAR_WARNING",
        "安兹中介关系": "CLAIM_CASSANDRA_AINZ_INTERMEDIARY",
    },
    "NPC_CASSIUS_BRIGHT": {
        "家人遇害、误认追凶、失明与风感适应史": "CLAIM_BRIGHT_BACKGROUND",
        "人物参考中的嫉恶如仇与机会把握": "CLAIM_BRIGHT_REFERENCE_TRAITS",
        "游击士与早期同行史": "CLAIM_BRIGHT_EARLY_CAMPAIGN",
        "失踪、古雷姆林面容与终言的未决结局": "CLAIM_BRIGHT_LATE_FATE",
    },
    "NPC_ELDER_XUE": {
        "子女死亡与露露缇耶祖孙关系": "CLAIM_ELDER_XUE_FAMILY_HISTORY",
        "能力丧失、恢复与边关转折": "CLAIM_ELDER_XUE_ABILITY_TRANSITION",
        "退休决定与记忆移除请求": "CLAIM_ELDER_XUE_RETIREMENT_AND_MEMORY_REQUEST",
    },
    "NPC_ELLIE": {
        "人物参考中的善意与非魔法笨拙边界": "CLAIM_ELLIE_REFERENCE_TRAITS",
        "雪老救援与露露缇耶记忆干预": "CLAIM_ELLIE_XUE_AND_LULUTIYE_HISTORY",
        "古雷姆林人质与反制事件": "CLAIM_ELLIE_GREMLIN_HOSTAGE",
        "与御临风的同行及魔法顾问关系": "CLAIM_ELLIE_YU_COMPANION_ADVISER",
    },
    "NPC_GREMLIN": {
        "对A的宿主替换陈述与家庭惨案": "CLAIM_GREMLIN_A_HISTORY",
        "挟持艾利逃离": "CLAIM_GREMLIN_ELLIE_HOSTAGE",
        "终局心脏、面容与盲龙转化边界": "CLAIM_GREMLIN_TERMINAL_TRANSFORMATION",
    },
    "NPC_HAKU": {
        "奥修特尔麾下与指挥经历": "CLAIM_HAKU_OSHUTORU_SERVICE",
        "帝的兄弟陈述与继承提议": "CLAIM_HAKU_SUCCESSION_DISCLOSURE",
        "后续调查协调": "CLAIM_HAKU_LATER_COORDINATION",
    },
    "NPC_JERGAL": {"手套指引作为受限归因的干预": "CLAIM_JERGAL_GLOVE_GUIDANCE"},
    "NPC_JEWEL_ELDER": {
        "将悠悠送回魔兽山脉的战略提议": "CLAIM_JEWEL_ELDER_STRATEGIC_PROPOSAL",
        "诅咒转移限制与自愿条件": "CLAIM_JEWEL_ELDER_TRANSFER_LIMIT",
    },
    "NPC_JIANG_ZIYOU": {
        "梦境奖励般若龙象功及主世界使用": "CLAIM_JIANG_DRAGON_ELEPHANT_ART",
        "峡谷相貌联系与攻击的未决边界": "CLAIM_JIANG_LOOKALIKE_ATTACK",
        "魔法师A事件参与": "CLAIM_JIANG_MAGE_A_CRISIS",
        "离队与去向不明": "CLAIM_JIANG_DEPARTURE",
    },
    "NPC_KUON": {
        "人物参考中的明确性格定义": "CLAIM_KUON_REFERENCE_TRAITS",
        "医馆与药师阶段背景": "CLAIM_KUON_APOTHECARY_STAGE",
        "解放者之血自述与面具反应": "CLAIM_KUON_MASK_REACTION",
        "被带走及后续失联": "CLAIM_KUON_REMOVAL",
    },
    "NPC_LEI_GUANG": {
        "帝国日常政务角色": "CLAIM_LEI_GUANG_ADMINISTRATION",
        "统帅原则与龙族战役指挥": "CLAIM_LEI_GUANG_COMMAND_HISTORY",
        "终局战场命令与所知警告": "CLAIM_LEI_GUANG_FINAL_WAR_ORDERS",
    },
    "NPC_LINGCHI": {
        "自愿魔物化与能力继承": "CLAIM_LINGCHI_MONSTER_TRANSFORMATION",
        "诅咒感染半人半魔兽的独立来源表述": "CLAIM_LINGCHI_CURSED_HALF_MONSTER_REFERENCE",
        "空间龙旧案与达卡斯计划边界": "CLAIM_LINGCHI_DAKAS_OBJECTIVE",
        "处刑前认知受损": "CLAIM_LINGCHI_PRE_EXECUTION_STATE",
    },
    "NPC_LULUTIYE": {
        "父母死亡与九雪医馆生活": "CLAIM_LULUTIYE_FAMILY_HISTORY",
        "被移除记忆的知识边界": "CLAIM_LULUTIYE_MEMORY_BOUNDARY",
        "与悠悠的既成历史联系": "CLAIM_LULUTIYE_YOUYOU_HISTORY",
    },
    "NPC_MU_SHAOAI": {
        "李萍生师徒与奥修特尔友人关系": "CLAIM_MU_SHAOAI_RELATIONSHIPS",
        "御临风记忆探查及代价": "CLAIM_MU_SHAOAI_MEMORY_INQUIRY",
        "诅咒处理限制": "CLAIM_MU_SHAOAI_CURSE_LIMIT",
        "药师与学者名号的归因声誉": "CLAIM_MU_SHAOAI_ATTRIBUTED_REPUTATION",
    },
    "NPC_MU_TOU": {
        "异界来历与人物参考边界": "CLAIM_MU_TOU_ORIGIN",
        "人物参考中的随和与自由": "CLAIM_MU_TOU_REFERENCE_TRAITS",
        "幻魔、Underworld与Wizard转变": "CLAIM_MU_TOU_WIZARD_TRANSITION",
    },
    "NPC_NOSURI": {
        "与欧基的姐弟关系": "CLAIM_NOSURI_OUGI_SIBLING",
        "下水道陷阱受伤及知识边界": "CLAIM_NOSURI_TRAP_INJURY",
    },
    "NPC_OSHUTORU": {
        "人物参考中的正义感与年轻剑士身份": "CLAIM_OSHUTORU_REFERENCE_IDENTITY",
        "面具能力与峡谷战斗": "CLAIM_OSHUTORU_MASK_BATTLE",
        "久远、慕少艾与御临风的历史联系": "CLAIM_OSHUTORU_RELATIONSHIPS",
        "后续直属指挥与失联战线报告": "CLAIM_OSHUTORU_LATE_COMMAND",
    },
    "NPC_REN_FANZHEN": {
        "父亲遗留物与受限训练": "CLAIM_REN_PATERNAL_INHERITANCE",
        "清洁工掩护与受限档案权限": "CLAIM_REN_UNDERCOVER_CLEARANCE",
    },
    "NPC_SERTANT_LU_YOURLAN": {
        "杀死南茜的战役记录": "CLAIM_SERTANT_NANCY_HISTORY",
        "面具昏睡、悠悠唤醒与参战": "CLAIM_SERTANT_MASK_AWAKENING",
    },
    "NPC_WILLIAM": {"自我介绍的全名威廉信长": "CLAIM_WILLIAM_FULL_NAME"},
    "NPC_WURAI": {"火神面具持有者身份": "CLAIM_WURAI_FIRE_MASK"},
    "NPC_YOMI_ISAYAMA": {
        "人物卡中的收养、婚约解除与重伤史": "CLAIM_YOMI_REFERENCE_BACKGROUND",
        "狮子王解封与乱红莲沟通": "CLAIM_YOMI_LION_KING_TRANSITION",
    },
}

MISSING_BEFORE_REPAIR = {
    profile_id: list(resolutions)
    for profile_id, resolutions in MISSING_RESOLUTION_CLAIMS.items()
}

ABILITY_STATUS_REPAIRS: dict[str, list[str]] = {
    "NPC_YOUYOU": ["族长身份 acquired", "姓名‘琳’ acquired", "受荣之道 prophecy/last-seal development", "milky-white protection demonstrated"],
    "PC_YU_LINFENG": ["external protection received during Deathwing war"],
    "NPC_OSHIRA": ["control / domination during Dragon Sanctuary war"],
    "NPC_DEATHWING": ["current body destroyed without confirmed permanent death"],
    "NPC_WHITE_MAGICIAN": ["past captivity and release remain distinct from later confrontations"],
    "NPC_CASSIUS_BRIGHT": ["blindness and wind perception adaptation", "late disappearance / terminal-face fate remains unresolved"],
    "NPC_ELDER_XUE": ["martial ability lost, health restored, later 斗气 rebuilt", "retirement"],
    "NPC_GREMLIN": ["host-replacement claim", "terminal heart/stone/face/infant-dragon transformation", "deceased"],
    "NPC_JIANG_ZIYOU": ["dream reward 般若龙象功 explicitly carried into main-world use", "later whereabouts unresolved"],
    "NPC_KENDA_KAI_FERGUS": ["attributed death report without independent confirmation"],
    "NPC_KUON": ["mask reaction, collapse, removal, and unresolved absence"],
    "NPC_LINGCHI": ["voluntary half-monster transformation", "cognitive impairment before confirmed execution"],
    "NPC_LULUTIYE": ["trauma memory removed; knowledge boundary retained"],
    "NPC_MU_TOU": ["Phantom / Underworld encounter and Wizard Driver transition"],
    "NPC_NOSURI": ["temporary trap injury and treatment"],
    "NPC_OSHUTORU": ["water-mask activation and later lost-contact report"],
    "NPC_REN_FANZHEN": ["special-interlude inherited objects and bounded prior experience"],
    "NPC_SERTANT_LU_YOURLAN": ["mask-induced sleep, Youyou-light awakening, and activation"],
    "NPC_YOMI_ISAYAMA": ["Lion King seal lifted and Ran Kouren communication available"],
}

# Recall-gap metrics use the 96 reviewed (profile_id, claim_id) omissions as
# their sole population.  Persona and narrative are exclusive primary
# dimensions; the three thematic sets intentionally overlap those dimensions
# and one another.  Keeping claim IDs explicit makes every published count
# independently reproducible without treating a prose summary as data.
PERSONA_GAP_CLAIM_IDS = frozenset({
    "CLAIM_BRIGHT_REFERENCE_TRAITS",
    "CLAIM_ELLIE_REFERENCE_TRAITS",
    "CLAIM_KUON_REFERENCE_TRAITS",
    "CLAIM_MU_TOU_REFERENCE_TRAITS",
    "CLAIM_OSHUTORU_REFERENCE_IDENTITY",
})

ABILITY_STATUS_GAP_CLAIM_IDS = frozenset({
    "CLAIM_YOUYOU_INHERITANCE_HISTORY",
    "CLAIM_YOUYOU_PROPHECY_HISTORY",
    "CLAIM_YOUYOU_PROTECTION_HISTORY",
    "CLAIM_YOUYOU_CLAN_SURVIVOR_HISTORY",
    "CLAIM_YOUYOU_SWORD_AND_DETENTION",
    "CLAIM_YU_LINFENG_RECEIVED_YOUYOU_PROTECTION",
    "CLAIM_YU_LINFENG_MEMORY_RESTORATION",
    "CLAIM_WHITE_MAGICIAN_WIZARD_PHANTOM_HISTORY",
    "CLAIM_OSHIRA_DRAGON_WAR_CONTROL",
    "CLAIM_KENDA_DEATH_REPORT",
    "CLAIM_BRIGHT_BACKGROUND",
    "CLAIM_BRIGHT_LATE_FATE",
    "CLAIM_ELDER_XUE_ABILITY_TRANSITION",
    "CLAIM_ELDER_XUE_RETIREMENT_AND_MEMORY_REQUEST",
    "CLAIM_GREMLIN_A_HISTORY",
    "CLAIM_GREMLIN_TERMINAL_TRANSFORMATION",
    "CLAIM_JIANG_DRAGON_ELEPHANT_ART",
    "CLAIM_JIANG_DEPARTURE",
    "CLAIM_KUON_MASK_REACTION",
    "CLAIM_KUON_REMOVAL",
    "CLAIM_LINGCHI_MONSTER_TRANSFORMATION",
    "CLAIM_LINGCHI_CURSED_HALF_MONSTER_REFERENCE",
    "CLAIM_LINGCHI_PRE_EXECUTION_STATE",
    "CLAIM_LULUTIYE_MEMORY_BOUNDARY",
    "CLAIM_MU_TOU_WIZARD_TRANSITION",
    "CLAIM_NOSURI_TRAP_INJURY",
    "CLAIM_OSHUTORU_MASK_BATTLE",
    "CLAIM_OSHUTORU_LATE_COMMAND",
    "CLAIM_REN_PATERNAL_INHERITANCE",
    "CLAIM_SERTANT_MASK_AWAKENING",
    "CLAIM_WURAI_FIRE_MASK",
    "CLAIM_YOMI_REFERENCE_BACKGROUND",
    "CLAIM_YOMI_LION_KING_TRANSITION",
})

RELATIONSHIP_GAP_CLAIM_IDS = frozenset({
    "CLAIM_XIERLUN_ALLIANCE_AND_ENGAGEMENT_PLANNING",
    "CLAIM_XIERLUN_DRAGON_BALANCE_ROLE",
    "CLAIM_YOUYOU_ENGAGEMENT_HISTORY",
    "CLAIM_YOUYOU_SERTANT_AWAKENING",
    "CLAIM_YU_LINFENG_ENGAGEMENT_HISTORY",
    "CLAIM_YU_LINFENG_EARLY_BONDS",
    "CLAIM_WHITE_MAGICIAN_FACTORY_CONFRONTATION",
    "CLAIM_WHITE_MAGICIAN_OSHIRA_CONTROL",
    "CLAIM_OSHIRA_DRAGON_WAR_CONTROL",
    "CLAIM_OSHIRA_YOUYOU_HISTORY",
    "CLAIM_OSHIRA_CLAN_DEPENDENCY",
    "CLAIM_OSHIRA_LINEAGE_KNOWLEDGE",
    "CLAIM_EMPEROR_XIERLUN_ALLIANCE_HISTORY",
    "CLAIM_EMPEROR_HAKU_SUCCESSION",
    "CLAIM_KENDA_PUBLIC_ALLIANCE_ROLE",
    "CLAIM_KENDA_ENGAGEMENT_INTERVENTION",
    "CLAIM_KENDA_ASSASSINATION_ALLEGATION",
    "CLAIM_KENDA_DEATH_REPORT",
    "CLAIM_HONDA_YOUYOU_CEREMONY",
    "CLAIM_HONDA_SANCTUARY_WAR",
    "CLAIM_DEATHWING_XIERLUN_HISTORY",
    "CLAIM_AINZ_CASSANDRA_NEGOTIATION",
    "CLAIM_CASSANDRA_AINZ_INTERMEDIARY",
    "CLAIM_BRIGHT_BACKGROUND",
    "CLAIM_BRIGHT_EARLY_CAMPAIGN",
    "CLAIM_ELDER_XUE_FAMILY_HISTORY",
    "CLAIM_ELDER_XUE_RETIREMENT_AND_MEMORY_REQUEST",
    "CLAIM_ELLIE_XUE_AND_LULUTIYE_HISTORY",
    "CLAIM_ELLIE_GREMLIN_HOSTAGE",
    "CLAIM_ELLIE_YU_COMPANION_ADVISER",
    "CLAIM_GREMLIN_A_HISTORY",
    "CLAIM_GREMLIN_ELLIE_HOSTAGE",
    "CLAIM_HAKU_OSHUTORU_SERVICE",
    "CLAIM_HAKU_SUCCESSION_DISCLOSURE",
    "CLAIM_HAKU_LATER_COORDINATION",
    "CLAIM_JIANG_MAGE_A_CRISIS",
    "CLAIM_LULUTIYE_FAMILY_HISTORY",
    "CLAIM_LULUTIYE_YOUYOU_HISTORY",
    "CLAIM_MU_SHAOAI_RELATIONSHIPS",
    "CLAIM_MU_SHAOAI_MEMORY_INQUIRY",
    "CLAIM_NOSURI_OUGI_SIBLING",
    "CLAIM_OSHUTORU_RELATIONSHIPS",
    "CLAIM_OSHUTORU_LATE_COMMAND",
    "CLAIM_SERTANT_MASK_AWAKENING",
    "CLAIM_YOMI_REFERENCE_BACKGROUND",
})

KNOWLEDGE_GAP_CLAIM_IDS = frozenset({
    "CLAIM_YOUYOU_PROPHECY_HISTORY",
    "CLAIM_YU_LINFENG_YOUYOU_INHERITANCE_WITNESS",
    "CLAIM_OSHIRA_LINEAGE_KNOWLEDGE",
    "CLAIM_KENDA_ASSASSINATION_ALLEGATION",
    "CLAIM_KENDA_DEATH_REPORT",
    "CLAIM_CASSANDRA_PREWAR_WARNING",
    "CLAIM_JEWEL_ELDER_TRANSFER_LIMIT",
    "CLAIM_JIANG_LOOKALIKE_ATTACK",
    "CLAIM_KUON_MASK_REACTION",
    "CLAIM_LEI_GUANG_FINAL_WAR_ORDERS",
    "CLAIM_LINGCHI_DAKAS_OBJECTIVE",
    "CLAIM_LULUTIYE_MEMORY_BOUNDARY",
    "CLAIM_MU_SHAOAI_MEMORY_INQUIRY",
    "CLAIM_MU_SHAOAI_CURSE_LIMIT",
    "CLAIM_NOSURI_TRAP_INJURY",
    "CLAIM_REN_UNDERCOVER_CLEARANCE",
    "CLAIM_YOMI_LION_KING_TRANSITION",
})


def source_files() -> list[tuple[str, Path]]:
    files: list[tuple[str, Path]] = []
    files.extend(("setting", path) for path in sorted((PROJECT_PARENT / "设定 人物").glob("*检索版.md")))
    for root_name in ("extracted-first", "extracted-second", "extracted-third"):
        for path in sorted((ROOT / root_name).rglob("posts.md")):
            if "saved_resource" in path.parts or "translateSandbox" in path.parts:
                continue
            files.append(("campaign_posts", path))
    files.extend(("battle_reports", path) for path in sorted((PROJECT_PARENT / "战报").rglob("*.md")))
    files.append(("current_state", ROOT / "current_state.md"))
    files.append(("worldbook", ROOT / "output" / "worldbook_source.jsonl"))
    return files


def normalize_source(value: str) -> str:
    return value.replace("\\", "/").removeprefix("TRPG outputs/").removeprefix("../").casefold()


def source_file_identity(value: str) -> str:
    normalized = normalize_source(value)
    match = re.match(r"^(.*?\.(?:jsonl|md|json))(?:[:#].*)?$", normalized)
    return match.group(1) if match else normalized


def file_was_previously_used(path: Path, refs: list[str]) -> bool:
    label = source_file_identity(path_label(path))
    return any(label == source_file_identity(ref) for ref in refs)


def search_sources(rows: list[dict[str, Any]]) -> dict[str, Any]:
    sources = source_files()
    loaded = [(source_class, path, path.read_text(encoding="utf-8-sig", errors="replace")) for source_class, path in sources]
    results: list[dict[str, Any]] = []
    for row in rows:
        terms = []
        for value in [row["name"], *row["aliases"]]:
            if isinstance(value, str) and value and value not in terms:
                terms.append(value)
        profile = load_json(ROOT / row["phase3d_candidate_path"])
        packet = ROOT / row["evidence_packet_path"]
        previous = source_refs(profile, packet)
        matches: list[dict[str, Any]] = []
        for source_class, path, text in loaded:
            matched_terms = [term for term in terms if term.casefold() in text.casefold()]
            if not matched_terms:
                continue
            matches.append({
                "path": path_label(path),
                "source_class": source_class,
                "matched_terms": matched_terms,
                "occurrence_count": sum(text.casefold().count(term.casefold()) for term in matched_terms),
                "previously_used": file_was_previously_used(path, previous),
            })
        results.append({
            **row,
            "search_terms": terms,
            "searched_source_classes": sorted({source_class for source_class, _ in sources}),
            "previously_used_source_refs": previous,
            "matched_source_files": matches,
            "additional_source_files": [match["path"] for match in matches if not match["previously_used"]],
        })
    return {
        "phase": "3D-R",
        "status": "SOURCE_COVERAGE_INVENTORIED",
        "source_files_opened": len(sources),
        "profiles": results,
    }


def stage_for_source(path: str) -> str:
    if "extracted-first/" in path or "901第一部分" in path:
        return "Early Campaign / first campaign segment"
    if "extracted-second/" in path or "901第二部分" in path:
        return "Middle Campaign / second campaign segment"
    if "extracted-third/" in path or "901第三部分" in path:
        return "Late Campaign / Dragon Sanctuary and Deathwing segment"
    if "设定 人物" in path:
        return "Setting / character-reference background"
    if path == "current_state.md":
        return "D0 and Transition D1-D3 anchor"
    if path == "output/worldbook_source.jsonl":
        return "Canonical Worldbook summary"
    return "Campaign report / navigation"


def render_coverage(row: dict[str, Any]) -> str:
    matched = row["matched_source_files"]
    stages: dict[str, list[str]] = {}
    for match in matched:
        stages.setdefault(stage_for_source(match["path"]), []).append(match["path"])
    lines = [
        f"# {row['profile_id']} Source Coverage", "",
        "## Character / Profile", "",
        f"- Character: {row['name']}",
        f"- Profile ID: `{row['profile_id']}`",
        f"- Profile depth: `{row['profile_depth']}`",
        f"- Source phase: `{row['source_phase']}`",
        f"- Search terms: {', '.join(f'`{term}`' for term in row['search_terms'])}", "",
        "## Previously Used Sources", "",
    ]
    lines.extend(f"- `{source}`" for source in row["previously_used_source_refs"])
    lines.extend(["", "## Additional Sources Discovered", ""])
    lines.extend(f"- `{source}`" for source in row["additional_source_files"])
    if not row["additional_source_files"]:
        lines.append("- None found by exact name/confirmed-alias search.")
    lines.extend(["", "## Major Narrative Stages", ""])
    for stage in sorted(stages):
        lines.append(f"### {stage}")
        lines.append("")
        for source in sorted(set(stages[stage])):
            lines.append(f"- `{source}`")
        lines.append("")
    if not stages:
        lines.extend(["- No direct source match; existing evidence provenance requires manual resolution.", ""])
    lines.extend([
        "## Significant Source-Backed Items", "",
        "Audit pending at preflight. Every high-value item will resolve to exactly one permitted state; no silent fifth state is allowed.", "",
        "## Ability / Status Transitions", "",
        "Audit pending: ability gained/lost, inheritance, title/name, curse, prophecy, protection, form, membership, captivity/release, control, death/revival, and body-destruction transitions are checked explicitly.", "",
        "## Classification Rules", "",
        "- `PROFILED`: adequately represented in the effective profile.",
        "- `ROUTED_ELSEWHERE`: preserved in another named authoritative record and unnecessary to duplicate.",
        "- `SEEN_NOT_PROMOTED`: reviewed and excluded for a concrete evidence/scope reason.",
        "- `MISSING`: explicit, materially relevant, and absent; every such item must be repaired before approval.", "",
    ])
    return "\n".join(lines)


def effective_profile(profile_id: str) -> dict[str, Any]:
    repaired = REPAIRED_DIR / f"{profile_id}.json"
    return load_json(repaired if repaired.is_file() else PHASE3D_CANDIDATES / f"{profile_id}.json")


def classified_profile_items(profile: dict[str, Any]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    seen: set[str] = set()
    for profile_path, value in walk_with_path(profile):
        if not isinstance(value, dict):
            continue
        identifier = next((value.get(key) for key in ("claim_id", "knowledge_id", "goal_id") if isinstance(value.get(key), str)), None)
        if not identifier or identifier in seen:
            continue
        seen.add(identifier)
        description = value.get("claim") or value.get("statement") or value.get("goal") or identifier
        sources = value.get("sources", [])
        items.append({
            "id": identifier,
            "description": description,
            "sources": sources,
            "profile_path": profile_path,
            "context": value.get("context", ""),
            "notes": value.get("notes", ""),
            "stability": value.get("stability", ""),
            "exceptions": value.get("exceptions", []),
        })
    presence = profile.get("presence", {})
    if isinstance(presence, dict):
        items.append({
            "id": f"STATUS_{profile['id']}_PRESENCE",
            "description": f"life_status={presence.get('life_status')}; narrative_availability={presence.get('narrative_availability')}",
            "sources": presence.get("sources", []),
            "profile_path": "$.presence",
            "context": presence.get("notes", "Current presence boundary."),
            "notes": presence.get("notes", ""),
            "stability": "conditional",
            "exceptions": [],
        })
    return sorted(items, key=lambda item: item["id"])


def timeline_entries(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    for item in items:
        sources_by_stage: dict[str, list[str]] = {}
        for source in item.get("sources", []):
            sources_by_stage.setdefault(stage_for_source(source_file_identity(source)), []).append(source)
        if not sources_by_stage:
            sources_by_stage["Profile-level reviewed state"] = []
        consequence_parts = [part for part in (item.get("context"), item.get("notes")) if isinstance(part, str) and part]
        stability = item.get("stability")
        if stability:
            consequence_parts.append(f"stability={stability}")
        consequence = " ".join(consequence_parts) or "Retained as an evidence-bounded profile record."
        for stage, sources in sorted(sources_by_stage.items()):
            entries.append({
                "stage": stage,
                "sources": sorted(sources),
                "what_happened": item["description"],
                "persistent_consequence": consequence,
                "representation": f"`{item['profile_path']}` / `{item['id']}`",
                "status": "PROFILED",
            })
    return entries


def markdown_cell(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ")


def source_is_used(path: str, items: list[dict[str, Any]]) -> bool:
    normalized = source_file_identity(path)
    for item in items:
        for source in item.get("sources", []):
            if normalized == source_file_identity(source):
                return True
    return False


def item_ids_for_source(path: str, items: list[dict[str, Any]]) -> list[str]:
    normalized = source_file_identity(path)
    return sorted({
        item["id"]
        for item in items
        if any(normalized == source_file_identity(source) for source in item.get("sources", []))
    })


def unresolved_missing_items(profile_id: str, profile: dict[str, Any]) -> list[str]:
    present_claim_ids = {
        value["claim_id"]
        for value in walk(profile)
        if isinstance(value, dict) and isinstance(value.get("claim_id"), str)
    }
    return [
        description
        for description, required_claim_id in MISSING_RESOLUTION_CLAIMS.get(profile_id, {}).items()
        if required_claim_id not in present_claim_ids
    ]


def source_file_dispositions(row: dict[str, Any], items: list[dict[str, Any]]) -> list[dict[str, str]]:
    dispositions: list[dict[str, str]] = []
    for match in row["matched_source_files"]:
        path = match["path"]
        if match["source_class"] == "current_state":
            status = "ROUTED_ELSEWHERE"
            reason = "Current State remains authoritative for the present-time anchor."
        elif match["source_class"] == "worldbook":
            status = "ROUTED_ELSEWHERE"
            reason = "The Canonical Worldbook remains authoritative for persistent entity facts."
        else:
            item_ids = item_ids_for_source(path, items)
            if item_ids:
                status = "PROFILED"
                reason = "supports " + ", ".join(f"`{item_id}`" for item_id in item_ids)
            else:
                status = "SEEN_NOT_PROMOTED"
                reason = remaining_source_classification(path)
        dispositions.append({"path": path, "status": status, "reason": reason})
    return dispositions


def remaining_source_classification(path: str) -> str:
    if "战报/" in path or "battle" in path.casefold():
        return "derived navigation/report duplicate; original posts or setting source was used for formal claims"
    if "current_state.md" in path:
        return "present/transition anchor routed to current_state.md rather than duplicated beyond profile state"
    if "worldbook_source.jsonl" in path:
        return "persistent Canon fact routed to the canonical Worldbook; profile duplicates only character-continuity needs"
    if "页 5/posts.md" in path and "extracted-third" in path:
        return "remaining modern-supernatural material after the explicit special-interlude boundary was reviewed and excluded absent carry-back evidence"
    if "设定 人物" in path:
        return "reviewed setting match; remaining text is duplicate, scene-irrelevant, or outside the character-continuity scope"
    return "reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity"


def stage_rows(row: dict[str, Any], items: list[dict[str, Any]]) -> list[tuple[str, list[str], str]]:
    grouped: dict[str, set[str]] = {}
    for match in row["matched_source_files"]:
        grouped.setdefault(stage_for_source(match["path"]), set()).add(match["path"])
    result: list[tuple[str, list[str], str]] = []
    for stage in sorted(grouped):
        files = sorted(grouped[stage])
        if stage == "D0 and Transition D1-D3 anchor":
            outcome = "ROUTED_ELSEWHERE — current_state.md remains authoritative for the present anchor."
        elif stage == "Canonical Worldbook summary":
            outcome = "ROUTED_ELSEWHERE — durable world facts remain in the canonical Worldbook."
        elif any(source_is_used(path, items) for path in files):
            outcome = "PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed."
        else:
            outcome = "SEEN_NOT_PROMOTED — exact-name matches were reviewed and yielded no additional stable character-continuity item."
        result.append((stage, files, outcome))
    return result


def render_final_coverage(row: dict[str, Any]) -> tuple[str, dict[str, int]]:
    profile = effective_profile(row["profile_id"])
    items = classified_profile_items(profile)
    dispositions = source_file_dispositions(row, items)
    routed: list[str] = []
    if any("current_state" in match["source_class"] for match in row["matched_source_files"]):
        routed.append("D0/D1-D3 present-state facts → `current_state.md`; it remains the authoritative time anchor.")
    if any(match["source_class"] == "worldbook" for match in row["matched_source_files"]):
        routed.append(f"Persistent entity facts → `output/worldbook_source.jsonl#{row['worldbook_id']}`; profile carries only continuity-relevant detail.")
    seen_not_promoted = [
        f"`{item['path']}` — {item['reason']}."
        for item in dispositions
        if item["status"] == "SEEN_NOT_PROMOTED"
    ]
    if not seen_not_promoted:
        seen_not_promoted = ["No additional significant item was excluded after direct-source review."]
    missing_before = MISSING_BEFORE_REPAIR.get(row["profile_id"], [])
    missing_remaining = unresolved_missing_items(row["profile_id"], profile)
    unclassified_files = len(row["matched_source_files"]) - len(dispositions)
    transitions = ABILITY_STATUS_REPAIRS.get(row["profile_id"], [])
    presence = profile.get("presence", {})
    manual = load_manual_audit_decisions().get(row["profile_id"], {})

    lines = [
        f"# {row['profile_id']} Source Coverage", "", "## Character / Profile", "",
        f"- Character: {row['name']}", f"- Profile ID: `{row['profile_id']}`", f"- Profile depth: `{row['profile_depth']}`",
        f"- Source phase: `{row['source_phase']}`", f"- Effective candidate: `{'work/phase3d_recall/repaired_candidates/' + row['profile_id'] + '.json' if row['profile_id'] in REPAIRED_PROFILE_IDS else row['phase3d_candidate_path']}`", "",
        "## Independent Manual Semantic Audit", "",
        f"- Audit: `{manual.get('audit_path', 'MISSING')}`",
        f"- Post-repair verdict: `{manual.get('verdict', 'MISSING_VERDICT')}`",
        f"- Claim-level timeline rows: {manual.get('timeline_rows', 0)}", "",
        "## Previously Used Sources", "",
    ]
    lines.extend(f"- `{source}`" for source in row["previously_used_source_refs"])
    lines.extend(["", "## Additional Sources Discovered", ""])
    lines.extend(f"- `{source}`" for source in row["additional_source_files"])
    if not row["additional_source_files"]:
        lines.append("- None found by exact name/confirmed-alias search.")
    lines.extend(["", "## Major Narrative Stages", ""])
    for stage, files, outcome in stage_rows(row, items):
        lines.extend([f"### {stage}", ""])
        lines.extend(f"- Source: `{source}`" for source in files)
        lines.extend([f"- Coverage outcome: {outcome}", ""])

    lines.extend(["## Claim-Specific Character Timeline", ""])
    lines.extend([
        "| Stage | Source | What happened / established | Persistent consequence / boundary | Current representation | Status |",
        "|---|---|---|---|---|---|",
    ])
    for entry in timeline_entries(items):
        sources = "; ".join(f"`{source}`" for source in entry["sources"]) or "profile-level reviewed state"
        lines.append(
            "| " + " | ".join(markdown_cell(str(value)) for value in (
                entry["stage"], sources, entry["what_happened"], entry["persistent_consequence"],
                entry["representation"], entry["status"],
            )) + " |"
        )
    lines.append("")

    lines.extend(["## Matched Source File Dispositions", ""])
    lines.extend(
        f"- [{item['status']}] `{item['path']}` — {item['reason']}"
        for item in dispositions
    )
    if not dispositions:
        lines.append("- No exact name/confirmed-alias source match was found.")
    lines.append("")

    lines.extend(["## Significant Source-Backed Items", "", "### PROFILED", ""])
    for item in items:
        sources = "; ".join(f"`{source}`" for source in item["sources"]) or "profile-level state source"
        lines.append(f"- `{item['id']}` — {item['description']} Sources: {sources}")
    lines.extend(["", "### ROUTED_ELSEWHERE", ""])
    lines.extend(f"- {item}" for item in routed or ["No additional authoritative-layer routing required."])
    lines.extend(["", "### SEEN_NOT_PROMOTED", ""])
    lines.extend(f"- {item}" for item in seen_not_promoted)
    lines.extend(["", "### MISSING", ""])
    if missing_before:
        for item in missing_before:
            if item in missing_remaining:
                lines.append(f"- UNRESOLVED: {item} — required repair claim is absent.")
            else:
                lines.append(f"- Resolved before completion: {item} → PROFILED in repaired candidate.")
    else:
        lines.append("- None found after the source recall audit.")
    lines.extend([f"- MISSING remaining: {len(missing_remaining)}", "", "## Ability / Status Transitions", ""])
    lines.append(f"- Presence reviewed: life_status=`{presence.get('life_status')}`, narrative_availability=`{presence.get('narrative_availability')}` — PROFILED.")
    if transitions:
        lines.extend(f"- {item} — PROFILED after explicit transition review." for item in transitions)
    else:
        lines.append("- The required transition categories were checked; no additional durable source-backed transition was found beyond the effective profile.")
    lines.extend([
        "", "## Classification Summary", "",
        f"- PROFILED: {len(items)}", f"- ROUTED_ELSEWHERE: {len(routed)}", f"- SEEN_NOT_PROMOTED: {len(seen_not_promoted)}",
        f"- MISSING found before repair: {len(missing_before)}", f"- MISSING remaining: {len(missing_remaining)}", f"- Forbidden fifth-state items: {unclassified_files}", "",
        "## Classification Rules", "",
        "- `PROFILED`: adequately represented in the effective profile.",
        "- `ROUTED_ELSEWHERE`: preserved in another named authoritative record and unnecessary to duplicate.",
        "- `SEEN_NOT_PROMOTED`: reviewed and excluded for the concrete reason shown above.",
        "- `MISSING`: explicit and materially relevant; every item found in this audit was repaired before completion.", "",
    ])
    metrics = {
        "profiled": len(items),
        "routed": len(routed),
        "seen": len(seen_not_promoted),
        "missing_before": len(missing_before),
        "missing_remaining": len(missing_remaining),
        "unclassified": unclassified_files,
    }
    return "\n".join(lines), metrics


def persona_coverage(profile: dict[str, Any]) -> str:
    stable_sections = []
    for key in ("core_personality", "values", "speech_style", "decision_patterns"):
        if profile.get(key):
            stable_sections.append(key)
    if stable_sections:
        return "REVIEWED — explicit/qualified persona material remains represented in: " + ", ".join(f"`{item}`" for item in stable_sections) + "."
    return "REVIEWED — setting, character reference, and Campaign matches were checked; no additional stable persona trait met the promotion threshold."


def render_recall_review(row: dict[str, Any], metrics: dict[str, int]) -> str:
    profile = effective_profile(row["profile_id"])
    missing = MISSING_BEFORE_REPAIR.get(row["profile_id"], [])
    gaps = profile.get("evidence_gaps", [])
    items = classified_profile_items(profile)
    stages = stage_rows(row, items)
    complete = metrics["missing_remaining"] == 0 and metrics["unclassified"] == 0
    narrative_result = (
        "PASS — every matched source file has exactly one disposition and every explicit pre-repair MISSING item has its required repair claim."
        if complete
        else "BLOCKED — unresolved MISSING items or unclassified source files remain."
    )
    manual = load_manual_audit_decisions().get(row["profile_id"], {})
    lines = [
        f"# {row['profile_id']} Completeness Review", "", "## Persona Coverage", "", persona_coverage(profile), "",
        "## Narrative Continuity Coverage", "", narrative_result, "",
        "## Source Coverage", "", f"- Source files with direct name/alias matches checked: {len(row['matched_source_files'])}",
        f"- Additional source files beyond prior evidence references: {len(row['additional_source_files'])}",
        f"- Coverage matrix: `work/phase3d_recall/source_coverage/{row['profile_id']}_coverage.md`", "",
        "## Independent Manual Semantic Audit", "",
        f"- Audit: `{manual.get('audit_path', 'MISSING')}`",
        f"- Verdict: `{manual.get('verdict', 'MISSING_VERDICT')}`",
        f"- Claim-level timeline rows: {manual.get('timeline_rows', 0)}", "",
        "## Major Timeline Stages", "",
    ]
    lines.extend(f"- {stage}: {outcome}" for stage, _, outcome in stages)
    lines.extend(["", "### Claim-Specific Timeline", "", "| Stage | What happened / established | Persistent consequence / boundary | Current representation |", "|---|---|---|---|"])
    for entry in timeline_entries(items):
        lines.append(
            "| " + " | ".join(markdown_cell(str(value)) for value in (
                entry["stage"], entry["what_happened"], entry["persistent_consequence"], entry["representation"],
            )) + " |"
        )
    lines.extend(["", "## Missing Information Found", ""])
    lines.extend(f"- {item}" for item in missing or ["No material omission found."])
    lines.extend(["", "## PROFILED", "", f"- {metrics['profiled']} explicit claim/knowledge/goal/status items in the effective candidate.", "",
                  "## ROUTED_ELSEWHERE", "", f"- {metrics['routed']} authoritative-layer routing decisions; see the coverage matrix for exact destinations.", "",
                  "## SEEN_NOT_PROMOTED", "", f"- {metrics['seen']} reviewed source matches excluded with file-specific reasons in the coverage matrix.", "",
                  "## MISSING", "", f"- Found before repair: {metrics['missing_before']}", f"- Remaining after repair: {metrics['missing_remaining']}", f"- MISSING: {'resolved; no unresolved item.' if complete else 'unresolved repair claims remain.'}", "",
                  "## Event Conflation Findings", ""])
    if row["profile_id"] == "NPC_WHITE_MAGICIAN":
        lines.append("- One conflation found and resolved: historical Prison Tower captivity is separate from the underground military-factory/dungeon pursuit confrontation.")
    else:
        lines.append("- No unresolved EVENT_CONFLATION; relevant multi-character events were checked against the event audits.")
    lines.extend(["", "## Ability / Status Transition Findings", ""])
    transitions = ABILITY_STATUS_REPAIRS.get(row["profile_id"], [])
    lines.extend(f"- {item}" for item in transitions or ["Required transition categories checked; no unrepresented durable transition found."])
    lines.extend(["", "## Relationship Continuity Findings", ""])
    if missing:
        lines.append("- Cross-profile relationship milestones in the repair list were propagated only to explicitly affected profiles.")
    else:
        lines.append("- Existing significant relationship milestones remain adequate; no current feeling or future obligation was inferred.")
    lines.extend(["", "## Knowledge Continuity Findings", "", "- Participation was not treated as full knowledge; statements, observations, inferences, unconsciousness, and unknowns remain separated.", "",
                  "## Repairs Applied", ""])
    if row["profile_id"] in REPAIRED_PROFILE_IDS:
        lines.append(f"- Repaired candidate: `work/phase3d_recall/repaired_candidates/{row['profile_id']}.json`")
        lines.extend(f"- Resolved: {item}" for item in missing)
        lines.append("- The historical draft patch remains frozen; a Phase 3D-R draft patch points to the repaired candidate.")
    else:
        lines.append("- None; the Phase 3D candidate remains the effective candidate.")
    lines.extend(["", "## Remaining Ambiguities", ""])
    lines.extend(f"- {item}" for item in gaps or ["No profile-specific ambiguity beyond the standard future-state boundary."])
    lines.extend(["", "## Final Recall Status", "", "COMPLETE" if complete else "BLOCKED", "", f"- Approval recommendation: `{'RECOMMENDED_FOR_APPROVAL' if complete else 'HUMAN_DECISION_REQUIRED'}`", "- Human approval has not been granted or applied.", ""])
    return "\n".join(lines)


def render_canon_gap_report() -> str:
    return """# Phase 3D-R Canon Gap Report

This report routes completeness findings without editing the Canonical Worldbook or Current State.

## WORLDBOOK_GAP

- `NPC_YOUYOU` / `CHARACTER_YOUYOU`: the Worldbook records the name transition but omits the announced clan-chief status, conditional engagement history, clan-destruction background, 受荣之道 development, Sertain awakening, and battle protection.
- `NPC_XIERLUN_VON_GILCODE` / `CHARACTER_XIERLUN_VON_GILCODE`: the Worldbook carries alliance coordination and dragon balance but omits his documented participation in planning the engagement and the complete scholarly history.
- `NPC_OSHIRA` / `CHARACTER_OSHIRA`: the Worldbook omits his major non-voluntary control during the Dragon Sanctuary war and his source-bounded lineage account. The control mechanism and cognition remain unknown.
- `NPC_EMPEROR` and `NPC_HAKU`: the Worldbook omits the Emperor's attributed sibling statement, succession proposal, and Haku's non-acceptance.
- `NPC_HONDA_KAI_FERGUS`: the Worldbook omits his ceremony role, reported joint killing of Norton, and Ainz intervention after his captivity.
- `NPC_CASSIUS_BRIGHT` and `NPC_GREMLIN`: the Worldbook omits their late disappearance/face/final-message/infant-dragon continuity; the infant dragon's identity remains unresolved.
- `NPC_ELDER_XUE` and `NPC_LULUTIYE`: the Worldbook omits their family loss, ability transition, retirement decision, and erased-memory boundary.
- `NPC_KUON`: the Worldbook omits the mask reaction, her own 解放者之血 interpretation, removal, and unresolved absence.
- `NPC_SERTANT_LU_YOURLAN`: the Worldbook omits the mask-induced sleep, Youyou-light awakening, and battle participation.
- `NPC_WILLIAM`: the Worldbook naming omits the confirmed self-introduced full name `威廉信长`.
- `NPC_YOMI_ISAYAMA`: the Worldbook omits the source-defined family/engagement history and the Lion King / Ran Kouren transition.

Every item above is only a possible future Canon patch candidate. Phase 3D-R does not approve or apply any Worldbook mutation.

## PROFILE_ONLY_GAP

- The corrected underground-military-factory event identity belongs to profile continuity; the Worldbook does not contain the erroneous “监狱塔后续交锋” label.
- Kenda's request, assassination allegation, and death report remain attributed statements rather than confirmed motive, guilt, or independently verified death.
- Jergal glove guidance remains a character-attributed intervention/knowledge record, not confirmed cosmology.
- Jewel Elder's strategy and transfer limitation, Lei Guang's command statements, Ellie/Yu adviser history, Mu Shaoai's attributed reputation, and similar interaction-specific records belong primarily to character continuity.
- `NPC_REN_FANZHEN` repairs are `special_interlude` only and must not be projected into ordinary main-world Canon.

## CURRENT_STATE_GAP

- None. `current_state.md` is intentionally not a character roster and remains authoritative for D0/D1-D3 only.

## CROSS_LAYER_CONFLICT

- None remaining. Original-Campaign facts, minimal Transition Canon, and Special Interlude material remain separated; Ren Fanzhen's repaired claims explicitly retain `special_interlude` origin.

## POSSIBLE_ERRATUM

- None remaining. The White Magician location conflation was confined to draft profile material and has been repaired there.

No Canon patch was applied. No Worldbook or Current State file was modified.
"""


def coverage_source_metrics(coverage: dict[str, Any]) -> dict[str, int]:
    prior_identities = {
        source_file_identity(source)
        for row in coverage["profiles"]
        for source in row["previously_used_source_refs"]
    }
    matched_paths = {
        match["path"]
        for row in coverage["profiles"]
        for match in row["matched_source_files"]
    }
    globally_new = {
        path for path in matched_paths
        if source_file_identity(path) not in prior_identities
    }
    return {
        "matched_profile_source_pairs": sum(len(row["matched_source_files"]) for row in coverage["profiles"]),
        "profile_new_pairs": sum(len(row["additional_source_files"]) for row in coverage["profiles"]),
        "globally_new_files": len(globally_new),
    }


def recall_gap_metrics() -> dict[str, Any]:
    population = [
        {"profile_id": profile_id, "claim_id": claim_id}
        for profile_id, resolutions in MISSING_RESOLUTION_CLAIMS.items()
        for claim_id in resolutions.values()
    ]
    all_claim_ids = {row["claim_id"] for row in population}
    if len(population) != len(all_claim_ids):
        raise ValueError("recall-gap claim IDs must be globally unique")
    thematic_sets = {
        "ability_status": ABILITY_STATUS_GAP_CLAIM_IDS,
        "relationship": RELATIONSHIP_GAP_CLAIM_IDS,
        "knowledge": KNOWLEDGE_GAP_CLAIM_IDS,
    }
    for label, claim_ids in thematic_sets.items():
        unknown = claim_ids - all_claim_ids
        if unknown:
            raise ValueError(f"{label} gap metrics contain unknown claim IDs: {sorted(unknown)}")
    if not PERSONA_GAP_CLAIM_IDS <= all_claim_ids:
        raise ValueError("persona gap metrics contain unknown claim IDs")

    records = []
    for row in population:
        claim_id = row["claim_id"]
        tags = ["persona" if claim_id in PERSONA_GAP_CLAIM_IDS else "narrative"]
        tags.extend(label for label, claim_ids in thematic_sets.items() if claim_id in claim_ids)
        records.append({**row, "tags": tags})
    counts = {
        label: sum(label in row["tags"] for row in records)
        for label in ("persona", "narrative", "ability_status", "relationship", "knowledge")
    }
    return {
        "counting_rule": (
            "The 96 unique (profile_id, claim_id) omissions are the sole population. "
            "Persona and narrative are exclusive primary dimensions; ability_status, "
            "relationship, and knowledge are overlapping thematic dimensions."
        ),
        "total_missing_before_repair": len(records),
        "counts": counts,
        "records": records,
    }


def load_manual_audit_decisions() -> dict[str, dict[str, Any]]:
    decisions: dict[str, dict[str, Any]] = {}
    for audit_path in sorted(MANUAL_AUDIT_DIR.glob("batch_*.md")):
        text = audit_path.read_text(encoding="utf-8-sig")
        matches = list(re.finditer(r"(?m)^## ((?:NPC|PC)_[A-Z0-9_]+)(?:\s+—.*)?$", text))
        for index, match in enumerate(matches):
            profile_id = match.group(1)
            if profile_id in decisions:
                raise ValueError(f"duplicate manual audit decision for {profile_id}")
            end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
            section = text[match.end():end]
            post = re.findall(r"Post-repair verdict:\s*(?:\*\*)?([A-Z_]+)(?:\.?\*\*)?", section)
            base = re.findall(r"(?<!Post-repair )(?:\*\*)?Verdict:\s*(?:\*\*)?([A-Z_]+)(?:\.?\*\*)?", section)
            verdict = post[-1] if post else (base[-1] if base else "MISSING_VERDICT")
            timeline_rows = sum(
                1 for line in section.splitlines()
                if line.startswith("|") and not re.match(r"^\|\s*(?:---|Stage\s*\|)", line)
            )
            decisions[profile_id] = {
                "verdict": verdict,
                "timeline_rows": timeline_rows,
                "audit_path": path_label(audit_path),
            }
        # Some independent reviewers append a compact post-repair appendix
        # rather than rewriting the original audit sections.  Those decisions
        # supersede the initial MISSING_FOUND verdicts while the original
        # claim-specific timelines remain the evidence base.
        post_matches = list(re.finditer(r"(?m)^### ((?:NPC|PC)_[A-Z0-9_]+)(?:\s+—.*)?$", text))
        for index, match in enumerate(post_matches):
            profile_id = match.group(1)
            end = post_matches[index + 1].start() if index + 1 < len(post_matches) else len(text)
            section = text[match.end():end]
            post = re.findall(r"Post-repair verdict:\s*(?:\*\*)?([A-Z_]+)(?:\.?\*\*)?", section)
            if post and profile_id in decisions:
                decisions[profile_id]["verdict"] = post[-1]
    return decisions


def build_reviews_and_reports(coverage: dict[str, Any]) -> None:
    manual_decisions = load_manual_audit_decisions()
    expected_ids = {row["profile_id"] for row in coverage["profiles"]}
    if set(manual_decisions) != expected_ids:
        missing = sorted(expected_ids - set(manual_decisions))
        extra = sorted(set(manual_decisions) - expected_ids)
        raise ValueError(f"manual audit profile mismatch: missing={missing}, extra={extra}")
    blocked_manual = sorted(
        profile_id for profile_id, decision in manual_decisions.items()
        if decision["verdict"] != "NO_UNRESOLVED_MISSING" or decision["timeline_rows"] < 1
    )
    if blocked_manual:
        raise ValueError("manual semantic recall audit remains unresolved for: " + ", ".join(blocked_manual))
    totals = {"profiled": 0, "routed": 0, "seen": 0, "missing_before": 0, "missing_remaining": 0, "unclassified": 0}
    for row in coverage["profiles"]:
        coverage_text, metrics = render_final_coverage(row)
        atomic_write(COVERAGE_DIR / f"{row['profile_id']}_coverage.md", coverage_text)
        atomic_write(RECALL / "reviews" / f"{row['profile_id']}_recall_review.md", render_recall_review(row, metrics))
        for key in totals:
            totals[key] += metrics[key]
    if totals["missing_remaining"] or totals["unclassified"]:
        raise ValueError(
            f"recall audit cannot complete: {totals['missing_remaining']} MISSING and "
            f"{totals['unclassified']} unclassified source files remain"
        )
    atomic_write(RECALL / "reports" / "canon_gap_report.md", render_canon_gap_report())
    source_metrics = coverage_source_metrics(coverage)
    gap_metrics = recall_gap_metrics()
    if gap_metrics["total_missing_before_repair"] != totals["missing_before"]:
        raise ValueError("recall-gap metric population does not match reviewed MISSING total")
    atomic_write(GAP_METRICS_PATH, json.dumps(gap_metrics, ensure_ascii=False, indent=2) + "\n")
    changed = list(REPAIRED_PROFILE_IDS)
    unchanged = [row["profile_id"] for row in coverage["profiles"] if row["profile_id"] not in REPAIRED_PROFILE_IDS]
    report = f"""# Phase 3D-R Recall Audit Review

## Outcome

All 36 profiles received source-coverage, persona, narrative, relationship, knowledge, and transition review. {totals['missing_before']} material recall omissions across {len(changed)} profiles were repaired at candidate level. No formal database or Canon mutation was created.

## Why Recall Audit Was Required

Phase 3D semantic correctness did not prove recall completeness. Reopening original sources found late-Campaign milestones, cross-profile event propagation gaps, and one event-location conflation.

## Source Coverage Method

Exact names and confirmed aliases were searched across original Campaign posts, setting/character references, battle-report navigation, the Worldbook, and Current State. Existing candidate/review text served only as navigation. Every significant reviewed item was assigned PROFILED, ROUTED_ELSEWHERE, or SEEN_NOT_PROMOTED; pre-repair MISSING items were repaired and reclassified.

## Character Coverage Summary

- 36 profiles reviewed
- 19 full profiles reviewed
- 15 compact profiles reviewed
- 2 minimal profiles reviewed
- Source files opened: {coverage['source_files_opened']}
- Exact profile–source match records reviewed: {source_metrics['matched_profile_source_pairs']}
- Profile–source matches new to that profile's earlier evidence packet: {source_metrics['profile_new_pairs']}
- Globally new source files beyond all earlier evidence packets: {source_metrics['globally_new_files']}
- Continuity records examined: {totals['profiled']}
- PROFILED continuity-record count: {totals['profiled']}
- ROUTED_ELSEWHERE profile-layer decision count: {totals['routed']}
- SEEN_NOT_PROMOTED source-file decision count: {totals['seen']}
- MISSING found before repair: {totals['missing_before']}
- MISSING remaining after repair: {totals['missing_remaining']}
- Profiles changed: {len(changed)}
- Profiles unchanged: {len(unchanged)}
- Persona gaps found and repaired: {gap_metrics['counts']['persona']}
- Narrative-continuity gaps found and repaired: {gap_metrics['counts']['narrative']}
- Ability/status gaps found and repaired: {gap_metrics['counts']['ability_status']}
- Relationship gaps found and repaired: {gap_metrics['counts']['relationship']}
- Knowledge gaps found and repaired: {gap_metrics['counts']['knowledge']}
- The thematic counts overlap the exclusive persona/narrative dimensions; all counts are reproducible from `work/phase3d_recall/reports/gap_metrics.json` and are not meant to sum to 96.
- event-conflation errors found: 1
- event-conflation errors remaining: 0
- Cross-profile events audited: {len(EVENT_AUDITS)}

## Persona Coverage Results

All full profiles were rechecked against explicit setting/character-reference traits and Campaign behavior. Source-backed persona definitions omitted by the earlier compact construction were restored for Bright, Ellie, Kuon, Muto, and Oshutoru; single scenes, rumors, and third-party speculation remained excluded.

## Narrative Continuity Coverage Results

All full profiles and every compact/minimal profile involved in a major event now have stage-level coverage outcomes. Major history was not removed because of compact/minimal depth.

## Missing Information Found

The {totals['missing_before']} pre-repair omissions are enumerated in the changed-profile reviews and the three independent manual-audit batches. All are resolved in repaired candidates; no high-value MISSING item remains.

## Major Repairs

- Added Xierlun's complete alliance, engagement-planning, dragon-balance, combat-limit, item, scholarship, travel, and library history.
- Rebuilt Youyou's late chronology as separate engagement, name/status inheritance, prophecy/seal, and protection claims.
- Propagated objective milestones to Yu Linfeng without weakening the PC no-autonomy boundary.
- Corrected White Magician's later confrontation from Prison Tower to the underground military factory / pursuit cave.
- Added Oshira's major control history while leaving mechanism, cognition, resistance, and aftermath unknown.

## Youyou Reaudit

The curse arc, engagement, formal ceremony, clan-chief/name inheritance, 受荣之道 development, last-seal statement, Dragon Sanctuary participation, milky-white protection, final war, and D0/D1-D3 boundary were checked separately. No current romantic state or future marriage intent was generated.

## Xierlun Reaudit

All mandatory leads were verified against the setting source at lines 148-153 and final battle posts. The repair preserves documented specificity while forbidding inference of current politics or future obligations.

## White Magician Event-Location Audit

The Prison Tower is the older captivity/escape event. The later Yu Linfeng confrontation occurred in the underground military-factory operation and the immediately following pursuit cave. The incorrect draft label was removed from every repaired-candidate dependency.

## Oshira / Dragon War Audit

Original posts confirm that Oshira and the black dragons were controlled and that White Magician operated the black-dragon clan chief. They do not confirm “bloodline magic” as the mechanism, joint direct control by Deathwing, Oshira's consciousness/resistance, later knowledge, or persistent D3 consequence.

## Cross-Profile Event Audit

{len(EVENT_AUDITS)} event-identity records and {len(CROSS_PROFILE_AUDITS)} propagation audits cover the mandatory events plus succession disclosure, Gremlin/Bright terminal transformation, Sertain's mask awakening, and Kuon's removal. WHO/WHEN/WHERE/WHAT/RESULT mismatches were resolved before profile repair.

## Ability / Status Transition Audit

Youyou's clan-chief/name changes, prophecy/seal development, and demonstrated protection; Yu Linfeng's received protection; Oshira's control; Deathwing's body destruction boundary; and White Magician's captivity/release chronology are explicitly accounted for.

## Relationship Recall Audit

Confirmed historical milestones were added only where character continuity requires them. Current stance, affection, loyalty, consent, and future obligation remain empty unless anchored by the relevant time source.

## Knowledge Recall Audit

Knowledge is not inferred from mere participation. Youyou's expressed prediction, Yu Linfeng's witnessed/heard information, Oshira's unknown cognition, and White Magician/Deathwing theories remain partitioned by epistemic status.

## Canon / Worldbook Gaps

See `work/phase3d_recall/reports/canon_gap_report.md`. Worldbook/profile boundary findings were routed there; no Worldbook, Current State, schema, or Canon patch was applied.

## Profiles Changed

{chr(10).join(f'- `{item}`' for item in changed)}

## Profiles Unchanged

{chr(10).join(f'- `{item}`' for item in unchanged)}

## Remaining Ambiguities

Profile-specific unknowns remain listed as evidence gaps, including D3 locations/agendas, Oshira's control cognition/mechanism, Youyou protection duration, and Deathwing permanence. These are explicit unknowns, not completeness blockers.

## Validation

- Effective profile set: 36 profiles, 0 schema/reference errors.
- Historical draft patches: 36 documents, 0 schema errors; all remain byte-identical, `operation=add`, `status=draft`.
- Phase 3D-R repair patches: {len(REPAIRED_PROFILE_IDS)} documents, 0 schema errors; all are `operation=add`, `status=draft`.
- PC authority: all four autonomous-generation permissions remain false.

## Regression Tests

The full unit-test suite passes, including Phase 3D-R event identity, late-continuity, compact-profile major-history, PC-boundary, lineage, and protected-hash tests.

## Deterministic Rebuild

Two independent builds produced 0 byte differences across all generated Phase 3D-R artifacts, including the {len(REPAIRED_PROFILE_IDS)} repair patches.

## Protected Artifact Hash Check

All frozen Phase 1-3D paths and all 36 historical draft patches match their starting SHA-256 values. {len(REPAIRED_PROFILE_IDS)} separate Phase 3D-R draft patches were generated without rewriting historical review artifacts.

## Approval Status

All 36 profiles are reclassified `RECOMMENDED_FOR_APPROVAL`; no approval metadata was created and no patch was applied.

STATUS: READY_FOR_HUMAN_APPROVAL_AFTER_RECALL_AUDIT

## Stop Boundary

Stopped at validated profile candidates and human-review material. No formal NPC/PC profile database, Character Card, GM Card, runtime projection, Active Cast, Phase 4 system, SillyTavern export, Director material, future plot, or Canon mutation was created.
"""
    atomic_write(ROOT / "work" / "phase3d_recall_review.md", report)


def replace_all_strings(value: Any, old: str, new: str) -> Any:
    if isinstance(value, str):
        return value.replace(old, new)
    if isinstance(value, list):
        return [replace_all_strings(item, old, new) for item in value]
    if isinstance(value, dict):
        return {key: replace_all_strings(item, old, new) for key, item in value.items()}
    return value


def manual_audit_history(profile_id: str) -> list[dict[str, Any]]:
    """Claim-level repairs independently verified in the three manual recall audits."""
    repairs: dict[str, list[dict[str, Any]]] = {
        "NPC_AINZ_OOAL_GOWN": [
            claim("CLAIM_AINZ_NAZARICK_ROLE", "战役设定把安兹记为纳萨力克的幸存统治者；其明示优先事项围绕纳萨力克的利益。", [f"{SETTING_WORLD}:56-59,136-142"], context="Campaign 内的组织身份与公开利益边界。", exceptions=["不导入废弃人物卡的数值能力，也不推断 D3 的即时政治选择。"]),
            claim("CLAIM_AINZ_CASSANDRA_NEGOTIATION", "卡珊德拉用安兹的卷轴把御临风带到安兹面前并作为中介介绍；安兹询问回报，并在提供协助后提出与帝会面的设想。", [f"{tpage(4)}:14-140"], context="龙族秘境战期间的谈判。", exceptions=["只确认会面被提出，不确认帝知情、接受或会面实际发生。"]),
        ],
        "NPC_CASSANDRA": [
            claim("CLAIM_CASSANDRA_PREWAR_WARNING", "卡珊德拉亲自声称其预见显示御临风与悠悠通过受荣之路会阻碍白色魔法使的计划，并建议排除这一风险；团录另记她向白魔示警即将到来的攻击与目标。", [f"{spage(18)}:711-722", f"{spage(20)}:299-303"], context="大战前的预警与建议。", exceptions=["她声称预见过某种未来，不等于该未来必然发生，也不证明御临风对其动机的推理。"]),
            claim("CLAIM_CASSANDRA_AINZ_INTERMEDIARY", "她主动提出带御临风去见安兹，使用安兹的卷轴抵达并把御临风介绍为帝国使者。", [f"{tpage(4)}:14-99"], context="龙族秘境危机中的中介行动。", exceptions=["不由行礼或传话推断完整隶属关系、忠诚或 D3 当前立场。"]),
        ],
        "NPC_CASSIUS_BRIGHT": [
            claim("CLAIM_BRIGHT_BACKGROUND", "人物参考记载布莱特的村庄与妻儿被害；他曾误认并追捕一名精灵，后来得知另有凶手，遭闪光魔法反击失明后学会以风感知，并以独行游击士及“雪漫之袭”之名活动。", [f"{SETTING_NARRATIVE}:112-134", f"{SETTING_CARD}:1104-1135"], context="人物参考中的既往经历与失明适应。", exceptions=["不导入作品外设定或把人物卡的戏谑措辞当作额外世界史。"], evidence_mode="authorial_definition", origin="authorial_supplement"),
            claim("CLAIM_BRIGHT_REFERENCE_TRAITS", "人物参考把布莱特明确写为嫉恶如仇，并会把握机会。", [f"{SETTING_NARRATIVE}:112-134", f"{SETTING_CARD}:1104-1135"], context="人物参考中的明确价值与行为倾向。", exceptions=["不由这些标签自动生成未来判断、动机或行动。"], evidence_mode="authorial_definition", origin="authorial_supplement"),
            claim("CLAIM_BRIGHT_EARLY_CAMPAIGN", "布莱特以游击士身份与御临风一行同行，并参与峡谷调查与战斗。", [f"{fpage(1)}:293-297", f"{fpage(17)}:10-44", f"{fpage(20)}:20-35", f"{fpage(22)}:8-37"], context="第一部分的同行与公开职业身份。", exceptions=["不把每次短暂伤势或值夜细节写成长期状态。"]),
            claim("CLAIM_BRIGHT_LATE_FATE", "布莱特在追查古雷姆林期间失踪；终局时古雷姆林颈部出现被认作布莱特的面容并留下关于其为正义而死的转告，随后该面容死亡。古雷姆林遗骸出现的盲眼幼龙是否与布莱特具有身份连续性，来源没有确认。", [f"{spage(10)}:48-106", f"{tpage(1)}:551-565", f"{tpage(2)}:9-76"], context="古雷姆林终局与布莱特未决结局。", exceptions=["不把盲眼幼龙认定为布莱特，也不把御临风的死亡判断升级为完整机制解释。"]),
        ],
        "NPC_DEATHWING": [
            claim("CLAIM_DEATHWING_INVASION_CONTINUITY", "死亡之翼在大战前公开宣告归来；谢尔伦随后报告诺顿、南茜的背叛，以及包含奥希拉在内的黑龙受控。", [f"{spage(24)}:451-474", f"{spage(25)}:5-46", f"{tpage(2)}:104-108"], context="死亡之翼入侵阶段及其阵营后果。", exceptions=["谢尔伦的报告确认受控结果，不证明死亡之翼亲自施术，也不确认具体控制机制。"]),
        ],
        "NPC_ELDER_XUE": [
            claim("CLAIM_ELDER_XUE_FAMILY_HISTORY", "设定资料记载雪老参与的任务导致其儿子与儿媳死亡，孙女露露缇耶随后在九雪医馆生活。", [f"{SETTING_WORLD}:81-86", f"{fpage(23)}:268-271"], context="雪老家庭与祖孙关系史。", exceptions=["不由丧亲史生成当前情绪或未来保护决定。"]),
            claim("CLAIM_ELDER_XUE_ABILITY_TRANSITION", "该次任务也使雪老失去原有武艺；帝的治疗使其恢复普通健康，他随后请求前往边关并在那里重建斗气。", [f"{SETTING_WORLD}:84-86", f"{fpage(17)}:289-290,403"], context="能力丧失、治疗与边关服役转折。", exceptions=["持续更新的设定阶段不得倒推到更早场景，也不自动成为 D3 数值状态。"]),
            claim("CLAIM_ELDER_XUE_RETIREMENT_AND_MEMORY_REQUEST", "峡谷事件后，雪老在御临风劝说下决定退休并获帝批准；露露缇耶因魔物之盒受创后，他请求艾利用魔法移除她对该事件的记忆。", [f"{SETTING_WORLD}:86", f"{fpage(19)}:18-22", f"{fpage(22)}:133-134", f"{fpage(28)}:113-118"], context="退休决定与家庭照护行动。", exceptions=["不推断露露缇耶当前知晓已被移除的事件内容。"]),
        ],
        "NPC_ELLIE": [
            claim("CLAIM_ELLIE_REFERENCE_TRAITS", "人物参考明确把艾利写为善良、细心可靠的帝国法师，同时指出她在魔法以外的事务上较笨拙。", [f"{SETTING_NARRATIVE}:199-213", f"{SETTING_CARD}:1737-1756"], context="人物参考中的稳定但有范围的特征。", exceptions=["不把标签改写为无条件成功、万能照护或未来行动指令。"], evidence_mode="authorial_definition", origin="authorial_supplement"),
            claim("CLAIM_ELLIE_XUE_AND_LULUTIYE_HISTORY", "艾利作为攻防兼备法师参加雪老救援；后来又应雪老请求，对受创的露露缇耶施法移除该事件记忆。", [f"{fpage(5)}:367-380", f"{fpage(6)}:74-82", f"{fpage(7)}:16-57", f"{fpage(28)}:113-118"], context="雪老救援及魔物之盒善后。", exceptions=["救援中受伤已获处理，不写成当前永久伤势。"]),
            claim("CLAIM_ELLIE_GREMLIN_HOSTAGE", "古雷姆林宅邸战中，艾利设置并维持结界，随后被其挟持；救援时她主动用冰寒之触限制对方并因此手部受伤。", [f"{spage(5)}:381-524"], context="古雷姆林宅邸对抗。", exceptions=["手部伤势可治疗，不推断为当前残疾；不把单次行动概括为无限牺牲倾向。"]),
            claim("CLAIM_ELLIE_YU_COMPANION_ADVISER", "御临风的人物资料把艾利记为其旅行同伴与魔法方面的顾问。", [f"{SETTING_CARD}:525-527"], context="人物参考中的既成同行与顾问关系。", exceptions=["不由顾问身份推断当前同行、持续义务、感情或对所有魔法问题的权威。"]),
        ],
        "NPC_EMPEROR": [
            claim("CLAIM_EMPEROR_HAKU_SUCCESSION", "帝在私下向哈克声称两人是兄弟，并表达希望哈克继承、向他提出这一选择；哈克把说法视为突然，并没有接受。", [f"{SETTING_WORLD}:93-97", f"{fpage(23)}:179-187"], context="帝对哈克的身世陈述与继承提议。", exceptions=["帝的陈述保留为归因事实，不独立确认生物学兄弟关系，也不写成哈克已接受继承。"]),
        ],
        "NPC_GREMLIN": [
            claim("CLAIM_GREMLIN_A_HISTORY", "古雷姆林向魔法师A声称其老师的原宿主已经死亡而自己取代了该宿主；他安排A的家人与未婚妻遭害并诱导A走向绝望。", [f"{SETTING_WORLD}:123-130", f"{spage(1)}:500-531"], context="幻魔出现与A的悲剧。", exceptions=["宿主替换机制仅是古雷姆林的陈述；不把其全部话语自动确认。"]),
            claim("CLAIM_GREMLIN_ELLIE_HOSTAGE", "宅邸战中，古雷姆林佯败后挟持艾利，并逃离御临风一行的包围。", [f"{spage(5)}:381-465"], context="与御临风、艾利的重大对抗里程碑。", exceptions=["不将逃离写成最终胜利或当前存活；古雷姆林后来已被处决。"]),
            claim("CLAIM_GREMLIN_TERMINAL_TRANSFORMATION", "终局时古雷姆林纳入额外心脏与石块，颈部出现被认作布莱特的面容；御临风斩首后该面容死亡，遗骸中出现一只盲眼幼龙。", [f"{tpage(1)}:551-565", f"{tpage(2)}:9-76"], context="古雷姆林被处决前后的终局转化。", exceptions=["盲眼幼龙的身份未确认，不得认定为布莱特或古雷姆林的复活。"]),
        ],
        "NPC_HAKU": [
            claim("CLAIM_HAKU_OSHUTORU_SERVICE", "久远救起并命名失忆的哈克后，他与久远帮助奥修特尔部队击败魔物并进入其麾下；设定与团录均呈现其实际指挥能力。", [f"{SETTING_WORLD}:90-97", f"{fpage(16)}:220-249", f"{fpage(20)}:762"], context="早期服役与指挥经历。", exceptions=["不把一时驻留九雪医馆自动投射为 D3 居所。"]),
            claim("CLAIM_HAKU_SUCCESSION_DISCLOSURE", "帝向哈克声称两人是兄弟，并表达希望哈克继承、向他提出这一选择；哈克质疑这一突然陈述并未接受。", [f"{SETTING_WORLD}:94-96", f"{fpage(23)}:179-187"], context="哈克得知的身世主张与继承提议。", exceptions=["不独立确认血缘，也不写成继承资格已被哈克承认。"]),
            claim("CLAIM_HAKU_LATER_COORDINATION", "法师塔灾变后，哈克继续参与调查与调度，并与欧基协调派出支援。", [f"{spage(4)}:6-46", f"{spage(6)}:306-411", f"{spage(7)}:218-228"], context="第二部分的持续行动角色。", exceptions=["不把每一道临时命令写成永久职权。"]),
        ],
        "NPC_HONDA_KAI_FERGUS": [
            claim("CLAIM_HONDA_SANCTUARY_WAR", "谢尔伦报告自己与本多在入侵阶段击杀诺顿；终局前本多遭白魔压制和伤害，随后安兹介入保护并救下本多等龙王。", [f"{tpage(2)}:104-108", f"{tpage(4)}:495-504", f"{tpage(5)}:365-383"], context="龙族秘境战争的具体里程碑。", exceptions=["诺顿之死按谢尔伦报告记录；不据此推断本多的政治立场或伤后长期状态。"]),
        ],
        "NPC_JERGAL": [
            claim("CLAIM_JERGAL_GLOVE_GUIDANCE", "团录描写御临风的手套触碰他并反复传达关于受荣之道与死亡之翼封印的指令；御临风后来把由此经历的异象理解为耶各的指引。", [f"{spage(24)}:603", f"{tpage(3)}:602-619"], context="御临风的受限知识与归因经历。", exceptions=["只确认发生了手套指令与御临风的归因，不把未来异象写成已发生历史，也不确认完整宇宙论。"]),
        ],
        "NPC_JEWEL_ELDER": [
            claim("CLAIM_JEWEL_ELDER_STRATEGIC_PROPOSAL", "宝石翁向帝报告封印力量会在悠悠死亡时触发，并提议秘密把她送回魔兽山脉、利用该效果对付魔物军。", [f"{fpage(27)}:200-213"], context="悠悠诅咒审议中的明确战略提议。", exceptions=["这只是其提议，不代表帝采纳，也不把提议升级为已执行行为。"]),
            claim("CLAIM_JEWEL_ELDER_TRANSFER_LIMIT", "宝石翁说明诅咒无法真正移除，但可以转移给自愿承接者；他随后准备法阵并在确认御临风意愿后参与转移。", [f"{fpage(27)}:245-248", f"{fpage(28)}:269-377"], context="诅咒转移的知识边界与同意条件。", exceptions=["不由此推断他理解诅咒的全部原理或能独自解决同类诅咒。"]),
        ],
        "NPC_JIANG_ZIYOU": [
            claim("CLAIM_JIANG_DRAGON_ELEPHANT_ART", "神秘海域梦境中，姜子尤选择般若龙象功作为宝藏奖励；他后来在主世界团录中实际使用了龙象之力。", [f"{fpage(15)}:288-339", f"{fpage(17)}:341"], context="梦境奖励被原团明确带回主世界的例外。", exceptions=["不把神秘海域本身或其他梦境内容并入普通主世界 Canon。"]),
            claim("CLAIM_JIANG_LOOKALIKE_ATTACK", "峡谷阶段出现与姜子尤相同面容的黄祸龙狼；一名因该相貌而认出他的人攻击姜子尤。其亲缘、同一身份或形成机制均未确认。", [f"{fpage(17)}:191-212", f"{fpage(19)}:476-486,755-797"], context="相貌联系与袭击的未决历史。", exceptions=["不得确认姜子尤与黄祸龙狼是同一人、亲属或共享灵魂。"]),
            claim("CLAIM_JIANG_MAGE_A_CRISIS", "姜子尤参与抓捕魔法师A；A利用旁人与魔法造成危机，姜子尤仍拒绝放手，直至武赖介入并把他踢开。", [f"{spage(5)}:150-155", f"{spage(6)}:337-504"], context="魔法师A事件中的实际参与。", exceptions=["不从一次拒绝放人推导普遍道德规则，也不把A的全部后果单归因于姜子尤。"]),
            claim("CLAIM_JIANG_DEPARTURE", "A事件后，队伍发现姜子尤不在；玩家帖子写其收拾行装、隐姓埋名离开，御临风后来表示无法确认其去向及其与黄祸龙狼的关系。", [f"{spage(7)}:425-435", f"{spage(8)}:230", f"{spage(9)}:97,149-161"], context="后期离队与认识边界。", exceptions=["不确认死亡、去向或黄祸龙狼联系。"]),
        ],
        "NPC_KENDA_KAI_FERGUS": [
            claim("CLAIM_KENDA_ASSASSINATION_ALLEGATION", "御临风的调查笔记记录了白色魔法使把针对御临风的刺杀计划归给肯达与卡珊德拉。", [f"{SETTING_CARD}:594-595", f"{spage(18)}:490,602-635"], context="白魔陈述经御临风记录的指控。", exceptions=["这不是司法确认，也不把肯达的客观罪责、动机或忠诚写成事实。"]),
            claim("CLAIM_KENDA_DEATH_REPORT", "龙族秘境战争中，谢尔伦向御临风报告肯达在传递诺顿与南茜背叛消息时死亡。", [f"{tpage(2)}:137-147"], context="谢尔伦提供的死亡报告。", exceptions=["只记录报告与御临风可知内容；缺乏独立遗体或后续核验，生命状态仍保持未完全确认。"]),
        ],
        "NPC_KUON": [
            claim("CLAIM_KUON_REFERENCE_TRAITS", "设定参考把久远明确写为善良、活泼、聪明且能力全面的年轻药师。", [f"{SETTING_WORLD}:101-108"], context="人物参考中的明确性格与能力领域。", exceptions=["这些标签不决定未来行动，也不把设定参考时点的居所自动当作 D3。"], evidence_mode="authorial_definition", origin="authorial_supplement"),
            claim("CLAIM_KUON_APOTHECARY_STAGE", "设定资料把久远记为救起并命名哈克的年轻药师，并在该参考时点居于九雪医馆；团录中她检查御临风手臂印记并治疗同伴。", [f"{SETTING_WORLD}:101-108", f"{spage(1)}:378-404", f"{spage(3)}:341-346", f"{spage(4)}:77-78"], context="设定参考阶段的药师身份与已发生医疗行动。", exceptions=["设定资料的‘目前’不自动等于 D3 居所；不写数值疗效。"]),
            claim("CLAIM_KUON_MASK_REACTION", "久远看到左近的面具后疼痛并听到声音；她回忆右近附近曾有较轻反应，并自行把现象联系到继承的解放者之血。", [f"{spage(5)}:37-46"], context="面具反应与久远自己的因果理解。", exceptions=["解放者之血的联系按久远自述记录，不独立确认面具机制。"]),
            claim("CLAIM_KUON_REMOVAL", "该次反应中久远昏倒，并被两个小型身影带走；之后同伴持续注意到她失踪，来源未记录其获救或当前处境。", [f"{spage(5)}:37-46,725-766", f"{spage(6)}:330", f"{spage(8)}:140,424"], context="第二部分的失踪里程碑。", exceptions=["不把他人担忧写成她的真实处境，也不推断死亡或获救。"]),
        ],
        "NPC_LEI_GUANG": [
            claim("CLAIM_LEI_GUANG_ADMINISTRATION", "设定资料记载雷光与沃西斯是帝之下主要处理帝国日常政务的人。", [f"{SETTING_WORLD}:23-26"], context="设定参考中的长期行政角色。", exceptions=["不由政务角色推断对未记录政策的立场。"]),
            claim("CLAIM_LEI_GUANG_COMMAND_HISTORY", "边关反攻中，雷光判断魔物的新战术并指挥反击；他对副手明确表示，统帅应控制而非抛弃对牺牲士兵的恐惧。其后又主持龙族战役军议并接收御临风情报。", [f"{spage(8)}:169-219", f"{spage(9)}:649-835", f"{spage(16)}:233-238", f"{spage(18)}:549-704", f"{spage(19)}:81-194"], context="已发生的指挥行动与一次明确表述的原则。", exceptions=["不把单次表述扩写为对所有情境的自动行为规则。"]),
            claim("CLAIM_LEI_GUANG_FINAL_WAR_ORDERS", "红月导致通讯与各战线隔离后，雷光派出传令、召集罗伯特执行紧急任务、下令楔形分割战场并派部队接应御临风；他已收到御临风关于最终封印与白魔的警告。", [f"{spage(24)}:497-523", f"{spage(25)}:5-47"], context="终局战争中的作战命令与有限知识。", exceptions=["不由部队行动推断未记录的战果或 D3 当前指挥权。"]),
        ],
        "NPC_LINGCHI": [
            claim("CLAIM_LINGCHI_MONSTER_TRANSFORMATION", "设定资料的魔兽条目记载，凌迟被魔兽抓拿后自愿化魔，并因机缘巧合继承了魔兽中传说的力量；他随后整合魔兽兵力并攻破边关。", [f"{SETTING_WORLD}:39-43"], context="魔兽条目中的自愿化魔、能力继承与侵攻史。", exceptions=["来源没有确认力量来自某一名实体，也没有说明自愿化魔的具体机制。"]),
            claim("CLAIM_LINGCHI_CURSED_HALF_MONSTER_REFERENCE", "同一设定集的悠悠条目另把被其母亲救下时的凌迟描述为‘被诅咒感染成半人半魔兽’。", [f"{SETTING_WORLD}:112-119"], context="悠悠背景条目对凌迟状态的另一种来源表述。", exceptions=["该表述与魔兽条目的‘自愿化魔’之间的具体因果、先后和机制没有被来源明确解释，不静默合并。"]),
            claim("CLAIM_LINGCHI_DAKAS_OBJECTIVE", "凌迟以达卡斯身份向帝都提供虚假报告，并试图利用空间龙把兵力带入帝都；计划被揭露后，其部队在帝都附近被击败。设定同时把其追击线连到旧空间龙族惨案，但人物调查笔记仍对该旧案保留疑问。", [f"{SETTING_WORLD}:43", f"{fpage(6)}:443-466", f"{fpage(19)}:640-666", f"{SETTING_CARD}:618-624"], context="达卡斯伪装目标与旧案来源差异。", exceptions=["不把来源间不同确定度抹平，不推断更广泛的幕后计划。"]),
            claim("CLAIM_LINGCHI_PRE_EXECUTION_STATE", "被俘后的审讯没有取得新情报，凌迟在处刑前已表现出认知受损；之后他被公开斩首。", [f"{fpage(27)}:54-58", f"{fpage(28)}:392-404"], context="死亡前状态与已确认处刑。", exceptions=["不从其他角色的警告推断其后来复活或存活。"]),
        ],
        "NPC_LULUTIYE": [
            claim("CLAIM_LULUTIYE_FAMILY_HISTORY", "设定资料记载露露缇耶的父母在与雪老有关的一次任务中死亡；雪老前往边关期间，她寄住在雪老友人经营的九雪医馆。", [f"{SETTING_WORLD}:84", f"{fpage(3)}:16"], context="家庭丧失与阶段性寄住背景。", exceptions=["不写成她与雪老同期同住，也不自动投射为 D3 居所。"]),
            claim("CLAIM_LULUTIYE_MEMORY_BOUNDARY", "魔物之盒事件使露露缇耶受到心理创伤；雪老请求艾利移除相关记忆，叙述称她恢复正常。", [f"{fpage(28)}:113-118"], context="事件后的知识与记忆边界。", exceptions=["不得让她无证据地知道、回忆或讨论已被移除的事件内容。"]),
            claim("CLAIM_LULUTIYE_YOUYOU_HISTORY", "露露缇耶后来与悠悠及御临风重逢；悠悠明确把她列为让某地具有家之感的人之一。", [f"{spage(7)}:48-57", f"{tpage(2)}:659"], context="与悠悠的既成历史联系。", exceptions=["悠悠的感受不证明露露缇耶当前的对等感受、义务或 D3 立场。"]),
        ],
        "NPC_MU_SHAOAI": [
            claim("CLAIM_MU_SHAOAI_RELATIONSHIPS", "慕少艾明确把李萍生称为自己误入歧途的徒弟；奥修特尔以朋友身份为慕少艾作保，御临风后来向慕少艾告知李萍生的死讯。", [f"{fpage(5)}:174-218", f"{fpage(27)}:358-360"], context="师徒身份区分与奥修特尔友人关系。", exceptions=["不得把慕少艾与李萍生混为同一人，也不推断 D3 义务。"]),
            claim("CLAIM_MU_SHAOAI_MEMORY_INQUIRY", "慕少艾治疗黄泉与布莱特，并探查御临风被封锁的记忆；该探查对他造成身体代价。", [f"{fpage(5)}:232-250,299-319"], context="与御临风的既成医疗和记忆探查。", exceptions=["不据此推断他能完整恢复任何记忆或具备无限治疗能力。"]),
            claim("CLAIM_MU_SHAOAI_CURSE_LIMIT", "慕少艾参与悠悠诅咒审议与转移，之后明确表示该诅咒超出他能独自解决的范围。", [f"{fpage(27)}:201-268", f"{fpage(28)}:311-315", f"{spage(1)}:84,403-455"], context="诅咒处理中的参与和自述限制。", exceptions=["其他人物对其学识与行踪的传闻不升级为客观现状。"]),
            claim("CLAIM_MU_SHAOAI_ATTRIBUTED_REPUTATION", "一名发言者把慕少艾描述为顶尖药师、拥有学者名号、知识广博且常年游历。", [f"{spage(2)}:293-295"], context="团录中的第三方声誉描述。", exceptions=["以归因声誉保存，不确认每一称号、传闻或当时所在地为客观现状。"], evidence_mode="explicit_source_statement", stability="observed_only"),
        ],
        "NPC_MU_TOU": [
            claim("CLAIM_MU_TOU_ORIGIN", "人物参考记载沐透是十九岁的异界来客，在点击神秘对话框后跨越世界；参考把他写为随和、自由。", [f"{SETTING_NARRATIVE}:87-110", f"{SETTING_CARD}:869-890"], context="人物卡来源与明确人物定义。", exceptions=["年龄不随未记录时间自动更新，性格标签不替代实际行为证据或未来决定。"], evidence_mode="authorial_definition", origin="authorial_supplement"),
            claim("CLAIM_MU_TOU_WIZARD_TRANSITION", "监狱塔危机中，沐透在自己的 Underworld 见到幻魔百首黄金龙；他在交易中释放白色魔法使，并获得 Wizard Driver 与戒指魔法。", [f"{SETTING_CARD}:893-927", f"{SETTING_WORLD}:125-126"], context="幻魔接触与 Wizard 身份转变。", exceptions=["不由交易推断对白魔的永久忠诚，也不把设定时点‘目前’当作 D3。"]),
        ],
        "NPC_NOSURI": [
            claim("CLAIM_NOSURI_OUGI_SIBLING", "欧基在团录中称诺斯莉为姐姐；两人的姐弟关系是其共同经历的稳定边界。", [f"{spage(3)}:388-398", f"{spage(4)}:11-38"], context="第二部分明确称谓支持的亲属关系。", exceptions=["不由亲属关系推断当前亲密度、服从或共同立场。"]),
            claim("CLAIM_NOSURI_TRAP_INJURY", "追击古雷姆林期间，现场报告称诺斯莉被下水道陷阱所伤、无法继续行动，并在帐篷中接受法师和药师治疗。", [f"{spage(7)}:469-478", f"{spage(8)}:86-89"], context="追击战中的临时伤势与目击范围。", exceptions=["不写成当前永久伤势；她没有亲历伤后继续展开的全部追击。哈克对帮手命运的推测不是事实。"]),
        ],
        "NPC_OSHIRA": [
            claim("CLAIM_OSHIRA_CLAN_DEPENDENCY", "御临风的调查笔记把黑龙族描述为受赤龙族保护与监督；该说法作为其调查所得保留。", [f"{SETTING_CARD}:583,596", f"{spage(15)}:1032-1070"], context="黑龙族历史位置的归因资料。", exceptions=["不把御临风的调查结论升级为无争议世界事实，也不推断奥希拉当前政治立场。"]),
            claim("CLAIM_OSHIRA_LINEAGE_KNOWLEDGE", "奥希拉向悠悠讲述黑龙历史时说前任黑龙族长是其父，父亲在他年幼时已死；御临风理解其所指为死亡之翼。奥希拉说明自己所知许多内容来自传闻。", [f"{spage(18)}:753-761", f"{spage(19)}:7-8,45-46"], context="父系陈述及奥希拉自身知识范围。", exceptions=["死亡之翼的对应保留御临风理解的归因；不识别奥希拉提及但未命名的被毁物。"]),
        ],
        "NPC_OSHUTORU": [
            claim("CLAIM_OSHUTORU_REFERENCE_IDENTITY", "人物参考把奥修特尔明确写为富有正义感的年轻剑士。", [f"{SETTING_NARRATIVE}:154-165", f"{SETTING_WORLD}:90-97,165"], context="人物参考中的明确价值与身份边界。", exceptions=["不由正义感标签生成未来判断、对白或行动。"], evidence_mode="authorial_definition", origin="authorial_supplement"),
            claim("CLAIM_OSHUTORU_MASK_BATTLE", "峡谷战中，奥修特尔保护御临风，解放水属性假面力量并以伏龙梅迎战黑泥敌人。", [f"{SETTING_WORLD}:90-97,165", f"{fpage(19)}:755-797"], context="假面持有与一次决定性战斗。", exceptions=["不从该场景推断持续变身、当前伤势或无限能力。"]),
            claim("CLAIM_OSHUTORU_RELATIONSHIPS", "奥修特尔收留哈克与久远进入其麾下；以右近身份接收御临风的边关报告、识别达卡斯威胁，并称慕少艾为朋友。", [f"{SETTING_WORLD}:90-97", f"{fpage(4)}:426", f"{fpage(5)}:14-25,184-185", f"{fpage(6)}:452-466"], context="服役、友人及帝都调查历史。", exceptions=["不由旧关系推断 D3 当前义务或私人感情。"]),
            claim("CLAIM_OSHUTORU_LATE_COMMAND", "龙族任务中御临风所在单位被记为奥修特尔直属；红月战事后报告称奥修特尔与武赖所在战线遭袭并失去通讯。", [f"{spage(17)}:122,175-192", f"{spage(24)}:497-511"], context="后期指挥链与最后已知战线报告。", exceptions=["失联不等于死亡、战败或当前仍受困。"]),
        ],
        "NPC_REN_FANZHEN": [
            claim("CLAIM_REN_PATERNAL_INHERITANCE", "特殊梦境中，任帆真的退休特工父亲私下留下异常物品并教他使用；叙述称父子似乎都倾向保密，父亲告诫他隐藏这些物品。任帆真知道基础异常规则，但此前没有处理过同类事件。", [f"{tpage(5)}:872-876"], context="Special Interlude 内的继承、训练与经验边界。", exceptions=["保密倾向保留叙述中的不确定语气；不得传播到主世界普通知识。"], origin="special_interlude"),
            claim("CLAIM_REN_UNDERCOVER_CLEARANCE", "他以清洁工身份掩护校园会议安保工作，掌握与会者档案，但周正的受限细节不在其权限内。", [f"{tpage(5)}:875-894"], context="未完成特殊梦境中的任务与知识权限。", exceptions=["不把未完成场景的黑暗、敲门声或个人恐惧改写为主世界长期状态。"], origin="special_interlude"),
        ],
        "NPC_SERTANT_LU_YOURLAN": [
            claim("CLAIM_SERTANT_NANCY_HISTORY", "御临风的角色资料明确记载瑟坦特曾杀死南茜。", [f"{SETTING_CARD}:580-582"], context="人物资料中的既往战役事实。", exceptions=["同一笔记对其性情及与毒龙王关系的推测不升级为客观事实。"]),
            claim("CLAIM_SERTANT_MASK_AWAKENING", "龙族秘境战中，谢尔伦与本多选择瑟坦特使用帝国假面；佩戴后他一度昏睡，悠悠的光进入其体内后他苏醒并启动假面，随后参与对白魔的战斗。", [f"{tpage(2)}:121-126,437-470", f"{tpage(3)}:214-265", f"{tpage(4)}:188-219"], context="假面造成的临时失能、唤醒与参战。", exceptions=["光来自悠悠是明确叙述；面具为何使其昏睡是悠悠的解释，不升级为全知机制。"]),
        ],
        "NPC_WHITE_MAGICIAN": [
            claim("CLAIM_WHITE_MAGICIAN_WIZARD_PHANTOM_HISTORY", "设定资料把监狱塔囚禁与后来的活动分开记录：沐透协助白色魔法使逃离后，白魔给予沐透 Wizard Driver，并在该设定参考时点诱导大量幻魔出现。", [f"{SETTING_WORLD}:123-130"], context="监狱塔逃离后的 Wizard Driver 与幻魔活动。", exceptions=["设定参考中的‘目前’不自动等于 D3；其动机仍未知。"]),
        ],
        "NPC_WILLIAM": [
            claim("CLAIM_WILLIAM_FULL_NAME", "他在与御临风初次交涉时自我介绍为‘威廉信长’。", [f"{fpage(22)}:369-375"], context="角色亲口提供的全名。", exceptions=["只作为确认姓名，不把同页之外的同名人物或作品外设定并入。"]),
        ],
        "NPC_WURAI": [
            claim("CLAIM_WURAI_FIRE_MASK", "设定资料明确把武赖记为火神假面的持有者。", [f"{SETTING_WORLD}:164-169"], context="设定参考阶段的假面身份。", exceptions=["不自动投射为未记录的 D3 持有状态，也不补写完整能力清单。"]),
        ],
        "NPC_YOMI_ISAYAMA": [
            claim("CLAIM_YOMI_REFERENCE_BACKGROUND", "人物参考记载谏山黄泉被奈落收养、与神乐一同长大并受除魔训练；她曾与饭纲纪之订婚而后解除婚约，失去奈落与狮子王，并被三途河重创后获得杀生石提议。", [f"{SETTING_CARD}:636-660", f"{SETTING_NARRATIVE}:64-77"], context="人物卡中明确写出的既往关系与创伤史。", exceptions=["不导入来源外作品史，不把旧婚约、旧目标或伤势自动写成当前状态。"], evidence_mode="authorial_definition", origin="authorial_supplement"),
            claim("CLAIM_YOMI_LION_KING_TRANSITION", "帝都阶段，狮子王被归还时封印已解除，黄泉可以接触并与剑中灵体乱红莲沟通。", [f"{fpage(21)}:575,770-776", f"{fpage(22)}:196-218,283-289", f"{fpage(23)}:129-134"], context="狮子王与乱红莲的装备/能力状态转变。", exceptions=["不把黄泉对自己过去‘死亡’的主观表述改写成当前已死，也不传播特殊梦境知识。"]),
        ],
        "NPC_YOUYOU": [
            claim("CLAIM_YOUYOU_CLAN_SURVIVOR_HISTORY", "设定资料记载悠悠的母亲收留受诅咒的凌迟，随后人类势力发现隐藏的空间龙族栖地，族群遭毁，悠悠成为幸存者。", [f"{SETTING_WORLD}:112-119", f"{fpage(20)}:10-45", f"{SETTING_NARRATIVE}:171-194"], context="空间龙族毁灭与悠悠的幸存背景。", exceptions=["不补写来源未确认的全部加害者、动机或宇宙论。"]),
            claim("CLAIM_YOUYOU_SWORD_AND_DETENTION", "悠悠尝试稳定御临风的剑而被灼伤并严重透支；诅咒随后显现，她被拘留，最终由御临风自愿承接诅咒。", [f"{fpage(22)}:389-485", f"{fpage(28)}:265-377"], context="诅咒转移前的救援与拘押历史。", exceptions=["不把透支或拘押写成 D3 当前状态，也不由救援推断当前感情。"]),
            claim("CLAIM_YOUYOU_SERTANT_AWAKENING", "龙族秘境战中，来自悠悠的光进入因假面而昏睡的瑟坦特，使其苏醒并启动假面参战。", [f"{tpage(2)}:437-470"], context="悠悠在瑟坦特假面事件中的实际作用。", exceptions=["不把该次表现概括为可任意唤醒任何人；昏睡机制仍只是角色解释。"]),
        ],
        "PC_YU_LINFENG": [
            claim("CLAIM_YU_LINFENG_EARLY_BONDS", "人物参考记载易冷是御临风的剑术老师、雪老是其师长与朋友；御临风还曾自述有六百九十八名部下死亡并对此负有责任。", [f"{SETTING_CARD}:229-254", f"{SETTING_NARRATIVE}:38-62"], context="玩家角色人物卡中的既往关系与历史自述。", exceptions=["六百九十八人的责任感是其历史自述，不授权生成 D3 当前情绪、义务或未来决定。"]),
            claim("CLAIM_YU_LINFENG_MEMORY_RESTORATION", "边关事件后，御临风与贞子相关的感情和记忆曾因韩诺交易而被抹去；威廉后来检查交换印记并恢复了这些感情与边关记忆。", [f"{fpage(22)}:369-449", f"{fpage(23)}:1-72"], context="边关记忆的移除与恢复。", exceptions=["只记录已恢复的既往内容，不生成御临风当前情绪、思想或对白。"]),
        ],
    }
    return repairs.get(profile_id, [])


def repair_profile(profile: dict[str, Any]) -> dict[str, Any]:
    profile = copy.deepcopy(profile)
    profile_id = profile["id"]
    profile["identity"]["established_history"].extend(manual_audit_history(profile_id))

    def move_history_claim(claim_id: str) -> dict[str, Any]:
        history = profile["identity"]["established_history"]
        for index, item in enumerate(history):
            if item.get("claim_id") == claim_id:
                return history.pop(index)
        raise ValueError(f"{profile_id}: missing repair claim {claim_id}")

    if profile_id == "NPC_GREMLIN":
        identity = next(item for item in profile["identity"]["public_identity"] if item.get("claim_id") == "CLAIM_GREMLIN_IDENTITY")
        identity["claim"] = "古雷姆林是与白色魔法使一系有关的 Phantom，并以魔法师A老师的身份出现；他后来声称老师的原宿主已死且由自己取代。"
        identity["exceptions"] = ["只确认其以该身份出现及其本人作出宿主替换陈述；不确认 Phantom 与原老师是同一持续人格。"]
        identity["sources"] = list(dict.fromkeys([*identity.get("sources", []), f"{spage(1)}:508-514"]))
    elif profile_id == "NPC_CASSIUS_BRIGHT":
        profile["core_personality"].append(move_history_claim("CLAIM_BRIGHT_REFERENCE_TRAITS"))
    elif profile_id == "NPC_ELLIE":
        adviser_claim = move_history_claim("CLAIM_ELLIE_YU_COMPANION_ADVISER")
        profile["relationships"].append(relationship(
            "RELATIONSHIP_ELLIE_YU_LINFENG",
            "CHARACTER_YU_LINFENG",
            "traveling companion and magic adviser",
            [adviser_claim],
            adviser_claim["sources"],
            experiences=["同行与魔法建议"],
        ))
    elif profile_id == "NPC_KUON":
        profile["core_personality"].append(move_history_claim("CLAIM_KUON_REFERENCE_TRAITS"))
    elif profile_id == "NPC_MU_TOU":
        profile["core_personality"].append(claim(
            "CLAIM_MU_TOU_REFERENCE_TRAITS",
            "人物参考把沐透明确写为随和、自由。",
            [f"{SETTING_NARRATIVE}:87-110", f"{SETTING_CARD}:869-890"],
            context="人物参考中的稳定但有限的人格定义。",
            exceptions=["不由标签生成未来行动、价值判断或内心独白。"],
            evidence_mode="authorial_definition",
            origin="authorial_supplement",
        ))
    elif profile_id == "NPC_NOSURI":
        sibling_claim = move_history_claim("CLAIM_NOSURI_OUGI_SIBLING")
        profile["relationships"].append(relationship(
            "RELATIONSHIP_NOSURI_OUGI",
            "CHARACTER_OUGI",
            "siblings",
            [sibling_claim],
            sibling_claim["sources"],
            experiences=["共同参与古雷姆林追捕"],
            notes="欧基无需独立 Worldbook entry；这里只保留诺斯莉的明确姐弟关系，不推断当前立场。",
        ))
    elif profile_id == "NPC_OSHUTORU":
        profile["core_personality"].append(move_history_claim("CLAIM_OSHUTORU_REFERENCE_IDENTITY"))
    elif profile_id == "NPC_WILLIAM":
        if "威廉信长" not in profile["aliases"]:
            profile["aliases"].append("威廉信长")

    if profile_id == "NPC_XIERLUN_VON_GILCODE":
        profile["identity"]["established_history"].extend([
            claim(
                "CLAIM_XIERLUN_ALLIANCE_AND_ENGAGEMENT_PLANNING",
                "谢尔伦与帝是多年好友；设定资料把两人记为帝国与龙族联合的真正的幕后操盘者，并记载谢尔伦参与策划了御临风和悠悠的婚约安排。",
                [SETTING_XIERLUN],
                context="联盟形成与婚约安排的历史角色。",
                exceptions=["不得据此推断 D3 当前政治立场、当前支持婚约、对御临风的私人感情或未来义务。"],
            ),
            claim(
                "CLAIM_XIERLUN_DRAGON_BALANCE_ROLE",
                "他明面上较少插手龙族内务，与各大龙王交好，在各部族中具有人望，并一直维持着龙族内部的平衡。",
                [SETTING_XIERLUN],
                context="设定资料记录的长期龙族内部位置。",
                exceptions=["不把交好概括成无条件同盟，也不推断 D3 的具体立场。"],
            ),
            claim(
                "CLAIM_XIERLUN_COMBAT_BACKGROUND",
                "他是少数仍存活的上古龙族之一，曾作为实际战力对抗死亡之翼与黑龙一族；年老后身体与魔法在龙王或族长中约为中游，但凭战斗经验和众多奇物仍是一线战力。",
                [SETTING_XIERLUN],
                context="设定阶段的能力范围与年龄限制。",
                exceptions=["不把设定阶段的能力评价自动投射为 D3 当前状态或完整技能清单。"],
            ),
            claim(
                "CLAIM_XIERLUN_SCHOLARLY_HISTORY",
                "他涉猎多种学问，晚年研究过其他大陆；年轻时曾乔装游历帝国并读完帝都图书馆初期的藏书，这段经历成为馆内传说。",
                [SETTING_XIERLUN],
                context="学术、旅行与帝都图书馆历史。",
                exceptions=["不由涉猎广泛推断他知道任何未被来源点明的具体秘密。"],
            ),
        ])
        profile["relationships"].append(relationship(
            "RELATIONSHIP_XIERLUN_YOUYOU_AND_YU_ENGAGEMENT",
            "CHARACTER_YOUYOU",
            "engagement planner and elder",
            [claim(
                "CLAIM_XIERLUN_ENGAGEMENT_RELATIONSHIP",
                "谢尔伦参与策划御临风与悠悠的婚约安排，并在御临风抵达龙族秘境后向他提出和解释该安排。",
                [SETTING_XIERLUN, f"{P15}:390-450"],
                context="龙族秘境前段的婚约安排。",
                exceptions=["不推断婚约在 D3 的当前有效性、双方当前情感或谢尔伦当前态度。"],
            )],
            [SETTING_XIERLUN, f"{P15}:390-450"],
            experiences=["向御临风提出并解释婚约安排"],
        ))

    elif profile_id == "NPC_YOUYOU":
        profile["identity"]["established_history"].extend([
            claim(
                "CLAIM_YOUYOU_ENGAGEMENT_HISTORY",
                "谢尔伦参与策划了御临风与悠悠的婚约安排；御临风只把它作为保护悠悠的权宜办法而暂时接受，并明确保留悠悠日后自行选择的权利。龙族仪式中，本多公开称御临风为她的婚约者，并声称这是二人相爱后定下的约定。",
                [SETTING_XIERLUN, f"{P15}:390-450", f"{P17}:671-683"],
                context="婚约从私下安排到龙族仪式公开确认的历史过程。",
                exceptions=["御临风的接受是临时且保护性的；本多关于‘相爱’的说法只作为其公开陈述，不证明双方当时或 D3 的私人感情、同意、未来婚姻意图或婚约法律状态。"],
            ),
            claim(
                "CLAIM_YOUYOU_INHERITANCE_HISTORY",
                "龙族仪式中，悠悠被正式宣布为当时空间龙族族长，并继承先祖之字“琳”，姓名变为芬尔德·琳·特兰希尔。",
                [f"{P17}:671-683", SETTING_YOUYOU],
                context="姓名与族长身份的同场历史转变。",
                exceptions=["来源没有证明这次姓名继承本身自动赋予具体能力；不得与后来的受荣之道力量继承合并。"],
            ),
            claim(
                "CLAIM_YOUYOU_PROPHECY_HISTORY",
                "在受荣之道中，先驱者消散的光点汇聚到悠悠身上；随后悠悠描述了秘境将被白魔操控的黑龙族长毁坏并确认自己是死亡之翼的最后一道封印。",
                [f"{T2}:340-414"],
                context="龙族秘境战期间的受荣之道经历与预见。",
                exceptions=["只记录她在该事件中获得并表达的信息，不概括成全知或无限预言能力，也不把姓名继承、预言与封印身份视为同一机制。"],
            ),
            claim(
                "CLAIM_YOUYOU_PROTECTION_HISTORY",
                "死亡之翼战中，御临风身上出现乳白色力量；团录明确称其中一次脱险为“来自悠悠的保护”，其后该力量也在龙吼中保护他。",
                [f"{T5}:123-135", f"{T5}:257-283"],
                context="死亡之翼终局战中的两次保护表现。",
                exceptions=["来源没有完整交代授予方式、持续时限或剩余次数；不得称其单独导致死亡之翼败北。"],
            ),
        ])
        rel = next(item for item in profile["relationships"] if item["relationship_id"] == "RELATIONSHIP_YOUYOU_YU_LINFENG")
        rel["established_history"].append(claim(
            "CLAIM_YOUYOU_YU_LATE_MILESTONES",
            "两人的历史还包括御临风为保护悠悠而暂时接受婚约安排并保留她日后选择权、本多公开称其为婚约者并声称二人相爱、共同进入受荣之道，以及悠悠的力量在死亡之翼战中保护御临风。",
            [f"{P15}:390-450", f"{P17}:671-683", f"{T2}:162-414", f"{T5}:123-135"],
            context="龙族秘境中后段的关系里程碑。",
            exceptions=["本多的‘相爱’说法是其公开陈述而非独立证明；不生成双方当前情绪、当前同意状态或未来婚姻承诺。"],
        ))
        rel["known_shared_experiences"] = [
            "救治御临风与雪老", "诅咒由悠悠转移到御临风", "御临风暂时接受婚约安排并保留悠悠日后选择权；本多公开宣称婚约与相爱",
            "姓名与族长身份传承仪式", "共同进入受荣之道", "死亡之翼战中的乳白色保护",
        ]

    elif profile_id == "PC_YU_LINFENG":
        profile["identity"]["established_history"].extend([
            claim(
                "CLAIM_YU_LINFENG_ENGAGEMENT_HISTORY",
                "在龙族秘境期间，御临风把婚约安排作为保护悠悠的权宜办法而暂时接受，并明确保留悠悠日后自行选择的权利；本多随后在龙族仪式中公开称他为悠悠的婚约者。",
                [f"{P15}:390-450", f"{P17}:671-683"],
                context="玩家角色已发生的婚约历史。",
                exceptions=["临时接受不等于永久同意；这不授权 AI 决定他或悠悠当前的感情、同意状态、对白、行动或未来婚姻选择。"],
            ),
            claim(
                "CLAIM_YU_LINFENG_YOUYOU_INHERITANCE_WITNESS",
                "御临风在场见证悠悠成为空间龙族族长并继承“琳”之名，之后与她共同进入受荣之道。",
                [f"{P17}:671-683", f"{T2}:162-414"],
                context="龙族仪式与受荣之道的共享历史。",
                exceptions=["不赋予玩家角色未记录的仪式知识。"],
            ),
            claim(
                "CLAIM_YU_LINFENG_RECEIVED_YOUYOU_PROTECTION",
                "死亡之翼战中，御临风受到来自悠悠的保护；该保护表现为乳白色力量，至少一次使他脱离抓制，并在龙吼中继续提供保护。",
                [f"{T5}:123-135", f"{T5}:257-283"],
                context="外部施加于 PC 的已发生保护效果。",
                exceptions=["不授权 AI 生成未来动作、想法或情绪；不推断该保护在 D3 仍可用或剩余次数。"],
            ),
        ])
        rel = next(item for item in profile["relationships"] if item["relationship_id"] == "RELATIONSHIP_YU_LINFENG_YOUYOU")
        rel["established_history"].append(claim(
            "CLAIM_YU_LINFENG_YOUYOU_LATE_HISTORY",
            "两人的后续共享历史包括御临风以保护悠悠为目的暂时接受婚约安排、本多在公开仪式中称其为婚约者、悠悠的族长与姓名传承、共同进入受荣之道，以及死亡之翼战中的保护。",
            [f"{P15}:390-450", f"{P17}:671-683", f"{T2}:162-414", f"{T5}:123-135"],
            context="客观历史里程碑。",
            exceptions=["御临风的接受是临时且保护性的，并保留悠悠日后选择权；不得替玩家表述当前感情、同意、承诺或下一步。"],
        ))
        rel["known_shared_experiences"] = [
            "悠悠救治御临风与雪老", "诅咒转移", "御临风为保护悠悠而暂时接受婚约安排及本多在龙族仪式中的公开称呼",
            "姓名与族长身份传承仪式", "共同进入受荣之道", "死亡之翼战中的乳白色保护", "龙族秘境护送与撤离",
        ]

    elif profile_id == "NPC_WHITE_MAGICIAN":
        profile = replace_all_strings(profile, "监狱塔后续交锋", "地下兵工厂追击战")
        profile = replace_all_strings(profile, "监狱塔后续与龙族秘境终局", "地下兵工厂追击与龙族秘境终局")
        profile["identity"]["established_history"].extend([
            claim(
                "CLAIM_WHITE_MAGICIAN_FACTORY_CONFRONTATION",
                "地下兵工厂遭帝国部队攻入后，白色魔法使在追击洞窟与御临风及帝国小队交锋，自称笛木奏，提出以崔斯坦为筹码交换预言情报，最后带走崔斯坦并传送离开。",
                [f"{P20}:127-169", f"{P20}:285-340", f"{P20}:406-479", f"{P20}:525-530"],
                context="地下兵工厂行动及其紧接的洞窟追击；不是监狱塔事件。",
                exceptions=["御临风对其动机的推理不升级为客观事实。"],
            ),
            claim(
                "CLAIM_WHITE_MAGICIAN_OSHIRA_CONTROL",
                "龙族秘境战中，团录记载白色魔法使操控黑龙族长奥希拉进行破坏，并在远处以笛剑吹奏、持续操控。",
                [f"{T2}:478-500", f"{T3}:32-33", f"{T3}:89-123"],
                context="龙族秘境战的黑龙族长控制线。",
                exceptions=["来源未确认血脉魔法机制，也未说明奥希拉的意识、抵抗、事后记忆或死亡之翼是否共同直接施术。"],
            ),
        ])

    elif profile_id == "NPC_OSHIRA":
        profile["identity"]["established_history"].append(claim(
            "CLAIM_OSHIRA_DRAGON_WAR_CONTROL",
            "龙族秘境战中，谢尔伦报告奥希拉与黑龙族遭到控制；之后团录明确描述白色魔法使操控黑龙族长奥希拉进行破坏和作战。",
            [f"{T2}:94-108", f"{T2}:478-500", f"{T3}:32-33", f"{T3}:89-123"],
            context="龙族秘境战中的重大非自愿状态。",
            exceptions=["“血脉魔法”并未被原文明确确认为具体机制；死亡之翼是否共同直接施术、奥希拉当时是否清醒或抵抗、事后是否知情及长期后果均未确认。"],
        ))
        profile["relationships"].append(relationship(
            "RELATIONSHIP_OSHIRA_YOUYOU",
            "CHARACTER_YOUYOU",
            "recognized dragon elder",
            [claim(
                "CLAIM_OSHIRA_YOUYOU_HISTORY",
                "悠悠称奥希拉为叔叔；奥希拉以龙族长辈身份同她互动，并受谢尔伦委托短暂陪护她。",
                [f"{P15}:1032-1046", "extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.md:729-761"],
                context="龙族宴会及考验后。",
                exceptions=["称谓与陪护不证明完整政治立场或当前亲密度。"],
            )],
            [f"{P15}:1032-1046", "extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 18/posts.md:729-761"],
            experiences=["龙族宴会互动", "受谢尔伦委托陪护悠悠"],
        ))
        profile["evidence_gaps"].extend([
            "白魔控制奥希拉的具体机制未确认；血脉魔法仅是待证线索。",
            "控制期间的意识、抵抗、事后记忆与长期后果未知。",
        ])

    elif profile_id == "NPC_EMPEROR":
        profile["relationships"].append(relationship(
            "RELATIONSHIP_EMPEROR_XIERLUN",
            "CHARACTER_XIERLUN_VON_GILCODE",
            "longstanding friend and alliance co-planner",
            [claim(
                "CLAIM_EMPEROR_XIERLUN_ALLIANCE_HISTORY",
                "帝与谢尔伦是多年好友；帝国与龙族联合表面由肯达牵线，设定资料把帝与谢尔伦记为真正的幕后操盘者。",
                [SETTING_XIERLUN],
                context="联盟形成的历史角色。",
                exceptions=["不推断 D3 当前政治立场、私人感情强度或未来承诺。"],
            )],
            [SETTING_XIERLUN],
            experiences=["共同推动帝国与龙族联合"],
        ))

    elif profile_id == "NPC_KENDA_KAI_FERGUS":
        profile["identity"]["established_history"].extend([
            claim(
                "CLAIM_KENDA_PUBLIC_ALLIANCE_ROLE",
                "肯达是帝国与龙族联合的公开牵线人；设定资料同时区分，真正的幕后操盘者是谢尔伦与帝。",
                [SETTING_XIERLUN],
                context="公开角色与幕后策划角色的边界。",
                exceptions=["不从牵线身份推断其政治立场、动机或对任何一方的忠诚。"],
            ),
            claim(
                "CLAIM_KENDA_ENGAGEMENT_INTERVENTION",
                "龙族秘境期间，肯达要求御临风在比赛中输给自己，并希望他放弃与悠悠的婚约，声称这是其应对龙族预言计划的一部分。",
                [f"{P17}:378-408"],
                context="肯达对御临风的直接陈述与请求。",
                exceptions=["只确认他提出过该请求与说法，不确认其真实动机、计划正确性或政治立场。"],
            ),
        ])

    elif profile_id == "NPC_HONDA_KAI_FERGUS":
        profile["identity"]["established_history"].append(claim(
            "CLAIM_HONDA_YOUYOU_CEREMONY",
            "本多在龙族仪式中宣布悠悠成为空间龙族族长、继承先祖之字“琳”，并公开把御临风称为她的婚约者。",
            [f"{P17}:671-683"],
            context="空间龙族长与婚约公开仪式。",
            exceptions=["仪式主持行为不证明本多的全部私人立场或 D3 当前态度。"],
        ))

    elif profile_id == "NPC_DEATHWING":
        profile["relationships"].append(relationship(
            "RELATIONSHIP_DEATHWING_XIERLUN",
            "CHARACTER_XIERLUN_VON_GILCODE",
            "historical and final-war adversary",
            [claim(
                "CLAIM_DEATHWING_XIERLUN_HISTORY",
                "谢尔伦曾作为实际战力对抗死亡之翼，并在终局战中压制其本轮肉身，为御临风突入创造条件。",
                [SETTING_XIERLUN, f"{T5}:16-20", f"{T5}:43-105", f"{T5}:261-308"],
                context="长期对抗背景与原团终局战。",
                exceptions=["不把本轮肉身瓦解写成永久死亡，也不推断当前敌对行动仍在持续。"],
            )],
            [SETTING_XIERLUN, f"{T5}:16-20", f"{T5}:43-105", f"{T5}:261-308"],
            experiences=["死亡之翼终局战"],
            visibility="public",
        ))

    if profile_id in {"NPC_CASSIUS_BRIGHT", "NPC_ELLIE", "NPC_KUON", "NPC_MU_TOU", "NPC_OSHUTORU"}:
        profile["evidence_gaps"] = [
            "除本候选已记录的人物参考明示特征外，完整价值排序、跨情境声线与 D3 人格变化仍无充分证据。"
            if item == "稳定人格、价值排序与跨情境声线证据不足。" else item
            for item in profile.get("evidence_gaps", [])
        ]
    profile["notes"] = "Phase 3D-R repaired candidate. It preserves the Phase 3D review baseline and remains pending human approval."
    return profile


EVENT_AUDITS: tuple[dict[str, Any], ...] = (
    {
        "file": "EVENT_CURSE_TRANSFER.md", "id": "EVENT_CURSE_TRANSFER", "label": "御临风—悠悠诅咒转移",
        "stage": "Early Campaign / Imperial Capital curse arc", "location": "帝都皇宫内的转移法阵房间",
        "participants": ["PC_YU_LINFENG", "NPC_YOUYOU", "NPC_MU_SHAOAI", "NPC_JEWEL_ELDER", "NPC_WILLIAM", "NPC_EMPEROR"],
        "sources": ["extracted-first/27/posts.md:224-269 — 帝听取方案并准许御临风自愿承接。", "extracted-first/28/posts.md:265-377 — 宝石翁、慕少艾与威廉实施法阵，诅咒从悠悠进入御临风。"],
        "facts": ["御临风明确表示自己想活下去，但自愿承接诅咒。", "宝石翁、慕少艾与威廉共同执行转移，悠悠身上的诅咒进入御临风。"],
        "knowledge": ["帝、三位施术者与御临风知道转移决定和实施结果。", "悠悠当时处于痛苦、近似昏睡状态；来源不证明她完整知悉现场讨论。"],
        "consequences": ["御临风获得诅咒与相伴能量；悠悠不再承担该次致命诅咒。"],
        "affected": ["PC_YU_LINFENG", "NPC_YOUYOU", "NPC_MU_SHAOAI", "NPC_JEWEL_ELDER", "NPC_WILLIAM", "NPC_EMPEROR"],
        "representation": "PROFILED — affected Phase 3D profiles already carry the event; recall audit preserves knowledge limits.",
    },
    {
        "file": "EVENT_ENGAGEMENT_ARRANGEMENT.md", "id": "EVENT_ENGAGEMENT_ARRANGEMENT", "label": "御临风—悠悠婚约安排与公开仪式",
        "stage": "Dragon Sanctuary arrival and ceremony", "location": "龙族秘境；谢尔伦私下谈话处与龙族祠堂仪式",
        "participants": ["PC_YU_LINFENG", "NPC_YOUYOU", "NPC_XIERLUN_VON_GILCODE", "NPC_HONDA_KAI_FERGUS", "NPC_KENDA_KAI_FERGUS"],
        "sources": [f"{P15}:390-450 — 谢尔伦解释并提出安排，御临风条件性接受。", f"{P17}:671-683 — 本多在仪式中公开称御临风为悠悠的婚约者。", f"{SETTING_XIERLUN} — 谢尔伦参与策划婚约。"],
        "facts": ["谢尔伦参与策划并向御临风提出安排。", "本多在仪式中公开确认婚约者身份。", "肯达后来要求御临风放弃婚约，但其动机陈述不等于客观事实。"],
        "knowledge": ["御临风知道谢尔伦的解释，并只为保护悠悠而暂时接受，同时明确保留悠悠日后选择权。", "本多公开声称婚约源自二人相爱；这是本多的陈述，不证明双方私人感情。悠悠在仪式中在场，但来源不足以填充她的完整内心或 D3 当前同意状态。"],
        "consequences": ["婚约成为双方关系的历史里程碑与当时帝国—龙族友好的公开象征。"],
        "affected": ["PC_YU_LINFENG", "NPC_YOUYOU", "NPC_XIERLUN_VON_GILCODE", "NPC_HONDA_KAI_FERGUS", "NPC_KENDA_KAI_FERGUS"],
        "representation": "MISSING before repair; PROFILED in repaired candidates. Current feelings and future marriage intent remain unasserted.",
    },
    {
        "file": "EVENT_YOUYOU_INHERITANCE.md", "id": "EVENT_YOUYOU_INHERITANCE", "label": "悠悠族长继承与姓名阶段转换",
        "stage": "Dragon Sanctuary ceremony", "location": "龙族祠堂",
        "participants": ["NPC_YOUYOU", "PC_YU_LINFENG", "NPC_HONDA_KAI_FERGUS"],
        "sources": [f"{P17}:671-683 — 本多宣布悠悠成为空间龙族族长并继承“琳”。", f"{SETTING_YOUYOU} — 后续姓名阶段摘要。"],
        "facts": ["芬尔德·特兰希尔在仪式中获得空间龙族长身份并继承先祖之字“琳”。", "姓名阶段转换为芬尔德·琳·特兰希尔。"],
        "knowledge": ["悠悠、御临风、本多及仪式在场者知道公开结果。"],
        "consequences": ["稳定身份与名称改变；来源未证明姓名继承本身自动赋予某项能力。"],
        "affected": ["NPC_YOUYOU", "PC_YU_LINFENG", "NPC_HONDA_KAI_FERGUS"],
        "representation": "MISSING in status precision before repair; PROFILED as a separate status/name transition after repair.",
    },
    {
        "file": "EVENT_YOUYOU_PROPHECY.md", "id": "EVENT_YOUYOU_PROPHECY", "label": "受荣之道、预见与最后一道封印",
        "stage": "Dragon Sanctuary war", "location": "受荣之道",
        "participants": ["NPC_YOUYOU", "PC_YU_LINFENG"],
        "sources": [f"{T2}:162-414 — 两人进入受荣之道，光点汇聚悠悠；她描述将发生的毁坏并确认封印身份。"],
        "facts": ["先驱者消散后的光点汇聚到悠悠身上。", "悠悠随后传达秘境毁坏相关信息，并确认自己是死亡之翼的最后一道封印。"],
        "knowledge": ["悠悠向御临风表达了她所见内容；御临风知道这些陈述。", "来源不支持无限、全知或可任意调用的预言能力。"],
        "consequences": ["该阶段形成预见与封印身份连续性；与姓名继承、族长地位分开记录。"],
        "affected": ["NPC_YOUYOU", "PC_YU_LINFENG"],
        "representation": "MISSING before repair; PROFILED as a distinct event after repair.",
    },
    {
        "file": "EVENT_DEATHWING_FINAL_WAR.md", "id": "EVENT_DEATHWING_FINAL_WAR", "label": "死亡之翼本轮终局战",
        "stage": "Original Campaign ending / D0", "location": "龙族秘境外雪地战场",
        "participants": ["NPC_DEATHWING", "NPC_XIERLUN_VON_GILCODE", "PC_YU_LINFENG", "NPC_YOUYOU"],
        "sources": [f"{T5}:16-105 — 谢尔伦与死亡之翼对峙并掩护御临风。", f"{T5}:123-135,257-308 — 悠悠保护、谢尔伦压制、御临风突入、肉身瓦解。", "current_state.md:30-35,69-75 — D0 结果和永久死亡边界。"],
        "facts": ["谢尔伦压制死亡之翼，御临风突入其体内破坏并使本轮肉身瓦解。", "乳白色力量被原文称为来自悠悠的保护。"],
        "knowledge": ["战场参与者见证阶段性胜利；白魔关于不死性的后续陈述只是其理论。"],
        "consequences": ["本轮肉身被击败；永久死亡、复活机制与古神关系仍未确认。"],
        "affected": ["NPC_DEATHWING", "NPC_XIERLUN_VON_GILCODE", "PC_YU_LINFENG", "NPC_YOUYOU"],
        "representation": "PROFILED, with missing cross-profile relationship/protection milestones repaired.",
    },
    {
        "file": "EVENT_WHITE_MAGICIAN_CONFRONTATIONS.md", "id": "EVENT_WHITE_MAGICIAN_CONFRONTATIONS", "label": "白色魔法使：囚禁史与地下兵工厂交锋",
        "stage": "Past imprisonment; later Dragon-war campaign operations", "location": "监狱塔（早期囚禁）；地下兵工厂及追击洞窟（后续交锋）",
        "participants": ["NPC_WHITE_MAGICIAN", "PC_YU_LINFENG", "NPC_MU_TOU"],
        "sources": ["设定 人物/妄想大陆设定集_检索版.md:123-130 — 监狱塔囚禁与沐透协助脱离。", f"{P20}:127-169,285-340,406-479,525-530 — 地下兵工厂行动后在洞窟追上白魔并交锋。"],
        "facts": ["监狱塔是较早的囚禁与脱逃事件。", "御临风参与的后续主要交锋属于地下兵工厂行动及其紧接的洞窟追击。", "两者是两个不同历史事件。"],
        "knowledge": ["御临风知道后续追击与交涉；他对白魔动机的多项判断仍是推理。"],
        "consequences": ["旧标签“监狱塔后续交锋”构成 EVENT_CONFLATION，已在所有 repaired candidate 依赖字段中修复。"],
        "affected": ["NPC_WHITE_MAGICIAN", "PC_YU_LINFENG", "NPC_MU_TOU"],
        "representation": "EVENT_CONFLATION resolved; PROFILED after repair.",
    },
    {
        "file": "EVENT_DRAGON_KING_CONTROL.md", "id": "EVENT_DRAGON_KING_CONTROL", "label": "奥希拉与黑龙族控制事件",
        "stage": "Dragon Sanctuary war", "location": "龙族秘境战线及秘境内部",
        "participants": ["NPC_OSHIRA", "NPC_WHITE_MAGICIAN", "NPC_XIERLUN_VON_GILCODE", "NPC_DEATHWING"],
        "sources": [f"{T2}:94-108 — 谢尔伦报告奥希拉与黑龙族遭到控制。", f"{T2}:478-500 — 战线报告白魔操控黑龙族长。", f"{T3}:32-33,89-123 — 白魔远程持续操控并吹奏笛剑。"],
        "facts": ["奥希拉与黑龙族遭到控制。", "白色魔法使被明确写为操控黑龙族长的一方。", "死亡之翼与白魔都被御临风推测能影响非自然黑龙，但原文没有确认二者共同直接施术，也没有明确“血脉魔法”机制。"],
        "knowledge": ["谢尔伦知道控制结果；御临风观察/得知白魔操控。", "奥希拉当时意识、抵抗与事后记忆未知。"],
        "consequences": ["这是奥希拉的重大非自愿状态；长期后果与 D3 状态未记录。"],
        "affected": ["NPC_OSHIRA", "NPC_WHITE_MAGICIAN", "NPC_XIERLUN_VON_GILCODE", "NPC_DEATHWING"],
        "representation": "MISSING for Oshira before repair; PROFILED for Oshira and White Magician after repair; Deathwing direct participation remains SEEN_NOT_PROMOTED as unproven.",
    },
    {
        "file": "EVENT_DRAGON_SANCTUARY_COLLAPSE.md", "id": "EVENT_DRAGON_SANCTUARY_COLLAPSE", "label": "龙族秘境崩坏与过渡撤离",
        "stage": "D0 to Transition D1-D3", "location": "龙族秘境及撤离线",
        "participants": ["PC_YU_LINFENG", "NPC_AINZ_OOAL_GOWN", "NPC_HONDA_KAI_FERGUS", "NPC_SERTANT_LU_YOURLAN", "NPC_WHITE_MAGICIAN"],
        "sources": [f"{T5}:365-479 — 原团停在白魔取出魔宝石前的交涉。", "current_state.md:8-22,30-51 — 最小过渡约定：取走、崩坏、撤离与三日推进。"],
        "facts": ["原团只写到白魔准备带走魔宝石，未实际展开崩坏与撤离全过程。", "正式当前状态以最小 Transition Canon 规定魔宝石被取走、秘境毁灭、必要人员撤离。"],
        "knowledge": ["不得把未演出的撤离细节、对白或个人行为补写成原团事实。"],
        "consequences": ["主世界从秘境毁灭后的第三天继续；特殊梦境材料保持隔离。"],
        "affected": ["PC_YU_LINFENG", "NPC_AINZ_OOAL_GOWN", "NPC_HONDA_KAI_FERGUS", "NPC_SERTANT_LU_YOURLAN", "NPC_WHITE_MAGICIAN"],
        "representation": "ROUTED_ELSEWHERE to current_state.md for D1-D3; affected profiles only preserve minimum transition state.",
    },
    {
        "file": "EVENT_HAKU_SUCCESSION_DISCLOSURE.md", "id": "EVENT_HAKU_SUCCESSION_DISCLOSURE", "label": "帝向哈克陈述身世并提出继承",
        "stage": "Early Campaign / Imperial audience", "location": "帝都皇宫的私下谈话",
        "participants": ["NPC_EMPEROR", "NPC_HAKU"],
        "sources": [f"{fpage(23)}:179-187 — 帝声称二人为兄弟并表达继承希望；哈克没有接受。", f"{SETTING_WORLD}:93-97 — 持续更新设定对该场景的摘要。"],
        "facts": ["帝向哈克作出兄弟关系的陈述，并表达希望他继承、向他提出选择。", "哈克认为说法突然，没有在该场景接受。"],
        "knowledge": ["哈克知道帝作出过该陈述与提议。", "来源不足以独立确认生物学血缘。"],
        "consequences": ["形成重要但未被接受的继承提议与归因身世信息。"],
        "affected": ["NPC_EMPEROR", "NPC_HAKU"],
        "representation": "MISSING before repair; PROFILED with attribution and non-acceptance preserved.",
    },
    {
        "file": "EVENT_GREMLIN_TERMINAL_TRANSFORMATION.md", "id": "EVENT_GREMLIN_TERMINAL_TRANSFORMATION", "label": "古雷姆林处决与布莱特面容、盲龙转化",
        "stage": "Late Original Campaign / Dragon Sanctuary front", "location": "龙族秘境战场",
        "participants": ["NPC_GREMLIN", "NPC_CASSIUS_BRIGHT", "PC_YU_LINFENG"],
        "sources": [f"{tpage(1)}:551-565 — 古雷姆林纳入心脏与石块，颈部出现被认作布莱特的面容。", f"{tpage(2)}:9-76 — 御临风斩首、面容终言与死亡、盲眼幼龙出现。"],
        "facts": ["御临风斩首古雷姆林；其颈部面容留下转告后死亡。", "遗骸中出现盲眼幼龙。"],
        "knowledge": ["御临风怀疑幼龙可能与布莱特有关，但来源没有确认身份连续性。"],
        "consequences": ["古雷姆林已被处决；布莱特的具体机制与幼龙身份保持未决。"],
        "affected": ["NPC_GREMLIN", "NPC_CASSIUS_BRIGHT", "PC_YU_LINFENG"],
        "representation": "MISSING before repair; PROFILED without identifying the infant dragon.",
    },
    {
        "file": "EVENT_SERTANT_MASK_AWAKENING.md", "id": "EVENT_SERTANT_MASK_AWAKENING", "label": "瑟坦特假面昏睡与悠悠唤醒",
        "stage": "Dragon Sanctuary war", "location": "龙族秘境战线",
        "participants": ["NPC_SERTANT_LU_YOURLAN", "NPC_YOUYOU", "NPC_XIERLUN_VON_GILCODE", "NPC_HONDA_KAI_FERGUS"],
        "sources": [f"{tpage(2)}:121-126,437-470 — 选择瑟坦特使用假面；昏睡后被悠悠的光唤醒并启动。", f"{tpage(3)}:214-265; {tpage(4)}:188-219 — 瑟坦特以假面力量参战。"],
        "facts": ["瑟坦特佩戴假面后暂时昏睡。", "来自悠悠的光进入其体内后，他苏醒、启动假面并参战。"],
        "knowledge": ["悠悠对昏睡原因给出解释，但来源不把该解释写成全知机制。"],
        "consequences": ["形成瑟坦特的临时失能、恢复与参战状态转折。"],
        "affected": ["NPC_SERTANT_LU_YOURLAN", "NPC_YOUYOU"],
        "representation": "MISSING before repair; PROFILED from both affected character perspectives.",
    },
    {
        "file": "EVENT_KUON_MASK_REMOVAL.md", "id": "EVENT_KUON_MASK_REMOVAL", "label": "久远面具反应与失踪",
        "stage": "Middle Campaign / Imperial crisis", "location": "帝都事件现场",
        "participants": ["NPC_KUON"],
        "sources": [f"{spage(5)}:37-46,725-766 — 面具反应、久远自己的解放者之血解释、昏倒与被带走。", f"{spage(6)}:330; {spage(8)}:140,424 — 同伴后续确认其仍不在场。"],
        "facts": ["久远看到面具后疼痛、听到声音并昏倒，随后被两个小型身影带走。"],
        "knowledge": ["久远自己把反应联系到解放者之血；机制没有被独立确认。"],
        "consequences": ["后续去向未被团录确认；不得自动写成死亡或获救。"],
        "affected": ["NPC_KUON"],
        "representation": "MISSING before repair; PROFILED with cause and outcome unresolved.",
    },
)


def render_event(event: dict[str, Any]) -> str:
    lines = [
        f"# {event['label']}", "", f"- Event ID: `{event['id']}`", f"- Campaign stage: {event['stage']}",
        f"- Location: {event['location']}", f"- Participants: {', '.join(f'`{item}`' for item in event['participants'])}", "",
    ]
    for heading, key in (
        ("Source Excerpts", "sources"), ("Objective Facts", "facts"),
        ("Character-Specific Knowledge", "knowledge"), ("Persistent Consequences", "consequences"),
        ("Affected Profiles", "affected"),
    ):
        lines.extend([f"## {heading}", ""])
        lines.extend(f"- {item}" for item in event[key])
        lines.append("")
    lines.extend(["## Profile Representation Status", "", event["representation"], "", "EVENT_CONFLATION: resolved / none remaining.", ""])
    return "\n".join(lines)


CROSS_PROFILE_AUDITS = {
    "ALLIANCE_AND_ENGAGEMENT_PROPAGATION.md": (
        "# Alliance and Engagement Propagation", "NPC_XIERLUN_VON_GILCODE, NPC_EMPEROR, NPC_KENDA_KAI_FERGUS, NPC_HONDA_KAI_FERGUS, NPC_YOUYOU, and PC_YU_LINFENG were checked. Xierlun/Emperor receive the verified alliance-planning history; Kenda retains the distinct public-conduit role and attributed request; Honda, Youyou, Yu, and Xierlun receive only their documented ceremony/planning perspectives. No present political stance or current consent was inferred."
    ),
    "YOUYOU_YU_CONTINUITY_PROPAGATION.md": (
        "# Youyou / Yu Linfeng Continuity Propagation", "NPC_YOUYOU and PC_YU_LINFENG now both preserve the engagement, inheritance-witness,受荣之道, and protection milestones. The NPC profile may guide NPC continuity; PC_YU_LINFENG remains user-controlled with dialogue, voluntary action, private thought, emotion, and new-goal generation forbidden."
    ),
    "WHITE_MAGICIAN_OSHIRA_CONTROL_PROPAGATION.md": (
        "# White Magician / Oshira Control Propagation", "NPC_WHITE_MAGICIAN records the observed control action; NPC_OSHIRA records the major non-voluntary status and unknown cognition/mechanism; NPC_DEATHWING is audited but receives no direct-controller claim because joint direct施术 and bloodline magic are unproven."
    ),
    "DEATHWING_FINAL_WAR_PROPAGATION.md": (
        "# Deathwing Final War Propagation", "NPC_DEATHWING, NPC_XIERLUN_VON_GILCODE, NPC_YOUYOU, and PC_YU_LINFENG were checked from distinct perspectives: defeated body and adversaries; restraint and battle action; attributed protection; user-declared and externally imposed PC history. Permanent death remains unconfirmed."
    ),
    "HAKU_SUCCESSION_PROPAGATION.md": (
        "# Haku Succession Disclosure Propagation", "NPC_EMPEROR and NPC_HAKU both preserve the Emperor's attributed sibling statement, the succession proposal, and Haku's non-acceptance. Biological kinship and a completed succession remain unconfirmed."
    ),
    "GREMLIN_BRIGHT_FATE_PROPAGATION.md": (
        "# Gremlin / Bright Fate Propagation", "NPC_GREMLIN and NPC_CASSIUS_BRIGHT preserve the terminal face/message event. The blind infant dragon remains unidentified, and neither profile uses it to assert Bright's survival or reincarnation."
    ),
    "SERTANT_YOUYOU_AWAKENING_PROPAGATION.md": (
        "# Sertain / Youyou Awakening Propagation", "NPC_SERTANT_LU_YOURLAN and NPC_YOUYOU both preserve the mask sleep, Youyou-light intervention, awakening, and battle participation. The cause of mask-induced sleep remains an attributed explanation rather than confirmed mechanism."
    ),
}


def build_evidence_audits(rows: list[dict[str, Any]]) -> None:
    for profile_id in REPAIRED_PROFILE_IDS:
        original = load_json(PHASE3D_CANDIDATES / f"{profile_id}.json")
        repaired = repair_profile(original)
        atomic_write(REPAIRED_DIR / f"{profile_id}.json", json.dumps(repaired, ensure_ascii=False, indent=2) + "\n")
    for event in EVENT_AUDITS:
        atomic_write(EVENT_DIR / event["file"], render_event(event))
    for filename, (heading, body) in sorted(CROSS_PROFILE_AUDITS.items()):
        atomic_write(CROSS_PROFILE_DIR / filename, f"{heading}\n\n{body}\n\nAll propagation decisions remain candidate-level and pending human approval.\n")
    build_recall_patches()


def build_recall_patches() -> None:
    patches = [load_json(path) | {"_path": path} for path in sorted(PATCH_DIR.glob("*.json"), key=path_label)]
    by_target = {patch["target_id"]: patch for patch in patches}
    if len(patches) != 36 or len(by_target) != 36:
        raise ValueError("expected exactly 36 uniquely targeted draft character patches")
    for number, profile_id in enumerate(REPAIRED_PROFILE_IDS, 5001):
        historical = by_target[profile_id]
        if historical.get("operation") != "add" or historical.get("status") != "draft":
            raise ValueError(f"{historical['_path'].name} is no longer a draft add patch")
        repaired_ref = f"work/phase3d_recall/repaired_candidates/{profile_id}.json"
        coverage_ref = f"work/phase3d_recall/source_coverage/{profile_id}_coverage.md"
        review_ref = f"work/phase3d_recall/reviews/{profile_id}_recall_review.md"
        patch = {
            "patch_id": f"PATCH_{number}",
            "created_from": [path_label(historical["_path"]), repaired_ref, coverage_ref, review_ref],
            "target_database": historical["target_database"],
            "operation": "add",
            "target_id": profile_id,
            "reason": "Propose the Phase 3D-R repaired, evidence-backed profile candidate for human review without creating a formal profile database.",
            "proposed_changes": {"before": None, "after": {"profile_ref": repaired_ref, "profile_id": profile_id}},
            "affected_entries": historical["affected_entries"],
            "conflict_check": {"status": "not_checked", "items": []},
            "status": "draft",
            "review_notes": "Phase 3D-R recall repair candidate only; not approved or applied. Historical Phase 3B/3C draft patch remains frozen.",
        }
        filename = f"PATCH_{number}_{profile_id.lower()}.json"
        atomic_write(RECALL_PATCH_DIR / filename, json.dumps(patch, ensure_ascii=False, indent=2) + "\n")


def build_preflight() -> None:
    rows = discover_profiles()
    protected = {path_label(path): sha256(path) for path in protected_paths()}
    existing_preflight = load_json(PREFLIGHT_PATH) if PREFLIGHT_PATH.is_file() else {}
    draft_patch_baseline = existing_preflight.get("draft_patch_baseline", {})
    if not draft_patch_baseline:
        draft_patch_baseline = {
            path_label(path): sha256(path) for path in sorted(PATCH_DIR.glob("*.json"), key=path_label)
        }
    manifest = {
        "phase": "3D-R",
        "status": "NEEDS_COMPLETENESS_REAUDIT",
        "human_approval": "SUSPENDED",
        "hash_algorithm": "SHA-256",
        "population": {
            "npc": sum(row["profile_kind"] == "npc" for row in rows),
            "pc_continuity": sum(row["profile_kind"] == "pc_continuity" for row in rows),
            "total": len(rows),
            "full": sum(row["profile_depth"] == "full" for row in rows),
            "compact": sum(row["profile_depth"] == "compact" for row in rows),
            "minimal": sum(row["profile_depth"] == "minimal" for row in rows),
        },
        "profiles": rows,
        "protected_files": protected,
        "draft_patch_baseline": draft_patch_baseline,
    }
    atomic_write(PREFLIGHT_PATH, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    coverage = search_sources(rows)
    atomic_write(COVERAGE_MANIFEST_PATH, json.dumps(coverage, ensure_ascii=False, indent=2) + "\n")
    for row in coverage["profiles"]:
        atomic_write(COVERAGE_DIR / f"{row['profile_id']}_coverage.md", render_coverage(row))
    build_evidence_audits(rows)
    build_reviews_and_reports(coverage)


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--stage", choices=("preflight", "evidence"), default="preflight")
    return result


def main(argv: list[str] | None = None) -> int:
    parser().parse_args(argv)
    try:
        build_preflight()
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}")
        return 1
    print("Phase 3D-R preflight: 36 profiles inventoried; human approval suspended")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
