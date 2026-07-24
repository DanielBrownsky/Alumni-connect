'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    platformName: 'Alumni Connect',
    requireEmailVerification: true,
    allowStudentRegistration: true,
    allowAlumniRegistration: true,
    enableMentorship: true,
    enableJobBoard: true,
    enableDonations: true,
    maintenanceMode: false,
    contactEmail: 'admin@alumni-connect.com',
  })
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setLoading(false)
    }

    checkAdminAccess()
  }, [router, supabase])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      // In a real app, you'd save this to a settings table
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error saving settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard/admin" className="text-blue-600 hover:text-blue-700">
                ← Back to Admin Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Platform Settings</h1>
              <p className="text-sm text-gray-600">Configure platform-wide settings and features</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('success') 
              ? 'bg-green-50 border border-green-200 text-green-600' 
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {message}
          </div>
        )}

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="platformName" className="block text-sm font-medium text-gray-700 mb-1">
                Platform Name
              </label>
              <input
                id="platformName"
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Registration Settings */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Registration Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Require Email Verification</h3>
                <p className="text-sm text-gray-500">Users must verify their email before accessing the platform</p>
              </div>
              <button
                onClick={() => setSettings({...settings, requireEmailVerification: !settings.requireEmailVerification})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.requireEmailVerification ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    settings.requireEmailVerification ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Allow Student Registration</h3>
                <p className="text-sm text-gray-500">Students can create accounts on the platform</p>
              </div>
              <button
                onClick={() => setSettings({...settings, allowStudentRegistration: !settings.allowStudentRegistration})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.allowStudentRegistration ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    settings.allowStudentRegistration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Allow Alumni Registration</h3>
                <p className="text-sm text-gray-500">Alumni can create accounts on the platform</p>
              </div>
              <button
                onClick={() => setSettings({...settings, allowAlumniRegistration: !settings.allowAlumniRegistration})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.allowAlumniRegistration ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    settings.allowAlumniRegistration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Settings */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Feature Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Enable Mentorship</h3>
                <p className="text-sm text-gray-500">Students can request mentorship from alumni</p>
              </div>
              <button
                onClick={() => setSettings({...settings, enableMentorship: !settings.enableMentorship})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.enableMentorship ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    settings.enableMentorship ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Enable Job Board</h3>
                <p className="text-sm text-gray-500">Alumni can post job opportunities</p>
              </div>
              <button
                onClick={() => setSettings({...settings, enableJobBoard: !settings.enableJobBoard})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.enableJobBoard ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    settings.enableJobBoard ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Enable Donations</h3>
                <p className="text-sm text-gray-500">Users can make donations to the platform</p>
              </div>
              <button
                onClick={() => setSettings({...settings, enableDonations: !settings.enableDonations})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.enableDonations ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    settings.enableDonations ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Maintenance Mode</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Enable Maintenance Mode</h3>
                <p className="text-sm text-gray-500">Only admins can access the platform when enabled</p>
              </div>
              <button
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </main>
    </div>
  )
}