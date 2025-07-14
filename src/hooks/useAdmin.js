import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const { data: adminUser } = await supabase
        .from('admin_users_x7y9z')
        .select('is_super_admin')
        .single()

      setIsAdmin(!!adminUser)
      setIsSuperAdmin(adminUser?.is_super_admin || false)
    } catch (error) {
      console.error('Error checking admin status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAdminStats = async () => {
    const { data, error } = await supabase.rpc('get_admin_stats')
    if (error) throw error
    return data
  }

  const getAllUsers = async () => {
    const { data, error } = await supabase
      .from('auth.users')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }

  const addAdmin = async (email, isSuperAdmin = false) => {
    try {
      // First, ensure user exists
      const { data: user } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single()

      if (!user) throw new Error('User not found')

      // Add admin role
      const { error } = await supabase
        .from('admin_users_x7y9z')
        .insert([
          {
            user_id: user.id,
            is_super_admin: isSuperAdmin
          }
        ])

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error adding admin:', error)
      throw error
    }
  }

  const removeAdmin = async (userId) => {
    const { error } = await supabase
      .from('admin_users_x7y9z')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
    return true
  }

  return {
    isAdmin,
    isSuperAdmin,
    loading,
    getAdminStats,
    getAllUsers,
    addAdmin,
    removeAdmin
  }
}