export const blockCategories = [
  {
    id: 'math',
    label: 'Math',
    color: 'var(--color-coral)',
    blocks: [
      { id: 'SUM', label: 'SUM', kind: 'func' },
      { id: 'AVERAGE', label: 'AVERAGE', kind: 'func' },
      { id: 'MULTIPLY', label: '×', kind: 'op', symbol: '×' },
      { id: 'DIVIDE', label: '÷', kind: 'op', symbol: '÷' },
      { id: 'COUNT', label: 'COUNT', kind: 'func' },
      { id: 'COUNTIF', label: 'COUNTIF', kind: 'func' },
    ],
  },
  {
    id: 'logic',
    label: 'Logic',
    color: 'var(--color-sky)',
    blocks: [
      { id: 'IF', label: 'IF', kind: 'func' },
      { id: 'GT', label: '>', kind: 'op', symbol: '>', small: true },
      { id: 'LT', label: '<', kind: 'op', symbol: '<', small: true },
      { id: 'GTE', label: '≥', kind: 'op', symbol: '>=', small: true },
      { id: 'LTE', label: '≤', kind: 'op', symbol: '<=', small: true },
      { id: 'EQ', label: '=', kind: 'op', symbol: '=', small: true },
    ],
  },
  {
    id: 'lookup',
    label: 'Lookup',
    color: 'var(--color-mint)',
    blocks: [{ id: 'FIND', label: 'FIND', kind: 'func' }],
  },
  {
    id: 'labels',
    label: 'Labels',
    color: 'var(--color-purple)',
    blocks: [
      { id: 'POPULAR', label: '🏷️ Popular', kind: 'literal', value: 'Popular' },
      { id: 'SLOW', label: '🏷️ Slow', kind: 'literal', value: 'Slow' },
    ],
  },
]

// The "Labels" category carries mission-specific Popular/Slow tags that don't
// mean anything on a player's own uploaded data, so free-play mode omits it.
export const freePlayBlockCategories = blockCategories.filter((c) => c.id !== 'labels')

export function findBlockById(id) {
  for (const category of blockCategories) {
    const block = category.blocks.find((b) => b.id === id)
    if (block) return { ...block, categoryColor: category.color, categoryLabel: category.label }
  }
  return null
}
