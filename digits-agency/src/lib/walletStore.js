import { readWallet, writeWallet } from './saveStore'

export function getBalance() {
  return readWallet().balance
}

export function getOwnedItemIds() {
  return readWallet().ownedItemIds
}

export function getEquippedOutfitId() {
  return readWallet().equippedOutfitId
}

export function getDisplayedDecorationIds() {
  return readWallet().displayedDecorationIds
}

export function addCoins(amount) {
  const wallet = readWallet()
  const next = { ...wallet, balance: wallet.balance + amount }
  writeWallet(next)
  return next.balance
}

// Buys an item for a fixed price. No randomness, no partial refunds — a
// purchase either succeeds outright or is refused because of insufficient
// coins (never a raw error).
export function purchaseItem(itemId, price) {
  const wallet = readWallet()
  if (wallet.ownedItemIds.includes(itemId)) {
    return { success: true, alreadyOwned: true, balance: wallet.balance }
  }
  if (wallet.balance < price) {
    return { success: false, balance: wallet.balance }
  }
  const next = { ...wallet, balance: wallet.balance - price, ownedItemIds: [...wallet.ownedItemIds, itemId] }
  writeWallet(next)
  return { success: true, alreadyOwned: false, balance: next.balance }
}

// Mascot outfits are single-select — wearing a new one takes off the old
// one. Clicking the currently-worn outfit again takes it off entirely.
export function setEquippedOutfit(itemId) {
  const wallet = readWallet()
  if (itemId !== null && !wallet.ownedItemIds.includes(itemId)) return wallet.equippedOutfitId
  const nextId = wallet.equippedOutfitId === itemId ? null : itemId
  writeWallet({ ...wallet, equippedOutfitId: nextId })
  return nextId
}

// Desk decorations aren't exclusive — a kid can display as many owned
// decorations at once as they like.
export function toggleDisplayedDecoration(itemId) {
  const wallet = readWallet()
  if (!wallet.ownedItemIds.includes(itemId)) return wallet.displayedDecorationIds
  const isDisplayed = wallet.displayedDecorationIds.includes(itemId)
  const next = isDisplayed
    ? wallet.displayedDecorationIds.filter((id) => id !== itemId)
    : [...wallet.displayedDecorationIds, itemId]
  writeWallet({ ...wallet, displayedDecorationIds: next })
  return next
}
