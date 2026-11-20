// Trusted local randomness shared by weighted rule selections. Rejection
// sampling gives every actual ticket equal probability, including non-powers of ten.
export function randomDice() {
  const result = [];
  while (result.length < 512) {
    const bytes = new Uint8Array(640);
    crypto.getRandomValues(bytes);
    for (const x of bytes) if (x < 250 && result.length < 512) result.push(x % 10 + 1);
  }
  return result;
}
export function weightedDraw(weights,drawDice=randomDice,{field='random.dice'}={}){
 const total=weights.reduce((n,w)=>n+w,0);
 if(!weights.length||weights.some(w=>!Number.isSafeInteger(w)||w<1)||!Number.isSafeInteger(total))throw Error('抽签权重须为正整数');
 if(weights.length===1)return {index:0,weights:[...weights],ticket:0,dice:[]};
 const digits=Math.max(1,Math.ceil(Math.log10(total))),range=10**digits,limit=range-range%total;
 const dice=drawDice();let cursor=0,value;
 do{value=0;for(let i=0;i<digits;i++){
  const die=dice[cursor++];
  if(!Number.isInteger(die)||die<1||die>10){const e=new Error('抽签需要足够的可信D10骰');e.code='NEEDS_INPUT';e.field=field;throw e;}
  value=value*10+die-1;
 }}while(value>=limit);
 let slot=value%total;const ticket=slot;let index=0;while(slot>=weights[index])slot-=weights[index++];
 return {index,weights:[...weights],ticket,dice:dice.slice(0,cursor)};
}
