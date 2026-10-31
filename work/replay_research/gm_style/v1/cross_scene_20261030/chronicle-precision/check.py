"""Recheck the causal path; prose accuracy and attribution are reviewed separately."""
import json
from pathlib import Path

base=Path(__file__).resolve().parent
first=json.loads((base/"final-first.json").read_text(encoding="utf-8"))
last=json.loads((base/"final-next.json").read_text(encoding="utf-8"))
public, private="蓝鹊五铃","砂灯六纹"

for result in (first,last):
    assert result["chronicles"]
    for text in result["chronicles"].values():
        assert text.split("|")[2].strip()=="未交代",text
        if private in text:
            assert "御临风" in text and any(w in text for w in ("私","心里","心中","未透露","未公开","没有告诉","未告知","未对任何人提及")),text
    assert all(private not in row["content"] for row in result["worldbookFacts"] if "重要角色表" in row["comment"])
    g=next(line for line in result["timeAndProtagonistRows"].splitlines() if line.startswith("| 全局状态 |") and "当前详细地点" not in line)
    assert all(cell.strip() in ("","NULL","未交代","未知") for cell in g.split("|")[-4:-1]),g
    assert all(q["recallRuleInActualNarration"] and q["quantifierRuleInActualNarration"] for q in result["actualNarrations"])
    for r in result["runs"]:
        assert r["before"]==r["after"]
        assert r["after"]["revision"]==0

fills=[q for q in first["autoFillCalls"] if q["publicInInput"] and q["privateCodeInInput"]]
assert any(q["completed"] and q["fillTimeRule"] and q["privateKnowledgeRule"] and q["quantityAndDirectionRule"]
           and not q["obsoleteForcedFormat"] and q["returnedChronicleInsert"] for q in fills)
assert any(all(token in text for token in ("一群","人数未详","来向未详",public))
           for text in first["chronicles"].values())
assert any("AM0003" in text and "人数与来向" in text for text in last["chronicles"].values())
assert len(last["messages"])==7 and len(last["runs"])==2
# The host may see explicitly attributed private memory. NPC knowledge is
# assessed against the character row and the actual visible reply.
request,=[q for q in last["runs"][-1]["requests"] if q["kind"]=="narration"]
assert not request["firstTurnInputVerbatim"] and not request["firstTurnReplyOpening"]
assert any(m["role"]=="system" and "AM000" in m["line"] and "镇民" in m["line"] and public in m["line"] for m in request["matches"])
assert all(private not in m["text"] for m in last["messages"] if not m["user"])
assert public in last["messages"][-1]["text"]
print("Verified generated time fields, source of blind recall, private marker and unchanged rule state.")
