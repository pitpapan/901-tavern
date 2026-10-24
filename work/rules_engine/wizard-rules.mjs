// 人物卡资料集_检索版.md:1016–1079. No ownership is inferred.
export const WIZARD_FORMS={
 fire:{attributes:{力量:2,敏捷:2},skills:['白刃','肉搏','枪械','弓箭','射击'],casting:2},
 water:{attributes:{力量:2,敏捷:2},skills:['白刃','枪械'],casting:4},
 wind:{attributes:{敏捷:3},skills:['白刃','肉搏','枪械','弓箭','射击'],allChecks:2,speed:20},
 earth:{attributes:{力量:3},skills:['白刃','肉搏'],strengthOpposedAuto:2},
};
export const wizardForm=s=>WIZARD_FORMS[s.wizard?.form];
export const wizardAttribute=(s,key)=>wizardForm(s)?.attributes[key]??0;
export function wizardCheck(s,{skill,sub,attributes=[],context={}}={}){
 const f=wizardForm(s);if(!f)return {dp:0,auto:0};
 const rangedGun=context.gun||skill==='射击'&&['枪械','手枪','步枪'].includes(sub);
 return {dp:(f.allChecks??0)+(f.skills.includes(skill)||s.wizard.form==='water'&&rangedGun?4:0)+(context.casting?(f.casting??0):0),
   auto:context.opposed&&attributes.includes('力量')?(f.strengthOpposedAuto??0):0};
}
export function wizardWeapon(s){
 if(!s.wizard?.weaponDrawn)return null;
 return s.wizard.weaponMode==='gun'?{damage:4,ap:3,magic:5,attackBonus:0,blockBonus:0,range:100,magical:true,tags:['silver','holy','magic'],infiniteAmmo:true}:
 {damage:6,ap:5,magic:3,attackBonus:0,blockBonus:0,magical:true,tags:['holy','magic'],craft:'masterwork'};
}
export function wizardFireSegments(amount,severity='L'){
 // PHB 基本规则:29–30: discard fractions; preserve the rest of the damage.
 const fire=Math.floor(amount/2),raised=Math.floor(fire/2),rank=['B','L','A'];
 return [{amount:amount-fire,severity,kind:'physical'},
 {amount:fire-raised,severity,kind:'energy',energyType:'fire',magical:true},
 {amount:raised,severity:rank[Math.min(2,rank.indexOf(severity)+1)],kind:'energy',energyType:'fire',magical:true}];
}
