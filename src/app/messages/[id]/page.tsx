'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read_at: string | null
  sender_name: string
  receiver_name: string
}

export default function ConversationPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClientComponentClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getUserAndProfile()
  }, [])

  useEffect(() => {
    if (userProfile && params.id) {
      fetchOtherUser()
      fetchMessages()
      markMessagesAsRead()
    }
  }, [userProfile, params.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

  const fetchOtherUser = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    setOtherUser(data)
  }

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userProfile.id},receiver_id.eq.${params.id}),and(sender_id.eq.${params.id},receiver_id.eq.${userProfile.id})`)
      .neq('is_deleted', true)
      .order('created_at', { ascending: true })

    // Fetch sender and receiver names
    const messagesWithNames = await Promise.all(
      (data || []).map(async (msg: any) => {
        const [senderData, receiverData] = await Promise.all([
          supabase.from('profiles').select('first_name, last_name').eq('id', msg.sender_id).single(),
          supabase.from('profiles').select('first_name, last_name').eq('id', msg.receiver_id).single()
        ])
        return {
          ...msg,
          sender_name: `${senderData.data?.first_name} ${senderData.data?.last_name}`,
          receiver_name: `${receiverData.data?.first_name} ${receiverData.data?.last_name}`
        }
      })
    )

    setMessages(messagesWithNames)
  }

  const markMessagesAsRead = async () => {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', params.id)
      .eq('receiver_id', userProfile.id)
      .is('read_at', null)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: userProfile.id,
        receiver_id: params.id,
        content: newMessage.trim()
      })

    if (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } else {
      setNewMessage('')
      await fetchMessages()
    }

    setSending(false)
  }

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId)
      .or(`sender_id.eq.${userProfile.id},receiver_id.eq.${userProfile.id}`)

    if (error) {
      console.error('Error deleting message:', error)
    } else {
      await fetchMessages()
    }
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
              <Link href="/messages" className="flex items-center text-gray-700 hover:text-gray-900">
                <span className="md:hidden text-2xl">←</span>
                <span className="hidden md:inline px-4 py-2">← Back to Messages</span>
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {otherUser?.first_name} {otherUser?.last_name}
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="h-[calc(100vh-300px)] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No messages yet</p>
                <p className="text-sm text-gray-400 mt-2">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === userProfile.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === userProfile.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1 space-x-2">
                      <p className="text-xs opacity-70">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {message.sender_id === userProfile.id && (
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="text-xs opacity-70 hover:opacity-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <form onSubmit={sendMessage} className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
