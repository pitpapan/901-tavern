// Local preparation only. Reuse actual saved responses, never invent preceding model turns.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createStoryKnowledgeRuntime} from './package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs';
import {CLINIC_KNOWLEDGE_CATALOG as catalog} from './package/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';
const base=new URL('./',import.meta.url),live=new URL('../live-20261113/',base),out=new URL('continuations/',base);
await mkdir(out,{recursive:true});
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const rows=[
 {id:'A',prior:'05-known-unasked',first:'“我们三个去见馆主，除了递信，还有什么最好先互相说清楚？”',nextIfShared:'“那见到馆主时，我先问接待还是先问住宿？”',nextIfNotShared:'“先把你觉得该说的告诉黄泉；拿不准的就留着当面问。”',purpose:'无保密约定：从送信住宿承接到是否需要互通信息；允许披露或合理不提，不以提及旧交为唯一成功'},
 {id:'B',prior:'08-confidential-asked',first:'御临风把声音压低，只向布莱特问：“刚才那件事，是你还不清楚，还是现在不方便说？”',next:'“那先不追问。推荐信递上以后，我该先问接待还是住宿？”',purpose:'约定保持有效：压低音量不解除对御临风的保密要求；随后回到送信事务，观察承接而非重复询问同一关系'}
];
for(const row of rows){
 const seed=(await readFile(new URL(row.prior+'.seed.jsonl',base),'utf8')).trim().split(/\r?\n/).map(s=>JSON.parse(s));
 const body=await read(new URL(row.prior+'.request.json',live)),responseRaw=await readFile(new URL(row.prior+'.raw-response.txt',live)),response=JSON.parse(responseRaw);
 const content=await readFile(new URL(row.prior+'.content.txt',live),'utf8');assert.equal(response.choices[0].message.content,content);
 const user=body.messages.at(-3);assert.equal(user.role,'user');
 const last=seed.at(-1),variables=structuredClone(last.variables[last.swipe_id??0]);
 const metadata={nonCanon:true,reusedActualResponse:row.prior,responseSha256:sha(responseRaw)};
 seed.push({name:'御临风',is_user:true,is_system:false,mes:user.content,swipe_id:0,variables:[structuredClone(variables)],extra:metadata});
 seed.push({name:'901 帝都初始卡 独立事项版 20261105',is_user:false,is_system:false,mes:content,swipe_id:0,variables:[structuredClone(variables)],extra:metadata});
 const chat=seed.slice(1),chatId=variables.stat_data['901_rules_poc'].chatId;
 const k=createStoryKnowledgeRuntime({catalog,mvu:{getMvuData:()=>variables},tavern:{chatId,chat},getAnchor:()=>({chatId,messageId:chat.length-1,swipeId:0})});
 assert.deepEqual(k.context().actorKnowledge.map(a=>a.facts.length),[0,1,0]);
 row.context=k.context();row.precedingResponse={id:response.id,model:response.model,requestSha256:sha(await readFile(new URL(row.prior+'.request.json',live))),rawResponseSha256:sha(responseRaw),content};
 row.first+='\n（桌外隔离验收，非正式剧情：承接前文，写布莱特的回应；可以回应在场同伴，不替御临风新增对白、心理或决定。）';
 row.seedFile=row.id+'.seed.jsonl';await writeFile(new URL(row.seedFile,out),seed.map(s=>JSON.stringify(s)).join('\n')+'\n');
}
const plan={status:'prepared-not-sent',modelCallsThisTask:0,cumulative:248,remaining:0,chains:rows,newRoundsPerChain:2,plannedNarrationCalls:4,classification:{localControl:'NO_CHECK synthetic ordinary-dialogue route, explicitly not a model result',newModelCalls:0,ifActualClassifierRequired:'Each live ordinary round adds one call: total 8 instead of 4; obtain explicit count approval before any send.'},transport:{endpoint:'https://cdn.sta1n.cn/v1/chat/completions',credentials:'Existing active custom key for authentication only; no credential read or send authorized this task.'},laterRoundRules:['No second-round full request is frozen until the first-round actual response exists.','Keep full prior user/assistant text, selected swipe and retained state; do not insert an ideal response or correct answer.','Review actual speech and actual reception separately. Only an explicit source-bound host receipt may change named listeners’ knowledge; ambiguous reception stays ungranted.','If A first round actually shares information, avoid duplicate transfer and use nextIfShared. Otherwise nextIfNotShared invites the NPC to choose what is useful, without stating the secret.','B changes volume only, not the promise, recipients or release condition. No fabricated release event.','Keep current memory tables and unrelated entries. A summary or player question never creates a grant.','Stop on transport/protocol failure without retry; do not repeat unsatisfactory prose until it passes.'],dataScope:['Original style, character description, six-book triggered excerpts and retained chat history.','Three nonCanon memory rows through the existing database mechanism.','Original private receipt, optional explicit promise, per-actor knowledge and source anchors.','Actual prior response 05 or 08, first isolated player input, then first new response and actual state for the next round.'],unverified:['New continuous model output not run.','No general secrecy or world-clock proof.']};
await writeFile(new URL('prepared.json',out),JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify({prepared:rows.map(r=>({id:r.id,seedFile:r.seedFile,first:r.first})),newModelCalls:0,plannedNarrationCalls:4}));
