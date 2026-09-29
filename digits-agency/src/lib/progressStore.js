import { readProgress, writeProgress } from './saveStore'

// Each theme stores a *history* of every case's own state, keyed by case
// number, plus the furthest case number ever reached. This is what makes it
// possible to go back and replay/view/edit a completed case later, instead
// of only ever remembering "whichever case you're currently on" (the old
// shape, which overwrote itself every time you advanced).
function readTheme(themeId) {
  const raw = readProgress()[themeId]
  if (!raw) return null

  // Migrate a pre-history save (a single flat case state with its own
  // caseNumber) into the new per-case shape, the first time it loads.
  if (!raw.cases) {
    const caseNumber = raw.caseNumber || 1
    return { furthestCaseNumber: caseNumber, cases: { [caseNumber]: raw } }
  }
  return raw
}

export function getFurthestCaseNumber(themeId) {
  return readTheme(themeId)?.furthestCaseNumber || 1
}

export function loadCaseProgress(themeId, caseNumber) {
  const theme = readTheme(themeId)
  return theme?.cases?.[caseNumber] || null
}

export function saveCaseProgress(themeId, caseNumber, caseState) {
  const progress = readProgress()
  const theme = readTheme(themeId) || { furthestCaseNumber: caseNumber, cases: {} }
  const nextTheme = {
    furthestCaseNumber: Math.max(theme.furthestCaseNumber, caseNumber),
    cases: { ...theme.cases, [caseNumber]: { ...caseState, updatedAt: Date.now() } },
  }
  writeProgress({ ...progress, [themeId]: nextTheme })
}

export function clearTheme(themeId) {
  const progress = { ...readProgress() }
  delete progress[themeId]
  writeProgress(progress)
}

export function loadAllProgress() {
  return readProgress()
}
