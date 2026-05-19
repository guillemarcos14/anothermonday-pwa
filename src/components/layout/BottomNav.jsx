import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/home',
    label: 'Perfil',
    icon: (
      <svg width="29" height="29" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    to: '/points',
    label: 'Puntos',
    icon: (
      <svg width="29" height="29" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    to: '/orders',
    label: 'Pick & Go',
    icon: (
      <svg width="29" height="29" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8" />
        <path d="M5 8h14" />
        <path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0" />
        <path d="m12 8 1-6h2" />
      </svg>
    ),
  },
  {
    to: '/qr',
    label: 'QR',
    icon: (
      <svg width="29" height="29" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <path d="M7 12h10" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E7E3] flex justify-around items-center h-16 z-50 safe-area-pb md:hidden">
      {/* Logo – only visible on desktop sidebar */}
      <div className="hidden md:block mb-8 px-3">
        <span className="text-brand-green text-xl" style={{ fontFamily: "'Instrument Serif', serif" }}>Another Monday</span>
      </div>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          aria-label={tab.label}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors md:flex-row md:gap-3 md:w-full md:px-3 md:py-2.5 md:rounded-xl md:text-sm ${
              isActive ? 'text-[#46704F] md:bg-brand-lightGreen' : 'text-[#1D4D4F] md:hover:bg-brand-bg'
            }`
          }
        >
          {tab.icon}
          <span className="hidden md:inline">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
