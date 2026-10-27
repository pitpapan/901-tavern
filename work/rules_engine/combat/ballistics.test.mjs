import test from 'node:test';
import assert from 'node:assert/strict';
import {integrateBallistic} from './ballistics.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`),map={features:[]};
test('ballistics conserves horizontal velocity and uses actual seconds until first ground contact',()=>{
 const first=integrateBallistic({position:[0,0,20],velocity:[10,2,0]},1,map);
 assert.deepEqual(first.position,[10,2,15.1]);near(first.velocity[2],-9.8);assert.equal(first.contacts.length,0);
 const end=integrateBallistic(first,2,map),t=Math.sqrt(40/9.8);
 near(end.position[0],10*t);near(end.position[1],2*t);near(end.position[2],0);
 assert.equal(end.grounded,true);assert.equal(end.contacts.length,1);near(end.contacts[0].equivalentHeight,20);
});
test('wall contact removes only normal velocity, retains tangent motion and continues falling',()=>{
 const wall={id:'wall',kind:'obstacle',rect:[5,-5,1,10],height:30};
 const end=integrateBallistic({position:[0,0,20],velocity:[10,2,0]},1,{features:[wall]});
 near(end.position[0],5);near(end.position[1],2);near(end.position[2],15.1);
 near(end.velocity[0],0);near(end.velocity[1],2);near(end.velocity[2],-9.8);
 assert.equal(end.contacts.length,1);near(end.contacts[0].equivalentHeight,100/19.6);assert.equal(end.contacts[0].featureId,'wall');
 const opened=integrateBallistic({position:[0,0,20],velocity:[10,2,0]},1,{features:[{...wall,kind:'door',open:true}]});
 assert.equal(opened.position[0],10);assert.equal(opened.contacts.length,0);
});
test('roof, raised terrain and ramps use actual surface heights rather than a universal zero floor',()=>{
 for(const feature of [{id:'roof',kind:'obstacle',rect:[-5,-5,10,10],height:5},
  {id:'platform',kind:'zone',points:[[-5,-5],[5,-5],[5,5],[-5,5]],elevation:5},
  {id:'ramp',kind:'zone',rect:[-5,-5,10,10],ramp:{from:[-5,0,0],to:[5,0,10]}}]){
  const end=integrateBallistic({position:[0,0,10],velocity:[0,0,0]},2,{features:[feature]});
  near(end.position[2],5);assert.equal(end.grounded,true);
 }
});
test('split elapsed time and JSON reload preserve the same trajectory and do not replay wall impacts',()=>{
 const m={features:[{id:'wall',kind:'obstacle',rect:[5,-5,1,10],height:30}]},start={position:[0,0,20],velocity:[10,2,0]};
 const one=integrateBallistic(start,1,m),first=integrateBallistic(start,.6,m),last=integrateBallistic(JSON.parse(JSON.stringify(first)),.4,m);
 one.position.forEach((x,i)=>near(x,last.position[i]));assert.equal(first.contacts.length,1);assert.equal(last.contacts.length,0);
});

test('curved movement crosses a response sphere by the actual parabola, including a vertical leave and reentry',async()=>{
 const {ballisticSphereCrossings}=await import('./ballistics.mjs');
 const body={position:[0,0,0],velocity:[0,0,9.8],gravity:9.8};
 const hits=ballisticSphereCrossings(body,2,[0,0,0],2);
 assert.equal(hits.length,2);
 for(const hit of hits)assert.ok(Math.abs(hit.point[2]-2)<1e-7);
 assert.ok(hits[0].seconds<1&&hits[1].seconds>1);
});
