// Small shared-schema consumer. It validates declared fields, never evaluates a formula.
export function assertSchema(value,spec,path,{code='INVALID_OPERATION_INPUT'}={}){
 const fail=message=>{const e=new Error(`${path}: ${message}`);e.code=code;e.path=path;throw e;};
 if(spec.anyOf){for(const choice of spec.anyOf){try{assertSchema(value,choice,path,{code});return;}catch(e){if(e.code!==code)throw e;}}fail('no supported value shape');}
 if(spec.expression&&value&&typeof value==='object'&&!Array.isArray(value)){
  if(['context','state','choice'].some(k=>typeof value[k]==='string')||typeof value.op==='string')return;
  fail('expected literal or value expression');
 }
 if(spec.type==='condition'){
  if(typeof value==='boolean'||value===null||value&&typeof value==='object'&&!Array.isArray(value))return;
  fail('condition required');
 }
 if(spec.type==='array'){
  if(!Array.isArray(value))fail('array required');
  value.forEach((v,i)=>assertSchema(v,spec.items,`${path}[${i}]`,{code}));return;
 }
 if(spec.type==='object'){
  if(!value||typeof value!=='object'||Array.isArray(value))fail('object required');
  for(const key of spec.required??[])if(!Object.hasOwn(value,key))assertSchema(undefined,{type:'required'},path+'.'+key,{code});
  for(const [key,v]of Object.entries(value)){
   const child=spec.fields?.[key];
   if(child)assertSchema(v,child,path+'.'+key,{code});
   else if(!spec.additional){const e=new Error(`${path}.${key}: unsupported field`);e.code=code;e.path=path+'.'+key;throw e;}
  }return;
 }
 if(spec.type==='number'||spec.type==='integer'){
  if(!Number.isFinite(value)||spec.type==='integer'&&!Number.isInteger(value))fail(spec.type+' required');
  if(spec.minimum!==undefined&&value<spec.minimum||spec.exclusiveMinimum!==undefined&&value<=spec.exclusiveMinimum)fail('outside numeric bounds');
 }else if(typeof value!==spec.type)fail(spec.type+' required');
 if(spec.minLength&&value.length<spec.minLength)fail('nonempty value required');
 if(spec.enum&&!spec.enum.includes(value))fail('unsupported enum value');
}
