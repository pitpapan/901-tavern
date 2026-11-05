// 901 chronicle numbering uses the full runtime snapshot before prompt hiding.
function chronicleSheets901(data) {
  return Object.entries(data || {}).filter(([key,sheet])=>key.startsWith('sheet_')
    && sheet?.name==='纪要表' && /\bcode_index\b/.test(sheet.sourceData?.ddl || '')
    && sheet.content?.[0]?.includes('编码索引'));
}
function maximumChronicleCode901(sheet) {
  const column=sheet.content[0].indexOf('编码索引');
  return sheet.content.slice(1).reduce((max,row)=>{
    const match=/^AM(\d+)$/.exec(String(row[column] ?? '').trim());
    return match ? Math.max(max,Number(match[1])) : max;
  },0);
}
const formatChronicleCode901=n=>'AM'+String(n).padStart(4,'0');

export function createChronicleSequence901(data,physicalNameForSheet) {
  const sequences=new Map(chronicleSheets901(data).map(([key,sheet])=>[
    physicalNameForSheet(data,key).toLowerCase(),{max:maximumChronicleCode901(sheet)}]));
  return {
    guard(table,action,replaceConflict) {
      if(!sequences.has(table.toLowerCase()))return;
      if(action!=='INSERT' || replaceConflict)throw new Error('901旧纪要只读：新增纪要用INSERT，禁止UPDATE/DELETE/REPLACE覆盖历史。');
    },
    values(table,columns,values) {
      const seq=sequences.get(table.toLowerCase());
      if(!seq)return values;
      const index=columns.indexOf('code_index');
      if(index<0)throw new Error('901纪要INSERT须显式包含code_index列，由系统分配编号。');
      const assigned=formatChronicleCode901(++seq.max);
      const result=values.slice();result[index]="'"+assigned+"'";
      return result;
    },
  };
}

export function withChronicleSequenceNote901(data) {
  const sheets=chronicleSheets901(data);if(!sheets.length)return data;
  const result={...data};
  for(const [key,sheet] of sheets) {
    const max=maximumChronicleCode901(sheet);
    result[key]={...sheet,sourceData:{...sheet.sourceData,
      note:(sheet.sourceData.note || '')+'\n【系统编号快照】完整历史（含已隐藏纪要）最大编号'+formatChronicleCode901(max)+'，下一个'+formatChronicleCode901(max+1)+'。本批新增纪要由写入组件依次分配编号；不得重编号或覆盖旧纪要。'}};
  }
  return result;
}
