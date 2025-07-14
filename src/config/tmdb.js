const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'your-tmdb-key'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export const tmdbApi = {
  searchMovie: async (query) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    )
    return response.json()
  },
  
  getMovieDetails: async (movieId) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
    )
    return response.json()
  },
  
  getImageUrl: (path, size = 'w500') => {
    if (!path) return '/placeholder-movie.jpg'
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
  }
}