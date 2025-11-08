import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Shield, 
  Zap, 
  Crown,
  Download,
  FileText,
  Settings,
  RefreshCw
} from 'lucide-react'

const SubscriptionManagement = ({ user }) => {
  const [subscriptionData, setSubscriptionData] = useState({
    plan: 'trial',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    cancelAtPeriodEnd: false,
    trialDaysLeft: 3,
    usage: {
      threatsBlocked: 1247,
      piiRecordsRemoved: 847,
      devicesProtected: 12,
      apiCalls: 2341
    },
    limits: {
      threatsBlocked: 'Unlimited',
      piiRecordsRemoved: 'Unlimited',
      devicesProtected: 'Unlimited',
      apiCalls: 10000
    }
  })

  const [billingHistory, setBillingHistory] = useState([
    {
      id: 'inv_trial_001',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      amount: 0,
      status: 'paid',
      description: 'Free Trial - 3 Days',
      downloadUrl: '#'
    }
  ])

  const [isLoading, setIsLoading] = useState(false)

  const pricingPlans = [
    {
      id: 'monthly',
      name: 'Monthly Guardian',
      price: 7.77,
      interval: 'month',
      description: 'Complete protection for individuals',
      features: [
        'Full spyware detection (Pegasus, Granite)',
        'Unlimited PII removal',
        'All platform access (iOS, macOS, Windows, Linux, Android)',
        'Secure-Route™ keyboard extension',
        'Real-time threat alerts',
        'Priority support',
        'Advanced threat hunting',
        'Custom security rules'
      ],
      popular: true,
      stripePriceId: 'price_monthly_guardian'
    },
    {
      id: 'annual',
      name: 'Annual Defender',
      price: 77.77,
      interval: 'year',
      description: 'Best value with advanced features',
      features: [
        'Everything in Monthly Guardian',
        'Advanced threat hunting & analysis',
        'Custom security rule engine',
        'API access for integrations',
        'White-label options',
        '24/7 expert cybersecurity support',
        'Quarterly security assessments',
        'Priority feature requests'
      ],
      popular: false,
      stripePriceId: 'price_annual_defender',
      savings: 'Save 16% ($15.47/year)'
    }
  ]

  const handleUpgrade = async (planId) => {
    setIsLoading(true)
    
    try {
      // Simulate Stripe checkout process
      console.log(`Upgrading to ${planId}...`)
      
      // In a real implementation, this would:
      // 1. Create Stripe checkout session
      // 2. Redirect to Stripe checkout
      // 3. Handle webhook for successful payment
      
      setTimeout(() => {
        // Mock successful upgrade
        setSubscriptionData(prev => ({
          ...prev,
          plan: planId,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + (planId === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
          trialDaysLeft: 0
        }))
        
        setIsLoading(false)
        
        // Show success message
        alert(`Successfully upgraded to ${pricingPlans.find(p => p.id === planId)?.name}!`)
      }, 2000)
      
    } catch (error) {
      console.error('Upgrade failed:', error)
      setIsLoading(false)
      alert('Upgrade failed. Please try again.')
    }
  }

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      setIsLoading(true)
      
      // Simulate cancellation
      setTimeout(() => {
        setSubscriptionData(prev => ({
          ...prev,
          cancelAtPeriodEnd: true
        }))
        setIsLoading(false)
        alert('Subscription cancelled. You will retain access until the end of your billing period.')
      }, 1000)
    }
  }

  const handleReactivateSubscription = async () => {
    setIsLoading(true)
    
    // Simulate reactivation
    setTimeout(() => {
      setSubscriptionData(prev => ({
        ...prev,
        cancelAtPeriodEnd: false
      }))
      setIsLoading(false)
      alert('Subscription reactivated successfully!')
    }, 1000)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'trial': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'cancelled': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'past_due': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getCurrentPlan = () => {
    return pricingPlans.find(p => p.id === subscriptionData.plan) || {
      name: 'Free Trial',
      price: 0,
      interval: 'trial'
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-400" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Plan</span>
                  <Badge className={getStatusColor(subscriptionData.status)}>
                    {getCurrentPlan().name}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-white capitalize">{subscriptionData.status}</span>
                </div>
                {subscriptionData.plan === 'trial' && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Trial Days Left</span>
                    <span className="text-cyan-400 font-bold">{subscriptionData.trialDaysLeft}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Next Billing</span>
                  <span className="text-white">
                    {subscriptionData.currentPeriodEnd.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white">
                    ${getCurrentPlan().price}/{getCurrentPlan().interval}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                {subscriptionData.cancelAtPeriodEnd ? (
                  <Button
                    onClick={handleReactivateSubscription}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reactivate Subscription
                  </Button>
                ) : subscriptionData.plan !== 'trial' ? (
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                    className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    Cancel Subscription
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Trial expires in {subscriptionData.trialDaysLeft} days</p>
                    <Progress value={(3 - subscriptionData.trialDaysLeft) / 3 * 100} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-cyan-400" />
              Usage This Month
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your protection statistics and resource usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Threats Blocked</span>
                  <span className="text-red-400">{subscriptionData.usage.threatsBlocked.toLocaleString()}</span>
                </div>
                <Progress value={75} className="h-2" />
                <div className="text-xs text-gray-500">Limit: {subscriptionData.limits.threatsBlocked}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">PII Records Removed</span>
                  <span className="text-purple-400">{subscriptionData.usage.piiRecordsRemoved.toLocaleString()}</span>
                </div>
                <Progress value={60} className="h-2" />
                <div className="text-xs text-gray-500">Limit: {subscriptionData.limits.piiRecordsRemoved}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Devices Protected</span>
                  <span className="text-green-400">{subscriptionData.usage.devicesProtected}</span>
                </div>
                <Progress value={40} className="h-2" />
                <div className="text-xs text-gray-500">Limit: {subscriptionData.limits.devicesProtected}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">API Calls</span>
                  <span className="text-blue-400">{subscriptionData.usage.apiCalls.toLocaleString()}</span>
                </div>
                <Progress value={(subscriptionData.usage.apiCalls / subscriptionData.limits.apiCalls) * 100} className="h-2" />
                <div className="text-xs text-gray-500">Limit: {subscriptionData.limits.apiCalls.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upgrade Plans */}
      {subscriptionData.plan === 'trial' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                Upgrade Your Protection
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose a plan that fits your cybersecurity needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pricingPlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative"
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-3 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <Card className={`bg-gray-800/50 border-gray-600 h-full ${
                      plan.popular ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : ''
                    }`}>
                      <CardHeader className="text-center">
                        <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-cyan-400">${plan.price}</span>
                          <span className="text-gray-400 ml-2">/{plan.interval}</span>
                          {plan.savings && (
                            <div className="mt-1">
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                {plan.savings}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardDescription className="text-gray-400">
                          {plan.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start text-sm text-gray-300">
                              <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={isLoading}
                          className={`w-full ${
                            plan.popular
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Upgrade to {plan.name}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Billing History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-400" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingHistory.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-500' : 
                      invoice.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-white font-medium">{invoice.description}</p>
                      <p className="text-gray-400 text-sm">{invoice.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-mono">
                      ${invoice.amount.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-gray-400" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">•••• •••• •••• 4242</p>
                  <p className="text-gray-400 text-sm">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Settings className="h-4 w-4 mr-2" />
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default SubscriptionManagement
