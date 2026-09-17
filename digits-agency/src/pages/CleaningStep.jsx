import { useEffect, useMemo, useState } from 'react'
import Confetti from '../components/Confetti'
import './CleaningStep.css'

function toTitleCase(str) {
  return str
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

function formatAmount(value) {
  return `$${Number(value).toFixed(2)}`
}

function CleaningStep({ initialRows, onChange, onContinue, intro, columns, seedRows, textColumnKey }) {
  const cloneSeedRows = () => seedRows.map((r) => ({ ...r }))
  const rowKey = (row) => columns.map((c) => row[c.key]).join('|')

  const [rows, setRows] = useState(() => initialRows || cloneSeedRows())
  const [activeBlank, setActiveBlank] = useState(null)
  const [celebrated, setCelebrated] = useState(false)
  const [confettiKey, setConfettiKey] = useState(null)

  useEffect(() => {
    onChange(rows)
  }, [rows])

  const duplicateIndexes = useMemo(() => {
    const seen = new Set()
    const dups = new Set()
    rows.forEach((row, i) => {
      const key = rowKey(row)
      if (seen.has(key)) dups.add(i)
      else seen.add(key)
    })
    return dups
  }, [rows])

  const capIssueIndexes = useMemo(() => {
    const set = new Set()
    rows.forEach((row, i) => {
      const value = row[textColumnKey]
      if (value.trim() !== '' && value !== toTitleCase(value)) set.add(i)
    })
    return set
  }, [rows])

  const blankIndexes = useMemo(() => {
    const set = new Set()
    rows.forEach((row, i) => {
      if (row[textColumnKey].trim() === '') set.add(i)
    })
    return set
  }, [rows])

  const textOptions = useMemo(() => {
    const set = new Set()
    rows.forEach((row) => {
      const value = row[textColumnKey]
      if (value.trim() !== '') set.add(toTitleCase(value))
    })
    return Array.from(set)
  }, [rows])

  const isClean = duplicateIndexes.size === 0 && capIssueIndexes.size === 0 && blankIndexes.size === 0

  useEffect(() => {
    if (isClean && !celebrated) {
      setCelebrated(true)
      setConfettiKey(Date.now())
    }
  }, [isClean, celebrated])

  const handleRemoveDuplicates = () => {
    setRows((prev) => {
      const seen = new Set()
      return prev.filter((row) => {
        const key = rowKey(row)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    })
  }

  const handleFixCapitalization = () => {
    setRows((prev) =>
      prev.map((row) =>
        row[textColumnKey].trim() === '' ? row : { ...row, [textColumnKey]: toTitleCase(row[textColumnKey]) },
      ),
    )
  }

  const handleFillBlank = (rowIndex, value) => {
    setRows((prev) => prev.map((row, i) => (i === rowIndex ? { ...row, [textColumnKey]: value } : row)))
    setActiveBlank(null)
  }

  const handleReset = () => {
    setRows(cloneSeedRows())
    setActiveBlank(null)
    setCelebrated(false)
  }

  return (
    <div className="cleaning">
      {confettiKey && <Confetti key={confettiKey} />}

      <p className="cleaning__intro">{intro}</p>

      <div className="cleaning__legend">
        <span><i className="dot dot--purple" /> Duplicate row</span>
        <span><i className="dot dot--sky" /> Needs matching capitalization</span>
        <span><i className="dot dot--yellow" /> Blank — click to fill in</span>
      </div>

      <div className="cleaning__tools">
        <button type="button" className="tool-btn tool-btn--purple" onClick={handleRemoveDuplicates}>
          🧹 Remove Duplicates
        </button>
        <button type="button" className="tool-btn tool-btn--sky" onClick={handleFixCapitalization}>
          🔤 Fix Capitalization
        </button>
        <button type="button" className="tool-btn tool-btn--ghost" onClick={handleReset}>
          ↩ Start Over
        </button>
      </div>

      <div className="cleaning__table-wrap">
        <table className="cleaning-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isDup = duplicateIndexes.has(i)
              const isCapIssue = capIssueIndexes.has(i)
              const isBlank = blankIndexes.has(i)

              return (
                <tr key={i} className={isDup ? 'is-duplicate' : ''}>
                  {columns.map((col) => {
                    if (col.key !== textColumnKey) {
                      return (
                        <td key={col.key} className="cleaning-cell">
                          {col.format === 'currency' ? formatAmount(row[col.key]) : row[col.key]}
                        </td>
                      )
                    }

                    return (
                      <td
                        key={col.key}
                        className={`cleaning-cell${isBlank ? ' cleaning-cell--blank' : ''}${
                          isCapIssue ? ' cleaning-cell--cap-issue' : ''
                        }${activeBlank === i ? ' cleaning-cell--open' : ''}`}
                        title={isBlank ? 'This cell is empty — click to fill it in.' : undefined}
                        onClick={() => isBlank && setActiveBlank(activeBlank === i ? null : i)}
                      >
                        {isBlank ? '' : row[textColumnKey]}
                        {activeBlank === i && (
                          <div className="fill-popover">
                            {textOptions.map((opt) => (
                              <button key={opt} type="button" onClick={() => handleFillBlank(i, opt)}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isClean ? (
        <div className="step-success">
          <p>✨ All clean! No duplicates, consistent text, and no blanks.</p>
          <button type="button" className="tool-btn tool-btn--purple" onClick={onContinue}>
            Continue →
          </button>
        </div>
      ) : (
        <p className="step-hint">
          {duplicateIndexes.size > 0 &&
            `${duplicateIndexes.size} duplicate row${duplicateIndexes.size > 1 ? 's' : ''} found. `}
          {capIssueIndexes.size > 0 &&
            `${capIssueIndexes.size} cell${capIssueIndexes.size > 1 ? 's' : ''} need matching capitalization. `}
          {blankIndexes.size > 0 && `${blankIndexes.size} blank cell${blankIndexes.size > 1 ? 's' : ''} to fill in.`}
        </p>
      )}
    </div>
  )
}

export default CleaningStep
