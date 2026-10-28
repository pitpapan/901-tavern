import test from 'node:test';
import assert from 'node:assert/strict';
import {retainedBranchMemory} from './branch-memory.mjs';

test('retains a manual summary beyond the six-message narration window without mutation',()=>{
  const chat=[{extra:{memory:'A：已发信，未确认送达。'}},...Array.from({length:7},()=>({extra:{}}))];
  const before=structuredClone(chat);
  assert.match(retainedBranchMemory(chat),/A：已发信，未确认送达。/);
  assert.deepEqual(chat,before);
});
test('native selected extra wins over discarded swipe summaries',()=>{
  const chat=[{extra:{memory:'父记忆。'}},{swipe_id:1,extra:{memory:'B：委托未接，未发信。'},
    swipe_info:[{extra:{memory:'A：已发信。'}},{extra:{memory:'B：委托未接，未发信。'}}]},{is_user:true}];
  const text=retainedBranchMemory(chat);
  assert.match(text,/B：委托未接，未发信。/);assert.doesNotMatch(text,/A：|父记忆/);
  chat[1].extra={};
  assert.match(retainedBranchMemory(chat),/父记忆/);
  assert.doesNotMatch(retainedBranchMemory(chat),/A：|B：/);
});
test('follows the native pre-last convention and does not invent a second memory source',()=>{
  assert.equal(retainedBranchMemory([]),'');
  assert.equal(retainedBranchMemory([{extra:{memory:'尚未成为上一楼的记录'}}]),'');
  assert.equal(retainedBranchMemory([{extra:{summary:'另一工具字段'}},{is_user:true}]),'');
});
