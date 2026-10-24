import {collectEffects,stackEffects} from './resource-effects.mjs';
import {RESOURCE_DATA} from './resource-data.mjs';
export const RESOURCE_DEFINITIONS=RESOURCE_DATA;
export const resourceEffects=(s,stat,context={})=>collectEffects(s,RESOURCE_DEFINITIONS,stat,context);
export const resourceBonus=(s,stat,context={},baseline={})=>stackEffects(resourceEffects(s,stat,context),baseline).value;
export function observationContext(s,targetId,visible=true){const o=s.chengxin?.observations?.[targetId];return {observed:o?.valid===true&&s.chengxin?.targetId===targetId,successfullyObserved:o?.valid===true,targetVisible:visible};}
