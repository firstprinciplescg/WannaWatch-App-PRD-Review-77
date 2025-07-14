import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUsers, FiFilm, FiCalendar, FiClock, FiEdit2, FiTrash2 } = FiIcons

const GroupCard = ({ group, onEdit, onDelete }) => {
  const { user } = useAuth()
  const isCreator = group.creator_id === user?.id
  const memberCount = group.group_members?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <SafeIcon icon={FiUsers} className="w-5 h-5 text-primary-700" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">{group.name}</h3>
          </div>
          
          {isCreator && (
            <div className="flex gap-2">
              <button 
                onClick={() => onEdit(group)} 
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full"
              >
                <SafeIcon icon={FiEdit2} className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(group.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {group.description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {group.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
          <div className="flex items-center gap-1">
            <SafeIcon icon={FiUsers} className="w-4 h-4" />
            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <SafeIcon icon={FiCalendar} className="w-4 h-4" />
            <span>{new Date(group.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-5">
          <Link 
            to={`/app/groups/${group.id}`}
            className="w-full block text-center py-2 px-4 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition-colors"
          >
            View Group
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default GroupCard