"""Prepare the narrow 008 worldbook change for inspection; no export mutation."""
from pathlib import Path
import difflib, hashlib, json
ROOT=Path(__file__).resolve().parents[3]
STAGE=Path(__file__).resolve().parent
BASE=ROOT/'output/replay_tavern/enemy_xp_20261018_candidate'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def ref(path,locator):
    lines=(ROOT/path).read_text(encoding='utf-8').splitlines()
    hits=[i for i,l in enumerate(lines,1) if l==locator]
    assert len(hits)==1,(path,locator,hits)
    return {'path':path,'line':hits[0],'locator':locator}
assert not (ROOT/'output/replay_tavern/flow_guidance_20261018_candidate').exists()
book=read(BASE/'import/901_帝都敌人与XP_M1_20261018.json')
old=book['entries']['79768996']
addition='''按需规则讲解：玩家用自然语言说明行动即可，主持对应适用机制。陌生机制、玩家询问或影响选择时，简短说明本次条件、代价和主要风险；讲解不迫使细打，不要求先报技能名、不替选打法。桌外说明与对白分开，不借教学公开隐藏机制，NPC同体系合理未列能力继续有效。

按明确反馈调整篇幅：压缩已授权、无新信息或重要决定的重复过程，展开用户明确感兴趣的互动；不把短回复当厌烦，不为提神添危机。保留关键线索、真实因果、未作出的选择与已发生后果，省略演出不等于自动办成或关系升级。反馈不成为NPC知识、御临风意愿或世界时间。

相称失败后果：按本次目标与真实危险裁定受拒、错失、暴露、受伤或撤离等结果，不把每次失手升级为死亡或全线失败。已有证据、救援、资源及已领XP分别保留，未取得成果不预奖。真实致命危险照常处理，不暗改骰子、临时削弱能力或强制救援，也不承诺安全出口；新的撤退、投降或主动承伤仍由玩家决定。简化保留实际后果，玩家强度估算实验继续后置。'''
content=old['content'].rstrip()+'\n\n'+addition
refs=list(old['extensions']['901_replay'].get('source_refs',[]))
refs.extend([
    ref('work/replay_research/user_clarifications.md','## UCL_20261018_007'),
    ref('output/replay_f_review/v1/gm/host_rules.md','## 按需讲解规则'),
    ref('output/replay_f_review/v1/gm/host_rules.md','## 根据反馈调整场景重点'),
    ref('output/replay_f_review/v1/gm/host_rules.md','## 失败、压力与致命风险'),
    ref('output/replay_f_review/v1/gm/turn_flow.md','## 按需讲解、反馈与失败处理〔008〕'),
    ref('work/replay_research/capital_event_dependencies.md','## 2026-10-18：按需讲解、反馈与相称后果〔008已采用〕'),
    ref('901_rules_source_library/content/RE/01_rules/04_附录/ST指南.md','**游戏教学**'),
    ref('901_rules_source_library/content/RE/01_rules/04_附录/ST指南.md','**运作游戏**'),
    ref('901_rules_source_library/content/RE/01_rules/04_附录/ST指南.md','**开团要点——来自某位ST的经验分享：**'),
])
edit={'uid':old['uid'],'comment':old['comment'],'source_id':old['extensions']['901_replay']['source_id'],'entry_type':'concept','operation':'update','content':content,'source_refs':refs}
write(STAGE/'projection_edits.json',{'authorization':'UCL_20261018_007','parent_revision':'M1_IMPORT_20261018_007','revision':'M1_IMPORT_20261018_008','changes':[edit],'additions':[],'source_reanchors':[]})
diff=''.join(difflib.unified_diff(old['content'].splitlines(True),content.splitlines(True),fromfile='007/79768996',tofile='008/79768996',n=1))
(STAGE/'proposed.diff').write_text(diff,encoding='utf-8')
inventory=read(STAGE/'source_inventory.json')
for r in refs:
    p=ROOT/r['path']; inventory['source_sha256'][r['path']]=hashlib.sha256(p.read_bytes()).hexdigest()
# Existing entry source locators into files touched this turn must still match.
checked=0
before_text={u['path']:u['before'] for u in read(STAGE/'source_updates.json')}
for e in book['entries'].values():
    for r in e.get('extensions',{}).get('901_replay',{}).get('source_refs',[]):
        if r.get('path') in inventory['updated_sources']:
            lines=(ROOT/r['path']).read_text(encoding='utf-8').splitlines()
            n=r.get('line',r.get('jsonl_line'))
            assert isinstance(n,int),(e['uid'],r)
            assert lines[n-1]==before_text[r['path']].splitlines()[n-1],(e['uid'],r)
            if 'locator' in r: assert r['locator'] in lines[n-1],(e['uid'],r)
            checked+=1
inventory['inherited_affected_source_locators_checked']=checked
write(STAGE/'source_inventory.json',inventory)
print(diff)
print(f'Existing source locators in touched files preserved: {checked}')
