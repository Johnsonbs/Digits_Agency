import { useEffect, useMemo, useState } from 'react'
import BlockPalette from '../components/BlockPalette'
import SpreadsheetGrid from '../components/SpreadsheetGrid'
import FormulaBar from '../components/FormulaBar'
import Confetti from '../components/Confetti'
import { freePlayBlockCategories } from '../data/blocks'
import { evaluateFormula, FormulaError } from '../lib/formulaEngine'
import { SUMMARY_KEY, GRANDTOTAL_KEY, getExpected, targetLabelFor } from '../lib/missionTargets'
import './AnalysisStep.css'

const SUCCESS_MESSAGES = ["Nice work! 🎉", "You cracked it!", "Locked in!"]
const RETRY_MESSAGES = ["Not quite — give it another go!", "So close! Check your blocks.", "Hmm, try a different combo!"]

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function resultsMatch(result, expected) {
  if (typeof expected === 'number') {
    const n = Number(result)
    return !Number.isNaN(n) && Math.abs(n - expected) < 0.001
  }
  return String(result) === String(expected)
}

function AnalysisStep({ initialFormulas, initialResults, onChange, onContinue, config }) {
  const {
    columns,
    rows,
    statusLabels,
    labelBlocks,
    grandTotalLabel,
    formatGrandTotal,
    summaryQuestion,
    hasGrandTotal = true,
    hasSummary = true,
  } = config.analysis
  const { idKey } = config

  const hasRowTotals = columns.some((c) => c.key === 'total')

  const [formulas, setFormulas] = useState(initialFormulas || {})
  const [results, setResults] = useState(initialResults || {})
  const [target, setTarget] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [shake, setShake] = useState(false)
  const [confettiKey, setConfettiKey] = useState(null)

  useEffect(() => {
    onChange(formulas, results)
  }, [formulas, results])

  const paletteCategories = useMemo(
    () => [
      ...freePlayBlockCategories,
      ...(labelBlocks && labelBlocks.length
        ? [{ id: 'labels', label: 'Labels', color: 'var(--color-purple)', blocks: labelBlocks }]
        : []),
    ],
    [labelBlocks],
  )

  const cellLabel = (rowIndex, colKey) => {
    const row = rows[rowIndex]
    const column = columns.find((c) => c.key === colKey)
    return `${column.label} · ${row[idKey]}`
  }

  const tokens = target !== null ? formulas[target] || [] : []

  const referencedCells = useMemo(() => {
    const set = new Set()
    tokens.forEach((t) => {
      if (t.kind === 'cell') set.add(`${t.row}-${t.colKey}`)
    })
    return set
  }, [tokens])

  const runShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const runConfetti = () => {
    const key = Date.now()
    setConfettiKey(key)
    setTimeout(() => setConfettiKey((k) => (k === key ? null : k)), 1200)
  }

  const selectTarget = (key) => {
    setTarget(key)
    setFeedback(null)
  }

  const handleCellClick = (rowIndex, colKey) => {
    setSelectedCell({ row: rowIndex, colKey })
    setFeedback(null)

    const column = columns.find((c) => c.key === colKey)

    if (column.targetable) {
      const key = `${colKey}:${rowIndex}`
      const solved = results[key]

      // Referencing an already-solved cell (e.g. a row's Total) into a
      // different formula in progress, such as the Grand Total.
      if (target !== null && target !== key && solved) {
        const token = {
          kind: 'cell',
          row: rowIndex,
          colKey,
          value: solved.value,
          label: cellLabel(rowIndex, colKey),
        }
        setFormulas((prev) => ({
          ...prev,
          [target]: [...(prev[target] || []), token],
        }))
        return
      }

      selectTarget(key)
      return
    }

    if (target === null) return

    const token = {
      kind: 'cell',
      row: rowIndex,
      colKey,
      value: rows[rowIndex][colKey],
      label: cellLabel(rowIndex, colKey),
    }

    setFormulas((prev) => ({
      ...prev,
      [target]: [...(prev[target] || []), token],
    }))
  }

  const handleCardClick = (key) => {
    setSelectedCell(null)
    selectTarget(key)
  }

  const handleBlockClick = (block) => {
    if (target === null) return
    setFeedback(null)
    setFormulas((prev) => ({
      ...prev,
      [target]: [...(prev[target] || []), block],
    }))
  }

  const handleUndo = () => {
    if (target === null) return
    setFeedback(null)
    setFormulas((prev) => ({
      ...prev,
      [target]: (prev[target] || []).slice(0, -1),
    }))
  }

  const handleClear = () => {
    if (target === null) return
    setFeedback(null)
    setFormulas((prev) => ({ ...prev, [target]: [] }))
  }

  const handleRun = () => {
    if (target === null) return
    const currentTokens = formulas[target] || []
    const expected = getExpected(target, config)

    try {
      const result = evaluateFormula(currentTokens)

      if (resultsMatch(result, expected)) {
        setResults((prev) => ({ ...prev, [target]: { value: result } }))
        setFeedback({ type: 'success', message: pick(SUCCESS_MESSAGES) })
        runConfetti()
        setTarget(null)
        setSelectedCell(null)
      } else {
        setFeedback({ type: 'retry', message: pick(RETRY_MESSAGES) })
        runShake()
      }
    } catch (err) {
      const message = err instanceof FormulaError ? err.message : "That formula's not quite ready yet!"
      setFeedback({ type: 'retry', message })
      runShake()
    }
  }

  const targetLabel = target !== null ? targetLabelFor(target, config) : null
  const summaryResult = results[SUMMARY_KEY]
  const grandTotalResult = results[GRANDTOTAL_KEY]

  const allTotalsSolved = !hasRowTotals || rows.every((_, i) => results[`total:${i}`])
  const analysisComplete =
    allTotalsSolved && (!hasGrandTotal || Boolean(grandTotalResult)) && (!hasSummary || Boolean(summaryResult))

  return (
    <div className="analysis-step">
      {confettiKey && <Confetti key={confettiKey} />}

      <FormulaBar
        targetLabel={targetLabel}
        tokens={tokens}
        feedback={feedback}
        shake={shake}
        onUndo={handleUndo}
        onClear={handleClear}
        onRun={handleRun}
      />

      <div className="analysis-step__body">
        <BlockPalette disabled={target === null} onBlockClick={handleBlockClick} categories={paletteCategories} />

        <div className="analysis-step__sheet-column">
          <SpreadsheetGrid
            columns={columns}
            rows={rows}
            results={results}
            target={target}
            selectedCell={selectedCell}
            referencedCells={referencedCells}
            onCellClick={handleCellClick}
          />

          {hasGrandTotal && (
            <div className="summary-card">
              <p className="summary-card__question">{grandTotalLabel}</p>
              <button
                type="button"
                className={`summary-card__cell${target === GRANDTOTAL_KEY ? ' summary-card__cell--target' : ''}${
                  grandTotalResult ? ' summary-card__cell--solved' : ''
                }`}
                onClick={() => handleCardClick(GRANDTOTAL_KEY)}
              >
                {grandTotalResult
                  ? formatGrandTotal(grandTotalResult.value)
                  : target === GRANDTOTAL_KEY
                    ? 'Solving…'
                    : '?'}
              </button>
            </div>
          )}

          {hasSummary && (
            <div className="summary-card">
              <p className="summary-card__question">{summaryQuestion}</p>
              <button
                type="button"
                className={`summary-card__cell${target === SUMMARY_KEY ? ' summary-card__cell--target' : ''}${
                  summaryResult ? ' summary-card__cell--solved' : ''
                }`}
                onClick={() => handleCardClick(SUMMARY_KEY)}
              >
                {summaryResult ? summaryResult.value : target === SUMMARY_KEY ? 'Solving…' : '?'}
              </button>
            </div>
          )}

          {analysisComplete && (
            <div className="step-success">
              <p>📊 Every number's crunched{statusLabels ? ` — including the ${statusLabels.pass} count!` : '!'}</p>
              <button type="button" className="tool-btn tool-btn--purple" onClick={onContinue}>
                Continue →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalysisStep
