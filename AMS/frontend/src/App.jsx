import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'

// Auth pages
import Login        from './pages/auth/Login'
import Register     from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// App pages
import Dashboard    from './pages/dashboard/Dashboard'
import Assets       from './pages/assets/Assets'
import Sips         from './pages/sips/Sips'
import Transactions from './pages/transactions/Transactions'
import Projections  from './pages/projections/Projections'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center text-navy font-semibold">Loading...</div>
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Private — wrapped in sidebar layout */}
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index                  element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="assets"          element={<Assets />} />
          <Route path="sips"            element={<Sips />} />
          <Route path="transactions"    element={<Transactions />} />
          <Route path="projections"     element={<Projections />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
