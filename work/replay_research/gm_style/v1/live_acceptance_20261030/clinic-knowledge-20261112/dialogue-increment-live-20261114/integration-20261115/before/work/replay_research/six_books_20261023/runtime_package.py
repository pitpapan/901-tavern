"""Package existing browser modules, including the original Host knowledge dependency closure."""
from pathlib import Path
import hashlib, json, os, re, sys

IMPORT = re.compile(r'''((?:from\s*|import\s*\()\s*['"])([^'"]+)(['"])''')
PREFIXES = ('/901-rules-runtime/', '/901-combat-runtime/', '/901-opening-combat/')

def package_runtime(root, destination, entries):
    root, destination = Path(root).resolve(), Path(destination).resolve()
    engine = root.parent / '901-trpg-engine'
    def relative(src):
        if src.is_relative_to(root): return src.relative_to(root)
        if src.is_relative_to(engine): return Path('shared/901-trpg-engine') / src.relative_to(engine)
        raise ValueError(f'Outside browser source roots: {src}')
    def target(src, spec):
        if spec.startswith('.'): return (src.parent / spec).resolve()
        for prefix in PREFIXES:
            if spec.startswith(prefix): return (root / spec[len(prefix):]).resolve()
        raise ValueError(f'Non-browser dependency: {spec}')
    pending, modules = [Path(p).resolve() for p in entries], {}
    while pending:
        src = pending.pop()
        if src in modules: continue
        relative(src)
        body = src.read_text(encoding='utf-8')
        modules[src] = body
        for match in IMPORT.finditer(body):
            if match[2].endswith(('.mjs', '.js')): pending.append(target(src, match[2]))
    manifest = []
    for src, body in sorted(modules.items()):
        dest = destination / relative(src)
        def rewrite(match):
            spec = match[2]
            if not spec.endswith(('.mjs', '.js')): return match[0]
            path = os.path.relpath(destination / relative(target(src, spec)), dest.parent).replace('\\', '/')
            return match[1] + (path if path.startswith('.') else './' + path) + match[3]
        staged = IMPORT.sub(rewrite, body)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(staged, encoding='utf-8', newline='\n')
        digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
        manifest.append(dict(source=os.path.relpath(src, root), source_sha256=digest(src), destination=str(dest), sha256=digest(dest)))
    return manifest

if __name__ == '__main__':
    args = json.load(sys.stdin)
    print(json.dumps(package_runtime(args['root'], args['destination'], args['entries'])))
