"""Create a disposable offline copy from the prior formal-parity isolation."""
from pathlib import Path
from hashlib import sha256
import importlib.util
import json
import re
import shutil
import sys

E = Path(__file__).resolve().parent
P = E.parent
R = next(p for p in E.parents if p.name == "TRPG outputs")
A = E / "sandbox"
V = E / "evidence"
PORT = 18132

def read(path):
    return json.loads(path.read_bytes())

def put(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def digest(path):
    return sha256(path.read_bytes()).hexdigest()

previous = read(P / "setup.json")
source = Path(previous["app"]).resolve()
formal = Path(previous["formalApp"]).resolve()
assert source != formal and not A.exists() and not (E / "setup.json").exists()
assert A.resolve().is_relative_to(E)
assert (source / "offline-guard.mjs").is_file()
old_ledger = P / "clinic-boundary-live-20261120/run.json"
assert (read(old_ledger)["cumulative"], read(old_ledger)["remaining"], read(old_ledger)["closed"]) == (600, 0, True)

seed = P / "browser/baseline.seed.jsonl"
rows = [json.loads(r) for r in seed.read_text(encoding="utf-8").splitlines()]
root = rows[-1]["variables"][rows[-1].get("swipe_id", 0)]["stat_data"]["901_rules_poc"]
parent, revision = root["chatId"], root["revision"]
assert "Branch #" in parent and not root.get("storyKnowledge")
character = previous["character"]
protected = {}
for top in ("public/901-opening-combat", "data/default-user/settings.json", "data/default-user/characters", "data/default-user/chats", "data/default-user/worlds"):
    f = formal / top
    for file in ([f] if f.is_file() else f.rglob("*")):
        if file.is_file():
            protected[file.relative_to(formal).as_posix()] = digest(file)
put(E / "formal-before.json", protected)

for folder in ("src", "default", "public", "node_modules"):
    shutil.copytree(source / folder, A / folder, ignore=shutil.ignore_patterns(".git", ".cache", "backups"))
for name in ("server.js", "package.json", "config.yaml", "webpack.config.js", "offline-guard.mjs"):
    shutil.copy2(source / name, A / name)
(A / "plugins").mkdir()
old_user = source / "data/default-user"
user = A / "data/default-user"
user.mkdir(parents=True)
for folder in ("worlds", "OpenAI Settings", "context", "instruct", "sysprompt", "TextGen Settings", "themes", "extensions", "User Avatars", "user", "backgrounds"):
    if (old_user / folder).is_dir():
        shutil.copytree(old_user / folder, user / folder)
put(user / "secrets.json", {})
settings = read(old_user / "settings.json")
settings["oai_settings"]["custom_url"] = f"http://127.0.0.1:{PORT}/offline-never-forward"
settings["proxies"], settings["selected_proxy"] = [], ""
put(user / "settings.json", settings)
chat_dir = user / "chats" / character
chat_dir.mkdir(parents=True)
shutil.copy2(seed, chat_dir / (parent + ".jsonl"))
card = user / "characters" / (character + ".png")
card.parent.mkdir()
shutil.copy2(old_user / "characters" / card.name, card)
cfg = A / "config.yaml"
config = cfg.read_text(encoding="utf-8")
config, count = re.subn(r"(?m)^port: 18129$", f"port: {PORT}", config)
assert count == 1 and re.search(r"(?m)^listen: false$", config)
cfg.write_text(config, encoding="utf-8")

original = (P / "entry.isolated.js").read_text(encoding="utf-8")
entry = original.split("// Explicit manual test controls, present only in the isolated card.", 1)[0]
assert "storyKnowledge.configureDialogue(null)" in entry and "clinic-parity-controls" not in entry
entry += (E / "controls.js").read_text(encoding="utf-8").replace("__PARENT__", json.dumps(parent, ensure_ascii=False)).replace("__PARENT_REVISION__", str(revision))
(E / "entry.isolated.js").write_text(entry, encoding="utf-8", newline="\n")
helper = R / "work/replay_research/gm_style/v1/live_acceptance_20261030/action-failure/timeout-20261105/lab.py"
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("lab_cards", helper)
lab = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lab)
def configure(value):
    value["chat"] = parent
    if "chat" in value["data"]:
        value["data"]["chat"] = parent
    value["data"]["extensions"]["tavern_helper"]["scripts"][1]["content"] = entry
lab.card_transform(card, configure)

backend = A / "src/endpoints/backends/chat-completions.js"
body = backend.read_text(encoding="utf-8")
start = body.index("        // Offline preparation: capture the exact real request, never send it.")
stop = body.index("        const fetchResponse = await fetch(endpointUrl, config);", start)
body = body[:start] + (E / "offline-capture.js").read_text(encoding="utf-8") + body[stop:]
body = body.split("// Local evidence controls; data stays in this isolated workspace.", 1)[0]
assert "clinic-parity-config.json" not in body
backend.write_text(body + (E / "offline-evidence.js").read_text(encoding="utf-8"), encoding="utf-8", newline="\n")
(V / "captures").mkdir(parents=True)
put(A / "clinic-topic-config.json", {"evidenceDir": V.as_posix(), "captureDir": (V/"captures").as_posix(),
    "phase":"before", "chatDir":chat_dir.as_posix(), "parentChatId": parent})
runtime = Path("public/901-opening-combat/work/rules_engine/gm_runtime")
modules = ("story-knowledge.mjs", "clinic-knowledge-catalog.mjs")
put(E / "setup.json", {"app":A.as_posix(),"priorIsolation":source.as_posix(),"formalApp":formal.as_posix(),
    "port":PORT,"character":character,"parentChatId":parent,"parentRevision":revision,"parentSeedSha256":digest(seed),
    "runtimeModules":{f:digest(source/runtime/f) for f in modules},
    "formalFilesProtected":len(protected),"offlineGuardSha256":digest(A/"offline-guard.mjs"),
    "entrySha256":digest(E/"entry.isolated.js"),"backendSha256":digest(backend),
    "startingCumulative":600,"availableModelCalls":0})
print("Prepared disposable target", A, "with original runtime and offline capture.")
