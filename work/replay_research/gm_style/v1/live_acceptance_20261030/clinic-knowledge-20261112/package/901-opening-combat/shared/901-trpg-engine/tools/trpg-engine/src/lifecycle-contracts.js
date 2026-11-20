import {ok,fail,shape,identifier,natural,sourceRefs,isJsonValue} from './contracts.js';
import {validateGeneState} from './gene-contracts.js';
export const validBoundary=b=>shape(b,['id','worldMinutes'])&&identifier(b.id)&&natural(b.worldMinutes);
export const validRecoveryClaim=c=>shape(c,['id','actorId','kind','fromBoundaryRef','toBoundaryRef','completed','sourceRefs'])&&identifier(c.id)&&identifier(c.actorId)&&['short_rest','long_rest','natural_L','natural_A'].includes(c.kind)&&validBoundary(c.fromBoundaryRef)&&validBoundary(c.toBoundaryRef)&&c.toBoundaryRef.worldMinutes>=c.fromBoundaryRef.worldMinutes&&typeof c.completed==='boolean'&&sourceRefs(c.sourceRefs);
export function validateLifecycleState(state,{ruleset}={}){
 if(!isJsonValue(state)||state.schemaVersion!=='runtime/0.4'||!shape(state.lifecycle,['processedConsequenceIds','recoveryClaims'])||!Array.isArray(state.lifecycle.processedConsequenceIds)||!state.lifecycle.processedConsequenceIds.every(identifier)||new Set(state.lifecycle.processedConsequenceIds).size!==state.lifecycle.processedConsequenceIds.length||!Array.isArray(state.lifecycle.recoveryClaims)||!state.lifecycle.recoveryClaims.every(c=>validRecoveryClaim(c)&&Object.hasOwn(state.actors,c.actorId))||new Set(state.lifecycle.recoveryClaims.map(c=>c.id)).size!==state.lifecycle.recoveryClaims.length)return fail('INVALID_STATE','/lifecycle','runtime0.4生命周期账目非法');
 const base=structuredClone(state);delete base.lifecycle;base.schemaVersion='runtime/0.3';const r=validateGeneState(base,{ruleset});return r.ok?ok(structuredClone(state)):r;
}
