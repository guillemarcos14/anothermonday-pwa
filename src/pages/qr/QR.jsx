import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAuthStore } from '../../store/authStore'
import { useUserStore } from '../../store/userStore'
import { usePoints } from '../../hooks/usePoints'
import PageWrapper from '../../components/layout/PageWrapper'

export default function QR() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const profile = useUserStore((s) => s.profile)
  const qrRef = useRef(null)

  const userId = user?.id || 'anonymous'
  const userName = profile?.name || 'Usuario'
  const { points, currentTier, nextTierName, pointsToNext, progress } = usePoints()

  // Código de miembro único: AM.{año registro}.{últimos 3 chars del ID}
  const memberCode = (() => {
    if (!user?.id) return 'AM.00.000'
    const year = user.created_at
      ? new Date(user.created_at).getFullYear().toString().slice(-2)
      : '00'
    const suffix = user.id.replace(/-/g, '').slice(-3).toUpperCase()
    return `AM.${year}.${suffix}`
  })()

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      const link = document.createElement('a')
      link.download = 'another-monday-qr.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="relative bg-white px-5 pt-6 pb-3 flex items-center justify-between" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <button onClick={() => navigate(-1)} aria-label="Volver" className="w-9 h-9 flex items-center justify-center">
          <svg width="22" height="22" fill="none" stroke="#2E2D38" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-[#2E2D38] text-lg font-bold absolute left-1/2 -translate-x-1/2">Mi QR</h1>
        <div className="w-9" />
      </div>

      <div className="px-5 mt-6 flex flex-col items-center">
        <p className="text-[#54647A] text-sm text-center leading-relaxed mb-6">
          Muestra este código en caja para recoger<br />tus pedidos
        </p>

        {/* QR Card */}
        <div className="w-full bg-white rounded-2xl px-6 pt-8 pb-6 flex flex-col items-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          {/* QR Code */}
          <div ref={qrRef}>
            <QRCodeSVG
              value={userId}
              size={180}
              bgColor="#FFFFFF"
              fgColor="#1D4D4F"
              level="M"
              title="Código QR de identificación personal"
            />
          </div>

          {/* User info */}
          <p className="text-[#2E2D38] font-bold text-lg mt-5">{userName}</p>
          <p className="text-[#54647A] text-xs mt-0.5">{memberCode}</p>
        </div>

        {/* Points Card — same as Mis Puntos screen */}
        <div className="w-full overflow-hidden p-5 text-white mt-5" style={{ height: '150px', boxShadow: '0 6px 16px rgba(0,0,0,0.25)', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.05) 100%), #46704F', backdropFilter: 'blur(8px)' }}>
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

        {/* Download */}
        <button
          onClick={handleDownload}
          className="mt-5 font-semibold text-sm"
          style={{ color: '#1D4D4F' }}
        >
          Descargar QR →
        </button>
      </div>
    </PageWrapper>
  )
}
