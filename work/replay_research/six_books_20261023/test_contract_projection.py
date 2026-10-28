"""Execute the real projector; verify paired-source provenance and scope."""
import json
import runpy
import unittest
from pathlib import Path

STAGE = Path(__file__).resolve().parent
ROOT = STAGE.parents[2]

class ProjectionTest(unittest.TestCase):
    def test_two_packages_keep_bundle_passive_separate_from_spell_learning(self):
        context = runpy.run_path(str(STAGE / 'build_candidate.py'))
        bundle = 'candidate-901-magic-bundle-de9b5c40b4fa2353'
        self.assertIn(bundle, set(context['candidate_contracts']))
        self.assertEqual(len(context['candidate_contracts']), 12)
        runtime = context['candidate_runtime'][bundle]
        self.assertEqual(runtime['operations'], [])
        self.assertNotIn('learning', runtime)
        self.assertNotIn(bundle, context['candidate_actions'])
        self.assertEqual(len(context['candidate_actions']), 10)
        record = next(r for r in context['records'].values() if r.get('resourceContract',{}).get('id') == bundle)
        self.assertTrue(record['native']['disable'])
        self.assertIsNone(record['resourceContract']['learning'])
        self.assertIn('实际取得记录', record['content'])

    def test_every_catalog_item_projects_its_exact_execution_contract(self):
        context = runpy.run_path(str(STAGE / 'build_candidate.py'))
        contracts = {d['id']: d for p in (ROOT.parent/'901-resource-authoring-kit/resources/execution').glob('*.rule.json') for d in [json.loads(p.read_text())]}
        entries = {e['resourceContract']['id']: e for e in context['plan']['entries'] if e.get('resourceContract')}
        maintained={id:entry for id,entry in entries.items() if id not in context['candidate_contracts']}
        self.assertEqual(set(maintained), set(contracts))
        self.assertEqual(set(entries)-set(maintained),set(context['candidate_contracts']))
        for id, doc in context['contracts'].items():
            meta = entries[id]['resourceContract']
            self.assertEqual(meta['version'], doc['version'])
            self.assertEqual(meta['reading'], doc['reading'])
            self.assertEqual(meta['verification'], doc['verification'])
            record = next(r for r in context['records'].values() if r['uid'] == entries[id]['uid'])
            self.assertEqual(record['native']['extensions']['901_resource_contract'], meta)
            self.assertIn(id, record['content'])
            if id in context['candidate_contracts']:
                self.assertEqual(meta['adoptionStatus'],'candidate')
                self.assertTrue(record['native']['disable'])
                self.assertIn('实际取得记录',record['content'])
            if doc['definition'].get('template'):
                self.assertTrue(record['native']['disable'])
                self.assertIn('不能覆盖入都T0', record['content'])

if __name__ == '__main__': unittest.main()
