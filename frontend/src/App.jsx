import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import POSPage from './pages/POSPage'
import ProductsPage from './pages/ProductsPage'
import ReportsPage from './pages/ReportsPage'
import InventoryPage from './pages/InventoryPage'
import UsersPage from './pages/UsersPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/caixa" element={<POSPage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/estoque" element={<InventoryPage />} />
          <Route path="/usuarios" element={<UsersPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}