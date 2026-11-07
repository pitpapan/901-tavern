"""Read-only capture of completed isolated UI runs, with exact operation receipts."""
import json, shutil, sys
import lab
S=lab.L/'action-sweep-20261107'
U=S/'app/data/default-user'
cases=json.loads((S/'cases.json').read_text(encoding='utf8'))
def capture(ids):
 out=[]
 for c in cases:
  if ids and c['id'] not in ids:continue
  p=U/'chats/901 动作集中验收 20261107'/(c['name']+'.jsonl')
  a=[json.loads(x) for x in p.read_text(encoding='utf8').splitlines()]
  if len(a)<4 or a[-1].get('is_user'):continue
  r=a[-1]['variables'][0]['stat_data']['901_rules_poc']
  assert r['chatId']==c['name'],(c['id'],r['chatId'])
  assert all(c['name'] in k for k in r.get('operations',{}) if k.startswith('declaration/')),c['id']
  ops=[o['summary'] for o in r.get('operations',{}).values()]
  results=[o.get('result',{}) for o in ops]
  commands=[json.loads(o['signature']) for o in r.get('operations',{}).values() if o.get('signature')]
  actual=[x.get('abilityId') for x in commands if x.get('actorId')==c.get('expectedActor','player') and x.get('abilityId')!='enter']
  v={'id':c['id'],'title':c['title'],'expected':c['expected'],'actual':actual,
   'messages':len(a)-1,'revision':r['revision'],'pending':r.get('battle',{}).get('pending'),
   'operations':ops,'commands':commands,'text':a[-1]['mes'],'playerState':r['actors']['player']['state']}
  lab.put(S/(c['id']+'-capture.json'),v);shutil.copy2(p,S/(c['id']+'-result.jsonl'))
  out.append({k:v[k] for k in ['id','expected','actual','messages','revision','pending']})
 print(json.dumps(out,ensure_ascii=False))
if __name__=='__main__':capture(sys.argv[1:])
