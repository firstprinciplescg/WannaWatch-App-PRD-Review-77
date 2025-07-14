import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from '../components/Layout/Header'
import MovieList from '../components/Movies/MovieList'
import GroupsPage from './GroupsPage'
import SessionsPage from './SessionsPage'

function WannaWatchApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<MovieList />} />
          <Route path="/movies" element={<MovieList />} />
          <Route path="/groups/*" element={<GroupsPage />} />
          <Route path="/sessions/*" element={<SessionsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default WannaWatchApp