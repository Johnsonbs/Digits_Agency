import './SpreadsheetGrid.css'

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

function targetKey(colKey, rowIndex) {
  return `${colKey}:${rowIndex}`
}

function SpreadsheetGrid({ columns, rows, results, target, selectedCell, referencedCells, onCellClick }) {
  const isSelected = (rowIndex, colKey) =>
    selectedCell && selectedCell.row === rowIndex && selectedCell.colKey === colKey

  const isReferenced = (rowIndex, colKey) => referencedCells.has(`${rowIndex}-${colKey}`)

  const renderCellContent = (row, rowIndex, column) => {
    if (!column.targetable) {
      const raw = row[column.key]
      return column.format === 'currency' ? formatPrice(raw) : raw
    }

    const key = targetKey(column.key, rowIndex)
    const solved = results[key]
    if (solved) return column.format === 'currency' ? formatPrice(solved.value) : solved.value
    return target === key ? 'Solving…' : '?'
  }

  return (
    <div className="grid-wrap">
      <table className="sheet">
        <thead>
          <tr className="sheet__letters">
            <th />
            {columns.map((col) => (
              <th key={col.key}>{col.letter}</th>
            ))}
          </tr>
          <tr>
            <th />
            {columns.map((col) => (
              <th key={col.key} className="sheet__label">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th className="sheet__row-number">{rowIndex + 1}</th>
              {columns.map((column) => {
                const key = targetKey(column.key, rowIndex)
                const solved = column.targetable && results[key]
                const isTarget = column.targetable && target === key

                const classNames = ['sheet__cell']
                if (column.targetable) classNames.push('sheet__cell--output')
                if (isTarget) classNames.push('sheet__cell--target')
                if (solved) classNames.push('sheet__cell--solved')
                if (isSelected(rowIndex, column.key)) classNames.push('sheet__cell--selected')
                if (isReferenced(rowIndex, column.key)) classNames.push('sheet__cell--referenced')

                return (
                  <td
                    key={column.key}
                    className={classNames.join(' ')}
                    onClick={() => onCellClick(rowIndex, column.key)}
                  >
                    {renderCellContent(row, rowIndex, column)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SpreadsheetGrid
