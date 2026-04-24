'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Mentor {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  current_company?: string
  job_title?: string
  location?: string
  bio?: string
  linkedin_url?: string
  graduation_year?: number
  degree?: string
  department?: string
  mentorship_areas?: string[]
  available: boolean
}

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchMentors()
    checkAuth()
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
    setUserProfile(profile)

    if (profile?.role !== 'student') {
      router.push('/dashboard/alumni')
    }
  }

  const fetchMentors = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'alumni')

    if (error) {
      console.error('Error fetching mentors:', error)
    } else {
      setMentors(data || [])
    }
    setLoading(false)
  }

  const applyForMentorship = async (mentorId: string) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    try {
      // Make sure student profile exists
      if (!userProfile) {
        alert('Please complete your profile first before applying for mentorship')
        router.push('/profile')
        return
      }

      // Check if already applied to this mentor
      const { data: existingApplications } = await supabase
        .from('mentorship_requests')
        .select('*')
        .eq('student_email', userProfile.email)
        .eq('mentor_email', mentors.find(m => m.id === mentorId)?.email)

      if (existingApplications && existingApplications.length > 0) {
        alert('You have already applied for mentorship with this mentor')
        return
      }

      // Create mentorship application
      const applicationData = {
        student_email: userProfile.email,
        mentor_email: mentors.find(m => m.id === mentorId)?.email,
        status: 'pending',
        message: `Hello, I would like to be mentored by you. I am a ${userProfile.department ? userProfile.department : 'computer science'} student and would greatly appreciate your guidance.`
      }

      const { data, error } = await supabase
        .from('mentorship_requests')
        .insert(applicationData)
        .select()

      if (error) {
        console.error('Application error:', error)
        alert(`Error: ${error.message}`)
      } else {
        alert('Mentorship application sent successfully!')
        fetchMentors()
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An error occurred. Please try again.')
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
                onClick={() => router.push('/dashboard/student')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Find Mentors</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Available Mentors</h2>
            <p className="mt-2 text-gray-600">
              Connect with experienced alumni who can guide you in your career journey.
            </p>
          </div>

          {mentors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors available</h3>
              <p className="text-gray-500">
                Check back later as more alumni join the mentorship program.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {mentor.first_name[0]}{mentor.last_name[0]}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {mentor.first_name} {mentor.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {mentor.job_title || 'Alumni'}
                        </p>
                      </div>
                    </div>

                    {mentor.current_company && (
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {mentor.current_company}
                        </span>
                      </div>
                    )}

                    {mentor.location && (
                      <div className="mb-3 text-sm text-gray-600">
                        <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {mentor.location}
                      </div>
                    )}

                    {mentor.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {mentor.bio}
                      </p>
                    )}

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {mentor.graduation_year && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Class of {mentor.graduation_year}
                          </span>
                        )}
                        {mentor.degree && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {mentor.degree}
                          </span>
                        )}
                        {mentor.department && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {mentor.department}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => applyForMentorship(mentor.id)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Apply for Mentorship
                      </button>
                      {mentor.linkedin_url && (
                        <a
                          href={mentor.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
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
