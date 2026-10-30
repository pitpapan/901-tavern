// Build/deployment-only projection of adopted narrative entry fields; preserves lore and host settings.
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
export function selectAdoptedStyle(authoring){
 const matches=authoring.modules.filter(m=>m.identifier==='901-gm-style-v1');
 if(matches.length!==1||typeof matches[0].content!=='string'||!matches[0].content.trim())throw Error('Expected one adopted 901-gm-style-v1 module');
 return matches[0].content;
}
// Exact adopted change: narrative_flow_20261030/candidate-change.json (db61d85).
export function patchNarrationInstruction(source){
 const before="narrationInstruction:'用原团式文字承接当前场景。只描述队友和敌人的可见表现，不公开其数值；不自动开战，不替御临风说话或决定。'",after="narrationInstruction:'承接本轮已声明言行的客观后果和相关人物的回应，不补御临风新台词、心理、选择或承诺。普通应答完成即可结束，未变化的环境、站位和闲置动作无需逐人复述；不以等待安排交棒。感官只呈现已有现场可支持的观察；普通休息、闲聊没有线索依据时不新增可疑人物或暗示危险。不公开NPC数值，不自动开战。'";
 const current=after.replace("不补御临风新台词、心理、选择或承诺。","不补御临风未声明的动作、台词、心理、选择或承诺。");
 if(source.split(current).length===2&&!source.includes(before))return source;
 if(source.split(after).length===2&&!source.includes(before))return source;
 if(source.split(before).length!==2||source.includes(after))throw Error('Narrative instruction anchor differs');
 return source.replace(before,after);
}
// Cross-scene action clause only (92a63a6); does not install optional Summary wiring.
export function patchDeclaredActionInstruction(source){
 const before="不补御临风新台词、心理、选择或承诺。",after="不补御临风未声明的动作、台词、心理、选择或承诺。";
 if(source.split(after).length===2&&!source.includes(before))return source;
 if(source.split(before).length!==2||source.includes(after))throw Error('Declared-action instruction anchor differs');
 return source.replace(before,after);
}
// Reuse the selected native manual Summary source; no memory writes or tool switching.
export function patchSummaryMemory(source){
 const route=source.match(/const \{registerReplayGate\}=await import\('([^']+)work\/rules_engine\/gm_runtime\/replay-gate-script\.example\.js'\);/)?.[1];
 if(!route)throw Error('Expected replay gate import route');
 const importLine=`const {retainedBranchMemory}=await import('${route}work/replay_research/six_books_20261023/branch-memory.mjs');`;
 if(!source.includes(importLine))source=importLine+'\n'+source;
 if(source.split(importLine).length!==2)throw Error('Expected one Summary import');
 const history="      'world_info_after','chat_history',";
 const slot="\n      ...(retainedBranchMemory(SillyTavern.chat)?[{role:'system',content:retainedBranchMemory(SillyTavern.chat)}]:[]),";
 if(source.split(history).length!==2)throw Error('Expected one continuation history slot');
 if(!source.includes(history+slot)&&!source.includes(history+'\r'+slot))source=source.replace(history,history+slot);
 return source;
}
// Database mode leaves the existing host memory system alone and removes only these optional insertions.
export function removeSummaryMemory(source){
 const route=source.match(/const \{registerReplayGate\}=await import\('([^']+)work\/rules_engine\/gm_runtime\/replay-gate-script\.example\.js'\);/)?.[1];
 if(!route)throw Error('Expected replay gate import route');
 const importLine=`const {retainedBranchMemory}=await import('${route}work/replay_research/six_books_20261023/branch-memory.mjs');`;
 const history="      'world_info_after','chat_history',";
 const slot="      ...(retainedBranchMemory(SillyTavern.chat)?[{role:'system',content:retainedBranchMemory(SillyTavern.chat)}]:[]),";
 return source.replace(importLine+'\r\n','').replace(importLine+'\n','')
   .replace(history+'\r\n'+slot,history).replace(history+'\n'+slot,history);
}
export function patchNarrativeEntry(source,{summary=false}={}){
 const replacements=[['max_chat_history:6',"max_chat_history:'all'"],["ordered_prompts:['world_info_before'","ordered_prompts:[{role:'system',content:style},'world_info_before'"]];
 for(const [before,after]of replacements){
  if(source.split(after).length===2&&!source.includes(before))continue;
  if(source.split(before).length!==2||source.includes(after))throw Error('Narrative entry anchor differs: '+before);
  source=source.replace(before,after);
 }
 source=patchDeclaredActionInstruction(patchNarrationInstruction(source));
 return summary?patchSummaryMemory(source):removeSummaryMemory(source);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const input=JSON.parse(readFileSync(0,'utf8'));
 process.stdout.write(JSON.stringify({script:patchNarrativeEntry(input.script,{summary:input.summary??false}),style:selectAdoptedStyle(input.authoring)}));
}
