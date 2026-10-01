import hashlib
import json
import unittest
from pathlib import Path

from scripts import build_phase3d_recall as recall_builder


ROOT = Path(__file__).resolve().parents[1]
RECALL = ROOT / "work" / "phase3d_recall"
PREFLIGHT = RECALL / "preflight_manifest.json"
COVERAGE_MANIFEST = RECALL / "source_coverage_manifest.json"
COVERAGE_DIR = RECALL / "source_coverage"
EVENT_DIR = RECALL / "event_audits"
CROSS_PROFILE_DIR = RECALL / "cross_profile_audits"
REPAIRED_DIR = RECALL / "repaired_candidates"
RECALL_PATCH_DIR = RECALL / "patches"
REVIEW_DIR = RECALL / "reviews"
FINAL_REPORT = ROOT / "work" / "phase3d_recall_review.md"
CANON_GAP_REPORT = RECALL / "reports" / "canon_gap_report.md"
GAP_METRICS = RECALL / "reports" / "gap_metrics.json"


class Phase3DRecallPreflightTests(unittest.TestCase):
    def test_preflight_freezes_exact_phase3d_population_and_depths(self):
        self.assertTrue(PREFLIGHT.is_file())
        payload = json.loads(PREFLIGHT.read_text(encoding="utf-8"))
        profiles = payload["profiles"]
        self.assertEqual(len(profiles), 36)
        self.assertEqual(sum(row["profile_kind"] == "npc" for row in profiles), 35)
        self.assertEqual(sum(row["profile_kind"] == "pc_continuity" for row in profiles), 1)
        self.assertEqual(
            {depth: sum(row["profile_depth"] == depth for row in profiles) for depth in ("full", "compact", "minimal")},
            {"full": 19, "compact": 15, "minimal": 2},
        )
        self.assertEqual(len({row["profile_id"] for row in profiles}), 36)
        self.assertEqual(len({row["worldbook_id"] for row in profiles}), 36)

    def test_preflight_protects_phase3d_and_prior_frozen_artifacts(self):
        payload = json.loads(PREFLIGHT.read_text(encoding="utf-8"))
        protected = payload["protected_files"]
        required = {
            "work/phase3d_review.md",
            "work/phase3d_approval_manifest.md",
            "work/phase3d_review_manifest.json",
            "work/phase3d_preflight.md",
            "output/worldbook_source.jsonl",
            "current_state.md",
        }
        self.assertTrue(required.issubset(protected))
        self.assertEqual(len([path for path in protected if path.startswith("work/phase3d/approved_candidates/")]), 36)
        self.assertEqual(len([path for path in protected if path.startswith("work/phase3d/reviews/")]), 36)
        for relative, expected in protected.items():
            actual = hashlib.sha256((ROOT / relative).read_bytes()).hexdigest().upper()
            self.assertEqual(actual, expected, relative)

    def test_source_inventory_covers_all_profiles_and_original_source_classes(self):
        self.assertTrue(COVERAGE_MANIFEST.is_file())
        payload = json.loads(COVERAGE_MANIFEST.read_text(encoding="utf-8"))
        rows = payload["profiles"]
        self.assertEqual(len(rows), 36)
        for row in rows:
            self.assertTrue(row["search_terms"])
            self.assertTrue(row["previously_used_source_refs"])
            self.assertIn("setting", row["searched_source_classes"])
            self.assertIn("campaign_posts", row["searched_source_classes"])
            self.assertIn("battle_reports", row["searched_source_classes"])
            self.assertIsInstance(row["matched_source_files"], list)
            self.assertIsInstance(row["additional_source_files"], list)

    def test_campaign_page_identity_never_collapses_to_posts_basename(self):
        payload = json.loads(COVERAGE_MANIFEST.read_text(encoding="utf-8"))
        youyou = next(row for row in payload["profiles"] if row["profile_id"] == "NPC_YOUYOU")
        by_path = {row["path"]: row for row in youyou["matched_source_files"]}
        page_7 = next(path for path in by_path if "页 7/posts.md" in path)
        page_20 = next(path for path in by_path if "页 20/posts.md" in path)
        self.assertTrue(by_path[page_7]["previously_used"])
        self.assertFalse(by_path[page_20]["previously_used"])

    def test_every_profile_has_a_coverage_matrix_with_required_sections(self):
        manifest = json.loads(PREFLIGHT.read_text(encoding="utf-8"))
        expected = {row["profile_id"] for row in manifest["profiles"]}
        files = {path.stem.removesuffix("_coverage") for path in COVERAGE_DIR.glob("*_coverage.md")}
        self.assertEqual(files, expected)
        required = (
            "## Character / Profile",
            "## Previously Used Sources",
            "## Additional Sources Discovered",
            "## Major Narrative Stages",
            "## Significant Source-Backed Items",
            "## Ability / Status Transitions",
            "## Classification Rules",
        )
        for profile_id in expected:
            text = (COVERAGE_DIR / f"{profile_id}_coverage.md").read_text(encoding="utf-8")
            for heading in required:
                self.assertIn(heading, text, f"{profile_id} missing {heading}")
            for state in ("PROFILED", "ROUTED_ELSEWHERE", "SEEN_NOT_PROMOTED", "MISSING"):
                self.assertIn(state, text)


class Phase3DRecallEvidenceAuditTests(unittest.TestCase):
    @staticmethod
    def repaired(profile_id):
        return json.loads((REPAIRED_DIR / f"{profile_id}.json").read_text(encoding="utf-8"))

    @staticmethod
    def all_text(value):
        return json.dumps(value, ensure_ascii=False)

    def test_eight_mandatory_events_have_resolved_identity_records(self):
        expected = {
            "EVENT_CURSE_TRANSFER.md",
            "EVENT_ENGAGEMENT_ARRANGEMENT.md",
            "EVENT_YOUYOU_INHERITANCE.md",
            "EVENT_YOUYOU_PROPHECY.md",
            "EVENT_DEATHWING_FINAL_WAR.md",
            "EVENT_WHITE_MAGICIAN_CONFRONTATIONS.md",
            "EVENT_DRAGON_KING_CONTROL.md",
            "EVENT_DRAGON_SANCTUARY_COLLAPSE.md",
        }
        self.assertTrue(expected.issubset({path.name for path in EVENT_DIR.glob("*.md")}))
        for name in expected:
            text = (EVENT_DIR / name).read_text(encoding="utf-8")
            for label in (
                "- Event ID:", "- Campaign stage:", "- Location:", "- Participants:",
                "## Source Excerpts", "## Objective Facts", "## Character-Specific Knowledge",
                "## Persistent Consequences", "## Affected Profiles", "## Profile Representation Status",
            ):
                self.assertIn(label, text, f"{name} missing {label}")
            self.assertNotIn("EVENT_CONFLATION: unresolved", text)

    def test_white_magician_prison_and_factory_events_are_not_conflated(self):
        profile = self.repaired("NPC_WHITE_MAGICIAN")
        text = self.all_text(profile)
        self.assertIn("地下兵工厂追击战", text)
        self.assertIn("囚禁于监狱塔", text)
        self.assertNotIn("监狱塔后续交锋", text)
        audit = (EVENT_DIR / "EVENT_WHITE_MAGICIAN_CONFRONTATIONS.md").read_text(encoding="utf-8")
        self.assertIn("地下兵工厂", audit)
        self.assertIn("监狱塔", audit)
        self.assertIn("两个不同历史事件", audit)

    def test_verified_xierlun_background_is_repaired_without_current_politics(self):
        profile = self.repaired("NPC_XIERLUN_VON_GILCODE")
        text = self.all_text(profile)
        for phrase in (
            "真正的幕后操盘者", "参与策划了御临风和悠悠的婚约", "维持着龙族内部的平衡",
            "众多奇物", "研究过其他大陆", "帝都图书馆初期的藏书",
        ):
            self.assertIn(phrase, text)
        self.assertIn("不得据此推断 D3 当前政治立场", text)

    def test_youyou_late_continuity_is_separated_into_distinct_claims(self):
        profile = self.repaired("NPC_YOUYOU")
        text = self.all_text(profile)
        for phrase in (
            "婚约安排", "空间龙族族长", "芬尔德·琳·特兰希尔",
            "最后一道封印", "来自悠悠的保护", "乳白色",
        ):
            self.assertIn(phrase, text)
        claim_ids = {item.get("claim_id") for item in profile["identity"]["established_history"]}
        self.assertIn("CLAIM_YOUYOU_ENGAGEMENT_HISTORY", claim_ids)
        self.assertIn("CLAIM_YOUYOU_INHERITANCE_HISTORY", claim_ids)
        self.assertIn("CLAIM_YOUYOU_PROPHECY_HISTORY", claim_ids)
        self.assertIn("CLAIM_YOUYOU_PROTECTION_HISTORY", claim_ids)

    def test_oshira_control_history_records_only_proven_scope(self):
        profile = self.repaired("NPC_OSHIRA")
        text = self.all_text(profile)
        self.assertIn("白色魔法使操控", text)
        self.assertIn("奥希拉与黑龙族遭到控制", text)
        self.assertIn("具体机制", text)
        self.assertIn("意识", text)
        self.assertNotIn("血脉魔法已确认", text)

    def test_pc_cross_profile_repairs_preserve_absolute_no_autonomy(self):
        profile = self.repaired("PC_YU_LINFENG")
        permissions = profile["ai_permissions"]
        self.assertFalse(permissions["may_generate_dialogue"])
        self.assertFalse(permissions["may_choose_voluntary_actions"])
        self.assertFalse(permissions["may_generate_private_thoughts"])
        self.assertFalse(permissions["may_assign_new_goals"])
        text = self.all_text(profile)
        self.assertIn("婚约", text)
        self.assertIn("暂时接受", text)
        self.assertIn("日后自行选择", text)
        self.assertIn("来自悠悠的保护", text)

    def test_major_event_propagation_has_cross_profile_records(self):
        expected = {
            "ALLIANCE_AND_ENGAGEMENT_PROPAGATION.md",
            "YOUYOU_YU_CONTINUITY_PROPAGATION.md",
            "WHITE_MAGICIAN_OSHIRA_CONTROL_PROPAGATION.md",
            "DEATHWING_FINAL_WAR_PROPAGATION.md",
        }
        self.assertTrue(expected.issubset({path.name for path in CROSS_PROFILE_DIR.glob("*.md")}))
        combined = "\n".join((CROSS_PROFILE_DIR / name).read_text(encoding="utf-8") for name in expected)
        for profile_id in (
            "NPC_YOUYOU", "PC_YU_LINFENG", "NPC_XIERLUN_VON_GILCODE",
            "NPC_WHITE_MAGICIAN", "NPC_OSHIRA", "NPC_DEATHWING",
        ):
            self.assertIn(profile_id, combined)


class Phase3DRecallRepairLineageTests(unittest.TestCase):
    def test_missing_resolution_is_derived_from_required_claim_ids(self):
        profile = json.loads((REPAIRED_DIR / "NPC_YOUYOU.json").read_text(encoding="utf-8"))
        self.assertEqual(recall_builder.unresolved_missing_items("NPC_YOUYOU", profile), [])
        altered = json.loads(json.dumps(profile, ensure_ascii=False))
        altered["identity"]["established_history"] = [
            claim for claim in altered["identity"]["established_history"]
            if claim.get("claim_id") != "CLAIM_YOUYOU_PROTECTION_HISTORY"
        ]
        self.assertIn(
            "死亡之翼战中的乳白色保护",
            recall_builder.unresolved_missing_items("NPC_YOUYOU", altered),
        )

    def test_repaired_candidates_preserve_all_phase3d_claim_ids_and_permissions(self):
        for repaired_path in REPAIRED_DIR.glob("*.json"):
            original_path = ROOT / "work" / "phase3d" / "approved_candidates" / repaired_path.name
            original = json.loads(original_path.read_text(encoding="utf-8"))
            repaired = json.loads(repaired_path.read_text(encoding="utf-8"))

            def values_for(key, value):
                found = set()
                if isinstance(value, dict):
                    if isinstance(value.get(key), str):
                        found.add(value[key])
                    for child in value.values():
                        found.update(values_for(key, child))
                elif isinstance(value, list):
                    for child in value:
                        found.update(values_for(key, child))
                return found

            self.assertTrue(values_for("claim_id", original).issubset(values_for("claim_id", repaired)), repaired_path.name)
            self.assertEqual(original["ai_permissions"], repaired["ai_permissions"], repaired_path.name)
            self.assertEqual(original["control_mode"], repaired["control_mode"], repaired_path.name)

    def test_all_36_historical_patches_remain_frozen_draft_additions(self):
        patch_dir = ROOT / "work" / "patches" / "pending"
        patch_paths = sorted(patch_dir.glob("*.json"))
        patches = [json.loads(path.read_text(encoding="utf-8")) for path in patch_paths]
        self.assertEqual(len(patches), 36)
        self.assertTrue(all(item["operation"] == "add" for item in patches))
        self.assertTrue(all(item["status"] == "draft" for item in patches))
        baseline = json.loads(PREFLIGHT.read_text(encoding="utf-8"))["draft_patch_baseline"]
        self.assertEqual(len(baseline), 36)
        for path in patch_paths:
            relative = path.relative_to(ROOT).as_posix()
            actual = hashlib.sha256(path.read_bytes()).hexdigest().upper()
            self.assertEqual(actual, baseline[relative], relative)

    def test_recall_patches_are_separate_draft_additions(self):
        paths = sorted(RECALL_PATCH_DIR.glob("PATCH_*.json"))
        self.assertEqual(len(paths), len(recall_builder.REPAIRED_PROFILE_IDS))
        patches = [json.loads(path.read_text(encoding="utf-8")) for path in paths]
        repaired_ids = {path.stem for path in REPAIRED_DIR.glob("*.json")}
        self.assertEqual({item["target_id"] for item in patches}, repaired_ids)
        for item in patches:
            self.assertEqual(item["operation"], "add")
            self.assertEqual(item["status"], "draft")
            text = json.dumps(item, ensure_ascii=False)
            expected = f"work/phase3d_recall/repaired_candidates/{item['target_id']}.json"
            self.assertIn(expected, text, item["target_id"])
            self.assertNotIn('"approved"', text.lower())
            self.assertNotIn('"applied"', text.lower())

    def test_independent_audit_repairs_preserve_critical_uncertainty(self):
        bright = json.loads((REPAIRED_DIR / "NPC_CASSIUS_BRIGHT.json").read_text(encoding="utf-8"))
        bright_text = json.dumps(bright, ensure_ascii=False)
        self.assertIn("盲眼幼龙", bright_text)
        self.assertIn("来源没有确认", bright_text)
        kenda = json.loads((REPAIRED_DIR / "NPC_KENDA_KAI_FERGUS.json").read_text(encoding="utf-8"))
        self.assertIn("缺乏独立遗体或后续核验", json.dumps(kenda, ensure_ascii=False))
        kuon = json.loads((REPAIRED_DIR / "NPC_KUON.json").read_text(encoding="utf-8"))
        self.assertIn("不独立确认面具机制", json.dumps(kuon, ensure_ascii=False))
        ren = json.loads((REPAIRED_DIR / "NPC_REN_FANZHEN.json").read_text(encoding="utf-8"))
        self.assertEqual(ren["presence"]["realm_scope"], ["special_interlude"])

    def test_manual_audit_repair_claim_ids_are_all_present(self):
        for profile_id in recall_builder.REPAIRED_PROFILE_IDS:
            profile = json.loads((REPAIRED_DIR / f"{profile_id}.json").read_text(encoding="utf-8"))
            self.assertEqual(recall_builder.unresolved_missing_items(profile_id, profile), [], profile_id)

    def test_second_pass_source_fidelity_corrections_do_not_regress(self):
        kenda = json.loads((REPAIRED_DIR / "NPC_KENDA_KAI_FERGUS.json").read_text(encoding="utf-8"))
        kenda_claim = next(item for item in kenda["identity"]["established_history"] if item.get("claim_id") == "CLAIM_KENDA_ASSASSINATION_ALLEGATION")
        self.assertIn("针对御临风", kenda_claim["claim"])
        self.assertNotIn("针对悠悠", kenda_claim["claim"])

        lingchi = json.loads((REPAIRED_DIR / "NPC_LINGCHI.json").read_text(encoding="utf-8"))
        lingchi_text = json.dumps(lingchi, ensure_ascii=False)
        self.assertIn("CLAIM_LINGCHI_CURSED_HALF_MONSTER_REFERENCE", lingchi_text)
        self.assertNotIn("一名传奇魔物", lingchi_text)

        mu = json.loads((REPAIRED_DIR / "NPC_MU_SHAOAI.json").read_text(encoding="utf-8"))
        self.assertIn("李萍生", json.dumps(mu, ensure_ascii=False))
        self.assertNotIn("李平生", json.dumps(mu, ensure_ascii=False))

        ren = json.loads((REPAIRED_DIR / "NPC_REN_FANZHEN.json").read_text(encoding="utf-8"))
        repaired = [item for item in ren["identity"]["established_history"] if item.get("claim_id", "").startswith("CLAIM_REN_")]
        self.assertTrue(repaired)
        self.assertTrue(all(item["origin"] == "special_interlude" for item in repaired))

        nosuri = json.loads((REPAIRED_DIR / "NPC_NOSURI.json").read_text(encoding="utf-8"))
        self.assertIn("RELATIONSHIP_NOSURI_OUGI", {item["relationship_id"] for item in nosuri["relationships"]})

        william = json.loads((REPAIRED_DIR / "NPC_WILLIAM.json").read_text(encoding="utf-8"))
        self.assertIn("威廉信长", william["aliases"])

        gremlin = json.loads((REPAIRED_DIR / "NPC_GREMLIN.json").read_text(encoding="utf-8"))
        identity = next(item for item in gremlin["identity"]["public_identity"] if item["claim_id"] == "CLAIM_GREMLIN_IDENTITY")
        self.assertTrue(any("posts.md" in source for source in identity["sources"]))

        youyou = json.loads((REPAIRED_DIR / "NPC_YOUYOU.json").read_text(encoding="utf-8"))
        youyou_text = json.dumps(youyou, ensure_ascii=False)
        self.assertIn("权宜办法而暂时接受", youyou_text)
        self.assertIn("本多关于", youyou_text)
        self.assertIn("公开陈述", youyou_text)


class Phase3DRecallCompletionTests(unittest.TestCase):
    def test_all_36_profiles_have_complete_recall_reviews(self):
        preflight = json.loads(PREFLIGHT.read_text(encoding="utf-8"))
        expected = {row["profile_id"] for row in preflight["profiles"]}
        actual = {path.stem.removesuffix("_recall_review") for path in REVIEW_DIR.glob("*_recall_review.md")}
        self.assertEqual(actual, expected)
        headings = (
            "## Persona Coverage", "## Narrative Continuity Coverage", "## Source Coverage",
            "## Major Timeline Stages", "## Missing Information Found", "## PROFILED",
            "## ROUTED_ELSEWHERE", "## SEEN_NOT_PROMOTED", "## MISSING",
            "## Event Conflation Findings", "## Ability / Status Transition Findings",
            "## Relationship Continuity Findings", "## Knowledge Continuity Findings",
            "## Repairs Applied", "## Remaining Ambiguities", "## Final Recall Status",
        )
        for profile_id in expected:
            text = (REVIEW_DIR / f"{profile_id}_recall_review.md").read_text(encoding="utf-8")
            for heading in headings:
                self.assertIn(heading, text, f"{profile_id} missing {heading}")
            self.assertIn("COMPLETE", text)
            self.assertIn("RECOMMENDED_FOR_APPROVAL", text)
            self.assertNotIn("MISSING: unresolved", text)
            self.assertNotIn("EVENT_CONFLATION: unresolved", text)

    def test_every_matched_source_file_has_exactly_one_final_disposition(self):
        manifest = json.loads(COVERAGE_MANIFEST.read_text(encoding="utf-8"))
        for row in manifest["profiles"]:
            text = (COVERAGE_DIR / f"{row['profile_id']}_coverage.md").read_text(encoding="utf-8")
            section = text.split("## Matched Source File Dispositions", 1)[1].split("## Significant Source-Backed Items", 1)[0]
            disposition_lines = [line for line in section.splitlines() if line.startswith("- [")]
            expected_paths = {item["path"] for item in row["matched_source_files"]}
            actual_paths = []
            for line in disposition_lines:
                self.assertRegex(line, r"^- \[(PROFILED|ROUTED_ELSEWHERE|SEEN_NOT_PROMOTED)\] `[^`]+` — ")
                actual_paths.append(line.split("`", 2)[1])
            self.assertEqual(set(actual_paths), expected_paths, row["profile_id"])
            self.assertEqual(len(actual_paths), len(set(actual_paths)), row["profile_id"])

    def test_coverage_matrices_have_final_classifications_and_no_pending_language(self):
        for path in COVERAGE_DIR.glob("*_coverage.md"):
            text = path.read_text(encoding="utf-8")
            self.assertNotIn("Audit pending", text, path.name)
            self.assertIn("## Classification Summary", text)
            self.assertIn("MISSING remaining: 0", text)
            self.assertIn("## Ability / Status Transitions", text)

    def test_previously_used_sources_contain_only_file_references(self):
        manifest = json.loads(COVERAGE_MANIFEST.read_text(encoding="utf-8"))
        for row in manifest["profiles"]:
            for source in row["previously_used_source_refs"]:
                self.assertRegex(source, r"\.(md|jsonl|json)(?=[:#]|$)", f"{row['profile_id']}: {source}")

    def test_manual_semantic_audits_cover_every_profile_once(self):
        preflight = json.loads(PREFLIGHT.read_text(encoding="utf-8"))
        expected = {row["profile_id"] for row in preflight["profiles"]}
        decisions = recall_builder.load_manual_audit_decisions()
        self.assertEqual(set(decisions), expected)
        for profile_id, decision in decisions.items():
            self.assertEqual(decision["verdict"], "NO_UNRESOLVED_MISSING", profile_id)
            self.assertGreater(decision["timeline_rows"], 0, profile_id)

    def test_canon_gap_report_routes_findings_without_mutating_canon(self):
        text = CANON_GAP_REPORT.read_text(encoding="utf-8")
        self.assertIn("WORLDBOOK_GAP", text)
        self.assertIn("NPC_OSHIRA", text)
        self.assertIn("NPC_YOUYOU", text)
        self.assertIn("No Canon patch was applied", text)

    def test_final_report_has_required_headings_metrics_and_stop_state(self):
        text = FINAL_REPORT.read_text(encoding="utf-8")
        headings = (
            "## Outcome", "## Why Recall Audit Was Required", "## Source Coverage Method",
            "## Character Coverage Summary", "## Persona Coverage Results",
            "## Narrative Continuity Coverage Results", "## Missing Information Found",
            "## Major Repairs", "## Youyou Reaudit", "## Xierlun Reaudit",
            "## White Magician Event-Location Audit", "## Oshira / Dragon War Audit",
            "## Cross-Profile Event Audit", "## Ability / Status Transition Audit",
            "## Relationship Recall Audit", "## Knowledge Recall Audit",
            "## Canon / Worldbook Gaps", "## Profiles Changed", "## Profiles Unchanged",
            "## Remaining Ambiguities", "## Validation", "## Regression Tests",
            "## Deterministic Rebuild", "## Protected Artifact Hash Check",
            "## Approval Status", "## Stop Boundary",
        )
        for heading in headings:
            self.assertIn(heading, text)
        self.assertIn("36 profiles reviewed", text)
        self.assertIn("MISSING remaining after repair: 0", text)
        self.assertIn("event-conflation errors remaining: 0", text)
        self.assertIn("READY_FOR_HUMAN_APPROVAL_AFTER_RECALL_AUDIT", text)
        self.assertNotIn("Continuity items examined: 1454", text)
        self.assertIn("Continuity records examined:", text)
        self.assertIn("Globally new source files beyond all earlier evidence packets:", text)
        self.assertRegex(text, r"(?m)^- Ability/status gaps found and repaired: \d+$")
        self.assertRegex(text, r"(?m)^- Relationship gaps found and repaired: \d+$")
        self.assertRegex(text, r"(?m)^- Knowledge gaps found and repaired: \d+$")
        self.assertIn("The thematic counts overlap", text)

    def test_gap_metrics_are_reproducible_from_the_reviewed_missing_population(self):
        payload = json.loads(GAP_METRICS.read_text(encoding="utf-8"))
        records = payload["records"]
        expected = {
            (profile_id, claim_id)
            for profile_id, resolutions in recall_builder.MISSING_RESOLUTION_CLAIMS.items()
            for claim_id in resolutions.values()
        }
        self.assertEqual({(row["profile_id"], row["claim_id"]) for row in records}, expected)
        self.assertEqual(len(records), 96)
        self.assertTrue(all(("persona" in row["tags"]) ^ ("narrative" in row["tags"]) for row in records))
        for label, count in payload["counts"].items():
            self.assertEqual(count, sum(label in row["tags"] for row in records), label)

    def test_no_formal_profile_database_or_phase4_output_was_created(self):
        self.assertFalse((ROOT / "output" / "npc_profiles.jsonl").exists())
        self.assertFalse((ROOT / "output" / "pc_continuity.jsonl").exists())


if __name__ == "__main__":
    unittest.main()
