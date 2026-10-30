import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {patchNarrativeEntry,selectAdoptedStyle} from './narrative-style-projection.mjs';
import * as projection from './narrative-style-projection.mjs';
import {retainedBranchMemory} from '../../replay_research/six_books_20261023/branch-memory.mjs';
import {narrationRequest} from './narrative.mjs';
import {replayClassificationRequest} from './adjudication-gate.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const authoring=JSON.parse(read('../../replay_research/gm_style/v1/authoring.json'));
// Adopted flow instruction and six-round evidence: db61d85; historical fixtures remain unchanged.
const flow=JSON.parse(read('../../replay_research/gm_style/v1/narrative_flow_20261030/candidate-change.json'));
// Action clause and existing manual Summary source were authorized in separate steps.
const cross=JSON.parse(read('../../replay_research/gm_style/v1/cross_scene_20261030/candidate-change.json'));
const currentInstruction=flow.after.replace(cross.before,cross.after);
const memoryImport="const {retainedBranchMemory}=await import('/901-opening-combat/work/replay_research/six_books_20261023/branch-memory.mjs');\n";
const historySlot="      'world_info_after','chat_history',";
const memorySlot="\n      ...(retainedBranchMemory(SillyTavern.chat)?[{role:'system',content:retainedBranchMemory(SillyTavern.chat)}]:[]),";
const withSummary=source=>memoryImport+source.replace(historySlot,historySlot+memorySlot);
const instruction=text=>"narrationInstruction:'"+text+"'";
const style=authoring.modules.find(m=>m.identifier==='901-gm-style-v1').content;
function options(source,chat=[]){const start=source.indexOf('function modelOptions()'),end=source.indexOf('\nlet playerStatus',start);return Function('style','getSession','currentSceneText','retainedBranchMemory','SillyTavern',source.slice(start,end)+';return modelOptions();')(style,()=>({storyContext:()=>null}),()=> '现场标记',retainedBranchMemory,{chat});}
test('actual narrative options include the complete adopted style and all retained history',()=>{
 const source=read('./narrative-script.js'),request=options(source);
 assert.ok(source.includes(instruction(currentInstruction)));assert.ok(!source.includes(instruction(flow.before)));
 assert.equal(style.length,2757);assert.equal(createHash('sha256').update(style).digest('hex'),'19361c47654c8559968aa0fb245178c8a0ce0186fd52a96777e2d5959f78f62a');
 assert.equal(request.max_chat_history,'all');assert.equal(request.ordered_prompts.filter(p=>p.content===style).length,1);
 assert.deepEqual(request.ordered_prompts.filter(p=>typeof p==='string'),['world_info_before','char_description','scenario','world_info_after','chat_history','user_input']);
 assert.match(source,/narrate:facts=>generateRaw\(narrationRequest\(facts,style\)\)/);
 const battle=narrationRequest({events:[]},style);assert.ok(battle.ordered_prompts[0].content.startsWith(style+'\n\n'));
 const action={text:'只是说话',messageId:1,swipeId:0,chatId:'style-test'};
 const classification=replayClassificationRequest({context:{original:action,latest:action}});assert.equal(classification.max_chat_history,0);assert.ok(!JSON.stringify(classification).includes(style));
});

test('current cumulative patch upgrades historical fixture only at the adopted anchors including manual Summary',()=>{
 const before=read('../../replay_research/gm_style/v1/live_acceptance_20261030/candidate/host-entry.before.js');
 const expected=withSummary(before.replace('max_chat_history:6',"max_chat_history:'all'").replace("ordered_prompts:['world_info_before'","ordered_prompts:[{role:'system',content:style},'world_info_before'").replace(instruction(flow.before),instruction(currentInstruction)));
 assert.equal(patchNarrativeEntry(before),expected);
 assert.equal(patchNarrativeEntry(expected),expected);
 assert.equal(selectAdoptedStyle({...authoring,modules:[...authoring.modules].reverse()}),style);
 const request=options(expected);assert.equal(request.max_chat_history,'all');assert.equal(request.ordered_prompts.filter(p=>p.content===style).length,1);
});
test('six-book direct runtime projection refreshes a stale CARD without rebuilding the package',()=>{
 const root=fileURLToPath(new URL('../../../',import.meta.url));
 const py=`import ast,json,subprocess,sys
from pathlib import Path
ROOT=Path(sys.argv[1]);path=ROOT/'work/replay_research/six_books_20261023/build_candidate.py'
module=ast.parse(path.read_text(encoding='utf-8'))
function=next(n for n in module.body if isinstance(n,ast.FunctionDef) and n.name=='project_narrative_entry')
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
exec(compile(ast.Module(body=[function],type_ignores=[]),str(path),'exec'))
card=read(ROOT/'output/replay_tavern/opening_combat_20261022_candidate/import/901_帝都初始卡.card.json')
print(json.dumps(project_narrative_entry(card['data']['extensions']['tavern_helper']['scripts'][1]['content']),ensure_ascii=False))`;
 const run=spawnSync('python',['-c',py,root],{encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'}});assert.equal(run.status,0,run.stderr);
 const result=JSON.parse(run.stdout);assert.equal(result.script.split(memoryImport.trim()).length,2);assert.equal(result.script.split(historySlot+memorySlot).length,2);assert.equal(patchNarrativeEntry(result.script),result.script);assert.ok(result.script.includes(instruction(currentInstruction)));assert.equal(result.style,style);assert.equal(options(result.script).max_chat_history,'all');
 assert.equal(options(result.script).ordered_prompts.filter(p=>p.content===style).length,1);
 const builder=read('../../replay_research/six_books_20261023/build_candidate.py');
 assert.ok(builder.includes("narrative=project_narrative_entry(script['content'])"));
 assert.ok(builder.includes("dump(style_dest,narrative['style'])"));assert.ok(builder.includes("'assets':assets"));
 const integrated=read('./build-integrated.mjs');assert.ok(integrated.includes('selectAdoptedStyle(await readJson('));assert.ok(integrated.includes('narrative-style.json`),style)'));
});

test('flow-only formal patch exactly reproduces the accepted entry and is idempotent',()=>{
 const candidate=read('../../replay_research/gm_style/v1/narrative_flow_20261030/candidate-entry.js');
 const before=candidate.replace(instruction(flow.after),instruction(flow.before));
 const sha=s=>createHash('sha256').update(s).digest('hex');
 assert.equal(sha(before),flow.beforeEntrySha256);assert.equal(sha(candidate),flow.afterEntrySha256);
 assert.equal(typeof projection.patchNarrationInstruction,'function');
 assert.equal(projection.patchNarrationInstruction(before),candidate);
 assert.equal(projection.patchNarrationInstruction(candidate),candidate);
 assert.equal(patchNarrativeEntry(before),withSummary(candidate.replace(cross.before,cross.after)));
});

test('declared-action patch changes only the adopted clause without adding Summary wiring',()=>{
 const before=read('../../replay_research/gm_style/v1/narrative_flow_20261030/candidate-entry.js');
 const expected=before.replace(cross.before,cross.after);
 assert.equal(typeof projection.patchDeclaredActionInstruction,'function');
 assert.equal(projection.patchDeclaredActionInstruction(before),expected);
 assert.equal(projection.patchDeclaredActionInstruction(expected),expected);
 assert.equal(patchNarrativeEntry(before),withSummary(expected));assert.equal(patchNarrativeEntry(expected),withSummary(expected));
 assert.ok(!expected.includes('retainedBranchMemory'));
});

test('manual Summary patch preserves source bytes, matches accepted text and never duplicates wiring',()=>{
 const before=read('../../replay_research/gm_style/v1/narrative_flow_20261030/candidate-entry.js').replace(cross.before,cross.after);
 const candidate=read('../../replay_research/gm_style/v1/cross_scene_20261030/candidate-entry.js');
 assert.equal(typeof projection.patchSummaryMemory,'function');
 const expected=withSummary(before);assert.equal(projection.patchSummaryMemory(before),expected);
 assert.equal(expected.replaceAll('\r\n','\n'),candidate.replaceAll('\r\n','\n'));
 assert.equal(projection.patchSummaryMemory(candidate),candidate);
 assert.equal(patchNarrativeEntry(before),expected);assert.equal(patchNarrativeEntry(candidate),candidate);
 const generated=JSON.parse(read('../../../output/replay_tavern/six_books_20261023_candidate/import/901_六书主持入口.script.json')).content;
 assert.equal(patchNarrativeEntry(generated),generated);
 const chat=[{extra:{memory:'当前人工摘要'},swipe_info:[{extra:{memory:'弃用摘要'}}]},{is_user:true}];
 for(const source of [candidate,read('./narrative-script.js')]){
  const request=options(source,chat);assert.equal(request.ordered_prompts.filter(p=>p.content===retainedBranchMemory(chat)).length,1);
  assert.ok(!JSON.stringify(request).includes('弃用摘要'));assert.equal(request.max_chat_history,'all');
  assert.equal(request.ordered_prompts.filter(p=>p.content===style).length,1);
 }
 const builder=read('../../replay_research/six_books_20261023/build_candidate.py'),verifier=read('../../replay_research/six_books_20261023/verify_candidate.py');
 assert.ok(!builder.includes('script[\'content\']="const {retainedBranchMemory}'));
 assert.ok(!verifier.includes('expected_helper[\'scripts\'][1][\'content\']="const {retainedBranchMemory}'));
 assert.ok(read('./build-integrated.mjs').includes("'work/replay_research/six_books_20261023/branch-memory.mjs'"));
});
