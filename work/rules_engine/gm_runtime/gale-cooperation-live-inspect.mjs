// Read-only live-save evidence. No model or battle mutation.
import {readFile,writeFile} from 'node:fs/promises';
const mode=process.argv[2],stage=process.argv[3];
if(!['gale','gale-current','cooperation','roar'].includes(mode)||stage&&!/^[a-z0-9-]+$/.test(stage))throw Error('Invalid evidence arguments');
const chatId=mode==='gale'?'901 狂岚友伤实测 - 2026-10-22':mode==='gale-current'?'901 狂岚敌我选择复测 - 2026-10-22':mode==='roar'?'901 乱红莲咆哮友伤实测 - 2026-10-22':'901 黄泉乱红莲协同实测 - 2026-10-22';
const text=await readFile(`D:/github/sillyTavern/data/default-user/chats/901 叙事战斗测试/${chatId}.jsonl`,'utf8');
const rows=text.trim().split('\n').map(JSON.parse),floor=rows.findLast(r=>r.variables?.[r.swipe_id??0]?.stat_data?.['901_rules_poc']);
const root=floor.variables[floor.swipe_id??0].stat_data['901_rules_poc'];
const operations=Object.entries(root.operations).map(([id,o])=>({id,revision:o.summary.revision,command:JSON.parse(o.signature),result:o.summary.result})).sort((a,b)=>a.revision-b.revision);
const summary={chatId,messages:rows.length-1,revision:root.revision,active:root.battle.activeId,round:root.battle.round,pending:root.battle.pending??null,
  actors:Object.fromEntries(Object.entries(root.actors).map(([id,a])=>[id,{health:a.state.health,statuses:a.state.statuses,resources:a.state.resources,turn:a.state.turn,position:root.battle.actors[id]?.position}])),
  operations:operations.slice(-8).map(o=>({id:o.id,revision:o.revision,command:o.command,damage:o.result.damage,statuses:o.result.statuses,saves:o.result.saves,attack:o.result.attack,responses:o.result.responses,
    after:o.result.after.participants.map(p=>({id:p.id,health:p.health,statuses:p.statuses,position:p.position})),notes:o.result.notes})),
  lastMessages:rows.slice(-2).map(r=>({user:r.is_user,text:r.mes,metadata:r.extra?.['901_narrative']}))};
if(stage){const base=`../../../output/replay_tavern/narrative_combat_20261020_candidate/live-${mode}-${stage}`;await writeFile(new URL(`${base}.jsonl`,import.meta.url),text);await writeFile(new URL(`${base}.json`,import.meta.url),JSON.stringify(summary,null,2)+'\n');}
console.log(JSON.stringify(summary,null,2));
