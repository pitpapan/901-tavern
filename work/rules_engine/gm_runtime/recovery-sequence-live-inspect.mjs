import {readFile,writeFile} from 'node:fs/promises';
const out=new URL('../../../output/replay_tavern/recovery_sequence_20261023_candidate/',import.meta.url);
const [stage]=process.argv.slice(2);
if(stage&&!/^[a-z0-9-]+$/.test(stage))throw Error('usage: recovery-sequence-live-inspect.mjs [stage]');
const {installed:[scenario]}=JSON.parse(await readFile(new URL('live-install.json',out),'utf8'));
const text=await readFile(`D:/github/sillyTavern/data/default-user/chats/${scenario.name}/${scenario.chatId}.jsonl`,'utf8');
const rows=text.trim().split('\n').map(JSON.parse),floor=rows.findLast(r=>r.variables?.[r.swipe_id??0]?.stat_data?.['901_rules_poc']);
const root=floor?.variables[floor.swipe_id??0].stat_data['901_rules_poc'],state=root?.actors.player.state;
const summary={chatId:scenario.chatId,revision:root?.revision,health:state?.health,resources:state?.resources,will:state?.will,inventory:state?.inventory,
  pendingRecoveryEffects:state?.pendingRecoveryEffects,recoveryClock:state?.recoveryClock,operations:root?.operations,
  messages:rows.slice(1).map(r=>({user:r.is_user,text:r.mes,extra:r.extra}))};
if(stage){await writeFile(new URL(`sequence-${stage}.jsonl`,out),text);await writeFile(new URL(`sequence-${stage}.json`,out),JSON.stringify(summary,null,2)+'\n');}
console.log(JSON.stringify(summary,null,2));
