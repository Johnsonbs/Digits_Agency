const rows = [
  { day: 'Monday', pace: 6, distance: 3 },
  { day: 'Tuesday', pace: 3, distance: 8 },
  { day: 'Wednesday', pace: 8, distance: 1 },
  { day: 'Thursday', pace: 6, distance: 4 },
]

const GOAL_THRESHOLD = 3

const rawColumns = [
  { key: 'day', label: 'Day', letter: 'A' },
  { key: 'pace', label: 'Pace (min/km)', letter: 'B' },
  { key: 'distance', label: 'Distance (km)', letter: 'C' },
]

const healthCase1 = {
  caseNumber: 1,
  idKey: 'day',
  idPlural: 'days',
  title: 'Lace Up',
  steps: ['entry', 'cleaning', 'analysis', 'interpretation'],
  brief: {
    problem: "Training season starts now. Log the week's workouts and find out which days are really paying off.",
    blockIds: ['MULTIPLY', 'SUM', 'COUNTIF', 'IF'],
    payout: 50,
  },

  entry: {
    intro: 'Training season starts now! Read the training log, then enter this week\'s numbers into the grid.',
    caseFileTitle: '🏃 Training Log',
    columns: rawColumns,
    rows,
    clue: (row) => `${row.day}: paced at ${row.pace} min/km for ${row.distance}km.`,
  },

  cleaning: {
    intro:
      "This week's workout log is messy! Use the tools below to remove duplicate entries, fix mismatched workout names, and fill in any blanks.",
    columns: [
      { key: 'athlete', label: 'Athlete' },
      { key: 'workout', label: 'Workout' },
      { key: 'minutes', label: 'Minutes' },
    ],
    seedRows: [
      { athlete: 'Zara', workout: 'Run', minutes: 30 },
      { athlete: 'Milo', workout: 'Swim', minutes: 20 },
      { athlete: 'Zara', workout: 'Run', minutes: 30 },
      { athlete: 'Ellis', workout: 'run', minutes: 25 },
      { athlete: 'Nina', workout: 'Bike', minutes: 40 },
      { athlete: 'Omar', workout: 'SWIM', minutes: 15 },
      { athlete: 'Tess', workout: 'Yoga', minutes: 35 },
      { athlete: 'Wren', workout: '', minutes: 22 },
    ],
    textColumnKey: 'workout',
  },

  analysis: {
    columns: [
      ...rawColumns,
      { key: 'total', label: 'Total (min)', letter: 'D', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows,
    computeTotal: (row) => row.pace * row.distance,
    computeMetric: (row) => row.distance,
    threshold: GOAL_THRESHOLD,
    statusLabels: { pass: 'On Track', fail: 'Needs Work' },
    labelBlocks: [
      { id: 'ON_TRACK', label: '💪 On Track', kind: 'literal', value: 'On Track' },
      { id: 'NEEDS_WORK', label: '😴 Needs Work', kind: 'literal', value: 'Needs Work' },
    ],
    grandTotalLabel: 'Grand Total — total minutes trained this week',
    formatGrandTotal: (v) => `${v} min`,
    summaryQuestion: `How many days ran more than ${GOAL_THRESHOLD}km?`,
  },

  buildInsight(_key, result) {
    const total = rows.length
    const pct = Math.round((result / total) * 100)
    return {
      message: `${result} out of ${total} days you ran more than ${GOAL_THRESHOLD}km! That's ${pct}% of the week on track for the Riverside 5K.`,
      question: 'What should the training plan focus on next?',
      options: [
        { id: 'build-on-strong', label: 'Keep building on the strong days', ideal: true },
        { id: 'skip', label: 'Skip practice until race day', ideal: false },
        { id: 'only-slow', label: 'Only focus on the slow days', ideal: false },
      ],
      idealFeedback: 'Yes! Building on what\'s working is how real athletes improve. 🏅',
      nudgeFeedback: 'Look back at the Status column — which days were actually On Track?',
    }
  },
}

export const healthCases = [healthCase1]
