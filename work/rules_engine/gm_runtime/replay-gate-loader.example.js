// Paste into an enabled TavernHelper *character* script on the isolated card.
// The hook registers immediately; MVU is awaited only after native generation
// has been stopped for the current player floor.
const { registerReplayGate } = await import('/901-rules-runtime/work/rules_engine/gm_runtime/replay-gate-script.example.js');
registerReplayGate({ getMvu: async () => {
  await Promise.race([
    waitGlobalInitialized('Mvu'),
    new Promise((_, reject) => setTimeout(() => reject(new Error('MVU initialization timed out')), 5000)),
  ]);
  return Mvu;
} });
