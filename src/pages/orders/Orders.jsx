import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { usePoints, notifyPointsChanged } from '../../hooks/usePoints'
import { CATEGORIAS, PRODUCTOS, COMIDA_IDS } from '../../data/products'

const TIENDAS = [
  { ciudad: 'Barcelona', tiendas: ['Poble Nou', 'Gràcia', 'Eixample'] },
  { ciudad: 'Madrid', tiendas: ['Malasaña', 'Salamanca'] },
  { ciudad: 'Valencia', tiendas: ['Ruzafa', 'El Carmen'] },
]

const ALL_HORAS = Array.from({ length: 49 }, (_, i) => {
  const h = Math.floor(i / 4) + 8
  const m = (i % 4) * 15
  return `${h}:${String(m).padStart(2, '0')}`
})

function getHorasDisponibles() {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return ALL_HORAS.filter((h) => {
    const [hh, mm] = h.split(':').map(Number)
    return hh * 60 + mm > nowMinutes
  })
}

const IconCafe = () => (
  <svg width="20" height="20" fill="none" stroke="#679974" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 8h1a4 4 0 010 8h-1" />
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
)

const IconComida = () => (
  <svg width="20" height="20" fill="none" stroke="#679974" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10.2 18H4.774a1.5 1.5 0 0 1-1.352-.97 11 11 0 0 1 .132-6.487" />
    <path d="M18 10.2V4.774a1.5 1.5 0 0 0-.97-1.352 11 11 0 0 0-6.486.132" />
    <path d="M18 5a4 3 0 0 1 4 3 2 2 0 0 1-2 2 10 10 0 0 0-5.139 1.42" />
    <path d="M5 18a3 4 0 0 0 3 4 2 2 0 0 0 2-2 10 10 0 0 1 1.42-5.14" />
    <path d="M8.709 2.554a10 10 0 0 0-6.155 6.155 1.5 1.5 0 0 0 .676 1.626l9.807 5.42a2 2 0 0 0 2.718-2.718l-5.42-9.807a1.5 1.5 0 0 0-1.626-.676" />
  </svg>
)

export default function Orders() {
  const navigate = useNavigate()
  const { points: userPoints, currentTier, progress: tierProgress } = usePoints()

  const [activeTab, setActiveTab] = useState('nuevo')
  const [categoriaActiva, setCategoriaActiva] = useState('Best Sellers')
  const [carrito, setCarrito] = useState({})
  const [hora, setHora] = useState(() => getHorasDisponibles()[0] || '20:00')
  const [tienda, setTienda] = useState({ nombre: 'Poble Nou', ciudad: 'Barcelona' })
  const categoriasRef = useRef(null)
  const [showHoraModal, setShowHoraModal] = useState(false)
  const [showTiendaModal, setShowTiendaModal] = useState(false)

  // New states for cart flow
  const [vista, setVista] = useState('menu') // 'menu' | 'carrito' | 'confirmacion'
  const [pedidosCompletados, setPedidosCompletados] = useState(() => {
    try {
      const saved = localStorage.getItem('pedidosCompletados')
      if (saved) {
        return JSON.parse(saved).map((p) => ({ ...p, fecha: new Date(p.fecha) }))
      }
    } catch {}
    return []
  })
  const [ultimoPedido, setUltimoPedido] = useState(null) // for confirmation screen

  // Payment cards
  const [tarjetas, setTarjetas] = useState([
    { id: 1, nombre: 'Mi Tarjeta', ultimos4: '4532' },
  ])
  const [tarjetaActiva, setTarjetaActiva] = useState(1)
  const [showNuevaTarjeta, setShowNuevaTarjeta] = useState(false)
  const [nuevaTarjetaForm, setNuevaTarjetaForm] = useState({
    numero: '', titular: '', expiry: '', cvv: '',
  })

  const todosProductos = Object.values(PRODUCTOS).flat()
  const productos = PRODUCTOS[categoriaActiva] || []

  const añadir = (id) => {
    setCarrito((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  const quitar = (id) => {
    setCarrito((prev) => {
      const next = { ...prev }
      if (next[id] > 1) next[id]--
      else delete next[id]
      return next
    })
  }

  const totalItems = Object.values(carrito).reduce((s, n) => s + n, 0)

  const totalPrecio = Object.entries(carrito).reduce((sum, [id, qty]) => {
    const prod = todosProductos.find((p) => p.id === Number(id))
    return sum + (prod ? prod.precio * qty : 0)
  }, 0)

  const cantidadDe = (id) => carrito[id] || 0

  // Build cart items list
  const itemsCarrito = Object.entries(carrito).map(([id, qty]) => {
    const prod = todosProductos.find((p) => p.id === Number(id))
    return prod ? { ...prod, qty } : null
  }).filter(Boolean)

  const formatNumeroTarjeta = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const handleGuardarTarjeta = () => {
    const digits = nuevaTarjetaForm.numero.replace(/\D/g, '')
    if (digits.length < 13 || !nuevaTarjetaForm.titular || !nuevaTarjetaForm.expiry || !nuevaTarjetaForm.cvv) return
    const nueva = {
      id: Date.now(),
      nombre: nuevaTarjetaForm.titular,
      ultimos4: digits.slice(-4),
    }
    setTarjetas((prev) => [...prev, nueva])
    setTarjetaActiva(nueva.id)
    setNuevaTarjetaForm({ numero: '', titular: '', expiry: '', cvv: '' })
    setShowNuevaTarjeta(false)
  }

  const handlePagar = () => {
    const puntosGanados = Math.round(totalPrecio)

    const pedido = {
      id: Date.now(),
      numero: String(42 + pedidosCompletados.length).padStart(4, '0'),
      items: itemsCarrito,
      total: totalPrecio,
      puntos: puntosGanados,
      fecha: new Date(),
      tienda: { ...tienda },
      hora,
    }

    // Add order to completados and persist to localStorage
    const nuevosPedidos = [pedido, ...pedidosCompletados]
    setPedidosCompletados(nuevosPedidos)
    try {
      localStorage.setItem('pedidosCompletados', JSON.stringify(nuevosPedidos))
    } catch {}

    // Notify the usePoints hook so all screens update immediately
    notifyPointsChanged()

    setUltimoPedido(pedido)
    setVista('confirmacion')
  }

  const handleCerrar = () => {
    setUltimoPedido(null)
    setCarrito({})
    setVista('menu')
    setActiveTab('completados')
  }

  const isCarrito = vista === 'carrito'

  // ─── Vista: Confirmación ───
  if (vista === 'confirmacion' && ultimoPedido) {
    return (
      <PageWrapper className="!pb-0">
        <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-32 overflow-y-auto">
          {/* Check icon */}
          <div className="w-20 h-20 rounded-full bg-brand-green flex items-center justify-center mb-5">
            <svg width="40" height="40" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="text-brand-black text-xl font-bold text-center mb-2">
            ¡Gracias por realizar un nuevo pedido!
          </h2>
          <p className="text-brand-black/50 text-sm text-center mb-8">
            Muestra tu QR para la recogida
          </p>

          {/* Puntos ganados */}
          <div className="w-full bg-white rounded-xl px-5 py-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-brand-black font-bold text-sm">Felicidades</p>
              <span className="text-brand-green font-bold text-lg">+{ultimoPedido.puntos} ⭐</span>
            </div>
            <div className="flex flex-col gap-1">
              {ultimoPedido.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-brand-black/70">{item.qty}x {item.nombre}</span>
                  <span className="text-brand-black/50">{(item.precio * item.qty).toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tier card */}
          <div className="w-full bg-white rounded-xl px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-brand-black font-bold text-sm">{currentTier.name}</p>
              <p className="text-brand-black/50 text-xs">{userPoints}/{currentTier.maxPoints} pts</p>
            </div>
            <div className="w-full h-2.5 bg-brand-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-green rounded-full transition-all duration-500"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cerrar button */}
        <div className="fixed bottom-16 left-0 right-0 z-40 px-6 pb-4 safe-area-pb md:bottom-0 md:left-[220px] md:max-w-none">
          <button
            onClick={handleCerrar}
            className="w-full bg-brand-green text-white font-bold text-base py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
          >
            Cerrar
          </button>
        </div>
      </PageWrapper>
    )
  }

  // ─── Vista: Menu (default) ───
  return (
    <PageWrapper className="!pb-0">
      {/* Header */}
      <div className="relative bg-white px-5 pt-6 pb-3 flex items-center justify-between" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <button onClick={() => isCarrito ? setVista('menu') : navigate(-1)} className="w-9 h-9 flex items-center justify-center">
          <svg width="22" height="22" fill="none" stroke="#2E2D38" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-[#2E2D38] text-lg font-bold absolute left-1/2 -translate-x-1/2">Pick & Go</h1>
        <div className="w-9" />
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('nuevo')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              activeTab === 'nuevo'
                ? 'bg-brand-green text-white'
                : 'bg-white text-brand-dark'
            }`}
          >
            Nuevo Pedido
          </button>
          <button
            onClick={() => !isCarrito && setActiveTab('completados')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              activeTab === 'completados'
                ? 'bg-brand-green text-white'
                : 'bg-white text-[#1D4D4F]'
            } ${isCarrito ? 'opacity-40 cursor-default' : ''}`}
          >
            Completados
          </button>
        </div>
      </div>

      {activeTab === 'nuevo' || isCarrito ? (
        <>
          {/* Pickup time */}
          <div className="mx-6 mt-4 bg-white rounded-xl px-4 py-3">
            <p className="text-brand-black/40 text-xs mb-1">Hora de Recogida</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="text-brand-black/40" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <p className="text-brand-black font-semibold text-sm">{hora}</p>
              </div>
              {!isCarrito && (
                <button onClick={() => setShowHoraModal(true)} className="text-[#1D4D4F] text-sm font-medium">Cambiar</button>
              )}
            </div>
          </div>

          {/* Store */}
          <div className="mx-6 mt-3 bg-white rounded-xl px-4 py-3">
            <p className="text-brand-black/40 text-xs mb-1">Tienda de Recogida</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="text-brand-black/40" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className="text-brand-black font-semibold text-sm">{tienda.nombre}, {tienda.ciudad}</p>
              </div>
              {!isCarrito && (
                <button onClick={() => setShowTiendaModal(true)} className="text-[#1D4D4F] text-sm font-medium">Cambiar</button>
              )}
            </div>
          </div>

          {isCarrito ? (
            <>
              {/* Separator */}
              <div className="h-px bg-[#DFE4EC] mx-6 mt-6" />

              {/* White section for cart */}
              <div className="bg-white rounded-t-3xl mt-6 pb-36">
                {/* Tu selección header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <h2 className="text-brand-black text-base font-bold">Tu selección</h2>
                  <button onClick={() => setVista('menu')} className="text-brand-green text-sm font-semibold">
                    Añadir más
                  </button>
                </div>

                {/* Cart items */}
                <div className="px-6 flex flex-col gap-0">
                  {itemsCarrito.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-4">
                      <div className="w-14 h-14 rounded-full bg-brand-lightGreen shrink-0 flex items-center justify-center overflow-hidden">
                        {item.imagen
                          ? <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                          : COMIDA_IDS.has(item.id) ? <IconComida /> : <IconCafe />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-brand-black text-[15px] font-bold truncate">{item.nombre}</p>
                        <p className="text-brand-black/50 text-sm mt-0.5">{item.precio.toFixed(2)} €</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {Array.from({ length: Math.min(item.qty, 4) }, (_, i) => (
                          <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center ${i === item.qty - 1 ? 'bg-brand-green' : 'bg-[#E8EEE9]'}`}>
                            {i === item.qty - 1 && (
                              <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="px-6 pt-3 pb-4 flex items-center justify-between">
                  <p className="text-brand-black font-bold text-base">Total</p>
                  <p className="text-brand-black font-bold text-base">{totalPrecio.toFixed(2)} €</p>
                </div>

                <div className="h-px bg-[#DFE4EC] mx-6" />

                {/* Forma de Pago */}
                <div className="px-6 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-brand-black text-sm font-bold">Forma de Pago</h3>
                    <button onClick={() => setShowNuevaTarjeta(true)} className="text-brand-green text-sm font-semibold">Nueva Tarjeta →</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {tarjetas.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTarjetaActiva(t.id)}
                        className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-colors ${
                          tarjetaActiva === t.id
                            ? 'bg-brand-bg ring-2 ring-brand-green'
                            : 'bg-brand-bg'
                        }`}
                      >
                        <div className="w-14 h-9 rounded-lg bg-gradient-to-r from-[#1D4D4F] to-[#3A7C6E] flex items-center justify-center shrink-0">
                          <svg width="18" height="14" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 18">
                            <rect x="1" y="1" width="22" height="16" rx="2" />
                            <line x1="1" y1="7" x2="23" y2="7" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-brand-black text-sm font-semibold">{t.nombre}</p>
                          <p className="text-brand-black/40 text-xs">•••• {t.ultimos4}</p>
                        </div>
                        {tarjetaActiva === t.id && (
                          <svg width="18" height="18" fill="none" stroke="#679974" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pagar button */}
              <div className="fixed bottom-16 left-0 right-0 z-40 px-6 pb-4 safe-area-pb md:bottom-0 md:left-[220px] md:max-w-none">
                <button
                  onClick={handlePagar}
                  className="w-full bg-brand-green text-white font-bold text-base py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
                >
                  Pagar
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Separator */}
              <div className="h-px bg-[#DFE4EC] mx-6 mt-6" />

              {/* Menu section with white background */}
              <div className="bg-white rounded-t-3xl mt-6">
                {/* Category tabs */}
                <div
                  ref={categoriasRef}
                  className="flex gap-2 px-6 pt-5 pb-3 overflow-x-auto no-scrollbar"
                >
                  {CATEGORIAS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoriaActiva(cat)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                        categoriaActiva === cat
                          ? 'bg-brand-green text-white'
                          : 'bg-brand-bg text-[#1D4D4F]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Product list */}
                <div className="px-6 flex flex-col gap-0 pb-24 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:pb-8">
                  {productos.map((prod) => {
                    const qty = cantidadDe(prod.id)
                    return (
                      <div
                        key={prod.id}
                        className="flex items-center gap-3 py-4 md:bg-white md:rounded-xl md:p-4"
                      >
                        <div className="w-14 h-14 rounded-full bg-brand-lightGreen shrink-0 flex items-center justify-center overflow-hidden">
                          {prod.imagen
                            ? <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                            : COMIDA_IDS.has(prod.id) ? <IconComida /> : <IconCafe />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-brand-black text-[15px] font-bold truncate">{prod.nombre}</p>
                          <p className="text-brand-black/50 text-sm mt-0.5">{prod.precio.toFixed(2)} €</p>
                        </div>
                        {qty === 0 ? (
                          <button
                            onClick={() => añadir(prod.id)}
                            className="px-4 py-1.5 rounded-full bg-brand-green text-white text-sm font-medium shrink-0"
                          >
                            Añadir
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => quitar(prod.id)}
                              className="w-7 h-7 rounded-full border border-brand-green text-brand-green flex items-center justify-center text-sm leading-none"
                            >
                              −
                            </button>
                            <span className="text-sm font-semibold text-brand-black w-4 text-center">{qty}</span>
                            <button
                              onClick={() => añadir(prod.id)}
                              className="w-7 h-7 rounded-full bg-brand-green text-white flex items-center justify-center text-sm leading-none"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Cart bar */}
              {totalItems > 0 && (
                <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2 safe-area-pb md:bottom-0 md:left-[220px] md:max-w-none">
                  <div className="bg-brand-green rounded-2xl px-5 py-3 flex items-center justify-between text-white shadow-lg">
                    <div>
                      <p className="text-sm font-bold">{totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}</p>
                      <p className="text-xs opacity-80">{totalPrecio.toFixed(2)} €</p>
                    </div>
                    <button
                      onClick={() => setVista('carrito')}
                      className="bg-white text-brand-green font-semibold text-sm px-4 py-2 rounded-xl"
                    >
                      Ver Carrito
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Completados tab */
        pedidosCompletados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-brand-lightGreen flex items-center justify-center mb-4">
              <svg width="32" height="32" fill="none" stroke="#679974" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-brand-black/60 text-center text-sm max-w-[240px]">
              No tienes pedidos completados aún.
            </p>
          </div>
        ) : (
          <div className="px-6 pt-4 pb-24 md:grid md:grid-cols-2 md:gap-4">
            {pedidosCompletados.map((pedido, idx) => {
              const isReciente = idx === 0
              const resumen = pedido.items.map((i) => `${i.qty}x ${i.nombre}`).join(', ')
              const fechaStr = pedido.fecha.toLocaleString('es-ES', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })
              return (
                <div key={pedido.id} className="bg-white rounded-xl px-4 py-4 mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-brand-black font-bold text-sm">Pedido #{pedido.numero}</p>
                      <p className="text-brand-black/50 text-xs mt-0.5">{fechaStr}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isReciente
                        ? 'bg-brand-lightGreen text-brand-green'
                        : 'bg-[#F0F2F5] text-brand-black/50'
                    }`}>
                      {isReciente ? 'En Recogida' : 'Completado'}
                    </span>
                  </div>
                  <p className="text-brand-black/60 text-xs mb-2 line-clamp-1">{resumen}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-brand-black font-semibold text-sm">{pedido.total.toFixed(2)} €</p>
                    <p className="text-brand-green font-semibold text-sm">+{pedido.puntos} ⭐</p>
                  </div>
                </div>
              )
            })}

            {/* Monthly summary */}
            <div className="bg-white rounded-xl px-4 py-4 mt-2">
              <p className="text-brand-black/40 text-xs font-semibold uppercase tracking-wide mb-1">Resumen del mes</p>
              <p className="text-brand-black font-bold text-sm">
                Total este mes: {pedidosCompletados.reduce((s, p) => s + p.puntos, 0)} puntos
              </p>
              <button className="text-brand-green text-sm font-semibold mt-2">
                Ver todos los pedidos →
              </button>
            </div>
          </div>
        )
      )}

      {/* Modal Hora */}
      {showHoraModal && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowHoraModal(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-2xl max-h-[60vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-brand-black/15" />
            </div>
            <div className="px-5 pt-2 pb-3">
              <h2 className="text-brand-black text-lg font-bold">Hora de Recogida</h2>
            </div>
            <div className="overflow-y-auto px-5 pb-8 grid grid-cols-3 gap-2">
              {getHorasDisponibles().map((h) => (
                <button
                  key={h}
                  onClick={() => { setHora(h); setShowHoraModal(false) }}
                  className={`px-3 py-3 rounded-xl text-sm font-medium text-center ${
                    hora === h
                      ? 'bg-brand-green text-white'
                      : 'bg-brand-bg text-brand-black'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tienda */}
      {showTiendaModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" onClick={() => setShowTiendaModal(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-2xl max-h-[70vh] flex flex-col pb-[env(safe-area-inset-bottom)] md:max-w-[400px] md:rounded-2xl md:mx-4 md:pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3 shrink-0">
              <h2 className="text-brand-black text-lg font-bold">Tienda de Recogida</h2>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-20">
              {TIENDAS.map((grupo) => (
                <div key={grupo.ciudad} className="mb-3">
                  <p className="text-xs text-brand-black/40 font-semibold uppercase tracking-wide mb-1 px-4">{grupo.ciudad}</p>
                  {grupo.tiendas.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTienda({ nombre: t, ciudad: grupo.ciudad }); setShowTiendaModal(false) }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium mb-1 ${
                        tienda.nombre === t && tienda.ciudad === grupo.ciudad
                          ? 'bg-brand-green text-white'
                          : 'text-brand-black hover:bg-brand-bg'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
