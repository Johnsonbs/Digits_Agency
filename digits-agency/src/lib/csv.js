export const MAX_CSV_BYTES = 1 * 1024 * 1024 // 1MB, generous for a kid-sized dataset
export const MAX_CSV_ROWS = 500

export class CsvError extends Error {}

function tokenizeCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    pushField()
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const c = text[i]

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
      continue
    }

    if (c === '"') inQuotes = true
    else if (c === ',') pushField()
    else if (c === '\n') pushRow()
    else if (c === '\r') continue
    else field += c
  }

  if (field.length || row.length) pushRow()

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''))
}

function coerceValue(raw) {
  const trimmed = (raw ?? '').trim()
  if (trimmed === '') return ''
  const num = Number(trimmed)
  return Number.isNaN(num) ? trimmed : num
}

export function parseCSV(text) {
  const rawRows = tokenizeCSV(text)
  if (!rawRows.length) {
    throw new CsvError("That file looks empty — try a CSV with a header row and some data.")
  }

  const [headerRow, ...dataRows] = rawRows
  if (!dataRows.length) {
    throw new CsvError('That CSV only has a header row — add some data rows and try again.')
  }

  const columns = headerRow.map((h, i) => ({
    key: `col${i}`,
    label: h.trim() || `Column ${i + 1}`,
  }))

  const truncated = dataRows.length > MAX_CSV_ROWS
  const limitedRows = truncated ? dataRows.slice(0, MAX_CSV_ROWS) : dataRows

  const rows = limitedRows.map((r) => {
    const obj = {}
    columns.forEach((col, i) => {
      obj[col.key] = coerceValue(r[i])
    })
    return obj
  })

  return { columns, rows, truncated }
}
