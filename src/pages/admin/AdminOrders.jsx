import { useState, useEffect } from 'react'
import { listarTodosPedidos, actualizarEstadoPedido } from '../../lib/orders'
import { supabase } from '../../lib/supabase'

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'en_recogida', label: 'En Recogida' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const ESTADO_COLORS = {
  en_recogida: 'bg-amber-100 text-amber-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export default function AdminOrders() {
  const [pedidos, setPedidos] = useState([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState(null)

  const cargarPedidos = async () => {
    try {
      const data = await listarTodosPedidos(filtro || undefined)
      setPedidos(data)
    } catch (err) {
      console.error('Error cargando pedidos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPedidos()
  }, [filtro])

  // Realtime subscription for new/updated orders
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        cargarPedidos()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [filtro])

  const handleCambiarEstado = async (orderId, nuevoEstado) => {
    try {
      await actualizarEstadoPedido(orderId, nuevoEstado)
      cargarPedidos()
    } catch (err) {
      console.error('Error actualizando estado:', err)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-[900px]">
      <h1 className="text-xl font-bold text-[#2E2D38] mb-4">Gestión de Pedidos</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {ESTADOS.map((e) => (
          <button
            key={e.value}
            onClick={() => setFiltro(e.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filtro === e.value ? 'bg-brand-green text-white' : 'bg-white text-[#1D4D4F]'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pedidos.length === 0 ? (
        <p className="text-[#54647A] text-sm text-center py-12">No hay pedidos con este filtro.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map((pedido) => {
            const isExpanded = expandido === pedido.id
            const fechaStr = new Date(pedido.created_at).toLocaleString('es-ES', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            })
            return (
              <div key={pedido.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandido(isExpanded ? null : pedido.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#2E2D38] font-bold text-sm">#{pedido.numero}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_COLORS[pedido.estado] || 'bg-gray-100 text-gray-600'}`}>
                        {pedido.estado}
                      </span>
                    </div>
                    <p className="text-[#54647A] text-xs mt-0.5">
                      {fechaStr} · {pedido.tienda_nombre} · {pedido.total.toFixed(2)} €
                    </p>
                  </div>
                  <svg
                    width="18" height="18" fill="none" stroke="#54647A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                    className={`transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-[#F0F2F5]">
                    <div className="pt-3 space-y-1">
                      <p className="text-xs text-[#54647A]">
                        Usuario: {pedido.user_id.slice(0, 8)}... · Recogida: {pedido.hora_recogida}
                      </p>
                      {pedido.order_items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-[#2E2D38]">{item.cantidad}x {item.nombre}</span>
                          <span className="text-[#54647A]">{(item.precio * item.cantidad).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>

                    {pedido.estado === 'en_recogida' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleCambiarEstado(pedido.id, 'completado')}
                          className="flex-1 bg-brand-green text-white text-sm font-semibold py-2 rounded-xl"
                        >
                          Completar
                        </button>
                        <button
                          onClick={() => handleCambiarEstado(pedido.id, 'cancelado')}
                          className="flex-1 bg-[#F0F2F5] text-[#E05252] text-sm font-semibold py-2 rounded-xl"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
