export interface PostCreateRespones {
  content: string
  createdAt: string
  downvotes: number
  id: string
  nextScoreUpdate: null
  score: null
  topics: string[]
  upvotes: number
  userId: string
}

export interface UserResponse {
  expiresAt: string
  id: string
  token: string
  username: string
}
