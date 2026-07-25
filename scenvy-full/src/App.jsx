import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider }                    from '@tanstack/react-query'
import { queryClient }                            from '@/lib/query-client'
import { AuthProvider, useAuth }                  from '@/lib/AuthContext'
import Landing     from './pages/Landing.jsx'
import ScenvyAuth  from './pages/ScenvyAuth.jsx'
import GuestView   from './pages/GuestView.jsx'
import Dashboard   from './pages/Dashboard.jsx'
import Admin       from './pages/Admin.jsx'

// ─── Route guards ────────────────────────────────────────
function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user)   return <Navigate to="/auth" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

function Spinner() {
  return (
    <div style={{ height:'100vh', background:'#0D0D14', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid #7C3AED', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── Router ──────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/"              element={<Landing />} />
      <Route path="/auth"          element={<PublicOnly><ScenvyAuth /></PublicOnly>} />
      <Route path="/l/:locationId" element={<GuestView />} />
      <Route path="/dashboard"     element={<Protected><Dashboard /></Protected>} />
      <Route path="/admin"         element={<Protected adminOnly><Admin /></Protected>} />
      <Route path="*"              element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
