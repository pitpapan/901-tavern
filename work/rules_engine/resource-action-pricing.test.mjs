import test from 'node:test';
import assert from 'node:assert/strict';
import {spendAPAction,beginTurn} from './core.mjs';
import {createOpeningRoster} from './combat/opening.mjs';
import {actionPriceOffers,quoteActionPrice,consumeActionPrice} from './resource-action-pricing.mjs';
function fixture(){const s=beginTurn(createOpeningRoster().player.state).state;s.activeResourceEffects=[{id:'haste/caster',sourceId:'haste',scene:true,effects:[],actionPrice:{family:'physical',discount:2,baseByAction:{weaponAttack:5,move:4},minimumAP:1,perRound:1,quotaKey:'haste'}}];return s;}
test('AP conversion uses the adopted inclusive ranges and atomically pays multi-action prices',()=>{
 for(const [ap,actions] of [[1,['swift']],[3,['move']],[5,['standard']],[7,['standard','swift']],[9,['standard','move']],[11,['standard','move','swift']]]){
  const s=fixture(),out=spendAPAction(s,ap);assert.equal(out.result.allowed,true);assert.deepEqual(out.result.actions,actions);
 }
 const s=fixture();s.turn.move=0;const before=structuredClone(s),out=spendAPAction(s,10);
 assert.equal(out.result.allowed,false);assert.deepEqual(out.state,before);assert.deepEqual(s,before);
});
test('price preview is read-only and per-round usage survives reload and source refresh',()=>{
 let s=fixture();const request={action:'weaponAttack',family:'physical',roundKey:'combat/x/1',sourceId:'haste/caster'};
 const before=structuredClone(s),q=quoteActionPrice(s,request);
 assert.equal(q.baseAP,5);assert.equal(q.ap,3);assert.deepEqual(s,before);
 consumeActionPrice(s,q);s=JSON.parse(JSON.stringify(s));s.activeResourceEffects[0].remainingRounds=10;
 assert.deepEqual(actionPriceOffers(s,request),[]);assert.throws(()=>quoteActionPrice(s,request),/额度/);
 assert.equal(quoteActionPrice(s,{...request,roundKey:'combat/x/2',action:'move'}).ap,2);
 assert.deepEqual(actionPriceOffers(s,{...request,roundKey:'combat/x/2',family:'casting'}),[]);
 assert.deepEqual(actionPriceOffers(s,{...request,roundKey:'combat/x/2',action:'unknown-physical'}),[]);
});
test('mandatory surcharge applies with no selected offer and consumes first-action quota only on payment',()=>{
 const s=fixture();s.activeResourceEffects[0].actionPrice={family:'physical',surcharge:2,baseByAction:{weaponAttack:5,move:4},minimumAP:1,perRound:1,quotaKey:'slow'};
 const request={action:'weaponAttack',family:'physical',roundKey:'combat/x/1'},before=structuredClone(s);
 const q=quoteActionPrice(s,request);assert.equal(q.ap,7);assert.equal(q.mandatory,true);assert.deepEqual(s,before);
 const failed=spendAPAction({...s,turn:{...s.turn,swift:0,move:0}},q.ap);assert.equal(failed.result.allowed,false);assert.deepEqual(s,before);
 consumeActionPrice(s,q);assert.equal(quoteActionPrice(s,request),null);
});
test('selected discount and mandatory surcharge are combined from actual sources without hiding the latter',()=>{
 const s=fixture();s.activeResourceEffects.push({id:'slow',sourceId:'slow',effects:[],actionPrice:{family:'physical',surcharge:2,baseByAction:{weaponAttack:5,move:4},minimumAP:1,perRound:1,quotaKey:'slow'}});
 const q=quoteActionPrice(s,{action:'weaponAttack',family:'physical',roundKey:'combat/x/1',sourceId:'haste/caster'});
 assert.equal(q.ap,5);consumeActionPrice(s,q);assert.equal(s.resourceActionUsage.haste.used,1);assert.equal(s.resourceActionUsage.slow.used,1);
});
test('an earlier selected mode does not offer its discount while the higher power mode is active',()=>{
 const s=fixture();s.activeResourceEffects[0].selection={group:'time',power:6,order:1};
 s.activeResourceEffects.push({id:'slow',sourceId:'time',effects:[],selection:{group:'time',power:7,order:2},actionPrice:{family:'physical',surcharge:2,baseByAction:{weaponAttack:5,move:4},minimumAP:1,perRound:1,quotaKey:'time'}});
 const req={action:'weaponAttack',family:'physical',roundKey:'combat/x/1'};
 assert.deepEqual(actionPriceOffers(s,req),[]);assert.equal(quoteActionPrice(s,req).ap,7);
 s.activeResourceEffects.pop();assert.equal(actionPriceOffers(s,req)[0].ap,3);
});
test('Q28 uses actual slot upper bounds when raw AP is absent or conflicts, preserving explicit compatible prices',()=>{
 const s=fixture(),r={family:'physical',roundKey:'combat/x/1',sourceId:'haste/caster'};
 assert.equal(quoteActionPrice(s,{...r,action:'door',kind:'move'}).ap,2);
 assert.equal(quoteActionPrice(s,{...r,action:'aim',kind:'standard'}).baseAP,6);
 assert.equal(quoteActionPrice(s,{...r,action:'firstAid',kind:'full'}).baseAP,10);
 assert.equal(quoteActionPrice(s,{...r,action:'roar',kind:['full','swift']}).baseAP,12);
 assert.equal(quoteActionPrice(s,{...r,action:'weaponAttack',kind:'attack'}).baseAP,5);
 s.activeResourceEffects[0].actionPrice.baseByAction.aim=4;
 assert.equal(quoteActionPrice(s,{...r,action:'aim',kind:'standard'}).baseAP,6);
});
test('Q29 free and opportunity actions neither acquire a price nor consume any source quota',()=>{
 const s=fixture();s.activeResourceEffects.push({id:'slow',sourceId:'slow',effects:[],actionPrice:{family:'physical',surcharge:2,baseByAction:{weaponAttack:5},minimumAP:1,perRound:1,quotaKey:'slow'}});
 const before=structuredClone(s),r={action:'weaponAttack',family:'physical',roundKey:'combat/x/1',sourceId:'haste/caster'};
 for(const kind of ['free','opportunity']){assert.equal(quoteActionPrice(s,{...r,kind}),null);assert.deepEqual(actionPriceOffers(s,{...r,kind}),[]);}
 assert.deepEqual(s,before);assert.equal(quoteActionPrice(s,{...r,kind:'attack'}).ap,5);
});
