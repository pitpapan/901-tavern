"""Build the derived F4 import pack from explicit, editable projections.
Never writes F1/F2, research sources, installed SillyTavern settings or canonical files.
"""
import argparse, hashlib, json, re, zipfile
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
REVIEW=ROOT/'output/replay_f_review/v1'
MAPS=ROOT/'work/replay_research/f4_drafts'
OUT=ROOT/'output/replay_tavern/v1'
BOOK='901_帝都重玩_T0_v1'

def read_json(path): return json.loads(path.read_text(encoding='utf-8-sig'))
def read_rows(path): return [json.loads(x) for x in path.read_text(encoding='utf-8-sig').splitlines() if x.strip()]
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def stable_uid(key): return int(hashlib.sha256(key.encode()).hexdigest()[:7],16)
def save(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    text=json.dumps(value,ensure_ascii=False,indent=2) if not isinstance(value,str) else value
    path.write_text(text.rstrip()+'\n',encoding='utf-8')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--replace-generated',action='store_true',help='Regenerate only files owned by this exporter; edit projections, not generated files.')
    args=parser.parse_args()
    if OUT.exists() and any(OUT.iterdir()) and not args.replace_generated:
        raise SystemExit('Output already exists. Edit the projection inputs, then explicitly use --replace-generated; do not overwrite hand edits accidentally.')
    world_path=REVIEW/'worldbook_source.jsonl'; npc_path=REVIEW/'characters/runtime_cards.jsonl'
    worlds={x['id']:(i,x) for i,x in enumerate(read_rows(world_path),1)}
    npcs={x['entity_id']:(i,x) for i,x in enumerate(read_rows(npc_path),1)}
    wm=read_json(MAPS/'worldbook_projection.json'); nm=read_json(MAPS/'npc_projection.json')
    world_maps=wm['entries']; npc_maps=nm['entries']
    if {x['id'] for x in world_maps}!=set(worlds): raise ValueError('F1 projection coverage does not match source IDs')
    if {x['entity_id'] for x in npc_maps}!=set(npcs): raise ValueError('F2 projection coverage does not match source IDs')
    entries=[]; provenance=[]; omitted=[]
    def add(key,name,content,keys,constant,disabled,order,source_file,line,why):
        if not content.strip(): raise ValueError('Empty runtime content: '+key)
        if any(len(k.strip())<2 for k in keys): raise ValueError('Unsafe short key: '+key)
        uid=stable_uid(key)
        ext={'position':1,'exclude_recursion':True,'prevent_recursion':True,'delay_until_recursion':False,'probability':100,'useProbability':True,'scan_depth':4,'case_sensitive':False,'match_whole_words':False,'vectorized':False,'sticky':0,'cooldown':0,'delay':0,'ignore_budget':False,'match_persona_description':False,'match_character_description':False,'match_character_personality':False,'match_character_depth_prompt':False,'match_scenario':False,'match_creator_notes':False,'901_replay':{'source_id':key,'source_file':source_file,'source_line':line}}
        entries.append({'id':uid,'keys':keys,'secondary_keys':[],'comment':('【手动启用】' if disabled else '')+name,'content':content,'constant':constant,'selective':False,'insertion_order':order,'enabled':not disabled,'position':'after_char','case_sensitive':False,'extensions':ext})
        provenance.append({'uid':uid,'source_id':key,'name':name,'source_file':source_file,'source_line':line,'projection_reason':why})
    for m in world_maps:
        line,source=worlds[m['id']]
        if m['disposition'] not in ('core','keyword','manual'):
            omitted.append({'source_id':m['id'],'name':source['name'],'reason':m['reason'],'source_file':str(world_path.relative_to(ROOT)).replace('\\','/'),'source_line':line})
            continue
        add(m['id'],source['name'],m.get('runtime_content') or source['content'],m.get('keys',source['keys']),m['disposition'] in ('core','manual'),m['disposition']=='manual',300 if m['disposition']=='core' else 100,'output/replay_f_review/v1/worldbook_source.jsonl',line,m['reason'])
    for m in npc_maps:
        line,source=npcs[m['entity_id']]
        if m['disposition'] not in ('on_scene','keyword','manual'):
            omitted.append({'source_id':m['entity_id'],'name':source['name'],'reason':m['reason'],'source_file':'output/replay_f_review/v1/characters/runtime_cards.jsonl','source_line':line})
            continue
        add(m['entity_id'],'人物·'+source['name'],m['runtime_content'],m['keys'],m['disposition'] in ('on_scene','manual'),m['disposition']=='manual',250 if m['disposition']=='on_scene' else 200,'output/replay_f_review/v1/characters/runtime_cards.jsonl',line,m['reason'])
    if len({x['id'] for x in entries})!=len(entries): raise ValueError('UID collision')
    book={'name':BOOK,'description':'首次进入帝都的世界背景与人物片段；后续当前状态以聊天和摘要为准。','scan_depth':4,'token_budget':5000,'recursive_scanning':False,'extensions':{},'entries':entries}
    host=(REVIEW/'gm/host_rules.md').read_text(encoding='utf-8-sig').split('## 主持职责',1)[1].strip()
    # F3's specific NPC fatigue sentence is already preserved by its NPC entry.
    host=host.replace('黄泉的灵力负担沿用已确认的简化：需要灵力的技能使用过多会疲劳。','')
    host='你是本团主持，负责世界、NPC与行动后果。御临风由用户扮演。\n\n'+host
    scenario='开局基线：御临风、布莱特与黄泉抵达帝都附近，城门与城堡已可见，一行共两匹马。新推荐信提供了前往九雪医馆的线索；入城后的主动行动尚未选择。离村最后合计账目为10枚飘零银币、疗伤药5份、培元丹5份；经历多日旅途后，当前余额和药物消耗未知。后续地点、在场者、伤势与资源以本分支聊天和当前摘要更新，不把开局基线反复恢复。'
    greeting='帝都的城门与城堡已在眼前。\n\n御临风、布莱特与黄泉一起抵达城外，一行共两匹马。村医给出的新推荐信，是前往九雪医馆的线索；边关的消息，也等待着你决定如何处理。\n\n入都后的第一步，尚未作出选择。'
    card={'spec':'chara_card_v2','spec_version':'2.0','data':{'name':'901·飘零大陆主持','description':host,'personality':'以人物各自的性格、职责、所知和资源作出反应；保持中文叙述与对白自然。','scenario':scenario,'first_mes':greeting,'mes_example':'','creator_notes':'F4 v1，适配本地SillyTavern 1.19.0。请导入内嵌世界书并关联本卡；不再同时启用同内容独立世界书。御临风使用配套Persona。来源、待核时期与使用方法见包内README。用户已提供首轮试跑；本轮修订尚未复跑。','system_prompt':'','post_history_instructions':'','alternate_greetings':[],'tags':['901','TRPG','帝都开局'],'creator':'901资料整理','character_version':'F4-v1','extensions':{'world':BOOK,'talkativeness':0.5,'depth_prompt':{'prompt':'','depth':4,'role':'system'}},'character_book':book}}
    save(OUT/'import/901_帝都主持.card.json',card)
    native={'entries':{}}
    for e in entries:
        x=e['extensions']
        native['entries'][str(e['id'])]={'uid':e['id'],'key':e['keys'],'keysecondary':[],'comment':e['comment'],'content':e['content'],'constant':e['constant'],'selective':False,'selectiveLogic':0,'order':e['insertion_order'],'position':1,'disable':not e['enabled'],'addMemo':True,'scanDepth':4,'caseSensitive':False,'matchWholeWords':False,'excludeRecursion':True,'preventRecursion':True,'delayUntilRecursion':False,'probability':100,'useProbability':True,'vectorized':False,'ignoreBudget':False,'matchPersonaDescription':False,'matchCharacterDescription':False,'matchCharacterPersonality':False,'matchCharacterDepthPrompt':False,'matchScenario':False,'matchCreatorNotes':False,'sticky':0,'cooldown':0,'delay':0,'extensions':x}
    save(OUT/('optional/'+BOOK+'.json'),native)

    persona_source=REVIEW/'persona/yulinfeng_persona.json'; persona=read_json(persona_source); avatar='901-yulinfeng-t0-v1.png'
    save(OUT/'import/901_御临风.persona.json',{'personas':{avatar:persona['name']},'persona_descriptions':{avatar:{'description':persona['persona_text'],'position':0,'depth':2,'role':0,'lorebook':'','connections':[],'title':'901 帝都开局'}},'default_persona':None})
    save(OUT/'texts/御临风_Persona.txt',persona['persona_text'])
    save(OUT/'texts/主持提示.txt',host)
    prompt=(REVIEW/'gm/summary_prompt.md').read_text(encoding='utf-8-sig').split('## 可用提示正文',1)[1].split('## 使用说明',1)[0].strip()
    prompt+='\n\n以约{{words}}词为篇幅目标；优先保留当前局势、关键经历与未决事项，不为凑字数补写事实。'
    save(OUT/'texts/摘要提示.txt',prompt)
    opening='开局：三人抵达帝都附近，尚未选择入城后的主动行动；日期未给出。同行者为御临风、布莱特、黄泉，共两匹马。\n御临风可以报告边关失守，但更深的封锁记忆不能自动恢复。村医给了新的推荐信，可据此寻找九雪医馆；尚未报信、拜访或取得接待。\n最后离村合计账目为10枚飘零银币、疗伤药5份、培元丹5份；随后有多日旅程，当前余额、途中用药和保管人未明。两匹马是已确认交通。\n御临风不会骑马，本次旅途与布莱特共骑；入城前节点成长已按记录保留；布莱特失明，黄泉已醒来同行。既有伤病经历保留，不凭空补满生命、灵力或体力。黄泉大量使用需要灵力的技能会疲劳。\n本分支尚无新的承诺、信息传递或任务结果。'
    save(OUT/'texts/开局摘要.txt',opening)
    settings={'kind':'reference_only_partial_settings_not_an_import_preset','target_version':'SillyTavern 1.19.0','apply_via':'UI；不要用本文件覆盖settings.json','world_info_settings':{'world_info_depth':4,'world_info_min_activations':0,'world_info_recursive':False,'world_info_max_recursion_steps':1,'world_info_match_whole_words':False,'world_info_include_names':False,'world_info_budget':20,'world_info_budget_cap':5000,'world_info_overflow_alert':True},'extension_settings':{'memory':{'source':'main','memoryFrozen':True,'promptInterval':0,'promptForceWords':0,'prompt_builder':1,'SkipWIAN':True,'scan':False,'position':0,'role':0,'depth':2,'promptWords':600,'prompt':prompt,'template':'[本分支已发生事实与现状\n{{summary}}]','overrideResponseLength':0,'maxMessagesPerRequest':0}},'model':'未选定，沿用用户后续选择的模型及其实际可用窗口，不写API密钥或采样预设'}
    save(OUT/'author/settings_reference.json',settings)
    save(OUT/'author/entry_sources.json',{'entry_sources':provenance,'omitted':omitted,'world_projection_notes':{k:v for k,v in wm.items() if k!='entries'},'npc_projection_notes':{k:v for k,v in nm.items() if k!='entries'}})
    constants=[x for x in entries if x['constant'] and x['enabled']]; manual=[x for x in entries if not x['enabled']]
    manifest={'id':'901-tavern-f4-v1','created_on':'2026-10-03','status':'revised_after_user_playtest_pending_manual_update_and_retest','tested_target_version':'1.19.0','source_review':'F3 accepted as basis to proceed by user; prior F1/F2 review limitations preserved','counts':{'F1_sources':len(world_maps),'F2_sources':len(npc_maps),'world_dispositions':dict(Counter(x['disposition'] for x in world_maps)),'npc_dispositions':dict(Counter(x['disposition'] for x in npc_maps)),'embedded_entries':len(entries),'enabled_constant':len(constants),'enabled_keyword':len([x for x in entries if x['enabled'] and not x['constant']]),'disabled_manual':len(manual)},'constant_entries':[x['comment'] for x in constants],'manual_entries':[x['comment'] for x in manual],'context_measurement':{'unit':'Unicode characters, NOT tokens','host_chars':len(host),'persona_chars':len(persona['persona_text']),'scenario_chars':len(scenario),'constant_lore_chars':sum(len(x['content']) for x in constants),'worldbook_budget_recommendation':'20% of configured context, cap 5000 tokens; actual token count and overflow checked in G'},'inputs':[{ 'path':str(f.relative_to(ROOT)).replace('\\','/'),'sha256':digest(f)} for f in [world_path,npc_path,persona_source,MAPS/'worldbook_projection.json',MAPS/'npc_projection.json',REVIEW/'gm/host_rules.md',REVIEW/'gm/summary_prompt.md']],'persona_reused_verbatim':True,'dream_only_material_exported':False,'future_Bright_ending_exported':False,'local_settings_changed':False,'model_request_sent':False,'portable_sources':'author/entry_sources.json','regenerate':'python scripts/export_replay_tavern.py --replace-generated; edit source projections first, never generated import files'}
    manifest['verification']={'passed':None,'status':'not_run_for_this_export','command':'node scripts/check_replay_tavern_format.mjs'}
    save(OUT/'manifest.json',manifest)
    save(OUT/'author/format_check.json',manifest['verification'])
    guide=(MAPS/'import_guide.md').read_text(encoding='utf-8')
    counts=manifest['counts']
    inventory=f"本版共有{len(entries)}条运行资料：{len(entries)-sum(x['disposition']!='author_only' for x in npc_maps)}条世界背景与机制、{sum(x['disposition']!='author_only' for x in npc_maps)}份人物片段。其中{counts['enabled_constant']}条常驻、{counts['enabled_keyword']}条关键词触发、{counts['disabled_manual']}条默认禁用供手动启用。未载入的完整档案继续保留在作者资料库。\n\n"
    save(OUT/'README.md',guide.replace('## 导入顺序',inventory+'## 导入顺序',1))
    save(OUT/'author/format_notes.md',(MAPS/'format_notes.md').read_text(encoding='utf-8'))
    rows=['# 暂不加载与后续扩展','','所有原档案保留；进入相应时期时再做当前分支投影。','','## 当前保留的问题','']
    for item in wm.get('review_items',[]): rows.append('- '+item['issue']+' '+item['handling'])
    rows+=['','## 人物去向','','| 人物 | 当前去向 | 原F2卡行 |','|---|---|---|']
    labels={'on_scene':'开局在场常驻','keyword':'关键词','manual':'默认禁用，场景相关时手动启用','author_only':'历史或时期未定，作者库保留'}
    for m in npc_maps: rows.append(f"| {m['name']} | {labels[m['disposition']]} | {m['source_card_line']} |")
    save(OUT/'author/coverage.md','\n'.join(rows))
    with zipfile.ZipFile(OUT.parent/'901_帝都重玩_F4_v1.zip','w',compression=zipfile.ZIP_DEFLATED) as z:
        for file in sorted(OUT.rglob('*')):
            if file.is_file(): z.write(file,Path('901_帝都重玩_F4_v1')/file.relative_to(OUT))
    print(json.dumps(manifest['counts'],ensure_ascii=False))

if __name__=='__main__': main()
