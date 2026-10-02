"""Append an authored unresolved source issue; preserve saved checkpoint bytes."""
import json
from review_p1 import ROOT, OUT

base = OUT / 'P1_P001.json'
c = json.loads(base.read_text(encoding='utf-8'))
facts = {f['fact_id']: f for f in c['facts']}
earlier = 'R1C2_SRC_P1_P001_POST_0001_816001_F004'
later = 'R1C2_SRC_P1_P001_POST_0019_816071_F002'
# F004 is the narrated recovery of the disk from debris; F002 is Yu's later thought.
assert '废墟' in facts[earlier]['statement']
assert '都是在二五仔身上找到' in facts[later]['statement']
issue = dict(
    item_id='R1C2_P1_P001_UNRESOLVED_001', status='UNRESOLVED', kind='SOURCE_CONFLICT',
    description='第1帖叙述御临风在废堆找到圆盘；第19帖御临风内心称圆盘和戒指都在二五仔身上找到。来源和人物回忆不一致，保持原叙述与人物想法分别取证，不将后者反写成客观取得经过。',
    affected_fact_refs=[earlier,later],
    source_locators=[*facts[earlier]['source_locators'],*facts[later]['source_locators']],
    resolution_required='后续源文或人工裁定；此检查点不自行调和。')
supplement = dict(stage='PASS_A_SUPPLEMENT', reviewer='/root/review_p1',
    document=c['document'], base_checkpoint='P1_P001.json',
    reviews=[], facts=[], dispositions=[], mentions=[], unresolved_items=[issue], contract_gaps=[],
    progress=dict(primary_posts_total=50, reviewed_pass_a=50, reviewed_pass_b=0, adjudicated=0,
                  unresolved=1,contract_gaps=0),
    notes=['STOP steering honored: no next source document opened for semantic review; no Pass B.'])
target=OUT / 'P1_P001_issues001.json'
with target.open('xb') as stream:
    stream.write((json.dumps(supplement,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
print(str(target.relative_to(ROOT)))
