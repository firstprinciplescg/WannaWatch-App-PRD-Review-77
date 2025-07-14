import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useMovies } from '../../hooks/useMovies'
import { useAuth } from '../../hooks/useAuth'
import MovieCard from './MovieCard'
import AddMovieForm from './AddMovieForm'
import MovieUploader from './MovieUploader'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiPlus, FiUpload, FiSearch, FiFilter } = FiIcons

const MovieList = () => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, watched, unwatched
  const { user } = useAuth()
  const { movies, loading, updateWatchStatus, deleteMovie } = useMovies(user?.id)

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.metadata.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'watched' && movie.watched) ||
      (filter === 'unwatched' && !movie.watched)
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Movies</h1>
            <p className="text-gray-600 mt-1">
              {movies.length} movies • {movies.filter(m => m.watched).length} watched
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Add Movie
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUploader(true)}
              className="bg-secondary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary-700 transition-colors flex items-center gap-2"
            >
              <SafeIcon icon={FiUpload} className="w-4 h-4" />
              Import CSV
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <SafeIcon icon={FiFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Movies</option>
              <option value="unwatched">Unwatched</option>
              <option value="watched">Watched</option>
            </select>
          </div>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No movies found' : 'No movies yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search or filter criteria'
                : 'Add your first movie to get started!'
              }
            </p>
            {!searchTerm && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                Add Your First Movie
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatchStatusChange={updateWatchStatus}
                onDelete={deleteMovie}
              />
            ))}
          </div>
        )}
      </div>

      {showAddForm && <AddMovieForm onClose={() => setShowAddForm(false)} />}
      {showUploader && <MovieUploader onClose={() => setShowUploader(false)} />}
    </div>
  )
}

export default MovieList