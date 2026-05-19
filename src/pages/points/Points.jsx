import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePoints } from '../../hooks/usePoints'
import PageWrapper from '../../components/layout/PageWrapper'

/* ── SVG icon components ── */

const IconCheck = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconStar = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} fill={color} viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const IconDiamond = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} fill={color} viewBox="0 0 24 24">
    <path d="M12 2L2 12l10 10 10-10L12 2z" />
  </svg>
)

const IconCrown = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} fill={color} viewBox="0 0 24 24">
    <path d="M2 20h20V9l-4 4-6-8-6 8-4-4v11z" />
  </svg>
)

const IconLock = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
)

/* Badge icons (unlocked) */
const IconGift = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 010-5C9 3 12 8 12 8" />
    <path d="M16.5 8a2.5 2.5 0 000-5C15 3 12 8 12 8" />
  </svg>
)

const IconShield = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const IconUsers = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
)

/* Extra badge icons */
const IconCoffee = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 8h1a4 4 0 010 8h-1" />
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
)

const IconHeart = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
)

const IconTrophy = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
    <path d="M18 2H6v7a6 6 0 0012 0V2z" />
  </svg>
)

const IconFlame = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 3-7 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.15.5-2.5 1.5-3.5l1 1z" />
  </svg>
)

const IconCalendar = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconMapPin = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const IconSunrise = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17 18a5 5 0 00-10 0" />
    <line x1="12" y1="9" x2="12" y2="2" />
    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
    <line x1="1" y1="18" x2="3" y2="18" />
    <line x1="21" y1="18" x2="23" y2="18" />
    <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
    <line x1="23" y1="22" x2="1" y2="22" />
    <polyline points="16 5 12 9 8 5" />
  </svg>
)

const IconZap = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const IconAward = ({ size = 28, color = '#1D4D4F' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
)

/* ── Close icon ── */
const IconClose = ({ size = 24, color = '#2E2D38' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/* ── Full achievements list ── */
const ALL_BADGES = [
  { id: 1, name: 'Primera vez', description: 'Realiza tu primer pedido', icon: IconGift, check: (ctx) => ctx.totalOrders >= 1 },
  { id: 2, name: '5 pedidos', description: 'Completa 5 pedidos', icon: IconShield, check: (ctx) => ctx.totalOrders >= 5 },
  { id: 3, name: '10 pedidos', description: 'Completa 10 pedidos', icon: IconCoffee, check: (ctx) => ctx.totalOrders >= 10 },
  { id: 4, name: '25 pedidos', description: 'Completa 25 pedidos', icon: IconTrophy, check: (ctx) => ctx.totalOrders >= 25 },
  { id: 5, name: 'Matcha Lover', description: 'Pide 5 matchas', icon: IconHeart, check: (ctx) => ctx.matchaCount >= 5 },
  { id: 6, name: 'Madrugador', description: 'Pide antes de las 9:00', icon: IconSunrise, check: (ctx) => ctx.hasEarlyOrder },
  { id: 7, name: 'Racha 7 días', description: 'Pide 7 días seguidos', icon: IconFlame, check: (ctx) => ctx.maxStreak >= 7 },
  { id: 8, name: 'Explorador', description: 'Pide en 3 tiendas distintas', icon: IconMapPin, check: (ctx) => ctx.uniqueStores >= 3 },
  { id: 9, name: 'Tier Plata', description: 'Alcanza el nivel Plata', icon: IconStar, check: (ctx) => ctx.tierIndex >= 1 },
  { id: 10, name: 'Tier Oro', description: 'Alcanza el nivel Oro', icon: IconDiamond, check: (ctx) => ctx.tierIndex >= 2 },
  { id: 11, name: 'Tier Platino', description: 'Alcanza el nivel Platino', icon: IconCrown, check: (ctx) => ctx.tierIndex >= 3 },
]

/* ── Helper: compute achievement context from localStorage orders ── */
function getAchievementContext(tiers, currentTier) {
  let orders = []
  try {
    const raw = localStorage.getItem('pedidosCompletados')
    if (raw) orders = JSON.parse(raw)
  } catch { /* empty */ }

  const totalOrders = orders.length

  // Count matcha items
  const matchaCount = orders.reduce((sum, o) => {
    return sum + (o.items || []).reduce((s, item) => {
      const name = (item.nombre || item.name || '').toLowerCase()
      return s + (name.includes('matcha') ? (item.qty || item.cantidad || 1) : 0)
    }, 0)
  }, 0)

  // Tier index
  const tierIndex = tiers.findIndex(t => t.name === currentTier.name)

  // Early order (before 9:00)
  const hasEarlyOrder = orders.some(o => {
    if (!o.hora) return false
    const h = parseInt(o.hora.split(':')[0], 10)
    return h < 9
  })

  // Unique stores
  const uniqueStores = new Set(orders.map(o => o.tienda?.nombre).filter(Boolean)).size

  // Max consecutive-day streak (using YYYY-MM-DD for reliable sorting & comparison)
  let maxStreak = 0
  if (orders.length > 0) {
    const toDateKey = (fecha) => {
      const d = new Date(fecha)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    const dayKeys = [...new Set(orders.map(o => toDateKey(o.fecha)))].sort()
    let streak = 1
    for (let i = 1; i < dayKeys.length; i++) {
      const prev = new Date(dayKeys[i - 1] + 'T00:00:00')
      const curr = new Date(dayKeys[i] + 'T00:00:00')
      const diffDays = Math.round((curr - prev) / 86400000)
      if (diffDays === 1) { streak++; maxStreak = Math.max(maxStreak, streak) }
      else streak = 1
    }
    maxStreak = Math.max(maxStreak, streak)
  }

  return { totalOrders, matchaCount, tierIndex, hasEarlyOrder, uniqueStores, maxStreak }
}

/* ── Points rules ── */
const POINTS_RULES = [
  { icon: IconCoffee, title: 'Haz pedidos', desc: 'Gana 1 punto por cada euro gastado en tus pedidos Pick & Go.' },
  { icon: IconStar, title: 'Sube de nivel', desc: 'Acumula puntos para subir de Bronce → Plata → Oro → Platino y desbloquear ventajas exclusivas.' },
  { icon: IconAward, title: 'Desbloquea logros', desc: 'Completa retos como hacer 10 pedidos, probar matcha o pedir en varias tiendas.' },
{ icon: IconCalendar, title: 'Racha diaria', desc: 'Pide varios días seguidos para desbloquear el logro de racha y ganar bonus.' },
  { icon: IconZap, title: 'Promociones especiales', desc: 'Estate atento a eventos y días con puntos x2 para acumular más rápido.' },
]

/* ── Tier selector icons ── */

const TIER_ICONS = {
  Bronce: { Active: () => <IconCheck size={22} color="white" />, Inactive: () => <IconCheck size={22} color="#1D4D4F" /> },
  Plata: { Active: () => <IconStar size={22} color="white" />, Inactive: () => <IconStar size={22} color="#1D4D4F" /> },
  Oro: { Active: () => <IconDiamond size={21} color="white" />, Inactive: () => <IconDiamond size={21} color="#1D4D4F" /> },
  Platino: { Active: () => <IconCrown size={21} color="white" />, Inactive: () => <IconCrown size={21} color="#1D4D4F" /> },
}

export default function Points() {
  const navigate = useNavigate()
  const { points, currentTier, nextTierName, pointsToNext, progress, tiers: TIERS } = usePoints()
  const [showAllBadges, setShowAllBadges] = useState(false)
  const [showRules, setShowRules] = useState(false)

  const ctx = useMemo(() => getAchievementContext(TIERS, currentTier), [TIERS, currentTier])
  const badges = useMemo(() => ALL_BADGES.map(b => ({ ...b, unlocked: b.check(ctx) })), [ctx])
  const unlockedCount = badges.filter(b => b.unlocked).length
  const previewBadges = badges.slice(0, 6)

  return (
    <PageWrapper>
      {/* Header */}
      <div className="relative bg-white px-5 pt-6 pb-3 flex items-center justify-between" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <button onClick={() => navigate(-1)} aria-label="Volver" className="w-9 h-9 flex items-center justify-center">
          <svg width="22" height="22" fill="none" stroke="#2E2D38" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-[#2E2D38] absolute left-1/2 -translate-x-1/2" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '16px' }}>Mis Puntos</h1>
        <div className="w-9" />
      </div>

      <div className="px-5 mt-6">
        {/* Tier section: card + selector side by side on desktop */}
        <div className="md:grid md:grid-cols-2 md:gap-8 md:items-center">
        {/* Tier Card */}
        <div className="overflow-hidden p-5 text-white" style={{ height: '150px', boxShadow: '0 6px 16px rgba(0,0,0,0.25)', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.05) 100%), #46704F', backdropFilter: 'blur(8px)' }}>
          <p style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: '28px' }}>Nivel {currentTier.name}</p>
          <p className="text-white text-sm font-semibold mt-0.5">
            {points} / {currentTier.maxPoints} pts
          </p>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/70 text-xs mt-2">
            {nextTierName
              ? `Te faltan ${pointsToNext} pts para ${nextTierName}`
              : 'Has alcanzado el nivel máximo'}
          </p>
        </div>

        {/* Tier Selector */}
        <div className="flex justify-between px-2 mt-6 md:mt-0 md:flex-col md:gap-4">
          {TIERS.map((tier) => {
            const isActive = tier.name === currentTier.name
            const isPast = TIERS.indexOf(tier) < TIERS.indexOf(currentTier)
            const icons = TIER_ICONS[tier.name]
            return (
              <div key={tier.name} className="flex flex-col items-center gap-1.5">
                <div
                  className={`rounded-full flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-brand-green'
                      : isPast
                        ? 'bg-white border-2 border-brand-green'
                        : 'bg-[#DFE4EC]'
                  }`}
                  style={{ width: 70, height: 70 }}
                >
                  {isActive ? icons.Active() : icons.Inactive()}
                </div>
                <span className={`text-[11px] font-medium ${isActive ? 'text-brand-green' : 'text-[#1D4D4F]'}`}>{tier.name}</span>
              </div>
            )
          })}
        </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-[#DFE4EC] mt-8" />

        {/* Logros */}
        <div className="mt-6">
          <h2 className="text-brand-black font-bold text-base">Logros</h2>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[#6F8094] text-xs">
              {unlockedCount} de {ALL_BADGES.length} desbloqueados
            </p>
            <button onClick={() => setShowAllBadges(true)} className="text-brand-black text-xs font-semibold flex items-center gap-1">
              Ver todos
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {previewBadges.map((badge) => {
              const BadgeIcon = badge.icon
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl aspect-square ${
                    badge.unlocked ? 'bg-white' : 'bg-[#DFE4EC]'
                  }`}
                >
                  <div className="w-11 h-11 flex items-center justify-center">
                    {badge.unlocked ? (
                      <BadgeIcon size={30} color="#46704F" />
                    ) : (
                      <IconLock size={30} color="#1D4D4F" />
                    )}
                  </div>
                  <span className={`text-[11px] font-medium text-center leading-tight ${
                    badge.unlocked ? 'text-brand-green' : 'text-[#1D4D4F]'
                  }`}>
                    {badge.name}
                  </span>
                </div>
              )
            })}
          </div>

          <button onClick={() => setShowRules(true)} className="w-full mt-5 pb-2 text-[#1D4D4F] font-semibold text-sm flex items-center justify-center gap-1">
            Consigue más puntos <span>→</span>
          </button>
        </div>
      </div>

      {/* ── Modal: Ver todos los logros ── */}
      {showAllBadges && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#F6F5F1] md:bg-black/40 md:items-center md:justify-center">
          <div className="flex flex-col flex-1 overflow-hidden md:flex-initial md:max-w-[500px] md:w-full md:max-h-[80vh] md:rounded-2xl md:shadow-xl md:bg-[#F6F5F1]">
          <div className="relative bg-white px-5 pt-6 pb-3 flex items-center justify-between shrink-0" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
            <button onClick={() => setShowAllBadges(false)} aria-label="Cerrar" className="w-9 h-9 flex items-center justify-center">
              <IconClose size={22} />
            </button>
            <h2 className="text-[#2E2D38] absolute left-1/2 -translate-x-1/2" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '16px' }}>Todos los logros</h2>
            <div className="w-9" />
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-28 md:pb-6">
            <p className="text-[#6F8094] text-sm mb-5">{unlockedCount} de {ALL_BADGES.length} desbloqueados</p>
            <div className="flex flex-col gap-3">
              {badges.map((badge) => {
                const BadgeIcon = badge.icon
                return (
                  <div key={badge.id} className={`flex items-center gap-4 p-4 rounded-2xl ${badge.unlocked ? 'bg-white' : 'bg-[#F0F1F4]'}`} style={{ boxShadow: badge.unlocked ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full shrink-0 ${badge.unlocked ? 'bg-[#EAF2EB]' : 'bg-[#DFE4EC]'}`}>
                      {badge.unlocked ? (
                        <BadgeIcon size={26} color="#46704F" />
                      ) : (
                        <IconLock size={24} color="#9CA3AF" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${badge.unlocked ? 'text-brand-green' : 'text-[#6F8094]'}`}>{badge.name}</p>
                      <p className="text-xs text-[#6F8094] mt-0.5">{badge.description}</p>
                    </div>
                    {badge.unlocked && (
                      <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center shrink-0">
                        <IconCheck size={14} color="white" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ── Modal: Consigue más puntos (reglas) ── */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#F6F5F1] md:bg-black/40 md:items-center md:justify-center">
          <div className="flex flex-col flex-1 overflow-hidden md:flex-initial md:max-w-[500px] md:w-full md:max-h-[80vh] md:rounded-2xl md:shadow-xl md:bg-[#F6F5F1]">
          <div className="relative bg-white px-5 pt-6 pb-3 flex items-center justify-between shrink-0" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
            <button onClick={() => setShowRules(false)} aria-label="Cerrar" className="w-9 h-9 flex items-center justify-center">
              <IconClose size={22} />
            </button>
            <h2 className="text-[#2E2D38] absolute left-1/2 -translate-x-1/2" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '16px' }}>Cómo ganar puntos</h2>
            <div className="w-9" />
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-28 md:pb-6">
            {/* Points summary */}
            <div className="bg-brand-green rounded-2xl p-5 text-white mb-6">
              <p className="text-sm font-medium opacity-80">Tus puntos actuales</p>
              <p className="text-3xl font-bold mt-1">{points} pts</p>
              <p className="text-xs opacity-70 mt-1">Nivel {currentTier.name}</p>
            </div>

            {/* Tier table */}
            <h3 className="text-brand-black font-bold text-sm mb-3">Niveles y puntos</h3>
            <div className="bg-[#F6F5F1] rounded-2xl overflow-hidden mb-6">
              {TIERS.map((tier, i) => {
                const isCurrent = tier.name === currentTier.name
                const TierIcon = [IconCheck, IconStar, IconDiamond, IconCrown][i]
                return (
                  <div key={tier.name} className={`flex items-center gap-3 px-4 py-3 ${i < TIERS.length - 1 ? 'border-b border-[#E8E7E3]' : ''} ${isCurrent ? 'bg-[#EAF2EB]' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrent ? 'bg-brand-green' : 'bg-[#DFE4EC]'}`}>
                      <TierIcon size={16} color={isCurrent ? 'white' : '#1D4D4F'} />
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm font-semibold ${isCurrent ? 'text-brand-green' : 'text-brand-black'}`}>{tier.name}</span>
                    </div>
                    <span className="text-xs text-[#6F8094]">{tier.minPoints} – {tier.maxPoints} pts</span>
                  </div>
                )
              })}
            </div>

            {/* Rules */}
            <h3 className="text-brand-black font-bold text-sm mb-3">Formas de ganar puntos</h3>
            <div className="flex flex-col gap-3">
              {POINTS_RULES.map((rule, i) => {
                const RuleIcon = rule.icon
                return (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div className="w-10 h-10 rounded-full bg-[#EAF2EB] flex items-center justify-center shrink-0">
                      <RuleIcon size={22} color="#46704F" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-black">{rule.title}</p>
                      <p className="text-xs text-[#6F8094] mt-0.5 leading-relaxed">{rule.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
