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
  const { hydrate, setLoading, logout } = useAuthStore()
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

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return
        clearTimeout(safetyTimeout)
        // Atomic update: set user + session + loading in a single render
        hydrate(session?.user ?? null, session)
        if (session?.user) {
          fetchProfile(session.user.id).then((profile) => {
            if (cancelled) return
            if (profile) {
              setProfile(profile)
            } else {
              setProfile({ id: session.user.id, email: session.user.email, points: 0, tier: 'Bronce' })
            }
          })
        }
      })
      .catch(async (err) => {
        if (cancelled) return
        clearTimeout(safetyTimeout)
        console.error('[useAuth] getSession failed:', err)
        // Clear stale tokens so the error doesn't repeat on next visit
        await supabase.auth.signOut().catch(() => {})
        hydrate(null, null)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (cancelled) return
        // Atomic update to avoid intermediate state
        hydrate(session?.user ?? null, session)
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (cancelled) return
          if (profile) {
            setProfile(profile)
          } else {
            console.warn('[useAuth] Profile not found in DB, using fallback with user id')
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
  }, [hydrate, setLoading, setProfile, clearProfile, logout])
}
