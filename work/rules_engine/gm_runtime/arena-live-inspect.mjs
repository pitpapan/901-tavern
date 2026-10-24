import {readFile,writeFile} from 'node:fs/promises';
import {ARENA_OPPONENTS} from './arena.mjs';
const [opponentId,stage]=process.argv.slice(2),opponent=ARENA_OPPONENTS[opponentId];
if(!opponent||stage&&!/^[a-z0-9-]+$/.test(stage))throw Error('usage: arena-live-inspect.mjs radwick|mireya [stage]');
export const chatId=`901 擂台 ${opponent.name} 完整场${process.argv.includes('--retest')?'复测':'实测'} - 2026-10-23`;
const cardName=`901 擂台隔离实测 ${opponent.name}`;
const text=await readFile(`D:/github/sillyTavern/data/default-user/chats/${cardName}/${chatId}.jsonl`,'utf8');
const rows=text.trim().split('\n').map(JSON.parse),floor=rows.findLast(r=>r.variables?.[r.swipe_id??0]?.stat_data?.['901_rules_poc']);
const root=floor?.variables[floor.swipe_id??0].stat_data['901_rules_poc'];
const summary={chatId,revision:root?.revision,mode:root?.battle?.mode,round:root?.battle?.round,pending:root?.battle?.pending,
  activeId:root?.battle?.activeId,status:root?.battle?.status,resolution:root?.battle?.resolution,
  actors:Object.fromEntries(Object.entries(root?.actors??{}).map(([id,a])=>[id,{health:a.state.health,resources:a.state.resources,will:a.state.will,xp:a.state.xp,
    position:root?.battle?.actors[id]?.position,actions:a.state.turn,buffs:root?.battle?.actors[id]?.buffs,
    ammunition:root?.battle?.actors[id]?.ammunition,loaded:root?.battle?.actors[id]?.loaded,weaponMode:root?.battle?.actors[id]?.weaponMode,combatCarry:a.combatCarry}])),
  operations:Object.entries(root?.operations??{}).map(([id,o])=>({id,revision:o.summary.revision,command:JSON.parse(o.signature),
    result:Object.fromEntries(Object.entries(o.summary.result??{}).filter(([key])=>key!=='after'))})),
  lastMessages:rows.slice(-2).map(r=>({user:r.is_user,text:r.mes,extra:r.extra}))};
if(stage){const out=new URL(`../../../output/replay_tavern/arena_playtest_20261023_candidate/${opponentId}-${stage}`,import.meta.url);await writeFile(new URL(out+'.jsonl'),text);await writeFile(new URL(out+'.json'),JSON.stringify(summary,null,2)+'\n');}
console.log(JSON.stringify(summary,null,2));
