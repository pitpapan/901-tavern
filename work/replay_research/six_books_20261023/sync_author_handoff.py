"""Project the committed W handoff into the existing adopted-author input.

Only named adopted sections are selected. Candidate drafts and the special dream
are never opened. Run this before build_candidate.py --plan / --runtime.
"""
from pathlib import Path
import hashlib
import json
import re

STAGE = Path(__file__).resolve().parent
ROOT = STAGE.parents[2]
AUTHOR = 'work/replay_research/'
B = ['世界基础设定', '政治与势力', '人物资料库', '能力与战力', '历史与事件', '当前剧本与局势']
PATH = STAGE / 'adopted_author_delta.json'
BASE_KEYS = ['author-supply','author-education','author-currency','author-news','author-year',
             'author-culture','author-social-power','author-military','author-merchants',
             'author-outsiders','author-residence','author-huang','author-jiang']
existing = json.loads(PATH.read_text(encoding='utf-8'))
rows = {d['key']: d for d in existing if d['key'] in BASE_KEYS}
assert set(rows) == set(BASE_KEYS)

def selection(file, start, end=None, after=True):
    path=AUTHOR+file
    text=(ROOT/path).read_text(encoding='utf-8')
    anchor=text.index('## 2026-10-28')
    a=text.index(start,anchor)
    if after:a += len(start)
    if end is not None:b=text.index(end,a)
    else:
        m=re.search(r'\n(?:### |\*\*(?:新增：|\d))',text[a:])
        b=a+m.start() if m else len(text)
    body=text[a:b].strip()
    assert body,(file,start)
    segment={'path':path,'line':text.count('\n',0,a)+1,'end_line':text.count('\n',0,b)+1,
             'sha256':hashlib.sha256(body.encode()).hexdigest()}
    return body,segment

def heading(file,title):
    return selection(file,'### '+title+'\n')

def put(key,name,book,source,target=None,kind='concept',manual=False,keywords=None,mode='append',replacements=None):
    body,segment=source
    previous=rows.get(key,{})
    refs=list(previous.get('refs',[]))
    rf={'path':segment['path'],'line':segment['line']}
    if rf not in refs:refs.append(rf)
    rows[key]={'key':key,'name':name,'book':book,'entry_type':kind,'body':body,'refs':refs,
               'source_segments':[segment], 'target_uid':target if target is not None else previous.get('target_uid'),
               'keywords':keywords if keywords is not None else previous.get('keywords',[name]),
               'mode':mode,'manual':manual,'update_keywords':keywords is not None,
               'integration':'W_20261028','reason':'2026-10-28已采用作者内容汇合；原文／采用／知情与实际分支分别保留。'}
    if replacements:rows[key]['replacements']=replacements
    return rows[key]

def theme(file,title,book=0,keywords=None,manual=False,kind='concept',target=None,section=None,key=None):
    return put(key or 'w-20261028-'+title,title,B[book],heading(file,section or title+'：拟用正文'),
               target,kind,manual,keywords)

def with_body(source,body):return body,source[1]

pn=selection('information_consequences_reference_20261007.md','<!-- PN_W3_BODY_BEGIN -->','<!-- PN_W3_BODY_END -->')
put('author-news','帝国公共消息与民间见识',B[1],pn,keywords=['帝国公告','地方消息单','帝国通信','帝国公共消息与民间见识'])
yt=selection('capital_climate_festival.md','<!-- YT_W3_BODY_BEGIN -->','<!-- YT_W3_BODY_END -->')
put('author-year','飘零大陆共同节令与年度生活',B[0],yt,keywords=['飘零祭','帝国新年','帝国节令','飘零大陆共同节令与年度生活'])
cm=selection('divinity_belief_reference_20261007.md','帝国现行死者一律火化','\nW4：',after=False)
put('w-cm','帝国火化与纪念文化',B[0],cm,keywords=['帝国火化与纪念文化','帝国纪念文化'])
put('w-cremation-scope','帝都丧葬与死灵防范',B[0],with_body(cm,''),123513726,mode='edit',replacements=[{'old':'具体骨灰安置及礼俗仍未定','new':'具体家庭的骨灰安置选择与实际仪程未定'}])

life='everyday_life_reference_20261007.md'
for title,key,book in [('帝国力量与社会位置','author-social-power',1),('帝国共同文化与家庭生活','author-culture',0),
                       ('帝国邻里与私人交往','w-neighbors',0),('帝国日常纠纷与居民保护','w-disputes',1),
                       ('帝国乡土与返乡生活','w-hometown',0),('帝国民间文艺与游艺','w-arts',0),
                       ('帝国多族家庭与生命尺度','w-family',0),('帝国地方文化传播','w-culture-spread',0)]:
    text=(ROOT/(AUTHOR+life)).read_text(encoding='utf-8')
    label=next(l for l in text[text.index('## 2026-10-28'):].splitlines() if l.startswith('**') and title in l)
    put(key,title,B[book],selection(life,label+'\n'),keywords=[title])

education='language_education_reference_20261008.md'
put('author-education','帝国教育与知识传播',B[1],heading(education,'教育与知识传播正文增量（K01—06）'),178355077)
r=theme(education,'帝国学士与长期研习',1,['帝国学士与长期研习','帝国学士'])
r['body']=r['body'].replace('由后续UCL_20261019_019确认（人物CRC_128档原7—12）','此资格已经确认').replace('LB01：','')
currency=selection('economy_currency_working_draft_20261015.md','飘零币可以有多面值','\nW4：',after=False)
put('author-currency','飘零币',B[0],currency,181263738)

central='town_operations_reference_20261008.md'
put('author-supply','帝都腹地供给与公费农作施术',B[0],heading(central,'帝都腹地供给与公费农作施术：拟用正文'),keywords=['帝国腹地','公费农作施术','帝都腹地供给与公费农作施术','帝都腹地供给'])
theme(central,'帝都',target=99699950,kind='location',section='帝都地点的CTR增量',key='w-capital-local')

lotin='lotin_river_valley_working_draft_20261012.md'
theme(lotin,'洛汀',target=25657482,kind='location',section='洛汀正文增量',key='w-lotin-local')
theme(lotin,'洛汀岩地矿料与工艺',keywords=['洛汀岩地矿料与工艺','韧纹铁','导流晶','蓄魔晶','暖脉石'])
theme(lotin,'矮人传承据点与地下生活')
theme(lotin,'东部矿段与社群资产经营',1)
jinhui='jinhui_hills_working_draft_20261012.md'
r=theme(jinhui,'烬辉城',target=59071557,kind='location',section='烬辉城正文增量',key='w-jinhui-local')
r['replacements']=[{'old':'具体矿产、从业种族、器物供应与路程未定','new':'具体矿段坐标、产量、当次库存与路程未定'}]
theme(jinhui,'烬辉城器物制作与专业采购',keywords=['烬辉城器物制作与专业采购','烬辉器物'])
material=heading(jinhui,'工坊220721456的材料说明增量')
public=material[0].split('JM原348—354')[0].strip()
put('w-magic-core','帝国工坊与魔导器具',B[0],with_body(material,public),220721456)
put('w-material-testimony','原线魔导材料辨认与弃风修复证言',B[5],material,manual=True)
fengmen='fengmen_foothills_working_draft_20261012.md'
theme(fengmen,'风门城',target=42513235,kind='location',section='风门城正文增量',key='w-fengmen-local')
theme(fengmen,'风门山前魔法生态',keywords=['风门山前魔法生态','响穗草','岩蹄驮羊'])
theme(fengmen,'风门军械与军需往来',1,['风门军械与军需往来','风门军需'])
baimu='baimu_northern_margin_working_draft_20261012.md'
theme(baimu,'白暮城',target=175579823,kind='location',section='白暮地点正文增量',key='w-baimu-local')
theme(baimu,'白暮寒地魔法生态',keywords=['白暮寒地魔法生态','霜芽芜','雪绒羊','雪灯苔','雪针杉','辉鳞鳟','寒辉'])
shore=heading(baimu,'北地冰潮海岸与野生动物：拟用正文')
public,secret=shore[0].split('古北方文明覆亡',1)
put('w-northern-coast','北地冰潮海岸与野生动物',B[0],with_body(shore,public.strip()),keywords=['北地冰潮海岸与野生动物','雪脊鹿','霜羽鸮','潮息海豹','潮丝藻'])
put('w-northern-history','北地海岸古史与泰蕾斯证言',B[4],with_body(shore,'古北方文明覆亡'+secret),manual=True)
theme(baimu,'白暮寒地材料与器材',keywords=['白暮寒地材料与器材','霜脂条','寒辉观测夹','潮丝衬','潮岸采集盒','寒辉夹携匣','净制衬湿作携盒','外出回访箱','专业采集匣'])
theme(baimu,'北地高等精灵家族生活',1)
silver='silvermoon_high_elf_city_working_draft_20261015.md'
theme(silver,'银月城',kind='location',keywords=['银月城'])
theme(silver,'银月城家族传承与外派学习',1,['银月城家族传承与外派学习','银月城外派研习'])
theme(silver,'高等精灵家传古史与知情边界',4,manual=True)
west='fossarolen_western_hinterland_working_draft_20261012.md'
theme(west,'佛萨罗伦',target=46857000,kind='location',section='佛萨罗伦正文增量',key='w-fossarolen-local')
theme(west,'远西林湖手艺城市',kind='location',keywords=['远西林湖手艺城市','远西林湖城市','露光莓'])
theme(west,'远西世界树及共同照护',keywords=['远西世界树','远西的世界树','远西世界树及共同照护'])
theme(west,'远西魔法林材与特殊木材',keywords=['远西魔法林材与特殊木材','灵纹木','月露丝','护纹树脂','暗木','Darkwood','青铜木','Bronzewood','密木','Densewood','活木','Livewood','翔木','Soarwood'])
for title in ['远西与佛萨罗伦物资知识往来','远西多族长寿生活与传艺','远西工坊合作与日常采购']:
    theme(west,title)
theme(west,'通常自然寿命与延寿',keywords=['通常自然寿命与延寿','通常自然寿命'])
supply=heading(west,'远西林材供料与缺料调整：拟用正文')
normal,conditional=supply[0].split('若发生缺料，',1)
shortage,recovery=conditional.split('恢复供料时',1)
put('w-west-supply','远西林材供料与缺料调整',B[0],with_body(supply,normal.strip()))
put('w-west-shortage','远西林材缺料时的调整',B[5],with_body(supply,'若发生缺料，'+shortage.strip()),manual=True)
put('w-west-recovery','远西林材恢复供料后的安排',B[5],with_body(supply,'恢复供料时'+recovery.strip()),manual=True)

wilderness='settlements_wilderness_working_draft_20261015.md'
theme(wilderness,'帝国聚居地与荒野交往',section='帝国聚居地与荒野交往')
theme(wilderness,'山脉魔兽社会与权力更替',1,section='山脉魔兽社会与权力更替')
coalition=heading(wilderness,'联军与议事条目增量')
paras=coalition[0].split('\n\n')
put('w-coalition','魔兽联军',B[1],with_body(coalition,paras[0]),29005377)
put('w-coalition-secrets','魔兽联军内部目标与后来证言',B[5],with_body(coalition,paras[1]),manual=True)
military='empire_military_strength_20261007.md'
put('author-military','帝国军力与粮储基线',B[1],heading(military,'军衔职务增量'),1399227248,keywords=['帝国军力与粮储基线','帝国军力','帝国粮储'])
theme(military,'帝国军区与部队协作',1,['帝国军区与部队协作','帝国军区'])
theme(military,'帝国军队训练与轮换',1,['帝国军队训练与轮换','帝国军队轮换'])
operations='empire_operations_consolidated.md'
theme(operations,'帝国制度受理补充',1,target=1665297008,section='制度1665297008增补正文',key='w-institutions')
for title in ['帝都军情秘密查证条件','帝都证人与临时保护','悠悠诅咒辨认与转送条件','帝都灾变后的救援与消息','帝都案件善后与英雄生活']:
    theme(operations,title,5,manual=True)
orders=heading(operations,'军令98226191通用增补及行动窗口正文')
plain,window=orders[0].split('06《帝都行动窗口与军令变更》仅在当前分支实际决策时启用：',1)
put('w-command-knowledge','帝国军令与情报渠道',B[1],with_body(orders,plain.strip()),98226191)
put('w-command-window','帝都行动窗口与军令变更',B[5],with_body(orders,window),manual=True)
services='town_services_working_draft_20261007.md'
theme(services,'宝石翁塔下小镇',kind='location',keywords=['宝石翁塔下小镇','宝石翁小镇','塔镇'],section='W3：宝石翁塔下小镇拟用正文')
service=heading(services,'W3：医疗与接待条目增量')
medical,reception=service[0].split('\n\n佛萨46857000的证据附注：',1)
put('w-clinic-service','帝国医疗机构',B[0],with_body(service,medical.removeprefix('医疗20859222：')),20859222)
put('w-fossarolen-reception','佛萨罗伦',B[0],with_body(service,reception),46857000)
org=selection('organization_options_20261008.md','组织正文增量：','\nW4：')
orgbody,outsider=org[0].split('\n\n来客1487215806补充：',1)
for key,title,body,target in [('author-merchants','帝国商运组织类型',orgbody,None),('author-outsiders','帝国异界来客处境',outsider,None)]:
    base=rows[key]['body'].split('\n\n')[0]
    put(key,title,B[1],with_body(org,base+'\n\n'+body),target)
faction=selection('faction_operations_dossier.md','欧吉尔德胸部红宝石转移','\nW4：',after=False)
r=put('w-white-network','白魔后来协作关系证据',B[5],faction,manual=True)
r['body']=r['body'].replace('由人物CRC_020与UCL_20261015_037—039承接，','')
sword=selection('power_rules_dossier.md','弃风是本轮定点补齐项','\nW4：',after=False)
put('w-sword-secret','弃风隐藏灵性与重铸条件',B[5],with_body(sword,'弃风按新初始卡为六级；隐藏灵性已存在。重铸后自护、旧新风元素冲突与可能回应是采用方向，不能把可能写成已唤醒人格、已学会对话或固定触发参数。御临风、逸冷、托尔金不因物品名直接知道。持有、实际重铸、回应及知情分别记录。'),manual=True)

# Character subjects: stable identity is automatic; later evidence and private
# author relationships have separate manual records, never a shared name key.
people='world_character_followup_20261007.md'
profiles='output/replay_f_review/v1/characters/profiles/'
character_specs=[
 ('沐透','CRC_004.md',108,'御临风旧世界的网友；此界为法师，重视自由、助人与成为有用之人。原团末段御临风仍不知道他的到来及此界身份，不能自动相认。',['沐透']),
 ('卡珊德拉','CRC_021.md',91,'具有自主意志的Phantom主体，对自己的控制和残酷选择负有责任，不能写成没有意志的空壳。与白魔及沐透的具体联系和私人目标另按实际知情。',['卡珊德拉']),
 ('安兹','CRC_012.md',94,'纳萨力克地下大坟墓的主人，珍惜公会同伴留下的家园与拥有自己意志的部下。与帝国的实际接触、调查和立场按当期，不默认归顺或征服；未收到部下报告的现场消息不知。',['安兹','安兹·乌尔·恭']),
 ('阿尔托莉雅·潘德拉贡','artoria_lancer.md',1,None,['阿尔托莉雅','阿尔托莉雅·潘德拉贡']),
 ('影魔','CRC_097.md',79,'居于沐透戒指中的自主住客，与沐透有限互利。需要恢复、休息与自由，不是无限法力或必胜救援保险；失去回应不能自动判死亡或已恢复。',['影魔']),
 ('美杜莎','CRC_122.md',80,'白魔侧的Phantom合作者／部属，对自己选择的行为有责任。实际职务与合作范围另定，不因此有正式副手头衔、恋爱关系、Gate识别能力或完整计划知识。',['美杜莎']),
 ('七理夜','CRC_126.md',86,None,['七理夜']),
 ('赫伯特','CRC_067.md',81,None,['赫伯特']),
 ('诺顿','CRC_068.md',79,'死亡之翼的追随者，能亲切应对而仍狠辣，不能据礼貌判断安全。与南希合作不意味着共享全部秘密；加入时间及具体承诺未定。',['诺顿']),
 ('南希','CRC_069.md',81,'幽影龙王，自愿跟随死亡之翼；与诺顿有合作关系，不自动是恋人、上下级或共享全部秘密。龙族同类身份不保证保护悠悠，实际行动依当期。',['南希']),
 ('崔斯坦','tristan.md',1,'雷光直属第一大队第一小队的红发军官，自称悲伤之子，爱好琴艺，与高文及女队长同属实际编组。军职之外有音乐和私人生活，不自动导入原型完整履历、预言知识或死亡结果。',['崔斯坦']),
 ('奥斯卡贝','CRC_052.md',80,None,['奥斯卡贝']),
 ('泰蕾斯','CRC_053.md',80,'古代有预言能力的白龙，历史上已经死亡。死后留存、后来消散与具体人物所知分别记录，不是T0活跃官员或随叫随到的顾问；其古史说明保留证言性质。',['泰蕾斯']),
 ('死亡之翼','CRC_019.md',91,'古代被封印的强大存在，原团后来苏醒须保留时期，不因条目加载自动在T0苏醒。其与白魔、追随者的关系按真实阶段，不能直接导入原型世界史和能力。',['死亡之翼']),
]

def character(name,source,public=None,keywords=None,profile=None,line=1):
    body=source[0] if public is None else public
    body=re.sub(r'UCL_\d{8}_\d{3}(?:／\d{3})?(?:已采用|采用|确认)?','',body)
    r=put('w-person-'+name,'人物·'+name,B[2],with_body(source,body),kind='character',keywords=keywords or [name])
    if profile:r['refs'].append({'path':profiles+profile,'line':line})
    if public is not None and public != source[0]:
        private=put('w-person-detail-'+name,name+'的分期与私密关系',B[5],with_body(source,source[0]),manual=True)
        if profile:private['refs'].append({'path':profiles+profile,'line':line})
    return r

for name,profile,line,public,keys in character_specs:
    label=name if name!='阿尔托莉雅·潘德拉贡' else name
    src=selection(people,'**'+label+'。**',after=True)
    # Stop at the next bold subject (the generic section selector stops at ###).
    src=with_body(src,src[0].split('\n\n**')[0])
    character(name,src,public,keys,profile,line)

white=heading(people,'白魔90804397定点修订')
put('w-white-private','白魔私人目标',B[5],white,manual=True)
put('w-white-public','人物·白色魔法使',B[2],with_body(white,''),90804397,mode='edit',replacements=[{'old':'未知的最终目标保持空白','new':'私人目标按已采用作者私密段处理，未获告者不自动知晓；完整终局方案仍未定'}])

def table_source(marker,cell=1):
    full=(ROOT/(AUTHOR+people)).read_text(encoding='utf-8')
    lines=full.splitlines()
    matches=[(i,l) for i,l in enumerate(lines) if l.startswith('| '+marker)]
    assert len(matches)==1,(marker,len(matches))
    i,line=matches[0]
    body=line.strip().strip('|').split('|')[cell].strip()
    return body,{'path':AUTHOR+people,'line':i+1,'end_line':i+1,'sha256':hashlib.sha256(body.encode()).hexdigest()}

thin=[
 ('阿伊达','阿伊达 CRC_102','CRC_102.md',13,'退隐育子的传奇流浪士兵、佣兵，维尔之父，曾为儿子求治。后来的合作、入会与留城意向另按原线分期。'),
 ('维尔','维尔 CRC_103','CRC_103.md',13,'阿伊达之子、考古学徒。异常睡眠、Faer、检查和插班经历属各自原线阶段，不初始化为当前身体、装备或学籍。'),
 ('沐透线研究所博士','博士 CRC_104','CRC_104.md',13,'研究所博士，同场拉塞尔／塞拉尔／赛博尔为来源异写。与CRC061仅疑似对应，不自动合并；研究计划不等于成果。'),
 ('霞','霞 CRC_105','CRC_105.md',13,'雷光直属第一大队第二小队队长，其专队处理白魔，与副队洛协作。救援沐透、宣布招募和后来领牌分别按实际阶段，邀请不等于入队。'),
 ('洛','洛 CRC_106','CRC_106.md',13,'霞的副队，其对白魔专队归雷光。军籍核查、救护、邀请与资助送俘安排按实际阶段，不是所有来客自动享有的权益。'),
 ('劳霖','劳霖 CRC_107','CRC_107.md',13,'自称边关步兵第九大队士兵，奉霞洛命令协查。旧友问候需实际转达，不能直接完成与御临风重逢。'),
 ('王骑','王骑 CRC_108','CRC_108.md',13,'自报直属第一大队大队长之一。实际受理报告、批准暂住或承诺委托按当期；承诺不等于文书已送或研发成功。'),
 ('埃弗纳斯','埃弗纳斯 CRC_116','CRC_116.md',13,'科普卢村灾幸存者，称艾鲁尔为养父，萨米尔和珊蒂斯为好友。后来的墓地任务、受胁外行和未回报告分期，不自动形成当前部署或安兹知情。'),
 ('雅儿贝德','雅儿贝德 CRC_117','CRC_117.md',13,None),
 ('迪米乌哥斯','迪米乌哥斯 CRC_118','CRC_118.md',13,'自报纳萨力克第七阶层守护者、恶魔，安兹部下。与亚乌菈、雅儿贝德的实际协作和情报取得按参与及收报，不共享全墓地知识。'),
 ('亚乌菈','亚乌菈 CRC_119','CRC_119.md',13,'自报纳萨力克第六阶层守护者，主持确认纯正黑暗精灵；不同于远西本土暗夜精灵。实际接待、交付与推荐教学各有时期，不自动建立师生关系。'),
 ('皮奇','皮奇 CRC_120','CRC_120.md',13,None),
 ('穗乃香','穗乃香 CRC_127','CRC_127.md',92,None),
 ('猫音','猫音 CRC_128','CRC_128.md',7,None),
 ('时房','时房 CRC_129','CRC_129.md',13,None),
 ('索扬肯库尔','索扬肯库尔 CRC_130','CRC_130.md',13,None),
]
for name,marker,profile,line,public in thin:
    keys=['队长霞'] if name=='霞' else ['副队洛'] if name=='洛' else [name]
    character(name,table_source(marker),public,keys,profile,line)

tail=[
 ('韩诺','韩诺，','CRC_064.md',9,'第八号当铺交易者，涉及付出代价的交易。具体旧事和接触渠道仅在相应阶段使用，不预设贞子复活或开放T0联络。'),
 ('逸冷','逸冷，','CRC_063.md',3,None),
 ('真达卡斯','真达卡斯，','CRC_056.md',7,None),
 ('陈萍生','陈萍生，','CRC_055.md',7,None),
 ('拉拉','拉拉，','CRC_010.md',248,None),
 ('莱恩哈特','莱恩哈特，','CRC_005.md',287,None),
 ('提妲·拉赛尔','提妲·拉赛尔，','CRC_005.md',289,None),
 ('菲利普','菲利普，','phillip.md',3,None),
 ('雪拉·扎德','雪拉·扎德，','scherazard.md',3,None),
 ('黑衣武士','黑衣武士，','black_clad_warrior.md',3,'原帖黑发佩刀护送者，与白衣武士搭档。不能与帝国宗近仅凭原型名字合并；实际护送与敌意另按分期和知情。'),
 ('白衣武士','白衣武士，','white_clad_warrior.md',3,'原帖白发护送者，与黑衣武士搭档。针对姜子尤的识别、攻击和动机只在相应阶段使用，不强制重演袭击。'),
 ('耶各','耶各，','CRC_022.md',7,'已确认是费伦耶各，古老死亡神祇与亡者记录者。身份确认不导入全部费伦宇宙，也不提供T0固定联络或无限降临。'),
 ('黄祸龙狼','黄祸龙狼，','CRC_050.md',5,'魔兽军相关人物，与姜子尤容貌完全相同的二重身。边关追杀属T0前史，二重身成因与双方知情未知；后来军务和联络须实际发生。'),
 ('雅儿','雅儿，','CRC_042.md',7,None),
 ('老村医','老村医，','CRC_043.md',7,None),
 ('阿胜','阿胜，','CRC_032.md',209,None),
 ('九雪医馆馆主','九雪医馆馆主，','jiuxue_clinic_owner.md',3,None),
 ('早期协会接待女性','早期协会接待女性，','early_guild_contact.md',3,None),
 ('黄翔','黄翔，','huang_xiang.md',3,None),
 ('魔法师A／巴力西卜','魔法师A／巴力西卜','CRC_058.md',7,'人类阶段为空的学生，曾以魔法协助探索；后来巴力西卜阶段另存，不前置转化，不与另一仅名A者合并。'),
]
for name,marker,profile,line,public in tail:
    keys={'提妲·拉赛尔':['提妲·拉赛尔','提妲','妮妲'],'雪拉·扎德':['雪拉·扎德','雪拉'],
          '魔法师A／巴力西卜':['空的学生魔法师A','巴力西卜']}.get(name,[name])
    character(name,table_source(marker),public,keys,profile,line)

# Existing UID additions. Huang's same adopted origin already exists in the
# original delta; do not duplicate it merely because the handoff also lists it.
for marker,uids in [('欧基191343370',[191343370,150498757]),('威廉158137443',[158137443]),
                    ('右近67432473',[67432473]),('艾利164655858',[164655858,81457414,57169755]),
                    ('布莱特68093225',[68093225]),('雪老131696829',[131696829]),
                    ('久远65601502',[65601502,36249732]),('托尔金138152911',[138152911]),
                    ('慕少艾243523446',[243523446]),('奥希拉265501363',[265501363])]:
    src=table_source(marker)
    # Source identifiers stay in metadata, not injected as pseudo-dialogue.
    body=re.sub(r'^UCL_[^。]+。','',src[0])
    for uid in uids:put('w-existing-'+str(uid),'现有人物采用补充',B[2],with_body(src,body),uid)
put('w-mu-contact','慕少艾日常接触范围',B[2],with_body(table_source('慕少艾243523446'),''),243523446,mode='edit',replacements=[{'old':'是否见到御临风取决于实际医疗场景','new':'是否见到御临风取决于实际医疗或日常接触场景'}])
kenda=table_source('肯达240530842')
for uid in [240530842,28975072]:put('w-kenda-family-'+str(uid),'肯达与本多父子关系',B[2],with_body(kenda,'肯达是本多之子；亲缘不等于双方共享全部私人计划和知情。'),uid)
put('w-kenda-private','肯达后期暗桩身份',B[5],with_body(kenda,'肯达在离都龙族接触阶段已为纳萨力克暗桩并参与暗杀御临风计划；加入日期未定，不强溯T0。谢尔伦、本多及御临风不自动知道，也不提前实施。'),manual=True)

for row in rows.values():
    assert row['body'] or row.get('replacements'),row['key']
    assert all((ROOT/r['path']).exists() for r in row['refs']),row['key']
    if row.get('manual'):row['keywords']=[]
PATH.write_text(json.dumps(list(rows.values()),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'author_operations':len(rows),'handoff_operations':sum(r.get('integration')=='W_20261028' for r in rows.values()),
                  'new_character_subjects':sum(r.get('entry_type')=='character' and not r.get('target_uid') for r in rows.values())},ensure_ascii=False))
