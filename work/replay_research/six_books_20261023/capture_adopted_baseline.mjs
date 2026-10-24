import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';import {createHash} from 'node:crypto';
const base=resolve('output/replay_tavern/six_books_20261023_candidate'),home='D:/github/sillyTavern';
const read=async p=>JSON.parse(await readFile(p,'utf8')),hash=b=>createHash('sha256').update(b).digest('hex');
const journal=await read(resolve(base,'installation.json')),books=[];
for(const {name} of journal.books){
 const path=resolve(home,'data/default-user/worlds',name+'.json'),bytes=await readFile(path);
 const prior=await read(resolve(base,'import',name+'.json'));
 // The previous batch installed runtime only. The sole inspected live/content
 // delta is its one missing burning-boundary sentence in the existing core UID.
 if(prior.entries?.['1424810427'])prior.entries['1424810427'].content=prior.entries['1424810427'].content.replace('PHB燃烧默认在人物自身行动结束结算一次，不逐标准/移动/迅捷小动作触发。','');
 if(JSON.stringify(JSON.parse(bytes))!==JSON.stringify(prior))throw Error('Live book differs from last installed candidate: '+name);
 books.push({name,path,sha256:hash(bytes)});
}
const cardPath=resolve(home,'data/default-user/characters',journal.avatar);
await writeFile(resolve(base,'adopted-baseline.json'),JSON.stringify({books,card:{path:cardPath,sha256:hash(await readFile(cardPath))}},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'prior-six-books-match-installed-candidate',books:books.length}));
