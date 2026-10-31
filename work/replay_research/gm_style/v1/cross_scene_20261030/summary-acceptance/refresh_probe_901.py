"""Temporarily trace startup on the opt-in URL of the installed local tavern."""
import hashlib
import os
import sys
import tempfile
from pathlib import Path

PUBLIC = Path("D:/github/sillyTavern/public")
HASHES = {
    "index.html": "5b03c7ee0090eb171421bd3fcddef4c3a2de0a31277c0467620032d633a104e6",
    "script.js": "d1e248efbae8a1df0a248410225cea76901f33533919fc32a28a172c1514600f",
}
HEAD = """<script>
if (new URLSearchParams(location.search).get('trace901') === 'load') {
    const nav = Math.round(performance.timeOrigin);
    const mark = (step, details = {}) => console.info('TRACE901 ' + JSON.stringify({
        nav, step, ms: Math.round(performance.now()), ...details,
    }));
    window.__trace901Load = mark;
    mark('html-head', {type: performance.getEntriesByType('navigation')[0]?.type});
    document.addEventListener('DOMContentLoaded', () => mark('dom-content-loaded'), {once:true});
    window.addEventListener('load', () => mark('window-load'), {once:true});
    for (const delay of [15000, 65000, 95000]) {
        setTimeout(() => mark('sample', {
            document: document.readyState,
            preloader: !!document.getElementById('preloader'),
            splash: !!document.querySelector('#loader.splash-screen'),
        }), delay);
    }
}
</script>"""

def mark(step, details=None):
    args = f"'{step}'" + (", " + details if details else "")
    return f"window.__trace901Load?.({args});"

# Insert markers beside the existing native operations, without wrapping fetch.
PATCHES = {
    "index.html": [("<head>", "<head>\n" + HEAD)],
    "script.js": [
        ("await new Promise((resolve) => {\n    if (document.readyState === 'complete')",
         mark("module-at-load-gate", "{document: document.readyState}") + "\nawait new Promise((resolve) => {\n    if (document.readyState === 'complete')"),
        ("// Configure toast library:", mark("module-past-load-gate") + "\n// Configure toast library:"),
        ("        const tokenResponse = await fetch('/csrf-token');", "        " + mark("csrf-request") + "\n        const tokenResponse = await fetch('/csrf-token');\n        " + mark("csrf-response", "{status: tokenResponse.status}")),
        ("        token = tokenData.token;", "        token = tokenData.token;\n        " + mark("csrf-parsed")),
        ("        toastr.error(t`Couldn't get CSRF token.", "        " + mark("csrf-failed") + "\n        toastr.error(t`Couldn't get CSRF token."),
        ("    registerPromptManagerMigration();", "    " + mark("splash-shown") + "\n    registerPromptManagerMigration();"),
        ("    await eventSource.emit(event_types.APP_INITIALIZED);", "    " + mark("app-initialized-emit") + "\n    await eventSource.emit(event_types.APP_INITIALIZED);"),
        ("    await eventSource.emit(event_types.APP_READY);", "    " + mark("app-ready-emit") + "\n    await eventSource.emit(event_types.APP_READY);"),
    ],
}

def transform(data, pairs, undo):
    newline = b"\r\n" if b"\r\n" in data else b"\n"
    for a, b in reversed(pairs) if undo else pairs:
        src, dst = (b, a) if undo else (a, b)
        src, dst = [s.encode().replace(b"\n", newline) for s in (src, dst)]
        if data.count(src) != 1:
            raise ValueError(f"ambiguous anchor: {src[:50]!r}")
        data = data.replace(src, dst, 1)
    return data

def replace_file(path, expected, result):
    with tempfile.NamedTemporaryFile(dir=PUBLIC, delete=False) as f:
        tmp = Path(f.name)
        try:
            f.write(result)
            f.close()
            if path.read_bytes() != expected:
                raise ValueError(f"concurrent edit: {path.name}")
            os.replace(tmp, path)
        finally:
            tmp.unlink(missing_ok=True)

mode = sys.argv[1]
if mode not in ("check", "install", "restore"):
    raise ValueError(mode)
undo = mode == "restore"
changes = []
for name in HASHES:
    path = PUBLIC / name
    data = path.read_bytes()
    result = transform(data, PATCHES[name], undo)
    original = result if undo else data
    if hashlib.sha256(original).hexdigest() != HASHES[name]:
        raise ValueError(f"unexpected {name} version")
    if transform(result, PATCHES[name], not undo) != data:
        raise ValueError("roundtrip failed")
    changes.append((path, data, result))
if mode != "check":
    done = []
    try:
        for args in changes:
            replace_file(*args)
            done.append(args)
    except Exception:
        for path, old, new in reversed(done):
            replace_file(path, new, old)
        raise
print(mode, "verified", ", ".join(HASHES))
