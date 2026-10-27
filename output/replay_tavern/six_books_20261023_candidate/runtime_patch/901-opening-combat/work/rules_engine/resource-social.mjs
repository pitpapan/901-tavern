import {resourceCapability} from './resource-lifecycle.mjs';
// These are constraints on sourced social facts, never orders to stop fighting
// or a replacement for the character's own decisions.
export function socialResourceContext(state,{attitude,source}={}){
 const calm=resourceCapability(state,'emotionCalming'),override=resourceCapability(state,'attitudeOverride');
 const known=!!source&&typeof attitude==='string';
 return {strongEmotionsSuppressed:!!calm,canChooseCombat:true,
  attitude:known?(override&&attitude===override.from?override.to:attitude):null,
  ...(calm?{emotionSource:calm.source}:{}),...(override?{conditionalAttitude:{from:override.from,to:override.to,source:override.source,remainingRounds:override.remainingRounds}}:{}),
  ...(!known?{needsAttitudeFact:true}:{})};
}
