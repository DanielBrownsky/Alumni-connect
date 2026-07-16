'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface MentorshipRequest {
  id: string
  student_email: string
  mentor_email: string
  status: 'pending' | 'accepted' | 'rejected'
  message: string
  created_at: string
}

interface Activity {
  id: string
  type: 'mentorship' | 'job_posting' | 'job_application'
  description: string
  status?: string
  created_at: string
}

export default function AlumniDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [jobCount, setJobCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    getUserAndProfile()
  }, [])

  useEffect(() => {
    if (userProfile) {
      fetchRecentActivities()
      fetchJobCount()
    }
  }, [userProfile])

  const fetchRecentActivities = async () => {
    const activities: Activity[] = []

    // Fetch mentorship requests
    const { data: mentorshipData } = await supabase
      .from('mentorship_requests')
      .select('*')
      .eq('mentor_email', userProfile.email)
      .order('created_at', { ascending: false })
      .limit(5)

    if (mentorshipData) {
      mentorshipData.forEach((req: any) => {
        activities.push({
          id: req.id,
          type: 'mentorship',
          description: `Mentorship request from ${req.student_email}`,
          status: req.status,
          created_at: req.created_at
        })
      })
    }

    // Fetch job postings
    const { data: jobsData } = await supabase
      .from('job_postings')
      .select('*')
      .eq('posted_by', userProfile.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (jobsData) {
      jobsData.forEach((job: any) => {
        activities.push({
          id: job.id,
          type: 'job_posting',
          description: `Posted job: ${job.title}`,
          status: job.is_active ? 'active' : 'inactive',
          created_at: job.created_at
        })
      })
    }

    // Fetch job applications
    const { data: jobsDataForApps } = await supabase
      .from('job_postings')
      .select('id')
      .eq('posted_by', userProfile.id)

    const jobIds = jobsDataForApps?.map((job: any) => job.id) || []

    if (jobIds.length > 0) {
      const { data: applicationsData } = await supabase
        .from('job_applications')
        .select('*')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false })
        .limit(5)

      if (applicationsData) {
        // Fetch job titles for applications
        const applicationsWithTitles = await Promise.all(
          applicationsData.map(async (app: any) => {
            const { data: jobData } = await supabase
              .from('job_postings')
              .select('title')
              .eq('id', app.job_id)
              .single()
            return { ...app, job_title: jobData?.title }
          })
        )

        applicationsWithTitles.forEach((app: any) => {
          activities.push({
            id: app.id,
            type: 'job_application',
            description: `Application for ${app.job_title} from ${app.student_email}`,
            status: app.status,
            created_at: app.created_at
          })
        })
      }
    }

    // Sort all activities by date and take the most recent 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)

    setRecentActivities(sortedActivities)
  }

  const fetchJobCount = async () => {
    const { data, error } = await supabase
      .from('job_postings')
      .select('id')
      .eq('posted_by', userProfile.id)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching job count:', error)
    } else {
      setJobCount(data?.length || 0)
    }
  }

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

    if (profile) {
      setUser(user)
      setUserProfile(profile)

      if (profile.role !== 'alumni') {
        router.push('/dashboard/student')
      }
    }
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
              <h1 className="text-xl font-semibold text-gray-900">Alumni Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {userProfile?.profile_picture ? (
                <img
                  src={userProfile.profile_picture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
                </div>
              )}
              <span className="text-sm text-gray-700">
                Welcome, {userProfile?.first_name || user?.email}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('/')
                }}
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
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Your Alumni Dashboard</h2>
            <p className="mt-2 text-gray-600">
              Mentor students, share opportunities, and support your alma mater.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              onClick={() => router.push('/mentorship/applications')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Mentorship</h3>
                    <p className="text-sm text-gray-500">Guide current students</p>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Job Postings</dt>
                      <dd className="text-lg font-medium text-gray-900">{jobCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm space-y-1">
                  <button
                    onClick={() => router.push('/jobs/post')}
                    className="font-medium text-blue-600 hover:text-blue-500 block text-left"
                  >
                    Post New Job
                  </button>
                  <Link href="/jobs/applications" className="font-medium text-blue-600 hover:text-blue-500 block">
                    Manage Applications
                  </Link>
                </div>
              </div>
            </div>

            <div 
              onClick={() => router.push('/donate')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0 8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Donations</h3>
                    <p className="text-sm text-gray-500">Support students</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => router.push('/students')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M17 20v2c0 .552-.448 1-1 1s-1-.448-1-1v-2M7 20v2c0 .552-.448 1-1 1s-1-.448-1-1v-2M10 4a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Student Network</h3>
                    <p className="text-sm text-gray-500">Browse students</p>
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


            <div
              onClick={() => router.push('/analytics')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-500">View your impact</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => router.push('/messages')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                    <p className="text-sm text-gray-500">Chat with students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No recent activity yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'mentorship' ? 'bg-green-100' :
                            activity.type === 'job_posting' ? 'bg-blue-100' :
                            'bg-purple-100'
                          }`}>
                            {activity.type === 'mentorship' ? (
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            ) : activity.type === 'job_posting' ? (
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {activity.status && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            activity.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            activity.status === 'active' ? 'bg-green-100 text-green-800' :
                            activity.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
