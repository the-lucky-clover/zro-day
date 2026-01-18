import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import AuthModal from './components/AuthModal'
import Contact from './components/Contact'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('zroday_token')
    const userData = localStorage.getItem('zroday_user')
    
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }

    // Apply dark mode by default for cybersecurity aesthetic
    document.documentElement.classList.add('dark')
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('zroday_token', token)
    localStorage.setItem('zroday_user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
    setShowAuthModal(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('zroday_token')
    localStorage.removeItem('zroday_user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <LandingPage 
                      onShowAuth={() => setShowAuthModal(true)}
                      darkMode={darkMode}
                      toggleDarkMode={toggleDarkMode}
                    />
                  </motion.div>
                )
              } 
            />
            <Route
              path="/dashboard/*"
              element={
                isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard
                      user={user}
                      onLogout={handleLogout}
                      darkMode={darkMode}
                      toggleDarkMode={toggleDarkMode}
                    />
                  </motion.div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/contact"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Contact />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>

        {/* Authentication Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <AuthModal
              onClose={() => setShowAuthModal(false)}
              onLogin={handleLogin}
            />
          )}
        </AnimatePresence>

        {/* Global Cybersecurity Styling */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Animated background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
                animate={{
                  x: [0, Math.random() * window.innerWidth],
                  y: [0, Math.random() * window.innerHeight],
                }}
                transition={{
                  duration: Math.random() * 20 + 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                style={{
                  left: Math.random() * window.innerWidth,
                  top: Math.random() * window.innerHeight,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
