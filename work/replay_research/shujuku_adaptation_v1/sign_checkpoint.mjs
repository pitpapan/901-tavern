
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const folder=path.dirname(fileURLToPath(import.meta.url));
const payload=JSON.parse(fs.readFileSync(path.join(folder,'checkpoint_payload_unsigned.json'),'utf8'));
function canonicalize(value){
 if(Array.isArray(value))return value.map(canonicalize);
 if(!value || typeof value!=='object')return value;
 return Object.keys(value).sort().reduce((out,key)=>(out[key]=canonicalize(value[key]),out),{});
}
// Exact algorithm from installed src/shared/utils.ts:91.
function hashUserInput_ACU(text){
 if(!text)return '';
 const normalized=String(text).trim().replace(/\r\n/g,'\n').replace(/\r/g,'\n');
 let hash=2166136261;
 for(let i=0;i<normalized.length;i++){
  hash ^= normalized.charCodeAt(i);
  hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
 }
 return hash.toString(36);
}
const integrity={algorithm:'fnv1a',payloadHash:hashUserInput_ACU(JSON.stringify(canonicalize(payload)))};
for (const section of [payload.tableSnapshot,payload.templateSnapshot.data,payload.guideSnapshot.data]){
 for (const [key,sheet] of Object.entries(section)){
  if(!key.startsWith('sheet_'))continue;
  if(sheet.uid!==key || sheet.content[0][0]!=='row_id')throw new Error('Invalid identity '+key);
  const ids=new Set();
  for(const row of sheet.content.slice(1)){
   if(row.length!==sheet.content[0].length || !String(row[0]).trim() || ids.has(row[0]))throw new Error('Invalid row '+key);
   ids.add(row[0]);
  }
 }
}
const output=path.join(folder,'901_当前分支_清洁五表.checkpoint.json');
fs.writeFileSync(output,JSON.stringify({...payload,integrity},null,2),'utf8');
console.log(JSON.stringify({output,integrity,rows:Object.fromEntries(Object.entries(payload.tableSnapshot).filter(([k])=>k.startsWith('sheet_')).map(([k,v])=>[k,v.content.length-1]))}));
