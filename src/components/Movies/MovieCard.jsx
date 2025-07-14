import React from 'react'
import { motion } from 'framer-motion'
import { tmdbApi } from '../../config/tmdb'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiStar, FiClock, FiCalendar, FiCheck, FiX } = FiIcons

const MovieCard = ({ movie, onWatchStatusChange, onDelete }) => {
  const { metadata, watched, rating } = movie
  const posterUrl = tmdbApi.getImageUrl(metadata.poster_path)

  const handleWatchToggle = () => {
    onWatchStatusChange(movie.id, !watched, rating)
  }

  const handleRatingChange = (newRating) => {
    onWatchStatusChange(movie.id, watched, newRating)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative">
        <img
          src={posterUrl}
          alt={metadata.title}
          className="w-full h-64 object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-movie.jpg'
          }}
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleWatchToggle}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              watched 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SafeIcon icon={FiCheck} className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(movie.id)}
            className="p-2 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
          >
            <SafeIcon icon={FiX} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {metadata.title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {metadata.release_date && (
            <div className="flex items-center gap-1">
              <SafeIcon icon={FiCalendar} className="w-4 h-4" />
              <span>{new Date(metadata.release_date).getFullYear()}</span>
            </div>
          )}
          {metadata.runtime && (
            <div className="flex items-center gap-1">
              <SafeIcon icon={FiClock} className="w-4 h-4" />
              <span>{metadata.runtime}m</span>
            </div>
          )}
          {metadata.vote_average && (
            <div className="flex items-center gap-1">
              <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-500" />
              <span>{metadata.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>

        {metadata.overview && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-3">
            {metadata.overview}
          </p>
        )}

        {metadata.genres && metadata.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {metadata.genres.slice(0, 3).map((genre) => (
              <span
                key={genre.id}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {watched && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Your rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingChange(star)}
                  className={`w-6 h-6 ${
                    rating >= star ? 'text-yellow-500' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <SafeIcon icon={FiStar} className="w-full h-full" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default MovieCard