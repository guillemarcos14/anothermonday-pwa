export function BtnPrimary({ children, className = '', ...props }) {
  return (
    <button
      className={`py-3.5 bg-brand-green text-white font-semibold rounded-full text-sm transition-colors hover:bg-brand-dark disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function BtnOutline({ children, className = '', ...props }) {
  return (
    <button
      className={`py-3.5 border-2 border-brand-green text-brand-green font-semibold rounded-full text-sm transition-colors hover:bg-brand-green hover:text-white disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function BtnIcon({ children, className = '', ...props }) {
  return (
    <button
      className={`w-10 h-10 flex items-center justify-center rounded-full bg-brand-lightGreen text-brand-dark transition-colors hover:bg-brand-green hover:text-white ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
