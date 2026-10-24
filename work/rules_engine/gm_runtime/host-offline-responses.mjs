// TEST ONLY: actual SillyTavern host acceptance. No upstream transport or keys.
// Bind only a disposable profile to this endpoint; never a normal-play fallback.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const counts = { classification: 0, narration: 0, rejected: 0 };
createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8010');
  const send = (code, value) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); };
  const path = new URL(req.url, 'http://localhost').pathname;
  if (req.method === 'GET' && path === '/v1/models') return send(200, { data: [{ id: '901-test-only', object: 'model' }] });
  if (req.method === 'GET' && path === '/counts') return send(200, counts);
  if (req.method === 'GET' && path.startsWith('/work/')) {
    try {
      const file = resolve(root, '.' + decodeURIComponent(path));
      if (!file.startsWith(resolve(root, 'work') + sep)) throw Error('outside test assets');
      let body = await readFile(file);
      // Only relocate absolute asset URLs for this temporary test server.
      if (path.endsWith('/replay-gate-script.example.js')) body = Buffer.from(body.toString().replaceAll("'/901-rules-runtime/", "'http://127.0.0.1:9020/"));
      res.writeHead(200, { 'Content-Type': extname(file) === '.json' ? 'application/json' : 'text/javascript', 'Cache-Control': 'no-store' });
      res.end(body); return;
    } catch { return send(404, { error: 'test asset unavailable' }); }
  }
  if (req.method !== 'POST' || path !== '/v1/chat/completions') return send(404, { error: 'no route' });
  try {
    let body = ''; for await (const chunk of req) body += chunk;
    const input = JSON.parse(body);
    const messages = input.messages.map(m => String(m.content ?? ''));
    let content;
    if (messages.some(m => m.includes('你是901行动分类器'))) {
      const action = messages.find(m => m.includes('玩家原始行动：'))?.split('玩家原始行动：')[1]?.split('\n')[0];
      const decisions = {
        '[HOST-NO] 我向同行者问好。': { status: 'NO_CHECK', basis: 'ordinary_dialogue', reason: 'controlled host test' },
        '[HOST-EFFECT] 我记录场景线索。': { status: 'DIRECT_EFFECT', reason: 'controlled host test', request: { kind: 'direct_effect', effectId: 'demo.scene-cue' } },
        '[HOST-CHECK] 我观察道路痕迹。': { status: 'CHECK_REQUIRED', reason: 'controlled host test', request: { kind: 'check', attribute: '感知', skill: '洞察', dc: 2 } },
      };
      if (!Object.hasOwn(decisions, action)) throw Error('unknown test action');
      counts.classification++; content = JSON.stringify(decisions[action]);
    } else if (messages.some(m => m.includes('裁定路径：') && m.includes('规则事实：') && m.includes('[HOST-'))) {
      counts.narration++; content = '【HOST-OFFLINE：受控测试续述，非模型输出、非游戏事实。】';
    } else throw Error('unexpected native or unscoped generation');
    console.log(JSON.stringify(counts));
    send(200, { id: 'test-only', object: 'chat.completion', model: '901-test-only',
      choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }] });
  } catch { counts.rejected++; console.log(JSON.stringify(counts)); send(409, { error: { message: 'Test-only endpoint refused unrecognized request' } }); }
}).listen(9020, '127.0.0.1', () => console.log('901 TEST ONLY endpoint on loopback 9020'));
