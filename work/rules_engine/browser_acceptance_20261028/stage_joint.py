from pathlib import Path
import json,hashlib
R=Path('TRPG outputs');H=R/'work/rules_engine/browser_acceptance_20261028';O=R/'output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028';W=O.parent/'world-loading-20261028'
config=json.loads((W/'config.json').read_text(encoding='utf8'))
guidance=(R/'work/replay_research/knowledge_projection.md').read_text(encoding='utf8').split('### W4续写入口：背景与现场\n\n')[1].split('\n\n')[0].strip()
sha=lambda b:hashlib.sha256(b).hexdigest()
books=[]
for name in config['books']:
 p=Path('D:/github/sillyTavern/data/default-user/worlds')/(name+'.json');v=json.loads(p.read_text(encoding='utf8'));books.append({'name':name,'sha256':sha(p.read_bytes()),'entries':len(v['entries'])})
c={'id':'joint-rest-20261028','books':config['books'],'bookFiles':books,'worldContextGuidance':guidance,'guidanceSha256':sha(guidance.encode()),'input':'御临风的法师·奥术与魔能爆练习已经结束。我现在完整长休八小时，让精神魔力按现有规则恢复；期间不施法、不学习、不领取奖励。黄泉等人不接受治疗，伤势保持。','scene':'资源引擎与六书联合隔离验收，不计入正式剧情。御临风、黄泉、姜子尤与布莱特均在独立演练场，练习已经结束。御临风现在可以完整长休八小时；其他人只旁观，不接受治疗，不行动，不领取奖励。当前实际资源和伤势以规则事实为准。','limits':['只复用W4六书副本，不启用Summary或其他记忆来源','世界线有限预算语义仍partial；本例不外推全世界书语义通过']}
(H/'joint-config.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
p=H/'live-script.js';s=p.read_text(encoding='utf8')
s=s.replace('let combatSession;','let combatSession;\nlet jointProfile=context().chatMetadata?.resource_joint_profile??null;\nlet jointRun=null,jointListeners=[];',1)
pos=s.index('async function installNaturalGate()')
block='''async function prepareJoint(){
  const c=branchContext();
  if(root()?.revision!==31||root()?.battle?.mode==='combat')throw Error('联合例从已保存子分支修订31剧情态开始');
  jointProfile=await (await fetch(rootUrl+'joint-config.json',{cache:'no-store'})).json();
  if(!jointProfile.books.every(b=>getWorldbookNames().includes(b)))throw Error('所需W4隔离六书缺失');
  const before=getCharWorldbookNames('current');
  await rebindCharWorldbooks('current',{primary:before.primary,additional:jointProfile.books});
  c.updateChatMetadata({resource_joint_profile:jointProfile});await c.saveChat();
  jointRun={id:jointProfile.id,started:new Date().toISOString(),input:jointProfile.input,baseline:snapshot(),config:jointProfile,scan:[],activated:[],requests:[]};
  const summarize=e=>({world:e.world,uid:e.uid,name:e.comment,constant:e.constant,disabled:e.disable});
  const listen=(event,fn)=>{eventOn(event,fn);jointListeners.push(()=>eventRemoveListener(event,fn));};
  listen(tavern_events.WORLDINFO_SCAN_DONE,x=>jointRun.scan.push({state:x.state,budget:x.budget,matched:Array.from(x.new.all||[]).map(summarize),successful:Array.from(x.new.successful||[]).map(summarize),activated:Array.from(x.activated.entries||[]).map(summarize)}));
  listen(tavern_events.WORLD_INFO_ACTIVATED,x=>jointRun.activated.push(x.map(summarize)));
  listen(tavern_events.CHAT_COMPLETION_SETTINGS_READY,x=>jointRun.requests.push({model:x.model,max_tokens:x.max_tokens,stream:x.stream,messages:structuredClone(x.messages)}));
  return report('六书联合准备',{status:'ready',input:jointProfile.input,books:jointProfile.books});
}
async function saveJointEvidence(){
  const c=branchContext();if(!jointRun)throw Error('当前页面没有联合请求记录');
  for(const stop of jointListeners)stop();jointListeners=[];
  jointRun.finished=new Date().toISOString();jointRun.final=snapshot();
  jointRun.messages=c.chat.slice(31).map((m,i)=>({messageId:i+31,text:m.mes,extra:m.extra}));
  c.updateChatMetadata({resource_joint_acceptance:structuredClone(jointRun)});await c.saveChat();
  return report('保存联合回执',{status:'captured',requestCount:jointRun.requests.length,activated:jointRun.activated});
}
'''
s=s[:pos]+block+s[pos:]
s=s.replace('directEffects:false,sceneContext:naturalScene,classificationTimeoutMs:60000,lorebooks:[],','directEffects:false,debug:true,get sceneContext(){return jointProfile?.scene??naturalScene;},classificationTimeoutMs:60000,get lorebooks(){return jointProfile?.books??[];},',1)
s=s.replace("modelOptions:{should_stream:false,should_silence:true,max_chat_history:0,", "modelOptions:()=>jointProfile?{should_stream:false,should_silence:true,max_chat_history:6,overrides:{scenario:jointProfile.scene,chat_history:{author_note:''}},ordered_prompts:['world_info_before','char_description','scenario','world_info_after','chat_history',{role:'system',content:jointProfile.worldContextGuidance+'\\n只叙述当前实际现场与已经结算的长休结果，不增加其他行动，不替御临风说话或思想。'},'user_input']}:{should_stream:false,should_silence:true,max_chat_history:0,",1)
s=s.replace("const actions=[[", "const actions=[['准备六书联合恢复',prepareJoint],['保存联合回执',saveJointEvidence],[",1)
p.write_bytes(s.encode());(O/'runtime/live-script.js').write_bytes(p.read_bytes());(O/'runtime/joint-config.json').write_bytes((H/'joint-config.json').read_bytes())
g=O/'runtime/work/rules_engine/gm_runtime/replay-gate-script.example.js';s=g.read_text(encoding='utf8');old='book: getCurrentCharPrimaryLorebook(), books:profile.lorebooks, eventOn, event: tavern_events.WORLDINFO_ENTRIES_LOADED,';assert old in s;s=s.replace(old,'book: getCurrentCharPrimaryLorebook(), books:profile.lorebooks,\n          eventOn:(event,listener)=>{eventOn(event,listener);return {stop:()=>eventRemoveListener(event,listener)};},\n          event: tavern_events.WORLDINFO_ENTRIES_LOADED,',1);g.write_bytes(s.encode())
package=json.loads((O/'package.json').read_text(encoding='utf8'));rel='work/rules_engine/gm_runtime/replay-gate-script.example.js';next(e for e in package['modules'] if e['path']==rel)['sha256']=sha(g.read_bytes());package['script_sha256']=sha(p.read_bytes());package['joint_config_sha256']=sha((H/'joint-config.json').read_bytes());(O/'package.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
manifest=[{'source':str((O/'runtime'/name).resolve()),'target':str(Path('D:/github/sillyTavern/public/901-resource-acceptance-20261028')/name),'sha256':sha((O/'runtime'/name).read_bytes())} for name in [rel,'live-script.js','joint-config.json']];(H/'joint-deployment.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps(manifest,ensure_ascii=False,indent=2))
