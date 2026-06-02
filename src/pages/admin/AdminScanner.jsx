import { useState, useRef, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { buscarPedidosActivos, buscarPerfil, actualizarEstadoPedido } from '../../lib/orders'
import { supabase } from '../../lib/supabase'

export default function AdminScanner() {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [manualInput, setManualInput] = useState('')
  const html5QrRef = useRef(null)

  // Client profile state
  const [cliente, setCliente] = useState(null) // { perfil, pedidos, rewards }
  const [loadingCliente, setLoadingCliente] = useState(false)
  const [actionMsg, setActionMsg] = useState('') // success message after actions

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop()
      } catch { /* already stopped */ }
      html5QrRef.current = null
    }
    setScanning(false)
  }

  const handleScan = async (userId) => {
    await stopScanner()
    setError('')
    setActionMsg('')
    setCliente(null)
    setLoadingCliente(true)

    try {
      const [perfil, pedidos] = await Promise.all([
        buscarPerfil(userId),
        buscarPedidosActivos(userId),
      ])

      // Fetch pending user_rewards (table may not exist yet)
      let rewards = []
      try {
        const { data } = await supabase
          .from('user_rewards')
          .select('id, achievement_id, product_id, status, products ( nombre, imagen )')
          .eq('user_id', userId)
          .eq('status', 'pending')
        rewards = data || []
      } catch { /* table may not exist yet */ }

      setCliente({ perfil, pedidos, rewards })
    } catch (err) {
      setError('No se encontró el usuario o hubo un error: ' + err.message)
    } finally {
      setLoadingCliente(false)
    }
  }

  const startScanner = async () => {
    setError('')
    setActionMsg('')
    setCliente(null)
    setScanning(true)

    try {
      const qr = new Html5Qrcode('qr-reader')
      html5QrRef.current = qr

      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => { handleScan(decodedText) },
        () => {}
      )
    } catch {
      setError('No se pudo acceder a la cámara. Usa el input manual.')
      setScanning(false)
    }
  }

  useEffect(() => {
    return () => { stopScanner() }
  }, [])

  const handleMarcarEntregado = async (orderId, numero) => {
    try {
      await actualizarEstadoPedido(orderId, 'entregado')
      setActionMsg(`Pedido #${numero} marcado como entregado.`)
      // Refresh client data
      setCliente((prev) => ({
        ...prev,
        pedidos: prev.pedidos.map((p) =>
          p.id === orderId ? { ...p, estado: 'entregado' } : p
        ).filter((p) => p.estado !== 'entregado'),
      }))
    } catch (err) {
      setError('Error marcando como entregado: ' + err.message)
    }
  }

  const handleEntregarRegalo = async (rewardId) => {
    try {
      const { error: err } = await supabase
        .from('user_rewards')
        .update({ status: 'redeemed', redeemed_at: new Date().toISOString() })
        .eq('id', rewardId)

      if (err) throw err

      setActionMsg('Regalo entregado correctamente.')
      setCliente((prev) => ({
        ...prev,
        rewards: prev.rewards.filter((r) => r.id !== rewardId),
      }))
    } catch (err) {
      setError('Error entregando regalo: ' + err.message)
    }
  }

  const handleManualSearch = async (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    await handleScan(manualInput.trim())
  }

  const handleScanOtro = () => {
    setCliente(null)
    setError('')
    setActionMsg('')
  }

  return (
    <div className="p-4 md:p-6 max-w-[600px]">
      <h1 className="text-xl font-bold text-[#2E2D38] mb-4">Escáner QR</h1>
      <p className="text-[#54647A] text-sm mb-4">
        Escanea el QR del cliente para ver su perfil, pedidos y regalos.
      </p>

      {/* Camera scanner */}
      <div
        id="qr-reader"
        className={`w-full rounded-xl overflow-hidden bg-black ${scanning ? 'aspect-square' : 'hidden'}`}
      />

      {!scanning && !cliente && !loadingCliente && (
        <button
          onClick={startScanner}
          className="w-full bg-brand-green text-white font-semibold py-3 rounded-xl mb-4"
        >
          Abrir cámara
        </button>
      )}

      {scanning && (
        <button
          onClick={stopScanner}
          className="w-full bg-[#F0F2F5] text-[#2E2D38] font-semibold py-3 rounded-xl mt-3 mb-4"
        >
          Cerrar cámara
        </button>
      )}

      {/* Manual fallback */}
      {!cliente && !loadingCliente && (
        <div className="bg-white rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-[#2E2D38] mb-2">Búsqueda manual</p>
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="ID de usuario (UUID)"
              className="flex-1 px-3 py-2 rounded-lg border border-[#DFE4EC] text-sm focus:outline-none focus:border-brand-green"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-semibold shrink-0"
            >
              Buscar
            </button>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Success */}
      {actionMsg && (
        <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
          {actionMsg}
        </div>
      )}

      {/* Loading */}
      {loadingCliente && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Client profile view */}
      {cliente && (
        <div className="space-y-4">
          {/* Profile header */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-lightGreen flex items-center justify-center">
                <svg width="24" height="24" fill="none" stroke="#46704F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#2E2D38] font-bold text-base truncate">
                  {cliente.perfil.name || cliente.perfil.email || 'Sin nombre'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[#54647A]">{cliente.perfil.tier}</span>
                  <span className="text-xs text-[#54647A]">·</span>
                  <span className="text-xs text-brand-green font-semibold">{cliente.perfil.points} pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active orders */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-[#2E2D38] font-bold text-sm mb-3">
              Pedidos activos ({cliente.pedidos.length})
            </h2>
            {cliente.pedidos.length === 0 ? (
              <p className="text-[#54647A] text-sm">No tiene pedidos activos.</p>
            ) : (
              <div className="space-y-3">
                {cliente.pedidos.map((pedido) => (
                  <div key={pedido.id} className="border border-[#F0F2F5] rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#2E2D38] font-bold text-sm">#{pedido.numero}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        pedido.estado === 'pendiente'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {pedido.estado === 'pendiente' ? 'Pendiente' : 'Completado'}
                      </span>
                    </div>
                    <p className="text-xs text-[#54647A] mb-1">
                      {pedido.tienda_nombre} · {pedido.hora_recogida} · {pedido.total.toFixed(2)} €
                    </p>
                    <div className="space-y-0.5 mb-2">
                      {pedido.order_items?.map((item, i) => (
                        <p key={i} className="text-xs text-[#2E2D38]">
                          {item.cantidad}x {item.nombre}
                        </p>
                      ))}
                    </div>
                    {pedido.estado === 'completado' && (
                      <button
                        onClick={() => handleMarcarEntregado(pedido.id, pedido.numero)}
                        className="w-full bg-brand-green text-white text-sm font-semibold py-2 rounded-xl"
                      >
                        Marcar como entregado
                      </button>
                    )}
                    {pedido.estado === 'pendiente' && (
                      <p className="text-xs text-amber-700 italic">
                        Debe completarse antes de entregar
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending rewards */}
          {cliente.rewards.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-[#2E2D38] font-bold text-sm mb-3">
                Regalos pendientes ({cliente.rewards.length})
              </h2>
              <div className="space-y-3">
                {cliente.rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center gap-3 border border-[#F0F2F5] rounded-xl p-3">
                    <div className="w-10 h-10 rounded-full bg-[#EAF2EB] flex items-center justify-center shrink-0">
                      <svg width="20" height="20" fill="none" stroke="#46704F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <rect x="3" y="8" width="18" height="4" rx="1" />
                        <path d="M12 8v13" />
                        <path d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
                        <path d="M7.5 8a2.5 2.5 0 010-5C9 3 12 8 12 8" />
                        <path d="M16.5 8a2.5 2.5 0 000-5C15 3 12 8 12 8" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2E2D38] truncate">
                        {reward.products?.nombre || 'Producto regalo'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEntregarRegalo(reward.id)}
                      className="px-3 py-1.5 bg-brand-green text-white text-xs font-semibold rounded-lg shrink-0"
                    >
                      Entregar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scan another */}
          <button
            onClick={handleScanOtro}
            className="w-full bg-[#F0F2F5] text-[#2E2D38] font-semibold py-3 rounded-xl"
          >
            Escanear otro cliente
          </button>
        </div>
      )}
    </div>
  )
}
