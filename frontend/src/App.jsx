import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SessionSetupPage from './pages/SessionSetupPage'
import LiveDashboardPage from './pages/LiveDashboardPage'
import StudentJoinPage from './pages/StudentJoinPage'
import StudentViewPage from './pages/StudentViewPage'
import './styles/global.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/session/:sessionId/join" element={<StudentJoinPage />} />
            <Route path="/session/:sessionId/view" element={<StudentViewPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/session/:sessionId/setup" element={<ProtectedRoute><SessionSetupPage /></ProtectedRoute>} />
            <Route path="/session/:sessionId/live" element={<ProtectedRoute><LiveDashboardPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
