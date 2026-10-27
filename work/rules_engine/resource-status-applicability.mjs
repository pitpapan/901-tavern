// Query effective points without deleting their timed source or inventing points.
// Old records without applicability retain their established behavior.
import {evaluateApplicability,collectImmunities} from './resource-applicability.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
// Q20: mechanical archetype only; the original type/source and immunities remain intact.
export const STATUS_ARCHETYPES={仇恨:'亢奋'};
export function effectiveStatuses(state,type){
 const rows=(state.statuses??[]).filter(s=>(type===undefined||s.type===type||STATUS_ARCHETYPES[s.type]===type)&&!s.suspended&&s.remainingRounds!==0&&s.remainingMinutes!==0);
 let immunities;
 return rows.filter(s=>{
  if(!s.applicability)return true;
  const result=evaluateApplicability(s.applicability,immunities??=collectImmunities(state,RESOURCE_DEFINITIONS));
  if(result.status==='partial')throw Error('状态点数尚未接入部分免疫策略');
  return result.status!=='blocked';
 });
}
