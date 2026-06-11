import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute() {
  const { isAuth } = useAuth()
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />
}