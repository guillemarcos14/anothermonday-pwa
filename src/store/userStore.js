import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const TIERS = [
  { name: 'Bronce', minPoints: 0, maxPoints: 100 },
  { name: 'Plata', minPoints: 100, maxPoints: 300 },
  { name: 'Oro', minPoints: 300, maxPoints: 700 },
  { name: 'Platino', minPoints: 700, maxPoints: 1500 },
]

function getTierName(points) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].minPoints) return TIERS[i].name
  }
  return TIERS[0].name
}

function savePointsLocal(userId, points, tier) {
  try {
    localStorage.setItem(`profile_points_${userId}`, JSON.stringify({ points, tier }))
  } catch { /* quota exceeded — ignore */ }
}

function loadPointsLocal(userId) {
  try {
    const raw = localStorage.getItem(`profile_points_${userId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Recalculate points from persisted completed orders (the most reliable source)
function getPointsFromOrders() {
  try {
    const raw = localStorage.getItem('pedidosCompletados')
    if (!raw) return 0
    const pedidos = JSON.parse(raw)
    return pedidos.reduce((sum, p) => sum + (p.puntos || 0), 0)
  } catch {
    return 0
  }
}

export const useUserStore = create((set, get) => ({
  profile: null,

  setProfile: (profile) => {
    if (!profile?.id) {
      set({ profile })
      return
    }

    // Gather points from all sources and take the highest
    const supabasePoints = profile.points || 0
    const cachedPoints = loadPointsLocal(profile.id)?.points || 0
    const orderPoints = getPointsFromOrders()

    const bestPoints = Math.max(supabasePoints, cachedPoints, orderPoints)
    const tier = getTierName(bestPoints)
    const merged = { ...profile, points: bestPoints, tier }

    set({ profile: merged })
    savePointsLocal(profile.id, bestPoints, tier)

    // Sync back to Supabase if it was behind
    if (bestPoints > supabasePoints && profile.id) {
      supabase
        .from('profiles')
        .update({ points: bestPoints, tier })
        .eq('id', profile.id)
        .select()
        .then(({ error }) => {
          if (error) console.error('[setProfile] Sync points to Supabase failed:', error)
        })
    }
  },

  updatePoints: async (points) => {
    const profile = get().profile
    const tier = getTierName(points)
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, points, tier }
        : { points, tier },
    }))
    // Always cache to localStorage
    if (profile?.id) {
      savePointsLocal(profile.id, points, tier)
    }
    if (profile?.id) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ points, tier })
        .eq('id', profile.id)
        .select()
      if (error) {
        console.error('[updatePoints] Supabase error:', error)
      } else if (!data || data.length === 0) {
        console.error('[updatePoints] Update returned 0 rows — RLS policy may be blocking writes. profile.id:', profile.id)
      } else {
        console.log('[updatePoints] Saved OK:', data[0].points, 'pts,', data[0].tier)
      }
    } else {
      console.warn('[updatePoints] No profile.id — points only saved locally')
    }
  },

  clearProfile: () => set({ profile: null }),
}))
