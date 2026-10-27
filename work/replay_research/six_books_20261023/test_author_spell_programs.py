import unittest
import json,tempfile,contextlib,io
from pathlib import Path
from unittest.mock import patch
import author_spell_programs as author
from author_spell_programs import parse_schools,parse_components


class SchoolParsing(unittest.TestCase):
    def test_contract_owned_program_is_never_rewritten_by_legacy_author(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'owned.rule.json'
            raw={'identity':{'name':'恐惧术','category':'spell'},'authoring':{'executionSource':'contract'},'definition':{'programs':{'cast':{'recipe':{'id':'reviewed-contract'}}}}}
            path.write_text(json.dumps(raw))
            before=path.read_bytes()
            with patch.object(author,'DEST',Path(directory)),contextlib.redirect_stdout(io.StringIO()):author.main()
            self.assertEqual(path.read_bytes(),before)

    def test_new_program_revision_survives_older_shared_component_stamp(self):
        names = {'安定心神': '2026-10-25.3', '振奋': '2026-10-25.2', '飞行术': '2026-10-25.5', '元素诅咒': '2026-10-25.3', '镜枪水箭': '2026-10-25.1', '龙翔术': '2026-10-25.1', '灼热之痛':'2026-10-25.1', '刺目光箭':'2026-10-25.1', '奥术冲击':'2026-10-25.1', '冰锥术':'2026-10-25.1', '龙息术':'2026-10-25.1', '水之抚慰':'2026-10-25.1'}
        selected = [(p, json.loads(p.read_text())) for p in author.DEST.glob('*.rule.json')]
        selected = [(p, d) for p, d in selected if d['identity']['name'] in names]
        self.assertEqual(len(selected), len(names))
        with tempfile.TemporaryDirectory() as directory:
            for path, doc in selected: (Path(directory)/path.name).write_text(json.dumps(doc))
            with patch.object(author, 'DEST', Path(directory)), contextlib.redirect_stdout(io.StringIO()): author.main()
            for path, doc in selected:
                output = json.loads((Path(directory)/path.name).read_text())
                self.assertEqual(output['version'], names[doc['identity']['name']])

    def test_dismissal_index_does_not_advertise_cast_resistance_or_immunity_steps(self):
        doc=json.loads((author.DEST/'85670628fcf1.rule.json').read_text())
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'curse.rule.json';path.write_text(json.dumps(doc))
            with patch.object(author,'DEST',Path(directory)),contextlib.redirect_stdout(io.StringIO()):author.main()
            action=next(x for x in json.loads(path.read_text())['actions'] if x['operation']=='end')
            self.assertEqual(action['resistanceModes'],[])
            self.assertEqual(action['immunityLifecycles'],[])
            self.assertEqual(action['targetMode'],'selected')

    def test_target_policies_survive_authoring_and_are_exposed_to_classifier(self):
        with tempfile.TemporaryDirectory() as directory:
            for name in ['19c3c58f938a.rule.json','04f0445862d8.rule.json']:
                (Path(directory)/name).write_bytes((author.DEST/name).read_bytes())
            with patch.object(author,'DEST',Path(directory)),contextlib.redirect_stdout(io.StringIO()):author.main()
            for name,key in [('19c3c58f938a.rule.json','targetAllocation'),('04f0445862d8.rule.json','targetProgression')]:
                doc=json.loads((Path(directory)/name).read_text())
                self.assertEqual(doc['actions'][0][key],doc['definition']['programs']['cast'][key])
                self.assertEqual(doc['unresolvedRules'],[])
                self.assertTrue(doc['adoptedDecisions'])

    def test_explicit_component_exemptions_are_not_positive_requirements(self):
        self.assertEqual(parse_components('D 1、C 3 魔力；无语言、姿势成分。'), ['focus'])
        self.assertEqual(parse_components('3 魔力；语言、姿势。'), ['posture', 'language', 'focus'])
    def test_dual_qualifications_and_single_roll_are_distinct(self):
        self.assertEqual(parse_schools('幻术＋惑控／心灵双专业，神秘·幻术或神秘·心灵取最贴切一项。'), (['幻术', '心灵'], True))
        self.assertEqual(parse_schools('变化＋诅咒；两子技能均须具备学习资格，同次施法只取一个最贴切子技能。'), (['变化', '诅咒'], True))
        self.assertEqual(parse_schools('防护＋结界／两子技能均需资格，同次检定只加一个。'), (['防护', '结界'], True))

    def test_alternative_school_is_not_a_fictitious_subskill_or_dual_requirement(self):
        self.assertEqual(parse_schools('附魔或变化／相应子技能；学习时选定其中一系。'), (['附魔', '变化'], False))
        self.assertEqual(parse_schools('预言／探知；神秘·预言。'), (['预言'], False))
        self.assertEqual(parse_schools('结界／结界；合法的结界版独立于死灵版。'), (['结界'], False))


if __name__ == '__main__':
    unittest.main()
