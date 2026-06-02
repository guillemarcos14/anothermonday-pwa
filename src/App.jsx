import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useUserStore } from './store/userStore'
import { useAuth } from './hooks/useAuth'
import { useOrderSubscription } from './hooks/useOrderSubscription'
import BottomNav from './components/layout/BottomNav'
import ToastContainer from './components/ui/Toast'

// Eager-loaded routes
import Login from './pages/auth/Login'
import Home from './pages/home/Home'

// Lazy-loaded routes
const Points = lazy(() => import('./pages/points/Points'))
const Orders = lazy(() => import('./pages/orders/Orders'))
const QR = lazy(() => import('./pages/qr/QR'))

// Admin routes (lazy)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminScanner = lazy(() => import('./pages/admin/AdminScanner'))

function Spinner() {
  return (
    <div className="min-h-[100dvh] bg-brand-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute() {
  const { user, loading } = useAuthStore()
  const profile = useUserStore((s) => s.profile)

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Spinner />
  if (profile.is_admin) return <Navigate to="/admin/orders" replace />

  return (
    <div className="md:desktop-shell">
      <Outlet />
      <BottomNav />
    </div>
  )
}

function AdminRoute() {
  const { user, loading } = useAuthStore()
  const profile = useUserStore((s) => s.profile)

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Spinner />
  if (!profile.is_admin) return <Navigate to="/home" replace />

  return <Outlet />
}

function PublicRoute() {
  const { user, loading } = useAuthStore()
  const profile = useUserStore((s) => s.profile)

  if (loading) return <Spinner />
  if (user) return <Navigate to={profile?.is_admin ? '/admin' : '/home'} replace />

  return <Outlet />
}

export default function App() {
  useAuth()
  useOrderSubscription()

  return (
    <BrowserRouter>
      <ToastContainer />
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/points" element={<Points />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/qr" element={<QR />} />
            <Route path="/rewards" element={<Navigate to="/points" replace />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/scanner" element={<AdminScanner />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
