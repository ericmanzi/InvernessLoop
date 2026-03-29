// ─── Core domain types for Separate Companions ───────────────────────────────

// Attachment style classification derived from quiz score
export type AttachmentStyle =
  | 'secure-avoidant'   // 0–39: comfortable with both closeness and space
  | 'lightly-avoidant'  // 40–64: values independence, can connect warmly
  | 'strongly-avoidant' // 65–100: needs significant personal space, independent by default

// How often someone prefers texting
export type TextingFrequency =
  | 'once-a-day'
  | 'few-times-a-week'
  | 'when-inspired'

// Expected turnaround time for messages
export type ResponseTimeExpectation =
  | 'within-hours'
  | 'within-a-day'
  | 'within-a-few-days'

// How often to see a partner in person
export type InPersonFrequency =
  | 'daily'
  | 'few-times-a-week'
  | 'weekends'
  | 'few-times-a-month'

// How much solo time someone needs in a relationship
export type PersonalSpaceNeed =
  | 'lots-needed'
  | 'some-needed'
  | 'flexible'

// Space preferences — the core compatibility unit of the app
export interface SpacePreferences {
  textingFrequency: TextingFrequency
  responseTimeExpectation: ResponseTimeExpectation
  inPersonFrequency: InPersonFrequency
  personalSpaceNeed: PersonalSpaceNeed
}

// A DND time window for Quiet Mode
export interface QuietWindow {
  id: string
  label: string          // e.g. "Weekday evenings"
  startHour: number      // 0–23
  startMinute: number
  endHour: number
  endMinute: number
  daysOfWeek: number[]   // 0 = Sunday … 6 = Saturday
  enabled: boolean
}

// A user profile
export interface UserProfile {
  id: string
  name: string
  age: number
  bio: string
  photoUri?: string      // placeholder or real URI
  attachmentStyle: AttachmentStyle
  attachmentScore: number          // raw quiz score 0–100
  spacePreferences: SpacePreferences
  quietWindows: QuietWindow[]
  isCurrentlyInQuietMode: boolean  // computed at runtime
}

// A swipe action
export type SwipeDirection = 'like' | 'pass'

// A match between the current user and another profile
export interface Match {
  id: string
  profile: UserProfile
  matchedAt: string     // ISO date string
  breathingRoomScore: number  // 0–100 compatibility
  lastMessage?: ChatMessage
  hasUnread: boolean
}

// A single chat message
export interface ChatMessage {
  id: string
  matchId: string
  senderId: string     // userId or profileId
  text: string
  sentAt: string       // ISO date string
  status: 'sent' | 'delivered'  // no read receipts
  isSlowLane: boolean  // was sent in slow lane mode
}

// A conversation thread
export interface Conversation {
  matchId: string
  messages: ChatMessage[]
  slowLaneEnabled: boolean
}

// A "We Time" scheduled slot
export type WeTimeActivityType =
  | 'coffee'
  | 'walk'
  | 'dinner'
  | 'movie'
  | 'call'
  | 'other'

export interface WeTimeSlot {
  id: string
  matchId: string
  proposedBy: string    // userId
  activityType: WeTimeActivityType
  activityLabel: string
  scheduledFor: string  // ISO date string
  durationMinutes: number
  note?: string
  status: 'pending' | 'confirmed' | 'declined'
}

// Quiz answer option
export interface QuizOption {
  value: number    // contribution to avoidant score
  label: string
}

// A single quiz question
export interface QuizQuestion {
  id: number
  question: string
  options: QuizOption[]
}

// Result of taking the quiz
export interface QuizResult {
  score: number
  attachmentStyle: AttachmentStyle
  description: string
}
