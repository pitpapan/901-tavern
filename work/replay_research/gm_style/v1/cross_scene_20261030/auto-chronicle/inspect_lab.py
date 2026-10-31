"""Read only the lab chat and its worldbook. Store observations outside the server."""
import json
import sys
from lab import BOOK, CHAT, HERE, NAME, PRIVATE, PUBLIC, USER, read, sha

def values_with_cues(obj, path=""):
    if isinstance(obj,dict):
        for key,value in obj.items():
            yield from values_with_cues(value,path+"/"+key)
    elif isinstance(obj,list):
        for i,value in enumerate(obj):
            yield from values_with_cues(value,path+"/"+str(i))
    elif isinstance(obj,str) and (PUBLIC in obj or PRIVATE in obj):
        yield {"path":path,"value":obj[:1200]}

def inspect():
    path=USER/"chats"/NAME/(CHAT+".jsonl")
    data=[json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines()]
    entries=read(USER/"worlds"/(BOOK+".json"))["entries"]
    facts=[{"uid":v["uid"],"comment":v.get("comment"),"active":not v.get("disable"),
            "content":v["content"]} for v in entries.values() if any(w in v.get("content","") for w in [PUBLIC,PRIVATE,"备用记号"])]
    frames=[]
    for i,m in enumerate(data[1:]):
        frame=m.get("TavernDB_ACU_IsolatedData",{}).get("",{}).get("storageFrame")
        if frame:
            journal=frame.get("checkpoint",{}).get("data",{}).get("sheet_ji_yao_biao",{}).get("content",[])
            frames.append({"floor":i,"logEntries":len(frame.get("logEntries",[])),"chronicleInCheckpoint":journal[1:],
                           "cueCells":list(values_with_cues(frame))})
    runs=[]
    for run in data[0]["chat_metadata"].get("auto_fill_observations",[]):
        requests=[]
        for q in run["requests"]:
            msgs=q.get("messages",[])
            lines=[m for m in msgs if isinstance(m.get("content"),str)]
            kind=("narration" if any(m.get("role")=="user" and "裁定路径：" in m["content"] for m in lines)
                  else "classifier" if any("你是901行动分类器" in m["content"] for m in lines) else "other")
            matches=[]
            for m in lines:
                for line in m["content"].splitlines():
                    if any(w in line for w in [PUBLIC,PRIVATE,"备用记号","打量路过镇民"]):
                        matches.append({"role":m["role"],"line":line[:1200],"memoryWrapper":"<记忆回溯>" in m["content"]})
            joined="\n".join(m["content"] for m in lines)
            requests.append({"kind":kind,"model":q.get("model"),"matches":matches,
                             "firstTurnInputVerbatim":len(data)>4 and data[4]["mes"] in joined,
                             "firstTurnReplyOpening":len(data)>5 and data[5]["mes"][:22] in joined,
                             "sha256":sha(json.dumps(msgs,ensure_ascii=False).encode())})
        runs.append({"id":run["id"],"requests":requests,"before":run.get("beforeState"),"after":run.get("afterState")})
    return {"messages":[{"floor":i,"user":m["is_user"],"text":m["mes"]} for i,m in enumerate(data[1:])],
            "frames":frames,"worldbookFacts":facts,"runs":runs}

if __name__=="__main__":
    evidence=inspect()
    if len(sys.argv)>1:
        name=sys.argv[1]
        assert name in ["first-round","next-round","retry-first","retry-next"]
        with (HERE/(name+".json")).open("x",encoding="utf-8") as out:
            json.dump(evidence,out,ensure_ascii=False,indent=2)
            out.write("\n")
    print(json.dumps({"messages":len(evidence["messages"]),"latest":evidence["messages"][-1],
        "frames":[[f["floor"],f["logEntries"],len(f["cueCells"])] for f in evidence["frames"]],
        "book":evidence["worldbookFacts"],"runs":[r["id"] for r in evidence["runs"]]},ensure_ascii=False)[:3400])
