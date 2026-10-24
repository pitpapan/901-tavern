// Real-model prose probe only: reads the saved rev8 facts; no chat/state mutation.
import {readFile,writeFile} from 'node:fs/promises';
import {publicScene} from '../combat/presentation.mjs';
import {narrationRequest} from './narrative.mjs';
const out=new URL('../../../output/replay_tavern/opening_combat_20261022_candidate/',import.meta.url);
const rows=(await readFile(new URL('live-exit-progress.jsonl',out),'utf8')).trim().split('\n').map(JSON.parse);
const floor=rows.findLast(r=>r.variables?.[r.swipe_id??0]?.stat_data?.['901_rules_poc']);
const root=floor.variables[floor.swipe_id??0].stat_data['901_rules_poc'];
if(root.revision!==8||!root.battle.pending)throw Error('Expected saved rev8 pending withdrawal');
const facts={...publicScene(root,{afterRevision:7}),declaration:'我用移动动作沿东侧退路退出六米阵纹有效圈。'};
const style=JSON.parse(await readFile(new URL('public/901-opening-combat/narrative-style.json',out),'utf8'));
const request=narrationRequest(facts,style);
const settings=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/settings.json','utf8')).oai_settings;
if(settings.chat_completion_source!=='makersuite'||settings.google_model!=='gemini-3.5-flash-lite')throw Error('Live model changed; probe not sent');
const csrf=await fetch('http://localhost:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const body={chat_completion_source:'makersuite',model:settings.google_model,stream:false,max_tokens:4096,temperature:settings.temp_openai??0.8,
  reverse_proxy:settings.reverse_proxy,proxy_password:settings.proxy_password,
  messages:[request.ordered_prompts[0],{role:'user',content:request.user_input}]};
const response=await fetch('http://localhost:8000/api/backends/chat-completions/generate',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':token,Cookie:cookie},body:JSON.stringify(body)});
const raw=await response.json(),prose=raw.choices?.[0]?.message?.content;
if(!response.ok||typeof prose!=='string')throw Error(`Probe failed ${response.status}`);
await writeFile(new URL('pending-movement-real-probe.json',out),JSON.stringify({scope:'real model prose probe; no chat, dice or MVU mutation',model:settings.google_model,revision:root.revision,facts,prose},null,2)+'\n');
console.log(prose);
