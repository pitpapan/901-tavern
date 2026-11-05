"""Patch only the disposable build; never installs into the formal app."""
from pathlib import Path
import difflib,hashlib,json
H=Path(__file__).resolve().parent
SRC=Path('D:/github/sillyTavern/public/scripts/extensions/third-party/shujuku')
B=Path('C:/Users/pit/AppData/Local/901-summary-coverage-build-20261105')
HELPER='src/service/flight-mode/stage-coverage-901.js'
ORCH='src/service/table/update-orchestrator.ts'
HIDDEN='src/service/flight-mode/flight-mode-hidden-rows.ts'
COMMIT='src/service/table/table-update-commit.ts'
def replace(s,a,b):
 assert s.count(a)==1,(a,s.count(a))
 return s.replace(a,b,1)
(B/HELPER).write_bytes((H/'coverage.mjs').read_bytes())
s=(SRC/ORCH).read_text(encoding='utf8')
s="import { compileStage901, compileAndSyncStage901 } from '../flight-mode/stage-coverage-901.js';\nimport { getClassicRecentChronicleRows_ACU } from '../fill-mode/fill-mode-preferences';\n"+s
s=replace(s,'            const runtimeData = parseResult.tableData;','''            const runtimeData = parseResult.tableData;
            const compiledStageKeys901 = options.isImportMode ? [] : await compileAndSyncStage901(
                provider, baseSnapshot, runtimeData, getCurrentFlightModeState_ACU(), getClassicRecentChronicleRows_ACU());''')
s=replace(s,'                        const runtimeData = parseResult.tableData as Record<string, any>;','''                        const runtimeData = parseResult.tableData as Record<string, any>;
                        const compiledStageKeys901 = isImportMode ? [] : await compileAndSyncStage901(
                            provider, rawBaseSnapshot, runtimeData, getCurrentFlightModeState_ACU(), getClassicRecentChronicleRows_ACU());''')
anchor="operations.push(...buildSheetReplaceOperationsFromData_ACU(runtimeData, renumberedSheetKeys, 'system'));"
assert s.count(anchor)==2
s=s.replace(anchor,"operations.push(...buildSheetReplaceOperationsFromData_ACU(runtimeData, [...new Set([...renumberedSheetKeys, ...compiledStageKeys901])], 'system'));")
s=replace(s,'\n    applySpecialIndexSequenceToSummaryTables_ACU(workingTableData);','''
    if (!options.isImportMode) compileStage901(
        baseSnapshot, workingTableData, getCurrentFlightModeState_ACU(), getClassicRecentChronicleRows_ACU());
    applySpecialIndexSequenceToSummaryTables_ACU(workingTableData);''')
s=replace(s,'\n                    applySpecialIndexSequenceToSummaryTables_ACU(workingTableData);','''
                    if (!isImportMode) compileStage901(
                        rawBaseSnapshot, workingTableData, getCurrentFlightModeState_ACU(), getClassicRecentChronicleRows_ACU());
                    applySpecialIndexSequenceToSummaryTables_ACU(workingTableData);''')
(B/ORCH).write_text(s,encoding='utf8')
s=(SRC/HIDDEN).read_text(encoding='utf8')
s="import { assertStageCoverage901 } from './stage-coverage-901.js';\nimport { getClassicRecentChronicleRows_ACU } from '../fill-mode/fill-mode-preferences';\n"+s
s=replace(s,'  const beforeIds = collectRowIds_ACU(beforeBigSummary);','''  // Must run before staging any hidden IDs; an exception aborts the same commit.
  assertStageCoverage901(beforeData, afterData, state, getClassicRecentChronicleRows_ACU());
  const beforeIds = collectRowIds_ACU(beforeBigSummary);''')
(B/HIDDEN).write_text(s,encoding='utf8')
s=(SRC/COMMIT).read_text(encoding='utf8')
s=replace(s,'''          const staged = persistOptions.beforePersist
            ? await persistOptions.beforePersist(applied.tableData)
            : undefined;''','''          let staged: { rollback?: () => void | Promise<void> } | void;
          try {
            staged = persistOptions.beforePersist
              ? await persistOptions.beforePersist(applied.tableData)
              : undefined;
          } catch (error) {
            // SQL may already have modified the provider. A rejected coverage
            // check must restore it from persisted history, just like save failure.
            requiresRuntimeReload = true;
            throw error;
          }''')
(B/COMMIT).write_text(s,encoding='utf8')
s=replace(s,'''        } catch (error) {
          if (rollbackBeforePersist) await rollbackBeforePersist();''','''        } catch (error) {
          if ((error as any)?.code === '901_STAGE_COVERAGE') requiresRuntimeReload = true;
          if (rollbackBeforePersist) await rollbackBeforePersist();''')
(B/COMMIT).write_text(s,encoding='utf8')
patch=''.join(''.join(difflib.unified_diff((SRC/f).read_text(encoding='utf8').splitlines(True) if (SRC/f).exists() else [],(B/f).read_text(encoding='utf8').splitlines(True),fromfile='a/'+f,tofile='b/'+f)) for f in (HELPER,ORCH,HIDDEN,COMMIT))
(H/'source.patch').write_text(patch,encoding='utf8')
(H/'build-source.json').write_text(json.dumps({'formalPluginSha256':hashlib.sha256((SRC/'index.js').read_bytes()).hexdigest(),'files':{f:hashlib.sha256((B/f).read_bytes()).hexdigest() for f in (HELPER,ORCH,HIDDEN,COMMIT)}},indent=2)+'\n',encoding='utf8')
print('Isolated source integrated: stage compilation + replay replacement + pre-hide gate.')
