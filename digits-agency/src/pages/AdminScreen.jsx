import { useEffect, useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { supabase } from '../lib/supabaseClient'
import './AdminScreen.css'

function AdminScreen({ onBack }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState(null)

  const load = async () => {
    if (!supabase) return
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, username, coins, role, access_tier')
      .order('username', { ascending: true })
    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleToggleAccess = async (row) => {
    const nextTier = row.access_tier === 'full' ? 'restricted' : 'full'
    setBusyId(row.id)
    setNotice(null)
    const { error } = await supabase.rpc('set_user_access', { p_user_id: row.id, p_access_tier: nextTier })
    setBusyId(null)
    if (error) {
      setNotice({ kind: 'error', text: "That didn't go through — please try again." })
      return
    }
    setNotice({ kind: 'success', text: `${row.username} is now ${nextTier === 'full' ? 'fully unlocked' : 'restricted'}.` })
    load()
  }

  return (
    <div className="page">
      <ScreenHeader title="🛠️ Admin" onBack={onBack} backLabel="🏠 Home" />

      <div className="admin-panel">
        <p className="admin-panel__intro">
          Grant a player full access to unlock every case, or restrict them back to Detective Cases 1–4.
        </p>

        {notice && <p className={`admin-panel__notice admin-panel__notice--${notice.kind}`}>{notice.text}</p>}

        {loading && <p className="admin-panel__empty">Loading players…</p>}

        {!loading && rows.length === 0 && <p className="admin-panel__empty">No players have signed up yet.</p>}

        {!loading &&
          rows.map((row) => (
            <div key={row.id} className="admin-panel__row">
              <div className="admin-panel__info">
                <span className="admin-panel__name">
                  {row.username} {row.role === 'admin' && <span title="Admin">👑</span>}
                </span>
                <span className="admin-panel__meta">
                  🪙 {row.coins} · {row.access_tier === 'full' ? 'Full access' : 'Restricted (Cases 1–4)'}
                </span>
              </div>
              {row.role !== 'admin' && (
                <button
                  type="button"
                  className={`tool-btn ${row.access_tier === 'full' ? 'tool-btn--ghost' : 'tool-btn--purple'}`}
                  disabled={busyId === row.id}
                  onClick={() => handleToggleAccess(row)}
                >
                  {busyId === row.id ? 'Saving…' : row.access_tier === 'full' ? 'Restrict' : 'Grant Full Access'}
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}

export default AdminScreen
