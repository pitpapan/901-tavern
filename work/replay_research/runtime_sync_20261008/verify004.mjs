import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=process.cwd(), app=String.raw`D:\github\sillyTavern`;
const stage=path.join(root,'work/replay_research/runtime_sync_20261008');
const out=path.join(root,'output/replay_tavern/world_sync_20261008_candidate');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const card=read(path.join(out,'import/901_帝都主持.card.json'));
const native=read(path.join(out,'import/901_帝都重玩_M1_20261008.json'));
const baseline=read(path.join(root,'output/replay_tavern/world_sync_20261007_candidate/import/901_帝都重玩_M1_20261007.json'));
const oldCard=read(path.join(root,'output/replay_tavern/world_sync_20261007_candidate/import/901_帝都主持.card.json'));
const edits=read(path.join(stage,'projection_edits.json')).changes;
const changed=new Set(edits.map(e=>String(e.uid)));
const {TavernCardValidator}=await import(pathToFileURL(path.join(app,'src/validator/TavernCardValidator.js')));
const validator=new TavernCardValidator(card);assert.ok(validator.validateV2(),validator.lastValidationError);
const src=fs.readFileSync(path.join(app,'public/scripts/world-info.js'),'utf8');
const start=src.indexOf('export function convertCharacterBook('), end=src.indexOf('export function setWorldInfoButtonClass(',start);assert.ok(start>=0&&end>start);
const convert=new Function('newWorldInfoEntryTemplate','world_info_position','DEFAULT_DEPTH','DEFAULT_WEIGHT','world_info_logic','extension_prompt_roles',src.slice(start,end).replace(/^export /,'')+'\nreturn convertCharacterBook;')({}, {before:0,after:1},4,100,{AND_ANY:0},{SYSTEM:0});
const converted=convert(structuredClone(card.data.character_book));
assert.deepEqual(Object.keys(native.entries).sort(),Object.keys(baseline.entries).sort());
for(const [uid,e] of Object.entries(native.entries)){
 for(const [k,v] of Object.entries(e))assert.deepEqual(converted.entries[uid][k],v,`${uid}.${k}`);
 if(!changed.has(uid))assert.deepEqual(e,baseline.entries[uid]);
 else {
  const clean=x=>{const y=structuredClone(x);delete y.content;delete y.extensions['901_replay'];return y;};
  assert.deepEqual(clean(e),clean(baseline.entries[uid]),`loading changed ${uid}`);
 }
}
for(const key of ['description','personality','scenario','first_mes','mes_example','system_prompt','post_history_instructions','alternate_greetings'])assert.deepEqual(card.data[key],oldCard.data[key],key);
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const protectedFiles=read(path.join(stage,'protected_before.json'));
for(const f of protectedFiles)assert.equal(digest(path.join(root,f.path)),f.sha256,f.path);
assert.equal(digest(path.join(out,'import/文风_prompt.json')),digest(path.join(root,'output/replay_tavern/world_sync_20261007_candidate/import/文风_prompt.json')));
const projected=fs.readFileSync(path.join(stage,'projected_entries.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
let refCount=0;
for(const [i,edit] of edits.entries()){
 const e=native.entries[edit.uid];assert.equal(e.content,edit.content);assert.equal(e.extensions['901_replay'].source_line,i+1);assert.equal(projected[i].id,edit.source_id);assert.equal(projected[i].content,e.content);
 for(const ref of edit.source_refs){
  const ls=fs.readFileSync(path.isAbsolute(ref.path)?ref.path:path.join(root,ref.path),'utf8').split(/\r?\n/);assert.ok(ref.line>0&&ref.line<=ls.length,ref.path+':'+ref.line);
  if(ref.id&&ref.path.endsWith('.jsonl')){const row=JSON.parse(ls[ref.line-1]);assert.equal(String(row.id||row.entity_id),String(ref.id));}refCount++;
 }
}
const report={checked_on:'2026-10-08',passed:true,target_version:read(path.join(app,'package.json')).version,character_card:'TavernCardValidator.validateV2 passed',worldbook:'All native fields match local convertCharacterBook output',entries:Object.keys(native.entries).length,changed_existing:edits.length,added:0,uids_and_loading_settings_preserved:130,unchanged_entries:130-edits.length,source_refs_checked:refCount,protected_files_unchanged:protectedFiles.length,host_body_unchanged:true,style_unchanged:true,actual_runtime_verified:false,model_calls:0,scope:'004 files and changed-source locators only; no UI import, model run or full canon audit'};
fs.writeFileSync(path.join(stage,'format_verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
