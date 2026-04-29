export default function PageWrapper({ children, className = '' }) {
  return (
    <div
      className={`min-h-[100dvh] bg-brand-bg pb-20 md:pb-8 ${className}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}
    >
      <div className="md:max-w-[1100px] md:mx-auto md:px-8">
        {children}
      </div>
    </div>
  )
}
