'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StudentProfileForm from '@/components/profile/StudentProfileForm'
import AlumniProfileForm from '@/components/profile/AlumniProfileForm'

export default function ProfilePage() {
  const [userRole, setUserRole] = useState<'student' | 'alumni' | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
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

    if (profile?.role) {
      setUserRole(profile.role)
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

  if (userRole === 'student') {
    return <StudentProfileForm />
  } else if (userRole === 'alumni') {
    return <AlumniProfileForm />
  } else {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Profile not found</h2>
          <p className="mt-2 text-gray-600">Please complete your registration.</p>
        </div>
      </div>
    )
  }
}
