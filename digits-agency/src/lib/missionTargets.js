export const SUMMARY_KEY = 'summary'
export const GRANDTOTAL_KEY = 'grandtotal'

export function parseTargetKey(key) {
  if (key === SUMMARY_KEY) return { type: 'summary' }
  if (key === GRANDTOTAL_KEY) return { type: 'grandtotal' }
  const [type, rowStr] = key.split(':')
  return { type, row: Number(rowStr) }
}

// `config` is a case config (see src/data/cases). Most cases share the
// classic shape (Total via ×, Grand Total via SUM, a Status label via IF, a
// COUNTIF-style Summary count), but a case can override `computeSummary`
// for something that isn't a threshold count — e.g. a FIND-based lookup.
export function getExpected(key, config) {
  const { type, row } = parseTargetKey(key)
  const { analysis } = config
  if (type === 'total') return analysis.computeTotal(analysis.rows[row])
  if (type === 'status') {
    const metric = analysis.computeMetric(analysis.rows[row])
    return metric > analysis.threshold ? analysis.statusLabels.pass : analysis.statusLabels.fail
  }
  if (type === 'summary') {
    if (analysis.computeSummary) return analysis.computeSummary(analysis.rows)
    return analysis.rows.filter((r) => analysis.computeMetric(r) > analysis.threshold).length
  }
  if (type === 'grandtotal') {
    return analysis.rows.reduce((sum, r) => sum + analysis.computeTotal(r), 0)
  }
  return undefined
}

export function targetLabelFor(key, config) {
  const { type, row } = parseTargetKey(key)
  const { analysis, idKey, idPlural } = config
  if (type === 'summary') return analysis.statusLabels ? `Summary · ${analysis.statusLabels.pass} count` : 'Summary'
  if (type === 'grandtotal') return `Grand Total · All ${idPlural}`
  const idValue = analysis.rows[row][idKey]
  if (type === 'total') return `Total · ${idValue}`
  if (type === 'status') return `Status · ${idValue}`
  return null
}

// Interpretation always reflects on one "headline" result — prefer the
// Summary if the case has one, otherwise fall back to the Grand Total.
export function headlineTargetKey(config) {
  const { hasSummary = true, hasGrandTotal = true } = config.analysis
  if (hasSummary) return SUMMARY_KEY
  if (hasGrandTotal) return GRANDTOTAL_KEY
  return SUMMARY_KEY
}
