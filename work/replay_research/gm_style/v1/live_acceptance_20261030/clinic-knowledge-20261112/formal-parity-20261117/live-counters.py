"""Make new evidence use the real six-call ledger; retain preparation snapshots."""
from pathlib import Path
import importlib.util,json,shutil
E=Path(__file__).resolve().parent;R=next(p for p in E.parents if p.name=='TRPG outputs')
setup=json.loads((E/'setup.json').read_text(encoding='utf-8'));A=Path(setup['app'])
old={name:(E/name).read_text(encoding='utf-8') for name in ['controls.js','capture-backend.js','evidence-backend.js']}
for name in old:shutil.copy2(E/name,E/(name+'.pre-live'))
controls=old['controls.js'].replace('仅捕获请求，外部模型调用0','请求经隔离中转；次数以本轮账本为准').replace('分类不使用固定NO_CHECK；外发0','分类使用实际模型响应；次数见账本')
controls=controls.replace('modelCalls:0,','modelCalls:\'server-ledger\',')
controls=controls.replace("+'\\n磁盘seed：'+result.seedSha256.slice(0,12)","+'\\n模型调用：'+result.modelCalls+'，累计'+result.cumulative+'\\n磁盘seed：'+result.seedSha256.slice(0,12)")
(E/'controls.js').write_text(controls,encoding='utf-8')
capture=old['capture-backend.js'].replace("const bytes901=Buffer.from(config.body)","const budget901=fs901.existsSync(lab901.evidenceDir+'/../run.json')?JSON.parse(fs901.readFileSync(lab901.evidenceDir+'/../run.json','utf8')):{used:0,cumulative:546};\n        const bytes901=Buffer.from(config.body)")
capture=capture.replace('classificationFixture:false,externalModelCalls:0,parameters:', 'classificationFixture:false,browserUpstreamCalls:0,externalModelCalls:budget901.used,cumulative:budget901.cumulative,parameters:')
(E/'capture-backend.js').write_text(capture,encoding='utf-8')
evidence=old['evidence-backend.js'].replace(" const file=c.evidenceDir+'/'+label+'.json';", " const budget=fs901.existsSync(c.evidenceDir+'/../run.json')?JSON.parse(fs901.readFileSync(c.evidenceDir+'/../run.json','utf8')):{used:0,cumulative:546};\n request.body.modelCalls=budget.used;request.body.cumulative=budget.cumulative;request.body.browserUpstreamCalls=0;\n const file=c.evidenceDir+'/'+label+'.json';")
evidence=evidence.replace('externalModelCalls:0});\n});','externalModelCalls:budget.used,modelCalls:budget.used,cumulative:budget.cumulative});\n});')
# The phase endpoint does not declare a budget; its number means direct upstream calls only.
evidence=evidence.replace('response.json({phase:c.phase,externalModelCalls:budget.used,modelCalls:budget.used,cumulative:budget.cumulative});','response.json({phase:c.phase,browserUpstreamCalls:0});')
(E/'evidence-backend.js').write_text(evidence,encoding='utf-8')
backend=A/'src/endpoints/backends/chat-completions.js';body=backend.read_text(encoding='utf-8')
assert body.count(old['capture-backend.js'])==1 and body.count(old['evidence-backend.js'])==1
backend.write_text(body.replace(old['capture-backend.js'],capture).replace(old['evidence-backend.js'],evidence),encoding='utf-8')
entry=E/'entry.isolated.js';body=entry.read_text(encoding='utf-8');shutil.copy2(entry,E/'entry.pre-live.js')
old_controls=old['controls.js'].replace('__PARENT__',json.dumps(setup['parentChatId'],ensure_ascii=False)).replace('__PARENT_REVISION__','0')
new_controls=controls.replace('__PARENT__',json.dumps(setup['parentChatId'],ensure_ascii=False)).replace('__PARENT_REVISION__','0')
assert body.count(old_controls)==1;body=body.replace(old_controls,new_controls);entry.write_text(body,encoding='utf-8')
helper=R/'work/replay_research/gm_style/v1/live_acceptance_20261030/action-failure/timeout-20261105/lab.py'
spec=importlib.util.spec_from_file_location('lab',helper);lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
def change(card):card['data']['extensions']['tavern_helper']['scripts'][1]['content']=body
lab.card_transform(A/'data/default-user/characters'/(setup['character']+'.png'),change)
runner=E/'run-one.mjs';body=runner.read_text(encoding='utf-8').replace("assert.equal(capture.externalModelCalls,0);","assert.equal(capture.browserUpstreamCalls??capture.externalModelCalls,0);")
runner.write_text(body,encoding='utf-8')
print('Live records now derive modelCalls/cumulative from run.json; original preparation snapshots retained.')
