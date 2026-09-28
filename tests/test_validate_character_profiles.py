import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "validate_character_profiles.py"
SCHEMA_DIR = ROOT / "schema"


def claim(
    claim_id: str = "CLAIM_0001",
    *,
    text: str = "A source-supported neutral characteristic.",
    evidence_mode: str = "repeated_observed_behavior",
    origin: str = "original_campaign",
    stability: str = "stable",
    sources: list[str] | None = None,
) -> dict:
    return {
        "claim_id": claim_id,
        "claim": text,
        "evidence_mode": evidence_mode,
        "origin": origin,
        "stability": stability,
        "context": "",
        "exceptions": [],
        "sources": ["sources/campaign/posts.md#neutral"] if sources is None else sources,
        "notes": "",
    }


def knowledge(
    knowledge_id: str = "KNOWLEDGE_0001",
    *,
    fact_ref: str = "FACT_NEUTRAL",
    epistemic_type: str = "knows",
    assertion_scope: str = "character_cognition",
    visibility: str = "public",
    sources: list[str] | None = None,
) -> dict:
    return {
        "knowledge_id": knowledge_id,
        "subject_ref": "CONCEPT_NEUTRAL",
        "fact_ref": fact_ref,
        "statement": "The character has this source-supported epistemic state.",
        "epistemic_type": epistemic_type,
        "assertion_scope": assertion_scope,
        "acquired_context": "",
        "visibility": visibility,
        "sources": ["sources/campaign/posts.md#knowledge"] if sources is None else sources,
        "notes": "",
    }


def relationship() -> dict:
    return {
        "relationship_id": "RELATIONSHIP_0001",
        "subject_ref": "CHARACTER_OTHER",
        "relationship_type": "established_associate",
        "established_history": [claim("CLAIM_REL_HISTORY")],
        "current_stance": [claim("CLAIM_REL_STANCE", stability="conditional")],
        "obligations": [],
        "tensions": [],
        "known_shared_experiences": ["EVENT_NEUTRAL"],
        "visibility": "public",
        "sources": ["sources/campaign/posts.md#relationship"],
        "notes": "",
    }


def goal(
    goal_id: str = "GOAL_0001",
    *,
    basis: str = "source_confirmed",
    status: str = "active",
) -> dict:
    return {
        "goal_id": goal_id,
        "goal": "Pursue a source-supported current objective.",
        "status": status,
        "basis": basis,
        "origin": "original_campaign",
        "sources": ["sources/campaign/posts.md#goal"],
        "notes": "",
    }


def base_profile(*, kind: str) -> dict:
    is_pc = kind == "pc_continuity"
    prefix = "PC" if is_pc else "NPC"
    payload = {
        "id": f"{prefix}_NEUTRAL_GUIDE",
        "profile_kind": kind,
        "worldbook_id": "CHARACTER_NEUTRAL_GUIDE",
        "name": "Neutral Guide",
        "aliases": [],
        "profile_depth": "compact",
        "activation_policy": "compact_when_supporting",
        "knowledge_partition": True,
        "canon_layers": ["original_campaign"],
        "identity": {
            "public_identity": [claim("CLAIM_IDENTITY")],
            "durable_roles": [],
            "established_history": [],
        },
        "core_personality": [claim("CLAIM_PERSONALITY")],
        "values": [],
        "speech_style": [],
        "decision_patterns": [],
        "relationships": [relationship()],
        "epistemic_state": [knowledge()],
        "dynamic_state": {
            "as_of": "continuation_baseline",
            "current_conditions": [],
            "current_obligations": [],
            "current_location_ref": "",
            "current_faction_role": "",
            "current_concerns": [],
            "sources": ["current_state.md#continuation-baseline"],
            "notes": "",
        },
        "presence": {
            "life_status": "alive",
            "narrative_availability": "normal",
            "realm_scope": ["original_campaign"],
            "sources": ["current_state.md#continuation-baseline"],
            "notes": "",
        },
        "rp_constraints": [
            {
                "constraint_id": "CONSTRAINT_0001",
                "constraint": "Do not exceed established knowledge.",
                "origin": "original_campaign",
                "sources": ["sources/campaign/posts.md#constraint"],
                "notes": "",
            }
        ],
        "provenance": {
            "canon_origin": ["original_campaign"],
            "source_origin_ids": ["sources/campaign/posts.md#neutral"],
        },
        "evidence_gaps": [],
        "notes": "",
    }
    if is_pc:
        payload["control_mode"] = "user_controlled"
        payload["ai_permissions"] = {
            "may_generate_dialogue": False,
            "may_choose_voluntary_actions": False,
            "may_generate_private_thoughts": False,
            "may_assign_new_goals": False,
            "may_describe_external_effects": True,
            "may_describe_involuntary_physical_reactions": True,
            "may_summarize_user_declared_actions": True,
            "may_reference_established_history": True,
        }
        payload["goals"] = {
            "declared_goals": [goal(basis="player_declared")],
            "confirmed_continuation_goals": [],
        }
    else:
        payload["control_mode"] = "npc_runtime"
        payload["ai_permissions"] = {
            "may_generate_dialogue": True,
            "may_choose_voluntary_actions": True,
            "may_generate_private_thoughts": True,
            "may_assign_new_goals": False,
            "may_describe_external_effects": True,
            "may_describe_involuntary_physical_reactions": True,
            "may_summarize_user_declared_actions": False,
            "may_reference_established_history": True,
        }
        payload["goals"] = {
            "public_goals": [goal("GOAL_PUBLIC")],
            "private_goals": [],
            "current_goals": [],
            "long_term_goals": [],
        }
    return payload


def continuation_source(*, status: str = "confirmed") -> dict:
    return {
        "event_id": "CONT_0001",
        "session_id": "SESSION_0001",
        "event_type": "event",
        "actors": ["CHARACTER_NEUTRAL_GUIDE"],
        "summary": "A neutral continuation event.",
        "facts_established": ["A neutral fact."],
        "relationships_changed": [],
        "knowledge_changed": [],
        "state_changes": [],
        "source_record": "sources/continuation/SESSION_0001.md",
        "canon_status": status,
        "notes": "",
    }


def patch_source(*, status: str = "applied", target_database: str = "npc_profiles") -> dict:
    payload = {
        "patch_id": "PATCH_0001",
        "created_from": ["SUPPLEMENT_0001"],
        "target_database": target_database,
        "operation": "add",
        "target_id": "NPC_NEUTRAL_GUIDE",
        "reason": "Create a reviewed profile.",
        "proposed_changes": {"before": None, "after": {"id": "NPC_NEUTRAL_GUIDE"}},
        "affected_entries": ["NPC_NEUTRAL_GUIDE"],
        "conflict_check": {"status": "clear", "items": []},
        "status": status,
        "review_notes": "",
    }
    if status in {"approved", "applied"}:
        payload["approval"] = {
            "decision": "approved",
            "approved_by": "HUMAN_REVIEWER",
            "approved_at": "2026-09-27T00:00:00Z",
        }
    if status == "applied":
        payload["application"] = {
            "applied_by": "HUMAN_OPERATOR",
            "applied_at": "2026-09-27T00:01:00Z",
            "result_reference": "profiles/NPC_NEUTRAL_GUIDE.json",
        }
    return payload


class ValidateCharacterProfilesTests(unittest.TestCase):
    def run_validator(
        self,
        profiles: list[dict],
        *,
        worldbook: list[dict] | None = None,
        sources: list[dict] | None = None,
    ) -> subprocess.CompletedProcess[str]:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            paths = []
            for index, payload in enumerate(profiles, start=1):
                path = root / f"profile_{index}.json"
                path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                paths.append(str(path))
            command = [
                sys.executable,
                str(SCRIPT),
                *paths,
                "--schema-dir",
                str(SCHEMA_DIR),
            ]
            if worldbook is not None:
                path = root / "worldbook.jsonl"
                path.write_text(
                    "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in worldbook),
                    encoding="utf-8",
                )
                command.extend(["--worldbook", str(path)])
            for index, payload in enumerate(sources or [], start=1):
                path = root / f"source_{index}.json"
                path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                command.extend(["--source", str(path)])
            return subprocess.run(
                command,
                text=True,
                encoding="utf-8",
                errors="replace",
                capture_output=True,
                check=False,
            )

    def assert_valid(self, result: subprocess.CompletedProcess[str]) -> None:
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("0 error(s)", result.stdout)

    def assert_rejected(self, result: subprocess.CompletedProcess[str], phrase: str) -> None:
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(phrase.casefold(), (result.stdout + result.stderr).casefold())

    def test_valid_npc_profile(self):
        self.assert_valid(self.run_validator([base_profile(kind="npc")]))

    def test_valid_pc_continuity_profile(self):
        self.assert_valid(self.run_validator([base_profile(kind="pc_continuity")]))

    def test_duplicate_profile_ids_are_rejected(self):
        profile = base_profile(kind="npc")
        self.assert_rejected(self.run_validator([profile, copy.deepcopy(profile)]), "duplicate profile id")

    def test_duplicate_worldbook_mappings_are_rejected(self):
        npc = base_profile(kind="npc")
        pc = base_profile(kind="pc_continuity")
        pc["id"] = "PC_OTHER"
        self.assert_rejected(self.run_validator([npc, pc]), "duplicate worldbook mapping")

    def test_worldbook_reference_is_checked_when_worldbook_is_supplied(self):
        profile = base_profile(kind="npc")
        worldbook = [{"id": "CHARACTER_OTHER", "type": "character"}]
        self.assert_rejected(
            self.run_validator([profile], worldbook=worldbook),
            "unknown worldbook_id CHARACTER_NEUTRAL_GUIDE",
        )

    def test_worldbook_reference_accepts_matching_character(self):
        profile = base_profile(kind="npc")
        worldbook = [{"id": "CHARACTER_NEUTRAL_GUIDE", "type": "character"}]
        self.assert_valid(self.run_validator([profile], worldbook=worldbook))

    def test_pc_cannot_receive_autonomous_permissions(self):
        for field in (
            "may_generate_dialogue",
            "may_choose_voluntary_actions",
            "may_generate_private_thoughts",
            "may_assign_new_goals",
        ):
            with self.subTest(field=field):
                profile = base_profile(kind="pc_continuity")
                profile["ai_permissions"][field] = True
                self.assert_rejected(self.run_validator([profile]), field)

    def test_pc_control_mode_is_fixed(self):
        profile = base_profile(kind="pc_continuity")
        profile["control_mode"] = "npc_runtime"
        self.assert_rejected(self.run_validator([profile]), "control_mode")

    def test_pc_autonomy_prompt_field_is_rejected(self):
        profile = base_profile(kind="pc_continuity")
        profile["AI_should_make_PC_aggressive"] = True
        self.assert_rejected(self.run_validator([profile]), "AI_should_make_PC_aggressive")

    def test_banned_ranking_fields_are_rejected_recursively(self):
        for field in ("future_importance", "expected_scene_frequency", "priority_score", "trust_score"):
            with self.subTest(field=field):
                profile = base_profile(kind="npc")
                profile["identity"][field] = 99
                self.assert_rejected(self.run_validator([profile]), field)

    def test_invalid_profile_depth_and_activation_policy_are_rejected(self):
        profile = base_profile(kind="npc")
        profile["profile_depth"] = "major"
        profile["activation_policy"] = "always_active"
        result = self.run_validator([profile])
        self.assert_rejected(result, "profile_depth")
        self.assertIn("activation_policy", result.stdout)

    def test_deceased_character_cannot_be_normally_available(self):
        profile = base_profile(kind="npc")
        profile["presence"]["life_status"] = "deceased"
        self.assert_rejected(self.run_validator([profile]), "deceased")

    def test_deceased_historical_only_profile_is_valid(self):
        profile = base_profile(kind="npc")
        profile["presence"]["life_status"] = "deceased"
        profile["presence"]["narrative_availability"] = "historical_only"
        self.assert_valid(self.run_validator([profile]))

    def test_missing_life_status_does_not_imply_death(self):
        profile = base_profile(kind="npc")
        profile["presence"]["life_status"] = "unknown"
        profile["presence"]["narrative_availability"] = "missing"
        self.assert_valid(self.run_validator([profile]))

    def test_special_interlude_only_profile_cannot_be_normally_available(self):
        profile = base_profile(kind="npc")
        profile["canon_layers"] = ["special_interlude"]
        profile["presence"]["realm_scope"] = ["special_interlude"]
        self.assert_rejected(self.run_validator([profile]), "special_interlude")

    def test_special_interlude_only_availability_is_valid(self):
        profile = base_profile(kind="npc")
        profile["canon_layers"] = ["special_interlude"]
        profile["presence"]["realm_scope"] = ["special_interlude"]
        profile["presence"]["narrative_availability"] = "special_interlude_only"
        self.assert_valid(self.run_validator([profile]))

    def test_partition_required_for_uncertain_or_restricted_knowledge(self):
        for epistemic_type, visibility in (("believes", "public"), ("suspects", "public"), ("secrets", "secret")):
            with self.subTest(epistemic_type=epistemic_type):
                profile = base_profile(kind="npc")
                profile["knowledge_partition"] = False
                profile["epistemic_state"] = [knowledge(epistemic_type=epistemic_type, visibility=visibility)]
                self.assert_rejected(self.run_validator([profile]), "knowledge_partition")

    def test_same_fact_cannot_be_known_and_unknown(self):
        profile = base_profile(kind="npc")
        profile["epistemic_state"] = [
            knowledge("KNOWLEDGE_KNOWN", epistemic_type="knows"),
            knowledge("KNOWLEDGE_UNKNOWN", epistemic_type="does_not_know"),
        ]
        self.assert_rejected(self.run_validator([profile]), "known and does_not_know")

    def test_belief_cannot_be_marked_confirmed_world_truth(self):
        profile = base_profile(kind="npc")
        profile["epistemic_state"] = [knowledge(epistemic_type="believes", assertion_scope="confirmed_world_fact")]
        self.assert_rejected(self.run_validator([profile]), "confirmed_world_fact")

    def test_secret_knowledge_requires_source_provenance(self):
        profile = base_profile(kind="npc")
        profile["epistemic_state"] = [knowledge(epistemic_type="secrets", visibility="secret", sources=[])]
        self.assert_rejected(self.run_validator([profile]), "sources")

    def test_profile_claims_require_sources(self):
        profile = base_profile(kind="npc")
        profile["speech_style"] = [claim("CLAIM_SPEECH", sources=[])]
        self.assert_rejected(self.run_validator([profile]), "sources")

    def test_single_observation_cannot_be_a_stable_trait(self):
        profile = base_profile(kind="npc")
        profile["core_personality"] = [claim(evidence_mode="single_observed_behavior", stability="stable")]
        self.assert_rejected(self.run_validator([profile]), "single_observed_behavior")

    def test_authorial_definition_requires_authorial_origin(self):
        profile = base_profile(kind="npc")
        profile["values"] = [claim(evidence_mode="authorial_definition", origin="original_campaign")]
        self.assert_rejected(self.run_validator([profile]), "authorial_definition")

    def test_pending_continuation_cannot_support_confirmed_claim(self):
        profile = base_profile(kind="npc")
        profile["values"] = [
            claim(
                evidence_mode="continuation_confirmed",
                origin="continuation",
                sources=["CONT_0001"],
            )
        ]
        self.assert_rejected(
            self.run_validator([profile], sources=[continuation_source(status="pending")]),
            "not confirmed",
        )

    def test_confirmed_continuation_can_support_confirmed_claim(self):
        profile = base_profile(kind="npc")
        profile["values"] = [
            claim(
                evidence_mode="continuation_confirmed",
                origin="continuation",
                sources=["CONT_0001"],
            )
        ]
        self.assert_valid(
            self.run_validator([profile], sources=[continuation_source(status="confirmed")])
        )

    def test_pc_continuation_goal_requires_confirmed_continuation_source(self):
        profile = base_profile(kind="pc_continuity")
        profile["goals"]["declared_goals"] = []
        profile["goals"]["confirmed_continuation_goals"] = [
            goal(basis="continuation_confirmed")
        ]
        profile["goals"]["confirmed_continuation_goals"][0]["origin"] = "continuation"
        profile["goals"]["confirmed_continuation_goals"][0]["sources"] = ["CONT_0001"]
        self.assert_rejected(
            self.run_validator([profile], sources=[continuation_source(status="pending")]),
            "not confirmed",
        )

    def test_direct_belief_does_not_require_a_fabricated_fact_ref(self):
        profile = base_profile(kind="npc")
        item = knowledge(epistemic_type="believes")
        del item["fact_ref"]
        profile["epistemic_state"] = [item]
        self.assert_valid(self.run_validator([profile]))

    def test_authorial_supplement_is_a_valid_root_provenance_origin(self):
        profile = base_profile(kind="npc")
        profile["provenance"]["canon_origin"] = ["authorial_supplement"]
        self.assert_valid(self.run_validator([profile]))

    def test_secret_and_unknown_cannot_share_the_same_fact(self):
        profile = base_profile(kind="npc")
        profile["epistemic_state"] = [
            knowledge("KNOWLEDGE_SECRET", epistemic_type="secrets", visibility="secret"),
            knowledge("KNOWLEDGE_UNKNOWN", epistemic_type="does_not_know"),
        ]
        self.assert_rejected(self.run_validator([profile]), "known/secret and does_not_know")

    def test_rejected_patch_cannot_be_profile_provenance(self):
        profile = base_profile(kind="npc")
        profile["provenance"]["introduced_by_patch"] = "PATCH_0001"
        self.assert_rejected(
            self.run_validator([profile], sources=[patch_source(status="rejected")]),
            "not approved or applied",
        )

    def test_malformed_semantic_values_report_errors_without_traceback(self):
        cases = []
        malformed_kind = base_profile(kind="npc")
        malformed_kind["profile_kind"] = []
        cases.append(malformed_kind)

        malformed_knowledge = base_profile(kind="npc")
        malformed_knowledge["epistemic_state"][0]["epistemic_type"] = []
        cases.append(malformed_knowledge)

        malformed_goals = base_profile(kind="pc_continuity")
        malformed_goals["goals"]["declared_goals"] = None
        cases.append(malformed_goals)

        for payload in cases:
            with self.subTest(payload=payload["id"]):
                result = self.run_validator([payload])
                self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
                self.assertNotIn("Traceback", result.stdout + result.stderr)

    def test_relationship_requires_subject_ref(self):
        profile = base_profile(kind="npc")
        del profile["relationships"][0]["subject_ref"]
        self.assert_rejected(self.run_validator([profile]), "subject_ref")

    def test_relationship_does_not_allow_numeric_trust_score(self):
        profile = base_profile(kind="npc")
        profile["relationships"][0]["trust_score"] = 80
        self.assert_rejected(self.run_validator([profile]), "trust_score")

    def test_completed_npc_goal_is_valid_historical_state(self):
        profile = base_profile(kind="npc")
        profile["goals"]["public_goals"] = [goal(status="completed")]
        self.assert_valid(self.run_validator([profile]))

    def test_goal_cannot_guarantee_future_event(self):
        profile = base_profile(kind="npc")
        profile["goals"]["public_goals"][0]["future_event_guaranteed"] = True
        self.assert_rejected(self.run_validator([profile]), "future_event_guaranteed")

    def test_pc_goal_must_be_player_declared_or_continuation_confirmed(self):
        profile = base_profile(kind="pc_continuity")
        profile["goals"]["declared_goals"] = [goal(basis="inferred_by_ai")]
        self.assert_rejected(self.run_validator([profile]), "basis")

    def test_npc_and_pc_schema_cannot_be_mixed(self):
        profile = base_profile(kind="npc")
        profile["id"] = "PC_NEUTRAL_GUIDE"
        self.assert_rejected(self.run_validator([profile]), "id")

    def test_shipped_examples_validate(self):
        paths = [
            ROOT / "templates" / "npc_profile.example.json",
            ROOT / "templates" / "pc_continuity_profile.example.json",
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
        self.assertIn("Validated 2 profile(s)", result.stdout)


if __name__ == "__main__":
    unittest.main()
