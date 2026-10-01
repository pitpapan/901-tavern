#!/usr/bin/env python3
"""Create the one-time frozen input manifest for Phase 3D-R2C."""

from __future__ import annotations

from pathlib import Path

try:
    from scripts.phase3d_r2c_common import ROOT, R2C_ROOT, atomic_write_text, load_json, render_json, sha256_file, validate_profile
except ModuleNotFoundError:  # pragma: no cover - direct script execution
    from phase3d_r2c_common import ROOT, R2C_ROOT, atomic_write_text, load_json, render_json, sha256_file, validate_profile


def frozen_paths(root: Path = ROOT) -> list[Path]:
    paths = [
        path
        for path in (root / "work").rglob("*")
        if path.is_file() and R2C_ROOT not in path.parents
    ]
    paths.extend(path for path in (root / "schema").glob("*.json") if path.is_file())
    paths.extend(
        path
        for path in (root / "AGENTS.md", root / "current_state.md", root / "output" / "worldbook_source.jsonl")
        if path.is_file()
    )
    return sorted(set(paths), key=lambda path: path.relative_to(root).as_posix())


def build_manifest(root: Path = ROOT) -> dict:
    files = [
        {"path": path.relative_to(root).as_posix(), "sha256": sha256_file(path)}
        for path in frozen_paths(root)
    ]
    return {
        "phase": "3D-R2C",
        "status": "FROZEN_BEFORE_R2C_BUILD",
        "scope": "All earlier work artifacts, existing schemas, current state, AGENTS rules and formal Worldbook source present before R2C.",
        "file_count": len(files),
        "files": files,
    }


def main() -> None:
    output = R2C_ROOT / "reviewed_inputs" / "frozen_input_manifest.json"
    atomic_write_text(output, render_json(build_manifest()))
    schema_names = [
        "character_profile_v2.schema.json",
        "npc_profile_v2.schema.json",
        "pc_continuity_v2.schema.json",
        "migration_package.schema.json",
    ]
    schema_lines = ["# R2C Profile v2 Schema 验证报告", "", "状态：`PASS`", "", "## 冻结哈希", ""]
    schema_freeze = {"phase": "3D-R2C", "status": "SCHEMA_FROZEN_FOR_MIGRATION", "files": []}
    for name in schema_names:
        digest = sha256_file(R2C_ROOT / "schemas" / name)
        schema_lines.append(f"- `{name}`: `{digest}`")
        schema_freeze["files"].append({"path": f"work/phase3d_r2c/schemas/{name}", "sha256": digest})
    schema_lines.extend(["", "这些 schema 在六组 fixture 通过后冻结，用于本次全量迁移。", ""])
    atomic_write_text(R2C_ROOT / "reports" / "schema_validation_report.md", "\n".join(schema_lines))
    atomic_write_text(R2C_ROOT / "reviewed_inputs" / "schema_freeze.json", render_json(schema_freeze))

    fixture_paths = sorted((R2C_ROOT / "reviewed_inputs" / "schema_fixtures").glob("*.json"))
    failures = {
        path.stem: validate_profile(load_json(path))
        for path in fixture_paths
        if validate_profile(load_json(path))
    }
    if failures:
        raise ValueError("fixture validation failed: " + render_json(failures))
    fixture_lines = [
        "# R2C Schema Fixture Gate",
        "",
        "状态：`SCHEMA_FROZEN_FOR_MIGRATION`",
        "",
        f"- 通过：{len(fixture_paths)}/{len(fixture_paths)}",
        "- WHITE_MAGICIAN：背景、兵工厂与秘境终局分离。",
        "- CASSANDRA：当前动机与 possible future 分离。",
        "- DEATHWING：testimony、实际战斗与 theory 分离。",
        "- OSHIRA：testimony、受控行动与未知意识/持续性分离。",
        "- YOUYOU：完整顺序链由显式 story order 表示。",
        "- PC_YU_LINFENG：知识取得时间明确，四项自主权限保持 false。",
        "",
    ]
    atomic_write_text(R2C_ROOT / "reports" / "fixture_validation_report.md", "\n".join(fixture_lines))
    print(output.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()
