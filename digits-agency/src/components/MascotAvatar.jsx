import { storeItems } from '../data/storeItems'
import './MascotAvatar.css'

function MascotAvatar({ equippedOutfitId, className = '' }) {
  const outfit = storeItems.find((item) => item.id === equippedOutfitId)

  return (
    <span className={`mascot-avatar ${className}`.trim()}>
      <span className="mascot-avatar__base" aria-hidden="true">
        🔍
      </span>
      {outfit && (
        <span className="mascot-avatar__outfit" aria-hidden="true" title={outfit.name}>
          {outfit.icon}
        </span>
      )}
    </span>
  )
}

export default MascotAvatar
