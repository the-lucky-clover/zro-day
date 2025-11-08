import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text, Sphere, Box, Torus, Float, Text3D, Html } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Zap,
  Globe,
  Eye,
  Lock,
  Smartphone,
  Monitor,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Network,
  Brain,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react'

function FloatingElements() {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {/* Security Shields */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 6
        const height = Math.sin(i * 0.75) * 3

        return (
          <Float key={i} speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
            <Shield3D
              position={[
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
              ]}
              rotation={[0, angle + Math.PI / 2, 0]}
            />
          </Float>
        )
      })}

      {/* Data particles */}
      {Array.from({ length: 30 }, (_, i) => {
        const phi = Math.random() * Math.PI * 2
        const theta = Math.random() * Math.PI
        const radius = Math.random() * 8 + 3

        return (
          <Float key={`particle-${i}`} speed={0.5} rotationIntensity={2} floatIntensity={1}>
            <Sphere
              position={[
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
              ]}
              args={[0.05]}
            >
              <meshPhongMaterial
                color="#00d4ff"
                emissive="#003d4d"
                transparent
                opacity={0.8}
              />
            </Sphere>
          </Float>
        )
      })}
    </group>
  )
}

function Shield3D({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <Box args={[1, 1.5, 0.1]}>
        <meshPhongMaterial
          color="#1a365d"
          emissive="#0f1629"
          shininess={200}
        />
      </Box>

      <Box args={[0.9, 1.3, 0.12]} position={[0, 0, 0.01]}>
        <meshPhongMaterial
          color="#2d3748"
          emissive="#1a202c"
          shininess={300}
        />
      </Box>

      {/* Cyber imagery */}
      <Box args={[0.2, 0.3, 0.02]} position={[0, 0.3, 0.06]}>
        <meshBasicMaterial color="#00d4ff" />
      </Box>
    </group>
  )
}

function HeroSection3D({ onShowAuth }) {
  const textRef = useRef()

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })

  return (
    <group position={[0, 0, 0]} ref={textRef}>
      {/* Main Hero Text */}
      <Text3D
        position={[-3, 2, 0]}
        font="/fonts/inter-bold.json"
        size={0.4}
        height={0.02}
        bevelEnabled
        bevelThickness={0.005}
        bevelSize={0.005}
        bevelOffset={0}
        bevelSegments={5}
      >
        {'DIGITAL\nTYRANNY'}
        <meshStandardMaterial
          color="#ff6b6b"
          emissive="#4a1f1f"
          emissiveIntensity={0.1}
        />
      </Text3D>

      <Text3D
        position={[-3, 0.5, 0]}
        font="/fonts/inter-bold.json"
        size={0.3}
        height={0.02}
        bevelEnabled
        bevelThickness={0.005}
        bevelSize={0.005}
      >
        {'ENDS HERE'}
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#003d4d"
        />
      </Text3D>

      <Text3D
        position={[-2.5, -1, 0]}
        font="/fonts/inter-regular.json"
        size={0.1}
        height={0.01}
      >
        {'WORLD\'S FIRST SOC-at-PHONE\nPowered by Distributed Computing'}
        <meshBasicMaterial color="#ffffff" />
      </Text3D>

      {/* Interactive CTA Button */}
      <group position={[0, -2.5, 0]}>
        <Box args={[2, 0.5, 0.1]}>
          <meshPhongMaterial
            color="#00d4ff"
            emissive="#003d4d"
            shininess={100}
          />
        </Box>
        <Html position={[0, 0, 0.06]} center>
          <Button
            onClick={onShowAuth}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
          >
            <Shield className="w-4 h-4 mr-2" />
            ENTER SECURE ZONE
          </Button>
        </Html>
      </group>

      {/* Animated threat indicators */}
      <group position={[3, 0, 0]}>
        <AlertTriangle3D position={[0, 1, 0]} />
        <AlertTriangle3D position={[0.5, 0.5, 0]} />
        <AlertTriangle3D position={[-0.5, 0.5, 0]} />
      </group>
    </group>
  )
}

function AlertTriangle3D({ position }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })

  return (
    <group position={position} ref={meshRef}>
      <Box args={[0.1, 0.15, 0.02]}>
        <meshBasicMaterial color="#ef4444" />
      </Box>
    </group>
  )
}

function StatsGlobe() {
  const globeRef = useRef()
  const [stats, setStats] = useState({
    threats: 1247893,
    users: 89432,
    accuracy: 99.97
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        threats: prev.threats + Math.floor(Math.random() * 5) + 1,
        users: prev.users + Math.floor(Math.random() * 3),
        accuracy: 99.97
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.005
    }
  })

  return (
    <group position={[4, 0, 0]}>
      <Sphere ref={globeRef} args={[1.5, 32, 32]}>
        <meshPhongMaterial
          color="#1a1a2e"
          transparent
          opacity={0.8}
          emissive="#0f1629"
        />
      </Sphere>

      {/* Stats labels in 3D space */}
      <Html position={[0, 2.2, 0]} center>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{stats.threats.toLocaleString()}</div>
          <div className="text-gray-300">Threats Blocked Today</div>
        </div>
      </Html>

      <Html position={[-2, -0.5, 1.6]} center>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.users.toLocaleString()}</div>
          <div className="text-gray-300">Protected Users</div>
        </div>
      </Html>

      <Html position={[2, -0.5, 1.6]} center>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.accuracy}%</div>
          <div className="text-gray-300">Detection Accuracy</div>
        </div>
      </Html>
    </group>
  )
}

function Scene({ onShowAuth, showThreatGlobe = false }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, 8)
  }, [camera])

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.8} color="#00d4ff" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        color="#ff6b6b"
        castShadow
      />

      <FloatingElements />
      <HeroSection3D onShowAuth={onShowAuth} />

      {showThreatGlobe && <StatsGlobe />}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

export default function LandingPage3D({ onShowAuth }) {
  const [showThreatGlobe, setShowThreatGlobe] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowThreatGlobe(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        className="absolute inset-0"
      >
        <Scene onShowAuth={onShowAuth} showThreatGlobe={showThreatGlobe} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 backdrop-blur-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Active Sentinel Mode
          </Badge>
        </motion.div>
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="backdrop-blur-sm bg-black/30 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center space-x-2 text-cyan-400">
            <Play className="w-4 h-4" />
            <span className="text-sm">Real-time Protection Active</span>
          </div>
        </motion.div>
      </div>

      {/* Navigation Overlay */}
      <motion.nav
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-[50vw] max-w-2xl min-w-[400px] h-16 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl flex items-center justify-between px-6">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Shield className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Zro-Day Research Labs
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:text-cyan-400 hover:bg-white/10">
              Features
            </Button>
            <Button variant="ghost" className="text-white hover:text-cyan-400 hover:bg-white/10">
              Intelligence
            </Button>
            <Button
              onClick={onShowAuth}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-lg"
            >
              Enter Command Center
            </Button>
          </div>
        </div>
      </motion.nav>
    </div>
  )
}
