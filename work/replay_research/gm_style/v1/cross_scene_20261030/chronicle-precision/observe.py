"""Capture evidence from the isolated workstation without storing API settings."""
import json
import sys
from prepare import DETAILS, HERE, PRIVATE, QUANTIFIERS, RECALL, TIME, lab
from inspect_lab import inspect

def collect():
    observation=inspect()
    entries=lab.read(lab.USER/"worlds"/(lab.BOOK+".json"))["entries"]
    exports={e["comment"]:e["content"] for e in entries.values() if "TavernDB-" in e.get("comment","")}
    observation["chronicles"]={k:v for k,v in exports.items() if "CustomExport-纪要-" in k and "包裹" not in k}
    observation["timeAndProtagonistRows"]=next((s.split("# 主角技能表")[0] for k,s in exports.items() if k.endswith("ReadableDataTable")),"")
    raw=(lab.USER/"chats"/lab.NAME/(lab.CHAT+".jsonl")).read_text(encoding="utf-8")
    meta=json.loads(raw.splitlines()[0])["chat_metadata"]
    rule_evidence=[]
    for run in meta.get("auto_fill_observations",[]):
        for request in run["requests"]:
            msgs=request.get("messages",[])
            if not any(m.get("role")=="user" and "裁定路径：" in str(m.get("content")) for m in msgs):
                continue
            joined="\n".join(str(m.get("content")) for m in msgs)
            rule_evidence.append({"id":run["id"],"recallRuleInActualNarration":RECALL in joined,
                                  "quantifierRuleInActualNarration":QUANTIFIERS in joined,
                                  "privateCodeInActualNarration":lab.PRIVATE in joined,
                                  "input":next(m["text"] for m in run["messages"] if m["user"])})
    observation["actualNarrations"]=rule_evidence
    # Server output contains escaped newlines. Retain only presence checks.
    log=(lab.LAB/"stdout.log").read_text(encoding="utf-8",errors="replace")
    fills=[]
    current_candidate_seen=False
    for part in log.split("Chat Completion request:")[1:]:
        request,sep,response=part.partition("Chat Completion response:")
        if QUANTIFIERS in request:
            current_candidate_seen=True
        if not current_candidate_seen or "只输出一对<tableEdit>" not in request:
            continue
        fills.append({"publicInInput":lab.PUBLIC in request,"privateCodeInInput":lab.PRIVATE in request,
                      "fillTimeRule":TIME in request,"privateKnowledgeRule":PRIVATE in request,
                      "quantityAndDirectionRule":DETAILS in request,
                      "obsoleteForcedFormat":"time_span 格式必须为 YYYY-MM-DD HH:MM" in request,
                      "completed":bool(sep),"returnedChronicleInsert":"INSERT INTO chronicle" in response})
    observation["autoFillCalls"]=fills
    return observation

if __name__=="__main__":
    evidence=collect()
    if len(sys.argv)>1:
        assert sys.argv[1] in ("first","next","attempt1-first","attempt1-next","quantifier-only-next","final-first","final-next")
        with (HERE/(sys.argv[1]+".json")).open("x",encoding="utf-8") as f:
            json.dump(evidence,f,ensure_ascii=False,indent=2)
            f.write("\n")
    print(json.dumps({"floors":len(evidence["messages"]),"last":evidence["messages"][-1]["text"],
                      "chronicles":evidence["chronicles"],"fills":evidence["autoFillCalls"],"requests":evidence["actualNarrations"]},
                     ensure_ascii=False)[:3500])
