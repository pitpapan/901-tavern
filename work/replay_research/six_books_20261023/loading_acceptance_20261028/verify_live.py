"""Read only the named isolated chat and verify host/prompt evidence, not prose quality."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
BASE=ROOT/'output/replay_tavern/six_books_20261023_candidate'
OUT=BASE/'scene_test/world-loading-20261028'
HOME=Path('D:/github/sillyTavern')
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()

def audit(require_complete=False):
    config=read(OUT/'config.json'); baseline=read(OUT/'protected-before.json')
    chat=HOME/'data/default-user/chats'/config['name']/(config['chatId']+'.jsonl')
    data=chat.read_text(encoding='utf-8')
    header=json.loads(data.splitlines()[0])
    runs=header['chat_metadata'].get('world_loading_acceptance',{}).get('runs',[])
    selected={r['id']:r for r in runs if r.get('harnessRevision',0)>=2}
    snapshots=[config['candidateHashes']]
    guidances=[config.get('worldContextGuidance')]
    if (OUT/'config-before-budget-guidance.json').exists():guidances.append(read(OUT/'config-before-budget-guidance.json').get('worldContextGuidance'))
    if (OUT/'config-before-explanation-fix.json').exists():snapshots.append(read(OUT/'config-before-explanation-fix.json')['candidateHashes'])
    if (OUT/'config-before-material-origin-fix.json').exists():snapshots.append(read(OUT/'config-before-material-origin-fix.json')['candidateHashes'])
    if (OUT/'config-before-trigger-fix.json').exists():snapshots.append(read(OUT/'config-before-trigger-fix.json')['candidateHashes'])
    if (OUT/'config-before-location-fix.json').exists():snapshots.append(read(OUT/'config-before-location-fix.json')['candidateHashes'])
    if (OUT/'config-before-stock-fix.json').exists():snapshots.append(read(OUT/'config-before-stock-fix.json')['candidateHashes'])
    definitions={e['uid']:e for f in (BASE/'import').glob('901_0*.json') for e in read(f)['entries'].values()}
    cases={c['id']:c for c in config['cases']}
    rules={
      'city':({'帝都'},{'帝国公共消息与民间见识','帝都腹地供给与公费农作施术','帝国军力与粮储基线'}),
      'silver':({'银月城'},{'高等精灵家传古史与知情边界'}),
      'cat':({'人物·猫音'},set()),
      'white':({'人物·白色魔法使','人物·肯达·凯·弗格斯'},{'白魔私人目标','肯达后期暗桩身份','白魔后来协作关系证据'}),
      'lotin-enter':({'洛汀','洛汀岩地矿料与工艺'},set()),
      'lotin-held':({'洛汀','洛汀岩地矿料与工艺'},set()),
      'lotin-exit':({'帝都'},{'洛汀','洛汀岩地矿料与工艺'}),
      'worldtree':({'远西世界树及共同照护'},{'YGGDRASIL'}),
      'sword':({'弃风剑'},{'弃风隐藏灵性与重铸条件'}),
      'budget':({'帝国公共消息与民间见识','飘零大陆共同节令与年度生活','帝国学士与长期研习','银月城'},set()),
    }
    reports=[];errors=[]
    for key,r in selected.items():
        failures=[]
        if r['status']!='completed':failures.append(r.get('error','request failed'))
        if key in ['lotin-enter','lotin-held','budget'] and config.get('worldContextGuidance') and r.get('harnessRevision',0)<5:failures.append('requires shared host guidance retest')
        if r['candidateHashes'] not in snapshots:failures.append('unknown candidate snapshot')
        if key in ['lotin-held','lotin-exit']:
            if r.get('hostScanPatch')!='latest-first-20261028' or r.get('actualHistory')!=cases[key]['history']:
                failures.append('requires real history with corrected host scan')
        if len(r['requests'])!=1 or len(r['activated'])!=1:failures.append('listener contamination or missing request')
        loaded=[e for rows in r.get('loaded',{}).values() for e in rows]
        if len(loaded)!=580:failures.append(f'loaded candidate count {len(loaded)}')
        if set(e['world'] for e in loaded)!=set(config['books']):failures.append('book set mismatch / foreign book')
        if len({(e['world'],e['uid']) for e in loaded})!=len(loaded):failures.append('duplicate book entry')
        active=r['activated'][0] if r['activated'] else []
        actual={e['name'] for e in active}
        required,forbidden=rules[key]
        if not required<=actual:failures.append('missing '+str(sorted(required-actual)))
        if forbidden&actual:failures.append('forbidden '+str(sorted(forbidden&actual)))
        prompt='\n'.join(m.get('content','') for m in (r['requests'][0].get('messages',[]) if r['requests'] else []) if isinstance(m.get('content'),str))
        if r.get('harnessRevision',0)>=5 and (r.get('worldContextGuidance') not in guidances or prompt.count(r.get('worldContextGuidance',''))!=1):failures.append('shared host guidance missing/duplicate')
        copies={}
        for entry in active:
            e=definitions[entry['uid']]
            copies[e['comment']]=prompt.count(e['content'])
            if copies[e['comment']]!=1:failures.append('prompt content missing/duplicate: '+e['comment'])
            if e['disable']:failures.append('disabled entry activated: '+e['comment'])
        for e in definitions.values():
            if e['disable'] and e['content'] in prompt:failures.append('secret body in prompt: '+e['comment'])
        if not r.get('response'):failures.append('empty model response')
        reports.append({'id':key,'harnessRevision':r.get('harnessRevision'),'status':'fail' if failures else 'pass','failures':failures,
          'activated':sorted(actual),'requestCount':len(r['requests']),'injectedCopies':copies,
          'budget':[x['budget'] for x in r['scan']],'promptChars':len(prompt),
          'response':r.get('response'),'model':r['requests'][0].get('model') if r['requests'] else None})
        errors.extend(key+': '+f for f in failures)
    concurrent_changes=[];changed_count=0
    peer_chat='data/default-user/chats/901 资源取得隔离验收 20261028/901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms.jsonl'
    peer_card='data/default-user/characters/901 资源取得隔离验收 20261028.png'
    for path,h in baseline['files'].items():
        if sha(HOME/path)!=h:
            changed_count+=1
            if path.replace('\\','/') in (peer_chat,peer_card):
                concurrent_changes.append({'path':path,'before':h,'current':sha(HOME/path),'owner':'资源线独立验收；2026-10-28原生Branch #1创建与接纳已由该对话及branch-rejected.json记录，原卡当前聊天引用随之变化；不作为本批未变文件'})
            else:errors.append('pre-existing file changed: '+path)
    settings=read(HOME/'data/default-user/settings.json')
    # Compare the runtime-relevant model options without printing credentials.
    model=settings['oai_settings']
    expected=baseline['model']
    configuration_changes=[]
    for k,field in [('source','chat_completion_source'),('model','google_model'),('maxContext','openai_max_context'),('maxTokens','openai_max_tokens')]:
        if expected[k]!=model[field]:
            if k=='model':
                configuration_changes.append({'field':field,'before':expected[k],'current':model[field],
                    'scope':'与中午基线不同；本轮没有操作模型或连接设置，但未在进入本轮前采集设置快照，不能确定变更时点或把两批当作同模型对比。保留当前配置，不回滚。'})
            else:errors.append('model setting changed: '+k)
    before=baseline['world'];after=settings['world_info_settings']
    for k,v in before.items():
        if k!='world_info' and after.get(k)!=v:errors.append('world scan setting changed: '+k)
    for k,v in before['world_info'].items():
        if k!='charLore' and after['world_info'].get(k)!=v:errors.append('global world setting changed: '+k)
    original_bindings=baseline.get('existingCharLore') or []
    for binding in original_bindings:
        if binding in after['world_info'].get('charLore',[]):continue
        current_binding=next((x for x in after['world_info'].get('charLore',[]) if x.get('name')==binding.get('name')),None)
        if binding.get('name')=='901 资源取得隔离验收 20261028' and current_binding=={'name':binding['name'],'extraBooks':config['books']}:
            configuration_changes.append({'field':'resource_fixture.extraBooks','before':binding,'current':current_binding,
                'scope':'资源线已授权六书联合长休验收，见其README联合验收段及joint-final.json；本轮仅复核，不回滚。'})
        else:errors.append('pre-existing character lore binding changed: '+str(binding.get('name')))
    for name in config['books']:
        original=name.removeprefix('W4_20261028_')
        current=read(HOME/'data/default-user/worlds'/(name+'.json'))
        expected_book=read(BASE/'import'/(original+'.json'))
        if current!=expected_book:errors.append('test book not restored: '+name)
    missing=sorted(set(cases)-set(selected))
    if require_complete and missing:errors.append('missing cases: '+', '.join(missing))
    result={'status':'fail' if errors else 'pending' if missing else 'pass_with_observed_changes' if configuration_changes else 'pass','cases':reports,'missing':missing,
      'errors':errors,'protectedFiles':len(baseline['files']),'unchangedFiles':len(baseline['files'])-changed_count,'concurrentChanges':concurrent_changes,'historicalRuns':len(runs)-len(selected),
      'configurationChanges':configuration_changes,
      'scope':config['scope'],'limits':['本检查核对实际宿主与请求证据，模型语义由主会话另行判读','当前宿主预算未改；没有以静态探针代替实际请求','未部署正式卡，未测试分类器／资源结算或全部主题的模型表现']}
    (OUT/'live-final.jsonl').write_text(data,encoding='utf-8')
    (OUT/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'status':result['status'],'cases':[(r['id'],r['status']) for r in reports],'missing':missing,'errors':errors,'protectedFiles':len(baseline['files'])},ensure_ascii=False,indent=2))
    return not errors

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--require-complete',action='store_true')
    raise SystemExit(0 if audit(parser.parse_args().require_complete) else 1)
