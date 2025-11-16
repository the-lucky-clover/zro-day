import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const ThreatGlobe = ({ fullscreen = false }) => {
  const canvasRef = useRef(null)
  const [threats, setThreats] = useState([])
  const [globeRotation, setGlobeRotation] = useState(0)
  const animationRef = useRef()

  useEffect(() => {
    // Initialize threats
    const initialThreats = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      lat: (Math.random() - 0.5) * 180,
      lng: (Math.random() - 0.5) * 360,
      type: ['Pegasus', 'Granite', 'Phishing', 'Malware', 'DDoS'][Math.floor(Math.random() * 5)],
      severity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
      active: Math.random() > 0.3,
      pulse: 0,
      targetLat: (Math.random() - 0.5) * 180,
      targetLng: (Math.random() - 0.5) * 360,
      progress: 0
    }))
    setThreats(initialThreats)

    // Add new threats periodically
    const threatInterval = setInterval(() => {
      setThreats(prev => {
        const newThreat = {
          id: Date.now(),
          lat: (Math.random() - 0.5) * 180,
          lng: (Math.random() - 0.5) * 360,
          type: ['Pegasus', 'Granite', 'Phishing', 'Malware', 'DDoS'][Math.floor(Math.random() * 5)],
          severity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
          active: true,
          pulse: 0,
          targetLat: (Math.random() - 0.5) * 180,
          targetLng: (Math.random() - 0.5) * 360,
          progress: 0
        }
        
        // Keep only the latest 30 threats
        const updated = [...prev, newThreat].slice(-30)
        return updated
      })
    }, 3000)

    return () => clearInterval(threatInterval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Draw globe background
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.1)')
      gradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.05)')
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0.02)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw globe wireframe
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)'
      ctx.lineWidth = 1
      
      // Longitude lines
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + globeRotation
        const radiusX = Math.abs(radius * Math.cos(angle))
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, radiusX, radius, angle, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      // Latitude lines
      for (let i = 1; i < 6; i++) {
        const y = centerY + (radius * 0.8 * (i - 3) / 3)
        const ellipseRadius = radius * Math.sqrt(1 - Math.pow((i - 3) / 3, 2))
        ctx.beginPath()
        ctx.ellipse(centerX, y, ellipseRadius, ellipseRadius * 0.3, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw threats
      setThreats(prevThreats => {
        return prevThreats.map(threat => {
          if (!threat.active) return threat

          // Convert lat/lng to screen coordinates
          const phi = (threat.lat + 90) * (Math.PI / 180)
          const theta = (threat.lng + globeRotation * 180 / Math.PI) * (Math.PI / 180)
          
          const x = centerX + radius * Math.sin(phi) * Math.cos(theta)
          const y = centerY - radius * Math.cos(phi)
          const z = radius * Math.sin(phi) * Math.sin(theta)

          // Only draw if on visible side of globe
          if (z > -radius * 0.1) {
            // Threat color based on severity
            let color
            switch (threat.severity) {
              case 'Critical': color = '#ef4444'; break
              case 'High': color = '#f97316'; break
              case 'Medium': color = '#eab308'; break
              default: color = '#22d3ee'
            }

            // Pulsing effect
            const pulseSize = 3 + Math.sin(threat.pulse) * 2
            threat.pulse += 0.1

            // Draw threat point
            ctx.fillStyle = color
            ctx.globalAlpha = 0.8
            ctx.beginPath()
            ctx.arc(x, y, pulseSize, 0, Math.PI * 2)
            ctx.fill()

            // Draw outer pulse
            ctx.strokeStyle = color
            ctx.globalAlpha = 0.3
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(x, y, pulseSize * 2, 0, Math.PI * 2)
            ctx.stroke()

            // Draw attack vector if has target
            if (threat.targetLat !== undefined) {
              const targetPhi = (threat.targetLat + 90) * (Math.PI / 180)
              const targetTheta = (threat.targetLng + globeRotation * 180 / Math.PI) * (Math.PI / 180)
              
              const targetX = centerX + radius * Math.sin(targetPhi) * Math.cos(targetTheta)
              const targetY = centerY - radius * Math.cos(targetPhi)
              const targetZ = radius * Math.sin(targetPhi) * Math.sin(targetTheta)

              if (targetZ > -radius * 0.1) {
                // Animate attack vector
                threat.progress += 0.02
                if (threat.progress > 1) {
                  threat.progress = 0
                  // Generate new target
                  threat.targetLat = (Math.random() - 0.5) * 180
                  threat.targetLng = (Math.random() - 0.5) * 360
                }

                const currentX = x + (targetX - x) * threat.progress
                const currentY = y + (targetY - y) * threat.progress

                // Draw parabolic curve
                ctx.strokeStyle = color
                ctx.globalAlpha = 0.6
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(x, y)
                
                // Create curved path
                const midX = (x + targetX) / 2
                const midY = (y + targetY) / 2 - 30
                ctx.quadraticCurveTo(midX, midY, currentX, currentY)
                ctx.stroke()

                // Draw moving projectile
                ctx.fillStyle = color
                ctx.globalAlpha = 1
                ctx.beginPath()
                ctx.arc(currentX, currentY, 2, 0, Math.PI * 2)
                ctx.fill()
              }
            }

            ctx.globalAlpha = 1
          }

          return threat
        })
      })

      // Update globe rotation
      setGlobeRotation(prev => prev + 0.005)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [globeRotation, threats])

  return (
    <div className={`relative ${fullscreen ? 'h-full' : 'h-full'} w-full overflow-hidden`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
      
      {/* Threat Legend */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 space-y-2">
        <div className="text-xs font-semibold text-white mb-2">Threat Levels</div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs text-gray-300">Critical</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-xs text-gray-300">High</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-gray-300">Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
          <span className="text-xs text-gray-300">Low</span>
        </div>
      </div>

      {/* Live Stats Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
        <div className="text-xs font-semibold text-white mb-2">Live Statistics</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Active Threats:</span>
            <span className="text-red-400 font-mono">{threats.filter(t => t.active).length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Blocked Today:</span>
            <span className="text-green-400 font-mono">1,247,893</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Detection Rate:</span>
            <span className="text-cyan-400 font-mono">99.97%</span>
          </div>
        </div>
      </div>

      {/* Scanning Animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent transform -skew-x-12 animate-pulse"></div>
      </motion.div>
    </div>
  )
}

export default ThreatGlobe
