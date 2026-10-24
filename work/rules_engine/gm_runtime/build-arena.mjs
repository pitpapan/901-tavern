import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {createArenaFixture,arenaScene,ARENA_OPPONENTS} from './arena.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const out=resolve(root,'output/replay_tavern/arena_playtest_20261023_candidate'),route='901-arena-playtest';
const source=resolve(root,'output/replay_tavern/flow_guidance_20261018_candidate/import');
const readJson=async path=>JSON.parse(await readFile(path,'utf8'));
const json=async(path,data)=>writeFile(path,JSON.stringify(data,null,2)+'\n');
await mkdir(resolve(out,'import'),{recursive:true});
const sourceCard=await readJson(resolve(source,'901_帝都主持.card.json'));
const template=await readJson(resolve(root,'work/rules_engine/combat/duel-v2.card.json'));
const style=await readJson(resolve(source,'文风_prompt.json'));
const styleText=style.data.prompts.filter(p=>p.enabled!==false).map(p=>p.content).join('\n');
const world=await readJson(resolve(source,'901_主持体验补充_M1_20261018.json'));
const bookName='901_擂台隔离实测_008_20261023';
await json(resolve(out,`import/${bookName}.json`),world);
for(const [opponentId,opponent] of Object.entries(ARENA_OPPONENTS)) {
  const name=`901 擂台隔离实测 ${opponent.name}`,fileName=`901_擂台隔离实测_${opponent.name}`;
  const card=structuredClone(sourceCard),scene=arenaScene(opponentId);
  Object.assign(card.data,{name,character_version:'arena-playtest-20261023',creator_notes:scene,
    description:scene+'\n\n玩家以自然语言声明行动。只结算明确动作，未用完动作保留等待；受击先等待玩家声明防御方式。程序结果驱动正文，不替御临风补台词、思想或战术。只显示玩家自己的状态，NPC数值不写正文。\n\n'+styleText,
    scenario:scene,first_mes:`【独立擂台接口实测｜御临风对${opponent.name}】\n\n本场预告：任一方完好生命槽降至3个或以下、失能或明确认输，就按约定停止练习并保留伤势与消耗。终止不等于真实晋级，不治疗、不授奖。\n\n开阔的练习场上，御临风与${opponent.name}相隔${opponent.distance}米站定。现场只有两人，已经领到本场实际使用的缓冲竞技器械，尚未动手。\n\n${opponentId==='radwick'?'拉德维克把盾沿扶稳，短棍留在身侧：“准备好了就说一声。”':'米蕾娅持弓停在原位，腰侧带着短棍：“这一场请多指教。”'}\n\n本聊天不计入正式剧情或赛事；只有玩家明确开始后才接战。`,alternate_greetings:[],mes_example:''});
  card.data.extensions.world=bookName;card.data.character_book.name=bookName;
  const scripts=structuredClone(template.data.extensions.tavern_helper.scripts);
  scripts.forEach(s=>{s.id=randomUUID();});
  let code=(await readFile(new URL('./narrative-script.js',import.meta.url),'utf8')).replaceAll('/901-host-integration/',`/${route}/`)
    .replace('createChatSessionAccess,INTEGRATION_SCENE','createChatSessionAccess')
    .replace('const {createNarrativeSession',`const {createArenaFixture,arenaScene}=await import('/${route}/work/rules_engine/gm_runtime/arena.mjs');\nconst INTEGRATION_SCENE=arenaScene('${opponentId}');\nconst {createNarrativeSession`)
    .replace('yulinfeng_replay_t0.baseline.json','yulinfeng_arena_20261023.baseline.json')
    .replace('baseline,mvu:Mvu',`baseline,fixtureFactory:b=>createArenaFixture(b,{opponentId:'${opponentId}'}),mvu:Mvu`);
  scripts[1]={...scripts[1],name:`901 擂台入口 ${opponent.name}`,content:code,button:{enabled:false,buttons:[]},info:scene};
  card.data.extensions.tavern_helper={scripts,variables:{}};
  card.data.extensions.regex_scripts=template.data.extensions.regex_scripts.map(x=>({...x,id:randomUUID()}));
  card.data.extensions.regex_scripts.push({...card.data.extensions.regex_scripts[0],id:randomUUID(),scriptName:'901｜旧自身状态迁移至独立状态栏',findRegex:'/<details>\\s*<summary>[^<]* · 自身状态<\\/summary>[\\s\\S]*?<\\/details>/g',minDepth:0,promptOnly:true,markdownOnly:true});
  await json(resolve(out,`import/${fileName}.card.json`),card);
}
const files=[
  'work/rules_engine/core.mjs','work/rules_engine/recovery.mjs','work/character_builder/builder.mjs',
  ...['adapter','fixture'].map(n=>`work/rules_engine/mvu_poc/${n}.mjs`),
  ...['map','tactics','catalog','mechanics','engine','transitions','runtime','tavern','host','host-ui','opening','arena','presentation'].map(n=>`work/rules_engine/combat/${n}.mjs`),
  ...['adjudication-gate.mjs','replay-check.mjs','replay-gate-script.example.js','integrated.mjs','narrative.mjs','player-status-ui.mjs','map-ui.mjs','map-art.mjs','opening.mjs','opening-binding.mjs','arena.mjs'].map(n=>`work/rules_engine/gm_runtime/${n}`),
];
for(const file of files) {
  const dest=resolve(out,`public/${route}`,file);await mkdir(dirname(dest),{recursive:true});
  const text=(await readFile(resolve(root,file),'utf8')).replaceAll('/901-rules-runtime/',`/${route}/`).replaceAll('/901-combat-runtime/',`/${route}/`);
  await writeFile(dest,text);
}
const runtimeDir=resolve(out,`public/${route}`);
await mkdir(resolve(runtimeDir,'work/character_builder/real_character'),{recursive:true});
await json(resolve(runtimeDir,'work/character_builder/real_character/yulinfeng_arena_20261023.baseline.json'),createArenaFixture().baseline);
const combatStyle=styleText.split(/\n\s*\n/).filter(p=>/^(从玩家刚才实际做|展开描写的行动场面|NPC按自己的关注点接话|主要使用第三人称|日常可以有轻微)/.test(p)).join('\n\n');
await json(resolve(runtimeDir,'narrative-style.json'),combatStyle);
await cp(resolve(source,'901_御临风.persona.json'),resolve(out,'import/901_御临风_原T0参考.persona.json'));
await json(resolve(out,'build-info.json'),{name:'901 擂台隔离实测',route,worldbookEntries:sourceCard.data.character_book.entries.length,
  source:'M1_IMPORT_20261018_008',scope:'isolated/arena-playtest/20261023',opponents:Object.keys(ARENA_OPPONENTS),runtimeFiles:files});
console.log(`Built ${out}; ${sourceCard.data.character_book.entries.length} unchanged worldbook entries; ${files.length} runtime files`);
