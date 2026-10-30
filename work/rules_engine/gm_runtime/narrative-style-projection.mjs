// Build/deployment-only projection. Does not rewrite prompts, lore or host settings.
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
export function selectAdoptedStyle(authoring){
 const matches=authoring.modules.filter(m=>m.identifier==='901-gm-style-v1');
 if(matches.length!==1||typeof matches[0].content!=='string'||!matches[0].content.trim())throw Error('Expected one adopted 901-gm-style-v1 module');
 return matches[0].content;
}
export function patchNarrativeEntry(source){
 const replacements=[['max_chat_history:6',"max_chat_history:'all'"],["ordered_prompts:['world_info_before'","ordered_prompts:[{role:'system',content:style},'world_info_before'"]];
 for(const [before,after]of replacements){
  if(source.split(after).length===2&&!source.includes(before))continue;
  if(source.split(before).length!==2||source.includes(after))throw Error('Narrative entry anchor differs: '+before);
  source=source.replace(before,after);
 }
 return source;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const input=JSON.parse(readFileSync(0,'utf8'));
 process.stdout.write(JSON.stringify({script:patchNarrativeEntry(input.script),style:selectAdoptedStyle(input.authoring)}));
}
