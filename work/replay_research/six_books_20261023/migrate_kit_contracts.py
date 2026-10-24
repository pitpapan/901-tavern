"""Pair every maintained item with an execution contract; never overwrite authored contracts."""
from pathlib import Path
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[3]
KIT=ROOT.parent/'901-resource-authoring-kit'
STAGE=Path(__file__).resolve().parent
DEST=KIT/'resources/execution'
def dump(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def filename(id):return hashlib.sha256(id.encode()).hexdigest()[:12]+'.rule.json'
def main():
    inventory=json.loads((STAGE/'kit-inventory.json').read_text(encoding='utf-8'))
    existing={json.loads(p.read_text(encoding='utf-8'))['id']:p for p in DEST.glob('*.rule.json')}
    created=0
    for item in inventory['entries']:
        if item['id'] in existing:continue
        source=item['source'].replace('../901-resource-authoring-kit/','')
        spell=item['kind']=='spell';template=item['kind']=='character-template';section=spell or item.get('sectionDepth')
        headings=[item['name']] if section else re.findall(r'^### (.+)$',item['body'],re.M)
        title=item['name'];subfield=re.search(r'\*\*(?:法系／子技能|学系／子技能)：\*\*(.+)',item['body'])
        subskills=[]
        if subfield:
            subskills=re.findall(r'神秘[·・]([^\s，。；、／]+)',subfield.group(1))
        reading={'path':source,'sha256':item['sourceHash']}
        if section:reading.update(heading=title,headingDepth=item.get('sectionDepth',3))
        doc={'schemaVersion':'901-resource/1','id':item['id'],'version':'2026-10-23.1',
             'identity':{'name':title,'grade':item.get('grade'),'category':item['kind'],'tree':'imperial' if spell else None},
             'reading':reading,'definition':{'source':source,'grade':item.get('grade'),'prohibited':item.get('prohibited',False),'subskills':subskills,'effects':[],
              **({'template':{'period':'later-optional','applyMode':'individual-acquisitions','allowSnapshotOverwrite':False,'resourceRefs':[]}} if template else {})},
             'clauses':[{'heading':h,'effectStats':[],'status':'pending'} for h in headings],
             'actions':[], 'inputs':[], 'unresolvedRules':[],
             'implementationGaps':[] if item.get('prohibited') or item['kind']=='rules' else ['结构化逐条效果与运行接口尚须完成；属于实现工作，不是待裁定'],
             'verification':{'status':'pending','sourceChecked':True,'runtimeFullyVerified':False}}
        if spell and not item.get('prohibited'):
            doc['definition']['learning']={'baseXP':10 if item['grade']=='D' else 25,'requiresKnownVersion':False,
             **({'upgradeC':{'retainD':25,'replaceD':15}} if item['grade']=='D' else {})}
        dump(DEST/filename(item['id']),doc);created+=1
    print(json.dumps({'existing':len(existing),'created':created,'total':len(existing)+created}))
if __name__=='__main__':main()
