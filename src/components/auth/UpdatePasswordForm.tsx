'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      setSuccess(true)
      
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleUpdatePassword} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900">Update Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
            Password updated successfully! Redirecting to sign in...
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter your new password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Confirm your new password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            <a href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Back to sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}