// Prepare exact minimal payloads by default. --send is a separate reviewed action.
// Re-narrates saved resolved facts only; no dice, chat or MVU writes.
import {readFile,writeFile} from 'node:fs/promises';
import {publicScene} from '../combat/presentation.mjs';
import {narrationRequest} from './narrative.mjs';
const out=new URL('../../../output/replay_tavern/arena_playtest_20261023_candidate/',import.meta.url);
const style=JSON.parse(await readFile(new URL('public/901-arena-playtest/narrative-style.json',out),'utf8'));
const {chat_completion_source,google_model,temp_openai,reverse_proxy}=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/settings.json','utf8')).oai_settings;
const installed=JSON.parse(await readFile(new URL('live-install.json',out),'utf8'));
if(chat_completion_source!==installed.model.source||google_model!==installed.model.model||chat_completion_source!=='makersuite')throw Error('Live model changed; probe not sent');
if(typeof reverse_proxy==='string'&&reverse_proxy.trim())throw Error('Probe requires the configured official Google backend without reverse proxy');
const cases=[
  {id:'first-arrow',file:'mireya-retest-first-defense.jsonl',revision:5,afterRevision:3},
  {id:'ending',file:'mireya-retest-opportunity-result.jsonl',revision:12,afterRevision:10},
];
const payloads=[];
for(const probe of cases) {
  const rows=(await readFile(new URL(probe.file,out),'utf8')).trim().split('\n').map(JSON.parse);
  const floor=rows.findLast(r=>r.variables?.[r.swipe_id??0]?.stat_data?.['901_rules_poc']);
  const root=floor.variables[floor.swipe_id??0].stat_data['901_rules_poc'];
  if(root.revision!==probe.revision)throw Error(`Unexpected saved revision for ${probe.id}`);
  const facts=publicScene(root,{afterRevision:probe.afterRevision}),request=narrationRequest(facts,style);
  const payload={chat_completion_source,model:google_model,stream:false,max_tokens:4096,temperature:temp_openai??0.8,
    messages:[request.ordered_prompts[0],{role:'user',content:request.user_input}]};
  payloads.push({id:probe.id,sourceFile:probe.file,revision:root.revision,facts,payload});
}
const preview={scope:'read-only narrationRequest of saved isolated fictional combat; no raw chat, MVU root, NPC numeric sheet, authentication or proxy fields',
  localEndpoint:'http://localhost:8000/api/backends/chat-completions/generate',
  externalDestination:'Google official generativelanguage.googleapis.com, via existing Tavern makersuite backend',
  model:google_model,reverseProxyEmpty:true,payloads};
await writeFile(new URL('arena-narration-probe-payloads.json',out),JSON.stringify(preview,null,2)+'\n');
if(!process.argv.includes('--send')){console.log('Prepared arena-narration-probe-payloads.json; no network request sent');process.exit(0);}
const csrf=await fetch('http://localhost:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
for(const probe of payloads) {
  const response=await fetch(preview.localEndpoint,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':token,Cookie:cookie},body:JSON.stringify(probe.payload)});
  const raw=await response.json(),prose=raw.choices?.[0]?.message?.content;
  if(!response.ok||typeof prose!=='string')throw Error(`Real narration probe failed ${response.status}`);
  const result={scope:preview.scope,destination:preview.externalDestination,model:google_model,revision:probe.revision,facts:probe.facts,prose};
  await writeFile(new URL(`mireya-${probe.id}-probe.json`,out),JSON.stringify(result,null,2)+'\n');
  console.log(`${probe.id}:\n${prose}`);
}
