import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext(null)
const GUEST_KEY = 'digits-agency:guest:v1'

function readGuestFlag() {
  try {
    return localStorage.getItem(GUEST_KEY) === '1'
  } catch {
    return false
  }
}

function writeGuestFlag(value) {
  try {
    if (value) localStorage.setItem(GUEST_KEY, '1')
    else localStorage.removeItem(GUEST_KEY)
  } catch {
    // Not critical — guest mode just won't persist across a reload.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isGuest, setIsGuest] = useState(readGuestFlag)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [recovering, setRecovering] = useState(false)

  const fetchProfile = useCallback(async (userId) => {
    if (!supabase || !userId) return
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    setProfile(data || null)
  }, [])

  useEffect(() => {
    if (!supabase) return undefined

    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session)
      if (data.session?.user) fetchProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
      setSession(nextSession)
      if (nextSession?.user) {
        fetchProfile(nextSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signUp = useCallback(async (email, password, username) => {
    if (!supabase) return { error: { message: 'Accounts are not available right now.' } }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (!error) writeGuestFlag(false)
    setIsGuest(readGuestFlag())
    return { data, error }
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) return { error: { message: 'Accounts are not available right now.' } }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) writeGuestFlag(false)
    setIsGuest(readGuestFlag())
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }, [])

  const continueAsGuest = useCallback(() => {
    writeGuestFlag(true)
    setIsGuest(true)
  }, [])

  const exitGuestMode = useCallback(() => {
    writeGuestFlag(false)
    setIsGuest(false)
  }, [])

  const requestPasswordReset = useCallback(async (email) => {
    if (!supabase) return { error: { message: 'Accounts are not available right now.' } }
    return supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
  }, [])

  const updatePassword = useCallback(async (newPassword) => {
    if (!supabase) return { error: { message: 'Accounts are not available right now.' } }
    return supabase.auth.updateUser({ password: newPassword })
  }, [])

  const completeRecovery = useCallback(() => setRecovering(false), [])

  const refreshProfile = useCallback(() => {
    if (session?.user) return fetchProfile(session.user.id)
    return undefined
  }, [session, fetchProfile])

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      profile,
      isGuest,
      loading,
      recovering,
      isAdmin: profile?.role === 'admin',
      hasFullAccess: profile?.role === 'admin' || profile?.access_tier === 'full',
      signUp,
      signIn,
      signOut,
      continueAsGuest,
      exitGuestMode,
      refreshProfile,
      requestPasswordReset,
      updatePassword,
      completeRecovery,
    }),
    [
      session,
      profile,
      isGuest,
      loading,
      recovering,
      signUp,
      signIn,
      signOut,
      continueAsGuest,
      exitGuestMode,
      refreshProfile,
      requestPasswordReset,
      updatePassword,
      completeRecovery,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
