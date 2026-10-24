// Actual browser interaction only: rendered DOM, screenshots and ordinary UI.
// This helper never injects game results or invokes private Tavern/engine state.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {writeFile,mkdir} from 'node:fs/promises';
import {createInterface} from 'node:readline';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/pit/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sequence=process.argv.includes('--sequence');
const out=new URL(`../../../output/replay_tavern/${sequence?'recovery_sequence':'recovery_playtest'}_20261023_candidate/`,import.meta.url);
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
  const context=await browser.newContext({viewport:{width:1440,height:1100}});
  const page=await context.newPage();
  const diagnostics=[];
  page.on('console',message=>{
    if(message.text().includes('[901-REPLAY-GATE]')){
      const item={type:'console',level:message.type(),text:message.text()};diagnostics.push(item);console.log(JSON.stringify(item));
      void writeFile(new URL('browser-diagnostics.json',out),JSON.stringify(diagnostics,null,2)+'\n');
    }
  });
  page.on('response',async response=>{
    if(!response.url().includes('/api/backends/chat-completions/generate'))return;
    const item={type:'generationResponse',status:response.status()};
    try {
      const data=await response.json();
      item.completion=data.choices?.[0]?.message?.content??data.candidates?.[0]?.content?.parts?.map(p=>p.text??'').join('')??data.content??null;
      item.error=typeof data.error==='string'?data.error:data.error?.message;
    }catch{item.parseError=true;}
    diagnostics.push(item);console.log(JSON.stringify(item));
    await writeFile(new URL('browser-diagnostics.json',out),JSON.stringify(diagnostics,null,2)+'\n');
  });
  await page.goto('http://localhost:8000/',{waitUntil:'domcontentloaded'});
  await page.locator('#send_textarea').waitFor({state:'visible',timeout:60000});
  await page.getByText('Initializing…',{exact:true}).waitFor({state:'hidden',timeout:60000});
  await page.getByText('正在初始化…',{exact:true}).waitFor({state:'hidden',timeout:60000});
  await page.screenshot({path:fileURLToPath(new URL('browser-smoke.png',out)),fullPage:false});
  const text=await page.locator('body').innerText();
  await writeFile(new URL('browser-smoke.txt',out),text);
  console.log(JSON.stringify({title:await page.title(),url:page.url(),body:text.slice(0,9000)},null,2));
  if(process.argv.includes('--interactive')) {
    const input=createInterface({input:process.stdin,crlfDelay:Infinity});
    console.log('BROWSER_READY');
    for await(const line of input) {
      try {
        const command=JSON.parse(line);
        if(command.action==='close')break;
        const target=command.text?page.getByText(command.text,{exact:command.exact??true}):command.role?page.getByRole(command.role,{name:command.name,exact:true}):command.css?page.locator(command.css):null;
        if(command.action==='click')await target.click({timeout:10000});
        else if(command.action==='fill')await target.fill(command.value,{timeout:10000});
        else if(command.action==='press')await target.press(command.key,{timeout:10000});
        else if(command.action==='select')await target.selectOption(command.value,{timeout:10000});
        else if(command.action==='reload')await page.reload({waitUntil:'domcontentloaded'});
        else if(command.action==='wait')await target.waitFor({state:command.state??'visible',timeout:command.timeout??45000});
        else if(!['snapshot','screenshot'].includes(command.action))throw Error('Unknown DOM action');
        const visibleText=await page.locator('body').innerText();
        const controls=await page.locator('button,input,textarea,select,[title],[aria-label]').evaluateAll(nodes=>nodes.filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).map(e=>({tag:e.tagName,id:e.id,title:e.getAttribute('title'),aria:e.getAttribute('aria-label'),text:e.tagName==='SELECT'?e.textContent:e.tagName==='INPUT'||e.tagName==='TEXTAREA'?null:e.textContent?.trim().slice(0,90)})));
        if(command.stage){
          if(!/^[a-z0-9-]+$/.test(command.stage))throw Error('Invalid snapshot stage');
          await page.screenshot({path:fileURLToPath(new URL(`ui-${command.stage}.png`,out)),fullPage:false});
          await writeFile(new URL(`ui-${command.stage}.txt`,out),visibleText);
        }
        console.log(JSON.stringify({action:command.action,body:visibleText.slice(sequence?-5000:-16000),controls:controls.slice(sequence?-35:-100)},null,2));
      }catch(error){console.log(JSON.stringify({error:error.message}));}
    }
  }
}finally{await browser.close();}
