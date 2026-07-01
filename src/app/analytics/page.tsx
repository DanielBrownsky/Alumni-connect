'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AnalyticsData {
  mentorshipStats: {
    totalRequests: number
    acceptedRequests: number
    pendingRequests: number
    completionRate: number
  }
  jobStats: {
    totalJobs: number
    totalApplications: number
    activeJobs: number
    averageApplications: number
  }
  donationStats: {
    totalDonations: number
    totalAmount: number
    recentDonations: number
    averageAmount: number
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (userProfile) {
      fetchAnalytics()
    }
  }, [userProfile])

  const fetchUserProfile = async () => {
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

    if (profile?.role !== 'alumni') {
      router.push('/dashboard/student')
      return
    }

    setUserProfile(profile)
  }

  const fetchAnalytics = async () => {
    // Fetch mentorship stats
    const { data: mentorshipData } = await supabase
      .from('mentorship_requests')
      .select('*')
      .eq('mentor_email', userProfile.email)

    const mentorshipStats = {
      totalRequests: mentorshipData?.length || 0,
      acceptedRequests: mentorshipData?.filter((r: any) => r.status === 'accepted').length || 0,
      pendingRequests: mentorshipData?.filter((r: any) => r.status === 'pending').length || 0,
      completionRate: mentorshipData && mentorshipData.length > 0
        ? Math.round((mentorshipData.filter((r: any) => r.status === 'accepted').length / mentorshipData.length) * 100)
        : 0
    }

    // Fetch job stats
    const { data: jobsData } = await supabase
      .from('job_postings')
      .select('*, job_applications(*)')
      .eq('posted_by', userProfile.id)

    const totalApplications = jobsData && jobsData.length > 0
      ? jobsData.reduce((sum: number, job: any) => {
          return sum + (job.job_applications?.length || 0)
        }, 0)
      : 0

    const jobStats = {
      totalJobs: jobsData?.length || 0,
      totalApplications: totalApplications,
      activeJobs: jobsData?.filter((j: any) => j.is_active).length || 0,
      averageApplications: jobsData && jobsData.length > 0
        ? Math.round(totalApplications / jobsData.length)
        : 0
    }

    // Fetch donation stats
    const { data: donationData } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', userProfile.id)

    const totalAmount = donationData && donationData.length > 0
      ? donationData.reduce((sum: number, d: any) => sum + d.amount, 0)
      : 0
    const recentDonations = donationData && donationData.length > 0
      ? donationData.filter((d: any) => {
          const donationDate = new Date(d.created_at)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return donationDate >= thirtyDaysAgo
        }).length
      : 0

    const donationStats = {
      totalDonations: donationData?.length || 0,
      totalAmount: totalAmount,
      recentDonations: recentDonations,
      averageAmount: donationData && donationData.length > 0
        ? Math.round(totalAmount / donationData.length)
        : 0
    }

    setAnalytics({ mentorshipStats, jobStats, donationStats })
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
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/dashboard/alumni" className="flex items-center text-gray-700 hover:text-gray-900">
                <span className="md:hidden text-2xl">←</span>
                <span className="hidden md:inline px-4 py-2">← Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Your Impact</h2>
            <p className="mt-2 text-gray-600">
              Track your contributions to the alumni community.
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Mentorship</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.mentorshipStats.totalRequests || 0}</p>
                  <p className="text-xs text-gray-500">requests received</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.jobStats.totalApplications || 0}</p>
                  <p className="text-xs text-gray-500">applications received</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0 8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Donations</p>
                  <p className="text-2xl font-bold text-gray-900">${analytics?.donationStats.totalAmount?.toFixed(0) || 0}</p>
                  <p className="text-xs text-gray-500">total donated</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mentorship Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mentorship Impact</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Requests</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.mentorshipStats.totalRequests || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accepted</span>
                  <span className="text-sm font-medium text-green-600">{analytics?.mentorshipStats.acceptedRequests || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-yellow-600">{analytics?.mentorshipStats.pendingRequests || 0}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Acceptance Rate</span>
                    <span className="text-sm font-bold text-gray-900">{analytics?.mentorshipStats.completionRate || 0}%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${analytics?.mentorshipStats.completionRate || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Job Posting Impact</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Jobs Posted</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.jobStats.totalJobs || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Jobs</span>
                  <span className="text-sm font-medium text-green-600">{analytics?.jobStats.activeJobs || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Applications</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.jobStats.totalApplications || 0}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Applications/Job</span>
                    <span className="text-sm font-bold text-gray-900">{analytics?.jobStats.averageApplications || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Impact</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Donations</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.donationStats.totalDonations || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-sm font-medium text-green-600">${analytics?.donationStats.totalAmount?.toFixed(0) || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Recent (30 days)</span>
                  <span className="text-sm font-medium text-yellow-600">{analytics?.donationStats.recentDonations || 0}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Donation</span>
                    <span className="text-sm font-bold text-gray-900">${analytics?.donationStats.averageAmount?.toFixed(0) || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Tips to Increase Your Impact</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Respond to mentorship requests promptly to improve acceptance rate</li>
              <li>• Keep job postings updated and active to attract more applicants</li>
              <li>• Regular donations help support student programs</li>
              <li>• Engage with students through the network to build relationships</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
