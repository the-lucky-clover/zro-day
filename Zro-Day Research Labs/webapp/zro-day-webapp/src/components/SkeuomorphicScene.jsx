import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text, Sphere, Box, Torus, Float, Text3D } from '@react-three/drei'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

function ThreatGlobe() {
  const globeRef = useRef()
  const [threatData, setThreatData] = useState([])

  // Generate mock threat data with realistic geographical distribution
  const generateThreats = () => {
    const threats = []
    const locations = [
      { lat: 40.7128, lng: -74.0060, city: "New York", severity: "high" }, // NY
      { lat: 51.5074, lng: -0.1278, city: "London", severity: "critical" }, // London
      { lat: 35.6762, lng: 139.6503, city: "Tokyo", severity: "high" }, // Tokyo
      { lat: 55.7558, lng: 37.6176, city: "Moscow", severity: "critical" }, // Moscow
      { lat: 39.9042, lng: 116.4074, city: "Beijing", severity: "critical" }, // Beijing
      { lat: 19.4326, lng: -99.1332, city: "Mexico City", severity: "medium" }, // Mexico City
      { lat: -33.8688, lng: 151.2093, city: "Sydney", severity: "high" }, // Sydney
      { lat: 52.5200, lng: 13.4050, city: "Berlin", severity: "medium" }, // Berlin
    ]

    locations.forEach((location, index) => {
      const phi = (90 - location.lat) * (Math.PI / 180)
      const theta = (location.lng + 180) * (Math.PI / 180)

      threats.push({
        id: index,
        position: [
          Math.sin(phi) * Math.cos(theta) * 2.2,
          Math.cos(phi) * 2.2,
          Math.sin(phi) * Math.sin(theta) * 2.2
        ],
        city: location.city,
        severity: location.severity,
        active: Math.random() > 0.7,
        pulse: Math.random() * Math.PI * 2
      })
    })

    setThreatData(threats)
  }

  useEffect(() => {
    generateThreats()
    const interval = setInterval(() => {
      setThreatData(prev =>
        prev.map(threat => ({
          ...threat,
          active: Math.random() > 0.8,
          pulse: threat.pulse + 0.1
        }))
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002
    }
  })

  const severityColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  }

  return (
    <group>
      {/* Main Globe */}
      <Sphere ref={globeRef} args={[2, 64, 64]} position={[0, 0, 0]}>
        <meshPhongMaterial
          color="#1a1a2e"
          transparent
          opacity={0.9}
          emissive="#0f1629"
          shininess={100}
        />
      </Sphere>

      {/* Grid lines */}
      <Sphere args={[2.01, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.1}
          wireframe
        />
      </Sphere>

      {/* Threat markers */}
      {threatData.map(threat => (
        <ThreatMarker
          key={threat.id}
          position={threat.position}
          city={threat.city}
          severity={threat.severity}
          active={threat.active}
          pulse={threat.pulse}
          color={severityColors[threat.severity]}
        />
      ))}

      {/* Atmospheric glow */}
      <Sphere args={[2.5, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  )
}

function ThreatMarker({ position, active, pulse, color }) {
  const markerRef = useRef()

  useFrame((state) => {
    if (markerRef.current && active) {
      markerRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3 + pulse) * 0.3)
      markerRef.current.rotation.y = state.clock.elapsedTime
    }
  })

  return (
    <group position={position} ref={markerRef}>
      {/* Outer glow */}
      <Sphere args={[0.08, 8, 8]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.8 : 0.3}
        />
      </Sphere>

      {/* Inner bright spot */}
      <Sphere args={[0.04, 8, 8]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={active ? 1 : 0.5}
        />
      </Sphere>

      {/* Activity indicator */}
      {active && (
        <Torus args={[0.12, 0.01, 8, 16]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </Torus>
      )}
    </group>
  )
}

function RotatingCubes() {
  const cubesRef = useRef()

  useFrame((state) => {
    if (cubesRef.current) {
      cubesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      cubesRef.current.rotation.y += 0.01
    }
  })

  return (
    <group ref={cubesRef}>
      {/* Array of floating cubes representing distributed computing nodes */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 4
        const height = Math.sin(i * 0.5) * 2

        return (
          <Float key={i} speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <Box
              position={[
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
              ]}
              args={[0.1, 0.1, 0.1]}
            >
              <meshPhongMaterial
                color="#00d4ff"
                emissive="#003d4d"
                shininess={100}
                transparent
                opacity={0.8}
              />
            </Box>
          </Float>
        )
      })}
    </group>
  )
}

function SkeuomorphicCard({ position, scale = [1, 1, 1] }) {
  const cardRef = useRef()

  return (
    <group position={position} scale={scale} ref={cardRef}>
      {/* Card base */}
      <Box args={[1, 0.6, 0.05]}>
        <meshPhongMaterial
          color="#1a1a1a"
          emissive="#0a0a0a"
          shininess={100}
        />
      </Box>

      {/* Beveled edges */}
      <Box args={[0.95, 0.55, 0.08]} position={[0, 0, 0.015]}>
        <meshPhongMaterial
          color="#2a2a2a"
          emissive="#1a1a1a"
          shininess={200}
        />
      </Box>

      {/* Content area */}
      <Box args={[0.9, 0.5, 0.02]} position={[0, 0, 0.05]}>
        <meshPhongMaterial
          color="#000000"
          transparent
          opacity={0.9}
        />
      </Box>
    </group>
  )
}

function Scene() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, 8)
  }, [camera])

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00d4ff" />

      <ThreatGlobe />
      <RotatingCubes />

      {/* Title */}
      <Text3D
        position={[-3, 3, 0]}
        font="/fonts/inter-bold.json"
        size={0.3}
        height={0.01}
        bevelEnabled
        bevelThickness={0.01}
        bevelSize={0.01}
        bevelOffset={0}
        bevelSegments={5}
      >
        {'SOC-at-PHONE\n3D COMMAND CENTER'}
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#003d4d"
          emissiveIntensity={0.2}
        />
      </Text3D>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

export default function SkeuomorphicScene({ className = "" }) {
  return (
    <div className={`w-full h-screen ${className}`}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
