"""Plan, then project the reviewed native 008 lore into six native books.

No forge round trip, live installation, source mutation, or state initialization.
Run --plan, inspect 创作规划.yaml, then --export. JSON syntax is valid YAML 1.2.
"""
from pathlib import Path
import argparse, copy, hashlib, json, re, shutil, subprocess, sys
from collections import Counter

ROOT = Path(__file__).resolve().parents[3]
STAGE = Path(__file__).resolve().parent
OUT = ROOT / 'output/replay_tavern/six_books_20261023_candidate'
BASE = ROOT / 'output/replay_tavern/flow_guidance_20261018_candidate/import/901_主持体验补充_M1_20261018.json'
CARD = ROOT / 'output/replay_tavern/opening_combat_20261022_candidate/import/901_帝都初始卡.card.json'
REV = 'SIX_BOOKS_20261023_001'
BOOKS = ['世界基础设定', '政治与势力', '人物资料库', '能力与战力', '历史与事件', '当前剧本与局势']
FILENAMES = {b: f'901_{i+1:02d}_{b}_20261023' for i,b in enumerate(BOOKS)}
ORDER = dict(zip(BOOKS, [100,120,200,180,80,240]))
STATE_RULE = 'T0仅为首次入都的时期基线；实际保留分支的后续事件与当前记录优先。加载不初始化到场、知情、伤势、物品、部署或成果。'
SCENE_RULE = '条件式主持资料：仅在当前分支实际进入相应情境、主持启用后取用；以下方案不是已发生事件，不保证任何选择或结果。'

def read(p): return json.loads(p.read_text(encoding='utf-8'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p, data):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(data.rstrip()+'\n', encoding='utf-8', newline='\r\n' if p.exists() and b'\r\n' in p.read_bytes() else '\n')
def dump(p, data): write(p, json.dumps(data, ensure_ascii=False, indent=2))
def ref(path, line=1): return {'path':path, 'line':line}

original = list(read(BASE)['entries'].values())
inventory = read(ROOT/'work/replay_research/worldbook_inventory_20261023/inventory.json')
assert sha(BASE) == inventory['base_sha256']
assert len(original) == 136
sources = {i+1:e for i,e in enumerate(original)}
units = {n:e['content'].split('\n\n') for n,e in sources.items()}
# Combat templates use one line per semantic unit in the native baseline.
for n in range(131,137): units[n] = sources[n]['content'].split('\n')
used = Counter()
records = {}
adopted = {
    'population':ref('work/replay_research/population_settlements_reference_20261007.md',3),
    'religion':ref('work/replay_research/divinity_belief_reference_20261007.md',38),
    'sword':ref('work/replay_research/opening_roster_p1_001_016.md',8),
    'residency':ref('work/replay_research/user_clarifications.md',4636),
    'library':ref('work/replay_research/language_education_reference_20261008.md',441),
}

def infer_type(n):
    if 83 <= n <= 120 or n in (122,136): return 'character'
    if n == 1: return 'world'
    b = inventory['entries'][n-1]['primary_book']
    if b == '历史与事件': return 'event'
    if b == '政治与势力': return 'faction' if n in [5,6,7,8,9,11,14,16,17,18,48,62,70,71,82] else 'concept'
    if n in [3,4,15,19,20,21,22,23,24,25,26,27,28,29,63,73,126,127,128,129,130]: return 'location'
    return 'concept'

def add(key, name, book, parent, entry_type=None, keys=None, manual=False):
    native = copy.deepcopy(sources[parent])
    uid = native['uid'] if isinstance(key,int) else 1_000_000_000 + int(hashlib.sha256(key.encode()).hexdigest()[:8],16)%1_000_000_000
    assert uid not in [x['uid'] for x in records.values()]
    native.update(uid=uid, comment=name, constant=False, order=ORDER.get(book,301))
    if keys is not None: native['key'] = keys
    if manual: native.update(disable=True, constant=True, key=[])
    records[key] = {'uid':uid,'name':name,'book':book,'type':entry_type or infer_type(parent),
                    'parent':parent,'native':native,'pieces':[],'source_units':[], 'extra_refs':[], 'revisions':[]}
    return key

for n,e in sources.items():
    b = inventory['entries'][n-1]['primary_book']
    if n == 123: b = '主持卡'
    add(n,e['comment'],b,n)
    # Preserve all nine original manual gates; only the two small world summaries remain always on.
    records[n]['native']['constant'] = e['constant'] if e['disable'] or n in (1,2) else False
    if n in (1,2): records[n]['native']['order']=300

def take(dest, n, inds=None, replace=None, why=None, refs=()):
    if inds is None: inds = range(len(units[n]))
    inds=list(inds)
    text='\n\n'.join(units[n][i] for i in inds)
    if replace is not None:
        text = replace
        records[dest]['revisions'].append({'source':n,'units':inds,'reason':why})
    if text.strip(): records[dest]['pieces'].append(text)
    for i in inds:
        used[(n,i)]+=1
        records[dest]['source_units'].append({'index':n,'uid':sources[n]['uid'],'unit':i,'mode':'revised' if replace is not None else 'verbatim'})
    records[dest]['extra_refs'].extend(refs)

def extra(dest,text,refs=()):
    records[dest]['pieces'].append(text)
    records[dest]['extra_refs'].extend(refs)

def split(key,name,book,parent,inds,keys=None,manual=False,entry_type=None):
    add(key,name,book,parent,entry_type,keys,manual)
    take(key,parent,inds)
    return key

# Geographic identity, travel baseline and dated war context.
split('roads','破关后的道路与通行基线',BOOKS[5],3,[1,4],['飘零大陆','边境关卡','风门城'])
take(3,3,[0,2,3,5,6,7,8])

# Empire: long-lived institutions, population/services, mobilization and secret knowledge.
take(5,5,[0],units[5][0].replace('具体供奉对象及祈福是否产生超自然效果未定。','帝国不供奉任何神明；既有圣庙、祭火与公共祈福保留，祈福是否产生超自然效果未定。'),
     '承接10/15确认的无神明供奉；不取消既有建筑、仪式或私人信念。',[adopted['religion']])
take(5,5,[1,2,3])
split('population','帝国人口与聚落规模',BOOKS[0],5,[],['帝国','帝都','佛萨罗伦','宝石翁'])
take('population',5,[4], 'T0前后帝国总人口约二十亿，包含各族，乡村人口占多数。帝都数百万级已属极少见的城市规模极限；佛萨罗伦为几十万人级。其他区域重点城市不再统一套用近百万至三百万口径，精确人数未定。广阔疆域中的村庄、小镇与中型城镇支撑总人口；五座已命名重点城市不是全国完整名册。宝石翁塔镇至多几百人，不能推广为全国小镇上限。具体城乡、族群及农业从业比例仍未定。帝国主要使用大陆通用语；教育默认免费，具体学习门槛与传授范围仍依教学条件。',
     '以10/12最新城市规模替换旧默认值，保留总量、教育及未知边界。',[adopted['population']])
take(58,5,[5])
split('mobilization','帝国军力与粮储基线',BOOKS[1],5,[6],['帝国','八柱将'],entry_type='concept')
take(125,5,[7])

# Deduplicate mechanisms/history using explicit relocation, not deletion.
take(6,6,[0]);take(31,6,[1])
take(7,7,[0,1,2,3]);take(124,7,[4,5])
take(8,8,[0,1,3,4])
split('guild_scene','帝都协会接待与求助',BOOKS[5],8,[2,5],['游击士协会'],entry_type='concept')
take(11,11,replace='空间龙部族曾居于妄想山脉边缘的空间龙秘境。该旧秘境已在首次入都前遭人类追兵屠灭，仅悠悠幸存；凌迟不是屠族者。悠悠本名芬尔德·特兰希尔。旧秘境以外是否还有其他空间龙未明。族长与凌迟反击入侵者的先后存在未决记述，详情由空间龙部族覆灭条目维护。',why='压缩重复覆灭史；已存在的历史条目保留两种证言。')
take(24,24,replace='空间龙秘境位于妄想山脉边缘，是悠悠原先的故乡，与龙族中央聚居秘境是两个地方。首次入都前，此处已遭人类追兵奇袭屠族，仅悠悠幸存；凌迟不是屠族者。反击经过的相异证言见空间龙部族覆灭，不推定秘境外同族存亡。',why='地点身份与既存历史分工；不合并两个秘境。')
take(19,19,[0]);take(72,19,[1])
split('gate_scene','帝都入城接报与公开战报',BOOKS[5],19,[2,3,4],['帝都'],entry_type='concept')
take(20,20,replace='边境关卡是帝国面向妄想山脉的军事防线，过去长期阻止成军魔兽深入飘零大陆。首次入都约2—3周前已失陷；这段间隔包含经历与停留，不是净赶路天数。凌迟以制空、空投和多兵种协同破关，真达卡斯与边关三军统领阵亡，具体前史由第一次魔兽大侵攻维护。',why='保留防线身份及必要历史摘要，事件主条目独立维护。')
take(21,21,[0]);split('canyon_scene','峡谷调查、交战与战后接续',BOOKS[5],21,[1,2],manual=True,entry_type='concept')
take(22,22,[0]);split('clinic_state','九雪医馆查封与接触基线',BOOKS[5],22,[1,2,3,4],['九雪医馆','雪老','露露缇耶'],entry_type='concept')
take(26,26,[0,2]);take(45,26,[1])
extra(27,'学士可获帝国承担费用的帝都国立图书馆普通入馆通行证。二十金是明显偏高的入馆门槛，不是居民随手可付的小额花销；福利不等于个人已经领到。普通资格不提供秘密馆藏、私人传承、无限借书或免费复制权限，有效期、补办和借用办法未定。',[adopted['library']])
records[30]['native']['key']=['YGGDRASIL']

# Mechanics remain distinct from the subject's current wishes and scene outcomes.
take(39,39,[0,1]);split('curse_scene','悠悠诊视与求治接续',BOOKS[5],39,[2],['悠悠','芬尔德·特兰希尔'],entry_type='concept')
take(46,46,[0]);split('language','主神遗留语言能力',BOOKS[3],46,[1],['御临风','谏山黄泉','黄泉','姜子尤'],entry_type='concept')
take(49,49,replace=units[49][0].split('\n')[0]+'\n\n重玩初始卡采用削弱版、重铸前弃风：6L、破魔2、破甲2、适用条件下目标减防3。弃风同一减防效果与狂岚不重复计算；这不是每击固定伤害。不得继承旧16L、传奇工艺24、额外风池、额外速度或抗魔格挡。是否持有、受损、后来重铸以及实际消耗，以当前分支与已接入规则状态为准。',why='以10/21已采用新初始卡替换数值待定，不升级为重铸后剑。',refs=[adopted['sword']])
take(55,55,[0],replace=units[55][0].split('\n')[0]+'帝国不供奉任何神明，仪式不据此补出神明回应。',why='把本届日期与节目传闻拆出，承接无神明供奉。',refs=[adopted['religion']])
split('festival','本届飘零祭的时点与互动',BOOKS[5],55,[1],['飘零祭'],entry_type='concept')
extra('festival',units[55][0].split('\n',1)[1])
take(56,56,[0,1,2,3]);split('learning','斗气与魔法学习门槛',BOOKS[3],56,[4],['帝国教育与知识传播','帝都法师塔'],entry_type='concept')
take(57,57,[0,3,4,5]);split('healing','药物、治疗魔法与休息恢复',BOOKS[3],57,[1,2],['培元丹','帝国医疗与药理','九雪医馆'],entry_type='concept')
extra('healing','此处的旧疗伤药描述不自动等同新卡A／B／C药。实际药品身份、库存与消费按当前记录，已适配规则由现有JS/MVU结算，不从旧旅途合计账给个人加药。',[ref('work/replay_research/opening_roster_p1_001_016.md',36)])
take(59,59,[0,1,3]);take('gate_scene',59,[2]);take(125,59,[4])
split('dakas_state','冒名达卡斯的授权、协作与知情',BOOKS[5],59,[5,6],['达卡斯','凌迟','奥修特尔','右近'],entry_type='concept')
extra(61,'当前帝国不供奉任何神明，死者一律火化，适用于各族各身份居民；不新增土葬、树葬或贵族例外。原线公墓与悼念记载保留，具体骨灰安置及礼俗仍未定。威廉对防死灵用途的解释保留为本人说法，不据此确认全国葬制起源，也不外推至古文明或决定复生机制。',[adopted['religion']])

# Keep useful compact characterization; move volatile anchors, not full profile material.
for n in [84,85,88,89,90,104,105]:
    idx=next(i for i,p in enumerate(units[n]) if p.startswith('使用时点：'))
    dest='clinic_state' if n==105 else 'dakas_state' if n==104 else 'curse_scene' if n==90 else 'companions' if n in [84,85] else 'residency'
    if dest not in records:
        add(dest, '入都同伴的时期基线' if dest=='companions' else '久远与哈克的医馆寄居条件',BOOKS[5],n,'concept', ['谏山黄泉','黄泉','布莱特'] if dest=='companions' else ['久远','哈克','九雪医馆'])
    moved=[idx]+([5,6] if n==104 else [])
    take(n,n,[i for i in range(len(units[n])) if i not in moved])
    if n==104: take(dest,n,[5,6])
    if n==89:
        take(dest,n,[idx],replace='久远与哈克T0尚未入住九雪医馆。峡谷战后，仍须医馆能接待、馆主邀请、久远愿意并实际搬入；哈克随行寄居同样成立后再记。首次入城或寻找雪老时翻墙，不触发久远后院沐浴。战前其他有依据的拜访、相遇仍可发生；开局未预设已治疗御临风或答应其请求。若本分支未发生峡谷战，不擅自用收网完成替代该入住前提。',why='UCL_20261022_001修正旧医馆相遇语句的时期歧义。',refs=[adopted['residency'],ref('work/replay_research/capital_event_dependencies.md',1710)])
    else: take(dest,n,[idx],replace=sources[n]['comment'].replace('人物·','')+'｜'+units[n][idx],why='拆出时补明原人物主语，保证独立注入可读。')

for n in range(126,131):
    take(n,n,[0])
    text='佛萨罗伦为几十万人级大城，精确人数未定。' if n==126 else '该城不再套用区域重点城市普遍近百万、可达三百万的旧默认值；精确人口未定。'
    take(n,n,[1],replace=text,why='更新10/12已确认城市人口口径。',refs=[adopted['population']])

# The old mixed common entry retains its UID as a host-only source anchor.
take(123,123,[0,1,7,8,9,10,11,13,14,18,19,20])
take(19,123,[2]);take('language',123,[3]);take(22,123,[4]);take(87,123,[5]);take(122,123,[6])
split('tiers','战力阶梯与短卡适用边界',BOOKS[3],123,[12,15],['八柱将','达卡斯','凌迟','钟塔维修间','雪老救援','法阵安装者','石像魔偶','催眠魔兽','Chuul','古雷姆林'],entry_type='concept')
split('xp','帝都挑战与个人XP参照',BOOKS[3],123,[16],['钟塔维修间','雪老救援','法阵安装者','石像魔偶','催眠魔兽','Chuul','古雷姆林'],entry_type='concept')
split('combat_conventions','901短卡计算约定',BOOKS[3],123,[17],['钟塔维修间','雪老救援','达卡斯部属','法阵安装者','帝都近郊峡谷','石像魔偶','试炼洞穴','催眠魔兽','Chuul','旧涵洞','古雷姆林'],entry_type='concept')

# Seven enemy types: preserve every numerical expression; separate encounters/rewards.
take(131,131,[0,2,3]);split('guards_scene','雪老救援与驻处守卫部署',BOOKS[5],131,[1,4,5],manual=True,entry_type='concept')
take(132,132,[1]);split('arrays','峡谷结界与空间封印运行',BOOKS[3],132,[2],['法阵安装者','帝都近郊峡谷'],entry_type='concept')
split('installers_scene','峡谷安装者部署与成果',BOOKS[5],132,[0,3],manual=True,entry_type='concept')
take(133,133,[1,2,3])
line=units[133][4]; mech,scene=line.split('入口宽4米',1)
take(133,133,[4],replace=mech,why='同一行的暗视与魔法感知留能力书；洞穴尺寸与战术原文移场景。')
split('chuul_scene','旧涵洞讨伐现场与报酬',BOOKS[5],133,[0,5],manual=True,entry_type='concept')
extra('chuul_scene','入口宽4米'+scene)
take(134,134,[1,2,3,4]);split('hypnosis_scene','催眠魔兽的部署与救治成果',BOOKS[5],134,[0,5],manual=True,entry_type='concept')
line=units[135][0]; scene,mech=line.split('T3；',1)
take(135,135,[0],replace='石像魔偶能力模板：T3；'+mech,why='石像已布置这一条件实例移场景；数值不变。')
take(135,135,[1,2]);split('golem_scene','试炼洞穴石像实例与成果',BOOKS[5],135,[3],manual=True,entry_type='concept');extra('golem_scene',scene)
take(136,136,[0]);split('gremlin_stats','古雷姆林常态战斗能力',BOOKS[3],136,[1,2,3],['古雷姆林'],entry_type='concept')
split('gremlin_scene','古雷姆林试炼接续与成果',BOOKS[5],136,[4,5],manual=True,entry_type='concept')

# Every untouched source unit stays in its original main entry.
for n in sources:
    rest=[i for i in range(len(units[n])) if not used[(n,i)]]
    if rest: take(n,n,rest)
assert all(used[(n,i)] == 1 for n in sources for i in range(len(units[n])))

# Alias additions use names already present in the reviewed contents, never generic actions.
alias_updates={31:['帝赐假面','水神假面','土神假面','火神假面','雷神假面'],39:['凌迟与悠悠涉及的诅咒','悠悠','芬尔德·特兰希尔'],43:['空间龙部族覆灭','空间龙部族','空间龙秘境'],44:['第一次魔兽大侵攻','边境关卡'],45:['监狱塔脱逃','监狱塔'],49:['弃风剑','弃风'],94:['谢尔伦·冯·吉尔科德','谢尔伦','冰霜龙王'],98:['肯达·凯·弗格斯','肯达'],100:['本多·凯·弗格斯','本多','赤炎龙王'],108:['瑟坦特·卢·优尔兰','瑟坦特'],121:['飘零币','飘零金币','飘零银币','飘零铜币']}
for n,keys in alias_updates.items(): records[n]['native']['key']=keys

# Newly adopted conditional branches are opt-in, with full source manuscripts alongside.
branch_specs=[
 ('early_canyon','帝提前干预：峡谷停军','capital_canyon_early_intervention_playable_draft.md',4665,
  '适用窗口：主力尚未入谷或仍可停止后续进入，已发生的毁阵、暴露和伤亡优先。核对两阵作用、节点与独立供能；安装者只知其工作范围，专业鉴识须有足够材料。高纯七曜石另取实际经手证言或可核验观察，不把战后解释前置；毁阵不销毁结晶，夺晶不停阵。\n\n报告需说明军队位置、命令时点、撤离风险、来源可信度、为何来不及可靠排除及谁能接令。黄翔—右近—帝沿实际通道；正常且已核实双向时，从短报到外线回令约110—150分钟，另加找人、实体材料、返营和调兵。副官线路先核实终点，不默认直通帝。\n\n具体风险可信、无法及时排除且谷外有暂驻或撤转条件时，帝可暂停、撤回本次进军指挥并安排实际接管，接受敌军少受消耗或散走。仅有复杂法阵不保证改令；风险已可靠排除可继续，报告仍有价值。凌迟依实际收到的命令和眼前压力解释、周旋、拒绝或转移，不预设缴械、开战或必逃。收到、下令、送达和执行分开记录。'),
 ('city_priority','帝提前干预：优先保城','capital_city_priority_playable_draft.md',4674,
  '本分支核对城内接应异常与城外护送，先固定真实位置、路线、接应时段和留守任务。两武士护送真实悠悠，不能恢复已撤回的换人方案；人物未核实时只知观察所得，不自动认出空间龙。凌迟利用现有驻处和协查关系安排接应，是条件式越权尝试，不是帝已批准全城免检。已被接管的驻处不重造。\n\n查问命令经手人、接应口、准备进度和独立来源；年幼来客或备车本身不证明完整后手。任何可信警讯可先报，右近能在职责内保护、暂停具体交接并核实。比较护送可能到达、关键力量离都和替代力量接手三个实际时点，无悠悠固定死亡倒计时。\n\n关联可靠、高危护卫正逼近、接应绕开核查且实际留守无法及时补位时，帝可留下或调回力量，缩减峡谷围剿，接受部分目标逃离；能两头兼顾就承认。撤权、拘捕、取消已发指令分别落实。凌迟与黄祸仅按实际观察和通信反应，控制凌迟不自动取消空间后手；咒术与死亡触发须实际诊断后才成为人物知识。'),
 ('early_arrest','帝提前干预：提前拘捕','capital_early_arrest_playable_draft.md',4683,
  '先取得可靠接近窗口、目标与亲随的实际位置、足够控制力量、军令接手者及外围／留守安排。正常军情核对可以构成接近机会，但不预定凌迟同意地点、卸下危险物或与支援分离。帝可预先给有边界的条件授权，执行者到场再核对；短窗口不允许事后补出未派遣的伏兵。\n\n正常回令约110—150分钟，地面力量准备30—60分钟、至营地约4—6小时，另算实际接近与位置偏差；未确认传送不能补时差。右近离城须实际获令并落实接替，不能一人同时负责多地。帝须承受较完整魔兽军的压力，依据新鲜侦察安排警戒、阻截或守御；可以放弃围歼，但不能把敌军当统领被捕就消失的召唤物。\n\n落实本人控制、相关军令交接、普通士兵接收与危险随从处置；被捕、撤权和催眠解除互不等价。凌迟可交涉、质疑、以真实筹码周旋、抵抗、逃离或接受看管，按眼前机会处理；生擒可以是真成功，不强制自杀或必逃。失去窗口可转为保护；逃脱但指挥权已解除仍保留成果。奖励、救治和悠悠线按实际取得继续。')]
for key,name,file,line,body in branch_specs:
    add(key,name,BOOKS[5],125,'concept',manual=True)
    extra(key,body,[ref('work/replay_research/'+file,1),ref('work/replay_research/user_clarifications.md',line)])

# Runtime and native lore share the adopted core capsule, with explicit provenance.
core = json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {CORE_RULE_REFERENCE as r} from './work/rules_engine/gm_runtime/rule-reference.mjs';process.stdout.write(JSON.stringify(r))"],cwd=ROOT,encoding='utf-8'))
add('core-rules',core['title'],BOOKS[3],123,'concept',keys=[])
records['core-rules']['native'].update(constant=True,disable=False,order=290)
extra('core-rules',core['content']+'\n\n来源：'+core['source'],[ref('work/rules_fusion/901-core-rules-v0.1.md'),ref('work/rules_engine/gm_runtime/rule-reference.mjs')])

# Adopted D1–D14: reuse the corresponding concept records and native UIDs.
conditional = json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {CONDITIONAL_RULES as r} from './work/rules_engine/gm_runtime/scene-rules.mjs';process.stdout.write(JSON.stringify(r))"],cwd=ROOT,encoding='utf-8'))
decision_ref=ref('work/rules_engine/gm_runtime/source-recheck-20261023.md')
for uid,kind in [(208839788,'ancientBelt'),(174980132,'teleport'),(225474856,'phantomRings'),(258418733,'antiMagicRock'),(132414086,'demonBox')]:
    matches=[k for k,r in records.items() if r['uid']==uid]
    assert len(matches)==1,(uid,matches)
    extra(matches[0],'2026-10-23已采用执行口径：'+conditional[kind]['rules'],[decision_ref,ref('work/rules_engine/gm_runtime/scene-rules.mjs')])
    records[matches[0]]['revisions'].append({'source':'D1–D14','reason':'用户已整体采用；实际状态仍由JS/MVU维护。'})
extra('xp','强化节点须现场登记开放，玩家明确选择属性、技能或专长；按下一等级自动计价并原子扣除XP，重复操作不重复扣费。节点奖励与可强化资格分别登记，不把所有奖励当成强化许可。',[decision_ref,ref('work/rules_fusion/901-core-rules-v0.1.md')])

guanlan = json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {GUANLAN_RULE as r} from './work/rules_engine/growth-pricing.mjs';process.stdout.write(JSON.stringify(r))"],cwd=ROOT,encoding='utf-8'))
extra('xp',guanlan+'实际持有与悟法XP由各人物自己的MVU保存；资源学习按已登记具体项目核价，分期只对完整总价减一次，不把D级视为统一定价。',[decision_ref,ref('work/rules_engine/growth-pricing.mjs')])
records['xp']['native']['key']=list(dict.fromkeys(records['xp']['native']['key']+['观澜法','危境开悟']))

# Maintained resource library. Definitions never grant ownership or reset T0.
kit_inventory=read(STAGE/'kit-inventory.json')
KIT=ROOT.parent/'901-resource-authoring-kit'
sys.path.insert(0,str(KIT/'tools'))
from compile_resources import load_contracts,load_candidate_package
contracts={d['id']:d for d in load_contracts()}
contract_paths={read(p)['id']:p for p in (KIT/'resources/execution').glob('*.rule.json')}
candidate_contracts={};candidate_runtime={};candidate_actions={}
for relative in kit_inventory.get('candidatePackages',[]):
    package=KIT/relative
    definitions,actions,selected,_=load_candidate_package(package)
    assert not set(contracts)&set(selected), '候选不能覆盖正式合同身份'
    contracts.update(selected);candidate_contracts.update(selected)
    candidate_runtime.update(definitions);candidate_actions.update({row["resourceId"]:row for row in actions})
    paths={read(p)['id']:p for p in (package/'execution/contracts').glob('*.rule.json')}
    contract_paths.update({id:paths[id] for id in selected})
assert {item['id'] for item in kit_inventory['entries']}==set(contracts), '资源目录与执行合同集合不同'
for item in kit_inventory['entries']:
    contract=contracts[item['id']]
    assert item['sourceHash']==contract['reading']['sha256'], '目录正文已变化，先运行kit_catalog.py'
    assert item['source']=='../901-resource-authoring-kit/'+contract['reading']['path']
    later=item.get('period')=='later-optional'
    template=item['kind']=='character-template'
    candidate=item.get('adoptionStatus')=='candidate'
    assert candidate==(item['id'] in candidate_contracts), '候选目录身份不一致'
    key=add('kit:'+item['id'],('后期模板·' if template else '候选资源·' if candidate else '资源·')+item['name'],BOOKS[5] if template else BOOKS[3],123,'concept',keys=[item['name']],manual=template or candidate)
    records[key]['native'].update(disable=template or candidate,constant=template or candidate,excludeRecursion=True,preventRecursion=True)
    meta={'id':contract['id'],'version':contract['version'],'reading':contract['reading'],
          'path':'../901-resource-authoring-kit/'+contract_paths[item['id']].relative_to(KIT).as_posix(),
          'sha256':sha(contract_paths[item['id']]),'verification':contract['verification'],
          'actions':contract['actions'],'implementationGaps':contract['implementationGaps'],
          'unresolvedRules':contract['unresolvedRules']}
    if candidate:
        runtime=candidate_runtime[item['id']];action=candidate_actions.get(item['id'],{})
        meta.update(adoptionStatus='candidate',verifiedOperations=runtime['operations'],
                    runtimeProjectionVerification=runtime['verification'],learning=action.get('learning'))
    records[key]['resourceContract']=meta
    records[key]['native']['extensions']['901_resource_contract']=meta
    warning='资源定义不表示任何人物已经取得；实际资格、持有、能量、冷却、XP只认当前JS/MVU。'
    if candidate:warning+='本批适配候选，默认手动禁用；执行证明只覆盖已列操作，须有该角色的已采用学习报价和实际取得记录才能使用，不自动加入帝国课程。'
    if later:warning+='后期可选成长资料，不能覆盖入都T0；须实际取得各项后逐项启用，不导入整张成熟面板。'
    if item.get('prohibited'):warning+='帝国禁用条目，不列入帝国法师合法学习目录；资料存在不构成开放许可。'
    status=contract['verification']
    execution=f"执行合同：{contract['id']} @ {contract['version']}；覆盖状态：{status['status']}；完整执行验证：{'是' if status['runtimeFullyVerified'] else '否'}。索引或正文存在不代表全部条款可自动结算。"
    if candidate:
        execution+=' 已验证操作：'+('、'.join(meta['verifiedOperations']) or '仅部分被动效果')+'；学习事务：'+('已验证，须逐项登记采用报价' if meta['learning'] else '未接入，不能购买汇编总开关')+'。'
    gaps='\n'.join('实现缺口：'+x for x in contract['implementationGaps'])
    unresolved='\n'.join('规则缺参：'+x['parameter']+'；依据：'+x['basis']+'；推荐：'+x['recommendation'] for x in contract['unresolvedRules'])
    extra(key,warning+'\n\n'+execution+'\n'+gaps+'\n'+unresolved+'\n\n'+item['body'],[ref(item['source'],item['line']),ref(meta['path'])])
    records[key]['revisions'].append({'source':'kit-inventory.json','reason':'用户明确要求完整盘点并接入现有六书；定义、后期模板与当前持有分离。'})

# Final source/manifest projection. The plan contains paths and content hashes, not competing inline bodies.
# Adopted current-period author material, reviewed in the comprehensive audit.
for delta in read(STAGE/'adopted_author_delta.json'):
    if delta.get('target_uid'):
        keys=[k for k,r in records.items() if r['uid']==delta['target_uid']]
        assert len(keys)==1,delta['name']
        key=keys[0]
    else:
        key=add(delta['key'],delta['name'],delta['book'],5,'concept',keys=delta['keywords'])
    extra(key,delta['body'],delta['refs'])
    records[key]['revisions'].append({'source':'adopted_author_delta.json','reason':'用户要求全面审查并接入；仅迁移明确已采用的当前期事实，不写入事件或人物运行状态。'})

protected={str(BASE.relative_to(ROOT)):sha(BASE),str(CARD.relative_to(ROOT)):sha(CARD),str((STAGE/'adopted_author_delta.json').relative_to(ROOT)):sha(STAGE/'adopted_author_delta.json')}
for p in [ROOT/'output/worldbook_source.jsonl',ROOT/'output/replay_tavern/latest_release.json',ROOT/'current_state.md']:
    if p.exists(): protected[str(p.relative_to(ROOT))]=sha(p)
for r in records.values():
    parent=sources[r['parent']]
    b=r['book'];body='\n\n'.join(r['pieces'])
    if b==BOOKS[5]: body=STATE_RULE+'\n\n'+(SCENE_RULE+'\n\n' if r['native']['disable'] else '')+body
    # Entry titles/memos are not injected, so each body carries its own subject.
    r['content']=r['name']+'\n\n'+body
    r['path']=('texts/901_通用主持迁移段.txt' if b=='主持卡' else f'entries/{BOOKS.index(b)+1:02d}_{b}/{r["uid"]}_{r["name"].replace("/","_")}.txt')
    r['native']['content']=r['content']
    r['source_indices']=sorted({u['index'] for u in r['source_units']})
    refs=[]
    for idx in r['source_indices']:
        refs.append({'path':str(BASE.relative_to(ROOT)).replace('\\','/'),'uid':sources[idx]['uid']})
    refs.extend(r['extra_refs'])
    r['refs']=list({json.dumps(x,sort_keys=True,ensure_ascii=False):x for x in refs}.values())
    for rf in r['extra_refs']:
        p=ROOT/rf['path']; assert p.exists(),p
        protected[rf['path']]=sha(p)
    prior=copy.deepcopy(parent['extensions']['901_replay'])
    # Preserve the existing provenance object verbatim and attach a namespaced migration record.
    r['native']['extensions']['901_six_books']={
        'revision':REV,'entry_type':r['type'],'book':b,'source_units':r['source_units'],
        'source_refs':r['refs'],'baseline_source':prior,'revisions':r['revisions'],
        'state_rule':STATE_RULE,'authorization':'用户：基于 tavern-cards 编排六本书的条目、触发和状态分工，再据此迁移内容。'}

def plan_record(r):
    n=r['native']; return {
        'name':r['name'],'uid':r['uid'],'book':r['book'],'type':r['type'],'path':r['path'],
        'abstract':r['content'].split('\n\n')[-1][:140] if r['book']=='主持卡' else r['pieces'][0].split('\n')[0][:140],
        'part':'runtime_capsule' if r['type']=='character' else 'single_topic',
        'scope':'global' if n['constant'] and not n['disable'] else 'specific','rephrase':False,
        'keywords':n['key'],'strategy':'host' if r['book']=='主持卡' else 'manual' if n['disable'] else 'constant' if n['constant'] else 'keyword',
        'position':'after_char','order':n['order'],'scan_depth':n['scanDepth'],'recursive':False,
        'state_owner':'主持方法' if r['book']=='主持卡' else '条件式方案或有时期的基线' if r['book']==BOOKS[5] else '背景定义；不写入运行状态',
        'source_uids':[sources[i]['uid'] for i in r['source_indices']], 'source_refs':r['refs'],
        'revisions':r['revisions'],'content_sha256':hashlib.sha256(r['content'].encode()).hexdigest(),
        **({'resourceContract':r['resourceContract']} if 'resourceContract' in r else {})}

plan={
 'project':{'name':'901 六本世界书迁移','form':'existing-native-worldbooks','mvu':'reuse-existing-no-schema-change','ejs':False,'ui_mode':'none','revision':REV},
 'adapter':'应用tavern-cards规划、条目与动态分工；原生JSON投影，非forge工程，不运行configure/pack。',
 'runtime_integration':{'profile_field':'lorebooks','books':list(FILENAMES.values()),'patch_modules':'完整浏览器ESM依赖闭包，见runtime_patch_manifest.json','mechanics':'用户2026-10-23全面接入授权：统一规则裁定、当前人物能力、已采用NPC及有完整参数的条件资源；核心规则同源常驻，存档不重置'},
 'scope':{'runtime_baseline':str(BASE.relative_to(ROOT)),'source_entries':136,'latest_conditional_branches':3,'author_f_coverage':'已补11组当期已采用作者资料与2项人物差异；8条新增、5条补充。更广人物全档、未来时期和未采用候选不算T0已发生状态。'},
 'books':[{'name':b,'file':f'import/{FILENAMES[b]}.json','order':ORDER[b]} for b in BOOKS],
 'loading':{'always_on':['妄想大陆','大陆法则限制',core['title']],'changed_to_keyword':['帝国','人物·谏山黄泉','人物·卡西乌斯·布莱特'],'original_disabled':'九条维持禁用','scene_gates':'明确部署/遭遇/提前干预默认手动启用；关键词匹配不充当阶段判断','shared_budget':'六书共用实际SillyTavern预算；不假设每书各有5000。人物常驻改按名触发；手动场景关闭后不继续注入。'},
 'state_ownership':{'stable_lore':'六书条目','original_D3':'current_state.md仅原续团，不用于重玩','replay_present':'当前有效分支摘要、摘要后保留聊天、已确认运行存档','mechanics':'沿现有stat_data.901_rules_poc与JS写回，不新增或初始化MVU/EJS','phase':'按实际条件手动启用场景，不造自动变量门控','secrets':'资料加载不公开给NPC或玩家角色'},
 'protected_sha256':protected,'entries':[plan_record(r) for r in records.values()]}

def integrate_runtime():
    for r in records.values():write(OUT/r['path'],r['content'])
    for b in BOOKS:dump(OUT/f'import/{FILENAMES[b]}.json',{'entries':{str(r['uid']):r['native'] for r in records.values() if r['book']==b}})
    mapping=read(OUT/'migration_map.json');mapping['entries']=plan['entries'];dump(OUT/'migration_map.json',mapping)
    card_path=OUT/'import/901_帝都初始卡_六书候选.card.json'
    card=read(card_path)
    original_script=read(CARD)['data']['extensions']['tavern_helper']['scripts'][1]
    script=copy.deepcopy(original_script)
    assert script['content'].count('profile:{debug:false,')==1
    script['content']=script['content'].replace('profile:{debug:false,','profile:{lorebooks:'+json.dumps(list(FILENAMES.values()),ensure_ascii=False)+',debug:false,')
    card['data']['extensions']['tavern_helper']['scripts'][1]=script
    base_entries={e['id']:e for e in read(CARD)['data']['character_book']['entries']}
    entries=[]
    for r in records.values():
        if r['book']!=BOOKS[0]:continue
        n=r['native'];ce=copy.deepcopy(base_entries[sources[r['parent']]['uid']])
        ce.update(id=n['uid'],keys=n['key'],secondary_keys=n['keysecondary'],comment=n['comment'],content=n['content'],constant=n['constant'],selective=n['selective'],insertion_order=n['order'],enabled=not n['disable'],position='after_char',case_sensitive=n['caseSensitive'],extensions=copy.deepcopy(n['extensions']))
        entries.append(ce)
    card['data']['character_book']['entries']=entries

    dump(card_path,card)
    dump(OUT/'import/901_六书主持入口.script.json',script)
    manifest=[]
    pending=[ROOT/'work/rules_engine/gm_runtime'/name for name in ['replay-gate-script.example.js','narrative.mjs','integrated.mjs','opening.mjs','opening-binding.mjs','opening-scene-ui.mjs']]
    modules=set()
    while pending:
        src=pending.pop().resolve()
        if src in modules:continue
        assert src.is_relative_to(ROOT) and src.exists(),src
        modules.add(src)
        for rel in re.findall(r'''(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]''',src.read_text(encoding='utf-8')):
            if not rel.endswith(('.mjs','.js')):continue
            if rel.startswith('.'):pending.append(src.parent/rel)
            for prefix in ('/901-rules-runtime/','/901-combat-runtime/','/901-opening-combat/'):
                if rel.startswith(prefix):pending.append(ROOT/rel[len(prefix):])
    for src in sorted(modules):
        dest=OUT/'runtime_patch/901-opening-combat'/src.relative_to(ROOT)
        write(dest,src.read_text(encoding='utf-8').replace('/901-rules-runtime/','/901-opening-combat/').replace('/901-combat-runtime/','/901-opening-combat/'))
        manifest.append({'source':str(src.relative_to(ROOT)),'source_sha256':sha(src),'destination':str(dest.relative_to(OUT)),'sha256':sha(dest)})
    dump(OUT/'runtime_patch_manifest.json',{'profile_books':list(FILENAMES.values()),'modules':manifest})
    rows=['# 六书条目与触发表','正文与规划同源；新增手动场景启用后临时常驻，用完关闭。原谢尔伦条目启用后仍按关键词，其余原手动条目沿原常驻方式。所有条目在角色描述后插入，扫描4层、不递归。','|书／UID|条目|触发方式|顺序|来源UID|','|---|---|---|---|---|']
    for p in plan['entries']:
        trigger=p['strategy']+('：'+ '、'.join(p['keywords']) if p['keywords'] else '')
        rows.append(f'|{p["book"]} / {p["uid"]}|[{p["name"]}](<{p["path"]}>)|{trigger}|{p["order"]}|'+','.join(map(str,p['source_uids']))+'|')
    write(OUT/'条目与触发表.md','\n'.join(rows))
    # Compare every config change, including intentionally redesigned keys/constants/order.
    changes=[]
    for k,r in records.items():
        old=sources[r['parent']];new=r['native'];changed={f:{'before':old.get(f),'after':new.get(f)} for f in ['key','constant','disable','order','position','scanDepth','excludeRecursion','preventRecursion'] if old.get(f)!=new.get(f)}
        if changed:changes.append({'uid':r['uid'],'name':r['name'],'source_uid':old['uid'],'changes':changed})
    dump(OUT/'loading_changes.json',changes)
    dump(OUT/'创作规划.yaml',plan)

def export():
    approved_plan=read(STAGE/'创作规划.yaml')
    assert approved_plan==plan, 'Plan changed or source drift: inspect and regenerate plan before export.'
    assert not OUT.exists(), 'Candidate already exists; inspect instead of overwriting.'
    for rel,h in protected.items(): assert sha(ROOT/rel)==h
    books={b:{'entries':{}} for b in BOOKS}
    for r in records.values():
        write(OUT/r['path'],r['content'])
        if r['book'] in books: books[r['book']]['entries'][str(r['uid'])]=r['native']
    for b,obj in books.items():dump(OUT/f'import/{FILENAMES[b]}.json',obj)
    dump(OUT/'创作规划.yaml',plan)
    card=read(CARD);d=card['data'];oldbook=d['character_book'];base_entries={e['id']:e for e in oldbook['entries']}
    d['name']='901 帝都初始卡·六书候选'
    d['character_version']=REV
    routing='六书分工：基础、政治、人物、能力、历史为按主题的背景定义；当前剧本书为分期基线与条件式资料。当前有效摘要、摘要后保留聊天和已确认规则存档优先于T0。不得把读到的方案写成已发生状态；手动启用只让主持可读，不证明到场或知情。人物离场但仍在讨论时仍可查人设，不据触发拉回现场。数值沿现有JS/MVU，不重新初始化。'
    d['description']+='\n\n## 六书迁移与主持职责\n\n'+routing+'\n\n'+records[123]['content']
    d['scenario']+='\n旧离村合计药物账只作历史来源，不覆盖新初始卡个人库存；新卡个人库存与此后真实消耗沿现有存档，迁移不补发。'
    d['creator_notes']+='\n六书迁移候选：只内嵌世界基础设定；另外五书需按说明手动关联。保留10/22规则脚本，未安装或初始化任何聊天。'
    d['extensions']['world']=FILENAMES[BOOKS[0]]
    oldbook.update(name=FILENAMES[BOOKS[0]],description='六书之一：世界基础设定。其余五书为独立JSON，需额外关联。',entries=[])
    for r in records.values():
        if r['book']!=BOOKS[0]:continue
        n=r['native'];ce=copy.deepcopy(base_entries[sources[r['parent']]['uid']])
        ce.update(id=n['uid'],keys=n['key'],secondary_keys=n['keysecondary'],comment=n['comment'],content=n['content'],constant=n['constant'],selective=n['selective'],insertion_order=n['order'],enabled=not n['disable'],position='after_char',case_sensitive=n['caseSensitive'],extensions=copy.deepcopy(n['extensions']))
        oldbook['entries'].append(ce)
    oldbook['extensions']['901_six_books']={'revision':REV,'primary_book_only':True}
    dump(OUT/'import/901_帝都初始卡_六书候选.card.json',card)
    write(OUT/'texts/901_六书路由说明.txt',routing)
    # Complete native host description is convenient for merging; no live replacement is performed.
    write(OUT/'texts/901_候选主持正文.txt',d['description'])
    (OUT/'manuals').mkdir(exist_ok=True)
    for _,_,file,_,_ in branch_specs:
        body=(ROOT/'work/replay_research'/file).read_text(encoding='utf-8')
        body=re.sub(r'\[([^\]]+)\]\(([^\n)]+)\)',r'\1',body)
        write(OUT/'manuals'/file,body+'\n\n来源：work/replay_research/'+file+'。本副本去除仓库相对链接，以免便携包内产生失效跳转；原稿与来源哈希保留在创作规划。')
    dump(OUT/'migration_map.json',{'revision':REV,'source_coverage':[{'uid':e['uid'],'name':e['comment'],'destinations':[{'uid':r['uid'],'book':r['book'],'path':r['path']} for r in records.values() if e['uid'] in [sources[i]['uid'] for i in r['source_indices']]]} for e in original], 'source_units':sum(len(v) for v in units.values()),'entries':plan['entries']})
    rows=['# 六书条目与触发表','正文与规划同源；新增手动场景启用后临时常驻，用完关闭。原谢尔伦条目启用后仍按关键词，其余原手动条目沿原常驻方式。所有条目在角色描述后插入，扫描4层、不递归。','|书／UID|条目|触发方式|顺序|来源UID|','|---|---|---|---|---|']
    for p in plan['entries']:
        trigger=p['strategy']+('：'+ '、'.join(p['keywords']) if p['keywords'] else '')
        rows.append(f'|{p["book"]} / {p["uid"]}|[{p["name"]}](<{p["path"]}>)|{trigger}|{p["order"]}|'+','.join(map(str,p['source_uids']))+'|')
    write(OUT/'条目与触发表.md','\n'.join(rows))
    # Compare every config change, including intentionally redesigned keys/constants/order.
    changes=[]
    for k,r in records.items():
        old=sources[r['parent']];new=r['native'];changed={f:{'before':old.get(f),'after':new.get(f)} for f in ['key','constant','disable','order','position','scanDepth','excludeRecursion','preventRecursion'] if old.get(f)!=new.get(f)}
        if changed:changes.append({'uid':r['uid'],'name':r['name'],'source_uid':old['uid'],'changes':changed})
    dump(OUT/'loading_changes.json',changes)
    integrate_runtime()
    print(json.dumps({'output':str(OUT),'counts':{b:len(x['entries']) for b,x in books.items()},'host_uid':sources[123]['uid']},ensure_ascii=False))

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--plan',action='store_true');ap.add_argument('--export',action='store_true');ap.add_argument('--runtime',action='store_true');args=ap.parse_args()
    if args.plan:
        dump(STAGE/'创作规划.yaml',plan)
        print(json.dumps({'planned_entries':len(records),'books':dict(Counter(r['book'] for r in records.values())),'source_units':sum(len(v) for v in units.values())},ensure_ascii=False))
    elif args.export:export()
    elif args.runtime:
        assert read(STAGE/'创作规划.yaml')==plan
        integrate_runtime()
    else:ap.error('Use --plan or --export')
