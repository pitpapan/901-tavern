// Read-only inventory. This script never archives or removes Tavern files.
import {readdir,readFile,stat,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const home='D:/github/sillyTavern/data/default-user',out=import.meta.dirname;
const archiveReady=new Map([
 ['901 叙事隔离验收 20261030','文风缺失/历史截断基线；live_acceptance_20261030/captured-rounds.json'],
 ['901 叙事修复复验 20261030','同题五轮修复复验；live_acceptance_20261030/candidate/captured-rounds.json'],
 ['901 正式入口汇合验收 20261030','文风与完整历史正式汇合已完成；live_acceptance_20261030/formal-integration/README.md'],
 ['901 行动失败隔离验收 20261030','恢复分流已修复、安装并同步共享清单；live_acceptance_20261030/action-failure/README.md']
]);
const rows=[];
for(const f of (await readdir(resolve(home,'characters'))).filter(f=>f.endsWith('.png')).sort()){
 const name=f.slice(0,-4);if(name!=='901 帝都初始卡'&&!archiveReady.has(name)&&!/^901 六轮叙事/.test(name)&&!/验收|测试|演练|候选/.test(name))continue;
 let files=[];try{files=(await readdir(resolve(home,'chats',name))).filter(f=>f.endsWith('.jsonl')).sort();}catch(e){if(e.code!=='ENOENT')throw e;}
 const chats=[];for(const f of files){const p=resolve(home,'chats',name,f),s=await stat(p);chats.push({name:f.slice(0,-6),path:p,bytes:s.size,messages:(await readFile(p,'utf8')).trim().split(/\r?\n/).length-1});}
 const status=name==='901 帝都初始卡'?'permanent_keep':/^901 六轮叙事/.test(name)?'keep_current_acceptance':archiveReady.has(name)?'archive_then_cleanup_candidate':'needs_owner_review';
 rows.push({name,cardPath:resolve(home,'characters',f),status,evidence:archiveReady.get(name)??null,chats});
}
await writeFile(resolve(out,'cleanup-inventory.json'),JSON.stringify({inventoryOnly:true,deleted:0,archived:0,rows},null,2)+'\n');
const section=(status,title)=>`## ${title}\n\n`+rows.filter(r=>r.status===status).map(r=>`- **${r.name}**：${r.chats.map(c=>`${c.name}（${c.messages}楼）`).join('；')||'没有JSONL聊天'}${r.evidence?'。证据：'+r.evidence:''}。`).join('\n')+'\n\n';
await writeFile(resolve(out,'cleanup-plan.md'),'# 酒馆测试记录保留与清理名单\n\n本清单仅基于只读盘点；本轮未归档、删除、改名或清空任何角色卡、聊天及存档。名称含“实测”不代表可删：正式原聊天必须保留。\n\n'+
 section('permanent_keep','长期保留')+section('keep_current_acceptance','保留本轮验收')+section('archive_then_cleanup_candidate','完成后可归档清理的四组旧测试')+
 '这四组已有项目证据，但证据摘要不代替完整聊天备份。实际清理前需备份对应角色卡PNG与全部JSONL；精确路径见cleanup-inventory.json。清理范围仅限确认的卡和聊天，不连带删除六书、正式运行模块、共享静态资源或项目验收证据。\n\n'+
 section('needs_owner_review','归属或验收完成状态待核对')+'此组仅因名称进入盘点，没有据名称判定其可删除；须核对所属工作线的保留需求后再处理。\n');
console.log(JSON.stringify({cards:rows.length,archiveCandidates:rows.filter(r=>r.status==='archive_then_cleanup_candidate').length,needsReview:rows.filter(r=>r.status==='needs_owner_review').length,deleted:0}));
