import { buildCharacter } from '../character_builder/builder.mjs';

const copy = value => structuredClone(value);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim() !== '';
const OK_SCOPE = 'BUILDER_PREVIEW_ONLY';
const NEW_FIELDS = new Set(['size', 'attributes', 'skills', 'equipment', 'resourceIds', 'initial']);
const BLUEPRINT_FIELDS = new Set(['identity', 'period', 'narrativeRole', 'combatProfile',
  'powerReference', 'abilityConcepts', 'narrativeSources', 'sourceStatus']);

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (record(value)) return Object.fromEntries(Object.keys(value).sort()
    .map(key => [key, canonical(value[key])]));
  return value;
}
const same = (left, right) => JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));

function rejectExtraFields(value, allowed, path, report) {
  if (!record(value)) return;
  for (const key of Object.keys(value))
    if (!allowed.has(key)) report.errors.push(`${path}.${key} is not permitted`);
}

function numericStatuses(value, prefix = '', output = {}) {
  if (typeof value === 'number') output[prefix] = 'PROPOSED';
  else if (Array.isArray(value)) value.forEach((item, index) =>
    numericStatuses(item, `${prefix}[${index}]`, output));
  else if (record(value)) for (const [key, item] of Object.entries(value))
    numericStatuses(item, prefix ? `${prefix}.${key}` : key, output);
  return output;
}

function validateBlueprint(mode, blueprint, report) {
  if (!record(blueprint)) { report.errors.push('blueprint must be an object'); return; }
  rejectExtraFields(blueprint, BLUEPRINT_FIELDS, 'blueprint', report);
  rejectExtraFields(blueprint.identity, new Set(['id', 'name']), 'identity', report);
  if (!nonempty(blueprint.identity?.id) || !nonempty(blueprint.identity?.name))
    report.missing.push('identity.id/name');
  if (!nonempty(blueprint.period)) report.missing.push('period');
  if (!nonempty(blueprint.narrativeRole)) report.missing.push('narrativeRole');
  rejectExtraFields(blueprint.combatProfile, new Set(['style', 'strengths', 'weaknesses']),
    'combatProfile', report);
  if (!record(blueprint.combatProfile) || !nonempty(blueprint.combatProfile.style) ||
      !Array.isArray(blueprint.combatProfile.strengths) ||
      !Array.isArray(blueprint.combatProfile.weaknesses))
    report.missing.push('combatProfile.style/strengths/weaknesses');
  else if (![...blueprint.combatProfile.strengths, ...blueprint.combatProfile.weaknesses]
    .every(nonempty)) report.errors.push('combatProfile strengths and weaknesses must contain text');
  if (!Array.isArray(blueprint.abilityConcepts)) report.missing.push('abilityConcepts');
  else for (const concept of blueprint.abilityConcepts) {
    rejectExtraFields(concept, new Set(['id', 'name', 'description']), 'abilityConcepts[]', report);
    if (!nonempty(concept?.id) || !nonempty(concept?.name) || !nonempty(concept?.description))
      report.missing.push('abilityConcepts[].id/name/description');
  }
  if (blueprint.powerReference !== undefined &&
      (typeof blueprint.powerReference !== 'string' || !/^T[0-8]$/.test(blueprint.powerReference)))
    report.errors.push('powerReference must be T0–T8 when present');
  const expectedStatus = mode === 'existing_character' ? 'EXISTING_SOURCE' : 'PROPOSED';
  if (blueprint.sourceStatus !== expectedStatus)
    report.errors.push(`sourceStatus must be ${expectedStatus} for ${mode}`);
  if (mode === 'existing_character') {
    const refs = blueprint.narrativeSources;
    rejectExtraFields(refs, new Set(['narrativeRole', 'combatProfile', 'abilityConcepts']),
      'narrativeSources', report);
    if (!record(refs) || !nonempty(refs.narrativeRole) || !nonempty(refs.combatProfile) ||
        blueprint.abilityConcepts?.length > 0 && !nonempty(refs.abilityConcepts))
      report.missing.push('narrativeSources for existing character claims');
  } else if (blueprint.narrativeSources !== undefined)
    report.errors.push('new proposal cannot assert existing narrative sources');
}

function validateNewCandidate(candidate, report) {
  for (const key of Object.keys(candidate))
    if (!NEW_FIELDS.has(key)) report.errors.push(`candidate field not permitted: ${key}`);
  if (candidate.equipment !== undefined) {
    if (!Array.isArray(candidate.equipment)) report.errors.push('equipment must be an array');
    else for (const item of candidate.equipment)
      if (!record(item) || !nonempty(item.id) || !nonempty(item.name) ||
          Object.keys(item).some(key => !['id', 'name', 'description', 'status'].includes(key)) ||
          item.status !== undefined && item.status !== 'PROPOSED')
        report.errors.push('equipment proposals may contain id, name, description and PROPOSED status only');
  }
  for (const [main, skill] of Object.entries(candidate.skills ?? {})) {
    if (!record(skill)) continue;
    if (Object.keys(skill).some(key => !['level', 'subs'].includes(key)))
      report.errors.push(`skill proposal field not permitted: ${main}`);
    for (const [sub, entry] of Object.entries(skill.subs ?? {}))
      if (record(entry) && Object.keys(entry).some(key => !['level', 'scope', 'scopeId'].includes(key)))
        report.errors.push(`subskill proposal field not permitted: ${main}.${sub}`);
  }
  if (record(candidate.initial) &&
      Object.keys(candidate.initial).some(key => !['health', 'willCurrent', 'turn'].includes(key)))
    report.errors.push('initial proposal may contain health, willCurrent and turn only');
}

function proposalDefinition(blueprint, candidate) {
  const abilities = blueprint.abilityConcepts.map(concept => ({
    id: concept.id, name: concept.name, summary: concept.description,
    source: `blueprint:${blueprint.identity.id}`, sourceStatus: 'PROPOSED',
    engineSupportStatus: 'UNSUPPORTED',
  }));
  return {
    id: blueprint.identity.id, name: blueprint.identity.name, period: blueprint.period,
    sources: [`story-factory-blueprint:${blueprint.identity.id}`],
    size: candidate.size, attributes: copy(candidate.attributes ?? {}),
    skills: copy(candidate.skills ?? {}), equipment: copy(candidate.equipment ?? []),
    abilities, ...(blueprint.powerReference ? { power_reference: blueprint.powerReference } : {}),
  };
}

function resourceReport(resources, mode, report) {
  report.resources = resources.map(item => ({
    id: item.id, candidateStatus: mode === 'new_character_proposal' ? 'PROPOSED' : 'SOURCE_RECORDED',
    sourceExists: item.sourceExists === true,
    adoption: item.adoption, adoptionSource: item.adoptionSource ?? null,
    acquisitionSource: item.acquisitionSource ?? null,
    prerequisiteStatus: item.prerequisiteStatus,
    prerequisiteReasons: copy(item.prerequisiteReasons ?? []),
    engineSupported: item.engineSupported,
    engineSupportStatus: item.engineSupportStatus,
  }));
  report.unmetResourcePrerequisites = report.resources.filter(item =>
    item.prerequisiteStatus !== 'CHECKED');
  for (const item of report.resources) {
    if (item.adoption === 'UNDECIDED')
      report.approvalRequired.push({ kind: 'resource_adoption', resourceId: item.id });
    if (!item.acquisitionSource)
      report.approvalRequired.push({ kind: 'character_acquisition', resourceId: item.id });
  }
}

// Validates a draft only. No result from this function is a formal initial definition.
// The adapter is constructed separately from trusted catalog/adoption/grant records.
function evaluateNpcDraft({ mode, blueprint, candidate, sourceCandidate, adapter } = {}) {
  const report = { errors: [], missing: [], unsupported: [], resources: [],
    unmetResourcePrerequisites: [], approvalRequired: [], validatedNumbers: null };
  const result = { ok: false, okScope: OK_SCOPE, approved: false,
    mode, status: 'DRAFT', blueprint: copy(blueprint ?? null),
    builderCandidate: null, previewState: null, formalDefinition: null, report };
  if (!['existing_character', 'new_character_proposal'].includes(mode))
    report.errors.push('mode must be existing_character or new_character_proposal');
  if (!adapter || typeof adapter.selectResources !== 'function')
    report.errors.push('trusted Resource Adapter required');
  if (report.errors.length) return result;
  validateBlueprint(mode, blueprint, report);
  if (report.errors.length || report.missing.length) return result;

  let definition;
  let initial;
  let resourceIds;
  if (mode === 'existing_character') {
    if (candidate !== undefined) report.errors.push('existing_character rejects numeric proposals');
    if (!record(sourceCandidate?.definition) || !record(sourceCandidate.fieldEvidence))
      report.errors.push('existing_character needs an evidenced source candidate');
    if (report.errors.length) return result;
    definition = copy(sourceCandidate.definition);
    initial = copy(sourceCandidate.demoInitial ?? {});
    resourceIds = copy(sourceCandidate.catalogResourceIds ?? []);
    if (definition.id !== blueprint.identity.id || definition.name !== blueprint.identity.name ||
        definition.period !== blueprint.period)
      report.errors.push('blueprint identity or period differs from source candidate');
    report.approvalRequired.push({ kind: 'migration_review', characterId: definition.id });
    if (sourceCandidate.fieldEvidence.currentHealthWillAndTurn?.status !== 'CONFIRMED')
      report.approvalRequired.push({ kind: 'initial_state_confirmation', characterId: definition.id });
    result.builderCandidate = { definition, initial, fieldEvidence: copy(sourceCandidate.fieldEvidence),
      sourceStatus: 'EXISTING_SOURCE', previewOnly: true };
  } else {
    if (sourceCandidate !== undefined) report.errors.push('new_character_proposal cannot use a source card');
    if (!record(candidate)) report.errors.push('new_character_proposal needs a numeric candidate');
    else validateNewCandidate(candidate, report);
    if (report.errors.length) return result;
    definition = proposalDefinition(blueprint, candidate);
    initial = copy(candidate.initial ?? {});
    resourceIds = copy(candidate.resourceIds ?? []);
    result.builderCandidate = { definition, initial, sourceStatus: 'PROPOSED',
      numericStatuses: numericStatuses({ size: candidate.size, attributes: candidate.attributes,
        skills: candidate.skills, equipment: candidate.equipment, initial: candidate.initial }),
      previewOnly: true };
    report.approvalRequired.push({ kind: 'new_character_definition', characterId: definition.id });
  }
  if (report.errors.length) return result;
  try {
    definition = adapter.selectResources(definition, resourceIds);
  } catch (error) {
    report.errors.push(`resource selection: ${error.message}`);
    return result;
  }
  result.builderCandidate.definition = copy(definition);
  resourceReport(definition.resources, mode, report);
  const built = buildCharacter(definition, initial);
  report.errors.push(...built.report.errors);
  report.missing.push(...built.report.missing);
  report.unsupported = copy(built.report.unsupported);
  if (!built.ok) return result;
  result.ok = true;
  result.previewState = built.state;
  report.validatedNumbers = { status: mode === 'new_character_proposal' ? 'PROPOSED' : 'MIXED_SOURCE_AND_PREVIEW',
    size: built.state.size, attributes: copy(built.state.attributes),
    skills: copy(built.state.skills), derived: copy(built.state.derived) };
  return result;
}

export function createNpcDraftPipeline({ adapter, existingCharacters = [], existingBlueprints = [] } = {}) {
  if (!adapter || typeof adapter.selectResources !== 'function' ||
      !Array.isArray(existingCharacters) || !Array.isArray(existingBlueprints))
    throw new TypeError('trusted Resource Adapter, existingCharacters and existingBlueprints arrays required');
  const sourceCards = new Map();
  for (const card of copy(existingCharacters)) {
    const id = card?.definition?.id;
    if (!nonempty(id) || sourceCards.has(id) || !record(card.fieldEvidence))
      throw new Error(`invalid or duplicate existing source candidate: ${id}`);
    sourceCards.set(id, card);
  }
  const sourceBlueprints = new Map();
  for (const blueprint of copy(existingBlueprints)) {
    const id = blueprint?.identity?.id;
    const check = { errors: [], missing: [] };
    validateBlueprint('existing_character', blueprint, check);
    const card = sourceCards.get(id);
    if (!card || sourceBlueprints.has(id) || check.errors.length || check.missing.length ||
        card.definition.name !== blueprint.identity.name || card.definition.period !== blueprint.period)
      throw new Error(`invalid or unmatched existing narrative Blueprint: ${id}`);
    sourceBlueprints.set(id, blueprint);
  }
  return {
    evaluate(request = {}) {
      if (!record(request)) throw new TypeError('draft request must be an object');
      const { mode, blueprint, candidate } = request;
      if ('sourceCandidate' in request || 'adapter' in request)
        return { ok: false, okScope: OK_SCOPE, approved: false,
          mode, status: 'DRAFT', blueprint: copy(blueprint ?? null),
          builderCandidate: null, previewState: null, formalDefinition: null,
          report: { errors: ['sourceCandidate and adapter must be loaded before requests'],
            missing: [], unsupported: [], resources: [], unmetResourcePrerequisites: [],
            approvalRequired: [], validatedNumbers: null } };
      const trustedBlueprint = mode === 'existing_character'
        ? sourceBlueprints.get(blueprint?.identity?.id) : undefined;
      if (mode === 'existing_character' && (!trustedBlueprint || !same(blueprint, trustedBlueprint)))
        return { ok: false, okScope: OK_SCOPE, approved: false,
          mode, status: 'DRAFT', blueprint: copy(blueprint ?? null),
          builderCandidate: null, previewState: null, formalDefinition: null,
          report: { errors: ['existing narrative Blueprint differs from trusted source'],
            missing: [], unsupported: [], resources: [], unmetResourcePrerequisites: [],
            approvalRequired: [], validatedNumbers: null } };
      return evaluateNpcDraft({ mode, blueprint: trustedBlueprint ?? blueprint, candidate,
        sourceCandidate: mode === 'existing_character' ? sourceCards.get(blueprint?.identity?.id) : undefined,
        adapter });
    },
  };
}
