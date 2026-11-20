from pathlib import Path
import difflib,json,shutil
E=Path(__file__).resolve().parent
R=next(p for p in E.parents if p.name=='TRPG outputs')
A=Path(json.loads((E/'setup.json').read_text(encoding='utf-8'))['app'])
for name in ['knowledge-and-gate','controller']:
    dest=E/(name+'-red-tests.log');assert not dest.exists();shutil.copy2(E/(name+'-tests.log'),dest)
module='work/rules_engine/gm_runtime/'
relative='work/rules_engine/mvu_poc/adapter.mjs'
target=A/'public/901-opening-combat'/relative
body=target.read_text(encoding='utf-8')
source=(R/relative).read_text(encoding='utf-8')
start=source.index('    if(root.storyKnowledge){',source.index('export async function adoptNativeChatBranch'))
end=source.index('    const result={status:',start)
block=source[start:end]
anchor='    root.chatId=anchor.chatId;root.revision++;\n'
assert body.count(anchor)==1 and block not in body
target.write_text(body.replace(anchor,anchor+block),encoding='utf-8')
relative=module+'replay-gate-script.example.js';target=A/'public/901-opening-combat'/relative
body=target.read_text(encoding='utf-8')
start=body.index('        const relatedFacts = book')
end=body.index("        mark('request_build');",start)
source=(R/relative).read_text(encoding='utf-8')
correct=source[source.index('        const entries = book'):source.index("        mark('request_build');",source.index('        const entries = book'))]
target.write_text(body[:start]+correct+body[end:],encoding='utf-8')
for relative in ['work/rules_engine/mvu_poc/adapter.mjs',module+'replay-gate-script.example.js']:
    name=Path(relative).name;before=(E/(name+'.before')).read_text(encoding='utf-8');after=(A/'public/901-opening-combat'/relative).read_text(encoding='utf-8')
    (E/(name+'.patch')).write_text(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='formal/'+relative,tofile='isolated/'+relative)),encoding='utf-8')
(E/'adaptation-issues.json').write_text(json.dumps({'scope':'Isolated integration only; no formal or source-product changes','issues':[
    {'failure':'projectEntries missed lore returned without world','responsibleLayer':'controller lore loading','fix':'Reuse existing world:name provenance binding before projection'},
    {'failure':'inherited knowledge retained parent chatId','responsibleLayer':'adoptNativeChatBranch in MVU adapter','fix':'Reuse existing storyKnowledge source/batch identity rebinding'}],
    'newPrompts':False,'modelCalls':0},indent=2),encoding='utf-8')
print('Applied the two existing integration adaptations; original red logs retained.')
