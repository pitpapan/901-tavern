export function renderRelationshipFacts(data) {
  const table=data?.sheet_relationship_facts;
  if (!table?.content?.length) throw new Error('独立关系事项表尚未加载');
  const lines=table.content.slice(1).map(row=>{
    const [id,subject,object,matter,kind,state,source,knownBy]=row;
    let detail=`${subject}对${object}，事项「${matter}」，${kind}：${state ?? '未交代'}`;
    if(kind==='借入') {
      detail=`${subject}向${object}借入${matter}；当前状态：${state ?? '未交代'}`;
      if(state==='未归还')detail+=`；${subject}尚须向${object}归还${matter}`;
      if(state==='已归还')detail+=`；${subject}已向${object}归还${matter}`;
    }
    return `事项#${id}：${detail}。来源：${source || '未交代'}。知情范围：${knownBy || '未交代，不自动共享'}。`;
  });
  return '【独立关系事项：当前记录逐项读取，阶段总结不替代本表；不同事项同时成立，私念不授予NPC知情】\n'+lines.join('\n');
}
