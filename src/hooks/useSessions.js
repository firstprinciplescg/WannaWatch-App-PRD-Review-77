import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export const useSessions = (userId) => {
  const [sessions, setSessions] = useState([])
  const [activeSessions, setActiveSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchSessions()
    }
  }, [userId])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      
      // Get all groups the user is a member of
      const { data: userGroups, error: groupsError } = await supabase
        .from('group_members_r7k9p3')
        .select('group_id')
        .eq('user_id', userId)
      
      if (groupsError) throw groupsError
      
      if (!userGroups || userGroups.length === 0) {
        setSessions([])
        setActiveSessions([])
        setLoading(false)
        return
      }
      
      const groupIds = userGroups.map(g => g.group_id)
      
      // Get sessions for these groups
      const { data, error } = await supabase
        .from('watch_sessions_r7k9p3')
        .select(`
          *,
          group:group_id(*),
          creator:created_by(email),
          votes:session_votes_r7k9p3(
            id,
            user_id,
            movie_id,
            vote
          )
        `)
        .in('group_id', groupIds)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setSessions(data || [])
      setActiveSessions(data?.filter(s => s.status === 'active') || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSession = async (groupId, name = '') => {
    try {
      const { data, error } = await supabase
        .from('watch_sessions_r7k9p3')
        .insert([
          {
            group_id: groupId,
            name: name || `Session ${new Date().toLocaleDateString()}`,
            created_by: userId,
            status: 'active'
          }
        ])
        .select()

      if (error) throw error
      
      await fetchSessions()
      return { success: true, session: data?.[0] }
    } catch (error) {
      console.error('Error creating session:', error)
      return { success: false, error: error.message }
    }
  }

  const closeSession = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('watch_sessions_r7k9p3')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('created_by', userId)
        .select()

      if (error) throw error
      
      await fetchSessions()
      return { success: true, session: data?.[0] }
    } catch (error) {
      console.error('Error closing session:', error)
      return { success: false, error: error.message }
    }
  }

  const voteOnMovie = async (sessionId, movieId, vote) => {
    try {
      // Check if vote already exists
      const { data: existingVote, error: checkError } = await supabase
        .from('session_votes_r7k9p3')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .eq('movie_id', movieId)
        .maybeSingle()
      
      if (checkError) throw checkError
      
      let result;
      
      if (existingVote) {
        // Update existing vote
        const { data, error } = await supabase
          .from('session_votes_r7k9p3')
          .update({ vote })
          .eq('id', existingVote.id)
          .select()
        
        if (error) throw error
        result = data?.[0]
      } else {
        // Create new vote
        const { data, error } = await supabase
          .from('session_votes_r7k9p3')
          .insert([
            {
              session_id: sessionId,
              user_id: userId,
              movie_id: movieId,
              vote
            }
          ])
          .select()
        
        if (error) throw error
        result = data?.[0]
      }
      
      await fetchSessions()
      return { success: true, vote: result }
    } catch (error) {
      console.error('Error voting on movie:', error)
      return { success: false, error: error.message }
    }
  }

  const getSessionDetails = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('watch_sessions_r7k9p3')
        .select(`
          *,
          group:group_id(*),
          creator:created_by(email),
          votes:session_votes_r7k9p3(
            id,
            user_id,
            movie_id,
            vote,
            voter:user_id(email)
          )
        `)
        .eq('id', sessionId)
        .single()
      
      if (error) throw error
      
      return data
    } catch (error) {
      console.error('Error fetching session details:', error)
      return null
    }
  }

  const getSessionMovies = async (sessionId, groupId) => {
    try {
      // Get all movies in the group
      const { data: groupMovies, error: moviesError } = await supabase
        .from('group_movies_r7k9p3')
        .select(`
          movie_id,
          movie:movie_id(*)
        `)
        .eq('group_id', groupId)
      
      if (moviesError) throw moviesError
      
      if (!groupMovies || groupMovies.length === 0) {
        return []
      }
      
      // Get all votes for this session
      const { data: sessionVotes, error: votesError } = await supabase
        .from('session_votes_r7k9p3')
        .select('*')
        .eq('session_id', sessionId)
      
      if (votesError) throw votesError
      
      // Combine data
      const moviesWithVotes = groupMovies.map(gm => {
        const movieId = gm.movie_id
        const movieVotes = sessionVotes?.filter(v => v.movie_id === movieId) || []
        const userVote = movieVotes.find(v => v.user_id === userId)
        
        return {
          ...gm.movie,
          votes: movieVotes,
          userVote: userVote?.vote,
          totalUpvotes: movieVotes.filter(v => v.vote === true).length,
          totalDownvotes: movieVotes.filter(v => v.vote === false).length
        }
      })
      
      return moviesWithVotes
    } catch (error) {
      console.error('Error fetching session movies:', error)
      return []
    }
  }

  const getMatchResults = async (sessionId) => {
    try {
      const sessionDetails = await getSessionDetails(sessionId)
      if (!sessionDetails) throw new Error('Session not found')
      
      const { data: groupMovies, error: moviesError } = await supabase
        .from('group_movies_r7k9p3')
        .select(`
          movie_id,
          movie:movie_id(*)
        `)
        .eq('group_id', sessionDetails.group_id)
      
      if (moviesError) throw moviesError
      
      // Get all votes for this session
      const { data: sessionVotes, error: votesError } = await supabase
        .from('session_votes_r7k9p3')
        .select(`
          *,
          voter:user_id(email)
        `)
        .eq('session_id', sessionId)
      
      if (votesError) throw votesError
      
      // Get all members in the group
      const { data: groupMembers, error: membersError } = await supabase
        .from('group_members_r7k9p3')
        .select(`
          user_id,
          user:user_id(email)
        `)
        .eq('group_id', sessionDetails.group_id)
      
      if (membersError) throw membersError
      
      // Calculate match scores for each movie
      const results = groupMovies.map(gm => {
        const movieId = gm.movie_id
        const movieVotes = sessionVotes?.filter(v => v.movie_id === movieId) || []
        const upvotes = movieVotes.filter(v => v.vote === true)
        const downvotes = movieVotes.filter(v => v.vote === false)
        
        // Calculate match percentage
        const totalVoters = upvotes.length + downvotes.length
        const matchScore = totalVoters > 0 ? (upvotes.length / totalVoters) * 100 : 0
        
        // Check if everyone has voted on this movie
        const allVoted = groupMembers.every(member => 
          movieVotes.some(vote => vote.user_id === member.user_id)
        )
        
        return {
          movie: gm.movie,
          matchScore,
          upvotes,
          downvotes,
          allVoted,
          totalVotes: totalVoters
        }
      })
      
      // Sort by match score (highest first)
      return results.sort((a, b) => b.matchScore - a.matchScore)
    } catch (error) {
      console.error('Error calculating match results:', error)
      return []
    }
  }

  return {
    sessions,
    activeSessions,
    loading,
    createSession,
    closeSession,
    voteOnMovie,
    getSessionDetails,
    getSessionMovies,
    getMatchResults,
    refetch: fetchSessions
  }
}