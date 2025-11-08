import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { X, Shield, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

const AuthModal = ({ onClose, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Mock successful login
      const userData = {
        id: '1',
        email: formData.email,
        firstName: 'John',
        lastName: 'Doe',
        subscription: 'trial',
        trialDaysLeft: 3
      }
      const token = 'mock_jwt_token_' + Date.now()
      
      onLogin(userData, token)
      setIsLoading(false)
    }, 1500)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Mock successful signup
      const userData = {
        id: '1',
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        subscription: 'trial',
        trialDaysLeft: 3
      }
      const token = 'mock_jwt_token_' + Date.now()
      
      onLogin(userData, token)
      setIsLoading(false)
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="bg-black/90 backdrop-blur-md border-gray-700 shadow-2xl">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-2 top-2 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-cyan-400 mr-2" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Zro-Day Research Labs
              </span>
            </div>
            
            <CardTitle className="text-center text-white text-2xl">
              Secure Your Digital Life
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              Join the fight against digital tyranny
            </CardDescription>
            
            <Badge className="mx-auto bg-green-500/20 text-green-400 border-green-500/30">
              3-Day Free Trial • No Credit Card Required
            </Badge>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
                <TabsTrigger value="login" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
                
                <div className="text-center">
                  <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300">
                    Forgot your password?
                  </a>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signupEmail"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signupPassword"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      'Start Free Trial'
                    )}
                  </Button>
                </form>
                
                <div className="text-xs text-gray-400 text-center">
                  By signing up, you agree to our{' '}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default AuthModal
