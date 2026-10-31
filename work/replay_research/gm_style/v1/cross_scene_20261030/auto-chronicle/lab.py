"""Build a temporary, loopback-only data root from the isolated database fixture."""
from pathlib import Path
import base64
import hashlib
import json
import shutil
import struct
import sys
import zlib

APP = Path("D:/github/sillyTavern")
FORMAL = APP / "data/default-user"
LAB = Path("C:/Users/pit/AppData/Local/901-autofill-lab-20261031")
USER = LAB / "data/default-user"
HERE = Path(__file__).resolve().parent
NAME = "901 正式数据库事实验收 20261031"
CHAT = NAME + " - 01独立纪要"
BOOK = NAME + " 主书副本"
PUBLIC = "蓝鹊五铃"
PRIVATE = "砂灯六纹"
INPUT1 = '我对黄泉说：“这次交接的记号定为蓝鹊五铃，请你记住。”[我自己想了一个备用记号砂灯六纹，还没有告诉任何人。]我等黄泉答复。'
INPUT2 = '我问黄泉：“请你把刚才公开约定的交接记号说一遍。你记住它后往哪里看了一眼？还有别的记号是我告诉过你的吗？”我听她回答。'

def read(p):
    return json.loads(p.read_text(encoding="utf-8-sig"))

def put(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2)+"\n",encoding="utf-8")

def sha(b):
    return hashlib.sha256(b).hexdigest()

def snapshot():
    files=[FORMAL/"settings.json", FORMAL/"secrets.json"]
    for folder in ("chats","group chats","characters","worlds"):
        files.extend(p for p in (FORMAL/folder).rglob("*") if p.is_file())
    return {str(p.relative_to(FORMAL)):sha(p.read_bytes()) for p in files}

def patch_png(src, dest, recorder):
    raw=src.read_bytes()
    out=bytearray(raw[:8])
    i=8
    changed=0
    while i<len(raw):
        size=int.from_bytes(raw[i:i+4],"big")
        tag=raw[i+4:i+8]
        chunk=raw[i+8:i+8+size]
        if tag==b"tEXt" and chunk.split(b"\0",1)[0] in (b"chara",b"ccv3"):
            key, encoded=chunk.split(b"\0",1)
            card=json.loads(base64.b64decode(encoded))
            scripts=card["data"]["extensions"]["tavern_helper"]["scripts"]
            host=next(s for s in scripts if s["name"]=="901 帝都初始卡入口")
            assert sha(host["content"].encode())=="b7148f4d6d84a3f8212f16b299f0ba5c59168c36bf9a42c2c28fbd56557f253a"
            opt="max_chat_history:'all'"
            assert host["content"].count(opt)==1
            host["content"]=host["content"].replace(opt,"max_chat_history:SillyTavern.chat.some(m=>m.is_user && m.mes.includes('请你把刚才公开约定的交接记号说一遍'))?0:'all'")
            next(s for s in scripts if s["name"]=="数据库事实验收采集")["content"]=recorder
            chunk=key+b"\0"+base64.b64encode(json.dumps(card,ensure_ascii=False).encode())
            changed+=1
        out.extend(struct.pack(">I",len(chunk))+tag+chunk+struct.pack(">I",zlib.crc32(tag+chunk)))
        i+=size+12
    assert changed and i==len(raw)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(out)

def prepare():
    LAB.mkdir(exist_ok=False)
    put(LAB/"protection.json",snapshot())
    shutil.copyfile(APP/"config.yaml",LAB/"config.yaml")
    s=read(FORMAL/"settings.json")
    u=s["extension_settings"]["__userscripts"]["shujuku_v120__userscript_settings_v1"]
    key=next(k for k in u if k.endswith("____default____settings"))
    cfg=json.loads(u[key])
    assert cfg["autoUpdateEnabled"] is False
    cfg.update(autoUpdateEnabled=True,autoUpdateFrequency=1,skipUpdateFloors=0,updateBatchSize=3)
    # Both tasks use the current tavern chat connection in the lab.
    for obj in [cfg]+cfg["apiPresets"]:
        obj["apiMode"]="custom"
        obj["apiConfig"].update(useMainApi=True,apiKey="",url="",requestHeaders="")
    u[key]=json.dumps(cfg,ensure_ascii=False)
    put(USER/"settings.json",s)
    secrets=read(FORMAL/"secrets.json")
    active=[r for r in secrets["api_key_custom"] if r.get("active")]
    assert len(active)==1
    put(USER/"secrets.json",{"api_key_custom":active})
    for folder in ["OpenAI Settings","context","instruct","sysprompt","TextGen Settings","themes","extensions"]:
        shutil.copytree(FORMAL/folder,USER/folder,ignore=shutil.ignore_patterns(".git","node_modules"))
    extras=next(b["extraBooks"] for b in s["world_info_settings"]["world_info"]["charLore"] if b["name"]==NAME)
    (USER/"worlds").mkdir()
    for book in ["901_01_世界基础设定_20261023",*extras]:
        shutil.copyfile(FORMAL/"worlds"/(book+".json"),USER/"worlds"/(book+".json"))
    shutil.copyfile(FORMAL/"worlds/901_01_世界基础设定_20261023.json",USER/"worlds"/(BOOK+".json"))
    reset_seed()
    make_card()
    print("Ready: isolated three-message fixture, empty chronicle, formal auto-fill off.")

def reset_seed():
    src=FORMAL/"chats"/NAME/(CHAT+".jsonl")
    rows=[json.loads(line) for line in src.read_text(encoding="utf-8").splitlines()][:4]
    rows[0]["chat_metadata"].pop("db_fact_acceptance_20261031",None)
    frame=rows[3]["TavernDB_ACU_IsolatedData"][""]["storageFrame"]
    assert not frame["logEntries"]
    tab=frame["checkpoint"]["data"]["sheet_ji_yao_biao"]["content"]
    assert len(tab)==2
    del tab[1:]
    text="".join(json.dumps(r,ensure_ascii=False)+"\n" for r in rows)
    assert all(w not in text for w in (PUBLIC,PRIVATE,"青鹭七扣"))
    dest=USER/"chats"/NAME/(CHAT+".jsonl")
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(text,encoding="utf-8")

def make_card():
    recorder=(APP/"public/901-db-fact-20261031/recorder.js").read_text(encoding="utf-8")
    first,tail=recorder.split("\n",1)
    assert first.startswith("//")
    config,tail=tail.split("\n",1)
    assert config.startswith("const cfg=")
    # Test questions are operator instructions, never added to model prompts by this recorder.
    config={"name":NAME,"chatId":CHAT,"rounds":[None,{"id":"auto-event","input":INPUT1},{"id":"recall","input":INPUT2}]}
    recorder="const cfg="+json.dumps(config,ensure_ascii=False)+";\n"+tail.replace("db_fact_acceptance_20261031","auto_fill_observations")
    patch_png(FORMAL/"characters"/(NAME+".png"),USER/"characters"/(NAME+".png"),recorder)

if __name__=="__main__":
    if sys.argv[1]=="prepare":
        prepare()
    elif sys.argv[1]=="restore-seed":
        assert (LAB/"protection.json").is_file() and USER.is_relative_to(LAB)
        shutil.copyfile(FORMAL/"worlds/901_01_世界基础设定_20261023.json",USER/"worlds/901_01_世界基础设定_20261023.json")
        reset_seed()
    elif sys.argv[1]=="protect":
        baseline=read(LAB/"protection.json")
        now=snapshot()
        changed=sorted(k for k in set(now)|set(baseline) if now.get(k)!=baseline.get(k))
        print("Protected files",len(now),"differences",changed)
        assert not changed
