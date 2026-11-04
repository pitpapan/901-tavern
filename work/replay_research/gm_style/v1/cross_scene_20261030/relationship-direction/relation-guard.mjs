// Isolated candidate: reject the observed multi-item REPLACE loss before commit.
// This is not a general SQL validator or a semantic proof that a single-item change is true.
export function assertRelationshipItemPreservation_ACU(statements) {
  for (const statement of statements) {
    if (!/^\s*UPDATE\s+important_non_romance\s+SET\b/i.test(statement)) continue;
    if (/\brelation_text\s*=\s*'/i.test(statement)
        && !/\bWHERE\s+row_id\s*=\s*\d+\s+AND\s+COALESCE\s*\(\s*relation_text\s*,\s*''\s*\)\s*=\s*''\s*;?\s*$/i.test(statement)) {
      throw new Error('[901关系分项校验] 已有关系不能整列覆盖。本批尚未写入。请用REPLACE只改同事项的一个原文分项，新事项在对象名前缀后新增。空值初始化可用 WHERE row_id=实际编号 AND COALESCE(relation_text,\'\')=\'\'。');
    }
    const calls = statement.matchAll(/\bREPLACE\s*\(\s*relation_text\s*,\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'\s*\)/gi);
    for (const call of calls) {
      const oldText = call[1].replace(/''/g, "'");
      const newText = call[2].replace(/''/g, "'");
      const oldItems = oldText.split(/[,;]/).filter(Boolean);
      if (oldItems.length < 2) continue;
      const removed = oldItems.filter(item => !newText.includes(item));
      if (!removed.length) continue;
      const message = `[901关系分项校验] 跨分项REPLACE将删除原记录：${removed.join('；')}。本批尚未写入。新事项请在对象名前缀后新增；确已改变的同事项只替换一个原文分项，保留其他事项。`;
      console.warn(message);
      throw new Error(message);
    }
  }
}
