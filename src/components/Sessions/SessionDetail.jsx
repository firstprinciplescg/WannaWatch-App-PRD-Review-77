import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSessions } from '../../hooks/useSessions'
import { useAuth } from '../../hooks/useAuth'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import MovieVoting from './MovieVoting'
import ResultsView from './ResultsView'

const { FiArrowLeft, FiUsers, FiPlay, FiClock, FiX } = FiIcons

const SessionDetail = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getSessionDetails, closeSession } = useSessions(user?.id)
  
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('voting') // voting, results

  useEffect(() => {
    fetchSessionData()
  }, [sessionId])

  const fetchSessionData = async () => {
    try {
      setLoading(true)
      const sessionData = await getSessionDetails(sessionId)
      
      if (!sessionData) {
        setError('Session not found')
        return
      }
      
      setSession(sessionData)
      
      // Check if user has voted on all movies already
      const userVotes = sessionData.votes.filter(vote => vote.user_id === user.id)
      
      // If session is closed or user has voted on movies, show results
      if (sessionData.status === 'closed' || userVotes.length > 0) {
        setView('results')
      } else {
        setView('voting')
      }
    } catch (err) {
      setError('Failed to load session data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSession = async () => {
    if (window.confirm('Are you sure you want to end this session? This will finalize the results.')) {
      try {
        const result = await closeSession(sessionId)
        
        if (result.success) {
          fetchSessionData()
        } else {
          setError(result.error || 'Failed to close session')
        }
      } catch (err) {
        setError('Failed to close session')
        console.error(err)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl max-w-md w-full text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/app/groups')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Groups
          </button>
        </div>
      </div>
    )
  }

  if (!session) return null

  const isCreator = session.created_by === user.id
  const isActive = session.status === 'active'
  const groupName = session.group?.name || 'Unknown Group'

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/app/groups/${session.group_id}`)}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.name || 'Watch Session'}
              </h1>
              <p className="text-gray-600 text-sm">{groupName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isCreator && isActive && (
              <button
                onClick={handleCloseSession}
                className="flex items-center gap-1 px-3 py-2 text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <SafeIcon icon={FiX} className="w-4 h-4" />
                <span>End Session</span>
              </button>
            )}
            
            {!isActive && (
              <div className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                Session Closed
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiUsers} className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {session.votes?.length > 0 
                  ? `${new Set(session.votes.map(v => v.user_id)).size} participants`
                  : 'No participants yet'
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiClock} className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                Created {new Date(session.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setView('voting')}
              className={`px-4 py-2 font-medium text-sm ${
                view === 'voting'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Vote on Movies
            </button>
            <button
              onClick={() => setView('results')}
              className={`px-4 py-2 font-medium text-sm ${
                view === 'results'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              View Results
            </button>
          </div>
        </div>

        <div>
          {view === 'voting' && (
            <MovieVoting 
              sessionId={sessionId} 
              groupId={session.group_id} 
              onComplete={() => setView('results')}
            />
          )}
          
          {view === 'results' && (
            <ResultsView sessionId={sessionId} />
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionDetail