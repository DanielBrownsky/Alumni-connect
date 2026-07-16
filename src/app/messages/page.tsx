'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Conversation {
  user_id: string
  first_name: string
  last_name: string
  email: string
  profile_picture?: string
  last_message: string
  last_message_time: string
  unread_count: number
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    getUserAndProfile()
  }, [])

  useEffect(() => {
    if (userProfile) {
      fetchConversations()
    }
  }, [userProfile])

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

  const fetchConversations = async () => {
    // Get all conversations (unique users the current user has messaged with)
    const { data: sentMessages } = await supabase
      .from('messages')
      .select('receiver_id')
      .eq('sender_id', userProfile.id)
      .neq('is_deleted', true)

    const { data: receivedMessages } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', userProfile.id)
      .neq('is_deleted', true)

    // Get unique user IDs
    const userIds = new Set<string>()
    sentMessages?.forEach((msg: any) => userIds.add(msg.receiver_id))
    receivedMessages?.forEach((msg: any) => userIds.add(msg.sender_id))

    // Fetch profiles for these users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', Array.from(userIds))

    // For each user, get last message and unread count
    const conversationsData = await Promise.all(
      (profiles || []).map(async (profile: any) => {
        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .or(`and(sender_id.eq.${userProfile.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${userProfile.id})`)
          .neq('is_deleted', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get unread count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', profile.id)
          .eq('receiver_id', userProfile.id)
          .is('read_at', null)
          .neq('is_deleted', true)

        return {
          user_id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          profile_picture: profile.profile_picture,
          last_message: lastMessage?.content || '',
          last_message_time: lastMessage?.created_at || '',
          unread_count: count || 0
        }
      })
    )

    // Sort by last message time
    const sortedConversations = conversationsData.sort((a, b) => 
      new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
    )

    setConversations(sortedConversations)
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
              <Link href={userProfile?.role === 'alumni' ? '/dashboard/alumni' : '/dashboard/student'} className="flex items-center text-gray-700 hover:text-gray-900">
                <span className="md:hidden text-2xl">←</span>
                <span className="hidden md:inline px-4 py-2">← Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Inbox</h2>
            </div>
            <div className="divide-y">
              {conversations.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No conversations yet</p>
                  <p className="text-sm text-gray-400 mt-2">Start a conversation with alumni or students</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <Link
                    key={conversation.user_id}
                    href={`/messages/${conversation.user_id}`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {conversation.profile_picture ? (
                          <img
                            src={conversation.profile_picture}
                            alt={`${conversation.first_name} ${conversation.last_name}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {conversation.first_name?.[0]}{conversation.last_name?.[0]}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {conversation.first_name} {conversation.last_name}
                            </p>
                            {conversation.unread_count > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {conversation.last_message}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {conversation.last_message_time ? new Date(conversation.last_message_time).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
