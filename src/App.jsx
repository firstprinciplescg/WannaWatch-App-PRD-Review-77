import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useAdmin } from './hooks/useAdmin'
import LandingPage from './pages/LandingPage'
import WannaWatchApp from './pages/WannaWatchApp'
import AdminDashboard from './pages/AdminDashboard'
import AuthForm from './components/Auth/AuthForm'
import './App.css'

function App() {
  const { user, loading } = useAuth()
  const { isAdmin } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/app/*" 
          element={user ? <WannaWatchApp /> : <AuthForm />} 
        />
        <Route
          path="/admin/*"
          element={user && isAdmin ? <AdminDashboard /> : <AuthForm />}
        />
      </Routes>
    </Router>
  )
}

export default App