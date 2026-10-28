"""World integration checks: content, secrecy, and preservation of resource work."""
import hashlib
import json
import runpy
import unittest
from pathlib import Path

STAGE = Path(__file__).resolve().parent
ROOT = STAGE.parents[2]

def canonical_hash(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()

class WorldAuthorProjectionTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.context = runpy.run_path(str(STAGE / 'build_candidate.py'))
        cls.records = list(cls.context['records'].values())
        cls.by_uid = {r['uid']: r for r in cls.records}
        cls.by_name = {r['name']: r for r in cls.records}

    def test_adopted_regions_and_latest_character_identity(self):
        for name in ['银月城', '洛汀岩地矿料与工艺', '白暮寒地材料与器材',
                     '远西魔法林材与特殊木材', '帝国学士与长期研习', '人物·猫音',
                     '人物·穗乃香', '人物·阿尔托莉雅·潘德拉贡', '人物·真达卡斯']:
            self.assertTrue(name in self.by_name, name)
        self.assertIn('T0前已取得帝国学士资格', self.by_name['人物·猫音']['content'])
        self.assertIn('授予机构、就读学校', self.by_name['人物·猫音']['content'])
        self.assertIn('远西的世界树', self.by_name['远西世界树及共同照护']['native']['key'])
        self.assertIn('酒屋实际经营者', self.by_uid[158137443]['content'])
        self.assertIn('13—34个月', self.by_uid[181263738]['content'])
        self.assertNotIn('具体骨灰安置及礼俗仍未定', self.by_uid[123513726]['content'])

    def test_secret_gates_and_bounded_keys(self):
        for name in ['高等精灵家传古史与知情边界', '帝都军情秘密查证条件',
                     '悠悠诅咒辨认与转送条件', '肯达后期暗桩身份', '白魔私人目标', '弃风隐藏灵性与重铸条件']:
            self.assertTrue(name in self.by_name, name)
            native = self.by_name[name]['native']
            self.assertTrue(native['disable'])
            self.assertTrue(native['constant'])
            self.assertEqual(native['key'], [])
        for uid, banned in [(1710526183, ['帝都']), (1814007050, ['帝都']), (1399227248, ['帝国', '八柱将'])]:
            for key in banned:
                self.assertNotIn(key, self.by_uid[uid]['native']['key'])

    def test_preexisting_resources_and_state_are_preserved(self):
        baseline = json.loads((STAGE / 'world-integration-baseline-20261028.json').read_text(encoding='utf-8'))
        self.assertTrue(set(baseline['uids']) <= set(self.by_uid))
        for uid, expected in baseline['resource_entries'].items():
            self.assertEqual(canonical_hash(self.by_uid[int(uid)]['native']), expected, uid)
        self.assertEqual(sorted(r['uid'] for r in self.records if r['book'] != '主持卡' and r['native']['constant'] and not r['native']['disable']), sorted(baseline['constant_uids']))
        for path, expected in baseline['protected_files'].items():
            self.assertEqual(hashlib.sha256((ROOT / path).read_bytes()).hexdigest(), expected, path)

if __name__ == '__main__':
    unittest.main()
