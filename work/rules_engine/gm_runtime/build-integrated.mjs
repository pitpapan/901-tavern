import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {createOpeningFixture,OPENING_SCENE} from './opening.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const opening=process.argv.includes('--opening');
const narrative=opening||process.argv.includes('--narrative');
const route=opening?'901-opening-combat':narrative?'901-narrative-combat':'901-host-integration';
const out=resolve(root,opening?'output/replay_tavern/opening_combat_20261022_candidate':`output/replay_tavern/${narrative?'narrative_combat':'host_integration'}_20261020_candidate`);
const source=resolve(root,'output/replay_tavern/flow_guidance_20261018_candidate/import');
const readJson=async path=>JSON.parse(await readFile(path,'utf8'));
const json=async(path,data)=>writeFile(path,JSON.stringify(data,null,2)+'\n');
await mkdir(resolve(out,'import'),{recursive:true});
const card=await readJson(resolve(source,'901_帝都主持.card.json'));
const test=await readJson(resolve(root,'work/rules_engine/combat/duel-v2.card.json'));
const style=await readJson(resolve(source,'文风_prompt.json'));
const name=opening?'901 帝都初始卡':narrative?'901 叙事战斗测试':'901 主持整合测试';
const fileName=opening?'901_帝都初始卡':narrative?'901_叙事战斗测试':'901_主持整合测试';
const bookName=`${fileName}_008_${opening?'20261022':'20261020'}`;
const note=opening?'2026-10-22用户授权初始卡。御临风六属性5/5/4/4/1/2，12生命、3意志、流风22；同伴沿已授权初稿，原/推/补标签保留。姜子尤仅有梦境早期定义，不自动入都。旧完整卡及存档不迁移。008世界书136条及UID不变，晚期资源知识不表示现在拥有。只实际在场者参与接战；主持确认当前场景绑定后才登记遭遇。战后保留伤势和资源，不自动治疗或授奖。':
  '完整人物卡隔离测试，非帝都T0、非正式重玩存档。复用008世界书背景；测试场地、相距1米、矮横木敏捷＋运动DC1仅为验收夹具。用户确认：苍穹弓力量要求4，狮子王与弃风武器体积3，乱红莲体积12；流风池上限22、自由动作启动，普通箭初始20支。御临风不含观澜法；完美战士为后期能力，开局没有，每次施法由玩家另选借用资源。所有数值仅由程序结算与写回；模型不能调用工具替玩家选择。';
card.data.name=name;card.data.character_version=narrative?'narrative-1':'integration-1';
card.data.creator_notes=note;
card.data.description+='\n\n【当前规则入口】\n'+note+'\n'+(opening?OPENING_SCENE:
  '当前位于隔离演练场，取代本卡帝都初至开场。可以交谈、尝试矮横木平衡检定，或明确开始已登记的姜黄演练／御临风与姜子尤演练。主持分类器将开战交给程序。尚未适配的能力不能凭叙述得到机械效果。');
if(narrative)card.data.description+='\n玩家通过自然语言写扮演、动作、判定及动作和能量消耗。只执行明确声明，余下动作保留等待续写，不擅自结束回合。对方反应只能表现已成立的结果，不赠送额外攻击。仅御临风自己的数值状态可见，队友和敌人的伤势与表现用可观察的文字描述。战斗按出手、位置、应对和后果连贯展开，不写结算表。';
card.data.description+='\n\n'+style.data.prompts.filter(p=>p.enabled!==false).map(p=>p.content).join('\n');
const adoptedOpening={scenario:card.data.scenario,first_mes:card.data.first_mes};
card.data.scenario=note+'\n场地开阔无遮挡。黄泉和姜子尤相距1米，御临风、布莱特在场边，旁边有一根练习平衡的矮横木。演练以一方失去行动能力为终点；伤势按程序保留，不构成角色在正式剧情中的遭遇。';
card.data.first_mes='【独立主持整合测试｜完整卡配置】\n\n这段演练只用于检查主持、战斗和存档的连接，不计入正式剧情。\n\n空旷场地中央，黄泉与姜子尤相隔一步站定，还没有动手。布莱特留在场边。附近放着一根用于练习平衡的矮横木，踩空时可以直接落到地上。\n\n黄泉把手停在刀鞘旁，望向场边：“准备好就开始。”';
card.data.alternate_greetings=[];card.data.mes_example='';
if(narrative)card.data.first_mes='【独立叙事战斗测试｜完整卡配置】\n\n这段演练不计入正式剧情。\n\n场地中央，黄泉与姜子尤相隔一步站定。黄泉的手搭在刀鞘旁，姜子尤松了松肩膀，两人尚未动手。布莱特留在场边，听着两人的动静。\n\n“准备好就开始。”黄泉望向场边。\n\n你可以旁观他们交手，也可以亲自与姜子尤对练。轮到你时，直接写出扮演、动作、判定及消耗；未用完的动作会保留，等你继续。';
if(opening){card.data.scenario=adoptedOpening.scenario+'\n'+OPENING_SCENE;card.data.first_mes=adoptedOpening.first_mes;card.data.character_version='opening-20261022';}
card.data.extensions.world=bookName;
card.data.character_book.name=bookName;
const scripts=structuredClone(test.data.extensions.tavern_helper.scripts);
for(const script of scripts)script.id=randomUUID();
scripts[1].name=narrative?'901 叙事战斗入口':'901 主持整合入口';
scripts[1].content=(await readFile(new URL(narrative?'./narrative-script.js':'./integrated-script.js',import.meta.url),'utf8')).replaceAll('/901-host-integration/',`/${route}/`);
if(opening) {
  scripts[1].name='901 帝都初始卡入口';
  scripts[1].content=scripts[1].content.replace('createChatSessionAccess,INTEGRATION_SCENE','createChatSessionAccess')
    .replace("const {createNarrativeSession",`const {createOpeningFixture,OPENING_SCENE:INTEGRATION_SCENE}=await import('/${route}/work/rules_engine/gm_runtime/opening.mjs');\nconst sceneBinding=await (await fetch('/${route}/scene-binding.json')).json();\nconst {createNarrativeSession`)
    .replace('yulinfeng_replay_t0.baseline.json','yulinfeng_opening_20261022.baseline.json')
    .replace('baseline,mvu:Mvu','baseline,fixtureFactory:b=>createOpeningFixture(b,sceneBinding),resolveEncounterBinding:input=>resolveOpeningBinding(input,generateRaw),mvu:Mvu');
  scripts[1].content=`const {resolveOpeningBinding}=await import('/${route}/work/rules_engine/gm_runtime/opening-binding.mjs');\n`+scripts[1].content;
  scripts[1].content+=`\nconst {mountOpeningSceneHost}=await import('/${route}/work/rules_engine/gm_runtime/opening-scene-ui.mjs');\nconst openingHost=mountOpeningSceneHost({document:window.top.document,getSession,tavern:SillyTavern,isActive:()=>SillyTavern.characterId===sourceCharacter});\nwindow.addEventListener('pagehide',()=>openingHost.dispose());\n`;
}
scripts[1].button={enabled:!narrative,buttons:narrative?[]:['继续战斗／玩家选择','查看当前状态','主持补参','补发已结算报告','停止自动推进'].map(name=>({name,visible:true}))};
scripts[1].info=note;
card.data.extensions.tavern_helper={scripts,variables:{}};
card.data.extensions.regex_scripts=test.data.extensions.regex_scripts.map(x=>({...x,id:randomUUID()}));
if(narrative)card.data.extensions.regex_scripts.push({...card.data.extensions.regex_scripts[0],id:randomUUID(),
  scriptName:'901｜旧自身状态迁移至独立状态栏',findRegex:'/<details>\\s*<summary>[^<]* · 自身状态<\\/summary>[\\s\\S]*?<\\/details>/g',minDepth:0,promptOnly:true,markdownOnly:true});
await json(resolve(out,`import/${fileName}.card.json`),card);
const world=await readJson(resolve(source,'901_主持体验补充_M1_20261018.json'));
await json(resolve(out,`import/${bookName}.json`),world);
await cp(resolve(source,'901_御临风.persona.json'),resolve(out,'import/901_御临风_原T0参考.persona.json'));
await json(resolve(out,'import/901_历史结算过滤.regex.json'),card.data.extensions.regex_scripts);
for(const [index,script]of scripts.entries())await json(resolve(out,`import/${index===0?'901_MVU':'901_主持整合入口'}.script.json`),script);
const files=[
  'work/rules_engine/core.mjs','work/rules_engine/recovery.mjs','work/rules_engine/possessions.mjs','work/character_builder/builder.mjs',
  'work/character_builder/real_character/yulinfeng_replay_t0.baseline.json',
  ...['adapter','fixture'].map(n=>`work/rules_engine/mvu_poc/${n}.mjs`),
  ...['map','tactics','catalog','mechanics','engine','grapple','transitions','runtime','tavern','host','host-ui'].map(n=>`work/rules_engine/combat/${n}.mjs`),
  'work/rules_engine/combat/opening.mjs','work/rules_engine/gm_runtime/opening.mjs','work/rules_engine/gm_runtime/opening-binding.mjs','work/rules_engine/gm_runtime/opening-scene-ui.mjs',
  ...['adjudication-gate.mjs','replay-check.mjs','replay-gate-script.example.js','integrated.mjs','rule-actions.mjs','rule-reference.mjs','actor-rules.mjs','scene-rules.mjs'].map(n=>`work/rules_engine/gm_runtime/${n}`),
  ...(narrative?['work/rules_engine/combat/presentation.mjs','work/rules_engine/gm_runtime/narrative.mjs','work/rules_engine/gm_runtime/player-status-ui.mjs','work/rules_engine/gm_runtime/map-ui.mjs','work/rules_engine/gm_runtime/map-art.mjs','work/rules_engine/gm_runtime/map-reference-demo.mjs','work/rules_engine/gm_runtime/map-reference-demo.html']:[]),
];
for(const file of files) {
  const dest=resolve(out,`public/${route}`,file);
  await mkdir(dirname(dest),{recursive:true});
  let text=await readFile(resolve(root,file),'utf8');
  text=text.replaceAll('/901-rules-runtime/',`/${route}/`).replaceAll('/901-combat-runtime/',`/${route}/`);
  await writeFile(dest,text);
}
if(opening) {
  await json(resolve(out,`public/${route}/scene-binding.json`),{bindings:[]});
  await json(resolve(out,`public/${route}/work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json`),createOpeningFixture().baseline);
}
if(narrative) {
  const combatStyle=style.data.prompts.filter(p=>p.enabled!==false).map(p=>p.content).join('\n')
    .split(/\n\s*\n/).filter(p=>/^(从玩家刚才实际做|展开描写的行动场面|NPC按自己的关注点接话|主要使用第三人称|日常可以有轻微)/.test(p));
  await json(resolve(out,`public/${route}/narrative-style.json`),combatStyle.join('\n\n'));
}
await json(resolve(out,'build-info.json'),{name,worldbookEntries:card.data.character_book.entries.length,
  source:'M1_IMPORT_20261018_008',scope:opening?'replay/T0/opening-20261022':'isolated/full-card-integration',runtimeFiles:files});
console.log(`Built ${out}; ${card.data.character_book.entries.length} worldbook entries; ${files.length} runtime files`);
