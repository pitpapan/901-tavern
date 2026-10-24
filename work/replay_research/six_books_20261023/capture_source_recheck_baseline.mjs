// Record only runtime modules omitted from the old installation ledger.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,relative,sep} from 'node:path';
import {createHash} from 'node:crypto';
const base=resolve('output/replay_tavern/six_books_20261023_candidate'),runtime=resolve('D:/github/sillyTavern/public/901-opening-combat');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const manifest=await read(resolve(base,'runtime_patch_manifest.json')),journal=await read(resolve(base,'installation.json')),modules=[];
for(const m of manifest.modules){
 const rel=relative(resolve(base,'runtime_patch/901-opening-combat'),resolve(base,m.destination));
 if(rel.startsWith('..')||!rel.startsWith('work'+sep))throw Error('Invalid module path');
 const path=resolve(runtime,rel);if(journal.modules.some(x=>resolve(x.path)===path))continue;
 try{const bytes=await readFile(path);modules.push({path,sha256:createHash('sha256').update(bytes).digest('hex')});}catch(e){if(e.code!=='ENOENT')throw e;}
}
await writeFile(resolve(base,'source-recheck-baseline.json'),JSON.stringify({reason:'Local dynamic imports omitted from earlier relative-only closure; observed before replacement',modules},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({observedUnjournaledModules:modules}));
