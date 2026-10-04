"""Extract the complete GM-account corpus; never infer canon or erase mixed content."""
import argparse, hashlib, json, re, statistics
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "work/gm_style/v1/corpus"
PARTS = ["P1", "P2", "P3", "MUTOU", "GREAT_TOMB"]
GM = "剑"

def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2)
    path.write_text(text.rstrip() + "\n", encoding="utf-8")

def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--replace-generated", action="store_true")
    opt = args.parse_args()
    if OUT.exists() and any(OUT.iterdir()) and not opt.replace_generated:
        raise SystemExit("Existing derived corpus; explicit --replace-generated required.")
    catalog = json.loads((ROOT / "work/reading/source_catalog.json").read_text(encoding="utf-8-sig"))
    bypart = defaultdict(list); pages = []; all_authors = Counter(); seen = set()
    for pg in sorted(catalog["pages"], key=lambda p: (PARTS.index(p["campaign_part"]), int(p["page"]))):
        source = ROOT / pg["posts_jsonl"]
        n = 0
        for line_num, line in enumerate(source.read_text(encoding="utf-8-sig").splitlines(), 1):
            if not line.strip(): continue
            post = json.loads(line); all_authors[post.get("author", "")] += 1
            if post.get("author") != GM: continue
            key = pg["campaign_part"] + "_" + str(post["id"])
            if key in seen: raise ValueError("Duplicate source key: " + key)
            seen.add(key)
            body = post.get("body", "")
            tags = []
            if re.search(r"XP|检定|成功数|冲击伤害|严重伤害|标准动作|人物卡|节点清算|结算", body, re.I): tags.append("rules_words_present")
            if re.search(r"PS[:：]|Ps[:：]|ps[:：]|楼上|团外|吐槽|更新|下一个回复", body): tags.append("ooc_words_present")
            if re.search(r"[“”「」『』\"]", body): tags.append("quotation_marks_present")
            if "[IMAGE " in body: tags.append("image_placeholder_present")
            if "梦境" in body: tags.append("dream_word_present_not_domain_classification")
            rec = {"corpus_id":key,"part":pg["campaign_part"],"page":int(pg["page"]),
                   "post_id":str(post["id"]),"floor":post.get("floor"),"author":GM,
                   "source_file":pg["posts_jsonl"],"source_line":line_num,
                   "source_html":post.get("source_html", pg.get("original_html")),
                   "source_html_line":post.get("source_html_line"),"time":post.get("time"),
                   "body":body,"body_characters":len(body),"mechanical_hints":tags,
                   "runtime_eligible":False}
            bypart[pg["campaign_part"]].append(rec); n += 1
        pages.append({"document_id":pg["document_id"],"source_file":pg["posts_jsonl"],
                      "sha256":hashlib.sha256(source.read_bytes()).hexdigest(),"gm_posts":n})
    allrows = [r for part in PARTS for r in bypart[part]]
    sample_ids = {}
    corpus_lines = {}
    def readable(rows, label):
        blocks = [f"# {label}\n\n作者研究语料，禁止整包导入酒馆。保留原文，包括规则、桌外说明、梦境与后期内容；不是全部可模仿的正文。"]
        for r in rows:
            blocks.append(f"## {r['corpus_id']} | 第{r['page']}页 #{r['floor']} | {r['source_file']}:{r['source_line']}\n\n{r['body']}")
        return "\n\n".join(blocks)
    stats = {}
    index = ["corpus_id\tpart\tpage\tfloor\tsource_file\tsource_line\tcharacters\thints"]
    for part in PARTS:
        rows = bypart[part]
        dump(OUT / (part + ".jsonl"), "\n".join(json.dumps(r, ensure_ascii=False) for r in rows))
        dump(OUT / (part + ".md"), readable(rows, part + " GM完整回复"))
        chosen = set()
        for page in sorted({r["page"] for r in rows}):
            current = [r for r in rows if r["page"] == page]
            ordinary = [r for r in current if 80 <= r["body_characters"] <= 2000]
            pool = ordinary or current
            for q in [0, 0.33, 0.67, 1]:
                if pool: chosen.add(pool[round((len(pool)-1)*q)]["corpus_id"])
            short = [r for r in current if 0 < r["body_characters"] < 80]
            if short: chosen.add(short[len(short)//2]["corpus_id"])
        long_rows = [r for r in rows if 2000 < r["body_characters"] <= 7000]
        if long_rows: chosen.add(long_rows[len(long_rows)//2]["corpus_id"])
        if part == "P1":
            chosen.add("P1_816583")
        samples = [r for r in rows if r["corpus_id"] in chosen]
        sample_ids[part] = [r["corpus_id"] for r in samples]
        dump(OUT / "samples" / (part + ".md"), readable(samples, part + " 分层文风阅读样本"))
        lens = sorted(r["body_characters"] for r in rows)
        stats[part] = {"posts":len(rows),"body_characters":sum(lens),"median_characters":statistics.median(lens),
                       "p90_characters":lens[round((len(lens)-1)*.9)],"max_characters":max(lens),
                       "under_80":sum(n<80 for n in lens),"over_1000":sum(n>1000 for n in lens),
                       "sample_posts":len(samples),"sample_characters":sum(r["body_characters"] for r in samples),
                       "mechanical_hint_counts":dict(Counter(t for r in rows for t in r["mechanical_hints"]))}
        for r in rows:
            index.append("\t".join(str(r[k]) for k in ["corpus_id","part","page","floor","source_file","source_line","body_characters"])+"\t"+",".join(r["mechanical_hints"]))
    dump(OUT / "all_gm.jsonl", "\n".join(json.dumps(r,ensure_ascii=False) for r in allrows))
    dump(OUT / "index.tsv", "\n".join(index))
    manifest = {"schema_version":1,"purpose":"Author-only GM-account style corpus, not canon or runtime memory.",
                "gm_author":GM,"attribution_basis":"User-provided opening matches P1 #78 by 剑; this account also posts GM rulings and NPC/environment replies across all five records.",
                "source_posts_scanned":sum(all_authors.values()),"source_pages":len(pages),
                "gm_posts":len(allrows),"gm_body_characters":sum(r["body_characters"] for r in allrows),
                "source_author_counts":dict(all_authors),"parts":stats,"source_files":pages,
                "sample_selection":"Up to four chronological length-bounded posts plus one short post per page, one longer post per source, and the user-supplied opening. Whole bodies preserved. Sampling is for close reading, not proof every post was semantically read.",
                "sample_ids":sample_ids,"semantic_reading":"pending analyst receipts",
                "caveats":["GM author does not make every sentence GM narrative or world truth.",
                           "Mechanical hints are non-exclusive search aids, not semantic classifications.",
                           "All dream, rule and later-history material stays author-only; runtime examples selected separately.",
                           "No images interpreted; body text is preserved exactly as extracted.",
                           "Scope is all GM posts in the 71 available pages, not missing border logs or deleted posts."]}
    dump(OUT / "manifest.json",manifest)
    print(json.dumps({"gm_posts":len(allrows),"body_characters":manifest["gm_body_characters"],"parts":stats},ensure_ascii=False))

if __name__ == "__main__": main()
