// MVU stores actor state outside battle metadata. Callers supply actual records;
// embedded state is supported for in-memory battles, never character templates.
export function hydrateBattleActors(battle,records={}){
 if(!battle)throw Error('Combat not initialized');
 const view=structuredClone(battle);
 for(const [id,actor]of Object.entries(view.actors)){
  const state=records[id]?.state??actor.state;
  if(!state)throw Error('Missing actual combat state: '+id);
  actor.state=structuredClone(state);
 }
 return view;
}
