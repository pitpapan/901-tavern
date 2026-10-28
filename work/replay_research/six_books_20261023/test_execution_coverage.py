"""Audit the real merged development projection without rewriting its report."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

STAGE = Path(__file__).resolve().parent
ROOT = STAGE.parents[2]
KIT = ROOT.parent / '901-resource-authoring-kit'
PACKAGE = KIT / 'outputs/技艺适配-20261025'
BUNDLE_PACKAGE = KIT / 'outputs/施法体系适配-20261024'


class CoverageTest(unittest.TestCase):
    def test_declared_candidate_package_keeps_official_and_passive_counts_separate(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
            output = Path(tmp) / 'coverage.json'
            result = subprocess.run([
                sys.executable, str(STAGE / 'audit_execution_coverage.py'),
                '--candidate-package', str(PACKAGE), '--output', str(output),
                '--candidate-package', str(BUNDLE_PACKAGE),
            ], cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(result.returncode, 0, result.stderr)
            report = json.loads(output.read_text(encoding='utf-8'))
            self.assertEqual(report['counts']['contracts'], 270)
            self.assertEqual(report['counts']['actions'], 148)
            self.assertEqual(report['counts']['legalWithoutBaseProgram'], 102)
            self.assertEqual(report['candidateCounts']['contracts'], 12)
            self.assertEqual(report['candidateCounts']['actions'], 10)
            self.assertEqual(report['candidateCounts']['fullyVerified'], 0)
            self.assertEqual(len(report['candidatePackages']), 2)

    def test_dropping_one_of_two_packages_is_not_a_valid_complete_audit(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
            output = Path(tmp) / 'coverage.json'
            result = subprocess.run([
                sys.executable, str(STAGE / 'audit_execution_coverage.py'),
                '--candidate-package', str(PACKAGE), '--output', str(output),
            ], cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('runtime definition set differs', result.stderr)
            self.assertFalse(output.exists())

    def test_omitted_candidate_package_does_not_silently_ignore_runtime_definitions(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
            output = Path(tmp) / 'coverage.json'
            result = subprocess.run([
                sys.executable, str(STAGE / 'audit_execution_coverage.py'),
                '--output', str(output),
            ], cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse(output.exists())


if __name__ == '__main__':
    unittest.main()
