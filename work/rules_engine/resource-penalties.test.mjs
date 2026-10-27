import test from 'node:test';import assert from 'node:assert/strict';
import {environmentModifierTotal,remainingPenalty} from './resource-penalties.mjs';
test('environment ignore is one typed budget, never refunds a non-environment penalty or turns it into a bonus',()=>{
 const s={activeResourceEffects:[{sourceId:'actual-resource',effects:[{stat:'environmentPenaltyIgnore',value:6,group:'suppression'}]}]};
 const rows=[{category:'environment',value:-4},{category:'environment',value:-5},{category:'resource',value:-3},{category:'environment',value:2}];
 assert.equal(environmentModifierTotal(s,rows),-4);assert.equal(rows[0].value,-4);
 assert.equal(remainingPenalty(s,'environment',2),0);
});
