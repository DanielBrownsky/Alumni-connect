'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDonationsPage() {
  const [loading, setLoading] = useState(true)
  const [donations, setDonations] = useState<any[]>([])
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

      await fetchDonations()
      setLoading(false)
    }

    checkAdminAccess()
  }, [router, supabase])

  const fetchDonations = async () => {
    try {
      // This is a placeholder - you'll need to adjust based on your actual donations table structure
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching donations:', error)
        // If table doesn't exist yet, show empty state
        setDonations([])
        return
      }
      
      setDonations(data || [])
    } catch (error) {
      console.error('Error fetching donations:', error)
      setDonations([])
    }
  }

  const handleStatusUpdate = async (donationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('donations')
        .update({ status: newStatus })
        .eq('id', donationId)

      if (error) throw error
      await fetchDonations()
    } catch (error) {
      console.error('Error updating donation status:', error)
    }
  }

  const handleDeleteDonation = async (donationId: string) => {
    if (!confirm('Are you sure you want to delete this donation record?')) return

    try {
      const { error } = await supabase
        .from('donations')
        .delete()
        .eq('id', donationId)

      if (error) throw error
      await fetchDonations()
    } catch (error) {
      console.error('Error deleting donation:', error)
    }
  }

  const filteredDonations = donations.filter(donation => {
    return statusFilter === 'all' || donation.status === statusFilter
  })

  const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0)

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
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Donations</h1>
              <p className="text-sm text-gray-600">Manage platform donations</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Donations</p>
            <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Donors</p>
            <p className="text-2xl font-bold text-gray-900">{donations.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {donations.filter(d => d.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {donations.filter(d => d.status === 'pending').length}
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              All Donations ({filteredDonations.length})
            </h2>
          </div>
          
          {filteredDonations.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <p>No donations found</p>
              <p className="text-sm mt-2">Donations will appear here when users contribute to the platform</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
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
                  {filteredDonations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.donor_name || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${donation.amount?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donation.purpose || 'General'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={donation.status}
                          onChange={(e) => handleStatusUpdate(donation.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteDonation(donation.id)}
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