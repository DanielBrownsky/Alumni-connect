'use client'

import { Session } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

interface SupabaseProviderProps {
  children: React.ReactNode
}

export default function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabaseClient] = useState(() => createClientComponentClient())

  return (
    <>{children}</>
  )
}
