import { useState } from 'react'

function clampInput(raw) {
  return /^-?\d*\.?\d*$/.test(raw) ? raw : null
}

function NumberEntry({ disabled, onAdd }) {
  const [value, setValue] = useState('')

  const canAdd = !disabled && value !== '' && value !== '-' && !Number.isNaN(Number(value))

  const handleAdd = () => {
    if (!canAdd) return
    onAdd({ kind: 'literal', value: Number(value), label: value })
    setValue('')
  }

  const adjust = (delta) => {
    const next = (Number(value) || 0) + delta
    setValue(String(next))
  }

  return (
    <div className="number-entry">
      <button
        type="button"
        className="number-entry__step"
        disabled={disabled}
        onClick={() => adjust(-1)}
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="text"
        inputMode="decimal"
        className="number-entry__input"
        placeholder="0"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const clamped = clampInput(e.target.value)
          if (clamped !== null) setValue(clamped)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd()
        }}
      />
      <button
        type="button"
        className="number-entry__step"
        disabled={disabled}
        onClick={() => adjust(1)}
        aria-label="Increase"
      >
        +
      </button>
      <button type="button" className="number-entry__add" disabled={!canAdd} onClick={handleAdd}>
        ➕ Add
      </button>
    </div>
  )
}

export default NumberEntry
