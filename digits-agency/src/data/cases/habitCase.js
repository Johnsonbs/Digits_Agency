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
  steps: ['entry', 'cleaning'],
  brief: {
    problem:
      "Day one of the reading challenge! Log the first days' reading, then clean up the messy entries in the reading log.",
    blockIds: [],
    payout: 20,
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
}

// ---------- Case 2: What Does the Streak Show? ----------

const habitCase2 = {
  caseNumber: 2,
  idKey: 'day',
  idPlural: 'days',
  title: 'What Does the Streak Show?',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Now that the first days are logged and cleaned up, let's see what the streak actually shows. Total up each day's minutes, add a grand total for the week, and flag which days count: more than 20 minutes a day counts as Goal Met, 20 or under is Try Again.",
    blockIds: ['MULTIPLY', 'SUM', 'COUNTIF', 'IF'],
    payout: 40,
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

function minutesLabel(n) {
  return `${n} min`
}

function findInText(haystack, needle) {
  const index = haystack.toLowerCase().indexOf(needle.toLowerCase())
  return index === -1 ? 'Not found' : index + 1
}

// ---------- Case 3: Same Time Tomorrow ----------

const case2Rows = [
  { day: 'Monday', session1: 6, session2: 9, session3: 12 },
  { day: 'Tuesday', session1: 12, session2: 18, session3: 18 },
  { day: 'Wednesday', session1: 15, session2: 18, session3: 21 },
  { day: 'Thursday', session1: 21, session2: 21, session3: 24 },
]
const case2AvgSession = (row) => (row.session1 + row.session2 + row.session3) / 3
const HABIT_CASE2_THRESHOLD = 15

const habitCase3 = {
  caseNumber: 3,
  idKey: 'day',
  idPlural: 'days',
  title: 'Same Time Tomorrow',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Week 1 is in the books! Each day had three separate reading sessions. Average the sessions to see if the habit is already growing — more than 15 minutes per session on average counts as a Growing Day.",
    blockIds: ['AVERAGE', 'COUNTIF'],
    payout: 40,
  },
  analysis: {
    intro: 'The rule: a Growing Day averages more than 15 minutes per session. 15 or under is a Steady Day.',
    columns: [
      { key: 'day', label: 'Day', letter: 'A' },
      { key: 'session1', label: 'Session 1 (min)', letter: 'B' },
      { key: 'session2', label: 'Session 2 (min)', letter: 'C' },
      { key: 'session3', label: 'Session 3 (min)', letter: 'D' },
      { key: 'total', label: 'Avg / Session', letter: 'E', targetable: true },
      { key: 'status', label: 'Status', letter: 'F', targetable: true },
    ],
    rows: case2Rows,
    computeTotal: case2AvgSession,
    computeMetric: case2AvgSession,
    threshold: HABIT_CASE2_THRESHOLD,
    statusLabels: { pass: 'Growing Day', fail: 'Steady Day' },
    labelBlocks: [
      { id: 'GROWING_DAY', label: '📈 Growing Day', kind: 'literal', value: 'Growing Day' },
      { id: 'STEADY_DAY', label: '➡️ Steady Day', kind: 'literal', value: 'Steady Day' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many days averaged more than ${HABIT_CASE2_THRESHOLD} minutes per session?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} out of ${case2Rows.length} days averaged more than ${HABIT_CASE2_THRESHOLD} minutes per session this week — the habit is picking up steam!`,
      question: 'What helps a habit keep growing day after day?',
      options: [
        { id: 'routine', label: 'Reading at the same time every day', ideal: true },
        { id: 'cram', label: 'Cramming all the reading into one big day', ideal: false },
        { id: 'stop-checking', label: 'Stop checking your progress', ideal: false },
      ],
      idealFeedback: 'Exactly — same time, same place turns a good week into a real habit. 📚',
      nudgeFeedback: 'Look at the Status column — which days actually grew past the line?',
    }
  },
}

// ---------- Case 4: Pick the Next Book ----------

const case3Rows = [
  { shelf: 'Shelf A', shelfNote: 'Space Quest, Mystery Manor, and a few adventure comics' },
  { shelf: 'Shelf B', shelfNote: 'Dragon Tales 2 sits right next to the picture books' },
  { shelf: 'Shelf C', shelfNote: 'Only nonfiction and encyclopedias here' },
]

const habitCase4 = {
  caseNumber: 4,
  idKey: 'shelf',
  idPlural: 'shelves',
  title: 'Pick the Next Book',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Week 2 needs a new book lined up before the streak stalls. Search Shelf B's note for \"Dragon Tales 2\" to see if it's ready to grab.",
    blockIds: ['FIND'],
    payout: 45,
  },
  analysis: {
    columns: [
      { key: 'shelf', label: 'Shelf', letter: 'A' },
      { key: 'shelfNote', label: 'Shelf Note', letter: 'B' },
    ],
    rows: case3Rows,
    hasGrandTotal: false,
    computeSummary: (rows) => findInText(rows[1].shelfNote, 'Dragon Tales 2'),
    summaryQuestion: 'Is "Dragon Tales 2" on Shelf B? (FIND the title in the Shelf Note)',
  },
  buildInsight(_key, result) {
    const found = result !== 'Not found'
    return {
      message: found
        ? '"Dragon Tales 2" is right there on Shelf B — the next book is ready to go before the streak even has a chance to stall.'
        : '"Dragon Tales 2" isn\'t on Shelf B this time — better check the other shelves before Week 2 starts.',
      question: found ? 'What should you do now that the book is found?' : 'What should you check next?',
      options: found
        ? [
            { id: 'grab-it', label: 'Grab it now so Week 2 starts on time', ideal: true },
            { id: 'wait', label: 'Wait until the streak actually breaks', ideal: false },
            { id: 'ignore', label: "Don't bother, one book is as good as another", ideal: false },
          ]
        : [
            { id: 'check-others', label: 'Search the other shelf notes too', ideal: true },
            { id: 'give-up', label: "Assume the library just doesn't have it", ideal: false },
            { id: 'skip-reading', label: 'Skip reading until it turns up', ideal: false },
          ],
      idealFeedback: found
        ? 'Nice — lining up the next book ahead of time is exactly how streaks survive. 📖'
        : 'Good call — checking everywhere before giving up keeps the streak alive.',
      nudgeFeedback: "Search Shelf B's note again closely — is the title actually in there?",
    }
  },
}

// ---------- Case 5: Longest Streak Yet ----------

const case4Rows = [
  { day: 'Week 1 · Mon', minutes: 20 },
  { day: 'Week 1 · Tue', minutes: 24 },
  { day: 'Week 1 · Wed', minutes: 10 },
  { day: 'Week 1 · Thu', minutes: 28 },
  { day: 'Week 2 · Mon', minutes: 30 },
  { day: 'Week 2 · Tue', minutes: 18 },
  { day: 'Week 2 · Wed', minutes: 22 },
  { day: 'Week 2 · Thu', minutes: 20 },
  { day: 'Week 3 · Mon', minutes: 25 },
  { day: 'Week 3 · Tue', minutes: 19 },
  { day: 'Week 3 · Wed', minutes: 26 },
  { day: 'Week 3 · Thu', minutes: 21 },
]
const HABIT_CASE4_THRESHOLD = 20

const habitCase5 = {
  caseNumber: 5,
  idKey: 'day',
  idPlural: 'days',
  title: 'Longest Streak Yet',
  steps: ['cleaning', 'analysis', 'interpretation'],
  brief: {
    problem:
      "Three weeks of sign-in slips need to be merged into one log before you can see the real streak. Same goal as Day 1: more than 20 minutes counts as a Goal Met day.",
    blockIds: ['COUNTIF', 'IF'],
    payout: 55,
  },
  cleaning: {
    intro:
      'These sign-in slips are a mess! Use the tools below to remove duplicate entries, fix mismatched day names, and fill in any blanks.',
    columns: [
      { key: 'reader', label: 'Reader' },
      { key: 'day', label: 'Day' },
      { key: 'minutes', label: 'Minutes' },
    ],
    seedRows: [
      { reader: 'You', day: 'Monday', minutes: 20 },
      { reader: 'You', day: 'Tuesday', minutes: 24 },
      { reader: 'You', day: 'Monday', minutes: 20 },
      { reader: 'You', day: 'wednesday', minutes: 18 },
      { reader: 'You', day: 'Thursday', minutes: 28 },
      { reader: 'You', day: 'WEDNESDAY', minutes: 22 },
      { reader: 'You', day: 'Friday', minutes: 15 },
      { reader: 'You', day: '', minutes: 19 },
    ],
    textColumnKey: 'day',
  },
  analysis: {
    intro: `Goal rule carries over from Day 1: more than ${HABIT_CASE4_THRESHOLD} minutes counts as a Goal Met day.`,
    columns: [
      { key: 'day', label: 'Day', letter: 'A' },
      { key: 'minutes', label: 'Minutes', letter: 'B' },
      { key: 'status', label: 'Status', letter: 'C', targetable: true },
    ],
    rows: case4Rows,
    computeMetric: (row) => row.minutes,
    threshold: HABIT_CASE4_THRESHOLD,
    statusLabels: { pass: 'Goal Met', fail: 'Try Again' },
    labelBlocks: [
      { id: 'GOAL_MET', label: '✅ Goal Met', kind: 'literal', value: 'Goal Met' },
      { id: 'TRY_AGAIN', label: '🔁 Try Again', kind: 'literal', value: 'Try Again' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `Across all three weeks, how many days hit the ${HABIT_CASE4_THRESHOLD}-minute goal?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} out of ${case4Rows.length} days across the three merged weeks hit the goal — the longest run yet, once every log is combined into one streak.`,
      question: 'Why bother merging every week into one log before counting?',
      options: [
        { id: 'full-picture', label: 'It shows the real, full pattern instead of just one week', ideal: true },
        { id: 'one-week', label: 'One week always tells the whole story', ideal: false },
        { id: 'irrelevant', label: "Merging logs doesn't change anything", ideal: false },
      ],
      idealFeedback: 'Right — the bigger the log, the clearer the real streak becomes. 🔥',
      nudgeFeedback: 'Scan the Status column across all three weeks — how many actually say Goal Met?',
    }
  },
}

// ---------- Case 6: Pages Per Minute ----------

const case5Rows = [
  { day: 'Monday', pages: 12, minutes: 15 },
  { day: 'Tuesday', pages: 21, minutes: 14 },
  { day: 'Wednesday', pages: 9, minutes: 18 },
  { day: 'Thursday', pages: 20, minutes: 10 },
]
const case5Rate = (row) => row.pages / row.minutes
const HABIT_CASE5_THRESHOLD = 1

const habitCase6 = {
  caseNumber: 6,
  idKey: 'day',
  idPlural: 'days',
  title: 'Pages Per Minute',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      'New metric, same tracker: divide pages by minutes to find a reading-speed rate for each day. More than 1 page per minute counts as a Speedy Pace.',
    blockIds: ['DIVIDE', 'COUNTIF'],
    payout: 45,
  },
  analysis: {
    intro: `A Speedy Pace day tops ${HABIT_CASE5_THRESHOLD} page per minute. ${HABIT_CASE5_THRESHOLD} or under is a Steady Pace.`,
    columns: [
      { key: 'day', label: 'Day', letter: 'A' },
      { key: 'pages', label: 'Pages', letter: 'B' },
      { key: 'minutes', label: 'Minutes', letter: 'C' },
      { key: 'total', label: 'Pages / Min', letter: 'D', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows: case5Rows,
    computeTotal: case5Rate,
    computeMetric: case5Rate,
    threshold: HABIT_CASE5_THRESHOLD,
    statusLabels: { pass: 'Speedy Pace', fail: 'Steady Pace' },
    labelBlocks: [
      { id: 'SPEEDY_PACE', label: '⚡ Speedy Pace', kind: 'literal', value: 'Speedy Pace' },
      { id: 'STEADY_PACE', label: '🐢 Steady Pace', kind: 'literal', value: 'Steady Pace' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many days topped ${HABIT_CASE5_THRESHOLD} page per minute?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} out of ${case5Rows.length} days topped ${HABIT_CASE5_THRESHOLD} page per minute. Speed isn't everything, but it's a fun new way to look at the same tracker.`,
      question: 'Is a faster pace always the goal?',
      options: [
        { id: 'balance', label: "No — some books are just slower, and that's fine", ideal: true },
        { id: 'always-rush', label: 'Yes, always read as fast as possible', ideal: false },
        { id: 'speed-only', label: 'Speed is the only thing that matters', ideal: false },
      ],
      idealFeedback: 'Exactly — a slower pace on a tricky book is still real progress. 📖',
      nudgeFeedback: 'Think about why a page might take longer on some days — is that really a bad thing?',
    }
  },
}

// ---------- Case 7: Reading Buddies ----------

const case6Rows = [
  { buddy: 'Theo', minutes: 15 },
  { buddy: 'Mila', minutes: 22 },
  { buddy: 'Sam', minutes: 18 },
  { buddy: 'Ivy', minutes: 25 },
]

const habitCase7 = {
  caseNumber: 7,
  idKey: 'buddy',
  idPlural: 'buddies',
  title: 'Reading Buddies',
  steps: ['entry', 'analysis', 'interpretation'],
  brief: {
    problem:
      "The streak isn't a solo effort anymore — a few friends want to join in. Enter today's buddy log, then count how many buddies actually showed up.",
    blockIds: ['COUNT'],
    payout: 35,
  },
  entry: {
    intro: "A few friends joined the streak today! Read the log, then enter today's numbers into the grid below.",
    caseFileTitle: '👯 Buddy Log',
    columns: [
      { key: 'buddy', label: 'Buddy' },
      { key: 'minutes', label: 'Minutes' },
    ],
    rows: case6Rows,
    clue: (row) => `${row.buddy} read for ${row.minutes} minutes today.`,
  },
  analysis: {
    columns: [
      { key: 'buddy', label: 'Buddy', letter: 'A' },
      { key: 'minutes', label: 'Minutes', letter: 'B' },
    ],
    rows: case6Rows,
    hasGrandTotal: false,
    computeSummary: (rows) => rows.length,
    summaryQuestion: 'How many reading buddies joined the log today? (COUNT them)',
  },
  buildInsight(_key, result) {
    return {
      message: `${result} reading buddies joined the log today! The streak just got a lot more fun to keep going.`,
      question: 'Why can reading with friends help a habit stick?',
      options: [
        { id: 'accountability', label: 'Friends help you stay accountable to keep going', ideal: true },
        { id: 'solo-only', label: 'Reading only counts if you do it alone', ideal: false },
        { id: 'ignore-them', label: "It doesn't matter if anyone else reads", ideal: false },
      ],
      idealFeedback: 'Right — a little friendly accountability makes a habit much easier to keep. 🎉',
      nudgeFeedback: 'Look back at the Buddy Log — how many names are actually on it?',
    }
  },
}

// ---------- Case 8: Which Book Wins? ----------

const case7Rows = [
  { book: 'Dragon Tales 2', s1: 20, s2: 15, s3: 25 },
  { book: 'Mystery Manor', s1: 18, s2: 22, s3: 20 },
  { book: 'Space Quest', s1: 10, s2: 12, s3: 8 },
  { book: 'Ocean Explorers', s1: 25, s2: 30, s3: 35 },
]
const case7Total = (row) => row.s1 + row.s2 + row.s3

const habitCase8 = {
  caseNumber: 8,
  idKey: 'book',
  idPlural: 'books',
  title: 'Which Book Wins?',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      'Four books, three sessions each — total up the minutes spent on each book, then average all the totals to see which ones come out on top.',
    blockIds: ['SUM', 'AVERAGE'],
    payout: 55,
  },
  analysis: {
    columns: [
      { key: 'book', label: 'Book', letter: 'A' },
      { key: 's1', label: 'Session 1', letter: 'B' },
      { key: 's2', label: 'Session 2', letter: 'C' },
      { key: 's3', label: 'Session 3', letter: 'D' },
      { key: 'total', label: 'Total (min)', letter: 'E', targetable: true },
    ],
    rows: case7Rows,
    computeTotal: case7Total,
    grandTotalLabel: 'Grand Total — minutes spent on all four books',
    formatGrandTotal: minutesLabel,
    computeSummary: (rows) => {
      const totals = rows.map(case7Total)
      return totals.reduce((sum, t) => sum + t, 0) / totals.length
    },
    summaryQuestion: "What's the average number of minutes spent per book? (AVERAGE the totals)",
  },
  buildInsight(_key, result) {
    const winners = case7Rows.filter((r) => case7Total(r) >= result).map((r) => r.book)
    const winnerList =
      winners.length > 1
        ? `${winners.slice(0, -1).join(', ')} and ${winners[winners.length - 1]}`
        : winners.join(', ')
    return {
      message: `The average book got ${result} minutes of attention. ${winnerList} hit that average or beat it!`,
      question: 'What does comparing every book to the average actually show?',
      options: [
        { id: 'above-below', label: 'Which books stood out above the rest', ideal: true },
        { id: 'random', label: 'Nothing — every book is the same', ideal: false },
        { id: 'ignore', label: "The average doesn't tell you anything useful", ideal: false },
      ],
      idealFeedback: 'Exactly — the average gives you a fair line to measure every book against. 🏆',
      nudgeFeedback: 'Compare each Total cell to the average you just calculated — which ones come out ahead?',
    }
  },
}

// ---------- Case 9: Halfway Bonus ----------

const case8Rows = [
  { checkpoint: 'Day 10 Checkpoint', minutesSoFar: 180, daysSoFar: 10, seasonDays: 30 },
  { checkpoint: 'Day 15 Checkpoint', minutesSoFar: 310, daysSoFar: 15, seasonDays: 30 },
  { checkpoint: 'Day 20 Checkpoint', minutesSoFar: 460, daysSoFar: 20, seasonDays: 30 },
]
const case8Projected = (row) => (row.minutesSoFar / row.daysSoFar) * row.seasonDays
const HABIT_CASE8_THRESHOLD = 600

const habitCase9 = {
  caseNumber: 9,
  idKey: 'checkpoint',
  idPlural: 'checkpoints',
  title: 'Halfway Bonus',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Project the finish line! Divide the minutes read so far by the days so far, then multiply by 30 to see where each checkpoint's pace would land by Day 30. Beating 600 total projected minutes counts as On Pace.",
    blockIds: ['DIVIDE', 'MULTIPLY', 'COUNTIF', 'IF'],
    payout: 55,
  },
  analysis: {
    intro: `On Pace means a projected total over ${HABIT_CASE8_THRESHOLD} minutes by Day 30. ${HABIT_CASE8_THRESHOLD} or under still needs a boost.`,
    columns: [
      { key: 'checkpoint', label: 'Checkpoint', letter: 'A' },
      { key: 'minutesSoFar', label: 'Minutes So Far', letter: 'B' },
      { key: 'daysSoFar', label: 'Days So Far', letter: 'C' },
      { key: 'seasonDays', label: 'Season Length', letter: 'D' },
      { key: 'total', label: 'Projected Total', letter: 'E', targetable: true },
      { key: 'status', label: 'Pace', letter: 'F', targetable: true },
    ],
    rows: case8Rows,
    computeTotal: case8Projected,
    computeMetric: case8Projected,
    threshold: HABIT_CASE8_THRESHOLD,
    statusLabels: { pass: 'On Pace', fail: 'Needs a Boost' },
    labelBlocks: [
      { id: 'ON_PACE', label: '🚀 On Pace', kind: 'literal', value: 'On Pace' },
      { id: 'NEEDS_BOOST', label: '🔧 Needs a Boost', kind: 'literal', value: 'Needs a Boost' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many checkpoints project to beat ${HABIT_CASE8_THRESHOLD} minutes by Day 30?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} out of ${case8Rows.length} checkpoints project to beat ${HABIT_CASE8_THRESHOLD} minutes by Day 30 at their current pace.`,
      question: 'What should you do with a checkpoint that Needs a Boost?',
      options: [
        { id: 'adjust', label: 'Add a few more minutes per day to catch up', ideal: true },
        { id: 'quit', label: 'Give up on the 30-day goal', ideal: false },
        { id: 'ignore', label: 'A projection is just a guess, ignore it', ideal: false },
      ],
      idealFeedback: 'Right — a projection is a heads-up, not a verdict. A small boost changes the whole picture. 🚀',
      nudgeFeedback: 'Check the Pace column — which checkpoints are already On Pace, and which need more minutes?',
    }
  },
}

// ---------- Case 10: Weekend vs. Weekday ----------

const case9Rows = [
  { day: 'Monday', type: 'Weekday', minutes: 25, goal: 20 },
  { day: 'Tuesday', type: 'Weekday', minutes: 15, goal: 20 },
  { day: 'Wednesday', type: 'Weekday', minutes: 22, goal: 20 },
  { day: 'Thursday', type: 'Weekday', minutes: 18, goal: 20 },
  { day: 'Friday', type: 'Weekday', minutes: 28, goal: 20 },
  { day: 'Saturday', type: 'Weekend', minutes: 35, goal: 20 },
  { day: 'Sunday', type: 'Weekend', minutes: 12, goal: 20 },
]
const HABIT_CASE9_THRESHOLD = 20

const habitCase10 = {
  caseNumber: 10,
  idKey: 'day',
  idPlural: 'days',
  title: 'Weekend vs. Weekday',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      'Same goal as always: more than 20 minutes counts as Goal Met. Label the full week, then use COUNTIF on just the weekend rows to see if weekends help or hurt the streak.',
    blockIds: ['COUNTIF', 'IF'],
    payout: 50,
  },
  analysis: {
    intro: `More than ${HABIT_CASE9_THRESHOLD} minutes counts as a Goal Met day, on weekdays or weekends alike.`,
    columns: [
      { key: 'day', label: 'Day', letter: 'A' },
      { key: 'type', label: 'Day Type', letter: 'B' },
      { key: 'minutes', label: 'Minutes', letter: 'C' },
      { key: 'goal', label: 'Daily Goal', letter: 'D' },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows: case9Rows,
    computeMetric: (row) => row.minutes,
    threshold: HABIT_CASE9_THRESHOLD,
    statusLabels: { pass: 'Goal Met', fail: 'Try Again' },
    labelBlocks: [
      { id: 'GOAL_MET', label: '✅ Goal Met', kind: 'literal', value: 'Goal Met' },
      { id: 'TRY_AGAIN', label: '🔁 Try Again', kind: 'literal', value: 'Try Again' },
    ],
    hasGrandTotal: false,
    computeSummary: (rows) => rows.filter((r) => r.type === 'Weekend' && r.minutes > HABIT_CASE9_THRESHOLD).length,
    summaryQuestion: `How many weekend days hit the ${HABIT_CASE9_THRESHOLD}-minute goal? (COUNTIF just the Weekend rows)`,
  },
  buildInsight(_key, result) {
    const weekdayHits = case9Rows.filter((r) => r.type === 'Weekday' && r.minutes > HABIT_CASE9_THRESHOLD).length
    const weekdayTotal = case9Rows.filter((r) => r.type === 'Weekday').length
    const weekendTotal = case9Rows.filter((r) => r.type === 'Weekend').length
    return {
      message: `${result} out of ${weekendTotal} weekend days hit the goal, compared to ${weekdayHits} out of ${weekdayTotal} weekdays. That's a real pattern worth noticing.`,
      question: 'What should you do with a pattern like this?',
      options: [
        { id: 'plan-around', label: 'Plan reading time around the days that struggle most', ideal: true },
        { id: 'ignore-pattern', label: "Patterns in a habit tracker don't mean anything", ideal: false },
        { id: 'weekend-only', label: 'Only read on the days that already work', ideal: false },
      ],
      idealFeedback: 'Nice — spotting a pattern is only useful if you actually plan around it. 📊',
      nudgeFeedback: 'Compare the Status column across weekday rows and weekend rows — see any pattern?',
    }
  },
}

// ---------- Case 11: The Slump ----------

const case10Rows = [
  { day: 'Monday', minutes: 12 },
  { day: 'Tuesday', minutes: 8 },
  { day: 'Wednesday', minutes: 25 },
  { day: 'Thursday', minutes: 10 },
  { day: 'Friday', minutes: 15 },
]
const HABIT_CASE10_THRESHOLD = 20

const habitCase11 = {
  caseNumber: 11,
  idKey: 'day',
  idPlural: 'days',
  title: 'The Slump',
  steps: ['cleaning', 'analysis', 'interpretation'],
  brief: {
    problem:
      "A rough week happened — it happens to every streak. Clean up the messy log first, then honestly label the days: more than 20 minutes is still Goal Met, everything else is just Try Again, no big deal.",
    blockIds: ['COUNTIF', 'IF'],
    payout: 55,
  },
  cleaning: {
    intro:
      "This week's log got messy during the slump. Use the tools below to remove duplicate entries, fix mismatched book titles, and fill in any blanks.",
    columns: [
      { key: 'reader', label: 'Reader' },
      { key: 'book', label: 'Book' },
      { key: 'minutes', label: 'Minutes' },
    ],
    seedRows: [
      { reader: 'You', book: 'Mystery Manor', minutes: 12 },
      { reader: 'You', book: 'Ocean Explorers', minutes: 8 },
      { reader: 'You', book: 'Mystery Manor', minutes: 12 },
      { reader: 'You', book: 'ocean explorers', minutes: 25 },
      { reader: 'You', book: 'Space Quest', minutes: 10 },
      { reader: 'You', book: 'OCEAN EXPLORERS', minutes: 15 },
      { reader: 'You', book: 'Dragon Tales 2', minutes: 9 },
      { reader: 'You', book: '', minutes: 6 },
    ],
    textColumnKey: 'book',
  },
  analysis: {
    intro: `No punishment here — just an honest look. More than ${HABIT_CASE10_THRESHOLD} minutes is Goal Met, everything else is Try Again.`,
    columns: [
      { key: 'day', label: 'Day', letter: 'A' },
      { key: 'minutes', label: 'Minutes', letter: 'B' },
      { key: 'status', label: 'Status', letter: 'C', targetable: true },
    ],
    rows: case10Rows,
    computeMetric: (row) => row.minutes,
    threshold: HABIT_CASE10_THRESHOLD,
    statusLabels: { pass: 'Goal Met', fail: 'Try Again' },
    labelBlocks: [
      { id: 'GOAL_MET', label: '✅ Goal Met', kind: 'literal', value: 'Goal Met' },
      { id: 'TRY_AGAIN', label: '🔁 Try Again', kind: 'literal', value: 'Try Again' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many days hit the ${HABIT_CASE10_THRESHOLD}-minute goal this week?`,
  },
  buildInsight(_key, result) {
    return {
      message:
        result <= 1
          ? `Only ${result} day hit the goal this week — a real slump. But that one day still happened, and that's useful data, not a failure.`
          : `${result} days hit the goal this week — even a rough week isn't a total loss.`,
      question: "What's the best way to respond to a slump week?",
      options: [
        { id: 'learn', label: 'Look at what worked on the Goal Met day and repeat it', ideal: true },
        { id: 'quit', label: 'Give up on the streak entirely', ideal: false },
        { id: 'pretend', label: 'Pretend the slump week never happened', ideal: false },
      ],
      idealFeedback: 'Exactly — one good day in a rough week is still a clue worth using. 💪',
      nudgeFeedback: 'Look at the one day that did hit the goal — what was different about it?',
    }
  },
}

// ---------- Case 12: Final Stretch ----------

const case11Rows = [
  { week: 'Week 1', readinessScore: 6 },
  { week: 'Week 2', readinessScore: 9 },
  { week: 'Week 3', readinessScore: 10 },
  { week: 'Week 4', readinessScore: 5 },
]
// Readiness Score already blends average minutes, days met, and the goal
// ratio from earlier weeks — see the brief and analysis intro, which both
// spell out the rule.
const HABIT_CASE11_THRESHOLD = 8

const habitCase12 = {
  caseNumber: 12,
  idKey: 'week',
  idPlural: 'weeks',
  title: 'Final Stretch',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Every week's average minutes, days met, and goal ratio blend into one Readiness Score. A score above 8 means On Pace for 30 — 8 or under still Needs a Push.",
    blockIds: ['IF', 'COUNTIF'],
    payout: 65,
  },
  analysis: {
    intro: `A Readiness Score above ${HABIT_CASE11_THRESHOLD} means On Pace for 30. ${HABIT_CASE11_THRESHOLD} or under Needs a Push.`,
    columns: [
      { key: 'week', label: 'Week', letter: 'A' },
      { key: 'readinessScore', label: 'Readiness Score', letter: 'B' },
      { key: 'status', label: 'Status', letter: 'C', targetable: true },
    ],
    rows: case11Rows,
    computeMetric: (row) => row.readinessScore,
    threshold: HABIT_CASE11_THRESHOLD,
    statusLabels: { pass: 'On Pace', fail: 'Needs a Push' },
    labelBlocks: [
      { id: 'ON_PACE', label: '🚀 On Pace', kind: 'literal', value: 'On Pace' },
      { id: 'NEEDS_PUSH', label: '🔧 Needs a Push', kind: 'literal', value: 'Needs a Push' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many weeks are On Pace for 30 (Readiness Score over ${HABIT_CASE11_THRESHOLD})?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} out of ${case11Rows.length} weeks are On Pace for 30 once average minutes, days met, and the goal ratio all get blended together.`,
      question: 'What actually predicts finishing a 30-day streak strong?',
      options: [
        { id: 'consistency', label: 'Steady weeks adding up, not just one great day', ideal: true },
        { id: 'one-day', label: 'One amazing day makes up for everything else', ideal: false },
        { id: 'luck', label: "It's mostly luck at this point", ideal: false },
      ],
      idealFeedback: 'Exactly — consistency across weeks is what actually gets a streak to Day 30. 🏁',
      nudgeFeedback: 'Look at the Status column — which weeks actually crossed the line?',
    }
  },
}

// ---------- Case 13: Day 30: Goal Achieved! ----------

const case12Rows = [
  { week: 'Week 1', weekdayMinutes: 108, weekendMinutes: 42 },
  { week: 'Week 2', weekdayMinutes: 115, weekendMinutes: 45 },
  { week: 'Week 3', weekdayMinutes: 125, weekendMinutes: 50 },
  { week: 'Week 4', weekdayMinutes: 120, weekendMinutes: 45 },
]
const case12WeekTotal = (row) => row.weekdayMinutes + row.weekendMinutes
const HABIT_CASE12_THRESHOLD = 155

const habitCase13 = {
  caseNumber: 13,
  idKey: 'week',
  idPlural: 'weeks',
  title: 'Day 30: Goal Achieved!',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "It's Day 30! Add up each week's weekday and weekend minutes, total the whole month, and see how many weeks were Strong Weeks — more than 155 minutes in a week counts.",
    blockIds: ['SUM', 'COUNTIF', 'IF'],
    payout: 80,
  },
  analysis: {
    intro: `A Strong Week tops ${HABIT_CASE12_THRESHOLD} minutes total. ${HABIT_CASE12_THRESHOLD} or under is still a Building Week.`,
    columns: [
      { key: 'week', label: 'Week', letter: 'A' },
      { key: 'weekdayMinutes', label: 'Weekday Min', letter: 'B' },
      { key: 'weekendMinutes', label: 'Weekend Min', letter: 'C' },
      { key: 'total', label: 'Weekly Total', letter: 'D', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows: case12Rows,
    computeTotal: case12WeekTotal,
    computeMetric: case12WeekTotal,
    threshold: HABIT_CASE12_THRESHOLD,
    statusLabels: { pass: 'Strong Week', fail: 'Building Week' },
    labelBlocks: [
      { id: 'STRONG_WEEK', label: '💪 Strong Week', kind: 'literal', value: 'Strong Week' },
      { id: 'BUILDING_WEEK', label: '🌱 Building Week', kind: 'literal', value: 'Building Week' },
    ],
    grandTotalLabel: 'Grand Total — every minute read this whole month',
    formatGrandTotal: minutesLabel,
    summaryQuestion: `How many weeks were Strong Weeks (more than ${HABIT_CASE12_THRESHOLD} minutes)?`,
  },
  buildInsight(_key, result) {
    const monthTotal = case12Rows.reduce((sum, r) => sum + case12WeekTotal(r), 0)
    const dailyAvg = Math.round((monthTotal / 30) * 10) / 10
    return {
      message: `You read ${monthTotal} minutes total this month — a daily average of about ${dailyAvg} minutes, clearing the original 20-minute goal from Day 1! ${result} out of ${case12Rows.length} weeks were Strong Weeks. Thirty days, one habit, fully built. 🎉`,
      question: 'What actually made this 30-day streak work?',
      options: [
        { id: 'steady-routine', label: 'A steady routine, even through the slow weeks', ideal: true },
        { id: 'good-luck', label: 'It was mostly good luck', ideal: false },
        { id: 'one-big-day', label: 'One really big reading day carried the whole month', ideal: false },
      ],
      idealFeedback: "Yes! Small, steady sessions compounding day after day — that's exactly how a habit gets built. 🏆",
      nudgeFeedback: 'Think back over the whole month — was it really just one day, or everything added together?',
    }
  },
}

export const habitCases = [
  habitCase1,
  habitCase2,
  habitCase3,
  habitCase4,
  habitCase5,
  habitCase6,
  habitCase7,
  habitCase8,
  habitCase9,
  habitCase10,
  habitCase11,
  habitCase12,
  habitCase13,
]
