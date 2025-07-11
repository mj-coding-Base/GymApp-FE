'use client';

import { motion } from 'framer-motion';
import { Clock, Construction, Server } from 'lucide-react';
import React from 'react';

export const UnderMaintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="md:flex">
          {/* Illustration Section */}
          <div className="md:w-1/2 bg-green-600 p-8 flex items-center justify-center">
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-center"
            >
              <svg
                width="300"
                height="300"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto"
              >
                <path
                  d="M12 15V18M8 21H16M18 10H20M18 14H21M18 18H20M10 3H14C16.2091 3 18 4.79086 18 7V7C18 9.20914 16.2091 11 14 11H10C7.79086 11 6 9.20914 6 7V7C6 4.79086 7.79086 3 10 3Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 11V15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <motion.path
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  transform-origin="center"
                  d="M17 7C17 9.76142 14.7614 12 12 12C9.23858 12 7 9.76142 7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7Z"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 p-8 md:p-12">
            <div className="flex items-center mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="bg-green-100 p-3 rounded-full mr-4"
              >
                <Construction className="h-6 w-6 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-green-800">Under Maintenance</h2>
            </div>

            <p className="text-gray-600 mb-8">
              We are currently performing scheduled maintenance. We will be back online shortly. Thank you for your patience.
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-700">Estimated Downtime</h3>
                  <p className="text-sm text-gray-500">10 hours </p>
                </div>
              </div>

              <div className="flex items-start">
                <Server className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-700">System Status</h3>
                  <p className="text-sm text-gray-500">Core services being upgraded</p>
                </div>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8"
            >
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Refresh Status
              </button>
            </motion.div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Need immediate assistance? <a href="mailto:support@example.com" className="text-green-600 hover:underline">Contact support</a></p>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="h-1.5 w-full bg-green-50 overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="h-full bg-green-400 w-1/2"
          />
        </div>
      </motion.div>
    </div>
  );
};