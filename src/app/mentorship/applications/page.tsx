'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface MentorshipApplication {
  id: string
  student_email: string
  mentor_email: string
  status: 'pending' | 'accepted' | 'rejected'
  message: string
  created_at: string
}

export default function MentorshipApplications() {
  const [applications, setApplications] = useState<MentorshipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mentorProfile, setMentorProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkAuth()
    fetchApplications()
  }, [])

  const checkAuth = async () => {
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

    setUser(user)
    setMentorProfile(profile)

    if (profile?.role !== 'alumni') {
      router.push('/dashboard/student')
    }
  }

  const fetchApplications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', user.id)
      .single()

    if (!profile) return

    const { data, error } = await supabase
      .from('mentorship_requests')
      .select('*')
      .eq('mentor_email', profile.email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications:', error)
    } else {
      setApplications(data || [])
    }
    setLoading(false)
  }

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('mentorship_requests')
      .update({ status })
      .eq('id', applicationId)

    if (error) {
      console.error('Error updating application:', error)
      alert('Error updating application')
    } else {
      alert(`Application ${status} successfully!`)
      fetchApplications() // Refresh the list
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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/alumni')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Mentorship Applications</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {mentorProfile?.first_name || user?.email}
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
            <h2 className="text-2xl font-bold text-gray-900">Mentorship Requests</h2>
            <p className="mt-2 text-gray-600">
              Review and respond to mentorship applications from students.
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500">
                Students haven't applied for mentorship with you yet. Make sure your profile is complete and you're marked as available for mentorship.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => (
                <div key={application.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Student Application
                        </h3>
                        <p className="text-sm text-gray-500">{application.student_email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(application.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Message:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {application.message}
                      </p>
                    </div>

                    {application.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {application.status === 'accepted' && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-800">
                          You have accepted this mentorship request. You can now contact the student directly.
                        </p>
                      </div>
                    )}

                    {application.status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-800">
                          You have rejected this mentorship request.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
