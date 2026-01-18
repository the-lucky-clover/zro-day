import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text, Sphere, Box, Torus, Float, Text3D, Html, Line } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Shield,
  Globe,
  Activity,
  Users,
  Settings,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Eye,
  Lock,
  Smartphone,
  Monitor,
  Zap,
  Brain,
  Network,
  Database,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Cpu,
  Radar,
  Server,
  Clock,
  Target,
  Cloud,
  Layers,
  Zap as Lightning,
  Activity as Pulse
} from 'lucide-react'
import * as THREE from 'three'
import { useDistributedComputing } from '@/hooks/useDistributedComputing'

function CyberCommandCenter({ onNavigate, stats }) {
  const { camera } = useThree()
  const [hoveredNode, setHoveredNode] = useState(null)
  const [selectedSection, setSelectedSection] = useState('dashboard')

  useEffect(() => {
    camera.position.set(0, 0, 12)
  }, [camera])

  const menuItems = [
    { id: 'dashboard', label: 'COMMAND CENTER', position: [-8, 6, 0], icon: Shield, color: '#00d4ff' },
    { id: 'threats', label: 'THREAT MATRIX', position: [-6, 4, 0], icon: Radar, color: '#ff6b6b' },
    { id: 'defense', label: 'DEFENSE ARRAY', position: [-4, 2, 0], icon: Shield, color: '#00ff88' },
    { id: 'network', label: 'NETWORK NEXUS', position: [-2, 0, 0], icon: Network, color: '#a78bfa' },
    { id: 'intelligence', label: 'INTEL OPS', position: [0, -2, 0], icon: Brain, color: '#f59e0b' },
    { id: 'pii', label: 'PII GUARD', position: [2, -4, 0], icon: Eye, color: '#ec4899' },
    { id: 'analytics', label: 'ANALYTICS CORE', position: [4, -6, 0], icon: TrendingUp, color: '#6b7280' }
  ]

  const handleNodeClick = (nodeId) => {
    setSelectedSection(nodeId)
    onNavigate?.(nodeId)
  }

  return (
    <group>
      {/* Main Holographic Grid */}
      <HolographicGrid />

      {/* Navigation Nodes */}
      {menuItems.map((item, index) => (
        <NavigationNode
          key={item.id}
          {...item}
          isSelected={selectedSection === item.id}
          isHovered={hoveredNode === item.id}
          onHover={setHoveredNode}
          onClick={() => handleNodeClick(item.id)}
          delay={index * 0.2}
        />
      ))}

      {/* Central Command Sphere */}
      <CentralCommandSphere stats={stats} />

      {/* Data Streams */}
      <DataStreamConnections />

      {/* 3D Statistics Display */}
      <StatisticsDisplay stats={stats} />

      {/* Ambient Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#00d4ff" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#ff6b6b" />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
    </group>
  )
}

function NavigationNode({ id, label, position, icon: Icon, color, isSelected, isHovered, onHover, onClick, delay }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      // Rotation animation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime + delay) * 0.1
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.05

      // Scale animation on hover/selection
      const targetScale = isSelected ? 1.3 : isHovered ? 1.2 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)

      // Pulsing glow effect
      if (isSelected) {
        meshRef.current.children[0].intensity = 2 + Math.sin(state.clock.elapsedTime * 3) * 0.5
      }
    }
  })

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={() => onHover(id)}
      onPointerOut={() => onHover(null)}
      onClick={onClick}
    >
      {/* Outer Glow */}
      <pointLight color={color} intensity={1} distance={4} />

      {/* Main Node Sphere */}
      <Sphere args={[0.3, 16, 16]}>
        <meshPhongMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Wireframe Ring */}
      <Torus args={[0.4, 0.02, 8, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          wireframe
        />
      </Torus>

      {/* Label */}
      <Html position={[0, -0.6, 0]} center>
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            className={`text-xs font-bold ${isSelected ? 'text-cyan-400' : 'text-gray-300'}`}
          >
            {label}
          </motion.div>
          <Icon className={`w-4 h-4 mx-auto mt-1 ${isHovered ? 'text-cyan-400' : 'text-gray-400'}`} />
        </div>
      </Html>

      {/* Connection Lines when selected */}
      <AnimatePresence>
        {isSelected && (
          <ConnectionLines position={position} color={color} />
        )}
      </AnimatePresence>
    </group>
  )
}

function HolographicGrid() {
  const gridRef = useRef()
  const lines = []

  // Create grid lines
  for (let i = -10; i <= 10; i += 2) {
    // Horizontal lines
    lines.push({
      points: [[-10, 0, i], [10, 0, i]],
      color: '#00d4ff',
      opacity: 0.1
    })
    // Vertical lines
    lines.push({
      points: [[i, 0, -10], [i, 0, 10]],
      color: '#00d4ff',
      opacity: 0.1
    })
  }

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.01
    }
  })

  return (
    <group ref={gridRef} position={[0, -2, 0]}>
      {lines.map((line, index) => (
        <Line
          key={index}
          points={line.points}
          color={line.color}
          lineWidth={1}
          transparent
          opacity={line.opacity}
        />
      ))}
    </group>
  )
}

function CentralCommandSphere({ stats }) {
  const sphereRef = useRef()
  const dataRef = useRef()

  useFrame((state) => {
    if (sphereRef.current) {
      // Slow rotation
      sphereRef.current.rotation.y += 0.005
      sphereRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }

    if (dataRef.current) {
      dataRef.current.rotation.y -= 0.01
      dataRef.current.children.forEach((child, index) => {
        if (child.material?.emissiveIntensity) {
          child.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1
        }
      })
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Command Sphere */}
      <Sphere ref={sphereRef} args={[1.5, 32, 32]} position={[0, 0, 0]}>
        <meshPhongMaterial
          color="#0a0a0a"
          transparent
          opacity={0.6}
          shininess={100}
        />
      </Sphere>

      {/* Wireframe Grid */}
      <Sphere args={[1.51, 16, 16]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.3}
          wireframe
        />
      </Sphere>

      {/* Internal Data Visualization */}
      <group ref={dataRef}>
        {/* Threat Indicators */}
        {Object.entries(stats).map(([key, value], index) => {
          const angle = (index / Object.keys(stats).length) * Math.PI * 2
          const radius = 1
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius

          return (
            <Float key={key} speed={1} rotationIntensity={1} floatIntensity={0.5}>
              <Box
                position={[x, 0, z]}
                args={[0.1, 0.1, 0.1]}
              >
                <meshPhongMaterial
                  color={
                    key.includes('threat') ? '#ef4444' :
                    key.includes('protection') || key.includes('accuracy') ? '#22c55e' :
                    '#00d4ff'
                  }
                  emissive="#003d4d"
                  emissiveIntensity={0.3}
                />
              </Box>
            </Float>
          )
        })}
      </group>

      {/* Central Core */}
      <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#00d4ff" />
      </Sphere>

      {/* Glowing Core */}
      <pointLight position={[0, 0, 0]} color="#00d4ff" intensity={2} distance={5} />

      <Html position={[0, 2.2, 0]} center>
        <Card className="bg-black/80 backdrop-blur-sm border-cyan-500/50">
          <CardContent className="p-4 text-center">
            <h2 className="text-cyan-400 font-bold text-lg mb-2">COMMAND CENTER ALPHA</h2>
            <p className="text-gray-300 text-sm">Neural Defense Network Active</p>
          </CardContent>
        </Card>
      </Html>
    </group>
  )
}

function DataStreamConnections() {
  const connections = [
    { from: [-8, 6, 0], to: [0, 0, 0], color: '#00d4ff' },
    { from: [-6, 4, 0], to: [0, 0, 0], color: '#ff6b6b' },
    { from: [-4, 2, 0], to: [0, 0, 0], color: '#00ff88' },
    { from: [-2, 0, 0], to: [0, 0, 0], color: '#a78bfa' },
    { from: [0, -2, 0], to: [0, 0, 0], color: '#f59e0b' },
    { from: [2, -4, 0], to: [0, 0, 0], color: '#ec4899' },
    { from: [4, -6, 0], to: [0, 0, 0], color: '#6b7280' }
  ]

  return (
    <group>
      {connections.map((conn, index) => (
        <DataStream
          key={index}
          startPoint={conn.from}
          endPoint={conn.to}
          color={conn.color}
          delay={index * 0.1}
        />
      ))}
    </group>
  )
}

function DataStream({ startPoint, endPoint, color, delay }) {
  const lineRef = useRef()
  const particlesRef = useRef()

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, index) => {
        const progress = ((state.clock.elapsedTime - delay) % 2) / 2
        const particleProgress = (progress + index * 0.1) % 1

        const start = new THREE.Vector3(...startPoint)
        const end = new THREE.Vector3(...endPoint)
        const direction = end.clone().sub(start)
        const length = direction.length()
        direction.normalize()

        particle.position.copy(start).add(direction.multiplyScalar(length * particleProgress))

        particle.material.emissiveIntensity = Math.sin(particleProgress * Math.PI) * 2
      })
    }
  })

  return (
    <group>
      {/* Connection Line */}
      <Line
        points={[startPoint, endPoint]}
        color={color}
        lineWidth={2}
        transparent
        opacity={0.4}
      />

      {/* Flowing Data Particles */}
      <group ref={particlesRef}>
        {Array.from({ length: 5 }, (_, i) => (
          <Sphere key={i} args={[0.02, 8, 8]}>
            <meshBasicMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0}
            />
          </Sphere>
        ))}
      </group>
    </group>
  )
}

function StatisticsDisplay({ stats }) {
  const displayRef = useRef()

  useFrame((state) => {
    if (displayRef.current) {
      displayRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })

  return (
    <group ref={displayRef} position={[6, 2, 0]}>
      <Html transform occlude>
        <Card className="bg-black/80 backdrop-blur-sm border-gray-700 w-80">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center text-lg">
              <Brain className="w-5 h-5 mr-2" />
              Neural Defense Network
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats).map(([key, value]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center"
              >
                <span className="text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <Badge
                  className={`${
                    key.includes('threat') ? 'bg-red-500/20 text-red-300' :
                    key.includes('protection') || key.includes('accuracy') ? 'bg-green-500/20 text-green-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </Badge>
              </motion.div>
            ))}

            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>System Status:</span>
                <Badge className="bg-green-500/20 text-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Optimal
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </Html>
    </group>
  )
}

function ConnectionLines({ position, color }) {
  const connections = [
    [position[0], position[1] + 1, position[2]], // Up
    [position[0] + 1, position[1], position[2]], // Right
    [position[0], position[1] - 1, position[2]], // Down
    [position[0] - 1, position[1], position[2]]  // Left
  ]

  return (
    <group>
      {connections.map((endPoint, index) => (
        <Line
          key={index}
          points={[position, endPoint]}
          color={color}
          lineWidth={1}
          transparent
          opacity={0.6}
        />
      ))}
    </group>
  )
}

const Dashboard3D = ({ user, onLogout, stats }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [notifications, setNotifications] = useState([])

  // Use the distributed computing hook
  const { networkStatus, isLoading: networkLoading } = useDistributedComputing()

  const handleNavigate = (view) => {
    setCurrentView(view)
  }

  const views = {
    dashboard: <CommandCenterView stats={stats} />,
    threats: <ThreatMatrixView stats={stats} />,
    defense: <DefenseArrayView stats={stats} />,
    network: <NetworkNexusView stats={stats} />,
    intelligence: <IntelligenceOpsView stats={stats} />,
    pii: <PIIGuardView stats={stats} />,
    analytics: <AnalyticsCoreView stats={stats} />
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 3D Command Center Canvas */}
      <div className="absolute inset-0">
        <Canvas
          shadows
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
          }}
          dpr={[1, 2]}
        >
          <CyberCommandCenter onNavigate={handleNavigate} stats={stats} />
        </Canvas>
      </div>

      {/* 2D Overlay UI */}
      <div className="relative z-10">
        {/* Top Navigation */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-black/80 backdrop-blur-md border-b border-cyan-500/20 p-4"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-6">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <Shield className="h-8 w-8 text-cyan-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Zro-Day Research Labs
                </span>
              </motion.div>

              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Command Center Active
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-right">
                  <p className="text-white font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="text-gray-400 text-sm">{user.trialDaysLeft} days trial remaining</p>
                </div>
              )}

              <Button
                variant="ghost"
                onClick={onLogout}
                className="text-gray-400 hover:text-white hover:bg-gray-800/50"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* View Content Overlay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute top-24 right-6 w-96"
          >
            {views[currentView]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating UI Controls */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-6"
      >
        <Card className="bg-black/80 backdrop-blur-md border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-cyan-400 hover:bg-cyan-500/20"
              >
                <Menu className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:bg-cyan-500/20 relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:bg-cyan-500/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Placeholder view components
const CommandCenterView = ({ stats }) => (
  <Card className="bg-black/80 backdrop-blur-md border-cyan-500/30">
    <CardHeader>
      <CardTitle className="text-cyan-400 flex items-center">
        <Shield className="w-5 h-5 mr-2" />
        Command Center Status
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-cyan-400">{stats.threatsBlocked?.toLocaleString() || '0'}</p>
          <p className="text-gray-400 text-sm">Threats Neutralized</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-400">{stats.protectionLevel || '0'}%</p>
          <p className="text-gray-400 text-sm">Protection Level</p>
        </div>
      </div>
      <Badge className="bg-green-500/20 text-green-300 w-full justify-center py-2">
        <CheckCircle className="w-4 h-4 mr-2" />
        All Systems Operational
      </Badge>
    </CardContent>
  </Card>
)

const ThreatMatrixView = ({ stats }) => (
  <Card className="bg-black/80 backdrop-blur-md border-red-500/30">
    <CardHeader>
      <CardTitle className="text-red-400 flex items-center">
        <Radar className="w-5 h-5 mr-2" />
        Threat Matrix
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-400">Global threat intelligence and attack patterns analysis.</p>
    </CardContent>
  </Card>
)

const DefenseArrayView = ({ stats }) => (
  <Card className="bg-black/80 backdrop-blur-md border-green-500/30">
    <CardHeader>
      <CardTitle className="text-green-400 flex items-center">
        <Shield className="w-5 h-5 mr-2" />
        Defense Array
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-400">Multi-layered defense systems and protection status.</p>
    </CardContent>
  </Card>
)

const NetworkNexusView = ({ stats }) => {
  const [networkData, setNetworkData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchNetworkData = async () => {
    try {
      // In a real app, this would fetch from Cloudflare Workers API
      const response = await fetch('/api/queue/status')
      const data = await response.json()
      setNetworkData(data)
    } catch (error) {
      console.error('Failed to fetch network data:', error)
      // Mock data for demonstration
      setNetworkData({
        network: {
          total_nodes: 42,
          active_nodes: 38,
          total_compute_power: 1240,
          regions: { 'us-east-1': 15, 'eu-west-1': 12, 'ap-southeast-1': 11 }
        },
        system_health: {
          network_coverage: 90,
          overall_status: 'excellent'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNetworkData()
    const interval = setInterval(fetchNetworkData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const distributeTask = async () => {
    try {
      const response = await fetch('/api/tasks/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: { type: 'threat_analysis' },
          workload: { size: 1000, priority: 'high' },
          priority: 'high'
        })
      })
      const result = await response.json()
      console.log('Task distributed:', result)
      fetchNetworkData() // Refresh data
    } catch (error) {
      console.error('Task distribution failed:', error)
    }
  }

  return (
    <Card className="bg-black/80 backdrop-blur-md border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-purple-400 flex items-center">
          <Network className="w-5 h-5 mr-2" />
          Network Nexus
        </CardTitle>
        <CardDescription>Distributed Computing Infrastructure</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Pulse className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
        ) : networkData ? (
          <>
            {/* Network Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Server className="w-5 h-5 text-purple-400 mr-2" />
                  <p className="text-2xl font-bold text-purple-400">
                    {networkData.network?.active_nodes || 0}
                  </p>
                </div>
                <p className="text-gray-400 text-xs">Active Nodes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Lightning className="w-5 h-5 text-yellow-400 mr-2" />
                  <p className="text-2xl font-bold text-yellow-400">
                    {networkData.network?.total_compute_power || 0}
                  </p>
                </div>
                <p className="text-gray-400 text-xs">Compute Power</p>
              </div>
            </div>

            {/* Regional Distribution */}
            <div>
              <h4 className="text-gray-300 text-sm font-semibold mb-2">Regional Distribution</h4>
              <div className="space-y-2">
                {networkData.network?.regions && Object.entries(networkData.network.regions).map(([region, count]) => (
                  <div key={region} className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">{region.toUpperCase()}</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${(count / networkData.network.total_nodes) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-purple-400 text-xs">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Network Coverage:</span>
                <Badge
                  className={`${
                    networkData.system_health?.network_coverage >= 90 ? 'bg-green-500/20 text-green-300' :
                    networkData.system_health?.network_coverage >= 70 ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}
                >
                  {networkData.system_health?.network_coverage || 0}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">System Status:</span>
                <Badge
                  className={`${
                    networkData.system_health?.overall_status === 'excellent' ? 'bg-green-500/20 text-green-300' :
                    networkData.system_health?.overall_status === 'good' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  {networkData.system_health?.overall_status || 'unknown'}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={distributeTask}
                  className="bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 text-purple-400"
                  size="sm"
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Distribute Task
                </Button>
                <Button
                  onClick={fetchNetworkData}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:bg-gray-800"
                >
                  <Pulse className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center py-8">Unable to load network data</p>
        )}
      </CardContent>
    </Card>
  )
}

const IntelligenceOpsView = ({ stats }) => (
  <Card className="bg-black/80 backdrop-blur-md border-yellow-500/30">
    <CardHeader>
      <CardTitle className="text-yellow-400 flex items-center">
        <Brain className="w-5 h-5 mr-2" />
        Intelligence Ops
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-400">AI-powered threat intelligence and pattern recognition.</p>
    </CardContent>
  </Card>
)

const PIIGuardView = ({ stats }) => (
  <Card className="bg-black/80 backdrop-blur-md border-pink-500/30">
    <CardHeader>
      <CardTitle className="text-pink-400 flex items-center">
        <Eye className="w-5 h-5 mr-2" />
        PII Guard
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-400">Automated PII removal and data protection services.</p>
    </CardContent>
  </Card>
)

const AnalyticsCoreView = ({ stats }) => (
  <Card className="bg-black/80 backdrop-blur-md border-gray-500/30">
    <CardHeader>
      <CardTitle className="text-gray-400 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Analytics Core
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-400">Advanced analytics and threat prediction systems.</p>
    </CardContent>
  </Card>
)

export default Dashboard3D
