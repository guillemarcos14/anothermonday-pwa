import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUserStore } from '../../store/userStore'
import { supabase } from '../../lib/supabase'

const navItems = [
  { to: '/admin/orders', label: 'Pedidos', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  )},
  { to: '/admin/scanner', label: 'Escáner', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 7V5a2 2 0 012-2h2" />
      <path d="M17 3h2a2 2 0 012 2v2" />
      <path d="M21 17v2a2 2 0 01-2 2h-2" />
      <path d="M7 21H5a2 2 0 01-2-2v-2" />
      <path d="M7 12h10" />
    </svg>
  )},
]

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleSignOut = () => {
    useAuthStore.getState().logout()
    useUserStore.getState().clearProfile()
    supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-[100dvh] bg-[#F6F5F1] md:flex">
      {/* Sidebar (desktop) / Top bar (mobile) */}
      <nav className="bg-white border-b md:border-b-0 md:border-r border-[#E8E7E3] md:w-[220px] md:min-h-screen md:flex md:flex-col md:p-4 shrink-0">
        <div className="px-4 py-3 md:px-0 md:mb-6">
          <span className="text-brand-green text-lg font-bold" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Admin Panel
          </span>
        </div>
        <div className="flex md:flex-col gap-1 px-4 pb-2 md:px-0 md:pb-0 md:flex-1 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive ? 'bg-brand-lightGreen text-brand-green' : 'text-[#1D4D4F] hover:bg-[#F0F2F5]'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="hidden md:block mt-auto pt-4 border-t border-[#E8E7E3]">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#1D4D4F] hover:bg-[#F0F2F5] w-full"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Volver a la app
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#E05252] hover:bg-red-50 w-full mt-1"
          >
            <svg width="16" height="16" fill="none" stroke="#E05252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
