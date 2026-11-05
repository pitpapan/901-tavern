import copy,importlib.util
from pathlib import Path
H=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('relationship_previous',H.parent/'relationship-direction/candidate.py')
previous=importlib.util.module_from_spec(spec);spec.loader.exec_module(previous)
SYSTEM=previous.SYSTEM
RULES=copy.deepcopy(previous.RULES)
KEY='sheet_relationship_facts'
HEADERS=['row_id','主体','对象','具体事项','关系种类','当前状态','来源','知情范围']
DDL='''CREATE TABLE relationship_facts ( -- 独立关系事项
 row_id INTEGER PRIMARY KEY, -- 行号
 subject_name TEXT NOT NULL, -- 主体
 object_name TEXT NOT NULL, -- 对象
 matter TEXT NOT NULL, -- 具体事项
 relation_kind TEXT NOT NULL, -- 关系种类
 state TEXT, -- 当前状态
 source TEXT, -- 来源
 known_by TEXT, -- 知情范围
 UNIQUE(subject_name,object_name,matter,relation_kind)
);'''
# Explicit migration of the established controlled fixture, not a general lore extractor.
INITIAL=[
 [1,'黄泉','御临风','同行','同行','同行','原人物行；既有上一阶段总结','御临风、黄泉'],
 [2,'掌柜','黄泉','修缮费用','欠款','已结清','AM0006、AM0007','御临风、黄泉、掌柜'],
 [3,'黄泉','掌柜','下一站行程','披露','不愿透露；未告知','AM0007；原人物行','御临风、黄泉；掌柜未获知下一站'],
 [4,'黄泉','黎舟','修伞','合作','曾合作修伞','AM0012；双方原人物行','黄泉、黎舟；其他人未交代'],
 [5,'黄泉','黎舟','青竹伞','借入','未归还','AM0005：黄泉答应归还；双方原人物行','黄泉、黎舟；其他人未交代'],
 [6,'黄泉','黎舟','转述传闻','可信度','不信','AM0012；黄泉原人物行','黄泉；是否告知他人未交代'],
]
RULES['重要角色表']['note']='记录已知人物身份、外貌、在场状态和过往经历，不按提名补全档案或默认形象。relation_text为停用兼容列，保持SQL NULL：关系只在独立关系事项表维护，委托状态由任务与事件表和纪要维护。past_experience保留来源及知情者；interaction_options留空，旧选项不构成已选动作。'
RULES['重要角色表']['updateNode']='只更新有新证据的身份、状态、位置和经历，不更新relation_text，不把私人想法变成该人物知识。'
RULES['独立关系事项']=dict(ddl=DDL,
 note='每行只保存主体对对象的一种具体事项，主体＋对象＋事项＋关系种类标识同一记录。合作、对某件事的信任、对另一消息的可信度、借还、欠款、行程披露分别成立，不合成总体亲疏。subject_name/object_name不互换；借入行主体是借入方、对象是借出方、matter是物品，state用未归还/已归还/有据其他状态。来源留原话或已有纪要编号，known_by只记有知情证据者，玩家[]按私人想法标明未告知NPC。任务承接/进度仍归任务表与纪要，不在此重复。',
 initNode='按明确的已有关系建立独立事项，没有关系证据则空表。',
 insertNode='有新事项或不同关系种类时新增；先匹配主体、对象、事项与关系种类，不能用新事项替换另一个事项。',
 updateNode='同一事项的状态、来源或知情范围任一有新证据时，更新对应列：态度不变但当面说出或转告，也更新source及known_by，保留state。WHERE用该行row_id或完整四项身份；不改变身份字段，不因未再提及覆盖旧值。',
 deleteNode='不因阶段总结或人物暂离删除；结束的借还等更新状态并保留来源。')
RULES['大总结']['note']='按已完成阶段追加历史总结，已有行不可修改或删除。仅当本次请求中已存在的可见纪要达到$RECENT_CHRONICLE_ROWS条时新增，不计本轮拟插入行。按因果与时序承接新事件、决定、订正及知情范围；关系读独立关系事项表，同一对象的不同事项可并存。关系当前状态由事项表持续供续写读取，总结不代替或删除事项行；涉及借还明确借入方、借出方及待履行者。新增后由系统隐藏已归纳纪要，不自行操作隐藏列。'

def table(base,rows=None):
 t=copy.deepcopy(base);t.update(uid=KEY,name='独立关系事项',orderNo=9)
 t['sourceData']=copy.deepcopy(RULES['独立关系事项']);t['content']=[HEADERS.copy()]+copy.deepcopy(rows or [])
 # The isolated host renders this table directly; avoid duplicating it in a generic worldbook export.
 t['exportConfig'].update(enabled=False,entryName='独立关系事项',extraIndexEnabled=False)
 return t

def patch(x):
 if isinstance(x,dict):
  for v in list(x.values()):patch(v)
  if 'sheet_zhong_yao_jue_se_biao' in x and isinstance(x['sheet_zhong_yao_jue_se_biao'],dict) and 'sourceData' in x['sheet_zhong_yao_jue_se_biao']:
   if KEY not in x:x[KEY]=table(x['sheet_zhong_yao_jue_se_biao'])
  if isinstance(x.get('name'),str) and x['name'] in RULES and 'sourceData' in x:
   x['sourceData'].update(copy.deepcopy(RULES[x['name']]))
   if x['name']=='重要角色表':
    for r in x.get('content',[])[1:]:r[9]=None
 elif isinstance(x,list):
  for v in x:patch(v)
