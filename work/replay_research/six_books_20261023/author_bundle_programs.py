"""Data-only acquisition stages and specializations from imperial-mage.md."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[3];KIT=ROOT.parent/'901-resource-authoring-kit'
def expr(op,*args):return {'op':op,'args':list(args)}
def c(key):return {'context':key}
def eq(key,value):return {'test':'eq','left':c(key),'right':value}
def both(*args):return {'all':list(args)}
def either(*args):return {'any':list(args)}
def has(school):return either(eq('resourceChoices.primary',school),both(eq('resourceGrade','C'),eq('resourceChoices.secondary',school)))
def master(school):return both(eq('resourceChoices.primary',school),eq('resourceGrade','C'))
def casting(school):return both(eq('casting',True),{'test':'contains','left':c('schools'),'right':school})
schools=['治愈','炼金','结界','塑能','变化','咒法','预言','幻术','心灵']
for path in (KIT/'resources/execution').glob('*.rule.json'):
 d=json.loads(path.read_text(encoding='utf-8'))
 if d['id']!='imperial-mage':continue
 spec=d['definition'];spec['learning']={'byGrade':{'D':15,'C':35},'CRequiresD':True}
 spec['acquisition']={
  'grades':['D','C'],'choices':{'primary':{'values':schools,'required':True},'secondary':{'values':schools,'required':False,'distinctFrom':'primary','fromGrade':'C'}},
  'pool':{'capacity':expr('floor',expr('div',expr('add',c('INT'),c('PER')),4)),
          'recovery':{'longRest':True,'longRestHours':8,'meditation':{'intervalMinutes':60,'attributeAutos':['智力','感知']}}},
  'casting':'imperial','stages':{
   'D':{'effects':[{'type':'poolCapacity','value':5,'when':eq('resourceChoices.primary','咒法')}],
        'learningGrants':[{'id':'initial','count':1,'schoolChoice':'primary'}]},
   'C':{'effects':[{'type':'poolCapacity','value':10},{'type':'poolCapacity','value':5,'when':eq('resourceChoices.secondary','咒法')}],
        'learningGrants':[{'id':'alchemy','count':1,'school':'炼金','when':eq('resourceChoices.primary','炼金')},
                          {'id':'divination','count':2,'school':'预言','when':eq('resourceChoices.primary','预言')}]}}}
 effects=[]
 def add(stat,value,when,group='training',stacking=None):
  effects.append(dict(stat=stat,value=value,when=when,group=group,**({'stacking':stacking} if stacking else {})))
 add('check',3,both(has('治愈'),eq('skill','医学'),eq('purpose','treatment')))
 add('check',4,both(master('治愈'),casting('治愈')))
 for school in ['治愈','结界','塑能','咒法','心灵']:add('spellPower',1,both(master(school),{'test':'contains','left':c('schools'),'right':school}),'specialization')
 for value,condition in [(1,has('炼金')),(4,master('炼金'))]:add('check',value,both(condition,eq('sub','炼金')),'specialization')
 add('check',2,both(has('炼金'),eq('purpose','alchemyIdentification')),'identification')
 add('craftTimeMultiplier',.5,both(master('炼金'),eq('school','炼金')),'specialization')
 add('check',3,both(has('塑能'),casting('塑能'),eq('attack',True)))
 add('check',3,both(has('幻术'),casting('幻术')))
 add('mindStatusReduction',4,has('心灵'),'mindTraining')
 for value,condition in [(3,has('预言')),(6,master('预言'))]:add('check',value,both(condition,eq('selfDivinationActive',True),{'test':'in','left':c('purpose'),'values':['detection','magicIdentification']}))
 add('check',3,both(has('变化'),eq('selfMovementSpell',True),eq('skill','运动')))
 add('walkingMultiplier',2,both(master('变化'),eq('selfWalkingSpell',True)),'transformation')
 add('selfProtectionDefense',3,both(has('结界'),eq('selfProtectionSpell',True)),'protectionTraining')
 spec['effects']=effects
 d['actions']=[{'id':'claimLearning','name':'选择已获得的授术名额','operation':'claimLearning','actionCost':'none','requiredChoice':'resourceIds','requestFields':['actorId','objectId','operation','part'],'allowsModelNumericEffects':False,'route':'mechanism','objectType':'kitResource'}]
 d['version']='2026-10-25.5'
 d['verification']['testReferences']=['work/rules_engine/gm_runtime/resource-program.test.mjs: protection training / self-cast transformation walking']
 d['verification']['status']='partial'
 d['implementationGaps']=['NPC法系辨识与实际感官资格','幻术C瞬发动作预占','变化运动判定与预言感知特性仍须持续来源联动；步法已接实际自施速度效果，沿墙/液面来源程序仍待接入','专精取得与免费授术执行级验证']
 for clause in d['clauses']:clause['status']='partial'
 path.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
