export class FormulaError extends Error {}

function toNumber(value) {
  const n = Number(value)
  if (Number.isNaN(n)) throw new FormulaError("That block needs a number, not text.")
  return n
}

export function compareValues(symbol, a, b) {
  switch (symbol) {
    case '>':
      return Number(a) > Number(b)
    case '<':
      return Number(a) < Number(b)
    case '>=':
      return Number(a) >= Number(b)
    case '<=':
      return Number(a) <= Number(b)
    case '=': {
      const na = Number(a)
      const nb = Number(b)
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na === nb
      return String(a) === String(b)
    }
    default:
      throw new FormulaError('That block combination is not supported yet.')
  }
}

function applyOp(symbol, a, b) {
  if (symbol === '×') return toNumber(a) * toNumber(b)
  if (symbol === '÷') {
    const denominator = toNumber(b)
    if (denominator === 0) throw new FormulaError("Can't divide by zero!")
    return toNumber(a) / denominator
  }
  return compareValues(symbol, a, b)
}

const isValueToken = (t) => Boolean(t) && (t.kind === 'cell' || t.kind === 'literal')

function applyFunc(id, argTokens) {
  const values = argTokens.map((t) => t.value)

  switch (id) {
    case 'SUM':
      return values.reduce((sum, v) => sum + toNumber(v), 0)
    case 'AVERAGE':
      return values.reduce((sum, v) => sum + toNumber(v), 0) / values.length
    case 'COUNT':
      return values.length
    case 'FIND': {
      if (values.length < 2) {
        throw new FormulaError('FIND needs two cells: what to find, and where to look.')
      }
      const [findText, withinText] = values
      const index = String(withinText).toLowerCase().indexOf(String(findText).toLowerCase())
      return index === -1 ? 'Not found' : index + 1
    }
    default:
      throw new FormulaError('That block is not supported yet.')
  }
}

function parsePrimary(tokens, i) {
  const token = tokens[i]
  if (!token) throw new FormulaError('The formula stops too soon — add another block.')

  if (isValueToken(token)) {
    return { value: token.value, next: i + 1 }
  }

  if (token.kind === 'func') {
    if (token.id === 'IF') {
      const [left, op, right, thenTok, elseTok] = tokens.slice(i + 1, i + 6)
      if (
        !isValueToken(left) ||
        !op || op.kind !== 'op' ||
        !isValueToken(right) ||
        !isValueToken(thenTok) ||
        !isValueToken(elseTok)
      ) {
        throw new FormulaError('IF needs: a cell, a comparison, a cell, then two more values for yes/no.')
      }
      const condition = applyOp(op.symbol, left.value, right.value)
      return { value: condition ? thenTok.value : elseTok.value, next: i + 6 }
    }

    if (token.id === 'COUNTIF') {
      let j = i + 1
      const range = []
      while (isValueToken(tokens[j])) {
        range.push(tokens[j])
        j++
      }
      if (!range.length) {
        throw new FormulaError('COUNTIF needs a range of cells first.')
      }
      const opTok = tokens[j]
      if (!opTok || opTok.kind !== 'op') {
        throw new FormulaError('COUNTIF needs a comparison block (like >) after the range.')
      }
      const thresholdTok = tokens[j + 1]
      if (!isValueToken(thresholdTok)) {
        throw new FormulaError('COUNTIF needs one more cell to compare the range against.')
      }
      const count = range.filter((cell) => compareValues(opTok.symbol, cell.value, thresholdTok.value)).length
      return { value: count, next: j + 2 }
    }

    let j = i + 1
    const args = []
    while (isValueToken(tokens[j])) {
      args.push(tokens[j])
      j++
    }
    if (!args.length) {
      throw new FormulaError(`${token.label} needs at least one cell.`)
    }
    return { value: applyFunc(token.id, args), next: j }
  }

  throw new FormulaError("A formula can't start with an operator.")
}

export function evaluateFormula(tokens) {
  if (!tokens.length) throw new FormulaError('Add some blocks first!')

  let { value: acc, next: i } = parsePrimary(tokens, 0)

  while (i < tokens.length) {
    const opToken = tokens[i]
    if (!opToken || opToken.kind !== 'op') {
      throw new FormulaError('Add an operator block between values.')
    }
    const { value: rhs, next } = parsePrimary(tokens, i + 1)
    acc = applyOp(opToken.symbol, acc, rhs)
    i = next
  }

  return acc
}
