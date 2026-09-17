const STEP_META = {
  entry: { label: 'Entry', icon: '📝' },
  cleaning: { label: 'Cleaning', icon: '🧹' },
  analysis: { label: 'Analysis', icon: '🧮' },
  interpretation: { label: 'Interpretation', icon: '💡' },
}

// Not every case visits every phase (see STORY_BIBLE.md's "Shape" column) —
// a case config declares its own `steps` array in the order they run, and
// this resolves that into the metadata ProgressIndicator needs.
export function activeStepsFor(config) {
  return config.steps.map((key) => ({ key, ...STEP_META[key] }))
}

export function defaultCaseState(caseNumber = 1) {
  return {
    caseNumber,
    step: 'brief',
    entry: { entries: {} },
    cleaning: { rows: null },
    analysis: { formulas: {}, results: {} },
    interpretation: { step: 'mascot', selectedOption: null },
    payoutAwarded: false,
  }
}

export function stepIndexOf(stepKey, config) {
  if (stepKey === 'complete') return config.steps.length
  return config.steps.indexOf(stepKey)
}

export function nextStepAfter(stepKey, config) {
  const index = config.steps.indexOf(stepKey)
  if (index === -1 || index === config.steps.length - 1) return 'complete'
  return config.steps[index + 1]
}
