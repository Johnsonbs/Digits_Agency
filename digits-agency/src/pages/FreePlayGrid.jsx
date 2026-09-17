import { useMemo, useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import BlockPalette from '../components/BlockPalette'
import SpreadsheetGrid from '../components/SpreadsheetGrid'
import FormulaBar from '../components/FormulaBar'
import Confetti from '../components/Confetti'
import SaveProjectModal from '../components/SaveProjectModal'
import { freePlayBlockCategories } from '../data/blocks'
import { evaluateFormula, FormulaError } from '../lib/formulaEngine'
import { saveProject } from '../lib/projectStore'
import './FreePlayGrid.css'

const SUCCESS_MESSAGES = ["Nice work! 🎉", "Computed!", "There you go!"]

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function nextResultColumn(existing) {
  const nums = existing
    .map((c) => parseInt(c.key.replace('result', ''), 10))
    .filter((n) => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return { key: `result${next}`, label: next === 1 ? 'Result' : `Result ${next}`, targetable: true }
}

function FreePlayGrid({ initialProject, onBack }) {
  const [id, setId] = useState(initialProject.id || null)
  const [name, setName] = useState(initialProject.name || 'Untitled Project')
  const [baseColumns] = useState(initialProject.baseColumns)
  const [rows] = useState(initialProject.rows)
  const [resultColumns, setResultColumns] = useState(initialProject.resultColumns || [])
  const [formulas, setFormulas] = useState({})
  const [results, setResults] = useState(initialProject.results || {})
  const [target, setTarget] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [shake, setShake] = useState(false)
  const [confettiKey, setConfettiKey] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  const columns = useMemo(() => [...baseColumns, ...resultColumns], [baseColumns, resultColumns])

  const tokens = target !== null ? formulas[target] || [] : []

  const referencedCells = useMemo(() => {
    const set = new Set()
    tokens.forEach((t) => {
      if (t.kind === 'cell') set.add(`${t.row}-${t.colKey}`)
    })
    return set
  }, [tokens])

  const rowLabel = (rowIndex) => {
    const first = columns[0]
    return first ? String(rows[rowIndex][first.key]) : `Row ${rowIndex + 1}`
  }

  const cellLabel = (rowIndex, colKey) => {
    const column = columns.find((c) => c.key === colKey)
    return `${column?.label ?? colKey} · ${rowLabel(rowIndex)}`
  }

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

      if (target !== null && target !== key && solved) {
        const token = {
          kind: 'cell',
          row: rowIndex,
          colKey,
          value: solved.value,
          label: cellLabel(rowIndex, colKey),
        }
        setFormulas((prev) => ({ ...prev, [target]: [...(prev[target] || []), token] }))
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
    setFormulas((prev) => ({ ...prev, [target]: [...(prev[target] || []), token] }))
  }

  const handleBlockClick = (block) => {
    if (target === null) return
    setFeedback(null)
    setFormulas((prev) => ({ ...prev, [target]: [...(prev[target] || []), block] }))
  }

  const handleUndo = () => {
    if (target === null) return
    setFeedback(null)
    setFormulas((prev) => ({ ...prev, [target]: (prev[target] || []).slice(0, -1) }))
  }

  const handleClear = () => {
    if (target === null) return
    setFeedback(null)
    setFormulas((prev) => ({ ...prev, [target]: [] }))
  }

  const handleRun = () => {
    if (target === null) return
    const currentTokens = formulas[target] || []

    try {
      const result = evaluateFormula(currentTokens)
      setResults((prev) => ({ ...prev, [target]: { value: result } }))
      setFeedback({ type: 'success', message: pick(SUCCESS_MESSAGES) })
      runConfetti()
      setTarget(null)
      setSelectedCell(null)
    } catch (err) {
      const message = err instanceof FormulaError ? err.message : "That formula's not quite ready yet!"
      setFeedback({ type: 'retry', message })
      runShake()
    }
  }

  const handleAddColumn = () => {
    setResultColumns((prev) => [...prev, nextResultColumn(prev)])
  }

  const handleSaveProject = (newName) => {
    const record = saveProject({ id, name: newName, baseColumns, rows, resultColumns, results })
    setId(record.id)
    setName(record.name)
    setShowSaveModal(false)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 1800)
  }

  const handleHome = () => {
    if (id) {
      saveProject({ id, name, baseColumns, rows, resultColumns, results })
    }
    onBack()
  }

  const targetLabel = target !== null ? cellLabel(Number(target.split(':')[1]), target.split(':')[0]) : null

  return (
    <div className="free-play">
      {confettiKey && <Confetti key={confettiKey} />}
      {showSaveModal && (
        <SaveProjectModal
          initialName={name}
          onSave={handleSaveProject}
          onCancel={() => setShowSaveModal(false)}
        />
      )}

      <ScreenHeader title={name} onBack={handleHome} backLabel="🏠 Home" />

      <div className="free-play__toolbar">
        <p className="free-play__meta">
          {rows.length} row{rows.length === 1 ? '' : 's'} · {baseColumns.length} column
          {baseColumns.length === 1 ? '' : 's'}
          {initialProject.truncated && ' · showing the first 500 rows'}
        </p>
        <div className="free-play__toolbar-actions">
          <button type="button" className="tool-btn tool-btn--sky" onClick={handleAddColumn}>
            ➕ Add Result Column
          </button>
          <button type="button" className="tool-btn tool-btn--purple" onClick={() => setShowSaveModal(true)}>
            💾 Save Project
          </button>
        </div>
      </div>

      {savedToast && <div className="free-play__toast">✅ Saved as "{name}"!</div>}

      <FormulaBar
        targetLabel={targetLabel}
        tokens={tokens}
        feedback={feedback}
        shake={shake}
        onUndo={handleUndo}
        onClear={handleClear}
        onRun={handleRun}
        placeholder="Pick a Result cell to begin, or add one above"
      />

      <div className="free-play__body">
        <BlockPalette
          disabled={target === null}
          onBlockClick={handleBlockClick}
          categories={freePlayBlockCategories}
          hint="👉 Tap a Result cell to start a formula!"
        />

        <SpreadsheetGrid
          columns={columns}
          rows={rows}
          results={results}
          target={target}
          selectedCell={selectedCell}
          referencedCells={referencedCells}
          onCellClick={handleCellClick}
        />
      </div>
    </div>
  )
}

export default FreePlayGrid
