import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useAuth } from './hooks/useAuth'
import BottomNav from './components/layout/BottomNav'

import Login from './pages/auth/Login'
import Home from './pages/home/Home'
import Points from './pages/points/Points'

import Orders from './pages/orders/Orders'
import QR from './pages/qr/QR'

function ProtectedRoute() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="md:desktop-shell">
      <Outlet />
      <BottomNav />
    </div>
  )
}

function PublicRoute() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/home" replace />

  return <Outlet />
}

export default function App() {
  useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — redirect to /home if logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes — redirect to /login if not logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/points" element={<Points />} />

          <Route path="/orders" element={<Orders />} />
          <Route path="/qr" element={<QR />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
