import { useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import MascotAvatar from '../components/MascotAvatar'
import { storeItems } from '../data/storeItems'
import {
  getBalance,
  getOwnedItemIds,
  getEquippedOutfitId,
  getDisplayedDecorationIds,
  purchaseItem,
  setEquippedOutfit,
  toggleDisplayedDecoration,
} from '../lib/walletStore'
import './StoreScreen.css'

function StoreScreen({ onBack }) {
  const [balance, setBalance] = useState(getBalance)
  const [ownedIds, setOwnedIds] = useState(getOwnedItemIds)
  const [equippedOutfitId, setEquippedOutfitId] = useState(getEquippedOutfitId)
  const [displayedDecorationIds, setDisplayedDecorationIds] = useState(getDisplayedDecorationIds)
  const [justBoughtId, setJustBoughtId] = useState(null)

  const handleBuy = (item) => {
    const result = purchaseItem(item.id, item.price)
    if (!result.success) return

    setBalance(result.balance)
    setOwnedIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))

    if (item.category === 'Mascot Outfit') {
      if (!equippedOutfitId) {
        setEquippedOutfitId(setEquippedOutfit(item.id))
      }
    } else {
      setDisplayedDecorationIds(toggleDisplayedDecoration(item.id))
    }

    setJustBoughtId(item.id)
    setTimeout(() => setJustBoughtId((cur) => (cur === item.id ? null : cur)), 900)
  }

  const handleToggleWear = (item) => {
    setEquippedOutfitId(setEquippedOutfit(item.id))
  }

  const handleToggleDisplay = (item) => {
    setDisplayedDecorationIds(toggleDisplayedDecoration(item.id))
  }

  return (
    <div className="store">
      <ScreenHeader title="Digit's Store" onBack={onBack} backLabel="🏠 Home" />

      <div className="store__preview">
        <MascotAvatar equippedOutfitId={equippedOutfitId} />
        <p className="store__preview-label">This is Digit, your mascot!</p>
      </div>

      <p className="store__intro">
        Spend the coins you've earned on cosmetics for your mascot and desk — every item is a
        fixed price, no surprises.
      </p>

      <div className="store__grid">
        {storeItems.map((item) => {
          const owned = ownedIds.includes(item.id)
          const affordable = balance >= item.price
          const justBought = justBoughtId === item.id
          const isOutfit = item.category === 'Mascot Outfit'
          const isWorn = isOutfit && equippedOutfitId === item.id
          const isDisplayed = !isOutfit && displayedDecorationIds.includes(item.id)

          return (
            <div key={item.id} className={`store-card${justBought ? ' store-card--bought' : ''}`}>
              <span className="store-card__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="store-card__category">{item.category}</span>
              <span className="store-card__name">{item.name}</span>

              {owned ? (
                isOutfit ? (
                  <button
                    type="button"
                    className={isWorn ? 'store-card__owned store-card__owned--clickable' : 'store-card__buy store-card__buy--secondary'}
                    onClick={() => handleToggleWear(item)}
                  >
                    {isWorn ? '😎 Worn — tap to remove' : '👕 Wear'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={isDisplayed ? 'store-card__owned store-card__owned--clickable' : 'store-card__buy store-card__buy--secondary'}
                    onClick={() => handleToggleDisplay(item)}
                  >
                    {isDisplayed ? '✅ On Your Desk' : '🪟 Add to Desk'}
                  </button>
                )
              ) : affordable ? (
                <button type="button" className="store-card__buy" onClick={() => handleBuy(item)}>
                  🪙 Buy for {item.price}
                </button>
              ) : (
                <span className="store-card__locked">
                  🔒 Locked — {item.price} coins
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StoreScreen
