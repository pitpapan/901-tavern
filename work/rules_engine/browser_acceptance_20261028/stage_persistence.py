"""Apply this batch's bounded edits to the pinned isolated runtime; no rebuild."""
from pathlib import Path
import json,hashlib,difflib
ROOT=Path(__file__).resolve().parents[3];HERE=Path(__file__).parent
OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028'
rel=lambda name:'work/rules_engine/'+name
changes={}
def patch(name,transform):
 p=OUT/'runtime'/rel(name);old=p.read_text(encoding='utf8');new=transform(old);assert old!=new,name
 p.write_bytes(new.encode('utf8'));changes[rel(name)]=(old,new)
adapter=(ROOT/rel('mvu_poc/adapter.mjs')).read_text(encoding='utf8')
block=adapter[adapter.index('// ST saveChat may resolve'):adapter.index('// Explicitly accept ST')]
patch('mvu_poc/adapter.mjs',lambda s:s.replace('// Explicitly accept ST',block+'// Explicitly accept ST',1))
patch('combat/tavern.mjs',lambda s:s.replace('carryTestState, tavernAnchor }','carryTestState, tavernAnchor, persistTavernRuleState }',1).replace('await tavern.saveChat?.();','await persistTavernRuleState({mvu,tavern});',1))
patch('gm_runtime/integrated.mjs',lambda s:s.replace('carryTestState,tavernAnchor}','carryTestState,tavernAnchor,retainRuleSnapshot}',1).replace('    registerRuleScene,','    registerRuleScene,\n    retainSnapshot:()=>retainRuleSnapshot({mvu,tavern}),',1))
ui=(ROOT/rel('gm_runtime/opening-scene-ui.mjs')).read_text(encoding='utf8')
ui_block=ui[ui.index('    const checkpointInfo='):ui.index('\n  };')]
patch('gm_runtime/opening-scene-ui.mjs',lambda s:s.replace('    dialog.append(intro,input,save,close,status);document.body.append(dialog);dialog.showModal();',ui_block,1))
def gate(s):
 s=s.replace('carryTestState, readTestOperation }','carryTestState, readTestOperation, persistTavernRuleState }',1)
 s=s.replace('      narrate: async (context, settled, decision) => {','      narrate: async (context, settled, decision) => {\n        if(settled){\n          mark(\'state_persistence\');\n          await persistTavernRuleState({mvu,tavern:SillyTavern,getAnchor,readSavedChat:profile.readSavedChat});\n        }',1)
 s=s.replace('        await SillyTavern.saveChat();\n      } });',"        if(meta.status==='APPLIED'||meta.status==='NO_CHECK')\n          await persistTavernRuleState({mvu,tavern:SillyTavern,readSavedChat:profile.readSavedChat});\n        else await SillyTavern.saveChat();\n      } });",1)
 s=s.replace('    const message = saved',"    const message = error?.code==='CHAT_PERSISTENCE_UNCONFIRMED'\n      ? '规则状态仍在当前页面内存中，但聊天持久保存未确认；请保持页面并恢复本次操作，不要重复付费或重新投骰。'\n      : saved",1)
 return s
patch('gm_runtime/replay-gate-script.example.js',gate)
live=HERE/'live-script.js';(OUT/'runtime/live-script.js').write_bytes(live.read_bytes())
package=json.loads((OUT/'package.json').read_text(encoding='utf8'));files=[]
for name in changes:
 entry=next(e for e in package['modules'] if e['path']==name);entry['sha256']=hashlib.sha256((OUT/'runtime'/name).read_bytes()).hexdigest();files.append(entry)
package['script_sha256']=hashlib.sha256(live.read_bytes()).hexdigest();files.append({'path':'live-script.js','sha256':package['script_sha256']})
(OUT/'package.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(HERE/'persistence-runtime.patch').write_text(''.join(''.join(difflib.unified_diff(a.splitlines(True),b.splitlines(True),fromfile=name+' before',tofile=name+' after')) for name,(a,b) in changes.items()),encoding='utf8')
result={'sourceRoot':str(OUT/'runtime'),'targetRoot':'D:/github/sillyTavern/public/901-resource-acceptance-20261028','files':files}
(HERE/'persistence-deployment.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(result,ensure_ascii=False,indent=2))
