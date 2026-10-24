import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createOpeningFixture} from './opening.mjs';
import {initializeTestState} from '../mvu_poc/adapter.mjs';
const out=new URL('../../../output/replay_tavern/opening_combat_20261022_candidate/',import.meta.url);
export const chatId='901 初始卡石像撤离实测 - 2026-10-22';
const fixture=createOpeningFixture();fixture.actors.player.state.health.intact=10;fixture.actors.player.state.health.L=2;fixture.actors.player.state.resources.流风.current=21;
let data={initialized_lorebooks:{},stat_data:{},schema:{},display_data:{},delta_data:{}};
await initializeTestState({mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},expectedChatId:chatId,
  getAnchor:()=>({chatId,messageId:0,swipeId:0}),actors:fixture.actors});
const mes='【初始卡正式接口隔离验收】\n\n本聊天基于已采用的试炼洞穴入口场景建立独立当前态，不计帝都T0已发生事件。当前仅御临风在洞口接战区域，黄泉、布莱特、姜子尤均不在场。此前留下的肋侧轻伤尚未恢复，流风已有少量消耗；本场沿当前存档承接。\n\n洞口可见一具石像魔偶和与它相连的地面阵纹。已观察到阵纹的有效圈半径六米，圈心作为地图原点；御临风在圈心东侧四米，石像在东侧两米，相距两米。东侧八米处通往洞外的退路畅通。石像只守在圈内，尚未发动这一轮攻击。\n\n退出有效圈只代表脱离当前接战；石像仍在，洞穴任务、其他区域与奖励均未完成。现在尚未启动战斗接口，等待玩家明确声明接战。';
const row={name:'901 帝都初始卡',is_user:false,is_system:false,send_date:new Date().toISOString(),mes,extra:{},swipe_id:0,swipes:[mes],swipe_info:[{extra:{}}],variables:[data]};
if(!process.argv.includes('--update-card'))await writeFile(new URL(`${chatId}.jsonl`,out),[JSON.stringify({user_name:'御临风',character_name:'901 帝都初始卡',chat_metadata:{note_prompt:'',variables:{}}}),JSON.stringify(row)].join('\n')+'\n');
if(process.argv.includes('--import-card')||process.argv.includes('--update-card')) {
  const csrfResponse=await fetch('http://localhost:8000/csrf-token');
  const cookie=csrfResponse.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrfResponse.json();
  const form=new FormData();form.append('avatar',new Blob([await readFile(new URL('import/901_帝都初始卡.card.json',out))],{type:'application/json'}),'901_帝都初始卡.card.json');form.append('file_type','json');
  if(process.argv.includes('--update-card'))form.append('preserved_name','901 帝都初始卡.png');
  const response=await fetch('http://localhost:8000/api/characters/import',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token},body:form});
  console.log(JSON.stringify({importStatus:response.status,result:await response.json(),chatId}));
}
