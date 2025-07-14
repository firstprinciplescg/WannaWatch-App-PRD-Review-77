import React from 'react'
import { Routes, Route } from 'react-router-dom'
import SessionDetail from '../components/Sessions/SessionDetail'

function SessionsPage() {
  return (
    <Routes>
      <Route path="/:sessionId" element={<SessionDetail />} />
    </Routes>
  )
}

export default SessionsPage