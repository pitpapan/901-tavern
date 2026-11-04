import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertRelationshipItemPreservation_ACU as check} from './relation-guard.mjs';

test('rejects the captured whole-column rewrite instead of letting it bypass REPLACE checks',()=>{
 assert.throws(()=>check(["UPDATE important_non_romance SET relation_text = '御临风:同行;掌柜:已结清旧债,仍不愿透露下一站;黎舟:合作修伞,信任其处理修伞事宜,借青竹伞未还' WHERE row_id = 1;"]),/整列/);
});

test('allows initialization explicitly limited to empty values',()=>{
 check(["UPDATE important_non_romance SET relation_text = '甲:旧识' WHERE row_id=1 AND COALESCE(relation_text, '') = '';"]);
});

test('rejects the captured cross-item update that drops the rumour judgment',()=>{
 const sql="UPDATE important_non_romance SET relation_text = REPLACE(relation_text, '黎舟:合作修伞,借青竹伞未还,尚不信其传闻', '黎舟:合作修伞,借青竹伞未还,信任其处理修伞之事') WHERE row_id = 1;";
 assert.throws(()=>check([sql]),/尚不信其传闻/);
});
test('accepts new item insertion without rewriting the existing group',()=>{
 check(["UPDATE important_non_romance SET relation_text=REPLACE(relation_text,'黎舟:','黎舟:信任其修伞,') WHERE row_id=1;"]);
});
test('accepts the actual task closure item replacement and unrelated updates',()=>{
 check(["UPDATE important_non_romance SET relation_text=REPLACE(relation_text,'御临风:送药委托尚未结案','御临风:送药委托失败结束') WHERE row_id=3;","UPDATE global_state SET cur_time='2026-02-05 00:15' WHERE row_id=1;"]);
});
test('permits preserving all old items while adding one, including quoted apostrophes',()=>{
 check(["UPDATE important_non_romance SET relation_text=REPLACE(relation_text,'A:旧识,保管O''Brien的伞','A:旧识,保管O''Brien的伞,认可手艺') WHERE row_id=1;"]);
});
