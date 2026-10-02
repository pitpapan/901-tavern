"""Mechanical serialization only; semantic inputs are explicitly authored by reviewer."""
from pathlib import Path
import sys,json
ROOT=Path(__file__).resolve().parents[6]
sys.path.insert(0,str(ROOT/'scripts/r1c_vnext'))
import pilot
INDEX=pilot.build_source_index()
OUT=ROOT/'work/rebuild/r1c_vnext/full_source_review/checkpoints/pass_a'
REVIEWER='/root/review_p2_early'
def rows(page):
    return sorted([r for r in INDEX['chunks'].values() if r['campaign_part']=='P2' and r['page']==page],key=lambda r:r['post_order'])
def read(page,start=1,end=50):
    for r in rows(page)[start-1:end]: print(str(r['post_order'])+' '+r['source_chunk_id']+'\n'+r['post']['body']+'\n')
def u(statement,names,kind='ACTION',modality='ACTUAL',evidence='NARRATIVE_CONFIRMATION',speaker=None,actors=None,polarity='AFFIRMED',quote=None,scope='MAIN_WORLD',reason=None,**extras):
    return dict(statement=statement,names=names,kind=kind,modality=modality,evidence=evidence,speaker=speaker,actors=actors,polarity=polarity,quote=quote,scope=scope,reason=reason,extras=extras)
def non(statement,reason,quote=None,names=None):
    return dict(statement=statement,reason=reason,quote=quote,names=names or [],non=True)
def save(page,authored,label=None):
    rr=rows(page); cp=dict(stage='PASS_A',reviewer=REVIEWER,document=rr[0]['document'],reviews=[],facts=[],dispositions=[],mentions=[],unresolved_items=[],contract_gaps=[])
    for number,entry in sorted(authored.items()):
        r=rr[number-1]; cid=r['source_chunk_id']; body=r['post']['body']; contexts=entry.get('context',[])
        context_rows=[INDEX['chunks'][c] if isinstance(c,str) else rr[c-1] for c in contexts]
        context_ids=[x['source_chunk_id'] for x in context_rows]
        review=dict(source_path=r['document'],post_id=str(r['post_id']),source_chunk_id=cid,source_order=r['source_order'],primary_review=True,context_before=[c for c in context_ids if INDEX['chunks'][c]['source_order']<r['source_order']],context_after=[c for c in context_ids if INDEX['chunks'][c]['source_order']>r['source_order']],source_inventory=[],unit_refs=[],fact_refs=[],reviewer=REVIEWER)
        entities={}
        for j,unit in enumerate(entry['units'],1):
            uid=f'R1C2_{cid}_U{j:03}'; review['unit_refs'].append(uid); review['source_inventory'].append(dict(unit_id=uid,description=unit['statement']))
            loc=pilot.locator_for_chunk(INDEX,cid,unit.get('quote')) if unit.get('quote') else pilot.locator_for_chunk(INDEX,cid,body)
            for name in unit['names']+([unit['speaker']] if unit.get('speaker') else [])+(unit.get('actors') or []):
                if name in entities: continue
                canonical='PC_YU_LINFENG' if name=='御临风' else None
                ref=canonical or f'UNRESOLVED_ENTITY:{cid}:{name}'
                named_row=next((z for z in [r]+context_rows if name in z['post']['body']),r)
                nloc=pilot.locator_for_chunk(INDEX,named_row['source_chunk_id'],name if name in named_row['post']['body'] else named_row['post']['body'])
                mention=dict(mention_id=f'R1C2_{cid}_M{len(entities)+1:03}',entity_ref=ref,display_name=name,canonical_entity_ref=canonical,resolution_status='RESOLVED' if canonical else 'UNRESOLVED_ENTITY',aliases=[],titles=[],source_refs=[nloc],first_observed_source=named_row['source_chunk_id'],mention_role='source semantic participant',identity_note='Local reference; no cross-post identity merge performed.' if not canonical else 'Explicit name identifies the player character.')
                cp['mentions'].append(mention); entities[name]=ref
            disp=dict(unit_id=uid,source_chunk_id=cid,source_locators=[loc],disposition='NON_CONTINUITY' if unit.get('non') else ('ISOLATED_WORLD' if unit.get('scope')!='MAIN_WORLD' else 'KEEP'),reason=unit.get('reason') or '独立保留原文中的行动、状态或带归属的言述及其模态边界。',fact_refs=[])
            if not unit.get('non'):
                fid=f'R1C2_{cid}_F{len(review["fact_refs"])+1:03}'
                fact=dict(fact_id=fid,revision=1,proposition_type=unit['kind'],statement=unit['statement'],subject_refs=[entities[n] for n in unit['names']],reality_scope=unit['scope'],narrative_modality=unit['modality'],evidence_nature=unit['evidence'],polarity=unit['polarity'],source_locators=[loc],story_time=dict(source_order=r['source_order'],description='此源文记述时点；未推定绝对日期'))
                if unit.get('speaker'): fact['speaker_refs']=[entities[unit['speaker']]]
                if unit.get('actors'): fact['actor_refs']=[entities[n] for n in unit['actors']]
                fact.update(unit.get('extras',{})); pilot.validate_atomic_fact(ROOT,fact)
                cp['facts'].append(fact); disp['fact_refs']=[fid]; review['fact_refs'].append(fid)
            cp['dispositions'].append(disp)
        cp['reviews'].append(review)
    cp['checkpoint_counts']=dict(primary_posts_total=len(rr),reviewed_pass_a=len(cp['reviews']),reviewed_pass_b=0,adjudicated=0,unresolved=len(cp['unresolved_items']),contract_gaps=len(cp['contract_gaps']),atomic_facts_proposed=len(cp['facts']),entity_mentions=len(cp['mentions']))
    OUT.mkdir(parents=True,exist_ok=True)
    path=OUT/f'P2_P{page:03}{"_"+label if label else ""}.json'
    with path.open('x',encoding='utf-8',newline='\n') as f: json.dump(cp,f,ensure_ascii=False,indent=2); f.write('\n')
    print(path,cp['checkpoint_counts'])
if __name__=='__main__': read(int(sys.argv[1]),int(sys.argv[2]) if len(sys.argv)>2 else 1,int(sys.argv[3]) if len(sys.argv)>3 else 50)
