#!/usr/bin/env python3
"""Validate a canonical worldbook JSONL file without modifying it."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any


DEFAULT_SCHEMA = Path(__file__).resolve().parents[1] / "schema" / "worldbook_entry.schema.json"
HAN_PATTERN = re.compile(r"[\u3400-\u4DBF\u4E00-\u9FFF]")
UNCERTAINTY_TERMS = ("据说", "可能", "怀疑", "猜测", "也许")


def load_contract(path: Path) -> dict[str, Any]:
    """Load the contract values that the validator enforces from JSON Schema."""
    schema = json.loads(path.read_text(encoding="utf-8-sig"))
    properties = schema["properties"]
    enum_fields = ("type", "canon_status", "canon_layer", "importance")
    return {
        "schema": schema,
        "required": set(schema["required"]),
        "allowed_fields": set(properties),
        "enums": {field: set(properties[field]["enum"]) for field in enum_fields},
        "id_pattern": re.compile(properties["id"]["pattern"]),
    }


def normalized_text(value: str) -> str:
    return re.sub(r"[\W_]+", "", value.casefold(), flags=re.UNICODE)


def normalized_content(value: str) -> str:
    return re.sub(r"\s+", "", value).casefold()


def add_error(errors: list[str], line: int, message: str) -> None:
    errors.append(f"line {line}: {message}")


def add_warning(warnings: list[str], line: int | None, message: str) -> None:
    prefix = f"line {line}: " if line is not None else ""
    warnings.append(prefix + message)


def validate_string_list(
    record: dict[str, Any], field: str, line: int, errors: list[str], *, require_nonempty: bool
) -> list[str]:
    value = record.get(field)
    if not isinstance(value, list):
        add_error(errors, line, f"{field} must be an array")
        return []
    if require_nonempty and not value:
        add_error(errors, line, f"{field} must not be empty")
    if any(not isinstance(item, str) or not item.strip() for item in value):
        add_error(errors, line, f"{field} must contain only non-empty strings")
        return []
    normalized = [normalized_text(item) for item in value]
    if len(normalized) != len(set(normalized)):
        add_error(errors, line, f"duplicate {field}")
    return value


def validate_record(
    record: Any,
    line: int,
    errors: list[str],
    warnings: list[str],
    contract: dict[str, Any],
) -> None:
    if not isinstance(record, dict):
        add_error(errors, line, "entry must be a JSON object")
        return

    missing = sorted(contract["required"] - set(record))
    unknown = sorted(set(record) - contract["allowed_fields"])
    if missing:
        add_error(errors, line, "missing required field(s): " + ", ".join(missing))
    if unknown:
        add_error(errors, line, "unknown field(s): " + ", ".join(unknown))

    entry_id = record.get("id")
    id_pattern = contract["id_pattern"]
    if not isinstance(entry_id, str) or not id_pattern.fullmatch(entry_id):
        add_error(errors, line, f"id must match {id_pattern.pattern}")
    for field, allowed in contract["enums"].items():
        value = record.get(field)
        if not isinstance(value, str) or value not in allowed:
            add_error(errors, line, f"{field} is not allowed")

    for field in ("name", "content"):
        if not isinstance(record.get(field), str) or not record[field].strip():
            add_error(errors, line, f"{field} must be a non-empty string")
    if not isinstance(record.get("notes"), str):
        add_error(errors, line, "notes must be a string")

    validate_string_list(record, "aliases", line, errors, require_nonempty=False)
    keys = validate_string_list(record, "keys", line, errors, require_nonempty=True)

    sources = record.get("sources")
    if not isinstance(sources, list) or not sources:
        add_error(errors, line, "sources must be a non-empty array")
    else:
        for index, source in enumerate(sources, start=1):
            if not isinstance(source, dict):
                add_error(errors, line, f"sources[{index}] must be an object")
                continue
            if set(source) != {"document", "reference"}:
                add_error(errors, line, f"sources[{index}] must contain only document and reference")
            for field in ("document", "reference"):
                if not isinstance(source.get(field), str) or not source[field].strip():
                    add_error(errors, line, f"sources[{index}].{field} must be a non-empty string")

    content = record.get("content")
    if isinstance(content, str):
        if len(HAN_PATTERN.findall(content)) > 1500:
            add_warning(warnings, line, "content is over 1500 Chinese characters")
        if record.get("canon_status") == "confirmed":
            found = [term for term in UNCERTAINTY_TERMS if term in content]
            if found:
                add_warning(warnings, line, "confirmed content contains uncertainty language: " + ", ".join(found))
    if len(keys) > 8:
        add_warning(warnings, line, "entry has more than 8 keys")


def validate_jsonl(path: Path, contract: dict[str, Any]) -> tuple[list[str], list[str], int]:
    errors: list[str] = []
    warnings: list[str] = []
    records: list[tuple[int, dict[str, Any]]] = []

    try:
        lines = path.read_text(encoding="utf-8-sig").splitlines()
    except OSError as exc:
        return [f"cannot read {path}: {exc}"], warnings, 0

    for line_number, raw in enumerate(lines, start=1):
        if not raw.strip():
            add_warning(warnings, line_number, "blank JSONL line ignored")
            continue
        try:
            record = json.loads(raw)
        except json.JSONDecodeError as exc:
            add_error(errors, line_number, f"invalid JSON: {exc.msg}")
            continue
        validate_record(record, line_number, errors, warnings, contract)
        if isinstance(record, dict):
            records.append((line_number, record))

    ids: dict[str, int] = {}
    names: dict[str, int] = {}
    contents: dict[str, int] = {}
    key_owners: dict[str, list[tuple[int, str, str]]] = defaultdict(list)

    for line, record in records:
        entry_id = record.get("id")
        if isinstance(entry_id, str):
            if entry_id in ids:
                add_error(errors, line, f"duplicate id {entry_id!r}; first seen on line {ids[entry_id]}")
            else:
                ids[entry_id] = line

        name = record.get("name")
        if isinstance(name, str) and name.strip():
            normalized = normalized_text(name)
            if normalized in names:
                add_error(errors, line, f"duplicate name {name!r}; first seen on line {names[normalized]}")
            else:
                names[normalized] = line

        content = record.get("content")
        if isinstance(content, str) and content.strip():
            normalized = normalized_content(content)
            if normalized in contents:
                add_error(errors, line, f"duplicate content; first seen on line {contents[normalized]}")
            else:
                contents[normalized] = line

        keys = record.get("keys")
        if isinstance(keys, list):
            for key in keys:
                if isinstance(key, str) and key.strip():
                    key_owners[normalized_text(key)].append((line, key, str(entry_id)))

    for owners in key_owners.values():
        distinct_ids = {owner[2] for owner in owners}
        if len(distinct_ids) >= 4:
            display_key = owners[0][1]
            add_warning(warnings, None, f"key {display_key!r} is used by {len(distinct_ids)} entries")

    return errors, warnings, len(records)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "path",
        nargs="?",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "output" / "worldbook_source.jsonl",
        help="JSONL file to validate (default: output/worldbook_source.jsonl)",
    )
    parser.add_argument(
        "--schema",
        type=Path,
        default=DEFAULT_SCHEMA,
        help="JSON Schema supplying the required fields and enums",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        contract = load_contract(args.schema.resolve())
    except (OSError, json.JSONDecodeError, KeyError, TypeError, re.error) as exc:
        print(f"ERROR: cannot load schema contract: {exc}", file=sys.stderr)
        return 2
    errors, warnings, count = validate_jsonl(args.path.resolve(), contract)
    for error in errors:
        print(f"ERROR: {error}")
    for warning in warnings:
        print(f"WARNING: {warning}")
    print(f"Validated {count} record(s): {len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
