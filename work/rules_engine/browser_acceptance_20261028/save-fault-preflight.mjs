// Exercise the installed ST atomic writer on a disposable WORKSPACE file only.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire('D:/github/sillyTavern/package.json');
const write=require('write-file-atomic').sync;
const file=new URL('save-fault-probe.tmp.jsonl',import.meta.url);
fs.writeFileSync(file,'before\n');
let code;
try {
 fs.chmodSync(file,0o444);
 try{write(fileURLToPath(file),'after\n','utf8');}catch(error){code=error.code;}
 assert.ok(code,'Read-only did not reject the real atomic writer');
 assert.equal(fs.readFileSync(file,'utf8'),'before\n');
 console.log(JSON.stringify({status:'pass',writer:'installed SillyTavern write-file-atomic.sync',fault:'workspace file read-only',error:code,originalBytesUnchanged:true}));
} finally {fs.chmodSync(file,0o666);fs.unlinkSync(file);}
import {fileURLToPath} from 'node:url';
