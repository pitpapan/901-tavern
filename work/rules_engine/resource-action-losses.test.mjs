import test from 'node:test';
import assert from 'node:assert/strict';
import {beginTurn,endTurn,spendAction} from './core.mjs';
import {createOpeningRoster} from './combat/opening.mjs';
import {loseResourceAction} from './resource-action-losses.mjs';
const source={sourceId:'actual-effect',casterId:'caster',grade:'C',version:'saved'};
test('action loss consumes the current move or exactly the next active turn move, never the standard',()=>{
 let s=beginTurn(endTurn(createOpeningRoster().player.state).state).state;
 assert.equal(loseResourceAction(s,'move',source).timing,'current');
 assert.equal(s.turn.move,0);assert.equal(s.turn.standard,1);
 const conversion=spendAction(s,'move');assert.equal(conversion.result.allowed,true);assert.equal(conversion.state.turn.standard,0);
 assert.equal(loseResourceAction(s,'move',source).timing,'next');
 s=beginTurn(endTurn(JSON.parse(JSON.stringify(s))).state).state;
 assert.equal(s.turn.move,0);assert.equal(s.turn.standard,1);assert.equal(s.resourceActionLosses,undefined);
 s=beginTurn(endTurn(s).state).state;assert.equal(s.turn.move,1);
});
