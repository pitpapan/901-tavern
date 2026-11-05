// Explicit fixture control on the disposable card, never part of the formal host.
const seeds901 = __SEEDS__;
for (const stage901 of [2, 3]) {
 const seedButton901 = doc.createElement('button');
 seedButton901.textContent = '仅隔离：导入第' + stage901 + '阶段合成纪要';
 panel.append(seedButton901);
 seedButton901.onclick = async () => {
  if (!valid()) return;
  seedButton901.disabled = true;
  try {
   const api = window.top.AutoCardUpdaterAPI;
   const data = structuredClone(api.exportTableAsJson());
   const key = 'sheet_ji_yao_biao';
   const expected = stage901 === 2 ? 'AM0016' : 'AM0030';
   if (data[key].content.at(-1)[1] !== expected) throw new Error('夹具起点不匹配；不导入');
   const before = Object.fromEntries(Object.entries(data).filter(([k]) => k.startsWith('sheet_')).map(([k,v]) => [k, structuredClone(v.content)]));
   const hiddenBefore = structuredClone(ctx().chatMetadata.TavernDB_ACU_ScopedConfig.flightModeByIsolationKey[''].hiddenRowIds);
   data[key].content.push(...seeds901[String(stage901)]);
   if (stage901 === 2) {
    const row = data.sheet_relationship_facts.content.find(r => String(r[0]) === '4');
    row[6] = 'AM0017：黄泉当面说明以前合作修伞'; row[7] = '御临风、黄泉、黎舟';
   }
   const ok = await api.importTableAsJson(JSON.stringify(data));
   if (!ok) throw new Error('公开导入接口返回失败');
   ctx().chatMetadata.multistage_seed = {stage:stage901, before, hiddenBefore};
   ctx().updateChatMetadata(ctx().chatMetadata);await ctx().saveChat();
   status.textContent = '第' + stage901 + '阶段合成纪要已导入；不是模型生成剧情';
  } catch (e) { status.textContent = String(e); }
 };
}
