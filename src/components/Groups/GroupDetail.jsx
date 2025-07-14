import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGroups } from '../../hooks/useGroups'
import { useMovies } from '../../hooks/useMovies'
import { useSessions } from '../../hooks/useSessions'
import { useAuth } from '../../hooks/useAuth'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import InviteMemberForm from './InviteMemberForm'
import StartSessionForm from './StartSessionForm'
import MovieSelection from './MovieSelection'

const { 
  FiUsers, FiUserPlus, FiUserMinus, FiArrowLeft, FiEdit2, 
  FiLogOut, FiPlay, FiFilm, FiPlus, FiClock, FiCheck
} = FiIcons

const GroupDetail = () => {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getGroupDetails, leaveGroup, removeGroupMember } = useGroups(user?.id)
  const { getGroupMovies, addMovieToGroup } = useGroups(user?.id)
  const { movies } = useMovies(user?.id)
  const { sessions, createSession, getSessionDetails } = useSessions(user?.id)
  
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [groupMovies, setGroupMovies] = useState([])
  const [activeSessions, setActiveSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [showMovieSelection, setShowMovieSelection] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGroupData()
  }, [groupId])

  const fetchGroupData = async () => {
    setLoading(true)
    try {
      const groupData = await getGroupDetails(groupId)
      if (!groupData) {
        setError('Group not found')
        return
      }
      
      setGroup(groupData)
      setMembers(groupData.members || [])
      
      const moviesData = await getGroupMovies(groupId)
      setGroupMovies(moviesData)
      
      const groupSessions = sessions.filter(s => s.group_id === groupId)
      const active = groupSessions.filter(s => s.status === 'active')
      setActiveSessions(active)
    } catch (err) {
      setError('Failed to load group data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      const result = await leaveGroup(groupId)
      if (result.success) {
        navigate('/app/groups')
      } else {
        setError(result.error || 'Failed to leave group')
      }
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Remove this member from the group?')) {
      const result = await removeGroupMember(groupId, memberId)
      if (result.success) {
        fetchGroupData()
      } else {
        setError(result.error || 'Failed to remove member')
      }
    }
  }

  const handleAddMovieToGroup = async (movieId) => {
    const result = await addMovieToGroup(groupId, movieId)
    if (result.success) {
      fetchGroupData()
      setShowMovieSelection(false)
    } else {
      setError(result.error || 'Failed to add movie')
    }
  }

  const handleCreateSession = async (sessionName) => {
    const result = await createSession(groupId, sessionName)
    if (result.success) {
      fetchGroupData()
      setShowSessionForm(false)
      navigate(`/app/sessions/${result.session.id}`)
    } else {
      setError(result.error || 'Failed to create session')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl max-w-md w-full text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/app/groups')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Groups
          </button>
        </div>
      </div>
    )
  }

  if (!group) return null

  const isCreator = group.creator_id === user?.id
  const userMoviesNotInGroup = movies.filter(movie => 
    !groupMovies.some(gm => gm.movie_id === movie.id)
  )

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/groups')}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isCreator ? (
              <button
                onClick={() => navigate(`/app/groups/${groupId}/edit`)}
                className="flex items-center gap-1 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                <span>Edit Group</span>
              </button>
            ) : (
              <button
                onClick={handleLeaveGroup}
                className="flex items-center gap-1 px-3 py-2 text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                <span>Leave Group</span>
              </button>
            )}
          </div>
        </div>

        {group.description && (
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
            <p className="text-gray-700">{group.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Members */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <SafeIcon icon={FiUsers} className="w-4 h-4" />
                  <span>Members ({members.length})</span>
                </h2>
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full"
                >
                  <SafeIcon icon={FiUserPlus} className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {members.map((member) => (
                  <div key={member.id} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.user?.email || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                    </div>
                    {isCreator && member.user_id !== user.id && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <SafeIcon icon={FiUserMinus} className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <SafeIcon icon={FiPlay} className="w-4 h-4" />
                  <span>Watch Sessions</span>
                </h2>
                <button
                  onClick={() => setShowSessionForm(true)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                {activeSessions.length > 0 ? (
                  <div className="space-y-3">
                    {activeSessions.map(session => (
                      <div key={session.id} className="bg-primary-50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium text-primary-900">
                            {session.name || 'Unnamed Session'}
                          </p>
                          <p className="text-xs text-primary-700 flex items-center gap-1">
                            <SafeIcon icon={FiClock} className="w-3 h-3" />
                            {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/app/sessions/${session.id}`)}
                          className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                        >
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-3">No active sessions</p>
                    <button
                      onClick={() => setShowSessionForm(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                    >
                      Start Watch Session
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Movies */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <SafeIcon icon={FiFilm} className="w-4 h-4" />
                  <span>Group Movies ({groupMovies.length})</span>
                </h2>
                <button
                  onClick={() => setShowMovieSelection(true)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                {groupMovies.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {groupMovies.map((groupMovie) => {
                      const movie = groupMovie.movie || {}
                      const metadata = movie.metadata || {}
                      return (
                        <div key={groupMovie.id} className="bg-gray-50 rounded-lg overflow-hidden">
                          <img
                            src={`https://image.tmdb.org/t/p/w500${metadata.poster_path}`}
                            alt={metadata.title}
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-movie.jpg'
                            }}
                          />
                          <div className="p-3">
                            <h3 className="font-medium text-gray-900 line-clamp-1">{metadata.title}</h3>
                            <p className="text-xs text-gray-500">
                              Added by {groupMovie.added_by_user?.email?.split('@')[0] || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-3">No movies added to this group yet</p>
                    <button
                      onClick={() => setShowMovieSelection(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                    >
                      Add Movies
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInviteForm && (
        <InviteMemberForm
          groupId={groupId}
          onClose={() => setShowInviteForm(false)}
          onSuccess={fetchGroupData}
        />
      )}

      {showSessionForm && (
        <StartSessionForm
          groupId={groupId}
          onClose={() => setShowSessionForm(false)}
          onSuccess={handleCreateSession}
        />
      )}

      {showMovieSelection && (
        <MovieSelection
          movies={userMoviesNotInGroup}
          onClose={() => setShowMovieSelection(false)}
          onSelectMovie={handleAddMovieToGroup}
        />
      )}
    </div>
  )
}

export default GroupDetail