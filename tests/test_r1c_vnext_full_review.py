from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / 'scripts/r1c_vnext/validate_r1c2.py'


class FullReviewValidationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location('r1c2_validator', MODULE)
        cls.mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.mod)

    def fixture(self):
        chunk = 'SRC_P1_P001_POST_0001_1'
        fact = {'fact_id': 'F1', 'revision': 1, 'proposition_type': 'TESTIMONY',
                'statement': 'A reports that B was injured.', 'subject_refs': ['B'],
                'speaker_refs': ['A'], 'actor_refs': [], 'reality_scope': 'MAIN_WORLD',
                'narrative_modality': 'REPORTED_PAST', 'evidence_nature': 'HEARSAY',
                'polarity': 'AFFIRMED', 'source_locators': [{'source_chunk_id': chunk}]}
        return {'population': [chunk], 'manifest': [{'source_chunk_id': chunk, 'primary_review': True,
                'pass_a_reviewed': True, 'pass_b_reviewed': True, 'adjudicated': True,
                'context_before': [], 'context_after': [], 'unit_refs': ['U1'], 'fact_refs': ['F1']}],
                'pass_a_facts': [copy.deepcopy(fact)], 'facts': [fact],
                'dispositions': [{'unit_id': 'U1', 'source_chunk_id': chunk, 'disposition': 'KEEP',
                                  'reason': 'Source-supported reported injury.', 'fact_refs': ['F1']}],
                'pass_b_inventory': [{'source_chunk_id': chunk, 'source_inventory': ['Reported injury of B.']}],
                'pass_b_reviews': [{'source_chunk_id': chunk, 'comparison': 'Attribution and uncertainty retained.'}],
                'findings': [], 'adjudications': [{'source_chunk_id': chunk, 'status': 'RESOLVED_WITH_SOURCE',
                    'approved_fact_hashes': {'F1': self.mod.object_hash(fact)}}],
                'mentions': [{'entity_ref': 'A', 'canonical_entity_ref': 'A', 'resolution_status': 'RESOLVED'},
                             {'entity_ref': 'B', 'canonical_entity_ref': None, 'resolution_status': 'UNRESOLVED_ENTITY'}],
                'contract_gaps': []}

    def test_incomplete_review_cannot_pass(self):
        bundle = self.fixture()
        bundle['manifest'][0]['pass_b_reviewed'] = False
        self.assertIn('INCOMPLETE_PASS_B', self.mod.check_bundle(bundle))

    def test_duplicate_primary_ownership_is_rejected(self):
        bundle = self.fixture()
        bundle['manifest'].append(copy.deepcopy(bundle['manifest'][0]))
        self.assertIn('DUPLICATE_PRIMARY_REVIEW', self.mod.check_bundle(bundle))

    def test_long_post_secondary_unit_cannot_disappear(self):
        bundle = self.fixture()
        bundle['manifest'][0]['unit_refs'].append('U_SECONDARY')
        self.assertIn('SILENT_SOURCE_UNIT', self.mod.check_bundle(bundle))

    def test_missing_cross_character_subject_index_is_rejected(self):
        bundle = self.fixture()
        indexes = self.mod.expected_indexes(bundle['facts'], bundle['mentions'], [])
        indexes['facts_by_subject'].pop('B')
        self.assertIn('INDEX_MISMATCH:facts_by_subject', self.mod.check_indexes(bundle['facts'], bundle['mentions'], [], indexes))

    def test_ambiguous_identity_cannot_silently_become_canonical(self):
        bundle = self.fixture()
        bundle['mentions'][1]['canonical_entity_ref'] = 'A'
        self.assertIn('UNRESOLVED_ENTITY_MERGED', self.mod.check_bundle(bundle))

    def test_adjudicated_semantic_changes_require_new_review(self):
        changes = [
            ('narrative_modality', 'ACTUAL'),
            ('reality_scope', 'SPECIAL_INTERLUDE'),
            ('evidence_nature', 'NARRATIVE_CONFIRMATION'),
            ('polarity', 'NOT_STATED'),
            ('subject_refs', ['A']),
            ('knowledge_time', {'source_order': 'EARLIER'}),
            ('valid_from', 'BEFORE_CONFIRMATION'),
        ]
        for field, value in changes:
            with self.subTest(field=field):
                bundle = self.fixture()
                bundle['facts'][0][field] = value
                self.assertIn('UNAPPROVED_FACT_REVISION:F1', self.mod.check_bundle(bundle))

    def test_question_cannot_become_belief_after_adjudication(self):
        bundle = self.fixture()
        bundle['facts'][0]['narrative_modality'] = 'QUESTION'
        bundle['adjudications'][0]['approved_fact_hashes']['F1'] = self.mod.object_hash(bundle['facts'][0])
        bundle['facts'][0]['narrative_modality'] = 'BELIEF'
        self.assertIn('UNAPPROVED_FACT_REVISION:F1', self.mod.check_bundle(bundle))

    def test_dangling_fact_links_are_rejected(self):
        bundle = self.fixture()
        bundle['facts'][0]['revises'] = ['MISSING']
        self.assertIn('DANGLING_FACT_LINK:F1', self.mod.check_bundle(bundle))

    def test_locator_checks_exact_quote_hash_and_chunk_ownership(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            post = {'id': '1', 'body': 'A said B was injured.'}
            path = root / 'posts.jsonl'
            path.write_text(json.dumps(post) + '\n', encoding='utf-8')
            chunk = 'C1'
            source = {chunk: {'source_path': 'posts.jsonl', 'post_id': '1', 'post': post}}
            locator = {'source_path': 'posts.jsonl', 'post_id': '1', 'source_chunk_id': chunk,
                       'span_start': 0, 'span_end': 6, 'quote': 'A said',
                       'post_sha256': self.mod.object_hash(post), 'file_sha256': self.mod.file_hash(path)}
            self.assertEqual([], self.mod.check_locator(root, locator, source))
            for key, value in [('span_start', -1), ('span_end', 100), ('quote', 'X'),
                               ('post_sha256', 'fake'), ('source_chunk_id', 'WRONG')]:
                broken = dict(locator, **{key: value})
                self.assertTrue(self.mod.check_locator(root, broken, source), key)

    def test_valid_minimal_bundle_and_indexes(self):
        bundle = self.fixture()
        self.assertEqual([], self.mod.check_bundle(bundle))
        first = self.mod.expected_indexes(bundle['facts'], bundle['mentions'], [])
        second = self.mod.expected_indexes(list(reversed(bundle['facts'])), bundle['mentions'], [])
        self.assertEqual(first, second)
        self.assertEqual([], self.mod.check_indexes(bundle['facts'], bundle['mentions'], [], first))


if __name__ == '__main__':
    unittest.main()
