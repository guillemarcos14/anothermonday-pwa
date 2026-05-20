export default function PageWrapper({ children, className = '' }) {
  return (
    <main
      className={`min-h-[100dvh] pb-20 md:pb-8 ${className}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}
    >
      <div className="md:max-w-[1100px] md:mx-auto md:px-8">
        {children}
      </div>
    </main>
  )
}
