import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "validate_authoring_framework.py"
SCHEMA_DIR = ROOT / "schema"


def supplement(
    supplement_id: str = "SUPPLEMENT_0001",
    *,
    supplement_type: str = "world",
    target_domain: str = "worldbook",
    status: str = "draft",
    visibility: str = "public",
    known_by: list[str] | None = None,
    unknown_to: list[str] | None = None,
    supersedes: list[str] | None = None,
) -> dict:
    return {
        "id": supplement_id,
        "title": "Neutral authoring example",
        "supplement_type": supplement_type,
        "target_domain": target_domain,
        "status": status,
        "content": "A neutral proposed fact for review.",
        "effective_scope": "preexisting_world",
        "visibility": visibility,
        "known_by": [] if known_by is None else known_by,
        "unknown_to": [] if unknown_to is None else unknown_to,
        "supersedes": [] if supersedes is None else supersedes,
        "provenance": {
            "provided_by": "USER",
            "source_reference": "Human-authored supplement",
            "recorded_at": "2026-09-27T00:00:00Z",
        },
        "notes": "",
    }


def continuation(event_id: str = "CONT_0001", *, status: str = "confirmed") -> dict:
    return {
        "event_id": event_id,
        "session_id": "SESSION_0001",
        "event_type": "event",
        "actors": ["CHARACTER_PLACEHOLDER"],
        "summary": "A neutral event that occurred during recorded play.",
        "facts_established": ["A neutral fact was established."],
        "relationships_changed": [],
        "knowledge_changed": [],
        "state_changes": [],
        "source_record": "sources/continuation/SESSION_0001.md",
        "canon_status": status,
        "notes": "",
    }


def director(item_id: str = "DIRECTOR_0001") -> dict:
    return {
        "id": item_id,
        "type": "plot_seed",
        "title": "Neutral hypothetical seed",
        "premise": "A hypothetical possibility for later consideration.",
        "related_entities": [],
        "possible_directions": ["One non-canonical hypothetical direction."],
        "locked": False,
        "canon_dependencies": [],
        "status": "open",
        "notes": "Not Canon and not character knowledge.",
    }


def patch_record(
    patch_id: str = "PATCH_0001",
    *,
    created_from: list[str] | None = None,
    operation: str = "add",
    status: str = "review",
    target_database: str = "worldbook",
) -> dict:
    return {
        "patch_id": patch_id,
        "created_from": ["SUPPLEMENT_0001"] if created_from is None else created_from,
        "target_database": target_database,
        "operation": operation,
        "target_id": "CONCEPT_PLACEHOLDER",
        "reason": "Translate an approved source into a reviewable canonical change.",
        "proposed_changes": {
            "before": None,
            "after": {"content": "Neutral proposed canonical content."},
        },
        "affected_entries": [],
        "conflict_check": {"status": "clear", "items": []},
        "status": status,
        "review_notes": "",
    }


def add_approval(payload: dict, *, applied: bool = False) -> dict:
    payload["approval"] = {
        "decision": "approved",
        "approved_by": "HUMAN_REVIEWER",
        "approved_at": "2026-09-27T00:00:00Z",
    }
    if applied:
        payload["application"] = {
            "applied_by": "HUMAN_OPERATOR",
            "applied_at": "2026-09-27T00:01:00Z",
            "result_reference": "output/example.jsonl#sha256-placeholder",
        }
    return payload


class ValidateAuthoringFrameworkTests(unittest.TestCase):
    def run_validator(self, *documents: tuple[str, dict]) -> subprocess.CompletedProcess[str]:
        with tempfile.TemporaryDirectory() as tmp:
            paths = []
            for filename, payload in documents:
                path = Path(tmp) / filename
                path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                paths.append(str(path))
            return subprocess.run(
                [sys.executable, str(SCRIPT), *paths, "--schema-dir", str(SCHEMA_DIR)],
                text=True,
                encoding="utf-8",
                errors="replace",
                capture_output=True,
                check=False,
            )

    def assert_valid(self, result: subprocess.CompletedProcess[str]) -> None:
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("0 error(s)", result.stdout)

    def test_valid_world_supplement(self):
        self.assert_valid(self.run_validator(("world.json", supplement())))

    def test_valid_character_supplement(self):
        payload = supplement(
            supplement_type="character",
            target_domain="npc_profile",
        )
        self.assert_valid(self.run_validator(("character.json", payload)))

    def test_character_supplements_support_phase3a_targets(self):
        for target in ("npc_profiles", "pc_continuity"):
            with self.subTest(target=target):
                payload = supplement(
                    supplement_type="character",
                    target_domain=target,
                )
                self.assert_valid(self.run_validator((f"{target}.json", payload)))

    def test_canon_patches_support_phase3a_profile_targets(self):
        for target in ("npc_profiles", "pc_continuity"):
            with self.subTest(target=target):
                payload = patch_record(target_database=target)
                self.assert_valid(
                    self.run_validator(
                        ("source.json", supplement()),
                        (f"{target}.json", payload),
                    )
                )

    def test_director_and_pending_continuation_barriers_apply_to_profile_patches(self):
        director_patch = add_approval(
            patch_record(
                created_from=["DIRECTOR_0001"],
                status="approved",
                target_database="npc_profiles",
            )
        )
        result = self.run_validator(
            ("director.json", director()),
            ("patch.json", director_patch),
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn("director item cannot be a direct canon patch source", result.stdout.lower())

        continuation_patch = add_approval(
            patch_record(
                created_from=["CONT_0001"],
                status="approved",
                target_database="pc_continuity",
            )
        )
        result = self.run_validator(
            ("continuation.json", continuation(status="pending")),
            ("patch.json", continuation_patch),
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn("is not confirmed", result.stdout)

    def test_valid_director_item(self):
        self.assert_valid(self.run_validator(("director.json", director())))

    def test_valid_confirmed_continuation_event(self):
        self.assert_valid(self.run_validator(("continuation.json", continuation())))

    def test_duplicate_ids_are_rejected_across_documents(self):
        result = self.run_validator(
            ("one.json", supplement()),
            ("two.json", supplement()),
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn("duplicate id SUPPLEMENT_0001", result.stdout)

    def test_invalid_status_is_rejected_by_schema(self):
        payload = supplement(status="published")
        result = self.run_validator(("invalid.json", payload))
        self.assertEqual(result.returncode, 1)
        self.assertIn("status", result.stdout)
        self.assertIn("allowed", result.stdout)

    def test_director_item_cannot_be_direct_canon_patch_source(self):
        payload = add_approval(patch_record(created_from=["DIRECTOR_0001"], status="approved"))
        result = self.run_validator(
            ("director.json", director()),
            ("patch.json", payload),
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn("director item cannot be a direct canon patch source", result.stdout.lower())

    def test_pending_continuation_cannot_be_canon_patch_source(self):
        payload = add_approval(patch_record(created_from=["CONT_0001"], status="approved"))
        result = self.run_validator(
            ("continuation.json", continuation(status="pending")),
            ("patch.json", payload),
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn("continuation source CONT_0001 is not confirmed", result.stdout)

    def test_unknown_supersedes_reference_is_rejected(self):
        payload = supplement(supplement_id="SUPPLEMENT_0002", supersedes=["SUPPLEMENT_9999"])
        result = self.run_validator(("supplement.json", payload))
        self.assertEqual(result.returncode, 1)
        self.assertIn("unknown supersedes reference SUPPLEMENT_9999", result.stdout)

    def test_valid_supersede_chain_is_accepted(self):
        first = supplement(supplement_id="SUPPLEMENT_0001", status="superseded")
        first["superseded_by"] = "SUPPLEMENT_0002"
        second = supplement(
            supplement_id="SUPPLEMENT_0002",
            status="approved",
            supersedes=["SUPPLEMENT_0001"],
        )
        self.assert_valid(
            self.run_validator(("first.json", first), ("second.json", second))
        )

    def test_supersede_cycle_is_rejected(self):
        first = supplement(supplement_id="SUPPLEMENT_0001", supersedes=["SUPPLEMENT_0002"])
        second = supplement(supplement_id="SUPPLEMENT_0002", supersedes=["SUPPLEMENT_0001"])
        result = self.run_validator(("first.json", first), ("second.json", second))
        self.assertEqual(result.returncode, 1)
        self.assertIn("supersedes cycle", result.stdout.lower())

    def test_superseded_record_cannot_point_to_rejected_successor(self):
        first = supplement(supplement_id="SUPPLEMENT_0001", status="superseded")
        first["superseded_by"] = "SUPPLEMENT_0002"
        second = supplement(
            supplement_id="SUPPLEMENT_0002",
            status="rejected",
            supersedes=["SUPPLEMENT_0001"],
        )
        result = self.run_validator(("first.json", first), ("second.json", second))
        self.assertEqual(result.returncode, 1)
        self.assertIn("successor SUPPLEMENT_0002 must be approved", result.stdout)

    def test_malformed_supersedes_does_not_crash_or_hide_later_errors(self):
        first = supplement(supplement_id="SUPPLEMENT_0001", status="superseded")
        first["superseded_by"] = "SUPPLEMENT_0002"
        malformed = supplement(supplement_id="SUPPLEMENT_0002")
        malformed["supersedes"] = None
        later = supplement(supplement_id="SUPPLEMENT_0003", status="published")
        result = self.run_validator(
            ("first.json", first),
            ("malformed.json", malformed),
            ("later.json", later),
        )
        self.assertEqual(result.returncode, 1)
        combined = result.stdout + result.stderr
        self.assertNotIn("Traceback", combined)
        self.assertIn("supersedes", combined)
        self.assertIn("status", combined)

    def test_malformed_visibility_does_not_crash(self):
        malformed = supplement(supplement_type="secret")
        malformed["visibility"] = []
        result = self.run_validator(("malformed.json", malformed))
        self.assertEqual(result.returncode, 1)
        combined = result.stdout + result.stderr
        self.assertNotIn("Traceback", combined)
        self.assertIn("visibility", combined)

    def test_destructive_delete_operation_is_rejected(self):
        payload = patch_record(operation="delete")
        result = self.run_validator(("patch.json", payload))
        self.assertEqual(result.returncode, 1)
        self.assertIn("operation", result.stdout)
        self.assertIn("allowed", result.stdout)

    def test_valid_secret_metadata_is_accepted(self):
        payload = supplement(
            supplement_type="secret",
            visibility="secret",
            known_by=["CHARACTER_PLACEHOLDER"],
            unknown_to=["CHARACTER_OTHER"],
        )
        self.assert_valid(self.run_validator(("secret.json", payload)))

    def test_secret_without_knowledge_metadata_is_rejected(self):
        payload = supplement(supplement_type="secret", visibility="secret")
        result = self.run_validator(("secret.json", payload))
        self.assertEqual(result.returncode, 1)
        self.assertIn("knowledge metadata", result.stdout.lower())

    def test_visibility_lists_cannot_contradict_each_other(self):
        payload = supplement(
            supplement_type="secret",
            visibility="secret",
            known_by=["CHARACTER_PLACEHOLDER"],
            unknown_to=["CHARACTER_PLACEHOLDER"],
        )
        result = self.run_validator(("secret.json", payload))
        self.assertEqual(result.returncode, 1)
        self.assertIn("both known_by and unknown_to", result.stdout)

    def test_confirmed_continuation_can_source_review_patch(self):
        payload = patch_record(created_from=["CONT_0001"])
        self.assert_valid(
            self.run_validator(
                ("continuation.json", continuation(status="confirmed")),
                ("patch.json", payload),
            )
        )

    def test_applied_patch_requires_explicit_approval(self):
        payload = patch_record(status="applied")
        result = self.run_validator(("patch.json", payload))
        self.assertEqual(result.returncode, 1)
        self.assertIn("applied patch requires approval", result.stdout.lower())

    def test_approved_patch_requires_explicit_approval(self):
        source = supplement(status="approved")
        payload = patch_record(status="approved")
        result = self.run_validator(("source.json", source), ("patch.json", payload))
        self.assertEqual(result.returncode, 1)
        self.assertIn("approved patch requires approval", result.stdout.lower())

    def test_approved_patch_with_human_approval_is_valid(self):
        source = supplement(status="approved")
        payload = add_approval(patch_record(status="approved"))
        self.assert_valid(self.run_validator(("source.json", source), ("patch.json", payload)))

    def test_director_file_reference_cannot_source_patch(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            director_path = root / "sources" / "director" / "plot_seeds" / "seed.json"
            director_path.parent.mkdir(parents=True)
            director_path.write_text(json.dumps(director(), ensure_ascii=False), encoding="utf-8")
            payload = add_approval(
                patch_record(
                    created_from=["sources/director/plot_seeds/seed.json"],
                    status="applied",
                ),
                applied=True,
            )
            patch_path = root / "patch.json"
            patch_path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(SCRIPT), str(director_path), str(patch_path)],
                text=True,
                encoding="utf-8",
                errors="replace",
                capture_output=True,
                check=False,
            )
        self.assertEqual(result.returncode, 1)
        self.assertIn("director item cannot be a direct Canon patch source", result.stdout)

    def test_pending_continuation_file_reference_cannot_source_patch(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            continuation_path = root / "sources" / "continuation" / "pending.json"
            continuation_path.parent.mkdir(parents=True)
            continuation_path.write_text(
                json.dumps(continuation(status="pending"), ensure_ascii=False),
                encoding="utf-8",
            )
            payload = add_approval(
                patch_record(
                    created_from=["sources/continuation/pending.json"],
                    status="applied",
                ),
                applied=True,
            )
            patch_path = root / "patch.json"
            patch_path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(SCRIPT), str(continuation_path), str(patch_path)],
                text=True,
                encoding="utf-8",
                errors="replace",
                capture_output=True,
                check=False,
            )
        self.assertEqual(result.returncode, 1)
        self.assertIn("continuation source CONT_0001 is not confirmed", result.stdout)

    def test_pending_continuation_jsonl_reference_cannot_source_patch(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            continuation_path = root / "sources" / "continuation" / "events.jsonl"
            continuation_path.parent.mkdir(parents=True)
            continuation_path.write_text(
                json.dumps(continuation(status="pending"), ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
            payload = patch_record(created_from=["sources/continuation/events.jsonl:1"])
            patch_path = root / "patch.json"
            patch_path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(SCRIPT), str(continuation_path), str(patch_path)],
                text=True,
                encoding="utf-8",
                errors="replace",
                capture_output=True,
                check=False,
            )
        self.assertEqual(result.returncode, 1)
        self.assertIn("continuation source CONT_0001 is not confirmed", result.stdout)

    def test_shipped_examples_validate_together(self):
        paths = [
            ROOT / "templates" / "authorial_supplement.example.json",
            ROOT / "templates" / "canon_patch.example.json",
            ROOT / "templates" / "continuation_event.example.json",
            ROOT / "templates" / "director_item.example.json",
        ]
        result = subprocess.run(
            [sys.executable, str(SCRIPT), *map(str, paths), "--schema-dir", str(SCHEMA_DIR)],
            text=True,
            encoding="utf-8",
            errors="replace",
            capture_output=True,
            check=False,
        )
        self.assert_valid(result)
        self.assertIn("Validated 4 document(s)", result.stdout)

    def test_routing_config_is_recommend_only_and_covers_required_cases(self):
        path = ROOT / "config" / "content_routing_rules.json"
        config = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual(config["mode"], "recommend_only")
        self.assertFalse(config["can_apply_mutation"])
        self.assertEqual(
            set(config["targets"]),
            {"worldbook", "npc_profiles", "pc_continuity", "rules", "current_state", "continuation", "director"},
        )
        self.assertEqual(config["routing_cases"]["possible_future"], "director")
        self.assertEqual(config["routing_cases"]["occurred_in_continuation"], "continuation")
        self.assertEqual(config["routing_cases"]["objective_world_fact"], "worldbook")
        self.assertEqual(config["routing_cases"]["character_personality"], "npc_profiles")
        self.assertEqual(config["routing_cases"]["pc_declared_goal"], "pc_continuity")
        self.assertEqual(config["routing_cases"]["pc_acquired_knowledge"], "pc_continuity")
        self.assertEqual(config["routing_cases"]["predicted_pc_future_action"], "forbidden")
        self.assertEqual(config["routing_cases"]["rule_mechanic"], "rules")
        self.assertEqual(config["routing_cases"]["present_state"], "current_state")

    def test_required_authoring_directories_exist(self):
        relative_paths = [
            "sources/supplements/world",
            "sources/supplements/characters",
            "sources/supplements/factions",
            "sources/supplements/locations",
            "sources/supplements/concepts",
            "sources/supplements/rules",
            "sources/continuation",
            "sources/director/plot_seeds",
            "sources/director/faction_agendas",
            "sources/director/mysteries",
            "sources/director/possible_developments",
            "work/patches/pending",
            "work/patches/approved",
            "work/patches/applied",
            "work/patches/rejected",
            "templates",
            "docs",
        ]
        missing = [path for path in relative_paths if not (ROOT / path).is_dir()]
        self.assertEqual(missing, [])


if __name__ == "__main__":
    unittest.main()
