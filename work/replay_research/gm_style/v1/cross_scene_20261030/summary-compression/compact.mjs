// Isolated candidate: reversible structural compression, no semantic paraphrase.
import {compileStage901 as compileFull,renderStage901 as renderFull,assertStageCoverage901 as guardFull} from './stage-coverage-base-901.mjs';
const VERSION='【阶段保真压缩 v2】';
const NOTE='历史按纪要顺序读取，后续纪要与当前事项优先。私念不公开，知情只列已证获知者。空列为空串；~标注非字符串；反斜杠为JSON转义。';
const CHRONICLES='纪要（制表符分列，首行为列名）：';
const RELATIONSHIPS='独立关系（制表符分列，首行为列名）：';
const DIRECTIONS='借还方向：';
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=reason=>{const e=new Error('901阶段覆盖校验失败：'+reason+'；保留旧纪要，不提交总结或隐藏。');e.code='901_STAGE_COVERAGE';throw e};
function cell(value){
 if(typeof value!=='string')return '~'+JSON.stringify(value);
 const encoded=JSON.stringify(value).slice(1,-1);return encoded.startsWith('~')?'\\u007e'+encoded.slice(1):encoded;
}
const row=r=>r.map(cell).join('\t');
const uncell=s=>s.startsWith('~')?JSON.parse(s.slice(1)):JSON.parse('"'+s+'"');
const unrow=s=>s.split('\t').map(uncell);
function source(before,state){
 const key=Object.keys(before).find(k=>before[k]?.name==='纪要表');
 const hidden=new Set((state.hiddenRowIds||[]).map(String));
 const content=before[key].content;
 return {key,chronicles:[content[0],...content.slice(1).filter(row=>!hidden.has(String(row[0])))],relationships:before.sheet_relationship_facts.content};
}
function directions(rows){
 const col=Object.fromEntries(rows[0].map((v,i)=>[v,i]));
 return rows.slice(1).filter(r=>r[col['关系种类']]==='借入').map(r=>{
  const s=r[col['主体']],o=r[col['对象']],item=r[col['具体事项']],status=r[col['当前状态']];
  return s+'向'+o+'借入'+item+'。'+(status==='未归还'?s+'尚须向'+o+'归还'+item+'。':status==='已归还'?s+'已向'+o+'归还'+item+'。':'状态：'+status+'。');
 });
}
export function renderStage901(before,state,minimum){
 if(renderFull(before,state,minimum)===null)return null;
 const data=source(before,state);
 return [VERSION,NOTE,CHRONICLES,...data.chronicles.map(row),RELATIONSHIPS,...data.relationships.map(row),DIRECTIONS,...directions(data.relationships).map(cell)].join('\n');
}
export function decodeStage901(text){
 try{
  const lines=text.split('\n');
  if(lines[0]!==VERSION||lines[1]!==NOTE||lines[2]!==CHRONICLES)fail('压缩格式或知情说明发生改变');
  const ri=lines.indexOf(RELATIONSHIPS),di=lines.indexOf(DIRECTIONS);
  if(ri<4||di<=ri+1)fail('压缩来源分段缺失');
  const chronicles=lines.slice(3,ri).map(unrow);
  const relationships=lines.slice(ri+1,di).map(unrow);
  const loans=lines.slice(di+1).map(uncell);
  if(!chronicles.every(Array.isArray)||!relationships.every(Array.isArray)||!loans.every(x=>typeof x==='string'))fail('压缩字段结构不匹配');
  return {chronicles,relationships,directions:loans};
 }catch(e){if(e?.code==='901_STAGE_COVERAGE')throw e;fail('压缩内容无法完整解码');}
}
export function compileStage901(before,after,state,minimum){
 const keys=compileFull(before,after,state,minimum);
 if(keys.length){const sheet=after[keys[0]];sheet.content.at(-1)[sheet.content[0].indexOf('总结')]=renderStage901(before,state,minimum);}
 return keys;
}
export function assertStageCoverage901(before,after,state,minimum){
 if(!state?.enabled||!before?.sheet_relationship_facts)return guardFull(before,after,state,minimum);
 const sheet=after?.[state.bigSummarySheetKey];
 const text=sheet?.content?.at(-1)?.[sheet?.content?.[0]?.indexOf('总结')];
 if(typeof text!=='string'||!text.startsWith(VERSION))return guardFull(before,after,state,minimum);
 // Keep the approved mutation/threshold guard. Work only on a detached copy.
 const legacy=structuredClone(after);const keys=compileFull(before,legacy,state,minimum);
 if(!keys.length)return guardFull(before,after,state,minimum);
 const decoded=decodeStage901(text),expected=source(before,state);
 if(!equal(decoded.chronicles,expected.chronicles))fail('纪要原文、字段类型或顺序覆盖不足');
 if(!equal(decoded.relationships,expected.relationships))fail('独立事项、来源或知情范围覆盖不足');
 if(!equal(decoded.directions,directions(decoded.relationships)))fail('借还方向与已存关系不一致');
 // Rebuild the old guard's full representation from decoded facts, not a free summary.
 const restored=structuredClone(before);let i=1;
 const hidden=new Set((state.hiddenRowIds||[]).map(String));
 restored[expected.key].content=[decoded.chronicles[0],...before[expected.key].content.slice(1).map(row=>hidden.has(String(row[0]))?row:decoded.chronicles[i++])];
 restored.sheet_relationship_facts.content=decoded.relationships;
 legacy[keys[0]].content.at(-1)[sheet.content[0].indexOf('总结')]=renderFull(restored,state,minimum);
 return guardFull(before,legacy,state,minimum);
}
export async function compileAndSyncStage901(provider,before,after,state,minimum){
 const keys=compileStage901(before,after,state,minimum);if(!keys.length)return keys;
 if(typeof provider.replaceAllData!=='function')fail('存储组件不支持提交内同步');
 const result=await provider.replaceAllData(after);
 if(!result?.success)fail('SQLite汇编同步失败：'+String(result?.error||''));
 const actual=provider.getCurrentData();
 for(const key of Object.keys(after).filter(k=>k.startsWith('sheet_'))){
  if(!equal(actual?.[key]?.content,after[key]?.content))fail('SQLite与待提交快照不一致：'+key);
 }
 return keys;
}
