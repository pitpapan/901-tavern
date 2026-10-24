import test from 'node:test';
import assert from 'node:assert/strict';
import {mountPlayerStatus} from './player-status-ui.mjs';

// Only the DOM surface used by this local view; real layout is checked in ST.
class Element {
  children=[];dataset={};hidden=false;open=false;attributes={};
  constructor(tag){this.tag=tag;}
  set textContent(value){this.text=value;this.children=[];}
  get textContent(){return (this.text??'')+this.children.map(c=>c.textContent).join(' ');}
  append(...items){for(const child of items){child.remove();this.children.push(child);child.parentNode=this;}}
  before(child){child.remove();const parent=this.parentNode;parent.children.splice(parent.children.indexOf(this),0,child);child.parentNode=parent;}
  remove(){if(this.parentNode){const list=this.parentNode.children;list.splice(list.indexOf(this),1);this.parentNode=null;}}
  replaceChildren(){this.children.forEach(c=>{c.parentNode=null;});this.children=[];this.text='';}
  setAttribute(key,value){this.attributes[key]=value;}
  removeAttribute(key){delete this.attributes[key];delete this[key];}
  querySelector(tag){return this.children.find(c=>c.tag===tag)??null;}
}
function documentFixture(){
  const head=new Element('head'),body=new Element('body'),form=new Element('div'),send=new Element('div');
  send.id='send_form';body.append(form);form.append(send);
  const legacy=new Element('details'),summary=new Element('summary');summary.textContent='御临风 · 自身状态';legacy.append(summary);
  const all=el=>[el,...el.children.flatMap(all)];
  return {head,body,legacy,send,createElement:tag=>new Element(tag),
    getElementById:id=>[...all(head),...all(body)].find(el=>el.id===id),querySelectorAll:()=>[legacy]};
}
const turn={standard:1,move:1,swift:1};
const state=(revision=1)=>({revision,player:{name:'御临风',health:{intact:17,B:0,L:4,A:0},hpMax:21,
  attack:{dp:60},defense:{pending:true},speed:26,actions:{...turn},energy:{风池:{current:9,max:10},魔力:{current:106,max:106}},
  activeTurn:true,statuses:[{type:'晕眩',points:2}],life:'可行动',attributes:{力量:12}}});
const tick=()=>new Promise(resolve=>setTimeout(resolve,5));

test('player bar renders avatar and MVU values above input; explicit refresh updates guard and remaining actions',async()=>{
  const document=documentFixture();let current=state();
  const ui=mountPlayerStatus({document,getState:async()=>current,getChatId:()=> 'chat-a',getAvatar:()=>'/User Avatars/player.png'});
  await tick();
  const view=document.getElementById('rules901-player-status');
  assert.equal(view.parentNode.children.indexOf(view)+1,view.parentNode.children.indexOf(document.send));
  assert.equal(view.hidden,false);assert.equal(view.open,false);
  assert.match(view.textContent,/御临风.*生命 17\/21.*攻击 60DP · 防御 待声明 · 速度 26米/s);
  assert.match(view.textContent,/风池 9\/10.*魔力 106\/106.*移动 1.*晕眩 2/s);
  current.player.inventory=[{name:'药B',quantity:2},{name:'雷霆药剂',quantity:null}];
  current.player.pendingRecoveryEffects=[{medicine:'药C',choice:'heal'}];
  current.player.xp=24;current.player.will={current:2,max:3};
  ui.refresh();await tick();
  assert.match(view.textContent,/物品：药B ×2、雷霆药剂 ×数量未记.*待生效：药C/s);
  assert.match(view.textContent,/意志 2\/3 · XP 24/);
  assert.equal(view.children[0].children[0].src,'/User Avatars/player.png');
  assert.equal(document.legacy.hidden,true);
  current=state(2);current.player.defense={total:42};current.player.declaredDefense={mode:'block'};current.player.actions.move=0;
  ui.refresh();await tick();await ui.open();
  assert.equal(view.open,true);assert.equal(view.dataset.revision,'2');
  assert.match(view.textContent,/防御 42DP.*移动 0.*已声明守势/s);
  ui.dispose();assert.equal(document.getElementById('rules901-player-status'),undefined);assert.equal(document.legacy.hidden,false);
});

test('late state read cannot reveal the previous chat after switching chats',async()=>{
  const document=documentFixture(),listeners=new Map();let chat='a',resolveOld;
  let read=()=>new Promise(resolve=>{resolveOld=resolve;});
  const ui=mountPlayerStatus({document,getState:()=>read(),getChatId:()=>chat,
    on:(event,callback)=>{listeners.set(event,callback);return {stop:()=>listeners.delete(event)};},events:['chat_changed']});
  chat='b';read=async()=>null;listeners.get('chat_changed')();
  resolveOld(state());await tick();await tick();
  assert.equal(document.getElementById('rules901-player-status')?.hidden??true,true);
  assert.equal(document.send.parentNode.textContent.includes('御临风'),false);
  read=async()=>{const next=state(7);next.player.name='新聊天玩家';return next;};
  ui.refresh();await tick();await tick();
  const next=document.getElementById('rules901-player-status');
  assert.equal(next.dataset.chatId,'b');assert.equal(next.dataset.revision,'7');assert.match(next.textContent,/新聊天玩家/);
  ui.dispose();assert.equal(listeners.size,0);
});

test('status request opens the bar when an initial read is still pending; unrelated cards stay hidden',async()=>{
  const document=documentFixture();let resolveRead,active=true;
  const ui=mountPlayerStatus({document,getState:()=>new Promise(resolve=>{resolveRead=resolve;}),getChatId:()=> 'a',isActive:()=>active});
  await ui.open();resolveRead(state());await tick();
  const view=document.getElementById('rules901-player-status');assert.equal(view.open,true);
  active=false;ui.refresh();assert.equal(view.hidden,true);
  ui.dispose();
});
