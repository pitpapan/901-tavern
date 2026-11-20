from pathlib import Path
import json,shutil,hashlib,importlib.util
E=Path(__file__).resolve().parent;N=E/'normal-play-20261115';I=E/'iteration-200-20261115';N.mkdir(exist_ok=True);(N/'before').mkdir(exist_ok=True)
read=lambda p:json.loads(p.read_text(encoding='utf8'))
cfg=read(E/'browser-setup.json');A=Path(cfg['app']);assert A.resolve().is_relative_to(Path('C:/Users/pit/.codex/visualizations').resolve())
ledger=read(I/'run.json');assert ledger['cumulative']==405 and ledger['remaining']==129
for p in [I/'run.json',E/'candidate-manifest.json',A/'src/endpoints/backends/chat-completions.js',A/'dialogue-live-config.json',Path(cfg['chat'])]:shutil.copy2(p,N/'before'/p.name)
formal=Path('D:/github/sillyTavern/data/default-user');name='901 帝都初始卡 独立事项版 20261105';chat=formal/'chats'/name/'901 帝都正式续玩 20261106.jsonl'
shutil.copy2(chat,N/'start.chat.jsonl');shutil.copy2(chat,cfg['chat'])
shutil.copy2(A/'data/default-user/characters'/(name+'.png'),N/'before/card.png')
shutil.copy2(formal/'characters'/(name+'.png'),A/'data/default-user/characters'/(name+'.png'))
spec=importlib.util.spec_from_file_location('lab',E.parent.parent.parent/'action-failure/timeout-20261105/lab.py');lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
entry="window.top.__901DialogueHost={enabled:true,useExistingHost:true};\n"+(E/'candidate-entry.js').read_text(encoding='utf8')
entry+='\nconst playNotice=window.top.document.createElement("p");playNotice.textContent="正常剧情隔离试玩：全部生成实际调用，非正式剧情";playNotice.style.cssText="position:fixed;top:0;left:0;background:#143d25;color:white;z-index:99999;padding:4px";window.top.document.body.append(playNotice);'
def transform(card):card['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
lab.card_transform(A/'data/default-user/characters'/(name+'.png'),transform)
(N/'entry.js').write_text(entry,encoding='utf8')
backend=A/'src/endpoints/backends/chat-completions.js';s=backend.read_text(encoding='utf8');start=s.index('        // Isolated UI acceptance only:');end=s.index("        console.debug('Chat Completion request:'",start)
fragment='''        // Normal play acceptance: every actual request is captured; no synthetic completion.
        const play=JSON.parse(fsClinic.readFileSync('dialogue-live-config.json','utf8'));
        const flat=JSON.stringify(requestBody.messages);
        const kind=requestBody.response_format?.json_schema?.name?.startsWith('dialogue_reception_')?'reception':flat.includes('只判断本次请求是否实际依赖某条待核消息')?'dependency':flat.includes('你是901行动分类器')?'classification':'narration-or-memory';
        const id='play.'+String(++play.sequence).padStart(3,'0')+'.'+kind;
        fsClinic.mkdirSync(play.captureDir,{recursive:true});
        fsClinic.writeFileSync(play.captureDir+'/'+id+'.request.json',JSON.stringify(requestBody),{flag:'wx'});
        fsClinic.writeFileSync(play.captureDir+'/'+id+'.capture.json',JSON.stringify({id,kind,at:new Date().toISOString(),synthetic:false,upstreamCallsFromBrowser:0}),{flag:'wx'});
        fsClinic.writeFileSync('dialogue-live-config.json',JSON.stringify(play));
        const until=Date.now()+600000;
        while(Date.now()<until){
          const path=play.liveDir+'/'+id+'.release.json';
          if(fsClinic.existsSync(path)){
            const release=JSON.parse(fsClinic.readFileSync(path,'utf8'));
            if(!release.rawResponse)return response.status(418).json({error:{message:'PLAY_STOPPED_WITHOUT_REPLY'}});
            const sent=fsClinic.readFileSync(play.liveDir+'/'+id+'.request.json','utf8');
            if(JSON.stringify(JSON.parse(sent))!==JSON.stringify(requestBody))return response.status(409).json({error:{message:'FROZEN_REQUEST_MISMATCH'}});
            const raw=fsClinic.readFileSync(play.liveDir+'/'+id+'.raw-response.txt','utf8');
            fsClinic.writeFileSync(play.captureDir+'/'+id+'.delivered.json',JSON.stringify({rawReplay:true,synthetic:false,upstreamCallsFromBrowser:0}));
            return response.type('application/json').send(raw);
          }
          await new Promise(resolve=>setTimeout(resolve,250));
        }
        return response.status(408).json({error:{message:'PLAY_WAIT_EXPIRED'}});
'''
backend.write_text(s[:start]+fragment+s[end:],encoding='utf8');(N/'backend.fragment.js').write_text(fragment,encoding='utf8')
(A/'dialogue-live-config.json').write_text(json.dumps(dict(captureDir=str(N/'captures'),liveDir=str(I),sequence=0),ensure_ascii=False),encoding='utf8')
baseline=read(E/'mainline-v3-20261115/baseline.json');baseline.update(startCumulative=405,startUsed=71,startRemaining=129,formalChatSha256=hashlib.sha256(chat.read_bytes()).hexdigest(),candidate=read(E/'candidate-manifest.json'))
(N/'baseline.json').write_text(json.dumps(baseline,ensure_ascii=False,indent=2),encoding='utf8')
ledger.update(complete=False,closed=False,activeScope='normal-play-20261115: 5-8 actual ordinary turns; all calls counted; preserve memory; diagnose failures, no blind retry',currentScopeResult='Prepared from405, 0 completed turns, 0 new calls')
(I/'run.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
plan=next(p for p in E.parents if p.name=='TRPG outputs')/'docs/unified-development-plan.md';s=plan.read_text(encoding='utf8');a=s.index('<!-- dialogue-integration-current -->');b=s.index('<!-- /dialogue-integration-current -->')+len('<!-- /dialogue-integration-current -->');(N/'before/plan-current.txt').write_text(s[a:b],encoding='utf8')
current='''<!-- dialogue-integration-current -->
## 当前任务：405候选的5–8轮正常剧情隔离试玩（2026-11-15）
总控转达用户明确授权使用剩余129次，不重做十二阶段/旧08—10，不部署/正式剧情/自动批准修订/新chat/子agent。正文、分类、接收、依赖及记忆实际调用同账。
起点：正式当前聊天只读复制至原18123隔离酒馆，同一人物/世界书/既有记忆；去除上轮固定NO_CHECK、台词和合成记忆。candidate v3/405不改采样和端点。
目标：围绕送信前的路线与同行安排自然完成约6轮（最低5、最多8）；第3或4轮落盘后关闭重开同一聊天。根据真实回复写下一句，未发生待核则如实记未覆盖。
当前：准备隔离入口，已完成0轮；新调用0，累计405，71/200已用、余129。下一步核对原记忆实际配置与入口后开始普通输入。证据integration-20261115/normal-play-20261115/；原完整405交付保留在mainline-v3-20261115。
<!-- /dialogue-integration-current -->'''
plan.write_text(s[:a]+current+s[b:],encoding='utf8')
print('Prepared normal play; no model calls; no synthetic completion or memory override')
