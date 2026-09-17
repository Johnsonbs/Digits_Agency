import { detectiveCases } from './detectiveCases'
import { salesCases } from './salesCase'
import { healthCases } from './healthCase'
import { habitCases } from './habitCase'

const casesByTheme = {
  detective: detectiveCases,
  sales: salesCases,
  health: healthCases,
  habit: habitCases,
}

export function getCaseCount(themeId) {
  return (casesByTheme[themeId] || casesByTheme.detective).length
}

// Returns null when that case number hasn't been built yet for this theme —
// callers should treat that as "no more cases right now", not an error.
export function getCaseConfig(themeId, caseNumber = 1) {
  const cases = casesByTheme[themeId] || casesByTheme.detective
  return cases[caseNumber - 1] || null
}
