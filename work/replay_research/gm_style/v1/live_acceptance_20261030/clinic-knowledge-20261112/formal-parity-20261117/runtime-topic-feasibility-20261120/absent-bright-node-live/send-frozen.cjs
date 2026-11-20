const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

const live = __dirname;
const root = path.dirname(live);
const prep = path.join(root, 'absent-bright-preparation-20261120');
const endpoint = 'https://cdn.sta1n.cn/v1/chat/completions';
const requestedModel = '[抗截断]gemini-3.8-flash';
const planHash = 'ec03b72414f17c04d8c83cda22d8c825e9287aab1017e467356d81865a386455';
const bodyHash = 'ed088edaa46a54aa6df67cd0eadb3a4db83bd60c41647632c42ce0f93fb465f9';
const bodyLength = 109191;
const baseline = 620;
const limit = 10;

const read = file => fs.readFileSync(file);
const json = file => JSON.parse(read(file));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const at = () => new Date().toISOString();
const dump = value => JSON.stringify(value, null, 2) + '\n';
const print = value => process.stdout.write(JSON.stringify(value) + '\n');
const put = (name, bytes) => fs.writeFileSync(path.join(live, name), bytes, { flag: 'wx', flush: true });
const ledger = path.join(live, 'run.json');

function persist(run) {
 const temp = path.join(live, 'run.json.pending');
 fs.writeFileSync(temp, dump(run), { flag: 'wx', flush: true });
 fs.renameSync(temp, ledger);
}

function safeError(error, key) {
 const sanitize = value => {
  const original = String(value ?? '');
  return (key ? original.split(key).join('[REDACTED]') : original).replace(/Bearer\s+[^\s"'<>]+/gi,'Bearer [REDACTED]');
 };
 return { name: sanitize(error?.name ?? 'Error'), code: sanitize(error?.code ?? 'LOCAL_ERROR'),
  message: sanitize(error?.message), ...(error?.verifyCode != null && { verifyCode: sanitize(error.verifyCode) }),
  ...(error?.verifyMessage != null && { verifyMessage: sanitize(error.verifyMessage) }) };
}

function post(body,key){
 return new Promise(resolve=>{
  const chunks=[];
  const started=Date.now();
  let status,headersAt,complete=false,finished=false;
  const settle=(error=null)=>{
   if(finished)return;
   finished=true;clearTimeout(timer);
   resolve({status,headersAt,bytes:Buffer.concat(chunks),complete,error,elapsedMs:Date.now()-started});
  };
  const req=https.request(endpoint,{method:'POST',agent:false,headers:{
   'Content-Type':'application/json','Accept':'application/json','Accept-Encoding':'identity','Content-Length':body.length,'Authorization':'Bearer '+key
  }},res=>{
   status=res.statusCode;headersAt=at();
   res.on('data',data=>chunks.push(data));
   res.on('end',()=>{complete=res.complete;settle(complete?null:{code:'INCOMPLETE_BODY',message:'HTTP response ended before the complete body.'});});
   res.on('aborted',()=>settle({code:'ABORTED_BODY',message:'HTTP response stream was aborted.'}));
   res.on('error',e=>settle(safeError(e,key)));
  });
  const timer=setTimeout(()=>{settle({code:'LOCAL_REQUEST_TIMEOUT',message:'The original 180-second request deadline expired.'});req.destroy();},180000);
  req.on('error',e=>settle(safeError(e,key)));
  req.end(body);
 });
}


function close(run, plan, reason) {
 run.closed = true;
 run.closedAt = at();
 run.stopReason = reason;
 run.unusedThisClosedBatch = run.remaining;
 run.unattemptedSlots = plan.schedule.slice(run.used).map(s => ({ slot: s.slot, sha256: s.requestSha256 }));
 run.remaining = 0;
 run.availableAfterClose = 0;
 run.httpResponses = run.attempts.filter(a => a.httpStatus !== null).length;
 run.successfulHttpResponses = run.attempts.filter(a => a.httpStatus === 200).length;
 run.completeResponses = run.attempts.filter(a => a.state === 'complete').length;
 run.technicalFailures = run.used - run.completeResponses;
 persist(run);
}

const plan = json(path.join(prep, 'plan.json'));
const auth = json(path.join(live, 'authorization.json'));
const run = json(ledger);
let phase = 'preflight';
let key = '';

(async () => {
 try {
  assert.equal(auth.userMessageId, '01a1faf6-2d48-7c81-a2d1-4c5f091f9e71');
  assert.equal(auth.userReply, '授权这份冻结请求最多10次，直接测试并审核');
  assert.equal(auth.verifiedInSourceThread, true);
  assert.deepEqual([auth.endpoint, auth.requestedModel, auth.baseline, auth.limit], [endpoint, requestedModel, baseline, limit]);
  assert.deepEqual([auth.planHash, auth.requestSha256, auth.requestBytes], [planHash, bodyHash, bodyLength]);
  assert.equal(auth.noRetries && auth.stopsOnSharedConnectionOrServiceRejection, true);
  assert.deepEqual([run.closed, run.used, run.remaining, run.cumulative, run.attempts.length], [false, 0, limit, baseline, 0]);
  assert.notEqual(process.env.NODE_TLS_REJECT_UNAUTHORIZED, '0', 'TLS verification is required');
  assert.equal(hash(read(path.join(prep, 'plan.json'))), planHash);
  const prevBytes = read(path.resolve(live, auth.priorClosedLedger));
  const prev = JSON.parse(prevBytes);
  assert.equal(hash(prevBytes), auth.priorClosedLedgerSha256);
  assert.deepEqual([prev.closed, prev.cumulative, prev.remaining], [true, baseline, 0]);
  assert.deepEqual([plan.authorizationRequiredFor.destination, plan.parameters.model], [endpoint, requestedModel]);
  assert.deepEqual(plan.schedule.map(s => s.slot), Array.from({length: limit}, (_, index) => index + 1));
  for (const s of plan.schedule) {
   assert.deepEqual([s.bytes, s.requestSha256], [bodyLength, bodyHash]);
  }
  for (const [file, expected] of Object.entries(auth.protectedEvidenceSha256)) {
   assert.equal(hash(read(path.resolve(live, file))), expected, 'Protected evidence changed');
  }
  const body = read(path.join(prep, 'huang-absent-bright.request.json'));
  assert.equal(hash(body), bodyHash);
  assert.equal(body.length, bodyLength);
  const parsed = JSON.parse(body);
  assert.equal(parsed.messages.length, 16);
  assert.ok(parsed.messages[15].content.includes('裁定路径：NO_CHECK'));
  const {messages, ...parameters} = parsed;
  assert.deepEqual(parameters, plan.parameters);
  assert.deepEqual(parameters, {model: requestedModel, temperature: 1, max_tokens: 4096, stream: false,
   presence_penalty: 0, frequency_penalty: 0, top_p: 1});
  const settings = json('D:/github/sillyTavern/data/default-user/settings.json').oai_settings;
  assert.ok(settings.chat_completion_source === 'custom' && settings.custom_url === 'https://cdn.sta1n.cn/v1' &&
   settings.custom_model === requestedModel && !settings.custom_include_body && !settings.custom_exclude_body &&
   !settings.custom_include_headers, 'Configured service and overrides must match');

  phase = 'credential-read';
  try {
   const keys = json('D:/github/sillyTavern/data/default-user/secrets.json').api_key_custom.filter(x => x.active);
   if (keys.length !== 1 || typeof keys[0].value !== 'string' || !keys[0].value.trim() || /[\r\n]/.test(keys[0].value)) {
    throw new Error();
   }
   key = keys[0].value;
  } catch {
   throw new Error('Existing approved service credential is not usable');
  }

  let stop = 'frozen-schedule-exhausted';
  run.openedAt = at();
  run.nodeVersion = process.version;

  for (const s of plan.schedule) {
   phase = 'pre-send-guard';
   assert.deepEqual([run.used + 1, run.cumulative, run.remaining], [s.slot, baseline + run.used, limit - run.used]);
   assert.ok(run.used < limit);
   const call = run.cumulative + 1;
   const request = call + '.request.json';
   put(request, body);
   const saved = read(path.join(live, request));
   assert.ok(saved.equals(body));
   const row = {call, slot: s.slot, target: 'huang', request, requestBytes: saved.length,
    requestSha256: hash(saved), startedAt: at(), httpStatus: null, finishReason: null, returnedModel: null, state: 'reserved'};
   run.attempts.push(row);
   run.used++;
   run.remaining--;
   run.cumulative++;
   run.narrationAttempts++;
   phase = 'reservation-write';
   persist(run);
   print({event: 'reserved', call, slot: s.slot});

   phase = 'outbound-or-capture';
   const res = await post(saved, key);
   const hasHttp = typeof res.status === 'number';
   Object.assign(row, {httpStatus: res.status ?? null, headersAt: res.headersAt ?? null,
    responseBytes: res.bytes.length, responseBodyComplete: res.complete, finishedAt: at(),
    elapsedMs: res.elapsedMs, state: 'technical-failure'});
   if (res.error) row.transportError = res.error;
   let issue = res.error || !hasHttp ? 'shared-transport-error' : null;
   let stopAfter = Boolean(issue);
   let parsedResponse = null;
   if (res.complete && res.bytes.length) {
    try {
     parsedResponse = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(res.bytes));
    } catch {}
   }
   const choice = parsedResponse?.choices?.[0];
   const content = choice?.message?.content;
   const returnedModel = parsedResponse?.model;
   const finish = choice?.finish_reason;

   if (res.bytes.includes(Buffer.from(key)) || (typeof content === 'string' && content.includes(key)) ||
       (typeof returnedModel === 'string' && returnedModel.includes(key)) || (typeof finish === 'string' && finish.includes(key))) {
    issue = 'credential-echo';
    stopAfter = true;
   } else if (hasHttp || res.bytes.length) {
    const file = call + (res.complete ? '.raw-response.bin' : '.partial-response.bin');
    put(file, res.bytes);
    if (!read(path.join(live, file)).equals(res.bytes)) throw new Error('Saved response differs from original bytes');
    Object.assign(row, {rawResponse: file, responseSha256: hash(res.bytes), rawResponseUnmodified: true});
    if (typeof returnedModel === 'string') row.returnedModel = returnedModel;
    if (typeof finish === 'string') row.finishReason = finish;
   }
   if (!issue && res.status !== 200) {
    stopAfter = (res.status >= 500) || (res.status >= 300 && res.status < 400) ||
     [401,402,403,404,405,407,408,425,426,429,451].includes(res.status);
    issue = stopAfter ? 'shared-http-rejection' : 'http-non-200';
   }
   if (!issue && !parsedResponse) {
    issue = 'malformed-response';
    stopAfter = true;
   }
   if (!issue) {
    if (typeof content !== 'string' || !content.trim()) {
     issue = 'missing-content';
    } else {
     const file = call + (row.finishReason === 'stop' ? '.content.txt' : '.partial-content.txt');
     const bytes = Buffer.from(content, 'utf8');
     put(file, bytes);
     if (!read(path.join(live, file)).equals(bytes)) throw new Error('Saved response content differs from extracted original');
     Object.assign(row, {content: file, contentBytes: bytes.length, contentSha256: hash(bytes)});
     if (row.finishReason !== 'stop') issue = 'unexpected-finish-reason';
     else if (!row.returnedModel?.trim()) issue = 'missing-returned-model';
     else if (run.returnedModelReference === null) run.returnedModelReference = row.returnedModel;
     else if (run.returnedModelReference !== row.returnedModel) {
      issue = 'returned-model-drift';
      stopAfter = true;
     }
    }
   }
   if (issue) row.technicalReason = issue;
   else row.state = 'complete';
   phase = 'result-ledger-write';
   persist(run);
   print({event: 'technical-result', call, state: row.state, httpStatus: row.httpStatus, finishReason: row.finishReason,
    returnedModel: row.returnedModel, elapsedMs: row.elapsedMs, technicalReason: row.technicalReason ?? null});
   if (stopAfter) {
    stop = issue;
    break;
   }
  }
  phase = 'closure-ledger-write';
  close(run, plan, stop);
  print({event: 'closed', used: run.used, httpResponses: run.httpResponses,
   completeResponses: run.completeResponses, technicalFailures: run.technicalFailures,
   unattempted: run.unattemptedSlots.length, cumulative: run.cumulative, available: run.remaining, stopReason: stop});
 } catch (error) {
  const fault = {event: 'stopped-with-local-error', phase, error: safeError(error, key)};
  try {
   const state = json(ledger);
   if (!state.closed) {
    const row = state.attempts.at(-1);
    if (row?.state === 'reserved') {
     row.state = 'technical-failure';
     row.technicalReason = 'local-capture-or-accounting-error';
     row.finishedAt = at();
    }
    state.localFailure = fault;
    close(state, plan, 'local-guard-or-accounting-error');
    fault.sealed = true;
   }
  } catch {}
  print(fault);
  process.exitCode = 1;
 }
})();
