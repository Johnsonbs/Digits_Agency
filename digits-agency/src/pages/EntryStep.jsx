import { useEffect, useState } from 'react'
import './EntryStep.css'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildOptionSets(rows, columns) {
  return rows.map((row, rowIndex) => {
    const perColumn = {}
    columns.forEach((col) => {
      const correct = row[col.key]
      const others = rows.filter((_, i) => i !== rowIndex).map((r) => r[col.key])
      const uniqueOthers = Array.from(new Set(others.filter((v) => v !== correct)))
      const distractors = shuffle(uniqueOthers).slice(0, 2)
      perColumn[col.key] = shuffle([correct, ...distractors])
    })
    return perColumn
  })
}

function formatValue(col, value) {
  return col.format === 'currency' ? `$${Number(value).toFixed(2)}` : value
}

function EntryStep({ initialEntries, onChange, onContinue, intro, caseFileTitle, columns, rows, clue }) {
  const [optionSets] = useState(() => buildOptionSets(rows, columns))
  const [entries, setEntries] = useState(initialEntries || {})
  const [activeCell, setActiveCell] = useState(null)
  const [popoverError, setPopoverError] = useState(null)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    onChange(entries)
  }, [entries])

  const totalCells = rows.length * columns.length
  const isComplete = Object.keys(entries).length === totalCells

  const openCell = (rowIndex, colKey) => {
    const isSame = activeCell && activeCell.row === rowIndex && activeCell.colKey === colKey
    setActiveCell(isSame ? null : { row: rowIndex, colKey })
    setPopoverError(null)
  }

  const handlePick = (rowIndex, colKey, picked, correct) => {
    if (picked === correct) {
      setEntries((prev) => ({ ...prev, [`${rowIndex}-${colKey}`]: picked }))
      setActiveCell(null)
      setPopoverError(null)
      return
    }
    setPopoverError('Not quite — check the case file above!')
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  return (
    <div className="entry-step">
      <p className="entry-step__intro">{intro}</p>

      <div className="case-file">
        <h2 className="case-file__title">{caseFileTitle}</h2>
        <ul className="case-file__list">
          {rows.map((row, i) => (
            <li key={i}>{clue(row)}</li>
          ))}
        </ul>
      </div>

      <div className="entry-table-wrap">
        <table className="entry-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => {
                  const cellKey = `${rowIndex}-${col.key}`
                  const filled = entries[cellKey]
                  const isOpen = activeCell && activeCell.row === rowIndex && activeCell.colKey === col.key

                  return (
                    <td
                      key={col.key}
                      className={`entry-cell${filled !== undefined ? ' entry-cell--filled' : ' entry-cell--blank'}${
                        isOpen ? ' entry-cell--open' : ''
                      }`}
                      onClick={() => openCell(rowIndex, col.key)}
                    >
                      {filled !== undefined ? formatValue(col, filled) : '?'}

                      {isOpen && (
                        <div className={`fill-popover${shake ? ' fill-popover--shake' : ''}`}>
                          {popoverError && <p className="fill-popover__error">{popoverError}</p>}
                          {optionSets[rowIndex][col.key].map((opt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePick(rowIndex, col.key, opt, row[col.key])
                              }}
                            >
                              {formatValue(col, opt)}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isComplete ? (
        <div className="step-success">
          <p>✅ All entered! The grid matches the case file.</p>
          <button type="button" className="tool-btn tool-btn--purple" onClick={onContinue}>
            Continue →
          </button>
        </div>
      ) : (
        <p className="step-hint">Fill in every cell to match the case file above.</p>
      )}
    </div>
  )
}

export default EntryStep
