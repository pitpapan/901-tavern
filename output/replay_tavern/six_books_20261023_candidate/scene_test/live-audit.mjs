import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.cwd(),out=resolve(root,'output/replay_tavern/six_books_20261023_candidate/scene_test/audit-live');await mkdir(out,{recursive:true});
const imp=p=>import(pathToFileURL(resolve(root,p)));
const {createOpeningFixture}=await imp('work/rules_engine/gm_runtime/opening.mjs');
const {createReplayCheckRuntime}=await imp('work/rules_engine/gm_runtime/replay-check.mjs');
const {replayClassificationRequest,parseReplayDecision,compactNarrationFacts}=await imp('work/rules_engine/gm_runtime/adjudication-gate.mjs');
const {createOpeningEnemy}=await imp('work/rules_engine/combat/opening.mjs');
const {initializeTestState}=await imp('work/rules_engine/mvu_poc/adapter.mjs');
const settings=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/settings.json','utf8')).oai_settings;
if(settings.chat_completion_source!=='makersuite')throw Error('Configured provider changed; no model substitution');
const model=settings.google_model;if(!model?.startsWith('gemini-'))throw Error('Current Gemini model unavailable');
const csrf=await fetch('http://localhost:8000/csrf-token');const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
async function generate(request){
 const messages=request.ordered_prompts.map(p=>p==='user_input'?{role:'user',content:request.user_input}:p);
 const r=await fetch('http://localhost:8000/api/backends/chat-completions/generate',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},body:JSON.stringify({chat_completion_source:'makersuite',model,messages,stream:false,temperature:.3,max_tokens:1500,use_makersuite_sysprompt:true,reasoning_effort:'low'}),signal:AbortSignal.timeout(55000)});
 const j=await r.json();if(!r.ok)throw Error(`Gemini HTTP ${r.status}: ${j.error?.message??j.message??'request rejected'}`);
 const text=j.choices?.[0]?.message?.content??j.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text??'').join('');
 if(typeof text!=='string')throw Error('No model text');return text;
}
const cases=[
 {id:'opposed',scene:'御临风和城卫正在当面争论通行。城卫主动坚持封锁，允许以风度＋社交主动说服、对抗城卫意志＋社交。当前人物guard是这名城卫的实卡；不可用固定DC替代他的主动阻挠。',action:'我向眼前这名城卫陈述医馆的急事，试图说服他让我们通行。',expected:'opposed'},
 {id:'save',scene:'已确认的机关施加单次意志豁免DC3：成功抵住侵入念头，失败被其扰乱判断。本次只检定，不另造状态点数。',action:'我试着集中精神，抵住侵入脑海的念头。',expected:'save'},
 {id:'flow',scene:'御临风在安全空地，当前流风22，尚未开启流风加速；他明确决定发动自己的已持有能力。',action:'我消耗两点流风，启动流风加速。',expected:'ability'},
 {id:'extended',scene:'翻查损坏卷宗须感知＋洞察延长检定，任务ID archive-search，累计目标8成功，每周期5分钟，最多3周期。已确认本次完成第一个5分钟周期。',action:'我仔细翻查这些卷宗，花五分钟找出缺失的线索。',expected:'extended'}
];
const only=process.argv.find(x=>x.startsWith('--only='))?.slice(7);
const results=only?(JSON.parse(await readFile(resolve(out,'results.json'),'utf8'))).results.filter(c=>c.id!==only):[];
for(const c of cases.filter(c=>!only||c.id===only)){
 try{
 let data={stat_data:{}},draws=0;const chatId=`audit-live-${c.id}`,anchor={chatId,messageId:1,swipeId:0};
 const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);await writeFile(resolve(out,`${c.id}-state.json`),JSON.stringify(data,null,2));}};
 const fixture=createOpeningFixture(),guard=createOpeningEnemy('cityGuard','guard');guard.state.skills.社交={level:1,subs:{}}; // Explicit isolated-test scene qualification, not a canon NPC edit.
 await initializeTestState({mvu,getAnchor:()=>anchor,expectedChatId:chatId,actors:{...fixture.actors,guard:{name:'隔离测试城卫',state:guard.state}}});
 const runtime=createReplayCheckRuntime({mvu,getAnchor:()=>anchor,expectedChatId:chatId,baseline:fixture.baseline,drawDice:()=>{draws++;return Array.from({length:512},()=>Math.floor(Math.random()*10)+1);}});
 const p={...anchor,text:c.action},context={original:p,latest:p};
 const prompt=replayClassificationRequest({context,scene:c.scene,skills:runtime.currentPlayer().skills,state:runtime.currentPlayer(),ruleContext:runtime.ruleContext()});
 const raw=await generate(prompt);await writeFile(resolve(out,`${c.id}-classification.txt`),raw);const decision=parseReplayDecision(raw);
 const result=await runtime.settle({operationId:`gm-runtime/${chatId}/1/0`,request:decision.request,context,ruleContext:{scene:c.scene,actorIds:['player','guard']}});
 const before=draws,repeat=await runtime.settle({operationId:`gm-runtime/${chatId}/1/0`,request:decision.request,context,ruleContext:{scene:c.scene,actorIds:['player','guard']}});
 let narration=null;if(result.status==='applied')narration=await generate({ordered_prompts:[{role:'system',content:'你是剧情主持。只用一两句中文叙述JS已经确认的事实，不能改判结果、补发资源或替玩家新增行动。不要输出骰数或对手隐藏数据。'},'user_input'],user_input:JSON.stringify({scene:c.scene,action:c.action,facts:compactNarrationFacts(result,runtime.currentPlayer())})});
 const pass=decision.request?.action===c.expected&&result.status==='applied'&&repeat.status==='already_applied'&&draws===before;
 results.push({id:c.id,model,decision,result,repeat:repeat.status,draws,narration,pass});
 console.log(JSON.stringify({id:c.id,model,action:decision.request?.action,status:result.status,pass}));
 }catch(e){results.push({id:c.id,model,pass:false,error:e.message});console.log(JSON.stringify({id:c.id,pass:false,error:e.message}));}
 await writeFile(resolve(out,'results.json'),JSON.stringify({mode:'Real Gemini via local SillyTavern backend; actual runtime reducer with isolated file-backed MVU harness, not browser UI',results},null,2));
}
process.exitCode=results.every(r=>r.pass)?0:1;
