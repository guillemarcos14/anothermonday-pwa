import { useState, useEffect, useCallback } from 'react'
import { listarPedidos } from '../lib/orders'

const CACHE_KEY = 'cached_orders'

function getCachedOrders() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setCachedOrders(orders) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(orders))
  } catch { /* quota exceeded */ }
}

// Global listeners so external code can trigger a refresh
let refreshListeners = new Set()

export function notifyOrdersChanged() {
  refreshListeners.forEach((cb) => cb())
}

/**
 * Hook that returns the user's orders from Supabase,
 * with localStorage as offline cache.
 */
export function useOrders() {
  const [orders, setOrders] = useState(getCachedOrders)
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const data = await listarPedidos()
      setOrders(data)
      setCachedOrders(data)
    } catch {
      setOrders(getCachedOrders())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()

    refreshListeners.add(fetchOrders)
    return () => { refreshListeners.delete(fetchOrders) }
  }, [fetchOrders])

  return { orders, loading, refresh: fetchOrders }
}
