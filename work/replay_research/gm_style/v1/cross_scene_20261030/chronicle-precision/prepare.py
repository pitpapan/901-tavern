"""Install the two candidate rules in the private test data root only."""
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "auto-chronicle"))
import lab

lab.LAB = Path("C:/Users/pit/AppData/Local/901-chronicle-precision-20261031")
lab.USER = lab.LAB / "data/default-user"
lab.INPUT1 = '我等一拨镇民经过，随后对黄泉说：“这次交接的记号定为蓝鹊五铃，请你记住。”[我自己想了一个备用记号砂灯六纹，还没有告诉任何人。]我等她答复。'
lab.INPUT2 = '我问黄泉：“请你把刚才公开约定的交接记号说一遍。刚才经过的是什么人？你记得具体有多少、是从哪边来的吗？还有别的记号是我告诉过你的吗？”我听她回答。'
RECALL = '承接或复述已经发生的事，人数、方向、位置和动作细节沿用原记录的精度。有“大约”“几名”“路过”等记载，保留其不确定性。被追问而记录缺少人数或来向时，人物可以自然回答“没数”“没留意来向”。不要用回忆口吻为同一件事补精确人数、街角、路口或方位。原文确已给出人数、来向时照实回答。'
RECALL += '同一边界从玩家当轮写完的动作就开始生效。玩家先交代一件事已经结束、随后开口，就从听者对这句话的即时反应起笔；不重演先前经过的过场，也不替已经离开的人群续写外貌、人数、所带物品或路线。这些补笔会被下一轮纪要误收为亲历事实。'
TIME = '剧情时间只取自已确认的场景事实。仅当起止时刻都有依据时才写具体区间；只给相对或模糊时间，按原精度记录；完全没有时间依据，纪要的 time_span 写“未交代”。现实系统时间、消息时间戳、示例日期及惯常对话耗时均不能作剧情时间。'
PRIVATE = '玩家的 [] 和【】标记未说出口的内心活动，NPC 的知情记录仅取自其听到、看到或被明确告知的内容。'
QUANTIFIERS = '在回忆对白中分清身份、数量、来向。用原记录的集合称谓指代群体，把未确定的数量或来向直接作为未知回答。答复中的量词和代词须与记录的单复数一致；被问及而无从核实的细节可以留白。确有明确数量或来向的则保留原值。'
DETAILS = '纪要压缩时保留影响复述的量词和限定词。对于当事人看到的人群经过，写回已证实的集合或确数，并把具体人数、来向中未能确定的部分紧跟在该群体之后，明记为“人数未详”或“来向未详”；有依据的照实写。不要将群体压缩成不分单复数的孤立身份名词。经过地点和观察者随后看向的位置都不能充作人群的来向。'

def fix_tables(tables):
    g=tables["sheet_quan_ju_shu_ju_biao"]["sourceData"]
    c=tables["sheet_ji_yao_biao"]["sourceData"]
    assert "时间格式：" in g["note"] and "2.时间跨度格式为" in c["note"]
    g["note"]=g["note"].split("时间格式：")[0]+TIME+'\n精确时刻有依据时用 YYYY-MM-DD HH:MM；已知起点且经过时长明确时可以计算终点。未知的时间列可为 NULL。'
    g["initNode"]='初始化时记录已经给出的地点和时间。只知道地点时只插入已知列，时间列留 NULL。'
    g["updateNode"]='仅更新有新证据的字段。已确认的地点变动可单独更新。没有时间证据则保留时间字段；不得用猜测的分钟数推进时钟。'
    start=c["note"].index("2.时间跨度格式为")
    stop=c["note"].index("3.概览",start)
    c["note"]=c["note"][:start]+"2."+TIME+"\n"+c["note"][stop:]+"\n"+DETAILS
    c["insertNode"]='按本表既有条件插入纪要，code_index 自 AM0001 递增且唯一。time_span、summary 和 chronicle_text 均应填写。'+TIME

def fix_seed():
    p=lab.USER/"chats"/lab.NAME/(lab.CHAT+".jsonl")
    rows=[json.loads(line) for line in p.read_text(encoding="utf-8").splitlines()]
    meta=rows[0]["chat_metadata"]
    scope=meta["TavernDB_ACU_ScopedConfig"]["template"][""]
    tpl=json.loads(scope["templateStr"]); fix_tables(tpl)
    scope["templateStr"]=json.dumps(tpl,ensure_ascii=False)
    if isinstance(scope.get("guideData"),dict) and "sheet_ji_yao_biao" in scope["guideData"]:
        fix_tables(scope["guideData"])
    fix_tables(meta["TavernDB_ACU_InternalSheetGuide"]["tags"][""]["data"])
    fix_tables(rows[3]["TavernDB_ACU_IsolatedData"][""]["storageFrame"]["checkpoint"]["data"])
    p.write_text("".join(json.dumps(r,ensure_ascii=False)+"\n" for r in rows),encoding="utf-8")

def configure_fill():
    settings=lab.USER/"settings.json"
    s=lab.read(settings)
    store=s["extension_settings"]["__userscripts"]["shujuku_v120__userscript_settings_v1"]
    key=next(k for k in store if k.endswith("____default____settings"))
    cfg=json.loads(store[key])
    prompt=cfg["charCardPrompt"][0]["content"]
    assert prompt.startswith("你负责维护901")
    for rule in (TIME,PRIVATE,DETAILS):
        if rule not in prompt:
            prompt+="\n"+rule
    cfg["charCardPrompt"][0]["content"]=prompt
    store[key]=json.dumps(cfg,ensure_ascii=False)
    lab.put(settings,s)

if __name__=="__main__":
    if sys.argv[1:]==["card-only"]:
        assert (lab.LAB/"protection.json").is_file()
        lab.make_card(RECALL+"\n"+QUANTIFIERS)
        sys.exit(0)
    if sys.argv[1:]==["retry-recall"]:
        import shutil
        p=lab.USER/"chats"/lab.NAME/(lab.CHAT+".jsonl")
        rows=[json.loads(line) for line in p.read_text(encoding="utf-8").splitlines()]
        assert len(rows)==8 and rows[6]["mes"]==lab.INPUT2
        shutil.copyfile(p,lab.LAB/"retained-ambiguous-reply.jsonl")
        runs=rows[0]["chat_metadata"]["auto_fill_observations"]
        assert [r["id"] for r in runs]==["auto-event","recall"]
        del runs[1:]
        assert rows[5]["TavernDB_ACU_IsolatedData"][""]["storageFrame"]["logEntries"]
        p.write_text("".join(json.dumps(r,ensure_ascii=False)+"\n" for r in rows[:6]),encoding="utf-8")
        shutil.copyfile(lab.FORMAL/"worlds/901_01_世界基础设定_20261023.json",
                        lab.USER/"worlds"/(lab.BOOK+".json"))
        lab.make_card(RECALL+"\n"+QUANTIFIERS)
        sys.exit(0)
    if sys.argv[1:]==["fresh-seed"]:
        # Browser must be closed. Reset both the DB storage and its exported copy.
        import shutil
        assert lab.USER.is_relative_to(lab.LAB) and (lab.LAB/"protection.json").is_file()
        lab.reset_seed()
        fix_seed()
        lab.make_card(RECALL+"\n"+QUANTIFIERS)
        configure_fill()
        shutil.copyfile(lab.FORMAL/"worlds/901_01_世界基础设定_20261023.json",
                        lab.USER/"worlds"/(lab.BOOK+".json"))
        sys.exit(0)
    lab.prepare(RECALL+"\n"+QUANTIFIERS)
    fix_seed()
    configure_fill()
