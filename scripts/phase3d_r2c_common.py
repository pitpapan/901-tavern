"""Shared deterministic helpers for Phase 3D-R2C."""

from __future__ import annotations

import hashlib
import json
import os
import re
import tempfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
R2C_ROOT = ROOT / "work" / "phase3d_r2c"
SCHEMA_ROOT = R2C_ROOT / "schemas"
COMMON_SCHEMA_PATH = SCHEMA_ROOT / "character_profile_v2.schema.json"
NPC_SCHEMA_PATH = SCHEMA_ROOT / "npc_profile_v2.schema.json"
PC_SCHEMA_PATH = SCHEMA_ROOT / "pc_continuity_v2.schema.json"
PACKAGE_SCHEMA_PATH = SCHEMA_ROOT / "migration_package.schema.json"
FROZEN_MANIFEST_PATH = R2C_ROOT / "reviewed_inputs" / "frozen_input_manifest.json"


def load_json(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(payload, dict):
        raise ValueError(f"{path}: expected JSON object")
    return payload


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), 1):
        if not line.strip():
            continue
        payload = json.loads(line)
        if not isinstance(payload, dict):
            raise ValueError(f"{path}:{line_number}: expected JSON object")
        records.append(payload)
    return records


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def render_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n"


def render_jsonl(records: list[dict[str, Any]]) -> str:
    return "".join(canonical_json(record) + "\n" for record in records)


def atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            newline="\n",
            delete=False,
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
        ) as handle:
            handle.write(text)
            temporary_path = Path(handle.name)
        os.replace(temporary_path, path)
    finally:
        if temporary_path is not None and temporary_path.exists():
            temporary_path.unlink()


def _type_matches(value: Any, expected: str) -> bool:
    mapping = {
        "object": lambda item: isinstance(item, dict),
        "array": lambda item: isinstance(item, list),
        "string": lambda item: isinstance(item, str),
        "boolean": lambda item: isinstance(item, bool),
        "integer": lambda item: isinstance(item, int) and not isinstance(item, bool),
        "number": lambda item: isinstance(item, (int, float)) and not isinstance(item, bool),
        "null": lambda item: item is None,
    }
    predicate = mapping.get(expected)
    return bool(predicate and predicate(value))


def _resolve_ref(ref: str) -> dict[str, Any]:
    if "#/$defs/" not in ref:
        raise ValueError(f"unsupported R2C schema ref: {ref}")
    name = ref.split("#/$defs/", 1)[1]
    common = load_json(COMMON_SCHEMA_PATH)
    try:
        return common["$defs"][name]
    except KeyError as exc:
        raise ValueError(f"unknown R2C schema ref: {ref}") from exc


def _schema_errors(value: Any, schema: Any, path: str = "$") -> list[str]:
    if schema is True or schema == {}:
        return []
    if schema is False:
        return [f"{path}: value is forbidden"]
    if not isinstance(schema, dict):
        return [f"{path}: invalid schema node"]
    if "$ref" in schema:
        return _schema_errors(value, _resolve_ref(schema["$ref"]), path)

    errors: list[str] = []
    if "oneOf" in schema:
        branches = [_schema_errors(value, child, path) for child in schema["oneOf"]]
        if sum(not branch for branch in branches) != 1:
            errors.append(f"{path}: value must match exactly one allowed schema")
        return errors
    if "anyOf" in schema:
        branches = [_schema_errors(value, child, path) for child in schema["anyOf"]]
        if branches and not any(not branch for branch in branches):
            errors.append(f"{path}: value does not match any allowed schema")
        return errors

    if "const" in schema and not (type(value) is type(schema["const"]) and value == schema["const"]):
        errors.append(f"{path}: value must equal {schema['const']!r}")
    if "enum" in schema and not any(type(value) is type(item) and value == item for item in schema["enum"]):
        errors.append(f"{path}: value is not allowed")

    expected_type = schema.get("type")
    if isinstance(expected_type, str) and not _type_matches(value, expected_type):
        return errors + [f"{path}: must be {expected_type}"]
    if isinstance(expected_type, list) and not any(_type_matches(value, item) for item in expected_type):
        return errors + [f"{path}: must match one declared type"]

    if isinstance(value, dict):
        properties = schema.get("properties", {})
        for field in schema.get("required", []):
            if field not in value:
                errors.append(f"{path}: missing required field {field}")
        if schema.get("additionalProperties") is False:
            for field in value:
                if field not in properties:
                    errors.append(f"{path}.{field}: unknown field")
        for field, child in properties.items():
            if field in value:
                errors.extend(_schema_errors(value[field], child, f"{path}.{field}"))

    if isinstance(value, list):
        minimum = schema.get("minItems")
        if isinstance(minimum, int) and len(value) < minimum:
            errors.append(f"{path}: must contain at least {minimum} item(s)")
        if schema.get("uniqueItems"):
            normalized = [json.dumps(item, ensure_ascii=False, sort_keys=True) for item in value]
            if len(normalized) != len(set(normalized)):
                errors.append(f"{path}: items must be unique")
        if isinstance(schema.get("items"), dict):
            for index, item in enumerate(value):
                errors.extend(_schema_errors(item, schema["items"], f"{path}[{index}]"))

    if isinstance(value, str):
        if isinstance(schema.get("minLength"), int) and len(value) < schema["minLength"]:
            errors.append(f"{path}: must not be empty")
        if isinstance(schema.get("pattern"), str) and re.fullmatch(schema["pattern"], value) is None:
            errors.append(f"{path}: must match {schema['pattern']}")
    return errors


def schema_errors(instance: Any, schema_path: Path) -> list[str]:
    return _schema_errors(instance, load_json(schema_path))


def validate_profile(profile: dict[str, Any]) -> list[str]:
    schema_path = PC_SCHEMA_PATH if profile.get("profile_kind") == "pc_continuity" else NPC_SCHEMA_PATH
    return schema_errors(profile, schema_path)


def validate_package(package: dict[str, Any]) -> list[str]:
    return schema_errors(package, PACKAGE_SCHEMA_PATH)


def verify_frozen_manifest(path: Path = FROZEN_MANIFEST_PATH, root: Path = ROOT) -> dict[str, Any]:
    manifest = load_json(path)
    errors: list[str] = []
    for item in manifest.get("files", []):
        target = root / item["path"]
        if not target.is_file():
            errors.append(f"missing frozen input: {item['path']}")
        elif sha256_file(target) != item["sha256"]:
            errors.append(f"frozen input hash mismatch: {item['path']}")
    if errors:
        raise ValueError("\n".join(errors))
    return manifest
