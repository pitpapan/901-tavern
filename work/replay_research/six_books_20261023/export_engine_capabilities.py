"""Export actual local JS capabilities for the offline kit compiler; no APIs."""
from pathlib import Path
import json,subprocess
ROOT=Path(__file__).resolve().parents[3]
def main():
    data=json.loads(subprocess.check_output(['node','--input-type=module','-e',
        "import {PROGRAM_CAPABILITIES as capabilities,PROGRAM_ABI as abi} from './work/rules_engine/program-operators.mjs';console.log(JSON.stringify({capabilities,abi}));"],cwd=ROOT,text=True))
    path=ROOT.parent/'901-resource-authoring-kit/resources/execution/_engine-capabilities.json'
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'operators':len(data['capabilities']['operators']),'output':str(path)},ensure_ascii=False))
if __name__=='__main__':main()
