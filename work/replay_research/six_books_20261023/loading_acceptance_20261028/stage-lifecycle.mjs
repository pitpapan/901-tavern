import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const base=resolve('output/replay_tavern/six_books_20261023_candidate');
const out=resolve(base,'scene_test/world-loading-20261028');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const prior=await read(resolve(out,'config.json'));
const entries=(await Promise.all(prior.books.map(n=>read(resolve(base,'import',n.replace('W4_20261028_','')+'.json'))))).flatMap(x=>Object.values(x.entries));
const names=['洛汀','人物·猫音'];
const required=entries.filter(e=>(e.constant&&!e.disable)||names.includes(e.comment));
const settings=await read('D:/github/sillyTavern/data/default-user/settings.json');
const config={...prior,required:required.map(e=>({uid:e.uid,name:e.comment,content:e.content})),
  hold:required.filter(e=>!e.constant).map(e=>e.uid),memoryAdapter:process.argv.includes('--memory-fixed'),
  memorySettings:{frozen:settings.extension_settings.memory.memoryFrozen,source:settings.extension_settings.memory.source},
  rejectedReply:(await read(resolve(out,'lifecycle-semantic-review.json'))).budget.response,
  reviewedReply:'当前场景在洛汀，猫音在场。她已取得帝国学士资格。现有资料没有说明她此刻的具体事务，也没有记录个人持有物或店内库存；这些项目保持未确认。',
  reviewedMemory:'隔离验收W5人工采纳01（仅本测试分支）：当前在洛汀，猫音在场。她此刻的具体事务、个人持有物及店内库存未记录，不据此断言存在或不存在。未新增职业、专长、取得、交易、送信或知情传播。来源：本测试场景输入与人工订正后的保留回复；父记忆为空。',
  adoptionQuestion:'请核对当前地点、猫音身份，以及是否已有依据确认她在处理文书或持有远方材料。库存未记录应如何表述？不要推进剧情。',
  memoryA:'隔离验收分支A，人工采纳：当前在洛汀，猫音在场。信使已取走给雪老的密封信，目前没有送达或拆信记录。猫音只听见了送信委托，未见信文。御临风私下猜测信使来自兄弟会，没有说出口，这只是他的猜测。',
  memoryB:'隔离验收分支B，人工采纳：当前在洛汀，猫音在场。信使没有接下委托，信还没有发出；此前候选A的取信与离开已弃用。猫音只听见委托未被接下，未见信文。御临风私下猜测信使来自兄弟会，没有说出口，这只是他的猜测。',
  question:'请核对当前场景、信件进度，以及她是否已经知道信文和我的私人猜测。只说明已知范围，不替任何人推进送信或公开信息。',
  budgetInput:'当前在洛汀，猫音在场。查阅背景涉及帝国公共消息与民间见识、帝国学士与长期研习、帝国邻里与私人交往、白暮寒地材料与器材、风门山前魔法生态、飘零大陆共同节令与年度生活、银月城、远西魔法林材与特殊木材。只说当前城镇和在场人物的已知身份，不介绍其他地点，不创造现场资源。'};
await writeFile(resolve(out,'lifecycle-config.json'),JSON.stringify(config,null,2)+'\n');
await writeFile(resolve(out,'runtime/lifecycle-config.json'),JSON.stringify(config,null,2)+'\n');
await copyFile('work/replay_research/six_books_20261023/loading_acceptance_20261028/lifecycle-script.js',resolve(out,'runtime/lifecycle-script.js'));
console.log(JSON.stringify({required:required.map(e=>e.comment),memoryAdapter:config.memoryAdapter,memorySettings:config.memorySettings}));
