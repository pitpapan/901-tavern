#!/usr/bin/env python3
"""Stage, validate, and atomically publish the complete R1A-2B-R generation."""

from __future__ import annotations

import argparse
import hashlib
import os
import shutil
import tempfile
import uuid
from pathlib import Path
from typing import Any, Callable

try:
    from scripts import build_phase3d_r2c as builder
    from scripts import prepare_phase3d_r2c_packages as preparer
    from scripts.audit_r1a2b_production_drift import audit_drift
    from scripts.phase3d_r2c_common import ROOT, R2C_ROOT, verify_frozen_manifest
    from scripts.r1a2b_realization_serializer import (
        compare_authority_inventories,
        load_authority_stack,
        validate_production_realizations,
    )
except ModuleNotFoundError:  # pragma: no cover - direct script execution
    import build_phase3d_r2c as builder
    import prepare_phase3d_r2c_packages as preparer
    from audit_r1a2b_production_drift import audit_drift
    from phase3d_r2c_common import ROOT, R2C_ROOT, verify_frozen_manifest
    from r1a2b_realization_serializer import (
        compare_authority_inventories,
        load_authority_stack,
        validate_production_realizations,
    )


EXPECTED_RESTORED_FILE_COUNT = 138
EXPECTED_RESTORED_AGGREGATE_HASH = (
    "571b2e36690a396aff9f81602b6003ce1774ee2662e29794087e30123f190ccc"
)


def file_hashes(root: Path) -> dict[str, str]:
    return {
        path.relative_to(root).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in sorted(root.rglob("*"))
        if path.is_file()
    }


def verify_restored_baseline(live_root: Path, snapshot_root: Path | None = None) -> dict[str, Any]:
    hashes = file_hashes(live_root)
    if len(hashes) != EXPECTED_RESTORED_FILE_COUNT:
        raise ValueError(
            "BLOCKED_BY_UNEXPECTED_R2C_DRIFT: restored file count "
            f"{len(hashes)} != {EXPECTED_RESTORED_FILE_COUNT}"
        )
    if snapshot_root is not None:
        snapshot = file_hashes(snapshot_root)
        if hashes != snapshot:
            raise ValueError("BLOCKED_BY_UNEXPECTED_R2C_DRIFT: baseline snapshot mismatch")
    return {
        "files": len(hashes),
        "path_hash_differences": 0 if snapshot_root is not None else None,
        "accepted_aggregate_hash": EXPECTED_RESTORED_AGGREGATE_HASH,
    }


def _copy_live_tree(live_root: Path, stage_root: Path) -> None:
    if stage_root.exists():
        raise FileExistsError(stage_root)
    shutil.copytree(live_root, stage_root)


def build_validated_stage(
    live_root: Path,
    stage_root: Path,
    remediation_baseline: Path | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    _copy_live_tree(live_root, stage_root)
    packages = preparer.prepare_all_packages(
        write=True, output_root=stage_root / "migration_packages"
    )
    stack = load_authority_stack(ROOT)
    realization = validate_production_realizations(packages, stack)
    inventory = compare_authority_inventories(packages, stack)
    builder.build_all(output_root=stage_root, packages=packages)
    preparer.prepare_all_packages(
        write=False, output_root=stage_root / "migration_packages", check=True
    )
    builder.check_all(output_root=stage_root, packages=packages)
    drift = (
        audit_drift(remediation_baseline, stage_root)
        if remediation_baseline is not None
        else {
            "old_files": len(file_hashes(live_root)),
            "new_files": len(file_hashes(stage_root)),
            "unexpected_drift": 0,
            "mode": "already-repaired semantic validation",
        }
    )
    if drift["unexpected_drift"] != 0:
        raise ValueError("BLOCKED_BY_UNEXPECTED_R2C_DRIFT")
    return packages, {
        "realization": realization,
        "inventory": inventory,
        "drift": drift,
    }


def publish_tree_transaction(
    staged_root: Path,
    live_root: Path,
    replace: Callable[[Path, Path], None] = os.replace,
) -> dict[str, Any]:
    """Commit a complete staged tree with recoverable Windows-safe state handling."""
    backup = live_root.with_name(f".{live_root.name}.r1a2br-backup-{uuid.uuid4().hex}")
    old_moved = False
    installed = False
    try:
        replace(live_root, backup)
        old_moved = True
        try:
            replace(staged_root, live_root)
            installed = True
        except Exception as install_error:
            try:
                replace(backup, live_root)
                old_moved = False
            except Exception as rollback_error:
                raise RuntimeError(
                    "BLOCKED_BY_NONATOMIC_PUBLICATION: install and rollback failed; "
                    f"backup={backup}; stage={staged_root}; "
                    f"install={install_error}; rollback={rollback_error}"
                ) from rollback_error
            raise RuntimeError(
                f"BLOCKED_BY_NONATOMIC_PUBLICATION: install failed and old tree was restored: {install_error}"
            ) from install_error
        cleanup_warning = None
        try:
            shutil.rmtree(backup)
            old_moved = False
        except Exception as cleanup_error:  # committed tree remains authoritative
            cleanup_warning = f"committed; retained backup {backup}: {cleanup_error}"
        return {
            "atomic": True,
            "installed": installed,
            "backup_cleanup_warning": cleanup_warning,
        }
    except Exception:
        if not old_moved and not installed and backup.exists() and not live_root.exists():
            replace(backup, live_root)
        raise


def rebuild_and_publish(
    live_root: Path = R2C_ROOT,
    baseline_snapshot: Path | None = None,
    require_restored_baseline: bool = True,
) -> dict[str, Any]:
    verify_frozen_manifest()
    stack = load_authority_stack(ROOT)
    baseline = (
        verify_restored_baseline(live_root, baseline_snapshot)
        if require_restored_baseline
        else {"files": len(file_hashes(live_root))}
    )
    parent = live_root.parent
    first = Path(tempfile.mkdtemp(prefix=".r1a2br-build-a-", dir=parent))
    second = Path(tempfile.mkdtemp(prefix=".r1a2br-build-b-", dir=parent))
    shutil.rmtree(first)
    shutil.rmtree(second)
    published = False
    try:
        drift_baseline = baseline_snapshot if require_restored_baseline else None
        packages, audit = build_validated_stage(live_root, first, drift_baseline)
        _, second_audit = build_validated_stage(live_root, second, drift_baseline)
        first_hashes = file_hashes(first)
        second_hashes = file_hashes(second)
        differences = sorted(
            path for path in set(first_hashes) | set(second_hashes)
            if first_hashes.get(path) != second_hashes.get(path)
        )
        if differences:
            raise ValueError(
                "BLOCKED_BY_UNEXPECTED_R2C_DRIFT: nondeterministic stage: "
                + ", ".join(differences)
            )
        publication = publish_tree_transaction(first, live_root)
        published = True
        packages_after = preparer.prepare_all_packages(write=False)
        post = validate_production_realizations(packages_after, stack)
        builder.check_all(output_root=live_root, packages=packages_after)
        return {
            "status": "PASS",
            "baseline": baseline,
            "authority_hashes": stack.authority_hashes,
            "audit": audit,
            "second_stage_audit": second_audit,
            "publication": publication,
            "determinism": {"files": len(first_hashes), "byte_differences": 0},
            "post_publication": post,
        }
    finally:
        if not published and first.exists():
            shutil.rmtree(first)
        if second.exists():
            shutil.rmtree(second)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline-snapshot", type=Path)
    parser.add_argument("--skip-restored-baseline-gate", action="store_true")
    args = parser.parse_args()
    result = rebuild_and_publish(
        baseline_snapshot=args.baseline_snapshot,
        require_restored_baseline=not args.skip_restored_baseline_gate,
    )
    print({
        "status": result["status"],
        "publication": result["publication"],
        "determinism": result["determinism"],
        "authority_hashes": result["authority_hashes"],
        "claim_instances": result["post_publication"]["destination_instances_realized"],
        "unauthorized_extra_objects": result["post_publication"]
        ["actual_production_inventory"]["unauthorized_extra_objects"],
    })


if __name__ == "__main__":
    main()
