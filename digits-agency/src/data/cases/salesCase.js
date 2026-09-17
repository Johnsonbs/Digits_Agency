const rows = [
  { item: 'Stickers', price: 0.5, quantity: 12 },
  { item: 'Lemonade', price: 1.5, quantity: 6 },
  { item: 'Bookmarks', price: 0.75, quantity: 3 },
  { item: 'Erasers', price: 0.25, quantity: 8 },
]

// Matches Lemonade's own quantity so it's referenceable as a COUNTIF
// threshold cell — there's no numeric-literal block, only cell references.
const POPULAR_THRESHOLD = 6

const rawColumns = [
  { key: 'item', label: 'Item', letter: 'A' },
  { key: 'price', label: 'Price', letter: 'B', format: 'currency' },
  { key: 'quantity', label: 'Quantity', letter: 'C' },
]

function currency(n) {
  return `$${Number(n).toFixed(2)}`
}

const salesCase1 = {
  caseNumber: 1,
  idKey: 'item',
  idPlural: 'items',
  title: 'Open for Business',
  steps: ['entry', 'cleaning', 'analysis', 'interpretation'],
  brief: {
    problem:
      "Digit's Corner Store just opened its doors. Enter the day's sales, clean up the register log, and find out what's actually selling.",
    blockIds: ['MULTIPLY', 'SUM', 'COUNTIF', 'IF'],
    payout: 50,
  },

  entry: {
    intro: "Digit's Corner Store just opened its doors! Read the order sheet, then enter today's numbers into the grid.",
    caseFileTitle: '📋 Order Sheet',
    columns: rawColumns,
    rows,
    clue: (row) => `"${row.item}" — $${row.price.toFixed(2)} each, ${row.quantity} sold today.`,
  },

  cleaning: {
    intro:
      "The register log from today is messy! Use the tools below to remove duplicate sales, fix mismatched item names, and fill in any blanks.",
    columns: [
      { key: 'buyer', label: 'Buyer' },
      { key: 'item', label: 'Item' },
      { key: 'amount', label: 'Amount', format: 'currency' },
    ],
    seedRows: [
      { buyer: 'Zoe', item: 'Stickers', amount: 6.0 },
      { buyer: 'Kai', item: 'Lemonade', amount: 9.0 },
      { buyer: 'Zoe', item: 'Stickers', amount: 6.0 },
      { buyer: 'Ben', item: 'stickers', amount: 3.0 },
      { buyer: 'Mia', item: 'Erasers', amount: 2.0 },
      { buyer: 'Theo', item: 'LEMONADE', amount: 4.5 },
      { buyer: 'Ivy', item: 'Bookmarks', amount: 2.25 },
      { buyer: 'Sam', item: '', amount: 1.5 },
    ],
    textColumnKey: 'item',
  },

  analysis: {
    columns: [
      ...rawColumns,
      { key: 'total', label: 'Total', letter: 'D', format: 'currency', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows,
    computeTotal: (row) => row.price * row.quantity,
    computeMetric: (row) => row.quantity,
    threshold: POPULAR_THRESHOLD,
    statusLabels: { pass: 'Popular', fail: 'Slow' },
    labelBlocks: [
      { id: 'POPULAR', label: '🏷️ Popular', kind: 'literal', value: 'Popular' },
      { id: 'SLOW', label: '🏷️ Slow', kind: 'literal', value: 'Slow' },
    ],
    grandTotalLabel: 'Grand Total — how much did the store make today?',
    formatGrandTotal: currency,
    summaryQuestion: `How many items sold more than ${POPULAR_THRESHOLD}?`,
  },

  buildInsight(_key, result) {
    const total = rows.length
    const pct = Math.round((result / total) * 100)
    return {
      message: `${result} out of ${total} items are flying off the shelves at Digit's Corner Store! That's ${pct}% of the inventory selling like hotcakes.`,
      question: 'What should the store focus on next?',
      options: [
        { id: 'restock-popular', label: 'Order more of what sold well', ideal: true },
        { id: 'restock-all', label: 'Order the same amount of everything', ideal: false },
        { id: 'discount-all', label: 'Put everything on sale', ideal: false },
      ],
      idealFeedback: 'Smart! Stocking up on what customers actually want keeps the shelves full and the register happy. 🛒',
      nudgeFeedback: 'Take a peek at the Status column again — which items are actually Popular?',
    }
  },
}

export const salesCases = [salesCase1]
