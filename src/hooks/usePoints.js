import { useState, useEffect, useCallback } from 'react'
import { calcularPuntos } from '../lib/orders'

const TIERS = [
  { name: 'Bronce', minPoints: 0, maxPoints: 100 },
  { name: 'Plata', minPoints: 100, maxPoints: 300 },
  { name: 'Oro', minPoints: 300, maxPoints: 700 },
  { name: 'Platino', minPoints: 700, maxPoints: 1500 },
]

function getTierFromPoints(points) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].minPoints) return TIERS[i]
  }
  return TIERS[0]
}

function getNextTierName(currentTier) {
  const idx = TIERS.findIndex((t) => t.name === currentTier.name)
  if (idx < TIERS.length - 1) return TIERS[idx + 1].name
  return null
}

const CACHE_KEY = 'cached_points'

function getCachedPoints() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? Number(raw) : 0
  } catch {
    return 0
  }
}

function setCachedPoints(points) {
  try {
    localStorage.setItem(CACHE_KEY, String(points))
  } catch { /* quota exceeded */ }
}

// Global listeners so any component can trigger a refresh
let refreshListeners = new Set()

export function notifyPointsChanged() {
  refreshListeners.forEach((cb) => cb())
}

/**
 * Hook that returns points + tier info from Supabase,
 * with localStorage as offline cache.
 */
export function usePoints() {
  const [points, setPoints] = useState(getCachedPoints)

  const fetchPoints = useCallback(async () => {
    try {
      const total = await calcularPuntos()
      setPoints(total)
      setCachedPoints(total)
    } catch {
      // Offline — use cached value
      setPoints(getCachedPoints())
    }
  }, [])

  useEffect(() => {
    let active = true
    calcularPuntos()
      .then((total) => { if (active) { setPoints(total); setCachedPoints(total) } })
      .catch(() => { /* keep cached value */ })

    refreshListeners.add(fetchPoints)
    return () => { active = false; refreshListeners.delete(fetchPoints) }
  }, [fetchPoints])

  const currentTier = getTierFromPoints(points)
  const nextTierName = getNextTierName(currentTier)
  const pointsToNext = currentTier.maxPoints - points
  const progress = Math.min(
    ((points - currentTier.minPoints) / (currentTier.maxPoints - currentTier.minPoints)) * 100,
    100
  )

  return { points, currentTier, nextTierName, pointsToNext, progress, tiers: TIERS }
}
