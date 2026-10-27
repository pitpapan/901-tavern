"""Review known AND/OR qualifications against their maintained reading clauses."""
import json
import unittest
from pathlib import Path

KIT=Path(__file__).resolve().parents[4]/'901-resource-authoring-kit'

class QualificationTest(unittest.TestCase):
    def test_explicit_dual_qualifications_are_not_a_literal_sentence_or_a_double_dp_sum(self):
        docs={d['identity']['name']:d for p in (KIT/'resources/execution').glob('*.rule.json') for d in [json.loads(p.read_text())]}
        for name, expected in [('杰斯的幻象',['幻术','心灵']),('幻雾术',['咒法','幻术']),('狂战士之魂',['变化','诅咒']),('防护能量结界',['防护','结界'])]:
            with self.subTest(name=name):
                definition=docs[name]['definition']
                self.assertEqual(definition['subskills'],expected)
                self.assertTrue(definition['requiresAllSchools'])
        eye=docs['魔眼工程']['definition']
        self.assertEqual(eye['subskills'],['附魔','变化'])
        self.assertFalse(eye['requiresAllSchools'])
        self.assertTrue(eye['schoolChoiceAtLearning'])

if __name__=='__main__':unittest.main()
