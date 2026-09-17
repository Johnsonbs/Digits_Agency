function currency(n) {
  return `$${Number(n).toFixed(2)}`
}

// ---------- Case 1: The Vanishing Jar ----------

const case1Rows = [
  { item: 'Chips', price: 2.5, quantity: 3 },
  { item: 'Cookies', price: 1, quantity: 5 },
  { item: 'Juice', price: 1.75, quantity: 2 },
  { item: 'Pretzels', price: 0.75, quantity: 4 },
]
const CASE1_THRESHOLD = 5
const case1RawColumns = [
  { key: 'item', label: 'Item', letter: 'A' },
  { key: 'price', label: 'Price', letter: 'B', format: 'currency' },
  { key: 'quantity', label: 'Quantity', letter: 'C' },
]

const case1 = {
  caseNumber: 1,
  idKey: 'item',
  idPlural: 'items',
  title: 'The Vanishing Jar',
  steps: ['entry', 'cleaning', 'analysis', 'interpretation'],
  brief: {
    problem:
      "The office candy jar keeps coming up short, and four coworkers had access. Follow the numbers and find out who's really behind it.",
    blockIds: ['MULTIPLY', 'SUM', 'COUNTIF', 'IF'],
    payout: 50,
  },
  entry: {
    intro: 'A new case just landed! Read the case file, then enter the data into the grid below.',
    caseFileTitle: '📋 Case File',
    columns: case1RawColumns,
    rows: case1Rows,
    clue: (row) => `"${row.item}" — $${row.price.toFixed(2)} each, ${row.quantity} sold this week.`,
  },
  cleaning: {
    intro:
      'This customer list is messy! Use the tools below to remove duplicate rows, fix mismatched capitalization, and fill in any blanks.',
    columns: [
      { key: 'customer', label: 'Customer' },
      { key: 'city', label: 'City' },
      { key: 'amount', label: 'Amount', format: 'currency' },
    ],
    seedRows: [
      { customer: 'Mia', city: 'New York', amount: 120 },
      { customer: 'Sam', city: 'Los Angeles', amount: 90 },
      { customer: 'Mia', city: 'New York', amount: 120 },
      { customer: 'Liam', city: 'new york', amount: 75 },
      { customer: 'Ava', city: 'Chicago', amount: 60 },
      { customer: 'Noah', city: 'LOS ANGELES', amount: 90 },
      { customer: 'Grace', city: 'NEW YORK ', amount: 45 },
      { customer: 'Ethan', city: '', amount: 55 },
    ],
    textColumnKey: 'city',
  },
  analysis: {
    columns: [
      ...case1RawColumns,
      { key: 'total', label: 'Total', letter: 'D', format: 'currency', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows: case1Rows,
    computeTotal: (row) => row.price * row.quantity,
    computeMetric: (row) => row.quantity,
    threshold: CASE1_THRESHOLD,
    statusLabels: { pass: 'Popular', fail: 'Slow' },
    labelBlocks: [
      { id: 'POPULAR', label: '🏷️ Popular', kind: 'literal', value: 'Popular' },
      { id: 'SLOW', label: '🏷️ Slow', kind: 'literal', value: 'Slow' },
    ],
    grandTotalLabel: "Grand Total — add up every item's Total",
    formatGrandTotal: currency,
    summaryQuestion: `How many items sold more than ${CASE1_THRESHOLD}?`,
  },
  buildInsight(key, result) {
    if (key.startsWith('total:')) {
      const row = Number(key.split(':')[1])
      const item = case1Rows[row]
      const shopTotal = case1Rows.reduce((sum, r) => sum + r.price * r.quantity, 0)
      const pct = Math.round((result / shopTotal) * 100)
      return {
        message: `"${item.item}" rang up ${currency(result)} — that's ${item.quantity} sold at ${currency(item.price)} each. It's about ${pct}% of the whole shop's sales!`,
        question: 'What should the shop do with this number?',
        options: [
          { id: 'compare', label: `Check if ${item.item} is Popular or Slow`, ideal: true },
          { id: 'restock-all', label: 'Order way more of everything', ideal: false },
          { id: 'ignore', label: 'Move on without looking closer', ideal: false },
        ],
        idealFeedback: 'Exactly — comparing items to each other is how you spot real patterns! 🔍',
        nudgeFeedback: `Let's look a little closer at the data first — try checking ${item.item}'s Status cell next!`,
      }
    }

    if (key.startsWith('status:')) {
      const row = Number(key.split(':')[1])
      const item = case1Rows[row]
      const isPopular = result === 'Popular'
      return {
        message: `"${item.item}" sold ${item.quantity}, so it's labeled ${result}! ${
          isPopular
            ? `That's more than our line of ${CASE1_THRESHOLD}.`
            : `That's ${CASE1_THRESHOLD} or fewer, so it didn't cross our popular line.`
        }`,
        question: `What should the shop do about ${item.item}?`,
        options: isPopular
          ? [
              { id: 'restock', label: `Stock up on more ${item.item}`, ideal: true },
              { id: 'stop', label: `Stop selling ${item.item}`, ideal: false },
              { id: 'nothing', label: 'Do nothing', ideal: false },
            ]
          : [
              { id: 'promo', label: `Try a discount on ${item.item}`, ideal: true },
              { id: 'double', label: `Order double the ${item.item}`, ideal: false },
              { id: 'nothing', label: 'Do nothing', ideal: false },
            ],
        idealFeedback: isPopular
          ? 'Great call — keeping popular snacks in stock keeps customers happy! 🎉'
          : 'Smart thinking — a little promotion can turn slow sellers around! 💡',
        nudgeFeedback: `Take another peek at the numbers for ${item.item} — what does "${result}" suggest about what shoppers want?`,
      }
    }

    const total = case1Rows.length
    const pct = Math.round((result / total) * 100)
    return {
      message: `${result} out of ${total} items sold more than ${CASE1_THRESHOLD}! That's ${pct}% of the shop flying off the shelves.`,
      question: 'What should the shop focus on next?',
      options: [
        { id: 'restock-popular', label: 'Restock the popular items first', ideal: true },
        { id: 'restock-all', label: 'Restock everything equally', ideal: false },
        { id: 'check-status', label: 'Check the Status column for each item', ideal: true },
      ],
      idealFeedback: 'Yes! Focusing on what customers actually want is the whole point of the data. 🌟',
      nudgeFeedback: 'Hmm, look back at the Status column — which items were actually labeled Popular?',
    }
  },
}

// ---------- Case 2: Who Swiped In? ----------

const case2Rows = [
  { suspect: 'Priya', swipes: 2 },
  { suspect: 'Marcus', swipes: 5 },
  { suspect: 'Denise', swipes: 1 },
  { suspect: 'Oscar', swipes: 3 },
]
const CASE2_THRESHOLD = 3

const case2 = {
  caseNumber: 2,
  idKey: 'suspect',
  idPlural: 'suspects',
  title: 'Who Swiped In?',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "The supply closet has a keycard log, already neatly kept. Count how many times each suspect badged in this week.",
    blockIds: ['COUNTIF', 'IF'],
    payout: 40,
  },
  analysis: {
    columns: [
      { key: 'suspect', label: 'Suspect', letter: 'A' },
      { key: 'swipes', label: 'Swipes', letter: 'B' },
      { key: 'status', label: 'Status', letter: 'C', targetable: true },
    ],
    rows: case2Rows,
    computeMetric: (row) => row.swipes,
    threshold: CASE2_THRESHOLD,
    statusLabels: { pass: 'Frequent', fail: 'Fine' },
    labelBlocks: [
      { id: 'FREQUENT', label: '🔁 Frequent', kind: 'literal', value: 'Frequent' },
      { id: 'FINE', label: '👍 Fine', kind: 'literal', value: 'Fine' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many suspects swiped in more than ${CASE2_THRESHOLD} times?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} suspect${result === 1 ? '' : 's'} swiped into the supply closet more than ${CASE2_THRESHOLD} times this week. That's an unusual amount of traffic for one room.`,
      question: 'What should you do with a "Frequent" suspect?',
      options: [
        { id: 'cross-check', label: 'Cross-check them against other evidence', ideal: true },
        { id: 'accuse', label: 'Accuse them immediately', ideal: false },
        { id: 'ignore', label: "It's probably nothing", ideal: false },
      ],
      idealFeedback: "Exactly — one clue narrows the list, but it takes more than one to be sure. 🔍",
      nudgeFeedback: 'A high swipe count is a lead, not proof — what other data could back it up?',
    }
  },
}

// ---------- Case 3: Follow the Money ----------

const case3Rows = [
  { suspect: 'Priya', rate: 4, visits: 3 },
  { suspect: 'Marcus', rate: 9, visits: 5 },
  { suspect: 'Denise', rate: 4, visits: 2 },
  { suspect: 'Oscar', rate: 5, visits: 4 },
]
const CASE3_THRESHOLD = 20

const case3 = {
  caseNumber: 3,
  idKey: 'suspect',
  idPlural: 'suspects',
  title: 'Follow the Money',
  steps: ['cleaning', 'analysis', 'interpretation'],
  brief: {
    problem:
      "A petty-cash log names all four suspects — but it's a mess. Clean it up, then see who spent the most.",
    blockIds: ['MULTIPLY', 'SUM', 'COUNTIF', 'IF'],
    payout: 55,
  },
  cleaning: {
    intro:
      "This petty-cash log has the suspects' names spelled every which way. Use the tools below to remove duplicate rows, fix mismatched capitalization, and fill in any blanks.",
    columns: [
      { key: 'suspect', label: 'Suspect' },
      { key: 'note', label: 'Note' },
      { key: 'amount', label: 'Amount', format: 'currency' },
    ],
    seedRows: [
      { suspect: 'Priya', note: 'Coffee run', amount: 12 },
      { suspect: 'Marcus', note: 'Office lunch', amount: 45 },
      { suspect: 'Priya', note: 'Coffee run', amount: 12 },
      { suspect: 'denise', note: 'Printer paper', amount: 8 },
      { suspect: 'OSCAR', note: 'Parking', amount: 20 },
      { suspect: 'marcus', note: 'Client dinner', amount: 60 },
      { suspect: 'Denise', note: 'Sticky notes', amount: 5 },
      { suspect: '', note: 'Taxi', amount: 15 },
    ],
    textColumnKey: 'suspect',
  },
  analysis: {
    columns: [
      { key: 'suspect', label: 'Suspect', letter: 'A' },
      { key: 'rate', label: 'Avg Spend', letter: 'B', format: 'currency' },
      { key: 'visits', label: 'Visits', letter: 'C' },
      { key: 'total', label: 'Total', letter: 'D', format: 'currency', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows: case3Rows,
    computeTotal: (row) => row.rate * row.visits,
    computeMetric: (row) => row.rate * row.visits,
    threshold: CASE3_THRESHOLD,
    statusLabels: { pass: 'Big Spender', fail: 'Normal' },
    labelBlocks: [
      { id: 'BIG_SPENDER', label: '💰 Big Spender', kind: 'literal', value: 'Big Spender' },
      { id: 'NORMAL', label: '🙂 Normal', kind: 'literal', value: 'Normal' },
    ],
    grandTotalLabel: 'Grand Total — total petty cash spent',
    formatGrandTotal: currency,
    summaryQuestion: `How many suspects spent more than ${currency(CASE3_THRESHOLD)}?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} suspect${result === 1 ? '' : 's'} spent more than ${currency(CASE3_THRESHOLD)} from petty cash this week. Money left a trail, and it points somewhere.`,
      question: 'What should you do next with this spending data?',
      options: [
        { id: 'compare-access', label: 'Compare it against who has closet access', ideal: true },
        { id: 'freeze', label: 'Freeze the petty cash box', ideal: false },
        { id: 'nothing', label: 'Spending has nothing to do with a missing jar', ideal: false },
      ],
      idealFeedback: 'Right — combining two different clues is how real detective work adds up. 🕵️',
      nudgeFeedback: 'Big spending alone proves nothing — what other clue could you line it up against?',
    }
  },
}

// ---------- Case 4: Early Bird ----------

const case4Rows = [
  { suspect: 'Priya', mon: 8, tue: 9, wed: 8 },
  { suspect: 'Marcus', mon: 6, tue: 6, wed: 7 },
  { suspect: 'Denise', mon: 9, tue: 9, wed: 10 },
  { suspect: 'Oscar', mon: 7, tue: 8, wed: 7 },
]
const CASE4_THRESHOLD = (9 + 9 + 10) / 3 // Denise's own average check-in time

const case4 = {
  caseNumber: 4,
  idKey: 'suspect',
  idPlural: 'suspects',
  title: 'Early Bird',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "A three-day check-in log shows what time each suspect arrived. Average it out to see who's alone in the building first.",
    blockIds: ['AVERAGE', 'COUNTIF'],
    payout: 45,
  },
  analysis: {
    columns: [
      { key: 'suspect', label: 'Suspect', letter: 'A' },
      { key: 'mon', label: 'Mon', letter: 'B' },
      { key: 'tue', label: 'Tue', letter: 'C' },
      { key: 'wed', label: 'Wed', letter: 'D' },
      { key: 'total', label: 'Avg Check-in', letter: 'E', targetable: true },
    ],
    rows: case4Rows,
    computeTotal: (row) => (row.mon + row.tue + row.wed) / 3,
    computeMetric: (row) => (row.mon + row.tue + row.wed) / 3,
    threshold: CASE4_THRESHOLD,
    hasGrandTotal: false,
    summaryQuestion: 'How many suspects check in earlier than Denise, on average?',
  },
  buildInsight(_key, result) {
    return {
      message: `${result} suspect${result === 1 ? '' : 's'} check in earlier than Denise on average — meaning they could be alone in the building before anyone else shows up.`,
      question: "What does 'earlier average check-in' actually prove?",
      options: [
        { id: 'opportunity', label: 'It shows who had the opportunity to be alone', ideal: true },
        { id: 'proof', label: "It proves who's guilty", ideal: false },
        { id: 'meaningless', label: 'Check-in time means nothing', ideal: false },
      ],
      idealFeedback: 'Exactly — opportunity is a clue, not a conviction. Keep stacking evidence. 🔍',
      nudgeFeedback: "An early check-in creates opportunity, but it isn't proof by itself — what else would you want to know?",
    }
  },
}

// ---------- Case 5: The Alibi Check ----------

const case5Rows = [
  { suspect: 'Priya', crimeScene: 'Supply Closet', alibi: 'I was at the Front Desk all morning' },
  { suspect: 'Marcus', crimeScene: 'Supply Closet', alibi: 'I was near the Supply Closet getting boxes' },
  { suspect: 'Denise', crimeScene: 'Supply Closet', alibi: 'I was in the Kitchen the whole time' },
  { suspect: 'Oscar', crimeScene: 'Supply Closet', alibi: 'I was at the Front Desk too' },
]

function findInAlibi(alibi, term) {
  const index = alibi.toLowerCase().indexOf(term.toLowerCase())
  return index === -1 ? 'Not found' : index + 1
}

const case5 = {
  caseNumber: 5,
  idKey: 'suspect',
  idPlural: 'suspects',
  title: 'The Alibi Check',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Each suspect wrote down their alibi for the time of the theft. Search Marcus's alibi for the crime scene's name.",
    blockIds: ['FIND'],
    payout: 50,
  },
  analysis: {
    columns: [
      { key: 'suspect', label: 'Suspect', letter: 'A' },
      { key: 'crimeScene', label: 'Crime Scene', letter: 'B' },
      { key: 'alibi', label: "Alibi", letter: 'C' },
    ],
    rows: case5Rows,
    hasGrandTotal: false,
    computeSummary: (rows) => findInAlibi(rows[1].alibi, rows[1].crimeScene),
    summaryQuestion: "Does Marcus's alibi mention the Supply Closet? (FIND the Crime Scene in his Alibi)",
  },
  buildInsight(_key, result) {
    const found = result !== 'Not found'
    return {
      message: found
        ? `Marcus's own alibi mentions the Supply Closet — right where the theft happened. He placed himself at the scene in his own words!`
        : `Marcus's alibi doesn't mention the Supply Closet at all, which lines up with his story so far.`,
      question: found ? 'What does this alibi actually prove?' : 'What should you check next?',
      options: found
        ? [
            { id: 'contradiction', label: 'His own words put him at the scene', ideal: true },
            { id: 'coincidence', label: 'Everyone mentions the closet sometimes', ideal: false },
            { id: 'ignore', label: "Ignore it, it's just a coincidence", ideal: false },
          ]
        : [
            { id: 'other-suspects', label: "Check the other suspects' alibis too", ideal: true },
            { id: 'clear-him', label: 'Clear Marcus completely', ideal: false },
            { id: 'stop', label: 'Stop investigating', ideal: false },
          ],
      idealFeedback: found
        ? 'Right — an alibi that places you at the scene is worth a very close second look! 🔍'
        : "Good instinct — checking everyone's story, not just one, is how you build a real case.",
      nudgeFeedback: 'Read Marcus\'s alibi again closely — what location does he mention?',
    }
  },
}

// ---------- Case 6: Split Two Ways ----------

const case6Rows = [
  { suspect: 'Priya', bill: 24, people: 2 },
  { suspect: 'Marcus', bill: 40, people: 2 },
  { suspect: 'Denise', bill: 36, people: 2 },
  { suspect: 'Oscar', bill: 30, people: 2 },
]
const CASE6_THRESHOLD = 15 // Oscar's own fair share

const case6 = {
  caseNumber: 6,
  idKey: 'suspect',
  idPlural: 'suspects',
  title: 'Split Two Ways',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Several supply bills were split two ways. Divide each bill to find the fair share, then flag the bigger ones.",
    blockIds: ['DIVIDE', 'SUM', 'COUNTIF', 'IF'],
    payout: 55,
  },
  analysis: {
    columns: [
      { key: 'suspect', label: 'Suspect', letter: 'A' },
      { key: 'bill', label: 'Bill', letter: 'B', format: 'currency' },
      { key: 'people', label: 'Split Between', letter: 'C' },
      { key: 'total', label: 'Fair Share', letter: 'D', format: 'currency', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows: case6Rows,
    computeTotal: (row) => row.bill / row.people,
    computeMetric: (row) => row.bill / row.people,
    threshold: CASE6_THRESHOLD,
    statusLabels: { pass: 'Big Bill', fail: 'Small Bill' },
    labelBlocks: [
      { id: 'BIG_BILL', label: '💵 Big Bill', kind: 'literal', value: 'Big Bill' },
      { id: 'SMALL_BILL', label: '🪙 Small Bill', kind: 'literal', value: 'Small Bill' },
    ],
    grandTotalLabel: "Grand Total — everyone's fair share added up",
    formatGrandTotal: currency,
    summaryQuestion: `How many suspects had a fair share bigger than ${currency(CASE6_THRESHOLD)}?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} suspect${result === 1 ? '' : 's'} had a fair share bigger than ${currency(CASE6_THRESHOLD)} once the bills were split evenly.`,
      question: 'Why bother splitting the bill fairly before comparing?',
      options: [
        { id: 'apples-to-apples', label: "So you're comparing costs fairly, not just raw bills", ideal: true },
        { id: 'random', label: "It doesn't matter how you split it", ideal: false },
        { id: 'bigger-bill', label: 'The biggest raw bill is always the guilty one', ideal: false },
      ],
      idealFeedback: "Exactly — dividing first makes sure you're comparing the same thing for everyone. ⚖️",
      nudgeFeedback: 'A big raw bill split among more people might be perfectly normal — what does dividing it first tell you?',
    }
  },
}

// ---------- Case 7: The Pattern in the Purchases ----------

const case7Rows = [
  { suspect: 'Marcus', amount: 80 },
  { suspect: 'Priya', amount: 15 },
  { suspect: 'Marcus', amount: 95 },
  { suspect: 'Oscar', amount: 20 },
  { suspect: 'Denise', amount: 18 },
  { suspect: 'Marcus', amount: 60 },
]
const CASE7_THRESHOLD = 60 // Marcus's own third purchase

const case7 = {
  caseNumber: 7,
  idKey: 'suspect',
  idPlural: 'purchases',
  title: 'The Pattern in the Purchases',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      'A city-wide receipt log lists purchases by name. Flag the unusually large ones and count how many there are.',
    blockIds: ['COUNTIF', 'IF'],
    payout: 60,
  },
  analysis: {
    columns: [
      { key: 'suspect', label: 'Name', letter: 'A' },
      { key: 'amount', label: 'Amount', letter: 'B', format: 'currency' },
      { key: 'status', label: 'Status', letter: 'C', targetable: true },
    ],
    rows: case7Rows,
    computeMetric: (row) => row.amount,
    threshold: CASE7_THRESHOLD,
    statusLabels: { pass: 'Big Purchase', fail: 'Normal' },
    labelBlocks: [
      { id: 'BIG_PURCHASE', label: '💸 Big Purchase', kind: 'literal', value: 'Big Purchase' },
      { id: 'NORMAL', label: '🛍️ Normal', kind: 'literal', value: 'Normal' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many purchases were over ${currency(CASE7_THRESHOLD)}?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} purchases in the city-wide log were over ${currency(CASE7_THRESHOLD)} — and it's worth checking whose name is on them.`,
      question: 'A second, unrelated dataset shows the same pattern as your suspect. What does that mean?',
      options: [
        { id: 'lines-up', label: 'Two independent clues lining up is strong evidence', ideal: true },
        { id: 'coincidence', label: "It's definitely just a coincidence", ideal: false },
        { id: 'irrelevant', label: 'Receipts have nothing to do with the case', ideal: false },
      ],
      idealFeedback: 'Right — when two unrelated sources agree, that pattern is hard to ignore. 📊',
      nudgeFeedback: 'Think about where these purchases came from — does the name behind them look familiar?',
    }
  },
}

// ---------- Case 8: The Doctored Report ----------

const case8Rows = [
  { category: 'Coffee', rate: 3, units: 8 },
  { category: 'Supplies', rate: 5, units: 6 },
  { category: 'Parking', rate: 2, units: 10 },
  { category: 'Meals', rate: 12, units: 2 },
]

const case8 = {
  caseNumber: 8,
  idKey: 'category',
  idPlural: 'categories',
  title: 'The Doctored Report',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Marcus filed an expense report claiming only $50 total. Recalculate the real totals from his receipts and see if that number holds up.",
    blockIds: ['MULTIPLY', 'SUM'],
    payout: 55,
  },
  analysis: {
    columns: [
      { key: 'category', label: 'Category', letter: 'A' },
      { key: 'rate', label: 'Rate', letter: 'B', format: 'currency' },
      { key: 'units', label: 'Units', letter: 'C' },
      { key: 'total', label: 'Total', letter: 'D', format: 'currency', targetable: true },
    ],
    rows: case8Rows,
    computeTotal: (row) => row.rate * row.units,
    hasSummary: false,
    grandTotalLabel: 'Grand Total — what Marcus really spent',
    formatGrandTotal: currency,
  },
  buildInsight(_key, result) {
    const claimed = 50
    const diff = result - claimed
    return {
      message: `Marcus claimed only ${currency(claimed)} on his report — but the receipts really add up to ${currency(result)}. That's ${currency(diff)} unaccounted for!`,
      question: 'What does a report that quietly changed numbers usually mean?',
      options: [
        { id: 'deception', label: 'Someone is trying to hide something', ideal: true },
        { id: 'honest-mistake', label: "It's definitely just a harmless typo", ideal: false },
        { id: 'ignore', label: "Numbers don't need to match exactly", ideal: false },
      ],
      idealFeedback: "Exactly — a report that doesn't match reality is hard evidence, not a coincidence. 🧾",
      nudgeFeedback: `Compare what was claimed (${currency(claimed)}) to what you calculated — how big is that gap?`,
    }
  },
}

// ---------- Case 9: Cross-Referencing ----------

const case9Rows = [
  { supplier: 'SupplyCo', suspectHint: 'Marcus', clientNote: 'Regular clients: Denise and Priya' },
  { supplier: 'OfficeMart', suspectHint: 'Marcus', clientNote: 'Frequent buyer: Oscar' },
  { supplier: 'QuickPrint', suspectHint: 'Marcus', clientNote: 'Regular clients include Marcus and Oscar' },
]

const case9 = {
  caseNumber: 9,
  idKey: 'supplier',
  idPlural: 'suppliers',
  title: 'Cross-Referencing',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "A supplier's client notes might connect back to your lead suspect. Check QuickPrint's client note for Marcus's name.",
    blockIds: ['FIND'],
    payout: 55,
  },
  analysis: {
    columns: [
      { key: 'supplier', label: 'Supplier', letter: 'A' },
      { key: 'suspectHint', label: 'Suspect', letter: 'B' },
      { key: 'clientNote', label: 'Client Note', letter: 'C' },
    ],
    rows: case9Rows,
    hasGrandTotal: false,
    computeSummary: (rows) => findInAlibi(rows[2].clientNote, rows[2].suspectHint),
    summaryQuestion: "Does QuickPrint's client note mention Marcus? (FIND his name in the note)",
  },
  buildInsight(_key, result) {
    const found = result !== 'Not found'
    return {
      message: found
        ? "QuickPrint's records list Marcus as a regular client — a second, unrelated business connects right back to him."
        : "QuickPrint's records don't mention Marcus at all this time.",
      question: 'Why does cross-referencing two unrelated lists matter?',
      options: [
        { id: 'independent', label: 'It shows independent sources agreeing', ideal: true },
        { id: 'meaningless', label: 'One list has nothing to do with another', ideal: false },
        { id: 'proof', label: "It's an automatic conviction", ideal: false },
      ],
      idealFeedback: 'Right — when separate records point the same way, the pattern gets much harder to explain away. 🔗',
      nudgeFeedback: "Search QuickPrint's client note for the suspect's name — is it in there?",
    }
  },
}

// ---------- Case 10: The Confession Slip ----------

const case10Rows = [
  { note: 'Cash from the jar', amount: 25 },
  { note: 'Cash from the register', amount: 15 },
]

const case10 = {
  caseNumber: 10,
  idKey: 'note',
  idPlural: 'entries',
  title: 'The Confession Slip',
  steps: ['entry'],
  brief: {
    problem: 'A short handwritten note turned up in evidence. Just get the numbers into the system.',
    blockIds: [],
    payout: 25,
  },
  entry: {
    intro: 'A crumpled note was found near the breakroom. Read it, then enter the numbers into the grid below.',
    caseFileTitle: '🧾 Found Note',
    columns: [
      { key: 'note', label: 'Note' },
      { key: 'amount', label: 'Amount', format: 'currency' },
    ],
    rows: case10Rows,
    clue: (row) => `"${row.note}" — ${currency(row.amount)}.`,
  },
}

// ---------- Case 11: Cornered ----------

const case11Rows = [
  { suspect: 'Priya', evidenceScore: 0 },
  { suspect: 'Marcus', evidenceScore: 3 },
  { suspect: 'Denise', evidenceScore: 0 },
  { suspect: 'Oscar', evidenceScore: 1 },
]
const CASE11_THRESHOLD = 1 // Oscar's own score

const case11 = {
  caseNumber: 11,
  idKey: 'suspect',
  idPlural: 'suspects',
  title: 'Cornered',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Every clue so far — swipes, spending, the alibi, the pattern, the doctored report — gets tallied into one evidence score. See who's really cornered.",
    blockIds: ['IF', 'COUNTIF'],
    payout: 65,
  },
  analysis: {
    columns: [
      { key: 'suspect', label: 'Suspect', letter: 'A' },
      { key: 'evidenceScore', label: 'Evidence Score', letter: 'B' },
      { key: 'status', label: 'Status', letter: 'C', targetable: true },
    ],
    rows: case11Rows,
    computeMetric: (row) => row.evidenceScore,
    threshold: CASE11_THRESHOLD,
    statusLabels: { pass: 'Prime Suspect', fail: 'Cleared' },
    labelBlocks: [
      { id: 'PRIME_SUSPECT', label: '🚨 Prime Suspect', kind: 'literal', value: 'Prime Suspect' },
      { id: 'CLEARED', label: '✅ Cleared', kind: 'literal', value: 'Cleared' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many suspects are Prime Suspects (evidence score over ${CASE11_THRESHOLD})?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} suspect${result === 1 ? ' is' : 's are'} flagged as a Prime Suspect once every clue from this season gets tallied together.`,
      question: "You're about to name a culprit. What should decide it?",
      options: [
        { id: 'evidence', label: 'The suspect every piece of evidence points to', ideal: true },
        { id: 'guess', label: 'Whoever seems the most suspicious to you', ideal: false },
        { id: 'random', label: 'It genuinely could be anyone', ideal: false },
      ],
      idealFeedback: 'Exactly — a real case is built on evidence that adds up, not a hunch. 🏆',
      nudgeFeedback: 'Look at the Status column one more time — whose evidence score actually crossed the line?',
    }
  },
}

// ---------- Case 12: Case Closed ----------

const case12Rows = [
  { suspect: 'Priya', cluesMatched: 0 },
  { suspect: 'Marcus', cluesMatched: 5 },
  { suspect: 'Denise', cluesMatched: 1 },
  { suspect: 'Oscar', cluesMatched: 2 },
]
const CASE12_THRESHOLD = 2 // Oscar's own count

const case12 = {
  caseNumber: 12,
  idKey: 'suspect',
  idPlural: 'suspects',
  title: 'Case Closed',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Every case this season pointed somewhere. Review the full timeline and confirm the culprit with the complete evidence trail.",
    blockIds: ['IF', 'COUNTIF'],
    payout: 80,
  },
  analysis: {
    columns: [
      { key: 'suspect', label: 'Suspect', letter: 'A' },
      { key: 'cluesMatched', label: 'Clues Matched', letter: 'B' },
      { key: 'status', label: 'Verdict', letter: 'C', targetable: true },
    ],
    rows: case12Rows,
    computeMetric: (row) => row.cluesMatched,
    threshold: CASE12_THRESHOLD,
    statusLabels: { pass: 'Guilty', fail: 'Not Guilty' },
    labelBlocks: [
      { id: 'GUILTY', label: '🔒 Guilty', kind: 'literal', value: 'Guilty' },
      { id: 'NOT_GUILTY', label: '🕊️ Not Guilty', kind: 'literal', value: 'Not Guilty' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many suspects are Guilty (clues matched over ${CASE12_THRESHOLD})?`,
  },
  buildInsight(_key, result) {
    return {
      message:
        result === 1
          ? "One suspect matches every clue from this entire season — Marcus. The candy jar, the swipes, the spending, the alibi, the pattern, the doctored report. Case closed! 🏆"
          : `${result} suspects still match multiple clues — take one more look at the Verdict column before closing the file.`,
      question: 'The season is over. What made this case solvable?',
      options: [
        { id: 'evidence-trail', label: 'Following the data from clue to clue', ideal: true },
        { id: 'luck', label: 'It was mostly luck', ideal: false },
        { id: 'one-clue', label: 'One single clue solved it alone', ideal: false },
      ],
      idealFeedback: "Yes! Every case this season added one more piece — that's how the data told the whole story. 🎉",
      nudgeFeedback: 'Think back over the whole season — was it really just one clue, or lots of them together?',
    }
  },
}

export const detectiveCases = [
  case1,
  case2,
  case3,
  case4,
  case5,
  case6,
  case7,
  case8,
  case9,
  case10,
  case11,
  case12,
]
