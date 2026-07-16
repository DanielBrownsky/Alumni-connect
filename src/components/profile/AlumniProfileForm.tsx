'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadProfilePicture } from '@/lib/upload-image'

interface AlumniProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: 'alumni'
  graduation_year?: number
  degree: string
  department: string
  current_company?: string
  job_title?: string
  location?: string
  bio?: string
  linkedin_url?: string
  profile_picture?: string
  mentorship_areas?: string[]
  available_for_mentorship?: boolean
  industry?: string
  years_of_experience?: number
}

export default function AlumniProfileForm() {
  const [profile, setProfile] = useState<AlumniProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [mentorshipAreas, setMentorshipAreas] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/signin')
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      setLoading(false)
      return
    }

    setProfile(data)
    if (data?.mentorship_areas) {
      setMentorshipAreas(Array.isArray(data.mentorship_areas) ? data.mentorship_areas.join(', ') : data.mentorship_areas)
    }
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploading(true)
    setMessage('')

    try {
      const publicUrl = await uploadProfilePicture(file, profile.id)
      
      setProfile({ ...profile, profile_picture: publicUrl })
      setMessage('Profile picture uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage('Error uploading profile picture')
    }

    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        graduation_year: profile.graduation_year,
        degree: profile.degree,
        department: profile.department,
        current_company: profile.current_company,
        job_title: profile.job_title,
        location: profile.location,
        bio: profile.bio,
        linkedin_url: profile.linkedin_url,
        profile_picture: profile.profile_picture,
        mentorship_areas: mentorshipAreas.split(',').map(m => m.trim()).filter(m => m),
        available_for_mentorship: profile.available_for_mentorship,
        industry: profile.industry,
        years_of_experience: profile.years_of_experience
      })
      .eq('id', profile.id)

    if (error) {
      setMessage('Error updating profile')
    } else {
      setMessage('Profile updated successfully!')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Profile not found</h2>
          <p className="mt-2 text-gray-600">Please complete your registration.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Alumni Profile</h1>
              <p className="mt-1 text-sm text-gray-600">
                Update your professional information and mentorship availability.
              </p>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-md text-sm ${
                message.includes('success') 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profile.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-2xl">
                        {profile.first_name[0]}{profile.last_name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    id="profile_picture"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {uploading && (
                    <p className="mt-1 text-sm text-gray-500">Uploading...</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    required
                    value={profile.first_name}
                    onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    required
                    value={profile.last_name}
                    onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  disabled
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm text-gray-900"
                />
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="graduation_year" className="block text-sm font-medium text-gray-700">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    id="graduation_year"
                    required
                    value={profile.graduation_year || ''}
                    onChange={(e) => setProfile({...profile, graduation_year: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                    Degree
                  </label>
                  <input
                    type="text"
                    id="degree"
                    required
                    value={profile.degree || ''}
                    onChange={(e) => setProfile({...profile, degree: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  required
                  value={profile.department || ''}
                  onChange={(e) => setProfile({...profile, department: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="current_company" className="block text-sm font-medium text-gray-700">
                    Current Company
                  </label>
                  <input
                    type="text"
                    id="current_company"
                    value={profile.current_company || ''}
                    onChange={(e) => setProfile({...profile, current_company: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="job_title" className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="job_title"
                    value={profile.job_title || ''}
                    onChange={(e) => setProfile({...profile, job_title: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <input
                    type="text"
                    id="industry"
                    value={profile.industry || ''}
                    onChange={(e) => setProfile({...profile, industry: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    placeholder="e.g., Technology, Finance, Healthcare"
                  />
                </div>

                <div>
                  <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    id="years_of_experience"
                    value={profile.years_of_experience || ''}
                    onChange={(e) => setProfile({...profile, years_of_experience: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="mentorship_areas" className="block text-sm font-medium text-gray-700">
                  Mentorship Areas
                </label>
                <input
                  type="text"
                  id="mentorship_areas"
                  value={mentorshipAreas}
                  onChange={(e) => setMentorshipAreas(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="e.g., Career Guidance, Technical Skills, Leadership, Industry Insights"
                />
                <p className="mt-1 text-sm text-gray-500">Separate areas with commas</p>
              </div>

              <div>
                <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  id="linkedin_url"
                  value={profile.linkedin_url || ''}
                  onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Professional Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="Tell us about your career journey, expertise, and what you can offer as a mentor..."
                />
              </div>

              <div className="flex items-center">
                <input
                  id="available_for_mentorship"
                  type="checkbox"
                  checked={profile.available_for_mentorship || false}
                  onChange={(e) => setProfile({...profile, available_for_mentorship: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="available_for_mentorship" className="ml-2 block text-sm text-gray-900">
                  I am available for mentorship
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
