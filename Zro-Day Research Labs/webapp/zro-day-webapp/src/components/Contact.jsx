import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle, Mail, MessageSquare, Shield, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'research',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // null, 'success', 'error'

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('https://zro-day-backend.pounds1.workers.dev/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          source: 'contact-form'
        })
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', subject: '', category: 'research', message: '' })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Contact Zro-Day Research Labs
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Questions about our research? Security concerns? Research collaboration inquiries?
            We're here to help advance the field of cybersecurity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-cyan-400" />
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Fill out the form below and we'll respond as quickly as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-gray-300">Message Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="research">Research Collaboration</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="security">Security Concerns</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="media">Media & Press</SelectItem>
                        <SelectItem value="academic">Academic Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Brief subject line"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-300">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 resize-none"
                    />
                  </div>

                  {submitStatus === 'success' && (
                    <Alert className="bg-green-500/10 border-green-500/50 text-green-300">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Message sent successfully! We'll get back to you within 24 hours.
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitStatus === 'error' && (
                    <Alert className="bg-red-500/10 border-red-500/50 text-red-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to send message. Please try again or contact us directly at theluckyclover@gmail.com
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >

            {/* Research Ethics Notice */}
            <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-300 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Important Research Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-red-200 text-sm">
                  Zro-Day is an <strong>academic research platform</strong> demonstrating distributed computing concepts in cybersecurity.
                </p>
                <p className="text-red-200 text-sm">
                  <strong>NO SECURITY CLAIMS:</strong> We make no guarantees about threat detection, PII removal, or data protection effectiveness.
                </p>
                <p className="text-red-200 text-sm">
                  Our platform is <strong>experimental research software</strong> - use at your own risk.
                </p>
              </CardContent>
            </Card>

            {/* Direct Contact */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-cyan-400" />
                  Direct Contact
                </CardTitle>
                <CardDescription className="text-gray-400">
                  For urgent inquiries or research collaboration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <strong>Email:</strong> theluckyclover@gmail.com
                  </p>
                  <p className="text-gray-300">
                    <strong>Subject Format:</strong> [Zro-Day Research] Your Inquiry
                  </p>
                  <p className="text-sm text-gray-400">
                    Response time: 24-48 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-purple-400" />
                  Research Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">38</div>
                    <div className="text-xs text-gray-400">Active Nodes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">1.2M</div>
                    <div className="text-xs text-gray-400">Threats Demo'd</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Links */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-400" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="/privacy" className="block text-cyan-400 hover:text-cyan-300 transition-colors">
                  Privacy Policy →
                </a>
                <a href="/terms" className="block text-cyan-400 hover:text-cyan-300 transition-colors">
                  Terms of Service →
                </a>
                <a href="/research" className="block text-cyan-400 hover:text-cyan-300 transition-colors">
                  Research Overview →
                </a>
                <a href="/faq" className="block text-purple-400 hover:text-purple-300 transition-colors">
                  FAQ →
                </a>
              </CardContent>
            </Card>

          </motion.div>
        </div>

        {/* Bottom Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-gray-400 text-sm"
        >
          <p>
            Zro-Day Research Labs • Academic Cybersecurity Research Platform<br />
            Promoting transparency in distributed computing and digital privacy research
          </p>
        </motion.div>

      </div>
    </div>
  )
}

export default Contact
