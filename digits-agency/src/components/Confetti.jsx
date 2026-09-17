import { useMemo } from 'react'
import './Confetti.css'

const COLORS = ['var(--color-coral)', 'var(--color-sky)', 'var(--color-mint)', 'var(--color-yellow)', 'var(--color-purple)']

function Confetti({ count = 24 }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => i), [count])

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((i) => (
        <span
          key={i}
          className="confetti__piece"
          style={{
            left: `${(i / pieces.length) * 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 6) * 0.06}s`,
          }}
        />
      ))}
    </div>
  )
}

export default Confetti
