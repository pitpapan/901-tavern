from review_p2_late_p3 import *
base=OUT/'P2_P014.json'
obj=json.loads(base.read_text(encoding='utf-8'))
by={r['post_order']:r for r in rows('P2',14)}
# Explicit review-authored mention supplements; no automatic name recognition.
targets=[
(4,'操真晴人',3,'操真晴人'),
(6,'白色身影',6,'一个白色的身影'),(6,'银色巨龙',6,'银色巨龙'),
(14,'匿名电子合成声',14,'一个冰冷的电子合成音'),
(16,'未见过的人形魔物',16,'一名从未见过的人形魔物'),
(22,'暗幕魔兽',22,'暗幕魔兽'),(22,'罗伯',20,'罗伯'),
(29,'徽章持有者',29,'持有者'),(29,'艾利',28,'艾利'),
(30,'徽章持有者',30,'A级游击士'),
(31,'徽章持有者',31,'勋章的持有者'),(32,'徽章持有者',32,'也有可能遭遇到其他更加强大的魔兽了'),
(48,'族长爷爷',48,'族长爷爷'),(48,'黄泉',46,'黄泉'),
(50,'五大头',50,'五大头'),(50,'史莱姆',50,'史莱姆'),(50,'哥布林',50,'哥布林'),
(50,'留会三名魔兽',50,'最后的圆桌上只剩下三人'),
(50,'魔兽部族代表',50,'魔兽部族代表'),(50,'龙族',50,'龙族')]
added=[]
for i,(n,name,source_n,q) in enumerate(targets,1):
    cid=by[n]['source_chunk_id'];source=by[source_n]
    added.append({'mention_id':f'R1C2_{cid}_M_SUPPLEMENT_{i:03}','entity_ref':f'UNRESOLVED_ENTITY:{cid}:{name}','display_name':name,'canonical_entity_ref':None,'resolution_status':'UNRESOLVED_ENTITY','aliases':[],'titles':[],'source_refs':[pilot.locator_for_chunk(IDX,source['source_chunk_id'],q)],'first_observed_source':source['source_chunk_id'],'mention_role':'source_supported_descriptive_or_contextual_referent','identity_note':'仅局部源文指称；不进行全局身份合并。'})
revision={'stage':'PASS_A_REVISION','reviewer':WHO,'document':obj['document'],'base_checkpoint':str(base.relative_to(ROOT)).replace('\\','/'),'primary_review':False,'reason':'完成当前已开始页的实体引用登记自检；仅追加已有事实的明确源文指称，不新增主审单元。','added_mentions':added,'revised_facts':[],'added_facts':[],'added_dispositions':[],'unresolved_items':[],'contract_gaps':[]}
with (OUT/'P2_P014.revision_001.json').open('x',encoding='utf-8') as f:json.dump(revision,f,ensure_ascii=False,indent=2)
allmentions=obj['mentions']+added
locs=[l for k in ('facts','dispositions') for x in obj[k] for l in x['source_locators']]+[l for m in allmentions for l in m['source_refs']]
for l in locs:pilot.validate_locator(ROOT,l)
refs={x for f in obj['facts'] for k in ('subject_refs','actor_refs','speaker_refs','addressee_refs','observer_refs') for x in f.get(k,[])}
missing=refs-{m['entity_ref'] for m in allmentions}
assert not missing,missing
report={'stage':'PROVISIONAL_PASS_A_CHECKPOINT_VALIDATION','reviewer':WHO,'checkpoints':['P2_P014.json','P2_P014.revision_001.json'],'primary_posts_total':50,'reviewed_pass_a':50,'reviewed_pass_b':0,'adjudicated':0,'facts':len(obj['facts']),'dispositions':len(obj['dispositions']),'mentions':len(allmentions),'unresolved_items':0,'contract_gaps':0,'unresolved_entity_references':sum(m['canonical_entity_ref'] is None for m in allmentions),'locator_checks':len(locs),'locator_failures':0,'duplicate_primary_posts':0,'missing_entity_mentions':0,'semantic_approval':False,'limitations':['机械验证只确认哈希、切片和引用，不能证明语义充分。','页内局部未解析实体未全局合并；身份关系须后续裁决。','尚未开始Pass B；较长多主题单元的原子粒度仍待独立复核。'],'unstarted_ranges':['P2 pages 15–25','P3 pages 1–5']}
with (OUT/'P2_P014.validation.json').open('x',encoding='utf-8') as f:json.dump(report,f,ensure_ascii=False,indent=2)
print(json.dumps(report,ensure_ascii=False))
