"use client";

import { motion } from "framer-motion";
import {  Phone, MessageSquareText, ArrowRight } from "lucide-react";
import Link from "next/link";

export const ServerCapacityBanner = () => {
  // Animation variants
//   const pulse = {
//     scale: [1, 1.05, 1],
//     transition: {
//       duration: 2,
//       repeat: Infinity,
//       ease: "easeInOut"
//     }
//   };

  return (
    <div className="fixed inset-0  bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl w-full bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-green-600 p-4 flex items-center">

          <h2 className="ml-3 text-xl font-bold text-white">Server Capacity Notice</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-lg text-gray-800 mb-4">
                Due to low server capacity, this feature is currently disabled.
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-medium text-green-800 flex items-center mb-2">
                  <ArrowRight className="h-5 w-5 mr-2 text-green-600" />
                  Contact for assistance
                </h3>
                <div className="space-y-3">
                  <Link
                    href={`https://wa.me/94711606520?text=Hi%20Manoj%20Pavithra,%20I%20need%20help%20with%20a%20disabled%20feature`}
                    target="_blank"
                    className="flex items-center p-3 bg-white rounded-lg border border-green-200 hover:bg-green-50 transition-colors"
                  >
                    <MessageSquareText className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-sm text-gray-600">Manoj Pavithra - 0711606520</p>
                    </div>
                  </Link>
                  
                  <div className="flex items-center p-3 bg-white rounded-lg border border-green-200">
                    <Phone className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">Call Directly</p>
                      <p className="text-sm text-gray-600">0711606520</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated illustration */}
            <motion.div
              animate={{
                y: [0, -5, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="hidden md:block ml-6"
            >
              <svg className="h-24 w-24 text-green-400" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-green-700 bg-opacity-10 p-3 text-center text-sm text-green-800">
          We appreciate your understanding while we scale our infrastructure
        </div>
      </motion.div>
    </div>
  );
};