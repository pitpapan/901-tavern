"""Restore a captured save in the disposable child chat after leaving that chat."""

from hashlib import sha256
import json
from pathlib import Path
import re
import sys


directory = Path(__file__).resolve().parent
evidence = directory / "evidence"
setup = json.loads((directory / "setup.json").read_bytes())
app = Path(setup["app"]).resolve()
label, tag = sys.argv[1:]
if app != (directory / "sandbox").resolve() or label not in ("before", "received"):
    raise SystemExit("Expected a captured snapshot in this isolated copy.")
if not re.fullmatch(r"[A-Za-z0-9-]+", tag):
    raise SystemExit("Use a distinct archive tag containing letters, digits or hyphens.")

snapshot = json.loads((evidence / (label + ".json")).read_bytes())
chat_id = snapshot["chatId"]
if (
    snapshot["nonCanon"] is not True
    or chat_id == setup["parentChatId"]
    or "Branch #" not in chat_id
    or "/" in chat_id
    or "\\" in chat_id
):
    raise SystemExit("Only the disposable test branch can be restored.")

chat_dir = app / "data/default-user/chats" / setup["character"]
chat = (chat_dir / (chat_id + ".jsonl")).resolve()
if not chat.is_relative_to(app) or not chat.is_file():
    raise SystemExit("Disposable chat file is missing.")

seed = (evidence / (label + ".seed.jsonl")).read_bytes()
archive = evidence / ("before-restore-" + tag + ".jsonl")
with archive.open("xb") as saved:
    saved.write(chat.read_bytes())

staged = chat.with_suffix(".restore")
with staged.open("xb") as output:
    output.write(seed)
staged.replace(chat)
print("Restored", label, sha256(chat.read_bytes()).hexdigest(), "archived previous chat to", archive)
