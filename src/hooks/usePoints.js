import { useSyncExternalStore } from 'react'

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

// ── localStorage-backed store for points ──

const STORAGE_KEY = 'pedidosCompletados'
let listeners = new Set()

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const pedidos = JSON.parse(raw)
    return pedidos.reduce((sum, p) => sum + (p.puntos || 0), 0)
  } catch {
    return 0
  }
}

// Call this after writing pedidosCompletados to localStorage
export function notifyPointsChanged() {
  listeners.forEach((cb) => cb())
}

/**
 * Hook that returns the current points + tier info,
 * derived directly from the persisted pedidosCompletados in localStorage.
 */
export function usePoints() {
  const points = useSyncExternalStore(subscribe, getSnapshot, () => 0)
  const currentTier = getTierFromPoints(points)
  const nextTierName = getNextTierName(currentTier)
  const pointsToNext = currentTier.maxPoints - points
  const progress = Math.min(
    ((points - currentTier.minPoints) / (currentTier.maxPoints - currentTier.minPoints)) * 100,
    100
  )

  return { points, currentTier, nextTierName, pointsToNext, progress, tiers: TIERS }
}
