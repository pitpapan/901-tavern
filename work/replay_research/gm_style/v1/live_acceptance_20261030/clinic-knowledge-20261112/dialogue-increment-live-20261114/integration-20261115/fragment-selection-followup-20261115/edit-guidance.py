from pathlib import Path
p=Path('901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js');s=p.read_text(encoding='utf8')
a="selected?{schemaVersion:'gm-assertion-fragments/1',inputRef:input.inputRef,fragments:assertionFragments(input).map(({id,documentId,quote})=>({id,documentId,text:quote}))}:coordinateReference"
assert s.count(a)==1;s=s.replace(a,'selected?fragmentReference(input):coordinateReference')
a='跨片段引用选择含完整连续内容的上层片段。'
b='containerIds按范围从小到大列出实际包含该片段的候选ID；跨片段引用选择其中容纳完整quote的片段，仍须逐字唯一匹配，不能保留短片段ID却引用片段外文字。'
assert s.count(a)==1;s=s.replace(a,b);p.write_text(s,encoding='utf8')
p=Path('TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs');s=p.read_text(encoding='utf8')
a=" const instructions='\\n本次使用'+wireContract+'信息传递结构，覆盖每个原文target。返回嵌套结构{schemaVersion,contextRef,inputRef,units:[{id,status,coverage,unresolved,claims,utterances:[{claim,receptions}]}]}。coverage"
b=" const wireDescription=spanFormat==='fragments'?'返回符合response_format的单个合法JSON对象，不输出Markdown、注释、草稿或对象外文本。':'返回嵌套结构{schemaVersion,contextRef,inputRef,units:[{id,status,coverage,unresolved,claims,utterances:[{claim,receptions}]}]}。';\n const instructions='\\n本次使用'+wireContract+'信息传递结构，覆盖每个原文target。'+wireDescription+'coverage"
assert s.count(a)==1;s=s.replace(a,b);p.write_text(s,encoding='utf8')
