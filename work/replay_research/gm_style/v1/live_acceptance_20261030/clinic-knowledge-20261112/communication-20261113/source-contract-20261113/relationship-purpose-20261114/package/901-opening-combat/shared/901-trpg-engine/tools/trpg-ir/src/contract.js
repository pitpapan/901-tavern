// 纯契约校验：不读文件、不修复输入、不执行资料中的表达式。
export const object = v => v !== null && typeof v === 'object' && !Array.isArray(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
export const nonempty = v => typeof v === 'string' && v.trim().length > 0;
export const identifier = v => typeof v === 'string' && /^[A-Za-z0-9._-]+$/.test(v);
export const rank = v => v === null || (Number.isSafeInteger(v) && v >= 0);
const positive = v => Number.isSafeInteger(v) && v > 0;
const strings = v => Array.isArray(v) && v.every(x => typeof x === 'string');
export const pointer = v => String(v).replaceAll('~','~0').replaceAll('/','~1');

export function isJsonValue(v, seen = new Set()) {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return true;
  if (typeof v === 'number') return Number.isFinite(v);
  if (!(Array.isArray(v) || object(v)) || seen.has(v)) return false;
  seen.add(v);
  const ok = Object.getOwnPropertySymbols(v).length === 0 && Object.values(v).every(x => isJsonValue(x, seen)) &&
    (!Array.isArray(v) || Array.from({length:v.length},(_,i)=>Object.hasOwn(v,i)).every(Boolean));
  seen.delete(v); return ok;
}
export function validSource(s) {return object(s) && Object.keys(s).length === 4 && ['system','edition','ref','locator'].every(k=>Object.hasOwn(s,k)) && nonempty(s.system) && (s.edition === null || typeof s.edition === 'string') && nonempty(s.ref) && nonempty(s.locator);}
export function issue(code, severity, recordId, path, message, sourceRefs = []) {
  return {code,severity,recordId:typeof recordId==='string'?recordId:null,path,message,sourceRefs:structuredClone((Array.isArray(sourceRefs)?sourceRefs:[]).filter(validSource))};
}
export function contentIssue(i) {return {code:i.code,path:i.path,message:i.message,sourceRefs:structuredClone(i.sourceRefs)};}
function reporter(recordId = null, sources = []) {
  const issues=[];
  const add=(path,message,code='INVALID_RECORD',severity='error')=>issues.push(issue(code,severity,recordId,path,message,sources));
  const shape=(v,required,optional,path)=>{
    if(!object(v)){add(path,'需要对象');return false;}
    for(const k of required) if(!Object.hasOwn(v,k)) add(`${path}/${pointer(k)}`,'缺少必填字段');
    for(const k of Object.keys(v)) if(!required.includes(k)&&!optional.includes(k)) add(`${path}/${pointer(k)}`,'未知字段');
    return true;
  };
  return {issues,add,shape,result:()=>({ok:!issues.some(i=>i.severity==='error'),issues})};
}
export function validateParamSpec(params, paramSpec, {path='',recordId=null,sourceRefs=[]} = {}) {
  const r=reporter(recordId,sourceRefs);
  if(!object(params)||!object(paramSpec)){r.add(path,'params及paramSpec需要对象');return r.result();}
  const match=(v,t)=>t==='number'?typeof v==='number'&&Number.isFinite(v):t==='integer'?Number.isSafeInteger(v):t==='string'?typeof v==='string':t==='boolean'?typeof v==='boolean':t==='array'?Array.isArray(v):false;
  for(const [k,s] of Object.entries(paramSpec)){
    const p=`${path}/${pointer(k)}`;
    if(!object(s)){r.add(p,'无效的参数描述');continue;}
    if(!Object.hasOwn(params,k)){if(s.required===true)r.add(p,'缺少必填参数');continue;}
    const v=params[k];
    if(!match(v,s.type)){r.add(p,`参数应为${s.type}`);continue;}
    if(s.enum && (!Array.isArray(s.enum)||!s.enum.some(x=>Object.is(x,v))))r.add(p,'参数不在登记枚举中');
    if(s.minimum!==undefined&&v<s.minimum)r.add(p,'参数小于下限');
    if(s.maximum!==undefined&&v>s.maximum)r.add(p,'参数大于上限');
    if(s.type==='array'&&(!object(s.items)||!v.every(x=>match(x,s.items.type))))r.add(p,'数组元素类型不符');
  }
  for(const k of Object.keys(params))if(!Object.hasOwn(paramSpec,k))r.add(`${path}/${pointer(k)}`,'未登记的参数');
  return r.result();
}

export function validateRuleset(ruleset) {
  const r=reporter();
  if(!isJsonValue(ruleset)){r.add('','规则包需要JSON兼容值');return r.result();}
  if(!r.shape(ruleset,['schemaVersion','id','version','attributes','mainSkills','mainRankMax','subRankMax','stats','profiles','ops','policies'],[],''))return r.result();
  if(ruleset.schemaVersion!=='ruleset/0.1'||!identifier(ruleset.id)||!nonempty(ruleset.version))r.add('','规则包版本或ID不合法');
  if(!Array.isArray(ruleset.attributes)||!ruleset.attributes.every(identifier)||new Set(ruleset.attributes).size!==ruleset.attributes.length)r.add('/attributes','属性ID必须唯一');
  if(!Number.isSafeInteger(ruleset.mainRankMax)||ruleset.mainRankMax<0)r.add('/mainRankMax','需要非负安全整数');
  if(!rank(ruleset.subRankMax))r.add('/subRankMax','需要非负安全整数或null');
  for(const group of ['mainSkills','stats','profiles','ops','policies'])if(!object(ruleset[group]))r.add(`/${group}`,'需要目录对象');
  for(const [id,v] of Object.entries(object(ruleset.mainSkills)?ruleset.mainSkills:{})){
    if(!identifier(id)||!r.shape(v,['name','scope'],[],`/mainSkills/${pointer(id)}`)||!nonempty(v.name)||!nonempty(v.scope))r.add(`/mainSkills/${pointer(id)}`,'主项需名称和有限范围');
  }
  for(const [id,v] of Object.entries(object(ruleset.stats)?ruleset.stats:{})){
    if(!identifier(id)||!r.shape(v,['name','unit'],[],`/stats/${pointer(id)}`)||!nonempty(v.name)||!nonempty(v.unit))r.add(`/stats/${pointer(id)}`,'stat需名称和单位');
  }
  for(const group of ['profiles','ops'])for(const [id,v] of Object.entries(object(ruleset[group])?ruleset[group]:{})){
    const p=`/${group}/${pointer(id)}`;
    if(!identifier(id)||!r.shape(v,['paramSpec','dependencies'],[],p))continue;
    if(!strings(v.dependencies)||!v.dependencies.every(identifier))r.add(`${p}/dependencies`,'政策依赖必须为ID数组');
    if(!object(v.paramSpec)){r.add(`${p}/paramSpec`,'需要参数描述映射');continue;}
    for(const [key,d] of Object.entries(v.paramSpec)){
      const q=`${p}/paramSpec/${pointer(key)}`;
      if(!r.shape(d,['type'],['required','enum','minimum','maximum','items'],q))continue;
      if(!['number','integer','string','boolean','array'].includes(d.type))r.add(q,'不支持的参数类型');
      if(d.required!==undefined&&typeof d.required!=='boolean')r.add(q,'required需布尔值');
      if(d.enum!==undefined&&(!Array.isArray(d.enum)||!d.enum.length))r.add(q,'enum需非空数组');
      for(const bound of ['minimum','maximum'])if(d[bound]!==undefined&&(typeof d[bound]!=='number'||!Number.isFinite(d[bound])))r.add(q,'界限需有限数值');
      if(d.type==='array'&&(!r.shape(d.items,['type'],[],`${q}/items`)||!['number','integer','string','boolean'].includes(d.items?.type)))r.add(q,'数组仅接受原始类型元素描述');
      if(d.type!=='array'&&d.items!==undefined)r.add(q,'非数组不能声明items');
    }
  }
  for(const [id,v] of Object.entries(object(ruleset.policies)?ruleset.policies:{})){
    const p=`/policies/${pointer(id)}`;
    if(!identifier(id)||!r.shape(v,['status','value','sourceRefs'],[],p))continue;
    if(!['confirmed','pending'].includes(v.status)||!Array.isArray(v.sourceRefs)||!v.sourceRefs.every(validSource))r.add(p,'政策状态或来源不合法');
    if(v.status==='pending'&&v.value!==null)r.add(`${p}/value`,'pending政策值必须为null');
    if(v.status==='confirmed'&&!v.sourceRefs?.length)r.add(`${p}/sourceRefs`,'confirmed政策需要精确来源');
  }
  return r.result();
}

export function validateRecord(record,{ruleset} = {}) {
  const r=reporter(record?.id,Array.isArray(record?.sources)?record.sources:[]);
  if(!isJsonValue(record)){r.add('','记录需要JSON兼容值');return r.result();}
  if(!r.shape(record,['schemaVersion','id','revision','kind','name','sources','meaning','data','review'],['aliases','tags','settingScope','legacy'],''))return r.result();
  if(record.schemaVersion!=='game-ir/0.1')r.add('/schemaVersion','需要game-ir/0.1');
  if(!identifier(record.id))r.add('/id','ID只接受ASCII字母、数字、点、下划线和连字符');
  if(!positive(record.revision))r.add('/revision','revision需要正安全整数');
  if(!nonempty(record.name))r.add('/name','name不能为空');
  if(!Array.isArray(record.sources)||!record.sources.length||!record.sources.every(validSource))r.add('/sources','至少需要一条精确SourceRef');
  if(r.shape(record.meaning,['summary','limits','counterplay'],[],'/meaning')){
    if(!nonempty(record.meaning.summary)||!strings(record.meaning.limits)||!strings(record.meaning.counterplay))r.add('/meaning','原义需summary以及limits/counterplay字符串数组');
  }
  for(const k of ['aliases','tags'])if(record[k]!==undefined&&!strings(record[k]))r.add(`/${k}`,'需要字符串数组');
  if(r.shape(record.review,['status','issues'],[],'/review')){
    if(!['draft','approved'].includes(record.review.status))r.add('/review/status','未知审核状态');
    if(!Array.isArray(record.review.issues))r.add('/review/issues','需要内容疑点数组');
    else record.review.issues.forEach((i,n)=>{
      const p=`/review/issues/${n}`;
      if(r.shape(i,['code','path','message','sourceRefs'],[],p)&&(!nonempty(i.code)||typeof i.path!=='string'||!nonempty(i.message)||!Array.isArray(i.sourceRefs)||!i.sourceRefs.every(validSource)))r.add(p,'无效内容疑点');
    });
  }
  if(record.settingScope!==undefined&&r.shape(record.settingScope,['scope','branchId','truthStatus','validAt'],[],'/settingScope')){
    const s=record.settingScope;
    if(!['reference','original_campaign','transition_canon','continuation_canon','special_interlude','replay_branch'].includes(s.scope)||!['confirmed','uncertain','rumor','character_belief'].includes(s.truthStatus)||(s.branchId!==null&&!nonempty(s.branchId))||(s.validAt!==null&&!nonempty(s.validAt)))r.add('/settingScope','无效的设定层/可信度/时间');
  }
  const ref=(v,p)=>{if(r.shape(v,['id','version'],[],p)&&(!identifier(v.id)||!nonempty(v.version)))r.add(p,'无效rulesetRef');else if(object(v)&&ruleset&&(v.id!==ruleset.id||v.version!==ruleset.version))r.add(p,'规则包版本不匹配','RULESET_MISMATCH');};
  const grants=(v,p)=>{
    if(!Array.isArray(v)){r.add(p,'需要AbilityGrant数组');return;}
    v.forEach((g,n)=>{const q=`${p}/${n}`;if(r.shape(g,['abilityId','revision','rank'],[],q)&&(!identifier(g.abilityId)||!positive(g.revision)||!rank(g.rank)))r.add(q,'无效能力引用');});
  };
  const profile=(v,p)=>{
    if(!r.shape(v,['profileId','params'],[],p))return;
    if(!identifier(v.profileId)||!object(v.params)){r.add(p,'无效profile使用');return;}
    const definition=ruleset?.profiles&&Object.hasOwn(ruleset.profiles,v.profileId)?ruleset.profiles[v.profileId]:null;
    if(!definition){r.add(p,`未登记profile: ${v.profileId}`,'UNSUPPORTED_PROFILE','warning');return;}
    r.issues.push(...validateParamSpec(v.params,definition.paramSpec,{path:`${p}/params`,recordId:record.id,sourceRefs:record.sources}).issues);
  };
  const d=record.data;
  if(record.kind==='ability'&&r.shape(d,['mechanics'],[],'/data')){
    const m=d.mechanics;
    if(m!==null&&r.shape(m,['rulesetRef','mode','activation','effects','requires'],['target','check','costs','timing','stacking','semantic'],'/data/mechanics')){
      ref(m.rulesetRef,'/data/mechanics/rulesetRef');
      if(!['active','passive','triggered','modifier'].includes(m.mode))r.add('/data/mechanics/mode','未知能力mode');
      profile(m.activation,'/data/mechanics/activation');
      for(const k of ['target','check','timing','stacking'])if(m[k]!==undefined)profile(m[k],`/data/mechanics/${k}`);
      if(!Array.isArray(m.requires))r.add('/data/mechanics/requires','需要条件数组');else m.requires.forEach((v,n)=>profile(v,`/data/mechanics/requires/${n}`));
      if(!Array.isArray(m.effects)||!m.effects.length)r.add('/data/mechanics/effects','机械候选至少需要一个效果');
      else m.effects.forEach((e,n)=>{
        const p=`/data/mechanics/effects/${n}`;
        if(!r.shape(e,['op','params'],[],p))return;
        if(!identifier(e.op)||!object(e.params)){r.add(p,'无效op使用');return;}
        const definition=ruleset?.ops&&Object.hasOwn(ruleset.ops,e.op)?ruleset.ops[e.op]:null;
        if(!definition){r.add(p,`未登记op: ${e.op}`,'UNSUPPORTED_OP','warning');return;}
        r.issues.push(...validateParamSpec(e.params,definition.paramSpec,{path:`${p}/params`,recordId:record.id,sourceRefs:record.sources}).issues);
        if(e.op==='modify_value'&&(!ruleset.stats?.[e.params.statId]||ruleset.stats[e.params.statId].unit!==e.params.unit))r.add(`${p}/params/unit`,'stat或单位不符');
        if(e.op==='replace_check_attribute'&&(!ruleset.attributes?.includes(e.params.from)||!ruleset.attributes?.includes(e.params.to)))r.add(`${p}/params`,'替换属性必须在规则包内');
      });
      if(m.costs!==undefined){if(!Array.isArray(m.costs))r.add('/data/mechanics/costs','需要费用数组');else m.costs.forEach((c,n)=>{const p=`/data/mechanics/costs/${n}`;if(r.shape(c,['resourceId','amount','when'],[],p)&&(!identifier(c.resourceId)||typeof c.amount!=='number'||!Number.isFinite(c.amount)||c.amount<0||!['activation','success','failure','tick'].includes(c.when)))r.add(p,'无效费用');});}
      if(m.semantic!==undefined&&r.shape(m.semantic,['questions'],[],'/data/mechanics/semantic')){
        if(!Array.isArray(m.semantic.questions))r.add('/data/mechanics/semantic/questions','需要问题数组');
        else m.semantic.questions.forEach((q,n)=>{const p=`/data/mechanics/semantic/questions/${n}`;if(r.shape(q,['id','prompt','answerType'],['options'],p)&&(!identifier(q.id)||!nonempty(q.prompt)||!['boolean','enum'].includes(q.answerType)||(q.answerType==='enum'&&(!strings(q.options)||!q.options.length))||(q.answerType==='boolean'&&q.options!==undefined)))r.add(p,'无效语义问题');});
      }
    }
  }else if(record.kind==='item'&&r.shape(d,['rulesetRef','grants'],[],'/data')){
    ref(d.rulesetRef,'/data/rulesetRef');grants(d.grants,'/data/grants');
  }else if(record.kind==='actor_template'&&r.shape(d,['rulesetRef','attributes','mainSkills','subskills','abilities','resourceCaps'],[],'/data')){
    ref(d.rulesetRef,'/data/rulesetRef');grants(d.abilities,'/data/abilities');
    for(const key of ['attributes','mainSkills','subskills','resourceCaps'])if(!object(d[key]))r.add(`/data/${key}`,'需要ID映射对象');
    for(const [id,n] of Object.entries(object(d.attributes)?d.attributes:{}))if(!identifier(id)||!rank(n)|| (ruleset&&!ruleset.attributes?.includes(id)))r.add(`/data/attributes/${pointer(id)}`,'属性ID或数值不合法');
    for(const [id,n] of Object.entries(object(d.mainSkills)?d.mainSkills:{})){
      const p=`/data/mainSkills/${pointer(id)}`;
      if(!identifier(id)||!rank(n)||(ruleset&&!Object.hasOwn(ruleset.mainSkills,id)))r.add(p,'主技能ID或等级不合法');
      else if(n!==null&&ruleset&&n>ruleset.mainRankMax)r.add(p,'主技能超过规则包上限','RANK_OUT_OF_RANGE');
    }
    for(const [id,s] of Object.entries(object(d.subskills)?d.subskills:{})){
      const p=`/data/subskills/${pointer(id)}`;
      if(!identifier(id))r.add(p,'副技能ID不合法');
      if(!r.shape(s,['parentId','rank','scope'],[],p))continue;
      if(!identifier(s.parentId)||!object(d.mainSkills)||!Object.hasOwn(d.mainSkills,s.parentId))r.add(`${p}/parentId`,'副项需要模板中明确的主项','AMBIGUOUS_PARENT');
      if(!rank(s.rank))r.add(`${p}/rank`,'副项需要非负安全整数或null');
      else if(s.rank!==null&&ruleset?.subRankMax!==null&&ruleset?.subRankMax!==undefined&&s.rank>ruleset.subRankMax)r.add(`${p}/rank`,'副项超过规则包上限','RANK_OUT_OF_RANGE');
      if(!nonempty(s.scope))r.add(`${p}/scope`,'副项范围不能为空');
    }
    for(const [id,n] of Object.entries(object(d.resourceCaps)?d.resourceCaps:{}))if(!identifier(id)||(n!==null&&(typeof n!=='number'||!Number.isFinite(n)||n<0)))r.add(`/data/resourceCaps/${pointer(id)}`,'上限需要非负有限数值或null');
  }else if(record.kind==='lore'&&r.shape(d,['entryType','body'],[],'/data')){
    if(!['world','faction','location','character','concept','event'].includes(d.entryType)||!nonempty(d.body))r.add('/data','lore需要合法entryType和正文');
  }else if(!['ability','item','actor_template','lore'].includes(record.kind))r.add('/kind','未知内容kind');
  return r.result();
}

export function validateExtractionBatch(batch) {
  const r=reporter();
  if(!isJsonValue(batch)){r.add('','提取批次需要JSON兼容值');return r.result();}
  if(!r.shape(batch,['schemaVersion','source','candidates'],[],''))return r.result();
  if(batch.schemaVersion!=='extraction/0.1')r.add('/schemaVersion','需要extraction/0.1');
  if(r.shape(batch.source,['namespace','system','edition','ref'],[],'/source')&&(!identifier(batch.source.namespace)||!nonempty(batch.source.system)||(batch.source.edition!==null&&typeof batch.source.edition!=='string')||!nonempty(batch.source.ref)))r.add('/source','无效来源');
  if(!Array.isArray(batch.candidates))r.add('/candidates','需要候选数组');
  else batch.candidates.forEach((c,n)=>{
    const p=`/candidates/${n}`;
    if(!r.shape(c,['localId','sourceKind','name','locator','meaning','raw'],['proposedData'],p))return;
    if(!identifier(c.localId)||!['ability','feat','item','actor_template','lore'].includes(c.sourceKind)||!nonempty(c.name)||!nonempty(c.locator))r.add(p,'无效候选标识');
    if(r.shape(c.meaning,['summary','limits','counterplay'],[],`${p}/meaning`)&&(!nonempty(c.meaning.summary)||!strings(c.meaning.limits)||!strings(c.meaning.counterplay)))r.add(`${p}/meaning`,'无效原义');
    if(c.proposedData!==undefined&&!object(c.proposedData))r.add(`${p}/proposedData`,'目标结构候选需要对象');
  });
  return r.result();
}
