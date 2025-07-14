import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessions } from '../../hooks/useSessions'
import { useAuth } from '../../hooks/useAuth'
import MovieCard from './MovieCard'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiThumbsUp, FiThumbsDown, FiSkipForward } = FiIcons

const SwipeInterface = ({ sessionId, groupId, onComplete }) => {
  const { user } = useAuth()
  const { getSessionMovies, voteOnMovie } = useSessions(user?.id)
  
  const [movies, setMovies] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [direction, setDirection] = useState(null)

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

  const handleVote = async (like) => {
    try {
      if (currentIndex >= movies.length) return
      
      const currentMovie = movies[currentIndex]
      
      // Set direction for exit animation
      setDirection(like ? 'right' : 'left')
      
      // Record the vote
      await voteOnMovie(sessionId, currentMovie.id, like)
      
      // Wait for animation to complete before moving to next card
      setTimeout(() => {
        // Move to next movie
        if (currentIndex < movies.length - 1) {
          setCurrentIndex(currentIndex + 1)
        } else {
          if (onComplete) onComplete()
        }
        
        setDirection(null)
      }, 300)
      
    } catch (err) {
      setError('Failed to record vote')
      console.error(err)
    }
  }

  const handleSkip = () => {
    if (currentIndex < movies.length - 1) {
      setDirection('up')
      
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setDirection(null)
      }, 300)
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

  const variants = {
    enter: { opacity: 0, scale: 0.8 },
    center: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: (direction) => {
      const directions = {
        left: { x: -500, opacity: 0, transition: { duration: 0.3 } },
        right: { x: 500, opacity: 0, transition: { duration: 0.3 } },
        up: { y: -500, opacity: 0, transition: { duration: 0.3 } }
      }
      return directions[direction] || { opacity: 0, transition: { duration: 0.3 } }
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 text-center">
        <p className="text-gray-600">
          Movie {currentIndex + 1} of {movies.length}
        </p>
      </div>
      
      <div className="relative h-[600px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={movies[currentIndex]?.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <MovieCard 
              movie={movies[currentIndex]} 
              onVote={handleVote}
            />
          </motion.div>
        </AnimatePresence>
      </div>

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

export default SwipeInterface