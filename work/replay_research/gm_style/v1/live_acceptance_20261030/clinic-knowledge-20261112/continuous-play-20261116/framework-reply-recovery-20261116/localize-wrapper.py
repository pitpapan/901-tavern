from pathlib import Path
import json,hashlib,shutil
E=Path(__file__).resolve().parent
A=Path(json.loads((E/'browser-prepared.json').read_text(encoding='utf-8'))['app'])
p=A/'public/scripts/extensions/third-party/JS-Slash-Runner/dist/index.js'
shutil.copy2(p,E/'wrapper.before.js')
s=p.read_text(encoding='utf-8');assets={
 'vue.js':'https://testingcf.jsdelivr.net/npm/vue/dist/vue.runtime.global.prod.min.js',
 'vue-router.js':'https://testingcf.jsdelivr.net/npm/vue-router/dist/vue-router.global.prod.min.js',
 'log.js':'https://testingcf.jsdelivr.net/gh/N0VI028/JS-Slash-Runner/src/iframe/node_modules/log.js'}
proof=[]
for name,url in assets.items():
 assert url in s,url
 s=s.replace(url,'/reply-diagnostic-vendor/'+name)
 asset=A/'public/reply-diagnostic-vendor'/name
 proof.append({'existingUrl':url,'localFile':str(asset),'sha256':hashlib.sha256(asset.read_bytes()).hexdigest()})
p.write_text(s,encoding='utf-8')
(E/'existing-wrapper-assets.json').write_text(json.dumps(proof,indent=2)+'\n',encoding='utf-8')
