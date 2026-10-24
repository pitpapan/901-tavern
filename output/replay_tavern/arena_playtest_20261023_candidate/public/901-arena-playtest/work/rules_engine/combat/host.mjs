// The host supplies period-correct encounter factories. Model tool arguments
// select their IDs; they cannot supply actors, grants, stats or write patches.
export function createCombatHost({controller,encounters={},showChoices=()=>{},onStory=()=>{}}) {
  async function state() {
    await controller.carryLatest();
    try {return controller.read();}
    catch(error) {
      if(/Combat not initialized|not initialized on this message branch/.test(error.message)) return null;
      throw error;
    }
  }
  async function continueCombat() {
    const saved=await state();
    if(!saved||saved.battle.mode==='story') return {handled:false};
    if(saved.battle.status==='active') await controller.run();
    const current=controller.read();
    if(current.battle.status==='finished') {
      await controller.returnToStory();
      const result=controller.read();
      await onStory(result);return {handled:true,status:'story',revision:result.revision};
    }
    const choices=controller.options();
    if(choices.controller==='player') await showChoices(choices);
    return {handled:true,status:choices.controller==='player'?'awaiting_player':current.battle.status,revision:current.revision};
  }
  return {
    async enter(id,options) {
      if(!Object.hasOwn(encounters,id)) throw new Error('该遭遇未在当前时期的主持配置中登记');
      await controller.carryLatest();
      await controller.enter(await encounters[id](),options);
      return continueCombat();
    },
    handleTurn:continueCombat,
    async playerChoice(selection) {
      await controller.submitPlayer(selection);return continueCombat();
    },
    async read() {
      const saved=await state();
      if(!saved||saved.battle.mode==='story') return {mode:'story'};
      return {mode:'combat',revision:saved.revision,context:controller.options().context};
    },
    async parameters(actorId,values) {return controller.supplyParameters(actorId,values);},
  };
}
