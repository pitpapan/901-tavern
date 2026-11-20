"""Correct only the disposable relay; keep the first failed request as evidence."""
from pathlib import Path
import json,shutil
E=Path(__file__).resolve().parent;A=Path(json.loads((E/'setup.json').read_text(encoding='utf-8'))['app'])
p=A/'src/endpoints/backends/chat-completions.js';s=p.read_text(encoding='utf-8')
old="          return response.status(418).json({error:{message:'DIAGNOSTIC_EXTRACTION_NOT_SENT'}});"
assert s.count(old)==1
shutil.copy2(p,E/'backend.before-relay-correction.js')
p.write_text(s.replace(old,"          if(kind==='extraction')return response.status(418).json({error:{message:'DIAGNOSTIC_EXTRACTION_NOT_SENT'}});"),encoding='utf-8')
(E/'local-relay-diagnosis.json').write_text(json.dumps({'cause':'Disposable replyDiagnostic branch returned extraction-only HTTP418 for live narration before waiting for its saved response.',
 'productCodeChanged':False,'firstModelResponse':541,'modelResponseCompleted':True,'newExternalCallRequired':False,'correction':'Apply extraction guard to the existing refusal; live narration now reaches the unchanged held-response release loop.'},indent=2)+'\n',encoding='utf-8')
