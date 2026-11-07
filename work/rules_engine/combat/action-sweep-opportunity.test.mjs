import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningEncounter} from './opening.mjs';
import {beginTurn} from '../core.mjs';
import {beginCommonTurn} from './common-actions.mjs';
import {resolveStep} from './transitions.mjs';
import {combatActionReport} from './presentation.mjs';

function reaction(choice) {
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]},teams:{player:'玩家',huang:'对手'}});
 b.activeId='huang';b.order=['huang','player'];b.reactionWindows=true;b.playerDefenseDeclarations=true;
 b.actors.huang.combatProfile.hpFixed=100;b.actors.huang.state.derived.hpMax=100;b.actors.huang.state.health.intact=100;
 b.actors.huang.state=beginTurn(b.actors.huang.state).state;beginCommonTurn(b,b.actors.huang);
 const drawDice=()=>Array(1024).fill(8);
 const pending=resolveStep(b,{actorId:'huang',abilityId:'move',to:[4,0]},{drawDice});
 assert.equal(pending.battle.pending.kind,'opportunity');
 const command={actorId:'player',abilityId:'opportunityReact',choice};
 const out=resolveStep(pending.battle,command,{drawDice,playerAuthorized:true});
 const root={battle:out.battle,actors:out.battle.actors,revision:1,operations:{test:{signature:JSON.stringify(command),summary:{revision:1,result:out.result}}}};
 return {out,root,report:combatActionReport(root)};
}

test('resolved opportunity attack is reported once before the visible movement',()=>{
 const {out,report}=reaction('strike');
 assert.equal(out.result.opportunities.length,1);
 assert.ok(out.result.opportunities[0].damage.some(x=>x.actualDamage>0));
 assert.equal(out.battle.actors.player.state.turn.opportunityUsed,true);
 assert.equal((report.match(/借机攻击/g)??[]).length,1);
 assert.ok(report.indexOf('借机攻击')<report.indexOf('可见移动'),report);
 assert.doesNotMatch(report,/意志×|骰池|rawDP/);
});

test('declining opportunity does not invent an attack',()=>{
 const {out,report}=reaction('decline');
 assert.equal(out.result.opportunities?.length??0,0);
 assert.doesNotMatch(report,/借机攻击/);
 assert.match(report,/可见移动/);
});

test('an unseen mover is not disclosed by its nested opportunity',()=>{
 const {root}=reaction('strike');
 root.operations.test.summary.result.after.visibleTo.player=['player'];
 const report=combatActionReport(root);
 assert.doesNotMatch(report,/黄泉|借机攻击|骰池|rawDP/);
});
