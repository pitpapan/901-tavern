"""Mechanical serialization of explicitly authored source-first P1 semantic units.

No semantic classification, sentence detection or source-to-fact transformation.
All statements, roles and boundaries are supplied by the reviewer in data files.
"""
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
OUT = ROOT / 'work/rebuild/r1c_vnext/full_source_review/checkpoints/pass_a'
spec = importlib.util.spec_from_file_location('r1c_pilot', ROOT / 'scripts/r1c_vnext/pilot.py')
pilot = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pilot)
INDEX = pilot.build_source_index(ROOT)
KNOWN = {'御临风': 'PC_YU_LINFENG', '布莱特': 'NPC_CASSIUS_BRIGHT'}

def u(text, names, kind='ACTION', mode='ACTUAL', evidence='NARRATIVE_CONFIRMATION', actor='', speaker='', scope='MAIN_WORLD', polarity='AFFIRMED', quote=None, note=None):
    return dict(text=text, names=names.split('|'), kind=kind, mode=mode, evidence=evidence,
                actor=actor.split('|') if actor else [], speaker=speaker.split('|') if speaker else [],
                scope=scope, polarity=polarity, quote=quote, note=note)

def s(text, names, speaker, kind='STATEMENT', mode='ACTUAL', evidence='DIRECT_STATEMENT', **kw):
    return u(text, names, kind, mode, evidence, speaker=speaker, **kw)

def n(reason, quote=None):
    return dict(non_continuity=reason, quote=quote)

def save(page, authored, contexts=None, suffix=''):
    contexts = contexts or {}
    document = f'extracted-first/{page}/posts.jsonl'
    rows = sorted((r for r in INDEX['chunks'].values() if r['document'] == document), key=lambda r:r['post_order'])
    byno = {r['post_order']: r for r in rows}
    checkpoint = dict(stage='PASS_A', reviewer='/root/review_p1', document=document,
                      reviews=[], facts=[], dispositions=[], mentions=[], unresolved_items=[], contract_gaps=[])
    def chunk(p, no):
        return next(r['source_chunk_id'] for r in INDEX['chunks'].values() if r['document']==f'extracted-first/{p}/posts.jsonl' and r['post_order']==no)
    for no, units in sorted(authored.items()):
        row = byno[no]
        cid = row['source_chunk_id']
        before, after = contexts.get(no, ([(page,no-1)] if no>1 else [], [(page,no+1)] if no<len(rows) else []))
        review = dict(source_path=document, post_id=str(row['post_id']), source_chunk_id=cid,
                      source_order=row['source_order'], primary_review=True, context_before=[chunk(*p) for p in before],
                      context_after=[chunk(*p) for p in after], source_inventory=[], unit_refs=[], fact_refs=[], reviewer='/root/review_p1')
        entities = {}
        def ref(name):
            if name not in entities:
                entities[name] = KNOWN.get(name, f'UNRESOLVED_ENTITY:{cid}:{name}')
            return entities[name]
        for number, unit in enumerate(units, 1):
            uid = f'R1C2_{cid}_U{number:03d}'
            body = row['post']['body']
            quote = unit.get('quote') or body
            loc = pilot.locator_for_chunk(INDEX, cid, quote)
            review['unit_refs'].append(uid)
            text = unit.get('non_continuity') or unit['text']
            review['source_inventory'].append(dict(unit_id=uid, semantic_description=text))
            disp = dict(unit_id=uid, source_chunk_id=cid, source_locators=[loc], fact_refs=[])
            if 'non_continuity' in unit:
                disp.update(disposition='NON_CONTINUITY', reason=unit['non_continuity'])
            else:
                fid = f'R1C2_{cid}_F{len(review["fact_refs"])+1:03d}'
                fact = dict(fact_id=fid, revision=1, proposition_type=unit['kind'], statement=unit['text'],
                            subject_refs=[ref(x) for x in unit['names']], actor_refs=[ref(x) for x in unit['actor']],
                            speaker_refs=[ref(x) for x in unit['speaker']], reality_scope=unit['scope'],
                            narrative_modality=unit['mode'], evidence_nature=unit['evidence'], polarity=unit['polarity'],
                            story_time=dict(source_order=row['source_order'], description='本帖所叙场景；未补造历法时间'),
                            source_locators=[loc])
                if unit['speaker']:
                    fact['utterance_time'] = dict(source_order=row['source_order'])
                if unit.get('note'):
                    fact['uncertainty_note'] = unit['note']
                pilot.validate_atomic_fact(ROOT, fact)
                checkpoint['facts'].append(fact)
                review['fact_refs'].append(fid)
                disp['fact_refs'] = [fid]
                disp.update(disposition='ISOLATED_WORLD' if unit['scope'] != 'MAIN_WORLD' else 'KEEP',
                            reason='保留独立语义及其明确角色、模态和证据边界：'+unit['text'])
            checkpoint['dispositions'].append(disp)
        whole = pilot.locator_for_chunk(INDEX, cid, row['post']['body'])
        for number, (name, entity) in enumerate(entities.items(), 1):
            checkpoint['mentions'].append(dict(mention_id=f'R1C2_{cid}_M{number:03d}', entity_ref=entity,
               display_name=name, canonical_entity_ref=KNOWN.get(name), resolution_status='RESOLVED' if name in KNOWN else 'UNRESOLVED_ENTITY',
               aliases=[], titles=[], source_refs=[whole], first_observed_source=cid,
               mention_role='由人工语义单元指明的角色、对象或概念；代称按记录的上下文理解'))
        checkpoint['reviews'].append(review)
    checkpoint['progress'] = dict(primary_posts_total=len(rows), reviewed_pass_a=len(authored), reviewed_pass_b=0,
                                  adjudicated=0, unresolved=len(checkpoint['unresolved_items']), contract_gaps=0)
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / f'P1_P{page:03d}{suffix}.json'
    payload = (json.dumps(checkpoint, ensure_ascii=False, indent=2)+'\n').encode('utf-8')
    with target.open('xb') as stream:
        stream.write(payload)
    print(json.dumps(dict(saved=str(target.relative_to(ROOT)), posts=len(authored), facts=len(checkpoint['facts']),
                         dispositions=len(checkpoint['dispositions']), mentions=len(checkpoint['mentions']),
                         sha256=hashlib.sha256(payload).hexdigest()), ensure_ascii=False))
