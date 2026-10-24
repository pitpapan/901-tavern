// Static export checks only. No ST service, installation, battle simulation or model calls.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const stage=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(stage,'../../..');
const out=path.join(root,'output/replay_tavern/enemy_xp_20261018_candidate');
const base=path.join(root,'output/replay_tavern/story_guidance_20261018_candidate');
const app=String.raw`D:\github\sillyTavern`;
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const raw=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const book=read(path.join(out,'import/901_帝都敌人与XP_M1_20261018.json'));
const oldbook=read(path.join(base,'import/901_剧情向主持_M1_20261018.json'));
const card=read(path.join(out,'import/901_帝都主持.card.json'));
const oldcard=read(path.join(base,'import/901_帝都主持.card.json'));
const projection=read(path.join(stage,'projection_edits.json'));
const edits=[...projection.changes,...projection.additions,...projection.source_reanchors];
const changed=new Set(projection.changes.map(x=>String(x.uid)));
const added=new Set(projection.additions.map(x=>String(x.uid)));
const reanchored=new Set(projection.source_reanchors.map(x=>String(x.uid)));
const {TavernCardValidator}=await import(pathToFileURL(path.join(app,'src/validator/TavernCardValidator.js')));
const validator=new TavernCardValidator(card);
assert.ok(validator.validateV2(),validator.lastValidationError);
const src=raw(path.join(app,'public/scripts/world-info.js'));
const start=src.indexOf('export function convertCharacterBook('),end=src.indexOf('export function setWorldInfoButtonClass(',start);
assert.ok(start>=0&&end>start);
const convert=new Function('newWorldInfoEntryTemplate','world_info_position','DEFAULT_DEPTH','DEFAULT_WEIGHT','world_info_logic','extension_prompt_roles',src.slice(start,end).replace(/^export /,'')+'\nreturn convertCharacterBook;')({}, {before:0,after:1},4,100,{AND_ANY:0},{SYSTEM:0});
const converted=convert(structuredClone(card.data.character_book));
assert.deepEqual(Object.keys(converted.entries).sort(),Object.keys(book.entries).sort());
assert.equal(Object.keys(book.entries).length,136);
const clean=e=>{const x=structuredClone(e);delete x.content;delete x.extensions['901_replay'];return x;};
for(const [uid,e] of Object.entries(book.entries)){
  for(const [k,v] of Object.entries(e))assert.deepEqual(converted.entries[uid][k],v,`${uid}.${k}`);
  if(added.has(uid)){
    assert.ok(!Object.hasOwn(oldbook.entries,uid));
    const a=clean(e),b=clean(oldbook.entries['182558169']);
    for(const key of ['uid','key','comment']){delete a[key];delete b[key];}
    assert.deepEqual(a,b,`new loading template ${uid}`);
    assert.ok(e.key.length&&e.key.every(k=>k.length>1));
  }else{
    assert.deepEqual(clean(e),clean(oldbook.entries[uid]),`existing loading drift ${uid}`);
    if(!changed.has(uid))assert.equal(e.content,oldbook.entries[uid].content);
    if(!changed.has(uid)&&!reanchored.has(uid))assert.deepEqual(e,oldbook.entries[uid]);
  }
}
for(const uid of Object.keys(oldbook.entries))assert.ok(Object.hasOwn(book.entries,uid));
for(const k of ['name','personality','scenario','first_mes','mes_example','system_prompt','post_history_instructions','alternate_greetings'])assert.deepEqual(card.data[k],oldcard.data[k],k);
for(const k of ['scan_depth','token_budget','recursive_scanning'])assert.deepEqual(card.data.character_book[k],oldcard.data.character_book[k]);
const host=raw(path.join(root,'output/replay_f_review/v1/gm/host_rules.md')).split('## 可用提示正文\n\n')[1].trim();
assert.equal(card.data.description,host);
assert.equal(raw(path.join(out,'texts/901_主持原则.txt')).trim(),host);
for(const needle of ['概述、简化裁定或详细规则','不构成能力白名单','御临风个人XP','同一份解决成果只结一次','后来完成同一追捕补2XP'])assert.ok(host.includes(needle),needle);
const style=read(path.join(out,'import/文风_prompt.json'));
const oldstyle=read(path.join(base,'import/文风_prompt.json'));
const styleSource=read(path.join(root,'work/replay_research/gm_style/v1/authoring.json'));
assert.equal(style.data.prompts[0].content,styleSource.modules[0].content);
assert.equal(style.data.prompts[0].content.trim(),raw(path.join(out,'texts/901_文风提示.txt')).trim());
const cleanStyle=o=>{const x=structuredClone(o);delete x.data.prompts[0].content;return x;};
assert.deepEqual(cleanStyle(style),cleanStyle(oldstyle));
for(const p of read(path.join(stage,'protected_before.json')))assert.equal(sha(path.join(root,p.path)),p.sha256,p.path);
for(const rel of ['import/901_御临风.persona.json','texts/御临风_Persona.txt','characters/runtime_cards.jsonl','manuals/记忆提交步骤.md'])assert.equal(sha(path.join(out,rel)),sha(path.join(base,rel)),rel);
const inventory=read(path.join(stage,'source_inventory.json'));
for(const [rel,hash] of Object.entries(inventory.source_sha256))assert.equal(sha(path.join(root,rel)),hash,rel);
const projected=raw(path.join(stage,'projected_entries.jsonl')).trim().split('\n').map(JSON.parse);
assert.equal(projected.length,edits.length);
let refCount=0;
for(const [i,e] of edits.entries()){
  const actual=book.entries[e.uid];
  assert.equal(actual.extensions['901_replay'].source_line,i+1);
  assert.equal(projected[i].source_id,e.source_id);
  assert.equal(projected[i].content,actual.content);
  for(const r of e.source_refs){
    const lines=raw(path.join(root,r.path)).split('\n');
    assert.ok(r.line>0&&r.line<=lines.length);
    assert.ok(lines[r.line-1].includes(r.locator),`${r.path}:${r.line}`);refCount++;
  }
}
const clarifications=raw(path.join(root,'work/replay_research/user_clarifications.jsonl')).trim().split('\n').map(JSON.parse);
assert.equal(clarifications.filter(x=>x.id==='UCL_20261018_006').length,1);
const manual=raw(path.join(out,'manuals/帝都敌人与XP.md'));
for(const needle of ['ADOPTED_AUTHOR_DESIGN','HP17','HP15','常态高速','有一定难度的怪物击杀可以','玩家强度估算实验仍后置']){
  // The source describes 常态高速 in its prose as 常态能够; verify the adopted parameter itself.
  assert.ok(manual.includes(needle==='常态高速'?'当前为46米':needle),needle);
}
for(const e of projection.additions){
  assert.ok(!/仍为DRAFT|待采用参数|尚非已采用/.test(e.content),e.comment);
  assert.ok(e.source_refs.some(r=>r.locator==='## UCL_20261018_006'));
}
assert.ok(!book.entries['79768996'].content.includes('不新增固定怪物价表'));
assert.ok(!book.entries['224828230'].content.includes('具体名单、条件与控制强度未知'));
const manifest=read(path.join(out,'manifest.json'));
for(const f of manifest.files)assert.equal(sha(path.join(out,f.path)),f.sha256,f.path);
const counts={total:Object.keys(book.entries).length,enabled_constant:Object.values(book.entries).filter(x=>x.constant&&!x.disable).length,enabled_keyword:Object.values(book.entries).filter(x=>!x.constant&&!x.disable).length,disabled:Object.values(book.entries).filter(x=>x.disable).length};
assert.deepEqual(counts,manifest.counts);
const charCount=b=>Object.values(b.entries).filter(e=>e.constant&&!e.disable).reduce((sum,e)=>sum+[...e.content].length,0);
const report={checked_on:'2026-10-18',passed:true,revision:'M1_IMPORT_20261018_007',target_sillytavern_version:read(path.join(app,'package.json')).version,character_card:'local TavernCardValidator.validateV2 passed',worldbook:'all exported fields match local convertCharacterBook output',counts,preserved_existing_uids:130,changed_existing_content:changed.size,unchanged_existing_content:130-changed.size,added:added.size,source_locator_refresh_only:reanchored.size,existing_loading_preserved:true,new_loading_matches_existing_template:true,host_matches_source:true,style_matches_source:true,prompt_configuration_preserved:true,persona_and_opening_unchanged:true,source_refs_checked:refCount,source_fingerprints_checked:Object.keys(inventory.source_sha256).length,protected_files_unchanged:read(path.join(stage,'protected_before.json')).length,context_measurement:{unit:'Unicode characters, not tokens',constant_before:charCount(oldbook),constant_after:charCount(book),actual_request_loading:'unverified'},player_strength_experiment:'deferred',actual_runtime_verified:false,automatic_installation:false,model_calls:0};
for(const p of [path.join(stage,'verification.json'),path.join(out,'verification.json')])fs.writeFileSync(p,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
