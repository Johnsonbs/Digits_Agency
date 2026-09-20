const rows = [
  { day: 'Monday', minutesPerChapter: 10, chapters: 2 },
  { day: 'Tuesday', minutesPerChapter: 8, chapters: 3 },
  { day: 'Wednesday', minutesPerChapter: 10, chapters: 1 },
  { day: 'Thursday', minutesPerChapter: 7, chapters: 4 },
]

const GOAL_THRESHOLD = 20

const rawColumns = [
  { key: 'day', label: 'Day', letter: 'A' },
  { key: 'minutesPerChapter', label: 'Min / Chapter', letter: 'B' },
  { key: 'chapters', label: 'Chapters Read', letter: 'C' },
]

const habitCase1 = {
  caseNumber: 1,
  idKey: 'day',
  idPlural: 'days',
  title: 'Start the Streak',
  steps: ['entry', 'cleaning', 'analysis', 'interpretation'],
  brief: {
    problem:
      "Day one of the reading challenge. The goal: more than 20 minutes a day counts as Goal Met. Track the minutes, clean up the log, and see if the streak is really on track.",
    blockIds: ['MULTIPLY', 'SUM', 'COUNTIF', 'IF'],
    payout: 50,
  },

  entry: {
    intro: "Day one of the reading challenge! Read the log, then enter this week's numbers into the grid.",
    caseFileTitle: '📖 Reading Log',
    columns: rawColumns,
    rows,
    clue: (row) =>
      `${row.day}: ${row.minutesPerChapter} min per chapter, ${row.chapters} chapter${row.chapters === 1 ? '' : 's'} read.`,
  },

  cleaning: {
    intro:
      'This week\'s reading log is messy! Use the tools below to remove duplicate entries, fix mismatched book titles, and fill in any blanks.',
    columns: [
      { key: 'reader', label: 'Reader' },
      { key: 'book', label: 'Book' },
      { key: 'minutes', label: 'Minutes' },
    ],
    seedRows: [
      { reader: 'Ada', book: 'Dragon Tales', minutes: 20 },
      { reader: 'Leo', book: 'Space Quest', minutes: 15 },
      { reader: 'Ada', book: 'Dragon Tales', minutes: 20 },
      { reader: 'Nia', book: 'dragon tales', minutes: 18 },
      { reader: 'Cole', book: 'Mystery Manor', minutes: 25 },
      { reader: 'Mabel', book: 'SPACE QUEST', minutes: 12 },
      { reader: 'Otis', book: 'Mystery Manor', minutes: 22 },
      { reader: 'Pearl', book: '', minutes: 16 },
    ],
    textColumnKey: 'book',
  },

  analysis: {
    intro: 'The daily goal is 20 minutes. More than 20 is a Goal Met day — 20 or under is Try Again.',
    columns: [
      ...rawColumns,
      { key: 'total', label: 'Total (min)', letter: 'D', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows,
    computeTotal: (row) => row.minutesPerChapter * row.chapters,
    computeMetric: (row) => row.minutesPerChapter * row.chapters,
    threshold: GOAL_THRESHOLD,
    statusLabels: { pass: 'Goal Met', fail: 'Try Again' },
    labelBlocks: [
      { id: 'GOAL_MET', label: '✅ Goal Met', kind: 'literal', value: 'Goal Met' },
      { id: 'TRY_AGAIN', label: '🔁 Try Again', kind: 'literal', value: 'Try Again' },
    ],
    grandTotalLabel: 'Grand Total — total minutes read this week',
    formatGrandTotal: (v) => `${v} min`,
    summaryQuestion: `How many days hit the ${GOAL_THRESHOLD}-minute goal?`,
  },

  buildInsight(_key, result) {
    const total = rows.length
    const pct = Math.round((result / total) * 100)
    return {
      message: `${result} out of ${total} days you hit the ${GOAL_THRESHOLD}-minute goal! That's ${pct}% of the week keeping the streak alive.`,
      question: 'What should you focus on to keep the streak going?',
      options: [
        { id: 'routine', label: 'Read around the same time each day', ideal: true },
        { id: 'easy-only', label: 'Only read on the easy days', ideal: false },
        { id: 'stop-tracking', label: 'Stop tracking it', ideal: false },
      ],
      idealFeedback: 'Yes! A steady routine is exactly how streaks turn into habits. 🔥',
      nudgeFeedback: 'Look back at the Status column — which days actually hit Goal Met?',
    }
  },
}

export const habitCases = [habitCase1]
