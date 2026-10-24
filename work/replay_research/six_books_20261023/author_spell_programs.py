"""Reviewed declarative programs, sourced from each spell's maintained paragraph.
This writes execution contracts, not generated runtime JS or reading text.
"""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[3];KIT=ROOT.parent/'901-resource-authoring-kit';DEST=KIT/'resources/execution'
P={'context':'P'};I={'context':'INT'};E={'context':'E'};CAST={'context':'cast'};SAVE={'context':'save'};DAMAGE={'context':'damage'};ACTUAL={'context':'actualDamage'}
def expr(op,*args):return dict(op=op,args=list(args))
def n(x):return expr('mul',x,P)
def floor(x):return expr('floor',x)
def frac(a,b):return floor(expr('div',n(a),b))
def minus(a,b):return expr('max',0,expr('sub',a,b))
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
PROGRAMS={
 '魔法飞弹':program([damage(expr('add',frac(1,3),{'context':'legendaryINT'}),'force')],cooldown=1),
 '火焰冲击':program([save(penalty=CAST),damage(minus(frac(3,2),SAVE),'fire')],action='swift',check=True,cooldown=1),
 '火球术（射弹）':program(attack(n(2),'fire',after=[status('燃烧',expr('min',ACTUAL,n(2)),resistance='none',properties={'fireKind':'magic','tickBoundary':'turn','stacking':'add'})]),cooldown=2),
 '寒冰箭':program(attack(n(2),'cold',after=[status('冻结',expr('min',ACTUAL,n(2)),resistance='none',properties={'stacking':'add'})]),cooldown=2),
 '寒冷新星':program([save('fort',CAST),damage(frac(2,3),'cold'),status('冻结',minus(n(2),SAVE),resistance='none')],target='area',check=True,cooldown=3,area={'center':'self','radius':S,'team':'all'},precise=False),
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
PROGRAMS['水之抚慰']['steps'].append(dict(op='removeStatus',amount=P,allocate=True,exclude=['欲眠','恐惧','魅惑','沮丧','亢奋','精神束缚']))
PROGRAMS['疗伤']['steps'].append(dict(op='removeStatus',amount=P,types=['流血']))

# Every remaining clause remains an implementation item, never a missing rule.
EXTRA_GAPS={
 '魔法飞弹':['多枚、悬浮与穿透进化需专用声明和投射物事件'],
 '阳炎炮':['贯穿链的逐目标预算'],
 '物理盾':['反射施放及激发后的单次吸收替换'],
 '识破隐形':['感官范围与地图定位联动'],
 '大脑封闭术':['心灵免疫与信息伪造事件'],
 '通晓语言':['语言资格与超自然词义分离'],
 '意识感应场':['盲视与实际感知范围联动'],
 '防护环境':['环境类型与免疫联动'],
 '赫里斯塔莎资讯屏蔽':['探知和反侦测等级对抗'],
 '晨星斗篷':['非魔法伤害免疫接防护阶段'],
 '前知综合预警':['措手免疫接防御阶段'],
 '精神护甲':['心灵免疫接状态阶段'],
}
def main():
 count=0
 for path in DEST.glob('*.rule.json'):
  doc=json.loads(path.read_text(encoding='utf-8'));name=doc['identity']['name']
  if doc['identity']['category']!='spell':continue
  source=(KIT/doc['reading']['path']).read_text(encoding='utf-8')
  start=source.index('### '+name);body=source[start:];body=re.split(r'\n###? ',body,maxsplit=1)[0]
  field=re.search(r'\*\*(?:法系／子技能|学系／子技能)：\*\*(.+)',body)
  subs=[]
  if field:
   text=field.group(1).strip().rstrip('。');subs=re.findall(r'神秘[·・]([^，。；、／\s]+)',text)
   if not subs and '／' in text:
    left=text.split('／')[0];right=text.split('／')[-1].split('；')[0].strip()
    subs=re.split('[＋+]',left if '两子技能' in right else right)
   subs=[x.strip().rstrip('。') for x in subs]
  doc['definition']['subskills']=subs
  doc['definition']['requiresAllSchools']=len(subs)>1
  doc['definition']['schools']=subs
  if name in PROGRAMS:
   doc['definition']['programs']={'cast':PROGRAMS[name]};doc['definition']['schools']=subs
   # The section's explicit components override the common default. Focus is
   # a common casting constraint even where only posture/language are listed.
   components=re.search(r'\*\*(?:消耗／成分|成分)：\*\*(.+)',body)
   if components:
    text=components.group(1);doc['definition']['programs']['cast']['components']=[key for label,key in [('姿势','posture'),('语言','language')] if label in text]+['focus']
   doc['actions']=[{'id':'cast','name':name,'operation':'cast','actionCost':PROGRAMS[name]['action'],'requiredChoice':'actual-targets','requestFields':['actorId','objectId','operation','part'],'allowsModelNumericEffects':False,'route':'mechanism','objectType':'kitResource'}]
   doc['inputs']=[{'id':k,'type':t,'provider':p,'requiredFor':'cast','missingPolicy':'require_input_for_dependent_action'} for k,t,p in [('ownership','object','saved-state'),('casting','object','saved-state'),('targetIds','array','player'),('components','object','host'),('pool','string','player')]]
   doc['clauses'][0]['status']='partial';doc['verification']['status']='partial'
   doc['implementationGaps']=EXTRA_GAPS.get(name,[])+['需执行级完整验证，检查等级/特殊关键词/版本变体；不可仅凭程序存在标记完成']
   count+=1
  path.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'authoredPrograms':count}))
if __name__=='__main__':main()
