import { useEffect, useMemo, useRef, useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { blockCategories } from '../data/blocks'
import { compareValues } from '../lib/formulaEngine'
import './ComparisonSortActivity.css'

const SALES = [3, 7, 2, 9, 5, 6, 1, 8]

const OPERATOR_WORDS = {
  '>': 'greater than',
  '<': 'less than',
  '>=': 'greater than or equal to',
  '<=': 'less than or equal to',
  '=': 'equal to',
}

function ComparisonSortActivity({ onBack }) {
  const [compareValue, setCompareValue] = useState(5)
  const [activeOperator, setActiveOperator] = useState(null)
  const [draggedBlock, setDraggedBlock] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const dropZoneRef = useRef(null)

  const comparisonBlocks = useMemo(() => {
    const logic = blockCategories.find((c) => c.id === 'logic')
    return logic.blocks.filter((b) => b.small)
  }, [])

  useEffect(() => {
    if (!draggedBlock) return undefined

    const handleMove = (e) => setDragPos({ x: e.clientX, y: e.clientY })
    const handleUp = (e) => {
      const rect = dropZoneRef.current?.getBoundingClientRect()
      const inside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      if (inside) setActiveOperator(draggedBlock)
      setDraggedBlock(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [draggedBlock])

  const layout = useMemo(() => {
    if (!activeOperator) {
      return SALES.map((value, i) => ({
        value,
        left: `${10 + ((i + 0.5) / SALES.length) * 80}%`,
        top: '50%',
        isTrue: null,
      }))
    }

    let trueRank = 0
    let falseRank = 0
    return SALES.map((value, i) => {
      const isTrue = compareValues(activeOperator.symbol, value, compareValue)
      const rank = isTrue ? trueRank++ : falseRank++
      const jitter = ((i * 37) % 11) - 5
      return {
        value,
        left: `calc(${isTrue ? 25 : 75}% + ${jitter}px)`,
        top: `${76 + rank * 66}px`,
        isTrue,
      }
    })
  }, [activeOperator, compareValue])

  const trueCount = layout.filter((l) => l.isTrue).length
  const maxPileCount = activeOperator ? Math.max(trueCount, SALES.length - trueCount) : 0
  const dropZoneHeight = activeOperator
    ? 76 + Math.max(0, maxPileCount - 1) * 66 + 64
    : 220

  const handlePointerDown = (e, block) => {
    e.preventDefault()
    setDraggedBlock(block)
    setDragPos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div className="sort-activity">
      <ScreenHeader title="Sort the Sales" onBack={onBack} />

      <p className="sort-activity__intro">
        Drag a comparison block onto the numbers to sort them into True and False piles!
      </p>

      <div className="sort-activity__stepper">
        <span className="sort-activity__stepper-label">Compare to</span>
        <button
          type="button"
          className="stepper-btn"
          onClick={() => setCompareValue((v) => Math.max(0, v - 1))}
        >
          −
        </button>
        <span className="stepper-value">{compareValue}</span>
        <button
          type="button"
          className="stepper-btn"
          onClick={() => setCompareValue((v) => Math.min(10, v + 1))}
        >
          +
        </button>
      </div>

      <div className="sort-blocks">
        {comparisonBlocks.map((block) => (
          <button
            key={block.id}
            type="button"
            className={`sort-block${draggedBlock?.id === block.id ? ' is-dragging' : ''}`}
            onPointerDown={(e) => handlePointerDown(e, block)}
          >
            {block.label} {compareValue}
          </button>
        ))}
      </div>

      <div
        className={`drop-zone${draggedBlock ? ' is-drag-target' : ''}`}
        ref={dropZoneRef}
        style={{ minHeight: dropZoneHeight }}
      >
        {activeOperator && (
          <>
            <span className="pile-label pile-label--true">True</span>
            <span className="pile-label pile-label--false">False</span>
          </>
        )}
        {layout.map((card, i) => (
          <div
            key={i}
            className={`sort-card${card.isTrue === true ? ' sort-card--true' : ''}${
              card.isTrue === false ? ' sort-card--false' : ''
            }`}
            style={{ left: card.left, top: card.top }}
          >
            {card.value}
          </div>
        ))}
      </div>

      {activeOperator ? (
        <div className="sort-activity__result">
          <p>
            {trueCount} number{trueCount === 1 ? ' is' : 's are'}{' '}
            {OPERATOR_WORDS[activeOperator.symbol]} {compareValue}!
          </p>
          <button
            type="button"
            className="screen-header__back"
            onClick={() => setActiveOperator(null)}
          >
            ↩ Reset
          </button>
        </div>
      ) : (
        <p className="sort-activity__hint">Not sorted yet — drag a block above onto the numbers!</p>
      )}

      {draggedBlock && (
        <div className="drag-clone" style={{ left: dragPos.x, top: dragPos.y }}>
          {draggedBlock.label} {compareValue}
        </div>
      )}
    </div>
  )
}

export default ComparisonSortActivity
