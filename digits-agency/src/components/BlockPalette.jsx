import { blockCategories } from '../data/blocks'
import NumberEntry from './NumberEntry'
import './BlockPalette.css'

function BlockPalette({ disabled, onBlockClick, categories = blockCategories, hint = '👉 Tap a highlighted cell to start solving!' }) {
  return (
    <div className="palette">
      <h2 className="palette__title">Blocks</h2>

      {disabled && <p className="palette__hint">{hint}</p>}

      <section className="palette__section">
        <h3 className="palette__category" style={{ color: 'var(--color-ink)' }}>
          🔢 Numbers
        </h3>
        <NumberEntry disabled={disabled} onAdd={onBlockClick} />
      </section>

      {categories.map((category) => (
        <section className="palette__section" key={category.id}>
          <h3 className="palette__category" style={{ color: category.color }}>
            {category.label}
          </h3>
          <div className="palette__blocks">
            {category.blocks.map((block) => (
              <button
                key={block.id}
                type="button"
                className={`block-btn${block.small ? ' block-btn--small' : ''}`}
                style={{ '--block-color': category.color }}
                disabled={disabled}
                onClick={() => onBlockClick({ ...block, categoryColor: category.color })}
              >
                {block.label}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default BlockPalette
