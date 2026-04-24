// User roles
export type UserRole = 'alumni' | 'student' | 'admin'

// User profile
export interface Profile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  role: UserRole
  graduation_year?: number
  degree?: string
  department?: string
  current_company?: string
  job_title?: string
  location?: string
  bio?: string
  linkedin_url?: string
  profile_image_url?: string
  created_at: string
  updated_at: string
}

// Mentorship program
export interface Mentorship {
  id: string
  mentor_id: string
  mentee_id: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

// Job postings
export interface JobPosting {
  id: string
  posted_by: string
  title: string
  company: string
  location: string
  description: string
  requirements: string
  salary_range?: string
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
  application_url?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

// Donations and fundraising
export interface Donation {
  id: string
  donor_id: string
  amount: number
  campaign_id?: string
  message?: string
  is_anonymous: boolean
  created_at: string
}

export interface Campaign {
  id: string
  title: string
  description: string
  goal_amount: number
  current_amount: number
  end_date: string
  created_by: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Networking connections
export interface Connection {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  updated_at: string
}

// Events
export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  max_attendees?: number
  created_by: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EventAttendee {
  id: string
  event_id: string
  attendee_id: string
  registration_date: string
}
