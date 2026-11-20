// One roll can be used by an opposed check, threshold or point cancellation.
// This module never rolls or writes state, so consuming it cannot resist twice.
const number=(x,name)=>{if(!Number.isFinite(x)||x<0)throw Error('抵抗缺少实际非负数值：'+name);return x;};
export function resolveResistance(spec,roll){
 if(roll?.eligible===false)throw Error('抵抗检定不具备实际资格');
 const total=number(roll?.total,'successes');
 switch(spec.kind){
  case 'roll':return {kind:'roll',total};
  case 'opposed':{
   const active=number(spec.active,'active');return {kind:'opposed',activeTotal:active,passiveTotal:total,success:active>=total,margin:Math.max(0,active-total)};
  }
  case 'subtract':{
   const incoming=number(spec.incoming,'incoming'),rate=number(spec.perSuccess,'明确抵消率');
   return {kind:'subtract',incoming,successes:total,perSuccess:rate,remaining:Math.max(0,incoming-total*rate)};
  }
  case 'threshold':{const dc=number(spec.dc,'dc');return {kind:'threshold',total,dc,success:total>=dc};}
  default:throw Error('未支持的抵抗结算方式：'+spec.kind);
 }
}
