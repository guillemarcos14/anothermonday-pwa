import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAuthStore } from '../../store/authStore'
import { useUserStore } from '../../store/userStore'
import { supabase } from '../../lib/supabase'
import { notifyPointsChanged } from '../../hooks/usePoints'
import { ALL_PRODUCTOS, CATEGORIAS, PRODUCTOS, COMIDA_IDS } from '../../data/products'

/* ── SVG Icons ── */

const IconEllipsisVertical = ({ size = 20, color = '#1D4D4F' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="5" r="1"/>
    <circle cx="12" cy="19" r="1"/>
  </svg>
)

const IconCafe = ({ size = 28, color = '#46704F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 8h1a4 4 0 010 8h-1" />
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
)

const IconComida = ({ size = 28, color = '#46704F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10.2 18H4.774a1.5 1.5 0 0 1-1.352-.97 11 11 0 0 1 .132-6.487" />
    <path d="M18 10.2V4.774a1.5 1.5 0 0 0-.97-1.352 11 11 0 0 0-6.486.132" />
    <path d="M18 5a4 3 0 0 1 4 3 2 2 0 0 1-2 2 10 10 0 0 0-5.139 1.42" />
    <path d="M5 18a3 4 0 0 0 3 4 2 2 0 0 0 2-2 10 10 0 0 1 1.42-5.14" />
    <path d="M8.709 2.554a10 10 0 0 0-6.155 6.155 1.5 1.5 0 0 0 .676 1.626l9.807 5.42a2 2 0 0 0 2.718-2.718l-5.42-9.807a1.5 1.5 0 0 0-1.626-.676" />
  </svg>
)

/* ── Orders data ── */
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

/* ── Product Card ── */
function ProductCard({ product, qty, onAdd, onRemove }) {
  const isFood = COMIDA_IDS.has(product.id)
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = () => {
    onAdd()
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden text-left transition-shadow hover:shadow-lg flex flex-col"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <div className="w-full aspect-[1120/934] flex items-center justify-center shrink-0" style={{ backgroundColor: '#1f3933' }}>
        {product.imagen
          ? <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />
          : isFood ? <IconComida size={48} /> : <IconCafe size={48} />}
      </div>
      <div className="flex-1 px-4 py-4 flex flex-col justify-between min-h-[140px]">
        <div>
          <p className="text-brand-black text-[28px] leading-tight truncate font-[550]" style={{ fontFamily: "'Instrument Serif', serif" }}>{product.nombre}</p>
          {product.descripcion && <p className="text-text-muted text-xs mt-0.5 line-clamp-2">{product.descripcion}</p>}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-text-muted text-sm font-medium">{product.precio.toFixed(2)} €</p>
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${justAdded ? 'bg-emerald-600 text-white' : 'bg-brand-green text-white'}`}
            >
              {justAdded ? 'Añadido ✓' : 'Añadir'}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onRemove}
                className="w-8 h-8 rounded-full border border-brand-green text-brand-green flex items-center justify-center text-base leading-none"
              >
                −
              </button>
              <span className="text-sm font-semibold text-brand-black w-4 text-center">{qty}</span>
              <button
                onClick={handleAdd}
                className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-base leading-none"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   DesktopApp — single scrollable page for md+ screens
   ══════════════════════════════════════════════════════ */
export default function DesktopApp() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [menuOpen, setMenuOpen] = useState(false)

  /* ── Cart / Order state ── */
  const [carrito, setCarrito] = useState(() => {
    try {
      const saved = localStorage.getItem('carrito')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {}
  })
  const [hora, setHora] = useState(() => getHorasDisponibles()[0] || '20:00')
  const [tienda, setTienda] = useState({ nombre: 'Poble Nou', ciudad: 'Barcelona' })
  const [showHoraModal, setShowHoraModal] = useState(false)
  const [showTiendaModal, setShowTiendaModal] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [ultimoPedido, setUltimoPedido] = useState(null)
  const [pedidosCompletados, setPedidosCompletados] = useState(() => {
    try {
      const saved = localStorage.getItem('pedidosCompletados')
      if (saved) return JSON.parse(saved).map((p) => ({ ...p, fecha: new Date(p.fecha) }))
    } catch {}
    return []
  })
  const [tarjetas] = useState([{ id: 1, nombre: 'Mi Tarjeta', ultimos4: '4532' }])
  const [tarjetaActiva, setTarjetaActiva] = useState(1)


  useEffect(() => {
    try { localStorage.setItem('carrito', JSON.stringify(carrito)) } catch {}
  }, [carrito])

  /* ── Cart helpers ── */
  const todosProductos = Object.values(PRODUCTOS).flat()
  const añadir = (id) => setCarrito((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  const quitar = (id) => setCarrito((prev) => {
    const next = { ...prev }
    if (next[id] > 1) next[id]--
    else delete next[id]
    return next
  })
  const totalItems = Object.values(carrito).reduce((s, n) => s + n, 0)
  const totalPrecio = Object.entries(carrito).reduce((sum, [id, qty]) => {
    const prod = todosProductos.find((p) => p.id === Number(id))
    return sum + (prod ? prod.precio * qty : 0)
  }, 0)
  const itemsCarrito = Object.entries(carrito).map(([id, qty]) => {
    const prod = todosProductos.find((p) => p.id === Number(id))
    return prod ? { ...prod, qty } : null
  }).filter(Boolean)

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
    const nuevosPedidos = [pedido, ...pedidosCompletados]
    setPedidosCompletados(nuevosPedidos)
    try { localStorage.setItem('pedidosCompletados', JSON.stringify(nuevosPedidos)) } catch {}
    notifyPointsChanged()
    setUltimoPedido(pedido)
    setShowCart(false)
    setShowConfirmation(true)
  }

  const handleCerrarConfirmacion = () => {
    setUltimoPedido(null)
    setCarrito({})
    setShowConfirmation(false)
  }

  const handleSignOut = () => {
    useAuthStore.getState().logout()
    useUserStore.getState().clearProfile()
    supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-[100dvh]">

      {/* ═══ Hero Banner (full viewport) ═══ */}
      <div className="relative w-full h-[100dvh] overflow-hidden">
        <img src="/fondodesktop.webp" alt="Another Monday" className="absolute inset-0 w-full h-full object-cover object-top" style={{ filter: 'blur(12px)', transform: 'scale(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        {/* Header (overlay on banner) */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4">
          <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between">
            <span style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: '20px', letterSpacing: '-1px', color: '#FFFFFF' }}>Another Monday</span>
            <div className="flex items-center gap-1">
              <div className="relative">
                <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menú" className="w-9 h-9 flex items-center justify-center">
                  <IconEllipsisVertical color="white" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-md border border-brand-gray z-50">
                      <button onClick={handleSignOut} className="w-full flex items-center gap-3 py-3 px-4 text-sm text-[#E05252] hover:bg-red-50 rounded-xl">
                        <svg width="16" height="16" fill="none" stroke="#E05252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Banner text */}
        <div className="relative z-10 flex flex-col justify-end h-full max-w-[1400px] mx-auto px-8 pb-16">
          <p className="text-white/80 text-sm font-medium tracking-wide uppercase mb-2">Pide y recoge sin esperas</p>
          <h1 className="text-white leading-tight" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, letterSpacing: '-1px', fontSize: '3.75rem' }}>
            Another Monday
          </h1>
          <p className="text-white/70 text-lg mt-2 max-w-md">
            Tu cafetería favorita. Haz tu pedido, acumula puntos y disfruta de recompensas exclusivas.
          </p>
          <button
            onClick={() => document.getElementById('productos-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="relative z-30 mt-5 bg-brand-green text-white font-semibold text-sm px-6 py-3 rounded-xl w-fit hover:bg-brand-dark transition-colors cursor-pointer"
          >
            Hacer pedido
          </button>
        </div>

        {/* QR — escanear para abrir la app en móvil */}
        <div className="absolute bottom-16 right-0 left-0 z-20 max-w-[1400px] mx-auto px-8 flex justify-end pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-white rounded-2xl p-3 shadow-lg">
            <QRCodeSVG
              value="https://pwa-omega-ruby.vercel.app/"
              size={100}
              bgColor="#FFFFFF"
              fgColor="#1D4D4F"
              level="M"
            />
          </div>
          <span className="text-white/70 text-xs font-medium text-center max-w-[120px] leading-snug">Escaneo esto. En el móvil hits different.</span>
        </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8">
        {/* ═══ Products ═══ */}
        <div id="productos-section" className="pt-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-brand-black text-[40px] font-semibold" style={{ fontFamily: "'Instrument Serif', serif" }}>Nuestros Productos</h2>
          </div>

          <div className="grid grid-cols-4 gap-5 pb-10">
            {ALL_PRODUCTOS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                qty={carrito[product.id] || 0}
                onAdd={() => añadir(product.id)}
                onRemove={() => quitar(product.id)}
              />
            ))}
          </div>
        </div>

      </div>

      {/* ═══ Fixed Cart Bar ═══ */}
      {totalItems > 0 && !showCart && !showConfirmation && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="max-w-[1400px] mx-auto px-8 pb-6">
            <button
              onClick={() => setShowCart(true)}
              className="w-full bg-brand-green hover:bg-brand-dark transition-colors text-white rounded-2xl px-6 py-4 flex items-center justify-between shadow-xl"
              style={{ boxShadow: '0 -2px 20px rgba(0,0,0,0.15)' }}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">{totalItems}</span>
                <span className="font-semibold text-base">Ver Carrito</span>
              </div>
              <span className="font-bold text-base">{totalPrecio.toFixed(2)} €</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══ Cart Modal ═══ */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="relative bg-white rounded-2xl max-w-[500px] w-full max-h-[80vh] overflow-y-auto mx-4 shadow-xl">
            <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-[#E8E7E3]">
              <h2 className="text-brand-black text-lg font-bold">Tu Carrito</h2>
              <button onClick={() => setShowCart(false)} aria-label="Cerrar carrito" className="w-9 h-9 flex items-center justify-center text-[#2E2D38]">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {itemsCarrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <p className="text-text-muted text-sm mb-4">Tu carrito está vacío</p>
                <button
                  onClick={() => setShowCart(false)}
                  className="px-6 py-2.5 rounded-full bg-brand-green text-white text-sm font-medium hover:bg-brand-dark transition-colors"
                >
                  Explorar productos
                </button>
              </div>
            ) : (
              <>
                {/* Pickup info */}
                <div className="px-6 pt-4 flex gap-4">
                  <button onClick={() => setShowHoraModal(true)} className="flex-1 bg-brand-bg rounded-xl px-4 py-3 text-left hover:ring-2 hover:ring-brand-green transition-all">
                    <p className="text-text-muted text-xs mb-0.5">Hora</p>
                    <p className="text-brand-black font-semibold text-sm">{hora}</p>
                  </button>
                  <button onClick={() => setShowTiendaModal(true)} className="flex-1 bg-brand-bg rounded-xl px-4 py-3 text-left hover:ring-2 hover:ring-brand-green transition-all">
                    <p className="text-text-muted text-xs mb-0.5">Tienda</p>
                    <p className="text-brand-black font-semibold text-sm">{tienda.nombre}</p>
                  </button>
                </div>

                {/* Cart items */}
                <div className="px-6 pt-4 flex flex-col">
                  {itemsCarrito.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      <div className="w-10 h-10 rounded-full bg-brand-lightGreen shrink-0 flex items-center justify-center">
                        {COMIDA_IDS.has(item.id) ? <IconComida size={20} /> : <IconCafe size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-brand-black text-sm font-bold truncate">{item.nombre}</p>
                        <p className="text-text-muted text-xs">{item.precio.toFixed(2)} €</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => quitar(item.id)} className="w-7 h-7 rounded-full border border-brand-green text-brand-green flex items-center justify-center text-sm leading-none">−</button>
                        <span className="text-sm font-semibold text-brand-black w-4 text-center">{item.qty}</span>
                        <button onClick={() => añadir(item.id)} className="w-7 h-7 rounded-full bg-brand-green text-white flex items-center justify-center text-sm leading-none">+</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total + Payment */}
                <div className="px-6 pt-3 pb-2 flex items-center justify-between border-t border-[#E8E7E3] mt-2">
                  <p className="text-brand-black font-bold text-base">Total</p>
                  <p className="text-brand-black font-bold text-base">{totalPrecio.toFixed(2)} €</p>
                </div>

                <div className="px-6 pb-2">
                  <p className="text-brand-black text-sm font-bold mb-2">Forma de Pago</p>
                  {tarjetas.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTarjetaActiva(t.id)}
                      className={`w-full rounded-xl px-4 py-3 flex items-center gap-3 mb-2 transition-colors ${tarjetaActiva === t.id ? 'bg-brand-bg ring-2 ring-brand-green' : 'bg-brand-bg'}`}
                    >
                      <div className="w-14 h-9 rounded-lg bg-gradient-to-r from-[#1D4D4F] to-[#3A7C6E] flex items-center justify-center shrink-0">
                        <svg width="18" height="14" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 18">
                          <rect x="1" y="1" width="22" height="16" rx="2" /><line x1="1" y1="7" x2="23" y2="7" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-brand-black text-sm font-semibold">{t.nombre}</p>
                        <p className="text-text-muted text-xs">•••• {t.ultimos4}</p>
                      </div>
                      {tarjetaActiva === t.id && (
                        <svg width="18" height="18" fill="none" stroke="#46704F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                <div className="px-6 pb-6">
                  <button onClick={handlePagar} className="w-full bg-brand-green text-white font-bold text-base py-4 rounded-2xl shadow-lg hover:bg-brand-dark transition-colors">
                    Pagar — {totalPrecio.toFixed(2)} €
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ Confirmation Modal ═══ */}
      {showConfirmation && ultimoPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl max-w-[450px] w-full mx-4 shadow-xl px-6 pt-10 pb-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-brand-green flex items-center justify-center mb-5">
              <svg width="40" height="40" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-brand-black text-xl font-bold text-center mb-2">¡Gracias por tu pedido!</h2>
            <p className="text-text-muted text-sm text-center mb-6">Muestra tu QR para la recogida</p>
            <div className="w-full bg-brand-bg rounded-xl px-5 py-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-brand-black font-bold text-sm">Puntos ganados</p>
                <span className="text-brand-green font-bold text-lg">+{ultimoPedido.puntos} pts</span>
              </div>
              {ultimoPedido.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-brand-black/70">{item.qty}x {item.nombre}</span>
                  <span className="text-text-muted">{(item.precio * item.qty).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <button onClick={handleCerrarConfirmacion} className="w-full bg-brand-green text-white font-bold text-base py-4 rounded-2xl shadow-lg hover:bg-brand-dark transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ═══ Hora Modal ═══ */}
      {showHoraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowHoraModal(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl max-w-[400px] w-full max-h-[70vh] flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3"><h2 className="text-brand-black text-lg font-bold">Hora de Recogida</h2></div>
            <div className="overflow-y-auto px-5 pb-5 grid grid-cols-3 gap-2">
              {getHorasDisponibles().map((h) => (
                <button key={h} onClick={() => { setHora(h); setShowHoraModal(false) }}
                  className={`px-3 py-3 rounded-xl text-sm font-medium text-center ${hora === h ? 'bg-brand-green text-white' : 'bg-brand-bg text-brand-black'}`}
                >{h}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tienda Modal ═══ */}
      {showTiendaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowTiendaModal(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl max-w-[400px] w-full max-h-[70vh] flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3"><h2 className="text-brand-black text-lg font-bold">Tienda de Recogida</h2></div>
            <div className="overflow-y-auto px-5 pb-5">
              {TIENDAS.map((grupo) => (
                <div key={grupo.ciudad} className="mb-3">
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wide mb-1 px-4">{grupo.ciudad}</p>
                  {grupo.tiendas.map((t) => (
                    <button key={t} onClick={() => { setTienda({ nombre: t, ciudad: grupo.ciudad }); setShowTiendaModal(false) }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium mb-1 ${tienda.nombre === t && tienda.ciudad === grupo.ciudad ? 'bg-brand-green text-white' : 'text-brand-black hover:bg-brand-bg'}`}
                    >{t}</button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
