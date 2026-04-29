import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/userStore'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { usePoints } from '../../hooks/usePoints'
import PageWrapper from '../../components/layout/PageWrapper'
import DesktopApp from '../desktop/DesktopApp'
const IconCupSoda = ({ size = 60, color = 'white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"/>
    <path d="M5 8h14"/>
    <path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/>
    <path d="m12 8 1-6h2"/>
  </svg>
)

const IconScanLine = ({ size = 60, color = 'white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
    <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
    <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <path d="M7 12h10"/>
  </svg>
)

const IconArrowRight = ({ size = 20, color = 'white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
)

const IconEllipsisVertical = ({ size = 20, color = '#1D4D4F' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="5" r="1"/>
    <circle cx="12" cy="19" r="1"/>
  </svg>
)

const IconPlus = ({ size = 20, color = 'white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
  </svg>
)

export default function Home() {
  const navigate = useNavigate()
  const { points } = usePoints()

  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = () => {
    useAuthStore.getState().logout()
    useUserStore.getState().clearProfile()
    supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
    {/* ─── Desktop Layout ─── */}
    <div className="hidden md:block">
      <DesktopApp />
    </div>

    {/* ─── Mobile Layout ─── */}
    <PageWrapper className="!pb-0 md:!hidden">
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-3 flex items-center justify-between" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: '18px', letterSpacing: '-1px', color: '#2E2D38' }}>Another Monday</span>
        <div className="flex items-center gap-0.5">
          {/* Notification bell */}
          <button className="w-9 h-9 flex items-center justify-center">
            <svg width="22" height="22" fill="none" stroke="#2E2D38" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
          {/* Menu dots */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center"
            >
              <IconEllipsisVertical color="#2E2D38" />
            </button>

            {menuOpen && (
              <>
                {/* Overlay to close menu */}
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-md border border-brand-gray z-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 py-3 px-4 text-sm text-[#E05252] hover:bg-red-50 rounded-xl"
                  >
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

      {/* ─── Mobile Layout ─── */}
      <div className="px-5 mt-6 flex flex-col gap-6">
        {/* Points Card */}
        <button
          onClick={() => navigate('/points')}
          className="relative bg-[#679974] py-5 pl-5 pr-7 text-left w-full"
          style={{ height: '150px', boxShadow: '0 6px 16px rgba(0,0,0,0.25)', borderRadius: '20px' }}
        >
          <div className="flex flex-col justify-end h-full">
            <p className="text-white" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px', letterSpacing: '0px' }}>Mis Puntos</p>
            <div className="flex items-center justify-between">
              <p className="text-white" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '30px', letterSpacing: '0px' }}>{points} pts</p>
              <IconArrowRight />
            </div>
          </div>
        </button>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/orders')}
            className="bg-[#679974] p-4 flex flex-col items-center justify-center gap-1.5"
            style={{ height: '150px', boxShadow: '0 6px 16px rgba(0,0,0,0.25)', borderRadius: '20px' }}
          >
            <IconCupSoda size={48} />
            <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px', letterSpacing: '0px' }}>Pick & Go</span>
          </button>

          <button
            onClick={() => navigate('/qr')}
            className="bg-[#679974] p-4 flex flex-col items-center justify-center gap-1.5"
            style={{ height: '150px', boxShadow: '0 6px 16px rgba(0,0,0,0.25)', borderRadius: '20px' }}
          >
            <IconScanLine size={48} />
            <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px', letterSpacing: '0px' }}>Mi QR</span>
          </button>
        </div>

        {/* News Section */}
        <div className="-mx-5 bg-white rounded-t-[2rem] shadow-sm mt-2">
          {/* Gray pill handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-[70px] h-1 rounded-full bg-[#DFE4EC]" />
          </div>
          <h2 className="px-6 pt-3 pb-5 text-[#2E2D38]"><span style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: '18px', letterSpacing: '-1px' }}>Another Monday</span>{' '}<span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '16px' }}>News</span></h2>
          <div className="px-5 relative">
            <img
              src="/news.jpg"
              alt="Día Mundial del Café"
              className="w-full h-44 object-cover object-top rounded-t-2xl"
            />
            {/* + button overlapping image and text area */}
            <button onClick={() => navigate('/qr')} className="absolute -bottom-7 right-8 w-14 h-14 bg-[#679974] rounded-full flex items-center justify-center shadow-lg z-10">
              <IconPlus size={26} />
            </button>
          </div>
          <div className="px-6 pb-6 pt-5">
            <h3 className="text-[#2E2D38]" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px' }}>Día Mundia del Café</h3>
            <p className="text-xs text-[#2E2D38]/60 mt-1 line-clamp-2">
              Queremos celebrar el DMC con un 10% de descuento en todas las bebidas. Muestra tu QR en el mostrador.
            </p>
          </div>
          {/* Spacer for nav clearance */}
          <div className="h-20" />
        </div>
      </div>

    </PageWrapper>
    </>
  )
}
