import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "validate_worldbook.py"
SCHEMA = ROOT / "schema" / "worldbook_entry.schema.json"


def entry(entry_id: str, name: str, key: str = "专有词") -> dict:
    return {
        "id": entry_id,
        "type": "concept",
        "name": name,
        "aliases": [],
        "keys": [key],
        "content": f"{name}的已确认说明。",
        "canon_status": "confirmed",
        "canon_layer": "original_campaign",
        "importance": "medium",
        "sources": [{"document": "设定.md", "reference": name}],
        "notes": "",
    }


class ValidateWorldbookTests(unittest.TestCase):
    def run_validator(self, rows: list[str], schema: Path = SCHEMA) -> subprocess.CompletedProcess[str]:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "worldbook.jsonl"
            path.write_text("\n".join(rows) + "\n", encoding="utf-8")
            return subprocess.run(
                [sys.executable, str(SCRIPT), str(path), "--schema", str(schema)],
                text=True,
                encoding="utf-8",
                errors="replace",
                capture_output=True,
                check=False,
            )

    def test_schema_is_closed_and_declares_required_contract(self):
        """Catches a permissive schema that cannot protect the canonical source shape."""
        schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
        self.assertEqual(schema["$schema"], "https://json-schema.org/draft/2020-12/schema")
        self.assertFalse(schema["additionalProperties"])
        self.assertEqual(set(schema["properties"]["type"]["enum"]), {"world", "faction", "location", "character", "concept", "event"})
        self.assertEqual(set(schema["properties"]["canon_status"]["enum"]), {"confirmed", "uncertain", "rumor", "character_belief"})
        self.assertEqual(set(schema["properties"]["canon_layer"]["enum"]), {"original_campaign", "transition", "continuation", "special_interlude"})
        self.assertEqual(set(schema["properties"]["importance"]["enum"]), {"low", "medium", "high"})
        self.assertTrue({"id", "type", "name", "keys", "content", "canon_layer", "sources"}.issubset(schema["required"]))

    def test_validator_uses_the_selected_schema_contract(self):
        """Catches Python enum copies drifting away from the schema used at runtime."""
        with tempfile.TemporaryDirectory() as tmp:
            schema_path = Path(tmp) / "schema.json"
            schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
            schema["properties"]["type"]["enum"].append("artifact")
            schema_path.write_text(json.dumps(schema, ensure_ascii=False), encoding="utf-8")
            item = entry("ARTIFACT_ONE", "遗物")
            item["type"] = "artifact"
            result = self.run_validator([json.dumps(item, ensure_ascii=False)], schema_path)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_accepts_valid_jsonl_without_warnings(self):
        """Catches rejecting a minimal valid canonical entry."""
        result = self.run_validator([json.dumps(entry("CONCEPT_MASK", "假面"), ensure_ascii=False)])
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("0 error(s), 0 warning(s)", result.stdout)

    def test_rejects_missing_or_invalid_canon_layer(self):
        """Catches formal entries bypassing the required four-layer model."""
        missing = entry("CONCEPT_MISSING", "缺层")
        missing.pop("canon_layer")
        invalid = entry("CONCEPT_INVALID", "错层")
        invalid["canon_layer"] = "dream"
        result = self.run_validator([
            json.dumps(missing, ensure_ascii=False),
            json.dumps(invalid, ensure_ascii=False),
        ])
        self.assertEqual(result.returncode, 1)
        self.assertIn("canon_layer", result.stdout + result.stderr)

    def test_malformed_enum_json_is_reported_without_crashing(self):
        """Catches unhashable JSON enum values aborting validation before later lines."""
        malformed = entry("CONCEPT_ARRAY_TYPE", "数组类型")
        malformed["type"] = []
        later = entry("bad-id", "后续条目")
        result = self.run_validator([
            json.dumps(malformed, ensure_ascii=False),
            json.dumps(later, ensure_ascii=False),
        ])
        self.assertEqual(result.returncode, 1)
        combined = result.stdout + result.stderr
        self.assertIn("line 1: type is not allowed", combined)
        self.assertIn("line 2: id must match", combined)

    def test_reports_line_and_cross_record_errors_while_continuing(self):
        """Catches early aborts and missed duplicate or contract errors."""
        first = entry("BAD-id", "假面")
        first["aliases"] = ["面具", "面具"]
        second = entry("BAD-id", " 假 面 ")
        second["content"] = first["content"]
        lines = [json.dumps(first, ensure_ascii=False), "{bad json", json.dumps(second, ensure_ascii=False)]
        result = self.run_validator(lines)
        self.assertEqual(result.returncode, 1)
        combined = result.stdout + result.stderr
        self.assertIn("line 2", combined)
        self.assertIn("duplicate id", combined.lower())
        self.assertIn("duplicate content", combined.lower())
        self.assertIn("duplicate name", combined.lower())
        self.assertIn("duplicate aliases", combined.lower())

    def test_emits_all_requested_warnings(self):
        """Catches missing thresholds for long content, key count/share, and uncertain confirmed prose."""
        rows = []
        for i in range(4):
            item = entry(f"CONCEPT_ITEM_{i}", f"条目{i}", "共享词")
            if i == 0:
                item["content"] = "据说" + ("汉" * 1501)
                item["keys"] = [f"键{n}" for n in range(9)] + ["共享词"]
            rows.append(json.dumps(item, ensure_ascii=False))
        result = self.run_validator(rows)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        output = result.stdout.lower()
        self.assertIn("over 1500 chinese characters", output)
        self.assertIn("more than 8 keys", output)
        self.assertIn("uncertainty language", output)
        self.assertIn("used by 4 entries", output)


if __name__ == "__main__":
    unittest.main()
