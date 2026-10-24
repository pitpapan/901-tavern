import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {createRecoveryFixture,RECOVERY_SCENE} from './recovery-fixture.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const sequence=process.argv.includes('--sequence');
const out=resolve(root,`output/replay_tavern/${sequence?'recovery_sequence':'recovery_playtest'}_20261023_candidate`),route='901-recovery-playtest';
const source=resolve(root,'output/replay_tavern/flow_guidance_20261018_candidate/import');
const readJson=async path=>JSON.parse(await readFile(path,'utf8'));
const json=async(path,data)=>writeFile(path,JSON.stringify(data,null,2)+'\n');
await mkdir(resolve(out,'import'),{recursive:true});
const sourceCard=await readJson(resolve(source,'901_帝都主持.card.json'));
const template=await readJson(resolve(root,'work/rules_engine/combat/duel-v2.card.json'));
const style=await readJson(resolve(source,'文风_prompt.json'));
const styleText=style.data.prompts.filter(p=>p.enabled!==false).map(p=>p.content).join('\n');
const bookName='901_恢复隔离实测_008_20261023';
await json(resolve(out,`import/${bookName}.json`),await readJson(resolve(source,'901_主持体验补充_M1_20261018.json')));
const card=structuredClone(sourceCard);
Object.assign(card.data,{name:'901 药品休息隔离实测',character_version:'recovery-playtest-20261023',creator_notes:RECOVERY_SCENE,
  description:RECOVERY_SCENE+'\n\n玩家用自然语言声明；不补造NPC、台词、心理、伤情原因或恢复结果。药品库存和恢复以程序为准。\n\n'+styleText,
  scenario:RECOVERY_SCENE,first_mes:'【独立药品与休息接口验收】\n\n安静的休息室里只有御临风，床铺与清水就在手边，可以安全休息。\n\n本聊天的合成验收初值为：完好2、冲击1、严重6、恶性3；流风10/22，意志1/3。它们只用于验证恢复接口，不计入正式剧情。药品沿初始卡原库存，尚未服用或休息。',alternate_greetings:[],mes_example:''});
card.data.extensions.world=bookName;card.data.character_book.name=bookName;
const scripts=structuredClone(template.data.extensions.tavern_helper.scripts);
scripts.forEach(s=>{s.id=randomUUID();});
let code=(await readFile(new URL('./narrative-script.js',import.meta.url),'utf8')).replaceAll('/901-host-integration/',`/${route}/`)
  .replace('createChatSessionAccess,INTEGRATION_SCENE','createChatSessionAccess')
  .replace('const {createNarrativeSession',`const {createRecoveryFixture,RECOVERY_SCENE:INTEGRATION_SCENE}=await import('/${route}/work/rules_engine/gm_runtime/recovery-fixture.mjs');\nconst {createNarrativeSession`)
  .replace('yulinfeng_replay_t0.baseline.json','yulinfeng_recovery_20261023.baseline.json')
  .replace('baseline,mvu:Mvu','baseline,fixtureFactory:createRecoveryFixture,mvu:Mvu');
scripts[1]={...scripts[1],name:'901 药品与休息验收入口',content:code,button:{enabled:false,buttons:[]},info:RECOVERY_SCENE};
card.data.extensions.tavern_helper={scripts,variables:{}};
card.data.extensions.regex_scripts=template.data.extensions.regex_scripts.map(x=>({...x,id:randomUUID()}));
card.data.extensions.regex_scripts.push({...card.data.extensions.regex_scripts[0],id:randomUUID(),scriptName:'901｜旧自身状态迁移至独立状态栏',findRegex:'/<details>\\s*<summary>[^<]* · 自身状态<\\/summary>[\\s\\S]*?<\\/details>/g',minDepth:0,promptOnly:true,markdownOnly:true});
await json(resolve(out,'import/901_药品休息隔离实测.card.json'),card);
const files=[
  'work/rules_engine/core.mjs','work/character_builder/builder.mjs','work/rules_engine/recovery.mjs',
  ...['adapter','fixture'].map(n=>`work/rules_engine/mvu_poc/${n}.mjs`),
  ...['map','tactics','catalog','mechanics','engine','transitions','runtime','tavern','host','host-ui','opening','arena','presentation'].map(n=>`work/rules_engine/combat/${n}.mjs`),
  ...['adjudication-gate.mjs','replay-check.mjs','replay-gate-script.example.js','integrated.mjs','narrative.mjs','player-status-ui.mjs','map-ui.mjs','map-art.mjs','opening.mjs','opening-binding.mjs','arena.mjs','recovery-fixture.mjs'].map(n=>`work/rules_engine/gm_runtime/${n}`),
];
for(const file of files) {
  const dest=resolve(out,`public/${route}`,file);await mkdir(dirname(dest),{recursive:true});
  const text=(await readFile(resolve(root,file),'utf8')).replaceAll('/901-rules-runtime/',`/${route}/`).replaceAll('/901-combat-runtime/',`/${route}/`);
  await writeFile(dest,text);
}
const runtimeDir=resolve(out,`public/${route}`);
await mkdir(resolve(runtimeDir,'work/character_builder/real_character'),{recursive:true});
await json(resolve(runtimeDir,'work/character_builder/real_character/yulinfeng_recovery_20261023.baseline.json'),createRecoveryFixture().baseline);
const combatStyle=styleText.split(/\n\s*\n/).filter(p=>/^(从玩家刚才实际做|展开描写的行动场面|NPC按自己的关注点接话|主要使用第三人称|日常可以有轻微)/.test(p)).join('\n\n');
await json(resolve(runtimeDir,'narrative-style.json'),combatStyle);
await cp(resolve(source,'901_御临风.persona.json'),resolve(out,'import/901_御临风_原T0参考.persona.json'));
await json(resolve(out,'build-info.json'),{name:card.data.name,route,worldbookEntries:sourceCard.data.character_book.entries.length,
  source:'M1_IMPORT_20261018_008',scope:sequence?'isolated/recovery-sequence/20261023':'isolated/recovery-playtest/20261023',syntheticFixture:true,runtimeFiles:files});
console.log(`Built ${out}; ${sourceCard.data.character_book.entries.length} unchanged worldbook entries; ${files.length} runtime files`);
