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
  steps: ['entry', 'cleaning'],
  brief: {
    problem:
      "Training season starts now! Log this week's workout numbers into the system, then clean up the messy training log so it's ready to work with.",
    blockIds: [],
    payout: 20,
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
}

// ---------- Case 2: Crunching the Numbers ----------

const healthCase2 = {
  caseNumber: 2,
  idKey: 'day',
  idPlural: 'days',
  title: 'Crunching the Numbers',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "The week's numbers are logged — now let's see what they actually show. Multiply pace by distance to find each day's training total, add up the week's Grand Total, then flag which days are On Track versus Needs Work. The rule: any day you run more than 3km is On Track. 3km or less is Needs Work.",
    blockIds: ['MULTIPLY', 'SUM', 'COUNTIF', 'IF'],
    payout: 40,
  },

  analysis: {
    intro: 'Training goal: any day you run more than 3km is On Track. 3km or less Needs Work.',
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

function findInLog(withinText, findText) {
  const index = withinText.toLowerCase().indexOf(findText.toLowerCase())
  return index === -1 ? 'Not found' : index + 1
}

// ---------- Case 3: Rest Day Ratio ----------

const health2Rows = [
  { category: 'Training Days', count: 5 },
  { category: 'Rest Days', count: 2 },
]

const health2ComputeSummary = (rows) => {
  const training = rows.find((r) => r.category === 'Training Days').count
  const rest = rows.find((r) => r.category === 'Rest Days').count
  return rest / training
}

const healthCase3 = {
  caseNumber: 3,
  idKey: 'category',
  idPlural: 'categories',
  title: 'Rest Day Ratio',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Week 1 is in the books. Coach's rule: a rest-to-training ratio above 1 means Jamie is resting more than training — a red flag for overtraining. Divide rest days by training days to check.",
    blockIds: ['DIVIDE'],
    payout: 35,
  },
  analysis: {
    intro:
      "Coach's rule: a rest ratio above 1 means more resting than training — a possible overtraining sign. Below 1 means training is still the main focus, which is healthy this early in the season.",
    columns: [
      { key: 'category', label: 'Category', letter: 'A' },
      { key: 'count', label: 'Days', letter: 'B' },
    ],
    rows: health2Rows,
    hasGrandTotal: false,
    computeSummary: health2ComputeSummary,
    summaryQuestion: "What's Jamie's rest-to-training ratio this week? (DIVIDE Rest Days by Training Days)",
  },
  buildInsight(_key, result) {
    return {
      message: `Jamie's rest-to-training ratio this week is ${result} — well below the overtraining line of 1. That's way more training than resting.`,
      question: 'What should Jamie do with a healthy ratio like this?',
      options: [
        { id: 'keep-balance', label: 'Keep the current rest-and-training balance', ideal: true },
        { id: 'cut-rest', label: 'Cut out rest days completely', ideal: false },
        { id: 'ignore', label: "Rest days don't matter, ignore them", ideal: false },
      ],
      idealFeedback: "Exactly — rest is part of the plan, not the enemy of it! 🛌",
      nudgeFeedback: 'A ratio under 1 means training is winning out over resting — is that a good balance or a risky one?',
    }
  },
}

// ---------- Case 4: Best Pace Yet ----------

const HEALTH3_AVERAGE_PACE = 6.2

const health3Rows = [
  { day: 'Monday', pace: 6 },
  { day: 'Tuesday', pace: 6 },
  { day: 'Wednesday', pace: 6 },
  { day: 'Thursday', pace: 7 },
  { day: 'Friday', pace: 6 },
]

const healthCase4 = {
  caseNumber: 4,
  idKey: 'day',
  idPlural: 'sessions',
  title: 'Best Pace Yet',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Week 2's pace log is ready. Average it out across every session to set a real baseline pace for the whole season — the number every future week gets measured against.",
    blockIds: ['AVERAGE'],
    payout: 40,
  },
  analysis: {
    columns: [
      { key: 'day', label: 'Day', letter: 'A' },
      { key: 'pace', label: 'Pace (min/km)', letter: 'B' },
    ],
    rows: health3Rows,
    hasGrandTotal: false,
    computeSummary: (rows) => rows.reduce((sum, r) => sum + r.pace, 0) / rows.length,
    summaryQuestion: "What's Jamie's average pace this week? (AVERAGE the Pace column)",
  },
  buildInsight(_key, result) {
    return {
      message: `Jamie's average pace this week is ${result} min/km — that's officially the season's baseline pace to beat.`,
      question: 'What should this baseline actually be used for?',
      options: [
        { id: 'compare-later', label: 'Comparing future weeks to see real improvement', ideal: true },
        { id: 'meaningless', label: "Nothing, it's just a number", ideal: false },
        { id: 'fastest-ever', label: "It proves Jamie is already as fast as possible", ideal: false },
      ],
      idealFeedback: 'Exactly — a baseline only matters once later results get measured against it! 📈',
      nudgeFeedback: "This number alone doesn't prove much yet — what would make it useful?",
    }
  },
}

// ---------- Case 5: The Group Run ----------

const health4Rows = [
  { runner: 'Jamie', day: 'Mon', distance: 5 },
  { runner: 'Jamie', day: 'Tue', distance: 4 },
  { runner: 'Jordan', day: 'Tue', distance: 4 },
  { runner: 'Jamie', day: 'Wed', distance: 6 },
  { runner: 'Jamie', day: 'Thu', distance: 5 },
  { runner: 'Jordan', day: 'Thu', distance: 5 },
  { runner: 'Jamie', day: 'Fri', distance: 7 },
  { runner: 'Jordan', day: 'Fri', distance: 7 },
]

const healthCase5 = {
  caseNumber: 5,
  idKey: 'runner',
  idPlural: 'sign-ins',
  title: 'The Group Run',
  steps: ['cleaning', 'analysis', 'interpretation'],
  brief: {
    problem:
      "Jamie's training partner Jordan just joined the plan! Tuesday's group-run sign-up sheet is a mess, though — clean it up, then count how many days Jordan actually showed up this week.",
    blockIds: ['COUNT'],
    payout: 55,
  },
  cleaning: {
    intro:
      "Tuesday's group-run sign-up sheet is a mess! Use the tools below to remove duplicate rows, fix mismatched names, and fill in the blank.",
    columns: [
      { key: 'runner', label: 'Runner' },
      { key: 'note', label: 'Note' },
      { key: 'distance', label: 'Distance (km)' },
    ],
    seedRows: [
      { runner: 'Jamie', note: 'Morning loop', distance: 5 },
      { runner: 'Jordan', note: 'Joined at the park', distance: 4 },
      { runner: 'Jamie', note: 'Morning loop', distance: 5 },
      { runner: 'jordan', note: 'Ran the hill route', distance: 6 },
      { runner: 'JAMIE', note: 'Easy pace', distance: 3 },
      { runner: 'Theo', note: 'First group run', distance: 4 },
      { runner: '', note: 'New runner, no name yet', distance: 2 },
    ],
    textColumnKey: 'runner',
  },
  analysis: {
    intro: "Now that the sign-up sheet is clean, here's the full week's group-run log.",
    columns: [
      { key: 'runner', label: 'Runner', letter: 'A' },
      { key: 'day', label: 'Day', letter: 'B' },
      { key: 'distance', label: 'Distance (km)', letter: 'C' },
    ],
    rows: health4Rows,
    hasGrandTotal: false,
    computeSummary: (rows) => rows.filter((r) => r.runner === 'Jordan').length,
    summaryQuestion: "How many days did Jordan join the group run this week? (Select Jordan's rows and COUNT them)",
  },
  buildInsight(_key, result) {
    return {
      message: `Jordan showed up for ${result} out of 5 group runs this week — training's officially a team effort now.`,
      question: 'Why bother tracking who actually shows up to group runs?',
      options: [
        { id: 'patterns', label: 'It shows patterns in commitment and support', ideal: true },
        { id: 'doesnt-matter', label: "It doesn't matter who's there", ideal: false },
        { id: 'more-is-better', label: 'More runners always means better training, no other reason needed', ideal: false },
      ],
      idealFeedback: 'Right — tracking who shows up turns a feeling into a real, countable pattern. 🤝',
      nudgeFeedback: "Look back at Jordan's rows — how many days did that count actually turn up?",
    }
  },
}

// ---------- Case 6: Find the Race ----------

const health5Rows = [
  {
    race: 'Brookfield Bolt 5K',
    date: 'May 2',
    note: 'Race day note: flat course through downtown, no water stops after mile 2.',
  },
  {
    race: 'Summit Sprint 5K',
    date: 'May 9',
    note: 'Race day note: steep climb up Summit Hill, finishing at the lookout.',
  },
  {
    race: 'Riverside 5K',
    date: 'May 16',
    note: 'Race day note: confirmed as the Riverside 5K, starting beside Riverside Park.',
  },
]

const healthCase6 = {
  caseNumber: 6,
  idKey: 'race',
  idPlural: 'races',
  title: 'Find the Race',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "The race calendar app glitched last week and some notes got jumbled. Search the Riverside 5K's own note to confirm its name is really attached to the right entry before locking in the date.",
    blockIds: ['FIND'],
    payout: 45,
  },
  analysis: {
    columns: [
      { key: 'race', label: 'Race', letter: 'A' },
      { key: 'date', label: 'Date', letter: 'B' },
      { key: 'note', label: 'Note', letter: 'C' },
    ],
    rows: health5Rows,
    hasGrandTotal: false,
    computeSummary: (rows) => findInLog(rows[2].note, rows[2].race),
    summaryQuestion: "Does the calendar's note for the Riverside 5K actually confirm its own name? (FIND the Race name in its Note)",
  },
  buildInsight(_key, result) {
    const found = result !== 'Not found'
    return {
      message: found
        ? "The calendar confirms it — May 16 really is the Riverside 5K, right where Coach marked it. Season goal race: locked in."
        : "The note doesn't actually mention the Riverside 5K by name — this entry might be the glitch.",
      question: found ? 'Now that the race is confirmed, what should happen next?' : 'What should happen with an unconfirmed entry?',
      options: found
        ? [
            { id: 'countdown', label: 'Start the countdown and build the training plan toward that date', ideal: true },
            { id: 'ignore-date', label: 'Ignore the date since race day is still far away', ideal: false },
            { id: 'different-race', label: 'Sign up for a totally different race instead', ideal: false },
          ]
        : [
            { id: 'double-check', label: 'Double-check the other calendar entries too', ideal: true },
            { id: 'assume-fine', label: "Assume it's fine and race there anyway", ideal: false },
            { id: 'give-up', label: 'Give up on finding the race entirely', ideal: false },
          ],
      idealFeedback: found
        ? 'Exactly — a confirmed date turns training into a real countdown! 📅'
        : 'Smart move — one glitchy entry means the others are worth a second look too.',
      nudgeFeedback: "Read the Riverside 5K's own note again — does it actually say Riverside 5K anywhere in it?",
    }
  },
}

// ---------- Case 7: Fuel Check ----------

const health6Rows = [
  { meal: 'Pre-run banana', carbs: 27 },
  { meal: 'Post-run smoothie', carbs: 40 },
]

const healthCase7 = {
  caseNumber: 7,
  idKey: 'meal',
  idPlural: 'meals',
  title: 'Fuel Check',
  steps: ['entry'],
  brief: {
    problem:
      "Coach left a quick fuel log on Jamie's kitchen whiteboard before training ramps up. Just get the numbers into the system.",
    blockIds: [],
    payout: 25,
  },
  entry: {
    intro: "A short fuel log was scribbled on the whiteboard. Read it, then enter the numbers into the grid below.",
    caseFileTitle: '🍌 Fuel Log',
    columns: [
      { key: 'meal', label: 'Meal' },
      { key: 'carbs', label: 'Carbs (g)' },
    ],
    rows: health6Rows,
    clue: (row) => `"${row.meal}" — ${row.carbs}g of carbs.`,
  },
}

// ---------- Case 8: On Track, Two Weeks In ----------

const HEALTH7_THRESHOLD = 3

const health7Rows = [
  { day: 'Week 1 Mon', distance: 3.5 },
  { day: 'Week 1 Tue', distance: 2 },
  { day: 'Week 1 Wed', distance: 4 },
  { day: 'Week 1 Thu', distance: 1.5 },
  { day: 'Week 1 Fri', distance: 3 },
  { day: 'Week 2 Mon', distance: 5 },
  { day: 'Week 2 Tue', distance: 2.5 },
  { day: 'Week 2 Wed', distance: 4.5 },
  { day: 'Week 2 Thu', distance: 3.2 },
  { day: 'Week 2 Fri', distance: 6 },
]

const healthCase8 = {
  caseNumber: 8,
  idKey: 'day',
  idPlural: 'days',
  title: 'On Track, Two Weeks In',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Two weeks of training logs, combined into one sheet. Same rule as Week 1: any day with more than 3km keeps Jamie On Track. Count how many days across both weeks actually cleared it.",
    blockIds: ['COUNTIF', 'IF'],
    payout: 50,
  },
  analysis: {
    intro:
      "Same training goal as Week 1: any day with more than 3km is On Track. 3km or less is Needs Work — let's see how the last two weeks stack up together.",
    columns: [
      { key: 'day', label: 'Day', letter: 'A' },
      { key: 'distance', label: 'Distance (km)', letter: 'B' },
      { key: 'status', label: 'Status', letter: 'C', targetable: true },
    ],
    rows: health7Rows,
    computeMetric: (row) => row.distance,
    threshold: HEALTH7_THRESHOLD,
    statusLabels: { pass: 'On Track', fail: 'Needs Work' },
    labelBlocks: [
      { id: 'ON_TRACK', label: '💪 On Track', kind: 'literal', value: 'On Track' },
      { id: 'NEEDS_WORK', label: '😴 Needs Work', kind: 'literal', value: 'Needs Work' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `Across both weeks, how many days ran more than ${HEALTH7_THRESHOLD}km?`,
  },
  buildInsight(_key, result) {
    const total = health7Rows.length
    const pct = Math.round((result / total) * 100)
    return {
      message: `${result} out of ${total} days over the last two weeks were On Track — that's ${pct}% of the combined log clearing the ${HEALTH7_THRESHOLD}km bar.`,
      question: 'Two weeks in, what should the plan do next?',
      options: [
        { id: 'build-on-track', label: 'Keep building on the On Track days', ideal: true },
        { id: 'restart', label: 'Throw out the plan and start over', ideal: false },
        { id: 'stop-tracking', label: 'Stop tracking since more than half passed', ideal: false },
      ],
      idealFeedback: 'Yes! Building on what already works is how a training plan actually improves. 🏅',
      nudgeFeedback: 'Look back at the Status column — which days were actually labeled On Track?',
    }
  },
}

// ---------- Case 9: Interval Math ----------

const HEALTH8_THRESHOLD = 3

const health8Rows = [
  { interval: 'Rep 1', distance: 400, time: 100 },
  { interval: 'Rep 2', distance: 400, time: 80 },
  { interval: 'Rep 3', distance: 400, time: 160 },
  { interval: 'Rep 4', distance: 400, time: 200 },
]

const healthCase9 = {
  caseNumber: 9,
  idKey: 'interval',
  idPlural: 'intervals',
  title: 'Interval Math',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Training intensifies with interval reps. Interval goal: covering each 400m rep faster than 3 meters per second keeps you On Pace — divide distance by time for each rep, then flag the slow ones.",
    blockIds: ['DIVIDE', 'COUNTIF', 'IF'],
    payout: 55,
  },
  analysis: {
    intro: `Interval goal: covering each rep faster than ${HEALTH8_THRESHOLD} meters per second keeps you On Pace. ${HEALTH8_THRESHOLD} m/s or slower is Under Pace.`,
    columns: [
      { key: 'interval', label: 'Interval', letter: 'A' },
      { key: 'distance', label: 'Distance (m)', letter: 'B' },
      { key: 'time', label: 'Time (sec)', letter: 'C' },
      { key: 'total', label: 'Speed (m/s)', letter: 'D', targetable: true },
      { key: 'status', label: 'Status', letter: 'E', targetable: true },
    ],
    rows: health8Rows,
    computeTotal: (row) => row.distance / row.time,
    computeMetric: (row) => row.distance / row.time,
    threshold: HEALTH8_THRESHOLD,
    statusLabels: { pass: 'On Pace', fail: 'Under Pace' },
    labelBlocks: [
      { id: 'ON_PACE', label: '🏃 On Pace', kind: 'literal', value: 'On Pace' },
      { id: 'UNDER_PACE', label: '🐢 Under Pace', kind: 'literal', value: 'Under Pace' },
    ],
    hasGrandTotal: false,
    summaryQuestion: `How many reps were On Pace (faster than ${HEALTH8_THRESHOLD} m/s)?`,
  },
  buildInsight(_key, result) {
    return {
      message: `${result} out of 4 reps were On Pace — faster than the ${HEALTH8_THRESHOLD} m/s interval goal.`,
      question: "What should Jamie's coach do about the Under Pace reps?",
      options: [
        { id: 'look-closer', label: 'Look at those reps to see what slowed them down', ideal: true },
        { id: 'ignore-half', label: 'Ignore them since half the reps passed', ideal: false },
        { id: 'cut-intervals', label: 'Cut interval training completely', ideal: false },
      ],
      idealFeedback: "Exactly — the slow reps are exactly where there's something worth learning. 🔍",
      nudgeFeedback: 'Check the Status column — which reps actually came back Under Pace?',
    }
  },
}

// ---------- Case 10: Recovery Heart Rate ----------

const health9Rows = [
  { session: 'Session 1', heartRateDrop: 18 },
  { session: 'Session 2', heartRateDrop: 22 },
  { session: 'Session 3', heartRateDrop: 25 },
  { session: 'Session 4', heartRateDrop: 19 },
  { session: 'Session 5', heartRateDrop: 21 },
]

const healthCase10 = {
  caseNumber: 10,
  idKey: 'session',
  idPlural: 'sessions',
  title: 'Recovery Heart Rate',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Jamie's watch exported a week of recovery readings. Recovery goal: dropping more than 20 beats per minute in the first minute after finishing is a healthy sign, not an overtraining one. Average the week's readings.",
    blockIds: ['AVERAGE'],
    payout: 45,
  },
  analysis: {
    intro:
      'Recovery goal: dropping more than 20 beats per minute in the first minute after finishing is a sign of healthy recovery, not overtraining.',
    columns: [
      { key: 'session', label: 'Session', letter: 'A' },
      { key: 'heartRateDrop', label: 'Heart Rate Drop (bpm)', letter: 'B' },
    ],
    rows: health9Rows,
    hasGrandTotal: false,
    computeSummary: (rows) => rows.reduce((sum, r) => sum + r.heartRateDrop, 0) / rows.length,
    summaryQuestion: "What's Jamie's average 1-minute heart-rate recovery? (AVERAGE the Heart Rate Drop column)",
  },
  buildInsight(_key, result) {
    return {
      message: `Jamie's average recovery is ${result} bpm dropped in the first minute — just over the healthy 20 bpm line. No overtraining red flags here, following up on the Rest Day Ratio check.`,
      question: 'What would a LOW recovery number (well under 20) have suggested instead?',
      options: [
        { id: 'overtraining-sign', label: 'A possible sign of overtraining or fatigue', ideal: true },
        { id: 'meaningless', label: "Nothing, recovery numbers don't matter", ideal: false },
        { id: 'train-harder', label: 'That Jamie should train even harder immediately', ideal: false },
      ],
      idealFeedback: 'Exactly — recovery data is one more way to catch overtraining before it becomes an injury. 💓',
      nudgeFeedback: 'Compare the average to the 20 bpm healthy line — which side does it land on?',
    }
  },
}

// ---------- Case 11: The Long Run ----------

const health10Rows = [
  { day: 'Taper Mon', distance: 4 },
  { day: 'Taper Tue', distance: 3 },
  { day: 'Taper Wed', distance: 5 },
  { day: 'Taper Thu', distance: 2 },
  { day: 'Taper Fri', distance: 4 },
]
const HEALTH10_READY_DISTANCE = 15

const healthCase11 = {
  caseNumber: 11,
  idKey: 'day',
  idPlural: 'days',
  title: 'The Long Run',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      `Taper week is here — the easy stretch right before race day. Coaches like to see at least ${HEALTH10_READY_DISTANCE}km logged across the whole week to feel race-ready. Add up the week's distance and check it.`,
    blockIds: ['SUM'],
    payout: 50,
  },
  analysis: {
    intro: `Taper-week goal: at least ${HEALTH10_READY_DISTANCE}km logged across the week signals Jamie is race-ready.`,
    columns: [
      { key: 'day', label: 'Day', letter: 'A' },
      { key: 'distance', label: 'Distance (km)', letter: 'B' },
    ],
    rows: health10Rows,
    computeTotal: (row) => row.distance,
    hasSummary: false,
    grandTotalLabel: 'Grand Total — total taper-week distance',
    formatGrandTotal: (v) => `${v} km`,
  },
  buildInsight(_key, result) {
    const cleared = result > HEALTH10_READY_DISTANCE
    return {
      message: cleared
        ? `Jamie logged ${result}km total during taper week — clearing the ${HEALTH10_READY_DISTANCE}km mark coaches like to see before race day.`
        : `Jamie logged ${result}km total during taper week — just short of the ${HEALTH10_READY_DISTANCE}km mark coaches like to see.`,
      question: cleared ? 'What does hitting the taper goal actually mean?' : 'What should happen with a taper week that fell short?',
      options: cleared
        ? [
            { id: 'rest-up', label: 'The endurance base is there — time to rest up for race day', ideal: true },
            { id: 'cram-more', label: 'Jamie should cram in extra long runs now', ideal: false },
            { id: 'doesnt-matter', label: "The number doesn't matter this close to race day", ideal: false },
          ]
        : [
            { id: 'easy-extra', label: 'Add one more easy run before race day, without overdoing it', ideal: true },
            { id: 'panic-long-run', label: 'Squeeze in one huge long run right before the race', ideal: false },
            { id: 'skip-race', label: 'Skip the race entirely', ideal: false },
          ],
      idealFeedback: cleared
        ? 'Exactly — taper week is about arriving rested, not exhausted! 🛌'
        : "Smart — a small top-up beats a risky, exhausting one right before race day.",
      nudgeFeedback: `Compare ${result}km to the ${HEALTH10_READY_DISTANCE}km taper goal — which side of the line is it on?`,
    }
  },
}

// ---------- Case 12: Race Ready? ----------

const health11Rows = [
  { checkpoint: 'Pace Goal Beaten (Case 4)', metCount: 1 },
  { checkpoint: 'On Track Two Weeks In (Case 8)', metCount: 1 },
  { checkpoint: 'Taper Goal Hit (Case 11)', metCount: 1 },
]
const HEALTH11_THRESHOLD = 0

const healthCase12 = {
  caseNumber: 12,
  idKey: 'checkpoint',
  idPlural: 'checkpoints',
  title: 'Race Ready?',
  steps: ['analysis', 'interpretation'],
  brief: {
    problem:
      "Three checkpoints from this season — the pace goal, the two-week check, and the taper goal — each get a score. Anything above 0 counts as Met. Tally them up into one Race Ready verdict.",
    blockIds: ['COUNTIF', 'IF'],
    payout: 65,
  },
  analysis: {
    intro: 'Each checkpoint from earlier this season either came back Met or Missed. A score above 0 means Met.',
    columns: [
      { key: 'checkpoint', label: 'Checkpoint', letter: 'A' },
      { key: 'metCount', label: 'Score', letter: 'B' },
      { key: 'status', label: 'Status', letter: 'C', targetable: true },
    ],
    rows: health11Rows,
    computeMetric: (row) => row.metCount,
    threshold: HEALTH11_THRESHOLD,
    statusLabels: { pass: 'Met', fail: 'Missed' },
    labelBlocks: [
      { id: 'MET', label: '✅ Met', kind: 'literal', value: 'Met' },
      { id: 'MISSED', label: '❌ Missed', kind: 'literal', value: 'Missed' },
    ],
    hasGrandTotal: false,
    summaryQuestion: 'How many checkpoints did Jamie meet (score above 0)?',
  },
  buildInsight(_key, result) {
    const total = health11Rows.length
    return {
      message:
        result === total
          ? `All ${total} checkpoints came back Met — pace goal beaten, two-week check passed, taper goal hit. Jamie is Race Ready! 🏁`
          : `${result} out of ${total} checkpoints came back Met so far — worth reviewing the Status column before race day.`,
      question: "What should decide whether Jamie's actually ready to race?",
      options: [
        { id: 'all-checkpoints', label: 'Every checkpoint the season actually tracked', ideal: true },
        { id: 'gut-feeling', label: 'How confident Jamie feels that morning', ideal: false },
        { id: 'one-checkpoint', label: 'Whichever single checkpoint looks best', ideal: false },
      ],
      idealFeedback: 'Exactly — real readiness comes from the whole season of evidence, not just one good day. 🏆',
      nudgeFeedback: 'Check the Status column again — how many checkpoints actually came back Met?',
    }
  },
}

// ---------- Case 13: Riverside 5K Day ----------

const health12EntryRows = [
  { split: 'KM 1', time: 5.4 },
  { split: 'KM 2', time: 5.6 },
  { split: 'KM 3', time: 5.5 },
  { split: 'KM 4', time: 5.3 },
  { split: 'KM 5', time: 5.7 },
]

const health12Columns = [
  { key: 'split', label: 'Split', letter: 'A' },
  { key: 'time', label: 'Time (min)', letter: 'B' },
]

const healthCase13 = {
  caseNumber: 13,
  idKey: 'split',
  idPlural: 'splits',
  title: 'Riverside 5K Day',
  steps: ['entry', 'cleaning', 'analysis', 'interpretation'],
  brief: {
    problem:
      "It's race day! Enter Jamie's five kilometer splits from the Riverside 5K, then find the finish time and average pace — and see if the season's training actually paid off.",
    blockIds: ['SUM', 'AVERAGE'],
    payout: 80,
  },

  entry: {
    intro: "Race day! Read Jamie's split printout, then enter each kilometer's time into the grid below.",
    caseFileTitle: '🏁 Race Day Splits',
    columns: health12Columns,
    rows: health12EntryRows,
    clue: (row) => `${row.split}: ${row.time} min.`,
  },

  cleaning: {
    intro:
      "The race-day volunteer sign-in sheet is a mess! Use the tools below to remove duplicate rows, fix mismatched station names, and fill in the blank.",
    columns: [
      { key: 'volunteer', label: 'Volunteer' },
      { key: 'station', label: 'Station' },
      { key: 'hours', label: 'Hours' },
    ],
    seedRows: [
      { volunteer: 'Nora', station: 'Water Stop', hours: 3 },
      { volunteer: 'Kai', station: 'Finish Line', hours: 4 },
      { volunteer: 'Nora', station: 'Water Stop', hours: 3 },
      { volunteer: 'Ravi', station: 'water stop', hours: 2 },
      { volunteer: 'Kai', station: 'FINISH LINE', hours: 4 },
      { volunteer: 'Mina', station: '', hours: 3 },
    ],
    textColumnKey: 'station',
  },

  analysis: {
    columns: health12Columns,
    rows: health12EntryRows,
    computeTotal: (row) => row.time,
    computeSummary: (rows) => rows.reduce((sum, r) => sum + r.time, 0) / rows.length,
    grandTotalLabel: "Grand Total — Jamie's finish time",
    formatGrandTotal: (v) => `${v.toFixed(1)} min`,
    summaryQuestion: "What was Jamie's average split pace? (AVERAGE the Time column)",
  },

  buildInsight(_key, result) {
    const finishTime = health12EntryRows.reduce((sum, r) => sum + r.time, 0)
    const improvement = (HEALTH3_AVERAGE_PACE - result).toFixed(1)
    return {
      message: `Jamie crossed the finish line in ${finishTime.toFixed(1)} minutes for the full Riverside 5K — an average split pace of ${result} min/km! Back in Best Pace Yet, the season goal was ${HEALTH3_AVERAGE_PACE} min/km — Jamie beat it by ${improvement} min/km on race day.`,
      question: 'What made this pace improvement possible?',
      options: [
        { id: 'consistent-training', label: 'Months of consistent training, tracked case by case', ideal: true },
        { id: 'pure-luck', label: 'Pure luck on race day', ideal: false },
        { id: 'no-improvement', label: "The pace didn't actually improve", ideal: false },
      ],
      idealFeedback:
        "Yes! Every case this season — the pace checks, the checkpoints, the taper — added up to this. Season complete! 🎉",
      nudgeFeedback: `Compare ${result} min/km to the ${HEALTH3_AVERAGE_PACE} min/km baseline from Best Pace Yet — did it get faster or slower?`,
    }
  },
}

export const healthCases = [
  healthCase1,
  healthCase2,
  healthCase3,
  healthCase4,
  healthCase5,
  healthCase6,
  healthCase7,
  healthCase8,
  healthCase9,
  healthCase10,
  healthCase11,
  healthCase12,
  healthCase13,
]
