import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useGroups } from '../../hooks/useGroups'
import { useAuth } from '../../hooks/useAuth'
import GroupCard from './GroupCard'
import CreateGroupForm from './CreateGroupForm'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiPlus, FiUsers } = FiIcons

const GroupList = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState('all') // all, created, member
  const { user } = useAuth()
  const { groups, myGroups, memberGroups, loading, deleteGroup } = useGroups(user?.id)

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      await deleteGroup(groupId)
    }
  }

  const filteredGroups = filter === 'all' 
    ? groups 
    : filter === 'created' 
      ? myGroups 
      : memberGroups

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
            <h1 className="text-3xl font-bold text-gray-900">Watch Groups</h1>
            <p className="text-gray-600 mt-1">
              {groups.length} group{groups.length !== 1 ? 's' : ''} • {myGroups.length} created by you
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Create Group
          </motion.button>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filter === 'all'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Groups
          </button>
          <button
            onClick={() => setFilter('created')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filter === 'created'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Created by Me
          </button>
          <button
            onClick={() => setFilter('member')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'member'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Member Of
          </button>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No groups found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You don't have any watch groups yet"
                : filter === 'created'
                ? "You haven't created any groups yet"
                : "You're not a member of any groups created by others"}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Create Your First Group
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onDelete={handleDeleteGroup}
                onEdit={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateForm && (
        <CreateGroupForm onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  )
}

export default GroupList