import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiPlay, FiUsers, FiCheck, FiStar, FiArrowRight } = FiIcons

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <SafeIcon icon={FiPlay} className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">WannaWatch</span>
            </div>
            <div className="flex items-center">
              <Link
                to="/app"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-8"
            >
              Movie Night,{' '}
              <span className="text-primary-600">Made Simple</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-xl text-gray-600 mb-12"
            >
              Stop endless debates about what to watch. WannaWatch helps your group
              quickly find the perfect movie that everyone will enjoy.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/app"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Get Started
                <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Why Choose WannaWatch?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FiUsers,
                title: 'Group Matching',
                description: 'Create watch groups and find movies that everyone wants to see.',
              },
              {
                icon: FiCheck,
                title: 'Quick Decisions',
                description: 'Simple swipe interface helps groups decide on a movie in minutes.',
              },
              {
                icon: FiStar,
                title: 'Rich Movie Data',
                description: 'Access detailed movie information, ratings, and recommendations.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
                className="bg-gray-50 rounded-xl p-8 text-center"
              >
                <div className="flex justify-center mb-4">
                  <SafeIcon
                    icon={feature.icon}
                    className="w-12 h-12 text-primary-600"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-8">
            Ready to Transform Movie Night?
          </h2>
          <Link
            to="/app"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Launch WannaWatch
            <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <SafeIcon icon={FiPlay} className="w-8 h-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">WannaWatch</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} WannaWatch. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage