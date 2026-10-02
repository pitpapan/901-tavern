from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = ROOT / "scripts/r1c_vnext/independent_validate.py"


def load_validator():
    spec = importlib.util.spec_from_file_location("r1c_vnext_independent", VALIDATOR)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class R1CVNextIndependentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        result = subprocess.run(
            [sys.executable, "scripts/r1c_vnext/pilot.py"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        cls.build_result = json.loads(result.stdout)
        cls.mod = load_validator()

    def test_validator_is_isolated_from_generator(self):
        source = VALIDATOR.read_text(encoding="utf-8")
        self.assertNotIn("import pilot", source)
        self.assertNotIn("from scripts.r1c_vnext", source)
        self.assertNotIn("build_all", source)

    def test_independent_inventory_is_bidirectionally_equal(self):
        result = self.mod.audit(ROOT)
        self.assertEqual("PASS", result["status"])
        self.assertEqual(0, result["unsupported_outputs"])
        self.assertEqual(0, result["missing_character_projections"])
        self.assertEqual(0, result["dangling_fact_refs"])
        self.assertEqual(0, result["source_locator_errors"])
        self.assertEqual(0, result["parent_container_errors"])

    def test_sample_sets_are_complete_and_reviewed_sequentially(self):
        result = self.mod.audit(ROOT)
        self.assertEqual(24, result["development_windows"])
        self.assertEqual(24, result["holdout_windows"])
        self.assertEqual(24, result["development_reviews"])
        self.assertEqual(24, result["holdout_reviews"])
        self.assertEqual("sequential_review", result["review_isolation"])
        self.assertEqual(0, result["split_leakage"])

    def test_check_cli_is_read_only_and_passes(self):
        result = subprocess.run(
            [sys.executable, "scripts/r1c_vnext/independent_validate.py"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        payload = json.loads(result.stdout)
        self.assertEqual("PASS", payload["status"])

    def test_single_validation_entry_runs_all_r1c1_checks(self):
        result = subprocess.run(
            [sys.executable, "scripts/r1c_vnext/validate_r1c1.py"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        payload = json.loads(result.stdout)
        self.assertEqual("PASS", payload["status"])
        self.assertEqual("PASS", payload["derived_output_check"])
        self.assertEqual("PASS", payload["independent_audit"])
        self.assertEqual("PASS", payload["focused_tests"])


if __name__ == "__main__":
    unittest.main()
