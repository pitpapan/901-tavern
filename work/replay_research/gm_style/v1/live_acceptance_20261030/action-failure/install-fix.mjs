// Install exactly the verified gate module. Shared six-book generation stays with its owner.
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=import.meta.dirname,home='D:/github/sillyTavern',sourcePath='work/rules_engine/gm_runtime/replay-gate-script.example.js';
const relativePath='public/901-opening-combat/'+sourcePath,path=resolve(home,relativePath);
const hash=x=>createHash('sha256').update(x).digest('hex'),read=async p=>JSON.parse(await readFile(p,'utf8'));
try{await access(resolve(out,'formal-installation.json'));throw Error('Already installed');}catch(e){if(e.code!=='ENOENT')throw e;}
const verified=await read(resolve(out,'verification.json'));assert.equal(verified.status,'pass');assert.equal(verified.formalInstalled,false);
const before=await read(resolve(out,'protected-before.json')),old=await readFile(path);assert.equal(hash(old),before.files[relativePath]);
const project=s=>s.replaceAll('/901-rules-runtime/','/901-opening-combat/').replaceAll('/901-combat-runtime/','/901-opening-combat/');
const source=await readFile(resolve(sourcePath),'utf8'),candidate=project(source);
assert.equal(candidate,await readFile(resolve(out,'gate.fixed.js'),'utf8'));
assert.ok(candidate.includes('if(handlingCombat&&combat?.handleFailure'));assert.ok(!candidate.includes('action_failure_injected'));
await writeFile(resolve(out,'formal-gate.before.js'),old);
await writeFile(path,candidate);assert.equal(await readFile(path,'utf8'),candidate);
const http=await fetch('http://127.0.0.1:8000/901-opening-combat/'+sourcePath+'?actionFailureFix=20261030');assert.ok(http.ok);assert.equal(await http.text(),candidate);
await writeFile(resolve(out,'formal-installation.json'),JSON.stringify({relativePath,beforeSha256:hash(old),sourceSha256:hash(source),installedSha256:hash(candidate),installedAt:new Date().toISOString(),changedFiles:1,sharedGeneratorAndOutputsChanged:false},null,2)+'\n');
console.log(JSON.stringify({installed:true,changedFiles:1,readbackAndHttpMatch:true}));
