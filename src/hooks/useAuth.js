import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useUserStore } from '../store/userStore'

async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) console.error('[fetchProfile] Error:', error)
    return data
  } catch (err) {
    console.error('[fetchProfile] Exception:', err)
    return null
  }
}

export function useAuth() {
  const { hydrate, setLoading } = useAuthStore()
  const { setProfile, clearProfile } = useUserStore()

  useEffect(() => {
    let cancelled = false

    // Safety timeout — stop loading after 5s even if Supabase never responds
    const safetyTimeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('[useAuth] Timeout: forcing loading=false after 5s')
        setLoading(false)
      }
    }, 5000)

    // Use only onAuthStateChange — it fires INITIAL_SESSION on mount,
    // so there's no need to call getSession() separately (which causes
    // auth-token lock conflicts).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (cancelled) return
        clearTimeout(safetyTimeout)
        hydrate(session?.user ?? null, session)
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (cancelled) return
          if (profile) {
            setProfile(profile)
          } else {
            setProfile({ id: session.user.id, email: session.user.email, points: 0, tier: 'Bronce' })
          }
        } else {
          clearProfile()
        }
      }
    )

    return () => {
      cancelled = true
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [hydrate, setLoading, setProfile, clearProfile])
}
