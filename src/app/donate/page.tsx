'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DonatePage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    donation_type: 'general'
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
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const donationData = {
      donor_id: userProfile.id,
      donor_email: userProfile.email,
      donor_name: `${userProfile.first_name} ${userProfile.last_name}`,
      amount: parseFloat(formData.amount),
      message: formData.message,
      donation_type: formData.donation_type,
      status: 'pending'
    }

    console.log('Donation data:', donationData)

    const { error } = await supabase
      .from('donations')
      .insert(donationData)

    if (error) {
      console.error('Error processing donation:', error)
      console.error('Error details:', error.message, error.code, error.hint)
      alert(`Error processing donation: ${error.message || 'Unknown error'}`)
    } else {
      alert('Thank you for your donation! We will contact you for payment processing.')
      setFormData({
        amount: '',
        message: '',
        donation_type: 'general'
      })
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
              <h1 className="text-xl font-semibold text-gray-900">Donate</h1>
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Support Our Students</h2>
            <p className="text-gray-600">Your donation helps fund student projects, scholarships, and educational initiatives.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              onClick={() => setFormData({...formData, amount: '10'})}
              className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">$10</div>
              <div className="text-sm text-gray-600">Student Project Support</div>
            </div>
            <div 
              onClick={() => setFormData({...formData, amount: '50'})}
              className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">$50</div>
              <div className="text-sm text-gray-600">Scholarship Fund</div>
            </div>
            <div 
              onClick={() => setFormData({...formData, amount: '100'})}
              className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">$100+</div>
              <div className="text-sm text-gray-600">Program Sponsor</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Make a Donation</h3>
              
              <div className="mb-6">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount ($) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="1"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter amount"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="donation_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Type
                </label>
                <select
                  id="donation_type"
                  name="donation_type"
                  value={formData.donation_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="general">General Support</option>
                  <option value="scholarship">Scholarship Fund</option>
                  <option value="projects">Student Projects</option>
                  <option value="events">Events & Programs</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Add a message with your donation..."
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Donate Now'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-2">How Your Donation Helps</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Fund student capstone projects</li>
              <li>Support scholarship programs</li>
              <li>Enable educational workshops and events</li>
              <li>Provide resources for student organizations</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
