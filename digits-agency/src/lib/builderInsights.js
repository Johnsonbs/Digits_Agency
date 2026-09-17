import { evaluateFormula } from './formulaEngine'

function resolve(tokens, values) {
  return tokens.map((t) => (t.kind === 'cell' ? { ...t, value: values[t.inputKey] } : t))
}

function classify(base, changed) {
  if (changed > base) return 'goes up'
  if (changed < base) return 'goes down'
  return 'stays exactly the same'
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

// Since a kid can build ANY working formula (there's no single "correct"
// one), we don't hardcode which direction is right — we actually run their
// formula with one input nudged up and observe what really happens, then
// build the question around that real behavior.
export function buildBuilderReflection(tool, tokens, inputs) {
  const baseResult = evaluateFormula(resolve(tokens, inputs))

  const effects = tool.inputs.map((input) => {
    const bumped = { ...inputs, [input.key]: Math.min(input.max, inputs[input.key] + input.step) }
    let changedResult = baseResult
    try {
      changedResult = evaluateFormula(resolve(tokens, bumped))
    } catch {
      changedResult = baseResult
    }
    return { input, direction: classify(baseResult, changedResult) }
  })

  const featured = effects.find((e) => e.direction !== 'stays exactly the same') || effects[0]
  const { input, direction } = featured

  const allDirections = ['goes up', 'goes down', 'stays exactly the same']
  const wrongDirections = allDirections.filter((d) => d !== direction)

  const options = shuffle([
    { id: 'correct', label: `It ${direction}`, ideal: true },
    { id: 'wrong-a', label: `It ${wrongDirections[0]}`, ideal: false },
    { id: 'wrong-b', label: `It ${wrongDirections[1]}`, ideal: false },
  ])

  return {
    message: `Nice testing! When ${input.label} goes up and everything else stays the same, your ${tool.resultLabel} ${direction}. That's your formula reacting to the new number!`,
    question: `What happens to the ${tool.resultLabel} when ${input.label} goes up?`,
    options,
    idealFeedback: 'Exactly! You really understand how your own formula reacts. 🌟',
    nudgeFeedback: `Try bumping ${input.label} up in the tester again and watch the ${tool.resultLabel} closely!`,
  }
}
