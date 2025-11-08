import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Search
} from 'lucide-react'
import ThreatGlobe from './ThreatGlobe'
import SecuritySettings from './SecuritySettings'
import PIIManagement from './PIIManagement'
import SubscriptionManagement from './SubscriptionManagement'

const Dashboard = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [realTimeStats, setRealTimeStats] = useState({
    threatsBlocked: 1247893,
    activeSessions: 12,
    protectionLevel: 98,
    lastScan: new Date()
  })
  
  const location = useLocation()

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 5) + 1,
        activeSessions: Math.max(1, prev.activeSessions + Math.floor(Math.random() * 3) - 1),
        protectionLevel: Math.min(100, prev.protectionLevel + (Math.random() - 0.5) * 2),
        lastScan: new Date()
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const sidebarItems = [
    { icon: Activity, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: Globe, label: 'Threat Map', path: '/dashboard/threats' },
    { icon: Shield, label: 'Protection', path: '/dashboard/protection' },
    { icon: Eye, label: 'PII Removal', path: '/dashboard/pii' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    { icon: CreditCard, label: 'Subscription', path: '/dashboard/subscription' },
    { icon: FileText, label: 'Reports', path: '/dashboard/reports' },
  ]

  const quickStats = [
    {
      title: "Threats Blocked Today",
      value: realTimeStats.threatsBlocked.toLocaleString(),
      change: "+12.5%",
      icon: Shield,
      color: "text-red-400",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Active Protection",
      value: `${realTimeStats.protectionLevel.toFixed(1)}%`,
      change: "+0.3%",
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Devices Protected",
      value: realTimeStats.activeSessions.toString(),
      change: "No change",
      icon: Smartphone,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "PII Records Removed",
      value: "847",
      change: "+23",
      icon: Eye,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    }
  ]

  const recentThreats = [
    {
      id: 1,
      type: "Pegasus Variant",
      severity: "Critical",
      source: "SMS Message",
      blocked: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
      id: 2,
      type: "Phishing Attempt",
      severity: "High",
      source: "Email Link",
      blocked: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      id: 3,
      type: "Malicious Script",
      severity: "Medium",
      source: "Web Browser",
      blocked: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 120)
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed left-0 top-0 h-full w-64 bg-black/40 backdrop-blur-md border-r border-gray-700 z-40"
      >
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <Shield className="h-8 w-8 text-cyan-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Zro-Day Labs
            </span>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
            <div className="text-sm text-gray-300 mb-2">Trial Status</div>
            <div className="text-lg font-bold text-cyan-400 mb-2">
              {user.trialDaysLeft} days left
            </div>
            <Button size="sm" className="w-full bg-gradient-to-r from-cyan-500 to-purple-500">
              Upgrade Now
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-14'}`}>
        {/* Top Bar */}
        <div className="bg-black/20 backdrop-blur-md border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {user.firstName}
                </h1>
                <p className="text-gray-400">
                  Your digital fortress is active and protecting you
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<DashboardHome quickStats={quickStats} recentThreats={recentThreats} realTimeStats={realTimeStats} />} />
            <Route path="/threats" element={<ThreatMapView />} />
            <Route path="/protection" element={<ProtectionView />} />
            <Route path="/pii" element={<PIIManagement />} />
            <Route path="/settings" element={<SecuritySettings />} />
            <Route path="/subscription" element={<SubscriptionManagement user={user} />} />
            <Route path="/reports" element={<ReportsView />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

// Dashboard Home Component
const DashboardHome = ({ quickStats, recentThreats, realTimeStats }) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className={`text-sm ${stat.change.includes('+') ? 'text-green-400' : 'text-gray-400'}`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Threat Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-black/40 backdrop-blur-sm border-gray-700 h-96">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="h-5 w-5 mr-2 text-cyan-400" />
                Real-Time Threat Intelligence
              </CardTitle>
              <CardDescription className="text-gray-400">
                Live visualization of global cyber threats and attack vectors
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ThreatGlobe />
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Threats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-black/40 backdrop-blur-sm border-gray-700 h-96">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                Recent Threats Blocked
              </CardTitle>
              <CardDescription className="text-gray-400">
                Latest security incidents prevented by Zro-Day protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentThreats.map((threat, index) => (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      threat.severity === 'Critical' ? 'bg-red-500' :
                      threat.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-white font-medium">{threat.type}</p>
                      <p className="text-gray-400 text-sm">{threat.source}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-1">
                      Blocked
                    </Badge>
                    <p className="text-gray-400 text-xs">
                      {threat.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Protection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-400" />
              Protection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">iOS Protection</span>
                  <span className="text-green-400">Active</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Browser Watchdog</span>
                  <span className="text-green-400">Active</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">PII Removal</span>
                  <span className="text-blue-400">Running</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Placeholder components for other views
const ThreatMapView = () => (
  <div className="space-y-6">
    <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Global Threat Map</CardTitle>
        <CardDescription className="text-gray-400">
          Real-time visualization of cyber threats worldwide
        </CardDescription>
      </CardHeader>
      <CardContent className="h-96">
        <ThreatGlobe fullscreen />
      </CardContent>
    </Card>
  </div>
)

const ProtectionView = () => (
  <div className="space-y-6">
    <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Protection Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">Protection settings and status will be displayed here.</p>
      </CardContent>
    </Card>
  </div>
)

const ReportsView = () => (
  <div className="space-y-6">
    <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Security Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">Detailed security reports and analytics will be displayed here.</p>
      </CardContent>
    </Card>
  </div>
)

export default Dashboard
