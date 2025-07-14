import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessions } from '../../hooks/useSessions'
import { useAuth } from '../../hooks/useAuth'
import { tmdbApi } from '../../config/tmdb'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiThumbsUp, FiThumbsDown, FiSkipForward, FiInfo, FiX, FiStar } = FiIcons

const MovieVoting = ({ sessionId, groupId, onComplete }) => {
  const { user } = useAuth()
  const { getSessionMovies, voteOnMovie } = useSessions(user?.id)
  
  const [movies, setMovies] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [voteAnimation, setVoteAnimation] = useState(null)

  useEffect(() => {
    loadMovies()
  }, [sessionId, groupId])

  const loadMovies = async () => {
    try {
      setLoading(true)
      const movieData = await getSessionMovies(sessionId, groupId)
      
      // Filter out movies the user has already voted on
      const unvotedMovies = movieData.filter(movie => movie.userVote === undefined)
      
      setMovies(unvotedMovies)
      setCurrentIndex(0)
    } catch (err) {
      setError('Failed to load movies')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (vote) => {
    try {
      if (currentIndex >= movies.length) return
      
      const currentMovie = movies[currentIndex]
      
      // Trigger animation
      setVoteAnimation(vote ? 'like' : 'dislike')
      
      // Wait for animation to complete
      setTimeout(async () => {
        await voteOnMovie(sessionId, currentMovie.id, vote)
        
        // Move to next movie
        if (currentIndex < movies.length - 1) {
          setCurrentIndex(currentIndex + 1)
        } else {
          if (onComplete) onComplete()
        }
        
        setVoteAnimation(null)
      }, 500)
      
    } catch (err) {
      setError('Failed to record vote')
      console.error(err)
    }
  }

  const handleSkip = () => {
    if (currentIndex < movies.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      if (onComplete) onComplete()
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
          onClick={loadMovies}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <div className="text-gray-400 text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No movies left to vote on
        </h3>
        <p className="text-gray-600 mb-6">
          You've voted on all the movies in this session
        </p>
        {onComplete && (
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            View Results
          </button>
        )}
      </div>
    )
  }

  const currentMovie = movies[currentIndex]
  const { metadata } = currentMovie
  const posterUrl = tmdbApi.getImageUrl(metadata.poster_path, 'w500')
  const backdropUrl = metadata.backdrop_path 
    ? tmdbApi.getImageUrl(metadata.backdrop_path, 'w1280') 
    : null

  // Animation variants
  const cardVariants = {
    like: { x: '120%', opacity: 0, transition: { duration: 0.5 } },
    dislike: { x: '-120%', opacity: 0, transition: { duration: 0.5 } },
    center: { x: 0, opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 text-center">
        <p className="text-gray-600">
          Movie {currentIndex + 1} of {movies.length}
        </p>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          variants={cardVariants}
          initial="center"
          animate={voteAnimation || "center"}
          exit="exit"
          className="relative bg-white rounded-xl shadow-xl overflow-hidden"
        >
          <div className="relative h-96">
            <img
              src={posterUrl}
              alt={metadata.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-movie.jpg'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-2xl font-bold text-white">{metadata.title}</h2>
              <div className="flex items-center gap-3 text-white mt-1">
                {metadata.release_date && (
                  <span>{new Date(metadata.release_date).getFullYear()}</span>
                )}
                {metadata.runtime && (
                  <span>{metadata.runtime} min</span>
                )}
                {metadata.vote_average && (
                  <div className="flex items-center">
                    <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{metadata.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="p-4">
              {metadata.overview && (
                <p className="text-gray-700 mb-4">{metadata.overview}</p>
              )}
              
              {metadata.genres && metadata.genres.length > 0 && (
                <div className="mb-4">
                  <p className="font-medium text-gray-900 mb-2">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {metadata.genres.map(genre => (
                      <span 
                        key={genre.id} 
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setShowDetails(false)}
                className="w-full py-2 text-gray-600 hover:text-gray-800"
              >
                Show Less
              </button>
            </div>
          )}
          
          {!showDetails && (
            <div className="p-4 text-center">
              <button
                onClick={() => setShowDetails(true)}
                className="text-primary-600 hover:text-primary-800 flex items-center gap-1 mx-auto"
              >
                <SafeIcon icon={FiInfo} className="w-4 h-4" />
                <span>Show Details</span>
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-4 mt-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote(false)}
          className="p-4 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
        >
          <SafeIcon icon={FiThumbsDown} className="w-8 h-8" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSkip}
          className="p-3 bg-gray-200 text-gray-700 rounded-full shadow hover:bg-gray-300"
        >
          <SafeIcon icon={FiSkipForward} className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote(true)}
          className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600"
        >
          <SafeIcon icon={FiThumbsUp} className="w-8 h-8" />
        </motion.button>
      </div>
    </div>
  )
}

export default MovieVoting