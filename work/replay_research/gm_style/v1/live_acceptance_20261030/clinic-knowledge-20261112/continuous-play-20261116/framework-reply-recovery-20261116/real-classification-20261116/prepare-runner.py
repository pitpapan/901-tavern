"""Reuse the bounded sender; release each original response immediately."""
from pathlib import Path
E=Path(__file__).resolve().parent;V=E.parent/'model-verification-20261116'
s=(V/'run-one.mjs').read_text(encoding='utf-8')
replacements={"approval.userText,'授予6次模型'":"approval.userText,'接回真实分类：普通对白和明确机械动作，两轮4次上限'","ledger.limit,6":"ledger.limit,4","approval.maximumCalls,6":"approval.maximumCalls,4",
 "assert.ok(/^round-\\d\\d(?:-verification)?$/.test(id));":"assert.ok(['dialogue-classification','dialogue-narration','mechanical-classification','mechanical-narration'].includes(id));\nconst kind=id.endsWith('-classification')?'classification':'narration';",
 "new URL('live/run.json',E)":"new URL('../model-verification-20261116/run.json',L)",
 "const a={id,customRequest:":"const a={id,kind,customRequest:","{...r,kind:'narration'}":"{...r,kind}"}
for old,new in replacements.items():assert s.count(old)==1,old;s=s.replace(old,new)
anchor="console.log(JSON.stringify({preflight:true"
assert s.count(anchor)==1
s=s.replace(anchor,"const heldPrefix=resolve(requestFile).slice(0,-'.request.json'.length);\nconst capture=await read(heldPrefix+'.capture.json');assert.equal(capture.kind,kind);assert.equal(capture.classificationFixture,false);assert.equal(capture.browserUpstreamCalls,0);\n"+anchor)
anchor='await put(ledgerUrl,ledger);console.log(JSON.stringify({...a,remaining:ledger.remaining,cumulative:ledger.cumulative}));'
assert s.count(anchor)==1
release="""if(a.state==='completed'&&a.rawUnmodified&&a.finishReason==='stop'){
 assert.equal(await readFile(heldPrefix+'.request.json','utf8'),raw);
 await writeFile(heldPrefix+'.sent-request.json',raw,{flag:'wx'});
 await writeFile(heldPrefix+'.raw-response.txt',response.responseText,{flag:'wx'});
 await put(new URL(id+'.relay-proof.json',L),{id,kind,customRequest:a.customRequest,requestSha256:a.requestSha256,rawResponseSha256:a.rawResponseSha256,exactRequestBytes:true,browserUpstreamCalls:0},true);
 await writeFile(heldPrefix+'.release.json',JSON.stringify({rawResponse:true,actualResponseFrom:id,externalCalls:0}),{flag:'wx'});a.relayReleased=true;
}
"""
s=s.replace(anchor,release+anchor);(E/'run-one.mjs').write_text(s,encoding='utf-8')
