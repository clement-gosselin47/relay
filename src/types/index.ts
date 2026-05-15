export type RequestStatus = 'active' | 'taken' | 'done' | 'expired'

export interface Profile {
  id: string
  name: string
  email: string
  filiere: string
  skills: string[]
  available: boolean
  campus_radius: string
  avatar_url?: string | null
  push_subscription: PushSubscriptionJSON | null
  created_at: string
}

export interface Request {
  id: string
  author_id: string
  title: string
  description: string | null
  categories: string[]
  target_filieres: string[]
  location: string
  urgent: boolean
  duration_min: number | null
  expires_at: string | null
  status: RequestStatus
  created_at: string
  author?: Profile
}

export interface HelpOffer {
  id: string
  request_id: string
  helper_id: string
  created_at: string
  helper?: Profile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  request_id: string
  requester_id: string
  helper_id: string
  created_at: string
  request?: { title: string }
  requester?: Pick<Profile, 'id' | 'name' | 'filiere'>
  helper?: Pick<Profile, 'id' | 'name' | 'filiere'>
  last_message?: Message | null
  unread_count: number
}
