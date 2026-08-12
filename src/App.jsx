import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import WeddingDetail from './pages/WeddingDetail'
import PrintReport from './pages/PrintReport'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const { currentUser } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wedding/:id"
        element={
          <ProtectedRoute>
            <WeddingDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wedding/:id/print"
        element={
          <ProtectedRoute>
            <PrintReport />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
