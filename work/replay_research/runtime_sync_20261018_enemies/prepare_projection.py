"""Prepare 007 content and source-location changes without writing runtime files."""
from pathlib import Path
import copy
import difflib
import hashlib
import json

ROOT=Path(__file__).resolve().parents[3]
STAGE=Path(__file__).resolve().parent
W='work/replay_research/'
CARD_SOURCE=W+'capital_enemy_builds_rewards_draft.md'
BASE=ROOT/'output/replay_tavern/story_guidance_20261018_candidate'
def read(rel): return (ROOT/rel).read_text(encoding='utf-8-sig')
def ref(rel,marker):
    matches=[i+1 for i,s in enumerate(read(rel).splitlines()) if marker in s]
    assert len(matches)==1,(rel,marker,matches)
    return {'path':rel,'line':matches[0],'locator':marker}
def save(name,obj): (STAGE/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

book=json.loads((BASE/'import/901_剧情向主持_M1_20261018.json').read_text(encoding='utf-8'))
approval=ref(W+'user_clarifications.md','## UCL_20261018_006')
common=[approval,ref(CARD_SOURCE,'## 一 构筑口径与使用方法'),ref(CARD_SOURCE,'## 七 XP建议与结算实例')]
changes=[]
def update(uid,content,refs):
    old=book['entries'][str(uid)]
    changes.append({'uid':uid,'comment':old['comment'],'source_id':old['extensions']['901_replay']['source_id'],'entry_type':'concept' if uid==79768996 else 'character','content':content,'source_refs':common+refs,'operation':'update_content'})

uid=79768996
s=book['entries'][str(uid)]['content']
s=s.replace('达卡斯略高但不自动T8','真正达卡斯略高但不自动T8；凌迟冒名不继承其战力')
old='同一贡献不重复计奖，数额由主持明确，节点可0；不新增固定怪物价表，沿现有成长费用与特殊资格。'
assert old in s
s=s.replace(old,'同一贡献不重复计奖，数额由主持明确，节点可0；采用本批帝都场景XP基准，不建立T档统一价目，沿现有成长费用与特殊资格。')
s+='''

帝都已采用敌人基准：城卫T1、部属老兵T2、法阵安装者T1战斗定位、石像T3、催眠魔兽T3控制定位、Chuul T4、古雷姆林常态T5。短卡只约束实际适用的能力与参数，不迫使逐轮战斗，也不穷尽NPC合理能力；局部例外不授予所有角色。简化可省过程，不能刷新伤势、魔力、控制、位置或已破坏通路。有效新能力沿同体系与当期实力补足、保持连续；不能临时提高已定防护或抵消成功准备。人物未到场、未知名单和已经完成的结果不由条目加载重置。

奖励是御临风个人XP，同行NPC不机械分走份额：稍难独立敌人1，四人搜捕阻拦整体2，石像2，催眠魔兽3，Chuul 4，古雷姆林5；独立阵路挑战1—3。是否发放看事前真实威胁、贡献与取得的成果，准备、合理克制、争取支援与简化不自动减奖。有效捕获或可靠排除同一威胁可获同档成果奖；旁观和已制伏后补刀不追加。石像2+古雷姆林5可分别发；若先破石像、打断加害并救下A而古雷姆林逃走，可先给2+3，其中3是本案5XP成果的先行部分，后来完成同一追捕补2。不同独立危机另列，同一成果不再按节点重发；XP和报酬只在实际获得后入账。玩家强度估算实验继续后置。

短卡计算约定：六属性按力量／敏捷／智力／感知／意志／风度排列，E为主技能加一个匹配子技能；E=5本身不给自动成功，按属性与实际主／子等级分别计算。A是901自动成功，适用时即使骰子0成功也计入；每次攻击只扣一次适用防御，最终成功受列明伤害上限与防护约束。伤势用B／L／A槽，不能把HP归零直接写成死亡；完整程序未执行不得声称已机械保存。'''
update(uid,s,[ref('output/replay_f_review/v1/gm/host_rules.md','## 节点、挑战与击杀XP'),ref(CARD_SOURCE,'### 数值读法')])
uid=224828230
s=book['entries'][str(uid)]['content']
old='具体名单、条件与控制强度未知，不临时补读心或无限遥控。'
assert old in s
s=s.replace(old,'催眠魔兽的施术条件、点数抵抗、持续和具体短卡已采用；逐人受控名单仍须实际依据，不能把全部士兵设为受控。抓获或杀死施术者不解除旧影响，不临时补读心或无限遥控。')
update(uid,s,[ref(W+'capital_arrays_hypnosis_rules_draft.md','# 峡谷法阵与催眠'),ref(CARD_SOURCE,'## 四 催眠魔兽 T3')])

additions=[]
def add(source_id,comment,kind,keys,content,section,extra_refs=()):
    uid=int(hashlib.sha256(source_id.encode()).hexdigest()[:7],16)
    assert str(uid) not in book['entries'] and uid not in {e['uid'] for e in additions}
    additions.append({'uid':uid,'comment':comment,'source_id':source_id,'entry_type':kind,'keys':keys,'content':content.strip(),'source_refs':common+[ref(CARD_SOURCE,section),*extra_refs],'operation':'add'})

add('007_CAPITAL_GUARDS','帝都守卫对抗','concept',['钟塔维修间','雪老救援','达卡斯部属'],'''
帝都条件式对抗参照｜已采用，未绑定实际交战。
雪老救援既定搜捕者为两名部属老兵、两名协助城卫；不新增人数、不预判全部受控或必然开打。普通军人可核令、交接、退让或求援。
城卫T1：六属性3/3/2/2/2/2，体积5；HP8，基础防御2+轻甲1=3，速度11米，先攻5。白刃2+制式短兵1、肉搏2、运动2、求生1、侦查2+巡逻1。兵刃2L、触及1.5米，标准动作8DP−目标防御，无A，上限8L；普通擒抱接触命中后5DP对抗。
老兵T2：六属性4/4/2/3/3/3，体积5；HP9，基础3+甲2=防御5，速度13，先攻7。白刃3+常备兵刃2、肉搏3+擒抱1、运动3+急行1、求生2、侦查3。兵刃3L、触及1.5米，标准动作12DP−防御，无A，上限12L；擒抱对抗8DP。持兵刃花移动动作可得适用白刃格挡5至下次行动开始，非常驻防御；甲不另供DR。
仅驻处介入已经指定的内侧守卫套用老兵及残留魅惑5点：重度门槛3，额外抵抗min(意志3,风度3)+求生2=5DP。其已受控是场景条件，不追溯掷骰；别人不自动同样受控。受控不增加力量、HP或行动次数。
御临风确有贡献时，单个真正构成挑战的敌对老兵可1XP；四人阻拦的救援遭遇整体2XP，不再按四个人重复累计。普通交接不自动发战斗XP，实际解决的交涉／救援挑战可奖。已制伏后补刀不追加。
''','## 二 人形守卫与施工人员',[ref(W+'capital_rescue_playable_draft.md','# 雪老救援主持稿'),ref(W+'capital_intervention_playable_draft.md','# 帝介入后的收网主持稿')])

add('007_ARRAY_INSTALLERS','法阵安装者','concept',['法阵安装者','帝都近郊峡谷'],'''
峡谷实际布置中的四名安装者，T1战斗定位，不因安装传奇预制法阵获得传奇战力，也不由条目加载自动到场或追加人数。
六属性2/3/5/4/3/2，体积5；HP7、防御3、速度10米、先攻5。魔法4+法阵安装2、学术3+术式识读2、白刃1、运动2、求生1、侦查2。短刃1L、触及1米，标准动作4DP−防御，无A，上限4L。需要施工／诊断检定时智力+有效魔法=11DP，无A；知识技能本身不授予新攻击法术，合理能力补充沿主持原则。
结界阻挡其边界的实体穿越，封印限制越界空间转移；不是全域封法、吸命或思想读取，两阵分别运行。每阵须实际完成阵路、节点、供能且操作者知道方法，标准动作启动一阵，随后自持。杀死安装者不使已运行法阵停机；破坏关键阵路／节点停止相应一阵，不自动引爆另一阵。修复须实际材料、人员与时间，不一个动作复原。充分条件下的普通破坏无需强制检定。
施工人员通常0击杀XP；阻止启动、排除实际阵路危险或独立救援可按1—3个人XP，不按四人人头累计。两阵分别取得的独立成果可分列，同一成果不重复算节点。
''','### 法阵安装者 T1战斗定位',[ref(W+'capital_arrays_hypnosis_rules_draft.md','# 峡谷法阵与催眠'),ref(W+'capital_canyon_investigation_playable_draft.md','# 峡谷三处调查主持稿')])

add('007_CHUUL','旧涵洞Chuul','concept',['Chuul','旧涵洞'],'''
旧涵洞讨伐的单只Chuul，采用2014原型的水陆呼吸、暗视、魔法感知、巨螯与触须毒；不导入喷流、软囊弱点、主人、小怪或宇宙史。御临风、黄泉、布莱特、姜子尤须实际会合，不自动携带未来装备或奖励。
T4；六属性8/3/2/4/4/1、体积7；HP17，基础3+甲壳2=防御5，陆行／游泳18米，先攻4；肉搏4+螯钳2、运动3+游泳2、求生3、侦查3+水下感知1。未列防护无来源不生效，甲壳不再追加DR。
螯击：标准动作，触及3米，18DP−防御+力量A1，伤害上限18L。命中后可用同一螯免费尝试擒抱，14DP+A1；目标以力量+有效肉搏或敏捷+有效运动对抗，依PHB算体积差。每螯最多夹一名体积≤7目标，占用螯不攻击第三者，自身回合自由释放。夹持后的减值、牵带、防御、第三者误击及对已有擒抱目标的普通攻击沿PHB，非命中即定身。双螯连击需两只空闲螯，整轮占标准、移动、迅捷；各16DP−防御+A1，各上限18L，可同／不同目标；两击结算后分别尝试夹持，不能同轮移动或接触须。
触须毒为标准动作，只对已夹住且在3米内的一人，无附带螯伤；有效接触施加8点原始麻痹，以min(力量,意志)+有效求生抵抗，剩余点数不低于0，超过max(力量,意志)才定身。无毁灭性效果；每个目标自身回合结束可再次抵抗削减点数，不占动作，最长1分钟。重复毒并列取最高、保留来源，不叠加；有效抗毒／免疫照常。Chuul免疫毒素，不免疫所有麻痹。
暗视18米；魔法感知36米仅给持续或正在运作魔法的存在与大致方向，不读身份、卡面、用途或未施展能力，不把所有异能当魔法，隔绝侦测仍有效。入口宽4米、步道1米、弯段水深1.5—2.5米、平台约6×5米、支洞1.2米且它不能正常穿过；水位依实际变化。可夹持并尝试向水域牵带或受创退却，均按真实行动，不自动拖人入水，不补活人质。
解决持续威胁建议御临风个人4XP，按实质贡献而非最后一击；有效捕获／转移可同奖，准备、求援与简化不自动减奖。击杀可当场发，回城不重复奖同一次清除。风七曜石和团队金币依原委托实际兑现，不由条目加载获得。
''','## 三 旧涵洞Chuul T4',[ref(W+'capital_high_risk_hunt_draft.md','# 高危讨伐')])

add('007_HYPNOSIS_BEAST','催眠魔兽','concept',['催眠魔兽'],'''
凌迟部属中已存在的催眠施术者，种族外貌姓名仍未补定；T3来自有条件的心智威胁，不是T3肉搏水平。具体到场、受控名单与位置沿当前驻处场景。
六属性3/4/4/5/5/5、体积4；HP7、防御4、速度11米、先攻9；魔法5+催眠3、肉搏1、运动2、求生2、侦查3、掩饰3。应急肉搏标准4DP−防御，无A，上限4B。催眠魔力6，每次2，本卡完成8小时长休回满，换场不恢复。
催眠：标准动作，单个10米内可受心智影响的目标；双方互相看见，目标理解话语才可施术。风度5+魔法5+催眠3=13DP，另加魔法主技能A1，最终成功为原始魅惑点数。目标以min(意志,风度)+有效求生抵抗；残留max(0,原始点数−抵抗成功)超过max(意志,风度)才迷情，1至门槛为轻度，0无影响；无毁灭性控制。
施术时明确一句指示及目标理解中的达卡斯为服从对象，不灌入整套计划；同类分别保留来源并列取最高。重复施术重新满足条件并付费，不能后台无限重试。持续至有效解除；离场、睡眠、撤权或施术者死亡不自动解除旧影响。明显送死或完全违背当事人道德的命令允许一次额外同式抵抗削减点数，降至门槛或以下退出迷情；普通军务风险不自动等于送死。无读心、改忆、远程感知／遥控或集体自杀效果；命令范围、知识、判断与身体能力仍有效。
可向实际保护者或出口移动；普通擒抱不附送沉默／封魔。失去真实施术条件才能阻止新催眠。法师塔短期研究后能逐人解除，不因施术者不在或拒供增设破解任务；此疗法不自动治悠悠原咒。
仍具施术、保护或逃逸威胁而被实际击败／捕获／阻止危害，建议个人3XP；独立定位与控制贡献可计，不给纯旁观者同奖。抓获不是全部解控，另有独立救治工作可分奖，同一控制成果不重发。
''','## 四 催眠魔兽 T3',[ref(W+'capital_arrays_hypnosis_rules_draft.md','# 峡谷法阵与催眠'),ref(W+'capital_intervention_playable_draft.md','# 帝介入后的收网主持稿')])

add('007_STONE_CONSTRUCT','试炼洞穴石像魔偶','concept',['石像魔偶','试炼洞穴'],'''
古雷姆林试炼洞穴入口已布置的一具石像及阵纹，按实际阶段启用，不增殖为无限波次。T3；六属性6/2/1/3/3/1、体积6；HP14、防御2、石质物理DR2、速度14米、先攻3。肉搏3+重击1、运动1、求生2、侦查2。石拳3B，触及2米，标准动作13DP−防御+力量A1，上限13B。
有效阵圈半径6米，仅在圈内触发与攻击，不能把力量传到圈外或临时远射，不自动追出山洞。感到圈内实际可定位活动，不获得墙后／远处全知。阵纹连接应可观察；充分条件与合适工具下切断暴露关键连接可停机，无须耗光HP；受干扰或仓促操作才按具体情况结算，不自动破坏其余布置，也不隔空免费重连。
无呼吸饮食、有机神经及可受魅惑的自主心智，免疫毒素、疾病、生物神经麻痹与魅惑；实体限制、位移、冻结按实际生效，不通免异常。B/L/A记构体损坏，本卡例外：完好槽归零即停机，不作活体昏迷及自然伤势恶化，全部A为彻底毁坏；实际修复才能恢复，离场不回满。
实际构成阻碍而被击破或有效排除，建议个人2XP；只是路过、早已停机或不构成障碍不凭T3发奖。与古雷姆林可各算一次，追捕节点不重复支付。
''','## 五 试炼洞穴石像魔偶 T3',[ref(W+'capital_gremlin_playable_draft.md','# 古雷姆林案件主持稿')])

add('007_CHARACTER_CRC_026','人物·古雷姆林','character',['古雷姆林'],'''
帝都案件中的古雷姆林与原实践课教师空、魔法师A的老师对应。按已采用早期案件启用条件，他已以Phantom活动并能用空的外貌接近旧识；不据此补定精确转化日期。无法接纳自身平庸、嫉妒真正天才，对女性秀发有执著；重新成为人类是次级愿望，不等于悔悟。旧教师记忆可用于接近与操弄，不是读心。A亲友的伤亡与转化依实际阶段，不预装原线惨案。
帝都常态T5；六属性8/10/5/7/6/5、体积5；HP15，基础防御7+身法闪避2=9，基础速度23米、先攻15。常态高速陆行=2×基础速度，当前46米／移动动作，不耗魔力，不加动作或攻击；实际伤势负重地形先影响基础速度。用于突进、换位与拉开，不是瞬移、穿墙、自动挣脱或取消脱离威胁范围攻击；失去闪避资格便失去身法2。
单刀3L、触及1.5米，标准19DP−防御+2A（力量与白刃主技能各1），上限19L。整轮双刀占标准、移动、迅捷，各17DP−防御+2A、各上限19L，可同／不同目标；不能另加46米免费移动，失刀不能凭空补刀。
土系魔力8，本卡8小时长休回满；土遁标准动作消耗2进入可用土层，地下每移动最多8米、不叠高速，出土标准动作，单次最长30秒、到期须在可用出口出土。沿松土、自然土层或本场已接通土系通路，不穿完整金属、虚空或已有效封死区段；不附隔层精确感知、地下攻击、解除拘束或回血。携人须满足负重与束缚条件，不能补出旧无直达出口。形态变化标准动作、不耗土系魔力；同一HP、消耗、位置与束缚，不任意冒充他人，也不清空本体能力。吸石进化、冲击波和第二条命不属于常态。
主持不轻易用高速让他退场：维持老师姿态、控制试炼、证明自己或嫉妒使他可能继续施压、换位和交涉；局部受挫不自动撤离。真正撤离仍按路线、距离与阻挡，不能为剧情临时关闭高速或保证必逃。有效封路与压制保持；不替御临风决定追击或领悟。土系、身法及双刀可合理补充适度用法，不凭此临场抬档或万能反制。
实际击杀或有效制伏仍构成重大威胁的常态敌人，个人5XP；先打断加害、救下A但敌人逃走，可先给本案成果3XP，后续完成同一追捕补2XP。石像的独立2XP另计，同一成果不按节点重发；新独立危机另看，未发生不预奖。
''','## 六 古雷姆林常态 T5',[ref('output/replay_f_review/v1/characters/profiles/CRC_026.md','## 2026-10-12：《假面骑士Wizard》'),ref(W+'capital_gremlin_playable_draft.md','# 古雷姆林案件主持稿'),ref(W+'user_clarifications.md','## UCL_20261018_005')])

reanchors=[]
changed_uids={e['uid'] for e in changes}
for uid,e in book['entries'].items():
    if int(uid) in changed_uids: continue
    refs=e.get('extensions',{}).get('901_replay',{}).get('source_refs',[])
    fresh=[ref(r['path'],r['locator']) if 'locator' in r else copy.deepcopy(r) for r in refs]
    if fresh!=refs:
        reanchors.append({'uid':int(uid),'comment':e['comment'],'source_id':e['extensions']['901_replay']['source_id'],'content':e['content'],'source_refs':fresh,'operation':'refresh_source_locators'})

projection={'authorization':'UCL_20261018_006','parent_revision':'M1_IMPORT_20261018_006','revision':'M1_IMPORT_20261018_007','changes':changes,'additions':additions,'source_reanchors':reanchors}
save('projection_edits.json',projection)
diff=[]
for e in changes+additions:
    old=book['entries'].get(str(e['uid']),{}).get('content','')
    diff.extend(difflib.unified_diff(old.splitlines(True),(e['content']+'\n').splitlines(True),fromfile=f"006/{e['uid']} {e['comment']}",tofile=f"007/{e['uid']} {e['comment']}"))
(STAGE/'proposed.diff').write_text(''.join(diff),encoding='utf-8')
inventory=json.loads((STAGE/'source_inventory.json').read_text(encoding='utf-8'))
for e in changes+additions+reanchors:
    for r in e['source_refs']:
        inventory['source_sha256'][r['path']]=hashlib.sha256((ROOT/r['path']).read_bytes()).hexdigest()
save('source_inventory.json',inventory)
print(json.dumps({'changed_content':len(changes),'added':len(additions),'refreshed_source_locators':len(reanchors),'new_entries':[{'uid':e['uid'],'title':e['comment'],'chars':len(e['content']),'keys':e['keys']} for e in additions]},ensure_ascii=False))
