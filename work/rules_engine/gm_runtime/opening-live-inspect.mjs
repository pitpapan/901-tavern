import {readFile,writeFile} from 'node:fs/promises';
const stage=process.argv[2];if(stage&&!/^[a-z0-9-]+$/.test(stage))throw Error('invalid stage');
const chatId='901 初始卡石像撤离实测 - 2026-10-22';
const text=await readFile(`D:/github/sillyTavern/data/default-user/chats/901 帝都初始卡/${chatId}.jsonl`,'utf8');
const rows=text.trim().split('\n').map(JSON.parse),floor=rows.findLast(r=>r.variables?.[r.swipe_id??0]?.stat_data?.['901_rules_poc']);
const root=floor?.variables[floor.swipe_id??0].stat_data['901_rules_poc'];
const summary={chatId,revision:root?.revision,mode:root?.battle?.mode,round:root?.battle?.round,pending:root?.battle?.pending,status:root?.battle?.status,
  resolution:root?.battle?.resolution,bindings:root?.encounterBindings,
  actors:Object.fromEntries(Object.entries(root?.actors??{}).map(([id,a])=>[id,{health:a.state.health,resources:a.state.resources,will:a.state.will,xp:a.state.xp,position:root?.battle?.actors[id]?.position,buffs:root?.battle?.actors[id]?.buffs,durationCarry:root?.battle?.actors[id]?.durationCarry}])),
  operations:Object.entries(root?.operations??{}).map(([id,o])=>({id,revision:o.summary.revision,command:JSON.parse(o.signature),damage:o.summary.result?.damage,responses:o.summary.result?.responses})),
  lastMessages:rows.slice(-2).map(r=>({user:r.is_user,text:r.mes,extra:r.extra}))};
if(stage){const out=new URL(`../../../output/replay_tavern/opening_combat_20261022_candidate/live-${stage}`,import.meta.url);await writeFile(new URL(out+'.jsonl'),text);await writeFile(new URL(out+'.json'),JSON.stringify(summary,null,2)+'\n');}
console.log(JSON.stringify(summary,null,2));
