// Offline replay of the saved first-attempt MVU snapshot. No network or live writes.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.cwd(),out=new URL('./',import.meta.url);
const {createReplayCheckRuntime}=await import(pathToFileURL(resolve(root,'work/rules_engine/gm_runtime/replay-check.mjs')));
const {runGuardedTurn}=await import(pathToFileURL(resolve(root,'work/rules_engine/gm_runtime/adjudication-gate.mjs')));
const {createRecoveryFixture}=await import(pathToFileURL(resolve(root,'work/rules_engine/gm_runtime/recovery-fixture.mjs')));
const rows=(await readFile(new URL('live-attempt.jsonl',out),'utf8')).trim().split('\n').map(JSON.parse);
const recorded=rows.at(-1).extra['901_replay_gate'],player=recorded.pending.original;
const original=rows[player.messageId+1].variables[0],request=recorded.pending.request;
const results=[];
for(const mode of ['valid-decision','missing-reason','classification-http-429','local-save-rejected']){
  let data=structuredClone(original),stage='',writes=0,narrations=0,error=null;
  const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async next=>{
    if(mode==='local-save-rejected')throw Error('Synthetic local MVU write rejected');
    writes++;data=structuredClone(next);
  }};
  const runtime=createReplayCheckRuntime({baseline:createRecoveryFixture().baseline,mvu,getAnchor:()=>player,expectedChatId:player.chatId,
    drawDice:()=>{throw Error('This medicine must not roll dice');}});
  let decision;
  try{await runGuardedTurn({player,onStage:s=>{stage=s;},classify:async()=>{
    if(mode==='classification-http-429')throw Object.assign(Error('Synthetic API quota rejection'),{status:429});
    decision={status:'RECOVERY_REQUIRED',...(mode==='missing-reason'?{}:{reason:'明确服用药B'}),request};return JSON.stringify(decision);
  },settle:args=>runtime.settle(args),narrate:async()=>{narrations++;return '服药后伤势减轻，仍有余伤。';},post:async()=>{}});
  }catch(e){error={name:e.name,message:e.message,code:e.code??null,status:e.status??null};}
  const state=data.stat_data['901_rules_poc'];
  results.push({mode,stage,error,requestSurvivesParsing:!!decision?.request,writes,narrations,revision:state.revision,
    operationCount:Object.keys(state.operations).length,health:state.actors.player.state.health,
    medicineB:state.actors.player.state.inventory.find(x=>x.name==='药B').quantity,
    otherNamespacesUnchanged:JSON.stringify({...original.stat_data,'901_rules_poc':null})===JSON.stringify({...data.stat_data,'901_rules_poc':null})});
}
await writeFile(new URL('offline-diagnosis.json',out),JSON.stringify({scope:'Saved state replay, model responses and transport errors are explicitly synthetic; not a reconstruction of the lost raw response.',results},null,2)+'\n');
console.log(JSON.stringify(results,null,2));
