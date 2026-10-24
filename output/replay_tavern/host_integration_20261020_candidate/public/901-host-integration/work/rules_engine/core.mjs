// 901 Core Rules v0.1, P0 only. All public operations return new JSON-safe state.
export const ATTRIBUTES = ['力量', '敏捷', '智力', '感知', '意志', '风度'];
export const SEVERITIES = ['B', 'L', 'A'];
const STATUS_ATTRIBUTES = {
  恶心: ['力量', '意志'], 麻痹: ['力量', '意志'], 晕眩: ['力量', '意志'],
  耳鸣: ['力量', '感知'], 目眩: ['力量', '感知'],
  精神束缚: ['意志'], 恐惧: ['意志'], 沮丧: ['意志'], 亢奋: ['意志'],
  纠缠: ['力量', '敏捷'], 冻结: ['力量', '敏捷'], 疲乏: ['力量'],
  魅惑: ['意志', '风度'], 肢体妨害: ['力量', '敏捷'],
};

function integer(value, name, minimum = 0) {
  if (!Number.isInteger(value) || value < minimum) throw new RangeError(`${name} must be an integer >= ${minimum}`);
  return value;
}
function clone(value) { return structuredClone(value); }
function requireAttribute(name) {
  if (!ATTRIBUTES.includes(name)) throw new RangeError(`Unknown 901 attribute: ${name}`);
}
function autoForLevel(level) { return Math.max(0, Math.floor((level - 1) / 5)); }
function skillAuto(level) { return Math.floor(level / 5); }
function baseAttribute(state, name) { requireAttribute(name); return state.attributes[name] ?? 0; }
export function effectiveAttribute(state, name) {
  return Math.max(0, baseAttribute(state, name) - (state.attributeDamage?.[name] ?? 0));
}
function attrValue(state, name) { return effectiveAttribute(state, name); }
function baseAuto(state, name) { return state.attributeAuto?.[name] ?? autoForLevel(baseAttribute(state, name)); }
function attrAuto(state, name) {
  const lostMilestones = autoForLevel(baseAttribute(state, name)) - autoForLevel(attrValue(state, name));
  return Math.max(0, baseAuto(state, name) - lostMilestones);
}

// Use only for a new or incomplete card. Explicit card fields always win.
export function createCharacter(input) {
  const state = clone(input);
  state.attributes ??= {};
  for (const name of ATTRIBUTES) {
    integer(state.attributes[name] ?? 0, name);
    state.attributes[name] ??= 0;
  }
  state.attributeAuto ??= {};
  state.skills ??= {};
  const a = state.attributes;
  const hpMax = input.health && !input.derived?.hpMax
    ? input.health.intact + input.health.B + input.health.L + input.health.A
    : (state.size ?? 0) + a.力量 + 2 * baseAuto(state, '力量') + (state.hpBonus ?? 0);
  state.derivedOverrides = input.derivedOverrides ?? [...new Set([...Object.keys(input.derived ?? {}),
    ...(input.health ? ['hpMax'] : [])])];
  state.derived = {
    hpMax, defense: Math.min(a.敏捷, a.感知), speed: a.力量 + a.敏捷 + (state.size ?? 0),
    initiative: a.敏捷 + a.风度, willMax: a.意志 + a.风度,
    vision: 10 * a.感知 + 20 * baseAuto(state, '感知'),
    ...(state.derived ?? {}),
  };
  state.health ??= { intact: state.derived.hpMax, B: 0, L: 0, A: 0, temp: 0, coma: false, deteriorationStopped: false };
  state.health.temp ??= 0;
  state.health.coma ??= false;
  state.health.deteriorationStopped ??= false;
  validateHealth(state.health);
  state.will ??= { current: state.derived.willMax, max: state.derived.willMax };
  state.will.max ??= state.derived.willMax;
  state.xp ??= 0;
  state.greatPowersAvailable ??= 0;
  state.resources ??= {};
  state.statuses ??= [];
  state.attributeDamage ??= {};
  state.turn ??= freshTurn();
  state.extendedActions ??= {};
  return state;
}

export function effectiveSkill(state, main, sub) {
  if (!main) return { level: 0, auto: 0, main: 0, sub: 0 };
  const entry = state.skills?.[main] ?? {};
  const mainLevel = integer(entry.level ?? 0, `${main} level`);
  if (mainLevel > 5) throw new RangeError('Main skill exceeds 901 cap 5');
  const matching = sub ? entry.subs?.[sub] ?? {} : {};
  const subLevel = integer(matching.level ?? 0, `${sub ?? 'sub'} level`);
  return {
    level: mainLevel + subLevel,
    auto: (entry.auto ?? skillAuto(mainLevel)) + (sub ? matching.auto ?? skillAuto(subLevel) : 0),
    main: mainLevel, sub: subLevel,
  };
}

// Dice are supplied in actual draw order: initial pool first, then queued explosions.
export function rollPool(dp, dice) {
  if (!Number.isInteger(dp)) throw new TypeError('DP must be an integer');
  if (!Array.isArray(dice)) throw new TypeError('A deterministic dice array is required');
  const luck = dp <= 0;
  let pending = luck ? 1 : dp;
  let used = 0;
  let successes = 0;
  while (pending > 0) {
    if (used >= dice.length) throw new RangeError('Not enough supplied dice, including explosions');
    const die = integer(dice[used], `die ${used + 1}`, 1);
    if (die > 10) throw new RangeError('D10 result exceeds 10');
    used++;
    pending--;
    if (die === 10) { successes++; pending++; }
    else if ((!luck || used > 1) && die >= 8) successes++;
  }
  return { dp, luck, dice: dice.slice(0, used), used, rolledSuccesses: successes,
    luckMishap: luck && dice[0] === 1 };
}

export function check(state, options) {
  if (options.eligible === false) return { eligible: false, success: false, reason: options.reason ?? 'Ineligible action' };
  if (options.willpower !== undefined) throw new Error('Generic willpower enhancement is not supported by this check');
  const attributes = options.attributes ?? (options.attribute ? [options.attribute] : []);
  const skill = effectiveSkill(state, options.skill, options.sub);
  const dp = (options.poolBase ?? attributes.reduce((n, name) => n + attrValue(state, name), 0))
    + skill.level + (options.modifier ?? 0);
  const roll = rollPool(dp, options.dice);
  const autoSuccesses = (options.attributeAutoOverride ?? attributes.reduce((n, name) => n + attrAuto(state, name), 0))
    + skill.auto + (options.autoBonus ?? 0);
  const reExtraSuccesses = roll.rolledSuccesses > 0 ? (options.reExtraSuccesses ?? 0) : 0;
  const total = roll.rolledSuccesses + autoSuccesses + reExtraSuccesses;
  return { eligible: true, ...roll, skill, autoSuccesses, reExtraSuccesses, total,
    ...(options.dc === undefined ? {} : { dc: options.dc, success: total >= options.dc }) };
}

// PHB genetic-lock unlocking is a D10 total, separate from ordinary DP checks.
// History must be supplied by the trusted character state; absent history is unknown.
export function resolveGeneticUnlock(state, { stage, mode = 'natural', opportunity,
  dice, specialModifiers = [], roleplayModifier } = {}) {
  if (mode === 'voluntary') return { status: 'deferred', reason: 'Voluntary costs and backlash are not adopted for six attributes' };
  if (mode !== 'natural') return { status: 'deferred', reason: 'Unsupported genetic unlock mode' };
  if (![1, 2].includes(stage)) return { status: 'deferred', reason: 'Only first and second stage math is supported' };
  if (!opportunity || typeof opportunity.id !== 'string' || !opportunity.id.trim() ||
      typeof opportunity.source !== 'string' || !opportunity.source.trim() ||
      !['qualifying_crisis', 'explicit_rule'].includes(opportunity.kind))
    return { status: 'needs_input', reason: 'A source-backed qualifying opportunity is required' };
  const history = state?.geneticLock?.successfulUnlocks;
  const previous = history?.[stage];
  if (!Number.isInteger(previous) || previous < 0)
    return { status: 'needs_input', reason: `Known successful stage ${stage} unlock history is required` };
  if (stage === 2 && (!Number.isInteger(history?.[1]) || history[1] < 1 ||
      !Number.isInteger(state.geneticLock.highestStage) || state.geneticLock.highestStage < 1))
    return { status: 'needs_input', reason: 'Second stage requires known prior first-stage unlock' };
  if (!Array.isArray(specialModifiers)) throw new TypeError('Special modifiers must be an array');
  const validateModifier = (modifier, label) => {
    if (!modifier || typeof modifier.value !== 'number' || !Number.isFinite(modifier.value) ||
        typeof modifier.source !== 'string' || !modifier.source.trim() ||
        typeof modifier.reason !== 'string' || !modifier.reason.trim())
      throw new TypeError(`${label} needs a finite numeric value, source, and reason`);
    return modifier.value;
  };
  const special = specialModifiers.reduce((sum, item) => sum + validateModifier(item, 'Special modifier'), 0);
  const roleplay = roleplayModifier === undefined ? 0 : validateModifier(roleplayModifier, 'Roleplay modifier');
  const count = stage === 1 ? 1 : 2;
  if (dice === undefined) return { status: 'ready', diceNeeded: count };
  if (!Array.isArray(dice) || dice.length < count) throw new RangeError(`${count} D10 results required`);
  const rolled = dice.slice(0, count).map((die, index) => integer(die, `D10 ${index + 1}`, 1));
  if (rolled.some(die => die > 10)) throw new RangeError('D10 result exceeds 10');
  const freelyUnlockedBonus = stage === 2 && state.geneticLock.freelyUnlockStage1 === true ? 2 : 0;
  const total = rolled.reduce((sum, die) => sum + die, 0) + previous + freelyUnlockedBonus + special + roleplay;
  const success = total >= (stage === 1 ? 10 : 20);
  const next = clone(state);
  if (success && stage === 1) {
    next.geneticLock.successfulUnlocks[stage] = previous + 1;
    next.geneticLock.highestStage = Math.max(next.geneticLock.highestStage ?? 0, stage);
  }
  return { status: 'resolved', state: next, result: {
    stage, opportunity, dice: rolled, previousSuccessfulUnlocks: previous,
    specialModifiers: clone(specialModifiers), roleplayModifier: roleplayModifier ? clone(roleplayModifier) : null,
    freelyUnlockedBonus, target: stage === 1 ? 10 : 20, total, success,
    commitSupported: stage === 1,
    pendingNarrative: success && previous === 0 ? { type: 'extraordinary_performance', stage,
      opportunityId: opportunity.id, status: 'pending_gm' } : null,
  } };
}

export function oppose(activeState, passiveState, activeOptions, passiveOptions) {
  const passive = check(passiveState, passiveOptions);
  const active = check(activeState, activeOptions);
  return { active, passive, success: active.eligible && passive.eligible && active.total >= passive.total,
    margin: active.eligible && passive.eligible ? active.total - passive.total : null };
}

export function freshTurn() {
  return { phase: 'ready', standard: 0, move: 0, swift: 0, reactionLock: false,
    reactionLockEnds: 0, responseDebt: false, opportunityUsed: false };
}

export function beginTurn(state) {
  const next = clone(state);
  const old = next.turn ?? freshTurn();
  if (old.phase === 'active' || old.phase === 'skipped')
    return { state, result: { allowed: false, reason: 'Current turn has not ended' } };
  const skipped = !!old.responseDebt;
  const severeNausea = statusLevel(state, '恶心').severe;
  const exhausted = statusLevel(state, '疲乏').severe;
  next.turn = { ...old, phase: skipped ? 'skipped' : 'active', standard: skipped || severeNausea ? 0 : 1,
    move: skipped || exhausted ? 0 : 1, swift: skipped || old.reactionLock || severeNausea ? 0 : 1,
    responseDebt: false, opportunityUsed: false };
  return { state: next, result: { allowed: true, skipped, turn: next.turn } };
}

export function endTurn(state) {
  const next = clone(state);
  const remainingLock = Math.max(0, (next.turn?.reactionLockEnds ?? 0) - 1);
  next.turn = { ...(next.turn ?? freshTurn()), phase: 'ended', standard: 0, move: 0, swift: 0,
    reactionLock: remainingLock > 0, reactionLockEnds: remainingLock };
  return { state: next, result: { turn: next.turn } };
}

export function lifeStatus(state) {
  const h = state.health;
  validateHealth(h);
  const total = h.intact + h.B + h.L + h.A;
  if (total > 0 && h.A === total) return { state: 'dead', deteriorating: false, woundPenalty: 3 };
  const woundPenalty = Math.max(0, 3 - h.intact);
  if (h.intact > 0) return { state: 'awake', deteriorating: false, woundPenalty };
  if (h.A > 0) return { state: 'unconscious', deteriorating: !h.deteriorationStopped, woundPenalty };
  if (h.L > 0 || h.coma) return { state: 'unconscious', deteriorating: false, woundPenalty };
  return { state: 'B-check', deteriorating: false, woundPenalty };
}

function statusPoints(state, type) {
  const entries = state.statuses.filter(s => s.type === type);
  return type === '疲乏' ? entries.reduce((n, s) => n + s.points, 0)
    : Math.max(0, ...entries.map(s => s.points));
}
export function statusLevel(state, type) {
  const points = statusPoints(state, type);
  if (!points) return { points: 0, severe: false, catastrophicThreshold: false };
  if (type === '剧痛') {
    const a = attrValue(state, '意志') + attrValue(state, '风度');
    const b = attrValue(state, '力量') + attrValue(state, '意志');
    return { points, severe: points > a || points > b,
      catastrophicThreshold: points > 2 * Math.max(a, b), excess: Math.max(0, points - 2 * Math.max(a, b)) };
  }
  const names = STATUS_ATTRIBUTES[type];
  if (!names) return { points, severe: false, catastrophicThreshold: false, sourceSpecific: true };
  const threshold = Math.max(...names.map(name => attrValue(state, name)));
  return { points, severe: points > threshold, catastrophicThreshold: points > 2 * threshold,
    excess: Math.max(0, points - 2 * threshold) };
}

export function actionEligibility(state, action) {
  const life = lifeStatus(state).state;
  if (life === 'dead' || life === 'unconscious') return { allowed: false, reason: life };
  if (statusLevel(state, '剧痛').severe || statusLevel(state, '晕眩').severe || statusPoints(state, '震慑'))
    return { allowed: false, reason: 'Status prevents action' };
  if (statusLevel(state, '恶心').severe && !['move', 'free'].includes(action))
    return { allowed: false, reason: 'Severe nausea permits move action only' };
  if (['attack', 'move', 'charge', 'fiveFootStep'].includes(action)
      && (statusLevel(state, '麻痹').severe || statusLevel(state, '纠缠').severe || statusLevel(state, '冻结').severe))
    return { allowed: false, reason: 'Immobilized' };
  if (action === 'charge' && statusLevel(state, '疲乏').points > 0)
    return { allowed: false, reason: 'Fatigue prevents charge' };
  return { allowed: true, requiresBCheck: life === 'B-check' };
}

// PHB conversions are one-way: standard -> move -> swift.
export function spendAction(state, kind, options = {}) {
  if (state.turn?.responseDebt || state.turn?.phase === 'skipped')
    return { state, result: { allowed: false, reason: 'Response action debt blocks all actions' } };
  let working = state;
  let preActionCheck;
  if (lifeStatus(state).state === 'B-check') {
    if (!options.preActionCheck)
      return { state, result: { allowed: false, reason: 'Pre-action Strength check and GM DC required' } };
    preActionCheck = checkBeforeAction(state, options.preActionCheck);
    if (!preActionCheck.result.allowed)
      return { state: preActionCheck.state, result: { allowed: false,
        reason: 'Pre-action Strength check failed', preActionCheck: preActionCheck.result } };
    working = preActionCheck.state;
  }
  const next = clone(working);
  const turn = next.turn ?? freshTurn();
  const eligibility = actionEligibility(working, options.behavior ?? kind);
  if (!eligibility.allowed) return { state, result: { allowed: false, reason: eligibility.reason } };
  if (kind === 'reflex' || kind === 'response') {
    if (turn.reactionLock || turn.phase === 'skipped' || turn.phase === 'active' && turn.responseDebt)
      return { state, result: { allowed: false, reason: 'Reaction locked' } };
    if (kind === 'response' && !options.betweenActions)
      return { state, result: { allowed: false, reason: 'Response requires interval between actions' } };
    turn.reactionLock = true;
    turn.reactionLockEnds = turn.phase === 'active' ? 2 : 1;
    turn.swift = 0;
    if (kind === 'response') turn.responseDebt = true;
  } else if (kind === 'opportunity') {
    if (turn.opportunityUsed || !options.enemyLeavesThreat || options.safeFiveFootStep === true)
      return { state, result: { allowed: false, reason: 'No available opportunity attack' } };
    turn.opportunityUsed = true;
  } else {
    if (turn.phase !== 'active') return { state, result: { allowed: false, reason: 'Not active turn' } };
    if (kind === 'free') { /* PHB has no numeric limit; caller determines timing. */ }
    else if (kind === 'standard' || kind === 'attack') {
      if (!turn.standard) return { state, result: { allowed: false, reason: 'Standard action spent' } };
      turn.standard = 0;
    } else if (kind === 'move' || kind === 'fiveFootStep') {
      if (turn.move) turn.move = 0;
      else if (turn.standard) turn.standard = 0;
      else return { state, result: { allowed: false, reason: 'No move or convertible standard' } };
    } else if (kind === 'swift') {
      if (turn.reactionLock) return { state, result: { allowed: false, reason: 'Swift blocked by reflex action' } };
      if (turn.swift) turn.swift = 0;
      else if (turn.move) turn.move = 0;
      else if (turn.standard) turn.standard = 0;
      else return { state, result: { allowed: false, reason: 'No swift or convertible action' } };
    } else if (kind === 'full' || kind === 'charge') {
      if (!turn.standard || !turn.move) return { state, result: { allowed: false, reason: 'Standard and move required' } };
      turn.standard = 0; turn.move = 0;
    } else throw new RangeError(`Unsupported PHB action: ${kind}`);
  }
  next.turn = turn;
  return { state: next, result: { allowed: true, kind, turn,
    ...(preActionCheck ? { preActionCheck: preActionCheck.result } : {}) } };
}

// A multi-round action occupies one full-round allocation on each supplied round.
// The actual number of rounds and any interruption consequence belong to its source.
export function advanceMultiRoundAction(state, { id, totalRounds, preActionCheck } = {}) {
  if (!id) throw new Error('Multi-round action id required');
  integer(totalRounds, 'total rounds', 1);
  const previous = state.extendedActions?.[id];
  if (previous && previous.totalRounds !== totalRounds) throw new Error('Cannot change multi-round duration mid-action');
  if (previous?.completed) return { state, result: { allowed: false, reason: 'Already completed' } };
  const spent = spendAction(state, 'full', { preActionCheck });
  if (!spent.result.allowed) return spent;
  const next = spent.state;
  next.extendedActions ??= {};
  const progress = (previous?.progress ?? 0) + 1;
  next.extendedActions[id] = { totalRounds, progress, completed: progress >= totalRounds };
  return { state: next, result: { allowed: true, id, ...next.extendedActions[id] } };
}

export function checkBeforeAction(state, { dc, dice } = {}) {
  const life = lifeStatus(state);
  if (life.state !== 'B-check') return { state, result: { required: false, allowed: life.state === 'awake' } };
  if (dc === undefined) throw new Error('PHB does not specify this B-only check DC; supply GM DC');
  const roll = check(state, { attribute: '力量', dc, dice });
  if (roll.success) return { state, result: { required: true, allowed: true, check: roll } };
  const next = clone(state);
  next.health.coma = true;
  return { state: next, result: { required: true, allowed: false, check: roll } };
}

function validateHealth(h) {
  for (const key of ['intact', 'B', 'L', 'A', 'temp']) integer(h[key] ?? 0, `health.${key}`);
}
export function applyWounds(state, wounds) {
  const next = clone(state);
  validateHealth(next.health);
  const changes = [];
  let unapplied = 0;
  for (const severity of SEVERITIES) {
    const count = integer(wounds[severity] ?? 0, `${severity} damage`);
    for (let i = 0; i < count; i++) {
      const h = next.health;
      let from, to;
      if (h.intact) { from = 'intact'; to = severity; }
      else if (severity === 'B' && h.B) { from = 'B'; to = 'L'; }
      else if (h.B) { from = 'B'; to = 'A'; }
      else if (h.L) { from = 'L'; to = 'A'; }
      else { unapplied++; continue; }
      h[from]--; h[to]++;
      changes.push({ from, to, severity });
    }
  }
  if (changes.length && next.health.intact === 0 && next.health.A > 0) next.health.deteriorationStopped = false;
  return { state: next, result: { changes, unapplied, life: lifeStatus(next) } };
}

export function advanceDeterioration(state, { from } = {}) {
  const life = lifeStatus(state);
  if (!life.deteriorating) return { state, result: { changed: false, life } };
  const h = state.health;
  const available = ['B', 'L'].filter(key => h[key] > 0);
  if (available.length > 1 && !from) throw new Error('PHB gives no B/L deterioration priority; supply from');
  const selected = from ?? available[0];
  if (!available.includes(selected)) throw new RangeError('Selected non-A wound slot unavailable');
  const next = clone(state);
  next.health[selected]--; next.health.A++;
  return { state: next, result: { changed: true, from: selected, to: 'A', life: lifeStatus(next) } };
}

export function firstAid(healer, patient, { dice, eligible = true } = {}) {
  if (!lifeStatus(patient).deteriorating) return { healer, patient, result: { allowed: false, reason: 'No active A deterioration' } };
  if (healer === patient || healer.id !== undefined && healer.id === patient.id)
    return { healer, patient, result: { allowed: false, reason: 'PHB first aid requires another person' } };
  if (!eligible) return { healer, patient, result: { allowed: false, reason: 'Healer or access ineligible' } };
  const action = spendAction(healer, 'full');
  if (!action.result.allowed) return { healer, patient, result: action.result };
  const roll = check(healer, { attribute: '敏捷', skill: '医学', dc: 1, dice });
  const nextPatient = clone(patient);
  if (roll.success) nextPatient.health.deteriorationStopped = true;
  return { healer: action.state, patient: nextPatient,
    result: { allowed: true, success: roll.success, check: roll, life: lifeStatus(nextPatient) } };
}

function applies(source, damage) {
  if (source.appliesTo && !source.appliesTo.includes(damage.kind) && !source.appliesTo.includes(damage.energyType)) return false;
  if (source.kind === 'dr') return damage.kind === 'physical';
  if (source.kind === 'energyResistance') return damage.kind === 'energy'
    && (source.energyType === damage.energyType || source.energyType === 'all');
  return true;
}
function valueForStage(sources, kind, damage) {
  const matches = sources.filter(s => s.kind === kind && applies(s, damage));
  if (!matches.length) return 0;
  if (kind === 'dr' || kind === 'energyResistance')
    return Math.max(0, ...matches.filter(s => s.stacking !== 'add').map(s => s.value))
      + matches.filter(s => s.stacking === 'add').reduce((n, s) => n + s.value, 0);
  if (matches.length > 1 && !matches.slice(1).every(s => s.stacking === 'add'))
    throw new Error(`Multiple ${kind} sources require explicit stacking`);
  return matches.reduce((n, s) => n + (s.value ?? 0), 0);
}

// One ordinary damage segment. Special multi-segment, bypass, object rules are not inferred.
export function resolveDamage(target, damage, sources = []) {
  const amount = integer(damage.amount, 'damage amount');
  if (!SEVERITIES.includes(damage.severity)) throw new RangeError('Damage severity must be B, L or A');
  if (!['physical', 'energy'].includes(damage.kind)) throw new RangeError('P0 damage supports physical or energy only');
  if (damage.kind === 'energy' && !damage.energyType) throw new Error('Energy damage needs energyType');
  const trace = [];
  const immune = sources.some(s => s.kind === 'immunity' && applies(s, damage));
  let remaining = immune ? 0 : amount;
  trace.push({ phase: 'B', step: 'immunity', before: amount, after: remaining });
  for (const kind of ['reduce', 'ignore', 'hardness', 'absorb', 'dr', 'energyResistance', 'cancel']) {
    const value = valueForStage(sources, kind, damage);
    const before = remaining;
    remaining = Math.max(0, remaining - value);
    trace.push({ phase: 'B', step: kind, value, before, after: remaining });
  }
  const causedDamage = remaining > 0;
  const next = clone(target);
  const tempAbsorbed = Math.min(remaining, next.health.temp ?? 0);
  next.health.temp -= tempAbsorbed;
  remaining -= tempAbsorbed;
  trace.push({ phase: 'C', step: 'temporaryHP', absorbed: tempAbsorbed, after: remaining });
  const downgrade = sources.filter(s => s.kind === 'downgrade' && applies(s, damage));
  if (downgrade.length > 1) throw new Error('Multiple downgrade sources require item-specific rule');
  const index = Math.max(0, SEVERITIES.indexOf(damage.severity) - (downgrade[0]?.steps ?? 0));
  const finalSeverity = SEVERITIES[index];
  trace.push({ phase: 'C', step: 'downgrade', from: damage.severity, to: finalSeverity });
  const wounds = applyWounds(next, { [finalSeverity]: remaining });
  return { state: wounds.state, result: { causedDamage, actualDamage: wounds.result.changes.length,
    finalSeverity, wounds: wounds.result, trace } };
}

const WEAPON_SKILL = { natural: '肉搏', melee: '白刃', thrown: '运动', bow: '弓箭', gun: '枪械' };
export function resolveAttack(attacker, target, input) {
  const weapon = input.weapon;
  if (!WEAPON_SKILL[weapon.type]) throw new RangeError('Unsupported ordinary weapon type');
  const action = spendAction(attacker, input.action ?? 'attack', { behavior: 'attack', ...input.actionContext });
  if (!action.result.allowed) return { attacker, target, result: { allowed: false, reason: action.result.reason } };
  const attribute = input.attribute ?? (['thrown', 'bow', 'gun'].includes(weapon.type) ? '敏捷' : '力量');
  const main = weapon.skill ?? WEAPON_SKILL[weapon.type];
  const skill = effectiveSkill(attacker, main, weapon.sub);
  const baseDefense = target.derivedOverrides?.includes('defense')
    ? target.derived.defense : Math.min(attrValue(target, '敏捷'), attrValue(target, '感知'));
  const defense = input.targetDefense ?? Math.max(0, baseDefense - lifeStatus(target).woundPenalty);
  const distancePenalty = input.distancePenalty ?? 0;
  const dp = attrValue(attacker, attribute) + skill.level + weapon.damage - defense
    - distancePenalty + (input.modifier ?? 0) - lifeStatus(attacker).woundPenalty;
  let cap;
  if (weapon.type === 'natural' || weapon.type === 'melee')
    cap = weapon.damage + skill.level + (attribute === '力量' ? attrValue(attacker, '力量') : 0);
  else if (weapon.type === 'thrown') cap = weapon.damage + skill.level + attrValue(attacker, '力量');
  else if (weapon.type === 'bow') cap = weapon.damage * 2 + skill.level + integer(weapon.strengthRequirement, 'bow strengthRequirement');
  else cap = weapon.damage * 2 + skill.level;
  // Weapon range and minimum-strength eligibility are supplied by the caller; no invented range tables.
  if (input.eligible === false) return { attacker, target, result: { allowed: false, reason: input.reason ?? 'Attack ineligible' } };
  const roll = rollPool(dp, input.dice);
  const autoSuccesses = attrAuto(attacker, attribute) + skill.auto + (input.autoBonus ?? 0);
  const afterDefense = Math.max(0, roll.rolledSuccesses + autoSuccesses - (input.defenderExtraSuccesses ?? 0));
  const reExtra = roll.rolledSuccesses > 0 && afterDefense > 0 ? (input.reExtraSuccesses ?? 0) : 0;
  const attackSuccesses = afterDefense + reExtra;
  const adjusted = Math.max(0, Math.min(cap, attackSuccesses) - (input.attackDamageReduction ?? 0));
  const hit = adjusted > 0;
  const attackTrace = [
    { phase: 'A', step: 'dp', value: dp, defense },
    { phase: 'A', step: 'successes', rolled: roll.rolledSuccesses, auto: autoSuccesses,
      defenderExtra: input.defenderExtraSuccesses ?? 0, attackerReExtra: reExtra, value: attackSuccesses },
    { phase: 'A', step: 'capAndAdjustment', cap, value: adjusted, hit },
  ];
  if (!hit) return { attacker: action.state, target, result: { allowed: true, hit: false,
    roll, cap, attackTrace, actualDamage: 0 } };
  const damage = resolveDamage(target, { amount: adjusted, severity: weapon.severity,
    kind: weapon.damageKind ?? 'physical', energyType: weapon.energyType }, input.defenses ?? []);
  return { attacker: action.state, target: damage.state,
    result: { allowed: true, hit: true, roll, cap, attackTrace,
      causedDamage: damage.result.causedDamage, actualDamage: damage.result.actualDamage,
      damage: damage.result } };
}

export function applyStatus(state, { type, source, points, dice, sub, eligible = true,
  catastrophicAllowed = false, attributeDamageAllocation } = {}) {
  if (!eligible) return { state, result: { applied: false, reason: 'Source ineligible or immune' } };
  const names = type === '剧痛' ? ['力量', '意志'] : STATUS_ATTRIBUTES[type];
  if (!names) throw new RangeError('Status requires a separately integrated source rule');
  const resistingAttribute = names.reduce((best, name) => attrValue(state, name) < attrValue(state, best) ? name : best);
  const resistance = check(state, { poolBase: attrValue(state, resistingAttribute),
    attributeAutoOverride: attrAuto(state, resistingAttribute), skill: '求生', sub, dice });
  const remaining = Math.max(0, integer(points, 'status points') - resistance.total);
  const priorExcess = statusLevel(state, type).excess ?? 0;
  const next = clone(state);
  if (remaining) next.statuses.push({ type, source, points: remaining });
  const level = statusLevel(next, type);
  const newAttributeDamage = catastrophicAllowed ? Math.max(0, (level.excess ?? 0) - priorExcess) : 0;
  if (newAttributeDamage) {
    const allowed = type === '剧痛' ? ['力量', '意志'] : type === '疲乏' ? ['力量', '敏捷'] : null;
    if (!allowed) throw new Error('Catastrophic effect needs item-specific rules');
    if (!attributeDamageAllocation || Object.values(attributeDamageAllocation).reduce((n, v) => n + v, 0) !== newAttributeDamage
      || Object.keys(attributeDamageAllocation).some(name => !allowed.includes(name)))
      throw new Error(`Allocate exactly ${newAttributeDamage} attribute damage across ${allowed.join('/')}`);
    for (const [name, value] of Object.entries(attributeDamageAllocation))
      next.attributeDamage[name] = (next.attributeDamage[name] ?? 0) + integer(value, 'attribute damage');
  }
  return { state: next, result: { applied: remaining > 0, remaining, resistance,
    level, attributeDamage: newAttributeDamage } };
}

export function recover(state, event) {
  if (lifeStatus(state).state === 'dead') return { state, result: { allowed: false, reason: 'Dead; natural recovery unavailable' } };
  const next = clone(state);
  const changes = [];
  const heal = severity => {
    if (next.health[severity] > 0) { next.health[severity]--; next.health.intact++; changes.push(`${severity}->intact`); }
  };
  const will = amount => { const before = next.will.current; next.will.current = Math.min(next.will.max, before + amount); changes.push({ will: next.will.current - before }); };
  if (event.type === 'shortRest') {
    heal('B');
    if (event.statusIndex !== undefined) {
      const s = next.statuses[event.statusIndex];
      if (!s || s.restBlocked) throw new Error('Status unavailable for rest resistance');
      const names = s.type === '剧痛' ? ['力量', '意志'] : STATUS_ATTRIBUTES[s.type];
      if (!names) throw new Error('Status needs source-specific recovery');
      const resistingAttribute = names.reduce((best, name) => attrValue(next, name) < attrValue(next, best) ? name : best);
      const resist = check(next, { poolBase: attrValue(next, resistingAttribute),
        attributeAutoOverride: attrAuto(next, resistingAttribute), skill: '求生', sub: event.sub, dice: event.dice });
      s.points = Math.max(0, s.points - resist.total);
      changes.push({ status: s.type, remaining: s.points, resistance: resist.total });
    }
  } else if (event.type === 'longRest') {
    will(1);
    if (event.attribute && next.attributeDamage[event.attribute] > 0) {
      next.attributeDamage[event.attribute]--; changes.push({ attributeDamageHealed: event.attribute });
    }
    if (event.statusIndex !== undefined) {
      const s = next.statuses[event.statusIndex];
      if (!s || s.restBlocked) throw new Error('Status unavailable for rest recovery');
      const names = s.type === '剧痛' ? ['力量', '意志'] : STATUS_ATTRIBUTES[s.type];
      if (!names) throw new Error('Status needs source-specific recovery');
      const amount = Math.min(...names.map(n => attrValue(next, n)));
      s.points = Math.max(0, s.points - amount);
      changes.push({ status: s.type, remaining: s.points });
    }
  } else if (event.type === 'twoDays') {
    if (event.longRests < 2) throw new Error('L recovery requires two days and two long rests');
    heal('L');
  } else if (event.type === 'sevenDays') {
    if (event.longRests < 7) throw new Error('A recovery requires seven days and seven long rests');
    heal('A');
  } else if (event.type === 'node') will(1);
  else if (event.type === 'chapter') will(next.will.max);
  else throw new RangeError('Unknown recovery event');
  next.statuses = next.statuses.filter(s => s.points > 0);
  if (next.health.intact > 0) { next.health.coma = false; next.health.deteriorationStopped = false; }
  return { state: next, result: { changes, life: lifeStatus(next) } };
}

// A cost must come from the already integrated action or ability; this function sets no price.
export function spendWill(state, cost) {
  integer(cost, 'will cost');
  if (state.will.current < cost) return { state, result: { allowed: false, reason: 'Insufficient will', cost } };
  const next = clone(state);
  next.will.current -= cost;
  return { state: next, result: { allowed: true, cost, remaining: next.will.current } };
}

export function changeDefinedResource(state, name, delta) {
  if (!Number.isInteger(delta)) throw new TypeError('Resource delta must be an integer');
  const original = state.resources?.[name];
  if (!original || !Number.isInteger(original.current) || !Number.isInteger(original.max))
    throw new Error('Resource must already be defined with current and max');
  const current = original.current + delta;
  if (current < 0 || current > original.max) return { state, result: { allowed: false, reason: 'Resource bounds', name, delta } };
  const next = clone(state);
  next.resources[name].current = current;
  return { state: next, result: { allowed: true, name, delta, current } };
}

export function upgradeAttribute(state, name, { eligible = true } = {}) {
  requireAttribute(name);
  if (!eligible) return { state, result: { allowed: false, reason: 'Learning requirements not met' } };
  const nextLevel = baseAttribute(state, name) + 1;
  const milestone = nextLevel >= 6 && (nextLevel - 1) % 5 === 0;
  const cost = milestone ? 12 : 6;
  if (state.xp < cost) return { state, result: { allowed: false, reason: 'Insufficient XP', cost } };
  const next = clone(state);
  next.xp -= cost;
  next.attributes[name] = nextLevel;
  if (milestone) {
    next.attributeAuto[name] = baseAuto(state, name) + 1;
    next.greatPowersAvailable = (next.greatPowersAvailable ?? 0) + 1;
  }
  const oldMax = next.derived.hpMax;
  const a = next.attributes;
  const defaults = {
    hpMax: (next.size ?? 0) + a.力量 + 2 * baseAuto(next, '力量') + (next.hpBonus ?? 0),
    defense: Math.min(a.敏捷, a.感知), speed: a.力量 + a.敏捷 + (next.size ?? 0),
    initiative: a.敏捷 + a.风度, willMax: a.意志 + a.风度,
    vision: 10 * a.感知 + 20 * baseAuto(next, '感知'),
    ...(next.derived.reflex === undefined ? {} : { reflex: a.敏捷 + effectiveSkill(next, '运动').level }),
    ...(next.derived.fortitude === undefined ? {} : { fortitude: a.力量 + effectiveSkill(next, '求生').level }),
  };
  for (const [key, value] of Object.entries(defaults))
    if (!next.derivedOverrides?.includes(key))
      next.derived[key] = (next.derivedBaseOverrides?.[key] ?? value) + (next.derivedBonuses?.[key] ?? 0);
  if (next.derived.hpMax > oldMax) next.health.intact += next.derived.hpMax - oldMax;
  if (!next.derivedOverrides?.includes('willMax')) next.will.max = next.derived.willMax;
  return { state: next, result: { allowed: true, cost, level: nextLevel, autoGained: milestone ? 1 : 0,
    greatPowerChoiceGained: milestone ? 1 : 0 } };
}

export function upgradeSkill(state, main, sub, { eligible = true } = {}) {
  if (!eligible) return { state, result: { allowed: false, reason: 'Learning requirements not met' } };
  const entry = state.skills?.[main] ?? {};
  const old = sub ? entry.subs?.[sub] ?? {} : entry;
  const nextLevel = (old.level ?? 0) + 1;
  if (!sub && nextLevel > 5) return { state, result: { allowed: false, reason: 'Main skill cap 5' } };
  const milestone = nextLevel % 5 === 0;
  const cost = milestone ? 9 : 3;
  if (state.xp < cost) return { state, result: { allowed: false, reason: 'Insufficient XP', cost } };
  const next = clone(state);
  next.xp -= cost;
  next.skills[main] ??= { level: 0, subs: {} };
  const dest = sub ? (next.skills[main].subs ??= {}, next.skills[main].subs[sub] ??= { level: 0 }) : next.skills[main];
  dest.level = nextLevel;
  if (milestone) dest.auto = (old.auto ?? skillAuto(old.level ?? 0)) + 1;
  if (!sub && main === '运动' && next.derived.reflex !== undefined &&
      !next.derivedOverrides?.includes('reflex'))
    next.derived.reflex = (next.derivedBaseOverrides?.reflex ??
      (next.attributes.敏捷 + effectiveSkill(next, '运动').level)) +
      (next.derivedBonuses?.reflex ?? 0);
  if (!sub && main === '求生' && next.derived.fortitude !== undefined &&
      !next.derivedOverrides?.includes('fortitude'))
    next.derived.fortitude = (next.derivedBaseOverrides?.fortitude ??
      (next.attributes.力量 + effectiveSkill(next, '求生').level)) +
      (next.derivedBonuses?.fortitude ?? 0);
  return { state: next, result: { allowed: true, cost, level: nextLevel,
    autoGained: milestone ? 1 : 0, layer: sub ? 'sub' : 'main' } };
}

const LEGENDARY_INT_XP = [0, 1, 2, 4, 6, 8];
export function settleNode(state, { id, xp = 0, settlement = false, legendaryIntelligence } = {}) {
  if (!id) throw new Error('Node or settlement id is required to avoid duplicate credit');
  integer(xp, 'node XP');
  const next = clone(state);
  next.nodeLedger ??= [];
  if (next.nodeLedger.some(e => e.id === id)) return { state, result: { applied: false, reason: 'Already settled' } };
  const level = legendaryIntelligence ?? next.legendaryIntelligence ?? 0;
  integer(level, 'legendary intelligence');
  if (level > 5) throw new RangeError('PHB has no legendary intelligence XP value above 5');
  const bonus = settlement ? LEGENDARY_INT_XP[level] : 0;
  next.xp += xp + bonus;
  const beforeWill = next.will.current;
  next.will.current = Math.min(next.will.max, next.will.current + (settlement ? 0 : 1));
  next.nodeLedger.push({ id, xp, settlement, bonus });
  return { state: next, result: { applied: true, xp, bonus, willRecovered: next.will.current - beforeWill,
    total: xp + bonus } };
}
