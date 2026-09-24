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
  steps: ['entry', 'cleaning'],
  brief: {
    problem:
      "Digit's Corner Store just opened its doors. Enter the day's sales, then clean up the register log so today's numbers are ready to use.",
    blockIds: [],
    payout: 20,
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
}

// ---------- Case 2: What's Actually Selling? ----------

const salesCase2 = {
  caseNumber: 2,
  idKey: 'item',
  idPlural: 'items',
  title: "What's Actually Selling?",
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "The register's clean and today's numbers are entered. Store rule: any item that sold more than 6 today is Popular. Multiply price by quantity to find each item's total, add up the Grand Total, then flag which items are Popular versus Slow.",
    blockIds: ['MULTIPLY', 'SUM', 'COUNTIF', 'IF'],
    payout: 40,
  },

  analysis: {
    intro: 'Store rule: any item that sold more than 6 today is Popular. 6 or fewer is Slow.',
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

// ---------- Case 3: Till Count ----------

const salesCase3Rows = [
  { source: 'Bills', amount: 16.0 },
  { source: 'Coins', amount: 4.25 },
  { source: 'Checks', amount: 5.0 },
  { source: 'Mobile Pay', amount: 3.75 },
]

const salesCase3 = {
  caseNumber: 3,
  idKey: 'source',
  idPlural: 'sources',
  title: 'Till Count',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Day 2 is done and the drawer needs counting before the safe closes. Add up every source of cash to find today's total.",
    blockIds: ['SUM'],
    payout: 30,
  },
  analysis: {
    columns: [
      { key: 'source', label: 'Source', letter: 'A' },
      { key: 'amount', label: 'Amount', letter: 'B', format: 'currency' },
    ],
    rows: salesCase3Rows,
    computeTotal: (row) => row.amount,
    hasSummary: false,
    grandTotalLabel: "Grand Total — how much cash is in today's drawer?",
    formatGrandTotal: currency,
  },
  buildInsight(_key, result) {
    return {
      message: `Day 2 brought in ${currency(result)} across bills, coins, checks, and mobile pay — a solid second day for Digit's Corner Store!`,
      question: 'Why bother adding up every source of cash instead of just eyeballing the drawer?',
      options: [
        { id: 'compare-days', label: "Track it so you can compare it to tomorrow's total", ideal: true },
        { id: 'spend-it', label: 'Spend it all on new inventory right away', ideal: false },
        { id: 'skip-it', label: "Skip counting — one day doesn't matter", ideal: false },
      ],
      idealFeedback: 'Exactly — tracking each day is how you spot whether the store is actually growing! 📈',
      nudgeFeedback: 'A single number only means something once you have another day to compare it to.',
    }
  },
}

// ---------- Case 4: Best Sellers ----------

const salesCase4Rows = [
  { item: 'Stickers', mon: 6, tue: 7, wed: 5 },
  { item: 'Lemonade', mon: 3, tue: 2, wed: 4 },
  { item: 'Bookmarks', mon: 2, tue: 1, wed: 3 },
  { item: 'Erasers', mon: 5, tue: 6, wed: 7 },
]
const SALES_CASE4_THRESHOLD = 5

const salesCase4 = {
  caseNumber: 4,
  idKey: 'item',
  idPlural: 'items',
  title: 'Best Sellers',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Three days of sales are in. Store rule: any item averaging more than 5 sales a day is a Restock Priority. Average each item's daily sales to see what's really moving.",
    blockIds: ['AVERAGE', 'COUNTIF', 'IF'],
    payout: 45,
  },
  analysis: {
    intro: `Store rule: any item averaging more than ${SALES_CASE4_THRESHOLD} sales a day this week is a Restock Priority. ${SALES_CASE4_THRESHOLD} or fewer stays on the Watch List.`,
    columns: [
      { key: 'item', label: 'Item', letter: 'A' },
      { key: 'mon', label: 'Mon', letter: 'B' },
      { key: 'tue', label: 'Tue', letter: 'C' },
      { key: 'wed', label: 'Wed', letter: 'D' },
      { key: 'total', label: 'Avg Daily Sales', letter: 'E', targetable: true },
      { key: 'status', label: 'Status', letter: 'F', targetable: true },
    ],
    rows: salesCase4Rows,
    computeTotal: (row) => (row.mon + row.tue + row.wed) / 3,
    computeMetric: (row) => (row.mon + row.tue + row.wed) / 3,
    threshold: SALES_CASE4_THRESHOLD,
    statusLabels: { pass: 'Restock Priority', fail: 'Watch List' },
    labelBlocks: [
      { id: 'RESTOCK_PRIORITY', label: '📦 Restock Priority', kind: 'literal', value: 'Restock Priority' },
      { id: 'WATCH_LIST', label: '👀 Watch List', kind: 'literal', value: 'Watch List' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many items are averaging more than ${SALES_CASE4_THRESHOLD} sales a day?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} item${result === 1 ? ' is' : 's are'} averaging more than ${SALES_CASE4_THRESHOLD} sales a day — those are the ones the store can't afford to run out of.`,
      question: 'Why look at the daily average instead of just one great day?',
      options: [
        { id: 'trend', label: 'It shows a real pattern, not just one lucky day', ideal: true },
        { id: 'best-day', label: 'Only the single best day matters', ideal: false },
        { id: 'ignore', label: "Averages don't tell you anything useful", ideal: false },
      ],
      idealFeedback: 'Right — an average smooths out the lucky days and the slow days into the real trend. 📊',
      nudgeFeedback: 'One great day could be a fluke — what does the average across all three days actually show?',
    }
  },
}

// ---------- Case 5: The Rival Shop ----------

const salesCase5Rows = [
  { shop: 'Ivy Lane Books', itemToCheck: 'Stickers', note: 'Best-sellers include journals and bookmarks' },
  { shop: "Sunny's Snack Stop", itemToCheck: 'Stickers', note: 'Known for candy, juice boxes, and lemonade' },
  { shop: 'The Nickel Nook', itemToCheck: 'Stickers', note: 'Popular for erasers, pencils, and stickers' },
]

function findInNote(note, term) {
  const index = note.toLowerCase().indexOf(term.toLowerCase())
  return index === -1 ? 'Not found' : index + 1
}

const salesCase5 = {
  caseNumber: 5,
  idKey: 'shop',
  idPlural: 'shops',
  title: 'The Rival Shop',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Case 4 showed Stickers are outselling everything else. Now find out if The Nickel Nook, the shop down the street, carries them too — search its inventory note for the word Stickers.",
    blockIds: ['FIND'],
    payout: 45,
  },
  analysis: {
    columns: [
      { key: 'shop', label: 'Shop', letter: 'A' },
      { key: 'itemToCheck', label: 'Item to Check', letter: 'B' },
      { key: 'note', label: 'Inventory Note', letter: 'C' },
    ],
    rows: salesCase5Rows,
    hasGrandTotal: false,
    computeSummary: (rows) => findInNote(rows[2].note, rows[2].itemToCheck),
    summaryQuestion: "Does The Nickel Nook's note mention Stickers? (FIND the item in their note)",
  },
  buildInsight(_key, result) {
    const found = result !== 'Not found'
    return {
      message: found
        ? "The Nickel Nook's inventory note mentions stickers too — the rival shop sells the exact same top item."
        : "The Nickel Nook's note doesn't mention stickers at all — that's one item they don't compete on.",
      question: found ? 'A rival sells your best-seller too. What now?' : 'What should the store check next?',
      options: found
        ? [
            { id: 'stand-out', label: 'Think about what makes Digit\'s Corner Store special anyway', ideal: true },
            { id: 'copy', label: 'Copy everything the rival shop does immediately', ideal: false },
            { id: 'shrug', label: "It doesn't matter what rivals sell", ideal: false },
          ]
        : [
            { id: 'other-items', label: 'Check what else the rival shop carries', ideal: true },
            { id: 'assume', label: 'Assume they never will', ideal: false },
            { id: 'shrug', label: "It doesn't matter what rivals sell", ideal: false },
          ],
      idealFeedback: 'Smart — knowing what a rival sells helps you decide how to compete, not just react. 🔍',
      nudgeFeedback: "Read The Nickel Nook's note again closely — does the word \"stickers\" show up in it?",
    }
  },
}

// ---------- Case 6: Split the Register ----------

const salesCase6Rows = [
  { day: 'Mon', till: 30, shifts: 2 },
  { day: 'Tue', till: 50, shifts: 2 },
  { day: 'Wed', till: 24, shifts: 2 },
  { day: 'Thu', till: 46, shifts: 2 },
  { day: 'Fri', till: 38, shifts: 2 },
]
const SALES_CASE6_THRESHOLD = 20

const salesCase6 = {
  caseNumber: 6,
  idKey: 'day',
  idPlural: 'shifts',
  title: 'Split the Register',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "The store's busy enough now to need a morning and an afternoon shift. Store rule: if a shift's fair share of the till is more than $20, it's a Busy Shift that needs two people on the floor. Divide each day's till in half to see which shifts need the extra hand.",
    blockIds: ['DIVIDE', 'IF'],
    payout: 50,
  },
  analysis: {
    intro: `Store rule: if a shift's fair share of the till is more than ${currency(
      SALES_CASE6_THRESHOLD,
    )}, it's a Busy Shift that needs two people. ${currency(SALES_CASE6_THRESHOLD)} or less is a Normal Shift with one person.`,
    columns: [
      { key: 'day', label: 'Day', letter: 'A' },
      { key: 'till', label: 'Till Total', letter: 'B', format: 'currency' },
      { key: 'shifts', label: 'Shifts', letter: 'C' },
      { key: 'total', label: 'Fair Share', letter: 'D', format: 'currency', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows: salesCase6Rows,
    computeTotal: (row) => row.till / row.shifts,
    computeMetric: (row) => row.till / row.shifts,
    threshold: SALES_CASE6_THRESHOLD,
    statusLabels: { pass: 'Busy Shift', fail: 'Normal Shift' },
    labelBlocks: [
      { id: 'BUSY_SHIFT', label: '⚡ Busy Shift', kind: 'literal', value: 'Busy Shift' },
      { id: 'NORMAL_SHIFT', label: '🙂 Normal Shift', kind: 'literal', value: 'Normal Shift' },
    ],
    grandTotalLabel: 'Grand Total — every fair share added up',
    formatGrandTotal: currency,
    summaryQuestion: `How many shifts were Busy Shifts (fair share more than ${currency(SALES_CASE6_THRESHOLD)})?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} shift${result === 1 ? '' : 's'} this week counted as a Busy Shift, needing two people to keep up with customers.`,
      question: 'Why calculate a fair share per shift instead of just looking at the whole day\'s till?',
      options: [
        { id: 'half-day', label: 'It shows how busy each half of the day really was', ideal: true },
        { id: 'whole-day', label: 'The whole day\'s total is all that matters', ideal: false },
        { id: 'shrug', label: "Shift math doesn't matter, staffing never changes", ideal: false },
      ],
      idealFeedback: "Exactly — splitting it fairly shows which half of the day actually needs the extra help. ⚖️",
      nudgeFeedback: "A busy whole day might just be one busy half — what does splitting it in two actually reveal?",
    }
  },
}

// ---------- Case 7: The Restock List ----------

const salesCase7Rows = [
  { item: 'Stickers', unitCost: 0.2, quantityToOrder: 50 },
  { item: 'Erasers', unitCost: 0.1, quantityToOrder: 40 },
  { item: 'Bookmarks', unitCost: 0.3, quantityToOrder: 20 },
  { item: 'Lemonade Mix', unitCost: 0.6, quantityToOrder: 15 },
]

const salesCase7 = {
  caseNumber: 7,
  idKey: 'item',
  idPlural: 'items',
  title: 'The Restock List',
  steps: ['cleaning', 'analysis', 'interpretation'],
  brief: {
    problem:
      "Case 4 showed what's really selling. Now the supplier order list needs cleaning up before you can place the restock order — then multiply each item's cost by how much you're ordering to see the total.",
    blockIds: ['MULTIPLY', 'SUM'],
    payout: 55,
  },
  cleaning: {
    intro:
      'The supplier order list is a mess! Use the tools below to remove duplicate orders, fix mismatched item names, and fill in any blanks before you place the restock order.',
    columns: [
      { key: 'supplier', label: 'Supplier' },
      { key: 'item', label: 'Item' },
      { key: 'cost', label: 'Cost', format: 'currency' },
    ],
    seedRows: [
      { supplier: 'BulkBins Co', item: 'Stickers', cost: 15 },
      { supplier: 'PaperWorks', item: 'Erasers', cost: 8 },
      { supplier: 'BulkBins Co', item: 'Stickers', cost: 15 },
      { supplier: 'CraftSupply', item: 'stickers', cost: 12 },
      { supplier: 'PaperWorks', item: 'ERASERS', cost: 9 },
      { supplier: 'InkWell', item: 'Bookmarks', cost: 6 },
      { supplier: 'JuiceBox Ltd', item: 'Lemonade', cost: 10 },
      { supplier: 'Mystery Vendor', item: '', cost: 5 },
    ],
    textColumnKey: 'item',
  },
  analysis: {
    columns: [
      { key: 'item', label: 'Item', letter: 'A' },
      { key: 'unitCost', label: 'Unit Cost', letter: 'B', format: 'currency' },
      { key: 'quantityToOrder', label: 'Qty to Order', letter: 'C' },
      { key: 'total', label: 'Order Cost', letter: 'D', format: 'currency', targetable: true },
    ],
    rows: salesCase7Rows,
    computeTotal: (row) => row.unitCost * row.quantityToOrder,
    hasSummary: false,
    grandTotalLabel: 'Grand Total — the full restock order cost',
    formatGrandTotal: currency,
  },
  buildInsight(_key, result) {
    return {
      message: `Restocking Stickers, Erasers, Bookmarks, and Lemonade Mix will cost ${currency(result)} altogether.`,
      question: 'What should the store check before placing an order this size?',
      options: [
        { id: 'check-cash', label: "Make sure there's enough cash on hand to cover it", ideal: true },
        { id: 'double', label: 'Order double of everything just in case', ideal: false },
        { id: 'ignore-cost', label: "Cost doesn't matter, just order everything", ideal: false },
      ],
      idealFeedback: 'Smart — knowing the total cost before you order keeps the store out of trouble. 💡',
      nudgeFeedback: `The order comes out to ${currency(result)} — is that a number you'd want to check against your cash first?`,
    }
  },
}

// ---------- Case 8: Rainy Day Sales ----------

const salesCase8Rows = [
  { item: 'Hot Cocoa Mix', price: 2.0, quantity: 4 },
  { item: 'Umbrella Stickers', price: 0.75, quantity: 5 },
  { item: 'Board Games', price: 3.0, quantity: 2 },
]

const salesCase8 = {
  caseNumber: 8,
  idKey: 'item',
  idPlural: 'items',
  title: 'Rainy Day Sales',
  steps: ['entry'],
  brief: {
    problem: 'Rain kept most customers away today, but a few still stopped in. Just get the numbers into the system.',
    blockIds: [],
    payout: 25,
  },
  entry: {
    intro: "It's a quiet, rainy day at the store. Read the order sheet, then enter today's numbers into the grid.",
    caseFileTitle: '🌧️ Rainy Day Log',
    columns: [
      { key: 'item', label: 'Item', letter: 'A' },
      { key: 'price', label: 'Price', letter: 'B', format: 'currency' },
      { key: 'quantity', label: 'Quantity', letter: 'C' },
    ],
    rows: salesCase8Rows,
    clue: (row) => `"${row.item}" — $${row.price.toFixed(2)} each, ${row.quantity} sold today.`,
  },
}

// ---------- Case 9: The Discount Test ----------

const salesCase9Rows = [
  { item: 'Stickers', price: 0.5, rate: 0.8 },
  { item: 'Lemonade', price: 1.5, rate: 0.8 },
  { item: 'Bookmarks', price: 0.75, rate: 0.8 },
  { item: 'Erasers', price: 0.25, rate: 0.8 },
]
const SALES_CASE9_THRESHOLD = 0.5

const salesCase9 = {
  caseNumber: 9,
  idKey: 'item',
  idPlural: 'items',
  title: 'The Discount Test',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Case 2 flagged Lemonade and Bookmarks as Slow. Store rule: multiply each price by 0.8 for a 20% discount — if the discounted price is still above $0.50, it's Discount OK. Test the discount on every item before running the sale.",
    blockIds: ['MULTIPLY', 'IF'],
    payout: 55,
  },
  analysis: {
    intro: `Store rule: multiply each price by its discount rate for a 20% cut. If the discounted price is still above ${currency(
      SALES_CASE9_THRESHOLD,
    )}, it's Discount OK. ${currency(SALES_CASE9_THRESHOLD)} or under is Too Thin.`,
    columns: [
      { key: 'item', label: 'Item', letter: 'A' },
      { key: 'price', label: 'Price', letter: 'B', format: 'currency' },
      { key: 'rate', label: 'Discount Rate', letter: 'C' },
      { key: 'total', label: 'Discounted Price', letter: 'D', format: 'currency', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows: salesCase9Rows,
    computeTotal: (row) => row.price * row.rate,
    computeMetric: (row) => row.price * row.rate,
    threshold: SALES_CASE9_THRESHOLD,
    statusLabels: { pass: 'Discount OK', fail: 'Too Thin' },
    labelBlocks: [
      { id: 'DISCOUNT_OK', label: '✅ Discount OK', kind: 'literal', value: 'Discount OK' },
      { id: 'TOO_THIN', label: '🪙 Too Thin', kind: 'literal', value: 'Too Thin' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many items are still Discount OK after a 20% cut (discounted price above ${currency(SALES_CASE9_THRESHOLD)})?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} item${result === 1 ? '' : 's'} can still handle a 20% discount and stay Discount OK — the rest are already priced too low to cut further.`,
      question: 'Why test the discounted price before running a sale, instead of just discounting everything?',
      options: [
        { id: 'avoid-thin', label: "So you don't accidentally sell something for almost nothing", ideal: true },
        { id: 'discount-all', label: 'Discount everything by the same amount no matter what', ideal: false },
        { id: 'ignore-price', label: "The discounted price doesn't matter as long as it's on sale", ideal: false },
      ],
      idealFeedback: 'Exactly — checking the math first keeps a sale from turning into a loss. 💡',
      nudgeFeedback: "Look at the Status column — which items still have room to be discounted safely?",
    }
  },
}

// ---------- Case 10: Payroll Day ----------

const salesCase10Rows = [
  { employee: 'Rosa', rate: 12, hours: 15 },
  { employee: 'Deja', rate: 10, hours: 20 },
  { employee: 'Theo', rate: 11, hours: 19 },
]

const salesCase10 = {
  caseNumber: 10,
  idKey: 'employee',
  idPlural: 'employees',
  title: 'Payroll Day',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Business is good enough that the store hired its first employees — Rosa, Deja, and even Theo, one of the shop's very first customers! Multiply each person's rate by their hours to find their pay, then find the average hours worked.",
    blockIds: ['MULTIPLY', 'SUM', 'AVERAGE'],
    payout: 55,
  },
  analysis: {
    columns: [
      { key: 'employee', label: 'Employee', letter: 'A' },
      { key: 'rate', label: 'Hourly Rate', letter: 'B', format: 'currency' },
      { key: 'hours', label: 'Hours', letter: 'C' },
      { key: 'total', label: 'Pay', letter: 'D', format: 'currency', targetable: true },
    ],
    rows: salesCase10Rows,
    computeTotal: (row) => row.rate * row.hours,
    computeSummary: (rows) => rows.reduce((sum, r) => sum + r.hours, 0) / rows.length,
    grandTotalLabel: 'Grand Total — total payroll this week',
    formatGrandTotal: currency,
    summaryQuestion: 'What was the average number of hours worked this week?',
  },
  buildInsight(_key, result) {
    return {
      message: `The team averaged ${result} hours each this week. Remember Theo from opening day, buying lemonade? Now he's on the payroll!`,
      question: 'Why track both the total payroll and the average hours worked?',
      options: [
        { id: 'both', label: 'Total shows the cost, average shows if the schedule is balanced', ideal: true },
        { id: 'total-only', label: 'Only the total matters — forget the hours', ideal: false },
        { id: 'irrelevant', label: "Payroll math isn't important once people are hired", ideal: false },
      ],
      idealFeedback: "Right — the two numbers answer two different questions, and a good manager needs both. 📋",
      nudgeFeedback: 'The total tells you what you spent — what does the average hours tell you about the schedule?',
    }
  },
}

// ---------- Case 11: Two Weeks Compared ----------

const salesCase11Rows = [
  { day: 'Mon', sales: 38 },
  { day: 'Tue', sales: 45 },
  { day: 'Wed', sales: 50 },
  { day: 'Thu', sales: 40 },
  { day: 'Fri', sales: 55 },
  { day: 'Sat', sales: 60 },
  { day: 'Sun', sales: 47 },
]
const SALES_CASE11_THRESHOLD = 42

const salesCase11 = {
  caseNumber: 11,
  idKey: 'day',
  idPlural: 'days',
  title: 'Two Weeks Compared',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem: `Week 1's best day brought in ${currency(
      SALES_CASE11_THRESHOLD,
    )}. Count how many days in Week 2 beat that record.`,
    blockIds: ['COUNTIF', 'IF'],
    payout: 60,
  },
  analysis: {
    intro: `Store record: Week 1's best day sold ${currency(SALES_CASE11_THRESHOLD)}. Any Week 2 day that sold for more than that beats the record.`,
    columns: [
      { key: 'day', label: 'Day', letter: 'A' },
      { key: 'sales', label: 'Sales', letter: 'B', format: 'currency' },
      { key: 'status', label: 'Status', letter: 'C', targetable: true },
    ],
    rows: salesCase11Rows,
    computeMetric: (row) => row.sales,
    threshold: SALES_CASE11_THRESHOLD,
    statusLabels: { pass: 'Record Beater', fail: 'Under Record' },
    labelBlocks: [
      { id: 'RECORD_BEATER', label: '🏆 Record Beater', kind: 'literal', value: 'Record Beater' },
      { id: 'UNDER_RECORD', label: '📉 Under Record', kind: 'literal', value: 'Under Record' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many days in Week 2 beat Week 1's best day (${currency(SALES_CASE11_THRESHOLD)})?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} day${result === 1 ? '' : 's'} in Week 2 beat Week 1's best-ever day. The store isn't just having good days anymore — it's having more of them.`,
      question: 'What does beating last week\'s record multiple times in a row suggest?',
      options: [
        { id: 'growth', label: "It's a sign the store is genuinely growing week over week", ideal: true },
        { id: 'fluke', label: 'One big day means nothing really changed', ideal: false },
        { id: 'irrelevant', label: "Records don't matter, ignore them", ideal: false },
      ],
      idealFeedback: 'Exactly — a pattern across many days is real growth, not just a lucky streak. 📈',
      nudgeFeedback: 'Look at how many days crossed the line, not just whether one did.',
    }
  },
}

// ---------- Case 12: Profit or Loss? ----------

const salesCase12Rows = [
  { week: 'Week 1', revenue: 200, profit: 40 },
  { week: 'Week 2', revenue: 250, profit: 25 },
  { week: 'Week 3', revenue: 300, profit: 90 },
  { week: 'Week 4', revenue: 220, profit: 11 },
  { week: 'Week 5', revenue: 260, profit: 78 },
]
const SALES_CASE12_THRESHOLD = 0.2

const salesCase12 = {
  caseNumber: 12,
  idKey: 'week',
  idPlural: 'weeks',
  title: 'Profit or Loss?',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Payroll (Case 10) and supply costs (Case 7) both eat into revenue. Store rule: divide each week's profit by its revenue to get a profit margin. A margin above 0.20 is a Healthy Profit week — see how many weeks actually cleared it.",
    blockIds: ['DIVIDE', 'IF'],
    payout: 65,
  },
  analysis: {
    intro: `Store rule: divide each week's profit by its revenue to get the profit margin. A margin above ${SALES_CASE12_THRESHOLD} is a Healthy Profit week. ${SALES_CASE12_THRESHOLD} or below is a Thin Margin week.`,
    columns: [
      { key: 'week', label: 'Week', letter: 'A' },
      { key: 'revenue', label: 'Revenue', letter: 'B', format: 'currency' },
      { key: 'profit', label: 'Profit', letter: 'C', format: 'currency' },
      { key: 'total', label: 'Margin', letter: 'D', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows: salesCase12Rows,
    computeTotal: (row) => row.profit / row.revenue,
    computeMetric: (row) => row.profit / row.revenue,
    threshold: SALES_CASE12_THRESHOLD,
    statusLabels: { pass: 'Healthy Profit', fail: 'Thin Margin' },
    labelBlocks: [
      { id: 'HEALTHY_PROFIT', label: '💪 Healthy Profit', kind: 'literal', value: 'Healthy Profit' },
      { id: 'THIN_MARGIN', label: '🪙 Thin Margin', kind: 'literal', value: 'Thin Margin' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many weeks had a Healthy Profit (margin above ${SALES_CASE12_THRESHOLD})?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} week${result === 1 ? '' : 's'} posted a Healthy Profit margin above ${SALES_CASE12_THRESHOLD} — proof the store can turn a strong profit when everything lines up.`,
      question: "The owner wants to open a second location. What should decide if now's the time?",
      options: [
        { id: 'check-margins', label: 'Look at whether profit has been strong and consistent enough', ideal: true },
        { id: 'just-open', label: "Open a second store no matter what the numbers say", ideal: false },
        { id: 'ignore-margins', label: "Profit margins don't matter for expansion", ideal: false },
      ],
      idealFeedback: 'Right — real growth decisions lean on the numbers, not just excitement. 📊',
      nudgeFeedback: 'Look back at the Status column — how many weeks actually made it to Healthy Profit?',
    }
  },
}

// ---------- Case 13: Grand Opening #2 ----------

const salesCase13EntryRows = [
  { location: 'Riverside Plaza', day: 'Sat', sales: 60 },
  { location: 'Riverside Plaza', day: 'Sun', sales: 70 },
  { location: 'Main Street Corner', day: 'Sat', sales: 40 },
  { location: 'Main Street Corner', day: 'Sun', sales: 45 },
]

const salesCase13Rows = [
  { location: 'Riverside Plaza', fri: 50, sat: 60, sun: 70 },
  { location: 'Main Street Corner', fri: 35, sat: 40, sun: 45 },
]
const SALES_CASE13_THRESHOLD = 50

const salesCase13 = {
  caseNumber: 13,
  idKey: 'location',
  idPlural: 'locations',
  title: 'Grand Opening #2',
  steps: ['entry', 'cleaning', 'analysis', 'interpretation'],
  brief: {
    problem:
      "Case 12 proved the store can turn a real profit. Now two candidate spots — Riverside Plaza and Main Street Corner — ran a trial weekend. Store rule: any location averaging more than $50 a day earns the Green Light for Grand Opening #2. Enter the trial data, clean up the combined log, then find the winner.",
    blockIds: ['AVERAGE', 'COUNTIF', 'IF'],
    payout: 80,
  },
  entry: {
    intro: 'Two candidate locations just finished a trial weekend. Read the results, then enter them into the grid below.',
    caseFileTitle: '📋 Trial Weekend Results',
    columns: [
      { key: 'location', label: 'Location' },
      { key: 'day', label: 'Day' },
      { key: 'sales', label: 'Sales', format: 'currency' },
    ],
    rows: salesCase13EntryRows,
    clue: (row) => `"${row.location}" on ${row.day} — ${currency(row.sales)} in trial sales.`,
  },
  cleaning: {
    intro:
      'The combined trial log from both locations is a mess! Use the tools below to remove duplicate entries, fix mismatched location names, and fill in any blanks.',
    columns: [
      { key: 'location', label: 'Location' },
      { key: 'day', label: 'Day' },
      { key: 'sales', label: 'Sales', format: 'currency' },
    ],
    seedRows: [
      { location: 'Riverside Plaza', day: 'Sat', sales: 60 },
      { location: 'Main Street Corner', day: 'Sat', sales: 40 },
      { location: 'Riverside Plaza', day: 'Sat', sales: 60 },
      { location: 'riverside plaza', day: 'Sun', sales: 70 },
      { location: 'MAIN STREET CORNER', day: 'Sun', sales: 45 },
      { location: 'Riverside Plaza', day: 'Fri', sales: 50 },
      { location: 'Main Street Corner', day: 'Fri', sales: 35 },
      { location: '', day: 'Thu', sales: 20 },
    ],
    textColumnKey: 'location',
  },
  analysis: {
    intro: `Store rule: any location averaging more than ${currency(
      SALES_CASE13_THRESHOLD,
    )} a day during the trial weekend earns the Green Light for Grand Opening #2. ${currency(SALES_CASE13_THRESHOLD)} or under means Not Yet.`,
    columns: [
      { key: 'location', label: 'Location', letter: 'A' },
      { key: 'fri', label: 'Fri', letter: 'B', format: 'currency' },
      { key: 'sat', label: 'Sat', letter: 'C', format: 'currency' },
      { key: 'sun', label: 'Sun', letter: 'D', format: 'currency' },
      { key: 'total', label: 'Avg Daily Sales', letter: 'E', format: 'currency', targetable: true },
      { key: 'status', label: 'Status', letter: 'F', targetable: true },
    ],
    rows: salesCase13Rows,
    computeTotal: (row) => (row.fri + row.sat + row.sun) / 3,
    computeMetric: (row) => (row.fri + row.sat + row.sun) / 3,
    threshold: SALES_CASE13_THRESHOLD,
    statusLabels: { pass: 'Green Light', fail: 'Not Yet' },
    labelBlocks: [
      { id: 'GREEN_LIGHT', label: '🟢 Green Light', kind: 'literal', value: 'Green Light' },
      { id: 'NOT_YET', label: '⏳ Not Yet', kind: 'literal', value: 'Not Yet' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many locations earned the Green Light (averaging more than ${currency(SALES_CASE13_THRESHOLD)} a day)?`,
  },
  buildInsight(_key, result) {
    return {
      message:
        result === 1
          ? "Riverside Plaza earned the Green Light with a strong $60-a-day average — from one tiny corner store to a second location, this whole season's numbers led right here! 🎉"
          : `${result} locations are showing Green Light numbers — take one more look at the Status column before picking the winner.`,
      question: 'The season is over. What made this decision possible?',
      options: [
        { id: 'built-up', label: "Every case's numbers built toward this one call", ideal: true },
        { id: 'luck', label: 'It was mostly a lucky guess', ideal: false },
        { id: 'one-case', label: 'Only this last case\'s data mattered', ideal: false },
      ],
      idealFeedback: "Yes! Every case this season — sales, restocking, payroll, profit — added up to this decision. 🎉",
      nudgeFeedback: 'Think back over the whole season — was it really just this one trial, or everything before it too?',
    }
  },
}

export const salesCases = [
  salesCase1,
  salesCase2,
  salesCase3,
  salesCase4,
  salesCase5,
  salesCase6,
  salesCase7,
  salesCase8,
  salesCase9,
  salesCase10,
  salesCase11,
  salesCase12,
  salesCase13,
]
