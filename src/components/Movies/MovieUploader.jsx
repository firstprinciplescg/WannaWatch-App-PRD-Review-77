import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Papa from 'papaparse'
import { useMovies } from '../../hooks/useMovies'
import { useAuth } from '../../hooks/useAuth'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUpload, FiFile, FiCheck, FiX, FiAlertCircle } = FiIcons

const MovieUploader = ({ onClose }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState(null)
  const { user } = useAuth()
  const { importMovies } = useMovies(user?.id)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
    } else {
      alert('Please select a CSV file')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResults(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parseResults) => {
        try {
          const csvData = parseResults.data.slice(0, 1000) // Limit to 1000 rows
          const importResults = await importMovies(csvData)
          setResults(importResults)
        } catch (error) {
          console.error('Import error:', error)
          setResults({
            imported: 0,
            updated: 0,
            errors: [`Import failed: ${error.message}`]
          })
        } finally {
          setUploading(false)
        }
      },
      error: (error) => {
        console.error('Parse error:', error)
        setResults({
          imported: 0,
          updated: 0,
          errors: [`File parsing failed: ${error.message}`]
        })
        setUploading(false)
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Import Movies</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        {!results && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <SafeIcon icon={FiFile} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Select a CSV file with movie titles (max 1,000 rows)
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
              >
                <SafeIcon icon={FiUpload} className="w-4 h-4" />
                Choose File
              </label>
            </div>

            {file && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Selected file:</p>
                <p className="font-medium">{file.name}</p>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">CSV Format:</h3>
              <p className="text-sm text-blue-800">
                Your CSV should have a "title" column. Optional columns: "year", "director", "cast"
              </p>
              <div className="mt-2 text-xs text-blue-700">
                Example: title,year<br/>
                Inception,2010<br/>
                The Matrix,1999
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Importing...' : 'Import Movies'}
            </motion.button>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="text-center">
              <SafeIcon icon={FiCheck} className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Import Complete!
              </h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Movies imported:</span>
                <span className="font-medium text-green-600">{results.imported}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Movies updated:</span>
                <span className="font-medium text-blue-600">{results.updated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Errors:</span>
                <span className="font-medium text-red-600">{results.errors.length}</span>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-red-800">Errors:</span>
                </div>
                <div className="space-y-1">
                  {results.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700">{error}</p>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default MovieUploader