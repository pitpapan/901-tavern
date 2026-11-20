// Derive sensory metadata only from actual sources. Never persist grants into
// character templates or guess a missing vague range from a sensitive range.
import {effectiveAttribute,attrAuto} from './core.mjs';
import {resourceCapabilityRows} from './resource-lifecycle.mjs';
import {effectGrade} from './resource-applicability.mjs';
export function actualSenses(actor,target){
 const normal={source:actor.spiritSight&&target?.spirit?'actual-spirit-sight':'ordinary-vision',grade:'none',visual:true,channel:'visual',sensitiveRange:actor.state.absentAttributes?.includes('感知')?undefined:10*effectiveAttribute(actor.state,'感知')+20*attrAuto(actor.state,'感知')};
 const senses={...structuredClone(actor.senseSources??{}),...(!(actor.windSense&&actor.visionAvailable!==true)?{vision:{...normal,...structuredClone(actor.senseSources?.vision??{})}}:{})};
 if(actor.windSense&&!senses.windSense)senses.windSense={source:'actual-wind-sense'};
 if(actor.windSense&&actor.visionAvailable!==true)delete senses.vision;
 const augmentations=[...new Set(Object.values(actor.state.resourceCapabilities??{}).filter(c=>c.sensory).map(c=>c.id))].flatMap(id=>resourceCapabilityRows(actor.state,id)).filter(c=>c.sensory);
 const ranges=Object.values(senses),maximum=key=>{const values=ranges.map(s=>s[key]).filter(Number.isFinite);return values.length?Math.max(...values):undefined;};
 for(const cap of augmentations){
  if(cap.sensory.enhanceExisting)for(const sense of ranges){if(effectGrade(sense).level!==null)sense.grade=Math.max(effectGrade(sense).level,cap.level);}
  const rank=effectGrade({grade:cap.grade}).level;
  for(const grant of cap.sensory.grants){
   if(rank<grant.minimumGrade)continue;
   const source='resource-sense/'+cap.instanceId+'/'+grant.id,range=maximum(grant.rangeBasis==='vague'?'vagueRange':'sensitiveRange');
   senses[source]={source,grade:cap.level,visual:false,channel:'nonvisual',sensitiveRange:grant.rangeBasis==='sensitive'?range:0,vagueRange:range,automaticDetection:grant.automaticDetection,maximumPrecision:grant.maximumPrecision,lineOfEffect:grant.lineOfEffect,visualIllusionImmunity:grant.visualIllusionImmunity};
  }
 }
 return senses;
}
