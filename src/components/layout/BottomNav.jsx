import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/home',
    label: 'Inicio',
    icon: (
      <svg width="29" height="29" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
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
    to: '/points',
    label: 'Premios',
    icon: (
      <svg width="29" height="29" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 010-5C9 3 12 8 12 8" />
        <path d="M16.5 8a2.5 2.5 0 000-5C15 3 12 8 12 8" />
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
