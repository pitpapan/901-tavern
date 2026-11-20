from pathlib import Path
import json, jsonschema
base=Path(__file__).parent
load=lambda p:json.loads(p.read_text(encoding="utf-8-sig"))
rule="明确直接向某人说出且没有接收障碍可以received，不强求复述确认；计划、假设、内心话不算接收。"
rows=[]
for attempt in load(base/"live/run.json")["attempts"]:
    case=attempt["id"]
    req=load(base/("live/"+case+".request.json"))
    if case.startswith('08-'):
        old=load(base.parent/("bound-receptions-live-20261114/batch/"+case+".request.json"))
        compare=json.loads(json.dumps(req));compare["messages"][0]["content"]=compare["messages"][0]["content"].replace(rule,"")
        assert compare==old
        assert load(base/("batch/"+case+".seed.json"))==load(base.parent/("bound-receptions-live-20261114/batch/"+case+".seed.json"))
    else:
        old=load(base.parent/("parallel-ten-20261114/batch/"+case+".request.json"))
        assert {k:v for k,v in req.items() if k!="messages"}=={k:v for k,v in old.items() if k!="messages"}
        assert req["messages"][0]==old["messages"][0]
        body=json.loads(req["messages"][1]["content"]);oldbody=json.loads(old["messages"][1]["content"])
        assert body["request"]==oldbody["request"] and body["memory"]==oldbody["memory"]
        parent=load(base/"live/08-ambiguous-listener.applied.json")
        assert body["pending"]==parent["result"]["pending"]
        assert load(base/("batch/"+case+".seed.json"))==load(base/"live/08-ambiguous-listener.after.seed.json")
    raw=load(base/("live/"+case+".raw-response.txt"))
    content=(base/("live/"+case+".content.txt")).read_text(encoding="utf-8")
    assert raw["choices"][0]["message"]["content"]==content
    reply=json.loads(content)
    if "response_format" in req:
        jsonschema.Draft202012Validator(req["response_format"]["json_schema"]["schema"]).validate(reply)
        docs={d["id"]:d["text"] for d in json.loads(req["messages"][1]["content"])["assertion"]["documents"]}
    else:
        body=json.loads(req["messages"][1]["content"])
        assert set(reply)=={"inputRef","required"} and reply["inputRef"]==body["inputRef"]
        assert isinstance(reply["required"],list) and all(r in [p["id"] for p in body["pending"]] for r in reply["required"])
        docs={}
    spans=[]
    def walk(v):
        if isinstance(v,dict):
            if set(v)=={"documentId","start","end","quote"}:
                assert docs[v["documentId"]].encode("utf-16-le")[v["start"]*2:v["end"]*2].decode("utf-16-le")==v["quote"]
                spans.append(v)
            for item in v.values():walk(item)
        elif isinstance(v,list):
            for item in v:walk(item)
    walk(reply)
    applied=load(base/("live/"+case+".applied.json"))
    assert applied["localProtocolPassed"]
    rows.append({"id":case,"schema":True if "response_format" in req else "original dependency contract","exactUtf16Spans":len(spans),"frozenInputAndParametersVerified":True,"originalRuntime":True})
(base/"offline-audit.json").write_text(json.dumps(rows,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps(rows,ensure_ascii=False))
