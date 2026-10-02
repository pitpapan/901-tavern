from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def run(command: list[str]) -> tuple[bool, str]:
    completed = subprocess.run(command, cwd=ROOT, capture_output=True)
    output = (completed.stdout + completed.stderr).decode("utf-8", errors="replace")
    return completed.returncode == 0, output


def main() -> None:
    derived_ok, derived_output = run([sys.executable, "scripts/r1c_vnext/pilot.py", "--check"])
    independent_ok, independent_output = run([sys.executable, "scripts/r1c_vnext/independent_validate.py"])
    tests_ok, tests_output = run([sys.executable, "-m", "unittest", "tests.test_r1c_vnext_pilot"])
    result = {
        "status": "PASS" if derived_ok and independent_ok and tests_ok else "FAIL",
        "derived_output_check": "PASS" if derived_ok else "FAIL",
        "independent_audit": "PASS" if independent_ok else "FAIL",
        "focused_tests": "PASS" if tests_ok else "FAIL",
        "commands": {
            "derived_output_check": "python scripts/r1c_vnext/pilot.py --check",
            "independent_audit": "python scripts/r1c_vnext/independent_validate.py",
            "focused_tests": "python -m unittest tests.test_r1c_vnext_pilot",
        },
    }
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    if result["status"] != "PASS":
        for label, output in (("derived", derived_output), ("independent", independent_output), ("tests", tests_output)):
            if output:
                print(f"[{label}]\n{output}", file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
