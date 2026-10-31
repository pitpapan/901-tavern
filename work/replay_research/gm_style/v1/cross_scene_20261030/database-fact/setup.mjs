import assert from 'node:assert/strict';
import { constants } from 'node:fs';
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { join, relative } from 'node:path';
import { book, chatId, cue, fact, input, name } from './scenario.mjs';

const root = 'D:/github/sillyTavern', data = join(root, 'data/default-user'), here = import.meta.dirname;
const formal = '901 帝都初始卡', formalChat = '901 初始卡石像撤离实测 - 2026-10-22';
const route = '/901-db-fact-20261031/', assets = join(root, 'public', route.slice(1));
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
const save = (file, obj) => writeFile(join(here,file), JSON.stringify(obj,null,2)+'\n', {flag:'wx'});
const cardPath = n => join(data, 'characters', n + '.png');
const chatPath = (n,id) => join(data, 'chats', n, id + '.jsonl');
const bookPath = n => join(data, 'worlds', n + '.json');
const settingsPath = join(data, 'settings.json');
const protectedPath = join(here, 'protected-before.json');

async function protect() {
    const files = {};
    async function walk(dir) {
        for (const e of await readdir(dir, {withFileTypes:true})) {
            const path = join(dir,e.name);
            if (e.isDirectory()) await walk(path);
            else files[relative(root,path)] = sha(await readFile(path));
        }
    }
    for (const dir of [join(data,'characters'),join(data,'chats'),join(data,'worlds'),join(root,'public/901-opening-combat')]) await walk(dir);
    const s = await readJson(settingsPath);
    return {files, model:sha(JSON.stringify(s.oai_settings)), memory:sha(JSON.stringify(s.extension_settings.memory))};
}
function readCard(bytes) {
    for (let i=8;i<bytes.length;) {
        const n=bytes.readUInt32BE(i), type=bytes.toString('ascii',i+4,i+8), chunk=bytes.subarray(i+8,i+8+n);
        if (type==='tEXt' && chunk.subarray(0,6).equals(Buffer.from('chara\0'))) return JSON.parse(Buffer.from(chunk.subarray(6).toString(),'base64'));
        i+=12+n;
    }
    throw Error('Missing character metadata');
}
async function verify() {
    const b = await readJson(protectedPath), s=await readJson(settingsPath);
    for (const [key,h] of Object.entries(b.files)) assert.equal(sha(await readFile(join(root,key))),h,key);
    assert.equal(sha(JSON.stringify(s.oai_settings)),b.model);
    assert.equal(sha(JSON.stringify(s.extension_settings.memory)),b.memory);
    return Object.keys(b.files).length;
}
if (process.argv[2]==='verify') {
    console.log({protected:await verify()});
} else if (process.argv[2]==='baseline') {
    await save('protected-before.json',await protect());
} else if (process.argv[2]==='install') {
    await verify();
    for (const p of [cardPath(name),chatPath(name,chatId),bookPath(book),assets]) {
        await assert.rejects(stat(p),{code:'ENOENT'});
    }
    const card=readCard(await readFile(cardPath(formal)));
    const primary=card.data.extensions.world, entry=card.data.extensions.tavern_helper.scripts.find(x=>x.name==='901 帝都初始卡入口');
    assert.equal(sha(entry.content),'b7148f4d6d84a3f8212f16b299f0ba5c59168c36bf9a42c2c28fbd56557f253a');
    const scene='隔离测试场景。御临风、黄泉与布莱特在洛汀一间普通客店门外歇脚。';
    card.name=card.data.name=name; card.chat=chatId; card.data.extensions.world=book; card.data.character_book.name=book;
    card.first_mes=card.data.first_mes=scene; card.scenario=card.data.scenario=scene; card.data.alternate_greetings=[];
    card.data.extensions.tavern_helper.scripts.push({type:'script',enabled:true,id:randomUUID(),name:'数据库事实验收采集',content:`await import('${route}recorder.js');`,info:'Isolated evidence',button:{enabled:false,buttons:[]},data:{}});
    const rows=(await readFile(chatPath(formal,formalChat),'utf8')).trimEnd().split(/\r?\n/).map(JSON.parse);
    const meta=rows[0].chat_metadata;
    const localMeta={integrity:randomUUID()};
    for (const key of ['TavernDB_ACU_ScopedConfig','TavernDB_ACU_InternalSheetGuide']) {
        localMeta[key]=meta[key]; localMeta[key+'__chatId']=chatId;
    }
    const first=rows[1];
    const frame=structuredClone(first.TavernDB_ACU_IsolatedData);
    const cp=frame[''].storageFrame.checkpoint;
    const sheet=cp.data.sheet_ji_yao_biao;
    assert.deepEqual(sheet.content,[['row_id','编码索引','时间跨度','概览','纪要','重要对话']]);
    sheet.content.push([1,'DB901-01','此前','摊前约好下次碰头。',fact,'']);
    const status=structuredClone(first.variables);
    assert.equal(status[0].stat_data['901_rules_poc'].revision,0);
    status[0].stat_data['901_rules_poc'].chatId=chatId;
    const assistant=mes=>({name,is_user:false,is_system:false,mes,send_date:new Date().toISOString(),extra:{}});
    const seed=[{user_name:'unused',character_name:name,chat_metadata:localMeta},
        assistant(scene),{...assistant('我在门外停下，等两人走到身边。'),is_user:true,name:'御临风'},
        {...assistant('黄泉在廊柱边站住，布莱特也停下脚步。'),variables:status,TavernDB_ACU_IsolatedData:frame}];
    assert(!JSON.stringify(card).includes(cue));
    assert(![...seed.slice(1).map(m=>m.mes),input].some(s=>s.includes(cue)));
    const primaryBytes=await readFile(bookPath(primary));
    assert(!primaryBytes.includes(Buffer.from(cue)));
    const origin='http://127.0.0.1:8000', csrf=await fetch(origin+'/csrf-token');
    const headers={Cookie:csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),'X-CSRF-Token':(await csrf.json()).token};
    async function post(path,obj) {
        const r=await fetch(origin+path,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(obj)});
        assert.ok(r.ok,path+' '+r.status);
    }
    await mkdir(assets);
    const cfg={name,chatId,rounds:[null,{id:'01-数据库公开事实',input}]};
    const recorder=(await readFile(join(here,'../../live_acceptance_20261030/recorder.js'),'utf8'))
      .replaceAll('/901-narrative-acceptance-20261030/',route).replaceAll('narrative_acceptance_20261030','db_fact_acceptance_20261031');
    await writeFile(join(assets,'recorder.js'),recorder,{flag:'wx'});
    await writeFile(join(assets,'config.json'),JSON.stringify(cfg),{flag:'wx'});
    await copyFile(bookPath(primary),bookPath(book),constants.COPYFILE_EXCL);
    const form=new FormData();form.append('avatar',new Blob([JSON.stringify(card)],{type:'application/json'}),'db-fact.card.json');form.append('file_type','json');
    const r=await fetch(origin+'/api/characters/import',{method:'POST',headers,body:form});assert.ok(r.ok);
    const imported=await r.json();assert.ok([name,name+'.png'].includes(imported.file_name),imported.file_name);
    const s=await readJson(settingsPath),bindings=s.world_info_settings.world_info.charLore;
    const extras=bindings.find(b=>b.name===formal).extraBooks;
    assert.equal(extras.length,5);assert(!bindings.some(b=>b.name===name));
    bindings.push({name,extraBooks:extras});
    await post('/api/settings/save',s);
    await post('/api/chats/save',{avatar_url:name+'.png', file_name:chatId,chat:seed});
    const installed=readCard(await readFile(cardPath(name)));
    assert.equal(installed.data.extensions.world,book);assert.equal(installed.data.extensions.tavern_helper.scripts.find(x=>x.name===entry.name).content,entry.content);
    await save('installation.json',{name,chatId,book,sourceBook:primary,entrySha256:sha(entry.content),isolatedSeedMessages:3,sourceTable:sheet.name,rowCode:'DB901-01',input,protectedFiles:await verify()});
    console.log('installed and verified',name);
} else throw Error('Choose baseline, install, or verify');
