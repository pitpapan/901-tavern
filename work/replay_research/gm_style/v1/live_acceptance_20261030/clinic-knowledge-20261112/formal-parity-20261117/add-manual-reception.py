"""Add one explicit operator confirmation for actual new public dialogue."""
from pathlib import Path
import importlib.util,json,shutil
E=Path(__file__).resolve().parent;R=next(p for p in E.parents if p.name=='TRPG outputs')
setup=json.loads((E/'setup.json').read_text(encoding='utf-8'));A=Path(setup['app'])
path=E/'controls.js';old=path.read_text(encoding='utf-8');shutil.copy2(path,E/'controls.before-public-reception.js')
anchor="const parityPhase=parityDocument.createElement('select');"
block="""// The operator clicks only after reading the actual retained utterance and confirming audibility.
parityButton('人工确认当前对白：御临风与黄泉听清',async()=>{
 const anchor=parityAnchor(),source=SillyTavern.chat[anchor.messageId];
 if(!['after','reopen'].includes(parityPhase.value)||source.is_user||source.is_system||source.extra?.['901_replay_gate']?.status!=='NO_CHECK')throw Error('Select after/reopen and retain an actual completed assistant utterance first');
 const result=await window.top.__901StoryKnowledge.receive({id:'clinic.parity.public.'+parityPhase.value+'.20261117',authority:'host-confirmed',status:'received',
  sourceAnchor:{...anchor,text:source.mes},propositionRefs:['clinic.owner.xuelao.old-friend'],recipientIds:['player','huang'],senderId:'bright',channel:'message',belief:'confirmed'});
 parityStatus.textContent='人工确认实际对白接收：'+result.status+'\\n原告知不重复授予；当前来源为实际保存的模型正文';
});
"""
assert old.count(anchor)==1;new=old.replace(anchor,block+anchor);path.write_text(new,encoding='utf-8')
entry=E/'entry.isolated.js';body=entry.read_text(encoding='utf-8');shutil.copy2(entry,E/'entry.before-public-reception.js')
old=old.replace('__PARENT__',json.dumps(setup['parentChatId'],ensure_ascii=False)).replace('__PARENT_REVISION__','0')
new=new.replace('__PARENT__',json.dumps(setup['parentChatId'],ensure_ascii=False)).replace('__PARENT_REVISION__','0')
assert body.count(old)==1;body=body.replace(old,new);entry.write_text(body,encoding='utf-8')
helper=R/'work/replay_research/gm_style/v1/live_acceptance_20261030/action-failure/timeout-20261105/lab.py'
spec=importlib.util.spec_from_file_location('lab',helper);lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
def change(card):card['data']['extensions']['tavern_helper']['scripts'][1]['content']=body
lab.card_transform(A/'data/default-user/characters'/(setup['character']+'.png'),change)
print('Added an explicit manual source/recipient receipt button only in this isolated card; no automatic extraction.')
