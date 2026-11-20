"""Create only a new play copy from the recovered, actually played narrative."""
import copy, json, shutil, sys, uuid
import lab

S = lab.L / 'formal-play-resume-20261106'
OLD = '901 分类恢复安装验收 20261106 - 原问话恢复'
CHAT = '901 帝都正式续玩 20261106'
SOURCE = lab.F / 'chats/901 分类恢复安装验收 20261106' / (OLD + '.jsonl')
TARGET = lab.F / 'chats' / lab.NAME / (CHAT + '.jsonl')
CARD = lab.F / 'characters' / (lab.NAME + '.png')

def rows(p):
    return [json.loads(x) for x in p.read_text(encoding='utf-8-sig').splitlines()]

def db(s):
    v=s['extension_settings']['__userscripts']['shujuku_v120__userscript_settings_v1']['shujuku_v120_profile_v1____default____settings']
    return json.loads(v) if isinstance(v,str) else v

def remap(x):
    if isinstance(x,dict): return {k:remap(v) for k,v in x.items()}
    if isinstance(x,list): return [remap(v) for v in x]
    if isinstance(x,str) and OLD in x: return x.replace(OLD,CHAT)
    return x

def prepare():
    assert not TARGET.exists() and not (S/'candidate.jsonl').exists()
    S.mkdir(parents=True,exist_ok=True)
    lab.put(S/'protected-before.json',lab.snapshot())
    shutil.copy2(lab.F/'settings.json',S/'settings.before.json')
    shutil.copy2(CARD,S/'card.before.png')
    shutil.copy2(SOURCE,S/'source.before.jsonl')
    settings=json.loads((S/'settings.before.json').read_text(encoding='utf8'))
    assert db(settings)['autoUpdateEnabled'] is False
    original=rows(SOURCE); a=remap(copy.deepcopy(original))
    assert len(a)==8
    a[0]['character_name']=lab.NAME
    m=a[0]['chat_metadata'];m['integrity']=str(uuid.uuid4())
    m.pop('diagnostic_chain_recovery',None)
    m['901_play_resume']={'sourceChat':OLD,'sourceSha256':lab.sha(SOURCE),
        'currentScene':'帝都城内街市','newActionsExecuted':0,
        'playerDecision':'2026-11-06：弃风剑随身收起，当前没有持握武器',
        'reconciledFrom':'已恢复剧情第5楼玩家卸甲，第6楼黄泉接过包裹挂在自己马鞍并进入城内',
        'sharedSupplies':'沿用901_fresh_opening.initialPartySupplies；截至第6楼没有消费，不分配个人持有',
        'legacyDataRemoved':['世界','主角','队伍','任务','势力','NPC','检定','战斗']}
    m['note_prompt']+='\n\n本聊天续玩锚点（2026-11-06核对）：已通过城门，当前在帝都城内街市，在场同行为布莱特、黄泉。御临风已卸下帝国制式轻甲，甲与干粮用油布包好，包裹由黄泉接过并挂在黄泉的马鞍侧面；未穿戴，无该甲的护甲防御。玩家确认弃风剑随身收起，当前没有持握武器；未交代具体佩带位置。相偏折戒指沿用初始卡，不补存入物。共享钱药至此未消费，仍为全队银币10枚、疗伤药5份、培元丹5份，个人携带分配未定。当前没有战斗、伤势或新的资源消耗。此段为已发生事实的状态核对，不是新增行动；下一步由玩家决定。'
    for message in a[1:]:
        if not message.get('is_user'):message['name']=lab.NAME
        for v in message.get('variables',[]):
            for k in ('stat_data','display_data'):
                if '901_rules_poc' in v.get(k,{}):v[k]={'901_rules_poc':v[k]['901_rules_poc']}
            props=v.get('schema',{}).get('properties',{})
            if '901_rules_poc' in props:v['schema']['properties']={'901_rules_poc':props['901_rules_poc']}
            v.get('initialized_lorebooks',{}).pop('开拓者-失落之地V1.1-世界书',None)
    root=a[-1]['variables'][0]['stat_data']['901_rules_poc']
    assert root['revision']==0 and not root['operations'] and 'battle' not in root
    actor=root['actors']['player'];s=actor['state']
    assert s['health']['intact']==12 and s['resources']['流风']['current']==22 and not s['inventory']
    s['equipmentState']={'version':1,'managedSlots':['armor'],'source':'901_rules_source_library/content/RE/01_rules/04_附录/物品和装备位.md:144–269'}
    s['possessions']={'items':[
        {'id':'opening.imperial-light-armor','name':'帝国制式轻甲','aliases':['帝国制式盔甲','帝国制式铠甲','铠甲','盔甲','护甲'],
         'slot':'armor','armorClass':'light','armor':{'defense':3},'worn':False,'location':'huang-horse-saddle',
         'custody':'黄泉马鞍侧面的油布包裹','source':'御临风_初始卡_20261021.txt:86；opening_roster_p1_001_016.md:25,29；本聊天第5–6楼',
         'appearance':'饱经战损；未确认数值损坏'},
        {'id':'opening.qifeng','name':'弃风剑','aliases':['弃风','弃风长剑'],'slot':'weapon','location':'carried','held':False,
         'weapon':{'damage':6,'attackBonus':0,'blockBonus':0,'ap':2,'magic':2,'size':3,'defenseReduction':3,'skill':'白刃','sub':'长剑'},
         'source':'御临风_初始卡_20261021.txt:88–89；opening_roster_p1_001_016.md:8；2026-11-06用户确认随身收起未持握'}]}
    s.pop('equippedWeaponId',None)
    s['combatManeuvers']={'weaponUnavailable':True}
    actor['combatCarry']={'sheathed':True,'visibleArms':'弃风剑随身收起；当前没有持握武器。轻甲包裹位于黄泉马鞍侧面，未穿戴。'}
    a[-1]['variables'][0]['display_data']=copy.deepcopy(a[-1]['variables'][0]['stat_data'])
    assert [x['mes'] for x in a[1:]]==[x['mes'] for x in original[1:]]
    (S/'candidate.jsonl').write_text('\n'.join(json.dumps(x,ensure_ascii=False) for x in a)+'\n',encoding='utf8')
    lab.put(S/'plan.json',{'target':str(TARGET),'name':CHAT,'source':str(SOURCE),'sourceHash':lab.sha(SOURCE),
        'messages':7,'newPlayerActions':0,'note':'Current state reconciliation, no retrospective transaction or elapsed time invented.',
        'limitation':'Current stowed state is represented; no new draw/equip action was executed or tested.'})
    print(json.dumps({'prepared':str(TARGET),'messages':7,'sourceUnchanged':lab.sha(SOURCE)==lab.sha(S/'source.before.jsonl')},ensure_ascii=False))

def install():
    assert not TARGET.exists()
    assert lab.sha(SOURCE)==lab.sha(S/'source.before.jsonl')
    assert lab.sha(CARD)==lab.sha(S/'card.before.png')
    assert db(json.loads((lab.F/'settings.json').read_text(encoding='utf8')))['autoUpdateEnabled'] is False
    shutil.copy2(S/'candidate.jsonl',TARGET)
    lab.card_transform(CARD,lambda j:j.update(chat=CHAT))
    lab.put(S/'installed.json',{'target':str(TARGET),'sha256':lab.sha(TARGET),'cardSha256':lab.sha(CARD)})
    print('Installed new chat and updated only formal card current-chat pointer.')

if __name__=='__main__':globals()[sys.argv[1]]()
