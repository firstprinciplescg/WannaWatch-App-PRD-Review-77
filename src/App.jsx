import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AuthForm from './components/Auth/AuthForm'
import Header from './components/Layout/Header'
import MovieList from './components/Movies/MovieList'
import './App.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<MovieList />} />
            <Route path="/movies" element={<MovieList />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App