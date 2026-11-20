import test from 'node:test';
import assert from 'node:assert/strict';
import {makeAssertionInput,buildAssertionMessages,checkAssertionReply} from '../gm/assertion-extraction.js';

function fixture(text){
 const input=makeAssertionInput({stage:'source',documents:[{id:'doc',text}],targets:[{id:'turn',documentId:'doc',start:0,end:text.length}]});
 return {input,messages:buildAssertionMessages(input)};
}
function reference(messages){
 assert.equal(messages.length,3);assert.equal(messages[2].role,'user');
 const ref=JSON.parse(messages[2].content);assert.equal(ref.schemaVersion,'gm-assertion-coordinates/1');return ref;
}
function checkDocument(doc,text){
 assert.equal(doc.length,text.length);let pos=0;
 for(const block of doc.blocks){
  assert.equal(block.start,pos);assert.ok(block.end-block.start<=32);
  for(const [start,end,quote] of block.cells){assert.equal(start,pos);assert.equal(text.slice(start,end),quote);assert.equal(end-start,quote.length);pos=end;}
  assert.equal(block.end,pos);
 }
 assert.equal(pos,text.length);assert.equal(doc.blocks.flatMap(b=>b.cells).map(c=>c[2]).join(''),text);
}

test('reception-purpose references provide exact reusable target and line spans without normalizing source',()=>{
 for(const text of ['甲说：“好。”\n\n乙点头。\n','😀甲\r\n\t乙  \n','同句。\n同句。']){
  const {input}=fixture(text),before=structuredClone(input),normal=buildAssertionMessages(input),messages=buildAssertionMessages(input,{purpose:'reception'}),ref=reference(messages);
  assert.deepEqual(input,before);assert.equal(messages[1].content,normal[1].content);
  assert.deepEqual(ref.documents[0].blocks,reference(normal).documents[0].blocks);
  assert.deepEqual(ref.targets,[{targetId:'turn',span:{documentId:'doc',start:0,end:text.length,quote:text}}]);
  assert.equal(ref.documents[0].lines.map(s=>s.quote).join(''),text);
  for(const span of ref.documents[0].lines){assert.equal(text.slice(span.start,span.end),span.quote);assert.equal(span.end-span.start,span.quote.length);}
  assert.ok(messages[0].content.startsWith('只识别与信息传递相关的言说'));
  assert.ok(normal[0].content.startsWith('抽取目标原文实际断言的全部事实'));
 }
});
test('short copy ranges partition punctuation and retain every UTF-16 unit',()=>{
 const text='甲停步，侧耳听两人交谈；\r\n😀乙答：“不清楚。”  重复，重复，';
 const {input}=fixture(text),doc=reference(buildAssertionMessages(input,{purpose:'reception'})).documents[0];
 assert.equal(doc.segments.map(s=>s.quote).join(''),text);
 for(const s of doc.segments){assert.equal(text.slice(s.start,s.end),s.quote);assert.equal(s.end-s.start,s.quote.length);}
 assert.ok(doc.segments.some(s=>s.quote==='侧耳听两人交谈；'));
 assert.equal(doc.segments.filter(s=>s.quote.includes('重复')).length,2);
 assert.equal(reference(buildAssertionMessages(input)).documents[0].segments,undefined);
});
test('coordinate instructions and deterministic data preserve original input and zero-based end-exclusive bounds',()=>{
 const f=fixture('甲说：“好。”'),before=structuredClone(f.input),ref=reference(f.messages);
 for(const text of ['从0开始','左闭右开','UTF-16代码单元','JSON解码后的','不自动修正坐标'])assert.ok(f.messages[0].content.includes(text),text);
 assert.equal(f.messages[1].content,JSON.stringify(f.input));assert.equal(ref.inputRef,f.input.inputRef);
 assert.deepEqual(buildAssertionMessages(f.input),f.messages);assert.deepEqual(f.input,before);
 assert.deepEqual(ref.documents[0].blocks[0].cells,[[0,1,'甲'],[1,2,'说'],[2,3,'：'],[3,4,'“'],[4,5,'好'],[5,6,'。'],[6,7,'”']]);
 checkDocument(ref.documents[0],f.input.documents[0].text);
});
test('decoded quotes, backslashes, tabs, spaces and CRLF remain separate original units',()=>{
 const text=JSON.parse('"甲\\\"\\\\\\t \\r\\n乙"'),f=fixture(text),doc=reference(f.messages).documents[0];
 assert.deepEqual(doc.blocks[0].cells,[[0,1,'甲'],[1,2,'"'],[2,3,'\\'],[3,4,'\t'],[4,5,' '],[5,6,'\r'],[6,7,'\n'],[7,8,'乙']]);checkDocument(doc,text);
});
test('astral and combining characters use UTF-16 offsets without visual-character normalization',()=>{
 const text='😀e\u0301乙',doc=reference(fixture(text).messages).documents[0];
 assert.deepEqual(doc.blocks[0].cells,[[0,2,'😀'],[2,3,'e'],[3,4,'\u0301'],[4,5,'乙']]);checkDocument(doc,text);
});
test('long references retain global offsets and do not split a surrogate pair across blocks',()=>{
 const text='甲'.repeat(31)+'😀'+'乙'.repeat(34),doc=reference(fixture(text).messages).documents[0];
 checkDocument(doc,text);assert.equal(doc.blocks.length,3);
 assert.equal(doc.blocks[0].end,31);assert.deepEqual(doc.blocks[1].cells[0],[31,33,'😀']);assert.equal(doc.blocks[2].start,63);
});
test('repeated quotes and separate documents keep their own positions; changed source gets a new binding',()=>{
 const input=makeAssertionInput({stage:'source',documents:[{id:'first',text:'甲见甲。'},{id:'second',text:'甲。'}],targets:[{id:'turn',documentId:'first',start:2,end:4}]});
 const ref=reference(buildAssertionMessages(input));assert.deepEqual(ref.documents.map(d=>d.documentId),['first','second']);
 assert.deepEqual(ref.documents[0].blocks[0].cells.filter(c=>c[2]==='甲'),[[0,1,'甲'],[2,3,'甲']]);
 assert.deepEqual(ref.documents[1].blocks[0].cells[0],[0,1,'甲']);
 const changed=fixture('前甲见甲。');assert.notEqual(reference(changed.messages).inputRef,ref.inputRef);
});
test('coordinates never repair replies: shifted, block-local, inclusive-end or forged quotes still fail',()=>{
 const text='甲'.repeat(32)+'乙说好。',f=fixture(text);reference(f.messages);
 const span=(start,end)=>({documentId:'doc',start,end,quote:text.slice(start,end)});
 const reply={schemaVersion:'gm-assertion-output/1',inputRef:f.input.inputRef,units:[{id:'turn',status:'extracted',claims:[{id:'speech',type:'utterance',args:{speaker:'乙',content:'好'},argumentSpans:{speaker:span(32,33),content:span(34,35)},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:span(32,36)}],unresolved:[]}]};
 assert.equal(checkAssertionReply(reply,f.input).ok,true);
 for(const mutate of [c=>{c.argumentSpans.speaker.start++;c.argumentSpans.speaker.end++;},c=>{c.anchor.start=0;c.anchor.end=4;},c=>c.argumentSpans.content.end--,c=>c.argumentSpans.content.quote='错']){
  const bad=structuredClone(reply);mutate(bad.units[0].claims[0]);const before=structuredClone(bad);
  assert.equal(checkAssertionReply(bad,f.input).ok,false);assert.deepEqual(bad,before);
 }
});
test('a real repeated substring is not certified as the right semantic occurrence',()=>{
 const f=fixture('甲看乙，乙说好。');reference(f.messages);
 const span=(start,end)=>({documentId:'doc',start,end,quote:f.input.documents[0].text.slice(start,end)});
 const reply={schemaVersion:'gm-assertion-output/1',inputRef:f.input.inputRef,units:[{id:'turn',status:'extracted',claims:[{id:'speech',type:'utterance',args:{speaker:'乙',content:'好'},argumentSpans:{speaker:span(2,3),content:span(6,7)},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:span(4,8)}],unresolved:[]}]};
 const result=checkAssertionReply(reply,f.input);assert.equal(result.ok,true);assert.equal(result.semanticCompletenessVerified,false);assert.equal(result.canApprove,false);
});
