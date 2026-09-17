import { readProgress, writeProgress } from './saveStore'

export function loadCaseProgress(themeId) {
  return readProgress()[themeId] || null
}

export function saveCaseProgress(themeId, caseState) {
  const progress = readProgress()
  writeProgress({ ...progress, [themeId]: { ...caseState, updatedAt: Date.now() } })
}

export function clearCaseProgress(themeId) {
  const progress = { ...readProgress() }
  delete progress[themeId]
  writeProgress(progress)
}

export function loadAllProgress() {
  return readProgress()
}
