import test from 'node:test';
import assert from 'node:assert/strict';
import {PROGRAM_CAPABILITIES,PROGRAM_ABI,assertProgramABI,requireProgramOperator} from './program-operators.mjs';
test('the deployed resource package must agree with the executing supported policies before any action',()=>{
 assert.doesNotThrow(()=>assertProgramABI(PROGRAM_ABI));
 const old=JSON.parse(PROGRAM_ABI);delete old.operators.effect;
 assert.throws(()=>assertProgramABI(JSON.stringify(old)),{code:'RULE_VERSION_MISMATCH'});
 assert.throws(()=>requireProgramOperator('model-provided-script'),{code:'UNSUPPORTED_OPERATION'});
 assert.equal(PROGRAM_CAPABILITIES.operators.status.lifecycles.includes('suppress-existing'),true);
 assert.equal(PROGRAM_CAPABILITIES.operators.status.lifecycles.includes('suppress'),false);
});

test('operation inputs reject ignored flags and invalid healing prices before execution',async()=>{
 const {assertOperationInput}=await import('./program-operators.mjs');
 assert.throws(()=>assertOperationInput({op:'effect',effects:[{stat:'defense',value:2}],scene:'true'}),e=>e.code==='INVALID_OPERATION_INPUT'&&e.path.endsWith('.scene'));
 assert.throws(()=>assertOperationInput({op:'heal',amount:3,ratios:{L:true}}),e=>e.code==='INVALID_OPERATION_INPUT'&&e.path.endsWith('.ratios.L'));
 assert.doesNotThrow(()=>assertOperationInput({op:'heal',amount:{context:'P'},ratios:{L:1,A:4}}));
});
test('save output distinguishes a numeric margin from success and rejects fabricated receipt shapes',async()=>{
 const {assertOperationOutput}=await import('./program-operators.mjs');
 assert.doesNotThrow(()=>assertOperationOutput('save',{kind:'opposed',activeTotal:3,passiveTotal:3,success:true,margin:0},'opposed'));
 assert.throws(()=>assertOperationOutput('save',{kind:'opposed',activeTotal:3,passiveTotal:3,success:0,margin:0},'opposed'),e=>e.code==='INVALID_OPERATION_OUTPUT');
});
test('an unregistered effect cannot silently become an executable modifier',async()=>{
 const {assertOperationInput}=await import('./program-operators.mjs');
 assert.throws(()=>assertOperationInput({op:'effect',effects:[{stat:'imaginaryDefense',value:5}]}),e=>e.code==='CONSUMER_MISSING');
});

test('damage, event and item inputs reject ignored rule fields and wrong scopes',async()=>{
 const {assertOperationInput,assertProgramInputs}=await import('./program-operators.mjs');
 for(const step of [{op:'damage',amount:true},{op:'damage',amount:2,severity:'fatal'},
  {op:'counter',path:'will.current',amount:-1,maximunPath:'will.max'},
  {op:'trigger',event:'unwiredEvent',steps:[]},
  {op:'capability',id:'flight',movement:{mode:'flight',speed:20,maneuverability:'perfect',unlimited:true}},
  {op:'poolRestore',amount:2,daily:{basis:'current',maximum:4,key:'daily',source:'adopted',reset:true}}])
  assert.throws(()=>assertOperationInput(step),e=>e.code==='INVALID_OPERATION_INPUT');
 assert.throws(()=>assertOperationInput({op:'weaponEffect',effects:[{stat:'defense',value:3}]}),e=>e.code==='CONSUMER_MISSING');
 assert.throws(()=>assertOperationInput({op:'aura',radius:5,effects:[{stat:'imaginaryDefense',value:3}]}),e=>e.code==='CONSUMER_MISSING');
 assert.throws(()=>assertProgramInputs({steps:[{op:'trigger',event:'turnStart',steps:[{op:'damage',amount:2,ignoreArmor:true}]}]}),e=>e.code==='INVALID_OPERATION_INPUT');
 assert.doesNotThrow(()=>assertOperationInput({op:'weaponEffect',effects:[{stat:'weaponDamage',value:{context:'P'}}],scene:true}));
});
test('damage and counter receipts cannot publish boolean or non-finite amounts',async()=>{
 const {assertOperationOutput}=await import('./program-operators.mjs');
 assert.doesNotThrow(()=>assertOperationOutput('damage',{op:'damage',actualDamage:2}));
 assert.throws(()=>assertOperationOutput('damage',{op:'damage',actualDamage:true}),e=>e.code==='INVALID_OPERATION_OUTPUT');
 assert.throws(()=>assertOperationOutput('counter',{op:'counter',path:'will.current',before:3,after:NaN,changed:-1}),e=>e.code==='INVALID_OPERATION_OUTPUT');
});
test('additional damage declarations require their event scope and cannot hide health writes before C',async()=>{
 const {assertProgramInputs}=await import('./program-operators.mjs'),extra={op:'additionalDamage',amount:4,mode:'same-type'};
 assert.throws(()=>assertProgramInputs({steps:[extra]}),/事件作用域/);
 assert.throws(()=>assertProgramInputs({steps:[{op:'trigger',event:'turnStart',steps:[extra]}]}),/事件作用域/);
 assert.throws(()=>assertProgramInputs({steps:[{op:'trigger',event:'attackDamageCaused',steps:[{op:'damage',amount:4}]}]}),/不允许状态写入/);
 assert.doesNotThrow(()=>assertProgramInputs({steps:[{op:'trigger',event:'attackDamageCaused',steps:[extra]}]}));
});
