#!/usr/bin/env python3
"""Extract readable TRPG logs from saved GoddessFantasy forum HTML pages."""

from __future__ import annotations

import argparse
import html
import json
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from urllib.parse import unquote, urlparse


POST_OPEN_RE = re.compile(
    r'<div\s+class="inner"(?:\s+data-msgid="(?P<data_id>\d+)")?'
    r'\s+id="msg_(?P<id>\d+)">',
    re.IGNORECASE,
)
DIV_TOKEN_RE = re.compile(r"<div\b[^>]*>|</div\s*>", re.IGNORECASE)
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.IGNORECASE | re.DOTALL)
IMG_RE = re.compile(r"<img\b(?P<attrs>[^>]*)>", re.IGNORECASE | re.DOTALL)
ATTR_RE = re.compile(
    r"""(?P<name>[\w:-]+)\s*=\s*(?:"(?P<double>[^"]*)"|'(?P<single>[^']*)'|(?P<bare>[^\s>]+))""",
    re.DOTALL,
)
TAG_RE = re.compile(r"<[^>]+>", re.DOTALL)
SCRIPT_STYLE_RE = re.compile(
    r"<(?:script|style)\b[^>]*>.*?</(?:script|style)>", re.IGNORECASE | re.DOTALL
)
BR_RE = re.compile(r"<br\s*/?>", re.IGNORECASE)
BLOCK_END_RE = re.compile(r"</(?:p|div|li|blockquote|pre|h[1-6])\s*>", re.IGNORECASE)
SPACE_RE = re.compile(r"[ \t\u00a0]+")
BLANK_RE = re.compile(r"\n{3,}")
RULE_LINE_RE = re.compile(
    r"^\s*(?:"
    r".{0,24}\d+\s*(?:DP|XP|xp)\b.*|"
    r"(?:先攻|反射|意志|敏捷|力量|能量|人物特性|更新节点|支付|剩余)\s*[:：]?\s*.*|"
    r"（\s*(?:战斗顺序|更新节点|PS|Ps|ps|骰|判定|过反射|人物特性|将耶格套装).*[）)]"
    r")\s*$",
    re.IGNORECASE,
)
SCENE_MARKER_RE = re.compile(
    r"^\s*(?:[-—=_]{5,}.*|[（(]?(?:数十分钟|十分钟|数日|另一方面|纳萨力克|故事章节).*)\s*$"
)


@dataclass
class ImageInfo:
    src: str
    resolved_path: str | None
    exists: bool
    alt: str
    title: str
    css_class: str
    context: str
    position: int
    role: str
    needs_review: bool


@dataclass
class Post:
    id: str
    floor: str
    author: str
    time: str
    source_html: str
    body: str
    body_compact: str
    preview: str
    images: list[ImageInfo] = field(default_factory=list)


def attrs_to_dict(raw: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for match in ATTR_RE.finditer(raw):
        value = match.group("double") or match.group("single") or match.group("bare") or ""
        result[match.group("name").lower()] = html.unescape(value)
    return result


def resolve_image(source_html: Path, src: str) -> tuple[str | None, bool]:
    parsed = urlparse(src)
    if parsed.scheme in {"http", "https", "data"}:
        return None, False
    relative = unquote(parsed.path).replace("/", "\\")
    resolved = (source_html.parent / relative).resolve()
    return str(resolved), resolved.exists()


def surrounding_text(fragment: str, start: int, end: int, radius: int = 100) -> str:
    nearby = fragment[max(0, start - radius) : min(len(fragment), end + radius)]
    nearby = BR_RE.sub("\n", nearby)
    nearby = IMG_RE.sub("", nearby)
    nearby = TAG_RE.sub("", nearby)
    nearby = html.unescape(nearby)
    nearby = SPACE_RE.sub(" ", nearby)
    nearby = BLANK_RE.sub("\n\n", nearby)
    return nearby.strip()


def classify_image(attrs: dict[str, str], context: str) -> tuple[str, bool]:
    css_class = attrs.get("class", "")
    src = attrs.get("src", "").lower()
    if "bbc_img" in css_class:
        if re.search(r"左.+右|角色(?:立绘|图|设定)|人物(?:立绘|设定|参考)|头像", context):
            return "character_reference", True
        if re.search(r"地图|线索|信件|假面|道具|如图|见图", context):
            return "plot_reference", True
        return "inline_content", True
    if re.search(r"smile|emoji|emoticon|avatar|pip|icon", src):
        return "inline_decoration", False
    return "inline_content", True


def replace_images(fragment: str, source_html: Path) -> tuple[str, list[ImageInfo]]:
    images: list[ImageInfo] = []

    def replacement(match: re.Match[str]) -> str:
        attrs = attrs_to_dict(match.group("attrs"))
        src = attrs.get("src", "")
        resolved_path, exists = resolve_image(source_html, src)
        context = surrounding_text(fragment, match.start(), match.end())
        role, needs_review = classify_image(attrs, context)
        info = ImageInfo(
            src=src,
            resolved_path=resolved_path,
            exists=exists,
            alt=attrs.get("alt", ""),
            title=attrs.get("title", ""),
            css_class=attrs.get("class", ""),
            context=context,
            position=len(images) + 1,
            role=role,
            needs_review=needs_review,
        )
        images.append(info)
        return f"\n[IMAGE {info.position}: {role} | {src}]\n"

    return IMG_RE.sub(replacement, fragment), images


def fragment_to_text(fragment: str, source_html: Path) -> tuple[str, list[ImageInfo]]:
    fragment, images = replace_images(fragment, source_html)
    fragment = SCRIPT_STYLE_RE.sub("", fragment)
    fragment = BR_RE.sub("\n", fragment)
    fragment = BLOCK_END_RE.sub("\n", fragment)
    fragment = TAG_RE.sub("", fragment)
    fragment = html.unescape(fragment).replace("\r", "")
    lines = [SPACE_RE.sub(" ", line).strip() for line in fragment.splitlines()]
    text = "\n".join(lines)
    text = BLANK_RE.sub("\n\n", text).strip()
    return text, images


def compact_body(body: str) -> str:
    lines: list[str] = []
    for line in body.splitlines():
        stripped = line.strip()
        if not stripped or RULE_LINE_RE.match(stripped):
            continue
        lines.append(stripped)
    return "\n".join(lines).strip()


def make_preview(body: str, length: int) -> str:
    text = SPACE_RE.sub(" ", body.replace("\n", " "))
    return text if len(text) <= length else text[: length - 1].rstrip() + "…"


def find_window_before(page: str, body_start: int, msg_id: str) -> str:
    candidates = [
        page.rfind(f'<div class="windowbg" id="msg{msg_id}"', 0, body_start),
        page.rfind(f'<div class="windowbg2" id="msg{msg_id}"', 0, body_start),
        page.rfind('<div class="windowbg">', 0, body_start),
        page.rfind('<div class="windowbg2">', 0, body_start),
    ]
    return page[max(candidates) if max(candidates) >= 0 else max(0, body_start - 10000) : body_start]


def extract_author(prefix: str) -> str:
    posters = re.findall(r'<div class="poster">(.*?)</div>', prefix, re.IGNORECASE | re.DOTALL)
    poster = posters[-1] if posters else prefix[-8000:]
    h4 = re.search(r"<h4[^>]*>(.*?)</h4>", poster, re.IGNORECASE | re.DOTALL)
    area = h4.group(1) if h4 else poster
    links = re.findall(r"<a\b[^>]*>(.*?)</a>", area, re.IGNORECASE | re.DOTALL)
    for link in reversed(links):
        text = html.unescape(TAG_RE.sub("", link)).strip()
        if text:
            return text
    return "unknown"


def extract_floor_and_time(prefix: str) -> tuple[str, str]:
    old = re.findall(
        r"回帖\s*#(?P<floor>\d+)\s*于:</strong>\s*(?P<time>[^<»]+)",
        prefix,
        re.IGNORECASE,
    )
    if old:
        return old[-1][0].strip(), html.unescape(old[-1][1]).strip()
    floors = re.findall(r'<span class="page_number[^"]*">#(\d+)</span>', prefix, re.IGNORECASE)
    times = re.findall(
        r'<a\b[^>]*class="smalltext"[^>]*>(\d{4}-\d{2}-\d{2},[^<]+)</a>',
        prefix,
        re.IGNORECASE,
    )
    return (floors[-1] if floors else ""), (html.unescape(times[-1]).strip() if times else "")


def extract_posts(source_html: Path, preview_length: int) -> tuple[str, list[Post]]:
    page = source_html.read_text(encoding="utf-8-sig", errors="replace")
    title_match = TITLE_RE.search(page)
    title = html.unescape(TAG_RE.sub("", title_match.group(1))).strip() if title_match else source_html.stem
    posts: list[Post] = []
    for match, fragment in inner_fragments(page):
        msg_id = match.group("data_id") or match.group("id")
        prefix = find_window_before(page, match.start(), msg_id)
        body, images = fragment_to_text(fragment, source_html)
        compact = compact_body(body)
        floor, time = extract_floor_and_time(prefix)
        posts.append(
            Post(
                id=msg_id,
                floor=floor,
                author=extract_author(prefix),
                time=time,
                source_html=str(source_html.resolve()),
                body=body,
                body_compact=compact,
                preview=make_preview(compact or body, preview_length),
                images=images,
            )
        )
    return title, posts


def inner_fragments(page: str):
    """Yield balanced inner div bodies, preserving nested HTML inside posts."""
    for match in POST_OPEN_RE.finditer(page):
        depth = 1
        for token in DIV_TOKEN_RE.finditer(page, match.end()):
            if token.group(0).lower().startswith("</div"):
                depth -= 1
                if depth == 0:
                    yield match, page[match.end() : token.start()]
                    break
            else:
                depth += 1


def write_jsonl(path: Path, rows: list[dict]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def write_markdown(path: Path, title: str, posts: list[Post], compact: bool) -> None:
    lines = [f"# {title}", ""]
    for post in posts:
        label = f"#{post.floor}" if post.floor else f"msg {post.id}"
        meta = " | ".join(part for part in [label, post.author, post.time] if part)
        lines.extend([f"## {meta}", "", post.body_compact if compact else post.body, ""])
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def write_preview(path: Path, title: str, posts: list[Post]) -> None:
    lines = [f"# {title}", "", "| Floor | Message | Author | Preview | Images |", "| --- | --- | --- | --- | --- |"]
    for post in posts:
        preview = post.preview.replace("|", "\\|").replace("\n", " ")
        images = ", ".join(image.role for image in post.images)
        lines.append(f"| {post.floor} | {post.id} | {post.author} | {preview} | {images} |")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def scene_markers(posts: list[Post]) -> list[dict]:
    markers: list[dict] = []
    for post in posts:
        for line_number, line in enumerate(post.body.splitlines(), start=1):
            if SCENE_MARKER_RE.match(line):
                markers.append(
                    {
                        "post_id": post.id,
                        "floor": post.floor,
                        "author": post.author,
                        "line": line_number,
                        "marker": line.strip(),
                    }
                )
    return markers


def extract_one(source_html: Path, out_dir: Path, preview_length: int) -> dict:
    title, posts = extract_posts(source_html, preview_length)
    slug = re.sub(r'[<>:"/\\|?*]+', "_", source_html.stem).strip(". ") or "page"
    page_dir = out_dir / slug
    page_dir.mkdir(parents=True, exist_ok=True)
    post_rows = [asdict(post) for post in posts]
    images = [
        {"post_id": post.id, "floor": post.floor, "author": post.author, **asdict(image)}
        for post in posts
        for image in post.images
    ]
    markers = scene_markers(posts)
    write_jsonl(page_dir / "posts.jsonl", post_rows)
    write_jsonl(page_dir / "posts.compact.jsonl", [
        {**row, "body": row["body_compact"], "images": row["images"]} for row in post_rows
    ])
    write_jsonl(page_dir / "images.jsonl", images)
    write_jsonl(page_dir / "scene-markers.jsonl", markers)
    write_markdown(page_dir / "posts.md", title, posts, compact=False)
    write_markdown(page_dir / "posts.compact.md", title, posts, compact=True)
    write_preview(page_dir / "preview.md", title, posts)
    return {
        "source": str(source_html.resolve()),
        "title": title,
        "posts": len(posts),
        "images": len(images),
        "images_needing_review": sum(bool(image["needs_review"]) for image in images),
        "scene_markers": len(markers),
        "output": str(page_dir.resolve()),
    }


def input_pages(path: Path) -> list[Path]:
    if path.is_file():
        return [path]
    return sorted(page for page in path.rglob("*.html") if page.is_file())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Saved HTML file or directory")
    parser.add_argument("-o", "--output", type=Path, default=Path("outputs/extracted"))
    parser.add_argument("--preview-length", type=int, default=180)
    args = parser.parse_args()
    pages = input_pages(args.input)
    if not pages:
        parser.error(f"No HTML files found under: {args.input}")
    args.output.mkdir(parents=True, exist_ok=True)
    summaries = [extract_one(page, args.output, args.preview_length) for page in pages]
    manifest = args.output / "manifest.json"
    manifest.write_text(json.dumps(summaries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"pages": summaries, "manifest": str(manifest.resolve())}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
