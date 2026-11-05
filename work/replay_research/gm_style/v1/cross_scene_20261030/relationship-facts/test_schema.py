import unittest,sqlite3,re
import schema

class SchemaTest(unittest.TestCase):
 def test_plugin_ddl_comment_to_header_contract(self):
  aliases=re.findall(r'^\s*\w+ TEXT[^\n]*-- (.*)$',schema.DDL,re.M)
  self.assertEqual(aliases,schema.HEADERS[1:])
 def test_independent_update_and_identity(self):
  db=sqlite3.connect(':memory:');db.executescript(schema.DDL)
  db.executemany('INSERT INTO relationship_facts VALUES (?,?,?,?,?,?,?,?)',schema.INITIAL)
  db.execute("INSERT INTO relationship_facts (subject_name,object_name,matter,relation_kind,state,source,known_by) VALUES ('黄泉','黎舟','修伞','信任','信任','新原话','在场者')")
  self.assertEqual(db.execute("SELECT state FROM relationship_facts WHERE matter='转述传闻'").fetchone()[0],'不信')
  db.execute("UPDATE relationship_facts SET state='已归还' WHERE subject_name='黄泉' AND object_name='黎舟' AND matter='青竹伞' AND relation_kind='借入'")
  self.assertEqual(db.execute("SELECT COUNT(*) FROM relationship_facts WHERE state='已归还'").fetchone()[0],1)
  with self.assertRaises(sqlite3.IntegrityError):db.execute("INSERT INTO relationship_facts (subject_name,object_name,matter,relation_kind) VALUES ('黄泉','黎舟','青竹伞','借入')")
 def test_no_future_trust_in_seed(self):
  self.assertFalse(any(r[4]=='信任' for r in schema.INITIAL))
  self.assertEqual(len(schema.INITIAL),6)

if __name__=='__main__':unittest.main()
