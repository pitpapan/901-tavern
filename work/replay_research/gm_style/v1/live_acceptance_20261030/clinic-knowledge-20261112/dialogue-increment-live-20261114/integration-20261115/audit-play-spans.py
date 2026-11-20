"""Read-only audit of original UTF-16 spans; never repairs model output."""
from pathlib import Path
import json,sys
E=Path(__file__).resolve().parent; I=E/'iteration-200-20261115'; N=E/'normal-play-20261115'
name=sys.argv[1]; request=json.loads((I/(name+'.request.json')).read_text(encoding='utf8'))
data=json.loads(request['messages'][1]['content']); response=json.loads((I/(name+'.content.txt')).read_text(encoding='utf8'))
text=data['sourceAnchor']['text']; raw=text.encode('utf-16-le'); bad=[]
def visit(value,path='reply'):
 if isinstance(value,dict):
  if value.get('documentId')=='current' and all(k in value for k in ('start','end','quote')):
   actual=raw[value['start']*2:value['end']*2].decode('utf-16-le')
   if actual!=value['quote']:bad.append(dict(path=path,**value,actual=actual))
  for k,v in value.items():visit(v,path+'.'+str(k))
 elif isinstance(value,list):
  for k,v in enumerate(value):visit(v,path+'.'+str(k))
visit(response)
result=dict(id=name,bad=bad,repair=False,programOmissionProven=False)
(N/(name+'.span-audit.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(result,ensure_ascii=False))
