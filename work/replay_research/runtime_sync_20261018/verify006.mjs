// Scoped static verification; uses local ST schema/conversion, no server/model calls.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const stage=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(stage,'../../..');
const out=path.join(root,'output/replay_tavern/story_guidance_20261018_candidate');
const baseline=path.join(root,'output/replay_tavern/capital_entry_20261012_candidate');
const app=String.raw`D:\github\sillyTavern`;
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const raw=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const card=read(path.join(out,'import/901_帝都主持.card.json'));
const oldCard=read(path.join(baseline,'import/901_帝都主持.card.json'));
const book=read(path.join(out,'import/901_剧情向主持_M1_20261018.json'));
const oldBook=read(path.join(baseline,'import/901_帝都入口_M1_20261012.json'));
const edits=read(path.join(stage,'projection_edits.json')).changes;
const changed=new Set(edits.map(e=>String(e.uid)));
const {TavernCardValidator}=await import(pathToFileURL(path.join(app,'src/validator/TavernCardValidator.js')));
const validator=new TavernCardValidator(card);
assert.ok(validator.validateV2(),validator.lastValidationError);
const src=raw(path.join(app,'public/scripts/world-info.js'));
const start=src.indexOf('export function convertCharacterBook('),end=src.indexOf('export function setWorldInfoButtonClass(',start);
assert.ok(start>=0&&end>start);
const convert=new Function('newWorldInfoEntryTemplate','world_info_position','DEFAULT_DEPTH','DEFAULT_WEIGHT','world_info_logic','extension_prompt_roles',src.slice(start,end).replace(/^export /,'')+'\nreturn convertCharacterBook;')({}, {before:0,after:1},4,100,{AND_ANY:0},{SYSTEM:0});
const converted=convert(structuredClone(card.data.character_book));
assert.deepEqual(Object.keys(book.entries).sort(),Object.keys(oldBook.entries).sort());
assert.deepEqual(Object.keys(converted.entries).sort(),Object.keys(book.entries).sort());
for(const [uid,e] of Object.entries(book.entries)){
 for(const [k,v] of Object.entries(e))assert.deepEqual(converted.entries[uid][k],v,`${uid}.${k}`);
 if(!changed.has(uid))assert.deepEqual(e,oldBook.entries[uid]);
 else{
  const clean=x=>{const y=structuredClone(x);delete y.content;delete y.extensions['901_replay'];return y;};
  assert.deepEqual(clean(e),clean(oldBook.entries[uid]),`unexpected loading change ${uid}`);
 }
}
for(const key of ['name','personality','scenario','first_mes','mes_example','system_prompt','post_history_instructions','alternate_greetings'])assert.deepEqual(card.data[key],oldCard.data[key],key);
for(const key of ['scan_depth','token_budget','recursive_scanning'])assert.deepEqual(card.data.character_book[key],oldCard.data.character_book[key]);
const host=raw(path.join(root,'output/replay_f_review/v1/gm/host_rules.md')).split('## 可用提示正文\n\n')[1].trim();
assert.equal(card.data.description,host);
assert.equal(raw(path.join(out,'texts/901_主持原则.txt')).trim(),host);
for(const needle of ['概述、简化裁定或详细规则','未列明能力','有一定难度的怪物击杀','T0—T8','完整人物卡、精确DP、HP或整套资源表不是每次叙事裁定的前提'])assert.ok(host.includes(needle),needle);
const style=read(path.join(out,'import/文风_prompt.json'));
const oldStyle=read(path.join(baseline,'import/文风_prompt.json'));
const authorStyle=read(path.join(root,'work/replay_research/gm_style/v1/authoring.json'));
assert.equal(style.data.prompts[0].content,authorStyle.modules[0].content);
assert.equal(style.data.prompts[0].content.trim(),raw(path.join(out,'texts/901_文风提示.txt')).trim());
const cleanStyle=x=>{const y=structuredClone(x);delete y.data.prompts[0].content;return y;};
assert.deepEqual(cleanStyle(style),cleanStyle(oldStyle));
for(const p of read(path.join(stage,'protected_before.json')))assert.equal(digest(path.join(root,p.path)),p.sha256,p.path);
for(const rel of ['import/901_御临风.persona.json','texts/御临风_Persona.txt'])assert.equal(digest(path.join(out,rel)),digest(path.join(baseline,rel)),rel);
const delta=raw(path.join(out,'characters/runtime_cards.jsonl')).trim().split(/\n/).map(JSON.parse);
const oldDelta=raw(path.join(baseline,'characters/runtime_cards.jsonl')).trim().split(/\n/).map(JSON.parse);
assert.equal(delta.length,oldDelta.length);
for (const row of delta) {
 const old=oldDelta.find(x=>x.id===row.id); assert.ok(old);
 if(row.entity_id!=='CRC_031')assert.deepEqual(row,old);
 else{
  const clean=x=>{const y=structuredClone(x);delete y.content.abilities;return y;};
  assert.deepEqual(clean(row),clean(old));
  assert.ok(book.entries['50804080'].content.includes(row.content.abilities.join('；')));
 }
}
const inventory=read(path.join(stage,'source_inventory.json'));
for(const [rel,hash] of Object.entries(inventory.source_sha256))assert.equal(digest(path.join(root,rel)),hash,rel);
const projected=raw(path.join(stage,'projected_entries.jsonl')).trim().split(/\r?\n/).map(JSON.parse);
let refCount=0;
for(const [i,e] of edits.entries()){
 const actual=book.entries[e.uid];assert.equal(actual.extensions['901_replay'].source_line,i+1);
 assert.equal(projected[i].id,e.source_id);assert.equal(projected[i].content,actual.content);
 for(const r of e.source_refs){
  const lines=raw(path.join(root,r.path)).split(/\r?\n/);
  assert.ok(r.line>0&&r.line<=lines.length);assert.ok(lines[r.line-1].includes(r.locator));refCount++;
 }
}
const scenes=inventory.updated_sources.filter(x=>x.endsWith('_playable_draft.md'));
assert.equal(scenes.length,16);
for(const rel of scenes){
 const source=raw(path.join(root,rel));assert.equal(source.split('## 2026-10-18：').length,2);
 for(const heading of ['**现场与人物。**','**节奏与简化。**','**能力运用。**','**奖励依据。**'])assert.ok(source.includes(heading));
}
const constantLength=b=>Object.values(b.entries).filter(e=>e.constant&&!e.disable).reduce((n,e)=>n+[...e.content].length,0);
const report={checked_on:'2026-10-18',passed:true,target_version:read(path.join(app,'package.json')).version,
 character_card:'local TavernCardValidator.validateV2 passed',worldbook:'all native fields match local convertCharacterBook output',
 entries:130,changed_content:edits.length,unchanged_entries:130-edits.length,uids_preserved:130,loading_preserved:true,
 scene_sources_checked:16,source_refs_checked:refCount,source_files_fingerprints_checked:inventory.updated_sources.length,
 protected_files_unchanged:read(path.join(stage,'protected_before.json')).length,host_matches_source:true,style_matches_source:true,prompt_configuration_preserved:true,persona_unchanged:true,opening_unchanged:true,
 context_measurement:{unit:'Unicode characters, NOT tokens',constant_before:constantLength(oldBook),constant_after:constantLength(book),actual_request_loading:'unverified'},
 actual_runtime_verified:false,model_calls:0,automatic_installation:false,scope:'changed projections, source consistency, local schema/conversion and protected fingerprints only'};
fs.writeFileSync(path.join(stage,'verification.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
