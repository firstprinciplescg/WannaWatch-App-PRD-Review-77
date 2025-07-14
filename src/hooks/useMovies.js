import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { tmdbApi } from '../config/tmdb'
import stringSimilarity from 'string-similarity'

export const useMovies = (userId) => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchMovies()
    }
  }, [userId])

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies_x9k7m2')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMovies(data || [])
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMovie = async (title, year = null) => {
    try {
      // Search TMDB for movie data
      const searchResult = await tmdbApi.searchMovie(title)
      let movieData = null

      if (searchResult.results && searchResult.results.length > 0) {
        // Find best match using fuzzy matching
        const bestMatch = findBestMatch(title, searchResult.results, year)
        if (bestMatch) {
          movieData = await tmdbApi.getMovieDetails(bestMatch.id)
        }
      }

      const metadata = movieData ? {
        tmdb_id: movieData.id,
        title: movieData.title,
        overview: movieData.overview,
        release_date: movieData.release_date,
        poster_path: movieData.poster_path,
        backdrop_path: movieData.backdrop_path,
        vote_average: movieData.vote_average,
        runtime: movieData.runtime,
        genres: movieData.genres,
      } : {
        title: title,
        year: year,
        overview: '',
        poster_path: null,
      }

      const { data, error } = await supabase
        .from('movies_x9k7m2')
        .insert([{
          user_id: userId,
          title: movieData?.title || title,
          metadata: metadata,
        }])
        .select()

      if (error) throw error

      setMovies(prev => [data[0], ...prev])
      return { success: true, movie: data[0] }
    } catch (error) {
      console.error('Error adding movie:', error)
      return { success: false, error: error.message }
    }
  }

  const importMovies = async (csvData) => {
    const results = { imported: 0, updated: 0, errors: [] }

    for (const row of csvData) {
      try {
        if (!row.title || row.title.trim() === '') {
          results.errors.push(`Missing title in row: ${JSON.stringify(row)}`)
          continue
        }

        const result = await addMovie(row.title.trim(), row.year?.trim())
        if (result.success) {
          results.imported++
        } else {
          results.errors.push(`Failed to import "${row.title}": ${result.error}`)
        }
      } catch (error) {
        results.errors.push(`Error processing "${row.title}": ${error.message}`)
      }
    }

    return results
  }

  const updateWatchStatus = async (movieId, watched, rating = null) => {
    try {
      const { data, error } = await supabase
        .from('movies_x9k7m2')
        .update({ watched, rating })
        .eq('id', movieId)
        .eq('user_id', userId)
        .select()

      if (error) throw error

      setMovies(prev =>
        prev.map(movie =>
          movie.id === movieId ? { ...movie, watched, rating } : movie
        )
      )

      return { success: true }
    } catch (error) {
      console.error('Error updating watch status:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteMovie = async (movieId) => {
    try {
      const { error } = await supabase
        .from('movies_x9k7m2')
        .delete()
        .eq('id', movieId)
        .eq('user_id', userId)

      if (error) throw error

      setMovies(prev => prev.filter(movie => movie.id !== movieId))
      return { success: true }
    } catch (error) {
      console.error('Error deleting movie:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    movies,
    loading,
    addMovie,
    importMovies,
    updateWatchStatus,
    deleteMovie,
    refetch: fetchMovies,
  }
}

const findBestMatch = (searchTitle, results, year = null) => {
  if (!results || results.length === 0) return null

  let bestMatch = results[0]
  let bestScore = 0

  for (const movie of results) {
    let score = stringSimilarity.compareTwoStrings(
      searchTitle.toLowerCase(),
      movie.title.toLowerCase()
    )

    // Boost score if year matches
    if (year && movie.release_date) {
      const movieYear = new Date(movie.release_date).getFullYear()
      if (movieYear === parseInt(year)) {
        score += 0.2
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = movie
    }
  }

  return bestScore > 0.6 ? bestMatch : results[0]
}