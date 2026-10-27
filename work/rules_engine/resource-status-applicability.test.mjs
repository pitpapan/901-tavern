import test from 'node:test';
import assert from 'node:assert/strict';
import {effectiveStatuses} from './resource-status-applicability.mjs';
import {createOpeningRoster} from './combat/opening.mjs';
import {statusLevel} from './core.mjs';
test('only the matching acquired grade is suppressed; stored points and permanent consequences remain',()=>{
 const s=createOpeningRoster().huang.state;
 s.statuses=[{type:'目眩',source:'low',points:7,applicability:{families:['mind'],grade:'C'}},
  {type:'目眩',source:'high',points:3,applicability:{families:['mind'],grade:'B'}}];
 s.permanentConditions=[{kind:'blind',source:'actual-prior-consequence'}];
 s.resourceCapabilities={ward:{id:'mindImmunity',level:2,source:'actual-ward'}};
 assert.deepEqual(effectiveStatuses(s,'目眩').map(x=>x.source),['high']);
 assert.equal(statusLevel(s,'目眩').points,3);assert.equal(statusLevel(s,'目眩').permanent,true);
 assert.equal(s.statuses[0].points,7);
 s.resourceCapabilities.ward.suspended=true;
 assert.equal(statusLevel(s,'目眩').points,7);assert.equal(s.permanentConditions.length,1);
});
test('an unrelated status query needs no missing immunity grade and old untyped records are not inferred',()=>{
 const s={statuses:[{type:'恐惧',source:'new',points:4,applicability:{families:['mind'],grade:'C'}},
  {type:'疲乏',source:'legacy',points:2}],resourceCapabilities:{old:{id:'mindImmunity',source:'legacy'}}};
 assert.equal(effectiveStatuses(s,'疲乏')[0],s.statuses[1]);
 assert.throws(()=>effectiveStatuses(s,'恐惧'),{code:'NEEDS_INPUT'});
});
