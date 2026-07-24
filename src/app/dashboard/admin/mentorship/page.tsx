'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminMentorshipPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
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

      await fetchRequests()
      setLoading(false)
    }

    checkAdminAccess()
  }, [router, supabase])

  const fetchRequests = async () => {
    try {
      // This is a placeholder - you'll need to adjust based on your actual mentorship table structure
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching mentorship requests:', error)
        // If table doesn't exist yet, show empty state
        setRequests([])
        return
      }
      
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching mentorship requests:', error)
      setRequests([])
    }
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('mentorship_requests')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (error) throw error
      await fetchRequests()
    } catch (error) {
      console.error('Error updating request status:', error)
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this mentorship request?')) return

    try {
      const { error } = await supabase
        .from('mentorship_requests')
        .delete()
        .eq('id', requestId)

      if (error) throw error
      await fetchRequests()
    } catch (error) {
      console.error('Error deleting request:', error)
    }
  }

  const filteredRequests = requests.filter(request => {
    return statusFilter === 'all' || request.status === statusFilter
  })

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
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Mentorship Requests</h1>
              <p className="text-sm text-gray-600">Manage mentorship requests from students</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Accepted</p>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'accepted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              All Requests ({filteredRequests.length})
            </h2>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <p>No mentorship requests found</p>
              <p className="text-sm mt-2">Requests will appear here when students submit mentorship requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alumni
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.student_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.alumni_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.subject || 'No subject'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}