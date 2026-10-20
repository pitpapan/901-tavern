// Exercise the installed SillyTavern regex functions, with UI settings stubbed.
// This does not replace the live prompt and model checks recorded in README.md.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const tavernRoot = process.argv[2] ?? 'D:/github/sillyTavern';
const rules = JSON.parse(fs.readFileSync(new URL(
  '../../../output/replay_tavern/combat_context_20261020_candidate/import/901_历史结算过滤.regex.json',
  import.meta.url), 'utf8'));
const utils = fs.readFileSync(`${tavernRoot}/public/scripts/utils.js`, 'utf8');
const parserStart = utils.indexOf('export function regexFromString(');
const parserEnd = utils.indexOf('export class Stopwatch', parserStart);
assert.ok(parserStart >= 0 && parserEnd > parserStart, 'Installed regex parser found');
const parser = utils.slice(parserStart, parserEnd).replace('export ', '');
const engine = fs.readFileSync(
  `${tavernRoot}/public/scripts/extensions/regex/engine.js`, 'utf8')
  .replace(/^import .*;\r?$/gm, '').replace(/^export /gm, '');
const context = vm.createContext({
  characters: [{ avatar: '901-regex-check', data: { extensions: { regex_scripts: rules } } }],
  this_chid: 0,
  extension_settings: {
    disabledExtensions: [], regex: [], character_allowed_regex: ['901-regex-check'],
  },
  getPresetManager: () => null,
  substituteParams: value => value,
  substituteParamsExtended: value => value,
  saveSettingsDebounced: () => {},
  writeExtensionField: () => {},
  lodash: {},
  console: { debug() {}, warn: console.warn },
});
vm.runInContext(`${parser}\n${engine}`, context);
const filter = context.getRegexedString;
const before = '斩击命中，受到2L。消耗1点能量。\n';
const block = '<rules901_detail>\n公开骰值、算式、加值拆账。\n</rules901_detail>\n';
const after = '<rules901_state>生命、位置、持续效果余2轮。</rules901_state>\n等待玩家选择。';
const source = before + block + after;
const unclosed = before + '<rules901_detail>\n算式未结束\n' + after;
const cases = [
  ['older assistant', filter(source, 2, { isPrompt: true, depth: 3 }), before + after],
  ['recent assistant', filter(source, 2, { isPrompt: true, depth: 1 }), source],
  ['current message', filter(source, 2, { isPrompt: true, depth: 0 }), source],
  ['player input', filter(source, 1, { isPrompt: true, depth: 3 }), source],
  ['display', filter(source, 2, { isMarkdown: true, depth: 3 }), source],
  ['saved text', filter(source, 2, {}), source],
  ['worldbook', filter(source, 5, { isPrompt: true, depth: 3 }), source],
  ['unclosed block', filter(unclosed, 2, { isPrompt: true, depth: 3 }), unclosed],
  ['unmarked narrative', filter(before + after, 2, { isPrompt: true, depth: 3 }), before + after],
  ['multiple blocks', filter(before + block + after + '\n' + block, 2,
    { isPrompt: true, depth: 3 }), before + after + '\n'],
  ['CRLF', filter(source.replaceAll('\n', '\r\n'), 2, { isPrompt: true, depth: 3 }),
    (before + after).replaceAll('\n', '\r\n')],
];
for (const [name, actual, expected] of cases) assert.equal(actual, expected, name);
console.log(JSON.stringify({
  passed: cases.length,
  engine: 'installed SillyTavern getRegexedString/runRegexScript',
  cases: cases.map(item => item[0]),
}, null, 2));
