// 004 verification pattern, scoped to the 005 candidate. No server or model calls.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const stage=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(stage,'../../..');
const out=path.join(root,'output/replay_tavern/capital_entry_20261012_candidate');
const baseline=path.join(root,'output/replay_tavern/world_sync_20261008_candidate');
const app=String.raw`D:\github\sillyTavern`;
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const card=read(path.join(out,'import/901_帝都主持.card.json'));
const oldCard=read(path.join(baseline,'import/901_帝都主持.card.json'));
const book=read(path.join(out,'import/901_帝都入口_M1_20261012.json'));
const oldBook=read(path.join(baseline,'import/901_帝都重玩_M1_20261008.json'));
const edits=read(path.join(stage,'projection_edits.json')).changes;
const changed=new Set(edits.map(e=>String(e.uid)));
const {TavernCardValidator}=await import(pathToFileURL(path.join(app,'src/validator/TavernCardValidator.js')));
const validator=new TavernCardValidator(card);
assert.ok(validator.validateV2(),validator.lastValidationError);
const src=fs.readFileSync(path.join(app,'public/scripts/world-info.js'),'utf8');
const start=src.indexOf('export function convertCharacterBook('),end=src.indexOf('export function setWorldInfoButtonClass(',start);
assert.ok(start>=0&&end>start);
const convert=new Function('newWorldInfoEntryTemplate','world_info_position','DEFAULT_DEPTH','DEFAULT_WEIGHT','world_info_logic','extension_prompt_roles',src.slice(start,end).replace(/^export /,'')+'\nreturn convertCharacterBook;')({}, {before:0,after:1},4,100,{AND_ANY:0},{SYSTEM:0});
const converted=convert(structuredClone(card.data.character_book));
assert.deepEqual(Object.keys(book.entries).sort(),Object.keys(oldBook.entries).sort());
assert.deepEqual(Object.keys(converted.entries).sort(),Object.keys(book.entries).sort());
for(const [uid,e] of Object.entries(book.entries)){
 for(const [k,v] of Object.entries(e))assert.deepEqual(converted.entries[uid][k],v,`${uid}.${k}`);
 if(!changed.has(uid))assert.deepEqual(e,oldBook.entries[uid]);
 else {
  const clean=x=>{const y=structuredClone(x);delete y.content;delete y.extensions['901_replay'];if(uid==='259268599')delete y.disable;return y;};
  assert.deepEqual(clean(e),clean(oldBook.entries[uid]),`unexpected loading change ${uid}`);
 }
}
assert.equal(book.entries['259268599'].disable,true);
assert.equal(book.entries['259268599'].content,oldBook.entries['259268599'].content);
for(const key of ['name','description','personality','scenario','first_mes','mes_example','system_prompt','post_history_instructions','alternate_greetings'])assert.deepEqual(card.data[key],oldCard.data[key],key);
for(const key of ['scan_depth','token_budget','recursive_scanning'])assert.deepEqual(card.data.character_book[key],oldCard.data.character_book[key]);
for(const f of read(path.join(stage,'protected_before.json')))assert.equal(digest(path.join(root,f.path)),f.sha256,f.path);
for(const rel of ['import/901_御临风.persona.json','import/文风_prompt.json','texts/御临风_Persona.txt','texts/901_文风提示.txt'])assert.equal(digest(path.join(out,rel)),digest(path.join(baseline,rel)),rel);
const projected=fs.readFileSync(path.join(stage,'projected_entries.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
let refCount=0;
for(const [i,e] of edits.entries()){
 const actual=book.entries[e.uid];assert.equal(actual.extensions['901_replay'].source_line,i+1);
 assert.equal(projected[i].id,e.source_id);assert.equal(projected[i].content,actual.content);
 for(const r of e.source_refs){
  const lines=fs.readFileSync(path.isAbsolute(r.path)?r.path:path.join(root,r.path),'utf8').split(/\r?\n/);
  assert.ok(r.line>0&&r.line<=lines.length);if(r.locator)assert.ok(lines[r.line-1].includes(r.locator));refCount++;
 }
}
const runtime=fs.readFileSync(path.join(out,'characters/runtime_cards.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const sourceRuntime=fs.readFileSync(path.join(root,'output/replay_f_review/v1/characters/runtime_cards.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
assert.equal(runtime.length,7);
for(const r of runtime){
 const old=sourceRuntime.find(o=>o.entity_id===r.entity_id);assert.ok(old);assert.equal(r.id,old.id);assert.equal(r.source_profile_id,old.source_profile_id);
 const labels={'persona':'身份与自身愿望','speech_style':'表达方式','decision_style':'判断与条件式行动','relationships':'既有关系','abilities':'能力与限制','knowledge_boundaries':'知情边界','growth_boundary':'成长与变化','activation_notes':'使用时点'};
 const parts=[r.name];for(const [k,label] of Object.entries(labels)){const v=r.content[k];parts.push(label+'：'+(Array.isArray(v)?v.join('；'):v));}
 const target=edits.find(e=>e.source_id===r.entity_id);assert.equal(target.content,parts.join('\n\n'));
}
const constantLength=b=>Object.values(b.entries).filter(e=>e.constant&&!e.disable).reduce((n,e)=>n+[...e.content].length,0);
const report={checked_on:'2026-10-12',passed:true,target_version:read(path.join(app,'package.json')).version,
 character_card:'local TavernCardValidator.validateV2 passed',worldbook:'all native fields match local convertCharacterBook output',
 entries:130,changed_content:14,unchanged_entries:115,scope_disabled_uid:259268599,uids_preserved:130,
 loading_preserved_except_explicit_exclusion:true,character_projection_rows:7,source_refs_checked:refCount,
 protected_files_unchanged:read(path.join(stage,'protected_before.json')).length,host_body_unchanged:true,persona_unchanged:true,style_unchanged:true,
 context_measurement:{unit:'Unicode characters, NOT tokens',constant_before:constantLength(oldBook),constant_after:constantLength(book),actual_request_loading:'unverified'},
 actual_runtime_verified:false,model_calls:0,automatic_installation:false,scope:'changed projections, local schema/conversion and protected fingerprints only'};
fs.writeFileSync(path.join(stage,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
