import test from 'node:test';
import assert from 'node:assert/strict';
import {recordResourceUse} from './resource-use-cooldowns.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';
import {createOpeningRoster} from './combat/opening.mjs';
test('shared resource variants count within one round, persist on reload, and only the threshold starts cooldown',()=>{
 const state=createOpeningRoster().player.state;
 assert.equal(recordResourceUse(state,{sourceId:'arc',version:'v1',maximum:2,cooldown:1}).cooldownStarted,false);
 const loaded=JSON.parse(JSON.stringify(state));
 assert.equal(recordResourceUse(loaded,{sourceId:'arc',version:'v1',maximum:2,cooldown:1}).cooldownStarted,true);
 assert.equal(loaded.resourceCooldowns.arc,2);expireResourceEffects(loaded,{minutes:.1,rounds:1});
 assert.equal(loaded.resourceUseWindows.arc,undefined);assert.equal(loaded.resourceCooldowns.arc,1);
 expireResourceEffects(loaded,{minutes:.1,rounds:1});assert.equal(loaded.resourceCooldowns.arc,undefined);
 assert.equal(recordResourceUse(loaded,{sourceId:'arc',version:'v1',maximum:2,cooldown:1}).used,1);
});
test('elapsed fractions share a field use window and expiration resets incomplete usage without a cooldown',()=>{
 const state=createOpeningRoster().player.state;
 recordResourceUse(state,{sourceId:'arc',version:'v1',maximum:2,cooldown:1});expireResourceEffects(state,{minutes:.04,rounds:.4});
 assert.equal(state.resourceUseWindows.arc.used,1);expireResourceEffects(state,{minutes:.06,rounds:.6});
 assert.equal(state.resourceUseWindows.arc,undefined);assert.equal(state.resourceCooldowns,undefined);
});
