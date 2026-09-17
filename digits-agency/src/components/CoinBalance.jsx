import { useEffect, useRef, useState } from 'react'
import './CoinBalance.css'

function CoinBalance({ balance }) {
  const [display, setDisplay] = useState(balance)
  const [bump, setBump] = useState(false)
  const prevRef = useRef(balance)

  useEffect(() => {
    const from = prevRef.current
    const to = balance
    prevRef.current = balance

    if (from === to) {
      setDisplay(to)
      return undefined
    }

    const duration = 900
    const startTime = performance.now()
    let frame

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (to - from) * eased))

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setDisplay(to)
        setBump(true)
        setTimeout(() => setBump(false), 300)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [balance])

  return (
    <div className={`coin-balance${bump ? ' coin-balance--bump' : ''}`} aria-live="polite">
      <span className="coin-balance__icon" aria-hidden="true">
        🪙
      </span>
      <span className="coin-balance__count">{display}</span>
    </div>
  )
}

export default CoinBalance
