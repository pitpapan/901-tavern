"""Reviewed declarative programs, sourced from each spell's maintained paragraph.
This writes execution contracts, not generated runtime JS or reading text.
"""
from pathlib import Path
import json,re,copy
ROOT=Path(__file__).resolve().parents[3];KIT=ROOT.parent/'901-resource-authoring-kit';DEST=KIT/'resources/execution'
P={'context':'P'};I={'context':'INT'};E={'context':'E'};CAST={'context':'cast'};SAVE={'context':'save'};DAMAGE={'context':'damage'};ACTUAL={'context':'actualDamage'}
def expr(op,*args):return dict(op=op,args=list(args))
def n(x):return expr('mul',x,P)
def floor(x):return expr('floor',x)
def frac(a,b):return floor(expr('div',n(a),b))
def minus(a,b):return expr('max',0,expr('sub',a,b))
RE_ENERGIES=['pure','fire','cold','electric','acid','sonic','light','holy','unholy']
ENERGY_DAMAGE={'all':[{'test':'eq','left':{'context':'kind'},'right':'energy'},{'test':'in','left':{'context':'energyType'},'values':RE_ENERGIES}]}
R=expr('mul',10,I,P);S=expr('mul',5,I,P)
def damage(amount,energy,**kw):return dict(op='damage',amount=amount,energy=energy,**({'severity':'L'} if 'severity' not in kw else {}),**kw)
def save(type='reflex',penalty=0):return dict(op='save',type=type,penalty=penalty)
def status(type,points,**kw):return dict(op='status',type=type,points=points,**kw)
def bonus(stat,value,group,when=None):return dict(stat=stat,value=value,group=group,**({'when':when} if when else {}))
def effect(effects,**duration):return dict(op='effect',effects=effects,**(duration or {'scene':True}))
def trigger(event,steps,**kw):return dict(op='trigger',event=event,steps=steps,**kw)
def isctx(field,value):return dict(test='eq',left={'context':field},right=value)
def program(steps,action='standard',target='single',check=False,cooldown=0,range=R,**kw):
 return dict(action=action,target=target,casting=True,components=['posture','language','focus'],range=range,steps=steps,
  **({'check':{'attribute':'智力','skill':'神秘'}} if check else {}),**({'cooldown':cooldown} if cooldown else {}),**kw)
def attack(weapon,energy,ap=0,magic=0,speed=0,energyWeapon=True,contact=False,after=()):
 return [dict(op='attack',weapon=weapon,ap=ap,magic=magic,speed=speed,contact=contact,energyWeapon=energyWeapon),damage(DAMAGE,energy,energyWeapon=energyWeapon,weapon=weapon),*after]
SCHOOLS=['创造','变化','召唤','咒法','塑能','幻术','心灵','死灵','治愈','炼金','结界','诅咒','防护','附魔','预言']
def parse_schools(text):
 names='|'.join(SCHOOLS)
 subs=re.findall(r'神秘[·・]('+names+r')',text)
 if not subs:
  head=text.split('；')[0].split('，')[0]
  candidate=head.split('／')[-1] if '／' in head and not any(x in head for x in ['两子技能','相应子技能']) else head.split('／')[0]
  subs=re.findall(names,candidate)
 subs=list(dict.fromkeys(subs))
 both=len(subs)>1 and ('双专业' in text or '均须' in text or '均需' in text or '或' not in text.split('／')[0])
 return subs,both

def parse_components(text):
 excluded=' '.join(re.findall(r'(?:无|不需|无需|免除)[^；。]*',text))
 return [key for label,key in [('姿势','posture'),('语言','language'),('专注','focus')]
         if label not in excluded and (label in text or key=='focus')]

PROGRAMS={
 '魔法飞弹':program([damage(expr('add',frac(1,3),{'context':'legendaryINT'}),'force')],cooldown=1),
 '火焰冲击':program([save(penalty=CAST),damage(minus(frac(3,2),SAVE),'fire')],action='swift',check=True,cooldown=1),
 '火球术（射弹）':program(attack(n(2),'fire',after=[status('燃烧',expr('min',ACTUAL,n(2)),resistance='none',properties={'fireKind':'magic','tickBoundary':'turn','stacking':'add'})]),cooldown=2),
 '寒冰箭':program(attack(n(2),'cold',after=[status('冻结',expr('min',ACTUAL,n(2)),resistance='none',properties={'stacking':'add'})]),cooldown=2),
 '寒冷新星':program([save('fort',CAST),damage(frac(2,3),'cold'),status('冻结',minus(n(2),SAVE),resistance='none',properties={'stacking':'add'})],target='area',check=True,cooldown=3,area={'center':'self','radius':S,'team':'all'},precise=False),
 '暗影箭':program(attack(frac(5,3),'acid',magic=n(2),speed=n(2)),cooldown=1),
 '献祭':program([status('燃烧',frac(3,2),resistance='none',properties={'fireKind':'magic','tickBoundary':'turn'})],cooldown=1),
 '旋风护盾':program([effect([bonus('defense',n(4),'force')])],range=1.5,willing=True),
 '魔爆术':program([save(penalty=CAST),damage(minus(n(2),SAVE),'pure')],action='swift',target='area',check=True,cooldown=2,area={'center':'self','radius':S,'team':'all'},precise=False),
 '爆炸火球':program([save(penalty=CAST),damage(minus(frac(5,2),SAVE),'fire'),status('燃烧',minus(frac(5,2),SAVE),resistance='none',properties={'fireKind':'magic','tickBoundary':'turn'})],action=['standard','swift'],target='area',check=True,cooldown=3,area={'center':'point','radius':S,'team':'all'},precise=False),
 '茜卓扬焰':program([save(penalty=CAST),damage(minus(frac(5,2),SAVE),'fire'),status('燃烧',minus(frac(5,2),SAVE),resistance='none',properties={'fireKind':'magic','tickBoundary':'turn'})],target='area',check=True,cooldown=3,area={'center':'self','radius':R,'team':'all'},precise=False),
 '阳炎炮':program(attack(frac(5,3),'pure',ap=n(2),magic=n(2),speed=n(2),contact=True),cooldown=1),
 '瘴气弹':program(attack(n(2),'poison',energyWeapon=False,contact=True),cooldown=1),
 '恐惧术':program([save('will'),status('恐惧',expr('min',minus(CAST,SAVE),n(3)),resistance='none',properties={'decayPerRound':1})],check=True,cooldown=1),
 '心灵震爆':program([save('will'),damage(expr('min',minus(CAST,SAVE),expr('add',n(4),E)),'mental',severity='B')],check=True,cooldown=1),
 '虚弱诅咒':program([save('fort'),status('疲乏',expr('min',minus(CAST,SAVE),n(3)),resistance='none',properties={'decayPerRound':1,'scene':True})],check=True,cooldown=1,effectTypes=['curse'],effectGradeBonus=1),
 '风行术':program([effect([bonus('speed',n(30),'enhancement')])],range=1.5),
 '大地之力':program([effect([bonus('attribute',frac(4,3),'enhancement',isctx('attribute','力量'))])],range=1.5),
 '护体石肤':program([effect([bonus('naturalDefense',n(4),'natural')])],range=1.5),
 '法术抗力':program([effect([bonus('spellResistance',n(3),'spellResistance')])],range=1.5),
 '侦测潜行':program([effect([bonus('check',n(4),'enhancement',isctx('purpose','detection'))],minutes=expr('mul',I,10))]),
 '识破隐形':program([dict(op='capability',id='detectInvisibility',gradeBonus=1,senses={'D':['blindSense'],'C':['blindSense','blindSight']},rangePolicy='existing-senses',lineOfEffect=True,scene=True)],range=1.5),
 '通晓语言':program([dict(op='capability',id='allLanguages',modes=['listen','speak','read','write'],supernaturalWords=False,minutes=expr('mul',I,60))],range=1.5),
 '赫里斯塔莎前知综合预警':program([effect([bonus('ignoreSpeed',n(2),'divination')],minutes=expr('mul',I,60)),dict(op='capability',id='flatFootedImmunity',gradeBonus=1,minutes=expr('mul',I,60))],target='self'),
 '大脑封闭术':program([dict(op='capability',id='mindImmunity',gradeBonus=1,fabricatedInformation=True,minutes=expr('mul',I,60))],target='self'),
 '意识感应场':program([dict(op='capability',id='blindSight',rangePolicy='existing-vague-sense',lineOfEffect=True,scene=True)],target='self'),
 '防护环境':program([dict(op='capability',id='environmentImmunity',byGrade={'D':['breathing','temperature','weather','naturalDifficultTerrain'],'C':['environment']},minutes=expr('mul',I,60))],range=1.5),
 '赫里斯塔莎资讯屏蔽':program([dict(op='capability',id='divinationImmunity',gradeBonus=1,minutes=expr('mul',I,60)),dict(op='capability',id='antiDetection',gradeBonus=0,minutes=expr('mul',I,60))],range=1.5),
 '物理盾':program([effect([bonus('absorb',frac(2,3),'physicalShield')],rounds=I)],target='self'),
 '精神护甲':program([effect([bonus('defense',n(2),'force'),bonus('hardness',frac(1,3),'mentalArmor'),bonus('absorb',frac(1,3),'mentalArmor')]),dict(op='capability',id='mindImmunity',gradeBonus=0,scene=True)]),
 '晨星斗篷':program([effect([bonus('absorb',frac(1,3),'morningstar')]),dict(op='capability',id='nonmagicalDamageImmunity',scene=True)],range=1.5),
 '槲寄生诅咒':program([effect([bonus('check',expr('mul',-1,P),'curse')])],effectTypes=['curse']),
 '腐蚀术':program([trigger('turnStart',[damage(frac(1,3),'acid')],count=10)],action='swift',cooldown=1),
 '炽焰斩':program([trigger('hit',[damage(P,'fire'),status('燃烧',P,resistance='none',properties={'fireKind':'magic','tickBoundary':'turn'})],count=1,rounds=1,target='eventTarget',condition={'all':[isctx('melee',True),isctx('skill','白刃')]})],action='swift',target='self'),
 '致盲斩':program([trigger('hit',[damage(P,'holy'),status('目眩',P)],count=1,rounds=1,target='eventTarget',condition={'all':[isctx('melee',True),isctx('skill','白刃')]})],action='swift',target='self'),
 '激愤斩':program([trigger('hit',[damage(frac(2,3),'mental'),status('恐惧',P)],count=1,rounds=1,target='eventTarget',condition={'all':[isctx('melee',True),isctx('skill','白刃')]})],action='swift',target='self'),
 '睡眠术':program([save('will'),status('欲眠',expr('min',minus(CAST,SAVE),n(2)),resistance='none',gradeBonus=1,properties={'stacking':'add','scene':True})],check=True,cooldown=1,target='area',area={'center':'point','radius':S,'team':'all'},precise=False,effectTypes=['mind'],effectGradeBonus=1),
 '送入梦乡':program([status('欲眠',expr('add',P,1),gradeBonus=1)],effectTypes=['mind'],effectGradeBonus=1),
 '魔甲术':program([effect([bonus('defense',n(2),'armor')],minutes=expr('mul',I,60)),trigger('turnStart',[{'op':'heal','amount':frac(1,3),'ratios':{'A':4,'L':1,'B':1}}],rounds=expr('mul',I,600))],target='self'),
}
PROGRAMS['睡眠术']['check']['modifier']=P
for name in ['恐惧术','虚弱诅咒']:PROGRAMS[name]['check']['modifier']=P
for name in ['恐惧术','心灵震爆']:PROGRAMS[name].update(effectTypes=['mind'],effectGradeBonus=1)
for name in ['大地之力','风行术','护体石肤','识破隐形','通晓语言']:PROGRAMS[name]['willing']=True
PROGRAMS['心灵震爆']['check']['modifier']=n(3)
for name in ['水之抚慰','疗伤']:
 PROGRAMS[name]=program([{'op':'heal','amount':n(2),'ratios':{'A':4,'L':1,'B':1}}],range=1.5 if name=='水之抚慰' else R)
PROGRAMS['水之抚慰']['willing']=True
PROGRAMS['水之抚慰']['steps'].append(dict(op='removeStatus',amount=P,allocate=True,exclude=['欲眠','恐惧','魅惑','沮丧','亢奋','仇恨','精神束缚']))
PROGRAMS['疗伤']['steps'].append(dict(op='removeStatus',amount=P,types=['流血']))

# Maintained base clauses; target sequences retain independent rolls, including
# repeated attacks on the same target. Optional evolutions remain separate.
PROGRAMS['魔能爆']=program(attack(frac(5,2),'force',energyWeapon=False),target='sequence',exactTargets={'context':'rank'},cooldown=1)
PROGRAMS['灼热之痛']=program(attack(frac(5,2),'fire',after=[
 dict(**save('will'),when={'test':'gte','left':ACTUAL,'right':1}),
 status({'context':'chosenStatus'},minus(ACTUAL,SAVE),resistance='none',when={'test':'gte','left':ACTUAL,'right':1})
]),cooldown=1,choices={'chosenStatus':['剧痛','仇恨']})
PROGRAMS['惹事人烈焰']=program(PROGRAMS['火球术（射弹）']['steps'],target='selected',cooldown=2)
PROGRAMS['茜卓的旋炎咒']=program(PROGRAMS['火球术（射弹）']['steps'],target='sequence',maxTargets=2,
 cost=expr('mul',3,{'context':'targetCount'}),cooldown=3,requirements=[{
 'condition':{'any':[{'test':'lte','left':{'context':'targetCount'},'right':1},
                     {'test':'gte','left':{'context':'components.freeHands'},'right':2}]},
 'message':'双枚火球须双手空闲，各枚独立支付3魔力'}])
PROGRAMS['恐惧嚎叫']=program([save('will'),status('恐惧',expr('min',minus(CAST,SAVE),n(3)),resistance='none',properties={'decayPerRound':1,'scene':True})],
 check=True,cooldown=1,target='area',area={'center':'self','radius':S,'team':'enemy'},precise=False,effectTypes=['mind'],effectGradeBonus=1)
PROGRAMS['恐惧嚎叫']['check']['modifier']=P
PROGRAMS['灾祸术']=program([save('will'),dict(**effect([bonus('attack',n(-2),'luck'),bonus('save',n(-2),'luck')]),
 when={'test':'gte','left':expr('sub',CAST,SAVE),'right':0})],check=True)
PROGRAMS['灾祸术']['check']['modifier']=P
PROGRAMS['祝福术']=program([dict(op='aura',radius=S,team='ally',scene=True,effects=[bonus('attack',n(2),'morale'),bonus('save',n(2),'morale')])],target='self')
PROGRAMS['奥术光辉']=program([dict(op='aura',radius=S,selected=True,scene=True,effects=[bonus('attribute',frac(4,3),'enhancement',isctx('attribute','智力'))])],target='self')
PROGRAMS['抑制鼓动']=program([dict(op='aura',radius=S,team='enemy',scene=True,effects=[dict(stat='attack',value=expr('mul',-1,expr('add',12,n(2))))])],target='self')
PROGRAMS['吸取生命']=program([damage(P,'acid'),dict(op='heal',recipient='caster',amount=expr('mul',2,ACTUAL),ratios={'A':4,'L':2,'B':1})],channel='start',lockTargets=True)
PROGRAMS['吸取魔力']=program([dict(op='poolTransfer',amount=P,choice='drainedPool',recover=floor(expr('div',{'context':'drained'},3)),daily={'basis':'current','key':'imperial-magic:mana-drain','maximum':{'context':'destinationMax'},'source':'用户2026-10-25 Q2采纳：当前容量，每术每日D/C共账'})],channel='start',lockTargets=True,effectTypes=['transformation'],effectGradeBonus=1)
PROGRAMS['生命分流']=program([dict(op='damage',amount=P,kind='physical',severity='L',unavoidable=True,recovery='aggravated'),dict(op='poolRestore',amount=frac(2,3),daily={'basis':'current','key':'imperial-magic:life-tap','maximum':expr('mul',{'state':'derived.hpMax'},{'context':'rank'}),'source':'用户2026-10-25 Q2采纳'})],target='self',action='swift',cost=0)
ATTRIBUTES=['力量','敏捷','智力','感知','意志','风度']
PROGRAMS['天使之赐福']=program([effect([bonus('attribute',{'context':'attributeAllocation.'+attribute,'default':0},'holy',isctx('attribute',attribute)) for attribute in ATTRIBUTES])],action='free',cooldown=1,
 allocations=[{'key':'attributeAllocation','keys':ATTRIBUTES,'total':frac(4,3),'maximum':frac(2,3)}])
PROGRAMS['透特之咏']=program([effect([bonus('check',expr('add',3,n(2)),'luck',{'test':'eq','left':{'context':'skill'},'right':{'choice':'chosenSkill'}})])],target='self',choices={'chosenSkill':['神秘','学识','科学']})
PROGRAMS['法术抵御']=program([effect([bonus('spellResistance',frac(7,2),'spellResistance',{'test':'contains','left':{'context':'schools'},'right':{'choice':'chosenSchool'}})])],cooldown=1,choices={'chosenSchool':SCHOOLS})
PROGRAMS['熔岩护甲']=program([effect([bonus('defense',n(2),'enhancement'),bonus('explodeReduction',2,'casting',isctx('casting',True))]),trigger('incomingHit',[damage(P,'fire')],target='eventTarget',condition=isctx('melee',True),scene=True)],target='self')
has_full_defense={'test':'contains','left':{'context':'tags'},'right':'fullDefense'}
PROGRAMS['防护']=program([effect([bonus('defense',frac(5,2),'force',{'all':[isctx('blocking',True),{'not':has_full_defense}]}),bonus('defense',expr('mul',2,frac(5,2)),'force',{'all':[isctx('blocking',True),has_full_defense]})])])
PROGRAMS['法师护甲']=program([effect([dict(**bonus('defense',n(2),'armor'),material=False,spiritEffective=True,fallbacks=[{'stat':'defense','group':'force'},{'stat':'ignoreAP'}])],minutes=expr('mul',I,60))],range=1.5,contact=True)
PROGRAMS['次元锚']=program([dict(op='attack',weapon=0,contact=True),dict(op='capability',id='effectUseBlock:space',gradeBonus=1,scene=True,when={'test':'gte','left':{'context':'hit'},'right':1})],cooldown=1)
PROGRAMS['脆弱诅咒']=program([trigger('afterLifeLoss',[damage(P,'acid')],perRound=frac(2,3),sourcePolicy='independent-casters',condition=isctx('allowsExtraDamage',True),damageNature='extra',effectTypes=['curse'],scene=True)],action='swift',effectTypes=['curse'])
PROGRAMS['报偿']=program([trigger('afterLifeLoss',[damage(P,'holy',noAttackSource=True)],target='eventTarget',condition=isctx('enemyCreatureSource',True),requiresContext=['enemyCreatureSource'],sourcePolicy='independent-casters',damageNature='retaliation',scene=True)])
PROGRAMS['法术抑制']=program([effect([bonus('spellPower',expr('mul',-1,floor(expr('mul',frac(2,3),{'context':'immunityFactor'}))),'suppression')])],effectTypes=['transformation','curse'],immunityMode='fraction-unblocked')
PROGRAMS['法术增效']=program([effect([bonus('spellPower',frac(1,3),'enhancement')])],willing=True,permanentPowerOnly=True,sameSource='ineffective')
PROGRAMS['魅惑人类']=program([save('will'),status('魅惑',minus(n(3),SAVE),resistance='none',gradeBonus=1,when=isctx('targetFacts.hostile',False)),status('魅惑',minus(n(2),SAVE),resistance='none',gradeBonus=1,when=isctx('targetFacts.hostile',True))],cooldown=1,effectTypes=['mind'],effectGradeBonus=1,targetFacts={'humanoid':{'type':'boolean','equals':True,'message':'目标须为实际类人生物'},'hostile':{'type':'boolean'}})
PROGRAMS['燃尽']=program([dict(op='statusSource',type='燃烧',asValue='consumedPoints'),save('fort'),damage(minus(expr('add',n(2),{'context':'consumedPoints'}),SAVE),'fire'),dict(op='consumeStatusSource',type='燃烧')],action='move',cooldown=1)
PROGRAMS['驱魔']=program([dict(op='dispel',maximumLevel=expr('add',{'context':'rank'},1))],cooldown=1)
PROGRAMS['阿撒托斯的恐怖诅咒']=program([dict(op='counter',path='will.current',maximumPath='will.max',amount=expr('mul',-1,frac(1,3)),zeroCondition='unconscious')],effectTypes=['mind'],effectGradeBonus=1)
PROGRAMS['防护能量结界']=program([dict(op='temporaryHealth',amount=n(4),refresh='maximum-remaining',damageFilter=ENERGY_DAMAGE,scene=True)],target='self')
PROGRAMS['天堂之盾']=program([dict(op='temporaryHealth',amount=expr('add',12,n(2)),scene=True,effects=[bonus('hardness',frac(2,3),'heavenShield')])],target='self')
PROGRAMS['天使之障壁']=program([dict(op='aura',radius=S,selected=True,rounds=I,temporaryAllocation={'key':'temporaryAllocation','total':n(6),'maximum':n(2)})],target='self',cooldown=1)
PROGRAMS['高频刃']=program([dict(op='weaponEffect',effects=[bonus('weaponDamage',frac(2,3),'enhancement'),bonus('weaponExplodeReduction',2,'highFrequency')],scene=True)],action='swift',range=1.5,weaponTarget=True)
PROGRAMS['邪甲术']=program([effect([bonus('spellPower',frac(1,3),'unholy'),bonus('defense',frac(2,3),'unholy')],minutes=expr('mul',60,I))],target='self',recast='after-expiry',permanentPowerOnly=True)
PROGRAMS['抵抗能量伤害']=program([
 dict(**effect([bonus('energyResistance',P,'energyResistance',ENERGY_DAMAGE)]),when=isctx('chosenEnergy','all')),
 dict(**effect([bonus('energyResistance',n(4),'energyResistance',{'test':'eq','left':{'context':'energyType'},'right':{'choice':'chosenEnergy'}})]),when={'not':isctx('chosenEnergy','all')})
],range=1.5,contact=True,choices={'chosenEnergy':['all',*RE_ENERGIES]})
for name,condition in [('冰雾神域','冻结'),('炽炎神域','燃烧')]:
 PROGRAMS[name]=program([status(condition,expr('add',frac(2,3),{'context':'rank'}),**({'resistance':'none','properties':{'fireKind':'magic'}} if condition=='燃烧' else {}))],channel='start',target='area',area={'center':'point','radius':S,'team':'all'},precise=False)

for name in ['炽焰斩','致盲斩','激愤斩']:
 t=PROGRAMS[name]['steps'][0];t['event']='attackResolved';t['damageNature']='extra'
 for step in t['steps']:step['when']=isctx('hit',True)
PROGRAMS['惊惧斩']=program([trigger('attackResolved',[
 damage(P,'mental',when=isctx('hit',True)),
 dict(**save('will'),when={'test':'gte','left':ACTUAL,'right':1}),
 dict(op='loseAction',action='move',when={'all':[{'test':'gte','left':ACTUAL,'right':1},{'test':'lte','left':SAVE,'right':expr('sub',frac(5,6),1)}]})
],count=1,rounds=1,target='eventTarget',condition={'all':[isctx('melee',True),isctx('skill','白刃')]},effectTypes=['mind'],damageNature='extra')],action='swift',target='self')
PROGRAMS['晨星斗篷']['contact']=True
VARIANTS={'天堂之盾':{'castReflex':dict(copy.deepcopy(PROGRAMS['天堂之盾']),action='reflex',counterCosts=[{'path':'will.current','amount':3,'maximumPath':'will.max'}])}}

VARIANTS['防护能量结界']={'castReflex':dict(copy.deepcopy(PROGRAMS['防护能量结界']),action='reflex',counterCosts=[{'path':'will.current','amount':expr('sub',expr('mul',4,{'context':'rank'}),2),'maximumPath':'will.max'}])}
VARIANTS['物理盾']={'castReflex':dict(copy.deepcopy(PROGRAMS['物理盾']),action='reflex',counterCosts=[{'path':'will.current','amount':expr('mul',2,{'context':'rank'}),'maximumPath':'will.max'}])}

# Every remaining clause remains an implementation item, never a missing rule.
# Shared resistance receipts replace hand-written subtraction and accidental
# second PHB status saves. These clauses explicitly compare one casting roll
# with one target save (00-施法通则; each maintained spell paragraph).
OPPOSED_STATUS={'恐惧术':3,'虚弱诅咒':3,'睡眠术':2,'恐惧嚎叫':3}
for name,multiplier in OPPOSED_STATUS.items():
 p=PROGRAMS[name]
 p['steps'][0].update(resolve={'kind':'opposed','active':CAST},resultAs='opposition')
 p['steps'][1]['points']=expr('min',{'context':'opposition.margin'},n(multiplier))
 p['steps'][1]['resistance']={'receipt':'opposition','kind':'resolved'}
PROGRAMS['心灵震爆']['steps'][0].update(resolve={'kind':'opposed','active':CAST},resultAs='opposition')
PROGRAMS['心灵震爆']['steps'][1]['amount']=expr('min',{'context':'opposition.margin'},expr('add',n(4),E))
PROGRAMS['心灵震爆']['steps'][1]['resistance']={'receipt':'opposition','kind':'resolved'}
PROGRAMS['灾祸术']['steps'][0].update(resolve={'kind':'opposed','active':CAST},resultAs='opposition')
PROGRAMS['灾祸术']['steps'][1]['when']=isctx('opposition.success',True)
for step,multiple in zip(PROGRAMS['魅惑人类']['steps'][1:],[3,2]):
 step['points']=n(multiple)
 step['resistance']={'receipt':'save','kind':'subtract','perSuccess':1}
PROGRAMS['法术抑制']['steps'][0]['effects'][0]['value']=expr('mul',-1,frac(2,3))
PROGRAMS['法术抑制']['steps'][0].update(immunityLifecycle='suppress',immunityScaling='floor-magnitude')
# RE effect-level immunity suppresses a continuing instance, not its lifetime.
# Morale bonuses are explicitly within mind immunity (RE 能力等级与对抗).
PROGRAMS['槲寄生诅咒']['steps'][0]['immunityLifecycle']='suppress'
PROGRAMS['脆弱诅咒']['steps'][0]['immunityLifecycle']='suppress'
PROGRAMS['祝福术']['effectTypes']=['mind']
PROGRAMS['祝福术']['steps'][0]['immunityLifecycle']='suppress'
PROGRAMS['振奋']=program([dict(**effect([bonus('currentInitiative',frac(2,3),'inspire'),bonus('attack',n(3),'morale',isctx('higherInitiative',True))]),targetSceneLimit=1,turnOrder='after-caster-turn',immunityLifecycle='suppress',initialBlocked='discard')],willing=True,effectTypes=['mind'],effectGradeBonus=0)
PROGRAMS['飞行术']=program([dict(op='capability',id='flight',movement={'mode':'flight','speed':expr('mul',expr('sub',{'context':'rank'},1),P,30),'maneuverability':'perfect','control':'autonomous'},minutes=expr('mul',I,{'context':'rank'}),onEnd={'kind':'descent','rounds':P,'metersPerRound':20,'intervalMinutes':0.1})],target='selected',range=1.5,contact=True,willing=True)
PROGRAMS['龙翔术']=program([dict(op='capability',id='flight',movement={'mode':'flight','speedBasis':'current-land','speedMultiplier':frac(2,3),'maneuverability':'perfect','control':'autonomous'},minutes=expr('mul',E,60),onEnd={'kind':'fall'})],target='self')
PROGRAMS['镜枪水箭']=program([dict(op='temporaryHealth',amount=frac(7,2),scene=True,refresh='maximum-remaining',damageFilter={'all':[isctx('attack',True),isctx('ranged',True)]})],target='self',requiredItems=[{'key':'mirror','tag':'mirror','held':True}])
PROGRAMS['元素诅咒']=program([dict(**save('fort'),resolve={'kind':'opposed','active':CAST},resultAs='opposition'),dict(**effect([dict(stat='incomingDamage',value=frac(1,2),stacking='highest-source-grade',damageAllocation='lightest-existing',when=ENERGY_DAMAGE)]),when=isctx('opposition.success',True),immunityLifecycle='suppress',removable=True)],check=True,effectTypes=['curse'])
PROGRAMS['元素诅咒']['check']['modifier']=P
PROGRAMS['安定心神']=program([dict(**save('will'),resolve={'kind':'opposed','active':CAST},resultAs='opposition'),
 dict(op='removeStatus',types=['恐惧','沮丧','亢奋','魅惑'],budgetScope='type',amount=n(2),when=isctx('opposition.success',True)),
 dict(op='capability',id='emotionCalming',scene=True,immunityLifecycle='suppress',when=isctx('opposition.success',True)),
 dict(op='capability',id='attitudeOverride',**{'from':'hostile','to':'indifferent'},rounds=1,immunityLifecycle='suppress',when=isctx('opposition.success',True))],check=True,target='area',area={'center':'point','radius':S,'team':'all'},precise=False,effectTypes=['mind'])
for name,p in PROGRAMS.items():
 if not p.get('effectTypes'):continue
 families=list(p['effectTypes'])
 # For these whole-effect spells, a single declared status family is shared
 # with its save; mixed component programs declare separate component IDs.
 status_types={step['type'] for step in p['steps'] if step['op']=='status' and isinstance(step['type'],str)}
 if len(status_types)==1:families+=['status:'+next(iter(status_types))]
 p['effectComponents']={'main':{'families':families,'gradeBonus':p.get('effectGradeBonus',0),'mode':p.get('immunityMode','any-blocks')}}
 if name=='魅惑人类':p['effectComponents']['main']['maximumGrade']='S'
 for step in p['steps']:
  step['component']='main'
  if step['op']=='status':step['immunityLifecycle']='suppress-existing'

PROGRAMS['加速术']=program([dict(**effect([bonus('speed',n(5),'enhancement')]),exclusiveGroup='haste',exclusivePolicy='recipient-choice',
 actionPrice={'family':'physical','discount':frac(1,3),'baseByAction':{'weaponAttack':5,'move':4,'naturalAttack':6,'drawWeapon':4,'loadBow':2,'block':4},'minimumAP':1,'perRound':1,'quotaKey':'haste'})],
 action=['standard','swift'],target='area',area={'center':'point','radius':S,'selected':True},precise=False)

PROGRAMS['伤痛抑制']=program([effect([bonus('statusPenaltyIgnore',P,'suppression'),bonus('environmentPenaltyIgnore',P,'suppression'),bonus('ignoreWoundUnconsciousness',1,'suppression')],minutes=expr('mul',{'context':'rank'},60))],action='free',range=1.5,contact=True,willing=True)
DARK_COST=[dict(op='damage',amount=1,kind='physical',severity='L',unavoidable=True,recovery='aggravated'),dict(op='accumulate',key='imperial-magic:dark-form',amount=1,thresholdAttribute='力量',conditionMinutes=480,resetAfterRestMinutes=480)]
PROGRAMS['暗夜之型']=program([effect([bonus('attribute',frac(1,2),'enhancement',isctx('attribute',a)) for a in ['智力','感知','风度']]+[bonus('check',frac(1,2),'insight',isctx('genericEnergySupported',True))]),trigger('turnStart',copy.deepcopy(DARK_COST),scene=True,requiresConscious=True),*copy.deepcopy(DARK_COST)],target='self',action='free',toggle='on')


EXTRA_GAPS={
 '龙翔术':['当前地面步速倍率、完美飞行及结束直接坠落已接共享消费者；翼部损伤、牵带和场外主动飞行尚需后续消费者'],
 '镜枪水箭':['基础临时生命、远程攻击过滤及持有镜子成分已接共享消费者；尚需更广泛防护/状态组合验证'],
 '元素诅咒':['防护前能量增量、Q16最轻伤型及Q19同名同级取高已接共享消费者；自由解消已接通，A级永久版仍待工程接线'],
 '飞行术':['C级完美机动飞行已接三维移动、自主失控弹道及Q15正常缓降转连续坠落；B以上旅行版、空中牵带负重/多人联动及场外主动飞行路由未实现'],
 '安定心神':['已接来源扣点与有期限的情绪/态度约束；实际社会态度须有主持来源，不由资源猜测，不强制停止战斗'],
 '振奋':['C级每目标每场景一次，数值立即生效、顺位在施法者行动结束调整；A级多目标版本尚未编写'],
 '加速术':['已接Q28/Q29实际动作槽回退、复合动作整体支付与免费豁免；跨来源由受术者选择保留或替换；B以上版本尚未编写'],
 '炽焰斩':['物件目标及特殊免判定攻击的附魔事件仍须接入；普通人物攻击已覆盖落空和防护挡尽'],
 '致盲斩':['物件目标及特殊免判定攻击的附魔事件仍须接入；普通人物攻击已覆盖落空和防护挡尽'],
 '激愤斩':['物件目标及特殊免判定攻击的附魔事件仍须接入；普通人物攻击已覆盖落空和防护挡尽'],
 '魔能爆':['另购进化的苦痛、长枪、斥力、拉近、减速和爆炸条款尚未接入；基础D/C独立多次攻击已实现'],
 '魔法飞弹':['多枚、悬浮与穿透进化需专用声明和投射物事件'],
 '阳炎炮':['贯穿链的逐目标预算'],
 '惊惧斩':['物件目标及特殊免判定攻击的附魔事件仍须接入；普通人物攻击与下一次行动损失已接通'],
 '脆弱诅咒':['普通武器与通用法术来源已分类；旧状态聚合和其余骰伤来源仍须逐项标注damageNature，不能把未分类伤害默认当攻击'],
 '报偿':['普通武器、通用法术、擒抱攻击、导力弹、龙象附加和乱红莲伤害已传实际来源；旧燃烧/流血聚合及特殊反射的来源归属仍须接线'],
 '物理盾':['激发及同一反射施放并激发：须接入实际将受伤时点、单次吸收替换及结束；普通标准/反射施放已接通'],
 '识破隐形':['感官范围与地图定位联动'],
 '大脑封闭术':['心灵免疫与信息伪造事件'],
 '通晓语言':['语言资格与超自然词义分离'],
 '意识感应场':['盲视与实际感知范围联动'],
 '防护环境':['环境类型与免疫联动'],
 '赫里斯塔莎资讯屏蔽':['探知和反侦测等级对抗'],
 '驱魔':['尚未接入旧式无来源等级的计时效果及物件附魔目标；有来源/等级/持续时间的资源状态已可解除，永久后果不随状态删除；A以上版本另待实现'],
 '高频刃':['争夺中的非自愿武器接触判定尚未接入'],
 '晨星斗篷':['基础非魔法伤害免疫、吸收和接触已有执行测试；其余组合与变体仍待完整核验'],
 '前知综合预警':['措手免疫接防御阶段'],
 '精神护甲':['心灵免疫接状态阶段'],
}
# User adopted Q20--Q23, 2026-10-25. Shared consumers, not spell-specific JS.
ARROWS={'context':'allocatedArrows'}
PROGRAMS['刺目光箭']=program([damage(ARROWS,'light'),status('目眩',ARROWS,resistance='none',properties={'stacking':'add'}),
 dict(**effect([dict(**bonus('check',expr('mul',-2,ARROWS),'spell-mark',isctx('skill','躲藏')),stacking='add')]),instancePolicy='append',when={'test':'gte','left':ARROWS,'right':1})],
 action='move',target='selected',cooldown=3,targetAllocation={'key':'arrows','total':P,'as':'allocatedArrows','spellResistance':'subtract-once'})
PROGRAMS['奥术冲击']=program([dict(op='save',type='fort',penalty=CAST,resultAs='fortReceipt',**{'as':'fort'}),
 damage({'context':'progression.baseDamage'},'pure',resistance={'receipt':'fortReceipt','kind':'subtract','perSuccess':1})],check=True,
 cost={'context':'progression.manaCost'},targetProgression={'key':'repeat','scope':'scene','commit':'target-resolution','fields':[
 {'name':'baseDamage','initial':n(2),'next':expr('add',{'context':'previous.baseDamage'},P)},
 {'name':'manaCost','initial':3,'next':expr('add',{'context':'previous.manaCost'},3)}]})
VARIANTS['元素诅咒']={'end':{'label':'解消元素诅咒','action':'free','target':'selected','casting':False,'cost':0,'endEffects':'own-selected','steps':[]}}
VARIANTS['暗夜之型']={'end':{'label':'关闭暗夜之型','action':'free','target':'self','casting':False,'cost':0,'toggle':'off','steps':[]}}

# RE rules glossary: cone apex angle is 45 degrees; default area is a burst.
for name,energy,cooldown in [('冰锥术','cold',2),('龙息术','fire',3)]:
 profile={'recipientChoice':'defense','options':['reflex','fort']} if name=='冰锥术' else 'reflex'
 PROGRAMS[name]=program([dict(op='save',type=profile,resultAs='areaSave'),
  damage(expr('min',CAST,n(6)),energy,resistance={'receipt':'areaSave','kind':'subtract','perSuccess':1}),
  status('晕眩',ACTUAL,when={'test':'gte','left':ACTUAL,'right':1})],check=True,target='area',cooldown=cooldown,
  area={'shape':'cone','center':'self','length':S,'angleDegrees':45},precise=False)
 PROGRAMS[name]['check']['modifier']=P

def main():
 count=0
 for path in DEST.glob('*.rule.json'):
  doc=json.loads(path.read_text(encoding='utf-8'));name=doc['identity']['name']
  if doc['identity']['category']!='spell':continue
  if doc.get('authoring',{}).get('executionSource')=='contract':continue # Explicit handoff: never overwrite canonical contracts.
  source=(KIT/doc['reading']['path']).read_text(encoding='utf-8')
  start=source.index('### '+name);body=source[start:];body=re.split(r'\n###? ',body,maxsplit=1)[0]
  field=re.search(r'\*\*(?:法系／子技能|学系／子技能)：\*\*(.+)',body)
  subs,both=parse_schools(field.group(1)) if field else ([],False)
  old_schools=(doc['definition'].get('subskills'),doc['definition'].get('requiresAllSchools'))
  if old_schools!=(subs,both):
   doc['version']='2026-10-24.2'
   refs=doc['verification'].setdefault('testReferences',[])
   ref='work/replay_research/six_books_20261023/test_author_spell_programs.py'
   if ref not in refs:refs.append(ref)
  doc['definition']['subskills']=subs
  doc['definition']['requiresAllSchools']=both
  doc['definition']['schools']=subs
  if name in PROGRAMS:
   doc['definition']['programs']={'cast':PROGRAMS[name]};doc['definition']['schools']=subs
   doc['definition']['programs'].update(copy.deepcopy(VARIANTS.get(name,{})))
   if PROGRAMS[name].get('channel'):
    maintain=copy.deepcopy(PROGRAMS[name]);maintain.update(channel='maintain',cost=0,components=['focus'])
    doc['definition']['programs']['maintain']=maintain
    doc['definition']['programs']['release']={'action':'free','target':'self','channel':'release','cost':0,'casting':False,'steps':[]}
   if field and '空间' in field.group(1):
    for p in doc['definition']['programs'].values():
     if p.get('casting'):p['effectFamilies']=['space']
   # The section's explicit components override the common default. Focus is
   # a common casting constraint even where only posture/language are listed.
   components=re.search(r'\*\*(?:消耗／成分|成分)：\*\*(.+)',body)
   if components:
    text=components.group(1);doc['definition']['programs']['cast']['components']=parse_components(text)
   doc['actions']=[{'id':'cast','name':name,'operation':'cast','actionCost':PROGRAMS[name]['action'],'requiredChoice':'actual-targets',
    'choices':PROGRAMS[name].get('choices',{}),'allocations':PROGRAMS[name].get('allocations',[]),'targetMode':PROGRAMS[name]['target'],
    'requestFields':['actorId','objectId','operation','part'],'allowsModelNumericEffects':False,'route':'mechanism','objectType':'kitResource'}]
   if PROGRAMS[name].get('effectComponents'):doc['actions'][0]['effectComponents']=PROGRAMS[name]['effectComponents']
   doc['actions'][0]['immunityLifecycles']=[{'operation':step['op'],'component':step['component'],'policy':step['immunityLifecycle']} for step in PROGRAMS[name]['steps'] if step.get('immunityLifecycle')]
   doc['actions'][0]['resistanceModes']=[{'profile':step['type'],'kind':step.get('resolve',{}).get('kind','roll'),'receipt':step.get('resultAs',step.get('as','save'))} for step in PROGRAMS[name]['steps'] if step['op']=='save']
   for step in PROGRAMS[name]['steps']:
    if step['op']=='poolRestore':doc['actions'][0]['poolRestore']={'dailyPolicy':step.get('daily')}
    if step['op']=='poolTransfer':doc['actions'][0]['poolTransfer']={'choice':step['choice'],'eligible':'explicit-generic-existing','missing':'random','dailyPolicy':step.get('daily')}
   if PROGRAMS[name].get('channel'):
    for op in ['maintain','release']:
     action=copy.deepcopy(doc['actions'][0]);action.update(id=op,operation=op,name=('维持' if op=='maintain' else '结束')+name,actionCost='standard' if op=='maintain' else 'free')
     if op=='release':action.pop('poolTransfer',None)
     doc['actions'].append(action)
   for op,variant in VARIANTS.get(name,{}).items():
    action=copy.deepcopy(doc['actions'][0]);action.update(id=op,operation=op,name=variant.get('label','反射'+name),actionCost=variant['action'],counterCosts=variant.get('counterCosts',[]),targetMode=variant['target'],choices=variant.get('choices',{}),allocations=variant.get('allocations',[]))
    action['resistanceModes']=[{'profile':step['type'],'kind':step.get('resolve',{}).get('kind','roll'),'receipt':step.get('resultAs',step.get('as','save'))} for step in variant['steps'] if step['op']=='save']
    action['immunityLifecycles']=[{'operation':step['op'],'component':step['component'],'policy':step['immunityLifecycle']} for step in variant['steps'] if step.get('immunityLifecycle')]
    if not variant.get('effectComponents'):action.pop('effectComponents',None)
    doc['actions'].append(action)
   doc['inputs']=[{'id':k,'type':t,'provider':p,'requiredFor':'cast','missingPolicy':'require_input_for_dependent_action'} for k,t,p in [('ownership','object','saved-state'),('casting','object','saved-state'),('targetIds','array','player'),('components','object','host'),('pool','string','player')]]
   if any(step['op']=='poolRestore' for step in PROGRAMS[name]['steps']):doc['inputs'].append({'id':'dayId','type':'string','provider':'host','requiredFor':'cast','missingPolicy':'require_sourced_actual_game_day'})
   for allocation in PROGRAMS[name].get('allocations',[]):
    doc['inputs'].append({'id':'inputs.'+allocation['key'],'type':'object','provider':'player','requiredFor':'cast','missingPolicy':'require_valid_complete_allocation','constraint':allocation})
   if PROGRAMS[name].get('targetFacts'):
    doc['inputs'].append({'id':'targetFacts','type':'object','provider':'host','requiredFor':'cast','missingPolicy':'require_sourced_target_facts','facts':PROGRAMS[name]['targetFacts']})
   for step in PROGRAMS[name]['steps']:
    if step.get('temporaryAllocation'):
     allocation=step['temporaryAllocation']
     doc['inputs'].append({'id':'inputs.'+allocation['key'],'type':'object','provider':'player','requiredFor':'cast','missingPolicy':'require_valid_complete_allocation','constraint':allocation})
    if step['op']=='poolTransfer':
     doc['inputs'].append({'id':'poolChoices.'+step['choice'],'type':'string','provider':'player','requiredFor':'cast-and-maintain','missingPolicy':'require_declared_pool_each_activation'})
     if step.get('daily'):doc['inputs'].append({'id':'dayId','type':'string','provider':'host','requiredFor':'cast-and-maintain','missingPolicy':'require_sourced_actual_game_day'})
    if step['op']=='statusSource':
     doc['inputs'].append({'id':'statusSource','type':'object-or-null','provider':'player','requiredFor':'optional-source-consumption','missingPolicy':'no_consumption','fields':['source','sourceActorId']})
    if step['op']=='dispel':
     doc['inputs'].append({'id':'effectChoice','type':'object','provider':'target','requiredFor':'cast','missingPolicy':'require_target_choice_with_source','fields':['id','chosenBy','source']})
   if PROGRAMS[name].get('weaponTarget'):
    for key,typ,provider in [('weaponId','string','saved-state'),('weaponTouchConfirmed','boolean','host'),('willingTargets','array','target')]:
     doc['inputs'].append({'id':key,'type':typ,'provider':provider,'requiredFor':'cast','missingPolicy':'require_actual_weapon_contact'})
   for choice,values in PROGRAMS[name].get('choices',{}).items():
    doc['inputs'].append({'id':'inputs.'+choice,'type':'string','values':values,'provider':'player','requiredFor':'cast','missingPolicy':'require_input_for_dependent_action'})
   if name in ['魔能爆','灼热之痛','惹事人烈焰','茜卓的旋炎咒','恐惧嚎叫','灾祸术','祝福术','奥术光辉','抑制鼓动','吸取生命','吸取魔力','冰雾神域','炽炎神域','透特之咏','邪甲术','抵抗能量伤害','天使之赐福','法术抵御','熔岩护甲','阿撒托斯的恐怖诅咒','天堂之盾','天使之障壁','高频刃','驱魔','燃尽','魅惑人类','法术增效','法术抑制','物理盾','晨星斗篷','炽焰斩','致盲斩','激愤斩','惊惧斩','报偿','脆弱诅咒','次元锚','防护能量结界','法师护甲','防护']:
    doc['version']='2026-10-24.2'
    doc['verification']['testReferences']=['work/rules_engine/gm_runtime/resource-program.test.mjs','work/rules_engine/core.test.mjs']
   if any(step['op']=='aura' for step in PROGRAMS[name]['steps']):
    doc['inputs'].append({'id':'spatial','type':'object','provider':'host','requiredFor':'cast-and-membership-refresh','missingPolicy':'require_current_positions_with_source'})
    doc['definition']['formulaTiming']='freeze-at-cast; membership follows actual positions'
    note={'id':'aura-formula-timing','source':doc['reading']['path']+'#'+name,
          'issue':'正文明确领域随施法者移动，未明确施放后属性变化时是否重算范围和强度。',
          'impact':'奥术光辉选中自身时，递归重算可扩大半径。',
          'recommendation':'沿现有持续效果统一口径冻结施放时公式值；仅实时更新成员资格。当前执行采用此统一口径。'}
    doc['unresolvedRules']=[x for x in doc['unresolvedRules'] if not isinstance(x,dict) or x.get('id')!='aura-formula-timing']+[note]
   if name=='龙翔术':
    doc['version']='2026-10-25.1'
    doc['verification']['testReferences']=['work/rules_engine/gm_runtime/resource-program.test.mjs','work/rules_engine/combat/flight.test.mjs','work/rules_engine/resource-descent.test.mjs']
   if name=='镜枪水箭':
    doc['version']='2026-10-25.1'
    doc['verification']['testReferences']=['work/rules_engine/resource-temporary-health.test.mjs','work/rules_engine/gm_runtime/resource-program.test.mjs']
    doc['inputs'].append({'id':'itemChoices.mirror','type':'string','provider':'saved-plan','requiredFor':'cast','missingPolicy':'require_actual_held_mirror_item'})
   if name=='元素诅咒':
    doc['version']='2026-10-25.3'
    doc['verification']['testReferences']=['work/rules_engine/gm_runtime/resource-program.test.mjs','work/rules_engine/resource-damage-modifiers.test.mjs']
    doc['unresolvedRules']=[x for x in doc['unresolvedRules'] if not isinstance(x,dict) or x.get('id') not in ['incoming-mixed-severity','incoming-cross-caster']]
    doc['adoptedDecisions']=[{'id': 'incoming-mixed-severity', 'source': '用户2026-10-25 Q16采用', 'rule': '防护前同类增量整份加入最轻已有伤型，不因L/A分段倍增。'}, {'id': 'incoming-cross-caster', 'source': '用户2026-10-25 Q19采用', 'rule': '同名同级跨施法者来源分别保留，数值取最高；高值失效后低值恢复，不同等级独立。'}]
    doc['definition']['effectPolicyMigrations']=[{'stat': 'incomingDamage', 'fromVersion': '2026-10-25.1', 'set': {'stacking': 'highest-source-grade', 'damageAllocation': 'lightest-existing'}, 'source': '用户Q16/Q19采用，仅更新该旧契约策略，不刷新余额或期限'}]
   if name=='飞行术':
    note={'id':'descent-ballistic-handoff','source':'用户2026-10-25 Q15采用','rule':'保留Q7满6秒首次下降20米；缓降结束转连续自由运动时垂直初速度为0，水平采用实际有效速度记录；缺失须补事实，不从20米/轮倒推。自主飞行突然失控仍按Q8保留实际三维速度。'}
    doc['unresolvedRules']=[x for x in doc['unresolvedRules'] if not isinstance(x,dict) or x.get('id')!='descent-ballistic-handoff']
    doc['adoptedDecisions']=[x for x in doc.get('adoptedDecisions',[]) if x.get('id')!=note['id']]+[note]
    doc['version']='2026-10-25.5'
    doc['verification']['testReferences']=['work/rules_engine/combat/flight.test.mjs','work/rules_engine/combat/ballistics.test.mjs','work/rules_engine/resource-descent.test.mjs','work/rules_engine/gm_runtime/resource-program.test.mjs','work/rules_engine/gm_runtime/rule-actions.test.mjs']
    doc['actions'][0]['movementConsumer']='move/step + actual movementSource + xyz destination'
    doc['inputs'].append({'id':'willingTargets','type':'array','provider':'target','requiredFor':'cast','missingPolicy':'require_actual_willingness'})
   if name=='安定心神':
    doc['version']='2026-10-25.3'
    doc['verification']['testReferences']=['work/rules_engine/resource-status-budget.test.mjs','work/rules_engine/gm_runtime/resource-program.test.mjs']
    doc['inputs'].append({'id':'statusBudgetChoices','type':'object','provider':'target','requiredFor':'ambiguous-source-allocation','missingPolicy':'require_before_cost_and_dice','fields':['chosenBy','source','allocations']})
    doc['actions'][0]['statusBudgetScope']='per-type-shared-across-sources'
   if name=='振奋':
    doc['version']='2026-10-25.2'
    doc['verification']['testReferences']=['work/rules_engine/gm_runtime/resource-program.test.mjs','work/rules_engine/resource-turn-order.test.mjs']
    doc['actions'][0]['turnOrder']='after-caster-turn'
    doc['actions'][0]['targetSceneLimit']=1
    doc['inputs'].append({'id':'willingTargets','type':'array','provider':'target','requiredFor':'cast','missingPolicy':'require_actual_willingness'})
   if name=='次元锚':
    doc['unresolvedRules']=[{'id':'legacy-teleport-grade','source':'sources/references/设定 人物/人物卡资料集_检索版.md:1676-1693',
      'quote':'下位传送/上位传送列有动作、消耗和距离，没有D/C/B效果等级。',
      'issue':'角色既有传送缺效果等级；不得按魔力消耗或名称反推。',
      'impact':'被次元锚约束者使用这两项传送时，须提供带来源的实际等级；没有锚时不增加此门槛。',
      'recommendation':'在场景实际资源effectGrades.lower/upper登记grade及source；在用户裁定/原始取得记录给出等级前阻止依赖该比较的操作。'}]
    doc['unresolvedRules'][0]['kind']='missing-source-fact'
    doc['scopeNotes']=[{'source':'RE C级通用魔法/结界1.md:156','rule':'限制实际使用空间效果者，不额外赋予被他人传送的免疫。'}]
   if name in ['脆弱诅咒','报偿']:
    doc['definition']['triggerPolicyMigrations']=[{'event':'afterLifeLoss','from':'pending-cross-caster','to':'independent-casters','source':'用户2026-10-24明确采用：独立来源分别结算'}]
    note={'id':'cross-caster-damage-instances','source':'content/RE/01_rules/04_附录/一些常见问答.md:64-69',
          'quote':'不同角色使用的同一效果……可以反复影响同一目标并各自产生效果；是否叠加取决于该效果本身是否叠加。',
          'issue':'两术未进一步规定跨施法者叠加；数值加值取最高不能自动推广到持续伤害/反伤实例。',
          'impact':'影响实际触发次数、每轮额度和伤害来源归属；若改成只选最高还缺平值及来源切换规则。',
          'status':'adopted','decision':'每施法者保留一份独立效果并分别结算，同施法者重施不重置同轮次数。','decisionSource':'用户2026-10-24回复：采用独立来源分别结算','recommendation':'已采用；迁移旧存档的待裁定策略字段，保留原施法强度、来源、持续和已用额度。'}
    doc['unresolvedRules']=[x for x in doc['unresolvedRules'] if not isinstance(x,dict) or x.get('id')!='cross-caster-damage-instances']
    doc['adoptedDecisions']=[x for x in doc.get('adoptedDecisions',[]) if x.get('id')!='cross-caster-damage-instances']+[note]
   if name in ['天堂之盾','天使之障壁','防护能量结界']:
    doc['version']='2026-10-25.1'
    doc['unresolvedRules']=[x for x in doc['unresolvedRules'] if not isinstance(x,dict) or x.get('id')!='temporary-health-cross-source']
    note={'id':'temporary-health-cross-source','source':'用户2026-10-25 Q3采纳','rule':'受术者保留或替换，仅留一份；替换清关联效果但不算伤害耗尽，无备用接力；领域仅本成员份额，已替换份额不自动返回。'}
    doc['adoptedDecisions']=[x for x in doc.get('adoptedDecisions',[]) if x.get('id')!=note['id']]+[note]
    doc['inputs'].append({'id':'temporaryHealthChoices','type':'object','provider':'recipient','requiredFor':'cross-source-conflict'})
   if name in ['冰锥术','龙息术']:
    doc['version']='2026-10-25.1'
    doc['actions'][0]['area']=copy.deepcopy(PROGRAMS[name]['area'])
    doc['inputs'].append({'id':'aim','type':'array','provider':'player','requiredFor':'cast','missingPolicy':'require_actual_direction'})
    if name=='冰锥术':doc['inputs'].append({'id':'saveChoices','type':'object','provider':'recipient','requiredFor':'cast','missingPolicy':'require_actual_recipient_save_choice'})
   if name in ['灼热之痛','刺目光箭','奥术冲击']:
    doc['version']='2026-10-25.1'
    ids={'灼热之痛':['hatred-behavior'],'刺目光箭':['allocated-projectiles-spell-resistance'],'奥术冲击':['repeat-cast-reset','repeat-cast-failed-attempt']}[name]
    old=[r for r in doc.get('unresolvedRules',[]) if isinstance(r,dict) and r.get('id') in ids]
    doc['unresolvedRules']=[r for r in doc.get('unresolvedRules',[]) if not isinstance(r,dict) or r.get('id') not in ids]
    for row in old:
     row=copy.deepcopy(row);row['status']='adopted';row['adoptionSource']='用户2026-10-25全部采用Q20—Q23';row['rule']=row.pop('recommendation','').replace('此为建议，未采用。','')
     doc['adoptedDecisions']=[r for r in doc.get('adoptedDecisions',[]) if r.get('id')!=row['id']]+[row]
    for key in ['targetAllocation','targetProgression']:
     if key in PROGRAMS[name]:doc['actions'][0][key]=copy.deepcopy(PROGRAMS[name][key])
    if name=='刺目光箭':doc['inputs'].append({'id':'targetAllocations.arrows','type':'object','provider':'player','requiredFor':'cast','missingPolicy':'require_input_for_dependent_action'})
   if name in OPPOSED_STATUS or name in ['心灵震爆','灾祸术','魅惑人类','法术抑制'] or PROGRAMS[name].get('effectComponents'):
    # Shared component rollout must not downgrade a newer program revision.
    doc['version']=max(doc.get('version','2026-10-24.4'),'2026-10-24.4',key=lambda v:tuple(map(int,re.split(r'[-.]',v))))
    refs=doc['verification'].setdefault('testReferences',[])
    for ref in ['work/rules_engine/resource-applicability.test.mjs','work/rules_engine/resource-resistance.test.mjs','work/rules_engine/resource-status-applicability.test.mjs','work/rules_engine/gm_runtime/resource-program.test.mjs']:
     if ref not in refs:refs.append(ref)
   if name in ['槲寄生诅咒','脆弱诅咒','祝福术']:doc['version']='2026-10-24.4'
   if name=='加速术':
    doc['version']='2026-10-26.2'
    doc['unresolvedRules']=[r for r in doc['unresolvedRules'] if not isinstance(r,dict) or r.get('id')!='exclusive-source-replacement']
    adoption={'id':'haste-exclusive-source-choice','source':'用户2026-10-24明确答复“采用，请继续”','rule':'受术者选择保留旧效果或换成新效果；新施法照常付费，替换使用新施法参数和期限，不重置角色本轮已用减费次数。'}
    doc['adoptedDecisions']=[r for r in doc.get('adoptedDecisions',[]) if r.get('id')!=adoption['id']]+[adoption]
    doc['inputs'].append({'id':'exclusiveChoices','type':'object','provider':'recipient','requiredFor':'existing-exclusive-source-conflict','missingPolicy':'require_sourced_recipient_choice_of_actual_instance'})
    doc['actions'][0]['exclusiveEffects']=[{'group':'haste','policy':'recipient-choice','choices':['keep','replace'],'payment':'normal-cast','quota':'preserved'}]
    doc['verification']['testReferences']=['work/rules_engine/resource-action-pricing.test.mjs','work/rules_engine/combat/declarative-actions.test.mjs','work/rules_engine/gm_runtime/resource-program.test.mjs']
   if name=='暗夜之型':
    doc['version']='2026-10-25.1'
    note={'id':'dark-form-period-and-rest','source':'用户2026-10-25 Q4/Q5采纳','rule':'启动及每次本人行动开始付代价；关闭不清暗伤；连续8小时休息或本术8小时昏迷后清零。'}
    doc['adoptedDecisions']=[x for x in doc.get('adoptedDecisions',[]) if x.get('id')!=note['id']]+[note]
   if name=='伤痛抑制':
    doc['version']='2026-10-24.6'
    doc['verification']['testReferences']=['work/rules_engine/resource-penalties.test.mjs','work/rules_engine/gm_runtime/resource-program.test.mjs','work/rules_engine/status-rules.test.mjs']
   doc['clauses'][0]['status']='partial';doc['verification']['status']='partial'
   doc['implementationGaps']=(["通用能量支持的旧角色攻防/对抗加值仍需来源消费者迁移，当前仅接通真实通用池付费的资源检定；B以上版本未接入"] if name=='暗夜之型' else EXTRA_GAPS.get(name,[]))+['需执行级完整验证，检查等级/特殊关键词/版本变体；不可仅凭程序存在标记完成']
   count+=1
  if name in ['吸取魔力','生命分流']:
   doc['version']='2026-10-25.1'
   note={'id':'daily-capacity-basis','source':'用户2026-10-25 Q2采纳','rule':'每人物每术每日实际回魔累计，D/C共账；每次用当前容量/本次等级，上限变动不清账、不倒扣。'}
   doc['unresolvedRules']=[x for x in doc['unresolvedRules'] if not isinstance(x,dict) or x.get('id')!='daily-capacity-basis']
   doc['adoptedDecisions']=[x for x in doc.get('adoptedDecisions',[]) if x.get('id')!=note['id']]+[note]
  path.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'authoredPrograms':count}))
if __name__=='__main__':main()
