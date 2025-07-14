import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSessions } from '../../hooks/useSessions'
import { useAuth } from '../../hooks/useAuth'
import { tmdbApi } from '../../config/tmdb'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiThumbsUp, FiThumbsDown, FiAward, FiUsers, FiClock, FiCalendar, FiStar } = FiIcons

const ResultsView = ({ sessionId }) => {
  const { user } = useAuth()
  const { getMatchResults } = useSessions(user?.id)
  
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadResults()
  }, [sessionId])

  const loadResults = async () => {
    try {
      setLoading(true)
      const resultsData = await getMatchResults(sessionId)
      setResults(resultsData)
    } catch (err) {
      setError('Failed to load results')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadResults}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <div className="text-gray-400 text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No results yet
        </h3>
        <p className="text-gray-600">
          No votes have been cast in this session yet
        </p>
      </div>
    )
  }

  // Get the winner (highest match score)
  const winner = results[0]
  const hasWinner = winner.matchScore > 0

  return (
    <div className="space-y-6">
      {hasWinner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl p-4 overflow-hidden border border-yellow-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <SafeIcon icon={FiAward} className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">Top Match</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <div className="rounded-lg overflow-hidden shadow-md">
                <img
                  src={tmdbApi.getImageUrl(winner.movie.metadata.poster_path)}
                  alt={winner.movie.metadata.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-movie.jpg'
                  }}
                />
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {winner.movie.metadata.title}
              </h2>
              
              <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
                {winner.movie.metadata.release_date && (
                  <div className="flex items-center gap-1">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                    <span>{new Date(winner.movie.metadata.release_date).getFullYear()}</span>
                  </div>
                )}
                
                {winner.movie.metadata.runtime && (
                  <div className="flex items-center gap-1">
                    <SafeIcon icon={FiClock} className="w-4 h-4" />
                    <span>{winner.movie.metadata.runtime}m</span>
                  </div>
                )}
                
                {winner.movie.metadata.vote_average && (
                  <div className="flex items-center gap-1">
                    <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-500" />
                    <span>{winner.movie.metadata.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Match Score</span>
                  <span className="font-medium text-green-700">{Math.round(winner.matchScore)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.round(winner.matchScore)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <SafeIcon icon={FiThumbsUp} className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{winner.upvotes.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <SafeIcon icon={FiThumbsDown} className="w-4 h-4 text-red-600" />
                  <span className="font-medium">{winner.downvotes.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <SafeIcon icon={FiUsers} className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{winner.totalVotes} votes</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Results</h3>
        
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={result.movie.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                index === 0 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full">
                <span className="font-bold text-gray-700">#{index + 1}</span>
              </div>
              
              <div className="w-12 h-16 flex-shrink-0">
                <img
                  src={tmdbApi.getImageUrl(result.movie.metadata.poster_path, 'w200')}
                  alt={result.movie.metadata.title}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.target.src = '/placeholder-movie.jpg'
                  }}
                />
              </div>
              
              <div className="flex-grow">
                <p className="font-medium text-gray-900 line-clamp-1">
                  {result.movie.metadata.title}
                </p>
                {result.movie.metadata.release_date && (
                  <p className="text-xs text-gray-500">
                    {new Date(result.movie.metadata.release_date).getFullYear()}
                  </p>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-medium text-gray-900">{Math.round(result.matchScore)}%</div>
                <div className="flex items-center justify-end gap-2 text-sm">
                  <div className="flex items-center">
                    <SafeIcon icon={FiThumbsUp} className="w-3 h-3 text-green-600 mr-1" />
                    <span>{result.upvotes.length}</span>
                  </div>
                  <div className="flex items-center">
                    <SafeIcon icon={FiThumbsDown} className="w-3 h-3 text-red-600 mr-1" />
                    <span>{result.downvotes.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ResultsView