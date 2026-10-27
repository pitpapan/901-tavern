"""Compare maintained contracts with runtime and classifier data, without APIs."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[3]
KIT = ROOT.parent / '901-resource-authoring-kit'
STAGE = Path(__file__).resolve().parent
sys.path.insert(0,str(KIT/'tools'))
from compile_resources import load_contracts,ENGINE


def audit():
    compiled = json.loads(subprocess.check_output([
        'node', '--input-type=module', '-e',
        "import {RESOURCE_DATA as data,RESOURCE_ENGINE_ABI as abi} from './work/rules_engine/resource-data.mjs';"
        "import {RESOURCE_ACTION_INDEX as index} from './work/rules_engine/resource-action-index.mjs';"
        "console.log(JSON.stringify({data,index,abi}));",
    ], cwd=ROOT, text=True))
    assert compiled['abi']==ENGINE['abi'],'resource data / capability artifact ABI mismatch'
    index = {row['resourceId']: row for row in compiled['index']}
    normalized={d['id']:d for d in load_contracts()}
    rows = []
    for path in sorted((KIT / 'resources/execution').glob('*.rule.json')):
        raw = json.loads(path.read_text(encoding='utf-8'));d=normalized[raw['id']]
        source = KIT / d['reading']['path']
        assert hashlib.sha256(source.read_bytes()).hexdigest() == d['reading']['sha256'], d['id']
        expected = dict(d['definition'], contractVersion=d['version'], readingHash=d['reading']['sha256'],
                        operations=[a['operation'] for a in d['actions']])
        assert compiled['data'][d['id']] == expected, d['id']
        for field, value in {'access':d['definition'].get('access','owned'),'adoptedDecisions':d.get('adoptedDecisions',[]),'version': d['version'], 'actions': d['actions'],
                             'consumerCoverage':d['consumerCoverage'],'status': d['verification']['status'],
                             'runtimeFullyVerified': d['verification']['runtimeFullyVerified'],
                             'implementationGaps': d['implementationGaps'],
                             'unresolvedRules': d['unresolvedRules']}.items():
            assert index[d['id']][field] == value, (d['id'], field)
        rows.append(dict(id=d['id'], name=d['identity']['name'], version=d['version'],
                         reading=d['reading'], category=d['identity']['category'],
                         prohibited=d['definition'].get('prohibited', False),
                         baseProgram='cast' in d['definition'].get('programs', {}),
                         actions=[a['operation'] for a in d['actions']],
                         consumerCoverage=d['consumerCoverage'],verification=d['verification'], implementationGaps=d['implementationGaps'],
                         unresolvedRules=d['unresolvedRules']))
    assert {r['id'] for r in rows} == set(compiled['data']) == set(index)
    spells = [r for r in rows if r['category'] == 'spell']
    legal = [r for r in spells if not r['prohibited']]
    result = dict(status='source-contract-runtime-index-consistent', deployment='development_not_installed',
                  counts=dict(contracts=len(rows), actions=sum(len(r['actions']) for r in rows),
                              spells=len(spells), legalSpells=len(legal),
                              basePrograms=sum(r['baseProgram'] for r in legal),
                              legalWithoutBaseProgram=sum(not r['baseProgram'] for r in legal),
                              fullyVerified=sum(r['verification']['runtimeFullyVerified'] for r in rows)),
                  limits=['基础程序存在不等于变体、关键词、全部路径已实现或验证。',
                          '世界书投影另由verify_candidate.py核验；实际运行环境不由生成文件推断。'],
                  resources=rows)
    (STAGE / 'recovery-coverage.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'status': result['status'], 'counts': result['counts']}, ensure_ascii=False))


if __name__ == '__main__':
    audit()
