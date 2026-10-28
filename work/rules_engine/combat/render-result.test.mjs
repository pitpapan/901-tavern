import test from 'node:test';
import assert from 'node:assert/strict';
import {renderResult} from './engine.mjs';
test('combat report includes saved mechanism damage instead of claiming no new damage',()=>{
 const value={result:{actorId:'player',abilityId:'mechanism',round:3,damage:[],notes:[],
  mechanism:{resourceId:'imperial-magic:D:魔能爆',damage:[{targetId:'huang',actualDamage:3,severity:'L'}]},
  after:{activeId:'player',status:'active',participants:[
   {id:'player',name:'御临风',team:'a',health:{intact:12,B:0,L:0,A:0},energy:{精神魔力:{current:10}},actions:{standard:0,move:1,swift:1},position:[0,0]},
   {id:'huang',name:'黄泉',team:'b',health:{intact:5,B:0,L:7,A:0},energy:{},actions:{standard:0,move:0,swift:0},position:[1,0]},
  ]}}};
 const before=structuredClone(value),text=renderResult(value);
 assert.match(text,/黄泉承受3L/);assert.doesNotMatch(text,/无新增伤害/);assert.deepEqual(value,before);
});
