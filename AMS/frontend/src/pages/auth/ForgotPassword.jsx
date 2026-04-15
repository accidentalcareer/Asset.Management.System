import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authService } from '../../services/apiService'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [step, setStep]     = useState(1) // 1: email, 2: otp+new pass
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm()

  // Step 1 — send OTP
  const sendOtp = async (data) => {
    setLoading(true)
    try {
      await authService.forgotPassword({ email: data.email })
      setEmail(data.email)
      toast.success('OTP sent! Check the server console (dev mode).')
      setStep(2)
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — verify OTP & reset
  const resetPassword = async (data) => {
    setLoading(true)
    try {
      await authService.resetPassword({ email, otp: data.otp, newPassword: data.newPassword })
      toast.success('Password reset successful! Please login.')
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark to-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">AMS</div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1,2,3].map(s => (
              <div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors ${s <= step ? 'bg-navy' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit(sendOtp)} className="space-y-4">
            <p className="text-sm text-gray-500 text-center mb-4">Enter your registered email and we'll send an OTP.</p>
            <div>
              <label className="label">Email <span className="text-red-500">*</span></label>
              <input className="input" type="email" placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(resetPassword)} className="space-y-4">
            <p className="text-sm text-gray-500 text-center mb-4">
              OTP sent to <strong>{email}</strong>.<br />
              <span className="text-amber-600">(Dev mode: check server console)</span>
            </p>
            <div>
              <label className="label">OTP <span className="text-red-500">*</span></label>
              <input className="input" placeholder="6-digit OTP"
                {...register('otp', { required: 'OTP is required' })} />
              {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>}
            </div>
            <div>
              <label className="label">New Password <span className="text-red-500">*</span></label>
              <input className="input" type="password" placeholder="Min 8 chars"
                {...register('newPassword', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Min 8 characters' }
                })} />
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password <span className="text-red-500">*</span></label>
              <input className="input" type="password" placeholder="Re-enter password"
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: val => val === watch('newPassword') || 'Passwords do not match'
                })} />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-400 hover:text-gray-600 mt-1">
              ← Back
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-gray-600 mb-6">Your password has been reset successfully.</p>
            <Link to="/login" className="btn-primary inline-block px-8 py-2.5">Go to Login</Link>
          </div>
        )}

        {step !== 3 && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Remember it?{' '}
            <Link to="/login" className="text-navy font-medium hover:underline">Login</Link>
          </p>
        )}
      </div>
    </div>
  )
}
