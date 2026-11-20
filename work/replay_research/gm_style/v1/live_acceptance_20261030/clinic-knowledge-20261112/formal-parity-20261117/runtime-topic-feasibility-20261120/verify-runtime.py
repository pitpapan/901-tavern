"""Check the retained native saves and exact offline requests from this run."""

from collections import Counter
from hashlib import sha256
import json
from pathlib import Path

d = Path(__file__).resolve().parent
evidence = d / "evidence"
captures = evidence / "captures"


def read(path):
    return json.loads(path.read_bytes())


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def jsonl(path):
    return [json.loads(line) for line in path.read_bytes().splitlines()]


def projection(messages):
    excerpts = [
        message["content"].split("【901逐角色知情投影】\n", 1)[1]
        for message in messages
        if "【901逐角色知情投影】\n" in message["content"]
    ]
    assert len(excerpts) == 1
    excerpt = excerpts[0]
    value, offset = json.JSONDecoder().raw_decode(excerpt)
    return excerpt[:offset].encode("utf-8"), value, excerpt[offset:].splitlines()


setup = read(d / "setup.json")
app = Path(setup["app"])
assert app.resolve() == (d / "sandbox").resolve()
assert read(app / "data/default-user/secrets.json") == {}
assert digest(app / "offline-guard.mjs") == setup["offlineGuardSha256"]
assert digest(app / "src/endpoints/backends/chat-completions.js") == setup["backendSha256"]
assert digest(d / "entry.isolated.js") == setup["entrySha256"]

names = ("before", "received", "idempotent", "reopened")
snapshots = {key: read(evidence / (key + ".json")) for key in names}
seeds = {key: evidence / (key + ".seed.jsonl") for key in names}
before, received, repeated, reopened = (snapshots[name] for name in names)
assert received["chatId"] != setup["parentChatId"]
for name, snapshot in snapshots.items():
    anchor = snapshot["anchor"]
    assert snapshot["dialogueDisabled"] and snapshot["nonCanon"]
    assert snapshot["chatId"] == anchor["chatId"] == snapshot["root"]["chatId"] == received["chatId"]
    saved = jsonl(seeds[name])[anchor["messageId"] + 1]
    durable = saved["variables"][anchor["swipeId"]]["stat_data"]["901_rules_poc"]
    assert snapshot["root"] == durable

assert received["root"]["revision"] == before["root"]["revision"] + 1
assert received["root"] == repeated["root"] == reopened["root"]
assert received["context"] == repeated["context"] == reopened["context"]
assert seeds["received"].read_bytes() == seeds["idempotent"].read_bytes() == seeds["reopened"].read_bytes()
chat = app / "data/default-user/chats" / setup["character"] / (received["chatId"] + ".jsonl")
assert chat.read_bytes() == seeds["received"].read_bytes()

receipts = jsonl(evidence / "receipt-results.jsonl")
assert [item["result"]["status"] for item in receipts] == ["applied", "already_applied"]
first, second = [item["result"] for item in receipts]
assert dict(first, status="already_applied") == second
assert set(received["root"]["operations"]) - set(before["root"]["operations"]) == {first["operationId"]}
assert not before["state"]["events"]
assert Counter(event["kind"] for event in received["state"]["events"].values()) == {
    "message.arrived": 1,
    "knowledge.granted": 1,
}

assert all(not actor["facts"] for actor in before["context"]["actorKnowledge"])
actors = {actor["actorId"]: actor["facts"] for actor in received["context"]["actorKnowledge"]}
assert not actors["player"] and not actors["huang"] and len(actors["bright"]) == 1
fact = actors["bright"][0]
assert fact["id"] == "clinic.owner.xuelao.old-friend"
source, = fact["sources"]
source_anchor = source["sourceAnchor"]
assert fact["belief"] == source["belief"] == "rumor"
assert {key: source_anchor[key] for key in received["anchor"]} == received["anchor"]
saved_source = jsonl(seeds["received"])[source_anchor["messageId"] + 1]
assert saved_source["mes"] == source_anchor["text"]
assert saved_source["is_system"] and "test-only" in saved_source["mes"]
assert "钴蓝纸燕" in source_anchor["text"]

phases = ("before", "received-bright", "reopened-bright", "received-huang")
kinds = ("classification", "narration")
bodies = {}
projections = {}
capture_records = {}
for phase in phases:
    for kind in kinds:
        prefix = captures / (phase + "." + kind)
        request = prefix.with_suffix(prefix.suffix + ".request.json")
        meta = read(prefix.with_suffix(prefix.suffix + ".capture.json"))
        assert meta["bytes"] == request.stat().st_size and meta["sha256"] == digest(request)
        assert meta["upstreamCalls"] == 0 and meta["endpointIsLocal"]
        assert meta["localClassificationFixture"] == (kind == "classification")
        body = read(request)
        raw_projection, parsed_projection, topic = projection(body["messages"])
        assert parsed_projection == (before if phase == "before" else received)["context"]
        assert any("受控话题：医馆馆主与雪老之间是否有关系？" in line for line in topic)
        assert "御临风在此话题上无已建立的获知来源。" in topic
        assert "黄泉在此话题上无已建立的获知来源。" in topic
        bright_status = "无已建立的获知来源。" if phase == "before" else "已有获知来源"
        assert any(line.startswith("布莱特在此话题上" + bright_status) for line in topic)
        marker_messages = [message for message in body["messages"] if "钴蓝纸燕" in message["content"]]
        assert len(marker_messages) == (0 if phase == "before" else 1)
        assert not marker_messages or "【901逐角色知情投影】" in marker_messages[0]["content"]
        if phase == "before":
            assert all(fact["content"] not in message["content"] for message in body["messages"])
        bodies[phase, kind] = request
        projections[phase, kind] = raw_projection
        capture_records[phase + "." + kind] = meta | {"messageCount": len(body["messages"])}

for kind in kinds:
    assert bodies["received-bright", kind].read_bytes() == bodies["reopened-bright", kind].read_bytes()
    assert projections["received-bright", kind] == projections["reopened-bright", kind] == projections["received-huang", kind]

bright_question = "御临风问布莱特：“若想向老馆主打听雪老的事，你知道他们有什么来往吗？”黄泉也在旁边。"
huang_question = "御临风问黄泉：“若想向老馆主打听雪老的事，你知道他们有什么来往吗？”布莱特也在旁边。"
for kind in kinds:
    bright_body = read(bodies["received-bright", kind])
    huang_body = read(bodies["received-huang", kind])
    bright_messages = bright_body["messages"]
    if kind == "narration":
        assert len(bright_messages) == 14 and bright_messages[11]["content"] == bright_question
    assert any(bright_question in message["content"] for message in bright_messages)
    for message in bright_messages:
        message["content"] = message["content"].replace(bright_question, huang_question)
    assert bright_body == huang_body

prior = d.parent / "clinic-boundary-live-20261120"
run = read(prior / "run.json")
assert (run["cumulative"], run["remaining"], run["closed"]) == (600, 0, True)
old_hashes = read(prior / "verification.json")["orchestratorProtectedEvidenceSha256"]
assert all(digest(d.parent / name) == old_hash for name, old_hash in old_hashes.items())
formal_hashes = read(d / "formal-before.json")
formal_app = Path(setup["formalApp"])
formal_changes = [
    name for name, old_hash in formal_hashes.items()
    if not (formal_app / name).is_file() or digest(formal_app / name) != old_hash
]

report = {
    "status": "isolated-native-save-and-capture-verified",
    "modelCalls": 0,
    "cumulative": 600,
    "remaining": 0,
    "classificationFixture": "NO_CHECK / ordinary_dialogue, derived from historical 547; no new classification",
    "captures": capture_records,
    "snapshots": {name: digest(path) for name, path in seeds.items()},
    "source": source_anchor,
    "belief": "rumor",
    "receipts": receipts,
    "sameRequestBytesAfterReopen": True,
    "sameProjectionBytesAcrossRecipientBranches": True,
    "recipientBodiesDifferOnlyByQuestion": True,
    "formalBaselineFiles": len(formal_hashes),
    "formalFilesWithChangedHash": formal_changes,
    "priorEvidenceVerified": len(old_hashes),
    "browser": {"port": 18132, "operatedBy": "main agent", "terraCouldBindMainTab": False},
    "deployed": False,
    "humanCalibrationCompleted": False,
}
(d / "verification.json").write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n"
)
print("Verified four native snapshots, two receipts, eight local captures, identical reopen bytes, zero model calls.")
print("Formal files with changed hash:", formal_changes)
