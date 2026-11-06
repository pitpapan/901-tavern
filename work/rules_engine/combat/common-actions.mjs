import {check,lifeStatus} from '../core.mjs';
import {actorCheckRules} from '../gm_runtime/actor-rules.mjs';
import {changeWill} from '../resource-counters.mjs';
import {value,skill,RuleInputError,IllegalAction,equipment} from './mechanics.mjs';
import {measurePath,canObserve,clearLine,spatialDistance} from './map.mjs';

// PHB 非战斗行动与战斗行动 152–160, 209–215, 226–265.
// These are ordinary choices, not learned resources or model-authored effects.
export const COMMON_ACTIONS={
 charge:{name:'冲锋攻击',action:'移动＋标准',text:'沿回合开始可见目标的畅通直线到最近近战位置；每整米＋1DP，上限力量，等量减防至下次本人回合开始。'},
 feint:{name:'虚招',action:'标准',text:'智力＋社交·唬骗对抗感知＋社交·感受（已确认旧卡沿旧技能）；下次对同目标近战去除基本防御，限本人下回合结束前。'},
 adjust:{name:'调整架势',action:'整轮',text:'取消他人针对自己的虚招优势，不附带移动或攻击。'},
 trip:{name:'绊摔',action:'标准',text:'力量＋肉搏接触成功数对抗目标力量／敏捷＋运动；胜出倒地，空中目标改为下一轮飞速减净胜数。'},
 disarm:{name:'击落武器',action:'标准',text:'itemId须实际持握武器；部位攻击－3及适用闪避后，另作力量＋白刃对抗，净胜才击落，不伤持有人。'},
 sunder:{name:'击破武器／盾牌',action:'标准',text:'实际itemId；部位命中后双方力量＋白刃对抗，双方各计持握、娴熟和体积修正；净胜数减真实硬度扣耐久，不伤人物。'},
 allOut:{name:'全力一击',action:'标准',text:'近战攻击＋2DP，防御－2，至下次本人回合开始；不增加伤害上限。'},
 bullRush:{name:'冲撞',action:'标准',text:'力量＋肉搏对抗目标选择的力量／敏捷＋运动；mode为push击退或knockdown击倒。'},
 counterRush:{name:'抵挡后反冲',action:'反射',text:'仅实际力量抵挡冲撞后可选；mode为push、knockdown或decline；原攻击者对抗－2DP。'},
 grapple:{name:'擒抱',action:'标准',text:'力量／敏捷＋肉搏接触命中，再作擒抱对抗；attribute须明确选择strength或agility。'},
 dropProne:{name:'伏地',action:'反射',text:'进入倒地；移动半速，近战防御－2，远程防御＋2，范围回避最终成功－1。'},
 stand:{name:'起身',action:'移动',text:'解除倒地，不赠送位移。'},
 takeItem:{name:'取出物品',action:'按实物存放处',text:'正常佩带武器移动；方便取用的小物迅捷；背包取物整轮。仅取实际登记物品，不自动使用。'},
 aim:{name:'实际瞄准',action:'整轮',text:'实际远程武器瞄准三个射程单位内目标，下次本人行动时生效，最多三轮；迅捷装填不打断。'},
};
export const COMMON_TARGETED=['allOut','bullRush','grapple','aim','charge','feint','trip','disarm','sunder'];
const requireThat=(ok,message)=>{if(!ok)throw new IllegalAction(message);};
export const maneuverState=a=>a.state.combatManeuvers??={turn:0};
export function beginCommonTurn(b,a){
 const s=maneuverState(a);s.turn++;delete s.allOut;delete s.chargePenalty;
 if(s.tripFlight&&--s.tripFlight.turns<=0)delete s.tripFlight;
 s.startVisible=Object.values(b.actors).filter(t=>t.present&&t.id!==a.id&&canObserve(b,t,a.id)).map(t=>t.id);
}
export function endCommonTurn(a){const s=a.state.combatManeuvers;if(s?.feints)for(const [id,f]of Object.entries(s.feints))if(f.expiresAfterTurn<=s.turn)delete s.feints[id];}
export function checkManeuver(a,attribute,main,drawDice,{sub,modifier=0,defending=false}={}){
 const will=defending?a.willDefenseReady:a.willCheckReady;
 const out=check(a.state,{attribute,skill:main,...(sub?{sub}:{}),dice:drawDice(),modifier:modifier+actorCheckRules(a,{attribute,skill:main,sub}).modifier+(will?3:0),context:{physical:main!=='社交'&&main!=='掩饰'&&main!=='理解'&&main!=='感受',motion:main==='运动',willSpent:will===true}});
 if(defending&&will){changeWill(a.state,-1);delete a.willDefenseReady;}
 return out;
}
export function maneuverDefense(a,choice,{grapple=false}={}){
 if(['strength','agility'].includes(choice))return choice;
 if(a.controller==='player')throw new RuleInputError('请选择力量抵挡或敏捷避让',a.id+'.maneuverDefense');
 return value(a,'力量')+skill(a,grapple?'肉搏':'运动').level>=value(a,'敏捷')+skill(a,'运动').level?'strength':'agility';
}
export function requireMeleeTarget(b,a,t){
 requireThat(t?.present&&t.id!==a.id&&!['dead','unconscious'].includes(lifeStatus(t.state).state),'须在场且能行动的另一名目标');
 requireThat(spatialDistance(b.map,a.position,t.position)<=a.reach+1e-8&&clearLine(b.map,a.position,t.position)&&canObserve(b,t,a.id),'须在近战可及且可见范围内');
 requireThat(!a.state.grapple&&!a.claws?.some(Boolean)&&!a.state.grappleHolds?.length,'擒抱中须使用对应擒抱动作');
}
export function pushTarget(b,a,t,meters){
 const from=[...t.position],d=spatialDistance(b.map,a.position,t.position);
 requireThat(d>0,'击退须有可确定的远离方向');
 const to=from.map((n,i)=>n+(n-a.position[i])/d*meters),path=measurePath(b.map,from,to);
 const occupied=pathOccupied(b,from,to,[a.id,t.id]);
 if(!path.valid||occupied)return {targetId:t.id,from,to:from,length:0,blocked:true};
 t.position=to;return {targetId:t.id,from,to,length:path.length};
}
export function takeCarriedItem(a,itemId,spend){
 const item=a.state.possessions?.items?.find(x=>x.id===itemId);
 if(!item?.source)throw new RuleInputError('须有来源的实际物品实例','itemId');
 requireThat(item.location==='carried'&&!item.destroyed,'物品不在随身携带的可用物品中');
 requireThat(!item.worn,'穿戴中的装备须先按装卸规则处理');
 requireThat(!item.held,'该物品已经持握');
 let action=item.access==='backpack'?'full':item.access==='worn'&&item.weapon?'move':item.access==='accessible'&&item.small===true?'swift':null;
 if(!action)throw new RuleInputError('须确认物品实际存放处与取用条件',item.id+'.access');
 if(item.weapon)throw new RuleInputError('武器取用须走现有装备实例入口，核对空闲手数',item.id+'.equip');
 spend(action);item.held=true;
 return {itemId:item.id,name:item.name,operation:'take',action};
}

export function feintSkill(a,defending=false){
 const old=(defending?['理解','感受']:['掩饰']).find(name=>a.state.skills?.[name]);
 return old?{main:old}:{main:'社交',sub:defending?'感受':'唬骗'};
}
export function chargePath(b,a,t){
 requireThat(t?.present&&t.id!==a.id&&canObserve(b,t,a.id),'冲锋须可见目标');
 const visible=b.initialMapVisibility?.actorId===a.id&&b.initialMapVisibility.round===b.round?b.initialMapVisibility.visible:a.state.combatManeuvers?.startVisible;
 if(!visible)throw new RuleInputError('旧快照缺少本回合开始的视线记录；下一回合自动记录',a.id+'.turnStartSight');
 requireThat(visible.includes(t.id),'回合开始时未看见目标，不能冲锋');
 requireThat(!a.state.combatManeuvers?.prone&&!a.state.grapple&&!a.claws?.some(Boolean)&&!a.state.grappleHolds?.length,'当前姿态不能冲锋');
 requireThat(!a.flight&&!(a.state.verticalPosition?.heightAboveGround>0)&&!t.flight&&!(t.state.verticalPosition?.heightAboveGround>0),'空中冲锋须另有对应运动规则');
 const from=[...a.position],d=spatialDistance(b.map,from,t.position),length=d-a.reach;
 requireThat(length>0,'目标已经在近战范围，没有冲锋距离');
 const to=from.map((n,i)=>n+(t.position[i]-n)*length/d),path=measurePath(b.map,from,to);
 requireThat(path.valid&&Math.abs(path.cost-path.length)<1e-8&&clearLine(b.map,from,t.position),'冲锋路径须畅通且没有减速地形');
 requireThat(!pathOccupied(b,from,to,[a.id,t.id]),'冲锋路线或最近攻击位置被生物占据');
 return {...path,from,to};
}
export function pathOccupied(b,from,to,except=[]){
 const v=to.map((n,i)=>n-from[i]),sq=v.reduce((n,x)=>n+x*x,0);
 return Object.values(b.actors).some(x=>{
  if(!x.present||except.includes(x.id)||['dead','unconscious'].includes(lifeStatus(x.state).state))return false;
  const at=sq?Math.max(0,Math.min(1,x.position.reduce((n,z,i)=>n+(z-from[i])*v[i],0)/sq)):0;
  return spatialDistance(b.map,from.map((n,i)=>n+v[i]*at),x.position)<(b.map?.gridSize??1.5)/2;
 });
}
export function targetEquipment(t,itemId,{sunder=false}={}){
 const item=t?.state.possessions?.items?.find(x=>x.id===itemId);
 if(!item?.source)throw new RuleInputError('须有来源的实际目标武器或盾牌实例','target.itemId');
 requireThat(item.held&&item.location==='carried'&&!item.destroyed&&(item.weapon||sunder&&item.shield),'目标物品须正在持握且尚可使用');
 if(sunder&&(!item.durability||![item.durability.current,item.durability.max,item.durability.hardness].every(Number.isFinite)))throw new RuleInputError('击破须实际硬度与耐久，不能由动作请求补数',item.id+'.durability');
 return item;
}
export function equipmentContestModifier(a,item,other,{finesse=false}={}){
 const hands=item?.grip?.hands??equipment(a).weapon.grip?.hands;
 return (hands===2?4:0)-(finesse?4:0)+Math.max(0,a.state.size-other.state.size);
}
export function loseHeldEquipment(a,item,{broken=false}={}){
 item.held=false;if(!broken){item.location='ground';item.position=[...a.position];}
 if(a.state.equippedWeaponId===item.id){delete a.state.equippedWeaponId;delete a.state.equippedResources?.weapon;maneuverState(a).weaponUnavailable=true;}
 if(a.state.equippedShieldId===item.id){delete a.state.equippedShieldId;maneuverState(a).shieldUnavailable=true;}
 delete a.buffs.block;delete a.buffs.zheng;if(a.defenseIntent?.mode==='block')delete a.defenseIntent;
}
