"""Read-only R1C-2 provenance, review coverage and integrity checks.

This validator does not interpret Chinese source semantics or adjudicate facts.
Semantic acceptance comes from explicit source-first reviews and root decisions.
It does not import the pilot generator or a semantic extraction function.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
RELATIVE = Path('work/rebuild/r1c_vnext/full_source_review')
EXPECTED_PRODUCTION = 'cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3'
REQUIRED_FACT_FIELDS = {'fact_id', 'revision', 'proposition_type', 'statement', 'subject_refs',
                        'reality_scope', 'narrative_modality', 'evidence_nature', 'polarity', 'source_locators'}
DISPOSITIONS = {'KEEP', 'MERGE', 'DUPLICATE', 'NON_CONTINUITY', 'ISOLATED_WORLD', 'UNRESOLVED'}
LINK_FIELDS = ('supports', 'refutes', 'revises', 'supersedes')
ROLE_FIELDS = ('subject_refs', 'speaker_refs', 'actor_refs', 'addressee_refs', 'observer_refs')


def canonical(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n').encode('utf-8')


def object_hash(value: Any) -> str:
    return hashlib.sha256(canonical(value)).hexdigest()


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding='utf-8-sig'))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding='utf-8-sig').splitlines() if line.strip()]


def source_population(root: Path) -> tuple[dict[str, dict[str, Any]], list[str]]:
    errors, sources, documents = [], {}, {}
    ledger = read_jsonl(root / 'work/phase3d_r2/source_coverage/source_chunk_ledger.jsonl')
    structural = []
    for row in sorted(ledger, key=lambda item: item['source_order']):
        document = row['document'].replace('\\', '/')
        if document not in documents:
            path = root / document
            documents[document] = {str(post['id']): post for post in read_jsonl(path)} if path.is_file() else {}
        post_id, chunk = str(row['post_id']), row['source_chunk_id']
        post = documents[document].get(post_id)
        if post is None:
            errors.append('UNRESOLVABLE_SOURCE:' + chunk)
            continue
        if chunk in sources:
            errors.append('DUPLICATE_SOURCE_CHUNK:' + chunk)
        sources[chunk] = {'source_path': document, 'post_id': post_id, 'source_order': row['source_order'],
                          'part': row['campaign_part'], 'page': row['page'], 'post_order': row['post_order'], 'post': post}
        structural.append((chunk, document, post_id, row['source_order']))
    accepted = read_json(root / 'work/rebuild/r1c_vnext/sampling_manifest.json')['population_sha256']
    if object_hash(structural) != accepted:
        errors.append('BLOCKED_BY_SOURCE_POPULATION_DRIFT')
    raw = set()
    for folder in ('extracted-first', 'extracted-second', 'extracted-third'):
        for path in (root / folder).rglob('posts.jsonl'):
            raw.update((path.relative_to(root).as_posix(), str(post['id'])) for post in read_jsonl(path))
    if raw != {(row['source_path'], row['post_id']) for row in sources.values()}:
        errors.append('BLOCKED_BY_SOURCE_POPULATION_DRIFT')
    return sources, sorted(set(errors))


def check_locator(root: Path, locator: dict[str, Any], sources: dict[str, dict[str, Any]]) -> list[str]:
    required = {'source_path', 'post_id', 'source_chunk_id', 'span_start', 'span_end', 'quote', 'post_sha256', 'file_sha256'}
    if required - set(locator):
        return ['INCOMPLETE_LOCATOR']
    row = sources.get(locator['source_chunk_id'])
    if not row or (row['source_path'], row['post_id']) != (locator['source_path'], str(locator['post_id'])):
        return ['LOCATOR_SOURCE_OWNERSHIP_MISMATCH']
    path = root / row['source_path']
    body, post = row['post']['body'], row['post']
    start, end = locator['span_start'], locator['span_end']
    errors = []
    if not isinstance(start, int) or not isinstance(end, int) or not 0 <= start < end <= len(body):
        errors.append('INVALID_LOCATOR_SPAN')
    elif body[start:end] != locator['quote']:
        errors.append('LOCATOR_QUOTE_MISMATCH')
    if object_hash(post) != locator['post_sha256']:
        errors.append('LOCATOR_POST_HASH_MISMATCH')
    if not path.is_file() or file_hash(path) != locator['file_sha256']:
        errors.append('LOCATOR_FILE_HASH_MISMATCH')
    return errors


def expected_indexes(facts: list[dict[str, Any]], mentions: list[dict[str, Any]], unresolved: list[dict[str, Any]]) -> dict[str, Any]:
    fields = {'facts_by_subject': 'subject_refs', 'facts_by_speaker': 'speaker_refs', 'facts_by_actor': 'actor_refs',
              'facts_by_reality_scope': 'reality_scope', 'facts_by_modality': 'narrative_modality', 'facts_by_evidence': 'evidence_nature'}
    result = {}
    for name, field in fields.items():
        groups = defaultdict(set)
        for fact in facts:
            values = fact.get(field, []) if field.endswith('_refs') else [fact[field]]
            for value in values:
                groups[value].add(fact['fact_id'])
        result[name] = {key: sorted(values) for key, values in sorted(groups.items())}
    by_source = defaultdict(set)
    for fact in facts:
        for locator in fact['source_locators']:
            by_source[locator['source_chunk_id']].add(fact['fact_id'])
    result['facts_by_source'] = {key: sorted(values) for key, values in sorted(by_source.items())}
    def order(fact):
        time = fact.get('story_time')
        source_order = time.get('source_order', '') if isinstance(time, dict) else ''
        return (source_order, fact['fact_id'])
    result['facts_by_story_order'] = [fact['fact_id'] for fact in sorted(facts, key=order)]
    result['entity_mentions'] = sorted(mentions, key=lambda row: row.get('mention_id', row.get('entity_ref', '')))
    result['unresolved_items'] = sorted(unresolved, key=lambda row: row.get('item_id', ''))
    return result


def check_indexes(facts, mentions, unresolved, indexes) -> list[str]:
    expected = expected_indexes(facts, mentions, unresolved)
    return ['INDEX_MISMATCH:' + name for name in expected if indexes.get(name) != expected[name]]


def check_bundle(bundle: dict[str, Any]) -> list[str]:
    errors = []
    population = set(bundle['population'])
    manifest = bundle['manifest']
    counts = Counter(row['source_chunk_id'] for row in manifest if row.get('primary_review') is True)
    if any(count != 1 for count in counts.values()):
        errors.append('DUPLICATE_PRIMARY_REVIEW')
    if set(counts) != population:
        errors.append('INCOMPLETE_PRIMARY_OWNERSHIP')
    for field, label in [('pass_a_reviewed', 'INCOMPLETE_PASS_A'), ('pass_b_reviewed', 'INCOMPLETE_PASS_B'),
                         ('adjudicated', 'INCOMPLETE_ADJUDICATION')]:
        if any(row.get(field) is not True for row in manifest) or len(manifest) != len(population):
            errors.append(label)
    for row in manifest:
        context = row.get('context_before', []) + row.get('context_after', [])
        if not set(context).issubset(population) or row['source_chunk_id'] in context or len(set(context)) != len(context):
            errors.append('INVALID_REVIEW_CONTEXT:' + row['source_chunk_id'])
    for field, label in [('pass_b_inventory', 'INCOMPLETE_SOURCE_FIRST_INVENTORY'), ('pass_b_reviews', 'INCOMPLETE_PASS_B_COMPARISON')]:
        rows = bundle[field]
        ids = [row['source_chunk_id'] for row in rows]
        if set(ids) != population or len(ids) != len(population):
            errors.append(label)
    for row in bundle['pass_b_inventory']:
        if not row.get('source_inventory'):
            errors.append('EMPTY_SOURCE_FIRST_INVENTORY:' + row['source_chunk_id'])
    for row in bundle['pass_b_reviews']:
        if not row.get('comparison') and not row.get('check_results'):
            errors.append('EMPTY_PASS_B_COMPARISON:' + row['source_chunk_id'])
    facts = bundle['facts']
    fact_ids = {fact['fact_id'] for fact in facts}
    if len(fact_ids) != len(facts):
        errors.append('DUPLICATE_FACT_ID')
    a_facts = bundle['pass_a_facts']
    if len({fact['fact_id'] for fact in a_facts}) != len(a_facts):
        errors.append('DUPLICATE_PASS_A_FACT_ID')
    approved = {}
    for decision in bundle['adjudications']:
        approved.update(decision.get('approved_fact_hashes', {}))
    entities = {row['entity_ref'] for row in bundle['mentions']}
    entities.update(row['canonical_entity_ref'] for row in bundle['mentions'] if row.get('canonical_entity_ref'))
    for mention in bundle['mentions']:
        if mention.get('resolution_status') == 'UNRESOLVED_ENTITY' and mention.get('canonical_entity_ref') is not None:
            errors.append('UNRESOLVED_ENTITY_MERGED')
    for fact in facts:
        ident = fact['fact_id']
        if REQUIRED_FACT_FIELDS - set(fact) or not fact.get('subject_refs') or not fact.get('source_locators'):
            errors.append('INVALID_ATOMIC_FACT:' + ident)
        if approved.get(ident) != object_hash(fact):
            errors.append('UNAPPROVED_FACT_REVISION:' + ident)
        for field in LINK_FIELDS:
            if not set(fact.get(field, [])).issubset(fact_ids):
                errors.append('DANGLING_FACT_LINK:' + ident)
        for field in ROLE_FIELDS:
            if not set(fact.get(field, [])).issubset(entities):
                errors.append('UNREGISTERED_ENTITY:' + ident)
        if fact.get('reality_scope') == fact.get('narrative_modality') or fact.get('narrative_modality') == fact.get('evidence_nature'):
            errors.append('COLLAPSED_SEMANTIC_DIMENSIONS:' + ident)
    units = bundle['dispositions']
    unit_ids = {row['unit_id'] for row in units}
    if len(unit_ids) != len(units):
        errors.append('DUPLICATE_DISPOSITION_UNIT')
    for row in manifest:
        if not row.get('unit_refs') or not set(row['unit_refs']).issubset(unit_ids):
            errors.append('SILENT_SOURCE_UNIT')
        if not set(row.get('fact_refs', [])).issubset(fact_ids):
            errors.append('DANGLING_PRIMARY_FACT_REFERENCE')
    for unit in units:
        refs = unit.get('fact_refs', [])
        if unit.get('disposition') not in DISPOSITIONS or not unit.get('reason') or unit['source_chunk_id'] not in population:
            errors.append('INVALID_SOURCE_DISPOSITION:' + unit['unit_id'])
        if not set(refs).issubset(fact_ids):
            errors.append('DANGLING_DISPOSITION_FACT:' + unit['unit_id'])
        if unit.get('disposition') in {'KEEP', 'MERGE', 'DUPLICATE', 'ISOLATED_WORLD'} and not refs:
            errors.append('DISPOSITION_WITHOUT_FACT:' + unit['unit_id'])
    finding_ids = {row['finding_id'] for row in bundle['findings']}
    accounted = {ref for row in bundle['adjudications'] for ref in row.get('finding_refs', [])}
    if finding_ids != accounted:
        errors.append('UNACCOUNTED_DISAGREEMENT')
    if any(row.get('status') not in {'RESOLVED_WITH_SOURCE', 'UNRESOLVED', 'CONTRACT_GAP'} for row in bundle['adjudications']):
        errors.append('INVALID_ADJUDICATION_STATUS')
    if bundle['contract_gaps']:
        errors.append('BLOCKED_BY_CONTRACT_GAPS')
    return sorted(set(errors))


def protection(root: Path) -> tuple[dict[str, Any], list[str]]:
    base = root / 'work/phase3d_r2c'
    files = [{'path': path.relative_to(base).as_posix(), 'size': path.stat().st_size, 'sha256': file_hash(path)}
             for path in sorted(base.rglob('*')) if path.is_file()]
    aggregate = hashlib.sha256(b''.join(canonical(row) for row in files)).hexdigest()
    frozen = read_json(base / 'reviewed_inputs/frozen_input_manifest.json')['files']
    bad = [row['path'] for row in frozen if not (root / row['path']).is_file() or file_hash(root / row['path']) != row['sha256']]
    errors = []
    if len(files) != 140 or aggregate != EXPECTED_PRODUCTION:
        errors.append('PRODUCTION_DRIFT')
    if len(frozen) != 488 or bad:
        errors.append('FROZEN_INPUT_DRIFT')
    accepted_files = root / RELATIVE / 'preflight.json'
    if accepted_files.is_file():
        for row in read_json(accepted_files).get('accepted_artifacts', []):
            path = root / row['path']
            if not path.is_file() or file_hash(path) != row['sha256']:
                errors.append('ACCEPTED_R1C1_ARTIFACT_CHANGED:' + row['path'])
    return {'production': {'files': len(files), 'aggregate_sha256': aggregate},
            'frozen_inputs': {'verified': len(frozen) - len(bad), 'expected': len(frozen), 'bad': bad}}, errors


def checkpoint_progress(root: Path) -> dict[str, Any]:
    result = {}
    for folder in ('pass_a', 'pass_b_inventory', 'pass_b'):
        rows, facts, findings = [], [], []
        for path in sorted((root / RELATIVE / 'checkpoints' / folder).glob('*.json')):
            value = read_json(path)
            rows.extend(value.get('reviews', []))
            facts.extend(value.get('facts', []))
            findings.extend(value.get('findings', []))
        ids = [row['source_chunk_id'] for row in rows]
        result[folder] = {'reviewed': len(set(ids)), 'duplicate_records': len(ids) - len(set(ids)),
                          'facts': len(facts), 'findings': len(findings)}
    return result


def audit(root: Path = ROOT) -> dict[str, Any]:
    sources, errors = source_population(root)
    protected, protection_errors = protection(root)
    errors.extend(protection_errors)
    progress = checkpoint_progress(root)
    base = root / RELATIVE
    paths = {'manifest': 'source_review_manifest.jsonl', 'pass_a_facts': 'pass_a_atomic_facts.jsonl',
             'facts': 'atomic_facts.jsonl', 'dispositions': 'source_dispositions.jsonl',
             'pass_b_inventory': 'pass_b_source_inventory.jsonl', 'pass_b_reviews': 'pass_b_reviews.jsonl',
             'findings': 'pass_b_findings.jsonl', 'adjudications': 'adjudication_ledger.jsonl',
             'mentions': 'entity_mentions.jsonl', 'contract_gaps': 'contract_gaps.jsonl'}
    missing = [name for name, relative in paths.items() if not (base / relative).is_file()]
    if missing:
        errors.append('REVIEW_AUTHORITY_NOT_COMPLETE')
    bundle = {'population': list(sources), **{name: read_jsonl(base / relative) if (base / relative).is_file() else []
                                            for name, relative in paths.items()}}
    if not missing:
        errors.extend(check_bundle(bundle))
        for collection, field in [('facts', 'source_locators'), ('pass_a_facts', 'source_locators'),
                                   ('dispositions', 'source_locators'), ('findings', 'source_locators'), ('mentions', 'source_refs')]:
            for row in bundle[collection]:
                for locator in row.get(field, []):
                    errors.extend(check_locator(root, locator, sources))
        for row in bundle['manifest']:
            source = sources.get(row['source_chunk_id'])
            if not source or any(row.get(key) != source[key] for key in ('source_path', 'post_id', 'source_order')):
                errors.append('PRIMARY_SOURCE_IDENTITY_MISMATCH')
        unresolved = read_jsonl(base / 'unresolved_items.jsonl') if (base / 'unresolved_items.jsonl').is_file() else []
        indexes = {path.stem: read_json(path) for path in (base / 'indexes').glob('*.json')}
        errors.extend(check_indexes(bundle['facts'], bundle['mentions'], unresolved, indexes))
        for filename in ('regression_results.json', 'pilot_scene_results.json', 'qa_results.json', 'mutation_results.json'):
            path = base / filename
            if not path.is_file() or read_json(path).get('status') != 'PASS':
                errors.append('REQUIRED_REVIEW_GATE_NOT_PASSED:' + filename)
    status = 'PASS' if not errors else 'BLOCKED' if all(error.startswith(('BLOCKED_', 'REVIEW_AUTHORITY_')) for error in errors) else 'FAIL'
    result = {'status': status, 'source_population': {'documents': len({row['source_path'] for row in sources.values()}),
               'primary_posts': len(sources), 'parts': dict(Counter(row['part'] for row in sources.values()))},
              'checkpoint_progress': progress, **protected, 'errors': sorted(set(errors)),
              'limitation': 'Mechanical integrity checks do not establish semantic truth; source-first review, explicit adjudication and fresh QA remain required.'}
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--progress', action='store_true', help='Report checkpoints without claiming completed authority.')
    args = parser.parse_args()
    result = audit()
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    if result['status'] != 'PASS' and not args.progress:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
