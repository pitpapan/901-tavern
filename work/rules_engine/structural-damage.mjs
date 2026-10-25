// Shared finite structural-damage settlement; no living wound conversion.
export function applyStructuralDamage(object,amount,{ignoreHardness=0,magical=false,grade,energyType}={}){
 const d=object.durability;
 if(!d||![d.current,d.max,d.hardness,amount,ignoreHardness].every(Number.isFinite)||d.current<0||d.current>d.max||d.max<=0||d.hardness<0||amount<0||ignoreHardness<0)throw Error('物体须有实际耐久、硬度和非负伤害');
 if(object.material==='antiMagicRock'&&magical&&!['ungraded','D','C','B','A','S'].includes(grade))throw Error('厌魔石须确认实际打击等级');
 const immune=object.material==='antiMagicRock'&&magical&&grade!=='S'&&!object.energyException?.source;
 const hardness=['mental','poison'].includes(energyType)?0:Math.max(0,d.hardness-ignoreHardness),before=d.current;
 const structuralDamage=immune?0:Math.min(before,Math.max(0,amount-hardness));d.current-=structuralDamage;
 if(d.current===0)object.destroyed=true;
 return {structuralDamage,destroyed:object.destroyed===true};
}
