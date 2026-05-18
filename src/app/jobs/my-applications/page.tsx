'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface JobApplication {
  id: string
  job_id: string
  student_id: string
  student_email: string
  cover_letter: string
  resume_url?: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  created_at: string
  job_postings?: {
    title: string
    company: string
    location: string
    job_type: string
  }
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function MyApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    getUserAndProfile()
  }, [])

  useEffect(() => {
    if (userProfile) {
      fetchApplications()
    }
  }, [userProfile])

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

    setUser(user)
    setUserProfile(profile)

    if (profile?.role !== 'student') {
      router.push('/dashboard/alumni')
    }
    setLoading(false)
  }

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job_postings!job_applications_job_id_fkey (
          title,
          company,
          location,
          job_type
        ),
        profiles!job_applications_student_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('student_id', userProfile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications:', error)
    } else {
      setApplications(data || [])
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
              <h1 className="text-xl font-semibold text-gray-900">My Job Applications</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {userProfile?.first_name || user?.email}
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
              <button
                onClick={() => router.push('/jobs')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Browse Jobs
              </button>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job applications yet</h3>
              <p className="text-gray-600 mb-4">Start applying for jobs to track your applications here.</p>
              <button
                onClick={() => router.push('/jobs')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Browse Available Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => (
                <div key={application.id} className="bg-white shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {application.job_postings?.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {application.job_postings?.company} • {application.job_postings?.location}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
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
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Job Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Company</span>
                          <p className="text-gray-900">{application.job_postings?.company}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Location</span>
                          <p className="text-gray-900">{application.job_postings?.location}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Job Type</span>
                          <p className="text-gray-900">{application.job_postings?.job_type}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Applied On</span>
                          <p className="text-gray-900">{new Date(application.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Your Cover Letter</h4>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                        {application.cover_letter}
                      </p>
                    </div>

                    {application.resume_url && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Resume/Portfolio</h4>
                        <a
                          href={application.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Resume/Portfolio
                        </a>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push('/jobs')}
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm text-gray-700"
                      >
                        Browse More Jobs
                      </button>
                    </div>
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
