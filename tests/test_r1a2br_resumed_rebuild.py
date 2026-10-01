import importlib
import os
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class R1A2BRResumedRebuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.runner = importlib.import_module("scripts.run_r1a2br_rebuild")
        cls.preparer = importlib.import_module("scripts.prepare_phase3d_r2c_packages")

    def test_install_failure_restores_complete_old_tree(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            live = root / "phase3d_r2c"
            stage = root / "stage"
            live.mkdir()
            stage.mkdir()
            (live / "old.txt").write_bytes(b"old")
            (stage / "new.txt").write_bytes(b"new")
            calls = 0

            def fail_install(source, target):
                nonlocal calls
                calls += 1
                if calls == 2:
                    raise OSError("injected install failure")
                os.replace(source, target)

            with self.assertRaisesRegex(RuntimeError, "old tree was restored"):
                self.runner.publish_tree_transaction(stage, live, replace=fail_install)
            self.assertEqual(b"old", (live / "old.txt").read_bytes())
            self.assertFalse((live / "new.txt").exists())

    def test_first_rename_failure_leaves_live_tree_untouched(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            live = root / "phase3d_r2c"
            stage = root / "stage"
            live.mkdir()
            stage.mkdir()
            (live / "old.txt").write_bytes(b"old")

            def fail_first(source, target):
                raise OSError("injected first rename failure")

            with self.assertRaisesRegex(OSError, "first rename"):
                self.runner.publish_tree_transaction(stage, live, replace=fail_first)
            self.assertEqual(b"old", (live / "old.txt").read_bytes())

    def test_complete_stage_contains_one_valid_deterministic_generation(self):
        with tempfile.TemporaryDirectory(dir=ROOT / "work") as temporary:
            stage = Path(temporary) / "stage"
            packages, audit = self.runner.build_validated_stage(
                ROOT / "work/phase3d_r2c", stage
            )
            self.assertEqual(37, len(packages))
            self.assertEqual(275, audit["inventory"]["actual_claim_instances"])
            self.assertEqual(0, audit["inventory"]["unauthorized_extra_objects"])
            self.assertEqual(0, audit["drift"]["unexpected_drift"])

    def test_prepare_check_mode_is_byte_read_only(self):
        packages = self.preparer.prepare_all_packages(write=False)
        del packages
        package_root = ROOT / "work/phase3d_r2c/migration_packages"
        before = self.runner.file_hashes(package_root)
        self.preparer.prepare_all_packages(check=True)
        self.assertEqual(before, self.runner.file_hashes(package_root))


if __name__ == "__main__":
    unittest.main()
