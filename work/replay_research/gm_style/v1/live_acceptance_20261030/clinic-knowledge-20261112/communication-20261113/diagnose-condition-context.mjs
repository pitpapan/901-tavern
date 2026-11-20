// Targeted evidence from the original B requests, not an automatic semantic review.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=new URL('./',import.meta.url),out=new URL('conditions-20261113/',base),live=new URL('continuations/live-20261113/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const rows=(await readFile(new URL('continuations/B.completed.seed.jsonl',base),'utf8')).trim().split(/\r?\n/).map(s=>JSON.parse(s));
const promise=rows.at(-1).variables[0].stat_data['901_rules_poc'].storyKnowledge.events['received.communication.promise'];
const anchor=promise.data.sourceAnchor,quote=promise.data.disclosure.sourceQuote;
assert.equal(rows[anchor.messageId+1].mes,anchor.text);assert.equal(rows[anchor.messageId+1].is_system,true);
const samples=[];
for(const id of ['B1','B2']){
 const raw=await readFile(new URL(id+'.request.json',live)),body=JSON.parse(raw),flat=body.messages.map(m=>m.content).join('\n');
 const context=JSON.parse(body.messages.at(-1).content.split('【901逐角色知情投影】\n')[1].split('\n')[0]);
 const note=context.actorKnowledge[1].facts[0].sources.find(s=>s.disclosure);
 assert.equal(note.disclosure.sourceQuote,quote);assert.equal(note.sourceAnchor.text,undefined);assert.equal(note.senderId,null);
 assert.ok(!flat.includes(anchor.text));assert.ok(!flat.includes('同一来客'));assert.ok(!flat.includes('布莱特听到并答应'));
 const responseRaw=await readFile(new URL(id+'.raw-response.txt',live)),response=JSON.parse(responseRaw),capture=await read(new URL(id+'.response.json',live));
 assert.equal(sha(responseRaw),capture.responseBodySha256BeforePrivacyRedaction);
 const content=await readFile(new URL(id+'.content.txt',live),'utf8');assert.equal(content,response.choices[0].message.content);
 samples.push({id,requestFile:'../continuations/live-20261113/'+id+'.request.json',requestSha256:sha(raw),rawResponseFile:'../continuations/live-20261113/'+id+'.raw-response.txt',rawResponseSha256:sha(responseRaw),fullOutput:content,sourceQuoteRetained:true,belief:context.actorKnowledge[1].facts[0].belief,sourceContextMissing:true,sourceProjection:note});
}
const first=await read(new URL('B1.request.json',live));
const snippets=first.messages[0].content.split('\n').filter(l=>l.length<2000&&['压低声音不自动保证保密','提议不是同意','最新数据与记录','已确认','原约定'].some(s=>l.includes(s)));
const previous=await read(new URL('../live-20261113/08-confidential-asked.request.json',base));
assert.ok(previous.messages.some(m=>m.content.includes(anchor.text)));
const report={version:'source-context-20261113',modelCalls:0,cumulative:252,remaining:0,sourceMessage:{...anchor,is_system:true},sourceSpeaker:'保留消息11告知关系、消息12补充约定的同一位可信来客；没有实名，不补actorId',quotedWe:'在“同一来客向布莱特补充约定”的原文中，按说话者与受话者承接为该来客与布莱特；并非御临风和黄泉',restrictedRecipients:['御临风','黄泉'],condition:'与该来客单独确认后再说，不能仅据地点变化或布莱特自己的承诺认定完成',satisfactionOrChangeBeforeB2:null,
 classification:{fieldOmission:'sourceQuote及confirmed未漏；sourceAnchor.text在context映射中被删去。',lostReferenceContext:'真实B1/B2聊天历史过滤is_system来源，senderId为空且没有来源原文，造成引用主体/指代语境缺失。',instructionConflict:'限定检查未发现允许换地点自动解除约定的直接指令；私谈只是表达选择。记忆3行无解约事件。B1自己的新承诺不是原条件满足证据。',modelDeviation:'B1实际承诺未保留原确认条件；没有实际泄密。不能证明此次缺失是唯一原因，也不能仅凭本地修复声称模型会改正。'},
 dataPath:['显式receive保存sourceAnchor.text并按原MVU落盘读回','read核对原文、swipe及分支','context旧sources投影只留chatId/messageId/swipeId，不含text','registerReplayGate.generateKnown → knowledge.generate → generateRaw','JS-Slash-Runner src/function/generate/dataProcessor.ts:262过滤is_system历史','最终B1/B2仅剩无主体语境的sourceQuote'],
 smallestChange:{file:'work/rules_engine/gm_runtime/story-knowledge.mjs',behavior:'sources.sourceAnchor补回已校验的text',newExecutionOrWriteMechanism:false,instructionsChanged:false,disclosureSchemaChanged:false},
 source08HadFullContext:true,scope:'仅B条件与相邻A/B正文，不扩大全库审计',relevantOriginalInstructionExcerpts:snippets,samples};
await writeFile(new URL('diagnosis.json',out),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sourceContextMissingIn:['B1','B2'],originalPromiseHidden:true,original08HadFullSource:true,rawResponsesVerified:2,productChanged:'sourceAnchor.text projection only',modelCalls:0}));
