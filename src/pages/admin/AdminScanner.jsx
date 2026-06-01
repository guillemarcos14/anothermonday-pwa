import { useState, useRef, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { buscarPedidoEnRecogida, actualizarEstadoPedido } from '../../lib/orders'

export default function AdminScanner() {
  const [scanning, setScanning] = useState(false)
  const [pedido, setPedido] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [manualInput, setManualInput] = useState('')
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)

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
    setSuccess('')
    setPedido(null)

    try {
      const order = await buscarPedidoEnRecogida(userId)
      if (!order) {
        setError('No se encontró ningún pedido en recogida para este usuario.')
        return
      }
      setPedido(order)
    } catch (err) {
      setError('Error buscando pedido: ' + err.message)
    }
  }

  const startScanner = async () => {
    setError('')
    setSuccess('')
    setPedido(null)
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
    } catch (err) {
      setError('No se pudo acceder a la cámara. Usa el input manual.')
      setScanning(false)
    }
  }

  useEffect(() => {
    return () => { stopScanner() }
  }, [])

  const handleValidar = async () => {
    if (!pedido) return
    try {
      await actualizarEstadoPedido(pedido.id, 'completado')
      setSuccess(`Pedido #${pedido.numero} completado.`)
      setPedido(null)
    } catch (err) {
      setError('Error completando pedido: ' + err.message)
    }
  }

  const handleManualSearch = async (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    // Try as userId (UUID format) first
    await handleScan(manualInput.trim())
  }

  return (
    <div className="p-4 md:p-6 max-w-[600px]">
      <h1 className="text-xl font-bold text-[#2E2D38] mb-4">Escáner QR</h1>
      <p className="text-[#54647A] text-sm mb-4">
        Escanea el QR del cliente para validar su pedido de recogida.
      </p>

      {/* Camera scanner */}
      <div
        id="qr-reader"
        ref={scannerRef}
        className={`w-full rounded-xl overflow-hidden bg-black ${scanning ? 'aspect-square' : 'hidden'}`}
      />

      {!scanning && !pedido && (
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
      <div className="bg-white rounded-xl p-4 mb-4">
        <p className="text-sm font-semibold text-[#2E2D38] mb-2">Búsqueda manual</p>
        <form onSubmit={handleManualSearch} className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="ID de usuario o número de pedido"
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

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
          {success}
        </div>
      )}

      {/* Order detail */}
      {pedido && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#2E2D38] font-bold">Pedido #{pedido.numero}</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              {pedido.estado}
            </span>
          </div>
          <div className="space-y-1 mb-3">
            <p className="text-xs text-[#54647A]">
              Tienda: {pedido.tienda_nombre}, {pedido.tienda_ciudad} · Recogida: {pedido.hora_recogida}
            </p>
            {pedido.order_items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[#2E2D38]">{item.cantidad}x {item.nombre}</span>
                <span className="text-[#54647A]">{(item.precio * item.cantidad).toFixed(2)} €</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-[#F0F2F5]">
              <span>Total</span>
              <span>{pedido.total.toFixed(2)} €</span>
            </div>
          </div>
          <button
            onClick={handleValidar}
            className="w-full bg-brand-green text-white font-bold py-3 rounded-xl"
          >
            Validar y Completar
          </button>
        </div>
      )}
    </div>
  )
}
