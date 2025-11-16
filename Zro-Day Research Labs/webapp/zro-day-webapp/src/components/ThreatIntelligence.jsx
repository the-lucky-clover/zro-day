import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Brain,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  Zap,
  Eye,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  Network,
  Database,
  Globe,
  Smartphone,
  Monitor,
  AlertOctagon
} from 'lucide-react'

const ThreatIntelligence = () => {
  const [aiStatus, setAiStatus] = useState({
    isActive: true,
    confidenceLevel: 92.4,
    processingSpeed: 1247, // threats per minute
    lastAnalysis: new Date(),
    mlModelsActive: 12,
    nodeContributions: 847,
    falsePositives: 0.02
  })

  const [realTimeAnomalies, setRealTimeAnomalies] = useState([
    {
      id: 1,
      type: 'Zero-Click Patterns',
      description: 'NSO Group Pegasus signature detected',
      severity: 'critical',
      confidence: 94.7,
      detectedAt: new Date(Date.now() - 30000), // 30 seconds ago
      source: 'iMessage Process',
      status: 'escalated',
      location: 'lat: 40.7128, lng: -74.0060'
    },
    {
      id: 2,
      type: 'Memory Forgery',
      description: 'Granite framework memory manipulation attempt',
      severity: 'high',
      confidence: 87.3,
      detectedAt: new Date(Date.now() - 120000), // 2 minutes ago
      source: 'System Services',
      status: 'blocked',
      location: 'lat: 51.5074, lng: -0.1278'
    },
    {
      id: 3,
      type: 'Sandbox Evasion',
      description: 'Advanced jailbreak detection bypass detected',
      severity: 'medium',
      confidence: 76.1,
      detectedAt: new Date(Date.now() - 300000), // 5 minutes ago
      source: 'App Store Install',
      status: 'monitoring',
      location: 'lat: 35.6762, lng: 139.6503'
    }
  ])

  const [mlModels, setMlModels] = useState([
    {
      name: 'Zero-Click Detector',
      type: 'Deep Neural Network',
      accuracy: 96.3,
      falsePositive: 0.1,
      target: 'NSO Group Pegasus',
      lastUpdate: new Date(Date.now() - 86400000), // 1 day ago
      status: 'active'
    },
    {
      name: 'Memory Analysis Engine',
      type: 'Anomaly Detection',
      accuracy: 89.7,
      falsePositive: 1.2,
      target: 'Granite Framework',
      lastUpdate: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'active'
    },
    {
      name: 'Network Traffic Analyzer',
      type: 'LSTM Model',
      accuracy: 93.5,
      falsePositive: 0.8,
      target: 'Watering Hole Attacks',
      lastUpdate: new Date(Date.now() - 7200000), // 2 hours ago
      status: 'training'
    },
    {
      name: 'Behavioral Pattern Recognition',
      type: 'Reinforcement Learning',
      accuracy: 91.2,
      falsePositive: 0.5,
      target: 'Supply Chain Attacks',
      lastUpdate: new Date(Date.now() - 1800000), // 30 mins ago
      status: 'active'
    }
  ])

  const [threatSignatures, setThreatSignatures] = useState([
    { signature: 'CVE-2023-32XXX', type: 'iOS Zero-Click', status: 'detected', count: 23, severity: 'critical' },
    { signature: 'GRN_FRM_2024', type: 'Android Memory Forgery', status: 'blocked', count: 156, severity: 'high' },
    { signature: 'SQL_INJ_PHP', type: 'Web Application', status: 'monitoring', count: 89, severity: 'low' },
    { signature: 'RCE_APACHE', type: 'Server Side', status: 'quarantined', count: 12, severity: 'medium' },
    { signature: 'DNS_TUNNEL', type: 'C2 Communication', status: 'detected', count: 45, severity: 'high' }
  ])

  const [contributionStats, setContributionStats] = useState({
    totalNodes: 1247,
    activeNodes: 847,
    computePerSecond: 2.4e6,
    totalContributions: 892341,
    rewardsDistributed: 45623.78,
    averageAccuracy: 93.2
  })

  const [systemAlerts, setSystemAlerts] = useState([
    {
      id: 1,
      level: 'critical',
      title: 'Zero-Click Exploit Detected',
      message: 'NSO Group Pegasus signature detected on user device. Automated blocking initiated.',
      timestamp: new Date(Date.now() - 30000),
      source: 'Anomaly Engine #7',
      actions_taken: ['Blocked iMessage process', 'Isolated memory regions', 'Reported to user']
    },
    {
      id: 2,
      level: 'high',
      title: 'Suspected Nation-State Activity',
      message: 'Unusual Android system calls matching Granite framework patterns detected.',
      timestamp: new Date(Date.now() - 120000),
      source: 'ML Model #3',
      actions_taken: ['Enhanced monitoring', 'Network traffic isolation', 'User notification sent']
    }
  ])

  const handleEscalateThreat = useCallback(async (threatId) => {
    setRealTimeAnomalies(prev =>
      prev.map(threat =>
        threat.id === threatId
          ? { ...threat, status: 'escalated', escalatedAt: new Date() }
          : threat
      )
    )

    // In real implementation, this would trigger emergency notification system
    console.log(`Threat ${threatId} escalated to emergency response team`)
  }, [])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/20 border-red-500/50'
      case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500/50'
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/50'
      case 'low': return 'text-green-500 bg-green-500/20 border-green-500/50'
      default: return 'text-gray-500 bg-gray-500/20 border-gray-500/50'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'escalated': return 'text-red-400 bg-red-500/20 border-red-500/50'
      case 'blocked': return 'text-green-400 bg-green-500/20 border-green-500/50'
      case 'monitoring': return 'text-blue-400 bg-blue-500/20 border-blue-500/50'
      case 'detected': return 'text-orange-400 bg-orange-500/20 border-orange-500/50'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
    }
  }

  // Simulated ML model updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAiStatus(prev => ({
        ...prev,
        confidenceLevel: Math.min(99.9, prev.confidenceLevel + (Math.random() - 0.5) * 0.1),
        processingSpeed: prev.processingSpeed + Math.floor(Math.random() * 10) - 5,
        lastAnalysis: new Date()
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* AI Status Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Brain className="h-8 w-8 mr-3 text-purple-400" />
              AI Threat Intelligence
            </h1>
            <p className="text-gray-400">
              Distributed machine learning system detecting nation-state spyware patterns in real-time
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <div className="animate-pulse w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Active
            </Badge>
          </div>
        </div>

        {/* AI Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Detection Confidence</p>
                  <p className="text-2xl font-bold text-green-400">{aiStatus.confidenceLevel.toFixed(1)}%</p>
                  <p className="text-green-400 text-xs">↑ +0.1%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Threats/Minute</p>
                  <p className="text-2xl font-bold text-purple-400">{aiStatus.processingSpeed}</p>
                  <p className="text-purple-400 text-xs">(24,940/hour)</p>
                </div>
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active ML Models</p>
                  <p className="text-2xl font-bold text-blue-400">{aiStatus.mlModelsActive}</p>
                  <p className="text-blue-400 text-xs">4 training</p>
                </div>
                <Network className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">False Positives</p>
                  <p className="text-2xl font-bold text-cyan-400">{(aiStatus.falsePositives * 100).toFixed(2)}%</p>
                  <p className="text-cyan-400 text-xs">Industry leading</p>
                </div>
                <CheckCircle className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <Tabs defaultValue="anomalies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="anomalies" className="text-gray-300 data-[state=active]:text-white">
            Live Anomalies
          </TabsTrigger>
          <TabsTrigger value="models" className="text-gray-300 data-[state=active]:text-white">
            ML Models
          </TabsTrigger>
          <TabsTrigger value="signatures" className="text-gray-300 data-[state=active]:text-white">
            Threat Signatures
          </TabsTrigger>
          <TabsTrigger value="contributions" className="text-gray-300 data-[state=active]:text-white">
            Network Nodes
          </TabsTrigger>
        </TabsList>

        {/* Real-Time Anomalies */}
        <TabsContent value="anomalies" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertOctagon className="h-5 w-5 mr-2 text-red-400" />
                  Live Anomaly Detection
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time analysis of system behavior for nation-state spyware patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {realTimeAnomalies.map((anomaly, index) => (
                    <motion.div
                      key={anomaly.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-red-500/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col space-y-1">
                          <Badge className={getSeverityColor(anomaly.severity)}>
                            {anomaly.type}
                          </Badge>
                          <div className="text-gray-400 text-xs">
                            {anomaly.detectedAt.toLocaleTimeString()}
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium">{anomaly.description}</p>
                          <p className="text-gray-400 text-sm">
                            Source: {anomaly.source} • Confidence: {anomaly.confidence}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(anomaly.status)}>
                          {anomaly.status}
                        </Badge>
                        {anomaly.status === 'monitoring' && (
                          <Button
                            size="sm"
                            onClick={() => handleEscalateThreat(anomaly.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            Escalate
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Emergency Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-300 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Critical System Alerts
                </CardTitle>
                <CardDescription className="text-red-200">
                  Automated escalation events requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <Alert key={alert.id} className="bg-red-500/5 border-red-500/20">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-white">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <strong className="text-red-300">{alert.title}</strong>
                            <span className="text-red-400 text-xs">
                              {alert.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-300">{alert.message}</p>
                          <div className="text-gray-400 text-sm">
                            Source: {alert.source}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Actions: {alert.actions_taken.join(', ')}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ML Models */}
        <TabsContent value="models" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-purple-400" />
                  Machine Learning Models
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Specialized AI models trained to detect nation-state espionage techniques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mlModels.map((model, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{model.name}</p>
                          <p className="text-purple-400 text-sm">{model.type}</p>
                          <p className="text-gray-400 text-sm">
                            Target: {model.target} • Last updated: {model.lastUpdate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-4 mb-2">
                            <div>
                              <p className="text-green-400 text-sm">Accuracy: {model.accuracy}%</p>
                              <p className="text-red-400 text-sm">False +ive: {model.falsePositive}%</p>
                            </div>
                            <Badge className={model.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}>
                              {model.status}
                            </Badge>
                          </div>
                          <Progress value={model.accuracy} className="w-32 h-2" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Threat Signatures */}
        <TabsContent value="signatures" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="h-5 w-5 mr-2 text-orange-400" />
                  Known Threat Signatures
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Malware signatures and attack patterns detected across the network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatSignatures.map((sig, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${
                          sig.severity === 'critical' ? 'bg-red-500' :
                          sig.severity === 'high' ? 'bg-orange-500' :
                          sig.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="text-white font-medium">{sig.signature}</p>
                          <p className="text-gray-400 text-sm">{sig.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={`${
                          sig.status === 'blocked' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          sig.status === 'detected' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          sig.status === 'quarantined' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {sig.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-white text-sm font-medium">{sig.count} instances</p>
                          <Badge className={`text-xs ${
                            sig.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            sig.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            sig.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {sig.severity}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Network Contributions */}
        <TabsContent value="contributions" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-cyan-400" />
                  Distributed Computing Network
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Global network of participating devices analyzing threats collaboratively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{contributionStats.totalNodes}</div>
                    <div className="text-sm text-gray-400">Total Nodes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{contributionStats.activeNodes}</div>
                    <div className="text-sm text-gray-400">Active Nodes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{(contributionStats.computePerSecond / 1000000).toFixed(1)}M</div>
                    <div className="text-sm text-gray-400">FLOPS/sec</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                    <div>
                      <p className="text-white font-medium">Total Contributions</p>
                      <p className="text-gray-400 text-sm">{contributionStats.totalContributions.toLocaleString()} threat analyses</p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-400 font-bold">{contributionStats.rewardsDistributed.toFixed(2)}</p>
                      <p className="text-gray-400 text-xs">Rewards distributed</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg border border-green-500/20">
                    <div>
                      <p className="text-white font-medium">Network Accuracy</p>
                      <p className="text-gray-400 text-sm">Combined ML model performance</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">{contributionStats.averageAccuracy}%</p>
                      <p className="text-gray-400 text-xs">Average accuracy</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Network className="h-5 w-5 mr-2 text-purple-400" />
                  SETI@Home-Style Distributed Computing
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Join the global cybersecurity research collective and earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                    <span className="text-gray-300">Your daily contributions</span>
                    <span className="text-purple-400 font-medium">234 analyses</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                    <span className="text-gray-300">Rewards earned</span>
                    <span className="text-blue-400 font-medium">$12.34</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    <Zap className="h-4 w-4 mr-2" />
                    Boost Computing Power
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ThreatIntelligence
