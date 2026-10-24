import {readFile,writeFile} from 'node:fs/promises';
const out=new URL('../../../output/replay_tavern/recovery_playtest_20261023_candidate/',import.meta.url);
const [id='main',stage]=process.argv.slice(2);
if(!['main','medicine-a'].includes(id)||stage&&!/^[a-z0-9-]+$/.test(stage))throw Error('usage: recovery-live-inspect.mjs main|medicine-a [stage]');
const install=JSON.parse(await readFile(new URL('live-install.json',out),'utf8'));
const scenario=install.installed.find(s=>s.id===id);if(!scenario)throw Error('Uninstalled recovery chat');
const text=await readFile(`D:/github/sillyTavern/data/default-user/chats/${scenario.name}/${scenario.chatId}.jsonl`,'utf8');
const rows=text.trim().split('\n').map(JSON.parse),floor=rows.findLast(r=>r.variables?.[r.swipe_id??0]?.stat_data?.['901_rules_poc']);
const root=floor?.variables[floor.swipe_id??0].stat_data['901_rules_poc'];
const state=root?.actors.player.state;
const summary={chatId:scenario.chatId,revision:root?.revision,health:state?.health,resources:state?.resources,will:state?.will,
  inventory:state?.inventory,pendingRecoveryEffects:state?.pendingRecoveryEffects,recovery:state?.recovery,
  actorRecord:root?.actors.player,operations:Object.entries(root?.operations??{}).map(([operationId,o])=>({operationId,signature:o.signature,summary:o.summary})),
  lastMessages:rows.slice(-2).map(r=>({user:r.is_user,text:r.mes,extra:r.extra}))};
if(stage){await writeFile(new URL(`${id}-${stage}.jsonl`,out),text);await writeFile(new URL(`${id}-${stage}.json`,out),JSON.stringify(summary,null,2)+'\n');}
console.log(JSON.stringify(summary,null,2));
