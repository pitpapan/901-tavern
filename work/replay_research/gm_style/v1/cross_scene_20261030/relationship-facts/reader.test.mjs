import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRelationshipFacts } from './reader.mjs';
const headers=['row_id','主体','对象','具体事项','关系种类','当前状态','来源','知情范围'];
const input={sheet_relationship_facts:{content:[headers,
 [1,'黄泉','黎舟','转述传闻','可信度','不信','AM0012','御临风、黄泉'],
 [2,'黄泉','黎舟','修伞','信任','信任','本轮原话','御临风、黄泉、黎舟'],
 [3,'黄泉','黎舟','青竹伞','借入','未归还','AM0005','御临风、黄泉、黎舟']]}};
test('different matters survive direct reading even with no chronicle or summary',()=>{
 const text=renderRelationshipFacts(input);
 assert.match(text,/转述传闻.*不信/);assert.match(text,/修伞.*信任/);
});
test('loan direction and obligation are derived from independent columns',()=>{
 const text=renderRelationshipFacts(input);
 assert.match(text,/黄泉向黎舟借入青竹伞/);assert.match(text,/黄泉尚须向黎舟归还青竹伞/);
 const returned=structuredClone(input);returned.sheet_relationship_facts.content[3][5]='已归还';
 assert.match(renderRelationshipFacts(returned),/黄泉已向黎舟归还青竹伞/);
 assert.doesNotMatch(renderRelationshipFacts(returned),/尚须/);
});
test('private beliefs retain attribution and do not become shared facts',()=>{
 const data={sheet_relationship_facts:{content:[headers,[1,'御临风','黎舟','消息可靠性','私人怀疑','存疑','玩家[]','仅御临风；未告知NPC']]}};
 assert.match(renderRelationshipFacts(data),/仅御临风；未告知NPC/);
});
