'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadProfilePicture } from '@/lib/upload-image'

interface StudentProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: 'student'
  graduation_year?: number
  degree: string
  department: string
  skills?: string[]
  interests?: string[]
  bio?: string
  linkedin_url?: string
  profile_picture?: string
  looking_for_mentorship?: boolean
  job_seeking?: boolean
}

export default function StudentProfileForm() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [skills, setSkills] = useState('')
  const [interests, setInterests] = useState('')
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
    if (data?.skills) {
      setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : data.skills)
    }
    if (data?.interests) {
      setInterests(Array.isArray(data.interests) ? data.interests.join(', ') : data.interests)
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
        skills: skills.split(',').map(s => s.trim()).filter(s => s),
        interests: interests.split(',').map(i => i.trim()).filter(i => i),
        bio: profile.bio,
        linkedin_url: profile.linkedin_url,
        profile_picture: profile.profile_picture,
        looking_for_mentorship: profile.looking_for_mentorship,
        job_seeking: profile.job_seeking
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
              <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
              <p className="mt-1 text-sm text-gray-600">
                Update your academic information and career interests.
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
                    Expected Graduation Year
                  </label>
                  <input
                    type="number"
                    id="graduation_year"
                    value={profile.graduation_year || ''}
                    onChange={(e) => setProfile({...profile, graduation_year: parseInt(e.target.value) || undefined})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                    Degree Program
                  </label>
                  <input
                    type="text"
                    id="degree"
                    required
                    value={profile.degree || ''}
                    onChange={(e) => setProfile({...profile, degree: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    placeholder="e.g., Computer Science, Business Administration"
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
                  placeholder="e.g., School of Engineering, Business School"
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                  Skills
                </label>
                <input
                  type="text"
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="e.g., JavaScript, Python, Project Management, Communication"
                />
                <p className="mt-1 text-sm text-gray-500">Separate skills with commas</p>
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                  Career Interests
                </label>
                <input
                  type="text"
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="e.g., Software Development, Marketing, Finance, Research"
                />
                <p className="mt-1 text-sm text-gray-500">Separate interests with commas</p>
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
                  About Me
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="Tell us about your academic background, career goals, and what you're looking for..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="looking_for_mentorship"
                    type="checkbox"
                    checked={profile.looking_for_mentorship || false}
                    onChange={(e) => setProfile({...profile, looking_for_mentorship: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="looking_for_mentorship" className="ml-2 block text-sm text-gray-900">
                    I am looking for mentorship opportunities
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="job_seeking"
                    type="checkbox"
                    checked={profile.job_seeking || false}
                    onChange={(e) => setProfile({...profile, job_seeking: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="job_seeking" className="ml-2 block text-sm text-gray-900">
                    I am actively seeking job opportunities
                  </label>
                </div>
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
