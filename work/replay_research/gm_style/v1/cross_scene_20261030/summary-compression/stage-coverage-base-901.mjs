// Isolated 901 candidate: lossless stage compilation, not semantic compression.
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=reason=>{const error=new Error('901阶段覆盖校验失败：'+reason+'；不提交总结或隐藏旧纪要。');error.code='901_STAGE_COVERAGE';throw error};
function columns(sheet,required){
 const header=sheet?.content?.[0];
 if(!Array.isArray(header)||!required.every(x=>header.includes(x)))fail('来源表结构不匹配');
 return Object.fromEntries(required.map(x=>[x,header.indexOf(x)]));
}
function context(before,state){
 if(!state?.enabled||!before?.sheet_relationship_facts)return null;
 const matches=Object.entries(before).filter(([,s])=>s?.name==='纪要表');
 if(matches.length!==1)fail('无法唯一定位纪要来源');
 const [chronicleKey,chronicle]=matches[0];
 const summaryKey=state.bigSummarySheetKey;
 if(!before[summaryKey])fail('找不到阶段总结表');
 const c=columns(chronicle,['row_id','编码索引','时间跨度','概览','纪要','重要对话']);
 const r=columns(before.sheet_relationship_facts,['row_id','主体','对象','具体事项','关系种类','当前状态','来源','知情范围']);
 const s=columns(before[summaryKey],['row_id','总结']);
 const hidden=new Set((state.hiddenRowIds||[]).map(String));
 const visible=chronicle.content.slice(1).filter(row=>!hidden.has(String(row[0])));
 return {chronicleKey,chronicle,summaryKey,c,r,s,visible};
}
function stageContext(before,after,state){
 const ctx=context(before,state);if(!ctx)return null;
 const old=before[ctx.summaryKey].content,now=after?.[ctx.summaryKey]?.content;
 if(!Array.isArray(now)||!equal(now.slice(0,old.length),old))fail('已有总结发生改变');
 const added=now.slice(old.length);if(!added.length)return null;
 if(added.length!==1)fail('一个阶段只允许新增一条汇编');
 if(!equal(after[ctx.chronicleKey]?.content?.slice(0,ctx.chronicle.content.length),ctx.chronicle.content))fail('旧纪要来源发生改变');
 // A stage and a simultaneous relationship update need separate commits so the
 // stage cannot silently mix before/after knowledge or loan states.
 if(!equal(after.sheet_relationship_facts?.content,before.sheet_relationship_facts.content))fail('阶段关系快照发生改变');
 return {...ctx,added:added[0]};
}
export function renderStage901(before,state,minimum){
 const ctx=context(before,state);if(!ctx)return null;
 if(!Number.isInteger(minimum)||minimum<1||ctx.visible.length<minimum)fail('写入前可见纪要尚未达到现有阶段阈值');
 const {c,r}=ctx;
 const parts=['【阶段保真汇编 v1】按来源顺序保留本阶段纪要原文，不代表所有状态仍为当前状态；后续纪要与当前独立事项承接变化。私念及未知信息仍沿各条的知情限定。'];
 for(const row of ctx.visible){
  if(!String(row[c['纪要']]||'').trim())fail('纪要正文缺失');
  parts.push('来源纪要 '+String(row[c['编码索引']])+'（行 '+String(row[0])+'）');
  for(const label of ['时间跨度','概览','纪要','重要对话'])parts.push(label+'：'+String(row[c[label]]??''));
 }
 parts.push('【本阶段结束前的独立关系快照】逐项保留；借还角色按已存主体、对象和关系种类展开，不从“借”字猜方向。后续状态以更新后的独立事项为准，知情范围只表示已证获知者。');
 for(const row of before.sheet_relationship_facts.content.slice(1)){
  const subject=String(row[r['主体']]),object=String(row[r['对象']]),item=String(row[r['具体事项']]),kind=String(row[r['关系种类']]),status=String(row[r['当前状态']]);
  const fields=['主体','对象','具体事项','关系种类','当前状态','来源','知情范围'].map(k=>k+'：'+String(row[r[k]]??'')).join('；');
  let direction='';
  if(kind==='借入'){
   direction=subject+'向'+object+'借入'+item+'；借入方：'+subject+'；借出方：'+object+'。';
   if(status==='未归还')direction+=subject+'尚须向'+object+'归还'+item+'。';
   if(status==='已归还')direction+=subject+'已向'+object+'归还'+item+'。';
  }
  parts.push('事项 '+String(row[0])+'：'+direction+fields);
 }
 return parts.join('\n');
}
export function compileStage901(before,after,state,minimum){
 const ctx=stageContext(before,after,state);if(!ctx)return [];
 // Ignore unverified free prose; the model response is still retained in the
 // request evidence. Do not append conflicting prose next to the source facts.
 ctx.added[ctx.s['总结']]=renderStage901(before,state,minimum);
 return [ctx.summaryKey];
}
export function assertStageCoverage901(before,after,state,minimum){
 const ctx=stageContext(before,after,state);if(!ctx)return false;
 const expected=renderStage901(before,state,minimum);
 if(ctx.added[ctx.s['总结']]!==expected)fail('汇编正文未逐字承接同一来源快照');
 return true;
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
