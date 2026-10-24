from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def edit(path,old,new):
 p=ROOT/path;s=p.read_text(encoding='utf-8')
 if old not in s: raise ValueError(f'not found: {path}: {old[:100]}')
 p.write_text(s.replace(old,new),encoding='utf-8')
