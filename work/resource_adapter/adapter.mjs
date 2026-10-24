import { effectiveSkill } from '../rules_engine/core.mjs';
import { requireKnownSkill } from '../character_builder/builder.mjs';

const copy = value => structuredClone(value);
const adopted = status => ['ADOPTED', 'CONFIRMED'].includes(status);
const AP_ACTION_PRICES = Object.freeze({
  2: ['swift'], 4: ['move'], 6: ['standard'], 8: ['standard', 'swift'],
});

// Price translation only. It does not grant or execute a resource ability.
export function translateApActionPrice(ap) {
  if (!Number.isInteger(ap) || !AP_ACTION_PRICES[ap])
    throw new RangeError(`AP action price needs a specific adaptation: ${ap}`);
  return { originalAp: ap, phbActions: [...AP_ACTION_PRICES[ap]] };
}

function prerequisitesFor(definition, entry, grant) {
  const p = entry.prerequisites ?? {};
  const failures = [];
  const pending = [];
  for (const [name, minimum] of Object.entries(p.attributes ?? {}))
    if ((definition.attributes?.[name] ?? 0) < minimum)
      failures.push(`${name} ${minimum}`);
  if (p.effectiveSkill) {
    const { main, minimum, matchingSubId, matchingScopeId } = p.effectiveSkill;
    const mainLevel = effectiveSkill(definition, main).level;
    const sub = definition.skills?.[main]?.subs?.[matchingSubId];
    const matchingLevel = sub?.scopeId === matchingScopeId
      ? effectiveSkill(definition, main, matchingSubId).level : mainLevel;
    if (matchingLevel < minimum) failures.push(`${main} ${minimum}`);
  }
  if (p.professionalSubskill) {
    const { main, sub, scopeId, minimum } = p.professionalSubskill;
    const spec = definition.skills?.[main]?.subs?.[sub];
    if (spec?.scopeId !== scopeId || (spec.level ?? 0) < minimum)
      failures.push(`${main}.${sub} ${minimum}`);
  }
  if (p.priorRank) {
    const rank = grant?.priorRanks?.[p.priorRank.featId];
    if (!Number.isInteger(rank)) pending.push(`${p.priorRank.featId} rank ${p.priorRank.minimum}`);
    else if (rank < p.priorRank.minimum)
      failures.push(`${p.priorRank.featId} rank ${p.priorRank.minimum}`);
  }
  if (!grant?.source) pending.push('character acquisition record');
  return { status: failures.length ? 'FAILED' : pending.length ? 'PENDING' : 'CHECKED',
    reasons: [...failures, ...pending] };
}

// The caller supplies a trusted catalog and character grants before any selection call.
// Demo grants are isolated and cannot be consumed by a production adapter.
export function createResourceAdapter(catalog, { mode = 'production', grants = [],
  adoptionRecords = [] } = {}) {
  if (!Array.isArray(catalog) || !['production', 'demo'].includes(mode) ||
      !Array.isArray(grants) || !Array.isArray(adoptionRecords))
    throw new TypeError('catalog, mode, grants or adoptionRecords invalid');
  const entries = copy(catalog);
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  if (byId.size !== entries.length) throw new Error('duplicate catalog resource ID');
  const byGrant = new Map();
  for (const grant of copy(grants)) {
    if (!grant.characterId || !grant.resourceId || !grant.source)
      throw new Error('grant needs characterId, resourceId and source');
    const key = `${grant.characterId}/${grant.resourceId}`;
    if (byGrant.has(key)) throw new Error(`duplicate grant: ${key}`);
    byGrant.set(key, grant);
  }
  const byAdoption = new Map();
  for (const record of copy(adoptionRecords)) {
    if (!record.resourceId || byAdoption.has(record.resourceId))
      throw new Error(`duplicate or invalid adoption record: ${record.resourceId}`);
    byAdoption.set(record.resourceId, record);
  }
  const grantFor = (characterId, resourceId) => byGrant.get(`${characterId}/${resourceId}`);
  const getResource = id => byId.has(id) ? copy(byId.get(id)) : undefined;
  const adoptionFor = resourceId => byAdoption.get(resourceId);
  function actionPrice(id) {
    const entry = byId.get(id);
    if (!entry) throw new Error(`unknown resource: ${id}`);
    return translateApActionPrice(entry.parameters?.originalAp);
  }
  const allowed = (entry, grant) => Boolean(grant) &&
    (mode === 'demo' || adopted(adoptionFor(entry.id)?.status) &&
      typeof adoptionFor(entry.id)?.source === 'string' &&
      adoptionFor(entry.id).source.trim() !== '');

  function selectResources(definition, ids) {
    if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string'))
      throw new TypeError('selectResources accepts resource IDs only');
    const selected = copy(definition);
    if (selected.resources?.length) throw new Error('duplicate or pre-existing resources in definition');
    selected.resources = [];
    const seen = new Set();
    for (const id of ids) {
      const entry = getResource(id);
      if (!entry) throw new Error(`unknown resource: ${id}`);
      if (seen.has(id)) throw new Error(`duplicate resource: ${id}`);
      seen.add(id);
      const grant = grantFor(selected.id, id);
      const adoptionRecord = adoptionFor(id);
      const prerequisite = prerequisitesFor(selected, entry, grant);
      const authorization = allowed(entry, grant);
      const engineSupported = authorization && entry.engineSupported &&
        (mode === 'demo' || entry.engineSupportStatus === 'SUPPORTED');
      if (engineSupported && prerequisite.status !== 'CHECKED')
        throw new Error(`${id} requires ${prerequisite.reasons.join(', ')}`);
      selected.resources.push({ ...entry,
        adoption: authorization ? (mode === 'demo' ? 'CONFIRMED' : adoptionRecord.status) : 'UNDECIDED',
        engineSupported,
        ...(authorization ? {
          adoptionScope: mode === 'demo' ? 'demo' : '901',
          adoptionSource: mode === 'demo' ? 'isolated demo catalog' : adoptionRecord.source,
          acquisitionSource: grant.source,
          ...(grant.instance ? { instance: copy(grant.instance) } : {}),
        } : {}),
        prerequisiteStatus: prerequisite.status,
        ...(prerequisite.reasons.length ? { prerequisiteReasons: prerequisite.reasons } : {}),
      });
    }
    return selected;
  }

  function selectedResource(state, id) {
    const ref = state.resourceRefs?.find(item => item.id === id);
    if (!ref) throw new Error(`resource not selected: ${id}`);
    const expectedScope = mode === 'demo' ? 'demo' : '901';
    if (ref.adoptionScope !== expectedScope)
      throw new Error(`resource scope mismatch: ${id}`);
    const entry = byId.get(id);
    const grant = grantFor(state.id, id);
    if (!entry || !allowed(entry, grant) || !adopted(ref.adoption) ||
        ref.acquisitionSource !== grant.source)
      throw new Error(`resource adoption or acquisition not verified: ${id}`);
    if (!entry.engineSupported || mode === 'production' && entry.engineSupportStatus !== 'SUPPORTED')
      throw new Error(`unsupported resource: ${id}`);
    return { entry, ref };
  }

  function weaponInput(state, id) {
    const { entry, ref } = selectedResource(state, id);
    if (entry.category !== 'weapon' || id !== 'phb03.weapon.portable-dart')
      throw new Error(`no ordinary weapon input for: ${id}`);
    if (!Number.isInteger(ref.instance?.quantity) || ref.instance.quantity < 1 ||
        ref.instance.held !== true)
      throw new Error(`weapon inventory unavailable: ${id}`);
    const p = entry.parameters;
    requireKnownSkill(state, p.skill);
    const sub = state.skills[p.skill].subs?.[p.sub];
    const hasMatchingSub = sub?.scopeId === 'weapon.dart' && Number.isInteger(sub.level);
    return { resourceId: id, type: p.weaponType, skill: p.skill,
      ...(hasMatchingSub ? { sub: p.sub } : {}), damage: p.damage,
      severity: p.severity, rangeUnit: p.rangeUnitMeters };
  }

  function swordThrustModifier(state, attackInput = {}) {
    if (attackInput.technique !== '刺击') return 0;
    const { entry } = selectedResource(state, 'phb03.feat.sword-thrust.1');
    const weapon = attackInput.weapon;
    const equipped = state.equipment?.find(item => item.id === weapon?.itemId);
    if (!equipped || equipped.equipped !== true || equipped.weaponClass !== '细长直刃剑' ||
        equipped.type !== 'melee' || weapon.type !== equipped.type || weapon.sub !== equipped.sub)
      throw new Error('刺击 requires the same equipped slender straight sword as the attack');
    return entry.parameters.attackDpBonus;
  }

  function checkModifier(state, id, context = {}) {
    const { entry } = selectedResource(state, id);
    if (entry.category !== 'conditional-check')
      throw new Error(`no conditional check modifier for: ${id}`);
    const p = entry.parameters;
    if (context.checkId !== p.checkId ||
        (p.requiredSkill && context.skill !== p.requiredSkill))
      throw new Error(`check context does not match resource: ${id}`);
    if (!Number.isFinite(p.checkDpBonus))
      throw new Error(`invalid check modifier in resource: ${id}`);
    if (p.requiredSkill) requireKnownSkill(state, p.requiredSkill);
    return p.checkDpBonus;
  }

  return { getResource, actionPrice, selectResources, weaponInput, swordThrustModifier,
    checkModifier };
}
