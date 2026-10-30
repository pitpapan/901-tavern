import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const out=import.meta.dirname,home='D:/github/sillyTavern';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const cfg=await read(resolve(out,'config.json')),mode=process.argv[2];
assert.ok(['controlled','fixed-fault','fixed'].includes(mode));
let gate=await readFile(resolve(out,'gate.baseline.js'),'utf8');
if(mode!=='controlled'){
 gate=await readFile(resolve(out,'../../../../../rules_engine/gm_runtime/replay-gate-script.example.js'),'utf8');
 gate=gate.replaceAll('/901-rules-runtime/','/901-opening-combat/');
}
if(mode!=='fixed'){
 const faultKey=mode==='controlled'?'action_failure_injected':'action_failure_fixed_injected';
 const needle="        mark('continuation', { narrationRequests: diagnostic.narrationRequests + 1 });";
 assert.equal(gate.split(needle).length,2);
 gate=gate.replace(needle,`${needle}
        // Explicit single-shot transport fault in this isolated fixture only.
        const faultContext=window.top.SillyTavern.getContext();
        if(!faultContext.chatMetadata.${faultKey}){
          faultContext.updateChatMetadata({${faultKey}:{kind:'controlled_continuation_503',at:new Date().toISOString()}});
          await faultContext.saveChat();throw Object.assign(Error('controlled fixture transport failure'),{status:503});
        }`);
}
if(mode==='fixed-fault'){
 cfg.rounds[16]={id:'native-regenerate',input:'使用原生重新生成，不发新消息。',regenerate:true};
 await writeFile(resolve(out,'config.json'),JSON.stringify(cfg,null,2)+'\n');
 let recorder=await readFile(resolve(out,'recorder.js'),'utf8');
 recorder=recorder.replace('beforeMessages:ctx().chat.length,','beforeMessages:ctx().chat.length-(test.regenerate?1:0),regenerate:!!test.regenerate,');
 await writeFile(resolve(out,'recorder.js'),recorder);
 for(const f of ['config.json','recorder.js'])await copyFile(resolve(out,f),resolve(home,'public',cfg.route.slice(1,-1),f));
}
await writeFile(resolve(out,`gate.${mode}.js`),gate);
await copyFile(resolve(out,`gate.${mode}.js`),resolve(home,'public',cfg.route.slice(1,-1),`gate.${mode}.js`));
const card=await read(resolve(out,'isolated.card.json')),scripts=card.data.extensions.tavern_helper.scripts;
const entry=scripts.find(s=>s.name==='901 帝都初始卡入口');entry.content=entry.content.replace(`${cfg.route}gate.js`,`${cfg.route}gate.${mode}.js`);
const csrf=await fetch('http://127.0.0.1:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const response=await fetch('http://127.0.0.1:8000/api/characters/merge-attributes',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},body:JSON.stringify({avatars:[cfg.name+'.png'],data:{data:{extensions:{tavern_helper:{scripts}}}}})});
const result=await response.json();assert.ok(response.ok);assert.deepEqual(result.failed,[]);assert.deepEqual(result.updated,[cfg.name+'.png']);console.log(JSON.stringify({mode,onlyIsolatedCardChanged:true}));
