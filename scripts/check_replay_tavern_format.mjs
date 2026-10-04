import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=process.argv[2] || String.raw`D:\github\sillyTavern`;
const out=path.join(root,'output/replay_tavern/v1');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));
const card=read(path.join(out,'import/901_帝都主持.card.json'));
const manifest=read(path.join(out,'manifest.json'));
const {TavernCardValidator}=await import(pathToFileURL(path.join(app,'src/validator/TavernCardValidator.js')));
const validator=new TavernCardValidator(card);assert.ok(validator.validateV2(),validator.lastValidationError);
const source=fs.readFileSync(path.join(app,'public/scripts/world-info.js'),'utf8');
const start=source.indexOf('export function convertCharacterBook(');
const end=source.indexOf('export function setWorldInfoButtonClass(',start);
assert.ok(start>=0 && end>start);
const body=source.slice(start,end).replace(/^export /,'');
const convert=new Function('newWorldInfoEntryTemplate','world_info_position','DEFAULT_DEPTH','DEFAULT_WEIGHT','world_info_logic','extension_prompt_roles',body+'\nreturn convertCharacterBook;')({}, {before:0,after:1},4,100,{AND_ANY:0},{SYSTEM:0});
const converted=convert(structuredClone(card.data.character_book));
const native=read(path.join(out,'optional/901_帝都重玩_T0_v1.json'));
assert.equal(Object.keys(converted.entries).length,manifest.counts.embedded_entries);assert.equal(Object.keys(native.entries).length,manifest.counts.embedded_entries);
for(const [id,e] of Object.entries(native.entries)){
 for(const [k,v] of Object.entries(e))assert.deepEqual(converted.entries[id][k],v,`${id}.${k}`);
 assert.equal(e.preventRecursion,true);assert.equal(e.excludeRecursion,true);assert.equal(e.matchWholeWords,false);
 if(!e.disable && !e.constant)assert.ok(e.key.length>0);
 assert.ok(e.key.every(k=>k.length>=2));
}
const persona=read(path.join(out,'import/901_御临风.persona.json'));
const original=read(path.join(root,'output/replay_f_review/v1/persona/yulinfeng_persona.json'));
const keys=Object.keys(persona.personas);assert.equal(keys.length,1);assert.equal(persona.personas[keys[0]],'御临风');
assert.equal(persona.persona_descriptions[keys[0]].description,original.persona_text);assert.equal(persona.default_persona,null);
const refs=read(path.join(out,'author/entry_sources.json'));
assert.equal(refs.entry_sources.length,manifest.counts.embedded_entries);
const files=new Map();
for(const ref of [...refs.entry_sources,...refs.omitted]){
 if(!files.has(ref.source_file))files.set(ref.source_file,fs.readFileSync(path.join(root,ref.source_file),'utf8').trim().split(/\r?\n/).map(JSON.parse));
 const row=files.get(ref.source_file)[ref.source_line-1];assert.ok(row);assert.equal(row.entity_id||row.id,ref.source_id);
}
const constants=card.data.character_book.entries.filter(e=>e.enabled&&e.constant);
assert.equal(constants.length,manifest.counts.enabled_constant);assert.ok(constants.some(e=>e.content.startsWith('谏山黄泉')));assert.ok(constants.some(e=>e.content.startsWith('卡西乌斯·布莱特')));
const report={checked_on:process.argv[3] || 'date_not_supplied',passed:true,target_version:read(path.join(app,'package.json')).version,character_card:'local TavernCardValidator.validateV2 passed',worldbook:`All emitted native fields match local convertCharacterBook output for all ${manifest.counts.embedded_entries} entries`,persona:'Native backup shape; exact original persona_text retained',source_mapping:`${refs.entry_sources.length} exports and ${refs.omitted.length} omitted-source locators resolve to matching IDs`,scope:'F4 files only; no full-source audit, frontend import, API request or model play test',counts:manifest.counts};
fs.writeFileSync(path.join(out,'author/format_check.json'),JSON.stringify(report,null,2)+'\n');
manifest.verification=report;fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const archiveModule=await import(pathToFileURL(path.join(app,'node_modules/archiver/index.js')));
const archiver=archiveModule.default;
await new Promise((resolve,reject)=>{
 const output=fs.createWriteStream(path.join(path.dirname(out),'901_帝都重玩_F4_v1.zip'));
 const archive=archiver('zip',{zlib:{level:6}});
 output.on('close',resolve);output.on('error',reject);archive.on('error',reject);
 archive.pipe(output);archive.directory(out,'901_帝都重玩_F4_v1');archive.finalize();
});
console.log(JSON.stringify(report,null,2));