import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { notifyOrdersChanged } from './useOrders'
import { notifyPointsChanged } from './usePoints'

/**
 * Subscribes to realtime changes on the orders table for the current user.
 * Shows toast when order status changes to 'completado'.
 * Includes reconnection with exponential backoff.
 */
export function useOrderSubscription() {
  const user = useAuthStore((s) => s.user)
  const retryCount = useRef(0)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return

    const subscribe = () => {
      const channel = supabase
        .channel(`orders-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const { new: newRow, old: oldRow } = payload

            // Refresh orders list
            notifyOrdersChanged()
            notifyPointsChanged()

            // Toast when order completed
            if (newRow.estado === 'completado' && oldRow.estado !== 'completado') {
              useToastStore.getState().addToast(
                `Tu pedido #${newRow.numero} esta listo para recoger`,
                'success'
              )
            }

            // Toast when order cancelled
            if (newRow.estado === 'cancelado' && oldRow.estado !== 'cancelado') {
              useToastStore.getState().addToast(
                `Tu pedido #${newRow.numero} ha sido cancelado`,
                'error'
              )
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            retryCount.current = 0
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            // Exponential backoff reconnection
            const delay = Math.min(1000 * 2 ** retryCount.current, 30000)
            retryCount.current++
            setTimeout(() => {
              supabase.removeChannel(channel)
              subscribe()
            }, delay)
          }
        })

      channelRef.current = channel
    }

    subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [user?.id])
}
