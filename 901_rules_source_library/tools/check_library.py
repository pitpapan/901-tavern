"""Read-only integrity check for this fixed PHB/RE source snapshot."""
from pathlib import Path
import hashlib
import json
import re
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]

def main():
    errors = []
    rows = [json.loads(x) for x in (ROOT / 'catalog.jsonl').read_text(encoding='utf-8-sig').splitlines()]
    counts = {b: sum(r['book'] == b for r in rows) for b in ('PHB', 'RE')}
    if counts != {'PHB': 16, 'RE': 964}:
        errors.append(f'Incomplete snapshot: {counts}; expected PHB 16 / RE 964')
    for key in ('md_path', 'source_html'):
        if len({r[key] for r in rows}) != len(rows):
            errors.append(f'Duplicate {key}')
    for r in rows:
        src, md = ROOT / r['source_html'], ROOT / r['md_path']
        if not src.is_file() or not md.is_file():
            errors.append(f'Missing source/content: {r["title"]}')
        elif hashlib.sha256(src.read_bytes()).hexdigest() != r['html_sha256']:
            errors.append(f'Source hash changed: {r["source_html"]}')
        elif md.stat().st_size < 100:
            errors.append(f'Empty conversion: {r["md_path"]}')
        elif r.get('markdown_sha256') and hashlib.sha256(md.read_bytes()).hexdigest() != r['markdown_sha256']:
            errors.append(f'Markdown differs from catalog: {r["md_path"]}')
    provenance = ROOT/'source_archives'/'provenance.json'
    if not provenance.exists():
        errors.append('Missing archive provenance')
    else:
        for a in json.loads(provenance.read_text(encoding='utf-8'))['archives']:
            archive = ROOT/a['file']
            if not archive.exists() or hashlib.sha256(archive.read_bytes()).hexdigest() != a['sha256']:
                errors.append(f'Archive missing/changed: {a["file"]}')
    for name in ('resources', 'traits', 'bestiary', 'misc', 'mechanisms'):
        if not (ROOT / 'indices' / f'{name}.md').is_file():
            errors.append(f'Missing index: {name}')
    authoring = ROOT.parent/'work'/'character_builder'/'resource_authoring'
    docs = [ROOT/'README.md', ROOT/'INDEX.md', ROOT/'codex_quickstart.md', *sorted((ROOT/'indices').glob('*.md')), *sorted(authoring.glob('*.md'))]
    for doc in docs:
        for link in re.findall(r'\]\(([^)]+)\)', doc.read_text(encoding='utf-8-sig')):
            if '://' in link or link.startswith('#'):
                continue
            target = unquote(link.split('#')[0]).strip('<>')
            if target and not (doc.parent / target).exists():
                errors.append(f'Broken link: {doc.name} -> {target}')
    passages = ROOT/'passages.jsonl'
    if not passages.exists():
        errors.append('Missing passage index')
    else:
        covered = set()
        contents = {r['md_path']: (ROOT/r['md_path']).read_text(encoding='utf-8-sig').splitlines() for r in rows}
        for line in passages.read_text(encoding='utf-8').splitlines():
            p = json.loads(line)
            covered.add(p['md_path'])
            actual = '\n'.join(contents[p['md_path']][p['start']-1:p['end']])
            if actual != p['text']:
                errors.append(f'Stale passage: {p["id"]}')
        blank = {r['md_path'] for r in rows if r.get('source_characters') == 0
                 and not any(x.strip() for x in contents[r['md_path']][5:])}
        if covered != set(contents) - blank:
            errors.append(f'Passage coverage mismatch: {len(covered)} / {len(contents)-len(blank)} nonempty pages')
    print(json.dumps({'pages': len(rows), 'books': counts,
        'empty_source_pages': [r['md_path'] for r in rows if r.get('source_characters') == 0],
        'errors': errors[:30], 'error_count': len(errors)}, ensure_ascii=False, indent=2))
    return bool(errors)

if __name__ == '__main__':
    raise SystemExit(main())
