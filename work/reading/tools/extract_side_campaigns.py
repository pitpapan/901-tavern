from pathlib import Path
import importlib.util, sys, json, re, hashlib, csv, shutil
from lxml import html as LH, etree
ROOT=Path(r"C:\Users\pit\.codex\worktrees\yulinfeng-tavern-plan\TRPG outputs")
LEGACY=Path(r"D:\备份文件\901记录\第一部分\files-mentioned-by-the-user-2\work\forum_extract.py")
TOOLS=ROOT/"work/reading/tools"
TOOLS.mkdir(parents=True,exist_ok=True)
dst=TOOLS/"forum_extract_legacy.py"
if not dst.exists(): shutil.copy2(LEGACY,dst)
spec=importlib.util.spec_from_file_location("forum_extract_legacy",dst)
legacy=importlib.util.module_from_spec(spec);sys.modules[spec.name]=legacy;spec.loader.exec_module(legacy)
def clean(t):
    t=t.replace("\r","").replace("\u00a0"," ")
    return re.sub(r"\n{3,}","\n\n","\n".join(re.sub(r"[ \t]+"," ",l).strip() for l in t.splitlines())).strip()
def render(n):
    if not isinstance(n.tag,str):return ""
    tag=n.tag.lower()
    if tag in ("script","style","noscript"):return ""
    if tag=="br":return "\n"
    content=(n.text or "")+"".join(render(c)+(c.tail or "") for c in n)
    cls=(n.get("class","")+" "+n.get("id","")).lower()
    style=n.get("style","").lower()
    flags=[]
    if tag=="blockquote":flags.append("QUOTE")
    if tag in ("s","strike","del") or "line-through" in style:flags.append("STRIKETHROUGH")
    if re.search(r"display\s*:\s*none|visibility\s*:\s*hidden",style) or any(x in cls for x in ("spoilerbody","spoiler_body","spoiler_content")):flags.append("HIDDEN_CONTENT")
    if tag=="a" and n.get("href") and not n.get("href").lower().startswith("javascript:"):
        href=n.get("href")
        if href not in content:content+=f" [LINK: {href}]"
    if tag in ("td","th"):content+=" | "
    if tag in ("div","p","blockquote","pre","tr","li","h1","h2","h3","h4","h5","h6","table"):content="\n"+content+"\n"
    for flag in flags:content=f"\n[{flag}]\n{content}\n[/{flag}]\n"
    return content
def convert(fragment,source):
    replaced,images=legacy.replace_images(fragment,source)
    node=LH.fragment_fromstring(replaced,create_parent="div")
    return clean(render(node)),[legacy.asdict(i) for i in images]
def jwrite(p,value):p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
def jlwrite(p,rows):p.write_text("".join(json.dumps(r,ensure_ascii=False)+"\n" for r in rows),encoding="utf-8")
def page_num(p):
    m=re.search(r" - 页 (\d+)\.html$",p.name);return int(m.group(1)) if m else 1
def inner(n):return (n.text or "")+"".join(etree.tostring(c,encoding="unicode",method="html",with_tail=True) for c in n)
configs=[("MUTOU","沐透线",Path(r"D:\备份文件\901记录\沐透线"),"extracted-mutou"),("GREAT_TOMB","大墓地",Path(r"D:\备份文件\901记录\大墓地"),"extracted-great-tomb")]
with (ROOT/"work/reading/post_locator.tsv").open(encoding="utf-8-sig") as f:
    old_ids={r["post_id"] for r in csv.DictReader(f,delimiter="\t") if r["document_id"].startswith(("P1_","P2_","P3_"))}
all_new={};outstats=[]
for sid,name,source_dir,folder in configs:
    out=ROOT/folder
    if out.exists():raise RuntimeError(f"Output exists; refusing to overwrite: {out}")
    out.mkdir()
    pages=sorted(source_dir.glob("*.html"),key=page_num)
    summaries=[];locators=[];whole=[f"# {name}：全页原帖正文顺读版","","本文件按论坛页码与楼层机械整理，未经叙事改写。引用、删除线、隐藏内容与图片占位均保留；不等于其中说法均为世界事实。图片尚未逐张阅读。",""]
    seen={};issues=[];counter=0
    for source in pages:
        pn=page_num(source);pd=out/f"page-{pn:02d}";pd.mkdir()
        raw=source.read_bytes();txt=raw.decode("utf-8-sig",errors="strict")
        dom=LH.fromstring(txt)
        nodes=dom.xpath('//div[starts-with(@id,"msg_") and contains(concat(" ",normalize-space(@class)," ")," inner ")]')
        rows=[];markup=[];imgs=[];page_md=[f"# {name} 第 {pn} 页","","完整原帖正文；页内导航见 preview.md。",""]
        for n in nodes:
            mid=n.get("data-msgid") or n.get("id")[4:]
            if not mid.isdigit():continue
            w=n.xpath('ancestor::div[contains(concat(" ",normalize-space(@class)," ")," post_wrapper ")][1]')[0]
            authors=w.xpath('.//div[@class="poster"]/h4/a')
            author=next((clean(a.text_content()) for a in reversed(authors) if clean(a.text_content())),"unknown")
            ks=w.xpath('.//div[@class="keyinfo"]')[0]
            titletexts=ks.xpath('.//h5//text()')
            floor_nodes=ks.xpath('.//span[contains(@class,"page_number")]')
            floor_match=re.search(r"#(\d+)", " ".join(x.text_content() for x in floor_nodes)+" "+" ".join(titletexts))
            floor=floor_match.group(1) if floor_match else ("0" if pn==1 and not rows else "")
            times=ks.xpath('.//a[contains(concat(" ",normalize-space(@class)," ")," smalltext ")]')
            timestamp=next((clean(a.text_content()) for a in times if re.match(r"\d{4}-\d\d-\d\d",clean(a.text_content()))),"")
            edits=ks.xpath('.//span[starts-with(@id,"modified_")]')
            last_edited=clean(edits[0].text_content()) if edits else ""
            frag=inner(n);body,images=convert(frag,source)
            counter+=1
            row={"id":mid,"floor":floor,"author":author,"time":timestamp,"last_edited":last_edited,"source_id":sid,"page":pn,"source_html":str(source),"source_html_line":n.sourceline,"source_url":f"https://www.goddessfantasy.net/bbs/index.php?msg={mid}","body":body,"images":images}
            if mid in seen:issues.append({"kind":"duplicate_msg_within_line","msg":mid,"previous":seen[mid],"page":pn})
            if mid in old_ids:issues.append({"kind":"msg_also_in_mainline","msg":mid})
            if mid in all_new:issues.append({"kind":"msg_also_in_other_new_line","msg":mid,"other":all_new[mid]})
            seen[mid]=pn;all_new[mid]=sid
            if not floor or not timestamp or author=="unknown" or not body:issues.append({"kind":"missing_metadata_or_body","msg":mid,"floor":floor,"time":timestamp,"author":author,"body_chars":len(body)})
            if "\ufffd" in body:issues.append({"kind":"replacement_character","msg":mid})
            rows.append(row);markup.append({"id":mid,"source_html":str(source),"source_html_line":n.sourceline,"html_fragment":frag})
            imgs.extend({"post_id":mid,"floor":floor,**im} for im in images)
            locators.append({"source_id":sid,"page":pn,"floor":floor,"post_id":mid,"author":author,"jsonl_file":str(pd/"posts.jsonl"),"jsonl_line":len(rows),"source_html":str(source),"source_html_line":n.sourceline,"body_characters":len(body)})
            block=[f"## #{floor} | msg {mid} | {author} | {timestamp}","",f"来源：[原帖]({row['source_url']})；HTML 第 {n.sourceline} 行；最后编辑：{last_edited or '未显示'}。","",body,""]
            page_md.extend(block)
        jlwrite(pd/"posts.jsonl",rows);jlwrite(pd/"body-markup.jsonl",markup);jlwrite(pd/"images.jsonl",imgs)
        (pd/"posts.md").write_text("\n".join(page_md),encoding="utf-8")
        preview=[f"# {name} 第 {pn} 页：定位预览","","预览有截断，仅用于找帖；研究请读取 posts.md 或 posts.jsonl 的完整 body。","","| 楼层 | msg | 发帖人 | 正文字数 | 预览 |","|---|---|---|---:|---|"]
        for r in rows:preview.append(f"| {r['floor']} | {r['id']} | {r['author']} | {len(r['body'])} | {legacy.make_preview(r['body'],120).replace('|','／')} |")
        (pd/"preview.md").write_text("\n".join(preview)+"\n",encoding="utf-8")
        summary={"source_id":sid,"document_id":f"{sid}_PAGE_{pn:02d}","page":pn,"source_html":str(source),"sha256":hashlib.sha256(raw).hexdigest(),"source_bytes":len(raw),"posts":len(rows),"first_floor":rows[0]["floor"] if rows else None,"last_floor":rows[-1]["floor"] if rows else None,"body_characters":sum(len(r["body"]) for r in rows),"images":len(imgs),"images_needing_review":sum(i["needs_review"] for i in imgs),"quotes":sum(r["body"].count("[QUOTE]") for r in rows),"strikethroughs":sum(r["body"].count("[STRIKETHROUGH]") for r in rows),"hidden_blocks":sum(r["body"].count("[HIDDEN_CONTENT]") for r in rows),"posts_jsonl":str(pd/"posts.jsonl"),"posts_md":str(pd/"posts.md")}
        summaries.append(summary);whole.extend([f"# 第 {pn} 页",""]+page_md[4:])
    manifest={"schema_version":1,"source_id":sid,"title":name,"source_kind":"original_campaign_side_line","world_relation":"User explicitly confirms same setting; inter-line chronology and knowledge are research questions.","source_directory":str(source_dir),"encoding":"UTF-8","html_scope":"Top-level forum pages only; _files resource HTML excluded.","extraction":"Static DOM; full body, quote/strike/hidden markers, links, image references; source markup stored separately; no script execution/network fetch.","derivation":"Image extraction and previews reuse forum_extract_legacy.py; no compact-body filtering.","semantic_status":"not_yet_read_in_full","image_status":"references_indexed_not_visually_read","pages":summaries,"totals":{"pages":len(summaries),"posts":counter,"unique_post_ids":len(seen),"body_characters":sum(p["body_characters"] for p in summaries),"images":sum(p["images"] for p in summaries),"images_needing_review":sum(p["images_needing_review"] for p in summaries)},"issues":issues}
    jwrite(out/"manifest.json",manifest)
    with (out/"post_locator.tsv").open("w",encoding="utf-8",newline="") as f:
        wr=csv.DictWriter(f,fieldnames=list(locators[0]),delimiter="\t");wr.writeheader();wr.writerows(locators)
    (out/f"{name}_全页原帖正文顺读版.md").write_text("\n".join(whole),encoding="utf-8")
    readme=[f"# {name}：独立资料包","",f"原始资料：{source_dir}。共 {len(pages)} 页、{counter} 帖、{manifest['totals']['body_characters']} 个正文字符。原 HTML 不改动。","",f"- 连续阅读：[全页原帖正文顺读版](<{name}_全页原帖正文顺读版.md>)。","- 定位少量内容：post_locator.tsv；按页读 page-XX/preview.md，命中后取 posts.jsonl 的完整 body。","- page-XX/posts.md：该页完整正文；body-markup.jsonl：保留的正文 HTML，必要时核对样式与结构。","- page-XX/images.jsonl：图片原地址、本地路径、存在性与周边文字。尚未逐张识图，不把图片占位当作已读内容。","- manifest.json：原始文件指纹、提取计数、重复或缺失提示。","","这是原帖转制资料包，不是叙事改写战报或已审核正典。未删除判定、规则和玩家声明。[QUOTE] 表示转引，[STRIKETHROUGH] 表示删除线，[HIDDEN_CONTENT] 表示原页隐藏块；标记内容不能不加区别地当作当时生效设定。发帖时间/编辑时间不直接等于世界内事件时间。","","| 页 | 楼层 | 帖数 | 正文字数 |","|---|---|---:|---:|"]
    readme.extend(f"| [{p['page']}](page-{p['page']:02d}/posts.md) | #{p['first_floor']}–#{p['last_floor']} | {p['posts']} | {p['body_characters']} |" for p in summaries)
    (out/"README.md").write_text("\n".join(readme)+"\n",encoding="utf-8")
    outstats.append({"source_id":sid,"output":str(out),"totals":manifest["totals"],"issues":issues,"pages":[{k:p[k] for k in ("page","posts","first_floor","last_floor","body_characters","quotes","strikethroughs","hidden_blocks")} for p in summaries]})
print(json.dumps(outstats,ensure_ascii=False,indent=2))
