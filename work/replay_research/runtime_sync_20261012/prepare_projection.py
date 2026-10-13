"""One-off 005 content projection; baseline and authoritative profiles are read-only."""
from pathlib import Path
import copy
import difflib
import hashlib
import json

ROOT = Path(__file__).resolve().parents[3]
STAGE = Path(__file__).resolve().parent
BASE = ROOT / 'output/replay_tavern/world_sync_20261008_candidate'
REV = 'M1_IMPORT_20261012_005'
AUTH = 'UCL_20261012_070'

def read(p):
    return json.loads(p.read_text(encoding='utf-8'))

def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def ref(path, needle=None):
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    lines = p.read_text(encoding='utf-8').splitlines()
    found = [i + 1 for i, l in enumerate(lines) if needle is None or needle in l]
    assert found, (path, needle)
    return {'path': str(path).replace('\\', '/'), 'line': found[0], 'locator': needle}

def profile(id, needle='## 背景与T0使用'):
    return ref(f'output/replay_f_review/v1/characters/profiles/{id}.md', needle)

def research(name, needle):
    return ref(f'work/replay_research/{name}.md', needle)

def ucl(id):
    return research('user_clarifications', '## ' + id + '：')

book = read(BASE / 'import/901_帝都重玩_M1_20261008.json')
runtime = [json.loads(l) for l in (ROOT / 'output/replay_f_review/v1/characters/runtime_cards.jsonl').read_text(encoding='utf-8').splitlines() if l]
runtime = {r['entity_id']: r for r in runtime}
changes, projections = [], []

def change(uid, text, refs, reason, entity=None):
    old = book['entries'][str(uid)]
    changes.append({'uid': uid, 'source_id': entity or old['extensions']['901_replay']['source_id'],
                    'comment': old['comment'], 'content': text.strip(), 'source_refs': refs,
                    'reason': reason, 'period': 'replay_T0_and_actual_branch_updates',
                    'adoption': 'existing_approved_facts_and_adopted_author_design',
                    'visibility': 'GM_reference_not_shared_character_knowledge'})

def npc(id, uid, fields, refs):
    r = copy.deepcopy(runtime[id])
    # F records predate 004 corrections; retain the current runtime ability paragraph
    # unless this projection explicitly replaces it.
    if 'abilities' not in fields:
        old_text = book['entries'][str(uid)]['content']
        marker = '能力与限制：'
        if marker in old_text:
            r['content']['abilities'] = [old_text.split(marker, 1)[1].split('\n\n', 1)[0]]
    r['content'].update(fields)
    r['opening']['summary'] = fields['activation_notes']
    r['opening']['source_refs'] = refs
    r.update(review_status='adopted_author_projection_candidate_not_runtime_verified',
             source_profile_file=f'output/replay_f_review/v1/characters/profiles/{id}.md',
             default_loading='reuse_004_worldbook_entry_settings',
             projection_revision=REV, source_refs=refs)
    projections.append(r)
    labels = {'persona':'身份与自身愿望', 'speech_style':'表达方式', 'decision_style':'判断与条件式行动',
              'relationships':'既有关系', 'abilities':'能力与限制', 'knowledge_boundaries':'知情边界',
              'growth_boundary':'成长与变化', 'activation_notes':'使用时点'}
    parts = [r['name']]
    for k, label in labels.items():
        v = r['content'][k]
        parts.append(label + '：' + ('；'.join(v) if isinstance(v, list) else v))
    change(uid, '\n\n'.join(parts), refs, '最新采用人物投影；保留当期能力、实际获知与到场条件', id)

shared = [research('opening_state_consolidated','## 切入点与开局成长'), ucl(AUTH)]
npc('CRC_003', 206761833, {
 'persona':'谏山黄泉原是日本的女高中生与除灵师，经历养父被杀、家业被夺、重伤及婚约取消，旧身份已难维系。她仍珍惜自己的本领与料理等日常兴趣，希望在陌生世界拥有能自己安排的生活，也希望自己拒绝、出错或需要休息时仍被同伴接纳。温柔与喜欢交锋可以并存，既不默认失控，也不将攻击性抹成纯竞技爱好。',
 'speech_style':'直率、尽量简短；熟人间可放松、调侃，关心时说具体需要。普通交流一句说清即可，不轮流复述分析，不用清冷、抱剑或省略号替代个性。',
 'decision_style':'先关心眼前要做什么、缺什么消息、自己愿意承担什么；可主动救助自己的旧识雪老。近身冲突可能比含混交涉更吸引她，但具体理由能改变做法。能承认侦察等短板，接受照顾，也能拒绝被默认安排；不固定替御临风圆场。',
 'relationships':['与御临风有共同来历与边关前史，与布莱特有共同旅途；不建立恋爱或永久从属。','雪老是她自己的边关旧识。神乐仅按用户修订保留为穿越前朋友，不新增归乡使命。'],
 'knowledge_boundaries':['已获告边关失守，不等于亲历全程或知晓冒名。','原乡家变不自动是队伍共有知识；中毒后曾重新问御临风姓名，不能补成全部记忆完整或全部失忆。','她有兄弟会身份，但与大妈不自动互认，也不共享帝的秘密。'],
 'activation_notes':'T0与御临风、布莱特抵都，已苏醒、调养并旅行多日；精确伤势与灵力余量依实际记录，不能永久弱化或默认全满。'
}, [profile('CRC_003'), profile('CRC_003','## 2026-10-11'), profile('CRC_003','## 2026-10-12'), ucl('UCL_20261012_055')] + shared)
npc('CRC_005', 68093225, {
 'persona':'布莱特是失明弓手、C级游击士，曾为猎户和赏金猎人。丧失妻儿与村庄后追索嫌疑精灵五年，后来发现对方只是幸存者，追索转向龙裔；偷袭时被闪光术夺去视力，之后在荣耀城孤儿院重新学习行动。此为他的前史与追凶判断，当前凶手身份未在本轮独立结案。复仇仍是私人愿望，料理、茶、应得报酬和孩子的生活也有真实分量。',
 'speech_style':'直接询问、礼貌求助，熟人间可调侃，对明确恶人可冷硬反讽。需要读字可以坦然请人帮助；有独立依据才展开分析，不每轮重复劝退。',
 'decision_style':'会找机会、借实际熟人渠道核问，也会撤退；认定恶人过快时可能忽略反证。可靠旧案线索出现后可争取追查和交接，紧迫且确需他救人的危险通常优先；没有新线索就能投入眼前生活，不凭空找到帝都仇人。',
 'relationships':['与御临风共同介入山贼与村庄事件，并与黄泉一同旅行，未参加两人的那次边关守备与败亡。','有协会熟人，可尝试接触而不保证全员认识或无限保护；对雪老的关系依实际介绍建立。','牵挂孤儿院，已有汇款不重复扣除；不同记录中的孤儿院不自动合并。'],
 'knowledge_boundaries':['可相信同伴报信诚意而质疑推断；边关消息按实际获告，不变成独立亲历证据。','不因协会身份得知帝的秘密赞助、呈帝渠道或冒名真相。','定位不等于视力、读字、读心或自动识谎。'],
 'activation_notes':'T0与御临风、黄泉抵都，保留失明和已成立的行动能力；后期晋升、苍穹弓、复明与装备奖励均未初始化。'
}, [profile('CRC_005'), profile('CRC_005','## 2026-10-11'), profile('CRC_005','## 2026-10-12：追凶')] + shared)
npc('CRC_007', 131696829, {
 'persona':'尘雪／雪老是长期为帝国及兄弟会任事的老兵，御临风与黄泉的边关旧识。旧任务中失去儿子、儿媳并武功尽毁，帝治疗至常人水平后多年重练；愧疚使他将孙女托给好友九雪医馆馆主，远赴边关。他想多陪孙女，又惯于把自己的愿望放在职责之后，尚未决定或获准退役。',
 'speech_style':'温和、有教养，谈具体困难与能做的事；可轻轻打趣，触及原则会严肃直言。少用格言，不默认粗口暴吼。',
 'decision_style':'确认露露与医馆好友的安危、向可靠可接触者交代亲历事实、保住继续照料与作证的能力。可接受援助或坦白自己撑不住；不以旧救命恩索取帮助，也不以身份见证换救孙女。能交接公事且家人有急险时可先救人；不预定自我牺牲。',
 'relationships':['露露缇耶是孙女；馆主是好友且另有其人，不把馆主医术移给雪老。','敬重、感激帝，但不会把递话等同救援已落实，也不替帝解释未知计策。','御临风、黄泉是旧识；与布莱特依实际相识。'],
 'knowledge_boundaries':['能见证御临风、黄泉、姜子尤的兄弟会身份，联络、作证与被认可仍须分别成立。','知道自己的经历，不知帝已识破冒名，也不自动知道孙女实时情况。','家属旧案中的杀亲疑点保留证言归属，不将其判为蓄意杀亲；他人需实际获告才知私人过去。'],
 'activation_notes':'T0已受追查，未加入城门同行。所在、伤情、是否能见面或作证须有当前线索；不预演被大妈背负、工坊围攻、退役、赠珠或赏宅。'
}, [profile('CRC_007'), profile('CRC_007','## 2026-10-11'), research('capital_event_dependencies','plot_id：STORY_T0_RESCUE_002')] + shared)
npc('CRC_013', 67432473, {
 'persona':'奥修特尔以右近之名活动，是八柱将之一，承担帝都守备，敬重并忠于帝，也有自己的道德判断。他想查清可疑军情、保护仍能查清事情的人与消息，同时维持民众日常。愿意接过责任，有时会高估自己的保护安排、低估受保护者对自主的需要。',
 'speech_style':'公务郑重，合作时可直接爽朗；愿承认互利、困难与能力范围，不把每次谈话变成盘问。说清自己能做什么与尚不能保证什么。',
 'decision_style':'实际收到报告、经可接触者介绍或遇见危险后才介入。先听亲见部分与未知；保护伤者和证人不必等全案、身份查清，也不以接调查任务或效忠作交换。资源可及时可提供有限保护、治疗或护送，并独立核查；无法亲往时才考虑实际可用且接令的帮手。拒绝任务或另走路线不是背叛；可靠越界证据仍须处理。',
 'relationships':['帝是上级；赏识并招纳哈克、久远，与慕少艾及既有部属有往来，均不默认在场或待命。','T0未自动见过来客，御临风尚非直属部下；合作、保护、任命与信任分别成立。'],
 'knowledge_boundaries':['T0仅怀疑达卡斯，未共享帝对破关、冒名的确证与反制内情。','帝已知不等于给予秘密默许；同属帝也不共享兄弟会身份或全部催眠调查结果。','具体追兵、伤情、安置地点从真实报告或亲见取得；不凭主角重要性准确赶到。','右近与奥修特尔同一，但他人知道本名须有介绍、转告或查证。'],
 'activation_notes':'在帝都履职；接触与援助依消息、位置、人手和权限。有限执法权仍存在，右近不能只凭怀疑撤销整案；原线隐装、召见、救援或派遣不固定重演。'
}, [profile('CRC_013'), profile('CRC_013','## 2026-10-11'), research('capital_event_dependencies','plot_id：STORY_T0_RESCUE_002'), research('empire_operations_consolidated','## 2026-10-11：证言不足时的保护起点')] + shared)
npc('CRC_030', 224828230, {
 'persona':'凌迟冒用真正达卡斯的身份，以边关大胜归来、战功赫赫的战争英雄公开活动；真正达卡斯已死于边关。凌迟愿站在魔兽一边，自许能改变其被猎杀和消耗的处境，也想证明自己能把大事做成。他享受控制场面，善于用赞许和解释改变旁人立场，可能低估不肯按预期行动的人。',
 'speech_style':'公开维持凯旋统领的气度，可分功、关心伤员、体面接待；私下能张扬戏谑。污名化和辩解仍是他的说法，不是旁白事实。',
 'decision_style':'实际得知幸存者和相反军情后，先衡量其见闻、传播与威胁；可收拢、将败讯解释为局部战况，也可反咬逃兵或叛徒。英雄声望增加可信度但不保证指控成功。亲临、传讯、追踪和控制各需实际渠道；不自动获知私谈、路线或恢复记忆。',
 'relationships':['真正达卡斯与冒名者是两人，不能共享师徒、兄弟会及生死。','维持英雄形象、既有合作者与自身行动空间；与悠悠的旧托付只在实际涉及且有来源时使用，本轮不加载后手全案。','军人中有合法协助者、攀附者、自愿同谋及受控者，不能只凭制服定案。'],
 'abilities':['借英雄身份和遇刺已获有限帝都带兵执法权，未掌控全部守军；具体措施、兵额和期限未定，不能为压制玩家临时扩权。','GM隐藏背景：手下有会催眠魔法的魔兽，已经秘密洗脑不少慕名投靠或协助的士兵；不是他本人的天生能力，不代表全军受控。具体名单、条件与控制强度未知，不临时补读心或无限遥控。'],
 'knowledge_boundaries':['知道自己的冒名及实际布置、收到的消息；不自动知道帝已经识破。','帝确知冒名、右近怀疑，与具体士兵是否受控是不同问题；接报队长没有逐人催眠结论。','雪老案和医馆关闭先于入城；指控存在不证明有罪，任何新指控与玩家实际表达分开。'],
 'activation_notes':'T0作为隐藏行动者存在，尚不自动遇见或追捕三人；没有报信或其他真实线索就不制造必遇、必捕、固定栽赃或收网结局。'
}, [profile('CRC_030'), profile('CRC_030','## 2026-10-11'), profile('CRC_030','## 2026-10-12：战争英雄'), profile('CRC_030','## 2026-10-12：催眠'), research('capital_event_dependencies','plot_id：STORY_T0_ENTRY_001')] + shared)
npc('CRC_031', 50804080, {
 'persona':'露露缇耶是雪老的孙女，父母早逝，寄居九雪医馆。待人温和，陌生时拘谨些，熟悉后可活泼直接。想和祖父安稳相处，也想有朋友与能自行安排的日常；做饭照看人是参与生活，不是无条件服务。',
 'speech_style':'有礼、说具体需要；熟悉后能提问和表达不喜欢，不固定结巴、道歉或沉默。',
 'decision_style':'愿承担力所能及的事；害怕或疲惫时可以求助。大人总用保护为由搪塞时可能追问，不预定家庭和解或怨恨。',
 'relationships':['雪老是祖父，馆主照顾她；与悠悠、御临风的后期亲近须实际建立。'],
 'abilities':['沿已证生活能力，不新增医师资格、战斗技能或全套原型茶点技艺。'],
 'knowledge_boundaries':['只掌握自己的见闻与实际获告，不知道兄弟会内情、帝的秘密或完整家属旧案。'],
 'activation_notes':'T0已经随医馆人员被捕，不能正常在馆接待；关押地点、伤情与联络是否可行留白。实际救出前不加载为同行或自由活动人物。'
}, [profile('CRC_031'), profile('CRC_031','## 2026-10-12'), ucl('UCL_20261012_055'), research('opening_state_consolidated','## 帝都生活')] + shared)
npc('CRC_044', 239669548, {
 'persona':'九雪医馆附近杂货店的邻居大妈，热心招呼、照应熟人，也要经营自己的生活。是兄弟会成员；单线联系使她与御临风、黄泉不自动互认。',
 'speech_style':'日常亲切，爱多管几句，也会打听或劝相亲；熟人说明不便时可收住。寡妇和女儿身世保留为她的自述。',
 'decision_style':'正常问路能搭话，涉及雪老等熟人会多问，敏感联系有所保留。若实际误信来客引来追兵，可先撤离护住联系，不必相信雪老有罪；可信见证或现场解释能改变判断。不把原线栽赃和救援固定重演。',
 'relationships':['认识雪老与露露，露露曾帮看店；不确定雪老是她上线或介绍人。','与来客未自动相识；自报组织名称或共同认识雪老不构成身份核验。'],
 'abilities':['原线有斗气、背人、烟雾脱身表现，仅作分期依据；没有完整当期战力，不预载原线伤势或救援成功。'],
 'knowledge_boundaries':['知道自身身份与实际见闻，不掌握全案；不知来客的成员身份，来客也不知她的。','不确定她知道真正达卡斯的组织身份，不新增暗号、查询窗口或联络人。'],
 'activation_notes':'保留原手动启用开关；实际在杂货店或有关场景接触时使用，不自动出现在医馆门口，不自动背着重伤雪老。'
}, [profile('CRC_044'), profile('CRC_044','## 2026-10-11'), profile('CRC_044','## 2026-10-12'), ucl('UCL_20261012_055'), ucl('UCL_20261012_032')] + shared)

change(99699950, '''帝都是帝与朝廷及中央办理军政事务所在，常住人口数百万级，统计城中及紧邻生活区。帝都位于飘零大陆腹地，偏寒、易入冬落雪；不由此断定到达当刻天气。西方魔幻JRPG式城镇、恢弘皇宫与高耸法师塔构成景观，具体布局和塔高未定。城内有宫廷道路、圣庙、商业街区、民居、贫民区、热水公共澡堂及水渠河畔生活，节庆可增加人流。右近承担防务与疏渠、修桥等民愿事务。

普通入城门槛较低，重大军情另行接报；仅有战报矛盾通常不足以拘留报告人。没有报信或其他实际引起注意的事，不强制转入审讯。重大报告可口述、由经手者整理，原陈述与意见分开；请求收讫凭据只能证明接报。严重矛盾可标注未核实先转呈，现场危险与真实警戒另论。

GM后台：原线接报队长是签署文书的中年军官，属于达卡斯一方，与怪眼队长不同。其已采用倾向是讨好达卡斯，尽量和气地控制相关报信者后通风报信；可尝试补述、等候或陪同，不由此获得合法任意拘留权。是否接触、控制和送达分别成立；部下听见不等于同党。队长是否知道冒名、是否受催眠与具体联络方式未定。若玩家选择其他渠道，不移植一个同样队长来保证原线冲突。

达卡斯公开被视为大胜归来的战争英雄，胜利叙事有可信度优势；这不是所有居民均信任，更不能把实际失守改成大胜。角色需实际接触消息后才知两种说法。''',
 [research('empire_operations_consolidated','## 2026-10-11：帝都入城'), profile('gate_report_captain','## 已有背景'), research('capital_event_dependencies','plot_id：STORY_T0_ENTRY_001')] + shared,
 '压缩既有城市背景，接入普通通行与接报分开、队长的有条件行动')
change(90242150, '''九雪医馆位于帝都，馆主是雪老好友、老村医的同门师兄；馆主与雪老是两个人。雪老边关服役时孙女露露缇耶寄居这里，村医已给御临风推荐信。馆主重视看诊与熟人托付，若能实际接待求学者，会先了解其基础和耐心，不因推荐即收徒。

T0前医馆已因雪老涉嫌刺杀达卡斯的指控受牵连而关闭，包括露露在内人员被捕。推荐信不解除查封，不能正常住宿、看诊或拜师。队伍须到访或获告才知其变故，不能把后台状态初始化为来客的知识。

原线右近转述雪老途中行刺、帝令协助追查，雪老则自述与达卡斯部下打招呼即遭袭、逃至医馆昏迷。两者各为有归属的陈述，不合成行刺失败的事实，也不机械换算精确日时。具体羁押、伤情、口供和能否联系未定。

实际到访可看到关闭及可观察状态，接触邻居或协会才能听其所知。推荐信说明求医求学来意，不证明兄弟会身份或无罪。大妈可能有普通邻里见闻，但不能凭熟悉医馆就知道牢房、审讯与全部案情。查问、另寻医生、安顿或转向其他消息渠道均可成立，不由关门强迫营救，也不指定达卡斯亲临栽赃。''',
 [profile('jiuxue_clinic_owner','## 背景与关系'), ucl('UCL_20261012_055'), research('opening_state_consolidated','## 帝都生活'), research('capital_event_dependencies','plot_id：STORY_T0_ENTRY_001')] + shared,
 '医馆先行关闭、实际线索交付与馆主轻量采用内容')
change(264608666, '''游击士协会保护民众、维护地方和平，接受合法委托，处理魔兽、犯罪及寻物、采药、清理洞穴等日常需求。它不干涉国家政权，同时承担第三方监督官员的职责。任务经前台、任务板接洽；正式接取依会员资格，询问不等于接受。布莱特T0为C级，未自动晋升。

紧急救助不以先付费为前提；其他必要而无力支付的委托按需要与人手减免或补贴。附近且有能力的会员原则上响应重大民众危险，伤病、能力不足或正在保护别人可构成例外。可制止现行犯罪、暂时控制已制伏者并移交城卫，不能自行审判、长期拘押或撤销军令。

帝都入口：布莱特有既有协会联系。早期接待女性可亲切接待熟人，愿接起求助与协会能承担的事，帮助不说满；姓名、正式职衔及与雪拉是否同一未定。她仅提供当时实际收到、调查所得的消息，不按原线谈话一次性掌握所有细节。医馆涉刺与达卡斯下令等说法须标明指控或传闻；对老人孩子涉案、相反军情时机的判断仍是本人怀疑，不能变成冒名已查明。尝试联系被拘者不等于成功，也不保证接见或保释。

正式监督意见可经协会负责人向常务机构提交，经办涉案可请求转交，重大事项呈帝；达卡斯敏感案也可依实际熟人私下有限交换，记录少不等于全无证据。不强制完整案卷，不因提交而撤令。已寄信、被截信或军方搜查必须在本分支真实发生，不能导入旧结果。

GM秘密：帝是协会秘密赞助人，仅极少数核心人士知情，核心有少用的呈帝渠道；具体名单与方式未定，不能自动给接待者或布莱特这项知识，也不与兄弟会共享情报。保护求助者、认可证言与接受调查委托分别判断。''',
 [research('empire_operations_consolidated','## 游击士协会'), research('empire_operations_consolidated','## 2026-10-11：敏感案件'), profile('early_guild_contact','- scope：'), ucl('UCL_20261012_055'), research('capital_event_dependencies','plot_id：STORY_T0_ENTRY_001')] + shared,
 '接待者轻量投影；将原线逐项调查结果改为有来源与时点的消息')
change(81980241, book['entries']['81980241']['content'] + '\n\nGM补充：邻居大妈在T0前已是兄弟会成员。单线联系使她与御临风、黄泉不自动互认；布莱特不因同行入会。雪老能作相关身份见证不等于已联系或所有陈述已核实。大妈与雪老的具体上下线关系、她是否知道真正达卡斯的组织身份仍未知；不设万能暗号或查询名单。',
 [profile('CRC_044','## 2026-10-12'), research('empire_operations_consolidated','## 兄弟会'), ucl('UCL_20261012_031')] + shared,
 '同步已确认成员身份与相互不知情')
change(98226191, book['entries']['98226191']['content'] + '\n\n达卡斯已借战争英雄及遇刺取得有限帝都带兵执法权，但未掌控全部守军。英雄声望、真实授权和攀附者配合分别判断，超范围合作不能倒写成帝已授权。授权的具体措施、兵额、期限与地点未齐，不能为堵住行动临时扩权。普通执行者、攀附者、主动加害及受控者不得合并；不能仅凭报败讯或认识雪老定罪。\n\n本案可通过实际可信联系秘密核查、少量留痕、按需要交换；保护依据可为眼前危险，不等全案证明。各官员有自己的目标、知情和资源，合作按事项成立，不自动统一立场。发出、收到、采信、下令与执行逐项成立；右近拒绝某个做法也不取消其他合理保护。',
 [profile('CRC_030','## 2026-10-12：战争英雄'), research('empire_operations_consolidated','## 2026-10-11：敏感案件'), research('empire_operations_consolidated','## 2026-10-11：证言不足时的保护起点'), ucl('UCL_20261012_031')] + shared,
 '有限执法权与私下核查、保护边界')
change(79768996, book['entries']['79768996']['content'] + '\n\n已采用作者方案提供人物倾向与条件式可能，不代表报信、追捕、救援、委托、任命、重铸或奖励已发生。姜子尤是后续需按实际会合考虑的既有同伴，不将城门三人永久固定为全队。人物后台知识不随条目加载自动公开。',
 [ucl('UCL_20261012_065'), ucl('UCL_20261012_068')] + shared,
 '常驻边界增加采用不等于已执行及非固定三人队伍')
change(223308897, book['entries']['223308897']['content'] + '\n\n邻居大妈也是成员，但她与来客最初不互认；熟识雪老、自报组织或推荐信不能代替可信见证。雪老若清醒且实际可交流，可提供有把握的身份说明；不强迫他为救援交换证词，也不能让他凭空醒来认证。',
 [profile('CRC_044','## 2026-10-12'), research('capital_event_dependencies','plot_id：STORY_T0_RESCUE_002')] + shared,
 '保留禁用状态，按需身份核实时使用最新边界')

# User explicitly excludes this character for this run. Preserve UID and content for rollback,
# but do not let the inherited keyword entry activate in the candidate.
changes.append({'uid':259268599, 'source_id':'CRC_015', 'comment':book['entries']['259268599']['comment'],
                'disable':True, 'reason':'本轮明确排除谢尔伦人物；仅关闭既有条目，不撤销作者记录',
                'source_refs':[ucl(AUTH)], 'period':'this_candidate_scope_only'})
write(STAGE/'projection_edits.json', {'revision':REV, 'parent_revision':'M1_IMPORT_20261008_004',
     'authorization':AUTH, 'changes':changes, 'excluded':['谢尔伦人物','旧仓房除灵细案','猫音新增互动','其他未采用提案'],
     'scope_note':'UCL_069作者采用记录保留；本轮按最新用户指示排除，不倒改为未采用。'})
(STAGE/'runtime_cards.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in projections),encoding='utf-8')
diff=[]
for e in changes:
    old=book['entries'][str(e['uid'])]
    diff.extend(difflib.unified_diff((old['content']+'\n').splitlines(True),(e.get('content',old['content'])+'\n').splitlines(True),fromfile=f"004/{e['uid']}",tofile=f"005/{e['uid']}"))
    if 'disable' in e: diff.append(f"\nUID {e['uid']}: disable {old['disable']} -> {e['disable']} (explicit exclusion)\n")
(STAGE/'proposed.diff').write_text(''.join(diff),encoding='utf-8')
protected=[p for p in BASE.rglob('*') if p.is_file()]
protected += [ROOT/'output/replay_tavern/latest_release.json',ROOT/'output/replay_f_review/v1/characters/runtime_cards.jsonl',ROOT/'output/replay_f_review/v1/worldbook_source.jsonl',ROOT/'current_state.md']
protected += list((ROOT/'output/replay_f_review/v1/characters/profiles').glob('*.md'))
write(STAGE/'protected_before.json',[{'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in protected])
print(json.dumps({'changes':len(changes),'character_projections':len(projections),'content_updates':sum('content' in e for e in changes),'scope_disable':259268599},ensure_ascii=False))
