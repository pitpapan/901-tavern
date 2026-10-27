import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster} from './combat/opening.mjs';
import {checkModifiers} from './core.mjs';
import {resourceBonus} from './resource-definitions.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';
import {endTimedResource,timedResourceInstances} from './resource-instances.mjs';
import * as ongoing from './resource-ongoing.mjs';
const effect=(id,power,order,debt=true)=>({id,sourceId:'test/time',casterId:'player',grade:'C',scene:true,selection:{group:'test-time',power,order},effects:[{stat:'check',value:power,when:{test:'eq',left:{context:'attribute'},right:'敏捷'}}],...(debt?{endCost:{amount:1,severity:'A',clock:'effective-round',unavoidable:true}}:{})});
function fixture(){const root={instanceId:'battle',round:1,actors:createOpeningRoster()};root.actors.player.state.activeResourceEffects=[];return {root,s:root.actors.player.state};}
test('one selected source across modes, newest equal power wins and older source returns without merging',()=>{
 const {s}=fixture();s.activeResourceEffects=[effect('old',6,1),effect('new',6,2,false)];s.activeResourceEffects[1].effects[0].value=-6;
 assert.equal(resourceBonus(s,'check',{attribute:'敏捷'}),-6);
 s.activeResourceEffects.pop();assert.equal(resourceBonus(s,'check',{attribute:'敏捷'}),6);
});
test('Q26 activation round is charged once regardless of spent actions; Q27 covered rounds pause and resume after reload',()=>{
 const {root,s}=fixture();s.turn={standard:0,move:0,swift:1};s.activeResourceEffects=[effect('haste',6,1)];
 ongoing.accrueRoundCosts(s,{root,combat:true});ongoing.accrueRoundCosts(s,{root,combat:true});
 assert.equal(s.activeResourceEffects[0].accruedCost.amount,1);
 s.activeResourceEffects.push(effect('slow',7,2,false));root.round=2;ongoing.accrueRoundCosts(s,{root,combat:true});
 root.round=3;ongoing.accrueRoundCosts(s,{root,combat:true});assert.equal(s.activeResourceEffects[0].accruedCost.amount,1);
 let saved=JSON.parse(JSON.stringify(s));saved.activeResourceEffects.pop();ongoing.accrueRoundCosts(saved,{root,combat:true});
 assert.equal(saved.activeResourceEffects[0].accruedCost.amount,2);
 ongoing.accrueRoundCosts(saved,{root,combat:true});assert.equal(saved.activeResourceEffects[0].accruedCost.amount,2);
 assert.equal(saved.health.A,0);
 expireResourceEffects(saved,{scene:true});assert.equal(saved.health.A,2);
 expireResourceEffects(saved,{scene:true});assert.equal(saved.health.A,2);
});
test('ending one covered instance settles only its stored unavoidable debt and preserves active winner',()=>{
 const {root,s}=fixture();s.activeResourceEffects=[effect('haste',6,1)];ongoing.accrueRoundCosts(s,{root,combat:true});
 s.activeResourceEffects.push(effect('slow',7,2,false));s.health.temp=10;
 const instances=timedResourceInstances(root,'player');assert.equal(instances.length,2);
 endTimedResource(root,'player',instances.find(x=>x.components.some(c=>c.key==='0')));
 assert.equal(s.health.A,1);assert.equal(s.health.temp,10);assert.equal(s.activeResourceEffects.length,1);assert.equal(s.activeResourceEffects[0].id,'slow');
});
