import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
// Trusted definitions bind ordinary commands. No ownership is granted and no
// classifier-supplied formula, step, or patch enters this registry.
export const BASIC_ACTIONS=Object.fromEntries(Object.entries(RESOURCE_DEFINITIONS)
 .filter(([,d])=>d.access==='common').flatMap(([resourceId,d])=>Object.entries(d.basicActions??{}).map(([command,binding])=>[command,{...binding,resourceId}])));
