// Renderer fixture inspired by the user's grid-map references. Not campaign state.
import {normalizeMap,mapView} from '../combat/map.mjs';
export function referenceMapState() {
  const battle={actors:Object.fromEntries([
    ['player','御临风','self',[27,48]],['jiang','姜子尤','ally',[25.5,46.5]],
    ['huang','黄泉','ally',[30,49.5]],['bright','布莱特','ally',[27,54]],
    ['guard1','甲号守卫','other',[28.5,34.5]],['guard2','乙号守卫','other',[30,31.5]],
  ].map(([id,name,team,position])=>[id,{id,name,team:team==='other'?'敌方':'同伴',position,present:true}]))};
  battle.map=normalizeMap({title:'林间山道 · 手绘地图样例',bounds:[0,0,54,75],ground:'grass',gridSize:1.5,features:[
    {id:'northwood',label:'北侧林地',kind:'zone',surface:'forest',points:[[0,0],[54,0],[54,9],[43.5,9],[42,6],[33,6],[31.5,12],[22.5,12],[19.5,4.5],[9,4.5],[7.5,7.5],[0,7.5]]},
    {id:'southwood',label:'南侧疏林',kind:'zone',surface:'forest',points:[[0,55.5],[12,55.5],[16.5,60],[24,61.5],[24,75],[0,75]]},
    {id:'eastwood',label:'林地',kind:'zone',surface:'forest',points:[[34.5,57],[42,55.5],[46.5,58.5],[54,57],[54,75],[33,75],[33,66]]},
    {id:'westcliff',label:'西侧山壁',kind:'obstacle',surface:'rock',blocksSight:true,points:[[0,9],[9,9],[12,7.5],[16.5,12],[21,13.5],[21,22.5],[22.5,25.5],[22.5,33],[21,36],[21,43.5],[19.5,46.5],[19.5,54],[13.5,55.5],[10.5,52.5],[0,52.5]]},
    {id:'eastcliff',label:'东侧山壁',kind:'obstacle',surface:'rock',blocksSight:true,points:[[54,10.5],[43.5,10.5],[40.5,13.5],[36,13.5],[34.5,19.5],[33,24],[33,34.5],[34.5,37.5],[33,43.5],[33,48],[34.5,55.5],[43.5,54],[46.5,55.5],[54,54]]},
    {id:'road',label:'山道',kind:'zone',surface:'road',points:[[24,0],[30,0],[30,13.5],[31.5,16.5],[31.5,22.5],[30,25.5],[31.5,31.5],[31.5,39],[30,43.5],[31.5,48],[31.5,58.5],[30,63],[30,75],[24,75],[24,61.5],[25.5,55.5],[24,51],[24,45],[25.5,40.5],[24,34.5],[24,28.5],[25.5,24],[24,18],[24,12]]},
    {id:'rubble',label:'碎石坡',kind:'difficult',surface:'rubble',points:[[22.5,31.5],[24,30],[25.5,33],[25.5,37.5],[24,40.5],[22.5,37.5]]},
    {id:'pond',label:'浅池',kind:'difficult',surface:'water',points:[[39,61.5],[43.5,60],[48,61.5],[48,66],[45,69],[40.5,67.5],[37.5,64.5]]},
    {id:'bridgewall',label:'旧石垒',kind:'obstacle',surface:'wall',rect:[31.5,7.5,9,1.5],blocksSight:false},
    {id:'south',label:'↓ 通往帝都',kind:'landmark',surface:'road',rect:[24,70.5,6,1.5]},
  ]},battle);
  return {revision:0,map:mapView(battle),player:{speed:30,activeTurn:true}};
}
