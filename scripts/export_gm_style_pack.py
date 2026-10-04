"""Export the reviewed GM style inputs as an optional Prompt Manager list.
Does not write canon, cards, worldbooks, Persona, or installed SillyTavern files.
"""
import argparse, hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "work/replay_research/gm_style/v1/authoring.json"
OUT = ROOT / "output/replay_tavern/gm_style_v1"

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2)
    path.write_text(text.rstrip() + "\n", encoding="utf-8")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--replace-generated", action="store_true")
    args = parser.parse_args()
    if OUT.exists() and any(OUT.iterdir()) and not args.replace_generated:
        raise SystemExit("Output exists. Edit authoring.json, then explicitly use --replace-generated.")
    source = json.loads(SOURCE.read_text(encoding="utf-8-sig"))
    prompts = []
    for module in source["modules"]:
        prompts.append({
            **module, "system_prompt":False, "marker":False, "role":"system",
            "injection_position":0, "injection_depth":4, "injection_order":100,
            "injection_trigger":["normal", "continue", "swipe", "regenerate"],
            "forbid_overrides":False
        })
    write(OUT / "import/901_GM文风.prompts.json",
          {"version":1, "type":"full", "data":{"prompts":prompts, "prompt_order":[]}})
    write(OUT / "texts/901_文风提示.txt", source["modules"][0]["content"])
    write(OUT / "texts/901_短示例_可选.txt", source["modules"][1]["content"])
    write(OUT / "texts/901_帝都开场_修订.txt", source["opening"])
    write(OUT / "author/source_notes.json", {"sources":source["sources"], "runtime_policy":source["runtime_policy"], "notes":source["author_notes"]})
    manifest = {
        "id":"901-gm-style-v1", "created_on":source["date"],
        "status":"files_exported_pending_user_review_and_manual_use",
        "kind":"Prompt Manager modules, not a full model sampling preset",
        "target_version":"SillyTavern 1.19.0",
        "source":str(SOURCE.relative_to(ROOT)).replace("\\","/"),
        "source_sha256":hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "context_characters_not_tokens":{m["identifier"]:len(m["content"]) for m in source["modules"]},
        "opening_characters":len(source["opening"]),
        "runtime_policy":source["runtime_policy"],
        "format_verification":"pending separate bounded check",
        "manual_import_and_model_test":"not performed",
        "regenerate":"python -X utf8 scripts/export_gm_style_pack.py --replace-generated"
    }
    write(OUT / "manifest.json", manifest)
    write(OUT / "README.md", (SOURCE.parent / "pack_guide.md").read_text(encoding="utf-8-sig"))
    print(json.dumps({"output":str(OUT), "prompt_characters":manifest["context_characters_not_tokens"], "opening_characters":manifest["opening_characters"]},ensure_ascii=False))

if __name__ == "__main__":
    main()
