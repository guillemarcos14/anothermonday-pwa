import { useToastStore } from '../../store/toastStore'

const ICONS = {
  success: (
    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  achievement: (
    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
}

const BG_COLORS = {
  success: 'bg-brand-green',
  achievement: 'bg-[#D4A017]',
  info: 'bg-[#1D4D4F]',
  error: 'bg-[#E05252]',
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${BG_COLORS[toast.type] || BG_COLORS.success} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-[400px] w-full pointer-events-auto animate-[slideDown_0.3s_ease-out]`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="shrink-0">
            {ICONS[toast.type] || ICONS.success}
          </div>
          <p className="text-sm font-medium flex-1">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}
