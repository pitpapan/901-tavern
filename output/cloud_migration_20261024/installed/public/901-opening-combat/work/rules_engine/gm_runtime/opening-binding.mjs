import {createOpeningEncounter} from '../combat/opening.mjs';
export const OPENING_ENCOUNTERS=[
  {id:'capital-stone',description:'仅当前实际到达试炼洞穴入口并与已出现的一具石像发生接战；可退出已观察阵纹圈，不要求击杀。世界书或历史提到石像不算到场。'},
  {id:'capital-search-party',description:'仅当前实际遇到已出现的搜查阻拦者并发生冲突；从已采用最多2名达卡斯部属老兵和2名城卫中取真正参战者，不自动敌对或凑满人数。'},
  {id:'capital-arrays',description:'峡谷现场实际与法阵安装者冲突；只选已经到场的安装者，最多4名，法阵状态另按当前完成度与节点处理。'},
  {id:'capital-chuul',description:'旧涵洞现场实际接战的一只Chuul；按实际水位、通道和在场成员登记，不自动凑齐队伍或添加人质。'},
  {id:'capital-hypnotist',description:'实际遇到的催眠魔兽；施术须现场双向视听、理解话语、已认识达卡斯与明确的一条引导，缺条件不自动控制。'},
  {id:'capital-gremlin',description:'实际遇到常态古雷姆林并接战；不使用吸石进化体。地下通路与出口须现场已确认，不凭土遁补造出口。'},
];
const json=text=>JSON.parse(text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));
export async function resolveOpeningBinding({id,chat,priorBinding,currentBattle},generateRaw) {
  if(!OPENING_ENCOUNTERS.some(e=>e.id===id))throw Error('未登记的当前时期遭遇模板');
  const transcript=chat.filter(m=>!m.is_system).slice(-14).map(m=>({role:m.is_user?'player':'host',text:m.mes}));
  const allowedEnemies={'capital-stone':{stone:'stone'},'capital-search-party':{veteran1:'veteran',veteran2:'veteran',cityGuard1:'cityGuard',cityGuard2:'cityGuard'},
    'capital-arrays':{installer1:'installer',installer2:'installer',installer3:'installer',installer4:'installer'},'capital-chuul':{chuul:'chuul'},
    'capital-hypnotist':{hypnotist:'hypnotist'},'capital-gremlin':{gremlin:'gremlin'}}[id];
  const raw=json(await generateRaw({should_stream:false,should_silence:true,max_chat_history:0,
    ordered_prompts:[{role:'system',content:'从当前聊天提取已经成立的现场，绑定战斗模板。只返回JSON，不推进动作，不编属性、HP、装备或能量。'+
      '格式：{"instanceId":"当前地点及同一批个体的稳定英文标识","scenario":"当前现场事实","participants":["player"],"enemies":["stone"],"positions":{"player":[4,0],"stone":[2,0]},"map":{"title":"现场","bounds":[-10,-9,23,18],"ground":"rock","features":[]},"evidence":["聊天中精确原文"],"goal":{"kind":"exitRadius","center":[0,0],"radius":6,"actorIds":["player"]}}。'+
      'positions采用当前可确认相对位置建米制地图，不自行移动人物。参与者只取当前实际在场并参与冲突者，可用player/huang/bright/jiang；姜必须已有实际到场依据。玩家旁观时不加入player；至少一名实际参与者。'+
      '地图可含airflow:false（无空气流动）、darkness:true；已确认可承重攀爬面标climbable:true；土层通路标earthPassage:true，可用出口另标earthExit:true，不能补造。催眠现场可给sceneFacts.hypnosis[敌人短ID][目标ID]={understands:true,hears:true,recognizesDakas:true,instruction:"现场明确的一条引导"}，这些必须有evidence原文；未确认就不填。'+
      'enemies只能选给定id，最大数量固定；城卫身份本身不等于敌对。只取实际冲突对象。没有player参战时，positions仍须填写已确认的player旁观站位；无法确认则needsInput。地图沿当前已有地形，未观察到的区域不补。'+
      '石像固定有效圈半径6米、在圈内行动、不远攻。goal用exitRadius确认脱离接战，center为实际圈心；不视作洞穴任务完成。搜查阻拦如果有已确认退路区域可用reachZone＋rect:[x,y,w,h]；缺少撤离区域则goal:null，普通战斗仍可按实际失去行动能力结束。'+
      '若priorBinding仍是同一地点同一批个体，必须沿用instanceId及currentPositions；退出后再接战不能传回初始位置。确已换地点或换成另一批个体才用新instanceId，不把前一批伤势带给新敌人。evidence须逐字引用本聊天中确认当前地点、参战者/敌对行为与相对位置的原文，不能引用世界书历史作为现场。只有先前样板或无法确认当前场景/站位时返回{"needsInput":"具体缺项"}。只提取，不替玩家决定目标或已执行攻击。'},'user_input'],
    user_input:JSON.stringify({encounterId:id,allowedEnemies,transcript,priorBinding:priorBinding?{instanceId:priorBinding.instanceId,scenario:priorBinding.scenario,enemies:priorBinding.enemies}:null,
      currentPositions:currentBattle?Object.fromEntries(Object.entries(currentBattle.actors).map(([k,a])=>[k,a.position])):null})}));
  if(raw.needsInput)throw Error(`当前遭遇尚缺现场依据：${raw.needsInput}`);
  if(!Array.isArray(raw.evidence)||!raw.evidence.length||raw.evidence.some(q=>typeof q!=='string'||!transcript.some(m=>m.text.includes(q))))throw Error('场景绑定缺少当前聊天逐字依据');
  if(!Array.isArray(raw.enemies)||!raw.enemies.length||new Set(raw.enemies).size!==raw.enemies.length||raw.enemies.some(id=>!Object.hasOwn(allowedEnemies,id)))throw Error('敌人不在已采用的本场名单内');
  if(!Array.isArray(raw.participants)||!raw.participants.length||raw.participants.some(id=>!['player','huang','bright','jiang'].includes(id)))throw Error('参战者缺少当前可用定义');
  if(!raw.participants.includes('player')&&(!Array.isArray(raw.positions?.player)||raw.positions.player.length!==2||!raw.positions.player.every(Number.isFinite)))throw Error('NPC单独交战须有御临风实际旁观站位，不能默认全知；不在场则需另行授权视角');
  if(typeof raw.instanceId!=='string'||!(/^[a-z0-9][a-z0-9-]{0,63}$/).test(raw.instanceId))throw Error('当前场景缺少有效个体标识');
  let objective;
  if(raw.goal) {
    const g=raw.goal;if(!Array.isArray(g.actorIds)||!g.actorIds.length||g.actorIds.some(k=>!raw.participants.includes(k)))throw Error('撤离目标不是当前参战者');
    if(g.kind==='exitRadius'&&id==='capital-stone'&&Array.isArray(g.center)&&g.center.length===2&&g.center.every(Number.isFinite))
      objective={kind:g.kind,actorIds:g.actorIds,center:g.center,radius:6,resolutionKind:'withdrawal',label:'成功脱离接战',description:'已退出石像有效圈。石像仍在；洞穴任务与其他区域未完成，不自动授奖。'};
    else if(g.kind==='reachZone'&&Array.isArray(g.rect)&&g.rect.length===4&&g.rect.every(Number.isFinite)&&g.rect[2]>0&&g.rect[3]>0)
      objective={kind:g.kind,actorIds:g.actorIds,rect:g.rect,resolutionKind:'withdrawal',label:'抵达已确认退路',description:'已抵达本场撤离区域，保留实际追踪、伤势与争议；不自动算案件解决或发奖。'};
    else throw Error('目标缺少已支持的当前退路参数');
  }
  const qualified=enemyId=>`${raw.instanceId}:${enemyId}`;
  const positions=Object.fromEntries(Object.entries(raw.positions??{}).map(([k,p])=>[Object.hasOwn(allowedEnemies,k)?qualified(k):k,p]));
  if(priorBinding?.instanceId===raw.instanceId&&currentBattle)for(const key of [...raw.participants,...raw.enemies.map(qualified)])
    if(currentBattle.actors[key])positions[key]=structuredClone(currentBattle.actors[key].position);
  const binding={id,instanceId:raw.instanceId,description:raw.scenario,scenario:raw.scenario,participants:raw.participants,
    enemies:raw.enemies.map(enemyId=>({id:qualified(enemyId),type:allowedEnemies[enemyId]})),positions,map:raw.map,objective,evidence:raw.evidence};
  if(id==='capital-hypnotist'&&raw.sceneFacts?.hypnosis)binding.sceneFacts={hypnosis:Object.fromEntries(Object.entries(raw.sceneFacts.hypnosis)
    .filter(([key])=>raw.enemies.includes(key)).map(([key,v])=>[qualified(key),Object.fromEntries(Object.entries(v).filter(([target])=>raw.participants.includes(target)))]))};
  const b=createOpeningEncounter(binding);
  if(id==='capital-stone') {
    const center=objective?.center;if(!center)throw Error('须确认已观察到的石像阵纹圈心与退路');
    b.actors[qualified('stone')].territory.center=[...center];binding.territories={[qualified('stone')]:{center:[...center],radius:6}};
  }
  return binding;
}
