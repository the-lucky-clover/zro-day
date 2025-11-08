import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield, 
  Settings, 
  Eye, 
  Lock, 
  Smartphone, 
  Monitor, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  FileText,
  Download,
  RefreshCw,
  Zap,
  Brain,
  Network
} from 'lucide-react'

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    // General Protection
    realTimeProtection: true,
    behavioralAnalysis: true,
    networkMonitoring: true,
    
    // Security Robustness
    sensitivityLevel: 75, // 0-100 scale
    intrusiveness: 'balanced', // 'minimal', 'balanced', 'maximum'
    
    // Threat Detection
    pegasusDetection: true,
    graniteDetection: true,
    zeroClickProtection: true,
    phishingProtection: true,
    malwareScanning: true,
    
    // Privacy Settings
    anonymizedTelemetry: true,
    dataRetention: 30, // days
    shareThreats: true,
    
    // Notifications
    criticalAlerts: true,
    dailyReports: true,
    weeklyDigest: false,
    
    // Advanced Features
    verboseLogging: false,
    debugMode: false,
    apiAccess: false,
    
    // Platform Specific
    iosProtection: true,
    macosProtection: true,
    windowsProtection: false,
    androidProtection: false,
    
    // Keyboard Extension
    secureKeyboard: true,
    keystrokeAnalysis: true,
    inputValidation: true
  })

  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState(new Date())

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    
    // Simulate API call to save settings
    setTimeout(() => {
      setLastSaved(new Date())
      setIsLoading(false)
      
      // Show success notification
      console.log('Settings saved successfully')
    }, 1000)
  }

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      setSettings({
        realTimeProtection: true,
        behavioralAnalysis: true,
        networkMonitoring: true,
        sensitivityLevel: 75,
        intrusiveness: 'balanced',
        pegasusDetection: true,
        graniteDetection: true,
        zeroClickProtection: true,
        phishingProtection: true,
        malwareScanning: true,
        anonymizedTelemetry: true,
        dataRetention: 30,
        shareThreats: true,
        criticalAlerts: true,
        dailyReports: true,
        weeklyDigest: false,
        verboseLogging: false,
        debugMode: false,
        apiAccess: false,
        iosProtection: true,
        macosProtection: true,
        windowsProtection: false,
        androidProtection: false,
        secureKeyboard: true,
        keystrokeAnalysis: true,
        inputValidation: true
      })
    }
  }

  const getSensitivityLabel = (value) => {
    if (value < 25) return 'Minimal (Less Intrusive)'
    if (value < 50) return 'Low (Basic Protection)'
    if (value < 75) return 'Medium (Balanced)'
    if (value < 90) return 'High (Enhanced Security)'
    return 'Maximum (Paranoid Mode)'
  }

  const getSensitivityColor = (value) => {
    if (value < 25) return 'text-green-400'
    if (value < 50) return 'text-yellow-400'
    if (value < 75) return 'text-orange-400'
    if (value < 90) return 'text-red-400'
    return 'text-purple-400'
  }

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Settings</h1>
          <p className="text-gray-400">
            Customize your protection level and security preferences
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Last saved</p>
            <p className="text-white text-sm">{lastSaved.toLocaleString()}</p>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800 border-gray-700">
          <TabsTrigger value="general" className="text-gray-300 data-[state=active]:text-white">
            General
          </TabsTrigger>
          <TabsTrigger value="detection" className="text-gray-300 data-[state=active]:text-white">
            Detection
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-gray-300 data-[state=active]:text-white">
            Privacy
          </TabsTrigger>
          <TabsTrigger value="platforms" className="text-gray-300 data-[state=active]:text-white">
            Platforms
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-gray-300 data-[state=active]:text-white">
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-cyan-400" />
                  Protection Level
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Adjust the security robustness and intrusiveness based on your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Security Robustness</span>
                    <Badge className={`${getSensitivityColor(settings.sensitivityLevel)} bg-opacity-20`}>
                      {getSensitivityLabel(settings.sensitivityLevel)}
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.sensitivityLevel]}
                    onValueChange={(value) => handleSettingChange('sensitivityLevel', value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Less Secure</span>
                    <span>More Secure</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-white">Intrusiveness Level</label>
                  <Select
                    value={settings.intrusiveness}
                    onValueChange={(value) => handleSettingChange('intrusiveness', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="minimal">Minimal - Least intrusive, may miss some threats</SelectItem>
                      <SelectItem value="balanced">Balanced - Good balance of security and usability</SelectItem>
                      <SelectItem value="maximum">Maximum - Highest security, may impact performance</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Activity className="h-5 w-5 mr-2 text-green-400" />
                  Core Protection Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Real-Time Protection</p>
                    <p className="text-sm text-gray-400">Continuous monitoring and threat detection</p>
                  </div>
                  <Switch
                    checked={settings.realTimeProtection}
                    onCheckedChange={(checked) => handleSettingChange('realTimeProtection', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Behavioral Analysis</p>
                    <p className="text-sm text-gray-400">AI-powered behavior pattern analysis</p>
                  </div>
                  <Switch
                    checked={settings.behavioralAnalysis}
                    onCheckedChange={(checked) => handleSettingChange('behavioralAnalysis', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Network Monitoring</p>
                    <p className="text-sm text-gray-400">Monitor network traffic for suspicious activity</p>
                  </div>
                  <Switch
                    checked={settings.networkMonitoring}
                    onCheckedChange={(checked) => handleSettingChange('networkMonitoring', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Detection Settings */}
        <TabsContent value="detection" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                  State-Grade Spyware Detection
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure detection for advanced persistent threats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white flex items-center">
                      Pegasus Detection
                      <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        Critical
                      </Badge>
                    </p>
                    <p className="text-sm text-gray-400">Detect NSO Group's Pegasus spyware variants</p>
                  </div>
                  <Switch
                    checked={settings.pegasusDetection}
                    onCheckedChange={(checked) => handleSettingChange('pegasusDetection', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white flex items-center">
                      Granite Detection
                      <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        Critical
                      </Badge>
                    </p>
                    <p className="text-sm text-gray-400">Detect Granite and similar state-sponsored tools</p>
                  </div>
                  <Switch
                    checked={settings.graniteDetection}
                    onCheckedChange={(checked) => handleSettingChange('graniteDetection', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Zero-Click Exploit Protection</p>
                    <p className="text-sm text-gray-400">Protect against zero-interaction attacks</p>
                  </div>
                  <Switch
                    checked={settings.zeroClickProtection}
                    onCheckedChange={(checked) => handleSettingChange('zeroClickProtection', checked)}
                  />
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
                  <Globe className="h-5 w-5 mr-2 text-orange-400" />
                  General Threat Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Phishing Protection</p>
                    <p className="text-sm text-gray-400">Block malicious websites and emails</p>
                  </div>
                  <Switch
                    checked={settings.phishingProtection}
                    onCheckedChange={(checked) => handleSettingChange('phishingProtection', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Malware Scanning</p>
                    <p className="text-sm text-gray-400">Real-time file and download scanning</p>
                  </div>
                  <Switch
                    checked={settings.malwareScanning}
                    onCheckedChange={(checked) => handleSettingChange('malwareScanning', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-400" />
                  Data Privacy & Telemetry
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Control how your data is collected and used for threat intelligence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Anonymized Telemetry</p>
                    <p className="text-sm text-gray-400">Help improve threat detection with anonymous data</p>
                  </div>
                  <Switch
                    checked={settings.anonymizedTelemetry}
                    onCheckedChange={(checked) => handleSettingChange('anonymizedTelemetry', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Share Threat Intelligence</p>
                    <p className="text-sm text-gray-400">Contribute to global threat database</p>
                  </div>
                  <Switch
                    checked={settings.shareThreats}
                    onCheckedChange={(checked) => handleSettingChange('shareThreats', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white">Data Retention Period</label>
                  <Select
                    value={settings.dataRetention.toString()}
                    onValueChange={(value) => handleSettingChange('dataRetention', parseInt(value))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Platform Settings */}
        <TabsContent value="platforms" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Monitor className="h-5 w-5 mr-2 text-blue-400" />
                  Platform Protection
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enable protection for your devices and platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      iOS Protection
                    </p>
                    <p className="text-sm text-gray-400">iPhone and iPad security</p>
                  </div>
                  <Switch
                    checked={settings.iosProtection}
                    onCheckedChange={(checked) => handleSettingChange('iosProtection', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white flex items-center">
                      <Monitor className="h-4 w-4 mr-2" />
                      macOS Protection
                    </p>
                    <p className="text-sm text-gray-400">Mac desktop and laptop security</p>
                  </div>
                  <Switch
                    checked={settings.macosProtection}
                    onCheckedChange={(checked) => handleSettingChange('macosProtection', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Secure-Route™ Keyboard</p>
                    <p className="text-sm text-gray-400">Privacy-first keyboard extension</p>
                  </div>
                  <Switch
                    checked={settings.secureKeyboard}
                    onCheckedChange={(checked) => handleSettingChange('secureKeyboard', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-400" />
                  Advanced Configuration
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Expert settings for advanced users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Verbose Logging</p>
                    <p className="text-sm text-gray-400">Detailed logs for troubleshooting</p>
                  </div>
                  <Switch
                    checked={settings.verboseLogging}
                    onCheckedChange={(checked) => handleSettingChange('verboseLogging', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Debug Mode</p>
                    <p className="text-sm text-gray-400">Enable debugging features</p>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">API Access</p>
                    <p className="text-sm text-gray-400">Enable programmatic access</p>
                  </div>
                  <Switch
                    checked={settings.apiAccess}
                    onCheckedChange={(checked) => handleSettingChange('apiAccess', checked)}
                  />
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
                  <FileText className="h-5 w-5 mr-2 text-gray-400" />
                  Logs & Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <FileText className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-orange-400" />
                  Reset Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={handleResetToDefaults}
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SecuritySettings
