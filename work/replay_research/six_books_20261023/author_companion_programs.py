"""Later kit references and item records, never a mature actor snapshot."""
from pathlib import Path
import json
from kit_companion_resources import COMPANION_RESOURCES
ROOT=Path(__file__).resolve().parents[3];KIT=ROOT.parent/'901-resource-authoring-kit';DEST=KIT/'resources/execution'
def eq(path,value):return {'test':'eq','left':{'state':path},'right':value}
def ctx(path,value):return {'test':'eq','left':{'context':path},'right':value}
def effect(stat,value,group='feat',when=None):return dict(stat=stat,value=value,group=group,**({'when':when} if when else {}))
PASSIVES={}
for actor,old in [('huang',4),('bright',3),('jiang',1)]:
 PASSIVES[actor+'.improved_initiative']={'effects':[effect('initiative',4)]+([{**effect('initiativeDefense',5),'clauseId':'initiative-defense'}] if actor!='jiang' else []),
  'legacyProfile':{'ruleset':'opening-20261022','kind':actor,'add':{'initiative':-old},'set':{'initiativeDefense':0}},
  'capabilities':[{'id':'initiativeTiePriority','level':1}] if actor!='jiang' else []}
for actor in ['bright','jiang']:
 effects=[effect('save',6,when=ctx('type','will')),effect('willEnhancement',2)]
 if actor=='jiang':effects += [effect('save',12,when={'all':[ctx('type','will'),ctx('mental',True)]}),effect('willMax',10),effect('willPerHour',1),effect('mindStatusReduction',4,'mindTraining')]
 PASSIVES[actor+'.iron_will']={'effects':effects,'legacyProfile':{'ruleset':'opening-20261022','kind':actor,'set':{'steelWill':0}}}
PASSIVES['bright.alertness']={'capabilities':[{'id':'flatFootedImmunity','level':1,'grade':'D'}]}
PASSIVES['huang.spirit_strike']={'effects':[effect('weaponMagical',1,'qualification'),effect('weaponSpirit',1,'qualification')]}
PASSIVES['bright.shimada_twins']={'effects':[effect('speed',20,'bodyMethod'),effect('terrainFreedom',1,'movement')],
 'legacyProfile':{'ruleset':'opening-20261022','kind':'bright','add':{'speed':-10}}}
ITEMS={
 'later:弃风':{'slot':'weapon','weapon':{'type':'melee','defenseReductionMinimumSkill':5,'damage':16,'severity':'L','size':3,'ap':8,'magic':8,'magical':True,'grade':'B','attackBonus':24,'blockBonus':24,'speedBonus':3,'defenseReduction':3,'force':2,'energyAbsorb':2,'skill':'白刃','sub':'长剑'}},
 'later:狮子王':{'slot':'weapon','weapon':{'type':'melee','damage':8,'severity':'L','size':3,'ap':8,'magic':8,'magical':True,'grade':'C','spiritStrike':True,'nether':True,'attackBonus':3,'blockBonus':3,'willBonus':4,'skill':'白刃','sub':'太刀'}},
 'bright.sky_bow':{'slot':'weapon','weapon':{'type':'bow','ammunition':{'kind':'arrow','cost':1,'loadingAction':'swift'},'hands':2,'damage':8,'severity':'L','ap':0,'magic':8,'magical':True,'grade':'C','spiritStrike':True,'nether':True,'attackBonus':3,'blockBonus':3,'strengthRequirement':4,'rangePerStrength':50,'explode':9,'skill':'射击','sub':'长弓'}},
 'huang.silver_armor':{'slot':'clothing','armor':{'defense':8,'ballisticProof':True,'energyWeaponProof':True}},
 'bright.mithril_chain':{'slot':'armor','armor':{'defense':4,'ballisticProof':True,'dr':1,'energyResistance':1,'energyTypes':['pure','fire','cold','electric','acid','sonic','light','holy','unholy'],'defenseExtra':1,'athleticsExtra':1,'armorClass':'light'}}}
refs={actor:list(rows.values())+(['later:狮子王','later:乱红莲'] if actor=='黄泉' else ['later:龙象般若功'] if actor=='姜子尤' else []) for actor,rows in COMPANION_RESOURCES.items()}
for path in DEST.glob('*.rule.json'):
 d=json.loads(path.read_text(encoding='utf-8'));id=d['id']
 if id in PASSIVES:
  d['definition'].update(PASSIVES[id]);d['verification']['status']='partial'
  d['implementationGaps']=['被动运行效果已接入，取得前提及所有相关动作路径仍须完整验证']
  if id=='bright.shimada_twins':d['implementationGaps']+=['刀弓同时携带、实际持用的修行攻击条件与攀爬规则']
  if id=='jiang.iron_will':d['implementationGaps']+=['既有心灵状态主动移除机会的专长修正']
  for clause in d['clauses']:clause['status']='partial'
 if id.startswith('later:') and id.split(':')[1] in refs:
  d['definition']['template']['resourceRefs']=refs[id.split(':')[1]]
  d['definition']['template']['notGrants']=['attributes','skills','resources.current','health','inventory','cooldowns','T0']
  d['verification']['status']='partial';d['implementationGaps']=['引用所列单项资源；各单项执行测试尚未全部完成，模板本身永不整卡写入']
 if id in ITEMS:
  d['definition']['equipment']=ITEMS[id]
  d['actions']=[{'id':'equip','name':'实际装备'+d['identity']['name'],'operation':'equip','actionCost':'as-declared','requiredChoice':'actual-item-and-storage','requestFields':['actorId','objectId','operation','part'],'allowsModelNumericEffects':False,'route':'mechanism','objectType':'kitResource'}]
  d['version']='2026-10-24.2'
  d['inputs']=[{'id':key,'type':typ,'provider':provider,'requiredFor':'equip','missingPolicy':'require_actual_equipment_fact'} for key,typ,provider in [('itemId','string','saved-state'),('availableHands','integer','host'),('completed','boolean','host')]]
  d['verification']['testReferences']=['work/rules_engine/gm_runtime/companion-replacement.test.mjs','work/rules_engine/gm_runtime/resource-program.test.mjs','work/rules_engine/resource-weapons.test.mjs']
  d['verification']['status']='partial'
  d['implementationGaps']=['装备实例与战斗关键词完整验证']+(['风池8小时充能及实际余额接口'] if id=='later:弃风' else [])+(['灵兽凭依另由乱红莲执行条目处理'] if id=='later:狮子王' else [])
  for clause in d['clauses']:clause['status']='partial'
  if id=='bright.mithril_chain':d['definition']['effects']=[effect('extraSuccess',1,'equipment',{'all':[eq('equippedResources.armor',id),ctx('skill','运动')]})]
 if id in ['huang.improved_initiative','bright.improved_initiative']:d['version']='2026-10-25.4'
 path.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
