import React from 'react'
import { motion } from 'framer-motion'
import { tmdbApi } from '../../config/tmdb'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCalendar, FiClock, FiStar } = FiIcons

const MovieCard = ({ movie, onVote }) => {
  const { metadata } = movie
  const posterUrl = tmdbApi.getImageUrl(metadata.poster_path)
  
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white rounded-xl shadow-xl overflow-hidden max-w-sm mx-auto"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = Math.abs(offset.x) * velocity.x
        
        if (swipe < -200) {
          onVote(false)
        } else if (swipe > 200) {
          onVote(true)
        }
      }}
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
              <div className="flex items-center gap-1">
                <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                <span>{new Date(metadata.release_date).getFullYear()}</span>
              </div>
            )}
            {metadata.runtime && (
              <div className="flex items-center gap-1">
                <SafeIcon icon={FiClock} className="w-4 h-4" />
                <span>{metadata.runtime} min</span>
              </div>
            )}
            {metadata.vote_average && (
              <div className="flex items-center gap-1">
                <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-400" />
                <span>{metadata.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {metadata.overview && (
          <p className="text-gray-700 mb-4">{metadata.overview}</p>
        )}
        
        {metadata.genres && metadata.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {metadata.genres.map(genre => (
              <span 
                key={genre.id} 
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}
        
        <div className="text-center text-sm text-gray-500">
          <p>Swipe right to like, left to dislike</p>
        </div>
      </div>
    </motion.div>
  )
}

export default MovieCard