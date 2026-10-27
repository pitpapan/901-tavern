// The offline compiler consumes this exported grammar through the engine ABI.
// Context/state references still need real runtime values; this is not a full
// state schema or a proof that every effect has a consumer.
export const EXPRESSION_OPERATORS={
 add:{minimum:0,maximum:null,result:'number'},mul:{minimum:0,maximum:null,result:'number'},
 sub:{minimum:2,maximum:2,result:'number'},div:{minimum:2,maximum:2,result:'number'},
 min:{minimum:1,maximum:null,result:'number'},max:{minimum:1,maximum:null,result:'number'},
 floor:{minimum:1,maximum:1,result:'number'}
};
export const CONDITION_TESTS={
 eq:{required:['left','right']},ne:{required:['left','right']},
 gte:{required:['left','right'],numeric:true},lte:{required:['left','right'],numeric:true},
 in:{required:['left','values']},contains:{required:['left','right']},present:{required:['left']}
};
export function requireExpressionArity(value){
 const spec=EXPRESSION_OPERATORS[value.op],length=value.args?.length;
 if(!spec||!Array.isArray(value.args)||length<spec.minimum||spec.maximum!==null&&length>spec.maximum){
  const error=new Error('效果公式运算或参数数量无效：'+value.op);error.code='INVALID_RULE_EXPRESSION';throw error;
 }
 return spec;
}
