export const builderTools = {
  'health-bmi': {
    id: 'health-bmi',
    theme: 'Health',
    title: 'Build a Health Score Calculator',
    intro:
      "Coach Digit needs a quick calculator for training day: type in someone's height and weight, and get back a Health Score. Build the formula, then test it!",
    resultLabel: 'Health Score',
    disclaimer: "This is a made-up \"BMI-style\" number for practice — it's not real medical advice!",
    inputs: [
      { key: 'height', label: 'Height (cm)', icon: '📏', initial: 140, min: 80, max: 220, step: 5 },
      { key: 'weight', label: 'Weight (kg)', icon: '⚖️', initial: 40, min: 10, max: 150, step: 5 },
    ],
  },
}

export function getBuilderTool(id) {
  return builderTools[id] || builderTools['health-bmi']
}
