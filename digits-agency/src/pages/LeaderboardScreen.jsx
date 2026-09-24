import { useEffect, useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import './LeaderboardScreen.css'

const MEDALS = ['🥇', '🥈', '🥉']

function LeaderboardScreen({ onBack }) {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let cancelled = false

    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, coins')
        .neq('role', 'admin')
        .order('coins', { ascending: false })
        .limit(50)
      if (!cancelled) {
        setRows(data || [])
        setLoading(false)
      }
    }

    load()

    const channel = supabase
      .channel('leaderboard-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="page">
      <ScreenHeader title="🏆 Leaderboard" onBack={onBack} backLabel="🏠 Home" />

      <div className="leaderboard">
        {!supabase && (
          <p className="leaderboard__empty">The leaderboard isn't available right now — try again later.</p>
        )}

        {supabase && loading && <p className="leaderboard__empty">Loading rankings…</p>}

        {supabase && !loading && rows.length === 0 && (
          <p className="leaderboard__empty">No one's on the board yet — be the first to earn some coins!</p>
        )}

        {supabase &&
          !loading &&
          rows.map((row, index) => (
            <div
              key={row.id}
              className={`leaderboard__row${row.id === user?.id ? ' leaderboard__row--you' : ''}`}
            >
              <span className="leaderboard__rank">{MEDALS[index] || `#${index + 1}`}</span>
              <span className="leaderboard__name">{row.username}</span>
              <span className="leaderboard__coins">🪙 {row.coins}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

export default LeaderboardScreen
