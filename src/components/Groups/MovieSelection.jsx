import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { tmdbApi } from '../../config/tmdb'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiFilm, FiX, FiSearch, FiPlus } = FiIcons

const MovieSelection = ({ movies, onClose, onSelectMovie }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMovie, setSelectedMovie] = useState(null)

  const filteredMovies = movies.filter(movie => 
    movie.metadata.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie)
  }

  const handleConfirmSelection = () => {
    if (selectedMovie) {
      onSelectMovie(selectedMovie.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <SafeIcon icon={FiFilm} className="w-5 h-5 text-primary-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add Movie to Group</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search your movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-y-auto flex-grow mb-4">
          {filteredMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No movies found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMovies.map((movie) => {
                const { metadata } = movie
                const posterUrl = tmdbApi.getImageUrl(metadata.poster_path)
                const isSelected = selectedMovie?.id === movie.id
                
                return (
                  <div 
                    key={movie.id} 
                    onClick={() => handleSelectMovie(movie)}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative h-40">
                      <img 
                        src={posterUrl} 
                        alt={metadata.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-movie.jpg'
                        }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary-600 bg-opacity-30 flex items-center justify-center">
                          <div className="bg-white rounded-full p-2">
                            <SafeIcon icon={FiCheck} className="w-5 h-5 text-primary-600" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 line-clamp-1">{metadata.title}</h3>
                      {metadata.release_date && (
                        <p className="text-xs text-gray-500">
                          {new Date(metadata.release_date).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirmSelection}
            disabled={!selectedMovie}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Add to Group
          </motion.button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MovieSelection