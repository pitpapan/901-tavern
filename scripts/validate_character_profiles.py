#!/usr/bin/env python3
"""Validate Phase 3A NPC and PC continuity profiles without mutating Canon."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

from validate_authoring_framework import schema_errors, validate_schema_contract


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SCHEMA_DIR = ROOT / "schema"
PROFILE_SCHEMAS = {
    "npc": "npc_profile.schema.json",
    "pc_continuity": "pc_continuity_profile.schema.json",
}
BANNED_FIELDS = {
    "future_importance",
    "expected_scene_frequency",
    "future_plot_role",
    "priority_score",
    "rank",
    "tier",
    "trust_score",
    "friendship_score",
    "future_event_guaranteed",
    "AI_should_make_PC_aggressive",
}


@dataclass(frozen=True)
class ProfileDocument:
    source: str
    payload: dict[str, Any]


def expand_paths(paths: Iterable[Path]) -> list[Path]:
    expanded: list[Path] = []
    for path in paths:
        if path.is_dir():
            expanded.extend(
                child
                for child in sorted(path.rglob("*"))
                if child.is_file() and child.suffix.lower() in {".json", ".jsonl"}
            )
        else:
            expanded.append(path)
    return expanded


def load_json_records(paths: Iterable[Path]) -> tuple[list[tuple[str, Any]], list[str]]:
    records: list[tuple[str, Any]] = []
    errors: list[str] = []
    for path in expand_paths(paths):
        try:
            text = path.read_text(encoding="utf-8-sig")
        except OSError as exc:
            errors.append(f"{path}: cannot read file: {exc}")
            continue
        raw_records = (
            [(f"{path}:{line}", raw) for line, raw in enumerate(text.splitlines(), 1) if raw.strip()]
            if path.suffix.lower() == ".jsonl"
            else [(str(path), text)]
        )
        for source, raw in raw_records:
            try:
                records.append((source, json.loads(raw)))
            except json.JSONDecodeError as exc:
                errors.append(f"{source}: invalid JSON: {exc.msg}")
    return records, errors


class SchemaResolver:
    def __init__(self) -> None:
        self.raw: dict[Path, dict[str, Any]] = {}

    def load(self, path: Path) -> dict[str, Any]:
        path = path.resolve()
        if path not in self.raw:
            try:
                payload = json.loads(path.read_text(encoding="utf-8-sig"))
            except (OSError, json.JSONDecodeError) as exc:
                raise ValueError(f"cannot load {path}: {exc}") from exc
            if not isinstance(payload, dict):
                raise ValueError(f"{path}: schema root must be an object")
            self.raw[path] = payload
        return self.raw[path]

    @staticmethod
    def pointer(document: Any, fragment: str, source: Path) -> Any:
        if not fragment:
            return document
        if not fragment.startswith("/"):
            raise ValueError(f"{source}: unsupported JSON pointer #{fragment}")
        current = document
        for raw in fragment[1:].split("/"):
            token = raw.replace("~1", "/").replace("~0", "~")
            if not isinstance(current, dict) or token not in current:
                raise ValueError(f"{source}: unresolved JSON pointer #{fragment}")
            current = current[token]
        return current

    def resolve(self, node: Any, current_file: Path, stack: tuple[str, ...] = ()) -> Any:
        if isinstance(node, list):
            return [self.resolve(item, current_file, stack) for item in node]
        if not isinstance(node, dict):
            return node
        if "$ref" in node:
            ref = node["$ref"]
            if not isinstance(ref, str):
                raise ValueError(f"{current_file}: $ref must be a string")
            file_part, separator, fragment = ref.partition("#")
            target_file = (current_file.parent / file_part).resolve() if file_part else current_file.resolve()
            key = f"{target_file}#{fragment if separator else ''}"
            if key in stack:
                raise ValueError(f"cyclic $ref: {' -> '.join(stack + (key,))}")
            target = self.pointer(self.load(target_file), fragment if separator else "", target_file)
            resolved = self.resolve(target, target_file, stack + (key,))
            siblings = {field: value for field, value in node.items() if field != "$ref"}
            if siblings:
                return {"allOf": [resolved, self.resolve(siblings, current_file, stack)]}
            return resolved
        return {field: self.resolve(value, current_file, stack) for field, value in node.items()}


def load_profile_schemas(schema_dir: Path) -> dict[str, dict[str, Any]]:
    resolver = SchemaResolver()
    schemas: dict[str, dict[str, Any]] = {}
    common_path = schema_dir / "character_profile_common.schema.json"
    common = resolver.load(common_path)
    validate_schema_contract("character_profile_common", common)
    if not isinstance(common.get("$defs"), dict):
        raise ValueError("character_profile_common: missing $defs")
    for kind, filename in PROFILE_SCHEMAS.items():
        path = schema_dir / filename
        raw = resolver.load(path)
        validate_schema_contract(kind, raw)
        schemas[kind] = resolver.resolve(raw, path.resolve())
    return schemas


def identify_profile_kind(payload: Any) -> str | None:
    if not isinstance(payload, dict):
        return None
    kind = payload.get("profile_kind")
    if isinstance(kind, str) and kind in PROFILE_SCHEMAS:
        return kind
    identifier = payload.get("id")
    if isinstance(identifier, str):
        if identifier.startswith("NPC_"):
            return "npc"
        if identifier.startswith("PC_"):
            return "pc_continuity"
    return None


def load_profiles(paths: Iterable[Path]) -> tuple[list[ProfileDocument], list[str]]:
    records, errors = load_json_records(paths)
    profiles: list[ProfileDocument] = []
    for source, payload in records:
        if not isinstance(payload, dict):
            errors.append(f"{source}: profile must be a JSON object")
            continue
        if identify_profile_kind(payload) is None:
            errors.append(f"{source}: cannot identify profile kind")
            continue
        profiles.append(ProfileDocument(source, payload))
    return profiles, errors


def walk_objects(value: Any, path: str = "$") -> Iterable[tuple[str, dict[str, Any]]]:
    if isinstance(value, dict):
        yield path, value
        for field, child in value.items():
            yield from walk_objects(child, f"{path}.{field}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_objects(child, f"{path}[{index}]")


def normalized_fact_key(item: dict[str, Any]) -> str:
    fact_ref = item.get("fact_ref")
    if isinstance(fact_ref, str) and fact_ref:
        return fact_ref.casefold()
    statement = item.get("statement")
    return re.sub(r"\s+", "", statement).casefold() if isinstance(statement, str) else ""


def load_reference_index(paths: Iterable[Path]) -> tuple[dict[str, dict[str, Any]], list[str]]:
    records, errors = load_json_records(paths)
    index: dict[str, dict[str, Any]] = {}
    for source, payload in records:
        if not isinstance(payload, dict):
            errors.append(f"{source}: supporting source must be a JSON object")
            continue
        identifier = payload.get("event_id") or payload.get("patch_id") or payload.get("id")
        if isinstance(identifier, str):
            index[identifier] = payload
    return index, errors


def load_worldbook_ids(path: Path | None) -> tuple[dict[str, str], list[str]]:
    if path is None:
        return {}, []
    records, errors = load_json_records([path])
    index: dict[str, str] = {}
    for source, payload in records:
        if not isinstance(payload, dict):
            errors.append(f"{source}: worldbook row must be an object")
            continue
        identifier = payload.get("id")
        entry_type = payload.get("type")
        if isinstance(identifier, str) and isinstance(entry_type, str):
            index[identifier] = entry_type
    return index, errors


def semantic_errors(
    profiles: list[ProfileDocument],
    worldbook_ids: dict[str, str],
    worldbook_was_supplied: bool,
    source_index: dict[str, dict[str, Any]],
    sources_were_supplied: bool,
) -> list[str]:
    errors: list[str] = []
    seen_ids: dict[str, str] = {}
    seen_worldbook: dict[str, str] = {}

    for document in profiles:
        payload = document.payload
        profile_id = payload.get("id")
        if isinstance(profile_id, str):
            if profile_id in seen_ids:
                errors.append(f"{document.source}: duplicate profile id {profile_id}; first seen in {seen_ids[profile_id]}")
            else:
                seen_ids[profile_id] = document.source
        worldbook_id = payload.get("worldbook_id")
        if isinstance(worldbook_id, str):
            if worldbook_id in seen_worldbook:
                errors.append(f"{document.source}: duplicate worldbook mapping {worldbook_id}; first seen in {seen_worldbook[worldbook_id]}")
            else:
                seen_worldbook[worldbook_id] = document.source
            if worldbook_was_supplied:
                if worldbook_id not in worldbook_ids:
                    errors.append(f"{document.source}: unknown worldbook_id {worldbook_id}")
                elif worldbook_ids[worldbook_id] != "character":
                    errors.append(f"{document.source}: worldbook_id {worldbook_id} is not a character entry")

        for object_path, obj in walk_objects(payload):
            for field in obj:
                if field in BANNED_FIELDS:
                    errors.append(f"{document.source}: {object_path}.{field}: forbidden field")

            if "claim_id" in obj:
                evidence_mode = obj.get("evidence_mode")
                origin = obj.get("origin")
                stability = obj.get("stability")
                sources = obj.get("sources")
                if evidence_mode == "single_observed_behavior" and stability == "stable":
                    errors.append(
                        f"{document.source}: {object_path}: single_observed_behavior cannot establish a stable trait"
                    )
                if evidence_mode == "authorial_definition" and origin != "authorial_supplement":
                    errors.append(
                        f"{document.source}: {object_path}: authorial_definition requires authorial_supplement origin"
                    )
                if evidence_mode == "continuation_confirmed":
                    if origin != "continuation":
                        errors.append(
                            f"{document.source}: {object_path}: continuation_confirmed requires continuation origin"
                        )
                    continuation_refs = [
                        ref for ref in sources if isinstance(ref, str) and ref.startswith("CONT_")
                    ] if isinstance(sources, list) else []
                    if not continuation_refs:
                        errors.append(
                            f"{document.source}: {object_path}: continuation_confirmed requires a CONT_ source"
                        )
                    elif sources_were_supplied:
                        for ref in continuation_refs:
                            source = source_index.get(ref)
                            if source is None:
                                errors.append(f"{document.source}: {object_path}: unknown continuation source {ref}")
                            elif source.get("canon_status") != "confirmed":
                                errors.append(f"{document.source}: {object_path}: continuation source {ref} is not confirmed")

        presence = payload.get("presence")
        if isinstance(presence, dict):
            life = presence.get("life_status")
            availability = presence.get("narrative_availability")
            realm_scope = presence.get("realm_scope")
            if life == "deceased" and availability == "normal":
                errors.append(f"{document.source}: deceased character cannot have normal narrative availability")
            canon_layers = payload.get("canon_layers")
            special_only = canon_layers == ["special_interlude"] or realm_scope == ["special_interlude"]
            if special_only and availability == "normal":
                errors.append(
                    f"{document.source}: special_interlude-only character cannot have normal narrative availability"
                )

        epistemic_state = payload.get("epistemic_state")
        if isinstance(epistemic_state, list):
            partition_required = False
            fact_modes: dict[str, set[str]] = {}
            for item in epistemic_state:
                if not isinstance(item, dict):
                    continue
                epistemic_type = item.get("epistemic_type")
                visibility = item.get("visibility")
                if (
                    isinstance(epistemic_type, str)
                    and epistemic_type in {"believes", "suspects", "does_not_know", "secrets"}
                ) or (
                    isinstance(visibility, str)
                    and visibility in {"restricted", "secret"}
                ):
                    partition_required = True
                if isinstance(epistemic_type, str) and epistemic_type in {"believes", "suspects"} and item.get("assertion_scope") == "confirmed_world_fact":
                    errors.append(
                        f"{document.source}: belief or suspicion cannot be marked confirmed_world_fact"
                    )
                key = normalized_fact_key(item)
                if key and isinstance(epistemic_type, str):
                    fact_modes.setdefault(key, set()).add(epistemic_type)
            if partition_required and payload.get("knowledge_partition") is not True:
                errors.append(f"{document.source}: knowledge_partition must be true for uncertain, unknown, or restricted knowledge")
            for key, modes in fact_modes.items():
                if modes & {"knows", "secrets"} and "does_not_know" in modes:
                    errors.append(
                        f"{document.source}: fact {key} conflicts: known and does_not_know; "
                        "known/secret and does_not_know are mutually exclusive"
                    )

        if payload.get("profile_kind") == "pc_continuity":
            goals = payload.get("goals")
            if isinstance(goals, dict):
                declared_goals = goals.get("declared_goals")
                for item in declared_goals if isinstance(declared_goals, list) else []:
                    if isinstance(item, dict) and item.get("basis") != "player_declared":
                        errors.append(f"{document.source}: PC declared goal basis must be player_declared")
                continuation_goals = goals.get("confirmed_continuation_goals")
                for index, item in enumerate(continuation_goals if isinstance(continuation_goals, list) else []):
                    if not isinstance(item, dict):
                        continue
                    goal_path = f"$.goals.confirmed_continuation_goals[{index}]"
                    if item.get("basis") != "continuation_confirmed":
                        errors.append(
                            f"{document.source}: PC continuation goal basis must be continuation_confirmed"
                        )
                    if item.get("origin") != "continuation":
                        errors.append(
                            f"{document.source}: {goal_path}: continuation goal requires continuation origin"
                        )
                    goal_sources = item.get("sources")
                    continuation_refs = [
                        ref
                        for ref in goal_sources
                        if isinstance(ref, str) and ref.startswith("CONT_")
                    ] if isinstance(goal_sources, list) else []
                    if not continuation_refs:
                        errors.append(
                            f"{document.source}: {goal_path}: continuation goal requires a CONT_ source"
                        )
                    elif sources_were_supplied:
                        for ref in continuation_refs:
                            source = source_index.get(ref)
                            if source is None:
                                errors.append(
                                    f"{document.source}: {goal_path}: unknown continuation source {ref}"
                                )
                            elif source.get("canon_status") != "confirmed":
                                errors.append(
                                    f"{document.source}: {goal_path}: continuation source {ref} is not confirmed"
                                )

        provenance = payload.get("provenance")
        if isinstance(provenance, dict) and sources_were_supplied:
            for field in ("introduced_by_patch", "last_modified_by_patch"):
                patch_id = provenance.get(field)
                if not isinstance(patch_id, str):
                    continue
                patch = source_index.get(patch_id)
                if patch is None:
                    errors.append(f"{document.source}: unknown {field} {patch_id}")
                    continue
                if patch.get("patch_id") != patch_id:
                    errors.append(f"{document.source}: {field} {patch_id} is not a Canon patch record")
                    continue
                if patch.get("status") not in {"approved", "applied"}:
                    errors.append(f"{document.source}: {field} {patch_id} is not approved or applied")
                approval = patch.get("approval")
                if not isinstance(approval, dict) or approval.get("decision") != "approved":
                    errors.append(f"{document.source}: {field} {patch_id} lacks explicit human approval")
                expected_database = "pc_continuity" if payload.get("profile_kind") == "pc_continuity" else "npc_profiles"
                if patch.get("target_database") != expected_database:
                    errors.append(
                        f"{document.source}: {field} {patch_id} targets {patch.get('target_database')!r}, not {expected_database}"
                    )
                affected = patch.get("affected_entries")
                permitted_targets = {payload.get("id"), payload.get("worldbook_id")}
                if patch.get("target_id") not in permitted_targets and not (
                    isinstance(affected, list) and permitted_targets.intersection(affected)
                ):
                    errors.append(f"{document.source}: {field} {patch_id} does not target this profile")

    return errors


def validate_profiles(
    profiles: list[ProfileDocument],
    schemas: dict[str, dict[str, Any]],
    worldbook_ids: dict[str, str],
    worldbook_was_supplied: bool,
    source_index: dict[str, dict[str, Any]],
    sources_were_supplied: bool,
) -> list[str]:
    errors: list[str] = []
    for document in profiles:
        kind = identify_profile_kind(document.payload)
        if kind is None:
            errors.append(f"{document.source}: cannot identify profile kind")
            continue
        for message in schema_errors(document.payload, schemas[kind]):
            errors.append(f"{document.source}: {message}")
    errors.extend(
        semantic_errors(
            profiles,
            worldbook_ids,
            worldbook_was_supplied,
            source_index,
            sources_were_supplied,
        )
    )
    return errors


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", type=Path, help="NPC/PC profile JSON or JSONL paths")
    parser.add_argument("--schema-dir", type=Path, default=DEFAULT_SCHEMA_DIR)
    parser.add_argument("--worldbook", type=Path, help="optional worldbook JSONL for reference checks")
    parser.add_argument(
        "--source",
        action="append",
        default=[],
        type=Path,
        help="optional continuation, supplement, or patch JSON/JSONL used as provenance",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        schemas = load_profile_schemas(args.schema_dir.resolve())
    except (ValueError, TypeError, KeyError, re.error) as exc:
        print(f"ERROR: cannot load character profile schemas: {exc}")
        return 2

    profiles, errors = load_profiles(path.resolve() for path in args.paths)
    worldbook_ids, worldbook_errors = load_worldbook_ids(args.worldbook.resolve() if args.worldbook else None)
    source_index, source_errors = load_reference_index(path.resolve() for path in args.source)
    errors.extend(worldbook_errors)
    errors.extend(source_errors)
    errors.extend(
        validate_profiles(
            profiles,
            schemas,
            worldbook_ids,
            args.worldbook is not None,
            source_index,
            bool(args.source),
        )
    )
    for error in errors:
        print(f"ERROR: {error}")
    print(f"Validated {len(profiles)} profile(s): {len(errors)} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
