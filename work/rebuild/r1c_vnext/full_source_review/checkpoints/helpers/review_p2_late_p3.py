"""Mechanical persistence of human-authored semantic review; no text classification."""
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[6]
sys.path.insert(0,str(ROOT/'scripts/r1c_vnext'))
import pilot
IDX=pilot.build_source_index(ROOT)
OUT=ROOT/'work/rebuild/r1c_vnext/full_source_review/checkpoints/pass_a'
WHO='/root/review_p2_late_p3'
KNOWN={'御临风':'PC_YU_LINFENG','悠悠':'NPC_YOUYOU','布莱特':'NPC_CASSIUS_BRIGHT'}
def rows(part,page):
    return sorted([r for r in IDX['chunks'].values() if r['campaign_part']==part and r['page']==page],key=lambda r:r['post_order'])
def read(part,page,start=1,end=50):
    for r in rows(part,page):
        if start<=r['post_order']<=end: print(f"\n{r['post_order']} {r['source_chunk_id']}\n{r['post']['body']}")
def save(part,page,specs,contexts=None,suffix=''):
    rr=rows(part,page); by={r['post_order']:r for r in rr}; contexts=contexts or {}
    facts=[]; reviews=[]; dispositions=[]; mentions=[]; unresolved=[]
    for n,spec in specs.items():
        r=by[int(n)]; cid=r['source_chunk_id']; body=r['post']['body']; fs=[]; us=[]; inv=[]
        cx=contexts.get(str(n),contexts.get('*',[])); cr=[IDX['chunks'][x] for x in cx]
        def ref(name): return KNOWN.get(name,f'UNRESOLVED_ENTITY:{cid}:{name}')
        def loc(q): return pilot.locator_for_chunk(IDX,cid,q)
        for i,u in enumerate(spec['units'],1):
            uid=f'R1C2_{cid}_U{i:03}'; us.append(uid); statement=u['s']; inv.append(statement); locator=loc(u['q'])
            disposition=u.get('d','KEEP'); refs=[]
            if disposition in ('KEEP','ISOLATED_WORLD','UNRESOLVED') and u.get('sub'):
                fid=f'R1C2_{cid}_F{i:03}';fs.append(fid);refs=[fid]
                fact={'fact_id':fid,'revision':1,'proposition_type':u.get('t','ACTION'),'statement':statement,'subject_refs':[ref(x) for x in u['sub']], 'reality_scope':u.get('scope',spec.get('scope','MAIN_WORLD')),'narrative_modality':u.get('m','ACTUAL'),'evidence_nature':u.get('e','NARRATIVE_CONFIRMATION'),'polarity':u.get('p','AFFIRMED'),'story_time':{'source_order':r['source_order'],'description':u.get('time','本帖叙事时点')},'source_locators':[locator]}
                for src,dst in [('a','actor_refs'),('sp','speaker_refs'),('to','addressee_refs'),('ob','observer_refs')]:
                    if u.get(src): fact[dst]=[ref(x) for x in u[src]]
                for k in ('conditions','quantifiers','uncertainty_note','persistence','valid_from','valid_until','last_confirmed_at','revises','supersedes','refutes','supports','identity_links','utterance_time','knowledge_time'):
                    if k in u: fact[k]=u[k]
                pilot.validate_atomic_fact(ROOT,fact);facts.append(fact)
            dispositions.append({'unit_id':uid,'source_chunk_id':cid,'source_locators':[locator],'disposition':disposition,'reason':u.get('reason','源文明确支持该独立连续性单元；保留其叙述和认识边界。'),'fact_refs':refs})
            if disposition=='UNRESOLVED':unresolved.append({'item_id':uid+'_UNRESOLVED','source_chunk_id':cid,'description':u.get('uncertainty_note',statement),'source_locators':[locator],'fact_refs':refs})
        for j,name in enumerate(spec.get('names',[]),1):
            candidates=[r]+cr; found=next((z for z in candidates if name in z['post']['body']),None)
            if found is None: raise ValueError(f'mention lacks literal support {cid} {name}')
            ml=pilot.locator_for_chunk(IDX,found['source_chunk_id'],name)
            mentions.append({'mention_id':f'R1C2_{cid}_M{j:03}','entity_ref':ref(name),'display_name':name,'canonical_entity_ref':KNOWN.get(name),'resolution_status':'RESOLVED' if name in KNOWN else 'UNRESOLVED_ENTITY','aliases':[],'titles':[],'source_refs':[ml],'first_observed_source':found['source_chunk_id'],'mention_role':'explicit_source_mention'})
        reviews.append({'source_path':r['document'],'post_id':str(r['post_id']),'source_chunk_id':cid,'source_order':r['source_order'],'primary_review':True,'context_before':[x for x in cx if IDX['chunks'][x]['source_order']<r['source_order']],'context_after':[x for x in cx if IDX['chunks'][x]['source_order']>r['source_order']],'source_inventory':inv,'unit_refs':us,'fact_refs':fs,'reviewer':WHO})
    obj={'stage':'PASS_A','reviewer':WHO,'document':rr[0]['document'],'reviews':reviews,'facts':facts,'dispositions':dispositions,'mentions':mentions,'unresolved_items':unresolved,'contract_gaps':[],'progress':{'primary_posts_total':len(rr),'reviewed_pass_a':len(reviews),'reviewed_pass_b':0,'adjudicated':0,'unresolved':len(unresolved),'contract_gaps':0}}
    OUT.mkdir(parents=True,exist_ok=True);path=OUT/f'{part}_P{page:03}{suffix}.json'
    with path.open('x',encoding='utf-8') as f:json.dump(obj,f,ensure_ascii=False,indent=2)
    print(json.dumps({'path':str(path),'posts':len(reviews),'facts':len(facts),'mentions':len(mentions),'units':len(dispositions)},ensure_ascii=False))
if __name__=='__main__':read(sys.argv[1],int(sys.argv[2]),int(sys.argv[3]) if len(sys.argv)>3 else 1,int(sys.argv[4]) if len(sys.argv)>4 else 50)
