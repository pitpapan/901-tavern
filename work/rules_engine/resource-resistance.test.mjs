import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveResistance} from './resource-resistance.mjs';
const roll=total=>({eligible:true,total});
test('ordinary opposed ties succeed with zero margin; failed eligibility never wins',()=>{
 const tie=resolveResistance({kind:'opposed',active:3},roll(3));assert.equal(tie.success,true);assert.equal(tie.margin,0);
 const win=resolveResistance({kind:'opposed',active:5},roll(3));assert.equal(win.margin,2);
 assert.equal(resolveResistance({kind:'opposed',active:3},roll(5)).success,false);
 assert.throws(()=>resolveResistance({kind:'opposed',active:3},{eligible:false,total:0}),/资格/);
});
test('subtraction and threshold saves have separate result contracts',()=>{
 assert.equal(resolveResistance({kind:'subtract',incoming:9,perSuccess:1},roll(3)).remaining,6);
 assert.equal(resolveResistance({kind:'subtract',incoming:2,perSuccess:1},roll(3)).remaining,0);
 assert.equal(resolveResistance({kind:'threshold',dc:3},roll(3)).success,true);
 assert.equal(resolveResistance({kind:'threshold',dc:3},roll(2)).success,false);
 assert.throws(()=>resolveResistance({kind:'subtract',incoming:3},roll(2)),/抵消率/);
});
