import {createOpeningFixture} from './opening.mjs';

export const RECOVERY_SCENE='2026-10-23药品与休息独立接口验收。当前只有御临风在安全、安静、可正常睡眠的休息室；没有敌人、同伴或其他在场人物，不触发正式剧情、战斗、奖励或时间线。采用用户确认的T0初始卡与原库存；生命完好2、冲击1、严重6、恶性3，流风10/22、意志1/3是专供恢复验收的合成缺口，不代表御临风在正式剧情受到这些伤害。只有玩家明确服药、休息或打坐才执行并扣库存，正文承接程序结算结果。';

export function createRecoveryFixture() {
  const source=createOpeningFixture(),player=structuredClone(source.playerTemplate);
  Object.assign(player.state.health,{intact:2,B:1,L:6,A:3,temp:0,coma:false,deteriorationStopped:false});
  player.state.resources.流风.current=10;
  player.state.will.current=1;
  player.unsupportedActions=(player.unsupportedActions??[]).filter(x=>x!=='消耗品服用与休息恢复');
  const baseline=structuredClone(source.baseline);
  baseline.baselineMeaning='已确认T0初始卡的独立药品/休息验收；合成伤势和资源缺口只用于本夹具，不写入正式剧情。';
  baseline.definition.period='isolated/recovery-playtest/20261023';
  baseline.openingState.isolatedTestInitial={synthetic:true,health:structuredClone(player.state.health),flowCurrent:10,willCurrent:1,turn:'ready',xp:0};
  return {baseline,actors:{player:{name:player.name,state:structuredClone(player.state)}},playerTemplate:player,encounters:{},encounterOptions:[]};
}
