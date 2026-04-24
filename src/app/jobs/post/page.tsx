'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PostJob() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary_range: '',
    job_type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    application_url: ''
  })
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

    setUser(user)
    setUserProfile(profile)

    if (profile?.role !== 'alumni') {
      router.push('/dashboard/student')
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const jobData = {
        posted_by: userProfile.id,
        ...formData
      }

    const { data, error } = await supabase
      .from('job_postings')
      .insert(jobData)
      .select()

    if (error) {
      console.error('Error posting job:', error)
      alert(`Error posting job: ${error.message || 'Unknown error'}`)
    } else {
      alert('Job posted successfully!')
      setFormData({
        title: '',
        company: '',
        location: '',
        description: '',
        requirements: '',
        salary_range: '',
        job_type: 'full-time',
        application_url: ''
      })
      router.push('/jobs/manage')
    }
    setSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Post Job Opportunity</h1>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Job Details</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Provide basic information about the job opportunity.
                  </p>
                </div>

                <div className="mt-5 md:mt-0 md:col-span-1">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        placeholder="e.g. Software Engineer"
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                        Company *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        placeholder="e.g. Tech Corp"
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        placeholder="e.g. New York, NY or Remote"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="job_type" className="block text-sm font-medium text-gray-700">
                        Job Type *
                      </label>
                      <select
                        id="job_type"
                        name="job_type"
                        value={formData.job_type}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">
                        Salary Range
                      </label>
                      <input
                        type="text"
                        id="salary_range"
                        name="salary_range"
                        value={formData.salary_range}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        placeholder="e.g. $60,000 - $80,000"
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="application_url" className="block text-sm font-medium text-gray-700">
                        Application URL
                      </label>
                      <input
                        type="url"
                        id="application_url"
                        name="application_url"
                        value={formData.application_url}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        placeholder="https://company.com/careers/apply"
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Job Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        required
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        placeholder="Describe the role, responsibilities, and what you're looking for..."
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                        Requirements *
                      </label>
                      <textarea
                        id="requirements"
                        name="requirements"
                        rows={4}
                        required
                        value={formData.requirements}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        placeholder="List the required skills, experience, and qualifications..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
