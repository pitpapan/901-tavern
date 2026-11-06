import fs from 'node:fs';
import {createOpeningEncounter} from '../../../../../../rules_engine/combat/opening.mjs';
import {beginCommonTurn} from '../../../../../../rules_engine/combat/common-actions.mjs';
import {beginTurn} from '../../../../../../rules_engine/core.mjs';
import {normalizeMap} from '../../../../../../rules_engine/combat/map.mjs';
import {panel} from '../../../../../../rules_engine/combat/engine.mjs';
const L=process.argv[2];
const seed=JSON.parse(fs.readFileSync(L+'/root-template.json','utf8'));
for(const kind of ['charge','feint','trip']){
 const name='901 常用战斗隔离 20261106 '+kind;
 const b=createOpeningEncounter({id:'isolated-common-'+kind,scenario:'明确隔离机械演练，不计入正式游玩。御临风与黄泉在平坦空旷练习场对练，双方状态与武器沿初始卡。当前轮到御临风，只有双方在场。',participants:['player','huang'],positions:{player:[0,0],huang:[kind==='charge'?6:1,0]},teams:{player:'玩家方',huang:'对练方'}});
 b.activeId='player';b.actors.player.state=beginTurn(b.actors.player.state).state;b.actors.huang.sheathed=false;b.playerDefenseDeclarations=true;b.reactionWindows=true;
 b.map=normalizeMap({title:'隔离空旷练习场',bounds:[-10,-10,30,30],features:[]},b);beginCommonTurn(b,b.actors.player);
 const root={schemaVersion:seed.schemaVersion,revision:0,chatId:name,operations:{},actors:Object.fromEntries(Object.entries(b.actors).map(([id,a])=>[id,{name:a.name,state:structuredClone(a.state)}])),battle:b,ruleScene:{}};
 fs.writeFileSync(L+'/'+kind+'-root.json',JSON.stringify(root));
 fs.writeFileSync(L+'/'+kind+'-panels.json',JSON.stringify(Object.fromEntries(Object.keys(b.actors).map(id=>[id,panel(b,id)]))));
}
