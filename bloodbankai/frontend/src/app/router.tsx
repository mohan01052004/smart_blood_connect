import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import AuthPage from '../pages/auth/AuthPage'
import Dashboard from '../pages/dashboard/Dashboard'
import DonorManagement from '../pages/DonorManagement'
import Inventory from '../pages/inventory/Inventory'
import { useBloodBankStore } from '../store/bloodbank.store'

// Protected route component
function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const token = useBloodBankStore((state) => state.token)
  
  if (!token) {
    return <Navigate to="/" replace />
  }
  
  return element
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthPage />,
  },
  {
    path: '/app',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <ProtectedRoute element={<Dashboard />} /> },
      { path: 'donors', element: <ProtectedRoute element={<DonorManagement />} /> },
      { path: 'inventory', element: <ProtectedRoute element={<Inventory />} /> },
    ],
  },
])
