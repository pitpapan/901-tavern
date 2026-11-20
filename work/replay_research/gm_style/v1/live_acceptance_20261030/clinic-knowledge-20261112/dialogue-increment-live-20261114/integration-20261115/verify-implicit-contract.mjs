// Read-only compatibility check of the shared default contract and delivered schema.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createAssertionContract} from '../../../../../../../../../901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js';
const E=new URL('./',import.meta.url),N=new URL('implicit-reception-20261115/',E);
let before=await readFile(new URL('before/assertion-contract.js',N),'utf8');
before=before.replace("'../src/contracts.js'",JSON.stringify(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/src/contracts.js')).href));
const oldFactory=(await import('data:text/javascript;base64,'+Buffer.from(before).toString('base64'))).createAssertionContract;
const old=oldFactory(()=> 'compatibility'),current=createAssertionContract(()=> 'compatibility');
for(const purpose of [undefined,'assertion','reception']){
 const input=old.makeAssertionInput({stage:'source',documents:[{id:'d',text:'甲说：“乙已离开。”\r\n🙂'}],targets:[{id:'t',documentId:'d',start:0,end:11}]});
 assert.deepEqual(current.buildAssertionMessages(input,{purpose}),old.buildAssertionMessages(input,{purpose}));
 assert.deepEqual(current.buildAssertionSchema(input),old.buildAssertionSchema(input));
}
assert.equal(String(current.checkAssertionReply),String(old.checkAssertionReply));
const source=await readFile(resolve('TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs'),'utf8'),prior=await readFile(new URL('before/story-dialogue-knowledge.mjs',N),'utf8');
for(const [a,b] of [['check(reply){','\n// Versioned generation wire'],['check(wire){','\nexport function createDialogueKnowledge']]){
 assert.equal(source.slice(source.indexOf(a),source.indexOf(b)),prior.slice(prior.indexOf(a),prior.indexOf(b)));
}
const r=JSON.parse(await readFile(new URL('iteration-200-20261115/implicit.original.nested.request.json',E),'utf8'));
const item=r.response_format.json_schema.schema.properties.units.items;
assert.match(item.properties.utterances.items.properties.receptions.items.properties.evidence.description,/接收/);
assert.match(item.properties.utterances.items.properties.receptions.items.properties.recipientSpans.description,/应答/);
const report={defaultMessagesByteEquivalent:true,defaultAssertionSchemaUnchanged:true,sharedValidatorSourceIdentical:true,legacyAndBoundValidatorsSourceIdentical:true,evidenceAndRecipientDescriptionsPresentInActualSentRequest:true};
await writeFile(new URL('contract-verification.json',N),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
