export function usesGeneRuntime(ruleset){
  return ruleset?.id==='901-six'&&['engine-v3','engine-v4','engine-v5','engine-v6','engine-v7'].includes(ruleset.version);
}
