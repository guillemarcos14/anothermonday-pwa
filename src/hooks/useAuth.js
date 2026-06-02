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

async function hydrateWithSession(session, { hydrate, setProfile, clearProfile, cancelled }) {
  hydrate(session?.user ?? null, session)
  if (session?.user) {
    const fallback = { id: session.user.id, email: session.user.email, points: 0, tier: 'Bronce' }
    const profile = await fetchProfile(session.user.id)
    if (cancelled()) return
    setProfile(profile || fallback)
  } else {
    clearProfile()
  }
}

export function useAuth() {
  const { hydrate, setLoading } = useAuthStore()
  const { setProfile, clearProfile } = useUserStore()

  useEffect(() => {
    let cancelled = false
    let hydrated = false

    const ctx = {
      hydrate: (...args) => { hydrated = true; hydrate(...args) },
      setProfile,
      clearProfile,
      cancelled: () => cancelled,
    }

    // Fallback: if onAuthStateChange hasn't fired after 3s (e.g. the
    // Navigator Lock is stuck), fall back to getSession() directly.
    const fallbackTimeout = setTimeout(async () => {
      if (cancelled || hydrated) return
      console.warn('[useAuth] onAuthStateChange did not fire in 3s, falling back to getSession()')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled || hydrated) return
        await hydrateWithSession(session, ctx)
      } catch (err) {
        console.error('[useAuth] Fallback getSession() failed:', err)
        if (!cancelled && !hydrated) {
          hydrate(null, null)
        }
      }
    }, 3000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (cancelled) return
        clearTimeout(fallbackTimeout)
        // Run profile fetch outside the synchronous callback so the
        // Navigator Lock is released immediately (avoids "lock stolen"
        // errors under React StrictMode double-mount).
        hydrateWithSession(session, ctx)
      }
    )

    return () => {
      cancelled = true
      clearTimeout(fallbackTimeout)
      subscription.unsubscribe()
    }
  }, [hydrate, setLoading, setProfile, clearProfile])
}
