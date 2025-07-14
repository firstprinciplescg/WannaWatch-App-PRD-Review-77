import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiLogOut, FiUser, FiFilm } = FiIcons

const Header = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <SafeIcon icon={FiFilm} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WannaWatch</h1>
              <p className="text-sm text-gray-600">Movie Matching Made Easy</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <SafeIcon icon={FiUser} className="w-4 h-4" />
              <span className="text-sm font-medium">
                {user?.user_metadata?.display_name || user?.email}
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign out"
            >
              <SafeIcon icon={FiLogOut} className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header