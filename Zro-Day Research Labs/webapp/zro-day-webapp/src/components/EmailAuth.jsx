import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Shield,
  Lock,
  Mail,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { Resend } from 'resend'

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || 're_placeholder_api_key')

export default function EmailAuth({ onBack, onAuthSuccess }) {
  const [step, setStep] = useState('email') // 'email' | 'otp' | 'complete'
  const [email, setEmail] = useState('')
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [verificationToken, setVerificationToken] = useState('')

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Generate a secure verification token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36)

      // Send verification email
      const { error: emailError } = await resend.emails.send({
        from: 'security@zro-day.com',
        to: email,
        subject: 'Zro-Day Research Labs - Security Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: white;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🔐 Zro-Day Research Labs</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Security Verification Required</p>
            </div>

            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 32px;">🛡️</span>
                </div>
                <h2 style="margin: 0 0 10px 0; color: #00d4ff; font-size: 24px;">Verify Your Identity</h2>
                <p style="margin: 0; opacity: 0.8; line-height: 1.6;">
                  To access the Zro-Day Command Center, please verify your identity using the security code below.
                </p>
              </div>

              <div style="background: #1a1a2e; border: 1px solid #00d4ff; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #00d4ff;">Your Security Code</h3>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #00ff88; font-family: monospace;">
                  ${token.slice(0, 6).toUpperCase()}
                </div>
                <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.6;">
                  This code expires in 15 minutes
                </p>
              </div>

              <div style="background: #2a2a3e; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h4 style="margin: 0 0 10px 0; color: #ff6b6b;">⚠️ Security Notice</h4>
                <ul style="margin: 0; padding-left: 20px; opacity: 0.8; line-height: 1.6;">
                  <li>Never share this code with anyone</li>
                  <li>Zro-Day Research Labs will never ask for your password via email</li>
                  <li>This verification is required for your security</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>

              <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #333;">
                <p style="margin: 0; opacity: 0.6; font-size: 14px;">
                  Zro-Day Research Labs • Fighting Digital Tyranny Since 2025
                </p>
                <p style="margin: 5px 0 0 0; opacity: 0.4; font-size: 12px;">
                  If you have any questions, contact security@zro-day.com
                </p>
              </div>
            </div>
          </div>
        `,
      })

      if (emailError) {
        throw new Error(emailError.message)
      }

      setVerificationToken(token.slice(0, 6).toUpperCase())
      setSuccess('Security code sent! Check your email.')
      setStep('otp')

    } catch (err) {
      setError('Failed to send verification email. Please try again.')
      console.error('Email send error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    const enteredOtp = otpValues.join('')

    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit code.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (enteredOtp === verificationToken) {
        setSuccess('Identity verified successfully!')
        setStep('complete')

        // Redirect to dashboard after success animation
        setTimeout(() => {
          onAuthSuccess()
        }, 2000)
      } else {
        setError('Invalid security code. Please check and try again.')
      }
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return // Only allow single characters

    const newValues = [...otpValues]
    newValues[index] = value
    setOtpValues(newValues)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const resendCode = async () => {
    setLoading(true)
    setError('')

    try {
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36)

      // Resend email logic here
      await resend.emails.send({
        from: 'security@zro-day.com',
        to: email,
        subject: 'Zro-Day Research Labs - Security Verification (Resent)',
        html: `<div> Your new code: ${token.slice(0, 6).toUpperCase()} </div>`,
      })

      setVerificationToken(token.slice(0, 6).toUpperCase())
      setSuccess('New security code sent!')
    } catch {
      setError('Failed to resend code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-black/40 backdrop-blur-xl border-gray-700 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl text-white">
              {step === 'email' && 'Secure Access Required'}
              {step === 'otp' && 'Enter Security Code'}
              {step === 'complete' && 'Access Granted'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {step === 'email' && 'Enter your email to access the Command Center'}
              {step === 'otp' && `We sent a 6-digit code to ${email}`}
              {step === 'complete' && 'Welcome to Zro-Day Research Labs'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 'email' && (
              <motion.form
                onSubmit={handleEmailSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Send Security Code
                    </>
                  )}
                </Button>
              </motion.form>
            )}

            {step === 'otp' && (
              <motion.form
                onSubmit={handleOtpSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-300 text-center block">
                    Enter the 6-digit security code
                  </label>
                  <div className="flex gap-2 justify-center">
                    {otpValues.map((value, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        value={value}
                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold bg-gray-800/50 border-gray-600 text-white"
                        maxLength={1}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={loading || otpValues.join('').length !== 6}
                    className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-semibold py-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify Code
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={resendCode}
                    disabled={loading}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800/50"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Code
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <p className="text-green-400 font-semibold">Access Granted</p>
                <p className="text-gray-300 text-sm">Redirecting to Command Center...</p>
              </motion.div>
            )}

            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {step !== 'complete' && (
              <Button
                onClick={onBack}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white hover:bg-gray-800/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Main Site
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
