from pathlib import Path
import json,sys,shutil
E=Path(__file__).resolve().parent;N=E/'normal-play-20261115';I=E/'iteration-200-20261115';read=lambda p:json.loads(p.read_text(encoding='utf8'))
label=sys.argv[1];next_step=' '.join(sys.argv[2:]);cfg=read(E/'browser-setup.json');p=Path(cfg['chat']);shutil.copy2(p,N/(label+'.chat.jsonl'))
rows=[json.loads(x) for x in p.read_text(encoding='utf8').splitlines()];start=[json.loads(x) for x in (N/'start.chat.jsonl').read_text(encoding='utf8').splitlines()]
new=rows[len(start):];pairs=[];pending_input=None
for index,r in enumerate(new,len(start)-1):
 if r.get('is_user'):pending_input=(index,r)
 elif pending_input:
  pairs.append((pending_input,(index,r)));pending_input=None
root=rows[-1].get('variables',[{}])[0].get('stat_data',{}).get('901_rules_poc',{});k=root.get('storyKnowledge',{});batches=k.get('dialogueBatches',{});pending=[r for b in batches.values() for r in b.get('rows',[]) if r.get('status')=='pending']
ledger=read(I/'run.json');calls=[x for x in ledger['attempts'] if x['customRequest']>405]
checkpoint={'snapshot':label+'.chat.jsonl','completedPlayerReplyPairs':len(pairs),'newCalls':len(calls),'cumulative':ledger['cumulative'],'used':ledger['used'],'remaining':ledger['remaining'],'batches':{id:b['status'] for id,b in batches.items()},'pending':pending,'lastMessage':rows[-1].get('mes'),'lastKnowledgeStatus':rows[-1].get('extra',{}).get('901_knowledge_status'),'nextStep':next_step}
(N/'checkpoint.json').write_text(json.dumps(checkpoint,ensure_ascii=False,indent=2),encoding='utf8')
transcript=['正常剧情隔离试玩记录（非Canon）\n原始请求/HTTP响应：../iteration-200-20261115/play.*；逐次用途与用量同目录run.json。\n起点为正式当前聊天只读副本；数据库自动更新原本关闭，未改动，读取真实保留表。\n']
for turn,((ui,u),(ai,a)) in enumerate(pairs,1):
 transcript.append(f'第{turn}轮\n玩家楼层{ui}：\n{u["mes"]}\n\n模型正文楼层{ai}（原样保存，含产品正常占位）：\n{a["mes"]}\n\n知情整理状态：{a.get("extra",{}).get("901_knowledge_status","无错误标记")}\n')
if pending_input:transcript.append('尚未完成的玩家输入：\n'+pending_input[1]['mes'])
(N/'playthrough.txt').write_text('\n'.join(transcript),encoding='utf8')
plan=next(p for p in E.parents if p.name=='TRPG outputs')/'docs/unified-development-plan.md';s=plan.read_text(encoding='utf8');a=s.index('<!-- dialogue-integration-current -->');b=s.index('<!-- /dialogue-integration-current -->')+len('<!-- /dialogue-integration-current -->')
current=f'''<!-- dialogue-integration-current -->
## 当前任务：405候选的5–8轮正常剧情隔离试玩（2026-11-15）
总控转达用户授权使用原剩余129次；不重做十二阶段/旧08—10，不部署/正式剧情/自动批准修订/新chat/子agent。正文/分类/接收/依赖全部真实调用且同账，数据库保持真实配置（自动更新原本关闭、Summary原本冻结），无合成记忆覆盖。
当前隔离酒馆18123，同一当前聊天只读副本，v3/405候选；已完成{len(pairs)}个玩家—正文回合。本轮调用{len(calls)}，累计{ledger['cumulative']}，200总额用{ledger['used']}、余{ledger['remaining']}。
最新保存normal-play-20261115/{label}.chat.jsonl；处理状态{[b['status'] for b in batches.values()]}，待核{len(pending)}；最新错误标记{checkpoint['lastKnowledgeStatus']}。
下一步：{next_step}。详细原文、实际调用和状态沿integration-20261115/normal-play-20261115/checkpoint.json、playthrough.txt和原iteration-200账本。第3或4轮后关闭重开同一聊天；目标完成且最低5轮后收束。
<!-- /dialogue-integration-current -->'''
plan.write_text(s[:a]+current+s[b:],encoding='utf8')
print(json.dumps({key:value for key,value in checkpoint.items() if key not in ['lastMessage','pending','batches']},ensure_ascii=True))
