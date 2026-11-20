// Offline only: derive independent non-Canon probes from the final browser capture.
// No credentials, transport, classifier model, future assistant replies or formal writes.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createStoryKnowledgeRuntime,STORY_COMMUNICATION_INSTRUCTION} from './package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs';
import {CLINIC_KNOWLEDGE_CATALOG as oldCatalog} from './package/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';
const base=new URL('./',import.meta.url),out=new URL('batch/',base);
await mkdir(out,{recursive:true});
const read=async p=>JSON.parse(await readFile(new URL(p,base),'utf8'));
const put=async(name,value)=>writeFile(new URL(name,out),JSON.stringify(value,null,2)+'\n');
const sha=x=>createHash('sha256').update(x).digest('hex');
const captured=await read('browser.request.json'),baseline=await read('baseline.json'),capture=await read('browser-verification.json');
const originalRows=(await readFile(new URL('browser.captured.chat.jsonl',base),'utf8')).trim().split(/\r?\n/).map(JSON.parse);
const originalVariables=originalRows.at(-2).variables[0];
const commonScene='非Canon独立场景：御临风、布莱特和黄泉在帝都一间普通工坊外的廊下，工坊没有专名。门开着，内侧柜台有人整理单据，尚未开始接待他们；御临风手边有一份待递交的修理清单，尚未交付或承诺付费。布莱特保持原有失明状态。工坊接待员叫陶宁；本例没有战斗、资源消耗或新的伤势。';
const relationCommon='本例既有记录：布莱特曾与协会登记员罗恩办过两次交接，双方相识。罗恩与本工坊接待员陶宁不是同一人。';
const relationEvidence={
 known:relationCommon+'布莱特也曾与陶宁办过两次交接，双方相识；没有登记信任、帮助承诺或秘密访问权。',
 undetermined:relationCommon+'布莱特与陶宁的关系未获确认；没有登记信任、帮助承诺或秘密访问权。'
};
const requirement='这份清单等我与你核对完，再交给陶宁。';
const purposeEvidence={
 unstated:'温衡先前私下向布莱特说：“'+requirement+'”布莱特答应了，尚未与温衡核对；其他两人没有听见。该记录没有说明理由。',
 stated:'温衡先前私下向布莱特说：“'+requirement+'我是怕未核完的项目误导接待员。”布莱特答应了，尚未与温衡核对；其他两人没有听见。该理由是温衡自己的说明，没有额外的内心事实记录。'
};
const footer='\n（桌外隔离验收，非正式剧情：按本例场景承接对话，保持原人物和文风，不替御临风新增对白、心理或决定。）';
const definitions=[
 {id:'01-relation-known',pair:'relation',condition:'known',source:relationEvidence.known,input:'“布莱特，这份修理清单要交到这间工坊。你看先怎么接洽合适？”'+footer,
  dimensions:['有依据的相识可自然使用，也可不求助','相识不升级为必定援助、信任或秘密授权','人物提议不等于玩家采纳']},
 {id:'02-relation-undetermined',pair:'relation',condition:'undetermined',source:relationEvidence.undetermined,input:'“布莱特，这份修理清单要交到这间工坊。你看先怎么接洽合适？”'+footer,
  dimensions:['协会登记员关系不迁移到工坊接待员','允许直接问路、接洽、求介绍或另提办法','未定不写成确定陌生，未来联系不补成旧交']},
 {id:'03-purpose-unstated',pair:'purpose',condition:'unstated',source:purposeEvidence.unstated,input:'“布莱特，递交这份清单的事你准备怎么安排？为什么要这样办？”'+footer,
  dimensions:['核对参与者及未完成状态保留','可以解释个人安排或不展开动机','个人解释不归为温衡交代的目的；效果不证明动机']},
 {id:'04-purpose-stated',pair:'purpose',condition:'stated',source:purposeEvidence.stated,input:'“布莱特，递交这份清单的事你准备怎么安排？为什么要这样办？”'+footer,
  dimensions:['允许准确转述温衡给出的理由，也可选择不说或质疑','来源自述不自动成为旁白确认的唯一真实目的','个人做法与约定仍分开，尚未核对不写成已完成']}
];
const notes=oldCatalog.rejectedNarration;
const oldSystem=captured.messages[0].content;
const relationLines=oldSystem.split('\n').filter(s=>s.startsWith('事项#901301：')||s.startsWith('事项#901302：'));
assert.equal(relationLines.length,2);
const oldChronicles=oldSystem.match(/<记忆回溯>[\s\S]*?<\/记忆回溯>/g);assert.equal(oldChronicles.length,1);
const originalInput=captured.messages.at(-3).content;
const originalPrefix=captured.messages.at(-1).content.split('\n【901逐角色知情投影】')[0];
const oldScene=originalPrefix.match(/当前实际现场：([\s\S]*?)\n开场背景/)[1];
const cases=[];
for(const def of definitions){
 const chatId='isolated.relationship-purpose.'+def.id;
 const factValue=def.pair==='relation'?def.source:'布莱特收到并答应了温衡关于递交清单的要求：'+def.source;
 const catalog={id:'isolated.relationship-purpose.v1',actors:{player:'御临风',bright:'布莱特',huang:'黄泉'},
  facts:[{id:'scene.public',entityId:'scene.workshop',field:'scene',value:commonScene,certainty:'confirmed',visibility:'public'},
   {id:'source.evidence',entityId:'source.fixture',field:'retained_evidence',value:factValue,certainty:'confirmed',visibility:'private'}],
  availableInformation:[{access:'can-inquire',content:'可以尝试向实际接触的人询问接待情况；计划联系不表示会面、关系建立或消息送达已经发生。'}],
  lore:[],rejectedNarration:[]};
 const variables={stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId,actors:structuredClone(originalVariables.stat_data['901_rules_poc'].actors),operations:{}}}};
 const header={user_name:'御临风',character_name:'隔离叙事候选',chat_metadata:{nonCanon:true,caseId:def.id}};
 const source='非Canon测试来源：'+def.source+'此段为本例隔离资料，布莱特已取得上述记录，御临风与黄泉未取得其中的私人内容。';
 const chat=[{is_system:true,is_user:false,mes:commonScene,swipe_id:0,variables:[structuredClone(variables)]},
  {is_system:true,is_user:false,mes:source,swipe_id:0,variables:[structuredClone(variables)]}];
 const anchor=()=>({chatId,messageId:chat.length-1,swipeId:0});
 const seed=new URL(def.id+'.seed.jsonl',out);
 const save=async()=>writeFile(seed,[header,...chat].map(x=>JSON.stringify(x)).join('\n')+'\n');
 const mvu={getMvuData:({message_id})=>structuredClone(chat[message_id].variables[0]),replaceMvuData:async(v,{message_id})=>{chat[message_id].variables[0]=structuredClone(v);}};
 const tavern={chatId,chat,saveChat:save,readSavedChat:async()=>[header,...structuredClone(chat)]};
 const knowledge=createStoryKnowledgeRuntime({catalog,mvu,tavern,getAnchor:anchor});
 await knowledge.receive({id:'fixture.evidence',status:'received',authority:'host-confirmed',sourceAnchor:{...anchor(),text:source},
  recipientIds:['bright'],propositionRefs:['source.evidence'],channel:'message',belief:'confirmed',
  ...(def.pair==='purpose'?{disclosure:{sourceQuote:requirement}}:{})});
 chat.push({is_user:true,is_system:false,mes:def.input,swipe_id:0,variables:[mvu.getMvuData({message_id:chat.length-1})]});
 await save();
 // Preserve the original memory wrapper/format; replace only the old three test records.
 // This is offline fixture assembly, not a new memory renderer or a browser capture.
 const memoryRows=[
  ['910001','御临风','工坊接待员','递交修理清单','当前事项','尚未交付或承诺付费','本例公开场景设定','在场三人知道当前事项'],
  ['910002','布莱特','本例来源','本例已取得的记录','有来源记录',def.source,'本例sourceAnchor原文','只有布莱特取得；来源说法不另作内心事实']
 ];
 const rendered=memoryRows.map(r=>`事项#${r[0]}：${r[1]}对${r[2]}，事项「${r[3]}」，${r[4]}：${r[5]}。来源：${r[6]}。知情范围：${r[7]}。`);
 let system=oldSystem;for(let i=0;i<2;i++)system=system.replace(relationLines[i],rendered[i]);
 const chronicle='<记忆回溯>\n\n# 纪要表\n\n| 编码索引 | 时间跨度 | 概览 | 纪要 | 重要对话 |\n|---|---|---|---|---|\n| ISOLATED-INDEPENDENT | 本例起点，世界时间未指定 | 工坊外商量递交 | '+commonScene+' | 尚无本例模型对白 |\n\n</记忆回溯>';
 system=system.replace(oldChronicles[0],chronicle);
 const body={...baseline.parameters,messages:[{role:'system',content:system},{role:'system',content:commonScene},
  {role:'user',content:def.input},structuredClone(captured.messages.at(-2)),{role:'user',content:''}]};
 const prefix=originalPrefix.replace(originalInput,def.input).replace(oldScene,commonScene);
 const before=JSON.stringify(chat),context=knowledge.context();let listener;
 await knowledge.generate({request:{user_input:prefix},event:'offline',eventOn:(_e,fn)=>{listener=fn;},eventRemoveListener:()=>{listener=null;},
  generateRaw:async projected=>{body.messages.at(-1).content=projected.user_input;listener(body);return '';}});
 assert.equal(JSON.stringify(chat),before);assert.equal(listener,null);
 assert.deepEqual({...body,messages:undefined},{...captured,messages:undefined});
 assert.deepEqual(context.actorKnowledge.map(a=>a.facts.length),[1,2,1]);
 assert.ok(body.messages.at(-1).content.endsWith(STORY_COMMUNICATION_INSTRUCTION));
 assert.equal(body.messages.at(-1).content.split(STORY_COMMUNICATION_INSTRUCTION).length-1,1);
 const flat=body.messages.map(m=>m.content).join('\n');
 for(const n of notes){assert.ok(!flat.includes(n.annotation??n.projectedFragment));assert.ok(!flat.includes(n.message));}
 assert.ok(!flat.includes('ISOLATED-REJECTED-10'));assert.ok(!flat.includes('事项#901301'));assert.ok(!flat.includes('事项#901302'));
 assert.ok(!body.messages.some(m=>m.role==='assistant'),'No invented or corrected prior assistant answer.');
 const raw=JSON.stringify(body);await writeFile(new URL(def.id+'.request.json',out),raw);
 await writeFile(new URL(def.id+'.input.txt',out),def.input+'\n');
 await put(def.id+'.catalog.json',catalog);await put(def.id+'.memory-fixture.json',{nonCanon:true,rows:memoryRows,chronicle:commonScene});
 cases.push({...def,source,context,seed:def.id+'.seed.jsonl',request:{file:def.id+'.request.json',bytes:Buffer.byteLength(raw),sha256:sha(raw)},
  status:'frozen-not-sent',construction:'offline derived from actual final browser capture via packaged generate/context/projectMessages',
  memoryRecords:3,historicalAssistantReplies:0,reviewedAnnotations:0});
}
assert.equal(cases[0].input,cases[1].input);assert.equal(cases[2].input,cases[3].input);
const followups=[
 {id:'05-relation-natural',parent:'02-relation-undetermined',status:'rule-only-awaiting-real-reply',
  rule:'固定承接02，不按哪份表现好挑选。保留完整真实回复、原关系来源和场景。若布莱特仍在场且清单未递交，可自然问清单之外要准备什么；若他已自行开始联系，承接其实际去向与已发生动作，不替御临风跟随，也不宣布介绍成功。若出现新的必要选择，仅取已授权的普通交流范围。',
  proposedInputIfCompatible:'“眼下这份清单还需要准备些什么？”',
  evaluate:['回应眼前事务','原关系边界是否在普通交流中保持','不自动完成会面或关系建立','NPC建议与玩家采纳分开','不反复讲来源边界']},
 {id:'06-purpose-natural',parent:'03-purpose-unstated',status:'rule-only-awaiting-real-reply',
  rule:'固定承接03，保留真实回复与原要求。若仍未核对且清单在手边，转问递交前还需准备什么；若前轮已合理发生联系或取物，按实际结果调整指代，不重置场景。提供材料与参加原双方核对分别处理，不补核对完成或约定变更。',
  proposedInputIfCompatible:'“清单我先留在手边。递交之前，还有什么东西需要备齐？”',
  evaluate:['回到准备递交的普通场景','不把个人解释写入原约定或世界事实','条件参与者/完成状态保持','不擅自扩大披露范围','允许简短回应与个人做法']}
];
await put('followup-rules.json',followups);
const plan={status:'four-frozen-first-requests-two-rules-awaiting-authorization',modelCalls:0,newAllowance:0,cumulativeRequestAttempts:266,
 endpoint:baseline.endpoint,parameters:baseline.parameters,minimumNarrativeCalls:6,classificationModelCalls:0,
 classificationControl:'Existing local NO_CHECK fixture; classification ability is not evaluated.',
 sourceBrowserCapture:{file:'../browser.capture.json',requestSha256:capture.requestSha256,requestBytes:capture.requestBytes},
 scope:'Two independent non-Canon scene pairs. The previous clinic correction chain is regression evidence only.',
 comparisonLimits:'Only pair-specific relation evidence or stated-reason evidence changes. Tone, refusal, brevity and whether to use the relation/reason can legitimately differ. One output per condition cannot isolate stochastic variation or prove causality, long-term stability or overall literary quality.',
 dataRange:'Original narrative style, current character/background material, synthetic scene/three memory records, explicit source and per-actor state, player question; followups additionally include the exact real parent reply. No formal chat writes or credentials in requests.',
 runConditions:['Obtain explicit batch budget before credential access or sending.','Each planned request at most once; no retry or cherry-picked regeneration.',
 'Retain exact requests, raw responses and failed attempts separately from complete replies.','Stop on transport/incomplete response or a clear material boundary failure; continue offline analysis after stopping.',
 'A concise refusal, personal interpretation or non-disclosure is not by itself failure.','Do not auto-extract/approve/revise facts or agreements.',
 'Create each followup only after the real parent reply and manual state review; no synthetic future reply.',
 'Record utterance, listener reception and explicit host receipt separately; never automatically share knowledge.'],
 cases,followups};
await put('prepared.json',plan);
console.log(JSON.stringify({status:plan.status,modelCalls:0,requests:cases.map(c=>({id:c.id,...c.request})),followups:followups.map(f=>({id:f.id,parent:f.parent,status:f.status}))}));
