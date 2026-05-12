'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string
  salary_range?: string
  job_type: string
  application_url?: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function ApplyForJob() {
  const [job, setJob] = useState<JobPosting | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume_url: ''
  })
  const router = useRouter()
  const params = useParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    getUserAndProfile()
    fetchJob()
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

    setUser(user)
    setUserProfile(profile)

    if (profile?.role !== 'student') {
      router.push('/dashboard/alumni')
    }
    setLoading(false)
  }

  const fetchJob = async () => {
    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        profiles!job_postings_posted_by_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching job:', error)
      router.push('/jobs')
    } else {
      setJob(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Check if already applied
    const { data: existingApplications } = await supabase
      .from('job_applications')
      .select('*')
      .eq('job_id', job?.id)
      .eq('student_id', userProfile?.id)

    if (existingApplications && existingApplications.length > 0) {
      alert('You have already applied for this job')
      setSubmitting(false)
      return
    }

    const applicationData = {
      job_id: job?.id,
      student_id: userProfile.id,
      student_email: userProfile.email,
      cover_letter: formData.cover_letter,
      resume_url: formData.resume_url,
      status: 'pending'
    }

    const { error } = await supabase
      .from('job_applications')
      .insert(applicationData)

    if (error) {
      console.error('Error applying for job:', error)
      alert('Error applying for job. Please try again.')
    } else {
      alert('Job application sent successfully!')
      router.push('/jobs')
    }
    setSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Job not found</h2>
          <button
            onClick={() => router.push('/jobs')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Apply for Job</h1>
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

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Job Details */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{job.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Company</span>
                  <p className="text-lg text-gray-900">{job.company}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Location</span>
                  <p className="text-lg text-gray-900">{job.location}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Job Type</span>
                  <p className="text-lg text-gray-900">{job.job_type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Posted by</span>
                  <p className="text-lg text-gray-900">
                    {job.profiles?.first_name} {job.profiles?.last_name}
                  </p>
                </div>
              </div>
              {job.salary_range && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500">Salary Range</span>
                  <p className="text-lg text-gray-900">{job.salary_range}</p>
                </div>
              )}
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Job Description</span>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Requirements</span>
                <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Application</h3>
              
              <div className="mb-6">
                <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter *
                </label>
                <textarea
                  id="cover_letter"
                  name="cover_letter"
                  rows={6}
                  required
                  value={formData.cover_letter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                />
              </div>

              <div className="mb-6">
                <label htmlFor="resume_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Resume/Portfolio URL (optional)
                </label>
                <input
                  type="url"
                  id="resume_url"
                  name="resume_url"
                  value={formData.resume_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="https://your-resume-link.com"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => router.push('/jobs')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
