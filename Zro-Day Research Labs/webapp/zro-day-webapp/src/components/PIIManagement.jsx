import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Trash2, 
  RefreshCw, 
  Download,
  Plus,
  X,
  Database,
  Globe,
  Users,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react'

const PIIManagement = () => {
  const [enrollmentStatus, setEnrollmentStatus] = useState({
    isEnrolled: true,
    enrollmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    totalRemovals: 847,
    activeBrokers: 156,
    pendingRemovals: 23
  })

  const [userPII, setUserPII] = useState({
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-15',
    email: 'john.doe@email.com',
    phone: '+1-555-0123',
    addresses: [
      '123 Main St, Anytown, CA 90210',
      '456 Oak Ave, Another City, NY 10001'
    ],
    additionalEmails: [
      'j.doe@work.com',
      'johndoe@personal.net'
    ]
  })

  const [compromisedData, setCompromisedData] = useState([
    {
      id: 1,
      type: 'Email',
      value: 'john.doe@email.com',
      source: 'Marketing Database X',
      dateFound: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'removed',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'Full Name + Address',
      value: 'John Doe, 123 Main St...',
      source: 'Public Records Site Y',
      dateFound: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      status: 'pending',
      severity: 'high'
    },
    {
      id: 3,
      type: 'Phone Number',
      value: '+1-555-0123',
      source: 'Data Broker Z',
      dateFound: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      status: 'removed',
      severity: 'low'
    }
  ])

  const [dataBrokers] = useState([
    // Industry Leaders - Marketing & Advertising Data Brokers
    { id: 1, name: 'Acxiom', category: 'Marketing Data', status: 'removed', lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recordsFound: 12, difficulty: 'hard' },
    { id: 2, name: 'Epsilon', category: 'Marketing Data', status: 'removed', lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recordsFound: 8, difficulty: 'medium' },
    { id: 3, name: 'Oracle Data Cloud', category: 'Marketing Data', status: 'in_progress', lastChecked: new Date(), recordsFound: 15, difficulty: 'hard' },
    { id: 4, name: 'Salesforce Marketing Cloud', category: 'Marketing Data', status: 'pending', lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recordsFound: 9, difficulty: 'hard' },
    { id: 5, name: 'LiveRamp', category: 'Data Matching', status: 'removed', lastChecked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), recordsFound: 11, difficulty: 'medium' },

    // People Search & Background Check Services
    { id: 6, name: 'Spokeo', category: 'People Search', status: 'removed', lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recordsFound: 6, difficulty: 'easy' },
    { id: 7, name: 'BeenVerified', category: 'Background Check', status: 'removed', lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recordsFound: 4, difficulty: 'easy' },
    { id: 8, name: 'Intelius', category: 'People Search', status: 'pending', lastChecked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), recordsFound: 7, difficulty: 'medium' },
    { id: 9, name: 'CheckPeople', category: 'Background Check', status: 'removed', lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recordsFound: 3, difficulty: 'easy' },
    { id: 10, name: 'ZabaSearch', category: 'Public Records', status: 'in_progress', lastChecked: new Date(), recordsFound: 5, difficulty: 'medium' },

    // Public Records & Government Data Aggregators
    { id: 11, name: 'LexisNexis', category: 'Public Records', status: 'pending', lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), recordsFound: 14, difficulty: 'hard' },
    { id: 12, name: 'Thomson Reuters CLEAR', category: 'Public Records', status: 'removed', lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recordsFound: 9, difficulty: 'hard' },
    { id: 13, name: 'TransUnion', category: 'Financial Data', status: 'in_progress', lastChecked: new Date(), recordsFound: 12, difficulty: 'hard' },
    { id: 14, name: 'Experian', category: 'Financial Data', status: 'pending', lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recordsFound: 11, difficulty: 'hard' },
    { id: 15, name: 'Equifax', category: 'Financial Data', status: 'removed', lastChecked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), recordsFound: 10, difficulty: 'hard' },

    // Industry Professionals Email & Business Contact Databases
    { id: 16, name: 'ZoomInfo', category: 'Business Contact', status: 'removed', lastChecked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), recordsFound: 8, difficulty: 'medium' },
    { id: 17, name: 'DiscoverOrg', category: 'Business Contact', status: 'in_progress', lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recordsFound: 13, difficulty: 'hard' },
    { id: 18, name: 'LeadIQ', category: 'Business Contact', status: 'pending', lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recordsFound: 5, difficulty: 'easy' },
    { id: 19, name: 'RocketReach', category: 'Professional Email', status: 'removed', lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recordsFound: 6, difficulty: 'easy' },
    { id: 20, name: 'Hunter.io', category: 'Email Lookup', status: 'pending', lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recordsFound: 4, difficulty: 'easy' },

    // Telephone & Communications Data Brokers
    { id: 21, name: 'Whitepages', category: 'Phone Directory', status: 'removed', lastChecked: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), recordsFound: 7, difficulty: 'medium' },
    { id: 22, name: 'AnyWho', category: 'Phone Directory', status: 'pending', lastChecked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), recordsFound: 3, difficulty: 'easy' },
    { id: 23, name: 'Truecaller', category: 'Phone Directory', status: 'in_progress', lastChecked: new Date(), recordsFound: 9, difficulty: 'medium' },
    { id: 24, name: 'CallApp', category: 'Phone Directory', status: 'pending', lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recordsFound: 4, difficulty: 'easy' },

    // Social Media & Online Presence Aggregators
    { id: 25, name: 'Pipl', category: 'Online Identity', status: 'removed', lastChecked: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), recordsFound: 16, difficulty: 'hard' },
    { id: 26, name: 'PeekYou', category: 'Online Identity', status: 'pending', lastChecked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), recordsFound: 11, difficulty: 'medium' },
    { id: 27, name: 'Yasni', category: 'Online Identity', status: 'removed', lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recordsFound: 6, difficulty: 'medium' },

    // Specialty Data Brokers (Health, Financial, etc.)
    { id: 28, name: 'Healthgrades', category: 'Healthcare Data', status: 'in_progress', lastChecked: new Date(), recordsFound: 8, difficulty: 'hard' },
    { id: 29, name: 'RateMDs', category: 'Healthcare Reviews', status: 'pending', lastChecked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), recordsFound: 2, difficulty: 'easy' },
    { id: 30, name: 'Vitals', category: 'Healthcare Data', status: 'removed', lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), recordsFound: 5, difficulty: 'medium' },

    // Real Estate & Property Data
    { id: 31, name: 'Zillow', category: 'Real Estate', status: 'removed', lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recordsFound: 4, difficulty: 'easy' },
    { id: 32, name: 'Trulia', category: 'Real Estate', status: 'pending', lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recordsFound: 3, difficulty: 'easy' },
    { id: 33, name: 'Realtor.com', category: 'Real Estate', status: 'in_progress', lastChecked: new Date(), recordsFound: 6, difficulty: 'medium' },

    // Court Records & Legal Databases
    { id: 34, name: 'PACER', category: 'Court Records', status: 'pending', lastChecked: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), recordsFound: 7, difficulty: 'hard' },
    { id: 35, name: 'UniCourt', category: 'Court Records', status: 'removed', lastChecked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), recordsFound: 2, difficulty: 'easy' },

    // International Data Brokers (Global Coverage)
    { id: 36, name: 'Melissa Data', category: 'Global Data', status: 'in_progress', lastChecked: new Date(), recordsFound: 13, difficulty: 'hard' },
    { id: 37, name: 'Bureau van Dijk', category: 'Business Intelligence', status: 'pending', lastChecked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), recordsFound: 9, difficulty: 'hard' },
    { id: 38, name: 'Kompass', category: 'Business Directory', status: 'removed', lastChecked: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), recordsFound: 11, difficulty: 'medium' },

    // Data Analytics & Enrichment Services
    { id: 39, name: 'Cognism', category: 'B2B Data', status: 'in_progress', lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recordsFound: 8, difficulty: 'hard' },
    { id: 40, name: 'Seamless.AI', category: 'Sales Intelligence', status: 'pending', lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recordsFound: 6, difficulty: 'medium' },

    // Specialized Financial Data Services
    { id: 41, name: 'CoreLogic', category: 'Property Data', status: 'removed', lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recordsFound: 7, difficulty: 'hard' },
    { id: 42, name: 'Black Knight', category: 'Mortgage Data', status: 'pending', lastChecked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), recordsFound: 8, difficulty: 'hard' },

    // Education & Alumni Data
    { id: 43, name: 'Alumni.net', category: 'Education Alumni', status: 'in_progress', lastChecked: new Date(), recordsFound: 3, difficulty: 'easy' },
    { id: 44, name: 'Classmates.com', category: 'Education Alumni', status: 'removed', lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recordsFound: 2, difficulty: 'easy' },

    // Vehicle & Automotive Data
    { id: 45, name: 'AutoCheck', category: 'Vehicle History', status: 'pending', lastChecked: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), recordsFound: 4, difficulty: 'medium' },
    { id: 46, name: 'Carfax', category: 'Vehicle History', status: 'removed', lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recordsFound: 3, difficulty: 'easy' },

    // Digital Marketing & Advertising Networks
    { id: 47, name: 'The Trade Desk', category: 'Advertising Data', status: 'in_progress', lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recordsFound: 12, difficulty: 'hard' },
    { id: 48, name: 'Criteo', category: 'Advertising Data', status: 'pending', lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recordsFound: 10, difficulty: 'hard' },
    { id: 49, name: 'AppNexus', category: 'Advertising Data', status: 'removed', lastChecked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), recordsFound: 9, difficulty: 'hard' },

    // International Phone & Address Directories
    { id: 50, name: '411.com', category: 'Phone Directory', status: 'pending', lastChecked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), recordsFound: 3, difficulty: 'easy' },

    // Advanced - Legal & Compliance Data Services
    { id: 51, name: 'Hoovers', category: 'Business Intelligence', status: 'in_progress', lastChecked: new Date(), recordsFound: 11, difficulty: 'hard' },

    // Industry-Specific Aggregators
    { id: 52, name: 'Manta', category: 'Business Directory', status: 'removed', lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), recordsFound: 6, difficulty: 'medium' },

    // Social Media Data Mining Services
    { id: 53, name: 'FullContact', category: 'Contact Enrichment', status: 'pending', lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recordsFound: 8, difficulty: 'medium' },

    // Advanced People Search Engines
    { id: 54, name: 'FastPeopleSearch', category: 'People Search', status: 'removed', lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recordsFound: 4, difficulty: 'easy' },

    // Legal Document Databases
    { id: 55, name: 'Westlaw', category: 'Legal Database', status: 'in_progress', lastChecked: new Date(), recordsFound: 5, difficulty: 'hard' },

    // Academic & Research Databases
    { id: 56, name: 'ProQuest', category: 'Research Database', status: 'pending', lastChecked: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), recordsFound: 2, difficulty: 'medium' }
  ])

  const [isScanning, setIsScanning] = useState(false)
  const [newEmail, setNewEmail] = useState('')

  const handleStartScan = async () => {
    setIsScanning(true)
    
    // Simulate scanning process
    setTimeout(() => {
      // Add some new compromised data
      const newData = {
        id: Date.now(),
        type: 'Email',
        value: userPII.email,
        source: 'New Data Broker Found',
        dateFound: new Date(),
        status: 'pending',
        severity: 'medium'
      }
      
      setCompromisedData(prev => [newData, ...prev])
      setEnrollmentStatus(prev => ({
        ...prev,
        pendingRemovals: prev.pendingRemovals + 1
      }))
      
      setIsScanning(false)
    }, 3000)
  }

  const handleRemoveData = async (dataId) => {
    // Simulate removal process
    setCompromisedData(prev => 
      prev.map(item => 
        item.id === dataId 
          ? { ...item, status: 'in_progress' }
          : item
      )
    )

    setTimeout(() => {
      setCompromisedData(prev => 
        prev.map(item => 
          item.id === dataId 
            ? { ...item, status: 'removed' }
            : item
        )
      )
      
      setEnrollmentStatus(prev => ({
        ...prev,
        totalRemovals: prev.totalRemovals + 1,
        pendingRemovals: Math.max(0, prev.pendingRemovals - 1)
      }))
    }, 2000)
  }

  const handleAddEmail = () => {
    if (newEmail && !userPII.additionalEmails.includes(newEmail)) {
      setUserPII(prev => ({
        ...prev,
        additionalEmails: [...prev.additionalEmails, newEmail]
      }))
      setNewEmail('')
    }
  }

  const handleRemoveEmail = (email) => {
    setUserPII(prev => ({
      ...prev,
      additionalEmails: prev.additionalEmails.filter(e => e !== email)
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'removed': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'in_progress': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-orange-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* PII Management Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">PII Removal Management</h1>
            <p className="text-gray-400">
              Automated removal of your personal information from data brokers and public databases
            </p>
          </div>
          <Button
            onClick={handleStartScan}
            disabled={isScanning}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isScanning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {isScanning ? 'Scanning...' : 'Scan for New Data'}
          </Button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Removals</p>
                  <p className="text-2xl font-bold text-green-400">{enrollmentStatus.totalRemovals}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active Brokers</p>
                  <p className="text-2xl font-bold text-blue-400">{enrollmentStatus.activeBrokers}</p>
                </div>
                <Database className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Pending Removals</p>
                  <p className="text-2xl font-bold text-yellow-400">{enrollmentStatus.pendingRemovals}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Protection Score</p>
                  <p className="text-2xl font-bold text-purple-400">94%</p>
                </div>
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="text-gray-300 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="compromised" className="text-gray-300 data-[state=active]:text-white">
            Compromised Data
          </TabsTrigger>
          <TabsTrigger value="brokers" className="text-gray-300 data-[state=active]:text-white">
            Data Brokers
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-gray-300 data-[state=active]:text-white">
            PII Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-400" />
                  Removal Progress
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI agents are continuously working to remove your data from {enrollmentStatus.activeBrokers} data brokers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Overall Progress</span>
                    <span className="text-white">94% Complete</span>
                  </div>
                  <Progress value={94} className="h-3" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">847</div>
                      <div className="text-sm text-gray-400">Records Removed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">23</div>
                      <div className="text-sm text-gray-400">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">156</div>
                      <div className="text-sm text-gray-400">Brokers Monitored</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-cyan-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Removed from Acxiom', time: '2 hours ago', status: 'success' },
                    { action: 'Submitted removal to LexisNexis', time: '6 hours ago', status: 'pending' },
                    { action: 'Found new records on Spokeo', time: '1 day ago', status: 'info' },
                    { action: 'Completed removal from BeenVerified', time: '2 days ago', status: 'success' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-white">{activity.action}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Compromised Data Tab */}
        <TabsContent value="compromised" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                  Compromised Data Found
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Personal information found on data broker websites and public databases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compromisedData.map((data, index) => (
                    <motion.div
                      key={data.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${getSeverityColor(data.severity)}`} />
                        <div>
                          <p className="text-white font-medium">{data.type}</p>
                          <p className="text-gray-400 text-sm">{data.value}</p>
                          <p className="text-gray-500 text-xs">Found on: {data.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(data.status)}>
                          {data.status.replace('_', ' ')}
                        </Badge>
                        {data.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleRemoveData(data.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Data Brokers Tab */}
        <TabsContent value="brokers" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-400" />
                  Monitored Data Brokers
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Status of removal requests across major data broker platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataBrokers.map((broker, index) => (
                    <motion.div
                      key={broker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Globe className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{broker.name}</p>
                          <p className="text-gray-400 text-sm">{broker.category}</p>
                          <p className="text-gray-500 text-xs">
                            Last checked: {broker.lastChecked.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={getStatusColor(broker.status)}>
                            {broker.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-gray-400 text-xs mt-1">
                            {broker.recordsFound} records found
                          </p>
                        </div>
                        <Badge variant="outline" className={`
                          ${broker.difficulty === 'easy' ? 'border-green-500 text-green-400' :
                            broker.difficulty === 'medium' ? 'border-yellow-500 text-yellow-400' :
                            'border-red-500 text-red-400'}
                        `}>
                          {broker.difficulty}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* PII Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-400" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage the personal information we monitor and remove
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">First Name</Label>
                    <Input
                      value={userPII.firstName}
                      onChange={(e) => setUserPII(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Last Name</Label>
                    <Input
                      value={userPII.lastName}
                      onChange={(e) => setUserPII(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Date of Birth</Label>
                    <Input
                      type="date"
                      value={userPII.dateOfBirth}
                      onChange={(e) => setUserPII(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Phone Number</Label>
                    <Input
                      value={userPII.phone}
                      onChange={(e) => setUserPII(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-gray-300">Email Addresses</Label>
                  <div className="space-y-2">
                    {userPII.additionalEmails.map((email, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={email}
                          readOnly
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveEmail(email)}
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Add new email address"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddEmail}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update PII Information
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PIIManagement
