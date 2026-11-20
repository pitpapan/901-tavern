import {readFile,writeFile} from 'node:fs/promises';
const E=new URL('./',import.meta.url),N=new URL('fragment-selection-20261115/',E),I=new URL('iteration-200-20261115/',E),id=process.argv[2];
const request=JSON.parse(await readFile(new URL(id+'.request.json',I),'utf8')),raw=await readFile(new URL(id+'.content.txt',I),'utf8');
const fragments=JSON.parse(request.messages[2].content).fragments,bad=[];let value,parseError;
try{value=JSON.parse(raw);}catch(e){parseError=e.message;}
function visit(v,path='reply'){
 if(Array.isArray(v))return v.forEach((x,i)=>visit(x,path+'.'+i));
 if(!v||typeof v!=='object')return;
 if('fragmentId' in v){const f=fragments.find(f=>f.id===v.fragmentId),pos=typeof v.quote==='string'?f?.text.indexOf(v.quote):-1;
  if(!f||pos<0||f.text.indexOf(v.quote,pos+1)!==-1)bad.push({path,selection:v,fragmentText:f?.text??null,reason:!f?'unknown fragment':pos<0?'quote absent':'quote occurs more than once'});}
 Object.entries(v).forEach(([k,x])=>visit(x,path+'.'+k));
}
visit(value);const report={id,parseError,bad,rawRepaired:false};await writeFile(new URL(id+'.selection-audit.json',N),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
