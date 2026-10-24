import { ATTRIBUTES, createCharacter, effectiveSkill } from '../rules_engine/core.mjs';

const DERIVED_FIELDS = new Set(['hpMax', 'defense', 'speed', 'initiative', 'willMax',
  'vision', 'reflex', 'fortitude']);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const whole = value => Number.isInteger(value) && value >= 0;
const copy = value => structuredClone(value);

function validate(definition, initial, report) {
  if (!record(definition)) { report.errors.push('definition must be a JSON object'); return; }
  for (const field of ['id', 'name', 'period'])
    if (typeof definition[field] !== 'string' || !definition[field].trim()) report.missing.push(field);
  if (!Array.isArray(definition.sources) || definition.sources.length === 0)
    report.missing.push('sources');
  if (!whole(definition.size)) report.missing.push('size');
  if (!record(definition.attributes)) report.missing.push('attributes');
  for (const name of Object.keys(definition.attributes ?? {}))
    if (!ATTRIBUTES.includes(name)) report.errors.push(`unknown 901 attribute: ${name}`);
  for (const attribute of ATTRIBUTES) {
    const value = definition.attributes?.[attribute];
    if (!whole(value)) report.missing.push(`attributes.${attribute}`);
  }
  if (!record(definition.skills)) report.missing.push('skills');
  if (definition.resources !== undefined && !Array.isArray(definition.resources))
    report.errors.push('resources must be an array');
  if (definition.abilities !== undefined && !Array.isArray(definition.abilities))
    report.errors.push('abilities must be an array');
  for (const [main, entry] of Object.entries(definition.skills ?? {})) {
    if (!record(entry) || !whole(entry.level)) report.missing.push(`skills.${main}.level`);
    else if (entry.level > 5) report.errors.push(`${main} main skill exceeds 5`);
    if (entry?.subs !== undefined && !record(entry.subs)) report.errors.push(`${main}.subs must be an object`);
    for (const [sub, value] of Object.entries(entry?.subs ?? {})) {
      if (!record(value) || !whole(value.level)) report.missing.push(`skills.${main}.subs.${sub}.level`);
      if (typeof value?.scope !== 'string' || !value.scope.trim())
        report.missing.push(`skills.${main}.subs.${sub}.scope`);
    }
  }
  for (const main of ['运动', '求生'])
    if (!whole(definition.skills?.[main]?.level)) report.missing.push(`skills.${main}.level`);
  if (!record(initial)) { report.errors.push('initial must be a JSON object'); return; }
  if (initial.health !== 'healthy' && !record(initial.health)) report.missing.push('initial.health');
  if (record(initial.health)) {
    if (['intact', 'B', 'L', 'A', 'temp'].some(key => !whole(initial.health[key])) ||
        typeof initial.health.coma !== 'boolean' ||
        typeof initial.health.deteriorationStopped !== 'boolean')
      report.errors.push('initial.health needs complete nonnegative slots and flags');
  }
  if (!whole(initial.willCurrent)) report.missing.push('initial.willCurrent');
  if (initial.turn !== 'ready' && !record(initial.turn)) report.missing.push('initial.turn');
  if (record(initial.turn) &&
      (!['ready', 'active', 'ended', 'skipped'].includes(initial.turn.phase) ||
       ['standard', 'move', 'swift', 'reactionLockEnds'].some(key => !whole(initial.turn[key])) ||
       ['reactionLock', 'responseDebt', 'opportunityUsed'].some(key =>
         typeof initial.turn[key] !== 'boolean')))
    report.errors.push('initial.turn needs complete PHB action usage');
  if (initial.xp !== undefined && !whole(initial.xp)) report.errors.push('initial.xp must be nonnegative integer');
  for (const [field, spec] of Object.entries(definition.overrides?.derived ?? {})) {
    if (!DERIVED_FIELDS.has(field) || !record(spec) || !['base', 'final'].includes(spec.mode) ||
        !whole(spec.value) || typeof spec.source !== 'string' || !spec.source.trim())
      report.errors.push(`invalid derived override: ${field}`);
  }
}

function resourceEffects(definition, initial, report) {
  const bonuses = {};
  let hpBonus = 0;
  const seen = new Set();
  const seenEffects = new Set();
  const pools = {};
  for (const resource of definition.resources ?? []) {
    if (!record(resource) || typeof resource.id !== 'string' || !resource.id || seen.has(resource.id)) {
      report.errors.push(`duplicate or invalid resource ID: ${resource?.id}`); continue;
    }
    seen.add(resource.id);
    if (typeof resource.source !== 'string' || !resource.source || typeof resource.adoption !== 'string' ||
        typeof resource.engineSupported !== 'boolean') {
      report.errors.push(`resource ${resource.id} needs source, adoption, engineSupported`); continue;
    }
    const supported = ['ADOPTED', 'CONFIRMED'].includes(resource.adoption) && resource.engineSupported;
    if (!supported) { report.unsupported.push(copy(resource)); continue; }
    if (resource.pool) {
      if (!whole(resource.pool.max)) report.errors.push(`resource ${resource.id} needs a numeric pool max`);
      const current = initial.resourceBalances?.[resource.id];
      if (!whole(current)) report.missing.push(`initial.resourceBalances.${resource.id}`);
      else if (current > resource.pool.max) report.errors.push(`resource ${resource.id} balance exceeds max`);
      else pools[resource.id] = { current, max: resource.pool.max };
    }
    const effectIds = new Set();
    for (const effect of resource.effects ?? []) {
      if (!record(effect) || typeof effect.id !== 'string' || !effect.id || effectIds.has(effect.id)) {
        report.errors.push(`resource ${resource.id} has duplicate or invalid effect ID`); continue;
      }
      effectIds.add(effect.id);
      const sourceEffect = `${resource.source}/${effect.id}`;
      if (seenEffects.has(sourceEffect)) {
        report.errors.push(`duplicate source effect: ${sourceEffect}`); continue;
      }
      seenEffects.add(sourceEffect);
      if (effect.kind !== 'hpBonus' &&
          !(effect.kind === 'derivedBonus' && DERIVED_FIELDS.has(effect.field))) {
        report.unsupported.push({ id: resource.id, source: resource.source, effect: copy(effect) });
        continue;
      }
      if (!whole(effect.value)) { report.errors.push(`resource ${resource.id}/${effect.id} needs numeric value`); continue; }
      if (effect.kind === 'hpBonus') hpBonus += effect.value;
      else if (effect.kind === 'derivedBonus' && DERIVED_FIELDS.has(effect.field))
        bonuses[effect.field] = (bonuses[effect.field] ?? 0) + effect.value;
    }
  }
  for (const ability of definition.abilities ?? [])
    report.unsupported.push(copy(ability));
  for (const equipment of definition.equipment ?? [])
    if (equipment.engineSupportStatus === 'UNSUPPORTED')
      report.unsupported.push(copy(equipment));
  return { bonuses, hpBonus, pools };
}

// New-save construction only. The caller keeps existing branch state unchanged.
export function buildCharacter(definition, initial = {}, { existingState } = {}) {
  const report = { errors: [], missing: [], unsupported: [], overrides: [], calculated: [] };
  if (existingState !== undefined && existingState !== null)
    report.errors.push('existing state must not be reinitialized');
  validate(definition, initial, report);
  if (report.errors.length || report.missing.length) return { ok: false, report };
  const { bonuses, hpBonus, pools } = resourceEffects(definition, initial, report);
  if (report.errors.length || report.missing.length) return { ok: false, report };
  const input = {
    id: definition.id, name: definition.name, period: definition.period, sources: copy(definition.sources),
    size: definition.size, attributes: copy(definition.attributes), skills: copy(definition.skills),
    equipment: copy(definition.equipment ?? []), abilities: copy(definition.abilities ?? []),
    resourceRefs: (definition.resources ?? []).map(resource => {
      const ref = { id: resource.id, source: resource.source, adoption: resource.adoption };
      for (const field of ['adoptionScope', 'adoptionSource', 'acquisitionSource',
        'prerequisiteStatus', 'instance'])
        if (resource[field] !== undefined) ref[field] = copy(resource[field]);
      return ref;
    }), power_reference: copy(definition.power_reference ?? null),
    hpBonus: hpBonus, resources: pools, xp: initial.xp ?? 0,
    statuses: copy(initial.statuses ?? []), attributeDamage: copy(initial.attributeDamage ?? {}),
    greatPowersAvailable: initial.greatPowersAvailable ?? definition.greatPowersAvailable ?? 0,
  };
  if (definition.attributeAuto) {
    input.attributeAuto = {};
    for (const [name, spec] of Object.entries(definition.attributeAuto)) {
      if (!ATTRIBUTES.includes(name) || !record(spec) || !whole(spec.value) || !spec.source)
        report.errors.push(`invalid attribute auto override: ${name}`);
      else { input.attributeAuto[name] = spec.value; report.overrides.push({ field: `attributeAuto.${name}`, source: spec.source }); }
    }
  }
  for (const [main, entry] of Object.entries(input.skills)) {
    for (const [label, skill] of [[main, entry], ...Object.entries(entry.subs ?? {}).map(([sub, s]) => [`${main}.${sub}`, s])]) {
      if (skill.auto === undefined) continue;
      const spec = skill.auto;
      if (!record(spec) || !whole(spec.value) || !spec.source)
        report.errors.push(`invalid skill auto override: ${label}`);
      else { skill.auto = spec.value; report.overrides.push({ field: `skills.${label}.auto`, source: spec.source }); }
    }
  }
  if (report.errors.length) return { ok: false, report };
  let state = createCharacter(input);
  state.derived.reflex = state.attributes.敏捷 + effectiveSkill(state, '运动').level;
  state.derived.fortitude = state.attributes.力量 + effectiveSkill(state, '求生').level;
  const overrideFields = new Set();
  state.derivedBaseOverrides = {};
  state.derivedBonuses = {};
  for (const field of DERIVED_FIELDS) {
    const spec = definition.overrides?.derived?.[field];
    const bonus = field === 'hpMax' ? hpBonus : (bonuses[field] ?? 0);
    if (spec) {
      report.overrides.push({ field, mode: spec.mode, source: spec.source });
      state.derived[field] = spec.mode === 'final' ? spec.value : spec.value + bonus;
      if (spec.mode === 'final') overrideFields.add(field);
      else state.derivedBaseOverrides[field] = spec.value;
      if (field === 'hpMax') state.hpBonus = 0; // final capacity already includes its effects
    } else if (bonus && field !== 'hpMax') {
      state.derived[field] += bonus;
    }
    if ((field !== 'hpMax' || spec?.mode === 'base') && bonus)
      state.derivedBonuses[field] = bonus;
    report.calculated.push(field);
  }
  state.derivedOverrides = [...overrideFields];
  const health = initial.health === 'healthy'
    ? { intact: state.derived.hpMax, B: 0, L: 0, A: 0, temp: 0, coma: false,
        deteriorationStopped: false }
    : copy(initial.health);
  if (['intact', 'B', 'L', 'A'].some(field => !whole(health[field])) ||
      health.intact + health.B + health.L + health.A !== state.derived.hpMax)
    report.errors.push('initial.health slots must equal derived.hpMax');
  if (initial.willCurrent > state.derived.willMax)
    report.errors.push('initial.willCurrent exceeds willMax');
  if (report.errors.length) return { ok: false, report };
  state.health = health;
  state.will = { current: initial.willCurrent, max: state.derived.willMax };
  if (initial.turn !== 'ready') state.turn = copy(initial.turn);
  state.buildProvenance = copy(report.overrides);
  return { ok: true, state, report };
}

// Use before a core operation when an omitted skill must not silently become level 0.
export function requireKnownSkill(state, main, sub) {
  const entry = state.skills?.[main];
  if (!entry || !whole(entry.level)) throw new Error(`unknown main skill: ${main}`);
  if (sub !== undefined && (!entry.subs?.[sub] || !whole(entry.subs[sub].level)))
    throw new Error(`unknown subskill: ${main}.${sub}`);
  return { main, sub };
}

export function requireOperationSupport(report, resourceIds) {
  const blocked = resourceIds.filter(id => report.unsupported.some(item => item.id === id));
  if (blocked.length) throw new Error(`unsupported resources for this operation: ${blocked.join(', ')}`);
}
