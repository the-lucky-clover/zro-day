import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Brain
} from 'lucide-react'

const LandingPage = ({ onShowAuth, darkMode, toggleDarkMode }) => {
  const [threatCount, setThreatCount] = useState(1247893)
  const [protectedUsers, setProtectedUsers] = useState(89432)

  useEffect(() => {
    // Animate threat counter
    const interval = setInterval(() => {
      setThreatCount(prev => prev + Math.floor(Math.random() * 5) + 1)
      setProtectedUsers(prev => prev + Math.floor(Math.random() * 3))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Shield,
      title: "State-Grade Spyware Detection",
      description: "Advanced AI algorithms detect Pegasus, Granite, and other zero-click exploits before they compromise your device.",
      color: "text-red-400"
    },
    {
      icon: Brain,
      title: "Distributed Computing Network",
      description: "Harness the power of distributed computing for real-time threat analysis and pattern recognition.",
      color: "text-purple-400"
    },
    {
      icon: Eye,
      title: "Automated PII Removal",
      description: "AI agents automatically remove your personal information from data brokers and public databases.",
      color: "text-cyan-400"
    },
    {
      icon: Lock,
      title: "Secure-Route™ Keyboard",
      description: "Privacy-first keyboard extension prevents keylogging and input manipulation attacks.",
      color: "text-green-400"
    },
    {
      icon: Network,
      title: "Real-Time Threat Intelligence",
      description: "Continuous monitoring of zero-day exploits and emerging threats from global cybersecurity sources.",
      color: "text-orange-400"
    },
    {
      icon: Cpu,
      title: "Multi-Platform Protection",
      description: "Comprehensive security across iOS, macOS, Windows, Linux, and Android platforms.",
      color: "text-blue-400"
    }
  ]

  const pricingPlans = [
    {
      name: "Free Trial",
      price: "Free",
      duration: "3 Days",
      features: [
        "Basic threat detection",
        "Limited PII removal",
        "iOS app access",
        "Community support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Monthly Guardian",
      price: "$7.77",
      duration: "per month",
      features: [
        "Full spyware detection",
        "Unlimited PII removal",
        "All platform access",
        "Secure-Route™ keyboard",
        "Priority support",
        "Real-time alerts"
      ],
      cta: "Choose Monthly",
      popular: true
    },
    {
      name: "Annual Defender",
      price: "$77.77",
      duration: "per year",
      features: [
        "Everything in Monthly",
        "Advanced threat hunting",
        "Custom security rules",
        "API access",
        "White-label options",
        "24/7 expert support"
      ],
      cta: "Choose Annual",
      popular: false,
      savings: "Save 16%"
    }
  ]

  return (
    <div className="min-h-screen text-white">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <motion.div
          className="w-[50vw] max-w-2xl min-w-[400px] h-16 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl flex items-center justify-between px-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
              Pricing
            </Button>
            <Button
              onClick={onShowAuth}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-lg"
            >
              Get Protected
            </Button>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-red-500/20 text-red-300 border-red-500/30">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Digital Tyranny Alert: State-Grade Spyware Detected
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
              The First Line of Defense Against
              <span className="block text-red-400">Digital Tyranny</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Zro-Day Research Labs is the world's first <strong className="text-cyan-400">"SOC-at-Phone"</strong> platform 
              using distributed computing to detect and neutralize state-grade spyware like Pegasus and Granite 
              before they compromise your digital life.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                onClick={onShowAuth}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-8 py-4"
              >
                <Shield className="w-5 h-5 mr-2" />
                Start 3-Day Free Trial
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 text-lg px-8 py-4"
              >
                <Globe className="w-5 h-5 mr-2" />
                View Live Threat Map
              </Button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div 
                className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-red-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {threatCount.toLocaleString()}
                </div>
                <div className="text-gray-300">Threats Blocked Today</div>
              </motion.div>
              
              <motion.div 
                className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-green-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {protectedUsers.toLocaleString()}
                </div>
                <div className="text-gray-300">Protected Users</div>
              </motion.div>
              
              <motion.div 
                className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  99.97%
                </div>
                <div className="text-gray-300">Detection Accuracy</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Revolutionary Cybersecurity Technology
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built by cybersecurity experts to combat the rising threat of digital surveillance and state-sponsored attacks.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="bg-black/40 backdrop-blur-sm border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
                  <CardHeader>
                    <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Choose Your Protection Level
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From basic protection to enterprise-grade security, we have a plan that fits your needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`bg-black/40 backdrop-blur-sm border-gray-700 h-full ${
                  plan.popular ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'hover:border-gray-600'
                } transition-all duration-300`}>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-cyan-400">{plan.price}</span>
                      <span className="text-gray-400 ml-2">{plan.duration}</span>
                      {plan.savings && (
                        <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                          {plan.savings}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-300">
                          <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full mt-6 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                      onClick={onShowAuth}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Join the Fight Against Digital Tyranny
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Don't let state-sponsored attackers compromise your privacy and security. 
              Take control with Zro-Day Research Labs.
            </p>
            <Button 
              size="lg"
              onClick={onShowAuth}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-12 py-6"
            >
              <Shield className="w-6 h-6 mr-3" />
              Get Protected Now - 3 Days Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black/40 border-t border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-cyan-400" />
                <span className="text-lg font-bold text-white">Zro-Day Research Labs</span>
              </div>
              <p className="text-gray-400">
                The world's first SOC-at-Phone platform for detecting and neutralizing state-grade spyware.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400">iOS App</a></li>
                <li><a href="#" className="hover:text-cyan-400">macOS Extension</a></li>
                <li><a href="#" className="hover:text-cyan-400">Windows App</a></li>
                <li><a href="#" className="hover:text-cyan-400">Android App</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Security</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400">Threat Intelligence</a></li>
                <li><a href="#" className="hover:text-cyan-400">PII Removal</a></li>
                <li><a href="#" className="hover:text-cyan-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-400">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400">Documentation</a></li>
                <li><a href="#" className="hover:text-cyan-400">Contact Us</a></li>
                <li><a href="#" className="hover:text-cyan-400">Status Page</a></li>
                <li><a href="#" className="hover:text-cyan-400">Bug Bounty</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Zro-Day Research Labs. All rights reserved. Fighting digital tyranny, one device at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
