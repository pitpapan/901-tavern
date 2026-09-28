#!/usr/bin/env python3
"""Validate Phase 2.7 authoring records without applying Canon mutations."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SCHEMA_DIR = ROOT / "schema"
SCHEMA_FILES = {
    "authorial_supplement": "authorial_supplement.schema.json",
    "canon_patch": "canon_patch.schema.json",
    "continuation_event": "continuation_event.schema.json",
    "director_item": "director_item.schema.json",
}


@dataclass(frozen=True)
class Document:
    source: str
    kind: str
    payload: dict[str, Any]

    @property
    def identifier(self) -> str | None:
        field = "patch_id" if self.kind == "canon_patch" else "event_id" if self.kind == "continuation_event" else "id"
        value = self.payload.get(field)
        return value if isinstance(value, str) else None


def json_equal(left: Any, right: Any) -> bool:
    return type(left) is type(right) and left == right


def type_matches(value: Any, expected: str) -> bool:
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


def schema_errors(value: Any, schema: Any, path: str = "$") -> list[str]:
    """Validate the JSON-Schema subset used by the four local contracts."""
    if schema is True or schema == {}:
        return []
    if schema is False:
        return [f"{path}: value is forbidden"]
    if not isinstance(schema, dict):
        return [f"{path}: invalid schema node"]

    errors: list[str] = []

    for child in schema.get("allOf", []):
        errors.extend(schema_errors(value, child, path))

    if "anyOf" in schema:
        alternatives = [schema_errors(value, child, path) for child in schema["anyOf"]]
        if alternatives and not any(not branch for branch in alternatives):
            errors.append(f"{path}: value does not match any allowed schema")

    condition = schema.get("if")
    if isinstance(condition, dict):
        matched = not schema_errors(value, condition, path)
        branch = schema.get("then") if matched else schema.get("else")
        if isinstance(branch, dict):
            errors.extend(schema_errors(value, branch, path))

    if "const" in schema and not json_equal(value, schema["const"]):
        errors.append(f"{path}: value must equal {schema['const']!r}")

    if "enum" in schema and not any(json_equal(value, allowed) for allowed in schema["enum"]):
        allowed = ", ".join(repr(item) for item in schema["enum"])
        errors.append(f"{path}: value is not allowed; expected one of {allowed}")

    expected_type = schema.get("type")
    if isinstance(expected_type, str) and not type_matches(value, expected_type):
        errors.append(f"{path}: must be {expected_type}")
        return errors

    if isinstance(value, dict):
        required = schema.get("required", [])
        for field in required:
            if field not in value:
                errors.append(f"{path}: missing required field {field}")

        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            for field in value:
                if field not in properties:
                    errors.append(f"{path}.{field}: unknown field")
        for field, child_schema in properties.items():
            if field in value:
                errors.extend(schema_errors(value[field], child_schema, f"{path}.{field}"))

    if isinstance(value, list):
        minimum = schema.get("minItems")
        if isinstance(minimum, int) and len(value) < minimum:
            errors.append(f"{path}: must contain at least {minimum} item(s)")
        if schema.get("uniqueItems"):
            normalized = [json.dumps(item, ensure_ascii=False, sort_keys=True) for item in value]
            if len(normalized) != len(set(normalized)):
                errors.append(f"{path}: items must be unique")
        item_schema = schema.get("items")
        if isinstance(item_schema, dict):
            for index, item in enumerate(value):
                errors.extend(schema_errors(item, item_schema, f"{path}[{index}]"))

    if isinstance(value, str):
        minimum = schema.get("minLength")
        if isinstance(minimum, int) and len(value) < minimum:
            errors.append(f"{path}: must not be empty")
        pattern = schema.get("pattern")
        if isinstance(pattern, str) and re.fullmatch(pattern, value) is None:
            errors.append(f"{path}: must match {pattern}")

    return errors


def validate_schema_contract(name: str, schema: Any) -> None:
    if not isinstance(schema, dict):
        raise ValueError(f"{name}: schema root must be an object")
    if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
        raise ValueError(f"{name}: unsupported or missing $schema")
    if schema.get("type") != "object":
        raise ValueError(f"{name}: root type must be object")
    if schema.get("additionalProperties") is not False:
        raise ValueError(f"{name}: root contract must be closed")
    if not isinstance(schema.get("required"), list) or not isinstance(schema.get("properties"), dict):
        raise ValueError(f"{name}: required and properties must be declared")
    missing = set(schema["required"]) - set(schema["properties"])
    if missing:
        raise ValueError(f"{name}: required fields missing properties: {', '.join(sorted(missing))}")


def load_schemas(schema_dir: Path) -> dict[str, dict[str, Any]]:
    schemas: dict[str, dict[str, Any]] = {}
    for kind, filename in SCHEMA_FILES.items():
        path = schema_dir / filename
        try:
            schema = json.loads(path.read_text(encoding="utf-8-sig"))
        except (OSError, json.JSONDecodeError) as exc:
            raise ValueError(f"cannot load {path}: {exc}") from exc
        validate_schema_contract(kind, schema)
        schemas[kind] = schema
    return schemas


def identify_kind(payload: Any) -> str | None:
    if not isinstance(payload, dict):
        return None
    if "patch_id" in payload:
        return "canon_patch"
    if "event_id" in payload:
        return "continuation_event"
    if "supplement_type" in payload:
        return "authorial_supplement"
    if "possible_directions" in payload and "type" in payload:
        return "director_item"
    return None


def expand_paths(paths: Iterable[Path]) -> list[Path]:
    expanded: list[Path] = []
    for path in paths:
        if path.is_dir():
            expanded.extend(
                child for child in sorted(path.rglob("*")) if child.is_file() and child.suffix.lower() in {".json", ".jsonl"}
            )
        else:
            expanded.append(path)
    return expanded


def load_documents(paths: Iterable[Path]) -> tuple[list[Document], list[str]]:
    documents: list[Document] = []
    errors: list[str] = []
    for path in expand_paths(paths):
        try:
            text = path.read_text(encoding="utf-8-sig")
        except OSError as exc:
            errors.append(f"{path}: cannot read file: {exc}")
            continue

        raw_documents: list[tuple[str, str]]
        if path.suffix.lower() == ".jsonl":
            raw_documents = [(f"{path}:{line}", raw) for line, raw in enumerate(text.splitlines(), start=1) if raw.strip()]
        else:
            raw_documents = [(str(path), text)]

        for source, raw in raw_documents:
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError as exc:
                errors.append(f"{source}: invalid JSON: {exc.msg}")
                continue
            kind = identify_kind(payload)
            if kind is None:
                errors.append(f"{source}: cannot identify authoring document type")
                continue
            documents.append(Document(source, kind, payload))
    return documents, errors


def find_supersedes_cycle(graph: dict[str, list[str]]) -> list[str] | None:
    state: dict[str, int] = {}
    stack: list[str] = []

    def visit(node: str) -> list[str] | None:
        state[node] = 1
        stack.append(node)
        for target in graph.get(node, []):
            if target not in graph:
                continue
            if state.get(target) == 1:
                start = stack.index(target)
                return stack[start:] + [target]
            if state.get(target, 0) == 0:
                cycle = visit(target)
                if cycle:
                    return cycle
        stack.pop()
        state[node] = 2
        return None

    for node in graph:
        if state.get(node, 0) == 0:
            cycle = visit(node)
            if cycle:
                return cycle
    return None


def normalized_reference(value: str) -> str:
    return value.replace("\\", "/").removeprefix("./").casefold()


def referenced_documents(source_ref: str, documents: list[Document]) -> list[Document]:
    """Resolve an ID, relative/absolute path, JSONL line, or path fragment."""
    id_matches = [document for document in documents if document.identifier == source_ref]
    if id_matches:
        return id_matches

    reference = normalized_reference(source_ref.split("#", 1)[0])
    matches: list[Document] = []
    for document in documents:
        source = normalized_reference(document.source)
        source_base = re.sub(r"(?<=\.jsonl):[0-9]+$", "", source)
        if source == reference or source.endswith("/" + reference):
            matches.append(document)
        elif source_base == reference or source_base.endswith("/" + reference):
            matches.append(document)
    return matches


def add_patch_source_error(
    errors: list[str], patch: Document, source: Document, patch_status: Any
) -> None:
    if source.kind == "director_item":
        errors.append(
            f"{patch.source}: director item cannot be a direct Canon patch source; "
            "record actual play as a confirmed continuation event first"
        )
    elif source.kind == "continuation_event" and source.payload.get("canon_status") != "confirmed":
        errors.append(
            f"{patch.source}: continuation source {source.identifier or source.source} is not confirmed"
        )
    elif source.kind == "authorial_supplement" and isinstance(patch_status, str) and patch_status in {"approved", "applied"}:
        source_status = source.payload.get("status")
        if not isinstance(source_status, str) or source_status not in {"approved", "superseded"}:
            errors.append(
                f"{patch.source}: supplement source {source.identifier or source.source} is not approved"
            )


def semantic_errors(documents: list[Document]) -> list[str]:
    errors: list[str] = []
    by_id: dict[str, Document] = {}
    for document in documents:
        identifier = document.identifier
        if identifier is None:
            continue
        if identifier in by_id:
            errors.append(
                f"{document.source}: duplicate id {identifier}; first seen in {by_id[identifier].source}"
            )
        else:
            by_id[identifier] = document

    supplements = {
        document.identifier: document
        for document in documents
        if document.kind == "authorial_supplement" and document.identifier
    }
    graph: dict[str, list[str]] = {}
    for identifier, document in supplements.items():
        supersedes = document.payload.get("supersedes")
        graph[identifier] = [item for item in supersedes if isinstance(item, str)] if isinstance(supersedes, list) else []
        for target in graph[identifier]:
            if target == identifier:
                errors.append(f"{document.source}: supplement cannot supersede itself")
            elif target not in supplements:
                errors.append(f"{document.source}: unknown supersedes reference {target}")
        superseded_by = document.payload.get("superseded_by")
        if isinstance(superseded_by, str):
            successor = supplements.get(superseded_by)
            if successor is None:
                errors.append(f"{document.source}: unknown superseded_by reference {superseded_by}")
            else:
                successor_supersedes = successor.payload.get("supersedes")
                if isinstance(successor_supersedes, list) and identifier not in successor_supersedes:
                    errors.append(
                        f"{document.source}: superseded_by {superseded_by} is not reciprocal"
                    )
                status = document.payload.get("status")
                successor_status = successor.payload.get("status")
                if status == "superseded" and (
                    not isinstance(successor_status, str)
                    or successor_status not in {"approved", "superseded"}
                ):
                    errors.append(
                        f"{document.source}: successor {superseded_by} must be approved before this record is superseded"
                    )

        visibility = document.payload.get("visibility")
        known = document.payload.get("known_by")
        unknown = document.payload.get("unknown_to")
        if isinstance(visibility, str) and visibility in {"restricted", "secret"} and isinstance(known, list) and isinstance(unknown, list) and not known and not unknown:
            errors.append(
                f"{document.source}: secret/restricted visibility requires knowledge metadata in known_by or unknown_to"
            )
        if isinstance(known, list) and isinstance(unknown, list):
            overlap = sorted(set(item for item in known if isinstance(item, str)) & set(item for item in unknown if isinstance(item, str)))
            if overlap:
                errors.append(
                    f"{document.source}: {', '.join(overlap)} cannot appear in both known_by and unknown_to"
                )

    cycle = find_supersedes_cycle(graph)
    if cycle:
        errors.append("supersedes cycle detected: " + " -> ".join(cycle))

    for document in documents:
        if document.kind != "canon_patch":
            continue
        payload = document.payload
        if payload.get("operation") == "delete":
            errors.append(f"{document.source}: destructive delete is not a permitted patch operation")
        patch_status = payload.get("status")
        if isinstance(patch_status, str) and patch_status in {"approved", "applied"} and not isinstance(payload.get("approval"), dict):
            errors.append(f"{document.source}: {patch_status} patch requires approval metadata")

        created_from = payload.get("created_from")
        if not isinstance(created_from, list):
            continue
        for source_ref in created_from:
            if not isinstance(source_ref, str):
                continue
            matches = referenced_documents(source_ref, documents)
            if matches:
                for source in matches:
                    add_patch_source_error(errors, document, source, patch_status)
                continue

            normalized = normalized_reference(source_ref)
            if source_ref.startswith("DIRECTOR_") or "sources/director/" in normalized:
                errors.append(
                    f"{document.source}: director item cannot be a direct Canon patch source; record actual play as a confirmed continuation event first"
                )
            elif source_ref.startswith("CONT_"):
                errors.append(f"{document.source}: unknown continuation source {source_ref}")
            elif "sources/continuation/" in normalized:
                errors.append(
                    f"{document.source}: continuation file reference {source_ref} must be validated together before it can source a patch"
                )
            elif source_ref.startswith("SUPPLEMENT_"):
                errors.append(f"{document.source}: unknown supplement source {source_ref}")

    return errors


def validate_documents(
    documents: list[Document], schemas: dict[str, dict[str, Any]]
) -> list[str]:
    errors: list[str] = []
    for document in documents:
        for message in schema_errors(document.payload, schemas[document.kind]):
            errors.append(f"{document.source}: {message}")
    errors.extend(semantic_errors(documents))
    return errors


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "paths",
        nargs="+",
        type=Path,
        help="JSON/JSONL authoring files or directories to validate together",
    )
    parser.add_argument(
        "--schema-dir",
        type=Path,
        default=DEFAULT_SCHEMA_DIR,
        help="directory containing the four Phase 2.7 JSON Schemas",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        schemas = load_schemas(args.schema_dir.resolve())
    except (ValueError, TypeError, KeyError, re.error) as exc:
        print(f"ERROR: cannot load schema contracts: {exc}")
        return 2

    documents, errors = load_documents(path.resolve() for path in args.paths)
    errors.extend(validate_documents(documents, schemas))
    for error in errors:
        print(f"ERROR: {error}")
    print(f"Validated {len(documents)} document(s): {len(errors)} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
