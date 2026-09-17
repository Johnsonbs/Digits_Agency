import CoinBalance from './CoinBalance'
import { getBalance } from '../lib/walletStore'
import './ScreenHeader.css'

function ScreenHeader({ title, onBack, backLabel = '← Back to missions' }) {
  return (
    <div className="screen-header">
      <button type="button" className="screen-header__back" onClick={onBack}>
        {backLabel}
      </button>
      <h1 className="screen-header__title">{title}</h1>
      <CoinBalance balance={getBalance()} />
    </div>
  )
}

export default ScreenHeader
