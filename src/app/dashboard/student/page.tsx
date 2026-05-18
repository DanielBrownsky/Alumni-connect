'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    getUserAndProfile()
  }, [])

  const getUserAndProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/signin')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'student') {
      router.push('/dashboard/alumni')
      return
    }

    setUser(user)
    setProfile(profile)
    setLoading(false)
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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {profile?.first_name || user?.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Your Student Dashboard</h2>
            <p className="mt-2 text-gray-600">
              Connect with alumni, find mentors, and explore career opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              onClick={() => router.push('/mentorship')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Find Mentors</h3>
                    <p className="text-sm text-gray-500">Connect with experienced alumni</p>
                  </div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => router.push('/jobs')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Job Opportunities</h3>
                    <p className="text-sm text-gray-500">Browse and apply</p>
                  </div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => router.push('/jobs/my-applications')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">My Applications</h3>
                    <p className="text-sm text-gray-500">Track job applications</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Alumni Network</h3>
                    <p className="text-sm text-gray-500">Browse alumni profiles</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">My Applications</h3>
                    <p className="text-sm text-gray-500">Track your progress</p>
                  </div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => router.push('/profile')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">My Profile</h3>
                    <p className="text-sm text-gray-500">Update your information</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 2.943-9.543 7a9.001 9.001 0 009.543 7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Events</h3>
                    <p className="text-sm text-gray-500">Upcoming alumni events</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-600">
                  Your mentorship applications and job searches will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
