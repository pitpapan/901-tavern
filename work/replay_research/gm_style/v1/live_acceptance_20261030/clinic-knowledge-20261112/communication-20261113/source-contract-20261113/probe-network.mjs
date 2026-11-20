// DNS and unauthenticated HEAD only: no credentials, request body, or model invocation.
import {lookup} from 'node:dns/promises';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const mode=process.argv[2];assert.ok(['restricted','escalated'].includes(mode));
const out=new URL('network-retest-20261113/',import.meta.url);await mkdir(out,{recursive:true});
const result={mode,startedAt:new Date().toISOString(),node:process.version,host:'cdn.sta1n.cn',method:'HEAD',endpoint:'https://cdn.sta1n.cn/v1/chat/completions',credentialsRead:false,modelCalls:0};
let start=performance.now();
try{result.dns={ok:true,addresses:await lookup(result.host,{all:true}),elapsedMs:Math.round(performance.now()-start)};}
catch(e){result.dns={ok:false,code:e.code,message:e.message,elapsedMs:Math.round(performance.now()-start)};}
start=performance.now();
try{const r=await fetch(result.endpoint,{method:'HEAD',redirect:'error',signal:AbortSignal.timeout(10000)});result.https={reachable:true,status:r.status,elapsedMs:Math.round(performance.now()-start)};await r.body?.cancel();}
catch(e){result.https={reachable:false,code:e.cause?.code??e.code,message:e.message,elapsedMs:Math.round(performance.now()-start)};}
result.finishedAt=new Date().toISOString();await writeFile(new URL('network-'+mode+'.json',out),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
