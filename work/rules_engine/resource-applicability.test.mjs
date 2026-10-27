import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateApplicability,collectImmunities} from './resource-applicability.mjs';
const shield=(family,level,extra={})=>({id:family+'Immunity',level,source:'实际取得的免疫',...extra});
test('graded immunity compares the direct effect grade including its offset, never power or character grade',()=>{
 const effect={families:['mind'],grade:'D',gradeBonus:1};
 assert.equal(evaluateApplicability(effect,[shield('mind',1)]).status,'applicable');
 assert.equal(evaluateApplicability(effect,[shield('mind',2)]).status,'blocked');
 assert.equal(evaluateApplicability({...effect,grade:'C',power:99},[shield('mind',2)]).status,'applicable');
 assert.equal(evaluateApplicability({...effect,grade:'S',maximumGrade:'S'},[shield('mind',5)]).status,'blocked');
});
test('strict below, inclusive up-to and ungraded immunity are distinct policies',()=>{
 const effect={families:['mind'],grade:'C'};
 assert.equal(evaluateApplicability(effect,[shield('mind',2,{comparison:{mode:'up-to',maximumGrade:'C',inclusive:false}})]).status,'applicable');
 assert.equal(evaluateApplicability(effect,[shield('mind',2,{comparison:{mode:'up-to',maximumGrade:'C',inclusive:true}})]).status,'blocked');
 assert.equal(evaluateApplicability({families:['mind']},[shield('mind',null,{comparison:{mode:'ungraded'}})]).status,'blocked');
 assert.equal(evaluateApplicability({families:['curse']},[shield('mind',2)]).status,'applicable');
 assert.throws(()=>evaluateApplicability({families:['mind']},[shield('mind',2)]),e=>e.code==='NEEDS_INPUT');
});
test('multi-family partial effects require their explicit policy and retain source traces',()=>{
 const effect={families:['transformation','curse'],grade:'C',mode:'fraction-unblocked'};
 const one=evaluateApplicability(effect,[shield('curse',2)]);
 assert.equal(one.status,'partial');assert.equal(one.factor,.5);assert.equal(one.matches[0].source,'实际取得的免疫');
 assert.equal(evaluateApplicability(effect,[shield('curse',2),shield('transformation',2)]).factor,0);
 assert.equal(evaluateApplicability({...effect,mode:'any-blocks'},[shield('curse',2)]).status,'blocked');
 assert.throws(()=>evaluateApplicability({...effect,mode:'invented'},[]),/策略/);
});
test('only actual, active immunity sources participate; acquired fixed levels do not scale with later grades',()=>{
 const definitions={old:{capabilities:[shield('mind',2)]},future:{capabilities:[shield('mind',5)]}};
 const state={learnedResources:{old:{learned:true,grade:'S'}},resourceCapabilities:{expired:{...shield('mind',4),remainingRounds:0},suspended:{...shield('mind',4),suspended:true},active:shield('curse',1)}};
 const rows=collectImmunities(state,definitions);
 assert.equal(rows.length,2);assert.equal(evaluateApplicability({families:['mind'],grade:'B'},rows).status,'applicable');
 assert.equal(state.learnedResources.future,undefined);
});
