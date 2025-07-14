import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export const useGroups = (userId) => {
  const [groups, setGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [memberGroups, setMemberGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchGroups()
    }
  }, [userId])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      
      // Fetch all groups where user is creator or member
      const { data, error } = await supabase
        .from('watch_groups_r7k9p3')
        .select(`
          *,
          group_members:group_members_r7k9p3(*)
        `)
        .or(`creator_id.eq.${userId},group_members.user_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Separate groups into created by user vs member of
      const created = data.filter(group => group.creator_id === userId)
      const member = data.filter(group => group.creator_id !== userId)

      setGroups(data || [])
      setMyGroups(created || [])
      setMemberGroups(member || [])
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async (name, description = '') => {
    try {
      const { data, error } = await supabase
        .from('watch_groups_r7k9p3')
        .insert([
          { 
            name, 
            description, 
            creator_id: userId 
          }
        ])
        .select()

      if (error) throw error
      
      // Add creator as a member with 'admin' role
      if (data && data[0]) {
        const groupId = data[0].id
        
        const { error: memberError } = await supabase
          .from('group_members_r7k9p3')
          .insert([
            { 
              group_id: groupId, 
              user_id: userId, 
              role: 'admin' 
            }
          ])
          
        if (memberError) throw memberError
      }
      
      await fetchGroups()
      return { success: true, group: data?.[0] }
    } catch (error) {
      console.error('Error creating group:', error)
      return { success: false, error: error.message }
    }
  }

  const updateGroup = async (groupId, updates) => {
    try {
      const { data, error } = await supabase
        .from('watch_groups_r7k9p3')
        .update(updates)
        .eq('id', groupId)
        .eq('creator_id', userId)
        .select()

      if (error) throw error
      
      await fetchGroups()
      return { success: true, group: data?.[0] }
    } catch (error) {
      console.error('Error updating group:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteGroup = async (groupId) => {
    try {
      const { error } = await supabase
        .from('watch_groups_r7k9p3')
        .delete()
        .eq('id', groupId)
        .eq('creator_id', userId)

      if (error) throw error
      
      await fetchGroups()
      return { success: true }
    } catch (error) {
      console.error('Error deleting group:', error)
      return { success: false, error: error.message }
    }
  }

  const inviteToGroup = async (groupId, email) => {
    try {
      const { data, error } = await supabase
        .from('group_invitations_r7k9p3')
        .insert([
          {
            group_id: groupId,
            email,
            invited_by: userId
          }
        ])
        .select()

      if (error) throw error
      
      return { success: true, invitation: data?.[0] }
    } catch (error) {
      console.error('Error inviting to group:', error)
      return { success: false, error: error.message }
    }
  }

  const getGroupMembers = async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('group_members_r7k9p3')
        .select(`
          *,
          user:user_id(email, id)
        `)
        .eq('group_id', groupId)

      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('Error fetching group members:', error)
      return []
    }
  }

  const getGroupInvitations = async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('group_invitations_r7k9p3')
        .select(`
          *,
          inviter:invited_by(email)
        `)
        .eq('group_id', groupId)

      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('Error fetching group invitations:', error)
      return []
    }
  }

  const removeGroupMember = async (groupId, memberId) => {
    try {
      const { error } = await supabase
        .from('group_members_r7k9p3')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', memberId)

      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Error removing group member:', error)
      return { success: false, error: error.message }
    }
  }

  const leaveGroup = async (groupId) => {
    try {
      const { error } = await supabase
        .from('group_members_r7k9p3')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)

      if (error) throw error
      
      await fetchGroups()
      return { success: true }
    } catch (error) {
      console.error('Error leaving group:', error)
      return { success: false, error: error.message }
    }
  }

  const getGroupDetails = async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('watch_groups_r7k9p3')
        .select(`
          *,
          creator:creator_id(email),
          members:group_members_r7k9p3(
            id,
            user_id,
            role,
            user:user_id(email)
          )
        `)
        .eq('id', groupId)
        .single()

      if (error) throw error
      
      return data
    } catch (error) {
      console.error('Error fetching group details:', error)
      return null
    }
  }

  const addMovieToGroup = async (groupId, movieId) => {
    try {
      const { data, error } = await supabase
        .from('group_movies_r7k9p3')
        .insert([
          {
            group_id: groupId,
            movie_id: movieId,
            added_by: userId
          }
        ])
        .select()

      if (error) throw error
      
      return { success: true, groupMovie: data?.[0] }
    } catch (error) {
      console.error('Error adding movie to group:', error)
      return { success: false, error: error.message }
    }
  }

  const getGroupMovies = async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('group_movies_r7k9p3')
        .select(`
          *,
          movie:movie_id(*),
          added_by_user:added_by(email)
        `)
        .eq('group_id', groupId)

      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('Error fetching group movies:', error)
      return []
    }
  }

  return {
    groups,
    myGroups,
    memberGroups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    inviteToGroup,
    getGroupMembers,
    getGroupInvitations,
    removeGroupMember,
    leaveGroup,
    getGroupDetails,
    addMovieToGroup,
    getGroupMovies,
    refetch: fetchGroups
  }
}